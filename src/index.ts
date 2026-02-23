import * as z from "zod";
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { contentModel, linkModel, TagModel, userModel } from "./db";
import { userType } from "./types";
import Jwt from "jsonwebtoken";
import { AuthMiddleware } from "./middleware";
import crypto from "crypto";

const app = express();
const cors = require("cors");
const port = 5000;
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();
const { databaseURL, userJWTpass } = process.env;


const databaseConnection = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseURL).then(resolve).catch(reject);
  });
};
databaseConnection()
  .then((e) => {
    console.log("dataBase is Connected");
  })
  .catch((e) => {
    console.log(`an error occured ${e}`);
  });


app.use(cors());
app.use(express.json());

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  try {
    //zod type checking
    const safetyCheck = z.object({
      email: z.email(),
      userName: z.string().min(3).max(17),
      password: z
        .string()
        .min(6)
        .max(12)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,12}$/),
    });

    const safeObject = await safetyCheck.safeParse(req.body);

    if (!safeObject.success) {
      return res
        .json({
          message: "Wrong Credentials",
          error: safeObject.error,
        })
        .status(403);
    }

    const { email, userName, password } = safeObject.data;

    const bcryptPass = await bcrypt.hash(password, 10);

    await userModel.create({
      email: email,
      userName: userName,
      password: bcryptPass,
    });

    res.status(200).json({
      message: "Signup Completed",
    });
  } catch (error: any) {
    res.status(403).json({
      error: error.message,
    });
  }
});

app.post("/api/v1/login", async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    const user: userType | null = await userModel.findOne({
      userName: userName,
      email: email,
    });
    if (!user) {
      res.status(404).json("user not Found");
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json("Wrong Credentials");
      return;
    }

    if (!userJWTpass) {
      res
        .status(500)
        .json({ error: "JWT secret is not defined in environment variables." });
      return;
    }
    const token = Jwt.sign(
      {
        userName: user.userName,
        id: user._id,
      },
      userJWTpass,
    );
    res.status(200).json({
      token: token,
      message: "Signup Successful",
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/v1/content", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.userID;

    const { link, type, title, tags } = req.body;

    if (!link || !type || !title) {
      return res.status(400).json({
        message: "link, type and title are required",
      });
    }

    let tagIds: any[] = [];

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {

        // Check if tag exists
        let existingTag = await TagModel.findOne({ title: tagName });

        if (!existingTag) {
          existingTag = await TagModel.create({ title: tagName });
        }

        tagIds.push(existingTag._id);
      }
    }

    const newContent = await contentModel.create({
      link,
      type,
      title,
      tags: tagIds,
      userId,
    });

    return res.status(200).json({
      message: "Content Added Successfully",
      content: newContent,
    });

  } catch (error: any) {
    return res.status(400).json({
      message: "Error adding content",
      error: error.message,
    });
  }
});

app.get("/api/v1/content", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.userID;

    const contents = await contentModel
      .find({ userId })
      .populate({ path: "tags", select: "title -_id" });

    const formatted = contents.map((c: any) => ({
      id: c._id,
      link: c.link,
      type: c.type,
      title: c.title,
      tags: c.tags.map((t: any) => t.title),
    }));

    return res.status(200).json({
      contents: formatted,
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Server error while fetching content",
      error: error.message,
    });
  }
});

app.delete("/api/v1/content", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    const contentId = req.body.id;

    //@ts-ignore
    const userID = req.userID;

    const deleted = await contentModel.deleteOne({
      _id: contentId,
      userId: userID,
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        message: "Content not found or not authorized",
      });
    }

    return res.status(200).json({
      message: "Content Deleted Successfully",
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Error deleting content",
      error: error.message,
    });
  }
});

app.post("/api/v1/brain/share", AuthMiddleware, async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const userId = req.userID;
    const { share } = req.body;

    if (typeof share !== "boolean") {
      return res.status(400).json({
        message: "share must be boolean",
      });
    }
    
    if (!share) {
      await linkModel.findOneAndUpdate(
        { userId },
        { isActive: false }
      );

      return res.status(200).json({
        link: null,
      });
    }
    let existingLink = await linkModel.findOne({ userId });

    if (existingLink) {
      existingLink.isActive = true;
      await existingLink.save();

      return res.status(200).json({
        link: `/api/v1/brain/${existingLink.link}`,
      });
    }
    
    const shareToken = crypto.randomBytes(20).toString("hex");

    const newLink = await linkModel.create({
      link: shareToken,
      userId,
      isActive: true,
    });

    return res.status(200).json({
      link: `/api/v1/brain/${newLink.link}`,
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Error while creating share link",
      error: error.message,
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
  try {
    const shareToken = req.params.shareLink;

    // find link first
    const linkDoc = await linkModel.findOne({
      link: shareToken,
      isActive: true,
    });

    if (!linkDoc) {
      return res.status(404).json({
        message: "Invalid or inactive share link",
      });
    }

    const user = await userModel.findById(linkDoc.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const contents = await contentModel
      .find({ userId: user._id })
      .populate({ path: "tags", select: "title" });

    const formattedContent = contents.map((c: any) => ({
      id: c._id,
      type: c.type,
      link: c.link,
      title: c.title,
      tags: c.tags?.map((t: any) => t.title) || [],
    }));

    return res.status(200).json({
      username: user.userName,
      content: formattedContent,
    });

  } catch (error: any) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

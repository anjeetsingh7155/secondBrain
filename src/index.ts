import * as z from "zod";
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { userModel } from "./db";
const app = express();
const cors = require("cors");
const port = 5000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const dbUrl = process.env.databaseURL;

//this for connecting Database
const databaseConnection = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(dbUrl).then(resolve).catch(reject);
  });
};
databaseConnection()
  .then((e) => {
    console.log("dataBase is Connected");
  })
  .catch((e) => {
    console.log(`an error occured ${e}`);
  });

//some inportant middlewares
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

    userModel.create({
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

app.post("/api/v1/signup", (req: Request, res: Response) => {});

app.post("/api/v1/content", (req: Request, res: Response) => {});

app.get("/api/v1/content", (req: Request, res: Response) => {});

app.delete("/api/v1/content", (req: Request, res: Response) => {});

app.post("/api/v1/brain/share", (req: Request, res: Response) => {});

app.post("/api/v1/brain/:shareLink", (req: Request, res: Response) => {});

//this is to start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

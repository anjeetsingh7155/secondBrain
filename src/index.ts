import * as z from "zod";
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { userModel } from "./db";
import {userType} from "./types"
import  Jwt from "jsonwebtoken";
import {AuthMiddleware} from "./middleware"

const app = express();
const cors = require("cors");
const port = 5000;
const mongoose = require("mongoose");
//env imports
const dotenv = require("dotenv");
dotenv.config();
const {databaseURL ,userJWTpass}  = process.env;


//this for connecting Database
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

app.post("/api/v1/login", async (req: Request, res: Response) => {
  try {
     const {userName ,email,password} = req.body

 const user : userType | null  = await userModel.findOne({
      userName : userName ,
      email : email
  })
  if(!user){
    res.status(404).json("user not Found");
    return;
  }

  const passwordMatch = await bcrypt.compare(password ,user.password)

   if(!passwordMatch){
    res.status(401).json("Wrong Credentials");
    return;
  }

  if (!userJWTpass) {
    res.status(500).json({ error: "JWT secret is not defined in environment variables." });
    return;
  }
  const token = Jwt.sign(
    {
      userName: user.userName,
      id: user.id,
    },
    userJWTpass
  );
  res.status(200).json({
    token : token,
    message : "Signup Successful"
  })
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
 
});

app.use(AuthMiddleware);

app.post("/api/v1/content", (req: Request, res: Response) => {
  const id = (req as any ).userID
  const {link,type,title} = req.body
  
});

app.get("/api/v1/content", (req: Request, res: Response) => {});

app.delete("/api/v1/content", (req: Request, res: Response) => {});

app.post("/api/v1/brain/share", (req: Request, res: Response) => {});

app.post("/api/v1/brain/:shareLink", (req: Request, res: Response) => {});

//this is to start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

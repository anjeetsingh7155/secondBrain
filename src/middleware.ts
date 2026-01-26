import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const userJWTpass : string | undefined = process.env.userJWTpass;

export const AuthMiddleware = (req : Request,res : Response ,next : NextFunction)=>{
const token = req.headers.authorization;
try {
    if (!token || !userJWTpass) {
        res.status(403).json({ message: "Invalid or expired token" });
        return;
    }
     const decoded_Data = jwt.verify(token, userJWTpass) as any;
        (req as any).userID = decoded_Data.id;
(req as any).userName = decoded_Data.userName;
    next();
    } catch (e : any ) {
        console.error("JWT Verification Error:", e.message); 
        res.status(403).json({ message: "Invalid or expired token" });
    }
}

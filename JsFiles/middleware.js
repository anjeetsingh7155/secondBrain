"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userJWTpass = process.env.userJWTpass;
const AuthMiddleware = (req, res, next) => {
    const token = req.headers["authorization"];
    console.log(token);
    try {
        if (!token || !userJWTpass) {
            res.status(403).json({ message: "Invalid or expired token" });
            return;
        }
        const decoded_Data = jsonwebtoken_1.default.verify(token, userJWTpass);
        // @ts-ignore
        req.userID = decoded_Data.id;
        // @ts-ignore
        req.userName = decoded_Data.userName;
        next();
    }
    catch (e) {
        console.error("JWT Verification Error:", e.message);
        res.status(403).json({ message: "Invalid or expired token" });
    }
};
exports.AuthMiddleware = AuthMiddleware;

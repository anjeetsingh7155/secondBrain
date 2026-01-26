"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const z = __importStar(require("zod"));
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_js_1 = require("./db.js");
const app = (0, express_1.default)();
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
app.use(express_1.default.json());
app.post("/api/v1/signup", async (req, res) => {
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
        const bcryptPass = await bcrypt_1.default.hash(password, 10);
        db_js_1.userModel.create({
            email: email,
            userName: userName,
            password: bcryptPass,
        });
        res.status(200).json({
            message: "Signup Completed",
        });
    }
    catch (error) {
        res.status(403).json({
            error: error.message,
        });
    }
});
app.post("/api/v1/signup", (req, res) => { });
app.post("/api/v1/content", (req, res) => { });
app.get("/api/v1/content", (req, res) => { });
app.delete("/api/v1/content", (req, res) => { });
app.post("/api/v1/brain/share", (req, res) => { });
app.post("/api/v1/brain/:shareLink", (req, res) => { });
//this is to start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

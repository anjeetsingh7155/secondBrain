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
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("./middleware");
const crypto_1 = __importDefault(require("crypto"));
const app = (0, express_1.default)();
const cors = require("cors");
const port = 5000;
const mongoose = require("mongoose");
//env imports
const dotenv = require("dotenv");
dotenv.config();
const { databaseURL, userJWTpass } = process.env;
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
        await db_1.userModel.create({
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
app.post("/api/v1/login", async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        const user = await db_1.userModel.findOne({
            userName: userName,
            email: email,
        });
        if (!user) {
            res.status(404).json("user not Found");
            return;
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
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
        const token = jsonwebtoken_1.default.sign({
            userName: user.userName,
            id: user._id,
        }, userJWTpass);
        res.status(200).json({
            token: token,
            message: "Signup Successful",
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post("/api/v1/content", middleware_1.AuthMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const id = req.userID;
        const { link, type, title } = req.body;
        await db_1.contentModel.create({
            link: link,
            type: type,
            title: title,
            tags: [],
            userId: id,
        });
        return res.status(200).json("content Added Successfully");
    }
    catch (error) {
        res.status(400).json({
            message: "Invalid Syntax of Input",
            error: error.message,
        });
    }
});
app.get("/api/v1/content", middleware_1.AuthMiddleware, async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.userID;
        const contents = await db_1.contentModel.find({ userId: userId }).populate({ path: "userId", select: "userName" });
        res.status(200).json({
            contents: contents,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while fetching content",
            error: error.message,
        });
    }
});
app.delete("/api/v1/content", middleware_1.AuthMiddleware, async (req, res) => {
    try {
        const contentId = req.body.id;
        //@ts-ignore
        const userID = req.userID;
        await db_1.contentModel.deleteOne({
            _id: contentId,
            userId: userID
        });
        res.status(200).json("Content Deleted Successfully");
    }
    catch (error) {
        res.status(404).json({
            message: "Content Not deleted ",
            error: error.message
        });
    }
});
app.post("/api/v1/brain/share", middleware_1.AuthMiddleware, async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userID;
        const { share } = req.body;
        if (typeof share !== "boolean") {
            return res.status(400).json({
                message: "share must be boolean true/false",
            });
        }
        const user = await db_1.userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // disable sharing
        if (share === false) {
            user.isShared = false;
            user.shareLink = undefined;
            await user.save();
            return res.status(200).json({
                link: null,
            });
        }
        // enable sharing
        if (!user.shareLink) {
            user.shareLink = crypto_1.default.randomBytes(16).toString("hex");
        }
        user.isShared = true;
        await user.save();
        // return full link (as asked)
        return res.status(200).json({
            link: `/api/v1/brain/${user.shareLink}`,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error while creating share link",
            error: error.message,
        });
    }
});
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    try {
        const shareLink = req.params.shareLink;
        const user = await db_1.userModel.findOne({
            shareLink,
            isShared: true,
        });
        //404 if invalid or disabled
        if (!user) {
            return res.status(404).json({
                message: "Invalid share link or sharing disabled",
            });
        }
        const contents = await db_1.contentModel.find({ userId: user._id }).populate({ path: "tags", select: "title" });
        //format as required in prompt
        const formattedContent = contents.map((c) => ({
            id: c._id,
            type: c.type,
            link: c.link,
            title: c.title,
            tags: c.tags?.map((t) => t.title) || [],
        }));
        return res.status(200).json({
            username: user.userName,
            content: formattedContent,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});
//this is to start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

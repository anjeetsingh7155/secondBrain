import mongoose , {Schema , Model, Types, model} from "mongoose";
import { contentTypes } from "./types";

const objectId = Types.ObjectId

const userSchema = new  Schema({
id : objectId ,
email : {type : String , unique : true , required : true },
userName : {type : String , unique : true ,required : true},
password :{type : String , unique : true , required : true},

    isShared: { type: Boolean, default: false },
    shareLink: { type: String, unique: true, sparse: true },
})


const contentSchema = new Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: 'Tag' }],
  userId: { type: Types.ObjectId, ref: 'users', required: true },
});

const tagSchema = new Schema({
  title: { type: String, required: true, unique: true }
});

//exported models
export const userModel = mongoose.model("users" , userSchema)
export const contentModel  = mongoose.model("contents" , contentSchema)
export const TagModel = mongoose.model("Tag" , tagSchema)
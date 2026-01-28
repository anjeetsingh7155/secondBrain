import mongoose , {Schema , Model, Types, model} from "mongoose";
import { contentTypes } from "./types";

const objectId = Types.ObjectId

const userSchema = new  Schema({
id : objectId ,
email : {type : String , unique : true},
userName : {type : String , unique : true},
password :{type : String , unique : true}
})


const contentSchema = new Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: 'Tag' }],
  userId: { type: Types.ObjectId, ref: 'User', required: true },
});


//exported models
export const userModel = mongoose.model("Users" , userSchema)
export const contentModel  = mongoose.model("Contents" , contentSchema)
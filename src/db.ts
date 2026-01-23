import mongoose , {Schema , Model} from "mongoose";
import { email } from "zod";
const objectId = mongoose.Types.ObjectId

const userSchema = new  Schema({
id : objectId ,
email : {type : String , unique : true},
userName : {type : String , unique : true},
password :{type : String , unique : true}
})

export const userModel =  mongoose.model("Users" , userSchema)
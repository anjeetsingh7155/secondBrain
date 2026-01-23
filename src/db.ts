import mongoose , {Schema , Model} from "mongoose";
const objectId = mongoose.Types.ObjectId

const userModel = new  Model({
id : objectId ,
userName : {type : String , unique : true},
password :{type : String , unique : true}
})

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    location:{
        type:String,
        
    },
    bio:{
        type:String
    },
    items:{
        type:mongoose.Schema.ObjectId,
        ref:'Items',

    },
    role:{
        type:String,
        default:"normal"
    }


},
{
    timestamps: true
}
)
module.exports = mongoose.model(
    "User", UserSchema
)

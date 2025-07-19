
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
        type:String,
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
    role:{
        type:String,
        default:"normal"
    },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item" 
      }
    ],

},
{
    timestamps: true
}
)
module.exports = mongoose.model(
    "User", UserSchema
)

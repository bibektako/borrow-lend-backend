
const mongoose = require("mongoose");
const crypto = require('crypto');


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
resetPasswordToken: String,
  resetPasswordExpire: Date,

},
{
    timestamps: true
}
);
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (e.g., 10 minutes from now)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken; // Return the UN-HASHED token to be sent via email
};


module.exports = mongoose.model(
    "User", UserSchema
)

const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema(
    {
        itemName:{
            type:String,
            require:true
        },
        description:{
            type:String,
            require:true
        },
        category:{
            type: mongoose.Schema.ObjectId,
            ref:"Category",
            require:true
        },
        owner:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            require:true
        },
        image:{
            type:String,

        },
        rating:{
            type:Number
        }
    }
)

module.exports = mongoose.model(
    "Item", itemSchema
)
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
    {
       user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        item_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        rating:{
            type: Number,
            required: true
        },
        comment:{
            required: true,
            type:String
        }
    }
)
module.exports = mongoose.model(
    "Review", reviewSchema
)
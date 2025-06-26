const Review = require("../../models/Review");

exports.createReview = async (req, res) =>{
    const {rating, comment, user_id, item_id} = req.body;
    try{
        const review = new Review({
            rating,
            comment,
            user_id,
            item_id
        });
        await review.save();
        return res.status(200).json({
            success: true,
            message: "Review saved",
            data: review
        });
    }catch(e){
        return res.status(500).json({
            success: false,
            message:e.message,
        });
    }
}
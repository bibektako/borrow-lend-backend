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
            message:`server error ${e.message}`,
        });
    }
}

exports.getallReviews = async (req, res) =>{
    try{
        const review = await Review.find()
        .populate("User", "user_id")
        .populate("Items", "item_id ");

        return res.status(200).json({
            success: true,
            message: "Data fetched",
            data: review,
        });

    } catch (err){
        return res.status(500).json({
            success: false,
            message:`server error ${err.message}`
        });
    }
}
exports.getReviewById = async (req, res)=>{
    try{
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message:"Review not found"});
        return res.json({ success: true, data: review , message: "one review"});

    }catch(err){
        return res.status(500).json({success: false,message: "Server error"})
    }
}


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

exports.getallReviews = async (req, res) => {
  try {
    const filter = {};

   
    if (req.query.item_id) {
      filter.item_id = req.query.item_id;
    }

    
    const reviews = await Review.find(filter)
      .populate("user_id", "username") 
      .sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: reviews,
    });

  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({
      success: false,
      message: `Server error: ${err.message}`
    });
  }
};
exports.getReviewById = async (req, res)=>{
    try{
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message:"Review not found"});
        return res.json({ success: true, data: review , message: "one review"});

    }catch(err){
        return res.status(500).json({success: false,message: "Server error"})
    }
}

exports.updateOneReview = async (req, res) =>{
    const {rating, comment} = req.body
    const _id = req.params.id
    try {
        const review = await Review.updateOne(
            {
                "_id":_id
            },
            {
                $set: {
                    "rating": rating,
                    "comment": comment
                }
            }
        )
        return res.status(200).json(
            {
                "Success": true, 
                "message": "Review updated"
            }
        )
    } catch (error) {
        return res.status(500).json({
            "success":false,
            "message":"Server error"
        })
    }

}

exports.deleteOneReview = async(req, res) =>{
    try{
        const _id = req.params.id
        const review = await Review.deleteOne(
            {
                "_id":_id
            }
        )
        return res.status(200).json({
            success: true,
            message: "Review deleted"
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}
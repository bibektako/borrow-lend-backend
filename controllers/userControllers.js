const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { username, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or phone number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    // const token = jwt.sign(
    //   { id: newUser._id, username: newUser.username },
    //   process.env.JWT_SECRET || "your_jwt_secret_key",
    //   { expiresIn: "1h" }
    // );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const getUser = await User.findOne({
      email: email,
    });
    if (!getUser) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    const passwordCheck = await bcrypt.compare(password, getUser.password);
    if (!passwordCheck) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const payLoad = {
      _id: getUser._id,
      email: getUser.email,
      username: getUser.username,
    };
    const token = jwt.sign(payLoad, process.env.SECRET, { expiresIn: "7d" });

    // console.log(token);

    return res.status(200).json({
      success: true,
      message: "login success",
      data: getUser,
      token: token,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
exports.getUser = async (req, res) =>{
    res.status(200).json({
        success: true,
        data: req.user,
    });
}
exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user.id; // From your authMiddleware
    const { itemId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { bookmarks: itemId } },
      { new: true } // This option returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Item bookmarked successfully",
      data: updatedUser.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { bookmarks: itemId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
      data: updatedUser.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate('bookmarks');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

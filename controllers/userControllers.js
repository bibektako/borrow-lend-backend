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

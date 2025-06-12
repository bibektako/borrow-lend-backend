require('dotenv').config()
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")

const app = express();
connectDB();

app.use(express.json())
app.use("/api/auth", userRoutes)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server started ");
});

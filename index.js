require('dotenv').config()
const express = require("express");
const cors = require('cors');
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes")

const app = express();
connectDB();

app.use(cors({
  origin: 'http://localhost:5173',  // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // if you use cookies or auth headers
}));

app.use(express.json())
app.use("/api/auth", userRoutes)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server started ");
});

require('dotenv').config()
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/admin/categoryRoutes");
const itemRouters = require("./routes/admin/itemsRoutes")

const app = express();
connectDB();

app.use(express.json())
app.use("/api/auth", userRoutes)
app.use("/api/admin", categoryRoutes)
app.use("/api/admin/", itemRouters)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server started ");
});

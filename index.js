// require("dotenv").config();
// const express = require("express");
// const connectDB = require("./config/db");
// const path = require("path");
// const userRoutes = require("./routes/userRoutes");
// const categoryRoutes = require("./routes/admin/categoryRoutes");
// const itemsRoutes = require("./routes/itemsRoutes");

// const app = express();
// connectDB();

// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));



// app.use("/api/auth", userRoutes);
// app.use("/api/admin/category", categoryRoutes);
// app.use("/api/items", itemsRoutes);



// const PORT = process.env.PORT;
// app.use((req, res, next) => {
//   console.log(`404 for ${req.method} ${req.originalUrl}`);
//   res.status(404).send("Route not found");
// });
// app.listen(PORT, () => {
//   console.log("Server started ");
//    console.log(`* SERVER IS LIVE AND LISTENING ON PORT: ${PORT}  *`);
// });


require("dotenv").config(); 
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require("./config/db"); 
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/admin/categoryRoutes");
const itemsRoutes = require("./routes/itemsRoutes");
const reviewRoutes = require("./routes/reviewRoutes")
const app = express();


connectDB(); 
app.use(cors());
app.use(express.json());
app.use('/uploads',express.static(path.join(__dirname, "public/uploads")));

app.get('/', (req, res) => {
  res.send('<h1>Success! The basic server is working.</h1>');
});
app.use("/api/auth", userRoutes);
app.use("/api/admin/category", categoryRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/items/review", reviewRoutes);



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const http = require('http');
const { Server } = require("socket.io");


const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/admin/categoryRoutes");
const itemsRoutes = require("./routes/itemsRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  // Add user to the list if they are not already there
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUserSocket = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addNewUser", (userId) => {
    if (userId) {
      addUser(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`Socket ${socket.id} disconnected.`);
  });
});


app.set('socketio', io);
app.set('getUserSocket', getUserSocket);








connectDB();
app.use(cors());
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  console.log(`[BACKEND SERVER] Request received: ${req.method} ${req.originalUrl}`);
  next(); 
});

app.get("/", (req, res) => {
  res.send("<h1>Success! The basic server is working.</h1>");
});
app.use("/api/auth", userRoutes);
app.use("/api/admin/category", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/notifications", notificationRoutes );

app.use((err, req, res, next) => {
  console.error("--- ❌ UNHANDLED ERROR CAUGHT BY GLOBAL HANDLER ---");
  console.error(err.stack); // This prints the full error and where it happened
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`server with socket id  running on port ${PORT}`);
});

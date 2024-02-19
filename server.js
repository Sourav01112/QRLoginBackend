const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const ip = require('ip');
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.routes");
const { sessionRouter } = require("./routes/session.routes");

require("dotenv").config();

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: "http://localhost:5173",
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


app.use((req, res, next) => {
  console.log("inside")
  req.io = io;
  next();
});



app.use("/api/user", userRouter);
app.use("/api/session", sessionRouter);


// module.exports = { io, app };


// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Add an event listener for the custom event
  socket.on("userLoggedIn", (data) => {
    console.log("User logged in:", data);
  });
});

// Server
server.listen(PORT, async () => {
  console.log("Mongo Atlas Connected");

  try {
    await connection;
    console.log("Server is running at port number", PORT);
  } catch (error) {
    console.log("Mongo connection error");
    console.log(error);
  }
});

console.log("App is running on IP " + ip.address());


const express = require("express");
const app = express();
const ip = require('ip')

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { connection } = require("./config/db");
const { userRouter } = require("./routes/user.routes");
const { sessionRouter } = require("./routes/session.routes");

require("dotenv").config();

const PORT = process.env.PORT || 3001



// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// No auth Middleware should be passed
app.use("/api/user", userRouter);
app.use("/api/session", sessionRouter);


// Server
app.listen(PORT, async () => {
  console.log("Mogno Atlas Connected");

  try {
    await connection;
    // console.log("Mogno Atlas Connected");
    console.log("Server is running at port number", PORT);
  } catch (error) {
    console.log("Mongo connection error");
    console.log(error);
  }
});


console.log("app is running on ip " + ip.address())

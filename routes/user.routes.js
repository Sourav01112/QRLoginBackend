const express = require("express");
const bcrypt = require("bcrypt");
const userRouter = express.Router();
require("dotenv").config();
const { UserModel } = require("../models/user.model");
const jwt = require("jsonwebtoken");
const QRCode = require('qrcode');

const { handleResponse } = require('../utils/helper')

// Register
userRouter.post("/register", async (req, res) => {
  console.log("hello", req.body)
  const { name, email, password, age, city } = req.body;


  try {
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.json({ msg: "user already exists" });
    }
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        return res.json({ err: err.message });
      } else {
        const user = UserModel({ ...req.body, password: hash });
        // const user = UserModel({ ...req.body, password: hash, roles });
        await user.save();
      }
    });
    res.status(200).json({
      msg: "The new user has been registered",
      registeredUser: req.body,
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Login
userRouter.post("/login", async (req, res) => {
  console.log("login DATRA", req.body)



  try {
    const { email, password } = req.body;
    const userExists = await UserModel.findOne({ email })


    console.log("userExists", userExists)

    if (userExists) {
      const accessToken = jwt.sign({
        userID: userExists._id
      },
        process.env.JWT_SECRET_KEY, { expiresIn: '1d' }
      )
      const userWithoutPass = { ...userExists.toObject() }
      delete userWithoutPass.password
      handleResponse(res, 200, "Login Successful", userWithoutPass, accessToken)

    } else {
      handleResponse(res, 400, "User does not exist")

    }

  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});


module.exports = { userRouter };



// QRCode.toDataURL('I am a pony!', function (err, url) {
//   console.log("url. urkl", url)
// })

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongoose").Types;

// Access JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

//--------------------------Route 1------------------------------------------------------
//Create a User using: POST "/api/createUser". :: Register API
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a email name").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //if there are errors, returns bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      // Check wheather the user with the same exists already
      let user = await User.findOne({
        email: req.body.email,
      });
      console.log("user==>", user);
      if (user) {
        return res.status(400).json({
          error: "Sorry, user with this email already exist",
        });
      }

      //Creating a secured password from req.body.password
      const salt = await bcrypt.genSalt(10);
      let securedPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securedPassword,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      console.log("jwt data console==>", authToken);
      res.status(200).json({ authToken });
    } catch (error) {
      console.log("My error==>", error);
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//--------------------------Route 2------------------------------------------------------
//Authenticate a user : post "localhost:5000/api/auth/createUser" :: Login API
router.post(
  "/loginUser",
  [
    body("email", "Enter a email name").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email: email,
      });

      if (!user) {
        return res.status(400).json({
          error: "Please try to login with correct credentials",
        });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        return res.status(400).json({
          error: "Please try to login with correct credentials",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.status(200).json({ authToken });
    } catch (error) {
      console.log("My error==>", error);
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

module.exports = router;

var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const process = require("../routes/jwt.json");
const cheakAuth = require("../middleware/cheak_auth");

router.post(
  "/signup",
  [
    body("name").isLength({ min: 5 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.findOne({ email: req.body.email })
      .exec()
      .then((user) => {
        if (user) {
          res.status(400).json({
            message: "This Email already exist",
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new User({
                _id: mongoose.Types.ObjectId(),
                name: req.body.name,
                email: req.body.email,
                password: hash,
              });
              user
                .save()
                .then((result) => {
                  console.log(result);
                  res.status(200).json({
                    message: "User Created",
                  });
                })
                .catch((error) => {
                  console.log(error);
                  res.status(500).json({
                    error: error,
                  });
                });
            }
          });
        }
      });
  }
);

router.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          message: "Auth Failed",
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(400).json({
            message: "Auth Failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              userid: user._id,
            },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          );
          return res.status(200).json({
            message: "Auth Successful",
            token: token,
          });
        }
        res.status(400).json({
          message: "Auth Failed",
        });
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

router.delete("/:userid", cheakAuth, (req, res, next) => {
  User.remove({
    _id: req.params.userid,
  })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User Deleted",
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;

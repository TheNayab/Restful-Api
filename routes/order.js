var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/products");
const cheakAuth = require("../middleware/cheak_auth");
/* GET home page. */
router.get("/", cheakAuth, (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((result) => {
      res.status(200).json({
        count: result.length,
        Orders: result,
      });
    })
    .catch();
});

router.post("/", cheakAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then((productId) => {
      // if (!productId) {
      //   return res.status(404).json({
      //     message: "Product not found",
      //   });
      // }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Order Stored",
        CreatedOrder: {
          _id: result.id,
          product: result.product,
          quantity: result.quantity,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Product not found",
        // err: error,
      });
    });
});

router.get("/:OrderId", cheakAuth, (req, res, next) => {
  Order.findById(req.params.OrderId)
    .select("product quantity _id")
    .populate("product")
    .exec()
    .then((doc) => {
      if (!doc) {
        res.status(404).json({
          message: "Order not Found",
        });
      }
      res.status(200).json({
        Order: doc,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

router.delete("/:OrderId", cheakAuth, (req, res, next) => {
  Order.remove({ _id: req.params.OrderId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Order canceled successfully",
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

module.exports = router;

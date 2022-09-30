var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
const { rawListeners } = require("../app");
const Product = require("../models/products");
const multer = require("multer");
const cheakAuth = require("../middleware/cheak_auth");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
/* GET home page. */
router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      const responce = {
        count: doc.length,
        Product: doc,
      };
      res.status(200).json(responce);
      // if (doc) {
      // } else {
      //   res.status(404).json({
      //     message: "NO VALID ENTRY FOUND FOR PROVIDED ID",
      //   });
      // }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

//  ........................................Posting Products
router.post("/", cheakAuth, upload.single("productImage"), (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created Object Successfully",

        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result.id,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

// .................................................getting by id
router.get("/:prodeuctId", (req, res, next) => {
  var Id = req.params.prodeuctId;
  Product.findById(Id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      const result = {
        Product: doc,
      };
      if (doc) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "NO VALID ENTRY FOUND FOR PROVIDED ID",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
});

router.patch("/:prodeuctId", cheakAuth, (req, res, next) => {
  const Id = req.params.prodeuctId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.nname;
    updateOps[ops.propPrice] = ops.nprice;
  }
  Product.update({ _id: Id }, { $set: updateOps })
    .exec()
    .then(() => {
      res.status(200).json({
        message: "Product Updated",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Product not found for updation",
      });
    });
});

// "........................................................Deleting the product by id"
router.delete("/:productId", cheakAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({
    _id: id,
  })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product Deleted ",
        result: result,
      });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;

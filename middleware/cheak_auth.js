const jwt = require("jsonwebtoken");
const process = require("../routes/jwt.json");
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const decode = jwt.verify(token, process.env.JWT_KEY);
    req.userData = decode;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Auth Failed",
    });
  }
};

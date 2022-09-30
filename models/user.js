const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },

  date: {
    type: Date,
    defult: Date.now,
  },
});
const User = mongoose.model("User", UserSchema);
// User.createIndexes();
module.exports = User;

const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },

  created: {
    type: Date,
    required: true,
    default: Date.now,
  },

  password: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("User", userSchema);

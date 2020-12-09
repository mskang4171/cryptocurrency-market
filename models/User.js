const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  key: String,

  active: { type: Boolean, default: true },
});

module.exports = {
  User,
};

// signup
// signin

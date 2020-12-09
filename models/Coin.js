const mongoose = require("mongoose");

// xrp, 리플이라는 코인이 있는데, xrp

const Coin = mongoose.model("Coin", {
  name: String,
  code: String,
  active: Boolean,
});

// xrp, btc, bch, eth, ech, xem..

module.exports = {
  Coin,
};

// signup
// signin

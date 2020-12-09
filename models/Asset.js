const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// xrp, 리플이라는 코인이 있는데, xrp

const Asset = mongoose.model("Asset", {
  user: { ref: "User", type: Schema.Types.ObjectId },
  coin: { ref: "Coin", type: Schema.Types.ObjectId },
  quantity: Number,
});

module.exports = {
  Asset,
};

// signup
// signin

/*

assets

유저1  = {btc: 1, eth: 3, xrp: 1000}


유저2  {btc: 2, eth: 5, xrp: 5000}



유저3 {btc: 10, eth: 30, xrp: 1000}








*/

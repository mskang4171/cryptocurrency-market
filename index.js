const express = require("express");
const mongoose = require("mongoose");
const { encryptPassword } = require("./utils");
const { body, validationResult } = require("express-validator");
const CoinGecko = require("coingecko-api");
const crypto = require("crypto");

const { User } = require("./models/User");
const { Coin } = require("./models/Coin");
const { Asset } = require("./models/Asset");

const CoinGeckoClient = new CoinGecko();

mongoose.connect(
  "mongodb+srv://coin-user:nxSaRVupcn8A4i2X@cluster0.n5mdz.mongodb.net/DB1?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express();

app.use(express.urlencoded({ extended: true }));

const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(401);
  const [bearer, key] = authorization.split(" ");
  if (bearer !== "Bearer") return res.sendStatus(401);
  const user = await User.findOne({ key });
  if (!user) return res.sendStatus(401);

  req.user = user;
  next();
};

const retrieveAssets = async (req, res, next) => {
  const assets = await Asset.find({ user: req.user });
  if (!assets) return res.sendStatus(404);
  const organizedAssets = {};
  for (const asset of assets) {
    const coin = await Coin.findById(asset.coin);
    organizedAssets[coin.code] = asset.quantity;
  }
  req.assets = organizedAssets;
  next();
};

const retrievePrice = async (req, res, next) => {
  const code = req.params.coin_name;
  const coin = await Coin.findOne({ code });
  const price = await CoinGeckoClient.simple.price({
    ids: coin.name,
  });
  req.price = price.data[coin.name].usd;
  next();
};

app.post(
  "/register",
  [
    body("name").isString().isLength({ min: 4, max: 12 }).isAlphanumeric(),
    body("email").isString().isLength({ max: 99 }).isEmail(),
    body("password").isLength({ min: 8, max: 16 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ errors: { email: "Already registered" } });
    }

    const encryptedPassword = encryptPassword(password);
    const user = new User({ email, name, password: encryptedPassword });
    await user.save();

    const coin = await Coin.findOne({ code: "usd" });
    const asset = new Asset({ user, coin, quantity: 10000 });
    await asset.save();

    return res.send({});
  }
);
// 4xx => client error

// 로그인 명령이 들어오면, valid한지 체크를 한 후에, key를 발급해준다.
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: encryptPassword(password),
  });

  if (!user) return res.sendStatus(404);

  const key = crypto.randomBytes(24).toString("hex");
  user.key = key;
  await user.save();
  res.send({ key });
});

app.get("/coins", async (req, res) => {
  const coins = await Coin.find({ active: true });
  const codes = coins.map((coin) => coin.code).filter((code) => code !== "usd");
  res.send(codes);
});

app.get("/assets", authentication, retrieveAssets, async (req, res) => {
  res.send(req.assets);
});

app.get("/coins/:coin_name", retrievePrice, async (req, res) => {
  res.send({ price: req.price });
});

app.post("coins/:code/buy", async (req, res) => {});

app.post("coins/:code/sell", async (req, res) => {});

app.listen(3000);
/*

email, password => key 

key를 request보낼 때 같이 보내서 본인임을 인증.

*/

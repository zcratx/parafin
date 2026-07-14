const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

const PARAFIN_BASE_URL = "https://api.parafin.com/v1";
const PARAFIN_DEV_BASE_URL = "https://api.dev.parafin.com/v1";

// Credentials keyed by product.
// "capital"     → PARAFIN_CLIENT_ID / PARAFIN_CLIENT_SECRET
// "payovertime" → BNPL_CLIENT_ID    / BNPL_CLIENT_SECRET
// "checkout"    → BNPL_CLIENT_ID    / BNPL_CLIENT_SECRET  (shared with Pay Over Time)
const PRODUCT_CREDENTIALS = {
  capital: {
    username: () => process.env.PARAFIN_CLIENT_ID,
    password: () => process.env.PARAFIN_CLIENT_SECRET,
  },
  payovertime: {
    username: () => process.env.BNPL_CLIENT_ID,
    password: () => process.env.BNPL_CLIENT_SECRET,
  },
  checkout: {
    username: () => process.env.BNPL_CLIENT_ID,
    password: () => process.env.BNPL_CLIENT_SECRET,
  },
};

// Single token endpoint used by all three product flows.
// :product  — one of "capital" | "payovertime" | "checkout"
// :id       — person_id
// :isDev    — "true" to hit api.dev.parafin.com, omit / "false" for api.parafin.com
app.get("/parafin/token/:product/:id/:isDev?", async (req, res) => {
  const { product, id: personId, isDev } = req.params;

  const credentials = PRODUCT_CREDENTIALS[product];
  if (!credentials) {
    return res.status(400).send({ error: `Unknown product: "${product}". Valid values: capital, payovertime, checkout.` });
  }

  const baseUrl = isDev === "true" ? PARAFIN_DEV_BASE_URL : PARAFIN_BASE_URL;
  console.log(`[${product}] token request for person: ${personId}`);

  try {
    const result = await axios.post(
      `${baseUrl}/auth/redeem_token`,
      { person_id: personId },
      { auth: { username: credentials.username(), password: credentials.password() } }
    );
    res.send({ parafinToken: result.data.bearer_token });
  } catch (error) {
    console.error(`[${product}] token error:`, error.response?.data);
    res.send({
      errorCode: error.response?.status,
      message: error.response?.data,
    });
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening on port ${process.env.PORT || 8080}`);
});

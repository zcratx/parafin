const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const PARAFIN_BASE_URL = "https://api.parafin.com/v1";

app.use(express.json());

const DEMO_PEOPLE = {
  no_offer: process.env.PARAFIN_NO_OFFER_PERSON_ID,
  preapproved: process.env.PARAFIN_PREAPPROVED_PERSON_ID,
  on_its_way: process.env.PARAFIN_ON_ITS_WAY_PERSON_ID,
  outstanding: process.env.PARAFIN_OUTSTANDING_PERSON_ID,
};

app.get("/api/demo-config", (_req, res) => {
  const credentialsConfigured = Boolean(
    process.env.PARAFIN_CLIENT_ID && process.env.PARAFIN_CLIENT_SECRET
  );

  res.send({
    credentialsConfigured,
    states: Object.fromEntries(
      Object.entries(DEMO_PEOPLE).map(([state, personId]) => [
        state,
        { configured: Boolean(personId) },
      ])
    ),
  });
});

app.post("/api/parafin/token/:state", async (req, res) => {
  const { state } = req.params;
  const personId = DEMO_PEOPLE[state];

  if (!Object.prototype.hasOwnProperty.call(DEMO_PEOPLE, state)) {
    return res.status(404).send({ error: "Unknown demo state." });
  }

  if (!personId) {
    return res.status(422).send({
      error: `Missing person ID for the ${state} demo state.`,
    });
  }

  if (!process.env.PARAFIN_CLIENT_ID || !process.env.PARAFIN_CLIENT_SECRET) {
    return res.status(503).send({
      error: "Parafin sandbox credentials are not configured on the server.",
    });
  }

  try {
    const result = await axios.post(
      `${PARAFIN_BASE_URL}/auth/redeem_token`,
      { person_id: personId },
      {
        auth: {
          username: process.env.PARAFIN_CLIENT_ID,
          password: process.env.PARAFIN_CLIENT_SECRET,
        },
        timeout: 15_000,
      }
    );

    return res.send({ parafinToken: result.data.bearer_token });
  } catch (error) {
    const status = error.response?.status || 502;
    console.error(
      `[Parafin] token redemption failed for state=${state}:`,
      error.response?.data || error.message
    );
    return res.status(status).send({
      error: "Unable to redeem the Parafin token for this demo state.",
    });
  }
});

app.get("/api/health", (_req, res) => res.send({ ok: true }));

app.listen(PORT, () => {
  console.log(`GrubDash demo API listening on port ${PORT}`);
});

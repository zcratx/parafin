# Parafin Embedded Demo

A quickstart app showing how to integrate Parafin's embedded widgets and flows into a React application. Three product flows are included:

| Product | Component | Description |
|---------|-----------|-------------|
| **Capital** | `ParafinWidget` (`product="capital"`) | Embedded capital offer widget |
| **Pay Over Time** | `ParafinWidget` (`product="line_of_credit"`) | Embedded line-of-credit / BNPL widget |
| **Order Checkout** | `openParafinDashboard` | Full-screen BNPL checkout modal triggered by an order ID |

![Parafin Widget preview](/img/elements-preview.gif)

## Prerequisites

- Access to a [Parafin dashboard](https://dashboard.parafin.com)
- [Node.js](https://nodejs.org/en/) v16+

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/buildparafin/embedded-demo.git
cd embedded-demo
npm install
```

### 2. Set up credentials

Copy `sample.env` to `.env` and fill in your sandbox API keys from [Settings → API keys](https://dashboard.parafin.com/settings/api-keys):

```bash
cp sample.env .env
```

```bash
# Capital product credentials
PARAFIN_CLIENT_ID="<your-capital-client-id>"
PARAFIN_CLIENT_SECRET="<your-capital-client-secret>"

# Pay Over Time + Order Checkout credentials
BNPL_CLIENT_ID="<your-bnpl-client-id>"
BNPL_CLIENT_SECRET="<your-bnpl-client-secret>"
```

### 3. Configure sandbox IDs

**All sandbox IDs live in one file: [`src/config.js`](src/config.js)**. Open it and replace the placeholder values with your own:

```js
const config = {
  capital: {
    personId: "person_xxx",          // person_id for the Capital widget
  },
  payOverTime: {
    personId: "person_xxx",          // person_id for the Pay Over Time widget
    lineOfCreditApplicationId: "line_of_credit_application_xxx",
  },
  checkout: {
    personId: "person_xxx",          // person_id for Order Checkout (can share with payOverTime)
    orderId: "order_xxx",            // order_id to test the checkout flow
  },
  isDev: false,                      // true → api.dev.parafin.com, false → api.parafin.com
};
```

See the sections below for how to create each required resource in the sandbox.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Product Setup

### Capital

1. Create a [Business](https://docs.parafin.com/capital/share-data/methods/api#2-create-a-business), [Person](https://docs.parafin.com/capital/share-data/methods/api#3-create-a-person), and [Bank Account](https://docs.parafin.com/capital/share-data/methods/api#4-create-a-bank-account) in the sandbox.
2. [Generate a Capital Product Offer](https://docs.parafin.com/api#tag/Sandbox/operation/Generate%20Capital%20Product%20Offer) for the business.
3. Set `config.capital.personId` in `src/config.js` to your `person_xxx` ID.
4. Set `PARAFIN_CLIENT_ID` / `PARAFIN_CLIENT_SECRET` in `.env`.

### Pay Over Time (Line of Credit)

1. Create a Business, Person, and Bank Account under your BNPL partner credentials.
2. Create a Line of Credit Application for the business.
3. Set `config.payOverTime.personId` and `config.payOverTime.lineOfCreditApplicationId` in `src/config.js`.
4. Set `BNPL_CLIENT_ID` / `BNPL_CLIENT_SECRET` in `.env`.

### Order Checkout

1. Create an order in the sandbox using your BNPL partner credentials.
2. Set `config.checkout.orderId` to the `order_xxx` ID in `src/config.js`.
3. Set `config.checkout.personId` — this can be the same as `payOverTime.personId` if using shared credentials.
4. `BNPL_CLIENT_ID` / `BNPL_CLIENT_SECRET` are reused from Pay Over Time (no extra `.env` changes needed).

---

## Project Structure

```
embedded-demo/
├── src/
│   ├── config.js          # ← Edit this to configure sandbox IDs
│   ├── App.js             # Main React component
│   └── components/
│       ├── Header.tsx
│       └── SideNav.tsx
├── server/
│   └── server.js          # Express server — token exchange proxy
├── sample.env             # Copy to .env and fill in credentials
└── package.json
```

## Architecture

The demo uses a lightweight Express proxy server (`server/server.js`) to exchange your `client_id`/`client_secret` for a short-lived Parafin bearer token — **credentials never touch the browser**. The React frontend calls `/parafin/token/:product/:personId` to fetch a token, then passes it directly to the Parafin SDK.

```
Browser → POST /parafin/token/:product/:id
            ↓
        Express (server.js)
            ↓
        POST api.parafin.com/v1/auth/redeem_token  (with client credentials)
            ↓
        bearer_token → Browser → ParafinWidget / openParafinDashboard
```

## Docs

- [Parafin Documentation](https://docs.parafin.com)
- [`@parafin/react` reference](https://docs.parafin.com/capital/present-offers/embedded/reference)

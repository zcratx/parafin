# GrubDash × Parafin Embedded Capital Demo

A take-home demo that embeds the real Parafin Capital widget in a restaurant dashboard and presents four stable Flex Loan states:

1. No offers available
2. Pre-approved offer available
3. Capital on its way
4. Offer accepted with an outstanding balance

The right-hand runbook updates with each state so the recording shows the exact sandbox API call or UI action that produced it.

## Architecture

The React client never receives the Parafin client secret. It requests a short-lived token for one of four allow-listed demo personas from the local Express server:

```text
Browser → POST /api/parafin/token/:state
              ↓
Express → POST https://api.parafin.com/v1/auth/redeem_token
              ↓
bearer_token → <ParafinWidget product="capital" />
```

## Local setup

```bash
npm install
cp sample.env .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fill `.env` with the sandbox Client ID and Client secret from the Parafin dashboard, plus four `person_xxx` IDs. Each person must be linked to the sandbox business representing that state.

## Preparing the four personas

Use separate businesses so every state remains stable while recording. All API calls use HTTP Basic authentication with `PARAFIN_CLIENT_ID:PARAFIN_CLIENT_SECRET` and target `https://api.parafin.com`.

### 1. No offer

Use a newly created business with no active offer. If an offer already exists, close it:

```bash
curl --request POST \
  --url https://api.parafin.com/v1/sandbox/capital_product_offers/<offer_id>/close \
  --user "$PARAFIN_CLIENT_ID:$PARAFIN_CLIENT_SECRET"
```

Set its person ID as `PARAFIN_NO_OFFER_PERSON_ID`.

### 2. Pre-approved Flex Loan

Generate a sandbox Flex Loan offer:

```bash
curl --request POST \
  --url https://api.parafin.com/v1/sandbox/capital_product_offers \
  --user "$PARAFIN_CLIENT_ID:$PARAFIN_CLIENT_SECRET" \
  --header 'Content-Type: application/json' \
  --data '{
    "product_type": "flex_loan",
    "is_top_up": false,
    "business_external_id": "<restaurant_external_id>",
    "max_offer_amount": 50000,
    "campaign_type": "pre_approved"
  }'
```

`max_offer_amount` must be greater than 5,000 and a multiple of 100. Set the linked person ID as `PARAFIN_PREAPPROVED_PERSON_ID`.

### 3. Capital on its way

Create another Flex Loan offer, open that persona in the embedded widget, and complete the hosted acceptance flow. Do not call the funding endpoint yet. Set the person ID as `PARAFIN_ON_ITS_WAY_PERSON_ID`.

For the full acceptance flow, Parafin recommends including a bank account with a real routing number such as `021000021` so manual bank verification succeeds in sandbox.

### 4. Outstanding balance

Create and accept an offer for the fourth business, then fund its capital product:

```bash
curl --request POST \
  --url https://api.parafin.com/v1/sandbox/fund_capital_product \
  --user "$PARAFIN_CLIENT_ID:$PARAFIN_CLIENT_SECRET" \
  --header 'Content-Type: application/json' \
  --data '{
    "business_parafin_id": "<business_id>",
    "settlement_status": "completed"
  }'
```

Set the linked person ID as `PARAFIN_OUTSTANDING_PERSON_ID`.

## Recording outline

1. Start on **No offer** and explain that the widget derives state from the authenticated person/business.
2. Move to **Pre-approved** and point to the create-offer call and `product_type: flex_loan`.
3. Move to **On its way** and explain that completing acceptance in the hosted widget produces this state.
4. Move to **Outstanding** and highlight the sandbox funding call.
5. Close by noting that the only client-side integration is `ParafinWidget`; token redemption and credentials stay server-side.

The four buttons are intentionally deterministic and recording-friendly: switching states redeems a fresh short-lived token for the corresponding person and remounts the widget.

## Relevant Parafin docs

- [Capital overview](https://docs.parafin.com/products/capital/overview)
- [Embedded offers](https://docs.parafin.com/present-offers/embedded)
- [Business states](https://docs.parafin.com/products/capital/business-experience#business-states)
- [Create sandbox Capital Product Offer](https://docs.parafin.com/api-reference/capital-product-offers/create-capital-product-offer-sandbox)
- [Fund sandbox Capital Product](https://docs.parafin.com/api-reference/sandbox/fund-capital-product)

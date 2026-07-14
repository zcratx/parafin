// =============================================================
// DEMO CONFIGURATION
// This is the only file you need to edit to run the demo.
// Replace the placeholder values with your own sandbox data.
// =============================================================

const config = {
  // -------------------------------------------------------
  // Capital
  // Credentials: PARAFIN_CLIENT_ID / PARAFIN_CLIENT_SECRET
  // -------------------------------------------------------
  capital: {
    // person_id from your Parafin sandbox
    // https://docs.parafin.com/capital/share-data/methods/api#3-create-a-person
    personId: "person_83699def-d10a-4c6e-850e-c31bad428236",
  },

  // -------------------------------------------------------
  // Pay Over Time (Line of Credit / BNPL)
  // Credentials: BNPL_CLIENT_ID / BNPL_CLIENT_SECRET
  // -------------------------------------------------------
  payOverTime: {
    // person_id associated with the line of credit application
    personId: "person_9b26a95c-2e52-4d5f-8e0d-7e8500e68771",
    // line_of_credit_application_id for the embedded widget
    lineOfCreditApplicationId:
      "line_of_credit_application_431b8403-78d6-44c4-b1aa-5c859b79e365",
  },

  // -------------------------------------------------------
  // Order Checkout
  // Credentials: BNPL_CLIENT_ID / BNPL_CLIENT_SECRET (shared with Pay Over Time)
  // -------------------------------------------------------
  checkout: {
    // person_id — can be the same as payOverTime.personId if using shared credentials
    personId: "person_8b6d4a1a-5dc4-439b-85f2-2617dab9f8d6",
    // order_id to pre-fill in the checkout flow  e.g. "order_xxxx"
    orderId: "order_53a20118-667a-4198-b9c2-6d41074ff7b6",
  },

  // -------------------------------------------------------
  // Environment
  // -------------------------------------------------------
  // true  → api.dev.parafin.com  (Parafin internal dev)
  // false → api.parafin.com      (sandbox / production)
  isDev: false,
};

export default config;

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ParafinWidget } from "@parafin/react";

// @parafin/react reinitializes its iframe whenever its props object changes.
// Memoizing this boundary keeps unrelated parent renders (such as event-log
// updates) from resetting an already-loaded widget.
const StableParafinWidget = memo(ParafinWidget);

const STATES = [
  {
    id: "no_offer",
    eyebrow: "State 01",
    label: "No offers available",
    shortLabel: "No offer",
    description:
      "A restaurant without an active capital product offer sees the widget's empty state.",
    action: "Use a new sandbox business, or close its active offer.",
    method: "POST",
    endpoint: "/v1/sandbox/capital_product_offers/{offer_id}/close",
    payload: null,
  },
  {
    id: "preapproved",
    eyebrow: "State 02",
    label: "Pre-approved offer available",
    shortLabel: "Pre-approved",
    description:
      "An eligible restaurant can review a personalized Flex Loan offer and start acceptance.",
    action: "Generate a pre-approved Flex Loan offer for the sandbox business.",
    method: "POST",
    endpoint: "/v1/sandbox/capital_product_offers",
    payload: {
      product_type: "flex_loan",
      is_top_up: false,
      business_external_id: "<restaurant_external_id>",
      max_offer_amount: 50000,
      campaign_type: "pre_approved",
    },
  },
  {
    id: "on_its_way",
    eyebrow: "State 03",
    label: "Capital on its way",
    shortLabel: "On its way",
    description:
      "The restaurant has accepted its offer and Parafin is preparing the disbursement.",
    action:
      "Complete the offer acceptance flow in the widget; do not fund the product yet.",
    method: "UI",
    endpoint: "ParafinWidget → review → verify → accept",
    payload: null,
  },
  {
    id: "outstanding",
    eyebrow: "State 04",
    label: "Offer accepted, outstanding balance",
    shortLabel: "Outstanding",
    description:
      "Funding is complete and the restaurant can track its balance and repayments.",
    action: "Fund the accepted capital product in sandbox.",
    method: "POST",
    endpoint: "/v1/sandbox/fund_capital_product",
    payload: {
      business_parafin_id: "<business_id>",
      settlement_status: "completed",
    },
  },
];

function JsonBlock({ value }) {
  if (!value) return null;
  return <pre className="payload">{JSON.stringify(value, null, 2)}</pre>;
}

function App() {
  const [activeState, setActiveState] = useState(STATES[0].id);
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);

  const selected = useMemo(
    () => STATES.find((state) => state.id === activeState),
    [activeState]
  );

  const handleWidgetEvent = useCallback((eventType) => {
    setEvents((current) => [eventType, ...current].slice(0, 4));
  }, []);

  const handleWidgetExit = useCallback(() => {
    setEvents((current) => ["exit", ...current].slice(0, 4));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await axios.get("/api/demo-config");
        if (!cancelled) setConfig(response.data);
      } catch (_error) {
        if (!cancelled) setError("The local demo API is not running.");
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadToken() {
      if (!config) return;
      setLoading(true);
      setToken(null);
      setError("");
      setEvents([]);

      if (!config.credentialsConfigured || !config.states?.[activeState]?.configured) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(`/api/parafin/token/${activeState}`);
        if (!cancelled) setToken(response.data.parafinToken);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.response?.data?.error ||
              "Unable to load this Parafin widget state."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadToken();
    return () => {
      cancelled = true;
    };
  }, [activeState, config]);

  const stateConfigured = Boolean(config?.states?.[activeState]?.configured);
  const ready = Boolean(config?.credentialsConfigured && stateConfigured);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="GrubDash home">
          <span className="brand-mark">G</span>
          <span>GrubDash</span>
        </div>
        <div className="restaurant-switcher">
          <span className="restaurant-avatar">ST</span>
          <span>
            <strong>Nandish Kamat Venture</strong>
            <small>Eccentric dashboard</small>
          </span>
          <span className="chevron">⌄</span>
        </div>
      </header>

      <div className="page-grid">
        <aside className="sidebar">
          <p className="sidebar-label">Restaurant</p>
          <nav className="primary-nav" aria-label="Restaurant navigation">
            <span>Overview</span>
            <span>Orders</span>
            <span>Payouts</span>
            <span className="active-nav">Capital</span>
            <span>Settings</span>
          </nav>

          <div className="demo-divider" />
          <p className="sidebar-label">Demo states</p>
          <div className="state-nav" role="list">
            {STATES.map((state, index) => (
              <button
                key={state.id}
                className={state.id === activeState ? "state-button active" : "state-button"}
                onClick={() => setActiveState(state.id)}
                data-state={state.id}
                role="listitem"
              >
                <span className="state-number">{index + 1}</span>
                <span>{state.shortLabel}</span>
                <span
                  className={config?.states?.[state.id]?.configured ? "config-dot ready" : "config-dot"}
                  title={config?.states?.[state.id]?.configured ? "Configured" : "Needs a person ID"}
                />
              </button>
            ))}
          </div>
        </aside>

        <main className="main-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow-row">
                <span className="sandbox-pill">Sandbox demo</span>
                <span>{selected.eyebrow} of 04</span>
              </div>
              <h1>Business capital</h1>
              <p>Flexible financing built into the GrubDash restaurant experience.</p>
            </div>
            <div className="powered-by">Powered by <strong>Parafin</strong></div>
          </section>

          <div className="content-grid">
            <section className="widget-card" aria-label="Embedded Parafin Capital widget">
              <div className="widget-card-header">
                <div>
                  <span className="state-kicker">{selected.eyebrow}</span>
                  <h2>{selected.label}</h2>
                </div>
                <span className="live-badge"><i /> Live component</span>
              </div>

              <div className="widget-frame" data-testid="widget-frame">
                {loading && (
                  <div className="loading-state">
                    <span className="spinner" />
                    <p>Loading the embedded capital experience…</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="setup-state error-state">
                    <span className="setup-icon">!</span>
                    <h3>Unable to load this state</h3>
                    <p>{error}</p>
                  </div>
                )}

                {!loading && !error && !ready && (
                  <div className="setup-state">
                    <span className="setup-icon">↗</span>
                    <h3>Connect this sandbox persona</h3>
                    <p>
                      Add the credentials and person ID for <strong>{selected.shortLabel}</strong> to
                      the server environment, then restart the app.
                    </p>
                    <code>
                      {activeState === "no_offer" && "PARAFIN_NO_OFFER_PERSON_ID=person_xxx"}
                      {activeState === "preapproved" && "PARAFIN_PREAPPROVED_PERSON_ID=person_xxx"}
                      {activeState === "on_its_way" && "PARAFIN_ON_ITS_WAY_PERSON_ID=person_xxx"}
                      {activeState === "outstanding" && "PARAFIN_OUTSTANDING_PERSON_ID=person_xxx"}
                    </code>
                  </div>
                )}

                {!loading && !error && token && (
                  <StableParafinWidget
                    key={activeState}
                    token={token}
                    product="capital"
                    onEvent={handleWidgetEvent}
                    onExit={handleWidgetExit}
                  />
                )}
              </div>
            </section>

            <aside className="runbook-card" aria-label="State trigger instructions">
              <div className="runbook-heading">
                <span className="runbook-icon">⌁</span>
                <div>
                  <span className="state-kicker">How to trigger</span>
                  <h2>{selected.shortLabel}</h2>
                </div>
              </div>
              <p className="runbook-description">{selected.action}</p>
              <div className="code-card">
                <div className="code-title">
                  <span className={`method method-${selected.method.toLowerCase()}`}>
                    {selected.method}
                  </span>
                  <span>Sandbox</span>
                </div>
                <code className="endpoint">{selected.endpoint}</code>
                <JsonBlock value={selected.payload} />
              </div>
              <div className="explanation">
                <span>What the restaurant sees</span>
                <p>{selected.description}</p>
              </div>
              <div className="event-log">
                <span>Widget events</span>
                <p>{events.length ? events.join("  ·  ") : "Events will appear here during the demo."}</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

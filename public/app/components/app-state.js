/*
ZENTRA STATE CORE
Final Clean System
TR / EN / AR Multi-Language
*/

const ZENTRA_STATE = {

  // =========================
  // SYSTEM META
  // =========================
  system: {
    name: "ZENTRA Matrix Ecosystem",
    version: "final-clean-1.0",
    mode: "production",
    initialized: true
  },

  // =========================
  // LANGUAGE
  // =========================
  lang: {
    active: "tr", // tr | en | ar
    supported: ["tr","en","ar"]
  },

  // =========================
  // ROUTING
  // =========================
  route: {
    current: "cockpit",
    previous: null
  },

  // =========================
  // CONNECTION
  // =========================
  connection: {
    status: "idle", // idle | loading | live | fallback | error
    last_ping: null
  },

  // =========================
  // USER INPUT
  // =========================
  input: {
    amount: 0,
    payment_delay_days: 0,
    customer_score: 0,
    exposure_ratio: 0,
    sector: "trade",
    country: "TR"
  },

  // =========================
  // OUTPUT / RESPONSE
  // =========================
  output: {
    risk: null,
    stress: null,
    decision: null,
    macro: null,
    trade: null,
    deviation: null,
    regime: null,
    dominant_lens: null,
    strategy: null,
    rationale: null,
    raw: null
  },

  // =========================
  // UI FLAGS
  // =========================
  ui: {
    loading: false,
    error: null,
    last_update: null
  }

};

// =========================
// STATE MANAGER
// =========================
const ZENTRA_STATE_MANAGER = {

  get(){
    return ZENTRA_STATE;
  },

  setLang(lang){
    if(ZENTRA_STATE.lang.supported.includes(lang)){
      ZENTRA_STATE.lang.active = lang;
      this.trace("LANG_UPDATED", lang);
    }
  },

  setRoute(route){
    ZENTRA_STATE.route.previous = ZENTRA_STATE.route.current;
    ZENTRA_STATE.route.current = route;
    this.trace("ROUTE_CHANGED", route);
  },

  setConnection(status){
    ZENTRA_STATE.connection.status = status;
    ZENTRA_STATE.connection.last_ping = Date.now();
    this.trace("CONNECTION", status);
  },

  setInput(payload){
    ZENTRA_STATE.input = {
      ...ZENTRA_STATE.input,
      ...payload
    };
    this.trace("INPUT_UPDATED", payload);
  },

  setOutput(payload){
    ZENTRA_STATE.output = {
      ...ZENTRA_STATE.output,
      ...payload
    };
    ZENTRA_STATE.ui.last_update = Date.now();
    this.trace("OUTPUT_UPDATED", payload);
  },

  setError(err){
    ZENTRA_STATE.ui.error = err;
    this.trace("ERROR", err);
  },

  clearError(){
    ZENTRA_STATE.ui.error = null;
  },

  setLoading(flag){
    ZENTRA_STATE.ui.loading = flag;
  },

  // =========================
  // TRACE SYSTEM (CRITICAL)
  // =========================
  trace(type, data){
    console.log("[ZENTRA TRACE]", {
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }

};

// =========================
// GLOBAL EXPORT
// =========================
if (typeof window !== "undefined") {
  window.ZENTRA_STATE = ZENTRA_STATE;
  window.ZENTRA = ZENTRA_STATE_MANAGER;
}

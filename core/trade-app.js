
/*
ZENTRA — TRADE APP
Signal → Risk → Decision → Action
*/

const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');
const EXEC = require('./execution-engine');

const TRADE_APP = {

  // 1) INPUT (basit market data)
  input(data) {
    return {
      asset: data.asset || "BTC",
      price: Number(data.price || 30000),
      trend: data.trend || "up",
      volatility: Number(data.volatility || 50),
      ts: new Date().toISOString()
    };
  },

  // 2) PROCESS (signal + risk)
  process(input) {

    let signal = "HOLD";

    if (input.trend === "up" && input.volatility < 70) {
      signal = "BUY";
    } else if (input.trend === "down") {
      signal = "SELL";
    }

    let risk = "LOW";
    if (input.volatility > 70) risk = "HIGH";
    else if (input.volatility > 40) risk = "MEDIUM";

    let decision = "WAIT";

    if (signal === "BUY" && risk !== "HIGH") {
      decision = "ENTER_LONG";
    } else if (signal === "SELL") {
      decision = "EXIT";
    }

    return {
      signal,
      risk,
      decision
    };
  },

  // 3) OUTPUT
  output(result) {
    return {
      signal: result.signal,
      risk: result.risk,
      decision: result.decision,
      ts: new Date().toISOString()
    };
  },

  // 4) RUN
  run(data) {

    MODULES.register({
      id: "trade_intel",
      name: "Trade Intelligence",
      status: "var",
      core_connected: true
    });

    PRODUCTS.register({
      id: "trade_product",
      name: "Trade Product",
      module_id: "trade_intel",
      status: "var",
      app_connected: true
    });

    APPS.register({
      id: "trade_app",
      name: "Trade App",
      product_id: "trade_product",
      status: "var",
      cockpit: true,
      assistant: false
    });

    const input = this.input(data);
    const result = this.process(input);
    const out = this.output(result);

    const mission_id = "trade_run_" + Date.now();

    MISSIONS.create({
      id: mission_id,
      name: "Trade Signal Run",
      module_id: "trade_intel",
      product_id: "trade_product",
      app_id: "trade_app"
    });

    MISSIONS.addTask(mission_id, {
      id: "task_trade",
      name: "Run Trade Signal",
      operator: "execution_operator"
    });

    EXEC.startMission(mission_id);

    return {
      input,
      result,
      output: out,
      mission_id
    };
  }
};

module.exports = TRADE_APP;


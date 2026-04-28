/*
ZENTRA — RISK APP
Input → Process → Output
Core + Execution bağlı
*/

const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');
const EXEC = require('./execution-engine');

const RISK_APP = {

  // 1) INPUT
  input(data) {
    return {
      entity: data.entity || "test_company",
      revenue: Number(data.revenue || 100000),
      debt: Number(data.debt || 50000),
      cash: Number(data.cash || 20000),
      ts: new Date().toISOString()
    };
  },

  // 2) PROCESS (basit çekirdek — sonra lens bağlanacak)
  process(input) {
    const stress = (input.debt / Math.max(input.revenue,1)) * 100;
    const liquidity = (input.cash / Math.max(input.debt,1)) * 100;

    let risk_score = 0;
    risk_score += Math.min(stress, 100) * 0.6;
    risk_score += (100 - Math.min(liquidity,100)) * 0.4;

    let band = "LOW";
    if (risk_score > 70) band = "HIGH";
    else if (risk_score > 40) band = "MEDIUM";

    const decision = band === "HIGH" ? "RISKY"
                    : band === "MEDIUM" ? "CAUTION"
                    : "OK";

    return {
      risk_score: Math.round(risk_score),
      stress: Math.round(stress),
      liquidity: Math.round(liquidity),
      band,
      decision
    };
  },

  // 3) OUTPUT
  output(result) {
    return {
      score: result.risk_score,
      stress: result.stress,
      liquidity: result.liquidity,
      band: result.band,
      decision: result.decision,
      ts: new Date().toISOString()
    };
  },

  // 4) RUN (execution bağlı)
  run(data) {
    // registry ensure (idempotent)
    MODULES.register({
      id: "risk_intel",
      name: "Risk Intelligence",
      status: "var",
      core_connected: true
    });

    PRODUCTS.register({
      id: "risk_product",
      name: "Risk Product",
      module_id: "risk_intel",
      status: "var",
      app_connected: true
    });

    APPS.register({
      id: "risk_app",
      name: "Risk App",
      product_id: "risk_product",
      status: "var",
      cockpit: true,
      assistant: false
    });

    const input = this.input(data);
    const result = this.process(input);
    const out = this.output(result);

    // execution mission
    const mission_id = "risk_run_" + Date.now();

    MISSIONS.create({
      id: mission_id,
      name: "Risk Analysis Run",
      module_id: "risk_intel",
      product_id: "risk_product",
      app_id: "risk_app"
    });

    MISSIONS.addTask(mission_id, {
      id: "task_calc",
      name: "Run Risk Calculation",
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

module.exports = RISK_APP;

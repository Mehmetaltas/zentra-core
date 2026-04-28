
/*
ZENTRA — CREDIT APP
Input → Process → Output
Core + Execution bağlı
*/

const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');
const EXEC = require('./execution-engine');

const CREDIT_APP = {

  // 1) INPUT
  input(data) {
    return {
      entity: data.entity || "test_company",
      revenue: Number(data.revenue || 100000),
      debt: Number(data.debt || 50000),
      expenses: Number(data.expenses || 60000),
      cash: Number(data.cash || 20000),
      ts: new Date().toISOString()
    };
  },

  // 2) PROCESS (credit logic)
  process(input) {
    const debt_ratio = input.debt / Math.max(input.revenue, 1);
    const coverage = input.revenue / Math.max(input.expenses, 1);
    const liquidity = input.cash / Math.max(input.debt, 1);

    let score = 0;

    score += Math.min(debt_ratio * 100, 100) * 0.4;
    score += (100 - Math.min(coverage * 50, 100)) * 0.3;
    score += (100 - Math.min(liquidity * 100, 100)) * 0.3;

    let band = "LOW";
    if (score > 70) band = "HIGH";
    else if (score > 40) band = "MEDIUM";

    const decision =
      band === "HIGH" ? "REJECT" :
      band === "MEDIUM" ? "REVIEW" :
      "APPROVE";

    return {
      credit_score: Math.round(score),
      debt_ratio: Math.round(debt_ratio * 100),
      coverage: Math.round(coverage * 100),
      liquidity: Math.round(liquidity * 100),
      band,
      decision
    };
  },

  // 3) OUTPUT
  output(result) {
    return {
      score: result.credit_score,
      band: result.band,
      decision: result.decision,
      metrics: {
        debt_ratio: result.debt_ratio,
        coverage: result.coverage,
        liquidity: result.liquidity
      },
      ts: new Date().toISOString()
    };
  },

  // 4) RUN
  run(data) {

    MODULES.register({
      id: "credit_intel",
      name: "Credit Intelligence",
      status: "var",
      core_connected: true
    });

    PRODUCTS.register({
      id: "credit_product",
      name: "Credit Product",
      module_id: "credit_intel",
      status: "var",
      app_connected: true
    });

    APPS.register({
      id: "credit_app",
      name: "Credit App",
      product_id: "credit_product",
      status: "var",
      cockpit: true,
      assistant: false
    });

    const input = this.input(data);
    const result = this.process(input);
    const out = this.output(result);

    const mission_id = "credit_run_" + Date.now();

    MISSIONS.create({
      id: mission_id,
      name: "Credit Analysis Run",
      module_id: "credit_intel",
      product_id: "credit_product",
      app_id: "credit_app"
    });

    MISSIONS.addTask(mission_id, {
      id: "task_credit",
      name: "Run Credit Calculation",
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

module.exports = CREDIT_APP;


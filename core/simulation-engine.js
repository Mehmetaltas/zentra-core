
/*
ZENTRA — SIMULATION ENGINE V1
Input → Scenario → Variation → Output
*/

const SIM = {

  // 1) SCENARIO CREATE
  createScenario(base) {
    return {
      name: "base",
      data: base,
      ts: new Date().toISOString()
    };
  },

  // 2) VARIATIONS
  generate(base) {

    const scenarios = [];

    // BASE
    scenarios.push({
      name: "base",
      data: { ...base }
    });

    // STRESS ↑
    scenarios.push({
      name: "stress_up",
      data: {
        ...base,
        debt: base.debt * 1.3,
        expenses: (base.expenses || 0) * 1.2
      }
    });

    // LIQUIDITY ↓
    scenarios.push({
      name: "liquidity_down",
      data: {
        ...base,
        cash: base.cash * 0.7
      }
    });

    // OPTIMISTIC
    scenarios.push({
      name: "optimistic",
      data: {
        ...base,
        revenue: base.revenue * 1.2,
        debt: base.debt * 0.9
      }
    });

    return scenarios;
  },

  // 3) RUN (Risk üzerinden)
  run(baseData, runner) {

    const scenarios = this.generate(baseData);

    const results = scenarios.map(s => {
      const res = runner(s.data);
      return {
        scenario: s.name,
        result: res.result || res
      };
    });

    return {
      scenarios: results,
      ts: new Date().toISOString()
    };
  }

};

module.exports = SIM;


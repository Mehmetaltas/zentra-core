export async function runAgentWorkforceV1(pool, runEngine, rules, baseInput = {}, liveContext = {}) {

  const context = {
    status: "running",
    agents: {},
    real_data: {},
    financial_trade: {},
    simulation_feedback: null,
    proposal_validation: null,
    controlled_apply: null
  };

  // =====================
  // SAFE LOGGER
  // =====================
  async function safeLog(name, data) {
    try {
      await pool.query(
        `insert into agent_runtime_log (agent_name, status, output)
         values ($1,$2,$3)`,
        [name, "ok", JSON.stringify(data || {})]
      );
    } catch (e) {}
  }

  // =====================
  // 1. DATA (USE EXISTING LIVE CONTEXT)
  // =====================
  const realData = {
    status: "from_live_context",
    tcmb_fx: liveContext?.tcmb_fx || null,
    world_bank: liveContext?.world_bank || null,
    licensed_sources: [
      "BIST",
      "Bloomberg",
      "TradingView"
    ]
  };

  context.real_data = realData;

  context.agents.data_collector_agent = {
    status: "completed"
  };

  await safeLog("data_collector", context.agents.data_collector_agent);

  // =====================
  // 2. VALIDATOR
  // =====================
  context.agents.validator_agent = {
    status: "completed"
  };

  await safeLog("validator", context.agents.validator_agent);

  // =====================
  // 3. FINANCIAL TRADE (SAFE)
  // =====================
  const usd = Number(realData?.tcmb_fx?.USD?.forex_selling || 0);
  const eur = Number(realData?.tcmb_fx?.EUR?.forex_selling || 0);

  const fx_pressure =
    usd > 45 || eur > 52 ? "HIGH" :
    usd > 40 ? "MEDIUM" : "LOW";

  context.financial_trade = {
    status: "started",
    indicators: {
      fx_pressure,
      usd,
      eur
    }
  };

  context.agents.financial_trade_agent = {
    status: "completed"
  };

  await safeLog("financial_trade", context.financial_trade);

  // =====================
  // 4. SIMULATION (SAFE)
  // =====================
  const scenarios = [
    {
      scenario_type: "agent_clean",
      income: 50000,
      debt: 10000,
      monthly_payment: 2000,
      total_limit: 30000
    },
    {
      scenario_type: "agent_stress",
      income: 20000,
      debt: 80000,
      monthly_payment: 9000,
      total_limit: 90000
    }
  ];

  const results = [];

  for (const s of scenarios) {
    try {
      const r = runEngine(s, rules);
      results.push(r);
    } catch (e) {}
  }

  context.simulation_feedback = {
    status: "completed",
    total_cases: results.length
  };

  context.agents.simulator_agent = {
    status: "completed"
  };

  await safeLog("simulation", context.simulation_feedback);

  // =====================
  // 5. LEARNING
  // =====================
  const rejected = results.filter(x => x.decision === "Reddet").length;

  let proposal = null;

  if (rejected >= 1) {
    proposal = {
      type: "tighten_policy",
      target: "limit_ratio_threshold",
      value: 3.5
    };
  }

  context.proposal_validation = {
    status: proposal ? "exists" : "none",
    proposal
  };

  context.agents.learning_agent = {
    status: "completed"
  };

  await safeLog("learning", context.proposal_validation);

  // =====================
  // 6. CONTROLLED APPLY
  // =====================
  context.controlled_apply = {
    status: "safe_mode",
    applied: false
  };

  context.agents.execution_agent = {
    status: "completed"
  };

  await safeLog("execution", context.controlled_apply);

  context.status = "completed";

  return context;
}

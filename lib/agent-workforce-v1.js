/**
 * ZENTRA AGENT WORKFORCE V1
 * Runtime + Real Data Lite + Financial Trade Starter
 *
 * Status:
 * - Agent workforce runtime: ACTIVE
 * - Real data lite: TCMB + World Bank
 * - Financial Trade stack: STARTED / registry + indicator base
 *
 * Rule:
 * Licensed data is NOT shown as connected.
 * BIST / Bloomberg / TradingView real-time feeds remain licensed_required.
 */

export async function ensureAgentTables(pool) {
  await pool.query(`
    create table if not exists agent_runtime_log (
      id serial primary key,
      created_at timestamptz default now(),
      agent_name text,
      status text,
      output jsonb
    )
  `);

  await pool.query(`
    create table if not exists financial_trade_registry (
      id serial primary key,
      created_at timestamptz default now(),
      source_name text,
      source_type text,
      license_status text,
      connected_status text,
      purpose text
    )
  `);

  await pool.query(`
    create table if not exists financial_trade_indicators (
      id serial primary key,
      created_at timestamptz default now(),
      symbol text,
      indicator_name text,
      value numeric,
      source text,
      status text
    )
  `);
}

export async function fetchRealDataLite() {
  const out = {
    status: "partial_real_data",
    tcmb_fx: null,
    world_bank: null,
    licensed_sources: [
      {
        source_name: "BIST_REALTIME",
        license_status: "licensed_required",
        connected_status: "not_connected"
      },
      {
        source_name: "BLOOMBERG_DATA_LICENSE",
        license_status: "enterprise_license_required",
        connected_status: "not_connected"
      },
      {
        source_name: "TRADINGVIEW_REALTIME_FEEDS",
        license_status: "licensed_or_exchange_plan_required",
        connected_status: "not_connected"
      }
    ],
    updated_at: new Date().toISOString()
  };

  try {
    const r = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
    const xml = await r.text();

    function fx(code) {
      const block = xml.match(new RegExp(`<Currency[^>]*CurrencyCode="${code}"[\\s\\S]*?<\\/Currency>`));
      if (!block) return null;
      const text = block[0];
      return {
        code,
        forex_buying: Number(text.match(/<ForexBuying>(.*?)<\\/ForexBuying>/)?.[1] || 0),
        forex_selling: Number(text.match(/<ForexSelling>(.*?)<\\/ForexSelling>/)?.[1] || 0)
      };
    }

    out.tcmb_fx = {
      USD: fx("USD"),
      EUR: fx("EUR"),
      GBP: fx("GBP")
    };
  } catch (e) {
    out.tcmb_fx = { error: String(e.message || e) };
  }

  try {
    async function wb(indicator) {
      const url = `https://api.worldbank.org/v2/country/TR/indicator/${indicator}?format=json&per_page=3`;
      const r = await fetch(url);
      const j = await r.json();
      const rows = Array.isArray(j) ? j[1] || [] : [];
      const latest = rows.find(x => x && x.value !== null);
      return latest ? { indicator, year: latest.date, value: latest.value } : null;
    }

    out.world_bank = {
      gdp_growth: await wb("NY.GDP.MKTP.KD.ZG"),
      inflation_cpi: await wb("FP.CPI.TOTL.ZG"),
      unemployment: await wb("SL.UEM.TOTL.ZS")
    };
  } catch (e) {
    out.world_bank = { error: String(e.message || e) };
  }

  return out;
}

export function buildFinancialTradeStarter(realData) {
  const usd = realData?.tcmb_fx?.USD?.forex_selling || 0;
  const eur = realData?.tcmb_fx?.EUR?.forex_selling || 0;

  const fx_pressure =
    usd > 45 || eur > 52 ? "HIGH" :
    usd > 40 || eur > 45 ? "MEDIUM" : "LOW";

  return {
    status: "started",
    stack: {
      market_data_feed: "partial_public_context",
      chart_engine: "planned",
      indicator_engine: "started",
      order_execution_logic: "not_active",
      licensed_feeds: "required_for_realtime"
    },
    indicators: {
      fx_pressure,
      usd_try: usd,
      eur_try: eur
    },
    note: "Financial Trade stack started with public macro/FX context. Real-time exchange/order book feeds require license."
  };
}

export async function runAgentWorkforceV1(pool, runEngine, rules, baseInput = {}) {
  await ensureAgentTables(pool);

  const context = {
    status: "running",
    agents: {},
    real_data: null,
    financial_trade: null,
    simulation_feedback: null,
    proposal_validation: null,
    controlled_apply: null
  };

  async function log(agent_name, status, output) {
    await pool.query(
      `insert into agent_runtime_log (agent_name, status, output)
       values ($1,$2,$3)`,
      [agent_name, status, JSON.stringify(output || {})]
    );
  }

  // 1. DATA COLLECTOR AGENT
  const realData = await fetchRealDataLite();
  context.real_data = realData;
  context.agents.data_collector_agent = {
    status: "completed",
    collected: ["TCMB", "World Bank"],
    licensed_not_connected: ["BIST", "Bloomberg", "TradingView"]
  };
  await log("data_collector_agent", "completed", context.agents.data_collector_agent);

  // 2. VALIDATOR AGENT
  context.agents.validator_agent = {
    status: "completed",
    validation: {
      tcmb: realData.tcmb_fx && !realData.tcmb_fx.error ? "valid" : "check",
      world_bank: realData.world_bank && !realData.world_bank.error ? "valid" : "check",
      licensed_sources: "registered_not_connected"
    }
  };
  await log("validator_agent", "completed", context.agents.validator_agent);

  // 3. FINANCIAL TRADE STARTER
  const financialTrade = buildFinancialTradeStarter(realData);
  context.financial_trade = financialTrade;

  await pool.query(
    `insert into financial_trade_registry
     (source_name, source_type, license_status, connected_status, purpose)
     values
     ('TCMB_FX', 'macro_fx', 'public_connected', 'connected', 'FX pressure context'),
     ('WORLD_BANK_MACRO', 'macro', 'public_connected', 'connected', 'macro context'),
     ('BIST_REALTIME', 'market_data', 'licensed_required', 'not_connected', 'real-time market feed'),
     ('BLOOMBERG_DATA_LICENSE', 'market_data', 'enterprise_license_required', 'not_connected', 'institutional market data'),
     ('TRADINGVIEW_FEEDS', 'chart_market_data', 'licensed_or_plan_required', 'not_connected', 'chart and market feed')
    `
  );

  await pool.query(
    `insert into financial_trade_indicators
     (symbol, indicator_name, value, source, status)
     values
     ('USDTRY', 'fx_pressure_usd', $1, 'TCMB', 'active'),
     ('EURTRY', 'fx_pressure_eur', $2, 'TCMB', 'active')
    `,
    [
      Number(realData?.tcmb_fx?.USD?.forex_selling || 0),
      Number(realData?.tcmb_fx?.EUR?.forex_selling || 0)
    ]
  );

  context.agents.financial_trade_agent = {
    status: "completed",
    output: financialTrade
  };
  await log("financial_trade_agent", "completed", context.agents.financial_trade_agent);

  // 4. SIMULATOR AGENT
  const scenarios = [
    {
      scenario_type: "agent_clean",
      product_context: baseInput.product_context || "intel",
      income: 50000,
      debt: 10000,
      monthly_payment: 2000,
      total_limit: 30000
    },
    {
      scenario_type: "agent_review",
      product_context: baseInput.product_context || "intel",
      income: 20000,
      debt: 60000,
      monthly_payment: 8000,
      total_limit: 80000
    },
    {
      scenario_type: "agent_stress",
      product_context: baseInput.product_context || "intel",
      income: 20000,
      debt: 150000,
      monthly_payment: 12000,
      total_limit: 120000
    }
  ];

  const simulationResults = scenarios.map(s => ({
    scenario_type: s.scenario_type,
    result: runEngine(s, rules)
  }));

  context.simulation_feedback = {
    status: "completed",
    total_cases: simulationResults.length,
    results: simulationResults.map(x => ({
      scenario_type: x.scenario_type,
      decision: x.result.decision,
      score: x.result.score
    }))
  };

  context.agents.simulator_agent = {
    status: "completed",
    output: context.simulation_feedback
  };
  await log("simulator_agent", "completed", context.agents.simulator_agent);

  // 5. LEARNING AGENT
  const rejected = simulationResults.filter(x => x.result.decision === "Reddet").length;
  const review = simulationResults.filter(x => x.result.decision === "İncele").length;

  const proposal =
    rejected >= 2
      ? {
          type: "tighten_policy",
          target_key: "limit_ratio_threshold",
          suggested_value: 3.75,
          reason: "agent simulations show elevated rejection pressure"
        }
      : review >= 2
      ? {
          type: "monitor_policy",
          target_key: "manual_review_band",
          suggested_value: 1,
          reason: "agent simulations show review concentration"
        }
      : null;

  context.agents.learning_agent = {
    status: "completed",
    proposal
  };
  await log("learning_agent", "completed", context.agents.learning_agent);

  // 6. PROPOSAL VALIDATION AGENT
  context.proposal_validation = {
    status: proposal ? "validated_for_review" : "no_proposal",
    proposal,
    validation_rule: "safe_proposal_only_no_blind_apply"
  };

  context.agents.validator_agent_2 = {
    status: "completed",
    output: context.proposal_validation
  };
  await log("proposal_validation_agent", "completed", context.agents.validator_agent_2);

  // 7. CONTROLLED APPLY AGENT
  context.controlled_apply = {
    status: "not_auto_applied",
    reason: "v1 keeps proposals in safe review mode",
    next_stage: "manual_or_governed_apply"
  };

  context.agents.execution_agent = {
    status: "completed",
    output: context.controlled_apply
  };
  await log("execution_agent", "completed", context.agents.execution_agent);

  context.status = "completed";

  return context;
}

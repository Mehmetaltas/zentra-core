export function calculateOwnData(input, result) {
  const d = result.derived || {};
  const policy = result.policy || {};
  const triggered = result.triggered || [];

  const riskIndicator =
    result.decision === "Reddet" ? 90 :
    result.decision === "İncele" ? 60 : 25;

  const paymentStress = Math.min(Math.round((d.payment_load || 0) * 100), 100);
  const limitPressure = Math.min(Math.round(((d.limit_ratio || 0) / 5) * 100), 100);

  const realityGap = Math.min(
    100,
    Math.round(
      ((d.debt_to_income || 0) > 3 ? 25 : 0) +
      ((d.payment_load || 0) > 0.3 ? 25 : 0) +
      ((d.limit_ratio || 0) > 3 ? 25 : 0) +
      ((policy.policyHits || []).length ? 25 : 0)
    )
  );

  const proofScore = Math.min(
    100,
    Math.round(
      25 +
      (triggered.length ? 20 : 0) +
      ((result.explain || []).length ? 20 : 0) +
      (result.trace ? 20 : 0) +
      (result.live_context ? 15 : 0)
    )
  );

  const scenarioType =
    result.decision === "Reddet" ? "stress_case" :
    result.decision === "İncele" ? "review_case" : "clean_case";

  return {
    generated_at: new Date().toISOString(),
    scenario_type: scenarioType,
    indicators: {
      risk_indicator: riskIndicator,
      payment_stress_indicator: paymentStress,
      limit_pressure_indicator: limitPressure,
      reality_gap_score: realityGap,
      proof_score: proofScore
    },
    synthetic_tags: [
      d.debt_to_income > 10 ? "extreme_dti" : null,
      d.payment_load > 0.5 ? "payment_overload" : null,
      d.limit_ratio > 4 ? "limit_policy_breach" : null,
      result.decision === "İncele" ? "manual_review_candidate" : null
    ].filter(Boolean),
    data_loop_signal: {
      should_store_for_learning: true,
      priority:
        result.decision === "Reddet" ? "high" :
        result.decision === "İncele" ? "medium" : "low",
      reason: "decision_trace_proof_and_indicator_generated"
    }
  };
}

export async function ensureOwnDataTable(pool) {
  await pool.query(`
    create table if not exists zentra_own_data_records (
      id serial primary key,
      created_at timestamptz default now(),
      decision text,
      scenario_type text,
      input jsonb,
      derived jsonb,
      indicators jsonb,
      synthetic_tags jsonb,
      proof_score numeric,
      reality_gap_score numeric,
      trace jsonb
    )
  `);
}

export async function storeOwnData(pool, input, result, ownData) {
  await ensureOwnDataTable(pool);

  await pool.query(
    `insert into zentra_own_data_records
     (decision, scenario_type, input, derived, indicators, synthetic_tags, proof_score, reality_gap_score, trace)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      result.decision,
      ownData.scenario_type,
      JSON.stringify(input || {}),
      JSON.stringify(result.derived || {}),
      JSON.stringify(ownData.indicators || {}),
      JSON.stringify(ownData.synthetic_tags || []),
      ownData.indicators.proof_score,
      ownData.indicators.reality_gap_score,
      JSON.stringify(result.trace || {})
    ]
  );
}

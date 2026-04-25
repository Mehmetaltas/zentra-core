export async function ensureLearningMutationTables(pool) {
  await pool.query(`
    create table if not exists learning_policy_state (
      key text primary key,
      value numeric,
      value_text text,
      updated_at timestamptz default now()
    )
  `);

  await pool.query(`
    create table if not exists rule_adjustments (
      id serial primary key,
      created_at timestamptz default now(),
      adjustment_type text,
      target_key text,
      old_value numeric,
      suggested_value numeric,
      validation_status text,
      reason jsonb
    )
  `);

  await pool.query(`
    insert into learning_policy_state (key, value, value_text)
    values 
      ('payment_load_threshold', 0.5, null),
      ('limit_ratio_threshold', 4, null),
      ('zero_income_policy', null, 'reject_if_debt_positive')
    on conflict (key) do nothing
  `);
}

export async function getLearningPolicyState(pool) {
  await ensureLearningMutationTables(pool);

  const r = await pool.query(`select key, value, value_text from learning_policy_state`);
  const state = {
    payment_load_threshold: 0.5,
    limit_ratio_threshold: 4,
    zero_income_policy: "reject_if_debt_positive"
  };

  for (const row of r.rows) {
    if (row.key === "payment_load_threshold") state.payment_load_threshold = Number(row.value);
    if (row.key === "limit_ratio_threshold") state.limit_ratio_threshold = Number(row.value);
    if (row.key === "zero_income_policy") state.zero_income_policy = row.value_text;
  }

  return state;
}

export async function runLearningMutationEngine(pool) {
  await ensureLearningMutationTables(pool);

  const state = await getLearningPolicyState(pool);

  const r = await pool.query(`
    select decision, risk_indicator, payment_stress_indicator, limit_pressure_indicator, proof_score, reality_gap_score, created_at
    from indicator_history
    order by created_at desc
    limit 50
  `);

  const rows = r.rows;
  const proposals = [];

  if (!rows.length) {
    return {
      status: "no_data",
      policy_state: state,
      proposals
    };
  }

  const avg = (field) =>
    rows.reduce((s, x) => s + Number(x[field] || 0), 0) / rows.length;

  const avgRisk = avg("risk_indicator");
  const avgPayment = avg("payment_stress_indicator");
  const avgLimit = avg("limit_pressure_indicator");

  if (avgPayment > 70 && state.payment_load_threshold > 0.4) {
    proposals.push({
      adjustment_type: "tighten",
      target_key: "payment_load_threshold",
      old_value: state.payment_load_threshold,
      suggested_value: Math.max(0.4, state.payment_load_threshold - 0.05),
      validation_status: "proposal_only",
      reason: {
        avg_payment_stress: avgPayment,
        message: "payment stress trend is elevated"
      }
    });
  }

  if (avgLimit > 85 && state.limit_ratio_threshold > 3.5) {
    proposals.push({
      adjustment_type: "tighten",
      target_key: "limit_ratio_threshold",
      old_value: state.limit_ratio_threshold,
      suggested_value: Math.max(3.5, state.limit_ratio_threshold - 0.25),
      validation_status: "proposal_only",
      reason: {
        avg_limit_pressure: avgLimit,
        message: "limit pressure trend is elevated"
      }
    });
  }

  if (avgRisk < 30 && avgPayment < 20 && avgLimit < 40) {
    proposals.push({
      adjustment_type: "relax",
      target_key: "limit_ratio_threshold",
      old_value: state.limit_ratio_threshold,
      suggested_value: Math.min(4.5, state.limit_ratio_threshold + 0.25),
      validation_status: "proposal_only",
      reason: {
        avg_risk: avgRisk,
        avg_payment: avgPayment,
        avg_limit: avgLimit,
        message: "portfolio trend is clean"
      }
    });
  }

  for (const p of proposals) {
    await pool.query(
      `insert into rule_adjustments
       (adjustment_type, target_key, old_value, suggested_value, validation_status, reason)
       values ($1,$2,$3,$4,$5,$6)`,
      [
        p.adjustment_type,
        p.target_key,
        p.old_value,
        p.suggested_value,
        p.validation_status,
        JSON.stringify(p.reason || {})
      ]
    );
  }

  return {
    status: "active",
    policy_state: state,
    sample_size: rows.length,
    trend: {
      avg_risk: avgRisk,
      avg_payment_stress: avgPayment,
      avg_limit_pressure: avgLimit
    },
    proposals,
    mode: "safe_proposal_mode"
  };
}

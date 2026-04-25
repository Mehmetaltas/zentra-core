export async function runIndicatorIntelligence(pool) {

  const rows = await pool.query(`
    select risk_indicator, payment_stress_indicator, limit_pressure_indicator, proof_score, reality_gap_score, created_at
    from indicator_history
    order by created_at desc
    limit 20
  `);

  const data = rows.rows;

  if (!data.length) {
    return { status: "no_data" };
  }

  function avg(field) {
    return data.reduce((s, r) => s + Number(r[field] || 0), 0) / data.length;
  }

  const latest = data[0];

  const averages = {
    risk: avg("risk_indicator"),
    payment: avg("payment_stress_indicator"),
    limit: avg("limit_pressure_indicator"),
    proof: avg("proof_score"),
    gap: avg("reality_gap_score")
  };

  const anomaly = [];

  if (latest.risk_indicator > averages.risk * 1.5) {
    anomaly.push("risk_spike");
  }

  if (latest.payment_stress_indicator > averages.payment * 1.5) {
    anomaly.push("payment_spike");
  }

  if (latest.limit_pressure_indicator > averages.limit * 1.5) {
    anomaly.push("limit_spike");
  }

  const drift = {
    risk: latest.risk_indicator - averages.risk,
    payment: latest.payment_stress_indicator - averages.payment,
    limit: latest.limit_pressure_indicator - averages.limit
  };

  return {
    status: "active",
    sample_size: data.length,
    latest,
    averages,
    anomaly,
    drift
  };
}

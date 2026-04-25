export async function runLearningEngine(pool) {

  const rows = await pool.query(`
    select decision, risk_indicator, payment_stress_indicator, limit_pressure_indicator
    from indicator_history
    order by created_at desc
    limit 50
  `);

  const data = rows.rows;
  if (!data.length) return { status: "no_data" };

  let adjustments = [];

  for (const r of data) {
    const risk = Number(r.risk_indicator || 0);
    const decision = r.decision;

    // yanlış reddetme
    if (risk < 30 && decision === "Reddet") {
      adjustments.push({
        type: "threshold_relax",
        reason: "low_risk_rejected",
        suggested_change: -5
      });
    }

    // yanlış onay
    if (risk > 80 && decision === "Onay") {
      adjustments.push({
        type: "threshold_tighten",
        reason: "high_risk_approved",
        suggested_change: +5
      });
    }
  }

  return {
    status: "active",
    sample_size: data.length,
    adjustments
  };
}

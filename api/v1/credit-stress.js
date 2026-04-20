function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function scoreLogic(data) {
  const paymentDelayDays = Number(data.payment_delay_days ?? 0);
  const customerScore = Number(data.customer_score ?? 50);
  const exposureRatio = Number(data.exposure_ratio ?? 0.5);
  const sectorRiskLevel = Number(data.sector_risk_level ?? 0.5);
  const sector = data.sector ?? "trade";

  const delayPenalty = clamp(paymentDelayDays * 0.6, 0, 30);
  const customerPenalty = clamp((100 - customerScore) * 0.3, 0, 30);
  const exposurePenalty = clamp(exposureRatio * 40, 0, 40);
  const sectorPenalty = clamp(sectorRiskLevel * 25, 0, 25);

  let risk = 100 - (delayPenalty + customerPenalty + exposurePenalty + sectorPenalty);
  risk = clamp(risk, 0, 100);

  const stress = clamp(
    delayPenalty * 1.2 +
    exposurePenalty * 0.8 +
    (100 - customerScore) * 0.2,
    0,
    100
  );

  let decision = "reject";
  if (risk >= 70) decision = "approve";
  else if (risk >= 40) decision = "monitor";

  let macro = "stable";
  if (stress >= 70) macro = "high";
  else if (stress >= 40) macro = "moderate";

  return {
    risk_score: Number(risk.toFixed(2)),
    stress_score: Number(stress.toFixed(2)),
    decision,
    macro_pressure: macro,
    trade_signal: Number((risk * 0.9).toFixed(2)),
    deviation_level: stress < 40 ? "low" : stress < 70 ? "moderate" : "high",
    regime: risk > 50 ? "trend" : "fragile",
    dominant_lens: sector,
    strategy: "Proceed with controlled caution and keep exposure monitored.",
    rationale: "Calculated via clean ZENTRA stress model."
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ detail: "Method Not Allowed" });
  }

  const apiKey = req.headers["x-api-key"];
  if (apiKey !== "zentra-demo-key") {
    return res.status(401).json({ detail: "Invalid API key" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const payload = {
    principal: Number(body.principal ?? 0),
    interest_rate: Number(body.interest_rate ?? 0),
    term_months: Number(body.term_months ?? 0),
    monthly_income: Number(body.monthly_income ?? 0),
    sector: body.sector ?? "trade",
    sector_risk_level: Number(body.sector_risk_level ?? 0.5),
    payment_delay_days: Number(body.payment_delay_days ?? 0),
    customer_score: Number(body.customer_score ?? 50),
    exposure_ratio: Number(body.exposure_ratio ?? 0.5)
  };

  return res.status(200).json(scoreLogic(payload));
}

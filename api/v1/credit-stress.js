function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function buildBaseScore(data) {
  const paymentDelayDays = Number(data.payment_delay_days ?? 0);
  const customerScore = Number(data.customer_score ?? 50);
  const exposureRatio = Number(data.exposure_ratio ?? 0.5);
  const sectorRiskLevel = Number(data.sector_risk_level ?? 0.5);

  const delayPenalty = clamp(paymentDelayDays * 0.6, 0, 30);
  const customerPenalty = clamp((100 - customerScore) * 0.3, 0, 30);
  const exposurePenalty = clamp(exposureRatio * 40, 0, 40);
  const sectorPenalty = clamp(sectorRiskLevel * 25, 0, 25);

  let risk = 100 - (delayPenalty + customerPenalty + exposurePenalty + sectorPenalty);
  risk = clamp(risk, 0, 100);

  let stress = clamp(
    delayPenalty * 1.2 +
    exposurePenalty * 0.8 +
    (100 - customerScore) * 0.2,
    0,
    100
  );

  return {
    risk,
    stress,
    penalties: {
      delay_penalty: Number(delayPenalty.toFixed(2)),
      customer_penalty: Number(customerPenalty.toFixed(2)),
      exposure_penalty: Number(exposurePenalty.toFixed(2)),
      sector_penalty: Number(sectorPenalty.toFixed(2))
    }
  };
}

function buildDecision(risk) {
  if (risk >= 70) return "approve";
  if (risk >= 40) return "monitor";
  return "reject";
}

function buildMacroFromStress(stress) {
  if (stress >= 70) return "high";
  if (stress >= 40) return "moderate";
  return "stable";
}

function buildTradeSignal(risk, fxAdjustment) {
  return clamp(Number((risk * 0.9 - fxAdjustment * 0.4).toFixed(2)), 0, 100);
}

function buildDeviationLevel(stress) {
  if (stress < 40) return "low";
  if (stress < 70) return "moderate";
  return "high";
}

function buildRegime(risk, macroPressure) {
  if (macroPressure === "high" && risk < 60) return "fragile";
  if (risk > 50) return "trend";
  return "fragile";
}

function buildMacroPenalty(macroPressure) {
  if (macroPressure === "high") return 12;
  if (macroPressure === "moderate") return 6;
  return 0;
}

async function fetchMarketContext(country, origin) {
  const url = `${origin}/api/v1/market-context?country=${encodeURIComponent(country || "TR")}`;
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Market context request failed with status " + response.status);
  }

  return response.json();
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

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const country = String(body.country || "TR").toUpperCase();
    const sector = body.sector ?? "trade";

    const baseResult = buildBaseScore(body);

    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const origin = `${proto}://${host}`;

    let marketContext = null;
    let fxAdjustment = 0;
    let macroPressure = buildMacroFromStress(baseResult.stress);
    let macroPenalty = 0;

    try {
      marketContext = await fetchMarketContext(country, origin);
      fxAdjustment = Number(marketContext?.macro?.fx_adjustment ?? 0);
      macroPressure = marketContext?.macro?.pressure || macroPressure;
      macroPenalty = buildMacroPenalty(macroPressure);
    } catch (marketError) {
      marketContext = {
        ok: false,
        detail: "Market context unavailable",
        error: String(marketError.message || marketError)
      };
    }

    let finalRisk = clamp(baseResult.risk - fxAdjustment * 0.6 - macroPenalty, 0, 100);
    let finalStress = clamp(baseResult.stress + fxAdjustment * 0.7 + macroPenalty, 0, 100);

    const decision = buildDecision(finalRisk);
    const tradeSignal = buildTradeSignal(finalRisk, fxAdjustment);
    const deviationLevel = buildDeviationLevel(finalStress);
    const regime = buildRegime(finalRisk, macroPressure);

    return res.status(200).json({
      risk_score: Number(finalRisk.toFixed(2)),
      stress_score: Number(finalStress.toFixed(2)),
      decision,
      macro_pressure: macroPressure,
      trade_signal: tradeSignal,
      deviation_level: deviationLevel,
      regime,
      dominant_lens: sector,
      strategy: "Proceed with controlled caution and keep exposure monitored.",
      rationale: "Calculated via clean ZENTRA stress model with live market context.",
      country,
      market_context: marketContext,
      adjustments: {
        fx_adjustment: Number(fxAdjustment.toFixed(2)),
        macro_penalty: Number(macroPenalty.toFixed(2)),
        ...baseResult.penalties
      }
    });
  } catch (error) {
    return res.status(500).json({
      detail: "Credit stress calculation failed",
      error: String(error.message || error)
    });
  }
}

const FX_URL = "https://api.frankfurter.dev/v2/rates?base=USD&quotes=TRY,EUR";

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function buildMacroPressure(usdTry, eurUsd) {
  if (usdTry >= 40 || eurUsd <= 0.95) return "high";
  if (usdTry >= 34 || eurUsd <= 1.02) return "moderate";
  return "stable";
}

function buildFxAdjustment(usdTry, eurUsd) {
  let adjustment = 0;

  if (usdTry >= 40) adjustment += 18;
  else if (usdTry >= 36) adjustment += 12;
  else if (usdTry >= 34) adjustment += 7;
  else if (usdTry >= 32) adjustment += 3;

  if (eurUsd <= 0.95) adjustment += 8;
  else if (eurUsd <= 1.00) adjustment += 5;
  else if (eurUsd <= 1.05) adjustment += 2;

  return clamp(adjustment, 0, 25);
}

function buildContext(payload) {
  const rates = payload && payload.rates ? payload.rates : {};
  const usdTry = Number(rates.TRY ?? 0);
  const usdEur = Number(rates.EUR ?? 0);
  const eurUsd = usdEur > 0 ? Number((1 / usdEur).toFixed(4)) : null;

  const macroPressure = buildMacroPressure(usdTry, eurUsd ?? 0);
  const fxAdjustment = buildFxAdjustment(usdTry, eurUsd ?? 0);

  return {
    ok: true,
    source: "frankfurter",
    fetched_at: new Date().toISOString(),
    market: {
      base: payload.base ?? "USD",
      date: payload.date ?? null,
      usd_try: usdTry,
      eur_usd: eurUsd,
      raw_rates: rates
    },
    macro: {
      pressure: macroPressure,
      fx_adjustment: fxAdjustment
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ detail: "Method Not Allowed" });
  }

  try {
    const response = await fetch(FX_URL, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        detail: "External market source failed",
        upstream_status: response.status
      });
    }

    const data = await response.json();
    const context = buildContext(data);

    return res.status(200).json(context);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      detail: "Market context fetch failed",
      error: String(error.message || error)
    });
  }
}

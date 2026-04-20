function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function getCountryConfig(country) {
  const c = String(country || "TR").toUpperCase();

  const map = {
    TR: {
      country: "TR",
      label: "Turkey",
      base: "USD",
      quotes: ["TRY", "EUR"],
      fallbackMetric: 38,
      fallbackEurUsd: 1.08
    },
    EU: {
      country: "EU",
      label: "Euro Area",
      base: "EUR",
      quotes: ["USD"],
      fallbackMetric: 1.08,
      fallbackEurUsd: 1.08
    },
    UK: {
      country: "UK",
      label: "United Kingdom",
      base: "GBP",
      quotes: ["USD"],
      fallbackMetric: 1.26,
      fallbackEurUsd: 1.08
    },
    AE: {
      country: "AE",
      label: "United Arab Emirates",
      base: "USD",
      quotes: ["AED", "EUR"],
      fallbackMetric: 3.6725,
      fallbackEurUsd: 1.08
    },
    SA: {
      country: "SA",
      label: "Saudi Arabia",
      base: "USD",
      quotes: ["SAR", "EUR"],
      fallbackMetric: 3.75,
      fallbackEurUsd: 1.08
    },
    US: {
      country: "US",
      label: "United States",
      base: "USD",
      quotes: ["EUR"],
      fallbackMetric: 1.08,
      fallbackEurUsd: 1.08
    }
  };

  return map[c] || map.TR;
}

function buildRatesUrl(config) {
  return `https://api.frankfurter.dev/v2/rates?base=${config.base}&quotes=${config.quotes.join(",")}`;
}

function toRatesMap(payload) {
  const map = {};
  const list = Array.isArray(payload) ? payload : [];

  for (const item of list) {
    if (item && item.quote) {
      map[String(item.quote).toUpperCase()] = Number(item.rate ?? 0);
    }
  }

  return map;
}

function deriveDate(payload) {
  if (Array.isArray(payload) && payload.length > 0) {
    return payload[0].date || null;
  }
  return null;
}

function deriveMetrics(config, rates) {
  const out = {
    eur_usd: null,
    usd_try: null,
    usd_aed: null,
    usd_sar: null,
    gbp_usd: null
  };

  if (config.country === "TR") {
    out.usd_try = Number(rates.TRY ?? 0);
    const usdEur = Number(rates.EUR ?? 0);
    out.eur_usd = usdEur > 0 ? Number((1 / usdEur).toFixed(4)) : null;
  }

  if (config.country === "EU") {
    out.eur_usd = Number(rates.USD ?? 0);
  }

  if (config.country === "UK") {
    out.gbp_usd = Number(rates.USD ?? 0);
  }

  if (config.country === "AE") {
    out.usd_aed = Number(rates.AED ?? 0);
    const usdEur = Number(rates.EUR ?? 0);
    out.eur_usd = usdEur > 0 ? Number((1 / usdEur).toFixed(4)) : null;
  }

  if (config.country === "SA") {
    out.usd_sar = Number(rates.SAR ?? 0);
    const usdEur = Number(rates.EUR ?? 0);
    out.eur_usd = usdEur > 0 ? Number((1 / usdEur).toFixed(4)) : null;
  }

  if (config.country === "US") {
    const usdEur = Number(rates.EUR ?? 0);
    out.eur_usd = usdEur > 0 ? Number((1 / usdEur).toFixed(4)) : null;
  }

  return out;
}

function buildMacroPressure(country, metrics) {
  const eurUsd = Number(metrics.eur_usd ?? 0);

  if (country === "TR") {
    const usdTry = Number(metrics.usd_try ?? 0);
    if (usdTry >= 40 || eurUsd <= 0.95) return "high";
    if (usdTry >= 34 || eurUsd <= 1.02) return "moderate";
    return "stable";
  }

  if (country === "AE") {
    const usdAed = Number(metrics.usd_aed ?? 0);
    if (usdAed >= 3.68 || eurUsd <= 0.95) return "high";
    if (usdAed >= 3.67 || eurUsd <= 1.02) return "moderate";
    return "stable";
  }

  if (country === "SA") {
    const usdSar = Number(metrics.usd_sar ?? 0);
    if (usdSar >= 3.76 || eurUsd <= 0.95) return "high";
    if (usdSar >= 3.75 || eurUsd <= 1.02) return "moderate";
    return "stable";
  }

  if (country === "EU") {
    if (eurUsd <= 0.95) return "high";
    if (eurUsd <= 1.02) return "moderate";
    return "stable";
  }

  if (country === "UK") {
    const gbpUsd = Number(metrics.gbp_usd ?? 0);
    if (gbpUsd <= 1.18) return "high";
    if (gbpUsd <= 1.24) return "moderate";
    return "stable";
  }

  if (country === "US") {
    if (eurUsd <= 0.95) return "high";
    if (eurUsd <= 1.02) return "moderate";
    return "stable";
  }

  return "stable";
}

function buildFxAdjustment(country, metrics) {
  let adjustment = 0;
  const eurUsd = Number(metrics.eur_usd ?? 0);

  if (country === "TR") {
    const usdTry = Number(metrics.usd_try ?? 0);
    if (usdTry >= 40) adjustment += 18;
    else if (usdTry >= 36) adjustment += 12;
    else if (usdTry >= 34) adjustment += 7;
    else if (usdTry >= 32) adjustment += 3;
  }

  if (country === "AE") {
    const usdAed = Number(metrics.usd_aed ?? 0);
    if (usdAed >= 3.68) adjustment += 8;
    else if (usdAed >= 3.67) adjustment += 4;
  }

  if (country === "SA") {
    const usdSar = Number(metrics.usd_sar ?? 0);
    if (usdSar >= 3.76) adjustment += 8;
    else if (usdSar >= 3.75) adjustment += 4;
  }

  if (country === "UK") {
    const gbpUsd = Number(metrics.gbp_usd ?? 0);
    if (gbpUsd <= 1.18) adjustment += 10;
    else if (gbpUsd <= 1.24) adjustment += 5;
  }

  if (eurUsd > 0) {
    if (eurUsd <= 0.95) adjustment += 8;
    else if (eurUsd <= 1.00) adjustment += 5;
    else if (eurUsd <= 1.05) adjustment += 2;
  }

  return clamp(adjustment, 0, 25);
}

function buildSuccessResponse(config, payload) {
  const rates = toRatesMap(payload);
  const metrics = deriveMetrics(config, rates);
  const macroPressure = buildMacroPressure(config.country, metrics);
  const fxAdjustment = buildFxAdjustment(config.country, metrics);

  return {
    ok: true,
    source: "frankfurter",
    fetched_at: new Date().toISOString(),
    context: {
      country: config.country,
      country_label: config.label,
      base: config.base,
      date: deriveDate(payload),
      quotes: config.quotes
    },
    market: {
      ...metrics,
      raw_rates: rates
    },
    macro: {
      pressure: macroPressure,
      fx_adjustment: fxAdjustment
    }
  };
}

function buildFallbackResponse(config, errorMessage) {
  const metrics = {
    eur_usd: config.fallbackEurUsd,
    usd_try: config.country === "TR" ? config.fallbackMetric : null,
    usd_aed: config.country === "AE" ? config.fallbackMetric : null,
    usd_sar: config.country === "SA" ? config.fallbackMetric : null,
    gbp_usd: config.country === "UK" ? config.fallbackMetric : null
  };

  return {
    ok: true,
    source: "fallback",
    fetched_at: new Date().toISOString(),
    context: {
      country: config.country,
      country_label: config.label,
      base: config.base,
      date: null,
      quotes: config.quotes
    },
    market: {
      ...metrics,
      raw_rates: {}
    },
    macro: {
      pressure: buildMacroPressure(config.country, metrics),
      fx_adjustment: buildFxAdjustment(config.country, metrics)
    },
    warning: "External market source unavailable, fallback values used.",
    error: errorMessage || null
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ detail: "Method Not Allowed" });
  }

  const country = req.query?.country || "TR";
  const config = getCountryConfig(country);
  const url = buildRatesUrl(config);

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(200).json(
        buildFallbackResponse(config, "External market source failed with status " + response.status)
      );
    }

    const data = await response.json();
    return res.status(200).json(buildSuccessResponse(config, data));
  } catch (error) {
    return res.status(200).json(
      buildFallbackResponse(config, String(error.message || error))
    );
  }
}

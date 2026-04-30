function buildDecision(type, input) {
  const base = {
    asset: input?.asset || "GENERIC",
    signal: "WATCH",
    risk: Math.floor(Math.random() * 40) + 50 // 50–90 arası
  };

  let scenario = {};
  let action = {};
  let warning = [];

  if (type === "trade") {
    scenario = {
      base: "controlled move",
      risk: "spike → hedge",
      weak: "no full exposure"
    };

    action = {
      entry: "max 30%",
      stop: "risk > 80",
      review: "if signal drops or credit rises"
    };

    warning = [
      "do not go full size",
      "wait for confirmation",
      "monitor risk spikes"
    ];
  }

  if (type === "risk") {
    scenario = {
      base: "stable",
      risk: "pressure building",
      weak: "liquidity tightening"
    };

    action = {
      reduce: "exposure",
      hedge: "recommended",
      monitor: "daily"
    };

    warning = [
      "avoid aggressive positions",
      "track cash flow"
    ];
  }

  return {
    asset: base.asset,
    signal: base.signal,
    risk: base.risk,
    scenario,
    action,
    warning
  };
}

module.exports = { buildDecision };

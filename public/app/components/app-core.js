// ZENTRA MATRIX ECOSYSTEM
// FINAL CLEAN SYSTEM CORE

(function () {

  const STATE = {
    language: "en",
    snapshots: [],
    logs: []
  };

  const I18N = {
    en: {
      approve: "Approve",
      reject: "Reject",
      hold: "Hold",
      explain_low: "Low pressure. Conditions acceptable.",
      explain_mid: "Moderate pressure. Monitoring advised.",
      explain_high: "High pressure. Risk too high."
    },
    tr: {
      approve: "Onayla",
      reject: "Reddet",
      hold: "Beklet",
      explain_low: "Düşük baskı. Koşullar uygun.",
      explain_mid: "Orta baskı. İzleme önerilir.",
      explain_high: "Yüksek baskı. Risk kabul edilemez."
    },
    ar: {
      approve: "موافقة",
      reject: "رفض",
      hold: "انتظار",
      explain_low: "ضغط منخفض. الظروف مناسبة.",
      explain_mid: "ضغط متوسط. يوصى بالمراقبة.",
      explain_high: "ضغط مرتفع. المخاطر عالية جدًا."
    }
  };

  function t(key) {
    return I18N[STATE.language]?.[key] || key;
  }

  function normalize(input) {
    return {
      amount: Number(input?.amount) || 0,
      term: Number(input?.term) || 0,
      score: Number(input?.score) || 50
    };
  }

  function buildSignal(data) {
    return {
      amount: data.amount,
      term: data.term,
      score: data.score,
      level:
        data.amount > 100000 ? "high" :
        data.amount > 50000 ? "mid" : "low"
    };
  }

  function buildLens(signal) {
    return {
      trade: signal.level,
      risk: signal.score < 50 ? "elevated" : "moderate",
      macro: "neutral"
    };
  }

  function buildRisk(signal) {
    const raw =
      (signal.amount / 2000) +
      (signal.term * 0.5) -
      (signal.score * 0.3);

    const risk = Math.max(0, Math.min(100, Math.round(raw)));
    const stress = Math.max(0, Math.min(100, risk + 15));

    return {
      risk,
      stress,
      band: risk > 70 ? "HIGH" : risk > 40 ? "MID" : "LOW"
    };
  }

  function buildDecision(risk) {
    if (risk < 40) return "APPROVE";
    if (risk > 70) return "REJECT";
    return "HOLD";
  }

  function buildExplain(decision) {
    if (decision === "APPROVE") return t("explain_low");
    if (decision === "REJECT") return t("explain_high");
    return t("explain_mid");
  }

  function buildGovernance(decision) {
    if (decision === "REJECT") return "BLOCK";
    return "ALLOW";
  }

  function saveSnapshot(input, output) {
    const snapshot = {
      input,
      output,
      time: new Date().toISOString()
    };

    STATE.snapshots.push(snapshot);

    try {
      localStorage.setItem("zentra_snapshots", JSON.stringify(STATE.snapshots));
    } catch (e) {}

    return snapshot;
  }

  function log(entry) {
    const record = {
      time: new Date().toISOString(),
      entry
    };
    STATE.logs.push(record);
    console.log("ZENTRA LOG:", record);
  }

  function runZentra(input) {
    const data = normalize(input);
    const signal = buildSignal(data);
    const lens = buildLens(signal);
    const riskState = buildRisk(signal);
    const decision = buildDecision(riskState.risk);
    const explain = buildExplain(decision);
    const governance = buildGovernance(decision);

    const output = {
      input: data,
      signal,
      lens,
      risk: riskState.risk,
      stress: riskState.stress,
      band: riskState.band,
      decision,
      explain,
      governance,
      timestamp: new Date().toISOString()
    };

    saveSnapshot(data, output);
    log(output);
    return output;
  }

  window.ZENTRA = {
    run: runZentra,
    state: STATE,
    setLang: (lang) => (STATE.language = lang)
  };

})();

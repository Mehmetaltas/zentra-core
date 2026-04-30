(function(){
  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

  function buildScenario(input){
    const risk = input.risk ?? 72;
    const credit = input.credit ?? 66;
    const ft = input.ftSignal ?? "BUY";
    const fxPressure = input.fxPressure ?? 64;
    const liquidity = input.liquidity ?? 70;

    const scenarios = [
      {
        id: "A",
        name: "Controlled Entry",
        decision: ft === "BUY" && risk < 78 ? "LIMITED ENTRY" : "WAIT",
        confidence: clamp(78 - Math.max(0, risk-72), 45, 88),
        risk: risk,
        action: "Use Financial Trade for timing; cap exposure through RiskLens.",
        warning: "Do not enter with full exposure."
      },
      {
        id: "B",
        name: "Risk-First Protection",
        decision: risk >= 70 ? "HEDGE / REDUCE" : "MONITOR",
        confidence: clamp(70 + Math.max(0, risk-70), 55, 90),
        risk: clamp(risk + 6, 0, 100),
        action: "Reduce vulnerable exposure and open RiskLens report.",
        warning: "Risk layer is active."
      },
      {
        id: "C",
        name: "FX / Credit Pressure",
        decision: fxPressure > 60 || credit === "REVIEW" ? "CREDIT REVIEW" : "CLEAR",
        confidence: clamp(68 + Math.max(0, fxPressure-60), 50, 86),
        risk: clamp((risk + fxPressure) / 2, 0, 100),
        action: "Check Credit Intelligence before execution.",
        warning: "FX and credit pressure may change the final action."
      }
    ];

    const best = scenarios
      .slice()
      .sort((a,b)=> b.confidence - a.confidence)[0];

    const conflict = scenarios.some(s => s.decision !== best.decision);

    return {
      timestamp: new Date().toISOString(),
      input,
      scenarios,
      recommended: best,
      conflict,
      summary: conflict
        ? "Multiple scenario outputs detected. Use controlled decision route."
        : "Scenario outputs aligned."
    };
  }

  window.ZENTRA_SCENARIO_ENGINE_V1 = { buildScenario };

  document.addEventListener("DOMContentLoaded", function(){
    const S = window.ZENTRA_STATE || {};
    const input = {
      risk: S.system?.risk ?? 72,
      credit: S.system?.credit ?? "REVIEW",
      ftSignal: S.system?.ftSignal ?? "BUY",
      fxPressure: S.markets?.USDTRY?.score ?? 64,
      liquidity: 70
    };

    window.ZENTRA_SCENARIO_OUTPUT = buildScenario(input);

    const el = document.getElementById("scenario-output");
    if(el){
      const out = window.ZENTRA_SCENARIO_OUTPUT;
      el.innerHTML = `
        <div class="label">Scenario Engine V1</div>
        <p><b>Recommended:</b> ${out.recommended.name} — ${out.recommended.decision}</p>
        <p><b>Confidence:</b> ${out.recommended.confidence}%</p>
        <p><b>Conflict:</b> ${out.conflict ? "YES" : "NO"}</p>
        <p>${out.summary}</p>
      `;
    }
  });
})();

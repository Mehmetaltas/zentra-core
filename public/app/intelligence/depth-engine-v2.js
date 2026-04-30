(function(){
  function state(){
    const S = window.ZENTRA_STATE || {};
    return {
      risk: S.system?.risk ?? 72,
      stress: S.system?.stress ?? 64,
      signal: S.system?.ftSignal ?? "WATCH",
      confidence: S.system?.confidence ?? 78,
      credit: S.system?.credit ?? "REVIEW"
    };
  }

  function levelRisk(r){
    if(r >= 80) return "CRITICAL";
    if(r >= 70) return "HIGH";
    if(r >= 55) return "WATCH";
    return "NORMAL";
  }

  function build(){
    const s = state();
    const riskLevel = levelRisk(s.risk);

    return {
      summary: `Decision state: ${s.signal} with ${riskLevel} risk and ${s.confidence}% confidence.`,
      why: [
        `Signal layer is ${s.signal}.`,
        `Risk score is ${s.risk}, classified as ${riskLevel}.`,
        `Credit state is ${s.credit}; execution must include risk control.`
      ],
      risk: [
        `Stress level: ${s.stress}.`,
        `If risk rises above 80, execution must shift to protection mode.`,
        `Credit/FX pressure can override the trade signal.`
      ],
      scenario: [
        "Base: controlled entry with exposure cap.",
        "Risk spike: hedge/reduce action dominates.",
        "Credit pressure: review before execution."
      ],
      action: [
        "Open Financial Trade cockpit for timing.",
        "Use RiskLens for hedge/exposure.",
        "Confirm through report before pack/institutional route."
      ]
    };
  }

  function apply(){
    const d = build();

    document.querySelectorAll(".zr-grid").forEach(b=>{
      b.innerHTML = `
        <div class="zr-metric"><b>WHY</b><br>${d.why.join("<br>")}</div>
        <div class="zr-metric"><b>RISK</b><br>${d.risk.join("<br>")}</div>
        <div class="zr-metric"><b>SCENARIO</b><br>${d.scenario.join("<br>")}</div>
        <div class="zr-metric"><b>ACTION</b><br>${d.action.join("<br>")}</div>
      `;
    });

    const box = document.getElementById("depth-output");
    if(box){
      box.innerHTML = `
        <div class="label">Depth Engine V2</div>
        <p><b>Summary:</b> ${d.summary}</p>
        <p><b>Action:</b> ${d.action[0]}</p>
      `;
    }
  }

  window.ZENTRA_DEPTH_ENGINE_V2 = { build, apply };
  document.addEventListener("DOMContentLoaded", ()=>setTimeout(apply,700));
})();

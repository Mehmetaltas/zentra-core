(function(){
  function buildReport(){
    const S = window.ZENTRA_STATE || {};
    const sim = window.ZENTRA_SIM_OUTPUT || {};
    const exp = window.ZENTRA_EXPOSURE_OUTPUT || {};

    return {
      decision: S.system?.ftSignal === "BUY" ? "CONTROLLED ENTRY" : "WATCH / REVIEW",
      confidence: S.system?.confidence ?? 78,
      exposure: exp.exposure ?? 42,
      stability: sim.stable === false ? "UNSTABLE" : "STABLE",
      route: "Cockpit → Report → Pack → Institutional"
    };
  }

  function apply(){
    const r = buildReport();
    document.querySelectorAll(".zr-header").forEach(h=>{
      h.innerHTML = `
        <div class="title">ZENTRA INTELLIGENCE REPORT</div>
        <div class="decision">Decision: ${r.decision}</div>
        <div>Confidence: ${r.confidence}% • Exposure: ${r.exposure}% • Stability: ${r.stability}</div>
        <div>Route: ${r.route}</div>
      `;
    });
  }

  window.ZENTRA_REPORT_INTELLIGENCE_V2 = { buildReport };
  document.addEventListener("DOMContentLoaded", ()=>setTimeout(apply,900));
})();

(function(){

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function simulate(base){
    const variations = [
      { name: "Base Case", mod:{} },
      { name: "High Risk Spike", mod:{ risk: base.risk + 10 } },
      { name: "Liquidity Drop", mod:{ liquidity: 50 } },
      { name: "FX Stress", mod:{ fxPressure: base.fxPressure + 10 } },
      { name: "Signal Weakening", mod:{ ftSignal: "WATCH" } }
    ];

    const results = variations.map(v => {
      const input = Object.assign({}, base, v.mod);

      let decision = "HOLD";
      let stability = 70;

      if(input.risk >= 80) {
        decision = "PROTECT";
        stability = 85;
      }
      else if(input.ftSignal === "BUY" && input.risk < 75){
        decision = "ENTRY";
        stability = 78;
      }
      else if(input.fxPressure > 70){
        decision = "REVIEW";
        stability = 72;
      }

      return {
        scenario: v.name,
        input,
        decision,
        stability
      };
    });

    const stable = results.every(r => r.decision === results[0].decision);

    return {
      timestamp: new Date().toISOString(),
      base,
      results,
      stable,
      summary: stable
        ? "Decision stable across scenarios."
        : "Decision changes under stress scenarios."
    };
  }

  window.ZENTRA_SIM_ENGINE_V1 = { simulate };

  document.addEventListener("DOMContentLoaded", function(){
    const S = window.ZENTRA_STATE || {};

    const base = {
      risk: S.system?.risk ?? 72,
      ftSignal: S.system?.ftSignal ?? "BUY",
      fxPressure: S.markets?.USDTRY?.score ?? 64,
      liquidity: 70
    };

    const out = simulate(base);
    window.ZENTRA_SIM_OUTPUT = out;

    const el = document.getElementById("simulation-output");
    if(el){
      el.innerHTML = `
        <div class="label">Simulation Engine V1</div>
        <p><b>Stable:</b> ${out.stable ? "YES" : "NO"}</p>
        <p>${out.summary}</p>
      `;
    }
  });

})();

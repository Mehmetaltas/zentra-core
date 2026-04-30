(function(){

  function runPipeline(){

    const S = window.ZENTRA_STATE || {};

    // 1️⃣ SCENARIO
    const scenario = {
      type: S.system?.risk > 70 ? "RISKY" : "NORMAL",
      note: "Scenario generated from risk level"
    };

    // 2️⃣ CONFLICT
    let conflict = {
      exists: false,
      reason: ""
    };

    if(S.system?.risk > 70 && S.system?.ftSignal === "BUY"){
      conflict.exists = true;
      conflict.reason = "High risk vs BUY signal";
    }

    // 3️⃣ SIMULATION
    const simulation = {
      stable: !conflict.exists,
      note: conflict.exists ? "Volatility risk" : "Stable path"
    };

    // 4️⃣ EXPOSURE
    let exposure = {
      value: 50
    };

    if(S.system?.risk > 70){
      exposure.value = 30;
    }
    if(conflict.exists){
      exposure.value = 20;
    }

    // GLOBAL OUTPUTS
    window.ZENTRA_SCENARIO_OUTPUT = scenario;
    window.ZENTRA_CONFLICT_OUTPUT = conflict;
    window.ZENTRA_SIM_OUTPUT = simulation;
    window.ZENTRA_EXPOSURE_OUTPUT = exposure;

    // 5️⃣ DECISION TRIGGER
    if(window.ZENTRA_DECISION_CORE_V3){
      const d = window.ZENTRA_DECISION_CORE_V3.evaluate({
        risk: S.system?.risk ?? 72,
        stress: S.system?.stress ?? 64,
        signal: S.system?.ftSignal ?? "WATCH",
        confidence: S.system?.confidence ?? 78,
        credit: S.system?.credit ?? "REVIEW"
      });

      window.ZENTRA_DECISION_OUTPUT = d;

      // UI debug
      const dbg = document.getElementById("engine-debug");
      if(dbg){
        dbg.innerHTML = `
          <div><b>Scenario:</b> ${scenario.type}</div>
          <div><b>Conflict:</b> ${conflict.exists}</div>
          <div><b>Simulation:</b> ${simulation.stable}</div>
          <div><b>Exposure:</b> ${exposure.value}%</div>
          <div><b>Decision:</b> ${d.decision}</div>
        `;
      }
    }
  }

  window.ZENTRA_ENGINE_PIPELINE = {
    run: runPipeline
  };

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(runPipeline, 500);
  });

})();

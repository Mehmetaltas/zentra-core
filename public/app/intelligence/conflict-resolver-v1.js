(function(){

  function resolveConflict(scenarioOutput){
    const scenarios = scenarioOutput.scenarios || [];
    const recommended = scenarioOutput.recommended || {};
    const conflict = scenarioOutput.conflict;

    let finalDecision = recommended.decision;
    let reason = "Recommended scenario applied.";

    // --- OVERRIDE LOGIC ---

    // 1) Risk override
    const riskScenario = scenarios.find(s => s.name === "Risk-First Protection");
    if(riskScenario && riskScenario.risk >= 75){
      finalDecision = "PROTECT / REDUCE";
      reason = "High risk overrides all scenarios.";
    }

    // 2) Credit / FX override
    const fxScenario = scenarios.find(s => s.name === "FX / Credit Pressure");
    if(fxScenario && fxScenario.decision === "CREDIT REVIEW"){
      finalDecision = "HOLD / REVIEW";
      reason = "Credit / FX pressure requires review before action.";
    }

    // 3) Conflict fallback
    if(conflict && finalDecision === recommended.decision){
      finalDecision = "CONTROLLED ACTION";
      reason = "Scenario conflict detected; controlled execution applied.";
    }

    return {
      timestamp: new Date().toISOString(),
      base: scenarioOutput,
      finalDecision,
      reason
    };
  }

  window.ZENTRA_CONFLICT_RESOLVER_V1 = { resolveConflict };

  document.addEventListener("DOMContentLoaded", function(){
    if(!window.ZENTRA_SCENARIO_OUTPUT) return;

    const result = resolveConflict(window.ZENTRA_SCENARIO_OUTPUT);
    window.ZENTRA_FINAL_DECISION = result;

    // UI'ya dokunmuyoruz ama varsa debug alanına yazabilir
    const el = document.getElementById("final-decision");
    if(el){
      el.innerHTML = `
        <div class="label">Final Decision</div>
        <p><b>Decision:</b> ${result.finalDecision}</p>
        <p><b>Reason:</b> ${result.reason}</p>
      `;
    }
  });

})();

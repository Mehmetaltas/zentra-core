(function(){

  function read(){
    return {
      state: window.ZENTRA_STATE || {},
      decision: window.ZENTRA_DECISION_OUTPUT || {},
      scenario: window.ZENTRA_SCENARIO_OUTPUT || {},
      conflict: window.ZENTRA_CONFLICT_OUTPUT || {},
      simulation: window.ZENTRA_SIM_OUTPUT || {},
      exposure: window.ZENTRA_EXPOSURE_OUTPUT || {}
    };
  }

  function evaluate(d){

    let issues = [];
    let score = 100;

    // 1️⃣ Decision vs Risk
    if(d.state.system?.risk > 80 && d.decision.decision !== "EXIT"){
      issues.push("High risk but not exiting.");
      score -= 20;
    }

    // 2️⃣ Conflict not handled
    if(d.conflict.exists && d.exposure.value > 30){
      issues.push("Conflict exists but exposure too high.");
      score -= 15;
    }

    // 3️⃣ No hedge when risk high
    if(d.state.system?.risk > 70 && !d.decision.action?.hedge){
      issues.push("High risk but hedge missing.");
      score -= 15;
    }

    // 4️⃣ Weak decision
    if(d.decision.decision === "WAIT" && d.state.system?.ftSignal === "BUY"){
      issues.push("BUY signal but no action taken.");
      score -= 10;
    }

    // 5️⃣ Fake depth detection
    if(!d.scenario.type){
      issues.push("Scenario missing.");
      score -= 10;
    }

    return {
      score,
      issues
    };
  }

  function apply(){

    const data = read();
    const result = evaluate(data);

    window.ZENTRA_QUALITY_OUTPUT = result;

    const box = document.getElementById("quality-debug");

    if(box){
      box.innerHTML = `
        <div class="label">Quality Engine</div>
        <p><b>Score:</b> ${result.score}</p>
        <p><b>Issues:</b><br>${result.issues.length ? result.issues.join("<br>") : "None"}</p>
      `;
    }

    // console log (çok önemli)
    console.log("ZENTRA QUALITY", result);
  }

  window.ZENTRA_QUALITY_ENGINE = {
    run: apply
  };

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(apply, 1000);
  });

})();

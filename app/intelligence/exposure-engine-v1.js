(function(){

  function optimize(input){
    const risk = input.risk ?? 72;
    const confidence = input.confidence ?? 75;
    const stability = input.stability ?? true;

    let exposure = 0.5;

    // Risk etkisi
    if(risk >= 80) exposure -= 0.3;
    else if(risk >= 70) exposure -= 0.15;

    // Confidence etkisi
    if(confidence >= 80) exposure += 0.2;
    else if(confidence >= 70) exposure += 0.1;

    // Stability etkisi
    if(!stability) exposure -= 0.15;

    exposure = Math.max(0.1, Math.min(1, exposure));

    let action = "HOLD";

    if(exposure >= 0.7) action = "STRONG ENTRY";
    else if(exposure >= 0.5) action = "CONTROLLED ENTRY";
    else if(exposure >= 0.3) action = "LIMITED ENTRY";
    else action = "MINIMAL / HEDGE";

    return {
      timestamp: new Date().toISOString(),
      exposure: Math.round(exposure * 100),
      action,
      note: "Exposure optimized based on risk, confidence and stability."
    };
  }

  window.ZENTRA_EXPOSURE_ENGINE_V1 = { optimize };

  document.addEventListener("DOMContentLoaded", function(){
    const S = window.ZENTRA_STATE || {};
    const sim = window.ZENTRA_SIM_OUTPUT || {};

    const input = {
      risk: S.system?.risk ?? 72,
      confidence: S.system?.confidence ?? 75,
      stability: sim.stable ?? true
    };

    const out = optimize(input);
    window.ZENTRA_EXPOSURE_OUTPUT = out;

    const el = document.getElementById("exposure-output");
    if(el){
      el.innerHTML = `
        <div class="label">Exposure Optimization</div>
        <p><b>Exposure:</b> ${out.exposure}%</p>
        <p><b>Action:</b> ${out.action}</p>
      `;
    }
  });

})();

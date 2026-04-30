(function(){

  function readState(){
    const S = window.ZENTRA_STATE || {};

    return {
      risk: S.system?.risk ?? 72,
      stress: S.system?.stress ?? 64,
      signal: S.system?.ftSignal ?? "WATCH",
      confidence: S.system?.confidence ?? 78,
      credit: S.system?.credit ?? "REVIEW"
    };
  }

  function evaluate(s){

    let decision = "WAIT";
    let reason = [];

    // 1️⃣ SIGNAL BASE
    if(s.signal === "BUY"){
      decision = "ENTRY";
      reason.push("Signal supports entry.");
    }

    if(s.signal === "SELL"){
      decision = "EXIT";
      reason.push("Signal indicates exit.");
    }

    // 2️⃣ RISK OVERRIDE
    if(s.risk >= 80){
      decision = "EXIT";
      reason.push("Risk above 80 → forced exit.");
    }
    else if(s.risk >= 70){
      if(decision === "ENTRY"){
        decision = "LIMITED ENTRY";
        reason.push("High risk → limited entry.");
      } else {
        decision = "WAIT";
        reason.push("High risk → wait.");
      }
    }

    // 3️⃣ CREDIT OVERRIDE
    if(s.credit === "REVIEW"){
      if(decision === "ENTRY"){
        decision = "LIMITED ENTRY";
        reason.push("Credit pressure → reduce size.");
      }
    }

    // 4️⃣ CONFIDENCE FILTER
    if(s.confidence < 60){
      decision = "WAIT";
      reason.push("Low confidence → no action.");
    }

    // 5️⃣ FINAL ACTION
    let action = {
      type: decision,
      size: decision.includes("ENTRY") ? "30-40%" : "0%",
      hedge: s.risk >= 70,
      exitRule: "risk>80 OR signal↓"
    };

    return {
      decision,
      reason,
      action
    };
  }

  function apply(){

    const s = readState();
    const d = evaluate(s);

    // UI bağlama
    document.querySelectorAll(".zc-decision").forEach(el=>{
      el.innerHTML = `
        <h2>FINAL DECISION</h2>
        <div class="action">${d.decision}</div>
        <div style="font-size:13px;margin-top:6px;">
          Size: ${d.action.size} • Hedge: ${d.action.hedge ? "YES" : "NO"}
        </div>
        <div style="font-size:12px;opacity:0.7;margin-top:8px;">
          ${d.reason.join("<br>")}
        </div>
      `;
    });

    // report header bağla
    document.querySelectorAll(".zr-header").forEach(el=>{
      el.innerHTML = `
        <div class="title">ZENTRA DECISION REPORT</div>
        <div class="decision">${d.decision}</div>
        <div>Size: ${d.action.size} • Hedge: ${d.action.hedge ? "YES" : "NO"}</div>
        <div>Rule: ${d.action.exitRule}</div>
      `;
    });

    // global
    window.ZENTRA_DECISION_OUTPUT = d;
  }

  window.ZENTRA_DECISION_CORE_V3 = {
    readState,
    evaluate
  };

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(apply, 600);
  });

})();

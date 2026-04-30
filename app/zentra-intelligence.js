(function(){

// ===== ASSISTANT THINKING =====
function assistantThinking(){
  const box = document.getElementById("assistant-box");
  if(!box) return;

  const states = [
    "Scanning signals...",
    "Analyzing risk layers...",
    "Matching Financial Trade...",
    "Checking Credit pressure...",
    "Preparing decision..."
  ];

  let i = 0;
  setInterval(()=>{
    box.innerHTML = `
      <div class="label">Assistant Intelligence</div>
      <p><b>STATUS:</b> ${states[i]}</p>
    `;
    i = (i+1) % states.length;
  },1800);
}

// ===== DECISION ENGINE =====
function decisionEngine(){
  const el = document.querySelector(".decision-main");
  if(!el) return;

  const states = [
    "CONTROLLED OPPORTUNITY",
    "RISK-ELEVATED OPPORTUNITY",
    "LIMITED ENTRY ZONE",
    "VOLATILE WATCH MODE"
  ];

  let i = 0;
  setInterval(()=>{
    el.innerText = states[i];
    el.style.opacity = 0.4;
    setTimeout(()=> el.style.opacity = 1, 300);
    i = (i+1) % states.length;
  },4000);
}

// ===== LIVE LOG ENGINE =====
function logEngine(){
  const log = document.querySelector(".live-log");
  if(!log) return;

  const msgs = [
    "RiskLens ↑ stress spike detected",
    "Financial Trade → signal upgraded",
    "Credit → review pressure active",
    "Assistant → decision updated",
    "Report → route refreshed"
  ];

  setInterval(()=>{
    const now = new Date().toLocaleTimeString();
    const m = msgs[Math.floor(Math.random()*msgs.length)];

    const div = document.createElement("div");
    div.innerHTML = `<span style="color:#34f5a4">[${now}]</span> ${m}`;

    log.prepend(div);

    if(log.children.length > 8){
      log.removeChild(log.lastChild);
    }
  },2500);
}

// ===== FLOW PULSE =====
function flowPulse(){
  document.querySelectorAll(".node-flow a").forEach(el=>{
    setInterval(()=>{
      el.style.transform = "scale(1.04)";
      setTimeout(()=> el.style.transform="scale(1)",300);
    },3000 + Math.random()*2000);
  });
}

// ===== GLOBAL INIT =====
window.addEventListener("DOMContentLoaded", ()=>{
  assistantThinking();
  decisionEngine();
  logEngine();
  flowPulse();
});

})();

(function(){
  const S = window.ZENTRA_STATE;
  if(!S) return;

  function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  }

  function render(){
    setText("z-timestamp", S.updatedLabel);
    setText("z-risk", S.system.risk);
    setText("z-stress", S.system.stress);
    setText("z-credit", S.system.credit);
    setText("z-ft-signal", S.system.ftSignal);
    setText("z-confidence", S.system.confidence + "%");

    const a = document.getElementById("assistant-box");
    if(a){
      a.innerHTML = `
        <div class="label">Assistant Guidance</div>
        <p><b>WHY:</b> ${S.assistant.why}</p>
        <p><b>ACTION:</b> ${S.assistant.action}</p>
        <p><b>WARNING:</b> ${S.assistant.warning}</p>
      `;
    }
  }

  function tick(){
    S.tick += 1;
    S.updatedLabel = S.tick + "s";
    render();
  }

  document.addEventListener("DOMContentLoaded", render);
  setInterval(tick, 1000);
})();

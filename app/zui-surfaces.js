window.ZENTRA_SURFACE = {
  renderBars() {
    return `<div class="bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  },
  renderAssistant(data){
    return `
      <div class="card">
        <div class="label">Assistant Guidance</div>
        <div id="assistant-box">
          <p><b>WHY:</b> ${data.why}</p>
          <p><b>ACTION:</b> ${data.action}</p>
          <p><b>WARNING:</b> ${data.warning}</p>
        </div>
      </div>`;
  },
  renderRoute(){
    return `
      <div class="card">
        <div class="label">Output Route</div>
        <p>Cockpit → Report → Market Pack → Assistant Follow-up</p>
      </div>`;
  }
};

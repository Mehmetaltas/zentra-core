(function(){
  function routeForPage(){
    const path = location.pathname;
    if(path.includes("markets")) return {task:"Piyasaları özetle", target:"../markets/index.html"};
    if(path.includes("portfolio")) return {task:"Portföy riskini değerlendir", target:"../portfolio/index.html"};
    if(path.includes("risk")) return {task:"RiskLens raporu hazırla", target:"../cockpits/risk.html"};
    if(path.includes("financial-trade")) return {task:"Financial Trade sinyalini değerlendir", target:"../cockpits/financial-trade.html"};
    if(path.includes("credit")) return {task:"Kredi baskısını analiz et", target:"../cockpits/credit.html"};
    return {task:"Bugünkü karar akışını özetle", target:"./index.html"};
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".zentra-assistant-float")) return;

    const r = routeForPage();

    const panel = document.createElement("div");
    panel.className = "zentra-assistant-panel";
    panel.innerHTML = `
      <div class="label">ZENTRA Asistan</div>
      <h3>Size nasıl yardımcı olayım?</h3>
      <p id="za-suggest"><b>Önerilen görev:</b> ${r.task}</p>
      <textarea placeholder="Sorunuzu yazın..."></textarea>
      <p style="font-size:12px;opacity:.72">Asistan; cockpit, report ve ilgili ürün akışına yönlendirir. Yatırım tavsiyesi vermez.</p>
      <a class="btn" href="${r.target}">İlgili Cockpit’i Aç</a>
    `;

    const btn = document.createElement("button");
    btn.className = "zentra-assistant-float";
    btn.innerHTML = `<span class="zentra-assistant-orb"></span><span>ZENTRA ASİSTAN</span>`;

    btn.onclick = () => panel.classList.toggle("open");

    document.body.appendChild(panel);
    document.body.appendChild(btn);
  });
})();

setTimeout(()=>{
  const box = document.getElementById("assistant-box");
  if(box){
    box.innerHTML = `
      <div class="label">Recommended Action</div>
      <p><b>1.</b> Open Financial Trade cockpit</p>
      <p><b>2.</b> Hedge exposure with RiskLens</p>
      <p><b>3.</b> Confirm with Report</p>
    `;
  }
},1200);

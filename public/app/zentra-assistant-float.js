(function(){
  function getPrefix(){
    const depth = location.pathname.split("/app/")[1]?.split("/").length - 1 || 0;
    return depth <= 0 ? "./" : "../".repeat(depth);
  }

  function routeForPage(){
    const p = location.pathname;
    const prefix = getPrefix();

    if(p.includes("markets")) return {task:"Piyasa görünümünü analiz et", target:prefix+"markets/index.html"};
    if(p.includes("portfolio")) return {task:"Portföy riskini değerlendir", target:prefix+"portfolio/index.html"};
    if(p.includes("risk")) return {task:"RiskLens raporu hazırla", target:prefix+"cockpits/risk.html"};
    if(p.includes("financial-trade")) return {task:"Financial Trade sinyalini değerlendir", target:prefix+"cockpits/financial-trade.html"};
    if(p.includes("credit")) return {task:"Kredi baskısını analiz et", target:prefix+"cockpits/credit.html"};

    return {task:"Bugünkü karar akışını özetle", target:prefix+"index.html"};
  }

  function detectRoute(text){
    const v = (text || "").toUpperCase();
    const prefix = getPrefix();

    if(v.includes("THY") || v.includes("HİSSE") || v.includes("BORSA") || v.includes("TRADE"))
      return prefix+"cockpits/financial-trade.html";

    if(v.includes("RISK") || v.includes("RİSK"))
      return prefix+"cockpits/risk.html";

    if(v.includes("KREDI") || v.includes("KREDİ") || v.includes("CREDIT"))
      return prefix+"cockpits/credit.html";

    if(v.includes("PORTFÖY") || v.includes("PORTFOY"))
      return prefix+"portfolio/index.html";

    if(v.includes("PIYASA") || v.includes("PİYASA") || v.includes("MARKET"))
      return prefix+"markets/index.html";

    return routeForPage().target;
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".zentra-assistant-float")) return;

    const r = routeForPage();

    const panel = document.createElement("div");
    panel.className = "zentra-assistant-panel";
    panel.innerHTML = `
      <div class="label">ZENTRA Asistan</div>
      <h3>Size nasıl yardımcı olayım?</h3>
      <p id="za-detected"><b>Algılanan:</b> Henüz komut girilmedi.</p>
      <textarea id="za-input" placeholder="Örn: THY hisse analizi, risk raporu, portföy kontrolü..."></textarea>
      <p style="font-size:12px;opacity:.72">Enter’a basınca ilgili cockpit açılır. Yatırım tavsiyesi vermez.</p>
      <a class="btn" id="za-action" href="${r.target}">İlgili Cockpit’i Aç</a>
    `;

    const btn = document.createElement("button");
    btn.className = "zentra-assistant-float";
    btn.innerHTML = `<span class="zentra-assistant-orb"></span><span>ZENTRA ASİSTAN</span>`;

    btn.onclick = () => panel.classList.toggle("open");

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    const input = panel.querySelector("#za-input");
    const detected = panel.querySelector("#za-detected");
    const action = panel.querySelector("#za-action");

    input.addEventListener("input", function(){
      const v = this.value.trim();
      if(!v){
        detected.innerHTML = "<b>Algılanan:</b> Henüz komut girilmedi.";
        action.href = r.target;
        return;
      }

      const target = detectRoute(v);
      action.href = target;

      if(v.toUpperCase().includes("THY")){
        detected.innerHTML = "<b>Algılanan:</b> THY / BIST equity → Financial Trade + RiskLens akışı.";
      } else if(v.toUpperCase().includes("RISK") || v.toUpperCase().includes("RİSK")){
        detected.innerHTML = "<b>Algılanan:</b> Risk analizi → RiskLens cockpit.";
      } else if(v.toUpperCase().includes("PORT")){
        detected.innerHTML = "<b>Algılanan:</b> Portföy kontrolü → Portfolio cockpit.";
      } else {
        detected.innerHTML = "<b>Algılanan:</b> Genel karar akışı → Command Center.";
      }
    });

    input.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        e.preventDefault();
        window.location.href = detectRoute(this.value);
      }
    });
  });
})();

(function(){
  function depthPrefix(){
    const part = location.pathname.split("/app/")[1] || "";
    const depth = Math.max(0, part.split("/").length - 1);
    return depth <= 0 ? "./" : "../".repeat(depth);
  }

  function classify(text){
    const v = (text || "").toLowerCase();

    if(v.includes("iade") || v.includes("iptal") || v.includes("abonelik") || v.includes("fatura") || v.includes("destek")){
      return {type:"support", title:"Support / Subscription", route:"support/index.html", action:"Destek merkezine yönlendir."};
    }

    if(v.includes("gizlilik") || v.includes("hukuk") || v.includes("sözleşme") || v.includes("güvenlik") || v.includes("privacy") || v.includes("legal")){
      return {type:"legal", title:"Legal / Security", route:"legal/index.html", action:"Legal merkezine yönlendir."};
    }

    if(v.includes("thy") || v.includes("hisse") || v.includes("borsa") || v.includes("trade")){
      return {type:"financial-trade", title:"Financial Trade", route:"cockpits/financial-trade.html", action:"FT cockpit aç, RiskLens ile doğrula, rapor üret."};
    }

    if(v.includes("risk") || v.includes("risklens") || v.includes("stres")){
      return {type:"risk", title:"RiskLens", route:"cockpits/risk.html", action:"Risk cockpit aç, exposure ve hedge kontrol et."};
    }

    if(v.includes("kredi") || v.includes("credit") || v.includes("fx") || v.includes("kur")){
      return {type:"credit", title:"Credit Intelligence", route:"cockpits/credit.html", action:"Credit cockpit aç, FX/pressure incele."};
    }

    if(v.includes("portföy") || v.includes("portfoy") || v.includes("portfolio")){
      return {type:"portfolio", title:"Portfolio Intelligence", route:"portfolio/index.html", action:"Portfolio cockpit aç, allocation/rebalance kontrol et."};
    }

    if(v.includes("proof") || v.includes("kanıt") || v.includes("senaryo") || v.includes("use case")){
      return {type:"proof", title:"Proof Pack Flow", route:"cockpits/financial-trade.html", action:"Scenario → Conflict → Simulation → Exposure → Report akışını başlat."};
    }

    if(v.includes("fiyat") || v.includes("pricing") || v.includes("paket") || v.includes("package")){
      return {type:"commercial", title:"Pricing / Packages", route:"pricing/index.html", action:"Pricing ve package ladder aç."};
    }

    return {type:"command", title:"Command Center", route:"index.html", action:"Ana karar merkezine dön ve durumu özetle."};
  }

  function recommendedFlow(intent){
    const flows = {
      "financial-trade": ["Financial Trade cockpit", "RiskLens hedge", "Report", "FT Pack"],
      "risk": ["RiskLens cockpit", "Scenario check", "Exposure", "Risk Pack"],
      "credit": ["Credit cockpit", "FX pressure", "Review report", "Credit Pack"],
      "portfolio": ["Portfolio cockpit", "Allocation", "Rebalance", "Institutional route"],
      "proof": ["FT cockpit", "RiskLens", "Scenario/Conflict/Simulation", "Report + Pack"],
      "support": ["Support center", "Billing/Refund/Incident", "Request tracking"],
      "legal": ["Legal center", "Privacy/Security/Terms", "Compliance note"],
      "commercial": ["Pricing", "Packages", "Upgrade route"],
      "command": ["Command Center", "Markets", "Portfolio", "Packages"]
    };
    return flows[intent.type] || flows.command;
  }

  function renderAnswer(input){
    const prefix = depthPrefix();
    const intent = classify(input);
    const flow = recommendedFlow(intent);

    return {
      intent,
      html: `
        <div class="label">Assistant Intelligence</div>
        <p><b>Algılanan:</b> ${intent.title}</p>
        <p><b>Görev:</b> ${intent.action}</p>
        <p><b>Akış:</b><br>${flow.map((x,i)=>`${i+1}. ${x}`).join("<br>")}</p>
        <p><b>Uyarı:</b> ZENTRA karar destek sağlar; yatırım tavsiyesi vermez.</p>
        <a class="btn" href="${prefix}${intent.route}">Akışı Başlat</a>
      `,
      route: prefix + intent.route
    };
  }

  window.ZENTRA_ASSISTANT_INTELLIGENCE = { classify, renderAnswer };

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(()=>{
      const input = document.querySelector("#za-input");
      const detected = document.querySelector("#za-detected");
      const action = document.querySelector("#za-action");
      if(!input || !detected || !action) return;

      input.addEventListener("input", function(){
        const out = renderAnswer(this.value);
        detected.innerHTML = out.html;
        action.href = out.route;
        action.innerText = "Akışı Başlat";
      });

      input.addEventListener("keydown", function(e){
        if(e.key === "Enter"){
          e.preventDefault();
          const out = renderAnswer(this.value);
          location.href = out.route;
        }
      });
    },600);
  });
})();

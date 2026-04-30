(function(){
  function prefix(){
    const part = location.pathname.split("/app/")[1] || "";
    const depth = Math.max(0, part.split("/").length - 1);
    return depth <= 0 ? "./" : "../".repeat(depth);
  }

  function decide(text){
    const v = (text || "").toLowerCase();

    if(v.includes("thy") || v.includes("hisse") || v.includes("trade")){
      return {
        title:"Financial Trade Operation",
        route:"cockpits/financial-trade.html",
        flow:["Identify asset","Read signal","Check RiskLens","Generate report","Offer FT Pack"]
      };
    }

    if(v.includes("risk") || v.includes("stres")){
      return {
        title:"RiskLens Operation",
        route:"cockpits/risk.html",
        flow:["Read risk score","Run scenario","Check exposure","Open risk report","Offer Risk Pack"]
      };
    }

    if(v.includes("kredi") || v.includes("credit") || v.includes("fx") || v.includes("kur")){
      return {
        title:"Credit Operation",
        route:"cockpits/credit.html",
        flow:["Read credit pressure","Check FX","Review capacity","Open credit report","Offer Credit Pack"]
      };
    }

    if(v.includes("portföy") || v.includes("portfolio")){
      return {
        title:"Portfolio Operation",
        route:"portfolio/index.html",
        flow:["Read buckets","Check allocation","Run rebalance","Open institutional route","Offer Portfolio Pack"]
      };
    }

    if(v.includes("academia") || v.includes("araştır") || v.includes("model")){
      return {
        title:"Academia Operation",
        route:"academia/index.html",
        flow:["Define question","Select method","Track evidence","Create improvement","Handoff to product"]
      };
    }

    if(v.includes("general") || v.includes("yaz") || v.includes("özet") || v.includes("çıktı")){
      return {
        title:"General AI Operation",
        route:"general-ai.html",
        flow:["Understand task","Select output format","Use context","Produce answer","Route if needed"]
      };
    }

    if(v.includes("iade") || v.includes("abonelik") || v.includes("destek") || v.includes("fatura")){
      return {
        title:"Support Operation",
        route:"support/index.html",
        flow:["Classify request","Open support route","Track account issue","Resolve or escalate"]
      };
    }

    if(v.includes("gizlilik") || v.includes("hukuk") || v.includes("sözleşme") || v.includes("güvenlik")){
      return {
        title:"Legal / Trust Operation",
        route:"legal/index.html",
        flow:["Open legal center","Check policy","Route privacy/security request","Record issue"]
      };
    }

    return {
      title:"Command Operation",
      route:"index.html",
      flow:["Read system state","Open relevant cockpit","Generate report","Route to package"]
    };
  }

  function render(text){
    const p = prefix();
    const o = decide(text);
    return {
      route: p + o.route,
      html: `
        <div class="label">Assistant Operator V2</div>
        <p><b>Operation:</b> ${o.title}</p>
        <p><b>Flow:</b><br>${o.flow.map((x,i)=>`${i+1}. ${x}`).join("<br>")}</p>
        <p><b>Rule:</b> Assistant routes; engines decide; reports prove.</p>
        <a class="btn" href="${p+o.route}">Start Operation</a>
      `
    };
  }

  window.ZENTRA_ASSISTANT_OPERATOR_V2 = { decide, render };

  document.addEventListener("DOMContentLoaded", ()=>{
    setTimeout(()=>{
      const input = document.querySelector("#za-input");
      const detected = document.querySelector("#za-detected");
      const action = document.querySelector("#za-action");
      if(!input || !detected || !action) return;

      input.addEventListener("input", function(){
        const out = render(this.value);
        detected.innerHTML = out.html;
        action.href = out.route;
        action.innerText = "Start Operation";
      });

      input.addEventListener("keydown", function(e){
        if(e.key === "Enter"){
          e.preventDefault();
          location.href = render(this.value).route;
        }
      });
    },800);
  });
})();

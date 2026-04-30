(function(){

  function buildDepth(input){
    const base = (input || "").toLowerCase()

    return {
      why: [
        "Makro sinyal ile piyasa momentumu kısmen uyumlu.",
        "Likidite stabil fakat risk baskısı tamamen kalkmış değil.",
        "Kısa vadede fırsat, orta vadede dikkat gerektiriyor."
      ],
      risk: [
        "Volatilite artışı olasılığı yüksek.",
        "Makro veri sapmaları negatif etki yaratabilir.",
        "Likidite daralması downside risk oluşturur."
      ],
      scenario: [
        "Pozitif senaryo: momentum devam eder → sınırlı yükseliş.",
        "Negatif senaryo: risk tetiklenir → hızlı geri çekilme.",
        "Nötr senaryo: yatay sıkışma."
      ],
      action: [
        "Pozisyonu sınırlı aç.",
        "RiskLens ile hedge uygula.",
        "Belirlenen seviyede çıkış disiplini koru."
      ]
    }
  }

  function applyToReports(){
    const blocks = document.querySelectorAll(".zr-grid")

    blocks.forEach(b=>{
      const d = buildDepth(document.body.innerText)

      b.innerHTML = `
        <div class="zr-metric"><b>WHY</b><br>${d.why.join("<br>")}</div>
        <div class="zr-metric"><b>RISK</b><br>${d.risk.join("<br>")}</div>
        <div class="zr-metric"><b>SCENARIO</b><br>${d.scenario.join("<br>")}</div>
        <div class="zr-metric"><b>ACTION</b><br>${d.action.join("<br>")}</div>
      `
    })
  }

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(applyToReports, 500)
  })

  window.ZENTRA_DEPTH_ENGINE = {
    buildDepth
  }

})();

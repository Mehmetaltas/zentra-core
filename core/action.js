function action(assetRisk, portfolioRisk){

  if(assetRisk < 20 && portfolioRisk < 20){
    return {
      text: "Kademeli alım yapılabilir",
      level: "LOW_RISK"
    };
  }

  if(assetRisk < 40){
    return {
      text: "Pozisyon korunmalı, acele edilmemeli",
      level: "NEUTRAL"
    };
  }

  if(assetRisk < 60){
    return {
      text: "Risk artıyor, temkinli olunmalı",
      level: "MEDIUM_RISK"
    };
  }

  return {
    text: "Risk yüksek, korunma öncelikli",
    level: "HIGH_RISK"
  };
}

module.exports = { action };

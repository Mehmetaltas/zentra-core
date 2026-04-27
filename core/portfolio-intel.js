function analyzePortfolio(assets){

  const totalWeight = assets.reduce((s,a)=>s+a.weight,0) || 1;

  const normalized = assets.map(a=>({
    ...a,
    w: a.weight / totalWeight
  }));

  const portfolioRisk = Math.floor(
    normalized.reduce((s,a)=>s+(a.risk * a.w),0)
  );

  // ===== concentration =====
  const maxAsset = normalized.reduce((max,a)=> a.w > max.w ? a : max, normalized[0]);

  // ===== diversification =====
  const diversityScore = normalized.length;

  // ===== human explain =====
  let human = "";

  if(portfolioRisk > 60){
    human += "Portföy riskli seviyede. Maruziyet azaltılmalı. ";
  }else if(portfolioRisk > 30){
    human += "Portföy dengeli ama risk içeriyor. Kontrollü ilerlenmeli. ";
  }else{
    human += "Portföy genel olarak düşük riskli. ";
  }

  if(maxAsset.w > 0.5){
    human += `${maxAsset.symbol} ağırlığı çok yüksek. Dengeleme önerilir. `;
  }else if(maxAsset.w > 0.3){
    human += `${maxAsset.symbol} portföyde dominant. Dikkat edilmeli. `;
  }else{
    human += "Dağılım dengeli görünüyor. ";
  }

  // ===== technical =====
  const technical = `
Total Risk:${portfolioRisk}
Max Asset:${maxAsset.symbol} (${(maxAsset.w*100).toFixed(0)}%)
Assets:${diversityScore}
`;

  // ===== recommendation =====
  let recommendation = "";

  if(maxAsset.w > 0.5){
    recommendation = "Rebalance: dominant asset azaltılmalı.";
  }else if(portfolioRisk > 50){
    recommendation = "Risk azaltma: hedge veya güvenli varlık eklenmeli.";
  }else{
    recommendation = "Mevcut yapı korunabilir.";
  }

  return {
    portfolioRisk,
    dominant: maxAsset.symbol,
    concentration: maxAsset.w,
    human,
    technical,
    recommendation
  };
}

module.exports = { analyzePortfolio };

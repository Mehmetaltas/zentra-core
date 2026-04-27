function clamp(v,min,max){
  return Math.max(min,Math.min(max,v));
}

function volatility(change){
  return clamp(Math.abs(change)*10,0,1);
}

function momentum(trend){
  return clamp(Math.abs(trend)*50,0,1);
}

function computeScores(change,trend){
  const vol = volatility(change);
  const mom = momentum(trend);
  const risk = Math.floor((vol*0.6 + mom*0.4)*100);
  return {risk,vol,mom};
}

function decision(risk,mom){
  if(risk>70) return "RISK OFF";
  if(risk>50) return "HEDGE";
  if(risk>30) return mom>0.3 ? "HOLD / WATCH" : "HOLD";
  return mom>0.3 ? "ACCUMULATE (STRONG)" : "ACCUMULATE";
}

function explainHuman(risk,vol,mom){
  if(risk>70) return "Piyasa şu an yüksek riskli. Öncelik korunma, maruziyeti azaltma ve acele karar vermemek olmalı.";
  if(risk>50) return "Risk yükseliyor. Pozisyonlar korunmalı, yeni girişlerde temkinli olunmalı.";
  if(risk>30) return "Piyasa dengeli ama tamamen risksiz değil. Bekle-gör ve kontrollü takip daha sağlıklı.";
  return "Risk düşük görünüyor. Sert baskı zayıf; kademeli ve kontrollü ilerleme düşünülebilir.";
}

function explainTechnical(risk,vol,mom){
  return `Risk:${risk} | Volatility:${vol.toFixed(2)} | Momentum:${mom.toFixed(2)}`;
}

function explain(risk,vol,mom){
  return {
    human: explainHuman(risk,vol,mom),
    technical: explainTechnical(risk,vol,mom)
  };
}

module.exports = {
  computeScores,
  decision,
  explain,
  explainHuman,
  explainTechnical
};

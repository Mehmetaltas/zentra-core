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

function explain(risk,vol,mom){
  if(risk>70) return `Yüksek risk. Vol:${vol.toFixed(2)} Momentum:${mom.toFixed(2)}. Koruma öncelikli.`;
  if(risk>50) return `Orta-yüksek risk. Vol:${vol.toFixed(2)} Momentum:${mom.toFixed(2)}. Hedge düşünülebilir.`;
  if(risk>30) return `Dengeli risk. Vol:${vol.toFixed(2)} Momentum:${mom.toFixed(2)}. Pozisyon korunabilir.`;
  return `Düşük risk. Vol:${vol.toFixed(2)} Momentum:${mom.toFixed(2)}. Kademeli izleme uygun.`;
}

module.exports = { computeScores, decision, explain };

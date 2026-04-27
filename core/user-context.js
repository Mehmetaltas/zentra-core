function personalize(action, context){

  let text = action.text;

  if(!context) return text;

  // risk profili etkisi
  if(context.risk === "low"){
    text += " (Düşük risk profilin için küçük miktarlarla ilerle)";
  }

  if(context.risk === "high"){
    text += " (Yüksek risk profilin bu fırsatı daha agresif değerlendirebilir)";
  }

  // vade etkisi
  if(context.horizon === "short"){
    text += " (Kısa vadede hızlı hareketlere dikkat et)";
  }

  if(context.horizon === "long"){
    text += " (Uzun vadede dalgalanmalar daha az önemli)";
  }

  return text;
}

module.exports = { personalize };

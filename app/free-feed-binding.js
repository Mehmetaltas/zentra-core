(function(){
  const d = window.ZENTRA_PUBLIC_DATA;
  if(!d) return;

  const risk = d.system.risk;
  const stress = d.system.stress;
  const ft = d.system.ft_signal;

  let decision = "WATCH";

  if(ft === "BUY" && risk < 75) decision = "CONTROLLED BUY";
  if(risk > 75) decision = "HIGH RISK";

  const text = `
Risk: ${risk} / Stress: ${stress}
FT: ${ft}
Decision: ${decision}
`;

  const el = document.getElementById("free-summary");
  if(el) el.innerText = text;

})();

(function(){
  const d = window.ZENTRA_PUBLIC_DATA;
  if(!d) return;

  const risk = d.system.risk;
  const ft = d.system.ft_signal;

  let why = "";
  let action = "";
  let warning = "";

  if(ft === "BUY"){
    why = "Signal positive, macro aligned.";
    action = "Use Financial Trade cockpit.";
  } else {
    why = "Signal not strong.";
    action = "Observe only.";
  }

  if(risk > 70){
    warning = "Risk elevated. Avoid full exposure.";
  } else {
    warning = "Risk acceptable.";
  }

  const el = document.getElementById("assistant-box");
  if(el){
    el.innerHTML = `
    <b>WHY:</b> ${why}<br>
    <b>ACTION:</b> ${action}<br>
    <b>WARNING:</b> ${warning}
    `;
  }

})();

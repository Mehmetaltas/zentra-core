(function(){

  const d = window.ZENTRA_PUBLIC_DATA;
  if(!d) return;

  let counter = 0;

  function jitter(val){
    return val + Math.floor((Math.random() - 0.5) * 3);
  }

  function update(){

    counter++;
    const timeEl = document.getElementById("z-timestamp");
    if(timeEl){
      timeEl.innerText = counter + "s";
    }

    // canlı küçük değişimler
    d.markets.BIST100.score = jitter(d.markets.BIST100.score);
    d.markets.SP500.score = jitter(d.markets.SP500.score);
    d.markets.NASDAQ.score = jitter(d.markets.NASDAQ.score);
    d.markets.BTC.score = jitter(d.markets.BTC.score);

    // UI güncelle
    function set(id, val){
      const el = document.getElementById(id);
      if(el){
        el.innerText = val;
        el.classList.add("pulse");
        setTimeout(()=>el.classList.remove("pulse"), 300);
      }
    }

    set("m-bist", d.markets.BIST100.score);
    set("m-sp", d.markets.SP500.score);
    set("m-nasdaq", d.markets.NASDAQ.score);
    set("m-btc", d.markets.BTC.score);

    // assistant dynamic
    const a = document.getElementById("assistant-box");
    if(a){
      let risk = d.system.risk;
      let ft = d.system.ft_signal;

      let why = ft === "BUY"
        ? "Momentum + macro alignment"
        : "Signal weak";

      let action = ft === "BUY"
        ? "Use FT cockpit"
        : "Observe";

      let warning = risk > 70
        ? "High risk active"
        : "Risk acceptable";

      a.innerHTML = `
      <b>WHY:</b> ${why}<br>
      <b>ACTION:</b> ${action}<br>
      <b>WARNING:</b> ${warning}
      `;
    }

  }

  setInterval(update, 3000);

})();

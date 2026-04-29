(function(){
  const d = window.ZENTRA_PUBLIC_DATA;
  if(!d) return;

  function set(id, val){
    const el = document.getElementById(id);
    if(el) el.innerText = val;
  }

  // Update header
  set("z-timestamp", new Date(d.timestamp).toLocaleTimeString());

  // Markets
  set("m-bist", d.markets.BIST100.score + " " + d.markets.BIST100.change);
  set("m-sp", d.markets.SP500.score + " " + d.markets.SP500.change);
  set("m-nasdaq", d.markets.NASDAQ.score + " " + d.markets.NASDAQ.change);
  set("m-dax", d.markets.DAX.score + " " + d.markets.DAX.change);

  set("m-usdtry", d.markets.USDTRY.signal);
  set("m-eurusd", d.markets.EURUSD.signal);

  set("m-gold", d.markets.GOLD.signal);
  set("m-oil", d.markets.OIL.signal);

  set("m-btc", d.markets.BTC.signal);
  set("m-eth", d.markets.ETH.signal);

  set("m-dxy", d.markets.DXY.signal);

})();

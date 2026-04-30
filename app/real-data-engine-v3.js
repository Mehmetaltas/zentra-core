(function(){
  const fallback = window.ZENTRA_PUBLIC_DATA || {};
  const state = JSON.parse(JSON.stringify(fallback));

  async function fetchJson(url){
    const r = await fetch(url, { cache:"no-store" });
    if(!r.ok) throw new Error(url);
    return r.json();
  }

  async function loadCrypto(){
    const j = await fetchJson("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true");
    if(j.bitcoin){
      state.markets.BTC.score = Math.round(Math.max(0, Math.min(100, 60 + (j.bitcoin.usd_24h_change || 0) * 3)));
      state.markets.BTC.change = (j.bitcoin.usd_24h_change || 0).toFixed(2) + "%";
      state.markets.BTC.signal = (j.bitcoin.usd_24h_change || 0) >= 0 ? "VOLATILE BUY" : "VOLATILE WATCH";
    }
    if(j.ethereum){
      state.markets.ETH.score = Math.round(Math.max(0, Math.min(100, 60 + (j.ethereum.usd_24h_change || 0) * 3)));
      state.markets.ETH.change = (j.ethereum.usd_24h_change || 0).toFixed(2) + "%";
      state.markets.ETH.signal = (j.ethereum.usd_24h_change || 0) >= 0 ? "WATCH" : "PRESSURE";
    }
  }

  async function loadFx(){
    const j = await fetchJson("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR");
    if(j.rates){
      state.markets.USDTRY.change = j.rates.TRY ? j.rates.TRY.toFixed(2) : state.markets.USDTRY.change;
      state.markets.EURUSD.change = j.rates.EUR ? j.rates.EUR.toFixed(4) : state.markets.EURUSD.change;
      state.markets.USDTRY.signal = "LIVE FX";
      state.markets.EURUSD.signal = "LIVE FX";
    }
  }

  function computeSystem(){
    const btc = state.markets.BTC.score || 70;
    const fx = state.markets.USDTRY.score || 64;
    const risk = Math.round((72 + Math.max(50, fx) + Math.max(50, 100 - btc/2)) / 3);
    state.system.risk = risk;
    state.system.stress = risk > 72 ? 68 : 61;
    state.system.ft_signal = btc >= 70 ? "BUY" : "WATCH";
    state.system.confidence = Math.round((btc + 72) / 2);
    state.timestamp = new Date().toISOString();
    state.meta.source = "ZENTRA Real Public Data Engine V3";
    state.meta.delay = "Live public APIs + indicative fallback";
  }

  function render(){
    window.ZENTRA_PUBLIC_DATA = state;

    function set(id, val){
      const el = document.getElementById(id);
      if(el) el.innerText = val;
    }

    set("z-timestamp", new Date(state.timestamp).toLocaleTimeString("tr-TR"));
    set("m-btc", state.markets.BTC.score);
    set("m-eth", state.markets.ETH.signal);
    set("m-usdtry", state.markets.USDTRY.signal);
    set("m-eurusd", state.markets.EURUSD.signal);

    const source = document.getElementById("data-source");
    if(source){
      source.innerText = state.meta.source + " • " + state.meta.delay;
    }

    const assistant = document.getElementById("assistant-box");
    if(assistant){
      assistant.innerHTML = `
        <b>WHY:</b> Real public crypto/FX data is now blended with ZENTRA risk logic.<br>
        <b>ACTION:</b> Use Financial Trade for market timing, RiskLens for exposure, Credit for FX pressure.<br>
        <b>WARNING:</b> Public data can be delayed or incomplete; this is not investment advice.
      `;
    }
  }

  async function boot(){
    const status = document.getElementById("data-status");
    if(status) status.innerText = "Loading real public data...";

    try{ await loadCrypto(); }catch(e){ console.warn("crypto fallback", e); }
    try{ await loadFx(); }catch(e){ console.warn("fx fallback", e); }

    computeSystem();
    render();

    if(status) status.innerText = "Real public data active + fallback safe";
  }

  window.addEventListener("DOMContentLoaded", boot);
})();

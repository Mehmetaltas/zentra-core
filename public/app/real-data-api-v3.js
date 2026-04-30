(function(){
  const S = window.ZENTRA_STATE;
  if(!S) return;

  async function getJson(url){
    const r = await fetch(url, { cache: "no-store" });
    if(!r.ok) throw new Error(url);
    return r.json();
  }

  function scoreFromChange(chg){
    const n = Number(chg || 0);
    return Math.max(0, Math.min(100, Math.round(60 + n * 4)));
  }

  async function loadCrypto(){
    const j = await getJson("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true");
    if(j.bitcoin){
      S.markets = S.markets || {};
      S.markets.BTC = {
        price: j.bitcoin.usd,
        change: Number(j.bitcoin.usd_24h_change || 0).toFixed(2) + "%",
        score: scoreFromChange(j.bitcoin.usd_24h_change),
        signal: Number(j.bitcoin.usd_24h_change || 0) >= 0 ? "VOLATILE BUY" : "VOLATILE WATCH"
      };
    }
    if(j.ethereum){
      S.markets = S.markets || {};
      S.markets.ETH = {
        price: j.ethereum.usd,
        change: Number(j.ethereum.usd_24h_change || 0).toFixed(2) + "%",
        score: scoreFromChange(j.ethereum.usd_24h_change),
        signal: Number(j.ethereum.usd_24h_change || 0) >= 0 ? "WATCH" : "PRESSURE"
      };
    }
  }

  async function loadFx(){
    const j = await getJson("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR");
    if(j.rates){
      S.markets = S.markets || {};
      S.markets.USDTRY = { price: j.rates.TRY, change: "live", score: 64, signal: "LIVE FX" };
      S.markets.EURUSD = { price: j.rates.EUR, change: "live", score: 52, signal: "LIVE FX" };
    }
  }

  function compute(){
    const btcScore = S.markets?.BTC?.score || 78;
    const fxScore = S.markets?.USDTRY?.score || 64;
    S.system.risk = Math.round((72 + fxScore + Math.max(50, 100 - btcScore/2)) / 3);
    S.system.ftSignal = btcScore >= 70 ? "BUY" : "WATCH";
    S.system.confidence = Math.round((btcScore + 72) / 2);
    S.assistant.why = "Real public crypto/FX data is blended with ZENTRA risk logic.";
    S.assistant.action = "Use Financial Trade for timing, RiskLens for exposure, Credit for FX pressure.";
    S.assistant.warning = "Public data can be delayed or incomplete; this is not investment advice.";
    S.dataSource = "ZENTRA Real Data API V3 • Public APIs + fallback safe";
  }

  function renderExtra(){
    const src = document.getElementById("data-source");
    if(src) src.textContent = S.dataSource || "ZENTRA fallback data";
    const btc = document.getElementById("m-btc");
    if(btc && S.markets?.BTC) btc.textContent = S.markets.BTC.score;
    const eth = document.getElementById("m-eth");
    if(eth && S.markets?.ETH) eth.textContent = S.markets.ETH.signal;
  }

  async function boot(){
    const status = document.getElementById("data-status");
    if(status) status.textContent = "Loading real public data...";
    try { await loadCrypto(); } catch(e) { console.warn("crypto fallback", e); }
    try { await loadFx(); } catch(e) { console.warn("fx fallback", e); }
    compute();
    renderExtra();
    if(status) status.textContent = "Real Data API V3 active + fallback safe";
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

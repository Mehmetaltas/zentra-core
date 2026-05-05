async function loadJSON(path,fallback={}){try{const r=await fetch(path,{cache:"no-store"});return await r.json()}catch(e){return fallback}}
function money(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})}
function pct(n){return ((Number(n||0))*100).toFixed(2)+"%"}
async function hydrate(){
 const auto=await loadJSON("../zentra-backtest/results/auto_report.json",{});
 const perf=await loadJSON("../zentra-backtest/results/daily_performance.json",{});
 const port=await loadJSON("../zentra-backtest/results/portfolio_risk.json",{allocation:[]});
 document.querySelectorAll("[data-auto-status]").forEach(e=>e.textContent=auto.finalDecision?.status||"NO DATA");
 document.querySelectorAll("[data-primary]").forEach(e=>e.textContent=(auto.finalDecision?.accepted||perf.accepted||[]).join(", ")||"None");
 document.querySelectorAll("[data-rejected]").forEach(e=>e.textContent=(auto.finalDecision?.rejected||perf.rejected||[]).join(", ")||"None");
 document.querySelectorAll("[data-pnl]").forEach(e=>e.textContent=money(port.totalPnl||perf.totalPnl));
 document.querySelectorAll("[data-win]").forEach(e=>e.textContent=pct(port.avgWinRate||perf.avgWinRate));
 document.querySelectorAll("[data-risk]").forEach(e=>e.textContent=port.riskLevel||"UNKNOWN");
 const tbl=document.querySelector("[data-alloc]");
 if(tbl){tbl.innerHTML=(port.allocation||[]).map(a=>`<tr><td>${a.symbol}</td><td>${pct(a.weight)}</td><td>${money(a.testPnl)}</td><td>${pct(a.winRate)}</td><td>${Number(a.profitFactor||0).toFixed(2)}</td></tr>`).join("")}
}
window.addEventListener("load",hydrate);

async function loadJSON(path,fallback={}){try{const r=await fetch(path,{cache:"no-store"});return await r.json()}catch(e){return fallback}}
function money(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})}
function pct(n){return ((Number(n||0))*100).toFixed(2)+"%"}
function safe(v){return v===undefined||v===null?"-":v}

async function initFT(){
  const auto=await loadJSON("../../zentra-backtest/results/auto_report.json",{});
  const perf=await loadJSON("../../zentra-backtest/results/daily_performance.json",{});
  const port=await loadJSON("../../zentra-backtest/results/portfolio_risk.json",{allocation:[]});
  const exec=await loadJSON("../../zentra-backtest/results/execution_simulation.json",{orderPlan:[]});
  const decision=await loadJSON("../../zentra-backtest/results/decision_log.json",{reasons:[]});
  const learning=await loadJSON("../../zentra-backtest/results/learning_memory.json",{results:[]});

  const final=auto.finalDecision || {};
  const accepted=final.accepted || perf.accepted || [];
  const rejected=final.rejected || perf.rejected || [];

  const set=(id,val)=>{const e=document.getElementById(id); if(e)e.textContent=val}

  set("status", final.status || "NO DATA");
  set("primary", accepted.join(", ") || "None");
  set("rejected", rejected.join(", ") || "None");
  set("pnl", money(port.totalPnl || perf.totalPnl));
  set("winrate", pct(port.avgWinRate || perf.avgWinRate));
  set("pf", Number(port.avgProfitFactor || 0).toFixed(2));
  set("risk", port.riskLevel || "UNKNOWN");
  set("exec", exec.mode || "PAPER_ONLY");

  const alloc=document.getElementById("allocation");
  if(alloc){
    alloc.innerHTML=(port.allocation||[]).map(a=>`
      <tr>
        <td><a href="asset-detail/index.html?symbol=${a.symbol}">${a.symbol}</a></td>
        <td>${pct(a.weight)}</td>
        <td>${money(a.testPnl)}</td>
        <td>${pct(a.winRate)}</td>
        <td>${Number(a.profitFactor||0).toFixed(2)}</td>
      </tr>`).join("");
  }

  const autoBox=document.getElementById("auto-json");
  if(autoBox) autoBox.textContent=JSON.stringify({finalDecision:final,portfolio:port,execution:exec},null,2);

  const autopsy=document.getElementById("autopsy");
  if(autopsy){
    autopsy.innerHTML=(learning.results||[]).map(r=>{
      const isAccepted=accepted.includes(r.symbol);
      const t=r.test||{};
      const tr=r.train||{};
      return `<div class="card">
        <h3>${r.symbol} ${isAccepted?'<span class="good">ACCEPTED</span>':'<span class="bad">REJECTED/WATCH</span>'}</h3>
        <p>Test PnL: <b>${money(t.pnl)}</b> · Test WR: <b>${pct(t.winRate)}</b> · PF: <b>${Number(t.profitFactor||0).toFixed(2)}</b></p>
        <p>Train PnL: ${money(tr.pnl)} · Train WR: ${pct(tr.winRate)}</p>
        <p>Risk: ${safe(r.params?.risk)} · MinConfidence: ${safe(r.params?.minConfidence)} · Stop: ${safe(r.params?.stopPct)} · TP: ${safe(r.params?.tpPct)}</p>
      </div>`
    }).join("");
  }

  const orders=document.getElementById("orders");
  if(orders){
    orders.innerHTML=(exec.orderPlan||[]).map(o=>`
      <tr><td>${o.symbol}</td><td>${o.action}</td><td>${pct(o.weight)}</td><td>${o.maxRiskPerAsset}</td><td>${o.executionStatus}</td><td>${o.approvalRequired}</td></tr>
    `).join("");
  }

  const proof=document.getElementById("proof-links");
  if(proof){
    proof.innerHTML=[
      ["Auto Report","../../zentra-backtest/results/auto_report.json"],
      ["Learning Memory","../../zentra-backtest/results/learning_memory.json"],
      ["Portfolio Risk","../../zentra-backtest/results/portfolio_risk.json"],
      ["Execution Simulation","../../zentra-backtest/results/execution_simulation.json"],
      ["Decision Log","../../zentra-backtest/results/decision_log.json"],
      ["Latest HTML Export","../../zentra-backtest/exports/latest-export.html"],
      ["Latest JSON Export","../../zentra-backtest/exports/latest-export.json"]
    ].map(x=>`<p><a href="${x[1]}">${x[0]} →</a></p>`).join("");
  }
}
window.addEventListener("load",initFT);

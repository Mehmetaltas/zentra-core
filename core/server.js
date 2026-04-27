const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const intel = require("./intelligence");
const audit = require("./audit");
const payment = require("./payment");

const PORT = 3000;

const users = {
  admin:{password:"1234",plan:"institutional"},
  user:{password:"1234",plan:"free"}
};

const sessions = {};

function send(res,data){
  res.setHeader("Content-Type","application/json");
  res.end(JSON.stringify(data));
}

function base(symbol){
  const map={
    BTCUSDT:{price:65000,change:0.012,trend:0.004},
    ETHUSDT:{price:3200,change:0.009,trend:0.003},
    XAU:{price:2300,change:0.002,trend:0.001},
    USDTRY:{price:32,change:0.001,trend:0.0005}
  };
  return map[symbol] || map.BTCUSDT;
}

function assetResult(symbol){
  const b=base(symbol);
  const scores=intel.computeScores(b.change,b.trend);
  const decision=intel.decision(scores.risk,scores.mom);
  const exp=intel.explain(scores.risk,scores.vol,scores.mom);

  return {
    symbol,
    price:b.price,
    change:b.change,
    trend:b.trend,
    risk:scores.risk,
    volatility:scores.vol,
    momentum:scores.mom,
    decision,
    explain:exp.human || exp,
    explain_human:exp.human || exp,
    explain_technical:exp.technical || "",
    source:"backend"
  };
}

const server = http.createServer((req,res)=>{
  try{
    const u = new URL(req.url,"http://127.0.0.1");

    if(u.pathname==="/api/test"){
      return send(res,{status:"ok",version:"v10-audit-stable"});
    }

    if(u.pathname==="/api/login" && req.method==="POST"){
      let body="";
      req.on("data",c=>body+=c);
      req.on("end",()=>{
        let p={}; try{p=JSON.parse(body||"{}");}catch{}
        const found=users[p.user];

        if(!found || found.password!==p.password){
          return send(res,{ok:false,error:"invalid_login"});
        }

        const token=Math.random().toString(36).slice(2);
        sessions[token]=p.user;
        return send(res,{ok:true,token,plan:found.plan,user:p.user});
      });
      return;
    }

    if(u.pathname==="/api/risk"){
      const symbol=(u.searchParams.get("symbol")||"BTCUSDT").toUpperCase();
      const result=assetResult(symbol);

      audit.logDecision({
        type:"risk",
        symbol:result.symbol,
        risk:result.risk,
        decision:result.decision,
        source:result.source,
        explain:result.explain_human
      });

      return send(res,result);
    }

    if(u.pathname==="/api/portfolio"){
      const weights={BTCUSDT:40,ETHUSDT:30,XAU:20,USDTRY:10};
      const symbols=Object.keys(weights);

      const assets=symbols.map(s=>{
        const r=assetResult(s);
        return {...r,weight:weights[s]};
      });

      const totalW=assets.reduce((s,a)=>s+a.weight,0)||1;
      const portfolioRisk=Math.floor(
        assets.reduce((s,a)=>s+(a.risk*(a.weight/totalW)),0)
      );

      const decision=portfolioRisk>70?"RISK OFF":portfolioRisk>50?"HEDGE":portfolioRisk>30?"HOLD":"ACCUMULATE";

      const analysis={
        human:`Portföy genel olarak ${portfolioRisk<30?"düşük riskli":"risk içeriyor"}. BTCUSDT portföyde dominant. Dikkat edilmeli.`,
        technical:`Total Risk:${portfolioRisk} Max Asset:BTCUSDT (40%) Assets:4`,
        recommendation:portfolioRisk<30?"Mevcut yapı korunabilir.":"Risk azaltma değerlendirilmeli."
      };

      audit.logDecision({
        type:"portfolio",
        portfolioRisk,
        decision,
        source:"backend"
      });

      return send(res,{assets,portfolioRisk,decision,analysis,source:"backend"});
    }

    
  if(u.pathname==="/api/upgrade"){
    const token=u.searchParams.get("token");
    const plan=u.searchParams.get("plan")||"pro";
    const username=sessions[token];

    if(!username){
      return send(res,{ok:false,error:"unauthorized"});
    }

    const pay = payment.simulatePayment(username, plan);

    if(pay.ok){
      // plan güncelle
      users[username].plan = plan;

      // audit
      audit.logDecision({
        type:"payment",
        user: username,
        plan: plan,
        payment_id: pay.payment_id
      });

      return send(res,{ok:true,plan,paid:true});
    }

    return send(res,{ok:false});
  }

  if(u.pathname==="/api/audit"){
      return send(res,{logs:audit.getLogs()});
    }

    if(u.pathname==="/" || u.pathname==="/index.html" || u.pathname==="/cockpit.html"){
      const file=path.join(process.cwd(),"cockpit.html");
      res.setHeader("Content-Type","text/html; charset=utf-8");
      return fs.createReadStream(file).pipe(res);
    }

    res.statusCode=404;
    res.end("Not found");

  }catch(e){
    res.statusCode=500;
    return send(res,{error:e.message});
  }
});

server.listen(PORT,"0.0.0.0",()=>{
  console.log("ZENTRA v10 audit stable running: http://127.0.0.1:"+PORT);
});

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const intel = require("./intelligence");
const portfolioIntel = require("./portfolio-intel");
const actionLayer = require("./action");
const db = require("./db");
const userContext = require("./user-context");

const PORT = 3000;

const users = {
  admin: { password: "1234", plan: "institutional" },
  user: { password: "1234", plan: "free" }
};

const sessions = {};

function send(res,data){
  res.setHeader("Content-Type","application/json");
  res.end(JSON.stringify(data));
}

function base(symbol){
  const map = {
    BTCUSDT:{price:65000,change:0.012,trend:0.004},
    ETHUSDT:{price:3200,change:0.009,trend:0.003},
    XAU:{price:2300,change:0.002,trend:0.001},
    USDTRY:{price:32,change:0.001,trend:0.0005}
  };
  return map[symbol] || map.BTCUSDT;
}

function authenticatedPlan(token){
  const username = sessions[token];
  if(!username) return null;
  return users[username].plan;
}

const server = http.createServer((req,res)=>{
  const u = new URL(req.url,"http://127.0.0.1");

  if(u.pathname==="/api/test"){
    return send(res,{status:"ok",version:"v10-full-cockpit-merge"});
  }

  if(u.pathname==="/api/login" && req.method==="POST"){
    let body="";
    req.on("data",c=>body+=c);
    req.on("end",()=>{
      let p={};
      try{p=JSON.parse(body||"{}");}catch{}
      const f=users[p.user];

      if(!f || f.password!==p.password){
        return send(res,{ok:false,error:"invalid_login"});
      }

      const token=Math.random().toString(36).slice(2);
      sessions[token]=p.user;

      
db.saveUser(p.user,{plan:f.plan});
return send(res,{ok:true,token,plan:f.plan,user:p.user});

    });
    return;
  }

  if(u.pathname==="/api/upgrade"){
    const token=u.searchParams.get("token");
    const plan=u.searchParams.get("plan") || "pro";
    const username=sessions[token];

    if(!username){
      return send(res,{ok:false,error:"unauthorized"});
    }

    users[username].plan=plan;
    return send(res,{ok:true,plan});
  }

  if(u.pathname==="/api/risk"){
    const symbol=(u.searchParams.get("symbol")||"BTCUSDT").toUpperCase();
    const b=base(symbol);
    const scores=intel.computeScores(b.change,b.trend);
    
const dec=intel.decision(scores.risk,scores.mom);

const act = actionLayer.action(scores.risk, portfolioRisk);

// demo context (sonra DB olacak)
const context = {
  risk: "medium",
  horizon: "mid"
};

const personalized = userContext.personalize(act, context);


    const exp=intel.explain(scores.risk,scores.vol,scores.mom);

    return send(res,{
      symbol,
      price:b.price,
      change:b.change,
      trend:b.trend,
      risk:scores.risk,
      volatility:scores.vol,
      momentum:scores.mom,
      decision:dec,
      explain: exp.human,
      explain_human: exp.human,
      explain_technical: exp.technical,
      

action: act,
action_personal: personalized,

source:"backend"

    });
  }

  
  if(u.pathname==="/api/save-portfolio"){
    const token=u.searchParams.get("token");
    const username=sessions[token];

    if(!username){
      return send(res,{ok:false,error:"unauthorized"});
    }

    let body="";
    req.on("data",c=>body+=c);
    req.on("end",()=>{
      try{
        const weights = JSON.parse(body||"{}");
        db.savePortfolio(username,weights);
        return send(res,{ok:true});
      }catch{
        return send(res,{ok:false});
      }
    });
    return;
  }

  if(u.pathname==="/api/portfolio"){
    const symbols=["BTCUSDT","ETHUSDT","XAU","USDTRY"];
    const weights={BTCUSDT:40,ETHUSDT:30,XAU:20,USDTRY:10};
    const assets=symbols.map(symbol=>{
      const b=base(symbol);
      const scores=intel.computeScores(b.change,b.trend);
      return {
        symbol,
        price:b.price,
        risk:scores.risk,
        weight:weights[symbol],
        decision:intel.decision(scores.risk,scores.mom)
      };
    });

    const totalW=assets.reduce((s,a)=>s+a.weight,0)||1;
    const portfolioRisk=Math.floor(
      assets.reduce((s,a)=>s+(a.risk*(a.weight/totalW)),0)
    );

    const scores={risk:portfolioRisk,mom:0.2};
    const decision=intel.decision(portfolioRisk,0.2);

    
const analysis = portfolioIntel.analyzePortfolio(assets);

return send(res,{
  assets,
  portfolioRisk,
  decision,
  analysis,
  

action: act,
action_personal: personalized,

source:"backend"

});

  }

  if(u.pathname==="/" || u.pathname==="/index.html" || u.pathname==="/cockpit.html"){
    const file=path.join(process.cwd(),"cockpit.html");
    res.setHeader("Content-Type","text/html; charset=utf-8");
    return fs.createReadStream(file).pipe(res);
  }

  res.statusCode=404;
  res.end("Not found");
});

server.listen(PORT,"0.0.0.0",()=>{
  console.log("ZENTRA v10 full cockpit merge running: http://127.0.0.1:"+PORT);
});

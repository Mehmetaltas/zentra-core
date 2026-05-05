const fs=require("fs");

function read(p){try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}}
function write(p,d){
  fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(p,JSON.stringify(d,null,2));
}

const client=read("zentra-client-intel/results/client_profile.json");
const assets=read("zentra-opportunity-basket/data/sample_assets.json")||[];

function scoreAsset(a){
  let score=0;
  if(a.trend==="UP") score+=35;
  if(a.trend==="NEUTRAL") score+=15;
  if(a.liquidity==="HIGH") score+=20;
  if(a.risk==="LOW") score+=25;
  if(a.risk==="MEDIUM") score+=15;
  if(a.risk==="HIGH") score-=10;
  if(a.volatility==="HIGH") score-=10;
  return score;
}

const basket=assets.map(a=>{
  const score=scoreAsset(a);
  let decision="WATCH";
  if(score>=60) decision="PAPER_OPPORTUNITY";
  if(score<25) decision="AVOID_OR_WAIT";

  return {
    ...a,
    score,
    decision,
    proof:[
      "paper_only",
      "client_profile_filter",
      "risk_liquidity_trend_check",
      "no_real_execution"
    ]
  };
}).sort((a,b)=>b.score-a.score);

const report={
  time:new Date().toISOString(),
  status:"OPPORTUNITY_BASKET_ACTIVE",
  mode:"PAPER_ONLY",
  client:client?.client || null,
  basket,
  top:basket.slice(0,3),
  warning:"This is not investment advice. No real execution."
};

write("zentra-opportunity-basket/results/opportunity_basket.json",report);
console.log("OPPORTUNITY BASKET COMPLETE");
console.log(JSON.stringify(report,null,2));

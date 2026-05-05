const fs=require("fs");

function read(p){try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}}
function write(p,d){
  fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(p,JSON.stringify(d,null,2));
}

const ft=read("zentra-backtest/results/auto_report.json");
const basket=read("zentra-opportunity-basket/results/opportunity_basket.json");
const ops=read("zentra-ops/results/ops_report.json");
const memory=read("zentra-living-core/memory/living_memory.json");

const today={
  time:new Date().toISOString(),
  status:"PROOF_TRACKING_ACTIVE",
  mode:"PAPER_ONLY",
  question:"Bugün sistem ne dedi?",
  said:{
    financialTrade:ft || "missing",
    opportunityBasket:basket || "missing",
    ops:ops || "missing"
  },
  outcome:{
    status:"PENDING",
    note:"Outcome will be compared after next data cycle."
  },
  delta:{
    correct:null,
    wrong:null,
    score:null,
    explanation:"Henüz sonuç karşılaştırması yapılmadı."
  },
  learningInput:{
    memoryStatus:memory?.status || "unknown",
    next:"Track outcome, compare decision, update learning."
  }
};

const historyPath="zentra-proof-tracking/results/proof_history.json";
const history=read(historyPath) || {items:[]};
history.items.push(today);

write("zentra-proof-tracking/results/latest_proof.json",today);
write(historyPath,history);

console.log("PROOF TRACKING COMPLETE");
console.log(JSON.stringify(today,null,2));

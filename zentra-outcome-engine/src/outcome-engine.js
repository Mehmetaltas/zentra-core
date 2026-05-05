const fs=require("fs");

function read(p){try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}}
function write(p,d){
  fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(p,JSON.stringify(d,null,2));
}

const basket=read("zentra-opportunity-basket/results/opportunity_basket.json");
const outcomes=read("zentra-outcome-engine/data/sample_outcomes.json")||{};
const memoryPath="zentra-living-core/memory/living_memory.json";
const memory=read(memoryPath)||{learned:[]};

if(!basket || !basket.basket){
  console.log("NO BASKET FOUND");
  process.exit(0);
}

function evaluate(item){
  const out=outcomes[item.symbol]||{priceChangePct:0};
  let correct=null;
  let delta=out.priceChangePct;

  if(item.decision==="PAPER_OPPORTUNITY"){
    correct = delta>0;
  } else if(item.decision==="AVOID_OR_WAIT"){
    correct = delta<=0;
  } else {
    correct = null; // WATCH
  }

  let score=0;
  if(correct===true) score=1;
  if(correct===false) score=-1;

  return {
    symbol:item.symbol,
    decision:item.decision,
    priceChangePct:delta,
    correct,
    score
  };
}

const evaluations=basket.basket.map(evaluate);

const totalScore=evaluations.reduce((a,b)=>a+b.score,0);
const accuracy = evaluations.filter(x=>x.correct!==null).length
  ? (evaluations.filter(x=>x.correct===true).length / evaluations.filter(x=>x.correct!==null).length)
  : null;

const result={
  time:new Date().toISOString(),
  status:"OUTCOME_EVALUATED",
  mode:"PAPER_ONLY",
  evaluations,
  summary:{
    totalScore,
    accuracy
  }
};

write("zentra-outcome-engine/results/outcome_result.json",result);

# 🔹 Learning update
const learningEvent={
  time:result.time,
  source:"OUTCOME_ENGINE",
  summary:{
    totalScore,
    accuracy
  },
  note:"Decisions evaluated against outcome data"
};

memory.learned = memory.learned || [];
memory.learned.push(learningEvent);

write(memoryPath,memory);

console.log("OUTCOME ENGINE COMPLETE");
console.log(JSON.stringify(result,null,2));

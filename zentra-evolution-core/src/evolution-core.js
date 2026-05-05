const fs = require("fs");
const https = require("https");

const BOT_TOKEN = "8590764340:AAFjjvfespCcl6gRw6uTXgQLnngDpmRBAZQ";
const CHAT_ID = "798597064";

function read(p){
  return JSON.parse(fs.readFileSync(p,"utf8"));
}
function write(p,d){
  fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(p,JSON.stringify(d,null,2));
}
function tg(text){
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}`;
  https.get(url,res=>res.on("data",()=>{})).on("error",()=>{});
}

const config = read("zentra-evolution-core/data/evolution_sources.json");

const knowledge = [];
const equipment = [];
const productization = [];
const future = [];

for(const s of config.sources){
  const item = {
    source: s.source,
    domain: s.domain,
    purpose: s.purpose,
    productize: s.productize,
    reason: s.reason,
    assignedLayer:
      s.productize
        ? "ZENTRA Academia AI → ZENTRA Intel AI → Intel/Gate Market"
        : "ZENTRA General AI / ZENTRA Academia AI memory"
  };

  if(s.purpose === "knowledge_absorption") knowledge.push(item);
  if(s.purpose === "equipment") equipment.push(item);
  if(s.purpose === "equipment_and_productization") productization.push(item);
  if(s.domain === "Future Expansion") future.push(item);
}

const report = {
  time: new Date().toISOString(),
  status: "CONTROLLED_EVOLUTION_ACTIVE",
  ecosystem: config.ecosystem,
  rule: "Not every decomposed capability becomes a product. First absorb knowledge, then classify equipment, then productize only what fits ZENTRA strategy.",
  companies: config.ai_companies,
  markets: config.markets,
  currentProductLines: config.current_product_lines,
  knowledgeAbsorption: knowledge,
  equipmentOnly: equipment,
  productizationCandidates: productization,
  futureExpansionMemory: future,
  nextOrder: [
    "A: Fix and reconnect Financial Trade proof as the heart",
    "C: Strengthen Equipment → Product → Agent binding nervous system",
    "B: Expand Academia AI decomposition after core is stable"
  ]
};

write("zentra-evolution-core/results/evolution_strategy.json", report);
fs.appendFileSync("zentra-evolution-core/logs/evolution.log", new Date().toISOString()+" CONTROLLED EVOLUTION RUN\n");

const msg = `ZENTRA CONTROLLED EVOLUTION

Status: ACTIVE

Rule:
Not everything becomes product.

Knowledge: ${knowledge.length}
Equipment only: ${equipment.length}
Product candidates: ${productization.length}
Future memory: ${future.length}

Order:
1 A - Financial Trade heart
2 C - Product/Agent nervous system
3 B - Academia expansion

Report:
zentra-evolution-core/results/evolution_strategy.json`;

tg(msg);

console.log("ZENTRA CONTROLLED EVOLUTION COMPLETE");
console.log(JSON.stringify(report,null,2));

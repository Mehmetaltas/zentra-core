const fs = require("fs");
const https = require("https");

const BOT_TOKEN = "8590764340:AAF...";
const CHAT_ID = "798597064";

function read(p){
  try { return JSON.parse(fs.readFileSync(p,"utf8")); }
  catch { return null; }
}

function write(p,d){
  fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(p,JSON.stringify(d,null,2));
}

function tg(msg){
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`;
  https.get(url);
}

const radar = read("zentra-competitor-radar/results/gap_tasks.json") || [];
const evolution = read("zentra-evolution-core/results/evolution_strategy.json") || {};
const proof = read("zentra-living-core/proof/latest_proof_registry.json") || {};

const tasks = [];

// 🔹 Radar → Task
radar.slice(0,10).forEach((t,i)=>{
  tasks.push({
    id: "AUTO-"+(i+1),
    title: t.name,
    source: "RADAR",
    priority: t.priority,
    type: t.productizationRule,
    action: t.action,
    status: "OPEN"
  });
});

// 🔹 Proof boşsa kritik task
if(!proof.financialTrade){
  tasks.push({
    id: "CRITICAL-FT",
    title: "Financial Trade Report Missing",
    source: "PROOF",
    priority: "HIGH",
    type: "CORE",
    action: "Reconnect Financial Trade engine",
    status: "OPEN"
  });
}


// 🔹 Product Discovery → Task
const productDiscovery = read("zentra-product-discovery/results/product_discovery_report.json") || {};
(productDiscovery.generatedTasks || []).forEach((t,i)=>{
  tasks.push({
    id: t.id || ("PD-"+(i+1)),
    title: t.title,
    source: "PRODUCT_DISCOVERY",
    priority: t.priority || "MEDIUM",
    type: t.type || "PRODUCT_CANDIDATE",
    action: t.action,
    status: "OPEN"
  });
});

// 🔹 Evolution → yön task
(evolution.nextOrder || []).forEach((t,i)=>{
  tasks.push({
    id: "EV-"+(i+1),
    title: t,
    source: "EVOLUTION",
    priority: "MEDIUM",
    type: "STRATEGY",
    action: t,
    status: "OPEN"
  });
});

const backlog = {
  time: new Date().toISOString(),
  status: "TASK_ENGINE_ACTIVE",
  total: tasks.length,
  tasks
};

write("zentra-task-engine/results/backlog.json", backlog);

fs.appendFileSync("zentra-task-engine/logs/task.log", new Date().toISOString()+" TASK RUN\n");

// 🔥 Telegram özet
const top = tasks.slice(0,5).map(t=>"• "+t.title).join("\n");

tg(`ZENTRA TASK ENGINE

Top Tasks:
${top}

Total: ${tasks.length}

Backlog:
zentra-task-engine/results/backlog.json`);

console.log("TASK ENGINE COMPLETE");
console.log(JSON.stringify(backlog,null,2));

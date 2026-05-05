const fs=require("fs");
const https=require("https");

const BOT_TOKEN="8590764340:AAFjjvfespCcl6gRw6uTXgQLnngDpmRBAZQ";
const CHAT_ID="798597064";

function read(p){return JSON.parse(fs.readFileSync(p,"utf8"))}
function write(p,d){fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}
function tg(text){
 const url=`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}`;
 https.get(url,res=>res.on("data",()=>{})).on("error",()=>{});
}

const lib=read("zentra-competitor-radar/data/equipment_library.json");
const cur=read("zentra-competitor-radar/data/zentra_current_capability.json");

const active=[];
const partial=[];
const gaps=[];

for(const e of lib.equipment){
 const state=cur[e.id]||"missing";
 const row={...e,state};
 if(state==="active") active.push(row);
 else if(state==="partial") partial.push(row);
 else gaps.push(row);
}

const tasks=gaps.concat(partial).map((x,i)=>({
 taskId:`GAP-${String(i+1).padStart(3,"0")}`,
 equipmentId:x.id,
 name:x.name,
 category:x.category,
 state:x.state,
 priority:x.required?"HIGH":"MEDIUM",
 productizationRule:x.category==="zentra_moat" || x.category==="financial_trade" || x.category==="customer_ops" ? "PRODUCT_CANDIDATE" : "KNOWLEDGE_OR_INFRASTRUCTURE",
 action:x.state==="missing"
   ? `Create or absorb ${x.name}.`
   : `Upgrade ${x.name} from partial to active.`
}));

const report={
 time:new Date().toISOString(),
 status:"RADAR_ACTIVE",
 rule:"Radar detects gaps. Productization is decided by Controlled Evolution Core, not automatically.",
 activeCount:active.length,
 partialCount:partial.length,
 gapCount:gaps.length,
 active,partial,gaps,tasks
};

write("zentra-competitor-radar/results/radar_report.json",report);
write("zentra-competitor-radar/results/gap_tasks.json",tasks);
fs.appendFileSync("zentra-competitor-radar/logs/radar.log",new Date().toISOString()+" RADAR RUN\n");

const top=tasks.slice(0,8).map(t=>`- ${t.name} [${t.state}]`).join("\n");

const msg=`ZENTRA EQUIPMENT RADAR

Status: ACTIVE
Active: ${active.length}
Partial: ${partial.length}
Missing: ${gaps.length}

Top gaps:
${top}

Rule:
Not every gap becomes a product.

Report:
zentra-competitor-radar/results/radar_report.json`;

tg(msg);
console.log("ZENTRA EQUIPMENT RADAR COMPLETE");
console.log(JSON.stringify(report,null,2));

const fs=require("fs");
function read(p){try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}}
function write(p,d){fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}

const master=read("zentra-master-state/results/master_state.json")||{};
const proof=read("zentra-proof-tracking/results/latest_proof.json")||null;
const outcome=read("zentra-outcome-engine/results/outcome_result.json")||null;
const radar=read("zentra-competitor-radar/results/radar_report.json")||null;
const roadmap=read("zentra-smart-task-core/results/smart_roadmap.json")||null;

const closure=[
  {layer:"Financial Trade", status: master.financialTrade?"ACTIVE":"MISSING", next:"keep proof/outcome loop running"},
  {layer:"Proof Tracking", status: proof?"ACTIVE":"MISSING", next:"daily history + score"},
  {layer:"Outcome Engine", status: outcome?"ACTIVE":"MISSING", next:"compare decisions with next cycle"},
  {layer:"Ops Banking/Tasarruf/Islamic", status: master.ops?"ACTIVE":"MISSING", next:"expand sample/historical datasets"},
  {layer:"Living Core", status: master.living?"ACTIVE":"MISSING", next:"memory + agents continue"},
  {layer:"Radar/Gaps", status: radar?"ACTIVE":"MISSING", next:"turn gaps into tasks"},
  {layer:"Smart Roadmap", status: roadmap?"ACTIVE":"MISSING", next:"rank tasks for founder"},
  {layer:"Public Site", status:"ACTIVE", next:"do not change without approval"},
  {layer:"Founder Panel", status:"LOCAL_PRIVATE", next:"keep private"},
  {layer:"Legal/Payment/Provider", status:"APPROVAL_REQUIRED", next:"do not auto-execute"}
];

const report={
  time:new Date().toISOString(),
  status:"ZENTRA_CLOSURE_CORE_ACTIVE",
  founderMode:"YOU_CAN_PAUSE",
  rule:"System continues safe local automation. Critical public/legal/payment/provider/execution actions wait for Founder approval.",
  closure,
  autoLoop:[
    "financial trade run",
    "opportunity basket",
    "proof tracking",
    "outcome comparison",
    "ops tests",
    "radar",
    "evolution",
    "task generation",
    "auto safe preparation",
    "living memory update",
    "master state update"
  ]
};

write("zentra-closure-core/results/closure_report.json",report);
fs.appendFileSync("zentra-closure-core/logs/closure.log",new Date().toISOString()+" CLOSURE RUN\n");
console.log("ZENTRA CLOSURE CORE COMPLETE");
console.log(JSON.stringify(report,null,2));

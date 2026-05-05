const fs = require("fs");
const https = require("https");

const BOT_TOKEN = "8590764340:AAFjjvfespCcl6gRw6uTXgQLnngDpmRBAZQ";
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
  const url=`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`;
  https.get(url,res=>res.on("data",()=>{})).on("error",()=>{});
}

const marketIntel = read("zentra-learning-core/results/market_intel.json") || {insights:{pains:[],needs:[],opportunities:[]}};
const radarTasks = read("zentra-competitor-radar/results/gap_tasks.json") || [];
const smartRoadmap = read("zentra-smart-task-core/results/smart_roadmap.json") || {thisWeek:[]};

const opportunities = marketIntel.insights?.opportunities || [];

const products = opportunities.map((o,i)=>{
  let productName = "ZENTRA Product Opportunity";
  let route = "General";

  if(o.toLowerCase().includes("karar") || o.toLowerCase().includes("decision")){
    productName = "Decision Clarity Pack";
    route = "Gate Market";
  }
  if(o.toLowerCase().includes("ucuz") || o.toLowerCase().includes("sade")){
    productName = "Intel Lite Decision Pack";
    route = "Intel Market";
  }
  if(o.toLowerCase().includes("risk")){
    productName = "Risk Proof Pack";
    route = "Gate Market";
  }

  return {
    id:`DISC-${String(i+1).padStart(3,"0")}`,
    source:"MARKET_INTEL",
    opportunity:o,
    productName,
    route,
    status:"PRODUCT_CANDIDATE",
    zentraRule:"Raw insight is not copied directly; it is processed, improved and converted into ZENTRA format.",
    requiredProcessing:[
      "check market need",
      "check competitor weakness",
      "match with ZENTRA gap",
      "improve and expand",
      "decide Intel Market or Gate Market route",
      "create proof / report / assistant flow"
    ]
  };
});

const productTasks = products.map((p,i)=>({
  id:`PRODUCT-TASK-${String(i+1).padStart(3,"0")}`,
  title:`Build ${p.productName}`,
  source:"PRODUCT_DISCOVERY",
  priority:p.route==="Gate Market" ? "HIGH" : "MEDIUM",
  type:"PRODUCT_CANDIDATE",
  route:p.route,
  action:`Create product shell, proof logic, market copy and assistant guidance for ${p.productName}`,
  status:"OPEN",
  founderFriendlyExplanation:
    `${p.productName}: piyasadan gelen ihtiyaca göre ürün adayı. Önce işlenecek, sonra Intel/Gate rotasına alınacak.`
}));

const roadmap = {
  time:new Date().toISOString(),
  status:"PRODUCT_DISCOVERY_ACTIVE",
  marketIntelSummary:{
    pains: marketIntel.insights?.pains || [],
    needs: marketIntel.insights?.needs || [],
    opportunities
  },
  productCandidates:products,
  generatedTasks:productTasks,
  combinedRoadmap:[
    ...productTasks,
    ...(smartRoadmap.thisWeek || []),
    ...radarTasks.slice(0,5)
  ],
  rule:[
    "Ham bilgi saklanır.",
    "Ürünleşecekse önce işlenir.",
    "Intel Market = ZENTRA’sız ürün.",
    "Gate Market = ZENTRA elbisesi giydirilmiş ürün.",
    "Founder onayı olmadan public launch yapılmaz."
  ]
};

write("zentra-product-discovery/results/product_discovery_report.json", roadmap);
write("zentra-product-discovery/products/product_candidates.json", products);
write("zentra-product-discovery/roadmap/product_roadmap.json", roadmap.combinedRoadmap);
fs.appendFileSync("zentra-product-discovery/logs/product-discovery.log",new Date().toISOString()+" PRODUCT DISCOVERY RUN\n");

const msg=`ZENTRA PRODUCT DISCOVERY

Status: ACTIVE

Market opportunities: ${opportunities.length}
Product candidates: ${products.length}
Generated tasks: ${productTasks.length}

Top products:
${products.slice(0,5).map(x=>"- "+x.productName+" → "+x.route).join("\n") || "None"}

Report:
zentra-product-discovery/results/product_discovery_report.json`;

tg(msg);

console.log("ZENTRA PRODUCT DISCOVERY COMPLETE");
console.log(JSON.stringify(roadmap,null,2));

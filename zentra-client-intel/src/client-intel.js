const fs=require("fs");

function write(p,d){
  fs.mkdirSync(p.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(p,JSON.stringify(d,null,2));
}

const sampleClient={
  id:"CLIENT-PAPER-001",
  capitalBand:"LOW_MEDIUM",
  intent:"learn_and_track_opportunities",
  riskTolerance:"MEDIUM",
  timeHorizon:"SWING",
  psychology:{
    panicRisk:"MEDIUM",
    patience:"MEDIUM",
    experience:"BEGINNER_INTERMEDIATE"
  },
  restrictions:[
    "paper_only",
    "no_personal_investment_advice",
    "no_real_execution"
  ]
};

const profile={
  time:new Date().toISOString(),
  status:"CLIENT_INTEL_ACTIVE",
  mode:"PAPER_ONLY_SUITABILITY_SUPPORT",
  client:sampleClient,
  output:{
    suitableFlow:"education + opportunity tracking + proof report",
    assistantRole:"ask, understand, route, explain, support",
    blockedActions:["real_order","personal_advice","broker_execution"]
  }
};

write("zentra-client-intel/results/client_profile.json",profile);
console.log("CLIENT INTEL COMPLETE");
console.log(JSON.stringify(profile,null,2));

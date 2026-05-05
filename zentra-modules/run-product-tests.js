const fs=require("fs");
const {save,score}=require("./shared/product-engine");

const modules=["banking","tasarruf","islamic"];
const final={time:new Date().toISOString(),mode:"LICENSE_READY_PAPER_ONLY",realExecution:false,modules:{}};

for(const m of modules){
  const data=JSON.parse(fs.readFileSync(`zentra-modules/${m}/data/sample.json`,"utf8"));
  const results=score(data);
  const accepted=results.filter(x=>x.status==="PASS").map(x=>x.id);
  const review=results.filter(x=>x.status==="REVIEW").map(x=>x.id);
  const blocked=results.filter(x=>x.status==="BLOCK").map(x=>x.id);

  const proof={
    module:m,
    time:new Date().toISOString(),
    realExecution:false,
    licensedIntegration:false,
    status:"TESTED_WITH_SAMPLE_DATA",
    accepted,review,blocked,results
  };

  save(`zentra-modules/${m}/results/proof.json`,proof);
  final.modules[m]=proof;
}

save("zentra-modules/results-master.json",final);
console.log("ZENTRA BANKING / TASARRUF / ISLAMIC TEST COMPLETE");
console.log(JSON.stringify(final,null,2));

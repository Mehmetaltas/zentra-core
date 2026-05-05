const fs=require("fs");

function save(path,data){
  fs.mkdirSync(path.split("/").slice(0,-1).join("/"),{recursive:true});
  fs.writeFileSync(path,JSON.stringify(data,null,2));
}

function score(items){
  return items.map(x=>{
    let risk=0, proof=[], status="REVIEW";
    for(const k of Object.keys(x.signals||{})){
      const v=x.signals[k];
      if(v==="HIGH") risk+=25;
      if(v==="MEDIUM") risk+=12;
      if(v==="LOW") risk+=3;
      proof.push({signal:k,value:v});
    }
    if(risk<25) status="PASS";
    if(risk>=55) status="BLOCK";
    return {...x,riskScore:risk,status,proof};
  });
}

module.exports={save,score};

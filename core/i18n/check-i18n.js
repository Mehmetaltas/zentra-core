const fs = require("fs");
const path = require("path");
const { validateEntry } = require("./i18n-engine");

const file = path.join(__dirname, "../../data/i18n/core-copy.json");
const data = JSON.parse(fs.readFileSync(file,"utf8"));

let failed = false;

for(const [key,value] of Object.entries(data)){
  const v = validateEntry(value);
  if(!v.ok){
    failed = true;
    console.log("MISSING:", key, v.missingActive.join(","));
  }
}

if(failed){
  process.exit(1);
}

console.log("I18N OK: active languages complete");

const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../data/audit-log.json");

function readLog(){
  try{return JSON.parse(fs.readFileSync(LOG_FILE,"utf8"));}catch{return [];}
}

function writeLog(log){
  fs.writeFileSync(LOG_FILE, JSON.stringify(log,null,2));
}

function logDecision(entry){
  const log = readLog();
  log.push({timestamp:Date.now(), ...entry});
  if(log.length>500) log.shift();
  writeLog(log);
}

function getLogs(){return readLog();}

module.exports={logDecision,getLogs};

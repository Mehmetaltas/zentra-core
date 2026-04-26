const http = require("http");
const { URL } = require("url");

const PORT = 3000;

// basit user
const users = {
  "admin": {password:"1234", plan:"institutional"},
  "user":  {password:"1234", plan:"free"}
};

const sessions = {};

function send(res,data){
  res.setHeader("Content-Type","application/json");
  res.end(JSON.stringify(data));
}

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function computeRisk(change,trend){
  const vol=clamp(Math.abs(change)*8,0,1);
  const tr=clamp(Math.abs(trend)*50,0,1);
  return Math.floor((vol*0.6+tr*0.4)*100);
}

function base(symbol){
  if(symbol==="BTCUSDT") return {price:65000,change:0.012,trend:0.004};
  if(symbol==="ETHUSDT") return {price:3200, change:0.009,trend:0.003};
  if(symbol==="XAU")     return {price:2300, change:0.002,trend:0.001};
  if(symbol==="USDTRY")  return {price:32,   change:0.001,trend:0.0005};
  return {price:100,change:0.005,trend:0.002};
}

const server = http.createServer((req,res)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization");
  if(req.method==="OPTIONS"){
    res.statusCode=204;
    return res.end();
  }

  const u = new URL(req.url,"http://127.0.0.1");

  // health
  if(u.pathname==="/api/test") return send(res,{ok:true});

  // login
  if(u.pathname==="/api/login" && req.method==="POST"){
    let body="";
    req.on("data",c=>body+=c);
    req.on("end",()=>{
      let parsed={};
      try{ parsed=JSON.parse(body||"{}"); }catch(e){}
      const {user,password} = parsed;

      if(users[user] && users[user].password===password){
        const token = Math.random().toString(36).slice(2);
        sessions[token]=user;
        return send(res,{ok:true, token, plan:users[user].plan});
      }
      return send(res,{ok:false, error:"invalid"});
    });
    return;
  }

  // risk
  if(u.pathname==="/api/risk"){
    const symbol = (u.searchParams.get("symbol")||"BTCUSDT").toUpperCase();
    const b = base(symbol);
    const risk = computeRisk(b.change,b.trend);
    return send(res,{
      symbol,
      price: b.price,
      change: b.change,
      trend: b.trend,
      risk,
      decision: risk>70?"RISK OFF":risk>50?"HEDGE":risk>30?"HOLD":"ACCUMULATE",
      source:"backend"
    });
  }

  send(res,{ok:true});
});

server.listen(PORT,"0.0.0.0",()=>{
  console.log("ZENTRA backend v8 OK on 0.0.0.0:"+PORT);
});

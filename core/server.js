const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "./data.json";

function loadDB(){
  try { return JSON.parse(fs.readFileSync(DB_FILE)); }
  catch { return { users: [], sessions: [], actions: [], payments: [] }; }
}
function saveDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function id(){ return crypto.randomUUID(); }
function token(){ return crypto.randomBytes(24).toString("hex"); }

function ensureDB(){
  const db = loadDB();
  db.users ||= [];
  db.sessions ||= [];
  db.actions ||= [];
  db.payments ||= [];
  if(!db.users.find(u => u.id === "agent-001")){
    db.users.push({
      id:"agent-001",
      email:"agent@zentra.local",
      name:"ZENTRA_AGENT",
      plan:"expert",
      role:"agent",
      created_at:new Date().toISOString()
    });
  }
  saveDB(db);
}
ensureDB();

function userFromToken(req){
  const auth = req.headers.authorization || "";
  const t = auth.replace("Bearer ","").trim();
  const db = loadDB();
  const s = db.sessions.find(x => x.token === t);
  if(!s) return null;
  return db.users.find(u => u.id === s.user_id) || null;
}

const PRODUCTS = {
  trade: { name:"Financial Trade", minPlan:"core" },
  risk: { name:"Risk Intelligence", minPlan:"core" },
  credit: { name:"Credit Intelligence", minPlan:"core" },
  portfolio: { name:"Portfolio Intelligence", minPlan:"expert" },
  contract: { name:"Contract Protection", minPlan:"core" },
  sme: { name:"SME Risk / Cash Stress", minPlan:"core" }
};

const PLAN_RANK = { free:0, core:1, expert:2, institutional:3 };
function allowed(user, product){
  const p = PRODUCTS[product] || PRODUCTS.trade;
  return (PLAN_RANK[user.plan] || 0) >= (PLAN_RANK[p.minPlan] || 0);
}

app.post("/login", (req,res)=>{
  const { email, name } = req.body || {};
  if(!email) return res.status(400).json({ ok:false, error:"email_required" });

  const db = loadDB();
  let user = db.users.find(u => u.email === email);
  if(!user){
    user = {
      id:id(),
      email,
      name:name || email.split("@")[0],
      plan:"free",
      role:"user",
      created_at:new Date().toISOString()
    };
    db.users.push(user);
  }

  const s = { token:token(), user_id:user.id, created_at:new Date().toISOString() };
  db.sessions.push(s);
  saveDB(db);

  res.json({ ok:true, user, token:s.token });
});

app.get("/me", (req,res)=>{
  const user = userFromToken(req);
  if(!user) return res.status(401).json({ ok:false, error:"not_logged_in" });
  res.json({ ok:true, user });
});

app.get("/products", (req,res)=>{
  res.json({ ok:true, products:PRODUCTS });
});

app.post("/payment/request", (req,res)=>{
  const user = userFromToken(req);
  if(!user) return res.status(401).json({ ok:false, error:"not_logged_in" });

  const { plan="core" } = req.body || {};
  const db = loadDB();

  const payment = {
    id:id(),
    user_id:user.id,
    plan,
    status:"pending_manual_payment",
    note:"Payment provider not connected yet. Manual/Stripe/iyzico/PayTR integration required.",
    created_at:new Date().toISOString()
  };

  db.payments.push(payment);
  saveDB(db);
  res.json({ ok:true, payment });
});

app.post("/admin/activate-plan", (req,res)=>{
  const { email, plan="core", admin_key } = req.body || {};
  if(admin_key !== "ZENTRA_ADMIN_LOCAL") return res.status(403).json({ ok:false, error:"forbidden" });

  const db = loadDB();
  const user = db.users.find(u => u.email === email);
  if(!user) return res.status(404).json({ ok:false, error:"user_not_found" });

  user.plan = plan;
  saveDB(db);
  res.json({ ok:true, user });
});

function buildDecision(product, input, live){
  const asset = input?.asset || input?.company || "ZENTRA_CASE";
  const marketRisk = live?.marketRisk ?? 64;
  const fxPressure = live?.fxPressure ?? 55;
  const risk = Math.min(95, Math.max(35, marketRisk + (product === "credit" ? 8 : 0)));

  const base = {
    product,
    asset,
    risk,
    signal: risk > 80 ? "PROTECT" : risk > 68 ? "WATCH" : "CONTROLLED",
    confidence: risk > 80 ? 72 : 78,
    data_source: live?.source || "fallback"
  };

  const packs = {
    trade: {
      decision: risk > 80 ? "NO FULL ENTRY / HEDGE FIRST" : "LIMITED ENTRY / CONFIRMATION REQUIRED",
      scenario: {
        base:"controlled follow-through",
        risk:"risk spike → hedge/reduce",
        weak:"signal downgrade → hold"
      },
      action:{
        entry:risk > 80 ? "0–15%" : "max 30%",
        stop:"risk > 80 OR signal downgrade",
        review:"before increasing exposure"
      },
      warning:["not investment advice","avoid full exposure","confirm with RiskLens"]
    },
    risk: {
      decision: risk > 75 ? "REDUCE / PROTECT" : "MONITOR / CONTROL",
      scenario:{ base:"risk controlled", risk:"stress rises", weak:"liquidity tightens" },
      action:{ reduce:"exposure if risk rises", hedge:"recommended when risk>70", monitor:"daily" },
      warning:["single metric is not enough","use report + audit"]
    },
    credit: {
      decision: fxPressure > 60 ? "CREDIT REVIEW / FX PRESSURE ACTIVE" : "CREDIT WATCH",
      scenario:{ base:"payment capacity stable", risk:"FX pressure rises", weak:"cash stress increases" },
      action:{ review:"payment plan", reduce:"unnecessary commitments", monitor:"FX/credit stress" },
      warning:["not credit advice","requires customer-specific data"]
    },
    portfolio: {
      decision: risk > 75 ? "DEFENSIVE REBALANCE" : "BALANCED WATCH",
      scenario:{ base:"balanced allocation", risk:"defensive shift", weak:"reduce volatile buckets" },
      action:{ allocation:"cap high-risk buckets", rebalance:"weekly", liquidity:"keep buffer" },
      warning:["portfolio profile required","not personal investment advice"]
    },
    contract: {
      decision:"DOCUMENT RISK REVIEW REQUIRED",
      scenario:{ base:"obligation scan", risk:"hidden cost/forced bundle", weak:"unclear consent" },
      action:{ check:"fees, termination, consent, bundled products", prepare:"questions/objection notes" },
      warning:["not legal advice","lawyer review may be required"]
    },
    sme: {
      decision:"CASH STRESS MAP REQUIRED",
      scenario:{ base:"30-day cash view", risk:"receivable delay / FX / credit pressure", weak:"liquidity gap" },
      action:{ list:"payables/receivables", prioritize:"critical payments", monitor:"cash buffer" },
      warning:["requires real business data","not accounting advice"]
    }
  };

  return { ...base, ...(packs[product] || packs.trade) };
}

async function liveData(){
  // Safe fallback; later real licensed feeds can replace this.
  try{
    const btc = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true", { timeout: 4000 });
    const b = await btc.json();
    const ch = b?.bitcoin?.usd_24h_change || 0;
    return {
      source:"coingecko_public_plus_fallback",
      btc_change: ch,
      marketRisk: ch < -3 ? 78 : ch > 3 ? 58 : 64,
      fxPressure:55
    };
  }catch(e){
    return { source:"fallback", marketRisk:64, fxPressure:55 };
  }
}

app.get("/live-data", async (req,res)=>{
  res.json({ ok:true, data: await liveData() });
});

app.post("/action", async (req,res)=>{
  const db = loadDB();
  const user = userFromToken(req) || db.users.find(u => u.id === (req.body?.user_id || "agent-001")) || db.users.find(u=>u.id==="agent-001");

  const product = req.body?.type || req.body?.product || "trade";
  if(!allowed(user, product)){
    return res.status(403).json({
      ok:false,
      error:"plan_required",
      user_plan:user.plan,
      required:PRODUCTS[product]?.minPlan || "core",
      product
    });
  }

  const live = await liveData();
  const decision = buildDecision(product, req.body?.input || {}, live);

  const action = {
    id:id(),
    user_id:user.id,
    product,
    input:req.body?.input || {},
    decision,
    created_at:new Date().toISOString()
  };

  db.actions.push(action);
  saveDB(db);
  res.json({ ok:true, action });
});

app.get("/history/:user_id", (req,res)=>{
  const db = loadDB();
  res.json({ ok:true, history: db.actions.filter(a => a.user_id === req.params.user_id).reverse() });
});

app.get("/workspace", (req,res)=>{
  const user = userFromToken(req);
  if(!user) return res.status(401).json({ ok:false, error:"not_logged_in" });
  const db = loadDB();
  const history = db.actions.filter(a => a.user_id === user.id).reverse();
  res.json({ ok:true, user, workspace:{ history, plan:user.plan, actions_count:history.length } });
});

app.listen(4000, "0.0.0.0", ()=>console.log("ZENTRA COMMERCIAL CORE RUNNING ON 4000"));

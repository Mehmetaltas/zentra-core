const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { buildDecision } = require("./engine");

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = "./data.json";

function loadDB() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE));
    db.users ||= [];
    db.sessions ||= [];
    db.actions ||= [];
    db.subscriptions ||= [];
    return db;
  } catch {
    return { users: [], sessions: [], actions: [], subscriptions: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getPlan(user_id) {
  const db = loadDB();
  const sub = db.subscriptions.find(s => s.user_id === user_id && s.status === "active");
  return sub ? sub.plan : "free";
}

function canUse(user_id, type) {
  const plan = getPlan(user_id);
  if (plan === "enterprise") return true;
  if (plan === "institutional") return true;
  if (plan === "expert") return ["trade", "risk", "credit", "portfolio"].includes(type);
  if (plan === "core") return ["risk", "credit"].includes(type);
  return ["risk"].includes(type);
}

// REGISTER / LOGIN
app.post("/auth/login", (req, res) => {
  const db = loadDB();
  const email = (req.body.email || "").trim().toLowerCase();
  const name = req.body.name || email.split("@")[0] || "user";

  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok:false, error:"Valid email required" });
  }

  let user = db.users.find(u => u.email === email);
  if (!user) {
    user = { id: uuidv4(), email, name, created_at: new Date().toISOString() };
    db.users.push(user);
    db.subscriptions.push({
      id: uuidv4(),
      user_id: user.id,
      plan: "free",
      status: "active",
      created_at: new Date().toISOString()
    });
  }

  const session = {
    token: uuidv4(),
    user_id: user.id,
    created_at: new Date().toISOString()
  };
  db.sessions.push(session);
  saveDB(db);

  res.json({ ok:true, user, token: session.token, plan: getPlan(user.id) });
});

// CURRENT USER
app.get("/auth/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const db = loadDB();
  const session = db.sessions.find(s => s.token === token);
  if (!session) return res.status(401).json({ ok:false, error:"Unauthorized" });

  const user = db.users.find(u => u.id === session.user_id);
  res.json({ ok:true, user, plan: getPlan(user.id) });
});

// PLAN CHANGE — payment yerine test abonelik kapısı
app.post("/subscription/test-activate", (req, res) => {
  const db = loadDB();
  const { user_id, plan } = req.body;

  if (!["free","core","expert","institutional","enterprise"].includes(plan)) {
    return res.status(400).json({ ok:false, error:"Invalid plan" });
  }

  db.subscriptions = db.subscriptions.filter(s => s.user_id !== user_id);
  db.subscriptions.push({
    id: uuidv4(),
    user_id,
    plan,
    status: "active",
    mode: "test",
    created_at: new Date().toISOString()
  });

  saveDB(db);
  res.json({ ok:true, user_id, plan, status:"active", mode:"test" });
});

// ACTION
app.post("/action", (req, res) => {
  const db = loadDB();
  const token = req.headers.authorization?.replace("Bearer ", "");
  const session = db.sessions.find(s => s.token === token);

  const user_id = req.body.user_id || session?.user_id || "agent-001";
  const type = req.body.type || "risk";
  const input = req.body.input || {};

  if (!canUse(user_id, type)) {
    return res.status(403).json({
      ok:false,
      error:"PLAN_ACCESS_REQUIRED",
      required:"upgrade",
      current_plan:getPlan(user_id),
      requested:type
    });
  }

  const decision = buildDecision(type, input);

  const action = {
    id: uuidv4(),
    user_id,
    type,
    input,
    decision,
    created_at: new Date().toISOString()
  };

  db.actions.push(action);
  saveDB(db);

  res.json({ ok:true, ...action, plan:getPlan(user_id) });
});

// HISTORY
app.get("/history/:user_id", (req, res) => {
  const db = loadDB();
  res.json(db.actions.filter(a => a.user_id === req.params.user_id));
});

// HEALTH
app.get("/health", (req,res)=>res.json({ok:true, service:"zentra-core", db:"json"}));

app.listen(4000, "0.0.0.0", () => {
  console.log("ZENTRA CORE REAL USER LOGIN ACTIVE ON 4000");
});

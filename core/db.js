const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../data/db.json");

function readDB(){
  try{
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  }catch{
    return {users:{},portfolios:{},contexts:{}};
  }
}

function writeDB(db){
  fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2));
}

// ===== USERS =====
function saveUser(username,data){
  const db = readDB();
  db.users[username] = {...db.users[username], ...data};
  writeDB(db);
}

function getUser(username){
  const db = readDB();
  return db.users[username];
}

// ===== PORTFOLIO =====
function savePortfolio(username,weights){
  const db = readDB();
  db.portfolios[username] = weights;
  writeDB(db);
}

function getPortfolio(username){
  const db = readDB();
  return db.portfolios[username];
}

// ===== CONTEXT =====
function saveContext(username,context){
  const db = readDB();
  db.contexts[username] = context;
  writeDB(db);
}

function getContext(username){
  const db = readDB();
  return db.contexts[username];
}

module.exports = {
  saveUser,
  getUser,
  savePortfolio,
  getPortfolio,
  saveContext,
  getContext
};

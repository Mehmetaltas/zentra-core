
/*
ZENTRA CORE — EXECUTION TEST
*/

const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');
const EXECUTION = require('./execution-engine');

// 1. MODULE
MODULES.register({
  id: "risk_intel",
  name: "Risk Intelligence",
  status: "var",
  core_connected: true
});

// 2. PRODUCT
PRODUCTS.register({
  id: "risk_product",
  name: "Risk Product",
  module_id: "risk_intel",
  status: "var"
});

// 3. APP
APPS.register({
  id: "risk_app",
  name: "Risk App",
  product_id: "risk_product",
  status: "var"
});

// 4. MISSION
MISSIONS.create({
  id: "mission_1",
  name: "Risk Analysis Run",
  module_id: "risk_intel",
  product_id: "risk_product",
  app_id: "risk_app"
});

// 5. TASK EKLE
MISSIONS.addTask("mission_1", {
  id: "task_1",
  name: "Run Risk Calculation",
  operator: "execution_operator"
});

// 6. MISSION ÇALIŞTIR
EXECUTION.startMission("mission_1");

console.log("=== TEST FINISHED ===");


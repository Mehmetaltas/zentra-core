/*
ZENTRA CORE — EXECUTION ENGINE
Mission → Task → Operator → Action → Audit → Snapshot akışı
*/

const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');
const OPERATORS = require('./operator-engine');
const AUDIT = require('./audit-engine');
const SNAPSHOT = require('./snapshot-engine');

const EXECUTION_ENGINE = {

  startMission(mission_id) {
    const mission = MISSIONS.list().find(m => m.id === mission_id);

    if (!mission) {
      return console.log("Mission not found:", mission_id);
    }

    console.log("=== START MISSION ===", mission.name);

    const module = MODULES.get(mission.module_id);
    const product = PRODUCTS.get(mission.product_id);
    const app = APPS.get(mission.app_id);

    if (!module) return console.log("Module missing:", mission.module_id);
    if (!product) return console.log("Product missing:", mission.product_id);
    if (!app) return console.log("App missing:", mission.app_id);

    AUDIT.log({
      type: "mission_started",
      mission_id,
      mission_name: mission.name,
      module_id: mission.module_id,
      product_id: mission.product_id,
      app_id: mission.app_id
    });

    mission.tasks.forEach(task => {
      this.executeTask(mission, task);
    });

    MISSIONS.updateStatus(mission_id, "tamamlandı");

    const snapshot = SNAPSHOT.create({
      type: "mission_completed",
      mission_id,
      mission_name: mission.name,
      status: "tamamlandı",
      task_count: mission.tasks.length
    });

    AUDIT.log({
      type: "mission_completed",
      mission_id,
      snapshot_id: snapshot.id
    });

    console.log("=== MISSION COMPLETED ===", mission.name);
  },

  executeTask(mission, task) {
    console.log("Running task:", task.name);

    const operatorResult = OPERATORS.run(task.operator, task);

    AUDIT.log({
      type: "task_operator_run",
      mission_id: mission.id,
      task_id: task.id,
      task_name: task.name,
      operator: task.operator,
      result: operatorResult
    });

    this.executeAction(mission, task, operatorResult);

    task.status = "tamamlandı";
  },

  executeAction(mission, task, operatorResult) {
    const action = {
      mission_id: mission.id,
      task_id: task.id,
      task_name: task.name,
      operator: task.operator,
      status: operatorResult.ok ? "executed" : "failed",
      timestamp: new Date().toISOString()
    };

    AUDIT.log({
      type: "action_executed",
      ...action
    });

    console.log("Action status:", action.status, "task:", task.name);
    return action;
  }
};

module.exports = EXECUTION_ENGINE;

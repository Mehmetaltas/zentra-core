
/*
ZENTRA CORE — EXECUTION ENGINE
Mission → Task → Operator → Action akışı
*/

const MODULES = require('./module-registry');
const PRODUCTS = require('./product-registry');
const APPS = require('./app-registry');
const MISSIONS = require('./mission-registry');

const EXECUTION_ENGINE = {

  startMission(mission_id) {
    const mission = MISSIONS.list().find(m => m.id === mission_id);
    if (!mission) {
      console.log("Mission not found:", mission_id);
      return;
    }

    console.log("=== START MISSION ===", mission.name);

    // 1. modül kontrol
    const module = MODULES.get(mission.module_id);
    if (!module) {
      console.log("Module missing");
      return;
    }

    // 2. product kontrol
    const product = PRODUCTS.get(mission.product_id);
    if (!product) {
      console.log("Product missing");
      return;
    }

    // 3. app kontrol
    const app = APPS.get(mission.app_id);
    if (!app) {
      console.log("App missing");
      return;
    }

    // 4. task çalıştır
    mission.tasks.forEach(task => {
      this.executeTask(task);
    });

    // 5. mission tamamla
    MISSIONS.updateStatus(mission_id, "tamamlandı");

    console.log("=== MISSION COMPLETED ===");
  },

  executeTask(task) {
    console.log("Running task:", task.name);

    // operator çağır
    this.callOperator(task.operator, task);

    task.status = "tamamlandı";
  },

  callOperator(operator, task) {
    console.log("Operator:", operator);

    // burada gerçek agent bağlanacak
    this.executeAction(operator, task);
  },

  executeAction(operator, task) {
    console.log("Action executed by:", operator, "for task:", task.name);

    // burada core action logic olacak
  }

};

module.exports = EXECUTION_ENGINE;


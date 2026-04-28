const MISSION_REGISTRY = {
  missions: [],
  create(mission) {
    const exists = this.missions.find(m => m.id === mission.id);
    if (exists) return console.log("Mission already exists:", mission.id);
    this.missions.push({
      id: mission.id,
      name: mission.name,
      module_id: mission.module_id,
      product_id: mission.product_id,
      app_id: mission.app_id,
      status: "başladı",
      tasks: [],
      created_at: new Date().toISOString()
    });
    console.log("Mission created:", mission.name);
  },
  addTask(mission_id, task) {
    const m = this.missions.find(m => m.id === mission_id);
    if (!m) return console.log("Mission not found:", mission_id);
    m.tasks.push({
      id: task.id,
      name: task.name,
      operator: task.operator,
      status: "yok"
    });
    console.log("Task added:", task.name);
  },
  updateStatus(mission_id, status) {
    const m = this.missions.find(m => m.id === mission_id);
    if (!m) return console.log("Mission not found:", mission_id);
    m.status = status;
    m.updated_at = new Date().toISOString();
    console.log("Mission updated:", mission_id);
  },
  list() { return this.missions; },
  get(id) { return this.missions.find(m => m.id === id); }
};
module.exports = MISSION_REGISTRY;

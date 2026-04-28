const APP_REGISTRY = {
  apps: [],
  register(app) {
    const exists = this.apps.find(a => a.id === app.id);
    if (exists) return console.log("App already exists:", app.id);
    this.apps.push({
      id: app.id,
      name: app.name,
      product_id: app.product_id,
      status: app.status || "yok",
      cockpit: app.cockpit || false,
      assistant: app.assistant || false,
      created_at: new Date().toISOString()
    });
    console.log("App registered:", app.name);
  },
  update(id, updates) {
    const a = this.apps.find(a => a.id === id);
    if (!a) return console.log("App not found:", id);
    Object.assign(a, updates);
    a.updated_at = new Date().toISOString();
    console.log("App updated:", id);
  },
  list() { return this.apps; },
  get(id) { return this.apps.find(a => a.id === id); }
};
module.exports = APP_REGISTRY;

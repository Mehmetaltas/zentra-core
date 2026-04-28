
/*
ZENTRA CORE — MODULE REGISTRY
*/

const MODULE_REGISTRY = {
  modules: [],

  register(module) {
    const exists = this.modules.find(m => m.id === module.id);
    if (exists) {
      console.log("Module already exists:", module.id);
      return;
    }

    this.modules.push({
      id: module.id,
      name: module.name,
      status: module.status || "yok",
      core_connected: module.core_connected || false,
      product_ready: module.product_ready || false,
      created_at: new Date().toISOString()
    });

    console.log("Module registered:", module.name);
  },

  update(id, updates) {
    const mod = this.modules.find(m => m.id === id);
    if (!mod) {
      console.log("Module not found:", id);
      return;
    }

    Object.assign(mod, updates);
    mod.updated_at = new Date().toISOString();

    console.log("Module updated:", id);
  },

  list() {
    return this.modules;
  },

  get(id) {
    return this.modules.find(m => m.id === id);
  }
};

module.exports = MODULE_REGISTRY;


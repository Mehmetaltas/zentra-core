const PRODUCT_REGISTRY = {
  products: [],
  register(product) {
    const exists = this.products.find(p => p.id === product.id);
    if (exists) return console.log("Product already exists:", product.id);
    this.products.push({
      id: product.id,
      name: product.name,
      module_id: product.module_id,
      status: product.status || "yok",
      app_connected: product.app_connected || false,
      market_ready: product.market_ready || false,
      created_at: new Date().toISOString()
    });
    console.log("Product registered:", product.name);
  },
  update(id, updates) {
    const p = this.products.find(p => p.id === id);
    if (!p) return console.log("Product not found:", id);
    Object.assign(p, updates);
    p.updated_at = new Date().toISOString();
    console.log("Product updated:", id);
  },
  list() { return this.products; },
  get(id) { return this.products.find(p => p.id === id); }
};
module.exports = PRODUCT_REGISTRY;

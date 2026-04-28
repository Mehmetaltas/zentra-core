
/*
ZENTRA — LIVE DATA ENGINE (V1)
Source → Normalize → Provide
*/

const LIVE_DATA = {

  // 1) SOURCE (şimdilik placeholder — sonra API bağlanacak)
  fetchMarketData(asset="BTC") {
    // TODO: gerçek API bağlanacak (Binance / etc)
    return {
      asset,
      price: 30000 + Math.random()*1000,
      volume: Math.random()*1000,
      trend: Math.random() > 0.5 ? "up" : "down",
      volatility: Math.floor(Math.random()*100),
      ts: new Date().toISOString()
    };
  },

  fetchCompanyData() {
    return {
      revenue: 100000 + Math.random()*50000,
      debt: 40000 + Math.random()*20000,
      cash: 20000 + Math.random()*10000,
      expenses: 60000 + Math.random()*20000,
      ts: new Date().toISOString()
    };
  },

  // 2) NORMALIZE
  normalizeMarket(data) {
    return {
      asset: data.asset,
      price: Math.round(data.price),
      trend: data.trend,
      volatility: data.volatility,
      ts: data.ts
    };
  },

  normalizeCompany(data) {
    return {
      revenue: Math.round(data.revenue),
      debt: Math.round(data.debt),
      cash: Math.round(data.cash),
      expenses: Math.round(data.expenses),
      ts: data.ts
    };
  }

};

module.exports = LIVE_DATA;


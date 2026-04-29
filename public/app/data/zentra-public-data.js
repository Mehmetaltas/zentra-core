window.ZENTRA_PUBLIC_DATA = {
  timestamp: new Date().toISOString(),

  markets: {
    BIST100: { score: 72, change: "+0.8%", signal: "WATCH" },
    SP500: { score: 81, change: "+0.4%", signal: "RISK-ON" },
    NASDAQ: { score: 86, change: "+0.7%", signal: "MOMENTUM" },
    DAX: { score: 59, change: "+0.1%", signal: "NEUTRAL" },

    USDTRY: { score: 64, change: "stable", signal: "WATCH" },
    EURUSD: { score: 48, change: "-0.2%", signal: "PRESSURE" },

    GOLD: { score: 70, change: "safe", signal: "SAFE WATCH" },
    OIL: { score: 67, change: "+0.3%", signal: "SUPPLY WATCH" },

    BTC: { score: 78, change: "+1.2%", signal: "VOLATILE BUY" },
    ETH: { score: 61, change: "+0.4%", signal: "WATCH" },

    DXY: { score: 63, change: "+0.1%", signal: "MACRO WATCH" }
  },

  system: {
    risk: 72,
    stress: 64,
    credit: 66,
    ft_signal: "BUY",
    confidence: 78
  },

  meta: {
    source: "ZENTRA Synthetic + Public Data Blend",
    delay: "Delayed / Indicative",
    disclaimer: "Not investment advice"
  }
};

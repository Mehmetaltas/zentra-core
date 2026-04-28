/*
ZENTRA — PORTFOLIO EXECUTION ENGINE V1
Multi Entity / Multi Product Execution
Vercel note: core file only, no new API route.
*/

const RISK = require('./risk-app');
const CREDIT = require('./credit-app');
const TRADE = require('./trade-app');

const PORTFOLIO_EXECUTION = {
  run(portfolio = []) {
    const results = portfolio.map(item => {
      const type = item.type || "risk";

      try {
        let result;

        if (type === "risk") {
          result = RISK.run(item.data || {});
        } else if (type === "credit") {
          result = CREDIT.run(item.data || {});
        } else if (type === "trade") {
          result = TRADE.run(item.data || {});
        } else {
          result = {
            error: "unknown_portfolio_item_type",
            type
          };
        }

        return {
          id: item.id,
          type,
          status: result.error ? "failed" : "executed",
          result
        };

      } catch (e) {
        return {
          id: item.id,
          type,
          status: "failed",
          error: String(e)
        };
      }
    });

    return {
      portfolio_count: portfolio.length,
      results,
      ts: new Date().toISOString()
    };
  }
};

module.exports = PORTFOLIO_EXECUTION;

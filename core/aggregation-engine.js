
/*
ZENTRA — AGGREGATION ENGINE V1
Portfolio Intelligence Layer
*/

const AGG = {

  run(portfolioResults = []) {

    let riskScores = [];
    let decisions = [];

    for (const item of portfolioResults) {

      const r = item.result?.result || item.result;

      if (!r) continue;

      // Risk
      if (r.risk_score !== undefined) {
        riskScores.push(r.risk_score);
      }

      if (r.credit_score !== undefined) {
        riskScores.push(r.credit_score);
      }

      // Decision
      if (r.decision) {
        decisions.push(r.decision);
      }

    }

    // Ortalama risk
    const avgRisk = riskScores.length
      ? Math.round(riskScores.reduce((a,b)=>a+b,0) / riskScores.length)
      : null;

    // Basit karar mantığı
    let finalDecision = "NEUTRAL";

    if (decisions.includes("REJECT")) finalDecision = "REJECT";
    else if (decisions.includes("CAUTION")) finalDecision = "CAUTION";
    else if (decisions.includes("APPROVE")) finalDecision = "APPROVE";
    else if (decisions.includes("ENTER_LONG")) finalDecision = "TRADE";

    return {
      portfolio_size: portfolioResults.length,
      avg_risk_score: avgRisk,
      decision: finalDecision,
      ts: new Date().toISOString()
    };
  }

};

module.exports = AGG;


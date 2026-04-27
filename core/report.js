function buildReport(data){

  const now = new Date().toLocaleString();

  return `
ZENTRA REPORT
-------------------------
Tarih: ${now}

ASSET
${data.symbol}
Fiyat: ${data.price}

RISK
${data.risk}

DECISION
${data.decision}

HUMAN EXPLAIN
${data.explain_human}

TECHNICAL
${data.explain_technical}

SOURCE
${data.source}
`;
}

module.exports = { buildReport };

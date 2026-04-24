import handler from "./send-report.js";

export default async function (req, res) {
  try {
    const scenarios = [
      { income: 120000, debt: 20000, monthly_payment: 2000, total_limit: 50000 },
      { income: 20000, debt: 20000, monthly_payment: 2000, total_limit: 80000 },
      { income: 20000, debt: 20000, monthly_payment: 12000, total_limit: 30000 },
      { income: 15000, debt: 2000000, monthly_payment: 15000, total_limit: 200000 }
    ];

    const results = [];

    for (const s of scenarios) {
      const fakeReq = { body: s };
      let output;

      await handler(fakeReq, {
        status: () => ({
          json: (data) => { output = data.result; }
        })
      });

      results.push({ input: s, output });
    }

    return res.status(200).json({
      ok: true,
      count: results.length,
      results
    });

  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

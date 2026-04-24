import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function escapeHtml(v) {
  return String(v || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

export default async function handler(req, res) {
  try {
    const { token } = req.query || {};

    const r = await pool.query(
      `select report_text from report_links where token = $1 limit 1`,
      [token]
    );

    if (!r.rows.length) {
      return res.status(404).send("Not found");
    }

    const data = typeof r.rows[0].report_text === "string"
      ? JSON.parse(r.rows[0].report_text)
      : r.rows[0].report_text;

    const trace = data.trace || {};

    res.setHeader("Content-Type","text/html; charset=utf-8");

    return res.send(`
    <html>
    <body style="background:#0b1626;color:#fff;font-family:Arial;padding:20px">

    <h2>ZENTRA AI Report</h2>

    <h3>Decision</h3>
    <p>${escapeHtml(data.decision)}</p>

    <h3>Explain</h3>
    <ul>
      ${(data.explain || []).map(e=>`<li>${escapeHtml(e)}</li>`).join("")}
    </ul>

    <hr/>

    <h3>Trace</h3>

    <h4>Input</h4>
    <pre>${escapeHtml(JSON.stringify(trace.input, null, 2))}</pre>

    <h4>Derived</h4>
    <pre>${escapeHtml(JSON.stringify(trace.derived, null, 2))}</pre>

    <h4>Triggered</h4>
    <pre>${escapeHtml(JSON.stringify(trace.triggered, null, 2))}</pre>

    <h4>Decision</h4>
    <pre>${escapeHtml(JSON.stringify({
      score: trace.score,
      decision: trace.decision
    }, null, 2))}</pre>

    </body>
    </html>
    `);

  } catch (e) {
    return res.status(500).send("error");
  }
}

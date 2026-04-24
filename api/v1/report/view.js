import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).send("missing token");
      return;
    }

    const r = await pool.query(
      `select report_text from report_links where token = $1 limit 1`,
      [token]
    );

    if (!r.rows.length) {
      res.status(404).send("token not found");
      return;
    }

    const report = r.rows[0].report_text;

    res.setHeader("Content-Type", "text/html");

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>ZENTRA Demo</title>
<script>
window.ZENTRA_DATA = ${report};
</script>
<style>
body{margin:0;background:#0b0f1a;color:#fff;font-family:Arial}
.top{padding:15px;background:#121a2f}
</style>
</head>

<body>

<div class="top">
<b>ZENTRA LIVE DEMO</b>
</div>

<iframe src="/app/report-visual.html" style="width:100%;height:95vh;border:0"></iframe>

</body>
</html>
    `);

  } catch (e) {
    res.status(500).send(e.message);
  }
}

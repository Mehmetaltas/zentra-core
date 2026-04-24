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
      `select report_text from report_links
       where token = $1
       limit 1`,
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
<title>ZENTRA Report</title>
<script>
window.ZENTRA_DATA = ${report};
</script>
</head>
<body style="margin:0">
<iframe src="/app/report-visual.html" style="width:100%;height:100vh;border:0"></iframe>
</body>
</html>
    `);

  } catch (e) {
    res.status(500).send(e.message);
  }
}

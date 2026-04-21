export default function handler(req, res) {
  const { token } = req.query || {};

  if (!global.reports || !token || !global.reports[token]) {
    return res.status(404).send("Geçersiz veya bulunamayan rapor linki");
  }

  const report = global.reports[token];

  if (Date.now() - report.created > 10 * 60 * 1000) {
    delete global.reports[token];
    return res.status(403).send("Link süresi doldu");
  }

  delete global.reports[token];

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>ZENTRA Raporu</title>
      <style>
        body {
          margin: 0;
          padding: 24px;
          background: #0b132b;
          color: white;
          font-family: Arial, sans-serif;
        }
        .wrap {
          max-width: 720px;
          margin: 0 auto;
          background: #101c3a;
          border: 1px solid #22345d;
          border-radius: 16px;
          padding: 24px;
        }
        h2 {
          margin-top: 0;
        }
        pre {
          white-space: pre-wrap;
          line-height: 1.6;
          font-size: 15px;
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h2>ZENTRA Raporu</h2>
        <pre>${String(report.text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
      </div>
    </body>
    </html>
  `);
}

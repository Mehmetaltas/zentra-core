import fetch from "node-fetch";

function json(res, status, body) {
  res.status(status).json(body);
}

function buildSimpleHTML(text) {
  return `
  <html>
    <body style="font-family:Arial;padding:20px;">
      <h2>ZENTRA Raporu</h2>
      <pre>${text}</pre>
    </body>
  </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false });
  }

  try {
    const { to, subject, text } = req.body;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_FROM_EMAIL;

    const html = buildSimpleHTML(text);

    // PDF yerine HTML attach (hafif çözüm)
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        attachments: [
          {
            filename: "zentra-report.html",
            content: Buffer.from(html).toString("base64")
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return json(res, 500, { ok: false, error: data });
    }

    return json(res, 200, { ok: true });

  } catch (e) {
    return json(res, 500, { ok: false, error: e.message });
  }
}

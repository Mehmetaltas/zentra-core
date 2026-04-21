import crypto from "crypto";

function json(res, status, body) {
  res.status(status).json(body);
}

function buildHTML(link) {
  return `
  <html>
    <body style="font-family:Arial;padding:20px;">
      <h2>ZENTRA Raporu</h2>
      <p>Rapor hazır.</p>
      <a href="${link}" style="display:inline-block;padding:12px 20px;background:#0a3cff;color:#fff;border-radius:8px;text-decoration:none;">
        Raporu Aç
      </a>
    </body>
  </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false });

  try {
    const { to, subject, text } = req.body;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_FROM_EMAIL;

    // TOKEN
    const token = crypto.randomBytes(16).toString("hex");

    // TEMP STORE (şimdilik memory - sonra DB)
    global.reports = global.reports || {};
    global.reports[token] = {
      text,
      created: Date.now()
    };

    const link = `https://zentra-core.vercel.app/api/v1/report/view?token=${token}`;

    const html = buildHTML(link);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return json(res, 500, { ok: false, error: data });
    }

    return json(res, 200, { ok: true });

  } catch (e) {
    return json(res, 500, { ok: false, error: e.message });
  }
}

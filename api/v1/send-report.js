function json(res, status, body) {
  res.status(status).json(body);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSimpleHTML(text) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <title>ZENTRA Raporu</title>
</head>
<body style="margin:0;padding:24px;background:#081321;font-family:Arial,Helvetica,sans-serif;color:#eaf1fb;">
  <div style="max-width:680px;margin:0 auto;background:#0d1f3b;border:1px solid #1d3557;border-radius:18px;overflow:hidden;">
    <div style="padding:24px;border-bottom:1px solid #18304d;">
      <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7ea6ff;font-weight:700;">
        ZENTRA Matrix Ecosystem
      </div>
      <div style="margin-top:10px;font-size:28px;font-weight:800;color:#ffffff;">
        ZENTRA Raporu
      </div>
      <div style="margin-top:8px;font-size:14px;color:#9db2d0;">
        Otomatik rapor teslimi
      </div>
    </div>
    <div style="padding:24px;">
      <div style="font-size:15px;line-height:1.7;color:#dce7f7;white-space:pre-wrap;">${escapeHtml(text)}</div>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, detail: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const to = String(body.to || "").trim();
    const subject = String(body.subject || "ZENTRA Report").trim();
    const text = String(body.text || "").trim();

    if (!to || !text) {
      return json(res, 400, { ok: false, detail: "Missing to or text" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_FROM_EMAIL;

    if (!apiKey || !from) {
      return json(res, 500, {
        ok: false,
        detail: "Missing RESEND_API_KEY or REPORT_FROM_EMAIL"
      });
    }

    const html = buildSimpleHTML(text);

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
        text,
        html,
        attachments: [
          {
            filename: "zentra-report.html",
            content: Buffer.from(html, "utf8").toString("base64")
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return json(res, response.status, {
        ok: false,
        detail: "Resend request failed",
        resend: data
      });
    }

    return json(res, 200, {
      ok: true,
      message: "Report sent successfully",
      provider: "resend",
      id: data.id || null
    });
  } catch (e) {
    return json(res, 500, {
      ok: false,
      detail: "Send report failed",
      error: String(e && e.message ? e.message : e)
    });
  }
}

function json(res, status, body) {
  res.status(status).json(body);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function extractValue(text, label) {
  const regex = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*(.+)", "i");
  const match = String(text || "").match(regex);
  return match ? match[1].trim() : "--";
}

function badgeStyle(decision) {
  const value = String(decision || "").toLowerCase();

  if (value.includes("reddet") || value.includes("reject")) {
    return {
      bg: "#3a1518",
      text: "#ffb3bb",
      border: "#6b2329"
    };
  }

  if (value.includes("izle") || value.includes("monitor")) {
    return {
      bg: "#3c2c10",
      text: "#ffd98a",
      border: "#6c531f"
    };
  }

  return {
    bg: "#113824",
    text: "#9ff0bf",
    border: "#245e3f"
  };
}

function buildHtmlReport({ subject, text }) {
  const reportDate = extractValue(text, "Rapor Tarihi");
  const country = extractValue(text, "Ülke Kodu");
  const decision = extractValue(text, "Karar");
  const regime = extractValue(text, "Rejim");
  const strategy = extractValue(text, "Strateji");
  const badge = badgeStyle(decision);

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#081321;font-family:Arial,Helvetica,sans-serif;color:#eaf1fb;">
  <div style="max-width:680px;margin:0 auto;padding:24px 16px;">
    <div style="background:linear-gradient(135deg,#081321 0%,#0d1f3b 100%);border:1px solid #1d3557;border-radius:20px;overflow:hidden;">
      
      <div style="padding:28px 24px 20px 24px;border-bottom:1px solid #18304d;">
        <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#7ea6ff;font-weight:700;">
          ZENTRA Matrix Ecosystem
        </div>
        <div style="margin-top:10px;font-size:30px;line-height:1.2;font-weight:800;color:#ffffff;">
          ZENTRA Raporu
        </div>
        <div style="margin-top:8px;font-size:15px;color:#9db2d0;">
          Otomatik rapor teslimi • Canlı sistem çıktısı
        </div>
      </div>

      <div style="padding:24px;">
        <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:${badge.bg};color:${badge.text};border:1px solid ${badge.border};font-size:13px;font-weight:700;">
          Karar: ${escapeHtml(decision)}
        </div>

        <div style="margin-top:20px;background:#0b1729;border:1px solid #1c314c;border-radius:16px;padding:18px;">
          <div style="font-size:13px;color:#8ea5c4;text-transform:uppercase;letter-spacing:0.06em;">Rapor Özeti</div>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:12px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#8ea5c4;width:38%;">Rapor Tarihi</td>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#ffffff;font-weight:700;">${escapeHtml(reportDate)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#8ea5c4;">Ülke Kodu</td>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#ffffff;font-weight:700;">${escapeHtml(country)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#8ea5c4;">Karar</td>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#ffffff;font-weight:700;">${escapeHtml(decision)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#8ea5c4;">Rejim</td>
              <td style="padding:10px 0;border-bottom:1px solid #17304d;color:#ffffff;font-weight:700;">${escapeHtml(regime)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0 0;color:#8ea5c4;vertical-align:top;">Strateji</td>
              <td style="padding:10px 0 0 0;color:#ffffff;font-weight:700;">${escapeHtml(strategy)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top:18px;background:#0b1729;border:1px solid #1c314c;border-radius:16px;padding:18px;">
          <div style="font-size:13px;color:#8ea5c4;text-transform:uppercase;letter-spacing:0.06em;">Tam Metin</div>
          <div style="margin-top:12px;font-size:15px;line-height:1.7;color:#dce7f7;">
            ${nl2br(text)}
          </div>
        </div>

        <div style="margin-top:18px;padding:16px 18px;background:#0d2238;border:1px solid #1b3958;border-radius:16px;">
          <div style="font-size:14px;color:#ffffff;font-weight:700;">ZENTRA Intel AI</div>
          <div style="margin-top:6px;font-size:13px;line-height:1.6;color:#9db2d0;">
            Bu rapor ZENTRA Matrix Ecosystem tarafından otomatik üretilmiştir.
          </div>
        </div>
      </div>
    </div>

    <div style="padding:16px 4px 0 4px;text-align:center;font-size:12px;color:#7188a8;">
      ZENTRA Matrix Ecosystem • Automated Report Delivery
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, detail: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const to = normalizeEmail(body.to);
    const subject = String(body.subject || "ZENTRA Report").trim();
    const text = String(body.text || "").trim();

    if (!isValidEmail(to)) {
      return json(res, 400, { ok: false, detail: "Invalid recipient email" });
    }

    if (!text) {
      return json(res, 400, { ok: false, detail: "Missing report text" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.REPORT_FROM_EMAIL;

    if (!apiKey || !from) {
      return json(res, 500, {
        ok: false,
        detail: "Missing RESEND_API_KEY or REPORT_FROM_EMAIL environment variable"
      });
    }

    const html = buildHtmlReport({ subject, text });

    const resendResponse = await fetch("https://api.resend.com/emails", {
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
        html
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return json(res, resendResponse.status, {
        ok: false,
        detail: "Resend request failed",
        resend: resendData
      });
    }

    return json(res, 200, {
      ok: true,
      message: "Report sent successfully",
      provider: "resend",
      id: resendData.id || null
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      detail: "Send report failed",
      error: String(error.message || error)
    });
  }
}

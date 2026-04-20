function json(res, status, body) {
  res.status(status).json(body);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
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
        text
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

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const { report_type, provided_documents } = req.body || {};

    if (!report_type) {
      return res.status(400).json({ ok: false, error: "missing_report_type" });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.APP_BASE_URL ||
      "https://zentra-core.vercel.app";

    const rulesRes = await fetch(`${baseUrl}/api/v1/document-rules`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!rulesRes.ok) {
      return res.status(500).json({
        ok: false,
        error: "rules_fetch_failed",
        status: rulesRes.status
      });
    }

    const rulesData = await rulesRes.json();

    if (!rulesData.ok || !Array.isArray(rulesData.items)) {
      return res.status(500).json({ ok: false, error: "rules_invalid_response" });
    }

    const rules = rulesData.items.filter(
      (r) => String(r.report_type || "").toLowerCase() === String(report_type).toLowerCase()
    );

    const provided = Array.isArray(provided_documents)
      ? provided_documents.map((d) => String(d).toLowerCase())
      : [];

    let totalWeight = 0;
    let obtainedWeight = 0;

    const missing = [];
    const present = [];

    for (const rule of rules) {
      const documentName = String(rule.document_name || "").trim();
      const weight = Number(rule.weight || 0);
      const required = rule.required === true || String(rule.required) === "true";

      totalWeight += weight;

      if (provided.includes(documentName.toLowerCase())) {
        obtainedWeight += weight;
        present.push(documentName);
      } else {
        missing.push({
          name: documentName,
          weight,
          required
        });
      }
    }

    const score = totalWeight > 0
      ? Math.round((obtainedWeight / totalWeight) * 100)
      : 100;

    return res.status(200).json({
      ok: true,
      report_type,
      score,
      present,
      missing,
      total_required: rules.length,
      provided_count: present.length
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "document_intelligence_failed",
      detail: err.message
    });
  }
}

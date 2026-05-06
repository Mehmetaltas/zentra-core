const fs = require("fs");
const path = require("path");

const now = new Date().toISOString();
const day = now.slice(0,10);

const ROOT = process.cwd();
const VAL = path.join(ROOT, "zentra-system-validation");
const RESULTS = path.join(VAL, "results");
const LOGS = path.join(VAL, "logs");
const ARCHIVE = path.join(VAL, "archive");

for (const d of [RESULTS, LOGS, ARCHIVE]) fs.mkdirSync(d, { recursive: true });

function exists(p){ return fs.existsSync(path.join(ROOT,p)); }
function read(p){
  try { return fs.readFileSync(path.join(ROOT,p),"utf8"); }
  catch(e){ return ""; }
}

const checks = [
  {
    id:"proof_organization",
    name:"Proof Organization Core",
    files:[
      "zentra-proof-organization/src/proof-organization-core.js",
      "zentra-proof-organization/results/final_combined_report.txt",
      "zentra-proof-organization/results/technical_report.json",
      "zentra-proof-organization/proof/latest_proof.json",
      "zentra-proof-organization/memory/decision_memory.json"
    ]
  },
  {
    id:"telegram_stream",
    name:"Telegram Proof Stream",
    files:[
      "zentra-telegram-stream/send-daily-proof.sh",
      "zentra-telegram-stream/results/daily_telegram_report.txt"
    ]
  },
  {
    id:"archive",
    name:"Daily Proof Archive",
    files:[
      `zentra-proof-organization/archive/proof_${day}.json`,
      `zentra-proof-organization/archive/report_${day}.txt`
    ]
  },
  {
    id:"live_terminal",
    name:"Financial Trade Live Terminal",
    files:[
      "financial-trade/live/index.html",
      "public/financial-trade/live/index.html"
    ]
  },
  {
    id:"founder_proof_center",
    name:"Founder Proof Center",
    files:[
      "founder/proof-center/index.html",
      "public/founder/proof-center/index.html"
    ]
  },
  {
    id:"public_proof",
    name:"Public Proof Files",
    files:[
      "public/proof/final_combined_report.txt",
      "public/proof/telegram_proof_report.txt",
      "public/proof/technical_report.json"
    ]
  },
  {
    id:"ops_auto",
    name:"Ops Auto Banking/Tasarruf/Islamic",
    files:[
      "zentra-ops/results/ops_report.json"
    ]
  },
  {
    id:"living_core",
    name:"Living Core",
    files:[
      "zentra-living-core/proof/latest_proof_registry.json"
    ]
  },
  {
    id:"equipment_radar",
    name:"Equipment Radar",
    files:[
      "zentra-competitor-radar/results/radar_report.json"
    ]
  },
  {
    id:"product_discovery",
    name:"Product Discovery",
    files:[
      "zentra-product-discovery/results/product_discovery_report.json"
    ]
  },
  {
    id:"auto_exec",
    name:"Auto Execution Agent",
    files:[
      "zentra-auto-exec/results/auto_exec_report.json"
    ]
  }
];

const results = checks.map(c => {
  const missing = c.files.filter(f => !exists(f));
  const status = missing.length === 0 ? "PASS" : missing.length < c.files.length ? "PARTIAL" : "MISSING";
  return { ...c, status, missing };
});

const passed = results.filter(r=>r.status==="PASS").length;
const partial = results.filter(r=>r.status==="PARTIAL").length;
const missing = results.filter(r=>r.status==="MISSING").length;

const finalReport = read("zentra-proof-organization/results/final_combined_report.txt");
const telegramProof = read("zentra-telegram-stream/results/daily_telegram_report.txt");

function qualityCheck(){
  const issues = [];
  if(!finalReport.includes("Günlük Birleşik Rapor")) issues.push("Final combined report title missing");
  if(!finalReport.includes("Yarınki Hazırlık")) issues.push("Next match prep missing");
  if(!finalReport.includes("Karar Hafızası")) issues.push("Decision memory language missing");
  if(!telegramProof.includes("ZENTRA GÜNLÜK KANIT AKIŞI")) issues.push("Telegram proof report missing header");
  if(finalReport.includes("WATCH") || finalReport.includes("PAPER_OPPORTUNITY") || finalReport.includes("accuracy")) {
    issues.push("Old robot/report language detected");
  }
  return issues;
}

const qualityIssues = qualityCheck();

const trust = Math.round((passed / results.length) * 100);

const validation = {
  title:"ZENTRA FULL SYSTEM VALIDATION ORGANIZATION",
  time:now,
  mode:"SAFE_LOCAL_PAPER_ONLY",
  summary:{passed, partial, missing, trust},
  qualityIssues,
  checks:results,
  decisions:[
    "Proof Organization remains active",
    "Report Engine V2 output is validated daily",
    "Telegram-ready stream is validated daily",
    "Live Terminal and Founder Proof Center are checked",
    "Internal systems continue as raw intelligence layer"
  ],
  nextActions: qualityIssues.length ? [
    "Fix report language quality issues",
    "Regenerate proof/report cycle",
    "Re-run validation"
  ] : [
    "Continue daily proof cycle",
    "Continue Telegram-ready stream",
    "Archive daily validation"
  ]
};

const humanReport = `
ZENTRA FULL SYSTEM VALIDATION

Status:
${missing === 0 && qualityIssues.length === 0 ? "SYSTEM VALIDATED" : "CHECK REQUIRED"}

Mode:
SAFE LOCAL / PAPER ONLY

System Trust:
${trust}%

Blok Durumu:
${results.map(r=>`- ${r.name}: ${r.status}${r.missing.length ? " | Eksik: "+r.missing.join(", ") : ""}`).join("\n")}

Rapor Kalitesi:
${qualityIssues.length ? qualityIssues.map(x=>"- "+x).join("\n") : "Rapor dili ve günlük kanıt akışı geçerli görünüyor."}

Günlük Kapanış:
Proof Organization, Report Engine V2, Telegram-ready stream, Live Terminal, Founder Proof Center ve arka plan raw intelligence blokları kontrol edildi.

Sonraki Akış:
${validation.nextActions.map(x=>"- "+x).join("\n")}
`.trim();

const telegramValidation = `
ZENTRA SİSTEM DOĞRULAMA RAPORU

Status: ${missing === 0 && qualityIssues.length === 0 ? "VALIDATED" : "CHECK REQUIRED"}
Mode: PAPER ONLY
System Trust: ${trust}%

PASS: ${passed}
PARTIAL: ${partial}
MISSING: ${missing}

Kalite:
${qualityIssues.length ? qualityIssues.map(x=>"• "+x).join("\n") : "• Report Engine V2 dili geçerli\n• Telegram proof stream geçerli\n• Daily archive aktif"}

Kapanan / Aktif Bloklar:
• Proof Organization
• Final Combined Report
• Telegram-ready Daily Stream
• Live Terminal V1
• Founder Proof Center
• Daily Proof Archive
• Raw Intelligence Layer Checks

Rapor:
zentra-system-validation/results/full_system_validation_report.txt
`.trim();

fs.writeFileSync(path.join(RESULTS,"validation.json"), JSON.stringify(validation,null,2));
fs.writeFileSync(path.join(RESULTS,"full_system_validation_report.txt"), humanReport);
fs.writeFileSync(path.join(RESULTS,"telegram_validation_report.txt"), telegramValidation);
fs.writeFileSync(path.join(ARCHIVE,`validation_${day}.json`), JSON.stringify(validation,null,2));
fs.writeFileSync(path.join(ARCHIVE,`validation_${day}.txt`), humanReport);
fs.appendFileSync(path.join(LOGS,"validation.log"), `[${now}] validation completed trust=${trust} pass=${passed} partial=${partial} missing=${missing}\n`);

fs.writeFileSync(path.join(ROOT,"zentra-telegram-stream/results/system_validation_telegram.txt"), telegramValidation);

console.log(telegramValidation);

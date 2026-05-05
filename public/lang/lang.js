const LANG = {
  tr: {
    title: "ZENTRA Matrix Ecosystem",
    subtitle: "Küresel ekonomik zeka ve ticaret işletim sistemi",
    intel: "Intel Market (ZENTRA'sız)",
    gate: "Gate Market (ZENTRA'lı)",
    login: "Giriş",
    pricing: "Paketler",
    ft: "Financial Trade",
    banking: "Bankacılık OS",
    tasarruf: "Tasarruf OS",
    islamic: "İslami Finans OS"
  },
  en: {
    title: "ZENTRA Matrix Ecosystem",
    subtitle: "Global economic intelligence & trade operating system",
    intel: "Intel Market (Standalone)",
    gate: "Gate Market (ZENTRA-powered)",
    login: "Login",
    pricing: "Pricing",
    ft: "Financial Trade",
    banking: "Banking OS",
    tasarruf: "Savings / Alternative Finance",
    islamic: "Islamic Finance OS"
  },
  ar: {
    title: "منظومة زنترا",
    subtitle: "نظام ذكاء اقتصادي وتشغيل تجاري عالمي",
    intel: "سوق إنتل (بدون زنترا)",
    gate: "سوق غيت (مدعوم بزنترا)",
    login: "تسجيل الدخول",
    pricing: "الباقات",
    ft: "التداول المالي",
    banking: "نظام بنكي",
    tasarruf: "نظام ادخار",
    islamic: "التمويل الإسلامي"
  }
};

let currentLang = localStorage.getItem("lang") || "tr";

function setLang(l){
  currentLang = l;
  localStorage.setItem("lang",l);
  location.reload();
}

function t(key){
  return LANG[currentLang][key] || key;
}

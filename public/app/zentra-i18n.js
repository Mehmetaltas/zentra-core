const ZT = {
tr:{
hero:"Karar veren, kanıtlayan ve yöneten sistem.",
sub:"ZENTRA; risk, kredi, finansal trade, assistant guidance, raporlama, audit, governance ve self-healing kontrolünü tek canlı platformda birleştirir.",
enter:"Karar Sistemine Gir", report:"Kurumsal Raporu Gör",
live:"Canlı Sinyal Akışı", decision:"Karar", risk:"Risk", confidence:"Güven", action:"Aksiyon",
riskText:"Risk tespiti, sapma izleme ve karar baskısı.",
creditText:"Ödeme kapasitesi, kredi stresi ve onay zekası.",
tradeText:"Kontrollü yürütme destekli finansal trade karar sistemi."
},
en:{
hero:"The system that decides, proves and executes.",
sub:"ZENTRA combines risk, credit, financial trade, assistant guidance, reporting, audit, governance and self-healing control in one live platform.",
enter:"Enter Decision System", report:"View Institutional Report",
live:"Live Signal Stream", decision:"Decision", risk:"Risk", confidence:"Confidence", action:"Action",
riskText:"Risk detection, deviation tracking and decision pressure.",
creditText:"Payment capacity, credit stress and approval intelligence.",
tradeText:"Execution-aware financial trade decision system."
},
ar:{
hero:"النظام الذي يقرر ويثبت وينفذ.",
sub:"تجمع ZENTRA بين المخاطر والائتمان والتداول المالي والمساعد والتقارير والتدقيق والحوكمة والتحكم الذاتي في منصة واحدة.",
enter:"ادخل نظام القرار", report:"عرض التقرير المؤسسي",
live:"تدفق الإشارة الحية", decision:"القرار", risk:"المخاطر", confidence:"الثقة", action:"الإجراء",
riskText:"كشف المخاطر وتتبع الانحراف وضغط القرار.",
creditText:"قدرة الدفع وضغط الائتمان وذكاء الموافقة.",
tradeText:"نظام قرار مالي مرتبط بالتنفيذ المنضبط."
}
};
function setLang(lang){
 const t=ZT[lang]||ZT.en;
 document.querySelectorAll("[data-i18n]").forEach(el=>{
   const k=el.getAttribute("data-i18n");
   if(t[k]) el.textContent=t[k];
 });
 document.documentElement.lang=lang;
 document.documentElement.dir=lang==="ar"?"rtl":"ltr";
 localStorage.setItem("zentraLang",lang);
}
window.addEventListener("DOMContentLoaded",()=>setLang(localStorage.getItem("zentraLang")||"en"));

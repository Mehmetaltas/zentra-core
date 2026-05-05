const themes = [
  { cls:"theme-telescope", name:"Telescope Mode" },
  { cls:"theme-gold", name:"Sovereign Gold" },
  { cls:"theme-emerald", name:"Risk Intelligence" },
  { cls:"theme-royal", name:"Matrix Royal" }
];

// Her yeni girişte değişsin
const last = localStorage.getItem("zentra_last_theme");
let pool = themes.filter(t => t.cls !== last);
const selected = pool[Math.floor(Math.random()*pool.length)] || themes[0];

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add(selected.cls);
  localStorage.setItem("zentra_last_theme", selected.cls);

  const el = document.querySelector("[data-theme-name]");
  if(el) el.textContent = selected.name;
});

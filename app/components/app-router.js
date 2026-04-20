/*
ZENTRA ROUTER CORE
Final Clean System
*/

(function(){

  const ROUTES = {
    cockpit: renderCockpit,
    report: renderReport,
    modules: renderModules
  };

  function init(){
    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  function handleRoute(){
    const hash = window.location.hash.replace("#","") || "cockpit";

    if(!ROUTES[hash]){
      navigate("cockpit");
      return;
    }

    ZENTRA.setRoute(hash);
    ROUTES[hash]();
  }

  function navigate(route){
    window.location.hash = route;
  }

  // =========================
  // RENDERERS
  // =========================

  function renderCockpit(){
    mount("COCKPIT");
  }

  function renderReport(){
    mount("REPORT PAGE (coming)");
  }

  function renderModules(){
    mount("MODULES PAGE (coming)");
  }

  // =========================
  // MOUNT SYSTEM
  // =========================

  function mount(content){
    const root = document.getElementById("app-root");
    if(!root) return;

    root.innerHTML = `
      <div style="padding:20px;font-family:sans-serif;">
        <h2>${content}</h2>
      </div>
    `;

    ZENTRA.trace("ROUTE_RENDER", content);
  }

  // =========================
  // GLOBAL EXPORT
  // =========================

  window.ZENTRA_ROUTER = {
    init,
    navigate
  };

})();

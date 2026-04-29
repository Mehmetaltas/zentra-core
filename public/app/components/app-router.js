(function(){
  function normalizeRoute(route){
    const value = String(route || "cockpit").replace(/^#/, "").trim().toLowerCase();

    if (value === "report") return "report";
    if (value === "modules") return "modules";
    return "cockpit";
  }

  function getCurrentHashRoute(){
    return normalizeRoute(window.location.hash || "cockpit");
  }

  function applyRoute(route, syncHash){
    const nextRoute = normalizeRoute(route);

    if (window.ZENTRA && typeof window.ZENTRA.setRoute === "function") {
      window.ZENTRA.setRoute(nextRoute);
    }

    if (syncHash) {
      const targetHash = "#" + nextRoute;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, "", targetHash);
      }
    }

    return nextRoute;
  }

  const router = {
    init: function(){
      applyRoute(getCurrentHashRoute(), false);

      window.addEventListener("hashchange", function(){
        applyRoute(getCurrentHashRoute(), false);
      });
    },

    navigate: function(route){
      applyRoute(route, true);
    },

    current: function(){
      return getCurrentHashRoute();
    }
  };

  window.ZENTRA_ROUTER = router;
})();

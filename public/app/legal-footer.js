(function(){
  document.addEventListener("DOMContentLoaded", function(){
    if(document.querySelector(".zentra-legal-footer")) return;

    const depth = location.pathname.split("/app/")[1]?.split("/").length - 1 || 0;
    const prefix = depth <= 0 ? "./" : "../".repeat(depth);

    const f = document.createElement("div");
    f.className = "zentra-legal-footer";
    f.innerHTML = `
      <a href="${prefix}account/index.html">Professional Login</a>
      <a href="${prefix}pricing/index.html">Pricing</a>
      <a href="${prefix}support/index.html">Support</a>
      <a href="${prefix}legal/index.html">Legal</a>
      <span>Not investment advice.</span>
    `;
    document.body.appendChild(f);
  });
})();

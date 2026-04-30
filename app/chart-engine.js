(function(){
  function createChart(host, options={}){
    if(!host || host.dataset.chartReady === "1") return;
    host.dataset.chartReady = "1";

    const canvas = document.createElement("canvas");
    canvas.width = host.clientWidth || 620;
    canvas.height = options.height || 220;
    canvas.style.width = "100%";
    canvas.style.height = (options.height || 220) + "px";
    host.innerHTML = "";
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let data = Array.from({length: 70}, (_,i)=> {
      return 110 + Math.sin(i/5)*22 + Math.random()*18;
    });

    function draw(){
      const w = canvas.width = host.clientWidth || 620;
      const h = canvas.height = options.height || 220;

      ctx.clearRect(0,0,w,h);

      ctx.globalAlpha = .18;
      ctx.strokeStyle = "#203553";
      ctx.lineWidth = 1;
      for(let i=0;i<6;i++){
        const y = (h/6)*i;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
      }
      for(let i=0;i<10;i++){
        const x = (w/10)*i;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const min = Math.min(...data)-10;
      const max = Math.max(...data)+10;
      const pts = data.map((v,i)=>({
        x: (i/(data.length-1))*w,
        y: h - ((v-min)/(max-min))*h
      }));

      const grad = ctx.createLinearGradient(0,0,0,h);
      grad.addColorStop(0,"rgba(52,245,164,.34)");
      grad.addColorStop(1,"rgba(52,245,164,0)");

      ctx.beginPath();
      ctx.moveTo(pts[0].x,h);
      pts.forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.lineTo(pts[pts.length-1].x,h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      pts.forEach((p,i)=> i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
      ctx.strokeStyle = "#34f5a4";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(52,245,164,.55)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      const last = pts[pts.length-1];
      ctx.beginPath();
      ctx.arc(last.x,last.y,5,0,Math.PI*2);
      ctx.fillStyle = "#34f5a4";
      ctx.fill();

      data.shift();
      const next = data[data.length-1] + (Math.random()-.48)*8;
      data.push(Math.max(min+8, Math.min(max-4, next)));

      requestAnimationFrame(()=>setTimeout(draw, 450));
    }
    draw();
  }

  function boot(){
    document.querySelectorAll(".chartbox,.main-chart,.market-chart,.clean-chart").forEach(el=>{
      createChart(el,{height:220});
    });

    document.querySelectorAll(".card").forEach(card=>{
      const txt = card.innerText.toLowerCase();
      if((txt.includes("signal") || txt.includes("risk") || txt.includes("market")) && !card.querySelector("canvas")){
        const mini = document.createElement("div");
        mini.style.height = "70px";
        mini.style.marginTop = "12px";
        mini.style.border = "1px solid #203553";
        mini.style.borderRadius = "12px";
        mini.style.overflow = "hidden";
        card.appendChild(mini);
        createChart(mini,{height:70});
      }
    });
  }

  window.addEventListener("DOMContentLoaded", boot);
})();

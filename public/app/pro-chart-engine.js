(function(){
  function proChart(el){
    if(!el || el.dataset.proChart==="1") return;
    el.dataset.proChart="1";
    const c=document.createElement("canvas");
    c.style.width="100%"; c.style.height="260px";
    el.innerHTML=""; el.appendChild(c);
    const ctx=c.getContext("2d");
    let data=Array.from({length:90},(_,i)=>100+Math.sin(i/6)*18+Math.random()*18);

    function draw(){
      const w=c.width=el.clientWidth||700, h=c.height=260;
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle="rgba(32,53,83,.6)";
      ctx.lineWidth=1;
      for(let i=0;i<7;i++){let y=i*h/6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
      for(let i=0;i<10;i++){let x=i*w/9;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
      const min=Math.min(...data)-10,max=Math.max(...data)+10;
      const pts=data.map((v,i)=>({x:i*w/(data.length-1),y:h-((v-min)/(max-min))*h}));
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,"rgba(52,245,164,.38)");
      g.addColorStop(1,"rgba(52,245,164,0)");
      ctx.beginPath(); ctx.moveTo(pts[0].x,h); pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(pts.at(-1).x,h); ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle="#34f5a4"; ctx.lineWidth=3; ctx.shadowBlur=18; ctx.shadowColor="rgba(52,245,164,.55)"; ctx.stroke(); ctx.shadowBlur=0;
      data.shift(); data.push(data.at(-1)+(Math.random()-.48)*8);
      setTimeout(()=>requestAnimationFrame(draw),500);
    }
    draw();
  }
  window.addEventListener("DOMContentLoaded",()=>document.querySelectorAll("[data-pro-chart]").forEach(proChart));
})();

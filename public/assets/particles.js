const canvas=document.createElement("canvas");
document.body.appendChild(canvas);
const ctx=canvas.getContext("2d");

function resize(){
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
}
resize();
window.addEventListener("resize",resize);

let particles=[];
for(let i=0;i<60;i++){
  particles.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    vx:(Math.random()-.5)*0.5,
    vy:(Math.random()-.5)*0.5,
    size:Math.random()*2+1
  });
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#7fb3ff";
  particles.forEach(p=>{
    p.x+=p.vx;
    p.y+=p.vy;
    if(p.x<0||p.x>canvas.width)p.vx*=-1;
    if(p.y<0||p.y>canvas.height)p.vy*=-1;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();

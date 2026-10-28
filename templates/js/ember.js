(function(){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
  document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});

  // tab-uri meniu
  var tabs=document.querySelectorAll("[role=tab]");
  tabs.forEach(function(t){t.addEventListener("click",function(){
    tabs.forEach(function(x){x.setAttribute("aria-selected",x===t?"true":"false")});
    document.querySelectorAll(".panel").forEach(function(p){p.classList.toggle("on",p.id===t.dataset.t)});
  })});

  // rezervare
  var g=2,out=document.getElementById("rg"),sum=document.getElementById("rsum"),d=document.getElementById("rd"),tm=document.getElementById("rt");
  var today=new Date();d.min=today.toISOString().slice(0,10);
  var tmr=new Date(today.getTime()+864e5);d.value=tmr.toISOString().slice(0,10);
  function upd(){var dt=d.value?new Date(d.value+"T12:00").toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long"}):"—";
    sum.innerHTML="Masă pentru <b>"+g+(g===1?" persoană":" persoane")+"</b>, "+dt+", la <b>"+tm.value+"</b>.";}
  document.querySelectorAll("[data-s]").forEach(function(b){b.addEventListener("click",function(){g=Math.max(1,Math.min(10,g+ +b.dataset.s));out.textContent=g;upd()})});
  d.addEventListener("change",upd);tm.addEventListener("change",upd);upd();
  document.getElementById("resForm").addEventListener("submit",function(e){e.preventDefault();sum.innerHTML="Demo: în site-ul real, rezervarea ajunge imediat la restaurant.";});

  // scântei
  var c=document.getElementById("sparks"),x=c.getContext("2d"),W,H,P=[];
  function rs(){var r=Math.min(devicePixelRatio||1,2);W=c.clientWidth;H=c.clientHeight;c.width=W*r;c.height=H*r;x.setTransform(r,0,0,r,0,0)}
  function sp(){return{x:W*(.35+Math.random()*.6),y:H+10,vx:(Math.random()-.5)*.4,vy:-(.4+Math.random()*1.1),r:.6+Math.random()*1.8,l:0,m:220+Math.random()*260}}
  rs();addEventListener("resize",rs);
  if(reduce)return;
  for(var i=0;i<45;i++){var p=sp();p.y=Math.random()*H;p.l=Math.random()*p.m;P.push(p)}
  var on=true;new IntersectionObserver(function(e){on=e[0].isIntersecting;if(on)loop()}).observe(c);
  function loop(){if(!on)return;x.clearRect(0,0,W,H);
    P.forEach(function(p,i){p.l++;p.x+=p.vx+Math.sin(p.l*.03)*.3;p.y+=p.vy;var a=1-p.l/p.m;
      if(a<=0||p.y<-10){P[i]=sp();return}
      x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fillStyle="rgba(243,"+(150+Math.round(60*a))+",90,"+(a*.85)+")";x.fill();});
    requestAnimationFrame(loop)}
})();

(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
  document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});

  var state={svc:"Tunsoare și coafat",day:null,time:null};
  function single(box,cb){box.addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b||b.disabled)return;
    box.querySelectorAll(".chip").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});cb(b);});}
  var days=document.getElementById("dayChips"),times=document.getElementById("timeChips"),sum=document.getElementById("bsum");
  var wd=["Dum","Lun","Mar","Mie","Joi","Vin","Sâm"],now=new Date();
  for(var i=1;i<=7;i++){var d=new Date(now.getTime()+i*864e5);var b=document.createElement("button");b.type="button";b.className="chip day";
    b.setAttribute("aria-pressed",i===1?"true":"false");b.dataset.label=d.toLocaleDateString("ro-RO",{weekday:"long",day:"numeric",month:"long"});
    b.innerHTML="<small>"+wd[d.getDay()]+"</small><b>"+d.getDate()+"</b>";if(d.getDay()===0)b.disabled=true;days.appendChild(b);if(i===1&&!b.disabled)state.day=b.dataset.label;}
  if(!state.day){var f=days.querySelector(".chip:not(:disabled)");f.setAttribute("aria-pressed","true");state.day=f.dataset.label;days.firstChild.setAttribute("aria-pressed","false")}
  function buildTimes(){times.innerHTML="";var slots=["10:00","11:30","13:00","14:30","16:00","17:30","19:00"];
    slots.forEach(function(s,k){var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=s;b.setAttribute("aria-pressed","false");
      if((k+state.day.length)%3===0)b.disabled=true;times.appendChild(b)});
    var first=times.querySelector(".chip:not(:disabled)");first.setAttribute("aria-pressed","true");state.time=first.textContent;}
  function upd(){sum.innerHTML="<b>"+state.svc+"</b><br>"+state.day+", ora <b>"+state.time+"</b>"}
  single(document.getElementById("svcChips"),function(b){state.svc=b.textContent;upd()});
  single(days,function(b){state.day=b.dataset.label;buildTimes();upd()});
  single(times,function(b){state.time=b.textContent;upd()});
  buildTimes();upd();
  document.getElementById("bgo").addEventListener("click",function(){sum.innerHTML="Demo: în site-ul real, programarea ajunge direct în calendarul salonului."});
})();

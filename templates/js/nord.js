(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});
  document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});
  document.querySelectorAll(".faq button").forEach(function(b){b.addEventListener("click",function(){var q=b.closest(".q");var o=q.classList.toggle("open");b.setAttribute("aria-expanded",o?"true":"false")})});
  document.getElementById("nf").addEventListener("submit",function(e){e.preventDefault();document.getElementById("nok").textContent="Demo: în site-ul real, cererea ajunge imediat la recepția clinicii."});
})();

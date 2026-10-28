(function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12,rootMargin:"0px 0px -5% 0px"});
document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});})();

document.getElementById("lexForm").addEventListener("submit",function(e){e.preventDefault();this.querySelector(".note").textContent="Demo: în site-ul real, cererea ajunge direct pe e-mailul cabinetului."});

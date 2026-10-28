/* Rulează primul: pregătește animațiile și le anulează dacă restul scripturilor nu se încarcă. */
(function (h) {
  h.classList.add("js");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) h.classList.add("js-anim");
  setTimeout(function () {
    if (!window.__afyze) { h.classList.remove("js-anim"); h.classList.remove("js"); }
  }, 2500);
})(document.documentElement);

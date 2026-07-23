/* =========================================================
   dog salon IPPU — journal ver. scripts
   スクロール連動のtransform更新は一切行わない最小構成。
   出現アニメはIntersectionObserver + CSS transitionのみ。
   ========================================================= */
(function () {
  "use strict";

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      nav.classList.toggle("nav--scrolled", window.scrollY > 30);
      ticking = false;
    });
  }, { passive: true });

  /* ---------- burger ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menuOverlay");
  function closeMenu() {
    burger.classList.remove("is-open");
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = !menu.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  /* ---------- reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      /* .rv-lineはoverflow:hiddenの外に待機していてIOに映らないため、
         親の.lineを観測して子に発火する */
      var target = e.target.classList.contains("line")
        ? e.target.querySelector(".rv-line")
        : e.target;
      if (target) target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".rv, .rv-img").forEach(function (el) {
    var d = el.getAttribute("data-d");
    if (d) el.style.setProperty("--d", d + "ms");
    io.observe(el);
  });
  document.querySelectorAll(".hero__title .line").forEach(function (el) {
    io.observe(el);
  });
})();

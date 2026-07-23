/* =========================================================
   dog salon IPPU — motion ver. scripts
   スクロール連動アニメーションのエンジン（ライブラリ不使用）
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  nav.classList.add("nav--hero");

  /* ---------- burger / overlay menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menuOverlay");
  function closeMenu() {
    burger.classList.remove("is-open");
    menu.classList.remove("is-open");
    nav.classList.remove("nav--menu");
    menu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = !menu.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    nav.classList.toggle("nav--menu", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- hero title: split chars ---------- */
  document.querySelectorAll(".js-split").forEach(function (el) {
    var text = el.textContent;
    el.textContent = "";
    var ci = 0;
    /* 読点で文節に分けてまとめ、文節の途中で改行されないようにする */
    text.split(/(?<=、)/).forEach(function (phrase) {
      var ph = document.createElement("span");
      ph.className = "ph";
      Array.prototype.forEach.call(phrase, function (ch) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch === " " ? " " : ch;
      s.style.animationDelay = 120 + ci * 55 + "ms";
        ph.appendChild(s);
        ci++;
      });
      el.appendChild(ph);
    });
    el.classList.add("is-in");
  });

  /* ---------- scrub words: wrap ---------- */
  var scrubWords = [];
  document.querySelectorAll(".js-scrub-words").forEach(function (box) {
    box.querySelectorAll("p").forEach(function (p) {
      var nodes = Array.prototype.slice.call(p.childNodes);
      p.textContent = "";
      nodes.forEach(function (node) {
        var isEm = node.nodeName === "EM";
        var text = node.textContent;
        text.split(/\s+/).forEach(function (word) {
          if (!word) return;
          var s = document.createElement("span");
          s.className = "w";
          if (isEm) {
            var em = document.createElement("em");
            em.textContent = word;
            s.appendChild(em);
          } else {
            s.textContent = word;
          }
          p.appendChild(s);
          p.appendChild(document.createTextNode(" "));
          scrubWords.push(s);
        });
      });
    });
  });
  var scrubBox = document.querySelector(".js-scrub-words");

  /* ---------- reveal on intersect ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".rv").forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d + "ms");
    io.observe(el);
  });

  /* ---------- price table rows: stagger ---------- */
  var rowsIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var rows = e.target.querySelectorAll("tbody tr");
      rows.forEach(function (tr, i) {
        tr.style.transitionDelay = i * 60 + "ms";
        tr.classList.add("is-in");
      });
      rowsIo.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".ptable").forEach(function (t) { rowsIo.observe(t); });

  /* ---------- price table: swipe guide overlay ---------- */
  var guideBox = document.querySelector(".price__tablebox");
  var guide = document.getElementById("swipeGuide");
  if (guideBox && guide && !reduced) {
    var guideScroll = guideBox.querySelector(".price__scroll");
    var guideTimer = null;
    var hideGuide = function () {
      clearTimeout(guideTimer);
      guide.classList.remove("is-on");
    };
    var guideIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        guideIo.disconnect();
        /* 表が実際に横へはみ出している時だけ(=スマホ幅)出す */
        if (guideScroll.scrollWidth > guideScroll.clientWidth + 8) {
          guide.classList.add("is-on");
          guideTimer = setTimeout(hideGuide, 4600);
        }
      });
    }, { threshold: 0.25 });
    guideIo.observe(guideBox);
    guideScroll.addEventListener("scroll", hideGuide, { once: true, passive: true });
  }

  /* ---------- counter ---------- */
  var cntIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var to = parseInt(el.getAttribute("data-to"), 10) || 0;
      var t0 = null;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 900, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cntIo.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".js-counter").forEach(function (el) { cntIo.observe(el); });

  /* ---------- horizontal scroll section ---------- */
  var hs = document.querySelector(".js-hscroll");
  var hsTrack = hs ? hs.querySelector(".hs__track") : null;
  function sizeHs() {
    if (!hs || !hsTrack) return;
    if (reduced) { hs.style.height = "auto"; return; }
    var extra = hsTrack.scrollWidth - window.innerWidth;
    hs.style.height = window.innerHeight + Math.max(extra, 0) + "px";
  }

  /* ---------- scroll engine (rAF) ---------- */
  var laxEls = Array.prototype.slice.call(document.querySelectorAll("[data-lax]"));
  var laxXEls = Array.prototype.slice.call(document.querySelectorAll("[data-lax-x]"));
  var bar = document.getElementById("progressBar");
  var dog = document.getElementById("progressDog");
  var walk = document.querySelector(".js-dogwalk");
  var walkDog = walk ? walk.querySelector(".dogwalk__dog") : null;
  var stackCards = Array.prototype.slice.call(document.querySelectorAll(".js-stack .stack__card"));

  var vh = window.innerHeight;

  function frame() {
    var y = window.scrollY;
    var docH = document.documentElement.scrollHeight - vh;
    var total = docH > 0 ? y / docH : 0;

    /* progress bar + dog */
    bar.style.width = total * 100 + "%";
    dog.style.transform = "translateX(" + (total * (window.innerWidth - 48)).toFixed(1) + "px) scaleX(-1)";

    if (!reduced) {
      /* parallax (translateY) */
      laxEls.forEach(function (el) {
        var sp = parseFloat(el.getAttribute("data-lax"));
        var r = el.getBoundingClientRect();
        var mid = r.top + r.height / 2 - vh / 2;
        var scale = el.getAttribute("data-lax-scale") || "";
        el.style.transform = "translateY(" + (-mid * sp).toFixed(1) + "px)" + (scale ? " scale(" + scale + ")" : "");
      });
      /* parallax (translateX — footer big text) */
      laxXEls.forEach(function (el) {
        var sp = parseFloat(el.getAttribute("data-lax-x"));
        var r = el.getBoundingClientRect();
        el.style.transform = "translateX(" + ((r.top - vh) * sp).toFixed(1) + "px)";
      });

      /* scrub words */
      if (scrubBox && scrubWords.length) {
        var r2 = scrubBox.getBoundingClientRect();
        var p = (vh * 0.9 - r2.top) / (r2.height + vh * 0.55);
        p = Math.max(0, Math.min(1, p));
        var onCount = p * (scrubWords.length + 2);
        scrubWords.forEach(function (w, i) {
          w.classList.toggle("is-on", i < onCount);
        });
      }

      /* horizontal scroll */
      if (hs && hsTrack) {
        var hr = hs.getBoundingClientRect();
        var extra = hsTrack.scrollWidth - window.innerWidth;
        if (extra > 0) {
          var hp = Math.max(0, Math.min(1, -hr.top / (hr.height - vh)));
          hsTrack.style.transform = "translateX(" + (-hp * extra).toFixed(1) + "px)";
        }
      }

      /* stacking cards: 下のカードが重なる時に前のカードを少し縮める */
      stackCards.forEach(function (card, i) {
        var next = stackCards[i + 1];
        if (!next) { card.style.transform = ""; return; }
        var nr = next.getBoundingClientRect();
        var cr = card.getBoundingClientRect();
        var overlap = Math.max(0, Math.min(1, (cr.bottom - nr.top) / cr.height));
        card.style.transform = "scale(" + (1 - overlap * 0.06).toFixed(3) + ") translateY(" + (-overlap * 12).toFixed(1) + "px)";
        card.style.filter = "brightness(" + (1 - overlap * 0.12).toFixed(3) + ")";
      });

      /* walking dog strip */
      if (walk && walkDog) {
        var wr = walk.getBoundingClientRect();
        var wp = (vh - wr.top) / (vh + wr.height);
        wp = Math.max(0, Math.min(1, wp));
        walkDog.style.transform = "translate(" + (wp * (window.innerWidth + 160) - 80) + "px, -50%) scaleX(-1)";
      }
    }

    /* nav state */
    nav.classList.toggle("nav--scrolled", y > 40);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      frame();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    vh = window.innerHeight;
    sizeHs();
    onScroll();
  });
  window.addEventListener("load", function () {
    sizeHs();
    frame();
  });
  sizeHs();
  frame();
})();

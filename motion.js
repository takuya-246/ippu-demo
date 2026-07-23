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
    /* 表が画面に入るたびに表示し、離れたらリセット。
       実際にスワイプした人にだけ、それ以降は出さない */
    var guideIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          /* 表が実際に横へはみ出している時だけ(=スマホ幅)出す */
          if (guideScroll.scrollWidth > guideScroll.clientWidth + 8) {
            guide.classList.add("is-on");
            clearTimeout(guideTimer);
            guideTimer = setTimeout(hideGuide, 4500);
          }
        } else {
          hideGuide();
        }
      });
    }, { threshold: 0.3, rootMargin: "0px 0px -15% 0px" });
    guideIo.observe(guideBox);
    guideScroll.addEventListener("scroll", function () {
      hideGuide();
      guideIo.disconnect();
    }, { once: true, passive: true });
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

  /* ---------- scroll engine (rAF) ----------
     スマホのカクつき/一瞬のブレ対策:
     ・基準位置は事前計測してキャッシュし、毎フレームの getBoundingClientRect
       (強制レイアウト)を無くす
     ・フレーム内は「読み取り→書き込み」を分離してレイアウトスラッシングを防ぐ
     ・transformは translate3d でGPU合成レイヤーに載せたまま動かす */
  var laxEls = Array.prototype.slice.call(document.querySelectorAll("[data-lax]"));
  var laxXEls = Array.prototype.slice.call(document.querySelectorAll("[data-lax-x]"));
  /* タッチ端末では装飾パララックスを無効化:
     スクロール中のJS transform更新は実機でどうしてもガタつくため、
     スマホはネイティブスクロールの滑らかさを最優先する(主要演出は別系統で維持) */
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse) { laxEls = []; laxXEls = []; }
  var bar = document.getElementById("progressBar");
  var dog = document.getElementById("progressDog");
  var walk = document.querySelector(".js-dogwalk");
  var walkDog = walk ? walk.querySelector(".dogwalk__dog") : null;
  var stackCards = Array.prototype.slice.call(document.querySelectorAll(".js-stack .stack__card"));

  var vh = window.innerHeight;
  var vw = window.innerWidth;
  var docH = 1;
  var scrubTop = 0, scrubH = 1, hsTop = 0, hsH = 1, hsExtra = 0, walkTop = 0, walkH = 1;
  var stackBox = document.querySelector(".js-stack");
  var stackTop = 0, stackH = 1;

  /* 基準位置の事前計測(ロード時・リサイズ時のみ。スクロール中は呼ばない) */
  function measure() {
    var y = window.scrollY;
    vh = window.innerHeight;
    vw = window.innerWidth;
    docH = Math.max(1, document.documentElement.scrollHeight - vh);
    laxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el._sp = parseFloat(el.getAttribute("data-lax"));
      /* 適用済みのtransform分を差し引いた、文書座標での中心位置 */
      el._mid = r.top + y - (el._ly || 0) + r.height / 2;
    });
    laxXEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      el._sp = parseFloat(el.getAttribute("data-lax-x"));
      el._top = r.top + y; /* X移動はtopに影響しない */
    });
    if (scrubBox) {
      var sr = scrubBox.getBoundingClientRect();
      scrubTop = sr.top + y; scrubH = sr.height;
    }
    if (hs && hsTrack) {
      var hr = hs.getBoundingClientRect();
      hsTop = hr.top + y; hsH = hr.height;
      hsExtra = hsTrack.scrollWidth - vw;
    }
    if (walk) {
      var wr = walk.getBoundingClientRect();
      walkTop = wr.top + y; walkH = wr.height;
    }
    if (stackBox) {
      var str = stackBox.getBoundingClientRect();
      stackTop = str.top + y; stackH = str.height;
    }
  }

  /* 対象セクションが画面の近くにある時だけ処理する(画面外の計算を毎フレームしない) */
  function near(y, top, h, pad) {
    return y + vh > top - pad && y < top + h + pad;
  }

  function frame() {
    var y = window.scrollY;

    /* --- 読み取り(stickyで位置が変わる積層カードだけは、画面近くにある時のみ実測) --- */
    var stackRects = null;
    if (!reduced && stackCards.length && near(y, stackTop, stackH, vh)) {
      stackRects = stackCards.map(function (c) { return c.getBoundingClientRect(); });
    }

    /* --- 書き込み --- */
    var total = y / docH;
    bar.style.transform = "scaleX(" + Math.min(total, 1).toFixed(4) + ")";
    dog.style.transform = "translate3d(" + (total * (vw - 48)).toFixed(1) + "px,0,0) scaleX(-1)";

    if (!reduced) {
      laxEls.forEach(function (el) {
        var t = -(el._mid - y - vh / 2) * el._sp;
        el._ly = t;
        el.style.transform = "translate3d(0," + t.toFixed(1) + "px,0)";
      });
      laxXEls.forEach(function (el) {
        el.style.transform = "translate3d(" + ((el._top - y - vh) * el._sp).toFixed(1) + "px,0,0)";
      });

      /* scrub words */
      if (scrubBox && scrubWords.length && near(y, scrubTop, scrubH, vh)) {
        var p = (vh * 0.9 - (scrubTop - y)) / (scrubH + vh * 0.55);
        p = Math.max(0, Math.min(1, p));
        var onCount = p * (scrubWords.length + 2);
        scrubWords.forEach(function (w, i) {
          w.classList.toggle("is-on", i < onCount);
        });
      }

      /* horizontal scroll */
      if (hs && hsTrack && hsExtra > 0 && near(y, hsTop, hsH, vh)) {
        var hp = Math.max(0, Math.min(1, (y - hsTop) / (hsH - vh)));
        hsTrack.style.transform = "translate3d(" + (-hp * hsExtra).toFixed(1) + "px,0,0)";
      }

      /* stacking cards: 下のカードが重なる時に前のカードを少し縮める */
      if (stackRects) {
        stackCards.forEach(function (card, i) {
          if (!stackCards[i + 1]) { card.style.transform = ""; return; }
          var cr = stackRects[i], nr = stackRects[i + 1];
          var overlap = Math.max(0, Math.min(1, (cr.bottom - nr.top) / cr.height));
          card.style.transform = "scale(" + (1 - overlap * 0.06).toFixed(3) + ") translateY(" + (-overlap * 12).toFixed(1) + "px)";
          card.style.filter = "brightness(" + (1 - overlap * 0.12).toFixed(3) + ")";
        });
      }

      /* walking dog strip */
      if (walk && walkDog && near(y, walkTop, walkH, vh * 0.5)) {
        var wp = Math.max(0, Math.min(1, (vh - (walkTop - y)) / (vh + walkH)));
        walkDog.style.transform = "translate3d(" + (wp * (vw + 160) - 80).toFixed(1) + "px,-50%,0) scaleX(-1)";
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
  /* スマホのURLバー伸縮でもresizeが飛んでくるので、
     スクロール中に重い再計測が走らないよう落ち着いてから1回だけ実行 */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      sizeHs();
      measure();
      frame();
    }, 180);
  });
  window.addEventListener("load", function () {
    sizeHs();
    measure();
    frame();
  });
  sizeHs();
  measure();
  frame();
})();

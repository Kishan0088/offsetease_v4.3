/* ==========================================================================
   OffsetEase v4.3 — Interaction layer
   ========================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader dismiss ----------------------------------------- */
  var pre = document.getElementById("preloader");
  if (pre) {
    window.addEventListener("load", function () {
      setTimeout(function () { pre.classList.add("done"); }, reduce ? 0 : 350);
    });
    // safety: never let it linger
    setTimeout(function () { pre.classList.add("done"); }, 3000);
  }

  /* ---------- Page-transition curtain ----------------------------------- */
  var curtain = document.querySelector(".curtain");
  if (curtain && !reduce) {
    try {
      if (sessionStorage.getItem("oe_nav")) {
        sessionStorage.removeItem("oe_nav");
        curtain.classList.add("covered");
        void curtain.offsetHeight;
        curtain.classList.remove("covered");
        curtain.classList.add("reveal");
        setTimeout(function () { curtain.classList.remove("reveal"); }, 800);
      }
    } catch (e) {}
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      var href = a.getAttribute("href");
      if (!href || a.target === "_blank" || href.charAt(0) === "#" ||
          href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0 || /^https?:\/\//.test(href)) return;
      if (!/\.html(\?|#|$)/.test(href)) return;
      e.preventDefault();
      try { sessionStorage.setItem("oe_nav", "1"); } catch (e2) {}
      curtain.classList.add("cover");
      setTimeout(function () { window.location.href = href; }, 500);
    });
  }

  /* ---------- Lenis smooth inertia scroll -------------------------------- */
  if (!reduce && typeof Lenis !== "undefined") {
    try {
      var lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
      function lraf(time) { lenis.raf(time); requestAnimationFrame(lraf); }
      requestAnimationFrame(lraf);
      // in-page anchor links → smooth via Lenis
      document.querySelectorAll('a[href^="#"], a[href*=".html#"]').forEach(function (a) {
        var href = a.getAttribute("href");
        var hashOnly = href.charAt(0) === "#";
        if (!hashOnly) return; // let cross-page links navigate normally
        a.addEventListener("click", function (e) {
          var id = href.slice(1);
          var t = id && document.getElementById(id);
          if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
        });
      });
      window.__lenis = lenis;
    } catch (e) {}
  }

  /* ---------- Nav: scroll state, hide-on-scroll, progress ---------------- */
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".nav__progress");
  var lastY = 0;
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 24);
      if (!document.body.classList.contains("menu-open")) {
        nav.classList.toggle("is-hidden", y > lastY && y > 400);
      }
    }
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ------------------------------------------------- */
  var toggle = document.querySelector(".nav__toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
    });
  }

  /* ---------- Kinetic split-text (Editorial Kinetic) --------------------- */
  function splitKinetic(el) {
    if (el.dataset.kin || reduce) return;
    el.dataset.kin = "1"; el.classList.add("kin");
    var nodes = [].slice.call(el.childNodes); el.innerHTML = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (tok) {
          if (tok === "") return;
          if (!tok.trim()) { el.appendChild(document.createTextNode(tok)); return; }
          var kw = document.createElement("span"); kw.className = "kw";
          var inner = document.createElement("span"); inner.textContent = tok;
          kw.appendChild(inner); el.appendChild(kw);
        });
      } else if (node.nodeName === "BR") {
        el.appendChild(node);
      } else {
        var kw2 = document.createElement("span"); kw2.className = "kw";
        var inner2 = document.createElement("span"); inner2.appendChild(node);
        kw2.appendChild(inner2); el.appendChild(kw2);
      }
    });
    el.querySelectorAll(".kw > span").forEach(function (s, i) { s.style.setProperty("--kd", (i * 55) + "ms"); });
  }
  if (!reduce) {
    document.querySelectorAll(".display, .film__title, .tl-scene h2").forEach(splitKinetic);
    // cinematic clip-wipe on select media as it enters
    document.querySelectorAll(".feat__media, .post__img, .cinema__inner, .pathway__chart").forEach(function (el) { el.classList.add("wipe"); });
  }

  /* ---------- Scroll reveal (reveal + kinetic + wipe) -------------------- */
  var revs = document.querySelectorAll(".reveal, .kin, .wipe");
  if (reduce || !("IntersectionObserver" in window)) {
    revs.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll-driven color world --------------------------------- */
  if (!reduce) {
    var worldTick = false;
    function worldUpdate() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var w = h > 0 ? Math.min(1, window.pageYOffset / h) : 0;
      document.documentElement.style.setProperty("--world", w.toFixed(3));
      worldTick = false;
    }
    window.addEventListener("scroll", function () { if (!worldTick) { requestAnimationFrame(worldUpdate); worldTick = true; } }, { passive: true });
    worldUpdate();
  }

  /* ---------- Chapter dots (continuous scroll-film) --------------------- */
  (function () {
    var candidates = [["film", "Intro"], ["timeline", "Timeline"], ["solutions", "Solutions"], ["services", "Services"], ["industries", "Industries"]];
    var present = candidates.filter(function (c) { return document.getElementById(c[0]); });
    if (present.length < 3 || window.matchMedia("(max-width: 900px)").matches) return;
    var nav = document.createElement("nav"); nav.className = "chapters"; nav.setAttribute("aria-label", "Chapters");
    present.forEach(function (c) {
      var a = document.createElement("a"); a.href = "#" + c[0]; a.dataset.label = c[1]; a.setAttribute("aria-label", c[1]);
      a.addEventListener("click", function (e) { e.preventDefault(); var t = document.getElementById(c[0]); if (window.__lenis) window.__lenis.scrollTo(t, { offset: -10 }); else t.scrollIntoView(); });
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
    var dots = nav.querySelectorAll("a");
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var id = e.target.id;
            dots.forEach(function (d) { d.classList.toggle("active", d.getAttribute("href") === "#" + id); });
          }
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      present.forEach(function (c) { cio.observe(document.getElementById(c[0])); });
    }
  })();

  /* ---------- Draw-on-scroll (SVG line drawing) -------------------------- */
  var draws = document.querySelectorAll("[data-draw]");
  if (draws.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      draws.forEach(function (d) { d.classList.add("in-view"); });
    } else {
      var dio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in-view"); dio.unobserve(e.target); } });
      }, { threshold: 0.32 });
      draws.forEach(function (d) { dio.observe(d); });
    }
  }

  /* ---------- Parallax (decorative layers only) -------------------------- */
  var pxEls = document.querySelectorAll("[data-parallax]");
  if (pxEls.length && !reduce) {
    var pticking = false;
    function pxUpdate() {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var off = (r.top + r.height / 2) - vh / 2;
        var sp = parseFloat(el.dataset.parallax) || 0;
        el.style.transform = "translate3d(0," + (-off * sp).toFixed(1) + "px,0)";
      });
      pticking = false;
    }
    window.addEventListener("scroll", function () { if (!pticking) { requestAnimationFrame(pxUpdate); pticking = true; } }, { passive: true });
    window.addEventListener("resize", pxUpdate);
    pxUpdate();
  }

  /* ---------- Count-up --------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var dec = (el.dataset.count.split(".")[1] || "").length;
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(dec);
      el.firstChild.nodeValue = Number(val).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
      else el.firstChild.nodeValue = target.toLocaleString("en-US");
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (reduce || !("IntersectionObserver" in window)) {
    counters.forEach(function (el) { el.firstChild.nodeValue = parseFloat(el.dataset.count).toLocaleString("en-US"); });
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Service category filter ------------------------------------ */
  var cats = document.querySelectorAll(".svc-cat");
  var svcs = document.querySelectorAll(".svc[data-cat], .article[data-cat]");
  if (cats.length) {
    cats.forEach(function (btn) {
      btn.addEventListener("click", function () {
        cats.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var f = btn.dataset.filter;
        svcs.forEach(function (s) {
          var show = f === "all" || s.dataset.cat === f;
          s.style.display = show ? "" : "none";
        });
      });
    });
    // Deep-link: /services.html#<category> activates that filter
    var hcat = location.hash.replace("#", "");
    var hbtn = document.querySelector('.svc-cat[data-filter="' + hcat + '"]');
    if (hbtn) {
      hbtn.click();
      var grid = document.getElementById("capabilities");
      if (grid) setTimeout(function () { grid.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); }, 60);
    }
  }

  /* ---------- Methodology active step (scroll-linked) -------------------- */
  var msteps = document.querySelectorAll(".mstep");
  var cyclesegs = document.querySelectorAll(".cycle [data-seg]");
  function setStep(i) {
    msteps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
    cyclesegs.forEach(function (s, k) { s.style.opacity = k === i ? "1" : "0.28"; });
  }
  if (msteps.length) {
    setStep(0);
    msteps.forEach(function (s, i) { s.addEventListener("mouseenter", function () { setStep(i); }); });
  }

  /* ---------- Contact form (client-side confirmation) -------------------- */
  var form = document.querySelector("#consult-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = form.querySelector(".form__ok");
      if (ok) { ok.classList.add("show"); ok.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        if (f.type !== "checkbox") f.value = "";
      });
    });
  }

  /* ---------- Footer year ------------------------------------------------ */
  var yr = document.querySelector("#year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Climate Timeline (scrollytelling) -------------------------- */
  var tl = document.getElementById("timeline");
  if (tl && window.matchMedia("(min-width: 861px)").matches && !reduce && !saveData) {
    var tlV0 = tl.querySelector('.tl__video[data-era="0"]');
    var tlV1 = tl.querySelector('.tl__video[data-era="1"]');
    var yearEl = document.getElementById("tl-year");
    var tempEl = document.getElementById("tl-temp");
    var noteEl = document.getElementById("tl-note");
    var spineEl = document.getElementById("tl-spine");
    var flagEl = document.getElementById("tl-flag");
    var tlScenes = tl.querySelectorAll(".tl-scene");
    var v1started = false;
    function clamp01(x) { return Math.max(0, Math.min(1, x)); }
    function tseg(p, a, b, c, d) { if (p <= a || p >= d) return 0; if (p < b) return (p - a) / (b - a); if (p > c) return 1 - (p - c) / (d - c); return 1; }
    function onTL() {
      var total = tl.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      var p = clamp01(-tl.getBoundingClientRect().top / total);
      var year = Math.round(1850 + p * 200);
      if (yearEl) yearEl.textContent = year;
      var temp;
      if (p < 0.62) { var q = clamp01((p - 0.12) / 0.50); temp = 1.5 * q * q; } // flat, then steep
      else { temp = 1.5 - ((p - 0.62) / 0.38) * 0.35; } // ease back as removals bite
      if (tempEl) tempEl.textContent = temp.toFixed(1);
      if (noteEl) noteEl.textContent = p < 0.12 ? "pre-industrial baseline" : (p < 0.62 ? "warming, vs 1850" : "target: net zero by 2050");
      // era crossfade: glacier → renewables
      var toRenew = clamp01((p - 0.55) / 0.18);
      if (tlV0) tlV0.style.opacity = (1 - toRenew).toFixed(3);
      if (tlV1) {
        tlV1.style.opacity = toRenew.toFixed(3);
        if (!v1started && toRenew > 0.02) { v1started = true; tlV1.preload = "auto"; var pr = tlV1.play && tlV1.play(); if (pr && pr.catch) pr.catch(function () {}); }
      }
      // chapters
      tlScenes.forEach(function (s, i) {
        var win = [[-1, 0, 0.16, 0.26], [0.24, 0.34, 0.46, 0.56], [0.54, 0.62, 0.70, 0.78], [0.76, 0.84, 1.2, 1.3]][i];
        var o = i === 0 && p < 0.02 ? 1 : tseg(p, win[0], win[1], win[2], win[3]);
        s.style.opacity = o.toFixed(3);
        s.style.transform = "translateY(" + ((1 - o) * 30).toFixed(1) + "px)";
      });
      // heating spine + flag
      if (spineEl) spineEl.style.width = (p * 100).toFixed(1) + "%";
      if (flagEl) { flagEl.style.left = (p * 100).toFixed(1) + "%"; flagEl.textContent = year; }
    }
    window.addEventListener("scroll", onTL, { passive: true });
    window.addEventListener("resize", onTL);
    onTL();
  }

  /* ---------- Horizontal reel (scroll-driven act) ------------------------ */
  document.querySelectorAll("[data-reel]").forEach(function (reel) {
    if (!window.matchMedia("(min-width: 861px)").matches || reduce) return;
    var track = reel.querySelector(".reel__track");
    var bar = reel.querySelector(".reel__progress i");
    if (!track) return;
    function layout() {
      var dist = Math.max(0, track.scrollWidth - window.innerWidth);
      reel.style.height = (window.innerHeight + dist) + "px";
    }
    function onReel() {
      var total = reel.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      var p = Math.min(1, Math.max(0, -reel.getBoundingClientRect().top / total));
      var dist = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = "translate3d(" + (-(dist * p)).toFixed(1) + "px,0,0)";
      if (bar) bar.style.width = (p * 100).toFixed(1) + "%";
    }
    layout(); onReel();
    window.addEventListener("resize", function () { layout(); onReel(); });
    window.addEventListener("scroll", onReel, { passive: true });
    // recompute after fonts/images settle
    setTimeout(function () { layout(); onReel(); }, 800);
  });

  /* ---------- FAQ accordion ---------------------------------------------- */
  document.querySelectorAll(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq__item");
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Cinematic video: guard perf on small screens / data-saver -- */
  var cines = document.querySelectorAll(".cinema__video, .film__video, .tl__video");
  var smallScreen = window.matchMedia("(max-width: 700px)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (cines.length && (reduce || smallScreen || saveData)) {
    cines.forEach(function (cine) {
      cine.removeAttribute("autoplay");
      cine.preload = "none";
      try { cine.pause(); } catch (e) {}
    });
  }

  /* ---------- Cinematic scroll-film hero (pinned + video scrub) ---------- */
  var film = document.getElementById("film");
  if (film && window.matchMedia("(min-width: 861px)").matches && !reduce && !saveData) {
    var fvideo = document.getElementById("film-video");
    fvideo.removeAttribute("loop"); fvideo.removeAttribute("autoplay");
    fvideo.preload = "auto"; try { fvideo.pause(); } catch (e) {}
    var fscenes = film.querySelectorAll(".scene");
    var fscrim = film.querySelector(".film__scrim");
    var fbar = document.getElementById("film-bar");
    var fcue = document.getElementById("film-cue");
    var fdur = 0, tTime = 0, cTime = 0;
    fvideo.addEventListener("loadedmetadata", function () { fdur = fvideo.duration || 0; });
    function seg(p, a, b, c, d) { if (p <= a || p >= d) return 0; if (p < b) return (p - a) / (b - a); if (p > c) return 1 - (p - c) / (d - c); return 1; }
    function applyScene(s, o) { if (!s) return; s.style.opacity = o.toFixed(3); s.style.transform = "translateY(" + ((1 - o) * 40).toFixed(1) + "px)"; s.style.pointerEvents = o > 0.6 ? "auto" : "none"; }
    function onFilm() {
      var total = film.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      var p = Math.min(1, Math.max(0, -film.getBoundingClientRect().top / total));
      applyScene(fscenes[0], p < 0.02 ? 1 : seg(p, -1, 0, 0.16, 0.30));
      applyScene(fscenes[1], seg(p, 0.30, 0.40, 0.55, 0.66));
      applyScene(fscenes[2], seg(p, 0.66, 0.76, 1.2, 1.3));
      if (fdur) tTime = p * (fdur - 0.05);
      fvideo.style.transform = "scale(" + (1 + p * 0.16).toFixed(3) + ")";
      if (fscrim) fscrim.style.opacity = (0.5 + p * 0.45).toFixed(2);
      if (fbar) fbar.style.width = (p * 100).toFixed(1) + "%";
      if (fcue) fcue.style.opacity = p > 0.04 ? "0" : "1";
    }
    window.addEventListener("scroll", onFilm, { passive: true });
    window.addEventListener("resize", onFilm);
    onFilm();
    (function seek() {
      requestAnimationFrame(seek);
      if (!fdur) return;
      cTime += (tTime - cTime) * 0.16;
      if (Math.abs(tTime - cTime) > 0.008) { try { fvideo.currentTime = cTime; } catch (e) {} }
    })();
  }

  /* ---------- Region list ↔ 3D globe -------------------------------------- */
  document.querySelectorAll(".region[data-idx]").forEach(function (r) {
    var i = parseInt(r.dataset.idx, 10);
    r.addEventListener("mouseenter", function () { if (window.__earthFocus) window.__earthFocus(i); });
    r.addEventListener("mouseleave", function () { if (window.__earthBlur) window.__earthBlur(); });
    r.addEventListener("click", function () { if (window.__earthFocus) window.__earthFocus(i); });
  });

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Cursor glow (desktop, fine pointer) ------------------------ */
  if (fine && !reduce) {
    var glow = document.createElement("div");
    glow.className = "cursor-glow";
    document.body.appendChild(glow);
    var gx = 0, gy = 0, cx = 0, cy = 0, gvis = false, graf;
    function gloop() {
      cx += (gx - cx) * 0.15; cy += (gy - cy) * 0.15;
      glow.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      graf = requestAnimationFrame(gloop);
    }
    window.addEventListener("mousemove", function (e) {
      gx = e.clientX; gy = e.clientY;
      if (!gvis) { glow.style.opacity = "1"; gvis = true; }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { glow.style.opacity = "0"; gvis = false; });
    gloop();

    // precise dot + trailing ring with hover states
    document.documentElement.classList.add("has-cursor");
    var dot = document.createElement("div"); dot.className = "cur-dot";
    var ring = document.createElement("div"); ring.className = "cur-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var rx = 0, ry = 0;
    function cloop() {
      rx += (gx - rx) * 0.2; ry += (gy - ry) * 0.2;
      dot.style.transform = "translate(" + gx + "px," + gy + "px) translate(-50%,-50%)";
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px) translate(-50%,-50%)";
      requestAnimationFrame(cloop);
    }
    cloop();
    var hoverSel = "a, button, .svc, .sol, .region, .faq__q, .article, .post, .value, .ind, .svc-cat, .chapters a";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) { ring.classList.add("is-hover"); dot.classList.add("is-hover"); }
    });
    document.addEventListener("mouseout", function (e) {
      var to = e.relatedTarget;
      if (e.target.closest && e.target.closest(hoverSel) && !(to && to.closest && to.closest(hoverSel))) {
        ring.classList.remove("is-hover"); dot.classList.remove("is-hover");
      }
    });

    /* ---------- Magnetic primary CTAs ------------------------------------ */
    document.querySelectorAll(".btn--primary, .btn--light").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + (mx * 0.18).toFixed(1) + "px," + (my * 0.28 - 2).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });

    /* ---------- 3D tilt cards -------------------------------------------- */
    document.querySelectorAll(".svc, .value, .post, .ind").forEach(function (card) {
      card.classList.add("tilt");
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(760px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 5).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Lazy-load the 3D Earth (Three.js) near viewport ------------ */
  var earthEl = document.getElementById("earth3d");
  if (earthEl && !reduce) {
    var earthLoaded = false;
    function loadEarth() {
      if (earthLoaded) return; earthLoaded = true;
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.onload = function () {
        var e = document.createElement("script");
        e.src = "assets/js/earth.js";
        document.body.appendChild(e);
      };
      document.body.appendChild(s);
    }
    if ("IntersectionObserver" in window) {
      var eo = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { loadEarth(); eo.disconnect(); }
      }, { rootMargin: "600px" });
      eo.observe(earthEl);
    }
    // Fallbacks so the globe always initialises past first paint
    window.addEventListener("scroll", loadEarth, { once: true, passive: true });
    window.addEventListener("touchstart", loadEarth, { once: true, passive: true });
    setTimeout(loadEarth, 4500);
  }

  /* ---------- Hero canvas: atmospheric carbon-flow field ----------------- */
  var canvas = document.querySelector("#hero-canvas");
  if (canvas && !reduce) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, particles = [], mouse = { x: -999, y: -999 };
    var COUNT = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      COUNT = Math.min(90, Math.floor((W * H) / 16000));
      init();
    }
    function init() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        // gentle mouse repulsion
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { var f = (14000 - d2) / 14000 * 0.4; p.x += dx / Math.sqrt(d2) * f; p.y += dy / Math.sqrt(d2) * f; }
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(12,77,86,0.55)";
        ctx.fill();
      }
      // connective lines
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var pa = particles[a], pb = particles[b];
          var ddx = pa.x - pb.x, ddy = pa.y - pb.y, dist = ddx * ddx + ddy * ddy;
          if (dist < 12000) {
            var op = (1 - dist / 12000) * 0.32;
            ctx.strokeStyle = "rgba(47,191,168," + op + ")";
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }
    var raf;
    window.addEventListener("mousemove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    window.addEventListener("mouseleave", function () { mouse.x = -999; mouse.y = -999; });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(resize, 180); });
    resize();
    tick();
    // pause when off-screen
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); } else { raf = requestAnimationFrame(tick); }
    });
  }
})();

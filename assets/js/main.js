/* ==========================================================================
   OffsetEase v4.3 — Interaction layer
   ========================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- Scroll reveal ---------------------------------------------- */
  var revs = document.querySelectorAll(".reveal");
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

  /* ---------- FAQ accordion ---------------------------------------------- */
  document.querySelectorAll(".faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq__item");
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Cinematic video: guard perf on small screens / data-saver -- */
  var cine = document.querySelector(".cinema__video");
  if (cine) {
    var small = window.matchMedia("(max-width: 700px)").matches;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || small || saveData) {
      cine.removeAttribute("autoplay");
      cine.preload = "none";
      try { cine.pause(); } catch (e) {}
      // keep the poster image as a still backdrop
    }
  }

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

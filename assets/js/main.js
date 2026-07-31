/* LuGa-Tech – Interaktionen (Vanilla JS, keine externen Abhängigkeiten) */
(function () {
  "use strict";

  /* ---------- Sticky Header Schatten ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile Navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on Scroll ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Zähler (Stats) ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var cio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              animateCount(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
    }
  }

  /* ---------- Akkordeon ---------- */
  document.querySelectorAll(".accordion").forEach(function (acc) {
    acc.querySelectorAll(".acc-item").forEach(function (item) {
      var btn = item.querySelector(".acc-btn");
      var panel = item.querySelector(".acc-panel");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        acc.querySelectorAll(".acc-item.open").forEach(function (o) {
          o.classList.remove("open");
          o.querySelector(".acc-panel").style.maxHeight = null;
          o.querySelector(".acc-btn").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
    /* erstes Element öffnen */
    var first = acc.querySelector(".acc-item");
    if (first) {
      first.classList.add("open");
      var fp = first.querySelector(".acc-panel");
      fp.style.maxHeight = fp.scrollHeight + "px";
      first.querySelector(".acc-btn").setAttribute("aria-expanded", "true");
    }
  });

  /* ---------- Druckluft-Partikel im Hero (Canvas, interaktiv) ----------
     Maus = Luftdüse: Partikel werden weggeblasen und beschleunigt.
     Klick/Tipp = Druckluft-Stoß mit Partikel-Burst und Druckwelle. */
  var canvas = document.querySelector(".hero-canvas");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var particles = [];
    var bursts = [];
    var shockwaves = [];
    var mouse = { x: -99999, y: -99999, vx: 0, vy: 0, lastX: 0, lastY: 0 };
    var W, H;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * dpr;
      H = canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(initial) {
      var r = (2 + Math.random() * 7) * dpr;
      return {
        x: initial ? Math.random() * W : -r * 2,
        y: H * (0.05 + Math.random() * 0.9),
        r: r,
        vx: (0.35 + Math.random() * 0.9) * dpr,
        vy: 0,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.004 + Math.random() * 0.012,
        alpha: 0.1 + Math.random() * 0.24
      };
    }
    var COUNT = Math.min(70, Math.floor(window.innerWidth / 17));
    for (var i = 0; i < COUNT; i++) particles.push(spawn(true));

    /* Maus-/Touch-Interaktion auf dem gesamten Hero */
    var hero = canvas.closest(".hero");
    function toCanvas(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
    }
    hero.addEventListener("pointermove", function (e) {
      var pos = toCanvas(e);
      mouse.vx = pos.x - mouse.lastX;
      mouse.vy = pos.y - mouse.lastY;
      mouse.lastX = pos.x;
      mouse.lastY = pos.y;
      mouse.x = pos.x;
      mouse.y = pos.y;
    });
    hero.addEventListener("pointerleave", function () {
      mouse.x = -99999;
      mouse.y = -99999;
    });
    hero.addEventListener("click", function (e) {
      var pos = toCanvas(e);
      airBlast(pos.x, pos.y);
    });

    function airBlast(x, y) {
      shockwaves.push({ x: x, y: y, r: 6 * dpr, alpha: 0.5 });
      for (var i = 0; i < 22; i++) {
        var ang = Math.random() * Math.PI * 2;
        var speed = (2.5 + Math.random() * 6) * dpr;
        bursts.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          r: (1.5 + Math.random() * 4) * dpr,
          life: 1
        });
      }
      /* bestehende Partikel wegdrücken */
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        var dx = p.x - x, dy = p.y - y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < 320 * dpr) {
          var f = (1 - d / (320 * dpr)) * 14 * dpr;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }
    }

    var NOZZLE_R = 150;
    function tick() {
      ctx.clearRect(0, 0, W, H);

      /* Druckwellen */
      for (var s = shockwaves.length - 1; s >= 0; s--) {
        var w = shockwaves[s];
        w.r += 9 * dpr;
        w.alpha *= 0.92;
        if (w.alpha < 0.02) { shockwaves.splice(s, 1); continue; }
        ctx.strokeStyle = "rgba(47,180,233," + w.alpha + ")";
        ctx.lineWidth = 2.5 * dpr;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* Dauer-Partikel */
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        /* Luftdüse: Maus bläst Partikel weg */
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < NOZZLE_R * dpr && dist > 0.001) {
          var force = (1 - dist / (NOZZLE_R * dpr)) * 1.6 * dpr;
          p.vx += (dx / dist) * force + mouse.vx * 0.02;
          p.vy += (dy / dist) * force + mouse.vy * 0.02;
        }

        /* Grundströmung + Dämpfung zurück zur Ruhe */
        p.drift += p.driftSpeed;
        p.x += p.vx;
        p.y += p.vy + Math.sin(p.drift) * 0.35 * dpr;
        p.vx += (0.6 * dpr - p.vx) * 0.02;
        p.vy *= 0.94;

        if (p.x - p.r * 2 > W || p.y < -40 * dpr || p.y > H + 40 * dpr) {
          particles[i] = spawn(false);
          continue;
        }

        /* Bewegungs-Schweif bei schnellen Partikeln */
        var speed2 = p.vx * p.vx + p.vy * p.vy;
        if (speed2 > 4 * dpr * dpr) {
          ctx.strokeStyle = "rgba(47,180,233," + p.alpha * 0.5 + ")";
          ctx.lineWidth = Math.max(1, p.r * 0.4);
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 3.5, p.y - p.vy * 3.5);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, "rgba(47,180,233," + p.alpha + ")");
        g.addColorStop(1, "rgba(47,180,233,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Burst-Partikel (Druckluft-Stoß) */
      for (var b = bursts.length - 1; b >= 0; b--) {
        var q = bursts[b];
        q.x += q.vx;
        q.y += q.vy;
        q.vx *= 0.955;
        q.vy *= 0.955;
        q.life -= 0.016;
        if (q.life <= 0) { bursts.splice(b, 1); continue; }
        ctx.fillStyle = "rgba(47,180,233," + 0.5 * q.life + ")";
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r * q.life, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- Kontaktformular (mailto) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = form.querySelector("#cf-name").value.trim();
      var firma = form.querySelector("#cf-firma").value.trim();
      var email = form.querySelector("#cf-email").value.trim();
      var tel = form.querySelector("#cf-tel").value.trim();
      var thema = form.querySelector("#cf-thema").value;
      var msg = form.querySelector("#cf-msg").value.trim();

      var body =
        "Name: " + name + "\n" +
        (firma ? "Firma: " + firma + "\n" : "") +
        "E-Mail: " + email + "\n" +
        (tel ? "Telefon: " + tel + "\n" : "") +
        "\n" + msg;

      var subject = "Anfrage über die Website – " + thema;
      window.location.href =
        "mailto:office@lugatech.at?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      var ok = document.querySelector(".form-success");
      if (ok) ok.classList.add("show");
    });
  }

  /* ---------- Aktuelles Jahr im Footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

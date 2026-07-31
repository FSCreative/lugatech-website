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

  /* ---------- Druckluft-Partikel im Hero (Canvas) ---------- */
  var canvas = document.querySelector(".hero-canvas");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * window.devicePixelRatio;
      H = canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(initial) {
      var r = (2 + Math.random() * 7) * window.devicePixelRatio;
      return {
        x: initial ? Math.random() * W : -r * 2,
        y: H * (0.1 + Math.random() * 0.8),
        r: r,
        vx: (0.35 + Math.random() * 0.9) * window.devicePixelRatio,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.004 + Math.random() * 0.012,
        alpha: 0.08 + Math.random() * 0.22
      };
    }
    var COUNT = Math.min(46, Math.floor(window.innerWidth / 26));
    for (var i = 0; i < COUNT; i++) particles.push(spawn(true));

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.drift += p.driftSpeed;
        p.y += Math.sin(p.drift) * 0.35 * window.devicePixelRatio;
        if (p.x - p.r * 2 > W) particles[i] = spawn(false);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, "rgba(47,180,233," + p.alpha + ")");
        g.addColorStop(1, "rgba(47,180,233,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
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

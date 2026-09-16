(function () {
  var WORDS = ["prove", "pledge", "settle", "disclose"];
  var HOW_CODE = [
    "facility.create({\n  id: 'FAC-001',\n  advanceRateBps: 8000,\n  fundVault: true\n})",
    "collateral.import({\n  scenario: 'eligible-batch',\n  slots: 8,\n  privacy: 'masked'\n})",
    "await draw.prove({\n  amountMinor: 75_000_00,\n  epoch: currentEpoch()\n})",
    "result.settle()\n// funded → history.append(receipt)",
  ];
  var DEV_CODE = [
    "import { schema } from '@phrim/schema'\n\nconst facility = schema.facility.parse({\n  creditLimitMinor: 500_000_00,\n  advanceRateBps: 8000\n})",
    "const proof = await prover.prove({\n  credentials,\n  requestedMinor,\n  nullifiers\n})",
    "await contract.requestDraw({\n  proof,\n  publicDisclosure\n})",
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function setupNav() {
    var nav = $("nav");
    var menuBtn = $("menuBtn");
    var mobileMenu = $("mobileMenu");
    var menuClose = $("menuClose");
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function openMenu() {
      if (!mobileMenu || !menuBtn) return;
      mobileMenu.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      if (!mobileMenu || !menuBtn) return;
      mobileMenu.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    if (menuBtn) {
      menuBtn.addEventListener("click", function () {
        if (mobileMenu && mobileMenu.hidden) openMenu();
        else closeMenu();
      });
    }
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    if (mobileMenu) {
      mobileMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeMenu);
      });
    }
  }

  function setupRotateWord() {
    var el = $("rotateWord");
    if (!el) return;
    var i = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setInterval(function () {
      i = (i + 1) % WORDS.length;
      el.style.opacity = "0";
      el.style.filter = "blur(8px)";
      el.style.transform = "translateY(40%)";
      setTimeout(function () {
        el.textContent = WORDS[i];
        el.style.transition = "opacity 0.45s cubic-bezier(0.22,1,0.36,1), filter 0.45s, transform 0.45s";
        el.style.opacity = "1";
        el.style.filter = "blur(0)";
        el.style.transform = "translateY(0)";
      }, 180);
    }, 2500);
  }

  function setupReveals() {
    var nodes = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatNumber(value, decimals) {
    if (decimals > 0) return value.toFixed(decimals);
    return Math.round(value).toLocaleString("en-US");
  }

  function setupMetrics() {
    var cells = Array.prototype.slice.call(document.querySelectorAll(".metric-cell[data-target]"));
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(el, index) {
      var target = Number(el.getAttribute("data-target"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = Number(el.getAttribute("data-decimals") || "0");
      var valueEl = el.querySelector(".metric-cell__value");
      if (!valueEl) return;
      if (reduce) {
        valueEl.textContent = prefix + formatNumber(target, decimals) + suffix;
        return;
      }
      var duration = 2000;
      var startAt = performance.now() + index * 80;
      function tick(now) {
        if (now < startAt) {
          requestAnimationFrame(tick);
          return;
        }
        var p = Math.min((now - startAt) / duration, 1);
        valueEl.textContent = prefix + formatNumber(target * easeOutCubic(p), decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      cells.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target, cells.indexOf(entry.target));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    cells.forEach(function (el) {
      io.observe(el);
    });
  }

  function typeCode(el, text, done) {
    if (!el) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.textContent = text;
      if (done) done();
      return;
    }
    el.textContent = "";
    var i = 0;
    function step() {
      if (i > text.length) {
        if (done) done();
        return;
      }
      el.textContent = text.slice(0, i);
      i += 1;
      setTimeout(step, 12);
    }
    step();
  }

  function setupHowSteps() {
    var steps = Array.prototype.slice.call(document.querySelectorAll(".how-step"));
    var codeEl = $("howCode");
    if (!steps.length || !codeEl) return;
    var index = 0;
    var timer = null;

    function setActive(next) {
      index = next;
      steps.forEach(function (s, i) {
        s.classList.toggle("is-active", i === index);
      });
      typeCode(codeEl, HOW_CODE[index] || "");
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        setActive((index + 1) % steps.length);
      }, 5000);
    }

    steps.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setActive(Number(btn.getAttribute("data-step") || "0"));
      });
    });
    setActive(0);
  }

  function setupInfrastructure() {
    var rows = Array.prototype.slice.call(document.querySelectorAll("#infraRows .infra-row"));
    if (!rows.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    var index = 0;
    setInterval(function () {
      index = (index + 1) % rows.length;
      rows.forEach(function (row, i) {
        row.classList.toggle("is-active", i === index);
      });
    }, 2000);
  }

  function setupDevTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".code-panel__tabs button"));
    var codeEl = $("devCode");
    if (!tabs.length || !codeEl) return;
    function activate(i) {
      tabs.forEach(function (t, idx) {
        t.classList.toggle("is-active", idx === i);
      });
      typeCode(codeEl, DEV_CODE[i] || "");
    }
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(Number(tab.getAttribute("data-tab") || "0"));
      });
    });
    activate(0);
  }

  function setupCtaSpotlight() {
    var frame = $("ctaFrame");
    if (!frame) return;
    frame.addEventListener("mousemove", function (e) {
      var rect = frame.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      frame.style.setProperty("--mx", x + "%");
      frame.style.setProperty("--my", y + "%");
    });
  }

  function setupLiveClock() {
    var el = $("liveClock");
    if (!el) return;
    function tick() {
      el.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    }
    tick();
    setInterval(tick, 1000);
  }

  function setupYear() {
    var el = $("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function createAsciiSphere(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var chars = ".:-=+*#%@";
    var time = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var radius = Math.min(rect.width, rect.height) * 0.42;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var points = [];
      for (var phi = 0; phi < Math.PI * 2; phi += 0.18) {
        for (var theta = 0; theta < Math.PI; theta += 0.18) {
          var x = Math.sin(theta) * Math.cos(phi + time * 0.5);
          var y = Math.sin(theta) * Math.sin(phi + time * 0.5);
          var z = Math.cos(theta);
          var rotY = time * 0.25;
          var nx = x * Math.cos(rotY) - z * Math.sin(rotY);
          var nz = x * Math.sin(rotY) + z * Math.cos(rotY);
          var rotX = time * 0.15;
          var ny = y * Math.cos(rotX) - nz * Math.sin(rotX);
          var fz = y * Math.sin(rotX) + nz * Math.cos(rotX);
          var depth = (fz + 1) / 2;
          points.push({
            x: cx + nx * radius,
            y: cy + ny * radius,
            z: fz,
            char: chars[Math.floor(depth * (chars.length - 1))],
          });
        }
      }
      points.sort(function (a, b) {
        return a.z - b.z;
      });
      points.forEach(function (p) {
        var alpha = 0.12 + (p.z + 1) * 0.28;
        ctx.fillStyle = "rgba(20,16,12," + alpha.toFixed(3) + ")";
        ctx.fillText(p.char, p.x, p.y);
      });
    }

    function loop() {
      time += 0.02;
      render();
      if (!reduce) requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (reduce) render();
    });
    if (reduce) render();
    else loop();
  }

  function createAsciiWave(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var chars = ".:-=+*#";
    var t = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      var step = 10;
      ctx.font = '10px "JetBrains Mono", monospace';
      for (var y = 0; y < rect.height; y += step) {
        for (var x = 0; x < rect.width; x += step) {
          var wave = Math.sin(x * 0.02 + t) * Math.cos(y * 0.03 - t * 0.7);
          var b = (wave + 1) / 2;
          if (b < 0.45) continue;
          var idx = Math.min(chars.length - 1, Math.floor(b * chars.length));
          ctx.fillStyle = "rgba(20,16,12," + (0.08 + b * 0.25).toFixed(3) + ")";
          ctx.fillText(chars[idx], x, y);
        }
      }
    }

    function loop() {
      t += 0.04;
      render();
      if (!reduce) requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (reduce) render();
    });
    if (reduce) render();
    else loop();
  }

  function createAsciiTetra(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var t = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var verts = [
      [1, 1, 1],
      [-1, -1, 1],
      [-1, 1, -1],
      [1, -1, -1],
    ];
    var edges = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project(v) {
      var rect = canvas.getBoundingClientRect();
      var scale = Math.min(rect.width, rect.height) * 0.28;
      var cy = Math.cos(t * 0.7);
      var sy = Math.sin(t * 0.7);
      var cx = Math.cos(t * 0.5);
      var sx = Math.sin(t * 0.5);
      var x = v[0];
      var y = v[1];
      var z = v[2];
      var xz = x * cy - z * sy;
      var zz = x * sy + z * cy;
      var yz = y * cx - zz * sx;
      var zz2 = y * sx + zz * cx;
      return {
        x: rect.width / 2 + xz * scale,
        y: rect.height / 2 + yz * scale,
        z: zz2,
      };
    }

    function render() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      var pts = verts.map(project);
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(20,16,12,0.45)";
      edges.forEach(function (e) {
        var a = pts[e[0]];
        var b = pts[e[1]];
        var steps = 18;
        for (var i = 0; i <= steps; i++) {
          var p = i / steps;
          var x = a.x + (b.x - a.x) * p;
          var y = a.y + (b.y - a.y) * p;
          ctx.fillText("·", x, y);
        }
      });
      pts.forEach(function (p) {
        ctx.fillText("█", p.x, p.y);
      });
    }

    function loop() {
      t += 0.02;
      render();
      if (!reduce) requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", function () {
      resize();
      if (reduce) render();
    });
    if (reduce) render();
    else loop();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupRotateWord();
    setupReveals();
    setupMetrics();
    setupHowSteps();
    setupInfrastructure();
    setupDevTabs();
    setupCtaSpotlight();
    setupLiveClock();
    setupYear();
    createAsciiSphere($("heroSphere"));
    createAsciiWave($("footerWave"));
    createAsciiTetra($("ctaAscii"));
  });
})();

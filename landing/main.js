(function () {
  var RAMP = " .:-=+*#%@";
  var CELL_WIDTH = 9;
  var CELL_HEIGHT = 16;
  var MAX_DPR = 1.5;

  function createNeuralField(canvas) {
    var ctx = canvas.getContext("2d");
    var running = false;
    var visible = true;
    var raf = null;
    var startTime = performance.now();
    var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function fieldValue(x, y, t) {
      var wave1 = Math.sin(x * 0.18 + t * 0.6);
      var wave2 = Math.sin(y * 0.24 - t * 0.4);
      var wave3 = Math.sin((x + y) * 0.12 + t * 0.25);
      var wave4 = Math.sin(Math.sqrt(x * x + y * y) * 0.1 - t * 0.5);
      return (wave1 + wave2 + wave3 + wave4) / 4;
    }

    function render(time) {
      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var width = canvas.width / dpr;
      var height = canvas.height / dpr;
      var columns = Math.max(1, Math.floor(width / CELL_WIDTH));
      var rows = Math.max(1, Math.floor(height / CELL_HEIGHT));

      ctx.clearRect(0, 0, width, height);
      ctx.font = Math.floor(CELL_HEIGHT * 0.82) + 'px "GeistPixelCircle", monospace';
      ctx.textBaseline = "top";

      for (var row = 0; row < rows; row += 1) {
        for (var col = 0; col < columns; col += 1) {
          var value = fieldValue(col, row, time);
          var brightness = (value + 1) / 2;
          if (brightness < 0.34) {
            continue;
          }
          var glyphIndex = Math.min(RAMP.length - 1, Math.floor(brightness * RAMP.length));
          var char = RAMP[glyphIndex];
          if (char === " ") {
            continue;
          }
          var alpha = Math.min(1, Math.max(0.05, brightness));
          ctx.fillStyle = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
          ctx.fillText(char, col * CELL_WIDTH, row * CELL_HEIGHT);
        }
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotionQuery.matches) {
        render(0);
      }
    }

    function loop(now) {
      if (!running) {
        return;
      }
      if (!visible) {
        raf = requestAnimationFrame(loop);
        return;
      }
      var elapsed = (now - startTime) / 1000;
      render(elapsed);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      running = true;
      if (reduceMotionQuery.matches) {
        render(0);
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      visible = document.visibilityState === "visible";
    });
    reduceMotionQuery.addEventListener("change", function () {
      render(0);
    });

    resize();
    start();

    return { stop: stop };
  }

  function setupDrawer() {
    var hamburger = document.getElementById("hamburger");
    var backdrop = document.getElementById("drawerBackdrop");
    if (!hamburger || !backdrop) {
      return;
    }

    function close() {
      backdrop.hidden = true;
      hamburger.setAttribute("aria-expanded", "false");
    }

    function open() {
      backdrop.hidden = false;
      hamburger.setAttribute("aria-expanded", "true");
    }

    hamburger.addEventListener("click", function () {
      if (backdrop.hidden) {
        open();
      } else {
        close();
      }
    });

    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatNumber(value, decimals) {
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return Math.round(value).toLocaleString("en-US");
  }

  function setupMetricCounters() {
    var metrics = Array.prototype.slice.call(document.querySelectorAll(".metric[data-target]"));
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(el, index) {
      var target = Number(el.getAttribute("data-target"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = Number(el.getAttribute("data-decimals") || "0");
      var valueEl = el.querySelector(".metric__value");

      if (reduceMotion) {
        valueEl.textContent = prefix + formatNumber(target, decimals) + suffix;
        return;
      }

      var duration = 1500 + index * 80;
      var delay = 480 + index * 90;
      var startAt = performance.now() + delay;

      function tick(now) {
        if (now < startAt) {
          requestAnimationFrame(tick);
          return;
        }
        var elapsed = now - startAt;
        var progress = Math.min(elapsed / duration, 1);
        var value = target * easeOutCubic(progress);
        valueEl.textContent = prefix + formatNumber(value, decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var index = metrics.indexOf(entry.target);
            animate(entry.target, index);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    metrics.forEach(function (el) {
      observer.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("phrim-ascii-bg");
    if (canvas) {
      createNeuralField(canvas);
    }
    setupDrawer();
    setupMetricCounters();
  });
})();

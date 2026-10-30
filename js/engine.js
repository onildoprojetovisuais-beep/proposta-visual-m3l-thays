/* Engine — estado da apresentação a partir da posição real do scroll.
   Modos:
     stage  : desktop/tablet ≥768px, palcos sticky com estados de leitura.
     flow   : <768px, fluxo vertical com reveals leves, sem sticky.
     static : prefers-reduced-motion, toggle "Sem animação", ?static=1 ou impressão.
   Nada avança por timer: o estado é sempre função de scrollY. */
(function () {
  "use strict";
  var PS = (window.PS = window.PS || {});
  var html = document.documentElement;

  var STORE_KEY = "ps-proposta-static";
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqNarrow = window.matchMedia("(max-width: 767px)");
  var params = new URLSearchParams(location.search);

  var state = {
    mode: null,
    stages: [],
    reveals: [],
    parallax: [],
    stops: [],
    vh: window.innerHeight,
    brand: null,
    raf: 0,
    printing: false
  };
  PS.state = state;

  /* ---------- preferências ---------- */
  function readStored() {
    try { return window.localStorage.getItem(STORE_KEY) === "1"; } catch (e) { return false; }
  }
  function writeStored(v) {
    try { window.localStorage.setItem(STORE_KEY, v ? "1" : "0"); } catch (e) { /* sem storage: só sessão */ }
  }
  PS.staticForced = function () { return mqReduce.matches || params.get("static") === "1"; };
  PS.staticPreferred = function () { return PS.staticForced() || readStored(); };
  PS.setStaticPreference = function (v) { writeStored(v); applyMode(true); };

  function pickMode() {
    if (state.printing || PS.staticPreferred()) return "static";
    if (mqNarrow.matches) return "flow";
    return "stage";
  }

  /* ---------- coleta ---------- */
  function collect() {
    state.stages = [];
    document.querySelectorAll(".scene.stage").forEach(function (s) {
      state.stages.push({
        el: s,
        kind: "states",
        n: parseInt(s.getAttribute("data-states"), 10) || 1,
        steps: s.querySelectorAll("[data-step]"),
        onlys: s.querySelectorAll("[data-only]"),
        current: -1
      });
    });
    state.reveals = Array.prototype.slice.call(document.querySelectorAll(".rv"));
    state.parallax = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  }

  /* ---------- palco das marcas (contrato BrandMotion) ---------- */
  function brandData() {
    var sc = (PS.scenes || []).filter(function (x) { return x.type === "brands"; })[0];
    return sc ? sc.data : null;
  }
  function setupBrand(mode) {
    var sec = document.getElementById("marcas");
    if (!sec) { state.brand = null; return; }
    var root = document.getElementById("brand-motion-root");
    var data = brandData();
    var BM = window.BrandMotion;
    root.innerHTML = "";
    sec.style.height = "";
    sec.removeAttribute("data-brand-mode");
    if (BM && typeof BM.mount === "function" && mode === "stage") {
      sec.style.height = (BM.lengthVh || 400) + "vh";
      sec.setAttribute("data-brand-mode", "motion");
      try {
        BM.mount(root, data);
        state.brand = { el: sec, BM: BM, stops: (BM.stops && BM.stops.length ? BM.stops : [0]), last: -1, theme: "light" };
        return;
      } catch (e) {
        if (window.console) console.error("BrandMotion.mount falhou; usando versão estática.", e);
        root.innerHTML = "";
        sec.style.height = "";
      }
    }
    if (BM && typeof BM.renderStatic === "function") {
      sec.setAttribute("data-brand-mode", "static");
      try { BM.renderStatic(root, data); state.brand = null; return; }
      catch (e) { if (window.console) console.error("BrandMotion.renderStatic falhou; usando fallback.", e); root.innerHTML = ""; }
    }
    sec.setAttribute("data-brand-mode", "fallback");
    brandFallback(root, data);
    state.brand = null;
  }

  /* Fallback mínimo (só enquanto js/brand-motion.js não existir): mesmos textos, fluxo vertical. */
  function brandFallback(root, d) {
    if (!d) return;
    var T = PS.tidy;
    var wrap = document.createElement("div");
    wrap.className = "brand-fallback";
    var a = document.createElement("div");
    a.className = "frame brand-fallback__a";
    a.innerHTML = "";
    var h = document.createElement("h2"); h.className = "t-title rv"; h.textContent = T(d.title03); a.appendChild(h);
    var row = document.createElement("div"); row.className = "brand-fallback__logos rv";
    d.logos.forEach(function (src, i) {
      var fig = document.createElement("figure");
      var img = document.createElement("img"); img.src = src; img.alt = d.labels[i]; img.width = 305; img.height = 129;
      var cap = document.createElement("figcaption"); cap.className = "eyebrow"; cap.textContent = d.labels[i];
      fig.appendChild(img); fig.appendChild(cap); row.appendChild(fig);
    });
    a.appendChild(row);
    var p = document.createElement("p"); p.className = "t-support rv"; p.textContent = T(d.support03); a.appendChild(p);
    var b = document.createElement("div");
    b.className = "frame brand-fallback__b";
    b.setAttribute("data-theme", "dark");
    [["p", "t-support t-support--soft rv", d.titleStart04], ["p", "brand-fallback__keyword rv", d.keyword], ["h2", "t-title rv", d.titleEnd04], ["p", "t-support rv", d.support04], ["p", "caption rv", d.caption]]
      .forEach(function (x) { var n = document.createElement(x[0]); n.className = x[1]; n.textContent = T(x[2]); b.appendChild(n); });
    wrap.appendChild(a); wrap.appendChild(b);
    root.appendChild(wrap);
  }

  /* ---------- modo ---------- */
  function applyMode(keepPlace) {
    var mode = pickMode();
    if (mode === state.mode && !keepPlace) return;
    var anchor = keepPlace ? PS.currentPlace() : null;
    html.classList.add("no-anim");
    html.classList.remove("m-stage", "m-flow", "m-static");
    html.classList.add("m-" + mode);
    state.mode = mode;
    setupBrand(mode);
    collect();
    state.stages.forEach(function (st) { st.current = -1; });
    measure();
    if (anchor) PS.goToPlace(anchor);
    update(true);
    if (PS.onModeChange) PS.onModeChange(mode);
    requestAnimationFrame(function () { requestAnimationFrame(function () { html.classList.remove("no-anim"); }); });
  }
  PS.applyMode = applyMode;

  /* ---------- medidas e paradas ---------- */
  function absTop(node) { return node.getBoundingClientRect().top + window.scrollY; }

  function measure() {
    state.vh = window.innerHeight;
    var stops = [];
    var stepPx = state.vh * 0.6; // = --stage-step
    (document.querySelectorAll(".scene")).forEach(function (sec) {
      var top = Math.round(absTop(sec));
      var id = sec.id;
      if (state.mode === "stage" && sec.classList.contains("stage")) {
        var n = parseInt(sec.getAttribute("data-states"), 10) || 1;
        var anchors = sec.querySelectorAll("[data-anchor]");
        for (var i = 0; i < n; i++) {
          stops.push({ y: top + Math.round(i * stepPx) + (i ? 2 : 0), id: id, i: i, anchor: anchors[i] ? anchors[i].getAttribute("data-anchor") : null });
        }
      } else if (state.mode === "stage" && state.brand && sec === state.brand.el) {
        var L = sec.offsetHeight - state.vh;
        state.brand.stops.forEach(function (p, k) {
          stops.push({ y: top + Math.round(p * L) + (k ? 1 : 0), id: id, i: k });
        });
      } else {
        stops.push({ y: top, id: id, i: 0 });
        if (sec.classList.contains("stage")) {
          sec.querySelectorAll("[data-anchor]").forEach(function (a, k) {
            if (k) stops.push({ y: Math.round(absTop(a)), id: id, i: k, anchor: a.getAttribute("data-anchor") });
          });
        }
        sec.querySelectorAll("[data-stop]").forEach(function (a, k) {
          var y = Math.round(absTop(a));
          if (Math.abs(y - top) > 8) stops.push({ y: y, id: id, i: k + 1 });
        });
      }
    });
    var max = document.documentElement.scrollHeight - state.vh;
    stops.forEach(function (s) { s.y = Math.max(0, Math.min(s.y, max)); });
    stops.sort(function (a, b) { return a.y - b.y; });
    state.stops = stops.filter(function (s, k) { return k === 0 || s.y - stops[k - 1].y > 4; });
  }
  PS.measure = measure;

  /* ---------- quadro ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function update(force) {
    var vh = state.vh;
    var y = window.scrollY;

    if (state.mode === "stage") {
      state.stages.forEach(function (st) {
        var r = st.el.getBoundingClientRect();
        var L = st.el.offsetHeight - vh;
        var p = L > 0 ? clamp(-r.top / L, 0, 1) : 0;
        var i = Math.min(st.n - 1, Math.floor(p * st.n + 1e-6));
        st.el.style.setProperty("--p", p.toFixed(4));
        if (i !== st.current || force) {
          st.current = i;
          st.el.setAttribute("data-state", String(i));
          st.el.style.setProperty("--fill", st.n > 1 ? (i / (st.n - 1)).toFixed(4) : "1");
          st.steps.forEach(function (n) {
            var k = parseInt(n.getAttribute("data-step"), 10);
            n.classList.toggle("is-on", k <= i);
            n.classList.toggle("is-current", k === i);
          });
          var theme = null;
          st.onlys.forEach(function (n) {
            var on = parseInt(n.getAttribute("data-only"), 10) === i;
            n.classList.toggle("is-current", on);
            n.setAttribute("aria-hidden", on ? "false" : "true");
            if (on && n.getAttribute("data-theme")) theme = n.getAttribute("data-theme");
          });
          if (theme) st.el.setAttribute("data-theme-now", theme);
        }
      });
      if (state.brand) {
        var b = state.brand;
        var rb = b.el.getBoundingClientRect();
        var Lb = b.el.offsetHeight - vh;
        var pb = Lb > 0 ? clamp(-rb.top / Lb, 0, 1) : 0;
        if (pb !== b.last || force) {
          b.last = pb;
          var out;
          try { out = b.BM.render(pb); } catch (e) { out = null; }
          var th = out && out.theme === "dark" ? "dark" : "light";
          b.el.setAttribute("data-theme-now", th);
        }
      }
      state.parallax.forEach(function (n) {
        var f = parseFloat(n.getAttribute("data-parallax")) || 0;
        var rr = n.getBoundingClientRect();
        var c = rr.top + rr.height / 2 - vh / 2;
        n.style.setProperty("--py", (c * f).toFixed(1) + "px");
      });
    }

    if (state.mode !== "static") {
      var line = vh * 0.88;
      state.reveals.forEach(function (n) {
        if (n.classList.contains("is-in")) return;
        if (n.getBoundingClientRect().top < line) n.classList.add("is-in");
      });
    }

    var max = document.documentElement.scrollHeight - vh;
    html.style.setProperty("--progress", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : "0");
    if (PS.onFrame) PS.onFrame(y);
  }
  PS.update = update;

  function onScroll() {
    if (state.raf) return;
    state.raf = requestAnimationFrame(function () { state.raf = 0; update(false); });
  }

  /* ---------- lugar atual (para resize / troca de modo) ---------- */
  PS.currentPlace = function () {
    var y = window.scrollY + 4, cur = state.stops[0] || null;
    state.stops.forEach(function (s) { if (s.y <= y) cur = s; });
    return cur ? { id: cur.id, i: cur.i } : null;
  };
  PS.goToPlace = function (pl) {
    var best = null;
    state.stops.forEach(function (s) { if (s.id === pl.id && (best === null || (s.i <= pl.i && s.i >= best.i))) best = s; });
    if (best) window.scrollTo(0, best.y);
  };
  PS.stopForHash = function (hash) {
    var id = decodeURIComponent(hash.replace(/^#/, ""));
    if (!id) return null;
    var hit = null;
    state.stops.forEach(function (s) { if (!hit && (s.anchor === id || (s.id === id && s.i === 0))) hit = s; });
    return hit;
  };

  /* ---------- boot ---------- */
  PS.startEngine = function () {
    applyMode(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var pl = PS.currentPlace();
        var nextMode = pickMode();
        if (nextMode !== state.mode) { applyMode(true); return; }
        measure();
        if (pl) PS.goToPlace(pl);
        update(true);
      }, 120);
    });
    var onPref = function () { applyMode(true); };
    if (mqReduce.addEventListener) { mqReduce.addEventListener("change", onPref); mqNarrow.addEventListener("change", onPref); }
    window.addEventListener("beforeprint", function () { state.printing = true; applyMode(true); });
    window.addEventListener("afterprint", function () { state.printing = false; applyMode(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); update(true); });
    window.addEventListener("load", function () { measure(); update(true); });
  };
})();

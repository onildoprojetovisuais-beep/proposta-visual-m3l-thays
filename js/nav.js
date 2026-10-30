/* Navegação — menu, progresso, anterior/próximo e teclado.
   Sempre reconcilia com o scroll real: o próximo estado é o primeiro
   com Y > scrollY + epsilon (ou > alvo pendente, durante um avanço). */
(function () {
  "use strict";
  var PS = (window.PS = window.PS || {});
  var html = document.documentElement;
  var EPS = 6;
  var pending = null; // { y, t }

  function smooth() { return PS.state.mode === "stage" || PS.state.mode === "flow"; }

  function base() {
    var y = window.scrollY;
    if (pending && performance.now() - pending.t < 900) return pending.y;
    pending = null;
    return y;
  }
  function goY(y, instant) {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    y = Math.max(0, Math.min(y, max));
    pending = { y: y, t: performance.now() };
    window.scrollTo({ top: y, behavior: instant || !smooth() ? "auto" : "smooth" });
  }
  function step(dir) {
    var stops = PS.state.stops, b = base(), target = null, i;
    if (dir > 0) { for (i = 0; i < stops.length; i++) if (stops[i].y > b + EPS) { target = stops[i]; break; } }
    else { for (i = stops.length - 1; i >= 0; i--) if (stops[i].y < b - EPS) { target = stops[i]; break; } }
    if (target) goY(target.y);
    else if (dir > 0) goY(document.documentElement.scrollHeight);
    else goY(0);
  }
  PS.step = step;

  /* ---------- UI ---------- */
  function build() {
    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<span class="progress__fill"></span>';
    document.body.appendChild(bar);

    var nav = document.createElement("nav");
    nav.className = "menu";
    nav.setAttribute("aria-label", "Seções");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu__toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "menu-panel");
    btn.innerHTML = '<span class="menu__toggle-label">Menu</span><span class="menu__toggle-bars" aria-hidden="true"><i></i><i></i></span>';
    var panel = document.createElement("div");
    panel.className = "menu__panel";
    panel.id = "menu-panel";
    panel.hidden = true;
    var ol = document.createElement("ol");
    ol.className = "menu__list";
    (PS.scenes || []).forEach(function (sc) {
      if (!sc.menu) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + sc.id;
      a.textContent = sc.menu;
      a.setAttribute("data-target", sc.id);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var s = PS.stopForHash("#" + sc.id);
        var el = document.getElementById(sc.id);
        goY(s ? s.y : (el ? el.getBoundingClientRect().top + window.scrollY : 0), true);
        try { history.replaceState(null, "", "#" + sc.id); } catch (err) { /* file:// */ }
        close(false);
      });
      li.appendChild(a);
      ol.appendChild(li);
    });
    panel.appendChild(ol);

    var tg = document.createElement("button");
    tg.type = "button";
    tg.className = "menu__static";
    tg.innerHTML = '<span class="menu__static-box" aria-hidden="true"></span><span>Sem animação</span>';
    tg.addEventListener("click", function () {
      if (PS.staticForced()) return;
      PS.setStaticPreference(!PS.staticPreferred());
      syncToggle();
    });
    panel.appendChild(tg);

    nav.appendChild(btn);
    nav.appendChild(panel);
    document.body.appendChild(nav);

    function open() {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      nav.classList.add("is-open");
      var cur = panel.querySelector('[aria-current="true"]') || panel.querySelector("a");
      if (cur) cur.focus({ preventScroll: true });
    }
    function close(focusBtn) {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      if (focusBtn) btn.focus({ preventScroll: true });
    }
    btn.addEventListener("click", function (e) {
      if (panel.hidden) open(); else close(false);
      if (e.detail > 0) btn.blur();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { close(true); e.preventDefault(); }
    });
    document.addEventListener("pointerdown", function (e) {
      if (!panel.hidden && !nav.contains(e.target)) close(false);
    });
    function syncToggle() {
      var forced = PS.staticForced();
      tg.setAttribute("aria-pressed", PS.staticPreferred() ? "true" : "false");
      tg.disabled = forced;
    }
    syncToggle();
    PS.syncToggle = syncToggle;

    var ctl = document.createElement("div");
    ctl.className = "pager";
    ctl.setAttribute("role", "group");
    ctl.setAttribute("aria-label", "Navegação");
    [["Anterior", "up", -1], ["Próximo", "down", 1]].forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ctrl-btn pager__btn";
      b.setAttribute("aria-label", d[0]);
      b.innerHTML = PS.chevron(d[1]);
      b.addEventListener("click", function (e) { step(d[2]); if (e.detail > 0) b.blur(); });
      ctl.appendChild(b);
    });
    document.body.appendChild(ctl);

    return { nav: nav, links: ol.querySelectorAll("a"), ctl: ctl };
  }

  /* ---------- tema dos controles (claro/escuro conforme o que está por baixo) ---------- */
  function themeAt(y) {
    var secs = document.querySelectorAll(".scene");
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        if (PS.state.mode !== "stage" && secs[i].classList.contains("stage")) {
          var ps = secs[i].querySelectorAll("[data-only]");
          for (var k = 0; k < ps.length; k++) {
            var rr = ps[k].getBoundingClientRect();
            if (rr.top <= y && rr.bottom > y) return ps[k].getAttribute("data-theme");
          }
        }
        if (secs[i].id === "marcas") {
          var dk = secs[i].querySelectorAll('[data-theme="dark"], .bm-s--c');
          for (var j = 0; j < dk.length; j++) {
            var rd = dk[j].getBoundingClientRect();
            if (rd.top <= y && rd.bottom > y) return "dark";
          }
        }
        return secs[i].getAttribute("data-theme-now") || secs[i].getAttribute("data-theme") || "light";
      }
    }
    return "light";
  }

  /* ---------- teclado ---------- */
  function ignoreKeys(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return true;
    var t = e.target;
    if (!t || t === document.body || t === html) return false;
    if (t.closest && t.closest("input, textarea, select, button, [contenteditable=''], [contenteditable='true'], .gallery, .menu__panel")) return true;
    return false;
  }

  PS.startNav = function () {
    var ui = build();

    document.addEventListener("keydown", function (e) {
      if (ignoreKeys(e)) return;
      var k = e.key;
      if (k === "ArrowDown" || k === "ArrowRight" || k === "PageDown" || (k === " " && !e.shiftKey)) { e.preventDefault(); step(1); }
      else if (k === "ArrowUp" || k === "ArrowLeft" || k === "PageUp" || (k === " " && e.shiftKey)) { e.preventDefault(); step(-1); }
      else if (k === "Home") { e.preventDefault(); goY(0); }
      else if (k === "End") { e.preventDefault(); goY(document.documentElement.scrollHeight); }
    });

    var lastTop = "", lastBottom = "", lastActive = "";
    PS.onFrame = function (y) {
      var vh = window.innerHeight;
      var top = themeAt(36), bottom = themeAt(vh - 36);
      if (top !== lastTop) { html.setAttribute("data-ui-top", top); lastTop = top; }
      if (bottom !== lastBottom) { html.setAttribute("data-ui-bottom", bottom); lastBottom = bottom; }
      var cur = PS.currentPlace();
      var id = cur ? cur.id : "";
      var stops = PS.state.stops;
      if (y + vh >= document.documentElement.scrollHeight - 2 && stops.length) id = stops[stops.length - 1].id;
      if (id !== lastActive) {
        lastActive = id;
        // cenas sem item próprio herdam o item anterior do menu
        var label = null, scenes = PS.scenes || [];
        for (var i = 0; i < scenes.length; i++) { if (scenes[i].menu) label = scenes[i].id; if (scenes[i].id === id) break; }
        ui.links.forEach(function (a) {
          if (a.getAttribute("data-target") === label) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      }
    };
    PS.onModeChange = function () { if (PS.syncToggle) PS.syncToggle(); lastTop = lastBottom = lastActive = ""; };

    // âncora inicial (não em recarga: aí vale a posição restaurada)
    var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var isReload = nav && nav.type === "reload";
    if (location.hash && !isReload) {
      var jump = function () { var s = PS.stopForHash(location.hash); if (s) window.scrollTo(0, s.y); PS.update(true); };
      jump();
      window.addEventListener("load", function () { PS.measure(); jump(); });
    }
    window.addEventListener("hashchange", function () {
      var s = PS.stopForHash(location.hash);
      if (s) goY(s.y, true);
    });
    PS.update(true);
  };
})();

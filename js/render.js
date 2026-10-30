/* Render — transforma window.PROPOSTA (+ PROPOSTA_CASES) em DOM.
   Só estrutura e texto; estado e scroll ficam em engine.js. */
(function () {
  "use strict";
  var PS = (window.PS = window.PS || {});

  /* ---------- tipografia: sem órfãs, sem preposição/artigo no fim da linha ---------- */
  var SHORT = /^(a|o|e|à|às|ao|aos|as|os|da|de|do|das|dos|na|no|nas|nos|em|com|um|uma|para|por|sua|seu|seus|suas|que|não|essa|esse|r\$|×|\/|\d+)$/i;
  var NB = String.fromCharCode(160);
  function tidy(str) {
    var w = String(str).split(" ");
    if (w.length < 2) return str;
    var out = "";
    for (var i = 0; i < w.length; i++) {
      out += w[i];
      if (i === w.length - 1) break;
      var bind = SHORT.test(w[i]) || i === w.length - 2 || /^[|·]$/.test(w[i + 1]) || /^[|·]$/.test(w[i]); // liga palavra curta à seguinte e as duas últimas
      out += bind ? NB : " ";
    }
    return out;
  }
  PS.tidy = tidy;

  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = tidy(text);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function add(parent) {
    var last = parent;
    for (var i = 1; i < arguments.length; i++) if (arguments[i]) last = parent.appendChild(arguments[i]);
    return last; // devolve o último filho anexado
  }

  function section(scene, isStage) {
    var s = el("section", "scene scene--" + scene.type + (isStage ? " stage" : " flow"), null, {
      id: scene.id,
      "data-theme": scene.theme || "light",
      "data-scene": scene.id
    });
    if (scene.menu) s.setAttribute("aria-label", scene.menu);
    return s;
  }
  function stageWrap(s, n) {
    s.setAttribute("data-states", String(n));
    s.style.setProperty("--states", n);
    var sticky = el("div", "stage__sticky");
    s.appendChild(sticky);
    return sticky;
  }

  /* ---------- cenas ---------- */
  var R = {};

  R.cover = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame cover"));
    var top = add(f, el("div", "cover__top"));
    add(top, el("img", "cover__logo", null, { src: "assets/pixel-rain/LOGOBLACK.png", alt: "Pixel Rain", width: "8904", height: "1134" }));
    var body = add(f, el("div", "cover__body", null, { "data-parallax": "-0.05" }));
    add(body,
      el("p", "eyebrow rv", sc.identifier),
      el("h1", "t-display cover__title rv", sc.title),
      el("p", "t-support cover__support rv", sc.support));
    return s;
  };

  R.list = function (sc) {
    var s = section(sc, true);
    var st = stageWrap(s, sc.items.length);
    var f = add(st, el("div", "frame list-layout"));
    var head = add(f, el("div", "list-layout__title"));
    if (sc.identifier) add(head, el("p", "eyebrow", sc.identifier));
    add(head, el("h2", "t-title", sc.title));
    var ul = add(f, el("ul", "statements"));
    sc.items.forEach(function (it, i) {
      add(ul, el("li", "statements__item", it, { "data-step": String(i) }));
    });
    return s;
  };

  R.brands = function (sc) {
    var s = section(sc, false);
    s.classList.remove("flow");
    s.setAttribute("data-stage", "brands");
    var st = add(s, el("div", "stage__sticky brands__sticky"));
    add(st, el("div", "brands__root", null, { id: "brand-motion-root" }));
    return s;
  };

  R.roles = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame roles-layout"));
    add(f, el("h2", "t-title rv", sc.title));
    var d = add(f, el("div", "roles rv"));
    add(d, el("span", "roles__axis", null, { "aria-hidden": "true" }));
    sc.roles.forEach(function (r) {
      var c = add(d, el("div", "role"));
      add(c, el("span", "role__node", null, { "aria-hidden": "true" }));
      add(c, el("p", "role__name", r.name), el("p", "role__line", r.line));
    });
    return s;
  };

  R.steps = function (sc) {
    var s = section(sc, true);
    var st = stageWrap(s, sc.panels.length);
    sc.panels.forEach(function (p, i) {
      var panel = add(st, el("div", "panel", null, { "data-only": String(i), "data-theme": p.theme, "data-anchor": p.anchor }));
      var f = add(panel, el("div", "frame panel__grid"));
      var id = add(f, el("div", "panel__id"));
      add(id, el("span", "panel__num", p.number), el("span", "panel__name", "/ " + p.name));
      var main = add(f, el("div", "panel__main"));
      add(main, el("h2", "t-title", p.title));
      if (p.items) {
        var ul = add(main, el("ul", "rows"));
        p.items.forEach(function (it) { add(ul, el("li", "rows__item", it)); });
      }
      if (p.groups) {
        var g = add(main, el("div", "groups"));
        var n = Math.max.apply(null, p.groups.map(function (x) { return x.items.length; }));
        p.groups.forEach(function (grp, gi) {
          var h = add(g, el("p", "groups__label", grp.label));
          h.style.setProperty("--col", gi + 1);
          h.style.setProperty("--ord", gi * 10);
        });
        for (var r = 0; r < n; r++) {
          p.groups.forEach(function (grp, gi) {
            if (!grp.items[r]) return;
            var c = add(g, el("p", "groups__item", grp.items[r]));
            c.style.setProperty("--col", gi + 1);
            c.style.setProperty("--ord", gi * 10 + r + 1);
          });
        }
      }
    });
    return s;
  };

  R.page = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame page-layout"));
    var t = add(f, el("div", "page-layout__text"));
    add(t,
      el("p", "eyebrow rv", sc.identifier),
      el("h2", "t-title rv", sc.title),
      el("p", "t-support rv", sc.support),
      el("p", "t-support t-support--soft rv", sc.complement));
    var ww = add(f, el("div", "wire-wrap", null, { "data-parallax": "0.06" }));
    var w = add(ww, el("div", "wire rv", null, { "aria-hidden": "true" }));
    add(w, el("div", "wire__nav"));
    var hero = add(w, el("div", "wire__hero"));
    add(hero, el("i", "w-l"), el("i", "w-l w-l--80"), el("i", "w-s w-s--40"));
    var cols = add(w, el("div", "wire__cols"));
    for (var k = 0; k < 3; k++) {
      var c = add(cols, el("div", "wire__col"));
      add(c, el("i", "w-m"), el("i", "w-s"), el("i", "w-s w-s--60"));
    }
    add(w, el("div", "wire__band"));
    var foot = add(w, el("div", "wire__foot"));
    add(foot, el("i", "w-s w-s--30"), el("span", "wire__cta"));
    return s;
  };

  R.cases = function (sc) {
    var data = window.PROPOSTA_CASES;
    if (!Array.isArray(data) || !data.length) return null;
    data = data.filter(function (c) { return c && c.enabled !== false && c.name && Array.isArray(c.images) && c.images.length; });
    if (!data.length) return null;
    var s = section(sc, false);
    var total = data.length;
    data.forEach(function (c, ci) {
      var art = add(s, el("article", "frame case" + (ci === 0 ? " case--first" : "") + (c.images.length < 2 ? " case--single" : ""), null, { "data-stop": "", "data-case": c.slug || String(ci) }));
      var txt = add(art, el("div", "case__text"));
      if (ci === 0) add(txt, el("h2", "t-title case__title rv", sc.title));
      var head = add(txt, el("div", "case__head rv"));
      if (total > 1) {
        var pos = add(head, el("p", "case__pos eyebrow", null, null));
        pos.textContent = "Case " + (ci + 1) + " de " + total;
      }
      add(head, el("h3", "case__name", c.name));
      var dl = add(txt, el("dl", "case__facts rv"));
      if (c.challenge) add(dl, el("dt", "eyebrow", sc.labels.challenge), el("dd", "t-support", c.challenge));
      if (c.delivery) add(dl, el("dt", "eyebrow", sc.labels.delivery), el("dd", "t-support", c.delivery));
      art.appendChild(gallery(c, ci));
    });
    return s;
  };

  function gallery(c, ci) {
    var imgs = c.images.slice(0, 3);
    var single = imgs.length < 2;
    var g = el("div", "gallery rv" + (single ? " gallery--single" : ""), null, single
      ? { role: "group", "aria-label": c.name }
      : { tabindex: "0", role: "group", "aria-roledescription": "galeria", "aria-label": c.name });
    var stage = add(g, el("div", "gallery__stage"));
    imgs.forEach(function (im, i) {
      var fig = add(stage, el("figure", "gallery__fig" + (i === 0 ? " is-current" : "")));
      add(fig, el("img", "gallery__img", null, { src: im.src, alt: im.alt || "", loading: "eager", decoding: "async" }));
    });
    if (imgs.length > 1) {
      var ctr = add(g, el("div", "gallery__ctrl"));
      var prev = add(ctr, el("button", "ctrl-btn", null, { type: "button", "aria-label": "Imagem anterior" }));
      prev.innerHTML = chevron("left");
      var count = add(ctr, el("span", "gallery__count", null, { "aria-live": "polite" }));
      var next = add(ctr, el("button", "ctrl-btn", null, { type: "button", "aria-label": "Próxima imagem" }));
      next.innerHTML = chevron("right");
      var cur = 0;
      var show = function (i) {
        cur = (i + imgs.length) % imgs.length;
        stage.querySelectorAll(".gallery__fig").forEach(function (f, k) { f.classList.toggle("is-current", k === cur); });
        count.textContent = (cur + 1) + " / " + imgs.length;
      };
      show(0);
      prev.addEventListener("click", function () { show(cur - 1); });
      next.addEventListener("click", function () { show(cur + 1); });
      g.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
        else if (e.key === "ArrowRight") { show(cur + 1); e.preventDefault(); }
      });
    }
    return g;
  }

  R.process = function (sc) {
    var s = section(sc, true);
    var st = stageWrap(s, sc.items.length);
    var f = add(st, el("div", "frame process-layout"));
    add(f, el("h2", "t-title process-layout__title", sc.title));
    var ol = add(f, el("ol", "milestones"));
    add(ol, el("span", "milestones__rail", null, { "aria-hidden": "true" }));
    sc.items.forEach(function (it, i) {
      var li = add(ol, el("li", "milestones__item", null, { "data-step": String(i), "data-mark": "" }));
      if (typeof it === "string") { add(li, el("span", "milestones__num", String(i + 1) + "."), el("span", "milestones__text", it)); return; }
      li.classList.add("milestones__item--day");
      add(li, el("span", "milestones__num", it.date));
      var body = add(li, el("span", "milestones__body"));
      add(body, el("span", "milestones__text", it.name), el("span", "milestones__desc", it.desc));
    });
    return s;
  };

  R.summary = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame summary-layout"));
    add(f, el("h2", "t-display rv", sc.title));
    var ul = add(f, el("ul", "triad"));
    sc.items.forEach(function (it, i) {
      var li = add(ul, el("li", "triad__item rv", it));
      li.style.setProperty("--d", i);
    });
    return s;
  };

  R.investment = function (sc) {
    var s = section(sc, true);
    var st = stageWrap(s, sc.alternative ? 2 : 1);
    var f = add(st, el("div", "frame invest"));
    var main = add(f, el("div", "invest__main", null, { "data-step": "0" }));
    add(main, el("p", "eyebrow", sc.identifier), el("h2", "invest__title", sc.title));
    add(main, money("invest__price", sc.price));
    var cond = add(main, el("p", "invest__cond"));
    sc.condition.forEach(function (line) { add(cond, el("span", null, line)); });
    if (sc.equivalence) add(main, el("p", "invest__eq", sc.equivalence));
    if (sc.alternative) {
      var alt = add(f, el("div", "invest__alt", null, { "data-step": "1" }));
      add(alt, el("p", "invest__alt-label", sc.alternative.label), money("invest__alt-value", sc.alternative.value));
    }
    return s;
  };

  function money(cls, text) {
    var p = el("p", cls);
    var m = /^(\S+)\s+(.+)$/.exec(text);
    if (!m) { p.textContent = text; return p; }
    add(p, el("span", "money__cur", m[1]));
    p.appendChild(document.createTextNode(String.fromCharCode(160)));
    add(p, el("span", "money__val", m[2]));
    return p;
  }

  R.card = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame card-layout"));
    add(f,
      el("h2", "t-title rv", sc.title),
      el("p", "t-support card-layout__support rv", sc.support),
      el("p", "t-support t-support--soft rv", sc.complement));
    return s;
  };

  R.text = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame card-layout text-layout"));
    if (sc.identifier) add(f, el("p", "eyebrow rv", sc.identifier));
    add(f, el("h2", "t-title rv", sc.title));
    sc.paragraphs.forEach(function (p, i) {
      var n = add(f, el("p", "t-support rv" + (i ? " t-support--soft" : ""), p));
      n.style.setProperty("--d", i + 1);
    });
    return s;
  };

  R.closing = function (sc) {
    var s = section(sc, false);
    var f = add(s, el("div", "frame closing"));
    add(f, el("h2", "t-display rv", sc.title));
    var ol = add(f, el("ol", "sequence"));
    ol.style.setProperty("--n", sc.items.length);
    sc.items.forEach(function (it, i) {
      var li = add(ol, el("li", "sequence__item rv"));
      li.style.setProperty("--d", i);
      add(li, el("span", "sequence__node", null, { "aria-hidden": "true" }), el("span", "sequence__text", it));
    });
    var sig = add(f, el("div", "closing__sig"));
    add(sig, el("img", "closing__logo", null, { src: "assets/pixel-rain/LOGOWHITE.png", alt: "Pixel Rain", width: "8904", height: "1134" }));
    if (sc.signature) add(sig, el("p", "closing__tagline", sc.signature));
    return s;
  };

  /* ---------- montagem ---------- */
  PS.render = function (root) {
    var scenes = (window.PROPOSTA && window.PROPOSTA.scenes) || [];
    var used = [];
    scenes.forEach(function (sc) {
      var fn = R[sc.type];
      if (!fn) return;
      var node = fn(sc);
      if (!node) return; // cena omitida (ex.: cases sem dados)
      root.appendChild(node);
      used.push(sc);
    });
    PS.scenes = used;
    return used;
  };

  PS.chevron = chevron;
  function chevron(dir) {
    var d = { up: "M5 12.5 10 7.5l5 5", down: "M5 7.5l5 5 5-5", left: "M12.5 5 7.5 10l5 5", right: "M7.5 5l5 5-5 5" }[dir];
    return '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
})();

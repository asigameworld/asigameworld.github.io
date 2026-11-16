/* Per-model dual radar card & action-rejection slider card. Data: /assets/model-cards.json */
(function () {
  var DATA = null;
  var SELF_DATA = null;
  var COG_DATA = null;
  var PLAN_DATA = null;
  var track = "frontier";
  var slug = null;
  var rejSlug = null;
  var selfSlug = null;

  var DOM_AX = [
    { en: "Survival", zh: "生存" },
    { en: "Crafting", zh: "制作" },
    { en: "Combat", zh: "战斗" },
    { en: "Building", zh: "建造" }
  ];
  var CAP_AX = [
    { en: "Cognition", zh: "认知", k: "C" },
    { en: "Planning", zh: "规划", k: "P" },
    { en: "Execution", zh: "执行", k: "E" },
    { en: "Self-Mgmt", zh: "自主管理", k: "M" },
    { en: "Learning", zh: "学习", k: "L" },
    { en: "Social", zh: "社交", k: "S" }
  ];
  var ACT_AX = [
    { en: "Production", zh: "生产制作", col: "#2f9e44" },
    { en: "Construction", zh: "房屋建造", col: "#f08c00" },
    { en: "Dungeon combat", zh: "地牢战斗", col: "#c92a2a" },
    { en: "Sustenance", zh: "生存补给", col: "#7048e8" },
    { en: "Movement", zh: "探索移动", col: "#868e96" }
  ];

  function lang() {
    try {
      if (localStorage.getItem("asiworld-lang") === "zh") return "zh";
    } catch (e) {}
    return document.documentElement.lang === "zh" ? "zh" : "en";
  }

  function t(en, zh) { return lang() === "zh" ? zh : en; }

  function hashParams() {
    var h = location.hash.replace(/^#/, "");
    if (!h || h.indexOf("=") === -1) return new URLSearchParams();
    return new URLSearchParams(h);
  }

  function polar(i, n, val, cx, cy, R) {
    var a = Math.PI / 2 - (i * 2 * Math.PI) / n;
    var r = R * val / 100;
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  }

  function pts(values, cx, cy, R) {
    return values.map(function (v, i) {
      var p = polar(i, values.length, v, cx, cy, R);
      return p[0].toFixed(1) + "," + p[1].toFixed(1);
    }).join(" ");
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function drawRadar(host, values, sds, mean, labels, color) {
    var n = values.length;
    var cx = 170, cy = 148, R = 96;
    var rings = [25, 50, 75, 100].map(function (rv) {
      return '<polygon points="' + pts(labels.map(function () { return rv; }), cx, cy, R) + '" fill="none" stroke="#dee2e6" stroke-width="1"/>';
    }).join("");
    var spokes = labels.map(function (_, i) {
      var p = polar(i, n, 100, cx, cy, R);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#dee2e6" stroke-width="1"/>';
    }).join("");
    var labs = labels.map(function (lb, i) {
      var p = polar(i, n, 124, cx, cy, R);
      var a = Math.PI / 2 - (i * 2 * Math.PI) / n;
      var cos = Math.cos(a);
      var anchor = cos > 0.4 ? "start" : cos < -0.4 ? "end" : "middle";
      var dy = Math.sin(a) > 0.55 ? -2 : Math.sin(a) < -0.55 ? 8 : 4;
      return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy).toFixed(1) + '" text-anchor="' + anchor + '" font-size="12" fill="#495057">' + esc(lb) + "</text>";
    }).join("");
    var dots = values.map(function (v, i) {
      var p = polar(i, n, v, cx, cy, R);
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.4" fill="' + color + '" stroke="#fff" stroke-width="1.1"/>';
    }).join("");
    var fifty = polar(0, n, 50, cx, cy, R);
    var hundred = polar(0, n, 100, cx, cy, R);
    host.innerHTML =
      '<svg viewBox="10 8 320 292" role="img" aria-label="' + esc(labels.join(", ")) + '">' +
      rings + spokes +
      '<polygon points="' + pts(mean, cx, cy, R) + '" fill="none" stroke="#868e96" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<polygon points="' + pts(values, cx, cy, R) + '" fill="' + color + '" fill-opacity="0.22" stroke="' + color + '" stroke-width="2.1"/>' +
      dots + labs +
      '<text x="' + (fifty[0] + 6).toFixed(1) + '" y="' + fifty[1].toFixed(1) + '" font-size="10" fill="#adb5bd">50</text>' +
      '<text x="' + (hundred[0] + 6).toFixed(1) + '" y="' + hundred[1].toFixed(1) + '" font-size="10" fill="#adb5bd">100</text>' +
      "</svg>";
  }

  function bar(name, weight, value, sd, color) {
    var w = Math.max(0, Math.min(100, value));
    var sdNum = sd || 0;
    var valHtml = value.toFixed(1) + (sdNum > 0 ? '<small class="stat-sd">±' + sdNum.toFixed(1) + "</small>" : "");
    return '<div class="stat-item' + (sdNum > 0 ? " has-sd" : "") + '"><span class="stat-name">' + esc(name) +
      '</span><span class="stat-track"><span class="stat-fill" style="width:' + w.toFixed(1) + '%;background:' + color + '"></span></span><span class="stat-val">' + valHtml + "</span></div>";
  }

  function tile(label, value, sub) {
    return '<div class="ms-tile"><span class="ms-label">' + esc(label) + '</span><span class="ms-val">' +
      esc(value) + "</span>" + (sub ? '<span class="ms-sub">' + esc(sub) + "</span>" : "") + "</div>";
  }

  function listFor(which) {
    return which === "small" ? DATA.small : DATA.frontier;
  }

  function find(id) {
    var all = DATA.frontier.concat(DATA.small);
    for (var i = 0; i < all.length; i++) if (all[i].slug === id) return all[i];
    return null;
  }

  function renderRoster() {
    var host = document.getElementById("agent-roster");
    if (!host) return;
    var rows = listFor(track);
    host.innerHTML = rows.map(function (m) {
      var on = m.slug === slug ? ' aria-selected="true"' : ' aria-selected="false"';
      var cls = "roster-chip" + (track === "small" ? " small-chip" : "");
      var scTxt = m.total.toFixed(1) + (m.total_sd > 0 ? " ±" + m.total_sd.toFixed(1) : "");
      return '<button type="button" class="' + cls + '" role="option" data-slug="' + esc(m.slug) + '"' + on + '>' +
        '<span class="roster-chip-left"><span class="roster-rank">' + esc(m.rank) + "</span>" +
        m.icon + '<span class="roster-name">' + esc(t(m.name_en, m.name_zh)) +
        "</span></span>" + '<span class="roster-score">' + esc(scTxt) + "</span></button>";
    }).join("");
    host.querySelectorAll(".roster-chip").forEach(function (btn) {
      btn.addEventListener("click", function () { select(btn.getAttribute("data-slug"), true); });
    });
    var active = host.querySelector('.roster-chip[aria-selected="true"]');
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function stepProfile(delta) {
    if (!DATA) return;
    var rows = listFor(track);
    if (!rows || !rows.length) return;
    var idx = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === slug) { idx = i; break; }
    var nextIdx = (idx + delta + rows.length) % rows.length;
    select(rows[nextIdx].slug, true);
  }

  function renderCard() {
    var card = document.getElementById("model-hero-card");
    var model = find(slug);
    if (!card || !model) return;
    var rows = listFor(track);
    var idx = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === model.slug) { idx = i; break; }
    var zh = lang() === "zh";
    var color = model.track === "small" ? "#c48a1a" : "#1971c2";
    var meanD = DATA.frontierMean.domains;
    var meanC = DATA.frontierMean.caps;
    var domSds = model.domains_sd || [0, 0, 0, 0];
    var capSds = model.caps_sd || [0, 0, 0, 0, 0, 0];
    var isMulti = (model.n_runs || 1) > 1;
    card.classList.toggle("is-small-track", model.track === "small");
    var domLabels = DOM_AX.map(function (a) { return zh ? a.zh : a.en; });
    var capLabels = CAP_AX.map(function (a) { return (zh ? a.zh : a.en) + " (" + a.k + ")"; });

    var runBadge = isMulti
      ? '<span class="hc-pill multi-run-pill">' + (zh ? (model.n_runs + " 次跑测均值 ± SD") : (model.n_runs + "-run mean ± SD")) + "</span>"
      : '<span class="hc-pill single-run-pill">' + (zh ? "单次 7h 跑测" : "Single 7h run") + "</span>";

    var totalScoreHtml = model.total.toFixed(1) +
      (model.total_sd > 0 ? '<small class="scorebox-sd"> ± ' + model.total_sd.toFixed(1) + "</small>" : "");

    card.innerHTML =
      '<div class="hero-card-top"><div class="hero-card-id">' + model.icon +
      '<div class="hero-card-titles"><h3>#' + (idx + 1) + " " + esc(t(model.name_en, model.name_zh)) + "</h3>" +
      '<div class="hero-card-badges"><span class="hc-pill tier tier-t' + model.tier + '">T' + model.tier + "</span>" +
      (model.track === "small" ? '<span class="hc-pill small">' + (zh ? "开源轻量" : "Compact open-weight") + "</span>" : '<span class="hc-pill">' + (zh ? "前沿模型" : "Frontier") + "</span>") +
      runBadge +
      "</div></div></div>" +
      '<div class="rej-card-right">' +
      '<div class="rej-step-pager"><button type="button" class="rej-step-btn" id="prof-card-prev" aria-label="Previous model">‹</button>' +
      '<span class="rej-step-count">' + (idx + 1) + " / " + rows.length + "</span>" +
      '<button type="button" class="rej-step-btn" id="prof-card-next" aria-label="Next model">›</button></div>' +
      '<div class="hero-card-scorebox"><span class="scorebox-label">' + (zh ? (isMulti ? "综合得分 (均值 ± SD)" : "综合得分") : (isMulti ? "Overall (Mean ± SD)" : "Overall")) + '</span>' +
      '<span class="scorebox-val">' + totalScoreHtml + "</span></div></div></div>" +
      '<div class="dual-radar-stage">' +
      '<div class="radar-panel"><div class="radar-panel-head"><h4>' + (zh ? "四维玩法进程" : "Four gameplay domains") + "</h4>" +
      '<div class="radar-legend"><span><i class="model-dot" id="legend-dot" style="background:' + color + '"></i><span>' + (zh ? (isMulti ? "多局均值" : "该模型") : (isMulti ? "Run mean" : "This model")) + "</span></span>" +
      '<span><i class="legend-dash"></i><span>' + (zh ? "前沿均值" : "Frontier mean") + "</span></span></div></div>" +
      '<div class="radar-svg-wrap" id="radar-dom"></div></div>' +
      '<div class="radar-panel"><div class="radar-panel-head"><h4>' + (zh ? "六项核心能力" : "Six core capabilities") + "</h4>" +
      '<div class="radar-legend"><span><i class="model-dot" style="background:' + color + '"></i><span>' + (zh ? (isMulti ? "多局均值" : "该模型") : (isMulti ? "Run mean" : "This model")) + "</span></span>" +
      '<span><i class="legend-dash"></i><span>' + (zh ? "前沿均值" : "Frontier mean") + "</span></span></div></div>" +
      '<div class="radar-svg-wrap" id="radar-cap"></div></div></div>' +
      '<div class="stat-columns"><div class="stat-group"><h4>' + (zh ? "玩法领域得分" : "Domain scores") + '</h4><div class="stat-list">' +
      DOM_AX.map(function (a, i) { return bar(zh ? a.zh : a.en, a.w, model.domains[i], domSds[i], color); }).join("") +
      '</div></div><div class="stat-group"><h4>' + (zh ? "核心能力达成值" : "Capability values") + '</h4><div class="stat-list">' +
      CAP_AX.map(function (a, i) { return bar((zh ? a.zh : a.en) + " (" + a.k + ")", "", model.caps[i], capSds[i], color); }).join("") +
      '</div></div></div>' + '<div class="milestone-strip">' +
      tile(zh ? "击杀" : "Kills", String(model.milestones.kills),
        (model.milestones.aggregate ? (zh ? "各局均值 · " : "mean per lane · ") : "") +
        (zh ? (model.milestones.actions + " 次动作") : (model.milestones.actions + " actions"))) +
      tile(zh ? "首领" : "Bosses", model.milestones.bosses, zh ? "8 个首领中" : "of 8 bosses") +
      tile(zh ? "到达区域" : "Realms", String(model.milestones.realms), (zh ? "最深楼层 " : "Deepest floor ") + model.milestones.deepest) +
      tile(zh ? "工具种类" : "Tools", String(model.milestones.tools), (zh ? "装备阶 T" : "Gear tier T") + model.tier) +
      "</div>";
    drawRadar(document.getElementById("radar-dom"), model.domains, domSds, meanD, domLabels, color);
    drawRadar(document.getElementById("radar-cap"), model.caps, capSds, meanC, capLabels, color);
    var pBtn = document.getElementById("prof-card-prev");
    var nBtn = document.getElementById("prof-card-next");
    if (pBtn) pBtn.addEventListener("click", function () { stepProfile(-1); });
    if (nBtn) nBtn.addEventListener("click", function () { stepProfile(1); });
  }

  /* ---------------- Action Rejection Slider & Dual SVG Charts ---------------- */
  function pickScale(peak) {
    if (peak <= 6) return { ymax: 10, ticks: [0, 2, 4, 6, 8, 10] };
    if (peak <= 18) return { ymax: 22, ticks: [0, 5, 10, 15, 20] };
    if (peak <= 36) return { ymax: 42, ticks: [0, 10, 20, 30, 40] };
    if (peak <= 55) return { ymax: 62, ticks: [0, 15, 30, 45, 60] };
    return { ymax: 98, ticks: [0, 20, 40, 60, 80, 100] };
  }

  function drawCalloutsSVG(rej, L, W, R, T, slot, yOf) {
    var ps = rej.phase_summary || {};
    var callouts = ps.callouts || [];
    var zh = lang() === "zh";
    var out = "";
    var placed = [];
    callouts.forEach(function (co) {
      var h = co.h || 0;
      var txt = zh ? co.zh : co.en;
      if (!txt) return;
      var cx = L + slot * (h + 0.5);
      var tot = rej.hourly_total[h] || 0;
      var barTop = yOf(tot);
      var pillW = Math.max(78, txt.length * (zh ? 10.4 : 5.6) + 14);
      var pillH = 17;
      var px = Math.max(L + 2, Math.min(W - R - pillW - 2, cx - pillW / 2));
      var py = Math.max(3, barTop - 35);
      if (barTop < 48) py = Math.max(3, barTop - 31);
      for (var k = 0; k < placed.length; k++) {
        var p0 = placed[k];
        if (px < p0.x + p0.w + 4 && px + pillW + 4 > p0.x && Math.abs(py - p0.y) < pillH + 2) {
          py = Math.max(3, p0.y - pillH - 3);
        }
      }
      placed.push({ x: px, y: py, w: pillW });
      var lineY1 = py + pillH;
      var lineY2 = Math.max(lineY1 + 2, barTop - 13);
      out += '<g class="svg-callout" pointer-events="none">' +
        '<line x1="' + cx.toFixed(1) + '" y1="' + lineY1.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + lineY2.toFixed(1) + '" stroke="#1971c2" stroke-width="1.1" stroke-dasharray="2 1.5"/>' +
        '<rect x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" width="' + pillW.toFixed(1) + '" height="' + pillH + '" rx="4" fill="#f0f7ff" stroke="#74c0fc" stroke-width="1"/>' +
        '<text x="' + (px + pillW / 2).toFixed(1) + '" y="' + (py + 11.8).toFixed(1) + '" text-anchor="middle" font-size="9.2" font-weight="700" fill="#1864ab">' + esc(txt) + "</text>" +
        "</g>";
    });
    return out;
  }

  function drawRejBarSVG(host, rej) {
    if (!host || !rej) return;
    var W = 440, H = 290;
    var L = 42, R = 16, T = 48, B = 44;
    var pw = W - L - R, ph = H - T - B;
    var sds = rej.hourly_total_sd || [0, 0, 0, 0, 0, 0, 0];
    var htasks = rej.hourly_tasks || [];
    var zh = lang() === "zh";
    var peak = Math.max.apply(null, rej.hourly_total.concat([1]));
    var sc = pickScale(peak);
    var ymax = sc.ymax;
    var yOf = function (v) { return T + ph - (Math.min(ymax, Math.max(0, v)) / ymax) * ph; };

    var grid = sc.ticks.map(function (tk) {
      var y = yOf(tk);
      return '<line x1="' + L + '" y1="' + y.toFixed(1) + '" x2="' + (W - R) + '" y2="' + y.toFixed(1) + '" stroke="#e6ece8" stroke-width="1"/>' +
        '<text x="' + (L - 7) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#63706a">' + tk + "%</text>";
    }).join("");

    var slot = pw / 7;
    var bw = slot * 0.62;
    var bars = "";
    for (var h = 0; h < 7; h++) {
      var cx = L + slot * (h + 0.5);
      var bx = cx - bw / 2;
      var cum = 0;
      var ht = htasks[h] || {};
      var axTag = zh ? (ht.tag_zh || "") : (ht.tag_en || "");
      bars += '<g class="svg-hour-col" data-hour="' + h + '">';
      bars += '<rect class="svg-hour-bg" x="' + (L + slot * h + 1).toFixed(1) + '" y="' + T + '" width="' + (slot - 2).toFixed(1) + '" height="' + ph + '" fill="#1971c2" fill-opacity="0" rx="4"/>';
      for (var c = 0; c < 5; c++) {
        var v = rej.hourly_cats[h][c] || 0;
        if (v > 0.02) {
          var y1 = yOf(cum);
          var y2 = yOf(cum + v);
          var bh = Math.max(1.2, y1 - y2);
          bars += '<rect x="' + bx.toFixed(1) + '" y="' + y2.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) +
            '" fill="' + ACT_AX[c].col + '" stroke="#fff" stroke-width="0.7" rx="1.5"><title>' +
            esc(t(ACT_AX[c].en, ACT_AX[c].zh)) + " (" + (h + 1) + "h): " + v.toFixed(1) + '%</title></rect>';
          if (bh >= 15 && v >= 0.8) {
            bars += '<text x="' + cx.toFixed(1) + '" y="' + ((y1 + y2) / 2 + 3.5).toFixed(1) +
              '" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff">' + v.toFixed(1) + "%</text>";
          }
          cum += v;
        }
      }
      var tot = rej.hourly_total[h] || 0;
      var sd = sds[h] || 0;
      var ty = Math.max(12, yOf(tot) - 5);
      var lbl = tot >= 0.05 ? (sd > 0.2 ? tot.toFixed(1) + "±" + sd.toFixed(1) + "%" : tot.toFixed(1) + "%") : "0%";
      bars += '<text x="' + cx.toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="middle" font-size="' + (sd > 0.2 ? "9.2" : "10.2") + '" font-weight="700" fill="' +
        (tot >= 0.1 ? "#18181b" : "#9ca3af") + '">' + lbl + "</text>";
      bars += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph + 15) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#18181b">' + (h + 1) + "h</text>";
      if (axTag) {
        bars += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph + 29) + '" text-anchor="middle" font-size="9" fill="#53665e">' + esc(axTag) + "</text>";
      }
      bars += "</g>";
    }

    var calloutsSvg = drawCalloutsSVG(rej, L, W, R, T, slot, yOf);
    host.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="7-hour action rejection bar chart">' +
      grid +
      '<line x1="' + L + '" y1="' + (T + ph) + '" x2="' + (W - R) + '" y2="' + (T + ph) + '" stroke="#cbd5e1" stroke-width="1"/>' +
      bars + calloutsSvg + "</svg>";
  }

  function drawRejCurveSVG(host, rej) {
    if (!host || !rej) return;
    var W = 440, H = 290;
    var L = 42, R = 16, T = 48, B = 44;
    var pw = W - L - R, ph = H - T - B;
    var sds = rej.hourly_total_sd || [0, 0, 0, 0, 0, 0, 0];
    var htasks = rej.hourly_tasks || [];
    var zh = lang() === "zh";
    var peak = Math.max.apply(null, rej.hourly_total.concat([1]));
    var sc = pickScale(peak);
    var ymax = sc.ymax;
    var vmax = Math.max.apply(null, rej.hourly_vol.concat([200])) * 1.32;
    var yOf = function (v) { return T + ph - (Math.min(ymax, Math.max(0, v)) / ymax) * ph; };
    var slot = pw / 7;
    var bw = slot * 0.56;

    var grid = sc.ticks.map(function (tk) {
      var y = yOf(tk);
      return '<line x1="' + L + '" y1="' + y.toFixed(1) + '" x2="' + (W - R) + '" y2="' + y.toFixed(1) + '" stroke="#e6ece8" stroke-width="1"/>' +
        '<text x="' + (L - 7) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#63706a">' + tk + "%</text>";
    }).join("");

    var volBars = "";
    var linePts = [];
    var areaPts = [];
    for (var h = 0; h < 7; h++) {
      var cx = L + slot * (h + 0.5);
      var vol = rej.hourly_vol[h] || 0;
      var vh = (vol / vmax) * ph;
      var vy = T + ph - vh;
      var ht = htasks[h] || {};
      var axTag = zh ? (ht.tag_zh || "") : (ht.tag_en || "");
      volBars += '<g class="svg-hour-col" data-hour="' + h + '">';
      volBars += '<rect class="svg-hour-bg" x="' + (L + slot * h + 1).toFixed(1) + '" y="' + T + '" width="' + (slot - 2).toFixed(1) + '" height="' + ph + '" fill="#1971c2" fill-opacity="0" rx="4"/>';
      volBars += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + vy.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + vh.toFixed(1) +
        '" fill="#e6ece9" rx="2"><title>' + (h + 1) + "h: " + Math.round(vol) + " calls</title></rect>";
      if (vol > 0) {
        volBars += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph - 4).toFixed(1) + '" text-anchor="middle" font-size="9" fill="#6b7b72">' +
          Math.round(vol) + "</text>";
      }
      var rv = rej.hourly_total[h] || 0;
      var sd = sds[h] || 0;
      var ry = yOf(rv);
      linePts.push([cx, ry, rv, sd]);
      areaPts.push(cx.toFixed(1) + "," + ry.toFixed(1));
      volBars += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph + 15) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#18181b">' + (h + 1) + "h</text>";
      if (axTag) {
        volBars += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph + 29) + '" text-anchor="middle" font-size="9" fill="#53665e">' + esc(axTag) + "</text>";
      }
      volBars += "</g>";
    }

    var polyArea = linePts[0][0].toFixed(1) + "," + (T + ph) + " " + areaPts.join(" ") + " " + linePts[6][0].toFixed(1) + "," + (T + ph);
    var polyLine = areaPts.join(" ");
    var dots = linePts.map(function (pt, h) {
      var ty = Math.max(12, pt[1] - 7);
      var lbl = pt[3] > 0.2 ? pt[2].toFixed(1) + "±" + pt[3].toFixed(1) + "%" : pt[2].toFixed(1) + "%";
      var tip = (h + 1) + "h: " + lbl;
      return '<g class="svg-hour-dot" data-hour="' + h + '"><circle cx="' + pt[0].toFixed(1) + '" cy="' + pt[1].toFixed(1) + '" r="4.2" fill="#1971c2" stroke="#fff" stroke-width="1.4"><title>' + esc(tip) + "</title></circle>" +
        '<text x="' + pt[0].toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="middle" font-size="' + (pt[3] > 0.2 ? "9.2" : "10.2") + '" font-weight="700" fill="#1864ab">' +
        lbl + "</text></g>";
    }).join("");

    var calloutsSvg = drawCalloutsSVG(rej, L, W, R, T, slot, yOf);
    host.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="7-hour rejection trajectory and call volume">' +
      grid + volBars +
      '<polygon points="' + polyArea + '" fill="#74c0fc" fill-opacity="0.22" pointer-events="none"/>' +
      '<polyline points="' + polyLine + '" fill="none" stroke="#1971c2" stroke-width="2.3" pointer-events="none"/>' +
      '<line x1="' + L + '" y1="' + (T + ph) + '" x2="' + (W - R) + '" y2="' + (T + ph) + '" stroke="#cbd5e1" stroke-width="1"/>' +
      dots + calloutsSvg + "</svg>";
  }

  function renderRejRoster() {
    var host = document.getElementById("rej-roster");
    if (!host || !DATA) return;
    var rows = DATA.frontier;
    host.innerHTML = rows.map(function (m) {
      var on = m.slug === rejSlug ? ' aria-selected="true"' : ' aria-selected="false"';
      var r = m.rejection;
      var rrate = r ? (r.overall_rej.toFixed(1) + (r.overall_rej_sd > 0 ? "±" + r.overall_rej_sd.toFixed(1) : "") + "%") : "";
      return '<button type="button" class="roster-chip" role="option" data-rej-slug="' + esc(m.slug) + '"' + on + '>' +
        '<span class="roster-chip-left"><span class="roster-rank">' + esc(m.rank) + "</span>" +
        m.icon + '<span class="roster-name">' + esc(t(m.name_en, m.name_zh)) +
        '</span></span><span class="roster-score rej-chip-rate">' + esc(rrate) + "</span></button>";
    }).join("");
    host.querySelectorAll(".roster-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectRej(btn.getAttribute("data-rej-slug"), true);
      });
    });
    var active = host.querySelector('.roster-chip[aria-selected="true"]');
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function renderRejCard() {
    var card = document.getElementById("rej-hero-card");
    if (!card || !DATA) return;
    var rows = DATA.frontier;
    var idx = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].slug === rejSlug) { idx = i; break; }
    }
    var model = rows[idx];
    if (!model || !model.rejection) return;
    var rej = model.rejection;
    var zh = lang() === "zh";
    var isMulti = (rej.n_runs || 1) > 1;
    var diff = rej.late_rej - rej.early_rej;
    var shiftGood = diff <= 0.3;
    var shiftCls = shiftGood ? "good" : "warn";
    var sign = diff > 0 ? "+" : "";
    var shiftText = (zh ? "前半场 " : "First 3.5h ") + rej.early_rej.toFixed(1) + "% → " +
      (zh ? "后半场 " : "Last 3.5h ") + rej.late_rej.toFixed(1) + "% (" + sign + diff.toFixed(1) + "%)";

    var runBadge = isMulti
      ? '<span class="hc-pill multi-run-pill">' + (zh ? (rej.n_runs + " 次跑测均值 ± SD") : (rej.n_runs + "-run mean ± SD")) + "</span>"
      : '<span class="hc-pill single-run-pill">' + (zh ? "单次 7h 跑测" : "Single 7h run") + "</span>";

    var legHtml = ACT_AX.map(function (a) {
      return '<span><i class="model-dot" style="background:' + a.col + '"></i><span>' + esc(zh ? a.zh : a.en) + "</span></span>";
    }).join("");

    var catSds = rej.cat_rej_sd || [0, 0, 0, 0, 0];
    var catRows = ACT_AX.map(function (a, c) {
      var cr = rej.cat_rej[c];
      var csd = catSds[c] || 0;
      var w = cr == null ? 0 : Math.max(0, Math.min(100, cr));
      var valHtml = cr == null ? "–" : cr.toFixed(1) + "%" + (csd > 0 ? '<small class="stat-sd">±' + csd.toFixed(1) + "%</small>" : "");
      return '<div class="stat-item' + (csd > 0 ? " has-sd" : "") + '"><span class="stat-name"><i class="rej-cat-dot" style="background:' + a.col + '"></i>' +
        esc(zh ? a.zh : a.en) + '</span>' +
        '<span class="stat-track"><span class="stat-fill" style="width:' + w.toFixed(1) + '%;background:' + a.col + '"></span></span>' +
        '<span class="stat-val">' + valHtml + "</span></div>";
    }).join("");

    var avgRejHtml = rej.overall_rej.toFixed(1) + "%" +
      (rej.overall_rej_sd > 0 ? '<small class="scorebox-sd"> ± ' + rej.overall_rej_sd.toFixed(1) + "%</small>" : "");

    var htasks = rej.hourly_tasks || [];
    var sds = rej.hourly_total_sd || [];
    var rowHtml = "";
    for (var h = 0; h < 7; h++) {
      var ht = htasks[h] || {};
      var tot = rej.hourly_total[h] || 0;
      var sd = sds[h] || 0;
      var vol = Math.round(rej.hourly_vol[h] || 0);
      var rate = sd > 0.2 ? (tot.toFixed(1) + "% ± " + sd.toFixed(1) + "%") : (tot.toFixed(1) + "%");
      var calls = vol.toLocaleString() + (zh ? " 次调用" : " calls");
      var chips = [];
      for (var c = 0; c < 5; c++) {
        var cv = (rej.hourly_cats[h] || [])[c] || 0;
        if (cv >= 1.5) chips.push({ c: c, v: cv });
      }
      chips.sort(function (a, b) { return b.v - a.v; });
      var chipHtml = chips.slice(0, 3).map(function (ch) {
        var a = ACT_AX[ch.c];
        var fg = ch.c === 4 ? "#1f2937" : "#fff";
        return '<span class="rej-7row-chip" style="background:' + a.col + ';color:' + fg + '">' +
          esc((zh ? a.zh : a.en) + " " + ch.v.toFixed(1) + "%") + "</span>";
      }).join("");
      var doing = zh ? (ht.doing_zh || ht.task_zh || "") : (ht.doing_en || ht.task_en || "");
      var blocked = zh ? (ht.blocked_zh || ht.why_zh || "") : (ht.blocked_en || ht.why_en || "");
      rowHtml += '<div class="rej-7row-item" data-hour="' + h + '">' +
        '<div class="rej-7row-hour">' +
        '<span class="rej-7row-badge">' + (h + 1) + "h</span>" +
        '<span class="rej-7row-rate">' + esc(rate) + "</span>" +
        '<span class="rej-7row-calls">' + esc(calls) + "</span>" +
        '<div class="rej-7row-chips">' + chipHtml + "</div></div>" +
        '<div class="rej-7row-col">' +
        '<span class="rej-stage-pill doing">' + (zh ? "在干什么" : "What it's doing") + "</span>" +
        "<p>" + esc(doing) + "</p></div>" +
        '<div class="rej-7row-col">' +
        '<span class="rej-stage-pill blocked">' + (zh ? "被什么卡住了" : "What blocked it") + "</span>" +
        "<p>" + esc(blocked) + "</p></div></div>";
    }
    var timelineHtml =
      '<div class="rej-timeline-section">' +
      '<div class="rej-timeline-head"><h4>' +
      (zh
        ? "1h–7h 逐小时：在干什么、被什么卡住（悬停一行，上方两张图的对应小时会一起亮）"
        : "Hour by hour, 1h–7h: what it was doing and what blocked it (hover a row to light that hour on both charts)") +
      "</h4></div>" +
      '<div class="rej-7row-list" id="rej-hourly-timeline">' + rowHtml + "</div></div>";

    card.innerHTML =
      '<div class="hero-card-top">' +
      '<div class="hero-card-id">' + model.icon +
      '<div class="hero-card-titles"><h3>#' + (idx + 1) + " " + esc(t(model.name_en, model.name_zh)) + "</h3>" +
      '<div class="hero-card-badges">' +
      runBadge +
      '<span class="hc-pill rej-shift ' + shiftCls + '">' + esc(shiftText) + "</span>" +
      "</div></div></div>" +
      '<div class="rej-card-right">' +
      '<div class="rej-step-pager"><button type="button" class="rej-step-btn" id="rej-card-prev" aria-label="Previous model">‹</button>' +
      '<span class="rej-step-count">' + (idx + 1) + " / " + rows.length + "</span>" +
      '<button type="button" class="rej-step-btn" id="rej-card-next" aria-label="Next model">›</button></div>' +
      '<div class="hero-card-scorebox"><span class="scorebox-label">' + (zh ? (isMulti ? "平均被拒率 (均值 ± SD)" : "平均被拒率") : (isMulti ? "Avg Rejection (Mean ± SD)" : "Avg Rejection")) + "</span>" +
      '<span class="scorebox-val">' + avgRejHtml + "</span></div></div></div>" +
      '<div class="dual-radar-stage rej-dual-stage">' +
      '<div class="radar-panel"><div class="radar-panel-head rej-panel-head"><h4>' +
      (zh ? "7 小时分领域动作被拒率柱状图" : "7-Hour Rejection Rate by Category") +
      '</h4><div class="radar-legend rej-panel-legend">' + legHtml + '</div></div><div class="rej-svg-wrap" id="rej-svg-bars"></div></div>' +
      '<div class="radar-panel"><div class="radar-panel-head rej-panel-head"><h4>' +
      (zh ? "7 小时总被拒率趋势与每小时调用次数" : "7-Hour Total Rejection Curve & Call Volume") +
      '</h4><div class="radar-legend rej-panel-legend"><span><i class="model-dot" style="background:#1971c2"></i><span>' +
      (zh ? "每小时总被拒率 (%)" : "Hourly rejection (%)") +
      '</span></span><span><i class="model-dot" style="background:#d5ded9"></i><span>' +
      (zh ? "每小时调用次数（柱底数字）" : "Hourly call volume") +
      '</span></span></div></div><div class="rej-svg-wrap" id="rej-svg-curve"></div></div></div>' +
      timelineHtml +
      '<div class="stat-group rej-cat-summary"><h4>' +
      (zh ? "该模型在五大动作库类别内的各自被拒率（被拒次数 ÷ 该类调用次数）" : "Category-Specific Rejection Rate Across the 7-Hour Run (Rejected ÷ Issued Within Category)") +
      '</h4><div class="rej-cat-grid">' + catRows + "</div></div>";

    drawRejBarSVG(document.getElementById("rej-svg-bars"), rej);
    drawRejCurveSVG(document.getElementById("rej-svg-curve"), rej);

    function highlightHours(hList) {
      var set = {};
      (hList || []).forEach(function (h) { set[h] = true; });
      card.querySelectorAll(".rej-7row-item").forEach(function (el) {
        var on = !!set[Number(el.getAttribute("data-hour"))];
        el.classList.toggle("is-active", on);
      });
      card.querySelectorAll(".svg-hour-col").forEach(function (el) {
        var on = !!set[Number(el.getAttribute("data-hour"))];
        el.classList.toggle("is-active", on);
        var bg = el.querySelector(".svg-hour-bg");
        if (bg) bg.setAttribute("fill-opacity", on ? "0.11" : "0");
      });
      card.querySelectorAll(".svg-hour-dot circle").forEach(function (c, i) {
        c.setAttribute("r", set[i] ? "6" : "4.2");
      });
    }

    card.querySelectorAll("[data-hour]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        highlightHours([Number(el.getAttribute("data-hour"))]);
      });
      el.addEventListener("mouseleave", function () {
        highlightHours([]);
      });
    });

    var pBtn = document.getElementById("rej-card-prev");
    var nBtn = document.getElementById("rej-card-next");
    if (pBtn) pBtn.addEventListener("click", function () { stepRej(-1); });
    if (nBtn) nBtn.addEventListener("click", function () { stepRej(1); });
  }

  function stepRej(delta) {
    if (!DATA) return;
    var rows = DATA.frontier;
    var idx = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === rejSlug) { idx = i; break; }
    var nextIdx = (idx + delta + rows.length) % rows.length;
    selectRej(rows[nextIdx].slug, false);
  }

  function selectRej(nextSlug, syncMain) {
    if (!DATA) return;
    var rows = DATA.frontier;
    var found = rows[0];
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === nextSlug) { found = rows[i]; break; }
    rejSlug = found.slug;
    renderRejRoster();
    renderRejCard();
  }

  /* ---------------- Hourly Self-Management Interactive SVG ---------------- */
  var SELF_BARS = [
    { key: "build", en: "Building", zh: "建造", fill: "#f3d5a5", txt: "#7c4a03" },
    { key: "combat", en: "Combat", zh: "战斗", fill: "#ded5f3", txt: "#43317a" },
    { key: "craft", en: "Crafting", zh: "打造", fill: "#c2e4d8", txt: "#165944" },
    { key: "move", en: "Exploration", zh: "寻路探索", fill: "#e6ece9", txt: "#53665e" }
  ];

  function minWithHour(arr) {
    var best = null;
    for (var h = 0; h < 7; h++) {
      var v = arr && arr[h];
      if (v == null) continue;
      if (!best || v < best.v) best = { v: v, h: h };
    }
    return best;
  }

  function fmtStat(v) {
    if (v == null) return "–";
    return Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : Number(v).toFixed(1);
  }

  function drawSelfSVG(host, sdata) {
    if (!host || !sdata) return;
    var W = 880, H = 328;
    var L = 40, R = 18, T = 26, B = 44;
    var pw = W - L - R, ph = H - T - B;
    var slot = pw / 7;
    var bw = slot * 0.56;
    var zh = lang() === "zh";
    var yOf = function (v) { return T + ph - (Math.min(100, Math.max(0, v)) / 100) * ph; };

    var grid = [0, 25, 50, 75, 100].map(function (tk) {
      var y = yOf(tk);
      return '<line x1="' + L + '" y1="' + y.toFixed(1) + '" x2="' + (W - R) + '" y2="' + y.toFixed(1) +
        '" stroke="' + (tk === 0 ? "#cbd5e1" : "#e6ece8") + '" stroke-width="' + (tk === 0 ? "1.1" : "1") + '"/>' +
        '<text x="' + (L - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="#63706a">' + tk + "</text>";
    }).join("");

    var totals = [];
    var shares = [];
    var hpLbl = [];
    for (var h = 0; h < 7; h++) {
      var b = Number(sdata.build[h] || 0);
      var cb = Number(sdata.combat[h] || 0);
      var cr = Number(sdata.craft[h] || 0);
      var mv = Number(sdata.move[h] || 0);
      var tot = b + cb + cr + mv;
      totals.push(tot);
      shares.push({
        build: tot > 0 ? (100 * b / tot) : 0,
        combat: tot > 0 ? (100 * cb / tot) : 0,
        craft: tot > 0 ? (100 * cr / tot) : 0,
        move: tot > 0 ? (100 * mv / tot) : 0
      });
      var hv = sdata.hp[h];
      if (hv == null) {
        hpLbl.push(null);
      } else if (hv >= 94.0) {
        hpLbl.push({ val: hv, yVal: hv + 4.2, above: true });
      } else {
        var fv = sdata.food[h], ev = sdata.energy[h];
        var upDist = 99, dnDist = 99;
        if (fv != null) { upDist = Math.min(upDist, Math.abs((hv + 5) - fv)); dnDist = Math.min(dnDist, Math.abs((hv - 5) - fv)); }
        if (ev != null) { upDist = Math.min(upDist, Math.abs((hv + 5) - ev)); dnDist = Math.min(dnDist, Math.abs((hv - 5) - ev)); }
        if (upDist >= dnDist && hv <= 91.0) hpLbl.push({ val: hv, yVal: hv + 4.5, above: true });
        else hpLbl.push({ val: hv, yVal: hv - 4.8, above: false });
      }
    }

    var colsSvg = "";
    var hpPts = [], fdPts = [], enPts = [];
    for (var h = 0; h < 7; h++) {
      var cx = L + slot * (h + 0.5);
      var x0 = cx - bw / 2;
      colsSvg += '<g class="svg-hour-col" data-hour="' + h + '">';
      colsSvg += '<rect class="svg-hour-bg" x="' + (L + slot * h + 2).toFixed(1) + '" y="' + (T - 6) +
        '" width="' + (slot - 4).toFixed(1) + '" height="' + (ph + 42) + '" fill="#1971c2" fill-opacity="0" rx="6"/>';
      var cum = 0;
      var ptsAvoid = [];
      if (sdata.hp[h] != null) ptsAvoid.push(sdata.hp[h]);
      if (sdata.food[h] != null) ptsAvoid.push(sdata.food[h]);
      if (sdata.energy[h] != null) ptsAvoid.push(sdata.energy[h]);
      if (hpLbl[h]) ptsAvoid.push(hpLbl[h].yVal + (hpLbl[h].above ? 2.5 : -2.5));

      for (var k = 0; k < SELF_BARS.length; k++) {
        var spec = SELF_BARS[k];
        var pct = shares[h][spec.key];
        if (pct <= 0.1) continue;
        var y1 = yOf(cum);
        var y2 = yOf(cum + pct);
        var bh = Math.max(1.2, y1 - y2);
        colsSvg += '<rect x="' + x0.toFixed(1) + '" y="' + y2.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) +
          '" fill="' + spec.fill + '" stroke="#fff" stroke-width="1.2" rx="1.5"/>';
        if (pct >= 13.5) {
          var loY = cum + 5.5, hiY = cum + pct - 5.5;
          var cands = [0.5, 0.25, 0.75, 0.16, 0.84].map(function (f) {
            return Math.min(hiY, Math.max(loY, cum + pct * f));
          });
          var bestY = cands[0], bestDist = -1;
          for (var ci = 0; ci < cands.length; ci++) {
            var dmin = 99;
            for (var pi = 0; pi < ptsAvoid.length; pi++) dmin = Math.min(dmin, Math.abs(cands[ci] - ptsAvoid[pi]));
            if (dmin > bestDist) { bestDist = dmin; bestY = cands[ci]; }
          }
          if (!(bestDist < 4.5 && pct < 22)) {
            colsSvg += '<text x="' + cx.toFixed(1) + '" y="' + (yOf(bestY) + 3.5).toFixed(1) +
              '" text-anchor="middle" font-size="10.5" font-weight="700" fill="' + spec.txt + '" pointer-events="none">' +
              Math.round(pct) + "%</text>";
          }
        }
        cum += pct;
      }

      var tot = totals[h];
      var totTxt = tot > 0 ? ("(" + fmtStat(tot) + (zh ? "次)" : ")")) : (zh ? "(0次)" : "(0)");
      colsSvg += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph + 16) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="#18181b">' +
        (h + 1) + (zh ? "时" : "h") + "</text>";
      colsSvg += '<text x="' + cx.toFixed(1) + '" y="' + (T + ph + 31) + '" text-anchor="middle" font-size="10" fill="#53665e">' +
        esc(totTxt) + "</text>";
      colsSvg += "</g>";

      if (sdata.food[h] != null) fdPts.push([cx, yOf(sdata.food[h]), sdata.food[h]]);
      if (sdata.energy[h] != null) enPts.push([cx, yOf(sdata.energy[h]), sdata.energy[h]]);
      if (sdata.hp[h] != null) hpPts.push([cx, yOf(sdata.hp[h]), sdata.hp[h], h]);
    }

    var lineJoin = function (arr) {
      return arr.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    };
    var fdSvg = fdPts.length
      ? '<polyline points="' + lineJoin(fdPts) + '" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="5.5 3.5" pointer-events="none"/>' +
        fdPts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.4" fill="#d97706" stroke="#fff" stroke-width="1" pointer-events="none"/>'; }).join("")
      : "";
    var enSvg = enPts.length
      ? '<polyline points="' + lineJoin(enPts) + '" fill="none" stroke="#0f766e" stroke-width="2.1" stroke-dasharray="2.2 3.2" pointer-events="none"/>' +
        enPts.map(function (p) { return '<rect x="' + (p[0] - 2.8).toFixed(1) + '" y="' + (p[1] - 2.8).toFixed(1) + '" width="5.6" height="5.6" fill="#0f766e" stroke="#fff" stroke-width="0.9" pointer-events="none"/>'; }).join("")
      : "";
    var hpSvg = hpPts.length
      ? '<polyline points="' + lineJoin(hpPts) + '" fill="none" stroke="#c92a2a" stroke-width="2.8" pointer-events="none"/>' +
        hpPts.map(function (p) {
          var h = p[3];
          var info = hpLbl[h];
          var lbl = p[2] >= 99.95 ? "100" : Number(p[2]).toFixed(1);
          var ty = yOf(info.yVal);
          var boxW = lbl.length * 6.8 + 8;
          return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.8" fill="#c92a2a" stroke="#fff" stroke-width="1.6" pointer-events="none"/>' +
            '<rect x="' + (p[0] - boxW / 2).toFixed(1) + '" y="' + (ty - (info.above ? 11.5 : 1.5)).toFixed(1) +
            '" width="' + boxW.toFixed(1) + '" height="14" rx="3" fill="#fff" fill-opacity="0.9" pointer-events="none"/>' +
            '<text x="' + p[0].toFixed(1) + '" y="' + (ty + (info.above ? -1 : 9)).toFixed(1) +
            '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#c92a2a" pointer-events="none">' + lbl + "</text>";
        }).join("")
      : "";

    host.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Hourly work mix and physiology curves">' +
      grid + colsSvg + fdSvg + enSvg + hpSvg + "</svg>";
  }

  function renderSelfRoster() {
    var host = document.getElementById("self-roster");
    if (!host || !DATA || !SELF_DATA) return;
    var rows = DATA.frontier;
    host.innerHTML = rows.map(function (m) {
      var on = m.slug === selfSlug ? ' aria-selected="true"' : ' aria-selected="false"';
      var sd = SELF_DATA[m.slug];
      var mh = sd ? minWithHour(sd.hp) : null;
      var badge = mh ? ((lang() === "zh" ? "均值 " : "avg ") + fmtStat(mh.v)) : "";
      return '<button type="button" class="roster-chip" role="option" data-self-slug="' + esc(m.slug) + '"' + on + '>' +
        '<span class="roster-chip-left"><span class="roster-rank">' + esc(m.rank) + "</span>" +
        m.icon + '<span class="roster-name">' + esc(t(m.name_en, m.name_zh)) +
        '</span></span><span class="roster-score rej-chip-rate">' + esc(badge) + "</span></button>";
    }).join("");
    host.querySelectorAll(".roster-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectSelf(btn.getAttribute("data-self-slug"));
      });
    });
    var active = host.querySelector('.roster-chip[aria-selected="true"]');
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }

  function renderSelfCard() {
    var card = document.getElementById("self-hero-card");
    if (!card || !DATA || !SELF_DATA) return;
    var rows = DATA.frontier;
    var idx = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === selfSlug) { idx = i; break; }
    var model = rows[idx];
    var sdata = SELF_DATA[model.slug];
    if (!sdata) return;
    var zh = lang() === "zh";
    var minHp = minWithHour(sdata.hp);
    var minFd = minWithHour(sdata.food);
    var minEn = minWithHour(sdata.energy);

    var hpBadge = minHp
      ? (minHp.v >= 99.5
          ? (zh ? "生命均值 100" : "Avg health 100")
          : (zh ? ("生命均值 " + fmtStat(minHp.v) + "（" + (minHp.h + 1) + "时）") : ("Avg health " + fmtStat(minHp.v) + " (" + (minHp.h + 1) + "h)")))
      : "";
    var fdBadge = minFd ? (zh ? ("饱食均值 " + fmtStat(minFd.v) + "（" + (minFd.h + 1) + "时）") : ("Avg fullness " + fmtStat(minFd.v) + " (" + (minFd.h + 1) + "h)")) : "";
    var enBadge = minEn ? (zh ? ("精力均值 " + fmtStat(minEn.v) + "（" + (minEn.h + 1) + "时）") : ("Avg stamina " + fmtStat(minEn.v) + " (" + (minEn.h + 1) + "h)")) : "";

    var legHtml =
      '<span><i class="self-leg-line" style="border-color:#c92a2a"></i><span>' + (zh ? "生命值 (小时均值)" : "Health (hourly avg)") + "</span></span>" +
      '<span><i class="self-leg-line is-dash" style="border-color:#d97706"></i><span>' + (zh ? "饱食 (小时均值)" : "Fullness (hourly avg)") + "</span></span>" +
      '<span><i class="self-leg-line is-dot" style="border-color:#0f766e"></i><span>' + (zh ? "精力 (小时均值)" : "Stamina (hourly avg)") + "</span></span>" +
      SELF_BARS.map(function (b) {
        return '<span><i class="self-leg-swatch" style="background:' + b.fill + '"></i><span>' + esc(zh ? b.zh : b.en) + "</span></span>";
      }).join("");

    card.innerHTML =
      '<div class="hero-card-top">' +
      '<div class="hero-card-id">' + model.icon +
      '<div class="hero-card-titles"><h3>#' + (idx + 1) + " " + esc(t(model.name_en, model.name_zh)) + "</h3>" +
      '<div class="hero-card-badges">' +
      (hpBadge ? '<span class="hc-pill">' + esc(hpBadge) + "</span>" : "") +
      (fdBadge ? '<span class="hc-pill">' + esc(fdBadge) + "</span>" : "") +
      (enBadge ? '<span class="hc-pill">' + esc(enBadge) + "</span>" : "") +
      "</div></div></div>" +
      '<div class="rej-card-right">' +
      '<div class="rej-step-pager"><button type="button" class="rej-step-btn" id="self-card-prev" aria-label="Previous model">‹</button>' +
      '<span class="rej-step-count">' + (idx + 1) + " / " + rows.length + "</span>" +
      '<button type="button" class="rej-step-btn" id="self-card-next" aria-label="Next model">›</button></div>' +
      '<div class="hero-card-scorebox"><span class="scorebox-label">' + (zh ? "生命小时均值" : "Hourly avg health") + "</span>" +
      '<span class="scorebox-val">' + (minHp ? fmtStat(minHp.v) : "–") + "</span></div></div></div>" +
      '<div class="radar-panel self-panel">' +
      '<div class="radar-panel-head rej-panel-head"><h4>' +
      (zh ? "每小时工作占比与生命 / 饱食 / 精力均值 (0–100)" : "Hourly Work Mix &amp; Health / Fullness / Stamina Averages (0–100)") +
      '</h4><div class="radar-legend rej-panel-legend">' + legHtml + "</div></div>" +
      '<div class="rej-svg-wrap" id="self-svg-wrap"></div>' +
      '<div class="self-hover-bar" id="self-hover-bar"></div>' +
      "</div>";

    drawSelfSVG(document.getElementById("self-svg-wrap"), sdata);

    function showHour(h) {
      card.querySelectorAll(".svg-hour-col").forEach(function (el) {
        var on = Number(el.getAttribute("data-hour")) === h;
        var bg = el.querySelector(".svg-hour-bg");
        if (bg) bg.setAttribute("fill-opacity", on ? "0.09" : "0");
      });
      var bar = document.getElementById("self-hover-bar");
      if (!bar) return;
      var b = Number(sdata.build[h] || 0);
      var cb = Number(sdata.combat[h] || 0);
      var cr = Number(sdata.craft[h] || 0);
      var mv = Number(sdata.move[h] || 0);
      var tot = b + cb + cr + mv;
      var pct = function (v) { return tot > 0 ? Math.round(100 * v / tot) + "%" : "0%"; };
      var head = zh ? ((h + 1) + "时（共 " + fmtStat(tot) + " 次）") : ((h + 1) + "h (" + fmtStat(tot) + " actions)");
      var phys = (zh ? "生命 " : "Health ") + fmtStat(sdata.hp[h]) +
        " · " + (zh ? "饱食 " : "Fullness ") + fmtStat(sdata.food[h]) +
        " · " + (zh ? "精力 " : "Stamina ") + fmtStat(sdata.energy[h]);
      var work = SELF_BARS.map(function (sp) {
        var val = Number(sdata[sp.key][h] || 0);
        return (zh ? sp.zh : sp.en) + " " + pct(val) + " (" + fmtStat(val) + ")";
      }).join(" · ");
      bar.innerHTML = '<strong>' + esc(head) + '</strong><span>' + esc(phys) + '</span><span class="self-hover-sep">|</span><span>' + esc(work) + "</span>";
    }

    var focusHour = minHp ? minHp.h : 0;
    showHour(focusHour);
    card.querySelectorAll(".svg-hour-col").forEach(function (el) {
      var h = Number(el.getAttribute("data-hour"));
      el.addEventListener("mouseenter", function () { showHour(h); });
      el.addEventListener("click", function () { focusHour = h; showHour(h); });
    });

    var pBtn = document.getElementById("self-card-prev");
    var nBtn = document.getElementById("self-card-next");
    if (pBtn) pBtn.addEventListener("click", function () { stepSelf(-1); });
    if (nBtn) nBtn.addEventListener("click", function () { stepSelf(1); });
  }

  function stepSelf(delta) {
    if (!DATA) return;
    var rows = DATA.frontier;
    var idx = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === selfSlug) { idx = i; break; }
    selectSelf(rows[(idx + delta + rows.length) % rows.length].slug);
  }

  function selectSelf(nextSlug) {
    if (!DATA) return;
    var rows = DATA.frontier;
    var found = rows[0];
    for (var i = 0; i < rows.length; i++) if (rows[i].slug === nextSlug) { found = rows[i]; break; }
    selfSlug = found.slug;
    renderSelfRoster();
    renderSelfCard();
  }

  function syncTrackButtons() {
    document.querySelectorAll("#card-track-switch .track-btn").forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-track") === track ? "true" : "false");
    });
    var note = document.getElementById("card-small-note");
    if (note) note.hidden = track !== "small";
  }

  function select(nextSlug, push) {
    var model = find(nextSlug) || listFor(track)[0];
    if (!model) return;
    track = model.track;
    slug = model.slug;
    if (model.track === "frontier") rejSlug = model.slug;
    syncTrackButtons();
    renderRoster();
    renderCard();
    renderRejRoster();
    renderRejCard();
    if (push) {
      var h = "agent=" + encodeURIComponent(slug) + (track === "small" ? "&track=small" : "");
      history.replaceState(null, "", "#" + h);
    }
  }

  function applyHash() {
    var q = hashParams();
    var wanted = q.get("agent");
    var wantedTrack = q.get("track");
    if (wantedTrack === "small" || wantedTrack === "frontier") track = wantedTrack;
    if (!rejSlug && DATA && DATA.frontier.length) rejSlug = DATA.frontier[0].slug;
    if (wanted && find(wanted)) select(wanted, false);
    else if (!slug) select(listFor(track)[0].slug, false);
    else if (find(slug).track !== track) select(listFor(track)[0].slug, false);
    else { syncTrackButtons(); renderRoster(); renderCard(); renderRejRoster(); renderRejCard(); }
  }

  var COG_TONE = {
    T1: { cls: "is-t1", bg: "#87ab97", bd: "#749a85", pips: 1 },
    T2: { cls: "is-t2", bg: "#3f765c", bd: "#33634c", pips: 2 },
    T3: { cls: "is-t3", bg: "#1e4635", bd: "#153427", pips: 3 },
    gathered: { cls: "is-gath", bg: "#87ab97", bd: "#749a85", pips: 1 },
    cooked: { cls: "is-cook", bg: "#3f765c", bd: "#33634c", pips: 2 }
  };

  function pipHtml(n, cls) {
    var s = '<span class="cog-pips ' + cls + '" aria-hidden="true">';
    for (var i = 0; i < n; i++) s += "<i></i>";
    return s + "</span>";
  }

  function cogTable(title, items, groups, groupKey, bagKey) {
    var byId = {};
    groups.forEach(function (g) { byId[g.id] = []; });
    items.forEach(function (item) {
      if (byId[item[groupKey]]) byId[item[groupKey]].push(item);
    });
    var itemPopularity = {};
    items.forEach(function (item) {
      var cnt = 0;
      DATA.frontier.forEach(function (m) {
        var rec = (COG_DATA.models && COG_DATA.models[m.slug]) || {};
        var bag = rec[bagKey] || {};
        if ((bag[item.key] || 0) > 0) cnt++;
      });
      itemPopularity[item.key] = cnt;
    });
    var ordered = [];
    var itemRow = "";
    var legend = "";
    var cols = '<col class="col-name">';
    var totalModels = DATA.frontier.length;
    groups.forEach(function (g, gi) {
      var list = byId[g.id] || [];
      if (!list.length) return;
      var tone = COG_TONE[g.id] || COG_TONE.T1;
      var label = t(g.en, g.zh);
      var dots = "";
      for (var d = 0; d < tone.pips; d++) dots += "<b></b>";
      legend += '<span class="cog-legend-item"><i class="cog-legend-sw" style="background:' + tone.bg + ';border-color:' + tone.bd + '"></i>' + esc(label) + '<span class="cog-legend-pips">' + dots + '</span></span>';
      list.forEach(function (item, idx) {
        ordered.push(item);
        cols += "<col>";
        var icon = item.icon || item.key;
        var itemSep = (gi > 0 && idx === 0) ? " has-sep" : "";
        var pop = itemPopularity[item.key] || 0;
        var headPillCls = pop === 0 ? "cog-pill is-head is-zero" : "cog-pill is-head";
        var headTip = t(item.en, item.zh) + " · " + label + " · " + pop + "/" + totalModels + " " + t("models", "个模型获得");
        itemRow += '<th class="cog-item' + itemSep + '" scope="col" title="' + esc(headTip) + '">' +
          '<span class="cog-ico"><img src="/assets/item-icons/' + esc(icon) + '.png" width="28" height="28" alt=""></span>' +
          pipHtml(tone.pips, tone.cls) +
          '<span class="cog-lbl">' + esc(t(item.en, item.zh)) + '</span>' +
          '<span class="cog-rate"><span class="' + headPillCls + '">' + pop + '<small>/' + totalModels + '</small></span></span></th>';
      });
    });
    cols += '<col class="col-sum">';
    var body = "";
    DATA.frontier.forEach(function (m, mi) {
      var rec = (COG_DATA.models && COG_DATA.models[m.slug]) || { runs: 1, foods: {}, tools: {} };
      var bag = rec[bagKey] || {};
      var cells = "";
      var gotN = 0;
      var fullName = t(m.name_en, m.name_zh);
      groups.forEach(function (g, gi) {
        var list = byId[g.id] || [];
        var tone = COG_TONE[g.id] || COG_TONE.T1;
        list.forEach(function (item, idx) {
          var got = (bag[item.key] || 0) > 0;
          if (got) gotN++;
          var cellSep = (gi > 0 && idx === 0) ? " has-sep" : "";
          var tip = fullName + " · " + t(item.en, item.zh) + " (" + t(g.en, g.zh) + ") · " + (got ? t("obtained", "已获得") : t("not obtained", "未获得"));
          var markCls = "cog-mark" + (got ? (" is-on " + tone.cls) : "");
          cells += '<td class="cog-cell' + cellSep + '" title="' + esc(tip) + '"><span class="' + markCls + '"></span></td>';
        });
      });
      var rankStr = m.rank || (mi + 1 < 10 ? "0" + (mi + 1) : String(mi + 1));
      var pillCls = gotN === 0 ? "cog-pill is-zero" : "cog-pill";
      body += '<tr><th class="cog-name" scope="row"><span class="cog-name-in"><span class="cog-rank">' + esc(rankStr) + '</span>' + m.icon + '<span class="cog-name-txt">' + esc(fullName) + '</span></span></th>' +
        cells + '<td class="cog-sum"><span class="' + pillCls + '">' + gotN + '<small>/' + ordered.length + '</small></span></td></tr>';
    });
    var tblCls = bagKey === "foods" ? "cog-table is-foods" : "cog-table is-tools";
    var unlockedItems = ordered.filter(function (it) { return (itemPopularity[it.key] || 0) > 0; }).length;
    var sub = unlockedItems + "/" + ordered.length + " " + t("unlocked across models", "种已有模型解锁");
    return '<article class="cog-card"><div class="cog-card-head"><div class="cog-card-title"><h3>' + esc(title) + '</h3><span class="cog-card-sub">' + esc(sub) + '</span></div><div class="cog-legend">' + legend + '</div></div>' +
      '<div class="cog-wrap"><table class="' + tblCls + '"><colgroup>' + cols + '</colgroup><thead><tr><th class="cog-name">' + esc(t("Model", "模型")) + '</th>' + itemRow + '<th class="cog-sum">' + esc(t("Total", "合计")) + '</th></tr></thead><tbody>' + body + '</tbody></table></div></article>';
  }

  function renderCognition() {
    var host = document.getElementById("cog-board");
    if (!host || !DATA || !COG_DATA) return;
    host.innerHTML =
      cogTable(t("Tools and gear", "工具装备"), COG_DATA.tools, COG_DATA.tool_groups, "tier", "tools") +
      cogTable(t("Foods", "食物"), COG_DATA.foods, COG_DATA.food_groups, "kind", "foods");
  }

  var VY_PALETTE = [
    "#e07b27", "#2b76b9", "#7f58af", "#2d7d5e", "#c6423a",
    "#0d7490", "#a16207", "#be185d", "#4d7c0f", "#4338ca"
  ];
  var vyActive = {};
  var vyDsvRun = {};

  function vyGetRec(mslug, did) {
    var mObj = (PLAN_DATA.models || {})[mslug] || {};
    if (mslug === "dsv41f" && mObj.sub_runs) {
      var rid = String(vyDsvRun[did] || mObj.default_run || 5);
      if (mObj.sub_runs[rid] && mObj.sub_runs[rid][did]) return mObj.sub_runs[rid][did];
    }
    return mObj[did];
  }

  function vyTextW(str, fontPx) {
    var w = 0;
    for (var i = 0; i < str.length; i++) {
      w += str.charCodeAt(i) > 255 ? fontPx * 1.02 : fontPx * 0.56;
    }
    return w;
  }

  function vyFmtH(h) {
    var mins = Math.round(h * 60);
    var hh = Math.floor(mins / 60);
    var mm = mins % 60;
    return hh + "h" + (mm < 10 ? "0" : "") + mm;
  }

  function vyOverlap(a, b) {
    return !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
  }

  function vySegHitsBox(seg, box) {
    var dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
    var p = [-dx, dx, -dy, dy];
    var q = [seg.x1 - box.x1, box.x2 - seg.x1, seg.y1 - box.y1, box.y2 - seg.y1];
    var u1 = 0, u2 = 1;
    for (var i = 0; i < 4; i++) {
      var pi = p[i], qi = q[i];
      if (Math.abs(pi) < 1e-9) {
        if (qi < 0) return false;
      } else {
        var r = qi / pi;
        if (pi < 0) {
          if (r > u2) return false;
          if (r > u1) u1 = r;
        } else {
          if (r < u1) return false;
          if (r < u2) u2 = r;
        }
      }
    }
    return u1 <= u2;
  }

  function vyValAt(pts, h) {
    var cur = 0;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i][0] <= h + 0.0002) cur = pts[i][1];
      else break;
    }
    return cur;
  }

  function vySampleIcons(icons, maxN) {
    if (!icons || icons.length <= maxN) return (icons || []).slice();
    var scored = icons.map(function (ic, idx) {
      var p = ic.boss ? 4 : (ic.tier >= 2 ? 3 : (ic.icon === "meal" || ic.icon === "door-key" ? 3 : (ic.tier === 1 ? 2 : 1)));
      return { ic: ic, idx: idx, p: p };
    });
    var must = scored.filter(function (x) { return x.p >= 3; });
    var rest = scored.filter(function (x) { return x.p < 3; });
    var chosen = must.slice(0, maxN);
    var rem = maxN - chosen.length;
    if (rem > 0 && rest.length > 0) {
      for (var i = 0; i < rem; i++) {
        var rIdx = rem === 1 ? Math.floor(rest.length / 2) : Math.round((i * (rest.length - 1)) / (rem - 1));
        if (chosen.indexOf(rest[rIdx]) < 0) chosen.push(rest[rIdx]);
      }
    }
    chosen.sort(function (a, b) { return a.idx - b.idx; });
    return chosen.map(function (x) { return x.ic; });
  }

  function vyRichCode(str) {
    return esc(str).replace(/\b([A-Z]{2,}(?:_[A-Z0-9]+)+)\b/g, "<code>$1</code>");
  }

  function vyRenderCard(dim, frontierBySlug) {
    var did = dim.id;
    if (!vyActive[did]) vyActive[did] = (dim.featured || []).slice();
    var activeSlugs = vyActive[did];
    var activeSet = {};
    activeSlugs.forEach(function (s, idx) {
      activeSet[s] = VY_PALETTE[idx % VY_PALETTE.length];
    });

    var W = 1000, H = 456;
    var L = 66, R = 26, T = 20, B = 52;
    var PW = W - L - R, PH = H - T - B;
    var yMax = dim.y_max || 100;
    function px(h) { return L + (Math.max(0, Math.min(7, h)) / 7) * PW; }
    function py(v) { return T + PH - (Math.max(0, Math.min(yMax, v)) / yMax) * PH; }

    var svg = "";
    // Gridlines & ticks
    for (var xh = 0; xh <= 7; xh++) {
      var gx = px(xh).toFixed(1);
      if (xh > 0) {
        svg += '<line x1="' + gx + '" y1="' + T + '" x2="' + gx + '" y2="' + (T + PH) + '" stroke="#efeae0" stroke-width="1"/>';
      }
      svg += '<text x="' + gx + '" y="' + (T + PH + 19) + '" text-anchor="middle" font-size="11" fill="#5b554a" font-weight="550">' + xh + "h</text>";
    }
    (dim.y_ticks || []).forEach(function (yt) {
      var gy = py(yt).toFixed(1);
      if (yt > 0) {
        svg += '<line x1="' + L + '" y1="' + gy + '" x2="' + (L + PW) + '" y2="' + gy + '" stroke="#efeae0" stroke-width="1"/>';
      }
      svg += '<text x="' + (L - 9) + '" y="' + (parseFloat(gy) + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="#5b554a" font-weight="550">' + yt + "</text>";
    });

    if (dim.cap_line) {
      var cyCap = py(dim.cap_line.y).toFixed(1);
      svg += '<line x1="' + L + '" y1="' + cyCap + '" x2="' + (L + PW) + '" y2="' + cyCap + '" stroke="#9fb8aa" stroke-width="1.2" stroke-dasharray="4 4"/>' +
        '<text x="' + (L + PW - 4) + '" y="' + (parseFloat(cyCap) - 5).toFixed(1) + '" text-anchor="end" font-size="10" font-weight="650" fill="#3b6b54">' +
        esc(t(dim.cap_line.en, dim.cap_line.zh)) + "</text>";
    }

    // 1. Background unselected frontier lines
    DATA.frontier.forEach(function (m) {
      if (activeSet[m.slug]) return;
      var srec = vyGetRec(m.slug, did);
      if (!srec || !srec.pts) return;
      var dStr = srec.pts.map(function (pt, idx) {
        return (idx === 0 ? "M" : "L") + px(pt[0]).toFixed(1) + "," + py(pt[1]).toFixed(1);
      }).join(" ");
      var tipBg = t(m.name_en, m.name_zh) + " · " + srec.final + " (" + t("click to highlight", "点击高亮对比") + ")";
      svg += '<path class="vy-bg-line" data-vy-dim="' + esc(did) + '" data-vy-slug="' + esc(m.slug) + '" d="' + dStr +
        '" fill="none" stroke="#e3ddd0" stroke-width="1.35" stroke-linejoin="round"><title>' + esc(tipBg) + "</title></path>";
    });

    // Collect every active polyline segment for strict curve-collision avoidance
    var activeSegs = [];
    var obstacles = [];
    activeSlugs.forEach(function (mslug) {
      var srec = vyGetRec(mslug, did);
      if (!srec || !srec.pts) return;
      for (var i = 0; i < srec.pts.length - 1; i++) {
        activeSegs.push({
          x1: px(srec.pts[i][0]), y1: py(srec.pts[i][1]),
          x2: px(srec.pts[i + 1][0]), y2: py(srec.pts[i + 1][1])
        });
      }
    });

    // 2 & 3. Per-model grouped curves (halo + crisp line + vertex markers + wide transparent hover target)
    var curvesSvg = "";
    activeSlugs.forEach(function (mslug) {
      var col = activeSet[mslug];
      var srec = vyGetRec(mslug, did);
      if (!srec || !srec.pts) return;
      var dLine = srec.pts.map(function (pt, idx) {
        return (idx === 0 ? "M" : "L") + px(pt[0]).toFixed(1) + "," + py(pt[1]).toFixed(1);
      }).join(" ");

      var mVerts = "";
      (srec.notes || []).forEach(function (nt) {
        var nx = px(nt.h), ny = py(nt.y);
        if (nt.kind === "stall") {
          obstacles.push({ x1: nx - 6.5, y1: ny - 6.5, x2: nx + 6.5, y2: ny + 6.5 });
          mVerts += '<g transform="translate(' + nx.toFixed(1) + ',' + ny.toFixed(1) + ')">' +
            '<circle r="5.5" fill="#fcfbf8" stroke="#b83b2a" stroke-width="1.6"/>' +
            '<path d="M-2.4,-2.4 L2.4,2.4 M-2.4,2.4 L2.4,-2.4" stroke="#b83b2a" stroke-width="1.6" stroke-linecap="round"/></g>';
        } else if (nt.kind === "recover") {
          obstacles.push({ x1: nx - 5.5, y1: ny - 5.5, x2: nx + 5.5, y2: ny + 5.5 });
          mVerts += '<circle cx="' + nx.toFixed(1) + '" cy="' + ny.toFixed(1) + '" r="4.2" fill="#fcfbf8" stroke="' + col + '" stroke-width="2"/>';
        }
      });

      curvesSvg += '<g class="vy-m-layer" data-vy-slug="' + esc(mslug) + '">' +
        '<path class="vy-active-halo" d="' + dLine + '" fill="none" stroke="' + col + '" stroke-width="7" stroke-opacity="0.11" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>' +
        '<path class="vy-active-curve" d="' + dLine + '" fill="none" stroke="' + col + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>' +
        mVerts +
        '<path class="vy-hit-curve" data-vy-slug="' + esc(mslug) + '" d="' + dLine + '" fill="none" stroke="transparent" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</g>";
    });

    var activeSorted = activeSlugs.slice().sort(function (a, b) {
      var fa = (vyGetRec(a, did) || {}).final || 0;
      var fb = (vyGetRec(b, did) || {}).final || 0;
      return fb - fa;
    });

    // 4. Voyager arrow callouts: strictly placed in open space avoiding ALL active curve segments
    var calloutsSvg = "";
    var prioOrder = { stall: 1, recover: 2, lock: 3, boss: 4, t3: 5, t2: 6, stage: 7, t1: 8 };
    var calloutQueue = [];
    activeSorted.forEach(function (mslug) {
      var col = activeSet[mslug];
      var srec = vyGetRec(mslug, did);
      if (!srec || !srec.notes || !srec.notes.length) return;
      var sortedNotes = srec.notes.slice().sort(function (a, b) {
        return (prioOrder[a.kind] || 9) - (prioOrder[b.kind] || 9);
      }).slice(0, 2);
      sortedNotes.forEach(function (nt) {
        calloutQueue.push({ mslug: mslug, col: col, nt: nt, p: prioOrder[nt.kind] || 9 });
      });
    });
    calloutQueue.sort(function (a, b) { return a.p - b.p; });

    var seenStageLabel = {};
    calloutQueue.forEach(function (item) {
      var nt = item.nt;
      var col = item.col;
      var mslug = item.mslug;
      var txt = t(nt.en, nt.zh);
      if (nt.kind !== "stall" && nt.kind !== "recover") {
        if (seenStageLabel[txt]) return;
      }
      var tw = vyTextW(txt, 10.4) + 8;
      var ax = px(nt.h), ayPt = py(nt.y);
      var cands = ayPt > T + PH - 56
        ? [[0, -30], [44, -34], [-44, -34], [0, -50], [60, -52], [-60, -52], [0, -68]]
        : [[0, -28], [0, -46], [42, -30], [-42, -30], [0, 28], [44, 28], [-44, 28], [0, -64], [62, -46], [-62, -46]];
      for (var ci = 0; ci < cands.length; ci++) {
        var dx = cands[ci][0], dy = cands[ci][1];
        var ly = ayPt + dy;
        if (ly < T + 13 || ly > T + PH - 6) continue;
        var lx = Math.max(L + 8 + tw / 2, Math.min(L + PW - 6 - tw / 2, ax + dx));
        var box = { x1: lx - tw / 2 - 3, y1: ly - 12, x2: lx + tw / 2 + 3, y2: ly + 4 };
        if (obstacles.some(function (ob) { return vyOverlap(box, ob); })) continue;
        if (activeSegs.some(function (sg) { return vySegHitsBox(sg, box); })) continue;

        obstacles.push(box);
        seenStageLabel[txt] = 1;
        var lblCol = nt.kind === "stall" ? "#a63626" : nt.kind === "recover" ? "#1e5b42" : "#223027";
        var arrowCol = nt.kind === "stall" ? "#b83b2a" : col;
        var yStart = dy < 0 ? ly + 4 : ly - 12;
        var gapTip = (nt.kind === "stall" || nt.kind === "recover") ? 8.5 : 5.5;
        var yTip = dy < 0 ? ayPt - gapTip : ayPt + gapTip;
        var xStart = Math.max(lx - tw / 2 + 8, Math.min(lx + tw / 2 - 8, ax + dx * 0.45));
        var vx = ax - xStart, vy = yTip - yStart;
        var vlen = Math.sqrt(vx * vx + vy * vy) || 1;
        var ux = vx / vlen, uy = vy / vlen;
        var pxN = -uy, pyN = ux;
        var tipX = ax, tipY = yTip + uy * 1.5;
        var b1x = ax - ux * 4.5 + pxN * 2.8, b1y = yTip - uy * 4.5 + pyN * 2.8;
        var b2x = ax - ux * 4.5 - pxN * 2.8, b2y = yTip - uy * 4.5 - pyN * 2.8;
        calloutsSvg += '<g class="vy-callout" data-vy-slug="' + esc(mslug) + '">' +
          '<line x1="' + xStart.toFixed(1) + '" y1="' + yStart.toFixed(1) + '" x2="' + ax.toFixed(1) + '" y2="' + yTip.toFixed(1) +
          '" stroke="' + arrowCol + '" stroke-width="1.2"/>' +
          '<polygon points="' + tipX.toFixed(1) + "," + tipY.toFixed(1) + " " +
          b1x.toFixed(1) + "," + b1y.toFixed(1) + " " +
          b2x.toFixed(1) + "," + b2y.toFixed(1) + '" fill="' + arrowCol + '"/>' +
          '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="middle" font-size="10.4" font-weight="650" fill="' + lblCol +
          '" style="paint-order:stroke;stroke:#fcfbf8;stroke-width:3.4px;stroke-linejoin:round">' + esc(txt) + "</text></g>";
        break;
      }
    });

    // 5. Transparent pixel sprites floating beside curves (ZERO intersection with any active curve segment, NO opaque white box)
    var spritesSvg = "";
    var spOffsets = [
      [0, -24], [-21, -22], [-24, -6], [21, -22],
      [0, 24], [21, 22], [-21, 22],
      [0, -37], [-32, -25], [32, -25], [0, 37], [-33, 14], [33, -12],
      [-26, -34], [26, -34], [0, -48], [-38, 0], [38, 0]
    ];
    activeSorted.forEach(function (mslug) {
      var mMeta = frontierBySlug[mslug];
      var col = activeSet[mslug];
      var srec = vyGetRec(mslug, did);
      if (!srec || !mMeta) return;
      var dsvTag = mslug === "dsv41f" ? " (R" + (vyDsvRun[did] || 5) + ")" : "";
      var mName = t(mMeta.name_en, mMeta.name_zh) + dsvTag;
      var picked = vySampleIcons(srec.icons, 9);
      picked.forEach(function (ic) {
        var ax = px(ic.h), ay = py(ic.y);
        for (var oi = 0; oi < spOffsets.length; oi++) {
          var cx = ax + spOffsets[oi][0];
          var cy = ay + spOffsets[oi][1];
          if (cx < L + 15 || cx > L + PW - 15 || cy < T + 15 || cy > T + PH - 15) continue;
          var curveGuard = { x1: cx - 15, y1: cy - 15, x2: cx + 15, y2: cy + 15 };
          if (activeSegs.some(function (sg) { return vySegHitsBox(sg, curveGuard); })) continue;
          var obBox = { x1: cx - 14.5, y1: cy - 14.5, x2: cx + 14.5, y2: cy + 14.5 };
          if (obstacles.some(function (ob) { return vyOverlap(obBox, ob); })) continue;

          obstacles.push(obBox);
          var dxS = ax - cx, dyS = ay - cy;
          var dist = Math.sqrt(dxS * dxS + dyS * dyS) || 1;
          var sx1 = cx + (dxS / dist) * 14.5, sy1 = cy + (dyS / dist) * 14.5;
          var sx2 = ax - (dxS / dist) * 3.2, sy2 = ay - (dyS / dist) * 3.2;
          var spTip = mName + " · " + t(ic.en, ic.zh) + " · " + vyFmtH(ic.h);
          spritesSvg += '<g class="vy-sp" data-vy-slug="' + esc(mslug) + '" data-sp-tip="' + esc(spTip) + '">' +
            '<line x1="' + sx1.toFixed(1) + '" y1="' + sy1.toFixed(1) + '" x2="' + sx2.toFixed(1) + '" y2="' + sy2.toFixed(1) +
            '" stroke="' + col + '" stroke-width="1.15" stroke-opacity="0.55"/>' +
            '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="2.4" fill="' + col + '"/>' +
            '<image href="/assets/item-icons/' + esc(ic.icon) + '.png" x="' + (cx - 14.5).toFixed(1) + '" y="' + (cy - 14.5).toFixed(1) +
            '" width="29" height="29"/><title>' + esc(spTip) + "</title></g>";
          break;
        }
      });
    });

    svg += curvesSvg + spritesSvg + calloutsSvg;

    // 6. Crisp X/Y axes with Voyager arrowheads + axis titles + hover hairline
    var xEnd = L + PW + 8, yTopA = T - 8;
    svg += '<line x1="' + L + '" y1="' + (T + PH) + '" x2="' + (xEnd - 4) + '" y2="' + (T + PH) + '" stroke="#1e2b23" stroke-width="1.5"/>' +
      '<polygon points="' + (xEnd + 2) + "," + (T + PH) + " " + (xEnd - 5) + "," + (T + PH - 3.8) + " " + (xEnd - 5) + "," + (T + PH + 3.8) + '" fill="#1e2b23"/>' +
      '<line x1="' + L + '" y1="' + (T + PH) + '" x2="' + L + '" y2="' + (yTopA + 4) + '" stroke="#1e2b23" stroke-width="1.5"/>' +
      '<polygon points="' + L + "," + (yTopA - 2) + " " + (L - 3.8) + "," + (yTopA + 5) + " " + (L + 3.8) + "," + (yTopA + 5) + '" fill="#1e2b23"/>' +
      '<text x="' + (L + PW / 2).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle" font-size="12" font-weight="650" fill="#2b352e">' +
      esc(t("Season Elapsed Time (0h – 7h)", "7 小时开放世界推进时间 (0h – 7h)")) + "</text>" +
      '<text transform="translate(17,' + (T + PH / 2).toFixed(1) + ') rotate(-90)" text-anchor="middle" font-size="12" font-weight="650" fill="#2b352e">' +
      esc(t(dim.y_en, dim.y_zh)) + "</text>" +
      '<line class="vy-xhair" x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + PH) + '" stroke="#8c8578" stroke-width="1" stroke-dasharray="3 3" visibility="hidden" pointer-events="none"/>';

    // Dedicated Tech-Tree / Stage Progression Bar above the SVG plot (never overlaps curves)
    var treeStepsHtml = (dim.tree_stages || []).map(function (st, si) {
      var icImgs = (st.icons || []).map(function (icName) {
        return '<img src="/assets/item-icons/' + esc(icName) + '.png" width="27" height="27" alt="">';
      }).join("");
      var arrow = si < (dim.tree_stages.length - 1) ? '<span class="vy-tree-arr" aria-hidden="true">→</span>' : "";
      return '<span class="vy-tree-step"><span class="vy-tree-icons">' + icImgs + "</span><span>" + esc(t(st.en, st.zh)) + "</span></span>" + arrow;
    }).join("");
    var treeBarHtml = '<div class="vy-tree-bar"><span class="vy-tree-lbl">' + esc(t(dim.tree_title_en, dim.tree_title_zh)) +
      '</span><div class="vy-tree-steps">' + treeStepsHtml + "</div></div>";

    // Legends (active curves + single-run R1-R5 selector for dsv41f + bench pills for remaining frontier models)
    var curDsvRun = vyDsvRun[did] || 5;
    var legBtns = activeSlugs.map(function (mslug) {
      var m = frontierBySlug[mslug];
      var srec = vyGetRec(mslug, did);
      if (!m || !srec) return "";
      var col = activeSet[mslug];
      var nameDisp = t(m.name_en, m.name_zh) + (mslug === "dsv41f" ? " · R" + curDsvRun : "");
      return '<button type="button" class="vy-leg-btn" data-vy-slug="' + esc(mslug) + '" data-vy-toggle="' + esc(mslug) + '" data-vy-dim="' + esc(did) + '" title="' + esc(t("Hover to spotlight · click to hide", "悬停单独高亮 · 点击隐藏该曲线")) + '">' +
        '<span class="vy-leg-sw" style="background:' + col + '"></span>' + m.icon +
        '<span>' + esc(nameDisp) + '</span><span class="vy-leg-val">' + esc(String(srec.final)) + "</span></button>";
    }).join("");

    var runPickerHtml = "";
    if (activeSet["dsv41f"]) {
      var rBtns = [5, 1, 2, 3, 4].map(function (rn) {
        var pr = rn === curDsvRun ? "true" : "false";
        return '<button type="button" class="vy-run-btn" data-vy-dim="' + esc(did) + '" data-vy-run="' + rn + '" aria-pressed="' + pr + '">R' + rn + "</button>";
      }).join("");
      runPickerHtml = '<span class="vy-run-bar" title="' + esc(t("Switch deepseek-v4.1-flash single run", "切换 deepseek-v4.1-flash 单局轨迹")) + '">' +
        '<span class="vy-run-lbl">' + esc(t("DS run:", "DS单局:")) + "</span>" + rBtns + "</span>";
    }

    var benchBtns = DATA.frontier.filter(function (m) { return !activeSet[m.slug]; }).map(function (m) {
      var srec = vyGetRec(m.slug, did);
      var v = srec ? srec.final : 0;
      return '<button type="button" class="vy-pill-btn" data-vy-toggle="' + esc(m.slug) + '" data-vy-dim="' + esc(did) + '">' +
        "+ " + esc(t(m.name_en, m.name_zh)) + " (" + esc(String(v)) + ")</button>";
    }).join("");

    var isCustom = JSON.stringify(activeSlugs) !== JSON.stringify(dim.featured || []) || curDsvRun !== 5;
    var resetHtml = isCustom ? '<button type="button" class="vy-reset-btn" data-vy-reset="' + esc(did) + '">' + esc(t("Reset default 5", "恢复默认 5 条")) + "</button>" : "";

    var stateTagMap = {
      ok: { en: "Recovered", zh: "报错调通" },
      fail: { en: "Stalled", zh: "受挫停滞" },
      calm: { en: "Zero-error", zh: "顺畅直通" },
      skip: { en: "Skipped", zh: "未涉足" }
    };
    var diagHtml = activeSlugs.map(function (mslug) {
      var m = frontierBySlug[mslug];
      var srec = vyGetRec(mslug, did);
      if (!m || !srec || !srec.diag) return "";
      var col = activeSet[mslug];
      var st = srec.diag.state || "calm";
      var stLab = stateTagMap[st] || stateTagMap.calm;
      return '<div class="vy-diag-item is-' + esc(st) + '" data-vy-slug="' + esc(mslug) + '">' +
        '<span class="vy-diag-dot" style="background:' + col + '"></span>' +
        '<div class="vy-diag-body"><span class="vy-diag-name">' + esc(t(m.name_en, m.name_zh)) + '</span>' +
        '<span class="vy-diag-tag is-' + esc(st) + '">' + esc(t(stLab.en, stLab.zh)) + '</span>' +
        '<span class="vy-diag-txt">' + vyRichCode(t(srec.diag.en, srec.diag.zh)) + "</span></div></div>";
    }).join("");

    return '<article class="vy-card" data-vy-card="' + esc(did) + '">' +
      '<div class="vy-head"><div><h3>' + esc(t(dim.title_en, dim.title_zh)) + '</h3><p class="vy-sub">' + esc(t(dim.sub_en, dim.sub_zh)) + '</p></div>' +
      '<div class="vy-key-row">' +
      '<span class="vy-key-item vy-key-Recover">○ ' + esc(t("Plateau → climb: error recovery", "平台后拉升：报错调通")) + "</span>" +
      '<span class="vy-key-item vy-key-Stall">✕ ' + esc(t("Flatline: stalled after failure", "✕ 后平躺：受挫停滞")) + "</span>" +
      '<span class="vy-key-item">' + esc(t("Hover curve: spotlight & dim others", "悬停曲线：整条高亮、其余变浅")) + "</span>" +
      "</div></div>" +
      treeBarHtml +
      '<div class="vy-fig-wrap"><svg class="vy-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(t(dim.title_en, dim.title_zh)) + '">' +
      svg + '</svg><div class="vy-tip" hidden></div></div>' +
      '<div class="vy-legend">' + legBtns + runPickerHtml + resetHtml + "</div>" +
      (diagHtml ? '<div class="vy-diag-list">' + diagHtml + "</div>" : "") +
      (benchBtns ? '<div class="vy-bench-bar"><span class="vy-bench-lbl">' + esc(t("Other frontier models (gray lines):", "其余前沿模型（图中浅灰线，点击叠加）：")) + "</span>" + benchBtns + "</div>" : "") +
      "</article>";
  }

  function renderPlanning() {
    var host = document.getElementById("plan-board");
    if (!host || !DATA || !PLAN_DATA) return;
    var dims = PLAN_DATA.dimensions || [];
    if (!dims.length) return;
    var bySlug = {};
    DATA.frontier.forEach(function (m) { bySlug[m.slug] = m; });

    host.innerHTML = dims.map(function (dim) { return vyRenderCard(dim, bySlug); }).join("");

    function toggleSlug(did, s) {
      var list = (vyActive[did] || []).slice();
      var idx = list.indexOf(s);
      if (idx >= 0) {
        if (list.length > 1) list.splice(idx, 1);
      } else {
        list.push(s);
      }
      vyActive[did] = list;
      renderPlanning();
    }

    host.querySelectorAll("[data-vy-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggleSlug(btn.getAttribute("data-vy-dim"), btn.getAttribute("data-vy-toggle"));
      });
    });
    host.querySelectorAll(".vy-bg-line").forEach(function (pathEl) {
      pathEl.addEventListener("click", function () {
        toggleSlug(pathEl.getAttribute("data-vy-dim"), pathEl.getAttribute("data-vy-slug"));
      });
    });
    host.querySelectorAll("[data-vy-reset]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var did = btn.getAttribute("data-vy-reset");
        var dObj = dims.filter(function (d) { return d.id === did; })[0];
        if (dObj) {
          vyActive[did] = (dObj.featured || []).slice();
          vyDsvRun[did] = 5;
          renderPlanning();
        }
      });
    });

    host.querySelectorAll("[data-vy-run]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var did = btn.getAttribute("data-vy-dim");
        var rn = parseInt(btn.getAttribute("data-vy-run"), 10);
        if (did && rn) {
          vyDsvRun[did] = rn;
          renderPlanning();
        }
      });
    });

    host.querySelectorAll(".vy-card").forEach(function (card) {
      var did = card.getAttribute("data-vy-card");
      var xhair = card.querySelector(".vy-xhair");
      var tip = card.querySelector(".vy-tip");
      var svgEl = card.querySelector(".vy-svg");
      var wrapEl = card.querySelector(".vy-fig-wrap");
      if (!xhair || !tip || !svgEl) return;

      var curFocus = null;
      function setFocus(fSlug) {
        if (curFocus === fSlug) return;
        curFocus = fSlug;
        if (!fSlug) {
          card.classList.remove("has-focus");
          card.querySelectorAll(".is-focus").forEach(function (el) { el.classList.remove("is-focus"); });
          return;
        }
        card.classList.add("has-focus");
        card.querySelectorAll("[data-vy-slug]").forEach(function (el) {
          var match = el.getAttribute("data-vy-slug") === fSlug;
          if (match) {
            el.classList.add("is-focus");
            // Raise focused curve layer above sibling curve layers so it sits cleanly in front
            if (el.classList.contains("vy-m-layer") && el.parentNode) {
              var firstSp = svgEl.querySelector(".vy-sp, .vy-callout, .vy-xhair");
              if (firstSp) el.parentNode.insertBefore(el, firstSp);
            }
          } else {
            el.classList.remove("is-focus");
          }
        });
      }

      card.querySelectorAll(".vy-leg-btn, .vy-diag-item").forEach(function (el) {
        var s = el.getAttribute("data-vy-slug");
        if (!s) return;
        el.addEventListener("mouseenter", function () { setFocus(s); });
        el.addEventListener("mouseleave", function () { setFocus(null); });
      });

      svgEl.addEventListener("mousemove", function (ev) {
        var pt = svgEl.createSVGPoint();
        pt.x = ev.clientX; pt.y = ev.clientY;
        var ctm = svgEl.getScreenCTM();
        if (!ctm) return;
        var loc = pt.matrixTransform(ctm.inverse());
        if (loc.x < 64 || loc.x > 976 || loc.y < 18 || loc.y > 406) {
          xhair.setAttribute("visibility", "hidden");
          tip.hidden = true;
          setFocus(null);
          return;
        }

        // Spotlight curve if hovering directly on a curve hit-path, sprite, or callout, OR within 14 SVG units of an active curve
        var hoverEl = ev.target && ev.target.closest ? ev.target.closest(".vy-hit-curve, .vy-sp, .vy-callout") : null;
        var nearSlug = hoverEl ? hoverEl.getAttribute("data-vy-slug") : null;
        if (!nearSlug) {
          var hRaw = Math.max(0, Math.min(7, ((loc.x - 66) / (1000 - 66 - 26)) * 7));
          var yMaxDim = (dims.filter(function (d) { return d.id === did; })[0] || {}).y_max || 100;
          var bestDist = 14;
          (vyActive[did] || []).forEach(function (ms) {
            var sr = vyGetRec(ms, did);
            if (!sr || !sr.pts) return;
            var valY = vyValAt(sr.pts, hRaw);
            var svgY = 20 + (456 - 20 - 52) - (Math.max(0, Math.min(yMaxDim, valY)) / yMaxDim) * (456 - 20 - 52);
            var dy = Math.abs(loc.y - svgY);
            if (dy < bestDist) {
              bestDist = dy;
              nearSlug = ms;
            }
          });
        }
        setFocus(nearSlug);

        var h = Math.max(0, Math.min(7, ((loc.x - 66) / (1000 - 66 - 26)) * 7));
        var snapH = Math.round(h * 12) / 12;
        var sx = 66 + (snapH / 7) * (1000 - 66 - 26);
        xhair.setAttribute("x1", sx.toFixed(1));
        xhair.setAttribute("x2", sx.toFixed(1));
        xhair.setAttribute("visibility", "visible");

        var spEl = ev.target && ev.target.closest ? ev.target.closest(".vy-sp") : null;
        var spNote = spEl ? spEl.getAttribute("data-sp-tip") : "";
        var slugs = vyActive[did] || [];
        var curRn = vyDsvRun[did] || 5;
        var lines = (spNote ? '<div style="color:#f3d59b;font-weight:650;margin-bottom:3px">★ ' + esc(spNote) + "</div>" : "") +
          "<strong>" + esc(vyFmtH(snapH)) + "</strong>";
        slugs.forEach(function (ms, idx) {
          var m = bySlug[ms];
          var sr = vyGetRec(ms, did);
          if (!m || !sr) return;
          var v = vyValAt(sr.pts, snapH);
          var col = VY_PALETTE[idx % VY_PALETTE.length];
          var isFoc = nearSlug && nearSlug === ms;
          var rowOp = nearSlug && !isFoc ? "opacity:.48;" : "";
          var rowWt = isFoc ? "font-weight:700;color:#fff;" : "";
          var nm = t(m.name_en, m.name_zh) + (ms === "dsv41f" ? " (R" + curRn + ")" : "");
          lines += '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;' + rowOp + rowWt + '">' +
            '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + col + ';margin-right:5px"></i>' +
            esc(nm) + "</span><strong>" + esc(String(v)) + "</strong></div>";
        });
        tip.innerHTML = lines;
        tip.hidden = false;
        var wRect = wrapEl.getBoundingClientRect();
        var leftPx = ev.clientX - wRect.left + 20;
        if (leftPx + 250 > wRect.width) leftPx = Math.max(8, ev.clientX - wRect.left - 252);
        var relY = ev.clientY - wRect.top;
        var topPx = relY > wRect.height * 0.48 ? 10 : Math.min(Math.max(10, wRect.height - (tip.offsetHeight || 110) - 12), relY + 24);
        tip.style.left = leftPx + "px";
        tip.style.top = topPx + "px";
      });

      svgEl.addEventListener("mouseleave", function () {
        xhair.setAttribute("visibility", "hidden");
        tip.hidden = true;
        setFocus(null);
      });
    });
  }

  function boot() {
    var roster = document.getElementById("agent-roster");
    if (!roster) return;
    fetch("/assets/model-cards.json?v=15").then(function (r) { return r.json(); }).then(function (data) {
      DATA = data;
      rejSlug = data.frontier[0].slug;
      document.querySelectorAll("#card-track-switch .track-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          track = btn.getAttribute("data-track");
          select(listFor(track)[0].slug, true);
        });
      });
      var pPrev = document.getElementById("prof-prev");
      var pNext = document.getElementById("prof-next");
      if (pPrev) pPrev.addEventListener("click", function () { stepProfile(-1); });
      if (pNext) pNext.addEventListener("click", function () { stepProfile(1); });

      var profCard = document.getElementById("model-hero-card");
      if (profCard) {
        var pTouchX = null;
        profCard.addEventListener("touchstart", function (e) {
          if (e.touches && e.touches.length === 1) pTouchX = e.touches[0].clientX;
        }, { passive: true });
        profCard.addEventListener("touchend", function (e) {
          if (pTouchX == null || !e.changedTouches || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - pTouchX;
          pTouchX = null;
          if (Math.abs(dx) > 40) stepProfile(dx < 0 ? 1 : -1);
        }, { passive: true });
      }

      var prevB = document.getElementById("rej-prev");
      var nextB = document.getElementById("rej-next");
      if (prevB) prevB.addEventListener("click", function () { stepRej(-1); });
      if (nextB) nextB.addEventListener("click", function () { stepRej(1); });

      var rejCard = document.getElementById("rej-hero-card");
      if (rejCard) {
        var touchX = null;
        rejCard.addEventListener("touchstart", function (e) {
          if (e.touches && e.touches.length === 1) touchX = e.touches[0].clientX;
        }, { passive: true });
        rejCard.addEventListener("touchend", function (e) {
          if (touchX == null || !e.changedTouches || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - touchX;
          touchX = null;
          if (Math.abs(dx) > 40) stepRej(dx < 0 ? 1 : -1);
        }, { passive: true });
      }

      var sPrev = document.getElementById("self-prev");
      var sNext = document.getElementById("self-next");
      if (sPrev) sPrev.addEventListener("click", function () { stepSelf(-1); });
      if (sNext) sNext.addEventListener("click", function () { stepSelf(1); });

      var selfCard = document.getElementById("self-hero-card");
      if (selfCard) {
        var sTouchX = null;
        selfCard.addEventListener("touchstart", function (e) {
          if (e.touches && e.touches.length === 1) sTouchX = e.touches[0].clientX;
        }, { passive: true });
        selfCard.addEventListener("touchend", function (e) {
          if (sTouchX == null || !e.changedTouches || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - sTouchX;
          sTouchX = null;
          if (Math.abs(dx) > 40) stepSelf(dx < 0 ? 1 : -1);
        }, { passive: true });
      }

      if (selfCard) {
        fetch("/assets/self-hourly/data.json?v=9").then(function (r) { return r.json(); }).then(function (sdata) {
          SELF_DATA = sdata;
          selfSlug = data.frontier[0].slug;
          renderSelfRoster();
          renderSelfCard();
        }).catch(function () {});
      }

      if (document.getElementById("cog-board")) {
        fetch("/assets/cognition-items.json?v=2").then(function (r) { return r.json(); }).then(function (cdata) {
          COG_DATA = cdata;
          renderCognition();
        }).catch(function () {});
      }

      if (document.getElementById("plan-board")) {
        fetch("/assets/voyager-curves.json?v=7").then(function (r) { return r.json(); }).then(function (pdata) {
          PLAN_DATA = pdata;
          renderPlanning();
        }).catch(function () {});
      }

      applyHash();
      window.addEventListener("hashchange", applyHash);
      document.addEventListener("asiworld:lang", function () {
        if (DATA && slug) { renderRoster(); renderCard(); renderRejRoster(); renderRejCard(); renderSelfRoster(); renderSelfCard(); renderCognition(); renderPlanning(); }
      });
    }).catch(function () {
      roster.textContent = "Model card data failed to load.";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

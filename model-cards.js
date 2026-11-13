/* Per-model dual radar card & action-rejection slider card. Data: /assets/model-cards.json */
(function () {
  var DATA = null;
  var track = "frontier";
  var slug = null;
  var rejSlug = null;

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
      '</div></div></div><div class="milestone-strip">' +
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

  function boot() {
    var roster = document.getElementById("agent-roster");
    if (!roster) return;
    fetch("/assets/model-cards.json?v=14").then(function (r) { return r.json(); }).then(function (data) {
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

      applyHash();
      window.addEventListener("hashchange", applyHash);
      document.addEventListener("asiworld:lang", function () {
        if (DATA && slug) { renderRoster(); renderCard(); renderRejRoster(); renderRejCard(); }
      });
    }).catch(function () {
      roster.textContent = "Model card data failed to load.";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

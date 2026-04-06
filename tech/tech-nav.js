/**
 * InkField Tech Series — 統一導航 + Hero 管理
 *
 * 功能：
 *   1. 注入 series-nav（教學系列導航）
 *   2. 注入 hero-back（返回按鈕）和 hero-lang（語言切換）
 *
 * 用法：每頁 hero 區只需保留 <h1> 和 <p>，其餘由 JS 注入。
 *
 *   <div class="hero">
 *     <h1>標題<span>重點</span></h1>
 *     <p>副標題描述</p>
 *     <nav id="series-nav" class="series-nav"></nav>
 *   </div>
 *   <script src="tech-nav.js"></script>          <!-- 中文頁 -->
 *   <script src="../tech-nav.js"></script>        <!-- en/ 頁 -->
 *
 * 自動偵測語言（依路徑 /en/）及當前頁面（依 URL），標記 active。
 */
(function () {
  // ── Cache-bust shared CSS (avoid Live Server stale cache) ──
  // Ensure layout fixes (e.g. hero subtitle min-height) take effect immediately.
  (function cacheBustSharedCss() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      if (!href) continue;
      if (href.indexOf('tech-shared.css') === -1) continue;
      if (href.indexOf('?v=') !== -1) return;
      links[i].setAttribute('href', href + (href.indexOf('?') === -1 ? '?v=20260406b' : '&v=20260406b'));
      return;
    }
  })();

  // ── 導航資料（分欄）──
  var NAV = {
    zh: {
      backText: '<img src="assets/logo_1.gif" alt="Inkfield" class="hero-back-logo">',
      columns: [
        { label: '基礎', items: [
          { href: 'index.html',          name: '首頁' },
          { href: 'brush-physics.html',   name: '筆刷物理學' },
          { href: 'color-journey.html',   name: '顏色的旅程' }
        ]},
        { label: '效果', items: [
          { href: 'ink-effects.html',     name: '墨水效果全圖鑑' },
          { href: 'effects.html',         name: '特效工廠' },
          { href: 'blend-flow.html',      name: '混色與力場' },
          { href: 'recording.html',       name: '錄影帶的秘密' }
        ]},
        { label: '學習風格', items: [
          { href: 'dailylog.html',            name: 'AI 日誌' },
          { href: 'ai-json-generation.html',  name: 'AI 代理' },
          { href: 'emotion-intention.html',   name: '情緒與意圖' },
          { href: 'gallery.html',             name: '藝廊' }
        ]}
      ]
    },
    en: {
      backText: '<img src="assets/logo_1.gif" alt="Inkfield" class="hero-back-logo">',
      columns: [
        { label: 'Fundamentals', items: [
          { href: 'index.html',          name: 'Home' },
          { href: 'brush-physics.html',   name: 'Brush Physics' },
          { href: 'color-journey.html',   name: 'Color Journey' }
        ]},
        { label: 'Effects', items: [
          { href: 'ink-effects.html',     name: 'Ink Effects' },
          { href: 'effects.html',         name: 'Effects Workshop' },
          { href: 'blend-flow.html',      name: 'Blend & Flow' },
          { href: 'recording.html',       name: 'Recording & Playback' }
        ]},
        { label: 'System & Works', items: [
          { href: 'dailylog.html',            name: 'AI Log' },
          { href: 'ai-json-generation.html',  name: 'AI Agent' },
          { href: 'emotion-intention.html',   name: 'Emotion & Intention' },
          { href: 'gallery.html',             name: 'Gallery' }
        ]}
      ]
    }
  };

  // ── 偵測語言與路徑 ──
  var path = window.location.pathname;
  var isEN = /\/en(\/|$)/.test(path);
  var lang = isEN ? 'en' : 'zh';
  var data = NAV[lang];

  // ── 偵測當前頁面 ──
  // 移除語言目錄後取檔名（/tech/en/brush-physics → brush-physics）
  var segments = path.replace(/\/$/, '').split('/');
  var lastSeg = segments.pop() || '';
  // 若最後一段是目錄名（tech, en）或空字串，視為 index
  if (!lastSeg || lastSeg === 'en' || lastSeg === 'tech') lastSeg = 'index';
  // 補上 .html 副檔名
  var currentFile = lastSeg.indexOf('.') === -1 ? lastSeg + '.html' : lastSeg;

  // ── 1. 注入 hero-back 和 hero-lang ──
  var hero = document.querySelector('.hero');
  if (hero) {
    // 返回按鈕（如果不存在才注入）
    if (!hero.querySelector('.hero-back')) {
      var backLink = document.createElement('a');
      backLink.className = 'hero-back';
      backLink.href = isEN ? '../../index.html' : '../index.html';
      var backHTML = data.backText;
      if (isEN) backHTML = backHTML.replace('src="assets/', 'src="../assets/');
      backLink.innerHTML = backHTML;
      hero.insertBefore(backLink, hero.firstChild);
    }

    // 語言切換（如果不存在才注入）
    if (!hero.querySelector('.hero-lang')) {
      var langEl = document.createElement('span');
      langEl.className = 'hero-lang';
      if (isEN) {
        langEl.innerHTML = '<a href="../' + currentFile + '">中文</a> · <span class="active">EN</span>';
      } else {
        langEl.innerHTML = '<span class="active">中文</span> · <a href="en/' + currentFile + '">EN</a>';
      }
      // 插入在 back link 之後
      var backEl = hero.querySelector('.hero-back');
      if (backEl && backEl.nextSibling) {
        hero.insertBefore(langEl, backEl.nextSibling);
      } else {
        hero.appendChild(langEl);
      }
    }
  }

  // ── 2. 注入 Series Navigation（分欄）──
  var html = '<div class="series-grid">\n';
  for (var c = 0; c < data.columns.length; c++) {
    var col = data.columns[c];
    html += '  <div class="series-col">\n';
    html += '    <div class="series-col-label">' + col.label + '</div>\n';
    for (var i = 0; i < col.items.length; i++) {
      var item = col.items[i];
      var isActive = (currentFile === item.href);
      html += '    <a class="series-link' + (isActive ? ' active' : '') + '" href="' + item.href + '">';
      html += item.name;
      html += '</a>\n';
    }
    html += '  </div>\n';
  }
  html += '</div>';

  var mount = document.getElementById('series-nav');
  if (mount) {
    mount.innerHTML = html;
    if (mount.tagName !== 'NAV') {
      mount.setAttribute('role', 'navigation');
      mount.setAttribute('aria-label', lang === 'zh' ? '教學系列導航' : 'Tutorial Series Navigation');
    }
  }
})();

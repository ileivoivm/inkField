/**
 * Gallery index renderer — reads recordings/index.json and paints a grid.
 * Uses .artwork-card classes from tech-shared.css design language.
 * Paginates 20 per page; current page tracked via ?page=N.
 */
(function () {
  const GRID = document.getElementById("gallery-grid");
  const EMPTY = document.getElementById("gallery-empty");
  const COUNT = document.getElementById("gallery-count");
  const PAGER = document.getElementById("gallery-pager");
  const PAGE_SIZE = 20;
  let _items = []; // cached so pagination doesn't refetch

  async function loadIndex() {
    try {
      // cache: 'no-store' 是瀏覽器端硬性指令，不依賴伺服器 header
      // 同時繞開 bfcache 殘留的舊回應
      const res = await fetch("./recordings/index.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      console.warn("[gallery] index.json 載入失敗:", e);
      return { items: [] };
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  // Brush ID → name
  const BRUSH_NAMES = {
    1: "standard",
    2: "marker",
    3: "gothic",
    4: "pen",
    5: "spray",
    6: "fly",
    7: "special",
  };

  function brushLabel(ids) {
    if (!ids || ids.length === 0) return "-";
    return ids.map((id) => BRUSH_NAMES[id] || id).join(" · ");
  }

  function makeCard(item) {
    const card = document.createElement("a");
    card.className = "artwork-card";
    card.href = `./view.html?id=${encodeURIComponent(item.id)}`;
    card.setAttribute("data-artwork-id", item.id);

    // 縮圖
    if (item.thumbnail) {
      const img = document.createElement("img");
      img.className = "artwork-thumb";
      img.src = item.thumbnail;
      img.alt = item.title || "Untitled";
      img.loading = "lazy";
      card.appendChild(img);
    } else {
      const empty = document.createElement("div");
      empty.className = "artwork-thumb-empty";
      empty.textContent = "no preview";
      card.appendChild(empty);
    }

    // info
    const info = document.createElement("div");
    info.className = "artwork-info";
    const title = item.title || "Untitled";
    const author = item.author || "Anonymous";
    const strokeCount = item.strokeCount || 0;
    const durationSec = item.durationSec || 0;
    const flowCount = item.flowCount || 0;
    const size = item.canvasSize
      ? `${item.canvasSize.width}×${item.canvasSize.height}`
      : "";

    const engine = item.engineVersion || "";
    info.innerHTML = `
      <div class="artwork-title">${escapeHtml(title)}</div>
      <div class="artwork-meta">
        <span>${escapeHtml(author)}</span>
        <span>${strokeCount} strokes</span>
        ${flowCount ? `<span>${flowCount} flow</span>` : ""}
        <span>${durationSec}s</span>
        ${size ? `<span>${size}</span>` : ""}
      </div>
      <div class="artwork-brushes">${escapeHtml(brushLabel(item.brushModesUsed))}</div>
      ${engine ? `<div class="artwork-engine" title="${escapeHtml(engine)}">${escapeHtml(engine)}</div>` : ""}
    `;

    card.appendChild(info);
    return card;
  }

  function getCurrentPage(totalPages) {
    const raw = parseInt(new URLSearchParams(location.search).get("page") || "1", 10);
    if (!Number.isFinite(raw) || raw < 1) return 1;
    if (raw > totalPages) return totalPages;
    return raw;
  }

  function renderPager(currentPage, totalPages) {
    if (!PAGER) return;
    while (PAGER.firstChild) PAGER.removeChild(PAGER.firstChild);
    if (totalPages <= 1) return;

    const mkLink = (label, page, opts = {}) => {
      const a = document.createElement(opts.disabled ? "span" : "a");
      a.textContent = label;
      a.className = "pager-btn" +
        (opts.active ? " active" : "") +
        (opts.disabled ? " disabled" : "");
      if (!opts.disabled) {
        a.href = page === 1 ? "./" : `./?page=${page}`;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          goToPage(page);
        });
      }
      return a;
    };

    PAGER.appendChild(mkLink("← Prev", currentPage - 1, { disabled: currentPage === 1 }));

    // 數字頁碼：全部顯示（gallery 規模通常 < 20 頁），超過 9 頁時做摺疊
    const pages = [];
    if (totalPages <= 9) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      if (start > 2) pages.push("…");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }
    pages.forEach((p) => {
      if (p === "…") {
        const span = document.createElement("span");
        span.textContent = "…";
        span.className = "pager-ellipsis";
        PAGER.appendChild(span);
      } else {
        PAGER.appendChild(mkLink(String(p), p, { active: p === currentPage }));
      }
    });

    PAGER.appendChild(mkLink("Next →", currentPage + 1, { disabled: currentPage === totalPages }));
  }

  function paint(items) {
    // 清空現有 grid
    while (GRID.firstChild) GRID.removeChild(GRID.firstChild);
    if (items.length === 0) {
      if (EMPTY) EMPTY.style.display = "block";
      return;
    }
    if (EMPTY) EMPTY.style.display = "none";
    items.forEach((item) => GRID.appendChild(makeCard(item)));
  }

  function paintPage() {
    const totalPages = Math.max(1, Math.ceil(_items.length / PAGE_SIZE));
    const page = getCurrentPage(totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const slice = _items.slice(start, start + PAGE_SIZE);
    paint(slice);
    renderPager(page, totalPages);
    if (COUNT) {
      COUNT.textContent = totalPages > 1
        ? `${_items.length} works · page ${page} / ${totalPages}`
        : `${_items.length} works`;
    }
    // 滾回頂部，避免分頁切換後仍停在底部
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function goToPage(page) {
    const url = page === 1 ? "./" : `./?page=${page}`;
    history.pushState({ page }, "", url);
    paintPage();
  }

  async function render() {
    const index = await loadIndex();
    _items = index.items || [];
    paintPage();
  }

  render();

  // 上一頁/下一頁瀏覽器導航
  window.addEventListener("popstate", () => paintPage());

  // bfcache 還原（按上一頁）時重新抓 index.json，避免顯示舊快照
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) render();
  });
})();

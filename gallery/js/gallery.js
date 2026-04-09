/**
 * Gallery index renderer — reads recordings/index.json and paints a grid.
 * Uses .artwork-card classes from tech-shared.css design language.
 */
(function () {
  const GRID = document.getElementById("gallery-grid");
  const EMPTY = document.getElementById("gallery-empty");
  const COUNT = document.getElementById("gallery-count");

  async function loadIndex() {
    try {
      const res = await fetch("./recordings/index.json?t=" + Date.now(), { cache: "no-cache" });
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

  async function render() {
    const index = await loadIndex();
    const items = index.items || [];
    if (COUNT) COUNT.textContent = `${items.length} works`;
    if (items.length === 0) {
      if (EMPTY) EMPTY.style.display = "block";
      return;
    }
    if (EMPTY) EMPTY.style.display = "none";
    items.forEach((item) => GRID.appendChild(makeCard(item)));
  }

  render();
})();

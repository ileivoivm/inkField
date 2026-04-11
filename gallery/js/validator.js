/**
 * InkField JSON Gallery — Validator
 *
 * 驗證上傳的 InkField 錄製 JSON，回傳：
 *   { ok: boolean, errors: [], warnings: [], stats: {...} }
 *
 * 驗證規則來自 BrushResearch CLAUDE.md 的經驗：
 * - Bug 2: strokeData 格式必須嚴格遵守（~40 欄位 + forceMapParams 16 欄位）
 * - Bug 4: brushMode 1-7、brushColorMode 0-35
 * - mp 事件 x/y 必須在頂層
 * - md 密度建議 50-80 per stroke
 */

(function (global) {
  const REQUIRED_TOP_FIELDS = [
    "events",
    "canvasSize",
    "randomSeed",
  ];

  const REQUIRED_STROKEDATA_FIELDS = [
    "brushMode",
    "brushColorMode",
    "initialSize",
    "strokeSeed",
  ];

  function validateInkFieldJSON(raw) {
    const result = {
      ok: false,
      errors: [],
      warnings: [],
      stats: null,
    };

    // ---- Step 1: JSON parse ----
    let data;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        result.errors.push("JSON.parse failed: " + e.message);
        return result;
      }
    } else if (typeof raw === "object" && raw !== null) {
      data = raw;
    } else {
      result.errors.push("Input must be a JSON string or object");
      return result;
    }

    // ---- Step 2: top-level fields ----
    for (const f of REQUIRED_TOP_FIELDS) {
      if (data[f] === undefined) {
        result.errors.push(`Missing top-level field: ${f}`);
      }
    }
    if (!Array.isArray(data.events)) {
      result.errors.push("events must be an array");
      return result;
    }
    if (!data.canvasSize || typeof data.canvasSize.width !== "number") {
      result.errors.push("canvasSize.width/height missing or wrong type");
    }

    // ---- Step 3: 事件統計 ----
    const stats = {
      totalEvents: data.events.length,
      strokeCount: 0,
      mdCount: 0,
      flowCount: 0,
      biteCount: 0,
      maskCount: 0,
      brushModesUsed: new Set(),
      brushColorModesUsed: new Set(),
      mdPerStroke: [],
      canvasWidth: data.canvasSize ? data.canvasSize.width : null,
      canvasHeight: data.canvasSize ? data.canvasSize.height : null,
      durationMs: 0,
    };

    let currentStrokeMdCount = 0;
    let strokeOpen = false;
    let lastT = 0;

    for (let i = 0; i < data.events.length; i++) {
      const ev = data.events[i];
      if (!ev || typeof ev !== "object") {
        result.errors.push(`events[${i}] is not an object`);
        continue;
      }

      if (typeof ev.t === "number" && ev.t > lastT) lastT = ev.t;

      const m = ev.m;

      if (m === "mp") {
        // mp: must have top-level x/y + strokeData
        if (typeof ev.x !== "number" || typeof ev.y !== "number") {
          result.errors.push(`events[${i}] mp event missing top-level x/y (common bug: placed inside strokeData)`);
        }
        if (!ev.strokeData || typeof ev.strokeData !== "object") {
          result.errors.push(`events[${i}] mp event missing strokeData object`);
        } else {
          const sd = ev.strokeData;
          for (const f of REQUIRED_STROKEDATA_FIELDS) {
            if (sd[f] === undefined) {
              result.warnings.push(`events[${i}].strokeData missing ${f} (auto-fill will cover it, but explicit values recommended)`);
            }
          }
          // brushMode range
          if (sd.brushMode !== undefined) {
            if (sd.brushMode < 1 || sd.brushMode > 7) {
              result.errors.push(`events[${i}] brushMode=${sd.brushMode} out of range 1-7`);
            }
            stats.brushModesUsed.add(sd.brushMode);
          }
          // brushColorMode range
          if (sd.brushColorMode !== undefined) {
            if (sd.brushColorMode < 0 || sd.brushColorMode > 35) {
              result.errors.push(`events[${i}] brushColorMode=${sd.brushColorMode} out of range 0-35`);
            }
            stats.brushColorModesUsed.add(sd.brushColorMode);
          }
        }
        stats.strokeCount++;
        currentStrokeMdCount = 0;
        strokeOpen = true;
      } else if (m === "md") {
        if (typeof ev.x !== "number" || typeof ev.y !== "number") {
          result.errors.push(`events[${i}] md event missing top-level x/y`);
        }
        stats.mdCount++;
        currentStrokeMdCount++;
      } else if (m === "mr") {
        if (strokeOpen) {
          stats.mdPerStroke.push(currentStrokeMdCount);
          strokeOpen = false;
        }
      } else if (m === "flow") {
        stats.flowCount++;
      } else if (m === "bite") {
        stats.biteCount++;
      } else if (m === "mask") {
        stats.maskCount++;
      }
    }

    if (strokeOpen) {
      stats.mdPerStroke.push(currentStrokeMdCount);
      result.warnings.push("Last stroke has no mr event (not properly closed)");
    }

    stats.durationMs = lastT;
    stats.durationSec = Math.round(lastT / 1000);
    stats.brushModesUsed = Array.from(stats.brushModesUsed).sort();
    stats.brushColorModesUsed = Array.from(stats.brushColorModesUsed).sort();
    stats.avgMdPerStroke =
      stats.mdPerStroke.length > 0
        ? Math.round(stats.mdPerStroke.reduce((a, b) => a + b, 0) / stats.mdPerStroke.length)
        : 0;

    // Engine signature: future inkField will write something like
    //   "2026-04-09 13:01:57 | commit: 152ba69"
    // into the JSON. Field name candidates we accept:
    stats.engineVersion =
      data.engineVersion ||
      data.engineSignature ||
      data.inkfieldVersion ||
      data.recordingEngine ||
      null;

    // ---- Step 4: density warnings ----
    if (stats.avgMdPerStroke > 0 && stats.avgMdPerStroke < 50) {
      result.warnings.push(
        `Average md per stroke is ${stats.avgMdPerStroke}, below the recommended 50-80. Strokes may look unnatural.`
      );
    }
    if (stats.strokeCount === 0) {
      result.warnings.push("No strokes found (strokeCount=0)");
    }

    // ---- 結果 ----
    result.stats = stats;
    result.ok = result.errors.length === 0;
    return result;
  }

  function formatReport(res) {
    const lines = [];
    lines.push(res.ok ? "✅ Valid" : "❌ Invalid");
    if (res.stats) {
      const s = res.stats;
      lines.push("");
      lines.push(`Canvas:    ${s.canvasWidth}×${s.canvasHeight}`);
      lines.push(`Strokes:   ${s.strokeCount}`);
      lines.push(`md events: ${s.mdCount} (avg ${s.avgMdPerStroke}/stroke)`);
      lines.push(`Duration:  ${s.durationSec}s`);
      lines.push(`Brushes:   ${s.brushModesUsed.join(", ") || "none"}`);
      lines.push(`Colors:    ${s.brushColorModesUsed.join(", ") || "none"}`);
      if (s.flowCount) lines.push(`Flow:      ${s.flowCount}`);
      if (s.biteCount) lines.push(`Bite:      ${s.biteCount}`);
      if (s.maskCount) lines.push(`Mask:      ${s.maskCount}`);
      if (s.engineVersion) lines.push(`Engine:    ${s.engineVersion}`);
      else lines.push(`Engine:    (none — legacy JSON, will be tagged manually)`);
    }
    if (res.errors.length) {
      lines.push("");
      lines.push("❌ Errors:");
      res.errors.forEach((e) => lines.push("  - " + e));
    }
    if (res.warnings.length) {
      lines.push("");
      lines.push("⚠️  Warnings:");
      res.warnings.forEach((w) => lines.push("  - " + w));
    }
    return lines.join("\n");
  }

  // 從驗證結果抽出 gallery metadata
  function extractMetadata(res, opts) {
    if (!res.ok || !res.stats) return null;
    const s = res.stats;
    opts = opts || {};
    const meta = {
      id: opts.id || null,
      title: opts.title || "Untitled",
      author: opts.author || "Anonymous",
      date: opts.date || new Date().toISOString().slice(0, 10),
      engineVersion: s.engineVersion || opts.engineVersion || null,
      canvasSize: { width: s.canvasWidth, height: s.canvasHeight },
      strokeCount: s.strokeCount,
      durationSec: s.durationSec,
      brushModesUsed: s.brushModesUsed,
      brushColorModesUsed: s.brushColorModesUsed,
      flowCount: s.flowCount,
      tags: opts.tags || [],
      thumbnail: opts.thumbnail || null,
      jsonPath: opts.jsonPath || null,
    };
    if (opts.forkedFrom) meta.forkedFrom = opts.forkedFrom;
    return meta;
  }

  global.InkFieldValidator = {
    validate: validateInkFieldJSON,
    formatReport: formatReport,
    extractMetadata: extractMetadata,
  };
})(typeof window !== "undefined" ? window : globalThis);

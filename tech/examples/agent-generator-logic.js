/**
 * ============================================================================
 *  InkField Inkfield — 交錯式抽象表現主義 JSON 生成器 v5
 * ============================================================================
 *
 *  Architecture: Interleaved Strokes + Flow Effects
 *  Pattern: [N strokes] → Flow → [N strokes] → Flow → ... → [N strokes]
 *
 *  設計者：AI Agent (Claude)
 *  日期：2026-03-03
 *  迭代次數：5（從幾何抽象 → 垂直表現主義 → 交錯式）
 *
 *  執行方式：
 *    Node.js:  node 02-generator-logic.js
 *    Browser:  移除 fs.require / fs.writeFileSync，用 loadRecordingFromText()
 *
 * ============================================================================
 */

const fs = require('fs');

// ─────────────────────────────────────────────────
//  Section 1: 工具函式
// ─────────────────────────────────────────────────

/** 範圍內隨機浮點數 */
function rand(a, b) { return Math.random() * (b - a) + a; }

/** 範圍內隨機整數（含 a, b） */
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

/**
 * 高斯隨機數 — Box-Muller 轉換
 *
 * 為什麼用高斯而不是均勻分佈？
 * → 人類行為（手部位置、筆觸起點）自然地服從常態分佈
 * → 均勻分佈看起來「太機械」，高斯分佈有中心聚焦的有機感
 */
function gaussRand(mean, std) {
  let u = 1 - Math.random(), v = Math.random();
  return mean + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std;
}

/** 數值裁剪 */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }


// ─────────────────────────────────────────────────
//  Section 2: 畫布與全域設定
// ─────────────────────────────────────────────────

const W = 800, H = 800;       // 畫布尺寸
const CX = W * 0.5;            // 構圖中心 X（水平正中）
const CY = H * 0.45;           // 構圖中心 Y（略高於正中，視覺重心偏上更自然）

/**
 * 為什麼 CY = 0.45 而不是 0.5？
 * → 繪畫構圖中，視覺重心通常在畫面偏上 1/3 處
 * → 這讓垂直筆觸向下延伸時，整體不會顯得「下墜」
 */


// ─────────────────────────────────────────────────
//  Section 3: 調色盤設計
// ─────────────────────────────────────────────────

/**
 * Inkfield 的 brushColorMode 是一個 int 值（0~30+），
 * 對應系統內建的色彩。我們不能用任意 RGB，只能從預設色中選。
 *
 * weight 控制該顏色被選中的機率。
 * 設計原則：冷色為主（teal + blue = 11），暖色點綴（orange + red = 6），
 *           加少量中性色（gray = 1）增加層次。
 */
const PALETTE = [
  { bcm: 8,  name: 'teal',   weight: 6 },   // 主色調 — 大面積使用
  { bcm: 9,  name: 'blue',   weight: 5 },   // 次主色 — 與 teal 形成冷色基調
  { bcm: 6,  name: 'orange', weight: 4 },   // 暖色對比 — 打破冷色單調
  { bcm: 30, name: 'red',    weight: 2 },   // 點綴色 — 少量使用製造焦點
  { bcm: 3,  name: 'gray',   weight: 1 },   // 中性色 — 增加深度
];

const totalWeight = PALETTE.reduce((s, c) => s + c.weight, 0);

/** 依照權重隨機選色 */
function pickColor() {
  let r = rand(0, totalWeight);
  for (const c of PALETTE) { r -= c.weight; if (r <= 0) return c; }
  return PALETTE[0];
}


// ─────────────────────────────────────────────────
//  Section 4: 結構設計 — 交錯模式
// ─────────────────────────────────────────────────

/**
 * 交錯模式的核心設計：
 *
 *   STROKE_GROUPS = [4, 4, 4, 4, 4]
 *   → 5 組，每組 4 筆 = 共 20 筆
 *   → 組與組之間插入 Flow Effect
 *   → 最後一組之後不加 Flow（讓最後的筆觸保持銳利）
 *
 * 時間線：
 *   [Stroke 1-4] →800-1500ms→ [Flow 1: ≥1.2s] →500-1000ms→
 *   [Stroke 5-8] →800-1500ms→ [Flow 2: ≥1.2s] →500-1000ms→
 *   [Stroke 9-12] → ... → [Stroke 17-20]
 *
 * 為什麼每組 4 筆？
 * → 太少（1-2筆）：Flow 影響的內容太少，看不出效果
 * → 太多（8+筆）：回到 sequential 模式的問題，Flow 失去層次感
 * → 4 筆是平衡點：足夠的視覺內容 + 頻繁的 Flow 干預
 */
const STROKE_GROUPS = [4, 4, 4, 4, 4];
const NUM_FLOW_EFFECTS = STROKE_GROUPS.length - 1;  // 4 個 Flow

/**
 * Flow blendType 選擇
 *
 * 每次 Flow 使用不同的 blendType，避免視覺重複：
 *   Flow 1: Vertical(3)    — 垂直方向流動，配合垂直筆觸
 *   Flow 2: Horizontal(4)  — 水平方向，製造交叉效果
 *   Flow 3: Cellular(8)    — 有機細胞狀，增加隨機性
 *   Flow 4: Concentric(2)  — 同心圓，收束視覺焦點
 */
const FLOW_TYPES = [3, 4, 8, 2, 7];


// ─────────────────────────────────────────────────
//  Section 5: 筆觸路徑生成 — 物理模擬
// ─────────────────────────────────────────────────

/**
 * 生成一條垂直筆觸路徑
 *
 * 不是簡單的直線 — 用三層模擬疊加：
 *   1. sin wave：模擬手腕的自然擺動週期
 *   2. random noise：模擬手指的微顫抖
 *   3. tilt shift：模擬手臂角度造成的整體傾斜
 *
 * @param {number} cx       - 中心 X 座標
 * @param {number} startY   - 起點 Y
 * @param {number} endY     - 終點 Y
 * @param {number} numPoints - 點數（= md 事件數）
 * @param {number} tiltDeg  - 傾斜角度（度）
 * @returns {Array<{x,y}>}  - 路徑點陣列
 */
function generateVerticalStroke(cx, startY, endY, numPoints, tiltDeg) {
  const points = [];
  const tiltRad = (tiltDeg || 0) * Math.PI / 180;

  // 手腕擺動參數 — 每筆都不同
  const wobbleAmp = rand(1, 5);       // 擺幅 1-5px
  const wobbleFreq = rand(0.02, 0.08); // 頻率
  const phase = rand(0, Math.PI * 2);  // 相位偏移

  const yStep = (endY - startY) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const y = startY + yStep * i;

    // Layer 1: sin wave（手腕擺動）
    // Layer 2: random noise（手指顫抖）
    const wobble = Math.sin(i * wobbleFreq * 10 + phase) * wobbleAmp + rand(-1.5, 1.5);

    // Layer 3: tilt（手臂角度）
    const tiltShift = (y - startY) * Math.tan(tiltRad);

    points.push({
      x: Math.round(clamp(cx + wobble + tiltShift, 15, W - 15)),
      y: Math.round(clamp(y, 15, H - 15))
    });
  }
  return points;
}


// ─────────────────────────────────────────────────
//  Section 6: 構圖系統 — Slot-based 定位
// ─────────────────────────────────────────────────

/**
 * Slot-based 定位系統
 *
 * 問題：純隨機分佈會造成筆觸聚集（尤其在畫布左上角）
 * 解法：把畫布寬度的 65% 分成 N 個 slot，每筆分配到一個 slot
 *       然後在 slot 內做高斯偏移，既有秩序又不機械
 *
 *   |  slot 1  |  slot 2  |  slot 3  | ... |  slot N  |
 *   |    ↓     |    ↓     |    ↓     |     |    ↓     |
 *   | gauss(cx, σ) | gauss(cx, σ) | ...                |
 *
 * @param {number} index - 第幾筆（0-based）
 * @param {number} total - 總筆數
 * @returns {number}     - X 座標
 */
function getStrokeX(index, total) {
  const slotWidth = (W * 0.65) / total;
  const startX = CX - (total * slotWidth) / 2;
  return clamp(
    Math.round(gaussRand(startX + slotWidth * (index + 0.5), slotWidth * 0.4)),
    60, W - 60
  );
}


// ─────────────────────────────────────────────────
//  Section 7: 筆觸粗細與墨效
// ─────────────────────────────────────────────────

/**
 * 粗細分佈 — 4 種 profile
 *
 * baseBrushSize (bbs) × multiplier = initialSize
 * 繪畫中粗細的混合比例影響節奏感：
 *   20% thin   → 細節線條，增加精緻感
 *   30% medium → 主力線條
 *   30% thick  → 視覺重量
 *   20% wash   → 大面積水彩色塊
 */
function getThickness() {
  const r = Math.random();
  if (r < 0.2) return { bbs: rand(0.8, 1.3), mult: rand(8, 14), label: 'thin' };
  if (r < 0.5) return { bbs: rand(1.5, 2.5), mult: rand(15, 25), label: 'medium' };
  if (r < 0.8) return { bbs: rand(2.5, 4.0), mult: rand(20, 35), label: 'thick' };
  return { bbs: rand(4.0, 6.0), mult: rand(25, 40), label: 'wash' };
}

/**
 * 墨效選擇
 *
 * useSharpen 控制 Inkfield 的渲染管線：
 *   0 = Diffusion → 墨水擴散，水彩感
 *   1 = Edge      → 邊緣銳利的墨線
 *   2 = Sharp     → 極度銳利
 *   3 = Watercolor → 水彩暈染
 *   4 = Textured  → 紋理質感
 *
 * Diffusion（30%）和 Watercolor（25%）為主，
 * 搭配少量 Edge/Sharp 增加對比。
 */
function getInkEffect() {
  const r = Math.random();
  if (r < 0.30) return { useSharpen: 0 };  // Diffusion
  if (r < 0.55) return { useSharpen: 3 };  // Watercolor
  if (r < 0.75) return { useSharpen: 4 };  // Textured
  if (r < 0.90) return { useSharpen: 1 };  // Edge
  return { useSharpen: 2 };                 // Sharp
}


// ─────────────────────────────────────────────────
//  Section 8: strokeData 組裝
// ─────────────────────────────────────────────────

/**
 * 組裝完整的 strokeData 物件
 *
 * 這是 Inkfield JSON 最複雜的部分 — 每筆的 mp 事件必須攜帶
 * 完整的 strokeData（約 35 個欄位 + forceMapParams 的 16 個子欄位）
 *
 * 設計決策：
 * - brushMode 混合：78% Standard(1), 15% Pen(4), 7% Fly(6)
 *   → Standard 為主力，Pen 增加線條變化，Fly 增加飛白效果
 * - spring 0.4-0.65：控制筆觸跟隨滑鼠的「彈性」，越低越滯後
 * - maxUpdates 30：固定值，控制墨水衰減動畫的幀數
 *
 * @param {number} mcs    - mouseCountStart（累計值）
 * @param {number} sx,sy  - 起始座標
 * @param {number} nmd    - md 事件數量
 * @param {object} color  - 從 PALETTE 選出的顏色
 */
function buildStrokeData(mcs, sx, sy, nmd, color) {
  const thick = getThickness();
  const ink = getInkEffect();
  const bbs = thick.bbs;
  const initSize = parseFloat((thick.mult * bbs).toFixed(2));

  // brushMode 混合
  let brushMode = 1;
  const bmRoll = Math.random();
  if (bmRoll < 0.15) brushMode = 4;       // 15% Pen
  else if (bmRoll < 0.22) brushMode = 6;  //  7% Fly

  return {
    // ── 種子與計數 ──
    strokeSeed: randInt(1e7, 9e8),
    mouseCountStart: mcs,

    // ── 外觀基礎 ──
    colorIndex: randInt(0, 5),
    shapeType: randInt(0, 2),
    useSharpen: ink.useSharpen,
    brushMode: brushMode,
    indiffusionStrength: rand(0.3, 0.65),
    whiteBrushMode: false,
    brushColorMode: color.bcm,

    // ── 動態效果 ──
    phasorVel: 1,
    explodeStart: 0,
    explodeEnd: 0,
    whiteMaxOpacity: parseFloat(rand(0.6, 0.92).toFixed(2)),

    // ── 色彩微調 ──
    // 微小的 shift 讓同色系的不同筆觸有細微差異，增加自然感
    hueShift: parseFloat(rand(-0.03, 0.03).toFixed(3)),
    satShift: parseFloat(rand(0, 0.05).toFixed(3)),
    briShift: parseFloat(rand(-0.02, 0.04).toFixed(3)),

    // ── 筆刷屬性 ──
    targetflyBrushType: randInt(0, 2),
    targetmainStrokeDir: 0,
    brushDir: randInt(0, 3),
    ctlNoise: 1,
    brushPaintCtlNoisebyFrame: 1,
    brushPaintInterpolationOffset: randInt(1, 2),
    brushPaintOldRInitial: parseFloat(rand(0, 0.5).toFixed(1)),
    keyBlendMode: Math.random() < 0.6 ? 0 : 2,  // 60% Mix, 40% Darken

    // ── 尺寸與步進 ──
    initialSize: initSize,
    spraySize: rand(2, 5),
    step: 15,
    step2: randInt(3, 7),
    randStep: 0.05,
    maxUpdates: 30,          // 固定值 — 衰減動畫幀數
    pathRotation: randInt(0, 3),

    // ── 物理參數 ──
    spring: parseFloat(rand(0.4, 0.65).toFixed(2)),  // 筆觸跟隨彈性
    friction: 0.5,
    baseBrushSize: bbs,
    expectedStrokeLength: nmd * 5,
    effect3Brightness: parseFloat(rand(0.45, 0.80).toFixed(2)),

    // ── 座標 ──
    mouseX: sx,
    mouseY: sy,
    drawingSeed: randInt(1e6, 9e6),
    brushModeSP: false,

    // ── 力場參數（16 個子欄位） ──
    // 控制筆觸的微觀扭曲和變形
    forceMapParams: {
      randomSeed1: parseFloat(rand(50, 500).toFixed(1)),
      randomSeed2: parseFloat(rand(50, 500).toFixed(2)),
      randomSeed3: parseFloat(rand(50, 500).toFixed(2)),
      randomSeed4: parseFloat(rand(50, 500).toFixed(2)),
      scale1: 0, scale2: 0.01, scale3: 0.01,
      amplitude1: parseFloat(rand(0.1, 0.4).toFixed(2)),
      amplitude2: parseFloat(rand(0.1, 0.4).toFixed(2)),
      amplitude3: parseFloat(rand(0.2, 0.6).toFixed(2)),
      phase1: parseFloat(rand(0, 6.28).toFixed(2)),
      phase2: parseFloat(rand(0, 6.28).toFixed(2)),
      phase3: parseFloat(rand(0, 6.28).toFixed(2)),
      vortexScale1: 0.01, vortexScale2: 0.01,
      clusterScale1: 0, clusterScale2: 0
    }
  };
}


// ─────────────────────────────────────────────────
//  Section 9: Flow Effect 生成
// ─────────────────────────────────────────────────

/**
 * 生成一對 Flow 事件（start + end）
 *
 * 關鍵設計：
 * - duration 在 1200-2500ms 之間（≥1000ms 才能看到效果）
 * - flowSeed 在 start/end 之間必須相同（用來配對）
 * - lastStrokeOnly：第一個 Flow 設 false（影響全部筆觸），
 *   後續設 true（只影響最新的筆觸群組），這樣才有層次
 * - strokeBounds：正規化座標(0-1)，定義 Flow 影響的範圍
 *
 * @param {number} time       - 開始時間
 * @param {number} blendType  - 混合類型 (0-8)
 * @param {object} bounds     - {minX, minY, maxX, maxY} 正規化
 * @param {boolean} isFirstFlow - 是否為第一個 Flow
 */
function buildFlowEvents(time, blendType, bounds, isFirstFlow) {
  const duration = randInt(1200, 2500);   // ← 保證 ≥ 1000ms
  const flowSeed = randInt(100000, 999999);

  const startEvt = {
    m: "flow",
    t: time,
    action: "start",
    blendType: blendType,
    flowSeed: flowSeed,
    strokeBounds: bounds,
    strength: 100,
    lastStrokeOnly: !isFirstFlow
  };

  const endEvt = {
    m: "flow",
    t: time + duration,
    action: "end",
    blendType: blendType,
    flowSeed: flowSeed
  };

  return { start: startEvt, end: endEvt, duration };
}


// ─────────────────────────────────────────────────
//  Section 10: Bounding Box 計算
// ─────────────────────────────────────────────────

/**
 * 計算已畫筆觸的邊界框（正規化到 0-1）
 *
 * Flow Effect 的 strokeBounds 需要知道目前所有筆觸覆蓋的範圍。
 * 加 20px padding 避免 Flow 效果在邊緣被截斷。
 */
function computeBounds(strokeEvents) {
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (const e of strokeEvents) {
    if (e.x !== undefined) {
      minX = Math.min(minX, e.x);
      maxX = Math.max(maxX, e.x);
      minY = Math.min(minY, e.y);
      maxY = Math.max(maxY, e.y);
    }
  }
  const pad = 20;
  return {
    minX: parseFloat(Math.max(0, (minX - pad) / W).toFixed(4)),
    minY: parseFloat(Math.max(0, (minY - pad) / H).toFixed(4)),
    maxX: parseFloat(Math.min(1, (maxX + pad) / W).toFixed(4)),
    maxY: parseFloat(Math.min(1, (maxY + pad) / H).toFixed(4))
  };
}


// ─────────────────────────────────────────────────
//  Section 11: 主生成流程
// ─────────────────────────────────────────────────

const events = [];
let time = 0, mcs = 0;
let totalStrokes = STROKE_GROUPS.reduce((a, b) => a + b, 0);
let strokeIndex = 0;
let allStrokeEvents = [];  // 追蹤所有筆觸事件（用於 bounds 計算）

console.log(`=== Interleaved Expressionist Generator v5 ===`);
console.log(`Canvas: ${W}x${H} | Strokes: ${totalStrokes} | Flow Effects: ${NUM_FLOW_EFFECTS}`);
console.log(`Groups: [${STROKE_GROUPS.join(', ')}]\n`);

for (let g = 0; g < STROKE_GROUPS.length; g++) {
  const groupSize = STROKE_GROUPS[g];
  const groupEvents = [];

  console.log(`--- Group ${g + 1} (${groupSize} strokes) ---`);

  // ── 生成本組的筆觸 ──
  for (let s = 0; s < groupSize; s++) {
    const nmd = randInt(55, 80);            // md 事件數量
    const cx = getStrokeX(strokeIndex, totalStrokes);  // Slot-based X 座標
    const color = pickColor();

    // 垂直跨度 — 以 CY 為中心
    const strokeLen = rand(H * 0.3, H * 0.65);
    const topY = Math.round(clamp(gaussRand(CY - strokeLen / 2, H * 0.08), 30, H * 0.4));
    const botY = Math.round(clamp(topY + strokeLen, H * 0.5, H - 30));

    // 60% 由上往下畫，40% 由下往上
    const goDown = Math.random() < 0.6;
    const sy = goDown ? topY : botY;
    const ey = goDown ? botY : topY;
    const tilt = rand(-12, 12);  // 微傾斜 ±12°

    const curve = generateVerticalStroke(cx, sy, ey, nmd, tilt);
    const actualMd = curve.length - 1;
    const sx = curve[0].x, syA = curve[0].y;

    // ── 時間控制 ──
    // 第一筆：50-200ms（快速開始）
    // 後續筆：650-950ms（等待上一筆墨水衰減 + 模擬「抬筆思考」）
    time += (strokeIndex === 0) ? randInt(50, 200) : randInt(650, 950);

    const sd = buildStrokeData(mcs, sx, syA, actualMd, color);

    // mp 事件（mousePressed — 攜帶完整 strokeData）
    const mpEvt = { m: "mp", t: time, x: sx, y: syA, strokeData: sd };
    events.push(mpEvt);
    groupEvents.push(mpEvt);

    // md 事件（mouseDragged — 只有座標和時間）
    // 間隔 14-20ms ≈ 50-70fps，模擬人類拖拽速度
    for (let i = 1; i < curve.length; i++) {
      time += randInt(14, 20);
      const mdEvt = { m: "md", t: time, x: curve[i].x, y: curve[i].y };
      events.push(mdEvt);
      groupEvents.push(mdEvt);
    }

    // mr 事件（mouseReleased — 筆觸結束）
    time += randInt(10, 30);
    const lp = curve[curve.length - 1];
    const mrEvt = { m: "mr", t: time, x: lp.x, y: lp.y };
    events.push(mrEvt);
    groupEvents.push(mrEvt);

    // 更新累計計數
    mcs += 1 + actualMd;
    strokeIndex++;

    console.log(`  Stroke ${String(strokeIndex).padStart(2)}/${totalStrokes}: ` +
      `color=${color.name} mode=${sd.brushMode} sharpen=${sd.useSharpen} ` +
      `md=${actualMd} size=${sd.baseBrushSize.toFixed(1)}`);
  }

  allStrokeEvents = allStrokeEvents.concat(groupEvents);

  // ── 組間插入 Flow Effect（最後一組除外）──
  if (g < STROKE_GROUPS.length - 1) {
    // Flow 開始前的間隔：讓最後一筆的墨水有時間穩定
    time += randInt(800, 1500);

    const flowType = FLOW_TYPES[g % FLOW_TYPES.length];
    const isFirst = (g === 0);
    const bounds = computeBounds(allStrokeEvents);
    const flow = buildFlowEvents(time, flowType, bounds, isFirst);

    events.push(flow.start);
    events.push(flow.end);

    time = flow.end.t;

    // Flow 結束後的間隔：讓 Flow 效果消退再繼續畫
    time += randInt(500, 1000);

    console.log(`  >> FLOW ${g + 1}: type=${flowType} duration=${flow.duration}ms lastStrokeOnly=${!isFirst}`);
  }
}

// ─────────────────────────────────────────────────
//  Section 12: 組裝最終 JSON
// ─────────────────────────────────────────────────

const recording = {
  version: "1.0",
  startTime: 0,
  randomSeed: randInt(1e8, 9e8),
  initialPathToggle: false,
  initialWhiteBrushMode: false,
  initialBrushColorMode: 0,
  canvasSize: { width: W, height: H },
  canvasBackgroundColor: [222, 212, 195],  // 米色紙張
  events
};

// ── 輸出 ──
const outputPath = __dirname + '/expressionist-v5.json';
fs.writeFileSync(outputPath, JSON.stringify(recording));

console.log(`\n=== Output ===`);
console.log(`Events: ${events.length}`);
console.log(`Time span: ${time}ms (${(time / 1000).toFixed(1)}s)`);
console.log(`File: ${outputPath}`);
console.log(`Size: ${(JSON.stringify(recording).length / 1024).toFixed(1)}KB`);


// ─────────────────────────────────────────────────
//  Section 13: 瀏覽器執行指南
// ─────────────────────────────────────────────────

/**
 * 如果要在 Inkfield Playground 的瀏覽器中直接執行：
 *
 * 1. 移除第 1 行的 `const fs = require('fs');`
 * 2. 移除最後的 `fs.writeFileSync(...)`
 * 3. 在最後加上：
 *
 *    const json = JSON.stringify(recording);
 *    const result = window.loadRecordingFromText(json);
 *    console.log(result);  // { ok: true, strokes: 20, canvasSize: {...} }
 *
 * 4. 把整段 code 包在 IIFE 中：(function(){ ... })()
 * 5. 在瀏覽器 Console 或透過 Chrome extension 的 javascript_exec 執行
 *
 * 為什麼不直接貼 JSON？
 * → 生成的 JSON 通常 50-80KB，超過文字框限制
 * → 在瀏覽器內直接執行生成邏輯，就地產生 JSON 字串，是最可靠的方案
 */

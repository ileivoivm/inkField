function __bundledLoadShader(vertPath, fragPath) {
  var vert = window.SHADER_SOURCES && window.SHADER_SOURCES[vertPath];
  var frag = window.SHADER_SOURCES && window.SHADER_SOURCES[fragPath];
  if (vert && frag && typeof createShader === 'function') {
    return createShader(vert, frag);
  }
  return window['loadShader'](vertPath, fragPath);
}

// === js/crandom.js ===
class Crandom {
  constructor() {
    this.globalCount = 0;
    this.callHistory = [];
    this.enableHistory = false;
    this.currentSeed = null;
  }
  reset() {
    this.globalCount = 0;
    this.callHistory = [];
  }
  getCount() {
    return this.globalCount;
  }
  setSeed(seed) {
    this.currentSeed = seed;
  }
  getHistory() {
    return this.callHistory;
  }
  setHistoryEnabled(enabled) {
    this.enableHistory = enabled;
  }
  random(...args) {
    this.globalCount++;
    if (this.enableHistory) {
      const stack = new Error().stack;
      const callerLine = stack.split('\n')[2];
      this.callHistory.push({
        count: this.globalCount,
        args: args,
        caller: callerLine,
        seed: this.currentSeed,
        timestamp: Date.now()
      });
    }
    if (args.length === 0) {
      return random();
    } else if (args.length === 1) {
      if (Array.isArray(args[0])) {
        return random(args[0]);
      } else {
        return random(args[0]);
      }
    } else if (args.length === 2) {
      return random(args[0], args[1]);
    }
  }
  printStats() {
    console.log('═══════════════════════════════════════');
    console.log('📊 Crandom 統計信息');
    console.log('═══════════════════════════════════════');
    console.log(`總調用次數: ${this.globalCount}`);
    console.log(`當前種子: ${this.currentSeed || 'N/A'}`);
    console.log(`歷史記錄: ${this.enableHistory ? '啟用' : '禁用'}`);
    if (this.enableHistory) {
      console.log(`記錄條數: ${this.callHistory.length}`);
    }
    console.log('═══════════════════════════════════════');
  }
  printRecentHistory(n = 10) {
    if (!this.enableHistory) {
      console.warn('⚠️ 歷史記錄未啟用');
      return;
    }
    const recent = this.callHistory.slice(-n);
    console.log('═══════════════════════════════════════');
    console.log(`📝 最近 ${recent.length} 條 random() 調用`);
    console.log('═══════════════════════════════════════');
    recent.forEach((record, index) => {
      console.log(`[${record.count}] args: [${record.args.join(', ')}]`);
      if (record.caller) {
        console.log(`    位置: ${record.caller.trim()}`);
      }
    });
    console.log('═══════════════════════════════════════');
  }
  static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
    const diff = count2 - count1;
    console.log('═══════════════════════════════════════');
    console.log('🔍 Crandom 計數比較');
    console.log('═══════════════════════════════════════');
    console.log(`${label1}: ${count1}`);
    console.log(`${label2}: ${count2}`);
    console.log(`差異: ${diff > 0 ? '+' : ''}${diff}`);
    console.log('═══════════════════════════════════════');
    return diff;
  }
}
class CrandomDebugger {
  constructor() {
    this.checkpoints = [];
    this.currentStrokeCheckpoints = [];
    this.recordingCheckpoints = [];
    this.playbackCheckpoints = [];
    this.enabled = true;
  }
  checkpoint(name, category = 'general') {
    if (!this.enabled) return;
    const count = crandom.getCount();
    const checkpoint = {
      name: name,
      category: category,
      count: count,
      timestamp: Date.now()
    };
    this.currentStrokeCheckpoints.push(checkpoint);
  }
  resetStroke() {
    this.currentStrokeCheckpoints = [];
  }
  saveStroke(mode, strokeNumber) {
    const strokeData = {
      mode: mode,
      strokeNumber: strokeNumber,
      checkpoints: [...this.currentStrokeCheckpoints],
      totalCount: crandom.getCount()
    };
    if (mode === 'recording') {
      this.recordingCheckpoints.push(strokeData);
    } else if (mode === 'playback') {
      this.playbackCheckpoints.push(strokeData);
    }
  }
  compareStroke(strokeNumber) {
    const recording = this.recordingCheckpoints.find(s => s.strokeNumber === strokeNumber);
    const playback = this.playbackCheckpoints.find(s => s.strokeNumber === strokeNumber);
    if (!recording) return;
    if (!playback) {
      console.error(`❌ 找不到播放筆劃 ${strokeNumber}`);
      return;
    }
    const diffCount = playback.totalCount - recording.totalCount;
    const percent = ((diffCount / recording.totalCount) * 100).toFixed(2) + '%';
    const icon = Math.abs(diffCount) < 50 ? '✅' : Math.abs(diffCount) < 200 ? '⚠️' : '❌';
    console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${diffCount > 0 ? '+' : ''}${diffCount} (${percent})`);
    const recDeltas = this.calculateDeltas(recording.checkpoints);
    const playDeltas = this.calculateDeltas(playback.checkpoints);
    const allStages = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
    const sortedStages = Array.from(allStages).sort((a, b) => {
      const indexA = Array.from(recDeltas.keys()).indexOf(a);
      const indexB = Array.from(recDeltas.keys()).indexOf(b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    let totalDiff = 0;
    const differences = [];
    for (const stage of sortedStages) {
      const recCount = recDeltas.get(stage) || 0;
      const playCount = playDeltas.get(stage) || 0;
      const diff = playCount - recCount;
      totalDiff += diff;
      if (Math.abs(diff) > 0) {
        differences.push({
          stage: stage,
          recordingCount: recCount,
          playbackCount: playCount,
          difference: diff
        });
      }
    }
    if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
      differences.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
      const significantDiffs = differences.filter(d => Math.abs(d.difference) > 50);
      if (significantDiffs.length > 0) {
        console.log('   ⚠️ 主要差異階段:');
        for (let i = 0; i < Math.min(2, significantDiffs.length); i++) {
          const d = significantDiffs[i];
          const icon = d.difference > 0 ? '🔺' : '🔻';
          console.log(`      ${icon} ${d.stage}: ${d.difference}`);
        }
      }
    }
  }
  calculateDeltas(checkpoints) {
    const deltas = new Map();
    for (let i = 0; i < checkpoints.length; i++) {
      const current = checkpoints[i];
      const next = checkpoints[i + 1];
      if (next) {
        const stageName = `${current.name} → ${next.name}`;
        const delta = next.count - current.count;
        deltas.set(stageName, delta);
      }
    }
    return deltas;
  }
  clear() {
    this.recordingCheckpoints = [];
    this.playbackCheckpoints = [];
    this.currentStrokeCheckpoints = [];
  }
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
window.crandom = new Crandom();
window.Crandom = Crandom;
window.crandomDebugger = new CrandomDebugger();

// === js/colors.js ===
const BRUSH_COLORS = [{
  id: 0,
  name: 'black',
  displayName: '黑色',
  rgb: [26, 26, 26],
  hex: '#1A1A1A'
}, {
  id: 1,
  name: 'white',
  displayName: '白色',
  rgb: [242, 242, 242],
  hex: '#F2F2F2'
}, {
  id: 29,
  name: 'medium_gray',
  displayName: '中灰色',
  rgb: [155, 155, 155],
  hex: '#9B9B9B'
}, {
  id: 2,
  name: 'dark_gray',
  displayName: '深灰色',
  rgb: [47, 47, 47],
  hex: '#2F2F2F'
}, {
  id: 3,
  name: 'medium_gray_new',
  displayName: '中灰色',
  rgb: [85, 85, 85],
  hex: '#555555'
}, {
  id: 4,
  name: 'light_gray_new',
  displayName: '浅灰色',
  rgb: [150, 150, 150],
  hex: '#969696'
}, {
  id: 12,
  name: 'light_gray',
  displayName: '浅灰色',
  rgb: [136, 122, 125],
  hex: '#847A7D'
}, {
  id: 22,
  name: 'silver',
  displayName: '银灰色',
  rgb: [181, 180, 185],
  hex: '#B5B4B9'
}, {
  id: 13,
  name: 'blue_gray',
  displayName: '蓝灰色',
  rgb: [138, 57, 26],
  hex: '#8A391A'
}, {
  id: 19,
  name: 'gray_brown',
  displayName: '灰褐色',
  rgb: [128, 125, 114],
  hex: '#807D72'
}, {
  id: 26,
  name: 'khaki',
  displayName: '卡其色',
  rgb: [165, 162, 147],
  hex: '#A5A293'
}, {
  id: 20,
  name: 'sage_gray',
  displayName: '鼠尾草灰',
  rgb: [121, 132, 129],
  hex: '#798481'
}, {
  id: 24,
  name: 'gray_green',
  displayName: '青灰色',
  rgb: [148, 162, 158],
  hex: '#94A29E'
}, {
  id: 28,
  name: 'mauve_gray',
  displayName: '淡紫灰',
  rgb: [174, 161, 164],
  hex: '#AEA1A4'
}, {
  id: 23,
  name: 'beige',
  displayName: '米色',
  rgb: [235, 220, 201],
  hex: '#EBDCC9'
}, {
  id: 25,
  name: 'tan',
  displayName: '驼色',
  rgb: [210, 169, 151],
  hex: '#D2A997'
}, {
  id: 14,
  name: 'terra_cotta',
  displayName: '赭石色',
  rgb: [112, 79, 57],
  hex: '#704F39'
}, {
  id: 21,
  name: 'brick_red',
  displayName: '砖红色',
  rgb: [159, 114, 85],
  hex: '#9F7255'
}, {
  id: 7,
  name: 'brown',
  displayName: '咖啡色',
  rgb: [175, 140, 89],
  hex: '#AF8C59'
}, {
  id: 8,
  name: 'green_dark',
  displayName: '墨綠色',
  rgb: [4, 130, 130],
  hex: '#048282'
}, {
  id: 5,
  name: 'green',
  displayName: '绿色',
  rgb: [63, 77, 24],
  hex: '#3F4D18'
}, {
  id: 15,
  name: 'olive_green',
  displayName: '橄榄绿',
  rgb: [168, 200, 72],
  hex: '#A8C848'
}, {
  id: 11,
  name: 'lime',
  displayName: '浅绿色',
  rgb: [138, 149, 73],
  hex: '#8A9549'
}, {
  id: 9,
  name: 'blue_dark',
  displayName: '深蓝色',
  rgb: [57, 80, 192],
  hex: '#3950C0'
}, {
  id: 32,
  name: 'blue',
  displayName: '蓝色',
  rgb: [2, 66, 109],
  hex: '#02426D'
}, {
  id: 10,
  name: 'purple',
  displayName: '紫色',
  rgb: [140, 106, 172],
  hex: '#8C6AAC'
}, {
  id: 17,
  name: 'wine_red',
  displayName: '酒红色',
  rgb: [128, 49, 52],
  hex: '#803134'
}, {
  id: 27,
  name: 'dusty_rose',
  displayName: '雾玫瑰色',
  rgb: [203, 243, 251],
  hex: '#CBF3FB'
}, {
  id: 16,
  name: 'pink',
  displayName: '粉红色',
  rgb: [240, 170, 207],
  hex: '#F0AACF'
}, {
  id: 30,
  name: 'red',
  displayName: '红色',
  rgb: [208, 34, 63],
  hex: '#D02340'
}, {
  id: 18,
  name: 'gold_orange',
  displayName: '金橙色',
  rgb: [233, 175, 52],
  hex: '#E9AF34'
}, {
  id: 6,
  name: 'orange',
  displayName: '橙色',
  rgb: [255, 160, 62],
  hex: '#FEA03E'
}, {
  id: 31,
  name: 'yellow',
  displayName: '黄色',
  rgb: [255, 249, 56],
  hex: '#FFF938'
}, {
  id: 34,
  name: 'coral',
  displayName: '珊瑚色',
  rgb: [255, 127, 80],
  hex: '#FF7F50'
}, {
  id: 35,
  name: 'mint',
  displayName: '薄荷绿',
  rgb: [152, 251, 152],
  hex: '#98FB98'
}];

function getColorMap() {
  const colorMap = {};
  BRUSH_COLORS.forEach(color => {
    colorMap[color.id] = {
      name: color.name,
      rgb: color.rgb,
      channel: inferChannel(color.rgb)
    };
  });
  return colorMap;
}

function inferChannel(rgb) {
  const [r, g, b] = rgb;
  const hasR = r > 20;
  const hasG = g > 20;
  const hasB = b > 20;
  if (hasR && hasG && hasB) return 'rgb';
  if (hasR && hasG) return 'rg';
  if (hasR && hasB) return 'rb';
  if (hasG && hasB) return 'gb';
  if (hasR) return 'r';
  if (hasG) return 'g';
  if (hasB) return 'b';
  return 'rgb';
}

function generateShaderConstants() {
  let code = '// ============================================\n';
  code += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
  code += '// ============================================\n';
  BRUSH_COLORS.forEach(color => {
    const [r, g, b] = color.rgb;
    const constName = `COLOR_${color.name.toUpperCase()}`;
    code += `const vec3 ${constName} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
    code += `  // ${color.displayName} ${color.hex}\n`;
  });
  return code;
}

function generateBrushColorAssignment() {
  let code = '';
  BRUSH_COLORS.forEach((color, index) => {
    const constName = `COLOR_${color.name.toUpperCase()}`;
    if (index === 0) {
      code += `    if (brushMode == ${color.id}) {\n`;
    } else {
      code += `    } else if (brushMode == ${color.id}) {\n`;
    }
    code += `        brushColor = ${constName};\n`;
  });
  code += `    }\n`;
  return code;
}

function getUIColors() {
  return BRUSH_COLORS.map(color => ({
    id: color.id,
    name: color.name,
    displayName: color.displayName,
    hex: color.hex
  }));
}

function getColorById(id) {
  return BRUSH_COLORS.find(c => c.id === id);
}

function getColorByName(name) {
  return BRUSH_COLORS.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRUSH_COLORS,
    getColorMap,
    generateShaderConstants,
    generateBrushColorAssignment,
    getUIColors,
    getColorById,
    getColorByName
  };
}

// === js/paper.js ===
let paperBrushTile = null;
let paperBrushTileSize = 0;
const PAPER_TEXTURE_MAX_SIZE = 2000;

function createPaperTexture(brushSize = 120, brushSpan = 12, brushOffset = 10, grayPow = 5) {
  const texWidth = Math.min(width, PAPER_TEXTURE_MAX_SIZE);
  const texHeight = Math.min(height, PAPER_TEXTURE_MAX_SIZE);
  const needsScale = (width > PAPER_TEXTURE_MAX_SIZE || height > PAPER_TEXTURE_MAX_SIZE);
  randomSeed(seed);
  const brush = createPaperBrushTile(brushSize, grayPow);
  const tex = createGraphics(texWidth, texHeight, P2D);
  const texLine = createGraphics(texWidth, texHeight, P2D);
  for (let i = -brushSize; i < texWidth + brushSize; i += texWidth / 500) {
    for (let j = -brushSize; j < texHeight + brushSize; j += brushSpan) {
      tex.image(brush, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * brushOffset);
    }
  }
  brush.remove();
  if (doSpotNoise) {
    padfactor = 300;
    texLine.blendMode(DIFFERENCE);
    for (let i = 0; i < 400; i++) {
      x = random(texWidth)
      y = random(texHeight)
      texLine.push()
      texLine.strokeWeight(random(1, 2))
      texLine.stroke(0, random(10, 250))
      texLine.noFill();
      texLine.bezier(
        random(-padfactor, texWidth + padfactor),
        random(-padfactor, texHeight + padfactor),
        random(-padfactor, texWidth + padfactor),
        random(-padfactor, texHeight + padfactor),
        random(-padfactor, texWidth + padfactor),
        random(-padfactor, texHeight + padfactor),
        random(-padfactor, texWidth + padfactor),
        random(-padfactor, texHeight + padfactor)
      );
      texLine.pop();
    }
    tex.blendMode(DIFFERENCE);
    tex.image(texLine, 0, 0, texWidth, texHeight);
    texLine.remove();
  }
  if (needsScale) {
    const finalTex = createGraphics(width, height);
    finalTex.image(tex, 0, 0, width, height);
    tex.remove();
    return finalTex;
  }
  return tex;
}

function createPaperBrushTile(tileSize = 64, grayPow = 0.5) {
  const brush = createGraphics(tileSize, tileSize);
  brush.pixelDensity(1);
  brush.noSmooth();
  brush.clear();
  brush.noFill();
  brush.translate(tileSize / 2, tileSize / 2);
  brush.strokeWeight(1.5);
  for (let i = 0; i < 100; i++) {
    const intensity = 0.5 + crandom.random(0, 1) * 0.5;
    const gray = pow(intensity, grayPow) * 255;
    brush.stroke(gray, gray, gray, 255);
    const radius = crandom.random() * tileSize * 0.5;
    const angle = crandom.random() * TWO_PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    brush.point(x, y);
  }
  brush.resetMatrix();
  return brush;
}

// === js/metallic.js ===
let markedDarkPoints = [];

function generateOrganicShape(x, y, size, seed, shapeType = null) {
  randomSeed(seed);
  noiseSeed(seed);
  if (shapeType === null || shapeType === undefined) {
    shapeType = floor(crandom.random(0, 2));
    shapeType = floor(crandom.random(2, 4));
  } else {
    shapeType = floor(constrain(shapeType, 0, 3));
  }
  switch (shapeType) {
    case 0:
      return generateOrganicBlob(size * 1.3, seed);
    case 1:
      return generateIrregularStrip(size, seed);
    case 2:
      return generateLightningShape(size, seed);
    case 3:
      return generatenNewLightningShape(size, seed);
    default:
      return generateCircleCluster(size, seed);
  }
}

function generateCircleCluster(size, seed) {
  randomSeed(seed);
  noiseSeed(seed);
  const circles = [];
  const maxCircles = 8;
  const precomputedRandoms = [];
  for (let i = 0; i < maxCircles; i++) {
    precomputedRandoms.push({
      numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
      angle: crandom.random(TWO_PI),
      distance: crandom.random(0, size * 0.4),
      circleSize: crandom.random(size * 0.4, size * 0.8)
    });
  }
  const numCircles = floor(precomputedRandoms[0].numCirclesRand);
  for (let i = 0; i < numCircles; i++) {
    const rand = precomputedRandoms[i];
    circles.push({
      x: cos(rand.angle) * rand.distance,
      y: sin(rand.angle) * rand.distance,
      radius: rand.circleSize
    });
  }
  return {
    type: 'cluster',
    circles
  };
}

function generateOrganicBlob(size, seed) {
  randomSeed(seed);
  noiseSeed(seed);
  const allVertices = [];
  const maxLayers = 3;
  const maxVertices = 48;
  const precomputedRandoms = [];
  const numLayersRand = crandom.random(1, 4);
  const irregularity = crandom.random(0.4, 0.6);
  const numLayers = floor(numLayersRand);
  for (let layer = 0; layer < maxLayers; layer++) {
    const layerRandoms = {
      offsetX: crandom.random(-size * 0.2, size * 0.2),
      offsetY: crandom.random(-size * 0.2, size * 0.2),
      layerRotation: crandom.random(-PI / 4, PI / 4),
      sizeVariation: crandom.random(0.85, 1.15),
      numVerticesRand: crandom.random(36, 48),
      noiseOffset: crandom.random(1000) + layer * 500
    };
    precomputedRandoms.push(layerRandoms);
  }
  for (let layer = 0; layer < numLayers; layer++) {
    const layerRandoms = precomputedRandoms[layer];
    const offsetX = layerRandoms.offsetX;
    const offsetY = layerRandoms.offsetY;
    const layerRotation = layerRandoms.layerRotation;
    const sizeVariation = layerRandoms.sizeVariation;
    const layerSize = size * sizeVariation;
    const numVertices = floor(layerRandoms.numVerticesRand);
    const noiseOffset = layerRandoms.noiseOffset;
    const rawVertices = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = (i / numVertices) * TWO_PI;
      const noise1 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
      const noise2 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
      const noise3 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
      const combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      const radius = layerSize * (0.4 + combinedNoise * irregularity);
      const localX = cos(angle) * radius;
      const localY = sin(angle) * radius;
      rawVertices.push({
        x: localX,
        y: localY
      });
    }
    const smoothedVertices = [];
    for (let i = 0; i < rawVertices.length; i++) {
      const prev = rawVertices[(i - 1 + rawVertices.length) % rawVertices.length];
      const curr = rawVertices[i];
      const next = rawVertices[(i + 1) % rawVertices.length];
      smoothedVertices.push({
        x: (prev.x + curr.x * 2 + next.x) / 4,
        y: (prev.y + curr.y * 2 + next.y) / 4
      });
    }
    for (let v of smoothedVertices) {
      const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
      const rotatedY = v.x * sin(layerRotation) + v.y * cos(layerRotation);
      allVertices.push({
        x: rotatedX + offsetX,
        y: rotatedY + offsetY
      });
    }
  }
  return {
    type: 'blob',
    vertices: allVertices
  };
}

function generateIrregularStrip(size, seed) {
  randomSeed(seed);
  noiseSeed(seed);
  const allVertices = [];
  const maxLayers = 3;
  const precomputedRandoms = [];
  const numLayersRand = crandom.random(1, 4);
  const irregularity = crandom.random(0.15, 0.35);
  const numLayers = floor(numLayersRand);
  let rotation = crandom.random(TWO_PI);
  for (let layer = 0; layer < maxLayers; layer++) {
    const layerRandoms = {
      offsetX: crandom.random(-size * 0.2, size * 0.2),
      offsetY: crandom.random(-size * 0.2, size * 0.2),
      layerRotationOffset: crandom.random(-0.5, 0.5),
      sizeVariation: crandom.random(0.85, 1.15),
      lengthRatio: crandom.random(1.0, 4.0),
      stripWidth: crandom.random(0.5, 0.8),
      numVerticesRand: crandom.random(32, 48),
      noiseOffset: crandom.random(1000) + layer * 500
    };
    precomputedRandoms.push(layerRandoms);
  }
  for (let layer = 0; layer < numLayers; layer++) {
    const layerRandoms = precomputedRandoms[layer];
    const offsetX = layerRandoms.offsetX;
    const offsetY = layerRandoms.offsetY;
    const layerRotation = rotation + layerRandoms.layerRotationOffset;
    const sizeVariation = layerRandoms.sizeVariation;
    const layerSize = size * sizeVariation;
    const lengthRatio = layerRandoms.lengthRatio;
    const stripLength = layerSize * lengthRatio;
    const stripWidth = layerSize * layerRandoms.stripWidth;
    const numVertices = floor(layerRandoms.numVerticesRand);
    const noiseOffset = layerRandoms.noiseOffset;
    const rawVertices = [];
    for (let i = 0; i < numVertices; i++) {
      let localX, localY;
      if (i < numVertices / 2) {
        const edgeT = (i / (numVertices / 2));
        localX = (edgeT - 0.5) * stripLength;
        const noiseValue = noise(edgeT * 1.5 + noiseOffset, layer * 50);
        localY = -stripWidth / 2 + (noiseValue - 0.5) * stripWidth * irregularity;
      } else {
        const edgeT = ((numVertices - 1 - i) / (numVertices / 2));
        localX = (edgeT - 0.5) * stripLength;
        const noiseValue = noise(edgeT * 1.5 + noiseOffset, 100 + layer * 50);
        localY = stripWidth / 2 + (noiseValue - 0.5) * stripWidth * irregularity;
      }
      rawVertices.push({
        x: localX,
        y: localY
      });
    }
    const smoothedVertices = [];
    for (let i = 0; i < rawVertices.length; i++) {
      const prev = rawVertices[(i - 1 + rawVertices.length) % rawVertices.length];
      const curr = rawVertices[i];
      const next = rawVertices[(i + 1) % rawVertices.length];
      smoothedVertices.push({
        x: (prev.x + curr.x * 2 + next.x) / 4,
        y: (prev.y + curr.y * 2 + next.y) / 4
      });
    }
    for (let v of smoothedVertices) {
      const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
      const rotatedY = v.x * sin(layerRotation) + v.y * cos(layerRotation);
      allVertices.push({
        x: rotatedX + offsetX,
        y: rotatedY + offsetY
      });
    }
  }
  return {
    type: 'strip',
    vertices: allVertices
  };
}

function generateLightningShape(size, seed) {
  randomSeed(seed);
  noiseSeed(seed);
  let allVertices = [];
  const maxBranches = 2;
  const maxSteps = 30;
  const maxSubBranchLength = 8;
  const maxPathPoints = 300;
  const precomputedRandoms = [];
  const numBranchesRand = crandom.random(1, 3);
  const numBranches = floor(numBranchesRand);
  for (let branch = 0; branch < maxBranches; branch++) {
    const branchRandoms = {
      branchAngle: crandom.random(TWO_PI),
      branchOffsetX: crandom.random(-size * 0.2, size * 0.2),
      branchOffsetY: crandom.random(-size * 0.2, size * 0.2),
      numLRand: crandom.random(0, 1),
      numStepsRand: crandom.random(5, 15),
      stepSize: size * crandom.random(0.2, 0.35),
      noiseScale: crandom.random(0.1, 0.2),
      noiseStrength: crandom.random(0.2, 0.4),
      thickness: size * crandom.random(0.5, 0.7),
      stepRandoms: [],
      thicknessRandoms: []
    };
    for (let step = 0; step < maxSteps; step++) {
      const stepRandoms = {
        stepVariation: crandom.random(0.7, 1.3),
        subBranchRand: crandom.random(),
        subBranchLengthRand: crandom.random(3, 8),
        subBranchAngle: crandom.random(-PI / 3, PI / 3)
      };
      branchRandoms.stepRandoms.push(stepRandoms);
    }
    for (let i = 0; i < maxPathPoints; i++) {
      branchRandoms.thicknessRandoms.push(crandom.random(0.9, 1.1));
    }
    precomputedRandoms.push(branchRandoms);
  }
  for (let branch = 0; branch < numBranches; branch++) {
    const branchRandoms = precomputedRandoms[branch];
    let branchAngle = branchRandoms.branchAngle;
    let branchOffsetX = branchRandoms.branchOffsetX;
    let branchOffsetY = branchRandoms.branchOffsetY;
    let numL = branchRandoms.numLRand > 0.2 ? 1 : 2;
    let numSteps = floor(branchRandoms.numStepsRand) * numL;
    let stepSize = branchRandoms.stepSize;
    let noiseScale = branchRandoms.noiseScale;
    let noiseStrength = branchRandoms.noiseStrength;
    let thickness = branchRandoms.thickness;
    let pathPoints = [];
    let currentX = branchOffsetX;
    let currentY = branchOffsetY;
    let currentAngle = branchAngle;
    pathPoints.push({
      x: currentX,
      y: currentY
    });
    for (let step = 0; step < numSteps; step++) {
      const stepRandoms = branchRandoms.stepRandoms[step];
      const t = step / numSteps;
      const noiseX = noise(step * noiseScale, seed * 0.01);
      const noiseY = noise(step * noiseScale + 100, seed * 0.01);
      const angleOffset = (noiseX - 0.5) * PI * noiseStrength;
      currentAngle += angleOffset;
      const stepVariation = stepRandoms.stepVariation;
      const actualStepSize = stepSize * stepVariation;
      currentX += cos(currentAngle) * actualStepSize;
      currentY += sin(currentAngle) * actualStepSize;
      pathPoints.push({
        x: currentX,
        y: currentY
      });
      if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < numSteps - 3) {
        const subBranchLength = floor(stepRandoms.subBranchLengthRand);
        const subBranchAngle = currentAngle + stepRandoms.subBranchAngle;
        let subX = currentX;
        let subY = currentY;
        for (let subStep = 0; subStep < subBranchLength; subStep++) {
          const subNoise = noise(step * noiseScale + subStep * 0.5, seed * 0.01 + 200);
          const subAngleOffset = (subNoise - 0.5) * PI * 0.5;
          const subAngle = subBranchAngle + subAngleOffset;
          subX += cos(subAngle) * stepSize * 0.6;
          subY += sin(subAngle) * stepSize * 0.6;
          pathPoints.push({
            x: subX,
            y: subY
          });
        }
      }
    }
    const leftEdge = [];
    const rightEdge = [];
    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      let perpAngle;
      if (i === 0) {
        const next = pathPoints[i + 1];
        perpAngle = atan2(next.y - point.y, next.x - point.x) + HALF_PI;
      } else if (i === pathPoints.length - 1) {
        const prev = pathPoints[i - 1];
        perpAngle = atan2(point.y - prev.y, point.x - prev.x) + HALF_PI;
      } else {
        const prev = pathPoints[i - 1];
        const next = pathPoints[i + 1];
        const angle1 = atan2(point.y - prev.y, point.x - prev.x);
        const angle2 = atan2(next.y - point.y, next.x - point.x);
        perpAngle = ((angle1 + angle2) / 2) + HALF_PI;
      }
      const thicknessVariation = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
      const thicknessRand = branchRandoms.thicknessRandoms[Math.min(i, branchRandoms.thicknessRandoms.length - 1)];
      const actualThickness = thickness * thicknessVariation * thicknessRand;
      leftEdge.push({
        x: point.x + cos(perpAngle) * actualThickness / 2,
        y: point.y + sin(perpAngle) * actualThickness / 2
      });
      rightEdge.push({
        x: point.x - cos(perpAngle) * actualThickness / 2,
        y: point.y - sin(perpAngle) * actualThickness / 2
      });
    }
    for (let v of leftEdge) {
      allVertices.push(v);
    }
    for (let i = rightEdge.length - 1; i >= 0; i--) {
      allVertices.push(rightEdge[i]);
    }
  }
  return {
    type: 'lightning',
    vertices: allVertices
  };
}

function generatenNewLightningShape(size, seed) {
  randomSeed(seed);
  noiseSeed(seed);
  let allVertices = [];
  const maxBranches = 3;
  const maxSteps = 75;
  const maxSubBranchLength = 8;
  const maxPathPoints = 800;
  const precomputedRandoms = [];
  const numBranchesRand = crandom.random(1, 4);
  const numBranches = floor(numBranchesRand);
  size = size * 3;
  for (let branch = 0; branch < maxBranches; branch++) {
    const branchRandoms = {
      branchAngle: crandom.random(TWO_PI),
      branchOffsetX: crandom.random(-size * 0.2, size * 0.2),
      branchOffsetY: crandom.random(-size * 0.2, size * 0.2),
      numLRand: crandom.random(0, 1),
      numStepsRand: crandom.random(5, 15),
      stepSize: size * crandom.random(0.2, 0.35),
      noiseScale: crandom.random(0.1, 0.2) * 0.5,
      noiseStrength: crandom.random(0.2, 0.4) * 0.5,
      thickness: size * crandom.random(0.5, 0.7) * 0.3,
      stepRandoms: [],
      thicknessRandoms: []
    };
    for (let step = 0; step < maxSteps; step++) {
      const stepRandoms = {
        stepVariation: crandom.random(0.7, 1.3),
        subBranchRand: crandom.random(),
        subBranchLengthRand: crandom.random(3, 8),
        subBranchAngle: crandom.random(-PI / 3, PI / 3)
      };
      branchRandoms.stepRandoms.push(stepRandoms);
    }
    for (let i = 0; i < maxPathPoints; i++) {
      branchRandoms.thicknessRandoms.push(crandom.random(0.9, 1.1));
    }
    precomputedRandoms.push(branchRandoms);
  }
  for (let branch = 0; branch < numBranches; branch++) {
    const branchRandoms = precomputedRandoms[branch];
    let branchAngle = branchRandoms.branchAngle;
    let branchOffsetX = branchRandoms.branchOffsetX;
    let branchOffsetY = branchRandoms.branchOffsetY;
    let numL = branchRandoms.numLRand > 0.2 ? 1 : 5;
    let numSteps = floor(branchRandoms.numStepsRand) * numL;
    let stepSize = branchRandoms.stepSize;
    let noiseScale = branchRandoms.noiseScale;
    let noiseStrength = branchRandoms.noiseStrength;
    let thickness = branchRandoms.thickness;
    let pathPoints = [];
    let currentX = branchOffsetX;
    let currentY = branchOffsetY;
    let currentAngle = branchAngle;
    pathPoints.push({
      x: currentX,
      y: currentY
    });
    for (let step = 0; step < numSteps; step++) {
      const stepRandoms = branchRandoms.stepRandoms[step];
      const t = step / numSteps;
      const noiseX = noise(step * noiseScale, seed * 0.01);
      const noiseY = noise(step * noiseScale + 100, seed * 0.01);
      const angleOffset = (noiseX - 0.5) * PI * noiseStrength;
      currentAngle += angleOffset;
      const stepVariation = stepRandoms.stepVariation;
      const actualStepSize = stepSize * stepVariation;
      currentX += cos(currentAngle) * actualStepSize;
      currentY += sin(currentAngle) * actualStepSize;
      pathPoints.push({
        x: currentX,
        y: currentY
      });
      if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < numSteps - 3) {
        const subBranchLength = floor(stepRandoms.subBranchLengthRand);
        const subBranchAngle = currentAngle + stepRandoms.subBranchAngle;
        let subX = currentX;
        let subY = currentY;
        for (let subStep = 0; subStep < subBranchLength; subStep++) {
          const subNoise = noise(step * noiseScale + subStep * 0.5, seed * 0.01 + 200);
          const subAngleOffset = (subNoise - 0.5) * PI * 0.5;
          const subAngle = subBranchAngle + subAngleOffset;
          subX += cos(subAngle) * stepSize * 0.6;
          subY += sin(subAngle) * stepSize * 0.6;
          pathPoints.push({
            x: subX,
            y: subY
          });
        }
      }
    }
    const leftEdge = [];
    const rightEdge = [];
    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      let perpAngle;
      if (i === 0) {
        const next = pathPoints[i + 1];
        perpAngle = atan2(next.y - point.y, next.x - point.x) + HALF_PI;
      } else if (i === pathPoints.length - 1) {
        const prev = pathPoints[i - 1];
        perpAngle = atan2(point.y - prev.y, point.x - prev.x) + HALF_PI;
      } else {
        const prev = pathPoints[i - 1];
        const next = pathPoints[i + 1];
        const angle1 = atan2(point.y - prev.y, point.x - prev.x);
        const angle2 = atan2(next.y - point.y, next.x - point.x);
        perpAngle = ((angle1 + angle2) / 2) + HALF_PI;
      }
      const thicknessVariation = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
      const thicknessRand = branchRandoms.thicknessRandoms[Math.min(i, branchRandoms.thicknessRandoms.length - 1)];
      const actualThickness = thickness * thicknessVariation * thicknessRand;
      leftEdge.push({
        x: point.x + cos(perpAngle) * actualThickness / 2,
        y: point.y + sin(perpAngle) * actualThickness / 2
      });
      rightEdge.push({
        x: point.x - cos(perpAngle) * actualThickness / 2,
        y: point.y - sin(perpAngle) * actualThickness / 2
      });
    }
    for (let v of leftEdge) {
      allVertices.push(v);
    }
    for (let i = rightEdge.length - 1; i >= 0; i--) {
      allVertices.push(rightEdge[i]);
    }
  }
  return {
    type: 'lightning',
    vertices: allVertices
  };
}

function drawOrganicShape(buffer, shapeData, px, py, r, g, b, alpha) {
  buffer.fill(r, g, b, alpha);
  buffer.noStroke();
  const scale = 1 / pixel;
  switch (shapeData.type) {
    case 'polygon':
    case 'blob':
    case 'jagged':
    case 'strip':
    case 'lightning':
      buffer.beginShape();
      for (let v of shapeData.vertices) {
        buffer.vertex(px + v.x * scale, py + v.y * scale);
      }
      buffer.endShape(CLOSE);
      break;
    case 'cluster':
      for (let circle of shapeData.circles) {
        buffer.ellipse(
          px + circle.x * scale,
          py + circle.y * scale,
          circle.radius * 2 * scale,
          circle.radius * 2 * scale
        );
      }
      break;
  }
}

function scanAndMarkDarkPoints(sourceBuffer = null, scanBounds = null, shapeType = null, recordedTargetPoints = null) {
  let randomCountBefore = 0;
  if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
    randomCountBefore = crandom.getCount();
  }
  const w = sourceBuffer ? sourceBuffer.width : width;
  const h = sourceBuffer ? sourceBuffer.height : height;
  const d = sourceBuffer ? sourceBuffer.pixelDensity() : pixelDensity();
  const borderMargin = 20;
  const rgbThreshold = 700;
  const bgColorDiffThreshold = 80;
  let bgR = canvasBackgroundColor[0];
  let bgG = canvasBackgroundColor[1];
  let bgB = canvasBackgroundColor[2];
  let pixels = null;
  let targetPoints = [];
  const useRecordedTargets = recordedTargetPoints && recordedTargetPoints.length > 0;
  if (useRecordedTargets) {
    for (let i = 0; i < 10; i++) {
      crandom.random(0, 1);
    }
    targetPoints = recordedTargetPoints.map(p => ({
      x: p.x,
      y: p.y,
      brightness: p.brightness || 0
    }));
  } else {
    const targetBuffer = sourceBuffer || window;
    targetBuffer.loadPixels();
    pixels = sourceBuffer ? sourceBuffer.pixels : window.pixels;
    let pixelData = [];
    const step = 4;
    let scanMinX = borderMargin;
    let scanMaxX = w - borderMargin;
    let scanMinY = borderMargin;
    let scanMaxY = h - borderMargin;
    for (let y = scanMinY; y < scanMaxY; y += step) {
      for (let x = scanMinX; x < scanMaxX; x += step) {
        let index = 4 * ((y * d) * (w * d) + (x * d));
        let r = pixels[index];
        let g = pixels[index + 1];
        let b = pixels[index + 2];
        let a = pixels[index + 3];
        let brightness = r + g + b;
        let colorDiff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        if (a > 100 && brightness < rgbThreshold && colorDiff > bgColorDiffThreshold) {
          if (scanBounds && scanBounds.minX !== undefined) {
            if (x >= scanBounds.minX && x <= scanBounds.maxX &&
              y >= scanBounds.minY && y <= scanBounds.maxY) {
              pixelData.push({
                x: x,
                y: y,
                brightness: brightness
              });
            }
          } else {
            pixelData.push({
              x: x,
              y: y,
              brightness: brightness
            });
          }
        }
      }
    }
    if (pixelData.length === 0) {
      console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
      return;
    }
    pixelData.sort((a, b) => a.brightness - b.brightness);
    if (pixelData.length < 10) {
      console.log(`⚠️ 符合條件的點不足 10 個（只有 ${pixelData.length} 個），無法生成蟲咬效果`);
      return;
    }
    let indices = [];
    for (let i = 0; i < pixelData.length; i++) {
      indices.push(i);
    }
    const darkestRange = Math.floor(pixelData.length * 0.5);
    const candidateIndices = indices.slice(0, Math.max(darkestRange, 10));
    for (let i = 0; i < 10 && candidateIndices.length > 0; i++) {
      const weights = [];
      let totalWeight = 0;
      for (let j = 0; j < candidateIndices.length; j++) {
        const weight = Math.pow(1 - (j / candidateIndices.length), 2);
        weights.push(weight);
        totalWeight += weight;
      }
      let randomValue = crandom.random(0, totalWeight);
      let selectedIndex = 0;
      let cumulativeWeight = 0;
      for (let j = 0; j < weights.length; j++) {
        cumulativeWeight += weights[j];
        if (randomValue <= cumulativeWeight) {
          selectedIndex = j;
          break;
        }
      }
      const pixelIndex = candidateIndices.splice(selectedIndex, 1)[0];
      targetPoints.push(pixelData[pixelIndex]);
    }
    if (typeof isRecording !== 'undefined' && isRecording && typeof window !== 'undefined' && window.currentScanEvent) {
      window.currentScanEvent.targetPoints = targetPoints.map(p => ({
        x: p.x,
        y: p.y,
        brightness: p.brightness
      }));
    }
  }
  let allBitePoints = [];
  const biteRadius = 30;
  const minDistance = 4;
  let skippedPointsCount = 0;
  const maxAttemptsPerBite = 30;
  for (let target of targetPoints) {
    let numBites = int(crandom.random(2, 5));
    let clusterPoints = [];
    const precomputedRandoms = [];
    const precomputedBiteParams = [];
    for (let biteIdx = 0; biteIdx < numBites; biteIdx++) {
      const biteRandoms = [];
      for (let attempt = 0; attempt < maxAttemptsPerBite; attempt++) {
        biteRandoms.push({
          r: crandom.random(0, 1),
          angle: crandom.random(0, TWO_PI),
          angleOffset: crandom.random(-0.25, 0.25)
        });
      }
      precomputedRandoms.push(biteRandoms);
      precomputedBiteParams.push({
        colorRand1: crandom.random(0, 1),
        colorRand2: crandom.random(0, 1),
        colorRand3: crandom.random(0, 1),
        sizeRand1: crandom.random(0, 1),
        sizeRand2: crandom.random(0, 1),
        sizeRand3: crandom.random(0, 1),
        shapeSeedRand: crandom.random(0, 10000)
      });
    }
    for (let i = 0; i < numBites; i++) {
      let attempts = 0;
      let validPoint = false;
      let newX, newY, distance;
      const biteRandoms = precomputedRandoms[i];
      const biteParams = precomputedBiteParams[i];
      if (useRecordedTargets) {
        const rand = biteRandoms[0];
        let r = sqrt(rand.r) * biteRadius;
        let angle = rand.angle + rand.angleOffset;
        distance = r;
        let offsetX = Math.cos(angle) * distance * 0;
        let offsetY = Math.sin(angle) * distance * 0;
        newX = Math.floor(target.x + offsetX);
        newY = Math.floor(target.y + offsetY);
        newX = constrain(newX, borderMargin, w - borderMargin);
        newY = constrain(newY, borderMargin, h - borderMargin);
        validPoint = true;
        for (let existingPoint of clusterPoints) {
          let dist = Math.sqrt(
            Math.pow(newX - existingPoint.x, 2) +
            Math.pow(newY - existingPoint.y, 2)
          );
          if (dist < minDistance) {
            validPoint = false;
            break;
          }
        }
      } else {
        while (!validPoint && attempts < maxAttemptsPerBite) {
          const rand = biteRandoms[attempts];
          let r = sqrt(rand.r) * biteRadius;
          let angle = rand.angle;
          angle += rand.angleOffset;
          distance = r;
          let offsetX = Math.cos(angle) * distance * 0;
          let offsetY = Math.sin(angle) * distance * 0;
          newX = Math.floor(target.x + offsetX);
          newY = Math.floor(target.y + offsetY);
          newX = constrain(newX, borderMargin, w - borderMargin);
          newY = constrain(newY, borderMargin, h - borderMargin);
          let pixelIndex = 4 * ((newY * d) * (w * d) + (newX * d));
          let pixelR = pixels[pixelIndex];
          let pixelG = pixels[pixelIndex + 1];
          let pixelB = pixels[pixelIndex + 2];
          let pixelA = pixels[pixelIndex + 3];
          let pixelBrightness = pixelR + pixelG + pixelB;
          let pixelColorDiff = Math.abs(pixelR - bgR) + Math.abs(pixelG - bgG) + Math.abs(pixelB - bgB);
          if (pixelA <= 100 || pixelBrightness >= rgbThreshold || pixelColorDiff <= bgColorDiffThreshold) {
            validPoint = false;
            attempts++;
            if (attempts >= maxAttemptsPerBite) {
              skippedPointsCount++;
            }
            continue;
          }
          validPoint = true;
          for (let existingPoint of clusterPoints) {
            let dist = Math.sqrt(
              Math.pow(newX - existingPoint.x, 2) +
              Math.pow(newY - existingPoint.y, 2)
            );
            if (dist < minDistance) {
              validPoint = false;
              break;
            }
          }
          attempts++;
        }
      }
      let size2 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
      if (shapeType === 2) {
        size2 *= 1.3;
      }
      let shapeSeed = floor(target.x * 1000 + target.y * 333 + biteParams.shapeSeedRand);
      let shapeRandomCountBefore = 0;
      let shapeRandomCountAfter = 0;
      if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
        shapeRandomCountBefore = crandom.getCount();
      }
      let shapeData = generateOrganicShape(target.x, target.y, size2, shapeSeed, shapeType);
      if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
        shapeRandomCountAfter = crandom.getCount();
        if (!biteParams.shapeRandomCount) {
          biteParams.shapeRandomCount = shapeRandomCountAfter - shapeRandomCountBefore;
        }
      }
      if (validPoint) {
        let r, g, b;
        let currentTint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
        if (currentTint[0] < 0.2 && currentTint[1] < 0.15 && currentTint[2] < 0.1) {
          r = Math.floor(38 + biteParams.colorRand1 * (51 - 38));
          g = Math.floor(31 + biteParams.colorRand2 * (38 - 31));
          b = Math.floor(20 + biteParams.colorRand3 * (26 - 20));
        } else {
          r = 230 + biteParams.colorRand1 * (255 - 230);
          g = 160 + biteParams.colorRand2 * (220 - 160);
          b = 0;
        }
        let point = {
          x: newX,
          y: newY,
          brightness: target.brightness,
          r: r,
          g: g,
          b: b,
          size: size2,
          shapeData: shapeData
        };
        clusterPoints.push(point);
        allBitePoints.push(point);
      }
    }
  }
  markedDarkPoints = markedDarkPoints.concat(allBitePoints);
  let spawnerCount = 0;
  if (typeof boidSpawners !== 'undefined' && doBoids) {
    for (let point of allBitePoints) {
      if (crandom.random(0, 1) > 0.2) {
        continue;
      }
      spawnerCount++;
      let holeSize = point.size || 2.5;
      let sizeRatio = map(holeSize, 1.5, 6, 0.5, 1.5);
      boidSpawners.push({
        x: point.x,
        y: point.y,
        r: point.r,
        g: point.g,
        b: point.b,
        spawnRate: crandom.random(0.02, 0.05),
        maxBoids: floor(crandom.random(1, 3)),
        spawnedCount: 0,
        isActive: true,
        movementRadius: crandom.random(60, 200),
        boidSizeMultiplier: sizeRatio
      });
    }
    let recentSpawners = boidSpawners.slice(-spawnerCount);
    if (spawnerCount > 0) {
      let sizeMultipliers = recentSpawners.map(s => s.boidSizeMultiplier);
      let minSize = Math.min(...sizeMultipliers);
      let maxSize = Math.max(...sizeMultipliers);
      let percentage = (spawnerCount / allBitePoints.length * 100).toFixed(1);
      console.log(`🦋 創建了 ${spawnerCount} 個 Boid Spawners (虫咬點的 ${percentage}%，節省效能)`);
      console.log(`📏 Boid 大小倍数範圍: ${minSize.toFixed(2)} ~ ${maxSize.toFixed(2)} (基於虫咬洞大小)`);
    } else {
      console.log(`🦋 沒有創建 Boid Spawners`);
    }
  }
  if (allBitePoints.length > 0) {
    let minBrightness = Infinity;
    let maxBrightness = 0;
    for (let point of allBitePoints) {
      let brightness = point.r + point.g + point.b;
      minBrightness = Math.min(minBrightness, brightness);
      maxBrightness = Math.max(maxBrightness, brightness);
    }
    if (skippedPointsCount > 0) {
      console.log(`⚠️ 跳過了 ${skippedPointsCount} 個不在筆墨區域的點`);
    }
  }
  const pointsThisScan = allBitePoints.length;
  if (pointsThisScan > 0) {
    logArt('system', '🐛 虫咬点生成完成', {
      '虫咬点总数': pointsThisScan,
      'Boids功能': '已禁用'
    });
  }
  window.bugsDataTextureCache = null;
  window.bugsMaskTextureCache = null;
  if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
    const randomCountAfter = crandom.getCount();
    const randomCountUsed = randomCountAfter - randomCountBefore;
    if (typeof isPlaying !== 'undefined' && isPlaying && typeof window !== 'undefined') {
      const currentScanEvent = window.currentScanEvent;
      if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
        const recordedCount = currentScanEvent.recordedRandomCount;
        const diff = randomCountUsed - recordedCount;
        const percent = recordedCount > 0 ? ((diff / recordedCount) * 100).toFixed(2) + '%' : 'N/A';
        const icon = Math.abs(diff) < 50 ? '✅' : Math.abs(diff) < 200 ? '⚠️' : '❌';
        const action = currentScanEvent.action || 'scan';
        const shapeTypeStr = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
          `ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
        const pointsInfo = typeof pointsThisScan === 'number' ? ` | Points:${pointsThisScan}` : '';
        console.log(`${icon} Scan [${action}] ${shapeTypeStr} | 差異: ${diff > 0 ? '+' : ''}${diff} (${percent})${pointsInfo}`);
      }
    } else if (typeof isRecording !== 'undefined' && isRecording) {
      if (typeof window !== 'undefined' && window.currentScanEvent) {
        window.currentScanEvent.recordedRandomCount = randomCountUsed;
      }
    }
  }
}

function generateRandomBitePointsAnywhere(numTargets = 10, shapeType = null) {
  const borderMargin = 20;
  const w = width;
  const h = height;
  let targetPoints = [];
  for (let i = 0; i < numTargets; i++) {
    let x = crandom.random(borderMargin, w - borderMargin);
    let y = crandom.random(borderMargin, h - borderMargin);
    targetPoints.push({
      x: x,
      y: y,
      brightness: 0
    });
  }
  let allBitePoints = [];
  const biteRadius = 30;
  const minDistance = 4;
  for (let target of targetPoints) {
    let numBites = int(crandom.random(2, 5));
    let clusterPoints = [];
    for (let i = 0; i < numBites; i++) {
      let attempts = 0;
      let validPoint = false;
      let newX, newY, distance;
      while (!validPoint && attempts < 30) {
        let r = sqrt(crandom.random(0, 1)) * biteRadius;
        let angle = crandom.random(0, TWO_PI);
        angle += crandom.random(-0.25, 0.25);
        distance = r;
        let offsetX = Math.cos(angle) * distance;
        let offsetY = Math.sin(angle) * distance;
        newX = Math.floor(target.x + offsetX);
        newY = Math.floor(target.y + offsetY);
        newX = constrain(newX, borderMargin, w - borderMargin);
        newY = constrain(newY, borderMargin, h - borderMargin);
        validPoint = true;
        for (let existingPoint of clusterPoints) {
          let dist = Math.sqrt(
            Math.pow(newX - existingPoint.x, 2) +
            Math.pow(newY - existingPoint.y, 2)
          );
          if (dist < minDistance) {
            validPoint = false;
            break;
          }
        }
        attempts++;
      }
      if (validPoint) {
        let r, g, b;
        let currentTint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
        if (currentTint[0] < 0.2 && currentTint[1] < 0.15 && currentTint[2] < 0.1) {
          r = Math.floor(crandom.random(38, 51));
          g = Math.floor(crandom.random(31, 38));
          b = Math.floor(crandom.random(20, 26));
        } else {
          r = crandom.random(230, 255);
          g = crandom.random(160, 220);
          b = 0;
        }
        let size = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
        size = random(0, 1) > 0.05 ? size * random(0.8, 1.2) : size * random(1, 3);
        let shapeSeed = floor(newX * 1000 + newY * 333 + crandom.random(0, 10000));
        let shapeData = generateOrganicShape(newX, newY, size, shapeSeed, shapeType);
        let point = {
          x: newX,
          y: newY,
          brightness: 0,
          r: r,
          g: g,
          b: b,
          size: size,
          shapeData: shapeData
        };
        clusterPoints.push(point);
        allBitePoints.push(point);
      }
    }
  }
  markedDarkPoints = markedDarkPoints.concat(allBitePoints);
  let spawnerCount = 0;
  if (typeof boidSpawners !== 'undefined' && doBoids) {
    for (let point of allBitePoints) {
      if (crandom.random(0, 1) > 0.2) {
        continue;
      }
      spawnerCount++;
      let holeSize = point.size || 2.5;
      let sizeRatio = map(holeSize, 1.5, 6, 0.5, 1.5);
      boidSpawners.push({
        x: point.x,
        y: point.y,
        r: point.r,
        g: point.g,
        b: point.b,
        spawnRate: crandom.random(0.02, 0.05),
        maxBoids: floor(crandom.random(1, 3)),
        spawnedCount: 0,
        isActive: true,
        movementRadius: crandom.random(60, 200),
        boidSizeMultiplier: sizeRatio
      });
    }
  }
  if (allBitePoints.length > 0) {
    logArt('system', '🎲 随机虫咬点生成完成', {
      '虫咬点总数': allBitePoints.length,
      'Boids功能': '已禁用'
    });
  }
  window.bugsDataTextureCache = null;
  window.bugsMaskTextureCache = null;
}

function createBugsTextures(forceRecreate = false) {
  if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
    window.bugsDataTexture = createGraphics(width, height, P2D);
    window.bugsDataTexture.pixelDensity(pixel);
  }
  if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
    window.bugsMaskTexture = createGraphics(width, height, P2D);
    window.bugsMaskTexture.pixelDensity(pixel);
  }
  const needsUpdate = forceRecreate ||
    !window.bugsDataTextureCache ||
    window.bugsDataTextureCache.pointCount !== markedDarkPoints.length;
  if (!needsUpdate) {
    return {
      dataTexture: window.bugsDataTexture,
      maskTexture: window.bugsMaskTexture
    };
  }
  window.bugsDataTexture.clear();
  window.bugsDataTexture.noStroke();
  window.bugsMaskTexture.clear();
  window.bugsMaskTexture.noStroke();
  for (let point of markedDarkPoints) {
    const px = point.x;
    const py = point.y;
    const pointSize = (point.size || 5) / pixel;
    const centerX = point.x / width;
    const centerY = point.y / height;
    const size = (point.size || 5) / width;
    const r = point.r || 255;
    const g = point.g || 0;
    const b = point.b || 0;
    if (point.shapeData) {
      drawOrganicShape(window.bugsDataTexture, point.shapeData, px, py,
        centerX * 255, centerY * 255, size * 255, 255);
      drawOrganicShape(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
    } else {
      window.bugsDataTexture.fill(centerX * 255, centerY * 255, size * 255, 255);
      window.bugsDataTexture.ellipse(px, py, pointSize, pointSize);
      window.bugsMaskTexture.fill(r, g, b, 255);
      window.bugsMaskTexture.ellipse(px, py, pointSize, pointSize);
    }
  }
  const cacheData = {
    pointCount: markedDarkPoints.length,
    timestamp: millis()
  };
  window.bugsDataTextureCache = cacheData;
  window.bugsMaskTextureCache = cacheData;
  return {
    dataTexture: window.bugsDataTexture,
    maskTexture: window.bugsMaskTexture
  };
}

function drawMetallicBugs(targetBuffer, sourceBuffer) {
  if (markedDarkPoints.length === 0) {
    return;
  }
  if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
    console.warn('⚠️ Metallic shader 未加載');
    return;
  }
  const textures = createBugsTextures();
  let bugsDataTex = textures.dataTexture;
  let bugsMaskTex = textures.maskTexture;
  targetBuffer.begin();
  clear();
  shader(window.metallicProgram);
  window.metallicProgram.setUniform('tex0', sourceBuffer);
  window.metallicProgram.setUniform('bugsMask', bugsMaskTex);
  window.metallicProgram.setUniform('bugsData', bugsDataTex);
  window.metallicProgram.setUniform('time', millis());
  window.metallicProgram.setUniform('resolution', [width * pixel, height * pixel]);
  let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
  let flowSpeed = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
  let specular = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
  let fresnel = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
  let lightX = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
  let lightY = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
  let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
  window.metallicProgram.setUniform('metallicStrength', strength);
  window.metallicProgram.setUniform('flowSpeed', flowSpeed);
  window.metallicProgram.setUniform('lightPos', [lightX, lightY]);
  window.metallicProgram.setUniform('specularPower', specular);
  window.metallicProgram.setUniform('fresnelStrength', fresnel);
  window.metallicProgram.setUniform('metalTint', tint);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, width, height);
  resetShader();
  targetBuffer.end();
}

// === js/grid.js ===
let __prevGridParams = null;
let __lastGridParams = null;

function gridCommitPrev() {
  if (__lastGridParams) {
    __prevGridParams = {
      ...__lastGridParams
    };
  }
}
window.gridCommitPrev = gridCommitPrev;

function drawGridToBuffer(cx, cy, brushPxNow, isFlowEffect) {
  push();
  noFill();
  stroke(0, 0, 0, 80);
  strokeWeight(1);
  const effCell = constrain(brushPxNow || 20, 2, 400) * 0.7;
  let minX = Math.min(startX, cx);
  let maxX = Math.max(startX, cx);
  let minY = Math.min(startY, cy);
  let maxY = Math.max(startY, cy);
  if (typeof pathPointsCache !== 'undefined' && pathPointsCache !== null) {
    if (pathPointsCache.minX < minX) minX = pathPointsCache.minX;
    if (pathPointsCache.maxX > maxX) maxX = pathPointsCache.maxX;
    if (pathPointsCache.minY < minY) minY = pathPointsCache.minY;
    if (pathPointsCache.maxY > maxY) maxY = pathPointsCache.maxY;
  } else if (Array.isArray(pathPoints) && pathPoints.length > 0) {
    for (let i = 0; i < pathPoints.length; i++) {
      const px = pathPoints[i].x;
      const py = pathPoints[i].y;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }
  const pad = effCell * 0.3;
  const bboxW = (maxX - minX) + pad * 2;
  const bboxH = (maxY - minY) + pad * 2;
  const midX = (minX + maxX) * 0.5;
  const midY = (minY + maxY) * 0.5;
  let left = Math.max(0, Math.floor((minX - pad) / effCell) * effCell);
  let top = Math.max(0, Math.floor((minY - pad) / effCell) * effCell);
  const quantRight = Math.min(width, Math.ceil((maxX + pad) / effCell) * effCell);
  const quantBottom = Math.min(height, Math.ceil((maxY + pad) / effCell) * effCell);
  let gridWidth = Math.max(effCell * 2, quantRight - left);
  let gridHeight = Math.max(effCell * 2, quantBottom - top);
  const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
  const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
  left = constrain(left, 0, Math.max(0, width - gridWidth));
  top = constrain(top, 0, Math.max(0, height - gridHeight));
  const right = left + gridWidth;
  const bottom = top + gridHeight;
  if (__prevGridParams && typeof isPlaying !== 'undefined' && isPlaying) {
    const pg = __prevGridParams;
    strokeWeight(1);
    stroke(0, 0, 0, 60);
    rectMode(CORNER);
    rect(pg.left, pg.top, pg.right - pg.left, pg.bottom - pg.top);
    strokeWeight(0.5);
    stroke(0, 0, 0, 35);
    for (let i = 1; i < pg.cols; i++) {
      const x = pg.left + i * pg.effCell;
      line(x, pg.top, x, pg.bottom);
    }
    for (let j = 1; j < pg.rows; j++) {
      const y = pg.top + j * pg.effCell;
      line(pg.left, y, pg.right, y);
    }
  }
  strokeWeight(1);
  if (isFlowEffect) {
    stroke(255, 50, 50, 200);
  } else {
    stroke(0, 0, 150, 120);
  }
  rectMode(CORNER);
  rect(left, top, gridWidth, gridHeight);
  if (isFlowEffect) {
    const crossSize = 12;
    const crossX = left + 8;
    const crossY = top + 8;
    strokeWeight(2);
    stroke(255, 50, 50, 255);
    line(crossX - crossSize / 2, crossY, crossX + crossSize / 2, crossY);
    line(crossX, crossY - crossSize / 2, crossX, crossY + crossSize / 2);
    strokeWeight(1);
  }
  strokeWeight(0.5);
  if (isFlowEffect) {
    stroke(255, 50, 50, 80);
  } else {
    stroke(0, 0, 150, 50);
  }
  for (let i = 1; i < cols; i++) {
    const x = left + i * effCell;
    line(x, top, x, bottom);
  }
  for (let j = 1; j < rows; j++) {
    const y = top + j * effCell;
    line(left, y, right, y);
  }
  stroke(0, 0, 0, 180);
  strokeWeight(1.2);
  if (font) textFont(font);
  textSize(6);
  fill(0);
  noStroke();
  const maxUpdatesVal = typeof maxUpdates === 'number' ? maxUpdates : 0;
  const updateCountVal = typeof updateCount === 'number' ? updateCount : 0;
  const brushDirVal = typeof brushDir === 'number' ? brushDir : 0;
  const dirSymbols = ['原', '1X翻', '1Y翻', '1XY翻'];
  const dirSymbol = dirSymbols[brushDirVal] || '?';
  const countdownText = `Max: ${maxUpdatesVal} | Count: ${updateCountVal} | Dir: ${brushDirVal}(${dirSymbol})`;
  textAlign(LEFT, TOP);
  text(countdownText, left, top - 12);
  const drawCount = typeof mouseCount === 'number' ? mouseCount : 0;
  const brushType = typeof brushMode === 'number' ? brushMode : 0;
  const sizeNow = (typeof currentSize === 'number' && currentSize > 0) ? currentSize : (typeof lastBrushPixelSize === 'number' ? lastBrushPixelSize : effCell);
  const phasorVelText = (typeof phasorVel === 'number') ? phasorVel : '';
  const infoText = `C: ${drawCount} | B: ${brushType} | S: ${sizeNow.toFixed(1)} | P: ${phasorVelText}`;
  const infoX = left;
  const infoY = Math.min(height - 18, bottom + 6);
  textAlign(LEFT, TOP);
  text(infoText, infoX, infoY);
  pop();
  window.gridWidth = gridWidth;
  window.gridHeight = gridHeight;
  __lastGridParams = {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
    effCell: effCell,
    cols: cols,
    rows: rows,
    gridWidth: gridWidth,
    gridHeight: gridHeight
  };
  window.__lastGridParams = __lastGridParams;
}

function drawPathToBuffer(buffer) {
  const isFBO = typeof buffer.begin === 'function';
  if (isFBO) buffer.begin();
  const g = isFBO ? window : buffer;
  g.push();
  g.translate(-hw, -hh);
  if (pathPoints.length > 1) {
    const dashLength = 5;
    const gapLength = 5;
    g.stroke(0, 0, 0, 255);
    g.strokeWeight(1);
    drawDash = true;
    accumulatedDist = 0;
    for (let i = 0; i < pathPoints.length - 1; i++) {
      let x1 = pathPoints[i].x;
      let y1 = pathPoints[i].y;
      let x2 = pathPoints[i + 1].x;
      let y2 = pathPoints[i + 1].y;
      let segmentDist = dist(x1, y1, x2, y2);
      let dx = (x2 - x1) / segmentDist;
      let dy = (y2 - y1) / segmentDist;
      let currentDist = 0;
      while (currentDist < segmentDist) {
        let remainingInCycle = drawDash ? dashLength : gapLength;
        let distToDraw = min(remainingInCycle - accumulatedDist, segmentDist - currentDist);
        if (drawDash) {
          let startX = x1 + dx * currentDist;
          let startY = y1 + dy * currentDist;
          let endX = x1 + dx * (currentDist + distToDraw);
          let endY = y1 + dy * (currentDist + distToDraw);
          g.line(startX, startY, endX, endY);
        }
        currentDist += distToDraw;
        accumulatedDist += distToDraw;
        if (accumulatedDist >= (drawDash ? dashLength : gapLength)) {
          drawDash = !drawDash;
          accumulatedDist = 0;
        }
      }
    }
  }
  g.noFill();
  g.stroke(0, 0, 0, 255);
  g.strokeWeight(1);
  g.ellipse(startX, startY, 10, 10);
  if (pathPoints.length > 0) {
    let endPoint = pathPoints[pathPoints.length - 1];
    g.stroke(0, 0, 0, 255);
    g.strokeWeight(1);
    g.ellipse(endPoint.x, endPoint.y, 10, 10);
  }
  g.pop();
  if (isFBO) buffer.end();
}

// === js/camera.js ===
function handleEasyCamReset() {
  if ((!isPlaying || isWaitingToLoop) && easycam !== null && doMoving) {
    const resetCenter = easycamInitialCenter || [0, 0, 0];
    const fixedFov = PI / 3;
    const defaultDistance = height / (2 * tan(fixedFov / 2));
    const resetDistance = easycamInitialDistance > 0 ? easycamInitialDistance : defaultDistance;
    const currentCenter = easycam.getCenter();
    const currentDistance = easycam.getDistance();
    const centerTolerance = 0.1;
    const distanceTolerance = 1.0;
    const centerDiff = Math.sqrt(
      Math.pow(currentCenter[0] - resetCenter[0], 2) +
      Math.pow(currentCenter[1] - resetCenter[1], 2) +
      Math.pow(currentCenter[2] - resetCenter[2], 2)
    );
    const distanceDiff = Math.abs(currentDistance - resetDistance);
    if (!easycamResetting && (centerDiff > centerTolerance || distanceDiff > distanceTolerance)) {
      easycamResetting = true;
      easycamResetStartTime = millis();
      easycamResetStartCenter = [currentCenter[0], currentCenter[1], currentCenter[2]];
      easycamResetStartDistance = currentDistance;
      easycamResetTargetCenter = resetCenter;
      easycamResetTargetDistance = resetDistance;
    }
    if (easycamResetting) {
      const elapsed = millis() - easycamResetStartTime;
      const progress = Math.min(elapsed / easycamResetDuration, 1.0);
      const lerpedCenter = [
        lerp(easycamResetStartCenter[0], easycamResetTargetCenter[0], progress),
        lerp(easycamResetStartCenter[1], easycamResetTargetCenter[1], progress),
        lerp(easycamResetStartCenter[2], easycamResetTargetCenter[2], progress)
      ];
      const lerpedDistance = lerp(easycamResetStartDistance, easycamResetTargetDistance, progress);
      easycam.setCenter(lerpedCenter, 0);
      easycam.setDistance(lerpedDistance, 0);
      if (progress >= 1.0) {
        const finalCenter = easycam.getCenter();
        const finalDistance = easycam.getDistance();
        const finalCenterDiff = Math.sqrt(
          Math.pow(finalCenter[0] - resetCenter[0], 2) +
          Math.pow(finalCenter[1] - resetCenter[1], 2) +
          Math.pow(finalCenter[2] - resetCenter[2], 2)
        );
        const finalDistanceDiff = Math.abs(finalDistance - resetDistance);
        if (finalCenterDiff > centerTolerance || finalDistanceDiff > distanceTolerance) {
          easycam.setCenter(resetCenter, 0);
          easycam.setDistance(resetDistance, 0);
        }
        easycamResetting = false;
      }
    }
  }
}

function updateEasyCamAutoTracking() {
  if (isPlaying && !isWaitingToLoop && doMoving && easycamEnabled && easycam !== null && easycamAutoTracking && !easycamResetting) {
    const mousePosX = simulatedMouseX;
    const mousePosY = simulatedMouseY;
    const targetX = mousePosX - hw;
    const targetY = -(mousePosY - hh);
    const currentCenter = easycam.getCenter();
    const currentX = currentCenter[0];
    const currentY = currentCenter[1];
    const currentDistance = easycam.getDistance();
    const fixedFov = PI / 3;
    const baseDistance = height / (2 * tan(fixedFov / 2));
    const minScale = 1.1;
    let maxScale = 1.4;
    const minDistance = baseDistance / maxScale;
    const maxDistance = baseDistance / minScale;
    const currentScale = baseDistance / currentDistance;
    const scaleTolerance = 0.01;
    if (easycamShouldZoom) {
      const targetScale = maxScale;
      const targetDistance = baseDistance / targetScale;
      const distanceDiff = targetDistance - currentDistance;
      const zoomDamping = easycamZoomDamping;
      const newDistance = currentDistance + distanceDiff * zoomDamping;
      const clampedDistance = constrain(newDistance, minDistance, maxDistance);
      easycam.setDistance(clampedDistance, 0);
    } else {
      const targetDistance = baseDistance / minScale;
      const distanceDiff = targetDistance - currentDistance;
      const zoomDamping = easycamZoomDamping;
      const newDistance = currentDistance + distanceDiff * zoomDamping;
      const clampedDistance = constrain(newDistance, minDistance, maxDistance);
      easycam.setDistance(clampedDistance, 0);
    }
    const updatedDistance = easycam.getDistance();
    const updatedScale = baseDistance / updatedDistance;
    let maxPanRangeX = 0;
    let maxPanRangeY = 0;
    if (updatedScale > minScale) {
      maxPanRangeX = (updatedScale - minScale) * (width / 2);
      maxPanRangeY = (updatedScale - minScale) * (height / 2);
    }
    let offsetX = targetX - currentX;
    let offsetY = targetY - currentY;
    if (maxPanRangeX > 0 || maxPanRangeY > 0) {
      const clampedTargetX = constrain(targetX, -maxPanRangeX, maxPanRangeX);
      const clampedTargetY = constrain(targetY, -maxPanRangeY, maxPanRangeY);
      offsetX = clampedTargetX - currentX;
      offsetY = clampedTargetY - currentY;
    } else {
      offsetX = -currentX;
      offsetY = -currentY;
    }
    const damping = easycamTrackingDamping;
    const newX = currentX + offsetX * damping;
    const newY = currentY + offsetY * damping;
    let finalX = newX;
    let finalY = newY;
    if (maxPanRangeX > 0 || maxPanRangeY > 0) {
      finalX = constrain(newX, -maxPanRangeX, maxPanRangeX);
      finalY = constrain(newY, -maxPanRangeY, maxPanRangeY);
    } else {
      finalX = 0;
      finalY = 0;
    }
    easycam.setCenter([finalX, finalY, 0], 0);
  }
}

function initializeEasyCam() {
  if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
    console.warn('⚠️ EasyCam library not loaded');
    easycamEnabled = false;
    return;
  }
  if (easycam !== null) {
    easycamEnabled = true;
    return;
  }
  try {
    const renderer = _renderer;
    if (!renderer) {
      console.error('❌ WEBGL renderer not found');
      easycamEnabled = false;
      return;
    }
    const fixedFov = PI / 3;
    const baseDistance = height / (2 * tan(fixedFov / 2));
    easycam = new Dw.EasyCam(renderer, {
      distance: baseDistance,
      center: [0, 0, 0],
      rotation: [1, 0, 0, 0],
      viewport: [0, 0, width, height],
    });
    easycam.setRotationConstraint(0, 0, 0);
    easycam.setRotationScale(0);
    easycamMinDistance = baseDistance / 2.5;
    easycamMaxDistance = baseDistance / 1.0;
    easycam.setDistanceMin(easycamMinDistance);
    easycam.setDistanceMax(easycamMaxDistance);
    document.oncontextmenu = function() {
      return false;
    };
    easycamEnabled = true;
    logArt('system', '🎥 EasyCam initialized', {
      Status: 'Auto camera tracking ready',
      Controls: 'Camera automatically follows grid center during playback'
    });
  } catch (error) {
    console.error('❌ Failed to initialize EasyCam:', error);
    easycamEnabled = false;
    easycam = null;
  }
}

function applyCameraProjection() {
  const shouldApplyEasyCam = doMoving && easycamEnabled && easycam !== null && isPlaying && easycamAutoTracking;
  if (shouldApplyEasyCam) {
    const fov = PI / 3;
    const near = 0.1;
    const far = 10000;
    perspective(fov, width / height, near, far);
    push();
  } else {
    const defaultFov = PI / 3;
    const defaultNear = 0.1;
    const defaultFar = 10000;
    perspective(defaultFov, width / height, defaultNear, defaultFar);
  }
}

// === js/buffer.js ===
let cachedRect = null;
let cachedInvResolution = null;
let lastWidth = 0,
  lastHeight = 0,
  lastPixel = 0;
let _uCache = {
  feedback: {},
  composite: {},
  realtime: {}
};

function setUniformCached(program, cacheKey, name, value) {
  const cache = _uCache[cacheKey];
  if (cache[name] === value) return;
  cache[name] = value;
  program.setUniform(name, value);
}

function updateCachedUniformValues() {
  if (lastWidth !== width || lastHeight !== height || lastPixel !== pixel) {
    cachedRect = [0, 0, width * pixel, height * pixel];
    cachedInvResolution = [1.0 / (width * pixel), 1.0 / (height * pixel)];
    lastWidth = width;
    lastHeight = height;
    lastPixel = pixel;
  }
  if (cachedRect === null) {
    cachedRect = [0, 0, width * pixel, height * pixel];
    cachedInvResolution = [1.0 / (width * pixel), 1.0 / (height * pixel)];
  }
}

function updateDrawingOnBuffer(buffer, forceValue = 1.0) {
  if (disableFeedbackShaderForPerfTest) {
    needsComposite = true;
    return;
  }
  // fxhash debug: 追蹤 feedback 執行次數
  if (window._fxDebug) window._fxDebug.feedbackFrames++;
  pingPongBuffer.begin();
  resetShader();
  blendMode(BLEND);
  imageMode(CENTER);
  rectMode(CENTER);
  shader(feedbackProgram);
  const brushCategory = brushColorMode === 1 ? 1.0 : 0.0;
  updateCachedUniformValues();
  feedbackProgram.setUniform("rect", cachedRect);
  feedbackProgram.setUniform("invResolution", cachedInvResolution);
  feedbackProgram.setUniform("tex0", buffer);
  setUniformCached(feedbackProgram, 'feedback', "brushMode", brushMode * 1.0);
  feedbackProgram.setUniform("forceMap", img);
  setUniformCached(feedbackProgram, 'feedback', "baseBrushSize", baseBrushSize);
  feedbackProgram.setUniform("force", forceValue);
  setUniformCached(feedbackProgram, 'feedback', "useSharpen", useSharpen);
  setUniformCached(feedbackProgram, 'feedback', "effect3Brightness", effect3Brightness);
  setUniformCached(feedbackProgram, 'feedback', "indiffusionStrength", indiffusionStrength);
  setUniformCached(feedbackProgram, 'feedback', "brushColorMode", float(brushColorMode));
  setUniformCached(feedbackProgram, 'feedback', "brushCategory", brushCategory);
  const mouseCountOffset = typeof currentStrokeMouseCountStart !== 'undefined' ? currentStrokeMouseCountStart : 0;
  const effectiveMouseCount = (mouseCount + mouseCountOffset) % 40;
  const mouseCountAccumulated = mouseCount + mouseCountOffset;
  feedbackProgram.setUniform("mouseCount", float(effectiveMouseCount));
  feedbackProgram.setUniform("mouseCountAccumulated", float(mouseCountAccumulated));
  feedbackProgram.setUniform("strokeSeed", float(strokeSeed));
  rectMode(CENTER);
  rect(0, 0, width, height);
  resetShader();
  pingPongBuffer.end();
  buffer.begin();
  imageMode(CENTER);
  blendMode(BLEND);
  image(pingPongBuffer, 0, 0, width, height);
  buffer.end();
  needsComposite = true;
}

function regeneratePaperTextureBuffer() {
  if (typeof paperTextureBuffer === 'undefined' || !paperTextureBuffer) {
    return;
  }
  const bgColor = canvasBackgroundColor;
  let paperTexture = createPaperTexture(40, 20, 15, 0.2);
  const fillR = min(255, bgColor[0] * 1.1);
  const fillG = min(255, bgColor[1] * 1.1);
  const fillB = min(255, bgColor[2] * 1.1);
  paperTextureBuffer.begin();
  clear();
  blendMode(BLEND);
  noStroke();
  fill(fillR, fillG, fillB);
  rect(-width / 2, -height / 2, width, height);
  blendMode(MULTIPLY);
  image(paperTexture, -width / 2, -height / 2, width, height);
  paperTextureBuffer.end();
  paperTexture.remove();
}

function applyBackgroundColorToBuffers() {
  const bgColor = canvasBackgroundColor;
  if (typeof paperFlatBuffer !== 'undefined' && paperFlatBuffer) {
    paperFlatBuffer.begin();
    background(bgColor[0], bgColor[1], bgColor[2]);
    paperFlatBuffer.end();
  }
  regeneratePaperTextureBuffer();
  if (typeof needsComposite !== 'undefined') {
    needsComposite = true;
  }
}

function updateCompositeBuffer() {
  const shouldComposite = needsComposite || isDrawing || isCountingDown || isPlaying || isFrameRecording;
  if (shouldComposite) {
    screenBuffer.begin();
    clear();
    shader(compositeProgram);
    updateCachedUniformValues();
    compositeProgram.setUniform("rect", cachedRect);
    compositeProgram.setUniform("baseTex", showPaperTexture ? paperTextureBuffer : paperFlatBuffer);
    compositeProgram.setUniform("encodedTex", finalBuffer);
    compositeProgram.setUniform("typeMapTex", typeMapBuffer);
    compositeProgram.setUniform("oldTex", oldBuffer);
    setUniformCached(compositeProgram, 'composite', "brushColorMode", float(brushColorMode));
    setUniformCached(compositeProgram, 'composite', "whiteMaxOpacity", currentWhiteMaxOpacity);
    setUniformCached(compositeProgram, 'composite', "hueShift", currentHueShift);
    setUniformCached(compositeProgram, 'composite', "satShift", currentSatShift);
    setUniformCached(compositeProgram, 'composite', "briShift", currentBriShift);
    setUniformCached(compositeProgram, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
    setUniformCached(compositeProgram, 'composite', "useSharpen", useSharpen);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, width, height);
    resetShader();
    screenBuffer.end();
    if (isDrawing || isCountingDown) {
      realtimeIntermediateBuffer.begin();
      clear();
      imageMode(CENTER);
      image(screenBuffer, 0, 0, width, height);
      realtimeIntermediateBuffer.end();
      screenBuffer.begin();
      shader(realtimeProgram);
      const brushCategoryRealtime = brushColorMode === 1 ? 1.0 : 0.0;
      updateCachedUniformValues();
      realtimeProgram.setUniform("rect", cachedRect);
      realtimeProgram.setUniform("baseTex", realtimeIntermediateBuffer);
      realtimeProgram.setUniform("addTex", newBufferBlack);
      realtimeProgram.setUniform("encodedTex", finalBuffer);
      setUniformCached(realtimeProgram, 'realtime', "brushColorMode", float(brushColorMode));
      setUniformCached(realtimeProgram, 'realtime', "whiteMaxOpacity", currentWhiteMaxOpacity);
      setUniformCached(realtimeProgram, 'realtime', "hueShift", currentHueShift);
      setUniformCached(realtimeProgram, 'realtime', "satShift", currentSatShift);
      setUniformCached(realtimeProgram, 'realtime', "briShift", currentBriShift);
      setUniformCached(realtimeProgram, 'realtime', "brushCategory", brushCategoryRealtime);
      setUniformCached(realtimeProgram, 'realtime', "useSharpen", useSharpen);
      let brushColorRGB;
      if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
        brushColorRGB = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
      } else {
        const color = colorMap[brushColorMode] || colorMap[0];
        brushColorRGB = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
      }
      realtimeProgram.setUniform("brushColor", brushColorRGB);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, width, height);
      resetShader();
      screenBuffer.end();
    }
    needsComposite = isDrawing || isCountingDown || isPlaying || isFrameRecording;
  }
}
if (typeof window !== 'undefined') {
  window.blurBuffersInitialized = window.blurBuffersInitialized || false;
}

function initializeBlurBuffers() {
  if (typeof window !== 'undefined' && window.blurBuffersInitialized) return;
  if (!window.tempBlurBuffer0) {
    window.tempBlurBuffer0 = createGraphics(width, height, P2D);
    window.tempBlurBuffer40 = createGraphics(width, height, P2D);
    window.tempBlurBuffer80 = createGraphics(width, height, P2D);
    window.tempBlurBuffer120 = createGraphics(width, height, P2D);
    if (typeof window !== 'undefined') {
      window.blurBuffersInitialized = true;
    }
  }
}

function drawCursorToBuffer() {
  const shouldShowCursor = (isDrawing || isCountingDown) && updateCount < maxUpdates && hasPath;
  const shouldShowCursorInPlayback = !isPlaying || showFuturePathPreview;
  const shouldDrawGrid = shouldShowCursor && showGridOverlay;
  if (shouldShowCursor) {
    cursorBuffer.begin();
    clear();
    push();
    translate(-hw, -hh);
    const perspectiveOffset = -10;
    translate(perspectiveOffset, perspectiveOffset);
    if (shouldDrawGrid) {
      const fallbackX = isPlaying ? simulatedMouseX : globalMouseX;
      const fallbackY = isPlaying ? simulatedMouseY : globalMouseY;
      const cx = (lastTargetX || lastTargetX === 0) ? lastTargetX : fallbackX;
      const cy = (lastTargetY || lastTargetY === 0) ? lastTargetY : fallbackY;
      const brushPxNow = lastBrushPixelSize;
      const isFlowEffect = typeof flowEffectActive !== 'undefined' && flowEffectActive;
      drawGridToBuffer(cx, cy, brushPxNow, isFlowEffect);
    }
    if (pathPoints.length > 1 && shouldShowCursorInPlayback) {
      const dashLength = 5;
      const gapLength = 5;
      stroke(255, 0, 0, 255);
      strokeWeight(1);
      drawDash = true;
      accumulatedDist = 0;
      for (let i = 0; i < pathPoints.length - 1; i++) {
        let x1 = pathPoints[i].x;
        let y1 = pathPoints[i].y;
        let x2 = pathPoints[i + 1].x;
        let y2 = pathPoints[i + 1].y;
        let segmentDist = dist(x1, y1, x2, y2);
        let dx = (x2 - x1) / segmentDist;
        let dy = (y2 - y1) / segmentDist;
        let currentDist = 0;
        while (currentDist < segmentDist) {
          let remainingInCycle = drawDash ? dashLength : gapLength;
          let distToDraw = min(remainingInCycle - accumulatedDist, segmentDist - currentDist);
          if (drawDash) {
            let startX = x1 + dx * currentDist;
            let startY = y1 + dy * currentDist;
            let endX = x1 + dx * (currentDist + distToDraw);
            let endY = y1 + dy * (currentDist + distToDraw);
            line(startX, startY, endX, endY);
          }
          currentDist += distToDraw;
          accumulatedDist += distToDraw;
          if (accumulatedDist >= (drawDash ? dashLength : gapLength)) {
            drawDash = !drawDash;
            accumulatedDist = 0;
          }
        }
      }
    }
    if (shouldShowCursorInPlayback) {
      noFill();
      stroke(255, 0, 0, 255);
      strokeWeight(1);
      ellipse(startX, startY, 0, 10);
      const currentMouseX = isPlaying ? simulatedMouseX : globalMouseX;
      const currentMouseY = isPlaying ? simulatedMouseY : globalMouseY;
      stroke(255, 0, 0, 255);
      strokeWeight(1);
      ellipse(currentMouseX, currentMouseY, 10, 10);
    }
    pop();
    cursorBuffer.end();
  }
}

// === js/sketch.js ===
let canvasWidth = window._demoCanvasWidth || 900,
  canvasHeight = window._demoCanvasHeight || 900,
  hw, hh, pixel = 1.6;
let img, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
  showGridOverlay = true,
  showFuturePathPreview = false;
let mapProgram, feedbackProgram, realtimeProgram, encodeProgram, compositeProgram, distortProgram;
let typeMapEncodeProgram;
let flowProgram;
const colorMap = getColorMap();
let colorIndex = 0,
  radColor = 0;
let brushColorMode = 0,
  whiteBrushMode = false,
  currentWhiteMaxOpacity = 0.95;
let currentHueShift = 0.0,
  currentSatShift = 0.0,
  currentBriShift = 0.0;
let customBrushColor = [26, 26, 26];
let interpolationSteps, flyBrushType, springForce, dampingForce, brushSize;
let brushAccelX, brushAccelY, brushSpeed, brushSizeNow, brushDirection, brushDir = 0;
let initialSize = 0,
  spraySize = 0,
  currentSize = 0,
  sizeThreshold = 2,
  gobalSize = 0;
let brushMode = 1,
  brushSizeMode = 'large',
  baseBrushSize = 2.0,
  brushModeSP = false;
let shapeType = 0,
  useSharpen = 0.0,
  previousUseSharpen = 0.0,
  keyBlendMode = 0;
let phasorVel = 1,
  targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
  penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
  brushPaintInterpolationOffset = 0,
  brushPaintOldRInitial = 0.5;
let flyBrush = [];
let x, y, targetX, targetY, oldX, oldY, oldR, prevTargetX = 0,
  prevTargetY = 0;
let isFirstDraw;
let globalMouseX = 0,
  globalMouseY = 0,
  lastTargetX = 0,
  lastTargetY = 0,
  lastBrushPixelSize = 20;
let isDrawing = false,
  isCountingDown = false,
  isNewStroke = false,
  strokeComplete = false;
let inkPressed = true; // master switch: false = 原本通道，true = 啟用壓力感應
let useSpectralMix = false;
Object.defineProperty(window, 'spectral', {
  get() { return useSpectralMix; },
  set(v) {
    useSpectralMix = !!v;
    console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
  }
});
let penPressure = 1.0,
  penPressureEnabled = false,
  penPressureRaw = 0.0;
let _panelBaseBrushSize = null; // 面板設定的 baseBrushSize（壓力不碰這個值）
let isMouseDownOnUIPanel = false,
  pathToggle = false,
  needsComposite = true;
let updateCount = 0,
  maxUpdates = 10,
  force = 1.0;
let mouseCount = 0,
  drawingFrameCount = 0,
  currentStrokeMouseCountStart = 0;
var doMoving = false,
  doBugs = false;
let pathPoints = [],
  pathPointsCache = null,
  startX = 0,
  startY = 0,
  hasPath = false;
let pathRotationMode = 1,
  pathRotation = 20;
let randStep = 1,
  spraySteps = 10,
  expectedStrokeLength = 100;
let allBrushStrokes = [],
  totalStrokeCount = 0,
  strokeLimit = 100;
let ctlNoise = 1.0,
  explodeStart = 0,
  explodeEnd = 0;
let drawingSeed = 0,
  indiffusionStrength = 0.3;
let seed = 1234567890,
  strokeSeed = 1234567890,
  demojson;
var currentStrokeHighlight = null;
let futurePathPreviewCache = {
  lastEventIndex: -1,
  cachedStrokes: [],
  lastUpdateTime: 0,
  updateInterval: 100
};
let distortDisplacementB = 20.0,
  distortDisplacementC = 100.0,
  distortShowFbmMask = 0.0;
let rsFrequency = 140.0,
  rsWaveSpeed = 0.5,
  rsStrength = 1.0,
  rsGradientMix = 0.5,
  rsScale = 60.0;
let cellularEnabled = false,
  cellularScale = 15.0,
  cellularSeed = 0.5;
let whiteDotEnabled = false,
  whiteDotDensity = 0.01;
let grainEnabled = false,
  grainAmount = 0.03;
var rsEnabled = false,
  distortShaderEnabled = false,
  disableFeedbackShaderForPerfTest = false;
let flowEffectActive = false;
let flowEffectBlendType = 0;
let flowEffectStartTime = 0;
let flowEffectIterationCount = 0;
let flowEffectIterationInterval = 50;
let flowEffectSeed = 0;
var flowEffectStrokeBounds = null;
let flowEffectPendingCommit = false;
let flowEffectCommitData = null;
let flowEffectFrameCount = 0;
var flowEffectTargetFrames = 0;
var flowEffectTargetIterations = 0;
let flowEffectIsPlayback = false;
const flowEffectFramesPerIteration = 3;
var flowEffectParams = {
  blendVol: 100.0,
  blendA: 0.01,
  blendB: 25.0,
  directVol: 10.0,
  snoiseVol: 3.0,
  gobalStyle: 0,
  pixD: 1.0,
  colorDeep: 0.015,
  whiteDot: 0.01,
  doBigShape: 0.0,
  doMask: 0.5,
  multiDir: 0,
  drawTime: 1,
  seed: 0.0
};
var flowEffectLastStrokeOnly = false;
let randomSeeds = [0, 0, 0, 0],
  scales = [0, 0, 0],
  amplitudes = [0, 0, 0],
  phases = [0, 0, 0];
let vortexScales = [0, 0],
  clusterScales = [0, 0],
  effect3Brightness = 0.2;
let oldBuffer, oldBufferWhite, finalBuffer, newBufferBlack, finalOut, combinedBuffer, screenBuffer;
let pingPongBuffer, cursorBuffer, paperTextureBuffer, paperFlatBuffer;
let realtimeIntermediateBuffer;
let lastStrokeBuffer;
let typeMapBuffer;
let isRecording = false,
  recordingStartTime = 0,
  currentStrokeData = null,
  lastStrokeEndTime = 0;
let recordingStrokeNumber = 0,
  accumulatedPauseTime = 0,
  isFirstStroke = true,
  record = 0;
let recordingData = {
  version: "1.0",
  startTime: 0,
  events: [],
  strokes: []
};
let isPlaying = false,
  playbackStartTime = 0,
  currentEventIndex = 0,
  playbackSpeed = 1.0;
let simulatedMouseX = 0,
  simulatedMouseY = 0,
  simulatedPMouseX = 0,
  simulatedPMouseY = 0;
let simulatedMousePressed = false,
  isWaitingToLoop = false,
  loopWaitStartTime = 0;
let countdownStartTime = 0,
  wasCountingDownLastFrame = false;
let playbackOffsetX = 0,
  playbackOffsetY = 0;
let easycam = null,
  easycamEnabled = false,
  easycamAutoTracking = false;
let easycamTrackingDamping = 0.05,
  easycamZoomDamping = 0.05;
let easycamTrackingStrokeCount = 0,
  easycamLastStrokeCount = 0;
let easycamZoomDirection = 1,
  easycamShouldZoom = false;
let easycamMinDistance = 0,
  easycamMaxDistance = 0,
  easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
  easycamResetStartCenter = [0, 0, 0],
  easycamResetTargetCenter = [0, 0, 0];
let easycamResetting = false,
  easycamResetStartTime = 0,
  easycamResetStartDistance = 0,
  easycamResetTargetDistance = 0,
  easycamResetDuration = 1000;
let layerZAnimating = false,
  layerZStartTime = 0;
let layerZStart = {
    0: 0,
    40: 0,
    80: 0,
    120: 0
  },
  layerZTarget = {
    0: 0,
    40: 40,
    80: 80,
    120: 120
  },
  layerZCurrent = {
    0: 0,
    40: 0,
    80: 0,
    120: 0
  };
let layerBlurMaxValues = {
    0: 0,
    40: 0,
    80: 0,
    120: 0
  },
  layerBlurValues = {
    0: 0,
    40: 0,
    80: 0,
    120: 0
  };
let blurAnimationStartTime = 0,
  blurAnimationDuration = 300;
let previousIsDrawing = false,
  newStrokeStartedForBlur = false;
let isFrameRecording = false,
  frameRecordingStartTime = 0,
  frameCount = 0,
  frameRecordingData = [];
let frameRecordingInterval = 1,
  frameRecordingQuality = 0.8;
let isOverlayVisible = true,
  messageHistory = [],
  maxMessages = 100,
  isDragging = false;
let dragOffset = {
    x: 0,
    y: 0
  },
  overlayPosition = {
    x: 85,
    y: 50
  };
let controlPanelDragging = false,
  controlPanelOffset = {
    x: 0,
    y: 0
  },
  controlPanelPosition = {
    x: 15,
    y: 50
  },
  controlPanelVisible = true;
let effectControlPanelDragging = false,
  effectControlPanelOffset = {
    x: 0,
    y: 0
  },
  effectControlPanelPosition = {
    x: 85,
    y: 70
  },
  effectControlPanelVisible = true;
let flowEffectPanelDragging = false,
  flowEffectPanelOffset = {
    x: 0,
    y: 0
  },
  flowEffectPanelPosition = {
    x: 85,
    y: 40
  },
  flowEffectPanelVisible = true;
let gridKmPerCell = 10;
var screenText = false,
  screenTextLines = [],
  maxScreenLines = 30,
  screenTextScroll = 0;
let screenTextX = 25,
  screenTextY = 30,
  screenTextLineHeight = 16,
  screenTextAlpha = 200,
  maxTotalLines = 200;
let pendingBugGeneration = false,
  pendingBugStrokeSeed = 0,
  pendingBugBounds = null;
let pendingEffectControlScanQueue = [];

function preload() {
  font = loadFont('./lib/inconsolata.otf');
  feedbackProgram = __bundledLoadShader('./shaders/base.vert', './shaders/feedback.frag');
  realtimeProgram = __bundledLoadShader('./shaders/base.vert', './shaders/realtime.frag');
  mapProgram = __bundledLoadShader('./shaders/base.vert', './shaders/mapFrag.frag');
  if (typeof doEffect === 'undefined' || doEffect !== false) {
    distortProgram = __bundledLoadShader('./shaders/base.vert', './shaders/distort.frag');
  }
  try {
    window.metallicProgram = __bundledLoadShader('./shaders/base.vert', './shaders/metallic.frag');
  } catch (e) {
    console.warn('⚠️ Metallic shader 加載失敗:', e);
  }
  try {
    flowProgram = __bundledLoadShader('./shaders/base.vert', './shaders/flow.frag');
  } catch (e) {
    console.warn('⚠️ Flow shader 加載失敗:', e);
  }
  loadAllShaders();
  if (doDemo) {
    logArtSeparator('🎬 Loading Demo Recording');
    if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
      demojson = window._preloadedDemo;
      recordingData = demojson;
      window._pendingAutoPlay = true;
    } else {
      var demoFile = './lib/demo.json';
      var hashId = window.location.hash.replace('#', '');
      if (/^[1-9]\d*$/.test(hashId)) {
        demoFile = './lib/' + hashId + '.json';
      }
      fetch(demoFile)
        .then(response => {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(data => {
          demojson = data;
          if (demojson && demojson.events && demojson.events.length > 0) {
            recordingData = demojson;
            if (window._setupComplete) {
              startPlayback();
            } else {
              window._pendingAutoPlay = true;
            }
          }
        })
        .catch(error => {
          logArt('system', '❌ Failed to load ' + demoFile, {
            Error: error.message,
            Status: 'Error'
          });
        });
    }
  }
  const pendingLoadedRecordingData = sessionStorage.getItem('pendingLoadedRecordingData');
  const pendingLoadedRecordingFileName = sessionStorage.getItem('pendingLoadedRecordingFileName');
  if (pendingLoadedRecordingData) {
    try {
      const loadedData = JSON.parse(pendingLoadedRecordingData);
      if (loadedData && loadedData.events && loadedData.events.length > 0) {
        if (typeof window !== 'undefined') {
          window.loadedRecordingData = loadedData;
          window.loadedRecordingFileName = pendingLoadedRecordingFileName || 'Unknown';
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to restore loaded recording data:', error);
    }
  }
  const pendingRecordingData = sessionStorage.getItem('pendingRecordingData');
  const shouldAutoPlay = sessionStorage.getItem('shouldAutoPlay');
  if (pendingRecordingData && shouldAutoPlay === 'true') {
    try {
      const loadedData = JSON.parse(pendingRecordingData);
      if (loadedData && loadedData.events && loadedData.events.length > 0) {
        recordingData = loadedData;
        sessionStorage.removeItem('pendingRecordingData');
        sessionStorage.removeItem('shouldAutoPlay');
        logArtSeparator('📂 Recording Data Restored After Reload');
        logArt('system', '✅ Canvas size restored and recording loaded', {
          CanvasSize: `${width}x${height}`,
          Events: `${recordingData.events.length} events`
        });
        if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
          if (typeof canvasBackgroundColor !== 'undefined') {
            canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
            canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
            canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
          }
          logArt('system', '🎨 Background color restored from recording', {
            RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
          });
        }
        window._pendingAutoPlay = true;
      }
    } catch (error) {
      logArt('system', '❌ Failed to restore recording data', {
        Error: error.message,
        Status: 'Error'
      });
      sessionStorage.removeItem('pendingRecordingData');
      sessionStorage.removeItem('shouldAutoPlay');
    }
  }
}

function setup() {
  strokeSeed = seed;
  randomSeed(seed);
  noiseSeed(seed);
  const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  const isMobilePhone = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
  const pixMatch = (window.location.search || '').match(/_pix:([\d.]+)/);
  if (pixMatch) {
    const urlPixel = parseFloat(pixMatch[1]);
    if (!isNaN(urlPixel) && urlPixel >= 0.5 && urlPixel <= 5) {
      pixel = urlPixel;
      logArt('system', '🔗 Pixel density from URL', {
        Value: urlPixel
      });
    }
  } else if (window.APP_MODE === 'collector') {
    pixel = 2;
    logArt('system', '🎨 Collector mode default pixel density', {
      Value: 2
    });
  } else if (isMobileDevice) {
    const mobilePixel = 1.0;
    if (pixel > mobilePixel) {
      pixel = mobilePixel;
      logArt('system', '📱 Mobile pixel density override', {
        Value: mobilePixel,
        Mode: window.APP_MODE || 'artist'
      });
    }
  }
  const pendingPixelDensity = sessionStorage.getItem('pendingPixelDensity');
  if (pendingPixelDensity && !isMobileDevice && !pixMatch) {
    const newPixel = parseInt(pendingPixelDensity);
    if (!isNaN(newPixel) && newPixel >= 1 && newPixel <= 5) {
      pixel = newPixel;
      sessionStorage.removeItem('pendingPixelDensity');
      logArt('system', '🔄 Restoring pixel density from session', {
        Value: newPixel,
        Status: 'Canvas will be created with new pixel density'
      });
    }
  }
  pixelDensity(pixel);
  const pendingCanvasWidth = sessionStorage.getItem('pendingCanvasWidth');
  const pendingCanvasHeight = sessionStorage.getItem('pendingCanvasHeight');
  let usedPendingCanvasSize = false;
  if (pendingCanvasWidth && pendingCanvasHeight) {
    canvasWidth = parseInt(pendingCanvasWidth);
    canvasHeight = parseInt(pendingCanvasHeight);
    usedPendingCanvasSize = true;
    sessionStorage.removeItem('pendingCanvasWidth');
    sessionStorage.removeItem('pendingCanvasHeight');
    logArt('system', '🔄 Restoring canvas size from recording', {
      Width: `${canvasWidth}px`,
      Height: `${canvasHeight}px`
    });
  }
  // URL 參數 ?_w:800_h:300 設定畫布尺寸（優先級最高）
  let urlHasCanvasW = false,
    urlHasCanvasH = false;
  (function() {
    var qs = window.location.search;
    if (!qs) return;
    var parts = qs.substring(1).split('_');
    for (var i = 0; i < parts.length; i++) {
      var ci = parts[i].indexOf(':');
      if (ci === -1) continue;
      var k = parts[i].substring(0, ci), v = parseInt(parts[i].substring(ci + 1));
      if (k === 'w' && v > 0) {
        canvasWidth = v;
        urlHasCanvasW = true;
      }
      if (k === 'h' && v > 0) {
        canvasHeight = v;
        urlHasCanvasH = true;
      }
    }
  })();
  if (isMobilePhone && window.APP_MODE === 'artist' && !usedPendingCanvasSize) {
    if (!urlHasCanvasW) canvasWidth = 380;
    if (!urlHasCanvasH) canvasHeight = 600;
    if (!urlHasCanvasW || !urlHasCanvasH) {
      logArt('system', '📱 Mobile phone default canvas size', {
        Width: `${canvasWidth}px`,
        Height: `${canvasHeight}px`
      });
    }
  }
  const pendingCanvasBackgroundColor = sessionStorage.getItem('pendingCanvasBackgroundColor');
  if (pendingCanvasBackgroundColor) {
    try {
      const bgColor = JSON.parse(pendingCanvasBackgroundColor);
      if (Array.isArray(bgColor) && bgColor.length === 3) {
        canvasBackgroundColor[0] = bgColor[0];
        canvasBackgroundColor[1] = bgColor[1];
        canvasBackgroundColor[2] = bgColor[2];
        sessionStorage.removeItem('pendingCanvasBackgroundColor');
        logArt('system', '🔄 Restoring canvas background color from recording', {
          RGB: `(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`
        });
      }
    } catch (error) {
      console.warn('Failed to restore canvas background color:', error);
      sessionStorage.removeItem('pendingCanvasBackgroundColor');
    }
  }
  createCanvas(canvasWidth, canvasHeight, WEBGL);
  // Apple Pencil / stylus pressure support via Pointer Events
  // 只有 inkPressed=true 時才掛監聽，false 時完全不介入
  if (inkPressed) {
    const canvasElt = document.querySelector('canvas');
    if (canvasElt) {
      const zenBtn = document.getElementById('zen-mode-btn');
      const updateZenBarColor = (pressure) => {
        if (!zenBtn) return;
        if (pressure <= 0) {
          zenBtn.style.background = 'rgba(0, 0, 0, 0.08)';
        } else {
          // 0→透明, 1→紅色，按鈕整個背景填色
          const r = Math.round(pressure * 255);
          const a = Math.max(0.2, pressure);
          zenBtn.style.background = `rgba(${r}, 0, 0, ${a})`;
        }
      };
      // 方案一：Pointer Events（標準 API）
      const handlePressure = (e) => {
        if (e.pointerType === 'pen' && e.pressure > 0) {
          if (!penPressureEnabled) {
            penPressureEnabled = true;
            logArt('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
          }
          penPressureRaw = e.pressure;
          penPressure = Math.min(e.pressure / 0.3, 1.0); // force 0~0.3 → 0~1, >0.3 = 1.0
          updateZenBarColor(e.pressure);
        }
      };
      canvasElt.addEventListener('pointerdown', handlePressure);
      canvasElt.addEventListener('pointermove', handlePressure);
      canvasElt.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'pen' || penPressureEnabled) {
          penPressureRaw = 0.0;
          penPressure = -1; // -1 = 筆已放開，draw loop 不動 baseBrushSize
          updateZenBarColor(0);
        }
      });
      // Touch Events force — iPad Safari Apple Pencil 壓力來源
      // 實測範圍：min=0.0006 max=0.9305，直接作為 0~1 使用
      const handleTouchForce = (e) => {
        if (e.touches && e.touches.length > 0) {
          const t = e.touches[0];
          const isStylus = t.touchType === 'stylus';
          if (isStylus && t.force > 0) {
            const normalizedForce = Math.min(t.force, 1.0);
            if (!penPressureEnabled) {
              penPressureEnabled = true;
              logArt('system', '🖊️ Stylus force detected', { force: t.force });
            }
            penPressureRaw = normalizedForce;
            penPressure = Math.min(normalizedForce / 0.3, 1.0); // force 0~0.3 → 0~1, >0.3 = 1.0
            updateZenBarColor(normalizedForce);
          }
        }
      };
      canvasElt.addEventListener('touchstart', handleTouchForce, { passive: true });
      canvasElt.addEventListener('touchmove', handleTouchForce, { passive: true });
      canvasElt.addEventListener('touchend', () => {
        if (penPressureEnabled) {
          penPressureRaw = 0.0;
          penPressure = -1; // -1 = 筆已放開，draw loop 不動 baseBrushSize
          updateZenBarColor(0);
        }
      }, { passive: true });
    }
  }
  img = createFramebuffer({
    density: pixel
  });
  window.metallicStrength = 0.85;
  window.metallicFlowSpeed = 1.0;
  window.metallicSpecular = 12.0;
  window.metallicFresnel = 0.5;
  window.bugsSize = 10.0;
  window.metallicLightX = 0.5;
  window.metallicLightY = 0.3;
  window.metallicTint = [0.72, 0.50, 0.35];
  if (typeof loadPanelPositions === 'function') loadPanelPositions();
  if (typeof loadPanelVisibility === 'function') loadPanelVisibility();
  initializeOverlay();
  initializeBrushControlPanel();
  if (typeof window.scheduleMobilePhoneZenMode === 'function') {
    window.scheduleMobilePhoneZenMode();
  }
  if (typeof updateCanvasSizeDisplay === 'function') {
    updateCanvasSizeDisplay();
  }
  updateReferenceImageSize();
  window.addEventListener('resize', function() {
    setTimeout(updateReferenceImageSize, 100);
  });
  logArtSeparator('Interactive Generative Art System');
  oldBuffer = createFramebuffer({
    density: pixel
  });
  oldBuffer.begin();
  background(255);
  oldBuffer.end();
  oldBufferWhite = createGraphics(width, height, WEBGL);
  oldBufferWhite.noStroke();
  oldBufferWhite.pixelDensity(pixel);;
  oldBufferWhite.clear();
  finalBuffer = createFramebuffer({
    density: pixel
  });
  finalBuffer.begin();
  background(255);
  finalBuffer.end();
  newBufferBlack = createFramebuffer({
    density: pixel
  });
  newBufferBlack.begin();
  background(255);
  newBufferBlack.end();
  finalOut = createFramebuffer({
    density: pixel
  });
  combinedBuffer = createGraphics(width, height, WEBGL);
  combinedBuffer.noStroke();
  combinedBuffer.pixelDensity(pixel);;
  combinedBuffer.clear();
  paperTextureBuffer = createFramebuffer({
    density: pixel
  });
  let paperTexture = createPaperTexture(40, 20, 15, 0.2);
  const fillR = min(255, canvasBackgroundColor[0] * 1.1);
  const fillG = min(255, canvasBackgroundColor[1] * 1.1);
  const fillB = min(255, canvasBackgroundColor[2] * 1.1);
  paperTextureBuffer.begin();
  clear();
  noStroke();
  fill(fillR, fillG, fillB);
  rect(-width / 2, -height / 2, width, height);
  blendMode(MULTIPLY);
  image(paperTexture, -width / 2, -height / 2, width, height);
  paperTextureBuffer.end();
  paperTexture.remove();
  paperFlatBuffer = createFramebuffer({
    density: pixel
  });
  paperFlatBuffer.begin();
  background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
  paperFlatBuffer.end();
  screenBuffer = createFramebuffer({
    density: pixel
  });
  typeMapBuffer = createFramebuffer({
    density: pixel
  });
  typeMapBuffer.begin();
  background(0);
  typeMapBuffer.end();
  pingPongBuffer = createFramebuffer({
    density: pixel
  });
  realtimeIntermediateBuffer = createFramebuffer({
    density: pixel
  });
  cursorBuffer = createFramebuffer({
    density: pixel
  });
  lastStrokeBuffer = createFramebuffer({
    density: pixel
  });
  lastStrokeBuffer.begin();
  background(255);
  lastStrokeBuffer.end();
  if (typeof window.tempMetallicBuffer === 'undefined') {
    window.tempMetallicBuffer = createFramebuffer({
      density: pixel
    });
  }
  img.begin();
  background(255, 255, 255);
  img.end();
  background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
  hw = width * 0.5;
  hh = height * 0.5;
  simulatedMouseX = hw;
  simulatedMouseY = hh;
  simulatedPMouseX = hw;
  simulatedPMouseY = hh;
  drawMap();
  interpolationSteps = 10;
  spraySteps = 2;
  springForce = 0.5;
  dampingForce = 0.5;
  flyBrushType = 0;
  brushSize = 20;
  x = y = brushAccelX = brushAccelY = brushSpeed = brushSizeNow = isFirstDraw = 0;
  targetX = hw;
  targetY = hh;
  brushDirection = 0;
  initializePlaybackEnvironment();
  initializePlaybackSystem();
  initializeEasyCam();
  generateRandomForceMap();
  window.addEventListener('mouseup', function(e) {
    if (isDrawing && !isPlaying) {
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        const bounds = canvasEl.getBoundingClientRect();
        const isOutside = e.clientX < bounds.left || e.clientX > bounds.right ||
          e.clientY < bounds.top || e.clientY > bounds.bottom;
        if (isOutside) {
          logArt('system', '🖱️ Mouse released outside canvas', {
            ClientX: e.clientX,
            ClientY: e.clientY
          });
          if (!isCountingDown) {
            isCountingDown = true;
            updateCount = 0;
          }
        }
      }
    }
  });
  document.addEventListener('mousedown', function(e) {
    isMouseDownOnUIPanel = isMouseOverUIPanel(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', function(e) {
    isMouseDownOnUIPanel = false;
  });
  document.addEventListener('mousemove', function(e) {
    if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
      globalMouseX = point2(mouseX);
      globalMouseY = point2(mouseY);
    } else {
      const canvasEl = document.querySelector('canvas');
      if (!canvasEl) return;
      const bounds = canvasEl.getBoundingClientRect();
      const relativeX = (e.clientX - bounds.left) / bounds.width;
      const relativeY = (e.clientY - bounds.top) / bounds.height;
      globalMouseX = point2(relativeX * width);
      globalMouseY = point2(relativeY * height);
    }
  });
  window._setupComplete = true;
  window.dispatchEvent(new Event('canvasReady'));
  if (window._pendingAutoPlay) {
    window._pendingAutoPlay = false;
    // 300ms：必須在 applyPanelState（200ms）之後，讓 JSON 的 initialFlowEffect 能正確覆蓋非 URL 指定的參數
    setTimeout(() => {
      startPlayback();
    }, 300);
  }
}

function checkPerformance() {
  if (!performanceMonitor.enabled) return;
  performanceMonitor.frameCount++;
  let currentFrameRate = 60;
  const now = millis();
  if (performanceMonitor.lastFrameTime > 0) {
    const deltaTime = now - performanceMonitor.lastFrameTime;
    if (deltaTime > 0 && deltaTime < 1000) {
      currentFrameRate = 1000 / deltaTime;
      currentFrameRate = Math.max(1, Math.min(120, currentFrameRate));
    }
  } else {
    try {
      const targetFrameRate = frameRate();
      if (!isNaN(targetFrameRate) && targetFrameRate > 0) {
        currentFrameRate = targetFrameRate;
      }
    } catch (e) {}
  }
  performanceMonitor.lastFrameTime = now;
  performanceMonitor._pushFR(currentFrameRate);
  if (performanceMonitor.frameCount - performanceMonitor.lastCheckFrame >= performanceMonitor.checkInterval) {
    performanceMonitor.lastCheckFrame = performanceMonitor.frameCount;
    const avgFrameRate = performanceMonitor._frLen > 0 ?
      performanceMonitor._avgFR() :
      currentFrameRate;
    if (performanceMonitor.logFpsToConsole) {
      console.log('FPS:', avgFrameRate.toFixed(1));
    }
    const tolerance = 0.1;
    const shouldTrigger = avgFrameRate <= (performanceMonitor.frameRateThreshold + tolerance);
    if (shouldTrigger) {
      const now = millis();
      if (now - performanceMonitor.lastPerformanceLog > performanceMonitor.logCooldown) {
        performanceMonitor.lastPerformanceLog = now;
        analyzePerformanceBottleneck(avgFrameRate);
      } else {
        console.log('[性能监控] 跳过记录（冷却中，剩余:', ((performanceMonitor.logCooldown - (now - performanceMonitor.lastPerformanceLog)) / 1000).toFixed(1), '秒)');
      }
    }
  }
}

function analyzePerformanceBottleneck(avgFrameRate) {
  const acc = performanceMonitor.performanceDataAccumulated;
  const sampleCount = acc.sampleCount > 0 ? acc.sampleCount : 1;
  if (sampleCount === 0 || acc.drawTotal === 0) {
    const singleData = performanceMonitor.performanceData;
    const totalTime = singleData.drawTotal > 0 ? singleData.drawTotal : 1;
    const report = {
      '平均帧率': `${avgFrameRate.toFixed(1)} fps`,
      '目标帧率': `${performanceMonitor.frameRateThreshold} fps`,
      '帧时间': `${(1000 / avgFrameRate).toFixed(2)} ms`,
      '状态': '性能数据不足，但帧率低于阈值',
      '画布尺寸': `${canvasWidth}x${canvasHeight}`,
      'Pixel Density': pixel
    };
    const stateInfo = {
      '正在绘制': isDrawing ? '是' : '否',
      '正在播放': isPlaying ? '是' : '否',
      '倒计时中': isCountingDown ? '是' : '否',
      'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
      'EasyCam 启用': easycamEnabled ? '是' : '否',
      '笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
    };
    logArt('system', '⚠️ 性能警告：帧率低于阈值', {
      ...report,
      ...stateInfo
    });
    return;
  }
  const data = {
    drawTotal: acc.drawTotal / sampleCount,
    updatePlayback: acc.updatePlayback / sampleCount,
    updateCompositeBuffer: acc.updateCompositeBuffer / sampleCount,
    updateEasyCamAutoTracking: acc.updateEasyCamAutoTracking / sampleCount,
    drawCursorToBuffer: acc.drawCursorToBuffer / sampleCount,
    updateBlurEffect: acc.updateBlurEffect / sampleCount,
    applyCameraProjection: acc.applyCameraProjection / sampleCount,
    drawLayersWithBlur: acc.drawLayersWithBlur / sampleCount,
    other: acc.other / sampleCount
  };
  const totalTime = data.drawTotal > 0 ? data.drawTotal : 1;
  const bottlenecks = [];
  const threshold = totalTime * 0.1;
  if (data.updatePlayback > threshold) {
    bottlenecks.push({
      name: 'updatePlayback',
      time: data.updatePlayback.toFixed(2),
      percent: ((data.updatePlayback / totalTime) * 100).toFixed(1)
    });
  }
  if (data.updateCompositeBuffer > threshold) {
    bottlenecks.push({
      name: 'updateCompositeBuffer',
      time: data.updateCompositeBuffer.toFixed(2),
      percent: ((data.updateCompositeBuffer / totalTime) * 100).toFixed(1)
    });
  }
  if (data.updateEasyCamAutoTracking > threshold) {
    bottlenecks.push({
      name: 'updateEasyCamAutoTracking',
      time: data.updateEasyCamAutoTracking.toFixed(2),
      percent: ((data.updateEasyCamAutoTracking / totalTime) * 100).toFixed(1)
    });
  }
  if (data.drawCursorToBuffer > threshold) {
    bottlenecks.push({
      name: 'drawCursorToBuffer',
      time: data.drawCursorToBuffer.toFixed(2),
      percent: ((data.drawCursorToBuffer / totalTime) * 100).toFixed(1)
    });
  }
  if (data.updateBlurEffect > threshold) {
    bottlenecks.push({
      name: 'updateBlurEffect',
      time: data.updateBlurEffect.toFixed(2),
      percent: ((data.updateBlurEffect / totalTime) * 100).toFixed(1)
    });
  }
  if (data.applyCameraProjection > threshold) {
    bottlenecks.push({
      name: 'applyCameraProjection',
      time: data.applyCameraProjection.toFixed(2),
      percent: ((data.applyCameraProjection / totalTime) * 100).toFixed(1)
    });
  }
  if (data.drawLayersWithBlur > threshold) {
    bottlenecks.push({
      name: 'drawLayersWithBlur',
      time: data.drawLayersWithBlur.toFixed(2),
      percent: ((data.drawLayersWithBlur / totalTime) * 100).toFixed(1)
    });
  }
  if (data.other > threshold) {
    bottlenecks.push({
      name: 'other',
      time: data.other.toFixed(2),
      percent: ((data.other / totalTime) * 100).toFixed(1)
    });
  }
  const report = {
    '平均帧率': `${avgFrameRate.toFixed(1)} fps`,
    '目标帧率': `${performanceMonitor.frameRateThreshold} fps`,
    '帧时间': `${(1000 / avgFrameRate).toFixed(2)} ms`,
    '总耗时': `${totalTime.toFixed(2)} ms`,
    '样本数量': sampleCount,
    '画布尺寸': `${canvasWidth}x${canvasHeight}`,
    'Pixel Density': pixel
  };
  const stateInfo = {
    '正在绘制': isDrawing ? '是' : '否',
    '正在播放': isPlaying ? '是' : '否',
    '倒计时中': isCountingDown ? '是' : '否',
    'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
    'EasyCam 启用': easycamEnabled ? '是' : '否',
    '笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
  };
  if (bottlenecks.length > 0) {
    report['性能瓶颈'] = bottlenecks.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
  } else {
    report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
  }
  const suggestions = [];
  if (data.drawLayersWithBlur > threshold) {
    suggestions.push('考虑禁用 shader 效果（doEffect = false）');
  }
  if (data.updateCompositeBuffer > threshold) {
    suggestions.push('检查是否需要优化 composite buffer 更新频率');
  }
  if (canvasWidth * canvasHeight > 1500000) {
    suggestions.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
  }
  if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 100) {
    suggestions.push('笔画数量较多，考虑清理旧笔画');
  }
  if (suggestions.length > 0) {
    report['优化建议'] = suggestions.join('; ');
  }
  logArt('system', '⚠️ 性能警告：帧率低于 30 fps', {
    ...report,
    ...stateInfo
  });
  Object.keys(performanceMonitor.performanceData).forEach(key => {
    performanceMonitor.performanceData[key] = 0;
  });
  Object.keys(performanceMonitor.performanceDataAccumulated).forEach(key => {
    performanceMonitor.performanceDataAccumulated[key] = 0;
  });
}
let _perfSampleCounter = 0;
const _PERF_SAMPLE_INTERVAL = 5;

function draw() {
  // fxhash debug: 追蹤總幀數和 fps
  if (!window._fxDebug) {
    window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
  }
  window._fxDebug.totalFrames++;
  if (window._fxDebug.totalFrames % 60 === 0) {
    window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
  }
  const shouldMeasure = (++_perfSampleCounter % _PERF_SAMPLE_INTERVAL === 0);
  const drawStartTime = shouldMeasure ? performance.now() : 0;
  background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
  if (markedDarkPoints.length > 0 && typeof window.metallicLightX !== 'undefined') {
    let t = millis() * 0.0001;
    window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
    window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
  }
  let opStartTime = shouldMeasure ? performance.now() : 0;
  if (isPlaying) {
    updatePlayback();
  }
  if (shouldMeasure) performanceMonitor.performanceData.updatePlayback += performance.now() - opStartTime;
  handleEasyCamReset();
  if (needsComposite || isDrawing || isCountingDown || isPlaying || isFrameRecording) {
    if (shouldMeasure) opStartTime = performance.now();
    updateCompositeBuffer();
    if (shouldMeasure) performanceMonitor.performanceData.updateCompositeBuffer += performance.now() - opStartTime;
  }
  if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
    initializeBlurBuffers();
  }
  if (shouldMeasure) opStartTime = performance.now();
  updateEasyCamAutoTracking();
  if (shouldMeasure) performanceMonitor.performanceData.updateEasyCamAutoTracking += performance.now() - opStartTime;
  if (shouldMeasure) opStartTime = performance.now();
  drawCursorToBuffer();
  if (shouldMeasure) performanceMonitor.performanceData.drawCursorToBuffer += performance.now() - opStartTime;
  updateLayerZAnimation();
  if (shouldMeasure) opStartTime = performance.now();
  updateBlurEffect();
  if (shouldMeasure) performanceMonitor.performanceData.updateBlurEffect += performance.now() - opStartTime;
  if (shouldMeasure) opStartTime = performance.now();
  applyCameraProjection();
  if (shouldMeasure) performanceMonitor.performanceData.applyCameraProjection += performance.now() - opStartTime;
  if (shouldMeasure) opStartTime = performance.now();
  drawLayersWithBlur();
  if (shouldMeasure) performanceMonitor.performanceData.drawLayersWithBlur += performance.now() - opStartTime;
  updateFlowEffect();
  // fxhash debug: 更新數據（每幀）+ 畫在 screenBuffer + 螢幕 overlay
  if (fxhashDebugMode && window._fxContext && window._fxDebug) {
    var d = window._fxDebug;
    if (d.totalFrames % 60 === 0) {
      d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
    }
    var _dbgStr = 'ctx=' + window._fxContext +
      ' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
      ' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
      ' fps=' + d.avgFps +
      ' play=' + (typeof isPlaying !== 'undefined' ? isPlaying : '?') +
      ' evt=' + (typeof currentEventIndex !== 'undefined' ? currentEventIndex : '?');
    // 1) 畫到 screenBuffer（fxhash capture 用）
    screenBuffer.begin();
    if (font) textFont(font);
    textSize(7);
    textAlign(LEFT, TOP);
    noStroke();
    fill(255, 0, 0, 220);
    rectMode(CORNER);
    rect(-width/2, -height/2, width, 14);
    fill(255);
    text(_dbgStr, -width/2 + 4, -height/2 + 3);
    screenBuffer.end();
    // 2) 螢幕可見的 2D canvas overlay（蓋在 WebGL canvas 上方）
    if (d.totalFrames % 10 === 0) {
      var _webgl = document.getElementById('defaultCanvas0');
      var _ovr = document.getElementById('_fxDbgOvr');
      if (!_ovr && _webgl) {
        _ovr = document.createElement('canvas');
        _ovr.id = '_fxDbgOvr';
        _ovr.width = _webgl.offsetWidth;
        _ovr.height = 24;
        _ovr.style.position = 'fixed';
        _ovr.style.top = _webgl.offsetTop + 'px';
        _ovr.style.left = _webgl.offsetLeft + 'px';
        _ovr.style.zIndex = '2147483647';
        _ovr.style.pointerEvents = 'none';
        document.body.appendChild(_ovr);
      }
      if (_ovr) {
        var _oc = _ovr.getContext('2d');
        _oc.clearRect(0, 0, _ovr.width, _ovr.height);
        _oc.fillStyle = 'rgba(200,0,0,0.85)';
        _oc.fillRect(0, 0, _ovr.width, 22);
        _oc.font = 'bold 13px monospace';
        _oc.fillStyle = '#fff';
        _oc.fillText(_dbgStr, 6, 16);
      }
    }
  }
  // fxhash capture：在 draw() 幀內從 screenBuffer（framebuffer）讀取完整 composite 像素
  if (window._fxCapturePhase === 1) {
    window._fxCapturePhase = 2;
    try {
      var cap2d = document.getElementById('fxhash-capture-canvas');
      var webglCanvas = document.getElementById('defaultCanvas0');
      if (cap2d && typeof screenBuffer !== 'undefined') {
        var fbImg = screenBuffer.get();
        cap2d.width = fbImg.width;
        cap2d.height = fbImg.height;
        var ctx2d = cap2d.getContext('2d');
        ctx2d.drawImage(fbImg.canvas, 0, 0);
        if (typeof fbImg.remove === 'function') fbImg.remove();
        // 顯示 2D canvas，隱藏 WebGL canvas
        if (webglCanvas) {
          cap2d.style.cssText = webglCanvas.style.cssText;
          webglCanvas.style.visibility = 'hidden';
        }
        cap2d.style.position = 'absolute';
        cap2d.style.top = (webglCanvas ? webglCanvas.offsetTop : 0) + 'px';
        cap2d.style.left = (webglCanvas ? webglCanvas.offsetLeft : 0) + 'px';
        cap2d.style.zIndex = '99999';
        cap2d.style.visibility = 'visible';
        cap2d.style.border = 'none';
        cap2d.style.outline = 'none';
        console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + cap2d.width + 'x' + cap2d.height + ')');
        // DEBUG: 在 capture canvas 上畫 debug 資訊
        if (fxhashDebugMode && window._fxDebug) {
          var d = window._fxDebug;
          d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
          var lines = [
            'ctx=' + (window._fxContext || 'null'),
            'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
            'frames=' + d.totalFrames,
            'fb=' + d.feedbackFrames,
            'fps=' + d.avgFps,
            'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
            'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
          ];
          ctx2d.save();
          ctx2d.fillStyle = 'rgba(0,0,0,0.7)';
          ctx2d.fillRect(10, 10, 280, lines.length * 22 + 10);
          ctx2d.font = '16px monospace';
          ctx2d.fillStyle = '#0f0';
          for (var li = 0; li < lines.length; li++) {
            ctx2d.fillText(lines[li], 18, 30 + li * 22);
          }
          ctx2d.restore();
        }
        setTimeout(function() {
          console.log('[fxhash] Phase 2: calling $fx.preview()');
          if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
            $fx.preview();
          }
        }, 500);
      } else {
        // fallback: 直接從 webgl canvas 複製
        if (webglCanvas && cap2d) {
          cap2d.width = webglCanvas.width;
          cap2d.height = webglCanvas.height;
          var ctx2d = cap2d.getContext('2d');
          ctx2d.drawImage(webglCanvas, 0, 0);
          if (webglCanvas) webglCanvas.style.visibility = 'hidden';
          cap2d.style.visibility = 'visible';
          cap2d.style.zIndex = '99999';
          cap2d.style.border = 'none';
          console.log('[fxhash] Phase 1 (fallback): webgl canvas copied');
          setTimeout(function() {
            if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
              $fx.preview();
            }
          }, 500);
        }
      }
    } catch(e) {
      console.error('[fxhash] capture failed:', e);
      if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
        $fx.preview();
      }
    }
  }
  if (shouldMeasure) {
    const drawEndTime = performance.now();
    const measuredTime = performanceMonitor.performanceData.updatePlayback +
      performanceMonitor.performanceData.updateCompositeBuffer +
      performanceMonitor.performanceData.updateEasyCamAutoTracking +
      performanceMonitor.performanceData.drawCursorToBuffer +
      performanceMonitor.performanceData.updateBlurEffect +
      performanceMonitor.performanceData.applyCameraProjection +
      performanceMonitor.performanceData.drawLayersWithBlur;
    performanceMonitor.performanceData.other = (drawEndTime - drawStartTime) - measuredTime;
    performanceMonitor.performanceData.drawTotal = drawEndTime - drawStartTime;
    performanceMonitor.performanceDataAccumulated.drawTotal += performanceMonitor.performanceData.drawTotal;
    performanceMonitor.performanceDataAccumulated.updatePlayback += performanceMonitor.performanceData.updatePlayback;
    performanceMonitor.performanceDataAccumulated.updateCompositeBuffer += performanceMonitor.performanceData.updateCompositeBuffer;
    performanceMonitor.performanceDataAccumulated.updateEasyCamAutoTracking += performanceMonitor.performanceData.updateEasyCamAutoTracking;
    performanceMonitor.performanceDataAccumulated.drawCursorToBuffer += performanceMonitor.performanceData.drawCursorToBuffer;
    performanceMonitor.performanceDataAccumulated.updateBlurEffect += performanceMonitor.performanceData.updateBlurEffect;
    performanceMonitor.performanceDataAccumulated.applyCameraProjection += performanceMonitor.performanceData.applyCameraProjection;
    performanceMonitor.performanceDataAccumulated.drawLayersWithBlur += performanceMonitor.performanceData.drawLayersWithBlur;
    performanceMonitor.performanceDataAccumulated.other += performanceMonitor.performanceData.other;
    performanceMonitor.performanceDataAccumulated.sampleCount++;
  }
  checkPerformance();
  if (isPlaying) {
    if (isCountingDown && !wasCountingDownLastFrame) {
      countdownStartTime = millis();
      wasCountingDownLastFrame = true;
      if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
    } else if (!isCountingDown && wasCountingDownLastFrame) {
      const countdownDuration = millis() - countdownStartTime;
      const oldPlaybackStartTime = playbackStartTime;
      playbackStartTime += countdownDuration;
      wasCountingDownLastFrame = false;
      if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${countdownDuration.toFixed(0)}ms`);
      if (currentEventIndex < recordingData.events.length) {
        const nextEvent = recordingData.events[currentEventIndex];
        const nextEventType = nextEvent.m || nextEvent.type;
        const isNextMousePressed = nextEventType === 'mp' || nextEventType === 'mousePressed';
        const nextEventTime = nextEvent.t !== undefined ? nextEvent.t : nextEvent.time;
        const currentTime2 = (millis() - playbackStartTime) * playbackSpeed;
        const timeDiff = nextEventTime - currentTime2;
        if (isNextMousePressed || timeDiff <= 0 || timeDiff < 100) {
          if (window.DEBUG_MODE && isNextMousePressed) {
            console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${timeDiff.toFixed(0)}ms`);
          }
          simulateEvent(nextEvent);
          currentEventIndex++;
        }
      }
    }
  }
  const isActivelyDrawing = isPlaying ? simulatedMousePressed : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && isDrawing));
  const isDrawingNow = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? isActivelyDrawing : (isActivelyDrawing && currentSize > 0);
  const isMouseInCanvas = isPlaying || (globalMouseX >= 0 && globalMouseX < width && globalMouseY >= 0 && globalMouseY < height) || (isDrawing && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
  if (typeof window.drawLoopCount === 'undefined') {
    window.drawLoopCount = 0;
    window.drawLoopCheckpoints = [];
  }
  if (isDrawingNow && isMouseInCanvas) {
    window.drawLoopCount++;
    if (mouseCount === 0) {
      crandomDebugger.checkpoint('draw_首次進入', 'draw');
    }
    mouseCount++;
    let currentMouseX, currentMouseY;
    if (isPlaying) {
      currentMouseX = simulatedMouseX;
      currentMouseY = simulatedMouseY;
    } else {
      currentMouseX = globalMouseX;
      currentMouseY = globalMouseY;
    }
    if (mouseCount % 2 === 0 && hasPath) {
      pathPoints.push({
        x: currentMouseX,
        y: currentMouseY
      });
    }
    const radColorSeed = strokeSeed + mouseCount * 100000000;
    randomSeed(radColorSeed);
    if (brushMode === 3) {
      let rand1 = crandom.random(0, 1);
      let rand2 = crandom.random(150, 250);
      let rad2 = rand1 > 0.1 ? noise(currentMouseX * 0.01, currentMouseY * 0.01) * 150 : rand2;
      radColor = (radColor * 0.3) + (rad2 * 0.7);
    } else {
      let rand1 = crandom.random(0, 1);
      let rand2 = crandom.random(20, 50);
      let rad2 = rand1 > 0.3 ? noise(currentMouseX * 0.01, currentMouseY * 0.01) * 10 : rand2;
      radColor = (radColor * 0.6) + (rad2 * 0.4);
    }
    currentSize -= randStep;
    currentSize = max(1, currentSize);
    brushSize = currentSize;
    if (inkPressed && mouseCount >= 8) {
      // 壓力感應模式：mouseCount >= 8 後才套用，避免筆觸開頭 fadeIn 被 swFloor 覆蓋產生大圓
      const rawForce = isPlaying ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : penPressureRaw;
      const prevBaseBrushSize = baseBrushSize;
      if (rawForce >= 0.3) {
        const steps = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
        const panelSize = _panelBaseBrushSize || window._strokeStartBaseBrushSize || 1;
        let baseIdx = steps.indexOf(panelSize);
        if (baseIdx === -1) {
          baseIdx = steps.findIndex(s => s >= panelSize);
          if (baseIdx === -1) baseIdx = steps.length - 1;
        }
        let stepsUp;
        if      (rawForce < 0.5) stepsUp = 1;
        else if (rawForce < 0.7) stepsUp = 2;
        else                     stepsUp = 3;
        const newIdx = Math.min(baseIdx + stepsUp, steps.length - 1);
        baseBrushSize = steps[newIdx];
      } else if (rawForce >= 0) {
        baseBrushSize = _panelBaseBrushSize || window._strokeStartBaseBrushSize || baseBrushSize;
      }
      // 源頭縮放：壓力改變 baseBrushSize 時，等比縮放 currentSize/initialSize
      // 下游 brushSize → brushSizeNow → oldR → smoothRadius → flyBrushSize 全部自動跟上
      if (baseBrushSize !== prevBaseBrushSize && prevBaseBrushSize > 0) {
        // 冪次阻尼：線性 ratio 視覺跳變太大，用 pow(ratio, 0.6) 壓縮
        // 3→5: 1.67^0.6 = 1.37,  3→10: 3.33^0.6 = 2.05,  10→3: 0.3^0.6 = 0.49
        const ratio = Math.pow(baseBrushSize / prevBaseBrushSize, 0.6);
        currentSize *= ratio;
        initialSize *= ratio;
      }
    }
    if (currentSize <= sizeThreshold && !isCountingDown && brushMode != 3 && brushMode != 4 && brushMode != 5) {
      isCountingDown = true;
      updateCount = 0;
    }
    targetX = currentMouseX;
    targetY = currentMouseY;
    brushDirection = map(noise(targetX * 0.01, targetY * 0.01), 0, 1, -pathRotation, pathRotation);
    if (brushMode !== 3) {
      const targetOffsetSeed = strokeSeed + mouseCount * 10000000;
      randomSeed(targetOffsetSeed);
      const txRand1 = crandom.random(pathRotation * 0.5, pathRotation);
      const txRand2 = crandom.random(pathRotation * 0.5, pathRotation);
      const perspectiveOffset = -10;
      targetX += txRand1 * (cos(brushDirection)) + perspectiveOffset;
      targetY += txRand2 * (sin(brushDirection)) + perspectiveOffset;
    }
    if (isRecording) {
      const recordX = (brushMode === 3) ? targetX : Math.round(targetX);
      const recordY = (brushMode === 3) ? targetY : Math.round(targetY);
      const mdData = { x: recordX, y: recordY };
      if (inkPressed && penPressureEnabled) mdData.p = Math.round(penPressureRaw * 1000) / 1000;
      recordEvent("md", mdData);
      if (typeof window.recordedMouseDraggedCount !== 'undefined') {
        window.recordedMouseDraggedCount++;
      }
    }
    lastTargetX = targetX;
    lastTargetY = targetY;
    let targetBuffer = newBufferBlack;
    if (mouseCount === 1) {
      crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
    }
    const moveDistance = dist(targetX, targetY, prevTargetX, prevTargetY);
    const moveThreshold = 1;
    if (moveDistance > moveThreshold) {
      if (brushMode == 4 && mouseCount < expectedStrokeLength) {
        penSketchOnBuffer(targetBuffer, targetX, targetY, prevTargetX, prevTargetY);
      }
      if ((brushMode == 1 || brushMode == 7) && mouseCount < expectedStrokeLength) {
        let pathProgress = expectedStrokeLength > 0 ? min(mouseCount / expectedStrokeLength, 1.0) : 0;
        let precomputedRand = crandom.random(0, 1);
        if (precomputedRand > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
          if (mouseCount > 5 && baseBrushSize < 6.0) sprayPaintOnBuffer(targetBuffer, targetX, targetY);
        }
        brushPaintOnBuffer(targetBuffer, targetX, targetY, pathProgress, targetflyBrushType, targetmainStrokeDir);
      }
      if ((brushMode == 2) && mouseCount < expectedStrokeLength) {
        let pathProgress = expectedStrokeLength > 0 ? min(mouseCount / expectedStrokeLength, 1.0) : 0;
        let precomputedRand = crandom.random(0, 1);
        if (precomputedRand > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && pathProgress < 0.6) {}
        markerOnBuffer(targetBuffer, targetX, targetY, pathProgress, targetflyBrushType, targetmainStrokeDir);
      }
      if (brushMode == 3 && mouseCount < expectedStrokeLength) {
        gothicOnBuffer(targetBuffer, targetX, targetY, prevTargetX, prevTargetY);
        if (crandom.random(0, 1) > 0.4) sprayPaintOnBuffer(targetBuffer, targetX, targetY);
      }
      if (brushMode == 5 && mouseCount < expectedStrokeLength) {
        if (crandom.random(0, 1) > 0.05) sprayPaintOnBuffer(targetBuffer, targetX, targetY);
      }
      if (brushMode == 6 && mouseCount < expectedStrokeLength) {
        let pathProgress = expectedStrokeLength > 0 ? min(mouseCount / expectedStrokeLength, 1.0) : 0;
        flyBrushOnBuffer(targetBuffer, targetX, targetY, pathProgress, targetflyBrushType, targetmainStrokeDir);
      }
    }
    if (mouseCount === 1) {
      crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
    }
    prevTargetX = targetX;
    prevTargetY = targetY;
    if (isPlaying) {
      simulatedPMouseX = simulatedMouseX;
      simulatedPMouseY = simulatedMouseY;
    }
  }
  const isActivelyDrawingForShader = isPlaying ? simulatedMousePressed : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && isDrawing));
  const shouldUpdateShader = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? isActivelyDrawingForShader : (isActivelyDrawingForShader && currentSize > 0);
  if (shouldUpdateShader) {
    if (drawingFrameCount === 0) {
      crandomDebugger.checkpoint('shader_首次更新前', 'shader');
    }
    force = 1.0;
    if (brushMode == 4) force = force * 0.4;
    const targetBuffer = newBufferBlack;
    updateDrawingOnBuffer(targetBuffer, force);
    drawingFrameCount++;
    if (drawingFrameCount === 1) {
      crandomDebugger.checkpoint('shader_首次更新後', 'shader');
    }
  } else if (isCountingDown && updateCount < maxUpdates) {
    force = map(updateCount, 0, maxUpdates, 1.0, 0.0);
    if (brushMode == 4) force = force * 0.4;
    const targetBuffer = newBufferBlack;
    updateDrawingOnBuffer(targetBuffer, force);
    updateCount++;
    drawingFrameCount++;
  } else if (isCountingDown && updateCount >= maxUpdates) {
    logArt('art', 'Stroke complete', {
      Status: 'Countdown complete, transferred to static layer'
    });
    transferNewToOld();
    isCountingDown = false;
  }
  if (record == 1 && isPlaying && !isFrameRecording) {
    startFrameRecording();
  }
  if (record == 1 && !isPlaying && isFrameRecording) {
    stopFrameRecording();
  }
  if (isFrameRecording) {
    captureFrame();
    if (record == 1) {
      frameRate(10);
    }
  }
  if (record == 0) {
    frameRate(60);
  }
  updateStatusUI();
  if (pendingBugGeneration) {
    pendingBugGeneration = false;
    const currentDrawingSeed = drawingSeed;
    randomSeed(pendingBugStrokeSeed);
    noiseSeed(pendingBugStrokeSeed);
    let scanBounds = pendingBugBounds ? {
      ...pendingBugBounds
    } : null;
    if (!scanBounds) {
      if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
        const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
        if (lastStroke.bounds) {
          scanBounds = {
            ...lastStroke.bounds
          };
        } else if (lastStroke.points && lastStroke.points.length > 0) {
          let minX = lastStroke.points[0].x;
          let maxX = lastStroke.points[0].x;
          let minY = lastStroke.points[0].y;
          let maxY = lastStroke.points[0].y;
          for (let pt of lastStroke.points) {
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
          }
          scanBounds = {
            minX,
            maxX,
            minY,
            maxY
          };
        }
      }
    }
    if (typeof scanAndMarkDarkPoints === 'function') {
      scanAndMarkDarkPoints(screenBuffer, scanBounds);
    }
    randomSeed(currentDrawingSeed);
    noiseSeed(currentDrawingSeed);
    pendingBugStrokeSeed = 0;
    pendingBugBounds = null;
  }
  if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
    const scanEvent = window.pendingEffectControlScanQueue.shift();
    if (scanEvent && typeof scanAndMarkDarkPoints === 'function') {
      let scanBounds = scanEvent.scanBounds;
      const action = scanEvent.action;
      const shapeType = scanEvent.shapeType;
      const bugsSize = scanEvent.bugsSize !== undefined ? scanEvent.bugsSize : 10.0;
      const scanSeed = scanEvent.scanSeed;
      const recordedRandomCount = scanEvent.recordedRandomCount;
      const targetPoints = scanEvent.targetPoints || null;
      if (typeof window !== 'undefined') {
        window.bugsSize = bugsSize;
        const bugsSizeSlider = document.getElementById('bugs-size');
        const bugsSizeValueDisplay = document.getElementById('bugs-size-value');
        if (bugsSizeSlider && bugsSizeValueDisplay) {
          bugsSizeSlider.value = bugsSize;
          bugsSizeValueDisplay.textContent = bugsSize;
        }
        window._scanProcessedPlaybackCount = (window._scanProcessedPlaybackCount || 0) + 1;
      }
      if (action === 'scan-current' && !scanBounds) {
        if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
          scanBounds = {
            ...pendingBugBounds
          };
        } else if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
          const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
          if (lastStroke.bounds) {
            scanBounds = {
              ...lastStroke.bounds
            };
          }
        }
      }
      if (typeof window !== 'undefined') {
        window.currentScanEvent = {
          action: action,
          shapeType: shapeType,
          scanSeed: scanSeed,
          recordedRandomCount: recordedRandomCount
        };
      }
      const savedSeed = seed;
      if (scanSeed) {
        randomSeed(scanSeed);
        noiseSeed(scanSeed);
      }
      scanAndMarkDarkPoints(screenBuffer, scanBounds, shapeType, targetPoints);
      if (savedSeed) {
        randomSeed(savedSeed);
        noiseSeed(savedSeed);
      }
      if (typeof window !== 'undefined') {
        logArt('playback', '🔁 Effect Control: Scan (processed)', {
          Index: window._scanProcessedPlaybackCount || 0,
          Action: action,
          ShapeType: shapeType,
          BugsSize: bugsSize,
          HasBounds: !!scanBounds
        });
        window.currentScanEvent = null;
        window.lastEffectControlProcessTime = millis();
      }
    }
  }
}

function mousePressed() {
  if (isPlaying) {
    return;
  }
  if (isMouseDownOnUIPanel) {
    return;
  }
  const margin = 300;
  if (globalMouseX < -margin || globalMouseX > width + margin ||
    globalMouseY < -margin || globalMouseY > height + margin) {
    return;
  }
  crandom.reset();
  crandomDebugger.resetStroke();
  window.drawLoopCount = 0;
  window.recordedMouseDraggedCount = 0;
  if (isRecording) {
    recordingStrokeNumber++;
  }
  if (isRecording) {
    console.log(`🎬 錄製開始 [第 ${recordingStrokeNumber} 筆]`);
  }
  strokeSeed = int(crandom.random(100000000, 999999999));
  crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
  handleRapidDrawing();
  randomSeed(strokeSeed);
  noiseSeed(strokeSeed);
  logArt('art', 'New stroke started', {
    Seed: strokeSeed,
    Mode: `Brush mode ${brushMode}`,
    Position: `(${globalMouseX.toFixed(0)}, ${globalMouseY.toFixed(0)})`
  });
  easycamTrackingStrokeCount++;
  currentStrokeMouseCountStart = mouseCount;
  radColor = 0;
  mouseCount = 0;
  // 壓力可能在上一筆改了 baseBrushSize，每筆開始還原面板值
  if (inkPressed && _panelBaseBrushSize !== null) {
    baseBrushSize = _panelBaseBrushSize;
  }
  if (typeof gothicdotss !== 'undefined') {
    gothicdotss = [];
  }
  if (typeof gothicDotIdCounter !== 'undefined') {
    gothicDotIdCounter = 0;
  }
  currentWhiteMaxOpacity = crandom.random(0.5, 0.99);
  currentHueShift = crandom.random(-0.02, 0.02);
  currentSatShift = crandom.random(-0.05, 0.05);
  currentBriShift = crandom.random(-0.05, 0.05);
  explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
  explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
  targetflyBrushType = max(0, int(crandom.random(-1, 3)));
  targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
  brushDir = int(crandom.random(0, 4));
  indiffusionStrength = point2(crandom.random(0.4, 0.5));
  if (brushMode == 3 || brushMode == 4) indiffusionStrength = point2(crandom.random(0.2, 0.3));
  else if (brushMode == 5) indiffusionStrength = point2(crandom.random(0.25, 0.35));
  indiffusionStrength = 0.45;
  let phasorComment = "";
  if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
  let explodeComment = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
  effect3Brightness = crandom.random(0.5, 0.9);
  colorIndex = int(crandom.random(0, 4));
  shapeType = int(crandom.random(0, 4));
  brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
  brushPaintInterpolationOffset = int(crandom.random(-2, 4));
  brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
  if (isRecording) {
    if (isFirstStroke) {
      if (recordingStartTime === 0) {
        recordingStartTime = millis();
        logArt('recording', '⏱️ Start timing', {
          Status: 'First stroke recording started'
        });
      } else {
        const pauseTime = millis() - lastStrokeEndTime;
        if (pauseTime > 0) {
          accumulatedPauseTime += pauseTime;
          logArt('recording', '⏸️ Skip interval', {
            Interval: `${pauseTime.toFixed(0)}ms`,
            Accumulated: `${accumulatedPauseTime.toFixed(0)}ms`
          });
        }
      }
      isFirstStroke = false;
    } else {
      const pauseTime = millis() - lastStrokeEndTime;
      accumulatedPauseTime += pauseTime;
      logArt('recording', '⏸️ Skip interval', {
        Interval: `${pauseTime.toFixed(0)}ms`,
        Accumulated: `${accumulatedPauseTime.toFixed(0)}ms`
      });
    }
    currentStrokeData = {
      strokeSeed: strokeSeed,
      mouseCountStart: currentStrokeMouseCountStart,
      colorIndex: colorIndex,
      shapeType: shapeType,
      useSharpen: useSharpen,
      brushMode: brushMode,
      indiffusionStrength: indiffusionStrength,
      whiteBrushMode: whiteBrushMode,
      brushColorMode: brushColorMode,
      customBrushColor: (brushColorMode === 33 && typeof customBrushColor !== 'undefined') ? [customBrushColor[0], customBrushColor[1], customBrushColor[2]] : undefined,
      phasorVel: phasorVel,
      explodeStart: explodeStart,
      explodeEnd: explodeEnd,
      whiteMaxOpacity: point2(currentWhiteMaxOpacity),
      hueShift: point2(currentHueShift),
      satShift: point2(currentSatShift),
      briShift: point2(currentBriShift),
      targetflyBrushType: targetflyBrushType,
      targetmainStrokeDir: targetmainStrokeDir,
      brushDir: brushDir,
      ctlNoise: ctlNoise,
      penSketchNoiseBase: brushMode === 4 ? penSketchNoiseBase : undefined,
      penSketchStrokeWeight: brushMode === 4 ? penSketchStrokeWeight : undefined,
      brushPaintCtlNoisebyFrame: brushPaintCtlNoisebyFrame,
      brushPaintInterpolationOffset: brushPaintInterpolationOffset,
      brushPaintOldRInitial: brushPaintOldRInitial,
      keyBlendMode: keyBlendMode,
      useSpectralMix: useSpectralMix
    };
  }
  if (pathRotationMode === 1) {
    pathRotation = 0;
  } else if (pathRotationMode === 2) {
    pathRotation = point2(crandom.random(5, 10));
  } else if (pathRotationMode === 3) {
    pathRotation = point2(crandom.random(10, 25));
  }
  if (brushMode === 1) {
    initialSize = point2(crandom.random(20, 24) * baseBrushSize);
    spraySize = 3 * baseBrushSize;
    if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
    randStep = 0.05;
    maxUpdates = 30;
    interpolationSteps = 15;
    spraySteps = 5;
    springForce = 0.6;
    dampingForce = 0.5;
  } else if (brushMode === 2) {
    initialSize = point2(crandom.random(20, 24) * baseBrushSize);
    spraySize = 1 * baseBrushSize;
    randStep = 0.05;
    maxUpdates = 10;
    interpolationSteps = 10;
    spraySteps = 10;
    springForce = 0.3;
    dampingForce = 0.5;
  } else if (brushMode === 3) {
    initialSize = crandom.random(2, 4) * baseBrushSize;
    spraySize = 10 * baseBrushSize;
    spraySteps = 3;
    randStep = 0.05;
    maxUpdates = 10;
  } else if (brushMode === 4) {
    initialSize = crandom.random(6, 9) * baseBrushSize;
    spraySize = 1 * baseBrushSize;
    spraySteps = 5;
    randStep = 0.05;
    maxUpdates = 10;
    penSketchNoiseBase = noise(globalMouseX * 1, globalMouseY * 1);
    penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
    expectedStrokeLength = 100;
    springForce = 0.6;
    dampingForce = 0.5;
  } else if (brushMode === 5) {
    initialSize = crandom.random(10, 14) * baseBrushSize;
    spraySize = 10;
    spraySteps = 1;
    randStep = 0.05;
    maxUpdates = 10;
    interpolationSteps = 10;
    springForce = 0.6;
    dampingForce = 0.5;
  } else if (brushMode === 6) {
    initialSize = crandom.random(10, 14) * baseBrushSize;
    spraySize = 10;
    spraySteps = 1;
    randStep = 0.05;
    maxUpdates = 10;
    interpolationSteps = 10;
    springForce = 0.6;
    dampingForce = 0.5;
  } else {
    initialSize = crandom.random(30, 40);
    maxUpdates = 10;
    randStep = 0.05;
  }
  if (useSharpen >= 3.5) {
    maxUpdates = 20;
    logArt('system', '⚡️ Ink Effect G active, maxUpdates set to 5', {
      Status: 'Performance Optimization'
    });
  }
  if (brushMode == 4) {
    expectedStrokeLength = 400;
  } else {
    expectedStrokeLength = 400;
  }
  if (isRecording && currentStrokeData) {
    currentStrokeData.initialSize = initialSize;
    currentStrokeData.spraySize = spraySize;
    currentStrokeData.step = interpolationSteps;
    currentStrokeData.step2 = spraySteps;
    currentStrokeData.randStep = randStep;
    currentStrokeData.maxUpdates = maxUpdates;
    currentStrokeData.pathRotation = pathRotation;
    currentStrokeData.spring = springForce;
    currentStrokeData.friction = dampingForce;
    currentStrokeData.baseBrushSize = baseBrushSize;
    currentStrokeData.expectedStrokeLength = expectedStrokeLength;
    currentStrokeData.effect3Brightness = point2(effect3Brightness);
  }
  currentSize = initialSize;
  brushSize = currentSize;
  brushSizeNow = brushSize;
  lastBrushPixelSize = initialSize;
  window._strokeStartBaseBrushSize = baseBrushSize; // 記住筆劃開始時的 baseBrushSize
  if (inkPressed && _panelBaseBrushSize === null) _panelBaseBrushSize = baseBrushSize;
  isFirstDraw = 0;
  x = globalMouseX;
  y = globalMouseY;
  brushAccelX = 0;
  brushAccelY = 0;
  brushSpeed = 0;
  oldR = 0;
  gobalSize = 0;
  if (typeof markerOnBuffer !== 'undefined') {
    markerOnBuffer.lastAngle = 0;
    markerOnBuffer.lastMovementAngle = 0;
  }
  if (typeof clearFlyBrushConfigCache === 'function') {
    clearFlyBrushConfigCache();
  }
  if (typeof flyBrushOnBuffer !== 'undefined') {
    flyBrushOnBuffer.lastAngle = 0;
    flyBrushOnBuffer.lastMovementAngle = 0;
  }
  prevTargetX = globalMouseX;
  prevTargetY = globalMouseY;
  isDrawing = true;
  isCountingDown = false;
  updateCount = 0;
  drawingFrameCount = 0;
  isNewStroke = true;
  strokeComplete = false;
  startX = globalMouseX;
  startY = globalMouseY;
  pathPoints = [{
    x: globalMouseX,
    y: globalMouseY
  }];
  hasPath = true;
  drawingSeed = int(crandom.random(1000000, 9999999));
  if (brushMode == 7) brushModeSP = true;
  else brushModeSP = false;
  randomSeed(drawingSeed);
  noiseSeed(drawingSeed);
  crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
  if (isRecording && currentStrokeData) {
    currentStrokeData.mouseX = globalMouseX;
    currentStrokeData.mouseY = globalMouseY;
    currentStrokeData.drawingSeed = drawingSeed;
    currentStrokeData.brushModeSP = brushModeSP;
    if (inkPressed && penPressureEnabled) currentStrokeData.hasPressure = true;
    currentStrokeData.forceMapParams = {
      randomSeed1: point2(randomSeeds[0]),
      randomSeed2: point2(randomSeeds[1]),
      randomSeed3: point2(randomSeeds[2]),
      randomSeed4: point2(randomSeeds[3]),
      scale1: point2(scales[0]),
      scale2: point2(scales[1]),
      scale3: point2(scales[2]),
      amplitude1: point2(amplitudes[0]),
      amplitude2: point2(amplitudes[1]),
      amplitude3: point2(amplitudes[2]),
      phase1: point2(phases[0]),
      phase2: point2(phases[1]),
      phase3: point2(phases[2]),
      vortexScale1: point2(vortexScales[0]),
      vortexScale2: point2(vortexScales[1]),
      clusterScale1: point2(clusterScales[0]),
      clusterScale2: point2(clusterScales[1])
    };
    const recordMouseX = (brushMode === 3) ? globalMouseX : Math.round(globalMouseX);
    const recordMouseY = (brushMode === 3) ? globalMouseY : Math.round(globalMouseY);
    recordEvent("mp", {
      x: recordMouseX,
      y: recordMouseY,
      strokeData: currentStrokeData
    });
  }
}

function mouseReleased() {
  if (isPlaying) {
    return;
  }
  if (!isDrawing) {
    return;
  }
  const randomCountAtStart = crandom.getCount();
  const releaseX = globalMouseX;
  const releaseY = globalMouseY;
  const clampedX = Math.round(constrain(releaseX, 0, width));
  const clampedY = Math.round(constrain(releaseY, 0, height));
  recordEvent("mr", {
    x: clampedX,
    y: clampedY
  });
  crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
  const randomCount = crandom.getCount();
  const mouseReleasedRandomCalls = randomCount - randomCountAtStart;
  const totalDrawLoops = window.drawLoopCount || 0;
  const totalRecordedEvents = window.recordedMouseDraggedCount || 0;
  if (isRecording) {
    console.log(`   Draw: ${totalDrawLoops} | random(): ${randomCount}`);
  }
  window.drawLoopCount = 0;
  window.recordedMouseDraggedCount = 0;
  if (isRecording) {
    crandomDebugger.saveStroke('recording', recordingStrokeNumber);
  }
  if (isRecording) {
    lastStrokeEndTime = millis();
    logArt('recording', 'Stroke ended', {
      FinalSize: currentSize.toFixed(2),
      CountdownStatus: isCountingDown ? 'In progress' : 'Not started',
      'brushMode': brushMode,
      'OutsideCanvas': (globalMouseX < 0 || globalMouseX >= width || globalMouseY < 0 || globalMouseY >= height),
      'RandomCalls': randomCount
    });
  }
  if (typeof gothicdotss !== 'undefined' && gothicdotss.length > 0) {
    gothicdotss = gothicdotss.filter(dot => dot.radius > 0);
  }
  if (!isCountingDown) {
    isCountingDown = true;
    updateCount = 0;
  }
}

function keyPressed() {
  if (key === 'Enter') {
    saveCanvasAsPNG();
    return;
  }
  if (key === 'f' || key === 'F') {
    if (isFrameRecording) {
      stopFrameRecording();
    } else {
      startFrameRecording();
    }
    return;
  }
  if (key === ' ') {
    clearCanvas();
    console.clear();
    let pointsCleared = markedDarkPoints.length;
    markedDarkPoints = [];
    window.bugsDataTextureCache = null;
    window.bugsMaskTextureCache = null;
    logArt('system', '🧹 Clear canvas', {
      'Status': 'Cleared (brush settings preserved)',
      '虫咬点': `${pointsCleared} 个`
    });
    return false;
  }
}

function updateLayerZAnimation() {
  const shouldApplyEasyCam = doMoving && easycamEnabled && easycam !== null && isPlaying && easycamAutoTracking;
  const shouldAnimateZ = (isPlaying && shouldApplyEasyCam) || (!isPlaying && (layerZAnimating || layerZCurrent[0] !== 0 || layerZCurrent[40] !== 0 || layerZCurrent[80] !== 0 || layerZCurrent[120] !== 0));
  if (shouldAnimateZ) {
    if (!layerZAnimating) {
      layerZAnimating = true;
      layerZStartTime = millis();
      layerZStart[0] = layerZCurrent[0];
      layerZStart[40] = layerZCurrent[40];
      layerZStart[80] = layerZCurrent[80];
      layerZStart[120] = layerZCurrent[120];
    }
    const elapsed = millis() - layerZStartTime;
    const progress = Math.min(elapsed / easycamResetDuration, 1.0);
    const targetZ = isPlaying ? layerZTarget : {
      0: 0,
      40: 0,
      80: 0,
      120: 0
    };
    layerZCurrent[0] = lerp(layerZStart[0], targetZ[0], progress);
    layerZCurrent[40] = lerp(layerZStart[40], targetZ[40], progress);
    layerZCurrent[80] = lerp(layerZStart[80], targetZ[80], progress);
    layerZCurrent[120] = lerp(layerZStart[120], targetZ[120], progress);
    if (progress >= 1.0) {
      layerZCurrent[0] = targetZ[0];
      layerZCurrent[40] = targetZ[40];
      layerZCurrent[80] = targetZ[80];
      layerZCurrent[120] = targetZ[120];
      if (!isPlaying) {
        layerZAnimating = false;
      }
    }
  } else if (!isPlaying && !layerZAnimating) {
    layerZCurrent[0] = 0;
    layerZCurrent[40] = 0;
    layerZCurrent[80] = 0;
    layerZCurrent[120] = 0;
  }
}

function updateBlurEffect() {
  const shouldApplyEasyCam = doMoving && easycamEnabled && easycam !== null && isPlaying && easycamAutoTracking;
  const isInPlaybackMode = isPlaying;
  const isActivelyDrawingForBlur = isInPlaybackMode ? simulatedMousePressed : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && isDrawing));
  const isDrawingNowForBlur = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? isActivelyDrawingForBlur : (isActivelyDrawingForBlur && currentSize > 0);
  if (!doMoving) {
    layerBlurValues[0] = 0;
    layerBlurValues[40] = 0;
    layerBlurValues[80] = 0;
    layerBlurValues[120] = 0;
    return;
  }
  if (isInPlaybackMode) {
    if (newStrokeStartedForBlur) {
      crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
      layerBlurMaxValues[0] = point2(max(0, crandom.random(-5, 5)));
      layerBlurMaxValues[40] = point2(max(0, crandom.random(-5, 5)));
      layerBlurMaxValues[80] = point2(max(0, crandom.random(-5, 5)));
      layerBlurMaxValues[120] = point2(max(0, crandom.random(-5, 5)));
      crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
      blurAnimationStartTime = millis();
      newStrokeStartedForBlur = false;
    }
    previousIsDrawing = isActivelyDrawingForBlur;
  } else {
    previousIsDrawing = false;
    newStrokeStartedForBlur = false;
  }
  let blurIntensity = 0;
  if (isInPlaybackMode) {
    if (isDrawingNowForBlur) {
      const elapsed = millis() - blurAnimationStartTime;
      const progress = min(1.0, elapsed / blurAnimationDuration);
      blurIntensity = progress;
    } else if (isCountingDown) {
      const countdownProgress = map(updateCount, 0, maxUpdates, 1.0, 0.0);
      blurIntensity = countdownProgress;
    } else {
      blurIntensity = 0;
    }
    if (shouldApplyEasyCam && easycam !== null) {
      const currentDistance = easycam.getDistance();
      const fixedFov = PI / 3;
      const baseDistance = height / (2 * tan(fixedFov / 2));
      const minScale = 1.1;
      const maxScale = 1.4;
      const currentScale = baseDistance / currentDistance;
      const scaleRange = maxScale - minScale;
      const normalizedScale = (currentScale - minScale) / scaleRange;
      const distanceBlurFactor = constrain(normalizedScale, 0.0, 1.0);
      const smoothBlurFactor = pow(distanceBlurFactor, 0.5);
      blurIntensity = blurIntensity * smoothBlurFactor;
    }
  }
  layerBlurValues[0] = layerBlurMaxValues[0] * blurIntensity;
  layerBlurValues[40] = layerBlurMaxValues[40] * blurIntensity;
  layerBlurValues[80] = layerBlurMaxValues[80] * blurIntensity;
  layerBlurValues[120] = layerBlurMaxValues[120] * blurIntensity;
}

function drawLayersWithBlur() {
  const shouldApplyEasyCam = doMoving && easycamEnabled && easycam !== null && isPlaying && easycamAutoTracking;
  const shouldShowCursor = (isDrawing || isCountingDown) && updateCount < maxUpdates && hasPath;
  const hasMetallicBugs = markedDarkPoints.length > 0 && typeof drawMetallicBugs === 'function';
  const hasBoids = false;
  const useShader = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && distortProgram && img;
  if (mapProgram && img) {
    drawMap();
  }
  finalOut.begin();
  clear();
  if (useShader) {
    let inputBuffer = screenBuffer;
    if (hasMetallicBugs) {
      window.tempMetallicBuffer.begin();
      clear();
      imageMode(CENTER);
      image(screenBuffer, 0, 0, width, height);
      window.tempMetallicBuffer.end();
      drawMetallicBugs(realtimeIntermediateBuffer, window.tempMetallicBuffer);
      inputBuffer = realtimeIntermediateBuffer;
    }
    background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
    shader(distortProgram);
    distortProgram.setUniform("rect", [0, 0, width * pixel, height * pixel]);
    distortProgram.setUniform("tex0", inputBuffer);
    distortProgram.setUniform("forceMap", img);
    distortProgram.setUniform("time", millis() * 0.005);
    distortProgram.setUniform("backgroundColor", [
      canvasBackgroundColor[0] / 255.0,
      canvasBackgroundColor[1] / 255.0,
      canvasBackgroundColor[2] / 255.0
    ]);
    if (distortShaderEnabled) {
      distortProgram.setUniform("distortEnabled", 1.0);
      distortProgram.setUniform("displacementB", distortDisplacementB);
      distortProgram.setUniform("displacementC", distortDisplacementC);
      distortProgram.setUniform("showFbmMask", distortShowFbmMask);
      distortProgram.setUniform("fbmSeed1", randomSeeds[0] || 100);
      distortProgram.setUniform("fbmSeed2", randomSeeds[1] || 200);
      distortProgram.setUniform("fbmSeed3", randomSeeds[2] || 300);
      distortProgram.setUniform("fbmSeed4", randomSeeds[3] || 400);
    } else {
      distortProgram.setUniform("distortEnabled", 0.0);
    }
    if (rsEnabled) {
      distortProgram.setUniform("rsEnabled", 1.0);
      distortProgram.setUniform("rsFrequency", rsFrequency);
      distortProgram.setUniform("rsWaveSpeed", rsWaveSpeed);
      distortProgram.setUniform("rsStrength", rsStrength);
      distortProgram.setUniform("rsGradientMix", rsGradientMix);
      distortProgram.setUniform("rsScale", rsScale);
    } else {
      distortProgram.setUniform("rsEnabled", 0.0);
    }
    distortProgram.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
    distortProgram.setUniform("cellularScale", cellularScale);
    distortProgram.setUniform("cellularSeed", cellularSeed);
    distortProgram.setUniform("whiteDotDensity", whiteDotEnabled ? whiteDotDensity : 0.0);
    distortProgram.setUniform("grainAmount", grainEnabled ? grainAmount : 0.0);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, width, height);
    resetShader();
  } else {
    imageMode(CENTER);
    image(screenBuffer, 0, 0, width, height);
    if (hasMetallicBugs) {
      window.tempMetallicBuffer.begin();
      clear();
      imageMode(CENTER);
      image(finalOut, 0, 0, width, height);
      window.tempMetallicBuffer.end();
      drawMetallicBugs(realtimeIntermediateBuffer, window.tempMetallicBuffer);
      imageMode(CENTER);
      image(realtimeIntermediateBuffer, 0, 0, width, height);
    }
  }
  finalOut.end();
  if (flowEffectPendingCommit && flowEffectCommitData) {
    const data = flowEffectCommitData;
    const bounds = data.bounds;
    const uniforms = {
      rect: [0, 0, width * pixel, height * pixel],
      blendType: data.blendType,
      blendVol: flowEffectParams.blendVol * (1 + data.iterations * 0.1),
      radSeed: data.seed * 0.001,
      strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
      pixD: flowEffectParams.pixD,
      blendA: flowEffectParams.blendA,
      blendB: flowEffectParams.blendB,
      directVol: flowEffectParams.directVol,
      snoiseVol: flowEffectParams.snoiseVol,
      gobalStyle: flowEffectParams.gobalStyle,
      vline: 5,
      hline: 5,
      cellT: 1.0,
      colorDeep: flowEffectParams.colorDeep,
      whiteDot: flowEffectParams.whiteDot,
      doBigShape: flowEffectParams.doBigShape,
      doMask: flowEffectParams.doMask,
      multiDir: flowEffectParams.multiDir,
      drawTime: flowEffectParams.drawTime,
      seed: flowEffectParams.seed,
      iTime: millis() * 0.001
    };
    if (typeMapBuffer && flowProgram) {
      pingPongBuffer.begin();
      clear();
      shader(flowProgram);
      for (const [key, val] of Object.entries(uniforms)) {
        flowProgram.setUniform(key, val);
      }
      flowProgram.setUniform('tex0', typeMapBuffer);
      flowProgram.setUniform('lastStrokeTex', lastStrokeBuffer);
      flowProgram.setUniform('lastStrokeOnly', flowEffectLastStrokeOnly ? 1 : 0);
      flowProgram.setUniform('isTypeMapMode', 1);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, width, height);
      resetShader();
      pingPongBuffer.end();
      typeMapBuffer.begin();
      clear();
      background(0);
      imageMode(CENTER);
      image(pingPongBuffer, 0, 0, width, height);
      typeMapBuffer.end();
    }
    if (flowProgram) {
      screenBuffer.begin();
      clear();
      imageMode(CENTER);
      image(oldBuffer, 0, 0, width, height);
      screenBuffer.end();
      oldBuffer.begin();
      shader(flowProgram);
      for (const [key, val] of Object.entries(uniforms)) {
        flowProgram.setUniform(key, val);
      }
      flowProgram.setUniform('tex0', screenBuffer);
      flowProgram.setUniform('lastStrokeTex', lastStrokeBuffer);
      flowProgram.setUniform('lastStrokeOnly', flowEffectLastStrokeOnly ? 1 : 0);
      flowProgram.setUniform('isTypeMapMode', 0);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, width, height);
      resetShader();
      oldBuffer.end();
    }
    if (flowProgram) {
      screenBuffer.begin();
      clear();
      imageMode(CENTER);
      image(finalBuffer, 0, 0, width, height);
      screenBuffer.end();
      finalBuffer.begin();
      shader(flowProgram);
      for (const [key, val] of Object.entries(uniforms)) {
        flowProgram.setUniform(key, val);
      }
      flowProgram.setUniform('tex0', screenBuffer);
      flowProgram.setUniform('lastStrokeTex', lastStrokeBuffer);
      flowProgram.setUniform('lastStrokeOnly', flowEffectLastStrokeOnly ? 1 : 0);
      flowProgram.setUniform('isTypeMapMode', 0);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, width, height);
      resetShader();
      finalBuffer.end();
    }
    if (flowProgram) {
      screenBuffer.begin();
      clear();
      imageMode(CENTER);
      image(finalOut, 0, 0, width, height);
      screenBuffer.end();
      finalOut.begin();
      shader(flowProgram);
      for (const [key, val] of Object.entries(uniforms)) {
        flowProgram.setUniform(key, val);
      }
      flowProgram.setUniform('tex0', screenBuffer);
      flowProgram.setUniform('lastStrokeTex', lastStrokeBuffer);
      flowProgram.setUniform('lastStrokeOnly', flowEffectLastStrokeOnly ? 1 : 0);
      flowProgram.setUniform('isTypeMapMode', 0);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, width, height);
      resetShader();
      finalOut.end();
    }
    flowEffectPendingCommit = false;
    flowEffectCommitData = null;
    needsComposite = true;
  }
  if (flowEffectActive && flowProgram && flowEffectStrokeBounds) {
    const bounds = flowEffectStrokeBounds;
    pingPongBuffer.begin();
    clear();
    imageMode(CENTER);
    image(finalOut, 0, 0, width, height);
    pingPongBuffer.end();
    finalOut.begin();
    shader(flowProgram);
    flowProgram.setUniform('rect', [0, 0, width * pixel, height * pixel]);
    flowProgram.setUniform('tex0', pingPongBuffer);
    flowProgram.setUniform('lastStrokeTex', lastStrokeBuffer);
    flowProgram.setUniform('lastStrokeOnly', flowEffectLastStrokeOnly ? 1 : 0);
    flowProgram.setUniform('blendType', flowEffectBlendType);
    flowProgram.setUniform('blendVol', flowEffectParams.blendVol * (1 + flowEffectIterationCount * 0.1));
    flowProgram.setUniform('radSeed', flowEffectSeed * 0.001);
    flowProgram.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
    flowProgram.setUniform('pixD', flowEffectParams.pixD);
    flowProgram.setUniform('blendA', flowEffectParams.blendA);
    flowProgram.setUniform('blendB', flowEffectParams.blendB);
    flowProgram.setUniform('directVol', flowEffectParams.directVol);
    flowProgram.setUniform('snoiseVol', flowEffectParams.snoiseVol);
    flowProgram.setUniform('gobalStyle', flowEffectParams.gobalStyle);
    flowProgram.setUniform('vline', 5);
    flowProgram.setUniform('hline', 5);
    flowProgram.setUniform('cellT', 1.0);
    flowProgram.setUniform('colorDeep', flowEffectParams.colorDeep);
    flowProgram.setUniform('whiteDot', flowEffectParams.whiteDot);
    flowProgram.setUniform('doBigShape', flowEffectParams.doBigShape);
    flowProgram.setUniform('doMask', flowEffectParams.doMask);
    flowProgram.setUniform('multiDir', flowEffectParams.multiDir);
    flowProgram.setUniform('drawTime', flowEffectParams.drawTime);
    flowProgram.setUniform('seed', flowEffectParams.seed);
    flowProgram.setUniform('iTime', millis() * 0.001);
    flowProgram.setUniform('isTypeMapMode', 0);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, width, height);
    resetShader();
    finalOut.end();
  }
  noStroke();
  push();
  translate(0, 0, layerZCurrent[0]);
  image(finalOut, -width / 2, -height / 2);
  pop();
  if (shouldShowCursor) {
    push();
    translate(0, 0, layerZCurrent[40]);
    image(cursorBuffer, -width / 2, -height / 2);
    pop();
  }
  if (isPlaying) {
    if (showFuturePathPreview) {
      drawFuturePathPreview();
    } else {
      combinedBuffer.clear();
    }
    push();
    translate(0, 0, layerZCurrent[80]);
    image(combinedBuffer, -width / 2, -height / 2);
    pop();
  }
  if (screenText && isOverlayVisible) {
    drawScreenText();
  } else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
    oldBufferWhite.clear();
    oldBufferWhite.push();
    drawStrokeHighlight();
    drawStrokeDivider();
    oldBufferWhite.pop();
  } else {
    oldBufferWhite.clear();
    oldBufferWhite.push();
    drawStrokeDivider();
    oldBufferWhite.pop();
  }
  const hasContent = (screenText && isOverlayVisible) ||
    (currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
    (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0);
  if (hasContent) {
    push();
    translate(0, 0, layerZCurrent[120]);
    image(oldBufferWhite, -width / 2, -height / 2);
    pop();
  }
  if (shouldApplyEasyCam) {
    pop();
  }
  // (fxhash debug 畫在 screenBuffer，見 capture 區塊前)
}

function transferNewToOld() {
  lastStrokeBuffer.begin();
  clear();
  background(255);
  imageMode(CENTER);
  image(newBufferBlack, 0, 0);
  lastStrokeBuffer.end();
  screenBuffer.begin();
  clear();
  shader(encodeProgram);
  const brushCategory = brushColorMode === 1 ? 1.0 : 0.0;
  encodeProgram.setUniform("rect", [0, 0, width * pixel, height * pixel]);
  encodeProgram.setUniform("baseTex", finalBuffer);
  encodeProgram.setUniform("strokeTex", newBufferBlack);
  encodeProgram.setUniform("brushColorMode", float(brushColorMode));
  encodeProgram.setUniform("brushCategory", brushCategory);
  encodeProgram.setUniform("whiteMaxOpacity", currentWhiteMaxOpacity);
  encodeProgram.setUniform("hueShift", currentHueShift);
  encodeProgram.setUniform("satShift", currentSatShift);
  encodeProgram.setUniform("briShift", currentBriShift);
  encodeProgram.setUniform("keyBlendMode", keyBlendMode);
  encodeProgram.setUniform("useSharpen", useSharpen);
  encodeProgram.setUniform("typeMapTex", typeMapBuffer);
  const bgColorNormalized = [
    canvasBackgroundColor[0] / 255.0,
    canvasBackgroundColor[1] / 255.0,
    canvasBackgroundColor[2] / 255.0
  ];
  encodeProgram.setUniform("canvasBackgroundColor", bgColorNormalized);
  const customColorNormalized = [
    customBrushColor[0] / 255.0,
    customBrushColor[1] / 255.0,
    customBrushColor[2] / 255.0
  ];
  encodeProgram.setUniform("customBrushColor", customColorNormalized);
  encodeProgram.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
  noStroke();
  rectMode(CENTER);
  rect(0, 0, width, height);
  resetShader();
  screenBuffer.end();
  if (typeMapEncodeProgram && typeMapBuffer) {
    pingPongBuffer.begin();
    clear();
    imageMode(CENTER);
    image(screenBuffer, 0, 0);
    pingPongBuffer.end();
    screenBuffer.begin();
    clear();
    shader(typeMapEncodeProgram);
    typeMapEncodeProgram.setUniform("rect", [0, 0, width * pixel, height * pixel]);
    typeMapEncodeProgram.setUniform("baseTex", typeMapBuffer);
    typeMapEncodeProgram.setUniform("strokeTex", newBufferBlack);
    typeMapEncodeProgram.setUniform("brushCategory", brushCategory);
    typeMapEncodeProgram.setUniform("whiteMaxOpacity", currentWhiteMaxOpacity);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, width, height);
    resetShader();
    screenBuffer.end();
    typeMapBuffer.begin();
    clear();
    background(0);
    imageMode(CENTER);
    image(screenBuffer, 0, 0, width, height);
    typeMapBuffer.end();
    screenBuffer.begin();
    clear();
    imageMode(CENTER);
    image(pingPongBuffer, 0, 0);
    screenBuffer.end();
  }
  finalBuffer.begin();
  clear();
  background(255);
  imageMode(CENTER);
  image(screenBuffer, 0, 0);
  finalBuffer.end();
  oldBuffer.begin();
  imageMode(CENTER);
  blendMode(MULTIPLY);
  image(newBufferBlack, 0, 0);
  blendMode(BLEND);
  oldBuffer.end();
  if (pathToggle && hasPath && pathPoints.length > 1) {
    drawPathToBuffer(oldBuffer);
  } else {}
  if (typeof gridCommitPrev === 'function') {
    try {
      gridCommitPrev();
    } catch (e) {}
  }
  newBufferBlack.begin();
  clear();
  background(255, 255, 255);
  newBufferBlack.end();
  isDrawing = false;
  isCountingDown = false;
  updateCount = 0;
  isNewStroke = false;
  strokeComplete = true;
  let currentStrokeBounds = null;
  if (pathPoints.length > 0) {
    let sumX = 0,
      sumY = 0;
    let minX = pathPoints[0].x;
    let maxX = pathPoints[0].x;
    let minY = pathPoints[0].y;
    let maxY = pathPoints[0].y;
    for (let pt of pathPoints) {
      sumX += pt.x;
      sumY += pt.y;
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    const centerX = sumX / pathPoints.length;
    const centerY = sumY / pathPoints.length;
    pathPointsCache = {
      minX,
      maxX,
      minY,
      maxY,
      centerX,
      centerY,
      length: pathPoints.length
    };
    let gridParams = null;
    if (typeof window.__lastGridParams !== 'undefined' && window.__lastGridParams !== null) {
      gridParams = {
        left: window.__lastGridParams.left,
        top: window.__lastGridParams.top,
        right: window.__lastGridParams.right,
        bottom: window.__lastGridParams.bottom,
        effCell: window.__lastGridParams.effCell,
        cols: window.__lastGridParams.cols,
        rows: window.__lastGridParams.rows,
        gridWidth: window.__lastGridParams.gridWidth,
        gridHeight: window.__lastGridParams.gridHeight
      };
    }
    allBrushStrokes.push({
      points: [...pathPoints],
      center: {
        x: centerX,
        y: centerY
      },
      bounds: {
        minX,
        maxX,
        minY,
        maxY
      },
      gridParams: gridParams,
      timestamp: millis()
    });
    totalStrokeCount++;
    if (allBrushStrokes.length > strokeLimit) {
      allBrushStrokes.shift();
    }
    currentStrokeBounds = {
      minX: pathPointsCache.minX,
      maxX: pathPointsCache.maxX,
      minY: pathPointsCache.minY,
      maxY: pathPointsCache.maxY
    };
  }
  pathPoints = [];
  hasPath = false;
  pathPointsCache = null;
  const savedDrawingSeed = drawingSeed;
  let currentBounds = currentStrokeBounds;
  if (!currentBounds && allBrushStrokes.length > 0) {
    const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
    if (lastStroke.bounds) {
      currentBounds = {
        ...lastStroke.bounds
      };
    }
  }
  if (currentBounds) {
    pendingBugBounds = currentBounds;
  } else {
    if (allBrushStrokes.length > 0) {
      const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
      if (lastStroke.bounds) {
        pendingBugBounds = {
          ...lastStroke.bounds
        };
      }
    }
  }
  if (doBugs && isPlaying) {
    randomSeed(strokeSeed);
    noiseSeed(strokeSeed);
    let shouldGenerateBugs = false;
    if (isPlaying && recordingData && recordingData.events) {
      let totalStrokes = 0;
      for (let e of recordingData.events) {
        const eventType = e.m || e.type;
        if (eventType === 'mr' || eventType === 'mouseReleased') {
          totalStrokes++;
        }
      }
      const currentStroke = totalStrokeCount;
      const isInLastFourStrokes = currentStroke >= (totalStrokes - 12);
      shouldGenerateBugs = isInLastFourStrokes;
      if (shouldGenerateBugs) {
        const useGlobalScan = crandom.random(0, 1) > 0.1;
        if (useGlobalScan) {
          console.log('全局扫描');
          pendingBugBounds = null;
        } else {
          if (currentBounds && !pendingBugBounds) {
            console.log('局部扫描');
            pendingBugBounds = currentBounds;
          }
        }
      }
    } else if (!isPlaying) {
      shouldGenerateBugs = true;
    }
    if (shouldGenerateBugs) {
      pendingBugGeneration = true;
      pendingBugStrokeSeed = strokeSeed;
      if (!isPlaying && currentBounds && !pendingBugBounds) {
        pendingBugBounds = currentBounds;
      }
    } else {
      if (currentBounds && !pendingBugBounds) {
        pendingBugBounds = currentBounds;
      }
    }
    randomSeed(savedDrawingSeed);
    noiseSeed(savedDrawingSeed);
  }
  if (typeof gc !== 'undefined') {
    gc();
  }
  needsComposite = true;
}

function handleRapidDrawing() {
  if (isNewStroke && !strokeComplete) {
    if (isDrawing || isCountingDown) {
      transferNewToOld();
    }
  }
}

function parseFutureStrokes() {
  if (!recordingData.events || recordingData.events.length === 0) {
    return [];
  }
  const futureStrokes = [];
  const previewCount = 20;
  let searchIndex = currentEventIndex;
  let currentStroke = null;
  const offsetX = typeof playbackOffsetX !== 'undefined' ? playbackOffsetX : 0;
  const offsetY = typeof playbackOffsetY !== 'undefined' ? playbackOffsetY : 0;
  const maxSearchRange = 500;
  let searchCount = 0;
  while (futureStrokes.length < previewCount && searchIndex < recordingData.events.length && searchCount < maxSearchRange) {
    const event = recordingData.events[searchIndex];
    const eventType = event.m || event.type;
    if (eventType === 'mp' || eventType === 'mousePressed') {
      currentStroke = {
        path: [{
          x: (event.x + offsetX) - hw,
          y: (event.y + offsetY) - hh,
          t: event.t || 0
        }],
        eventIndex: searchIndex,
        data: event.strokeData || event.d || {}
      };
    } else if ((eventType === 'md' || eventType === 'mouseDragged') && currentStroke) {
      currentStroke.path.push({
        x: (event.x + offsetX) - hw,
        y: (event.y + offsetY) - hh,
        t: event.t || 0
      });
    } else if ((eventType === 'mr' || eventType === 'mouseReleased') && currentStroke) {
      currentStroke.path.push({
        x: (event.x + offsetX) - hw,
        y: (event.y + offsetY) - hh,
        t: event.t || 0
      });
      futureStrokes.push(currentStroke);
      currentStroke = null;
    }
    searchIndex++;
    searchCount++;
  }
  return futureStrokes;
}

function drawFuturePathPreview() {
  if (!isPlaying || !recordingData.events || recordingData.events.length === 0) {
    combinedBuffer.clear();
    return;
  }
  const now = millis();
  const shouldUpdateCache =
    futurePathPreviewCache.lastEventIndex !== currentEventIndex ||
    (now - futurePathPreviewCache.lastUpdateTime) > futurePathPreviewCache.updateInterval;
  if (shouldUpdateCache) {
    futurePathPreviewCache.cachedStrokes = parseFutureStrokes();
    futurePathPreviewCache.lastEventIndex = currentEventIndex;
    futurePathPreviewCache.lastUpdateTime = now;
  }
  const futureStrokes = futurePathPreviewCache.cachedStrokes;
  combinedBuffer.clear();
  if (futureStrokes.length === 0) {
    return;
  }
  combinedBuffer.push();
  const time = millis() * 0.003;
  for (let i = 0; i < futureStrokes.length; i++) {
    const futureStroke = futureStrokes[i];
    const path = futureStroke.path;
    if (!path || path.length < 2) continue;
    const alpha = map(i, 0, futureStrokes.length - 1, 200, 80);
    const pulse = sin(time + i * 0.8) * 0.3 + 1;
    const strokePhase = futureStroke.eventIndex * 0.1;
    const maxSamples = 20;
    const numSamples = min(max(floor(path.length / 5), 2), maxSamples);
    const sampledPoints = [];
    for (let s = 0; s < numSamples; s++) {
      const t = s / (numSamples - 1);
      const index = t * (path.length - 1);
      const idx1 = floor(index);
      const idx2 = min(idx1 + 1, path.length - 1);
      const localT = index - idx1;
      const x1 = path[idx1].x;
      const y1 = path[idx1].y;
      const x2 = path[idx2].x;
      const y2 = path[idx2].y;
      const t1 = path[idx1].t || 0;
      const t2 = path[idx2].t || 0;
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        continue;
      }
      sampledPoints.push({
        x: lerp(x1, x2, localT),
        y: lerp(y1, y2, localT),
        t: lerp(t1, t2, localT)
      });
    }
    // 計算每段速度，用熱力圖顏色（紅=快、藍=慢）
    const segSpeeds = [];
    let maxSpeed = 0.01;
    for (let j = 1; j < sampledPoints.length; j++) {
      const dx = sampledPoints[j].x - sampledPoints[j-1].x;
      const dy = sampledPoints[j].y - sampledPoints[j-1].y;
      const dt = sampledPoints[j].t - sampledPoints[j-1].t;
      const spd = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
      segSpeeds.push(spd);
      if (spd > maxSpeed) maxSpeed = spd;
    }
    combinedBuffer.noFill();
    combinedBuffer.strokeCap(ROUND);
    for (let j = 1; j < sampledPoints.length; j++) {
      const ratio = constrain(segSpeeds[j-1] / maxSpeed, 0, 1);
      // 紅=快 藍=慢 中間帶綠
      const r = Math.round(ratio * 255);
      const g = Math.round(Math.max(0, (1 - Math.abs(ratio - 0.5) * 2)) * 200);
      const b = Math.round((1 - ratio) * 255);
      combinedBuffer.stroke(r, g, b, 160);
      combinedBuffer.strokeWeight(1.0);
      combinedBuffer.line(
        sampledPoints[j-1].x, sampledPoints[j-1].y,
        sampledPoints[j].x, sampledPoints[j].y
      );
    }
    let totalPathLength = 0;
    for (let j = 0; j < sampledPoints.length - 1; j++) {
      totalPathLength += dist(sampledPoints[j].x, sampledPoints[j].y, sampledPoints[j + 1].x, sampledPoints[j + 1].y);
    }
    if (isNaN(totalPathLength) || totalPathLength <= 0 || sampledPoints.length < 2) {
      continue;
    }
    const arrowCount = constrain(floor(totalPathLength / 150), 1, 3);
    for (let a = 0; a < arrowCount; a++) {
      combinedBuffer.push();
      const arrowPhase = (time * 0.1 + strokePhase + a * (1.0 / arrowCount)) % 1.0;
      const targetDist = arrowPhase * totalPathLength;
      let accumulatedDist = 0;
      let arrowX = sampledPoints[0].x;
      let arrowY = sampledPoints[0].y;
      let angle = 0;
      for (let j = 0; j < sampledPoints.length - 1; j++) {
        const segDist = dist(sampledPoints[j].x, sampledPoints[j].y, sampledPoints[j + 1].x, sampledPoints[j + 1].y);
        if (segDist <= 0.0001) {
          arrowX = sampledPoints[j + 1].x;
          arrowY = sampledPoints[j + 1].y;
          if (j + 1 < sampledPoints.length - 1) {
            angle = atan2(sampledPoints[j + 2].y - sampledPoints[j + 1].y, sampledPoints[j + 2].x - sampledPoints[j + 1].x);
          } else {
            angle = atan2(sampledPoints[j + 1].y - sampledPoints[j].y, sampledPoints[j + 1].x - sampledPoints[j].x);
          }
          break;
        }
        if (accumulatedDist + segDist >= targetDist) {
          const localT = (targetDist - accumulatedDist) / segDist;
          const safeLocalT = isNaN(localT) || !isFinite(localT) ? 0 : constrain(localT, 0, 1);
          arrowX = lerp(sampledPoints[j].x, sampledPoints[j + 1].x, safeLocalT);
          arrowY = lerp(sampledPoints[j].y, sampledPoints[j + 1].y, safeLocalT);
          angle = atan2(sampledPoints[j + 1].y - sampledPoints[j].y, sampledPoints[j + 1].x - sampledPoints[j].x);
          break;
        }
        accumulatedDist += segDist;
      }
      const arrowAlpha = 200 * (1 - arrowPhase * 0.5);
      combinedBuffer.translate(arrowX, arrowY);
      combinedBuffer.rotate(angle);
      const arrowSize = 1.0 + sin(time * 3 + i + a) * 0.2;
      combinedBuffer.fill(0, 0, 255, arrowAlpha);
      combinedBuffer.noStroke();
      combinedBuffer.triangle(
        0, 0,
        -4 * arrowSize, -2 * arrowSize,
        -4 * arrowSize, 2 * arrowSize
      );
      combinedBuffer.stroke(0, 150, 255, arrowAlpha);
      combinedBuffer.strokeWeight(0.3);
      combinedBuffer.noFill();
      combinedBuffer.triangle(
        0, 0,
        -4 * arrowSize, -2 * arrowSize,
        -4 * arrowSize, 2 * arrowSize
      );
      combinedBuffer.pop();
    }
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    combinedBuffer.noFill();
    combinedBuffer.stroke(0, 0, 255, 150);
    combinedBuffer.strokeWeight(0.8);
    combinedBuffer.ellipse(startPoint.x, startPoint.y, 5, 5);
    combinedBuffer.ellipse(endPoint.x, endPoint.y, 5, 5);
    combinedBuffer.noStroke();
    combinedBuffer.fill(0, 0, 255, 255);
    combinedBuffer.ellipse(startPoint.x, startPoint.y, 2, 2);
    combinedBuffer.ellipse(endPoint.x, endPoint.y, 2, 2);
    if (font) {
      combinedBuffer.textFont(font);
      combinedBuffer.noStroke();
      const data = futureStroke.data;
      const brushMode = data.brushMode || '?';
      const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
      const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
      const textX = startPoint.x - 2;
      const textY = startPoint.y + 8;
      combinedBuffer.textSize(6);
      combinedBuffer.fill(0, 0, 255, 255);
      combinedBuffer.textAlign(LEFT, CENTER);
      combinedBuffer.text('#' + (i + 1), textX, textY);
    }
  }
  combinedBuffer.pop();
}

function drawScreenText() {
  oldBufferWhite.clear();
  oldBufferWhite.push();
  oldBufferWhite.noFill();
  oldBufferWhite.noStroke();
  oldBufferWhite.rectMode(CENTER);
  let ratio = (width * 0.05) / height;
  oldBufferWhite.rect(0, 0, width * 0.95, height * (1 - ratio));
  oldBufferWhite.translate(-width / 2 - 5, -height / 2 + 20);
  oldBufferWhite.textAlign(LEFT, TOP);
  if (font) {
    oldBufferWhite.textFont(font);
  }
  oldBufferWhite.textSize(6);
  let maxTextWidth = width - 50;
  oldBufferWhite.fill(0, 0, 0, 100);
  oldBufferWhite.noStroke();
  let displayLines = [];
  let currentY = screenTextY;
  let startIndex = Math.max(0, screenTextLines.length - maxScreenLines - screenTextScroll);
  let endIndex = screenTextLines.length;
  for (let i = startIndex; i < endIndex; i++) {
    let line = screenTextLines[i];
    let wrappedLines = wrapText(line.text, maxTextWidth, oldBufferWhite);
    for (let j = 0; j < wrappedLines.length; j++) {
      if (displayLines.length >= maxScreenLines) break;
      displayLines.push({
        type: line.type,
        text: wrappedLines[j],
        timestamp: line.timestamp
      });
    }
    if (displayLines.length >= maxScreenLines) break;
  }
  for (let i = 0; i < displayLines.length; i++) {
    let line = displayLines[i];
    let y = screenTextY + i * screenTextLineHeight;
    if (line.type === 'recording') {
      oldBufferWhite.fill(255, 0, 0, screenTextAlpha);
    } else if (line.type === 'playback') {
      oldBufferWhite.fill(0, screenTextAlpha);
    } else if (line.type === 'system') {
      oldBufferWhite.fill(0, 0, 255, screenTextAlpha);
    } else if (line.type === 'art') {
      oldBufferWhite.fill(0, screenTextAlpha);
    } else {
      oldBufferWhite.fill(0, screenTextAlpha);
    }
    oldBufferWhite.text("--", screenTextX, y);
    oldBufferWhite.text(line.text, screenTextX, y);
  }
  drawStrokeHighlight();
  oldBufferWhite.pop();
  drawStrokeDivider();
}

function drawStrokeDivider() {
  if (window.showStrokeDivider === false) return;
  const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
    allBrushStrokes.length :
    0;
  if (strokeCount === 0) return;
  oldBufferWhite.push();
  oldBufferWhite.resetMatrix();
  oldBufferWhite.translate(0, 0);
  const lineY = hh - 15;
  const lineWidth = width * 0.98;
  const lineStartX = -lineWidth / 2;
  const lineEndX = lineWidth / 2;
  const lineLength = lineEndX - lineStartX;
  oldBufferWhite.stroke(0, 50);
  oldBufferWhite.strokeWeight(1);
  oldBufferWhite.noFill();
  oldBufferWhite.line(lineStartX, lineY, lineEndX, lineY);
  oldBufferWhite.strokeWeight(1.2);
  oldBufferWhite.line(lineStartX, lineY + 5, lineStartX, lineY - 5);
  oldBufferWhite.line(lineEndX, lineY + 5, lineEndX, lineY - 5);
  if (strokeCount > 0) {
    const segmentWidth = lineLength / strokeCount;
    oldBufferWhite.stroke(0, 70);
    oldBufferWhite.strokeWeight(0.7);
    for (let i = 1; i < strokeCount; i++) {
      const x = lineStartX + i * segmentWidth;
      oldBufferWhite.line(x, lineY - 5, x, lineY);
    }
    if (font) oldBufferWhite.textFont(font);
    oldBufferWhite.textAlign(CENTER, CENTER);
    oldBufferWhite.textSize(10);
    oldBufferWhite.fill(0, 50);
    oldBufferWhite.noStroke();
    const textX = lineEndX;
    const textY = lineY - 15;
    oldBufferWhite.text(strokeCount.toString(), textX, textY);
  }
  oldBufferWhite.pop();
}

function drawStrokeHighlight() {
  if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
    const currentTime = millis();
    const elapsed = currentTime - currentStrokeHighlight.startTime;
    const fadeDuration = 1000;
    const fadeStart = fadeDuration * 0.5;
    if (elapsed < fadeDuration) {
      let alpha = 255;
      if (elapsed > fadeStart) {
        const fadeProgress = (elapsed - fadeStart) / (fadeDuration - fadeStart);
        alpha = 255 * (1 - fadeProgress);
      }
      const gp = currentStrokeHighlight.gridParams;
      oldBufferWhite.push();
      oldBufferWhite.resetMatrix();
      oldBufferWhite.translate(-hw - 10, -hh - 10);
      if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
        const dashLength = 5;
        const gapLength = 5;
        oldBufferWhite.stroke(255, 0, 0, alpha);
        oldBufferWhite.strokeWeight(1);
        oldBufferWhite.noFill();
        let drawDash = true;
        let accumulatedDist = 0;
        for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
          let x1 = currentStrokeHighlight.points[i].x;
          let y1 = currentStrokeHighlight.points[i].y;
          let x2 = currentStrokeHighlight.points[i + 1].x;
          let y2 = currentStrokeHighlight.points[i + 1].y;
          let segmentDist = dist(x1, y1, x2, y2);
          let dx = (x2 - x1) / segmentDist;
          let dy = (y2 - y1) / segmentDist;
          let currentDist = 0;
          while (currentDist < segmentDist) {
            let remainingInCycle = drawDash ? dashLength : gapLength;
            let distToDraw = min(remainingInCycle - accumulatedDist, segmentDist - currentDist);
            if (drawDash) {
              let startX = x1 + dx * currentDist;
              let startY = y1 + dy * currentDist;
              let endX = x1 + dx * (currentDist + distToDraw);
              let endY = y1 + dy * (currentDist + distToDraw);
              oldBufferWhite.line(startX, startY, endX, endY);
            }
            currentDist += distToDraw;
            accumulatedDist += distToDraw;
            if (accumulatedDist >= (drawDash ? dashLength : gapLength)) {
              drawDash = !drawDash;
              accumulatedDist = 0;
            }
          }
        }
        if (currentStrokeHighlight.points.length > 0) {
          const startPoint = currentStrokeHighlight.points[0];
          const endPoint = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
          oldBufferWhite.fill(255, 0, 0, alpha);
          oldBufferWhite.noStroke();
          oldBufferWhite.ellipse(startPoint.x, startPoint.y, 5, 5);
          oldBufferWhite.fill(255, 0, 0, alpha);
          oldBufferWhite.ellipse(endPoint.x, endPoint.y, 5, 5);
        }
      }
      const centerX = (gp.left + gp.right) / 2;
      const centerY = (gp.top + gp.bottom) / 2;
      oldBufferWhite.stroke(0, 0, 200, alpha);
      oldBufferWhite.strokeWeight(1.0);
      oldBufferWhite.noFill();
      oldBufferWhite.rectMode(CORNER);
      oldBufferWhite.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
      oldBufferWhite.pop();
    } else {
      currentStrokeHighlight = null;
    }
  }
}

function wrapText(text, maxWidth, buffer = null) {
  let words = text.split(' ');
  let lines = [];
  let currentLine = '';
  for (let i = 0; i < words.length; i++) {
    let testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    let testWidth = buffer ? buffer.textWidth(testLine) : textWidth(testLine);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function updateReferenceImageSize() {
  const referenceContainer = document.getElementById('reference-image-container');
  if (referenceContainer) {
    referenceContainer.style.width = (width * 1.0) + 'px';
    referenceContainer.style.height = (height * 1.0) + 'px';
    logArt('system', 'Reference image size updated', {
      Width: (width * 0.8) + 'px',
      Height: (height * 0.8) + 'px'
    });
  }
}

function touchStarted(e) {
  if (e && e.touches && e.touches.length > 0) {
    var t = e.touches[0];
    if (isMouseOverUIPanel(t.clientX, t.clientY)) {
      isMouseDownOnUIPanel = true;
      return true; // 回傳 true 讓 p5.js 不呼叫 preventDefault()，保留原生 click 事件
    }
  }
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    globalMouseX = point2(mouseX);
    globalMouseY = point2(mouseY);
    window._touchDrawing = true;
    mousePressed();
    return false;
  }
}

function touchMoved() {
  if (isMouseDownOnUIPanel) return true; // 保留原生行為
  globalMouseX = point2(mouseX);
  globalMouseY = point2(mouseY);
  return false;
}

function touchEnded() {
  if (isMouseDownOnUIPanel) {
    isMouseDownOnUIPanel = false;
    return true; // 保留原生行為，讓 touch→click 轉換完成
  }
  isMouseDownOnUIPanel = false;
  window._touchDrawing = false;
  mouseReleased();
  return false;
}
if (typeof window !== 'undefined') {
  window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}

function isMouseOverUIPanel(clientX, clientY) {
  const panels = [
    document.getElementById('message-overlay'),
    document.getElementById('control-panel'),
    document.getElementById('effect-control-panel'),
    document.getElementById('flow-effect-panel'),
    document.getElementById('zen-mode-btn')
  ];
  for (let panel of panels) {
    if (!panel) continue;
    const rect = panel.getBoundingClientRect();
    if (clientX >= rect.left && clientX <= rect.right &&
      clientY >= rect.top && clientY <= rect.bottom) {
      return true;
    }
  }
  return false;
}

function getLastStrokeBounds() {
  if (allBrushStrokes.length === 0) return null;
  const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
  if (lastStroke && lastStroke.bounds) {
    const padding = 20;
    return {
      minX: Math.max(0, (lastStroke.bounds.minX - padding)) / width,
      minY: Math.max(0, (lastStroke.bounds.minY - padding)) / height,
      maxX: Math.min(width, (lastStroke.bounds.maxX + padding)) / width,
      maxY: Math.min(height, (lastStroke.bounds.maxY + padding)) / height
    };
  }
  if (lastStroke && lastStroke.gridParams) {
    const gp = lastStroke.gridParams;
    const padding = 20;
    return {
      minX: Math.max(0, (gp.left - padding)) / width,
      minY: Math.max(0, (gp.top - padding)) / height,
      maxX: Math.min(width, (gp.right + padding)) / width,
      maxY: Math.min(height, (gp.bottom + padding)) / height
    };
  }
  return null;
}

function startFlowEffect(blendType, seed = null, isPlayback = false) {
  if (!flowProgram) return;
  flowEffectActive = true;
  flowEffectBlendType = blendType;
  flowEffectStartTime = millis();
  flowEffectFrameCount = 0;
  flowEffectIterationCount = 0;
  flowEffectIsPlayback = isPlayback;
  flowEffectSeed = seed !== null ? seed : Math.floor(Math.random() * 1000000);
  flowEffectParams.seed = flowEffectSeed * 0.0001;
}

function stopFlowEffect() {
  if (!flowEffectActive) return null;
  const duration = millis() - flowEffectStartTime;
  const iterations = flowEffectIterationCount;
  const frames = flowEffectFrameCount;
  if (iterations > 0 && flowEffectStrokeBounds) {
    flowEffectPendingCommit = true;
    flowEffectCommitData = {
      blendType: flowEffectBlendType,
      iterations: iterations,
      seed: flowEffectSeed,
      bounds: {
        ...flowEffectStrokeBounds
      }
    };
  }
  flowEffectActive = false;
  flowEffectBlendType = 0;
  flowEffectIsPlayback = false;
  return {
    duration,
    iterations,
    frames
  };
}

function updateFlowEffect() {
  if (!flowEffectActive) return;
  flowEffectFrameCount++;
  flowEffectIterationCount = Math.floor(flowEffectFrameCount / flowEffectFramesPerIteration);
  if (flowEffectIsPlayback && flowEffectTargetFrames > 0) {
    if (flowEffectFrameCount >= flowEffectTargetFrames) {
      flowEffectIterationCount = flowEffectTargetIterations;
      const countDisplay = document.getElementById('flow-iteration-count');
      if (countDisplay) {
        countDisplay.textContent = flowEffectIterationCount;
      }
      stopFlowEffect();
      flowEffectTargetFrames = 0;
      flowEffectTargetIterations = 0;
      return;
    }
  }
  const countDisplay = document.getElementById('flow-iteration-count');
  if (countDisplay) {
    countDisplay.textContent = flowEffectIterationCount;
  }
}

function replayFlowEffect(blendType, seed, iterations) {
  console.log('🌊 replayFlowEffect called:', {
    blendType,
    seed,
    iterations
  });
  console.log('  flowEffectStrokeBounds:', flowEffectStrokeBounds);
  if (!flowEffectStrokeBounds) {
    console.warn('Cannot replay Flow effect: bounds not available');
    return;
  }
  flowEffectParams.seed = seed * 0.0001;
  flowEffectPendingCommit = true;
  flowEffectCommitData = {
    blendType: blendType,
    iterations: iterations,
    seed: seed,
    bounds: {
      ...flowEffectStrokeBounds
    }
  };
  console.log('🌊 replayFlowEffect: set pendingCommit with data:', flowEffectCommitData);
}

// === js/brush-standard.js ===
const DIRECTION_PATTERNS = [{
  flip1stX: false,
  flip1stY: false
}, {
  flip1stX: true,
  flip1stY: false
}, {
  flip1stX: false,
  flip1stY: true
}, {
  flip1stX: true,
  flip1stY: true
}];

function setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, alpha) {
  if (brushColorMode === 0) {
    stroke(drawColor, alpha);
  } else if (brushColorMode === 1) {
    stroke(150, alpha);
  } else {
    stroke(drawColor2, alpha);
  }
}

function setBrusFillColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, alpha) {
  if (brushColorMode === 0) {
    fill(drawColor, alpha);
  } else if (brushColorMode === 1) {
    fill(150, alpha);
  } else {
    fill(drawColor2, alpha);
  }
}

function drawFlyBranch(id, buffer, branchConfig, x, y, prevX, prevY, startRANDX, startRANDY, flyBrushSize, sizeVariation, jitterValue) {
  let finalSize = flyBrushSize * sizeVariation + jitterValue;
  const branchIdentity = (inkPressed && typeof _panelBaseBrushSize !== 'undefined' && _panelBaseBrushSize !== null) ? _panelBaseBrushSize : baseBrushSize;
  const tinyBrush = branchIdentity < 0.25;
  let branchCeil = tinyBrush ? max(2.0, branchIdentity * 10) : 15;
  if (finalSize > branchCeil) {
    finalSize = crandom.random(tinyBrush ? 0.6 : 1, branchCeil);
  }
  let sw = max(tinyBrush ? 0.6 : 1, finalSize);
  if (sw < 3) sw *= 2.0; // TODO: 測試用，小線條加粗
  const offsetX = branchConfig.offsetX;
  const offsetY = branchConfig.offsetY;
  if (brushModeSP) {
    const spikeScale = max(0.15, min(1.5, branchIdentity));
    let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
    let randX = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * spikeScale, 6 * spikeScale) : crandom.random(-16 * spikeScale, 16 * spikeScale);
    let randY = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * spikeScale, 6 * spikeScale) : crandom.random(-16 * spikeScale, 16 * spikeScale);
    if (show == 1) {
      strokeWeight(crandom.random(0.5, 1.5))
      line(
        x + offsetX + startRANDX,
        y + offsetY + startRANDY,
        prevX + offsetX + randX,
        prevY + offsetY + randY
      );
    } else {
      sw = min(1, sw)
      strokeWeight(sw + 0.5);
      if (sw < 4) line(
        x + offsetX + startRANDX,
        y + offsetY + startRANDY,
        prevX + offsetX,
        prevY + offsetY
      );
    }
  } else if (!brushModeSP) {
    if (branchIdentity < 4.0) {
      strokeWeight(sw);
    } else {
      strokeWeight(crandom.random(sw * 0.5, sw));
    }
    line(
      x + offsetX + startRANDX,
      y + offsetY + startRANDY,
      prevX + offsetX,
      prevY + offsetY
    );
  }
}
const FLY_BRUSH_TYPE_2_CONFIG = [{
  offsetBase: 2,
  signX: +1,
  signY: +1,
  randThreshold: 0.05,
  pathProgressEnd: 0,
  jitterIndex: 4
}, {
  offsetBase: 1,
  signX: -1,
  signY: -1,
  randThreshold: 0.1,
  pathProgressEnd: 1,
  jitterIndex: 5
}, {
  offsetBase: 3,
  signX: -1,
  signY: -1,
  randThreshold: 0.12,
  pathProgressEnd: 2,
  jitterIndex: 6
}, {
  offsetBase: 1,
  signX: +1,
  signY: +1,
  randThreshold: 0.08,
  pathProgressEnd: 3,
  jitterIndex: 7
}, {
  offsetBase: 3,
  signX: +1,
  signY: +1,
  randThreshold: 0.2,
  pathProgressEnd: 4,
  jitterIndex: 8
}];
const FLY_BRUSH_TYPE_3_CONFIG = [{
  angle: 0,
  radius: 1.6,
  randThreshold: 0.065,
  pathProgressEnd: 0,
  jitterIndex: 9
}, {
  angle: Math.PI / 4,
  radius: 1.6,
  randThreshold: 0.10,
  pathProgressEnd: 1,
  jitterIndex: 10
}, {
  angle: Math.PI / 2,
  radius: 1.6,
  randThreshold: 0.125,
  pathProgressEnd: 2,
  jitterIndex: 11
}, {
  angle: 3 * Math.PI / 4,
  radius: 1.6,
  randThreshold: 0.15,
  pathProgressEnd: 3,
  jitterIndex: 12
}, {
  angle: Math.PI,
  radius: 1.6,
  randThreshold: 0.10,
  pathProgressEnd: 4,
  jitterIndex: 13
}, {
  angle: 5 * Math.PI / 4,
  radius: 1.6,
  randThreshold: 0.125,
  pathProgressEnd: 0,
  jitterIndex: 14
}, {
  angle: 3 * Math.PI / 2,
  radius: 1.6,
  randThreshold: 0.15,
  pathProgressEnd: 1,
  jitterIndex: 15
}, {
  angle: 7 * Math.PI / 4,
  radius: 1.6,
  randThreshold: 0.18,
  pathProgressEnd: 2,
  jitterIndex: 16
}];
const FLY_BRUSH_TYPE_4_CONFIG = [{
  angle: 0,
  radius: 1.0,
  randThreshold: 0.07,
  pathProgressEnd: 0,
  jitterIndex: 17
}, {
  angle: Math.PI / 6,
  radius: 1.0,
  randThreshold: 0.08,
  pathProgressEnd: 1,
  jitterIndex: 18
}, {
  angle: Math.PI / 3,
  radius: 1.0,
  randThreshold: 0.10,
  pathProgressEnd: 2,
  jitterIndex: 19
}, {
  angle: Math.PI / 2,
  radius: 1.0,
  randThreshold: 0.13,
  pathProgressEnd: 3,
  jitterIndex: 20
}, {
  angle: 2 * Math.PI / 3,
  radius: 1.0,
  randThreshold: 0.16,
  pathProgressEnd: 4,
  jitterIndex: 21
}, {
  angle: 5 * Math.PI / 6,
  radius: 1.0,
  randThreshold: 0.10,
  pathProgressEnd: 0,
  jitterIndex: 22
}, {
  angle: Math.PI,
  radius: 1.0,
  randThreshold: 0.13,
  pathProgressEnd: 1,
  jitterIndex: 23
}, {
  angle: 7 * Math.PI / 6,
  radius: 1.0,
  randThreshold: 0.16,
  pathProgressEnd: 2,
  jitterIndex: 24
}, {
  angle: 4 * Math.PI / 3,
  radius: 1.0,
  randThreshold: 0.19,
  pathProgressEnd: 3,
  jitterIndex: 25
}, {
  angle: 3 * Math.PI / 2,
  radius: 1.0,
  randThreshold: 0.13,
  pathProgressEnd: 4,
  jitterIndex: 26
}, {
  angle: 5 * Math.PI / 3,
  radius: 1.0,
  randThreshold: 0.16,
  pathProgressEnd: 0,
  jitterIndex: 27
}, {
  angle: 11 * Math.PI / 6,
  radius: 1.0,
  randThreshold: 0.19,
  pathProgressEnd: 1,
  jitterIndex: 28
}];

function sprayPaintOnBuffer(buffer, _tx, _ty) {
  if (mouseCount >= expectedStrokeLength) {
    console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", mouseCount, ">=", expectedStrokeLength, ")");
    return;
  }
  buffer.begin();
  push();
  translate(-hw, -hh);
  colorMode(RGB, 255);
  noStroke();
  let drawColor = doRandomRange(radColor);
  let drawColor2 = doRandomRange(radColor);
  const prevMouseX = isPlaying ? simulatedPMouseX : pmouseX;
  const prevMouseY = isPlaying ? simulatedPMouseY : pmouseY;
  let speed = 0.5 * initialSize * noise(_tx * 0.01, _ty * 0.01) * (abs(_tx - prevMouseX) + abs(_ty - prevMouseY));
  // 壓力推高時用面板值算 spray 參數，避免雙重放大（spraySize 已含面板值）
  const sprayBase = (inkPressed && typeof _panelBaseBrushSize !== 'undefined' && _panelBaseBrushSize !== null) ? _panelBaseBrushSize : baseBrushSize;
  let spraytempSize = 0;
  spraytempSize = min(spraySize * sprayBase, speed) * map(noise(_tx, _ty), 0, 1, 0.3, 1);
  let sprayNowSize = max(3, spraytempSize);
  if (mouseCount < 5) {
    let fadeInProgress = map(mouseCount, 0, 5, -0.2, 1.0);
    sprayNowSize = max(2, spraytempSize * fadeInProgress);
  } else if (mouseCount >= (expectedStrokeLength - 5)) {
    let fadeOutProgress = map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
    sprayNowSize = max(2, spraytempSize * fadeOutProgress);
  }
  for (let i = 0; i < spraySteps; i++) {
    const lerpX = lerp(_tx, prevMouseX, i / spraySteps)
    const lerpY = lerp(_ty, prevMouseY, i / spraySteps)
    for (let j = 0; j < 10; j++) {
      let randX, randY;
      let randBigDiameter = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
      const rand_a = crandom.random(TWO_PI);
      const rand_b = crandom.random();
      const rand_c = crandom.random(-sprayNowSize * randBigDiameter, sprayNowSize * randBigDiameter);
      const rand_d = crandom.random(-sprayNowSize * randBigDiameter, sprayNowSize * randBigDiameter);
      if (shapeType === 0) {
        const angle = rand_a;
        const radius = sqrt(rand_b) * sprayNowSize;
        randX = radius * cos(angle);
        randY = radius * sin(angle);
      } else if (shapeType === 1) {
        randX = sin(rand_a) * rand_c;
        randY = cos(rand_a) * rand_d;
      } else if (shapeType === 2) {
        const u = rand_a / TWO_PI;
        const v = rand_b;
        if (u + v > 1) {
          randX = sprayNowSize * (1 - u);
          randY = sprayNowSize * (1 - v);
        } else {
          randX = sprayNowSize * u;
          randY = sprayNowSize * v;
        }
        randX -= sprayNowSize * 0.5;
        randY -= sprayNowSize * 0.5;
      } else {
        const u = rand_c / sprayNowSize;
        const v = rand_d / sprayNowSize;
        const sum = abs(u) + abs(v);
        if (sum > 1) {
          randX = (u / sum) * sprayNowSize;
          randY = (v / sum) * sprayNowSize;
        } else {
          randX = u * sprayNowSize;
          randY = v * sprayNowSize;
        }
      }
      let rand1 = crandom.random(0, 1);
      let rand2 = crandom.random(0.2, 1);
      let rand3 = crandom.random(1, 2);
      let sizeFloor = sprayBase < 0.25 ? 0.1 : 0.3;
      rand2 = max(sizeFloor, rand2 * sprayBase);
      rand3 = max(sizeFloor, rand3 * sprayBase);
      let rand_alpha = crandom.random(100, 255);
      let ss = rand1 > 0.1 ? rand2 : rand3;
      if (brushMode == 3 || brushMode == 5) ss = ss * 2;
      let ssMin = sprayBase < 0.25 ? max(0.3, sprayBase * 3) : 2;
      let ssMax = sprayBase < 0.25 ? sprayBase * 5 : 20;
      ss = max(ssMin, min(ssMax, ss));
      setBrusFillColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_alpha);
      noStroke();
      ellipse(lerpX + randX, lerpY + randY, ss, ss)
    }
  }
  pop();
  buffer.end();
}

function brushPaintOnBuffer(buffer, _tx, _ty, pathProgress, flyBrushType = 0, mainStrokeDir = 0) {
  if (mouseCount >= expectedStrokeLength) {
    console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", mouseCount, ">=", expectedStrokeLength, ")");
    return;
  }
  buffer.begin();
  push();
  translate(-hw, -hh);
  colorMode(RGB, 255);
  let drawColor = doRandomRange(radColor);
  let drawColor2 = doRandomRange(radColor);
  // 筆刷身份判斷用面板值，避免壓力推高時 tinyBrush/swCeil/defultLineWidth 突變
  const brushIdentity = (inkPressed && typeof _panelBaseBrushSize !== 'undefined' && _panelBaseBrushSize !== null) ? _panelBaseBrushSize : baseBrushSize;
  // 壓力寬度倍率：force 0~0.7 → 0.5~1.0（連續），force >= 0.7 → 1.0
  // 與 baseBrushSize 離散跳階獨立，同一支筆輕壓細、重壓粗
  const rawForceForWidth = inkPressed ? (isPlaying ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : penPressureRaw) : -1;
  const pressureWidth = (rawForceForWidth >= 0) ? (0.7 + 0.4 * Math.min(rawForceForWidth / 0.7, 1.0)) : 1.0;
  let tinyBrush = brushIdentity < 0.25;
  let minVisibleStroke = 0.6;
  let defultLineWidth = tinyBrush ?
    crandom.random(0.4, 0.8) :
    crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
  let swFloorTiny = max(minVisibleStroke, baseBrushSize * 2);
  let swFloorNormal = max(minVisibleStroke, baseBrushSize * 1.5);
  let swFloor = tinyBrush ? swFloorTiny : swFloorNormal;
  if (swFloor < 3) swFloor *= 2.0; // TODO: 測試用，小值加粗
  let flyFloor = tinyBrush ?
    swFloorTiny :
    max(minVisibleStroke, baseBrushSize * 1.2);
  if (flyFloor < 3) flyFloor *= 2.0; // TODO: 測試用，小值加粗
  let swCeil;
  if (tinyBrush) {
    swCeil = max(2.0, brushIdentity * 10);
  } else if (brushIdentity < 0.5) {
    swCeil = 0.7;
  } else {
    swCeil = 9999;
  }
  oldR = brushSizeNow * 0.5;
  let targetX = _tx;
  let targetY = _ty;
  if (!isFirstDraw) {
    isFirstDraw = 1;
    x = targetX;
    y = targetY;
  }
  brushAccelX += (targetX - x) * springForce;
  brushAccelY += (targetY - y) * springForce;
  brushAccelX *= dampingForce;
  brushAccelY *= dampingForce;
  let currentSpeed = sqrt(brushAccelX * brushAccelX + brushAccelY * brushAccelY);
  brushSpeed += currentSpeed - brushSpeed;
  if (baseBrushSize <= 1.0) {
    brushSpeed *= 0.9;
  } else if (baseBrushSize <= 2.0) {
    brushSpeed *= 1.3;
  } else if (baseBrushSize <= 3.0) {
    brushSpeed *= 2.0;
  } else {
    brushSpeed *= 3.0;
  }
  brushSizeNow = brushSize - brushSpeed;
  let ctlNoisebyFrame = brushPaintCtlNoisebyFrame;
  let offset1x = 1.0 * baseBrushSize * ctlNoisebyFrame * pressureWidth;
  let offset2x = 2.0 * baseBrushSize * ctlNoisebyFrame * pressureWidth;
  let offset3x = 3.0 * baseBrushSize * ctlNoisebyFrame * pressureWidth;
  let showMainBrush = 0.1;
  let strokeWeightLimit = initialSize;
  let startRANDX = 0;
  let startRANDY = 0;
  if (mainStrokeDir == 0) showMainBrush = 0.08;
  else if (mainStrokeDir == 1) showMainBrush = 0.6;
  else if (mainStrokeDir == 2) showMainBrush = 0.2;
  let ctljitter = 1.0;
  let currentInterpolationSteps = interpolationSteps + brushPaintInterpolationOffset;
  for (let i = 0; i < currentInterpolationSteps; ++i) {
    let maxFlyBrushType = baseBrushSize >= 1.0 ? 5 : 3;
    let minFlyBrushType = baseBrushSize >= 1.0 ? 2 : 0;
    let rand_flyBrushType = 0;
    if (baseBrushSize < 1.5) rand_flyBrushType = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
    else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) rand_flyBrushType = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
    else if (baseBrushSize > 6.0) rand_flyBrushType = crandom.random(0, 1) > 0.3 ? 3 : 4;
    if (brushModeSP) rand_flyBrushType = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
    flyBrushType = rand_flyBrushType;
    if (mouseCount < 5) flyBrushType = crandom.random(0, 1) > 0.2 ? 5 : flyBrushType;
    let prevX = x;
    let prevY = y;
    x += brushAccelX / currentInterpolationSteps;
    y += brushAccelY / currentInterpolationSteps;
    let rand_jump_check = crandom.random(0, 1);
    let rand_jump_value = crandom.random(0, 4);
    let rand_jitter = crandom.random(0, 3);
    let rand_explodeX1 = crandom.random(-1, 1);
    let rand_explodeY1 = crandom.random(-1, 1);
    let rand_explodeX2 = crandom.random(-1, 1);
    let rand_explodeY2 = crandom.random(-1, 1);
    let currentShowMainBrush = showMainBrush;
    let currentDefultScale = 1.0;
    if (flyBrushType == 3) {
      currentShowMainBrush *= 0.8;
      currentDefultScale *= 0.8;
    } else if (flyBrushType == 4) {
      currentShowMainBrush *= 0.6;
      currentDefultScale *= 0.5;
    }
    if (brushIdentity < 0.25) {
      currentShowMainBrush = 0.18;
    } else if (brushIdentity < 1.5) {
      currentShowMainBrush = 0.1;
    }
    gobalSize = lerp(gobalSize, brushSizeNow, 0.5);
    if (brushMode == 1) {
      if (rand_jump_check > 0.8 && oldR < 2 && i == 0) {
        oldR = point2(rand_jump_value);
      }
    } else {
      oldR += (gobalSize - oldR) * 0.3;
    }
    let smoothRadius;
    if (brushMode == 1) {
      smoothRadius = oldR;
    } else {
      if (mouseCount < 5) {
        let fadeInProgress = map(mouseCount, 0, 5, 0.05, 1.0);
        smoothRadius = max(tinyBrush ? 0.1 : 0.5, oldR * fadeInProgress);
        if (explodeStart) {
          startRANDX = rand_explodeX1 * map(mouseCount, 0, 5, 10, 0);
          startRANDY = rand_explodeY1 * map(mouseCount, 0, 5, 10, 0);
        }
      } else if (mouseCount >= (expectedStrokeLength - 5)) {
        let fadeOutProgress = map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
        smoothRadius = max(tinyBrush ? 0.1 : 0.5, oldR * fadeOutProgress);
        if (explodeEnd) {
          startRANDX = rand_explodeX2 * map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
          startRANDY = rand_explodeY2 * map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
        }
      } else {
        if (oldR > 2) {
          smoothRadius = max(tinyBrush ? 0.2 : 1, oldR);
        } else {
          let jitterOffset = (rand_jitter / 3) - 0.5;
          smoothRadius = max(tinyBrush ? 0.1 : 0.5, oldR + jitterOffset);
        }
      }
    }
    let mainBrushSize = smoothRadius;
    let flyBrushSize = smoothRadius * 0.5;
    if (flyBrushType == 3) {
      mainBrushSize *= 0.8;
      flyBrushSize *= 0.8;
    } else if (flyBrushType == 4) {
      mainBrushSize *= 0.5;
      flyBrushSize *= 0.5;
    }
    let rand_showMainBrush = crandom.random(0, 1);
    let rand_mainAlpha = crandom.random(150, 255);
    let rand_flyAlpha1 = crandom.random(100, 255);
    let rand_flyAlpha2 = crandom.random(100, 255);
    let rand_flyAlpha3 = crandom.random(100, 255);
    if (tinyBrush) {
      if (!brushModeSP && mouseCount > 1) {
        setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_mainAlpha);
        let kk = min(strokeWeightLimit, max(swFloor, mainBrushSize));
        strokeWeight(min(swCeil, kk));
        line(x + startRANDX, y + startRANDY, prevX, prevY);
      }
    } else if (rand_showMainBrush > currentShowMainBrush) {
      setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_mainAlpha);
      const mainLineAllowed = !brushModeSP && mouseCount > 3 && baseBrushSize < 4.0;
      if (mainBrushSize < 5) {
        let kk = 0;
        if (mainStrokeDir == 0) kk = 1.5 * min(strokeWeightLimit, max(swFloor, mainBrushSize));
        else kk = min(strokeWeightLimit, max(swFloor, mainBrushSize));
        strokeWeight(min(swCeil, kk));
        if (mainLineAllowed) line(x + startRANDX, y + startRANDY, prevX, prevY)
      } else {
        let kk = currentDefultScale * min(strokeWeightLimit, max(swFloor, mainBrushSize));
        if (kk > 15) kk = crandom.random(1.5, kk);
        strokeWeight(min(swCeil, kk));
        if (mainLineAllowed) line(x + startRANDX, y + startRANDY, prevX, prevY)
      }
    }
    const rand_fly = [];
    const rand_fly_jitter = [];
    for (let j = 0; j < 30; j++) {
      rand_fly.push(crandom.random(0, 1));
      rand_fly_jitter.push(crandom.random(-0.5, 0.5) * ctljitter);
    }
    if (mainStrokeDir == 1) {
      rand_fly[0] = rand_fly[0] * 2.0;
      rand_fly[1] = rand_fly[1] * 0.5;
      rand_fly[2] = rand_fly[2] * 0.5;
    } else if (mainStrokeDir == 2) {
      rand_fly[0] = rand_fly[0] * 0.5;
      rand_fly[1] = rand_fly[1] * 0.5;
      rand_fly[2] = rand_fly[2] * 0.5;
    }
    const pattern = DIRECTION_PATTERNS[brushDir];
    if (flyBrushType == 0) {
      setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha1);
      if (rand_fly[0] > 0.2) {
        const signX1 = pattern.flip1stX ? -1 : +1;
        const signY1 = pattern.flip1stY ? -1 : +1;
        let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
        sizeVariation = max(1 + rand_fly_jitter[0], sizeVariation);
        if (flyBrushSize * sizeVariation < 5) {
          strokeWeight(min(swCeil, noise(x * 0.1, y * 0.2) + 1.5 * max(flyFloor, flyBrushSize * sizeVariation)));
        } else {
          strokeWeight(min(swCeil, currentDefultScale * max(defultLineWidth, flyBrushSize * sizeVariation)));
        }
        line(x + signX1 * offset2x + startRANDX, y + signY1 * offset2x + startRANDY, prevX + signX1 * offset2x, prevY + signY1 * offset2x);
      }
      if (rand_fly[1] > 0.3) {
        const signX2 = pattern.flip1stX ? -1 : +1;
        const signY2 = pattern.flip1stY ? +1 : -1;
        setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha2);
        let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
        sizeVariation = max(1 + rand_fly_jitter[1], sizeVariation);
        strokeWeight(min(swCeil, currentDefultScale * max(defultLineWidth, flyBrushSize * sizeVariation)));
        line(x + signX2 * offset2x + startRANDX, y + signY2 * offset2x + startRANDY, prevX + signX2 * offset2x, prevY + signY2 * offset2x);
      }
    } else if (flyBrushType == 1) {
      setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha1);
      if (rand_fly[0] > 0.1) {
        const signX1 = pattern.flip1stX ? -1 : +1;
        const signY1 = pattern.flip1stY ? -1 : +1;
        let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
        sizeVariation = max(1 + rand_fly_jitter[0], sizeVariation);
        strokeWeight(min(swCeil, currentDefultScale * max(defultLineWidth, flyBrushSize * sizeVariation)));
        line(x + signX1 * offset2x + startRANDX, y + signY1 * offset2x + startRANDY, prevX + signX1 * offset2x, prevY + signY1 * offset2x)
      };
      if (rand_fly[1] > 0.05) {
        const signX2 = pattern.flip1stX ? -1 : +1;
        const signY2 = pattern.flip1stY ? +1 : -1;
        setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha2);
        let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
        sizeVariation = max(1 + rand_fly_jitter[1], sizeVariation);
        strokeWeight(min(swCeil, currentDefultScale * max(defultLineWidth, flyBrushSize * sizeVariation)));
        line(x + signX2 * offset1x + startRANDX, y + signY2 * offset1x + startRANDY, prevX + signX2 * offset1x, prevY + signY2 * offset1x)
      };
      if (rand_fly[2] > 0.15) {
        const signX3 = -1;
        const signY3 = -1;
        setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha3);
        let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
        sizeVariation = max(1 + rand_fly_jitter[2], sizeVariation);
        if (flyBrushSize * sizeVariation < 5) {
          strokeWeight(min(swCeil, noise(x * 1, y * 2) + 1.5 * max(flyFloor, flyBrushSize * sizeVariation)));
        } else {
          strokeWeight(min(swCeil, currentDefultScale * max(defultLineWidth, flyBrushSize * sizeVariation)));
        }
        line(x + signX3 * offset3x + startRANDX, y + signY3 * offset3x + startRANDY, prevX + signX3 * offset3x, prevY + signY3 * offset3x)
      };
    } else if (flyBrushType == 2) {
      let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
      setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha1);
      const randValues = [rand_fly[0], rand_fly[1], rand_fly[2], rand_fly[3], rand_fly[4]];
      const jitterValues = [rand_fly_jitter[3], rand_fly_jitter[4], rand_fly_jitter[5], rand_fly_jitter[6], rand_fly_jitter[7]];
      for (let i = 0; i < FLY_BRUSH_TYPE_2_CONFIG.length; i++) {
        const branch = FLY_BRUSH_TYPE_2_CONFIG[i];
        const randValue = randValues[i];
        const jitterValue = jitterValues[i];
        if (randValue > branch.randThreshold) {
          let baseOffset;
          if (branch.offsetBase === 1) {
            baseOffset = offset1x;
          } else if (branch.offsetBase === 2) {
            baseOffset = offset2x;
          } else if (branch.offsetBase === 3) {
            baseOffset = offset3x;
          } else {
            baseOffset = branch.offsetBase * baseBrushSize * ctlNoisebyFrame;
          }
          let finalSignX, finalSignY;
          if (i === 0) {
            finalSignX = pattern.flip1stX ? -branch.signX : branch.signX;
            finalSignY = pattern.flip1stY ? -branch.signY : branch.signY;
          } else {
            finalSignX = branch.signX;
            finalSignY = branch.signY;
          }
          let actualOffsetX = finalSignX * baseOffset;
          let actualOffsetY = finalSignY * baseOffset;
          const branchConfig = {
            offsetX: actualOffsetX,
            offsetY: actualOffsetY,
            randThreshold: branch.randThreshold,
            pathProgressEnd: branch.pathProgressEnd,
            jitterIndex: branch.jitterIndex
          };
          drawFlyBranch(
            2, buffer, branchConfig, x, y, prevX, prevY,
            startRANDX, startRANDY, flyBrushSize, sizeVariation,
            jitterValue
          );
        }
      }
    } else if (flyBrushType == 3) {
      let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
      setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_flyAlpha1);
      let baseOffsetMultiplier = baseBrushSize * ctlNoisebyFrame;
      if (baseBrushSize > 4.0) baseOffsetMultiplier *= crandom.random(0.5, 2.5);
      for (let i = 0; i < FLY_BRUSH_TYPE_3_CONFIG.length; i++) {
        let eachk = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
        const branch = FLY_BRUSH_TYPE_3_CONFIG[i];
        const randValue = rand_fly[i];
        const jitterValue = rand_fly_jitter[branch.jitterIndex];
        if (randValue > branch.randThreshold) {
          const baseOffsetX = cos(branch.angle + eachk) * branch.radius * baseOffsetMultiplier;
          const baseOffsetY = sin(branch.angle + eachk) * branch.radius * baseOffsetMultiplier;
          const actualOffsetX = (pattern.flip1stX ? -1 : 1) * baseOffsetX;
          const actualOffsetY = (pattern.flip1stY ? -1 : 1) * baseOffsetY;
          const branchConfig = {
            offsetX: actualOffsetX,
            offsetY: actualOffsetY,
            randThreshold: branch.randThreshold,
            pathProgressEnd: branch.pathProgressEnd,
            jitterIndex: branch.jitterIndex
          };
          drawFlyBranch(
            3, buffer, branchConfig, x, y, prevX, prevY,
            startRANDX, startRANDY, flyBrushSize, sizeVariation,
            jitterValue
          );
        }
      }
    } else if (flyBrushType == 4) {
      let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
      setBrushColorForBuffer(buffer, drawColor, brushColorMode, rand_flyAlpha1);
      let baseOffsetMultiplier = baseBrushSize * ctlNoisebyFrame;
      if (baseBrushSize > 4.0) baseOffsetMultiplier *= crandom.random(0.5, 2.5);
      for (let i = 0; i < FLY_BRUSH_TYPE_4_CONFIG.length; i++) {
        let eachk = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
        const branch = FLY_BRUSH_TYPE_4_CONFIG[i];
        const randValue = rand_fly[i];
        const jitterValue = rand_fly_jitter[branch.jitterIndex];
        if (randValue > branch.randThreshold) {
          const baseOffsetX = cos(branch.angle + eachk) * branch.radius * baseOffsetMultiplier;
          const baseOffsetY = sin(branch.angle + eachk) * branch.radius * baseOffsetMultiplier;
          const actualOffsetX = (pattern.flip1stX ? -1 : 1) * baseOffsetX;
          const actualOffsetY = (pattern.flip1stY ? -1 : 1) * baseOffsetY;
          const branchConfig = {
            offsetX: actualOffsetX,
            offsetY: actualOffsetY,
            randThreshold: branch.randThreshold,
            pathProgressEnd: branch.pathProgressEnd,
            jitterIndex: branch.jitterIndex
          };
          drawFlyBranch(
            4, buffer, branchConfig, x, y, prevX, prevY,
            startRANDX, startRANDY, flyBrushSize, sizeVariation,
            jitterValue
          );
        }
      }
    }
  }
  pop();
  buffer.end();
}

function penSketchOnBuffer(buffer, _tx, _ty, _prevTx = null, _prevTy = null, n = 80, o = 2) {
  buffer.begin();
  push();
  translate(-hw, -hh);
  const prevMouseX = (_prevTx !== null && _prevTy !== null) ? _prevTx : (isPlaying ? simulatedPMouseX : pmouseX);
  const prevMouseY = (_prevTx !== null && _prevTy !== null) ? _prevTy : (isPlaying ? simulatedPMouseY : pmouseY);
  const penSketchIdentity = (inkPressed && typeof _panelBaseBrushSize !== 'undefined' && _panelBaseBrushSize !== null) ? _panelBaseBrushSize : baseBrushSize;
  // penSketchVisual: 用實際 baseBrushSize 控制視覺大小（壓力推高時跟隨），penSketchIdentity 只做角色門檻
  const penSketchVisual = baseBrushSize;
  const frameSeed = mouseCount;
  const calculatedBrushSize = max(penSketchIdentity < 0.25 ? 0.3 : 1, initialSize - (mouseCount * randStep));
  o = min(penSketchVisual * 2.0, 5 * calculatedBrushSize * penSketchNoiseBase * map(sin(frameSeed * 2), 0, 1, 0.5, 1.5));
  const mouseMoved = abs(_tx - prevMouseX) > 0.1 || abs(_ty - prevMouseY) > 0.1;
  let drawColor = doRandomRange(radColor);
  let drawColor2 = doRandomRange(radColor);
  const precomputedParams = [];
  for (let i = 0; i < n; i++) {
    precomputedParams.push({
      t: crandom.random(0, 1),
      strokeWeight: max(penSketchIdentity < 0.25 ? 0.1 : 0.3, min(penSketchIdentity < 0.25 ? penSketchVisual * 5 : 2, penSketchVisual * crandom.random(-0.5, 1))),
      angle: crandom.random(0, TWO_PI),
      radius: sqrt(crandom.random(0, 1)) * o,
      alpha: crandom.random(150, 255)
    });
  }
  for (let i = 0; i < n; i++) {
    const params = precomputedParams[i];
    let t = params.t;
    strokeWeight(params.strokeWeight);
    const angle = params.angle;
    const radius = params.radius;
    let rand_offsetX = radius * cos(angle);
    let rand_offsetY = radius * sin(angle);
    let rand_alpha = params.alpha;
    let x, y;
    if (mouseMoved) {
      x = lerp(_tx, prevMouseX, t) + rand_offsetX;
      y = lerp(_ty, prevMouseY, t) + rand_offsetY;
    } else {
      x = _tx + rand_offsetX;
      y = _ty + rand_offsetY;
    }
    setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_alpha);
    if (mouseCount > 3) point(x, y);
  }
  pop();
  buffer.end();
}
if (typeof markerOnBuffer.lastAngle === 'undefined') {
  markerOnBuffer.lastAngle = 0;
}
if (typeof markerOnBuffer.lastMovementAngle === 'undefined') {
  markerOnBuffer.lastMovementAngle = 0;
}
const MARKER_FLY_CONFIG = [{
  perpOffset: 1.5,
  randThreshold: 0.7
}, {
  perpOffset: -1.5,
  randThreshold: 0.75
}, {
  perpOffset: 3.0,
  randThreshold: 0.8
}, {
  perpOffset: -3.0,
  randThreshold: 0.85
}, {
  perpOffset: 5.0,
  randThreshold: 0.9
}, ];

function doRandomRange(drawColor) {
  if (brushColorMode === 0) {
    return drawColor + crandom.random(10, 40);
  } else {
    return drawColor + crandom.random(30, 80);
  }
}

function markerOnBuffer(buffer, _tx, _ty, pathProgress, flyBrushType = 0, mainStrokeDir = 0) {
  if (mouseCount >= expectedStrokeLength) {
    console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", mouseCount, ">=", expectedStrokeLength, ")");
    return;
  }
  const markerIdentity = (inkPressed && typeof _panelBaseBrushSize !== 'undefined' && _panelBaseBrushSize !== null) ? _panelBaseBrushSize : baseBrushSize;
  let tinyBrush = markerIdentity < 0.25;
  let swCeil = tinyBrush ? markerIdentity * 5 : 9999;
  buffer.begin();
  push();
  translate(-hw, -hh);
  colorMode(RGB, 255);
  let drawColor = doRandomRange(radColor);
  let drawColor2 = doRandomRange(radColor);
  let strokeWeightLimit = initialSize * 0.3;
  let targetX = _tx;
  let targetY = _ty;
  if (!isFirstDraw) {
    isFirstDraw = 1;
    x = targetX;
    y = targetY;
  }
  brushAccelX += (targetX - x) * springForce;
  brushAccelY += (targetY - y) * springForce;
  brushAccelX *= dampingForce;
  brushAccelY *= dampingForce;
  brushSpeed += sqrt(brushAccelX * brushAccelX + brushAccelY * brushAccelY) - brushSpeed;
  brushSpeed *= 1.2;
  if (baseBrushSize <= 1.0) {
    brushSpeed *= 0.9;
  } else if (baseBrushSize <= 2.0) {
    brushSpeed *= 1.3;
  } else {
    brushSpeed *= 1.5;
  }
  brushSizeNow = brushSize - brushSpeed;
  let startBrushSize = gobalSize;
  let targetBrushSize = brushSizeNow;
  let totalDx = targetX - x;
  let totalDy = targetY - y;
  let totalDistance = sqrt(totalDx * totalDx + totalDy * totalDy);
  let estimatedSmoothRadius = max(tinyBrush ? 0.1 : 0.5, targetBrushSize * 0.5);
  let estimatedSS = 1.5 * min(strokeWeightLimit, max(tinyBrush ? 0.5 : 4, estimatedSmoothRadius));
  let rectWidth = estimatedSS * 0.6;
  let spacingRatio = 0.8;
  let rectSpacing = max(rectWidth * spacingRatio, 0.5);
  let requiredSteps = max(1, ceil(totalDistance / rectSpacing));
  requiredSteps = max(10, min(50, requiredSteps));
  let drawStepRatio = requiredSteps / interpolationSteps;
  let startRANDX = 0;
  let startRANDY = 0;
  let speedFactor = min(1.0, totalDistance / 10);
  let isFlyingWhite = speedFactor > 0.3;
  rectMode(CENTER);
  let gray = crandom.random(50, 100);
  const precomputedRandoms = [];
  for (let i = 0; i < interpolationSteps; ++i) {
    precomputedRandoms.push({
      explodeX1: crandom.random(-1, 1),
      explodeY1: crandom.random(-1, 1),
      explodeX2: crandom.random(-1, 1),
      explodeY2: crandom.random(-1, 1),
      showMainBrush: crandom.random(0, 1),
      mainAlpha: crandom.random(80, 200),
      rectWidthMult: crandom.random(0.8, 1.2),
      flyWhiteRandoms: [
        crandom.random(0, 1),
        crandom.random(0, 1),
        crandom.random(0, 1),
        crandom.random(0, 1),
        crandom.random(0, 1)
      ]
    });
  }
  for (let i = 0; i < interpolationSteps; ++i) {
    const precomputed = precomputedRandoms[i];
    let prevX = x;
    let prevY = y;
    x += brushAccelX / interpolationSteps;
    y += brushAccelY / interpolationSteps;
    let progress = (i + 1) / interpolationSteps;
    let intermediateTarget = lerp(startBrushSize, targetBrushSize, progress);
    gobalSize = lerp(gobalSize, intermediateTarget, 0.5);
    oldR += (gobalSize - oldR) * 0.8;
    oldR = max(tinyBrush ? 0.2 : 1.5, oldR);
    let smoothRadius;
    let rand_explodeX1 = precomputed.explodeX1;
    let rand_explodeY1 = precomputed.explodeY1;
    let rand_explodeX2 = precomputed.explodeX2;
    let rand_explodeY2 = precomputed.explodeY2;
    if (mouseCount < 5) {
      let fadeInProgress = map(mouseCount, 0, 5, 0.05, 1.0);
      smoothRadius = max(tinyBrush ? 0.1 : 0.5, oldR * fadeInProgress);
      if (explodeStart) {
        startRANDX = rand_explodeX1 * map(mouseCount, 0, 5, 10, 0);
        startRANDY = rand_explodeY1 * map(mouseCount, 0, 5, 10, 0);
      }
    } else if (mouseCount >= (expectedStrokeLength - 5)) {
      let fadeOutProgress = map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
      smoothRadius = max(tinyBrush ? 0.1 : 0.5, oldR * fadeOutProgress);
      if (explodeEnd) {
        startRANDX = rand_explodeX2 * map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
        startRANDY = rand_explodeY2 * map(mouseCount, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
      }
    } else {
      smoothRadius = max(tinyBrush ? 0.1 : 0.5, oldR);
    }
    let rand_showMainBrush = precomputed.showMainBrush;
    let rand_mainAlpha = precomputed.mainAlpha;
    let showMainBrush = 0.3;
    let adjustedShowMainBrush = showMainBrush;
    if (drawStepRatio > 1.0) {
      adjustedShowMainBrush = showMainBrush / drawStepRatio;
    } else if (drawStepRatio < 1.0) {
      adjustedShowMainBrush = showMainBrush * (2.0 - drawStepRatio);
    }
    if (rand_showMainBrush > adjustedShowMainBrush && mouseCount > 5) {
      noStroke();
      setBrushColorForBuffer(buffer, drawColor, drawColor2, brushColorMode, rand_mainAlpha);
      let ss = min(swCeil, 1.2 * min(strokeWeightLimit, max(3 * markerIdentity, smoothRadius)));
      let dx = x - prevX;
      let dy = y - prevY;
      let distance = sqrt(dx * dx + dy * dy);
      let currentAngle;
      const minDistance = 0.1;
      if (distance < minDistance) {
        currentAngle = markerOnBuffer.lastAngle;
      } else {
        let movementAngle = atan2(dy, dx);
        currentAngle = movementAngle + PI / 2;
        markerOnBuffer.lastAngle = currentAngle;
        markerOnBuffer.lastMovementAngle = movementAngle;
      }
      push();
      translate(x, y);
      rotate(currentAngle);
      let rectWidth = ss * precomputed.rectWidthMult;
      rect(0, 0, rectWidth, rectWidth * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
      pop();
    }
    if (speedFactor > 0.9 && mouseCount > 5 && mouseCount < (expectedStrokeLength - 5)) {
      let perpX = -sin(markerOnBuffer.lastMovementAngle);
      let perpY = cos(markerOnBuffer.lastMovementAngle);
      for (let j = 0; j < MARKER_FLY_CONFIG.length; j++) {
        let cfg = MARKER_FLY_CONFIG[j];
        let randFly = precomputed.flyWhiteRandoms[j];
        let adjustedThreshold = cfg.randThreshold - speedFactor * 0.3;
        if (randFly > adjustedThreshold) {
          let offsetX = perpX * cfg.perpOffset * markerIdentity;
          let offsetY = perpY * cfg.perpOffset * markerIdentity;
          stroke(gray);
          strokeWeight(min(swCeil, max(tinyBrush ? 0.1 : 0.5, smoothRadius * 0.3)));
          line(prevX + offsetX, prevY + offsetY, x + offsetX, y + offsetY);
        }
      }
    }
  }
  pop();
  buffer.end();
}

// === js/brush-gothic.js ===
let gothicdotss = [];
let gothicDotIdCounter = 0;

function generateFlyBrushConfig(baseBrushSize, strokeSeed) {
  let minCount, maxCount;
  if (baseBrushSize <= 0.1) {
    minCount = 2;
    maxCount = 4;
  } else if (baseBrushSize <= 0.25) {
    minCount = 4;
    maxCount = 7;
  } else if (baseBrushSize <= 0.5) {
    minCount = 6;
    maxCount = 10;
  } else if (baseBrushSize <= 2.0) {
    minCount = 10;
    maxCount = 15;
  } else if (baseBrushSize <= 3.0) {
    minCount = 20;
    maxCount = 30;
  } else {
    minCount = 30;
    maxCount = 50;
  }
  let count;
  if (minCount === maxCount) {
    count = minCount;
  } else {
    const configSeed = strokeSeed + 50000;
    randomSeed(configSeed);
    count = Math.floor(crandom.random(minCount, maxCount + 1));
  }
  const config = [];
  const baseConfigSeed = strokeSeed + 60000;
  for (let i = 0; i < count; i++) {
    const offsetSeed = baseConfigSeed + i * 1000;
    randomSeed(offsetSeed);
    const perpOffset = crandom.random(-6, 6);
    const thresholdSeed = baseConfigSeed + i * 2000 + 1;
    randomSeed(thresholdSeed);
    const randThreshold = crandom.random(0.5, 1.0);
    const sizeSeed = baseConfigSeed + i * 3000 + 2;
    randomSeed(sizeSeed);
    const sizeMultiplier = crandom.random(1.0, 2.0);
    const speedSeed = baseConfigSeed + i * 4000 + 3;
    randomSeed(speedSeed);
    const speedMultiplier = crandom.random(0.7, 1.3);
    const minWeightSeed = baseConfigSeed + i * 5000 + 4;
    randomSeed(minWeightSeed);
    const minStrokeWeight = crandom.random(0.8, 1.2);
    const startOffsetSeed = baseConfigSeed + i * 6000 + 5;
    randomSeed(startOffsetSeed);
    const startOffset = Math.floor(crandom.random(0, 6));
    const endDistanceOffsetSeed = baseConfigSeed + i * 7000 + 6;
    randomSeed(endDistanceOffsetSeed);
    const endDistanceOffset = crandom.random(0, 8);
    const brushSpeedMultiplierSeed = baseConfigSeed + i * 8000 + 7;
    randomSeed(brushSpeedMultiplierSeed);
    const brushSpeedMultiplier = crandom.random(1.0, 2.0);
    const widthVariationSeed = baseConfigSeed + i * 9000 + 8;
    randomSeed(widthVariationSeed);
    const widthVariationFactor = crandom.random(0, 1);
    const offsetVariationSeed = baseConfigSeed + i * 10000 + 9;
    randomSeed(offsetVariationSeed);
    const offsetVariationFactor = crandom.random(0, 1);
    config.push({
      perpOffset: perpOffset,
      randThreshold: randThreshold,
      sizeMultiplier: sizeMultiplier,
      speedMultiplier: speedMultiplier,
      minStrokeWeight: minStrokeWeight,
      startOffset: startOffset,
      endDistanceOffset: endDistanceOffset,
      brushSpeedMultiplier: brushSpeedMultiplier,
      widthVariationFactor: widthVariationFactor,
      offsetVariationFactor: offsetVariationFactor
    });
  }
  config.sort((a, b) => a.perpOffset - b.perpOffset);
  return config;
}
if (typeof flyBrushOnBuffer.lastAngle === 'undefined') {
  flyBrushOnBuffer.lastAngle = 0;
}
if (typeof flyBrushOnBuffer.lastMovementAngle === 'undefined') {
  flyBrushOnBuffer.lastMovementAngle = 0;
}
if (typeof flyBrushOnBuffer.lastStrokeWeights === 'undefined') {
  flyBrushOnBuffer.lastStrokeWeights = {};
}
if (typeof flyBrushOnBuffer.configCache === 'undefined') {
  flyBrushOnBuffer.configCache = {};
}

function clearFlyBrushConfigCache() {
  if (typeof flyBrushOnBuffer !== 'undefined' && flyBrushOnBuffer.configCache) {
    flyBrushOnBuffer.configCache = {};
  }
  if (typeof flyBrushOnBuffer !== 'undefined' && flyBrushOnBuffer.lastStrokeWeights) {
    flyBrushOnBuffer.lastStrokeWeights = {};
  }
}

function gothicOnBuffer(buffer, _tx, _ty, _prevTx = null, _prevTy = null) {
  if (mouseCount >= expectedStrokeLength) {
    return;
  }
  buffer.begin();
  push();
  translate(-hw, -hh);
  colorMode(RGB, 255);
  noStroke();
  const prevMouseX = (_prevTx !== null && _prevTy !== null) ? _prevTx : (isPlaying ? simulatedPMouseX : pmouseX);
  const prevMouseY = (_prevTy !== null && _prevTy !== null) ? _prevTy : (isPlaying ? simulatedPMouseY : pmouseY);
  const mouseDx = _tx - prevMouseX;
  const mouseDy = _ty - prevMouseY;
  const mouseSpeed = sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
  const speedMultiplier = map(constrain(mouseSpeed, 3, 50), 0, 50, 0.1, 5.0);
  let dirX = 0,
    dirY = 0;
  let leftDirX = 0,
    leftDirY = 0;
  let rightDirX = 0,
    rightDirY = 0;
  if (mouseSpeed > 0.1) {
    dirX = mouseDx / mouseSpeed;
    dirY = mouseDy / mouseSpeed;
    leftDirX = -dirY;
    leftDirY = dirX;
    rightDirX = dirY;
    rightDirY = -dirX;
  } else {
    leftDirX = 0;
    leftDirY = 1;
    rightDirX = 0;
    rightDirY = -1;
  }
  const shouldCreatedotss = mouseCount < expectedStrokeLength;
  const maxdotssPerFrame = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
  const createSeed = strokeSeed + mouseCount * 10000 + 1;
  randomSeed(createSeed);
  const dotssToCreate = shouldCreatedotss ? Math.floor(crandom.random(0, maxdotssPerFrame)) : 0;
  for (let i = 0; i < dotssToCreate; i++) {
    const particleSeed = strokeSeed + mouseCount * 1000 + gothicDotIdCounter;
    randomSeed(particleSeed);
    const initRadius = crandom.random(5, 15) * baseBrushSize;
    const initX = _tx + crandom.random(-2, 2) * baseBrushSize;
    const initY = _ty + crandom.random(-2, 2) * baseBrushSize;
    const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
    let dotsR, dotsG, dotsB;
    if (brushColorMode === 0) {
      dotsR = dotsG = dotsB = radColor * 0.3;
    } else if (brushColorMode === 1) {
      dotsR = dotsG = dotsB = 150;
    } else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
      dotsR = customBrushColor[0];
      dotsG = customBrushColor[1];
      dotsB = customBrushColor[2];
    } else {
      const color = colorMap[brushColorMode];
      if (color && color.rgb) {
        dotsR = color.rgb[0];
        dotsG = color.rgb[1];
        dotsB = color.rgb[2];
      } else {
        dotsR = dotsG = dotsB = 26;
      }
    }
    const newParticle = {
      id: gothicDotIdCounter++,
      location: {
        x: initX,
        y: initY
      },
      prevLocation: {
        x: initX,
        y: initY
      },
      radius: initRadius,
      r: dotsR,
      g: dotsG,
      b: dotsB,
      xOff: 0.0,
      yOff: 0.0,
      sideDirection: sideDirection
    };
    gothicdotss.push(newParticle);
  }
  const baseDecayMin = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
  const baseDecayMax = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
  for (let i = gothicdotss.length - 1; i >= 0; i--) {
    const dots = gothicdotss[i];
    if (dots.radius <= 0) {
      continue;
    }
    const updateSeed = strokeSeed + mouseCount * 1000 + dots.id * 100;
    randomSeed(updateSeed);
    const radiusDecay = crandom.random(baseDecayMin, baseDecayMax) * 3.0;
    dots.radius -= radiusDecay;
    const xOffDelta = crandom.random(-0.5, 0.5) * speedMultiplier;
    const yOffDelta = crandom.random(-0.5, 0.5) * speedMultiplier;
    dots.xOff += xOffDelta;
    dots.yOff += yOffDelta;
    const sideForce = 2.0 * speedMultiplier;
    let sideX = 0,
      sideY = 0;
    const fallbackRandom = crandom.random(0, 1);
    const dotsSide = (dots.sideDirection !== undefined) ? dots.sideDirection : (fallbackRandom > 0.5 ? 1 : -1);
    if (dotsSide === 1) {
      sideX = rightDirX * sideForce;
      sideY = rightDirY * sideForce;
    } else {
      sideX = leftDirX * sideForce;
      sideY = leftDirY * sideForce;
    }
    const nX = noise(dots.location.x) * dots.xOff;
    const nY = noise(dots.location.y) * dots.yOff;
    if (!dots.prevLocation) {
      dots.prevLocation = {
        x: dots.location.x,
        y: dots.location.y
      };
    } else {
      dots.prevLocation.x = dots.location.x;
      dots.prevLocation.y = dots.location.y;
    }
    dots.location.x += 2.0 * (sideX * 0.2 + nX * 0.8);
    dots.location.y += 2.0 * (sideY * 0.2 + nY * 0.8);
    if (brushColorMode >= 2) {
      const colorVariation = noise(dots.location.x * 0.01, dots.location.y * 0.01) * 5;
      dots.r = constrain(dots.r + colorVariation, 0, 255);
      dots.g = constrain(dots.g + colorVariation, 0, 255);
      dots.b = constrain(dots.b + colorVariation, 0, 255);
    } else if (brushColorMode == 0) {
      const colorVariation = noise(dots.location.x * 0.01, dots.location.y * 0.01) * 2;
      dots.r = constrain(dots.r + colorVariation, 0, 200);
      dots.g = constrain(dots.g + colorVariation, 0, 200);
      dots.b = constrain(dots.b + colorVariation, 0, 200);
    }
    const drawLine = crandom.random(0, 1) > 0.2;
    const shouldRemove = crandom.random(0, 1) > 0.99;
    if (dots.radius > 0) {
      stroke(dots.r, dots.g, dots.b, 200);
      strokeWeight(max(1, dots.radius * 0.5));
      if (drawLine) {
        line(dots.prevLocation.x, dots.prevLocation.y, dots.location.x, dots.location.y);
      }
      if (shouldRemove) {
        dots.radius = -1;
      }
    } else {
      dots.radius = -1;
    }
  }
  const beforeCleanup = gothicdotss.length;
  let writeIdx = 0;
  for (let i = 0; i < gothicdotss.length; i++) {
    if (gothicdotss[i].radius > 0) {
      if (writeIdx !== i) {
        gothicdotss[writeIdx] = gothicdotss[i];
      }
      writeIdx++;
    }
  }
  gothicdotss.length = writeIdx;
  const afterCleanup = gothicdotss.length;
  if (window.DEBUG_MODE && beforeCleanup > afterCleanup) {
    const removed = beforeCleanup - afterCleanup;
    if (removed > 50) {
      console.log(`🧹 Gothic dots cleaned: ${removed} dead particles removed (${beforeCleanup} → ${afterCleanup})`);
    }
  }
  pop();
  buffer.end();
}

function flyBrushOnBuffer(buffer, _tx, _ty, pathProgress, flyBrushType = 0, mainStrokeDir = 0) {
  if (mouseCount >= expectedStrokeLength) {
    console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", mouseCount, ">=", expectedStrokeLength, ")");
    return;
  }
  buffer.begin();
  push();
  translate(-hw, -hh);
  colorMode(RGB, 255);
  let drawColor = doRandomRange(radColor);
  let strokeWeightLimit = initialSize * 0.3;
  // gothicBase: 面板值用於角色門檻（config、tiny/small判斷），源頭縮放已處理 size 體系放大
  const gothicBase = (inkPressed && typeof _panelBaseBrushSize !== 'undefined' && _panelBaseBrushSize !== null) ? _panelBaseBrushSize : baseBrushSize;
  let targetX = _tx;
  let targetY = _ty;
  if (!isFirstDraw) {
    isFirstDraw = 1;
    x = targetX;
    y = targetY;
  }
  brushAccelX += (targetX - x) * springForce;
  brushAccelY += (targetY - y) * springForce;
  brushAccelX *= dampingForce;
  brushAccelY *= dampingForce;
  brushSpeed += sqrt(brushAccelX * brushAccelX + brushAccelY * brushAccelY) - brushSpeed;
  brushSpeed *= 0.7;
  brushSizeNow = brushSize - brushSpeed;
  let startBrushSize = gobalSize;
  let targetBrushSize = brushSizeNow;
  let totalDx = targetX - x;
  let totalDy = targetY - y;
  let totalDistance = sqrt(totalDx * totalDx + totalDy * totalDy);
  // brushMode 7 自己的尺寸系統：baseBrushSize 越小，所有最小值等比縮小
  const gothicSizeRef = gothicBase;  // 面板值（壓力時）或 baseBrushSize（無壓力時）
  const gothicTiny = gothicSizeRef < 0.25;
  const gothicSmall = gothicSizeRef < 1.0;
  let estimatedSmoothRadius = max(gothicTiny ? 0.05 : (gothicSmall ? gothicSizeRef * 0.5 : 0.5), targetBrushSize * 0.5);
  let estimatedSS = 1.5 * min(strokeWeightLimit, max(gothicSmall ? gothicSizeRef * 4 : 4, estimatedSmoothRadius));
  let rectWidth = estimatedSS * 0.6;
  let spacingRatio = 0.8;
  let rectSpacing = max(rectWidth * spacingRatio, 0.5);
  let requiredSteps = max(1, ceil(totalDistance / rectSpacing));
  requiredSteps = max(10, min(50, requiredSteps));
  let drawStepRatio = requiredSteps / interpolationSteps;
  let startRANDX = 0;
  let startRANDY = 0;
  let speedFactor = min(1.0, totalDistance / 10);
  let isFlyingWhite = speedFactor > 0.3;
  rectMode(CENTER);
  let gray = crandom.random(30, 70);
  const configCacheKey = `flyBrush_${gothicBase}_${strokeSeed}`;
  let flyBrushConfig;
  if (flyBrushOnBuffer.configCache[configCacheKey]) {
    flyBrushConfig = flyBrushOnBuffer.configCache[configCacheKey];
  } else {
    flyBrushConfig = generateFlyBrushConfig(gothicBase, strokeSeed);
    flyBrushOnBuffer.configCache[configCacheKey] = flyBrushConfig;
  }
  const grayMappedToConfig = map(gray, 30, 70, 0, flyBrushConfig.length);
  const actualFlyWhiteCount = flyBrushConfig.length;
  const maxFlyWhiteCount = 40;
  const precomputedRandoms = [];
  for (let i = 0; i < interpolationSteps; ++i) {
    const flyWhiteRandoms = [];
    const flyWhiteOffsetNoises = [];
    const flyWhiteWidthNoises = [];
    for (let j = 0; j < maxFlyWhiteCount; j++) {
      flyWhiteRandoms.push(crandom.random(0.3, 1.2));
      const noiseSeedX = mouseCount * 0.08 + j * 0.15;
      const noiseSeedY = mouseCount * 0.08 + j * 0.15 + i * 0.01;
      flyWhiteOffsetNoises.push(noise(noiseSeedX, noiseSeedY));
      const widthNoiseSeedX = mouseCount * 0.1 + j * 0.1;
      const widthNoiseSeedY = mouseCount * 0.1 + j * 0.1 + i * 0.01;
      flyWhiteWidthNoises.push(noise(widthNoiseSeedX, widthNoiseSeedY));
    }
    precomputedRandoms.push({
      explodeX1: crandom.random(-1, 1),
      explodeY1: crandom.random(-1, 1),
      explodeX2: crandom.random(-1, 1),
      explodeY2: crandom.random(-1, 1),
      showMainBrush: crandom.random(0, 1),
      mainAlpha: crandom.random(80, 200),
      rectWidthMult: crandom.random(0.8, 1.2),
      flyWhiteRandoms: flyWhiteRandoms,
      flyWhiteOffsetNoises: flyWhiteOffsetNoises,
      flyWhiteWidthNoises: flyWhiteWidthNoises
    });
  }
  for (let i = 0; i < interpolationSteps; ++i) {
    const precomputed = precomputedRandoms[i];
    let prevX = x;
    let prevY = y;
    x += brushAccelX / interpolationSteps;
    y += brushAccelY / interpolationSteps;
    let progress = (i + 1) / interpolationSteps;
    let intermediateTarget = lerp(startBrushSize, targetBrushSize, progress);
    gobalSize = lerp(gobalSize, intermediateTarget, 0.5);
    oldR += (gobalSize - oldR) * 0.8;
    oldR = max(gothicSmall ? gothicSizeRef * 1.5 : 1.5, oldR);
    let smoothRadius;
    smoothRadius = max(gothicTiny ? gothicSizeRef * 0.5 : (gothicSmall ? gothicSizeRef : 0.5), oldR);
    let dx = x - prevX;
    let dy = y - prevY;
    let distance = sqrt(dx * dx + dy * dy);
    let movementAngle;
    const minDistance = 0.1;
    if (distance < minDistance) {
      movementAngle = flyBrushOnBuffer.lastMovementAngle;
    } else {
      movementAngle = atan2(dy, dx);
      let currentAngle = movementAngle + PI / 2;
      flyBrushOnBuffer.lastAngle = currentAngle;
      flyBrushOnBuffer.lastMovementAngle = movementAngle;
    }
    let rand_showMainBrush = precomputed.showMainBrush;
    let rand_mainAlpha = precomputed.mainAlpha;
    let showMainBrush = 0.3;
    let adjustedShowMainBrush = showMainBrush;
    if (drawStepRatio > 1.0) {
      adjustedShowMainBrush = showMainBrush / drawStepRatio;
    } else if (drawStepRatio < 1.0) {
      adjustedShowMainBrush = showMainBrush * (2.0 - drawStepRatio);
    }
    let perpX = -sin(movementAngle);
    let perpY = cos(movementAngle);
    const baseRadiusWithoutSpeed = max(gothicTiny ? gothicSizeRef * 0.4 : (gothicSmall ? gothicSizeRef * 0.5 : 0.5), brushSize * 0.5);
    const baseSpeedEffectOnRadius = brushSpeed * 0.5;
    const isInNormalPhase = mouseCount < (expectedStrokeLength - 5);
    const isInEndPhase = mouseCount >= (expectedStrokeLength - 5);
    const thresholdMultiplier = isInEndPhase ? 0.7 : 1.0;
    const hasEnded = mouseCount >= expectedStrokeLength;
    let endStartFrame, endFrames, endProgress, cosMovementAngle, sinMovementAngle;
    if (isInEndPhase) {
      endStartFrame = expectedStrokeLength - 5;
      endFrames = mouseCount - endStartFrame;
      endProgress = min(1.0, endFrames / 5.0);
      cosMovementAngle = cos(movementAngle);
      sinMovementAngle = sin(movementAngle);
    }
    for (let j = 0; j < flyBrushConfig.length; j++) {
      let cfg = flyBrushConfig[j];
      const hasStarted = mouseCount >= cfg.startOffset;
      if (!hasStarted || hasEnded) {
        continue;
      }
      let randFly = precomputed.flyWhiteRandoms[j];
      let adjustedThreshold = cfg.randThreshold * thresholdMultiplier;
      if (randFly > adjustedThreshold) {
        const offsetNoise = precomputed.flyWhiteOffsetNoises[j];
        const baseOffsetMultiplier = map(offsetNoise, 0, 1, 1.0, 2.0);
        const offsetMultiplierValue = 1.0 + (baseOffsetMultiplier - 1.0) * cfg.offsetVariationFactor;
        // 小尺寸保證最小展開量，讓分支不重疊：0.1→±2px, 0.25→±3px, 0.5→±4px
        const minSpread = gothicSmall ? max(0.3, gothicSizeRef * 3) : gothicSizeRef;
        const offsetMultiplier = cfg.perpOffset * minSpread * offsetMultiplierValue;
        let offsetX = perpX * offsetMultiplier;
        let offsetY = perpY * offsetMultiplier;
        let currentX = x;
        let currentY = y;
        let currentPrevX = prevX;
        let currentPrevY = prevY;
        if (isInEndPhase) {
          const extraDistance = cfg.endDistanceOffset * endProgress * gothicBase;
          const extraDx = cosMovementAngle * extraDistance;
          const extraDy = sinMovementAngle * extraDistance;
          currentX = x + extraDx;
          currentY = y + extraDy;
          if (endFrames === 0) {
            currentPrevX = prevX;
            currentPrevY = prevY;
          } else {
            const prevEndProgress = min(1.0, (endFrames - 1) / 5.0);
            const prevExtraDistance = cfg.endDistanceOffset * prevEndProgress * gothicBase;
            const prevExtraDx = cosMovementAngle * prevExtraDistance;
            const prevExtraDy = sinMovementAngle * prevExtraDistance;
            currentPrevX = x + prevExtraDx;
            currentPrevY = y + prevExtraDy;
          }
        }
        const branchSpeedEffect = baseSpeedEffectOnRadius * cfg.brushSpeedMultiplier * cfg.speedMultiplier;
        const branchRadius = max(gothicTiny ? gothicSizeRef * 0.3 : (gothicSmall ? gothicSizeRef * 0.3 : 0.5), baseRadiusWithoutSpeed - branchSpeedEffect);
        const branchStrokeWeight = branchRadius * 0.6;
        const widthNoise = precomputed.flyWhiteWidthNoises[j];
        const baseWidthMultiplier = map(widthNoise, 0, 1, 0.8, 1.2);
        const widthMultiplier = 1.0 + (baseWidthMultiplier - 1.0) * cfg.widthVariationFactor;
        let finalGray = max(0, map(j, 0, flyBrushConfig.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
        let kk = min(200, finalGray) + random(-50, 50);
        stroke(drawColor, kk);
        const targetStrokeWeight = branchStrokeWeight * cfg.sizeMultiplier * widthMultiplier;
        // WebGL strokeWeight < 1px 無效，用 1px 為下限；小尺寸靠分支數+展開量區分
        const clampedTargetWeight = max(1, targetStrokeWeight);
        const strokeWeightKey = `${configCacheKey}_${j}`;
        let lastStrokeWeight = flyBrushOnBuffer.lastStrokeWeights[strokeWeightKey];
        if (typeof lastStrokeWeight === 'undefined') {
          lastStrokeWeight = clampedTargetWeight;
        }
        const currentWeight = lastStrokeWeight;
        let strokeWeightSmoothingFactor;
        if (currentWeight < 3.0) {
          strokeWeightSmoothingFactor = 0.15;
        } else if (currentWeight >= 5.0) {
          strokeWeightSmoothingFactor = 0.3;
        } else {
          const t = (currentWeight - 3.0) / (5.0 - 3.0);
          strokeWeightSmoothingFactor = lerp(0.15, 0.3, t);
        }
        const smoothedStrokeWeight = lerp(lastStrokeWeight, clampedTargetWeight, strokeWeightSmoothingFactor);
        flyBrushOnBuffer.lastStrokeWeights[strokeWeightKey] = smoothedStrokeWeight;
        strokeWeight(smoothedStrokeWeight);
        line(currentPrevX + offsetX, currentPrevY + offsetY, currentX + offsetX, currentY + offsetY);
      }
    }
  }
  pop();
  buffer.end();
}

// === js/ui.js ===
let cachedDOMElements = null;

function initDOMCache() {
  if (cachedDOMElements) return cachedDOMElements;
  cachedDOMElements = {
    messageOverlay: document.getElementById('message-overlay'),
    recordingStatus: document.getElementById('recording-status'),
    playbackStatus: document.getElementById('playback-status'),
    countdownStatus: document.getElementById('countdown-status'),
    countdownText: document.getElementById('countdown-text'),
    countdownCircle: document.getElementById('countdown-circle'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    recordBtn: document.getElementById('record-btn'),
    stopBtn: document.getElementById('stop-btn'),
    playBtn: document.getElementById('play-btn'),
    loadBtn: document.getElementById('load-recording'),
    controlPanel: document.getElementById('control-panel'),
    effectControlPanel: document.getElementById('effect-control-panel'),
    flowEffectPanel: document.getElementById('flow-effect-panel'),
    messageContainer: document.getElementById('message-container'),
    brushHint: document.getElementById('brush-hint'),
    effectHint: document.getElementById('effect-hint'),
    flowHint: document.getElementById('flow-hint'),
    screenTextToggle: document.getElementById('screen-text-toggle'),
    referenceImage: document.getElementById('reference-image'),
    referenceContainer: document.getElementById('reference-image-container')
  };
  return cachedDOMElements;
}

function getDOMElement(key) {
  if (!cachedDOMElements) {
    initDOMCache();
  }
  return cachedDOMElements[key];
}

function startDrag(e) {
  if (e.target.closest('.control-btn')) return;
  isDragging = true;
  const overlay = getDOMElement('messageOverlay');
  if (!overlay) return;
  const rect = overlay.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left - rect.width / 2;
  dragOffset.y = e.clientY - rect.top - rect.height / 2;
  overlay.classList.add('dragging');
  e.preventDefault();
}

function drag(e) {
  if (!isDragging) return;
  const overlay = getDOMElement('messageOverlay');
  if (!overlay) return;
  const x = ((e.clientX - dragOffset.x) / window.innerWidth) * 100;
  const y = ((e.clientY - dragOffset.y) / window.innerHeight) * 100;
  overlayPosition.x = x;
  overlayPosition.y = y;
  ensureHeaderVisible(overlay, overlayPosition, updateOverlayPosition);
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  const overlay = getDOMElement('messageOverlay');
  if (overlay) {
    overlay.classList.remove('dragging');
    ensureHeaderVisible(overlay, overlayPosition, updateOverlayPosition);
  }
  savePanelPositions();
}

function ensureHeaderVisible(panel, pos, updateFn) {
  if (!panel) return;
  updateFn();
  const header = panel.querySelector('.control-btn');
  if (!header) return;
  const rect = header.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let dx = 0, dy = 0;
  if (rect.right > vw) dx = vw - rect.right;
  if (rect.left < 0) dx = -rect.left;
  if (rect.bottom > vh) dy = vh - rect.bottom;
  if (rect.top < 0) dy = -rect.top;
  if (dx !== 0 || dy !== 0) {
    pos.x += (dx / vw) * 100;
    pos.y += (dy / vh) * 100;
    updateFn();
  }
}

function bringPanelToFront(panelEl) {
  if (!panelEl) return;
  const panels = [
    document.getElementById('message-overlay'),
    getDOMElement('controlPanel'),
    getDOMElement('effectControlPanel'),
    getDOMElement('flowEffectPanel')
  ];
  panels.forEach(p => {
    if (p) p.classList.remove('panel-front');
  });
  panelEl.classList.add('panel-front');
}

function setupPanelBringToFront() {
  const panels = [
    document.getElementById('message-overlay'),
    getDOMElement('controlPanel'),
    getDOMElement('effectControlPanel'),
    getDOMElement('flowEffectPanel')
  ];
  panels.forEach(panel => {
    if (!panel) return;
    panel.addEventListener('mousedown', () => bringPanelToFront(panel));
    panel.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) bringPanelToFront(panel);
    }, {
      passive: true
    });
  });
}

function updateOverlayPosition() {
  const overlay = getDOMElement('messageOverlay');
  if (!overlay) return;
  overlay.style.left = overlayPosition.x + '%';
  overlay.style.top = overlayPosition.y + '%';
  const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
  overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}

function startControlPanelDrag(e) {
  if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
  controlPanelDragging = true;
  const panel = getDOMElement('controlPanel');
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  controlPanelOffset.x = e.clientX - rect.left - rect.width / 2;
  controlPanelOffset.y = e.clientY - rect.top - rect.height / 2;
  panel.classList.add('dragging');
  panel.style.transition = 'none';
  e.preventDefault();
}

function dragControlPanel(e) {
  if (!controlPanelDragging) return;
  const panel = getDOMElement('controlPanel');
  if (!panel) return;
  const x = ((e.clientX - controlPanelOffset.x) / window.innerWidth) * 100;
  const y = ((e.clientY - controlPanelOffset.y) / window.innerHeight) * 100;
  controlPanelPosition.x = x;
  controlPanelPosition.y = y;
  ensureHeaderVisible(panel, controlPanelPosition, updateControlPanelPosition);
}

function endControlPanelDrag(e) {
  if (!controlPanelDragging) return;
  controlPanelDragging = false;
  const panel = getDOMElement('controlPanel');
  if (!panel) return;
  panel.classList.remove('dragging');
  panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  ensureHeaderVisible(panel, controlPanelPosition, updateControlPanelPosition);
  savePanelPositions();
}

function updateControlPanelPosition() {
  const panel = getDOMElement('controlPanel');
  if (!panel) return;
  panel.style.left = controlPanelPosition.x + '%';
  panel.style.top = controlPanelPosition.y + '%';
  const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
  panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}

function startEffectControlPanelDrag(e) {
  if (e.target.closest('.control-btn')) return;
  effectControlPanelDragging = true;
  const panel = getDOMElement('effectControlPanel');
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  effectControlPanelOffset.x = e.clientX - rect.left - rect.width / 2;
  effectControlPanelOffset.y = e.clientY - rect.top - rect.height / 2;
  panel.classList.add('dragging');
  panel.style.transition = 'none';
  e.preventDefault();
}

function dragEffectControlPanel(e) {
  if (!effectControlPanelDragging) return;
  const panel = getDOMElement('effectControlPanel');
  if (!panel) return;
  const x = ((e.clientX - effectControlPanelOffset.x) / window.innerWidth) * 100;
  const y = ((e.clientY - effectControlPanelOffset.y) / window.innerHeight) * 100;
  effectControlPanelPosition.x = x;
  effectControlPanelPosition.y = y;
  ensureHeaderVisible(panel, effectControlPanelPosition, updateEffectControlPanelPosition);
}

function endEffectControlPanelDrag(e) {
  if (!effectControlPanelDragging) return;
  effectControlPanelDragging = false;
  const panel = getDOMElement('effectControlPanel');
  if (!panel) return;
  panel.classList.remove('dragging');
  panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  ensureHeaderVisible(panel, effectControlPanelPosition, updateEffectControlPanelPosition);
  savePanelPositions();
}

function updateEffectControlPanelPosition() {
  const panel = getDOMElement('effectControlPanel');
  if (!panel) return;
  panel.style.left = effectControlPanelPosition.x + '%';
  panel.style.top = effectControlPanelPosition.y + '%';
  const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
  panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}

function startFlowEffectPanelDrag(e) {
  if (e.target.closest('.control-btn')) return;
  flowEffectPanelDragging = true;
  const panel = getDOMElement('flowEffectPanel');
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  flowEffectPanelOffset.x = e.clientX - rect.left - rect.width / 2;
  flowEffectPanelOffset.y = e.clientY - rect.top - rect.height / 2;
  panel.classList.add('dragging');
  panel.style.transition = 'none';
  e.preventDefault();
}

function dragFlowEffectPanel(e) {
  if (!flowEffectPanelDragging) return;
  const panel = getDOMElement('flowEffectPanel');
  if (!panel) return;
  const x = ((e.clientX - flowEffectPanelOffset.x) / window.innerWidth) * 100;
  const y = ((e.clientY - flowEffectPanelOffset.y) / window.innerHeight) * 100;
  flowEffectPanelPosition.x = x;
  flowEffectPanelPosition.y = y;
  ensureHeaderVisible(panel, flowEffectPanelPosition, updateFlowEffectPanelPosition);
}

function endFlowEffectPanelDrag(e) {
  if (!flowEffectPanelDragging) return;
  flowEffectPanelDragging = false;
  const panel = getDOMElement('flowEffectPanel');
  if (!panel) return;
  panel.classList.remove('dragging');
  panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  ensureHeaderVisible(panel, flowEffectPanelPosition, updateFlowEffectPanelPosition);
  savePanelPositions();
}

function updateFlowEffectPanelPosition() {
  const panel = getDOMElement('flowEffectPanel');
  if (!panel) return;
  panel.style.left = flowEffectPanelPosition.x + '%';
  panel.style.top = flowEffectPanelPosition.y + '%';
  const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
  panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}

function getControlPanel() {
  return getDOMElement('controlPanel');
}
let hintPositions = {};
let hintDragState = {
  hint: null,
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  hasMoved: false,
  lastDragTime: 0
};

function wasHintJustDragged() {
  return Date.now() - hintDragState.lastDragTime < 200;
}

function positionHintAtButton(hint, buttonId) {
  const button = document.getElementById(buttonId);
  if (!hint || !button) return;
  // Always use the Hide button's current position (panel may have been dragged)
  const rect = button.getBoundingClientRect();
  hint.style.top = rect.top + 'px';
  hint.style.left = rect.left + 'px';
}

function startHintDrag(e, hint) {
  const rect = hint.getBoundingClientRect();
  hintDragState.hint = hint;
  hintDragState.startX = e.clientX;
  hintDragState.startY = e.clientY;
  hintDragState.offsetX = e.clientX - rect.left;
  hintDragState.offsetY = e.clientY - rect.top;
  hintDragState.isDragging = true;
  hintDragState.hasMoved = false;
}

function dragHint(e) {
  if (!hintDragState.isDragging || !hintDragState.hint) return;
  const dx = Math.abs(e.clientX - hintDragState.startX);
  const dy = Math.abs(e.clientY - hintDragState.startY);
  if (dx > 5 || dy > 5) {
    hintDragState.hasMoved = true;
    hintDragState.hint.style.transition = 'none';
  }
  if (hintDragState.hasMoved) {
    const x = e.clientX - hintDragState.offsetX;
    const y = e.clientY - hintDragState.offsetY;
    hintDragState.hint.style.left = x + 'px';
    hintDragState.hint.style.top = y + 'px';
  }
}

function endHintDrag(e) {
  if (!hintDragState.isDragging || !hintDragState.hint) return;
  const hint = hintDragState.hint;
  if (hintDragState.hasMoved) {
    hintPositions[hint.id] = {
      top: parseInt(hint.style.top),
      left: parseInt(hint.style.left)
    };
    localStorage.setItem('hintPositions', JSON.stringify(hintPositions));
    hint.style.transition = '';
    hintDragState.lastDragTime = Date.now();
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  hintDragState.hint = null;
  hintDragState.isDragging = false;
  hintDragState.hasMoved = false;
}

function loadHintPositions() {
  const saved = localStorage.getItem('hintPositions');
  if (saved) {
    hintPositions = JSON.parse(saved);
  }
}

function initializeHintDragging() {
  const hintPairs = [{
    hint: document.getElementById('toggle-hint'),
    btn: document.getElementById('toggle-hint-btn')
  }, {
    hint: document.getElementById('brush-hint'),
    btn: document.getElementById('brush-hint-btn')
  }, {
    hint: document.getElementById('effect-hint'),
    btn: document.getElementById('effect-hint-btn')
  }, {
    hint: document.getElementById('flow-hint'),
    btn: document.getElementById('flow-hint-btn')
  }];
  hintPairs.forEach(({
    hint,
    btn
  }) => {
    if (!hint || !btn) return;
    btn.addEventListener('mousedown', (e) => {
      startHintDrag(e, hint);
    });
    btn.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        startHintDrag({
          clientX: touch.clientX,
          clientY: touch.clientY
        }, hint);
      }
    }, {
      passive: true
    });
  });
  document.addEventListener('mousemove', dragHint);
  document.addEventListener('mouseup', endHintDrag);
  document.addEventListener('touchmove', (e) => {
    if (hintDragState.isDragging && e.touches.length === 1) {
      dragHint({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      });
      if (hintDragState.hasMoved) e.preventDefault();
    }
  }, {
    passive: false
  });
  document.addEventListener('touchend', (e) => {
    endHintDrag({
      preventDefault: () => {},
      stopPropagation: () => {}
    });
  });
}

function initializeHintPositions() {
  loadHintPositions();
  const panels = [{
    panel: document.getElementById('message-overlay'),
    hint: document.getElementById('toggle-hint'),
    button: 'toggle-overlay',
    visible: isOverlayVisible
  }, {
    panel: getDOMElement('controlPanel'),
    hint: getDOMElement('brushHint'),
    button: 'toggle-control-panel',
    visible: controlPanelVisible
  }, {
    panel: getDOMElement('effectControlPanel'),
    hint: getDOMElement('effectHint'),
    button: 'toggle-effect-control-panel',
    visible: effectControlPanelVisible
  }, {
    panel: getDOMElement('flowEffectPanel'),
    hint: getDOMElement('flowHint'),
    button: 'toggle-flow-effect-panel',
    visible: flowEffectPanelVisible
  }];
  panels.forEach(({
    panel,
    hint,
    button,
    visible
  }) => {
    if (!panel || !hint) return;
    if (!visible) {
      panel.style.display = 'block';
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      requestAnimationFrame(() => {
        positionHintAtButton(hint, button);
        panel.style.display = 'none';
        panel.style.opacity = '';
        panel.style.pointerEvents = '';
      });
    }
  });
}

function toggleControlPanel() {
  controlPanelVisible = !controlPanelVisible;
  const panel = getControlPanel();
  const brushHint = getDOMElement('brushHint');
  if (!panel) return;
  if (controlPanelVisible) {
    panel.style.display = 'block';
    panel.style.opacity = '1';
    if (brushHint) {
      brushHint.classList.add('hidden');
    }
  } else {
    if (brushHint) {
      positionHintAtButton(brushHint, 'toggle-control-panel');
      brushHint.classList.remove('hidden');
    }
    panel.style.opacity = '0';
    setTimeout(() => {
      if (!controlPanelVisible) {
        panel.style.display = 'none';
      }
    }, 300);
  }
  localStorage.setItem('controlPanelVisible', controlPanelVisible.toString());
}

function toggleEffectControlPanel() {
  effectControlPanelVisible = !effectControlPanelVisible;
  const panel = getDOMElement('effectControlPanel');
  const effectHint = getDOMElement('effectHint');
  if (!panel) return;
  if (effectControlPanelVisible) {
    panel.style.display = 'block';
    panel.style.opacity = '1';
    if (effectHint) {
      effectHint.classList.add('hidden');
    }
  } else {
    if (effectHint) {
      positionHintAtButton(effectHint, 'toggle-effect-control-panel');
      effectHint.classList.remove('hidden');
    }
    panel.style.opacity = '0';
    setTimeout(() => {
      if (!effectControlPanelVisible) {
        panel.style.display = 'none';
      }
    }, 300);
  }
  savePanelVisibility();
}

function toggleFlowEffectPanel() {
  flowEffectPanelVisible = !flowEffectPanelVisible;
  const panel = getDOMElement('flowEffectPanel');
  const flowHint = getDOMElement('flowHint');
  if (!panel) return;
  if (flowEffectPanelVisible) {
    panel.style.display = 'block';
    panel.style.opacity = '1';
    if (flowHint) {
      flowHint.classList.add('hidden');
    }
  } else {
    if (flowHint) {
      positionHintAtButton(flowHint, 'toggle-flow-effect-panel');
      flowHint.classList.remove('hidden');
    }
    panel.style.opacity = '0';
    setTimeout(() => {
      if (!flowEffectPanelVisible) {
        panel.style.display = 'none';
      }
    }, 300);
  }
  savePanelVisibility();
}

function toggleScreenText() {
  const toggleCheckbox = getDOMElement('screenTextToggle');
  if (toggleCheckbox) {
    screenText = toggleCheckbox.checked;
  } else {
    screenText = !screenText;
  }
  if (!screenText) {
    clearMessages();
  }
  logArt('ui', 'Screen Text Display', {
    Status: screenText ? "Show ✅" : "Hide ❌"
  });
}

function loadPanelVisibility() {
  const savedVisibility = localStorage.getItem('controlPanelVisible');
  if (savedVisibility !== null) {
    controlPanelVisible = savedVisibility === 'true';
  }
  const savedEffectVisibility = localStorage.getItem('effectControlPanelVisible');
  if (savedEffectVisibility !== null) {
    effectControlPanelVisible = savedEffectVisibility === 'true';
  }
  const savedFlowVisibility = localStorage.getItem('flowEffectPanelVisible');
  if (savedFlowVisibility !== null) {
    flowEffectPanelVisible = savedFlowVisibility === 'true';
  }
}

function savePanelVisibility() {
  localStorage.setItem('controlPanelVisible', controlPanelVisible);
  localStorage.setItem('effectControlPanelVisible', effectControlPanelVisible);
  localStorage.setItem('flowEffectPanelVisible', flowEffectPanelVisible);
}

function loadPanelPositions() {
  const savedOverlayPos = localStorage.getItem('overlayPosition');
  const savedControlPos = localStorage.getItem('controlPanelPosition');
  const savedEffectControlPos = localStorage.getItem('effectControlPanelPosition');
  const savedFlowEffectPos = localStorage.getItem('flowEffectPanelPosition');
  if (savedOverlayPos) {
    overlayPosition = JSON.parse(savedOverlayPos);
  }
  if (savedControlPos) {
    controlPanelPosition = JSON.parse(savedControlPos);
  }
  if (savedEffectControlPos) {
    effectControlPanelPosition = JSON.parse(savedEffectControlPos);
  }
  if (savedFlowEffectPos) {
    flowEffectPanelPosition = JSON.parse(savedFlowEffectPos);
  }
}

function savePanelPositions() {
  localStorage.setItem('overlayPosition', JSON.stringify(overlayPosition));
  localStorage.setItem('controlPanelPosition', JSON.stringify(controlPanelPosition));
  localStorage.setItem('effectControlPanelPosition', JSON.stringify(effectControlPanelPosition));
  localStorage.setItem('flowEffectPanelPosition', JSON.stringify(flowEffectPanelPosition));
}

function logArt(type, message, data = {}) {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
  const icons = {
    recording: '🔴',
    playback: '▶️',
    system: '⚙️',
    art: '🎨'
  };
  const icon = icons[type] || '⚙️';
  if (Object.keys(data).length > 0) {} else {}
  if (typeof screenText !== 'undefined' && screenText) {
    addScreenText(type, message, data);
  }
}

function addScreenText(type, message, data = {}) {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
  const icons = {
    recording: '🔴',
    playback: '▶️',
    system: '⚙️',
    art: '🎨'
  };
  const icon = icons[type] || '⚙️';
  let dataStr = '';
  if (Object.keys(data).length > 0) {
    dataStr = ' ' + JSON.stringify(data);
  }
  const textLine = `${icon} [${timestamp}] ${message}${dataStr}`;
  screenTextLines.push({
    type: type,
    text: textLine,
    timestamp: timestamp
  });
  if (screenTextLines.length >= maxTotalLines) {
    screenTextLines = [];
    screenTextScroll = 0;
  }
}

function addMessageToOverlay(type, message, data, timestamp, icon) {
  const messageObj = {
    id: Date.now() + Math.random(),
    type: type,
    message: message,
    data: data,
    timestamp: timestamp,
    icon: icon
  };
  messageHistory.push(messageObj);
  if (messageHistory.length > maxMessages) {
    messageHistory.shift();
  }
  updateOverlayDOM();
}

function updateOverlayDOM() {
  const container = getDOMElement('messageContainer');
  if (!container) return;
  container.innerHTML = '';
  messageHistory.forEach(msg => {
    const messageElement = createMessageElement(msg);
    container.appendChild(messageElement);
  });
  container.scrollTop = container.scrollHeight;
}

function updateButtonStates() {
  const hasRecordingData = recordingData.events.length > 0;
  const currentState = `${isRecording}-${isPlaying}-${hasRecordingData}`;
  if (currentState === lastButtonState) {
    return;
  }
  lastButtonState = currentState;
  const recordBtn = getDOMElement('recordBtn');
  const stopBtn = getDOMElement('stopBtn');
  const playBtn = getDOMElement('playBtn');
  const loadBtn = getDOMElement('loadBtn');
  if (recordBtn && stopBtn && playBtn && loadBtn) {
    if (isRecording) {
      recordBtn.disabled = true;
      stopBtn.disabled = false;
      playBtn.disabled = true;
      loadBtn.disabled = true;
    } else if (isPlaying) {
      recordBtn.disabled = true;
      stopBtn.disabled = false;
      playBtn.disabled = true;
      loadBtn.disabled = true;
    } else if (hasRecordingData) {
      recordBtn.disabled = false;
      stopBtn.disabled = true;
      playBtn.disabled = false;
      loadBtn.disabled = false;
    } else {
      recordBtn.disabled = false;
      stopBtn.disabled = true;
      playBtn.disabled = true;
      loadBtn.disabled = false;
    }
  }
}
let isReferenceImageVisible = false;
let lastLoggedCountdownSecond = -1;
let lastUIUpdateTime = 0;
const UI_UPDATE_INTERVAL = 100;
let lastProgressValue = -1;
let lastButtonState = null;

function loadReferenceImage(file) {
  const reader = new FileReader();
  const referenceImage = document.getElementById('reference-image');
  const referenceContainer = document.getElementById('reference-image-container');
  if (!referenceImage || !referenceContainer) {
    logArt('system', '❌ Reference image elements not found', {
      Status: 'Error'
    });
    return;
  }
  reader.onload = (e) => {
    referenceImage.src = e.target.result;
    referenceImage.onload = () => {
      if (typeof width !== 'undefined' && typeof height !== 'undefined') {
        referenceContainer.style.width = (width * 1.0) + 'px';
        referenceContainer.style.height = (height * 1.0) + 'px';
      }
      referenceImage.style.width = '100%';
      referenceImage.style.height = '100%';
      referenceImage.style.objectFit = 'cover';
      referenceImage.style.opacity = '1';
      referenceContainer.style.opacity = '0.3';
      referenceContainer.classList.remove('hidden');
      isReferenceImageVisible = true;
      logArt('system', '📷 Reference image loaded', {
        Status: 'Tracing mode ON',
        FileName: file.name,
        FileSize: (file.size / 1024).toFixed(2) + ' KB',
        Opacity: '50%',
        Size: width + 'x' + height + 'px'
      });
    };
    referenceImage.onerror = () => {
      logArt('system', '❌ Failed to load image', {
        Status: 'Error',
        FileName: file.name
      });
    };
  };
  reader.onerror = () => {
    logArt('system', '❌ Failed to read file', {
      Status: 'Error',
      FileName: file.name
    });
  };
  reader.readAsDataURL(file);
}

function showReferenceImage() {
  const referenceContainer = document.getElementById('reference-image-container');
  const referenceImage = document.getElementById('reference-image');
  if (referenceContainer && referenceImage) {
    const imageSrc = referenceImage.src;
    const isImageLoaded = imageSrc && imageSrc !== '' &&
      (imageSrc.startsWith('data:') ||
        (referenceImage.complete && referenceImage.naturalWidth > 0));
    if (isImageLoaded) {
      referenceContainer.classList.remove('hidden');
      referenceContainer.style.opacity = '0.3';
      isReferenceImageVisible = true;
      logArt('system', 'Reference image shown', {
        Status: 'Tracing mode ON',
        Opacity: '30%'
      });
    } else {
      logArt('system', 'No image loaded', {
        Status: 'Please load an image first'
      });
    }
  }
}

function hideReferenceImage() {
  const referenceContainer = document.getElementById('reference-image-container');
  if (referenceContainer) {
    referenceContainer.classList.add('hidden');
    referenceContainer.style.opacity = '0';
    isReferenceImageVisible = false;
    logArt('system', 'Reference image hidden', {
      Status: 'Tracing mode OFF'
    });
  }
}

function saveCanvasAsPNG() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `artwork-${timestamp}.png`;
  saveCanvas(filename);
  logArtSeparator('💾 Canvas Saved as PNG');
}

function setBrushSize(sizeMode) {
  brushSizeMode = sizeMode;
  switch (sizeMode) {
    case 'ultra-small':
      baseBrushSize = 0.1;
      break;
    case 'extra-small':
      baseBrushSize = 0.25;
      break;
    case 'small':
      baseBrushSize = 0.5;
      break;
    case 'medium':
      baseBrushSize = 1.0;
      break;
    case 'large':
      baseBrushSize = 2.0;
      break;
    case 'extra-large':
      baseBrushSize = 3.0;
      break;
    case 'extra-extra-large':
      baseBrushSize = 5.0;
      break;
    case 'huge':
      baseBrushSize = 10.0;
      break;
  }
  if (typeof _panelBaseBrushSize !== 'undefined') _panelBaseBrushSize = baseBrushSize;
  updateBrushSizeButtons();
  updateCurrentSettingsDisplay();
  logArt('ui', 'Brush size changed', {
    Mode: sizeMode.toUpperCase(),
    Multiplier: baseBrushSize + 'x'
  });
}

function updateBrushSizeButtons() {
  const buttons = document.querySelectorAll('.brush-size-btn');
  if (buttons.length === 0) {
    console.log('⚠️ Brush size buttons not found, skipping update');
    return;
  }
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.size === brushSizeMode) {
      btn.classList.add('active');
    }
  });
}

function setBrushMode(mode) {
  brushMode = parseInt(mode);
  updateBrushModeButtons();
  updateCurrentSettingsDisplay();
  logArt('ui', 'Brush mode changed', {
    Mode: `Brush ${mode}`,
    Description: getBrushModeDescription(mode)
  });
}

function getBrushModeDescription(mode) {
  const descriptions = {
    1: 'Large brush (20-30)',
    2: 'Small brush (5-10)',
    3: 'Extra large brush (80-120)',
    4: 'Pen sketch mode (2-4)',
    5: 'Dot paint mode (8-15)',
    6: 'Fly brush mode',
    7: 'Brush mode 7'
  };
  return descriptions[mode] || 'Unknown mode';
}

function updateBrushModeButtons() {
  const buttons = document.querySelectorAll('.brush-mode-btn');
  if (buttons.length === 0) {
    console.log('⚠️ Brush mode buttons not found, skipping update');
    return;
  }
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.mode) === brushMode) {
      btn.classList.add('active');
    }
  });
}

function setInkEffect(effect) {
  const effectValue = parseInt(effect);
  const previousEffect = useSharpen;
  logArt('ui', '🎨 Ink effect switching', {
    From: previousEffect,
    To: effectValue,
    Note: 'Buffer preserved to keep existing content'
  });
  useSharpen = effectValue;
  if (typeof previousUseSharpen !== 'undefined') {
    previousUseSharpen = previousEffect;
  }
  updateInkEffectButtons();
  updateCurrentSettingsDisplay();
  const effectNames = {
    0: 'Mix Diffusion',
    1: 'Sharpen Edge',
    2: 'Flying White',
    3: 'Wet Ink',
    4: 'Effect 4',
    5: 'Hair Texture'
  };
  logArt('ui', '✨ Ink effect changed', {
    Effect: effectNames[effectValue] || 'Unknown',
    ShaderValue: useSharpen
  });
}

function setBlendMode(mode) {
  const modeValue = parseInt(mode);
  if (modeValue === 3) {
    // Spectral: keep keyBlendMode as-is (spectral overrides in shader)
    window.spectral = true;
  } else {
    if (typeof keyBlendMode !== 'undefined') {
      keyBlendMode = modeValue;
    }
    window.spectral = false;
  }
  updateBlendModeButtons();
  const modeNames = {
    0: 'Mix',
    1: 'Multiply',
    2: 'Darken',
    3: 'Spectral'
  };
  logArt('ui', '🎨 BlendMode changed', {
    Mode: modeNames[modeValue] || 'Unknown'
  });
}

function updateBlendModeButtons() {
  const buttons = document.querySelectorAll('.blendmode-btn');
  if (buttons.length === 0) {
    return;
  }
  const isSpectral = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
  buttons.forEach(btn => {
    const modeValue = parseInt(btn.dataset.mode);
    if (isSpectral && modeValue === 3) {
      btn.classList.add('active');
    } else if (!isSpectral && modeValue === keyBlendMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateInkEffectButtons() {
  const buttons = document.querySelectorAll('.ink-effect-btn');
  if (buttons.length === 0) {
    console.log('⚠️ Ink effect buttons not found, skipping update');
    return;
  }
  buttons.forEach(btn => {
    btn.classList.remove('active');
    const effectValue = parseInt(btn.dataset.effect);
    const shaderValue = effectValue;
    if (shaderValue === useSharpen) {
      btn.classList.add('active');
    }
  });
}

function setBrushColor(color) {
  whiteBrushMode = (color === 'white');
  const colorModeMap = {
    'black': 0,
    'white': 1,
    'dark_gray': 2,
    'medium_gray_new': 3,
    'light_gray_new': 4,
    'green': 5,
    'orange': 6,
    'brown': 7,
    'green_dark': 8,
    'blue_dark': 9,
    'purple': 10,
    'lime': 11,
    'light_gray': 12,
    'blue_gray': 13,
    'terra_cotta': 14,
    'olive_green': 15,
    'pink': 16,
    'wine_red': 17,
    'gold_orange': 18,
    'gray_brown': 19,
    'sage_gray': 20,
    'brick_red': 21,
    'silver': 22,
    'beige': 23,
    'gray_green': 24,
    'tan': 25,
    'khaki': 26,
    'dusty_rose': 27,
    'mauve_gray': 28,
    'medium_gray': 29,
    'red': 30,
    'yellow': 31,
    'blue': 32,
    'custom': 33,
    'coral': 34,
    'mint': 35
  };
  brushColorMode = colorModeMap[color] !== undefined ? colorModeMap[color] : 0;
  updateBrushColorButtons();
  updateCurrentSettingsDisplay();
  const colorNames = {
    'black': 'Black',
    'white': 'White',
    'dark_gray': 'Dark Gray',
    'medium_gray_new': 'Medium Gray',
    'light_gray_new': 'Light Gray',
    'green': 'Green',
    'orange': 'Orange',
    'brown': 'Brown',
    'green_dark': 'Dark Green',
    'blue_dark': 'Dark Blue',
    'purple': 'Purple',
    'lime': 'Lime',
    'light_gray': 'Light Gray',
    'blue_gray': 'Blue Gray',
    'terra_cotta': 'Terra Cotta',
    'olive_green': 'Olive Green',
    'pink': 'Pink',
    'wine_red': 'Wine Red',
    'gold_orange': 'Gold Orange',
    'gray_brown': 'Gray Brown',
    'sage_gray': 'Sage Gray',
    'brick_red': 'Brick Red',
    'silver': 'Silver',
    'beige': 'Beige',
    'gray_green': 'Gray Green',
    'tan': 'Tan',
    'khaki': 'Khaki',
    'dusty_rose': 'Dusty Rose',
    'mauve_gray': 'Mauve Gray',
    'medium_gray': 'Medium Gray',
    'red': 'Red',
    'yellow': 'Yellow',
    'blue': 'Blue',
    'coral': 'Coral',
    'mint': 'Mint'
  };
  if (typeof getColorByName === 'function') {
    const colorInfo = getColorByName(color);
    if (colorInfo) {
      const customColorInput = document.getElementById('custom-brush-color');
      const customColorTextInput = document.getElementById('custom-brush-color-text');
      if (customColorInput) customColorInput.value = colorInfo.hex;
      if (customColorTextInput) customColorTextInput.value = colorInfo.displayName + ' ' + colorInfo.hex;
      if (typeof customBrushColor !== 'undefined') {
        customBrushColor[0] = colorInfo.rgb[0];
        customBrushColor[1] = colorInfo.rgb[1];
        customBrushColor[2] = colorInfo.rgb[2];
      }
    }
  }
  logArt('ui', '🎨 Brush color changed', {
    Color: colorNames[color] || color,
    Mode: `${colorNames[color] || color} brush mode`,
    ColorCode: brushColorMode
  });
}

function updateBrushColorButtons() {
  const oldButtons = document.querySelectorAll('.brush-color-btn');
  const newSwatches = document.querySelectorAll('.color-swatch');
  if (oldButtons.length === 0 && newSwatches.length === 0) {
    console.log('⚠️ Brush color buttons not found, skipping update');
    return;
  }
  const colorNamesById = {
    0: 'black',
    1: 'white',
    29: 'medium_gray',
    2: 'dark_gray',
    3: 'medium_gray_new',
    4: 'light_gray_new',
    12: 'light_gray',
    22: 'silver',
    13: 'blue_gray',
    19: 'gray_brown',
    26: 'khaki',
    20: 'sage_gray',
    24: 'gray_green',
    28: 'mauve_gray',
    23: 'beige',
    25: 'tan',
    14: 'terra_cotta',
    21: 'brick_red',
    7: 'brown',
    8: 'green_dark',
    5: 'green',
    15: 'olive_green',
    11: 'lime',
    9: 'blue_dark',
    32: 'blue',
    10: 'purple',
    17: 'wine_red',
    27: 'dusty_rose',
    16: 'pink',
    30: 'red',
    18: 'gold_orange',
    6: 'orange',
    31: 'yellow',
    34: 'coral',
    35: 'mint'
  };
  const isCustomColor = (brushColorMode === 33);
  const currentColor = isCustomColor ? null : (colorNamesById[brushColorMode] || 'black');
  oldButtons.forEach(btn => {
    btn.classList.remove('active');
    if (!isCustomColor && btn.dataset.color === currentColor) {
      btn.classList.add('active');
    }
  });
  newSwatches.forEach(btn => {
    btn.classList.remove('active');
    if (!isCustomColor && btn.dataset.color === currentColor) {
      btn.classList.add('active');
    }
  });
}

function setPathRotation(rotationMode) {
  pathRotationMode = parseInt(rotationMode);
  updatePathRotationButtons();
  updateCurrentSettingsDisplay();
  const rotationRanges = {
    1: '2-6',
    2: '10-20',
    3: '20-40'
  };
  logArt('ui', '🔄 Path rotation changed', {
    Mode: rotationMode,
    Range: rotationRanges[rotationMode] || 'Unknown'
  });
}

function updatePathRotationButtons() {
  const buttons = document.querySelectorAll('.path-rotation-btn');
  if (buttons.length === 0) {
    console.log('⚠️ Path rotation buttons not found, skipping update');
    return;
  }
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.rotation) === pathRotationMode) {
      btn.classList.add('active');
    }
  });
}

function updateCurrentSettingsDisplay() {
  const brushModeDisplay = document.getElementById('current-brush-mode');
  if (brushModeDisplay) {
    brushModeDisplay.textContent = brushMode;
  }
  const brushSizeDisplay = document.getElementById('current-brush-size');
  if (brushSizeDisplay) {
    const sizeLabels = {
      'extra-small': 'XS',
      'small': 'S',
      'medium': 'M',
      'large': 'L',
      'extra-large': 'XL',
      'extra-extra-large': 'XXL',
      'huge': '10'
    };
    brushSizeDisplay.textContent = sizeLabels[brushSizeMode] || 'M';
  }
  const inkEffectDisplay = document.getElementById('current-ink-effect');
  if (inkEffectDisplay) {
    const effectLabels = {
      0: 'MIX',
      1: 'SHARP',
      2: 'FLYING',
      3: 'WET',
      4: 'EFFECT4',
      5: 'HAIR'
    };
    inkEffectDisplay.textContent = effectLabels[useSharpen] || 'MIX';
  }
  const brushColorDisplay = document.getElementById('current-brush-color');
  if (brushColorDisplay) {
    const colorLabelsById = {
      0: 'Black',
      1: 'White',
      29: 'Medium Gray',
      2: 'Dark Gray',
      3: 'Medium Gray',
      4: 'Light Gray',
      12: 'Light Gray',
      22: 'Silver',
      13: 'Blue Gray',
      19: 'Gray Brown',
      26: 'Khaki',
      20: 'Sage Gray',
      24: 'Gray Green',
      28: 'Mauve Gray',
      23: 'Beige',
      25: 'Tan',
      14: 'Terra Cotta',
      21: 'Brick Red',
      7: 'Brown',
      8: 'Dark Green',
      5: 'Green',
      15: 'Olive Green',
      11: 'Lime',
      9: 'Dark Blue',
      32: 'Blue',
      10: 'Purple',
      17: 'Wine Red',
      27: 'Dusty Rose',
      16: 'Pink',
      30: 'Red',
      18: 'Gold Orange',
      6: 'Orange',
      31: 'Yellow',
      34: 'Coral',
      35: 'Mint'
    };
    brushColorDisplay.textContent = colorLabelsById[brushColorMode] || 'Black';
  }
}

function resetBrushSettings() {
  brushMode = 1;
  brushSizeMode = 'large';
  baseBrushSize = 2.0;
  useSharpen = 0;
  whiteBrushMode = false;
  pathRotationMode = 1;
  if (typeof keyBlendMode !== 'undefined') {
    keyBlendMode = 0;
  }
  updateBrushModeButtons();
  updateBrushSizeButtons();
  updateInkEffectButtons();
  updateBrushColorButtons();
  updatePathRotationButtons();
  updateBlendModeButtons();
  updateCurrentSettingsDisplay();
  logArt('ui', 'Brush settings reset', {
    Status: 'All settings restored to default',
    Mode: 'Brush 1',
    Size: 'large (1.0x)',
    Effect: 'Mix Diffusion',
    Color: 'Black',
    PathRotation: '2-6'
  });
}

function addTouchAndClickEvent(element, handler) {
  if (!element) return;
  if (!window._elementLastTriggerTime) {
    window._elementLastTriggerTime = new WeakMap();
  }
  if (!window._elementTouchHandled) {
    window._elementTouchHandled = new WeakMap();
  }
  const DEBOUNCE_TIME = 300;
  element.addEventListener('touchstart', (e) => {
    const now = Date.now();
    const lastTriggerTime = window._elementLastTriggerTime.get(element) || 0;
    if (now - lastTriggerTime < DEBOUNCE_TIME) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window._elementTouchHandled.set(element, true);
    setTimeout(() => {
      window._elementTouchHandled.delete(element);
    }, DEBOUNCE_TIME);
    window._elementLastTriggerTime.set(element, now);
    e.stopPropagation();
    e.preventDefault();
    handler(e);
  }, {
    passive: false
  });
  element.addEventListener('click', (e) => {
    if (window._elementTouchHandled && window._elementTouchHandled.get(element)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const now = Date.now();
    const lastTriggerTime = window._elementLastTriggerTime.get(element) || 0;
    if (now - lastTriggerTime < DEBOUNCE_TIME) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window._elementLastTriggerTime.set(element, now);
    e.stopPropagation();
    e.preventDefault();
    handler(e);
  });
  element.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      e.stopPropagation();
    }
  });
}

function updateBackgroundColorDisplay() {
  const backgroundColorInput = document.getElementById('canvas-background-color');
  const backgroundColorTextInput = document.getElementById('canvas-background-color-text');
  if (!backgroundColorInput || !backgroundColorTextInput) {
    return;
  }
  if (typeof canvasBackgroundColor !== 'undefined') {
    const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
    const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
    const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
    const colorValue = `#${r}${g}${b}`.toUpperCase();
    backgroundColorInput.value = colorValue;
    backgroundColorTextInput.value = colorValue;
  }
}

function updateCanvasSizeDisplay() {
  const canvasWidthInput = document.getElementById('canvas-width');
  const canvasHeightInput = document.getElementById('canvas-height');
  if (!canvasWidthInput || !canvasHeightInput) {
    return;
  }
  if (typeof canvasWidth !== 'undefined' && typeof canvasHeight !== 'undefined') {
    canvasWidthInput.value = canvasWidth;
    canvasHeightInput.value = canvasHeight;
  }
}

function initializeBrushControlPanel() {
  const appMode = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
  const isCollectorMode = appMode === 'collector';
  if (isCollectorMode) {
    const controlPanel = getDOMElement('controlPanel');
    if (controlPanel) {
      controlPanel.style.display = 'none';
    }
    return;
  }
  const brushModeButtons = document.querySelectorAll('.brush-mode-btn');
  brushModeButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const mode = btn.dataset.mode;
      setBrushMode(mode);
    });
  });
  const brushSizeButtons = document.querySelectorAll('.brush-size-btn');
  brushSizeButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const sizeMode = btn.dataset.size;
      setBrushSize(sizeMode);
    });
  });
  const inkEffectButtons = document.querySelectorAll('.ink-effect-btn');
  inkEffectButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const effect = btn.dataset.effect;
      setInkEffect(effect);
    });
  });
  const brushColorButtons = document.querySelectorAll('.brush-color-btn, .color-swatch');
  brushColorButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const color = btn.dataset.color;
      if (color) {
        setBrushColor(color);
        updateButtonStyles();
      }
    });
  });
  const customBrushColorInput = document.getElementById('custom-brush-color');
  const customBrushColorTextInput = document.getElementById('custom-brush-color-text');
  if (customBrushColorInput && customBrushColorTextInput) {
    customBrushColorInput.addEventListener('input', (e) => {
      customBrushColorTextInput.value = e.target.value.toUpperCase();
      applyCustomBrushColor();
    });
    customBrushColorInput.addEventListener('change', (e) => {
      customBrushColorTextInput.value = e.target.value.toUpperCase();
      applyCustomBrushColor();
    });
    customBrushColorTextInput.addEventListener('input', (e) => {
      const colorValue = e.target.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
        customBrushColorInput.value = colorValue.toUpperCase();
      }
    });
    customBrushColorTextInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyCustomBrushColor();
      }
    });
  }
  const pathRotationButtons = document.querySelectorAll('.path-rotation-btn');
  pathRotationButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const rotationMode = btn.dataset.rotation;
      setPathRotation(rotationMode);
    });
  });
  const blendmodeButtons = document.querySelectorAll('.blendmode-btn');
  blendmodeButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const mode = btn.dataset.mode;
      setBlendMode(mode);
    });
  });
  // (Spectral is now a blend mode button, handled by blendmode handler above)
  const clearBtn = document.getElementById('clear-canvas');
  if (clearBtn) {
    addTouchAndClickEvent(clearBtn, () => {
      clearCanvas();
      if (typeof markedDarkPoints !== 'undefined') {
        markedDarkPoints = [];
      }
      if (typeof window !== 'undefined') {
        window.bugsDataTextureCache = null;
        window.bugsMaskTextureCache = null;
      }
      logArt('ui', '🧹 Canvas cleared', {
        Status: 'All drawings removed'
      });
    });
  }
  const backgroundColorInput = document.getElementById('canvas-background-color');
  const backgroundColorTextInput = document.getElementById('canvas-background-color-text');
  const canvasWidthInput = document.getElementById('canvas-width');
  const canvasHeightInput = document.getElementById('canvas-height');
  if (backgroundColorInput && backgroundColorTextInput) {
    backgroundColorInput.addEventListener('input', (e) => {
      backgroundColorTextInput.value = e.target.value.toUpperCase();
    });
    backgroundColorInput.addEventListener('change', (e) => {
      backgroundColorTextInput.value = e.target.value.toUpperCase();
      applyBackgroundColor();
    });
    backgroundColorTextInput.addEventListener('input', (e) => {
      const colorValue = e.target.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
        backgroundColorInput.value = colorValue.toUpperCase();
      }
    });
    backgroundColorTextInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyBackgroundColor();
      }
    });
    if (typeof updateBackgroundColorDisplay === 'function') {
      updateBackgroundColorDisplay();
    } else {
      setTimeout(() => {
        if (typeof updateBackgroundColorDisplay === 'function') {
          updateBackgroundColorDisplay();
        }
      }, 100);
    }
  }
  if (canvasWidthInput && canvasHeightInput) {
    canvasWidthInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyBackgroundColor();
      }
    });
    canvasHeightInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyBackgroundColor();
      }
    });
    if (typeof updateCanvasSizeDisplay === 'function') {
      updateCanvasSizeDisplay();
    } else {
      setTimeout(() => {
        if (typeof updateCanvasSizeDisplay === 'function') {
          updateCanvasSizeDisplay();
        }
      }, 100);
    }
  }
  const panelScaleSlider = document.getElementById('panel-scale-slider');
  if (panelScaleSlider) {
    panelScaleSlider.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
    panelScaleSlider.addEventListener('input', (e) => {
      window.panelScale = parseFloat(e.target.value);
      updateOverlayPosition();
      updateControlPanelPosition();
      updateEffectControlPanelPosition();
      updateFlowEffectPanelPosition();
    });
  }
  const toggleBtn = document.getElementById('toggle-control-panel');
  if (toggleBtn) {
    addTouchAndClickEvent(toggleBtn, toggleControlPanel);
  }
  const controlPanel = getDOMElement('controlPanel');
  const header = controlPanel?.querySelector('.control-panel-header');
  if (header) {
    header.addEventListener('mousedown', startControlPanelDrag);
    header.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault()
      };
      startControlPanelDrag(mouseEvent);
    });
  }
  const effectControlPanel = getDOMElement('effectControlPanel');
  const effectHeader = effectControlPanel?.querySelector('.effect-control-panel-header');
  if (effectHeader) {
    effectHeader.addEventListener('mousedown', startEffectControlPanelDrag);
    effectHeader.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault()
      };
      startEffectControlPanelDrag(mouseEvent);
    });
  }
  const toggleEffectControlPanelBtn = document.getElementById('toggle-effect-control-panel');
  if (toggleEffectControlPanelBtn) {
    addTouchAndClickEvent(toggleEffectControlPanelBtn, toggleEffectControlPanel);
  }
  const flowEffectPanel = getDOMElement('flowEffectPanel');
  const flowHeader = flowEffectPanel?.querySelector('.flow-effect-panel-header');
  if (flowHeader) {
    flowHeader.addEventListener('mousedown', startFlowEffectPanelDrag);
    flowHeader.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault()
      };
      startFlowEffectPanelDrag(mouseEvent);
    });
  }
  const toggleFlowEffectPanelBtn = document.getElementById('toggle-flow-effect-panel');
  if (toggleFlowEffectPanelBtn) {
    addTouchAndClickEvent(toggleFlowEffectPanelBtn, toggleFlowEffectPanel);
  }
  const screenTextToggle = document.getElementById('screen-text-toggle');
  if (screenTextToggle) {
    screenTextToggle.addEventListener('change', toggleScreenText);
  }
  updateBrushModeButtons();
  updateBrushSizeButtons();
  updateInkEffectButtons();
  updateBrushColorButtons();
  updatePathRotationButtons();
  updateBlendModeButtons();
  updateCurrentSettingsDisplay();
  if (screenTextToggle) {
    screenTextToggle.checked = screenText;
  }
}

function updateStatusUI() {
  const now = millis();
  const shouldUpdate = (now - lastUIUpdateTime) >= UI_UPDATE_INTERVAL;
  const recordingStatus = getDOMElement('recordingStatus');
  if (recordingStatus) {
    if (isRecording) {
      recordingStatus.classList.remove('hidden');
    } else {
      recordingStatus.classList.add('hidden');
    }
  }
  const playbackStatus = getDOMElement('playbackStatus');
  const countdownStatus = getDOMElement('countdownStatus');
  if (isPlaying) {
    if (isWaitingToLoop) {
      if (playbackStatus) playbackStatus.classList.add('hidden');
      if (countdownStatus) countdownStatus.classList.remove('hidden');
      if (shouldUpdate) {
        const remainingTime = loopWaitDuration - (millis() - loopWaitStartTime);
        const remainingSeconds = Math.ceil(remainingTime / 1000);
        const countdownProgress = remainingTime / loopWaitDuration;
        if (window.DEBUG_MODE && remainingSeconds !== lastLoggedCountdownSecond) {
          console.log(`Countdown: ${remainingSeconds}s remaining (${Math.floor(countdownProgress * 100)}%)`);
          lastLoggedCountdownSecond = remainingSeconds;
        }
        const countdownText = getDOMElement('countdownText');
        if (countdownText) {
          countdownText.textContent = `Waiting ${remainingSeconds}s`;
        }
        const countdownCircle = getDOMElement('countdownCircle');
        if (countdownCircle) {
          const circumference = 62.83;
          const offset = circumference * (1 - countdownProgress);
          countdownCircle.style.strokeDashoffset = offset;
        }
      }
    } else {
      lastLoggedCountdownSecond = -1;
      if (countdownStatus) countdownStatus.classList.add('hidden');
      if (playbackStatus) playbackStatus.classList.remove('hidden');
      if (shouldUpdate) {
        const progress = recordingData.events.length > 0 ?
          currentEventIndex / recordingData.events.length : 0;
        const progressPercent = Math.round(progress * 100);
        if (progressPercent !== lastProgressValue) {
          const progressFill = getDOMElement('progressFill');
          const progressText = getDOMElement('progressText');
          if (progressFill) progressFill.style.width = `${progressPercent}%`;
          if (progressText) progressText.textContent = `${progressPercent}%`;
          lastProgressValue = progressPercent;
        }
      }
    }
  } else {
    lastLoggedCountdownSecond = -1;
    if (playbackStatus) playbackStatus.classList.add('hidden');
    if (countdownStatus) countdownStatus.classList.add('hidden');
  }
  if (shouldUpdate) {
    lastUIUpdateTime = now;
  }
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

function createMessageElement(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-item new-message';
  const iconSpan = document.createElement('span');
  iconSpan.className = 'message-icon';
  iconSpan.textContent = msg.icon;
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  const headerDiv = document.createElement('div');
  headerDiv.className = 'message-header';
  const timestampSpan = document.createElement('span');
  timestampSpan.className = 'message-timestamp';
  timestampSpan.textContent = msg.timestamp;
  const typeSpan = document.createElement('span');
  typeSpan.className = `message-type ${msg.type}`;
  typeSpan.textContent = msg.type.toUpperCase();
  headerDiv.appendChild(timestampSpan);
  headerDiv.appendChild(typeSpan);
  const textP = document.createElement('p');
  textP.className = 'message-text';
  textP.textContent = msg.message;
  contentDiv.appendChild(headerDiv);
  contentDiv.appendChild(textP);
  if (Object.keys(msg.data).length > 0) {
    const dataDiv = document.createElement('div');
    dataDiv.className = 'message-data';
    dataDiv.textContent = JSON.stringify(msg.data, null, 2);
    contentDiv.appendChild(dataDiv);
  }
  messageDiv.appendChild(iconSpan);
  messageDiv.appendChild(contentDiv);
  setTimeout(() => {
    messageDiv.classList.remove('new-message');
  }, 300);
  return messageDiv;
}

function toggleOverlay() {
  isOverlayVisible = !isOverlayVisible;
  const overlay = document.getElementById('message-overlay');
  const hint = document.getElementById('toggle-hint');
  if (overlay && hint) {
    if (isOverlayVisible) {
      overlay.classList.remove('hidden');
      hint.classList.add('hidden');
      updateOverlayPosition();
    } else {
      positionHintAtButton(hint, 'toggle-overlay');
      overlay.classList.add('hidden');
      hint.classList.remove('hidden');
    }
  }
  localStorage.setItem('overlayVisible', isOverlayVisible.toString());
}

function clearMessages() {
  messageHistory = [];
  updateOverlayDOM();
}

function updateRecordStatus() {
  const recordStatusText = document.getElementById('record-status-text');
  if (recordStatusText) {
    if (record == 1) {
      recordStatusText.textContent = 'ON';
      recordStatusText.classList.add('active');
    } else {
      recordStatusText.textContent = 'OFF';
      recordStatusText.classList.remove('active');
    }
  }
}

function loadPanelStateFromURL() {
  const panelState = {};
  const queryString = window.location.search;
  if (!queryString || queryString.length <= 1) {
    return panelState;
  }
  const paramsString = queryString.substring(1);
  const params = paramsString.split('_');
  const numericParams = {
    'wd': true,
    'gr': true
  };
  for (const param of params) {
    if (!param) continue;
    const colonIndex = param.indexOf(':');
    if (colonIndex === -1) continue;
    const key = param.substring(0, colonIndex);
    const value = param.substring(colonIndex + 1);
    if (key) {
      if (key === 'w' || key === 'h') {
        const intVal = parseInt(value);
        if (!isNaN(intVal) && intVal > 0) {
          panelState[key] = intVal;
        }
        continue;
      }
      if (numericParams[key]) {
        const numVal = parseFloat(value);
        if (!isNaN(numVal) && numVal > 0) {
          panelState[key] = true;
          panelState[key + '_val'] = numVal;
        } else {
          panelState[key] = false;
        }
      } else {
        panelState[key] = value === '1';
      }
    }
  }
  return panelState;
}

function applyPanelState(state) {
  const toggleMap = {
    'path': 'future-path-preview-toggle',
    'grid': 'grid-overlay-toggle',
    'console': 'screen-text-toggle',
    'paper': 'paper-texture-toggle',
    'camera': 'camera-moving-toggle',
    'loop': 'loop-toggle',
    'distort': 'distort-shader-toggle',
    'rs': 'rs-toggle',
    'cl': 'cellular-toggle',
    'wd': 'white-dot-toggle',
    'gr': 'grain-toggle'
  };
  for (const [param, toggleId] of Object.entries(toggleMap)) {
    if (state.hasOwnProperty(param)) {
      if (param === 'loop' && window.APP_MODE === 'collector') {
        if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
        continue;
      }
      const shouldEnable = state[param];
      const toggle = document.getElementById(toggleId);
      if (toggle) {
        toggle.checked = shouldEnable;
        toggle.dispatchEvent(new Event('change'));
        if (param === 'rs') {
          const rsSlidersSection = document.getElementById('rs-sliders-section');
          if (rsSlidersSection) {
            rsSlidersSection.style.display = shouldEnable ? 'flex' : 'none';
          }
        } else if (param === 'distort') {
          const distortSlidersSection = document.getElementById('distort-sliders-section');
          if (distortSlidersSection) {
            distortSlidersSection.style.display = shouldEnable ? 'flex' : 'none';
          }
        } else if (param === 'cl') {
          const cellularSlidersSection = document.getElementById('cellular-sliders-section');
          if (cellularSlidersSection) {
            cellularSlidersSection.style.display = shouldEnable ? 'flex' : 'none';
          }
        } else if (param === 'wd') {
          const wdSection = document.getElementById('white-dot-sliders-section');
          if (wdSection) {
            wdSection.style.display = shouldEnable ? 'flex' : 'none';
          }
          if (shouldEnable && state['wd_val'] !== undefined) {
            const wdSlider = document.getElementById('white-dot-density');
            const wdValue = document.getElementById('white-dot-density-value');
            if (wdSlider) wdSlider.value = state['wd_val'];
            if (wdValue) wdValue.textContent = state['wd_val'].toFixed(2);
          }
        } else if (param === 'gr') {
          const grSection = document.getElementById('grain-sliders-section');
          if (grSection) {
            grSection.style.display = shouldEnable ? 'flex' : 'none';
          }
          if (shouldEnable && state['gr_val'] !== undefined) {
            const grSlider = document.getElementById('grain-amount');
            const grValue = document.getElementById('grain-amount-value');
            if (grSlider) grSlider.value = state['gr_val'];
            if (grValue) grValue.textContent = state['gr_val'].toFixed(2);
          }
        }
      } else {
        console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${param}`);
      }
    }
  }
}

function initializeOverlay() {
  initDOMCache();
  const urlPanelState = loadPanelStateFromURL();
  const globalVarMap = {
    'path': 'showFuturePathPreview',
    'grid': 'showGridOverlay',
    'console': 'screenText',
    'paper': 'showPaperTexture',
    'camera': 'doMoving',
    'loop': 'loopToggle',
    'distort': 'distortShaderEnabled',
    'rs': 'rsEnabled',
    'cl': 'cellularEnabled',
    'wd': 'whiteDotEnabled',
    'gr': 'grainEnabled'
  };
  if (urlPanelState['w']) window._urlCanvasWidth = urlPanelState['w'];
  if (urlPanelState['h']) window._urlCanvasHeight = urlPanelState['h'];
  if (Object.keys(urlPanelState).length > 0) {
    console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
    // 只設定 URL 有明確指定的 toggle，不歸零其他 toggle
    for (const [param, shouldEnable] of Object.entries(urlPanelState)) {
      const globalVarName = globalVarMap[param];
      if (globalVarName && typeof window[globalVarName] !== 'undefined') {
        if (param === 'loop') {
          window[globalVarName] = shouldEnable ? 1 : 0;
        } else {
          window[globalVarName] = shouldEnable;
        }
      }
    }
    const numericVarMap = {
      'wd': 'whiteDotDensity',
      'gr': 'grainAmount'
    };
    const urlParamWindowKeys = {
      'wd': '_urlParamWdVal',
      'gr': '_urlParamGrVal'
    };
    for (const [param, globalVarName] of Object.entries(numericVarMap)) {
      const valKey = param + '_val';
      if (urlPanelState[valKey] !== undefined) {
        window[globalVarName] = urlPanelState[valKey];
        window[urlParamWindowKeys[param]] = urlPanelState[valKey];
      }
    }
    window._initialConsoleFromURL = urlPanelState.hasOwnProperty('console') ? urlPanelState.console : false;
  }
  const appMode = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
  const isCollectorMode = appMode === 'collector';
  const toggleBtn = document.getElementById('toggle-overlay');
  const toggleHintBtn = document.getElementById('toggle-hint-btn');
  const clearBiteBtn = document.getElementById('clear-bite-points');
  const scanGlobalBtn = document.getElementById('scan-global');
  const scanCurrentBtn = document.getElementById('scan-current');
  const scanRandomBtn = document.getElementById('scan-random');
  const scanCurrentRandomBtn = document.getElementById('scan-current-random');
  const brushHintBtn = document.getElementById('brush-hint-btn');
  const pixelDensityRadios = document.querySelectorAll('input[name="pixel-density"]');
  if (pixelDensityRadios.length > 0) {
    let defaultPixel = 2;
    if (typeof pixel !== 'undefined') {
      defaultPixel = pixel;
    }
    const defaultRadio = document.querySelector(`input[name="pixel-density"][value="${defaultPixel}"]`);
    if (defaultRadio) {
      defaultRadio.checked = true;
    }
    pixelDensityRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          const newPixel = parseInt(e.target.value);
          if (typeof pixel !== 'undefined') {
            pixel = newPixel;
            try {
              sessionStorage.setItem('pendingPixelDensity', newPixel.toString());
              if (typeof isRecording !== 'undefined' && isRecording && typeof recordingData !== 'undefined' && recordingData) {
                sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
                sessionStorage.setItem('shouldAutoPlay', 'true');
              }
              logArt('system', '🎨 Pixel density changed - reloading page', {
                Value: newPixel,
                Status: 'Page will reload to recreate canvas with new pixel density',
                Note: 'Current drawing will be cleared'
              });
              setTimeout(() => {
                window.location.reload();
              }, 300);
            } catch (error) {
              logArt('system', '❌ Failed to update pixel density', {
                Error: error.message,
                Status: 'Error'
              });
            }
          } else {
            logArt('system', '⚠️ Pixel variable not found', {
              Status: 'Error: Variable not defined'
            });
          }
        }
      });
    });
  }
  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('stop-btn');
  const playBtn = document.getElementById('play-btn');
  const loadBtn = document.getElementById('load-recording');
  if (isCollectorMode) {
    if (brushHintBtn) brushHintBtn.style.display = 'none';
  }
  const recordToggle = document.getElementById('record-toggle');
  const recordStatusText = document.getElementById('record-status-text');
  const realtimeDrawingToggle = document.getElementById('realtime-drawing-toggle');
  const realtimeDrawingStatusText = document.getElementById('realtime-drawing-status-text');
  const gridOverlayToggle = document.getElementById('grid-overlay-toggle');
  const paperTextureToggle = document.getElementById('paper-texture-toggle');
  const cameraMovingToggle = document.getElementById('camera-moving-toggle');
  const loopToggleElement = document.getElementById('loop-toggle');
  const overlay = document.getElementById('message-overlay');
  const hint = document.getElementById('toggle-hint');
  const brushHint = document.getElementById('brush-hint');
  const header = overlay?.querySelector('.overlay-header');
  if (overlay && hint) {
    if (isOverlayVisible) {
      overlay.classList.remove('hidden');
      hint.classList.add('hidden');
      updateOverlayPosition();
    } else {
      overlay.classList.add('hidden');
      hint.classList.remove('hidden');
    }
  }
  const controlPanel = getDOMElement('controlPanel');
  if (controlPanel && brushHint) {
    if (controlPanelVisible) {
      controlPanel.style.display = 'block';
      brushHint.classList.add('hidden');
    } else {
      controlPanel.style.display = 'none';
      brushHint.classList.remove('hidden');
    }
  }
  if (toggleBtn) {
    addTouchAndClickEvent(toggleBtn, toggleOverlay);
  }
  if (toggleHintBtn) {
    addTouchAndClickEvent(toggleHintBtn, () => {
      if (!wasHintJustDragged()) toggleOverlay();
    });
  }
  if (brushHintBtn) {
    addTouchAndClickEvent(brushHintBtn, () => {
      if (!wasHintJustDragged()) toggleControlPanel();
    });
  }
  const effectHintBtn = document.getElementById('effect-hint-btn');
  if (effectHintBtn) {
    addTouchAndClickEvent(effectHintBtn, () => {
      if (!wasHintJustDragged()) toggleEffectControlPanel();
    });
  }
  const flowHintBtn = document.getElementById('flow-hint-btn');
  if (flowHintBtn) {
    addTouchAndClickEvent(flowHintBtn, () => {
      if (!wasHintJustDragged()) toggleFlowEffectPanel();
    });
  }
  if (scanGlobalBtn) {
    addTouchAndClickEvent(scanGlobalBtn, () => {
      if (typeof scanAndMarkDarkPoints === 'function') {
        const shapeType = getShapeType();
        let scanSeed = null;
        if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
          scanSeed = int(crandom.random(100000000, 999999999));
        } else if (typeof random === 'function') {
          scanSeed = int(random(100000000, 999999999));
        }
        const savedSeed = (typeof seed !== 'undefined') ? seed : null;
        if (scanSeed && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
          randomSeed(scanSeed);
          noiseSeed(scanSeed);
        }
        if (typeof window !== 'undefined') {
          window.currentScanEvent = {
            action: 'scan-global',
            shapeType: shapeType,
            scanSeed: scanSeed
          };
        }
        scanAndMarkDarkPoints(null, null, shapeType);
        let recordedRandomCount = 0;
        if (typeof window !== 'undefined' && window.currentScanEvent && window.currentScanEvent.recordedRandomCount !== undefined) {
          recordedRandomCount = window.currentScanEvent.recordedRandomCount;
        }
        if (savedSeed && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
          randomSeed(savedSeed);
          noiseSeed(savedSeed);
        }
        if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
          const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
          recordEvent('ec', {
            action: 'scan-global',
            shapeType: shapeType,
            bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
            scanSeed: scanSeed,
            randomCount: recordedRandomCount,
            targetPoints: targetPoints
          });
        }
        if (typeof window !== 'undefined') {
          window.currentScanEvent = null;
        }
      } else {
        console.error('scanAndMarkDarkPoints 函数未定义');
      }
    });
  }

  function executeEachScan(strokeIndex = null) {
    if (typeof scanAndMarkDarkPoints !== 'function') {
      console.error('scanAndMarkDarkPoints 函数未定义');
      return;
    }
    const shapeType = getShapeType();
    let scanBounds = null;
    let selectedIndex = null;
    if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
      if (strokeIndex !== null) {
        selectedIndex = Math.max(0, Math.min(strokeIndex, allBrushStrokes.length - 1));
      } else {
        const strokeSlider = document.getElementById('stroke-select-slider');
        if (strokeSlider) {
          selectedIndex = parseInt(strokeSlider.value) || 0;
          selectedIndex = Math.max(0, Math.min(selectedIndex, allBrushStrokes.length - 1));
        }
      }
      if (selectedIndex !== null) {
        const selectedStroke = allBrushStrokes[selectedIndex];
        if (selectedStroke) {
          if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
            scanBounds = {
              minX: selectedStroke.gridParams.left,
              maxX: selectedStroke.gridParams.right,
              minY: selectedStroke.gridParams.top,
              maxY: selectedStroke.gridParams.bottom
            };
            logArt('system', `🎯 EACH: 使用笔画 #${selectedIndex} 的网格区域`, {
              Index: selectedIndex,
              GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
              TotalStrokes: allBrushStrokes.length
            });
          } else if (selectedStroke.bounds) {
            scanBounds = {
              ...selectedStroke.bounds
            };
            logArt('system', `🎯 EACH: 使用笔画 #${selectedIndex} 的边界框（无网格数据）`, {
              Index: selectedIndex,
              TotalStrokes: allBrushStrokes.length
            });
          }
        }
      }
    }
    if (!scanBounds) {
      if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
        scanBounds = pendingBugBounds;
      } else if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
        const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
        if (lastStroke.bounds) {
          scanBounds = {
            ...lastStroke.bounds
          };
        }
      }
    }
    let scanSeed = null;
    if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
      scanSeed = int(crandom.random(100000000, 999999999));
    } else if (typeof random === 'function') {
      scanSeed = int(random(100000000, 999999999));
    }
    const savedSeed = (typeof seed !== 'undefined') ? seed : null;
    if (scanSeed && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
      randomSeed(scanSeed);
      noiseSeed(scanSeed);
    }
    if (typeof window !== 'undefined') {
      window.currentScanEvent = {
        action: 'scan-current',
        shapeType: shapeType,
        scanSeed: scanSeed
      };
    }
    scanAndMarkDarkPoints(null, scanBounds, shapeType);
    let recordedRandomCount = 0;
    if (typeof window !== 'undefined' && window.currentScanEvent && window.currentScanEvent.recordedRandomCount !== undefined) {
      recordedRandomCount = window.currentScanEvent.recordedRandomCount;
    }
    if (savedSeed && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
      randomSeed(savedSeed);
      noiseSeed(savedSeed);
    }
    if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
      const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
      recordEvent('ec', {
        action: 'scan-current',
        shapeType: shapeType,
        bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
        scanBounds: scanBounds,
        scanSeed: scanSeed,
        randomCount: recordedRandomCount,
        strokeIndex: selectedIndex,
        targetPoints: targetPoints
      });
    }
    if (typeof window !== 'undefined') {
      window.currentScanEvent = null;
    }
  }
  if (scanCurrentBtn) {
    addTouchAndClickEvent(scanCurrentBtn, () => {
      executeEachScan();
    });
  }
  if (scanCurrentRandomBtn) {
    addTouchAndClickEvent(scanCurrentRandomBtn, () => {
      if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
        const randomIndex = Math.floor(Math.random() * allBrushStrokes.length);
        const strokeSlider = document.getElementById('stroke-select-slider');
        const strokeIndexDisplay = document.getElementById('stroke-index-display');
        const strokeValueDisplay = document.getElementById('stroke-select-value');
        if (strokeSlider) {
          strokeSlider.value = randomIndex;
          strokeSlider.dispatchEvent(new Event('input', {
            bubbles: true
          }));
        }
        if (strokeIndexDisplay) {
          strokeIndexDisplay.textContent = randomIndex;
        }
        if (strokeValueDisplay) {
          strokeValueDisplay.textContent = randomIndex;
        }
        logArt('system', `🎲 EACHR: 随机选择笔画 #${randomIndex}`, {
          RandomIndex: randomIndex,
          TotalStrokes: allBrushStrokes.length
        });
        executeEachScan(randomIndex);
      } else {
        logArt('system', '⚠️ EACHR: 没有可用的笔画', {});
      }
    });
  }
  if (scanRandomBtn) {
    addTouchAndClickEvent(scanRandomBtn, () => {
      if (typeof generateRandomBitePointsAnywhere === 'function') {
        const shapeType = getShapeType();
        generateRandomBitePointsAnywhere(10, shapeType);
        if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
          recordEvent('ec', {
            action: 'scan-random',
            shapeType: shapeType,
            bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0
          });
        }
      } else {
        console.error('generateRandomBitePointsAnywhere 函数未定义');
      }
    });
  }
  if (clearBiteBtn) {
    addTouchAndClickEvent(clearBiteBtn, () => {
      if (typeof markedDarkPoints !== 'undefined' && markedDarkPoints.length > 0) {
        let pointCount = typeof markedDarkPoints !== 'undefined' ? markedDarkPoints.length : 0;
        if (typeof markedDarkPoints !== 'undefined') {
          markedDarkPoints = [];
        }
        if (typeof window !== 'undefined') {
          window.bugsDataTextureCache = null;
          window.bugsMaskTextureCache = null;
        }
        logArt('system', '🧹 清除虫咬点', {
          '虫咬点': pointCount
        });
      } else {
        logArt('system', '⚠️ 没有虫咬点可清除', {});
      }
    });
  }
  if (recordToggle) {
    recordToggle.checked = (record == 1);
    updateRecordStatus();
    recordToggle.addEventListener('change', (e) => {
      record = e.target.checked ? 1 : 0;
      updateRecordStatus();
      logArt('system', `Record mode ${record ? 'enabled' : 'disabled'}`, {
        Status: record ? 'ON' : 'OFF'
      });
    });
  }
  if (realtimeDrawingToggle) {
    realtimeDrawingToggle.disabled = true;
    if (realtimeDrawingStatusText) {
      realtimeDrawingStatusText.textContent = 'DISABLED';
    }
    realtimeDrawingToggle.addEventListener('change', (e) => {
      e.target.checked = false;
      logArt('system', '⚠️ Realtime drawing mode is disabled', {
        Status: 'Feature removed'
      });
    });
  }
  if (gridOverlayToggle) {
    try {
      if (typeof showGridOverlay !== 'undefined') {
        gridOverlayToggle.checked = !!showGridOverlay;
      }
    } catch (e) {}
    gridOverlayToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        showGridOverlay = enabled;
      } catch (err) {}
      logArt('system', '📐 Grid overlay', {
        Status: enabled ? 'Show ✅' : 'Hide ❌'
      });
    });
  }
  if (paperTextureToggle) {
    try {
      if (typeof showPaperTexture !== 'undefined') {
        paperTextureToggle.checked = !!showPaperTexture;
      } else {
        paperTextureToggle.checked = true;
      }
    } catch (e) {
      paperTextureToggle.checked = true;
    }
    paperTextureToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        showPaperTexture = enabled;
      } catch (err) {}
      logArt('system', '🧻 Paper texture', {
        Status: enabled ? 'Show ✅' : 'Hide ❌'
      });
    });
  }
  const fitCanvasToggle = document.getElementById('fit-canvas-toggle');
  if (fitCanvasToggle) {
    fitCanvasToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      if (typeof window.toggleFitMode === 'function') {
        window.toggleFitMode(enabled);
        logArt('system', '🎨 Fit canvas', {
          Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
        });
      } else {
        logArt('system', '⚠️ Fit mode function not available', {
          Status: 'Error'
        });
      }
    });
  }
  if (cameraMovingToggle) {
    try {
      if (typeof doMoving !== 'undefined') {
        cameraMovingToggle.checked = !!doMoving;
      } else {
        cameraMovingToggle.checked = false;
      }
    } catch (e) {
      cameraMovingToggle.checked = false;
    }
    cameraMovingToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        doMoving = enabled;
      } catch (err) {}
      logArt('system', '🎥 Camera moving', {
        Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
      });
    });
  }
  if (loopToggleElement) {
    try {
      if (typeof loopToggle !== 'undefined') {
        loopToggleElement.checked = (loopToggle === 1);
      } else {
        loopToggleElement.checked = false;
      }
    } catch (e) {
      loopToggleElement.checked = false;
    }
    loopToggleElement.addEventListener('change', (e) => {
      if (window.APP_MODE === 'collector') {
        if (window.DEBUG_MODE) console.log('🔒 Collector 模式：loopToggle 强制保持为 1，忽略 UI 修改');
        loopToggle = 1;
        e.target.checked = true;
        return;
      }
      const enabled = !!e.target.checked;
      if (window.DEBUG_MODE) {
        console.log('🔍 loopToggle UI 修改:', {
          from: loopToggle,
          to: enabled ? 1 : 0,
          APP_MODE: window.APP_MODE,
          checked: e.target.checked
        });
      }
      try {
        if (typeof loopToggle !== 'undefined') {
          loopToggle = enabled ? 1 : 0;
          logArt('system', '🔁 Loop playback', {
            Status: enabled ? 'Enabled ✅ (Auto repeat after 5s)' : 'Disabled ❌ (Single playback)'
          });
        } else {
          console.warn('⚠️ loopToggle variable not found');
        }
      } catch (err) {
        console.error('Error setting loopToggle:', err);
      }
    });
  }
  const playbackOffsetXInput = document.getElementById('playback-offset-x');
  const playbackOffsetYInput = document.getElementById('playback-offset-y');
  if (playbackOffsetXInput) {
    if (typeof playbackOffsetX !== 'undefined') {
      playbackOffsetXInput.value = playbackOffsetX;
    }
    playbackOffsetXInput.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value) || 0;
      if (typeof playbackOffsetX !== 'undefined') {
        playbackOffsetX = value;
        logArt('system', '📍 Playback offset X updated', {
          OffsetX: value
        });
      }
    });
  }
  if (playbackOffsetYInput) {
    if (typeof playbackOffsetY !== 'undefined') {
      playbackOffsetYInput.value = playbackOffsetY;
    }
    playbackOffsetYInput.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value) || 0;
      if (typeof playbackOffsetY !== 'undefined') {
        playbackOffsetY = value;
        logArt('system', '📍 Playback offset Y updated', {
          OffsetY: value
        });
      }
    });
  }
  const distortShaderToggle = document.getElementById('distort-shader-toggle');
  const distortSlidersSection = document.getElementById('distort-sliders-section');
  if (distortShaderToggle) {
    try {
      if (typeof distortShaderEnabled !== 'undefined') {
        distortShaderToggle.checked = !!distortShaderEnabled;
        if (distortSlidersSection) {
          distortSlidersSection.style.display = distortShaderEnabled ? 'flex' : 'none';
        }
      } else {
        distortShaderToggle.checked = false;
        if (distortSlidersSection) {
          distortSlidersSection.style.display = 'none';
        }
      }
    } catch (e) {
      distortShaderToggle.checked = false;
      if (distortSlidersSection) {
        distortSlidersSection.style.display = 'none';
      }
    }
    distortShaderToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        if (typeof distortShaderEnabled !== 'undefined') {
          distortShaderEnabled = enabled;
          if (distortSlidersSection) {
            distortSlidersSection.style.display = enabled ? 'flex' : 'none';
          }
          logArt('system', '🌀 Distort shader', {
            Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
          });
        } else {
          console.warn('⚠️ distortShaderEnabled variable not found');
        }
      } catch (err) {
        console.error('Error setting distortShaderEnabled:', err);
      }
    });
  }
  const distortDisplacementBSlider = document.getElementById('distort-displacement-b');
  const distortDisplacementBValue = document.getElementById('distort-displacement-b-value');
  if (distortDisplacementBSlider && distortDisplacementBValue) {
    const initialValue = parseFloat(distortDisplacementBSlider.value);
    if (typeof distortDisplacementB !== 'undefined') {
      distortDisplacementB = initialValue;
    }
    distortDisplacementBValue.textContent = Math.round(initialValue);
    distortDisplacementBSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof distortDisplacementB !== 'undefined') {
        distortDisplacementB = value;
      }
      distortDisplacementBValue.textContent = Math.round(value);
    });
  }
  const distortDisplacementCSlider = document.getElementById('distort-displacement-c');
  const distortDisplacementCValue = document.getElementById('distort-displacement-c-value');
  if (distortDisplacementCSlider && distortDisplacementCValue) {
    const initialValue = parseFloat(distortDisplacementCSlider.value);
    if (typeof distortDisplacementC !== 'undefined') {
      distortDisplacementC = initialValue;
    }
    distortDisplacementCValue.textContent = Math.round(initialValue);
    distortDisplacementCSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof distortDisplacementC !== 'undefined') {
        distortDisplacementC = value;
      }
      distortDisplacementCValue.textContent = Math.round(value);
    });
  }
  const distortFbmPreviewToggle = document.getElementById('distort-fbm-preview-toggle');
  if (distortFbmPreviewToggle) {
    try {
      if (typeof distortShowFbmMask !== 'undefined') {
        distortFbmPreviewToggle.checked = (distortShowFbmMask > 0.5);
      } else {
        distortFbmPreviewToggle.checked = false;
      }
    } catch (e) {
      distortFbmPreviewToggle.checked = false;
    }
    distortFbmPreviewToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        if (typeof distortShowFbmMask !== 'undefined') {
          distortShowFbmMask = enabled ? 1.0 : 0.0;
          logArt('system', '🎨 fBM Mask Preview', {
            Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
          });
        } else {
          console.warn('⚠️ distortShowFbmMask variable not found');
        }
      } catch (err) {
        console.error('Error setting distortShowFbmMask:', err);
      }
    });
  }
  const rsToggle = document.getElementById('rs-toggle');
  const rsSlidersSection = document.getElementById('rs-sliders-section');
  if (rsToggle) {
    try {
      if (typeof rsEnabled !== 'undefined') {
        rsToggle.checked = !!rsEnabled;
        if (rsSlidersSection) {
          rsSlidersSection.style.display = rsEnabled ? 'flex' : 'none';
        }
      } else {
        rsToggle.checked = false;
        if (rsSlidersSection) {
          rsSlidersSection.style.display = 'none';
        }
      }
    } catch (e) {
      rsToggle.checked = false;
      if (rsSlidersSection) {
        rsSlidersSection.style.display = 'none';
      }
    }
    rsToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        if (typeof rsEnabled !== 'undefined') {
          rsEnabled = enabled;
          if (rsSlidersSection) {
            rsSlidersSection.style.display = enabled ? 'flex' : 'none';
          }
          logArt('system', '🌊 Resonances', {
            Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
          });
        } else {
          console.warn('⚠️ rsEnabled variable not found');
        }
      } catch (err) {
        console.error('Error setting rsEnabled:', err);
      }
    });
  }
  const rsFrequencySlider = document.getElementById('rs-frequency');
  const rsFrequencyValue = document.getElementById('rs-frequency-value');
  if (rsFrequencySlider && rsFrequencyValue) {
    const initialValue = parseFloat(rsFrequencySlider.value);
    if (typeof rsFrequency !== 'undefined') {
      rsFrequency = initialValue;
    }
    rsFrequencyValue.textContent = Math.round(initialValue);
    rsFrequencySlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof rsFrequency !== 'undefined') {
        rsFrequency = value;
      }
      rsFrequencyValue.textContent = Math.round(value);
    });
  }
  const rsWaveSpeedSlider = document.getElementById('rs-wave-speed');
  const rsWaveSpeedValue = document.getElementById('rs-wave-speed-value');
  if (rsWaveSpeedSlider && rsWaveSpeedValue) {
    const initialValue = parseFloat(rsWaveSpeedSlider.value);
    if (typeof rsWaveSpeed !== 'undefined') {
      rsWaveSpeed = initialValue;
    }
    rsWaveSpeedValue.textContent = initialValue.toFixed(1);
    rsWaveSpeedSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof rsWaveSpeed !== 'undefined') {
        rsWaveSpeed = value;
      }
      rsWaveSpeedValue.textContent = value.toFixed(1);
    });
  }
  const rsStrengthSlider = document.getElementById('rs-strength');
  const rsStrengthValue = document.getElementById('rs-strength-value');
  if (rsStrengthSlider && rsStrengthValue) {
    const initialValue = parseFloat(rsStrengthSlider.value);
    if (typeof rsStrength !== 'undefined') {
      rsStrength = initialValue;
    }
    rsStrengthValue.textContent = initialValue.toFixed(1);
    rsStrengthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof rsStrength !== 'undefined') {
        rsStrength = value;
      }
      rsStrengthValue.textContent = value.toFixed(1);
    });
  }
  const rsGradientMixSlider = document.getElementById('rs-gradient-mix');
  const rsGradientMixValue = document.getElementById('rs-gradient-mix-value');
  if (rsGradientMixSlider && rsGradientMixValue) {
    const initialValue = parseFloat(rsGradientMixSlider.value);
    if (typeof rsGradientMix !== 'undefined') {
      rsGradientMix = initialValue;
    }
    rsGradientMixValue.textContent = initialValue.toFixed(1);
    rsGradientMixSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof rsGradientMix !== 'undefined') {
        rsGradientMix = value;
      }
      rsGradientMixValue.textContent = value.toFixed(1);
    });
  }
  const rsScaleSlider = document.getElementById('rs-scale');
  const rsScaleValue = document.getElementById('rs-scale-value');
  if (rsScaleSlider && rsScaleValue) {
    const initialValue = parseFloat(rsScaleSlider.value);
    if (typeof rsScale !== 'undefined') {
      rsScale = initialValue;
    }
    rsScaleValue.textContent = Math.round(initialValue);
    rsScaleSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof rsScale !== 'undefined') {
        rsScale = value;
      }
      rsScaleValue.textContent = Math.round(value);
    });
  }
  const cellularToggle = document.getElementById('cellular-toggle');
  const cellularSlidersSection = document.getElementById('cellular-sliders-section');
  if (cellularToggle) {
    try {
      if (typeof cellularEnabled !== 'undefined') {
        cellularToggle.checked = !!cellularEnabled;
        if (cellularSlidersSection) {
          cellularSlidersSection.style.display = cellularEnabled ? 'flex' : 'none';
        }
      } else {
        cellularToggle.checked = false;
        if (cellularSlidersSection) cellularSlidersSection.style.display = 'none';
      }
    } catch (e) {
      cellularToggle.checked = false;
      if (cellularSlidersSection) cellularSlidersSection.style.display = 'none';
    }
    cellularToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        if (typeof cellularEnabled !== 'undefined') {
          cellularEnabled = enabled;
          if (cellularSlidersSection) {
            cellularSlidersSection.style.display = enabled ? 'flex' : 'none';
          }
          logArt('system', 'Cellular texture', {
            Status: enabled ? 'Enabled' : 'Disabled'
          });
        }
      } catch (err) {
        console.error('Error setting cellularEnabled:', err);
      }
    });
  }
  const cellularScaleSlider = document.getElementById('cellular-scale');
  const cellularScaleValue = document.getElementById('cellular-scale-value');
  if (cellularScaleSlider && cellularScaleValue) {
    const initialValue = parseFloat(cellularScaleSlider.value);
    if (typeof cellularScale !== 'undefined') cellularScale = initialValue;
    cellularScaleValue.textContent = initialValue.toFixed(1);
    cellularScaleSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof cellularScale !== 'undefined') cellularScale = value;
      cellularScaleValue.textContent = value.toFixed(1);
    });
  }
  const cellularSeedSlider = document.getElementById('cellular-seed');
  const cellularSeedValue = document.getElementById('cellular-seed-value');
  if (cellularSeedSlider && cellularSeedValue) {
    const initialValue = parseFloat(cellularSeedSlider.value);
    if (typeof cellularSeed !== 'undefined') cellularSeed = initialValue;
    cellularSeedValue.textContent = initialValue.toFixed(1);
    cellularSeedSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof cellularSeed !== 'undefined') cellularSeed = value;
      cellularSeedValue.textContent = value.toFixed(1);
    });
  }
  const whiteDotToggle = document.getElementById('white-dot-toggle');
  const whiteDotSlidersSection = document.getElementById('white-dot-sliders-section');
  if (whiteDotToggle) {
    try {
      if (typeof whiteDotEnabled !== 'undefined') {
        whiteDotToggle.checked = !!whiteDotEnabled;
        if (whiteDotSlidersSection) whiteDotSlidersSection.style.display = whiteDotEnabled ? 'flex' : 'none';
      } else {
        whiteDotToggle.checked = false;
        if (whiteDotSlidersSection) whiteDotSlidersSection.style.display = 'none';
      }
    } catch (e) {
      whiteDotToggle.checked = false;
      if (whiteDotSlidersSection) whiteDotSlidersSection.style.display = 'none';
    }
    whiteDotToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        if (typeof whiteDotEnabled !== 'undefined') {
          whiteDotEnabled = enabled;
          if (whiteDotSlidersSection) whiteDotSlidersSection.style.display = enabled ? 'flex' : 'none';
          logArt('system', 'White Dot', {
            Status: enabled ? 'Enabled' : 'Disabled'
          });
        }
      } catch (err) {
        console.error('Error setting whiteDotEnabled:', err);
      }
    });
  }
  const whiteDotSlider = document.getElementById('white-dot-density');
  const whiteDotValue = document.getElementById('white-dot-density-value');
  if (whiteDotSlider && whiteDotValue) {
    if (window._urlParamWdVal !== undefined) {
      const displayVal = window._urlParamWdVal;
      whiteDotDensity = displayVal * 0.1;
      whiteDotSlider.value = displayVal;
      whiteDotValue.textContent = displayVal.toFixed(2);
    } else {
      const displayVal = parseFloat(whiteDotSlider.value);
      if (typeof whiteDotDensity !== 'undefined') whiteDotDensity = displayVal * 0.1;
      whiteDotValue.textContent = displayVal.toFixed(2);
    }
    whiteDotSlider.addEventListener('input', (e) => {
      const displayVal = parseFloat(e.target.value);
      if (typeof whiteDotDensity !== 'undefined') whiteDotDensity = displayVal * 0.1;
      whiteDotValue.textContent = displayVal.toFixed(2);
    });
  }
  const grainToggle = document.getElementById('grain-toggle');
  const grainSlidersSection = document.getElementById('grain-sliders-section');
  if (grainToggle) {
    try {
      if (typeof grainEnabled !== 'undefined') {
        grainToggle.checked = !!grainEnabled;
        if (grainSlidersSection) grainSlidersSection.style.display = grainEnabled ? 'flex' : 'none';
      } else {
        grainToggle.checked = false;
        if (grainSlidersSection) grainSlidersSection.style.display = 'none';
      }
    } catch (e) {
      grainToggle.checked = false;
      if (grainSlidersSection) grainSlidersSection.style.display = 'none';
    }
    grainToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        if (typeof grainEnabled !== 'undefined') {
          grainEnabled = enabled;
          if (grainSlidersSection) grainSlidersSection.style.display = enabled ? 'flex' : 'none';
          logArt('system', 'Grain', {
            Status: enabled ? 'Enabled' : 'Disabled'
          });
        }
      } catch (err) {
        console.error('Error setting grainEnabled:', err);
      }
    });
  }
  const grainSlider = document.getElementById('grain-amount');
  const grainValue = document.getElementById('grain-amount-value');
  if (grainSlider && grainValue) {
    if (window._urlParamGrVal !== undefined) {
      const displayVal = window._urlParamGrVal;
      grainAmount = displayVal * 0.1;
      grainSlider.value = displayVal;
      grainValue.textContent = displayVal.toFixed(2);
    } else {
      const displayVal = parseFloat(grainSlider.value);
      if (typeof grainAmount !== 'undefined') grainAmount = displayVal * 0.1;
      grainValue.textContent = displayVal.toFixed(2);
    }
    grainSlider.addEventListener('input', (e) => {
      const displayVal = parseFloat(e.target.value);
      if (typeof grainAmount !== 'undefined') grainAmount = displayVal * 0.1;
      grainValue.textContent = displayVal.toFixed(2);
    });
  }
  const futurePathPreviewToggle = document.getElementById('future-path-preview-toggle');
  if (futurePathPreviewToggle) {
    try {
      if (typeof showFuturePathPreview !== 'undefined') {
        futurePathPreviewToggle.checked = !!showFuturePathPreview;
      } else {
        futurePathPreviewToggle.checked = true;
      }
    } catch (e) {
      futurePathPreviewToggle.checked = true;
    }
    futurePathPreviewToggle.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      try {
        showFuturePathPreview = enabled;
        logArt('system', '🔮 Future Path Preview', {
          Status: enabled ? 'Show ✅' : 'Hide ❌'
        });
      } catch (err) {
        console.error('Error setting showFuturePathPreview:', err);
      }
    });
  }
  if (recordBtn) {
    addTouchAndClickEvent(recordBtn, () => {
      if (!isRecording && !isPlaying) {
        startRecording();
        updateButtonStates();
      }
    });
  }
  if (stopBtn) {
    addTouchAndClickEvent(stopBtn, () => {
      if (isRecording) {
        stopRecording();
      } else if (isPlaying) {
        stopPlayback();
      }
      updateButtonStates();
    });
  }
  if (playBtn) {
    addTouchAndClickEvent(playBtn, () => {
      if (!isRecording && !isPlaying && recordingData.events.length > 0) {
        startPlayback();
        updateButtonStates();
      }
    });
  }
  if (loadBtn) {
    addTouchAndClickEvent(loadBtn, () => {
      if (!isRecording && !isPlaying) {
        loadRecording();
      }
    });
  }
  const loadImageBtn = document.getElementById('load-image');
  const imageFileInput = document.getElementById('image-file-input');
  if (isCollectorMode) {
    if (loadImageBtn) loadImageBtn.style.display = 'none';
  } else if (loadImageBtn && imageFileInput) {
    addTouchAndClickEvent(loadImageBtn, () => {
      imageFileInput.click();
    });
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        loadReferenceImage(file);
      }
    });
  }
  const showReferenceImageBtn = document.getElementById('show-reference-image');
  if (showReferenceImageBtn && !isCollectorMode) {
    addTouchAndClickEvent(showReferenceImageBtn, () => {
      showReferenceImage();
    });
  }
  const hideReferenceImageBtn = document.getElementById('hide-reference-image');
  if (hideReferenceImageBtn && !isCollectorMode) {
    addTouchAndClickEvent(hideReferenceImageBtn, () => {
      hideReferenceImage();
    });
  }
  if (header) {
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        target: e.target,
        preventDefault: () => e.preventDefault()
      };
      startDrag(mouseEvent);
    });
  }
  setupPanelBringToFront();
  // Ensure flow panel has drag handle (innerHTML parser may swallow it)
  const flowPanel = getDOMElement('flowEffectPanel');
  if (flowPanel && !flowPanel.querySelector('.panel-drag-handle')) {
    const dh = document.createElement('div');
    dh.className = 'panel-drag-handle';
    dh.setAttribute('data-panel', 'flow');
    dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
    flowPanel.appendChild(dh);
  }
  // Drag handle triangles — map to corresponding panel drag functions
  document.querySelectorAll('.panel-drag-handle').forEach(handle => {
    const panelName = handle.getAttribute('data-panel');
    const dragFnMap = {
      overlay: startDrag,
      control: startControlPanelDrag,
      effect: startEffectControlPanelDrag,
      flow: startFlowEffectPanelDrag
    };
    const fn = dragFnMap[panelName];
    if (!fn) return;
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      fn(e);
    });
    handle.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      fn({ clientX: touch.clientX, clientY: touch.clientY, target: handle, closest: () => null, preventDefault: () => e.preventDefault() });
    }, { passive: false });
  });
  bringPanelToFront(document.getElementById('message-overlay'));
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY
    };
    drag(mouseEvent);
  });
  document.addEventListener('touchend', endDrag);
  document.addEventListener('mousemove', dragControlPanel);
  document.addEventListener('mouseup', endControlPanelDrag);
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      dragControlPanel(mouseEvent);
    }
  });
  document.addEventListener('touchend', endControlPanelDrag);
  document.addEventListener('mousemove', dragEffectControlPanel);
  document.addEventListener('mouseup', endEffectControlPanelDrag);
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      dragEffectControlPanel(mouseEvent);
    }
  });
  document.addEventListener('touchend', endEffectControlPanelDrag);
  document.addEventListener('mousemove', dragFlowEffectPanel);
  document.addEventListener('mouseup', endFlowEffectPanelDrag);
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      dragFlowEffectPanel(mouseEvent);
    }
  });
  document.addEventListener('touchend', endFlowEffectPanelDrag);
  if (hint && !isOverlayVisible) {
    hint.classList.remove('hidden');
  }
  updateButtonStates();
  initializeMetallicControls();
  initializeBugsControls();
  initializeFlowEffectPanel();
  initializeStrokeSelector();
  updateEffectControlPanelPosition();
  updateFlowEffectPanelPosition();
  const effectControlPanel = getDOMElement('effectControlPanel');
  const effectHint = getDOMElement('effectHint');
  const toggleEffectControlPanelBtn = document.getElementById('toggle-effect-control-panel');
  if (effectControlPanel && effectHint) {
    if (effectControlPanelVisible) {
      effectControlPanel.style.display = 'block';
      effectHint.classList.add('hidden');
    } else {
      effectControlPanel.style.display = 'none';
      effectHint.classList.remove('hidden');
    }
    if (toggleEffectControlPanelBtn) {
      toggleEffectControlPanelBtn.textContent = effectControlPanelVisible ? 'Hide' : 'Show';
    }
  }
  const flowEffectPanel = getDOMElement('flowEffectPanel');
  const flowHint = getDOMElement('flowHint');
  const toggleFlowEffectPanelBtn = document.getElementById('toggle-flow-effect-panel');
  if (flowEffectPanel && flowHint) {
    if (flowEffectPanelVisible) {
      flowEffectPanel.style.display = 'block';
      flowHint.classList.add('hidden');
    } else {
      flowEffectPanel.style.display = 'none';
      flowHint.classList.remove('hidden');
    }
    if (toggleFlowEffectPanelBtn) {
      toggleFlowEffectPanelBtn.textContent = flowEffectPanelVisible ? 'Hide' : 'Show';
    }
  }
  if (Object.keys(urlPanelState).length > 0) {
    setTimeout(() => {
      applyPanelState(urlPanelState);
      logArt('system', '🔗 URL Configuration Loaded', {
        Parameters: Object.keys(urlPanelState).length
      });
    }, 200);
  }
  setTimeout(() => {
    initializeHintPositions();
    initializeHintDragging();
  }, 100);
  createZenModeButton();
}

// --- Zen Mode: hide/restore all panels ---
let zenModeActive = false;
let zenModeSavedState = null;

function createZenModeButton() {
  if (document.getElementById('zen-mode-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'zen-mode-btn';
  btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
  btn.title = 'Zen Mode — hide all panels';
  document.body.appendChild(btn);
  addTouchAndClickEvent(btn, toggleZenMode);
}

function toggleZenMode() {
  const overlay = document.getElementById('message-overlay');
  const controlPanel = document.getElementById('control-panel');
  const effectPanel = document.getElementById('effect-control-panel');
  const flowPanel = document.getElementById('flow-effect-panel');
  const hints = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint');
  const btn = document.getElementById('zen-mode-btn');

  if (!zenModeActive) {
    // Save current visibility state
    zenModeSavedState = {
      overlay: isOverlayVisible,
      control: controlPanelVisible,
      effect: effectControlPanelVisible,
      flow: flowEffectPanelVisible
    };
    // Hide all panels and hints
    if (overlay) overlay.style.display = 'none';
    if (controlPanel) controlPanel.style.display = 'none';
    if (effectPanel) effectPanel.style.display = 'none';
    if (flowPanel) flowPanel.style.display = 'none';
    hints.forEach(h => h.style.display = 'none');
    // Mark flags so draw loop / touch handlers don't interact with hidden panels
    isOverlayVisible = false;
    controlPanelVisible = false;
    effectControlPanelVisible = false;
    flowEffectPanelVisible = false;
    zenModeActive = true;
    if (btn) btn.classList.add('zen-active');
    btn.title = 'Exit Zen Mode — restore panels';
  } else {
    // Restore saved state
    const s = zenModeSavedState || { overlay: true, control: true, effect: true, flow: true };
    isOverlayVisible = s.overlay;
    controlPanelVisible = s.control;
    effectControlPanelVisible = s.effect;
    flowEffectPanelVisible = s.flow;
    if (overlay) overlay.style.display = s.overlay ? '' : 'none';
    if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
    if (effectPanel) effectPanel.style.display = s.effect ? 'block' : 'none';
    if (flowPanel) flowPanel.style.display = s.flow ? 'block' : 'none';
    // Restore hints for hidden panels
    hints.forEach(h => h.style.display = '');
    if (s.overlay) {
      if (overlay) overlay.classList.remove('hidden');
      const hint = document.getElementById('toggle-hint');
      if (hint) hint.classList.add('hidden');
    }
    if (s.control) {
      const brushHint = document.getElementById('brush-hint');
      if (brushHint) brushHint.classList.add('hidden');
    }
    if (s.effect) {
      const effectHint = document.getElementById('effect-hint');
      if (effectHint) effectHint.classList.add('hidden');
    }
    if (s.flow) {
      const flowHint = document.getElementById('flow-hint');
      if (flowHint) flowHint.classList.add('hidden');
    }
    zenModeActive = false;
    zenModeSavedState = null;
    if (btn) btn.classList.remove('zen-active');
    btn.title = 'Zen Mode — hide all panels';
    // Snap back any panels whose header is off-screen
    snapBackIfOffscreen();
  }
}

function snapBackIfOffscreen() {
  const pairs = [
    { panel: getDOMElement('messageOverlay'), pos: overlayPosition, update: updateOverlayPosition, defaultPos: { x: 50, y: 50 } },
    { panel: getDOMElement('controlPanel'), pos: controlPanelPosition, update: updateControlPanelPosition, defaultPos: { x: 85, y: 50 } },
    { panel: getDOMElement('effectControlPanel'), pos: effectControlPanelPosition, update: updateEffectControlPanelPosition, defaultPos: { x: 15, y: 50 } },
    { panel: getDOMElement('flowEffectPanel'), pos: flowEffectPanelPosition, update: updateFlowEffectPanelPosition, defaultPos: { x: 50, y: 85 } }
  ];
  pairs.forEach(({ panel, pos, update, defaultPos }) => {
    if (!panel || panel.style.display === 'none') return;
    const header = panel.querySelector('.control-btn');
    if (!header) return;
    const rect = header.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) {
      pos.x = defaultPos.x;
      pos.y = defaultPos.y;
      update();
    }
  });
  savePanelPositions();
}

function activateZenMode() {
  if (zenModeActive) return;
  toggleZenMode();
}
window.activateZenMode = activateZenMode;

function scheduleMobilePhoneZenMode() {
  if (!window._inkMobilePhone) return;
  const go = () => {
    if (!document.getElementById('control-panel')) return false;
    activateZenMode();
    return true;
  };
  if (go()) return;
  let done = false;
  const obs = new MutationObserver(() => {
    if (done) return;
    if (go()) {
      done = true;
      obs.disconnect();
    }
  });
  obs.observe(document.body, {
    childList: true,
    subtree: true
  });
  setTimeout(() => {
    if (!done) obs.disconnect();
  }, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;

function initializeMetallicControls() {
  const strengthSlider = document.getElementById('metallic-strength');
  const strengthValue = document.getElementById('metallic-strength-value');
  if (strengthSlider && strengthValue) {
    const initialValue = parseFloat(strengthSlider.value);
    if (typeof window.metallicStrength !== 'undefined') {
      window.metallicStrength = initialValue / 100;
    }
    strengthValue.textContent = initialValue;
    strengthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof window.metallicStrength !== 'undefined') {
        window.metallicStrength = value / 100;
      }
      strengthValue.textContent = value;
      if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
        recordEvent('ec', {
          action: 'metallic-strength',
          value: value
        });
      }
    });
  }
  const flowSlider = document.getElementById('metallic-flow');
  const flowValue = document.getElementById('metallic-flow-value');
  const flowAutoRandomBtn = document.getElementById('flow-auto-random');
  let flowAutoRandomInterval = null;
  if (flowSlider && flowValue) {
    const initialValue = parseFloat(flowSlider.value);
    if (typeof window.metallicFlowSpeed !== 'undefined') {
      window.metallicFlowSpeed = initialValue / 100;
    }
    flowValue.textContent = initialValue;
    flowSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      if (typeof window.metallicFlowSpeed !== 'undefined') {
        window.metallicFlowSpeed = value / 100;
      }
      flowValue.textContent = value;
      if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
        recordEvent('ec', {
          action: 'metallic-flow',
          value: value
        });
      }
    });
  }
  if (flowAutoRandomBtn && flowSlider && flowValue) {
    flowAutoRandomBtn.addEventListener('click', () => {
      const isActive = flowAutoRandomBtn.getAttribute('data-active') === 'true';
      if (isActive) {
        flowAutoRandomBtn.setAttribute('data-active', 'false');
        flowAutoRandomBtn.classList.remove('active');
        if (flowAutoRandomInterval) {
          clearInterval(flowAutoRandomInterval);
          flowAutoRandomInterval = null;
        }
        console.log('🎲 Flow 自动随机：关闭');
      } else {
        flowAutoRandomBtn.setAttribute('data-active', 'true');
        flowAutoRandomBtn.classList.add('active');
        flowAutoRandomInterval = setInterval(() => {
          const randomValue = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
          flowSlider.value = randomValue;
          flowValue.textContent = randomValue;
          if (typeof window.metallicFlowSpeed !== 'undefined') {
            window.metallicFlowSpeed = randomValue / 50;
          }
        }, 100);
        console.log('🎲 Flow 自动随机：开启（每 100ms）');
      }
    });
  }
  const tintButtons = {
    'metal-gold': [0.88, 0.72, 0.52],
    'metal-silver': [0.75, 0.75, 0.75],
    'metal-copper': [0.72, 0.50, 0.35],
    'metal-rose': [0.88, 0.65, 0.70],
    'metal-black': [0.15, 0.12, 0.08],
    'metal-diamond': [0.95, 0.95, 1.0]
  };
  Object.keys(tintButtons).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof window.metallicTint !== 'undefined') {
          window.metallicTint = [...tintButtons[id]];
          Object.keys(tintButtons).forEach(btnId => {
            const targetBtn = document.getElementById(btnId);
            if (targetBtn) {
              targetBtn.classList.remove('active');
            }
          });
          btn.classList.add('active');
          const tintName = btn.textContent.trim();
          logArt('system', '🎨 Metal tint changed', {
            Tint: tintName,
            RGB: `[${tintButtons[id].join(', ')}]`
          });
          if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
            const tintType = id.replace('metal-', '');
            recordEvent('ec', {
              action: 'metal-tint',
              tintType: tintType
            });
          }
        }
      });
    }
  });
}

function updateButtonStyles() {
  updateBrushModeButtons();
  updateBrushSizeButtons();
  updateInkEffectButtons();
  updateBrushColorButtons();
  updatePathRotationButtons();
  updateBlendModeButtons();
}

function getShapeType() {
  const activeBtn = document.querySelector('.shape-type-btn.active');
  if (activeBtn) {
    return parseInt(activeBtn.dataset.type);
  }
  return 0;
}

function setShapeType(type) {
  const buttons = document.querySelectorAll('.shape-type-btn');
  buttons.forEach(btn => {
    const btnType = parseInt(btn.dataset.type);
    if (btnType === type) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function initializeBugsControls() {
  const bugsSizeSlider = document.getElementById('bugs-size');
  const bugsSizeValue = document.getElementById('bugs-size-value');
  if (bugsSizeSlider && bugsSizeValue) {
    const initialValue = parseFloat(bugsSizeSlider.value);
    if (typeof window.bugsSize !== 'undefined') {
      window.bugsSize = initialValue;
    }
    bugsSizeValue.textContent = initialValue;
    bugsSizeSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      window.bugsSize = value;
      bugsSizeValue.textContent = value;
      if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
        recordEvent('ec', {
          action: 'bugs-size',
          value: value
        });
      }
    });
  }
  const shapeTypeButtons = document.querySelectorAll('.shape-type-btn');
  shapeTypeButtons.forEach(btn => {
    addTouchAndClickEvent(btn, () => {
      const type = parseInt(btn.dataset.type);
      setShapeType(type);
    });
  });
}

function initializeStrokeSelector() {
  const strokeSlider = document.getElementById('stroke-select-slider');
  const strokeIndexDisplay = document.getElementById('stroke-index-display');
  const strokeTotalDisplay = document.getElementById('stroke-total-display');
  const strokeValueDisplay = document.getElementById('stroke-select-value');
  if (!strokeSlider || !strokeIndexDisplay || !strokeTotalDisplay || !strokeValueDisplay) {
    return;
  }

  function updateStrokeSlider(autoSwitchToLast = false) {
    const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
      allBrushStrokes.length :
      0;
    const maxValue = Math.max(0, strokeCount - 1);
    strokeSlider.max = maxValue;
    strokeTotalDisplay.textContent = strokeCount;
    if (autoSwitchToLast || parseInt(strokeSlider.value) > maxValue) {
      strokeSlider.value = maxValue;
    }
    const currentIndex = parseInt(strokeSlider.value) || 0;
    strokeIndexDisplay.textContent = currentIndex;
    strokeValueDisplay.textContent = currentIndex;
  }
  updateStrokeSlider();
  strokeSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value) || 0;
    strokeIndexDisplay.textContent = value;
    strokeValueDisplay.textContent = value;
    let gridParams = null;
    let points = null;
    if (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0) {
      const validIndex = Math.max(0, Math.min(value, allBrushStrokes.length - 1));
      const selectedStroke = allBrushStrokes[validIndex];
      if (selectedStroke && selectedStroke.gridParams) {
        gridParams = selectedStroke.gridParams;
        points = selectedStroke.points ? [...selectedStroke.points] : null;
      }
    }
    if (gridParams && typeof window !== 'undefined') {
      const startTime = (typeof millis === 'function') ? millis() : Date.now();
      window.currentStrokeHighlight = {
        gridParams: {
          ...gridParams
        },
        points: points,
        startTime: startTime
      };
    }
  });
  let lastStrokeCount = 0;
  setInterval(() => {
    const currentCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
      allBrushStrokes.length :
      0;
    if (currentCount !== lastStrokeCount) {
      const isNewStroke = currentCount > lastStrokeCount;
      updateStrokeSlider(isNewStroke);
      lastStrokeCount = currentCount;
    }
  }, 500);
  window.updateStrokeSelector = updateStrokeSlider;
}

function applyCustomBrushColor() {
  const customBrushColorInput = document.getElementById('custom-brush-color');
  const customBrushColorTextInput = document.getElementById('custom-brush-color-text');
  if (!customBrushColorInput || !customBrushColorTextInput) {
    console.error('Custom brush color inputs not found');
    return;
  }
  let colorValue = customBrushColorTextInput.value.trim();
  if (!colorValue || !/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
    colorValue = customBrushColorInput.value;
  }
  const r = parseInt(colorValue.slice(1, 3), 16);
  const g = parseInt(colorValue.slice(3, 5), 16);
  const b = parseInt(colorValue.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    logArt('ui', '❌ Invalid custom brush color', {
      Color: colorValue,
      Status: 'Please use format #RRGGBB'
    });
    return;
  }
  if (typeof customBrushColor !== 'undefined') {
    customBrushColor[0] = r;
    customBrushColor[1] = g;
    customBrushColor[2] = b;
  } else {
    console.error('customBrushColor is undefined');
    return;
  }
  brushColorMode = 33;
  whiteBrushMode = false;
  updateBrushColorButtons();
  updateCurrentSettingsDisplay();
  customBrushColorInput.value = colorValue.toUpperCase();
  customBrushColorTextInput.value = colorValue.toUpperCase();
  logArt('ui', '🎨 Custom brush color applied', {
    Color: colorValue,
    RGB: `(${r}, ${g}, ${b})`,
    ColorCode: 33
  });
}

function applyBackgroundColor() {
  const backgroundColorInput = document.getElementById('canvas-background-color');
  const backgroundColorTextInput = document.getElementById('canvas-background-color-text');
  const canvasWidthInput = document.getElementById('canvas-width');
  const canvasHeightInput = document.getElementById('canvas-height');
  let needReload = false;
  if (backgroundColorInput && backgroundColorTextInput) {
    let colorValue = backgroundColorTextInput.value.trim();
    if (!colorValue || !/^#[0-9A-Fa-f]{6}$/.test(colorValue)) {
      colorValue = backgroundColorInput.value;
    }
    const r = parseInt(colorValue.slice(1, 3), 16);
    const g = parseInt(colorValue.slice(3, 5), 16);
    const b = parseInt(colorValue.slice(5, 7), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      logArt('ui', '❌ Invalid background color', {
        Color: colorValue,
        Status: 'Please use format #RRGGBB'
      });
      return;
    }
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      logArt('ui', '❌ Color values out of range', {
        RGB: `(${r}, ${g}, ${b})`,
        Status: 'Values must be 0-255'
      });
      return;
    }
    if (typeof canvasBackgroundColor !== 'undefined') {
      canvasBackgroundColor[0] = r;
      canvasBackgroundColor[1] = g;
      canvasBackgroundColor[2] = b;
    } else {
      console.error('❌ canvasBackgroundColor is undefined!');
      logArt('ui', '❌ canvasBackgroundColor not found', {
        Status: 'Error: Variable not defined'
      });
      return;
    }
    if (typeof paperFlatBuffer !== 'undefined' && paperFlatBuffer) {
      paperFlatBuffer.begin();
      background(r, g, b);
      paperFlatBuffer.end();
    }
    if (typeof regeneratePaperTextureBuffer === 'function') {
      regeneratePaperTextureBuffer();
    }
    if (typeof needsComposite !== 'undefined') {
      needsComposite = true;
    }
    backgroundColorInput.value = colorValue.toUpperCase();
    backgroundColorTextInput.value = colorValue.toUpperCase();
    logArt('ui', '🎨 Background color changed', {
      Color: colorValue,
      RGB: `(${r}, ${g}, ${b})`
    });
  }
  if (canvasWidthInput && canvasHeightInput) {
    const newWidth = parseInt(canvasWidthInput.value);
    const newHeight = parseInt(canvasHeightInput.value);
    if (isNaN(newWidth) || isNaN(newHeight)) {
      logArt('ui', '❌ Invalid canvas size', {
        Width: canvasWidthInput.value,
        Height: canvasHeightInput.value,
        Status: 'Please enter valid numbers'
      });
      return;
    }
    if (newWidth < 100 || newWidth > 4000 || newHeight < 100 || newHeight > 4000) {
      logArt('ui', '❌ Canvas size out of range', {
        Width: newWidth,
        Height: newHeight,
        Status: 'Size must be between 100 and 4000 pixels'
      });
      return;
    }
    if (typeof canvasWidth !== 'undefined' && typeof canvasHeight !== 'undefined') {
      if (canvasWidth !== newWidth || canvasHeight !== newHeight) {
        canvasWidth = newWidth;
        canvasHeight = newHeight;
        needReload = true;
        logArt('ui', '📐 Canvas size changed', {
          Width: `${newWidth}px`,
          Height: `${newHeight}px`,
          Status: 'Page will reload to apply changes'
        });
      }
    }
  }
  if (needReload) {
    sessionStorage.setItem('pendingCanvasWidth', canvasWidth.toString());
    sessionStorage.setItem('pendingCanvasHeight', canvasHeight.toString());
    sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
}
let flowEffectCurrentBtn = null;
let flowEffectUpdateInterval = null;

function initializeFlowEffectPanel() {
  const flowButtons = document.querySelectorAll('.flow-effect-btn');
  const flowStrengthSlider = document.getElementById('flow-strength');
  const flowStrengthValue = document.getElementById('flow-strength-value');
  if (flowStrengthSlider && flowStrengthValue) {
    flowStrengthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      flowStrengthValue.textContent = value;
      if (typeof flowEffectParams !== 'undefined') {
        flowEffectParams.blendVol = value;
      }
    });
  }
  const flowLastStrokeOnlyCheckbox = document.getElementById('flow-last-stroke-only');
  if (flowLastStrokeOnlyCheckbox) {
    flowLastStrokeOnlyCheckbox.addEventListener('change', (e) => {
      if (typeof flowEffectLastStrokeOnly !== 'undefined') {
        flowEffectLastStrokeOnly = e.target.checked;
        logArt('ui', '🌊 Flow Effect Last Stroke Only:', {
          enabled: flowEffectLastStrokeOnly
        });
      }
    });
  }
  flowButtons.forEach(btn => {
    const blendType = parseInt(btn.dataset.type);
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleFlowEffectStart(btn, blendType);
    });
    btn.addEventListener('mouseup', (e) => {
      e.preventDefault();
      handleFlowEffectEnd(btn, blendType);
    });
    btn.addEventListener('mouseleave', (e) => {
      if (flowEffectCurrentBtn === btn) {
        handleFlowEffectEnd(btn, blendType);
      }
    });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleFlowEffectStart(btn, blendType);
    }, {
      passive: false
    });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleFlowEffectEnd(btn, blendType);
    }, {
      passive: false
    });
    btn.addEventListener('touchcancel', (e) => {
      handleFlowEffectEnd(btn, blendType);
    });
  });
  document.addEventListener('mouseup', () => {
    if (flowEffectCurrentBtn) {
      const blendType = parseInt(flowEffectCurrentBtn.dataset.type);
      handleFlowEffectEnd(flowEffectCurrentBtn, blendType);
    }
  });
}

function handleFlowEffectStart(btn, blendType) {
  if (flowEffectCurrentBtn) return;
  const bounds = typeof getLastStrokeBounds === 'function' ? getLastStrokeBounds() : null;
  if (!bounds) {
    logArt('warning', '🌊 No stroke to apply Flow effect', {
      Status: 'Draw a stroke first'
    });
    return;
  }
  flowEffectCurrentBtn = btn;
  btn.classList.add('active', 'running');
  if (typeof flowEffectStrokeBounds !== 'undefined') {
    flowEffectStrokeBounds = bounds;
  }
  if (typeof window !== 'undefined') {
    window.flowEffectStrokeBounds = bounds;
  }
  const flowSeed = Math.floor(Math.random() * 1000000);
  if (typeof startFlowEffect === 'function') {
    startFlowEffect(blendType, flowSeed);
  }
  if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording) {
    if (typeof lastStrokeEndTime !== 'undefined' && lastStrokeEndTime > 0 && typeof accumulatedPauseTime !== 'undefined') {
      const pauseTime = millis() - lastStrokeEndTime;
      if (pauseTime > 0) {
        accumulatedPauseTime += pauseTime;
        lastStrokeEndTime = millis();
        console.log('🎬 Flow recording: accumulated pause time updated', {
          pauseTime,
          total: accumulatedPauseTime
        });
      }
    }
    const flowData = {
      action: 'start',
      blendType: blendType,
      flowSeed: flowSeed,
      strokeBounds: bounds,
      strength: (typeof flowEffectParams !== 'undefined') ? flowEffectParams.blendVol : 100,
      lastStrokeOnly: (typeof flowEffectLastStrokeOnly !== 'undefined') ? flowEffectLastStrokeOnly : false
    };
    console.log('🎬 Recording flow start event:', flowData);
    recordEvent('flow', flowData);
  }
  flowEffectUpdateInterval = setInterval(() => {
    const countDisplay = document.getElementById('flow-iteration-count');
    if (countDisplay && typeof flowEffectIterationCount !== 'undefined') {
      countDisplay.textContent = flowEffectIterationCount;
    }
  }, 50);
  logArt('ui', '🌊 Flow Effect Button Pressed', {
    BlendType: blendType,
    Seed: flowSeed
  });
}

function handleFlowEffectEnd(btn, blendType) {
  if (flowEffectCurrentBtn !== btn) return;
  btn.classList.remove('active', 'running');
  flowEffectCurrentBtn = null;
  if (flowEffectUpdateInterval) {
    clearInterval(flowEffectUpdateInterval);
    flowEffectUpdateInterval = null;
  }
  let stats = null;
  if (typeof stopFlowEffect === 'function') {
    stats = stopFlowEffect();
  }
  if (typeof recordEvent === 'function' && typeof isRecording !== 'undefined' && isRecording && stats) {
    const endData = {
      action: 'end',
      blendType: blendType,
      flowSeed: (typeof flowEffectSeed !== 'undefined') ? flowEffectSeed : 0,
      duration: stats.duration,
      iterations: stats.iterations,
      totalFrames: stats.frames
    };
    console.log('🎬 Recording flow end event:', endData);
    recordEvent('flow', endData);
    if (typeof lastStrokeEndTime !== 'undefined') {
      lastStrokeEndTime = millis();
    }
  }
  logArt('ui', '🌊 Flow Effect Button Released', {
    BlendType: blendType,
    Duration: stats ? Math.round(stats.duration) + 'ms' : 'unknown',
    Iterations: stats ? stats.iterations : 'unknown',
    Frames: stats ? stats.frames : 'unknown'
  });
}

// === js/init.js ===
let performanceMonitor = {
  enabled: true,
  logFpsToConsole: false,
  frameRateThreshold: 30,
  checkInterval: 60,
  frameCount: 0,
  lastCheckFrame: 0,
  lastFrameTime: 0,
  _frBuf: new Float64Array(60),
  _frIdx: 0,
  _frLen: 0,
  _frSum: 0,
  _pushFR: function(rate) {
    if (this._frLen === 60) {
      this._frSum -= this._frBuf[this._frIdx];
    } else {
      this._frLen++;
    }
    this._frBuf[this._frIdx] = rate;
    this._frSum += rate;
    this._frIdx = (this._frIdx + 1) % 60;
  },
  _avgFR: function() {
    return this._frLen > 0 ? this._frSum / this._frLen : 0;
  },
  performanceData: {
    drawTotal: 0,
    updatePlayback: 0,
    updateCompositeBuffer: 0,
    updateEasyCamAutoTracking: 0,
    drawCursorToBuffer: 0,
    updateBlurEffect: 0,
    applyCameraProjection: 0,
    drawLayersWithBlur: 0,
    other: 0
  },
  performanceDataAccumulated: {
    drawTotal: 0,
    updatePlayback: 0,
    updateCompositeBuffer: 0,
    updateEasyCamAutoTracking: 0,
    drawCursorToBuffer: 0,
    updateBlurEffect: 0,
    applyCameraProjection: 0,
    drawLayersWithBlur: 0,
    other: 0,
    sampleCount: 0
  },
  lastPerformanceLog: 0,
  logCooldown: 5000,
  test: function() {
    console.log('🎯 性能监控测试');
    try {
      console.log('当前 frameRate():', frameRate());
    } catch (e) {
      console.log('frameRate() 不可用:', e);
    }
    console.log('监控状态:', this.enabled ? '启用' : '禁用');
    console.log('帧计数:', this.frameCount);
    console.log('阈值:', this.frameRateThreshold);
    console.log('历史记录数量:', this._frLen);
    if (this._frLen > 0) {
      const avg = this._avgFR();
      console.log('平均 frameRate:', avg.toFixed(2));
      console.log('是否触发警告:', avg < this.frameRateThreshold ? '是' : '否');
    } else {
      console.log('⚠️ 历史记录为空，可能需要等待几秒');
    }
    console.log('性能数据:', this.performanceData);
    console.log('累积数据:', this.performanceDataAccumulated);
    const oldCooldown = this.logCooldown;
    this.logCooldown = 0;
    const currentAvg = this._frLen > 0 ?
      this._avgFR() :
      (() => {
        try {
          return frameRate();
        } catch (e) {
          return 60;
        }
      })();
    console.log('强制触发检查，使用平均帧率:', currentAvg.toFixed(2));
    analyzePerformanceBottleneck(currentAvg);
    this.logCooldown = oldCooldown;
  },
  forceLowFrameRate: function() {
    console.log('⚠️ 强制设置低帧率测试（仅用于调试）');
    this._frIdx = 0;
    this._frLen = 0;
    this._frSum = 0;
    for (let i = 0; i < 60; i++) {
      this._pushFR(20);
    }
    console.log('已设置历史记录为 20 fps');
    const avg = this._avgFR();
    console.log('平均帧率:', avg);
    const oldCooldown = this.logCooldown;
    this.logCooldown = 0;
    this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
    analyzePerformanceBottleneck(avg);
    this.logCooldown = oldCooldown;
  },
  triggerNow: function() {
    console.log('🎯 立即触发性能警告测试');
    const oldCooldown = this.logCooldown;
    this.logCooldown = 0;
    const testFrameRate = this.frameRateThreshold - 10;
    console.log('使用测试帧率:', testFrameRate);
    analyzePerformanceBottleneck(testFrameRate);
    this.logCooldown = oldCooldown;
  }
};
window.testPerformanceMonitor = function() {
  if (typeof performanceMonitor === 'undefined') {
    console.error('❌ performanceMonitor 未定义！请刷新页面。');
    return;
  }
  console.log('✅ performanceMonitor 已定义');
  console.log('可用方法:', Object.keys(performanceMonitor).filter(k => typeof performanceMonitor[k] === 'function'));
  analyzePerformanceBottleneck(50);
};

function loadAllShaders() {
  encodeProgram = __bundledLoadShader('./shaders/base.vert', './shaders/encode.frag');
  compositeProgram = __bundledLoadShader('./shaders/base.vert', './shaders/composite.frag');
  typeMapEncodeProgram = __bundledLoadShader('./shaders/base.vert', './shaders/typeMapEncode.frag');
}

function clearCanvas() {
  const bgColor = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
  background(bgColor[0], bgColor[1], bgColor[2]);
  if (typeof oldBuffer !== 'undefined' && oldBuffer) {
    oldBuffer.begin();
    clear();
    background(255);
    oldBuffer.end();
  }
  if (typeof newBufferBlack !== 'undefined' && newBufferBlack) {
    newBufferBlack.begin();
    clear();
    background(255);
    newBufferBlack.end();
  }
  if (typeof oldBufferWhite !== 'undefined' && oldBufferWhite) {
    oldBufferWhite.clear();
  }
  if (typeof finalBuffer !== 'undefined' && finalBuffer) {
    finalBuffer.begin();
    clear();
    background(255);
    finalBuffer.end();
  }
  if (typeof combinedBuffer !== 'undefined' && combinedBuffer) {
    combinedBuffer.clear();
    combinedBuffer.background(255);
  }
  if (typeof cursorBuffer !== 'undefined' && cursorBuffer) {
    cursorBuffer.begin();
    clear();
    cursorBuffer.end();
  }
  if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
    typeMapBuffer.begin();
    clear();
    background(0);
    typeMapBuffer.end();
  }
  isDrawing = false;
  isCountingDown = false;
  updateCount = 0;
  force = 1.0;
  isNewStroke = false;
  strokeComplete = false;
  isFirstDraw = 0;
  x = hw;
  y = hh;
  brushAccelX = 0;
  brushAccelY = 0;
  brushSpeed = 0;
  initialSize = 0;
  currentSize = 0;
  drawingFrameCount = 0;
  pathPoints = [];
  hasPath = false;
  if (typeof allBrushStrokes !== 'undefined') {
    allBrushStrokes = [];
  }
  if (typeof currentStrokeHighlight !== 'undefined') {
    currentStrokeHighlight = null;
  }
  if (typeof pendingBugBounds !== 'undefined') {
    pendingBugBounds = null;
  }
  if (typeof pathPointsCache !== 'undefined') {
    pathPointsCache = null;
  }
  if (typeof totalStrokeCount !== 'undefined') {
    totalStrokeCount = 0;
  }
  if (typeof window.__lastGridParams !== 'undefined') {
    window.__lastGridParams = null;
  }
  if (typeof __prevGridParams !== 'undefined') {
    __prevGridParams = null;
  }
  if (typeof window.updateStrokeSelector === 'function') {
    window.updateStrokeSelector();
  }
  if (typeof window.bugsMaskTexture !== 'undefined' && window.bugsMaskTexture) {
    window.bugsMaskTexture.clear();
  }
  if (typeof window.bugsDataTexture !== 'undefined' && window.bugsDataTexture) {
    window.bugsDataTexture.clear();
  }
  generateRandomForceMap();
  initializeShaders();
  needsComposite = true;
}

function initializePlaybackEnvironment() {
  logArt('system', '🎬 Initializing playback environment', {
    Status: 'Setting up shaders and buffers'
  });
  initializeBuffers();
  initializeShaders();
  drawMap();
  resetAllStates();
  logArt('system', '✅ Playback environment ready', {
    Status: 'All systems initialized'
  });
}

function initializeBuffers() {
  oldBuffer.begin();
  clear();
  background(255);
  oldBuffer.end();
  newBufferBlack.begin();
  clear();
  background(255);
  newBufferBlack.end();
  oldBufferWhite.clear();
  finalBuffer.begin();
  clear();
  background(255);
  finalBuffer.end();
  combinedBuffer.clear();
  combinedBuffer.background(255);
  pingPongBuffer.begin();
  clear();
  background(255);
  pingPongBuffer.end();
  if (typeof realtimeIntermediateBuffer !== 'undefined' && realtimeIntermediateBuffer) {
    realtimeIntermediateBuffer.begin();
    clear();
    realtimeIntermediateBuffer.end();
  }
  cursorBuffer.begin();
  clear();
  cursorBuffer.end();
  if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
    typeMapBuffer.begin();
    clear();
    background(0);
    typeMapBuffer.end();
  }
  oldBufferWhite.blendMode(BLEND);
  combinedBuffer.blendMode(BLEND);
  needsComposite = true;
}

function initializeShaders() {
  if (!pingPongBuffer || !feedbackProgram) return;
  if (feedbackProgram) {
    pingPongBuffer.begin();
    if (disableFeedbackShaderForPerfTest) {
      image(newBufferBlack, 0, 0, width, height);
      resetShader();
      pingPongBuffer.end();
      return;
    }
    shader(feedbackProgram);
    feedbackProgram.setUniform("rect", [0, 0, width * pixel, height * pixel]);
    feedbackProgram.setUniform("tex0", newBufferBlack);
    feedbackProgram.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
    feedbackProgram.setUniform("forceMap", img);
    feedbackProgram.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
    feedbackProgram.setUniform("force", 1.0);
    feedbackProgram.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
    feedbackProgram.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
    feedbackProgram.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
    feedbackProgram.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
    feedbackProgram.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
    feedbackProgram.setUniform("mouseCount", 0.0);
    rectMode(CENTER);
    rect(0, 0, width, height);
    resetShader();
    pingPongBuffer.end();
  }
}

function resetAllStates() {
  isDrawing = false;
  isCountingDown = false;
  updateCount = 0;
  force = 1.0;
  isNewStroke = false;
  strokeComplete = false;
  isFirstDraw = 0;
  x = hw;
  y = hh;
  brushAccelX = 0;
  brushAccelY = 0;
  brushSpeed = 0;
  initialSize = 0;
  currentSize = 0;
  brushSizeNow = 0;
  radColor = 0;
  mouseCount = 0;
  drawingFrameCount = 0;
  pathPoints = [];
  hasPath = false;
  startX = hw;
  startY = hh;
  targetX = hw;
  targetY = hh;
  brushDirection = 0;
  oldR = 0;
  oldX = hw;
  oldY = hh;
  flyBrush = [];
  flyBrushEnd = [];
  gobalSize = 0;
  simulatedMouseX = hw;
  simulatedMouseY = hh;
  simulatedPMouseX = hw;
  simulatedPMouseY = hh;
  simulatedMousePressed = false;
  countdownStartTime = 0;
  wasCountingDownLastFrame = false;
}

function drawMap() {
  img.begin();
  shader(mapProgram);
  mapProgram.setUniform("randomSeed1", randomSeeds[0] || 100);
  mapProgram.setUniform("randomSeed2", randomSeeds[1] || 200);
  mapProgram.setUniform("randomSeed3", randomSeeds[2] || 300);
  mapProgram.setUniform("randomSeed4", randomSeeds[3] || 400);
  mapProgram.setUniform("scale1", scales[0] || 0.002);
  mapProgram.setUniform("scale2", scales[1] || 0.005);
  mapProgram.setUniform("scale3", scales[2] || 0.015);
  mapProgram.setUniform("amplitude1", amplitudes[0] || 0.6);
  mapProgram.setUniform("amplitude2", amplitudes[1] || 0.4);
  mapProgram.setUniform("amplitude3", amplitudes[2] || 0.3);
  mapProgram.setUniform("phase1", phases[0] || 0);
  mapProgram.setUniform("phase2", phases[1] || 0);
  mapProgram.setUniform("phase3", phases[2] || 0);
  mapProgram.setUniform("vortexScale1", vortexScales[0] || 0.008);
  mapProgram.setUniform("vortexScale2", vortexScales[1] || 0.012);
  mapProgram.setUniform("clusterScale1", clusterScales[0] || 0.001);
  mapProgram.setUniform("clusterScale2", clusterScales[1] || 0.0008);
  mapProgram.setUniform("canvasCenter", [hw, hh]);
  mapProgram.setUniform("time", millis() * 0.001);
  rectMode(CENTER);
  imageMode(CENTER);
  rect(0, 0, width, height);
  resetShader();
  img.end();
}

function generateRandomForceMap() {
  for (let i = 0; i < 4; i++) {
    randomSeeds[i] = crandom.random(100 + i * 100, 200 + i * 100);
  }
  for (let i = 0; i < 3; i++) {
    scales[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
    amplitudes[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
    phases[i] = crandom.random(0, TWO_PI);
  }
  for (let i = 0; i < 2; i++) {
    vortexScales[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
    clusterScales[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
  }
  drawMap();
}

function logArtSeparator(title = '') {}

function initializePlaybackSystem() {
  simulateInitializationClick();
}

function simulateInitializationClick() {
  generateRandomForceMap();
  const tempBrushMode = brushMode;
  brushMode = 1;
  initialSize = 20;
  currentSize = initialSize;
  brushSize = currentSize;
  brushSizeNow = brushSize;
  isDrawing = true;
  isCountingDown = false;
  updateCount = 0;
  isNewStroke = true;
  strokeComplete = false;
  mousePressed();
  for (let i = 0; i < 5; i++) {
    updateDrawingOnBuffer(newBufferBlack, 1.0);
  }
  mouseReleased();
  isCountingDown = true;
  updateCount = 0;
  for (let i = 0; i < 10; i++) {
    force = map(i, 0, 10, 1.0, 0.0);
    updateDrawingOnBuffer(newBufferBlack, force);
  }
  transferNewToOld();
  brushMode = tempBrushMode;
  clearCanvas();
}

function startFrameRecording() {
  if (isFrameRecording) {
    logArt('system', '⚠️ Frame recording already in progress', {
      Status: 'Warning'
    });
    return;
  }
  isFrameRecording = true;
  frameRecordingStartTime = millis();
  frameCount = 0;
  frameRecordingData = [];
  logArtSeparator('🎬 Start Frame Recording');
}

function stopFrameRecording() {
  if (!isFrameRecording) {
    logArt('system', '⚠️ No frame recording in progress', {
      Status: 'Warning'
    });
    return;
  }
  isFrameRecording = false;
  const recordingDuration = millis() - frameRecordingStartTime;
  logArtSeparator('🎬 Frame Recording Complete');
  saveFrameSequence();
}

function captureFrame() {
  if (!isFrameRecording) return;
  if (frameCount % frameRecordingInterval !== 0) {
    frameCount++;
    return;
  }
  const frameNumber = String(frameCount + 1).padStart(5, '0');
  const filename = `$seed_${frameNumber}.png`;
  saveCanvas(filename, 'png');
  frameRecordingData.push({
    frame: frameCount,
    timestamp: millis() - frameRecordingStartTime,
    filename: filename
  });
  frameCount++;
  if (frameCount % 30 === 0) {
    logArt('recording', '📸 Frame captured', {
      Frame: frameCount,
      Total: frameRecordingData.length,
      Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
    });
  }
}

function saveFrameSequence() {
  if (frameRecordingData.length === 0) {
    logArt('system', '⚠️ No frame data to save', {
      Status: 'Warning'
    });
    return;
  }
  logArt('art', '💾 Frame sequence saved', {
    Format: 'PNG images',
    Frames: `${frameRecordingData.length} frames`,
    Method: 'Direct save with saveCanvas()',
    Location: 'Downloads folder'
  });
}

function point2(num) {
  return Math.round(num * 100) / 100;
}

// === js/recording.js ===
function recordEvent(type, data = {}) {
  if (!isRecording) return;
  if (recordingStartTime === 0) return;
  const baseTime = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
  const actualTime = baseTime + (millis() - recordingStartTime - accumulatedPauseTime);
  const event = {
    m: type,
    t: Math.round(actualTime),
    ...data
  };
  recordingData.events.push(event);
  if (type !== 'md' && type !== 'mouseDragged') {
    const eventEmoji = {
      'mp': '🖱️',
      'mousePressed': '🖱️',
      'mr': '✋',
      'mouseReleased': '✋',
      'kp': '⌨️',
      'keyPressed': '⌨️',
      'ec': '✨',
      'effectControl': '✨'
    };
    const typeDisplay = {
      'mp': 'mousePressed',
      'mr': 'mouseReleased',
      'md': 'mouseDragged',
      'kp': 'keyPressed',
      'ec': 'Effect Control',
      'effectControl': 'Effect Control'
    };
    logArt('recording', `${eventEmoji[type] || '📝'} Event recorded`, {
      Type: typeDisplay[type] || type,
      Time: `${actualTime.toFixed(0)}ms`,
      Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
      EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
    });
  }
}

function startRecording() {
  isRecording = true;
  recordingStartTime = 0;
  lastStrokeEndTime = 0;
  accumulatedPauseTime = 0;
  isFirstStroke = true;
  radColor = 0;
  const recordingSeed = seed;
  const initialShapeType = (typeof getShapeType === 'function') ? getShapeType() : 0;
  const initialMetallicStrength = (typeof window.metallicStrength !== 'undefined') ?
    Math.round(window.metallicStrength * 100) : 85;
  const initialMetallicFlow = (typeof window.metallicFlowSpeed !== 'undefined') ?
    Math.round(window.metallicFlowSpeed * 100) : 200;
  const initialMetallicTint = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
    [...window.metallicTint] : [0.72, 0.50, 0.35];
  const tintButtons = {
    'gold': [0.88, 0.72, 0.52],
    'silver': [0.75, 0.75, 0.75],
    'copper': [0.72, 0.50, 0.35],
    'rose': [0.88, 0.65, 0.70],
    'black': [0.15, 0.12, 0.08],
    'diamond': [0.95, 0.95, 1.0]
  };
  let initialTintType = 'copper';
  for (const [type, rgb] of Object.entries(tintButtons)) {
    if (Math.abs(initialMetallicTint[0] - rgb[0]) < 0.01 &&
      Math.abs(initialMetallicTint[1] - rgb[1]) < 0.01 &&
      Math.abs(initialMetallicTint[2] - rgb[2]) < 0.01) {
      initialTintType = type;
      break;
    }
  }
  recordingData = {
    version: "1.0",
    startTime: recordingStartTime,
    randomSeed: recordingSeed,
    initialPathToggle: pathToggle,
    initialWhiteBrushMode: whiteBrushMode,
    initialBrushColorMode: brushColorMode,
    canvasSize: {
      width: width,
      height: height
    },
    canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
    events: [],
    strokes: [],
    timeOffset: 0,
    initialEffectControl: {
      shapeType: initialShapeType,
      metallicStrength: initialMetallicStrength,
      metallicFlow: initialMetallicFlow,
      metallicTint: initialMetallicTint,
      metallicTintType: initialTintType
    }
  };
  randomSeed(recordingSeed);
  noiseSeed(recordingSeed);
  logArtSeparator('🎬 Start Art Creation Recording');
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

function stopRecording() {
  if (!isRecording) return;
  isRecording = false;
  randomSeed(seed);
  noiseSeed(seed);
  logArtSeparator('✨ Art Creation Recording Complete');
  const lastEventTime = recordingData.events.length > 0 ?
    (recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
    0;

  // 快照 Flow Effect panel 狀態（stop 時的最終值）
  // 全域變數：distortShaderEnabled, cellularEnabled, rsEnabled, whiteDotEnabled, grainEnabled, distortShowFbmMask
  recordingData.initialFlowEffect = {
    flowStrength: typeof flowEffectParams !== 'undefined' ? flowEffectParams.blendVol : 100,
    distortShaderEnabled: typeof distortShaderEnabled !== 'undefined' ? distortShaderEnabled : false,
    cellularEnabled: typeof cellularEnabled !== 'undefined' ? cellularEnabled : false,
    rsEnabled: typeof rsEnabled !== 'undefined' ? rsEnabled : false,
    whiteDotEnabled: typeof whiteDotEnabled !== 'undefined' ? whiteDotEnabled : false,
    grainEnabled: typeof grainEnabled !== 'undefined' ? grainEnabled : false,
    distortShowFbmMask: typeof distortShowFbmMask !== 'undefined' ? distortShowFbmMask : 0.0,
    distortDisplacementB: typeof distortDisplacementB !== 'undefined' ? distortDisplacementB : 20,
    distortDisplacementC: typeof distortDisplacementC !== 'undefined' ? distortDisplacementC : 100
  };

  // 快照 Art System Log panel 的 toggle 狀態
  recordingData.initialPanelToggles = {
    showPaperTexture: typeof showPaperTexture !== 'undefined' ? showPaperTexture : false,
    showGridOverlay: typeof showGridOverlay !== 'undefined' ? showGridOverlay : true,
    showFuturePathPreview: typeof showFuturePathPreview !== 'undefined' ? showFuturePathPreview : false,
    screenText: typeof screenText !== 'undefined' ? screenText : false,
    doMoving: typeof doMoving !== 'undefined' ? doMoving : false,
    loopToggle: typeof loopToggle !== 'undefined' ? loopToggle : 0
  };

  saveRecording();
  setTimeout(() => {
    saveCanvasAsPNG();
  }, 300);
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

function saveRecording() {
  if (recordingData.events.length === 0) {
    logArt('system', '⚠️ No recording data to save', {
      Status: 'Warning'
    });
    return;
  }
  const dataToSave = {
    ...recordingData,
    savedAt: new Date().toISOString(),
    canvasSize: {
      width: width,
      height: height
    },
    canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
  };
  const jsonString = JSON.stringify(dataToSave, null, 2);
  const blob = new Blob([jsonString], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  link.download = `drawing-recording-${timestamp}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  logArt('art', '💾 Art recording saved', {
    File: link.download,
    Size: `${(jsonString.length / 1024).toFixed(2)} KB`,
    Events: `${recordingData.events.length} events`,
    Strokes: `${recordingData.strokes.length} strokes`
  });
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

function loadRecording() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target.result);
        if (!loadedData.version || !loadedData.events) {
          logArt('system', '❌ Invalid recording file format', {
            Status: 'Error'
          });
          return;
        }
        if (typeof window !== 'undefined') {
          window.loadedRecordingData = JSON.parse(JSON.stringify(loadedData));
          window.loadedRecordingFileName = file.name;
        }
        recordingData = loadedData;
        if (typeof allBrushStrokes !== 'undefined') {
          allBrushStrokes = [];
        }
        if (typeof pendingBugBounds !== 'undefined') {
          pendingBugBounds = null;
        }
        if (typeof pathPointsCache !== 'undefined') {
          pathPointsCache = null;
        }
        if (typeof totalStrokeCount !== 'undefined') {
          totalStrokeCount = 0;
        }
        if (typeof markedDarkPoints !== 'undefined') {
          markedDarkPoints = [];
        }
        if (typeof window !== 'undefined') {
          window.bugsDataTextureCache = null;
          window.bugsMaskTextureCache = null;
        }
        logArtSeparator('📂 Recording File Loaded Successfully');
        if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
          const shouldReload = restoreCanvasSize(recordingData.canvasSize.width, recordingData.canvasSize.height);
          if (shouldReload) {
            if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
              sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
            }
            sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
            sessionStorage.setItem('pendingLoadedRecordingFileName', file.name);
            return;
          }
        }
        if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
          if (typeof canvasBackgroundColor !== 'undefined') {
            canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
            canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
            canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
          }
          if (typeof paperFlatBuffer !== 'undefined' && paperFlatBuffer) {
            paperFlatBuffer.begin();
            background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
            paperFlatBuffer.end();
          }
          if (typeof regeneratePaperTextureBuffer === 'function') {
            regeneratePaperTextureBuffer();
          }
          if (typeof updateBackgroundColorDisplay === 'function') {
            updateBackgroundColorDisplay();
          }
          logArt('system', '🎨 Background color restored from recording', {
            RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
          });
        }
        setTimeout(() => {
          startPlayback();
        }, 500);
      } catch (error) {
        logArt('system', '❌ Failed to load recording', {
          Error: error.message,
          Status: 'Error'
        });
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function startPlayback() {
  // fast-capture: GPU 關閉、最多 1 秒，無法跑完回放，立即觸發截圖
  if (window._fxFastCapture && typeof $fx !== 'undefined' && typeof $fx.preview === 'function' && !window._fxPreviewTriggered) {
    window._fxPreviewTriggered = true;
    console.log('[fxhash] fast-capture: triggering $fx.preview() immediately (no GPU, 1s limit)');
    $fx.preview();
    return;
  }
  window.showStrokeDivider = true;
  if (recordingData.events.length === 0) {
    logArt('system', '⚠️ No recording data to play', {
      Status: 'Error'
    });
    return;
  }
  if (isPlaying) {
    logArt('system', '⚠️ Already playing', {
      Status: 'Warning'
    });
    return;
  }
  if (typeof gothicdotss !== 'undefined') {
    gothicdotss = [];
  }
  if (typeof gothicDotIdCounter !== 'undefined') {
    gothicDotIdCounter = 0;
  }
  if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
    if (typeof canvasBackgroundColor !== 'undefined') {
      canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
      canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
      canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
    }
  }

  // 在 clearCanvas 之前先還原 panel toggle，避免清畫面時 toggle 狀態不正確導致白閃
  const urlParams_early = window.location.search || '';
  const urlHasParam_early = (key) => urlParams_early.includes('_' + key + ':') || urlParams_early.includes('?' + key + ':');
  const panelToggleDefs_early = [
    { jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
    { jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
    { jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
    { jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
    { jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
    { jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
  ];
  const urlKeyMap_early = {
    'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
    'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
  };
  const pt_early = recordingData.initialPanelToggles;
  for (const def of panelToggleDefs_early) {
    const urlKey = urlKeyMap_early[def.jsonKey];
    if (urlKey && urlHasParam_early(urlKey)) continue;
    const value = pt_early ? pt_early[def.jsonKey] : undefined;
    const finalVal = value !== undefined ? value : def.defaultVal;
    def.setter(finalVal);
    const checkbox = document.getElementById(def.toggleId);
    if (checkbox) {
      checkbox.checked = def.isNumeric ? (finalVal === 1) : !!finalVal;
    }
  }

  clearCanvas();
  if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
    if (typeof paperFlatBuffer !== 'undefined' && paperFlatBuffer) {
      paperFlatBuffer.begin();
      background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
      paperFlatBuffer.end();
    }
    if (typeof regeneratePaperTextureBuffer === 'function') {
      regeneratePaperTextureBuffer();
    }
    if (typeof needsComposite !== 'undefined') {
      needsComposite = true;
    }
    if (typeof updateBackgroundColorDisplay === 'function') {
      updateBackgroundColorDisplay();
    }
    logArt('playback', '🎨 Background color restored', {
      RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
    });
  }
  if (recordingData.randomSeed) {
    randomSeed(recordingData.randomSeed);
    noiseSeed(recordingData.randomSeed);
    if (typeof boidsSeed !== 'undefined') {
      boidsSeed = floor(crandom.random(1, 10000));
    }
    logArt('playback', 'Random seed reset', {
      Seed: recordingData.randomSeed
    });
  } else {
    logArt('system', '⚠️ No seed info in recording, playback may be inaccurate', {
      Status: 'Warning'
    });
  }
  isPlaying = true;
  playbackStartTime = millis();
  // fxhash 環境：用虛擬幀時間取代真實時間，確保每一筆的 feedback 幀數與 60fps 一致
  if (window._fxContext) {
    window._fxVirtualTime = 0;
  }
  currentEventIndex = 0;
  playbackLastStrokeEndTime = 0;
  playbackLastStrokeEndEventTime = 0;
  if (typeof totalStrokeCount !== 'undefined') {
    totalStrokeCount = 0;
  }
  playbackStrokeIndex = 0;
  playbackLastStrokeBrushMode = undefined;
  if (typeof easycamTrackingStrokeCount !== 'undefined') {
    easycamTrackingStrokeCount = 0;
  }
  simulatedMousePressed = false;
  simulatedMouseX = hw;
  simulatedMouseY = hh;
  simulatedPMouseX = hw;
  simulatedPMouseY = hh;
  drawingFrameCount = 0;
  if (typeof newStrokeStartedForBlur !== 'undefined') {
    newStrokeStartedForBlur = false;
  }
  if (typeof pathPoints !== 'undefined') {
    pathPoints = [];
  }
  if (typeof pathPointsCache !== 'undefined') {
    pathPointsCache = null;
  }
  if (typeof hasPath !== 'undefined') {
    hasPath = false;
  }
  if (typeof allBrushStrokes !== 'undefined') {
    allBrushStrokes = [];
  }
  if (typeof pendingBugBounds !== 'undefined') {
    pendingBugBounds = null;
  }
  if (typeof markedDarkPoints !== 'undefined') {
    markedDarkPoints = [];
  }
  if (typeof window !== 'undefined') {
    window.bugsDataTextureCache = null;
    window.bugsMaskTextureCache = null;
  }
  if (typeof layerBlurMaxValues !== 'undefined') {
    layerBlurMaxValues = {
      0: 0,
      40: 0,
      80: 0,
      120: 0
    };
  }
  if (typeof layerBlurValues !== 'undefined') {
    layerBlurValues = {
      0: 0,
      40: 0,
      80: 0,
      120: 0
    };
  }
  radColor = 0;
  countdownStartTime = 0;
  wasCountingDownLastFrame = false;
  if (recordingData.initialPathToggle !== undefined) {
    pathToggle = recordingData.initialPathToggle;
    logArt('playback', 'Path toggle restored', {
      Status: pathToggle ? "ON ✅" : "OFF ❌"
    });
  }
  if (recordingData.initialBrushColorMode !== undefined) {
    brushColorMode = recordingData.initialBrushColorMode;
    whiteBrushMode = (brushColorMode === 1);
    const colorNames = ['Black ⚫', 'White ⚪', 'Red 🔴'];
    logArt('playback', 'Brush color restored', {
      Mode: colorNames[brushColorMode] || 'Unknown'
    });
  } else if (recordingData.initialWhiteBrushMode !== undefined) {
    whiteBrushMode = recordingData.initialWhiteBrushMode;
    brushColorMode = whiteBrushMode ? 1 : 0;
    logArt('playback', 'Brush color restored (legacy)', {
      Mode: whiteBrushMode ? "White ⚪" : "Black ⚫"
    });
  } else {
    whiteBrushMode = false;
    brushColorMode = 0;
  }
  logArtSeparator('🎭 Start Art Reproduction');
  if (typeof window !== 'undefined') {
    window._scanGlobalPlaybackCount = 0;
    window._scanCurrentPlaybackCount = 0;
  }
  if (recordingData.initialEffectControl) {
    const ec = recordingData.initialEffectControl;
    if (ec.shapeType !== undefined) {
      if (typeof setShapeType === 'function') {
        setShapeType(ec.shapeType);
      }
    }
    if (ec.metallicStrength !== undefined) {
      if (typeof window !== 'undefined') {
        window.metallicStrength = ec.metallicStrength / 100;
      }
      const strengthSlider = document.getElementById('metallic-strength');
      const strengthValue = document.getElementById('metallic-strength-value');
      if (strengthSlider && strengthValue) {
        strengthSlider.value = ec.metallicStrength;
        strengthValue.textContent = ec.metallicStrength;
      }
    }
    if (ec.metallicFlow !== undefined) {
      if (typeof window !== 'undefined') {
        window.metallicFlowSpeed = ec.metallicFlow / 100;
      }
      const flowSlider = document.getElementById('metallic-flow');
      const flowValue = document.getElementById('metallic-flow-value');
      if (flowSlider && flowValue) {
        flowSlider.value = ec.metallicFlow;
        flowValue.textContent = ec.metallicFlow;
      }
    }
    if (ec.metallicTintType !== undefined) {
      const tintButtons = {
        'gold': [0.88, 0.72, 0.52],
        'silver': [0.75, 0.75, 0.75],
        'copper': [0.72, 0.50, 0.35],
        'rose': [0.88, 0.65, 0.70],
        'black': [0.15, 0.12, 0.08],
        'diamond': [0.95, 0.95, 1.0]
      };
      if (tintButtons[ec.metallicTintType]) {
        if (typeof window !== 'undefined') {
          window.metallicTint = [...tintButtons[ec.metallicTintType]];
        }
        const btnId = `metal-${ec.metallicTintType}`;
        const btn = document.getElementById(btnId);
        if (btn) {
          document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      }
    }
    logArt('playback', '✨ Effect Control restored', {
      ShapeType: ec.shapeType !== undefined ? ec.shapeType : 'Unknown',
      Strength: ec.metallicStrength !== undefined ? ec.metallicStrength : 'Unknown',
      Flow: ec.metallicFlow !== undefined ? ec.metallicFlow : 'Unknown',
      Tint: ec.metallicTintType || 'Unknown'
    });
  }

  // 還原 Flow Effect panel 狀態
  // 步驟 1：先重置所有 post-effect toggle 為 OFF（確保乾淨起始狀態）
  // 步驟 2：如果 JSON 有 initialFlowEffect，再從中還原
  // 優先級：URL 參數 > JSON initialFlowEffect > 預設 OFF

  // toggleDefs 定義：直接設定全域變數（避免 window[...] 對 let 宣告無效）
  const flowToggleDefs = [
    { jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
    { jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
    { jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
    { jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
    { jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
  ];

  // 步驟 1：重置所有 post-effect toggle 為 OFF
  const urlParams = window.location.search || '';
  const urlHasParam = (key) => urlParams.includes('_' + key + ':') || urlParams.includes('?' + key + ':');

  for (const def of flowToggleDefs) {
    // URL 有指定時跳過，讓 URL 優先
    if (urlHasParam(def.urlKey)) continue;

    def.setter(false);
    const checkbox = document.getElementById(def.toggleId);
    if (checkbox) {
      checkbox.checked = false;
    }
    const slidersSection = document.getElementById(def.slidersId);
    if (slidersSection) {
      slidersSection.style.display = 'none';
    }
  }
  // 重置 distortShowFbmMask
  if (typeof distortShowFbmMask !== 'undefined') {
    distortShowFbmMask = 0.0;
    const fbmCheckbox = document.getElementById('distort-fbm-preview-toggle');
    if (fbmCheckbox) fbmCheckbox.checked = false;
  }

  // 步驟 2：從 JSON initialFlowEffect 還原（如果有）
  if (recordingData.initialFlowEffect) {
    const fe = recordingData.initialFlowEffect;

    // 向後相容：舊 JSON 用 isDistortShader/isCellular 等舊 key 名
    const legacyMap = {
      isDistortShader: 'distortShaderEnabled',
      isCellular: 'cellularEnabled',
      isRS: 'rsEnabled',
      isWhiteDot: 'whiteDotEnabled',
      isGrain: 'grainEnabled'
    };
    for (const [oldKey, newKey] of Object.entries(legacyMap)) {
      if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
        fe[newKey] = fe[oldKey];
        logArt('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
      }
    }

    // Flow 強度（URL 沒有對應參數，永遠從 JSON 還原）
    if (fe.flowStrength !== undefined && typeof flowEffectParams !== 'undefined') {
      flowEffectParams.blendVol = fe.flowStrength;
      const fsSlider = document.getElementById('flow-strength');
      const fsValue = document.getElementById('flow-strength-value');
      if (fsSlider) fsSlider.value = fe.flowStrength;
      if (fsValue) fsValue.textContent = fe.flowStrength;
    }

    // Post-effect 開關還原
    for (const def of flowToggleDefs) {
      const value = fe[def.jsonKey];
      if (value === undefined) continue;

      // URL 有指定時跳過
      if (urlHasParam(def.urlKey)) {
        logArt('playback', `⏭️ Flow Effect: ${def.jsonKey} skipped (URL override)`, {});
        continue;
      }

      def.setter(!!value);
      const checkbox = document.getElementById(def.toggleId);
      if (checkbox) {
        checkbox.checked = !!value;
      }
      const slidersSection = document.getElementById(def.slidersId);
      if (slidersSection) {
        slidersSection.style.display = value ? 'flex' : 'none';
      }
    }

    // distortShowFbmMask（float: 0.0 或 1.0）
    if (fe.distortShowFbmMask !== undefined) {
      distortShowFbmMask = fe.distortShowFbmMask;
      const fbmCheckbox = document.getElementById('distort-fbm-preview-toggle');
      if (fbmCheckbox) fbmCheckbox.checked = fe.distortShowFbmMask > 0.5;
    }

    // Distort displacement B/C
    if (fe.distortDisplacementB !== undefined) {
      distortDisplacementB = fe.distortDisplacementB;
      const dbSlider = document.getElementById('distort-displacement-b');
      const dbValue = document.getElementById('distort-displacement-b-value');
      if (dbSlider) dbSlider.value = fe.distortDisplacementB;
      if (dbValue) dbValue.textContent = fe.distortDisplacementB;
    }
    if (fe.distortDisplacementC !== undefined) {
      distortDisplacementC = fe.distortDisplacementC;
      const dcSlider = document.getElementById('distort-displacement-c');
      const dcValue = document.getElementById('distort-displacement-c-value');
      if (dcSlider) dcSlider.value = fe.distortDisplacementC;
      if (dcValue) dcValue.textContent = fe.distortDisplacementC;
    }

    logArt('playback', '✨ Flow Effect restored', {
      Strength: fe.flowStrength,
      Distort: !!fe.distortShaderEnabled ? 'ON' : 'OFF',
      Cellular: !!fe.cellularEnabled ? 'ON' : 'OFF',
      RS: !!fe.rsEnabled ? 'ON' : 'OFF',
      WhiteDot: !!fe.whiteDotEnabled ? 'ON' : 'OFF',
      Grain: !!fe.grainEnabled ? 'ON' : 'OFF'
    });
  } else {
    logArt('playback', '🔄 Flow Effect: reset to defaults (no initialFlowEffect in JSON)', {});
  }

  // Panel toggles 已在 clearCanvas() 之前還原（避免白閃），這裡只做 log
  if (pt_early) {
    logArt('playback', '✨ Panel toggles restored', {
      Paper: pt_early.showPaperTexture ? 'ON' : 'OFF',
      Grid: pt_early.showGridOverlay ? 'ON' : 'OFF',
      Path: pt_early.showFuturePathPreview ? 'ON' : 'OFF',
      Console: pt_early.screenText ? 'ON' : 'OFF',
      Camera: pt_early.doMoving ? 'ON' : 'OFF',
      Loop: pt_early.loopToggle === 1 ? 'ON' : 'OFF'
    });
  } else {
    logArt('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
  }

  generateRandomForceMap();
  initializeShaders();
  const firstEvent = recordingData.events[0];
  if (firstEvent && firstEvent.strokeData) {
    const strokeData = firstEvent.strokeData;
    currentSize = strokeData.initialSize || 20;
    initialSize = strokeData.initialSize || 20;
    size = currentSize;
    nowSize = size;
  }
  updateDrawingOnBuffer(newBufferBlack, 1.0);
  if (typeof doMoving !== 'undefined' && doMoving) {
    if (typeof easycamEnabled === 'undefined' || !easycamEnabled) {
      easycamEnabled = true;
    }
    easycamAutoTracking = true;
    if (easycamEnabled && easycam !== null) {
      easycamInitialCenter = [0, 0, 0];
      const fixedFov = Math.PI / 3;
      easycamInitialDistance = height / (2 * Math.tan(fixedFov / 2));
      easycam.setAutoUpdate(true);
      if (typeof easycam.setPanScale === 'function') {
        easycam.setPanScale(0);
      }
      if (typeof easycam.setZoomScale === 'function') {
        easycam.setZoomScale(0);
      }
      easycam.setCenter([0, 0, 0], 0);
      easycam.setDistance(easycamInitialDistance, 0);
      if (typeof easycamZoomDirection !== 'undefined') {
        easycamZoomDirection = 1;
      }
      logArt('system', '🎥 EasyCam ready', {
        Status: 'Auto-tracking enabled',
        Controls: 'Camera automatically follows grid center'
      });
    }
  } else {
    easycamAutoTracking = false;
    easycamEnabled = false;
  }
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

function stopPlayback() {
  if (!isPlaying) return;
  isPlaying = false;
  simulatedMousePressed = false;
  currentEventIndex = 0;
  isWaitingToLoop = false;
  countdownStartTime = 0;
  wasCountingDownLastFrame = false;
  randomSeed(seed);
  noiseSeed(seed);
  logArtSeparator('⏹️ Playback Ended');
  askToContinueRecording();
  easycamAutoTracking = false;
  if (easycamEnabled && easycam !== null) {
    try {
      const resetCenter = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
        easycamInitialCenter :
        [0, 0, 0];
      const resetDistance = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
        easycamInitialDistance :
        Math.max(width, height) * 1.0;
      const currentCenter = easycam.getCenter();
      const currentDistance = easycam.getDistance();
      logArt('system', '📊 Playback complete - Camera position logged', {
        Current: `Center: [${currentCenter[0].toFixed(2)}, ${currentCenter[1].toFixed(2)}, ${currentCenter[2].toFixed(2)}], Distance: ${currentDistance.toFixed(2)}`,
        Target: `Center: [${resetCenter[0].toFixed(2)}, ${resetCenter[1].toFixed(2)}, ${resetCenter[2].toFixed(2)}], Distance: ${resetDistance.toFixed(2)}`
      });
      easycamResetting = true;
      easycamResetStartTime = millis();
      easycamResetStartCenter = [currentCenter[0], currentCenter[1], currentCenter[2]];
      easycamResetStartDistance = currentDistance;
      easycamResetTargetCenter = resetCenter;
      easycamResetTargetDistance = resetDistance;
      setTimeout(() => {
        if (easycam !== null) {
          easycam.setAutoUpdate(false);
          const finalCenter = easycam.getCenter();
          const finalDistance = easycam.getDistance();
          const centerTolerance = 0.1;
          const distanceTolerance = 1.0;
          const centerDiff = Math.sqrt(
            Math.pow(finalCenter[0] - resetCenter[0], 2) +
            Math.pow(finalCenter[1] - resetCenter[1], 2) +
            Math.pow(finalCenter[2] - resetCenter[2], 2)
          );
          const distanceDiff = Math.abs(finalDistance - resetDistance);
          logArt('system', '📊 After 2s animation - Camera position logged', {
            Final: `Center: [${finalCenter[0].toFixed(2)}, ${finalCenter[1].toFixed(2)}, ${finalCenter[2].toFixed(2)}], Distance: ${finalDistance.toFixed(2)}`,
            Target: `Center: [${resetCenter[0].toFixed(2)}, ${resetCenter[1].toFixed(2)}, ${resetCenter[2].toFixed(2)}], Distance: ${resetDistance.toFixed(2)}`,
            Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
            Status: (centerDiff <= centerTolerance && distanceDiff <= distanceTolerance) ? '✅ At target' : '❌ Not at target'
          });
          if (centerDiff > centerTolerance || distanceDiff > distanceTolerance) {
            console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
              centerDiff: centerDiff.toFixed(3),
              distanceDiff: distanceDiff.toFixed(3),
              beforeReset: {
                center: `[${finalCenter[0].toFixed(3)}, ${finalCenter[1].toFixed(3)}, ${finalCenter[2].toFixed(3)}]`,
                distance: finalDistance.toFixed(3)
              }
            });
            easycam.setCenter(resetCenter, 0);
            easycam.setDistance(resetDistance, 0);
            const afterResetCenter = easycam.getCenter();
            const afterResetDistance = easycam.getDistance();
            logArt('system', '📊 After force reset - Camera position logged', {
              Center: `[${afterResetCenter[0].toFixed(2)}, ${afterResetCenter[1].toFixed(2)}, ${afterResetCenter[2].toFixed(2)}]`,
              Distance: afterResetDistance.toFixed(2)
            });
          }
          easycamResetting = false;
        }
        easycamEnabled = false;
      }, 2100);
      logArt('system', '🎥 EasyCam disabled', {
        Status: 'Playback stopped, camera reset and disabled',
        Center: resetCenter,
        Distance: resetDistance.toFixed(2)
      });
    } catch (error) {
      console.warn('⚠️ EasyCam cleanup error:', error);
      easycamEnabled = false;
    }
  } else {
    easycamEnabled = false;
  }
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}
window.startPlayback = startPlayback;

function simulateEvent(event) {
  const eventType = event.m || event.type;
  switch (eventType) {
    case 'mp':
    case 'mousePressed':
      crandom.reset();
      crandomDebugger.resetStroke();
      window.drawLoopCount = 0;
      window.playbackMouseDraggedCount = 0;
      window.playbackMultiEventFrames = 0;
      window.playbackDelayedReleaseCount = 0;
      crandomDebugger.checkpoint('播放_mousePressed_開始', 'mousePressed');
      const wasCountingDown = isCountingDown;
      const currentEventTime = event.t !== undefined ? event.t : event.time;
      if (isCountingDown) {
        const oldPlaybackStartTime = playbackStartTime;
        if (window._fxVirtualTime === undefined) {
          playbackStartTime = millis() - currentEventTime / playbackSpeed;
        }
        const compensatedTime = oldPlaybackStartTime - playbackStartTime;
        const countdownDuration = (typeof countdownStartTime !== 'undefined' && countdownStartTime > 0) ?
          (millis() - countdownStartTime) :
          0;
        if (typeof wasCountingDownLastFrame !== 'undefined') {
          wasCountingDownLastFrame = false;
        }
        if (typeof countdownStartTime !== 'undefined') {
          countdownStartTime = 0;
        }
        transferNewToOld();
        isCountingDown = false;
        updateCount = 0;
      }
      if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
        const waitTime = currentEventTime - playbackLastStrokeEndEventTime;
        const currentBrushMode = event.strokeData ? event.strokeData.brushMode : brushMode;
        const lastBrushMode = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
      }
      handleRapidDrawing();
      if (typeof gothicdotss !== 'undefined') {
        gothicdotss = [];
      }
      if (typeof gothicDotIdCounter !== 'undefined') {
        gothicDotIdCounter = 0;
      }
      if (typeof easycamTrackingStrokeCount !== 'undefined') {
        easycamTrackingStrokeCount++;
        if (typeof easycamShouldZoom !== 'undefined' && typeof easycamLastStrokeCount !== 'undefined') {
          easycamShouldZoom = random(0, 1) > 0.7;
          easycamLastStrokeCount = easycamTrackingStrokeCount;
        }
      }
      simulatedMouseX = event.x + (typeof playbackOffsetX !== 'undefined' ? playbackOffsetX : 0);
      simulatedMouseY = event.y + (typeof playbackOffsetY !== 'undefined' ? playbackOffsetY : 0);
      simulatedPMouseX = simulatedMouseX;
      simulatedPMouseY = simulatedMouseY;
      if (false) {
        simulatedMousePressed = true;
      } else {
        simulatedMousePressed = false;
      }
      if (typeof newStrokeStartedForBlur !== 'undefined') {
        newStrokeStartedForBlur = true;
      }
      if (event.strokeData) {
        const sd = event.strokeData;
        if (typeof playbackLastStrokeBrushMode !== 'undefined') {
          playbackLastStrokeBrushMode = sd.brushMode;
        }
        if (sd.strokeSeed) {
          strokeSeed = sd.strokeSeed;
          randomSeed(sd.strokeSeed);
          noiseSeed(sd.strokeSeed);
          if (sd.mouseCountStart !== undefined) {
            currentStrokeMouseCountStart = sd.mouseCountStart;
          } else {
            currentStrokeMouseCountStart = 0;
          }
          mouseCount = 0;
          const offsetX = typeof playbackOffsetX !== 'undefined' ? playbackOffsetX : 0;
          const offsetY = typeof playbackOffsetY !== 'undefined' ? playbackOffsetY : 0;
          const adjustedX = event.x + offsetX;
          const adjustedY = event.y + offsetY;
          logArt('playback', 'Reproducing', {
            Seed: sd.strokeSeed,
            Mode: `Brush mode ${sd.brushMode}`,
            Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
            Position: `(${adjustedX.toFixed(0)}, ${adjustedY.toFixed(0)})`
          });
          logArt('system', '|--------------------------------', {});
        } else {
          logArt('system', '⚠️ Warning: No strokeSeed found!', {
            Status: 'Error'
          });
          mouseCount = 0;
        }
        radColor = 0;
        isFirstDraw = 0;
        x = simulatedMouseX;
        y = simulatedMouseY;
        brushAccelX = 0;
        brushAccelY = 0;
        brushSpeed = 0;
        oldR = 0;
        gobalSize = 0;
        drawingFrameCount = 0;
        updateCount = 0;
        isCountingDown = false;
        if (sd.brushModeSP !== undefined) {
          brushModeSP = sd.brushModeSP;
        }
        if (typeof gothicdotss !== 'undefined') {
          gothicdotss = [];
        }
        if (typeof prevTargetX !== 'undefined') {
          prevTargetX = simulatedMouseX;
          prevTargetY = simulatedMouseY;
        }
        colorIndex = sd.colorIndex;
        shapeType = sd.shapeType;
        useSharpen = sd.useSharpen;
        brushMode = sd.brushMode;
        if (sd.brushColorMode !== undefined) {
          brushColorMode = sd.brushColorMode;
          whiteBrushMode = (brushColorMode === 1);
        } else {
          whiteBrushMode = sd.whiteBrushMode !== undefined ? sd.whiteBrushMode : false;
          brushColorMode = whiteBrushMode ? 1 : 0;
        }
        if (sd.customBrushColor && Array.isArray(sd.customBrushColor) && sd.customBrushColor.length >= 3 && typeof customBrushColor !== 'undefined') {
          customBrushColor[0] = sd.customBrushColor[0];
          customBrushColor[1] = sd.customBrushColor[1];
          customBrushColor[2] = sd.customBrushColor[2];
        }
        phasorVel = sd.phasorVel !== undefined ? sd.phasorVel : 0;
        explodeStart = sd.explodeStart !== undefined ? sd.explodeStart : 0;
        explodeEnd = sd.explodeEnd !== undefined ? sd.explodeEnd : 0;
        targetflyBrushType = sd.targetflyBrushType !== undefined ? sd.targetflyBrushType : 0;
        targetmainStrokeDir = sd.targetmainStrokeDir !== undefined ? sd.targetmainStrokeDir : 0;
        brushDir = sd.brushDir !== undefined ? sd.brushDir : 0;
        ctlNoise = sd.ctlNoise !== undefined ? sd.ctlNoise : 1.0;
        if (sd.brushMode === 4) {
          penSketchNoiseBase = sd.penSketchNoiseBase !== undefined ? sd.penSketchNoiseBase : 0.5;
          penSketchStrokeWeight = sd.penSketchStrokeWeight !== undefined ? sd.penSketchStrokeWeight : 0.8;
        }
        brushPaintCtlNoisebyFrame = sd.brushPaintCtlNoisebyFrame !== undefined ? sd.brushPaintCtlNoisebyFrame : 0.5;
        brushPaintInterpolationOffset = sd.brushPaintInterpolationOffset !== undefined ? sd.brushPaintInterpolationOffset : 0;
        brushPaintOldRInitial = sd.brushPaintOldRInitial !== undefined ? sd.brushPaintOldRInitial : 0.5;
        initialSize = sd.initialSize;
        spraySize = sd.spraySize;
        interpolationSteps = sd.step;
        spraySteps = sd.step2;
        randStep = sd.randStep;
        maxUpdates = sd.maxUpdates;
        pathRotation = sd.pathRotation;
        springForce = sd.spring !== undefined ? sd.spring : 0.6;
        dampingForce = sd.friction !== undefined ? sd.friction : 0.5;
        baseBrushSize = sd.baseBrushSize || 1.0;
        if (sd.expectedStrokeLength !== undefined) {
          expectedStrokeLength = sd.expectedStrokeLength;
        } else {
          if (brushMode === 3) {
            expectedStrokeLength = 100;
          } else {
            expectedStrokeLength = 100;
          }
        }
        if (sd.effect3Brightness !== undefined) {
          effect3Brightness = sd.effect3Brightness;
        } else {
          effect3Brightness = 0.7;
        }
        if (sd.indiffusionStrength !== undefined) {
          indiffusionStrength = sd.indiffusionStrength;
        } else {
          indiffusionStrength = 0.3;
        }
        if (sd.whiteMaxOpacity !== undefined) {
          currentWhiteMaxOpacity = sd.whiteMaxOpacity;
        } else {
          currentWhiteMaxOpacity = 0.95;
        }
        if (sd.hueShift !== undefined) {
          currentHueShift = sd.hueShift;
        } else {
          currentHueShift = 0.0;
        }
        if (sd.satShift !== undefined) {
          currentSatShift = sd.satShift;
        } else {
          currentSatShift = 0.0;
        }
        if (sd.briShift !== undefined) {
          currentBriShift = sd.briShift;
        } else {
          currentBriShift = 0.0;
        }
        if (sd.keyBlendMode !== undefined) {
          keyBlendMode = sd.keyBlendMode;
        } else {
          keyBlendMode = 0;
        }
        if (sd.useSpectralMix !== undefined) {
          useSpectralMix = sd.useSpectralMix;
        } else {
          useSpectralMix = false;
        }
        if (brushMode === 4) {}
        if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
        if (sd.forceMapParams) {
          const fm = sd.forceMapParams;
          randomSeeds[0] = fm.randomSeed1;
          randomSeeds[1] = fm.randomSeed2;
          randomSeeds[2] = fm.randomSeed3;
          randomSeeds[3] = fm.randomSeed4;
          scales[0] = fm.scale1;
          scales[1] = fm.scale2;
          scales[2] = fm.scale3;
          amplitudes[0] = fm.amplitude1;
          amplitudes[1] = fm.amplitude2;
          amplitudes[2] = fm.amplitude3;
          phases[0] = fm.phase1;
          phases[1] = fm.phase2;
          phases[2] = fm.phase3;
          vortexScales[0] = fm.vortexScale1;
          vortexScales[1] = fm.vortexScale2;
          clusterScales[0] = fm.clusterScale1;
          clusterScales[1] = fm.clusterScale2;
          drawMap();
        } else {
          if (typeof generateRandomForceMap === 'function') {
            generateRandomForceMap();
          }
        }
        if (sd.drawingSeed) {
          drawingSeed = sd.drawingSeed;
          randomSeed(sd.drawingSeed);
          noiseSeed(sd.drawingSeed);
        } else {}
      }
      currentSize = initialSize;
      brushSize = currentSize;
      brushSizeNow = brushSize;
      isFirstDraw = 0;
      x = simulatedMouseX;
      y = simulatedMouseY;
      brushAccelX = 0;
      brushAccelY = 0;
      brushSpeed = 0;
      oldR = 0;
      gobalSize = 0;
      isDrawing = true;
      isCountingDown = false;
      updateCount = 0;
      isNewStroke = true;
      strokeComplete = false;
      drawingFrameCount = 0;
      startX = simulatedMouseX;
      startY = simulatedMouseY;
      pathPoints = [{
        x: simulatedMouseX,
        y: simulatedMouseY
      }];
      hasPath = true;
      simulatedMousePressed = true;
      // Reset playback pressure — will be updated per-frame from "md" events
      if (inkPressed) window._playbackPenPressure = -1; // 筆劃開始，等 md 事件帶壓力值
      updateDrawingOnBuffer(newBufferBlack, 1.0);
      crandomDebugger.checkpoint('播放_mousePressed_結束', 'mousePressed');
      break;
    case 'md':
    case 'mouseDragged':
      if (typeof window.playbackMouseDraggedCount !== 'undefined') {
        window.playbackMouseDraggedCount++;
      }
      simulatedMouseX = event.x + (typeof playbackOffsetX !== 'undefined' ? playbackOffsetX : 0);
      simulatedMouseY = event.y + (typeof playbackOffsetY !== 'undefined' ? playbackOffsetY : 0);
      // Restore pen pressure from recording (只有 inkPressed=true 時才套用)
      if (inkPressed && event.p !== undefined) {
        window._playbackPenPressure = event.p; // 存的就是原始 force，draw loop 直接用門檻判斷
      }
      break;
    case 'mr':
    case 'mouseReleased':
      if (inkPressed) window._playbackPenPressure = -1; // 筆已放開
      const randomCountAtStart = crandom.getCount();
      const releaseEventTime = event.t !== undefined ? event.t : event.time;
      if (typeof playbackLastStrokeEndTime !== 'undefined') {
        playbackLastStrokeEndTime = millis();
      }
      if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
        playbackLastStrokeEndEventTime = releaseEventTime;
      }
      if (typeof playbackStrokeIndex !== 'undefined') {
        playbackStrokeIndex++;
      }
      crandomDebugger.checkpoint('播放_mouseReleased', 'mouseReleased');
      const playbackRandomCount = crandom.getCount();
      const mouseReleasedRandomCalls = playbackRandomCount - randomCountAtStart;
      const currentStrokeNumber = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
      const totalStrokes = recordingData && recordingData.events ?
        recordingData.events.filter(e => {
          const eventType = e.m || e.type;
          return eventType === 'mr' || eventType === 'mouseReleased';
        }).length :
        '?';
      const totalDrawLoops = window.drawLoopCount || 0;
      const totalMouseDragged = window.playbackMouseDraggedCount || 0;
      console.log(`🎬 播放 [第 ${currentStrokeNumber}/${totalStrokes} 筆] | Draw: ${totalDrawLoops} | Seed: ${playbackRandomCount}`);
      window.drawLoopCount = 0;
      window.playbackMouseDraggedCount = 0;
      window.playbackMultiEventFrames = 0;
      window.playbackDelayedReleaseCount = 0;
      crandomDebugger.saveStroke('playback', currentStrokeNumber);
      crandomDebugger.compareStroke(currentStrokeNumber);
      simulatedMouseX = event.x + (typeof playbackOffsetX !== 'undefined' ? playbackOffsetX : 0);
      simulatedMouseY = event.y + (typeof playbackOffsetY !== 'undefined' ? playbackOffsetY : 0);
      simulatedMousePressed = false;
      if (!isCountingDown) {
        isCountingDown = true;
        updateCount = 0;
        if (typeof countdownStartTime !== 'undefined') {
          countdownStartTime = millis();
        }
        if (typeof wasCountingDownLastFrame !== 'undefined') {
          wasCountingDownLastFrame = true;
        }
        logArt('playback', 'Starting countdown', {
          MaxUpdates: maxUpdates
        });
      }
      logArt('playback', 'Stroke reproduction complete', {
        FinalSize: currentSize.toFixed(2),
        CountdownStatus: isCountingDown ? 'In progress' : 'Not started'
      });
      break;
    case 'md':
    case 'mouseDragged':
      if (!simulatedMousePressed) {
        simulatedMousePressed = true;
      } else {
        simulatedPMouseX = simulatedMouseX;
        simulatedPMouseY = simulatedMouseY;
      }
      simulatedMouseX = event.x + (typeof playbackOffsetX !== 'undefined' ? playbackOffsetX : 0);
      simulatedMouseY = event.y + (typeof playbackOffsetY !== 'undefined' ? playbackOffsetY : 0);
      break;
    case 'kp':
    case 'keyPressed':
      const k = event.key;
      if (k === ' ') {} else if (k === '1' || k === 'ㄅ') {
        brushMode = 1;
      } else if (k === '2' || k === 'ㄉ') {
        brushMode = 2;
      } else if (k === '3' || k === 'ˇ') {
        brushMode = 3;
      } else if (k === '4') {
        brushMode = 4;
      } else if (k === 'r' || k === 'R') {
        useSharpen = 3;
        updateButtonStyles();
        logArt('playback', '⌨️ Simulate key: R', {
          'Effect': 'Wet Ink'
        });
      } else if (k === 'p' || k === 'P') {} else if (k === 'o' || k === 'O') {
        logArt('playback', '⌨️ Simulate key: O', {
          'Loop toggle': 'Ignored during playback'
        });
      }
      break;
    case 'ec':
    case 'effectControl':
      const action = event.action;
      if (action === 'scan-global' || action === 'scan-current') {
        const scanMode = action === 'scan-global' ? 'GLOBAL' : 'EACH';
        const shapeTypeValue = event.shapeType !== undefined ? event.shapeType : null;
        const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
        const bugsSizeValue = event.bugsSize !== undefined ? event.bugsSize : 10.0;
        if (typeof window !== 'undefined') {
          window.bugsSize = bugsSizeValue;
          const bugsSizeSlider = document.getElementById('bugs-size');
          const bugsSizeValueDisplay = document.getElementById('bugs-size-value');
          if (bugsSizeSlider && bugsSizeValueDisplay) {
            bugsSizeSlider.value = bugsSizeValue;
            bugsSizeValueDisplay.textContent = bugsSizeValue;
          }
        }
        const scanEvent = {
          action: action,
          shapeType: shapeTypeValue,
          bugsSize: bugsSizeValue,
          scanBounds: (action === 'scan-current' && event.scanBounds) ? {
            ...event.scanBounds
          } : null,
          scanSeed: scanSeed,
          recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
          targetPoints: event.targetPoints || null,
          eventTime: event.t
        };
        let scanGlobalCount = null;
        let scanCurrentCount = null;
        if (typeof window !== 'undefined') {
          if (!window.pendingEffectControlScanQueue) {
            window.pendingEffectControlScanQueue = [];
          }
          window.pendingEffectControlScanQueue.push(scanEvent);
          window.lastEffectControlProcessTime = millis();
          if (action === 'scan-global') {
            window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
          } else if (action === 'scan-current') {
            window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
          }
          scanGlobalCount = window._scanGlobalPlaybackCount || 0;
          scanCurrentCount = window._scanCurrentPlaybackCount || 0;
        } else {
          if (typeof window !== 'undefined') {
            window.bugsSize = bugsSizeValue;
          }
          const savedSeed = seed;
          if (scanSeed) {
            randomSeed(scanSeed);
            noiseSeed(scanSeed);
          }
          if (typeof scanAndMarkDarkPoints === 'function') {
            if (action === 'scan-global') {
              scanAndMarkDarkPoints(null, null, shapeTypeValue);
            } else if (action === 'scan-current') {
              const scanBounds = event.scanBounds || null;
              scanAndMarkDarkPoints(null, scanBounds, shapeTypeValue);
            }
          }
          if (savedSeed) {
            randomSeed(savedSeed);
            noiseSeed(savedSeed);
          }
        }
        logArt('playback', '✨ Effect Control: Scan (queued)', {
          Mode: scanMode,
          ShapeType: shapeTypeValue !== null ? shapeTypeValue : 'Unknown',
          BugsSize: bugsSizeValue,
          Action: action,
          Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
          GlobalCount: scanGlobalCount,
          CurrentCount: scanCurrentCount
        });
      } else if (action === 'scan-random') {
        const shapeTypeValue = event.shapeType !== undefined ? event.shapeType : null;
        const bugsSizeValue = event.bugsSize !== undefined ? event.bugsSize : 10.0;
        if (typeof window !== 'undefined') {
          window.bugsSize = bugsSizeValue;
          const bugsSizeSlider = document.getElementById('bugs-size');
          const bugsSizeValueDisplay = document.getElementById('bugs-size-value');
          if (bugsSizeSlider && bugsSizeValueDisplay) {
            bugsSizeSlider.value = bugsSizeValue;
            bugsSizeValueDisplay.textContent = bugsSizeValue;
          }
        }
        if (typeof generateRandomBitePointsAnywhere === 'function') {
          generateRandomBitePointsAnywhere(10, shapeTypeValue);
        }
        logArt('playback', '✨ Effect Control: Scan RANDOM', {
          ShapeType: shapeTypeValue !== null ? shapeTypeValue : 'Unknown',
          BugsSize: bugsSizeValue
        });
      } else if (action === 'metallic-strength') {
        const strengthValue = event.value !== undefined ? event.value : 85;
        if (typeof window !== 'undefined') {
          window.metallicStrength = strengthValue / 100;
        }
        const strengthSlider = document.getElementById('metallic-strength');
        const strengthValueDisplay = document.getElementById('metallic-strength-value');
        if (strengthSlider && strengthValueDisplay) {
          strengthSlider.value = strengthValue;
          strengthValueDisplay.textContent = strengthValue;
        }
        logArt('playback', '✨ Effect Control: Metallic Strength', {
          Value: strengthValue
        });
      } else if (action === 'bugs-size') {
        const bugsSizeValue = event.value !== undefined ? event.value : 10;
        const bugsSizeSlider = document.getElementById('bugs-size');
        const bugsSizeValueDisplay = document.getElementById('bugs-size-value');
        if (bugsSizeSlider && bugsSizeValueDisplay) {
          bugsSizeSlider.value = bugsSizeValue;
          window.bugsSize = bugsSizeValue;
          bugsSizeValueDisplay.textContent = bugsSizeValue;
          logArt('system', '🐛 Bugs Size updated during playback', {
            Value: bugsSizeValue
          });
        }
      } else if (action === 'metallic-flow') {
        const flowValue = event.value !== undefined ? event.value : 200;
        if (typeof window !== 'undefined') {
          window.metallicFlowSpeed = flowValue / 100;
        }
        const flowSlider = document.getElementById('metallic-flow');
        const flowValueDisplay = document.getElementById('metallic-flow-value');
        if (flowSlider && flowValueDisplay) {
          flowSlider.value = flowValue;
          flowValueDisplay.textContent = flowValue;
        }
        logArt('playback', '✨ Effect Control: Metallic Flow', {
          Value: flowValue
        });
      } else if (action === 'metal-tint') {
        const tintType = event.tintType || 'copper';
        const tintButtons = {
          'gold': [0.88, 0.72, 0.52],
          'silver': [0.75, 0.75, 0.75],
          'copper': [0.72, 0.50, 0.35],
          'rose': [0.88, 0.65, 0.70],
          'black': [0.15, 0.12, 0.08],
          'diamond': [0.95, 0.95, 1.0]
        };
        if (typeof window !== 'undefined' && typeof window.metallicTint === 'undefined') {
          window.metallicTint = [0.72, 0.50, 0.35];
        }
        if (tintButtons[tintType]) {
          if (typeof window !== 'undefined') {
            window.metallicTint = [...tintButtons[tintType]];
          }
          const btnId = `metal-${tintType}`;
          const btn = document.getElementById(btnId);
          if (btn) {
            document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          }
          logArt('playback', '✨ Effect Control: Metal Tint', {
            Tint: tintType,
            RGB: `[${tintButtons[tintType].join(', ')}]`,
            Applied: true
          });
        } else {
          logArt('playback', '⚠️ Effect Control: Metal Tint (Unknown)', {
            Tint: tintType,
            Status: 'Unknown tint type, skipped'
          });
        }
      }
      break;
    case 'flow':
      if (event.action === 'start') {
        if (typeof flowEffectActive !== 'undefined' && flowEffectActive) {
          if (typeof stopFlowEffect === 'function') {
            stopFlowEffect();
          }
          logArt('playback', '🌊 Flow Effect: 強制完成前一個效果');
        }
        window.pendingFlowEvent = {
          blendType: event.blendType,
          flowSeed: event.flowSeed,
          strokeBounds: event.strokeBounds,
          strength: event.strength,
          totalFrames: 0,
          iterations: 0
        };
        window.flowEffectStrokeBounds = event.strokeBounds;
        if (event.strength !== undefined && typeof flowEffectParams !== 'undefined') {
          flowEffectParams.blendVol = event.strength;
        }
        if (typeof flowEffectLastStrokeOnly !== 'undefined') {
          flowEffectLastStrokeOnly = event.lastStrokeOnly || false;
        }
        if (typeof startFlowEffect === 'function') {
          startFlowEffect(event.blendType, event.flowSeed, true);
        }
        logArt('playback', '🌊 Flow Effect: Start (預覽開始)', {
          BlendType: event.blendType,
          Seed: event.flowSeed,
          Bounds: event.strokeBounds ? `[${event.strokeBounds.minX.toFixed(2)}, ${event.strokeBounds.minY.toFixed(2)}, ${event.strokeBounds.maxX.toFixed(2)}, ${event.strokeBounds.maxY.toFixed(2)}]` : 'None'
        });
      } else if (event.action === 'end') {
        const pending = window.pendingFlowEvent;
        if (pending) {
          if (typeof flowEffectTargetFrames !== 'undefined') {
            flowEffectTargetFrames = event.totalFrames || (event.iterations * 3) || 30;
            flowEffectTargetIterations = event.iterations || 10;
          }
          logArt('playback', '🌊 Flow Effect: End (設定目標，等待預覽完成)', {
            BlendType: pending.blendType,
            TargetFrames: event.totalFrames,
            TargetIterations: event.iterations
          });
        }
        window.pendingFlowEvent = null;
      }
      break;
  }
}

function updatePlayback() {
  if (!isPlaying) return;
  const effectControlDelay = 200;
  if (typeof window !== 'undefined') {
    const hasPendingScan = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
    if (window.lastEffectControlProcessTime) {
      const timeSinceLastEffectControl = millis() - window.lastEffectControlProcessTime;
      if (timeSinceLastEffectControl < effectControlDelay) {
        return;
      } else {
        window.lastEffectControlProcessTime = null;
      }
    }
    if (hasPendingScan && !window.lastEffectControlProcessTime) {}
  }
  if (isWaitingToLoop) {
    const waitedTime = millis() - loopWaitStartTime;
    const currentSecond = Math.floor(waitedTime / 1000);
    if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== currentSecond) {}
    if (waitedTime >= loopWaitDuration) {
      if (window.DEBUG_MODE) console.log('✅ 倒数完成，准备重新播放');
      window._lastLoggedWaitSecond = null;
      if (loopToggle === 1) {
        logArt('playback', 'Loop playback', {
          Status: 'Restarting'
        });
        if (easycamEnabled && easycam !== null) {
          const resetCenter = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
            easycamInitialCenter :
            [0, 0, 0];
          const resetDistance = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
            easycamInitialDistance :
            Math.max(width, height) * 1.0;
          easycam.setCenter(resetCenter, 0);
          easycam.setDistance(resetDistance, 0);
          easycamResetting = false;
          logArt('system', '🎥 Camera reset for loop', {
            Center: `[${resetCenter[0].toFixed(2)}, ${resetCenter[1].toFixed(2)}, ${resetCenter[2].toFixed(2)}]`,
            Distance: resetDistance.toFixed(2)
          });
        }
        clearCanvas();
        if (typeof gothicdotss !== 'undefined') {
          gothicdotss = [];
        }
        if (typeof gothicDotIdCounter !== 'undefined') {
          gothicDotIdCounter = 0;
        }
        if (recordingData.randomSeed) {
          randomSeed(recordingData.randomSeed);
          noiseSeed(recordingData.randomSeed);
          if (typeof boidsSeed !== 'undefined') {
            boidsSeed = floor(crandom.random(1, 10000));
          }
        }
        playbackStartTime = millis();
        if (window._fxVirtualTime !== undefined) {
          window._fxVirtualTime = 0;
        }
        currentEventIndex = 0;
        simulatedMousePressed = false;
        simulatedMouseX = hw;
        simulatedMouseY = hh;
        simulatedPMouseX = hw;
        simulatedPMouseY = hh;
        isWaitingToLoop = false;
        drawingFrameCount = 0;
        radColor = 0;
        countdownStartTime = 0;
        wasCountingDownLastFrame = false;
        if (typeof pathPoints !== 'undefined') {
          pathPoints = [];
        }
        if (typeof pathPointsCache !== 'undefined') {
          pathPointsCache = null;
        }
        if (typeof hasPath !== 'undefined') {
          hasPath = false;
        }
        if (typeof layerBlurMaxValues !== 'undefined') {
          layerBlurMaxValues = {
            0: 0,
            40: 0,
            80: 0,
            120: 0
          };
        }
        if (typeof layerBlurValues !== 'undefined') {
          layerBlurValues = {
            0: 0,
            40: 0,
            80: 0,
            120: 0
          };
        }
        if (typeof totalStrokeCount !== 'undefined') {
          totalStrokeCount = 0;
        }
        if (window._initialConsoleFromURL === true && typeof window.screenText !== 'undefined') {
          window.screenText = true;
          const screenTextToggle = typeof document !== 'undefined' && document.getElementById ? document.getElementById('screen-text-toggle') : null;
          if (screenTextToggle) {
            screenTextToggle.checked = true;
          }
        }
        window.showStrokeDivider = true;
        logArt('playback', '🔁 Loop restart', {
          Status: 'New round playback'
        });
      } else {
        logArt('playback', '⏹️ Playback ended', {
          Status: 'Single playback complete, no more loops'
        });
        stopPlayback();
      }
    }
    return;
  }
  if (currentEventIndex >= recordingData.events.length && !isWaitingToLoop) {
    if (simulatedMousePressed) {
      simulatedMousePressed = false;
      if (!isCountingDown) {
        isCountingDown = true;
        updateCount = 0;
        needsComposite = true;
      }
    }
    if (isCountingDown) {
      if (updateCount < maxUpdates) {
        return;
      }
    }
    if (isDrawing) {
      return;
    }
    console.log('🔍 播放结束检查:', {
      loopToggle: loopToggle,
      loopToggleType: typeof loopToggle,
      loopWaitDuration: loopWaitDuration,
      loopWaitDurationType: typeof loopWaitDuration,
      isWaitingToLoop: isWaitingToLoop
    });
    // fxhash debug: 記錄 playback 結束時的狀態
    if (window._fxDebug) {
      window._fxDebug.playbackEndFrame = window._fxDebug.totalFrames;
      window._fxDebug.playbackEndVirtualTime = window._fxVirtualTime || 0;
      window._fxDebug.playbackEndRealTime = performance.now() - window._fxDebug.startTime;
      window._fxDebug.eventsProcessed = currentEventIndex;
      window._fxDebug.totalEvents = recordingData ? recordingData.events.length : 0;
      console.log('[fxhash-debug] Playback ended:', JSON.stringify(window._fxDebug));
    }
    if (loopToggle === 1) {
      if (typeof window.screenText !== 'undefined') {
        window.screenText = false;
      }
      const screenTextToggle = typeof document !== 'undefined' && document.getElementById ? document.getElementById('screen-text-toggle') : null;
      if (screenTextToggle) {
        screenTextToggle.checked = false;
      }
      window.showStrokeDivider = false;
      // fxhash capture: 回放完成 → 等 3s（feedback 充分累積）→ draw() 內從 screenBuffer 定格到 2D canvas → 等 0.5s → $fx.preview()
      if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function' && !window._fxPreviewTriggered) {
        window._fxPreviewTriggered = true;
        function _fxDoCapture() {
          console.log('[fxhash] Forcing final composite + capture...');
          // 強制執行一次 composite 確保 screenBuffer 有最終畫面
          needsComposite = true;
          // 等 500ms 確保 draw() 執行了 composite
          setTimeout(function() {
            window._fxCapturePhase = 1;
            console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
          }, 500);
        }
        if (easycamEnabled && easycam !== null) {
          easycamResetting = true;
          easycamResetStartTime = millis();
          easycamResetStartCenter = [easycam.getCenter()[0], easycam.getCenter()[1], easycam.getCenter()[2]];
          easycamResetStartDistance = easycam.getDistance();
          easycamResetTargetCenter = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
          easycamResetTargetDistance = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
          var _fxCameraWait = easycamResetDuration + 500;
          console.log('[fxhash] Waiting ' + _fxCameraWait + 'ms for camera reset before capture...');
          setTimeout(_fxDoCapture, _fxCameraWait);
        } else {
          _fxDoCapture();
        }
      }
      logArt('playback', 'Playback complete', {
        Status: 'Waiting 30 seconds before loop'
      });
      if (window.DEBUG_MODE) console.log('✅ 开始倒数计时:', {
        loopWaitDuration: loopWaitDuration,
        startTime: millis()
      });
      isWaitingToLoop = true;
      loopWaitStartTime = millis();
    } else {
      logArt('playback', 'Playback complete', {
        Status: 'Single playback complete, stopping immediately'
      });
      if (window.DEBUG_MODE) console.log('❌ loopToggle 不等于 1，停止播放');
      stopPlayback();
    }
    return;
  }
  // fxhash 環境：每幀固定推進 16.67ms（等效 60fps），確保 feedback 累積與本機一致
  var currentTime2;
  if (window._fxVirtualTime !== undefined) {
    window._fxVirtualTime += 16.67;
    currentTime2 = window._fxVirtualTime * playbackSpeed;
  } else {
    currentTime2 = (millis() - playbackStartTime) * playbackSpeed;
  }
  let eventsProcessedThisFrame = 0;
  const maxEventsPerFrame = 100;
  let mouseDraggedProcessedThisFrame = 0;
  const maxMouseDraggedPerFrame = 1;
  if (typeof window.playbackMultiEventFrames === 'undefined') {
    window.playbackMultiEventFrames = 0;
  }
  let processedMouseDraggedThisFrame = false;
  while (currentEventIndex < recordingData.events.length && eventsProcessedThisFrame < maxEventsPerFrame) {
    if (typeof flowEffectActive !== 'undefined' && flowEffectActive &&
      typeof flowEffectTargetFrames !== 'undefined' && flowEffectTargetFrames > 0) {
      break;
    }
    const event = recordingData.events[currentEventIndex];
    const eventTime = event.t !== undefined ? event.t : event.time;
    const eventType = event.m || event.type;
    const isMousePressed = eventType === 'mp' || eventType === 'mousePressed';
    const isMouseReleased = eventType === 'mr' || eventType === 'mouseReleased';
    const isEffectControl = eventType === 'ec' || eventType === 'effectControl';
    const isFlowEvent = eventType === 'flow';
    const timeDiff = eventTime - currentTime2;
    if (!isEffectControl && !isFlowEvent && eventTime > currentTime2 && currentEventIndex + 1 < recordingData.events.length) {
      const nextEvent = recordingData.events[currentEventIndex + 1];
      const nextEventType = nextEvent.m || nextEvent.type;
      const isNextMousePressed = nextEventType === 'mp' || nextEventType === 'mousePressed';
      if (isNextMousePressed) {
        if (isMouseReleased) {
          if (processedMouseDraggedThisFrame) {
            break;
          }
          simulateEvent(event);
          currentEventIndex++;
          eventsProcessedThisFrame++;
          continue;
        } else {
          currentEventIndex++;
          continue;
        }
      }
    }
    if (eventTime <= currentTime2) {
      const isMouseDragged = eventType === 'md' || eventType === 'mouseDragged';
      if (isMouseDragged && mouseDraggedProcessedThisFrame >= maxMouseDraggedPerFrame) {
        break;
      }
      if (isMouseReleased && processedMouseDraggedThisFrame) {
        if (typeof window.playbackDelayedReleaseCount === 'undefined') {
          window.playbackDelayedReleaseCount = 0;
        }
        window.playbackDelayedReleaseCount++;
        break;
      }
      if (isEffectControl || !isCountingDown || (isCountingDown && simulatedMousePressed)) {
        if (isEffectControl) {
          const action = event.action;
          if (action === 'scan-global' || action === 'scan-current') {
            if (typeof window !== 'undefined') {
              window.lastEffectControlProcessTime = millis();
            }
          }
        }
        simulateEvent(event);
        currentEventIndex++;
        eventsProcessedThisFrame++;
        if (isMouseDragged) {
          mouseDraggedProcessedThisFrame++;
          processedMouseDraggedThisFrame = true;
        }
      } else {
        break;
      }
    } else {
      const isMouseDragged = eventType === 'md' || eventType === 'mouseDragged';
      if (isMouseDragged && mouseDraggedProcessedThisFrame >= maxMouseDraggedPerFrame) {
        break;
      }
      if (isMouseReleased && processedMouseDraggedThisFrame) {
        break;
      }
      if (isEffectControl || isFlowEvent || (isMousePressed && !isCountingDown) || timeDiff < 100) {
        if (isEffectControl) {
          const action = event.action;
          if (action === 'scan-global' || action === 'scan-current') {
            if (typeof window !== 'undefined') {
              window.lastEffectControlProcessTime = millis();
            }
          }
        }
        simulateEvent(event);
        currentEventIndex++;
        eventsProcessedThisFrame++;
        if (isMouseDragged) {
          mouseDraggedProcessedThisFrame++;
          processedMouseDraggedThisFrame = true;
        }
      } else {
        break;
      }
    }
    if (mouseDraggedProcessedThisFrame > 1) {
      window.playbackMultiEventFrames++;
    }
  }
}

function askToContinueRecording() {
  if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
    return;
  }
  const skipDialog = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
    sessionStorage.getItem('pendingSkipContinueDialog') === '1';
  if (skipDialog) {
    if (typeof window !== 'undefined') window.skipContinueRecordingDialog = false;
    sessionStorage.removeItem('pendingSkipContinueDialog');
    if (typeof window !== 'undefined') {
      window.loadedRecordingData = null;
      window.loadedRecordingFileName = null;
    }
    sessionStorage.removeItem('pendingLoadedRecordingData');
    sessionStorage.removeItem('pendingLoadedRecordingFileName');
    return;
  }
  const loadedData = (typeof window !== 'undefined' && window.loadedRecordingData) ?
    window.loadedRecordingData :
    (sessionStorage.getItem('pendingLoadedRecordingData') ?
      JSON.parse(sessionStorage.getItem('pendingLoadedRecordingData')) :
      null);
  const fileName = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
    window.loadedRecordingFileName :
    (sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
  if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
    return;
  }
  setTimeout(() => {
    const userChoice = confirm(
      `播放完成！\n\n` +
      `已播放：${loadedData.events.length} 个事件\n` +
      `文件：${fileName}\n\n` +
      `是否要继续录制（追加新内容）？\n\n` +
      `点击"确定"继续录制\n` +
      `点击"取消"结束`
    );
    if (userChoice) {
      startRecordingFromLoaded(loadedData, fileName);
      if (typeof window !== 'undefined') {
        window.loadedRecordingData = null;
        window.loadedRecordingFileName = null;
      }
      sessionStorage.removeItem('pendingLoadedRecordingData');
      sessionStorage.removeItem('pendingLoadedRecordingFileName');
    } else {
      if (typeof window !== 'undefined') {
        window.loadedRecordingData = null;
        window.loadedRecordingFileName = null;
      }
      sessionStorage.removeItem('pendingLoadedRecordingData');
      sessionStorage.removeItem('pendingLoadedRecordingFileName');
    }
  }, 500);
}

function startRecordingFromLoaded(loadedData, originalFileName = '') {
  if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
    logArt('system', '⚠️ No events in loaded recording, starting fresh recording', {
      Status: 'Warning'
    });
    startRecording();
    return;
  }
  const lastEvent = loadedData.events[loadedData.events.length - 1];
  const lastEventTime = lastEvent.t !== undefined ? lastEvent.t : (lastEvent.time !== undefined ? lastEvent.time : 0);
  isRecording = true;
  recordingStartTime = millis();
  lastStrokeEndTime = 0;
  accumulatedPauseTime = 0;
  isFirstStroke = true;
  radColor = 0;
  recordingData = {
    ...loadedData,
    events: [...loadedData.events],
    strokes: loadedData.strokes ? [...loadedData.strokes] : [],
    timeOffset: lastEventTime,
    canvasSize: {
      width: width,
      height: height
    },
    canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
    originalFileName: originalFileName,
    continuedAt: new Date().toISOString()
  };
  const recordingSeed = seed;
  randomSeed(recordingSeed);
  noiseSeed(recordingSeed);
  logArtSeparator('🔄 Continue Recording from Loaded File');
  logArt('recording', '📂 Loaded recording data', {
    OriginalFile: originalFileName || 'Unknown',
    ExistingEvents: `${loadedData.events.length} events`,
    TimeOffset: `${lastEventTime}ms`,
    Status: 'Ready to continue recording'
  });
  if (typeof updateButtonStates === 'function') {
    updateButtonStates();
  }
}

function restoreCanvasSize(targetWidth, targetHeight) {
  if (!targetWidth || !targetHeight) {
    logArt('system', '⚠️ No canvas size info in recording', {
      Status: 'Warning'
    });
    return false;
  }
  if (width === targetWidth && height === targetHeight) {
    logArt('system', '✅ Canvas size matches recording', {
      Width: `${targetWidth}px`,
      Height: `${targetHeight}px`
    });
    return false;
  }
  logArt('system', '🔄 Canvas size mismatch detected', {
    Current: `${width}x${height}`,
    Target: `${targetWidth}x${targetHeight}`,
    Action: 'Auto-reloading page to restore canvas size'
  });
  sessionStorage.setItem('pendingCanvasWidth', targetWidth.toString());
  sessionStorage.setItem('pendingCanvasHeight', targetHeight.toString());
  sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
  sessionStorage.setItem('shouldAutoPlay', 'true');
  logArt('system', '🔄 Reloading page to restore canvas size...', {
    TargetSize: `${targetWidth}x${targetHeight}`
  });
  window.location.reload();
  return true;
}
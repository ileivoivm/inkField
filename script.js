function _j1(_j1502, _j1503) {
var _j195 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1502];
var _j196 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1503];
if (_j195 && _j196 && typeof createShader === 'function') {
return createShader(_j195, _j196);
}
return window['loadShader'](_j1502, _j1503);
}
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
const _j197 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j197,
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
const _j198 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j198.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j198.forEach((_j628, _j306) => {
console.log(`[${_j628.count}] args: [${_j628.args.join(', ')}]`);
if (_j628.caller) {
console.log(`    位置: ${_j628.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j199 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j199 > 0 ? '+' : ''}${_j199}`);
console.log('═══════════════════════════════════════');
return _j199;
}
}
class _j0 {
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
const _j200 = playback.totalCount - recording.totalCount;
const percent = ((_j200 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j200) < 50 ? '✅' : Math.abs(_j200) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j200 > 0 ? '+' : ''}${_j200} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j201 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j202 = Array.from(_j201).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j203 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j203 === -1) return 0;
if (indexA === -1) return 1;
if (_j203 === -1) return -1;
return indexA - _j203;
});
let _j204 = 0;
const _j205 = [];
for (const stage of _j202) {
const recCount = recDeltas.get(stage) || 0;
const _j206 = playDeltas.get(stage) || 0;
const _j199 = _j206 - recCount;
_j204 += _j199;
if (Math.abs(_j199) > 0) {
_j205.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j206,
difference: _j199
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j205.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j207 = _j205.filter(d => Math.abs(d.difference) > 50);
if (_j207.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j207.length); i++) {
const d = _j207[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j208 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j209 = checkpoints[i];
const _j210 = checkpoints[i + 1];
if (_j210) {
const _j211 = `${_j209.name} → ${_j210.name}`;
const _j212 = _j210.count - _j209.count;
_j208.set(_j211, _j212);
}
}
return _j208;
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
window.crandomDebugger = new _j0();
const _j213 = [{
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
function _j2() {
const _j214 = {};
_j213.forEach(color => {
_j214[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j214;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j215 = r > 20;
const _j216 = g > 20;
const _j217 = b > 20;
if (_j215 && _j216 && _j217) return 'rgb';
if (_j215 && _j216) return 'rg';
if (_j215 && _j217) return 'rb';
if (_j216 && _j217) return 'gb';
if (_j215) return 'r';
if (_j216) return 'g';
if (_j217) return 'b';
return 'rgb';
}
function _j4() {
let _j218 = '// ============================================\n';
_j218 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j218 += '// ============================================\n';
_j213.forEach(color => {
const [r, g, b] = color.rgb;
const _j219 = `COLOR_${color.name.toUpperCase()}`;
_j218 += `const vec3 ${_j219} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j218 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j218;
}
function _j5() {
let _j218 = '';
_j213.forEach((color, _j306) => {
const _j219 = `COLOR_${color.name.toUpperCase()}`;
if (_j306 === 0) {
_j218 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j218 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j218 += `        brushColor = ${_j219};\n`;
});
_j218 += `    }\n`;
return _j218;
}
function _j6() {
return _j213.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j213.find(c => c.id === id);
}
function _j8(name) {
return _j213.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j213,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j220 = null;
let _j221 = 0;
const _j222 = 2000;
function _j9(_j524 = 120, _j1504 = 12, _j1505 = 10, _j1506 = 5) {
const _j223 = Math.min(width, _j222);
const _j224 = Math.min(height, _j222);
const _j225 = (width > _j222 || height > _j222);
randomSeed(seed);
const _j226 = _j10(_j524, _j1506);
const _j227 = createGraphics(_j223, _j224, P2D);
const _j228 = createGraphics(_j223, _j224, P2D);
for (let i = -_j524; i < _j223 + _j524; i += _j223 / 500) {
for (let j = -_j524; j < _j224 + _j524; j += _j1504) {
_j227.image(_j226, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1505);
}
}
_j226.remove();
if (doSpotNoise) {
padfactor = 300;
_j228.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j223)
y = random(_j224)
_j228.push()
_j228.strokeWeight(random(1, 2))
_j228.stroke(0, random(10, 250))
_j228.noFill();
_j228.bezier(
random(-padfactor, _j223 + padfactor),
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j223 + padfactor),
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j223 + padfactor),
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j223 + padfactor),
random(-padfactor, _j224 + padfactor)
);
_j228.pop();
}
_j227.blendMode(DIFFERENCE);
_j227.image(_j228, 0, 0, _j223, _j224);
_j228.remove();
}
if (_j225) {
const _j229 = createGraphics(width, height);
_j229.image(_j227, 0, 0, width, height);
_j227.remove();
return _j229;
}
return _j227;
}
function _j10(_j1507 = 64, _j1506 = 0.5) {
const _j226 = createGraphics(_j1507, _j1507);
_j226.pixelDensity(1);
_j226.noSmooth();
_j226.clear();
_j226.noFill();
_j226.translate(_j1507 / 2, _j1507 / 2);
_j226.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j230 = 0.5 + crandom.random(0, 1) * 0.5;
const _j231 = pow(_j230, _j1506) * 255;
_j226.stroke(_j231, _j231, _j231, 255);
const radius = crandom.random() * _j1507 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j226.point(x, y);
}
_j226.resetMatrix();
return _j226;
}
let _j232 = [];
function _j11(x, y, size, seed, shapeType = null) {
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
return _j13(size * 1.3, seed);
case 1:
return _j14(size, seed);
case 2:
return _j15(size, seed);
case 3:
return _j16(size, seed);
default:
return _j12(size, seed);
}
}
function _j12(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const circles = [];
const _j233 = 8;
const _j234 = [];
for (let i = 0; i < _j233; i++) {
_j234.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j235 = floor(_j234[0].numCirclesRand);
for (let i = 0; i < _j235; i++) {
const _j236 = _j234[i];
circles.push({
x: cos(_j236.angle) * _j236.distance,
y: sin(_j236.angle) * _j236.distance,
radius: _j236.circleSize
});
}
return {
type: 'cluster',
circles
};
}
function _j13(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j237 = [];
const _j238 = 3;
const _j239 = 48;
const _j234 = [];
const _j240 = crandom.random(1, 4);
const _j241 = crandom.random(0.4, 0.6);
const _j242 = floor(_j240);
for (let _j243 = 0; _j243 < _j238; _j243++) {
const _j244 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j243 * 500
};
_j234.push(_j244);
}
for (let _j243 = 0; _j243 < _j242; _j243++) {
const _j244 = _j234[_j243];
const offsetX = _j244.offsetX;
const offsetY = _j244.offsetY;
const layerRotation = _j244.layerRotation;
const sizeVariation = _j244.sizeVariation;
const _j245 = size * sizeVariation;
const _j246 = floor(_j244.numVerticesRand);
const noiseOffset = _j244.noiseOffset;
const _j247 = [];
for (let i = 0; i < _j246; i++) {
const angle = (i / _j246) * TWO_PI;
const _j248 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j249 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j250 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j251 = _j248 * 0.5 + _j249 * 0.3 + _j250 * 0.2;
const radius = _j245 * (0.4 + _j251 * _j241);
const _j252 = cos(angle) * radius;
const _j253 = sin(angle) * radius;
_j247.push({
x: _j252,
y: _j253
});
}
const _j254 = [];
for (let i = 0; i < _j247.length; i++) {
const _j255 = _j247[(i - 1 + _j247.length) % _j247.length];
const _j256 = _j247[i];
const _j210 = _j247[(i + 1) % _j247.length];
_j254.push({
x: (_j255.x + _j256.x * 2 + _j210.x) / 4,
y: (_j255.y + _j256.y * 2 + _j210.y) / 4
});
}
for (let v of _j254) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j257 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j237.push({
x: rotatedX + offsetX,
y: _j257 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j237
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j237 = [];
const _j238 = 3;
const _j234 = [];
const _j240 = crandom.random(1, 4);
const _j241 = crandom.random(0.15, 0.35);
const _j242 = floor(_j240);
let rotation = crandom.random(TWO_PI);
for (let _j243 = 0; _j243 < _j238; _j243++) {
const _j244 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j243 * 500
};
_j234.push(_j244);
}
for (let _j243 = 0; _j243 < _j242; _j243++) {
const _j244 = _j234[_j243];
const offsetX = _j244.offsetX;
const offsetY = _j244.offsetY;
const layerRotation = rotation + _j244.layerRotationOffset;
const sizeVariation = _j244.sizeVariation;
const _j245 = size * sizeVariation;
const lengthRatio = _j244.lengthRatio;
const _j258 = _j245 * lengthRatio;
const stripWidth = _j245 * _j244.stripWidth;
const _j246 = floor(_j244.numVerticesRand);
const noiseOffset = _j244.noiseOffset;
const _j247 = [];
for (let i = 0; i < _j246; i++) {
let _j252, _j253;
if (i < _j246 / 2) {
const _j259 = (i / (_j246 / 2));
_j252 = (_j259 - 0.5) * _j258;
const _j260 = noise(_j259 * 1.5 + noiseOffset, _j243 * 50);
_j253 = -stripWidth / 2 + (_j260 - 0.5) * stripWidth * _j241;
} else {
const _j259 = ((_j246 - 1 - i) / (_j246 / 2));
_j252 = (_j259 - 0.5) * _j258;
const _j260 = noise(_j259 * 1.5 + noiseOffset, 100 + _j243 * 50);
_j253 = stripWidth / 2 + (_j260 - 0.5) * stripWidth * _j241;
}
_j247.push({
x: _j252,
y: _j253
});
}
const _j254 = [];
for (let i = 0; i < _j247.length; i++) {
const _j255 = _j247[(i - 1 + _j247.length) % _j247.length];
const _j256 = _j247[i];
const _j210 = _j247[(i + 1) % _j247.length];
_j254.push({
x: (_j255.x + _j256.x * 2 + _j210.x) / 4,
y: (_j255.y + _j256.y * 2 + _j210.y) / 4
});
}
for (let v of _j254) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j257 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j237.push({
x: rotatedX + offsetX,
y: _j257 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j237
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j237 = [];
const _j261 = 2;
const _j262 = 30;
const _j263 = 8;
const _j264 = 300;
const _j234 = [];
const _j265 = crandom.random(1, 3);
const _j266 = floor(_j265);
for (let _j267 = 0; _j267 < _j261; _j267++) {
const _j268 = {
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
for (let step = 0; step < _j262; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j268.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j264; i++) {
_j268.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j234.push(_j268);
}
for (let _j267 = 0; _j267 < _j266; _j267++) {
const _j268 = _j234[_j267];
let branchAngle = _j268.branchAngle;
let branchOffsetX = _j268.branchOffsetX;
let branchOffsetY = _j268.branchOffsetY;
let _j269 = _j268.numLRand > 0.2 ? 1 : 2;
let _j270 = floor(_j268.numStepsRand) * _j269;
let stepSize = _j268.stepSize;
let noiseScale = _j268.noiseScale;
let noiseStrength = _j268.noiseStrength;
let thickness = _j268.thickness;
let pathPoints = [];
let _j271 = branchOffsetX;
let _j272 = branchOffsetY;
let _j273 = branchAngle;
pathPoints.push({
x: _j271,
y: _j272
});
for (let step = 0; step < _j270; step++) {
const stepRandoms = _j268.stepRandoms[step];
const t = step / _j270;
const _j274 = noise(step * noiseScale, seed * 0.01);
const _j275 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j274 - 0.5) * PI * noiseStrength;
_j273 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j276 = stepSize * stepVariation;
_j271 += cos(_j273) * _j276;
_j272 += sin(_j273) * _j276;
pathPoints.push({
x: _j271,
y: _j272
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j270 - 3) {
const _j277 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j273 + stepRandoms.subBranchAngle;
let _j278 = _j271;
let _j279 = _j272;
for (let _j280 = 0; _j280 < _j277; _j280++) {
const _j281 = noise(step * noiseScale + _j280 * 0.5, seed * 0.01 + 200);
const _j282 = (_j281 - 0.5) * PI * 0.5;
const _j283 = subBranchAngle + _j282;
_j278 += cos(_j283) * stepSize * 0.6;
_j279 += sin(_j283) * stepSize * 0.6;
pathPoints.push({
x: _j278,
y: _j279
});
}
}
}
const _j284 = [];
const _j285 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j286;
if (i === 0) {
const _j210 = pathPoints[i + 1];
_j286 = atan2(_j210.y - point.y, _j210.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j255 = pathPoints[i - 1];
_j286 = atan2(point.y - _j255.y, point.x - _j255.x) + HALF_PI;
} else {
const _j255 = pathPoints[i - 1];
const _j210 = pathPoints[i + 1];
const _j287 = atan2(point.y - _j255.y, point.x - _j255.x);
const _j288 = atan2(_j210.y - point.y, _j210.x - point.x);
_j286 = ((_j287 + _j288) / 2) + HALF_PI;
}
const _j289 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j290 = _j268.thicknessRandoms[Math.min(i, _j268.thicknessRandoms.length - 1)];
const _j291 = thickness * _j289 * _j290;
_j284.push({
x: point.x + cos(_j286) * _j291 / 2,
y: point.y + sin(_j286) * _j291 / 2
});
_j285.push({
x: point.x - cos(_j286) * _j291 / 2,
y: point.y - sin(_j286) * _j291 / 2
});
}
for (let v of _j284) {
_j237.push(v);
}
for (let i = _j285.length - 1; i >= 0; i--) {
_j237.push(_j285[i]);
}
}
return {
type: 'lightning',
vertices: _j237
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j237 = [];
const _j261 = 3;
const _j262 = 75;
const _j263 = 8;
const _j264 = 800;
const _j234 = [];
const _j265 = crandom.random(1, 4);
const _j266 = floor(_j265);
size = size * 3;
for (let _j267 = 0; _j267 < _j261; _j267++) {
const _j268 = {
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
for (let step = 0; step < _j262; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j268.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j264; i++) {
_j268.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j234.push(_j268);
}
for (let _j267 = 0; _j267 < _j266; _j267++) {
const _j268 = _j234[_j267];
let branchAngle = _j268.branchAngle;
let branchOffsetX = _j268.branchOffsetX;
let branchOffsetY = _j268.branchOffsetY;
let _j269 = _j268.numLRand > 0.2 ? 1 : 5;
let _j270 = floor(_j268.numStepsRand) * _j269;
let stepSize = _j268.stepSize;
let noiseScale = _j268.noiseScale;
let noiseStrength = _j268.noiseStrength;
let thickness = _j268.thickness;
let pathPoints = [];
let _j271 = branchOffsetX;
let _j272 = branchOffsetY;
let _j273 = branchAngle;
pathPoints.push({
x: _j271,
y: _j272
});
for (let step = 0; step < _j270; step++) {
const stepRandoms = _j268.stepRandoms[step];
const t = step / _j270;
const _j274 = noise(step * noiseScale, seed * 0.01);
const _j275 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j274 - 0.5) * PI * noiseStrength;
_j273 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j276 = stepSize * stepVariation;
_j271 += cos(_j273) * _j276;
_j272 += sin(_j273) * _j276;
pathPoints.push({
x: _j271,
y: _j272
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j270 - 3) {
const _j277 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j273 + stepRandoms.subBranchAngle;
let _j278 = _j271;
let _j279 = _j272;
for (let _j280 = 0; _j280 < _j277; _j280++) {
const _j281 = noise(step * noiseScale + _j280 * 0.5, seed * 0.01 + 200);
const _j282 = (_j281 - 0.5) * PI * 0.5;
const _j283 = subBranchAngle + _j282;
_j278 += cos(_j283) * stepSize * 0.6;
_j279 += sin(_j283) * stepSize * 0.6;
pathPoints.push({
x: _j278,
y: _j279
});
}
}
}
const _j284 = [];
const _j285 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j286;
if (i === 0) {
const _j210 = pathPoints[i + 1];
_j286 = atan2(_j210.y - point.y, _j210.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j255 = pathPoints[i - 1];
_j286 = atan2(point.y - _j255.y, point.x - _j255.x) + HALF_PI;
} else {
const _j255 = pathPoints[i - 1];
const _j210 = pathPoints[i + 1];
const _j287 = atan2(point.y - _j255.y, point.x - _j255.x);
const _j288 = atan2(_j210.y - point.y, _j210.x - point.x);
_j286 = ((_j287 + _j288) / 2) + HALF_PI;
}
const _j289 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j290 = _j268.thicknessRandoms[Math.min(i, _j268.thicknessRandoms.length - 1)];
const _j291 = thickness * _j289 * _j290;
_j284.push({
x: point.x + cos(_j286) * _j291 / 2,
y: point.y + sin(_j286) * _j291 / 2
});
_j285.push({
x: point.x - cos(_j286) * _j291 / 2,
y: point.y - sin(_j286) * _j291 / 2
});
}
for (let v of _j284) {
_j237.push(v);
}
for (let i = _j285.length - 1; i >= 0; i--) {
_j237.push(_j285[i]);
}
}
return {
type: 'lightning',
vertices: _j237
};
}
function _j17(_j1508, shapeData, px, py, r, g, b, alpha) {
_j1508.fill(r, g, b, alpha);
_j1508.noStroke();
const scale = 1 / _j505;
switch (shapeData.type) {
case 'polygon':
case 'blob':
case 'jagged':
case 'strip':
case 'lightning':
_j1508.beginShape();
for (let v of shapeData.vertices) {
_j1508.vertex(px + v.x * scale, py + v.y * scale);
}
_j1508.endShape(CLOSE);
break;
case 'cluster':
for (let circle of shapeData.circles) {
_j1508.ellipse(
px + circle.x * scale,
py + circle.y * scale,
circle.radius * 2 * scale,
circle.radius * 2 * scale
);
}
break;
}
}
function _j18(_j1509 = null, scanBounds = null, shapeType = null, _j1510 = null) {
let _j292 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j292 = crandom.getCount();
}
const w = _j1509 ? _j1509.width : width;
const h = _j1509 ? _j1509.height : height;
const d = _j1509 ? _j1509.pixelDensity() : pixelDensity();
const _j293 = 20;
const _j294 = 700;
const _j295 = 80;
let _j296 = canvasBackgroundColor[0];
let _j297 = canvasBackgroundColor[1];
let _j298 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j299 = _j1510 && _j1510.length > 0;
if (_j299) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1510.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j300 = _j1509 || window;
_j300.loadPixels();
pixels = _j1509 ? _j1509.pixels : window.pixels;
let _j301 = [];
const step = 4;
let _j302 = _j293;
let _j303 = w - _j293;
let _j304 = _j293;
let _j305 = h - _j293;
for (let y = _j304; y < _j305; y += step) {
for (let x = _j302; x < _j303; x += step) {
let _j306 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j306];
let g = pixels[_j306 + 1];
let b = pixels[_j306 + 2];
let a = pixels[_j306 + 3];
let brightness = r + g + b;
let _j307 = Math.abs(r - _j296) + Math.abs(g - _j297) + Math.abs(b - _j298);
if (a > 100 && brightness < _j294 && _j307 > _j295) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j301.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j301.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j301.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j301.sort((a, b) => a.brightness - b.brightness);
if (_j301.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j301.length} 個），無法生成蟲咬效果`);
return;
}
let _j308 = [];
for (let i = 0; i < _j301.length; i++) {
_j308.push(i);
}
const _j309 = Math.floor(_j301.length * 0.5);
const _j310 = _j308.slice(0, Math.max(_j309, 10));
for (let i = 0; i < 10 && _j310.length > 0; i++) {
const _j311 = [];
let _j312 = 0;
for (let j = 0; j < _j310.length; j++) {
const _j313 = Math.pow(1 - (j / _j310.length), 2);
_j311.push(_j313);
_j312 += _j313;
}
let _j314 = crandom.random(0, _j312);
let _j315 = 0;
let _j316 = 0;
for (let j = 0; j < _j311.length; j++) {
_j316 += _j311[j];
if (_j314 <= _j316) {
_j315 = j;
break;
}
}
const _j317 = _j310.splice(_j315, 1)[0];
targetPoints.push(_j301[_j317]);
}
if (typeof _j621 !== 'undefined' && _j621 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j318 = [];
const _j319 = 30;
const _j320 = 4;
let _j321 = 0;
const _j322 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j323 = [];
const _j234 = [];
const _j324 = [];
for (let _j325 = 0; _j325 < numBites; _j325++) {
const _j326 = [];
for (let _j327 = 0; _j327 < _j322; _j327++) {
_j326.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j234.push(_j326);
_j324.push({
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
let _j328 = 0;
let _j329 = false;
let _j330, _j331, distance;
const _j326 = _j234[i];
const _j332 = _j324[i];
if (_j299) {
const _j236 = _j326[0];
let r = sqrt(_j236.r) * _j319;
let angle = _j236.angle + _j236.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j330 = Math.floor(target.x + offsetX);
_j331 = Math.floor(target.y + offsetY);
_j330 = constrain(_j330, _j293, w - _j293);
_j331 = constrain(_j331, _j293, h - _j293);
_j329 = true;
for (let _j333 of _j323) {
let dist = Math.sqrt(
Math.pow(_j330 - _j333.x, 2) +
Math.pow(_j331 - _j333.y, 2)
);
if (dist < _j320) {
_j329 = false;
break;
}
}
} else {
while (!_j329 && _j328 < _j322) {
const _j236 = _j326[_j328];
let r = sqrt(_j236.r) * _j319;
let angle = _j236.angle;
angle += _j236.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j330 = Math.floor(target.x + offsetX);
_j331 = Math.floor(target.y + offsetY);
_j330 = constrain(_j330, _j293, w - _j293);
_j331 = constrain(_j331, _j293, h - _j293);
let _j317 = 4 * ((_j331 * d) * (w * d) + (_j330 * d));
let _j334 = pixels[_j317];
let _j335 = pixels[_j317 + 1];
let _j336 = pixels[_j317 + 2];
let _j337 = pixels[_j317 + 3];
let _j338 = _j334 + _j335 + _j336;
let _j339 = Math.abs(_j334 - _j296) + Math.abs(_j335 - _j297) + Math.abs(_j336 - _j298);
if (_j337 <= 100 || _j338 >= _j294 || _j339 <= _j295) {
_j329 = false;
_j328++;
if (_j328 >= _j322) {
_j321++;
}
continue;
}
_j329 = true;
for (let _j333 of _j323) {
let dist = Math.sqrt(
Math.pow(_j330 - _j333.x, 2) +
Math.pow(_j331 - _j333.y, 2)
);
if (dist < _j320) {
_j329 = false;
break;
}
}
_j328++;
}
}
let _j340 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j340 *= 1.3;
}
let _j341 = floor(target.x * 1000 + target.y * 333 + _j332.shapeSeedRand);
let _j342 = 0;
let _j343 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j342 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j340, _j341, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j343 = crandom.getCount();
if (!_j332.shapeRandomCount) {
_j332.shapeRandomCount = _j343 - _j342;
}
}
if (_j329) {
let r, g, b;
let _j344 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j344[0] < 0.2 && _j344[1] < 0.15 && _j344[2] < 0.1) {
r = Math.floor(38 + _j332.colorRand1 * (51 - 38));
g = Math.floor(31 + _j332.colorRand2 * (38 - 31));
b = Math.floor(20 + _j332.colorRand3 * (26 - 20));
} else {
r = 230 + _j332.colorRand1 * (255 - 230);
g = 160 + _j332.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j330,
y: _j331,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j340,
shapeData: shapeData
};
_j323.push(point);
_j318.push(point);
}
}
}
_j232 = _j232.concat(_j318);
let _j345 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j318) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j345++;
let _j346 = point.size || 2.5;
let _j347 = map(_j346, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j347
});
}
let _j348 = boidSpawners.slice(-_j345);
if (_j345 > 0) {
let sizeMultipliers = _j348.map(s => s.boidSizeMultiplier);
let _j349 = Math.min(...sizeMultipliers);
let _j350 = Math.max(...sizeMultipliers);
let _j351 = (_j345 / _j318.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j345} 個 Boid Spawners (虫咬點的 ${_j351}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j349.toFixed(2)} ~ ${_j350.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j318.length > 0) {
let _j352 = Infinity;
let _j353 = 0;
for (let point of _j318) {
let brightness = point.r + point.g + point.b;
_j352 = Math.min(_j352, brightness);
_j353 = Math.max(_j353, brightness);
}
if (_j321 > 0) {
console.log(`⚠️ 跳過了 ${_j321} 個不在筆墨區域的點`);
}
}
const _j354 = _j318.length;
if (_j354 > 0) {
_j111('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j354,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j355 = crandom.getCount();
const _j356 = _j355 - _j292;
if (typeof _j629 !== 'undefined' && _j629 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j357 = currentScanEvent.recordedRandomCount;
const _j199 = _j356 - _j357;
const percent = _j357 > 0 ? ((_j199 / _j357) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j199) < 50 ? '✅' : Math.abs(_j199) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j358 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j359 = typeof _j354 === 'number' ? ` | Points:${_j354}` : '';
console.log(`${icon} Scan [${action}] ${_j358} | 差異: ${_j199 > 0 ? '+' : ''}${_j199} (${percent})${_j359}`);
}
} else if (typeof _j621 !== 'undefined' && _j621) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j356;
}
}
}
}
function _j19(_j1511 = 10, shapeType = null) {
const _j293 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1511; i++) {
let x = crandom.random(_j293, w - _j293);
let y = crandom.random(_j293, h - _j293);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j318 = [];
const _j319 = 30;
const _j320 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j323 = [];
for (let i = 0; i < numBites; i++) {
let _j328 = 0;
let _j329 = false;
let _j330, _j331, distance;
while (!_j329 && _j328 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j319;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j330 = Math.floor(target.x + offsetX);
_j331 = Math.floor(target.y + offsetY);
_j330 = constrain(_j330, _j293, w - _j293);
_j331 = constrain(_j331, _j293, h - _j293);
_j329 = true;
for (let _j333 of _j323) {
let dist = Math.sqrt(
Math.pow(_j330 - _j333.x, 2) +
Math.pow(_j331 - _j333.y, 2)
);
if (dist < _j320) {
_j329 = false;
break;
}
}
_j328++;
}
if (_j329) {
let r, g, b;
let _j344 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j344[0] < 0.2 && _j344[1] < 0.15 && _j344[2] < 0.1) {
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
let _j341 = floor(_j330 * 1000 + _j331 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j330, _j331, size, _j341, shapeType);
let point = {
x: _j330,
y: _j331,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j323.push(point);
_j318.push(point);
}
}
}
_j232 = _j232.concat(_j318);
let _j345 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j318) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j345++;
let _j346 = point.size || 2.5;
let _j347 = map(_j346, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j347
});
}
}
if (_j318.length > 0) {
_j111('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j318.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1512 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j505);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j505);
}
const _j360 = _j1512 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j232.length;
if (!_j360) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j232) {
const px = point.x;
const py = point.y;
const _j361 = (point.size || 5) / _j505;
const _j362 = point.x / width;
const _j363 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j362 * 255, _j363 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j362 * 255, _j363 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j361, _j361);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j361, _j361);
}
}
const _j364 = {
pointCount: _j232.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j364;
window.bugsMaskTextureCache = _j364;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j300, _j1509) {
if (_j232.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j365 = _j20();
let _j366 = _j365.dataTexture;
let _j367 = _j365.maskTexture;
_j300.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1509);
window.metallicProgram.setUniform('bugsMask', _j367);
window.metallicProgram.setUniform('bugsData', _j366);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j505, height * _j505]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j368 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j369 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j370 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j371 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j372 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j368);
window.metallicProgram.setUniform('lightPos', [_j371, _j372]);
window.metallicProgram.setUniform('specularPower', _j369);
window.metallicProgram.setUniform('fresnelStrength', _j370);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j300.end();
}
let _j373 = null;
let __lastGridParams = null;
function _j22(x1, y1, x2, y2, _j1513, _j1514) {
const d = dist(x1, y1, x2, y2);
if (d < 1) return;
const dx = (x2 - x1) / d, dy = (y2 - y1) / d;
let pos = 0, draw = true;
while (pos < d) {
const _j374 = draw ? _j1513 : _j1514;
const end = Math.min(pos + _j374, d);
if (draw) line(x1 + dx * pos, y1 + dy * pos, x1 + dx * end, y1 + dy * end);
pos = end;
draw = !draw;
}
}
function gridCommitPrev() {
if (__lastGridParams) {
_j373 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j23(cx, cy, _j499, _j500) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j499 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j574 !== 'undefined' && _j574 !== null) {
if (_j574.minX < minX) minX = _j574.minX;
if (_j574.maxX > maxX) maxX = _j574.maxX;
if (_j574.minY < minY) minY = _j574.minY;
if (_j574.maxY > maxY) maxY = _j574.maxY;
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
const _j375 = effCell * 0.3;
const _j376 = (maxX - minX) + _j375 * 2;
const _j377 = (maxY - minY) + _j375 * 2;
const _j378 = (minX + maxX) * 0.5;
const _j379 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j375) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j375) / effCell) * effCell);
const _j380 = Math.min(width, Math.ceil((maxX + _j375) / effCell) * effCell);
const _j381 = Math.min(height, Math.ceil((maxY + _j375) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j380 - left);
let gridHeight = Math.max(effCell * 2, _j381 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j373 && typeof _j629 !== 'undefined' && _j629) {
const pg = _j373;
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
if (_j500) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j500) {
const _j382 = 12;
const _j383 = left + 8;
const _j384 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j383 - _j382 / 2, _j384, _j383 + _j382 / 2, _j384);
line(_j383, _j384 - _j382 / 2, _j383, _j384 + _j382 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j500) {
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
const _j385 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j386 = typeof _j569 === 'number' ? _j569 : 0;
const _j387 = typeof brushDir === 'number' ? brushDir : 0;
const _j388 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j389 = _j388[_j387] || '?';
const countdownText = `Max: ${_j385} | Count: ${_j386} | Dir: ${_j387}(${_j389})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j390 = typeof _j570 === 'number' ? _j570 : 0;
const _j391 = typeof brushMode === 'number' ? brushMode : 0;
const _j392 = (typeof _j530 === 'number' && _j530 > 0) ? _j530 : (typeof _j546 === 'number' ? _j546 : effCell);
const _j393 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j394 = `C: ${_j390} | B: ${_j391} | S: ${_j392.toFixed(1)} | P: ${_j393}`;
const _j395 = left;
const _j396 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j394, _j395, _j396);
_j25();
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
function _j24(_j1508) {
const _j397 = typeof _j1508.begin === 'function';
if (_j397) _j1508.begin();
const g = _j397 ? window : _j1508;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j398 = 5;
const _j399 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j902 = true;
_j877 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j400 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j400;
let dy = (y2 - y1) / _j400;
let _j401 = 0;
while (_j401 < _j400) {
let _j402 = _j902 ? _j398 : _j399;
let _j403 = min(_j402 - _j877, _j400 - _j401);
if (_j902) {
let startX = x1 + dx * _j401;
let startY = y1 + dy * _j401;
let _j404 = x1 + dx * (_j401 + _j403);
let _j405 = y1 + dy * (_j401 + _j403);
g.line(startX, startY, _j404, _j405);
}
_j401 += _j403;
_j877 += _j403;
if (_j877 >= (_j902 ? _j398 : _j399)) {
_j902 = !_j902;
_j877 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j406 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j406.x, _j406.y, 10, 10);
}
g.pop();
if (_j397) _j1508.end();
}
function _j25() {
const _j407 = 10;
if (typeof _j554 !== 'undefined' && _j554 && typeof _j558 !== 'undefined' && _j558) {
noFill();
stroke(0, 180, 0, 180);
strokeWeight(1.5);
if (_j558.action === 'rect') {
const _j408 = _j558.x1 + _j407, _j409 = _j558.y1 + _j407;
const _j410 = _j558.x2 + _j407, _j411 = _j558.y2 + _j407;
_j22(_j408, _j409, _j410, _j409, 6, 4);
_j22(_j410, _j409, _j410, _j411, 6, 4);
_j22(_j410, _j411, _j408, _j411, 6, 4);
_j22(_j408, _j411, _j408, _j409, 6, 4);
} else if (_j558.action === 'polygon' && _j558.points && _j558.points.length >= 3) {
const _j412 = _j558.points;
for (let i = 0; i < _j412.length; i++) {
const a = _j412[i], b = _j412[(i + 1) % _j412.length];
_j22(a.x + _j407, a.y + _j407, b.x + _j407, b.y + _j407, 6, 4);
}
}
fill(0, 180, 0, 200);
noStroke();
if (typeof font !== 'undefined' && font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
const _j413 = (_j558.action === 'rect' ? _j558.x1 : (_j558.points ? _j558.points[0].x : 0)) + _j407;
const _j414 = (_j558.action === 'rect' ? _j558.y1 - 12 : (_j558.points ? _j558.points[0].y - 12 : 0)) + _j407;
text('MASK', _j413, _j414);
}
if (typeof _j553 !== 'undefined' && _j553 && typeof _j555 !== 'undefined' && _j555 === 'rect' &&
typeof _j556 !== 'undefined' && _j556 && _j556.x1 !== undefined && mouseIsPressed) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
const _j415 = Math.min(_j556.x1, mouseX - 10) + _j407;
const _j416 = Math.min(_j556.y1, mouseY - 10) + _j407;
const _j417 = Math.max(_j556.x1, mouseX - 10) + _j407;
const _j418 = Math.max(_j556.y1, mouseY - 10) + _j407;
_j22(_j415, _j416, _j417, _j416, 4, 3);
_j22(_j417, _j416, _j417, _j418, 4, 3);
_j22(_j417, _j418, _j415, _j418, 4, 3);
_j22(_j415, _j418, _j415, _j416, 4, 3);
}
if (typeof _j553 !== 'undefined' && _j553 && typeof _j555 !== 'undefined' && _j555 === 'polygon' &&
typeof _j557 !== 'undefined' && _j557.length > 0) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
for (let i = 0; i < _j557.length - 1; i++) {
const a = _j557[i], b = _j557[i + 1];
_j22(a.x + _j407, a.y + _j407, b.x + _j407, b.y + _j407, 4, 3);
}
noStroke();
fill(0, 200, 0, 150);
for (let p of _j557) {
ellipse(p.x + _j407, p.y + _j407, 6, 6);
}
}
}
function _j26() {
if ((!_j629 || isWaitingToLoop) && _j643 !== null && doMoving) {
const _j419 = easycamInitialCenter || [0, 0, 0];
const _j420 = PI / 3;
const _j421 = height / (2 * tan(_j420 / 2));
const _j422 = easycamInitialDistance > 0 ? easycamInitialDistance : _j421;
const _j423 = _j643.getCenter();
const _j424 = _j643.getDistance();
const _j425 = 0.1;
const _j426 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j423[0] - _j419[0], 2) +
Math.pow(_j423[1] - _j419[1], 2) +
Math.pow(_j423[2] - _j419[2], 2)
);
const distanceDiff = Math.abs(_j424 - _j422);
if (!_j656 && (centerDiff > _j425 || distanceDiff > _j426)) {
_j656 = true;
_j657 = millis();
_j654 = [_j423[0], _j423[1], _j423[2]];
_j658 = _j424;
_j655 = _j419;
_j659 = _j422;
}
if (_j656) {
const _j427 = millis() - _j657;
const _j428 = Math.min(_j427 / _j660, 1.0);
const _j429 = [
lerp(_j654[0], _j655[0], _j428),
lerp(_j654[1], _j655[1], _j428),
lerp(_j654[2], _j655[2], _j428)
];
const _j430 = lerp(_j658, _j659, _j428);
_j643.setCenter(_j429, 0);
_j643.setDistance(_j430, 0);
if (_j428 >= 1.0) {
const _j431 = _j643.getCenter();
const _j432 = _j643.getDistance();
const _j433 = Math.sqrt(
Math.pow(_j431[0] - _j419[0], 2) +
Math.pow(_j431[1] - _j419[1], 2) +
Math.pow(_j431[2] - _j419[2], 2)
);
const _j434 = Math.abs(_j432 - _j422);
if (_j433 > _j425 || _j434 > _j426) {
_j643.setCenter(_j419, 0);
_j643.setDistance(_j422, 0);
}
_j656 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j629 && !isWaitingToLoop && doMoving && _j644 && _j643 !== null && _j645 && !_j656) {
const _j435 = _j633;
const _j436 = _j634;
const _j437 = _j435 - hw;
const _j438 = -(_j436 - hh);
const _j423 = _j643.getCenter();
const _j271 = _j423[0];
const _j272 = _j423[1];
const _j424 = _j643.getDistance();
const _j420 = PI / 3;
const _j439 = height / (2 * tan(_j420 / 2));
const _j440 = 1.1;
let _j441 = 1.4;
const _j320 = _j439 / _j441;
const _j442 = _j439 / _j440;
const _j443 = _j439 / _j424;
const _j444 = 0.01;
if (_j651) {
const _j445 = _j441;
const _j446 = _j439 / _j445;
const distanceDiff = _j446 - _j424;
const _j447 = _j647;
const _j448 = _j424 + distanceDiff * _j447;
const _j449 = constrain(_j448, _j320, _j442);
_j643.setDistance(_j449, 0);
} else {
const _j446 = _j439 / _j440;
const distanceDiff = _j446 - _j424;
const _j447 = _j647;
const _j448 = _j424 + distanceDiff * _j447;
const _j449 = constrain(_j448, _j320, _j442);
_j643.setDistance(_j449, 0);
}
const _j450 = _j643.getDistance();
const _j451 = _j439 / _j450;
let _j452 = 0;
let _j453 = 0;
if (_j451 > _j440) {
_j452 = (_j451 - _j440) * (width / 2);
_j453 = (_j451 - _j440) * (height / 2);
}
let offsetX = _j437 - _j271;
let offsetY = _j438 - _j272;
if (_j452 > 0 || _j453 > 0) {
const _j454 = constrain(_j437, -_j452, _j452);
const _j455 = constrain(_j438, -_j453, _j453);
offsetX = _j454 - _j271;
offsetY = _j455 - _j272;
} else {
offsetX = -_j271;
offsetY = -_j272;
}
const _j456 = _j646;
const _j330 = _j271 + offsetX * _j456;
const _j331 = _j272 + offsetY * _j456;
let _j457 = _j330;
let _j458 = _j331;
if (_j452 > 0 || _j453 > 0) {
_j457 = constrain(_j330, -_j452, _j452);
_j458 = constrain(_j331, -_j453, _j453);
} else {
_j457 = 0;
_j458 = 0;
}
_j643.setCenter([_j457, _j458, 0], 0);
}
}
function _j27() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j644 = false;
return;
}
if (_j643 !== null) {
_j644 = true;
return;
}
try {
const _j459 = _renderer;
if (!_j459) {
console.error('❌ WEBGL renderer not found');
_j644 = false;
return;
}
const _j420 = PI / 3;
const _j439 = height / (2 * tan(_j420 / 2));
_j643 = new Dw.EasyCam(_j459, {
distance: _j439,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j643.setRotationConstraint(0, 0, 0);
_j643.setRotationScale(0);
_j652 = _j439 / 2.5;
_j653 = _j439 / 1.0;
_j643.setDistanceMin(_j652);
_j643.setDistanceMax(_j653);
document.oncontextmenu = function() {
return false;
};
_j644 = true;
_j111('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j644 = false;
_j643 = null;
}
}
function applyCameraProjection() {
const _j460 = doMoving && _j644 && _j643 !== null && _j629 && _j645;
if (_j460) {
const _j461 = PI / 3;
const _j462 = 0.1;
const _j463 = 10000;
perspective(_j461, width / height, _j462, _j463);
push();
} else {
const _j464 = PI / 3;
const _j465 = 0.1;
const _j466 = 10000;
perspective(_j464, width / height, _j465, _j466);
}
}
let _j467 = null;
let _j468 = null;
let _j469 = 0,
_j470 = 0,
_j471 = 0;
let _j472 = {
feedback: {},
composite: {},
realtime: {}
};
function _j28(_j1515, _j1516, name, value) {
const _j473 = _j472[_j1516];
if (_j473[name] === value) return;
_j473[name] = value;
_j1515.setUniform(name, value);
}
function _j29() {
if (_j469 !== width || _j470 !== height || _j471 !== _j505) {
_j467 = [0, 0, width * _j505, height * _j505];
_j468 = [1.0 / (width * _j505), 1.0 / (height * _j505)];
_j469 = width;
_j470 = height;
_j471 = _j505;
}
if (_j467 === null) {
_j467 = [0, 0, width * _j505, height * _j505];
_j468 = [1.0 / (width * _j505), 1.0 / (height * _j505)];
}
}
function _j30(_j1508, _j1517 = 1.0) {
if (_j590) {
_j566 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
pingPongBuffer.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j508);
const _j474 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j508.setUniform("rect", _j467);
_j508.setUniform("invResolution", _j468);
_j508.setUniform("tex0", _j1508);
_j28(_j508, 'feedback', "brushMode", brushMode * 1.0);
_j508.setUniform("forceMap", _j506);
_j28(_j508, 'feedback', "baseBrushSize", baseBrushSize);
_j508.setUniform("force", _j1517);
_j28(_j508, 'feedback', "useSharpen", useSharpen);
_j28(_j508, 'feedback', "effect3Brightness", effect3Brightness);
_j28(_j508, 'feedback', "indiffusionStrength", indiffusionStrength);
_j28(_j508, 'feedback', "brushColorMode", float(brushColorMode));
_j28(_j508, 'feedback', "brushCategory", _j474);
const _j475 = typeof _j572 !== 'undefined' ? _j572 : 0;
const _j476 = (_j570 + _j475) % 40;
const _j477 = _j570 + _j475;
_j508.setUniform("mouseCount", float(_j476));
_j508.setUniform("mouseCountAccumulated", float(_j477));
_j508.setUniform("strokeSeed", float(strokeSeed));
_j508.setUniform("useMask", _j554 ? 1.0 : 0.0);
if (_j554) _j508.setUniform("maskTex", _j552);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
_j1508.begin();
imageMode(CENTER);
blendMode(BLEND);
image(pingPongBuffer, 0, 0, width, height);
_j1508.end();
_j566 = true;
}
function _j31() {
if (typeof _j617 === 'undefined' || !_j617) {
return;
}
const _j478 = canvasBackgroundColor;
let _j479 = _j9(40, 20, 15, 0.2);
const _j480 = min(255, _j478[0] * 1.1);
const _j481 = min(255, _j478[1] * 1.1);
const _j482 = min(255, _j478[2] * 1.1);
_j617.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j480, _j481, _j482);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j479, -width / 2, -height / 2, width, height);
_j617.end();
_j479.remove();
}
function _j32() {
const _j478 = canvasBackgroundColor;
if (typeof _j618 !== 'undefined' && _j618) {
_j618.begin();
background(_j478[0], _j478[1], _j478[2]);
_j618.end();
}
_j31();
if (typeof _j566 !== 'undefined') {
_j566 = true;
}
}
function updateCompositeBuffer() {
const _j483 = _j566 || _j547 || _j548 || _j629 || _j672;
if (_j483) {
_j615.begin();
clear();
shader(_j511);
_j29();
_j511.setUniform("rect", _j467);
_j511.setUniform("baseTex", showPaperTexture ? _j617 : _j618);
_j511.setUniform("encodedTex", finalBuffer);
_j511.setUniform("typeMapTex", typeMapBuffer);
_j511.setUniform("oldTex", oldBuffer);
_j28(_j511, 'composite', "brushColorMode", float(brushColorMode));
_j28(_j511, 'composite', "whiteMaxOpacity", _j516);
_j28(_j511, 'composite', "hueShift", _j517);
_j28(_j511, 'composite', "satShift", _j518);
_j28(_j511, 'composite', "briShift", _j519);
_j28(_j511, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j28(_j511, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j615.end();
if (_j547 || _j548) {
_j619.begin();
clear();
imageMode(CENTER);
image(_j615, 0, 0, width, height);
_j619.end();
_j615.begin();
shader(_j509);
const _j484 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j509.setUniform("rect", _j467);
_j509.setUniform("baseTex", _j619);
_j509.setUniform("addTex", newBufferBlack);
_j509.setUniform("encodedTex", finalBuffer);
_j28(_j509, 'realtime', "brushColorMode", float(brushColorMode));
_j28(_j509, 'realtime', "whiteMaxOpacity", _j516);
_j28(_j509, 'realtime', "hueShift", _j517);
_j28(_j509, 'realtime', "satShift", _j518);
_j28(_j509, 'realtime', "briShift", _j519);
_j28(_j509, 'realtime', "brushCategory", _j484);
_j28(_j509, 'realtime', "useSharpen", useSharpen);
let _j485;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j485 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j214[brushColorMode] || _j214[0];
_j485 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j509.setUniform("brushColor", _j485);
_j509.setUniform("useMask", _j554 ? 1.0 : 0.0);
if (_j554) _j509.setUniform("maskTex", _j552);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j615.end();
}
_j566 = _j547 || _j548 || _j629 || _j672;
}
}
if (typeof window !== 'undefined') {
window.blurBuffersInitialized = window.blurBuffersInitialized || false;
}
function _j33() {
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
const _j486 = (_j547 || _j548) && _j569 < maxUpdates && _j575;
const _j487 = !_j629 || showFuturePathPreview;
const _j488 = _j486 && showGridOverlay;
const _j489 = (typeof _j554 !== 'undefined' && _j554) ||
(typeof _j553 !== 'undefined' && _j553);
const _j490 = (typeof window !== 'undefined' && window.testMode === true);
if (_j486 || _j489 || _j490) {
_j616.begin();
clear();
push();
translate(-hw, -hh);
const _j491 = -10;
translate(_j491, _j491);
if (_j490) {
const _j407 = 10;
const _j492 = 4;
noFill();
stroke(255, 0, 0, 220);
strokeWeight(2);
const _j493 = _j492 + _j407, _j494 = _j492 + _j407;
const _j495 = width - _j492 + _j407, _j496 = height - _j492 + _j407;
_j22(_j493, _j494, _j495, _j494, 10, 6);
_j22(_j495, _j494, _j495, _j496, 10, 6);
_j22(_j495, _j496, _j493, _j496, 10, 6);
_j22(_j493, _j496, _j493, _j494, 10, 6);
}
if (_j488) {
const _j497 = _j629 ? _j633 : _j542;
const _j498 = _j629 ? _j634 : _j543;
const cx = (_j544 || _j544 === 0) ? _j544 : _j497;
const cy = (_j545 || _j545 === 0) ? _j545 : _j498;
const _j499 = _j546;
const _j500 = typeof _j591 !== 'undefined' && _j591;
_j23(cx, cy, _j499, _j500);
} else if (_j489) {
_j25();
}
if (pathPoints.length > 1 && _j487) {
const _j398 = 5;
const _j399 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j902 = true;
_j877 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j400 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j400;
let dy = (y2 - y1) / _j400;
let _j401 = 0;
while (_j401 < _j400) {
let _j402 = _j902 ? _j398 : _j399;
let _j403 = min(_j402 - _j877, _j400 - _j401);
if (_j902) {
let startX = x1 + dx * _j401;
let startY = y1 + dy * _j401;
let _j404 = x1 + dx * (_j401 + _j403);
let _j405 = y1 + dy * (_j401 + _j403);
line(startX, startY, _j404, _j405);
}
_j401 += _j403;
_j877 += _j403;
if (_j877 >= (_j902 ? _j398 : _j399)) {
_j902 = !_j902;
_j877 = 0;
}
}
}
}
if (_j487 && _j486) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j501 = _j629 ? _j633 : _j542;
const _j502 = _j629 ? _j634 : _j543;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j501, _j502, 10, 10);
}
pop();
_j616.end();
}
}
let _j503 = window._demoCanvasWidth || 900,
_j504 = window._demoCanvasHeight || 900,
hw, hh, _j505 = 1.6;
let _j506, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j507, _j508, _j509, _j510, _j511, _j512;
let _j513;
let _j514;
const _j214 = _j2();
let colorIndex = 0,
_j515 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j516 = 0.95;
let _j517 = 0.0,
_j518 = 0.0,
_j519 = 0.0;
let customBrushColor = [26, 26, 26];
let _j520, _j521, _j522, _j523, _j524;
let _j525, _j526, _j527, _j528, _j529, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j530 = 0,
_j531 = 2,
_j532 = 0;
let brushMode = 1,
_j533 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j534 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j535 = [];
let x, y, _j437, _j438, _j536, _j537, _j538, _j539 = 0,
_j540 = 0;
let _j541;
let _j542 = 0,
_j543 = 0,
_j544 = 0,
_j545 = 0,
_j546 = 20;
let _j547 = false,
_j548 = false,
_j549 = false,
_j550 = false;
let _j551 = true;
let useSpectralMix = false;
let _j552;
let _j553 = false;
window.resetBrushPositionToMouse = function() {
if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') return;
const px = _j183(mouseX);
const py = _j183(mouseY);
_j542 = px;
_j543 = py;
_j544 = px;
_j545 = py;
_j633 = px;
_j634 = py;
_j635 = px;
_j636 = py;
};
let _j554 = false;
let _j555 = 'rect';
let _j556 = null;
let _j557 = [];
let _j558 = null;
Object.defineProperty(window, 'spectral', {
get() { return useSpectralMix; },
set(v) {
useSpectralMix = !!v;
console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
}
});
window.getAgentPathData = function() {
return {
active: _j567,
paths: _j568,
pointCount: _j568.filter(p => !p.stroke).length,
strokeCount: _j568.filter(p => p.stroke).length,
canvasSize: { w: typeof width !== 'undefined' ? width : 0, h: typeof height !== 'undefined' ? height : 0 },
timestamp: Date.now()
};
};
let _j559 = 1.0,
_j560 = false,
_j561 = 0.0;
let _j562 = [0, 0, 0];
function _j34(v) {
_j562[0] = _j562[1];
_j562[1] = _j562[2];
_j562[2] = v;
const a = _j562[0], b = _j562[1], c = _j562[2];
return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}
let _j563 = null;
let _j564 = false,
_j565 = false,
_j566 = true;
let _j567 = false;
let _j568 = [];
let _j569 = 0,
maxUpdates = 10,
force = 1.0;
let _j570 = 0,
_j571 = 0,
_j572 = 0;
var doMoving = false,
_j573 = false;
let pathPoints = [],
_j574 = null,
startX = 0,
startY = 0,
_j575 = false;
let _j576 = 1,
pathRotation = 20;
let randStep = 1,
_j577 = 10,
expectedStrokeLength = 100;
let allBrushStrokes = [],
totalStrokeCount = 0,
_j578 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j579;
var currentStrokeHighlight = null;
let _j580 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j581 = 140.0,
_j582 = 0.5,
_j583 = 1.0,
_j584 = 0.5,
_j585 = 60.0;
let cellularEnabled = false,
_j586 = 15.0,
_j587 = 0.5;
let whiteDotEnabled = false,
_j588 = 0.01;
let grainEnabled = false,
_j589 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j590 = false;
let _j591 = false;
let _j592 = 0;
let _j593 = 0;
let _j594 = 0;
let _j595 = 50;
let _j596 = 0;
var flowEffectStrokeBounds = null;
let _j597 = false;
let _j598 = null;
let _j599 = 0;
var _j600 = 0;
var _j601 = 0;
let _j602 = false;
const _j603 = 3;
var _j604 = {
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
var _j605 = false;
let _j606 = [0, 0, 0, 0],
_j607 = [0, 0, 0],
_j608 = [0, 0, 0],
_j609 = [0, 0, 0];
let _j610 = [0, 0],
_j611 = [0, 0],
effect3Brightness = 0.2;
let oldBuffer, _j612, finalBuffer, newBufferBlack, _j613, _j614, _j615;
let pingPongBuffer, _j616, _j617, _j618;
let _j619;
let _j620;
let typeMapBuffer;
let _j621 = false,
_j622 = 0,
_j623 = null,
_j624 = 0;
let _j625 = 0,
_j626 = 0,
_j627 = true,
_j628 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j629 = false,
_j630 = 0,
_j631 = 0,
_j632 = 1.0;
let _j633 = 0,
_j634 = 0,
_j635 = 0,
_j636 = 0;
let _j637 = false,
isWaitingToLoop = false,
_j638 = 0;
let _j639 = 0,
_j640 = false;
let _j641 = 0,
_j642 = 0;
let _j643 = null,
_j644 = false,
_j645 = false;
let _j646 = 0.05,
_j647 = 0.05;
let _j648 = 0,
_j649 = 0;
let _j650 = 1,
_j651 = false;
let _j652 = 0,
_j653 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j654 = [0, 0, 0],
_j655 = [0, 0, 0];
let _j656 = false,
_j657 = 0,
_j658 = 0,
_j659 = 0,
_j660 = 1000;
let _j661 = false,
_j662 = 0;
let _j663 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j664 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j665 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j666 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j667 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j668 = 0,
_j669 = 300;
let _j670 = false,
_j671 = false;
let _j672 = false,
_j673 = 0,
frameCount = 0,
_j674 = [];
let _j675 = 1,
_j676 = 0.8;
let _j677 = true,
_j678 = [],
_j679 = 100,
isDragging = false;
let _j680 = {
x: 0,
y: 0
},
_j681 = {
x: 85,
y: 50
};
let _j682 = false,
_j683 = {
x: 0,
y: 0
},
_j684 = {
x: 15,
y: 50
},
_j685 = true;
let _j686 = false,
_j687 = {
x: 0,
y: 0
},
_j688 = {
x: 85,
y: 70
},
_j689 = true;
let _j690 = false,
_j691 = {
x: 0,
y: 0
},
_j692 = {
x: 85,
y: 40
},
_j693 = true;
let _j694 = false,
_j695 = {
x: 0,
y: 0
},
_j696 = {
x: 15,
y: 40
},
_j697 = true;
let _j698 = 10;
var screenText = false,
_j699 = [],
_j700 = 30,
_j701 = 0;
let _j702 = 25,
_j703 = 30,
_j704 = 16,
_j705 = 200,
_j706 = 200;
let _j707 = false,
_j708 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j508 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j509 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j507 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j512 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j514 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j168();
if (doDemo) {
_j176('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j579 = window._preloadedDemo;
recordingData = _j579;
window._pendingAutoPlay = true;
} else {
var _j709 = './lib/demo.json';
var _j710 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j710)) {
_j709 = './lib/' + _j710 + '.json';
}
fetch(_j709)
.then(_j1538 => {
if (!_j1538.ok) throw new Error('HTTP ' + _j1538.status);
return _j1538.json();
})
.then(data => {
_j579 = data;
if (_j579 && _j579.events && _j579.events.length > 0) {
recordingData = _j579;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j111('system', '❌ Failed to load ' + _j709, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j711 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j712 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j711) {
try {
const loadedData = JSON.parse(_j711);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j712 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j713 = sessionStorage.getItem('pendingRecordingData');
const _j714 = sessionStorage.getItem('shouldAutoPlay');
if (_j713 && _j714 === 'true') {
try {
const loadedData = JSON.parse(_j713);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j176('📂 Recording Data Restored After Reload');
_j111('system', '✅ Canvas size restored and recording loaded', {
CanvasSize: `${width}x${height}`,
Events: `${recordingData.events.length} events`
});
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
_j111('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
window._pendingAutoPlay = true;
}
} catch (error) {
_j111('system', '❌ Failed to restore recording data', {
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
const _j715 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j716 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
if (_j716 && window.APP_MODE === 'collector') {
document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center;font-family:system-ui;background:#f5f5f5;">' +
'<div><p style="font-size:48px;margin:0 0 16px;">🖥</p>' +
'<p style="font-size:18px;font-weight:600;margin:0 0 8px;">Please use a tablet or computer</p>' +
'<p style="font-size:14px;color:#666;margin:0;">This artwork requires more GPU memory than your phone can provide. Open this link on an iPad or desktop browser for the full experience.</p></div></div>';
noLoop();
return;
}
const _j717 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j717) {
const _j718 = parseFloat(_j717[1]);
if (!isNaN(_j718) && _j718 >= 0.5 && _j718 <= 5) {
_j505 = _j718;
_j111('system', '🔗 Pixel density from URL', {
Value: _j718
});
}
} else if (window.APP_MODE === 'collector') {
_j505 = 2;
_j111('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j715) {
const _j719 = 1.0;
if (_j505 > _j719) {
_j505 = _j719;
_j111('system', '📱 Mobile pixel density override', {
Value: _j719,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j720 = sessionStorage.getItem('pendingPixelDensity');
if (_j720 && !_j715 && !_j717) {
const _j721 = parseInt(_j720);
if (!isNaN(_j721) && _j721 >= 1 && _j721 <= 5) {
_j505 = _j721;
sessionStorage.removeItem('pendingPixelDensity');
_j111('system', '🔄 Restoring pixel density from session', {
Value: _j721,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j505);
const _j722 = sessionStorage.getItem('pendingCanvasWidth');
const _j723 = sessionStorage.getItem('pendingCanvasHeight');
let _j724 = false;
if (_j722 && _j723) {
_j503 = parseInt(_j722);
_j504 = parseInt(_j723);
_j724 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j111('system', '🔄 Restoring canvas size from recording', {
Width: `${_j503}px`,
Height: `${_j504}px`
});
}
let _j725 = false,
_j726 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j727 = qs.substring(1).split('_');
for (var i = 0; i < _j727.length; i++) {
var ci = _j727[i].indexOf(':');
if (ci === -1) continue;
var k = _j727[i].substring(0, ci), v = parseInt(_j727[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j503 = v;
_j725 = true;
}
if (k === 'h' && v > 0) {
_j504 = v;
_j726 = true;
}
}
})();
if (_j716 && window.APP_MODE === 'artist' && !_j724) {
if (!_j725) _j503 = 380;
if (!_j726) _j504 = 600;
if (!_j725 || !_j726) {
_j111('system', '📱 Mobile phone default canvas size', {
Width: `${_j503}px`,
Height: `${_j504}px`
});
}
}
const _j728 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j728) {
try {
const _j478 = JSON.parse(_j728);
if (Array.isArray(_j478) && _j478.length === 3) {
canvasBackgroundColor[0] = _j478[0];
canvasBackgroundColor[1] = _j478[1];
canvasBackgroundColor[2] = _j478[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j111('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j478[0]}, ${_j478[1]}, ${_j478[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j503, _j504, WEBGL);
if (_j551) {
const _j729 = document.querySelector('canvas');
if (_j729) {
const _j730 = document.getElementById('zen-mode-btn');
const _j731 = (pressure) => {
if (!_j730) return;
if (pressure <= 0) {
_j730.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j730.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j732 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j560) {
_j560 = true;
_j111('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j561 = _j34(e.pressure);
_j559 = Math.min(_j561 / 0.3, 1.0);
_j731(_j561);
}
};
_j729.addEventListener('pointerdown', _j732);
_j729.addEventListener('pointermove', _j732);
_j729.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j560) {
_j561 = 0.0;
_j562[0] = _j562[1] = _j562[2] = 0;
_j559 = -1;
_j731(0);
}
});
const _j733 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j734 = t.touchType === 'stylus';
if (_j734 && t.force > 0) {
const _j735 = Math.min(t.force, 1.0);
if (!_j560) {
_j560 = true;
_j111('system', '🖊️ Stylus force detected', { force: t.force });
}
_j561 = _j34(_j735);
_j559 = Math.min(_j561 / 0.3, 1.0);
_j731(_j561);
}
}
};
_j729.addEventListener('touchstart', _j733, { passive: true });
_j729.addEventListener('touchmove', _j733, { passive: true });
_j729.addEventListener('touchend', () => {
if (_j560) {
_j561 = 0.0;
_j562[0] = _j562[1] = _j562[2] = 0;
_j559 = -1;
_j731(0);
}
}, { passive: true });
}
}
_j506 = createFramebuffer({
density: _j505
});
window.metallicStrength = 0.85;
window.metallicFlowSpeed = 1.0;
window.metallicSpecular = 12.0;
window.metallicFresnel = 0.5;
window.bugsSize = 10.0;
window.metallicLightX = 0.5;
window.metallicLightY = 0.3;
window.metallicTint = [0.72, 0.50, 0.35];
if (typeof _j109 === 'function') _j109();
if (typeof _j107 === 'function') _j107();
_j148();
_j140();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j139 === 'function') {
_j139();
}
_j47();
window.addEventListener('resize', function() {
setTimeout(_j47, 100);
});
_j176('Interactive Generative Art System');
oldBuffer = createFramebuffer({
density: _j505
});
oldBuffer.begin();
background(255);
oldBuffer.end();
_j612 = createGraphics(width, height, WEBGL);
_j612.noStroke();
_j612.pixelDensity(_j505);;
_j612.clear();
finalBuffer = createFramebuffer({
density: _j505
});
finalBuffer.begin();
background(255);
finalBuffer.end();
newBufferBlack = createFramebuffer({
density: _j505
});
newBufferBlack.begin();
background(255);
newBufferBlack.end();
_j613 = createFramebuffer({
density: _j505
});
_j614 = createGraphics(width, height, WEBGL);
_j614.noStroke();
_j614.pixelDensity(_j505);;
_j614.clear();
_j617 = createFramebuffer({
density: _j505
});
let _j479 = _j9(40, 20, 15, 0.2);
const _j480 = min(255, canvasBackgroundColor[0] * 1.1);
const _j481 = min(255, canvasBackgroundColor[1] * 1.1);
const _j482 = min(255, canvasBackgroundColor[2] * 1.1);
_j617.begin();
clear();
noStroke();
fill(_j480, _j481, _j482);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j479, -width / 2, -height / 2, width, height);
_j617.end();
_j479.remove();
_j618 = createFramebuffer({
density: _j505
});
_j618.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j618.end();
_j615 = createFramebuffer({
density: _j505
});
typeMapBuffer = createFramebuffer({
density: _j505
});
typeMapBuffer.begin();
background(0);
typeMapBuffer.end();
pingPongBuffer = createFramebuffer({
density: _j505
});
_j619 = createFramebuffer({
density: _j505
});
_j616 = createFramebuffer({
density: _j505
});
_j620 = createFramebuffer({
density: _j505
});
_j620.begin();
background(255);
_j620.end();
_j552 = createFramebuffer({
density: _j505
});
_j552.begin();
background(255);
_j552.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j505
});
}
_j506.begin();
background(255, 255, 255);
_j506.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j633 = hw;
_j634 = hh;
_j635 = hw;
_j636 = hh;
_j174();
_j520 = 10;
_j577 = 2;
_j522 = 0.5;
_j523 = 0.5;
_j521 = 0;
_j524 = 20;
x = y = _j525 = _j526 = _j527 = _j528 = _j541 = 0;
_j437 = hw;
_j438 = hh;
_j529 = 0;
_j170();
_j177();
_j27();
_j175();
window.addEventListener('mouseup', function(e) {
if (_j547 && !_j629) {
const _j736 = document.querySelector('canvas');
if (_j736) {
const bounds = _j736.getBoundingClientRect();
const _j737 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j737) {
_j111('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j548) {
_j548 = true;
_j569 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j564 = _j48(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j564 = false;
});
document.addEventListener('mousemove', function(e) {
if (_j553) return;
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j542 = _j183(mouseX);
_j543 = _j183(mouseY);
} else {
const _j736 = document.querySelector('canvas');
if (!_j736) return;
const bounds = _j736.getBoundingClientRect();
const _j738 = (e.clientX - bounds.left) / bounds.width;
const _j739 = (e.clientY - bounds.top) / bounds.height;
_j542 = _j183(_j738 * width);
_j543 = _j183(_j739 * height);
}
});
window._setupComplete = true;
window.dispatchEvent(new Event('canvasReady'));
if (window._pendingAutoPlay) {
window._pendingAutoPlay = false;
setTimeout(() => {
startPlayback();
}, 300);
}
}
function _j35() {
if (!_j1411.enabled) return;
_j1411.frameCount++;
let _j740 = 60;
const now = millis();
if (_j1411.lastFrameTime > 0) {
const deltaTime = now - _j1411.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j740 = 1000 / deltaTime;
_j740 = Math.max(1, Math.min(120, _j740));
}
} else {
try {
const _j741 = frameRate();
if (!isNaN(_j741) && _j741 > 0) {
_j740 = _j741;
}
} catch (e) {}
}
_j1411.lastFrameTime = now;
_j1411._pushFR(_j740);
if (_j1411.frameCount - _j1411.lastCheckFrame >= _j1411.checkInterval) {
_j1411.lastCheckFrame = _j1411.frameCount;
const _j742 = _j1411._frLen > 0 ?
_j1411._avgFR() :
_j740;
if (_j1411.logFpsToConsole) {
console.log('FPS:', _j742.toFixed(1));
}
const _j743 = 0.1;
const _j744 = _j742 <= (_j1411.frameRateThreshold + _j743);
if (_j744) {
const now = millis();
if (now - _j1411.lastPerformanceLog > _j1411.logCooldown) {
_j1411.lastPerformanceLog = now;
_j36(_j742);
}
}
}
}
function _j36(_j742) {
const _j745 = _j1411.performanceDataAccumulated;
const sampleCount = _j745.sampleCount > 0 ? _j745.sampleCount : 1;
if (sampleCount === 0 || _j745.drawTotal === 0) {
const _j746 = _j1411.performanceData;
const _j747 = _j746.drawTotal > 0 ? _j746.drawTotal : 1;
const report = {
'平均帧率': `${_j742.toFixed(1)} fps`,
'目标帧率': `${_j1411.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j742).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j503}x${_j504}`,
'Pixel Density': _j505
};
const stateInfo = {
'正在绘制': _j547 ? '是' : '否',
'正在播放': _j629 ? '是' : '否',
'倒计时中': _j548 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j644 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
_j111('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j745.drawTotal / sampleCount,
updatePlayback: _j745.updatePlayback / sampleCount,
updateCompositeBuffer: _j745.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j745.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j745.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j745.updateBlurEffect / sampleCount,
applyCameraProjection: _j745.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j745.drawLayersWithBlur / sampleCount,
other: _j745.other / sampleCount
};
const _j747 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j748 = [];
const _j749 = _j747 * 0.1;
if (data.updatePlayback > _j749) {
_j748.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j747) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j749) {
_j748.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j747) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j749) {
_j748.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j747) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j749) {
_j748.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j747) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j749) {
_j748.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j747) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j749) {
_j748.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j747) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j749) {
_j748.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j747) * 100).toFixed(1)
});
}
if (data.other > _j749) {
_j748.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j747) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j742.toFixed(1)} fps`,
'目标帧率': `${_j1411.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j742).toFixed(2)} ms`,
'总耗时': `${_j747.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j503}x${_j504}`,
'Pixel Density': _j505
};
const stateInfo = {
'正在绘制': _j547 ? '是' : '否',
'正在播放': _j629 ? '是' : '否',
'倒计时中': _j548 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j644 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
if (_j748.length > 0) {
report['性能瓶颈'] = _j748.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j750 = [];
if (data.drawLayersWithBlur > _j749) {
_j750.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j749) {
_j750.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j503 * _j504 > 1500000) {
_j750.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 100) {
_j750.push('笔画数量较多，考虑清理旧笔画');
}
if (_j750.length > 0) {
report['优化建议'] = _j750.join('; ');
}
_j111('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1411.performanceData).forEach(key => {
_j1411.performanceData[key] = 0;
});
Object.keys(_j1411.performanceDataAccumulated).forEach(key => {
_j1411.performanceDataAccumulated[key] = 0;
});
}
let _j751 = 0;
const _j752 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j753 = (++_j751 % _j752 === 0);
const _j754 = _j753 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j232.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j755 = _j753 ? performance.now() : 0;
if (_j629) {
updatePlayback();
}
if (_j753) _j1411.performanceData.updatePlayback += performance.now() - _j755;
_j26();
if (_j566 || _j547 || _j548 || _j629 || _j672) {
if (_j753) _j755 = performance.now();
updateCompositeBuffer();
if (_j753) _j1411.performanceData.updateCompositeBuffer += performance.now() - _j755;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j33();
}
if (_j753) _j755 = performance.now();
updateEasyCamAutoTracking();
if (_j753) _j1411.performanceData.updateEasyCamAutoTracking += performance.now() - _j755;
if (_j753) _j755 = performance.now();
drawCursorToBuffer();
if (_j753) _j1411.performanceData.drawCursorToBuffer += performance.now() - _j755;
_j37();
if (_j753) _j755 = performance.now();
updateBlurEffect();
if (_j753) _j1411.performanceData.updateBlurEffect += performance.now() - _j755;
if (_j753) _j755 = performance.now();
applyCameraProjection();
if (_j753) _j1411.performanceData.applyCameraProjection += performance.now() - _j755;
if (_j753) _j755 = performance.now();
drawLayersWithBlur();
if (_j753) _j1411.performanceData.drawLayersWithBlur += performance.now() - _j755;
_j52();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j756 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j629 !== 'undefined' ? _j629 : '?') +
' evt=' + (typeof _j631 !== 'undefined' ? _j631 : '?');
_j615.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j756, -width/2 + 4, -height/2 + 3);
_j615.end();
if (d.totalFrames % 10 === 0) {
var _j757 = document.getElementById('defaultCanvas0');
var _j758 = document.getElementById('_fxDbgOvr');
if (!_j758 && _j757) {
_j758 = document.createElement('canvas');
_j758.id = '_fxDbgOvr';
_j758.width = _j757.offsetWidth;
_j758.height = 24;
_j758.style.position = 'fixed';
_j758.style.top = _j757.offsetTop + 'px';
_j758.style.left = _j757.offsetLeft + 'px';
_j758.style.zIndex = '2147483647';
_j758.style.pointerEvents = 'none';
document.body.appendChild(_j758);
}
if (_j758) {
var _j759 = _j758.getContext('2d');
_j759.clearRect(0, 0, _j758.width, _j758.height);
_j759.fillStyle = 'rgba(200,0,0,0.85)';
_j759.fillRect(0, 0, _j758.width, 22);
_j759.font = 'bold 13px monospace';
_j759.fillStyle = '#fff';
_j759.fillText(_j756, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j760 = document.getElementById('fxhash-capture-canvas');
var _j761 = document.getElementById('defaultCanvas0');
if (_j760 && typeof _j615 !== 'undefined') {
var _j762 = _j615.get();
_j760.width = _j762.width;
_j760.height = _j762.height;
var _j763 = _j760.getContext('2d');
_j763.drawImage(_j762.canvas, 0, 0);
if (typeof _j762.remove === 'function') _j762.remove();
if (_j761) {
_j760.style.cssText = _j761.style.cssText;
_j761.style.visibility = 'hidden';
}
_j760.style.position = 'absolute';
_j760.style.top = (_j761 ? _j761.offsetTop : 0) + 'px';
_j760.style.left = (_j761 ? _j761.offsetLeft : 0) + 'px';
_j760.style.zIndex = '99999';
_j760.style.visibility = 'visible';
_j760.style.border = 'none';
_j760.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j760.width + 'x' + _j760.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j764 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j763.save();
_j763.fillStyle = 'rgba(0,0,0,0.7)';
_j763.fillRect(10, 10, 280, _j764.length * 22 + 10);
_j763.font = '16px monospace';
_j763.fillStyle = '#0f0';
for (var li = 0; li < _j764.length; li++) {
_j763.fillText(_j764[li], 18, 30 + li * 22);
}
_j763.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j761 && _j760) {
_j760.width = _j761.width;
_j760.height = _j761.height;
var _j763 = _j760.getContext('2d');
_j763.drawImage(_j761, 0, 0);
if (_j761) _j761.style.visibility = 'hidden';
_j760.style.visibility = 'visible';
_j760.style.zIndex = '99999';
_j760.style.border = 'none';
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
if (_j753) {
const _j765 = performance.now();
const _j766 = _j1411.performanceData.updatePlayback +
_j1411.performanceData.updateCompositeBuffer +
_j1411.performanceData.updateEasyCamAutoTracking +
_j1411.performanceData.drawCursorToBuffer +
_j1411.performanceData.updateBlurEffect +
_j1411.performanceData.applyCameraProjection +
_j1411.performanceData.drawLayersWithBlur;
_j1411.performanceData.other = (_j765 - _j754) - _j766;
_j1411.performanceData.drawTotal = _j765 - _j754;
_j1411.performanceDataAccumulated.drawTotal += _j1411.performanceData.drawTotal;
_j1411.performanceDataAccumulated.updatePlayback += _j1411.performanceData.updatePlayback;
_j1411.performanceDataAccumulated.updateCompositeBuffer += _j1411.performanceData.updateCompositeBuffer;
_j1411.performanceDataAccumulated.updateEasyCamAutoTracking += _j1411.performanceData.updateEasyCamAutoTracking;
_j1411.performanceDataAccumulated.drawCursorToBuffer += _j1411.performanceData.drawCursorToBuffer;
_j1411.performanceDataAccumulated.updateBlurEffect += _j1411.performanceData.updateBlurEffect;
_j1411.performanceDataAccumulated.applyCameraProjection += _j1411.performanceData.applyCameraProjection;
_j1411.performanceDataAccumulated.drawLayersWithBlur += _j1411.performanceData.drawLayersWithBlur;
_j1411.performanceDataAccumulated.other += _j1411.performanceData.other;
_j1411.performanceDataAccumulated.sampleCount++;
}
_j35();
if (_j629) {
if (_j548 && !_j640) {
_j639 = millis();
_j640 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j548 && _j640) {
const _j767 = millis() - _j639;
const _j768 = _j630;
_j630 += _j767;
_j640 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j767.toFixed(0)}ms`);
if (_j631 < recordingData.events.length) {
const _j769 = recordingData.events[_j631];
const _j770 = _j769.m || _j769.type;
const _j771 = _j770 === 'mp' || _j770 === 'mousePressed';
const _j772 = _j769.t !== undefined ? _j769.t : _j769.time;
const _j773 = (millis() - _j630) * _j632;
const _j774 = _j772 - _j773;
if (_j771 || _j774 <= 0 || _j774 < 100) {
if (window.DEBUG_MODE && _j771) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j774.toFixed(0)}ms`);
}
_j190(_j769);
_j631++;
}
}
}
}
const _j775 = _j629 ? _j637 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j547));
const _j776 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j775 : (_j775 && _j530 > 0);
const _j777 = _j629 || (_j542 >= 0 && _j542 < width && _j543 >= 0 && _j543 < height) || (_j547 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j776 && _j777) {
window.drawLoopCount++;
if (_j570 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j570++;
let _j501, _j502;
if (_j629) {
_j501 = _j633;
_j502 = _j634;
} else {
_j501 = _j542;
_j502 = _j543;
}
if (_j570 % 2 === 0 && _j575) {
pathPoints.push({
x: _j501,
y: _j502
});
}
if (_j567) {
_j568.push({
x: _j501,
y: _j502,
t: millis(),
pressure: force
});
}
const _j778 = strokeSeed + _j570 * 100000000;
randomSeed(_j778);
if (brushMode === 3) {
let _j779 = crandom.random(0, 1);
let _j780 = crandom.random(150, 250);
let _j781 = _j779 > 0.1 ? noise(_j501 * 0.01, _j502 * 0.01) * 150 : _j780;
_j515 = (_j515 * 0.3) + (_j781 * 0.7);
} else {
let _j779 = crandom.random(0, 1);
let _j780 = crandom.random(20, 50);
let _j781 = _j779 > 0.3 ? noise(_j501 * 0.01, _j502 * 0.01) * 10 : _j780;
_j515 = (_j515 * 0.6) + (_j781 * 0.4);
}
_j530 -= randStep;
_j530 = max(1, _j530);
_j524 = _j530;
if (_j551 && _j570 >= 8) {
const _j782 = _j629 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j561;
const _j783 = baseBrushSize;
if (_j782 >= 0.3) {
const _j784 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j785 = _j563 || window._strokeStartBaseBrushSize || 1;
let _j786 = _j784.indexOf(_j785);
if (_j786 === -1) {
_j786 = _j784.findIndex(s => s >= _j785);
if (_j786 === -1) _j786 = _j784.length - 1;
}
let _j787;
if      (_j782 < 0.5) _j787 = 1;
else if (_j782 < 0.7) _j787 = 2;
else                     _j787 = 3;
const _j788 = Math.min(_j786 + _j787, _j784.length - 1);
baseBrushSize = _j784[_j788];
} else if (_j782 >= 0) {
baseBrushSize = _j563 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j783 && _j783 > 0) {
const _j789 = Math.pow(baseBrushSize / _j783, 0.6);
_j530 *= _j789;
initialSize *= _j789;
}
}
if (_j530 <= _j531 && !_j548 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j548 = true;
_j569 = 0;
}
_j437 = _j501;
_j438 = _j502;
_j529 = map(noise(_j437 * 0.01, _j438 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j790 = strokeSeed + _j570 * 10000000;
randomSeed(_j790);
const _j791 = crandom.random(pathRotation * 0.5, pathRotation);
const _j792 = crandom.random(pathRotation * 0.5, pathRotation);
const _j491 = -10;
_j437 += _j791 * (cos(_j529)) + _j491;
_j438 += _j792 * (sin(_j529)) + _j491;
}
if (_j621) {
const _j793 = (brushMode === 3) ? _j437 : Math.round(_j437);
const _j794 = (brushMode === 3) ? _j438 : Math.round(_j438);
const _j795 = { x: _j793, y: _j794 };
if (_j551 && _j560) _j795.p = Math.round(_j561 * 1000) / 1000;
_j184("md", _j795);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j544 = _j437;
_j545 = _j438;
let _j300 = newBufferBlack;
if (_j570 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j796 = dist(_j437, _j438, _j539, _j540);
const _j797 = 1;
if (_j796 > _j797) {
if (brushMode == 4 && _j570 < expectedStrokeLength) {
_j59(_j300, _j437, _j438, _j539, _j540);
}
if ((brushMode == 1 || brushMode == 7) && _j570 < expectedStrokeLength) {
let _j798 = expectedStrokeLength > 0 ? min(_j570 / expectedStrokeLength, 1.0) : 0;
let _j799 = crandom.random(0, 1);
if (_j799 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j570 > 5 && baseBrushSize < 6.0) _j57(_j300, _j437, _j438);
}
_j58(_j300, _j437, _j438, _j798, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j570 < expectedStrokeLength) {
let _j798 = expectedStrokeLength > 0 ? min(_j570 / expectedStrokeLength, 1.0) : 0;
let _j799 = crandom.random(0, 1);
if (_j799 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j798 < 0.6) {}
_j61(_j300, _j437, _j438, _j798, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j570 < expectedStrokeLength) {
_j64(_j300, _j437, _j438, _j539, _j540);
if (crandom.random(0, 1) > 0.4) _j57(_j300, _j437, _j438);
}
if (brushMode == 5 && _j570 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j57(_j300, _j437, _j438);
}
if (brushMode == 6 && _j570 < expectedStrokeLength) {
let _j798 = expectedStrokeLength > 0 ? min(_j570 / expectedStrokeLength, 1.0) : 0;
_j65(_j300, _j437, _j438, _j798, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j570 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j539 = _j437;
_j540 = _j438;
if (_j629) {
_j635 = _j633;
_j636 = _j634;
}
}
const _j800 = _j629 ? _j637 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j547));
const _j801 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j800 : (_j800 && _j530 > 0);
if (_j801) {
if (_j571 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j300 = newBufferBlack;
_j30(_j300, force);
_j571++;
if (_j571 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j548 && _j569 < maxUpdates) {
force = map(_j569, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j300 = newBufferBlack;
_j30(_j300, force);
_j569++;
_j571++;
} else if (_j548 && _j569 >= maxUpdates) {
_j111('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j39();
_j548 = false;
}
if (_j628 == 1 && _j629 && !_j672) {
_j179();
}
if (_j628 == 1 && !_j629 && _j672) {
_j180();
}
if (_j672) {
_j181();
if (_j628 == 1) {
frameRate(10);
}
}
if (_j628 == 0) {
frameRate(60);
}
_j141();
if (_j707) {
_j707 = false;
const _j802 = drawingSeed;
randomSeed(_j708);
noiseSeed(_j708);
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
if (typeof _j18 === 'function') {
_j18(_j615, scanBounds);
}
randomSeed(_j802);
noiseSeed(_j802);
_j708 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j803 = window.pendingEffectControlScanQueue.shift();
if (_j803 && typeof _j18 === 'function') {
let scanBounds = _j803.scanBounds;
const action = _j803.action;
const shapeType = _j803.shapeType;
const bugsSize = _j803.bugsSize !== undefined ? _j803.bugsSize : 10.0;
const scanSeed = _j803.scanSeed;
const recordedRandomCount = _j803.recordedRandomCount;
const targetPoints = _j803.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j804 = document.getElementById('bugs-size');
const _j805 = document.getElementById('bugs-size-value');
if (_j804 && _j805) {
_j804.value = bugsSize;
_j805.textContent = bugsSize;
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
const _j806 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j615, scanBounds, shapeType, targetPoints);
if (_j806) {
randomSeed(_j806);
noiseSeed(_j806);
}
if (typeof window !== 'undefined') {
_j111('playback', '🔁 Effect Control: Scan (processed)', {
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
function mousePressed(e) {
if (_j629) {
return;
}
if (_j564) {
return;
}
if (_j553) {
if (_j555 === 'rect') {
_j556 = { x1: mouseX - 10, y1: mouseY - 10 };
} else if (_j555 === 'polygon') {
_j557.push({ x: mouseX - 10, y: mouseY - 10 });
if (typeof _j92 === 'function') _j92();
}
return false;
}
_j542 = _j183(mouseX);
_j543 = _j183(mouseY);
pmouseX = mouseX;
pmouseY = mouseY;
_j544 = _j542;
_j545 = _j543;
_j633 = _j542;
_j634 = _j543;
_j635 = _j542;
_j636 = _j543;
if (typeof _j562 !== 'undefined') {
_j562[0] = _j562[1] = _j562[2] = 0;
}
const _j807 = 300;
if (_j542 < -_j807 || _j542 > width + _j807 ||
_j543 < -_j807 || _j543 > height + _j807) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j621) {
_j625++;
}
if (_j621) {
console.log(`🎬 錄製開始 [第 ${_j625} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j40();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j111('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j542.toFixed(0)}, ${_j543.toFixed(0)})`
});
_j648++;
_j572 = _j570;
_j515 = 0;
_j570 = 0;
if (_j551 && _j563 !== null) {
baseBrushSize = _j563;
}
if (typeof _j1042 !== 'undefined') {
_j1042 = [];
}
if (typeof _j1043 !== 'undefined') {
_j1043 = 0;
}
_j516 = crandom.random(0.5, 0.99);
_j517 = crandom.random(-0.02, 0.02);
_j518 = crandom.random(-0.05, 0.05);
_j519 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j183(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j183(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j183(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j808 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j809 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j621) {
if (_j627) {
if (_j622 === 0) {
_j622 = millis();
_j111('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j810 = millis() - _j624;
if (_j810 > 0) {
_j626 += _j810;
_j111('recording', '⏸️ Skip interval', {
Interval: `${_j810.toFixed(0)}ms`,
Accumulated: `${_j626.toFixed(0)}ms`
});
}
}
_j627 = false;
} else {
const _j810 = millis() - _j624;
_j626 += _j810;
_j111('recording', '⏸️ Skip interval', {
Interval: `${_j810.toFixed(0)}ms`,
Accumulated: `${_j626.toFixed(0)}ms`
});
}
_j623 = {
strokeSeed: strokeSeed,
mouseCountStart: _j572,
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
whiteMaxOpacity: _j183(_j516),
hueShift: _j183(_j517),
satShift: _j183(_j518),
briShift: _j183(_j519),
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
useSpectralMix: useSpectralMix,
maskData: _j558 || undefined
};
}
if (_j576 === 1) {
pathRotation = 0;
} else if (_j576 === 2) {
pathRotation = _j183(crandom.random(5, 10));
} else if (_j576 === 3) {
pathRotation = _j183(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j183(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j520 = 15;
_j577 = 5;
_j522 = 0.6;
_j523 = 0.5;
} else if (brushMode === 2) {
initialSize = _j183(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j520 = 10;
_j577 = 10;
_j522 = 0.3;
_j523 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j577 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j577 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j542 * 1, _j543 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j522 = 0.6;
_j523 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j577 = 1;
randStep = 0.05;
maxUpdates = 10;
_j520 = 10;
_j522 = 0.6;
_j523 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j577 = 1;
randStep = 0.05;
maxUpdates = 10;
_j520 = 10;
_j522 = 0.6;
_j523 = 0.5;
} else {
initialSize = crandom.random(30, 40);
maxUpdates = 10;
randStep = 0.05;
}
if (useSharpen >= 3.5) {
maxUpdates = 20;
_j111('system', '⚡️ Ink Effect G active, maxUpdates set to 5', {
Status: 'Performance Optimization'
});
}
if (brushMode == 4) {
expectedStrokeLength = 400;
} else {
expectedStrokeLength = 400;
}
if (_j621 && _j623) {
_j623.initialSize = initialSize;
_j623.spraySize = spraySize;
_j623.step = _j520;
_j623.step2 = _j577;
_j623.randStep = randStep;
_j623.maxUpdates = maxUpdates;
_j623.pathRotation = pathRotation;
_j623.spring = _j522;
_j623.friction = _j523;
_j623.baseBrushSize = baseBrushSize;
_j623.expectedStrokeLength = expectedStrokeLength;
_j623.effect3Brightness = _j183(effect3Brightness);
}
_j530 = initialSize;
_j524 = _j530;
_j528 = _j524;
_j546 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j551 && _j563 === null) _j563 = baseBrushSize;
_j541 = 0;
x = _j542;
y = _j543;
_j525 = 0;
_j526 = 0;
_j527 = 0;
_j538 = 0;
_j532 = 0;
if (typeof _j61 !== 'undefined') {
_j61.lastAngle = 0;
_j61.lastMovementAngle = 0;
}
if (typeof _j63 === 'function') {
_j63();
}
if (typeof _j65 !== 'undefined') {
_j65.lastAngle = 0;
_j65.lastMovementAngle = 0;
}
_j539 = _j542;
_j540 = _j543;
_j547 = true;
_j548 = false;
_j569 = 0;
_j571 = 0;
_j549 = true;
_j550 = false;
startX = _j542;
startY = _j543;
pathPoints = [{
x: _j542,
y: _j543
}];
_j575 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j621 && _j623) {
_j623.mouseX = _j542;
_j623.mouseY = _j543;
_j623.drawingSeed = drawingSeed;
_j623.brushModeSP = brushModeSP;
if (_j551 && _j560) _j623.hasPressure = true;
_j623.forceMapParams = {
randomSeed1: _j183(_j606[0]),
randomSeed2: _j183(_j606[1]),
randomSeed3: _j183(_j606[2]),
randomSeed4: _j183(_j606[3]),
scale1: _j183(_j607[0]),
scale2: _j183(_j607[1]),
scale3: _j183(_j607[2]),
amplitude1: _j183(_j608[0]),
amplitude2: _j183(_j608[1]),
amplitude3: _j183(_j608[2]),
phase1: _j183(_j609[0]),
phase2: _j183(_j609[1]),
phase3: _j183(_j609[2]),
vortexScale1: _j183(_j610[0]),
vortexScale2: _j183(_j610[1]),
clusterScale1: _j183(_j611[0]),
clusterScale2: _j183(_j611[1])
};
const _j811 = (brushMode === 3) ? _j542 : Math.round(_j542);
const _j812 = (brushMode === 3) ? _j543 : Math.round(_j543);
_j184("mp", {
x: _j811,
y: _j812,
strokeData: _j623
});
}
}
function mouseReleased() {
if (_j629) {
return;
}
if (_j553 && _j555 === 'rect' && _j556 && _j556.x1 !== undefined) {
const mx = mouseX - 10, my = mouseY - 10;
const x1 = Math.min(_j556.x1, mx);
const y1 = Math.min(_j556.y1, my);
const x2 = Math.max(_j556.x1, mx);
const y2 = Math.max(_j556.y1, my);
if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
_j556 = { x1: x1, y1: y1, x2: x2, y2: y2 };
drawMaskRect(x1, y1, x2, y2);
_j558 = { action: "rect", x1: x1, y1: y1, x2: x2, y2: y2 };
_j553 = false;
const toggle = document.getElementById('mask-mode-toggle');
if (toggle) toggle.checked = false;
if (typeof _j92 === 'function') _j92();
window.resetBrushPositionToMouse();
}
return;
}
if (!_j547) {
return;
}
if (_j567) {
_j568.push({ stroke: true, t: millis() });
}
const _j813 = crandom.getCount();
const _j814 = _j542;
const _j815 = _j543;
const _j816 = Math.round(constrain(_j814, 0, width));
const _j817 = Math.round(constrain(_j815, 0, height));
_j184("mr", {
x: _j816,
y: _j817
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j818 = randomCount - _j813;
const _j819 = window.drawLoopCount || 0;
const _j820 = window.recordedMouseDraggedCount || 0;
if (_j621) {
console.log(`   Draw: ${_j819} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j621) {
crandomDebugger.saveStroke('recording', _j625);
}
if (_j621) {
_j624 = millis();
_j111('recording', 'Stroke ended', {
FinalSize: _j530.toFixed(2),
CountdownStatus: _j548 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j542 < 0 || _j542 >= width || _j543 < 0 || _j543 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j1042 !== 'undefined' && _j1042.length > 0) {
_j1042 = _j1042.filter(_j1539 => _j1539.radius > 0);
}
if (!_j548) {
_j548 = true;
_j569 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j121();
return;
}
if (key === 'f' || key === 'F') {
if (_j672) {
_j180();
} else {
_j179();
}
return;
}
if (key === ' ') {
_j169();
console.clear();
let _j821 = _j232.length;
_j232 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j111('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j821} 个`
});
return false;
}
}
function _j37() {
const _j460 = doMoving && _j644 && _j643 !== null && _j629 && _j645;
const _j822 = (_j629 && _j460) || (!_j629 && (_j661 || _j665[0] !== 0 || _j665[40] !== 0 || _j665[80] !== 0 || _j665[120] !== 0));
if (_j822) {
if (!_j661) {
_j661 = true;
_j662 = millis();
_j663[0] = _j665[0];
_j663[40] = _j665[40];
_j663[80] = _j665[80];
_j663[120] = _j665[120];
}
const _j427 = millis() - _j662;
const _j428 = Math.min(_j427 / _j660, 1.0);
const _j823 = _j629 ? _j664 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j665[0] = lerp(_j663[0], _j823[0], _j428);
_j665[40] = lerp(_j663[40], _j823[40], _j428);
_j665[80] = lerp(_j663[80], _j823[80], _j428);
_j665[120] = lerp(_j663[120], _j823[120], _j428);
if (_j428 >= 1.0) {
_j665[0] = _j823[0];
_j665[40] = _j823[40];
_j665[80] = _j823[80];
_j665[120] = _j823[120];
if (!_j629) {
_j661 = false;
}
}
} else if (!_j629 && !_j661) {
_j665[0] = 0;
_j665[40] = 0;
_j665[80] = 0;
_j665[120] = 0;
}
}
function updateBlurEffect() {
const _j460 = doMoving && _j644 && _j643 !== null && _j629 && _j645;
const _j824 = _j629;
const _j825 = _j824 ? _j637 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j547));
const _j826 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j825 : (_j825 && _j530 > 0);
if (!doMoving) {
_j667[0] = 0;
_j667[40] = 0;
_j667[80] = 0;
_j667[120] = 0;
return;
}
if (_j824) {
if (_j671) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j666[0] = _j183(max(0, crandom.random(-5, 5)));
_j666[40] = _j183(max(0, crandom.random(-5, 5)));
_j666[80] = _j183(max(0, crandom.random(-5, 5)));
_j666[120] = _j183(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j668 = millis();
_j671 = false;
}
_j670 = _j825;
} else {
_j670 = false;
_j671 = false;
}
let _j827 = 0;
if (_j824) {
if (_j826) {
const _j427 = millis() - _j668;
const _j428 = min(1.0, _j427 / _j669);
_j827 = _j428;
} else if (_j548) {
const _j828 = map(_j569, 0, maxUpdates, 1.0, 0.0);
_j827 = _j828;
} else {
_j827 = 0;
}
if (_j460 && _j643 !== null) {
const _j424 = _j643.getDistance();
const _j420 = PI / 3;
const _j439 = height / (2 * tan(_j420 / 2));
const _j440 = 1.1;
const _j441 = 1.4;
const _j443 = _j439 / _j424;
const _j829 = _j441 - _j440;
const _j830 = (_j443 - _j440) / _j829;
const _j831 = constrain(_j830, 0.0, 1.0);
const _j832 = pow(_j831, 0.5);
_j827 = _j827 * _j832;
}
}
_j667[0] = _j666[0] * _j827;
_j667[40] = _j666[40] * _j827;
_j667[80] = _j666[80] * _j827;
_j667[120] = _j666[120] * _j827;
}
function drawLayersWithBlur() {
const _j460 = doMoving && _j644 && _j643 !== null && _j629 && _j645;
const _j489 = (typeof _j554 !== 'undefined' && _j554) ||
(typeof _j553 !== 'undefined' && _j553);
const _j490 = (typeof window !== 'undefined' && window.testMode === true);
const _j486 = ((_j547 || _j548) && _j569 < maxUpdates && _j575) || _j489 || _j490;
const _j833 = _j232.length > 0 && typeof _j21 === 'function';
const _j834 = false;
const _j835 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j512 && _j506;
if (_j507 && _j506) {
_j174();
}
_j613.begin();
clear();
if (_j835) {
let _j836 = _j615;
if (_j833) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j615, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j619, window.tempMetallicBuffer);
_j836 = _j619;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j512);
_j512.setUniform("rect", [0, 0, width * _j505, height * _j505]);
_j512.setUniform("tex0", _j836);
_j512.setUniform("forceMap", _j506);
_j512.setUniform("time", millis() * 0.005);
_j512.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j512.setUniform("distortEnabled", 1.0);
_j512.setUniform("displacementB", distortDisplacementB);
_j512.setUniform("displacementC", distortDisplacementC);
_j512.setUniform("showFbmMask", distortShowFbmMask);
_j512.setUniform("fbmSeed1", _j606[0] || 100);
_j512.setUniform("fbmSeed2", _j606[1] || 200);
_j512.setUniform("fbmSeed3", _j606[2] || 300);
_j512.setUniform("fbmSeed4", _j606[3] || 400);
} else {
_j512.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j512.setUniform("rsEnabled", 1.0);
_j512.setUniform("rsFrequency", _j581);
_j512.setUniform("rsWaveSpeed", _j582);
_j512.setUniform("rsStrength", _j583);
_j512.setUniform("rsGradientMix", _j584);
_j512.setUniform("rsScale", _j585);
} else {
_j512.setUniform("rsEnabled", 0.0);
}
_j512.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j512.setUniform("cellularScale", _j586);
_j512.setUniform("cellularSeed", _j587);
_j512.setUniform("whiteDotDensity", whiteDotEnabled ? _j588 : 0.0);
_j512.setUniform("grainAmount", grainEnabled ? _j589 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j615, 0, 0, width, height);
if (_j833) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j613, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j619, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j619, 0, 0, width, height);
}
}
_j613.end();
if (_j597 && _j598) {
const data = _j598;
const bounds = data.bounds;
const _j837 = {
rect: [0, 0, width * _j505, height * _j505],
blendType: data.blendType,
blendVol: _j604.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j604.pixD,
blendA: _j604.blendA,
blendB: _j604.blendB,
directVol: _j604.directVol,
snoiseVol: _j604.snoiseVol,
gobalStyle: _j604.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j604.colorDeep,
whiteDot: _j604.whiteDot,
doBigShape: _j604.doBigShape,
doMask: _j604.doMask,
multiDir: _j604.multiDir,
drawTime: _j604.drawTime,
seed: _j604.seed,
iTime: millis() * 0.001
};
if (typeMapBuffer && _j514) {
pingPongBuffer.begin();
clear();
shader(_j514);
for (const [key, val] of Object.entries(_j837)) {
_j514.setUniform(key, val);
}
_j514.setUniform('tex0', typeMapBuffer);
_j514.setUniform('lastStrokeTex', _j620);
_j514.setUniform('lastStrokeOnly', _j605 ? 1 : 0);
_j514.setUniform('isTypeMapMode', 1);
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
if (_j514) {
_j615.begin();
clear();
imageMode(CENTER);
image(oldBuffer, 0, 0, width, height);
_j615.end();
oldBuffer.begin();
shader(_j514);
for (const [key, val] of Object.entries(_j837)) {
_j514.setUniform(key, val);
}
_j514.setUniform('tex0', _j615);
_j514.setUniform('lastStrokeTex', _j620);
_j514.setUniform('lastStrokeOnly', _j605 ? 1 : 0);
_j514.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
oldBuffer.end();
}
if (_j514) {
_j615.begin();
clear();
imageMode(CENTER);
image(finalBuffer, 0, 0, width, height);
_j615.end();
finalBuffer.begin();
shader(_j514);
for (const [key, val] of Object.entries(_j837)) {
_j514.setUniform(key, val);
}
_j514.setUniform('tex0', _j615);
_j514.setUniform('lastStrokeTex', _j620);
_j514.setUniform('lastStrokeOnly', _j605 ? 1 : 0);
_j514.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
finalBuffer.end();
}
if (_j514) {
_j615.begin();
clear();
imageMode(CENTER);
image(_j613, 0, 0, width, height);
_j615.end();
_j613.begin();
shader(_j514);
for (const [key, val] of Object.entries(_j837)) {
_j514.setUniform(key, val);
}
_j514.setUniform('tex0', _j615);
_j514.setUniform('lastStrokeTex', _j620);
_j514.setUniform('lastStrokeOnly', _j605 ? 1 : 0);
_j514.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j613.end();
}
_j597 = false;
_j598 = null;
_j566 = true;
}
if (_j591 && _j514 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j613, 0, 0, width, height);
pingPongBuffer.end();
_j613.begin();
shader(_j514);
_j514.setUniform('rect', [0, 0, width * _j505, height * _j505]);
_j514.setUniform('tex0', pingPongBuffer);
_j514.setUniform('lastStrokeTex', _j620);
_j514.setUniform('lastStrokeOnly', _j605 ? 1 : 0);
_j514.setUniform('blendType', _j592);
_j514.setUniform('blendVol', _j604.blendVol * (1 + _j594 * 0.1));
_j514.setUniform('radSeed', _j596 * 0.001);
_j514.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j514.setUniform('pixD', _j604.pixD);
_j514.setUniform('blendA', _j604.blendA);
_j514.setUniform('blendB', _j604.blendB);
_j514.setUniform('directVol', _j604.directVol);
_j514.setUniform('snoiseVol', _j604.snoiseVol);
_j514.setUniform('gobalStyle', _j604.gobalStyle);
_j514.setUniform('vline', 5);
_j514.setUniform('hline', 5);
_j514.setUniform('cellT', 1.0);
_j514.setUniform('colorDeep', _j604.colorDeep);
_j514.setUniform('whiteDot', _j604.whiteDot);
_j514.setUniform('doBigShape', _j604.doBigShape);
_j514.setUniform('doMask', _j604.doMask);
_j514.setUniform('multiDir', _j604.multiDir);
_j514.setUniform('drawTime', _j604.drawTime);
_j514.setUniform('seed', _j604.seed);
_j514.setUniform('iTime', millis() * 0.001);
_j514.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j613.end();
}
noStroke();
push();
translate(0, 0, _j665[0]);
image(_j613, -width / 2, -height / 2);
pop();
if (_j486) {
push();
translate(0, 0, _j665[40]);
image(_j616, -width / 2, -height / 2);
pop();
}
if (_j629) {
if (showFuturePathPreview) {
_j42();
} else {
_j614.clear();
}
push();
translate(0, 0, _j665[80]);
image(_j614, -width / 2, -height / 2);
pop();
}
if (screenText && _j677) {
_j43();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j612.clear();
_j612.push();
_j45();
_j44();
_j612.pop();
} else {
_j612.clear();
_j612.push();
_j44();
_j612.pop();
}
const _j838 = (screenText && _j677) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0);
if (_j838) {
push();
translate(0, 0, _j665[120]);
image(_j612, -width / 2, -height / 2);
pop();
}
if (_j460) {
pop();
}
}
function drawMaskRect(x1, y1, x2, y2) {
var _j839 = height - y2;
var _j840 = height - y1;
push();
_j552.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 10000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
rectMode(CORNER);
rect(x1, _j839, x2 - x1, _j840 - _j839);
_j552.end();
pop();
_j554 = true;
}
function drawMaskPolygon(points) {
if (points.length < 3) return;
push();
_j552.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 10000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
beginShape();
for (let p of points) {
vertex(p.x, height - p.y);
}
endShape(CLOSE);
_j552.end();
pop();
_j554 = true;
}
function clearMask() {
push();
_j552.begin();
background(255);
_j552.end();
pop();
_j554 = false;
_j557 = [];
_j556 = null;
}
function testMaskRect() {
const cx = width / 2;
const cy = height / 2;
const size = 100;
const x1 = cx - size / 2;
const y1 = cy - size / 2;
_j556 = { x1: x1, y1: y1, x2: x1 + size, y2: y1 + size };
drawMaskRect(x1, y1, x1 + size, y1 + size);
console.log('[Mask] Test rect drawn at center:', x1, y1, size, 'x', size);
}
window.testMaskRect = testMaskRect;
window.clearMask = clearMask;
window.drawMaskRect = drawMaskRect;
window.drawMaskPolygon = drawMaskPolygon;
window.testMode = false;
let _j841 = null;
function _j38(src, _j1189) {
if (!src || !_j1189) return;
_j1189.begin();
clear();
push();
imageMode(CENTER);
image(src, 0, 0, width, height);
pop();
_j1189.end();
}
function enterTestMode() {
if (window.testMode) return;
if (!_j841) {
_j841 = {
oldBuffer: createFramebuffer({ density: _j505 }),
finalBuffer: createFramebuffer({ density: _j505 }),
pingPongBuffer: createFramebuffer({ density: _j505 }),
typeMapBuffer: createFramebuffer({ density: _j505 }),
newBufferBlack: createFramebuffer({ density: _j505 })
};
}
_j38(oldBuffer, _j841.oldBuffer);
_j38(finalBuffer, _j841.finalBuffer);
_j38(pingPongBuffer, _j841.pingPongBuffer);
_j38(typeMapBuffer, _j841.typeMapBuffer);
_j38(newBufferBlack, _j841.newBufferBlack);
_j841.allBrushStrokes = (typeof allBrushStrokes !== 'undefined') ? allBrushStrokes.slice() : null;
_j841.totalStrokeCount = (typeof totalStrokeCount !== 'undefined') ? totalStrokeCount : 0;
_j841.enterMillis = millis();
window.testMode = true;
_j566 = true;
}
function exitTestMode() {
if (!window.testMode) return;
if (_j841) {
_j38(_j841.oldBuffer, oldBuffer);
_j38(_j841.finalBuffer, finalBuffer);
_j38(_j841.pingPongBuffer, pingPongBuffer);
_j38(_j841.typeMapBuffer, typeMapBuffer);
_j38(_j841.newBufferBlack, newBufferBlack);
if (typeof allBrushStrokes !== 'undefined' && _j841.allBrushStrokes) {
allBrushStrokes = _j841.allBrushStrokes.slice();
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = _j841.totalStrokeCount;
}
if (typeof currentStrokeHighlight !== 'undefined') currentStrokeHighlight = null;
if (typeof pendingBugBounds !== 'undefined') pendingBugBounds = null;
if (typeof _j574 !== 'undefined') _j574 = null;
if (typeof _j841.enterMillis === 'number' &&
typeof _j626 !== 'undefined' &&
typeof _j621 !== 'undefined' && _j621) {
_j626 += millis() - _j841.enterMillis;
}
}
window.testMode = false;
_j566 = true;
}
window.enterTestMode = enterTestMode;
window.exitTestMode = exitTestMode;
function _j39() {
_j620.begin();
clear();
background(255);
imageMode(CENTER);
image(newBufferBlack, 0, 0);
_j620.end();
_j615.begin();
clear();
shader(_j510);
const _j474 = brushColorMode === 1 ? 1.0 : 0.0;
_j510.setUniform("rect", [0, 0, width * _j505, height * _j505]);
_j510.setUniform("baseTex", finalBuffer);
_j510.setUniform("strokeTex", newBufferBlack);
_j510.setUniform("brushColorMode", float(brushColorMode));
_j510.setUniform("brushCategory", _j474);
_j510.setUniform("whiteMaxOpacity", _j516);
_j510.setUniform("hueShift", _j517);
_j510.setUniform("satShift", _j518);
_j510.setUniform("briShift", _j519);
_j510.setUniform("keyBlendMode", keyBlendMode);
_j510.setUniform("useSharpen", useSharpen);
_j510.setUniform("typeMapTex", typeMapBuffer);
const _j842 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j510.setUniform("canvasBackgroundColor", _j842);
const _j843 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j510.setUniform("customBrushColor", _j843);
_j510.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
_j510.setUniform("useMask", _j554 ? 1.0 : 0.0);
if (_j554) _j510.setUniform("maskTex", _j552);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j615.end();
if (_j513 && typeMapBuffer) {
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j615, 0, 0);
pingPongBuffer.end();
_j615.begin();
clear();
shader(_j513);
_j513.setUniform("rect", [0, 0, width * _j505, height * _j505]);
_j513.setUniform("baseTex", typeMapBuffer);
_j513.setUniform("strokeTex", newBufferBlack);
_j513.setUniform("brushCategory", _j474);
_j513.setUniform("whiteMaxOpacity", _j516);
_j513.setUniform("useMask", _j554 ? 1.0 : 0.0);
if (_j554) _j513.setUniform("maskTex", _j552);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j615.end();
typeMapBuffer.begin();
clear();
background(0);
imageMode(CENTER);
image(_j615, 0, 0, width, height);
typeMapBuffer.end();
_j615.begin();
clear();
imageMode(CENTER);
image(pingPongBuffer, 0, 0);
_j615.end();
}
finalBuffer.begin();
clear();
background(255);
imageMode(CENTER);
image(_j615, 0, 0);
finalBuffer.end();
oldBuffer.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(newBufferBlack, 0, 0);
blendMode(BLEND);
oldBuffer.end();
if (_j565 && _j575 && pathPoints.length > 1) {
_j24(oldBuffer);
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
_j547 = false;
_j548 = false;
_j569 = 0;
_j549 = false;
_j550 = true;
let _j844 = null;
if (pathPoints.length > 0) {
let _j845 = 0,
_j846 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j845 += pt.x;
_j846 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j362 = _j845 / pathPoints.length;
const _j363 = _j846 / pathPoints.length;
_j574 = {
minX,
maxX,
minY,
maxY,
_j362,
_j363,
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
x: _j362,
y: _j363
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
if (allBrushStrokes.length > _j578) {
allBrushStrokes.shift();
}
_j844 = {
minX: _j574.minX,
maxX: _j574.maxX,
minY: _j574.minY,
maxY: _j574.maxY
};
}
pathPoints = [];
_j575 = false;
_j574 = null;
const _j847 = drawingSeed;
let _j848 = _j844;
if (!_j848 && allBrushStrokes.length > 0) {
const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
if (lastStroke.bounds) {
_j848 = {
...lastStroke.bounds
};
}
}
if (_j848) {
pendingBugBounds = _j848;
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
if (_j573 && _j629) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j849 = false;
if (_j629 && recordingData && recordingData.events) {
let _j850 = 0;
for (let e of recordingData.events) {
const _j859 = e.m || e.type;
if (_j859 === 'mr' || _j859 === 'mouseReleased') {
_j850++;
}
}
const _j851 = totalStrokeCount;
const _j852 = _j851 >= (_j850 - 12);
_j849 = _j852;
if (_j849) {
const _j853 = crandom.random(0, 1) > 0.1;
if (_j853) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j848 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j848;
}
}
}
} else if (!_j629) {
_j849 = true;
}
if (_j849) {
_j707 = true;
_j708 = strokeSeed;
if (!_j629 && _j848 && !pendingBugBounds) {
pendingBugBounds = _j848;
}
} else {
if (_j848 && !pendingBugBounds) {
pendingBugBounds = _j848;
}
}
randomSeed(_j847);
noiseSeed(_j847);
}
if (typeof gc !== 'undefined') {
gc();
}
_j566 = true;
}
function _j40() {
if (_j549 && !_j550) {
if (_j547 || _j548) {
_j39();
}
}
}
function _j41() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j854 = [];
const _j855 = 20;
let _j856 = _j631;
let _j851 = null;
const offsetX = typeof _j641 !== 'undefined' ? _j641 : 0;
const offsetY = typeof _j642 !== 'undefined' ? _j642 : 0;
const _j857 = 500;
let _j858 = 0;
while (_j854.length < _j855 && _j856 < recordingData.events.length && _j858 < _j857) {
const event = recordingData.events[_j856];
const _j859 = event.m || event.type;
if (_j859 === 'mp' || _j859 === 'mousePressed') {
_j851 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j856,
data: event.strokeData || event.d || {}
};
} else if ((_j859 === 'md' || _j859 === 'mouseDragged') && _j851) {
_j851.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j859 === 'mr' || _j859 === 'mouseReleased') && _j851) {
_j851.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j854.push(_j851);
_j851 = null;
}
_j856++;
_j858++;
}
return _j854;
}
function _j42() {
if (!_j629 || !recordingData.events || recordingData.events.length === 0) {
_j614.clear();
return;
}
const now = millis();
const _j860 =
_j580.lastEventIndex !== _j631 ||
(now - _j580.lastUpdateTime) > _j580.updateInterval;
if (_j860) {
_j580.cachedStrokes = _j41();
_j580.lastEventIndex = _j631;
_j580.lastUpdateTime = now;
}
const _j854 = _j580.cachedStrokes;
_j614.clear();
if (_j854.length === 0) {
return;
}
_j614.push();
const time = millis() * 0.003;
for (let i = 0; i < _j854.length; i++) {
const _j861 = _j854[i];
const path = _j861.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j854.length - 1, 200, 80);
const _j862 = sin(time + i * 0.8) * 0.3 + 1;
const _j863 = _j861.eventIndex * 0.1;
const _j864 = 20;
const _j865 = min(max(floor(path.length / 5), 2), _j864);
const _j866 = [];
for (let s = 0; s < _j865; s++) {
const t = s / (_j865 - 1);
const _j306 = t * (path.length - 1);
const _j867 = floor(_j306);
const _j868 = min(_j867 + 1, path.length - 1);
const _j869 = _j306 - _j867;
const x1 = path[_j867].x;
const y1 = path[_j867].y;
const x2 = path[_j868].x;
const y2 = path[_j868].y;
const t1 = path[_j867].t || 0;
const t2 = path[_j868].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j866.push({
x: lerp(x1, x2, _j869),
y: lerp(y1, y2, _j869),
t: lerp(t1, t2, _j869)
});
}
const _j870 = [];
let _j871 = 0.01;
for (let j = 1; j < _j866.length; j++) {
const dx = _j866[j].x - _j866[j-1].x;
const dy = _j866[j].y - _j866[j-1].y;
const dt = _j866[j].t - _j866[j-1].t;
const _j872 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j870.push(_j872);
if (_j872 > _j871) _j871 = _j872;
}
_j614.noFill();
_j614.strokeCap(ROUND);
for (let j = 1; j < _j866.length; j++) {
const _j789 = constrain(_j870[j-1] / _j871, 0, 1);
const r = Math.round(_j789 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j789 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j789) * 255);
_j614.stroke(r, g, b, 160);
_j614.strokeWeight(1.0);
_j614.line(
_j866[j-1].x, _j866[j-1].y,
_j866[j].x, _j866[j].y
);
}
let _j873 = 0;
for (let j = 0; j < _j866.length - 1; j++) {
_j873 += dist(_j866[j].x, _j866[j].y, _j866[j + 1].x, _j866[j + 1].y);
}
if (isNaN(_j873) || _j873 <= 0 || _j866.length < 2) {
continue;
}
const _j874 = constrain(floor(_j873 / 150), 1, 3);
for (let a = 0; a < _j874; a++) {
_j614.push();
const _j875 = (time * 0.1 + _j863 + a * (1.0 / _j874)) % 1.0;
const _j876 = _j875 * _j873;
let _j877 = 0;
let _j878 = _j866[0].x;
let _j879 = _j866[0].y;
let angle = 0;
for (let j = 0; j < _j866.length - 1; j++) {
const _j880 = dist(_j866[j].x, _j866[j].y, _j866[j + 1].x, _j866[j + 1].y);
if (_j880 <= 0.0001) {
_j878 = _j866[j + 1].x;
_j879 = _j866[j + 1].y;
if (j + 1 < _j866.length - 1) {
angle = atan2(_j866[j + 2].y - _j866[j + 1].y, _j866[j + 2].x - _j866[j + 1].x);
} else {
angle = atan2(_j866[j + 1].y - _j866[j].y, _j866[j + 1].x - _j866[j].x);
}
break;
}
if (_j877 + _j880 >= _j876) {
const _j869 = (_j876 - _j877) / _j880;
const _j881 = isNaN(_j869) || !isFinite(_j869) ? 0 : constrain(_j869, 0, 1);
_j878 = lerp(_j866[j].x, _j866[j + 1].x, _j881);
_j879 = lerp(_j866[j].y, _j866[j + 1].y, _j881);
angle = atan2(_j866[j + 1].y - _j866[j].y, _j866[j + 1].x - _j866[j].x);
break;
}
_j877 += _j880;
}
const _j882 = 200 * (1 - _j875 * 0.5);
_j614.translate(_j878, _j879);
_j614.rotate(angle);
const _j883 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j614.fill(0, 0, 255, _j882);
_j614.noStroke();
_j614.triangle(
0, 0,
-4 * _j883, -2 * _j883,
-4 * _j883, 2 * _j883
);
_j614.stroke(0, 150, 255, _j882);
_j614.strokeWeight(0.3);
_j614.noFill();
_j614.triangle(
0, 0,
-4 * _j883, -2 * _j883,
-4 * _j883, 2 * _j883
);
_j614.pop();
}
const _j884 = path[0];
const _j406 = path[path.length - 1];
_j614.noFill();
_j614.stroke(0, 0, 255, 150);
_j614.strokeWeight(0.8);
_j614.ellipse(_j884.x, _j884.y, 5, 5);
_j614.ellipse(_j406.x, _j406.y, 5, 5);
_j614.noStroke();
_j614.fill(0, 0, 255, 255);
_j614.ellipse(_j884.x, _j884.y, 2, 2);
_j614.ellipse(_j406.x, _j406.y, 2, 2);
if (font) {
_j614.textFont(font);
_j614.noStroke();
const data = _j861.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j885 = _j884.x - 2;
const _j886 = _j884.y + 8;
_j614.textSize(6);
_j614.fill(0, 0, 255, 255);
_j614.textAlign(LEFT, CENTER);
_j614.text('#' + (i + 1), _j885, _j886);
}
}
_j614.pop();
}
function _j43() {
_j612.clear();
_j612.push();
_j612.noFill();
_j612.noStroke();
_j612.rectMode(CENTER);
let _j789 = (width * 0.05) / height;
_j612.rect(0, 0, width * 0.95, height * (1 - _j789));
_j612.translate(-width / 2 - 5, -height / 2 + 20);
_j612.textAlign(LEFT, TOP);
if (font) {
_j612.textFont(font);
}
_j612.textSize(6);
let _j887 = width - 50;
_j612.fill(0, 0, 0, 100);
_j612.noStroke();
let _j888 = [];
let _j272 = _j703;
let _j889 = Math.max(0, _j699.length - _j700 - _j701);
let _j890 = _j699.length;
for (let i = _j889; i < _j890; i++) {
let line = _j699[i];
let _j891 = _j46(line.text, _j887, _j612);
for (let j = 0; j < _j891.length; j++) {
if (_j888.length >= _j700) break;
_j888.push({
type: line.type,
text: _j891[j],
timestamp: line.timestamp
});
}
if (_j888.length >= _j700) break;
}
for (let i = 0; i < _j888.length; i++) {
let line = _j888[i];
let y = _j703 + i * _j704;
if (line.type === 'recording') {
_j612.fill(255, 0, 0, _j705);
} else if (line.type === 'playback') {
_j612.fill(0, _j705);
} else if (line.type === 'system') {
_j612.fill(0, 0, 255, _j705);
} else if (line.type === 'art') {
_j612.fill(0, _j705);
} else {
_j612.fill(0, _j705);
}
_j612.text("--", _j702, y);
_j612.text(line.text, _j702, y);
}
_j45();
_j612.pop();
_j44();
}
function _j44() {
if (window.showStrokeDivider === false) return;
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (strokeCount === 0) return;
_j612.push();
_j612.resetMatrix();
_j612.translate(0, 0);
const _j892 = hh - 15;
const _j893 = width * 0.98;
const _j894 = -_j893 / 2;
const _j895 = _j893 / 2;
const _j896 = _j895 - _j894;
_j612.stroke(0, 50);
_j612.strokeWeight(1);
_j612.noFill();
_j612.line(_j894, _j892, _j895, _j892);
_j612.strokeWeight(1.2);
_j612.line(_j894, _j892 + 5, _j894, _j892 - 5);
_j612.line(_j895, _j892 + 5, _j895, _j892 - 5);
if (strokeCount > 0) {
const _j897 = _j896 / strokeCount;
_j612.stroke(0, 70);
_j612.strokeWeight(0.7);
for (let i = 1; i < strokeCount; i++) {
const x = _j894 + i * _j897;
_j612.line(x, _j892 - 5, x, _j892);
}
if (font) _j612.textFont(font);
_j612.textAlign(CENTER, CENTER);
_j612.textSize(10);
_j612.fill(0, 50);
_j612.noStroke();
const _j885 = _j895;
const _j886 = _j892 - 15;
_j612.text(strokeCount.toString(), _j885, _j886);
}
_j612.pop();
}
function _j45() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j898 = millis();
const _j427 = _j898 - currentStrokeHighlight.startTime;
const _j899 = 1000;
const _j900 = _j899 * 0.5;
if (_j427 < _j899) {
let alpha = 255;
if (_j427 > _j900) {
const _j901 = (_j427 - _j900) / (_j899 - _j900);
alpha = 255 * (1 - _j901);
}
const gp = currentStrokeHighlight.gridParams;
_j612.push();
_j612.resetMatrix();
_j612.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j398 = 5;
const _j399 = 5;
_j612.stroke(255, 0, 0, alpha);
_j612.strokeWeight(1);
_j612.noFill();
let _j902 = true;
let _j877 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j400 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j400;
let dy = (y2 - y1) / _j400;
let _j401 = 0;
while (_j401 < _j400) {
let _j402 = _j902 ? _j398 : _j399;
let _j403 = min(_j402 - _j877, _j400 - _j401);
if (_j902) {
let startX = x1 + dx * _j401;
let startY = y1 + dy * _j401;
let _j404 = x1 + dx * (_j401 + _j403);
let _j405 = y1 + dy * (_j401 + _j403);
_j612.line(startX, startY, _j404, _j405);
}
_j401 += _j403;
_j877 += _j403;
if (_j877 >= (_j902 ? _j398 : _j399)) {
_j902 = !_j902;
_j877 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j884 = currentStrokeHighlight.points[0];
const _j406 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j612.fill(255, 0, 0, alpha);
_j612.noStroke();
_j612.ellipse(_j884.x, _j884.y, 5, 5);
_j612.fill(255, 0, 0, alpha);
_j612.ellipse(_j406.x, _j406.y, 5, 5);
}
}
const _j362 = (gp.left + gp.right) / 2;
const _j363 = (gp.top + gp.bottom) / 2;
_j612.stroke(0, 0, 200, alpha);
_j612.strokeWeight(1.0);
_j612.noFill();
_j612.rectMode(CORNER);
_j612.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j612.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j46(text, _j1518, _j1508 = null) {
let _j903 = text.split(' ');
let _j764 = [];
let _j904 = '';
for (let i = 0; i < _j903.length; i++) {
let _j905 = _j904 + (_j904 ? ' ' : '') + _j903[i];
let _j906 = _j1508 ? _j1508.textWidth(_j905) : textWidth(_j905);
if (_j906 > _j1518 && _j904) {
_j764.push(_j904);
_j904 = _j903[i];
} else {
_j904 = _j905;
}
}
if (_j904) {
_j764.push(_j904);
}
return _j764;
}
function _j47() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.style.width = (width * 1.0) + 'px';
referenceContainer.style.height = (height * 1.0) + 'px';
_j111('system', 'Reference image size updated', {
Width: (width * 0.8) + 'px',
Height: (height * 0.8) + 'px'
});
}
}
function touchStarted(e) {
if (e && e.touches && e.touches.length > 0) {
var t = e.touches[0];
if (_j48(t.clientX, t.clientY)) {
_j564 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j542 = _j183(mouseX);
_j543 = _j183(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j564) return true;
if (_j553) return true;
_j542 = _j183(mouseX);
_j543 = _j183(mouseY);
return false;
}
function touchEnded() {
if (_j564) {
_j564 = false;
return true;
}
_j564 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j48(clientX, clientY) {
const _j907 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('mask-panel'),
document.getElementById('zen-mode-btn'),
document.getElementById('collect-panels-btn')
];
for (let panel of _j907) {
if (!panel) continue;
const rect = panel.getBoundingClientRect();
if (clientX >= rect.left && clientX <= rect.right &&
clientY >= rect.top && clientY <= rect.bottom) {
return true;
}
}
return false;
}
function _j49() {
if (allBrushStrokes.length === 0) return null;
const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
if (lastStroke && lastStroke.bounds) {
const _j908 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j908)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j908)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j908)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j908)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j908 = 20;
return {
minX: Math.max(0, (gp.left - _j908)) / width,
minY: Math.max(0, (gp.top - _j908)) / height,
maxX: Math.min(width, (gp.right + _j908)) / width,
maxY: Math.min(height, (gp.bottom + _j908)) / height
};
}
return null;
}
function _j50(blendType, seed = null, _j1519 = false) {
if (!_j514) return;
_j591 = true;
_j592 = blendType;
_j593 = millis();
_j599 = 0;
_j594 = 0;
_j602 = _j1519;
_j596 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j604.seed = _j596 * 0.0001;
}
function _j51() {
if (!_j591) return null;
const duration = millis() - _j593;
const iterations = _j594;
const frames = _j599;
if (iterations > 0 && flowEffectStrokeBounds) {
_j597 = true;
_j598 = {
blendType: _j592,
iterations: iterations,
seed: _j596,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j591 = false;
_j592 = 0;
_j602 = false;
return {
duration,
iterations,
frames
};
}
function _j52() {
if (!_j591) return;
_j599++;
_j594 = Math.floor(_j599 / _j603);
if (_j602 && _j600 > 0) {
if (_j599 >= _j600) {
_j594 = _j601;
const _j909 = document.getElementById('flow-iteration-count');
if (_j909) {
_j909.textContent = _j594;
}
_j51();
_j600 = 0;
_j601 = 0;
return;
}
}
const _j909 = document.getElementById('flow-iteration-count');
if (_j909) {
_j909.textContent = _j594;
}
}
function _j53(blendType, seed, iterations) {
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
_j604.seed = seed * 0.0001;
_j597 = true;
_j598 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j598);
}
const _j910 = [{
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
function _j54(_j1508, _j921, _j922, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j921, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j922, alpha);
}
}
function _j55(_j1508, _j921, _j922, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j921, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j922, alpha);
}
}
function _j56(id, _j1508, _j1004, x, y, _j965, _j966, _j958, _j959, _j979, sizeVariation, _j998) {
let _j911 = _j979 * sizeVariation + _j998;
const _j912 = (_j551 && typeof _j563 !== 'undefined' && _j563 !== null) ? _j563 : baseBrushSize;
const _j913 = _j912 < 0.25;
let _j914 = _j913 ? max(2.0, _j912 * 10) : 15;
if (_j911 > _j914) {
_j911 = crandom.random(_j913 ? 0.6 : 1, _j914);
}
let sw = max(_j913 ? 0.6 : 1, _j911);
if (sw < 3) sw *= 2.0;
const offsetX = _j1004.offsetX;
const offsetY = _j1004.offsetY;
if (brushModeSP) {
const _j915 = max(0.15, min(1.5, _j912));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j916 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j915, 6 * _j915) : crandom.random(-16 * _j915, 16 * _j915);
let _j917 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j915, 6 * _j915) : crandom.random(-16 * _j915, 16 * _j915);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j958,
y + offsetY + _j959,
_j965 + offsetX + _j916,
_j966 + offsetY + _j917
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j958,
y + offsetY + _j959,
_j965 + offsetX,
_j966 + offsetY
);
}
} else if (!brushModeSP) {
if (_j912 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j958,
y + offsetY + _j959,
_j965 + offsetX,
_j966 + offsetY
);
}
}
const _j918 = [{
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
const _j919 = [{
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
const _j920 = [{
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
function _j57(_j1508, _j1520, _j1521) {
if (_j570 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j570, ">=", expectedStrokeLength, ")");
return;
}
_j1508.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j921 = _j60(_j515);
let _j922 = _j60(_j515);
const _j923 = _j629 ? _j635 : pmouseX;
const _j924 = _j629 ? _j636 : pmouseY;
let _j925 = 0.5 * initialSize * noise(_j1520 * 0.01, _j1521 * 0.01) * (abs(_j1520 - _j923) + abs(_j1521 - _j924));
const _j926 = (_j551 && typeof _j563 !== 'undefined' && _j563 !== null) ? _j563 : baseBrushSize;
let _j927 = 0;
_j927 = min(spraySize * _j926, _j925) * map(noise(_j1520, _j1521), 0, 1, 0.3, 1);
let _j928 = max(3, _j927);
if (_j570 < 5) {
let _j929 = map(_j570, 0, 5, -0.2, 1.0);
_j928 = max(2, _j927 * _j929);
} else if (_j570 >= (expectedStrokeLength - 5)) {
let _j930 = map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j928 = max(2, _j927 * _j930);
}
for (let i = 0; i < _j577; i++) {
const _j931 = lerp(_j1520, _j923, i / _j577)
const lerpY = lerp(_j1521, _j924, i / _j577)
for (let j = 0; j < 10; j++) {
let _j916, _j917;
let _j932 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j933 = crandom.random(TWO_PI);
const _j934 = crandom.random();
const _j935 = crandom.random(-_j928 * _j932, _j928 * _j932);
const _j936 = crandom.random(-_j928 * _j932, _j928 * _j932);
if (shapeType === 0) {
const angle = _j933;
const radius = sqrt(_j934) * _j928;
_j916 = radius * cos(angle);
_j917 = radius * sin(angle);
} else if (shapeType === 1) {
_j916 = sin(_j933) * _j935;
_j917 = cos(_j933) * _j936;
} else if (shapeType === 2) {
const u = _j933 / TWO_PI;
const v = _j934;
if (u + v > 1) {
_j916 = _j928 * (1 - u);
_j917 = _j928 * (1 - v);
} else {
_j916 = _j928 * u;
_j917 = _j928 * v;
}
_j916 -= _j928 * 0.5;
_j917 -= _j928 * 0.5;
} else {
const u = _j935 / _j928;
const v = _j936 / _j928;
const _j937 = abs(u) + abs(v);
if (_j937 > 1) {
_j916 = (u / _j937) * _j928;
_j917 = (v / _j937) * _j928;
} else {
_j916 = u * _j928;
_j917 = v * _j928;
}
}
let _j779 = crandom.random(0, 1);
let _j780 = crandom.random(0.2, 1);
let _j938 = crandom.random(1, 2);
let _j939 = _j926 < 0.25 ? 0.1 : 0.3;
_j780 = max(_j939, _j780 * _j926);
_j938 = max(_j939, _j938 * _j926);
let _j940 = crandom.random(100, 255);
let ss = _j779 > 0.1 ? _j780 : _j938;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j941 = _j926 < 0.25 ? max(0.3, _j926 * 3) : 2;
let _j942 = _j926 < 0.25 ? _j926 * 5 : 20;
ss = max(_j941, min(_j942, ss));
_j55(_j1508, _j921, _j922, brushColorMode, _j940);
noStroke();
ellipse(_j931 + _j916, lerpY + _j917, ss, ss)
}
}
pop();
_j1508.end();
}
function _j58(_j1508, _j1520, _j1521, _j798, _j521 = 0, _j1522 = 0) {
if (_j570 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j570, ">=", expectedStrokeLength, ")");
return;
}
_j1508.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j921 = _j60(_j515);
let _j922 = _j60(_j515);
const _j943 = (_j551 && typeof _j563 !== 'undefined' && _j563 !== null) ? _j563 : baseBrushSize;
const _j944 = _j551 ? (_j629 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j561) : -1;
const _j945 = (_j944 >= 0) ? (0.7 + 0.4 * Math.min(_j944 / 0.7, 1.0)) : 1.0;
let _j913 = _j943 < 0.25;
let _j946 = 0.6;
let _j947 = _j913 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j946, baseBrushSize * 2);
let _j948 = max(_j946, baseBrushSize * 1.5);
let _j949 = _j913 ? swFloorTiny : _j948;
if (_j949 < 3) _j949 *= 2.0;
let _j950 = _j913 ?
swFloorTiny :
max(_j946, baseBrushSize * 1.2);
if (_j950 < 3) _j950 *= 2.0;
let _j951;
if (_j913) {
_j951 = max(2.0, _j943 * 10);
} else if (_j943 < 0.5) {
_j951 = 0.7;
} else {
_j951 = 9999;
}
_j538 = _j528 * 0.5;
let _j437 = _j1520;
let _j438 = _j1521;
if (!_j541) {
_j541 = 1;
x = _j437;
y = _j438;
}
_j525 += (_j437 - x) * _j522;
_j526 += (_j438 - y) * _j522;
_j525 *= _j523;
_j526 *= _j523;
let _j952 = sqrt(_j525 * _j525 + _j526 * _j526);
_j527 += _j952 - _j527;
if (baseBrushSize <= 1.0) {
_j527 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j527 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j527 *= 2.0;
} else {
_j527 *= 3.0;
}
_j528 = _j524 - _j527;
let _j953 = brushPaintCtlNoisebyFrame;
let _j954 = 1.0 * baseBrushSize * _j953 * _j945;
let _j955 = 2.0 * baseBrushSize * _j953 * _j945;
let _j956 = 3.0 * baseBrushSize * _j953 * _j945;
let showMainBrush = 0.1;
let _j957 = initialSize;
let _j958 = 0;
let _j959 = 0;
if (_j1522 == 0) showMainBrush = 0.08;
else if (_j1522 == 1) showMainBrush = 0.6;
else if (_j1522 == 2) showMainBrush = 0.2;
let _j960 = 1.0;
let _j961 = _j520 + brushPaintInterpolationOffset;
for (let i = 0; i < _j961; ++i) {
let _j962 = baseBrushSize >= 1.0 ? 5 : 3;
let _j963 = baseBrushSize >= 1.0 ? 2 : 0;
let _j964 = 0;
if (baseBrushSize < 1.5) _j964 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j964 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j964 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j964 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j521 = _j964;
if (_j570 < 5) _j521 = crandom.random(0, 1) > 0.2 ? 5 : _j521;
let _j965 = x;
let _j966 = y;
x += _j525 / _j961;
y += _j526 / _j961;
let _j967 = crandom.random(0, 1);
let _j968 = crandom.random(0, 4);
let _j969 = crandom.random(0, 3);
let _j970 = crandom.random(-1, 1);
let _j971 = crandom.random(-1, 1);
let _j972 = crandom.random(-1, 1);
let _j973 = crandom.random(-1, 1);
let _j974 = showMainBrush;
let _j975 = 1.0;
if (_j521 == 3) {
_j974 *= 0.8;
_j975 *= 0.8;
} else if (_j521 == 4) {
_j974 *= 0.6;
_j975 *= 0.5;
}
if (_j943 < 0.25) {
_j974 = 0.18;
} else if (_j943 < 1.5) {
_j974 = 0.1;
}
_j532 = lerp(_j532, _j528, 0.5);
if (brushMode == 1) {
if (_j967 > 0.8 && _j538 < 2 && i == 0) {
_j538 = _j183(_j968);
}
} else {
_j538 += (_j532 - _j538) * 0.3;
}
let _j976;
if (brushMode == 1) {
_j976 = _j538;
} else {
if (_j570 < 5) {
let _j929 = map(_j570, 0, 5, 0.05, 1.0);
_j976 = max(_j913 ? 0.1 : 0.5, _j538 * _j929);
if (explodeStart) {
_j958 = _j970 * map(_j570, 0, 5, 10, 0);
_j959 = _j971 * map(_j570, 0, 5, 10, 0);
}
} else if (_j570 >= (expectedStrokeLength - 5)) {
let _j930 = map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j976 = max(_j913 ? 0.1 : 0.5, _j538 * _j930);
if (explodeEnd) {
_j958 = _j972 * map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j959 = _j973 * map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j538 > 2) {
_j976 = max(_j913 ? 0.2 : 1, _j538);
} else {
let _j977 = (_j969 / 3) - 0.5;
_j976 = max(_j913 ? 0.1 : 0.5, _j538 + _j977);
}
}
}
let _j978 = _j976;
let _j979 = _j976 * 0.5;
if (_j521 == 3) {
_j978 *= 0.8;
_j979 *= 0.8;
} else if (_j521 == 4) {
_j978 *= 0.5;
_j979 *= 0.5;
}
let _j980 = crandom.random(0, 1);
let _j981 = crandom.random(150, 255);
let _j982 = crandom.random(100, 255);
let _j983 = crandom.random(100, 255);
let _j984 = crandom.random(100, 255);
if (_j913) {
if (!brushModeSP && _j570 > 1) {
_j54(_j1508, _j921, _j922, brushColorMode, _j981);
let kk = min(_j957, max(_j949, _j978));
strokeWeight(min(_j951, kk));
line(x + _j958, y + _j959, _j965, _j966);
}
} else if (_j980 > _j974) {
_j54(_j1508, _j921, _j922, brushColorMode, _j981);
const _j985 = !brushModeSP && _j570 > 3 && baseBrushSize < 4.0;
if (_j978 < 5) {
let kk = 0;
if (_j1522 == 0) kk = 1.5 * min(_j957, max(_j949, _j978));
else kk = min(_j957, max(_j949, _j978));
strokeWeight(min(_j951, kk));
if (_j985) line(x + _j958, y + _j959, _j965, _j966)
} else {
let kk = _j975 * min(_j957, max(_j949, _j978));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j951, kk));
if (_j985) line(x + _j958, y + _j959, _j965, _j966)
}
}
const _j986 = [];
const _j987 = [];
for (let j = 0; j < 30; j++) {
_j986.push(crandom.random(0, 1));
_j987.push(crandom.random(-0.5, 0.5) * _j960);
}
if (_j1522 == 1) {
_j986[0] = _j986[0] * 2.0;
_j986[1] = _j986[1] * 0.5;
_j986[2] = _j986[2] * 0.5;
} else if (_j1522 == 2) {
_j986[0] = _j986[0] * 0.5;
_j986[1] = _j986[1] * 0.5;
_j986[2] = _j986[2] * 0.5;
}
const _j988 = _j910[brushDir];
if (_j521 == 0) {
_j54(_j1508, _j921, _j922, brushColorMode, _j982);
if (_j986[0] > 0.2) {
const _j989 = _j988.flip1stX ? -1 : +1;
const _j990 = _j988.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j987[0], sizeVariation);
if (_j979 * sizeVariation < 5) {
strokeWeight(min(_j951, noise(x * 0.1, y * 0.2) + 1.5 * max(_j950, _j979 * sizeVariation)));
} else {
strokeWeight(min(_j951, _j975 * max(_j947, _j979 * sizeVariation)));
}
line(x + _j989 * _j955 + _j958, y + _j990 * _j955 + _j959, _j965 + _j989 * _j955, _j966 + _j990 * _j955);
}
if (_j986[1] > 0.3) {
const _j991 = _j988.flip1stX ? -1 : +1;
const _j992 = _j988.flip1stY ? +1 : -1;
_j54(_j1508, _j921, _j922, brushColorMode, _j983);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j987[1], sizeVariation);
strokeWeight(min(_j951, _j975 * max(_j947, _j979 * sizeVariation)));
line(x + _j991 * _j955 + _j958, y + _j992 * _j955 + _j959, _j965 + _j991 * _j955, _j966 + _j992 * _j955);
}
} else if (_j521 == 1) {
_j54(_j1508, _j921, _j922, brushColorMode, _j982);
if (_j986[0] > 0.1) {
const _j989 = _j988.flip1stX ? -1 : +1;
const _j990 = _j988.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j987[0], sizeVariation);
strokeWeight(min(_j951, _j975 * max(_j947, _j979 * sizeVariation)));
line(x + _j989 * _j955 + _j958, y + _j990 * _j955 + _j959, _j965 + _j989 * _j955, _j966 + _j990 * _j955)
};
if (_j986[1] > 0.05) {
const _j991 = _j988.flip1stX ? -1 : +1;
const _j992 = _j988.flip1stY ? +1 : -1;
_j54(_j1508, _j921, _j922, brushColorMode, _j983);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j987[1], sizeVariation);
strokeWeight(min(_j951, _j975 * max(_j947, _j979 * sizeVariation)));
line(x + _j991 * _j954 + _j958, y + _j992 * _j954 + _j959, _j965 + _j991 * _j954, _j966 + _j992 * _j954)
};
if (_j986[2] > 0.15) {
const _j993 = -1;
const _j994 = -1;
_j54(_j1508, _j921, _j922, brushColorMode, _j984);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j987[2], sizeVariation);
if (_j979 * sizeVariation < 5) {
strokeWeight(min(_j951, noise(x * 1, y * 2) + 1.5 * max(_j950, _j979 * sizeVariation)));
} else {
strokeWeight(min(_j951, _j975 * max(_j947, _j979 * sizeVariation)));
}
line(x + _j993 * _j956 + _j958, y + _j994 * _j956 + _j959, _j965 + _j993 * _j956, _j966 + _j994 * _j956)
};
} else if (_j521 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j54(_j1508, _j921, _j922, brushColorMode, _j982);
const _j995 = [_j986[0], _j986[1], _j986[2], _j986[3], _j986[4]];
const _j996 = [_j987[3], _j987[4], _j987[5], _j987[6], _j987[7]];
for (let i = 0; i < _j918.length; i++) {
const _j267 = _j918[i];
const _j997 = _j995[i];
const _j998 = _j996[i];
if (_j997 > _j267.randThreshold) {
let _j999;
if (_j267.offsetBase === 1) {
_j999 = _j954;
} else if (_j267.offsetBase === 2) {
_j999 = _j955;
} else if (_j267.offsetBase === 3) {
_j999 = _j956;
} else {
_j999 = _j267.offsetBase * baseBrushSize * _j953;
}
let _j1000, _j1001;
if (i === 0) {
_j1000 = _j988.flip1stX ? -_j267.signX : _j267.signX;
_j1001 = _j988.flip1stY ? -_j267.signY : _j267.signY;
} else {
_j1000 = _j267.signX;
_j1001 = _j267.signY;
}
let _j1002 = _j1000 * _j999;
let _j1003 = _j1001 * _j999;
const _j1004 = {
offsetX: _j1002,
offsetY: _j1003,
randThreshold: _j267.randThreshold,
pathProgressEnd: _j267.pathProgressEnd,
jitterIndex: _j267.jitterIndex
};
_j56(
2, _j1508, _j1004, x, y, _j965, _j966,
_j958, _j959, _j979, sizeVariation,
_j998
);
}
}
} else if (_j521 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j54(_j1508, _j921, _j922, brushColorMode, _j982);
let _j1005 = baseBrushSize * _j953;
if (baseBrushSize > 4.0) _j1005 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j919.length; i++) {
let _j1006 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j267 = _j919[i];
const _j997 = _j986[i];
const _j998 = _j987[_j267.jitterIndex];
if (_j997 > _j267.randThreshold) {
const _j1007 = cos(_j267.angle + _j1006) * _j267.radius * _j1005;
const _j1008 = sin(_j267.angle + _j1006) * _j267.radius * _j1005;
const _j1002 = (_j988.flip1stX ? -1 : 1) * _j1007;
const _j1003 = (_j988.flip1stY ? -1 : 1) * _j1008;
const _j1004 = {
offsetX: _j1002,
offsetY: _j1003,
randThreshold: _j267.randThreshold,
pathProgressEnd: _j267.pathProgressEnd,
jitterIndex: _j267.jitterIndex
};
_j56(
3, _j1508, _j1004, x, y, _j965, _j966,
_j958, _j959, _j979, sizeVariation,
_j998
);
}
}
} else if (_j521 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j54(_j1508, _j921, brushColorMode, _j982);
let _j1005 = baseBrushSize * _j953;
if (baseBrushSize > 4.0) _j1005 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j920.length; i++) {
let _j1006 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j267 = _j920[i];
const _j997 = _j986[i];
const _j998 = _j987[_j267.jitterIndex];
if (_j997 > _j267.randThreshold) {
const _j1007 = cos(_j267.angle + _j1006) * _j267.radius * _j1005;
const _j1008 = sin(_j267.angle + _j1006) * _j267.radius * _j1005;
const _j1002 = (_j988.flip1stX ? -1 : 1) * _j1007;
const _j1003 = (_j988.flip1stY ? -1 : 1) * _j1008;
const _j1004 = {
offsetX: _j1002,
offsetY: _j1003,
randThreshold: _j267.randThreshold,
pathProgressEnd: _j267.pathProgressEnd,
jitterIndex: _j267.jitterIndex
};
_j56(
4, _j1508, _j1004, x, y, _j965, _j966,
_j958, _j959, _j979, sizeVariation,
_j998
);
}
}
}
}
pop();
_j1508.end();
}
function _j59(_j1508, _j1520, _j1521, _j1523 = null, _j1524 = null, n = 80, o = 2) {
_j1508.begin();
push();
translate(-hw, -hh);
const _j923 = (_j1523 !== null && _j1524 !== null) ? _j1523 : (_j629 ? _j635 : pmouseX);
const _j924 = (_j1523 !== null && _j1524 !== null) ? _j1524 : (_j629 ? _j636 : pmouseY);
const _j1009 = (_j551 && typeof _j563 !== 'undefined' && _j563 !== null) ? _j563 : baseBrushSize;
const _j1010 = baseBrushSize;
const _j1011 = _j570;
const _j1012 = max(_j1009 < 0.25 ? 0.3 : 1, initialSize - (_j570 * randStep));
o = min(_j1010 * 2.0, 5 * _j1012 * penSketchNoiseBase * map(sin(_j1011 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1520 - _j923) > 0.1 || abs(_j1521 - _j924) > 0.1;
let _j921 = _j60(_j515);
let _j922 = _j60(_j515);
const _j1013 = [];
for (let i = 0; i < n; i++) {
_j1013.push({
t: crandom.random(0, 1),
strokeWeight: max(_j1009 < 0.25 ? 0.1 : 0.3, min(_j1009 < 0.25 ? _j1010 * 5 : 2, _j1010 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j1014 = _j1013[i];
let t = _j1014.t;
strokeWeight(_j1014.strokeWeight);
const angle = _j1014.angle;
const radius = _j1014.radius;
let _j1015 = radius * cos(angle);
let _j1016 = radius * sin(angle);
let _j940 = _j1014.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1520, _j923, t) + _j1015;
y = lerp(_j1521, _j924, t) + _j1016;
} else {
x = _j1520 + _j1015;
y = _j1521 + _j1016;
}
_j54(_j1508, _j921, _j922, brushColorMode, _j940);
if (_j570 > 3) point(x, y);
}
pop();
_j1508.end();
}
if (typeof _j61.lastAngle === 'undefined') {
_j61.lastAngle = 0;
}
if (typeof _j61.lastMovementAngle === 'undefined') {
_j61.lastMovementAngle = 0;
}
const _j1017 = [{
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
function _j60(_j921) {
if (brushColorMode === 0) {
return _j921 + crandom.random(10, 40);
} else {
return _j921 + crandom.random(30, 80);
}
}
function _j61(_j1508, _j1520, _j1521, _j798, _j521 = 0, _j1522 = 0) {
if (_j570 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j570, ">=", expectedStrokeLength, ")");
return;
}
const _j1018 = (_j551 && typeof _j563 !== 'undefined' && _j563 !== null) ? _j563 : baseBrushSize;
let _j913 = _j1018 < 0.25;
let _j951 = _j913 ? _j1018 * 5 : 9999;
_j1508.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j921 = _j60(_j515);
let _j922 = _j60(_j515);
let _j957 = initialSize * 0.3;
let _j437 = _j1520;
let _j438 = _j1521;
if (!_j541) {
_j541 = 1;
x = _j437;
y = _j438;
}
_j525 += (_j437 - x) * _j522;
_j526 += (_j438 - y) * _j522;
_j525 *= _j523;
_j526 *= _j523;
_j527 += sqrt(_j525 * _j525 + _j526 * _j526) - _j527;
_j527 *= 1.2;
if (baseBrushSize <= 1.0) {
_j527 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j527 *= 1.3;
} else {
_j527 *= 1.5;
}
_j528 = _j524 - _j527;
let _j1019 = _j532;
let _j1020 = _j528;
let _j1021 = _j437 - x;
let _j1022 = _j438 - y;
let _j1023 = sqrt(_j1021 * _j1021 + _j1022 * _j1022);
let _j1024 = max(_j913 ? 0.1 : 0.5, _j1020 * 0.5);
let _j1025 = 1.5 * min(_j957, max(_j913 ? 0.5 : 4, _j1024));
let _j1026 = _j1025 * 0.6;
let _j1027 = 0.8;
let _j1028 = max(_j1026 * _j1027, 0.5);
let _j1029 = max(1, ceil(_j1023 / _j1028));
_j1029 = max(10, min(50, _j1029));
let _j1030 = _j1029 / _j520;
let _j958 = 0;
let _j959 = 0;
let _j1031 = min(1.0, _j1023 / 10);
let _j1032 = _j1031 > 0.3;
rectMode(CENTER);
let _j231 = crandom.random(50, 100);
const _j234 = [];
for (let i = 0; i < _j520; ++i) {
_j234.push({
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
for (let i = 0; i < _j520; ++i) {
const _j1033 = _j234[i];
let _j965 = x;
let _j966 = y;
x += _j525 / _j520;
y += _j526 / _j520;
let _j428 = (i + 1) / _j520;
let _j1034 = lerp(_j1019, _j1020, _j428);
_j532 = lerp(_j532, _j1034, 0.5);
_j538 += (_j532 - _j538) * 0.8;
_j538 = max(_j913 ? 0.2 : 1.5, _j538);
let _j976;
let _j970 = _j1033.explodeX1;
let _j971 = _j1033.explodeY1;
let _j972 = _j1033.explodeX2;
let _j973 = _j1033.explodeY2;
if (_j570 < 5) {
let _j929 = map(_j570, 0, 5, 0.05, 1.0);
_j976 = max(_j913 ? 0.1 : 0.5, _j538 * _j929);
if (explodeStart) {
_j958 = _j970 * map(_j570, 0, 5, 10, 0);
_j959 = _j971 * map(_j570, 0, 5, 10, 0);
}
} else if (_j570 >= (expectedStrokeLength - 5)) {
let _j930 = map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j976 = max(_j913 ? 0.1 : 0.5, _j538 * _j930);
if (explodeEnd) {
_j958 = _j972 * map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j959 = _j973 * map(_j570, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j976 = max(_j913 ? 0.1 : 0.5, _j538);
}
let _j980 = _j1033.showMainBrush;
let _j981 = _j1033.mainAlpha;
let showMainBrush = 0.3;
let _j1035 = showMainBrush;
if (_j1030 > 1.0) {
_j1035 = showMainBrush / _j1030;
} else if (_j1030 < 1.0) {
_j1035 = showMainBrush * (2.0 - _j1030);
}
if (_j980 > _j1035 && _j570 > 5) {
noStroke();
_j54(_j1508, _j921, _j922, brushColorMode, _j981);
let ss = min(_j951, 1.2 * min(_j957, max(3 * _j1018, _j976)));
let dx = x - _j965;
let dy = y - _j966;
let distance = sqrt(dx * dx + dy * dy);
let _j273;
const _j320 = 0.1;
if (distance < _j320) {
_j273 = _j61.lastAngle;
} else {
let _j1036 = atan2(dy, dx);
_j273 = _j1036 + PI / 2;
_j61.lastAngle = _j273;
_j61.lastMovementAngle = _j1036;
}
push();
translate(x, y);
rotate(_j273);
let _j1026 = ss * _j1033.rectWidthMult;
rect(0, 0, _j1026, _j1026 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j1031 > 0.9 && _j570 > 5 && _j570 < (expectedStrokeLength - 5)) {
let _j1037 = -sin(_j61.lastMovementAngle);
let _j1038 = cos(_j61.lastMovementAngle);
for (let j = 0; j < _j1017.length; j++) {
let _j1039 = _j1017[j];
let _j1040 = _j1033.flyWhiteRandoms[j];
let _j1041 = _j1039.randThreshold - _j1031 * 0.3;
if (_j1040 > _j1041) {
let offsetX = _j1037 * _j1039.perpOffset * _j1018;
let offsetY = _j1038 * _j1039.perpOffset * _j1018;
stroke(_j231);
strokeWeight(min(_j951, max(_j913 ? 0.1 : 0.5, _j976 * 0.3)));
line(_j965 + offsetX, _j966 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
_j1508.end();
}
let _j1042 = [];
let _j1043 = 0;
function _j62(baseBrushSize, strokeSeed) {
let _j1044, _j1045;
if (baseBrushSize <= 0.1) {
_j1044 = 2;
_j1045 = 4;
} else if (baseBrushSize <= 0.25) {
_j1044 = 4;
_j1045 = 7;
} else if (baseBrushSize <= 0.5) {
_j1044 = 6;
_j1045 = 10;
} else if (baseBrushSize <= 2.0) {
_j1044 = 10;
_j1045 = 15;
} else if (baseBrushSize <= 3.0) {
_j1044 = 20;
_j1045 = 30;
} else {
_j1044 = 30;
_j1045 = 50;
}
let count;
if (_j1044 === _j1045) {
count = _j1044;
} else {
const _j1046 = strokeSeed + 50000;
randomSeed(_j1046);
count = Math.floor(crandom.random(_j1044, _j1045 + 1));
}
const _j1047 = [];
const _j1048 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1049 = _j1048 + i * 1000;
randomSeed(_j1049);
const perpOffset = crandom.random(-6, 6);
const _j1050 = _j1048 + i * 2000 + 1;
randomSeed(_j1050);
const randThreshold = crandom.random(0.5, 1.0);
const _j1051 = _j1048 + i * 3000 + 2;
randomSeed(_j1051);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1052 = _j1048 + i * 4000 + 3;
randomSeed(_j1052);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1053 = _j1048 + i * 5000 + 4;
randomSeed(_j1053);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1054 = _j1048 + i * 6000 + 5;
randomSeed(_j1054);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1055 = _j1048 + i * 7000 + 6;
randomSeed(_j1055);
const endDistanceOffset = crandom.random(0, 8);
const _j1056 = _j1048 + i * 8000 + 7;
randomSeed(_j1056);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1057 = _j1048 + i * 9000 + 8;
randomSeed(_j1057);
const widthVariationFactor = crandom.random(0, 1);
const _j1058 = _j1048 + i * 10000 + 9;
randomSeed(_j1058);
const offsetVariationFactor = crandom.random(0, 1);
_j1047.push({
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
_j1047.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1047;
}
if (typeof _j65.lastAngle === 'undefined') {
_j65.lastAngle = 0;
}
if (typeof _j65.lastMovementAngle === 'undefined') {
_j65.lastMovementAngle = 0;
}
if (typeof _j65.lastStrokeWeights === 'undefined') {
_j65.lastStrokeWeights = {};
}
if (typeof _j65.configCache === 'undefined') {
_j65.configCache = {};
}
function _j63() {
if (typeof _j65 !== 'undefined' && _j65.configCache) {
_j65.configCache = {};
}
if (typeof _j65 !== 'undefined' && _j65.lastStrokeWeights) {
_j65.lastStrokeWeights = {};
}
}
function _j64(_j1508, _j1520, _j1521, _j1523 = null, _j1524 = null) {
if (_j570 >= expectedStrokeLength) {
return;
}
_j1508.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j923 = (_j1523 !== null && _j1524 !== null) ? _j1523 : (_j629 ? _j635 : pmouseX);
const _j924 = (_j1524 !== null && _j1524 !== null) ? _j1524 : (_j629 ? _j636 : pmouseY);
const _j1059 = _j1520 - _j923;
const _j1060 = _j1521 - _j924;
const _j1061 = sqrt(_j1059 * _j1059 + _j1060 * _j1060);
const speedMultiplier = map(constrain(_j1061, 3, 50), 0, 50, 0.1, 5.0);
let _j1062 = 0,
_j1063 = 0;
let _j1064 = 0,
_j1065 = 0;
let _j1066 = 0,
_j1067 = 0;
if (_j1061 > 0.1) {
_j1062 = _j1059 / _j1061;
_j1063 = _j1060 / _j1061;
_j1064 = -_j1063;
_j1065 = _j1062;
_j1066 = _j1063;
_j1067 = -_j1062;
} else {
_j1064 = 0;
_j1065 = 1;
_j1066 = 0;
_j1067 = -1;
}
const _j1068 = _j570 < expectedStrokeLength;
const _j1069 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1070 = strokeSeed + _j570 * 10000 + 1;
randomSeed(_j1070);
const _j1071 = _j1068 ? Math.floor(crandom.random(0, _j1069)) : 0;
for (let i = 0; i < _j1071; i++) {
const _j1072 = strokeSeed + _j570 * 1000 + _j1043;
randomSeed(_j1072);
const _j1073 = crandom.random(5, 15) * baseBrushSize;
const _j1074 = _j1520 + crandom.random(-2, 2) * baseBrushSize;
const _j1075 = _j1521 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1076, _j1077, _j1078;
if (brushColorMode === 0) {
_j1076 = _j1077 = _j1078 = _j515 * 0.3;
} else if (brushColorMode === 1) {
_j1076 = _j1077 = _j1078 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1076 = customBrushColor[0];
_j1077 = customBrushColor[1];
_j1078 = customBrushColor[2];
} else {
const color = _j214[brushColorMode];
if (color && color.rgb) {
_j1076 = color.rgb[0];
_j1077 = color.rgb[1];
_j1078 = color.rgb[2];
} else {
_j1076 = _j1077 = _j1078 = 26;
}
}
const _j1079 = {
id: _j1043++,
location: {
x: _j1074,
y: _j1075
},
prevLocation: {
x: _j1074,
y: _j1075
},
radius: _j1073,
r: _j1076,
g: _j1077,
b: _j1078,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j1042.push(_j1079);
}
const _j1080 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1081 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j1042.length - 1; i >= 0; i--) {
const _j1082 = _j1042[i];
if (_j1082.radius <= 0) {
continue;
}
const _j1083 = strokeSeed + _j570 * 1000 + _j1082.id * 100;
randomSeed(_j1083);
const _j1084 = crandom.random(_j1080, _j1081) * 3.0;
_j1082.radius -= _j1084;
const _j1085 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1086 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1082.xOff += _j1085;
_j1082.yOff += _j1086;
const _j1087 = 2.0 * speedMultiplier;
let _j1088 = 0,
_j1089 = 0;
const _j1090 = crandom.random(0, 1);
const _j1091 = (_j1082.sideDirection !== undefined) ? _j1082.sideDirection : (_j1090 > 0.5 ? 1 : -1);
if (_j1091 === 1) {
_j1088 = _j1066 * _j1087;
_j1089 = _j1067 * _j1087;
} else {
_j1088 = _j1064 * _j1087;
_j1089 = _j1065 * _j1087;
}
const nX = noise(_j1082.location.x) * _j1082.xOff;
const nY = noise(_j1082.location.y) * _j1082.yOff;
if (!_j1082.prevLocation) {
_j1082.prevLocation = {
x: _j1082.location.x,
y: _j1082.location.y
};
} else {
_j1082.prevLocation.x = _j1082.location.x;
_j1082.prevLocation.y = _j1082.location.y;
}
_j1082.location.x += 2.0 * (_j1088 * 0.2 + nX * 0.8);
_j1082.location.y += 2.0 * (_j1089 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1092 = noise(_j1082.location.x * 0.01, _j1082.location.y * 0.01) * 5;
_j1082.r = constrain(_j1082.r + _j1092, 0, 255);
_j1082.g = constrain(_j1082.g + _j1092, 0, 255);
_j1082.b = constrain(_j1082.b + _j1092, 0, 255);
} else if (brushColorMode == 0) {
const _j1092 = noise(_j1082.location.x * 0.01, _j1082.location.y * 0.01) * 2;
_j1082.r = constrain(_j1082.r + _j1092, 0, 200);
_j1082.g = constrain(_j1082.g + _j1092, 0, 200);
_j1082.b = constrain(_j1082.b + _j1092, 0, 200);
}
const _j1093 = crandom.random(0, 1) > 0.2;
const _j1094 = crandom.random(0, 1) > 0.99;
if (_j1082.radius > 0) {
stroke(_j1082.r, _j1082.g, _j1082.b, 200);
strokeWeight(max(1, _j1082.radius * 0.5));
if (_j1093) {
line(_j1082.prevLocation.x, _j1082.prevLocation.y, _j1082.location.x, _j1082.location.y);
}
if (_j1094) {
_j1082.radius = -1;
}
} else {
_j1082.radius = -1;
}
}
const _j1095 = _j1042.length;
let _j1096 = 0;
for (let i = 0; i < _j1042.length; i++) {
if (_j1042[i].radius > 0) {
if (_j1096 !== i) {
_j1042[_j1096] = _j1042[i];
}
_j1096++;
}
}
_j1042.length = _j1096;
const _j1097 = _j1042.length;
if (window.DEBUG_MODE && _j1095 > _j1097) {
const _j1098 = _j1095 - _j1097;
if (_j1098 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1098} dead particles removed (${_j1095} → ${_j1097})`);
}
}
pop();
_j1508.end();
}
function _j65(_j1508, _j1520, _j1521, _j798, _j521 = 0, _j1522 = 0) {
if (_j570 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j570, ">=", expectedStrokeLength, ")");
return;
}
_j1508.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j921 = _j60(_j515);
let _j957 = initialSize * 0.3;
const _j1099 = (_j551 && typeof _j563 !== 'undefined' && _j563 !== null) ? _j563 : baseBrushSize;
let _j437 = _j1520;
let _j438 = _j1521;
if (!_j541) {
_j541 = 1;
x = _j437;
y = _j438;
}
_j525 += (_j437 - x) * _j522;
_j526 += (_j438 - y) * _j522;
_j525 *= _j523;
_j526 *= _j523;
_j527 += sqrt(_j525 * _j525 + _j526 * _j526) - _j527;
_j527 *= 0.7;
_j528 = _j524 - _j527;
let _j1019 = _j532;
let _j1020 = _j528;
let _j1021 = _j437 - x;
let _j1022 = _j438 - y;
let _j1023 = sqrt(_j1021 * _j1021 + _j1022 * _j1022);
const _j1100 = _j1099;
const _j1101 = _j1100 < 0.25;
const _j1102 = _j1100 < 1.0;
let _j1024 = max(_j1101 ? 0.05 : (_j1102 ? _j1100 * 0.5 : 0.5), _j1020 * 0.5);
let _j1025 = 1.5 * min(_j957, max(_j1102 ? _j1100 * 4 : 4, _j1024));
let _j1026 = _j1025 * 0.6;
let _j1027 = 0.8;
let _j1028 = max(_j1026 * _j1027, 0.5);
let _j1029 = max(1, ceil(_j1023 / _j1028));
_j1029 = max(10, min(50, _j1029));
let _j1030 = _j1029 / _j520;
let _j958 = 0;
let _j959 = 0;
let _j1031 = min(1.0, _j1023 / 10);
let _j1032 = _j1031 > 0.3;
rectMode(CENTER);
let _j231 = crandom.random(30, 70);
const _j1103 = `flyBrush_${_j1099}_${strokeSeed}`;
let _j1104;
if (_j65.configCache[_j1103]) {
_j1104 = _j65.configCache[_j1103];
} else {
_j1104 = _j62(_j1099, strokeSeed);
_j65.configCache[_j1103] = _j1104;
}
const _j1105 = map(_j231, 30, 70, 0, _j1104.length);
const _j1106 = _j1104.length;
const _j1107 = 40;
const _j234 = [];
for (let i = 0; i < _j520; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1107; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1108 = _j570 * 0.08 + j * 0.15;
const _j1109 = _j570 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1108, _j1109));
const _j1110 = _j570 * 0.1 + j * 0.1;
const _j1111 = _j570 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1110, _j1111));
}
_j234.push({
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
for (let i = 0; i < _j520; ++i) {
const _j1033 = _j234[i];
let _j965 = x;
let _j966 = y;
x += _j525 / _j520;
y += _j526 / _j520;
let _j428 = (i + 1) / _j520;
let _j1034 = lerp(_j1019, _j1020, _j428);
_j532 = lerp(_j532, _j1034, 0.5);
_j538 += (_j532 - _j538) * 0.8;
_j538 = max(_j1102 ? _j1100 * 1.5 : 1.5, _j538);
let _j976;
_j976 = max(_j1101 ? _j1100 * 0.5 : (_j1102 ? _j1100 : 0.5), _j538);
let dx = x - _j965;
let dy = y - _j966;
let distance = sqrt(dx * dx + dy * dy);
let _j1036;
const _j320 = 0.1;
if (distance < _j320) {
_j1036 = _j65.lastMovementAngle;
} else {
_j1036 = atan2(dy, dx);
let _j273 = _j1036 + PI / 2;
_j65.lastAngle = _j273;
_j65.lastMovementAngle = _j1036;
}
let _j980 = _j1033.showMainBrush;
let _j981 = _j1033.mainAlpha;
let showMainBrush = 0.3;
let _j1035 = showMainBrush;
if (_j1030 > 1.0) {
_j1035 = showMainBrush / _j1030;
} else if (_j1030 < 1.0) {
_j1035 = showMainBrush * (2.0 - _j1030);
}
let _j1037 = -sin(_j1036);
let _j1038 = cos(_j1036);
const _j1112 = max(_j1101 ? _j1100 * 0.4 : (_j1102 ? _j1100 * 0.5 : 0.5), _j524 * 0.5);
const _j1113 = _j527 * 0.5;
const _j1114 = _j570 < (expectedStrokeLength - 5);
const _j1115 = _j570 >= (expectedStrokeLength - 5);
const _j1116 = _j1115 ? 0.7 : 1.0;
const _j1117 = _j570 >= expectedStrokeLength;
let _j1118, _j1119, _j1120, _j1121, _j1122;
if (_j1115) {
_j1118 = expectedStrokeLength - 5;
_j1119 = _j570 - _j1118;
_j1120 = min(1.0, _j1119 / 5.0);
_j1121 = cos(_j1036);
_j1122 = sin(_j1036);
}
for (let j = 0; j < _j1104.length; j++) {
let _j1039 = _j1104[j];
const _j1123 = _j570 >= _j1039.startOffset;
if (!_j1123 || _j1117) {
continue;
}
let _j1040 = _j1033.flyWhiteRandoms[j];
let _j1041 = _j1039.randThreshold * _j1116;
if (_j1040 > _j1041) {
const _j1124 = _j1033.flyWhiteOffsetNoises[j];
const _j1005 = map(_j1124, 0, 1, 1.0, 2.0);
const _j1125 = 1.0 + (_j1005 - 1.0) * _j1039.offsetVariationFactor;
const _j1126 = _j1102 ? max(0.3, _j1100 * 3) : _j1100;
const _j1127 = _j1039.perpOffset * _j1126 * _j1125;
let offsetX = _j1037 * _j1127;
let offsetY = _j1038 * _j1127;
let _j271 = x;
let _j272 = y;
let _j1128 = _j965;
let _j1129 = _j966;
if (_j1115) {
const _j1130 = _j1039.endDistanceOffset * _j1120 * _j1099;
const _j1131 = _j1121 * _j1130;
const _j1132 = _j1122 * _j1130;
_j271 = x + _j1131;
_j272 = y + _j1132;
if (_j1119 === 0) {
_j1128 = _j965;
_j1129 = _j966;
} else {
const _j1133 = min(1.0, (_j1119 - 1) / 5.0);
const _j1134 = _j1039.endDistanceOffset * _j1133 * _j1099;
const _j1135 = _j1121 * _j1134;
const _j1136 = _j1122 * _j1134;
_j1128 = x + _j1135;
_j1129 = y + _j1136;
}
}
const _j1137 = _j1113 * _j1039.brushSpeedMultiplier * _j1039.speedMultiplier;
const _j1138 = max(_j1101 ? _j1100 * 0.3 : (_j1102 ? _j1100 * 0.3 : 0.5), _j1112 - _j1137);
const _j1139 = _j1138 * 0.6;
const _j1140 = _j1033.flyWhiteWidthNoises[j];
const _j1141 = map(_j1140, 0, 1, 0.8, 1.2);
const _j1142 = 1.0 + (_j1141 - 1.0) * _j1039.widthVariationFactor;
let _j1143 = max(0, map(j, 0, _j1104.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1143) + random(-50, 50);
stroke(_j921, kk);
const _j1144 = _j1139 * _j1039.sizeMultiplier * _j1142;
const _j1145 = max(1, _j1144);
const _j1146 = `${_j1103}_${j}`;
let _j1147 = _j65.lastStrokeWeights[_j1146];
if (typeof _j1147 === 'undefined') {
_j1147 = _j1145;
}
const _j1148 = _j1147;
let _j1149;
if (_j1148 < 3.0) {
_j1149 = 0.15;
} else if (_j1148 >= 5.0) {
_j1149 = 0.3;
} else {
const t = (_j1148 - 3.0) / (5.0 - 3.0);
_j1149 = lerp(0.15, 0.3, t);
}
const _j1150 = lerp(_j1147, _j1145, _j1149);
_j65.lastStrokeWeights[_j1146] = _j1150;
strokeWeight(_j1150);
line(_j1128 + offsetX, _j1129 + offsetY, _j271 + offsetX, _j272 + offsetY);
}
}
}
pop();
_j1508.end();
}
let _j1151 = null;
function _j66() {
if (_j1151) return _j1151;
_j1151 = {
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
maskPanel: document.getElementById('mask-panel'),
messageContainer: document.getElementById('message-container'),
brushHint: document.getElementById('brush-hint'),
effectHint: document.getElementById('effect-hint'),
flowHint: document.getElementById('flow-hint'),
maskHint: document.getElementById('mask-hint'),
screenTextToggle: document.getElementById('screen-text-toggle'),
referenceImage: document.getElementById('reference-image'),
referenceContainer: document.getElementById('reference-image-container')
};
return _j1151;
}
function _j67(key) {
if (!_j1151) {
_j66();
}
return _j1151[key];
}
function _j68(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j67('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j680.x = e.clientX - rect.left - rect.width / 2;
_j680.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j69(e) {
if (!isDragging) return;
const overlay = _j67('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j680.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j680.y) / window.innerHeight) * 100;
_j681.x = x;
_j681.y = y;
_j71(overlay, _j681, _j74);
}
function _j70() {
if (!isDragging) return;
isDragging = false;
const overlay = _j67('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j71(overlay, _j681, _j74);
}
_j110();
}
function _j71(panel, pos, _j1525) {
if (!panel) return;
_j1525();
const _j1152 = panel.querySelector('.control-btn');
if (!_j1152) return;
const rect = _j1152.getBoundingClientRect();
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
_j1525();
}
}
function _j72(_j1526) {
if (!_j1526) return;
const _j907 = [
document.getElementById('message-overlay'),
_j67('controlPanel'),
_j67('effectControlPanel'),
_j67('flowEffectPanel'),
_j67('maskPanel')
];
_j907.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1526.classList.add('panel-front');
}
function _j73() {
const _j907 = [
document.getElementById('message-overlay'),
_j67('controlPanel'),
_j67('effectControlPanel'),
_j67('flowEffectPanel'),
_j67('maskPanel')
];
_j907.forEach(panel => {
if (!panel) return;
panel.addEventListener('mousedown', () => _j72(panel));
panel.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) _j72(panel);
}, {
passive: true
});
});
}
function _j74() {
const overlay = _j67('messageOverlay');
if (!overlay) return;
overlay.style.left = _j681.x + '%';
overlay.style.top = _j681.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j75(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j682 = true;
const panel = _j67('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j683.x = e.clientX - rect.left - rect.width / 2;
_j683.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j76(e) {
if (!_j682) return;
const panel = _j67('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j683.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j683.y) / window.innerHeight) * 100;
_j684.x = x;
_j684.y = y;
_j71(panel, _j684, _j78);
}
function _j77(e) {
if (!_j682) return;
_j682 = false;
const panel = _j67('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j684, _j78);
_j110();
}
function _j78() {
const panel = _j67('controlPanel');
if (!panel) return;
panel.style.left = _j684.x + '%';
panel.style.top = _j684.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j79(e) {
if (e.target.closest('.control-btn')) return;
_j686 = true;
const panel = _j67('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j687.x = e.clientX - rect.left - rect.width / 2;
_j687.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j80(e) {
if (!_j686) return;
const panel = _j67('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j687.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j687.y) / window.innerHeight) * 100;
_j688.x = x;
_j688.y = y;
_j71(panel, _j688, _j82);
}
function _j81(e) {
if (!_j686) return;
_j686 = false;
const panel = _j67('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j688, _j82);
_j110();
}
function _j82() {
const panel = _j67('effectControlPanel');
if (!panel) return;
panel.style.left = _j688.x + '%';
panel.style.top = _j688.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j83(e) {
if (e.target.closest('.control-btn')) return;
_j690 = true;
const panel = _j67('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j691.x = e.clientX - rect.left - rect.width / 2;
_j691.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j84(e) {
if (!_j690) return;
const panel = _j67('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j691.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j691.y) / window.innerHeight) * 100;
_j692.x = x;
_j692.y = y;
_j71(panel, _j692, _j86);
}
function _j85(e) {
if (!_j690) return;
_j690 = false;
const panel = _j67('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j692, _j86);
_j110();
}
function _j86() {
const panel = _j67('flowEffectPanel');
if (!panel) return;
panel.style.left = _j692.x + '%';
panel.style.top = _j692.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j87(e) {
if (e.target.closest('.control-btn') || e.target.closest('.toggle-label')) return;
_j694 = true;
const panel = _j67('maskPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j695.x = e.clientX - rect.left - rect.width / 2;
_j695.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j88(e) {
if (!_j694) return;
const panel = _j67('maskPanel');
if (!panel) return;
const x = ((e.clientX - _j695.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j695.y) / window.innerHeight) * 100;
_j696.x = x;
_j696.y = y;
_j71(panel, _j696, _j90);
}
function _j89(e) {
if (!_j694) return;
_j694 = false;
const panel = _j67('maskPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j696, _j90);
_j110();
}
function _j90() {
const panel = _j67('maskPanel');
if (!panel) return;
panel.style.left = _j696.x + '%';
panel.style.top = _j696.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j91() {
const _j1153 = document.getElementById('mask-rect-btn');
const _j1154 = document.getElementById('mask-poly-btn');
if (_j1153) _j1153.classList.toggle('active', _j555 === 'rect');
if (_j1154) _j1154.classList.toggle('active', _j555 === 'polygon');
}
function _j92() {
const _j1155 = document.getElementById('mask-status');
if (!_j1155) return;
if (_j553) {
_j1155.textContent = _j555 === 'rect' ? 'Draw rect mask' : 'Click to add points, press Polygon again to close';
} else if (_j554) {
_j1155.textContent = 'Mask active';
} else {
_j1155.textContent = 'No mask';
}
const c = document.querySelector('canvas');
if (c) {
c.classList.toggle('mask-cursor', _j553);
}
}
function _j93() {
return _j67('controlPanel');
}
let _j1156 = {};
let _j1157 = {
hint: null,
startX: 0,
startY: 0,
offsetX: 0,
offsetY: 0,
isDragging: false,
hasMoved: false,
lastDragTime: 0
};
function _j94() {
return Date.now() - _j1157.lastDragTime < 200;
}
function _j95(hint, _j1527) {
const button = document.getElementById(_j1527);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j96(e, hint) {
const rect = hint.getBoundingClientRect();
_j1157.hint = hint;
_j1157.startX = e.clientX;
_j1157.startY = e.clientY;
_j1157.offsetX = e.clientX - rect.left;
_j1157.offsetY = e.clientY - rect.top;
_j1157.isDragging = true;
_j1157.hasMoved = false;
}
function _j97(e) {
if (!_j1157.isDragging || !_j1157.hint) return;
const dx = Math.abs(e.clientX - _j1157.startX);
const dy = Math.abs(e.clientY - _j1157.startY);
if (dx > 5 || dy > 5) {
_j1157.hasMoved = true;
_j1157.hint.style.transition = 'none';
}
if (_j1157.hasMoved) {
const x = e.clientX - _j1157.offsetX;
const y = e.clientY - _j1157.offsetY;
_j1157.hint.style.left = x + 'px';
_j1157.hint.style.top = y + 'px';
}
}
function _j98(e) {
if (!_j1157.isDragging || !_j1157.hint) return;
const hint = _j1157.hint;
if (_j1157.hasMoved) {
_j1156[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1156));
hint.style.transition = '';
_j1157.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1157.hint = null;
_j1157.isDragging = false;
_j1157.hasMoved = false;
}
function _j99() {
const _j1158 = localStorage.getItem('hintPositions');
if (_j1158) {
_j1156 = JSON.parse(_j1158);
}
}
function _j100() {
const _j1159 = [{
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
}, {
hint: document.getElementById('mask-hint'),
btn: document.getElementById('mask-hint-btn')
}];
_j1159.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j96(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1160 = e.touches[0];
_j96({
clientX: _j1160.clientX,
clientY: _j1160.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j97);
document.addEventListener('mouseup', _j98);
document.addEventListener('touchmove', (e) => {
if (_j1157.isDragging && e.touches.length === 1) {
_j97({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1157.hasMoved) e.preventDefault();
}
}, {
passive: false
});
document.addEventListener('touchend', (e) => {
_j98({
preventDefault: () => {},
stopPropagation: () => {}
});
});
}
function _j101() {
_j99();
const _j907 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j677
}, {
panel: _j67('controlPanel'),
hint: _j67('brushHint'),
button: 'toggle-control-panel',
visible: _j685
}, {
panel: _j67('effectControlPanel'),
hint: _j67('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j689
}, {
panel: _j67('flowEffectPanel'),
hint: _j67('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j693
}, {
panel: _j67('maskPanel'),
hint: _j67('maskHint'),
button: 'toggle-mask-panel',
visible: _j697
}];
_j907.forEach(({
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
_j95(hint, button);
panel.style.display = 'none';
panel.style.opacity = '';
panel.style.pointerEvents = '';
});
}
});
}
function _j102() {
_j685 = !_j685;
const panel = _j93();
const brushHint = _j67('brushHint');
if (!panel) return;
if (_j685) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (brushHint) {
brushHint.classList.add('hidden');
}
} else {
if (brushHint) {
_j95(brushHint, 'toggle-control-panel');
brushHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j685) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j685.toString());
}
function _j103() {
_j689 = !_j689;
const panel = _j67('effectControlPanel');
const effectHint = _j67('effectHint');
if (!panel) return;
if (_j689) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (effectHint) {
effectHint.classList.add('hidden');
}
} else {
if (effectHint) {
_j95(effectHint, 'toggle-effect-control-panel');
effectHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j689) {
panel.style.display = 'none';
}
}, 300);
}
_j108();
}
function _j104() {
_j693 = !_j693;
const panel = _j67('flowEffectPanel');
const flowHint = _j67('flowHint');
if (!panel) return;
if (_j693) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (flowHint) {
flowHint.classList.add('hidden');
}
} else {
if (flowHint) {
_j95(flowHint, 'toggle-flow-effect-panel');
flowHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j693) {
panel.style.display = 'none';
}
}, 300);
}
_j108();
}
function _j105() {
_j697 = !_j697;
const panel = _j67('maskPanel');
const maskHint = _j67('maskHint');
if (!panel) return;
if (_j697) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (maskHint) {
maskHint.classList.add('hidden');
}
} else {
if (maskHint) {
_j95(maskHint, 'toggle-mask-panel');
maskHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j697) {
panel.style.display = 'none';
}
}, 300);
}
_j108();
}
function _j106() {
const _j1161 = _j67('screenTextToggle');
if (_j1161) {
screenText = _j1161.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j144();
}
_j111('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j107() {
const _j1162 = localStorage.getItem('controlPanelVisible');
if (_j1162 !== null) {
_j685 = _j1162 === 'true';
}
const _j1163 = localStorage.getItem('effectControlPanelVisible');
if (_j1163 !== null) {
_j689 = _j1163 === 'true';
}
const _j1164 = localStorage.getItem('flowEffectPanelVisible');
if (_j1164 !== null) {
_j693 = _j1164 === 'true';
}
}
function _j108() {
localStorage.setItem('controlPanelVisible', _j685);
localStorage.setItem('effectControlPanelVisible', _j689);
localStorage.setItem('flowEffectPanelVisible', _j693);
localStorage.setItem('maskPanelVisible', _j697);
}
function _j109() {
const _j1165 = localStorage.getItem('overlayPosition');
const _j1166 = localStorage.getItem('controlPanelPosition');
const _j1167 = localStorage.getItem('effectControlPanelPosition');
const _j1168 = localStorage.getItem('flowEffectPanelPosition');
if (_j1165) {
_j681 = JSON.parse(_j1165);
}
if (_j1166) {
_j684 = JSON.parse(_j1166);
}
if (_j1167) {
_j688 = JSON.parse(_j1167);
}
if (_j1168) {
_j692 = JSON.parse(_j1168);
}
const _j1169 = localStorage.getItem('maskPanelPosition');
if (_j1169) {
_j696 = JSON.parse(_j1169);
}
const _j1170 = localStorage.getItem('maskPanelVisible');
if (_j1170 !== null) {
_j697 = _j1170 === 'true';
}
}
function _j110() {
localStorage.setItem('overlayPosition', JSON.stringify(_j681));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j684));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j688));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j692));
localStorage.setItem('maskPanelPosition', JSON.stringify(_j696));
}
function _j111(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1171 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1171[type] || '⚙️';
if (Object.keys(data).length > 0) {} else {}
if (typeof screenText !== 'undefined' && screenText) {
_j112(type, message, data);
}
}
function _j112(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1171 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1171[type] || '⚙️';
let _j1172 = '';
if (Object.keys(data).length > 0) {
_j1172 = ' ' + JSON.stringify(data);
}
const _j1173 = `${icon} [${timestamp}] ${message}${_j1172}`;
_j699.push({
type: type,
text: _j1173,
timestamp: timestamp
});
if (_j699.length >= _j706) {
_j699 = [];
_j701 = 0;
}
}
function _j113(type, message, data, timestamp, icon) {
const _j1174 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j678.push(_j1174);
if (_j678.length > _j679) {
_j678.shift();
}
_j114();
}
function _j114() {
const _j1175 = _j67('messageContainer');
if (!_j1175) return;
_j1175.innerHTML = '';
_j678.forEach(_j1530 => {
const _j1176 = _j142(_j1530);
_j1175.appendChild(_j1176);
});
_j1175.scrollTop = _j1175.scrollHeight;
}
function _j115() {
const _j1177 = recordingData.events.length > 0;
const _j1178 = `${_j621}-${_j629}-${_j1177}`;
if (_j1178 === _j1184) {
return;
}
_j1184 = _j1178;
const recordBtn = _j67('recordBtn');
const stopBtn = _j67('stopBtn');
const playBtn = _j67('playBtn');
const loadBtn = _j67('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j621) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j629) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1177) {
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
let _j1179 = false;
let _j1180 = -1;
let _j1181 = 0;
const _j1182 = 100;
let _j1183 = -1;
let _j1184 = null;
let _j1185 = null;
let _j1186 = null;
let _j1187 = 'edge';
function _j116(_j506) {
const cw = _j506.naturalWidth;
const ch = _j506.naturalHeight;
const c = document.createElement('canvas');
c.width = cw; c.height = ch;
const _j1188 = c.getContext('2d');
_j1188.drawImage(_j506, 0, 0);
const src = _j1188.getImageData(0, 0, cw, ch);
const _j1189 = _j1188.createImageData(cw, ch);
const s = src.data, d = _j1189.data;
const _j231 = new Float32Array(cw * ch);
for (let i = 0; i < _j231.length; i++) {
_j231[i] = s[i*4] * 0.299 + s[i*4+1] * 0.587 + s[i*4+2] * 0.114;
}
for (let y = 1; y < ch - 1; y++) {
for (let x = 1; x < cw - 1; x++) {
const tl = _j231[(y-1)*cw+(x-1)], tc = _j231[(y-1)*cw+x], tr = _j231[(y-1)*cw+(x+1)];
const ml = _j231[y*cw+(x-1)],                              mr = _j231[y*cw+(x+1)];
const bl = _j231[(y+1)*cw+(x-1)], bc = _j231[(y+1)*cw+x], br = _j231[(y+1)*cw+(x+1)];
const gx = -tl - 2*ml - bl + tr + 2*mr + br;
const gy = -tl - 2*tc - tr + bl + 2*bc + br;
const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy));
const _j1190 = (y * cw + x) * 4;
const v = 255 - mag;
d[_j1190] = v; d[_j1190+1] = v; d[_j1190+2] = v; d[_j1190+3] = 255;
}
}
for (let x = 0; x < cw; x++) {
d[x*4] = d[x*4+1] = d[x*4+2] = 255; d[x*4+3] = 255;
const i = ((ch-1)*cw+x)*4;
d[i] = d[i+1] = d[i+2] = 255; d[i+3] = 255;
}
for (let y = 0; y < ch; y++) {
d[y*cw*4] = d[y*cw*4+1] = d[y*cw*4+2] = 255; d[y*cw*4+3] = 255;
const i = (y*cw+(cw-1))*4;
d[i] = d[i+1] = d[i+2] = 255; d[i+3] = 255;
}
_j1188.putImageData(_j1189, 0, 0);
return c.toDataURL();
}
function _j117() {
const referenceImage = document.getElementById('reference-image');
if (!referenceImage || !_j1185) return;
if (_j1187 === 'edge') {
_j1187 = 'original';
referenceImage.src = _j1185;
referenceImage.style.filter = 'grayscale(1) contrast(2.0)';
} else {
_j1187 = 'edge';
referenceImage.src = _j1186;
referenceImage.style.filter = 'none';
}
}
function _j118(_j1362) {
const _j1191 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j111('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1191.onload = (e) => {
_j1185 = e.target.result;
const _j1192 = new Image();
_j1192.onload = () => {
_j1186 = _j116(_j1192);
_j1187 = 'edge';
referenceImage.src = _j1186;
referenceImage.style.filter = 'none';
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
_j1179 = true;
_j111('system', '📷 Reference image loaded (edge mode)', {
Status: 'Tracing mode ON',
FileName: _j1362.name,
FileSize: (_j1362.size / 1024).toFixed(2) + ' KB',
Size: width + 'x' + height + 'px'
});
};
_j1192.src = e.target.result;
};
_j1191.onerror = () => {
_j111('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1362.name
});
};
_j1191.readAsDataURL(_j1362);
}
function _j119() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1193 = referenceImage.src;
const _j1194 = _j1193 && _j1193 !== '' &&
(_j1193.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1194) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1179 = true;
const _j1195 = document.getElementById('ref-image-toggle-btn');
if (_j1195) _j1195.classList.add('ref-active');
_j111('system', 'Reference image shown', {
Status: 'Tracing mode ON',
Opacity: '30%'
});
} else {
_j111('system', 'No image loaded', {
Status: 'Please load an image first'
});
}
}
}
function _j120() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1179 = false;
const _j1195 = document.getElementById('ref-image-toggle-btn');
if (_j1195) _j1195.classList.remove('ref-active');
_j111('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j121() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j176('💾 Canvas Saved as PNG');
}
function _j122(_j1234) {
_j533 = _j1234;
switch (_j1234) {
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
if (typeof _j563 !== 'undefined') _j563 = baseBrushSize;
_j123();
_j135();
_j111('ui', 'Brush size changed', {
Mode: _j1234.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j123() {
const _j1196 = document.querySelectorAll('.brush-size-btn');
if (_j1196.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1196.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j533) {
btn.classList.add('active');
}
});
}
function _j124(mode) {
brushMode = parseInt(mode);
_j126();
_j135();
_j111('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j125(mode)
});
}
function _j125(mode) {
const _j1197 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1197[mode] || 'Unknown mode';
}
function _j126() {
const _j1196 = document.querySelectorAll('.brush-mode-btn');
if (_j1196.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1196.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j127(effect) {
const _j1198 = parseInt(effect);
const _j1199 = useSharpen;
_j111('ui', '🎨 Ink effect switching', {
From: _j1199,
To: _j1198,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1198;
if (typeof _j534 !== 'undefined') {
_j534 = _j1199;
}
_j130();
_j135();
const _j1200 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j111('ui', '✨ Ink effect changed', {
Effect: _j1200[_j1198] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j128(mode) {
const _j1201 = parseInt(mode);
if (_j1201 === 3) {
window.spectral = true;
} else {
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1201;
}
window.spectral = false;
}
_j129();
const _j1202 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken',
3: 'Spectral'
};
_j111('ui', '🎨 BlendMode changed', {
Mode: _j1202[_j1201] || 'Unknown'
});
}
function _j129() {
const _j1196 = document.querySelectorAll('.blendmode-btn');
if (_j1196.length === 0) {
return;
}
const _j1203 = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
_j1196.forEach(btn => {
const _j1201 = parseInt(btn.dataset.mode);
if (_j1203 && _j1201 === 3) {
btn.classList.add('active');
} else if (!_j1203 && _j1201 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j130() {
const _j1196 = document.querySelectorAll('.ink-effect-btn');
if (_j1196.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1196.forEach(btn => {
btn.classList.remove('active');
const _j1198 = parseInt(btn.dataset.effect);
const _j1204 = _j1198;
if (_j1204 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j131(color) {
whiteBrushMode = (color === 'white');
const _j1205 = {
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
brushColorMode = _j1205[color] !== undefined ? _j1205[color] : 0;
_j132();
_j135();
const _j1206 = {
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
if (typeof _j8 === 'function') {
const _j1207 = _j8(color);
if (_j1207) {
const _j1208 = document.getElementById('custom-brush-color');
const _j1209 = document.getElementById('custom-brush-color-text');
if (_j1208) _j1208.value = _j1207.hex;
if (_j1209) _j1209.value = _j1207.displayName + ' ' + _j1207.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1207.rgb[0];
customBrushColor[1] = _j1207.rgb[1];
customBrushColor[2] = _j1207.rgb[2];
}
}
}
_j111('ui', '🎨 Brush color changed', {
Color: _j1206[color] || color,
Mode: `${_j1206[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j132() {
const _j1210 = document.querySelectorAll('.brush-color-btn');
const _j1211 = document.querySelectorAll('.color-swatch');
if (_j1210.length === 0 && _j1211.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1212 = {
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
const _j1213 = (brushColorMode === 33);
const _j1214 = _j1213 ? null : (_j1212[brushColorMode] || 'black');
_j1210.forEach(btn => {
btn.classList.remove('active');
if (!_j1213 && btn.dataset.color === _j1214) {
btn.classList.add('active');
}
});
_j1211.forEach(btn => {
btn.classList.remove('active');
if (!_j1213 && btn.dataset.color === _j1214) {
btn.classList.add('active');
}
});
}
function _j133(_j1240) {
_j576 = parseInt(_j1240);
_j134();
_j135();
const _j1215 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j111('ui', '🔄 Path rotation changed', {
Mode: _j1240,
Range: _j1215[_j1240] || 'Unknown'
});
}
function _j134() {
const _j1196 = document.querySelectorAll('.path-rotation-btn');
if (_j1196.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1196.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j576) {
btn.classList.add('active');
}
});
}
function _j135() {
const _j1216 = document.getElementById('current-brush-mode');
if (_j1216) {
_j1216.textContent = brushMode;
}
const _j1217 = document.getElementById('current-brush-size');
if (_j1217) {
const _j1218 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1217.textContent = _j1218[_j533] || 'M';
}
const _j1219 = document.getElementById('current-ink-effect');
if (_j1219) {
const _j1220 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1219.textContent = _j1220[useSharpen] || 'MIX';
}
const _j1221 = document.getElementById('current-brush-color');
if (_j1221) {
const _j1222 = {
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
_j1221.textContent = _j1222[brushColorMode] || 'Black';
}
}
function _j136() {
brushMode = 1;
_j533 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j576 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j126();
_j123();
_j130();
_j132();
_j134();
_j129();
_j135();
_j111('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j137(_j1528, _j1529) {
if (!_j1528) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1223 = 300;
_j1528.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1224 = window._elementLastTriggerTime.get(_j1528) || 0;
if (now - _j1224 < _j1223) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1528, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1528);
}, _j1223);
window._elementLastTriggerTime.set(_j1528, now);
e.stopPropagation();
e.preventDefault();
_j1529(e);
}, {
passive: false
});
_j1528.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1528)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1224 = window._elementLastTriggerTime.get(_j1528) || 0;
if (now - _j1224 < _j1223) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1528, now);
e.stopPropagation();
e.preventDefault();
_j1529(e);
});
_j1528.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j138() {
const _j1225 = document.getElementById('canvas-background-color');
const _j1226 = document.getElementById('canvas-background-color-text');
if (!_j1225 || !_j1226) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1227 = `#${r}${g}${b}`.toUpperCase();
_j1225.value = _j1227;
_j1226.value = _j1227;
}
}
function _j139() {
const _j1228 = document.getElementById('canvas-width');
const _j1229 = document.getElementById('canvas-height');
if (!_j1228 || !_j1229) {
return;
}
if (typeof _j503 !== 'undefined' && typeof _j504 !== 'undefined') {
_j1228.value = _j503;
_j1229.value = _j504;
}
}
function _j140() {
const _j1230 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1231 = _j1230 === 'collector';
if (_j1231) {
const controlPanel = _j67('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1232 = document.querySelectorAll('.brush-mode-btn');
_j1232.forEach(btn => {
_j137(btn, () => {
const mode = btn.dataset.mode;
_j124(mode);
});
});
const _j1233 = document.querySelectorAll('.brush-size-btn');
_j1233.forEach(btn => {
_j137(btn, () => {
const _j1234 = btn.dataset.size;
_j122(_j1234);
});
});
const _j1235 = document.querySelectorAll('.ink-effect-btn');
_j1235.forEach(btn => {
_j137(btn, () => {
const effect = btn.dataset.effect;
_j127(effect);
});
});
const _j1236 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1236.forEach(btn => {
_j137(btn, () => {
const color = btn.dataset.color;
if (color) {
_j131(color);
_j157();
}
});
});
const _j1237 = document.getElementById('custom-brush-color');
const _j1238 = document.getElementById('custom-brush-color-text');
if (_j1237 && _j1238) {
_j1237.addEventListener('input', (e) => {
_j1238.value = e.target.value.toUpperCase();
_j163();
});
_j1237.addEventListener('change', (e) => {
_j1238.value = e.target.value.toUpperCase();
_j163();
});
_j1238.addEventListener('input', (e) => {
const _j1227 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1227)) {
_j1237.value = _j1227.toUpperCase();
}
});
_j1238.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j163();
}
});
}
const _j1239 = document.querySelectorAll('.path-rotation-btn');
_j1239.forEach(btn => {
_j137(btn, () => {
const _j1240 = btn.dataset.rotation;
_j133(_j1240);
});
});
const _j1241 = document.querySelectorAll('.blendmode-btn');
_j1241.forEach(btn => {
_j137(btn, () => {
const mode = btn.dataset.mode;
_j128(mode);
});
});
const _j1242 = document.getElementById('clear-canvas');
if (_j1242) {
const _j1243 = _j1242.textContent;
let _j1244 = false;
let _j1245 = null;
const _j1246 = () => {
_j1244 = false;
_j1242.classList.remove('armed');
_j1242.textContent = _j1243;
if (_j1245) { clearTimeout(_j1245); _j1245 = null; }
};
_j137(_j1242, () => {
if (!_j1244) {
_j1244 = true;
_j1242.classList.add('armed');
_j1242.textContent = 'Press again to clear';
_j1245 = setTimeout(_j1246, 2000);
return;
}
_j1246();
_j169();
if (typeof _j232 !== 'undefined') {
_j232 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j111('ui', '🧹 Canvas cleared', {
Status: 'All drawings removed'
});
});
}
const _j1247 = document.getElementById('test-mode-btn');
if (_j1247) {
_j137(_j1247, () => {
if (typeof _j547 !== 'undefined' && _j547) return;
if (window.testMode) {
if (typeof exitTestMode === 'function') exitTestMode();
_j1247.classList.remove('active');
_j1247.textContent = 'testMode';
_j111('ui', '🧪 Test mode OFF', { Status: 'Canvas restored' });
} else {
if (typeof enterTestMode === 'function') enterTestMode();
_j1247.classList.add('active');
_j1247.textContent = 'testMode (exit)';
_j111('ui', '🧪 Test mode ON', { Status: 'Strokes will not be recorded' });
}
});
}
const _j1225 = document.getElementById('canvas-background-color');
const _j1226 = document.getElementById('canvas-background-color-text');
const _j1228 = document.getElementById('canvas-width');
const _j1229 = document.getElementById('canvas-height');
if (_j1225 && _j1226) {
_j1225.addEventListener('input', (e) => {
_j1226.value = e.target.value.toUpperCase();
});
_j1225.addEventListener('change', (e) => {
_j1226.value = e.target.value.toUpperCase();
_j164();
});
_j1226.addEventListener('input', (e) => {
const _j1227 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1227)) {
_j1225.value = _j1227.toUpperCase();
}
});
_j1226.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j164();
}
});
if (typeof _j138 === 'function') {
_j138();
} else {
setTimeout(() => {
if (typeof _j138 === 'function') {
_j138();
}
}, 100);
}
}
if (_j1228 && _j1229) {
_j1228.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j164();
}
});
_j1229.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j164();
}
});
if (typeof _j139 === 'function') {
_j139();
} else {
setTimeout(() => {
if (typeof _j139 === 'function') {
_j139();
}
}, 100);
}
}
const _j1248 = document.getElementById('panel-scale-slider');
if (_j1248) {
_j1248.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1248.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j74();
_j78();
_j82();
_j86();
});
}
const _j1195 = document.getElementById('toggle-control-panel');
if (_j1195) {
_j137(_j1195, _j102);
}
const controlPanel = _j67('controlPanel');
const _j1152 = controlPanel?.querySelector('.control-panel-header');
if (_j1152) {
_j1152.addEventListener('mousedown', _j75);
_j1152.addEventListener('touchstart', (e) => {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j75(_j1249);
});
}
const effectControlPanel = _j67('effectControlPanel');
const _j1250 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1250) {
_j1250.addEventListener('mousedown', _j79);
_j1250.addEventListener('touchstart', (e) => {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j79(_j1249);
});
}
const _j1251 = document.getElementById('toggle-effect-control-panel');
if (_j1251) {
_j137(_j1251, _j103);
}
const flowEffectPanel = _j67('flowEffectPanel');
const _j1252 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1252) {
_j1252.addEventListener('mousedown', _j83);
_j1252.addEventListener('touchstart', (e) => {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j83(_j1249);
});
}
const _j1253 = document.getElementById('toggle-flow-effect-panel');
if (_j1253) {
_j137(_j1253, _j104);
}
const maskPanel = _j67('maskPanel');
const _j1254 = maskPanel?.querySelector('.mask-panel-header');
if (_j1254) {
_j1254.addEventListener('mousedown', _j87);
_j1254.addEventListener('touchstart', (e) => {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j87(_j1249);
});
}
const _j1255 = document.getElementById('toggle-mask-panel');
if (_j1255) {
_j137(_j1255, function() {
_j105();
});
}
const _j1256 = document.getElementById('mask-mode-toggle');
if (_j1256) {
_j1256.addEventListener('change', function() {
if (!this.checked && _j555 === 'polygon' && _j557.length >= 3) {
drawMaskPolygon(_j557);
_j558 = { action: "polygon", points: _j557.map(p => ({ x: p.x, y: p.y })) };
}
const _j1257 = !this.checked;
_j553 = this.checked;
_j91();
_j92();
if (_j1257 && typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
});
}
const _j1258 = document.getElementById('mask-rect-btn');
if (_j1258) {
_j137(_j1258, function() {
_j555 = 'rect';
_j553 = true;
if (_j1256) _j1256.checked = true;
_j91();
_j92();
});
}
const _j1259 = document.getElementById('mask-poly-btn');
if (_j1259) {
_j137(_j1259, function() {
if (_j553 && _j555 === 'polygon') {
if (_j557.length >= 3) {
drawMaskPolygon(_j557);
_j558 = { action: "polygon", points: _j557.map(p => ({ x: p.x, y: p.y })) };
}
_j553 = false;
if (_j1256) _j1256.checked = false;
if (typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
} else {
_j555 = 'polygon';
_j553 = true;
_j557 = [];
if (_j1256) _j1256.checked = true;
}
_j91();
_j92();
});
}
const _j1260 = document.getElementById('mask-clear-btn');
if (_j1260) {
_j137(_j1260, function() {
clearMask();
_j558 = null;
_j553 = false;
_j555 = null;
if (_j1256) _j1256.checked = false;
_j91();
_j92();
});
}
if (maskPanel && !_j697) {
maskPanel.style.display = 'none';
}
_j90();
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j106);
}
_j126();
_j123();
_j130();
_j132();
_j134();
_j129();
_j135();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j141() {
const now = millis();
const _j1261 = (now - _j1181) >= _j1182;
const recordingStatus = _j67('recordingStatus');
if (recordingStatus) {
if (_j621) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j67('playbackStatus');
const countdownStatus = _j67('countdownStatus');
if (_j629) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1261) {
const _j1262 = loopWaitDuration - (millis() - _j638);
const _j1263 = Math.ceil(_j1262 / 1000);
const _j828 = _j1262 / loopWaitDuration;
if (window.DEBUG_MODE && _j1263 !== _j1180) {
console.log(`Countdown: ${_j1263}s remaining (${Math.floor(_j828 * 100)}%)`);
_j1180 = _j1263;
}
const countdownText = _j67('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1263}s`;
}
const countdownCircle = _j67('countdownCircle');
if (countdownCircle) {
const _j1264 = 62.83;
const _j1265 = _j1264 * (1 - _j828);
countdownCircle.style.strokeDashoffset = _j1265;
}
}
} else {
_j1180 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1261) {
const _j428 = recordingData.events.length > 0 ?
_j631 / recordingData.events.length : 0;
const _j1266 = Math.round(_j428 * 100);
if (_j1266 !== _j1183) {
const progressFill = _j67('progressFill');
const progressText = _j67('progressText');
if (progressFill) progressFill.style.width = `${_j1266}%`;
if (progressText) progressText.textContent = `${_j1266}%`;
_j1183 = _j1266;
}
}
}
} else {
_j1180 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1261) {
_j1181 = now;
}
if (typeof _j115 === 'function') {
_j115();
}
}
function _j142(_j1530) {
const _j1267 = document.createElement('div');
_j1267.className = 'message-item new-message';
const _j1268 = document.createElement('span');
_j1268.className = 'message-icon';
_j1268.textContent = _j1530.icon;
const _j1269 = document.createElement('div');
_j1269.className = 'message-content';
const _j1270 = document.createElement('div');
_j1270.className = 'message-header';
const _j1271 = document.createElement('span');
_j1271.className = 'message-timestamp';
_j1271.textContent = _j1530.timestamp;
const _j1272 = document.createElement('span');
_j1272.className = `message-type ${_j1530.type}`;
_j1272.textContent = _j1530.type.toUpperCase();
_j1270.appendChild(_j1271);
_j1270.appendChild(_j1272);
const _j1273 = document.createElement('p');
_j1273.className = 'message-text';
_j1273.textContent = _j1530.message;
_j1269.appendChild(_j1270);
_j1269.appendChild(_j1273);
if (Object.keys(_j1530.data).length > 0) {
const _j1274 = document.createElement('div');
_j1274.className = 'message-data';
_j1274.textContent = JSON.stringify(_j1530.data, null, 2);
_j1269.appendChild(_j1274);
}
_j1267.appendChild(_j1268);
_j1267.appendChild(_j1269);
setTimeout(() => {
_j1267.classList.remove('new-message');
}, 300);
return _j1267;
}
function _j143() {
_j677 = !_j677;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j677) {
overlay.style.display = 'block';
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j74();
} else {
_j95(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
setTimeout(() => {
if (!_j677) {
overlay.style.display = 'none';
}
}, 300);
}
}
localStorage.setItem('overlayVisible', _j677.toString());
}
function _j144() {
_j678 = [];
_j114();
}
function _j145() {
const _j1275 = document.getElementById('record-status-text');
if (_j1275) {
if (_j628 == 1) {
_j1275.textContent = 'ON';
_j1275.classList.add('active');
} else {
_j1275.textContent = 'OFF';
_j1275.classList.remove('active');
}
}
}
function _j146() {
const _j1276 = {};
const _j1277 = window.location.search;
if (!_j1277 || _j1277.length <= 1) {
return _j1276;
}
const _j1278 = _j1277.substring(1);
const _j1014 = _j1278.split('_');
const _j1279 = {
'wd': true,
'gr': true
};
for (const _j1280 of _j1014) {
if (!_j1280) continue;
const _j1281 = _j1280.indexOf(':');
if (_j1281 === -1) continue;
const key = _j1280.substring(0, _j1281);
const value = _j1280.substring(_j1281 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1282 = parseInt(value);
if (!isNaN(_j1282) && _j1282 > 0) {
_j1276[key] = _j1282;
}
continue;
}
if (_j1279[key]) {
const _j1283 = parseFloat(value);
if (!isNaN(_j1283) && _j1283 > 0) {
_j1276[key] = true;
_j1276[key + '_val'] = _j1283;
} else {
_j1276[key] = false;
}
} else {
_j1276[key] = value === '1';
}
}
}
return _j1276;
}
function _j147(_j1531) {
const _j1284 = {
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
for (const [_j1280, toggleId] of Object.entries(_j1284)) {
if (_j1531.hasOwnProperty(_j1280)) {
if (_j1280 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1285 = _j1531[_j1280];
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.checked = _j1285;
toggle.dispatchEvent(new Event('change'));
if (_j1280 === 'rs') {
const _j1286 = document.getElementById('rs-sliders-section');
if (_j1286) {
_j1286.style.display = _j1285 ? 'flex' : 'none';
}
} else if (_j1280 === 'distort') {
const _j1287 = document.getElementById('distort-sliders-section');
if (_j1287) {
_j1287.style.display = _j1285 ? 'flex' : 'none';
}
} else if (_j1280 === 'cl') {
const _j1288 = document.getElementById('cellular-sliders-section');
if (_j1288) {
_j1288.style.display = _j1285 ? 'flex' : 'none';
}
} else if (_j1280 === 'wd') {
const _j1289 = document.getElementById('white-dot-sliders-section');
if (_j1289) {
_j1289.style.display = _j1285 ? 'flex' : 'none';
}
if (_j1285 && _j1531['wd_val'] !== undefined) {
const _j1290 = document.getElementById('white-dot-density');
const _j1291 = document.getElementById('white-dot-density-value');
if (_j1290) _j1290.value = _j1531['wd_val'];
if (_j1291) _j1291.textContent = _j1531['wd_val'].toFixed(2);
}
} else if (_j1280 === 'gr') {
const _j1292 = document.getElementById('grain-sliders-section');
if (_j1292) {
_j1292.style.display = _j1285 ? 'flex' : 'none';
}
if (_j1285 && _j1531['gr_val'] !== undefined) {
const _j1293 = document.getElementById('grain-amount');
const _j1294 = document.getElementById('grain-amount-value');
if (_j1293) _j1293.value = _j1531['gr_val'];
if (_j1294) _j1294.textContent = _j1531['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1280}`);
}
}
}
}
function _j148() {
_j66();
const _j1295 = _j146();
const _j1296 = {
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
if (_j1295['w']) window._urlCanvasWidth = _j1295['w'];
if (_j1295['h']) window._urlCanvasHeight = _j1295['h'];
if (Object.keys(_j1295).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1280, _j1285] of Object.entries(_j1295)) {
const globalVarName = _j1296[_j1280];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1280 === 'loop') {
window[globalVarName] = _j1285 ? 1 : 0;
} else {
window[globalVarName] = _j1285;
}
}
}
const _j1297 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1298 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1280, globalVarName] of Object.entries(_j1297)) {
const valKey = _j1280 + '_val';
if (_j1295[valKey] !== undefined) {
window[globalVarName] = _j1295[valKey];
window[_j1298[_j1280]] = _j1295[valKey];
}
}
window._initialConsoleFromURL = _j1295.hasOwnProperty('console') ? _j1295.console : false;
}
const _j1230 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1231 = _j1230 === 'collector';
const _j1195 = document.getElementById('toggle-overlay');
const _j1299 = document.getElementById('toggle-hint-btn');
const _j1300 = document.getElementById('clear-bite-points');
const _j1301 = document.getElementById('scan-global');
const _j1302 = document.getElementById('scan-current');
const _j1303 = document.getElementById('scan-random');
const _j1304 = document.getElementById('scan-current-random');
const _j1305 = document.getElementById('brush-hint-btn');
const _j1306 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1306.length > 0) {
let _j1307 = 2;
if (typeof _j505 !== 'undefined') {
_j1307 = _j505;
}
const _j1308 = document.querySelector(`input[name="pixel-density"][value="${_j1307}"]`);
if (_j1308) {
_j1308.checked = true;
}
_j1306.forEach(_j1537 => {
_j1537.addEventListener('change', (e) => {
if (e.target.checked) {
const _j721 = parseInt(e.target.value);
if (typeof _j505 !== 'undefined') {
_j505 = _j721;
try {
sessionStorage.setItem('pendingPixelDensity', _j721.toString());
if (typeof _j621 !== 'undefined' && _j621 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j111('system', '🎨 Pixel density changed - reloading page', {
Value: _j721,
Status: 'Page will reload to recreate canvas with new pixel density',
Note: 'Current drawing will be cleared'
});
setTimeout(() => {
window.location.reload();
}, 300);
} catch (error) {
_j111('system', '❌ Failed to update pixel density', {
Error: error.message,
Status: 'Error'
});
}
} else {
_j111('system', '⚠️ Pixel variable not found', {
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
if (_j1231) {
if (_j1305) _j1305.style.display = 'none';
}
const _j1309 = document.getElementById('record-toggle');
const _j1275 = document.getElementById('record-status-text');
const _j1310 = document.getElementById('realtime-drawing-toggle');
const _j1311 = document.getElementById('realtime-drawing-status-text');
const _j1312 = document.getElementById('grid-overlay-toggle');
const _j1313 = document.getElementById('paper-texture-toggle');
const _j1314 = document.getElementById('camera-moving-toggle');
const _j1315 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1152 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j677) {
overlay.style.display = 'block';
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j74();
} else {
overlay.classList.add('hidden');
overlay.style.display = 'none';
hint.classList.remove('hidden');
}
}
const controlPanel = _j67('controlPanel');
if (controlPanel && brushHint) {
if (_j685) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1195) {
_j137(_j1195, _j143);
}
if (_j1299) {
_j137(_j1299, () => {
if (!_j94()) _j143();
});
}
if (_j1305) {
_j137(_j1305, () => {
if (!_j94()) _j102();
});
}
const _j1316 = document.getElementById('effect-hint-btn');
if (_j1316) {
_j137(_j1316, () => {
if (!_j94()) _j103();
});
}
const _j1317 = document.getElementById('flow-hint-btn');
if (_j1317) {
_j137(_j1317, () => {
if (!_j94()) _j104();
});
}
const _j1318 = document.getElementById('mask-hint-btn');
if (_j1318) {
_j137(_j1318, () => {
if (!_j94()) _j105();
});
}
const _j1319 = document.getElementById('agent-toggle-btn');
if (_j1319) {
_j137(_j1319, function() {
_j567 = !_j567;
if (_j567) {
_j565 = true;
_j568 = [];
_j1319.classList.add('agent-active');
_j1319.textContent = 'Agent ●';
console.log('[Agent] ON — recording paths with timestamps');
} else {
_j565 = false;
_j1319.classList.remove('agent-active');
_j1319.textContent = 'Agent';
console.log('[Agent] OFF — ' + _j568.length + ' points recorded');
}
});
}
if (_j1301) {
_j137(_j1301, () => {
if (typeof _j18 === 'function') {
const shapeType = _j158();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j806 = (typeof seed !== 'undefined') ? seed : null;
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
_j18(null, null, shapeType);
let recordedRandomCount = 0;
if (typeof window !== 'undefined' && window.currentScanEvent && window.currentScanEvent.recordedRandomCount !== undefined) {
recordedRandomCount = window.currentScanEvent.recordedRandomCount;
}
if (_j806 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j806);
noiseSeed(_j806);
}
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j184('ec', {
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
function _j149(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j158();
let scanBounds = null;
let _j315 = null;
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
if (strokeIndex !== null) {
_j315 = Math.max(0, Math.min(strokeIndex, allBrushStrokes.length - 1));
} else {
const _j1320 = document.getElementById('stroke-select-slider');
if (_j1320) {
_j315 = parseInt(_j1320.value) || 0;
_j315 = Math.max(0, Math.min(_j315, allBrushStrokes.length - 1));
}
}
if (_j315 !== null) {
const selectedStroke = allBrushStrokes[_j315];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j111('system', `🎯 EACH: 使用笔画 #${_j315} 的网格区域`, {
Index: _j315,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: allBrushStrokes.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j111('system', `🎯 EACH: 使用笔画 #${_j315} 的边界框（无网格数据）`, {
Index: _j315,
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
const _j806 = (typeof seed !== 'undefined') ? seed : null;
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
_j18(null, scanBounds, shapeType);
let recordedRandomCount = 0;
if (typeof window !== 'undefined' && window.currentScanEvent && window.currentScanEvent.recordedRandomCount !== undefined) {
recordedRandomCount = window.currentScanEvent.recordedRandomCount;
}
if (_j806 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j806);
noiseSeed(_j806);
}
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j184('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j315,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1302) {
_j137(_j1302, () => {
_j149();
});
}
if (_j1304) {
_j137(_j1304, () => {
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
const _j1321 = Math.floor(Math.random() * allBrushStrokes.length);
const _j1320 = document.getElementById('stroke-select-slider');
const _j1322 = document.getElementById('stroke-index-display');
const _j1323 = document.getElementById('stroke-select-value');
if (_j1320) {
_j1320.value = _j1321;
_j1320.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1322) {
_j1322.textContent = _j1321;
}
if (_j1323) {
_j1323.textContent = _j1321;
}
_j111('system', `🎲 EACHR: 随机选择笔画 #${_j1321}`, {
RandomIndex: _j1321,
TotalStrokes: allBrushStrokes.length
});
_j149(_j1321);
} else {
_j111('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1303) {
_j137(_j1303, () => {
if (typeof _j19 === 'function') {
const shapeType = _j158();
_j19(10, shapeType);
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
_j184('ec', {
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
if (_j1300) {
_j137(_j1300, () => {
if (typeof _j232 !== 'undefined' && _j232.length > 0) {
let pointCount = typeof _j232 !== 'undefined' ? _j232.length : 0;
if (typeof _j232 !== 'undefined') {
_j232 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j111('system', '🧹 清除虫咬点', {
'虫咬点': pointCount
});
} else {
_j111('system', '⚠️ 没有虫咬点可清除', {});
}
});
}
if (_j1309) {
_j1309.checked = (_j628 == 1);
_j145();
_j1309.addEventListener('change', (e) => {
_j628 = e.target.checked ? 1 : 0;
_j145();
_j111('system', `Record mode ${_j628 ? 'enabled' : 'disabled'}`, {
Status: _j628 ? 'ON' : 'OFF'
});
});
}
if (_j1310) {
_j1310.disabled = true;
if (_j1311) {
_j1311.textContent = 'DISABLED';
}
_j1310.addEventListener('change', (e) => {
e.target.checked = false;
_j111('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1312) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1312.checked = !!showGridOverlay;
}
} catch (e) {}
_j1312.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1541) {}
_j111('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1313) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1313.checked = !!showPaperTexture;
} else {
_j1313.checked = true;
}
} catch (e) {
_j1313.checked = true;
}
_j1313.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1541) {}
_j111('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1324 = document.getElementById('fit-canvas-toggle');
if (_j1324) {
_j1324.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
if (typeof window.toggleFitMode === 'function') {
window.toggleFitMode(enabled);
_j111('system', '🎨 Fit canvas', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
_j111('system', '⚠️ Fit mode function not available', {
Status: 'Error'
});
}
});
}
if (_j1314) {
try {
if (typeof doMoving !== 'undefined') {
_j1314.checked = !!doMoving;
} else {
_j1314.checked = false;
}
} catch (e) {
_j1314.checked = false;
}
_j1314.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1541) {}
_j111('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1315) {
try {
if (typeof loopToggle !== 'undefined') {
_j1315.checked = (loopToggle === 1);
} else {
_j1315.checked = false;
}
} catch (e) {
_j1315.checked = false;
}
_j1315.addEventListener('change', (e) => {
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
_j111('system', '🔁 Loop playback', {
Status: enabled ? 'Enabled ✅ (Auto repeat after 5s)' : 'Disabled ❌ (Single playback)'
});
} else {
console.warn('⚠️ loopToggle variable not found');
}
} catch (_j1541) {
console.error('Error setting loopToggle:', _j1541);
}
});
}
const _j1325 = document.getElementById('playback-offset-x');
const _j1326 = document.getElementById('playback-offset-y');
if (_j1325) {
if (typeof _j641 !== 'undefined') {
_j1325.value = _j641;
}
_j1325.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j641 !== 'undefined') {
_j641 = value;
_j111('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1326) {
if (typeof _j642 !== 'undefined') {
_j1326.value = _j642;
}
_j1326.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j642 !== 'undefined') {
_j642 = value;
_j111('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1327 = document.getElementById('distort-shader-toggle');
const _j1287 = document.getElementById('distort-sliders-section');
if (_j1327) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1327.checked = !!distortShaderEnabled;
if (_j1287) {
_j1287.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1327.checked = false;
if (_j1287) {
_j1287.style.display = 'none';
}
}
} catch (e) {
_j1327.checked = false;
if (_j1287) {
_j1287.style.display = 'none';
}
}
_j1327.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1287) {
_j1287.style.display = enabled ? 'flex' : 'none';
}
_j111('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1541) {
console.error('Error setting distortShaderEnabled:', _j1541);
}
});
}
const _j1328 = document.getElementById('distort-displacement-b');
const _j1329 = document.getElementById('distort-displacement-b-value');
if (_j1328 && _j1329) {
const _j1330 = parseFloat(_j1328.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1330;
}
_j1329.textContent = Math.round(_j1330);
_j1328.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1329.textContent = Math.round(value);
});
}
const _j1331 = document.getElementById('distort-displacement-c');
const _j1332 = document.getElementById('distort-displacement-c-value');
if (_j1331 && _j1332) {
const _j1330 = parseFloat(_j1331.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1330;
}
_j1332.textContent = Math.round(_j1330);
_j1331.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1332.textContent = Math.round(value);
});
}
const _j1333 = document.getElementById('distort-fbm-preview-toggle');
if (_j1333) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1333.checked = (distortShowFbmMask > 0.5);
} else {
_j1333.checked = false;
}
} catch (e) {
_j1333.checked = false;
}
_j1333.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = enabled ? 1.0 : 0.0;
_j111('system', '🎨 fBM Mask Preview', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShowFbmMask variable not found');
}
} catch (_j1541) {
console.error('Error setting distortShowFbmMask:', _j1541);
}
});
}
const _j1334 = document.getElementById('rs-toggle');
const _j1286 = document.getElementById('rs-sliders-section');
if (_j1334) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1334.checked = !!rsEnabled;
if (_j1286) {
_j1286.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1334.checked = false;
if (_j1286) {
_j1286.style.display = 'none';
}
}
} catch (e) {
_j1334.checked = false;
if (_j1286) {
_j1286.style.display = 'none';
}
}
_j1334.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1286) {
_j1286.style.display = enabled ? 'flex' : 'none';
}
_j111('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1541) {
console.error('Error setting rsEnabled:', _j1541);
}
});
}
const _j1335 = document.getElementById('rs-frequency');
const _j1336 = document.getElementById('rs-frequency-value');
if (_j1335 && _j1336) {
const _j1330 = parseFloat(_j1335.value);
if (typeof _j581 !== 'undefined') {
_j581 = _j1330;
}
_j1336.textContent = Math.round(_j1330);
_j1335.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j581 !== 'undefined') {
_j581 = value;
}
_j1336.textContent = Math.round(value);
});
}
const _j1337 = document.getElementById('rs-wave-speed');
const _j1338 = document.getElementById('rs-wave-speed-value');
if (_j1337 && _j1338) {
const _j1330 = parseFloat(_j1337.value);
if (typeof _j582 !== 'undefined') {
_j582 = _j1330;
}
_j1338.textContent = _j1330.toFixed(1);
_j1337.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j582 !== 'undefined') {
_j582 = value;
}
_j1338.textContent = value.toFixed(1);
});
}
const _j1339 = document.getElementById('rs-strength');
const _j1340 = document.getElementById('rs-strength-value');
if (_j1339 && _j1340) {
const _j1330 = parseFloat(_j1339.value);
if (typeof _j583 !== 'undefined') {
_j583 = _j1330;
}
_j1340.textContent = _j1330.toFixed(1);
_j1339.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j583 !== 'undefined') {
_j583 = value;
}
_j1340.textContent = value.toFixed(1);
});
}
const _j1341 = document.getElementById('rs-gradient-mix');
const _j1342 = document.getElementById('rs-gradient-mix-value');
if (_j1341 && _j1342) {
const _j1330 = parseFloat(_j1341.value);
if (typeof _j584 !== 'undefined') {
_j584 = _j1330;
}
_j1342.textContent = _j1330.toFixed(1);
_j1341.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j584 !== 'undefined') {
_j584 = value;
}
_j1342.textContent = value.toFixed(1);
});
}
const _j1343 = document.getElementById('rs-scale');
const _j1344 = document.getElementById('rs-scale-value');
if (_j1343 && _j1344) {
const _j1330 = parseFloat(_j1343.value);
if (typeof _j585 !== 'undefined') {
_j585 = _j1330;
}
_j1344.textContent = Math.round(_j1330);
_j1343.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j585 !== 'undefined') {
_j585 = value;
}
_j1344.textContent = Math.round(value);
});
}
const _j1345 = document.getElementById('cellular-toggle');
const _j1288 = document.getElementById('cellular-sliders-section');
if (_j1345) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1345.checked = !!cellularEnabled;
if (_j1288) {
_j1288.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1345.checked = false;
if (_j1288) _j1288.style.display = 'none';
}
} catch (e) {
_j1345.checked = false;
if (_j1288) _j1288.style.display = 'none';
}
_j1345.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1288) {
_j1288.style.display = enabled ? 'flex' : 'none';
}
_j111('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1541) {
console.error('Error setting cellularEnabled:', _j1541);
}
});
}
const _j1346 = document.getElementById('cellular-scale');
const _j1347 = document.getElementById('cellular-scale-value');
if (_j1346 && _j1347) {
const _j1330 = parseFloat(_j1346.value);
if (typeof _j586 !== 'undefined') _j586 = _j1330;
_j1347.textContent = _j1330.toFixed(1);
_j1346.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j586 !== 'undefined') _j586 = value;
_j1347.textContent = value.toFixed(1);
});
}
const _j1348 = document.getElementById('cellular-seed');
const _j1349 = document.getElementById('cellular-seed-value');
if (_j1348 && _j1349) {
const _j1330 = parseFloat(_j1348.value);
if (typeof _j587 !== 'undefined') _j587 = _j1330;
_j1349.textContent = _j1330.toFixed(1);
_j1348.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j587 !== 'undefined') _j587 = value;
_j1349.textContent = value.toFixed(1);
});
}
const _j1350 = document.getElementById('white-dot-toggle');
const _j1351 = document.getElementById('white-dot-sliders-section');
if (_j1350) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1350.checked = !!whiteDotEnabled;
if (_j1351) _j1351.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1350.checked = false;
if (_j1351) _j1351.style.display = 'none';
}
} catch (e) {
_j1350.checked = false;
if (_j1351) _j1351.style.display = 'none';
}
_j1350.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1351) _j1351.style.display = enabled ? 'flex' : 'none';
_j111('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1541) {
console.error('Error setting whiteDotEnabled:', _j1541);
}
});
}
const _j1352 = document.getElementById('white-dot-density');
const _j1353 = document.getElementById('white-dot-density-value');
if (_j1352 && _j1353) {
if (window._urlParamWdVal !== undefined) {
const _j1354 = window._urlParamWdVal;
_j588 = _j1354 * 0.1;
_j1352.value = _j1354;
_j1353.textContent = _j1354.toFixed(2);
} else {
const _j1354 = parseFloat(_j1352.value);
if (typeof _j588 !== 'undefined') _j588 = _j1354 * 0.1;
_j1353.textContent = _j1354.toFixed(2);
}
_j1352.addEventListener('input', (e) => {
const _j1354 = parseFloat(e.target.value);
if (typeof _j588 !== 'undefined') _j588 = _j1354 * 0.1;
_j1353.textContent = _j1354.toFixed(2);
});
}
const _j1355 = document.getElementById('grain-toggle');
const _j1356 = document.getElementById('grain-sliders-section');
if (_j1355) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1355.checked = !!grainEnabled;
if (_j1356) _j1356.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1355.checked = false;
if (_j1356) _j1356.style.display = 'none';
}
} catch (e) {
_j1355.checked = false;
if (_j1356) _j1356.style.display = 'none';
}
_j1355.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1356) _j1356.style.display = enabled ? 'flex' : 'none';
_j111('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1541) {
console.error('Error setting grainEnabled:', _j1541);
}
});
}
const _j1357 = document.getElementById('grain-amount');
const _j1358 = document.getElementById('grain-amount-value');
if (_j1357 && _j1358) {
if (window._urlParamGrVal !== undefined) {
const _j1354 = window._urlParamGrVal;
_j589 = _j1354 * 0.1;
_j1357.value = _j1354;
_j1358.textContent = _j1354.toFixed(2);
} else {
const _j1354 = parseFloat(_j1357.value);
if (typeof _j589 !== 'undefined') _j589 = _j1354 * 0.1;
_j1358.textContent = _j1354.toFixed(2);
}
_j1357.addEventListener('input', (e) => {
const _j1354 = parseFloat(e.target.value);
if (typeof _j589 !== 'undefined') _j589 = _j1354 * 0.1;
_j1358.textContent = _j1354.toFixed(2);
});
}
const _j1359 = document.getElementById('future-path-preview-toggle');
if (_j1359) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1359.checked = !!showFuturePathPreview;
} else {
_j1359.checked = true;
}
} catch (e) {
_j1359.checked = true;
}
_j1359.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j111('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1541) {
console.error('Error setting showFuturePathPreview:', _j1541);
}
});
}
if (recordBtn) {
_j137(recordBtn, () => {
if (!_j621 && !_j629) {
_j185();
_j115();
}
});
}
if (stopBtn) {
_j137(stopBtn, () => {
if (_j621) {
_j186();
} else if (_j629) {
_j189();
}
_j115();
});
}
if (playBtn) {
_j137(playBtn, () => {
if (!_j621 && !_j629 && recordingData.events.length > 0) {
startPlayback();
_j115();
}
});
}
if (loadBtn) {
_j137(loadBtn, () => {
if (!_j621 && !_j629) {
_j188();
}
});
}
const _j1360 = document.getElementById('load-image');
const _j1361 = document.getElementById('image-file-input');
if (_j1231) {
if (_j1360) _j1360.style.display = 'none';
} else if (_j1360 && _j1361) {
_j137(_j1360, () => {
_j1361.click();
});
_j1361.addEventListener('change', (e) => {
const _j1362 = e.target.files[0];
if (_j1362 && _j1362.type.startsWith('image/')) {
_j118(_j1362);
}
});
}
const _j1363 = document.getElementById('show-reference-image');
if (_j1363 && !_j1231) {
_j137(_j1363, () => {
_j119();
});
}
const _j1364 = document.getElementById('hide-reference-image');
if (_j1364 && !_j1231) {
_j137(_j1364, () => {
_j120();
});
}
if (_j1152) {
_j1152.addEventListener('mousedown', _j68);
_j1152.addEventListener('touchstart', (e) => {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j68(_j1249);
});
}
_j73();
const _j1365 = _j67('flowEffectPanel');
if (_j1365 && !_j1365.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1365.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1540 => {
const _j1366 = _j1540.getAttribute('data-panel');
const _j1367 = {
overlay: _j68,
control: _j75,
effect: _j79,
flow: _j83
};
const fn = _j1367[_j1366];
if (!fn) return;
_j1540.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1540.addEventListener('touchstart', (e) => {
const _j1160 = e.touches[0];
fn({ clientX: _j1160.clientX, clientY: _j1160.clientY, target: _j1540, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j72(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j69);
document.addEventListener('mouseup', _j70);
document.addEventListener('touchmove', (e) => {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY
};
_j69(_j1249);
});
document.addEventListener('touchend', _j70);
document.addEventListener('mousemove', _j76);
document.addEventListener('mouseup', _j77);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY
};
_j76(_j1249);
}
});
document.addEventListener('touchend', _j77);
document.addEventListener('mousemove', _j80);
document.addEventListener('mouseup', _j81);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY
};
_j80(_j1249);
}
});
document.addEventListener('touchend', _j81);
document.addEventListener('mousemove', _j84);
document.addEventListener('mouseup', _j85);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY
};
_j84(_j1249);
}
});
document.addEventListener('touchend', _j85);
document.addEventListener('mousemove', _j88);
document.addEventListener('mouseup', _j89);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1160 = e.touches[0];
const _j1249 = {
clientX: _j1160.clientX,
clientY: _j1160.clientY
};
_j88(_j1249);
}
});
document.addEventListener('touchend', _j89);
if (hint && !_j677) {
hint.classList.remove('hidden');
}
_j115();
_j156();
_j160();
_j165();
_j161();
_j82();
_j86();
const effectControlPanel = _j67('effectControlPanel');
const effectHint = _j67('effectHint');
const _j1251 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j689) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1251) {
_j1251.textContent = _j689 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j67('flowEffectPanel');
const flowHint = _j67('flowHint');
const _j1253 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j693) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1253) {
_j1253.textContent = _j693 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1295).length > 0) {
setTimeout(() => {
_j147(_j1295);
_j111('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1295).length
});
}, 200);
}
setTimeout(() => {
_j101();
_j100();
}, 100);
_j150();
}
let _j1368 = false;
let _j1369 = null;
function _j150() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j137(btn, _j154);
_j151();
_j152();
}
function _j151() {
if (document.getElementById('collect-panels-btn')) return;
const btn = document.createElement('button');
btn.id = 'collect-panels-btn';
btn.innerHTML = '◎';
btn.title = 'Collect all panels here';
document.body.appendChild(btn);
_j137(btn, _j153);
}
function _j152() {
if (document.getElementById('ref-image-toggle-btn')) return;
const btn = document.createElement('button');
btn.id = 'ref-image-toggle-btn';
btn.innerHTML = '⬒';
btn.title = 'Toggle reference image (tap: show/hide, long press: switch edge/photo)';
document.body.appendChild(btn);
let _j1370 = null;
let _j1371 = false;
const _j1372 = () => {
_j1371 = false;
_j1370 = setTimeout(() => {
_j1371 = true;
_j117();
}, 500);
};
const _j1373 = () => {
clearTimeout(_j1370);
if (!_j1371) {
if (_j1179) {
_j120();
} else {
_j119();
}
}
};
btn.addEventListener('pointerdown', _j1372);
btn.addEventListener('pointerup', _j1373);
btn.addEventListener('pointercancel', () => clearTimeout(_j1370));
}
const _j1374 = [
{
overlay:       { x: 53.58, y: 30.93 },
control:       { x: 39.73, y: 38.41 },
effectControl: { x: 67.54, y: 60.80 },
flowEffect:    { x: 67.49, y: 27.29 },
mask:          { x: 53.44, y: 54.91 },
},
{
overlay:       { x: 51.91, y: 23.66 },
control:       { x: 24.13, y: 31.07 },
effectControl: { x: 80.01, y: 21.19 },
flowEffect:    { x: 66.02, y: 20.02 },
mask:          { x: 37.97, y:  8.25 },
},
{
overlay:       { x:  6.92, y: 78.02 },
control:       { x:  6.96, y: 31.22 },
effectControl: { x: 92.84, y: 63.85 },
flowEffect:    { x: 92.91, y: 30.19 },
mask:          { x: 92.93, y:  9.48 },
},
];
let _j1375 = 0;
function _j153() {
const d = _j1374[_j1375];
_j1375 = (_j1375 + 1) % _j1374.length;
if (typeof _j681 !== 'undefined') { _j681.x = d.overlay.x; _j681.y = d.overlay.y; }
if (typeof _j684 !== 'undefined') { _j684.x = d.control.x; _j684.y = d.control.y; }
if (typeof _j688 !== 'undefined') { _j688.x = d.effectControl.x; _j688.y = d.effectControl.y; }
if (typeof _j692 !== 'undefined') { _j692.x = d.flowEffect.x; _j692.y = d.flowEffect.y; }
if (typeof _j696 !== 'undefined') { _j696.x = d.mask.x; _j696.y = d.mask.y; }
if (typeof _j74 === 'function') _j74();
if (typeof _j78 === 'function') _j78();
if (typeof _j82 === 'function') _j82();
if (typeof _j86 === 'function') _j86();
if (typeof _j90 === 'function') _j90();
if (typeof _j110 === 'function') _j110();
}
function _j154() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1376 = document.getElementById('effect-control-panel');
const _j1365 = document.getElementById('flow-effect-panel');
const maskPanel = document.getElementById('mask-panel');
const _j1377 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint, #mask-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1368) {
_j1369 = {
overlay: _j677,
control: _j685,
effect: _j689,
flow: _j693,
mask: _j697
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1376) _j1376.style.display = 'none';
if (_j1365) _j1365.style.display = 'none';
if (maskPanel) maskPanel.style.display = 'none';
_j1377.forEach(h => h.style.display = 'none');
_j677 = false;
_j685 = false;
_j689 = false;
_j693 = false;
_j697 = false;
_j1368 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1369 || { overlay: true, control: true, effect: true, flow: true, mask: true };
_j677 = s.overlay;
_j685 = s.control;
_j689 = s.effect;
_j693 = s.flow;
_j697 = s.mask !== undefined ? s.mask : true;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1376) _j1376.style.display = s.effect ? 'block' : 'none';
if (_j1365) _j1365.style.display = s.flow ? 'block' : 'none';
if (maskPanel) maskPanel.style.display = _j697 ? 'block' : 'none';
_j1377.forEach(h => h.style.display = '');
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
if (s.mask) {
const maskHint = document.getElementById('mask-hint');
if (maskHint) maskHint.classList.add('hidden');
}
_j1368 = false;
_j1369 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j155();
}
}
function _j155() {
const _j1378 = [
{ panel: _j67('messageOverlay'), pos: _j681, update: _j74, defaultPos: { x: 50, y: 50 } },
{ panel: _j67('controlPanel'), pos: _j684, update: _j78, defaultPos: { x: 85, y: 50 } },
{ panel: _j67('effectControlPanel'), pos: _j688, update: _j82, defaultPos: { x: 15, y: 50 } },
{ panel: _j67('flowEffectPanel'), pos: _j692, update: _j86, defaultPos: { x: 50, y: 85 } }
];
_j1378.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1152 = panel.querySelector('.control-btn');
if (!_j1152) return;
const rect = _j1152.getBoundingClientRect();
const vw = window.innerWidth;
const vh = window.innerHeight;
if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) {
pos.x = defaultPos.x;
pos.y = defaultPos.y;
update();
}
});
_j110();
}
function activateZenMode() {
if (_j1368) return;
_j154();
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
let _j1379 = false;
const _j1380 = new MutationObserver(() => {
if (_j1379) return;
if (go()) {
_j1379 = true;
_j1380.disconnect();
}
});
_j1380.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1379) _j1380.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j156() {
const _j1381 = document.getElementById('metallic-strength');
const _j1382 = document.getElementById('metallic-strength-value');
if (_j1381 && _j1382) {
const _j1330 = parseFloat(_j1381.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1330 / 100;
}
_j1382.textContent = _j1330;
_j1381.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1382.textContent = value;
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
_j184('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1383 = document.getElementById('metallic-flow');
const _j1384 = document.getElementById('metallic-flow-value');
const _j1385 = document.getElementById('flow-auto-random');
let _j1386 = null;
if (_j1383 && _j1384) {
const _j1330 = parseFloat(_j1383.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1330 / 100;
}
_j1384.textContent = _j1330;
_j1383.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1384.textContent = value;
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
_j184('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1385 && _j1383 && _j1384) {
_j1385.addEventListener('click', () => {
const isActive = _j1385.getAttribute('data-active') === 'true';
if (isActive) {
_j1385.setAttribute('data-active', 'false');
_j1385.classList.remove('active');
if (_j1386) {
clearInterval(_j1386);
_j1386 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1385.setAttribute('data-active', 'true');
_j1385.classList.add('active');
_j1386 = setInterval(() => {
const _j314 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1383.value = _j314;
_j1384.textContent = _j314;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j314 / 50;
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
Object.keys(tintButtons).forEach(_j1446 => {
const _j1387 = document.getElementById(_j1446);
if (_j1387) {
_j1387.classList.remove('active');
}
});
btn.classList.add('active');
const _j1388 = btn.textContent.trim();
_j111('system', '🎨 Metal tint changed', {
Tint: _j1388,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
const tintType = id.replace('metal-', '');
_j184('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j157() {
_j126();
_j123();
_j130();
_j132();
_j134();
_j129();
}
function _j158() {
const _j1389 = document.querySelector('.shape-type-btn.active');
if (_j1389) {
return parseInt(_j1389.dataset.type);
}
return 0;
}
function _j159(type) {
const _j1196 = document.querySelectorAll('.shape-type-btn');
_j1196.forEach(btn => {
const _j1390 = parseInt(btn.dataset.type);
if (_j1390 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j160() {
const _j804 = document.getElementById('bugs-size');
const _j1391 = document.getElementById('bugs-size-value');
if (_j804 && _j1391) {
const _j1330 = parseFloat(_j804.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1330;
}
_j1391.textContent = _j1330;
_j804.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1391.textContent = value;
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
_j184('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1392 = document.querySelectorAll('.shape-type-btn');
_j1392.forEach(btn => {
_j137(btn, () => {
const type = parseInt(btn.dataset.type);
_j159(type);
});
});
}
function _j161() {
const _j1320 = document.getElementById('stroke-select-slider');
const _j1322 = document.getElementById('stroke-index-display');
const _j1393 = document.getElementById('stroke-total-display');
const _j1323 = document.getElementById('stroke-select-value');
if (!_j1320 || !_j1322 || !_j1393 || !_j1323) {
return;
}
function _j162(_j1532 = false) {
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
const _j1394 = Math.max(0, strokeCount - 1);
_j1320.max = _j1394;
_j1393.textContent = strokeCount;
if (_j1532 || parseInt(_j1320.value) > _j1394) {
_j1320.value = _j1394;
}
const _j1395 = parseInt(_j1320.value) || 0;
_j1322.textContent = _j1395;
_j1323.textContent = _j1395;
}
_j162();
_j1320.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1322.textContent = value;
_j1323.textContent = value;
let gridParams = null;
let points = null;
if (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0) {
const _j1396 = Math.max(0, Math.min(value, allBrushStrokes.length - 1));
const selectedStroke = allBrushStrokes[_j1396];
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
let _j1397 = 0;
setInterval(() => {
const _j1398 = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (_j1398 !== _j1397) {
const _j549 = _j1398 > _j1397;
_j162(_j549);
_j1397 = _j1398;
}
}, 500);
window.updateStrokeSelector = _j162;
}
function _j163() {
const _j1237 = document.getElementById('custom-brush-color');
const _j1238 = document.getElementById('custom-brush-color-text');
if (!_j1237 || !_j1238) {
console.error('Custom brush color inputs not found');
return;
}
let _j1227 = _j1238.value.trim();
if (!_j1227 || !/^#[0-9A-Fa-f]{6}$/.test(_j1227)) {
_j1227 = _j1237.value;
}
const r = parseInt(_j1227.slice(1, 3), 16);
const g = parseInt(_j1227.slice(3, 5), 16);
const b = parseInt(_j1227.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j111('ui', '❌ Invalid custom brush color', {
Color: _j1227,
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
_j132();
_j135();
_j1237.value = _j1227.toUpperCase();
_j1238.value = _j1227.toUpperCase();
_j111('ui', '🎨 Custom brush color applied', {
Color: _j1227,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j164() {
const _j1225 = document.getElementById('canvas-background-color');
const _j1226 = document.getElementById('canvas-background-color-text');
const _j1228 = document.getElementById('canvas-width');
const _j1229 = document.getElementById('canvas-height');
let _j1399 = false;
if (_j1225 && _j1226) {
let _j1227 = _j1226.value.trim();
if (!_j1227 || !/^#[0-9A-Fa-f]{6}$/.test(_j1227)) {
_j1227 = _j1225.value;
}
const r = parseInt(_j1227.slice(1, 3), 16);
const g = parseInt(_j1227.slice(3, 5), 16);
const b = parseInt(_j1227.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j111('ui', '❌ Invalid background color', {
Color: _j1227,
Status: 'Please use format #RRGGBB'
});
return;
}
if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
_j111('ui', '❌ Color values out of range', {
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
_j111('ui', '❌ canvasBackgroundColor not found', {
Status: 'Error: Variable not defined'
});
return;
}
if (typeof _j618 !== 'undefined' && _j618) {
_j618.begin();
background(r, g, b);
_j618.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j566 !== 'undefined') {
_j566 = true;
}
_j1225.value = _j1227.toUpperCase();
_j1226.value = _j1227.toUpperCase();
_j111('ui', '🎨 Background color changed', {
Color: _j1227,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1228 && _j1229) {
const _j1400 = parseInt(_j1228.value);
const _j1401 = parseInt(_j1229.value);
if (isNaN(_j1400) || isNaN(_j1401)) {
_j111('ui', '❌ Invalid canvas size', {
Width: _j1228.value,
Height: _j1229.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1400 < 100 || _j1400 > 4000 || _j1401 < 100 || _j1401 > 4000) {
_j111('ui', '❌ Canvas size out of range', {
Width: _j1400,
Height: _j1401,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j503 !== 'undefined' && typeof _j504 !== 'undefined') {
if (_j503 !== _j1400 || _j504 !== _j1401) {
_j503 = _j1400;
_j504 = _j1401;
_j1399 = true;
_j111('ui', '📐 Canvas size changed', {
Width: `${_j1400}px`,
Height: `${_j1401}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1399) {
sessionStorage.setItem('pendingCanvasWidth', _j503.toString());
sessionStorage.setItem('pendingCanvasHeight', _j504.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1402 = null;
let _j1403 = null;
function _j165() {
const _j1404 = document.querySelectorAll('.flow-effect-btn');
const _j1405 = document.getElementById('flow-strength');
const _j1406 = document.getElementById('flow-strength-value');
if (_j1405 && _j1406) {
_j1405.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1406.textContent = value;
if (typeof _j604 !== 'undefined') {
_j604.blendVol = value;
}
});
}
const _j1407 = document.getElementById('flow-last-stroke-only');
if (_j1407) {
_j1407.addEventListener('change', (e) => {
if (typeof _j605 !== 'undefined') {
_j605 = e.target.checked;
_j111('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j605
});
}
});
}
_j1404.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j166(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j167(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1402 === btn) {
_j167(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j166(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j167(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j167(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1402) {
const blendType = parseInt(_j1402.dataset.type);
_j167(_j1402, blendType);
}
});
}
function _j166(btn, blendType) {
if (_j1402) return;
const bounds = typeof _j49 === 'function' ? _j49() : null;
if (!bounds) {
_j111('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1402 = btn;
btn.classList.add('active', 'running');
if (typeof flowEffectStrokeBounds !== 'undefined') {
flowEffectStrokeBounds = bounds;
}
if (typeof window !== 'undefined') {
window.flowEffectStrokeBounds = bounds;
}
const flowSeed = Math.floor(Math.random() * 1000000);
if (typeof _j50 === 'function') {
_j50(blendType, flowSeed);
}
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621) {
if (typeof _j624 !== 'undefined' && _j624 > 0 && typeof _j626 !== 'undefined') {
const _j810 = millis() - _j624;
if (_j810 > 0) {
_j626 += _j810;
_j624 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j810,
total: _j626
});
}
}
const _j1408 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j604 !== 'undefined') ? _j604.blendVol : 100,
lastStrokeOnly: (typeof _j605 !== 'undefined') ? _j605 : false
};
console.log('🎬 Recording flow start event:', _j1408);
_j184('flow', _j1408);
}
_j1403 = setInterval(() => {
const _j909 = document.getElementById('flow-iteration-count');
if (_j909 && typeof _j594 !== 'undefined') {
_j909.textContent = _j594;
}
}, 50);
_j111('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j167(btn, blendType) {
if (_j1402 !== btn) return;
btn.classList.remove('active', 'running');
_j1402 = null;
if (_j1403) {
clearInterval(_j1403);
_j1403 = null;
}
let _j1409 = null;
if (typeof _j51 === 'function') {
_j1409 = _j51();
}
if (typeof _j184 === 'function' && typeof _j621 !== 'undefined' && _j621 && _j1409) {
const _j1410 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j596 !== 'undefined') ? _j596 : 0,
duration: _j1409.duration,
iterations: _j1409.iterations,
totalFrames: _j1409.frames
};
console.log('🎬 Recording flow end event:', _j1410);
_j184('flow', _j1410);
if (typeof _j624 !== 'undefined') {
_j624 = millis();
}
}
_j111('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1409 ? Math.round(_j1409.duration) + 'ms' : 'unknown',
Iterations: _j1409 ? _j1409.iterations : 'unknown',
Frames: _j1409 ? _j1409.frames : 'unknown'
});
}
let _j1411 = {
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
_pushFR: function(_j1533) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1533;
this._frSum += _j1533;
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
const _j1412 = this._avgFR();
console.log('平均 frameRate:', _j1412.toFixed(2));
console.log('是否触发警告:', _j1412 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1413 = this.logCooldown;
this.logCooldown = 0;
const _j1414 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1414.toFixed(2));
_j36(_j1414);
this.logCooldown = _j1413;
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
const _j1412 = this._avgFR();
console.log('平均帧率:', _j1412);
const _j1413 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j36(_j1412);
this.logCooldown = _j1413;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1413 = this.logCooldown;
this.logCooldown = 0;
const _j1415 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1415);
_j36(_j1415);
this.logCooldown = _j1413;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1411 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1411).filter(k => typeof _j1411[k] === 'function'));
_j36(50);
};
function _j168() {
_j510 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j511 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j513 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j169() {
const _j478 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j478[0], _j478[1], _j478[2]);
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
if (typeof _j612 !== 'undefined' && _j612) {
_j612.clear();
}
if (typeof finalBuffer !== 'undefined' && finalBuffer) {
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
}
if (typeof _j614 !== 'undefined' && _j614) {
_j614.clear();
_j614.background(255);
}
if (typeof _j616 !== 'undefined' && _j616) {
_j616.begin();
clear();
_j616.end();
}
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j547 = false;
_j548 = false;
_j569 = 0;
force = 1.0;
_j549 = false;
_j550 = false;
_j541 = 0;
x = hw;
y = hh;
_j525 = 0;
_j526 = 0;
_j527 = 0;
initialSize = 0;
_j530 = 0;
_j571 = 0;
pathPoints = [];
_j575 = false;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j574 !== 'undefined') {
_j574 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j373 !== 'undefined') {
_j373 = null;
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
_j175();
_j172();
_j566 = true;
}
function _j170() {
_j111('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j171();
_j172();
_j174();
_j173();
_j111('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j171() {
oldBuffer.begin();
clear();
background(255);
oldBuffer.end();
newBufferBlack.begin();
clear();
background(255);
newBufferBlack.end();
_j612.clear();
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
_j614.clear();
_j614.background(255);
pingPongBuffer.begin();
clear();
background(255);
pingPongBuffer.end();
if (typeof _j619 !== 'undefined' && _j619) {
_j619.begin();
clear();
_j619.end();
}
_j616.begin();
clear();
_j616.end();
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j612.blendMode(BLEND);
_j614.blendMode(BLEND);
_j566 = true;
}
function _j172() {
if (!pingPongBuffer || !_j508) return;
if (_j508) {
pingPongBuffer.begin();
if (_j590) {
image(newBufferBlack, 0, 0, width, height);
resetShader();
pingPongBuffer.end();
return;
}
shader(_j508);
_j508.setUniform("rect", [0, 0, width * _j505, height * _j505]);
_j508.setUniform("tex0", newBufferBlack);
_j508.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j508.setUniform("forceMap", _j506);
_j508.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j508.setUniform("force", 1.0);
_j508.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j508.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j508.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j508.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j508.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j508.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
}
}
function _j173() {
_j547 = false;
_j548 = false;
_j569 = 0;
force = 1.0;
_j549 = false;
_j550 = false;
_j541 = 0;
x = hw;
y = hh;
_j525 = 0;
_j526 = 0;
_j527 = 0;
initialSize = 0;
_j530 = 0;
_j528 = 0;
_j515 = 0;
_j570 = 0;
_j571 = 0;
pathPoints = [];
_j575 = false;
startX = hw;
startY = hh;
_j437 = hw;
_j438 = hh;
_j529 = 0;
_j538 = 0;
_j536 = hw;
_j537 = hh;
_j535 = [];
flyBrushEnd = [];
_j532 = 0;
_j633 = hw;
_j634 = hh;
_j635 = hw;
_j636 = hh;
_j637 = false;
_j639 = 0;
_j640 = false;
}
function _j174() {
_j506.begin();
shader(_j507);
_j507.setUniform("randomSeed1", _j606[0] || 100);
_j507.setUniform("randomSeed2", _j606[1] || 200);
_j507.setUniform("randomSeed3", _j606[2] || 300);
_j507.setUniform("randomSeed4", _j606[3] || 400);
_j507.setUniform("scale1", _j607[0] || 0.002);
_j507.setUniform("scale2", _j607[1] || 0.005);
_j507.setUniform("scale3", _j607[2] || 0.015);
_j507.setUniform("amplitude1", _j608[0] || 0.6);
_j507.setUniform("amplitude2", _j608[1] || 0.4);
_j507.setUniform("amplitude3", _j608[2] || 0.3);
_j507.setUniform("phase1", _j609[0] || 0);
_j507.setUniform("phase2", _j609[1] || 0);
_j507.setUniform("phase3", _j609[2] || 0);
_j507.setUniform("vortexScale1", _j610[0] || 0.008);
_j507.setUniform("vortexScale2", _j610[1] || 0.012);
_j507.setUniform("clusterScale1", _j611[0] || 0.001);
_j507.setUniform("clusterScale2", _j611[1] || 0.0008);
_j507.setUniform("canvasCenter", [hw, hh]);
_j507.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j506.end();
}
function _j175() {
for (let i = 0; i < 4; i++) {
_j606[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j607[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j608[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j609[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j610[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j611[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j174();
}
function _j176(title = '') {}
function _j177() {
_j178();
}
function _j178() {
_j175();
const _j1416 = brushMode;
brushMode = 1;
initialSize = 20;
_j530 = initialSize;
_j524 = _j530;
_j528 = _j524;
_j547 = true;
_j548 = false;
_j569 = 0;
_j549 = true;
_j550 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j30(newBufferBlack, 1.0);
}
mouseReleased();
_j548 = true;
_j569 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j30(newBufferBlack, force);
}
_j39();
brushMode = _j1416;
_j169();
}
function _j179() {
if (_j672) {
_j111('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j672 = true;
_j673 = millis();
frameCount = 0;
_j674 = [];
_j176('🎬 Start Frame Recording');
}
function _j180() {
if (!_j672) {
_j111('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j672 = false;
const _j1417 = millis() - _j673;
_j176('🎬 Frame Recording Complete');
_j182();
}
function _j181() {
if (!_j672) return;
if (frameCount % _j675 !== 0) {
frameCount++;
return;
}
const _j1418 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1418}.png`;
saveCanvas(filename, 'png');
_j674.push({
frame: frameCount,
timestamp: millis() - _j673,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j111('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j674.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j182() {
if (_j674.length === 0) {
_j111('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j111('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j674.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j183(_j1534) {
return Math.round(_j1534 * 100) / 100;
}
function _j184(type, data = {}) {
if (window.testMode) return;
if (!_j621) return;
if (_j622 === 0) return;
const _j1419 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1420 = _j1419 + (millis() - _j622 - _j626);
const event = {
m: type,
t: Math.round(_j1420),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1421 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1422 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j111('recording', `${_j1421[type] || '📝'} Event recorded`, {
Type: _j1422[type] || type,
Time: `${_j1420.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j185() {
_j621 = true;
_j622 = 0;
_j624 = 0;
_j626 = 0;
_j627 = true;
_j515 = 0;
const _j1423 = seed;
const _j1424 = (typeof _j158 === 'function') ? _j158() : 0;
const _j1425 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1426 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1427 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1428 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1427[0] - rgb[0]) < 0.01 &&
Math.abs(_j1427[1] - rgb[1]) < 0.01 &&
Math.abs(_j1427[2] - rgb[2]) < 0.01) {
_j1428 = type;
break;
}
}
recordingData = {
version: "1.0",
engineVersion: (typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev',
startTime: _j622,
randomSeed: _j1423,
initialPathToggle: _j565,
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
shapeType: _j1424,
metallicStrength: _j1425,
metallicFlow: _j1426,
metallicTint: _j1427,
metallicTintType: _j1428
}
};
randomSeed(_j1423);
noiseSeed(_j1423);
_j176('🎬 Start Art Creation Recording');
if (typeof _j115 === 'function') {
_j115();
}
}
function _j186() {
if (!_j621) return;
_j621 = false;
randomSeed(seed);
noiseSeed(seed);
_j176('✨ Art Creation Recording Complete');
const _j1429 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j604 !== 'undefined' ? _j604.blendVol : 100,
distortShaderEnabled: typeof distortShaderEnabled !== 'undefined' ? distortShaderEnabled : false,
cellularEnabled: typeof cellularEnabled !== 'undefined' ? cellularEnabled : false,
rsEnabled: typeof rsEnabled !== 'undefined' ? rsEnabled : false,
whiteDotEnabled: typeof whiteDotEnabled !== 'undefined' ? whiteDotEnabled : false,
grainEnabled: typeof grainEnabled !== 'undefined' ? grainEnabled : false,
distortShowFbmMask: typeof distortShowFbmMask !== 'undefined' ? distortShowFbmMask : 0.0,
distortDisplacementB: typeof distortDisplacementB !== 'undefined' ? distortDisplacementB : 20,
distortDisplacementC: typeof distortDisplacementC !== 'undefined' ? distortDisplacementC : 100
};
recordingData.initialPanelToggles = {
showPaperTexture: typeof showPaperTexture !== 'undefined' ? showPaperTexture : false,
showGridOverlay: typeof showGridOverlay !== 'undefined' ? showGridOverlay : true,
showFuturePathPreview: typeof showFuturePathPreview !== 'undefined' ? showFuturePathPreview : false,
screenText: typeof screenText !== 'undefined' ? screenText : false,
doMoving: typeof doMoving !== 'undefined' ? doMoving : false,
loopToggle: typeof loopToggle !== 'undefined' ? loopToggle : 0
};
_j187();
setTimeout(() => {
_j121();
}, 300);
if (typeof _j115 === 'function') {
_j115();
}
}
function _j187() {
if (recordingData.events.length === 0) {
_j111('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1430 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1431 = JSON.stringify(_j1430, null, 2);
const _j1432 = new Blob([_j1431], {
type: 'application/json'
});
const _j1433 = URL.createObjectURL(_j1432);
const _j1434 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1434.download = `drawing-recording-${timestamp}.json`;
_j1434.href = _j1433;
_j1434.click();
URL.revokeObjectURL(_j1433);
_j111('art', '💾 Art recording saved', {
File: _j1434.download,
Size: `${(_j1431.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j115 === 'function') {
_j115();
}
}
function _j188() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1362 = event.target.files[0];
if (!_j1362) return;
const _j1191 = new FileReader();
_j1191.onload = (e) => {
try {
const loadedData = JSON.parse(e.target.result);
if (!loadedData.version || !loadedData.events) {
_j111('system', '❌ Invalid recording file format', {
Status: 'Error'
});
return;
}
if (typeof window !== 'undefined') {
window.loadedRecordingData = JSON.parse(JSON.stringify(loadedData));
window.loadedRecordingFileName = _j1362.name;
}
recordingData = loadedData;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j574 !== 'undefined') {
_j574 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof _j232 !== 'undefined') {
_j232 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j176('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1435 = _j194(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1435) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1362.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j618 !== 'undefined' && _j618) {
_j618.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j618.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j138 === 'function') {
_j138();
}
_j111('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
setTimeout(() => {
startPlayback();
}, 500);
} catch (error) {
_j111('system', '❌ Failed to load recording', {
Error: error.message,
Status: 'Error'
});
}
};
_j1191.readAsText(_j1362);
};
input.click();
}
function startPlayback() {
if (window._fxFastCapture && typeof $fx !== 'undefined' && typeof $fx.preview === 'function' && !window._fxPreviewTriggered) {
window._fxPreviewTriggered = true;
console.log('[fxhash] fast-capture: triggering $fx.preview() immediately (no GPU, 1s limit)');
$fx.preview();
return;
}
window.showStrokeDivider = true;
if (recordingData.events.length === 0) {
_j111('system', '⚠️ No recording data to play', {
Status: 'Error'
});
return;
}
if (_j629) {
_j111('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j1042 !== 'undefined') {
_j1042 = [];
}
if (typeof _j1043 !== 'undefined') {
_j1043 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1436 = window.location.search || '';
const _j1437 = (key) => _j1436.includes('_' + key + ':') || _j1436.includes('?' + key + ':');
const _j1438 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1439 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1440 = recordingData.initialPanelToggles;
for (const _j1441 of _j1438) {
const urlKey = _j1439[_j1441.jsonKey];
if (urlKey && _j1437(urlKey)) continue;
const value = _j1440 ? _j1440[_j1441.jsonKey] : undefined;
const _j1442 = value !== undefined ? value : _j1441.defaultVal;
_j1441.setter(_j1442);
const _j1443 = document.getElementById(_j1441.toggleId);
if (_j1443) {
_j1443.checked = _j1441.isNumeric ? (_j1442 === 1) : !!_j1442;
}
}
const _j1444 = recordingData.events.filter(e => e.m === 'mp').length;
const _j1445 = recordingData.events.filter(e => e.m === 'md').length;
if (window.skipClearCanvasOnNextPlayback) {
window.skipClearCanvasOnNextPlayback = false;
console.log('[append] ✅ skip clearCanvas, overlay playback', { mp: _j1444, md: _j1445, totalEvents: recordingData.events.length });
} else {
console.log('[startPlayback] ❌ standard mode, will clear canvas', { mp: _j1444, md: _j1445, totalEvents: recordingData.events.length });
_j169();
if (typeof clearMask === 'function') clearMask();
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j618 !== 'undefined' && _j618) {
_j618.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j618.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j566 !== 'undefined') {
_j566 = true;
}
if (typeof _j138 === 'function') {
_j138();
}
_j111('playback', '🎨 Background color restored', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
_j111('playback', 'Random seed reset', {
Seed: recordingData.randomSeed
});
} else {
_j111('system', '⚠️ No seed info in recording, playback may be inaccurate', {
Status: 'Warning'
});
}
_j629 = true;
_j630 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j631 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j648 !== 'undefined') {
_j648 = 0;
}
_j637 = false;
_j633 = hw;
_j634 = hh;
_j635 = hw;
_j636 = hh;
_j571 = 0;
if (typeof _j671 !== 'undefined') {
_j671 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j574 !== 'undefined') {
_j574 = null;
}
if (typeof _j575 !== 'undefined') {
_j575 = false;
}
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j232 !== 'undefined') {
_j232 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j666 !== 'undefined') {
_j666 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j667 !== 'undefined') {
_j667 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j515 = 0;
_j639 = 0;
_j640 = false;
if (recordingData.initialPathToggle !== undefined) {
_j565 = recordingData.initialPathToggle;
_j111('playback', 'Path toggle restored', {
Status: _j565 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1206 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j111('playback', 'Brush color restored', {
Mode: _j1206[brushColorMode] || 'Unknown'
});
} else if (recordingData.initialWhiteBrushMode !== undefined) {
whiteBrushMode = recordingData.initialWhiteBrushMode;
brushColorMode = whiteBrushMode ? 1 : 0;
_j111('playback', 'Brush color restored (legacy)', {
Mode: whiteBrushMode ? "White ⚪" : "Black ⚫"
});
} else {
whiteBrushMode = false;
brushColorMode = 0;
}
_j176('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j159 === 'function') {
_j159(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1381 = document.getElementById('metallic-strength');
const _j1382 = document.getElementById('metallic-strength-value');
if (_j1381 && _j1382) {
_j1381.value = ec.metallicStrength;
_j1382.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1383 = document.getElementById('metallic-flow');
const _j1384 = document.getElementById('metallic-flow-value');
if (_j1383 && _j1384) {
_j1383.value = ec.metallicFlow;
_j1384.textContent = ec.metallicFlow;
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
const _j1446 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1446);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
}
}
_j111('playback', '✨ Effect Control restored', {
ShapeType: ec.shapeType !== undefined ? ec.shapeType : 'Unknown',
Strength: ec.metallicStrength !== undefined ? ec.metallicStrength : 'Unknown',
Flow: ec.metallicFlow !== undefined ? ec.metallicFlow : 'Unknown',
Tint: ec.metallicTintType || 'Unknown'
});
}
const _j1447 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1448 = window.location.search || '';
const _j1449 = (key) => _j1448.includes('_' + key + ':') || _j1448.includes('?' + key + ':');
for (const _j1441 of _j1447) {
if (_j1449(_j1441.urlKey)) continue;
_j1441.setter(false);
const _j1443 = document.getElementById(_j1441.toggleId);
if (_j1443) {
_j1443.checked = false;
}
const _j1450 = document.getElementById(_j1441.slidersId);
if (_j1450) {
_j1450.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1451 = document.getElementById('distort-fbm-preview-toggle');
if (_j1451) _j1451.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1452 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1452)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j111('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j604 !== 'undefined') {
_j604.blendVol = fe.flowStrength;
const _j1453 = document.getElementById('flow-strength');
const _j1454 = document.getElementById('flow-strength-value');
if (_j1453) _j1453.value = fe.flowStrength;
if (_j1454) _j1454.textContent = fe.flowStrength;
}
for (const _j1441 of _j1447) {
const value = fe[_j1441.jsonKey];
if (value === undefined) continue;
if (_j1449(_j1441.urlKey)) {
_j111('playback', `⏭️ Flow Effect: ${_j1441.jsonKey} skipped (URL override)`, {});
continue;
}
_j1441.setter(!!value);
const _j1443 = document.getElementById(_j1441.toggleId);
if (_j1443) {
_j1443.checked = !!value;
}
const _j1450 = document.getElementById(_j1441.slidersId);
if (_j1450) {
_j1450.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1451 = document.getElementById('distort-fbm-preview-toggle');
if (_j1451) _j1451.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1455 = document.getElementById('distort-displacement-b');
const _j1456 = document.getElementById('distort-displacement-b-value');
if (_j1455) _j1455.value = fe.distortDisplacementB;
if (_j1456) _j1456.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1457 = document.getElementById('distort-displacement-c');
const _j1458 = document.getElementById('distort-displacement-c-value');
if (_j1457) _j1457.value = fe.distortDisplacementC;
if (_j1458) _j1458.textContent = fe.distortDisplacementC;
}
_j111('playback', '✨ Flow Effect restored', {
Strength: fe.flowStrength,
Distort: !!fe.distortShaderEnabled ? 'ON' : 'OFF',
Cellular: !!fe.cellularEnabled ? 'ON' : 'OFF',
RS: !!fe.rsEnabled ? 'ON' : 'OFF',
WhiteDot: !!fe.whiteDotEnabled ? 'ON' : 'OFF',
Grain: !!fe.grainEnabled ? 'ON' : 'OFF'
});
} else {
_j111('playback', '🔄 Flow Effect: reset to defaults (no initialFlowEffect in JSON)', {});
}
if (_j1440) {
_j111('playback', '✨ Panel toggles restored', {
Paper: _j1440.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1440.showGridOverlay ? 'ON' : 'OFF',
Path: _j1440.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1440.screenText ? 'ON' : 'OFF',
Camera: _j1440.doMoving ? 'ON' : 'OFF',
Loop: _j1440.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j111('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j175();
_j172();
const _j1459 = recordingData.events[0];
if (_j1459 && _j1459.strokeData) {
const strokeData = _j1459.strokeData;
_j530 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j530;
nowSize = size;
}
_j30(newBufferBlack, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j644 === 'undefined' || !_j644) {
_j644 = true;
}
_j645 = true;
if (_j644 && _j643 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j420 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j420 / 2));
_j643.setAutoUpdate(true);
if (typeof _j643.setPanScale === 'function') {
_j643.setPanScale(0);
}
if (typeof _j643.setZoomScale === 'function') {
_j643.setZoomScale(0);
}
_j643.setCenter([0, 0, 0], 0);
_j643.setDistance(easycamInitialDistance, 0);
if (typeof _j650 !== 'undefined') {
_j650 = 1;
}
_j111('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j645 = false;
_j644 = false;
}
if (typeof _j115 === 'function') {
_j115();
}
}
function _j189() {
if (!_j629) return;
_j629 = false;
_j637 = false;
_j631 = 0;
isWaitingToLoop = false;
_j639 = 0;
_j640 = false;
randomSeed(seed);
noiseSeed(seed);
_j176('⏹️ Playback Ended');
_j192();
_j645 = false;
if (_j644 && _j643 !== null) {
try {
const _j419 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j422 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j423 = _j643.getCenter();
const _j424 = _j643.getDistance();
_j111('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j423[0].toFixed(2)}, ${_j423[1].toFixed(2)}, ${_j423[2].toFixed(2)}], Distance: ${_j424.toFixed(2)}`,
Target: `Center: [${_j419[0].toFixed(2)}, ${_j419[1].toFixed(2)}, ${_j419[2].toFixed(2)}], Distance: ${_j422.toFixed(2)}`
});
_j656 = true;
_j657 = millis();
_j654 = [_j423[0], _j423[1], _j423[2]];
_j658 = _j424;
_j655 = _j419;
_j659 = _j422;
setTimeout(() => {
if (_j643 !== null) {
_j643.setAutoUpdate(false);
const _j431 = _j643.getCenter();
const _j432 = _j643.getDistance();
const _j425 = 0.1;
const _j426 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j431[0] - _j419[0], 2) +
Math.pow(_j431[1] - _j419[1], 2) +
Math.pow(_j431[2] - _j419[2], 2)
);
const distanceDiff = Math.abs(_j432 - _j422);
_j111('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j431[0].toFixed(2)}, ${_j431[1].toFixed(2)}, ${_j431[2].toFixed(2)}], Distance: ${_j432.toFixed(2)}`,
Target: `Center: [${_j419[0].toFixed(2)}, ${_j419[1].toFixed(2)}, ${_j419[2].toFixed(2)}], Distance: ${_j422.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j425 && distanceDiff <= _j426) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j425 || distanceDiff > _j426) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j431[0].toFixed(3)}, ${_j431[1].toFixed(3)}, ${_j431[2].toFixed(3)}]`,
distance: _j432.toFixed(3)
}
});
_j643.setCenter(_j419, 0);
_j643.setDistance(_j422, 0);
const _j1460 = _j643.getCenter();
const _j1461 = _j643.getDistance();
_j111('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1460[0].toFixed(2)}, ${_j1460[1].toFixed(2)}, ${_j1460[2].toFixed(2)}]`,
Distance: _j1461.toFixed(2)
});
}
_j656 = false;
}
_j644 = false;
}, 2100);
_j111('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j419,
Distance: _j422.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j644 = false;
}
} else {
_j644 = false;
}
if (typeof _j115 === 'function') {
_j115();
}
try {
window.dispatchEvent(new CustomEvent('inkfield:playbackEnded', {
detail: {
strokeCount: (recordingData && recordingData.events) ? recordingData.events.length : 0
}
}));
} catch (e) {}
}
window.startPlayback = startPlayback;
function _j190(event) {
const _j859 = event.m || event.type;
switch (_j859) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('playback_mousePressed_start', 'mousePressed');
const _j1462 = _j548;
const _j1463 = event.t !== undefined ? event.t : event.time;
if (_j548) {
const _j768 = _j630;
if (window._fxVirtualTime === undefined) {
_j630 = millis() - _j1463 / _j632;
}
const _j1464 = _j768 - _j630;
const _j767 = (typeof _j639 !== 'undefined' && _j639 > 0) ?
(millis() - _j639) :
0;
if (typeof _j640 !== 'undefined') {
_j640 = false;
}
if (typeof _j639 !== 'undefined') {
_j639 = 0;
}
_j39();
_j548 = false;
_j569 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1465 = _j1463 - playbackLastStrokeEndEventTime;
const _j1466 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1467 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j40();
if (typeof _j1042 !== 'undefined') {
_j1042 = [];
}
if (typeof _j1043 !== 'undefined') {
_j1043 = 0;
}
if (typeof _j648 !== 'undefined') {
_j648++;
if (typeof _j651 !== 'undefined' && typeof _j649 !== 'undefined') {
_j651 = random(0, 1) > 0.7;
_j649 = _j648;
}
}
_j633 = event.x + (typeof _j641 !== 'undefined' ? _j641 : 0);
_j634 = event.y + (typeof _j642 !== 'undefined' ? _j642 : 0);
_j635 = _j633;
_j636 = _j634;
if (false) {
_j637 = true;
} else {
_j637 = false;
}
if (typeof _j671 !== 'undefined') {
_j671 = true;
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
_j572 = sd.mouseCountStart;
} else {
_j572 = 0;
}
_j570 = 0;
const offsetX = typeof _j641 !== 'undefined' ? _j641 : 0;
const offsetY = typeof _j642 !== 'undefined' ? _j642 : 0;
const _j1468 = event.x + offsetX;
const _j1469 = event.y + offsetY;
_j111('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1468.toFixed(0)}, ${_j1469.toFixed(0)})`
});
_j111('system', '|--------------------------------', {});
} else {
_j111('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j570 = 0;
}
_j515 = 0;
_j541 = 0;
x = _j633;
y = _j634;
_j525 = 0;
_j526 = 0;
_j527 = 0;
_j538 = 0;
_j532 = 0;
_j571 = 0;
_j569 = 0;
_j548 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j1042 !== 'undefined') {
_j1042 = [];
}
if (typeof _j539 !== 'undefined') {
_j539 = _j633;
_j540 = _j634;
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
initialSize = sd.initialSize !== undefined ? sd.initialSize : (sd.baseBrushSize || 20);
spraySize = sd.spraySize !== undefined ? sd.spraySize : 10;
_j520 = sd.step !== undefined ? sd.step : 4;
_j577 = sd.step2 !== undefined ? sd.step2 : 2;
randStep = sd.randStep !== undefined ? sd.randStep : 0;
maxUpdates = sd.maxUpdates !== undefined ? sd.maxUpdates : 30;
pathRotation = sd.pathRotation !== undefined ? sd.pathRotation : 0;
_j522 = sd.spring !== undefined ? sd.spring : 0.6;
_j523 = sd.friction !== undefined ? sd.friction : 0.5;
baseBrushSize = sd.baseBrushSize || 1.0;
if (_j551) {
_j563 = baseBrushSize;
window._strokeStartBaseBrushSize = baseBrushSize;
}
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
_j516 = sd.whiteMaxOpacity;
} else {
_j516 = 0.95;
}
if (sd.hueShift !== undefined) {
_j517 = sd.hueShift;
} else {
_j517 = 0.0;
}
if (sd.satShift !== undefined) {
_j518 = sd.satShift;
} else {
_j518 = 0.0;
}
if (sd.briShift !== undefined) {
_j519 = sd.briShift;
} else {
_j519 = 0.0;
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
if (sd.maskData) {
_j558 = sd.maskData;
if (sd.maskData.action === 'rect') {
drawMaskRect(sd.maskData.x1, sd.maskData.y1, sd.maskData.x2, sd.maskData.y2);
} else if (sd.maskData.action === 'polygon') {
drawMaskPolygon(sd.maskData.points);
}
} else {
_j558 = null;
if (_j554) clearMask();
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j606[0] = fm.randomSeed1;
_j606[1] = fm.randomSeed2;
_j606[2] = fm.randomSeed3;
_j606[3] = fm.randomSeed4;
_j607[0] = fm.scale1;
_j607[1] = fm.scale2;
_j607[2] = fm.scale3;
_j608[0] = fm.amplitude1;
_j608[1] = fm.amplitude2;
_j608[2] = fm.amplitude3;
_j609[0] = fm.phase1;
_j609[1] = fm.phase2;
_j609[2] = fm.phase3;
_j610[0] = fm.vortexScale1;
_j610[1] = fm.vortexScale2;
_j611[0] = fm.clusterScale1;
_j611[1] = fm.clusterScale2;
_j174();
} else {
if (typeof _j175 === 'function') {
_j175();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j530 = initialSize;
_j524 = _j530;
_j528 = _j524;
_j541 = 0;
x = _j633;
y = _j634;
_j525 = 0;
_j526 = 0;
_j527 = 0;
_j538 = 0;
_j532 = 0;
_j547 = true;
_j548 = false;
_j569 = 0;
_j549 = true;
_j550 = false;
_j571 = 0;
startX = _j633;
startY = _j634;
pathPoints = [{
x: _j633,
y: _j634
}];
_j575 = true;
_j637 = true;
if (_j551) window._playbackPenPressure = -1;
_j30(newBufferBlack, 1.0);
crandomDebugger.checkpoint('playback_mousePressed_end', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j633 = event.x + (typeof _j641 !== 'undefined' ? _j641 : 0);
_j634 = event.y + (typeof _j642 !== 'undefined' ? _j642 : 0);
if (_j551 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j551) window._playbackPenPressure = -1;
const _j813 = crandom.getCount();
const _j1470 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1470;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('playback_mouseReleased', 'mouseReleased');
const _j1471 = crandom.getCount();
const _j818 = _j1471 - _j813;
const _j1472 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j850 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j859 = e.m || e.type;
return _j859 === 'mr' || _j859 === 'mouseReleased';
}).length :
'?';
const _j819 = window.drawLoopCount || 0;
const _j1473 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 playback [stroke ${_j1472}/${_j850}] | Draw: ${_j819} | Seed: ${_j1471}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1472);
crandomDebugger.compareStroke(_j1472);
_j633 = event.x + (typeof _j641 !== 'undefined' ? _j641 : 0);
_j634 = event.y + (typeof _j642 !== 'undefined' ? _j642 : 0);
_j637 = false;
if (!_j548) {
_j548 = true;
_j569 = 0;
if (typeof _j639 !== 'undefined') {
_j639 = millis();
}
if (typeof _j640 !== 'undefined') {
_j640 = true;
}
_j111('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j111('playback', 'Stroke reproduction complete', {
FinalSize: _j530.toFixed(2),
CountdownStatus: _j548 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j637) {
_j637 = true;
} else {
_j635 = _j633;
_j636 = _j634;
}
_j633 = event.x + (typeof _j641 !== 'undefined' ? _j641 : 0);
_j634 = event.y + (typeof _j642 !== 'undefined' ? _j642 : 0);
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
_j157();
_j111('playback', '⌨️ Simulate key: R', {
'Effect': 'Wet Ink'
});
} else if (k === 'p' || k === 'P') {} else if (k === 'o' || k === 'O') {
_j111('playback', '⌨️ Simulate key: O', {
'Loop toggle': 'Ignored during playback'
});
}
break;
case 'ec':
case 'effectControl':
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
const _j1474 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1475 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1391 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1391;
const _j804 = document.getElementById('bugs-size');
const _j805 = document.getElementById('bugs-size-value');
if (_j804 && _j805) {
_j804.value = _j1391;
_j805.textContent = _j1391;
}
}
const _j803 = {
action: action,
shapeType: _j1475,
bugsSize: _j1391,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1476 = null;
let _j1477 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j803);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1476 = window._scanGlobalPlaybackCount || 0;
_j1477 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1391;
}
const _j806 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1475);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1475);
}
}
if (_j806) {
randomSeed(_j806);
noiseSeed(_j806);
}
}
_j111('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1474,
ShapeType: _j1475 !== null ? _j1475 : 'Unknown',
BugsSize: _j1391,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1476,
CurrentCount: _j1477
});
} else if (action === 'scan-random') {
const _j1475 = event.shapeType !== undefined ? event.shapeType : null;
const _j1391 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1391;
const _j804 = document.getElementById('bugs-size');
const _j805 = document.getElementById('bugs-size-value');
if (_j804 && _j805) {
_j804.value = _j1391;
_j805.textContent = _j1391;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1475);
}
_j111('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1475 !== null ? _j1475 : 'Unknown',
BugsSize: _j1391
});
} else if (action === 'metallic-strength') {
const _j1382 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1382 / 100;
}
const _j1381 = document.getElementById('metallic-strength');
const _j1478 = document.getElementById('metallic-strength-value');
if (_j1381 && _j1478) {
_j1381.value = _j1382;
_j1478.textContent = _j1382;
}
_j111('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1382
});
} else if (action === 'bugs-size') {
const _j1391 = event.value !== undefined ? event.value : 10;
const _j804 = document.getElementById('bugs-size');
const _j805 = document.getElementById('bugs-size-value');
if (_j804 && _j805) {
_j804.value = _j1391;
window.bugsSize = _j1391;
_j805.textContent = _j1391;
_j111('system', '🐛 Bugs Size updated during playback', {
Value: _j1391
});
}
} else if (action === 'metallic-flow') {
const _j1384 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1384 / 100;
}
const _j1383 = document.getElementById('metallic-flow');
const _j1479 = document.getElementById('metallic-flow-value');
if (_j1383 && _j1479) {
_j1383.value = _j1384;
_j1479.textContent = _j1384;
}
_j111('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1384
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
const _j1446 = `metal-${tintType}`;
const btn = document.getElementById(_j1446);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
_j111('playback', '✨ Effect Control: Metal Tint', {
Tint: tintType,
RGB: `[${tintButtons[tintType].join(', ')}]`,
Applied: true
});
} else {
_j111('playback', '⚠️ Effect Control: Metal Tint (Unknown)', {
Tint: tintType,
Status: 'Unknown tint type, skipped'
});
}
}
break;
case 'flow':
if (event.action === 'start') {
if (typeof _j591 !== 'undefined' && _j591) {
if (typeof _j51 === 'function') {
_j51();
}
_j111('playback', '🌊 Flow Effect: previous effect forced to complete');
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
if (event.strength !== undefined && typeof _j604 !== 'undefined') {
_j604.blendVol = event.strength;
}
if (typeof _j605 !== 'undefined') {
_j605 = event.lastStrokeOnly || false;
}
if (typeof _j50 === 'function') {
_j50(event.blendType, event.flowSeed, true);
}
_j111('playback', '🌊 Flow Effect: Start (preview)', {
BlendType: event.blendType,
Seed: event.flowSeed,
Bounds: event.strokeBounds ? `[${event.strokeBounds.minX.toFixed(2)}, ${event.strokeBounds.minY.toFixed(2)}, ${event.strokeBounds.maxX.toFixed(2)}, ${event.strokeBounds.maxY.toFixed(2)}]` : 'None'
});
} else if (event.action === 'end') {
const _j1480 = window.pendingFlowEvent;
if (_j1480) {
if (typeof _j600 !== 'undefined') {
_j600 = event.totalFrames || (event.iterations * 3) || 30;
_j601 = event.iterations || 10;
}
_j111('playback', '🌊 Flow Effect: End (target set, wait for preview)', {
BlendType: _j1480.blendType,
TargetFrames: event.totalFrames,
TargetIterations: event.iterations
});
}
window.pendingFlowEvent = null;
}
break;
case 'mask':
if (event.action === 'rect') {
drawMaskRect(event.x1, event.y1, event.x2, event.y2);
_j111('playback', '🎭 Mask rect applied', {
Region: `(${event.x1.toFixed(0)},${event.y1.toFixed(0)})→(${event.x2.toFixed(0)},${event.y2.toFixed(0)})`
});
} else if (event.action === 'polygon') {
drawMaskPolygon(event.points);
_j111('playback', '🎭 Mask polygon applied', {
Points: event.points.length
});
} else if (event.action === 'clear') {
clearMask();
_j111('playback', '🎭 Mask cleared');
}
break;
}
}
function updatePlayback() {
if (!_j629) return;
const _j1481 = 200;
if (typeof window !== 'undefined') {
const _j1482 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1483 = millis() - window.lastEffectControlProcessTime;
if (_j1483 < _j1481) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1482 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1484 = millis() - _j638;
const _j1485 = Math.floor(_j1484 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1485) {}
if (_j1484 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ Countdown finished, preparing replay');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j111('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j644 && _j643 !== null) {
const _j419 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j422 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j643.setCenter(_j419, 0);
_j643.setDistance(_j422, 0);
_j656 = false;
_j111('system', '🎥 Camera reset for loop', {
Center: `[${_j419[0].toFixed(2)}, ${_j419[1].toFixed(2)}, ${_j419[2].toFixed(2)}]`,
Distance: _j422.toFixed(2)
});
}
_j169();
if (typeof _j1042 !== 'undefined') {
_j1042 = [];
}
if (typeof _j1043 !== 'undefined') {
_j1043 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j630 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j631 = 0;
_j637 = false;
_j633 = hw;
_j634 = hh;
_j635 = hw;
_j636 = hh;
isWaitingToLoop = false;
_j571 = 0;
_j515 = 0;
_j639 = 0;
_j640 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j574 !== 'undefined') {
_j574 = null;
}
if (typeof _j575 !== 'undefined') {
_j575 = false;
}
if (typeof _j666 !== 'undefined') {
_j666 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j667 !== 'undefined') {
_j667 = {
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
_j111('playback', '🔁 Loop restart', {
Status: 'New round playback'
});
} else {
_j111('playback', '⏹️ Playback ended', {
Status: 'Single playback complete, no more loops'
});
_j189();
}
}
return;
}
if (_j631 >= recordingData.events.length && !isWaitingToLoop) {
if (_j637) {
_j637 = false;
if (!_j548) {
_j548 = true;
_j569 = 0;
_j566 = true;
}
}
if (_j548) {
if (_j569 < maxUpdates) {
return;
}
}
if (_j547) {
return;
}
console.log('🔍 Playback end check:', {
loopToggle: loopToggle,
loopToggleType: typeof loopToggle,
loopWaitDuration: loopWaitDuration,
loopWaitDurationType: typeof loopWaitDuration,
isWaitingToLoop: isWaitingToLoop
});
if (window._fxDebug) {
window._fxDebug.playbackEndFrame = window._fxDebug.totalFrames;
window._fxDebug.playbackEndVirtualTime = window._fxVirtualTime || 0;
window._fxDebug.playbackEndRealTime = performance.now() - window._fxDebug.startTime;
window._fxDebug.eventsProcessed = _j631;
window._fxDebug.totalEvents = recordingData ? recordingData.events.length : 0;
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
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function' && !window._fxPreviewTriggered) {
window._fxPreviewTriggered = true;
function _j191() {
console.log('[fxhash] Forcing final composite + capture...');
_j566 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j644 && _j643 !== null) {
_j656 = true;
_j657 = millis();
_j654 = [_j643.getCenter()[0], _j643.getCenter()[1], _j643.getCenter()[2]];
_j658 = _j643.getDistance();
_j655 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j659 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1486 = _j660 + 500;
console.log('[fxhash] Waiting ' + _j1486 + 'ms for camera reset before capture...');
setTimeout(_j191, _j1486);
} else {
_j191();
}
}
_j111('playback', 'Playback complete', {
Status: 'Waiting 30 seconds before loop'
});
if (window.DEBUG_MODE) console.log('✅ Starting countdown:', {
loopWaitDuration: loopWaitDuration,
startTime: millis()
});
isWaitingToLoop = true;
_j638 = millis();
} else {
_j111('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle is not 1, stopping playback');
_j189();
}
return;
}
var _j773;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j773 = window._fxVirtualTime * _j632;
} else {
_j773 = (millis() - _j630) * _j632;
}
let _j1487 = 0;
const _j1488 = 100;
let _j1489 = 0;
const _j1490 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1491 = false;
while (_j631 < recordingData.events.length && _j1487 < _j1488) {
if (typeof _j591 !== 'undefined' && _j591 &&
typeof _j600 !== 'undefined' && _j600 > 0) {
break;
}
const event = recordingData.events[_j631];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j859 = event.m || event.type;
const _j1492 = _j859 === 'mp' || _j859 === 'mousePressed';
const _j1493 = _j859 === 'mr' || _j859 === 'mouseReleased';
const _j1494 = _j859 === 'ec' || _j859 === 'effectControl';
const _j1495 = _j859 === 'flow';
const _j1496 = _j859 === 'mask';
const _j774 = eventTime - _j773;
if (!_j1494 && !_j1495 && !_j1496 && eventTime > _j773 && _j631 + 1 < recordingData.events.length) {
const _j769 = recordingData.events[_j631 + 1];
const _j770 = _j769.m || _j769.type;
const _j771 = _j770 === 'mp' || _j770 === 'mousePressed';
if (_j771) {
if (_j1493) {
if (_j1491) {
break;
}
_j190(event);
_j631++;
_j1487++;
continue;
} else {
_j631++;
continue;
}
}
}
if (eventTime <= _j773) {
const _j1497 = _j859 === 'md' || _j859 === 'mouseDragged';
if (_j1497 && _j1489 >= _j1490) {
break;
}
if (_j1493 && _j1491) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1494 || _j1496 || !_j548 || (_j548 && _j637)) {
if (_j1494) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j190(event);
_j631++;
_j1487++;
if (_j1497) {
_j1489++;
_j1491 = true;
}
} else {
break;
}
} else {
const _j1497 = _j859 === 'md' || _j859 === 'mouseDragged';
if (_j1497 && _j1489 >= _j1490) {
break;
}
if (_j1493 && _j1491) {
break;
}
if (_j1494 || _j1495 || _j1496 || (_j1492 && !_j548) || _j774 < 100) {
if (_j1494) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j190(event);
_j631++;
_j1487++;
if (_j1497) {
_j1489++;
_j1491 = true;
}
} else {
break;
}
}
if (_j1489 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j192() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1498 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1498) {
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
const _j1499 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1500 = confirm(
`Playback complete.\n\n` +
`Events played: ${loadedData.events.length}\n` +
`File: ${_j1499}\n\n` +
`Continue recording and append new strokes?\n\n` +
`OK — continue recording\n` +
`Cancel — stop`
);
if (_j1500) {
_j193(loadedData, _j1499);
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
function _j193(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j111('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j185();
return;
}
const _j1501 = loadedData.events[loadedData.events.length - 1];
const _j1429 = _j1501.t !== undefined ? _j1501.t : (_j1501.time !== undefined ? _j1501.time : 0);
_j621 = true;
_j622 = millis();
_j624 = 0;
_j626 = 0;
_j627 = true;
_j515 = 0;
recordingData = {
...loadedData,
engineVersion: loadedData.engineVersion || (
(typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev'
),
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1429,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1423 = seed;
randomSeed(_j1423);
noiseSeed(_j1423);
_j176('🔄 Continue Recording from Loaded File');
_j111('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1429}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j115 === 'function') {
_j115();
}
}
function _j194(_j1535, _j1536) {
if (!_j1535 || !_j1536) {
_j111('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1535 && height === _j1536) {
_j111('system', '✅ Canvas size matches recording', {
Width: `${_j1535}px`,
Height: `${_j1536}px`
});
return false;
}
_j111('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1535}x${_j1536}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1535.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1536.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j111('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1535}x${_j1536}`
});
window.location.reload();
return true;
}
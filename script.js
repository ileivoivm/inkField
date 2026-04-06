function _j1(_j1473, _j1474) {
var _j188 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1473];
var _j189 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1474];
if (_j188 && _j189 && typeof createShader === 'function') {
return createShader(_j188, _j189);
}
return window['loadShader'](_j1473, _j1474);
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
const _j190 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j190,
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
const _j191 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j191.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j191.forEach((_j621, _j299) => {
console.log(`[${_j621.count}] args: [${_j621.args.join(', ')}]`);
if (_j621.caller) {
console.log(`    位置: ${_j621.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j192 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j192 > 0 ? '+' : ''}${_j192}`);
console.log('═══════════════════════════════════════');
return _j192;
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
const _j193 = playback.totalCount - recording.totalCount;
const percent = ((_j193 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j193) < 50 ? '✅' : Math.abs(_j193) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j193 > 0 ? '+' : ''}${_j193} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j194 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j195 = Array.from(_j194).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j196 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j196 === -1) return 0;
if (indexA === -1) return 1;
if (_j196 === -1) return -1;
return indexA - _j196;
});
let _j197 = 0;
const _j198 = [];
for (const stage of _j195) {
const recCount = recDeltas.get(stage) || 0;
const _j199 = playDeltas.get(stage) || 0;
const _j192 = _j199 - recCount;
_j197 += _j192;
if (Math.abs(_j192) > 0) {
_j198.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j199,
difference: _j192
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j198.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j200 = _j198.filter(d => Math.abs(d.difference) > 50);
if (_j200.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j200.length); i++) {
const d = _j200[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j201 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j202 = checkpoints[i];
const _j203 = checkpoints[i + 1];
if (_j203) {
const _j204 = `${_j202.name} → ${_j203.name}`;
const _j205 = _j203.count - _j202.count;
_j201.set(_j204, _j205);
}
}
return _j201;
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
const _j206 = [{
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
const _j207 = {};
_j206.forEach(color => {
_j207[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j207;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j208 = r > 20;
const _j209 = g > 20;
const _j210 = b > 20;
if (_j208 && _j209 && _j210) return 'rgb';
if (_j208 && _j209) return 'rg';
if (_j208 && _j210) return 'rb';
if (_j209 && _j210) return 'gb';
if (_j208) return 'r';
if (_j209) return 'g';
if (_j210) return 'b';
return 'rgb';
}
function _j4() {
let _j211 = '// ============================================\n';
_j211 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j211 += '// ============================================\n';
_j206.forEach(color => {
const [r, g, b] = color.rgb;
const _j212 = `COLOR_${color.name.toUpperCase()}`;
_j211 += `const vec3 ${_j212} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j211 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j211;
}
function _j5() {
let _j211 = '';
_j206.forEach((color, _j299) => {
const _j212 = `COLOR_${color.name.toUpperCase()}`;
if (_j299 === 0) {
_j211 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j211 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j211 += `        brushColor = ${_j212};\n`;
});
_j211 += `    }\n`;
return _j211;
}
function _j6() {
return _j206.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j206.find(c => c.id === id);
}
function _j8(name) {
return _j206.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j206,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j213 = null;
let _j214 = 0;
const _j215 = 2000;
function _j9(_j511 = 120, _j1475 = 12, _j1476 = 10, _j1477 = 5) {
const _j216 = Math.min(width, _j215);
const _j217 = Math.min(height, _j215);
const _j218 = (width > _j215 || height > _j215);
randomSeed(seed);
const _j219 = _j10(_j511, _j1477);
const _j220 = createGraphics(_j216, _j217, P2D);
const _j221 = createGraphics(_j216, _j217, P2D);
for (let i = -_j511; i < _j216 + _j511; i += _j216 / 500) {
for (let j = -_j511; j < _j217 + _j511; j += _j1475) {
_j220.image(_j219, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1476);
}
}
_j219.remove();
if (doSpotNoise) {
padfactor = 300;
_j221.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j216)
y = random(_j217)
_j221.push()
_j221.strokeWeight(random(1, 2))
_j221.stroke(0, random(10, 250))
_j221.noFill();
_j221.bezier(
random(-padfactor, _j216 + padfactor),
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j216 + padfactor),
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j216 + padfactor),
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j216 + padfactor),
random(-padfactor, _j217 + padfactor)
);
_j221.pop();
}
_j220.blendMode(DIFFERENCE);
_j220.image(_j221, 0, 0, _j216, _j217);
_j221.remove();
}
if (_j218) {
const _j222 = createGraphics(width, height);
_j222.image(_j220, 0, 0, width, height);
_j220.remove();
return _j222;
}
return _j220;
}
function _j10(_j1478 = 64, _j1477 = 0.5) {
const _j219 = createGraphics(_j1478, _j1478);
_j219.pixelDensity(1);
_j219.noSmooth();
_j219.clear();
_j219.noFill();
_j219.translate(_j1478 / 2, _j1478 / 2);
_j219.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j223 = 0.5 + crandom.random(0, 1) * 0.5;
const _j224 = pow(_j223, _j1477) * 255;
_j219.stroke(_j224, _j224, _j224, 255);
const radius = crandom.random() * _j1478 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j219.point(x, y);
}
_j219.resetMatrix();
return _j219;
}
let _j225 = [];
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
const _j226 = 8;
const _j227 = [];
for (let i = 0; i < _j226; i++) {
_j227.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j228 = floor(_j227[0].numCirclesRand);
for (let i = 0; i < _j228; i++) {
const _j229 = _j227[i];
circles.push({
x: cos(_j229.angle) * _j229.distance,
y: sin(_j229.angle) * _j229.distance,
radius: _j229.circleSize
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
const _j230 = [];
const _j231 = 3;
const _j232 = 48;
const _j227 = [];
const _j233 = crandom.random(1, 4);
const _j234 = crandom.random(0.4, 0.6);
const _j235 = floor(_j233);
for (let _j236 = 0; _j236 < _j231; _j236++) {
const _j237 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j236 * 500
};
_j227.push(_j237);
}
for (let _j236 = 0; _j236 < _j235; _j236++) {
const _j237 = _j227[_j236];
const offsetX = _j237.offsetX;
const offsetY = _j237.offsetY;
const layerRotation = _j237.layerRotation;
const sizeVariation = _j237.sizeVariation;
const _j238 = size * sizeVariation;
const _j239 = floor(_j237.numVerticesRand);
const noiseOffset = _j237.noiseOffset;
const _j240 = [];
for (let i = 0; i < _j239; i++) {
const angle = (i / _j239) * TWO_PI;
const _j241 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j242 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j243 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j244 = _j241 * 0.5 + _j242 * 0.3 + _j243 * 0.2;
const radius = _j238 * (0.4 + _j244 * _j234);
const _j245 = cos(angle) * radius;
const _j246 = sin(angle) * radius;
_j240.push({
x: _j245,
y: _j246
});
}
const _j247 = [];
for (let i = 0; i < _j240.length; i++) {
const _j248 = _j240[(i - 1 + _j240.length) % _j240.length];
const _j249 = _j240[i];
const _j203 = _j240[(i + 1) % _j240.length];
_j247.push({
x: (_j248.x + _j249.x * 2 + _j203.x) / 4,
y: (_j248.y + _j249.y * 2 + _j203.y) / 4
});
}
for (let v of _j247) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j250 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j230.push({
x: rotatedX + offsetX,
y: _j250 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j230
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j230 = [];
const _j231 = 3;
const _j227 = [];
const _j233 = crandom.random(1, 4);
const _j234 = crandom.random(0.15, 0.35);
const _j235 = floor(_j233);
let rotation = crandom.random(TWO_PI);
for (let _j236 = 0; _j236 < _j231; _j236++) {
const _j237 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j236 * 500
};
_j227.push(_j237);
}
for (let _j236 = 0; _j236 < _j235; _j236++) {
const _j237 = _j227[_j236];
const offsetX = _j237.offsetX;
const offsetY = _j237.offsetY;
const layerRotation = rotation + _j237.layerRotationOffset;
const sizeVariation = _j237.sizeVariation;
const _j238 = size * sizeVariation;
const lengthRatio = _j237.lengthRatio;
const _j251 = _j238 * lengthRatio;
const stripWidth = _j238 * _j237.stripWidth;
const _j239 = floor(_j237.numVerticesRand);
const noiseOffset = _j237.noiseOffset;
const _j240 = [];
for (let i = 0; i < _j239; i++) {
let _j245, _j246;
if (i < _j239 / 2) {
const _j252 = (i / (_j239 / 2));
_j245 = (_j252 - 0.5) * _j251;
const _j253 = noise(_j252 * 1.5 + noiseOffset, _j236 * 50);
_j246 = -stripWidth / 2 + (_j253 - 0.5) * stripWidth * _j234;
} else {
const _j252 = ((_j239 - 1 - i) / (_j239 / 2));
_j245 = (_j252 - 0.5) * _j251;
const _j253 = noise(_j252 * 1.5 + noiseOffset, 100 + _j236 * 50);
_j246 = stripWidth / 2 + (_j253 - 0.5) * stripWidth * _j234;
}
_j240.push({
x: _j245,
y: _j246
});
}
const _j247 = [];
for (let i = 0; i < _j240.length; i++) {
const _j248 = _j240[(i - 1 + _j240.length) % _j240.length];
const _j249 = _j240[i];
const _j203 = _j240[(i + 1) % _j240.length];
_j247.push({
x: (_j248.x + _j249.x * 2 + _j203.x) / 4,
y: (_j248.y + _j249.y * 2 + _j203.y) / 4
});
}
for (let v of _j247) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j250 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j230.push({
x: rotatedX + offsetX,
y: _j250 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j230
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j230 = [];
const _j254 = 2;
const _j255 = 30;
const _j256 = 8;
const _j257 = 300;
const _j227 = [];
const _j258 = crandom.random(1, 3);
const _j259 = floor(_j258);
for (let _j260 = 0; _j260 < _j254; _j260++) {
const _j261 = {
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
for (let step = 0; step < _j255; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j261.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j257; i++) {
_j261.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j227.push(_j261);
}
for (let _j260 = 0; _j260 < _j259; _j260++) {
const _j261 = _j227[_j260];
let branchAngle = _j261.branchAngle;
let branchOffsetX = _j261.branchOffsetX;
let branchOffsetY = _j261.branchOffsetY;
let _j262 = _j261.numLRand > 0.2 ? 1 : 2;
let _j263 = floor(_j261.numStepsRand) * _j262;
let stepSize = _j261.stepSize;
let noiseScale = _j261.noiseScale;
let noiseStrength = _j261.noiseStrength;
let thickness = _j261.thickness;
let pathPoints = [];
let _j264 = branchOffsetX;
let _j265 = branchOffsetY;
let _j266 = branchAngle;
pathPoints.push({
x: _j264,
y: _j265
});
for (let step = 0; step < _j263; step++) {
const stepRandoms = _j261.stepRandoms[step];
const t = step / _j263;
const _j267 = noise(step * noiseScale, seed * 0.01);
const _j268 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j267 - 0.5) * PI * noiseStrength;
_j266 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j269 = stepSize * stepVariation;
_j264 += cos(_j266) * _j269;
_j265 += sin(_j266) * _j269;
pathPoints.push({
x: _j264,
y: _j265
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j263 - 3) {
const _j270 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j266 + stepRandoms.subBranchAngle;
let _j271 = _j264;
let _j272 = _j265;
for (let _j273 = 0; _j273 < _j270; _j273++) {
const _j274 = noise(step * noiseScale + _j273 * 0.5, seed * 0.01 + 200);
const _j275 = (_j274 - 0.5) * PI * 0.5;
const _j276 = subBranchAngle + _j275;
_j271 += cos(_j276) * stepSize * 0.6;
_j272 += sin(_j276) * stepSize * 0.6;
pathPoints.push({
x: _j271,
y: _j272
});
}
}
}
const _j277 = [];
const _j278 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j279;
if (i === 0) {
const _j203 = pathPoints[i + 1];
_j279 = atan2(_j203.y - point.y, _j203.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j248 = pathPoints[i - 1];
_j279 = atan2(point.y - _j248.y, point.x - _j248.x) + HALF_PI;
} else {
const _j248 = pathPoints[i - 1];
const _j203 = pathPoints[i + 1];
const _j280 = atan2(point.y - _j248.y, point.x - _j248.x);
const _j281 = atan2(_j203.y - point.y, _j203.x - point.x);
_j279 = ((_j280 + _j281) / 2) + HALF_PI;
}
const _j282 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j283 = _j261.thicknessRandoms[Math.min(i, _j261.thicknessRandoms.length - 1)];
const _j284 = thickness * _j282 * _j283;
_j277.push({
x: point.x + cos(_j279) * _j284 / 2,
y: point.y + sin(_j279) * _j284 / 2
});
_j278.push({
x: point.x - cos(_j279) * _j284 / 2,
y: point.y - sin(_j279) * _j284 / 2
});
}
for (let v of _j277) {
_j230.push(v);
}
for (let i = _j278.length - 1; i >= 0; i--) {
_j230.push(_j278[i]);
}
}
return {
type: 'lightning',
vertices: _j230
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j230 = [];
const _j254 = 3;
const _j255 = 75;
const _j256 = 8;
const _j257 = 800;
const _j227 = [];
const _j258 = crandom.random(1, 4);
const _j259 = floor(_j258);
size = size * 3;
for (let _j260 = 0; _j260 < _j254; _j260++) {
const _j261 = {
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
for (let step = 0; step < _j255; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j261.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j257; i++) {
_j261.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j227.push(_j261);
}
for (let _j260 = 0; _j260 < _j259; _j260++) {
const _j261 = _j227[_j260];
let branchAngle = _j261.branchAngle;
let branchOffsetX = _j261.branchOffsetX;
let branchOffsetY = _j261.branchOffsetY;
let _j262 = _j261.numLRand > 0.2 ? 1 : 5;
let _j263 = floor(_j261.numStepsRand) * _j262;
let stepSize = _j261.stepSize;
let noiseScale = _j261.noiseScale;
let noiseStrength = _j261.noiseStrength;
let thickness = _j261.thickness;
let pathPoints = [];
let _j264 = branchOffsetX;
let _j265 = branchOffsetY;
let _j266 = branchAngle;
pathPoints.push({
x: _j264,
y: _j265
});
for (let step = 0; step < _j263; step++) {
const stepRandoms = _j261.stepRandoms[step];
const t = step / _j263;
const _j267 = noise(step * noiseScale, seed * 0.01);
const _j268 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j267 - 0.5) * PI * noiseStrength;
_j266 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j269 = stepSize * stepVariation;
_j264 += cos(_j266) * _j269;
_j265 += sin(_j266) * _j269;
pathPoints.push({
x: _j264,
y: _j265
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j263 - 3) {
const _j270 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j266 + stepRandoms.subBranchAngle;
let _j271 = _j264;
let _j272 = _j265;
for (let _j273 = 0; _j273 < _j270; _j273++) {
const _j274 = noise(step * noiseScale + _j273 * 0.5, seed * 0.01 + 200);
const _j275 = (_j274 - 0.5) * PI * 0.5;
const _j276 = subBranchAngle + _j275;
_j271 += cos(_j276) * stepSize * 0.6;
_j272 += sin(_j276) * stepSize * 0.6;
pathPoints.push({
x: _j271,
y: _j272
});
}
}
}
const _j277 = [];
const _j278 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j279;
if (i === 0) {
const _j203 = pathPoints[i + 1];
_j279 = atan2(_j203.y - point.y, _j203.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j248 = pathPoints[i - 1];
_j279 = atan2(point.y - _j248.y, point.x - _j248.x) + HALF_PI;
} else {
const _j248 = pathPoints[i - 1];
const _j203 = pathPoints[i + 1];
const _j280 = atan2(point.y - _j248.y, point.x - _j248.x);
const _j281 = atan2(_j203.y - point.y, _j203.x - point.x);
_j279 = ((_j280 + _j281) / 2) + HALF_PI;
}
const _j282 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j283 = _j261.thicknessRandoms[Math.min(i, _j261.thicknessRandoms.length - 1)];
const _j284 = thickness * _j282 * _j283;
_j277.push({
x: point.x + cos(_j279) * _j284 / 2,
y: point.y + sin(_j279) * _j284 / 2
});
_j278.push({
x: point.x - cos(_j279) * _j284 / 2,
y: point.y - sin(_j279) * _j284 / 2
});
}
for (let v of _j277) {
_j230.push(v);
}
for (let i = _j278.length - 1; i >= 0; i--) {
_j230.push(_j278[i]);
}
}
return {
type: 'lightning',
vertices: _j230
};
}
function _j17(_j1479, shapeData, px, py, r, g, b, alpha) {
_j1479.fill(r, g, b, alpha);
_j1479.noStroke();
const scale = 1 / _j492;
switch (shapeData.type) {
case 'polygon':
case 'blob':
case 'jagged':
case 'strip':
case 'lightning':
_j1479.beginShape();
for (let v of shapeData.vertices) {
_j1479.vertex(px + v.x * scale, py + v.y * scale);
}
_j1479.endShape(CLOSE);
break;
case 'cluster':
for (let circle of shapeData.circles) {
_j1479.ellipse(
px + circle.x * scale,
py + circle.y * scale,
circle.radius * 2 * scale,
circle.radius * 2 * scale
);
}
break;
}
}
function _j18(_j1480 = null, scanBounds = null, shapeType = null, _j1481 = null) {
let _j285 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j285 = crandom.getCount();
}
const w = _j1480 ? _j1480.width : width;
const h = _j1480 ? _j1480.height : height;
const d = _j1480 ? _j1480.pixelDensity() : pixelDensity();
const _j286 = 20;
const _j287 = 700;
const _j288 = 80;
let _j289 = canvasBackgroundColor[0];
let _j290 = canvasBackgroundColor[1];
let _j291 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j292 = _j1481 && _j1481.length > 0;
if (_j292) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1481.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j293 = _j1480 || window;
_j293.loadPixels();
pixels = _j1480 ? _j1480.pixels : window.pixels;
let _j294 = [];
const step = 4;
let _j295 = _j286;
let _j296 = w - _j286;
let _j297 = _j286;
let _j298 = h - _j286;
for (let y = _j297; y < _j298; y += step) {
for (let x = _j295; x < _j296; x += step) {
let _j299 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j299];
let g = pixels[_j299 + 1];
let b = pixels[_j299 + 2];
let a = pixels[_j299 + 3];
let brightness = r + g + b;
let _j300 = Math.abs(r - _j289) + Math.abs(g - _j290) + Math.abs(b - _j291);
if (a > 100 && brightness < _j287 && _j300 > _j288) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j294.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j294.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j294.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j294.sort((a, b) => a.brightness - b.brightness);
if (_j294.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j294.length} 個），無法生成蟲咬效果`);
return;
}
let _j301 = [];
for (let i = 0; i < _j294.length; i++) {
_j301.push(i);
}
const _j302 = Math.floor(_j294.length * 0.5);
const _j303 = _j301.slice(0, Math.max(_j302, 10));
for (let i = 0; i < 10 && _j303.length > 0; i++) {
const _j304 = [];
let _j305 = 0;
for (let j = 0; j < _j303.length; j++) {
const _j306 = Math.pow(1 - (j / _j303.length), 2);
_j304.push(_j306);
_j305 += _j306;
}
let _j307 = crandom.random(0, _j305);
let _j308 = 0;
let _j309 = 0;
for (let j = 0; j < _j304.length; j++) {
_j309 += _j304[j];
if (_j307 <= _j309) {
_j308 = j;
break;
}
}
const _j310 = _j303.splice(_j308, 1)[0];
targetPoints.push(_j294[_j310]);
}
if (typeof _j614 !== 'undefined' && _j614 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j311 = [];
const _j312 = 30;
const _j313 = 4;
let _j314 = 0;
const _j315 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j316 = [];
const _j227 = [];
const _j317 = [];
for (let _j318 = 0; _j318 < numBites; _j318++) {
const _j319 = [];
for (let _j320 = 0; _j320 < _j315; _j320++) {
_j319.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j227.push(_j319);
_j317.push({
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
let _j321 = 0;
let _j322 = false;
let _j323, _j324, distance;
const _j319 = _j227[i];
const _j325 = _j317[i];
if (_j292) {
const _j229 = _j319[0];
let r = sqrt(_j229.r) * _j312;
let angle = _j229.angle + _j229.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j323 = Math.floor(target.x + offsetX);
_j324 = Math.floor(target.y + offsetY);
_j323 = constrain(_j323, _j286, w - _j286);
_j324 = constrain(_j324, _j286, h - _j286);
_j322 = true;
for (let _j326 of _j316) {
let dist = Math.sqrt(
Math.pow(_j323 - _j326.x, 2) +
Math.pow(_j324 - _j326.y, 2)
);
if (dist < _j313) {
_j322 = false;
break;
}
}
} else {
while (!_j322 && _j321 < _j315) {
const _j229 = _j319[_j321];
let r = sqrt(_j229.r) * _j312;
let angle = _j229.angle;
angle += _j229.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j323 = Math.floor(target.x + offsetX);
_j324 = Math.floor(target.y + offsetY);
_j323 = constrain(_j323, _j286, w - _j286);
_j324 = constrain(_j324, _j286, h - _j286);
let _j310 = 4 * ((_j324 * d) * (w * d) + (_j323 * d));
let _j327 = pixels[_j310];
let _j328 = pixels[_j310 + 1];
let _j329 = pixels[_j310 + 2];
let _j330 = pixels[_j310 + 3];
let _j331 = _j327 + _j328 + _j329;
let _j332 = Math.abs(_j327 - _j289) + Math.abs(_j328 - _j290) + Math.abs(_j329 - _j291);
if (_j330 <= 100 || _j331 >= _j287 || _j332 <= _j288) {
_j322 = false;
_j321++;
if (_j321 >= _j315) {
_j314++;
}
continue;
}
_j322 = true;
for (let _j326 of _j316) {
let dist = Math.sqrt(
Math.pow(_j323 - _j326.x, 2) +
Math.pow(_j324 - _j326.y, 2)
);
if (dist < _j313) {
_j322 = false;
break;
}
}
_j321++;
}
}
let _j333 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j333 *= 1.3;
}
let _j334 = floor(target.x * 1000 + target.y * 333 + _j325.shapeSeedRand);
let _j335 = 0;
let _j336 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j335 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j333, _j334, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j336 = crandom.getCount();
if (!_j325.shapeRandomCount) {
_j325.shapeRandomCount = _j336 - _j335;
}
}
if (_j322) {
let r, g, b;
let _j337 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j337[0] < 0.2 && _j337[1] < 0.15 && _j337[2] < 0.1) {
r = Math.floor(38 + _j325.colorRand1 * (51 - 38));
g = Math.floor(31 + _j325.colorRand2 * (38 - 31));
b = Math.floor(20 + _j325.colorRand3 * (26 - 20));
} else {
r = 230 + _j325.colorRand1 * (255 - 230);
g = 160 + _j325.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j323,
y: _j324,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j333,
shapeData: shapeData
};
_j316.push(point);
_j311.push(point);
}
}
}
_j225 = _j225.concat(_j311);
let _j338 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j311) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j338++;
let _j339 = point.size || 2.5;
let _j340 = map(_j339, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j340
});
}
let _j341 = boidSpawners.slice(-_j338);
if (_j338 > 0) {
let sizeMultipliers = _j341.map(s => s.boidSizeMultiplier);
let _j342 = Math.min(...sizeMultipliers);
let _j343 = Math.max(...sizeMultipliers);
let _j344 = (_j338 / _j311.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j338} 個 Boid Spawners (虫咬點的 ${_j344}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j342.toFixed(2)} ~ ${_j343.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j311.length > 0) {
let _j345 = Infinity;
let _j346 = 0;
for (let point of _j311) {
let brightness = point.r + point.g + point.b;
_j345 = Math.min(_j345, brightness);
_j346 = Math.max(_j346, brightness);
}
if (_j314 > 0) {
console.log(`⚠️ 跳過了 ${_j314} 個不在筆墨區域的點`);
}
}
const _j347 = _j311.length;
if (_j347 > 0) {
_j109('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j347,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j348 = crandom.getCount();
const _j349 = _j348 - _j285;
if (typeof _j622 !== 'undefined' && _j622 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j350 = currentScanEvent.recordedRandomCount;
const _j192 = _j349 - _j350;
const percent = _j350 > 0 ? ((_j192 / _j350) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j192) < 50 ? '✅' : Math.abs(_j192) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j351 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j352 = typeof _j347 === 'number' ? ` | Points:${_j347}` : '';
console.log(`${icon} Scan [${action}] ${_j351} | 差異: ${_j192 > 0 ? '+' : ''}${_j192} (${percent})${_j352}`);
}
} else if (typeof _j614 !== 'undefined' && _j614) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j349;
}
}
}
}
function _j19(_j1482 = 10, shapeType = null) {
const _j286 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1482; i++) {
let x = crandom.random(_j286, w - _j286);
let y = crandom.random(_j286, h - _j286);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j311 = [];
const _j312 = 30;
const _j313 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j316 = [];
for (let i = 0; i < numBites; i++) {
let _j321 = 0;
let _j322 = false;
let _j323, _j324, distance;
while (!_j322 && _j321 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j312;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j323 = Math.floor(target.x + offsetX);
_j324 = Math.floor(target.y + offsetY);
_j323 = constrain(_j323, _j286, w - _j286);
_j324 = constrain(_j324, _j286, h - _j286);
_j322 = true;
for (let _j326 of _j316) {
let dist = Math.sqrt(
Math.pow(_j323 - _j326.x, 2) +
Math.pow(_j324 - _j326.y, 2)
);
if (dist < _j313) {
_j322 = false;
break;
}
}
_j321++;
}
if (_j322) {
let r, g, b;
let _j337 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j337[0] < 0.2 && _j337[1] < 0.15 && _j337[2] < 0.1) {
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
let _j334 = floor(_j323 * 1000 + _j324 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j323, _j324, size, _j334, shapeType);
let point = {
x: _j323,
y: _j324,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j316.push(point);
_j311.push(point);
}
}
}
_j225 = _j225.concat(_j311);
let _j338 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j311) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j338++;
let _j339 = point.size || 2.5;
let _j340 = map(_j339, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j340
});
}
}
if (_j311.length > 0) {
_j109('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j311.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1483 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j492);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j492);
}
const _j353 = _j1483 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j225.length;
if (!_j353) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j225) {
const px = point.x;
const py = point.y;
const _j354 = (point.size || 5) / _j492;
const _j355 = point.x / width;
const _j356 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j355 * 255, _j356 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j355 * 255, _j356 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j354, _j354);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j354, _j354);
}
}
const _j357 = {
pointCount: _j225.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j357;
window.bugsMaskTextureCache = _j357;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j293, _j1480) {
if (_j225.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j358 = _j20();
let _j359 = _j358.dataTexture;
let _j360 = _j358.maskTexture;
_j293.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1480);
window.metallicProgram.setUniform('bugsMask', _j360);
window.metallicProgram.setUniform('bugsData', _j359);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j492, height * _j492]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j361 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j362 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j363 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j364 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j365 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j361);
window.metallicProgram.setUniform('lightPos', [_j364, _j365]);
window.metallicProgram.setUniform('specularPower', _j362);
window.metallicProgram.setUniform('fresnelStrength', _j363);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j293.end();
}
let _j366 = null;
let __lastGridParams = null;
function _j22(x1, y1, x2, y2, _j1484, _j1485) {
const d = dist(x1, y1, x2, y2);
if (d < 1) return;
const dx = (x2 - x1) / d, dy = (y2 - y1) / d;
let pos = 0, draw = true;
while (pos < d) {
const _j367 = draw ? _j1484 : _j1485;
const end = Math.min(pos + _j367, d);
if (draw) line(x1 + dx * pos, y1 + dy * pos, x1 + dx * end, y1 + dy * end);
pos = end;
draw = !draw;
}
}
function gridCommitPrev() {
if (__lastGridParams) {
_j366 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j23(cx, cy, _j486, _j487) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j486 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j560 !== 'undefined' && _j560 !== null) {
if (_j560.minX < minX) minX = _j560.minX;
if (_j560.maxX > maxX) maxX = _j560.maxX;
if (_j560.minY < minY) minY = _j560.minY;
if (_j560.maxY > maxY) maxY = _j560.maxY;
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
const _j368 = effCell * 0.3;
const _j369 = (maxX - minX) + _j368 * 2;
const _j370 = (maxY - minY) + _j368 * 2;
const _j371 = (minX + maxX) * 0.5;
const _j372 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j368) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j368) / effCell) * effCell);
const _j373 = Math.min(width, Math.ceil((maxX + _j368) / effCell) * effCell);
const _j374 = Math.min(height, Math.ceil((maxY + _j368) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j373 - left);
let gridHeight = Math.max(effCell * 2, _j374 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j366 && typeof _j622 !== 'undefined' && _j622) {
const pg = _j366;
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
if (_j487) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j487) {
const _j375 = 12;
const _j376 = left + 8;
const _j377 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j376 - _j375 / 2, _j377, _j376 + _j375 / 2, _j377);
line(_j376, _j377 - _j375 / 2, _j376, _j377 + _j375 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j487) {
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
const _j378 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j379 = typeof _j555 === 'number' ? _j555 : 0;
const _j380 = typeof brushDir === 'number' ? brushDir : 0;
const _j381 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j382 = _j381[_j380] || '?';
const countdownText = `Max: ${_j378} | Count: ${_j379} | Dir: ${_j380}(${_j382})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j383 = typeof _j556 === 'number' ? _j556 : 0;
const _j384 = typeof brushMode === 'number' ? brushMode : 0;
const _j385 = (typeof _j517 === 'number' && _j517 > 0) ? _j517 : (typeof _j533 === 'number' ? _j533 : effCell);
const _j386 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j387 = `C: ${_j383} | B: ${_j384} | S: ${_j385.toFixed(1)} | P: ${_j386}`;
const _j388 = left;
const _j389 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j387, _j388, _j389);
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
function _j24(_j1479) {
const _j390 = typeof _j1479.begin === 'function';
if (_j390) _j1479.begin();
const g = _j390 ? window : _j1479;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j391 = 5;
const _j392 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j894 = true;
_j869 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j393 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j393;
let dy = (y2 - y1) / _j393;
let _j394 = 0;
while (_j394 < _j393) {
let _j395 = _j894 ? _j391 : _j392;
let _j396 = min(_j395 - _j869, _j393 - _j394);
if (_j894) {
let startX = x1 + dx * _j394;
let startY = y1 + dy * _j394;
let _j397 = x1 + dx * (_j394 + _j396);
let _j398 = y1 + dy * (_j394 + _j396);
g.line(startX, startY, _j397, _j398);
}
_j394 += _j396;
_j869 += _j396;
if (_j869 >= (_j894 ? _j391 : _j392)) {
_j894 = !_j894;
_j869 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j399 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j399.x, _j399.y, 10, 10);
}
g.pop();
if (_j390) _j1479.end();
}
function _j25() {
const _j400 = 10;
if (typeof _j541 !== 'undefined' && _j541 && typeof _j545 !== 'undefined' && _j545) {
noFill();
stroke(0, 180, 0, 180);
strokeWeight(1.5);
if (_j545.action === 'rect') {
const _j401 = _j545.x1 + _j400, _j402 = _j545.y1 + _j400;
const _j403 = _j545.x2 + _j400, _j404 = _j545.y2 + _j400;
_j22(_j401, _j402, _j403, _j402, 6, 4);
_j22(_j403, _j402, _j403, _j404, 6, 4);
_j22(_j403, _j404, _j401, _j404, 6, 4);
_j22(_j401, _j404, _j401, _j402, 6, 4);
} else if (_j545.action === 'polygon' && _j545.points && _j545.points.length >= 3) {
const _j405 = _j545.points;
for (let i = 0; i < _j405.length; i++) {
const a = _j405[i], b = _j405[(i + 1) % _j405.length];
_j22(a.x + _j400, a.y + _j400, b.x + _j400, b.y + _j400, 6, 4);
}
}
fill(0, 180, 0, 200);
noStroke();
if (typeof font !== 'undefined' && font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
const _j406 = (_j545.action === 'rect' ? _j545.x1 : (_j545.points ? _j545.points[0].x : 0)) + _j400;
const _j407 = (_j545.action === 'rect' ? _j545.y1 - 12 : (_j545.points ? _j545.points[0].y - 12 : 0)) + _j400;
text('MASK', _j406, _j407);
}
if (typeof _j540 !== 'undefined' && _j540 && typeof _j542 !== 'undefined' && _j542 === 'rect' &&
typeof _j543 !== 'undefined' && _j543 && _j543.x1 !== undefined && mouseIsPressed) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
const _j408 = Math.min(_j543.x1, mouseX - 10) + _j400;
const _j409 = Math.min(_j543.y1, mouseY - 10) + _j400;
const _j410 = Math.max(_j543.x1, mouseX - 10) + _j400;
const _j411 = Math.max(_j543.y1, mouseY - 10) + _j400;
_j22(_j408, _j409, _j410, _j409, 4, 3);
_j22(_j410, _j409, _j410, _j411, 4, 3);
_j22(_j410, _j411, _j408, _j411, 4, 3);
_j22(_j408, _j411, _j408, _j409, 4, 3);
}
if (typeof _j540 !== 'undefined' && _j540 && typeof _j542 !== 'undefined' && _j542 === 'polygon' &&
typeof _j544 !== 'undefined' && _j544.length > 0) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
for (let i = 0; i < _j544.length - 1; i++) {
const a = _j544[i], b = _j544[i + 1];
_j22(a.x + _j400, a.y + _j400, b.x + _j400, b.y + _j400, 4, 3);
}
noStroke();
fill(0, 200, 0, 150);
for (let p of _j544) {
ellipse(p.x + _j400, p.y + _j400, 6, 6);
}
}
}
function _j26() {
if ((!_j622 || isWaitingToLoop) && _j636 !== null && doMoving) {
const _j412 = easycamInitialCenter || [0, 0, 0];
const _j413 = PI / 3;
const _j414 = height / (2 * tan(_j413 / 2));
const _j415 = easycamInitialDistance > 0 ? easycamInitialDistance : _j414;
const _j416 = _j636.getCenter();
const _j417 = _j636.getDistance();
const _j418 = 0.1;
const _j419 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j416[0] - _j412[0], 2) +
Math.pow(_j416[1] - _j412[1], 2) +
Math.pow(_j416[2] - _j412[2], 2)
);
const distanceDiff = Math.abs(_j417 - _j415);
if (!_j649 && (centerDiff > _j418 || distanceDiff > _j419)) {
_j649 = true;
_j650 = millis();
_j647 = [_j416[0], _j416[1], _j416[2]];
_j651 = _j417;
_j648 = _j412;
_j652 = _j415;
}
if (_j649) {
const _j420 = millis() - _j650;
const _j421 = Math.min(_j420 / _j653, 1.0);
const _j422 = [
lerp(_j647[0], _j648[0], _j421),
lerp(_j647[1], _j648[1], _j421),
lerp(_j647[2], _j648[2], _j421)
];
const _j423 = lerp(_j651, _j652, _j421);
_j636.setCenter(_j422, 0);
_j636.setDistance(_j423, 0);
if (_j421 >= 1.0) {
const _j424 = _j636.getCenter();
const _j425 = _j636.getDistance();
const _j426 = Math.sqrt(
Math.pow(_j424[0] - _j412[0], 2) +
Math.pow(_j424[1] - _j412[1], 2) +
Math.pow(_j424[2] - _j412[2], 2)
);
const _j427 = Math.abs(_j425 - _j415);
if (_j426 > _j418 || _j427 > _j419) {
_j636.setCenter(_j412, 0);
_j636.setDistance(_j415, 0);
}
_j649 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j622 && !isWaitingToLoop && doMoving && _j637 && _j636 !== null && _j638 && !_j649) {
const _j428 = _j626;
const _j429 = _j627;
const _j430 = _j428 - hw;
const _j431 = -(_j429 - hh);
const _j416 = _j636.getCenter();
const _j264 = _j416[0];
const _j265 = _j416[1];
const _j417 = _j636.getDistance();
const _j413 = PI / 3;
const _j432 = height / (2 * tan(_j413 / 2));
const _j433 = 1.1;
let _j434 = 1.4;
const _j313 = _j432 / _j434;
const _j435 = _j432 / _j433;
const _j436 = _j432 / _j417;
const _j437 = 0.01;
if (_j644) {
const _j438 = _j434;
const _j439 = _j432 / _j438;
const distanceDiff = _j439 - _j417;
const _j440 = _j640;
const _j441 = _j417 + distanceDiff * _j440;
const _j442 = constrain(_j441, _j313, _j435);
_j636.setDistance(_j442, 0);
} else {
const _j439 = _j432 / _j433;
const distanceDiff = _j439 - _j417;
const _j440 = _j640;
const _j441 = _j417 + distanceDiff * _j440;
const _j442 = constrain(_j441, _j313, _j435);
_j636.setDistance(_j442, 0);
}
const _j443 = _j636.getDistance();
const _j444 = _j432 / _j443;
let _j445 = 0;
let _j446 = 0;
if (_j444 > _j433) {
_j445 = (_j444 - _j433) * (width / 2);
_j446 = (_j444 - _j433) * (height / 2);
}
let offsetX = _j430 - _j264;
let offsetY = _j431 - _j265;
if (_j445 > 0 || _j446 > 0) {
const _j447 = constrain(_j430, -_j445, _j445);
const _j448 = constrain(_j431, -_j446, _j446);
offsetX = _j447 - _j264;
offsetY = _j448 - _j265;
} else {
offsetX = -_j264;
offsetY = -_j265;
}
const _j449 = _j639;
const _j323 = _j264 + offsetX * _j449;
const _j324 = _j265 + offsetY * _j449;
let _j450 = _j323;
let _j451 = _j324;
if (_j445 > 0 || _j446 > 0) {
_j450 = constrain(_j323, -_j445, _j445);
_j451 = constrain(_j324, -_j446, _j446);
} else {
_j450 = 0;
_j451 = 0;
}
_j636.setCenter([_j450, _j451, 0], 0);
}
}
function _j27() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j637 = false;
return;
}
if (_j636 !== null) {
_j637 = true;
return;
}
try {
const _j452 = _renderer;
if (!_j452) {
console.error('❌ WEBGL renderer not found');
_j637 = false;
return;
}
const _j413 = PI / 3;
const _j432 = height / (2 * tan(_j413 / 2));
_j636 = new Dw.EasyCam(_j452, {
distance: _j432,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j636.setRotationConstraint(0, 0, 0);
_j636.setRotationScale(0);
_j645 = _j432 / 2.5;
_j646 = _j432 / 1.0;
_j636.setDistanceMin(_j645);
_j636.setDistanceMax(_j646);
document.oncontextmenu = function() {
return false;
};
_j637 = true;
_j109('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j637 = false;
_j636 = null;
}
}
function applyCameraProjection() {
const _j453 = doMoving && _j637 && _j636 !== null && _j622 && _j638;
if (_j453) {
const _j454 = PI / 3;
const _j455 = 0.1;
const _j456 = 10000;
perspective(_j454, width / height, _j455, _j456);
push();
} else {
const _j457 = PI / 3;
const _j458 = 0.1;
const _j459 = 10000;
perspective(_j457, width / height, _j458, _j459);
}
}
let _j460 = null;
let _j461 = null;
let _j462 = 0,
_j463 = 0,
_j464 = 0;
let _j465 = {
feedback: {},
composite: {},
realtime: {}
};
function _j28(_j1486, _j1487, name, value) {
const _j466 = _j465[_j1487];
if (_j466[name] === value) return;
_j466[name] = value;
_j1486.setUniform(name, value);
}
function _j29() {
if (_j462 !== width || _j463 !== height || _j464 !== _j492) {
_j460 = [0, 0, width * _j492, height * _j492];
_j461 = [1.0 / (width * _j492), 1.0 / (height * _j492)];
_j462 = width;
_j463 = height;
_j464 = _j492;
}
if (_j460 === null) {
_j460 = [0, 0, width * _j492, height * _j492];
_j461 = [1.0 / (width * _j492), 1.0 / (height * _j492)];
}
}
function _j30(_j1479, _j1488 = 1.0) {
if (_j578) {
_j552 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
_j607.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j495);
const _j467 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j495.setUniform("rect", _j460);
_j495.setUniform("invResolution", _j461);
_j495.setUniform("tex0", _j1479);
_j28(_j495, 'feedback', "brushMode", brushMode * 1.0);
_j495.setUniform("forceMap", _j493);
_j28(_j495, 'feedback', "baseBrushSize", baseBrushSize);
_j495.setUniform("force", _j1488);
_j28(_j495, 'feedback', "useSharpen", useSharpen);
_j28(_j495, 'feedback', "effect3Brightness", effect3Brightness);
_j28(_j495, 'feedback', "indiffusionStrength", indiffusionStrength);
_j28(_j495, 'feedback', "brushColorMode", float(brushColorMode));
_j28(_j495, 'feedback', "brushCategory", _j467);
const _j468 = typeof _j558 !== 'undefined' ? _j558 : 0;
const _j469 = (_j556 + _j468) % 40;
const _j470 = _j556 + _j468;
_j495.setUniform("mouseCount", float(_j469));
_j495.setUniform("mouseCountAccumulated", float(_j470));
_j495.setUniform("strokeSeed", float(strokeSeed));
_j495.setUniform("useMask", _j541 ? 1.0 : 0.0);
if (_j541) _j495.setUniform("maskTex", _j539);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j607.end();
_j1479.begin();
imageMode(CENTER);
blendMode(BLEND);
image(_j607, 0, 0, width, height);
_j1479.end();
_j552 = true;
}
function _j31() {
if (typeof _j609 === 'undefined' || !_j609) {
return;
}
const _j471 = canvasBackgroundColor;
let _j472 = _j9(40, 20, 15, 0.2);
const _j473 = min(255, _j471[0] * 1.1);
const _j474 = min(255, _j471[1] * 1.1);
const _j475 = min(255, _j471[2] * 1.1);
_j609.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j473, _j474, _j475);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j472, -width / 2, -height / 2, width, height);
_j609.end();
_j472.remove();
}
function _j32() {
const _j471 = canvasBackgroundColor;
if (typeof _j610 !== 'undefined' && _j610) {
_j610.begin();
background(_j471[0], _j471[1], _j471[2]);
_j610.end();
}
_j31();
if (typeof _j552 !== 'undefined') {
_j552 = true;
}
}
function updateCompositeBuffer() {
const _j476 = _j552 || _j534 || _j535 || _j622 || _j665;
if (_j476) {
_j606.begin();
clear();
shader(_j498);
_j29();
_j498.setUniform("rect", _j460);
_j498.setUniform("baseTex", showPaperTexture ? _j609 : _j610);
_j498.setUniform("encodedTex", _j602);
_j498.setUniform("typeMapTex", _j613);
_j498.setUniform("oldTex", _j600);
_j28(_j498, 'composite', "brushColorMode", float(brushColorMode));
_j28(_j498, 'composite', "whiteMaxOpacity", _j503);
_j28(_j498, 'composite', "hueShift", _j504);
_j28(_j498, 'composite', "satShift", _j505);
_j28(_j498, 'composite', "briShift", _j506);
_j28(_j498, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j28(_j498, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j606.end();
if (_j534 || _j535) {
_j611.begin();
clear();
imageMode(CENTER);
image(_j606, 0, 0, width, height);
_j611.end();
_j606.begin();
shader(_j496);
const _j477 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j496.setUniform("rect", _j460);
_j496.setUniform("baseTex", _j611);
_j496.setUniform("addTex", _j603);
_j496.setUniform("encodedTex", _j602);
_j28(_j496, 'realtime', "brushColorMode", float(brushColorMode));
_j28(_j496, 'realtime', "whiteMaxOpacity", _j503);
_j28(_j496, 'realtime', "hueShift", _j504);
_j28(_j496, 'realtime', "satShift", _j505);
_j28(_j496, 'realtime', "briShift", _j506);
_j28(_j496, 'realtime', "brushCategory", _j477);
_j28(_j496, 'realtime', "useSharpen", useSharpen);
let _j478;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j478 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j207[brushColorMode] || _j207[0];
_j478 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j496.setUniform("brushColor", _j478);
_j496.setUniform("useMask", _j541 ? 1.0 : 0.0);
if (_j541) _j496.setUniform("maskTex", _j539);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j606.end();
}
_j552 = _j534 || _j535 || _j622 || _j665;
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
const _j479 = (_j534 || _j535) && _j555 < maxUpdates && _j561;
const _j480 = !_j622 || showFuturePathPreview;
const _j481 = _j479 && showGridOverlay;
const _j482 = (typeof _j541 !== 'undefined' && _j541) ||
(typeof _j540 !== 'undefined' && _j540);
if (_j479 || _j482) {
_j608.begin();
clear();
push();
translate(-hw, -hh);
const _j483 = -10;
translate(_j483, _j483);
if (_j481) {
const _j484 = _j622 ? _j626 : _j529;
const _j485 = _j622 ? _j627 : _j530;
const cx = (_j531 || _j531 === 0) ? _j531 : _j484;
const cy = (_j532 || _j532 === 0) ? _j532 : _j485;
const _j486 = _j533;
const _j487 = typeof _j579 !== 'undefined' && _j579;
_j23(cx, cy, _j486, _j487);
} else if (_j482) {
_j25();
}
if (pathPoints.length > 1 && _j480) {
const _j391 = 5;
const _j392 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j894 = true;
_j869 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j393 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j393;
let dy = (y2 - y1) / _j393;
let _j394 = 0;
while (_j394 < _j393) {
let _j395 = _j894 ? _j391 : _j392;
let _j396 = min(_j395 - _j869, _j393 - _j394);
if (_j894) {
let startX = x1 + dx * _j394;
let startY = y1 + dy * _j394;
let _j397 = x1 + dx * (_j394 + _j396);
let _j398 = y1 + dy * (_j394 + _j396);
line(startX, startY, _j397, _j398);
}
_j394 += _j396;
_j869 += _j396;
if (_j869 >= (_j894 ? _j391 : _j392)) {
_j894 = !_j894;
_j869 = 0;
}
}
}
}
if (_j480 && _j479) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j488 = _j622 ? _j626 : _j529;
const _j489 = _j622 ? _j627 : _j530;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j488, _j489, 10, 10);
}
pop();
_j608.end();
}
}
let _j490 = window._demoCanvasWidth || 900,
_j491 = window._demoCanvasHeight || 900,
hw, hh, _j492 = 1.6;
let _j493, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j494, _j495, _j496, _j497, _j498, _j499;
let _j500;
let _j501;
const _j207 = _j2();
let colorIndex = 0,
_j502 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j503 = 0.95;
let _j504 = 0.0,
_j505 = 0.0,
_j506 = 0.0;
let customBrushColor = [26, 26, 26];
let _j507, _j508, _j509, _j510, _j511;
let _j512, _j513, _j514, _j515, _j516, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j517 = 0,
_j518 = 2,
_j519 = 0;
let brushMode = 1,
_j520 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j521 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j522 = [];
let x, y, _j430, _j431, _j523, _j524, _j525, _j526 = 0,
_j527 = 0;
let _j528;
let _j529 = 0,
_j530 = 0,
_j531 = 0,
_j532 = 0,
_j533 = 20;
let _j534 = false,
_j535 = false,
_j536 = false,
_j537 = false;
let _j538 = true;
let useSpectralMix = false;
let _j539;
let _j540 = false;
let _j541 = false;
let _j542 = 'rect';
let _j543 = null;
let _j544 = [];
let _j545 = null;
Object.defineProperty(window, 'spectral', {
get() { return useSpectralMix; },
set(v) {
useSpectralMix = !!v;
console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
}
});
window.getAgentPathData = function() {
return {
active: _j553,
paths: _j554,
pointCount: _j554.filter(p => !p.stroke).length,
strokeCount: _j554.filter(p => p.stroke).length,
canvasSize: { w: typeof width !== 'undefined' ? width : 0, h: typeof height !== 'undefined' ? height : 0 },
timestamp: Date.now()
};
};
let _j546 = 1.0,
_j547 = false,
_j548 = 0.0;
let _j549 = null;
let _j550 = false,
_j551 = false,
_j552 = true;
let _j553 = false;
let _j554 = [];
let _j555 = 0,
maxUpdates = 10,
force = 1.0;
let _j556 = 0,
_j557 = 0,
_j558 = 0;
var doMoving = false,
_j559 = false;
let pathPoints = [],
_j560 = null,
startX = 0,
startY = 0,
_j561 = false;
let _j562 = 1,
pathRotation = 20;
let randStep = 1,
_j563 = 10,
expectedStrokeLength = 100;
let _j564 = [],
_j565 = 0,
_j566 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j567;
var currentStrokeHighlight = null;
let _j568 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j569 = 140.0,
_j570 = 0.5,
_j571 = 1.0,
_j572 = 0.5,
_j573 = 60.0;
let cellularEnabled = false,
_j574 = 15.0,
_j575 = 0.5;
let whiteDotEnabled = false,
_j576 = 0.01;
let grainEnabled = false,
_j577 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j578 = false;
let _j579 = false;
let _j580 = 0;
let _j581 = 0;
let _j582 = 0;
let _j583 = 50;
let _j584 = 0;
var flowEffectStrokeBounds = null;
let _j585 = false;
let _j586 = null;
let _j587 = 0;
var _j588 = 0;
var _j589 = 0;
let _j590 = false;
const _j591 = 3;
var _j592 = {
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
var _j593 = false;
let _j594 = [0, 0, 0, 0],
_j595 = [0, 0, 0],
_j596 = [0, 0, 0],
_j597 = [0, 0, 0];
let _j598 = [0, 0],
_j599 = [0, 0],
effect3Brightness = 0.2;
let _j600, _j601, _j602, _j603, _j604, _j605, _j606;
let _j607, _j608, _j609, _j610;
let _j611;
let _j612;
let _j613;
let _j614 = false,
_j615 = 0,
_j616 = null,
_j617 = 0;
let _j618 = 0,
_j619 = 0,
_j620 = true,
_j621 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j622 = false,
_j623 = 0,
_j624 = 0,
_j625 = 1.0;
let _j626 = 0,
_j627 = 0,
_j628 = 0,
_j629 = 0;
let _j630 = false,
isWaitingToLoop = false,
_j631 = 0;
let _j632 = 0,
_j633 = false;
let _j634 = 0,
_j635 = 0;
let _j636 = null,
_j637 = false,
_j638 = false;
let _j639 = 0.05,
_j640 = 0.05;
let _j641 = 0,
_j642 = 0;
let _j643 = 1,
_j644 = false;
let _j645 = 0,
_j646 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j647 = [0, 0, 0],
_j648 = [0, 0, 0];
let _j649 = false,
_j650 = 0,
_j651 = 0,
_j652 = 0,
_j653 = 1000;
let _j654 = false,
_j655 = 0;
let _j656 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j657 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j658 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j659 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j660 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j661 = 0,
_j662 = 300;
let _j663 = false,
_j664 = false;
let _j665 = false,
_j666 = 0,
frameCount = 0,
_j667 = [];
let _j668 = 1,
_j669 = 0.8;
let _j670 = true,
_j671 = [],
_j672 = 100,
isDragging = false;
let _j673 = {
x: 0,
y: 0
},
_j674 = {
x: 85,
y: 50
};
let _j675 = false,
_j676 = {
x: 0,
y: 0
},
_j677 = {
x: 15,
y: 50
},
_j678 = true;
let _j679 = false,
_j680 = {
x: 0,
y: 0
},
_j681 = {
x: 85,
y: 70
},
_j682 = true;
let _j683 = false,
_j684 = {
x: 0,
y: 0
},
_j685 = {
x: 85,
y: 40
},
_j686 = true;
let _j687 = false,
_j688 = {
x: 0,
y: 0
},
_j689 = {
x: 15,
y: 40
},
_j690 = true;
let _j691 = 10;
var screenText = false,
_j692 = [],
_j693 = 30,
_j694 = 0;
let _j695 = 25,
_j696 = 30,
_j697 = 16,
_j698 = 200,
_j699 = 200;
let _j700 = false,
_j701 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j495 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j496 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j494 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j499 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j501 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j161();
if (doDemo) {
_j169('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j567 = window._preloadedDemo;
recordingData = _j567;
window._pendingAutoPlay = true;
} else {
var _j702 = './lib/demo.json';
var _j703 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j703)) {
_j702 = './lib/' + _j703 + '.json';
}
fetch(_j702)
.then(_j1509 => {
if (!_j1509.ok) throw new Error('HTTP ' + _j1509.status);
return _j1509.json();
})
.then(data => {
_j567 = data;
if (_j567 && _j567.events && _j567.events.length > 0) {
recordingData = _j567;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j109('system', '❌ Failed to load ' + _j702, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j704 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j705 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j704) {
try {
const loadedData = JSON.parse(_j704);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j705 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j706 = sessionStorage.getItem('pendingRecordingData');
const _j707 = sessionStorage.getItem('shouldAutoPlay');
if (_j706 && _j707 === 'true') {
try {
const loadedData = JSON.parse(_j706);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j169('📂 Recording Data Restored After Reload');
_j109('system', '✅ Canvas size restored and recording loaded', {
CanvasSize: `${width}x${height}`,
Events: `${recordingData.events.length} events`
});
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
_j109('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
window._pendingAutoPlay = true;
}
} catch (error) {
_j109('system', '❌ Failed to restore recording data', {
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
const _j708 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j709 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
const _j710 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j710) {
const _j711 = parseFloat(_j710[1]);
if (!isNaN(_j711) && _j711 >= 0.5 && _j711 <= 5) {
_j492 = _j711;
_j109('system', '🔗 Pixel density from URL', {
Value: _j711
});
}
} else if (window.APP_MODE === 'collector') {
_j492 = 2;
_j109('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j708) {
const _j712 = 1.0;
if (_j492 > _j712) {
_j492 = _j712;
_j109('system', '📱 Mobile pixel density override', {
Value: _j712,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j713 = sessionStorage.getItem('pendingPixelDensity');
if (_j713 && !_j708 && !_j710) {
const _j714 = parseInt(_j713);
if (!isNaN(_j714) && _j714 >= 1 && _j714 <= 5) {
_j492 = _j714;
sessionStorage.removeItem('pendingPixelDensity');
_j109('system', '🔄 Restoring pixel density from session', {
Value: _j714,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j492);
const _j715 = sessionStorage.getItem('pendingCanvasWidth');
const _j716 = sessionStorage.getItem('pendingCanvasHeight');
let _j717 = false;
if (_j715 && _j716) {
_j490 = parseInt(_j715);
_j491 = parseInt(_j716);
_j717 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j109('system', '🔄 Restoring canvas size from recording', {
Width: `${_j490}px`,
Height: `${_j491}px`
});
}
let _j718 = false,
_j719 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j720 = qs.substring(1).split('_');
for (var i = 0; i < _j720.length; i++) {
var ci = _j720[i].indexOf(':');
if (ci === -1) continue;
var k = _j720[i].substring(0, ci), v = parseInt(_j720[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j490 = v;
_j718 = true;
}
if (k === 'h' && v > 0) {
_j491 = v;
_j719 = true;
}
}
})();
if (_j709 && window.APP_MODE === 'artist' && !_j717) {
if (!_j718) _j490 = 380;
if (!_j719) _j491 = 600;
if (!_j718 || !_j719) {
_j109('system', '📱 Mobile phone default canvas size', {
Width: `${_j490}px`,
Height: `${_j491}px`
});
}
}
const _j721 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j721) {
try {
const _j471 = JSON.parse(_j721);
if (Array.isArray(_j471) && _j471.length === 3) {
canvasBackgroundColor[0] = _j471[0];
canvasBackgroundColor[1] = _j471[1];
canvasBackgroundColor[2] = _j471[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j109('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j471[0]}, ${_j471[1]}, ${_j471[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j490, _j491, WEBGL);
if (_j538) {
const _j722 = document.querySelector('canvas');
if (_j722) {
const _j723 = document.getElementById('zen-mode-btn');
const _j724 = (pressure) => {
if (!_j723) return;
if (pressure <= 0) {
_j723.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j723.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j725 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j547) {
_j547 = true;
_j109('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j548 = e.pressure;
_j546 = Math.min(e.pressure / 0.3, 1.0);
_j724(e.pressure);
}
};
_j722.addEventListener('pointerdown', _j725);
_j722.addEventListener('pointermove', _j725);
_j722.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j547) {
_j548 = 0.0;
_j546 = -1;
_j724(0);
}
});
const _j726 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j727 = t.touchType === 'stylus';
if (_j727 && t.force > 0) {
const _j728 = Math.min(t.force, 1.0);
if (!_j547) {
_j547 = true;
_j109('system', '🖊️ Stylus force detected', { force: t.force });
}
_j548 = _j728;
_j546 = Math.min(_j728 / 0.3, 1.0);
_j724(_j728);
}
}
};
_j722.addEventListener('touchstart', _j726, { passive: true });
_j722.addEventListener('touchmove', _j726, { passive: true });
_j722.addEventListener('touchend', () => {
if (_j547) {
_j548 = 0.0;
_j546 = -1;
_j724(0);
}
}, { passive: true });
}
}
_j493 = createFramebuffer({
density: _j492
});
window.metallicStrength = 0.85;
window.metallicFlowSpeed = 1.0;
window.metallicSpecular = 12.0;
window.metallicFresnel = 0.5;
window.bugsSize = 10.0;
window.metallicLightX = 0.5;
window.metallicLightY = 0.3;
window.metallicTint = [0.72, 0.50, 0.35];
if (typeof _j107 === 'function') _j107();
if (typeof _j105 === 'function') _j105();
_j144();
_j136();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j135 === 'function') {
_j135();
}
_j45();
window.addEventListener('resize', function() {
setTimeout(_j45, 100);
});
_j169('Interactive Generative Art System');
_j600 = createFramebuffer({
density: _j492
});
_j600.begin();
background(255);
_j600.end();
_j601 = createGraphics(width, height, WEBGL);
_j601.noStroke();
_j601.pixelDensity(_j492);;
_j601.clear();
_j602 = createFramebuffer({
density: _j492
});
_j602.begin();
background(255);
_j602.end();
_j603 = createFramebuffer({
density: _j492
});
_j603.begin();
background(255);
_j603.end();
_j604 = createFramebuffer({
density: _j492
});
_j605 = createGraphics(width, height, WEBGL);
_j605.noStroke();
_j605.pixelDensity(_j492);;
_j605.clear();
_j609 = createFramebuffer({
density: _j492
});
let _j472 = _j9(40, 20, 15, 0.2);
const _j473 = min(255, canvasBackgroundColor[0] * 1.1);
const _j474 = min(255, canvasBackgroundColor[1] * 1.1);
const _j475 = min(255, canvasBackgroundColor[2] * 1.1);
_j609.begin();
clear();
noStroke();
fill(_j473, _j474, _j475);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j472, -width / 2, -height / 2, width, height);
_j609.end();
_j472.remove();
_j610 = createFramebuffer({
density: _j492
});
_j610.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j610.end();
_j606 = createFramebuffer({
density: _j492
});
_j613 = createFramebuffer({
density: _j492
});
_j613.begin();
background(0);
_j613.end();
_j607 = createFramebuffer({
density: _j492
});
_j611 = createFramebuffer({
density: _j492
});
_j608 = createFramebuffer({
density: _j492
});
_j612 = createFramebuffer({
density: _j492
});
_j612.begin();
background(255);
_j612.end();
_j539 = createFramebuffer({
density: _j492
});
_j539.begin();
background(255);
_j539.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j492
});
}
_j493.begin();
background(255, 255, 255);
_j493.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j626 = hw;
_j627 = hh;
_j628 = hw;
_j629 = hh;
_j167();
_j507 = 10;
_j563 = 2;
_j509 = 0.5;
_j510 = 0.5;
_j508 = 0;
_j511 = 20;
x = y = _j512 = _j513 = _j514 = _j515 = _j528 = 0;
_j430 = hw;
_j431 = hh;
_j516 = 0;
_j163();
_j170();
_j27();
_j168();
window.addEventListener('mouseup', function(e) {
if (_j534 && !_j622) {
const _j729 = document.querySelector('canvas');
if (_j729) {
const bounds = _j729.getBoundingClientRect();
const _j730 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j730) {
_j109('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j535) {
_j535 = true;
_j555 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j550 = _j46(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j550 = false;
});
document.addEventListener('mousemove', function(e) {
if (_j540) return;
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j529 = _j176(mouseX);
_j530 = _j176(mouseY);
} else {
const _j729 = document.querySelector('canvas');
if (!_j729) return;
const bounds = _j729.getBoundingClientRect();
const _j731 = (e.clientX - bounds.left) / bounds.width;
const _j732 = (e.clientY - bounds.top) / bounds.height;
_j529 = _j176(_j731 * width);
_j530 = _j176(_j732 * height);
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
function _j34() {
if (!_j1384.enabled) return;
_j1384.frameCount++;
let _j733 = 60;
const now = millis();
if (_j1384.lastFrameTime > 0) {
const deltaTime = now - _j1384.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j733 = 1000 / deltaTime;
_j733 = Math.max(1, Math.min(120, _j733));
}
} else {
try {
const _j734 = frameRate();
if (!isNaN(_j734) && _j734 > 0) {
_j733 = _j734;
}
} catch (e) {}
}
_j1384.lastFrameTime = now;
_j1384._pushFR(_j733);
if (_j1384.frameCount - _j1384.lastCheckFrame >= _j1384.checkInterval) {
_j1384.lastCheckFrame = _j1384.frameCount;
const _j735 = _j1384._frLen > 0 ?
_j1384._avgFR() :
_j733;
if (_j1384.logFpsToConsole) {
console.log('FPS:', _j735.toFixed(1));
}
const _j736 = 0.1;
const _j737 = _j735 <= (_j1384.frameRateThreshold + _j736);
if (_j737) {
const now = millis();
if (now - _j1384.lastPerformanceLog > _j1384.logCooldown) {
_j1384.lastPerformanceLog = now;
_j35(_j735);
} else {
console.log('[性能监控] 跳过记录（冷却中，剩余:', ((_j1384.logCooldown - (now - _j1384.lastPerformanceLog)) / 1000).toFixed(1), '秒)');
}
}
}
}
function _j35(_j735) {
const _j738 = _j1384.performanceDataAccumulated;
const sampleCount = _j738.sampleCount > 0 ? _j738.sampleCount : 1;
if (sampleCount === 0 || _j738.drawTotal === 0) {
const _j739 = _j1384.performanceData;
const _j740 = _j739.drawTotal > 0 ? _j739.drawTotal : 1;
const report = {
'平均帧率': `${_j735.toFixed(1)} fps`,
'目标帧率': `${_j1384.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j735).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j490}x${_j491}`,
'Pixel Density': _j492
};
const stateInfo = {
'正在绘制': _j534 ? '是' : '否',
'正在播放': _j622 ? '是' : '否',
'倒计时中': _j535 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j637 ? '是' : '否',
'笔画数量': typeof _j564 !== 'undefined' ? _j564.length : 0
};
_j109('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j738.drawTotal / sampleCount,
updatePlayback: _j738.updatePlayback / sampleCount,
updateCompositeBuffer: _j738.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j738.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j738.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j738.updateBlurEffect / sampleCount,
applyCameraProjection: _j738.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j738.drawLayersWithBlur / sampleCount,
other: _j738.other / sampleCount
};
const _j740 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j741 = [];
const _j742 = _j740 * 0.1;
if (data.updatePlayback > _j742) {
_j741.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j740) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j742) {
_j741.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j740) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j742) {
_j741.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j740) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j742) {
_j741.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j740) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j742) {
_j741.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j740) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j742) {
_j741.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j740) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j742) {
_j741.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j740) * 100).toFixed(1)
});
}
if (data.other > _j742) {
_j741.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j740) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j735.toFixed(1)} fps`,
'目标帧率': `${_j1384.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j735).toFixed(2)} ms`,
'总耗时': `${_j740.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j490}x${_j491}`,
'Pixel Density': _j492
};
const stateInfo = {
'正在绘制': _j534 ? '是' : '否',
'正在播放': _j622 ? '是' : '否',
'倒计时中': _j535 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j637 ? '是' : '否',
'笔画数量': typeof _j564 !== 'undefined' ? _j564.length : 0
};
if (_j741.length > 0) {
report['性能瓶颈'] = _j741.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j743 = [];
if (data.drawLayersWithBlur > _j742) {
_j743.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j742) {
_j743.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j490 * _j491 > 1500000) {
_j743.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof _j564 !== 'undefined' && _j564.length > 100) {
_j743.push('笔画数量较多，考虑清理旧笔画');
}
if (_j743.length > 0) {
report['优化建议'] = _j743.join('; ');
}
_j109('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1384.performanceData).forEach(key => {
_j1384.performanceData[key] = 0;
});
Object.keys(_j1384.performanceDataAccumulated).forEach(key => {
_j1384.performanceDataAccumulated[key] = 0;
});
}
let _j744 = 0;
const _j745 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j746 = (++_j744 % _j745 === 0);
const _j747 = _j746 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j225.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j748 = _j746 ? performance.now() : 0;
if (_j622) {
updatePlayback();
}
if (_j746) _j1384.performanceData.updatePlayback += performance.now() - _j748;
_j26();
if (_j552 || _j534 || _j535 || _j622 || _j665) {
if (_j746) _j748 = performance.now();
updateCompositeBuffer();
if (_j746) _j1384.performanceData.updateCompositeBuffer += performance.now() - _j748;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j33();
}
if (_j746) _j748 = performance.now();
updateEasyCamAutoTracking();
if (_j746) _j1384.performanceData.updateEasyCamAutoTracking += performance.now() - _j748;
if (_j746) _j748 = performance.now();
drawCursorToBuffer();
if (_j746) _j1384.performanceData.drawCursorToBuffer += performance.now() - _j748;
_j36();
if (_j746) _j748 = performance.now();
updateBlurEffect();
if (_j746) _j1384.performanceData.updateBlurEffect += performance.now() - _j748;
if (_j746) _j748 = performance.now();
applyCameraProjection();
if (_j746) _j1384.performanceData.applyCameraProjection += performance.now() - _j748;
if (_j746) _j748 = performance.now();
drawLayersWithBlur();
if (_j746) _j1384.performanceData.drawLayersWithBlur += performance.now() - _j748;
_j50();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j749 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j622 !== 'undefined' ? _j622 : '?') +
' evt=' + (typeof _j624 !== 'undefined' ? _j624 : '?');
_j606.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j749, -width/2 + 4, -height/2 + 3);
_j606.end();
if (d.totalFrames % 10 === 0) {
var _j750 = document.getElementById('defaultCanvas0');
var _j751 = document.getElementById('_fxDbgOvr');
if (!_j751 && _j750) {
_j751 = document.createElement('canvas');
_j751.id = '_fxDbgOvr';
_j751.width = _j750.offsetWidth;
_j751.height = 24;
_j751.style.position = 'fixed';
_j751.style.top = _j750.offsetTop + 'px';
_j751.style.left = _j750.offsetLeft + 'px';
_j751.style.zIndex = '2147483647';
_j751.style.pointerEvents = 'none';
document.body.appendChild(_j751);
}
if (_j751) {
var _j752 = _j751.getContext('2d');
_j752.clearRect(0, 0, _j751.width, _j751.height);
_j752.fillStyle = 'rgba(200,0,0,0.85)';
_j752.fillRect(0, 0, _j751.width, 22);
_j752.font = 'bold 13px monospace';
_j752.fillStyle = '#fff';
_j752.fillText(_j749, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j753 = document.getElementById('fxhash-capture-canvas');
var _j754 = document.getElementById('defaultCanvas0');
if (_j753 && typeof _j606 !== 'undefined') {
var _j755 = _j606.get();
_j753.width = _j755.width;
_j753.height = _j755.height;
var _j756 = _j753.getContext('2d');
_j756.drawImage(_j755.canvas, 0, 0);
if (typeof _j755.remove === 'function') _j755.remove();
if (_j754) {
_j753.style.cssText = _j754.style.cssText;
_j754.style.visibility = 'hidden';
}
_j753.style.position = 'absolute';
_j753.style.top = (_j754 ? _j754.offsetTop : 0) + 'px';
_j753.style.left = (_j754 ? _j754.offsetLeft : 0) + 'px';
_j753.style.zIndex = '99999';
_j753.style.visibility = 'visible';
_j753.style.border = 'none';
_j753.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j753.width + 'x' + _j753.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j757 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j756.save();
_j756.fillStyle = 'rgba(0,0,0,0.7)';
_j756.fillRect(10, 10, 280, _j757.length * 22 + 10);
_j756.font = '16px monospace';
_j756.fillStyle = '#0f0';
for (var li = 0; li < _j757.length; li++) {
_j756.fillText(_j757[li], 18, 30 + li * 22);
}
_j756.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j754 && _j753) {
_j753.width = _j754.width;
_j753.height = _j754.height;
var _j756 = _j753.getContext('2d');
_j756.drawImage(_j754, 0, 0);
if (_j754) _j754.style.visibility = 'hidden';
_j753.style.visibility = 'visible';
_j753.style.zIndex = '99999';
_j753.style.border = 'none';
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
if (_j746) {
const _j758 = performance.now();
const _j759 = _j1384.performanceData.updatePlayback +
_j1384.performanceData.updateCompositeBuffer +
_j1384.performanceData.updateEasyCamAutoTracking +
_j1384.performanceData.drawCursorToBuffer +
_j1384.performanceData.updateBlurEffect +
_j1384.performanceData.applyCameraProjection +
_j1384.performanceData.drawLayersWithBlur;
_j1384.performanceData.other = (_j758 - _j747) - _j759;
_j1384.performanceData.drawTotal = _j758 - _j747;
_j1384.performanceDataAccumulated.drawTotal += _j1384.performanceData.drawTotal;
_j1384.performanceDataAccumulated.updatePlayback += _j1384.performanceData.updatePlayback;
_j1384.performanceDataAccumulated.updateCompositeBuffer += _j1384.performanceData.updateCompositeBuffer;
_j1384.performanceDataAccumulated.updateEasyCamAutoTracking += _j1384.performanceData.updateEasyCamAutoTracking;
_j1384.performanceDataAccumulated.drawCursorToBuffer += _j1384.performanceData.drawCursorToBuffer;
_j1384.performanceDataAccumulated.updateBlurEffect += _j1384.performanceData.updateBlurEffect;
_j1384.performanceDataAccumulated.applyCameraProjection += _j1384.performanceData.applyCameraProjection;
_j1384.performanceDataAccumulated.drawLayersWithBlur += _j1384.performanceData.drawLayersWithBlur;
_j1384.performanceDataAccumulated.other += _j1384.performanceData.other;
_j1384.performanceDataAccumulated.sampleCount++;
}
_j34();
if (_j622) {
if (_j535 && !_j633) {
_j632 = millis();
_j633 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j535 && _j633) {
const _j760 = millis() - _j632;
const _j761 = _j623;
_j623 += _j760;
_j633 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j760.toFixed(0)}ms`);
if (_j624 < recordingData.events.length) {
const _j762 = recordingData.events[_j624];
const _j763 = _j762.m || _j762.type;
const _j764 = _j763 === 'mp' || _j763 === 'mousePressed';
const _j765 = _j762.t !== undefined ? _j762.t : _j762.time;
const _j766 = (millis() - _j623) * _j625;
const _j767 = _j765 - _j766;
if (_j764 || _j767 <= 0 || _j767 < 100) {
if (window.DEBUG_MODE && _j764) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j767.toFixed(0)}ms`);
}
_j183(_j762);
_j624++;
}
}
}
}
const _j768 = _j622 ? _j630 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j534));
const _j769 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j768 : (_j768 && _j517 > 0);
const _j770 = _j622 || (_j529 >= 0 && _j529 < width && _j530 >= 0 && _j530 < height) || (_j534 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j769 && _j770) {
window.drawLoopCount++;
if (_j556 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j556++;
let _j488, _j489;
if (_j622) {
_j488 = _j626;
_j489 = _j627;
} else {
_j488 = _j529;
_j489 = _j530;
}
if (_j556 % 2 === 0 && _j561) {
pathPoints.push({
x: _j488,
y: _j489
});
}
if (_j553) {
_j554.push({
x: _j488,
y: _j489,
t: millis(),
pressure: force
});
}
const _j771 = strokeSeed + _j556 * 100000000;
randomSeed(_j771);
if (brushMode === 3) {
let _j772 = crandom.random(0, 1);
let _j773 = crandom.random(150, 250);
let _j774 = _j772 > 0.1 ? noise(_j488 * 0.01, _j489 * 0.01) * 150 : _j773;
_j502 = (_j502 * 0.3) + (_j774 * 0.7);
} else {
let _j772 = crandom.random(0, 1);
let _j773 = crandom.random(20, 50);
let _j774 = _j772 > 0.3 ? noise(_j488 * 0.01, _j489 * 0.01) * 10 : _j773;
_j502 = (_j502 * 0.6) + (_j774 * 0.4);
}
_j517 -= randStep;
_j517 = max(1, _j517);
_j511 = _j517;
if (_j538 && _j556 >= 8) {
const _j775 = _j622 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j548;
const _j776 = baseBrushSize;
if (_j775 >= 0.3) {
const _j777 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j778 = _j549 || window._strokeStartBaseBrushSize || 1;
let _j779 = _j777.indexOf(_j778);
if (_j779 === -1) {
_j779 = _j777.findIndex(s => s >= _j778);
if (_j779 === -1) _j779 = _j777.length - 1;
}
let _j780;
if      (_j775 < 0.5) _j780 = 1;
else if (_j775 < 0.7) _j780 = 2;
else                     _j780 = 3;
const _j781 = Math.min(_j779 + _j780, _j777.length - 1);
baseBrushSize = _j777[_j781];
} else if (_j775 >= 0) {
baseBrushSize = _j549 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j776 && _j776 > 0) {
const _j782 = Math.pow(baseBrushSize / _j776, 0.6);
_j517 *= _j782;
initialSize *= _j782;
}
}
if (_j517 <= _j518 && !_j535 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j535 = true;
_j555 = 0;
}
_j430 = _j488;
_j431 = _j489;
_j516 = map(noise(_j430 * 0.01, _j431 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j783 = strokeSeed + _j556 * 10000000;
randomSeed(_j783);
const _j784 = crandom.random(pathRotation * 0.5, pathRotation);
const _j785 = crandom.random(pathRotation * 0.5, pathRotation);
const _j483 = -10;
_j430 += _j784 * (cos(_j516)) + _j483;
_j431 += _j785 * (sin(_j516)) + _j483;
}
if (_j614) {
const _j786 = (brushMode === 3) ? _j430 : Math.round(_j430);
const _j787 = (brushMode === 3) ? _j431 : Math.round(_j431);
const _j788 = { x: _j786, y: _j787 };
if (_j538 && _j547) _j788.p = Math.round(_j548 * 1000) / 1000;
_j177("md", _j788);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j531 = _j430;
_j532 = _j431;
let _j293 = _j603;
if (_j556 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j789 = dist(_j430, _j431, _j526, _j527);
const _j790 = 1;
if (_j789 > _j790) {
if (brushMode == 4 && _j556 < expectedStrokeLength) {
_j57(_j293, _j430, _j431, _j526, _j527);
}
if ((brushMode == 1 || brushMode == 7) && _j556 < expectedStrokeLength) {
let _j791 = expectedStrokeLength > 0 ? min(_j556 / expectedStrokeLength, 1.0) : 0;
let _j792 = crandom.random(0, 1);
if (_j792 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j556 > 5 && baseBrushSize < 6.0) _j55(_j293, _j430, _j431);
}
_j56(_j293, _j430, _j431, _j791, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j556 < expectedStrokeLength) {
let _j791 = expectedStrokeLength > 0 ? min(_j556 / expectedStrokeLength, 1.0) : 0;
let _j792 = crandom.random(0, 1);
if (_j792 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j791 < 0.6) {}
_j59(_j293, _j430, _j431, _j791, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j556 < expectedStrokeLength) {
_j62(_j293, _j430, _j431, _j526, _j527);
if (crandom.random(0, 1) > 0.4) _j55(_j293, _j430, _j431);
}
if (brushMode == 5 && _j556 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j55(_j293, _j430, _j431);
}
if (brushMode == 6 && _j556 < expectedStrokeLength) {
let _j791 = expectedStrokeLength > 0 ? min(_j556 / expectedStrokeLength, 1.0) : 0;
_j63(_j293, _j430, _j431, _j791, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j556 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j526 = _j430;
_j527 = _j431;
if (_j622) {
_j628 = _j626;
_j629 = _j627;
}
}
const _j793 = _j622 ? _j630 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j534));
const _j794 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j793 : (_j793 && _j517 > 0);
if (_j794) {
if (_j557 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j293 = _j603;
_j30(_j293, force);
_j557++;
if (_j557 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j535 && _j555 < maxUpdates) {
force = map(_j555, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j293 = _j603;
_j30(_j293, force);
_j555++;
_j557++;
} else if (_j535 && _j555 >= maxUpdates) {
_j109('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j37();
_j535 = false;
}
if (_j621 == 1 && _j622 && !_j665) {
_j172();
}
if (_j621 == 1 && !_j622 && _j665) {
_j173();
}
if (_j665) {
_j174();
if (_j621 == 1) {
frameRate(10);
}
}
if (_j621 == 0) {
frameRate(60);
}
_j137();
if (_j700) {
_j700 = false;
const _j795 = drawingSeed;
randomSeed(_j701);
noiseSeed(_j701);
let scanBounds = pendingBugBounds ? {
...pendingBugBounds
} : null;
if (!scanBounds) {
if (typeof _j564 !== 'undefined' && _j564.length > 0) {
const lastStroke = _j564[_j564.length - 1];
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
_j18(_j606, scanBounds);
}
randomSeed(_j795);
noiseSeed(_j795);
_j701 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j796 = window.pendingEffectControlScanQueue.shift();
if (_j796 && typeof _j18 === 'function') {
let scanBounds = _j796.scanBounds;
const action = _j796.action;
const shapeType = _j796.shapeType;
const bugsSize = _j796.bugsSize !== undefined ? _j796.bugsSize : 10.0;
const scanSeed = _j796.scanSeed;
const recordedRandomCount = _j796.recordedRandomCount;
const targetPoints = _j796.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j797 = document.getElementById('bugs-size');
const _j798 = document.getElementById('bugs-size-value');
if (_j797 && _j798) {
_j797.value = bugsSize;
_j798.textContent = bugsSize;
}
window._scanProcessedPlaybackCount = (window._scanProcessedPlaybackCount || 0) + 1;
}
if (action === 'scan-current' && !scanBounds) {
if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
scanBounds = {
...pendingBugBounds
};
} else if (typeof _j564 !== 'undefined' && _j564.length > 0) {
const lastStroke = _j564[_j564.length - 1];
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
const _j799 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j606, scanBounds, shapeType, targetPoints);
if (_j799) {
randomSeed(_j799);
noiseSeed(_j799);
}
if (typeof window !== 'undefined') {
_j109('playback', '🔁 Effect Control: Scan (processed)', {
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
if (_j622) {
return;
}
if (_j550) {
return;
}
if (_j540) {
if (_j542 === 'rect') {
_j543 = { x1: mouseX - 10, y1: mouseY - 10 };
} else if (_j542 === 'polygon') {
_j544.push({ x: mouseX - 10, y: mouseY - 10 });
if (typeof _j90 === 'function') _j90();
}
return false;
}
_j529 = _j176(mouseX);
_j530 = _j176(mouseY);
pmouseX = mouseX;
pmouseY = mouseY;
const _j800 = 300;
if (_j529 < -_j800 || _j529 > width + _j800 ||
_j530 < -_j800 || _j530 > height + _j800) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j614) {
_j618++;
}
if (_j614) {
console.log(`🎬 錄製開始 [第 ${_j618} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j38();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j109('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j529.toFixed(0)}, ${_j530.toFixed(0)})`
});
_j641++;
_j558 = _j556;
_j502 = 0;
_j556 = 0;
if (_j538 && _j549 !== null) {
baseBrushSize = _j549;
}
if (typeof _j1034 !== 'undefined') {
_j1034 = [];
}
if (typeof _j1035 !== 'undefined') {
_j1035 = 0;
}
_j503 = crandom.random(0.5, 0.99);
_j504 = crandom.random(-0.02, 0.02);
_j505 = crandom.random(-0.05, 0.05);
_j506 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j176(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j176(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j176(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j801 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j802 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j614) {
if (_j620) {
if (_j615 === 0) {
_j615 = millis();
_j109('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j803 = millis() - _j617;
if (_j803 > 0) {
_j619 += _j803;
_j109('recording', '⏸️ Skip interval', {
Interval: `${_j803.toFixed(0)}ms`,
Accumulated: `${_j619.toFixed(0)}ms`
});
}
}
_j620 = false;
} else {
const _j803 = millis() - _j617;
_j619 += _j803;
_j109('recording', '⏸️ Skip interval', {
Interval: `${_j803.toFixed(0)}ms`,
Accumulated: `${_j619.toFixed(0)}ms`
});
}
_j616 = {
strokeSeed: strokeSeed,
mouseCountStart: _j558,
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
whiteMaxOpacity: _j176(_j503),
hueShift: _j176(_j504),
satShift: _j176(_j505),
briShift: _j176(_j506),
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
maskData: _j545 || undefined
};
}
if (_j562 === 1) {
pathRotation = 0;
} else if (_j562 === 2) {
pathRotation = _j176(crandom.random(5, 10));
} else if (_j562 === 3) {
pathRotation = _j176(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j176(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j507 = 15;
_j563 = 5;
_j509 = 0.6;
_j510 = 0.5;
} else if (brushMode === 2) {
initialSize = _j176(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j507 = 10;
_j563 = 10;
_j509 = 0.3;
_j510 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j563 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j563 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j529 * 1, _j530 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j509 = 0.6;
_j510 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j563 = 1;
randStep = 0.05;
maxUpdates = 10;
_j507 = 10;
_j509 = 0.6;
_j510 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j563 = 1;
randStep = 0.05;
maxUpdates = 10;
_j507 = 10;
_j509 = 0.6;
_j510 = 0.5;
} else {
initialSize = crandom.random(30, 40);
maxUpdates = 10;
randStep = 0.05;
}
if (useSharpen >= 3.5) {
maxUpdates = 20;
_j109('system', '⚡️ Ink Effect G active, maxUpdates set to 5', {
Status: 'Performance Optimization'
});
}
if (brushMode == 4) {
expectedStrokeLength = 400;
} else {
expectedStrokeLength = 400;
}
if (_j614 && _j616) {
_j616.initialSize = initialSize;
_j616.spraySize = spraySize;
_j616.step = _j507;
_j616.step2 = _j563;
_j616.randStep = randStep;
_j616.maxUpdates = maxUpdates;
_j616.pathRotation = pathRotation;
_j616.spring = _j509;
_j616.friction = _j510;
_j616.baseBrushSize = baseBrushSize;
_j616.expectedStrokeLength = expectedStrokeLength;
_j616.effect3Brightness = _j176(effect3Brightness);
}
_j517 = initialSize;
_j511 = _j517;
_j515 = _j511;
_j533 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j538 && _j549 === null) _j549 = baseBrushSize;
_j528 = 0;
x = _j529;
y = _j530;
_j512 = 0;
_j513 = 0;
_j514 = 0;
_j525 = 0;
_j519 = 0;
if (typeof _j59 !== 'undefined') {
_j59.lastAngle = 0;
_j59.lastMovementAngle = 0;
}
if (typeof _j61 === 'function') {
_j61();
}
if (typeof _j63 !== 'undefined') {
_j63.lastAngle = 0;
_j63.lastMovementAngle = 0;
}
_j526 = _j529;
_j527 = _j530;
_j534 = true;
_j535 = false;
_j555 = 0;
_j557 = 0;
_j536 = true;
_j537 = false;
startX = _j529;
startY = _j530;
pathPoints = [{
x: _j529,
y: _j530
}];
_j561 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j614 && _j616) {
_j616.mouseX = _j529;
_j616.mouseY = _j530;
_j616.drawingSeed = drawingSeed;
_j616.brushModeSP = brushModeSP;
if (_j538 && _j547) _j616.hasPressure = true;
_j616.forceMapParams = {
randomSeed1: _j176(_j594[0]),
randomSeed2: _j176(_j594[1]),
randomSeed3: _j176(_j594[2]),
randomSeed4: _j176(_j594[3]),
scale1: _j176(_j595[0]),
scale2: _j176(_j595[1]),
scale3: _j176(_j595[2]),
amplitude1: _j176(_j596[0]),
amplitude2: _j176(_j596[1]),
amplitude3: _j176(_j596[2]),
phase1: _j176(_j597[0]),
phase2: _j176(_j597[1]),
phase3: _j176(_j597[2]),
vortexScale1: _j176(_j598[0]),
vortexScale2: _j176(_j598[1]),
clusterScale1: _j176(_j599[0]),
clusterScale2: _j176(_j599[1])
};
const _j804 = (brushMode === 3) ? _j529 : Math.round(_j529);
const _j805 = (brushMode === 3) ? _j530 : Math.round(_j530);
_j177("mp", {
x: _j804,
y: _j805,
strokeData: _j616
});
}
}
function mouseReleased() {
if (_j622) {
return;
}
if (_j540 && _j542 === 'rect' && _j543 && _j543.x1 !== undefined) {
const mx = mouseX - 10, my = mouseY - 10;
const x1 = Math.min(_j543.x1, mx);
const y1 = Math.min(_j543.y1, my);
const x2 = Math.max(_j543.x1, mx);
const y2 = Math.max(_j543.y1, my);
if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
_j543 = { x1: x1, y1: y1, x2: x2, y2: y2 };
drawMaskRect(x1, y1, x2, y2);
_j545 = { action: "rect", x1: x1, y1: y1, x2: x2, y2: y2 };
_j540 = false;
const toggle = document.getElementById('mask-mode-toggle');
if (toggle) toggle.checked = false;
if (typeof _j90 === 'function') _j90();
}
return;
}
if (!_j534) {
return;
}
if (_j553) {
_j554.push({ stroke: true, t: millis() });
}
const _j806 = crandom.getCount();
const _j807 = _j529;
const _j808 = _j530;
const _j809 = Math.round(constrain(_j807, 0, width));
const _j810 = Math.round(constrain(_j808, 0, height));
_j177("mr", {
x: _j809,
y: _j810
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j811 = randomCount - _j806;
const _j812 = window.drawLoopCount || 0;
const _j813 = window.recordedMouseDraggedCount || 0;
if (_j614) {
console.log(`   Draw: ${_j812} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j614) {
crandomDebugger.saveStroke('recording', _j618);
}
if (_j614) {
_j617 = millis();
_j109('recording', 'Stroke ended', {
FinalSize: _j517.toFixed(2),
CountdownStatus: _j535 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j529 < 0 || _j529 >= width || _j530 < 0 || _j530 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j1034 !== 'undefined' && _j1034.length > 0) {
_j1034 = _j1034.filter(_j1510 => _j1510.radius > 0);
}
if (!_j535) {
_j535 = true;
_j555 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j117();
return;
}
if (key === 'f' || key === 'F') {
if (_j665) {
_j173();
} else {
_j172();
}
return;
}
if (key === ' ') {
_j162();
console.clear();
let _j814 = _j225.length;
_j225 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j109('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j814} 个`
});
return false;
}
}
function _j36() {
const _j453 = doMoving && _j637 && _j636 !== null && _j622 && _j638;
const _j815 = (_j622 && _j453) || (!_j622 && (_j654 || _j658[0] !== 0 || _j658[40] !== 0 || _j658[80] !== 0 || _j658[120] !== 0));
if (_j815) {
if (!_j654) {
_j654 = true;
_j655 = millis();
_j656[0] = _j658[0];
_j656[40] = _j658[40];
_j656[80] = _j658[80];
_j656[120] = _j658[120];
}
const _j420 = millis() - _j655;
const _j421 = Math.min(_j420 / _j653, 1.0);
const _j816 = _j622 ? _j657 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j658[0] = lerp(_j656[0], _j816[0], _j421);
_j658[40] = lerp(_j656[40], _j816[40], _j421);
_j658[80] = lerp(_j656[80], _j816[80], _j421);
_j658[120] = lerp(_j656[120], _j816[120], _j421);
if (_j421 >= 1.0) {
_j658[0] = _j816[0];
_j658[40] = _j816[40];
_j658[80] = _j816[80];
_j658[120] = _j816[120];
if (!_j622) {
_j654 = false;
}
}
} else if (!_j622 && !_j654) {
_j658[0] = 0;
_j658[40] = 0;
_j658[80] = 0;
_j658[120] = 0;
}
}
function updateBlurEffect() {
const _j453 = doMoving && _j637 && _j636 !== null && _j622 && _j638;
const _j817 = _j622;
const _j818 = _j817 ? _j630 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j534));
const _j819 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j818 : (_j818 && _j517 > 0);
if (!doMoving) {
_j660[0] = 0;
_j660[40] = 0;
_j660[80] = 0;
_j660[120] = 0;
return;
}
if (_j817) {
if (_j664) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j659[0] = _j176(max(0, crandom.random(-5, 5)));
_j659[40] = _j176(max(0, crandom.random(-5, 5)));
_j659[80] = _j176(max(0, crandom.random(-5, 5)));
_j659[120] = _j176(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j661 = millis();
_j664 = false;
}
_j663 = _j818;
} else {
_j663 = false;
_j664 = false;
}
let _j820 = 0;
if (_j817) {
if (_j819) {
const _j420 = millis() - _j661;
const _j421 = min(1.0, _j420 / _j662);
_j820 = _j421;
} else if (_j535) {
const _j821 = map(_j555, 0, maxUpdates, 1.0, 0.0);
_j820 = _j821;
} else {
_j820 = 0;
}
if (_j453 && _j636 !== null) {
const _j417 = _j636.getDistance();
const _j413 = PI / 3;
const _j432 = height / (2 * tan(_j413 / 2));
const _j433 = 1.1;
const _j434 = 1.4;
const _j436 = _j432 / _j417;
const _j822 = _j434 - _j433;
const _j823 = (_j436 - _j433) / _j822;
const _j824 = constrain(_j823, 0.0, 1.0);
const _j825 = pow(_j824, 0.5);
_j820 = _j820 * _j825;
}
}
_j660[0] = _j659[0] * _j820;
_j660[40] = _j659[40] * _j820;
_j660[80] = _j659[80] * _j820;
_j660[120] = _j659[120] * _j820;
}
function drawLayersWithBlur() {
const _j453 = doMoving && _j637 && _j636 !== null && _j622 && _j638;
const _j482 = (typeof _j541 !== 'undefined' && _j541) ||
(typeof _j540 !== 'undefined' && _j540);
const _j479 = ((_j534 || _j535) && _j555 < maxUpdates && _j561) || _j482;
const _j826 = _j225.length > 0 && typeof _j21 === 'function';
const _j827 = false;
const _j828 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j499 && _j493;
if (_j494 && _j493) {
_j167();
}
_j604.begin();
clear();
if (_j828) {
let _j829 = _j606;
if (_j826) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j606, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j611, window.tempMetallicBuffer);
_j829 = _j611;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j499);
_j499.setUniform("rect", [0, 0, width * _j492, height * _j492]);
_j499.setUniform("tex0", _j829);
_j499.setUniform("forceMap", _j493);
_j499.setUniform("time", millis() * 0.005);
_j499.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j499.setUniform("distortEnabled", 1.0);
_j499.setUniform("displacementB", distortDisplacementB);
_j499.setUniform("displacementC", distortDisplacementC);
_j499.setUniform("showFbmMask", distortShowFbmMask);
_j499.setUniform("fbmSeed1", _j594[0] || 100);
_j499.setUniform("fbmSeed2", _j594[1] || 200);
_j499.setUniform("fbmSeed3", _j594[2] || 300);
_j499.setUniform("fbmSeed4", _j594[3] || 400);
} else {
_j499.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j499.setUniform("rsEnabled", 1.0);
_j499.setUniform("rsFrequency", _j569);
_j499.setUniform("rsWaveSpeed", _j570);
_j499.setUniform("rsStrength", _j571);
_j499.setUniform("rsGradientMix", _j572);
_j499.setUniform("rsScale", _j573);
} else {
_j499.setUniform("rsEnabled", 0.0);
}
_j499.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j499.setUniform("cellularScale", _j574);
_j499.setUniform("cellularSeed", _j575);
_j499.setUniform("whiteDotDensity", whiteDotEnabled ? _j576 : 0.0);
_j499.setUniform("grainAmount", grainEnabled ? _j577 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j606, 0, 0, width, height);
if (_j826) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j604, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j611, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j611, 0, 0, width, height);
}
}
_j604.end();
if (_j585 && _j586) {
const data = _j586;
const bounds = data.bounds;
const _j830 = {
rect: [0, 0, width * _j492, height * _j492],
blendType: data.blendType,
blendVol: _j592.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j592.pixD,
blendA: _j592.blendA,
blendB: _j592.blendB,
directVol: _j592.directVol,
snoiseVol: _j592.snoiseVol,
gobalStyle: _j592.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j592.colorDeep,
whiteDot: _j592.whiteDot,
doBigShape: _j592.doBigShape,
doMask: _j592.doMask,
multiDir: _j592.multiDir,
drawTime: _j592.drawTime,
seed: _j592.seed,
iTime: millis() * 0.001
};
if (_j613 && _j501) {
_j607.begin();
clear();
shader(_j501);
for (const [key, val] of Object.entries(_j830)) {
_j501.setUniform(key, val);
}
_j501.setUniform('tex0', _j613);
_j501.setUniform('lastStrokeTex', _j612);
_j501.setUniform('lastStrokeOnly', _j593 ? 1 : 0);
_j501.setUniform('isTypeMapMode', 1);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j607.end();
_j613.begin();
clear();
background(0);
imageMode(CENTER);
image(_j607, 0, 0, width, height);
_j613.end();
}
if (_j501) {
_j606.begin();
clear();
imageMode(CENTER);
image(_j600, 0, 0, width, height);
_j606.end();
_j600.begin();
shader(_j501);
for (const [key, val] of Object.entries(_j830)) {
_j501.setUniform(key, val);
}
_j501.setUniform('tex0', _j606);
_j501.setUniform('lastStrokeTex', _j612);
_j501.setUniform('lastStrokeOnly', _j593 ? 1 : 0);
_j501.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j600.end();
}
if (_j501) {
_j606.begin();
clear();
imageMode(CENTER);
image(_j602, 0, 0, width, height);
_j606.end();
_j602.begin();
shader(_j501);
for (const [key, val] of Object.entries(_j830)) {
_j501.setUniform(key, val);
}
_j501.setUniform('tex0', _j606);
_j501.setUniform('lastStrokeTex', _j612);
_j501.setUniform('lastStrokeOnly', _j593 ? 1 : 0);
_j501.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j602.end();
}
if (_j501) {
_j606.begin();
clear();
imageMode(CENTER);
image(_j604, 0, 0, width, height);
_j606.end();
_j604.begin();
shader(_j501);
for (const [key, val] of Object.entries(_j830)) {
_j501.setUniform(key, val);
}
_j501.setUniform('tex0', _j606);
_j501.setUniform('lastStrokeTex', _j612);
_j501.setUniform('lastStrokeOnly', _j593 ? 1 : 0);
_j501.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j604.end();
}
_j585 = false;
_j586 = null;
_j552 = true;
}
if (_j579 && _j501 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
_j607.begin();
clear();
imageMode(CENTER);
image(_j604, 0, 0, width, height);
_j607.end();
_j604.begin();
shader(_j501);
_j501.setUniform('rect', [0, 0, width * _j492, height * _j492]);
_j501.setUniform('tex0', _j607);
_j501.setUniform('lastStrokeTex', _j612);
_j501.setUniform('lastStrokeOnly', _j593 ? 1 : 0);
_j501.setUniform('blendType', _j580);
_j501.setUniform('blendVol', _j592.blendVol * (1 + _j582 * 0.1));
_j501.setUniform('radSeed', _j584 * 0.001);
_j501.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j501.setUniform('pixD', _j592.pixD);
_j501.setUniform('blendA', _j592.blendA);
_j501.setUniform('blendB', _j592.blendB);
_j501.setUniform('directVol', _j592.directVol);
_j501.setUniform('snoiseVol', _j592.snoiseVol);
_j501.setUniform('gobalStyle', _j592.gobalStyle);
_j501.setUniform('vline', 5);
_j501.setUniform('hline', 5);
_j501.setUniform('cellT', 1.0);
_j501.setUniform('colorDeep', _j592.colorDeep);
_j501.setUniform('whiteDot', _j592.whiteDot);
_j501.setUniform('doBigShape', _j592.doBigShape);
_j501.setUniform('doMask', _j592.doMask);
_j501.setUniform('multiDir', _j592.multiDir);
_j501.setUniform('drawTime', _j592.drawTime);
_j501.setUniform('seed', _j592.seed);
_j501.setUniform('iTime', millis() * 0.001);
_j501.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j604.end();
}
noStroke();
push();
translate(0, 0, _j658[0]);
image(_j604, -width / 2, -height / 2);
pop();
if (_j479) {
push();
translate(0, 0, _j658[40]);
image(_j608, -width / 2, -height / 2);
pop();
}
if (_j622) {
if (showFuturePathPreview) {
_j40();
} else {
_j605.clear();
}
push();
translate(0, 0, _j658[80]);
image(_j605, -width / 2, -height / 2);
pop();
}
if (screenText && _j670) {
_j41();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j601.clear();
_j601.push();
_j43();
_j42();
_j601.pop();
} else {
_j601.clear();
_j601.push();
_j42();
_j601.pop();
}
const _j831 = (screenText && _j670) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof _j564 !== 'undefined' && Array.isArray(_j564) && _j564.length > 0);
if (_j831) {
push();
translate(0, 0, _j658[120]);
image(_j601, -width / 2, -height / 2);
pop();
}
if (_j453) {
pop();
}
}
function drawMaskRect(x1, y1, x2, y2) {
var _j832 = height - y2;
var _j833 = height - y1;
push();
_j539.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
rectMode(CORNER);
rect(x1, _j832, x2 - x1, _j833 - _j832);
_j539.end();
pop();
_j541 = true;
}
function drawMaskPolygon(points) {
if (points.length < 3) return;
push();
_j539.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
beginShape();
for (let p of points) {
vertex(p.x, height - p.y);
}
endShape(CLOSE);
_j539.end();
pop();
_j541 = true;
}
function clearMask() {
push();
_j539.begin();
background(255);
_j539.end();
pop();
_j541 = false;
_j544 = [];
_j543 = null;
}
function testMaskRect() {
const cx = width / 2;
const cy = height / 2;
const size = 100;
const x1 = cx - size / 2;
const y1 = cy - size / 2;
_j543 = { x1: x1, y1: y1, x2: x1 + size, y2: y1 + size };
drawMaskRect(x1, y1, x1 + size, y1 + size);
console.log('[Mask] Test rect drawn at center:', x1, y1, size, 'x', size);
}
window.testMaskRect = testMaskRect;
window.clearMask = clearMask;
window.drawMaskRect = drawMaskRect;
window.drawMaskPolygon = drawMaskPolygon;
function _j37() {
_j612.begin();
clear();
background(255);
imageMode(CENTER);
image(_j603, 0, 0);
_j612.end();
_j606.begin();
clear();
shader(_j497);
const _j467 = brushColorMode === 1 ? 1.0 : 0.0;
_j497.setUniform("rect", [0, 0, width * _j492, height * _j492]);
_j497.setUniform("baseTex", _j602);
_j497.setUniform("strokeTex", _j603);
_j497.setUniform("brushColorMode", float(brushColorMode));
_j497.setUniform("brushCategory", _j467);
_j497.setUniform("whiteMaxOpacity", _j503);
_j497.setUniform("hueShift", _j504);
_j497.setUniform("satShift", _j505);
_j497.setUniform("briShift", _j506);
_j497.setUniform("keyBlendMode", keyBlendMode);
_j497.setUniform("useSharpen", useSharpen);
_j497.setUniform("typeMapTex", _j613);
const _j834 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j497.setUniform("canvasBackgroundColor", _j834);
const _j835 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j497.setUniform("customBrushColor", _j835);
_j497.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
_j497.setUniform("useMask", _j541 ? 1.0 : 0.0);
if (_j541) _j497.setUniform("maskTex", _j539);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j606.end();
if (_j500 && _j613) {
_j607.begin();
clear();
imageMode(CENTER);
image(_j606, 0, 0);
_j607.end();
_j606.begin();
clear();
shader(_j500);
_j500.setUniform("rect", [0, 0, width * _j492, height * _j492]);
_j500.setUniform("baseTex", _j613);
_j500.setUniform("strokeTex", _j603);
_j500.setUniform("brushCategory", _j467);
_j500.setUniform("whiteMaxOpacity", _j503);
_j500.setUniform("useMask", _j541 ? 1.0 : 0.0);
if (_j541) _j500.setUniform("maskTex", _j539);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j606.end();
_j613.begin();
clear();
background(0);
imageMode(CENTER);
image(_j606, 0, 0, width, height);
_j613.end();
_j606.begin();
clear();
imageMode(CENTER);
image(_j607, 0, 0);
_j606.end();
}
_j602.begin();
clear();
background(255);
imageMode(CENTER);
image(_j606, 0, 0);
_j602.end();
_j600.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(_j603, 0, 0);
blendMode(BLEND);
_j600.end();
if (_j551 && _j561 && pathPoints.length > 1) {
_j24(_j600);
} else {}
if (typeof gridCommitPrev === 'function') {
try {
gridCommitPrev();
} catch (e) {}
}
_j603.begin();
clear();
background(255, 255, 255);
_j603.end();
_j534 = false;
_j535 = false;
_j555 = 0;
_j536 = false;
_j537 = true;
let _j836 = null;
if (pathPoints.length > 0) {
let _j837 = 0,
_j838 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j837 += pt.x;
_j838 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j355 = _j837 / pathPoints.length;
const _j356 = _j838 / pathPoints.length;
_j560 = {
minX,
maxX,
minY,
maxY,
_j355,
_j356,
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
_j564.push({
points: [...pathPoints],
center: {
x: _j355,
y: _j356
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
_j565++;
if (_j564.length > _j566) {
_j564.shift();
}
_j836 = {
minX: _j560.minX,
maxX: _j560.maxX,
minY: _j560.minY,
maxY: _j560.maxY
};
}
pathPoints = [];
_j561 = false;
_j560 = null;
const _j839 = drawingSeed;
let _j840 = _j836;
if (!_j840 && _j564.length > 0) {
const lastStroke = _j564[_j564.length - 1];
if (lastStroke.bounds) {
_j840 = {
...lastStroke.bounds
};
}
}
if (_j840) {
pendingBugBounds = _j840;
} else {
if (_j564.length > 0) {
const lastStroke = _j564[_j564.length - 1];
if (lastStroke.bounds) {
pendingBugBounds = {
...lastStroke.bounds
};
}
}
}
if (_j559 && _j622) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j841 = false;
if (_j622 && recordingData && recordingData.events) {
let _j842 = 0;
for (let e of recordingData.events) {
const _j851 = e.m || e.type;
if (_j851 === 'mr' || _j851 === 'mouseReleased') {
_j842++;
}
}
const _j843 = _j565;
const _j844 = _j843 >= (_j842 - 12);
_j841 = _j844;
if (_j841) {
const _j845 = crandom.random(0, 1) > 0.1;
if (_j845) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j840 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j840;
}
}
}
} else if (!_j622) {
_j841 = true;
}
if (_j841) {
_j700 = true;
_j701 = strokeSeed;
if (!_j622 && _j840 && !pendingBugBounds) {
pendingBugBounds = _j840;
}
} else {
if (_j840 && !pendingBugBounds) {
pendingBugBounds = _j840;
}
}
randomSeed(_j839);
noiseSeed(_j839);
}
if (typeof gc !== 'undefined') {
gc();
}
_j552 = true;
}
function _j38() {
if (_j536 && !_j537) {
if (_j534 || _j535) {
_j37();
}
}
}
function _j39() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j846 = [];
const _j847 = 20;
let _j848 = _j624;
let _j843 = null;
const offsetX = typeof _j634 !== 'undefined' ? _j634 : 0;
const offsetY = typeof _j635 !== 'undefined' ? _j635 : 0;
const _j849 = 500;
let _j850 = 0;
while (_j846.length < _j847 && _j848 < recordingData.events.length && _j850 < _j849) {
const event = recordingData.events[_j848];
const _j851 = event.m || event.type;
if (_j851 === 'mp' || _j851 === 'mousePressed') {
_j843 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j848,
data: event.strokeData || event.d || {}
};
} else if ((_j851 === 'md' || _j851 === 'mouseDragged') && _j843) {
_j843.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j851 === 'mr' || _j851 === 'mouseReleased') && _j843) {
_j843.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j846.push(_j843);
_j843 = null;
}
_j848++;
_j850++;
}
return _j846;
}
function _j40() {
if (!_j622 || !recordingData.events || recordingData.events.length === 0) {
_j605.clear();
return;
}
const now = millis();
const _j852 =
_j568.lastEventIndex !== _j624 ||
(now - _j568.lastUpdateTime) > _j568.updateInterval;
if (_j852) {
_j568.cachedStrokes = _j39();
_j568.lastEventIndex = _j624;
_j568.lastUpdateTime = now;
}
const _j846 = _j568.cachedStrokes;
_j605.clear();
if (_j846.length === 0) {
return;
}
_j605.push();
const time = millis() * 0.003;
for (let i = 0; i < _j846.length; i++) {
const _j853 = _j846[i];
const path = _j853.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j846.length - 1, 200, 80);
const _j854 = sin(time + i * 0.8) * 0.3 + 1;
const _j855 = _j853.eventIndex * 0.1;
const _j856 = 20;
const _j857 = min(max(floor(path.length / 5), 2), _j856);
const _j858 = [];
for (let s = 0; s < _j857; s++) {
const t = s / (_j857 - 1);
const _j299 = t * (path.length - 1);
const _j859 = floor(_j299);
const _j860 = min(_j859 + 1, path.length - 1);
const _j861 = _j299 - _j859;
const x1 = path[_j859].x;
const y1 = path[_j859].y;
const x2 = path[_j860].x;
const y2 = path[_j860].y;
const t1 = path[_j859].t || 0;
const t2 = path[_j860].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j858.push({
x: lerp(x1, x2, _j861),
y: lerp(y1, y2, _j861),
t: lerp(t1, t2, _j861)
});
}
const _j862 = [];
let _j863 = 0.01;
for (let j = 1; j < _j858.length; j++) {
const dx = _j858[j].x - _j858[j-1].x;
const dy = _j858[j].y - _j858[j-1].y;
const dt = _j858[j].t - _j858[j-1].t;
const _j864 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j862.push(_j864);
if (_j864 > _j863) _j863 = _j864;
}
_j605.noFill();
_j605.strokeCap(ROUND);
for (let j = 1; j < _j858.length; j++) {
const _j782 = constrain(_j862[j-1] / _j863, 0, 1);
const r = Math.round(_j782 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j782 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j782) * 255);
_j605.stroke(r, g, b, 160);
_j605.strokeWeight(1.0);
_j605.line(
_j858[j-1].x, _j858[j-1].y,
_j858[j].x, _j858[j].y
);
}
let _j865 = 0;
for (let j = 0; j < _j858.length - 1; j++) {
_j865 += dist(_j858[j].x, _j858[j].y, _j858[j + 1].x, _j858[j + 1].y);
}
if (isNaN(_j865) || _j865 <= 0 || _j858.length < 2) {
continue;
}
const _j866 = constrain(floor(_j865 / 150), 1, 3);
for (let a = 0; a < _j866; a++) {
_j605.push();
const _j867 = (time * 0.1 + _j855 + a * (1.0 / _j866)) % 1.0;
const _j868 = _j867 * _j865;
let _j869 = 0;
let _j870 = _j858[0].x;
let _j871 = _j858[0].y;
let angle = 0;
for (let j = 0; j < _j858.length - 1; j++) {
const _j872 = dist(_j858[j].x, _j858[j].y, _j858[j + 1].x, _j858[j + 1].y);
if (_j872 <= 0.0001) {
_j870 = _j858[j + 1].x;
_j871 = _j858[j + 1].y;
if (j + 1 < _j858.length - 1) {
angle = atan2(_j858[j + 2].y - _j858[j + 1].y, _j858[j + 2].x - _j858[j + 1].x);
} else {
angle = atan2(_j858[j + 1].y - _j858[j].y, _j858[j + 1].x - _j858[j].x);
}
break;
}
if (_j869 + _j872 >= _j868) {
const _j861 = (_j868 - _j869) / _j872;
const _j873 = isNaN(_j861) || !isFinite(_j861) ? 0 : constrain(_j861, 0, 1);
_j870 = lerp(_j858[j].x, _j858[j + 1].x, _j873);
_j871 = lerp(_j858[j].y, _j858[j + 1].y, _j873);
angle = atan2(_j858[j + 1].y - _j858[j].y, _j858[j + 1].x - _j858[j].x);
break;
}
_j869 += _j872;
}
const _j874 = 200 * (1 - _j867 * 0.5);
_j605.translate(_j870, _j871);
_j605.rotate(angle);
const _j875 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j605.fill(0, 0, 255, _j874);
_j605.noStroke();
_j605.triangle(
0, 0,
-4 * _j875, -2 * _j875,
-4 * _j875, 2 * _j875
);
_j605.stroke(0, 150, 255, _j874);
_j605.strokeWeight(0.3);
_j605.noFill();
_j605.triangle(
0, 0,
-4 * _j875, -2 * _j875,
-4 * _j875, 2 * _j875
);
_j605.pop();
}
const _j876 = path[0];
const _j399 = path[path.length - 1];
_j605.noFill();
_j605.stroke(0, 0, 255, 150);
_j605.strokeWeight(0.8);
_j605.ellipse(_j876.x, _j876.y, 5, 5);
_j605.ellipse(_j399.x, _j399.y, 5, 5);
_j605.noStroke();
_j605.fill(0, 0, 255, 255);
_j605.ellipse(_j876.x, _j876.y, 2, 2);
_j605.ellipse(_j399.x, _j399.y, 2, 2);
if (font) {
_j605.textFont(font);
_j605.noStroke();
const data = _j853.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j877 = _j876.x - 2;
const _j878 = _j876.y + 8;
_j605.textSize(6);
_j605.fill(0, 0, 255, 255);
_j605.textAlign(LEFT, CENTER);
_j605.text('#' + (i + 1), _j877, _j878);
}
}
_j605.pop();
}
function _j41() {
_j601.clear();
_j601.push();
_j601.noFill();
_j601.noStroke();
_j601.rectMode(CENTER);
let _j782 = (width * 0.05) / height;
_j601.rect(0, 0, width * 0.95, height * (1 - _j782));
_j601.translate(-width / 2 - 5, -height / 2 + 20);
_j601.textAlign(LEFT, TOP);
if (font) {
_j601.textFont(font);
}
_j601.textSize(6);
let _j879 = width - 50;
_j601.fill(0, 0, 0, 100);
_j601.noStroke();
let _j880 = [];
let _j265 = _j696;
let _j881 = Math.max(0, _j692.length - _j693 - _j694);
let _j882 = _j692.length;
for (let i = _j881; i < _j882; i++) {
let line = _j692[i];
let _j883 = _j44(line.text, _j879, _j601);
for (let j = 0; j < _j883.length; j++) {
if (_j880.length >= _j693) break;
_j880.push({
type: line.type,
text: _j883[j],
timestamp: line.timestamp
});
}
if (_j880.length >= _j693) break;
}
for (let i = 0; i < _j880.length; i++) {
let line = _j880[i];
let y = _j696 + i * _j697;
if (line.type === 'recording') {
_j601.fill(255, 0, 0, _j698);
} else if (line.type === 'playback') {
_j601.fill(0, _j698);
} else if (line.type === 'system') {
_j601.fill(0, 0, 255, _j698);
} else if (line.type === 'art') {
_j601.fill(0, _j698);
} else {
_j601.fill(0, _j698);
}
_j601.text("--", _j695, y);
_j601.text(line.text, _j695, y);
}
_j43();
_j601.pop();
_j42();
}
function _j42() {
if (window.showStrokeDivider === false) return;
const strokeCount = (typeof _j564 !== 'undefined' && Array.isArray(_j564)) ?
_j564.length :
0;
if (strokeCount === 0) return;
_j601.push();
_j601.resetMatrix();
_j601.translate(0, 0);
const _j884 = hh - 15;
const _j885 = width * 0.98;
const _j886 = -_j885 / 2;
const _j887 = _j885 / 2;
const _j888 = _j887 - _j886;
_j601.stroke(0, 50);
_j601.strokeWeight(1);
_j601.noFill();
_j601.line(_j886, _j884, _j887, _j884);
_j601.strokeWeight(1.2);
_j601.line(_j886, _j884 + 5, _j886, _j884 - 5);
_j601.line(_j887, _j884 + 5, _j887, _j884 - 5);
if (strokeCount > 0) {
const _j889 = _j888 / strokeCount;
_j601.stroke(0, 70);
_j601.strokeWeight(0.7);
for (let i = 1; i < strokeCount; i++) {
const x = _j886 + i * _j889;
_j601.line(x, _j884 - 5, x, _j884);
}
if (font) _j601.textFont(font);
_j601.textAlign(CENTER, CENTER);
_j601.textSize(10);
_j601.fill(0, 50);
_j601.noStroke();
const _j877 = _j887;
const _j878 = _j884 - 15;
_j601.text(strokeCount.toString(), _j877, _j878);
}
_j601.pop();
}
function _j43() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j890 = millis();
const _j420 = _j890 - currentStrokeHighlight.startTime;
const _j891 = 1000;
const _j892 = _j891 * 0.5;
if (_j420 < _j891) {
let alpha = 255;
if (_j420 > _j892) {
const _j893 = (_j420 - _j892) / (_j891 - _j892);
alpha = 255 * (1 - _j893);
}
const gp = currentStrokeHighlight.gridParams;
_j601.push();
_j601.resetMatrix();
_j601.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j391 = 5;
const _j392 = 5;
_j601.stroke(255, 0, 0, alpha);
_j601.strokeWeight(1);
_j601.noFill();
let _j894 = true;
let _j869 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j393 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j393;
let dy = (y2 - y1) / _j393;
let _j394 = 0;
while (_j394 < _j393) {
let _j395 = _j894 ? _j391 : _j392;
let _j396 = min(_j395 - _j869, _j393 - _j394);
if (_j894) {
let startX = x1 + dx * _j394;
let startY = y1 + dy * _j394;
let _j397 = x1 + dx * (_j394 + _j396);
let _j398 = y1 + dy * (_j394 + _j396);
_j601.line(startX, startY, _j397, _j398);
}
_j394 += _j396;
_j869 += _j396;
if (_j869 >= (_j894 ? _j391 : _j392)) {
_j894 = !_j894;
_j869 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j876 = currentStrokeHighlight.points[0];
const _j399 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j601.fill(255, 0, 0, alpha);
_j601.noStroke();
_j601.ellipse(_j876.x, _j876.y, 5, 5);
_j601.fill(255, 0, 0, alpha);
_j601.ellipse(_j399.x, _j399.y, 5, 5);
}
}
const _j355 = (gp.left + gp.right) / 2;
const _j356 = (gp.top + gp.bottom) / 2;
_j601.stroke(0, 0, 200, alpha);
_j601.strokeWeight(1.0);
_j601.noFill();
_j601.rectMode(CORNER);
_j601.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j601.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j44(text, _j1489, _j1479 = null) {
let _j895 = text.split(' ');
let _j757 = [];
let _j896 = '';
for (let i = 0; i < _j895.length; i++) {
let _j897 = _j896 + (_j896 ? ' ' : '') + _j895[i];
let _j898 = _j1479 ? _j1479.textWidth(_j897) : textWidth(_j897);
if (_j898 > _j1489 && _j896) {
_j757.push(_j896);
_j896 = _j895[i];
} else {
_j896 = _j897;
}
}
if (_j896) {
_j757.push(_j896);
}
return _j757;
}
function _j45() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.style.width = (width * 1.0) + 'px';
referenceContainer.style.height = (height * 1.0) + 'px';
_j109('system', 'Reference image size updated', {
Width: (width * 0.8) + 'px',
Height: (height * 0.8) + 'px'
});
}
}
function touchStarted(e) {
if (e && e.touches && e.touches.length > 0) {
var t = e.touches[0];
if (_j46(t.clientX, t.clientY)) {
_j550 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j529 = _j176(mouseX);
_j530 = _j176(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j550) return true;
if (_j540) return true;
_j529 = _j176(mouseX);
_j530 = _j176(mouseY);
return false;
}
function touchEnded() {
if (_j550) {
_j550 = false;
return true;
}
_j550 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j46(clientX, clientY) {
const _j899 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('mask-panel'),
document.getElementById('zen-mode-btn')
];
for (let panel of _j899) {
if (!panel) continue;
const rect = panel.getBoundingClientRect();
if (clientX >= rect.left && clientX <= rect.right &&
clientY >= rect.top && clientY <= rect.bottom) {
return true;
}
}
return false;
}
function _j47() {
if (_j564.length === 0) return null;
const lastStroke = _j564[_j564.length - 1];
if (lastStroke && lastStroke.bounds) {
const _j900 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j900)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j900)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j900)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j900)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j900 = 20;
return {
minX: Math.max(0, (gp.left - _j900)) / width,
minY: Math.max(0, (gp.top - _j900)) / height,
maxX: Math.min(width, (gp.right + _j900)) / width,
maxY: Math.min(height, (gp.bottom + _j900)) / height
};
}
return null;
}
function _j48(blendType, seed = null, _j1490 = false) {
if (!_j501) return;
_j579 = true;
_j580 = blendType;
_j581 = millis();
_j587 = 0;
_j582 = 0;
_j590 = _j1490;
_j584 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j592.seed = _j584 * 0.0001;
}
function _j49() {
if (!_j579) return null;
const duration = millis() - _j581;
const iterations = _j582;
const frames = _j587;
if (iterations > 0 && flowEffectStrokeBounds) {
_j585 = true;
_j586 = {
blendType: _j580,
iterations: iterations,
seed: _j584,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j579 = false;
_j580 = 0;
_j590 = false;
return {
duration,
iterations,
frames
};
}
function _j50() {
if (!_j579) return;
_j587++;
_j582 = Math.floor(_j587 / _j591);
if (_j590 && _j588 > 0) {
if (_j587 >= _j588) {
_j582 = _j589;
const _j901 = document.getElementById('flow-iteration-count');
if (_j901) {
_j901.textContent = _j582;
}
_j49();
_j588 = 0;
_j589 = 0;
return;
}
}
const _j901 = document.getElementById('flow-iteration-count');
if (_j901) {
_j901.textContent = _j582;
}
}
function _j51(blendType, seed, iterations) {
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
_j592.seed = seed * 0.0001;
_j585 = true;
_j586 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j586);
}
const _j902 = [{
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
function _j52(_j1479, _j913, _j914, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j913, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j914, alpha);
}
}
function _j53(_j1479, _j913, _j914, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j913, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j914, alpha);
}
}
function _j54(id, _j1479, _j996, x, y, _j957, _j958, _j950, _j951, _j971, sizeVariation, _j990) {
let _j903 = _j971 * sizeVariation + _j990;
const _j904 = (_j538 && typeof _j549 !== 'undefined' && _j549 !== null) ? _j549 : baseBrushSize;
const _j905 = _j904 < 0.25;
let _j906 = _j905 ? max(2.0, _j904 * 10) : 15;
if (_j903 > _j906) {
_j903 = crandom.random(_j905 ? 0.6 : 1, _j906);
}
let sw = max(_j905 ? 0.6 : 1, _j903);
if (sw < 3) sw *= 2.0;
const offsetX = _j996.offsetX;
const offsetY = _j996.offsetY;
if (brushModeSP) {
const _j907 = max(0.15, min(1.5, _j904));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j908 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j907, 6 * _j907) : crandom.random(-16 * _j907, 16 * _j907);
let _j909 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j907, 6 * _j907) : crandom.random(-16 * _j907, 16 * _j907);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j950,
y + offsetY + _j951,
_j957 + offsetX + _j908,
_j958 + offsetY + _j909
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j950,
y + offsetY + _j951,
_j957 + offsetX,
_j958 + offsetY
);
}
} else if (!brushModeSP) {
if (_j904 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j950,
y + offsetY + _j951,
_j957 + offsetX,
_j958 + offsetY
);
}
}
const _j910 = [{
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
const _j911 = [{
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
const _j912 = [{
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
function _j55(_j1479, _j1491, _j1492) {
if (_j556 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j556, ">=", expectedStrokeLength, ")");
return;
}
_j1479.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j913 = _j58(_j502);
let _j914 = _j58(_j502);
const _j915 = _j622 ? _j628 : pmouseX;
const _j916 = _j622 ? _j629 : pmouseY;
let _j917 = 0.5 * initialSize * noise(_j1491 * 0.01, _j1492 * 0.01) * (abs(_j1491 - _j915) + abs(_j1492 - _j916));
const _j918 = (_j538 && typeof _j549 !== 'undefined' && _j549 !== null) ? _j549 : baseBrushSize;
let _j919 = 0;
_j919 = min(spraySize * _j918, _j917) * map(noise(_j1491, _j1492), 0, 1, 0.3, 1);
let _j920 = max(3, _j919);
if (_j556 < 5) {
let _j921 = map(_j556, 0, 5, -0.2, 1.0);
_j920 = max(2, _j919 * _j921);
} else if (_j556 >= (expectedStrokeLength - 5)) {
let _j922 = map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j920 = max(2, _j919 * _j922);
}
for (let i = 0; i < _j563; i++) {
const _j923 = lerp(_j1491, _j915, i / _j563)
const lerpY = lerp(_j1492, _j916, i / _j563)
for (let j = 0; j < 10; j++) {
let _j908, _j909;
let _j924 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j925 = crandom.random(TWO_PI);
const _j926 = crandom.random();
const _j927 = crandom.random(-_j920 * _j924, _j920 * _j924);
const _j928 = crandom.random(-_j920 * _j924, _j920 * _j924);
if (shapeType === 0) {
const angle = _j925;
const radius = sqrt(_j926) * _j920;
_j908 = radius * cos(angle);
_j909 = radius * sin(angle);
} else if (shapeType === 1) {
_j908 = sin(_j925) * _j927;
_j909 = cos(_j925) * _j928;
} else if (shapeType === 2) {
const u = _j925 / TWO_PI;
const v = _j926;
if (u + v > 1) {
_j908 = _j920 * (1 - u);
_j909 = _j920 * (1 - v);
} else {
_j908 = _j920 * u;
_j909 = _j920 * v;
}
_j908 -= _j920 * 0.5;
_j909 -= _j920 * 0.5;
} else {
const u = _j927 / _j920;
const v = _j928 / _j920;
const _j929 = abs(u) + abs(v);
if (_j929 > 1) {
_j908 = (u / _j929) * _j920;
_j909 = (v / _j929) * _j920;
} else {
_j908 = u * _j920;
_j909 = v * _j920;
}
}
let _j772 = crandom.random(0, 1);
let _j773 = crandom.random(0.2, 1);
let _j930 = crandom.random(1, 2);
let _j931 = _j918 < 0.25 ? 0.1 : 0.3;
_j773 = max(_j931, _j773 * _j918);
_j930 = max(_j931, _j930 * _j918);
let _j932 = crandom.random(100, 255);
let ss = _j772 > 0.1 ? _j773 : _j930;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j933 = _j918 < 0.25 ? max(0.3, _j918 * 3) : 2;
let _j934 = _j918 < 0.25 ? _j918 * 5 : 20;
ss = max(_j933, min(_j934, ss));
_j53(_j1479, _j913, _j914, brushColorMode, _j932);
noStroke();
ellipse(_j923 + _j908, lerpY + _j909, ss, ss)
}
}
pop();
_j1479.end();
}
function _j56(_j1479, _j1491, _j1492, _j791, _j508 = 0, _j1493 = 0) {
if (_j556 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j556, ">=", expectedStrokeLength, ")");
return;
}
_j1479.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j913 = _j58(_j502);
let _j914 = _j58(_j502);
const _j935 = (_j538 && typeof _j549 !== 'undefined' && _j549 !== null) ? _j549 : baseBrushSize;
const _j936 = _j538 ? (_j622 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j548) : -1;
const _j937 = (_j936 >= 0) ? (0.7 + 0.4 * Math.min(_j936 / 0.7, 1.0)) : 1.0;
let _j905 = _j935 < 0.25;
let _j938 = 0.6;
let _j939 = _j905 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j938, baseBrushSize * 2);
let _j940 = max(_j938, baseBrushSize * 1.5);
let _j941 = _j905 ? swFloorTiny : _j940;
if (_j941 < 3) _j941 *= 2.0;
let _j942 = _j905 ?
swFloorTiny :
max(_j938, baseBrushSize * 1.2);
if (_j942 < 3) _j942 *= 2.0;
let _j943;
if (_j905) {
_j943 = max(2.0, _j935 * 10);
} else if (_j935 < 0.5) {
_j943 = 0.7;
} else {
_j943 = 9999;
}
_j525 = _j515 * 0.5;
let _j430 = _j1491;
let _j431 = _j1492;
if (!_j528) {
_j528 = 1;
x = _j430;
y = _j431;
}
_j512 += (_j430 - x) * _j509;
_j513 += (_j431 - y) * _j509;
_j512 *= _j510;
_j513 *= _j510;
let _j944 = sqrt(_j512 * _j512 + _j513 * _j513);
_j514 += _j944 - _j514;
if (baseBrushSize <= 1.0) {
_j514 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j514 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j514 *= 2.0;
} else {
_j514 *= 3.0;
}
_j515 = _j511 - _j514;
let _j945 = brushPaintCtlNoisebyFrame;
let _j946 = 1.0 * baseBrushSize * _j945 * _j937;
let _j947 = 2.0 * baseBrushSize * _j945 * _j937;
let _j948 = 3.0 * baseBrushSize * _j945 * _j937;
let showMainBrush = 0.1;
let _j949 = initialSize;
let _j950 = 0;
let _j951 = 0;
if (_j1493 == 0) showMainBrush = 0.08;
else if (_j1493 == 1) showMainBrush = 0.6;
else if (_j1493 == 2) showMainBrush = 0.2;
let _j952 = 1.0;
let _j953 = _j507 + brushPaintInterpolationOffset;
for (let i = 0; i < _j953; ++i) {
let _j954 = baseBrushSize >= 1.0 ? 5 : 3;
let _j955 = baseBrushSize >= 1.0 ? 2 : 0;
let _j956 = 0;
if (baseBrushSize < 1.5) _j956 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j956 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j956 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j956 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j508 = _j956;
if (_j556 < 5) _j508 = crandom.random(0, 1) > 0.2 ? 5 : _j508;
let _j957 = x;
let _j958 = y;
x += _j512 / _j953;
y += _j513 / _j953;
let _j959 = crandom.random(0, 1);
let _j960 = crandom.random(0, 4);
let _j961 = crandom.random(0, 3);
let _j962 = crandom.random(-1, 1);
let _j963 = crandom.random(-1, 1);
let _j964 = crandom.random(-1, 1);
let _j965 = crandom.random(-1, 1);
let _j966 = showMainBrush;
let _j967 = 1.0;
if (_j508 == 3) {
_j966 *= 0.8;
_j967 *= 0.8;
} else if (_j508 == 4) {
_j966 *= 0.6;
_j967 *= 0.5;
}
if (_j935 < 0.25) {
_j966 = 0.18;
} else if (_j935 < 1.5) {
_j966 = 0.1;
}
_j519 = lerp(_j519, _j515, 0.5);
if (brushMode == 1) {
if (_j959 > 0.8 && _j525 < 2 && i == 0) {
_j525 = _j176(_j960);
}
} else {
_j525 += (_j519 - _j525) * 0.3;
}
let _j968;
if (brushMode == 1) {
_j968 = _j525;
} else {
if (_j556 < 5) {
let _j921 = map(_j556, 0, 5, 0.05, 1.0);
_j968 = max(_j905 ? 0.1 : 0.5, _j525 * _j921);
if (explodeStart) {
_j950 = _j962 * map(_j556, 0, 5, 10, 0);
_j951 = _j963 * map(_j556, 0, 5, 10, 0);
}
} else if (_j556 >= (expectedStrokeLength - 5)) {
let _j922 = map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j968 = max(_j905 ? 0.1 : 0.5, _j525 * _j922);
if (explodeEnd) {
_j950 = _j964 * map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j951 = _j965 * map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j525 > 2) {
_j968 = max(_j905 ? 0.2 : 1, _j525);
} else {
let _j969 = (_j961 / 3) - 0.5;
_j968 = max(_j905 ? 0.1 : 0.5, _j525 + _j969);
}
}
}
let _j970 = _j968;
let _j971 = _j968 * 0.5;
if (_j508 == 3) {
_j970 *= 0.8;
_j971 *= 0.8;
} else if (_j508 == 4) {
_j970 *= 0.5;
_j971 *= 0.5;
}
let _j972 = crandom.random(0, 1);
let _j973 = crandom.random(150, 255);
let _j974 = crandom.random(100, 255);
let _j975 = crandom.random(100, 255);
let _j976 = crandom.random(100, 255);
if (_j905) {
if (!brushModeSP && _j556 > 1) {
_j52(_j1479, _j913, _j914, brushColorMode, _j973);
let kk = min(_j949, max(_j941, _j970));
strokeWeight(min(_j943, kk));
line(x + _j950, y + _j951, _j957, _j958);
}
} else if (_j972 > _j966) {
_j52(_j1479, _j913, _j914, brushColorMode, _j973);
const _j977 = !brushModeSP && _j556 > 3 && baseBrushSize < 4.0;
if (_j970 < 5) {
let kk = 0;
if (_j1493 == 0) kk = 1.5 * min(_j949, max(_j941, _j970));
else kk = min(_j949, max(_j941, _j970));
strokeWeight(min(_j943, kk));
if (_j977) line(x + _j950, y + _j951, _j957, _j958)
} else {
let kk = _j967 * min(_j949, max(_j941, _j970));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j943, kk));
if (_j977) line(x + _j950, y + _j951, _j957, _j958)
}
}
const _j978 = [];
const _j979 = [];
for (let j = 0; j < 30; j++) {
_j978.push(crandom.random(0, 1));
_j979.push(crandom.random(-0.5, 0.5) * _j952);
}
if (_j1493 == 1) {
_j978[0] = _j978[0] * 2.0;
_j978[1] = _j978[1] * 0.5;
_j978[2] = _j978[2] * 0.5;
} else if (_j1493 == 2) {
_j978[0] = _j978[0] * 0.5;
_j978[1] = _j978[1] * 0.5;
_j978[2] = _j978[2] * 0.5;
}
const _j980 = _j902[brushDir];
if (_j508 == 0) {
_j52(_j1479, _j913, _j914, brushColorMode, _j974);
if (_j978[0] > 0.2) {
const _j981 = _j980.flip1stX ? -1 : +1;
const _j982 = _j980.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j979[0], sizeVariation);
if (_j971 * sizeVariation < 5) {
strokeWeight(min(_j943, noise(x * 0.1, y * 0.2) + 1.5 * max(_j942, _j971 * sizeVariation)));
} else {
strokeWeight(min(_j943, _j967 * max(_j939, _j971 * sizeVariation)));
}
line(x + _j981 * _j947 + _j950, y + _j982 * _j947 + _j951, _j957 + _j981 * _j947, _j958 + _j982 * _j947);
}
if (_j978[1] > 0.3) {
const _j983 = _j980.flip1stX ? -1 : +1;
const _j984 = _j980.flip1stY ? +1 : -1;
_j52(_j1479, _j913, _j914, brushColorMode, _j975);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j979[1], sizeVariation);
strokeWeight(min(_j943, _j967 * max(_j939, _j971 * sizeVariation)));
line(x + _j983 * _j947 + _j950, y + _j984 * _j947 + _j951, _j957 + _j983 * _j947, _j958 + _j984 * _j947);
}
} else if (_j508 == 1) {
_j52(_j1479, _j913, _j914, brushColorMode, _j974);
if (_j978[0] > 0.1) {
const _j981 = _j980.flip1stX ? -1 : +1;
const _j982 = _j980.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j979[0], sizeVariation);
strokeWeight(min(_j943, _j967 * max(_j939, _j971 * sizeVariation)));
line(x + _j981 * _j947 + _j950, y + _j982 * _j947 + _j951, _j957 + _j981 * _j947, _j958 + _j982 * _j947)
};
if (_j978[1] > 0.05) {
const _j983 = _j980.flip1stX ? -1 : +1;
const _j984 = _j980.flip1stY ? +1 : -1;
_j52(_j1479, _j913, _j914, brushColorMode, _j975);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j979[1], sizeVariation);
strokeWeight(min(_j943, _j967 * max(_j939, _j971 * sizeVariation)));
line(x + _j983 * _j946 + _j950, y + _j984 * _j946 + _j951, _j957 + _j983 * _j946, _j958 + _j984 * _j946)
};
if (_j978[2] > 0.15) {
const _j985 = -1;
const _j986 = -1;
_j52(_j1479, _j913, _j914, brushColorMode, _j976);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j979[2], sizeVariation);
if (_j971 * sizeVariation < 5) {
strokeWeight(min(_j943, noise(x * 1, y * 2) + 1.5 * max(_j942, _j971 * sizeVariation)));
} else {
strokeWeight(min(_j943, _j967 * max(_j939, _j971 * sizeVariation)));
}
line(x + _j985 * _j948 + _j950, y + _j986 * _j948 + _j951, _j957 + _j985 * _j948, _j958 + _j986 * _j948)
};
} else if (_j508 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j52(_j1479, _j913, _j914, brushColorMode, _j974);
const _j987 = [_j978[0], _j978[1], _j978[2], _j978[3], _j978[4]];
const _j988 = [_j979[3], _j979[4], _j979[5], _j979[6], _j979[7]];
for (let i = 0; i < _j910.length; i++) {
const _j260 = _j910[i];
const _j989 = _j987[i];
const _j990 = _j988[i];
if (_j989 > _j260.randThreshold) {
let _j991;
if (_j260.offsetBase === 1) {
_j991 = _j946;
} else if (_j260.offsetBase === 2) {
_j991 = _j947;
} else if (_j260.offsetBase === 3) {
_j991 = _j948;
} else {
_j991 = _j260.offsetBase * baseBrushSize * _j945;
}
let _j992, _j993;
if (i === 0) {
_j992 = _j980.flip1stX ? -_j260.signX : _j260.signX;
_j993 = _j980.flip1stY ? -_j260.signY : _j260.signY;
} else {
_j992 = _j260.signX;
_j993 = _j260.signY;
}
let _j994 = _j992 * _j991;
let _j995 = _j993 * _j991;
const _j996 = {
offsetX: _j994,
offsetY: _j995,
randThreshold: _j260.randThreshold,
pathProgressEnd: _j260.pathProgressEnd,
jitterIndex: _j260.jitterIndex
};
_j54(
2, _j1479, _j996, x, y, _j957, _j958,
_j950, _j951, _j971, sizeVariation,
_j990
);
}
}
} else if (_j508 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j52(_j1479, _j913, _j914, brushColorMode, _j974);
let _j997 = baseBrushSize * _j945;
if (baseBrushSize > 4.0) _j997 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j911.length; i++) {
let _j998 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j260 = _j911[i];
const _j989 = _j978[i];
const _j990 = _j979[_j260.jitterIndex];
if (_j989 > _j260.randThreshold) {
const _j999 = cos(_j260.angle + _j998) * _j260.radius * _j997;
const _j1000 = sin(_j260.angle + _j998) * _j260.radius * _j997;
const _j994 = (_j980.flip1stX ? -1 : 1) * _j999;
const _j995 = (_j980.flip1stY ? -1 : 1) * _j1000;
const _j996 = {
offsetX: _j994,
offsetY: _j995,
randThreshold: _j260.randThreshold,
pathProgressEnd: _j260.pathProgressEnd,
jitterIndex: _j260.jitterIndex
};
_j54(
3, _j1479, _j996, x, y, _j957, _j958,
_j950, _j951, _j971, sizeVariation,
_j990
);
}
}
} else if (_j508 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j52(_j1479, _j913, brushColorMode, _j974);
let _j997 = baseBrushSize * _j945;
if (baseBrushSize > 4.0) _j997 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j912.length; i++) {
let _j998 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j260 = _j912[i];
const _j989 = _j978[i];
const _j990 = _j979[_j260.jitterIndex];
if (_j989 > _j260.randThreshold) {
const _j999 = cos(_j260.angle + _j998) * _j260.radius * _j997;
const _j1000 = sin(_j260.angle + _j998) * _j260.radius * _j997;
const _j994 = (_j980.flip1stX ? -1 : 1) * _j999;
const _j995 = (_j980.flip1stY ? -1 : 1) * _j1000;
const _j996 = {
offsetX: _j994,
offsetY: _j995,
randThreshold: _j260.randThreshold,
pathProgressEnd: _j260.pathProgressEnd,
jitterIndex: _j260.jitterIndex
};
_j54(
4, _j1479, _j996, x, y, _j957, _j958,
_j950, _j951, _j971, sizeVariation,
_j990
);
}
}
}
}
pop();
_j1479.end();
}
function _j57(_j1479, _j1491, _j1492, _j1494 = null, _j1495 = null, n = 80, o = 2) {
_j1479.begin();
push();
translate(-hw, -hh);
const _j915 = (_j1494 !== null && _j1495 !== null) ? _j1494 : (_j622 ? _j628 : pmouseX);
const _j916 = (_j1494 !== null && _j1495 !== null) ? _j1495 : (_j622 ? _j629 : pmouseY);
const _j1001 = (_j538 && typeof _j549 !== 'undefined' && _j549 !== null) ? _j549 : baseBrushSize;
const _j1002 = baseBrushSize;
const _j1003 = _j556;
const _j1004 = max(_j1001 < 0.25 ? 0.3 : 1, initialSize - (_j556 * randStep));
o = min(_j1002 * 2.0, 5 * _j1004 * penSketchNoiseBase * map(sin(_j1003 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1491 - _j915) > 0.1 || abs(_j1492 - _j916) > 0.1;
let _j913 = _j58(_j502);
let _j914 = _j58(_j502);
const _j1005 = [];
for (let i = 0; i < n; i++) {
_j1005.push({
t: crandom.random(0, 1),
strokeWeight: max(_j1001 < 0.25 ? 0.1 : 0.3, min(_j1001 < 0.25 ? _j1002 * 5 : 2, _j1002 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j1006 = _j1005[i];
let t = _j1006.t;
strokeWeight(_j1006.strokeWeight);
const angle = _j1006.angle;
const radius = _j1006.radius;
let _j1007 = radius * cos(angle);
let _j1008 = radius * sin(angle);
let _j932 = _j1006.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1491, _j915, t) + _j1007;
y = lerp(_j1492, _j916, t) + _j1008;
} else {
x = _j1491 + _j1007;
y = _j1492 + _j1008;
}
_j52(_j1479, _j913, _j914, brushColorMode, _j932);
if (_j556 > 3) point(x, y);
}
pop();
_j1479.end();
}
if (typeof _j59.lastAngle === 'undefined') {
_j59.lastAngle = 0;
}
if (typeof _j59.lastMovementAngle === 'undefined') {
_j59.lastMovementAngle = 0;
}
const _j1009 = [{
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
function _j58(_j913) {
if (brushColorMode === 0) {
return _j913 + crandom.random(10, 40);
} else {
return _j913 + crandom.random(30, 80);
}
}
function _j59(_j1479, _j1491, _j1492, _j791, _j508 = 0, _j1493 = 0) {
if (_j556 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j556, ">=", expectedStrokeLength, ")");
return;
}
const _j1010 = (_j538 && typeof _j549 !== 'undefined' && _j549 !== null) ? _j549 : baseBrushSize;
let _j905 = _j1010 < 0.25;
let _j943 = _j905 ? _j1010 * 5 : 9999;
_j1479.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j913 = _j58(_j502);
let _j914 = _j58(_j502);
let _j949 = initialSize * 0.3;
let _j430 = _j1491;
let _j431 = _j1492;
if (!_j528) {
_j528 = 1;
x = _j430;
y = _j431;
}
_j512 += (_j430 - x) * _j509;
_j513 += (_j431 - y) * _j509;
_j512 *= _j510;
_j513 *= _j510;
_j514 += sqrt(_j512 * _j512 + _j513 * _j513) - _j514;
_j514 *= 1.2;
if (baseBrushSize <= 1.0) {
_j514 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j514 *= 1.3;
} else {
_j514 *= 1.5;
}
_j515 = _j511 - _j514;
let _j1011 = _j519;
let _j1012 = _j515;
let _j1013 = _j430 - x;
let _j1014 = _j431 - y;
let _j1015 = sqrt(_j1013 * _j1013 + _j1014 * _j1014);
let _j1016 = max(_j905 ? 0.1 : 0.5, _j1012 * 0.5);
let _j1017 = 1.5 * min(_j949, max(_j905 ? 0.5 : 4, _j1016));
let _j1018 = _j1017 * 0.6;
let _j1019 = 0.8;
let _j1020 = max(_j1018 * _j1019, 0.5);
let _j1021 = max(1, ceil(_j1015 / _j1020));
_j1021 = max(10, min(50, _j1021));
let _j1022 = _j1021 / _j507;
let _j950 = 0;
let _j951 = 0;
let _j1023 = min(1.0, _j1015 / 10);
let _j1024 = _j1023 > 0.3;
rectMode(CENTER);
let _j224 = crandom.random(50, 100);
const _j227 = [];
for (let i = 0; i < _j507; ++i) {
_j227.push({
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
for (let i = 0; i < _j507; ++i) {
const _j1025 = _j227[i];
let _j957 = x;
let _j958 = y;
x += _j512 / _j507;
y += _j513 / _j507;
let _j421 = (i + 1) / _j507;
let _j1026 = lerp(_j1011, _j1012, _j421);
_j519 = lerp(_j519, _j1026, 0.5);
_j525 += (_j519 - _j525) * 0.8;
_j525 = max(_j905 ? 0.2 : 1.5, _j525);
let _j968;
let _j962 = _j1025.explodeX1;
let _j963 = _j1025.explodeY1;
let _j964 = _j1025.explodeX2;
let _j965 = _j1025.explodeY2;
if (_j556 < 5) {
let _j921 = map(_j556, 0, 5, 0.05, 1.0);
_j968 = max(_j905 ? 0.1 : 0.5, _j525 * _j921);
if (explodeStart) {
_j950 = _j962 * map(_j556, 0, 5, 10, 0);
_j951 = _j963 * map(_j556, 0, 5, 10, 0);
}
} else if (_j556 >= (expectedStrokeLength - 5)) {
let _j922 = map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j968 = max(_j905 ? 0.1 : 0.5, _j525 * _j922);
if (explodeEnd) {
_j950 = _j964 * map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j951 = _j965 * map(_j556, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j968 = max(_j905 ? 0.1 : 0.5, _j525);
}
let _j972 = _j1025.showMainBrush;
let _j973 = _j1025.mainAlpha;
let showMainBrush = 0.3;
let _j1027 = showMainBrush;
if (_j1022 > 1.0) {
_j1027 = showMainBrush / _j1022;
} else if (_j1022 < 1.0) {
_j1027 = showMainBrush * (2.0 - _j1022);
}
if (_j972 > _j1027 && _j556 > 5) {
noStroke();
_j52(_j1479, _j913, _j914, brushColorMode, _j973);
let ss = min(_j943, 1.2 * min(_j949, max(3 * _j1010, _j968)));
let dx = x - _j957;
let dy = y - _j958;
let distance = sqrt(dx * dx + dy * dy);
let _j266;
const _j313 = 0.1;
if (distance < _j313) {
_j266 = _j59.lastAngle;
} else {
let _j1028 = atan2(dy, dx);
_j266 = _j1028 + PI / 2;
_j59.lastAngle = _j266;
_j59.lastMovementAngle = _j1028;
}
push();
translate(x, y);
rotate(_j266);
let _j1018 = ss * _j1025.rectWidthMult;
rect(0, 0, _j1018, _j1018 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j1023 > 0.9 && _j556 > 5 && _j556 < (expectedStrokeLength - 5)) {
let _j1029 = -sin(_j59.lastMovementAngle);
let _j1030 = cos(_j59.lastMovementAngle);
for (let j = 0; j < _j1009.length; j++) {
let _j1031 = _j1009[j];
let _j1032 = _j1025.flyWhiteRandoms[j];
let _j1033 = _j1031.randThreshold - _j1023 * 0.3;
if (_j1032 > _j1033) {
let offsetX = _j1029 * _j1031.perpOffset * _j1010;
let offsetY = _j1030 * _j1031.perpOffset * _j1010;
stroke(_j224);
strokeWeight(min(_j943, max(_j905 ? 0.1 : 0.5, _j968 * 0.3)));
line(_j957 + offsetX, _j958 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
_j1479.end();
}
let _j1034 = [];
let _j1035 = 0;
function _j60(baseBrushSize, strokeSeed) {
let _j1036, _j1037;
if (baseBrushSize <= 0.1) {
_j1036 = 2;
_j1037 = 4;
} else if (baseBrushSize <= 0.25) {
_j1036 = 4;
_j1037 = 7;
} else if (baseBrushSize <= 0.5) {
_j1036 = 6;
_j1037 = 10;
} else if (baseBrushSize <= 2.0) {
_j1036 = 10;
_j1037 = 15;
} else if (baseBrushSize <= 3.0) {
_j1036 = 20;
_j1037 = 30;
} else {
_j1036 = 30;
_j1037 = 50;
}
let count;
if (_j1036 === _j1037) {
count = _j1036;
} else {
const _j1038 = strokeSeed + 50000;
randomSeed(_j1038);
count = Math.floor(crandom.random(_j1036, _j1037 + 1));
}
const _j1039 = [];
const _j1040 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1041 = _j1040 + i * 1000;
randomSeed(_j1041);
const perpOffset = crandom.random(-6, 6);
const _j1042 = _j1040 + i * 2000 + 1;
randomSeed(_j1042);
const randThreshold = crandom.random(0.5, 1.0);
const _j1043 = _j1040 + i * 3000 + 2;
randomSeed(_j1043);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1044 = _j1040 + i * 4000 + 3;
randomSeed(_j1044);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1045 = _j1040 + i * 5000 + 4;
randomSeed(_j1045);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1046 = _j1040 + i * 6000 + 5;
randomSeed(_j1046);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1047 = _j1040 + i * 7000 + 6;
randomSeed(_j1047);
const endDistanceOffset = crandom.random(0, 8);
const _j1048 = _j1040 + i * 8000 + 7;
randomSeed(_j1048);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1049 = _j1040 + i * 9000 + 8;
randomSeed(_j1049);
const widthVariationFactor = crandom.random(0, 1);
const _j1050 = _j1040 + i * 10000 + 9;
randomSeed(_j1050);
const offsetVariationFactor = crandom.random(0, 1);
_j1039.push({
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
_j1039.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1039;
}
if (typeof _j63.lastAngle === 'undefined') {
_j63.lastAngle = 0;
}
if (typeof _j63.lastMovementAngle === 'undefined') {
_j63.lastMovementAngle = 0;
}
if (typeof _j63.lastStrokeWeights === 'undefined') {
_j63.lastStrokeWeights = {};
}
if (typeof _j63.configCache === 'undefined') {
_j63.configCache = {};
}
function _j61() {
if (typeof _j63 !== 'undefined' && _j63.configCache) {
_j63.configCache = {};
}
if (typeof _j63 !== 'undefined' && _j63.lastStrokeWeights) {
_j63.lastStrokeWeights = {};
}
}
function _j62(_j1479, _j1491, _j1492, _j1494 = null, _j1495 = null) {
if (_j556 >= expectedStrokeLength) {
return;
}
_j1479.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j915 = (_j1494 !== null && _j1495 !== null) ? _j1494 : (_j622 ? _j628 : pmouseX);
const _j916 = (_j1495 !== null && _j1495 !== null) ? _j1495 : (_j622 ? _j629 : pmouseY);
const _j1051 = _j1491 - _j915;
const _j1052 = _j1492 - _j916;
const _j1053 = sqrt(_j1051 * _j1051 + _j1052 * _j1052);
const speedMultiplier = map(constrain(_j1053, 3, 50), 0, 50, 0.1, 5.0);
let _j1054 = 0,
_j1055 = 0;
let _j1056 = 0,
_j1057 = 0;
let _j1058 = 0,
_j1059 = 0;
if (_j1053 > 0.1) {
_j1054 = _j1051 / _j1053;
_j1055 = _j1052 / _j1053;
_j1056 = -_j1055;
_j1057 = _j1054;
_j1058 = _j1055;
_j1059 = -_j1054;
} else {
_j1056 = 0;
_j1057 = 1;
_j1058 = 0;
_j1059 = -1;
}
const _j1060 = _j556 < expectedStrokeLength;
const _j1061 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1062 = strokeSeed + _j556 * 10000 + 1;
randomSeed(_j1062);
const _j1063 = _j1060 ? Math.floor(crandom.random(0, _j1061)) : 0;
for (let i = 0; i < _j1063; i++) {
const _j1064 = strokeSeed + _j556 * 1000 + _j1035;
randomSeed(_j1064);
const _j1065 = crandom.random(5, 15) * baseBrushSize;
const _j1066 = _j1491 + crandom.random(-2, 2) * baseBrushSize;
const _j1067 = _j1492 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1068, _j1069, _j1070;
if (brushColorMode === 0) {
_j1068 = _j1069 = _j1070 = _j502 * 0.3;
} else if (brushColorMode === 1) {
_j1068 = _j1069 = _j1070 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1068 = customBrushColor[0];
_j1069 = customBrushColor[1];
_j1070 = customBrushColor[2];
} else {
const color = _j207[brushColorMode];
if (color && color.rgb) {
_j1068 = color.rgb[0];
_j1069 = color.rgb[1];
_j1070 = color.rgb[2];
} else {
_j1068 = _j1069 = _j1070 = 26;
}
}
const _j1071 = {
id: _j1035++,
location: {
x: _j1066,
y: _j1067
},
prevLocation: {
x: _j1066,
y: _j1067
},
radius: _j1065,
r: _j1068,
g: _j1069,
b: _j1070,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j1034.push(_j1071);
}
const _j1072 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1073 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j1034.length - 1; i >= 0; i--) {
const _j1074 = _j1034[i];
if (_j1074.radius <= 0) {
continue;
}
const _j1075 = strokeSeed + _j556 * 1000 + _j1074.id * 100;
randomSeed(_j1075);
const _j1076 = crandom.random(_j1072, _j1073) * 3.0;
_j1074.radius -= _j1076;
const _j1077 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1078 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1074.xOff += _j1077;
_j1074.yOff += _j1078;
const _j1079 = 2.0 * speedMultiplier;
let _j1080 = 0,
_j1081 = 0;
const _j1082 = crandom.random(0, 1);
const _j1083 = (_j1074.sideDirection !== undefined) ? _j1074.sideDirection : (_j1082 > 0.5 ? 1 : -1);
if (_j1083 === 1) {
_j1080 = _j1058 * _j1079;
_j1081 = _j1059 * _j1079;
} else {
_j1080 = _j1056 * _j1079;
_j1081 = _j1057 * _j1079;
}
const nX = noise(_j1074.location.x) * _j1074.xOff;
const nY = noise(_j1074.location.y) * _j1074.yOff;
if (!_j1074.prevLocation) {
_j1074.prevLocation = {
x: _j1074.location.x,
y: _j1074.location.y
};
} else {
_j1074.prevLocation.x = _j1074.location.x;
_j1074.prevLocation.y = _j1074.location.y;
}
_j1074.location.x += 2.0 * (_j1080 * 0.2 + nX * 0.8);
_j1074.location.y += 2.0 * (_j1081 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1084 = noise(_j1074.location.x * 0.01, _j1074.location.y * 0.01) * 5;
_j1074.r = constrain(_j1074.r + _j1084, 0, 255);
_j1074.g = constrain(_j1074.g + _j1084, 0, 255);
_j1074.b = constrain(_j1074.b + _j1084, 0, 255);
} else if (brushColorMode == 0) {
const _j1084 = noise(_j1074.location.x * 0.01, _j1074.location.y * 0.01) * 2;
_j1074.r = constrain(_j1074.r + _j1084, 0, 200);
_j1074.g = constrain(_j1074.g + _j1084, 0, 200);
_j1074.b = constrain(_j1074.b + _j1084, 0, 200);
}
const _j1085 = crandom.random(0, 1) > 0.2;
const _j1086 = crandom.random(0, 1) > 0.99;
if (_j1074.radius > 0) {
stroke(_j1074.r, _j1074.g, _j1074.b, 200);
strokeWeight(max(1, _j1074.radius * 0.5));
if (_j1085) {
line(_j1074.prevLocation.x, _j1074.prevLocation.y, _j1074.location.x, _j1074.location.y);
}
if (_j1086) {
_j1074.radius = -1;
}
} else {
_j1074.radius = -1;
}
}
const _j1087 = _j1034.length;
let _j1088 = 0;
for (let i = 0; i < _j1034.length; i++) {
if (_j1034[i].radius > 0) {
if (_j1088 !== i) {
_j1034[_j1088] = _j1034[i];
}
_j1088++;
}
}
_j1034.length = _j1088;
const _j1089 = _j1034.length;
if (window.DEBUG_MODE && _j1087 > _j1089) {
const _j1090 = _j1087 - _j1089;
if (_j1090 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1090} dead particles removed (${_j1087} → ${_j1089})`);
}
}
pop();
_j1479.end();
}
function _j63(_j1479, _j1491, _j1492, _j791, _j508 = 0, _j1493 = 0) {
if (_j556 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j556, ">=", expectedStrokeLength, ")");
return;
}
_j1479.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j913 = _j58(_j502);
let _j949 = initialSize * 0.3;
const _j1091 = (_j538 && typeof _j549 !== 'undefined' && _j549 !== null) ? _j549 : baseBrushSize;
let _j430 = _j1491;
let _j431 = _j1492;
if (!_j528) {
_j528 = 1;
x = _j430;
y = _j431;
}
_j512 += (_j430 - x) * _j509;
_j513 += (_j431 - y) * _j509;
_j512 *= _j510;
_j513 *= _j510;
_j514 += sqrt(_j512 * _j512 + _j513 * _j513) - _j514;
_j514 *= 0.7;
_j515 = _j511 - _j514;
let _j1011 = _j519;
let _j1012 = _j515;
let _j1013 = _j430 - x;
let _j1014 = _j431 - y;
let _j1015 = sqrt(_j1013 * _j1013 + _j1014 * _j1014);
const _j1092 = _j1091;
const _j1093 = _j1092 < 0.25;
const _j1094 = _j1092 < 1.0;
let _j1016 = max(_j1093 ? 0.05 : (_j1094 ? _j1092 * 0.5 : 0.5), _j1012 * 0.5);
let _j1017 = 1.5 * min(_j949, max(_j1094 ? _j1092 * 4 : 4, _j1016));
let _j1018 = _j1017 * 0.6;
let _j1019 = 0.8;
let _j1020 = max(_j1018 * _j1019, 0.5);
let _j1021 = max(1, ceil(_j1015 / _j1020));
_j1021 = max(10, min(50, _j1021));
let _j1022 = _j1021 / _j507;
let _j950 = 0;
let _j951 = 0;
let _j1023 = min(1.0, _j1015 / 10);
let _j1024 = _j1023 > 0.3;
rectMode(CENTER);
let _j224 = crandom.random(30, 70);
const _j1095 = `flyBrush_${_j1091}_${strokeSeed}`;
let _j1096;
if (_j63.configCache[_j1095]) {
_j1096 = _j63.configCache[_j1095];
} else {
_j1096 = _j60(_j1091, strokeSeed);
_j63.configCache[_j1095] = _j1096;
}
const _j1097 = map(_j224, 30, 70, 0, _j1096.length);
const _j1098 = _j1096.length;
const _j1099 = 40;
const _j227 = [];
for (let i = 0; i < _j507; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1099; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1100 = _j556 * 0.08 + j * 0.15;
const _j1101 = _j556 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1100, _j1101));
const _j1102 = _j556 * 0.1 + j * 0.1;
const _j1103 = _j556 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1102, _j1103));
}
_j227.push({
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
for (let i = 0; i < _j507; ++i) {
const _j1025 = _j227[i];
let _j957 = x;
let _j958 = y;
x += _j512 / _j507;
y += _j513 / _j507;
let _j421 = (i + 1) / _j507;
let _j1026 = lerp(_j1011, _j1012, _j421);
_j519 = lerp(_j519, _j1026, 0.5);
_j525 += (_j519 - _j525) * 0.8;
_j525 = max(_j1094 ? _j1092 * 1.5 : 1.5, _j525);
let _j968;
_j968 = max(_j1093 ? _j1092 * 0.5 : (_j1094 ? _j1092 : 0.5), _j525);
let dx = x - _j957;
let dy = y - _j958;
let distance = sqrt(dx * dx + dy * dy);
let _j1028;
const _j313 = 0.1;
if (distance < _j313) {
_j1028 = _j63.lastMovementAngle;
} else {
_j1028 = atan2(dy, dx);
let _j266 = _j1028 + PI / 2;
_j63.lastAngle = _j266;
_j63.lastMovementAngle = _j1028;
}
let _j972 = _j1025.showMainBrush;
let _j973 = _j1025.mainAlpha;
let showMainBrush = 0.3;
let _j1027 = showMainBrush;
if (_j1022 > 1.0) {
_j1027 = showMainBrush / _j1022;
} else if (_j1022 < 1.0) {
_j1027 = showMainBrush * (2.0 - _j1022);
}
let _j1029 = -sin(_j1028);
let _j1030 = cos(_j1028);
const _j1104 = max(_j1093 ? _j1092 * 0.4 : (_j1094 ? _j1092 * 0.5 : 0.5), _j511 * 0.5);
const _j1105 = _j514 * 0.5;
const _j1106 = _j556 < (expectedStrokeLength - 5);
const _j1107 = _j556 >= (expectedStrokeLength - 5);
const _j1108 = _j1107 ? 0.7 : 1.0;
const _j1109 = _j556 >= expectedStrokeLength;
let _j1110, _j1111, _j1112, _j1113, _j1114;
if (_j1107) {
_j1110 = expectedStrokeLength - 5;
_j1111 = _j556 - _j1110;
_j1112 = min(1.0, _j1111 / 5.0);
_j1113 = cos(_j1028);
_j1114 = sin(_j1028);
}
for (let j = 0; j < _j1096.length; j++) {
let _j1031 = _j1096[j];
const _j1115 = _j556 >= _j1031.startOffset;
if (!_j1115 || _j1109) {
continue;
}
let _j1032 = _j1025.flyWhiteRandoms[j];
let _j1033 = _j1031.randThreshold * _j1108;
if (_j1032 > _j1033) {
const _j1116 = _j1025.flyWhiteOffsetNoises[j];
const _j997 = map(_j1116, 0, 1, 1.0, 2.0);
const _j1117 = 1.0 + (_j997 - 1.0) * _j1031.offsetVariationFactor;
const _j1118 = _j1094 ? max(0.3, _j1092 * 3) : _j1092;
const _j1119 = _j1031.perpOffset * _j1118 * _j1117;
let offsetX = _j1029 * _j1119;
let offsetY = _j1030 * _j1119;
let _j264 = x;
let _j265 = y;
let _j1120 = _j957;
let _j1121 = _j958;
if (_j1107) {
const _j1122 = _j1031.endDistanceOffset * _j1112 * _j1091;
const _j1123 = _j1113 * _j1122;
const _j1124 = _j1114 * _j1122;
_j264 = x + _j1123;
_j265 = y + _j1124;
if (_j1111 === 0) {
_j1120 = _j957;
_j1121 = _j958;
} else {
const _j1125 = min(1.0, (_j1111 - 1) / 5.0);
const _j1126 = _j1031.endDistanceOffset * _j1125 * _j1091;
const _j1127 = _j1113 * _j1126;
const _j1128 = _j1114 * _j1126;
_j1120 = x + _j1127;
_j1121 = y + _j1128;
}
}
const _j1129 = _j1105 * _j1031.brushSpeedMultiplier * _j1031.speedMultiplier;
const _j1130 = max(_j1093 ? _j1092 * 0.3 : (_j1094 ? _j1092 * 0.3 : 0.5), _j1104 - _j1129);
const _j1131 = _j1130 * 0.6;
const _j1132 = _j1025.flyWhiteWidthNoises[j];
const _j1133 = map(_j1132, 0, 1, 0.8, 1.2);
const _j1134 = 1.0 + (_j1133 - 1.0) * _j1031.widthVariationFactor;
let _j1135 = max(0, map(j, 0, _j1096.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1135) + random(-50, 50);
stroke(_j913, kk);
const _j1136 = _j1131 * _j1031.sizeMultiplier * _j1134;
const _j1137 = max(1, _j1136);
const _j1138 = `${_j1095}_${j}`;
let _j1139 = _j63.lastStrokeWeights[_j1138];
if (typeof _j1139 === 'undefined') {
_j1139 = _j1137;
}
const _j1140 = _j1139;
let _j1141;
if (_j1140 < 3.0) {
_j1141 = 0.15;
} else if (_j1140 >= 5.0) {
_j1141 = 0.3;
} else {
const t = (_j1140 - 3.0) / (5.0 - 3.0);
_j1141 = lerp(0.15, 0.3, t);
}
const _j1142 = lerp(_j1139, _j1137, _j1141);
_j63.lastStrokeWeights[_j1138] = _j1142;
strokeWeight(_j1142);
line(_j1120 + offsetX, _j1121 + offsetY, _j264 + offsetX, _j265 + offsetY);
}
}
}
pop();
_j1479.end();
}
let _j1143 = null;
function _j64() {
if (_j1143) return _j1143;
_j1143 = {
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
return _j1143;
}
function _j65(key) {
if (!_j1143) {
_j64();
}
return _j1143[key];
}
function _j66(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j65('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j673.x = e.clientX - rect.left - rect.width / 2;
_j673.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j67(e) {
if (!isDragging) return;
const overlay = _j65('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j673.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j673.y) / window.innerHeight) * 100;
_j674.x = x;
_j674.y = y;
_j69(overlay, _j674, _j72);
}
function _j68() {
if (!isDragging) return;
isDragging = false;
const overlay = _j65('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j69(overlay, _j674, _j72);
}
_j108();
}
function _j69(panel, pos, _j1496) {
if (!panel) return;
_j1496();
const _j1144 = panel.querySelector('.control-btn');
if (!_j1144) return;
const rect = _j1144.getBoundingClientRect();
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
_j1496();
}
}
function _j70(_j1497) {
if (!_j1497) return;
const _j899 = [
document.getElementById('message-overlay'),
_j65('controlPanel'),
_j65('effectControlPanel'),
_j65('flowEffectPanel'),
_j65('maskPanel')
];
_j899.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1497.classList.add('panel-front');
}
function _j71() {
const _j899 = [
document.getElementById('message-overlay'),
_j65('controlPanel'),
_j65('effectControlPanel'),
_j65('flowEffectPanel'),
_j65('maskPanel')
];
_j899.forEach(panel => {
if (!panel) return;
panel.addEventListener('mousedown', () => _j70(panel));
panel.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) _j70(panel);
}, {
passive: true
});
});
}
function _j72() {
const overlay = _j65('messageOverlay');
if (!overlay) return;
overlay.style.left = _j674.x + '%';
overlay.style.top = _j674.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j73(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j675 = true;
const panel = _j65('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j676.x = e.clientX - rect.left - rect.width / 2;
_j676.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j74(e) {
if (!_j675) return;
const panel = _j65('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j676.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j676.y) / window.innerHeight) * 100;
_j677.x = x;
_j677.y = y;
_j69(panel, _j677, _j76);
}
function _j75(e) {
if (!_j675) return;
_j675 = false;
const panel = _j65('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j69(panel, _j677, _j76);
_j108();
}
function _j76() {
const panel = _j65('controlPanel');
if (!panel) return;
panel.style.left = _j677.x + '%';
panel.style.top = _j677.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j77(e) {
if (e.target.closest('.control-btn')) return;
_j679 = true;
const panel = _j65('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j680.x = e.clientX - rect.left - rect.width / 2;
_j680.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j78(e) {
if (!_j679) return;
const panel = _j65('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j680.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j680.y) / window.innerHeight) * 100;
_j681.x = x;
_j681.y = y;
_j69(panel, _j681, _j80);
}
function _j79(e) {
if (!_j679) return;
_j679 = false;
const panel = _j65('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j69(panel, _j681, _j80);
_j108();
}
function _j80() {
const panel = _j65('effectControlPanel');
if (!panel) return;
panel.style.left = _j681.x + '%';
panel.style.top = _j681.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j81(e) {
if (e.target.closest('.control-btn')) return;
_j683 = true;
const panel = _j65('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j684.x = e.clientX - rect.left - rect.width / 2;
_j684.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j82(e) {
if (!_j683) return;
const panel = _j65('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j684.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j684.y) / window.innerHeight) * 100;
_j685.x = x;
_j685.y = y;
_j69(panel, _j685, _j84);
}
function _j83(e) {
if (!_j683) return;
_j683 = false;
const panel = _j65('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j69(panel, _j685, _j84);
_j108();
}
function _j84() {
const panel = _j65('flowEffectPanel');
if (!panel) return;
panel.style.left = _j685.x + '%';
panel.style.top = _j685.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j85(e) {
if (e.target.closest('.control-btn') || e.target.closest('.toggle-label')) return;
_j687 = true;
const panel = _j65('maskPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j688.x = e.clientX - rect.left - rect.width / 2;
_j688.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j86(e) {
if (!_j687) return;
const panel = _j65('maskPanel');
if (!panel) return;
const x = ((e.clientX - _j688.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j688.y) / window.innerHeight) * 100;
_j689.x = x;
_j689.y = y;
_j69(panel, _j689, _j88);
}
function _j87(e) {
if (!_j687) return;
_j687 = false;
const panel = _j65('maskPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j69(panel, _j689, _j88);
_j108();
}
function _j88() {
const panel = _j65('maskPanel');
if (!panel) return;
panel.style.left = _j689.x + '%';
panel.style.top = _j689.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j89() {
const _j1145 = document.getElementById('mask-rect-btn');
const _j1146 = document.getElementById('mask-poly-btn');
if (_j1145) _j1145.classList.toggle('active', _j542 === 'rect');
if (_j1146) _j1146.classList.toggle('active', _j542 === 'polygon');
}
function _j90() {
const _j1147 = document.getElementById('mask-status');
if (!_j1147) return;
if (_j540) {
_j1147.textContent = _j542 === 'rect' ? 'Draw rect mask' : 'Click to add points, press Polygon again to close';
} else if (_j541) {
_j1147.textContent = 'Mask active';
} else {
_j1147.textContent = 'No mask';
}
const c = document.querySelector('canvas');
if (c) {
c.classList.toggle('mask-cursor', _j540);
}
}
function _j91() {
return _j65('controlPanel');
}
let _j1148 = {};
let _j1149 = {
hint: null,
startX: 0,
startY: 0,
offsetX: 0,
offsetY: 0,
isDragging: false,
hasMoved: false,
lastDragTime: 0
};
function _j92() {
return Date.now() - _j1149.lastDragTime < 200;
}
function _j93(hint, _j1498) {
const button = document.getElementById(_j1498);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j94(e, hint) {
const rect = hint.getBoundingClientRect();
_j1149.hint = hint;
_j1149.startX = e.clientX;
_j1149.startY = e.clientY;
_j1149.offsetX = e.clientX - rect.left;
_j1149.offsetY = e.clientY - rect.top;
_j1149.isDragging = true;
_j1149.hasMoved = false;
}
function _j95(e) {
if (!_j1149.isDragging || !_j1149.hint) return;
const dx = Math.abs(e.clientX - _j1149.startX);
const dy = Math.abs(e.clientY - _j1149.startY);
if (dx > 5 || dy > 5) {
_j1149.hasMoved = true;
_j1149.hint.style.transition = 'none';
}
if (_j1149.hasMoved) {
const x = e.clientX - _j1149.offsetX;
const y = e.clientY - _j1149.offsetY;
_j1149.hint.style.left = x + 'px';
_j1149.hint.style.top = y + 'px';
}
}
function _j96(e) {
if (!_j1149.isDragging || !_j1149.hint) return;
const hint = _j1149.hint;
if (_j1149.hasMoved) {
_j1148[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1148));
hint.style.transition = '';
_j1149.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1149.hint = null;
_j1149.isDragging = false;
_j1149.hasMoved = false;
}
function _j97() {
const _j1150 = localStorage.getItem('hintPositions');
if (_j1150) {
_j1148 = JSON.parse(_j1150);
}
}
function _j98() {
const _j1151 = [{
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
_j1151.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j94(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1152 = e.touches[0];
_j94({
clientX: _j1152.clientX,
clientY: _j1152.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j95);
document.addEventListener('mouseup', _j96);
document.addEventListener('touchmove', (e) => {
if (_j1149.isDragging && e.touches.length === 1) {
_j95({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1149.hasMoved) e.preventDefault();
}
}, {
passive: false
});
document.addEventListener('touchend', (e) => {
_j96({
preventDefault: () => {},
stopPropagation: () => {}
});
});
}
function _j99() {
_j97();
const _j899 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j670
}, {
panel: _j65('controlPanel'),
hint: _j65('brushHint'),
button: 'toggle-control-panel',
visible: _j678
}, {
panel: _j65('effectControlPanel'),
hint: _j65('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j682
}, {
panel: _j65('flowEffectPanel'),
hint: _j65('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j686
}, {
panel: _j65('maskPanel'),
hint: _j65('maskHint'),
button: 'toggle-mask-panel',
visible: _j690
}];
_j899.forEach(({
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
_j93(hint, button);
panel.style.display = 'none';
panel.style.opacity = '';
panel.style.pointerEvents = '';
});
}
});
}
function _j100() {
_j678 = !_j678;
const panel = _j91();
const brushHint = _j65('brushHint');
if (!panel) return;
if (_j678) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (brushHint) {
brushHint.classList.add('hidden');
}
} else {
if (brushHint) {
_j93(brushHint, 'toggle-control-panel');
brushHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j678) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j678.toString());
}
function _j101() {
_j682 = !_j682;
const panel = _j65('effectControlPanel');
const effectHint = _j65('effectHint');
if (!panel) return;
if (_j682) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (effectHint) {
effectHint.classList.add('hidden');
}
} else {
if (effectHint) {
_j93(effectHint, 'toggle-effect-control-panel');
effectHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j682) {
panel.style.display = 'none';
}
}, 300);
}
_j106();
}
function _j102() {
_j686 = !_j686;
const panel = _j65('flowEffectPanel');
const flowHint = _j65('flowHint');
if (!panel) return;
if (_j686) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (flowHint) {
flowHint.classList.add('hidden');
}
} else {
if (flowHint) {
_j93(flowHint, 'toggle-flow-effect-panel');
flowHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j686) {
panel.style.display = 'none';
}
}, 300);
}
_j106();
}
function _j103() {
_j690 = !_j690;
const panel = _j65('maskPanel');
const maskHint = _j65('maskHint');
if (!panel) return;
if (_j690) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (maskHint) {
maskHint.classList.add('hidden');
}
} else {
if (maskHint) {
_j93(maskHint, 'toggle-mask-panel');
maskHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j690) {
panel.style.display = 'none';
}
}, 300);
}
_j106();
}
function _j104() {
const _j1153 = _j65('screenTextToggle');
if (_j1153) {
screenText = _j1153.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j140();
}
_j109('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j105() {
const _j1154 = localStorage.getItem('controlPanelVisible');
if (_j1154 !== null) {
_j678 = _j1154 === 'true';
}
const _j1155 = localStorage.getItem('effectControlPanelVisible');
if (_j1155 !== null) {
_j682 = _j1155 === 'true';
}
const _j1156 = localStorage.getItem('flowEffectPanelVisible');
if (_j1156 !== null) {
_j686 = _j1156 === 'true';
}
}
function _j106() {
localStorage.setItem('controlPanelVisible', _j678);
localStorage.setItem('effectControlPanelVisible', _j682);
localStorage.setItem('flowEffectPanelVisible', _j686);
localStorage.setItem('maskPanelVisible', _j690);
}
function _j107() {
const _j1157 = localStorage.getItem('overlayPosition');
const _j1158 = localStorage.getItem('controlPanelPosition');
const _j1159 = localStorage.getItem('effectControlPanelPosition');
const _j1160 = localStorage.getItem('flowEffectPanelPosition');
if (_j1157) {
_j674 = JSON.parse(_j1157);
}
if (_j1158) {
_j677 = JSON.parse(_j1158);
}
if (_j1159) {
_j681 = JSON.parse(_j1159);
}
if (_j1160) {
_j685 = JSON.parse(_j1160);
}
const _j1161 = localStorage.getItem('maskPanelPosition');
if (_j1161) {
_j689 = JSON.parse(_j1161);
}
const _j1162 = localStorage.getItem('maskPanelVisible');
if (_j1162 !== null) {
_j690 = _j1162 === 'true';
}
}
function _j108() {
localStorage.setItem('overlayPosition', JSON.stringify(_j674));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j677));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j681));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j685));
localStorage.setItem('maskPanelPosition', JSON.stringify(_j689));
}
function _j109(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1163 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1163[type] || '⚙️';
if (Object.keys(data).length > 0) {} else {}
if (typeof screenText !== 'undefined' && screenText) {
_j110(type, message, data);
}
}
function _j110(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1163 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1163[type] || '⚙️';
let _j1164 = '';
if (Object.keys(data).length > 0) {
_j1164 = ' ' + JSON.stringify(data);
}
const _j1165 = `${icon} [${timestamp}] ${message}${_j1164}`;
_j692.push({
type: type,
text: _j1165,
timestamp: timestamp
});
if (_j692.length >= _j699) {
_j692 = [];
_j694 = 0;
}
}
function _j111(type, message, data, timestamp, icon) {
const _j1166 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j671.push(_j1166);
if (_j671.length > _j672) {
_j671.shift();
}
_j112();
}
function _j112() {
const _j1167 = _j65('messageContainer');
if (!_j1167) return;
_j1167.innerHTML = '';
_j671.forEach(_j1501 => {
const _j1168 = _j138(_j1501);
_j1167.appendChild(_j1168);
});
_j1167.scrollTop = _j1167.scrollHeight;
}
function _j113() {
const _j1169 = recordingData.events.length > 0;
const _j1170 = `${_j614}-${_j622}-${_j1169}`;
if (_j1170 === _j1176) {
return;
}
_j1176 = _j1170;
const recordBtn = _j65('recordBtn');
const stopBtn = _j65('stopBtn');
const playBtn = _j65('playBtn');
const loadBtn = _j65('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j614) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j622) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1169) {
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
let _j1171 = false;
let _j1172 = -1;
let _j1173 = 0;
const _j1174 = 100;
let _j1175 = -1;
let _j1176 = null;
function _j114(_j1341) {
const _j1177 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j109('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1177.onload = (e) => {
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
_j1171 = true;
_j109('system', '📷 Reference image loaded', {
Status: 'Tracing mode ON',
FileName: _j1341.name,
FileSize: (_j1341.size / 1024).toFixed(2) + ' KB',
Opacity: '50%',
Size: width + 'x' + height + 'px'
});
};
referenceImage.onerror = () => {
_j109('system', '❌ Failed to load image', {
Status: 'Error',
FileName: _j1341.name
});
};
};
_j1177.onerror = () => {
_j109('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1341.name
});
};
_j1177.readAsDataURL(_j1341);
}
function _j115() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1178 = referenceImage.src;
const _j1179 = _j1178 && _j1178 !== '' &&
(_j1178.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1179) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1171 = true;
_j109('system', 'Reference image shown', {
Status: 'Tracing mode ON',
Opacity: '30%'
});
} else {
_j109('system', 'No image loaded', {
Status: 'Please load an image first'
});
}
}
}
function _j116() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1171 = false;
_j109('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j117() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j169('💾 Canvas Saved as PNG');
}
function _j118(_j1218) {
_j520 = _j1218;
switch (_j1218) {
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
if (typeof _j549 !== 'undefined') _j549 = baseBrushSize;
_j119();
_j131();
_j109('ui', 'Brush size changed', {
Mode: _j1218.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j119() {
const _j1180 = document.querySelectorAll('.brush-size-btn');
if (_j1180.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1180.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j520) {
btn.classList.add('active');
}
});
}
function _j120(mode) {
brushMode = parseInt(mode);
_j122();
_j131();
_j109('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j121(mode)
});
}
function _j121(mode) {
const _j1181 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1181[mode] || 'Unknown mode';
}
function _j122() {
const _j1180 = document.querySelectorAll('.brush-mode-btn');
if (_j1180.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1180.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j123(effect) {
const _j1182 = parseInt(effect);
const _j1183 = useSharpen;
_j109('ui', '🎨 Ink effect switching', {
From: _j1183,
To: _j1182,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1182;
if (typeof _j521 !== 'undefined') {
_j521 = _j1183;
}
_j126();
_j131();
const _j1184 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j109('ui', '✨ Ink effect changed', {
Effect: _j1184[_j1182] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j124(mode) {
const _j1185 = parseInt(mode);
if (_j1185 === 3) {
window.spectral = true;
} else {
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1185;
}
window.spectral = false;
}
_j125();
const _j1186 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken',
3: 'Spectral'
};
_j109('ui', '🎨 BlendMode changed', {
Mode: _j1186[_j1185] || 'Unknown'
});
}
function _j125() {
const _j1180 = document.querySelectorAll('.blendmode-btn');
if (_j1180.length === 0) {
return;
}
const _j1187 = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
_j1180.forEach(btn => {
const _j1185 = parseInt(btn.dataset.mode);
if (_j1187 && _j1185 === 3) {
btn.classList.add('active');
} else if (!_j1187 && _j1185 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j126() {
const _j1180 = document.querySelectorAll('.ink-effect-btn');
if (_j1180.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1180.forEach(btn => {
btn.classList.remove('active');
const _j1182 = parseInt(btn.dataset.effect);
const _j1188 = _j1182;
if (_j1188 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j127(color) {
whiteBrushMode = (color === 'white');
const _j1189 = {
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
brushColorMode = _j1189[color] !== undefined ? _j1189[color] : 0;
_j128();
_j131();
const _j1190 = {
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
const _j1191 = _j8(color);
if (_j1191) {
const _j1192 = document.getElementById('custom-brush-color');
const _j1193 = document.getElementById('custom-brush-color-text');
if (_j1192) _j1192.value = _j1191.hex;
if (_j1193) _j1193.value = _j1191.displayName + ' ' + _j1191.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1191.rgb[0];
customBrushColor[1] = _j1191.rgb[1];
customBrushColor[2] = _j1191.rgb[2];
}
}
}
_j109('ui', '🎨 Brush color changed', {
Color: _j1190[color] || color,
Mode: `${_j1190[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j128() {
const _j1194 = document.querySelectorAll('.brush-color-btn');
const _j1195 = document.querySelectorAll('.color-swatch');
if (_j1194.length === 0 && _j1195.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1196 = {
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
const _j1197 = (brushColorMode === 33);
const _j1198 = _j1197 ? null : (_j1196[brushColorMode] || 'black');
_j1194.forEach(btn => {
btn.classList.remove('active');
if (!_j1197 && btn.dataset.color === _j1198) {
btn.classList.add('active');
}
});
_j1195.forEach(btn => {
btn.classList.remove('active');
if (!_j1197 && btn.dataset.color === _j1198) {
btn.classList.add('active');
}
});
}
function _j129(_j1224) {
_j562 = parseInt(_j1224);
_j130();
_j131();
const _j1199 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j109('ui', '🔄 Path rotation changed', {
Mode: _j1224,
Range: _j1199[_j1224] || 'Unknown'
});
}
function _j130() {
const _j1180 = document.querySelectorAll('.path-rotation-btn');
if (_j1180.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1180.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j562) {
btn.classList.add('active');
}
});
}
function _j131() {
const _j1200 = document.getElementById('current-brush-mode');
if (_j1200) {
_j1200.textContent = brushMode;
}
const _j1201 = document.getElementById('current-brush-size');
if (_j1201) {
const _j1202 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1201.textContent = _j1202[_j520] || 'M';
}
const _j1203 = document.getElementById('current-ink-effect');
if (_j1203) {
const _j1204 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1203.textContent = _j1204[useSharpen] || 'MIX';
}
const _j1205 = document.getElementById('current-brush-color');
if (_j1205) {
const _j1206 = {
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
_j1205.textContent = _j1206[brushColorMode] || 'Black';
}
}
function _j132() {
brushMode = 1;
_j520 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j562 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j122();
_j119();
_j126();
_j128();
_j130();
_j125();
_j131();
_j109('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j133(_j1499, _j1500) {
if (!_j1499) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1207 = 300;
_j1499.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1208 = window._elementLastTriggerTime.get(_j1499) || 0;
if (now - _j1208 < _j1207) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1499, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1499);
}, _j1207);
window._elementLastTriggerTime.set(_j1499, now);
e.stopPropagation();
e.preventDefault();
_j1500(e);
}, {
passive: false
});
_j1499.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1499)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1208 = window._elementLastTriggerTime.get(_j1499) || 0;
if (now - _j1208 < _j1207) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1499, now);
e.stopPropagation();
e.preventDefault();
_j1500(e);
});
_j1499.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j134() {
const _j1209 = document.getElementById('canvas-background-color');
const _j1210 = document.getElementById('canvas-background-color-text');
if (!_j1209 || !_j1210) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1211 = `#${r}${g}${b}`.toUpperCase();
_j1209.value = _j1211;
_j1210.value = _j1211;
}
}
function _j135() {
const _j1212 = document.getElementById('canvas-width');
const _j1213 = document.getElementById('canvas-height');
if (!_j1212 || !_j1213) {
return;
}
if (typeof _j490 !== 'undefined' && typeof _j491 !== 'undefined') {
_j1212.value = _j490;
_j1213.value = _j491;
}
}
function _j136() {
const _j1214 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1215 = _j1214 === 'collector';
if (_j1215) {
const controlPanel = _j65('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1216 = document.querySelectorAll('.brush-mode-btn');
_j1216.forEach(btn => {
_j133(btn, () => {
const mode = btn.dataset.mode;
_j120(mode);
});
});
const _j1217 = document.querySelectorAll('.brush-size-btn');
_j1217.forEach(btn => {
_j133(btn, () => {
const _j1218 = btn.dataset.size;
_j118(_j1218);
});
});
const _j1219 = document.querySelectorAll('.ink-effect-btn');
_j1219.forEach(btn => {
_j133(btn, () => {
const effect = btn.dataset.effect;
_j123(effect);
});
});
const _j1220 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1220.forEach(btn => {
_j133(btn, () => {
const color = btn.dataset.color;
if (color) {
_j127(color);
_j150();
}
});
});
const _j1221 = document.getElementById('custom-brush-color');
const _j1222 = document.getElementById('custom-brush-color-text');
if (_j1221 && _j1222) {
_j1221.addEventListener('input', (e) => {
_j1222.value = e.target.value.toUpperCase();
_j156();
});
_j1221.addEventListener('change', (e) => {
_j1222.value = e.target.value.toUpperCase();
_j156();
});
_j1222.addEventListener('input', (e) => {
const _j1211 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1211)) {
_j1221.value = _j1211.toUpperCase();
}
});
_j1222.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j156();
}
});
}
const _j1223 = document.querySelectorAll('.path-rotation-btn');
_j1223.forEach(btn => {
_j133(btn, () => {
const _j1224 = btn.dataset.rotation;
_j129(_j1224);
});
});
const _j1225 = document.querySelectorAll('.blendmode-btn');
_j1225.forEach(btn => {
_j133(btn, () => {
const mode = btn.dataset.mode;
_j124(mode);
});
});
const _j1226 = document.getElementById('clear-canvas');
if (_j1226) {
_j133(_j1226, () => {
_j162();
if (typeof _j225 !== 'undefined') {
_j225 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j109('ui', '🧹 Canvas cleared', {
Status: 'All drawings removed'
});
});
}
const _j1209 = document.getElementById('canvas-background-color');
const _j1210 = document.getElementById('canvas-background-color-text');
const _j1212 = document.getElementById('canvas-width');
const _j1213 = document.getElementById('canvas-height');
if (_j1209 && _j1210) {
_j1209.addEventListener('input', (e) => {
_j1210.value = e.target.value.toUpperCase();
});
_j1209.addEventListener('change', (e) => {
_j1210.value = e.target.value.toUpperCase();
_j157();
});
_j1210.addEventListener('input', (e) => {
const _j1211 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1211)) {
_j1209.value = _j1211.toUpperCase();
}
});
_j1210.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j157();
}
});
if (typeof _j134 === 'function') {
_j134();
} else {
setTimeout(() => {
if (typeof _j134 === 'function') {
_j134();
}
}, 100);
}
}
if (_j1212 && _j1213) {
_j1212.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j157();
}
});
_j1213.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j157();
}
});
if (typeof _j135 === 'function') {
_j135();
} else {
setTimeout(() => {
if (typeof _j135 === 'function') {
_j135();
}
}, 100);
}
}
const _j1227 = document.getElementById('panel-scale-slider');
if (_j1227) {
_j1227.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1227.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j72();
_j76();
_j80();
_j84();
});
}
const _j1228 = document.getElementById('toggle-control-panel');
if (_j1228) {
_j133(_j1228, _j100);
}
const controlPanel = _j65('controlPanel');
const _j1144 = controlPanel?.querySelector('.control-panel-header');
if (_j1144) {
_j1144.addEventListener('mousedown', _j73);
_j1144.addEventListener('touchstart', (e) => {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j73(_j1229);
});
}
const effectControlPanel = _j65('effectControlPanel');
const _j1230 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1230) {
_j1230.addEventListener('mousedown', _j77);
_j1230.addEventListener('touchstart', (e) => {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j77(_j1229);
});
}
const _j1231 = document.getElementById('toggle-effect-control-panel');
if (_j1231) {
_j133(_j1231, _j101);
}
const flowEffectPanel = _j65('flowEffectPanel');
const _j1232 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1232) {
_j1232.addEventListener('mousedown', _j81);
_j1232.addEventListener('touchstart', (e) => {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j81(_j1229);
});
}
const _j1233 = document.getElementById('toggle-flow-effect-panel');
if (_j1233) {
_j133(_j1233, _j102);
}
const maskPanel = _j65('maskPanel');
const _j1234 = maskPanel?.querySelector('.mask-panel-header');
if (_j1234) {
_j1234.addEventListener('mousedown', _j85);
_j1234.addEventListener('touchstart', (e) => {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j85(_j1229);
});
}
const _j1235 = document.getElementById('toggle-mask-panel');
if (_j1235) {
_j133(_j1235, function() {
_j103();
});
}
const _j1236 = document.getElementById('mask-mode-toggle');
if (_j1236) {
_j1236.addEventListener('change', function() {
if (!this.checked && _j542 === 'polygon' && _j544.length >= 3) {
drawMaskPolygon(_j544);
_j545 = { action: "polygon", points: _j544.map(p => ({ x: p.x, y: p.y })) };
}
_j540 = this.checked;
_j89();
_j90();
});
}
const _j1237 = document.getElementById('mask-rect-btn');
if (_j1237) {
_j133(_j1237, function() {
_j542 = 'rect';
_j540 = true;
if (_j1236) _j1236.checked = true;
_j89();
_j90();
});
}
const _j1238 = document.getElementById('mask-poly-btn');
if (_j1238) {
_j133(_j1238, function() {
if (_j540 && _j542 === 'polygon') {
if (_j544.length >= 3) {
drawMaskPolygon(_j544);
_j545 = { action: "polygon", points: _j544.map(p => ({ x: p.x, y: p.y })) };
}
_j540 = false;
if (_j1236) _j1236.checked = false;
} else {
_j542 = 'polygon';
_j540 = true;
_j544 = [];
if (_j1236) _j1236.checked = true;
}
_j89();
_j90();
});
}
const _j1239 = document.getElementById('mask-clear-btn');
if (_j1239) {
_j133(_j1239, function() {
clearMask();
_j545 = null;
_j90();
});
}
if (maskPanel && !_j690) {
maskPanel.style.display = 'none';
}
_j88();
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j104);
}
_j122();
_j119();
_j126();
_j128();
_j130();
_j125();
_j131();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j137() {
const now = millis();
const _j1240 = (now - _j1173) >= _j1174;
const recordingStatus = _j65('recordingStatus');
if (recordingStatus) {
if (_j614) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j65('playbackStatus');
const countdownStatus = _j65('countdownStatus');
if (_j622) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1240) {
const _j1241 = loopWaitDuration - (millis() - _j631);
const _j1242 = Math.ceil(_j1241 / 1000);
const _j821 = _j1241 / loopWaitDuration;
if (window.DEBUG_MODE && _j1242 !== _j1172) {
console.log(`Countdown: ${_j1242}s remaining (${Math.floor(_j821 * 100)}%)`);
_j1172 = _j1242;
}
const countdownText = _j65('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1242}s`;
}
const countdownCircle = _j65('countdownCircle');
if (countdownCircle) {
const _j1243 = 62.83;
const _j1244 = _j1243 * (1 - _j821);
countdownCircle.style.strokeDashoffset = _j1244;
}
}
} else {
_j1172 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1240) {
const _j421 = recordingData.events.length > 0 ?
_j624 / recordingData.events.length : 0;
const _j1245 = Math.round(_j421 * 100);
if (_j1245 !== _j1175) {
const progressFill = _j65('progressFill');
const progressText = _j65('progressText');
if (progressFill) progressFill.style.width = `${_j1245}%`;
if (progressText) progressText.textContent = `${_j1245}%`;
_j1175 = _j1245;
}
}
}
} else {
_j1172 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1240) {
_j1173 = now;
}
if (typeof _j113 === 'function') {
_j113();
}
}
function _j138(_j1501) {
const _j1246 = document.createElement('div');
_j1246.className = 'message-item new-message';
const _j1247 = document.createElement('span');
_j1247.className = 'message-icon';
_j1247.textContent = _j1501.icon;
const _j1248 = document.createElement('div');
_j1248.className = 'message-content';
const _j1249 = document.createElement('div');
_j1249.className = 'message-header';
const _j1250 = document.createElement('span');
_j1250.className = 'message-timestamp';
_j1250.textContent = _j1501.timestamp;
const _j1251 = document.createElement('span');
_j1251.className = `message-type ${_j1501.type}`;
_j1251.textContent = _j1501.type.toUpperCase();
_j1249.appendChild(_j1250);
_j1249.appendChild(_j1251);
const _j1252 = document.createElement('p');
_j1252.className = 'message-text';
_j1252.textContent = _j1501.message;
_j1248.appendChild(_j1249);
_j1248.appendChild(_j1252);
if (Object.keys(_j1501.data).length > 0) {
const _j1253 = document.createElement('div');
_j1253.className = 'message-data';
_j1253.textContent = JSON.stringify(_j1501.data, null, 2);
_j1248.appendChild(_j1253);
}
_j1246.appendChild(_j1247);
_j1246.appendChild(_j1248);
setTimeout(() => {
_j1246.classList.remove('new-message');
}, 300);
return _j1246;
}
function _j139() {
_j670 = !_j670;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j670) {
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j72();
} else {
_j93(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
}
}
localStorage.setItem('overlayVisible', _j670.toString());
}
function _j140() {
_j671 = [];
_j112();
}
function _j141() {
const _j1254 = document.getElementById('record-status-text');
if (_j1254) {
if (_j621 == 1) {
_j1254.textContent = 'ON';
_j1254.classList.add('active');
} else {
_j1254.textContent = 'OFF';
_j1254.classList.remove('active');
}
}
}
function _j142() {
const _j1255 = {};
const _j1256 = window.location.search;
if (!_j1256 || _j1256.length <= 1) {
return _j1255;
}
const _j1257 = _j1256.substring(1);
const _j1006 = _j1257.split('_');
const _j1258 = {
'wd': true,
'gr': true
};
for (const _j1259 of _j1006) {
if (!_j1259) continue;
const _j1260 = _j1259.indexOf(':');
if (_j1260 === -1) continue;
const key = _j1259.substring(0, _j1260);
const value = _j1259.substring(_j1260 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1261 = parseInt(value);
if (!isNaN(_j1261) && _j1261 > 0) {
_j1255[key] = _j1261;
}
continue;
}
if (_j1258[key]) {
const _j1262 = parseFloat(value);
if (!isNaN(_j1262) && _j1262 > 0) {
_j1255[key] = true;
_j1255[key + '_val'] = _j1262;
} else {
_j1255[key] = false;
}
} else {
_j1255[key] = value === '1';
}
}
}
return _j1255;
}
function _j143(_j1502) {
const _j1263 = {
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
for (const [_j1259, toggleId] of Object.entries(_j1263)) {
if (_j1502.hasOwnProperty(_j1259)) {
if (_j1259 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1264 = _j1502[_j1259];
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.checked = _j1264;
toggle.dispatchEvent(new Event('change'));
if (_j1259 === 'rs') {
const _j1265 = document.getElementById('rs-sliders-section');
if (_j1265) {
_j1265.style.display = _j1264 ? 'flex' : 'none';
}
} else if (_j1259 === 'distort') {
const _j1266 = document.getElementById('distort-sliders-section');
if (_j1266) {
_j1266.style.display = _j1264 ? 'flex' : 'none';
}
} else if (_j1259 === 'cl') {
const _j1267 = document.getElementById('cellular-sliders-section');
if (_j1267) {
_j1267.style.display = _j1264 ? 'flex' : 'none';
}
} else if (_j1259 === 'wd') {
const _j1268 = document.getElementById('white-dot-sliders-section');
if (_j1268) {
_j1268.style.display = _j1264 ? 'flex' : 'none';
}
if (_j1264 && _j1502['wd_val'] !== undefined) {
const _j1269 = document.getElementById('white-dot-density');
const _j1270 = document.getElementById('white-dot-density-value');
if (_j1269) _j1269.value = _j1502['wd_val'];
if (_j1270) _j1270.textContent = _j1502['wd_val'].toFixed(2);
}
} else if (_j1259 === 'gr') {
const _j1271 = document.getElementById('grain-sliders-section');
if (_j1271) {
_j1271.style.display = _j1264 ? 'flex' : 'none';
}
if (_j1264 && _j1502['gr_val'] !== undefined) {
const _j1272 = document.getElementById('grain-amount');
const _j1273 = document.getElementById('grain-amount-value');
if (_j1272) _j1272.value = _j1502['gr_val'];
if (_j1273) _j1273.textContent = _j1502['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1259}`);
}
}
}
}
function _j144() {
_j64();
const _j1274 = _j142();
const _j1275 = {
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
if (_j1274['w']) window._urlCanvasWidth = _j1274['w'];
if (_j1274['h']) window._urlCanvasHeight = _j1274['h'];
if (Object.keys(_j1274).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1259, _j1264] of Object.entries(_j1274)) {
const globalVarName = _j1275[_j1259];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1259 === 'loop') {
window[globalVarName] = _j1264 ? 1 : 0;
} else {
window[globalVarName] = _j1264;
}
}
}
const _j1276 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1277 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1259, globalVarName] of Object.entries(_j1276)) {
const valKey = _j1259 + '_val';
if (_j1274[valKey] !== undefined) {
window[globalVarName] = _j1274[valKey];
window[_j1277[_j1259]] = _j1274[valKey];
}
}
window._initialConsoleFromURL = _j1274.hasOwnProperty('console') ? _j1274.console : false;
}
const _j1214 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1215 = _j1214 === 'collector';
const _j1228 = document.getElementById('toggle-overlay');
const _j1278 = document.getElementById('toggle-hint-btn');
const _j1279 = document.getElementById('clear-bite-points');
const _j1280 = document.getElementById('scan-global');
const _j1281 = document.getElementById('scan-current');
const _j1282 = document.getElementById('scan-random');
const _j1283 = document.getElementById('scan-current-random');
const _j1284 = document.getElementById('brush-hint-btn');
const _j1285 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1285.length > 0) {
let _j1286 = 2;
if (typeof _j492 !== 'undefined') {
_j1286 = _j492;
}
const _j1287 = document.querySelector(`input[name="pixel-density"][value="${_j1286}"]`);
if (_j1287) {
_j1287.checked = true;
}
_j1285.forEach(_j1508 => {
_j1508.addEventListener('change', (e) => {
if (e.target.checked) {
const _j714 = parseInt(e.target.value);
if (typeof _j492 !== 'undefined') {
_j492 = _j714;
try {
sessionStorage.setItem('pendingPixelDensity', _j714.toString());
if (typeof _j614 !== 'undefined' && _j614 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j109('system', '🎨 Pixel density changed - reloading page', {
Value: _j714,
Status: 'Page will reload to recreate canvas with new pixel density',
Note: 'Current drawing will be cleared'
});
setTimeout(() => {
window.location.reload();
}, 300);
} catch (error) {
_j109('system', '❌ Failed to update pixel density', {
Error: error.message,
Status: 'Error'
});
}
} else {
_j109('system', '⚠️ Pixel variable not found', {
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
if (_j1215) {
if (_j1284) _j1284.style.display = 'none';
}
const _j1288 = document.getElementById('record-toggle');
const _j1254 = document.getElementById('record-status-text');
const _j1289 = document.getElementById('realtime-drawing-toggle');
const _j1290 = document.getElementById('realtime-drawing-status-text');
const _j1291 = document.getElementById('grid-overlay-toggle');
const _j1292 = document.getElementById('paper-texture-toggle');
const _j1293 = document.getElementById('camera-moving-toggle');
const _j1294 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1144 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j670) {
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j72();
} else {
overlay.classList.add('hidden');
hint.classList.remove('hidden');
}
}
const controlPanel = _j65('controlPanel');
if (controlPanel && brushHint) {
if (_j678) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1228) {
_j133(_j1228, _j139);
}
if (_j1278) {
_j133(_j1278, () => {
if (!_j92()) _j139();
});
}
if (_j1284) {
_j133(_j1284, () => {
if (!_j92()) _j100();
});
}
const _j1295 = document.getElementById('effect-hint-btn');
if (_j1295) {
_j133(_j1295, () => {
if (!_j92()) _j101();
});
}
const _j1296 = document.getElementById('flow-hint-btn');
if (_j1296) {
_j133(_j1296, () => {
if (!_j92()) _j102();
});
}
const _j1297 = document.getElementById('mask-hint-btn');
if (_j1297) {
_j133(_j1297, () => {
if (!_j92()) _j103();
});
}
const _j1298 = document.getElementById('agent-toggle-btn');
if (_j1298) {
_j133(_j1298, function() {
_j553 = !_j553;
if (_j553) {
_j551 = true;
_j554 = [];
_j1298.classList.add('agent-active');
_j1298.textContent = 'Agent ●';
console.log('[Agent] ON — recording paths with timestamps');
} else {
_j551 = false;
_j1298.classList.remove('agent-active');
_j1298.textContent = 'Agent';
console.log('[Agent] OFF — ' + _j554.length + ' points recorded');
}
});
}
if (_j1280) {
_j133(_j1280, () => {
if (typeof _j18 === 'function') {
const shapeType = _j151();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j799 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j799 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j799);
noiseSeed(_j799);
}
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j177('ec', {
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
function _j145(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j151();
let scanBounds = null;
let _j308 = null;
if (typeof _j564 !== 'undefined' && _j564.length > 0) {
if (strokeIndex !== null) {
_j308 = Math.max(0, Math.min(strokeIndex, _j564.length - 1));
} else {
const _j1299 = document.getElementById('stroke-select-slider');
if (_j1299) {
_j308 = parseInt(_j1299.value) || 0;
_j308 = Math.max(0, Math.min(_j308, _j564.length - 1));
}
}
if (_j308 !== null) {
const selectedStroke = _j564[_j308];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j109('system', `🎯 EACH: 使用笔画 #${_j308} 的网格区域`, {
Index: _j308,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: _j564.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j109('system', `🎯 EACH: 使用笔画 #${_j308} 的边界框（无网格数据）`, {
Index: _j308,
TotalStrokes: _j564.length
});
}
}
}
}
if (!scanBounds) {
if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
scanBounds = pendingBugBounds;
} else if (typeof _j564 !== 'undefined' && _j564.length > 0) {
const lastStroke = _j564[_j564.length - 1];
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
const _j799 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j799 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j799);
noiseSeed(_j799);
}
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j177('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j308,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1281) {
_j133(_j1281, () => {
_j145();
});
}
if (_j1283) {
_j133(_j1283, () => {
if (typeof _j564 !== 'undefined' && _j564.length > 0) {
const _j1300 = Math.floor(Math.random() * _j564.length);
const _j1299 = document.getElementById('stroke-select-slider');
const _j1301 = document.getElementById('stroke-index-display');
const _j1302 = document.getElementById('stroke-select-value');
if (_j1299) {
_j1299.value = _j1300;
_j1299.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1301) {
_j1301.textContent = _j1300;
}
if (_j1302) {
_j1302.textContent = _j1300;
}
_j109('system', `🎲 EACHR: 随机选择笔画 #${_j1300}`, {
RandomIndex: _j1300,
TotalStrokes: _j564.length
});
_j145(_j1300);
} else {
_j109('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1282) {
_j133(_j1282, () => {
if (typeof _j19 === 'function') {
const shapeType = _j151();
_j19(10, shapeType);
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
_j177('ec', {
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
if (_j1279) {
_j133(_j1279, () => {
if (typeof _j225 !== 'undefined' && _j225.length > 0) {
let pointCount = typeof _j225 !== 'undefined' ? _j225.length : 0;
if (typeof _j225 !== 'undefined') {
_j225 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j109('system', '🧹 清除虫咬点', {
'虫咬点': pointCount
});
} else {
_j109('system', '⚠️ 没有虫咬点可清除', {});
}
});
}
if (_j1288) {
_j1288.checked = (_j621 == 1);
_j141();
_j1288.addEventListener('change', (e) => {
_j621 = e.target.checked ? 1 : 0;
_j141();
_j109('system', `Record mode ${_j621 ? 'enabled' : 'disabled'}`, {
Status: _j621 ? 'ON' : 'OFF'
});
});
}
if (_j1289) {
_j1289.disabled = true;
if (_j1290) {
_j1290.textContent = 'DISABLED';
}
_j1289.addEventListener('change', (e) => {
e.target.checked = false;
_j109('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1291) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1291.checked = !!showGridOverlay;
}
} catch (e) {}
_j1291.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1512) {}
_j109('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1292) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1292.checked = !!showPaperTexture;
} else {
_j1292.checked = true;
}
} catch (e) {
_j1292.checked = true;
}
_j1292.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1512) {}
_j109('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1303 = document.getElementById('fit-canvas-toggle');
if (_j1303) {
_j1303.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
if (typeof window.toggleFitMode === 'function') {
window.toggleFitMode(enabled);
_j109('system', '🎨 Fit canvas', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
_j109('system', '⚠️ Fit mode function not available', {
Status: 'Error'
});
}
});
}
if (_j1293) {
try {
if (typeof doMoving !== 'undefined') {
_j1293.checked = !!doMoving;
} else {
_j1293.checked = false;
}
} catch (e) {
_j1293.checked = false;
}
_j1293.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1512) {}
_j109('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1294) {
try {
if (typeof loopToggle !== 'undefined') {
_j1294.checked = (loopToggle === 1);
} else {
_j1294.checked = false;
}
} catch (e) {
_j1294.checked = false;
}
_j1294.addEventListener('change', (e) => {
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
_j109('system', '🔁 Loop playback', {
Status: enabled ? 'Enabled ✅ (Auto repeat after 5s)' : 'Disabled ❌ (Single playback)'
});
} else {
console.warn('⚠️ loopToggle variable not found');
}
} catch (_j1512) {
console.error('Error setting loopToggle:', _j1512);
}
});
}
const _j1304 = document.getElementById('playback-offset-x');
const _j1305 = document.getElementById('playback-offset-y');
if (_j1304) {
if (typeof _j634 !== 'undefined') {
_j1304.value = _j634;
}
_j1304.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j634 !== 'undefined') {
_j634 = value;
_j109('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1305) {
if (typeof _j635 !== 'undefined') {
_j1305.value = _j635;
}
_j1305.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j635 !== 'undefined') {
_j635 = value;
_j109('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1306 = document.getElementById('distort-shader-toggle');
const _j1266 = document.getElementById('distort-sliders-section');
if (_j1306) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1306.checked = !!distortShaderEnabled;
if (_j1266) {
_j1266.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1306.checked = false;
if (_j1266) {
_j1266.style.display = 'none';
}
}
} catch (e) {
_j1306.checked = false;
if (_j1266) {
_j1266.style.display = 'none';
}
}
_j1306.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1266) {
_j1266.style.display = enabled ? 'flex' : 'none';
}
_j109('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1512) {
console.error('Error setting distortShaderEnabled:', _j1512);
}
});
}
const _j1307 = document.getElementById('distort-displacement-b');
const _j1308 = document.getElementById('distort-displacement-b-value');
if (_j1307 && _j1308) {
const _j1309 = parseFloat(_j1307.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1309;
}
_j1308.textContent = Math.round(_j1309);
_j1307.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1308.textContent = Math.round(value);
});
}
const _j1310 = document.getElementById('distort-displacement-c');
const _j1311 = document.getElementById('distort-displacement-c-value');
if (_j1310 && _j1311) {
const _j1309 = parseFloat(_j1310.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1309;
}
_j1311.textContent = Math.round(_j1309);
_j1310.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1311.textContent = Math.round(value);
});
}
const _j1312 = document.getElementById('distort-fbm-preview-toggle');
if (_j1312) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1312.checked = (distortShowFbmMask > 0.5);
} else {
_j1312.checked = false;
}
} catch (e) {
_j1312.checked = false;
}
_j1312.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = enabled ? 1.0 : 0.0;
_j109('system', '🎨 fBM Mask Preview', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShowFbmMask variable not found');
}
} catch (_j1512) {
console.error('Error setting distortShowFbmMask:', _j1512);
}
});
}
const _j1313 = document.getElementById('rs-toggle');
const _j1265 = document.getElementById('rs-sliders-section');
if (_j1313) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1313.checked = !!rsEnabled;
if (_j1265) {
_j1265.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1313.checked = false;
if (_j1265) {
_j1265.style.display = 'none';
}
}
} catch (e) {
_j1313.checked = false;
if (_j1265) {
_j1265.style.display = 'none';
}
}
_j1313.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1265) {
_j1265.style.display = enabled ? 'flex' : 'none';
}
_j109('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1512) {
console.error('Error setting rsEnabled:', _j1512);
}
});
}
const _j1314 = document.getElementById('rs-frequency');
const _j1315 = document.getElementById('rs-frequency-value');
if (_j1314 && _j1315) {
const _j1309 = parseFloat(_j1314.value);
if (typeof _j569 !== 'undefined') {
_j569 = _j1309;
}
_j1315.textContent = Math.round(_j1309);
_j1314.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j569 !== 'undefined') {
_j569 = value;
}
_j1315.textContent = Math.round(value);
});
}
const _j1316 = document.getElementById('rs-wave-speed');
const _j1317 = document.getElementById('rs-wave-speed-value');
if (_j1316 && _j1317) {
const _j1309 = parseFloat(_j1316.value);
if (typeof _j570 !== 'undefined') {
_j570 = _j1309;
}
_j1317.textContent = _j1309.toFixed(1);
_j1316.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j570 !== 'undefined') {
_j570 = value;
}
_j1317.textContent = value.toFixed(1);
});
}
const _j1318 = document.getElementById('rs-strength');
const _j1319 = document.getElementById('rs-strength-value');
if (_j1318 && _j1319) {
const _j1309 = parseFloat(_j1318.value);
if (typeof _j571 !== 'undefined') {
_j571 = _j1309;
}
_j1319.textContent = _j1309.toFixed(1);
_j1318.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j571 !== 'undefined') {
_j571 = value;
}
_j1319.textContent = value.toFixed(1);
});
}
const _j1320 = document.getElementById('rs-gradient-mix');
const _j1321 = document.getElementById('rs-gradient-mix-value');
if (_j1320 && _j1321) {
const _j1309 = parseFloat(_j1320.value);
if (typeof _j572 !== 'undefined') {
_j572 = _j1309;
}
_j1321.textContent = _j1309.toFixed(1);
_j1320.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j572 !== 'undefined') {
_j572 = value;
}
_j1321.textContent = value.toFixed(1);
});
}
const _j1322 = document.getElementById('rs-scale');
const _j1323 = document.getElementById('rs-scale-value');
if (_j1322 && _j1323) {
const _j1309 = parseFloat(_j1322.value);
if (typeof _j573 !== 'undefined') {
_j573 = _j1309;
}
_j1323.textContent = Math.round(_j1309);
_j1322.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j573 !== 'undefined') {
_j573 = value;
}
_j1323.textContent = Math.round(value);
});
}
const _j1324 = document.getElementById('cellular-toggle');
const _j1267 = document.getElementById('cellular-sliders-section');
if (_j1324) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1324.checked = !!cellularEnabled;
if (_j1267) {
_j1267.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1324.checked = false;
if (_j1267) _j1267.style.display = 'none';
}
} catch (e) {
_j1324.checked = false;
if (_j1267) _j1267.style.display = 'none';
}
_j1324.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1267) {
_j1267.style.display = enabled ? 'flex' : 'none';
}
_j109('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1512) {
console.error('Error setting cellularEnabled:', _j1512);
}
});
}
const _j1325 = document.getElementById('cellular-scale');
const _j1326 = document.getElementById('cellular-scale-value');
if (_j1325 && _j1326) {
const _j1309 = parseFloat(_j1325.value);
if (typeof _j574 !== 'undefined') _j574 = _j1309;
_j1326.textContent = _j1309.toFixed(1);
_j1325.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j574 !== 'undefined') _j574 = value;
_j1326.textContent = value.toFixed(1);
});
}
const _j1327 = document.getElementById('cellular-seed');
const _j1328 = document.getElementById('cellular-seed-value');
if (_j1327 && _j1328) {
const _j1309 = parseFloat(_j1327.value);
if (typeof _j575 !== 'undefined') _j575 = _j1309;
_j1328.textContent = _j1309.toFixed(1);
_j1327.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j575 !== 'undefined') _j575 = value;
_j1328.textContent = value.toFixed(1);
});
}
const _j1329 = document.getElementById('white-dot-toggle');
const _j1330 = document.getElementById('white-dot-sliders-section');
if (_j1329) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1329.checked = !!whiteDotEnabled;
if (_j1330) _j1330.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1329.checked = false;
if (_j1330) _j1330.style.display = 'none';
}
} catch (e) {
_j1329.checked = false;
if (_j1330) _j1330.style.display = 'none';
}
_j1329.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1330) _j1330.style.display = enabled ? 'flex' : 'none';
_j109('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1512) {
console.error('Error setting whiteDotEnabled:', _j1512);
}
});
}
const _j1331 = document.getElementById('white-dot-density');
const _j1332 = document.getElementById('white-dot-density-value');
if (_j1331 && _j1332) {
if (window._urlParamWdVal !== undefined) {
const _j1333 = window._urlParamWdVal;
_j576 = _j1333 * 0.1;
_j1331.value = _j1333;
_j1332.textContent = _j1333.toFixed(2);
} else {
const _j1333 = parseFloat(_j1331.value);
if (typeof _j576 !== 'undefined') _j576 = _j1333 * 0.1;
_j1332.textContent = _j1333.toFixed(2);
}
_j1331.addEventListener('input', (e) => {
const _j1333 = parseFloat(e.target.value);
if (typeof _j576 !== 'undefined') _j576 = _j1333 * 0.1;
_j1332.textContent = _j1333.toFixed(2);
});
}
const _j1334 = document.getElementById('grain-toggle');
const _j1335 = document.getElementById('grain-sliders-section');
if (_j1334) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1334.checked = !!grainEnabled;
if (_j1335) _j1335.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1334.checked = false;
if (_j1335) _j1335.style.display = 'none';
}
} catch (e) {
_j1334.checked = false;
if (_j1335) _j1335.style.display = 'none';
}
_j1334.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1335) _j1335.style.display = enabled ? 'flex' : 'none';
_j109('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1512) {
console.error('Error setting grainEnabled:', _j1512);
}
});
}
const _j1336 = document.getElementById('grain-amount');
const _j1337 = document.getElementById('grain-amount-value');
if (_j1336 && _j1337) {
if (window._urlParamGrVal !== undefined) {
const _j1333 = window._urlParamGrVal;
_j577 = _j1333 * 0.1;
_j1336.value = _j1333;
_j1337.textContent = _j1333.toFixed(2);
} else {
const _j1333 = parseFloat(_j1336.value);
if (typeof _j577 !== 'undefined') _j577 = _j1333 * 0.1;
_j1337.textContent = _j1333.toFixed(2);
}
_j1336.addEventListener('input', (e) => {
const _j1333 = parseFloat(e.target.value);
if (typeof _j577 !== 'undefined') _j577 = _j1333 * 0.1;
_j1337.textContent = _j1333.toFixed(2);
});
}
const _j1338 = document.getElementById('future-path-preview-toggle');
if (_j1338) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1338.checked = !!showFuturePathPreview;
} else {
_j1338.checked = true;
}
} catch (e) {
_j1338.checked = true;
}
_j1338.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j109('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1512) {
console.error('Error setting showFuturePathPreview:', _j1512);
}
});
}
if (recordBtn) {
_j133(recordBtn, () => {
if (!_j614 && !_j622) {
_j178();
_j113();
}
});
}
if (stopBtn) {
_j133(stopBtn, () => {
if (_j614) {
_j179();
} else if (_j622) {
_j182();
}
_j113();
});
}
if (playBtn) {
_j133(playBtn, () => {
if (!_j614 && !_j622 && recordingData.events.length > 0) {
startPlayback();
_j113();
}
});
}
if (loadBtn) {
_j133(loadBtn, () => {
if (!_j614 && !_j622) {
_j181();
}
});
}
const _j1339 = document.getElementById('load-image');
const _j1340 = document.getElementById('image-file-input');
if (_j1215) {
if (_j1339) _j1339.style.display = 'none';
} else if (_j1339 && _j1340) {
_j133(_j1339, () => {
_j1340.click();
});
_j1340.addEventListener('change', (e) => {
const _j1341 = e.target.files[0];
if (_j1341 && _j1341.type.startsWith('image/')) {
_j114(_j1341);
}
});
}
const _j1342 = document.getElementById('show-reference-image');
if (_j1342 && !_j1215) {
_j133(_j1342, () => {
_j115();
});
}
const _j1343 = document.getElementById('hide-reference-image');
if (_j1343 && !_j1215) {
_j133(_j1343, () => {
_j116();
});
}
if (_j1144) {
_j1144.addEventListener('mousedown', _j66);
_j1144.addEventListener('touchstart', (e) => {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j66(_j1229);
});
}
_j71();
const _j1344 = _j65('flowEffectPanel');
if (_j1344 && !_j1344.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1344.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1511 => {
const _j1345 = _j1511.getAttribute('data-panel');
const _j1346 = {
overlay: _j66,
control: _j73,
effect: _j77,
flow: _j81
};
const fn = _j1346[_j1345];
if (!fn) return;
_j1511.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1511.addEventListener('touchstart', (e) => {
const _j1152 = e.touches[0];
fn({ clientX: _j1152.clientX, clientY: _j1152.clientY, target: _j1511, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j70(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j67);
document.addEventListener('mouseup', _j68);
document.addEventListener('touchmove', (e) => {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY
};
_j67(_j1229);
});
document.addEventListener('touchend', _j68);
document.addEventListener('mousemove', _j74);
document.addEventListener('mouseup', _j75);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY
};
_j74(_j1229);
}
});
document.addEventListener('touchend', _j75);
document.addEventListener('mousemove', _j78);
document.addEventListener('mouseup', _j79);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY
};
_j78(_j1229);
}
});
document.addEventListener('touchend', _j79);
document.addEventListener('mousemove', _j82);
document.addEventListener('mouseup', _j83);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY
};
_j82(_j1229);
}
});
document.addEventListener('touchend', _j83);
document.addEventListener('mousemove', _j86);
document.addEventListener('mouseup', _j87);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1152 = e.touches[0];
const _j1229 = {
clientX: _j1152.clientX,
clientY: _j1152.clientY
};
_j86(_j1229);
}
});
document.addEventListener('touchend', _j87);
if (hint && !_j670) {
hint.classList.remove('hidden');
}
_j113();
_j149();
_j153();
_j158();
_j154();
_j80();
_j84();
const effectControlPanel = _j65('effectControlPanel');
const effectHint = _j65('effectHint');
const _j1231 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j682) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1231) {
_j1231.textContent = _j682 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j65('flowEffectPanel');
const flowHint = _j65('flowHint');
const _j1233 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j686) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1233) {
_j1233.textContent = _j686 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1274).length > 0) {
setTimeout(() => {
_j143(_j1274);
_j109('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1274).length
});
}, 200);
}
setTimeout(() => {
_j99();
_j98();
}, 100);
_j146();
}
let _j1347 = false;
let _j1348 = null;
function _j146() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j133(btn, _j147);
}
function _j147() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1349 = document.getElementById('effect-control-panel');
const _j1344 = document.getElementById('flow-effect-panel');
const maskPanel = document.getElementById('mask-panel');
const _j1350 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint, #mask-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1347) {
_j1348 = {
overlay: _j670,
control: _j678,
effect: _j682,
flow: _j686,
mask: _j690
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1349) _j1349.style.display = 'none';
if (_j1344) _j1344.style.display = 'none';
if (maskPanel) maskPanel.style.display = 'none';
_j1350.forEach(h => h.style.display = 'none');
_j670 = false;
_j678 = false;
_j682 = false;
_j686 = false;
_j690 = false;
_j1347 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1348 || { overlay: true, control: true, effect: true, flow: true, mask: true };
_j670 = s.overlay;
_j678 = s.control;
_j682 = s.effect;
_j686 = s.flow;
_j690 = s.mask !== undefined ? s.mask : true;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1349) _j1349.style.display = s.effect ? 'block' : 'none';
if (_j1344) _j1344.style.display = s.flow ? 'block' : 'none';
if (maskPanel) maskPanel.style.display = _j690 ? 'block' : 'none';
_j1350.forEach(h => h.style.display = '');
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
_j1347 = false;
_j1348 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j148();
}
}
function _j148() {
const _j1351 = [
{ panel: _j65('messageOverlay'), pos: _j674, update: _j72, defaultPos: { x: 50, y: 50 } },
{ panel: _j65('controlPanel'), pos: _j677, update: _j76, defaultPos: { x: 85, y: 50 } },
{ panel: _j65('effectControlPanel'), pos: _j681, update: _j80, defaultPos: { x: 15, y: 50 } },
{ panel: _j65('flowEffectPanel'), pos: _j685, update: _j84, defaultPos: { x: 50, y: 85 } }
];
_j1351.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1144 = panel.querySelector('.control-btn');
if (!_j1144) return;
const rect = _j1144.getBoundingClientRect();
const vw = window.innerWidth;
const vh = window.innerHeight;
if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) {
pos.x = defaultPos.x;
pos.y = defaultPos.y;
update();
}
});
_j108();
}
function activateZenMode() {
if (_j1347) return;
_j147();
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
let _j1352 = false;
const _j1353 = new MutationObserver(() => {
if (_j1352) return;
if (go()) {
_j1352 = true;
_j1353.disconnect();
}
});
_j1353.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1352) _j1353.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j149() {
const _j1354 = document.getElementById('metallic-strength');
const _j1355 = document.getElementById('metallic-strength-value');
if (_j1354 && _j1355) {
const _j1309 = parseFloat(_j1354.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1309 / 100;
}
_j1355.textContent = _j1309;
_j1354.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1355.textContent = value;
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
_j177('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1356 = document.getElementById('metallic-flow');
const _j1357 = document.getElementById('metallic-flow-value');
const _j1358 = document.getElementById('flow-auto-random');
let _j1359 = null;
if (_j1356 && _j1357) {
const _j1309 = parseFloat(_j1356.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1309 / 100;
}
_j1357.textContent = _j1309;
_j1356.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1357.textContent = value;
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
_j177('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1358 && _j1356 && _j1357) {
_j1358.addEventListener('click', () => {
const isActive = _j1358.getAttribute('data-active') === 'true';
if (isActive) {
_j1358.setAttribute('data-active', 'false');
_j1358.classList.remove('active');
if (_j1359) {
clearInterval(_j1359);
_j1359 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1358.setAttribute('data-active', 'true');
_j1358.classList.add('active');
_j1359 = setInterval(() => {
const _j307 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1356.value = _j307;
_j1357.textContent = _j307;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j307 / 50;
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
Object.keys(tintButtons).forEach(_j1417 => {
const _j1360 = document.getElementById(_j1417);
if (_j1360) {
_j1360.classList.remove('active');
}
});
btn.classList.add('active');
const _j1361 = btn.textContent.trim();
_j109('system', '🎨 Metal tint changed', {
Tint: _j1361,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
const tintType = id.replace('metal-', '');
_j177('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j150() {
_j122();
_j119();
_j126();
_j128();
_j130();
_j125();
}
function _j151() {
const _j1362 = document.querySelector('.shape-type-btn.active');
if (_j1362) {
return parseInt(_j1362.dataset.type);
}
return 0;
}
function _j152(type) {
const _j1180 = document.querySelectorAll('.shape-type-btn');
_j1180.forEach(btn => {
const _j1363 = parseInt(btn.dataset.type);
if (_j1363 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j153() {
const _j797 = document.getElementById('bugs-size');
const _j1364 = document.getElementById('bugs-size-value');
if (_j797 && _j1364) {
const _j1309 = parseFloat(_j797.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1309;
}
_j1364.textContent = _j1309;
_j797.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1364.textContent = value;
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
_j177('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1365 = document.querySelectorAll('.shape-type-btn');
_j1365.forEach(btn => {
_j133(btn, () => {
const type = parseInt(btn.dataset.type);
_j152(type);
});
});
}
function _j154() {
const _j1299 = document.getElementById('stroke-select-slider');
const _j1301 = document.getElementById('stroke-index-display');
const _j1366 = document.getElementById('stroke-total-display');
const _j1302 = document.getElementById('stroke-select-value');
if (!_j1299 || !_j1301 || !_j1366 || !_j1302) {
return;
}
function _j155(_j1503 = false) {
const strokeCount = (typeof _j564 !== 'undefined' && Array.isArray(_j564)) ?
_j564.length :
0;
const _j1367 = Math.max(0, strokeCount - 1);
_j1299.max = _j1367;
_j1366.textContent = strokeCount;
if (_j1503 || parseInt(_j1299.value) > _j1367) {
_j1299.value = _j1367;
}
const _j1368 = parseInt(_j1299.value) || 0;
_j1301.textContent = _j1368;
_j1302.textContent = _j1368;
}
_j155();
_j1299.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1301.textContent = value;
_j1302.textContent = value;
let gridParams = null;
let points = null;
if (typeof _j564 !== 'undefined' && Array.isArray(_j564) && _j564.length > 0) {
const _j1369 = Math.max(0, Math.min(value, _j564.length - 1));
const selectedStroke = _j564[_j1369];
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
let _j1370 = 0;
setInterval(() => {
const _j1371 = (typeof _j564 !== 'undefined' && Array.isArray(_j564)) ?
_j564.length :
0;
if (_j1371 !== _j1370) {
const _j536 = _j1371 > _j1370;
_j155(_j536);
_j1370 = _j1371;
}
}, 500);
window.updateStrokeSelector = _j155;
}
function _j156() {
const _j1221 = document.getElementById('custom-brush-color');
const _j1222 = document.getElementById('custom-brush-color-text');
if (!_j1221 || !_j1222) {
console.error('Custom brush color inputs not found');
return;
}
let _j1211 = _j1222.value.trim();
if (!_j1211 || !/^#[0-9A-Fa-f]{6}$/.test(_j1211)) {
_j1211 = _j1221.value;
}
const r = parseInt(_j1211.slice(1, 3), 16);
const g = parseInt(_j1211.slice(3, 5), 16);
const b = parseInt(_j1211.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j109('ui', '❌ Invalid custom brush color', {
Color: _j1211,
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
_j128();
_j131();
_j1221.value = _j1211.toUpperCase();
_j1222.value = _j1211.toUpperCase();
_j109('ui', '🎨 Custom brush color applied', {
Color: _j1211,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j157() {
const _j1209 = document.getElementById('canvas-background-color');
const _j1210 = document.getElementById('canvas-background-color-text');
const _j1212 = document.getElementById('canvas-width');
const _j1213 = document.getElementById('canvas-height');
let _j1372 = false;
if (_j1209 && _j1210) {
let _j1211 = _j1210.value.trim();
if (!_j1211 || !/^#[0-9A-Fa-f]{6}$/.test(_j1211)) {
_j1211 = _j1209.value;
}
const r = parseInt(_j1211.slice(1, 3), 16);
const g = parseInt(_j1211.slice(3, 5), 16);
const b = parseInt(_j1211.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j109('ui', '❌ Invalid background color', {
Color: _j1211,
Status: 'Please use format #RRGGBB'
});
return;
}
if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
_j109('ui', '❌ Color values out of range', {
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
_j109('ui', '❌ canvasBackgroundColor not found', {
Status: 'Error: Variable not defined'
});
return;
}
if (typeof _j610 !== 'undefined' && _j610) {
_j610.begin();
background(r, g, b);
_j610.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j552 !== 'undefined') {
_j552 = true;
}
_j1209.value = _j1211.toUpperCase();
_j1210.value = _j1211.toUpperCase();
_j109('ui', '🎨 Background color changed', {
Color: _j1211,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1212 && _j1213) {
const _j1373 = parseInt(_j1212.value);
const _j1374 = parseInt(_j1213.value);
if (isNaN(_j1373) || isNaN(_j1374)) {
_j109('ui', '❌ Invalid canvas size', {
Width: _j1212.value,
Height: _j1213.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1373 < 100 || _j1373 > 4000 || _j1374 < 100 || _j1374 > 4000) {
_j109('ui', '❌ Canvas size out of range', {
Width: _j1373,
Height: _j1374,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j490 !== 'undefined' && typeof _j491 !== 'undefined') {
if (_j490 !== _j1373 || _j491 !== _j1374) {
_j490 = _j1373;
_j491 = _j1374;
_j1372 = true;
_j109('ui', '📐 Canvas size changed', {
Width: `${_j1373}px`,
Height: `${_j1374}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1372) {
sessionStorage.setItem('pendingCanvasWidth', _j490.toString());
sessionStorage.setItem('pendingCanvasHeight', _j491.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1375 = null;
let _j1376 = null;
function _j158() {
const _j1377 = document.querySelectorAll('.flow-effect-btn');
const _j1378 = document.getElementById('flow-strength');
const _j1379 = document.getElementById('flow-strength-value');
if (_j1378 && _j1379) {
_j1378.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1379.textContent = value;
if (typeof _j592 !== 'undefined') {
_j592.blendVol = value;
}
});
}
const _j1380 = document.getElementById('flow-last-stroke-only');
if (_j1380) {
_j1380.addEventListener('change', (e) => {
if (typeof _j593 !== 'undefined') {
_j593 = e.target.checked;
_j109('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j593
});
}
});
}
_j1377.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j159(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j160(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1375 === btn) {
_j160(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j159(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j160(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j160(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1375) {
const blendType = parseInt(_j1375.dataset.type);
_j160(_j1375, blendType);
}
});
}
function _j159(btn, blendType) {
if (_j1375) return;
const bounds = typeof _j47 === 'function' ? _j47() : null;
if (!bounds) {
_j109('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1375 = btn;
btn.classList.add('active', 'running');
if (typeof flowEffectStrokeBounds !== 'undefined') {
flowEffectStrokeBounds = bounds;
}
if (typeof window !== 'undefined') {
window.flowEffectStrokeBounds = bounds;
}
const flowSeed = Math.floor(Math.random() * 1000000);
if (typeof _j48 === 'function') {
_j48(blendType, flowSeed);
}
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614) {
if (typeof _j617 !== 'undefined' && _j617 > 0 && typeof _j619 !== 'undefined') {
const _j803 = millis() - _j617;
if (_j803 > 0) {
_j619 += _j803;
_j617 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j803,
total: _j619
});
}
}
const _j1381 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j592 !== 'undefined') ? _j592.blendVol : 100,
lastStrokeOnly: (typeof _j593 !== 'undefined') ? _j593 : false
};
console.log('🎬 Recording flow start event:', _j1381);
_j177('flow', _j1381);
}
_j1376 = setInterval(() => {
const _j901 = document.getElementById('flow-iteration-count');
if (_j901 && typeof _j582 !== 'undefined') {
_j901.textContent = _j582;
}
}, 50);
_j109('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j160(btn, blendType) {
if (_j1375 !== btn) return;
btn.classList.remove('active', 'running');
_j1375 = null;
if (_j1376) {
clearInterval(_j1376);
_j1376 = null;
}
let _j1382 = null;
if (typeof _j49 === 'function') {
_j1382 = _j49();
}
if (typeof _j177 === 'function' && typeof _j614 !== 'undefined' && _j614 && _j1382) {
const _j1383 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j584 !== 'undefined') ? _j584 : 0,
duration: _j1382.duration,
iterations: _j1382.iterations,
totalFrames: _j1382.frames
};
console.log('🎬 Recording flow end event:', _j1383);
_j177('flow', _j1383);
if (typeof _j617 !== 'undefined') {
_j617 = millis();
}
}
_j109('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1382 ? Math.round(_j1382.duration) + 'ms' : 'unknown',
Iterations: _j1382 ? _j1382.iterations : 'unknown',
Frames: _j1382 ? _j1382.frames : 'unknown'
});
}
let _j1384 = {
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
_pushFR: function(_j1504) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1504;
this._frSum += _j1504;
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
const _j1385 = this._avgFR();
console.log('平均 frameRate:', _j1385.toFixed(2));
console.log('是否触发警告:', _j1385 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1386 = this.logCooldown;
this.logCooldown = 0;
const _j1387 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1387.toFixed(2));
_j35(_j1387);
this.logCooldown = _j1386;
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
const _j1385 = this._avgFR();
console.log('平均帧率:', _j1385);
const _j1386 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j35(_j1385);
this.logCooldown = _j1386;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1386 = this.logCooldown;
this.logCooldown = 0;
const _j1388 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1388);
_j35(_j1388);
this.logCooldown = _j1386;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1384 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1384).filter(k => typeof _j1384[k] === 'function'));
_j35(50);
};
function _j161() {
_j497 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j498 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j500 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j162() {
const _j471 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j471[0], _j471[1], _j471[2]);
if (typeof _j600 !== 'undefined' && _j600) {
_j600.begin();
clear();
background(255);
_j600.end();
}
if (typeof _j603 !== 'undefined' && _j603) {
_j603.begin();
clear();
background(255);
_j603.end();
}
if (typeof _j601 !== 'undefined' && _j601) {
_j601.clear();
}
if (typeof _j602 !== 'undefined' && _j602) {
_j602.begin();
clear();
background(255);
_j602.end();
}
if (typeof _j605 !== 'undefined' && _j605) {
_j605.clear();
_j605.background(255);
}
if (typeof _j608 !== 'undefined' && _j608) {
_j608.begin();
clear();
_j608.end();
}
if (typeof _j613 !== 'undefined' && _j613) {
_j613.begin();
clear();
background(0);
_j613.end();
}
_j534 = false;
_j535 = false;
_j555 = 0;
force = 1.0;
_j536 = false;
_j537 = false;
_j528 = 0;
x = hw;
y = hh;
_j512 = 0;
_j513 = 0;
_j514 = 0;
initialSize = 0;
_j517 = 0;
_j557 = 0;
pathPoints = [];
_j561 = false;
if (typeof _j564 !== 'undefined') {
_j564 = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j560 !== 'undefined') {
_j560 = null;
}
if (typeof _j565 !== 'undefined') {
_j565 = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j366 !== 'undefined') {
_j366 = null;
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
_j168();
_j165();
_j552 = true;
}
function _j163() {
_j109('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j164();
_j165();
_j167();
_j166();
_j109('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j164() {
_j600.begin();
clear();
background(255);
_j600.end();
_j603.begin();
clear();
background(255);
_j603.end();
_j601.clear();
_j602.begin();
clear();
background(255);
_j602.end();
_j605.clear();
_j605.background(255);
_j607.begin();
clear();
background(255);
_j607.end();
if (typeof _j611 !== 'undefined' && _j611) {
_j611.begin();
clear();
_j611.end();
}
_j608.begin();
clear();
_j608.end();
if (typeof _j613 !== 'undefined' && _j613) {
_j613.begin();
clear();
background(0);
_j613.end();
}
_j601.blendMode(BLEND);
_j605.blendMode(BLEND);
_j552 = true;
}
function _j165() {
if (!_j607 || !_j495) return;
if (_j495) {
_j607.begin();
if (_j578) {
image(_j603, 0, 0, width, height);
resetShader();
_j607.end();
return;
}
shader(_j495);
_j495.setUniform("rect", [0, 0, width * _j492, height * _j492]);
_j495.setUniform("tex0", _j603);
_j495.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j495.setUniform("forceMap", _j493);
_j495.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j495.setUniform("force", 1.0);
_j495.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j495.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j495.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j495.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j495.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j495.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j607.end();
}
}
function _j166() {
_j534 = false;
_j535 = false;
_j555 = 0;
force = 1.0;
_j536 = false;
_j537 = false;
_j528 = 0;
x = hw;
y = hh;
_j512 = 0;
_j513 = 0;
_j514 = 0;
initialSize = 0;
_j517 = 0;
_j515 = 0;
_j502 = 0;
_j556 = 0;
_j557 = 0;
pathPoints = [];
_j561 = false;
startX = hw;
startY = hh;
_j430 = hw;
_j431 = hh;
_j516 = 0;
_j525 = 0;
_j523 = hw;
_j524 = hh;
_j522 = [];
flyBrushEnd = [];
_j519 = 0;
_j626 = hw;
_j627 = hh;
_j628 = hw;
_j629 = hh;
_j630 = false;
_j632 = 0;
_j633 = false;
}
function _j167() {
_j493.begin();
shader(_j494);
_j494.setUniform("randomSeed1", _j594[0] || 100);
_j494.setUniform("randomSeed2", _j594[1] || 200);
_j494.setUniform("randomSeed3", _j594[2] || 300);
_j494.setUniform("randomSeed4", _j594[3] || 400);
_j494.setUniform("scale1", _j595[0] || 0.002);
_j494.setUniform("scale2", _j595[1] || 0.005);
_j494.setUniform("scale3", _j595[2] || 0.015);
_j494.setUniform("amplitude1", _j596[0] || 0.6);
_j494.setUniform("amplitude2", _j596[1] || 0.4);
_j494.setUniform("amplitude3", _j596[2] || 0.3);
_j494.setUniform("phase1", _j597[0] || 0);
_j494.setUniform("phase2", _j597[1] || 0);
_j494.setUniform("phase3", _j597[2] || 0);
_j494.setUniform("vortexScale1", _j598[0] || 0.008);
_j494.setUniform("vortexScale2", _j598[1] || 0.012);
_j494.setUniform("clusterScale1", _j599[0] || 0.001);
_j494.setUniform("clusterScale2", _j599[1] || 0.0008);
_j494.setUniform("canvasCenter", [hw, hh]);
_j494.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j493.end();
}
function _j168() {
for (let i = 0; i < 4; i++) {
_j594[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j595[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j596[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j597[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j598[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j599[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j167();
}
function _j169(title = '') {}
function _j170() {
_j171();
}
function _j171() {
_j168();
const _j1389 = brushMode;
brushMode = 1;
initialSize = 20;
_j517 = initialSize;
_j511 = _j517;
_j515 = _j511;
_j534 = true;
_j535 = false;
_j555 = 0;
_j536 = true;
_j537 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j30(_j603, 1.0);
}
mouseReleased();
_j535 = true;
_j555 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j30(_j603, force);
}
_j37();
brushMode = _j1389;
_j162();
}
function _j172() {
if (_j665) {
_j109('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j665 = true;
_j666 = millis();
frameCount = 0;
_j667 = [];
_j169('🎬 Start Frame Recording');
}
function _j173() {
if (!_j665) {
_j109('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j665 = false;
const _j1390 = millis() - _j666;
_j169('🎬 Frame Recording Complete');
_j175();
}
function _j174() {
if (!_j665) return;
if (frameCount % _j668 !== 0) {
frameCount++;
return;
}
const _j1391 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1391}.png`;
saveCanvas(filename, 'png');
_j667.push({
frame: frameCount,
timestamp: millis() - _j666,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j109('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j667.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j175() {
if (_j667.length === 0) {
_j109('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j109('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j667.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j176(_j1505) {
return Math.round(_j1505 * 100) / 100;
}
function _j177(type, data = {}) {
if (!_j614) return;
if (_j615 === 0) return;
const _j1392 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1393 = _j1392 + (millis() - _j615 - _j619);
const event = {
m: type,
t: Math.round(_j1393),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1394 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1395 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j109('recording', `${_j1394[type] || '📝'} Event recorded`, {
Type: _j1395[type] || type,
Time: `${_j1393.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j178() {
_j614 = true;
_j615 = 0;
_j617 = 0;
_j619 = 0;
_j620 = true;
_j502 = 0;
const _j1396 = seed;
const _j1397 = (typeof _j151 === 'function') ? _j151() : 0;
const _j1398 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1399 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1400 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1401 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1400[0] - rgb[0]) < 0.01 &&
Math.abs(_j1400[1] - rgb[1]) < 0.01 &&
Math.abs(_j1400[2] - rgb[2]) < 0.01) {
_j1401 = type;
break;
}
}
recordingData = {
version: "1.0",
startTime: _j615,
randomSeed: _j1396,
initialPathToggle: _j551,
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
shapeType: _j1397,
metallicStrength: _j1398,
metallicFlow: _j1399,
metallicTint: _j1400,
metallicTintType: _j1401
}
};
randomSeed(_j1396);
noiseSeed(_j1396);
_j169('🎬 Start Art Creation Recording');
if (typeof _j113 === 'function') {
_j113();
}
}
function _j179() {
if (!_j614) return;
_j614 = false;
randomSeed(seed);
noiseSeed(seed);
_j169('✨ Art Creation Recording Complete');
const _j1402 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j592 !== 'undefined' ? _j592.blendVol : 100,
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
_j180();
setTimeout(() => {
_j117();
}, 300);
if (typeof _j113 === 'function') {
_j113();
}
}
function _j180() {
if (recordingData.events.length === 0) {
_j109('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1403 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1404 = JSON.stringify(_j1403, null, 2);
const _j1405 = new Blob([_j1404], {
type: 'application/json'
});
const _j1406 = URL.createObjectURL(_j1405);
const _j1407 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1407.download = `drawing-recording-${timestamp}.json`;
_j1407.href = _j1406;
_j1407.click();
URL.revokeObjectURL(_j1406);
_j109('art', '💾 Art recording saved', {
File: _j1407.download,
Size: `${(_j1404.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j113 === 'function') {
_j113();
}
}
function _j181() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1341 = event.target.files[0];
if (!_j1341) return;
const _j1177 = new FileReader();
_j1177.onload = (e) => {
try {
const loadedData = JSON.parse(e.target.result);
if (!loadedData.version || !loadedData.events) {
_j109('system', '❌ Invalid recording file format', {
Status: 'Error'
});
return;
}
if (typeof window !== 'undefined') {
window.loadedRecordingData = JSON.parse(JSON.stringify(loadedData));
window.loadedRecordingFileName = _j1341.name;
}
recordingData = loadedData;
if (typeof _j564 !== 'undefined') {
_j564 = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j560 !== 'undefined') {
_j560 = null;
}
if (typeof _j565 !== 'undefined') {
_j565 = 0;
}
if (typeof _j225 !== 'undefined') {
_j225 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j169('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1408 = _j187(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1408) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1341.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j610 !== 'undefined' && _j610) {
_j610.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j610.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j134 === 'function') {
_j134();
}
_j109('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
setTimeout(() => {
startPlayback();
}, 500);
} catch (error) {
_j109('system', '❌ Failed to load recording', {
Error: error.message,
Status: 'Error'
});
}
};
_j1177.readAsText(_j1341);
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
_j109('system', '⚠️ No recording data to play', {
Status: 'Error'
});
return;
}
if (_j622) {
_j109('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j1034 !== 'undefined') {
_j1034 = [];
}
if (typeof _j1035 !== 'undefined') {
_j1035 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1409 = window.location.search || '';
const _j1410 = (key) => _j1409.includes('_' + key + ':') || _j1409.includes('?' + key + ':');
const _j1411 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1412 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1413 = recordingData.initialPanelToggles;
for (const _j1414 of _j1411) {
const urlKey = _j1412[_j1414.jsonKey];
if (urlKey && _j1410(urlKey)) continue;
const value = _j1413 ? _j1413[_j1414.jsonKey] : undefined;
const _j1415 = value !== undefined ? value : _j1414.defaultVal;
_j1414.setter(_j1415);
const _j1416 = document.getElementById(_j1414.toggleId);
if (_j1416) {
_j1416.checked = _j1414.isNumeric ? (_j1415 === 1) : !!_j1415;
}
}
_j162();
if (typeof clearMask === 'function') clearMask();
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j610 !== 'undefined' && _j610) {
_j610.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j610.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j552 !== 'undefined') {
_j552 = true;
}
if (typeof _j134 === 'function') {
_j134();
}
_j109('playback', '🎨 Background color restored', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
_j109('playback', 'Random seed reset', {
Seed: recordingData.randomSeed
});
} else {
_j109('system', '⚠️ No seed info in recording, playback may be inaccurate', {
Status: 'Warning'
});
}
_j622 = true;
_j623 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j624 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof _j565 !== 'undefined') {
_j565 = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j641 !== 'undefined') {
_j641 = 0;
}
_j630 = false;
_j626 = hw;
_j627 = hh;
_j628 = hw;
_j629 = hh;
_j557 = 0;
if (typeof _j664 !== 'undefined') {
_j664 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j560 !== 'undefined') {
_j560 = null;
}
if (typeof _j561 !== 'undefined') {
_j561 = false;
}
if (typeof _j564 !== 'undefined') {
_j564 = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j225 !== 'undefined') {
_j225 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j659 !== 'undefined') {
_j659 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j660 !== 'undefined') {
_j660 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j502 = 0;
_j632 = 0;
_j633 = false;
if (recordingData.initialPathToggle !== undefined) {
_j551 = recordingData.initialPathToggle;
_j109('playback', 'Path toggle restored', {
Status: _j551 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1190 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j109('playback', 'Brush color restored', {
Mode: _j1190[brushColorMode] || 'Unknown'
});
} else if (recordingData.initialWhiteBrushMode !== undefined) {
whiteBrushMode = recordingData.initialWhiteBrushMode;
brushColorMode = whiteBrushMode ? 1 : 0;
_j109('playback', 'Brush color restored (legacy)', {
Mode: whiteBrushMode ? "White ⚪" : "Black ⚫"
});
} else {
whiteBrushMode = false;
brushColorMode = 0;
}
_j169('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j152 === 'function') {
_j152(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1354 = document.getElementById('metallic-strength');
const _j1355 = document.getElementById('metallic-strength-value');
if (_j1354 && _j1355) {
_j1354.value = ec.metallicStrength;
_j1355.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1356 = document.getElementById('metallic-flow');
const _j1357 = document.getElementById('metallic-flow-value');
if (_j1356 && _j1357) {
_j1356.value = ec.metallicFlow;
_j1357.textContent = ec.metallicFlow;
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
const _j1417 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1417);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
}
}
_j109('playback', '✨ Effect Control restored', {
ShapeType: ec.shapeType !== undefined ? ec.shapeType : 'Unknown',
Strength: ec.metallicStrength !== undefined ? ec.metallicStrength : 'Unknown',
Flow: ec.metallicFlow !== undefined ? ec.metallicFlow : 'Unknown',
Tint: ec.metallicTintType || 'Unknown'
});
}
const _j1418 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1419 = window.location.search || '';
const _j1420 = (key) => _j1419.includes('_' + key + ':') || _j1419.includes('?' + key + ':');
for (const _j1414 of _j1418) {
if (_j1420(_j1414.urlKey)) continue;
_j1414.setter(false);
const _j1416 = document.getElementById(_j1414.toggleId);
if (_j1416) {
_j1416.checked = false;
}
const _j1421 = document.getElementById(_j1414.slidersId);
if (_j1421) {
_j1421.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1422 = document.getElementById('distort-fbm-preview-toggle');
if (_j1422) _j1422.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1423 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1423)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j109('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j592 !== 'undefined') {
_j592.blendVol = fe.flowStrength;
const _j1424 = document.getElementById('flow-strength');
const _j1425 = document.getElementById('flow-strength-value');
if (_j1424) _j1424.value = fe.flowStrength;
if (_j1425) _j1425.textContent = fe.flowStrength;
}
for (const _j1414 of _j1418) {
const value = fe[_j1414.jsonKey];
if (value === undefined) continue;
if (_j1420(_j1414.urlKey)) {
_j109('playback', `⏭️ Flow Effect: ${_j1414.jsonKey} skipped (URL override)`, {});
continue;
}
_j1414.setter(!!value);
const _j1416 = document.getElementById(_j1414.toggleId);
if (_j1416) {
_j1416.checked = !!value;
}
const _j1421 = document.getElementById(_j1414.slidersId);
if (_j1421) {
_j1421.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1422 = document.getElementById('distort-fbm-preview-toggle');
if (_j1422) _j1422.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1426 = document.getElementById('distort-displacement-b');
const _j1427 = document.getElementById('distort-displacement-b-value');
if (_j1426) _j1426.value = fe.distortDisplacementB;
if (_j1427) _j1427.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1428 = document.getElementById('distort-displacement-c');
const _j1429 = document.getElementById('distort-displacement-c-value');
if (_j1428) _j1428.value = fe.distortDisplacementC;
if (_j1429) _j1429.textContent = fe.distortDisplacementC;
}
_j109('playback', '✨ Flow Effect restored', {
Strength: fe.flowStrength,
Distort: !!fe.distortShaderEnabled ? 'ON' : 'OFF',
Cellular: !!fe.cellularEnabled ? 'ON' : 'OFF',
RS: !!fe.rsEnabled ? 'ON' : 'OFF',
WhiteDot: !!fe.whiteDotEnabled ? 'ON' : 'OFF',
Grain: !!fe.grainEnabled ? 'ON' : 'OFF'
});
} else {
_j109('playback', '🔄 Flow Effect: reset to defaults (no initialFlowEffect in JSON)', {});
}
if (_j1413) {
_j109('playback', '✨ Panel toggles restored', {
Paper: _j1413.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1413.showGridOverlay ? 'ON' : 'OFF',
Path: _j1413.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1413.screenText ? 'ON' : 'OFF',
Camera: _j1413.doMoving ? 'ON' : 'OFF',
Loop: _j1413.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j109('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j168();
_j165();
const _j1430 = recordingData.events[0];
if (_j1430 && _j1430.strokeData) {
const strokeData = _j1430.strokeData;
_j517 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j517;
nowSize = size;
}
_j30(_j603, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j637 === 'undefined' || !_j637) {
_j637 = true;
}
_j638 = true;
if (_j637 && _j636 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j413 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j413 / 2));
_j636.setAutoUpdate(true);
if (typeof _j636.setPanScale === 'function') {
_j636.setPanScale(0);
}
if (typeof _j636.setZoomScale === 'function') {
_j636.setZoomScale(0);
}
_j636.setCenter([0, 0, 0], 0);
_j636.setDistance(easycamInitialDistance, 0);
if (typeof _j643 !== 'undefined') {
_j643 = 1;
}
_j109('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j638 = false;
_j637 = false;
}
if (typeof _j113 === 'function') {
_j113();
}
}
function _j182() {
if (!_j622) return;
_j622 = false;
_j630 = false;
_j624 = 0;
isWaitingToLoop = false;
_j632 = 0;
_j633 = false;
randomSeed(seed);
noiseSeed(seed);
_j169('⏹️ Playback Ended');
_j185();
_j638 = false;
if (_j637 && _j636 !== null) {
try {
const _j412 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j415 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j416 = _j636.getCenter();
const _j417 = _j636.getDistance();
_j109('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j416[0].toFixed(2)}, ${_j416[1].toFixed(2)}, ${_j416[2].toFixed(2)}], Distance: ${_j417.toFixed(2)}`,
Target: `Center: [${_j412[0].toFixed(2)}, ${_j412[1].toFixed(2)}, ${_j412[2].toFixed(2)}], Distance: ${_j415.toFixed(2)}`
});
_j649 = true;
_j650 = millis();
_j647 = [_j416[0], _j416[1], _j416[2]];
_j651 = _j417;
_j648 = _j412;
_j652 = _j415;
setTimeout(() => {
if (_j636 !== null) {
_j636.setAutoUpdate(false);
const _j424 = _j636.getCenter();
const _j425 = _j636.getDistance();
const _j418 = 0.1;
const _j419 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j424[0] - _j412[0], 2) +
Math.pow(_j424[1] - _j412[1], 2) +
Math.pow(_j424[2] - _j412[2], 2)
);
const distanceDiff = Math.abs(_j425 - _j415);
_j109('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j424[0].toFixed(2)}, ${_j424[1].toFixed(2)}, ${_j424[2].toFixed(2)}], Distance: ${_j425.toFixed(2)}`,
Target: `Center: [${_j412[0].toFixed(2)}, ${_j412[1].toFixed(2)}, ${_j412[2].toFixed(2)}], Distance: ${_j415.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j418 && distanceDiff <= _j419) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j418 || distanceDiff > _j419) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j424[0].toFixed(3)}, ${_j424[1].toFixed(3)}, ${_j424[2].toFixed(3)}]`,
distance: _j425.toFixed(3)
}
});
_j636.setCenter(_j412, 0);
_j636.setDistance(_j415, 0);
const _j1431 = _j636.getCenter();
const _j1432 = _j636.getDistance();
_j109('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1431[0].toFixed(2)}, ${_j1431[1].toFixed(2)}, ${_j1431[2].toFixed(2)}]`,
Distance: _j1432.toFixed(2)
});
}
_j649 = false;
}
_j637 = false;
}, 2100);
_j109('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j412,
Distance: _j415.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j637 = false;
}
} else {
_j637 = false;
}
if (typeof _j113 === 'function') {
_j113();
}
}
window.startPlayback = startPlayback;
function _j183(event) {
const _j851 = event.m || event.type;
switch (_j851) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('播放_mousePressed_開始', 'mousePressed');
const _j1433 = _j535;
const _j1434 = event.t !== undefined ? event.t : event.time;
if (_j535) {
const _j761 = _j623;
if (window._fxVirtualTime === undefined) {
_j623 = millis() - _j1434 / _j625;
}
const _j1435 = _j761 - _j623;
const _j760 = (typeof _j632 !== 'undefined' && _j632 > 0) ?
(millis() - _j632) :
0;
if (typeof _j633 !== 'undefined') {
_j633 = false;
}
if (typeof _j632 !== 'undefined') {
_j632 = 0;
}
_j37();
_j535 = false;
_j555 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1436 = _j1434 - playbackLastStrokeEndEventTime;
const _j1437 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1438 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j38();
if (typeof _j1034 !== 'undefined') {
_j1034 = [];
}
if (typeof _j1035 !== 'undefined') {
_j1035 = 0;
}
if (typeof _j641 !== 'undefined') {
_j641++;
if (typeof _j644 !== 'undefined' && typeof _j642 !== 'undefined') {
_j644 = random(0, 1) > 0.7;
_j642 = _j641;
}
}
_j626 = event.x + (typeof _j634 !== 'undefined' ? _j634 : 0);
_j627 = event.y + (typeof _j635 !== 'undefined' ? _j635 : 0);
_j628 = _j626;
_j629 = _j627;
if (false) {
_j630 = true;
} else {
_j630 = false;
}
if (typeof _j664 !== 'undefined') {
_j664 = true;
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
_j558 = sd.mouseCountStart;
} else {
_j558 = 0;
}
_j556 = 0;
const offsetX = typeof _j634 !== 'undefined' ? _j634 : 0;
const offsetY = typeof _j635 !== 'undefined' ? _j635 : 0;
const _j1439 = event.x + offsetX;
const _j1440 = event.y + offsetY;
_j109('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1439.toFixed(0)}, ${_j1440.toFixed(0)})`
});
_j109('system', '|--------------------------------', {});
} else {
_j109('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j556 = 0;
}
_j502 = 0;
_j528 = 0;
x = _j626;
y = _j627;
_j512 = 0;
_j513 = 0;
_j514 = 0;
_j525 = 0;
_j519 = 0;
_j557 = 0;
_j555 = 0;
_j535 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j1034 !== 'undefined') {
_j1034 = [];
}
if (typeof _j526 !== 'undefined') {
_j526 = _j626;
_j527 = _j627;
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
_j507 = sd.step;
_j563 = sd.step2;
randStep = sd.randStep;
maxUpdates = sd.maxUpdates;
pathRotation = sd.pathRotation;
_j509 = sd.spring !== undefined ? sd.spring : 0.6;
_j510 = sd.friction !== undefined ? sd.friction : 0.5;
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
_j503 = sd.whiteMaxOpacity;
} else {
_j503 = 0.95;
}
if (sd.hueShift !== undefined) {
_j504 = sd.hueShift;
} else {
_j504 = 0.0;
}
if (sd.satShift !== undefined) {
_j505 = sd.satShift;
} else {
_j505 = 0.0;
}
if (sd.briShift !== undefined) {
_j506 = sd.briShift;
} else {
_j506 = 0.0;
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
_j545 = sd.maskData;
if (sd.maskData.action === 'rect') {
drawMaskRect(sd.maskData.x1, sd.maskData.y1, sd.maskData.x2, sd.maskData.y2);
} else if (sd.maskData.action === 'polygon') {
drawMaskPolygon(sd.maskData.points);
}
} else {
_j545 = null;
if (_j541) clearMask();
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j594[0] = fm.randomSeed1;
_j594[1] = fm.randomSeed2;
_j594[2] = fm.randomSeed3;
_j594[3] = fm.randomSeed4;
_j595[0] = fm.scale1;
_j595[1] = fm.scale2;
_j595[2] = fm.scale3;
_j596[0] = fm.amplitude1;
_j596[1] = fm.amplitude2;
_j596[2] = fm.amplitude3;
_j597[0] = fm.phase1;
_j597[1] = fm.phase2;
_j597[2] = fm.phase3;
_j598[0] = fm.vortexScale1;
_j598[1] = fm.vortexScale2;
_j599[0] = fm.clusterScale1;
_j599[1] = fm.clusterScale2;
_j167();
} else {
if (typeof _j168 === 'function') {
_j168();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j517 = initialSize;
_j511 = _j517;
_j515 = _j511;
_j528 = 0;
x = _j626;
y = _j627;
_j512 = 0;
_j513 = 0;
_j514 = 0;
_j525 = 0;
_j519 = 0;
_j534 = true;
_j535 = false;
_j555 = 0;
_j536 = true;
_j537 = false;
_j557 = 0;
startX = _j626;
startY = _j627;
pathPoints = [{
x: _j626,
y: _j627
}];
_j561 = true;
_j630 = true;
if (_j538) window._playbackPenPressure = -1;
_j30(_j603, 1.0);
crandomDebugger.checkpoint('播放_mousePressed_結束', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j626 = event.x + (typeof _j634 !== 'undefined' ? _j634 : 0);
_j627 = event.y + (typeof _j635 !== 'undefined' ? _j635 : 0);
if (_j538 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j538) window._playbackPenPressure = -1;
const _j806 = crandom.getCount();
const _j1441 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1441;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('播放_mouseReleased', 'mouseReleased');
const _j1442 = crandom.getCount();
const _j811 = _j1442 - _j806;
const _j1443 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j842 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j851 = e.m || e.type;
return _j851 === 'mr' || _j851 === 'mouseReleased';
}).length :
'?';
const _j812 = window.drawLoopCount || 0;
const _j1444 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 播放 [第 ${_j1443}/${_j842} 筆] | Draw: ${_j812} | Seed: ${_j1442}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1443);
crandomDebugger.compareStroke(_j1443);
_j626 = event.x + (typeof _j634 !== 'undefined' ? _j634 : 0);
_j627 = event.y + (typeof _j635 !== 'undefined' ? _j635 : 0);
_j630 = false;
if (!_j535) {
_j535 = true;
_j555 = 0;
if (typeof _j632 !== 'undefined') {
_j632 = millis();
}
if (typeof _j633 !== 'undefined') {
_j633 = true;
}
_j109('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j109('playback', 'Stroke reproduction complete', {
FinalSize: _j517.toFixed(2),
CountdownStatus: _j535 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j630) {
_j630 = true;
} else {
_j628 = _j626;
_j629 = _j627;
}
_j626 = event.x + (typeof _j634 !== 'undefined' ? _j634 : 0);
_j627 = event.y + (typeof _j635 !== 'undefined' ? _j635 : 0);
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
_j150();
_j109('playback', '⌨️ Simulate key: R', {
'Effect': 'Wet Ink'
});
} else if (k === 'p' || k === 'P') {} else if (k === 'o' || k === 'O') {
_j109('playback', '⌨️ Simulate key: O', {
'Loop toggle': 'Ignored during playback'
});
}
break;
case 'ec':
case 'effectControl':
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
const _j1445 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1446 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1364 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1364;
const _j797 = document.getElementById('bugs-size');
const _j798 = document.getElementById('bugs-size-value');
if (_j797 && _j798) {
_j797.value = _j1364;
_j798.textContent = _j1364;
}
}
const _j796 = {
action: action,
shapeType: _j1446,
bugsSize: _j1364,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1447 = null;
let _j1448 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j796);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1447 = window._scanGlobalPlaybackCount || 0;
_j1448 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1364;
}
const _j799 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1446);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1446);
}
}
if (_j799) {
randomSeed(_j799);
noiseSeed(_j799);
}
}
_j109('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1445,
ShapeType: _j1446 !== null ? _j1446 : 'Unknown',
BugsSize: _j1364,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1447,
CurrentCount: _j1448
});
} else if (action === 'scan-random') {
const _j1446 = event.shapeType !== undefined ? event.shapeType : null;
const _j1364 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1364;
const _j797 = document.getElementById('bugs-size');
const _j798 = document.getElementById('bugs-size-value');
if (_j797 && _j798) {
_j797.value = _j1364;
_j798.textContent = _j1364;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1446);
}
_j109('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1446 !== null ? _j1446 : 'Unknown',
BugsSize: _j1364
});
} else if (action === 'metallic-strength') {
const _j1355 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1355 / 100;
}
const _j1354 = document.getElementById('metallic-strength');
const _j1449 = document.getElementById('metallic-strength-value');
if (_j1354 && _j1449) {
_j1354.value = _j1355;
_j1449.textContent = _j1355;
}
_j109('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1355
});
} else if (action === 'bugs-size') {
const _j1364 = event.value !== undefined ? event.value : 10;
const _j797 = document.getElementById('bugs-size');
const _j798 = document.getElementById('bugs-size-value');
if (_j797 && _j798) {
_j797.value = _j1364;
window.bugsSize = _j1364;
_j798.textContent = _j1364;
_j109('system', '🐛 Bugs Size updated during playback', {
Value: _j1364
});
}
} else if (action === 'metallic-flow') {
const _j1357 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1357 / 100;
}
const _j1356 = document.getElementById('metallic-flow');
const _j1450 = document.getElementById('metallic-flow-value');
if (_j1356 && _j1450) {
_j1356.value = _j1357;
_j1450.textContent = _j1357;
}
_j109('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1357
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
const _j1417 = `metal-${tintType}`;
const btn = document.getElementById(_j1417);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
_j109('playback', '✨ Effect Control: Metal Tint', {
Tint: tintType,
RGB: `[${tintButtons[tintType].join(', ')}]`,
Applied: true
});
} else {
_j109('playback', '⚠️ Effect Control: Metal Tint (Unknown)', {
Tint: tintType,
Status: 'Unknown tint type, skipped'
});
}
}
break;
case 'flow':
if (event.action === 'start') {
if (typeof _j579 !== 'undefined' && _j579) {
if (typeof _j49 === 'function') {
_j49();
}
_j109('playback', '🌊 Flow Effect: 強制完成前一個效果');
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
if (event.strength !== undefined && typeof _j592 !== 'undefined') {
_j592.blendVol = event.strength;
}
if (typeof _j593 !== 'undefined') {
_j593 = event.lastStrokeOnly || false;
}
if (typeof _j48 === 'function') {
_j48(event.blendType, event.flowSeed, true);
}
_j109('playback', '🌊 Flow Effect: Start (預覽開始)', {
BlendType: event.blendType,
Seed: event.flowSeed,
Bounds: event.strokeBounds ? `[${event.strokeBounds.minX.toFixed(2)}, ${event.strokeBounds.minY.toFixed(2)}, ${event.strokeBounds.maxX.toFixed(2)}, ${event.strokeBounds.maxY.toFixed(2)}]` : 'None'
});
} else if (event.action === 'end') {
const _j1451 = window.pendingFlowEvent;
if (_j1451) {
if (typeof _j588 !== 'undefined') {
_j588 = event.totalFrames || (event.iterations * 3) || 30;
_j589 = event.iterations || 10;
}
_j109('playback', '🌊 Flow Effect: End (設定目標，等待預覽完成)', {
BlendType: _j1451.blendType,
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
_j109('playback', '🎭 Mask rect applied', {
Region: `(${event.x1.toFixed(0)},${event.y1.toFixed(0)})→(${event.x2.toFixed(0)},${event.y2.toFixed(0)})`
});
} else if (event.action === 'polygon') {
drawMaskPolygon(event.points);
_j109('playback', '🎭 Mask polygon applied', {
Points: event.points.length
});
} else if (event.action === 'clear') {
clearMask();
_j109('playback', '🎭 Mask cleared');
}
break;
}
}
function updatePlayback() {
if (!_j622) return;
const _j1452 = 200;
if (typeof window !== 'undefined') {
const _j1453 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1454 = millis() - window.lastEffectControlProcessTime;
if (_j1454 < _j1452) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1453 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1455 = millis() - _j631;
const _j1456 = Math.floor(_j1455 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1456) {}
if (_j1455 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ 倒数完成，准备重新播放');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j109('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j637 && _j636 !== null) {
const _j412 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j415 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j636.setCenter(_j412, 0);
_j636.setDistance(_j415, 0);
_j649 = false;
_j109('system', '🎥 Camera reset for loop', {
Center: `[${_j412[0].toFixed(2)}, ${_j412[1].toFixed(2)}, ${_j412[2].toFixed(2)}]`,
Distance: _j415.toFixed(2)
});
}
_j162();
if (typeof _j1034 !== 'undefined') {
_j1034 = [];
}
if (typeof _j1035 !== 'undefined') {
_j1035 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j623 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j624 = 0;
_j630 = false;
_j626 = hw;
_j627 = hh;
_j628 = hw;
_j629 = hh;
isWaitingToLoop = false;
_j557 = 0;
_j502 = 0;
_j632 = 0;
_j633 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j560 !== 'undefined') {
_j560 = null;
}
if (typeof _j561 !== 'undefined') {
_j561 = false;
}
if (typeof _j659 !== 'undefined') {
_j659 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j660 !== 'undefined') {
_j660 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j565 !== 'undefined') {
_j565 = 0;
}
if (window._initialConsoleFromURL === true && typeof window.screenText !== 'undefined') {
window.screenText = true;
const screenTextToggle = typeof document !== 'undefined' && document.getElementById ? document.getElementById('screen-text-toggle') : null;
if (screenTextToggle) {
screenTextToggle.checked = true;
}
}
window.showStrokeDivider = true;
_j109('playback', '🔁 Loop restart', {
Status: 'New round playback'
});
} else {
_j109('playback', '⏹️ Playback ended', {
Status: 'Single playback complete, no more loops'
});
_j182();
}
}
return;
}
if (_j624 >= recordingData.events.length && !isWaitingToLoop) {
if (_j630) {
_j630 = false;
if (!_j535) {
_j535 = true;
_j555 = 0;
_j552 = true;
}
}
if (_j535) {
if (_j555 < maxUpdates) {
return;
}
}
if (_j534) {
return;
}
console.log('🔍 播放结束检查:', {
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
window._fxDebug.eventsProcessed = _j624;
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
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function' && !window._fxPreviewTriggered) {
window._fxPreviewTriggered = true;
function _j184() {
console.log('[fxhash] Forcing final composite + capture...');
_j552 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j637 && _j636 !== null) {
_j649 = true;
_j650 = millis();
_j647 = [_j636.getCenter()[0], _j636.getCenter()[1], _j636.getCenter()[2]];
_j651 = _j636.getDistance();
_j648 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j652 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1457 = _j653 + 500;
console.log('[fxhash] Waiting ' + _j1457 + 'ms for camera reset before capture...');
setTimeout(_j184, _j1457);
} else {
_j184();
}
}
_j109('playback', 'Playback complete', {
Status: 'Waiting 30 seconds before loop'
});
if (window.DEBUG_MODE) console.log('✅ 开始倒数计时:', {
loopWaitDuration: loopWaitDuration,
startTime: millis()
});
isWaitingToLoop = true;
_j631 = millis();
} else {
_j109('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle 不等于 1，停止播放');
_j182();
}
return;
}
var _j766;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j766 = window._fxVirtualTime * _j625;
} else {
_j766 = (millis() - _j623) * _j625;
}
let _j1458 = 0;
const _j1459 = 100;
let _j1460 = 0;
const _j1461 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1462 = false;
while (_j624 < recordingData.events.length && _j1458 < _j1459) {
if (typeof _j579 !== 'undefined' && _j579 &&
typeof _j588 !== 'undefined' && _j588 > 0) {
break;
}
const event = recordingData.events[_j624];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j851 = event.m || event.type;
const _j1463 = _j851 === 'mp' || _j851 === 'mousePressed';
const _j1464 = _j851 === 'mr' || _j851 === 'mouseReleased';
const _j1465 = _j851 === 'ec' || _j851 === 'effectControl';
const _j1466 = _j851 === 'flow';
const _j1467 = _j851 === 'mask';
const _j767 = eventTime - _j766;
if (!_j1465 && !_j1466 && !_j1467 && eventTime > _j766 && _j624 + 1 < recordingData.events.length) {
const _j762 = recordingData.events[_j624 + 1];
const _j763 = _j762.m || _j762.type;
const _j764 = _j763 === 'mp' || _j763 === 'mousePressed';
if (_j764) {
if (_j1464) {
if (_j1462) {
break;
}
_j183(event);
_j624++;
_j1458++;
continue;
} else {
_j624++;
continue;
}
}
}
if (eventTime <= _j766) {
const _j1468 = _j851 === 'md' || _j851 === 'mouseDragged';
if (_j1468 && _j1460 >= _j1461) {
break;
}
if (_j1464 && _j1462) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1465 || _j1467 || !_j535 || (_j535 && _j630)) {
if (_j1465) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j183(event);
_j624++;
_j1458++;
if (_j1468) {
_j1460++;
_j1462 = true;
}
} else {
break;
}
} else {
const _j1468 = _j851 === 'md' || _j851 === 'mouseDragged';
if (_j1468 && _j1460 >= _j1461) {
break;
}
if (_j1464 && _j1462) {
break;
}
if (_j1465 || _j1466 || _j1467 || (_j1463 && !_j535) || _j767 < 100) {
if (_j1465) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j183(event);
_j624++;
_j1458++;
if (_j1468) {
_j1460++;
_j1462 = true;
}
} else {
break;
}
}
if (_j1460 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j185() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1469 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1469) {
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
const _j1470 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1471 = confirm(
`播放完成！\n\n` +
`已播放：${loadedData.events.length} 个事件\n` +
`文件：${_j1470}\n\n` +
`是否要继续录制（追加新内容）？\n\n` +
`点击"确定"继续录制\n` +
`点击"取消"结束`
);
if (_j1471) {
_j186(loadedData, _j1470);
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
function _j186(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j109('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j178();
return;
}
const _j1472 = loadedData.events[loadedData.events.length - 1];
const _j1402 = _j1472.t !== undefined ? _j1472.t : (_j1472.time !== undefined ? _j1472.time : 0);
_j614 = true;
_j615 = millis();
_j617 = 0;
_j619 = 0;
_j620 = true;
_j502 = 0;
recordingData = {
...loadedData,
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1402,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1396 = seed;
randomSeed(_j1396);
noiseSeed(_j1396);
_j169('🔄 Continue Recording from Loaded File');
_j109('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1402}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j113 === 'function') {
_j113();
}
}
function _j187(_j1506, _j1507) {
if (!_j1506 || !_j1507) {
_j109('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1506 && height === _j1507) {
_j109('system', '✅ Canvas size matches recording', {
Width: `${_j1506}px`,
Height: `${_j1507}px`
});
return false;
}
_j109('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1506}x${_j1507}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1506.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1507.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j109('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1506}x${_j1507}`
});
window.location.reload();
return true;
}
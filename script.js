function _j1(_j1505, _j1506) {
var _j196 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1505];
var _j197 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1506];
if (_j196 && _j197 && typeof createShader === 'function') {
return createShader(_j196, _j197);
}
return window['loadShader'](_j1505, _j1506);
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
const _j198 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j198,
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
const _j199 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j199.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j199.forEach((_j629, _j307) => {
console.log(`[${_j629.count}] args: [${_j629.args.join(', ')}]`);
if (_j629.caller) {
console.log(`    位置: ${_j629.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j200 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j200 > 0 ? '+' : ''}${_j200}`);
console.log('═══════════════════════════════════════');
return _j200;
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
const _j201 = playback.totalCount - recording.totalCount;
const percent = ((_j201 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j201) < 50 ? '✅' : Math.abs(_j201) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j201 > 0 ? '+' : ''}${_j201} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j202 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j203 = Array.from(_j202).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j204 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j204 === -1) return 0;
if (indexA === -1) return 1;
if (_j204 === -1) return -1;
return indexA - _j204;
});
let _j205 = 0;
const _j206 = [];
for (const stage of _j203) {
const recCount = recDeltas.get(stage) || 0;
const _j207 = playDeltas.get(stage) || 0;
const _j200 = _j207 - recCount;
_j205 += _j200;
if (Math.abs(_j200) > 0) {
_j206.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j207,
difference: _j200
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j206.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j208 = _j206.filter(d => Math.abs(d.difference) > 50);
if (_j208.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j208.length); i++) {
const d = _j208[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j209 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j210 = checkpoints[i];
const _j211 = checkpoints[i + 1];
if (_j211) {
const _j212 = `${_j210.name} → ${_j211.name}`;
const _j213 = _j211.count - _j210.count;
_j209.set(_j212, _j213);
}
}
return _j209;
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
const _j214 = [{
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
const _j215 = {};
_j214.forEach(color => {
_j215[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j215;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j216 = r > 20;
const _j217 = g > 20;
const _j218 = b > 20;
if (_j216 && _j217 && _j218) return 'rgb';
if (_j216 && _j217) return 'rg';
if (_j216 && _j218) return 'rb';
if (_j217 && _j218) return 'gb';
if (_j216) return 'r';
if (_j217) return 'g';
if (_j218) return 'b';
return 'rgb';
}
function _j4() {
let _j219 = '// ============================================\n';
_j219 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j219 += '// ============================================\n';
_j214.forEach(color => {
const [r, g, b] = color.rgb;
const _j220 = `COLOR_${color.name.toUpperCase()}`;
_j219 += `const vec3 ${_j220} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j219 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j219;
}
function _j5() {
let _j219 = '';
_j214.forEach((color, _j307) => {
const _j220 = `COLOR_${color.name.toUpperCase()}`;
if (_j307 === 0) {
_j219 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j219 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j219 += `        brushColor = ${_j220};\n`;
});
_j219 += `    }\n`;
return _j219;
}
function _j6() {
return _j214.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j214.find(c => c.id === id);
}
function _j8(name) {
return _j214.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j214,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j221 = null;
let _j222 = 0;
const _j223 = 2000;
function _j9(_j525 = 120, _j1507 = 12, _j1508 = 10, _j1509 = 5) {
const _j224 = Math.min(width, _j223);
const _j225 = Math.min(height, _j223);
const _j226 = (width > _j223 || height > _j223);
randomSeed(seed);
const _j227 = _j10(_j525, _j1509);
const _j228 = createGraphics(_j224, _j225, P2D);
const _j229 = createGraphics(_j224, _j225, P2D);
for (let i = -_j525; i < _j224 + _j525; i += _j224 / 500) {
for (let j = -_j525; j < _j225 + _j525; j += _j1507) {
_j228.image(_j227, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1508);
}
}
_j227.remove();
if (doSpotNoise) {
padfactor = 300;
_j229.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j224)
y = random(_j225)
_j229.push()
_j229.strokeWeight(random(1, 2))
_j229.stroke(0, random(10, 250))
_j229.noFill();
_j229.bezier(
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j225 + padfactor),
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j225 + padfactor),
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j225 + padfactor),
random(-padfactor, _j224 + padfactor),
random(-padfactor, _j225 + padfactor)
);
_j229.pop();
}
_j228.blendMode(DIFFERENCE);
_j228.image(_j229, 0, 0, _j224, _j225);
_j229.remove();
}
if (_j226) {
const _j230 = createGraphics(width, height);
_j230.image(_j228, 0, 0, width, height);
_j228.remove();
return _j230;
}
return _j228;
}
function _j10(_j1510 = 64, _j1509 = 0.5) {
const _j227 = createGraphics(_j1510, _j1510);
_j227.pixelDensity(1);
_j227.noSmooth();
_j227.clear();
_j227.noFill();
_j227.translate(_j1510 / 2, _j1510 / 2);
_j227.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j231 = 0.5 + crandom.random(0, 1) * 0.5;
const _j232 = pow(_j231, _j1509) * 255;
_j227.stroke(_j232, _j232, _j232, 255);
const radius = crandom.random() * _j1510 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j227.point(x, y);
}
_j227.resetMatrix();
return _j227;
}
let _j233 = [];
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
const _j234 = 8;
const _j235 = [];
for (let i = 0; i < _j234; i++) {
_j235.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j236 = floor(_j235[0].numCirclesRand);
for (let i = 0; i < _j236; i++) {
const _j237 = _j235[i];
circles.push({
x: cos(_j237.angle) * _j237.distance,
y: sin(_j237.angle) * _j237.distance,
radius: _j237.circleSize
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
const _j238 = [];
const _j239 = 3;
const _j240 = 48;
const _j235 = [];
const _j241 = crandom.random(1, 4);
const _j242 = crandom.random(0.4, 0.6);
const _j243 = floor(_j241);
for (let _j244 = 0; _j244 < _j239; _j244++) {
const _j245 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j244 * 500
};
_j235.push(_j245);
}
for (let _j244 = 0; _j244 < _j243; _j244++) {
const _j245 = _j235[_j244];
const offsetX = _j245.offsetX;
const offsetY = _j245.offsetY;
const layerRotation = _j245.layerRotation;
const sizeVariation = _j245.sizeVariation;
const _j246 = size * sizeVariation;
const _j247 = floor(_j245.numVerticesRand);
const noiseOffset = _j245.noiseOffset;
const _j248 = [];
for (let i = 0; i < _j247; i++) {
const angle = (i / _j247) * TWO_PI;
const _j249 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j250 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j251 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j252 = _j249 * 0.5 + _j250 * 0.3 + _j251 * 0.2;
const radius = _j246 * (0.4 + _j252 * _j242);
const _j253 = cos(angle) * radius;
const _j254 = sin(angle) * radius;
_j248.push({
x: _j253,
y: _j254
});
}
const _j255 = [];
for (let i = 0; i < _j248.length; i++) {
const _j256 = _j248[(i - 1 + _j248.length) % _j248.length];
const _j257 = _j248[i];
const _j211 = _j248[(i + 1) % _j248.length];
_j255.push({
x: (_j256.x + _j257.x * 2 + _j211.x) / 4,
y: (_j256.y + _j257.y * 2 + _j211.y) / 4
});
}
for (let v of _j255) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j258 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j238.push({
x: rotatedX + offsetX,
y: _j258 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j238
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j238 = [];
const _j239 = 3;
const _j235 = [];
const _j241 = crandom.random(1, 4);
const _j242 = crandom.random(0.15, 0.35);
const _j243 = floor(_j241);
let rotation = crandom.random(TWO_PI);
for (let _j244 = 0; _j244 < _j239; _j244++) {
const _j245 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j244 * 500
};
_j235.push(_j245);
}
for (let _j244 = 0; _j244 < _j243; _j244++) {
const _j245 = _j235[_j244];
const offsetX = _j245.offsetX;
const offsetY = _j245.offsetY;
const layerRotation = rotation + _j245.layerRotationOffset;
const sizeVariation = _j245.sizeVariation;
const _j246 = size * sizeVariation;
const lengthRatio = _j245.lengthRatio;
const _j259 = _j246 * lengthRatio;
const stripWidth = _j246 * _j245.stripWidth;
const _j247 = floor(_j245.numVerticesRand);
const noiseOffset = _j245.noiseOffset;
const _j248 = [];
for (let i = 0; i < _j247; i++) {
let _j253, _j254;
if (i < _j247 / 2) {
const _j260 = (i / (_j247 / 2));
_j253 = (_j260 - 0.5) * _j259;
const _j261 = noise(_j260 * 1.5 + noiseOffset, _j244 * 50);
_j254 = -stripWidth / 2 + (_j261 - 0.5) * stripWidth * _j242;
} else {
const _j260 = ((_j247 - 1 - i) / (_j247 / 2));
_j253 = (_j260 - 0.5) * _j259;
const _j261 = noise(_j260 * 1.5 + noiseOffset, 100 + _j244 * 50);
_j254 = stripWidth / 2 + (_j261 - 0.5) * stripWidth * _j242;
}
_j248.push({
x: _j253,
y: _j254
});
}
const _j255 = [];
for (let i = 0; i < _j248.length; i++) {
const _j256 = _j248[(i - 1 + _j248.length) % _j248.length];
const _j257 = _j248[i];
const _j211 = _j248[(i + 1) % _j248.length];
_j255.push({
x: (_j256.x + _j257.x * 2 + _j211.x) / 4,
y: (_j256.y + _j257.y * 2 + _j211.y) / 4
});
}
for (let v of _j255) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j258 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j238.push({
x: rotatedX + offsetX,
y: _j258 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j238
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j238 = [];
const _j262 = 2;
const _j263 = 30;
const _j264 = 8;
const _j265 = 300;
const _j235 = [];
const _j266 = crandom.random(1, 3);
const _j267 = floor(_j266);
for (let _j268 = 0; _j268 < _j262; _j268++) {
const _j269 = {
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
for (let step = 0; step < _j263; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j269.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j265; i++) {
_j269.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j235.push(_j269);
}
for (let _j268 = 0; _j268 < _j267; _j268++) {
const _j269 = _j235[_j268];
let branchAngle = _j269.branchAngle;
let branchOffsetX = _j269.branchOffsetX;
let branchOffsetY = _j269.branchOffsetY;
let _j270 = _j269.numLRand > 0.2 ? 1 : 2;
let _j271 = floor(_j269.numStepsRand) * _j270;
let stepSize = _j269.stepSize;
let noiseScale = _j269.noiseScale;
let noiseStrength = _j269.noiseStrength;
let thickness = _j269.thickness;
let pathPoints = [];
let _j272 = branchOffsetX;
let _j273 = branchOffsetY;
let _j274 = branchAngle;
pathPoints.push({
x: _j272,
y: _j273
});
for (let step = 0; step < _j271; step++) {
const stepRandoms = _j269.stepRandoms[step];
const t = step / _j271;
const _j275 = noise(step * noiseScale, seed * 0.01);
const _j276 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j275 - 0.5) * PI * noiseStrength;
_j274 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j277 = stepSize * stepVariation;
_j272 += cos(_j274) * _j277;
_j273 += sin(_j274) * _j277;
pathPoints.push({
x: _j272,
y: _j273
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j271 - 3) {
const _j278 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j274 + stepRandoms.subBranchAngle;
let _j279 = _j272;
let _j280 = _j273;
for (let _j281 = 0; _j281 < _j278; _j281++) {
const _j282 = noise(step * noiseScale + _j281 * 0.5, seed * 0.01 + 200);
const _j283 = (_j282 - 0.5) * PI * 0.5;
const _j284 = subBranchAngle + _j283;
_j279 += cos(_j284) * stepSize * 0.6;
_j280 += sin(_j284) * stepSize * 0.6;
pathPoints.push({
x: _j279,
y: _j280
});
}
}
}
const _j285 = [];
const _j286 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j287;
if (i === 0) {
const _j211 = pathPoints[i + 1];
_j287 = atan2(_j211.y - point.y, _j211.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j256 = pathPoints[i - 1];
_j287 = atan2(point.y - _j256.y, point.x - _j256.x) + HALF_PI;
} else {
const _j256 = pathPoints[i - 1];
const _j211 = pathPoints[i + 1];
const _j288 = atan2(point.y - _j256.y, point.x - _j256.x);
const _j289 = atan2(_j211.y - point.y, _j211.x - point.x);
_j287 = ((_j288 + _j289) / 2) + HALF_PI;
}
const _j290 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j291 = _j269.thicknessRandoms[Math.min(i, _j269.thicknessRandoms.length - 1)];
const _j292 = thickness * _j290 * _j291;
_j285.push({
x: point.x + cos(_j287) * _j292 / 2,
y: point.y + sin(_j287) * _j292 / 2
});
_j286.push({
x: point.x - cos(_j287) * _j292 / 2,
y: point.y - sin(_j287) * _j292 / 2
});
}
for (let v of _j285) {
_j238.push(v);
}
for (let i = _j286.length - 1; i >= 0; i--) {
_j238.push(_j286[i]);
}
}
return {
type: 'lightning',
vertices: _j238
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j238 = [];
const _j262 = 3;
const _j263 = 75;
const _j264 = 8;
const _j265 = 800;
const _j235 = [];
const _j266 = crandom.random(1, 4);
const _j267 = floor(_j266);
size = size * 3;
for (let _j268 = 0; _j268 < _j262; _j268++) {
const _j269 = {
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
for (let step = 0; step < _j263; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j269.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j265; i++) {
_j269.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j235.push(_j269);
}
for (let _j268 = 0; _j268 < _j267; _j268++) {
const _j269 = _j235[_j268];
let branchAngle = _j269.branchAngle;
let branchOffsetX = _j269.branchOffsetX;
let branchOffsetY = _j269.branchOffsetY;
let _j270 = _j269.numLRand > 0.2 ? 1 : 5;
let _j271 = floor(_j269.numStepsRand) * _j270;
let stepSize = _j269.stepSize;
let noiseScale = _j269.noiseScale;
let noiseStrength = _j269.noiseStrength;
let thickness = _j269.thickness;
let pathPoints = [];
let _j272 = branchOffsetX;
let _j273 = branchOffsetY;
let _j274 = branchAngle;
pathPoints.push({
x: _j272,
y: _j273
});
for (let step = 0; step < _j271; step++) {
const stepRandoms = _j269.stepRandoms[step];
const t = step / _j271;
const _j275 = noise(step * noiseScale, seed * 0.01);
const _j276 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j275 - 0.5) * PI * noiseStrength;
_j274 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j277 = stepSize * stepVariation;
_j272 += cos(_j274) * _j277;
_j273 += sin(_j274) * _j277;
pathPoints.push({
x: _j272,
y: _j273
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j271 - 3) {
const _j278 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j274 + stepRandoms.subBranchAngle;
let _j279 = _j272;
let _j280 = _j273;
for (let _j281 = 0; _j281 < _j278; _j281++) {
const _j282 = noise(step * noiseScale + _j281 * 0.5, seed * 0.01 + 200);
const _j283 = (_j282 - 0.5) * PI * 0.5;
const _j284 = subBranchAngle + _j283;
_j279 += cos(_j284) * stepSize * 0.6;
_j280 += sin(_j284) * stepSize * 0.6;
pathPoints.push({
x: _j279,
y: _j280
});
}
}
}
const _j285 = [];
const _j286 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j287;
if (i === 0) {
const _j211 = pathPoints[i + 1];
_j287 = atan2(_j211.y - point.y, _j211.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j256 = pathPoints[i - 1];
_j287 = atan2(point.y - _j256.y, point.x - _j256.x) + HALF_PI;
} else {
const _j256 = pathPoints[i - 1];
const _j211 = pathPoints[i + 1];
const _j288 = atan2(point.y - _j256.y, point.x - _j256.x);
const _j289 = atan2(_j211.y - point.y, _j211.x - point.x);
_j287 = ((_j288 + _j289) / 2) + HALF_PI;
}
const _j290 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j291 = _j269.thicknessRandoms[Math.min(i, _j269.thicknessRandoms.length - 1)];
const _j292 = thickness * _j290 * _j291;
_j285.push({
x: point.x + cos(_j287) * _j292 / 2,
y: point.y + sin(_j287) * _j292 / 2
});
_j286.push({
x: point.x - cos(_j287) * _j292 / 2,
y: point.y - sin(_j287) * _j292 / 2
});
}
for (let v of _j285) {
_j238.push(v);
}
for (let i = _j286.length - 1; i >= 0; i--) {
_j238.push(_j286[i]);
}
}
return {
type: 'lightning',
vertices: _j238
};
}
function _j17(_j1511, shapeData, px, py, r, g, b, alpha) {
_j1511.fill(r, g, b, alpha);
_j1511.noStroke();
const scale = 1 / _j506;
switch (shapeData.type) {
case 'polygon':
case 'blob':
case 'jagged':
case 'strip':
case 'lightning':
_j1511.beginShape();
for (let v of shapeData.vertices) {
_j1511.vertex(px + v.x * scale, py + v.y * scale);
}
_j1511.endShape(CLOSE);
break;
case 'cluster':
for (let circle of shapeData.circles) {
_j1511.ellipse(
px + circle.x * scale,
py + circle.y * scale,
circle.radius * 2 * scale,
circle.radius * 2 * scale
);
}
break;
}
}
function _j18(_j1512 = null, scanBounds = null, shapeType = null, _j1513 = null) {
let _j293 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j293 = crandom.getCount();
}
const w = _j1512 ? _j1512.width : width;
const h = _j1512 ? _j1512.height : height;
const d = _j1512 ? _j1512.pixelDensity() : pixelDensity();
const _j294 = 20;
const _j295 = 700;
const _j296 = 80;
let _j297 = canvasBackgroundColor[0];
let _j298 = canvasBackgroundColor[1];
let _j299 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j300 = _j1513 && _j1513.length > 0;
if (_j300) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1513.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j301 = _j1512 || window;
_j301.loadPixels();
pixels = _j1512 ? _j1512.pixels : window.pixels;
let _j302 = [];
const step = 4;
let _j303 = _j294;
let _j304 = w - _j294;
let _j305 = _j294;
let _j306 = h - _j294;
for (let y = _j305; y < _j306; y += step) {
for (let x = _j303; x < _j304; x += step) {
let _j307 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j307];
let g = pixels[_j307 + 1];
let b = pixels[_j307 + 2];
let a = pixels[_j307 + 3];
let brightness = r + g + b;
let _j308 = Math.abs(r - _j297) + Math.abs(g - _j298) + Math.abs(b - _j299);
if (a > 100 && brightness < _j295 && _j308 > _j296) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j302.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j302.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j302.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j302.sort((a, b) => a.brightness - b.brightness);
if (_j302.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j302.length} 個），無法生成蟲咬效果`);
return;
}
let _j309 = [];
for (let i = 0; i < _j302.length; i++) {
_j309.push(i);
}
const _j310 = Math.floor(_j302.length * 0.5);
const _j311 = _j309.slice(0, Math.max(_j310, 10));
for (let i = 0; i < 10 && _j311.length > 0; i++) {
const _j312 = [];
let _j313 = 0;
for (let j = 0; j < _j311.length; j++) {
const _j314 = Math.pow(1 - (j / _j311.length), 2);
_j312.push(_j314);
_j313 += _j314;
}
let _j315 = crandom.random(0, _j313);
let _j316 = 0;
let _j317 = 0;
for (let j = 0; j < _j312.length; j++) {
_j317 += _j312[j];
if (_j315 <= _j317) {
_j316 = j;
break;
}
}
const _j318 = _j311.splice(_j316, 1)[0];
targetPoints.push(_j302[_j318]);
}
if (typeof _j622 !== 'undefined' && _j622 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j319 = [];
const _j320 = 30;
const _j321 = 4;
let _j322 = 0;
const _j323 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j324 = [];
const _j235 = [];
const _j325 = [];
for (let _j326 = 0; _j326 < numBites; _j326++) {
const _j327 = [];
for (let _j328 = 0; _j328 < _j323; _j328++) {
_j327.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j235.push(_j327);
_j325.push({
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
let _j329 = 0;
let _j330 = false;
let _j331, _j332, distance;
const _j327 = _j235[i];
const _j333 = _j325[i];
if (_j300) {
const _j237 = _j327[0];
let r = sqrt(_j237.r) * _j320;
let angle = _j237.angle + _j237.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j331 = Math.floor(target.x + offsetX);
_j332 = Math.floor(target.y + offsetY);
_j331 = constrain(_j331, _j294, w - _j294);
_j332 = constrain(_j332, _j294, h - _j294);
_j330 = true;
for (let _j334 of _j324) {
let dist = Math.sqrt(
Math.pow(_j331 - _j334.x, 2) +
Math.pow(_j332 - _j334.y, 2)
);
if (dist < _j321) {
_j330 = false;
break;
}
}
} else {
while (!_j330 && _j329 < _j323) {
const _j237 = _j327[_j329];
let r = sqrt(_j237.r) * _j320;
let angle = _j237.angle;
angle += _j237.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j331 = Math.floor(target.x + offsetX);
_j332 = Math.floor(target.y + offsetY);
_j331 = constrain(_j331, _j294, w - _j294);
_j332 = constrain(_j332, _j294, h - _j294);
let _j318 = 4 * ((_j332 * d) * (w * d) + (_j331 * d));
let _j335 = pixels[_j318];
let _j336 = pixels[_j318 + 1];
let _j337 = pixels[_j318 + 2];
let _j338 = pixels[_j318 + 3];
let _j339 = _j335 + _j336 + _j337;
let _j340 = Math.abs(_j335 - _j297) + Math.abs(_j336 - _j298) + Math.abs(_j337 - _j299);
if (_j338 <= 100 || _j339 >= _j295 || _j340 <= _j296) {
_j330 = false;
_j329++;
if (_j329 >= _j323) {
_j322++;
}
continue;
}
_j330 = true;
for (let _j334 of _j324) {
let dist = Math.sqrt(
Math.pow(_j331 - _j334.x, 2) +
Math.pow(_j332 - _j334.y, 2)
);
if (dist < _j321) {
_j330 = false;
break;
}
}
_j329++;
}
}
let _j341 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j341 *= 1.3;
}
let _j342 = floor(target.x * 1000 + target.y * 333 + _j333.shapeSeedRand);
let _j343 = 0;
let _j344 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j343 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j341, _j342, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j344 = crandom.getCount();
if (!_j333.shapeRandomCount) {
_j333.shapeRandomCount = _j344 - _j343;
}
}
if (_j330) {
let r, g, b;
let _j345 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j345[0] < 0.2 && _j345[1] < 0.15 && _j345[2] < 0.1) {
r = Math.floor(38 + _j333.colorRand1 * (51 - 38));
g = Math.floor(31 + _j333.colorRand2 * (38 - 31));
b = Math.floor(20 + _j333.colorRand3 * (26 - 20));
} else {
r = 230 + _j333.colorRand1 * (255 - 230);
g = 160 + _j333.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j331,
y: _j332,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j341,
shapeData: shapeData
};
_j324.push(point);
_j319.push(point);
}
}
}
_j233 = _j233.concat(_j319);
let _j346 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j319) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j346++;
let _j347 = point.size || 2.5;
let _j348 = map(_j347, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j348
});
}
let _j349 = boidSpawners.slice(-_j346);
if (_j346 > 0) {
let sizeMultipliers = _j349.map(s => s.boidSizeMultiplier);
let _j350 = Math.min(...sizeMultipliers);
let _j351 = Math.max(...sizeMultipliers);
let _j352 = (_j346 / _j319.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j346} 個 Boid Spawners (虫咬點的 ${_j352}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j350.toFixed(2)} ~ ${_j351.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j319.length > 0) {
let _j353 = Infinity;
let _j354 = 0;
for (let point of _j319) {
let brightness = point.r + point.g + point.b;
_j353 = Math.min(_j353, brightness);
_j354 = Math.max(_j354, brightness);
}
if (_j322 > 0) {
console.log(`⚠️ 跳過了 ${_j322} 個不在筆墨區域的點`);
}
}
const _j355 = _j319.length;
if (_j355 > 0) {
_j112('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j355,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j356 = crandom.getCount();
const _j357 = _j356 - _j293;
if (typeof _j630 !== 'undefined' && _j630 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j358 = currentScanEvent.recordedRandomCount;
const _j200 = _j357 - _j358;
const percent = _j358 > 0 ? ((_j200 / _j358) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j200) < 50 ? '✅' : Math.abs(_j200) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j359 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j360 = typeof _j355 === 'number' ? ` | Points:${_j355}` : '';
console.log(`${icon} Scan [${action}] ${_j359} | 差異: ${_j200 > 0 ? '+' : ''}${_j200} (${percent})${_j360}`);
}
} else if (typeof _j622 !== 'undefined' && _j622) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j357;
}
}
}
}
function _j19(_j1514 = 10, shapeType = null) {
const _j294 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1514; i++) {
let x = crandom.random(_j294, w - _j294);
let y = crandom.random(_j294, h - _j294);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j319 = [];
const _j320 = 30;
const _j321 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j324 = [];
for (let i = 0; i < numBites; i++) {
let _j329 = 0;
let _j330 = false;
let _j331, _j332, distance;
while (!_j330 && _j329 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j320;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j331 = Math.floor(target.x + offsetX);
_j332 = Math.floor(target.y + offsetY);
_j331 = constrain(_j331, _j294, w - _j294);
_j332 = constrain(_j332, _j294, h - _j294);
_j330 = true;
for (let _j334 of _j324) {
let dist = Math.sqrt(
Math.pow(_j331 - _j334.x, 2) +
Math.pow(_j332 - _j334.y, 2)
);
if (dist < _j321) {
_j330 = false;
break;
}
}
_j329++;
}
if (_j330) {
let r, g, b;
let _j345 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j345[0] < 0.2 && _j345[1] < 0.15 && _j345[2] < 0.1) {
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
let _j342 = floor(_j331 * 1000 + _j332 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j331, _j332, size, _j342, shapeType);
let point = {
x: _j331,
y: _j332,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j324.push(point);
_j319.push(point);
}
}
}
_j233 = _j233.concat(_j319);
let _j346 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j319) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j346++;
let _j347 = point.size || 2.5;
let _j348 = map(_j347, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j348
});
}
}
if (_j319.length > 0) {
_j112('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j319.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1515 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j506);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j506);
}
const _j361 = _j1515 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j233.length;
if (!_j361) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j233) {
const px = point.x;
const py = point.y;
const _j362 = (point.size || 5) / _j506;
const _j363 = point.x / width;
const _j364 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j363 * 255, _j364 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j363 * 255, _j364 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j362, _j362);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j362, _j362);
}
}
const _j365 = {
pointCount: _j233.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j365;
window.bugsMaskTextureCache = _j365;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j301, _j1512) {
if (_j233.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j366 = _j20();
let _j367 = _j366.dataTexture;
let _j368 = _j366.maskTexture;
_j301.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1512);
window.metallicProgram.setUniform('bugsMask', _j368);
window.metallicProgram.setUniform('bugsData', _j367);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j506, height * _j506]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j369 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j370 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j371 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j372 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j373 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j369);
window.metallicProgram.setUniform('lightPos', [_j372, _j373]);
window.metallicProgram.setUniform('specularPower', _j370);
window.metallicProgram.setUniform('fresnelStrength', _j371);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j301.end();
}
let _j374 = null;
let __lastGridParams = null;
function _j22(x1, y1, x2, y2, _j1516, _j1517) {
const d = dist(x1, y1, x2, y2);
if (d < 1) return;
const dx = (x2 - x1) / d, dy = (y2 - y1) / d;
let pos = 0, draw = true;
while (pos < d) {
const _j375 = draw ? _j1516 : _j1517;
const end = Math.min(pos + _j375, d);
if (draw) line(x1 + dx * pos, y1 + dy * pos, x1 + dx * end, y1 + dy * end);
pos = end;
draw = !draw;
}
}
function gridCommitPrev() {
if (__lastGridParams) {
_j374 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j23(cx, cy, _j500, _j501) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j500 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j575 !== 'undefined' && _j575 !== null) {
if (_j575.minX < minX) minX = _j575.minX;
if (_j575.maxX > maxX) maxX = _j575.maxX;
if (_j575.minY < minY) minY = _j575.minY;
if (_j575.maxY > maxY) maxY = _j575.maxY;
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
const _j376 = effCell * 0.3;
const _j377 = (maxX - minX) + _j376 * 2;
const _j378 = (maxY - minY) + _j376 * 2;
const _j379 = (minX + maxX) * 0.5;
const _j380 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j376) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j376) / effCell) * effCell);
const _j381 = Math.min(width, Math.ceil((maxX + _j376) / effCell) * effCell);
const _j382 = Math.min(height, Math.ceil((maxY + _j376) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j381 - left);
let gridHeight = Math.max(effCell * 2, _j382 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j374 && typeof _j630 !== 'undefined' && _j630) {
const pg = _j374;
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
if (_j501) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j501) {
const _j383 = 12;
const _j384 = left + 8;
const _j385 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j384 - _j383 / 2, _j385, _j384 + _j383 / 2, _j385);
line(_j384, _j385 - _j383 / 2, _j384, _j385 + _j383 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j501) {
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
const _j386 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j387 = typeof _j570 === 'number' ? _j570 : 0;
const _j388 = typeof brushDir === 'number' ? brushDir : 0;
const _j389 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j390 = _j389[_j388] || '?';
const countdownText = `Max: ${_j386} | Count: ${_j387} | Dir: ${_j388}(${_j390})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j391 = typeof _j571 === 'number' ? _j571 : 0;
const _j392 = typeof brushMode === 'number' ? brushMode : 0;
const _j393 = (typeof _j531 === 'number' && _j531 > 0) ? _j531 : (typeof _j547 === 'number' ? _j547 : effCell);
const _j394 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j395 = `C: ${_j391} | B: ${_j392} | S: ${_j393.toFixed(1)} | P: ${_j394}`;
const _j396 = left;
const _j397 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j395, _j396, _j397);
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
function _j24(_j1511) {
const _j398 = typeof _j1511.begin === 'function';
if (_j398) _j1511.begin();
const g = _j398 ? window : _j1511;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j399 = 5;
const _j400 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j903 = true;
_j878 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j401 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j401;
let dy = (y2 - y1) / _j401;
let _j402 = 0;
while (_j402 < _j401) {
let _j403 = _j903 ? _j399 : _j400;
let _j404 = min(_j403 - _j878, _j401 - _j402);
if (_j903) {
let startX = x1 + dx * _j402;
let startY = y1 + dy * _j402;
let _j405 = x1 + dx * (_j402 + _j404);
let _j406 = y1 + dy * (_j402 + _j404);
g.line(startX, startY, _j405, _j406);
}
_j402 += _j404;
_j878 += _j404;
if (_j878 >= (_j903 ? _j399 : _j400)) {
_j903 = !_j903;
_j878 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j407 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j407.x, _j407.y, 10, 10);
}
g.pop();
if (_j398) _j1511.end();
}
function _j25() {
const _j408 = 10;
if (typeof _j555 !== 'undefined' && _j555 && typeof _j559 !== 'undefined' && _j559) {
noFill();
stroke(0, 180, 0, 180);
strokeWeight(1.5);
if (_j559.action === 'rect') {
const _j409 = _j559.x1 + _j408, _j410 = _j559.y1 + _j408;
const _j411 = _j559.x2 + _j408, _j412 = _j559.y2 + _j408;
_j22(_j409, _j410, _j411, _j410, 6, 4);
_j22(_j411, _j410, _j411, _j412, 6, 4);
_j22(_j411, _j412, _j409, _j412, 6, 4);
_j22(_j409, _j412, _j409, _j410, 6, 4);
} else if (_j559.action === 'polygon' && _j559.points && _j559.points.length >= 3) {
const _j413 = _j559.points;
for (let i = 0; i < _j413.length; i++) {
const a = _j413[i], b = _j413[(i + 1) % _j413.length];
_j22(a.x + _j408, a.y + _j408, b.x + _j408, b.y + _j408, 6, 4);
}
}
fill(0, 180, 0, 200);
noStroke();
if (typeof font !== 'undefined' && font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
const _j414 = (_j559.action === 'rect' ? _j559.x1 : (_j559.points ? _j559.points[0].x : 0)) + _j408;
const _j415 = (_j559.action === 'rect' ? _j559.y1 - 12 : (_j559.points ? _j559.points[0].y - 12 : 0)) + _j408;
text('MASK', _j414, _j415);
}
if (typeof _j554 !== 'undefined' && _j554 && typeof _j556 !== 'undefined' && _j556 === 'rect' &&
typeof _j557 !== 'undefined' && _j557 && _j557.x1 !== undefined && mouseIsPressed) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
const _j416 = Math.min(_j557.x1, mouseX - 10) + _j408;
const _j417 = Math.min(_j557.y1, mouseY - 10) + _j408;
const _j418 = Math.max(_j557.x1, mouseX - 10) + _j408;
const _j419 = Math.max(_j557.y1, mouseY - 10) + _j408;
_j22(_j416, _j417, _j418, _j417, 4, 3);
_j22(_j418, _j417, _j418, _j419, 4, 3);
_j22(_j418, _j419, _j416, _j419, 4, 3);
_j22(_j416, _j419, _j416, _j417, 4, 3);
}
if (typeof _j554 !== 'undefined' && _j554 && typeof _j556 !== 'undefined' && _j556 === 'polygon' &&
typeof _j558 !== 'undefined' && _j558.length > 0) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
for (let i = 0; i < _j558.length - 1; i++) {
const a = _j558[i], b = _j558[i + 1];
_j22(a.x + _j408, a.y + _j408, b.x + _j408, b.y + _j408, 4, 3);
}
noStroke();
fill(0, 200, 0, 150);
for (let p of _j558) {
ellipse(p.x + _j408, p.y + _j408, 6, 6);
}
}
}
function _j26() {
if ((!_j630 || isWaitingToLoop) && _j644 !== null && doMoving) {
const _j420 = easycamInitialCenter || [0, 0, 0];
const _j421 = PI / 3;
const _j422 = height / (2 * tan(_j421 / 2));
const _j423 = easycamInitialDistance > 0 ? easycamInitialDistance : _j422;
const _j424 = _j644.getCenter();
const _j425 = _j644.getDistance();
const _j426 = 0.1;
const _j427 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j424[0] - _j420[0], 2) +
Math.pow(_j424[1] - _j420[1], 2) +
Math.pow(_j424[2] - _j420[2], 2)
);
const distanceDiff = Math.abs(_j425 - _j423);
if (!_j657 && (centerDiff > _j426 || distanceDiff > _j427)) {
_j657 = true;
_j658 = millis();
_j655 = [_j424[0], _j424[1], _j424[2]];
_j659 = _j425;
_j656 = _j420;
_j660 = _j423;
}
if (_j657) {
const _j428 = millis() - _j658;
const _j429 = Math.min(_j428 / _j661, 1.0);
const _j430 = [
lerp(_j655[0], _j656[0], _j429),
lerp(_j655[1], _j656[1], _j429),
lerp(_j655[2], _j656[2], _j429)
];
const _j431 = lerp(_j659, _j660, _j429);
_j644.setCenter(_j430, 0);
_j644.setDistance(_j431, 0);
if (_j429 >= 1.0) {
const _j432 = _j644.getCenter();
const _j433 = _j644.getDistance();
const _j434 = Math.sqrt(
Math.pow(_j432[0] - _j420[0], 2) +
Math.pow(_j432[1] - _j420[1], 2) +
Math.pow(_j432[2] - _j420[2], 2)
);
const _j435 = Math.abs(_j433 - _j423);
if (_j434 > _j426 || _j435 > _j427) {
_j644.setCenter(_j420, 0);
_j644.setDistance(_j423, 0);
}
_j657 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j630 && !isWaitingToLoop && doMoving && _j645 && _j644 !== null && _j646 && !_j657) {
const _j436 = _j634;
const _j437 = _j635;
const _j438 = _j436 - hw;
const _j439 = -(_j437 - hh);
const _j424 = _j644.getCenter();
const _j272 = _j424[0];
const _j273 = _j424[1];
const _j425 = _j644.getDistance();
const _j421 = PI / 3;
const _j440 = height / (2 * tan(_j421 / 2));
const _j441 = 1.1;
let _j442 = 1.4;
const _j321 = _j440 / _j442;
const _j443 = _j440 / _j441;
const _j444 = _j440 / _j425;
const _j445 = 0.01;
if (_j652) {
const _j446 = _j442;
const _j447 = _j440 / _j446;
const distanceDiff = _j447 - _j425;
const _j448 = _j648;
const _j449 = _j425 + distanceDiff * _j448;
const _j450 = constrain(_j449, _j321, _j443);
_j644.setDistance(_j450, 0);
} else {
const _j447 = _j440 / _j441;
const distanceDiff = _j447 - _j425;
const _j448 = _j648;
const _j449 = _j425 + distanceDiff * _j448;
const _j450 = constrain(_j449, _j321, _j443);
_j644.setDistance(_j450, 0);
}
const _j451 = _j644.getDistance();
const _j452 = _j440 / _j451;
let _j453 = 0;
let _j454 = 0;
if (_j452 > _j441) {
_j453 = (_j452 - _j441) * (width / 2);
_j454 = (_j452 - _j441) * (height / 2);
}
let offsetX = _j438 - _j272;
let offsetY = _j439 - _j273;
if (_j453 > 0 || _j454 > 0) {
const _j455 = constrain(_j438, -_j453, _j453);
const _j456 = constrain(_j439, -_j454, _j454);
offsetX = _j455 - _j272;
offsetY = _j456 - _j273;
} else {
offsetX = -_j272;
offsetY = -_j273;
}
const _j457 = _j647;
const _j331 = _j272 + offsetX * _j457;
const _j332 = _j273 + offsetY * _j457;
let _j458 = _j331;
let _j459 = _j332;
if (_j453 > 0 || _j454 > 0) {
_j458 = constrain(_j331, -_j453, _j453);
_j459 = constrain(_j332, -_j454, _j454);
} else {
_j458 = 0;
_j459 = 0;
}
_j644.setCenter([_j458, _j459, 0], 0);
}
}
function _j27() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j645 = false;
return;
}
if (_j644 !== null) {
_j645 = true;
return;
}
try {
const _j460 = _renderer;
if (!_j460) {
console.error('❌ WEBGL renderer not found');
_j645 = false;
return;
}
const _j421 = PI / 3;
const _j440 = height / (2 * tan(_j421 / 2));
_j644 = new Dw.EasyCam(_j460, {
distance: _j440,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j644.setRotationConstraint(0, 0, 0);
_j644.setRotationScale(0);
_j653 = _j440 / 2.5;
_j654 = _j440 / 1.0;
_j644.setDistanceMin(_j653);
_j644.setDistanceMax(_j654);
document.oncontextmenu = function() {
return false;
};
_j645 = true;
_j112('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j645 = false;
_j644 = null;
}
}
function applyCameraProjection() {
const _j461 = doMoving && _j645 && _j644 !== null && _j630 && _j646;
if (_j461) {
const _j462 = PI / 3;
const _j463 = 0.1;
const _j464 = 10000;
perspective(_j462, width / height, _j463, _j464);
push();
} else {
const _j465 = PI / 3;
const _j466 = 0.1;
const _j467 = 10000;
perspective(_j465, width / height, _j466, _j467);
}
}
let _j468 = null;
let _j469 = null;
let _j470 = 0,
_j471 = 0,
_j472 = 0;
let _j473 = {
feedback: {},
composite: {},
realtime: {}
};
function _j28(_j1518, _j1519, name, value) {
const _j474 = _j473[_j1519];
if (_j474[name] === value) return;
_j474[name] = value;
_j1518.setUniform(name, value);
}
function _j29() {
if (_j470 !== width || _j471 !== height || _j472 !== _j506) {
_j468 = [0, 0, width * _j506, height * _j506];
_j469 = [1.0 / (width * _j506), 1.0 / (height * _j506)];
_j470 = width;
_j471 = height;
_j472 = _j506;
}
if (_j468 === null) {
_j468 = [0, 0, width * _j506, height * _j506];
_j469 = [1.0 / (width * _j506), 1.0 / (height * _j506)];
}
}
function _j30(_j1511, _j1520 = 1.0) {
if (_j591) {
_j567 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
pingPongBuffer.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j509);
const _j475 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j509.setUniform("rect", _j468);
_j509.setUniform("invResolution", _j469);
_j509.setUniform("tex0", _j1511);
_j28(_j509, 'feedback', "brushMode", brushMode * 1.0);
_j509.setUniform("forceMap", _j507);
_j28(_j509, 'feedback', "baseBrushSize", baseBrushSize);
_j509.setUniform("force", _j1520);
_j28(_j509, 'feedback', "useSharpen", useSharpen);
_j28(_j509, 'feedback', "effect3Brightness", effect3Brightness);
_j28(_j509, 'feedback', "indiffusionStrength", indiffusionStrength);
_j28(_j509, 'feedback', "brushColorMode", float(brushColorMode));
_j28(_j509, 'feedback', "brushCategory", _j475);
const _j476 = typeof _j573 !== 'undefined' ? _j573 : 0;
const _j477 = (_j571 + _j476) % 40;
const _j478 = _j571 + _j476;
_j509.setUniform("mouseCount", float(_j477));
_j509.setUniform("mouseCountAccumulated", float(_j478));
_j509.setUniform("strokeSeed", float(strokeSeed));
_j509.setUniform("useMask", _j555 ? 1.0 : 0.0);
if (_j555) _j509.setUniform("maskTex", _j553);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
_j1511.begin();
imageMode(CENTER);
blendMode(BLEND);
image(pingPongBuffer, 0, 0, width, height);
_j1511.end();
_j567 = true;
}
function _j31() {
if (typeof _j618 === 'undefined' || !_j618) {
return;
}
const _j479 = canvasBackgroundColor;
let _j480 = _j9(40, 20, 15, 0.2);
const _j481 = min(255, _j479[0] * 1.1);
const _j482 = min(255, _j479[1] * 1.1);
const _j483 = min(255, _j479[2] * 1.1);
_j618.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j481, _j482, _j483);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j480, -width / 2, -height / 2, width, height);
_j618.end();
_j480.remove();
}
function _j32() {
const _j479 = canvasBackgroundColor;
if (typeof _j619 !== 'undefined' && _j619) {
_j619.begin();
background(_j479[0], _j479[1], _j479[2]);
_j619.end();
}
_j31();
if (typeof _j567 !== 'undefined') {
_j567 = true;
}
}
function updateCompositeBuffer() {
const _j484 = _j567 || _j548 || _j549 || _j630 || _j673;
if (_j484) {
_j616.begin();
clear();
shader(_j512);
_j29();
_j512.setUniform("rect", _j468);
_j512.setUniform("baseTex", showPaperTexture ? _j618 : _j619);
_j512.setUniform("encodedTex", finalBuffer);
_j512.setUniform("typeMapTex", typeMapBuffer);
_j512.setUniform("oldTex", oldBuffer);
_j28(_j512, 'composite', "brushColorMode", float(brushColorMode));
_j28(_j512, 'composite', "whiteMaxOpacity", _j517);
_j28(_j512, 'composite', "hueShift", _j518);
_j28(_j512, 'composite', "satShift", _j519);
_j28(_j512, 'composite', "briShift", _j520);
_j28(_j512, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j28(_j512, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j616.end();
if (_j548 || _j549) {
_j620.begin();
clear();
imageMode(CENTER);
image(_j616, 0, 0, width, height);
_j620.end();
_j616.begin();
shader(_j510);
const _j485 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j510.setUniform("rect", _j468);
_j510.setUniform("baseTex", _j620);
_j510.setUniform("addTex", newBufferBlack);
_j510.setUniform("encodedTex", finalBuffer);
_j28(_j510, 'realtime', "brushColorMode", float(brushColorMode));
_j28(_j510, 'realtime', "whiteMaxOpacity", _j517);
_j28(_j510, 'realtime', "hueShift", _j518);
_j28(_j510, 'realtime', "satShift", _j519);
_j28(_j510, 'realtime', "briShift", _j520);
_j28(_j510, 'realtime', "brushCategory", _j485);
_j28(_j510, 'realtime', "useSharpen", useSharpen);
let _j486;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j486 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j215[brushColorMode] || _j215[0];
_j486 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j510.setUniform("brushColor", _j486);
_j510.setUniform("useMask", _j555 ? 1.0 : 0.0);
if (_j555) _j510.setUniform("maskTex", _j553);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j616.end();
}
_j567 = _j548 || _j549 || _j630 || _j673;
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
const _j487 = (_j548 || _j549) && _j570 < maxUpdates && _j576;
const _j488 = !_j630 || showFuturePathPreview;
const _j489 = _j487 && showGridOverlay;
const _j490 = (typeof _j555 !== 'undefined' && _j555) ||
(typeof _j554 !== 'undefined' && _j554);
const _j491 = (typeof window !== 'undefined' && window.testMode === true);
if (_j487 || _j490 || _j491) {
_j617.begin();
clear();
push();
translate(-hw, -hh);
const _j492 = -10;
translate(_j492, _j492);
if (_j491) {
const _j408 = 10;
const _j493 = 4;
noFill();
stroke(255, 0, 0, 220);
strokeWeight(2);
const _j494 = _j493 + _j408, _j495 = _j493 + _j408;
const _j496 = width - _j493 + _j408, _j497 = height - _j493 + _j408;
_j22(_j494, _j495, _j496, _j495, 10, 6);
_j22(_j496, _j495, _j496, _j497, 10, 6);
_j22(_j496, _j497, _j494, _j497, 10, 6);
_j22(_j494, _j497, _j494, _j495, 10, 6);
}
if (_j489) {
const _j498 = _j630 ? _j634 : _j543;
const _j499 = _j630 ? _j635 : _j544;
const cx = (_j545 || _j545 === 0) ? _j545 : _j498;
const cy = (_j546 || _j546 === 0) ? _j546 : _j499;
const _j500 = _j547;
const _j501 = typeof _j592 !== 'undefined' && _j592;
_j23(cx, cy, _j500, _j501);
} else if (_j490) {
_j25();
}
if (pathPoints.length > 1 && _j488) {
const _j399 = 5;
const _j400 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j903 = true;
_j878 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j401 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j401;
let dy = (y2 - y1) / _j401;
let _j402 = 0;
while (_j402 < _j401) {
let _j403 = _j903 ? _j399 : _j400;
let _j404 = min(_j403 - _j878, _j401 - _j402);
if (_j903) {
let startX = x1 + dx * _j402;
let startY = y1 + dy * _j402;
let _j405 = x1 + dx * (_j402 + _j404);
let _j406 = y1 + dy * (_j402 + _j404);
line(startX, startY, _j405, _j406);
}
_j402 += _j404;
_j878 += _j404;
if (_j878 >= (_j903 ? _j399 : _j400)) {
_j903 = !_j903;
_j878 = 0;
}
}
}
}
if (_j488 && _j487) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j502 = _j630 ? _j634 : _j543;
const _j503 = _j630 ? _j635 : _j544;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j502, _j503, 10, 10);
}
pop();
_j617.end();
}
}
let _j504 = window._demoCanvasWidth || 900,
_j505 = window._demoCanvasHeight || 900,
hw, hh, _j506 = 1.6;
let _j507, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j508, _j509, _j510, _j511, _j512, _j513;
let _j514;
let _j515;
const _j215 = _j2();
let colorIndex = 0,
_j516 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j517 = 0.95;
let _j518 = 0.0,
_j519 = 0.0,
_j520 = 0.0;
let customBrushColor = [26, 26, 26];
let _j521, _j522, _j523, _j524, _j525;
let _j526, _j527, _j528, _j529, _j530, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j531 = 0,
_j532 = 2,
_j533 = 0;
let brushMode = 1,
_j534 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j535 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j536 = [];
let x, y, _j438, _j439, _j537, _j538, _j539, _j540 = 0,
_j541 = 0;
let _j542;
let _j543 = 0,
_j544 = 0,
_j545 = 0,
_j546 = 0,
_j547 = 20;
let _j548 = false,
_j549 = false,
_j550 = false,
_j551 = false;
let _j552 = true;
let useSpectralMix = false;
let _j553;
let _j554 = false;
window.resetBrushPositionToMouse = function() {
if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') return;
const px = _j184(mouseX);
const py = _j184(mouseY);
_j543 = px;
_j544 = py;
_j545 = px;
_j546 = py;
_j634 = px;
_j635 = py;
_j636 = px;
_j637 = py;
};
let _j555 = false;
let _j556 = 'rect';
let _j557 = null;
let _j558 = [];
let _j559 = null;
Object.defineProperty(window, 'spectral', {
get() { return useSpectralMix; },
set(v) {
useSpectralMix = !!v;
console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
}
});
window.getAgentPathData = function() {
return {
active: _j568,
paths: _j569,
pointCount: _j569.filter(p => !p.stroke).length,
strokeCount: _j569.filter(p => p.stroke).length,
canvasSize: { w: typeof width !== 'undefined' ? width : 0, h: typeof height !== 'undefined' ? height : 0 },
timestamp: Date.now()
};
};
let _j560 = 1.0,
_j561 = false,
_j562 = 0.0;
let _j563 = [0, 0, 0];
function _j34(v) {
_j563[0] = _j563[1];
_j563[1] = _j563[2];
_j563[2] = v;
const a = _j563[0], b = _j563[1], c = _j563[2];
return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}
let _j564 = null;
let _j565 = false,
_j566 = false,
_j567 = true;
let _j568 = false;
let _j569 = [];
let _j570 = 0,
maxUpdates = 10,
force = 1.0;
let _j571 = 0,
_j572 = 0,
_j573 = 0;
var doMoving = false,
_j574 = false;
let pathPoints = [],
_j575 = null,
startX = 0,
startY = 0,
_j576 = false;
let _j577 = 1,
pathRotation = 20;
let randStep = 1,
_j578 = 10,
expectedStrokeLength = 100;
let allBrushStrokes = [],
totalStrokeCount = 0,
_j579 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j580;
var currentStrokeHighlight = null;
let _j581 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j582 = 140.0,
_j583 = 0.5,
_j584 = 1.0,
_j585 = 0.5,
_j586 = 60.0;
let cellularEnabled = false,
_j587 = 15.0,
_j588 = 0.5;
let whiteDotEnabled = false,
_j589 = 0.01;
let grainEnabled = false,
_j590 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j591 = false;
let _j592 = false;
let _j593 = 0;
let _j594 = 0;
let _j595 = 0;
let _j596 = 50;
let _j597 = 0;
var flowEffectStrokeBounds = null;
let _j598 = false;
let _j599 = null;
let _j600 = 0;
var _j601 = 0;
var _j602 = 0;
let _j603 = false;
const _j604 = 3;
var _j605 = {
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
var _j606 = false;
let _j607 = [0, 0, 0, 0],
_j608 = [0, 0, 0],
_j609 = [0, 0, 0],
_j610 = [0, 0, 0];
let _j611 = [0, 0],
_j612 = [0, 0],
effect3Brightness = 0.2;
let oldBuffer, _j613, finalBuffer, newBufferBlack, _j614, _j615, _j616;
let pingPongBuffer, _j617, _j618, _j619;
let _j620;
let _j621;
let typeMapBuffer;
let _j622 = false,
_j623 = 0,
_j624 = null,
_j625 = 0;
let _j626 = 0,
_j627 = 0,
_j628 = true,
_j629 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j630 = false,
_j631 = 0,
_j632 = 0,
_j633 = 1.0;
let _j634 = 0,
_j635 = 0,
_j636 = 0,
_j637 = 0;
let _j638 = false,
isWaitingToLoop = false,
_j639 = 0;
let _j640 = 0,
_j641 = false;
let _j642 = 0,
_j643 = 0;
let _j644 = null,
_j645 = false,
_j646 = false;
let _j647 = 0.05,
_j648 = 0.05;
let _j649 = 0,
_j650 = 0;
let _j651 = 1,
_j652 = false;
let _j653 = 0,
_j654 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j655 = [0, 0, 0],
_j656 = [0, 0, 0];
let _j657 = false,
_j658 = 0,
_j659 = 0,
_j660 = 0,
_j661 = 1000;
let _j662 = false,
_j663 = 0;
let _j664 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j665 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j666 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j667 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j668 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j669 = 0,
_j670 = 300;
let _j671 = false,
_j672 = false;
let _j673 = false,
_j674 = 0,
frameCount = 0,
_j675 = [];
let _j676 = 1,
_j677 = 0.8;
let _j678 = true,
_j679 = [],
_j680 = 100,
isDragging = false;
let _j681 = {
x: 0,
y: 0
},
_j682 = {
x: 85,
y: 50
};
let _j683 = false,
_j684 = {
x: 0,
y: 0
},
_j685 = {
x: 15,
y: 50
},
_j686 = true;
let _j687 = false,
_j688 = {
x: 0,
y: 0
},
_j689 = {
x: 85,
y: 70
},
_j690 = true;
let _j691 = false,
_j692 = {
x: 0,
y: 0
},
_j693 = {
x: 85,
y: 40
},
_j694 = true;
let _j695 = false,
_j696 = {
x: 0,
y: 0
},
_j697 = {
x: 15,
y: 40
},
_j698 = true;
let _j699 = 10;
var screenText = false,
_j700 = [],
_j701 = 30,
_j702 = 0;
let _j703 = 25,
_j704 = 30,
_j705 = 16,
_j706 = 200,
_j707 = 200;
let _j708 = false,
_j709 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j509 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j510 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j508 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j513 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j515 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j169();
if (doDemo) {
_j177('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j580 = window._preloadedDemo;
recordingData = _j580;
window._pendingAutoPlay = true;
} else {
var _j710 = './lib/demo.json';
var _j711 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j711)) {
_j710 = './lib/' + _j711 + '.json';
}
fetch(_j710)
.then(_j1541 => {
if (!_j1541.ok) throw new Error('HTTP ' + _j1541.status);
return _j1541.json();
})
.then(data => {
_j580 = data;
if (_j580 && _j580.events && _j580.events.length > 0) {
recordingData = _j580;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j112('system', '❌ Failed to load ' + _j710, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j712 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j713 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j712) {
try {
const loadedData = JSON.parse(_j712);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j713 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j714 = sessionStorage.getItem('pendingRecordingData');
const _j715 = sessionStorage.getItem('shouldAutoPlay');
if (_j714 && _j715 === 'true') {
try {
const loadedData = JSON.parse(_j714);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j177('📂 Recording Data Restored After Reload');
_j112('system', '✅ Canvas size restored and recording loaded', {
CanvasSize: `${width}x${height}`,
Events: `${recordingData.events.length} events`
});
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
_j112('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
window._pendingAutoPlay = true;
}
} catch (error) {
_j112('system', '❌ Failed to restore recording data', {
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
const _j716 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j717 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
if (_j717 && window.APP_MODE === 'collector') {
document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center;font-family:system-ui;background:#f5f5f5;">' +
'<div><p style="font-size:48px;margin:0 0 16px;">🖥</p>' +
'<p style="font-size:18px;font-weight:600;margin:0 0 8px;">Please use a tablet or computer</p>' +
'<p style="font-size:14px;color:#666;margin:0;">This artwork requires more GPU memory than your phone can provide. Open this link on an iPad or desktop browser for the full experience.</p></div></div>';
noLoop();
return;
}
const _j718 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j718) {
const _j719 = parseFloat(_j718[1]);
if (!isNaN(_j719) && _j719 >= 0.5 && _j719 <= 5) {
_j506 = _j719;
_j112('system', '🔗 Pixel density from URL', {
Value: _j719
});
}
} else if (window.APP_MODE === 'collector') {
_j506 = 2;
_j112('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j716) {
const _j720 = 1.0;
if (_j506 > _j720) {
_j506 = _j720;
_j112('system', '📱 Mobile pixel density override', {
Value: _j720,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j721 = sessionStorage.getItem('pendingPixelDensity');
if (_j721 && !_j716 && !_j718) {
const _j722 = parseInt(_j721);
if (!isNaN(_j722) && _j722 >= 1 && _j722 <= 5) {
_j506 = _j722;
sessionStorage.removeItem('pendingPixelDensity');
_j112('system', '🔄 Restoring pixel density from session', {
Value: _j722,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j506);
const _j723 = sessionStorage.getItem('pendingCanvasWidth');
const _j724 = sessionStorage.getItem('pendingCanvasHeight');
let _j725 = false;
if (_j723 && _j724) {
_j504 = parseInt(_j723);
_j505 = parseInt(_j724);
_j725 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j112('system', '🔄 Restoring canvas size from recording', {
Width: `${_j504}px`,
Height: `${_j505}px`
});
}
let _j726 = false,
_j727 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j728 = qs.substring(1).split('_');
for (var i = 0; i < _j728.length; i++) {
var ci = _j728[i].indexOf(':');
if (ci === -1) continue;
var k = _j728[i].substring(0, ci), v = parseInt(_j728[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j504 = v;
_j726 = true;
}
if (k === 'h' && v > 0) {
_j505 = v;
_j727 = true;
}
}
})();
if (_j717 && window.APP_MODE === 'artist' && !_j725) {
if (!_j726) _j504 = 380;
if (!_j727) _j505 = 600;
if (!_j726 || !_j727) {
_j112('system', '📱 Mobile phone default canvas size', {
Width: `${_j504}px`,
Height: `${_j505}px`
});
}
}
const _j729 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j729) {
try {
const _j479 = JSON.parse(_j729);
if (Array.isArray(_j479) && _j479.length === 3) {
canvasBackgroundColor[0] = _j479[0];
canvasBackgroundColor[1] = _j479[1];
canvasBackgroundColor[2] = _j479[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j112('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j479[0]}, ${_j479[1]}, ${_j479[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j504, _j505, WEBGL);
if (_j552) {
const _j730 = document.querySelector('canvas');
if (_j730) {
const _j731 = document.getElementById('zen-mode-btn');
const _j732 = (pressure) => {
if (!_j731) return;
if (pressure <= 0) {
_j731.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j731.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j733 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j561) {
_j561 = true;
_j112('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j562 = _j34(e.pressure);
_j560 = Math.min(_j562 / 0.3, 1.0);
_j732(_j562);
}
};
_j730.addEventListener('pointerdown', _j733);
_j730.addEventListener('pointermove', _j733);
_j730.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j561) {
_j562 = 0.0;
_j563[0] = _j563[1] = _j563[2] = 0;
_j560 = -1;
_j732(0);
}
});
const _j734 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j735 = t.touchType === 'stylus';
if (_j735 && t.force > 0) {
const _j736 = Math.min(t.force, 1.0);
if (!_j561) {
_j561 = true;
_j112('system', '🖊️ Stylus force detected', { force: t.force });
}
_j562 = _j34(_j736);
_j560 = Math.min(_j562 / 0.3, 1.0);
_j732(_j562);
}
}
};
_j730.addEventListener('touchstart', _j734, { passive: true });
_j730.addEventListener('touchmove', _j734, { passive: true });
_j730.addEventListener('touchend', () => {
if (_j561) {
_j562 = 0.0;
_j563[0] = _j563[1] = _j563[2] = 0;
_j560 = -1;
_j732(0);
}
}, { passive: true });
}
}
_j507 = createFramebuffer({
density: _j506
});
window.metallicStrength = 0.85;
window.metallicFlowSpeed = 1.0;
window.metallicSpecular = 12.0;
window.metallicFresnel = 0.5;
window.bugsSize = 10.0;
window.metallicLightX = 0.5;
window.metallicLightY = 0.3;
window.metallicTint = [0.72, 0.50, 0.35];
if (typeof _j110 === 'function') _j110();
if (typeof _j108 === 'function') _j108();
_j149();
_j141();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j140 === 'function') {
_j140();
}
_j47();
window.addEventListener('resize', function() {
setTimeout(_j47, 100);
});
_j177('Interactive Generative Art System');
oldBuffer = createFramebuffer({
density: _j506
});
oldBuffer.begin();
background(255);
oldBuffer.end();
_j613 = createGraphics(width, height, WEBGL);
_j613.noStroke();
_j613.pixelDensity(_j506);;
_j613.clear();
finalBuffer = createFramebuffer({
density: _j506
});
finalBuffer.begin();
background(255);
finalBuffer.end();
newBufferBlack = createFramebuffer({
density: _j506
});
newBufferBlack.begin();
background(255);
newBufferBlack.end();
_j614 = createFramebuffer({
density: _j506
});
_j615 = createGraphics(width, height, WEBGL);
_j615.noStroke();
_j615.pixelDensity(_j506);;
_j615.clear();
_j618 = createFramebuffer({
density: _j506
});
let _j480 = _j9(40, 20, 15, 0.2);
const _j481 = min(255, canvasBackgroundColor[0] * 1.1);
const _j482 = min(255, canvasBackgroundColor[1] * 1.1);
const _j483 = min(255, canvasBackgroundColor[2] * 1.1);
_j618.begin();
clear();
noStroke();
fill(_j481, _j482, _j483);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j480, -width / 2, -height / 2, width, height);
_j618.end();
_j480.remove();
_j619 = createFramebuffer({
density: _j506
});
_j619.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j619.end();
_j616 = createFramebuffer({
density: _j506
});
typeMapBuffer = createFramebuffer({
density: _j506
});
typeMapBuffer.begin();
background(0);
typeMapBuffer.end();
pingPongBuffer = createFramebuffer({
density: _j506
});
_j620 = createFramebuffer({
density: _j506
});
_j617 = createFramebuffer({
density: _j506
});
_j621 = createFramebuffer({
density: _j506
});
_j621.begin();
background(255);
_j621.end();
_j553 = createFramebuffer({
density: _j506
});
_j553.begin();
background(255);
_j553.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j506
});
}
_j507.begin();
background(255, 255, 255);
_j507.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j634 = hw;
_j635 = hh;
_j636 = hw;
_j637 = hh;
_j175();
_j521 = 10;
_j578 = 2;
_j523 = 0.5;
_j524 = 0.5;
_j522 = 0;
_j525 = 20;
x = y = _j526 = _j527 = _j528 = _j529 = _j542 = 0;
_j438 = hw;
_j439 = hh;
_j530 = 0;
_j171();
_j178();
_j27();
_j176();
window.addEventListener('mouseup', function(e) {
if (_j548 && !_j630) {
const _j737 = document.querySelector('canvas');
if (_j737) {
const bounds = _j737.getBoundingClientRect();
const _j738 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j738) {
_j112('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j549) {
_j549 = true;
_j570 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j565 = _j48(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j565 = false;
});
document.addEventListener('mousemove', function(e) {
if (_j554) return;
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j543 = _j184(mouseX);
_j544 = _j184(mouseY);
} else {
const _j737 = document.querySelector('canvas');
if (!_j737) return;
const bounds = _j737.getBoundingClientRect();
const _j739 = (e.clientX - bounds.left) / bounds.width;
const _j740 = (e.clientY - bounds.top) / bounds.height;
_j543 = _j184(_j739 * width);
_j544 = _j184(_j740 * height);
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
if (!_j1414.enabled) return;
_j1414.frameCount++;
let _j741 = 60;
const now = millis();
if (_j1414.lastFrameTime > 0) {
const deltaTime = now - _j1414.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j741 = 1000 / deltaTime;
_j741 = Math.max(1, Math.min(120, _j741));
}
} else {
try {
const _j742 = frameRate();
if (!isNaN(_j742) && _j742 > 0) {
_j741 = _j742;
}
} catch (e) {}
}
_j1414.lastFrameTime = now;
_j1414._pushFR(_j741);
if (_j1414.frameCount - _j1414.lastCheckFrame >= _j1414.checkInterval) {
_j1414.lastCheckFrame = _j1414.frameCount;
const _j743 = _j1414._frLen > 0 ?
_j1414._avgFR() :
_j741;
if (_j1414.logFpsToConsole) {
console.log('FPS:', _j743.toFixed(1));
}
const _j744 = 0.1;
const _j745 = _j743 <= (_j1414.frameRateThreshold + _j744);
if (_j745) {
const now = millis();
if (now - _j1414.lastPerformanceLog > _j1414.logCooldown) {
_j1414.lastPerformanceLog = now;
_j36(_j743);
}
}
}
}
function _j36(_j743) {
const _j746 = _j1414.performanceDataAccumulated;
const sampleCount = _j746.sampleCount > 0 ? _j746.sampleCount : 1;
if (sampleCount === 0 || _j746.drawTotal === 0) {
const _j747 = _j1414.performanceData;
const _j748 = _j747.drawTotal > 0 ? _j747.drawTotal : 1;
const report = {
'平均帧率': `${_j743.toFixed(1)} fps`,
'目标帧率': `${_j1414.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j743).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j504}x${_j505}`,
'Pixel Density': _j506
};
const stateInfo = {
'正在绘制': _j548 ? '是' : '否',
'正在播放': _j630 ? '是' : '否',
'倒计时中': _j549 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j645 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
_j112('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j746.drawTotal / sampleCount,
updatePlayback: _j746.updatePlayback / sampleCount,
updateCompositeBuffer: _j746.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j746.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j746.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j746.updateBlurEffect / sampleCount,
applyCameraProjection: _j746.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j746.drawLayersWithBlur / sampleCount,
other: _j746.other / sampleCount
};
const _j748 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j749 = [];
const _j750 = _j748 * 0.1;
if (data.updatePlayback > _j750) {
_j749.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j748) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j750) {
_j749.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j748) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j750) {
_j749.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j748) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j750) {
_j749.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j748) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j750) {
_j749.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j748) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j750) {
_j749.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j748) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j750) {
_j749.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j748) * 100).toFixed(1)
});
}
if (data.other > _j750) {
_j749.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j748) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j743.toFixed(1)} fps`,
'目标帧率': `${_j1414.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j743).toFixed(2)} ms`,
'总耗时': `${_j748.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j504}x${_j505}`,
'Pixel Density': _j506
};
const stateInfo = {
'正在绘制': _j548 ? '是' : '否',
'正在播放': _j630 ? '是' : '否',
'倒计时中': _j549 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j645 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
if (_j749.length > 0) {
report['性能瓶颈'] = _j749.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j751 = [];
if (data.drawLayersWithBlur > _j750) {
_j751.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j750) {
_j751.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j504 * _j505 > 1500000) {
_j751.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 100) {
_j751.push('笔画数量较多，考虑清理旧笔画');
}
if (_j751.length > 0) {
report['优化建议'] = _j751.join('; ');
}
_j112('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1414.performanceData).forEach(key => {
_j1414.performanceData[key] = 0;
});
Object.keys(_j1414.performanceDataAccumulated).forEach(key => {
_j1414.performanceDataAccumulated[key] = 0;
});
}
let _j752 = 0;
const _j753 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j754 = (++_j752 % _j753 === 0);
const _j755 = _j754 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j233.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j756 = _j754 ? performance.now() : 0;
if (_j630) {
updatePlayback();
}
if (_j754) _j1414.performanceData.updatePlayback += performance.now() - _j756;
_j26();
if (_j567 || _j548 || _j549 || _j630 || _j673) {
if (_j754) _j756 = performance.now();
updateCompositeBuffer();
if (_j754) _j1414.performanceData.updateCompositeBuffer += performance.now() - _j756;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j33();
}
if (_j754) _j756 = performance.now();
updateEasyCamAutoTracking();
if (_j754) _j1414.performanceData.updateEasyCamAutoTracking += performance.now() - _j756;
if (_j754) _j756 = performance.now();
drawCursorToBuffer();
if (_j754) _j1414.performanceData.drawCursorToBuffer += performance.now() - _j756;
_j37();
if (_j754) _j756 = performance.now();
updateBlurEffect();
if (_j754) _j1414.performanceData.updateBlurEffect += performance.now() - _j756;
if (_j754) _j756 = performance.now();
applyCameraProjection();
if (_j754) _j1414.performanceData.applyCameraProjection += performance.now() - _j756;
if (_j754) _j756 = performance.now();
drawLayersWithBlur();
if (_j754) _j1414.performanceData.drawLayersWithBlur += performance.now() - _j756;
_j52();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j757 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j630 !== 'undefined' ? _j630 : '?') +
' evt=' + (typeof _j632 !== 'undefined' ? _j632 : '?');
_j616.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j757, -width/2 + 4, -height/2 + 3);
_j616.end();
if (d.totalFrames % 10 === 0) {
var _j758 = document.getElementById('defaultCanvas0');
var _j759 = document.getElementById('_fxDbgOvr');
if (!_j759 && _j758) {
_j759 = document.createElement('canvas');
_j759.id = '_fxDbgOvr';
_j759.width = _j758.offsetWidth;
_j759.height = 24;
_j759.style.position = 'fixed';
_j759.style.top = _j758.offsetTop + 'px';
_j759.style.left = _j758.offsetLeft + 'px';
_j759.style.zIndex = '2147483647';
_j759.style.pointerEvents = 'none';
document.body.appendChild(_j759);
}
if (_j759) {
var _j760 = _j759.getContext('2d');
_j760.clearRect(0, 0, _j759.width, _j759.height);
_j760.fillStyle = 'rgba(200,0,0,0.85)';
_j760.fillRect(0, 0, _j759.width, 22);
_j760.font = 'bold 13px monospace';
_j760.fillStyle = '#fff';
_j760.fillText(_j757, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j761 = document.getElementById('fxhash-capture-canvas');
var _j762 = document.getElementById('defaultCanvas0');
if (_j761 && typeof _j616 !== 'undefined') {
var _j763 = _j616.get();
_j761.width = _j763.width;
_j761.height = _j763.height;
var _j764 = _j761.getContext('2d');
_j764.drawImage(_j763.canvas, 0, 0);
if (typeof _j763.remove === 'function') _j763.remove();
if (_j762) {
_j761.style.cssText = _j762.style.cssText;
_j762.style.visibility = 'hidden';
}
_j761.style.position = 'absolute';
_j761.style.top = (_j762 ? _j762.offsetTop : 0) + 'px';
_j761.style.left = (_j762 ? _j762.offsetLeft : 0) + 'px';
_j761.style.zIndex = '99999';
_j761.style.visibility = 'visible';
_j761.style.border = 'none';
_j761.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j761.width + 'x' + _j761.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j765 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j764.save();
_j764.fillStyle = 'rgba(0,0,0,0.7)';
_j764.fillRect(10, 10, 280, _j765.length * 22 + 10);
_j764.font = '16px monospace';
_j764.fillStyle = '#0f0';
for (var li = 0; li < _j765.length; li++) {
_j764.fillText(_j765[li], 18, 30 + li * 22);
}
_j764.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j762 && _j761) {
_j761.width = _j762.width;
_j761.height = _j762.height;
var _j764 = _j761.getContext('2d');
_j764.drawImage(_j762, 0, 0);
if (_j762) _j762.style.visibility = 'hidden';
_j761.style.visibility = 'visible';
_j761.style.zIndex = '99999';
_j761.style.border = 'none';
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
if (_j754) {
const _j766 = performance.now();
const _j767 = _j1414.performanceData.updatePlayback +
_j1414.performanceData.updateCompositeBuffer +
_j1414.performanceData.updateEasyCamAutoTracking +
_j1414.performanceData.drawCursorToBuffer +
_j1414.performanceData.updateBlurEffect +
_j1414.performanceData.applyCameraProjection +
_j1414.performanceData.drawLayersWithBlur;
_j1414.performanceData.other = (_j766 - _j755) - _j767;
_j1414.performanceData.drawTotal = _j766 - _j755;
_j1414.performanceDataAccumulated.drawTotal += _j1414.performanceData.drawTotal;
_j1414.performanceDataAccumulated.updatePlayback += _j1414.performanceData.updatePlayback;
_j1414.performanceDataAccumulated.updateCompositeBuffer += _j1414.performanceData.updateCompositeBuffer;
_j1414.performanceDataAccumulated.updateEasyCamAutoTracking += _j1414.performanceData.updateEasyCamAutoTracking;
_j1414.performanceDataAccumulated.drawCursorToBuffer += _j1414.performanceData.drawCursorToBuffer;
_j1414.performanceDataAccumulated.updateBlurEffect += _j1414.performanceData.updateBlurEffect;
_j1414.performanceDataAccumulated.applyCameraProjection += _j1414.performanceData.applyCameraProjection;
_j1414.performanceDataAccumulated.drawLayersWithBlur += _j1414.performanceData.drawLayersWithBlur;
_j1414.performanceDataAccumulated.other += _j1414.performanceData.other;
_j1414.performanceDataAccumulated.sampleCount++;
}
_j35();
if (_j630) {
if (_j549 && !_j641) {
_j640 = millis();
_j641 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j549 && _j641) {
const _j768 = millis() - _j640;
const _j769 = _j631;
_j631 += _j768;
_j641 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j768.toFixed(0)}ms`);
if (_j632 < recordingData.events.length) {
const _j770 = recordingData.events[_j632];
const _j771 = _j770.m || _j770.type;
const _j772 = _j771 === 'mp' || _j771 === 'mousePressed';
const _j773 = _j770.t !== undefined ? _j770.t : _j770.time;
const _j774 = (millis() - _j631) * _j633;
const _j775 = _j773 - _j774;
if (_j772 || _j775 <= 0 || _j775 < 100) {
if (window.DEBUG_MODE && _j772) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j775.toFixed(0)}ms`);
}
_j191(_j770);
_j632++;
}
}
}
}
const _j776 = _j630 ? _j638 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j548));
const _j777 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j776 : (_j776 && _j531 > 0);
const _j778 = _j630 || (_j543 >= 0 && _j543 < width && _j544 >= 0 && _j544 < height) || (_j548 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j777 && _j778) {
window.drawLoopCount++;
if (_j571 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j571++;
let _j502, _j503;
if (_j630) {
_j502 = _j634;
_j503 = _j635;
} else {
_j502 = _j543;
_j503 = _j544;
}
if (_j571 % 2 === 0 && _j576) {
pathPoints.push({
x: _j502,
y: _j503
});
}
if (_j568) {
_j569.push({
x: _j502,
y: _j503,
t: millis(),
pressure: force
});
}
const _j779 = strokeSeed + _j571 * 100000000;
randomSeed(_j779);
if (brushMode === 3) {
let _j780 = crandom.random(0, 1);
let _j781 = crandom.random(150, 250);
let _j782 = _j780 > 0.1 ? noise(_j502 * 0.01, _j503 * 0.01) * 150 : _j781;
_j516 = (_j516 * 0.3) + (_j782 * 0.7);
} else {
let _j780 = crandom.random(0, 1);
let _j781 = crandom.random(20, 50);
let _j782 = _j780 > 0.3 ? noise(_j502 * 0.01, _j503 * 0.01) * 10 : _j781;
_j516 = (_j516 * 0.6) + (_j782 * 0.4);
}
_j531 -= randStep;
_j531 = max(1, _j531);
_j525 = _j531;
if (_j552 && _j571 >= 8) {
const _j783 = _j630 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j562;
const _j784 = baseBrushSize;
if (_j783 >= 0.3) {
const _j785 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j786 = _j564 || window._strokeStartBaseBrushSize || 1;
let _j787 = _j785.indexOf(_j786);
if (_j787 === -1) {
_j787 = _j785.findIndex(s => s >= _j786);
if (_j787 === -1) _j787 = _j785.length - 1;
}
let _j788;
if      (_j783 < 0.5) _j788 = 1;
else if (_j783 < 0.7) _j788 = 2;
else                     _j788 = 3;
const _j789 = Math.min(_j787 + _j788, _j785.length - 1);
baseBrushSize = _j785[_j789];
} else if (_j783 >= 0) {
baseBrushSize = _j564 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j784 && _j784 > 0) {
const _j790 = Math.pow(baseBrushSize / _j784, 0.6);
_j531 *= _j790;
initialSize *= _j790;
}
}
if (_j531 <= _j532 && !_j549 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j549 = true;
_j570 = 0;
}
_j438 = _j502;
_j439 = _j503;
_j530 = map(noise(_j438 * 0.01, _j439 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j791 = strokeSeed + _j571 * 10000000;
randomSeed(_j791);
const _j792 = crandom.random(pathRotation * 0.5, pathRotation);
const _j793 = crandom.random(pathRotation * 0.5, pathRotation);
const _j492 = -10;
_j438 += _j792 * (cos(_j530)) + _j492;
_j439 += _j793 * (sin(_j530)) + _j492;
}
if (_j622) {
const _j794 = (brushMode === 3) ? _j438 : Math.round(_j438);
const _j795 = (brushMode === 3) ? _j439 : Math.round(_j439);
const _j796 = { x: _j794, y: _j795 };
if (_j552 && _j561) _j796.p = Math.round(_j562 * 1000) / 1000;
_j185("md", _j796);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j545 = _j438;
_j546 = _j439;
let _j301 = newBufferBlack;
if (_j571 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j797 = dist(_j438, _j439, _j540, _j541);
const _j798 = 1;
if (_j797 > _j798) {
if (brushMode == 4 && _j571 < expectedStrokeLength) {
_j59(_j301, _j438, _j439, _j540, _j541);
}
if ((brushMode == 1 || brushMode == 7) && _j571 < expectedStrokeLength) {
let _j799 = expectedStrokeLength > 0 ? min(_j571 / expectedStrokeLength, 1.0) : 0;
let _j800 = crandom.random(0, 1);
if (_j800 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j571 > 5 && baseBrushSize < 6.0) _j57(_j301, _j438, _j439);
}
_j58(_j301, _j438, _j439, _j799, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j571 < expectedStrokeLength) {
let _j799 = expectedStrokeLength > 0 ? min(_j571 / expectedStrokeLength, 1.0) : 0;
let _j800 = crandom.random(0, 1);
if (_j800 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j799 < 0.6) {}
_j61(_j301, _j438, _j439, _j799, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j571 < expectedStrokeLength) {
_j64(_j301, _j438, _j439, _j540, _j541);
if (crandom.random(0, 1) > 0.4) _j57(_j301, _j438, _j439);
}
if (brushMode == 5 && _j571 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j57(_j301, _j438, _j439);
}
if (brushMode == 6 && _j571 < expectedStrokeLength) {
let _j799 = expectedStrokeLength > 0 ? min(_j571 / expectedStrokeLength, 1.0) : 0;
_j65(_j301, _j438, _j439, _j799, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j571 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j540 = _j438;
_j541 = _j439;
if (_j630) {
_j636 = _j634;
_j637 = _j635;
}
}
const _j801 = _j630 ? _j638 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j548));
const _j802 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j801 : (_j801 && _j531 > 0);
if (_j802) {
if (_j572 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j301 = newBufferBlack;
_j30(_j301, force);
_j572++;
if (_j572 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j549 && _j570 < maxUpdates) {
force = map(_j570, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j301 = newBufferBlack;
_j30(_j301, force);
_j570++;
_j572++;
} else if (_j549 && _j570 >= maxUpdates) {
_j112('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j39();
_j549 = false;
}
if (_j629 == 1 && _j630 && !_j673) {
_j180();
}
if (_j629 == 1 && !_j630 && _j673) {
_j181();
}
if (_j673) {
_j182();
if (_j629 == 1) {
frameRate(10);
}
}
if (_j629 == 0) {
frameRate(60);
}
_j142();
if (_j708) {
_j708 = false;
const _j803 = drawingSeed;
randomSeed(_j709);
noiseSeed(_j709);
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
_j18(_j616, scanBounds);
}
randomSeed(_j803);
noiseSeed(_j803);
_j709 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j804 = window.pendingEffectControlScanQueue.shift();
if (_j804 && typeof _j18 === 'function') {
let scanBounds = _j804.scanBounds;
const action = _j804.action;
const shapeType = _j804.shapeType;
const bugsSize = _j804.bugsSize !== undefined ? _j804.bugsSize : 10.0;
const scanSeed = _j804.scanSeed;
const recordedRandomCount = _j804.recordedRandomCount;
const targetPoints = _j804.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j805 = document.getElementById('bugs-size');
const _j806 = document.getElementById('bugs-size-value');
if (_j805 && _j806) {
_j805.value = bugsSize;
_j806.textContent = bugsSize;
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
const _j807 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j616, scanBounds, shapeType, targetPoints);
if (_j807) {
randomSeed(_j807);
noiseSeed(_j807);
}
if (typeof window !== 'undefined') {
_j112('playback', '🔁 Effect Control: Scan (processed)', {
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
if (_j630) {
return;
}
if (_j565) {
return;
}
if (_j554) {
if (_j556 === 'rect') {
_j557 = { x1: mouseX - 10, y1: mouseY - 10 };
} else if (_j556 === 'polygon') {
_j558.push({ x: mouseX - 10, y: mouseY - 10 });
if (typeof _j93 === 'function') _j93();
}
return false;
}
_j543 = _j184(mouseX);
_j544 = _j184(mouseY);
pmouseX = mouseX;
pmouseY = mouseY;
_j545 = _j543;
_j546 = _j544;
_j634 = _j543;
_j635 = _j544;
_j636 = _j543;
_j637 = _j544;
if (typeof _j563 !== 'undefined') {
_j563[0] = _j563[1] = _j563[2] = 0;
}
const _j808 = 300;
if (_j543 < -_j808 || _j543 > width + _j808 ||
_j544 < -_j808 || _j544 > height + _j808) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j622) {
_j626++;
}
if (_j622) {
console.log(`🎬 錄製開始 [第 ${_j626} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j40();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j112('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j543.toFixed(0)}, ${_j544.toFixed(0)})`
});
_j649++;
_j573 = _j571;
_j516 = 0;
_j571 = 0;
if (_j552 && _j564 !== null) {
baseBrushSize = _j564;
}
if (typeof _j1043 !== 'undefined') {
_j1043 = [];
}
if (typeof _j1044 !== 'undefined') {
_j1044 = 0;
}
_j517 = crandom.random(0.5, 0.99);
_j518 = crandom.random(-0.02, 0.02);
_j519 = crandom.random(-0.05, 0.05);
_j520 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j184(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j184(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j184(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j809 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j810 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j622) {
if (_j628) {
if (_j623 === 0) {
_j623 = millis();
_j112('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j811 = millis() - _j625;
if (_j811 > 0) {
_j627 += _j811;
_j112('recording', '⏸️ Skip interval', {
Interval: `${_j811.toFixed(0)}ms`,
Accumulated: `${_j627.toFixed(0)}ms`
});
}
}
_j628 = false;
} else {
const _j811 = millis() - _j625;
_j627 += _j811;
_j112('recording', '⏸️ Skip interval', {
Interval: `${_j811.toFixed(0)}ms`,
Accumulated: `${_j627.toFixed(0)}ms`
});
}
_j624 = {
strokeSeed: strokeSeed,
mouseCountStart: _j573,
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
whiteMaxOpacity: _j184(_j517),
hueShift: _j184(_j518),
satShift: _j184(_j519),
briShift: _j184(_j520),
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
maskData: _j559 || undefined
};
}
if (_j577 === 1) {
pathRotation = 0;
} else if (_j577 === 2) {
pathRotation = _j184(crandom.random(5, 10));
} else if (_j577 === 3) {
pathRotation = _j184(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j184(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j521 = 15;
_j578 = 5;
_j523 = 0.6;
_j524 = 0.5;
} else if (brushMode === 2) {
initialSize = _j184(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j521 = 10;
_j578 = 10;
_j523 = 0.3;
_j524 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j578 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j578 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j543 * 1, _j544 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j523 = 0.6;
_j524 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j578 = 1;
randStep = 0.05;
maxUpdates = 10;
_j521 = 10;
_j523 = 0.6;
_j524 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j578 = 1;
randStep = 0.05;
maxUpdates = 10;
_j521 = 10;
_j523 = 0.6;
_j524 = 0.5;
} else {
initialSize = crandom.random(30, 40);
maxUpdates = 10;
randStep = 0.05;
}
if (useSharpen >= 3.5) {
maxUpdates = 20;
_j112('system', '⚡️ Ink Effect G active, maxUpdates set to 5', {
Status: 'Performance Optimization'
});
}
if (brushMode == 4) {
expectedStrokeLength = 400;
} else {
expectedStrokeLength = 400;
}
if (_j622 && _j624) {
_j624.initialSize = initialSize;
_j624.spraySize = spraySize;
_j624.step = _j521;
_j624.step2 = _j578;
_j624.randStep = randStep;
_j624.maxUpdates = maxUpdates;
_j624.pathRotation = pathRotation;
_j624.spring = _j523;
_j624.friction = _j524;
_j624.baseBrushSize = baseBrushSize;
_j624.expectedStrokeLength = expectedStrokeLength;
_j624.effect3Brightness = _j184(effect3Brightness);
}
_j531 = initialSize;
_j525 = _j531;
_j529 = _j525;
_j547 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j552 && _j564 === null) _j564 = baseBrushSize;
_j542 = 0;
x = _j543;
y = _j544;
_j526 = 0;
_j527 = 0;
_j528 = 0;
_j539 = 0;
_j533 = 0;
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
_j540 = _j543;
_j541 = _j544;
_j548 = true;
_j549 = false;
_j570 = 0;
_j572 = 0;
_j550 = true;
_j551 = false;
startX = _j543;
startY = _j544;
pathPoints = [{
x: _j543,
y: _j544
}];
_j576 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j622 && _j624) {
_j624.mouseX = _j543;
_j624.mouseY = _j544;
_j624.drawingSeed = drawingSeed;
_j624.brushModeSP = brushModeSP;
if (_j552 && _j561) _j624.hasPressure = true;
_j624.forceMapParams = {
randomSeed1: _j184(_j607[0]),
randomSeed2: _j184(_j607[1]),
randomSeed3: _j184(_j607[2]),
randomSeed4: _j184(_j607[3]),
scale1: _j184(_j608[0]),
scale2: _j184(_j608[1]),
scale3: _j184(_j608[2]),
amplitude1: _j184(_j609[0]),
amplitude2: _j184(_j609[1]),
amplitude3: _j184(_j609[2]),
phase1: _j184(_j610[0]),
phase2: _j184(_j610[1]),
phase3: _j184(_j610[2]),
vortexScale1: _j184(_j611[0]),
vortexScale2: _j184(_j611[1]),
clusterScale1: _j184(_j612[0]),
clusterScale2: _j184(_j612[1])
};
const _j812 = (brushMode === 3) ? _j543 : Math.round(_j543);
const _j813 = (brushMode === 3) ? _j544 : Math.round(_j544);
_j185("mp", {
x: _j812,
y: _j813,
strokeData: _j624
});
}
}
function mouseReleased() {
if (_j630) {
return;
}
if (_j554 && _j556 === 'rect' && _j557 && _j557.x1 !== undefined) {
const mx = mouseX - 10, my = mouseY - 10;
const x1 = Math.min(_j557.x1, mx);
const y1 = Math.min(_j557.y1, my);
const x2 = Math.max(_j557.x1, mx);
const y2 = Math.max(_j557.y1, my);
if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
_j557 = { x1: x1, y1: y1, x2: x2, y2: y2 };
drawMaskRect(x1, y1, x2, y2);
_j559 = { action: "rect", x1: x1, y1: y1, x2: x2, y2: y2 };
_j554 = false;
const toggle = document.getElementById('mask-mode-toggle');
if (toggle) toggle.checked = false;
if (typeof _j93 === 'function') _j93();
window.resetBrushPositionToMouse();
}
return;
}
if (!_j548) {
return;
}
if (_j568) {
_j569.push({ stroke: true, t: millis() });
}
const _j814 = crandom.getCount();
const _j815 = _j543;
const _j816 = _j544;
const _j817 = Math.round(constrain(_j815, 0, width));
const _j818 = Math.round(constrain(_j816, 0, height));
_j185("mr", {
x: _j817,
y: _j818
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j819 = randomCount - _j814;
const _j820 = window.drawLoopCount || 0;
const _j821 = window.recordedMouseDraggedCount || 0;
if (_j622) {
console.log(`   Draw: ${_j820} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j622) {
crandomDebugger.saveStroke('recording', _j626);
}
if (_j622) {
_j625 = millis();
_j112('recording', 'Stroke ended', {
FinalSize: _j531.toFixed(2),
CountdownStatus: _j549 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j543 < 0 || _j543 >= width || _j544 < 0 || _j544 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j1043 !== 'undefined' && _j1043.length > 0) {
_j1043 = _j1043.filter(_j1542 => _j1542.radius > 0);
}
if (!_j549) {
_j549 = true;
_j570 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j122();
return;
}
if (key === 'f' || key === 'F') {
if (_j673) {
_j181();
} else {
_j180();
}
return;
}
if (key === ' ') {
_j170();
console.clear();
let _j822 = _j233.length;
_j233 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j112('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j822} 个`
});
return false;
}
}
function _j37() {
const _j461 = doMoving && _j645 && _j644 !== null && _j630 && _j646;
const _j823 = (_j630 && _j461) || (!_j630 && (_j662 || _j666[0] !== 0 || _j666[40] !== 0 || _j666[80] !== 0 || _j666[120] !== 0));
if (_j823) {
if (!_j662) {
_j662 = true;
_j663 = millis();
_j664[0] = _j666[0];
_j664[40] = _j666[40];
_j664[80] = _j666[80];
_j664[120] = _j666[120];
}
const _j428 = millis() - _j663;
const _j429 = Math.min(_j428 / _j661, 1.0);
const _j824 = _j630 ? _j665 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j666[0] = lerp(_j664[0], _j824[0], _j429);
_j666[40] = lerp(_j664[40], _j824[40], _j429);
_j666[80] = lerp(_j664[80], _j824[80], _j429);
_j666[120] = lerp(_j664[120], _j824[120], _j429);
if (_j429 >= 1.0) {
_j666[0] = _j824[0];
_j666[40] = _j824[40];
_j666[80] = _j824[80];
_j666[120] = _j824[120];
if (!_j630) {
_j662 = false;
}
}
} else if (!_j630 && !_j662) {
_j666[0] = 0;
_j666[40] = 0;
_j666[80] = 0;
_j666[120] = 0;
}
}
function updateBlurEffect() {
const _j461 = doMoving && _j645 && _j644 !== null && _j630 && _j646;
const _j825 = _j630;
const _j826 = _j825 ? _j638 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j548));
const _j827 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j826 : (_j826 && _j531 > 0);
if (!doMoving) {
_j668[0] = 0;
_j668[40] = 0;
_j668[80] = 0;
_j668[120] = 0;
return;
}
if (_j825) {
if (_j672) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j667[0] = _j184(max(0, crandom.random(-5, 5)));
_j667[40] = _j184(max(0, crandom.random(-5, 5)));
_j667[80] = _j184(max(0, crandom.random(-5, 5)));
_j667[120] = _j184(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j669 = millis();
_j672 = false;
}
_j671 = _j826;
} else {
_j671 = false;
_j672 = false;
}
let _j828 = 0;
if (_j825) {
if (_j827) {
const _j428 = millis() - _j669;
const _j429 = min(1.0, _j428 / _j670);
_j828 = _j429;
} else if (_j549) {
const _j829 = map(_j570, 0, maxUpdates, 1.0, 0.0);
_j828 = _j829;
} else {
_j828 = 0;
}
if (_j461 && _j644 !== null) {
const _j425 = _j644.getDistance();
const _j421 = PI / 3;
const _j440 = height / (2 * tan(_j421 / 2));
const _j441 = 1.1;
const _j442 = 1.4;
const _j444 = _j440 / _j425;
const _j830 = _j442 - _j441;
const _j831 = (_j444 - _j441) / _j830;
const _j832 = constrain(_j831, 0.0, 1.0);
const _j833 = pow(_j832, 0.5);
_j828 = _j828 * _j833;
}
}
_j668[0] = _j667[0] * _j828;
_j668[40] = _j667[40] * _j828;
_j668[80] = _j667[80] * _j828;
_j668[120] = _j667[120] * _j828;
}
function drawLayersWithBlur() {
const _j461 = doMoving && _j645 && _j644 !== null && _j630 && _j646;
const _j490 = (typeof _j555 !== 'undefined' && _j555) ||
(typeof _j554 !== 'undefined' && _j554);
const _j491 = (typeof window !== 'undefined' && window.testMode === true);
const _j487 = ((_j548 || _j549) && _j570 < maxUpdates && _j576) || _j490 || _j491;
const _j834 = _j233.length > 0 && typeof _j21 === 'function';
const _j835 = false;
const _j836 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j513 && _j507;
if (_j508 && _j507) {
_j175();
}
_j614.begin();
clear();
if (_j836) {
let _j837 = _j616;
if (_j834) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j616, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j620, window.tempMetallicBuffer);
_j837 = _j620;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j513);
_j513.setUniform("rect", [0, 0, width * _j506, height * _j506]);
_j513.setUniform("tex0", _j837);
_j513.setUniform("forceMap", _j507);
_j513.setUniform("time", millis() * 0.005);
_j513.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j513.setUniform("distortEnabled", 1.0);
_j513.setUniform("displacementB", distortDisplacementB);
_j513.setUniform("displacementC", distortDisplacementC);
_j513.setUniform("showFbmMask", distortShowFbmMask);
_j513.setUniform("fbmSeed1", _j607[0] || 100);
_j513.setUniform("fbmSeed2", _j607[1] || 200);
_j513.setUniform("fbmSeed3", _j607[2] || 300);
_j513.setUniform("fbmSeed4", _j607[3] || 400);
} else {
_j513.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j513.setUniform("rsEnabled", 1.0);
_j513.setUniform("rsFrequency", _j582);
_j513.setUniform("rsWaveSpeed", _j583);
_j513.setUniform("rsStrength", _j584);
_j513.setUniform("rsGradientMix", _j585);
_j513.setUniform("rsScale", _j586);
} else {
_j513.setUniform("rsEnabled", 0.0);
}
_j513.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j513.setUniform("cellularScale", _j587);
_j513.setUniform("cellularSeed", _j588);
_j513.setUniform("whiteDotDensity", whiteDotEnabled ? _j589 : 0.0);
_j513.setUniform("grainAmount", grainEnabled ? _j590 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j616, 0, 0, width, height);
if (_j834) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j614, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j620, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j620, 0, 0, width, height);
}
}
_j614.end();
if (_j598 && _j599) {
const data = _j599;
const bounds = data.bounds;
const _j838 = {
rect: [0, 0, width * _j506, height * _j506],
blendType: data.blendType,
blendVol: _j605.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j605.pixD,
blendA: _j605.blendA,
blendB: _j605.blendB,
directVol: _j605.directVol,
snoiseVol: _j605.snoiseVol,
gobalStyle: _j605.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j605.colorDeep,
whiteDot: _j605.whiteDot,
doBigShape: _j605.doBigShape,
doMask: _j605.doMask,
multiDir: _j605.multiDir,
drawTime: _j605.drawTime,
seed: _j605.seed,
iTime: millis() * 0.001
};
if (typeMapBuffer && _j515) {
pingPongBuffer.begin();
clear();
shader(_j515);
for (const [key, val] of Object.entries(_j838)) {
_j515.setUniform(key, val);
}
_j515.setUniform('tex0', typeMapBuffer);
_j515.setUniform('lastStrokeTex', _j621);
_j515.setUniform('lastStrokeOnly', _j606 ? 1 : 0);
_j515.setUniform('isTypeMapMode', 1);
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
if (_j515) {
_j616.begin();
clear();
imageMode(CENTER);
image(oldBuffer, 0, 0, width, height);
_j616.end();
oldBuffer.begin();
shader(_j515);
for (const [key, val] of Object.entries(_j838)) {
_j515.setUniform(key, val);
}
_j515.setUniform('tex0', _j616);
_j515.setUniform('lastStrokeTex', _j621);
_j515.setUniform('lastStrokeOnly', _j606 ? 1 : 0);
_j515.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
oldBuffer.end();
}
if (_j515) {
_j616.begin();
clear();
imageMode(CENTER);
image(finalBuffer, 0, 0, width, height);
_j616.end();
finalBuffer.begin();
shader(_j515);
for (const [key, val] of Object.entries(_j838)) {
_j515.setUniform(key, val);
}
_j515.setUniform('tex0', _j616);
_j515.setUniform('lastStrokeTex', _j621);
_j515.setUniform('lastStrokeOnly', _j606 ? 1 : 0);
_j515.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
finalBuffer.end();
}
if (_j515) {
_j616.begin();
clear();
imageMode(CENTER);
image(_j614, 0, 0, width, height);
_j616.end();
_j614.begin();
shader(_j515);
for (const [key, val] of Object.entries(_j838)) {
_j515.setUniform(key, val);
}
_j515.setUniform('tex0', _j616);
_j515.setUniform('lastStrokeTex', _j621);
_j515.setUniform('lastStrokeOnly', _j606 ? 1 : 0);
_j515.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j614.end();
}
_j598 = false;
_j599 = null;
_j567 = true;
}
if (_j592 && _j515 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j614, 0, 0, width, height);
pingPongBuffer.end();
_j614.begin();
shader(_j515);
_j515.setUniform('rect', [0, 0, width * _j506, height * _j506]);
_j515.setUniform('tex0', pingPongBuffer);
_j515.setUniform('lastStrokeTex', _j621);
_j515.setUniform('lastStrokeOnly', _j606 ? 1 : 0);
_j515.setUniform('blendType', _j593);
_j515.setUniform('blendVol', _j605.blendVol * (1 + _j595 * 0.1));
_j515.setUniform('radSeed', _j597 * 0.001);
_j515.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j515.setUniform('pixD', _j605.pixD);
_j515.setUniform('blendA', _j605.blendA);
_j515.setUniform('blendB', _j605.blendB);
_j515.setUniform('directVol', _j605.directVol);
_j515.setUniform('snoiseVol', _j605.snoiseVol);
_j515.setUniform('gobalStyle', _j605.gobalStyle);
_j515.setUniform('vline', 5);
_j515.setUniform('hline', 5);
_j515.setUniform('cellT', 1.0);
_j515.setUniform('colorDeep', _j605.colorDeep);
_j515.setUniform('whiteDot', _j605.whiteDot);
_j515.setUniform('doBigShape', _j605.doBigShape);
_j515.setUniform('doMask', _j605.doMask);
_j515.setUniform('multiDir', _j605.multiDir);
_j515.setUniform('drawTime', _j605.drawTime);
_j515.setUniform('seed', _j605.seed);
_j515.setUniform('iTime', millis() * 0.001);
_j515.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j614.end();
}
noStroke();
push();
translate(0, 0, _j666[0]);
image(_j614, -width / 2, -height / 2);
pop();
if (_j487) {
push();
translate(0, 0, _j666[40]);
image(_j617, -width / 2, -height / 2);
pop();
}
if (_j630) {
if (showFuturePathPreview) {
_j42();
} else {
_j615.clear();
}
push();
translate(0, 0, _j666[80]);
image(_j615, -width / 2, -height / 2);
pop();
}
if (screenText && _j678) {
_j43();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j613.clear();
_j613.push();
_j45();
_j44();
_j613.pop();
} else {
_j613.clear();
_j613.push();
_j44();
_j613.pop();
}
const _j839 = (screenText && _j678) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0);
if (_j839) {
push();
translate(0, 0, _j666[120]);
image(_j613, -width / 2, -height / 2);
pop();
}
if (_j461) {
pop();
}
}
function drawMaskRect(x1, y1, x2, y2) {
var _j840 = height - y2;
var _j841 = height - y1;
push();
_j553.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 10000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
rectMode(CORNER);
rect(x1, _j840, x2 - x1, _j841 - _j840);
_j553.end();
pop();
_j555 = true;
}
function drawMaskPolygon(points) {
if (points.length < 3) return;
push();
_j553.begin();
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
_j553.end();
pop();
_j555 = true;
}
function clearMask() {
push();
_j553.begin();
background(255);
_j553.end();
pop();
_j555 = false;
_j558 = [];
_j557 = null;
}
function testMaskRect() {
const cx = width / 2;
const cy = height / 2;
const size = 100;
const x1 = cx - size / 2;
const y1 = cy - size / 2;
_j557 = { x1: x1, y1: y1, x2: x1 + size, y2: y1 + size };
drawMaskRect(x1, y1, x1 + size, y1 + size);
console.log('[Mask] Test rect drawn at center:', x1, y1, size, 'x', size);
}
window.testMaskRect = testMaskRect;
window.clearMask = clearMask;
window.drawMaskRect = drawMaskRect;
window.drawMaskPolygon = drawMaskPolygon;
window.testMode = false;
let _j842 = null;
function _j38(src, _j1190) {
if (!src || !_j1190) return;
_j1190.begin();
clear();
push();
imageMode(CENTER);
image(src, 0, 0, width, height);
pop();
_j1190.end();
}
function enterTestMode() {
if (window.testMode) return;
if (!_j842) {
_j842 = {
oldBuffer: createFramebuffer({ density: _j506 }),
finalBuffer: createFramebuffer({ density: _j506 }),
pingPongBuffer: createFramebuffer({ density: _j506 }),
typeMapBuffer: createFramebuffer({ density: _j506 }),
newBufferBlack: createFramebuffer({ density: _j506 })
};
}
_j38(oldBuffer, _j842.oldBuffer);
_j38(finalBuffer, _j842.finalBuffer);
_j38(pingPongBuffer, _j842.pingPongBuffer);
_j38(typeMapBuffer, _j842.typeMapBuffer);
_j38(newBufferBlack, _j842.newBufferBlack);
_j842.allBrushStrokes = (typeof allBrushStrokes !== 'undefined') ? allBrushStrokes.slice() : null;
_j842.totalStrokeCount = (typeof totalStrokeCount !== 'undefined') ? totalStrokeCount : 0;
_j842.enterMillis = millis();
window.testMode = true;
_j567 = true;
}
function exitTestMode() {
if (!window.testMode) return;
if (_j842) {
_j38(_j842.oldBuffer, oldBuffer);
_j38(_j842.finalBuffer, finalBuffer);
_j38(_j842.pingPongBuffer, pingPongBuffer);
_j38(_j842.typeMapBuffer, typeMapBuffer);
_j38(_j842.newBufferBlack, newBufferBlack);
if (typeof allBrushStrokes !== 'undefined' && _j842.allBrushStrokes) {
allBrushStrokes = _j842.allBrushStrokes.slice();
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = _j842.totalStrokeCount;
}
if (typeof currentStrokeHighlight !== 'undefined') currentStrokeHighlight = null;
if (typeof pendingBugBounds !== 'undefined') pendingBugBounds = null;
if (typeof _j575 !== 'undefined') _j575 = null;
if (typeof _j842.enterMillis === 'number' &&
typeof _j627 !== 'undefined' &&
typeof _j622 !== 'undefined' && _j622) {
_j627 += millis() - _j842.enterMillis;
}
}
window.testMode = false;
_j567 = true;
}
window.enterTestMode = enterTestMode;
window.exitTestMode = exitTestMode;
function _j39() {
_j621.begin();
clear();
background(255);
imageMode(CENTER);
image(newBufferBlack, 0, 0);
_j621.end();
_j616.begin();
clear();
shader(_j511);
const _j475 = brushColorMode === 1 ? 1.0 : 0.0;
_j511.setUniform("rect", [0, 0, width * _j506, height * _j506]);
_j511.setUniform("baseTex", finalBuffer);
_j511.setUniform("strokeTex", newBufferBlack);
_j511.setUniform("brushColorMode", float(brushColorMode));
_j511.setUniform("brushCategory", _j475);
_j511.setUniform("whiteMaxOpacity", _j517);
_j511.setUniform("hueShift", _j518);
_j511.setUniform("satShift", _j519);
_j511.setUniform("briShift", _j520);
_j511.setUniform("keyBlendMode", keyBlendMode);
_j511.setUniform("useSharpen", useSharpen);
_j511.setUniform("typeMapTex", typeMapBuffer);
const _j843 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j511.setUniform("canvasBackgroundColor", _j843);
const _j844 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j511.setUniform("customBrushColor", _j844);
_j511.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
_j511.setUniform("useMask", _j555 ? 1.0 : 0.0);
if (_j555) _j511.setUniform("maskTex", _j553);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j616.end();
if (_j514 && typeMapBuffer) {
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j616, 0, 0);
pingPongBuffer.end();
_j616.begin();
clear();
shader(_j514);
_j514.setUniform("rect", [0, 0, width * _j506, height * _j506]);
_j514.setUniform("baseTex", typeMapBuffer);
_j514.setUniform("strokeTex", newBufferBlack);
_j514.setUniform("brushCategory", _j475);
_j514.setUniform("whiteMaxOpacity", _j517);
_j514.setUniform("useMask", _j555 ? 1.0 : 0.0);
if (_j555) _j514.setUniform("maskTex", _j553);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j616.end();
typeMapBuffer.begin();
clear();
background(0);
imageMode(CENTER);
image(_j616, 0, 0, width, height);
typeMapBuffer.end();
_j616.begin();
clear();
imageMode(CENTER);
image(pingPongBuffer, 0, 0);
_j616.end();
}
finalBuffer.begin();
clear();
background(255);
imageMode(CENTER);
image(_j616, 0, 0);
finalBuffer.end();
oldBuffer.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(newBufferBlack, 0, 0);
blendMode(BLEND);
oldBuffer.end();
if (_j566 && _j576 && pathPoints.length > 1) {
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
_j548 = false;
_j549 = false;
_j570 = 0;
_j550 = false;
_j551 = true;
let _j845 = null;
if (pathPoints.length > 0) {
let _j846 = 0,
_j847 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j846 += pt.x;
_j847 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j363 = _j846 / pathPoints.length;
const _j364 = _j847 / pathPoints.length;
_j575 = {
minX,
maxX,
minY,
maxY,
_j363,
_j364,
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
x: _j363,
y: _j364
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
if (allBrushStrokes.length > _j579) {
allBrushStrokes.shift();
}
_j845 = {
minX: _j575.minX,
maxX: _j575.maxX,
minY: _j575.minY,
maxY: _j575.maxY
};
}
pathPoints = [];
_j576 = false;
_j575 = null;
const _j848 = drawingSeed;
let _j849 = _j845;
if (!_j849 && allBrushStrokes.length > 0) {
const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
if (lastStroke.bounds) {
_j849 = {
...lastStroke.bounds
};
}
}
if (_j849) {
pendingBugBounds = _j849;
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
if (_j574 && _j630) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j850 = false;
if (_j630 && recordingData && recordingData.events) {
let _j851 = 0;
for (let e of recordingData.events) {
const _j860 = e.m || e.type;
if (_j860 === 'mr' || _j860 === 'mouseReleased') {
_j851++;
}
}
const _j852 = totalStrokeCount;
const _j853 = _j852 >= (_j851 - 12);
_j850 = _j853;
if (_j850) {
const _j854 = crandom.random(0, 1) > 0.1;
if (_j854) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j849 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j849;
}
}
}
} else if (!_j630) {
_j850 = true;
}
if (_j850) {
_j708 = true;
_j709 = strokeSeed;
if (!_j630 && _j849 && !pendingBugBounds) {
pendingBugBounds = _j849;
}
} else {
if (_j849 && !pendingBugBounds) {
pendingBugBounds = _j849;
}
}
randomSeed(_j848);
noiseSeed(_j848);
}
if (typeof gc !== 'undefined') {
gc();
}
_j567 = true;
}
function _j40() {
if (_j550 && !_j551) {
if (_j548 || _j549) {
_j39();
}
}
}
function _j41() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j855 = [];
const _j856 = 20;
let _j857 = _j632;
let _j852 = null;
const offsetX = typeof _j642 !== 'undefined' ? _j642 : 0;
const offsetY = typeof _j643 !== 'undefined' ? _j643 : 0;
const _j858 = 500;
let _j859 = 0;
while (_j855.length < _j856 && _j857 < recordingData.events.length && _j859 < _j858) {
const event = recordingData.events[_j857];
const _j860 = event.m || event.type;
if (_j860 === 'mp' || _j860 === 'mousePressed') {
_j852 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j857,
data: event.strokeData || event.d || {}
};
} else if ((_j860 === 'md' || _j860 === 'mouseDragged') && _j852) {
_j852.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j860 === 'mr' || _j860 === 'mouseReleased') && _j852) {
_j852.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j855.push(_j852);
_j852 = null;
}
_j857++;
_j859++;
}
return _j855;
}
function _j42() {
if (!_j630 || !recordingData.events || recordingData.events.length === 0) {
_j615.clear();
return;
}
const now = millis();
const _j861 =
_j581.lastEventIndex !== _j632 ||
(now - _j581.lastUpdateTime) > _j581.updateInterval;
if (_j861) {
_j581.cachedStrokes = _j41();
_j581.lastEventIndex = _j632;
_j581.lastUpdateTime = now;
}
const _j855 = _j581.cachedStrokes;
_j615.clear();
if (_j855.length === 0) {
return;
}
_j615.push();
const time = millis() * 0.003;
for (let i = 0; i < _j855.length; i++) {
const _j862 = _j855[i];
const path = _j862.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j855.length - 1, 200, 80);
const _j863 = sin(time + i * 0.8) * 0.3 + 1;
const _j864 = _j862.eventIndex * 0.1;
const _j865 = 20;
const _j866 = min(max(floor(path.length / 5), 2), _j865);
const _j867 = [];
for (let s = 0; s < _j866; s++) {
const t = s / (_j866 - 1);
const _j307 = t * (path.length - 1);
const _j868 = floor(_j307);
const _j869 = min(_j868 + 1, path.length - 1);
const _j870 = _j307 - _j868;
const x1 = path[_j868].x;
const y1 = path[_j868].y;
const x2 = path[_j869].x;
const y2 = path[_j869].y;
const t1 = path[_j868].t || 0;
const t2 = path[_j869].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j867.push({
x: lerp(x1, x2, _j870),
y: lerp(y1, y2, _j870),
t: lerp(t1, t2, _j870)
});
}
const _j871 = [];
let _j872 = 0.01;
for (let j = 1; j < _j867.length; j++) {
const dx = _j867[j].x - _j867[j-1].x;
const dy = _j867[j].y - _j867[j-1].y;
const dt = _j867[j].t - _j867[j-1].t;
const _j873 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j871.push(_j873);
if (_j873 > _j872) _j872 = _j873;
}
_j615.noFill();
_j615.strokeCap(ROUND);
for (let j = 1; j < _j867.length; j++) {
const _j790 = constrain(_j871[j-1] / _j872, 0, 1);
const r = Math.round(_j790 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j790 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j790) * 255);
_j615.stroke(r, g, b, 160);
_j615.strokeWeight(1.0);
_j615.line(
_j867[j-1].x, _j867[j-1].y,
_j867[j].x, _j867[j].y
);
}
let _j874 = 0;
for (let j = 0; j < _j867.length - 1; j++) {
_j874 += dist(_j867[j].x, _j867[j].y, _j867[j + 1].x, _j867[j + 1].y);
}
if (isNaN(_j874) || _j874 <= 0 || _j867.length < 2) {
continue;
}
const _j875 = constrain(floor(_j874 / 150), 1, 3);
for (let a = 0; a < _j875; a++) {
_j615.push();
const _j876 = (time * 0.1 + _j864 + a * (1.0 / _j875)) % 1.0;
const _j877 = _j876 * _j874;
let _j878 = 0;
let _j879 = _j867[0].x;
let _j880 = _j867[0].y;
let angle = 0;
for (let j = 0; j < _j867.length - 1; j++) {
const _j881 = dist(_j867[j].x, _j867[j].y, _j867[j + 1].x, _j867[j + 1].y);
if (_j881 <= 0.0001) {
_j879 = _j867[j + 1].x;
_j880 = _j867[j + 1].y;
if (j + 1 < _j867.length - 1) {
angle = atan2(_j867[j + 2].y - _j867[j + 1].y, _j867[j + 2].x - _j867[j + 1].x);
} else {
angle = atan2(_j867[j + 1].y - _j867[j].y, _j867[j + 1].x - _j867[j].x);
}
break;
}
if (_j878 + _j881 >= _j877) {
const _j870 = (_j877 - _j878) / _j881;
const _j882 = isNaN(_j870) || !isFinite(_j870) ? 0 : constrain(_j870, 0, 1);
_j879 = lerp(_j867[j].x, _j867[j + 1].x, _j882);
_j880 = lerp(_j867[j].y, _j867[j + 1].y, _j882);
angle = atan2(_j867[j + 1].y - _j867[j].y, _j867[j + 1].x - _j867[j].x);
break;
}
_j878 += _j881;
}
const _j883 = 200 * (1 - _j876 * 0.5);
_j615.translate(_j879, _j880);
_j615.rotate(angle);
const _j884 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j615.fill(0, 0, 255, _j883);
_j615.noStroke();
_j615.triangle(
0, 0,
-4 * _j884, -2 * _j884,
-4 * _j884, 2 * _j884
);
_j615.stroke(0, 150, 255, _j883);
_j615.strokeWeight(0.3);
_j615.noFill();
_j615.triangle(
0, 0,
-4 * _j884, -2 * _j884,
-4 * _j884, 2 * _j884
);
_j615.pop();
}
const _j885 = path[0];
const _j407 = path[path.length - 1];
_j615.noFill();
_j615.stroke(0, 0, 255, 150);
_j615.strokeWeight(0.8);
_j615.ellipse(_j885.x, _j885.y, 5, 5);
_j615.ellipse(_j407.x, _j407.y, 5, 5);
_j615.noStroke();
_j615.fill(0, 0, 255, 255);
_j615.ellipse(_j885.x, _j885.y, 2, 2);
_j615.ellipse(_j407.x, _j407.y, 2, 2);
if (font) {
_j615.textFont(font);
_j615.noStroke();
const data = _j862.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j886 = _j885.x - 2;
const _j887 = _j885.y + 8;
_j615.textSize(6);
_j615.fill(0, 0, 255, 255);
_j615.textAlign(LEFT, CENTER);
_j615.text('#' + (i + 1), _j886, _j887);
}
}
_j615.pop();
}
function _j43() {
_j613.clear();
_j613.push();
_j613.noFill();
_j613.noStroke();
_j613.rectMode(CENTER);
let _j790 = (width * 0.05) / height;
_j613.rect(0, 0, width * 0.95, height * (1 - _j790));
_j613.translate(-width / 2 - 5, -height / 2 + 20);
_j613.textAlign(LEFT, TOP);
if (font) {
_j613.textFont(font);
}
_j613.textSize(6);
let _j888 = width - 50;
_j613.fill(0, 0, 0, 100);
_j613.noStroke();
let _j889 = [];
let _j273 = _j704;
let _j890 = Math.max(0, _j700.length - _j701 - _j702);
let _j891 = _j700.length;
for (let i = _j890; i < _j891; i++) {
let line = _j700[i];
let _j892 = _j46(line.text, _j888, _j613);
for (let j = 0; j < _j892.length; j++) {
if (_j889.length >= _j701) break;
_j889.push({
type: line.type,
text: _j892[j],
timestamp: line.timestamp
});
}
if (_j889.length >= _j701) break;
}
for (let i = 0; i < _j889.length; i++) {
let line = _j889[i];
let y = _j704 + i * _j705;
if (line.type === 'recording') {
_j613.fill(255, 0, 0, _j706);
} else if (line.type === 'playback') {
_j613.fill(0, _j706);
} else if (line.type === 'system') {
_j613.fill(0, 0, 255, _j706);
} else if (line.type === 'art') {
_j613.fill(0, _j706);
} else {
_j613.fill(0, _j706);
}
_j613.text("--", _j703, y);
_j613.text(line.text, _j703, y);
}
_j45();
_j613.pop();
_j44();
}
function _j44() {
if (window.showStrokeDivider === false) return;
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (strokeCount === 0) return;
_j613.push();
_j613.resetMatrix();
_j613.translate(0, 0);
const _j893 = hh - 15;
const _j894 = width * 0.98;
const _j895 = -_j894 / 2;
const _j896 = _j894 / 2;
const _j897 = _j896 - _j895;
_j613.stroke(0, 50);
_j613.strokeWeight(1);
_j613.noFill();
_j613.line(_j895, _j893, _j896, _j893);
_j613.strokeWeight(1.2);
_j613.line(_j895, _j893 + 5, _j895, _j893 - 5);
_j613.line(_j896, _j893 + 5, _j896, _j893 - 5);
if (strokeCount > 0) {
const _j898 = _j897 / strokeCount;
_j613.stroke(0, 70);
_j613.strokeWeight(0.7);
for (let i = 1; i < strokeCount; i++) {
const x = _j895 + i * _j898;
_j613.line(x, _j893 - 5, x, _j893);
}
if (font) _j613.textFont(font);
_j613.textAlign(CENTER, CENTER);
_j613.textSize(10);
_j613.fill(0, 50);
_j613.noStroke();
const _j886 = _j896;
const _j887 = _j893 - 15;
_j613.text(strokeCount.toString(), _j886, _j887);
}
_j613.pop();
}
function _j45() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j899 = millis();
const _j428 = _j899 - currentStrokeHighlight.startTime;
const _j900 = 1000;
const _j901 = _j900 * 0.5;
if (_j428 < _j900) {
let alpha = 255;
if (_j428 > _j901) {
const _j902 = (_j428 - _j901) / (_j900 - _j901);
alpha = 255 * (1 - _j902);
}
const gp = currentStrokeHighlight.gridParams;
_j613.push();
_j613.resetMatrix();
_j613.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j399 = 5;
const _j400 = 5;
_j613.stroke(255, 0, 0, alpha);
_j613.strokeWeight(1);
_j613.noFill();
let _j903 = true;
let _j878 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j401 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j401;
let dy = (y2 - y1) / _j401;
let _j402 = 0;
while (_j402 < _j401) {
let _j403 = _j903 ? _j399 : _j400;
let _j404 = min(_j403 - _j878, _j401 - _j402);
if (_j903) {
let startX = x1 + dx * _j402;
let startY = y1 + dy * _j402;
let _j405 = x1 + dx * (_j402 + _j404);
let _j406 = y1 + dy * (_j402 + _j404);
_j613.line(startX, startY, _j405, _j406);
}
_j402 += _j404;
_j878 += _j404;
if (_j878 >= (_j903 ? _j399 : _j400)) {
_j903 = !_j903;
_j878 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j885 = currentStrokeHighlight.points[0];
const _j407 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j613.fill(255, 0, 0, alpha);
_j613.noStroke();
_j613.ellipse(_j885.x, _j885.y, 5, 5);
_j613.fill(255, 0, 0, alpha);
_j613.ellipse(_j407.x, _j407.y, 5, 5);
}
}
const _j363 = (gp.left + gp.right) / 2;
const _j364 = (gp.top + gp.bottom) / 2;
_j613.stroke(0, 0, 200, alpha);
_j613.strokeWeight(1.0);
_j613.noFill();
_j613.rectMode(CORNER);
_j613.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j613.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j46(text, _j1521, _j1511 = null) {
let _j904 = text.split(' ');
let _j765 = [];
let _j905 = '';
for (let i = 0; i < _j904.length; i++) {
let _j906 = _j905 + (_j905 ? ' ' : '') + _j904[i];
let _j907 = _j1511 ? _j1511.textWidth(_j906) : textWidth(_j906);
if (_j907 > _j1521 && _j905) {
_j765.push(_j905);
_j905 = _j904[i];
} else {
_j905 = _j906;
}
}
if (_j905) {
_j765.push(_j905);
}
return _j765;
}
function _j47() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.style.width = (width * 1.0) + 'px';
referenceContainer.style.height = (height * 1.0) + 'px';
_j112('system', 'Reference image size updated', {
Width: (width * 0.8) + 'px',
Height: (height * 0.8) + 'px'
});
}
}
function touchStarted(e) {
if (e && e.touches && e.touches.length > 0) {
var t = e.touches[0];
if (_j48(t.clientX, t.clientY)) {
_j565 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j543 = _j184(mouseX);
_j544 = _j184(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j565) return true;
if (_j554) return true;
_j543 = _j184(mouseX);
_j544 = _j184(mouseY);
return false;
}
function touchEnded() {
if (_j565) {
_j565 = false;
return true;
}
_j565 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j48(clientX, clientY) {
const _j908 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('mask-panel'),
document.getElementById('zen-mode-btn'),
document.getElementById('collect-panels-btn')
];
for (let panel of _j908) {
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
const _j909 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j909)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j909)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j909)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j909)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j909 = 20;
return {
minX: Math.max(0, (gp.left - _j909)) / width,
minY: Math.max(0, (gp.top - _j909)) / height,
maxX: Math.min(width, (gp.right + _j909)) / width,
maxY: Math.min(height, (gp.bottom + _j909)) / height
};
}
return null;
}
function _j50(blendType, seed = null, _j1522 = false) {
if (!_j515) return;
_j592 = true;
_j593 = blendType;
_j594 = millis();
_j600 = 0;
_j595 = 0;
_j603 = _j1522;
_j597 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j605.seed = _j597 * 0.0001;
}
function _j51() {
if (!_j592) return null;
const duration = millis() - _j594;
const iterations = _j595;
const frames = _j600;
if (iterations > 0 && flowEffectStrokeBounds) {
_j598 = true;
_j599 = {
blendType: _j593,
iterations: iterations,
seed: _j597,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j592 = false;
_j593 = 0;
_j603 = false;
return {
duration,
iterations,
frames
};
}
function _j52() {
if (!_j592) return;
_j600++;
_j595 = Math.floor(_j600 / _j604);
if (_j603 && _j601 > 0) {
if (_j600 >= _j601) {
_j595 = _j602;
const _j910 = document.getElementById('flow-iteration-count');
if (_j910) {
_j910.textContent = _j595;
}
_j51();
_j601 = 0;
_j602 = 0;
return;
}
}
const _j910 = document.getElementById('flow-iteration-count');
if (_j910) {
_j910.textContent = _j595;
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
_j605.seed = seed * 0.0001;
_j598 = true;
_j599 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j599);
}
const _j911 = [{
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
function _j54(_j1511, _j922, _j923, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j922, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j923, alpha);
}
}
function _j55(_j1511, _j922, _j923, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j922, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j923, alpha);
}
}
function _j56(id, _j1511, _j1005, x, y, _j966, _j967, _j959, _j960, _j980, sizeVariation, _j999) {
let _j912 = _j980 * sizeVariation + _j999;
const _j913 = (_j552 && typeof _j564 !== 'undefined' && _j564 !== null) ? _j564 : baseBrushSize;
const _j914 = _j913 < 0.25;
let _j915 = _j914 ? max(2.0, _j913 * 10) : 15;
if (_j912 > _j915) {
_j912 = crandom.random(_j914 ? 0.6 : 1, _j915);
}
let sw = max(_j914 ? 0.6 : 1, _j912);
if (sw < 3) sw *= 2.0;
const offsetX = _j1005.offsetX;
const offsetY = _j1005.offsetY;
if (brushModeSP) {
const _j916 = max(0.15, min(1.5, _j913));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j917 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j916, 6 * _j916) : crandom.random(-16 * _j916, 16 * _j916);
let _j918 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j916, 6 * _j916) : crandom.random(-16 * _j916, 16 * _j916);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j959,
y + offsetY + _j960,
_j966 + offsetX + _j917,
_j967 + offsetY + _j918
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j959,
y + offsetY + _j960,
_j966 + offsetX,
_j967 + offsetY
);
}
} else if (!brushModeSP) {
if (_j913 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j959,
y + offsetY + _j960,
_j966 + offsetX,
_j967 + offsetY
);
}
}
const _j919 = [{
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
const _j920 = [{
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
const _j921 = [{
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
function _j57(_j1511, _j1523, _j1524) {
if (_j571 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j571, ">=", expectedStrokeLength, ")");
return;
}
_j1511.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j922 = _j60(_j516);
let _j923 = _j60(_j516);
const _j924 = _j630 ? _j636 : pmouseX;
const _j925 = _j630 ? _j637 : pmouseY;
let _j926 = 0.5 * initialSize * noise(_j1523 * 0.01, _j1524 * 0.01) * (abs(_j1523 - _j924) + abs(_j1524 - _j925));
const _j927 = (_j552 && typeof _j564 !== 'undefined' && _j564 !== null) ? _j564 : baseBrushSize;
let _j928 = 0;
_j928 = min(spraySize * _j927, _j926) * map(noise(_j1523, _j1524), 0, 1, 0.3, 1);
let _j929 = max(3, _j928);
if (_j571 < 5) {
let _j930 = map(_j571, 0, 5, -0.2, 1.0);
_j929 = max(2, _j928 * _j930);
} else if (_j571 >= (expectedStrokeLength - 5)) {
let _j931 = map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j929 = max(2, _j928 * _j931);
}
for (let i = 0; i < _j578; i++) {
const _j932 = lerp(_j1523, _j924, i / _j578)
const lerpY = lerp(_j1524, _j925, i / _j578)
for (let j = 0; j < 10; j++) {
let _j917, _j918;
let _j933 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j934 = crandom.random(TWO_PI);
const _j935 = crandom.random();
const _j936 = crandom.random(-_j929 * _j933, _j929 * _j933);
const _j937 = crandom.random(-_j929 * _j933, _j929 * _j933);
if (shapeType === 0) {
const angle = _j934;
const radius = sqrt(_j935) * _j929;
_j917 = radius * cos(angle);
_j918 = radius * sin(angle);
} else if (shapeType === 1) {
_j917 = sin(_j934) * _j936;
_j918 = cos(_j934) * _j937;
} else if (shapeType === 2) {
const u = _j934 / TWO_PI;
const v = _j935;
if (u + v > 1) {
_j917 = _j929 * (1 - u);
_j918 = _j929 * (1 - v);
} else {
_j917 = _j929 * u;
_j918 = _j929 * v;
}
_j917 -= _j929 * 0.5;
_j918 -= _j929 * 0.5;
} else {
const u = _j936 / _j929;
const v = _j937 / _j929;
const _j938 = abs(u) + abs(v);
if (_j938 > 1) {
_j917 = (u / _j938) * _j929;
_j918 = (v / _j938) * _j929;
} else {
_j917 = u * _j929;
_j918 = v * _j929;
}
}
let _j780 = crandom.random(0, 1);
let _j781 = crandom.random(0.2, 1);
let _j939 = crandom.random(1, 2);
let _j940 = _j927 < 0.25 ? 0.1 : 0.3;
_j781 = max(_j940, _j781 * _j927);
_j939 = max(_j940, _j939 * _j927);
let _j941 = crandom.random(100, 255);
let ss = _j780 > 0.1 ? _j781 : _j939;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j942 = _j927 < 0.25 ? max(0.3, _j927 * 3) : 2;
let _j943 = _j927 < 0.25 ? _j927 * 5 : 20;
ss = max(_j942, min(_j943, ss));
_j55(_j1511, _j922, _j923, brushColorMode, _j941);
noStroke();
ellipse(_j932 + _j917, lerpY + _j918, ss, ss)
}
}
pop();
_j1511.end();
}
function _j58(_j1511, _j1523, _j1524, _j799, _j522 = 0, _j1525 = 0) {
if (_j571 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j571, ">=", expectedStrokeLength, ")");
return;
}
_j1511.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j922 = _j60(_j516);
let _j923 = _j60(_j516);
const _j944 = (_j552 && typeof _j564 !== 'undefined' && _j564 !== null) ? _j564 : baseBrushSize;
const _j945 = _j552 ? (_j630 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j562) : -1;
const _j946 = (_j945 >= 0) ? (0.7 + 0.4 * Math.min(_j945 / 0.7, 1.0)) : 1.0;
let _j914 = _j944 < 0.25;
let _j947 = 0.6;
let _j948 = _j914 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j947, baseBrushSize * 2);
let _j949 = max(_j947, baseBrushSize * 1.5);
let _j950 = _j914 ? swFloorTiny : _j949;
if (_j950 < 3) _j950 *= 2.0;
let _j951 = _j914 ?
swFloorTiny :
max(_j947, baseBrushSize * 1.2);
if (_j951 < 3) _j951 *= 2.0;
let _j952;
if (_j914) {
_j952 = max(2.0, _j944 * 10);
} else if (_j944 < 0.5) {
_j952 = 0.7;
} else {
_j952 = 9999;
}
_j539 = _j529 * 0.5;
let _j438 = _j1523;
let _j439 = _j1524;
if (!_j542) {
_j542 = 1;
x = _j438;
y = _j439;
}
_j526 += (_j438 - x) * _j523;
_j527 += (_j439 - y) * _j523;
_j526 *= _j524;
_j527 *= _j524;
let _j953 = sqrt(_j526 * _j526 + _j527 * _j527);
_j528 += _j953 - _j528;
if (baseBrushSize <= 1.0) {
_j528 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j528 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j528 *= 2.0;
} else {
_j528 *= 3.0;
}
_j529 = _j525 - _j528;
let _j954 = brushPaintCtlNoisebyFrame;
let _j955 = 1.0 * baseBrushSize * _j954 * _j946;
let _j956 = 2.0 * baseBrushSize * _j954 * _j946;
let _j957 = 3.0 * baseBrushSize * _j954 * _j946;
let showMainBrush = 0.1;
let _j958 = initialSize;
let _j959 = 0;
let _j960 = 0;
if (_j1525 == 0) showMainBrush = 0.08;
else if (_j1525 == 1) showMainBrush = 0.6;
else if (_j1525 == 2) showMainBrush = 0.2;
let _j961 = 1.0;
let _j962 = _j521 + brushPaintInterpolationOffset;
for (let i = 0; i < _j962; ++i) {
let _j963 = baseBrushSize >= 1.0 ? 5 : 3;
let _j964 = baseBrushSize >= 1.0 ? 2 : 0;
let _j965 = 0;
if (baseBrushSize < 1.5) _j965 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j965 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j965 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j965 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j522 = _j965;
if (_j571 < 5) _j522 = crandom.random(0, 1) > 0.2 ? 5 : _j522;
let _j966 = x;
let _j967 = y;
x += _j526 / _j962;
y += _j527 / _j962;
let _j968 = crandom.random(0, 1);
let _j969 = crandom.random(0, 4);
let _j970 = crandom.random(0, 3);
let _j971 = crandom.random(-1, 1);
let _j972 = crandom.random(-1, 1);
let _j973 = crandom.random(-1, 1);
let _j974 = crandom.random(-1, 1);
let _j975 = showMainBrush;
let _j976 = 1.0;
if (_j522 == 3) {
_j975 *= 0.8;
_j976 *= 0.8;
} else if (_j522 == 4) {
_j975 *= 0.6;
_j976 *= 0.5;
}
if (_j944 < 0.25) {
_j975 = 0.18;
} else if (_j944 < 1.5) {
_j975 = 0.1;
}
_j533 = lerp(_j533, _j529, 0.5);
if (brushMode == 1) {
if (_j968 > 0.8 && _j539 < 2 && i == 0) {
_j539 = _j184(_j969);
}
} else {
_j539 += (_j533 - _j539) * 0.3;
}
let _j977;
if (brushMode == 1) {
_j977 = _j539;
} else {
if (_j571 < 5) {
let _j930 = map(_j571, 0, 5, 0.05, 1.0);
_j977 = max(_j914 ? 0.1 : 0.5, _j539 * _j930);
if (explodeStart) {
_j959 = _j971 * map(_j571, 0, 5, 10, 0);
_j960 = _j972 * map(_j571, 0, 5, 10, 0);
}
} else if (_j571 >= (expectedStrokeLength - 5)) {
let _j931 = map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j977 = max(_j914 ? 0.1 : 0.5, _j539 * _j931);
if (explodeEnd) {
_j959 = _j973 * map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j960 = _j974 * map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j539 > 2) {
_j977 = max(_j914 ? 0.2 : 1, _j539);
} else {
let _j978 = (_j970 / 3) - 0.5;
_j977 = max(_j914 ? 0.1 : 0.5, _j539 + _j978);
}
}
}
let _j979 = _j977;
let _j980 = _j977 * 0.5;
if (_j522 == 3) {
_j979 *= 0.8;
_j980 *= 0.8;
} else if (_j522 == 4) {
_j979 *= 0.5;
_j980 *= 0.5;
}
let _j981 = crandom.random(0, 1);
let _j982 = crandom.random(150, 255);
let _j983 = crandom.random(100, 255);
let _j984 = crandom.random(100, 255);
let _j985 = crandom.random(100, 255);
if (_j914) {
if (!brushModeSP && _j571 > 1) {
_j54(_j1511, _j922, _j923, brushColorMode, _j982);
let kk = min(_j958, max(_j950, _j979));
strokeWeight(min(_j952, kk));
line(x + _j959, y + _j960, _j966, _j967);
}
} else if (_j981 > _j975) {
_j54(_j1511, _j922, _j923, brushColorMode, _j982);
const _j986 = !brushModeSP && _j571 > 3 && baseBrushSize < 4.0;
if (_j979 < 5) {
let kk = 0;
if (_j1525 == 0) kk = 1.5 * min(_j958, max(_j950, _j979));
else kk = min(_j958, max(_j950, _j979));
strokeWeight(min(_j952, kk));
if (_j986) line(x + _j959, y + _j960, _j966, _j967)
} else {
let kk = _j976 * min(_j958, max(_j950, _j979));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j952, kk));
if (_j986) line(x + _j959, y + _j960, _j966, _j967)
}
}
const _j987 = [];
const _j988 = [];
for (let j = 0; j < 30; j++) {
_j987.push(crandom.random(0, 1));
_j988.push(crandom.random(-0.5, 0.5) * _j961);
}
if (_j1525 == 1) {
_j987[0] = _j987[0] * 2.0;
_j987[1] = _j987[1] * 0.5;
_j987[2] = _j987[2] * 0.5;
} else if (_j1525 == 2) {
_j987[0] = _j987[0] * 0.5;
_j987[1] = _j987[1] * 0.5;
_j987[2] = _j987[2] * 0.5;
}
const _j989 = _j911[brushDir];
if (_j522 == 0) {
_j54(_j1511, _j922, _j923, brushColorMode, _j983);
if (_j987[0] > 0.2) {
const _j990 = _j989.flip1stX ? -1 : +1;
const _j991 = _j989.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j988[0], sizeVariation);
if (_j980 * sizeVariation < 5) {
strokeWeight(min(_j952, noise(x * 0.1, y * 0.2) + 1.5 * max(_j951, _j980 * sizeVariation)));
} else {
strokeWeight(min(_j952, _j976 * max(_j948, _j980 * sizeVariation)));
}
line(x + _j990 * _j956 + _j959, y + _j991 * _j956 + _j960, _j966 + _j990 * _j956, _j967 + _j991 * _j956);
}
if (_j987[1] > 0.3) {
const _j992 = _j989.flip1stX ? -1 : +1;
const _j993 = _j989.flip1stY ? +1 : -1;
_j54(_j1511, _j922, _j923, brushColorMode, _j984);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j988[1], sizeVariation);
strokeWeight(min(_j952, _j976 * max(_j948, _j980 * sizeVariation)));
line(x + _j992 * _j956 + _j959, y + _j993 * _j956 + _j960, _j966 + _j992 * _j956, _j967 + _j993 * _j956);
}
} else if (_j522 == 1) {
_j54(_j1511, _j922, _j923, brushColorMode, _j983);
if (_j987[0] > 0.1) {
const _j990 = _j989.flip1stX ? -1 : +1;
const _j991 = _j989.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j988[0], sizeVariation);
strokeWeight(min(_j952, _j976 * max(_j948, _j980 * sizeVariation)));
line(x + _j990 * _j956 + _j959, y + _j991 * _j956 + _j960, _j966 + _j990 * _j956, _j967 + _j991 * _j956)
};
if (_j987[1] > 0.05) {
const _j992 = _j989.flip1stX ? -1 : +1;
const _j993 = _j989.flip1stY ? +1 : -1;
_j54(_j1511, _j922, _j923, brushColorMode, _j984);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j988[1], sizeVariation);
strokeWeight(min(_j952, _j976 * max(_j948, _j980 * sizeVariation)));
line(x + _j992 * _j955 + _j959, y + _j993 * _j955 + _j960, _j966 + _j992 * _j955, _j967 + _j993 * _j955)
};
if (_j987[2] > 0.15) {
const _j994 = -1;
const _j995 = -1;
_j54(_j1511, _j922, _j923, brushColorMode, _j985);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j988[2], sizeVariation);
if (_j980 * sizeVariation < 5) {
strokeWeight(min(_j952, noise(x * 1, y * 2) + 1.5 * max(_j951, _j980 * sizeVariation)));
} else {
strokeWeight(min(_j952, _j976 * max(_j948, _j980 * sizeVariation)));
}
line(x + _j994 * _j957 + _j959, y + _j995 * _j957 + _j960, _j966 + _j994 * _j957, _j967 + _j995 * _j957)
};
} else if (_j522 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j54(_j1511, _j922, _j923, brushColorMode, _j983);
const _j996 = [_j987[0], _j987[1], _j987[2], _j987[3], _j987[4]];
const _j997 = [_j988[3], _j988[4], _j988[5], _j988[6], _j988[7]];
for (let i = 0; i < _j919.length; i++) {
const _j268 = _j919[i];
const _j998 = _j996[i];
const _j999 = _j997[i];
if (_j998 > _j268.randThreshold) {
let _j1000;
if (_j268.offsetBase === 1) {
_j1000 = _j955;
} else if (_j268.offsetBase === 2) {
_j1000 = _j956;
} else if (_j268.offsetBase === 3) {
_j1000 = _j957;
} else {
_j1000 = _j268.offsetBase * baseBrushSize * _j954;
}
let _j1001, _j1002;
if (i === 0) {
_j1001 = _j989.flip1stX ? -_j268.signX : _j268.signX;
_j1002 = _j989.flip1stY ? -_j268.signY : _j268.signY;
} else {
_j1001 = _j268.signX;
_j1002 = _j268.signY;
}
let _j1003 = _j1001 * _j1000;
let _j1004 = _j1002 * _j1000;
const _j1005 = {
offsetX: _j1003,
offsetY: _j1004,
randThreshold: _j268.randThreshold,
pathProgressEnd: _j268.pathProgressEnd,
jitterIndex: _j268.jitterIndex
};
_j56(
2, _j1511, _j1005, x, y, _j966, _j967,
_j959, _j960, _j980, sizeVariation,
_j999
);
}
}
} else if (_j522 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j54(_j1511, _j922, _j923, brushColorMode, _j983);
let _j1006 = baseBrushSize * _j954;
if (baseBrushSize > 4.0) _j1006 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j920.length; i++) {
let _j1007 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j268 = _j920[i];
const _j998 = _j987[i];
const _j999 = _j988[_j268.jitterIndex];
if (_j998 > _j268.randThreshold) {
const _j1008 = cos(_j268.angle + _j1007) * _j268.radius * _j1006;
const _j1009 = sin(_j268.angle + _j1007) * _j268.radius * _j1006;
const _j1003 = (_j989.flip1stX ? -1 : 1) * _j1008;
const _j1004 = (_j989.flip1stY ? -1 : 1) * _j1009;
const _j1005 = {
offsetX: _j1003,
offsetY: _j1004,
randThreshold: _j268.randThreshold,
pathProgressEnd: _j268.pathProgressEnd,
jitterIndex: _j268.jitterIndex
};
_j56(
3, _j1511, _j1005, x, y, _j966, _j967,
_j959, _j960, _j980, sizeVariation,
_j999
);
}
}
} else if (_j522 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j54(_j1511, _j922, brushColorMode, _j983);
let _j1006 = baseBrushSize * _j954;
if (baseBrushSize > 4.0) _j1006 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j921.length; i++) {
let _j1007 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j268 = _j921[i];
const _j998 = _j987[i];
const _j999 = _j988[_j268.jitterIndex];
if (_j998 > _j268.randThreshold) {
const _j1008 = cos(_j268.angle + _j1007) * _j268.radius * _j1006;
const _j1009 = sin(_j268.angle + _j1007) * _j268.radius * _j1006;
const _j1003 = (_j989.flip1stX ? -1 : 1) * _j1008;
const _j1004 = (_j989.flip1stY ? -1 : 1) * _j1009;
const _j1005 = {
offsetX: _j1003,
offsetY: _j1004,
randThreshold: _j268.randThreshold,
pathProgressEnd: _j268.pathProgressEnd,
jitterIndex: _j268.jitterIndex
};
_j56(
4, _j1511, _j1005, x, y, _j966, _j967,
_j959, _j960, _j980, sizeVariation,
_j999
);
}
}
}
}
pop();
_j1511.end();
}
function _j59(_j1511, _j1523, _j1524, _j1526 = null, _j1527 = null, n = 80, o = 2) {
_j1511.begin();
push();
translate(-hw, -hh);
const _j924 = (_j1526 !== null && _j1527 !== null) ? _j1526 : (_j630 ? _j636 : pmouseX);
const _j925 = (_j1526 !== null && _j1527 !== null) ? _j1527 : (_j630 ? _j637 : pmouseY);
const _j1010 = (_j552 && typeof _j564 !== 'undefined' && _j564 !== null) ? _j564 : baseBrushSize;
const _j1011 = baseBrushSize;
const _j1012 = _j571;
const _j1013 = max(_j1010 < 0.25 ? 0.3 : 1, initialSize - (_j571 * randStep));
o = min(_j1011 * 2.0, 5 * _j1013 * penSketchNoiseBase * map(sin(_j1012 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1523 - _j924) > 0.1 || abs(_j1524 - _j925) > 0.1;
let _j922 = _j60(_j516);
let _j923 = _j60(_j516);
const _j1014 = [];
for (let i = 0; i < n; i++) {
_j1014.push({
t: crandom.random(0, 1),
strokeWeight: max(_j1010 < 0.25 ? 0.1 : 0.3, min(_j1010 < 0.25 ? _j1011 * 5 : 2, _j1011 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j1015 = _j1014[i];
let t = _j1015.t;
strokeWeight(_j1015.strokeWeight);
const angle = _j1015.angle;
const radius = _j1015.radius;
let _j1016 = radius * cos(angle);
let _j1017 = radius * sin(angle);
let _j941 = _j1015.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1523, _j924, t) + _j1016;
y = lerp(_j1524, _j925, t) + _j1017;
} else {
x = _j1523 + _j1016;
y = _j1524 + _j1017;
}
_j54(_j1511, _j922, _j923, brushColorMode, _j941);
if (_j571 > 3) point(x, y);
}
pop();
_j1511.end();
}
if (typeof _j61.lastAngle === 'undefined') {
_j61.lastAngle = 0;
}
if (typeof _j61.lastMovementAngle === 'undefined') {
_j61.lastMovementAngle = 0;
}
const _j1018 = [{
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
function _j60(_j922) {
if (brushColorMode === 0) {
return _j922 + crandom.random(10, 40);
} else {
return _j922 + crandom.random(30, 80);
}
}
function _j61(_j1511, _j1523, _j1524, _j799, _j522 = 0, _j1525 = 0) {
if (_j571 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j571, ">=", expectedStrokeLength, ")");
return;
}
const _j1019 = (_j552 && typeof _j564 !== 'undefined' && _j564 !== null) ? _j564 : baseBrushSize;
let _j914 = _j1019 < 0.25;
let _j952 = _j914 ? _j1019 * 5 : 9999;
_j1511.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j922 = _j60(_j516);
let _j923 = _j60(_j516);
let _j958 = initialSize * 0.3;
let _j438 = _j1523;
let _j439 = _j1524;
if (!_j542) {
_j542 = 1;
x = _j438;
y = _j439;
}
_j526 += (_j438 - x) * _j523;
_j527 += (_j439 - y) * _j523;
_j526 *= _j524;
_j527 *= _j524;
_j528 += sqrt(_j526 * _j526 + _j527 * _j527) - _j528;
_j528 *= 1.2;
if (baseBrushSize <= 1.0) {
_j528 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j528 *= 1.3;
} else {
_j528 *= 1.5;
}
_j529 = _j525 - _j528;
let _j1020 = _j533;
let _j1021 = _j529;
let _j1022 = _j438 - x;
let _j1023 = _j439 - y;
let _j1024 = sqrt(_j1022 * _j1022 + _j1023 * _j1023);
let _j1025 = max(_j914 ? 0.1 : 0.5, _j1021 * 0.5);
let _j1026 = 1.5 * min(_j958, max(_j914 ? 0.5 : 4, _j1025));
let _j1027 = _j1026 * 0.6;
let _j1028 = 0.8;
let _j1029 = max(_j1027 * _j1028, 0.5);
let _j1030 = max(1, ceil(_j1024 / _j1029));
_j1030 = max(10, min(50, _j1030));
let _j1031 = _j1030 / _j521;
let _j959 = 0;
let _j960 = 0;
let _j1032 = min(1.0, _j1024 / 10);
let _j1033 = _j1032 > 0.3;
rectMode(CENTER);
let _j232 = crandom.random(50, 100);
const _j235 = [];
for (let i = 0; i < _j521; ++i) {
_j235.push({
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
for (let i = 0; i < _j521; ++i) {
const _j1034 = _j235[i];
let _j966 = x;
let _j967 = y;
x += _j526 / _j521;
y += _j527 / _j521;
let _j429 = (i + 1) / _j521;
let _j1035 = lerp(_j1020, _j1021, _j429);
_j533 = lerp(_j533, _j1035, 0.5);
_j539 += (_j533 - _j539) * 0.8;
_j539 = max(_j914 ? 0.2 : 1.5, _j539);
let _j977;
let _j971 = _j1034.explodeX1;
let _j972 = _j1034.explodeY1;
let _j973 = _j1034.explodeX2;
let _j974 = _j1034.explodeY2;
if (_j571 < 5) {
let _j930 = map(_j571, 0, 5, 0.05, 1.0);
_j977 = max(_j914 ? 0.1 : 0.5, _j539 * _j930);
if (explodeStart) {
_j959 = _j971 * map(_j571, 0, 5, 10, 0);
_j960 = _j972 * map(_j571, 0, 5, 10, 0);
}
} else if (_j571 >= (expectedStrokeLength - 5)) {
let _j931 = map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j977 = max(_j914 ? 0.1 : 0.5, _j539 * _j931);
if (explodeEnd) {
_j959 = _j973 * map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j960 = _j974 * map(_j571, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j977 = max(_j914 ? 0.1 : 0.5, _j539);
}
let _j981 = _j1034.showMainBrush;
let _j982 = _j1034.mainAlpha;
let showMainBrush = 0.3;
let _j1036 = showMainBrush;
if (_j1031 > 1.0) {
_j1036 = showMainBrush / _j1031;
} else if (_j1031 < 1.0) {
_j1036 = showMainBrush * (2.0 - _j1031);
}
if (_j981 > _j1036 && _j571 > 5) {
noStroke();
_j54(_j1511, _j922, _j923, brushColorMode, _j982);
let ss = min(_j952, 1.2 * min(_j958, max(3 * _j1019, _j977)));
let dx = x - _j966;
let dy = y - _j967;
let distance = sqrt(dx * dx + dy * dy);
let _j274;
const _j321 = 0.1;
if (distance < _j321) {
_j274 = _j61.lastAngle;
} else {
let _j1037 = atan2(dy, dx);
_j274 = _j1037 + PI / 2;
_j61.lastAngle = _j274;
_j61.lastMovementAngle = _j1037;
}
push();
translate(x, y);
rotate(_j274);
let _j1027 = ss * _j1034.rectWidthMult;
rect(0, 0, _j1027, _j1027 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j1032 > 0.9 && _j571 > 5 && _j571 < (expectedStrokeLength - 5)) {
let _j1038 = -sin(_j61.lastMovementAngle);
let _j1039 = cos(_j61.lastMovementAngle);
for (let j = 0; j < _j1018.length; j++) {
let _j1040 = _j1018[j];
let _j1041 = _j1034.flyWhiteRandoms[j];
let _j1042 = _j1040.randThreshold - _j1032 * 0.3;
if (_j1041 > _j1042) {
let offsetX = _j1038 * _j1040.perpOffset * _j1019;
let offsetY = _j1039 * _j1040.perpOffset * _j1019;
stroke(_j232);
strokeWeight(min(_j952, max(_j914 ? 0.1 : 0.5, _j977 * 0.3)));
line(_j966 + offsetX, _j967 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
_j1511.end();
}
let _j1043 = [];
let _j1044 = 0;
function _j62(baseBrushSize, strokeSeed) {
let _j1045, _j1046;
if (baseBrushSize <= 0.1) {
_j1045 = 2;
_j1046 = 4;
} else if (baseBrushSize <= 0.25) {
_j1045 = 4;
_j1046 = 7;
} else if (baseBrushSize <= 0.5) {
_j1045 = 6;
_j1046 = 10;
} else if (baseBrushSize <= 2.0) {
_j1045 = 10;
_j1046 = 15;
} else if (baseBrushSize <= 3.0) {
_j1045 = 20;
_j1046 = 30;
} else {
_j1045 = 30;
_j1046 = 50;
}
let count;
if (_j1045 === _j1046) {
count = _j1045;
} else {
const _j1047 = strokeSeed + 50000;
randomSeed(_j1047);
count = Math.floor(crandom.random(_j1045, _j1046 + 1));
}
const _j1048 = [];
const _j1049 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1050 = _j1049 + i * 1000;
randomSeed(_j1050);
const perpOffset = crandom.random(-6, 6);
const _j1051 = _j1049 + i * 2000 + 1;
randomSeed(_j1051);
const randThreshold = crandom.random(0.5, 1.0);
const _j1052 = _j1049 + i * 3000 + 2;
randomSeed(_j1052);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1053 = _j1049 + i * 4000 + 3;
randomSeed(_j1053);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1054 = _j1049 + i * 5000 + 4;
randomSeed(_j1054);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1055 = _j1049 + i * 6000 + 5;
randomSeed(_j1055);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1056 = _j1049 + i * 7000 + 6;
randomSeed(_j1056);
const endDistanceOffset = crandom.random(0, 8);
const _j1057 = _j1049 + i * 8000 + 7;
randomSeed(_j1057);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1058 = _j1049 + i * 9000 + 8;
randomSeed(_j1058);
const widthVariationFactor = crandom.random(0, 1);
const _j1059 = _j1049 + i * 10000 + 9;
randomSeed(_j1059);
const offsetVariationFactor = crandom.random(0, 1);
_j1048.push({
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
_j1048.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1048;
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
function _j64(_j1511, _j1523, _j1524, _j1526 = null, _j1527 = null) {
if (_j571 >= expectedStrokeLength) {
return;
}
_j1511.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j924 = (_j1526 !== null && _j1527 !== null) ? _j1526 : (_j630 ? _j636 : pmouseX);
const _j925 = (_j1527 !== null && _j1527 !== null) ? _j1527 : (_j630 ? _j637 : pmouseY);
const _j1060 = _j1523 - _j924;
const _j1061 = _j1524 - _j925;
const _j1062 = sqrt(_j1060 * _j1060 + _j1061 * _j1061);
const speedMultiplier = map(constrain(_j1062, 3, 50), 0, 50, 0.1, 5.0);
let _j1063 = 0,
_j1064 = 0;
let _j1065 = 0,
_j1066 = 0;
let _j1067 = 0,
_j1068 = 0;
if (_j1062 > 0.1) {
_j1063 = _j1060 / _j1062;
_j1064 = _j1061 / _j1062;
_j1065 = -_j1064;
_j1066 = _j1063;
_j1067 = _j1064;
_j1068 = -_j1063;
} else {
_j1065 = 0;
_j1066 = 1;
_j1067 = 0;
_j1068 = -1;
}
const _j1069 = _j571 < expectedStrokeLength;
const _j1070 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1071 = strokeSeed + _j571 * 10000 + 1;
randomSeed(_j1071);
const _j1072 = _j1069 ? Math.floor(crandom.random(0, _j1070)) : 0;
for (let i = 0; i < _j1072; i++) {
const _j1073 = strokeSeed + _j571 * 1000 + _j1044;
randomSeed(_j1073);
const _j1074 = crandom.random(5, 15) * baseBrushSize;
const _j1075 = _j1523 + crandom.random(-2, 2) * baseBrushSize;
const _j1076 = _j1524 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1077, _j1078, _j1079;
if (brushColorMode === 0) {
_j1077 = _j1078 = _j1079 = _j516 * 0.3;
} else if (brushColorMode === 1) {
_j1077 = _j1078 = _j1079 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1077 = customBrushColor[0];
_j1078 = customBrushColor[1];
_j1079 = customBrushColor[2];
} else {
const color = _j215[brushColorMode];
if (color && color.rgb) {
_j1077 = color.rgb[0];
_j1078 = color.rgb[1];
_j1079 = color.rgb[2];
} else {
_j1077 = _j1078 = _j1079 = 26;
}
}
const _j1080 = {
id: _j1044++,
location: {
x: _j1075,
y: _j1076
},
prevLocation: {
x: _j1075,
y: _j1076
},
radius: _j1074,
r: _j1077,
g: _j1078,
b: _j1079,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j1043.push(_j1080);
}
const _j1081 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1082 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j1043.length - 1; i >= 0; i--) {
const _j1083 = _j1043[i];
if (_j1083.radius <= 0) {
continue;
}
const _j1084 = strokeSeed + _j571 * 1000 + _j1083.id * 100;
randomSeed(_j1084);
const _j1085 = crandom.random(_j1081, _j1082) * 3.0;
_j1083.radius -= _j1085;
const _j1086 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1087 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1083.xOff += _j1086;
_j1083.yOff += _j1087;
const _j1088 = 2.0 * speedMultiplier;
let _j1089 = 0,
_j1090 = 0;
const _j1091 = crandom.random(0, 1);
const _j1092 = (_j1083.sideDirection !== undefined) ? _j1083.sideDirection : (_j1091 > 0.5 ? 1 : -1);
if (_j1092 === 1) {
_j1089 = _j1067 * _j1088;
_j1090 = _j1068 * _j1088;
} else {
_j1089 = _j1065 * _j1088;
_j1090 = _j1066 * _j1088;
}
const nX = noise(_j1083.location.x) * _j1083.xOff;
const nY = noise(_j1083.location.y) * _j1083.yOff;
if (!_j1083.prevLocation) {
_j1083.prevLocation = {
x: _j1083.location.x,
y: _j1083.location.y
};
} else {
_j1083.prevLocation.x = _j1083.location.x;
_j1083.prevLocation.y = _j1083.location.y;
}
_j1083.location.x += 2.0 * (_j1089 * 0.2 + nX * 0.8);
_j1083.location.y += 2.0 * (_j1090 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1093 = noise(_j1083.location.x * 0.01, _j1083.location.y * 0.01) * 5;
_j1083.r = constrain(_j1083.r + _j1093, 0, 255);
_j1083.g = constrain(_j1083.g + _j1093, 0, 255);
_j1083.b = constrain(_j1083.b + _j1093, 0, 255);
} else if (brushColorMode == 0) {
const _j1093 = noise(_j1083.location.x * 0.01, _j1083.location.y * 0.01) * 2;
_j1083.r = constrain(_j1083.r + _j1093, 0, 200);
_j1083.g = constrain(_j1083.g + _j1093, 0, 200);
_j1083.b = constrain(_j1083.b + _j1093, 0, 200);
}
const _j1094 = crandom.random(0, 1) > 0.2;
const _j1095 = crandom.random(0, 1) > 0.99;
if (_j1083.radius > 0) {
stroke(_j1083.r, _j1083.g, _j1083.b, 200);
strokeWeight(max(1, _j1083.radius * 0.5));
if (_j1094) {
line(_j1083.prevLocation.x, _j1083.prevLocation.y, _j1083.location.x, _j1083.location.y);
}
if (_j1095) {
_j1083.radius = -1;
}
} else {
_j1083.radius = -1;
}
}
const _j1096 = _j1043.length;
let _j1097 = 0;
for (let i = 0; i < _j1043.length; i++) {
if (_j1043[i].radius > 0) {
if (_j1097 !== i) {
_j1043[_j1097] = _j1043[i];
}
_j1097++;
}
}
_j1043.length = _j1097;
const _j1098 = _j1043.length;
if (window.DEBUG_MODE && _j1096 > _j1098) {
const _j1099 = _j1096 - _j1098;
if (_j1099 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1099} dead particles removed (${_j1096} → ${_j1098})`);
}
}
pop();
_j1511.end();
}
function _j65(_j1511, _j1523, _j1524, _j799, _j522 = 0, _j1525 = 0) {
if (_j571 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j571, ">=", expectedStrokeLength, ")");
return;
}
_j1511.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j922 = _j60(_j516);
let _j958 = initialSize * 0.3;
const _j1100 = (_j552 && typeof _j564 !== 'undefined' && _j564 !== null) ? _j564 : baseBrushSize;
let _j438 = _j1523;
let _j439 = _j1524;
if (!_j542) {
_j542 = 1;
x = _j438;
y = _j439;
}
_j526 += (_j438 - x) * _j523;
_j527 += (_j439 - y) * _j523;
_j526 *= _j524;
_j527 *= _j524;
_j528 += sqrt(_j526 * _j526 + _j527 * _j527) - _j528;
_j528 *= 0.7;
_j529 = _j525 - _j528;
let _j1020 = _j533;
let _j1021 = _j529;
let _j1022 = _j438 - x;
let _j1023 = _j439 - y;
let _j1024 = sqrt(_j1022 * _j1022 + _j1023 * _j1023);
const _j1101 = _j1100;
const _j1102 = _j1101 < 0.25;
const _j1103 = _j1101 < 1.0;
let _j1025 = max(_j1102 ? 0.05 : (_j1103 ? _j1101 * 0.5 : 0.5), _j1021 * 0.5);
let _j1026 = 1.5 * min(_j958, max(_j1103 ? _j1101 * 4 : 4, _j1025));
let _j1027 = _j1026 * 0.6;
let _j1028 = 0.8;
let _j1029 = max(_j1027 * _j1028, 0.5);
let _j1030 = max(1, ceil(_j1024 / _j1029));
_j1030 = max(10, min(50, _j1030));
let _j1031 = _j1030 / _j521;
let _j959 = 0;
let _j960 = 0;
let _j1032 = min(1.0, _j1024 / 10);
let _j1033 = _j1032 > 0.3;
rectMode(CENTER);
let _j232 = crandom.random(30, 70);
const _j1104 = `flyBrush_${_j1100}_${strokeSeed}`;
let _j1105;
if (_j65.configCache[_j1104]) {
_j1105 = _j65.configCache[_j1104];
} else {
_j1105 = _j62(_j1100, strokeSeed);
_j65.configCache[_j1104] = _j1105;
}
const _j1106 = map(_j232, 30, 70, 0, _j1105.length);
const _j1107 = _j1105.length;
const _j1108 = 40;
const _j235 = [];
for (let i = 0; i < _j521; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1108; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1109 = _j571 * 0.08 + j * 0.15;
const _j1110 = _j571 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1109, _j1110));
const _j1111 = _j571 * 0.1 + j * 0.1;
const _j1112 = _j571 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1111, _j1112));
}
_j235.push({
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
for (let i = 0; i < _j521; ++i) {
const _j1034 = _j235[i];
let _j966 = x;
let _j967 = y;
x += _j526 / _j521;
y += _j527 / _j521;
let _j429 = (i + 1) / _j521;
let _j1035 = lerp(_j1020, _j1021, _j429);
_j533 = lerp(_j533, _j1035, 0.5);
_j539 += (_j533 - _j539) * 0.8;
_j539 = max(_j1103 ? _j1101 * 1.5 : 1.5, _j539);
let _j977;
_j977 = max(_j1102 ? _j1101 * 0.5 : (_j1103 ? _j1101 : 0.5), _j539);
let dx = x - _j966;
let dy = y - _j967;
let distance = sqrt(dx * dx + dy * dy);
let _j1037;
const _j321 = 0.1;
if (distance < _j321) {
_j1037 = _j65.lastMovementAngle;
} else {
_j1037 = atan2(dy, dx);
let _j274 = _j1037 + PI / 2;
_j65.lastAngle = _j274;
_j65.lastMovementAngle = _j1037;
}
let _j981 = _j1034.showMainBrush;
let _j982 = _j1034.mainAlpha;
let showMainBrush = 0.3;
let _j1036 = showMainBrush;
if (_j1031 > 1.0) {
_j1036 = showMainBrush / _j1031;
} else if (_j1031 < 1.0) {
_j1036 = showMainBrush * (2.0 - _j1031);
}
let _j1038 = -sin(_j1037);
let _j1039 = cos(_j1037);
const _j1113 = max(_j1102 ? _j1101 * 0.4 : (_j1103 ? _j1101 * 0.5 : 0.5), _j525 * 0.5);
const _j1114 = _j528 * 0.5;
const _j1115 = _j571 < (expectedStrokeLength - 5);
const _j1116 = _j571 >= (expectedStrokeLength - 5);
const _j1117 = _j1116 ? 0.7 : 1.0;
const _j1118 = _j571 >= expectedStrokeLength;
let _j1119, _j1120, _j1121, _j1122, _j1123;
if (_j1116) {
_j1119 = expectedStrokeLength - 5;
_j1120 = _j571 - _j1119;
_j1121 = min(1.0, _j1120 / 5.0);
_j1122 = cos(_j1037);
_j1123 = sin(_j1037);
}
for (let j = 0; j < _j1105.length; j++) {
let _j1040 = _j1105[j];
const _j1124 = _j571 >= _j1040.startOffset;
if (!_j1124 || _j1118) {
continue;
}
let _j1041 = _j1034.flyWhiteRandoms[j];
let _j1042 = _j1040.randThreshold * _j1117;
if (_j1041 > _j1042) {
const _j1125 = _j1034.flyWhiteOffsetNoises[j];
const _j1006 = map(_j1125, 0, 1, 1.0, 2.0);
const _j1126 = 1.0 + (_j1006 - 1.0) * _j1040.offsetVariationFactor;
const _j1127 = _j1103 ? max(0.3, _j1101 * 3) : _j1101;
const _j1128 = _j1040.perpOffset * _j1127 * _j1126;
let offsetX = _j1038 * _j1128;
let offsetY = _j1039 * _j1128;
let _j272 = x;
let _j273 = y;
let _j1129 = _j966;
let _j1130 = _j967;
if (_j1116) {
const _j1131 = _j1040.endDistanceOffset * _j1121 * _j1100;
const _j1132 = _j1122 * _j1131;
const _j1133 = _j1123 * _j1131;
_j272 = x + _j1132;
_j273 = y + _j1133;
if (_j1120 === 0) {
_j1129 = _j966;
_j1130 = _j967;
} else {
const _j1134 = min(1.0, (_j1120 - 1) / 5.0);
const _j1135 = _j1040.endDistanceOffset * _j1134 * _j1100;
const _j1136 = _j1122 * _j1135;
const _j1137 = _j1123 * _j1135;
_j1129 = x + _j1136;
_j1130 = y + _j1137;
}
}
const _j1138 = _j1114 * _j1040.brushSpeedMultiplier * _j1040.speedMultiplier;
const _j1139 = max(_j1102 ? _j1101 * 0.3 : (_j1103 ? _j1101 * 0.3 : 0.5), _j1113 - _j1138);
const _j1140 = _j1139 * 0.6;
const _j1141 = _j1034.flyWhiteWidthNoises[j];
const _j1142 = map(_j1141, 0, 1, 0.8, 1.2);
const _j1143 = 1.0 + (_j1142 - 1.0) * _j1040.widthVariationFactor;
let _j1144 = max(0, map(j, 0, _j1105.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1144) + random(-50, 50);
stroke(_j922, kk);
const _j1145 = _j1140 * _j1040.sizeMultiplier * _j1143;
const _j1146 = max(1, _j1145);
const _j1147 = `${_j1104}_${j}`;
let _j1148 = _j65.lastStrokeWeights[_j1147];
if (typeof _j1148 === 'undefined') {
_j1148 = _j1146;
}
const _j1149 = _j1148;
let _j1150;
if (_j1149 < 3.0) {
_j1150 = 0.15;
} else if (_j1149 >= 5.0) {
_j1150 = 0.3;
} else {
const t = (_j1149 - 3.0) / (5.0 - 3.0);
_j1150 = lerp(0.15, 0.3, t);
}
const _j1151 = lerp(_j1148, _j1146, _j1150);
_j65.lastStrokeWeights[_j1147] = _j1151;
strokeWeight(_j1151);
line(_j1129 + offsetX, _j1130 + offsetY, _j272 + offsetX, _j273 + offsetY);
}
}
}
pop();
_j1511.end();
}
let _j1152 = null;
function _j66() {
return typeof window !== 'undefined' && window.__INKFIELD_BUILD__ === true;
}
function _j67() {
if (_j1152) return _j1152;
_j1152 = {
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
return _j1152;
}
function _j68(key) {
if (!_j1152) {
_j67();
}
return _j1152[key];
}
function _j69(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j68('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j681.x = e.clientX - rect.left - rect.width / 2;
_j681.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j70(e) {
if (!isDragging) return;
const overlay = _j68('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j681.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j681.y) / window.innerHeight) * 100;
_j682.x = x;
_j682.y = y;
_j72(overlay, _j682, _j75);
}
function _j71() {
if (!isDragging) return;
isDragging = false;
const overlay = _j68('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j72(overlay, _j682, _j75);
}
_j111();
}
function _j72(panel, pos, _j1528) {
if (!panel) return;
_j1528();
const _j1153 = panel.querySelector('.control-btn');
if (!_j1153) return;
const rect = _j1153.getBoundingClientRect();
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
_j1528();
}
}
function _j73(_j1529) {
if (!_j1529) return;
const _j908 = [
document.getElementById('message-overlay'),
_j68('controlPanel'),
_j68('effectControlPanel'),
_j68('flowEffectPanel'),
_j68('maskPanel')
];
_j908.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1529.classList.add('panel-front');
}
function _j74() {
const _j908 = [
document.getElementById('message-overlay'),
_j68('controlPanel'),
_j68('effectControlPanel'),
_j68('flowEffectPanel'),
_j68('maskPanel')
];
_j908.forEach(panel => {
if (!panel) return;
panel.addEventListener('mousedown', () => _j73(panel));
panel.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) _j73(panel);
}, {
passive: true
});
});
}
function _j75() {
const overlay = _j68('messageOverlay');
if (!overlay) return;
overlay.style.left = _j682.x + '%';
overlay.style.top = _j682.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j76(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j683 = true;
const panel = _j68('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j684.x = e.clientX - rect.left - rect.width / 2;
_j684.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j77(e) {
if (!_j683) return;
const panel = _j68('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j684.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j684.y) / window.innerHeight) * 100;
_j685.x = x;
_j685.y = y;
_j72(panel, _j685, _j79);
}
function _j78(e) {
if (!_j683) return;
_j683 = false;
const panel = _j68('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j685, _j79);
_j111();
}
function _j79() {
const panel = _j68('controlPanel');
if (!panel) return;
panel.style.left = _j685.x + '%';
panel.style.top = _j685.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j80(e) {
if (e.target.closest('.control-btn')) return;
_j687 = true;
const panel = _j68('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j688.x = e.clientX - rect.left - rect.width / 2;
_j688.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j81(e) {
if (!_j687) return;
const panel = _j68('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j688.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j688.y) / window.innerHeight) * 100;
_j689.x = x;
_j689.y = y;
_j72(panel, _j689, _j83);
}
function _j82(e) {
if (!_j687) return;
_j687 = false;
const panel = _j68('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j689, _j83);
_j111();
}
function _j83() {
const panel = _j68('effectControlPanel');
if (!panel) return;
panel.style.left = _j689.x + '%';
panel.style.top = _j689.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j84(e) {
if (e.target.closest('.control-btn')) return;
_j691 = true;
const panel = _j68('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j692.x = e.clientX - rect.left - rect.width / 2;
_j692.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j85(e) {
if (!_j691) return;
const panel = _j68('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j692.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j692.y) / window.innerHeight) * 100;
_j693.x = x;
_j693.y = y;
_j72(panel, _j693, _j87);
}
function _j86(e) {
if (!_j691) return;
_j691 = false;
const panel = _j68('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j693, _j87);
_j111();
}
function _j87() {
const panel = _j68('flowEffectPanel');
if (!panel) return;
panel.style.left = _j693.x + '%';
panel.style.top = _j693.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j88(e) {
if (e.target.closest('.control-btn') || e.target.closest('.toggle-label')) return;
_j695 = true;
const panel = _j68('maskPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j696.x = e.clientX - rect.left - rect.width / 2;
_j696.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j89(e) {
if (!_j695) return;
const panel = _j68('maskPanel');
if (!panel) return;
const x = ((e.clientX - _j696.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j696.y) / window.innerHeight) * 100;
_j697.x = x;
_j697.y = y;
_j72(panel, _j697, _j91);
}
function _j90(e) {
if (!_j695) return;
_j695 = false;
const panel = _j68('maskPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j697, _j91);
_j111();
}
function _j91() {
const panel = _j68('maskPanel');
if (!panel) return;
panel.style.left = _j697.x + '%';
panel.style.top = _j697.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j92() {
const _j1154 = document.getElementById('mask-rect-btn');
const _j1155 = document.getElementById('mask-poly-btn');
if (_j1154) _j1154.classList.toggle('active', _j556 === 'rect');
if (_j1155) _j1155.classList.toggle('active', _j556 === 'polygon');
}
function _j93() {
const _j1156 = document.getElementById('mask-status');
if (!_j1156) return;
if (_j554) {
_j1156.textContent = _j556 === 'rect' ? 'Draw rect mask' : 'Click to add points, press Polygon again to close';
} else if (_j555) {
_j1156.textContent = 'Mask active';
} else {
_j1156.textContent = 'No mask';
}
const c = document.querySelector('canvas');
if (c) {
c.classList.toggle('mask-cursor', _j554);
}
}
function _j94() {
return _j68('controlPanel');
}
let _j1157 = {};
let _j1158 = {
hint: null,
startX: 0,
startY: 0,
offsetX: 0,
offsetY: 0,
isDragging: false,
hasMoved: false,
lastDragTime: 0
};
function _j95() {
return Date.now() - _j1158.lastDragTime < 200;
}
function _j96(hint, _j1530) {
const button = document.getElementById(_j1530);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j97(e, hint) {
const rect = hint.getBoundingClientRect();
_j1158.hint = hint;
_j1158.startX = e.clientX;
_j1158.startY = e.clientY;
_j1158.offsetX = e.clientX - rect.left;
_j1158.offsetY = e.clientY - rect.top;
_j1158.isDragging = true;
_j1158.hasMoved = false;
}
function _j98(e) {
if (!_j1158.isDragging || !_j1158.hint) return;
const dx = Math.abs(e.clientX - _j1158.startX);
const dy = Math.abs(e.clientY - _j1158.startY);
if (dx > 5 || dy > 5) {
_j1158.hasMoved = true;
_j1158.hint.style.transition = 'none';
}
if (_j1158.hasMoved) {
const x = e.clientX - _j1158.offsetX;
const y = e.clientY - _j1158.offsetY;
_j1158.hint.style.left = x + 'px';
_j1158.hint.style.top = y + 'px';
}
}
function _j99(e) {
if (!_j1158.isDragging || !_j1158.hint) return;
const hint = _j1158.hint;
if (_j1158.hasMoved) {
_j1157[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1157));
hint.style.transition = '';
_j1158.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1158.hint = null;
_j1158.isDragging = false;
_j1158.hasMoved = false;
}
function _j100() {
const _j1159 = localStorage.getItem('hintPositions');
if (_j1159) {
_j1157 = JSON.parse(_j1159);
}
}
function _j101() {
const _j1160 = [{
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
_j1160.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j97(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1161 = e.touches[0];
_j97({
clientX: _j1161.clientX,
clientY: _j1161.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j98);
document.addEventListener('mouseup', _j99);
document.addEventListener('touchmove', (e) => {
if (_j1158.isDragging && e.touches.length === 1) {
_j98({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1158.hasMoved) e.preventDefault();
}
}, {
passive: false
});
document.addEventListener('touchend', (e) => {
_j99({
preventDefault: () => {},
stopPropagation: () => {}
});
});
}
function _j102() {
_j100();
const _j908 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j678
}, {
panel: _j68('controlPanel'),
hint: _j68('brushHint'),
button: 'toggle-control-panel',
visible: _j686
}, {
panel: _j68('effectControlPanel'),
hint: _j68('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j690
}, {
panel: _j68('flowEffectPanel'),
hint: _j68('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j694
}, {
panel: _j68('maskPanel'),
hint: _j68('maskHint'),
button: 'toggle-mask-panel',
visible: _j698
}];
_j908.forEach(({
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
_j96(hint, button);
panel.style.display = 'none';
panel.style.opacity = '';
panel.style.pointerEvents = '';
});
}
});
}
function _j103() {
_j686 = !_j686;
const panel = _j94();
const brushHint = _j68('brushHint');
if (!panel) return;
if (_j686) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (brushHint) {
brushHint.classList.add('hidden');
}
} else {
if (brushHint) {
_j96(brushHint, 'toggle-control-panel');
brushHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j686) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j686.toString());
}
function _j104() {
_j690 = !_j690;
const panel = _j68('effectControlPanel');
const effectHint = _j68('effectHint');
if (!panel) return;
if (_j690) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (effectHint) {
effectHint.classList.add('hidden');
}
} else {
if (effectHint) {
_j96(effectHint, 'toggle-effect-control-panel');
effectHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j690) {
panel.style.display = 'none';
}
}, 300);
}
_j109();
}
function _j105() {
_j694 = !_j694;
const panel = _j68('flowEffectPanel');
const flowHint = _j68('flowHint');
if (!panel) return;
if (_j694) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (flowHint) {
flowHint.classList.add('hidden');
}
} else {
if (flowHint) {
_j96(flowHint, 'toggle-flow-effect-panel');
flowHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j694) {
panel.style.display = 'none';
}
}, 300);
}
_j109();
}
function _j106() {
_j698 = !_j698;
const panel = _j68('maskPanel');
const maskHint = _j68('maskHint');
if (!panel) return;
if (_j698) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (maskHint) {
maskHint.classList.add('hidden');
}
} else {
if (maskHint) {
_j96(maskHint, 'toggle-mask-panel');
maskHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j698) {
panel.style.display = 'none';
}
}, 300);
}
_j109();
}
function _j107() {
const _j1162 = _j68('screenTextToggle');
if (_j1162) {
screenText = _j1162.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j145();
}
_j112('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j108() {
const _j1163 = localStorage.getItem('controlPanelVisible');
if (_j1163 !== null) {
_j686 = _j1163 === 'true';
}
const _j1164 = localStorage.getItem('effectControlPanelVisible');
if (_j1164 !== null) {
_j690 = _j1164 === 'true';
}
const _j1165 = localStorage.getItem('flowEffectPanelVisible');
if (_j1165 !== null) {
_j694 = _j1165 === 'true';
}
}
function _j109() {
localStorage.setItem('controlPanelVisible', _j686);
localStorage.setItem('effectControlPanelVisible', _j690);
localStorage.setItem('flowEffectPanelVisible', _j694);
localStorage.setItem('maskPanelVisible', _j698);
}
function _j110() {
const _j1166 = localStorage.getItem('overlayPosition');
const _j1167 = localStorage.getItem('controlPanelPosition');
const _j1168 = localStorage.getItem('effectControlPanelPosition');
const _j1169 = localStorage.getItem('flowEffectPanelPosition');
if (_j1166) {
_j682 = JSON.parse(_j1166);
}
if (_j1167) {
_j685 = JSON.parse(_j1167);
}
if (_j1168) {
_j689 = JSON.parse(_j1168);
}
if (_j1169) {
_j693 = JSON.parse(_j1169);
}
const _j1170 = localStorage.getItem('maskPanelPosition');
if (_j1170) {
_j697 = JSON.parse(_j1170);
}
const _j1171 = localStorage.getItem('maskPanelVisible');
if (_j1171 !== null) {
_j698 = _j1171 === 'true';
}
}
function _j111() {
localStorage.setItem('overlayPosition', JSON.stringify(_j682));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j685));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j689));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j693));
localStorage.setItem('maskPanelPosition', JSON.stringify(_j697));
}
function _j112(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1172 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1172[type] || '⚙️';
if (Object.keys(data).length > 0) {} else {}
if (typeof screenText !== 'undefined' && screenText) {
_j113(type, message, data);
}
}
function _j113(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1172 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1172[type] || '⚙️';
let _j1173 = '';
if (Object.keys(data).length > 0) {
_j1173 = ' ' + JSON.stringify(data);
}
const _j1174 = `${icon} [${timestamp}] ${message}${_j1173}`;
_j700.push({
type: type,
text: _j1174,
timestamp: timestamp
});
if (_j700.length >= _j707) {
_j700 = [];
_j702 = 0;
}
}
function _j114(type, message, data, timestamp, icon) {
const _j1175 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j679.push(_j1175);
if (_j679.length > _j680) {
_j679.shift();
}
_j115();
}
function _j115() {
const _j1176 = _j68('messageContainer');
if (!_j1176) return;
_j1176.innerHTML = '';
_j679.forEach(_j1533 => {
const _j1177 = _j143(_j1533);
_j1176.appendChild(_j1177);
});
_j1176.scrollTop = _j1176.scrollHeight;
}
function _j116() {
const _j1178 = recordingData.events.length > 0;
const _j1179 = `${_j622}-${_j630}-${_j1178}`;
if (_j1179 === _j1185) {
return;
}
_j1185 = _j1179;
const recordBtn = _j68('recordBtn');
const stopBtn = _j68('stopBtn');
const playBtn = _j68('playBtn');
const loadBtn = _j68('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j622) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j630) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1178) {
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
let _j1180 = false;
let _j1181 = -1;
let _j1182 = 0;
const _j1183 = 100;
let _j1184 = -1;
let _j1185 = null;
let _j1186 = null;
let _j1187 = null;
let _j1188 = 'edge';
function _j117(_j507) {
const cw = _j507.naturalWidth;
const ch = _j507.naturalHeight;
const c = document.createElement('canvas');
c.width = cw; c.height = ch;
const _j1189 = c.getContext('2d');
_j1189.drawImage(_j507, 0, 0);
const src = _j1189.getImageData(0, 0, cw, ch);
const _j1190 = _j1189.createImageData(cw, ch);
const s = src.data, d = _j1190.data;
const _j232 = new Float32Array(cw * ch);
for (let i = 0; i < _j232.length; i++) {
_j232[i] = s[i*4] * 0.299 + s[i*4+1] * 0.587 + s[i*4+2] * 0.114;
}
for (let y = 1; y < ch - 1; y++) {
for (let x = 1; x < cw - 1; x++) {
const tl = _j232[(y-1)*cw+(x-1)], tc = _j232[(y-1)*cw+x], tr = _j232[(y-1)*cw+(x+1)];
const ml = _j232[y*cw+(x-1)],                              mr = _j232[y*cw+(x+1)];
const bl = _j232[(y+1)*cw+(x-1)], bc = _j232[(y+1)*cw+x], br = _j232[(y+1)*cw+(x+1)];
const gx = -tl - 2*ml - bl + tr + 2*mr + br;
const gy = -tl - 2*tc - tr + bl + 2*bc + br;
const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy));
const _j1191 = (y * cw + x) * 4;
const v = 255 - mag;
d[_j1191] = v; d[_j1191+1] = v; d[_j1191+2] = v; d[_j1191+3] = 255;
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
_j1189.putImageData(_j1190, 0, 0);
return c.toDataURL();
}
function _j118() {
const referenceImage = document.getElementById('reference-image');
if (!referenceImage || !_j1186) return;
if (_j1188 === 'edge') {
_j1188 = 'original';
referenceImage.src = _j1186;
referenceImage.style.filter = 'grayscale(1) contrast(2.0)';
} else {
_j1188 = 'edge';
referenceImage.src = _j1187;
referenceImage.style.filter = 'none';
}
}
function _j119(_j1365) {
const _j1192 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j112('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1192.onload = (e) => {
_j1186 = e.target.result;
const _j1193 = new Image();
_j1193.onload = () => {
_j1187 = _j117(_j1193);
_j1188 = 'edge';
referenceImage.src = _j1187;
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
_j1180 = true;
_j112('system', '📷 Reference image loaded (edge mode)', {
Status: 'Tracing mode ON',
FileName: _j1365.name,
FileSize: (_j1365.size / 1024).toFixed(2) + ' KB',
Size: width + 'x' + height + 'px'
});
};
_j1193.src = e.target.result;
};
_j1192.onerror = () => {
_j112('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1365.name
});
};
_j1192.readAsDataURL(_j1365);
}
function _j120() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1194 = referenceImage.src;
const _j1195 = _j1194 && _j1194 !== '' &&
(_j1194.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1195) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1180 = true;
const _j1196 = document.getElementById('ref-image-toggle-btn');
if (_j1196) _j1196.classList.add('ref-active');
_j112('system', 'Reference image shown', {
Status: 'Tracing mode ON',
Opacity: '30%'
});
} else {
_j112('system', 'No image loaded', {
Status: 'Please load an image first'
});
}
}
}
function _j121() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1180 = false;
const _j1196 = document.getElementById('ref-image-toggle-btn');
if (_j1196) _j1196.classList.remove('ref-active');
_j112('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j122() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j177('💾 Canvas Saved as PNG');
}
function _j123(_j1235) {
_j534 = _j1235;
switch (_j1235) {
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
if (typeof _j564 !== 'undefined') _j564 = baseBrushSize;
_j124();
_j136();
_j112('ui', 'Brush size changed', {
Mode: _j1235.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j124() {
const _j1197 = document.querySelectorAll('.brush-size-btn');
if (_j1197.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1197.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j534) {
btn.classList.add('active');
}
});
}
function _j125(mode) {
brushMode = parseInt(mode);
_j127();
_j136();
_j112('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j126(mode)
});
}
function _j126(mode) {
const _j1198 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1198[mode] || 'Unknown mode';
}
function _j127() {
const _j1197 = document.querySelectorAll('.brush-mode-btn');
if (_j1197.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1197.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j128(effect) {
const _j1199 = parseInt(effect);
const _j1200 = useSharpen;
_j112('ui', '🎨 Ink effect switching', {
From: _j1200,
To: _j1199,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1199;
if (typeof _j535 !== 'undefined') {
_j535 = _j1200;
}
_j131();
_j136();
const _j1201 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j112('ui', '✨ Ink effect changed', {
Effect: _j1201[_j1199] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j129(mode) {
const _j1202 = parseInt(mode);
if (_j1202 === 3) {
window.spectral = true;
} else {
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1202;
}
window.spectral = false;
}
_j130();
const _j1203 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken',
3: 'Spectral'
};
_j112('ui', '🎨 BlendMode changed', {
Mode: _j1203[_j1202] || 'Unknown'
});
}
function _j130() {
const _j1197 = document.querySelectorAll('.blendmode-btn');
if (_j1197.length === 0) {
return;
}
const _j1204 = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
_j1197.forEach(btn => {
const _j1202 = parseInt(btn.dataset.mode);
if (_j1204 && _j1202 === 3) {
btn.classList.add('active');
} else if (!_j1204 && _j1202 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j131() {
const _j1197 = document.querySelectorAll('.ink-effect-btn');
if (_j1197.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1197.forEach(btn => {
btn.classList.remove('active');
const _j1199 = parseInt(btn.dataset.effect);
const _j1205 = _j1199;
if (_j1205 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j132(color) {
whiteBrushMode = (color === 'white');
const _j1206 = {
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
brushColorMode = _j1206[color] !== undefined ? _j1206[color] : 0;
_j133();
_j136();
const _j1207 = {
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
const _j1208 = _j8(color);
if (_j1208) {
const _j1209 = document.getElementById('custom-brush-color');
const _j1210 = document.getElementById('custom-brush-color-text');
if (_j1209) _j1209.value = _j1208.hex;
if (_j1210) _j1210.value = _j1208.displayName + ' ' + _j1208.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1208.rgb[0];
customBrushColor[1] = _j1208.rgb[1];
customBrushColor[2] = _j1208.rgb[2];
}
}
}
_j112('ui', '🎨 Brush color changed', {
Color: _j1207[color] || color,
Mode: `${_j1207[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j133() {
const _j1211 = document.querySelectorAll('.brush-color-btn');
const _j1212 = document.querySelectorAll('.color-swatch');
if (_j1211.length === 0 && _j1212.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1213 = {
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
const _j1214 = (brushColorMode === 33);
const _j1215 = _j1214 ? null : (_j1213[brushColorMode] || 'black');
_j1211.forEach(btn => {
btn.classList.remove('active');
if (!_j1214 && btn.dataset.color === _j1215) {
btn.classList.add('active');
}
});
_j1212.forEach(btn => {
btn.classList.remove('active');
if (!_j1214 && btn.dataset.color === _j1215) {
btn.classList.add('active');
}
});
}
function _j134(_j1241) {
_j577 = parseInt(_j1241);
_j135();
_j136();
const _j1216 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j112('ui', '🔄 Path rotation changed', {
Mode: _j1241,
Range: _j1216[_j1241] || 'Unknown'
});
}
function _j135() {
const _j1197 = document.querySelectorAll('.path-rotation-btn');
if (_j1197.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1197.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j577) {
btn.classList.add('active');
}
});
}
function _j136() {
const _j1217 = document.getElementById('current-brush-mode');
if (_j1217) {
_j1217.textContent = brushMode;
}
const _j1218 = document.getElementById('current-brush-size');
if (_j1218) {
const _j1219 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1218.textContent = _j1219[_j534] || 'M';
}
const _j1220 = document.getElementById('current-ink-effect');
if (_j1220) {
const _j1221 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1220.textContent = _j1221[useSharpen] || 'MIX';
}
const _j1222 = document.getElementById('current-brush-color');
if (_j1222) {
const _j1223 = {
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
_j1222.textContent = _j1223[brushColorMode] || 'Black';
}
}
function _j137() {
brushMode = 1;
_j534 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j577 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j127();
_j124();
_j131();
_j133();
_j135();
_j130();
_j136();
_j112('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j138(_j1531, _j1532) {
if (!_j1531) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1224 = 300;
_j1531.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1225 = window._elementLastTriggerTime.get(_j1531) || 0;
if (now - _j1225 < _j1224) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1531, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1531);
}, _j1224);
window._elementLastTriggerTime.set(_j1531, now);
e.stopPropagation();
e.preventDefault();
_j1532(e);
}, {
passive: false
});
_j1531.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1531)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1225 = window._elementLastTriggerTime.get(_j1531) || 0;
if (now - _j1225 < _j1224) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1531, now);
e.stopPropagation();
e.preventDefault();
_j1532(e);
});
_j1531.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j139() {
const _j1226 = document.getElementById('canvas-background-color');
const _j1227 = document.getElementById('canvas-background-color-text');
if (!_j1226 || !_j1227) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1228 = `#${r}${g}${b}`.toUpperCase();
_j1226.value = _j1228;
_j1227.value = _j1228;
}
}
function _j140() {
const _j1229 = document.getElementById('canvas-width');
const _j1230 = document.getElementById('canvas-height');
if (!_j1229 || !_j1230) {
return;
}
if (typeof _j504 !== 'undefined' && typeof _j505 !== 'undefined') {
_j1229.value = _j504;
_j1230.value = _j505;
}
}
function _j141() {
const _j1231 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1232 = _j1231 === 'collector';
if (_j1232) {
const controlPanel = _j68('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1233 = document.querySelectorAll('.brush-mode-btn');
_j1233.forEach(btn => {
_j138(btn, () => {
const mode = btn.dataset.mode;
_j125(mode);
});
});
const _j1234 = document.querySelectorAll('.brush-size-btn');
_j1234.forEach(btn => {
_j138(btn, () => {
const _j1235 = btn.dataset.size;
_j123(_j1235);
});
});
const _j1236 = document.querySelectorAll('.ink-effect-btn');
_j1236.forEach(btn => {
_j138(btn, () => {
const effect = btn.dataset.effect;
_j128(effect);
});
});
const _j1237 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1237.forEach(btn => {
_j138(btn, () => {
const color = btn.dataset.color;
if (color) {
_j132(color);
_j158();
}
});
});
const _j1238 = document.getElementById('custom-brush-color');
const _j1239 = document.getElementById('custom-brush-color-text');
if (_j1238 && _j1239) {
_j1238.addEventListener('input', (e) => {
_j1239.value = e.target.value.toUpperCase();
_j164();
});
_j1238.addEventListener('change', (e) => {
_j1239.value = e.target.value.toUpperCase();
_j164();
});
_j1239.addEventListener('input', (e) => {
const _j1228 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1228)) {
_j1238.value = _j1228.toUpperCase();
}
});
_j1239.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j164();
}
});
}
const _j1240 = document.querySelectorAll('.path-rotation-btn');
_j1240.forEach(btn => {
_j138(btn, () => {
const _j1241 = btn.dataset.rotation;
_j134(_j1241);
});
});
const _j1242 = document.querySelectorAll('.blendmode-btn');
_j1242.forEach(btn => {
_j138(btn, () => {
const mode = btn.dataset.mode;
_j129(mode);
});
});
const _j1243 = document.getElementById('clear-canvas');
if (_j1243) {
const _j1244 = _j1243.textContent;
let _j1245 = false;
let _j1246 = null;
const _j1247 = () => {
_j1245 = false;
_j1243.classList.remove('armed');
_j1243.textContent = _j1244;
if (_j1246) { clearTimeout(_j1246); _j1246 = null; }
};
_j138(_j1243, () => {
if (!_j1245) {
_j1245 = true;
_j1243.classList.add('armed');
_j1243.textContent = 'Press again to clear';
_j1246 = setTimeout(_j1247, 2000);
return;
}
_j1247();
_j170();
if (typeof _j233 !== 'undefined') {
_j233 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j112('ui', '🧹 Canvas cleared', {
Status: 'All drawings removed'
});
});
}
const _j1248 = document.getElementById('test-mode-btn');
if (_j1248) {
_j138(_j1248, () => {
if (typeof _j548 !== 'undefined' && _j548) return;
if (window.testMode) {
if (typeof exitTestMode === 'function') exitTestMode();
_j1248.classList.remove('active');
_j1248.textContent = 'testMode';
_j112('ui', '🧪 Test mode OFF', { Status: 'Canvas restored' });
} else {
if (typeof enterTestMode === 'function') enterTestMode();
_j1248.classList.add('active');
_j1248.textContent = 'testMode (exit)';
_j112('ui', '🧪 Test mode ON', { Status: 'Strokes will not be recorded' });
}
});
}
const _j1226 = document.getElementById('canvas-background-color');
const _j1227 = document.getElementById('canvas-background-color-text');
const _j1229 = document.getElementById('canvas-width');
const _j1230 = document.getElementById('canvas-height');
if (_j1226 && _j1227) {
_j1226.addEventListener('input', (e) => {
_j1227.value = e.target.value.toUpperCase();
});
_j1226.addEventListener('change', (e) => {
_j1227.value = e.target.value.toUpperCase();
_j165();
});
_j1227.addEventListener('input', (e) => {
const _j1228 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1228)) {
_j1226.value = _j1228.toUpperCase();
}
});
_j1227.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j165();
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
if (_j1229 && _j1230) {
_j1229.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j165();
}
});
_j1230.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j165();
}
});
if (typeof _j140 === 'function') {
_j140();
} else {
setTimeout(() => {
if (typeof _j140 === 'function') {
_j140();
}
}, 100);
}
}
const _j1249 = document.getElementById('panel-scale-slider');
if (_j1249) {
_j1249.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1249.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j75();
_j79();
_j83();
_j87();
});
}
const _j1196 = document.getElementById('toggle-control-panel');
if (_j1196) {
_j138(_j1196, _j103);
}
const controlPanel = _j68('controlPanel');
const _j1153 = controlPanel?.querySelector('.control-panel-header');
if (_j1153) {
_j1153.addEventListener('mousedown', _j76);
_j1153.addEventListener('touchstart', (e) => {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j76(_j1250);
});
}
const effectControlPanel = _j68('effectControlPanel');
const _j1251 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1251) {
_j1251.addEventListener('mousedown', _j80);
_j1251.addEventListener('touchstart', (e) => {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j80(_j1250);
});
}
const _j1252 = document.getElementById('toggle-effect-control-panel');
if (_j1252) {
_j138(_j1252, _j104);
}
const flowEffectPanel = _j68('flowEffectPanel');
const _j1253 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1253) {
_j1253.addEventListener('mousedown', _j84);
_j1253.addEventListener('touchstart', (e) => {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j84(_j1250);
});
}
const _j1254 = document.getElementById('toggle-flow-effect-panel');
if (_j1254) {
_j138(_j1254, _j105);
}
const maskPanel = _j68('maskPanel');
const _j1255 = maskPanel?.querySelector('.mask-panel-header');
if (_j1255) {
_j1255.addEventListener('mousedown', _j88);
_j1255.addEventListener('touchstart', (e) => {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j88(_j1250);
});
}
const _j1256 = document.getElementById('toggle-mask-panel');
if (_j1256) {
_j138(_j1256, function() {
_j106();
});
}
const _j1257 = document.getElementById('mask-mode-toggle');
if (_j1257) {
_j1257.addEventListener('change', function() {
if (!this.checked && _j556 === 'polygon' && _j558.length >= 3) {
drawMaskPolygon(_j558);
_j559 = { action: "polygon", points: _j558.map(p => ({ x: p.x, y: p.y })) };
}
const _j1258 = !this.checked;
_j554 = this.checked;
_j92();
_j93();
if (_j1258 && typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
});
}
const _j1259 = document.getElementById('mask-rect-btn');
if (_j1259) {
_j138(_j1259, function() {
_j556 = 'rect';
_j554 = true;
if (_j1257) _j1257.checked = true;
_j92();
_j93();
});
}
const _j1260 = document.getElementById('mask-poly-btn');
if (_j1260) {
_j138(_j1260, function() {
if (_j554 && _j556 === 'polygon') {
if (_j558.length >= 3) {
drawMaskPolygon(_j558);
_j559 = { action: "polygon", points: _j558.map(p => ({ x: p.x, y: p.y })) };
}
_j554 = false;
if (_j1257) _j1257.checked = false;
if (typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
} else {
_j556 = 'polygon';
_j554 = true;
_j558 = [];
if (_j1257) _j1257.checked = true;
}
_j92();
_j93();
});
}
const _j1261 = document.getElementById('mask-clear-btn');
if (_j1261) {
_j138(_j1261, function() {
clearMask();
_j559 = null;
_j554 = false;
_j556 = null;
if (_j1257) _j1257.checked = false;
_j92();
_j93();
});
}
if (maskPanel && !_j698) {
maskPanel.style.display = 'none';
}
_j91();
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j107);
}
_j127();
_j124();
_j131();
_j133();
_j135();
_j130();
_j136();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j142() {
const now = millis();
const _j1262 = (now - _j1182) >= _j1183;
const recordingStatus = _j68('recordingStatus');
if (recordingStatus) {
if (_j622) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j68('playbackStatus');
const countdownStatus = _j68('countdownStatus');
if (_j630) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1262) {
const _j1263 = loopWaitDuration - (millis() - _j639);
const _j1264 = Math.ceil(_j1263 / 1000);
const _j829 = _j1263 / loopWaitDuration;
if (window.DEBUG_MODE && _j1264 !== _j1181) {
console.log(`Countdown: ${_j1264}s remaining (${Math.floor(_j829 * 100)}%)`);
_j1181 = _j1264;
}
const countdownText = _j68('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1264}s`;
}
const countdownCircle = _j68('countdownCircle');
if (countdownCircle) {
const _j1265 = 62.83;
const _j1266 = _j1265 * (1 - _j829);
countdownCircle.style.strokeDashoffset = _j1266;
}
}
} else {
_j1181 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1262) {
const _j429 = recordingData.events.length > 0 ?
_j632 / recordingData.events.length : 0;
const _j1267 = Math.round(_j429 * 100);
if (_j1267 !== _j1184) {
const progressFill = _j68('progressFill');
const progressText = _j68('progressText');
if (progressFill) progressFill.style.width = `${_j1267}%`;
if (progressText) progressText.textContent = `${_j1267}%`;
_j1184 = _j1267;
}
}
}
} else {
_j1181 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1262) {
_j1182 = now;
}
if (typeof _j116 === 'function') {
_j116();
}
}
function _j143(_j1533) {
const _j1268 = document.createElement('div');
_j1268.className = 'message-item new-message';
const _j1269 = document.createElement('span');
_j1269.className = 'message-icon';
_j1269.textContent = _j1533.icon;
const _j1270 = document.createElement('div');
_j1270.className = 'message-content';
const _j1271 = document.createElement('div');
_j1271.className = 'message-header';
const _j1272 = document.createElement('span');
_j1272.className = 'message-timestamp';
_j1272.textContent = _j1533.timestamp;
const _j1273 = document.createElement('span');
_j1273.className = `message-type ${_j1533.type}`;
_j1273.textContent = _j1533.type.toUpperCase();
_j1271.appendChild(_j1272);
_j1271.appendChild(_j1273);
const _j1274 = document.createElement('p');
_j1274.className = 'message-text';
_j1274.textContent = _j1533.message;
_j1270.appendChild(_j1271);
_j1270.appendChild(_j1274);
if (Object.keys(_j1533.data).length > 0) {
const _j1275 = document.createElement('div');
_j1275.className = 'message-data';
_j1275.textContent = JSON.stringify(_j1533.data, null, 2);
_j1270.appendChild(_j1275);
}
_j1268.appendChild(_j1269);
_j1268.appendChild(_j1270);
setTimeout(() => {
_j1268.classList.remove('new-message');
}, 300);
return _j1268;
}
function _j144() {
_j678 = !_j678;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j678) {
overlay.style.display = 'block';
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j75();
} else {
_j96(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
setTimeout(() => {
if (!_j678) {
overlay.style.display = 'none';
}
}, 300);
}
}
localStorage.setItem('overlayVisible', _j678.toString());
}
function _j145() {
_j679 = [];
_j115();
}
function _j146() {
const _j1276 = document.getElementById('record-status-text');
if (_j1276) {
if (_j629 == 1) {
_j1276.textContent = 'ON';
_j1276.classList.add('active');
} else {
_j1276.textContent = 'OFF';
_j1276.classList.remove('active');
}
}
}
function _j147() {
const _j1277 = {};
const _j1278 = window.location.search;
if (!_j1278 || _j1278.length <= 1) {
return _j1277;
}
const _j1279 = _j1278.substring(1);
const _j1015 = _j1279.split('_');
const _j1280 = {
'wd': true,
'gr': true
};
for (const _j1281 of _j1015) {
if (!_j1281) continue;
const _j1282 = _j1281.indexOf(':');
if (_j1282 === -1) continue;
const key = _j1281.substring(0, _j1282);
const value = _j1281.substring(_j1282 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1283 = parseInt(value);
if (!isNaN(_j1283) && _j1283 > 0) {
_j1277[key] = _j1283;
}
continue;
}
if (_j1280[key]) {
const _j1284 = parseFloat(value);
if (!isNaN(_j1284) && _j1284 > 0) {
_j1277[key] = true;
_j1277[key + '_val'] = _j1284;
} else {
_j1277[key] = false;
}
} else {
_j1277[key] = value === '1';
}
}
}
return _j1277;
}
function _j148(_j1534) {
const _j1285 = {
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
for (const [_j1281, toggleId] of Object.entries(_j1285)) {
if (_j1534.hasOwnProperty(_j1281)) {
if (_j1281 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1286 = _j1534[_j1281];
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.checked = _j1286;
toggle.dispatchEvent(new Event('change'));
if (_j1281 === 'rs') {
const _j1287 = document.getElementById('rs-sliders-section');
if (_j1287) {
_j1287.style.display = _j1286 ? 'flex' : 'none';
}
} else if (_j1281 === 'distort') {
const _j1288 = document.getElementById('distort-sliders-section');
if (_j1288) {
_j1288.style.display = _j1286 ? 'flex' : 'none';
}
} else if (_j1281 === 'cl') {
const _j1289 = document.getElementById('cellular-sliders-section');
if (_j1289) {
_j1289.style.display = _j1286 ? 'flex' : 'none';
}
} else if (_j1281 === 'wd') {
const _j1290 = document.getElementById('white-dot-sliders-section');
if (_j1290) {
_j1290.style.display = _j1286 ? 'flex' : 'none';
}
if (_j1286 && _j1534['wd_val'] !== undefined) {
const _j1291 = document.getElementById('white-dot-density');
const _j1292 = document.getElementById('white-dot-density-value');
if (_j1291) _j1291.value = _j1534['wd_val'];
if (_j1292) _j1292.textContent = _j1534['wd_val'].toFixed(2);
}
} else if (_j1281 === 'gr') {
const _j1293 = document.getElementById('grain-sliders-section');
if (_j1293) {
_j1293.style.display = _j1286 ? 'flex' : 'none';
}
if (_j1286 && _j1534['gr_val'] !== undefined) {
const _j1294 = document.getElementById('grain-amount');
const _j1295 = document.getElementById('grain-amount-value');
if (_j1294) _j1294.value = _j1534['gr_val'];
if (_j1295) _j1295.textContent = _j1534['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1281}`);
}
}
}
}
function _j149() {
_j67();
const _j1296 = _j147();
const _j1297 = {
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
if (_j1296['w']) window._urlCanvasWidth = _j1296['w'];
if (_j1296['h']) window._urlCanvasHeight = _j1296['h'];
if (Object.keys(_j1296).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1281, _j1286] of Object.entries(_j1296)) {
const globalVarName = _j1297[_j1281];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1281 === 'loop') {
window[globalVarName] = _j1286 ? 1 : 0;
} else {
window[globalVarName] = _j1286;
}
}
}
const _j1298 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1299 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1281, globalVarName] of Object.entries(_j1298)) {
const valKey = _j1281 + '_val';
if (_j1296[valKey] !== undefined) {
window[globalVarName] = _j1296[valKey];
window[_j1299[_j1281]] = _j1296[valKey];
}
}
window._initialConsoleFromURL = _j1296.hasOwnProperty('console') ? _j1296.console : false;
}
const _j1231 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1232 = _j1231 === 'collector';
const _j1196 = document.getElementById('toggle-overlay');
const _j1300 = document.getElementById('toggle-hint-btn');
const _j1301 = document.getElementById('clear-bite-points');
const _j1302 = document.getElementById('scan-global');
const _j1303 = document.getElementById('scan-current');
const _j1304 = document.getElementById('scan-random');
const _j1305 = document.getElementById('scan-current-random');
const _j1306 = document.getElementById('brush-hint-btn');
const _j1307 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1307.length > 0) {
let _j1308 = 2;
if (typeof _j506 !== 'undefined') {
_j1308 = _j506;
}
const _j1309 = document.querySelector(`input[name="pixel-density"][value="${_j1308}"]`);
if (_j1309) {
_j1309.checked = true;
}
_j1307.forEach(_j1540 => {
_j1540.addEventListener('change', (e) => {
if (e.target.checked) {
const _j722 = parseInt(e.target.value);
if (typeof _j506 !== 'undefined') {
_j506 = _j722;
try {
sessionStorage.setItem('pendingPixelDensity', _j722.toString());
if (typeof _j622 !== 'undefined' && _j622 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j112('system', '🎨 Pixel density changed - reloading page', {
Value: _j722,
Status: 'Page will reload to recreate canvas with new pixel density',
Note: 'Current drawing will be cleared'
});
setTimeout(() => {
window.location.reload();
}, 300);
} catch (error) {
_j112('system', '❌ Failed to update pixel density', {
Error: error.message,
Status: 'Error'
});
}
} else {
_j112('system', '⚠️ Pixel variable not found', {
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
if (_j1232) {
if (_j1306) _j1306.style.display = 'none';
}
const _j1310 = document.getElementById('record-toggle');
const _j1276 = document.getElementById('record-status-text');
const _j1311 = document.getElementById('realtime-drawing-toggle');
const _j1312 = document.getElementById('realtime-drawing-status-text');
const _j1313 = document.getElementById('grid-overlay-toggle');
const _j1314 = document.getElementById('paper-texture-toggle');
const _j1315 = document.getElementById('camera-moving-toggle');
const _j1316 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1153 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j678) {
overlay.style.display = 'block';
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j75();
} else {
overlay.classList.add('hidden');
overlay.style.display = 'none';
hint.classList.remove('hidden');
}
}
const controlPanel = _j68('controlPanel');
if (controlPanel && brushHint) {
if (_j686) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1196) {
_j138(_j1196, _j144);
}
if (_j1300) {
_j138(_j1300, () => {
if (!_j95()) _j144();
});
}
if (_j1306) {
_j138(_j1306, () => {
if (!_j95()) _j103();
});
}
const _j1317 = document.getElementById('effect-hint-btn');
if (_j1317) {
_j138(_j1317, () => {
if (!_j95()) _j104();
});
}
const _j1318 = document.getElementById('flow-hint-btn');
if (_j1318) {
_j138(_j1318, () => {
if (!_j95()) _j105();
});
}
const _j1319 = document.getElementById('mask-hint-btn');
if (_j1319) {
_j138(_j1319, () => {
if (!_j95()) _j106();
});
}
const _j1320 = document.getElementById('agent-toggle-btn');
if (_j1320) {
_j138(_j1320, function() {
_j568 = !_j568;
if (_j568) {
_j566 = true;
_j569 = [];
_j1320.classList.add('agent-active');
_j1320.textContent = 'Agent ●';
console.log('[Agent] ON — recording paths with timestamps');
} else {
_j566 = false;
_j1320.classList.remove('agent-active');
_j1320.textContent = 'Agent';
console.log('[Agent] OFF — ' + _j569.length + ' points recorded');
}
});
}
if (_j1302) {
_j138(_j1302, () => {
if (typeof _j18 === 'function') {
const shapeType = _j159();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j807 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j807 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j807);
noiseSeed(_j807);
}
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j185('ec', {
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
function _j150(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j159();
let scanBounds = null;
let _j316 = null;
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
if (strokeIndex !== null) {
_j316 = Math.max(0, Math.min(strokeIndex, allBrushStrokes.length - 1));
} else {
const _j1321 = document.getElementById('stroke-select-slider');
if (_j1321) {
_j316 = parseInt(_j1321.value) || 0;
_j316 = Math.max(0, Math.min(_j316, allBrushStrokes.length - 1));
}
}
if (_j316 !== null) {
const selectedStroke = allBrushStrokes[_j316];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j112('system', `🎯 EACH: 使用笔画 #${_j316} 的网格区域`, {
Index: _j316,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: allBrushStrokes.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j112('system', `🎯 EACH: 使用笔画 #${_j316} 的边界框（无网格数据）`, {
Index: _j316,
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
const _j807 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j807 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j807);
noiseSeed(_j807);
}
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j185('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j316,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1303) {
_j138(_j1303, () => {
_j150();
});
}
if (_j1305) {
_j138(_j1305, () => {
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
const _j1322 = Math.floor(Math.random() * allBrushStrokes.length);
const _j1321 = document.getElementById('stroke-select-slider');
const _j1323 = document.getElementById('stroke-index-display');
const _j1324 = document.getElementById('stroke-select-value');
if (_j1321) {
_j1321.value = _j1322;
_j1321.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1323) {
_j1323.textContent = _j1322;
}
if (_j1324) {
_j1324.textContent = _j1322;
}
_j112('system', `🎲 EACHR: 随机选择笔画 #${_j1322}`, {
RandomIndex: _j1322,
TotalStrokes: allBrushStrokes.length
});
_j150(_j1322);
} else {
_j112('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1304) {
_j138(_j1304, () => {
if (typeof _j19 === 'function') {
const shapeType = _j159();
_j19(10, shapeType);
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
_j185('ec', {
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
if (_j1301) {
_j138(_j1301, () => {
if (typeof _j233 !== 'undefined' && _j233.length > 0) {
let pointCount = typeof _j233 !== 'undefined' ? _j233.length : 0;
if (typeof _j233 !== 'undefined') {
_j233 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j112('system', '🧹 清除虫咬点', {
'虫咬点': pointCount
});
} else {
_j112('system', '⚠️ 没有虫咬点可清除', {});
}
});
}
if (_j1310) {
_j1310.checked = (_j629 == 1);
_j146();
_j1310.addEventListener('change', (e) => {
_j629 = e.target.checked ? 1 : 0;
_j146();
_j112('system', `Record mode ${_j629 ? 'enabled' : 'disabled'}`, {
Status: _j629 ? 'ON' : 'OFF'
});
});
}
if (_j1311) {
_j1311.disabled = true;
if (_j1312) {
_j1312.textContent = 'DISABLED';
}
_j1311.addEventListener('change', (e) => {
e.target.checked = false;
_j112('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1313) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1313.checked = !!showGridOverlay;
}
} catch (e) {}
_j1313.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1544) {}
_j112('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1314) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1314.checked = !!showPaperTexture;
} else {
_j1314.checked = true;
}
} catch (e) {
_j1314.checked = true;
}
_j1314.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1544) {}
_j112('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1325 = document.getElementById('fit-canvas-toggle');
if (_j1325) {
_j1325.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
if (typeof window.toggleFitMode === 'function') {
window.toggleFitMode(enabled);
_j112('system', '🎨 Fit canvas', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
_j112('system', '⚠️ Fit mode function not available', {
Status: 'Error'
});
}
});
}
if (_j1315) {
try {
if (typeof doMoving !== 'undefined') {
_j1315.checked = !!doMoving;
} else {
_j1315.checked = false;
}
} catch (e) {
_j1315.checked = false;
}
_j1315.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1544) {}
_j112('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1316) {
try {
if (typeof loopToggle !== 'undefined') {
_j1316.checked = (loopToggle === 1);
} else {
_j1316.checked = false;
}
} catch (e) {
_j1316.checked = false;
}
_j1316.addEventListener('change', (e) => {
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
_j112('system', '🔁 Loop playback', {
Status: enabled ? 'Enabled ✅ (Auto repeat after 5s)' : 'Disabled ❌ (Single playback)'
});
} else {
console.warn('⚠️ loopToggle variable not found');
}
} catch (_j1544) {
console.error('Error setting loopToggle:', _j1544);
}
});
}
const _j1326 = document.getElementById('playback-offset-x');
const _j1327 = document.getElementById('playback-offset-y');
if (_j1326) {
if (typeof _j642 !== 'undefined') {
_j1326.value = _j642;
}
_j1326.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j642 !== 'undefined') {
_j642 = value;
_j112('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1327) {
if (typeof _j643 !== 'undefined') {
_j1327.value = _j643;
}
_j1327.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j643 !== 'undefined') {
_j643 = value;
_j112('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1328 = document.getElementById('distort-shader-toggle');
const _j1288 = document.getElementById('distort-sliders-section');
if (_j1328) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1328.checked = !!distortShaderEnabled;
if (_j1288) {
_j1288.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1328.checked = false;
if (_j1288) {
_j1288.style.display = 'none';
}
}
} catch (e) {
_j1328.checked = false;
if (_j1288) {
_j1288.style.display = 'none';
}
}
_j1328.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1288) {
_j1288.style.display = enabled ? 'flex' : 'none';
}
_j112('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1544) {
console.error('Error setting distortShaderEnabled:', _j1544);
}
});
}
const _j1329 = document.getElementById('distort-displacement-b');
const _j1330 = document.getElementById('distort-displacement-b-value');
if (_j1329 && _j1330) {
const _j1331 = parseFloat(_j1329.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1331;
}
_j1330.textContent = Math.round(_j1331);
_j1329.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1330.textContent = Math.round(value);
});
}
const _j1332 = document.getElementById('distort-displacement-c');
const _j1333 = document.getElementById('distort-displacement-c-value');
if (_j1332 && _j1333) {
const _j1331 = parseFloat(_j1332.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1331;
}
_j1333.textContent = Math.round(_j1331);
_j1332.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1333.textContent = Math.round(value);
});
}
const _j1334 = document.getElementById('distort-fbm-preview-toggle');
if (_j1334) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1334.checked = (distortShowFbmMask > 0.5);
} else {
_j1334.checked = false;
}
} catch (e) {
_j1334.checked = false;
}
_j1334.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = enabled ? 1.0 : 0.0;
_j112('system', '🎨 fBM Mask Preview', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShowFbmMask variable not found');
}
} catch (_j1544) {
console.error('Error setting distortShowFbmMask:', _j1544);
}
});
}
const _j1335 = document.getElementById('rs-toggle');
const _j1287 = document.getElementById('rs-sliders-section');
if (_j1335) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1335.checked = !!rsEnabled;
if (_j1287) {
_j1287.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1335.checked = false;
if (_j1287) {
_j1287.style.display = 'none';
}
}
} catch (e) {
_j1335.checked = false;
if (_j1287) {
_j1287.style.display = 'none';
}
}
_j1335.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1287) {
_j1287.style.display = enabled ? 'flex' : 'none';
}
_j112('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1544) {
console.error('Error setting rsEnabled:', _j1544);
}
});
}
const _j1336 = document.getElementById('rs-frequency');
const _j1337 = document.getElementById('rs-frequency-value');
if (_j1336 && _j1337) {
const _j1331 = parseFloat(_j1336.value);
if (typeof _j582 !== 'undefined') {
_j582 = _j1331;
}
_j1337.textContent = Math.round(_j1331);
_j1336.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j582 !== 'undefined') {
_j582 = value;
}
_j1337.textContent = Math.round(value);
});
}
const _j1338 = document.getElementById('rs-wave-speed');
const _j1339 = document.getElementById('rs-wave-speed-value');
if (_j1338 && _j1339) {
const _j1331 = parseFloat(_j1338.value);
if (typeof _j583 !== 'undefined') {
_j583 = _j1331;
}
_j1339.textContent = _j1331.toFixed(1);
_j1338.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j583 !== 'undefined') {
_j583 = value;
}
_j1339.textContent = value.toFixed(1);
});
}
const _j1340 = document.getElementById('rs-strength');
const _j1341 = document.getElementById('rs-strength-value');
if (_j1340 && _j1341) {
const _j1331 = parseFloat(_j1340.value);
if (typeof _j584 !== 'undefined') {
_j584 = _j1331;
}
_j1341.textContent = _j1331.toFixed(1);
_j1340.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j584 !== 'undefined') {
_j584 = value;
}
_j1341.textContent = value.toFixed(1);
});
}
const _j1342 = document.getElementById('rs-gradient-mix');
const _j1343 = document.getElementById('rs-gradient-mix-value');
if (_j1342 && _j1343) {
const _j1331 = parseFloat(_j1342.value);
if (typeof _j585 !== 'undefined') {
_j585 = _j1331;
}
_j1343.textContent = _j1331.toFixed(1);
_j1342.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j585 !== 'undefined') {
_j585 = value;
}
_j1343.textContent = value.toFixed(1);
});
}
const _j1344 = document.getElementById('rs-scale');
const _j1345 = document.getElementById('rs-scale-value');
if (_j1344 && _j1345) {
const _j1331 = parseFloat(_j1344.value);
if (typeof _j586 !== 'undefined') {
_j586 = _j1331;
}
_j1345.textContent = Math.round(_j1331);
_j1344.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j586 !== 'undefined') {
_j586 = value;
}
_j1345.textContent = Math.round(value);
});
}
const _j1346 = document.getElementById('cellular-toggle');
const _j1289 = document.getElementById('cellular-sliders-section');
if (_j1346) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1346.checked = !!cellularEnabled;
if (_j1289) {
_j1289.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1346.checked = false;
if (_j1289) _j1289.style.display = 'none';
}
} catch (e) {
_j1346.checked = false;
if (_j1289) _j1289.style.display = 'none';
}
_j1346.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1289) {
_j1289.style.display = enabled ? 'flex' : 'none';
}
_j112('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1544) {
console.error('Error setting cellularEnabled:', _j1544);
}
});
}
const _j1347 = document.getElementById('cellular-scale');
const _j1348 = document.getElementById('cellular-scale-value');
if (_j1347 && _j1348) {
const _j1331 = parseFloat(_j1347.value);
if (typeof _j587 !== 'undefined') _j587 = _j1331;
_j1348.textContent = _j1331.toFixed(1);
_j1347.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j587 !== 'undefined') _j587 = value;
_j1348.textContent = value.toFixed(1);
});
}
const _j1349 = document.getElementById('cellular-seed');
const _j1350 = document.getElementById('cellular-seed-value');
if (_j1349 && _j1350) {
const _j1331 = parseFloat(_j1349.value);
if (typeof _j588 !== 'undefined') _j588 = _j1331;
_j1350.textContent = _j1331.toFixed(1);
_j1349.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j588 !== 'undefined') _j588 = value;
_j1350.textContent = value.toFixed(1);
});
}
const _j1351 = document.getElementById('white-dot-toggle');
const _j1352 = document.getElementById('white-dot-sliders-section');
if (_j1351) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1351.checked = !!whiteDotEnabled;
if (_j1352) _j1352.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1351.checked = false;
if (_j1352) _j1352.style.display = 'none';
}
} catch (e) {
_j1351.checked = false;
if (_j1352) _j1352.style.display = 'none';
}
_j1351.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1352) _j1352.style.display = enabled ? 'flex' : 'none';
_j112('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1544) {
console.error('Error setting whiteDotEnabled:', _j1544);
}
});
}
const _j1353 = document.getElementById('white-dot-density');
const _j1354 = document.getElementById('white-dot-density-value');
if (_j1353 && _j1354) {
if (window._urlParamWdVal !== undefined) {
const _j1355 = window._urlParamWdVal;
_j589 = _j1355 * 0.1;
_j1353.value = _j1355;
_j1354.textContent = _j1355.toFixed(2);
} else {
const _j1355 = parseFloat(_j1353.value);
if (typeof _j589 !== 'undefined') _j589 = _j1355 * 0.1;
_j1354.textContent = _j1355.toFixed(2);
}
_j1353.addEventListener('input', (e) => {
const _j1355 = parseFloat(e.target.value);
if (typeof _j589 !== 'undefined') _j589 = _j1355 * 0.1;
_j1354.textContent = _j1355.toFixed(2);
});
}
const _j1356 = document.getElementById('grain-toggle');
const _j1357 = document.getElementById('grain-sliders-section');
if (_j1356) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1356.checked = !!grainEnabled;
if (_j1357) _j1357.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1356.checked = false;
if (_j1357) _j1357.style.display = 'none';
}
} catch (e) {
_j1356.checked = false;
if (_j1357) _j1357.style.display = 'none';
}
_j1356.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1357) _j1357.style.display = enabled ? 'flex' : 'none';
_j112('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1544) {
console.error('Error setting grainEnabled:', _j1544);
}
});
}
const _j1358 = document.getElementById('grain-amount');
const _j1359 = document.getElementById('grain-amount-value');
if (_j1358 && _j1359) {
if (window._urlParamGrVal !== undefined) {
const _j1355 = window._urlParamGrVal;
_j590 = _j1355 * 0.1;
_j1358.value = _j1355;
_j1359.textContent = _j1355.toFixed(2);
} else {
const _j1355 = parseFloat(_j1358.value);
if (typeof _j590 !== 'undefined') _j590 = _j1355 * 0.1;
_j1359.textContent = _j1355.toFixed(2);
}
_j1358.addEventListener('input', (e) => {
const _j1355 = parseFloat(e.target.value);
if (typeof _j590 !== 'undefined') _j590 = _j1355 * 0.1;
_j1359.textContent = _j1355.toFixed(2);
});
}
const _j1360 = document.getElementById('future-path-preview-toggle');
if (_j1360) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1360.checked = !!showFuturePathPreview;
} else {
_j1360.checked = true;
}
} catch (e) {
_j1360.checked = true;
}
_j1360.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j112('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1544) {
console.error('Error setting showFuturePathPreview:', _j1544);
}
});
}
if (recordBtn) {
_j138(recordBtn, () => {
if (!_j622 && !_j630) {
_j186();
_j116();
}
});
}
if (stopBtn) {
_j138(stopBtn, () => {
if (_j622) {
_j187();
} else if (_j630) {
_j190();
}
_j116();
});
}
if (playBtn) {
_j138(playBtn, () => {
if (!_j622 && !_j630 && recordingData.events.length > 0) {
startPlayback();
_j116();
}
});
}
if (loadBtn) {
_j138(loadBtn, () => {
if (!_j622 && !_j630) {
_j189();
}
});
}
const _j1361 = document.getElementById('load-image');
const _j1362 = document.getElementById('image-file-input');
const _j1363 = _j1232 || _j66();
const _j1364 = _j1361 ? _j1361.closest('.panel-section') : null;
if (_j1363) {
if (_j1364) _j1364.style.display = 'none';
if (_j1361) _j1361.style.display = 'none';
} else if (_j1361 && _j1362) {
_j138(_j1361, () => {
_j1362.click();
});
_j1362.addEventListener('change', (e) => {
const _j1365 = e.target.files[0];
if (_j1365 && _j1365.type.startsWith('image/')) {
_j119(_j1365);
}
});
}
const _j1366 = document.getElementById('show-reference-image');
if (_j1366 && !_j1363) {
_j138(_j1366, () => {
_j120();
});
}
const _j1367 = document.getElementById('hide-reference-image');
if (_j1367 && !_j1363) {
_j138(_j1367, () => {
_j121();
});
}
if (_j1153) {
_j1153.addEventListener('mousedown', _j69);
_j1153.addEventListener('touchstart', (e) => {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j69(_j1250);
});
}
_j74();
const _j1368 = _j68('flowEffectPanel');
if (_j1368 && !_j1368.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1368.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1543 => {
const _j1369 = _j1543.getAttribute('data-panel');
const _j1370 = {
overlay: _j69,
control: _j76,
effect: _j80,
flow: _j84
};
const fn = _j1370[_j1369];
if (!fn) return;
_j1543.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1543.addEventListener('touchstart', (e) => {
const _j1161 = e.touches[0];
fn({ clientX: _j1161.clientX, clientY: _j1161.clientY, target: _j1543, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j73(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j70);
document.addEventListener('mouseup', _j71);
document.addEventListener('touchmove', (e) => {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY
};
_j70(_j1250);
});
document.addEventListener('touchend', _j71);
document.addEventListener('mousemove', _j77);
document.addEventListener('mouseup', _j78);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY
};
_j77(_j1250);
}
});
document.addEventListener('touchend', _j78);
document.addEventListener('mousemove', _j81);
document.addEventListener('mouseup', _j82);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY
};
_j81(_j1250);
}
});
document.addEventListener('touchend', _j82);
document.addEventListener('mousemove', _j85);
document.addEventListener('mouseup', _j86);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY
};
_j85(_j1250);
}
});
document.addEventListener('touchend', _j86);
document.addEventListener('mousemove', _j89);
document.addEventListener('mouseup', _j90);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1161 = e.touches[0];
const _j1250 = {
clientX: _j1161.clientX,
clientY: _j1161.clientY
};
_j89(_j1250);
}
});
document.addEventListener('touchend', _j90);
if (hint && !_j678) {
hint.classList.remove('hidden');
}
_j116();
_j157();
_j161();
_j166();
_j162();
_j83();
_j87();
const effectControlPanel = _j68('effectControlPanel');
const effectHint = _j68('effectHint');
const _j1252 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j690) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1252) {
_j1252.textContent = _j690 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j68('flowEffectPanel');
const flowHint = _j68('flowHint');
const _j1254 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j694) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1254) {
_j1254.textContent = _j694 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1296).length > 0) {
setTimeout(() => {
_j148(_j1296);
_j112('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1296).length
});
}, 200);
}
setTimeout(() => {
_j102();
_j101();
}, 100);
_j151();
}
let _j1371 = false;
let _j1372 = null;
function _j151() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j138(btn, _j155);
_j152();
if (!_j66()) {
_j153();
}
}
function _j152() {
if (document.getElementById('collect-panels-btn')) return;
const btn = document.createElement('button');
btn.id = 'collect-panels-btn';
btn.innerHTML = '◎';
btn.title = 'Collect all panels here';
document.body.appendChild(btn);
_j138(btn, _j154);
}
function _j153() {
if (document.getElementById('ref-image-toggle-btn')) return;
const btn = document.createElement('button');
btn.id = 'ref-image-toggle-btn';
btn.innerHTML = '⬒';
btn.title = 'Toggle reference image (tap: show/hide, long press: switch edge/photo)';
document.body.appendChild(btn);
let _j1373 = null;
let _j1374 = false;
const _j1375 = () => {
_j1374 = false;
_j1373 = setTimeout(() => {
_j1374 = true;
_j118();
}, 500);
};
const _j1376 = () => {
clearTimeout(_j1373);
if (!_j1374) {
if (_j1180) {
_j121();
} else {
_j120();
}
}
};
btn.addEventListener('pointerdown', _j1375);
btn.addEventListener('pointerup', _j1376);
btn.addEventListener('pointercancel', () => clearTimeout(_j1373));
}
const _j1377 = [
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
let _j1378 = 0;
function _j154() {
const d = _j1377[_j1378];
_j1378 = (_j1378 + 1) % _j1377.length;
if (typeof _j682 !== 'undefined') { _j682.x = d.overlay.x; _j682.y = d.overlay.y; }
if (typeof _j685 !== 'undefined') { _j685.x = d.control.x; _j685.y = d.control.y; }
if (typeof _j689 !== 'undefined') { _j689.x = d.effectControl.x; _j689.y = d.effectControl.y; }
if (typeof _j693 !== 'undefined') { _j693.x = d.flowEffect.x; _j693.y = d.flowEffect.y; }
if (typeof _j697 !== 'undefined') { _j697.x = d.mask.x; _j697.y = d.mask.y; }
if (typeof _j75 === 'function') _j75();
if (typeof _j79 === 'function') _j79();
if (typeof _j83 === 'function') _j83();
if (typeof _j87 === 'function') _j87();
if (typeof _j91 === 'function') _j91();
if (typeof _j111 === 'function') _j111();
}
function _j155() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1379 = document.getElementById('effect-control-panel');
const _j1368 = document.getElementById('flow-effect-panel');
const maskPanel = document.getElementById('mask-panel');
const _j1380 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint, #mask-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1371) {
_j1372 = {
overlay: _j678,
control: _j686,
effect: _j690,
flow: _j694,
mask: _j698
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1379) _j1379.style.display = 'none';
if (_j1368) _j1368.style.display = 'none';
if (maskPanel) maskPanel.style.display = 'none';
_j1380.forEach(h => h.style.display = 'none');
_j678 = false;
_j686 = false;
_j690 = false;
_j694 = false;
_j698 = false;
_j1371 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1372 || { overlay: true, control: true, effect: true, flow: true, mask: true };
_j678 = s.overlay;
_j686 = s.control;
_j690 = s.effect;
_j694 = s.flow;
_j698 = s.mask !== undefined ? s.mask : true;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1379) _j1379.style.display = s.effect ? 'block' : 'none';
if (_j1368) _j1368.style.display = s.flow ? 'block' : 'none';
if (maskPanel) maskPanel.style.display = _j698 ? 'block' : 'none';
_j1380.forEach(h => h.style.display = '');
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
_j1371 = false;
_j1372 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j156();
}
}
function _j156() {
const _j1381 = [
{ panel: _j68('messageOverlay'), pos: _j682, update: _j75, defaultPos: { x: 50, y: 50 } },
{ panel: _j68('controlPanel'), pos: _j685, update: _j79, defaultPos: { x: 85, y: 50 } },
{ panel: _j68('effectControlPanel'), pos: _j689, update: _j83, defaultPos: { x: 15, y: 50 } },
{ panel: _j68('flowEffectPanel'), pos: _j693, update: _j87, defaultPos: { x: 50, y: 85 } }
];
_j1381.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1153 = panel.querySelector('.control-btn');
if (!_j1153) return;
const rect = _j1153.getBoundingClientRect();
const vw = window.innerWidth;
const vh = window.innerHeight;
if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) {
pos.x = defaultPos.x;
pos.y = defaultPos.y;
update();
}
});
_j111();
}
function activateZenMode() {
if (_j1371) return;
_j155();
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
let _j1382 = false;
const _j1383 = new MutationObserver(() => {
if (_j1382) return;
if (go()) {
_j1382 = true;
_j1383.disconnect();
}
});
_j1383.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1382) _j1383.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j157() {
const _j1384 = document.getElementById('metallic-strength');
const _j1385 = document.getElementById('metallic-strength-value');
if (_j1384 && _j1385) {
const _j1331 = parseFloat(_j1384.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1331 / 100;
}
_j1385.textContent = _j1331;
_j1384.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1385.textContent = value;
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
_j185('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1386 = document.getElementById('metallic-flow');
const _j1387 = document.getElementById('metallic-flow-value');
const _j1388 = document.getElementById('flow-auto-random');
let _j1389 = null;
if (_j1386 && _j1387) {
const _j1331 = parseFloat(_j1386.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1331 / 100;
}
_j1387.textContent = _j1331;
_j1386.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1387.textContent = value;
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
_j185('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1388 && _j1386 && _j1387) {
_j1388.addEventListener('click', () => {
const isActive = _j1388.getAttribute('data-active') === 'true';
if (isActive) {
_j1388.setAttribute('data-active', 'false');
_j1388.classList.remove('active');
if (_j1389) {
clearInterval(_j1389);
_j1389 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1388.setAttribute('data-active', 'true');
_j1388.classList.add('active');
_j1389 = setInterval(() => {
const _j315 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1386.value = _j315;
_j1387.textContent = _j315;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j315 / 50;
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
Object.keys(tintButtons).forEach(_j1449 => {
const _j1390 = document.getElementById(_j1449);
if (_j1390) {
_j1390.classList.remove('active');
}
});
btn.classList.add('active');
const _j1391 = btn.textContent.trim();
_j112('system', '🎨 Metal tint changed', {
Tint: _j1391,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
const tintType = id.replace('metal-', '');
_j185('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j158() {
_j127();
_j124();
_j131();
_j133();
_j135();
_j130();
}
function _j159() {
const _j1392 = document.querySelector('.shape-type-btn.active');
if (_j1392) {
return parseInt(_j1392.dataset.type);
}
return 0;
}
function _j160(type) {
const _j1197 = document.querySelectorAll('.shape-type-btn');
_j1197.forEach(btn => {
const _j1393 = parseInt(btn.dataset.type);
if (_j1393 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j161() {
const _j805 = document.getElementById('bugs-size');
const _j1394 = document.getElementById('bugs-size-value');
if (_j805 && _j1394) {
const _j1331 = parseFloat(_j805.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1331;
}
_j1394.textContent = _j1331;
_j805.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1394.textContent = value;
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
_j185('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1395 = document.querySelectorAll('.shape-type-btn');
_j1395.forEach(btn => {
_j138(btn, () => {
const type = parseInt(btn.dataset.type);
_j160(type);
});
});
}
function _j162() {
const _j1321 = document.getElementById('stroke-select-slider');
const _j1323 = document.getElementById('stroke-index-display');
const _j1396 = document.getElementById('stroke-total-display');
const _j1324 = document.getElementById('stroke-select-value');
if (!_j1321 || !_j1323 || !_j1396 || !_j1324) {
return;
}
function _j163(_j1535 = false) {
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
const _j1397 = Math.max(0, strokeCount - 1);
_j1321.max = _j1397;
_j1396.textContent = strokeCount;
if (_j1535 || parseInt(_j1321.value) > _j1397) {
_j1321.value = _j1397;
}
const _j1398 = parseInt(_j1321.value) || 0;
_j1323.textContent = _j1398;
_j1324.textContent = _j1398;
}
_j163();
_j1321.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1323.textContent = value;
_j1324.textContent = value;
let gridParams = null;
let points = null;
if (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0) {
const _j1399 = Math.max(0, Math.min(value, allBrushStrokes.length - 1));
const selectedStroke = allBrushStrokes[_j1399];
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
let _j1400 = 0;
setInterval(() => {
const _j1401 = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (_j1401 !== _j1400) {
const _j550 = _j1401 > _j1400;
_j163(_j550);
_j1400 = _j1401;
}
}, 500);
window.updateStrokeSelector = _j163;
}
function _j164() {
const _j1238 = document.getElementById('custom-brush-color');
const _j1239 = document.getElementById('custom-brush-color-text');
if (!_j1238 || !_j1239) {
console.error('Custom brush color inputs not found');
return;
}
let _j1228 = _j1239.value.trim();
if (!_j1228 || !/^#[0-9A-Fa-f]{6}$/.test(_j1228)) {
_j1228 = _j1238.value;
}
const r = parseInt(_j1228.slice(1, 3), 16);
const g = parseInt(_j1228.slice(3, 5), 16);
const b = parseInt(_j1228.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j112('ui', '❌ Invalid custom brush color', {
Color: _j1228,
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
_j133();
_j136();
_j1238.value = _j1228.toUpperCase();
_j1239.value = _j1228.toUpperCase();
_j112('ui', '🎨 Custom brush color applied', {
Color: _j1228,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j165() {
const _j1226 = document.getElementById('canvas-background-color');
const _j1227 = document.getElementById('canvas-background-color-text');
const _j1229 = document.getElementById('canvas-width');
const _j1230 = document.getElementById('canvas-height');
let _j1402 = false;
if (_j1226 && _j1227) {
let _j1228 = _j1227.value.trim();
if (!_j1228 || !/^#[0-9A-Fa-f]{6}$/.test(_j1228)) {
_j1228 = _j1226.value;
}
const r = parseInt(_j1228.slice(1, 3), 16);
const g = parseInt(_j1228.slice(3, 5), 16);
const b = parseInt(_j1228.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j112('ui', '❌ Invalid background color', {
Color: _j1228,
Status: 'Please use format #RRGGBB'
});
return;
}
if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
_j112('ui', '❌ Color values out of range', {
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
_j112('ui', '❌ canvasBackgroundColor not found', {
Status: 'Error: Variable not defined'
});
return;
}
if (typeof _j619 !== 'undefined' && _j619) {
_j619.begin();
background(r, g, b);
_j619.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j567 !== 'undefined') {
_j567 = true;
}
_j1226.value = _j1228.toUpperCase();
_j1227.value = _j1228.toUpperCase();
_j112('ui', '🎨 Background color changed', {
Color: _j1228,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1229 && _j1230) {
const _j1403 = parseInt(_j1229.value);
const _j1404 = parseInt(_j1230.value);
if (isNaN(_j1403) || isNaN(_j1404)) {
_j112('ui', '❌ Invalid canvas size', {
Width: _j1229.value,
Height: _j1230.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1403 < 100 || _j1403 > 4000 || _j1404 < 100 || _j1404 > 4000) {
_j112('ui', '❌ Canvas size out of range', {
Width: _j1403,
Height: _j1404,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j504 !== 'undefined' && typeof _j505 !== 'undefined') {
if (_j504 !== _j1403 || _j505 !== _j1404) {
_j504 = _j1403;
_j505 = _j1404;
_j1402 = true;
_j112('ui', '📐 Canvas size changed', {
Width: `${_j1403}px`,
Height: `${_j1404}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1402) {
sessionStorage.setItem('pendingCanvasWidth', _j504.toString());
sessionStorage.setItem('pendingCanvasHeight', _j505.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1405 = null;
let _j1406 = null;
function _j166() {
const _j1407 = document.querySelectorAll('.flow-effect-btn');
const _j1408 = document.getElementById('flow-strength');
const _j1409 = document.getElementById('flow-strength-value');
if (_j1408 && _j1409) {
_j1408.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1409.textContent = value;
if (typeof _j605 !== 'undefined') {
_j605.blendVol = value;
}
});
}
const _j1410 = document.getElementById('flow-last-stroke-only');
if (_j1410) {
_j1410.addEventListener('change', (e) => {
if (typeof _j606 !== 'undefined') {
_j606 = e.target.checked;
_j112('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j606
});
}
});
}
_j1407.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j167(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j168(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1405 === btn) {
_j168(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j167(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j168(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j168(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1405) {
const blendType = parseInt(_j1405.dataset.type);
_j168(_j1405, blendType);
}
});
}
function _j167(btn, blendType) {
if (_j1405) return;
const bounds = typeof _j49 === 'function' ? _j49() : null;
if (!bounds) {
_j112('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1405 = btn;
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
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622) {
if (typeof _j625 !== 'undefined' && _j625 > 0 && typeof _j627 !== 'undefined') {
const _j811 = millis() - _j625;
if (_j811 > 0) {
_j627 += _j811;
_j625 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j811,
total: _j627
});
}
}
const _j1411 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j605 !== 'undefined') ? _j605.blendVol : 100,
lastStrokeOnly: (typeof _j606 !== 'undefined') ? _j606 : false
};
console.log('🎬 Recording flow start event:', _j1411);
_j185('flow', _j1411);
}
_j1406 = setInterval(() => {
const _j910 = document.getElementById('flow-iteration-count');
if (_j910 && typeof _j595 !== 'undefined') {
_j910.textContent = _j595;
}
}, 50);
_j112('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j168(btn, blendType) {
if (_j1405 !== btn) return;
btn.classList.remove('active', 'running');
_j1405 = null;
if (_j1406) {
clearInterval(_j1406);
_j1406 = null;
}
let _j1412 = null;
if (typeof _j51 === 'function') {
_j1412 = _j51();
}
if (typeof _j185 === 'function' && typeof _j622 !== 'undefined' && _j622 && _j1412) {
const _j1413 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j597 !== 'undefined') ? _j597 : 0,
duration: _j1412.duration,
iterations: _j1412.iterations,
totalFrames: _j1412.frames
};
console.log('🎬 Recording flow end event:', _j1413);
_j185('flow', _j1413);
if (typeof _j625 !== 'undefined') {
_j625 = millis();
}
}
_j112('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1412 ? Math.round(_j1412.duration) + 'ms' : 'unknown',
Iterations: _j1412 ? _j1412.iterations : 'unknown',
Frames: _j1412 ? _j1412.frames : 'unknown'
});
}
let _j1414 = {
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
_pushFR: function(_j1536) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1536;
this._frSum += _j1536;
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
const _j1415 = this._avgFR();
console.log('平均 frameRate:', _j1415.toFixed(2));
console.log('是否触发警告:', _j1415 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1416 = this.logCooldown;
this.logCooldown = 0;
const _j1417 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1417.toFixed(2));
_j36(_j1417);
this.logCooldown = _j1416;
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
const _j1415 = this._avgFR();
console.log('平均帧率:', _j1415);
const _j1416 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j36(_j1415);
this.logCooldown = _j1416;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1416 = this.logCooldown;
this.logCooldown = 0;
const _j1418 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1418);
_j36(_j1418);
this.logCooldown = _j1416;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1414 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1414).filter(k => typeof _j1414[k] === 'function'));
_j36(50);
};
function _j169() {
_j511 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j512 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j514 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j170() {
const _j479 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j479[0], _j479[1], _j479[2]);
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
if (typeof _j613 !== 'undefined' && _j613) {
_j613.clear();
}
if (typeof finalBuffer !== 'undefined' && finalBuffer) {
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
}
if (typeof _j615 !== 'undefined' && _j615) {
_j615.clear();
_j615.background(255);
}
if (typeof _j617 !== 'undefined' && _j617) {
_j617.begin();
clear();
_j617.end();
}
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j548 = false;
_j549 = false;
_j570 = 0;
force = 1.0;
_j550 = false;
_j551 = false;
_j542 = 0;
x = hw;
y = hh;
_j526 = 0;
_j527 = 0;
_j528 = 0;
initialSize = 0;
_j531 = 0;
_j572 = 0;
pathPoints = [];
_j576 = false;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j575 !== 'undefined') {
_j575 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j374 !== 'undefined') {
_j374 = null;
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
_j176();
_j173();
_j567 = true;
}
function _j171() {
_j112('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j172();
_j173();
_j175();
_j174();
_j112('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j172() {
oldBuffer.begin();
clear();
background(255);
oldBuffer.end();
newBufferBlack.begin();
clear();
background(255);
newBufferBlack.end();
_j613.clear();
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
_j615.clear();
_j615.background(255);
pingPongBuffer.begin();
clear();
background(255);
pingPongBuffer.end();
if (typeof _j620 !== 'undefined' && _j620) {
_j620.begin();
clear();
_j620.end();
}
_j617.begin();
clear();
_j617.end();
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j613.blendMode(BLEND);
_j615.blendMode(BLEND);
_j567 = true;
}
function _j173() {
if (!pingPongBuffer || !_j509) return;
if (_j509) {
pingPongBuffer.begin();
if (_j591) {
image(newBufferBlack, 0, 0, width, height);
resetShader();
pingPongBuffer.end();
return;
}
shader(_j509);
_j509.setUniform("rect", [0, 0, width * _j506, height * _j506]);
_j509.setUniform("tex0", newBufferBlack);
_j509.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j509.setUniform("forceMap", _j507);
_j509.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j509.setUniform("force", 1.0);
_j509.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j509.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j509.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j509.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j509.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j509.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
}
}
function _j174() {
_j548 = false;
_j549 = false;
_j570 = 0;
force = 1.0;
_j550 = false;
_j551 = false;
_j542 = 0;
x = hw;
y = hh;
_j526 = 0;
_j527 = 0;
_j528 = 0;
initialSize = 0;
_j531 = 0;
_j529 = 0;
_j516 = 0;
_j571 = 0;
_j572 = 0;
pathPoints = [];
_j576 = false;
startX = hw;
startY = hh;
_j438 = hw;
_j439 = hh;
_j530 = 0;
_j539 = 0;
_j537 = hw;
_j538 = hh;
_j536 = [];
flyBrushEnd = [];
_j533 = 0;
_j634 = hw;
_j635 = hh;
_j636 = hw;
_j637 = hh;
_j638 = false;
_j640 = 0;
_j641 = false;
}
function _j175() {
_j507.begin();
shader(_j508);
_j508.setUniform("randomSeed1", _j607[0] || 100);
_j508.setUniform("randomSeed2", _j607[1] || 200);
_j508.setUniform("randomSeed3", _j607[2] || 300);
_j508.setUniform("randomSeed4", _j607[3] || 400);
_j508.setUniform("scale1", _j608[0] || 0.002);
_j508.setUniform("scale2", _j608[1] || 0.005);
_j508.setUniform("scale3", _j608[2] || 0.015);
_j508.setUniform("amplitude1", _j609[0] || 0.6);
_j508.setUniform("amplitude2", _j609[1] || 0.4);
_j508.setUniform("amplitude3", _j609[2] || 0.3);
_j508.setUniform("phase1", _j610[0] || 0);
_j508.setUniform("phase2", _j610[1] || 0);
_j508.setUniform("phase3", _j610[2] || 0);
_j508.setUniform("vortexScale1", _j611[0] || 0.008);
_j508.setUniform("vortexScale2", _j611[1] || 0.012);
_j508.setUniform("clusterScale1", _j612[0] || 0.001);
_j508.setUniform("clusterScale2", _j612[1] || 0.0008);
_j508.setUniform("canvasCenter", [hw, hh]);
_j508.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j507.end();
}
function _j176() {
for (let i = 0; i < 4; i++) {
_j607[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j608[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j609[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j610[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j611[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j612[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j175();
}
function _j177(title = '') {}
function _j178() {
_j179();
}
function _j179() {
_j176();
const _j1419 = brushMode;
brushMode = 1;
initialSize = 20;
_j531 = initialSize;
_j525 = _j531;
_j529 = _j525;
_j548 = true;
_j549 = false;
_j570 = 0;
_j550 = true;
_j551 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j30(newBufferBlack, 1.0);
}
mouseReleased();
_j549 = true;
_j570 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j30(newBufferBlack, force);
}
_j39();
brushMode = _j1419;
_j170();
}
function _j180() {
if (_j673) {
_j112('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j673 = true;
_j674 = millis();
frameCount = 0;
_j675 = [];
_j177('🎬 Start Frame Recording');
}
function _j181() {
if (!_j673) {
_j112('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j673 = false;
const _j1420 = millis() - _j674;
_j177('🎬 Frame Recording Complete');
_j183();
}
function _j182() {
if (!_j673) return;
if (frameCount % _j676 !== 0) {
frameCount++;
return;
}
const _j1421 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1421}.png`;
saveCanvas(filename, 'png');
_j675.push({
frame: frameCount,
timestamp: millis() - _j674,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j112('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j675.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j183() {
if (_j675.length === 0) {
_j112('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j112('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j675.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j184(_j1537) {
return Math.round(_j1537 * 100) / 100;
}
function _j185(type, data = {}) {
if (window.testMode) return;
if (!_j622) return;
if (_j623 === 0) return;
const _j1422 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1423 = _j1422 + (millis() - _j623 - _j627);
const event = {
m: type,
t: Math.round(_j1423),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1424 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1425 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j112('recording', `${_j1424[type] || '📝'} Event recorded`, {
Type: _j1425[type] || type,
Time: `${_j1423.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j186() {
_j622 = true;
_j623 = 0;
_j625 = 0;
_j627 = 0;
_j628 = true;
_j516 = 0;
const _j1426 = seed;
const _j1427 = (typeof _j159 === 'function') ? _j159() : 0;
const _j1428 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1429 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1430 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1431 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1430[0] - rgb[0]) < 0.01 &&
Math.abs(_j1430[1] - rgb[1]) < 0.01 &&
Math.abs(_j1430[2] - rgb[2]) < 0.01) {
_j1431 = type;
break;
}
}
recordingData = {
version: "1.0",
engineVersion: (typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev',
startTime: _j623,
randomSeed: _j1426,
initialPathToggle: _j566,
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
shapeType: _j1427,
metallicStrength: _j1428,
metallicFlow: _j1429,
metallicTint: _j1430,
metallicTintType: _j1431
}
};
randomSeed(_j1426);
noiseSeed(_j1426);
_j177('🎬 Start Art Creation Recording');
if (typeof _j116 === 'function') {
_j116();
}
}
function _j187() {
if (!_j622) return;
_j622 = false;
randomSeed(seed);
noiseSeed(seed);
_j177('✨ Art Creation Recording Complete');
const _j1432 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j605 !== 'undefined' ? _j605.blendVol : 100,
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
_j188();
setTimeout(() => {
_j122();
}, 300);
if (typeof _j116 === 'function') {
_j116();
}
}
function _j188() {
if (recordingData.events.length === 0) {
_j112('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1433 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1434 = JSON.stringify(_j1433, null, 2);
const _j1435 = new Blob([_j1434], {
type: 'application/json'
});
const _j1436 = URL.createObjectURL(_j1435);
const _j1437 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1437.download = `drawing-recording-${timestamp}.json`;
_j1437.href = _j1436;
_j1437.click();
URL.revokeObjectURL(_j1436);
_j112('art', '💾 Art recording saved', {
File: _j1437.download,
Size: `${(_j1434.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j116 === 'function') {
_j116();
}
}
function _j189() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1365 = event.target.files[0];
if (!_j1365) return;
const _j1192 = new FileReader();
_j1192.onload = (e) => {
try {
const loadedData = JSON.parse(e.target.result);
if (!loadedData.version || !loadedData.events) {
_j112('system', '❌ Invalid recording file format', {
Status: 'Error'
});
return;
}
if (typeof window !== 'undefined') {
window.loadedRecordingData = JSON.parse(JSON.stringify(loadedData));
window.loadedRecordingFileName = _j1365.name;
}
recordingData = loadedData;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j575 !== 'undefined') {
_j575 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof _j233 !== 'undefined') {
_j233 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j177('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1438 = _j195(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1438) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1365.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j619 !== 'undefined' && _j619) {
_j619.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j619.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j139 === 'function') {
_j139();
}
_j112('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
setTimeout(() => {
startPlayback();
}, 500);
} catch (error) {
_j112('system', '❌ Failed to load recording', {
Error: error.message,
Status: 'Error'
});
}
};
_j1192.readAsText(_j1365);
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
_j112('system', '⚠️ No recording data to play', {
Status: 'Error'
});
return;
}
if (_j630) {
_j112('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j1043 !== 'undefined') {
_j1043 = [];
}
if (typeof _j1044 !== 'undefined') {
_j1044 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1439 = window.location.search || '';
const _j1440 = (key) => _j1439.includes('_' + key + ':') || _j1439.includes('?' + key + ':');
const _j1441 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1442 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1443 = recordingData.initialPanelToggles;
for (const _j1444 of _j1441) {
const urlKey = _j1442[_j1444.jsonKey];
if (urlKey && _j1440(urlKey)) continue;
const value = _j1443 ? _j1443[_j1444.jsonKey] : undefined;
const _j1445 = value !== undefined ? value : _j1444.defaultVal;
_j1444.setter(_j1445);
const _j1446 = document.getElementById(_j1444.toggleId);
if (_j1446) {
_j1446.checked = _j1444.isNumeric ? (_j1445 === 1) : !!_j1445;
}
}
const _j1447 = recordingData.events.filter(e => e.m === 'mp').length;
const _j1448 = recordingData.events.filter(e => e.m === 'md').length;
if (window.skipClearCanvasOnNextPlayback) {
window.skipClearCanvasOnNextPlayback = false;
console.log('[append] ✅ skip clearCanvas, overlay playback', { mp: _j1447, md: _j1448, totalEvents: recordingData.events.length });
} else {
console.log('[startPlayback] ❌ standard mode, will clear canvas', { mp: _j1447, md: _j1448, totalEvents: recordingData.events.length });
_j170();
if (typeof clearMask === 'function') clearMask();
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j619 !== 'undefined' && _j619) {
_j619.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j619.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j567 !== 'undefined') {
_j567 = true;
}
if (typeof _j139 === 'function') {
_j139();
}
_j112('playback', '🎨 Background color restored', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
_j112('playback', 'Random seed reset', {
Seed: recordingData.randomSeed
});
} else {
_j112('system', '⚠️ No seed info in recording, playback may be inaccurate', {
Status: 'Warning'
});
}
_j630 = true;
_j631 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j632 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j649 !== 'undefined') {
_j649 = 0;
}
_j638 = false;
_j634 = hw;
_j635 = hh;
_j636 = hw;
_j637 = hh;
_j572 = 0;
if (typeof _j672 !== 'undefined') {
_j672 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j575 !== 'undefined') {
_j575 = null;
}
if (typeof _j576 !== 'undefined') {
_j576 = false;
}
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j233 !== 'undefined') {
_j233 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j667 !== 'undefined') {
_j667 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j668 !== 'undefined') {
_j668 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j516 = 0;
_j640 = 0;
_j641 = false;
if (recordingData.initialPathToggle !== undefined) {
_j566 = recordingData.initialPathToggle;
_j112('playback', 'Path toggle restored', {
Status: _j566 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1207 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j112('playback', 'Brush color restored', {
Mode: _j1207[brushColorMode] || 'Unknown'
});
} else if (recordingData.initialWhiteBrushMode !== undefined) {
whiteBrushMode = recordingData.initialWhiteBrushMode;
brushColorMode = whiteBrushMode ? 1 : 0;
_j112('playback', 'Brush color restored (legacy)', {
Mode: whiteBrushMode ? "White ⚪" : "Black ⚫"
});
} else {
whiteBrushMode = false;
brushColorMode = 0;
}
_j177('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j160 === 'function') {
_j160(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1384 = document.getElementById('metallic-strength');
const _j1385 = document.getElementById('metallic-strength-value');
if (_j1384 && _j1385) {
_j1384.value = ec.metallicStrength;
_j1385.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1386 = document.getElementById('metallic-flow');
const _j1387 = document.getElementById('metallic-flow-value');
if (_j1386 && _j1387) {
_j1386.value = ec.metallicFlow;
_j1387.textContent = ec.metallicFlow;
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
const _j1449 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1449);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
}
}
_j112('playback', '✨ Effect Control restored', {
ShapeType: ec.shapeType !== undefined ? ec.shapeType : 'Unknown',
Strength: ec.metallicStrength !== undefined ? ec.metallicStrength : 'Unknown',
Flow: ec.metallicFlow !== undefined ? ec.metallicFlow : 'Unknown',
Tint: ec.metallicTintType || 'Unknown'
});
}
const _j1450 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1451 = window.location.search || '';
const _j1452 = (key) => _j1451.includes('_' + key + ':') || _j1451.includes('?' + key + ':');
for (const _j1444 of _j1450) {
if (_j1452(_j1444.urlKey)) continue;
_j1444.setter(false);
const _j1446 = document.getElementById(_j1444.toggleId);
if (_j1446) {
_j1446.checked = false;
}
const _j1453 = document.getElementById(_j1444.slidersId);
if (_j1453) {
_j1453.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1454 = document.getElementById('distort-fbm-preview-toggle');
if (_j1454) _j1454.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1455 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1455)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j112('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j605 !== 'undefined') {
_j605.blendVol = fe.flowStrength;
const _j1456 = document.getElementById('flow-strength');
const _j1457 = document.getElementById('flow-strength-value');
if (_j1456) _j1456.value = fe.flowStrength;
if (_j1457) _j1457.textContent = fe.flowStrength;
}
for (const _j1444 of _j1450) {
const value = fe[_j1444.jsonKey];
if (value === undefined) continue;
if (_j1452(_j1444.urlKey)) {
_j112('playback', `⏭️ Flow Effect: ${_j1444.jsonKey} skipped (URL override)`, {});
continue;
}
_j1444.setter(!!value);
const _j1446 = document.getElementById(_j1444.toggleId);
if (_j1446) {
_j1446.checked = !!value;
}
const _j1453 = document.getElementById(_j1444.slidersId);
if (_j1453) {
_j1453.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1454 = document.getElementById('distort-fbm-preview-toggle');
if (_j1454) _j1454.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1458 = document.getElementById('distort-displacement-b');
const _j1459 = document.getElementById('distort-displacement-b-value');
if (_j1458) _j1458.value = fe.distortDisplacementB;
if (_j1459) _j1459.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1460 = document.getElementById('distort-displacement-c');
const _j1461 = document.getElementById('distort-displacement-c-value');
if (_j1460) _j1460.value = fe.distortDisplacementC;
if (_j1461) _j1461.textContent = fe.distortDisplacementC;
}
_j112('playback', '✨ Flow Effect restored', {
Strength: fe.flowStrength,
Distort: !!fe.distortShaderEnabled ? 'ON' : 'OFF',
Cellular: !!fe.cellularEnabled ? 'ON' : 'OFF',
RS: !!fe.rsEnabled ? 'ON' : 'OFF',
WhiteDot: !!fe.whiteDotEnabled ? 'ON' : 'OFF',
Grain: !!fe.grainEnabled ? 'ON' : 'OFF'
});
} else {
_j112('playback', '🔄 Flow Effect: reset to defaults (no initialFlowEffect in JSON)', {});
}
if (_j1443) {
_j112('playback', '✨ Panel toggles restored', {
Paper: _j1443.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1443.showGridOverlay ? 'ON' : 'OFF',
Path: _j1443.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1443.screenText ? 'ON' : 'OFF',
Camera: _j1443.doMoving ? 'ON' : 'OFF',
Loop: _j1443.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j112('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j176();
_j173();
const _j1462 = recordingData.events[0];
if (_j1462 && _j1462.strokeData) {
const strokeData = _j1462.strokeData;
_j531 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j531;
nowSize = size;
}
_j30(newBufferBlack, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j645 === 'undefined' || !_j645) {
_j645 = true;
}
_j646 = true;
if (_j645 && _j644 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j421 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j421 / 2));
_j644.setAutoUpdate(true);
if (typeof _j644.setPanScale === 'function') {
_j644.setPanScale(0);
}
if (typeof _j644.setZoomScale === 'function') {
_j644.setZoomScale(0);
}
_j644.setCenter([0, 0, 0], 0);
_j644.setDistance(easycamInitialDistance, 0);
if (typeof _j651 !== 'undefined') {
_j651 = 1;
}
_j112('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j646 = false;
_j645 = false;
}
if (typeof _j116 === 'function') {
_j116();
}
}
function _j190() {
if (!_j630) return;
_j630 = false;
_j638 = false;
_j632 = 0;
isWaitingToLoop = false;
_j640 = 0;
_j641 = false;
randomSeed(seed);
noiseSeed(seed);
_j177('⏹️ Playback Ended');
_j193();
_j646 = false;
if (_j645 && _j644 !== null) {
try {
const _j420 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j423 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j424 = _j644.getCenter();
const _j425 = _j644.getDistance();
_j112('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j424[0].toFixed(2)}, ${_j424[1].toFixed(2)}, ${_j424[2].toFixed(2)}], Distance: ${_j425.toFixed(2)}`,
Target: `Center: [${_j420[0].toFixed(2)}, ${_j420[1].toFixed(2)}, ${_j420[2].toFixed(2)}], Distance: ${_j423.toFixed(2)}`
});
_j657 = true;
_j658 = millis();
_j655 = [_j424[0], _j424[1], _j424[2]];
_j659 = _j425;
_j656 = _j420;
_j660 = _j423;
setTimeout(() => {
if (_j644 !== null) {
_j644.setAutoUpdate(false);
const _j432 = _j644.getCenter();
const _j433 = _j644.getDistance();
const _j426 = 0.1;
const _j427 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j432[0] - _j420[0], 2) +
Math.pow(_j432[1] - _j420[1], 2) +
Math.pow(_j432[2] - _j420[2], 2)
);
const distanceDiff = Math.abs(_j433 - _j423);
_j112('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j432[0].toFixed(2)}, ${_j432[1].toFixed(2)}, ${_j432[2].toFixed(2)}], Distance: ${_j433.toFixed(2)}`,
Target: `Center: [${_j420[0].toFixed(2)}, ${_j420[1].toFixed(2)}, ${_j420[2].toFixed(2)}], Distance: ${_j423.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j426 && distanceDiff <= _j427) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j426 || distanceDiff > _j427) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j432[0].toFixed(3)}, ${_j432[1].toFixed(3)}, ${_j432[2].toFixed(3)}]`,
distance: _j433.toFixed(3)
}
});
_j644.setCenter(_j420, 0);
_j644.setDistance(_j423, 0);
const _j1463 = _j644.getCenter();
const _j1464 = _j644.getDistance();
_j112('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1463[0].toFixed(2)}, ${_j1463[1].toFixed(2)}, ${_j1463[2].toFixed(2)}]`,
Distance: _j1464.toFixed(2)
});
}
_j657 = false;
}
_j645 = false;
}, 2100);
_j112('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j420,
Distance: _j423.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j645 = false;
}
} else {
_j645 = false;
}
if (typeof _j116 === 'function') {
_j116();
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
function _j191(event) {
const _j860 = event.m || event.type;
switch (_j860) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('playback_mousePressed_start', 'mousePressed');
const _j1465 = _j549;
const _j1466 = event.t !== undefined ? event.t : event.time;
if (_j549) {
const _j769 = _j631;
if (window._fxVirtualTime === undefined) {
_j631 = millis() - _j1466 / _j633;
}
const _j1467 = _j769 - _j631;
const _j768 = (typeof _j640 !== 'undefined' && _j640 > 0) ?
(millis() - _j640) :
0;
if (typeof _j641 !== 'undefined') {
_j641 = false;
}
if (typeof _j640 !== 'undefined') {
_j640 = 0;
}
_j39();
_j549 = false;
_j570 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1468 = _j1466 - playbackLastStrokeEndEventTime;
const _j1469 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1470 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j40();
if (typeof _j1043 !== 'undefined') {
_j1043 = [];
}
if (typeof _j1044 !== 'undefined') {
_j1044 = 0;
}
if (typeof _j649 !== 'undefined') {
_j649++;
if (typeof _j652 !== 'undefined' && typeof _j650 !== 'undefined') {
_j652 = random(0, 1) > 0.7;
_j650 = _j649;
}
}
_j634 = event.x + (typeof _j642 !== 'undefined' ? _j642 : 0);
_j635 = event.y + (typeof _j643 !== 'undefined' ? _j643 : 0);
_j636 = _j634;
_j637 = _j635;
if (false) {
_j638 = true;
} else {
_j638 = false;
}
if (typeof _j672 !== 'undefined') {
_j672 = true;
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
_j573 = sd.mouseCountStart;
} else {
_j573 = 0;
}
_j571 = 0;
const offsetX = typeof _j642 !== 'undefined' ? _j642 : 0;
const offsetY = typeof _j643 !== 'undefined' ? _j643 : 0;
const _j1471 = event.x + offsetX;
const _j1472 = event.y + offsetY;
_j112('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1471.toFixed(0)}, ${_j1472.toFixed(0)})`
});
_j112('system', '|--------------------------------', {});
} else {
_j112('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j571 = 0;
}
_j516 = 0;
_j542 = 0;
x = _j634;
y = _j635;
_j526 = 0;
_j527 = 0;
_j528 = 0;
_j539 = 0;
_j533 = 0;
_j572 = 0;
_j570 = 0;
_j549 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j1043 !== 'undefined') {
_j1043 = [];
}
if (typeof _j540 !== 'undefined') {
_j540 = _j634;
_j541 = _j635;
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
_j521 = sd.step !== undefined ? sd.step : 4;
_j578 = sd.step2 !== undefined ? sd.step2 : 2;
randStep = sd.randStep !== undefined ? sd.randStep : 0;
maxUpdates = sd.maxUpdates !== undefined ? sd.maxUpdates : 30;
pathRotation = sd.pathRotation !== undefined ? sd.pathRotation : 0;
_j523 = sd.spring !== undefined ? sd.spring : 0.6;
_j524 = sd.friction !== undefined ? sd.friction : 0.5;
baseBrushSize = sd.baseBrushSize || 1.0;
if (_j552) {
_j564 = baseBrushSize;
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
_j517 = sd.whiteMaxOpacity;
} else {
_j517 = 0.95;
}
if (sd.hueShift !== undefined) {
_j518 = sd.hueShift;
} else {
_j518 = 0.0;
}
if (sd.satShift !== undefined) {
_j519 = sd.satShift;
} else {
_j519 = 0.0;
}
if (sd.briShift !== undefined) {
_j520 = sd.briShift;
} else {
_j520 = 0.0;
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
_j559 = sd.maskData;
if (sd.maskData.action === 'rect') {
drawMaskRect(sd.maskData.x1, sd.maskData.y1, sd.maskData.x2, sd.maskData.y2);
} else if (sd.maskData.action === 'polygon') {
drawMaskPolygon(sd.maskData.points);
}
} else {
_j559 = null;
if (_j555) clearMask();
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j607[0] = fm.randomSeed1;
_j607[1] = fm.randomSeed2;
_j607[2] = fm.randomSeed3;
_j607[3] = fm.randomSeed4;
_j608[0] = fm.scale1;
_j608[1] = fm.scale2;
_j608[2] = fm.scale3;
_j609[0] = fm.amplitude1;
_j609[1] = fm.amplitude2;
_j609[2] = fm.amplitude3;
_j610[0] = fm.phase1;
_j610[1] = fm.phase2;
_j610[2] = fm.phase3;
_j611[0] = fm.vortexScale1;
_j611[1] = fm.vortexScale2;
_j612[0] = fm.clusterScale1;
_j612[1] = fm.clusterScale2;
_j175();
} else {
if (typeof _j176 === 'function') {
_j176();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j531 = initialSize;
_j525 = _j531;
_j529 = _j525;
_j542 = 0;
x = _j634;
y = _j635;
_j526 = 0;
_j527 = 0;
_j528 = 0;
_j539 = 0;
_j533 = 0;
_j548 = true;
_j549 = false;
_j570 = 0;
_j550 = true;
_j551 = false;
_j572 = 0;
startX = _j634;
startY = _j635;
pathPoints = [{
x: _j634,
y: _j635
}];
_j576 = true;
_j638 = true;
if (_j552) window._playbackPenPressure = -1;
_j30(newBufferBlack, 1.0);
crandomDebugger.checkpoint('playback_mousePressed_end', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j634 = event.x + (typeof _j642 !== 'undefined' ? _j642 : 0);
_j635 = event.y + (typeof _j643 !== 'undefined' ? _j643 : 0);
if (_j552 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j552) window._playbackPenPressure = -1;
const _j814 = crandom.getCount();
const _j1473 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1473;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('playback_mouseReleased', 'mouseReleased');
const _j1474 = crandom.getCount();
const _j819 = _j1474 - _j814;
const _j1475 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j851 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j860 = e.m || e.type;
return _j860 === 'mr' || _j860 === 'mouseReleased';
}).length :
'?';
const _j820 = window.drawLoopCount || 0;
const _j1476 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 playback [stroke ${_j1475}/${_j851}] | Draw: ${_j820} | Seed: ${_j1474}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1475);
crandomDebugger.compareStroke(_j1475);
_j634 = event.x + (typeof _j642 !== 'undefined' ? _j642 : 0);
_j635 = event.y + (typeof _j643 !== 'undefined' ? _j643 : 0);
_j638 = false;
if (!_j549) {
_j549 = true;
_j570 = 0;
if (typeof _j640 !== 'undefined') {
_j640 = millis();
}
if (typeof _j641 !== 'undefined') {
_j641 = true;
}
_j112('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j112('playback', 'Stroke reproduction complete', {
FinalSize: _j531.toFixed(2),
CountdownStatus: _j549 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j638) {
_j638 = true;
} else {
_j636 = _j634;
_j637 = _j635;
}
_j634 = event.x + (typeof _j642 !== 'undefined' ? _j642 : 0);
_j635 = event.y + (typeof _j643 !== 'undefined' ? _j643 : 0);
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
_j158();
_j112('playback', '⌨️ Simulate key: R', {
'Effect': 'Wet Ink'
});
} else if (k === 'p' || k === 'P') {} else if (k === 'o' || k === 'O') {
_j112('playback', '⌨️ Simulate key: O', {
'Loop toggle': 'Ignored during playback'
});
}
break;
case 'ec':
case 'effectControl':
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
const _j1477 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1478 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1394 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1394;
const _j805 = document.getElementById('bugs-size');
const _j806 = document.getElementById('bugs-size-value');
if (_j805 && _j806) {
_j805.value = _j1394;
_j806.textContent = _j1394;
}
}
const _j804 = {
action: action,
shapeType: _j1478,
bugsSize: _j1394,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1479 = null;
let _j1480 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j804);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1479 = window._scanGlobalPlaybackCount || 0;
_j1480 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1394;
}
const _j807 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1478);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1478);
}
}
if (_j807) {
randomSeed(_j807);
noiseSeed(_j807);
}
}
_j112('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1477,
ShapeType: _j1478 !== null ? _j1478 : 'Unknown',
BugsSize: _j1394,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1479,
CurrentCount: _j1480
});
} else if (action === 'scan-random') {
const _j1478 = event.shapeType !== undefined ? event.shapeType : null;
const _j1394 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1394;
const _j805 = document.getElementById('bugs-size');
const _j806 = document.getElementById('bugs-size-value');
if (_j805 && _j806) {
_j805.value = _j1394;
_j806.textContent = _j1394;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1478);
}
_j112('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1478 !== null ? _j1478 : 'Unknown',
BugsSize: _j1394
});
} else if (action === 'metallic-strength') {
const _j1385 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1385 / 100;
}
const _j1384 = document.getElementById('metallic-strength');
const _j1481 = document.getElementById('metallic-strength-value');
if (_j1384 && _j1481) {
_j1384.value = _j1385;
_j1481.textContent = _j1385;
}
_j112('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1385
});
} else if (action === 'bugs-size') {
const _j1394 = event.value !== undefined ? event.value : 10;
const _j805 = document.getElementById('bugs-size');
const _j806 = document.getElementById('bugs-size-value');
if (_j805 && _j806) {
_j805.value = _j1394;
window.bugsSize = _j1394;
_j806.textContent = _j1394;
_j112('system', '🐛 Bugs Size updated during playback', {
Value: _j1394
});
}
} else if (action === 'metallic-flow') {
const _j1387 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1387 / 100;
}
const _j1386 = document.getElementById('metallic-flow');
const _j1482 = document.getElementById('metallic-flow-value');
if (_j1386 && _j1482) {
_j1386.value = _j1387;
_j1482.textContent = _j1387;
}
_j112('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1387
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
const _j1449 = `metal-${tintType}`;
const btn = document.getElementById(_j1449);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
_j112('playback', '✨ Effect Control: Metal Tint', {
Tint: tintType,
RGB: `[${tintButtons[tintType].join(', ')}]`,
Applied: true
});
} else {
_j112('playback', '⚠️ Effect Control: Metal Tint (Unknown)', {
Tint: tintType,
Status: 'Unknown tint type, skipped'
});
}
}
break;
case 'flow':
if (event.action === 'start') {
if (typeof _j592 !== 'undefined' && _j592) {
if (typeof _j51 === 'function') {
_j51();
}
_j112('playback', '🌊 Flow Effect: previous effect forced to complete');
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
if (event.strength !== undefined && typeof _j605 !== 'undefined') {
_j605.blendVol = event.strength;
}
if (typeof _j606 !== 'undefined') {
_j606 = event.lastStrokeOnly || false;
}
if (typeof _j50 === 'function') {
_j50(event.blendType, event.flowSeed, true);
}
_j112('playback', '🌊 Flow Effect: Start (preview)', {
BlendType: event.blendType,
Seed: event.flowSeed,
Bounds: event.strokeBounds ? `[${event.strokeBounds.minX.toFixed(2)}, ${event.strokeBounds.minY.toFixed(2)}, ${event.strokeBounds.maxX.toFixed(2)}, ${event.strokeBounds.maxY.toFixed(2)}]` : 'None'
});
} else if (event.action === 'end') {
const _j1483 = window.pendingFlowEvent;
if (_j1483) {
if (typeof _j601 !== 'undefined') {
_j601 = event.totalFrames || (event.iterations * 3) || 30;
_j602 = event.iterations || 10;
}
_j112('playback', '🌊 Flow Effect: End (target set, wait for preview)', {
BlendType: _j1483.blendType,
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
_j112('playback', '🎭 Mask rect applied', {
Region: `(${event.x1.toFixed(0)},${event.y1.toFixed(0)})→(${event.x2.toFixed(0)},${event.y2.toFixed(0)})`
});
} else if (event.action === 'polygon') {
drawMaskPolygon(event.points);
_j112('playback', '🎭 Mask polygon applied', {
Points: event.points.length
});
} else if (event.action === 'clear') {
clearMask();
_j112('playback', '🎭 Mask cleared');
}
break;
}
}
function updatePlayback() {
if (!_j630) return;
const _j1484 = 200;
if (typeof window !== 'undefined') {
const _j1485 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1486 = millis() - window.lastEffectControlProcessTime;
if (_j1486 < _j1484) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1485 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1487 = millis() - _j639;
const _j1488 = Math.floor(_j1487 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1488) {}
if (_j1487 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ Countdown finished, preparing replay');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j112('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j645 && _j644 !== null) {
const _j420 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j423 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j644.setCenter(_j420, 0);
_j644.setDistance(_j423, 0);
_j657 = false;
_j112('system', '🎥 Camera reset for loop', {
Center: `[${_j420[0].toFixed(2)}, ${_j420[1].toFixed(2)}, ${_j420[2].toFixed(2)}]`,
Distance: _j423.toFixed(2)
});
}
_j170();
if (typeof _j1043 !== 'undefined') {
_j1043 = [];
}
if (typeof _j1044 !== 'undefined') {
_j1044 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j631 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j632 = 0;
_j638 = false;
_j634 = hw;
_j635 = hh;
_j636 = hw;
_j637 = hh;
isWaitingToLoop = false;
_j572 = 0;
_j516 = 0;
_j640 = 0;
_j641 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j575 !== 'undefined') {
_j575 = null;
}
if (typeof _j576 !== 'undefined') {
_j576 = false;
}
if (typeof _j667 !== 'undefined') {
_j667 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j668 !== 'undefined') {
_j668 = {
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
_j112('playback', '🔁 Loop restart', {
Status: 'New round playback'
});
} else {
_j112('playback', '⏹️ Playback ended', {
Status: 'Single playback complete, no more loops'
});
_j190();
}
}
return;
}
if (_j632 >= recordingData.events.length && !isWaitingToLoop) {
if (_j638) {
_j638 = false;
if (!_j549) {
_j549 = true;
_j570 = 0;
_j567 = true;
}
}
if (_j549) {
if (_j570 < maxUpdates) {
return;
}
}
if (_j548) {
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
window._fxDebug.eventsProcessed = _j632;
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
function _j192() {
console.log('[fxhash] Forcing final composite + capture...');
_j567 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j645 && _j644 !== null) {
_j657 = true;
_j658 = millis();
_j655 = [_j644.getCenter()[0], _j644.getCenter()[1], _j644.getCenter()[2]];
_j659 = _j644.getDistance();
_j656 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j660 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1489 = _j661 + 500;
console.log('[fxhash] Waiting ' + _j1489 + 'ms for camera reset before capture...');
setTimeout(_j192, _j1489);
} else {
_j192();
}
}
_j112('playback', 'Playback complete', {
Status: 'Waiting 30 seconds before loop'
});
if (window.DEBUG_MODE) console.log('✅ Starting countdown:', {
loopWaitDuration: loopWaitDuration,
startTime: millis()
});
isWaitingToLoop = true;
_j639 = millis();
} else {
_j112('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle is not 1, stopping playback');
_j190();
}
return;
}
var _j774;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j774 = window._fxVirtualTime * _j633;
} else {
_j774 = (millis() - _j631) * _j633;
}
let _j1490 = 0;
const _j1491 = 100;
let _j1492 = 0;
const _j1493 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1494 = false;
while (_j632 < recordingData.events.length && _j1490 < _j1491) {
if (typeof _j592 !== 'undefined' && _j592 &&
typeof _j601 !== 'undefined' && _j601 > 0) {
break;
}
const event = recordingData.events[_j632];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j860 = event.m || event.type;
const _j1495 = _j860 === 'mp' || _j860 === 'mousePressed';
const _j1496 = _j860 === 'mr' || _j860 === 'mouseReleased';
const _j1497 = _j860 === 'ec' || _j860 === 'effectControl';
const _j1498 = _j860 === 'flow';
const _j1499 = _j860 === 'mask';
const _j775 = eventTime - _j774;
if (!_j1497 && !_j1498 && !_j1499 && eventTime > _j774 && _j632 + 1 < recordingData.events.length) {
const _j770 = recordingData.events[_j632 + 1];
const _j771 = _j770.m || _j770.type;
const _j772 = _j771 === 'mp' || _j771 === 'mousePressed';
if (_j772) {
if (_j1496) {
if (_j1494) {
break;
}
_j191(event);
_j632++;
_j1490++;
continue;
} else {
_j632++;
continue;
}
}
}
if (eventTime <= _j774) {
const _j1500 = _j860 === 'md' || _j860 === 'mouseDragged';
if (_j1500 && _j1492 >= _j1493) {
break;
}
if (_j1496 && _j1494) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1497 || _j1499 || !_j549 || (_j549 && _j638)) {
if (_j1497) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j191(event);
_j632++;
_j1490++;
if (_j1500) {
_j1492++;
_j1494 = true;
}
} else {
break;
}
} else {
const _j1500 = _j860 === 'md' || _j860 === 'mouseDragged';
if (_j1500 && _j1492 >= _j1493) {
break;
}
if (_j1496 && _j1494) {
break;
}
if (_j1497 || _j1498 || _j1499 || (_j1495 && !_j549) || _j775 < 100) {
if (_j1497) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j191(event);
_j632++;
_j1490++;
if (_j1500) {
_j1492++;
_j1494 = true;
}
} else {
break;
}
}
if (_j1492 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j193() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1501 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1501) {
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
const _j1502 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1503 = confirm(
`Playback complete.\n\n` +
`Events played: ${loadedData.events.length}\n` +
`File: ${_j1502}\n\n` +
`Continue recording and append new strokes?\n\n` +
`OK — continue recording\n` +
`Cancel — stop`
);
if (_j1503) {
_j194(loadedData, _j1502);
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
function _j194(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j112('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j186();
return;
}
const _j1504 = loadedData.events[loadedData.events.length - 1];
const _j1432 = _j1504.t !== undefined ? _j1504.t : (_j1504.time !== undefined ? _j1504.time : 0);
_j622 = true;
_j623 = millis();
_j625 = 0;
_j627 = 0;
_j628 = true;
_j516 = 0;
recordingData = {
...loadedData,
engineVersion: loadedData.engineVersion || (
(typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev'
),
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1432,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1426 = seed;
randomSeed(_j1426);
noiseSeed(_j1426);
_j177('🔄 Continue Recording from Loaded File');
_j112('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1432}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j116 === 'function') {
_j116();
}
}
function _j195(_j1538, _j1539) {
if (!_j1538 || !_j1539) {
_j112('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1538 && height === _j1539) {
_j112('system', '✅ Canvas size matches recording', {
Width: `${_j1538}px`,
Height: `${_j1539}px`
});
return false;
}
_j112('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1538}x${_j1539}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1538.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1539.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j112('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1538}x${_j1539}`
});
window.location.reload();
return true;
}
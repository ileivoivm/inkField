function _j1(_j1533, _j1534) {
var _j204 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1533];
var _j205 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1534];
if (_j204 && _j205 && typeof createShader === 'function') {
return createShader(_j204, _j205);
}
return window['loadShader'](_j1533, _j1534);
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
const _j206 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j206,
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
const _j207 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j207.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j207.forEach((_j637, _j315) => {
console.log(`[${_j637.count}] args: [${_j637.args.join(', ')}]`);
if (_j637.caller) {
console.log(`    位置: ${_j637.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j208 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j208 > 0 ? '+' : ''}${_j208}`);
console.log('═══════════════════════════════════════');
return _j208;
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
const _j209 = playback.totalCount - recording.totalCount;
const percent = ((_j209 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j209) < 50 ? '✅' : Math.abs(_j209) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j209 > 0 ? '+' : ''}${_j209} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j210 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j211 = Array.from(_j210).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j212 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j212 === -1) return 0;
if (indexA === -1) return 1;
if (_j212 === -1) return -1;
return indexA - _j212;
});
let _j213 = 0;
const _j214 = [];
for (const stage of _j211) {
const recCount = recDeltas.get(stage) || 0;
const _j215 = playDeltas.get(stage) || 0;
const _j208 = _j215 - recCount;
_j213 += _j208;
if (Math.abs(_j208) > 0) {
_j214.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j215,
difference: _j208
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j214.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j216 = _j214.filter(d => Math.abs(d.difference) > 50);
if (_j216.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j216.length); i++) {
const d = _j216[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j217 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j218 = checkpoints[i];
const _j219 = checkpoints[i + 1];
if (_j219) {
const _j220 = `${_j218.name} → ${_j219.name}`;
const _j221 = _j219.count - _j218.count;
_j217.set(_j220, _j221);
}
}
return _j217;
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
const _j222 = [{
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
const _j223 = {};
_j222.forEach(color => {
_j223[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j223;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j224 = r > 20;
const _j225 = g > 20;
const _j226 = b > 20;
if (_j224 && _j225 && _j226) return 'rgb';
if (_j224 && _j225) return 'rg';
if (_j224 && _j226) return 'rb';
if (_j225 && _j226) return 'gb';
if (_j224) return 'r';
if (_j225) return 'g';
if (_j226) return 'b';
return 'rgb';
}
function _j4() {
let _j227 = '// ============================================\n';
_j227 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j227 += '// ============================================\n';
_j222.forEach(color => {
const [r, g, b] = color.rgb;
const _j228 = `COLOR_${color.name.toUpperCase()}`;
_j227 += `const vec3 ${_j228} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j227 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j227;
}
function _j5() {
let _j227 = '';
_j222.forEach((color, _j315) => {
const _j228 = `COLOR_${color.name.toUpperCase()}`;
if (_j315 === 0) {
_j227 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j227 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j227 += `        brushColor = ${_j228};\n`;
});
_j227 += `    }\n`;
return _j227;
}
function _j6() {
return _j222.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j222.find(c => c.id === id);
}
function _j8(name) {
return _j222.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j222,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j229 = null;
let _j230 = 0;
const _j231 = 2000;
function _j9(_j533 = 120, _j1535 = 12, _j1536 = 10, _j1537 = 5) {
const _j232 = Math.min(width, _j231);
const _j233 = Math.min(height, _j231);
const _j234 = (width > _j231 || height > _j231);
randomSeed(seed);
const _j235 = _j10(_j533, _j1537);
const _j236 = createGraphics(_j232, _j233, P2D);
const _j237 = createGraphics(_j232, _j233, P2D);
for (let i = -_j533; i < _j232 + _j533; i += _j232 / 500) {
for (let j = -_j533; j < _j233 + _j533; j += _j1535) {
_j236.image(_j235, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1536);
}
}
_j235.remove();
if (doSpotNoise) {
padfactor = 300;
_j237.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j232)
y = random(_j233)
_j237.push()
_j237.strokeWeight(random(1, 2))
_j237.stroke(0, random(10, 250))
_j237.noFill();
_j237.bezier(
random(-padfactor, _j232 + padfactor),
random(-padfactor, _j233 + padfactor),
random(-padfactor, _j232 + padfactor),
random(-padfactor, _j233 + padfactor),
random(-padfactor, _j232 + padfactor),
random(-padfactor, _j233 + padfactor),
random(-padfactor, _j232 + padfactor),
random(-padfactor, _j233 + padfactor)
);
_j237.pop();
}
_j236.blendMode(DIFFERENCE);
_j236.image(_j237, 0, 0, _j232, _j233);
_j237.remove();
}
if (_j234) {
const _j238 = createGraphics(width, height);
_j238.image(_j236, 0, 0, width, height);
_j236.remove();
return _j238;
}
return _j236;
}
function _j10(_j1538 = 64, _j1537 = 0.5) {
const _j235 = createGraphics(_j1538, _j1538);
_j235.pixelDensity(1);
_j235.noSmooth();
_j235.clear();
_j235.noFill();
_j235.translate(_j1538 / 2, _j1538 / 2);
_j235.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j239 = 0.5 + crandom.random(0, 1) * 0.5;
const _j240 = pow(_j239, _j1537) * 255;
_j235.stroke(_j240, _j240, _j240, 255);
const radius = crandom.random() * _j1538 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j235.point(x, y);
}
_j235.resetMatrix();
return _j235;
}
let _j241 = [];
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
const _j242 = 8;
const _j243 = [];
for (let i = 0; i < _j242; i++) {
_j243.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j244 = floor(_j243[0].numCirclesRand);
for (let i = 0; i < _j244; i++) {
const _j245 = _j243[i];
circles.push({
x: cos(_j245.angle) * _j245.distance,
y: sin(_j245.angle) * _j245.distance,
radius: _j245.circleSize
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
const _j246 = [];
const _j247 = 3;
const _j248 = 48;
const _j243 = [];
const _j249 = crandom.random(1, 4);
const _j250 = crandom.random(0.4, 0.6);
const _j251 = floor(_j249);
for (let _j252 = 0; _j252 < _j247; _j252++) {
const _j253 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j252 * 500
};
_j243.push(_j253);
}
for (let _j252 = 0; _j252 < _j251; _j252++) {
const _j253 = _j243[_j252];
const offsetX = _j253.offsetX;
const offsetY = _j253.offsetY;
const layerRotation = _j253.layerRotation;
const sizeVariation = _j253.sizeVariation;
const _j254 = size * sizeVariation;
const _j255 = floor(_j253.numVerticesRand);
const noiseOffset = _j253.noiseOffset;
const _j256 = [];
for (let i = 0; i < _j255; i++) {
const angle = (i / _j255) * TWO_PI;
const _j257 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j258 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j259 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j260 = _j257 * 0.5 + _j258 * 0.3 + _j259 * 0.2;
const radius = _j254 * (0.4 + _j260 * _j250);
const _j261 = cos(angle) * radius;
const _j262 = sin(angle) * radius;
_j256.push({
x: _j261,
y: _j262
});
}
const _j263 = [];
for (let i = 0; i < _j256.length; i++) {
const _j264 = _j256[(i - 1 + _j256.length) % _j256.length];
const _j265 = _j256[i];
const _j219 = _j256[(i + 1) % _j256.length];
_j263.push({
x: (_j264.x + _j265.x * 2 + _j219.x) / 4,
y: (_j264.y + _j265.y * 2 + _j219.y) / 4
});
}
for (let v of _j263) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j266 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j246.push({
x: rotatedX + offsetX,
y: _j266 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j246
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j246 = [];
const _j247 = 3;
const _j243 = [];
const _j249 = crandom.random(1, 4);
const _j250 = crandom.random(0.15, 0.35);
const _j251 = floor(_j249);
let rotation = crandom.random(TWO_PI);
for (let _j252 = 0; _j252 < _j247; _j252++) {
const _j253 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j252 * 500
};
_j243.push(_j253);
}
for (let _j252 = 0; _j252 < _j251; _j252++) {
const _j253 = _j243[_j252];
const offsetX = _j253.offsetX;
const offsetY = _j253.offsetY;
const layerRotation = rotation + _j253.layerRotationOffset;
const sizeVariation = _j253.sizeVariation;
const _j254 = size * sizeVariation;
const lengthRatio = _j253.lengthRatio;
const _j267 = _j254 * lengthRatio;
const stripWidth = _j254 * _j253.stripWidth;
const _j255 = floor(_j253.numVerticesRand);
const noiseOffset = _j253.noiseOffset;
const _j256 = [];
for (let i = 0; i < _j255; i++) {
let _j261, _j262;
if (i < _j255 / 2) {
const _j268 = (i / (_j255 / 2));
_j261 = (_j268 - 0.5) * _j267;
const _j269 = noise(_j268 * 1.5 + noiseOffset, _j252 * 50);
_j262 = -stripWidth / 2 + (_j269 - 0.5) * stripWidth * _j250;
} else {
const _j268 = ((_j255 - 1 - i) / (_j255 / 2));
_j261 = (_j268 - 0.5) * _j267;
const _j269 = noise(_j268 * 1.5 + noiseOffset, 100 + _j252 * 50);
_j262 = stripWidth / 2 + (_j269 - 0.5) * stripWidth * _j250;
}
_j256.push({
x: _j261,
y: _j262
});
}
const _j263 = [];
for (let i = 0; i < _j256.length; i++) {
const _j264 = _j256[(i - 1 + _j256.length) % _j256.length];
const _j265 = _j256[i];
const _j219 = _j256[(i + 1) % _j256.length];
_j263.push({
x: (_j264.x + _j265.x * 2 + _j219.x) / 4,
y: (_j264.y + _j265.y * 2 + _j219.y) / 4
});
}
for (let v of _j263) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j266 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j246.push({
x: rotatedX + offsetX,
y: _j266 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j246
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j246 = [];
const _j270 = 2;
const _j271 = 30;
const _j272 = 8;
const _j273 = 300;
const _j243 = [];
const _j274 = crandom.random(1, 3);
const _j275 = floor(_j274);
for (let _j276 = 0; _j276 < _j270; _j276++) {
const _j277 = {
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
for (let step = 0; step < _j271; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j277.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j273; i++) {
_j277.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j243.push(_j277);
}
for (let _j276 = 0; _j276 < _j275; _j276++) {
const _j277 = _j243[_j276];
let branchAngle = _j277.branchAngle;
let branchOffsetX = _j277.branchOffsetX;
let branchOffsetY = _j277.branchOffsetY;
let _j278 = _j277.numLRand > 0.2 ? 1 : 2;
let _j279 = floor(_j277.numStepsRand) * _j278;
let stepSize = _j277.stepSize;
let noiseScale = _j277.noiseScale;
let noiseStrength = _j277.noiseStrength;
let thickness = _j277.thickness;
let pathPoints = [];
let _j280 = branchOffsetX;
let _j281 = branchOffsetY;
let _j282 = branchAngle;
pathPoints.push({
x: _j280,
y: _j281
});
for (let step = 0; step < _j279; step++) {
const stepRandoms = _j277.stepRandoms[step];
const t = step / _j279;
const _j283 = noise(step * noiseScale, seed * 0.01);
const _j284 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j283 - 0.5) * PI * noiseStrength;
_j282 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j285 = stepSize * stepVariation;
_j280 += cos(_j282) * _j285;
_j281 += sin(_j282) * _j285;
pathPoints.push({
x: _j280,
y: _j281
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j279 - 3) {
const _j286 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j282 + stepRandoms.subBranchAngle;
let _j287 = _j280;
let _j288 = _j281;
for (let _j289 = 0; _j289 < _j286; _j289++) {
const _j290 = noise(step * noiseScale + _j289 * 0.5, seed * 0.01 + 200);
const _j291 = (_j290 - 0.5) * PI * 0.5;
const _j292 = subBranchAngle + _j291;
_j287 += cos(_j292) * stepSize * 0.6;
_j288 += sin(_j292) * stepSize * 0.6;
pathPoints.push({
x: _j287,
y: _j288
});
}
}
}
const _j293 = [];
const _j294 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j295;
if (i === 0) {
const _j219 = pathPoints[i + 1];
_j295 = atan2(_j219.y - point.y, _j219.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j264 = pathPoints[i - 1];
_j295 = atan2(point.y - _j264.y, point.x - _j264.x) + HALF_PI;
} else {
const _j264 = pathPoints[i - 1];
const _j219 = pathPoints[i + 1];
const _j296 = atan2(point.y - _j264.y, point.x - _j264.x);
const _j297 = atan2(_j219.y - point.y, _j219.x - point.x);
_j295 = ((_j296 + _j297) / 2) + HALF_PI;
}
const _j298 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j299 = _j277.thicknessRandoms[Math.min(i, _j277.thicknessRandoms.length - 1)];
const _j300 = thickness * _j298 * _j299;
_j293.push({
x: point.x + cos(_j295) * _j300 / 2,
y: point.y + sin(_j295) * _j300 / 2
});
_j294.push({
x: point.x - cos(_j295) * _j300 / 2,
y: point.y - sin(_j295) * _j300 / 2
});
}
for (let v of _j293) {
_j246.push(v);
}
for (let i = _j294.length - 1; i >= 0; i--) {
_j246.push(_j294[i]);
}
}
return {
type: 'lightning',
vertices: _j246
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j246 = [];
const _j270 = 3;
const _j271 = 75;
const _j272 = 8;
const _j273 = 800;
const _j243 = [];
const _j274 = crandom.random(1, 4);
const _j275 = floor(_j274);
size = size * 3;
for (let _j276 = 0; _j276 < _j270; _j276++) {
const _j277 = {
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
for (let step = 0; step < _j271; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j277.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j273; i++) {
_j277.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j243.push(_j277);
}
for (let _j276 = 0; _j276 < _j275; _j276++) {
const _j277 = _j243[_j276];
let branchAngle = _j277.branchAngle;
let branchOffsetX = _j277.branchOffsetX;
let branchOffsetY = _j277.branchOffsetY;
let _j278 = _j277.numLRand > 0.2 ? 1 : 5;
let _j279 = floor(_j277.numStepsRand) * _j278;
let stepSize = _j277.stepSize;
let noiseScale = _j277.noiseScale;
let noiseStrength = _j277.noiseStrength;
let thickness = _j277.thickness;
let pathPoints = [];
let _j280 = branchOffsetX;
let _j281 = branchOffsetY;
let _j282 = branchAngle;
pathPoints.push({
x: _j280,
y: _j281
});
for (let step = 0; step < _j279; step++) {
const stepRandoms = _j277.stepRandoms[step];
const t = step / _j279;
const _j283 = noise(step * noiseScale, seed * 0.01);
const _j284 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j283 - 0.5) * PI * noiseStrength;
_j282 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j285 = stepSize * stepVariation;
_j280 += cos(_j282) * _j285;
_j281 += sin(_j282) * _j285;
pathPoints.push({
x: _j280,
y: _j281
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j279 - 3) {
const _j286 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j282 + stepRandoms.subBranchAngle;
let _j287 = _j280;
let _j288 = _j281;
for (let _j289 = 0; _j289 < _j286; _j289++) {
const _j290 = noise(step * noiseScale + _j289 * 0.5, seed * 0.01 + 200);
const _j291 = (_j290 - 0.5) * PI * 0.5;
const _j292 = subBranchAngle + _j291;
_j287 += cos(_j292) * stepSize * 0.6;
_j288 += sin(_j292) * stepSize * 0.6;
pathPoints.push({
x: _j287,
y: _j288
});
}
}
}
const _j293 = [];
const _j294 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j295;
if (i === 0) {
const _j219 = pathPoints[i + 1];
_j295 = atan2(_j219.y - point.y, _j219.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j264 = pathPoints[i - 1];
_j295 = atan2(point.y - _j264.y, point.x - _j264.x) + HALF_PI;
} else {
const _j264 = pathPoints[i - 1];
const _j219 = pathPoints[i + 1];
const _j296 = atan2(point.y - _j264.y, point.x - _j264.x);
const _j297 = atan2(_j219.y - point.y, _j219.x - point.x);
_j295 = ((_j296 + _j297) / 2) + HALF_PI;
}
const _j298 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j299 = _j277.thicknessRandoms[Math.min(i, _j277.thicknessRandoms.length - 1)];
const _j300 = thickness * _j298 * _j299;
_j293.push({
x: point.x + cos(_j295) * _j300 / 2,
y: point.y + sin(_j295) * _j300 / 2
});
_j294.push({
x: point.x - cos(_j295) * _j300 / 2,
y: point.y - sin(_j295) * _j300 / 2
});
}
for (let v of _j293) {
_j246.push(v);
}
for (let i = _j294.length - 1; i >= 0; i--) {
_j246.push(_j294[i]);
}
}
return {
type: 'lightning',
vertices: _j246
};
}
function _j17(buffer, shapeData, px, py, r, g, b, alpha) {
buffer.fill(r, g, b, alpha);
buffer.noStroke();
const scale = 1 / _j514;
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
function _j18(_j1539 = null, scanBounds = null, shapeType = null, _j1540 = null) {
let _j301 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j301 = crandom.getCount();
}
const w = _j1539 ? _j1539.width : width;
const h = _j1539 ? _j1539.height : height;
const d = _j1539 ? _j1539.pixelDensity() : pixelDensity();
const _j302 = 20;
const _j303 = 700;
const _j304 = 80;
let _j305 = canvasBackgroundColor[0];
let _j306 = canvasBackgroundColor[1];
let _j307 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j308 = _j1540 && _j1540.length > 0;
if (_j308) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1540.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j309 = _j1539 || window;
_j309.loadPixels();
pixels = _j1539 ? _j1539.pixels : window.pixels;
let _j310 = [];
const step = 4;
let _j311 = _j302;
let _j312 = w - _j302;
let _j313 = _j302;
let _j314 = h - _j302;
for (let y = _j313; y < _j314; y += step) {
for (let x = _j311; x < _j312; x += step) {
let _j315 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j315];
let g = pixels[_j315 + 1];
let b = pixels[_j315 + 2];
let a = pixels[_j315 + 3];
let brightness = r + g + b;
let _j316 = Math.abs(r - _j305) + Math.abs(g - _j306) + Math.abs(b - _j307);
if (a > 100 && brightness < _j303 && _j316 > _j304) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j310.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j310.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j310.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j310.sort((a, b) => a.brightness - b.brightness);
if (_j310.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j310.length} 個），無法生成蟲咬效果`);
return;
}
let _j317 = [];
for (let i = 0; i < _j310.length; i++) {
_j317.push(i);
}
const _j318 = Math.floor(_j310.length * 0.5);
const _j319 = _j317.slice(0, Math.max(_j318, 10));
for (let i = 0; i < 10 && _j319.length > 0; i++) {
const _j320 = [];
let _j321 = 0;
for (let j = 0; j < _j319.length; j++) {
const _j322 = Math.pow(1 - (j / _j319.length), 2);
_j320.push(_j322);
_j321 += _j322;
}
let _j323 = crandom.random(0, _j321);
let _j324 = 0;
let _j325 = 0;
for (let j = 0; j < _j320.length; j++) {
_j325 += _j320[j];
if (_j323 <= _j325) {
_j324 = j;
break;
}
}
const _j326 = _j319.splice(_j324, 1)[0];
targetPoints.push(_j310[_j326]);
}
if (typeof _j630 !== 'undefined' && _j630 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j327 = [];
const _j328 = 30;
const _j329 = 4;
let _j330 = 0;
const _j331 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j332 = [];
const _j243 = [];
const _j333 = [];
for (let _j334 = 0; _j334 < numBites; _j334++) {
const _j335 = [];
for (let _j336 = 0; _j336 < _j331; _j336++) {
_j335.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j243.push(_j335);
_j333.push({
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
let _j337 = 0;
let _j338 = false;
let _j339, _j340, distance;
const _j335 = _j243[i];
const _j341 = _j333[i];
if (_j308) {
const _j245 = _j335[0];
let r = sqrt(_j245.r) * _j328;
let angle = _j245.angle + _j245.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j339 = Math.floor(target.x + offsetX);
_j340 = Math.floor(target.y + offsetY);
_j339 = constrain(_j339, _j302, w - _j302);
_j340 = constrain(_j340, _j302, h - _j302);
_j338 = true;
for (let _j342 of _j332) {
let dist = Math.sqrt(
Math.pow(_j339 - _j342.x, 2) +
Math.pow(_j340 - _j342.y, 2)
);
if (dist < _j329) {
_j338 = false;
break;
}
}
} else {
while (!_j338 && _j337 < _j331) {
const _j245 = _j335[_j337];
let r = sqrt(_j245.r) * _j328;
let angle = _j245.angle;
angle += _j245.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j339 = Math.floor(target.x + offsetX);
_j340 = Math.floor(target.y + offsetY);
_j339 = constrain(_j339, _j302, w - _j302);
_j340 = constrain(_j340, _j302, h - _j302);
let _j326 = 4 * ((_j340 * d) * (w * d) + (_j339 * d));
let _j343 = pixels[_j326];
let _j344 = pixels[_j326 + 1];
let _j345 = pixels[_j326 + 2];
let _j346 = pixels[_j326 + 3];
let _j347 = _j343 + _j344 + _j345;
let _j348 = Math.abs(_j343 - _j305) + Math.abs(_j344 - _j306) + Math.abs(_j345 - _j307);
if (_j346 <= 100 || _j347 >= _j303 || _j348 <= _j304) {
_j338 = false;
_j337++;
if (_j337 >= _j331) {
_j330++;
}
continue;
}
_j338 = true;
for (let _j342 of _j332) {
let dist = Math.sqrt(
Math.pow(_j339 - _j342.x, 2) +
Math.pow(_j340 - _j342.y, 2)
);
if (dist < _j329) {
_j338 = false;
break;
}
}
_j337++;
}
}
let _j349 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j349 *= 1.3;
}
let _j350 = floor(target.x * 1000 + target.y * 333 + _j341.shapeSeedRand);
let _j351 = 0;
let _j352 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j351 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j349, _j350, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j352 = crandom.getCount();
if (!_j341.shapeRandomCount) {
_j341.shapeRandomCount = _j352 - _j351;
}
}
if (_j338) {
let r, g, b;
let _j353 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j353[0] < 0.2 && _j353[1] < 0.15 && _j353[2] < 0.1) {
r = Math.floor(38 + _j341.colorRand1 * (51 - 38));
g = Math.floor(31 + _j341.colorRand2 * (38 - 31));
b = Math.floor(20 + _j341.colorRand3 * (26 - 20));
} else {
r = 230 + _j341.colorRand1 * (255 - 230);
g = 160 + _j341.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j339,
y: _j340,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j349,
shapeData: shapeData
};
_j332.push(point);
_j327.push(point);
}
}
}
_j241 = _j241.concat(_j327);
let _j354 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j327) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j354++;
let _j355 = point.size || 2.5;
let _j356 = map(_j355, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j356
});
}
let _j357 = boidSpawners.slice(-_j354);
if (_j354 > 0) {
let sizeMultipliers = _j357.map(s => s.boidSizeMultiplier);
let _j358 = Math.min(...sizeMultipliers);
let _j359 = Math.max(...sizeMultipliers);
let _j360 = (_j354 / _j327.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j354} 個 Boid Spawners (虫咬點的 ${_j360}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j358.toFixed(2)} ~ ${_j359.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j327.length > 0) {
let _j361 = Infinity;
let _j362 = 0;
for (let point of _j327) {
let brightness = point.r + point.g + point.b;
_j361 = Math.min(_j361, brightness);
_j362 = Math.max(_j362, brightness);
}
if (_j330 > 0) {
console.log(`⚠️ 跳過了 ${_j330} 個不在筆墨區域的點`);
}
}
const _j363 = _j327.length;
if (_j363 > 0) {
_j112('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j363,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j364 = crandom.getCount();
const _j365 = _j364 - _j301;
if (typeof _j638 !== 'undefined' && _j638 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j366 = currentScanEvent.recordedRandomCount;
const _j208 = _j365 - _j366;
const percent = _j366 > 0 ? ((_j208 / _j366) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j208) < 50 ? '✅' : Math.abs(_j208) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j367 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j368 = typeof _j363 === 'number' ? ` | Points:${_j363}` : '';
console.log(`${icon} Scan [${action}] ${_j367} | 差異: ${_j208 > 0 ? '+' : ''}${_j208} (${percent})${_j368}`);
}
} else if (typeof _j630 !== 'undefined' && _j630) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j365;
}
}
}
}
function _j19(_j1541 = 10, shapeType = null) {
const _j302 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1541; i++) {
let x = crandom.random(_j302, w - _j302);
let y = crandom.random(_j302, h - _j302);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j327 = [];
const _j328 = 30;
const _j329 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j332 = [];
for (let i = 0; i < numBites; i++) {
let _j337 = 0;
let _j338 = false;
let _j339, _j340, distance;
while (!_j338 && _j337 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j328;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j339 = Math.floor(target.x + offsetX);
_j340 = Math.floor(target.y + offsetY);
_j339 = constrain(_j339, _j302, w - _j302);
_j340 = constrain(_j340, _j302, h - _j302);
_j338 = true;
for (let _j342 of _j332) {
let dist = Math.sqrt(
Math.pow(_j339 - _j342.x, 2) +
Math.pow(_j340 - _j342.y, 2)
);
if (dist < _j329) {
_j338 = false;
break;
}
}
_j337++;
}
if (_j338) {
let r, g, b;
let _j353 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j353[0] < 0.2 && _j353[1] < 0.15 && _j353[2] < 0.1) {
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
let _j350 = floor(_j339 * 1000 + _j340 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j339, _j340, size, _j350, shapeType);
let point = {
x: _j339,
y: _j340,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j332.push(point);
_j327.push(point);
}
}
}
_j241 = _j241.concat(_j327);
let _j354 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j327) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j354++;
let _j355 = point.size || 2.5;
let _j356 = map(_j355, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j356
});
}
}
if (_j327.length > 0) {
_j112('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j327.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1542 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j514);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j514);
}
const _j369 = _j1542 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j241.length;
if (!_j369) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j241) {
const px = point.x;
const py = point.y;
const _j370 = (point.size || 5) / _j514;
const _j371 = point.x / width;
const _j372 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j371 * 255, _j372 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j371 * 255, _j372 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j370, _j370);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j370, _j370);
}
}
const _j373 = {
pointCount: _j241.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j373;
window.bugsMaskTextureCache = _j373;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j309, _j1539) {
if (_j241.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j374 = _j20();
let _j375 = _j374.dataTexture;
let _j376 = _j374.maskTexture;
_j309.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1539);
window.metallicProgram.setUniform('bugsMask', _j376);
window.metallicProgram.setUniform('bugsData', _j375);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j514, height * _j514]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j377 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j378 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j379 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j380 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j381 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j377);
window.metallicProgram.setUniform('lightPos', [_j380, _j381]);
window.metallicProgram.setUniform('specularPower', _j378);
window.metallicProgram.setUniform('fresnelStrength', _j379);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j309.end();
}
let _j382 = null;
let __lastGridParams = null;
function _j22(x1, y1, x2, y2, _j1543, _j1544) {
const d = dist(x1, y1, x2, y2);
if (d < 1) return;
const dx = (x2 - x1) / d, dy = (y2 - y1) / d;
let pos = 0, draw = true;
while (pos < d) {
const _j383 = draw ? _j1543 : _j1544;
const end = Math.min(pos + _j383, d);
if (draw) line(x1 + dx * pos, y1 + dy * pos, x1 + dx * end, y1 + dy * end);
pos = end;
draw = !draw;
}
}
function gridCommitPrev() {
if (__lastGridParams) {
_j382 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j23(cx, cy, _j508, _j509) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j508 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j583 !== 'undefined' && _j583 !== null) {
if (_j583.minX < minX) minX = _j583.minX;
if (_j583.maxX > maxX) maxX = _j583.maxX;
if (_j583.minY < minY) minY = _j583.minY;
if (_j583.maxY > maxY) maxY = _j583.maxY;
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
const _j384 = effCell * 0.3;
const _j385 = (maxX - minX) + _j384 * 2;
const _j386 = (maxY - minY) + _j384 * 2;
const _j387 = (minX + maxX) * 0.5;
const _j388 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j384) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j384) / effCell) * effCell);
const _j389 = Math.min(width, Math.ceil((maxX + _j384) / effCell) * effCell);
const _j390 = Math.min(height, Math.ceil((maxY + _j384) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j389 - left);
let gridHeight = Math.max(effCell * 2, _j390 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j382 && typeof _j638 !== 'undefined' && _j638) {
const pg = _j382;
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
if (_j509) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j509) {
const _j391 = 12;
const _j392 = left + 8;
const _j393 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j392 - _j391 / 2, _j393, _j392 + _j391 / 2, _j393);
line(_j392, _j393 - _j391 / 2, _j392, _j393 + _j391 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j509) {
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
const _j394 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j395 = typeof _j578 === 'number' ? _j578 : 0;
const _j396 = typeof brushDir === 'number' ? brushDir : 0;
const _j397 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j398 = _j397[_j396] || '?';
const countdownText = `Max: ${_j394} | Count: ${_j395} | Dir: ${_j396}(${_j398})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j399 = typeof _j579 === 'number' ? _j579 : 0;
const _j400 = typeof brushMode === 'number' ? brushMode : 0;
const _j401 = (typeof _j539 === 'number' && _j539 > 0) ? _j539 : (typeof _j555 === 'number' ? _j555 : effCell);
const _j402 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j403 = `C: ${_j399} | B: ${_j400} | S: ${_j401.toFixed(1)} | P: ${_j402}`;
const _j404 = left;
const _j405 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j403, _j404, _j405);
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
function _j24(buffer) {
const _j406 = typeof buffer.begin === 'function';
if (_j406) buffer.begin();
const g = _j406 ? window : buffer;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j407 = 5;
const _j408 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j912 = true;
_j887 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j409 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j409;
let dy = (y2 - y1) / _j409;
let _j410 = 0;
while (_j410 < _j409) {
let _j411 = _j912 ? _j407 : _j408;
let _j412 = min(_j411 - _j887, _j409 - _j410);
if (_j912) {
let startX = x1 + dx * _j410;
let startY = y1 + dy * _j410;
let _j413 = x1 + dx * (_j410 + _j412);
let _j414 = y1 + dy * (_j410 + _j412);
g.line(startX, startY, _j413, _j414);
}
_j410 += _j412;
_j887 += _j412;
if (_j887 >= (_j912 ? _j407 : _j408)) {
_j912 = !_j912;
_j887 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j415 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j415.x, _j415.y, 10, 10);
}
g.pop();
if (_j406) buffer.end();
}
function _j25() {
const _j416 = 10;
if (typeof _j563 !== 'undefined' && _j563 && typeof _j567 !== 'undefined' && _j567) {
noFill();
stroke(0, 180, 0, 180);
strokeWeight(1.5);
if (_j567.action === 'rect') {
const _j417 = _j567.x1 + _j416, _j418 = _j567.y1 + _j416;
const _j419 = _j567.x2 + _j416, _j420 = _j567.y2 + _j416;
_j22(_j417, _j418, _j419, _j418, 6, 4);
_j22(_j419, _j418, _j419, _j420, 6, 4);
_j22(_j419, _j420, _j417, _j420, 6, 4);
_j22(_j417, _j420, _j417, _j418, 6, 4);
} else if (_j567.action === 'polygon' && _j567.points && _j567.points.length >= 3) {
const _j421 = _j567.points;
for (let i = 0; i < _j421.length; i++) {
const a = _j421[i], b = _j421[(i + 1) % _j421.length];
_j22(a.x + _j416, a.y + _j416, b.x + _j416, b.y + _j416, 6, 4);
}
}
fill(0, 180, 0, 200);
noStroke();
if (typeof font !== 'undefined' && font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
const _j422 = (_j567.action === 'rect' ? _j567.x1 : (_j567.points ? _j567.points[0].x : 0)) + _j416;
const _j423 = (_j567.action === 'rect' ? _j567.y1 - 12 : (_j567.points ? _j567.points[0].y - 12 : 0)) + _j416;
text('MASK', _j422, _j423);
}
if (typeof _j562 !== 'undefined' && _j562 && typeof _j564 !== 'undefined' && _j564 === 'rect' &&
typeof _j565 !== 'undefined' && _j565 && _j565.x1 !== undefined && mouseIsPressed) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
const _j424 = Math.min(_j565.x1, mouseX - 10) + _j416;
const _j425 = Math.min(_j565.y1, mouseY - 10) + _j416;
const _j426 = Math.max(_j565.x1, mouseX - 10) + _j416;
const _j427 = Math.max(_j565.y1, mouseY - 10) + _j416;
_j22(_j424, _j425, _j426, _j425, 4, 3);
_j22(_j426, _j425, _j426, _j427, 4, 3);
_j22(_j426, _j427, _j424, _j427, 4, 3);
_j22(_j424, _j427, _j424, _j425, 4, 3);
}
if (typeof _j562 !== 'undefined' && _j562 && typeof _j564 !== 'undefined' && _j564 === 'polygon' &&
typeof _j566 !== 'undefined' && _j566.length > 0) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
for (let i = 0; i < _j566.length - 1; i++) {
const a = _j566[i], b = _j566[i + 1];
_j22(a.x + _j416, a.y + _j416, b.x + _j416, b.y + _j416, 4, 3);
}
noStroke();
fill(0, 200, 0, 150);
for (let p of _j566) {
ellipse(p.x + _j416, p.y + _j416, 6, 6);
}
}
}
function _j26() {
if ((!_j638 || isWaitingToLoop) && _j652 !== null && doMoving) {
const _j428 = easycamInitialCenter || [0, 0, 0];
const _j429 = PI / 3;
const _j430 = height / (2 * tan(_j429 / 2));
const _j431 = easycamInitialDistance > 0 ? easycamInitialDistance : _j430;
const _j432 = _j652.getCenter();
const _j433 = _j652.getDistance();
const _j434 = 0.1;
const _j435 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j432[0] - _j428[0], 2) +
Math.pow(_j432[1] - _j428[1], 2) +
Math.pow(_j432[2] - _j428[2], 2)
);
const distanceDiff = Math.abs(_j433 - _j431);
if (!_j665 && (centerDiff > _j434 || distanceDiff > _j435)) {
_j665 = true;
_j666 = millis();
_j663 = [_j432[0], _j432[1], _j432[2]];
_j667 = _j433;
_j664 = _j428;
_j668 = _j431;
}
if (_j665) {
const _j436 = millis() - _j666;
const _j437 = Math.min(_j436 / _j669, 1.0);
const _j438 = [
lerp(_j663[0], _j664[0], _j437),
lerp(_j663[1], _j664[1], _j437),
lerp(_j663[2], _j664[2], _j437)
];
const _j439 = lerp(_j667, _j668, _j437);
_j652.setCenter(_j438, 0);
_j652.setDistance(_j439, 0);
if (_j437 >= 1.0) {
const _j440 = _j652.getCenter();
const _j441 = _j652.getDistance();
const _j442 = Math.sqrt(
Math.pow(_j440[0] - _j428[0], 2) +
Math.pow(_j440[1] - _j428[1], 2) +
Math.pow(_j440[2] - _j428[2], 2)
);
const _j443 = Math.abs(_j441 - _j431);
if (_j442 > _j434 || _j443 > _j435) {
_j652.setCenter(_j428, 0);
_j652.setDistance(_j431, 0);
}
_j665 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j638 && !isWaitingToLoop && doMoving && _j653 && _j652 !== null && _j654 && !_j665) {
const _j444 = _j642;
const _j445 = _j643;
const _j446 = _j444 - hw;
const _j447 = -(_j445 - hh);
const _j432 = _j652.getCenter();
const _j280 = _j432[0];
const _j281 = _j432[1];
const _j433 = _j652.getDistance();
const _j429 = PI / 3;
const _j448 = height / (2 * tan(_j429 / 2));
const _j449 = 1.1;
let _j450 = 1.4;
const _j329 = _j448 / _j450;
const _j451 = _j448 / _j449;
const _j452 = _j448 / _j433;
const _j453 = 0.01;
if (_j660) {
const _j454 = _j450;
const _j455 = _j448 / _j454;
const distanceDiff = _j455 - _j433;
const _j456 = _j656;
const _j457 = _j433 + distanceDiff * _j456;
const _j458 = constrain(_j457, _j329, _j451);
_j652.setDistance(_j458, 0);
} else {
const _j455 = _j448 / _j449;
const distanceDiff = _j455 - _j433;
const _j456 = _j656;
const _j457 = _j433 + distanceDiff * _j456;
const _j458 = constrain(_j457, _j329, _j451);
_j652.setDistance(_j458, 0);
}
const _j459 = _j652.getDistance();
const _j460 = _j448 / _j459;
let _j461 = 0;
let _j462 = 0;
if (_j460 > _j449) {
_j461 = (_j460 - _j449) * (width / 2);
_j462 = (_j460 - _j449) * (height / 2);
}
let offsetX = _j446 - _j280;
let offsetY = _j447 - _j281;
if (_j461 > 0 || _j462 > 0) {
const _j463 = constrain(_j446, -_j461, _j461);
const _j464 = constrain(_j447, -_j462, _j462);
offsetX = _j463 - _j280;
offsetY = _j464 - _j281;
} else {
offsetX = -_j280;
offsetY = -_j281;
}
const _j465 = _j655;
const _j339 = _j280 + offsetX * _j465;
const _j340 = _j281 + offsetY * _j465;
let _j466 = _j339;
let _j467 = _j340;
if (_j461 > 0 || _j462 > 0) {
_j466 = constrain(_j339, -_j461, _j461);
_j467 = constrain(_j340, -_j462, _j462);
} else {
_j466 = 0;
_j467 = 0;
}
_j652.setCenter([_j466, _j467, 0], 0);
}
}
function _j27() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j653 = false;
return;
}
if (_j652 !== null) {
_j653 = true;
return;
}
try {
const _j468 = _renderer;
if (!_j468) {
console.error('❌ WEBGL renderer not found');
_j653 = false;
return;
}
const _j429 = PI / 3;
const _j448 = height / (2 * tan(_j429 / 2));
_j652 = new Dw.EasyCam(_j468, {
distance: _j448,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j652.setRotationConstraint(0, 0, 0);
_j652.setRotationScale(0);
_j661 = _j448 / 2.5;
_j662 = _j448 / 1.0;
_j652.setDistanceMin(_j661);
_j652.setDistanceMax(_j662);
document.oncontextmenu = function() {
return false;
};
_j653 = true;
_j112('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j653 = false;
_j652 = null;
}
}
function applyCameraProjection() {
const _j469 = doMoving && _j653 && _j652 !== null && _j638 && _j654;
if (_j469) {
const _j470 = PI / 3;
const _j471 = 0.1;
const _j472 = 10000;
perspective(_j470, width / height, _j471, _j472);
push();
} else {
const _j473 = PI / 3;
const _j474 = 0.1;
const _j475 = 10000;
perspective(_j473, width / height, _j474, _j475);
}
}
let _j476 = null;
let _j477 = null;
let _j478 = 0,
_j479 = 0,
_j480 = 0;
let _j481 = {
feedback: {},
composite: {},
realtime: {}
};
function _j28(_j1545, _j1546, name, value) {
const _j482 = _j481[_j1546];
if (_j482[name] === value) return;
_j482[name] = value;
_j1545.setUniform(name, value);
}
function _j29() {
if (_j478 !== width || _j479 !== height || _j480 !== _j514) {
_j476 = [0, 0, width * _j514, height * _j514];
_j477 = [1.0 / (width * _j514), 1.0 / (height * _j514)];
_j478 = width;
_j479 = height;
_j480 = _j514;
}
if (_j476 === null) {
_j476 = [0, 0, width * _j514, height * _j514];
_j477 = [1.0 / (width * _j514), 1.0 / (height * _j514)];
}
}
function _j30(buffer, _j1547 = 1.0) {
if (_j599) {
_j575 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
pingPongBuffer.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j517);
const _j483 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j517.setUniform("rect", _j476);
_j517.setUniform("invResolution", _j477);
_j517.setUniform("tex0", buffer);
_j28(_j517, 'feedback', "brushMode", brushMode * 1.0);
_j517.setUniform("forceMap", _j515);
_j28(_j517, 'feedback', "baseBrushSize", baseBrushSize);
_j517.setUniform("force", _j1547);
_j28(_j517, 'feedback', "useSharpen", useSharpen);
_j28(_j517, 'feedback', "effect3Brightness", effect3Brightness);
_j28(_j517, 'feedback', "indiffusionStrength", indiffusionStrength);
_j28(_j517, 'feedback', "brushColorMode", float(brushColorMode));
_j28(_j517, 'feedback', "brushCategory", _j483);
const _j484 = typeof _j581 !== 'undefined' ? _j581 : 0;
const _j485 = (_j579 + _j484) % 40;
const _j486 = _j579 + _j484;
_j517.setUniform("mouseCount", float(_j485));
_j517.setUniform("mouseCountAccumulated", float(_j486));
_j517.setUniform("strokeSeed", float(strokeSeed));
_j517.setUniform("useMask", _j563 ? 1.0 : 0.0);
if (_j563) _j517.setUniform("maskTex", _j561);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
buffer.begin();
imageMode(CENTER);
blendMode(BLEND);
image(pingPongBuffer, 0, 0, width, height);
buffer.end();
_j575 = true;
}
function _j31() {
if (typeof _j626 === 'undefined' || !_j626) {
return;
}
const _j487 = canvasBackgroundColor;
let _j488 = _j9(40, 20, 15, 0.2);
const _j489 = min(255, _j487[0] * 1.1);
const _j490 = min(255, _j487[1] * 1.1);
const _j491 = min(255, _j487[2] * 1.1);
_j626.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j489, _j490, _j491);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j488, -width / 2, -height / 2, width, height);
_j626.end();
_j488.remove();
}
function _j32() {
const _j487 = canvasBackgroundColor;
if (typeof _j627 !== 'undefined' && _j627) {
_j627.begin();
background(_j487[0], _j487[1], _j487[2]);
_j627.end();
}
_j31();
if (typeof _j575 !== 'undefined') {
_j575 = true;
}
}
function updateCompositeBuffer() {
const _j492 = _j575 || _j556 || _j557 || _j638 || _j681;
if (_j492) {
_j624.begin();
clear();
shader(_j520);
_j29();
_j520.setUniform("rect", _j476);
_j520.setUniform("baseTex", showPaperTexture ? _j626 : _j627);
_j520.setUniform("encodedTex", finalBuffer);
_j520.setUniform("typeMapTex", typeMapBuffer);
_j520.setUniform("oldTex", oldBuffer);
_j28(_j520, 'composite', "brushColorMode", float(brushColorMode));
_j28(_j520, 'composite', "whiteMaxOpacity", _j525);
_j28(_j520, 'composite', "hueShift", _j526);
_j28(_j520, 'composite', "satShift", _j527);
_j28(_j520, 'composite', "briShift", _j528);
_j28(_j520, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j28(_j520, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j624.end();
if (_j556 || _j557) {
_j628.begin();
clear();
imageMode(CENTER);
image(_j624, 0, 0, width, height);
_j628.end();
_j624.begin();
shader(_j518);
const _j493 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j518.setUniform("rect", _j476);
_j518.setUniform("baseTex", _j628);
_j518.setUniform("addTex", newBufferBlack);
_j518.setUniform("encodedTex", finalBuffer);
_j28(_j518, 'realtime', "brushColorMode", float(brushColorMode));
_j28(_j518, 'realtime', "whiteMaxOpacity", _j525);
_j28(_j518, 'realtime', "hueShift", _j526);
_j28(_j518, 'realtime', "satShift", _j527);
_j28(_j518, 'realtime', "briShift", _j528);
_j28(_j518, 'realtime', "brushCategory", _j493);
_j28(_j518, 'realtime', "useSharpen", useSharpen);
let _j494;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j494 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j223[brushColorMode] || _j223[0];
_j494 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j518.setUniform("brushColor", _j494);
_j518.setUniform("useMask", _j563 ? 1.0 : 0.0);
if (_j563) _j518.setUniform("maskTex", _j561);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j624.end();
}
_j575 = _j556 || _j557 || _j638 || _j681;
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
const _j495 = (_j556 || _j557) && _j578 < maxUpdates && _j584;
const _j496 = !_j638 || showFuturePathPreview;
const _j497 = _j495 && showGridOverlay;
const _j498 = (typeof _j563 !== 'undefined' && _j563) ||
(typeof _j562 !== 'undefined' && _j562);
const _j499 = (typeof window !== 'undefined' && window.testMode === true);
if (_j495 || _j498 || _j499) {
_j625.begin();
clear();
push();
translate(-hw, -hh);
const _j500 = -10;
translate(_j500, _j500);
if (_j499) {
const _j416 = 10;
const _j501 = 4;
noFill();
stroke(255, 0, 0, 220);
strokeWeight(2);
const _j502 = _j501 + _j416, _j503 = _j501 + _j416;
const _j504 = width - _j501 + _j416, _j505 = height - _j501 + _j416;
_j22(_j502, _j503, _j504, _j503, 10, 6);
_j22(_j504, _j503, _j504, _j505, 10, 6);
_j22(_j504, _j505, _j502, _j505, 10, 6);
_j22(_j502, _j505, _j502, _j503, 10, 6);
}
if (_j497) {
const _j506 = _j638 ? _j642 : _j551;
const _j507 = _j638 ? _j643 : _j552;
const cx = (_j553 || _j553 === 0) ? _j553 : _j506;
const cy = (_j554 || _j554 === 0) ? _j554 : _j507;
const _j508 = _j555;
const _j509 = typeof _j600 !== 'undefined' && _j600;
_j23(cx, cy, _j508, _j509);
} else if (_j498) {
_j25();
}
if (pathPoints.length > 1 && _j496) {
const _j407 = 5;
const _j408 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j912 = true;
_j887 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j409 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j409;
let dy = (y2 - y1) / _j409;
let _j410 = 0;
while (_j410 < _j409) {
let _j411 = _j912 ? _j407 : _j408;
let _j412 = min(_j411 - _j887, _j409 - _j410);
if (_j912) {
let startX = x1 + dx * _j410;
let startY = y1 + dy * _j410;
let _j413 = x1 + dx * (_j410 + _j412);
let _j414 = y1 + dy * (_j410 + _j412);
line(startX, startY, _j413, _j414);
}
_j410 += _j412;
_j887 += _j412;
if (_j887 >= (_j912 ? _j407 : _j408)) {
_j912 = !_j912;
_j887 = 0;
}
}
}
}
if (_j496 && _j495) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j510 = _j638 ? _j642 : _j551;
const _j511 = _j638 ? _j643 : _j552;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j510, _j511, 10, 10);
}
pop();
_j625.end();
}
}
let _j512 = window._demoCanvasWidth || 900,
_j513 = window._demoCanvasHeight || 900,
hw, hh, _j514 = 1.6;
let _j515, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j516, _j517, _j518, _j519, _j520, _j521;
let _j522;
let _j523;
const _j223 = _j2();
let colorIndex = 0,
_j524 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j525 = 0.95;
let _j526 = 0.0,
_j527 = 0.0,
_j528 = 0.0;
let customBrushColor = [26, 26, 26];
let _j529, _j530, _j531, _j532, _j533;
let _j534, _j535, _j536, _j537, _j538, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j539 = 0,
_j540 = 2,
_j541 = 0;
let brushMode = 1,
_j542 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j543 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j544 = [];
let x, y, _j446, _j447, _j545, _j546, _j547, _j548 = 0,
_j549 = 0;
let _j550;
let _j551 = 0,
_j552 = 0,
_j553 = 0,
_j554 = 0,
_j555 = 20;
let _j556 = false,
_j557 = false,
_j558 = false,
_j559 = false;
let _j560 = true;
let useSpectralMix = false;
let _j561;
let _j562 = false;
window.resetBrushPositionToMouse = function() {
if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') return;
const px = _j188(mouseX);
const py = _j188(mouseY);
_j551 = px;
_j552 = py;
_j553 = px;
_j554 = py;
_j642 = px;
_j643 = py;
_j644 = px;
_j645 = py;
};
let _j563 = false;
let _j564 = 'rect';
let _j565 = null;
let _j566 = [];
let _j567 = null;
Object.defineProperty(window, 'spectral', {
get() { return useSpectralMix; },
set(v) {
useSpectralMix = !!v;
console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
}
});
window.getAgentPathData = function() {
return {
active: _j576,
paths: _j577,
pointCount: _j577.filter(p => !p.stroke).length,
strokeCount: _j577.filter(p => p.stroke).length,
canvasSize: { w: typeof width !== 'undefined' ? width : 0, h: typeof height !== 'undefined' ? height : 0 },
timestamp: Date.now()
};
};
let _j568 = 1.0,
_j569 = false,
_j570 = 0.0;
let _j571 = [0, 0, 0];
function _j34(v) {
_j571[0] = _j571[1];
_j571[1] = _j571[2];
_j571[2] = v;
const a = _j571[0], b = _j571[1], c = _j571[2];
return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}
let _j572 = null;
let _j573 = false,
_j574 = false,
_j575 = true;
let _j576 = false;
let _j577 = [];
let _j578 = 0,
maxUpdates = 10,
force = 1.0;
let _j579 = 0,
_j580 = 0,
_j581 = 0;
var doMoving = false,
_j582 = false;
let pathPoints = [],
_j583 = null,
startX = 0,
startY = 0,
_j584 = false;
let _j585 = 1,
pathRotation = 20;
let randStep = 1,
_j586 = 10,
expectedStrokeLength = 100;
let allBrushStrokes = [],
totalStrokeCount = 0,
_j587 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j588;
var currentStrokeHighlight = null;
let _j589 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j590 = 140.0,
_j591 = 0.5,
_j592 = 1.0,
_j593 = 0.5,
_j594 = 60.0;
let cellularEnabled = false,
_j595 = 15.0,
_j596 = 0.5;
let whiteDotEnabled = false,
_j597 = 0.01;
let grainEnabled = false,
_j598 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j599 = false;
let _j600 = false;
let _j601 = 0;
let _j602 = 0;
let _j603 = 0;
let _j604 = 50;
let _j605 = 0;
var flowEffectStrokeBounds = null;
let _j606 = false;
let _j607 = null;
let _j608 = 0;
var _j609 = 0;
var _j610 = 0;
let _j611 = false;
const _j612 = 3;
var _j613 = {
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
var _j614 = false;
let _j615 = [0, 0, 0, 0],
_j616 = [0, 0, 0],
_j617 = [0, 0, 0],
_j618 = [0, 0, 0];
let _j619 = [0, 0],
_j620 = [0, 0],
effect3Brightness = 0.2;
let oldBuffer, _j621, finalBuffer, newBufferBlack, _j622, _j623, _j624;
let pingPongBuffer, _j625, _j626, _j627;
let _j628;
let _j629;
let typeMapBuffer;
let _j630 = false,
_j631 = 0,
_j632 = null,
_j633 = 0;
let _j634 = 0,
_j635 = 0,
_j636 = true,
_j637 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j638 = false,
_j639 = 0,
_j640 = 0,
_j641 = 1.0;
let _j642 = 0,
_j643 = 0,
_j644 = 0,
_j645 = 0;
let _j646 = false,
isWaitingToLoop = false,
_j647 = 0;
let _j648 = 0,
_j649 = false;
let _j650 = 0,
_j651 = 0;
let _j652 = null,
_j653 = false,
_j654 = false;
let _j655 = 0.05,
_j656 = 0.05;
let _j657 = 0,
_j658 = 0;
let _j659 = 1,
_j660 = false;
let _j661 = 0,
_j662 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j663 = [0, 0, 0],
_j664 = [0, 0, 0];
let _j665 = false,
_j666 = 0,
_j667 = 0,
_j668 = 0,
_j669 = 1000;
let _j670 = false,
_j671 = 0;
let _j672 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j673 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j674 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j675 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j676 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j677 = 0,
_j678 = 300;
let _j679 = false,
_j680 = false;
let _j681 = false,
_j682 = 0,
frameCount = 0,
_j683 = [];
let _j684 = 1,
_j685 = 0.8;
let _j686 = true,
_j687 = [],
_j688 = 100,
isDragging = false;
let _j689 = {
x: 0,
y: 0
},
_j690 = {
x: 85,
y: 50
};
let _j691 = false,
_j692 = {
x: 0,
y: 0
},
_j693 = {
x: 15,
y: 50
},
_j694 = true;
let _j695 = false,
_j696 = {
x: 0,
y: 0
},
_j697 = {
x: 85,
y: 70
},
_j698 = true;
let _j699 = false,
_j700 = {
x: 0,
y: 0
},
_j701 = {
x: 85,
y: 40
},
_j702 = true;
let _j703 = false,
_j704 = {
x: 0,
y: 0
},
_j705 = {
x: 15,
y: 40
},
_j706 = true;
let _j707 = 10;
var screenText = false,
_j708 = [],
_j709 = 30,
_j710 = 0;
let _j711 = 25,
_j712 = 30,
_j713 = 16,
_j714 = 200,
_j715 = 200;
let _j716 = false,
_j717 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j517 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j518 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j516 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j521 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j523 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j173();
if (doDemo) {
_j181('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j588 = window._preloadedDemo;
recordingData = _j588;
window._pendingAutoPlay = true;
} else if (window._preloadedDemoPromise) {
var _j718 = (typeof window._incrementPreload === 'function' && typeof window._decrementPreload === 'function');
if (_j718) window._incrementPreload();
window._preloadedDemoPromise.then(function (data) {
if (data && data.events && data.events.length > 0) {
_j588 = data;
recordingData = _j588;
if (!_j718 && window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
} else {
_j112('system', '❌ Demo recording unavailable (async load failed)', {
Status: 'Error'
});
}
if (_j718) window._decrementPreload();
});
} else {
var _j719 = './lib/demo.json';
var _j720 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j720)) {
_j719 = './lib/' + _j720 + '.json';
}
fetch(_j719)
.then(_j1568 => {
if (!_j1568.ok) throw new Error('HTTP ' + _j1568.status);
return _j1568.json();
})
.then(data => {
_j588 = data;
if (_j588 && _j588.events && _j588.events.length > 0) {
recordingData = _j588;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j112('system', '❌ Failed to load ' + _j719, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j721 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j722 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j721) {
try {
const loadedData = JSON.parse(_j721);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j722 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j723 = sessionStorage.getItem('pendingRecordingData');
const _j724 = sessionStorage.getItem('shouldAutoPlay');
if (_j723 && _j724 === 'true') {
try {
const loadedData = JSON.parse(_j723);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j181('📂 Recording Data Restored After Reload');
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
if (window._demoCanvasWidth && window._demoCanvasHeight) {
_j512 = window._demoCanvasWidth;
_j513 = window._demoCanvasHeight;
}
if (window._demoCanvasBgColor && Array.isArray(window._demoCanvasBgColor) && window._demoCanvasBgColor.length === 3) {
canvasBackgroundColor[0] = window._demoCanvasBgColor[0];
canvasBackgroundColor[1] = window._demoCanvasBgColor[1];
canvasBackgroundColor[2] = window._demoCanvasBgColor[2];
}
const _j725 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j726 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
if (_j726 && window.APP_MODE === 'collector') {
document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:24px;text-align:center;font-family:system-ui;background:#f5f5f5;">' +
'<div><p style="font-size:48px;margin:0 0 16px;">🖥</p>' +
'<p style="font-size:18px;font-weight:600;margin:0 0 8px;">Please use a tablet or computer</p>' +
'<p style="font-size:14px;color:#666;margin:0;">This artwork requires more GPU memory than your phone can provide. Open this link on an iPad or desktop browser for the full experience.</p></div></div>';
noLoop();
return;
}
const _j727 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j727) {
const _j728 = parseFloat(_j727[1]);
if (!isNaN(_j728) && _j728 >= 0.5 && _j728 <= 5) {
_j514 = _j728;
_j112('system', '🔗 Pixel density from URL', {
Value: _j728
});
}
} else if (window.APP_MODE === 'collector') {
_j514 = 2;
_j112('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j725) {
const _j729 = 1.0;
if (_j514 > _j729) {
_j514 = _j729;
_j112('system', '📱 Mobile pixel density override', {
Value: _j729,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j730 = sessionStorage.getItem('pendingPixelDensity');
if (_j730 && !_j725 && !_j727) {
const _j731 = parseInt(_j730);
if (!isNaN(_j731) && _j731 >= 1 && _j731 <= 5) {
_j514 = _j731;
sessionStorage.removeItem('pendingPixelDensity');
_j112('system', '🔄 Restoring pixel density from session', {
Value: _j731,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j514);
const _j732 = sessionStorage.getItem('pendingCanvasWidth');
const _j733 = sessionStorage.getItem('pendingCanvasHeight');
let _j734 = false;
if (_j732 && _j733) {
_j512 = parseInt(_j732);
_j513 = parseInt(_j733);
_j734 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j112('system', '🔄 Restoring canvas size from recording', {
Width: `${_j512}px`,
Height: `${_j513}px`
});
}
let _j735 = false,
_j736 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j737 = qs.substring(1).split('_');
for (var i = 0; i < _j737.length; i++) {
var ci = _j737[i].indexOf(':');
if (ci === -1) continue;
var k = _j737[i].substring(0, ci), v = parseInt(_j737[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j512 = v;
_j735 = true;
}
if (k === 'h' && v > 0) {
_j513 = v;
_j736 = true;
}
}
})();
if (_j726 && window.APP_MODE === 'artist' && !_j734) {
if (!_j735) _j512 = 380;
if (!_j736) _j513 = 600;
if (!_j735 || !_j736) {
_j112('system', '📱 Mobile phone default canvas size', {
Width: `${_j512}px`,
Height: `${_j513}px`
});
}
}
const _j738 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j738) {
try {
const _j487 = JSON.parse(_j738);
if (Array.isArray(_j487) && _j487.length === 3) {
canvasBackgroundColor[0] = _j487[0];
canvasBackgroundColor[1] = _j487[1];
canvasBackgroundColor[2] = _j487[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j112('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j487[0]}, ${_j487[1]}, ${_j487[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j512, _j513, WEBGL);
if (_j560) {
const _j739 = document.querySelector('canvas');
if (_j739) {
const _j740 = document.getElementById('zen-mode-btn');
const _j741 = (pressure) => {
if (!_j740) return;
if (pressure <= 0) {
_j740.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j740.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j742 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j569) {
_j569 = true;
_j112('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j570 = _j34(e.pressure);
_j568 = Math.min(_j570 / 0.3, 1.0);
_j741(_j570);
}
};
_j739.addEventListener('pointerdown', _j742);
_j739.addEventListener('pointermove', _j742);
_j739.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j569) {
_j570 = 0.0;
_j571[0] = _j571[1] = _j571[2] = 0;
_j568 = -1;
_j741(0);
}
});
const _j743 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j744 = t.touchType === 'stylus';
if (_j744 && t.force > 0) {
const _j745 = Math.min(t.force, 1.0);
if (!_j569) {
_j569 = true;
_j112('system', '🖊️ Stylus force detected', { force: t.force });
}
_j570 = _j34(_j745);
_j568 = Math.min(_j570 / 0.3, 1.0);
_j741(_j570);
}
}
};
_j739.addEventListener('touchstart', _j743, { passive: true });
_j739.addEventListener('touchmove', _j743, { passive: true });
_j739.addEventListener('touchend', () => {
if (_j569) {
_j570 = 0.0;
_j571[0] = _j571[1] = _j571[2] = 0;
_j568 = -1;
_j741(0);
}
}, { passive: true });
}
}
_j515 = createFramebuffer({
density: _j514
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
_j153();
_j145();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j144 === 'function') {
_j144();
}
_j47();
window.addEventListener('resize', function() {
setTimeout(_j47, 100);
});
_j181('Interactive Generative Art System');
oldBuffer = createFramebuffer({
density: _j514
});
oldBuffer.begin();
background(255);
oldBuffer.end();
_j621 = createGraphics(width, height, WEBGL);
_j621.noStroke();
_j621.pixelDensity(_j514);;
_j621.clear();
finalBuffer = createFramebuffer({
density: _j514
});
finalBuffer.begin();
background(255);
finalBuffer.end();
newBufferBlack = createFramebuffer({
density: _j514
});
newBufferBlack.begin();
background(255);
newBufferBlack.end();
_j622 = createFramebuffer({
density: _j514
});
_j623 = createGraphics(width, height, WEBGL);
_j623.noStroke();
_j623.pixelDensity(_j514);;
_j623.clear();
_j626 = createFramebuffer({
density: _j514
});
let _j488 = _j9(40, 20, 15, 0.2);
const _j489 = min(255, canvasBackgroundColor[0] * 1.1);
const _j490 = min(255, canvasBackgroundColor[1] * 1.1);
const _j491 = min(255, canvasBackgroundColor[2] * 1.1);
_j626.begin();
clear();
noStroke();
fill(_j489, _j490, _j491);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j488, -width / 2, -height / 2, width, height);
_j626.end();
_j488.remove();
_j627 = createFramebuffer({
density: _j514
});
_j627.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j627.end();
_j624 = createFramebuffer({
density: _j514
});
typeMapBuffer = createFramebuffer({
density: _j514
});
typeMapBuffer.begin();
background(0);
typeMapBuffer.end();
pingPongBuffer = createFramebuffer({
density: _j514
});
_j628 = createFramebuffer({
density: _j514
});
_j625 = createFramebuffer({
density: _j514
});
_j629 = createFramebuffer({
density: _j514
});
_j629.begin();
background(255);
_j629.end();
_j561 = createFramebuffer({
density: _j514
});
_j561.begin();
background(255);
_j561.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j514
});
}
_j515.begin();
background(255, 255, 255);
_j515.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j642 = hw;
_j643 = hh;
_j644 = hw;
_j645 = hh;
_j179();
_j529 = 10;
_j586 = 2;
_j531 = 0.5;
_j532 = 0.5;
_j530 = 0;
_j533 = 20;
x = y = _j534 = _j535 = _j536 = _j537 = _j550 = 0;
_j446 = hw;
_j447 = hh;
_j538 = 0;
_j175();
_j182();
_j27();
_j180();
window.addEventListener('mouseup', function(e) {
if (_j556 && !_j638) {
const _j746 = document.querySelector('canvas');
if (_j746) {
const bounds = _j746.getBoundingClientRect();
const _j747 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j747) {
_j112('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j557) {
_j557 = true;
_j578 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j573 = _j48(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j573 = false;
});
document.addEventListener('mousemove', function(e) {
if (_j562) return;
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j551 = _j188(mouseX);
_j552 = _j188(mouseY);
} else {
const _j746 = document.querySelector('canvas');
if (!_j746) return;
const bounds = _j746.getBoundingClientRect();
const _j748 = (e.clientX - bounds.left) / bounds.width;
const _j749 = (e.clientY - bounds.top) / bounds.height;
_j551 = _j188(_j748 * width);
_j552 = _j188(_j749 * height);
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
if (!_j1430.enabled) return;
_j1430.frameCount++;
let _j750 = 60;
const now = millis();
if (_j1430.lastFrameTime > 0) {
const deltaTime = now - _j1430.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j750 = 1000 / deltaTime;
_j750 = Math.max(1, Math.min(120, _j750));
}
} else {
try {
const _j751 = frameRate();
if (!isNaN(_j751) && _j751 > 0) {
_j750 = _j751;
}
} catch (e) {}
}
_j1430.lastFrameTime = now;
_j1430._pushFR(_j750);
if (_j1430.frameCount - _j1430.lastCheckFrame >= _j1430.checkInterval) {
_j1430.lastCheckFrame = _j1430.frameCount;
const _j752 = _j1430._frLen > 0 ?
_j1430._avgFR() :
_j750;
if (_j1430.logFpsToConsole) {
console.log('FPS:', _j752.toFixed(1));
}
const _j753 = 0.1;
const _j754 = _j752 <= (_j1430.frameRateThreshold + _j753);
if (_j754) {
const now = millis();
if (now - _j1430.lastPerformanceLog > _j1430.logCooldown) {
_j1430.lastPerformanceLog = now;
_j36(_j752);
}
}
}
}
function _j36(_j752) {
const _j755 = _j1430.performanceDataAccumulated;
const sampleCount = _j755.sampleCount > 0 ? _j755.sampleCount : 1;
if (sampleCount === 0 || _j755.drawTotal === 0) {
const _j756 = _j1430.performanceData;
const _j757 = _j756.drawTotal > 0 ? _j756.drawTotal : 1;
const report = {
'平均帧率': `${_j752.toFixed(1)} fps`,
'目标帧率': `${_j1430.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j752).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j512}x${_j513}`,
'Pixel Density': _j514
};
const stateInfo = {
'正在绘制': _j556 ? '是' : '否',
'正在播放': _j638 ? '是' : '否',
'倒计时中': _j557 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j653 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
_j112('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j755.drawTotal / sampleCount,
updatePlayback: _j755.updatePlayback / sampleCount,
updateCompositeBuffer: _j755.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j755.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j755.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j755.updateBlurEffect / sampleCount,
applyCameraProjection: _j755.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j755.drawLayersWithBlur / sampleCount,
other: _j755.other / sampleCount
};
const _j757 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j758 = [];
const _j759 = _j757 * 0.1;
if (data.updatePlayback > _j759) {
_j758.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j757) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j759) {
_j758.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j757) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j759) {
_j758.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j757) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j759) {
_j758.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j757) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j759) {
_j758.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j757) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j759) {
_j758.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j757) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j759) {
_j758.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j757) * 100).toFixed(1)
});
}
if (data.other > _j759) {
_j758.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j757) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j752.toFixed(1)} fps`,
'目标帧率': `${_j1430.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j752).toFixed(2)} ms`,
'总耗时': `${_j757.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j512}x${_j513}`,
'Pixel Density': _j514
};
const stateInfo = {
'正在绘制': _j556 ? '是' : '否',
'正在播放': _j638 ? '是' : '否',
'倒计时中': _j557 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j653 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
if (_j758.length > 0) {
report['性能瓶颈'] = _j758.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j760 = [];
if (data.drawLayersWithBlur > _j759) {
_j760.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j759) {
_j760.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j512 * _j513 > 1500000) {
_j760.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 100) {
_j760.push('笔画数量较多，考虑清理旧笔画');
}
if (_j760.length > 0) {
report['优化建议'] = _j760.join('; ');
}
_j112('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1430.performanceData).forEach(key => {
_j1430.performanceData[key] = 0;
});
Object.keys(_j1430.performanceDataAccumulated).forEach(key => {
_j1430.performanceDataAccumulated[key] = 0;
});
}
let _j761 = 0;
const _j762 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j763 = (++_j761 % _j762 === 0);
const _j764 = _j763 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j241.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j765 = _j763 ? performance.now() : 0;
if (_j638) {
updatePlayback();
}
if (_j763) _j1430.performanceData.updatePlayback += performance.now() - _j765;
_j26();
if (_j575 || _j556 || _j557 || _j638 || _j681) {
if (_j763) _j765 = performance.now();
updateCompositeBuffer();
if (_j763) _j1430.performanceData.updateCompositeBuffer += performance.now() - _j765;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j33();
}
if (_j763) _j765 = performance.now();
updateEasyCamAutoTracking();
if (_j763) _j1430.performanceData.updateEasyCamAutoTracking += performance.now() - _j765;
if (_j763) _j765 = performance.now();
drawCursorToBuffer();
if (_j763) _j1430.performanceData.drawCursorToBuffer += performance.now() - _j765;
_j37();
if (_j763) _j765 = performance.now();
updateBlurEffect();
if (_j763) _j1430.performanceData.updateBlurEffect += performance.now() - _j765;
if (_j763) _j765 = performance.now();
applyCameraProjection();
if (_j763) _j1430.performanceData.applyCameraProjection += performance.now() - _j765;
if (_j763) _j765 = performance.now();
drawLayersWithBlur();
if (_j763) _j1430.performanceData.drawLayersWithBlur += performance.now() - _j765;
_j52();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j766 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j638 !== 'undefined' ? _j638 : '?') +
' evt=' + (typeof _j640 !== 'undefined' ? _j640 : '?');
_j624.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j766, -width/2 + 4, -height/2 + 3);
_j624.end();
if (d.totalFrames % 10 === 0) {
var _j767 = document.getElementById('defaultCanvas0');
var _j768 = document.getElementById('_fxDbgOvr');
if (!_j768 && _j767) {
_j768 = document.createElement('canvas');
_j768.id = '_fxDbgOvr';
_j768.width = _j767.offsetWidth;
_j768.height = 24;
_j768.style.position = 'fixed';
_j768.style.top = _j767.offsetTop + 'px';
_j768.style.left = _j767.offsetLeft + 'px';
_j768.style.zIndex = '2147483647';
_j768.style.pointerEvents = 'none';
document.body.appendChild(_j768);
}
if (_j768) {
var _j769 = _j768.getContext('2d');
_j769.clearRect(0, 0, _j768.width, _j768.height);
_j769.fillStyle = 'rgba(200,0,0,0.85)';
_j769.fillRect(0, 0, _j768.width, 22);
_j769.font = 'bold 13px monospace';
_j769.fillStyle = '#fff';
_j769.fillText(_j766, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j770 = document.getElementById('fxhash-capture-canvas');
var _j771 = document.getElementById('defaultCanvas0');
if (_j770 && typeof _j624 !== 'undefined') {
var _j772 = _j624.get();
_j770.width = _j772.width;
_j770.height = _j772.height;
var _j773 = _j770.getContext('2d');
_j773.drawImage(_j772.canvas, 0, 0);
if (typeof _j772.remove === 'function') _j772.remove();
if (_j771) {
_j770.style.cssText = _j771.style.cssText;
_j771.style.visibility = 'hidden';
}
_j770.style.position = 'absolute';
_j770.style.top = (_j771 ? _j771.offsetTop : 0) + 'px';
_j770.style.left = (_j771 ? _j771.offsetLeft : 0) + 'px';
_j770.style.zIndex = '99999';
_j770.style.visibility = 'visible';
_j770.style.border = 'none';
_j770.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j770.width + 'x' + _j770.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j774 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j773.save();
_j773.fillStyle = 'rgba(0,0,0,0.7)';
_j773.fillRect(10, 10, 280, _j774.length * 22 + 10);
_j773.font = '16px monospace';
_j773.fillStyle = '#0f0';
for (var li = 0; li < _j774.length; li++) {
_j773.fillText(_j774[li], 18, 30 + li * 22);
}
_j773.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j771 && _j770) {
_j770.width = _j771.width;
_j770.height = _j771.height;
var _j773 = _j770.getContext('2d');
_j773.drawImage(_j771, 0, 0);
if (_j771) _j771.style.visibility = 'hidden';
_j770.style.visibility = 'visible';
_j770.style.zIndex = '99999';
_j770.style.border = 'none';
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
if (window._videoFrameCaptureActive && typeof _j200 === 'function') {
_j200();
}
if (_j763) {
const _j775 = performance.now();
const _j776 = _j1430.performanceData.updatePlayback +
_j1430.performanceData.updateCompositeBuffer +
_j1430.performanceData.updateEasyCamAutoTracking +
_j1430.performanceData.drawCursorToBuffer +
_j1430.performanceData.updateBlurEffect +
_j1430.performanceData.applyCameraProjection +
_j1430.performanceData.drawLayersWithBlur;
_j1430.performanceData.other = (_j775 - _j764) - _j776;
_j1430.performanceData.drawTotal = _j775 - _j764;
_j1430.performanceDataAccumulated.drawTotal += _j1430.performanceData.drawTotal;
_j1430.performanceDataAccumulated.updatePlayback += _j1430.performanceData.updatePlayback;
_j1430.performanceDataAccumulated.updateCompositeBuffer += _j1430.performanceData.updateCompositeBuffer;
_j1430.performanceDataAccumulated.updateEasyCamAutoTracking += _j1430.performanceData.updateEasyCamAutoTracking;
_j1430.performanceDataAccumulated.drawCursorToBuffer += _j1430.performanceData.drawCursorToBuffer;
_j1430.performanceDataAccumulated.updateBlurEffect += _j1430.performanceData.updateBlurEffect;
_j1430.performanceDataAccumulated.applyCameraProjection += _j1430.performanceData.applyCameraProjection;
_j1430.performanceDataAccumulated.drawLayersWithBlur += _j1430.performanceData.drawLayersWithBlur;
_j1430.performanceDataAccumulated.other += _j1430.performanceData.other;
_j1430.performanceDataAccumulated.sampleCount++;
}
_j35();
if (_j638) {
if (_j557 && !_j649) {
_j648 = millis();
_j649 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j557 && _j649) {
const _j777 = millis() - _j648;
const _j778 = _j639;
_j639 += _j777;
_j649 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j777.toFixed(0)}ms`);
if (_j640 < recordingData.events.length) {
const _j779 = recordingData.events[_j640];
const _j780 = _j779.m || _j779.type;
const _j781 = _j780 === 'mp' || _j780 === 'mousePressed';
const _j782 = _j779.t !== undefined ? _j779.t : _j779.time;
const _j783 = (millis() - _j639) * _j641;
const _j784 = _j782 - _j783;
if (_j781 || _j784 <= 0 || _j784 < 100) {
if (window.DEBUG_MODE && _j781) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j784.toFixed(0)}ms`);
}
_j195(_j779);
_j640++;
}
}
}
}
const _j785 = _j638 ? _j646 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j556));
const _j786 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j785 : (_j785 && _j539 > 0);
const _j787 = _j638 || (_j551 >= 0 && _j551 < width && _j552 >= 0 && _j552 < height) || (_j556 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j786 && _j787) {
window.drawLoopCount++;
if (_j579 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j579++;
let _j510, _j511;
if (_j638) {
_j510 = _j642;
_j511 = _j643;
} else {
_j510 = _j551;
_j511 = _j552;
}
if (_j579 % 2 === 0 && _j584) {
pathPoints.push({
x: _j510,
y: _j511
});
}
if (_j576) {
_j577.push({
x: _j510,
y: _j511,
t: millis(),
pressure: force
});
}
const _j788 = strokeSeed + _j579 * 100000000;
randomSeed(_j788);
if (brushMode === 3) {
let _j789 = crandom.random(0, 1);
let _j790 = crandom.random(150, 250);
let _j791 = _j789 > 0.1 ? noise(_j510 * 0.01, _j511 * 0.01) * 150 : _j790;
_j524 = (_j524 * 0.3) + (_j791 * 0.7);
} else {
let _j789 = crandom.random(0, 1);
let _j790 = crandom.random(20, 50);
let _j791 = _j789 > 0.3 ? noise(_j510 * 0.01, _j511 * 0.01) * 10 : _j790;
_j524 = (_j524 * 0.6) + (_j791 * 0.4);
}
_j539 -= randStep;
_j539 = max(1, _j539);
_j533 = _j539;
if (_j560 && _j579 >= 8) {
const _j792 = _j638 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j570;
const _j793 = baseBrushSize;
if (_j792 >= 0.3) {
const _j794 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j795 = _j572 || window._strokeStartBaseBrushSize || 1;
let _j796 = _j794.indexOf(_j795);
if (_j796 === -1) {
_j796 = _j794.findIndex(s => s >= _j795);
if (_j796 === -1) _j796 = _j794.length - 1;
}
let _j797;
if      (_j792 < 0.5) _j797 = 1;
else if (_j792 < 0.7) _j797 = 2;
else                     _j797 = 3;
const _j798 = Math.min(_j796 + _j797, _j794.length - 1);
baseBrushSize = _j794[_j798];
} else if (_j792 >= 0) {
baseBrushSize = _j572 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j793 && _j793 > 0) {
const _j799 = Math.pow(baseBrushSize / _j793, 0.6);
_j539 *= _j799;
initialSize *= _j799;
}
}
if (_j539 <= _j540 && !_j557 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j557 = true;
_j578 = 0;
}
_j446 = _j510;
_j447 = _j511;
_j538 = map(noise(_j446 * 0.01, _j447 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j800 = strokeSeed + _j579 * 10000000;
randomSeed(_j800);
const _j801 = crandom.random(pathRotation * 0.5, pathRotation);
const _j802 = crandom.random(pathRotation * 0.5, pathRotation);
const _j500 = -10;
_j446 += _j801 * (cos(_j538)) + _j500;
_j447 += _j802 * (sin(_j538)) + _j500;
}
if (_j630) {
const _j803 = (brushMode === 3) ? _j446 : Math.round(_j446);
const _j804 = (brushMode === 3) ? _j447 : Math.round(_j447);
const _j805 = { x: _j803, y: _j804 };
if (_j560 && _j569) _j805.p = Math.round(_j570 * 1000) / 1000;
_j189("md", _j805);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j553 = _j446;
_j554 = _j447;
let _j309 = newBufferBlack;
if (_j579 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j806 = dist(_j446, _j447, _j548, _j549);
const _j807 = 1;
if (_j806 > _j807) {
if (brushMode == 4 && _j579 < expectedStrokeLength) {
_j59(_j309, _j446, _j447, _j548, _j549);
}
if ((brushMode == 1 || brushMode == 7) && _j579 < expectedStrokeLength) {
let _j808 = expectedStrokeLength > 0 ? min(_j579 / expectedStrokeLength, 1.0) : 0;
let _j809 = crandom.random(0, 1);
if (_j809 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j579 > 5 && baseBrushSize < 6.0) _j57(_j309, _j446, _j447);
}
_j58(_j309, _j446, _j447, _j808, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j579 < expectedStrokeLength) {
let _j808 = expectedStrokeLength > 0 ? min(_j579 / expectedStrokeLength, 1.0) : 0;
let _j809 = crandom.random(0, 1);
if (_j809 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j808 < 0.6) {}
_j61(_j309, _j446, _j447, _j808, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j579 < expectedStrokeLength) {
_j64(_j309, _j446, _j447, _j548, _j549);
if (crandom.random(0, 1) > 0.4) _j57(_j309, _j446, _j447);
}
if (brushMode == 5 && _j579 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j57(_j309, _j446, _j447);
}
if (brushMode == 6 && _j579 < expectedStrokeLength) {
let _j808 = expectedStrokeLength > 0 ? min(_j579 / expectedStrokeLength, 1.0) : 0;
_j65(_j309, _j446, _j447, _j808, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j579 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j548 = _j446;
_j549 = _j447;
if (_j638) {
_j644 = _j642;
_j645 = _j643;
}
}
const _j810 = _j638 ? _j646 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j556));
const _j811 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j810 : (_j810 && _j539 > 0);
if (_j811) {
if (_j580 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j309 = newBufferBlack;
_j30(_j309, force);
_j580++;
if (_j580 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j557 && _j578 < maxUpdates) {
force = map(_j578, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j309 = newBufferBlack;
_j30(_j309, force);
_j578++;
_j580++;
} else if (_j557 && _j578 >= maxUpdates) {
_j112('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j39();
_j557 = false;
}
if (_j637 == 1 && _j638 && !_j681) {
_j184();
}
if (_j637 == 1 && !_j638 && _j681) {
_j185();
}
if (_j681) {
_j186();
if (_j637 == 1) {
frameRate(10);
}
}
if (_j637 == 0) {
frameRate(60);
}
_j146();
if (_j716) {
_j716 = false;
const _j812 = drawingSeed;
randomSeed(_j717);
noiseSeed(_j717);
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
_j18(_j624, scanBounds);
}
randomSeed(_j812);
noiseSeed(_j812);
_j717 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j813 = window.pendingEffectControlScanQueue.shift();
if (_j813 && typeof _j18 === 'function') {
let scanBounds = _j813.scanBounds;
const action = _j813.action;
const shapeType = _j813.shapeType;
const bugsSize = _j813.bugsSize !== undefined ? _j813.bugsSize : 10.0;
const scanSeed = _j813.scanSeed;
const recordedRandomCount = _j813.recordedRandomCount;
const targetPoints = _j813.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j814 = document.getElementById('bugs-size');
const _j815 = document.getElementById('bugs-size-value');
if (_j814 && _j815) {
_j814.value = bugsSize;
_j815.textContent = bugsSize;
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
const _j816 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j624, scanBounds, shapeType, targetPoints);
if (_j816) {
randomSeed(_j816);
noiseSeed(_j816);
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
if (_j638) {
return;
}
if (_j573) {
return;
}
if (_j562) {
if (_j564 === 'rect') {
_j565 = { x1: mouseX - 10, y1: mouseY - 10 };
} else if (_j564 === 'polygon') {
_j566.push({ x: mouseX - 10, y: mouseY - 10 });
if (typeof _j93 === 'function') _j93();
}
return false;
}
_j551 = _j188(mouseX);
_j552 = _j188(mouseY);
pmouseX = mouseX;
pmouseY = mouseY;
_j553 = _j551;
_j554 = _j552;
_j642 = _j551;
_j643 = _j552;
_j644 = _j551;
_j645 = _j552;
if (typeof _j571 !== 'undefined') {
_j571[0] = _j571[1] = _j571[2] = 0;
}
const _j817 = 300;
if (_j551 < -_j817 || _j551 > width + _j817 ||
_j552 < -_j817 || _j552 > height + _j817) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j630) {
_j634++;
}
if (_j630) {
console.log(`🎬 錄製開始 [第 ${_j634} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j40();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j112('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j551.toFixed(0)}, ${_j552.toFixed(0)})`
});
_j657++;
_j581 = _j579;
_j524 = 0;
_j579 = 0;
if (_j560 && _j572 !== null) {
baseBrushSize = _j572;
}
if (typeof _j1052 !== 'undefined') {
_j1052 = [];
}
if (typeof _j1053 !== 'undefined') {
_j1053 = 0;
}
_j525 = crandom.random(0.5, 0.99);
_j526 = crandom.random(-0.02, 0.02);
_j527 = crandom.random(-0.05, 0.05);
_j528 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j188(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j188(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j188(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j818 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j819 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j630) {
if (_j636) {
if (_j631 === 0) {
_j631 = millis();
_j112('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j820 = millis() - _j633;
if (_j820 > 0) {
_j635 += _j820;
_j112('recording', '⏸️ Skip interval', {
Interval: `${_j820.toFixed(0)}ms`,
Accumulated: `${_j635.toFixed(0)}ms`
});
}
}
_j636 = false;
} else {
const _j820 = millis() - _j633;
_j635 += _j820;
_j112('recording', '⏸️ Skip interval', {
Interval: `${_j820.toFixed(0)}ms`,
Accumulated: `${_j635.toFixed(0)}ms`
});
}
_j632 = {
strokeSeed: strokeSeed,
mouseCountStart: _j581,
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
whiteMaxOpacity: _j188(_j525),
hueShift: _j188(_j526),
satShift: _j188(_j527),
briShift: _j188(_j528),
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
maskData: _j567 || undefined
};
}
if (_j585 === 1) {
pathRotation = 0;
} else if (_j585 === 2) {
pathRotation = _j188(crandom.random(5, 10));
} else if (_j585 === 3) {
pathRotation = _j188(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j188(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j529 = 15;
_j586 = 5;
_j531 = 0.6;
_j532 = 0.5;
} else if (brushMode === 2) {
initialSize = _j188(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j529 = 10;
_j586 = 10;
_j531 = 0.3;
_j532 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j586 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j586 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j551 * 1, _j552 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j531 = 0.6;
_j532 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j586 = 1;
randStep = 0.05;
maxUpdates = 10;
_j529 = 10;
_j531 = 0.6;
_j532 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j586 = 1;
randStep = 0.05;
maxUpdates = 10;
_j529 = 10;
_j531 = 0.6;
_j532 = 0.5;
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
if (_j630 && _j632) {
_j632.initialSize = initialSize;
_j632.spraySize = spraySize;
_j632.step = _j529;
_j632.step2 = _j586;
_j632.randStep = randStep;
_j632.maxUpdates = maxUpdates;
_j632.pathRotation = pathRotation;
_j632.spring = _j531;
_j632.friction = _j532;
_j632.baseBrushSize = baseBrushSize;
_j632.expectedStrokeLength = expectedStrokeLength;
_j632.effect3Brightness = _j188(effect3Brightness);
}
_j539 = initialSize;
_j533 = _j539;
_j537 = _j533;
_j555 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j560 && _j572 === null) _j572 = baseBrushSize;
_j550 = 0;
x = _j551;
y = _j552;
_j534 = 0;
_j535 = 0;
_j536 = 0;
_j547 = 0;
_j541 = 0;
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
_j548 = _j551;
_j549 = _j552;
_j556 = true;
_j557 = false;
_j578 = 0;
_j580 = 0;
_j558 = true;
_j559 = false;
startX = _j551;
startY = _j552;
pathPoints = [{
x: _j551,
y: _j552
}];
_j584 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j630 && _j632) {
_j632.mouseX = _j551;
_j632.mouseY = _j552;
_j632.drawingSeed = drawingSeed;
_j632.brushModeSP = brushModeSP;
if (_j560 && _j569) _j632.hasPressure = true;
_j632.forceMapParams = {
randomSeed1: _j188(_j615[0]),
randomSeed2: _j188(_j615[1]),
randomSeed3: _j188(_j615[2]),
randomSeed4: _j188(_j615[3]),
scale1: _j188(_j616[0]),
scale2: _j188(_j616[1]),
scale3: _j188(_j616[2]),
amplitude1: _j188(_j617[0]),
amplitude2: _j188(_j617[1]),
amplitude3: _j188(_j617[2]),
phase1: _j188(_j618[0]),
phase2: _j188(_j618[1]),
phase3: _j188(_j618[2]),
vortexScale1: _j188(_j619[0]),
vortexScale2: _j188(_j619[1]),
clusterScale1: _j188(_j620[0]),
clusterScale2: _j188(_j620[1])
};
const _j821 = (brushMode === 3) ? _j551 : Math.round(_j551);
const _j822 = (brushMode === 3) ? _j552 : Math.round(_j552);
_j189("mp", {
x: _j821,
y: _j822,
strokeData: _j632
});
}
}
function mouseReleased() {
if (_j638) {
return;
}
if (_j562 && _j564 === 'rect' && _j565 && _j565.x1 !== undefined) {
const mx = mouseX - 10, my = mouseY - 10;
const x1 = Math.min(_j565.x1, mx);
const y1 = Math.min(_j565.y1, my);
const x2 = Math.max(_j565.x1, mx);
const y2 = Math.max(_j565.y1, my);
if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
_j565 = { x1: x1, y1: y1, x2: x2, y2: y2 };
drawMaskRect(x1, y1, x2, y2);
_j567 = { action: "rect", x1: x1, y1: y1, x2: x2, y2: y2 };
_j562 = false;
const toggle = document.getElementById('mask-mode-toggle');
if (toggle) toggle.checked = false;
if (typeof _j93 === 'function') _j93();
window.resetBrushPositionToMouse();
}
return;
}
if (!_j556) {
return;
}
if (_j576) {
_j577.push({ stroke: true, t: millis() });
}
const _j823 = crandom.getCount();
const _j824 = _j551;
const _j825 = _j552;
const _j826 = Math.round(constrain(_j824, 0, width));
const _j827 = Math.round(constrain(_j825, 0, height));
_j189("mr", {
x: _j826,
y: _j827
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j828 = randomCount - _j823;
const _j829 = window.drawLoopCount || 0;
const _j830 = window.recordedMouseDraggedCount || 0;
if (_j630) {
console.log(`   Draw: ${_j829} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j630) {
crandomDebugger.saveStroke('recording', _j634);
}
if (_j630) {
_j633 = millis();
_j112('recording', 'Stroke ended', {
FinalSize: _j539.toFixed(2),
CountdownStatus: _j557 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j551 < 0 || _j551 >= width || _j552 < 0 || _j552 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j1052 !== 'undefined' && _j1052.length > 0) {
_j1052 = _j1052.filter(_j1569 => _j1569.radius > 0);
}
if (!_j557) {
_j557 = true;
_j578 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j126();
return;
}
if (key === 'f' || key === 'F') {
if (_j681) {
_j185();
} else {
_j184();
}
return;
}
if (key === ' ') {
_j174();
console.clear();
let _j831 = _j241.length;
_j241 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j112('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j831} 个`
});
return false;
}
}
function _j37() {
const _j469 = doMoving && _j653 && _j652 !== null && _j638 && _j654;
const _j832 = (_j638 && _j469) || (!_j638 && (_j670 || _j674[0] !== 0 || _j674[40] !== 0 || _j674[80] !== 0 || _j674[120] !== 0));
if (_j832) {
if (!_j670) {
_j670 = true;
_j671 = millis();
_j672[0] = _j674[0];
_j672[40] = _j674[40];
_j672[80] = _j674[80];
_j672[120] = _j674[120];
}
const _j436 = millis() - _j671;
const _j437 = Math.min(_j436 / _j669, 1.0);
const _j833 = _j638 ? _j673 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j674[0] = lerp(_j672[0], _j833[0], _j437);
_j674[40] = lerp(_j672[40], _j833[40], _j437);
_j674[80] = lerp(_j672[80], _j833[80], _j437);
_j674[120] = lerp(_j672[120], _j833[120], _j437);
if (_j437 >= 1.0) {
_j674[0] = _j833[0];
_j674[40] = _j833[40];
_j674[80] = _j833[80];
_j674[120] = _j833[120];
if (!_j638) {
_j670 = false;
}
}
} else if (!_j638 && !_j670) {
_j674[0] = 0;
_j674[40] = 0;
_j674[80] = 0;
_j674[120] = 0;
}
}
function updateBlurEffect() {
const _j469 = doMoving && _j653 && _j652 !== null && _j638 && _j654;
const _j834 = _j638;
const _j835 = _j834 ? _j646 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j556));
const _j836 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j835 : (_j835 && _j539 > 0);
if (!doMoving) {
_j676[0] = 0;
_j676[40] = 0;
_j676[80] = 0;
_j676[120] = 0;
return;
}
if (_j834) {
if (_j680) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j675[0] = _j188(max(0, crandom.random(-5, 5)));
_j675[40] = _j188(max(0, crandom.random(-5, 5)));
_j675[80] = _j188(max(0, crandom.random(-5, 5)));
_j675[120] = _j188(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j677 = millis();
_j680 = false;
}
_j679 = _j835;
} else {
_j679 = false;
_j680 = false;
}
let _j837 = 0;
if (_j834) {
if (_j836) {
const _j436 = millis() - _j677;
const _j437 = min(1.0, _j436 / _j678);
_j837 = _j437;
} else if (_j557) {
const _j838 = map(_j578, 0, maxUpdates, 1.0, 0.0);
_j837 = _j838;
} else {
_j837 = 0;
}
if (_j469 && _j652 !== null) {
const _j433 = _j652.getDistance();
const _j429 = PI / 3;
const _j448 = height / (2 * tan(_j429 / 2));
const _j449 = 1.1;
const _j450 = 1.4;
const _j452 = _j448 / _j433;
const _j839 = _j450 - _j449;
const _j840 = (_j452 - _j449) / _j839;
const _j841 = constrain(_j840, 0.0, 1.0);
const _j842 = pow(_j841, 0.5);
_j837 = _j837 * _j842;
}
}
_j676[0] = _j675[0] * _j837;
_j676[40] = _j675[40] * _j837;
_j676[80] = _j675[80] * _j837;
_j676[120] = _j675[120] * _j837;
}
function drawLayersWithBlur() {
const _j469 = doMoving && _j653 && _j652 !== null && _j638 && _j654;
const _j498 = (typeof _j563 !== 'undefined' && _j563) ||
(typeof _j562 !== 'undefined' && _j562);
const _j499 = (typeof window !== 'undefined' && window.testMode === true);
const _j495 = ((_j556 || _j557) && _j578 < maxUpdates && _j584) || _j498 || _j499;
const _j843 = _j241.length > 0 && typeof _j21 === 'function';
const _j844 = false;
const _j845 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j521 && _j515;
if (_j516 && _j515) {
_j179();
}
_j622.begin();
clear();
if (_j845) {
let _j846 = _j624;
if (_j843) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j624, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j628, window.tempMetallicBuffer);
_j846 = _j628;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j521);
_j521.setUniform("rect", [0, 0, width * _j514, height * _j514]);
_j521.setUniform("tex0", _j846);
_j521.setUniform("forceMap", _j515);
_j521.setUniform("time", millis() * 0.005);
_j521.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j521.setUniform("distortEnabled", 1.0);
_j521.setUniform("displacementB", distortDisplacementB);
_j521.setUniform("displacementC", distortDisplacementC);
_j521.setUniform("showFbmMask", distortShowFbmMask);
_j521.setUniform("fbmSeed1", _j615[0] || 100);
_j521.setUniform("fbmSeed2", _j615[1] || 200);
_j521.setUniform("fbmSeed3", _j615[2] || 300);
_j521.setUniform("fbmSeed4", _j615[3] || 400);
} else {
_j521.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j521.setUniform("rsEnabled", 1.0);
_j521.setUniform("rsFrequency", _j590);
_j521.setUniform("rsWaveSpeed", _j591);
_j521.setUniform("rsStrength", _j592);
_j521.setUniform("rsGradientMix", _j593);
_j521.setUniform("rsScale", _j594);
} else {
_j521.setUniform("rsEnabled", 0.0);
}
_j521.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j521.setUniform("cellularScale", _j595);
_j521.setUniform("cellularSeed", _j596);
_j521.setUniform("whiteDotDensity", whiteDotEnabled ? _j597 : 0.0);
_j521.setUniform("grainAmount", grainEnabled ? _j598 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j624, 0, 0, width, height);
if (_j843) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j622, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j628, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j628, 0, 0, width, height);
}
}
_j622.end();
if (_j606 && _j607) {
const data = _j607;
const bounds = data.bounds;
const _j847 = {
rect: [0, 0, width * _j514, height * _j514],
blendType: data.blendType,
blendVol: _j613.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j613.pixD,
blendA: _j613.blendA,
blendB: _j613.blendB,
directVol: _j613.directVol,
snoiseVol: _j613.snoiseVol,
gobalStyle: _j613.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j613.colorDeep,
whiteDot: _j613.whiteDot,
doBigShape: _j613.doBigShape,
doMask: _j613.doMask,
multiDir: _j613.multiDir,
drawTime: _j613.drawTime,
seed: _j613.seed,
iTime: millis() * 0.001
};
if (typeMapBuffer && _j523) {
pingPongBuffer.begin();
clear();
shader(_j523);
for (const [key, val] of Object.entries(_j847)) {
_j523.setUniform(key, val);
}
_j523.setUniform('tex0', typeMapBuffer);
_j523.setUniform('lastStrokeTex', _j629);
_j523.setUniform('lastStrokeOnly', _j614 ? 1 : 0);
_j523.setUniform('isTypeMapMode', 1);
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
if (_j523) {
_j624.begin();
clear();
imageMode(CENTER);
image(oldBuffer, 0, 0, width, height);
_j624.end();
oldBuffer.begin();
shader(_j523);
for (const [key, val] of Object.entries(_j847)) {
_j523.setUniform(key, val);
}
_j523.setUniform('tex0', _j624);
_j523.setUniform('lastStrokeTex', _j629);
_j523.setUniform('lastStrokeOnly', _j614 ? 1 : 0);
_j523.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
oldBuffer.end();
}
if (_j523) {
_j624.begin();
clear();
imageMode(CENTER);
image(finalBuffer, 0, 0, width, height);
_j624.end();
finalBuffer.begin();
shader(_j523);
for (const [key, val] of Object.entries(_j847)) {
_j523.setUniform(key, val);
}
_j523.setUniform('tex0', _j624);
_j523.setUniform('lastStrokeTex', _j629);
_j523.setUniform('lastStrokeOnly', _j614 ? 1 : 0);
_j523.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
finalBuffer.end();
}
if (_j523) {
_j624.begin();
clear();
imageMode(CENTER);
image(_j622, 0, 0, width, height);
_j624.end();
_j622.begin();
shader(_j523);
for (const [key, val] of Object.entries(_j847)) {
_j523.setUniform(key, val);
}
_j523.setUniform('tex0', _j624);
_j523.setUniform('lastStrokeTex', _j629);
_j523.setUniform('lastStrokeOnly', _j614 ? 1 : 0);
_j523.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j622.end();
}
_j606 = false;
_j607 = null;
_j575 = true;
}
if (_j600 && _j523 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j622, 0, 0, width, height);
pingPongBuffer.end();
_j622.begin();
shader(_j523);
_j523.setUniform('rect', [0, 0, width * _j514, height * _j514]);
_j523.setUniform('tex0', pingPongBuffer);
_j523.setUniform('lastStrokeTex', _j629);
_j523.setUniform('lastStrokeOnly', _j614 ? 1 : 0);
_j523.setUniform('blendType', _j601);
_j523.setUniform('blendVol', _j613.blendVol * (1 + _j603 * 0.1));
_j523.setUniform('radSeed', _j605 * 0.001);
_j523.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j523.setUniform('pixD', _j613.pixD);
_j523.setUniform('blendA', _j613.blendA);
_j523.setUniform('blendB', _j613.blendB);
_j523.setUniform('directVol', _j613.directVol);
_j523.setUniform('snoiseVol', _j613.snoiseVol);
_j523.setUniform('gobalStyle', _j613.gobalStyle);
_j523.setUniform('vline', 5);
_j523.setUniform('hline', 5);
_j523.setUniform('cellT', 1.0);
_j523.setUniform('colorDeep', _j613.colorDeep);
_j523.setUniform('whiteDot', _j613.whiteDot);
_j523.setUniform('doBigShape', _j613.doBigShape);
_j523.setUniform('doMask', _j613.doMask);
_j523.setUniform('multiDir', _j613.multiDir);
_j523.setUniform('drawTime', _j613.drawTime);
_j523.setUniform('seed', _j613.seed);
_j523.setUniform('iTime', millis() * 0.001);
_j523.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j622.end();
}
noStroke();
push();
translate(0, 0, _j674[0]);
image(_j622, -width / 2, -height / 2);
pop();
if (_j495) {
push();
translate(0, 0, _j674[40]);
image(_j625, -width / 2, -height / 2);
pop();
}
if (_j638) {
if (showFuturePathPreview) {
_j42();
} else {
_j623.clear();
}
push();
translate(0, 0, _j674[80]);
image(_j623, -width / 2, -height / 2);
pop();
}
if (screenText && _j686) {
_j43();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j621.clear();
_j621.push();
_j45();
_j44();
_j621.pop();
} else {
_j621.clear();
_j621.push();
_j44();
_j621.pop();
}
const _j848 = (screenText && _j686) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0);
if (_j848) {
push();
translate(0, 0, _j674[120]);
image(_j621, -width / 2, -height / 2);
pop();
}
if (_j469) {
pop();
}
}
function drawMaskRect(x1, y1, x2, y2) {
var _j849 = height - y2;
var _j850 = height - y1;
push();
_j561.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 10000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
rectMode(CORNER);
rect(x1, _j849, x2 - x1, _j850 - _j849);
_j561.end();
pop();
_j563 = true;
}
function drawMaskPolygon(points) {
if (points.length < 3) return;
push();
_j561.begin();
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
_j561.end();
pop();
_j563 = true;
}
function clearMask() {
push();
_j561.begin();
background(255);
_j561.end();
pop();
_j563 = false;
_j566 = [];
_j565 = null;
}
function testMaskRect() {
const cx = width / 2;
const cy = height / 2;
const size = 100;
const x1 = cx - size / 2;
const y1 = cy - size / 2;
_j565 = { x1: x1, y1: y1, x2: x1 + size, y2: y1 + size };
drawMaskRect(x1, y1, x1 + size, y1 + size);
console.log('[Mask] Test rect drawn at center:', x1, y1, size, 'x', size);
}
window.testMaskRect = testMaskRect;
window.clearMask = clearMask;
window.drawMaskRect = drawMaskRect;
window.drawMaskPolygon = drawMaskPolygon;
window.testMode = false;
let _j851 = null;
function _j38(src, _j1206) {
if (!src || !_j1206) return;
_j1206.begin();
clear();
push();
imageMode(CENTER);
image(src, 0, 0, width, height);
pop();
_j1206.end();
}
function enterTestMode() {
if (window.testMode) return;
if (!_j851) {
_j851 = {
oldBuffer: createFramebuffer({ density: _j514 }),
finalBuffer: createFramebuffer({ density: _j514 }),
pingPongBuffer: createFramebuffer({ density: _j514 }),
typeMapBuffer: createFramebuffer({ density: _j514 }),
newBufferBlack: createFramebuffer({ density: _j514 })
};
}
_j38(oldBuffer, _j851.oldBuffer);
_j38(finalBuffer, _j851.finalBuffer);
_j38(pingPongBuffer, _j851.pingPongBuffer);
_j38(typeMapBuffer, _j851.typeMapBuffer);
_j38(newBufferBlack, _j851.newBufferBlack);
_j851.allBrushStrokes = (typeof allBrushStrokes !== 'undefined') ? allBrushStrokes.slice() : null;
_j851.totalStrokeCount = (typeof totalStrokeCount !== 'undefined') ? totalStrokeCount : 0;
_j851.enterMillis = millis();
window.testMode = true;
_j575 = true;
}
function exitTestMode() {
if (!window.testMode) return;
if (_j851) {
_j38(_j851.oldBuffer, oldBuffer);
_j38(_j851.finalBuffer, finalBuffer);
_j38(_j851.pingPongBuffer, pingPongBuffer);
_j38(_j851.typeMapBuffer, typeMapBuffer);
_j38(_j851.newBufferBlack, newBufferBlack);
if (typeof allBrushStrokes !== 'undefined' && _j851.allBrushStrokes) {
allBrushStrokes = _j851.allBrushStrokes.slice();
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = _j851.totalStrokeCount;
}
if (typeof currentStrokeHighlight !== 'undefined') currentStrokeHighlight = null;
if (typeof pendingBugBounds !== 'undefined') pendingBugBounds = null;
if (typeof _j583 !== 'undefined') _j583 = null;
if (typeof _j851.enterMillis === 'number' &&
typeof _j635 !== 'undefined' &&
typeof _j630 !== 'undefined' && _j630) {
_j635 += millis() - _j851.enterMillis;
}
}
window.testMode = false;
_j575 = true;
}
window.enterTestMode = enterTestMode;
window.exitTestMode = exitTestMode;
function _j39() {
_j629.begin();
clear();
background(255);
imageMode(CENTER);
image(newBufferBlack, 0, 0);
_j629.end();
_j624.begin();
clear();
shader(_j519);
const _j483 = brushColorMode === 1 ? 1.0 : 0.0;
_j519.setUniform("rect", [0, 0, width * _j514, height * _j514]);
_j519.setUniform("baseTex", finalBuffer);
_j519.setUniform("strokeTex", newBufferBlack);
_j519.setUniform("brushColorMode", float(brushColorMode));
_j519.setUniform("brushCategory", _j483);
_j519.setUniform("whiteMaxOpacity", _j525);
_j519.setUniform("hueShift", _j526);
_j519.setUniform("satShift", _j527);
_j519.setUniform("briShift", _j528);
_j519.setUniform("keyBlendMode", keyBlendMode);
_j519.setUniform("useSharpen", useSharpen);
_j519.setUniform("typeMapTex", typeMapBuffer);
const _j852 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j519.setUniform("canvasBackgroundColor", _j852);
const _j853 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j519.setUniform("customBrushColor", _j853);
_j519.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
_j519.setUniform("useMask", _j563 ? 1.0 : 0.0);
if (_j563) _j519.setUniform("maskTex", _j561);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j624.end();
if (_j522 && typeMapBuffer) {
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j624, 0, 0);
pingPongBuffer.end();
_j624.begin();
clear();
shader(_j522);
_j522.setUniform("rect", [0, 0, width * _j514, height * _j514]);
_j522.setUniform("baseTex", typeMapBuffer);
_j522.setUniform("strokeTex", newBufferBlack);
_j522.setUniform("brushCategory", _j483);
_j522.setUniform("whiteMaxOpacity", _j525);
_j522.setUniform("useMask", _j563 ? 1.0 : 0.0);
if (_j563) _j522.setUniform("maskTex", _j561);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j624.end();
typeMapBuffer.begin();
clear();
background(0);
imageMode(CENTER);
image(_j624, 0, 0, width, height);
typeMapBuffer.end();
_j624.begin();
clear();
imageMode(CENTER);
image(pingPongBuffer, 0, 0);
_j624.end();
}
finalBuffer.begin();
clear();
background(255);
imageMode(CENTER);
image(_j624, 0, 0);
finalBuffer.end();
oldBuffer.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(newBufferBlack, 0, 0);
blendMode(BLEND);
oldBuffer.end();
if (_j574 && _j584 && pathPoints.length > 1) {
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
_j556 = false;
_j557 = false;
_j578 = 0;
_j558 = false;
_j559 = true;
let _j854 = null;
if (pathPoints.length > 0) {
let _j855 = 0,
_j856 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j855 += pt.x;
_j856 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j371 = _j855 / pathPoints.length;
const _j372 = _j856 / pathPoints.length;
_j583 = {
minX,
maxX,
minY,
maxY,
_j371,
_j372,
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
x: _j371,
y: _j372
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
if (allBrushStrokes.length > _j587) {
allBrushStrokes.shift();
}
_j854 = {
minX: _j583.minX,
maxX: _j583.maxX,
minY: _j583.minY,
maxY: _j583.maxY
};
}
pathPoints = [];
_j584 = false;
_j583 = null;
const _j857 = drawingSeed;
let _j858 = _j854;
if (!_j858 && allBrushStrokes.length > 0) {
const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
if (lastStroke.bounds) {
_j858 = {
...lastStroke.bounds
};
}
}
if (_j858) {
pendingBugBounds = _j858;
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
if (_j582 && _j638) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j859 = false;
if (_j638 && recordingData && recordingData.events) {
let _j860 = 0;
for (let e of recordingData.events) {
const _j869 = e.m || e.type;
if (_j869 === 'mr' || _j869 === 'mouseReleased') {
_j860++;
}
}
const _j861 = totalStrokeCount;
const _j862 = _j861 >= (_j860 - 12);
_j859 = _j862;
if (_j859) {
const _j863 = crandom.random(0, 1) > 0.1;
if (_j863) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j858 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j858;
}
}
}
} else if (!_j638) {
_j859 = true;
}
if (_j859) {
_j716 = true;
_j717 = strokeSeed;
if (!_j638 && _j858 && !pendingBugBounds) {
pendingBugBounds = _j858;
}
} else {
if (_j858 && !pendingBugBounds) {
pendingBugBounds = _j858;
}
}
randomSeed(_j857);
noiseSeed(_j857);
}
if (typeof gc !== 'undefined') {
gc();
}
_j575 = true;
}
function _j40() {
if (_j558 && !_j559) {
if (_j556 || _j557) {
_j39();
}
}
}
function _j41() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j864 = [];
const _j865 = 20;
let _j866 = _j640;
let _j861 = null;
const offsetX = typeof _j650 !== 'undefined' ? _j650 : 0;
const offsetY = typeof _j651 !== 'undefined' ? _j651 : 0;
const _j867 = 500;
let _j868 = 0;
while (_j864.length < _j865 && _j866 < recordingData.events.length && _j868 < _j867) {
const event = recordingData.events[_j866];
const _j869 = event.m || event.type;
if (_j869 === 'mp' || _j869 === 'mousePressed') {
_j861 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j866,
data: event.strokeData || event.d || {}
};
} else if ((_j869 === 'md' || _j869 === 'mouseDragged') && _j861) {
_j861.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j869 === 'mr' || _j869 === 'mouseReleased') && _j861) {
_j861.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j864.push(_j861);
_j861 = null;
}
_j866++;
_j868++;
}
return _j864;
}
function _j42() {
if (!_j638 || !recordingData.events || recordingData.events.length === 0) {
_j623.clear();
return;
}
const now = millis();
const _j870 =
_j589.lastEventIndex !== _j640 ||
(now - _j589.lastUpdateTime) > _j589.updateInterval;
if (_j870) {
_j589.cachedStrokes = _j41();
_j589.lastEventIndex = _j640;
_j589.lastUpdateTime = now;
}
const _j864 = _j589.cachedStrokes;
_j623.clear();
if (_j864.length === 0) {
return;
}
_j623.push();
const time = millis() * 0.003;
for (let i = 0; i < _j864.length; i++) {
const _j871 = _j864[i];
const path = _j871.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j864.length - 1, 200, 80);
const _j872 = sin(time + i * 0.8) * 0.3 + 1;
const _j873 = _j871.eventIndex * 0.1;
const _j874 = 20;
const _j875 = min(max(floor(path.length / 5), 2), _j874);
const _j876 = [];
for (let s = 0; s < _j875; s++) {
const t = s / (_j875 - 1);
const _j315 = t * (path.length - 1);
const _j877 = floor(_j315);
const _j878 = min(_j877 + 1, path.length - 1);
const _j879 = _j315 - _j877;
const x1 = path[_j877].x;
const y1 = path[_j877].y;
const x2 = path[_j878].x;
const y2 = path[_j878].y;
const t1 = path[_j877].t || 0;
const t2 = path[_j878].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j876.push({
x: lerp(x1, x2, _j879),
y: lerp(y1, y2, _j879),
t: lerp(t1, t2, _j879)
});
}
const _j880 = [];
let _j881 = 0.01;
for (let j = 1; j < _j876.length; j++) {
const dx = _j876[j].x - _j876[j-1].x;
const dy = _j876[j].y - _j876[j-1].y;
const dt = _j876[j].t - _j876[j-1].t;
const _j882 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j880.push(_j882);
if (_j882 > _j881) _j881 = _j882;
}
_j623.noFill();
_j623.strokeCap(ROUND);
for (let j = 1; j < _j876.length; j++) {
const _j799 = constrain(_j880[j-1] / _j881, 0, 1);
const r = Math.round(_j799 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j799 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j799) * 255);
_j623.stroke(r, g, b, 160);
_j623.strokeWeight(1.0);
_j623.line(
_j876[j-1].x, _j876[j-1].y,
_j876[j].x, _j876[j].y
);
}
let _j883 = 0;
for (let j = 0; j < _j876.length - 1; j++) {
_j883 += dist(_j876[j].x, _j876[j].y, _j876[j + 1].x, _j876[j + 1].y);
}
if (isNaN(_j883) || _j883 <= 0 || _j876.length < 2) {
continue;
}
const _j884 = constrain(floor(_j883 / 150), 1, 3);
for (let a = 0; a < _j884; a++) {
_j623.push();
const _j885 = (time * 0.1 + _j873 + a * (1.0 / _j884)) % 1.0;
const _j886 = _j885 * _j883;
let _j887 = 0;
let _j888 = _j876[0].x;
let _j889 = _j876[0].y;
let angle = 0;
for (let j = 0; j < _j876.length - 1; j++) {
const _j890 = dist(_j876[j].x, _j876[j].y, _j876[j + 1].x, _j876[j + 1].y);
if (_j890 <= 0.0001) {
_j888 = _j876[j + 1].x;
_j889 = _j876[j + 1].y;
if (j + 1 < _j876.length - 1) {
angle = atan2(_j876[j + 2].y - _j876[j + 1].y, _j876[j + 2].x - _j876[j + 1].x);
} else {
angle = atan2(_j876[j + 1].y - _j876[j].y, _j876[j + 1].x - _j876[j].x);
}
break;
}
if (_j887 + _j890 >= _j886) {
const _j879 = (_j886 - _j887) / _j890;
const _j891 = isNaN(_j879) || !isFinite(_j879) ? 0 : constrain(_j879, 0, 1);
_j888 = lerp(_j876[j].x, _j876[j + 1].x, _j891);
_j889 = lerp(_j876[j].y, _j876[j + 1].y, _j891);
angle = atan2(_j876[j + 1].y - _j876[j].y, _j876[j + 1].x - _j876[j].x);
break;
}
_j887 += _j890;
}
const _j892 = 200 * (1 - _j885 * 0.5);
_j623.translate(_j888, _j889);
_j623.rotate(angle);
const _j893 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j623.fill(0, 0, 255, _j892);
_j623.noStroke();
_j623.triangle(
0, 0,
-4 * _j893, -2 * _j893,
-4 * _j893, 2 * _j893
);
_j623.stroke(0, 150, 255, _j892);
_j623.strokeWeight(0.3);
_j623.noFill();
_j623.triangle(
0, 0,
-4 * _j893, -2 * _j893,
-4 * _j893, 2 * _j893
);
_j623.pop();
}
const _j894 = path[0];
const _j415 = path[path.length - 1];
_j623.noFill();
_j623.stroke(0, 0, 255, 150);
_j623.strokeWeight(0.8);
_j623.ellipse(_j894.x, _j894.y, 5, 5);
_j623.ellipse(_j415.x, _j415.y, 5, 5);
_j623.noStroke();
_j623.fill(0, 0, 255, 255);
_j623.ellipse(_j894.x, _j894.y, 2, 2);
_j623.ellipse(_j415.x, _j415.y, 2, 2);
if (font) {
_j623.textFont(font);
_j623.noStroke();
const data = _j871.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j895 = _j894.x - 2;
const _j896 = _j894.y + 8;
_j623.textSize(6);
_j623.fill(0, 0, 255, 255);
_j623.textAlign(LEFT, CENTER);
_j623.text('#' + (i + 1), _j895, _j896);
}
}
_j623.pop();
}
function _j43() {
_j621.clear();
_j621.push();
_j621.noFill();
_j621.noStroke();
_j621.rectMode(CENTER);
let _j799 = (width * 0.05) / height;
_j621.rect(0, 0, width * 0.95, height * (1 - _j799));
_j621.translate(-width / 2 - 5, -height / 2 + 20);
_j621.textAlign(LEFT, TOP);
if (font) {
_j621.textFont(font);
}
_j621.textSize(6);
let _j897 = width - 50;
_j621.fill(0, 0, 0, 100);
_j621.noStroke();
let _j898 = [];
let _j281 = _j712;
let _j899 = Math.max(0, _j708.length - _j709 - _j710);
let _j900 = _j708.length;
for (let i = _j899; i < _j900; i++) {
let line = _j708[i];
let _j901 = _j46(line.text, _j897, _j621);
for (let j = 0; j < _j901.length; j++) {
if (_j898.length >= _j709) break;
_j898.push({
type: line.type,
text: _j901[j],
timestamp: line.timestamp
});
}
if (_j898.length >= _j709) break;
}
for (let i = 0; i < _j898.length; i++) {
let line = _j898[i];
let y = _j712 + i * _j713;
if (line.type === 'recording') {
_j621.fill(255, 0, 0, _j714);
} else if (line.type === 'playback') {
_j621.fill(0, _j714);
} else if (line.type === 'system') {
_j621.fill(0, 0, 255, _j714);
} else if (line.type === 'art') {
_j621.fill(0, _j714);
} else {
_j621.fill(0, _j714);
}
_j621.text("--", _j711, y);
_j621.text(line.text, _j711, y);
}
_j45();
_j621.pop();
_j44();
}
function _j44() {
if (window.showStrokeDivider === false) return;
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (strokeCount === 0) return;
_j621.push();
_j621.resetMatrix();
_j621.translate(0, 0);
const _j902 = hh - 15;
const _j903 = width * 0.98;
const _j904 = -_j903 / 2;
const _j905 = _j903 / 2;
const _j906 = _j905 - _j904;
_j621.stroke(0, 50);
_j621.strokeWeight(1);
_j621.noFill();
_j621.line(_j904, _j902, _j905, _j902);
_j621.strokeWeight(1.2);
_j621.line(_j904, _j902 + 5, _j904, _j902 - 5);
_j621.line(_j905, _j902 + 5, _j905, _j902 - 5);
if (strokeCount > 0) {
const _j907 = _j906 / strokeCount;
_j621.stroke(0, 70);
_j621.strokeWeight(0.7);
for (let i = 1; i < strokeCount; i++) {
const x = _j904 + i * _j907;
_j621.line(x, _j902 - 5, x, _j902);
}
if (font) _j621.textFont(font);
_j621.textAlign(CENTER, CENTER);
_j621.textSize(10);
_j621.fill(0, 50);
_j621.noStroke();
const _j895 = _j905;
const _j896 = _j902 - 15;
_j621.text(strokeCount.toString(), _j895, _j896);
}
_j621.pop();
}
function _j45() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j908 = millis();
const _j436 = _j908 - currentStrokeHighlight.startTime;
const _j909 = 1000;
const _j910 = _j909 * 0.5;
if (_j436 < _j909) {
let alpha = 255;
if (_j436 > _j910) {
const _j911 = (_j436 - _j910) / (_j909 - _j910);
alpha = 255 * (1 - _j911);
}
const gp = currentStrokeHighlight.gridParams;
_j621.push();
_j621.resetMatrix();
_j621.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j407 = 5;
const _j408 = 5;
_j621.stroke(255, 0, 0, alpha);
_j621.strokeWeight(1);
_j621.noFill();
let _j912 = true;
let _j887 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j409 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j409;
let dy = (y2 - y1) / _j409;
let _j410 = 0;
while (_j410 < _j409) {
let _j411 = _j912 ? _j407 : _j408;
let _j412 = min(_j411 - _j887, _j409 - _j410);
if (_j912) {
let startX = x1 + dx * _j410;
let startY = y1 + dy * _j410;
let _j413 = x1 + dx * (_j410 + _j412);
let _j414 = y1 + dy * (_j410 + _j412);
_j621.line(startX, startY, _j413, _j414);
}
_j410 += _j412;
_j887 += _j412;
if (_j887 >= (_j912 ? _j407 : _j408)) {
_j912 = !_j912;
_j887 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j894 = currentStrokeHighlight.points[0];
const _j415 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j621.fill(255, 0, 0, alpha);
_j621.noStroke();
_j621.ellipse(_j894.x, _j894.y, 5, 5);
_j621.fill(255, 0, 0, alpha);
_j621.ellipse(_j415.x, _j415.y, 5, 5);
}
}
const _j371 = (gp.left + gp.right) / 2;
const _j372 = (gp.top + gp.bottom) / 2;
_j621.stroke(0, 0, 200, alpha);
_j621.strokeWeight(1.0);
_j621.noFill();
_j621.rectMode(CORNER);
_j621.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j621.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j46(text, _j1548, buffer = null) {
let _j913 = text.split(' ');
let _j774 = [];
let _j914 = '';
for (let i = 0; i < _j913.length; i++) {
let _j915 = _j914 + (_j914 ? ' ' : '') + _j913[i];
let _j916 = buffer ? buffer.textWidth(_j915) : textWidth(_j915);
if (_j916 > _j1548 && _j914) {
_j774.push(_j914);
_j914 = _j913[i];
} else {
_j914 = _j915;
}
}
if (_j914) {
_j774.push(_j914);
}
return _j774;
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
_j573 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j551 = _j188(mouseX);
_j552 = _j188(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j573) return true;
if (_j562) return true;
_j551 = _j188(mouseX);
_j552 = _j188(mouseY);
return false;
}
function touchEnded() {
if (_j573) {
_j573 = false;
return true;
}
_j573 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j48(clientX, clientY) {
const _j917 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('mask-panel'),
document.getElementById('zen-mode-btn'),
document.getElementById('collect-panels-btn')
];
for (let panel of _j917) {
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
const _j918 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j918)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j918)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j918)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j918)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j918 = 20;
return {
minX: Math.max(0, (gp.left - _j918)) / width,
minY: Math.max(0, (gp.top - _j918)) / height,
maxX: Math.min(width, (gp.right + _j918)) / width,
maxY: Math.min(height, (gp.bottom + _j918)) / height
};
}
return null;
}
function _j50(blendType, seed = null, _j1549 = false) {
if (!_j523) return;
_j600 = true;
_j601 = blendType;
_j602 = millis();
_j608 = 0;
_j603 = 0;
_j611 = _j1549;
_j605 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j613.seed = _j605 * 0.0001;
}
function _j51() {
if (!_j600) return null;
const duration = millis() - _j602;
const iterations = _j603;
const frames = _j608;
if (iterations > 0 && flowEffectStrokeBounds) {
_j606 = true;
_j607 = {
blendType: _j601,
iterations: iterations,
seed: _j605,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j600 = false;
_j601 = 0;
_j611 = false;
return {
duration,
iterations,
frames
};
}
function _j52() {
if (!_j600) return;
_j608++;
_j603 = Math.floor(_j608 / _j612);
if (_j611 && _j609 > 0) {
if (_j608 >= _j609) {
_j603 = _j610;
const _j919 = document.getElementById('flow-iteration-count');
if (_j919) {
_j919.textContent = _j603;
}
_j51();
_j609 = 0;
_j610 = 0;
return;
}
}
const _j919 = document.getElementById('flow-iteration-count');
if (_j919) {
_j919.textContent = _j603;
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
_j613.seed = seed * 0.0001;
_j606 = true;
_j607 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j607);
}
const _j920 = [{
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
function _j54(buffer, _j931, _j932, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j931, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j932, alpha);
}
}
function _j55(buffer, _j931, _j932, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j931, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j932, alpha);
}
}
function _j56(id, buffer, _j1014, x, y, _j975, _j976, _j968, _j969, _j989, sizeVariation, _j1008) {
let _j921 = _j989 * sizeVariation + _j1008;
const _j922 = (_j560 && typeof _j572 !== 'undefined' && _j572 !== null) ? _j572 : baseBrushSize;
const _j923 = _j922 < 0.25;
let _j924 = _j923 ? max(2.0, _j922 * 10) : 15;
if (_j921 > _j924) {
_j921 = crandom.random(_j923 ? 0.6 : 1, _j924);
}
let sw = max(_j923 ? 0.6 : 1, _j921);
if (sw < 3) sw *= 2.0;
const offsetX = _j1014.offsetX;
const offsetY = _j1014.offsetY;
if (brushModeSP) {
const _j925 = max(0.15, min(1.5, _j922));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j926 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j925, 6 * _j925) : crandom.random(-16 * _j925, 16 * _j925);
let _j927 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j925, 6 * _j925) : crandom.random(-16 * _j925, 16 * _j925);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j968,
y + offsetY + _j969,
_j975 + offsetX + _j926,
_j976 + offsetY + _j927
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j968,
y + offsetY + _j969,
_j975 + offsetX,
_j976 + offsetY
);
}
} else if (!brushModeSP) {
if (_j922 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j968,
y + offsetY + _j969,
_j975 + offsetX,
_j976 + offsetY
);
}
}
const _j928 = [{
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
const _j929 = [{
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
const _j930 = [{
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
function _j57(buffer, _j1550, _j1551) {
if (_j579 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j579, ">=", expectedStrokeLength, ")");
return;
}
buffer.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j931 = _j60(_j524);
let _j932 = _j60(_j524);
const _j933 = _j638 ? _j644 : pmouseX;
const _j934 = _j638 ? _j645 : pmouseY;
let _j935 = 0.5 * initialSize * noise(_j1550 * 0.01, _j1551 * 0.01) * (abs(_j1550 - _j933) + abs(_j1551 - _j934));
const _j936 = (_j560 && typeof _j572 !== 'undefined' && _j572 !== null) ? _j572 : baseBrushSize;
let _j937 = 0;
_j937 = min(spraySize * _j936, _j935) * map(noise(_j1550, _j1551), 0, 1, 0.3, 1);
let _j938 = max(3, _j937);
if (_j579 < 5) {
let _j939 = map(_j579, 0, 5, -0.2, 1.0);
_j938 = max(2, _j937 * _j939);
} else if (_j579 >= (expectedStrokeLength - 5)) {
let _j940 = map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j938 = max(2, _j937 * _j940);
}
for (let i = 0; i < _j586; i++) {
const _j941 = lerp(_j1550, _j933, i / _j586)
const lerpY = lerp(_j1551, _j934, i / _j586)
for (let j = 0; j < 10; j++) {
let _j926, _j927;
let _j942 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j943 = crandom.random(TWO_PI);
const _j944 = crandom.random();
const _j945 = crandom.random(-_j938 * _j942, _j938 * _j942);
const _j946 = crandom.random(-_j938 * _j942, _j938 * _j942);
if (shapeType === 0) {
const angle = _j943;
const radius = sqrt(_j944) * _j938;
_j926 = radius * cos(angle);
_j927 = radius * sin(angle);
} else if (shapeType === 1) {
_j926 = sin(_j943) * _j945;
_j927 = cos(_j943) * _j946;
} else if (shapeType === 2) {
const u = _j943 / TWO_PI;
const v = _j944;
if (u + v > 1) {
_j926 = _j938 * (1 - u);
_j927 = _j938 * (1 - v);
} else {
_j926 = _j938 * u;
_j927 = _j938 * v;
}
_j926 -= _j938 * 0.5;
_j927 -= _j938 * 0.5;
} else {
const u = _j945 / _j938;
const v = _j946 / _j938;
const _j947 = abs(u) + abs(v);
if (_j947 > 1) {
_j926 = (u / _j947) * _j938;
_j927 = (v / _j947) * _j938;
} else {
_j926 = u * _j938;
_j927 = v * _j938;
}
}
let _j789 = crandom.random(0, 1);
let _j790 = crandom.random(0.2, 1);
let _j948 = crandom.random(1, 2);
let _j949 = _j936 < 0.25 ? 0.1 : 0.3;
_j790 = max(_j949, _j790 * _j936);
_j948 = max(_j949, _j948 * _j936);
let _j950 = crandom.random(100, 255);
let ss = _j789 > 0.1 ? _j790 : _j948;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j951 = _j936 < 0.25 ? max(0.3, _j936 * 3) : 2;
let _j952 = _j936 < 0.25 ? _j936 * 5 : 20;
ss = max(_j951, min(_j952, ss));
_j55(buffer, _j931, _j932, brushColorMode, _j950);
noStroke();
ellipse(_j941 + _j926, lerpY + _j927, ss, ss)
}
}
pop();
buffer.end();
}
function _j58(buffer, _j1550, _j1551, _j808, _j530 = 0, _j1552 = 0) {
if (_j579 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j579, ">=", expectedStrokeLength, ")");
return;
}
buffer.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j931 = _j60(_j524);
let _j932 = _j60(_j524);
const _j953 = (_j560 && typeof _j572 !== 'undefined' && _j572 !== null) ? _j572 : baseBrushSize;
const _j954 = _j560 ? (_j638 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j570) : -1;
const _j955 = (_j954 >= 0) ? (0.7 + 0.4 * Math.min(_j954 / 0.7, 1.0)) : 1.0;
let _j923 = _j953 < 0.25;
let _j956 = 0.6;
let _j957 = _j923 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j956, baseBrushSize * 2);
let _j958 = max(_j956, baseBrushSize * 1.5);
let _j959 = _j923 ? swFloorTiny : _j958;
if (_j959 < 3) _j959 *= 2.0;
let _j960 = _j923 ?
swFloorTiny :
max(_j956, baseBrushSize * 1.2);
if (_j960 < 3) _j960 *= 2.0;
let _j961;
if (_j923) {
_j961 = max(2.0, _j953 * 10);
} else if (_j953 < 0.5) {
_j961 = 0.7;
} else {
_j961 = 9999;
}
_j547 = _j537 * 0.5;
let _j446 = _j1550;
let _j447 = _j1551;
if (!_j550) {
_j550 = 1;
x = _j446;
y = _j447;
}
_j534 += (_j446 - x) * _j531;
_j535 += (_j447 - y) * _j531;
_j534 *= _j532;
_j535 *= _j532;
let _j962 = sqrt(_j534 * _j534 + _j535 * _j535);
_j536 += _j962 - _j536;
if (baseBrushSize <= 1.0) {
_j536 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j536 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j536 *= 2.0;
} else {
_j536 *= 3.0;
}
_j537 = _j533 - _j536;
let _j963 = brushPaintCtlNoisebyFrame;
let _j964 = 1.0 * baseBrushSize * _j963 * _j955;
let _j965 = 2.0 * baseBrushSize * _j963 * _j955;
let _j966 = 3.0 * baseBrushSize * _j963 * _j955;
let showMainBrush = 0.1;
let _j967 = initialSize;
let _j968 = 0;
let _j969 = 0;
if (_j1552 == 0) showMainBrush = 0.08;
else if (_j1552 == 1) showMainBrush = 0.6;
else if (_j1552 == 2) showMainBrush = 0.2;
let _j970 = 1.0;
let _j971 = _j529 + brushPaintInterpolationOffset;
for (let i = 0; i < _j971; ++i) {
let _j972 = baseBrushSize >= 1.0 ? 5 : 3;
let _j973 = baseBrushSize >= 1.0 ? 2 : 0;
let _j974 = 0;
if (baseBrushSize < 1.5) _j974 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j974 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j974 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j974 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j530 = _j974;
if (_j579 < 5) _j530 = crandom.random(0, 1) > 0.2 ? 5 : _j530;
let _j975 = x;
let _j976 = y;
x += _j534 / _j971;
y += _j535 / _j971;
let _j977 = crandom.random(0, 1);
let _j978 = crandom.random(0, 4);
let _j979 = crandom.random(0, 3);
let _j980 = crandom.random(-1, 1);
let _j981 = crandom.random(-1, 1);
let _j982 = crandom.random(-1, 1);
let _j983 = crandom.random(-1, 1);
let _j984 = showMainBrush;
let _j985 = 1.0;
if (_j530 == 3) {
_j984 *= 0.8;
_j985 *= 0.8;
} else if (_j530 == 4) {
_j984 *= 0.6;
_j985 *= 0.5;
}
if (_j953 < 0.25) {
_j984 = 0.18;
} else if (_j953 < 1.5) {
_j984 = 0.1;
}
_j541 = lerp(_j541, _j537, 0.5);
if (brushMode == 1) {
if (_j977 > 0.8 && _j547 < 2 && i == 0) {
_j547 = _j188(_j978);
}
} else {
_j547 += (_j541 - _j547) * 0.3;
}
let _j986;
if (brushMode == 1) {
_j986 = _j547;
} else {
if (_j579 < 5) {
let _j939 = map(_j579, 0, 5, 0.05, 1.0);
_j986 = max(_j923 ? 0.1 : 0.5, _j547 * _j939);
if (explodeStart) {
_j968 = _j980 * map(_j579, 0, 5, 10, 0);
_j969 = _j981 * map(_j579, 0, 5, 10, 0);
}
} else if (_j579 >= (expectedStrokeLength - 5)) {
let _j940 = map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j986 = max(_j923 ? 0.1 : 0.5, _j547 * _j940);
if (explodeEnd) {
_j968 = _j982 * map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j969 = _j983 * map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j547 > 2) {
_j986 = max(_j923 ? 0.2 : 1, _j547);
} else {
let _j987 = (_j979 / 3) - 0.5;
_j986 = max(_j923 ? 0.1 : 0.5, _j547 + _j987);
}
}
}
let _j988 = _j986;
let _j989 = _j986 * 0.5;
if (_j530 == 3) {
_j988 *= 0.8;
_j989 *= 0.8;
} else if (_j530 == 4) {
_j988 *= 0.5;
_j989 *= 0.5;
}
let _j990 = crandom.random(0, 1);
let _j991 = crandom.random(150, 255);
let _j992 = crandom.random(100, 255);
let _j993 = crandom.random(100, 255);
let _j994 = crandom.random(100, 255);
if (_j923) {
if (!brushModeSP && _j579 > 1) {
_j54(buffer, _j931, _j932, brushColorMode, _j991);
let kk = min(_j967, max(_j959, _j988));
strokeWeight(min(_j961, kk));
line(x + _j968, y + _j969, _j975, _j976);
}
} else if (_j990 > _j984) {
_j54(buffer, _j931, _j932, brushColorMode, _j991);
const _j995 = !brushModeSP && _j579 > 3 && baseBrushSize < 4.0;
if (_j988 < 5) {
let kk = 0;
if (_j1552 == 0) kk = 1.5 * min(_j967, max(_j959, _j988));
else kk = min(_j967, max(_j959, _j988));
strokeWeight(min(_j961, kk));
if (_j995) line(x + _j968, y + _j969, _j975, _j976)
} else {
let kk = _j985 * min(_j967, max(_j959, _j988));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j961, kk));
if (_j995) line(x + _j968, y + _j969, _j975, _j976)
}
}
const _j996 = [];
const _j997 = [];
for (let j = 0; j < 30; j++) {
_j996.push(crandom.random(0, 1));
_j997.push(crandom.random(-0.5, 0.5) * _j970);
}
if (_j1552 == 1) {
_j996[0] = _j996[0] * 2.0;
_j996[1] = _j996[1] * 0.5;
_j996[2] = _j996[2] * 0.5;
} else if (_j1552 == 2) {
_j996[0] = _j996[0] * 0.5;
_j996[1] = _j996[1] * 0.5;
_j996[2] = _j996[2] * 0.5;
}
const _j998 = _j920[brushDir];
if (_j530 == 0) {
_j54(buffer, _j931, _j932, brushColorMode, _j992);
if (_j996[0] > 0.2) {
const _j999 = _j998.flip1stX ? -1 : +1;
const _j1000 = _j998.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j997[0], sizeVariation);
if (_j989 * sizeVariation < 5) {
strokeWeight(min(_j961, noise(x * 0.1, y * 0.2) + 1.5 * max(_j960, _j989 * sizeVariation)));
} else {
strokeWeight(min(_j961, _j985 * max(_j957, _j989 * sizeVariation)));
}
line(x + _j999 * _j965 + _j968, y + _j1000 * _j965 + _j969, _j975 + _j999 * _j965, _j976 + _j1000 * _j965);
}
if (_j996[1] > 0.3) {
const _j1001 = _j998.flip1stX ? -1 : +1;
const _j1002 = _j998.flip1stY ? +1 : -1;
_j54(buffer, _j931, _j932, brushColorMode, _j993);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j997[1], sizeVariation);
strokeWeight(min(_j961, _j985 * max(_j957, _j989 * sizeVariation)));
line(x + _j1001 * _j965 + _j968, y + _j1002 * _j965 + _j969, _j975 + _j1001 * _j965, _j976 + _j1002 * _j965);
}
} else if (_j530 == 1) {
_j54(buffer, _j931, _j932, brushColorMode, _j992);
if (_j996[0] > 0.1) {
const _j999 = _j998.flip1stX ? -1 : +1;
const _j1000 = _j998.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j997[0], sizeVariation);
strokeWeight(min(_j961, _j985 * max(_j957, _j989 * sizeVariation)));
line(x + _j999 * _j965 + _j968, y + _j1000 * _j965 + _j969, _j975 + _j999 * _j965, _j976 + _j1000 * _j965)
};
if (_j996[1] > 0.05) {
const _j1001 = _j998.flip1stX ? -1 : +1;
const _j1002 = _j998.flip1stY ? +1 : -1;
_j54(buffer, _j931, _j932, brushColorMode, _j993);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j997[1], sizeVariation);
strokeWeight(min(_j961, _j985 * max(_j957, _j989 * sizeVariation)));
line(x + _j1001 * _j964 + _j968, y + _j1002 * _j964 + _j969, _j975 + _j1001 * _j964, _j976 + _j1002 * _j964)
};
if (_j996[2] > 0.15) {
const _j1003 = -1;
const _j1004 = -1;
_j54(buffer, _j931, _j932, brushColorMode, _j994);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j997[2], sizeVariation);
if (_j989 * sizeVariation < 5) {
strokeWeight(min(_j961, noise(x * 1, y * 2) + 1.5 * max(_j960, _j989 * sizeVariation)));
} else {
strokeWeight(min(_j961, _j985 * max(_j957, _j989 * sizeVariation)));
}
line(x + _j1003 * _j966 + _j968, y + _j1004 * _j966 + _j969, _j975 + _j1003 * _j966, _j976 + _j1004 * _j966)
};
} else if (_j530 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j54(buffer, _j931, _j932, brushColorMode, _j992);
const _j1005 = [_j996[0], _j996[1], _j996[2], _j996[3], _j996[4]];
const _j1006 = [_j997[3], _j997[4], _j997[5], _j997[6], _j997[7]];
for (let i = 0; i < _j928.length; i++) {
const _j276 = _j928[i];
const _j1007 = _j1005[i];
const _j1008 = _j1006[i];
if (_j1007 > _j276.randThreshold) {
let _j1009;
if (_j276.offsetBase === 1) {
_j1009 = _j964;
} else if (_j276.offsetBase === 2) {
_j1009 = _j965;
} else if (_j276.offsetBase === 3) {
_j1009 = _j966;
} else {
_j1009 = _j276.offsetBase * baseBrushSize * _j963;
}
let _j1010, _j1011;
if (i === 0) {
_j1010 = _j998.flip1stX ? -_j276.signX : _j276.signX;
_j1011 = _j998.flip1stY ? -_j276.signY : _j276.signY;
} else {
_j1010 = _j276.signX;
_j1011 = _j276.signY;
}
let _j1012 = _j1010 * _j1009;
let _j1013 = _j1011 * _j1009;
const _j1014 = {
offsetX: _j1012,
offsetY: _j1013,
randThreshold: _j276.randThreshold,
pathProgressEnd: _j276.pathProgressEnd,
jitterIndex: _j276.jitterIndex
};
_j56(
2, buffer, _j1014, x, y, _j975, _j976,
_j968, _j969, _j989, sizeVariation,
_j1008
);
}
}
} else if (_j530 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j54(buffer, _j931, _j932, brushColorMode, _j992);
let _j1015 = baseBrushSize * _j963;
if (baseBrushSize > 4.0) _j1015 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j929.length; i++) {
let _j1016 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j276 = _j929[i];
const _j1007 = _j996[i];
const _j1008 = _j997[_j276.jitterIndex];
if (_j1007 > _j276.randThreshold) {
const _j1017 = cos(_j276.angle + _j1016) * _j276.radius * _j1015;
const _j1018 = sin(_j276.angle + _j1016) * _j276.radius * _j1015;
const _j1012 = (_j998.flip1stX ? -1 : 1) * _j1017;
const _j1013 = (_j998.flip1stY ? -1 : 1) * _j1018;
const _j1014 = {
offsetX: _j1012,
offsetY: _j1013,
randThreshold: _j276.randThreshold,
pathProgressEnd: _j276.pathProgressEnd,
jitterIndex: _j276.jitterIndex
};
_j56(
3, buffer, _j1014, x, y, _j975, _j976,
_j968, _j969, _j989, sizeVariation,
_j1008
);
}
}
} else if (_j530 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j54(buffer, _j931, brushColorMode, _j992);
let _j1015 = baseBrushSize * _j963;
if (baseBrushSize > 4.0) _j1015 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j930.length; i++) {
let _j1016 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j276 = _j930[i];
const _j1007 = _j996[i];
const _j1008 = _j997[_j276.jitterIndex];
if (_j1007 > _j276.randThreshold) {
const _j1017 = cos(_j276.angle + _j1016) * _j276.radius * _j1015;
const _j1018 = sin(_j276.angle + _j1016) * _j276.radius * _j1015;
const _j1012 = (_j998.flip1stX ? -1 : 1) * _j1017;
const _j1013 = (_j998.flip1stY ? -1 : 1) * _j1018;
const _j1014 = {
offsetX: _j1012,
offsetY: _j1013,
randThreshold: _j276.randThreshold,
pathProgressEnd: _j276.pathProgressEnd,
jitterIndex: _j276.jitterIndex
};
_j56(
4, buffer, _j1014, x, y, _j975, _j976,
_j968, _j969, _j989, sizeVariation,
_j1008
);
}
}
}
}
pop();
buffer.end();
}
function _j59(buffer, _j1550, _j1551, _j1553 = null, _j1554 = null, n = 80, o = 2) {
buffer.begin();
push();
translate(-hw, -hh);
const _j933 = (_j1553 !== null && _j1554 !== null) ? _j1553 : (_j638 ? _j644 : pmouseX);
const _j934 = (_j1553 !== null && _j1554 !== null) ? _j1554 : (_j638 ? _j645 : pmouseY);
const _j1019 = (_j560 && typeof _j572 !== 'undefined' && _j572 !== null) ? _j572 : baseBrushSize;
const _j1020 = baseBrushSize;
const _j1021 = _j579;
const _j1022 = max(_j1019 < 0.25 ? 0.3 : 1, initialSize - (_j579 * randStep));
o = min(_j1020 * 2.0, 5 * _j1022 * penSketchNoiseBase * map(sin(_j1021 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1550 - _j933) > 0.1 || abs(_j1551 - _j934) > 0.1;
let _j931 = _j60(_j524);
let _j932 = _j60(_j524);
const _j1023 = [];
for (let i = 0; i < n; i++) {
_j1023.push({
t: crandom.random(0, 1),
strokeWeight: max(_j1019 < 0.25 ? 0.1 : 0.3, min(_j1019 < 0.25 ? _j1020 * 5 : 2, _j1020 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j1024 = _j1023[i];
let t = _j1024.t;
strokeWeight(_j1024.strokeWeight);
const angle = _j1024.angle;
const radius = _j1024.radius;
let _j1025 = radius * cos(angle);
let _j1026 = radius * sin(angle);
let _j950 = _j1024.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1550, _j933, t) + _j1025;
y = lerp(_j1551, _j934, t) + _j1026;
} else {
x = _j1550 + _j1025;
y = _j1551 + _j1026;
}
_j54(buffer, _j931, _j932, brushColorMode, _j950);
if (_j579 > 3) point(x, y);
}
pop();
buffer.end();
}
if (typeof _j61.lastAngle === 'undefined') {
_j61.lastAngle = 0;
}
if (typeof _j61.lastMovementAngle === 'undefined') {
_j61.lastMovementAngle = 0;
}
const _j1027 = [{
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
function _j60(_j931) {
if (brushColorMode === 0) {
return _j931 + crandom.random(10, 40);
} else {
return _j931 + crandom.random(30, 80);
}
}
function _j61(buffer, _j1550, _j1551, _j808, _j530 = 0, _j1552 = 0) {
if (_j579 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j579, ">=", expectedStrokeLength, ")");
return;
}
const _j1028 = (_j560 && typeof _j572 !== 'undefined' && _j572 !== null) ? _j572 : baseBrushSize;
let _j923 = _j1028 < 0.25;
let _j961 = _j923 ? _j1028 * 5 : 9999;
buffer.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j931 = _j60(_j524);
let _j932 = _j60(_j524);
let _j967 = initialSize * 0.3;
let _j446 = _j1550;
let _j447 = _j1551;
if (!_j550) {
_j550 = 1;
x = _j446;
y = _j447;
}
_j534 += (_j446 - x) * _j531;
_j535 += (_j447 - y) * _j531;
_j534 *= _j532;
_j535 *= _j532;
_j536 += sqrt(_j534 * _j534 + _j535 * _j535) - _j536;
_j536 *= 1.2;
if (baseBrushSize <= 1.0) {
_j536 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j536 *= 1.3;
} else {
_j536 *= 1.5;
}
_j537 = _j533 - _j536;
let _j1029 = _j541;
let _j1030 = _j537;
let _j1031 = _j446 - x;
let _j1032 = _j447 - y;
let _j1033 = sqrt(_j1031 * _j1031 + _j1032 * _j1032);
let _j1034 = max(_j923 ? 0.1 : 0.5, _j1030 * 0.5);
let _j1035 = 1.5 * min(_j967, max(_j923 ? 0.5 : 4, _j1034));
let _j1036 = _j1035 * 0.6;
let _j1037 = 0.8;
let _j1038 = max(_j1036 * _j1037, 0.5);
let _j1039 = max(1, ceil(_j1033 / _j1038));
_j1039 = max(10, min(50, _j1039));
let _j1040 = _j1039 / _j529;
let _j968 = 0;
let _j969 = 0;
let _j1041 = min(1.0, _j1033 / 10);
let _j1042 = _j1041 > 0.3;
rectMode(CENTER);
let _j240 = crandom.random(50, 100);
const _j243 = [];
for (let i = 0; i < _j529; ++i) {
_j243.push({
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
for (let i = 0; i < _j529; ++i) {
const _j1043 = _j243[i];
let _j975 = x;
let _j976 = y;
x += _j534 / _j529;
y += _j535 / _j529;
let _j437 = (i + 1) / _j529;
let _j1044 = lerp(_j1029, _j1030, _j437);
_j541 = lerp(_j541, _j1044, 0.5);
_j547 += (_j541 - _j547) * 0.8;
_j547 = max(_j923 ? 0.2 : 1.5, _j547);
let _j986;
let _j980 = _j1043.explodeX1;
let _j981 = _j1043.explodeY1;
let _j982 = _j1043.explodeX2;
let _j983 = _j1043.explodeY2;
if (_j579 < 5) {
let _j939 = map(_j579, 0, 5, 0.05, 1.0);
_j986 = max(_j923 ? 0.1 : 0.5, _j547 * _j939);
if (explodeStart) {
_j968 = _j980 * map(_j579, 0, 5, 10, 0);
_j969 = _j981 * map(_j579, 0, 5, 10, 0);
}
} else if (_j579 >= (expectedStrokeLength - 5)) {
let _j940 = map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j986 = max(_j923 ? 0.1 : 0.5, _j547 * _j940);
if (explodeEnd) {
_j968 = _j982 * map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j969 = _j983 * map(_j579, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j986 = max(_j923 ? 0.1 : 0.5, _j547);
}
let _j990 = _j1043.showMainBrush;
let _j991 = _j1043.mainAlpha;
let showMainBrush = 0.3;
let _j1045 = showMainBrush;
if (_j1040 > 1.0) {
_j1045 = showMainBrush / _j1040;
} else if (_j1040 < 1.0) {
_j1045 = showMainBrush * (2.0 - _j1040);
}
if (_j990 > _j1045 && _j579 > 5) {
noStroke();
_j54(buffer, _j931, _j932, brushColorMode, _j991);
let ss = min(_j961, 1.2 * min(_j967, max(3 * _j1028, _j986)));
let dx = x - _j975;
let dy = y - _j976;
let distance = sqrt(dx * dx + dy * dy);
let _j282;
const _j329 = 0.1;
if (distance < _j329) {
_j282 = _j61.lastAngle;
} else {
let _j1046 = atan2(dy, dx);
_j282 = _j1046 + PI / 2;
_j61.lastAngle = _j282;
_j61.lastMovementAngle = _j1046;
}
push();
translate(x, y);
rotate(_j282);
let _j1036 = ss * _j1043.rectWidthMult;
rect(0, 0, _j1036, _j1036 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j1041 > 0.9 && _j579 > 5 && _j579 < (expectedStrokeLength - 5)) {
let _j1047 = -sin(_j61.lastMovementAngle);
let _j1048 = cos(_j61.lastMovementAngle);
for (let j = 0; j < _j1027.length; j++) {
let _j1049 = _j1027[j];
let _j1050 = _j1043.flyWhiteRandoms[j];
let _j1051 = _j1049.randThreshold - _j1041 * 0.3;
if (_j1050 > _j1051) {
let offsetX = _j1047 * _j1049.perpOffset * _j1028;
let offsetY = _j1048 * _j1049.perpOffset * _j1028;
stroke(_j240);
strokeWeight(min(_j961, max(_j923 ? 0.1 : 0.5, _j986 * 0.3)));
line(_j975 + offsetX, _j976 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
buffer.end();
}
let _j1052 = [];
let _j1053 = 0;
function _j62(baseBrushSize, strokeSeed) {
let _j1054, _j1055;
if (baseBrushSize <= 0.1) {
_j1054 = 2;
_j1055 = 4;
} else if (baseBrushSize <= 0.25) {
_j1054 = 4;
_j1055 = 7;
} else if (baseBrushSize <= 0.5) {
_j1054 = 6;
_j1055 = 10;
} else if (baseBrushSize <= 2.0) {
_j1054 = 10;
_j1055 = 15;
} else if (baseBrushSize <= 3.0) {
_j1054 = 20;
_j1055 = 30;
} else {
_j1054 = 30;
_j1055 = 50;
}
let count;
if (_j1054 === _j1055) {
count = _j1054;
} else {
const _j1056 = strokeSeed + 50000;
randomSeed(_j1056);
count = Math.floor(crandom.random(_j1054, _j1055 + 1));
}
const _j1057 = [];
const _j1058 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1059 = _j1058 + i * 1000;
randomSeed(_j1059);
const perpOffset = crandom.random(-6, 6);
const _j1060 = _j1058 + i * 2000 + 1;
randomSeed(_j1060);
const randThreshold = crandom.random(0.5, 1.0);
const _j1061 = _j1058 + i * 3000 + 2;
randomSeed(_j1061);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1062 = _j1058 + i * 4000 + 3;
randomSeed(_j1062);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1063 = _j1058 + i * 5000 + 4;
randomSeed(_j1063);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1064 = _j1058 + i * 6000 + 5;
randomSeed(_j1064);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1065 = _j1058 + i * 7000 + 6;
randomSeed(_j1065);
const endDistanceOffset = crandom.random(0, 8);
const _j1066 = _j1058 + i * 8000 + 7;
randomSeed(_j1066);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1067 = _j1058 + i * 9000 + 8;
randomSeed(_j1067);
const widthVariationFactor = crandom.random(0, 1);
const _j1068 = _j1058 + i * 10000 + 9;
randomSeed(_j1068);
const offsetVariationFactor = crandom.random(0, 1);
_j1057.push({
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
_j1057.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1057;
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
function _j64(buffer, _j1550, _j1551, _j1553 = null, _j1554 = null) {
if (_j579 >= expectedStrokeLength) {
return;
}
buffer.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j933 = (_j1553 !== null && _j1554 !== null) ? _j1553 : (_j638 ? _j644 : pmouseX);
const _j934 = (_j1554 !== null && _j1554 !== null) ? _j1554 : (_j638 ? _j645 : pmouseY);
const _j1069 = _j1550 - _j933;
const _j1070 = _j1551 - _j934;
const _j1071 = sqrt(_j1069 * _j1069 + _j1070 * _j1070);
const speedMultiplier = map(constrain(_j1071, 3, 50), 0, 50, 0.1, 5.0);
let _j1072 = 0,
_j1073 = 0;
let _j1074 = 0,
_j1075 = 0;
let _j1076 = 0,
_j1077 = 0;
if (_j1071 > 0.1) {
_j1072 = _j1069 / _j1071;
_j1073 = _j1070 / _j1071;
_j1074 = -_j1073;
_j1075 = _j1072;
_j1076 = _j1073;
_j1077 = -_j1072;
} else {
_j1074 = 0;
_j1075 = 1;
_j1076 = 0;
_j1077 = -1;
}
const _j1078 = _j579 < expectedStrokeLength;
const _j1079 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1080 = strokeSeed + _j579 * 10000 + 1;
randomSeed(_j1080);
const _j1081 = _j1078 ? Math.floor(crandom.random(0, _j1079)) : 0;
for (let i = 0; i < _j1081; i++) {
const _j1082 = strokeSeed + _j579 * 1000 + _j1053;
randomSeed(_j1082);
const _j1083 = crandom.random(5, 15) * baseBrushSize;
const _j1084 = _j1550 + crandom.random(-2, 2) * baseBrushSize;
const _j1085 = _j1551 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1086, _j1087, _j1088;
if (brushColorMode === 0) {
_j1086 = _j1087 = _j1088 = _j524 * 0.3;
} else if (brushColorMode === 1) {
_j1086 = _j1087 = _j1088 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1086 = customBrushColor[0];
_j1087 = customBrushColor[1];
_j1088 = customBrushColor[2];
} else {
const color = _j223[brushColorMode];
if (color && color.rgb) {
_j1086 = color.rgb[0];
_j1087 = color.rgb[1];
_j1088 = color.rgb[2];
} else {
_j1086 = _j1087 = _j1088 = 26;
}
}
const _j1089 = {
id: _j1053++,
location: {
x: _j1084,
y: _j1085
},
prevLocation: {
x: _j1084,
y: _j1085
},
radius: _j1083,
r: _j1086,
g: _j1087,
b: _j1088,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j1052.push(_j1089);
}
const _j1090 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1091 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j1052.length - 1; i >= 0; i--) {
const _j1092 = _j1052[i];
if (_j1092.radius <= 0) {
continue;
}
const _j1093 = strokeSeed + _j579 * 1000 + _j1092.id * 100;
randomSeed(_j1093);
const _j1094 = crandom.random(_j1090, _j1091) * 3.0;
_j1092.radius -= _j1094;
const _j1095 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1096 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1092.xOff += _j1095;
_j1092.yOff += _j1096;
const _j1097 = 2.0 * speedMultiplier;
let _j1098 = 0,
_j1099 = 0;
const _j1100 = crandom.random(0, 1);
const _j1101 = (_j1092.sideDirection !== undefined) ? _j1092.sideDirection : (_j1100 > 0.5 ? 1 : -1);
if (_j1101 === 1) {
_j1098 = _j1076 * _j1097;
_j1099 = _j1077 * _j1097;
} else {
_j1098 = _j1074 * _j1097;
_j1099 = _j1075 * _j1097;
}
const nX = noise(_j1092.location.x) * _j1092.xOff;
const nY = noise(_j1092.location.y) * _j1092.yOff;
if (!_j1092.prevLocation) {
_j1092.prevLocation = {
x: _j1092.location.x,
y: _j1092.location.y
};
} else {
_j1092.prevLocation.x = _j1092.location.x;
_j1092.prevLocation.y = _j1092.location.y;
}
_j1092.location.x += 2.0 * (_j1098 * 0.2 + nX * 0.8);
_j1092.location.y += 2.0 * (_j1099 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1102 = noise(_j1092.location.x * 0.01, _j1092.location.y * 0.01) * 5;
_j1092.r = constrain(_j1092.r + _j1102, 0, 255);
_j1092.g = constrain(_j1092.g + _j1102, 0, 255);
_j1092.b = constrain(_j1092.b + _j1102, 0, 255);
} else if (brushColorMode == 0) {
const _j1102 = noise(_j1092.location.x * 0.01, _j1092.location.y * 0.01) * 2;
_j1092.r = constrain(_j1092.r + _j1102, 0, 200);
_j1092.g = constrain(_j1092.g + _j1102, 0, 200);
_j1092.b = constrain(_j1092.b + _j1102, 0, 200);
}
const _j1103 = crandom.random(0, 1) > 0.2;
const _j1104 = crandom.random(0, 1) > 0.99;
if (_j1092.radius > 0) {
stroke(_j1092.r, _j1092.g, _j1092.b, 200);
strokeWeight(max(1, _j1092.radius * 0.5));
if (_j1103) {
line(_j1092.prevLocation.x, _j1092.prevLocation.y, _j1092.location.x, _j1092.location.y);
}
if (_j1104) {
_j1092.radius = -1;
}
} else {
_j1092.radius = -1;
}
}
const _j1105 = _j1052.length;
let _j1106 = 0;
for (let i = 0; i < _j1052.length; i++) {
if (_j1052[i].radius > 0) {
if (_j1106 !== i) {
_j1052[_j1106] = _j1052[i];
}
_j1106++;
}
}
_j1052.length = _j1106;
const _j1107 = _j1052.length;
if (window.DEBUG_MODE && _j1105 > _j1107) {
const _j1108 = _j1105 - _j1107;
if (_j1108 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1108} dead particles removed (${_j1105} → ${_j1107})`);
}
}
pop();
buffer.end();
}
function _j65(buffer, _j1550, _j1551, _j808, _j530 = 0, _j1552 = 0) {
if (_j579 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j579, ">=", expectedStrokeLength, ")");
return;
}
buffer.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j931 = _j60(_j524);
let _j967 = initialSize * 0.3;
const _j1109 = (_j560 && typeof _j572 !== 'undefined' && _j572 !== null) ? _j572 : baseBrushSize;
let _j446 = _j1550;
let _j447 = _j1551;
if (!_j550) {
_j550 = 1;
x = _j446;
y = _j447;
}
_j534 += (_j446 - x) * _j531;
_j535 += (_j447 - y) * _j531;
_j534 *= _j532;
_j535 *= _j532;
_j536 += sqrt(_j534 * _j534 + _j535 * _j535) - _j536;
_j536 *= 0.7;
_j537 = _j533 - _j536;
let _j1029 = _j541;
let _j1030 = _j537;
let _j1031 = _j446 - x;
let _j1032 = _j447 - y;
let _j1033 = sqrt(_j1031 * _j1031 + _j1032 * _j1032);
const _j1110 = _j1109;
const _j1111 = _j1110 < 0.25;
const _j1112 = _j1110 < 1.0;
let _j1034 = max(_j1111 ? 0.05 : (_j1112 ? _j1110 * 0.5 : 0.5), _j1030 * 0.5);
let _j1035 = 1.5 * min(_j967, max(_j1112 ? _j1110 * 4 : 4, _j1034));
let _j1036 = _j1035 * 0.6;
let _j1037 = 0.8;
let _j1038 = max(_j1036 * _j1037, 0.5);
let _j1039 = max(1, ceil(_j1033 / _j1038));
_j1039 = max(10, min(50, _j1039));
let _j1040 = _j1039 / _j529;
let _j968 = 0;
let _j969 = 0;
let _j1041 = min(1.0, _j1033 / 10);
let _j1042 = _j1041 > 0.3;
rectMode(CENTER);
let _j240 = crandom.random(30, 70);
const _j1113 = `flyBrush_${_j1109}_${strokeSeed}`;
let _j1114;
if (_j65.configCache[_j1113]) {
_j1114 = _j65.configCache[_j1113];
} else {
_j1114 = _j62(_j1109, strokeSeed);
_j65.configCache[_j1113] = _j1114;
}
const _j1115 = map(_j240, 30, 70, 0, _j1114.length);
const _j1116 = _j1114.length;
const _j1117 = 40;
const _j243 = [];
for (let i = 0; i < _j529; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1117; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1118 = _j579 * 0.08 + j * 0.15;
const _j1119 = _j579 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1118, _j1119));
const _j1120 = _j579 * 0.1 + j * 0.1;
const _j1121 = _j579 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1120, _j1121));
}
_j243.push({
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
for (let i = 0; i < _j529; ++i) {
const _j1043 = _j243[i];
let _j975 = x;
let _j976 = y;
x += _j534 / _j529;
y += _j535 / _j529;
let _j437 = (i + 1) / _j529;
let _j1044 = lerp(_j1029, _j1030, _j437);
_j541 = lerp(_j541, _j1044, 0.5);
_j547 += (_j541 - _j547) * 0.8;
_j547 = max(_j1112 ? _j1110 * 1.5 : 1.5, _j547);
let _j986;
_j986 = max(_j1111 ? _j1110 * 0.5 : (_j1112 ? _j1110 : 0.5), _j547);
let dx = x - _j975;
let dy = y - _j976;
let distance = sqrt(dx * dx + dy * dy);
let _j1046;
const _j329 = 0.1;
if (distance < _j329) {
_j1046 = _j65.lastMovementAngle;
} else {
_j1046 = atan2(dy, dx);
let _j282 = _j1046 + PI / 2;
_j65.lastAngle = _j282;
_j65.lastMovementAngle = _j1046;
}
let _j990 = _j1043.showMainBrush;
let _j991 = _j1043.mainAlpha;
let showMainBrush = 0.3;
let _j1045 = showMainBrush;
if (_j1040 > 1.0) {
_j1045 = showMainBrush / _j1040;
} else if (_j1040 < 1.0) {
_j1045 = showMainBrush * (2.0 - _j1040);
}
let _j1047 = -sin(_j1046);
let _j1048 = cos(_j1046);
const _j1122 = max(_j1111 ? _j1110 * 0.4 : (_j1112 ? _j1110 * 0.5 : 0.5), _j533 * 0.5);
const _j1123 = _j536 * 0.5;
const _j1124 = _j579 < (expectedStrokeLength - 5);
const _j1125 = _j579 >= (expectedStrokeLength - 5);
const _j1126 = _j1125 ? 0.7 : 1.0;
const _j1127 = _j579 >= expectedStrokeLength;
let _j1128, _j1129, _j1130, _j1131, _j1132;
if (_j1125) {
_j1128 = expectedStrokeLength - 5;
_j1129 = _j579 - _j1128;
_j1130 = min(1.0, _j1129 / 5.0);
_j1131 = cos(_j1046);
_j1132 = sin(_j1046);
}
for (let j = 0; j < _j1114.length; j++) {
let _j1049 = _j1114[j];
const _j1133 = _j579 >= _j1049.startOffset;
if (!_j1133 || _j1127) {
continue;
}
let _j1050 = _j1043.flyWhiteRandoms[j];
let _j1051 = _j1049.randThreshold * _j1126;
if (_j1050 > _j1051) {
const _j1134 = _j1043.flyWhiteOffsetNoises[j];
const _j1015 = map(_j1134, 0, 1, 1.0, 2.0);
const _j1135 = 1.0 + (_j1015 - 1.0) * _j1049.offsetVariationFactor;
const _j1136 = _j1112 ? max(0.3, _j1110 * 3) : _j1110;
const _j1137 = _j1049.perpOffset * _j1136 * _j1135;
let offsetX = _j1047 * _j1137;
let offsetY = _j1048 * _j1137;
let _j280 = x;
let _j281 = y;
let _j1138 = _j975;
let _j1139 = _j976;
if (_j1125) {
const _j1140 = _j1049.endDistanceOffset * _j1130 * _j1109;
const _j1141 = _j1131 * _j1140;
const _j1142 = _j1132 * _j1140;
_j280 = x + _j1141;
_j281 = y + _j1142;
if (_j1129 === 0) {
_j1138 = _j975;
_j1139 = _j976;
} else {
const _j1143 = min(1.0, (_j1129 - 1) / 5.0);
const _j1144 = _j1049.endDistanceOffset * _j1143 * _j1109;
const _j1145 = _j1131 * _j1144;
const _j1146 = _j1132 * _j1144;
_j1138 = x + _j1145;
_j1139 = y + _j1146;
}
}
const _j1147 = _j1123 * _j1049.brushSpeedMultiplier * _j1049.speedMultiplier;
const _j1148 = max(_j1111 ? _j1110 * 0.3 : (_j1112 ? _j1110 * 0.3 : 0.5), _j1122 - _j1147);
const _j1149 = _j1148 * 0.6;
const _j1150 = _j1043.flyWhiteWidthNoises[j];
const _j1151 = map(_j1150, 0, 1, 0.8, 1.2);
const _j1152 = 1.0 + (_j1151 - 1.0) * _j1049.widthVariationFactor;
let _j1153 = max(0, map(j, 0, _j1114.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1153) + random(-50, 50);
stroke(_j931, kk);
const _j1154 = _j1149 * _j1049.sizeMultiplier * _j1152;
const _j1155 = max(1, _j1154);
const _j1156 = `${_j1113}_${j}`;
let _j1157 = _j65.lastStrokeWeights[_j1156];
if (typeof _j1157 === 'undefined') {
_j1157 = _j1155;
}
const _j1158 = _j1157;
let _j1159;
if (_j1158 < 3.0) {
_j1159 = 0.15;
} else if (_j1158 >= 5.0) {
_j1159 = 0.3;
} else {
const t = (_j1158 - 3.0) / (5.0 - 3.0);
_j1159 = lerp(0.15, 0.3, t);
}
const _j1160 = lerp(_j1157, _j1155, _j1159);
_j65.lastStrokeWeights[_j1156] = _j1160;
strokeWeight(_j1160);
line(_j1138 + offsetX, _j1139 + offsetY, _j280 + offsetX, _j281 + offsetY);
}
}
}
pop();
buffer.end();
}
let _j1161 = null;
function _j66() {
return typeof window !== 'undefined' && window.__INKFIELD_BUILD__ === true;
}
function _j67() {
if (_j1161) return _j1161;
_j1161 = {
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
return _j1161;
}
function _j68(key) {
if (!_j1161) {
_j67();
}
return _j1161[key];
}
function _j69(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j68('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j689.x = e.clientX - rect.left - rect.width / 2;
_j689.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j70(e) {
if (!isDragging) return;
const overlay = _j68('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j689.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j689.y) / window.innerHeight) * 100;
_j690.x = x;
_j690.y = y;
_j72(overlay, _j690, _j75);
}
function _j71() {
if (!isDragging) return;
isDragging = false;
const overlay = _j68('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j72(overlay, _j690, _j75);
}
_j111();
}
function _j72(panel, pos, _j1555) {
if (!panel) return;
_j1555();
const _j1162 = panel.querySelector('.control-btn');
if (!_j1162) return;
const rect = _j1162.getBoundingClientRect();
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
_j1555();
}
}
function _j73(_j1556) {
if (!_j1556) return;
const _j917 = [
document.getElementById('message-overlay'),
_j68('controlPanel'),
_j68('effectControlPanel'),
_j68('flowEffectPanel'),
_j68('maskPanel')
];
_j917.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1556.classList.add('panel-front');
}
function _j74() {
const _j917 = [
document.getElementById('message-overlay'),
_j68('controlPanel'),
_j68('effectControlPanel'),
_j68('flowEffectPanel'),
_j68('maskPanel')
];
_j917.forEach(panel => {
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
overlay.style.left = _j690.x + '%';
overlay.style.top = _j690.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j76(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j691 = true;
const panel = _j68('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j692.x = e.clientX - rect.left - rect.width / 2;
_j692.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j77(e) {
if (!_j691) return;
const panel = _j68('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j692.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j692.y) / window.innerHeight) * 100;
_j693.x = x;
_j693.y = y;
_j72(panel, _j693, _j79);
}
function _j78(e) {
if (!_j691) return;
_j691 = false;
const panel = _j68('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j693, _j79);
_j111();
}
function _j79() {
const panel = _j68('controlPanel');
if (!panel) return;
panel.style.left = _j693.x + '%';
panel.style.top = _j693.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j80(e) {
if (e.target.closest('.control-btn')) return;
_j695 = true;
const panel = _j68('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j696.x = e.clientX - rect.left - rect.width / 2;
_j696.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j81(e) {
if (!_j695) return;
const panel = _j68('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j696.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j696.y) / window.innerHeight) * 100;
_j697.x = x;
_j697.y = y;
_j72(panel, _j697, _j83);
}
function _j82(e) {
if (!_j695) return;
_j695 = false;
const panel = _j68('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j697, _j83);
_j111();
}
function _j83() {
const panel = _j68('effectControlPanel');
if (!panel) return;
panel.style.left = _j697.x + '%';
panel.style.top = _j697.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j84(e) {
if (e.target.closest('.control-btn')) return;
_j699 = true;
const panel = _j68('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j700.x = e.clientX - rect.left - rect.width / 2;
_j700.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j85(e) {
if (!_j699) return;
const panel = _j68('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j700.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j700.y) / window.innerHeight) * 100;
_j701.x = x;
_j701.y = y;
_j72(panel, _j701, _j87);
}
function _j86(e) {
if (!_j699) return;
_j699 = false;
const panel = _j68('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j701, _j87);
_j111();
}
function _j87() {
const panel = _j68('flowEffectPanel');
if (!panel) return;
panel.style.left = _j701.x + '%';
panel.style.top = _j701.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j88(e) {
if (e.target.closest('.control-btn') || e.target.closest('.toggle-label')) return;
_j703 = true;
const panel = _j68('maskPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j704.x = e.clientX - rect.left - rect.width / 2;
_j704.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j89(e) {
if (!_j703) return;
const panel = _j68('maskPanel');
if (!panel) return;
const x = ((e.clientX - _j704.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j704.y) / window.innerHeight) * 100;
_j705.x = x;
_j705.y = y;
_j72(panel, _j705, _j91);
}
function _j90(e) {
if (!_j703) return;
_j703 = false;
const panel = _j68('maskPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j72(panel, _j705, _j91);
_j111();
}
function _j91() {
const panel = _j68('maskPanel');
if (!panel) return;
panel.style.left = _j705.x + '%';
panel.style.top = _j705.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j92() {
const _j1163 = document.getElementById('mask-rect-btn');
const _j1164 = document.getElementById('mask-poly-btn');
if (_j1163) _j1163.classList.toggle('active', _j564 === 'rect');
if (_j1164) _j1164.classList.toggle('active', _j564 === 'polygon');
}
function _j93() {
const _j1165 = document.getElementById('mask-status');
if (!_j1165) return;
if (_j562) {
_j1165.textContent = _j564 === 'rect' ? 'Draw rect mask' : 'Click to add points, press Polygon again to close';
} else if (_j563) {
_j1165.textContent = 'Mask active';
} else {
_j1165.textContent = 'No mask';
}
const c = document.querySelector('canvas');
if (c) {
c.classList.toggle('mask-cursor', _j562);
}
}
function _j94() {
return _j68('controlPanel');
}
let _j1166 = {};
let _j1167 = {
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
return Date.now() - _j1167.lastDragTime < 200;
}
function _j96(hint, _j1557) {
const button = document.getElementById(_j1557);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j97(e, hint) {
const rect = hint.getBoundingClientRect();
_j1167.hint = hint;
_j1167.startX = e.clientX;
_j1167.startY = e.clientY;
_j1167.offsetX = e.clientX - rect.left;
_j1167.offsetY = e.clientY - rect.top;
_j1167.isDragging = true;
_j1167.hasMoved = false;
}
function _j98(e) {
if (!_j1167.isDragging || !_j1167.hint) return;
const dx = Math.abs(e.clientX - _j1167.startX);
const dy = Math.abs(e.clientY - _j1167.startY);
if (dx > 5 || dy > 5) {
_j1167.hasMoved = true;
_j1167.hint.style.transition = 'none';
}
if (_j1167.hasMoved) {
const x = e.clientX - _j1167.offsetX;
const y = e.clientY - _j1167.offsetY;
_j1167.hint.style.left = x + 'px';
_j1167.hint.style.top = y + 'px';
}
}
function _j99(e) {
if (!_j1167.isDragging || !_j1167.hint) return;
const hint = _j1167.hint;
if (_j1167.hasMoved) {
_j1166[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1166));
hint.style.transition = '';
_j1167.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1167.hint = null;
_j1167.isDragging = false;
_j1167.hasMoved = false;
}
function _j100() {
const _j1168 = localStorage.getItem('hintPositions');
if (_j1168) {
_j1166 = JSON.parse(_j1168);
}
}
function _j101() {
const _j1169 = [{
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
_j1169.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j97(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1170 = e.touches[0];
_j97({
clientX: _j1170.clientX,
clientY: _j1170.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j98);
document.addEventListener('mouseup', _j99);
document.addEventListener('touchmove', (e) => {
if (_j1167.isDragging && e.touches.length === 1) {
_j98({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1167.hasMoved) e.preventDefault();
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
const _j917 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j686
}, {
panel: _j68('controlPanel'),
hint: _j68('brushHint'),
button: 'toggle-control-panel',
visible: _j694
}, {
panel: _j68('effectControlPanel'),
hint: _j68('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j698
}, {
panel: _j68('flowEffectPanel'),
hint: _j68('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j702
}, {
panel: _j68('maskPanel'),
hint: _j68('maskHint'),
button: 'toggle-mask-panel',
visible: _j706
}];
_j917.forEach(({
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
_j694 = !_j694;
const panel = _j94();
const brushHint = _j68('brushHint');
if (!panel) return;
if (_j694) {
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
if (!_j694) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j694.toString());
}
function _j104() {
_j698 = !_j698;
const panel = _j68('effectControlPanel');
const effectHint = _j68('effectHint');
if (!panel) return;
if (_j698) {
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
if (!_j698) {
panel.style.display = 'none';
}
}, 300);
}
_j109();
}
function _j105() {
_j702 = !_j702;
const panel = _j68('flowEffectPanel');
const flowHint = _j68('flowHint');
if (!panel) return;
if (_j702) {
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
if (!_j702) {
panel.style.display = 'none';
}
}, 300);
}
_j109();
}
function _j106() {
_j706 = !_j706;
const panel = _j68('maskPanel');
const maskHint = _j68('maskHint');
if (!panel) return;
if (_j706) {
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
if (!_j706) {
panel.style.display = 'none';
}
}, 300);
}
_j109();
}
function _j107() {
const _j1171 = _j68('screenTextToggle');
if (_j1171) {
screenText = _j1171.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j149();
}
_j112('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j108() {
const _j1172 = localStorage.getItem('controlPanelVisible');
if (_j1172 !== null) {
_j694 = _j1172 === 'true';
}
const _j1173 = localStorage.getItem('effectControlPanelVisible');
if (_j1173 !== null) {
_j698 = _j1173 === 'true';
}
const _j1174 = localStorage.getItem('flowEffectPanelVisible');
if (_j1174 !== null) {
_j702 = _j1174 === 'true';
}
}
function _j109() {
localStorage.setItem('controlPanelVisible', _j694);
localStorage.setItem('effectControlPanelVisible', _j698);
localStorage.setItem('flowEffectPanelVisible', _j702);
localStorage.setItem('maskPanelVisible', _j706);
}
function _j110() {
const _j1175 = localStorage.getItem('overlayPosition');
const _j1176 = localStorage.getItem('controlPanelPosition');
const _j1177 = localStorage.getItem('effectControlPanelPosition');
const _j1178 = localStorage.getItem('flowEffectPanelPosition');
if (_j1175) {
_j690 = JSON.parse(_j1175);
}
if (_j1176) {
_j693 = JSON.parse(_j1176);
}
if (_j1177) {
_j697 = JSON.parse(_j1177);
}
if (_j1178) {
_j701 = JSON.parse(_j1178);
}
const _j1179 = localStorage.getItem('maskPanelPosition');
if (_j1179) {
_j705 = JSON.parse(_j1179);
}
const _j1180 = localStorage.getItem('maskPanelVisible');
if (_j1180 !== null) {
_j706 = _j1180 === 'true';
}
}
function _j111() {
localStorage.setItem('overlayPosition', JSON.stringify(_j690));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j693));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j697));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j701));
localStorage.setItem('maskPanelPosition', JSON.stringify(_j705));
}
function _j112(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1181 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1181[type] || '⚙️';
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
const _j1181 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1181[type] || '⚙️';
let _j1182 = '';
if (Object.keys(data).length > 0) {
_j1182 = ' ' + JSON.stringify(data);
}
const _j1183 = `${icon} [${timestamp}] ${message}${_j1182}`;
_j708.push({
type: type,
text: _j1183,
timestamp: timestamp
});
if (_j708.length >= _j715) {
_j708 = [];
_j710 = 0;
}
}
function _j114(type, message, data, timestamp, icon) {
const _j1184 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j687.push(_j1184);
if (_j687.length > _j688) {
_j687.shift();
}
_j115();
}
function _j115() {
const _j1185 = _j68('messageContainer');
if (!_j1185) return;
_j1185.innerHTML = '';
_j687.forEach(_j1560 => {
const _j1186 = _j147(_j1560);
_j1185.appendChild(_j1186);
});
_j1185.scrollTop = _j1185.scrollHeight;
}
function _j116() {
const _j1187 = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
for (const type of _j1187) {
if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
return type;
}
}
return '';
}
let _j1188 = null;
let _j1189 = [];
let _j1190 = null;
function _j117() {
const canvas = document.querySelector('canvas');
if (!canvas || typeof canvas.captureStream !== 'function') {
console.warn('[Record Video] Canvas captureStream not supported');
return false;
}
const mimeType = _j116();
if (!mimeType) {
console.warn('[Record Video] MediaRecorder not supported in this browser');
return false;
}
_j1189 = [];
_j1190 = canvas.captureStream(30);
_j1188 = new MediaRecorder(_j1190, { mimeType });
_j1188.ondataavailable = (e) => {
if (e.data && e.data.size > 0) _j1189.push(e.data);
};
_j1188.start(200);
return true;
}
function _j118() {
return new Promise((resolve) => {
if (!_j1188 || _j1188.state === 'inactive') {
resolve({ ok: false, error: 'not recording' });
return;
}
_j1188.onstop = () => {
const mimeType = _j1188.mimeType || 'video/webm';
const blob = new Blob(_j1189, { type: mimeType });
const _j1191 = mimeType.includes('mp4') ? 'mp4' : 'webm';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `inkfield-${timestamp}.${_j1191}`;
const _j1192 = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = _j1192;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(_j1192);
if (_j1190) {
_j1190.getTracks().forEach((track) => track.stop());
}
_j1188 = null;
_j1189 = [];
_j1190 = null;
resolve({ ok: true, filename });
};
_j1188.stop();
});
}
function _j119() {
return _j1188 && _j1188.state === 'recording';
}
function _j120() {
const _j1193 = recordingData.events.length > 0;
const _j1194 = `${_j630}-${_j638}-${_j1193}`;
if (_j1194 === _j1201) {
return;
}
_j1201 = _j1194;
const recordBtn = _j68('recordBtn');
const stopBtn = _j68('stopBtn');
const playBtn = _j68('playBtn');
const loadBtn = _j68('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j630) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j638) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1193) {
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
const _j1195 = document.getElementById('record-video-btn');
if (_j1195) _j1195.disabled = playBtn.disabled;
}
}
let _j1196 = false;
let _j1197 = -1;
let _j1198 = 0;
const _j1199 = 100;
let _j1200 = -1;
let _j1201 = null;
let _j1202 = null;
let _j1203 = null;
let _j1204 = 'edge';
function _j121(_j515) {
const cw = _j515.naturalWidth;
const ch = _j515.naturalHeight;
const c = document.createElement('canvas');
c.width = cw; c.height = ch;
const _j1205 = c.getContext('2d');
_j1205.drawImage(_j515, 0, 0);
const src = _j1205.getImageData(0, 0, cw, ch);
const _j1206 = _j1205.createImageData(cw, ch);
const s = src.data, d = _j1206.data;
const _j240 = new Float32Array(cw * ch);
for (let i = 0; i < _j240.length; i++) {
_j240[i] = s[i*4] * 0.299 + s[i*4+1] * 0.587 + s[i*4+2] * 0.114;
}
for (let y = 1; y < ch - 1; y++) {
for (let x = 1; x < cw - 1; x++) {
const tl = _j240[(y-1)*cw+(x-1)], tc = _j240[(y-1)*cw+x], tr = _j240[(y-1)*cw+(x+1)];
const ml = _j240[y*cw+(x-1)],                              mr = _j240[y*cw+(x+1)];
const bl = _j240[(y+1)*cw+(x-1)], bc = _j240[(y+1)*cw+x], br = _j240[(y+1)*cw+(x+1)];
const gx = -tl - 2*ml - bl + tr + 2*mr + br;
const gy = -tl - 2*tc - tr + bl + 2*bc + br;
const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy));
const _j1207 = (y * cw + x) * 4;
const v = 255 - mag;
d[_j1207] = v; d[_j1207+1] = v; d[_j1207+2] = v; d[_j1207+3] = 255;
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
_j1205.putImageData(_j1206, 0, 0);
return c.toDataURL();
}
function _j122() {
const referenceImage = document.getElementById('reference-image');
if (!referenceImage || !_j1202) return;
if (_j1204 === 'edge') {
_j1204 = 'original';
referenceImage.src = _j1202;
referenceImage.style.filter = 'grayscale(1) contrast(2.0)';
} else {
_j1204 = 'edge';
referenceImage.src = _j1203;
referenceImage.style.filter = 'none';
}
}
function _j123(_j1381) {
const _j1208 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j112('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1208.onload = (e) => {
_j1202 = e.target.result;
const _j1209 = new Image();
_j1209.onload = () => {
_j1203 = _j121(_j1209);
_j1204 = 'edge';
referenceImage.src = _j1203;
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
_j1196 = true;
_j112('system', '📷 Reference image loaded (edge mode)', {
Status: 'Tracing mode ON',
FileName: _j1381.name,
FileSize: (_j1381.size / 1024).toFixed(2) + ' KB',
Size: width + 'x' + height + 'px'
});
};
_j1209.src = e.target.result;
};
_j1208.onerror = () => {
_j112('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1381.name
});
};
_j1208.readAsDataURL(_j1381);
}
function _j124() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1210 = referenceImage.src;
const _j1211 = _j1210 && _j1210 !== '' &&
(_j1210.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1211) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1196 = true;
const _j1212 = document.getElementById('ref-image-toggle-btn');
if (_j1212) _j1212.classList.add('ref-active');
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
function _j125() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1196 = false;
const _j1212 = document.getElementById('ref-image-toggle-btn');
if (_j1212) _j1212.classList.remove('ref-active');
_j112('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j126() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j181('💾 Canvas Saved as PNG');
}
function _j127(_j1251) {
_j542 = _j1251;
switch (_j1251) {
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
if (typeof _j572 !== 'undefined') _j572 = baseBrushSize;
_j128();
_j140();
_j112('ui', 'Brush size changed', {
Mode: _j1251.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j128() {
const _j1213 = document.querySelectorAll('.brush-size-btn');
if (_j1213.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1213.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j542) {
btn.classList.add('active');
}
});
}
function _j129(mode) {
brushMode = parseInt(mode);
_j131();
_j140();
_j112('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j130(mode)
});
}
function _j130(mode) {
const _j1214 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1214[mode] || 'Unknown mode';
}
function _j131() {
const _j1213 = document.querySelectorAll('.brush-mode-btn');
if (_j1213.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1213.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j132(effect) {
const _j1215 = parseInt(effect);
const _j1216 = useSharpen;
_j112('ui', '🎨 Ink effect switching', {
From: _j1216,
To: _j1215,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1215;
if (typeof _j543 !== 'undefined') {
_j543 = _j1216;
}
_j135();
_j140();
const _j1217 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j112('ui', '✨ Ink effect changed', {
Effect: _j1217[_j1215] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j133(mode) {
const _j1218 = parseInt(mode);
if (_j1218 === 3) {
window.spectral = true;
} else {
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1218;
}
window.spectral = false;
}
_j134();
const _j1219 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken',
3: 'Spectral'
};
_j112('ui', '🎨 BlendMode changed', {
Mode: _j1219[_j1218] || 'Unknown'
});
}
function _j134() {
const _j1213 = document.querySelectorAll('.blendmode-btn');
if (_j1213.length === 0) {
return;
}
const _j1220 = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
_j1213.forEach(btn => {
const _j1218 = parseInt(btn.dataset.mode);
if (_j1220 && _j1218 === 3) {
btn.classList.add('active');
} else if (!_j1220 && _j1218 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j135() {
const _j1213 = document.querySelectorAll('.ink-effect-btn');
if (_j1213.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1213.forEach(btn => {
btn.classList.remove('active');
const _j1215 = parseInt(btn.dataset.effect);
const _j1221 = _j1215;
if (_j1221 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j136(color) {
whiteBrushMode = (color === 'white');
const _j1222 = {
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
brushColorMode = _j1222[color] !== undefined ? _j1222[color] : 0;
_j137();
_j140();
const _j1223 = {
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
const _j1224 = _j8(color);
if (_j1224) {
const _j1225 = document.getElementById('custom-brush-color');
const _j1226 = document.getElementById('custom-brush-color-text');
if (_j1225) _j1225.value = _j1224.hex;
if (_j1226) _j1226.value = _j1224.displayName + ' ' + _j1224.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1224.rgb[0];
customBrushColor[1] = _j1224.rgb[1];
customBrushColor[2] = _j1224.rgb[2];
}
}
}
_j112('ui', '🎨 Brush color changed', {
Color: _j1223[color] || color,
Mode: `${_j1223[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j137() {
const _j1227 = document.querySelectorAll('.brush-color-btn');
const _j1228 = document.querySelectorAll('.color-swatch');
if (_j1227.length === 0 && _j1228.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1229 = {
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
const _j1230 = (brushColorMode === 33);
const _j1231 = _j1230 ? null : (_j1229[brushColorMode] || 'black');
_j1227.forEach(btn => {
btn.classList.remove('active');
if (!_j1230 && btn.dataset.color === _j1231) {
btn.classList.add('active');
}
});
_j1228.forEach(btn => {
btn.classList.remove('active');
if (!_j1230 && btn.dataset.color === _j1231) {
btn.classList.add('active');
}
});
}
function _j138(_j1257) {
_j585 = parseInt(_j1257);
_j139();
_j140();
const _j1232 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j112('ui', '🔄 Path rotation changed', {
Mode: _j1257,
Range: _j1232[_j1257] || 'Unknown'
});
}
function _j139() {
const _j1213 = document.querySelectorAll('.path-rotation-btn');
if (_j1213.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1213.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j585) {
btn.classList.add('active');
}
});
}
function _j140() {
const _j1233 = document.getElementById('current-brush-mode');
if (_j1233) {
_j1233.textContent = brushMode;
}
const _j1234 = document.getElementById('current-brush-size');
if (_j1234) {
const _j1235 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1234.textContent = _j1235[_j542] || 'M';
}
const _j1236 = document.getElementById('current-ink-effect');
if (_j1236) {
const _j1237 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1236.textContent = _j1237[useSharpen] || 'MIX';
}
const _j1238 = document.getElementById('current-brush-color');
if (_j1238) {
const _j1239 = {
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
_j1238.textContent = _j1239[brushColorMode] || 'Black';
}
}
function _j141() {
brushMode = 1;
_j542 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j585 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j131();
_j128();
_j135();
_j137();
_j139();
_j134();
_j140();
_j112('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j142(_j1558, _j1559) {
if (!_j1558) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1240 = 300;
_j1558.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1241 = window._elementLastTriggerTime.get(_j1558) || 0;
if (now - _j1241 < _j1240) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1558, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1558);
}, _j1240);
window._elementLastTriggerTime.set(_j1558, now);
e.stopPropagation();
e.preventDefault();
_j1559(e);
}, {
passive: false
});
_j1558.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1558)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1241 = window._elementLastTriggerTime.get(_j1558) || 0;
if (now - _j1241 < _j1240) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1558, now);
e.stopPropagation();
e.preventDefault();
_j1559(e);
});
_j1558.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j143() {
const _j1242 = document.getElementById('canvas-background-color');
const _j1243 = document.getElementById('canvas-background-color-text');
if (!_j1242 || !_j1243) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1244 = `#${r}${g}${b}`.toUpperCase();
_j1242.value = _j1244;
_j1243.value = _j1244;
}
}
function _j144() {
const _j1245 = document.getElementById('canvas-width');
const _j1246 = document.getElementById('canvas-height');
if (!_j1245 || !_j1246) {
return;
}
if (typeof _j512 !== 'undefined' && typeof _j513 !== 'undefined') {
_j1245.value = _j512;
_j1246.value = _j513;
}
}
function _j145() {
const _j1247 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1248 = _j1247 === 'collector';
if (_j1248) {
const controlPanel = _j68('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1249 = document.querySelectorAll('.brush-mode-btn');
_j1249.forEach(btn => {
_j142(btn, () => {
const mode = btn.dataset.mode;
_j129(mode);
});
});
const _j1250 = document.querySelectorAll('.brush-size-btn');
_j1250.forEach(btn => {
_j142(btn, () => {
const _j1251 = btn.dataset.size;
_j127(_j1251);
});
});
const _j1252 = document.querySelectorAll('.ink-effect-btn');
_j1252.forEach(btn => {
_j142(btn, () => {
const effect = btn.dataset.effect;
_j132(effect);
});
});
const _j1253 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1253.forEach(btn => {
_j142(btn, () => {
const color = btn.dataset.color;
if (color) {
_j136(color);
_j162();
}
});
});
const _j1254 = document.getElementById('custom-brush-color');
const _j1255 = document.getElementById('custom-brush-color-text');
if (_j1254 && _j1255) {
_j1254.addEventListener('input', (e) => {
_j1255.value = e.target.value.toUpperCase();
_j168();
});
_j1254.addEventListener('change', (e) => {
_j1255.value = e.target.value.toUpperCase();
_j168();
});
_j1255.addEventListener('input', (e) => {
const _j1244 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1244)) {
_j1254.value = _j1244.toUpperCase();
}
});
_j1255.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j168();
}
});
}
const _j1256 = document.querySelectorAll('.path-rotation-btn');
_j1256.forEach(btn => {
_j142(btn, () => {
const _j1257 = btn.dataset.rotation;
_j138(_j1257);
});
});
const _j1258 = document.querySelectorAll('.blendmode-btn');
_j1258.forEach(btn => {
_j142(btn, () => {
const mode = btn.dataset.mode;
_j133(mode);
});
});
const _j1259 = document.getElementById('clear-canvas');
if (_j1259) {
const _j1260 = _j1259.textContent;
let _j1261 = false;
let _j1262 = null;
const _j1263 = () => {
_j1261 = false;
_j1259.classList.remove('armed');
_j1259.textContent = _j1260;
if (_j1262) { clearTimeout(_j1262); _j1262 = null; }
};
_j142(_j1259, () => {
if (!_j1261) {
_j1261 = true;
_j1259.classList.add('armed');
_j1259.textContent = 'Press again to clear';
_j1262 = setTimeout(_j1263, 2000);
return;
}
_j1263();
_j174();
if (typeof _j241 !== 'undefined') {
_j241 = [];
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
const _j1264 = document.getElementById('test-mode-btn');
if (_j1264) {
_j142(_j1264, () => {
if (typeof _j556 !== 'undefined' && _j556) return;
if (window.testMode) {
if (typeof exitTestMode === 'function') exitTestMode();
_j1264.classList.remove('active');
_j1264.textContent = 'testMode';
_j112('ui', '🧪 Test mode OFF', { Status: 'Canvas restored' });
} else {
if (typeof enterTestMode === 'function') enterTestMode();
_j1264.classList.add('active');
_j1264.textContent = 'testMode (exit)';
_j112('ui', '🧪 Test mode ON', { Status: 'Strokes will not be recorded' });
}
});
}
const _j1242 = document.getElementById('canvas-background-color');
const _j1243 = document.getElementById('canvas-background-color-text');
const _j1245 = document.getElementById('canvas-width');
const _j1246 = document.getElementById('canvas-height');
if (_j1242 && _j1243) {
_j1242.addEventListener('input', (e) => {
_j1243.value = e.target.value.toUpperCase();
});
_j1242.addEventListener('change', (e) => {
_j1243.value = e.target.value.toUpperCase();
_j169();
});
_j1243.addEventListener('input', (e) => {
const _j1244 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1244)) {
_j1242.value = _j1244.toUpperCase();
}
});
_j1243.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j169();
}
});
if (typeof _j143 === 'function') {
_j143();
} else {
setTimeout(() => {
if (typeof _j143 === 'function') {
_j143();
}
}, 100);
}
}
if (_j1245 && _j1246) {
_j1245.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j169();
}
});
_j1246.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j169();
}
});
if (typeof _j144 === 'function') {
_j144();
} else {
setTimeout(() => {
if (typeof _j144 === 'function') {
_j144();
}
}, 100);
}
}
const _j1265 = document.getElementById('panel-scale-slider');
if (_j1265) {
_j1265.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1265.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j75();
_j79();
_j83();
_j87();
});
}
const _j1212 = document.getElementById('toggle-control-panel');
if (_j1212) {
_j142(_j1212, _j103);
}
const controlPanel = _j68('controlPanel');
const _j1162 = controlPanel?.querySelector('.control-panel-header');
if (_j1162) {
_j1162.addEventListener('mousedown', _j76);
_j1162.addEventListener('touchstart', (e) => {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j76(_j1266);
});
}
const effectControlPanel = _j68('effectControlPanel');
const _j1267 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1267) {
_j1267.addEventListener('mousedown', _j80);
_j1267.addEventListener('touchstart', (e) => {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j80(_j1266);
});
}
const _j1268 = document.getElementById('toggle-effect-control-panel');
if (_j1268) {
_j142(_j1268, _j104);
}
const flowEffectPanel = _j68('flowEffectPanel');
const _j1269 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1269) {
_j1269.addEventListener('mousedown', _j84);
_j1269.addEventListener('touchstart', (e) => {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j84(_j1266);
});
}
const _j1270 = document.getElementById('toggle-flow-effect-panel');
if (_j1270) {
_j142(_j1270, _j105);
}
const maskPanel = _j68('maskPanel');
const _j1271 = maskPanel?.querySelector('.mask-panel-header');
if (_j1271) {
_j1271.addEventListener('mousedown', _j88);
_j1271.addEventListener('touchstart', (e) => {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j88(_j1266);
});
}
const _j1272 = document.getElementById('toggle-mask-panel');
if (_j1272) {
_j142(_j1272, function() {
_j106();
});
}
const _j1273 = document.getElementById('mask-mode-toggle');
if (_j1273) {
_j1273.addEventListener('change', function() {
if (!this.checked && _j564 === 'polygon' && _j566.length >= 3) {
drawMaskPolygon(_j566);
_j567 = { action: "polygon", points: _j566.map(p => ({ x: p.x, y: p.y })) };
}
const _j1274 = !this.checked;
_j562 = this.checked;
_j92();
_j93();
if (_j1274 && typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
});
}
const _j1275 = document.getElementById('mask-rect-btn');
if (_j1275) {
_j142(_j1275, function() {
_j564 = 'rect';
_j562 = true;
if (_j1273) _j1273.checked = true;
_j92();
_j93();
});
}
const _j1276 = document.getElementById('mask-poly-btn');
if (_j1276) {
_j142(_j1276, function() {
if (_j562 && _j564 === 'polygon') {
if (_j566.length >= 3) {
drawMaskPolygon(_j566);
_j567 = { action: "polygon", points: _j566.map(p => ({ x: p.x, y: p.y })) };
}
_j562 = false;
if (_j1273) _j1273.checked = false;
if (typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
} else {
_j564 = 'polygon';
_j562 = true;
_j566 = [];
if (_j1273) _j1273.checked = true;
}
_j92();
_j93();
});
}
const _j1277 = document.getElementById('mask-clear-btn');
if (_j1277) {
_j142(_j1277, function() {
clearMask();
_j567 = null;
_j562 = false;
_j564 = null;
if (_j1273) _j1273.checked = false;
_j92();
_j93();
});
}
if (maskPanel && !_j706) {
maskPanel.style.display = 'none';
}
_j91();
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j107);
}
_j131();
_j128();
_j135();
_j137();
_j139();
_j134();
_j140();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j146() {
const now = millis();
const _j1278 = (now - _j1198) >= _j1199;
const recordingStatus = _j68('recordingStatus');
if (recordingStatus) {
if (_j630) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j68('playbackStatus');
const countdownStatus = _j68('countdownStatus');
if (_j638) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1278) {
const _j1279 = loopWaitDuration - (millis() - _j647);
const _j1280 = Math.ceil(_j1279 / 1000);
const _j838 = _j1279 / loopWaitDuration;
if (window.DEBUG_MODE && _j1280 !== _j1197) {
console.log(`Countdown: ${_j1280}s remaining (${Math.floor(_j838 * 100)}%)`);
_j1197 = _j1280;
}
const countdownText = _j68('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1280}s`;
}
const countdownCircle = _j68('countdownCircle');
if (countdownCircle) {
const _j1281 = 62.83;
const offset = _j1281 * (1 - _j838);
countdownCircle.style.strokeDashoffset = offset;
}
}
} else {
_j1197 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1278) {
const _j437 = recordingData.events.length > 0 ?
_j640 / recordingData.events.length : 0;
const _j1282 = Math.round(_j437 * 100);
if (_j1282 !== _j1200) {
const progressFill = _j68('progressFill');
const progressText = _j68('progressText');
if (progressFill) progressFill.style.width = `${_j1282}%`;
if (progressText) progressText.textContent = `${_j1282}%`;
_j1200 = _j1282;
}
}
}
} else {
_j1197 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1278) {
_j1198 = now;
}
if (typeof _j120 === 'function') {
_j120();
}
}
function _j147(_j1560) {
const _j1283 = document.createElement('div');
_j1283.className = 'message-item new-message';
const _j1284 = document.createElement('span');
_j1284.className = 'message-icon';
_j1284.textContent = _j1560.icon;
const _j1285 = document.createElement('div');
_j1285.className = 'message-content';
const _j1286 = document.createElement('div');
_j1286.className = 'message-header';
const _j1287 = document.createElement('span');
_j1287.className = 'message-timestamp';
_j1287.textContent = _j1560.timestamp;
const _j1288 = document.createElement('span');
_j1288.className = `message-type ${_j1560.type}`;
_j1288.textContent = _j1560.type.toUpperCase();
_j1286.appendChild(_j1287);
_j1286.appendChild(_j1288);
const _j1289 = document.createElement('p');
_j1289.className = 'message-text';
_j1289.textContent = _j1560.message;
_j1285.appendChild(_j1286);
_j1285.appendChild(_j1289);
if (Object.keys(_j1560.data).length > 0) {
const _j1290 = document.createElement('div');
_j1290.className = 'message-data';
_j1290.textContent = JSON.stringify(_j1560.data, null, 2);
_j1285.appendChild(_j1290);
}
_j1283.appendChild(_j1284);
_j1283.appendChild(_j1285);
setTimeout(() => {
_j1283.classList.remove('new-message');
}, 300);
return _j1283;
}
function _j148() {
_j686 = !_j686;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j686) {
overlay.style.display = 'block';
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j75();
} else {
_j96(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
setTimeout(() => {
if (!_j686) {
overlay.style.display = 'none';
}
}, 300);
}
}
localStorage.setItem('overlayVisible', _j686.toString());
}
function _j149() {
_j687 = [];
_j115();
}
function _j150() {
const _j1291 = document.getElementById('record-status-text');
if (_j1291) {
if (_j637 == 1) {
_j1291.textContent = 'ON';
_j1291.classList.add('active');
} else {
_j1291.textContent = 'OFF';
_j1291.classList.remove('active');
}
}
}
function _j151() {
const _j1292 = {};
const _j1293 = window.location.search;
if (!_j1293 || _j1293.length <= 1) {
return _j1292;
}
const _j1294 = _j1293.substring(1);
const _j1024 = _j1294.split('_');
const _j1295 = {
'wd': true,
'gr': true
};
for (const _j1296 of _j1024) {
if (!_j1296) continue;
const _j1297 = _j1296.indexOf(':');
if (_j1297 === -1) continue;
const key = _j1296.substring(0, _j1297);
const value = _j1296.substring(_j1297 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1298 = parseInt(value);
if (!isNaN(_j1298) && _j1298 > 0) {
_j1292[key] = _j1298;
}
continue;
}
if (_j1295[key]) {
const _j1299 = parseFloat(value);
if (!isNaN(_j1299) && _j1299 > 0) {
_j1292[key] = true;
_j1292[key + '_val'] = _j1299;
} else {
_j1292[key] = false;
}
} else {
_j1292[key] = value === '1';
}
}
}
return _j1292;
}
function _j152(state) {
const _j1300 = {
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
for (const [_j1296, toggleId] of Object.entries(_j1300)) {
if (state.hasOwnProperty(_j1296)) {
if (_j1296 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1301 = state[_j1296];
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.checked = _j1301;
toggle.dispatchEvent(new Event('change'));
if (_j1296 === 'rs') {
const _j1302 = document.getElementById('rs-sliders-section');
if (_j1302) {
_j1302.style.display = _j1301 ? 'flex' : 'none';
}
} else if (_j1296 === 'distort') {
const _j1303 = document.getElementById('distort-sliders-section');
if (_j1303) {
_j1303.style.display = _j1301 ? 'flex' : 'none';
}
} else if (_j1296 === 'cl') {
const _j1304 = document.getElementById('cellular-sliders-section');
if (_j1304) {
_j1304.style.display = _j1301 ? 'flex' : 'none';
}
} else if (_j1296 === 'wd') {
const _j1305 = document.getElementById('white-dot-sliders-section');
if (_j1305) {
_j1305.style.display = _j1301 ? 'flex' : 'none';
}
if (_j1301 && state['wd_val'] !== undefined) {
const _j1306 = document.getElementById('white-dot-density');
const _j1307 = document.getElementById('white-dot-density-value');
if (_j1306) _j1306.value = state['wd_val'];
if (_j1307) _j1307.textContent = state['wd_val'].toFixed(2);
}
} else if (_j1296 === 'gr') {
const _j1308 = document.getElementById('grain-sliders-section');
if (_j1308) {
_j1308.style.display = _j1301 ? 'flex' : 'none';
}
if (_j1301 && state['gr_val'] !== undefined) {
const _j1309 = document.getElementById('grain-amount');
const _j1310 = document.getElementById('grain-amount-value');
if (_j1309) _j1309.value = state['gr_val'];
if (_j1310) _j1310.textContent = state['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1296}`);
}
}
}
}
function _j153() {
_j67();
const _j1311 = _j151();
const _j1312 = {
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
if (_j1311['w']) window._urlCanvasWidth = _j1311['w'];
if (_j1311['h']) window._urlCanvasHeight = _j1311['h'];
if (Object.keys(_j1311).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1296, _j1301] of Object.entries(_j1311)) {
const globalVarName = _j1312[_j1296];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1296 === 'loop') {
window[globalVarName] = _j1301 ? 1 : 0;
} else {
window[globalVarName] = _j1301;
}
}
}
const _j1313 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1314 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1296, globalVarName] of Object.entries(_j1313)) {
const valKey = _j1296 + '_val';
if (_j1311[valKey] !== undefined) {
window[globalVarName] = _j1311[valKey];
window[_j1314[_j1296]] = _j1311[valKey];
}
}
window._initialConsoleFromURL = _j1311.hasOwnProperty('console') ? _j1311.console : false;
}
const _j1247 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1248 = _j1247 === 'collector';
const _j1212 = document.getElementById('toggle-overlay');
const _j1315 = document.getElementById('toggle-hint-btn');
const _j1316 = document.getElementById('clear-bite-points');
const _j1317 = document.getElementById('scan-global');
const _j1318 = document.getElementById('scan-current');
const _j1319 = document.getElementById('scan-random');
const _j1320 = document.getElementById('scan-current-random');
const _j1321 = document.getElementById('brush-hint-btn');
const _j1322 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1322.length > 0) {
let _j1323 = 2;
if (typeof _j514 !== 'undefined') {
_j1323 = _j514;
}
const _j1324 = document.querySelector(`input[name="pixel-density"][value="${_j1323}"]`);
if (_j1324) {
_j1324.checked = true;
}
_j1322.forEach(_j1567 => {
_j1567.addEventListener('change', (e) => {
if (e.target.checked) {
const _j731 = parseInt(e.target.value);
if (typeof _j514 !== 'undefined') {
_j514 = _j731;
try {
sessionStorage.setItem('pendingPixelDensity', _j731.toString());
if (typeof _j630 !== 'undefined' && _j630 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j112('system', '🎨 Pixel density changed - reloading page', {
Value: _j731,
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
if (_j1248) {
if (_j1321) _j1321.style.display = 'none';
}
const _j1325 = document.getElementById('record-toggle');
const _j1291 = document.getElementById('record-status-text');
const _j1326 = document.getElementById('realtime-drawing-toggle');
const _j1327 = document.getElementById('realtime-drawing-status-text');
const _j1328 = document.getElementById('grid-overlay-toggle');
const _j1329 = document.getElementById('paper-texture-toggle');
const _j1330 = document.getElementById('camera-moving-toggle');
const _j1331 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1162 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j686) {
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
if (_j694) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1212) {
_j142(_j1212, _j148);
}
if (_j1315) {
_j142(_j1315, () => {
if (!_j95()) _j148();
});
}
if (_j1321) {
_j142(_j1321, () => {
if (!_j95()) _j103();
});
}
const _j1332 = document.getElementById('effect-hint-btn');
if (_j1332) {
_j142(_j1332, () => {
if (!_j95()) _j104();
});
}
const _j1333 = document.getElementById('flow-hint-btn');
if (_j1333) {
_j142(_j1333, () => {
if (!_j95()) _j105();
});
}
const _j1334 = document.getElementById('mask-hint-btn');
if (_j1334) {
_j142(_j1334, () => {
if (!_j95()) _j106();
});
}
const _j1335 = document.getElementById('agent-toggle-btn');
if (_j1335) {
_j142(_j1335, function() {
_j576 = !_j576;
if (_j576) {
_j574 = true;
_j577 = [];
_j1335.classList.add('agent-active');
_j1335.textContent = 'Agent ●';
console.log('[Agent] ON — recording paths with timestamps');
} else {
_j574 = false;
_j1335.classList.remove('agent-active');
_j1335.textContent = 'Agent';
console.log('[Agent] OFF — ' + _j577.length + ' points recorded');
}
});
}
if (_j1317) {
_j142(_j1317, () => {
if (typeof _j18 === 'function') {
const shapeType = _j163();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j816 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j816 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j816);
noiseSeed(_j816);
}
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j189('ec', {
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
function _j154(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j163();
let scanBounds = null;
let _j324 = null;
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
if (strokeIndex !== null) {
_j324 = Math.max(0, Math.min(strokeIndex, allBrushStrokes.length - 1));
} else {
const _j1336 = document.getElementById('stroke-select-slider');
if (_j1336) {
_j324 = parseInt(_j1336.value) || 0;
_j324 = Math.max(0, Math.min(_j324, allBrushStrokes.length - 1));
}
}
if (_j324 !== null) {
const selectedStroke = allBrushStrokes[_j324];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j112('system', `🎯 EACH: 使用笔画 #${_j324} 的网格区域`, {
Index: _j324,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: allBrushStrokes.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j112('system', `🎯 EACH: 使用笔画 #${_j324} 的边界框（无网格数据）`, {
Index: _j324,
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
const _j816 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j816 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j816);
noiseSeed(_j816);
}
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j189('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j324,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1318) {
_j142(_j1318, () => {
_j154();
});
}
if (_j1320) {
_j142(_j1320, () => {
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
const _j1337 = Math.floor(Math.random() * allBrushStrokes.length);
const _j1336 = document.getElementById('stroke-select-slider');
const _j1338 = document.getElementById('stroke-index-display');
const _j1339 = document.getElementById('stroke-select-value');
if (_j1336) {
_j1336.value = _j1337;
_j1336.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1338) {
_j1338.textContent = _j1337;
}
if (_j1339) {
_j1339.textContent = _j1337;
}
_j112('system', `🎲 EACHR: 随机选择笔画 #${_j1337}`, {
RandomIndex: _j1337,
TotalStrokes: allBrushStrokes.length
});
_j154(_j1337);
} else {
_j112('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1319) {
_j142(_j1319, () => {
if (typeof _j19 === 'function') {
const shapeType = _j163();
_j19(10, shapeType);
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
_j189('ec', {
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
if (_j1316) {
_j142(_j1316, () => {
if (typeof _j241 !== 'undefined' && _j241.length > 0) {
let pointCount = typeof _j241 !== 'undefined' ? _j241.length : 0;
if (typeof _j241 !== 'undefined') {
_j241 = [];
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
if (_j1325) {
_j1325.checked = (_j637 == 1);
_j150();
_j1325.addEventListener('change', (e) => {
_j637 = e.target.checked ? 1 : 0;
_j150();
_j112('system', `Record mode ${_j637 ? 'enabled' : 'disabled'}`, {
Status: _j637 ? 'ON' : 'OFF'
});
});
}
if (_j1326) {
_j1326.disabled = true;
if (_j1327) {
_j1327.textContent = 'DISABLED';
}
_j1326.addEventListener('change', (e) => {
e.target.checked = false;
_j112('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1328) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1328.checked = !!showGridOverlay;
}
} catch (e) {}
_j1328.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1571) {}
_j112('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1329) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1329.checked = !!showPaperTexture;
} else {
_j1329.checked = true;
}
} catch (e) {
_j1329.checked = true;
}
_j1329.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1571) {}
_j112('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1340 = document.getElementById('fit-canvas-toggle');
if (_j1340) {
_j1340.addEventListener('change', (e) => {
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
if (_j1330) {
try {
if (typeof doMoving !== 'undefined') {
_j1330.checked = !!doMoving;
} else {
_j1330.checked = false;
}
} catch (e) {
_j1330.checked = false;
}
_j1330.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1571) {}
_j112('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1331) {
try {
if (typeof loopToggle !== 'undefined') {
_j1331.checked = (loopToggle === 1);
} else {
_j1331.checked = false;
}
} catch (e) {
_j1331.checked = false;
}
_j1331.addEventListener('change', (e) => {
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
} catch (_j1571) {
console.error('Error setting loopToggle:', _j1571);
}
});
}
const _j1341 = document.getElementById('playback-offset-x');
const _j1342 = document.getElementById('playback-offset-y');
if (_j1341) {
if (typeof _j650 !== 'undefined') {
_j1341.value = _j650;
}
_j1341.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j650 !== 'undefined') {
_j650 = value;
_j112('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1342) {
if (typeof _j651 !== 'undefined') {
_j1342.value = _j651;
}
_j1342.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j651 !== 'undefined') {
_j651 = value;
_j112('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1343 = document.getElementById('distort-shader-toggle');
const _j1303 = document.getElementById('distort-sliders-section');
if (_j1343) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1343.checked = !!distortShaderEnabled;
if (_j1303) {
_j1303.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1343.checked = false;
if (_j1303) {
_j1303.style.display = 'none';
}
}
} catch (e) {
_j1343.checked = false;
if (_j1303) {
_j1303.style.display = 'none';
}
}
_j1343.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1303) {
_j1303.style.display = enabled ? 'flex' : 'none';
}
_j112('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1571) {
console.error('Error setting distortShaderEnabled:', _j1571);
}
});
}
const _j1344 = document.getElementById('distort-displacement-b');
const _j1345 = document.getElementById('distort-displacement-b-value');
if (_j1344 && _j1345) {
const _j1346 = parseFloat(_j1344.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1346;
}
_j1345.textContent = Math.round(_j1346);
_j1344.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1345.textContent = Math.round(value);
});
}
const _j1347 = document.getElementById('distort-displacement-c');
const _j1348 = document.getElementById('distort-displacement-c-value');
if (_j1347 && _j1348) {
const _j1346 = parseFloat(_j1347.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1346;
}
_j1348.textContent = Math.round(_j1346);
_j1347.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1348.textContent = Math.round(value);
});
}
const _j1349 = document.getElementById('distort-fbm-preview-toggle');
if (_j1349) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1349.checked = (distortShowFbmMask > 0.5);
} else {
_j1349.checked = false;
}
} catch (e) {
_j1349.checked = false;
}
_j1349.addEventListener('change', (e) => {
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
} catch (_j1571) {
console.error('Error setting distortShowFbmMask:', _j1571);
}
});
}
const _j1350 = document.getElementById('rs-toggle');
const _j1302 = document.getElementById('rs-sliders-section');
if (_j1350) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1350.checked = !!rsEnabled;
if (_j1302) {
_j1302.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1350.checked = false;
if (_j1302) {
_j1302.style.display = 'none';
}
}
} catch (e) {
_j1350.checked = false;
if (_j1302) {
_j1302.style.display = 'none';
}
}
_j1350.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1302) {
_j1302.style.display = enabled ? 'flex' : 'none';
}
_j112('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1571) {
console.error('Error setting rsEnabled:', _j1571);
}
});
}
const _j1351 = document.getElementById('rs-frequency');
const _j1352 = document.getElementById('rs-frequency-value');
if (_j1351 && _j1352) {
const _j1346 = parseFloat(_j1351.value);
if (typeof _j590 !== 'undefined') {
_j590 = _j1346;
}
_j1352.textContent = Math.round(_j1346);
_j1351.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j590 !== 'undefined') {
_j590 = value;
}
_j1352.textContent = Math.round(value);
});
}
const _j1353 = document.getElementById('rs-wave-speed');
const _j1354 = document.getElementById('rs-wave-speed-value');
if (_j1353 && _j1354) {
const _j1346 = parseFloat(_j1353.value);
if (typeof _j591 !== 'undefined') {
_j591 = _j1346;
}
_j1354.textContent = _j1346.toFixed(1);
_j1353.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j591 !== 'undefined') {
_j591 = value;
}
_j1354.textContent = value.toFixed(1);
});
}
const _j1355 = document.getElementById('rs-strength');
const _j1356 = document.getElementById('rs-strength-value');
if (_j1355 && _j1356) {
const _j1346 = parseFloat(_j1355.value);
if (typeof _j592 !== 'undefined') {
_j592 = _j1346;
}
_j1356.textContent = _j1346.toFixed(1);
_j1355.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j592 !== 'undefined') {
_j592 = value;
}
_j1356.textContent = value.toFixed(1);
});
}
const _j1357 = document.getElementById('rs-gradient-mix');
const _j1358 = document.getElementById('rs-gradient-mix-value');
if (_j1357 && _j1358) {
const _j1346 = parseFloat(_j1357.value);
if (typeof _j593 !== 'undefined') {
_j593 = _j1346;
}
_j1358.textContent = _j1346.toFixed(1);
_j1357.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j593 !== 'undefined') {
_j593 = value;
}
_j1358.textContent = value.toFixed(1);
});
}
const _j1359 = document.getElementById('rs-scale');
const _j1360 = document.getElementById('rs-scale-value');
if (_j1359 && _j1360) {
const _j1346 = parseFloat(_j1359.value);
if (typeof _j594 !== 'undefined') {
_j594 = _j1346;
}
_j1360.textContent = Math.round(_j1346);
_j1359.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j594 !== 'undefined') {
_j594 = value;
}
_j1360.textContent = Math.round(value);
});
}
const _j1361 = document.getElementById('cellular-toggle');
const _j1304 = document.getElementById('cellular-sliders-section');
if (_j1361) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1361.checked = !!cellularEnabled;
if (_j1304) {
_j1304.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1361.checked = false;
if (_j1304) _j1304.style.display = 'none';
}
} catch (e) {
_j1361.checked = false;
if (_j1304) _j1304.style.display = 'none';
}
_j1361.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1304) {
_j1304.style.display = enabled ? 'flex' : 'none';
}
_j112('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1571) {
console.error('Error setting cellularEnabled:', _j1571);
}
});
}
const _j1362 = document.getElementById('cellular-scale');
const _j1363 = document.getElementById('cellular-scale-value');
if (_j1362 && _j1363) {
const _j1346 = parseFloat(_j1362.value);
if (typeof _j595 !== 'undefined') _j595 = _j1346;
_j1363.textContent = _j1346.toFixed(1);
_j1362.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j595 !== 'undefined') _j595 = value;
_j1363.textContent = value.toFixed(1);
});
}
const _j1364 = document.getElementById('cellular-seed');
const _j1365 = document.getElementById('cellular-seed-value');
if (_j1364 && _j1365) {
const _j1346 = parseFloat(_j1364.value);
if (typeof _j596 !== 'undefined') _j596 = _j1346;
_j1365.textContent = _j1346.toFixed(1);
_j1364.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j596 !== 'undefined') _j596 = value;
_j1365.textContent = value.toFixed(1);
});
}
const _j1366 = document.getElementById('white-dot-toggle');
const _j1367 = document.getElementById('white-dot-sliders-section');
if (_j1366) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1366.checked = !!whiteDotEnabled;
if (_j1367) _j1367.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1366.checked = false;
if (_j1367) _j1367.style.display = 'none';
}
} catch (e) {
_j1366.checked = false;
if (_j1367) _j1367.style.display = 'none';
}
_j1366.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1367) _j1367.style.display = enabled ? 'flex' : 'none';
_j112('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1571) {
console.error('Error setting whiteDotEnabled:', _j1571);
}
});
}
const _j1368 = document.getElementById('white-dot-density');
const _j1369 = document.getElementById('white-dot-density-value');
if (_j1368 && _j1369) {
if (window._urlParamWdVal !== undefined) {
const _j1370 = window._urlParamWdVal;
_j597 = _j1370 * 0.1;
_j1368.value = _j1370;
_j1369.textContent = _j1370.toFixed(2);
} else {
const _j1370 = parseFloat(_j1368.value);
if (typeof _j597 !== 'undefined') _j597 = _j1370 * 0.1;
_j1369.textContent = _j1370.toFixed(2);
}
_j1368.addEventListener('input', (e) => {
const _j1370 = parseFloat(e.target.value);
if (typeof _j597 !== 'undefined') _j597 = _j1370 * 0.1;
_j1369.textContent = _j1370.toFixed(2);
});
}
const _j1371 = document.getElementById('grain-toggle');
const _j1372 = document.getElementById('grain-sliders-section');
if (_j1371) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1371.checked = !!grainEnabled;
if (_j1372) _j1372.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1371.checked = false;
if (_j1372) _j1372.style.display = 'none';
}
} catch (e) {
_j1371.checked = false;
if (_j1372) _j1372.style.display = 'none';
}
_j1371.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1372) _j1372.style.display = enabled ? 'flex' : 'none';
_j112('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1571) {
console.error('Error setting grainEnabled:', _j1571);
}
});
}
const _j1373 = document.getElementById('grain-amount');
const _j1374 = document.getElementById('grain-amount-value');
if (_j1373 && _j1374) {
if (window._urlParamGrVal !== undefined) {
const _j1370 = window._urlParamGrVal;
_j598 = _j1370 * 0.1;
_j1373.value = _j1370;
_j1374.textContent = _j1370.toFixed(2);
} else {
const _j1370 = parseFloat(_j1373.value);
if (typeof _j598 !== 'undefined') _j598 = _j1370 * 0.1;
_j1374.textContent = _j1370.toFixed(2);
}
_j1373.addEventListener('input', (e) => {
const _j1370 = parseFloat(e.target.value);
if (typeof _j598 !== 'undefined') _j598 = _j1370 * 0.1;
_j1374.textContent = _j1370.toFixed(2);
});
}
const _j1375 = document.getElementById('future-path-preview-toggle');
if (_j1375) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1375.checked = !!showFuturePathPreview;
} else {
_j1375.checked = true;
}
} catch (e) {
_j1375.checked = true;
}
_j1375.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j112('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1571) {
console.error('Error setting showFuturePathPreview:', _j1571);
}
});
}
if (recordBtn) {
_j142(recordBtn, () => {
if (!_j630 && !_j638) {
_j190();
_j120();
}
});
}
if (stopBtn) {
_j142(stopBtn, () => {
if (_j630) {
_j191();
} else if (_j638) {
_j194();
}
_j120();
});
}
if (playBtn) {
_j142(playBtn, () => {
if (!_j630 && !_j638 && recordingData.events.length > 0) {
startPlayback();
_j120();
}
});
}
if (loadBtn) {
_j142(loadBtn, () => {
if (!_j630 && !_j638) {
_j193();
}
});
}
const _j1376 = document.getElementById('record-video-btn');
if (_j1376) {
_j142(_j1376, () => {
if (!_j630 && !_j638 && recordingData.events.length > 0) {
startVideoFrameCapture();
_j120();
}
});
}
const _j1377 = document.getElementById('load-image');
const _j1378 = document.getElementById('image-file-input');
const _j1379 = _j1248 || _j66();
const _j1380 = _j1377 ? _j1377.closest('.panel-section') : null;
if (_j1379) {
if (_j1380) _j1380.style.display = 'none';
if (_j1377) _j1377.style.display = 'none';
} else if (_j1377 && _j1378) {
_j142(_j1377, () => {
_j1378.click();
});
_j1378.addEventListener('change', (e) => {
const _j1381 = e.target.files[0];
if (_j1381 && _j1381.type.startsWith('image/')) {
_j123(_j1381);
}
});
}
const _j1382 = document.getElementById('show-reference-image');
if (_j1382 && !_j1379) {
_j142(_j1382, () => {
_j124();
});
}
const _j1383 = document.getElementById('hide-reference-image');
if (_j1383 && !_j1379) {
_j142(_j1383, () => {
_j125();
});
}
if (_j1162) {
_j1162.addEventListener('mousedown', _j69);
_j1162.addEventListener('touchstart', (e) => {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j69(_j1266);
});
}
_j74();
const _j1384 = _j68('flowEffectPanel');
if (_j1384 && !_j1384.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1384.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1570 => {
const _j1385 = _j1570.getAttribute('data-panel');
const _j1386 = {
overlay: _j69,
control: _j76,
effect: _j80,
flow: _j84
};
const fn = _j1386[_j1385];
if (!fn) return;
_j1570.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1570.addEventListener('touchstart', (e) => {
const _j1170 = e.touches[0];
fn({ clientX: _j1170.clientX, clientY: _j1170.clientY, target: _j1570, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j73(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j70);
document.addEventListener('mouseup', _j71);
document.addEventListener('touchmove', (e) => {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY
};
_j70(_j1266);
});
document.addEventListener('touchend', _j71);
document.addEventListener('mousemove', _j77);
document.addEventListener('mouseup', _j78);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY
};
_j77(_j1266);
}
});
document.addEventListener('touchend', _j78);
document.addEventListener('mousemove', _j81);
document.addEventListener('mouseup', _j82);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY
};
_j81(_j1266);
}
});
document.addEventListener('touchend', _j82);
document.addEventListener('mousemove', _j85);
document.addEventListener('mouseup', _j86);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY
};
_j85(_j1266);
}
});
document.addEventListener('touchend', _j86);
document.addEventListener('mousemove', _j89);
document.addEventListener('mouseup', _j90);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1170 = e.touches[0];
const _j1266 = {
clientX: _j1170.clientX,
clientY: _j1170.clientY
};
_j89(_j1266);
}
});
document.addEventListener('touchend', _j90);
if (hint && !_j686) {
hint.classList.remove('hidden');
}
_j120();
_j161();
_j165();
_j170();
_j166();
_j83();
_j87();
const effectControlPanel = _j68('effectControlPanel');
const effectHint = _j68('effectHint');
const _j1268 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j698) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1268) {
_j1268.textContent = _j698 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j68('flowEffectPanel');
const flowHint = _j68('flowHint');
const _j1270 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j702) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1270) {
_j1270.textContent = _j702 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1311).length > 0) {
setTimeout(() => {
_j152(_j1311);
_j112('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1311).length
});
}, 200);
}
setTimeout(() => {
_j102();
_j101();
}, 100);
_j155();
}
let _j1387 = false;
let _j1388 = null;
function _j155() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j142(btn, _j159);
_j156();
if (!_j66()) {
_j157();
}
}
function _j156() {
if (document.getElementById('collect-panels-btn')) return;
const btn = document.createElement('button');
btn.id = 'collect-panels-btn';
btn.innerHTML = '◎';
btn.title = 'Collect all panels here';
document.body.appendChild(btn);
_j142(btn, _j158);
}
function _j157() {
if (document.getElementById('ref-image-toggle-btn')) return;
const btn = document.createElement('button');
btn.id = 'ref-image-toggle-btn';
btn.innerHTML = '⬒';
btn.title = 'Toggle reference image (tap: show/hide, long press: switch edge/photo)';
document.body.appendChild(btn);
let _j1389 = null;
let _j1390 = false;
const _j1391 = () => {
_j1390 = false;
_j1389 = setTimeout(() => {
_j1390 = true;
_j122();
}, 500);
};
const _j1392 = () => {
clearTimeout(_j1389);
if (!_j1390) {
if (_j1196) {
_j125();
} else {
_j124();
}
}
};
btn.addEventListener('pointerdown', _j1391);
btn.addEventListener('pointerup', _j1392);
btn.addEventListener('pointercancel', () => clearTimeout(_j1389));
}
const _j1393 = [
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
let _j1394 = 0;
function _j158() {
const d = _j1393[_j1394];
_j1394 = (_j1394 + 1) % _j1393.length;
if (typeof _j690 !== 'undefined') { _j690.x = d.overlay.x; _j690.y = d.overlay.y; }
if (typeof _j693 !== 'undefined') { _j693.x = d.control.x; _j693.y = d.control.y; }
if (typeof _j697 !== 'undefined') { _j697.x = d.effectControl.x; _j697.y = d.effectControl.y; }
if (typeof _j701 !== 'undefined') { _j701.x = d.flowEffect.x; _j701.y = d.flowEffect.y; }
if (typeof _j705 !== 'undefined') { _j705.x = d.mask.x; _j705.y = d.mask.y; }
if (typeof _j75 === 'function') _j75();
if (typeof _j79 === 'function') _j79();
if (typeof _j83 === 'function') _j83();
if (typeof _j87 === 'function') _j87();
if (typeof _j91 === 'function') _j91();
if (typeof _j111 === 'function') _j111();
}
function _j159() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1395 = document.getElementById('effect-control-panel');
const _j1384 = document.getElementById('flow-effect-panel');
const maskPanel = document.getElementById('mask-panel');
const _j1396 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint, #mask-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1387) {
_j1388 = {
overlay: _j686,
control: _j694,
effect: _j698,
flow: _j702,
mask: _j706
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1395) _j1395.style.display = 'none';
if (_j1384) _j1384.style.display = 'none';
if (maskPanel) maskPanel.style.display = 'none';
_j1396.forEach(h => h.style.display = 'none');
_j686 = false;
_j694 = false;
_j698 = false;
_j702 = false;
_j706 = false;
_j1387 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1388 || { overlay: true, control: true, effect: true, flow: true, mask: true };
_j686 = s.overlay;
_j694 = s.control;
_j698 = s.effect;
_j702 = s.flow;
_j706 = s.mask !== undefined ? s.mask : true;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1395) _j1395.style.display = s.effect ? 'block' : 'none';
if (_j1384) _j1384.style.display = s.flow ? 'block' : 'none';
if (maskPanel) maskPanel.style.display = _j706 ? 'block' : 'none';
_j1396.forEach(h => h.style.display = '');
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
_j1387 = false;
_j1388 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j160();
}
}
function _j160() {
const _j1397 = [
{ panel: _j68('messageOverlay'), pos: _j690, update: _j75, defaultPos: { x: 50, y: 50 } },
{ panel: _j68('controlPanel'), pos: _j693, update: _j79, defaultPos: { x: 85, y: 50 } },
{ panel: _j68('effectControlPanel'), pos: _j697, update: _j83, defaultPos: { x: 15, y: 50 } },
{ panel: _j68('flowEffectPanel'), pos: _j701, update: _j87, defaultPos: { x: 50, y: 85 } }
];
_j1397.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1162 = panel.querySelector('.control-btn');
if (!_j1162) return;
const rect = _j1162.getBoundingClientRect();
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
if (_j1387) return;
_j159();
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
let _j1398 = false;
const _j1399 = new MutationObserver(() => {
if (_j1398) return;
if (go()) {
_j1398 = true;
_j1399.disconnect();
}
});
_j1399.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1398) _j1399.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j161() {
const _j1400 = document.getElementById('metallic-strength');
const _j1401 = document.getElementById('metallic-strength-value');
if (_j1400 && _j1401) {
const _j1346 = parseFloat(_j1400.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1346 / 100;
}
_j1401.textContent = _j1346;
_j1400.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1401.textContent = value;
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
_j189('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1402 = document.getElementById('metallic-flow');
const _j1403 = document.getElementById('metallic-flow-value');
const _j1404 = document.getElementById('flow-auto-random');
let _j1405 = null;
if (_j1402 && _j1403) {
const _j1346 = parseFloat(_j1402.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1346 / 100;
}
_j1403.textContent = _j1346;
_j1402.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1403.textContent = value;
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
_j189('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1404 && _j1402 && _j1403) {
_j1404.addEventListener('click', () => {
const isActive = _j1404.getAttribute('data-active') === 'true';
if (isActive) {
_j1404.setAttribute('data-active', 'false');
_j1404.classList.remove('active');
if (_j1405) {
clearInterval(_j1405);
_j1405 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1404.setAttribute('data-active', 'true');
_j1404.classList.add('active');
_j1405 = setInterval(() => {
const _j323 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1402.value = _j323;
_j1403.textContent = _j323;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j323 / 50;
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
Object.keys(tintButtons).forEach(_j1463 => {
const _j1406 = document.getElementById(_j1463);
if (_j1406) {
_j1406.classList.remove('active');
}
});
btn.classList.add('active');
const _j1407 = btn.textContent.trim();
_j112('system', '🎨 Metal tint changed', {
Tint: _j1407,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
const tintType = id.replace('metal-', '');
_j189('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j162() {
_j131();
_j128();
_j135();
_j137();
_j139();
_j134();
}
function _j163() {
const _j1408 = document.querySelector('.shape-type-btn.active');
if (_j1408) {
return parseInt(_j1408.dataset.type);
}
return 0;
}
function _j164(type) {
const _j1213 = document.querySelectorAll('.shape-type-btn');
_j1213.forEach(btn => {
const _j1409 = parseInt(btn.dataset.type);
if (_j1409 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j165() {
const _j814 = document.getElementById('bugs-size');
const _j1410 = document.getElementById('bugs-size-value');
if (_j814 && _j1410) {
const _j1346 = parseFloat(_j814.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1346;
}
_j1410.textContent = _j1346;
_j814.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1410.textContent = value;
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
_j189('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1411 = document.querySelectorAll('.shape-type-btn');
_j1411.forEach(btn => {
_j142(btn, () => {
const type = parseInt(btn.dataset.type);
_j164(type);
});
});
}
function _j166() {
const _j1336 = document.getElementById('stroke-select-slider');
const _j1338 = document.getElementById('stroke-index-display');
const _j1412 = document.getElementById('stroke-total-display');
const _j1339 = document.getElementById('stroke-select-value');
if (!_j1336 || !_j1338 || !_j1412 || !_j1339) {
return;
}
function _j167(_j1561 = false) {
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
const _j1413 = Math.max(0, strokeCount - 1);
_j1336.max = _j1413;
_j1412.textContent = strokeCount;
if (_j1561 || parseInt(_j1336.value) > _j1413) {
_j1336.value = _j1413;
}
const _j1414 = parseInt(_j1336.value) || 0;
_j1338.textContent = _j1414;
_j1339.textContent = _j1414;
}
_j167();
_j1336.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1338.textContent = value;
_j1339.textContent = value;
let gridParams = null;
let points = null;
if (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0) {
const _j1415 = Math.max(0, Math.min(value, allBrushStrokes.length - 1));
const selectedStroke = allBrushStrokes[_j1415];
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
let _j1416 = 0;
setInterval(() => {
const _j1417 = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (_j1417 !== _j1416) {
const _j558 = _j1417 > _j1416;
_j167(_j558);
_j1416 = _j1417;
}
}, 500);
window.updateStrokeSelector = _j167;
}
function _j168() {
const _j1254 = document.getElementById('custom-brush-color');
const _j1255 = document.getElementById('custom-brush-color-text');
if (!_j1254 || !_j1255) {
console.error('Custom brush color inputs not found');
return;
}
let _j1244 = _j1255.value.trim();
if (!_j1244 || !/^#[0-9A-Fa-f]{6}$/.test(_j1244)) {
_j1244 = _j1254.value;
}
const r = parseInt(_j1244.slice(1, 3), 16);
const g = parseInt(_j1244.slice(3, 5), 16);
const b = parseInt(_j1244.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j112('ui', '❌ Invalid custom brush color', {
Color: _j1244,
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
_j137();
_j140();
_j1254.value = _j1244.toUpperCase();
_j1255.value = _j1244.toUpperCase();
_j112('ui', '🎨 Custom brush color applied', {
Color: _j1244,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j169() {
const _j1242 = document.getElementById('canvas-background-color');
const _j1243 = document.getElementById('canvas-background-color-text');
const _j1245 = document.getElementById('canvas-width');
const _j1246 = document.getElementById('canvas-height');
let _j1418 = false;
if (_j1242 && _j1243) {
let _j1244 = _j1243.value.trim();
if (!_j1244 || !/^#[0-9A-Fa-f]{6}$/.test(_j1244)) {
_j1244 = _j1242.value;
}
const r = parseInt(_j1244.slice(1, 3), 16);
const g = parseInt(_j1244.slice(3, 5), 16);
const b = parseInt(_j1244.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j112('ui', '❌ Invalid background color', {
Color: _j1244,
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
if (typeof _j627 !== 'undefined' && _j627) {
_j627.begin();
background(r, g, b);
_j627.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j575 !== 'undefined') {
_j575 = true;
}
_j1242.value = _j1244.toUpperCase();
_j1243.value = _j1244.toUpperCase();
_j112('ui', '🎨 Background color changed', {
Color: _j1244,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1245 && _j1246) {
const _j1419 = parseInt(_j1245.value);
const _j1420 = parseInt(_j1246.value);
if (isNaN(_j1419) || isNaN(_j1420)) {
_j112('ui', '❌ Invalid canvas size', {
Width: _j1245.value,
Height: _j1246.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1419 < 100 || _j1419 > 4000 || _j1420 < 100 || _j1420 > 4000) {
_j112('ui', '❌ Canvas size out of range', {
Width: _j1419,
Height: _j1420,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j512 !== 'undefined' && typeof _j513 !== 'undefined') {
if (_j512 !== _j1419 || _j513 !== _j1420) {
_j512 = _j1419;
_j513 = _j1420;
_j1418 = true;
_j112('ui', '📐 Canvas size changed', {
Width: `${_j1419}px`,
Height: `${_j1420}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1418) {
sessionStorage.setItem('pendingCanvasWidth', _j512.toString());
sessionStorage.setItem('pendingCanvasHeight', _j513.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1421 = null;
let _j1422 = null;
function _j170() {
const _j1423 = document.querySelectorAll('.flow-effect-btn');
const _j1424 = document.getElementById('flow-strength');
const _j1425 = document.getElementById('flow-strength-value');
if (_j1424 && _j1425) {
_j1424.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1425.textContent = value;
if (typeof _j613 !== 'undefined') {
_j613.blendVol = value;
}
});
}
const _j1426 = document.getElementById('flow-last-stroke-only');
if (_j1426) {
_j1426.addEventListener('change', (e) => {
if (typeof _j614 !== 'undefined') {
_j614 = e.target.checked;
_j112('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j614
});
}
});
}
_j1423.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j171(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j172(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1421 === btn) {
_j172(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j171(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j172(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j172(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1421) {
const blendType = parseInt(_j1421.dataset.type);
_j172(_j1421, blendType);
}
});
}
function _j171(btn, blendType) {
if (_j1421) return;
const bounds = typeof _j49 === 'function' ? _j49() : null;
if (!bounds) {
_j112('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1421 = btn;
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
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630) {
if (typeof _j633 !== 'undefined' && _j633 > 0 && typeof _j635 !== 'undefined') {
const _j820 = millis() - _j633;
if (_j820 > 0) {
_j635 += _j820;
_j633 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j820,
total: _j635
});
}
}
const _j1427 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j613 !== 'undefined') ? _j613.blendVol : 100,
lastStrokeOnly: (typeof _j614 !== 'undefined') ? _j614 : false
};
console.log('🎬 Recording flow start event:', _j1427);
_j189('flow', _j1427);
}
_j1422 = setInterval(() => {
const _j919 = document.getElementById('flow-iteration-count');
if (_j919 && typeof _j603 !== 'undefined') {
_j919.textContent = _j603;
}
}, 50);
_j112('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j172(btn, blendType) {
if (_j1421 !== btn) return;
btn.classList.remove('active', 'running');
_j1421 = null;
if (_j1422) {
clearInterval(_j1422);
_j1422 = null;
}
let _j1428 = null;
if (typeof _j51 === 'function') {
_j1428 = _j51();
}
if (typeof _j189 === 'function' && typeof _j630 !== 'undefined' && _j630 && _j1428) {
const _j1429 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j605 !== 'undefined') ? _j605 : 0,
duration: _j1428.duration,
iterations: _j1428.iterations,
totalFrames: _j1428.frames
};
console.log('🎬 Recording flow end event:', _j1429);
_j189('flow', _j1429);
if (typeof _j633 !== 'undefined') {
_j633 = millis();
}
}
_j112('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1428 ? Math.round(_j1428.duration) + 'ms' : 'unknown',
Iterations: _j1428 ? _j1428.iterations : 'unknown',
Frames: _j1428 ? _j1428.frames : 'unknown'
});
}
let _j1430 = {
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
_pushFR: function(_j1562) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1562;
this._frSum += _j1562;
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
const _j1431 = this._avgFR();
console.log('平均 frameRate:', _j1431.toFixed(2));
console.log('是否触发警告:', _j1431 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1432 = this.logCooldown;
this.logCooldown = 0;
const _j1433 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1433.toFixed(2));
_j36(_j1433);
this.logCooldown = _j1432;
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
const _j1431 = this._avgFR();
console.log('平均帧率:', _j1431);
const _j1432 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j36(_j1431);
this.logCooldown = _j1432;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1432 = this.logCooldown;
this.logCooldown = 0;
const _j1434 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1434);
_j36(_j1434);
this.logCooldown = _j1432;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1430 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1430).filter(k => typeof _j1430[k] === 'function'));
_j36(50);
};
function _j173() {
_j519 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j520 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j522 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j174() {
const _j487 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j487[0], _j487[1], _j487[2]);
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
if (typeof _j621 !== 'undefined' && _j621) {
_j621.clear();
}
if (typeof finalBuffer !== 'undefined' && finalBuffer) {
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
}
if (typeof _j623 !== 'undefined' && _j623) {
_j623.clear();
_j623.background(255);
}
if (typeof _j625 !== 'undefined' && _j625) {
_j625.begin();
clear();
_j625.end();
}
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j556 = false;
_j557 = false;
_j578 = 0;
force = 1.0;
_j558 = false;
_j559 = false;
_j550 = 0;
x = hw;
y = hh;
_j534 = 0;
_j535 = 0;
_j536 = 0;
initialSize = 0;
_j539 = 0;
_j580 = 0;
pathPoints = [];
_j584 = false;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j583 !== 'undefined') {
_j583 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j382 !== 'undefined') {
_j382 = null;
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
_j180();
_j177();
_j575 = true;
}
function _j175() {
_j112('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j176();
_j177();
_j179();
_j178();
_j112('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j176() {
oldBuffer.begin();
clear();
background(255);
oldBuffer.end();
newBufferBlack.begin();
clear();
background(255);
newBufferBlack.end();
_j621.clear();
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
_j623.clear();
_j623.background(255);
pingPongBuffer.begin();
clear();
background(255);
pingPongBuffer.end();
if (typeof _j628 !== 'undefined' && _j628) {
_j628.begin();
clear();
_j628.end();
}
_j625.begin();
clear();
_j625.end();
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j621.blendMode(BLEND);
_j623.blendMode(BLEND);
_j575 = true;
}
function _j177() {
if (!pingPongBuffer || !_j517) return;
if (_j517) {
pingPongBuffer.begin();
if (_j599) {
image(newBufferBlack, 0, 0, width, height);
resetShader();
pingPongBuffer.end();
return;
}
shader(_j517);
_j517.setUniform("rect", [0, 0, width * _j514, height * _j514]);
_j517.setUniform("tex0", newBufferBlack);
_j517.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j517.setUniform("forceMap", _j515);
_j517.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j517.setUniform("force", 1.0);
_j517.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j517.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j517.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j517.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j517.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j517.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
}
}
function _j178() {
_j556 = false;
_j557 = false;
_j578 = 0;
force = 1.0;
_j558 = false;
_j559 = false;
_j550 = 0;
x = hw;
y = hh;
_j534 = 0;
_j535 = 0;
_j536 = 0;
initialSize = 0;
_j539 = 0;
_j537 = 0;
_j524 = 0;
_j579 = 0;
_j580 = 0;
pathPoints = [];
_j584 = false;
startX = hw;
startY = hh;
_j446 = hw;
_j447 = hh;
_j538 = 0;
_j547 = 0;
_j545 = hw;
_j546 = hh;
_j544 = [];
flyBrushEnd = [];
_j541 = 0;
_j642 = hw;
_j643 = hh;
_j644 = hw;
_j645 = hh;
_j646 = false;
_j648 = 0;
_j649 = false;
}
function _j179() {
_j515.begin();
shader(_j516);
_j516.setUniform("randomSeed1", _j615[0] || 100);
_j516.setUniform("randomSeed2", _j615[1] || 200);
_j516.setUniform("randomSeed3", _j615[2] || 300);
_j516.setUniform("randomSeed4", _j615[3] || 400);
_j516.setUniform("scale1", _j616[0] || 0.002);
_j516.setUniform("scale2", _j616[1] || 0.005);
_j516.setUniform("scale3", _j616[2] || 0.015);
_j516.setUniform("amplitude1", _j617[0] || 0.6);
_j516.setUniform("amplitude2", _j617[1] || 0.4);
_j516.setUniform("amplitude3", _j617[2] || 0.3);
_j516.setUniform("phase1", _j618[0] || 0);
_j516.setUniform("phase2", _j618[1] || 0);
_j516.setUniform("phase3", _j618[2] || 0);
_j516.setUniform("vortexScale1", _j619[0] || 0.008);
_j516.setUniform("vortexScale2", _j619[1] || 0.012);
_j516.setUniform("clusterScale1", _j620[0] || 0.001);
_j516.setUniform("clusterScale2", _j620[1] || 0.0008);
_j516.setUniform("canvasCenter", [hw, hh]);
_j516.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j515.end();
}
function _j180() {
for (let i = 0; i < 4; i++) {
_j615[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j616[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j617[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j618[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j619[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j620[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j179();
}
function _j181(title = '') {}
function _j182() {
_j183();
}
function _j183() {
_j180();
const _j1435 = brushMode;
brushMode = 1;
initialSize = 20;
_j539 = initialSize;
_j533 = _j539;
_j537 = _j533;
_j556 = true;
_j557 = false;
_j578 = 0;
_j558 = true;
_j559 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j30(newBufferBlack, 1.0);
}
mouseReleased();
_j557 = true;
_j578 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j30(newBufferBlack, force);
}
_j39();
brushMode = _j1435;
_j174();
}
function _j184() {
if (_j681) {
_j112('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j681 = true;
_j682 = millis();
frameCount = 0;
_j683 = [];
_j181('🎬 Start Frame Recording');
}
function _j185() {
if (!_j681) {
_j112('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j681 = false;
const _j1436 = millis() - _j682;
_j181('🎬 Frame Recording Complete');
_j187();
}
function _j186() {
if (!_j681) return;
if (frameCount % _j684 !== 0) {
frameCount++;
return;
}
const _j1437 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1437}.png`;
saveCanvas(filename, 'png');
_j683.push({
frame: frameCount,
timestamp: millis() - _j682,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j112('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j683.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j187() {
if (_j683.length === 0) {
_j112('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j112('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j683.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j188(_j1563) {
return Math.round(_j1563 * 100) / 100;
}
function _j189(type, data = {}) {
if (window.testMode) return;
if (!_j630) return;
if (_j631 === 0) return;
const _j1438 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1439 = _j1438 + (millis() - _j631 - _j635);
const event = {
m: type,
t: Math.round(_j1439),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1440 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1441 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j112('recording', `${_j1440[type] || '📝'} Event recorded`, {
Type: _j1441[type] || type,
Time: `${_j1439.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j190() {
_j630 = true;
_j631 = 0;
_j633 = 0;
_j635 = 0;
_j636 = true;
_j524 = 0;
const _j1442 = seed;
const _j1443 = (typeof _j163 === 'function') ? _j163() : 0;
const _j1444 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1445 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1446 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1447 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1446[0] - rgb[0]) < 0.01 &&
Math.abs(_j1446[1] - rgb[1]) < 0.01 &&
Math.abs(_j1446[2] - rgb[2]) < 0.01) {
_j1447 = type;
break;
}
}
recordingData = {
version: "1.0",
engineVersion: (typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev',
startTime: _j631,
randomSeed: _j1442,
initialPathToggle: _j574,
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
shapeType: _j1443,
metallicStrength: _j1444,
metallicFlow: _j1445,
metallicTint: _j1446,
metallicTintType: _j1447
}
};
randomSeed(_j1442);
noiseSeed(_j1442);
_j181('🎬 Start Art Creation Recording');
if (typeof _j120 === 'function') {
_j120();
}
}
function _j191() {
if (!_j630) return;
_j630 = false;
randomSeed(seed);
noiseSeed(seed);
_j181('✨ Art Creation Recording Complete');
const _j1448 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j613 !== 'undefined' ? _j613.blendVol : 100,
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
_j192();
setTimeout(() => {
_j126();
}, 300);
if (typeof _j120 === 'function') {
_j120();
}
}
function _j192() {
if (recordingData.events.length === 0) {
_j112('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1449 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1450 = JSON.stringify(_j1449, null, 2);
const blob = new Blob([_j1450], {
type: 'application/json'
});
const _j1192 = URL.createObjectURL(blob);
const _j1451 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1451.download = `drawing-recording-${timestamp}.json`;
_j1451.href = _j1192;
_j1451.click();
URL.revokeObjectURL(_j1192);
_j112('art', '💾 Art recording saved', {
File: _j1451.download,
Size: `${(_j1450.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j120 === 'function') {
_j120();
}
}
function _j193() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1381 = event.target.files[0];
if (!_j1381) return;
const _j1208 = new FileReader();
_j1208.onload = (e) => {
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
window.loadedRecordingFileName = _j1381.name;
}
recordingData = loadedData;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j583 !== 'undefined') {
_j583 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof _j241 !== 'undefined') {
_j241 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j181('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1452 = _j199(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1452) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1381.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j627 !== 'undefined' && _j627) {
_j627.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j627.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j143 === 'function') {
_j143();
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
_j1208.readAsText(_j1381);
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
if (_j638) {
_j112('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j1052 !== 'undefined') {
_j1052 = [];
}
if (typeof _j1053 !== 'undefined') {
_j1053 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1453 = window.location.search || '';
const _j1454 = (key) => _j1453.includes('_' + key + ':') || _j1453.includes('?' + key + ':');
const _j1455 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1456 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1457 = recordingData.initialPanelToggles;
for (const _j1458 of _j1455) {
const urlKey = _j1456[_j1458.jsonKey];
if (urlKey && _j1454(urlKey)) continue;
const value = _j1457 ? _j1457[_j1458.jsonKey] : undefined;
const _j1459 = value !== undefined ? value : _j1458.defaultVal;
_j1458.setter(_j1459);
const _j1460 = document.getElementById(_j1458.toggleId);
if (_j1460) {
_j1460.checked = _j1458.isNumeric ? (_j1459 === 1) : !!_j1459;
}
}
const _j1461 = recordingData.events.filter(e => e.m === 'mp').length;
const _j1462 = recordingData.events.filter(e => e.m === 'md').length;
if (window.skipClearCanvasOnNextPlayback) {
window.skipClearCanvasOnNextPlayback = false;
console.log('[append] ✅ skip clearCanvas, overlay playback', { mp: _j1461, md: _j1462, totalEvents: recordingData.events.length });
} else {
console.log('[startPlayback] ❌ standard mode, will clear canvas', { mp: _j1461, md: _j1462, totalEvents: recordingData.events.length });
_j174();
if (typeof clearMask === 'function') clearMask();
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j627 !== 'undefined' && _j627) {
_j627.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j627.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j575 !== 'undefined') {
_j575 = true;
}
if (typeof _j143 === 'function') {
_j143();
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
_j638 = true;
_j639 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j640 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j657 !== 'undefined') {
_j657 = 0;
}
_j646 = false;
_j642 = hw;
_j643 = hh;
_j644 = hw;
_j645 = hh;
_j580 = 0;
if (typeof _j680 !== 'undefined') {
_j680 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j583 !== 'undefined') {
_j583 = null;
}
if (typeof _j584 !== 'undefined') {
_j584 = false;
}
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j241 !== 'undefined') {
_j241 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j675 !== 'undefined') {
_j675 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j676 !== 'undefined') {
_j676 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j524 = 0;
_j648 = 0;
_j649 = false;
if (recordingData.initialPathToggle !== undefined) {
_j574 = recordingData.initialPathToggle;
_j112('playback', 'Path toggle restored', {
Status: _j574 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1223 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j112('playback', 'Brush color restored', {
Mode: _j1223[brushColorMode] || 'Unknown'
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
_j181('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j164 === 'function') {
_j164(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1400 = document.getElementById('metallic-strength');
const _j1401 = document.getElementById('metallic-strength-value');
if (_j1400 && _j1401) {
_j1400.value = ec.metallicStrength;
_j1401.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1402 = document.getElementById('metallic-flow');
const _j1403 = document.getElementById('metallic-flow-value');
if (_j1402 && _j1403) {
_j1402.value = ec.metallicFlow;
_j1403.textContent = ec.metallicFlow;
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
const _j1463 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1463);
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
const _j1464 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1465 = window.location.search || '';
const _j1466 = (key) => _j1465.includes('_' + key + ':') || _j1465.includes('?' + key + ':');
for (const _j1458 of _j1464) {
if (_j1466(_j1458.urlKey)) continue;
_j1458.setter(false);
const _j1460 = document.getElementById(_j1458.toggleId);
if (_j1460) {
_j1460.checked = false;
}
const _j1467 = document.getElementById(_j1458.slidersId);
if (_j1467) {
_j1467.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1468 = document.getElementById('distort-fbm-preview-toggle');
if (_j1468) _j1468.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1469 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1469)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j112('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j613 !== 'undefined') {
_j613.blendVol = fe.flowStrength;
const _j1470 = document.getElementById('flow-strength');
const _j1471 = document.getElementById('flow-strength-value');
if (_j1470) _j1470.value = fe.flowStrength;
if (_j1471) _j1471.textContent = fe.flowStrength;
}
for (const _j1458 of _j1464) {
const value = fe[_j1458.jsonKey];
if (value === undefined) continue;
if (_j1466(_j1458.urlKey)) {
_j112('playback', `⏭️ Flow Effect: ${_j1458.jsonKey} skipped (URL override)`, {});
continue;
}
_j1458.setter(!!value);
const _j1460 = document.getElementById(_j1458.toggleId);
if (_j1460) {
_j1460.checked = !!value;
}
const _j1467 = document.getElementById(_j1458.slidersId);
if (_j1467) {
_j1467.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1468 = document.getElementById('distort-fbm-preview-toggle');
if (_j1468) _j1468.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1472 = document.getElementById('distort-displacement-b');
const _j1473 = document.getElementById('distort-displacement-b-value');
if (_j1472) _j1472.value = fe.distortDisplacementB;
if (_j1473) _j1473.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1474 = document.getElementById('distort-displacement-c');
const _j1475 = document.getElementById('distort-displacement-c-value');
if (_j1474) _j1474.value = fe.distortDisplacementC;
if (_j1475) _j1475.textContent = fe.distortDisplacementC;
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
if (_j1457) {
_j112('playback', '✨ Panel toggles restored', {
Paper: _j1457.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1457.showGridOverlay ? 'ON' : 'OFF',
Path: _j1457.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1457.screenText ? 'ON' : 'OFF',
Camera: _j1457.doMoving ? 'ON' : 'OFF',
Loop: _j1457.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j112('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j180();
_j177();
const _j1476 = recordingData.events[0];
if (_j1476 && _j1476.strokeData) {
const strokeData = _j1476.strokeData;
_j539 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j539;
nowSize = size;
}
_j30(newBufferBlack, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j653 === 'undefined' || !_j653) {
_j653 = true;
}
_j654 = true;
if (_j653 && _j652 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j429 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j429 / 2));
_j652.setAutoUpdate(true);
if (typeof _j652.setPanScale === 'function') {
_j652.setPanScale(0);
}
if (typeof _j652.setZoomScale === 'function') {
_j652.setZoomScale(0);
}
_j652.setCenter([0, 0, 0], 0);
_j652.setDistance(easycamInitialDistance, 0);
if (typeof _j659 !== 'undefined') {
_j659 = 1;
}
_j112('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j654 = false;
_j653 = false;
}
if (typeof _j120 === 'function') {
_j120();
}
}
function _j194() {
if (!_j638) return;
_j638 = false;
_j646 = false;
_j640 = 0;
isWaitingToLoop = false;
_j648 = 0;
_j649 = false;
randomSeed(seed);
noiseSeed(seed);
_j181('⏹️ Playback Ended');
_j197();
_j654 = false;
if (_j653 && _j652 !== null) {
try {
const _j428 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j431 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j432 = _j652.getCenter();
const _j433 = _j652.getDistance();
_j112('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j432[0].toFixed(2)}, ${_j432[1].toFixed(2)}, ${_j432[2].toFixed(2)}], Distance: ${_j433.toFixed(2)}`,
Target: `Center: [${_j428[0].toFixed(2)}, ${_j428[1].toFixed(2)}, ${_j428[2].toFixed(2)}], Distance: ${_j431.toFixed(2)}`
});
_j665 = true;
_j666 = millis();
_j663 = [_j432[0], _j432[1], _j432[2]];
_j667 = _j433;
_j664 = _j428;
_j668 = _j431;
setTimeout(() => {
if (_j652 !== null) {
_j652.setAutoUpdate(false);
const _j440 = _j652.getCenter();
const _j441 = _j652.getDistance();
const _j434 = 0.1;
const _j435 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j440[0] - _j428[0], 2) +
Math.pow(_j440[1] - _j428[1], 2) +
Math.pow(_j440[2] - _j428[2], 2)
);
const distanceDiff = Math.abs(_j441 - _j431);
_j112('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j440[0].toFixed(2)}, ${_j440[1].toFixed(2)}, ${_j440[2].toFixed(2)}], Distance: ${_j441.toFixed(2)}`,
Target: `Center: [${_j428[0].toFixed(2)}, ${_j428[1].toFixed(2)}, ${_j428[2].toFixed(2)}], Distance: ${_j431.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j434 && distanceDiff <= _j435) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j434 || distanceDiff > _j435) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j440[0].toFixed(3)}, ${_j440[1].toFixed(3)}, ${_j440[2].toFixed(3)}]`,
distance: _j441.toFixed(3)
}
});
_j652.setCenter(_j428, 0);
_j652.setDistance(_j431, 0);
const _j1477 = _j652.getCenter();
const _j1478 = _j652.getDistance();
_j112('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1477[0].toFixed(2)}, ${_j1477[1].toFixed(2)}, ${_j1477[2].toFixed(2)}]`,
Distance: _j1478.toFixed(2)
});
}
_j665 = false;
}
_j653 = false;
}, 2100);
_j112('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j428,
Distance: _j431.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j653 = false;
}
} else {
_j653 = false;
}
if (typeof _j120 === 'function') {
_j120();
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
function _j195(event) {
const _j869 = event.m || event.type;
switch (_j869) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('playback_mousePressed_start', 'mousePressed');
const _j1479 = _j557;
const _j1480 = event.t !== undefined ? event.t : event.time;
if (_j557) {
const _j778 = _j639;
if (window._fxVirtualTime === undefined) {
_j639 = millis() - _j1480 / _j641;
}
const _j1481 = _j778 - _j639;
const _j777 = (typeof _j648 !== 'undefined' && _j648 > 0) ?
(millis() - _j648) :
0;
if (typeof _j649 !== 'undefined') {
_j649 = false;
}
if (typeof _j648 !== 'undefined') {
_j648 = 0;
}
_j39();
_j557 = false;
_j578 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1482 = _j1480 - playbackLastStrokeEndEventTime;
const _j1483 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1484 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j40();
if (typeof _j1052 !== 'undefined') {
_j1052 = [];
}
if (typeof _j1053 !== 'undefined') {
_j1053 = 0;
}
if (typeof _j657 !== 'undefined') {
_j657++;
if (typeof _j660 !== 'undefined' && typeof _j658 !== 'undefined') {
_j660 = random(0, 1) > 0.7;
_j658 = _j657;
}
}
_j642 = event.x + (typeof _j650 !== 'undefined' ? _j650 : 0);
_j643 = event.y + (typeof _j651 !== 'undefined' ? _j651 : 0);
_j644 = _j642;
_j645 = _j643;
if (false) {
_j646 = true;
} else {
_j646 = false;
}
if (typeof _j680 !== 'undefined') {
_j680 = true;
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
_j581 = sd.mouseCountStart;
} else {
_j581 = 0;
}
_j579 = 0;
const offsetX = typeof _j650 !== 'undefined' ? _j650 : 0;
const offsetY = typeof _j651 !== 'undefined' ? _j651 : 0;
const _j1485 = event.x + offsetX;
const _j1486 = event.y + offsetY;
_j112('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1485.toFixed(0)}, ${_j1486.toFixed(0)})`
});
_j112('system', '|--------------------------------', {});
} else {
_j112('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j579 = 0;
}
_j524 = 0;
_j550 = 0;
x = _j642;
y = _j643;
_j534 = 0;
_j535 = 0;
_j536 = 0;
_j547 = 0;
_j541 = 0;
_j580 = 0;
_j578 = 0;
_j557 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j1052 !== 'undefined') {
_j1052 = [];
}
if (typeof _j548 !== 'undefined') {
_j548 = _j642;
_j549 = _j643;
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
_j529 = sd.step !== undefined ? sd.step : 4;
_j586 = sd.step2 !== undefined ? sd.step2 : 2;
randStep = sd.randStep !== undefined ? sd.randStep : 0;
maxUpdates = sd.maxUpdates !== undefined ? sd.maxUpdates : 30;
pathRotation = sd.pathRotation !== undefined ? sd.pathRotation : 0;
_j531 = sd.spring !== undefined ? sd.spring : 0.6;
_j532 = sd.friction !== undefined ? sd.friction : 0.5;
baseBrushSize = sd.baseBrushSize || 1.0;
if (_j560) {
_j572 = baseBrushSize;
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
_j525 = sd.whiteMaxOpacity;
} else {
_j525 = 0.95;
}
if (sd.hueShift !== undefined) {
_j526 = sd.hueShift;
} else {
_j526 = 0.0;
}
if (sd.satShift !== undefined) {
_j527 = sd.satShift;
} else {
_j527 = 0.0;
}
if (sd.briShift !== undefined) {
_j528 = sd.briShift;
} else {
_j528 = 0.0;
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
_j567 = sd.maskData;
if (sd.maskData.action === 'rect') {
drawMaskRect(sd.maskData.x1, sd.maskData.y1, sd.maskData.x2, sd.maskData.y2);
} else if (sd.maskData.action === 'polygon') {
drawMaskPolygon(sd.maskData.points);
}
} else {
_j567 = null;
if (_j563) clearMask();
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j615[0] = fm.randomSeed1;
_j615[1] = fm.randomSeed2;
_j615[2] = fm.randomSeed3;
_j615[3] = fm.randomSeed4;
_j616[0] = fm.scale1;
_j616[1] = fm.scale2;
_j616[2] = fm.scale3;
_j617[0] = fm.amplitude1;
_j617[1] = fm.amplitude2;
_j617[2] = fm.amplitude3;
_j618[0] = fm.phase1;
_j618[1] = fm.phase2;
_j618[2] = fm.phase3;
_j619[0] = fm.vortexScale1;
_j619[1] = fm.vortexScale2;
_j620[0] = fm.clusterScale1;
_j620[1] = fm.clusterScale2;
_j179();
} else {
if (typeof _j180 === 'function') {
_j180();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j539 = initialSize;
_j533 = _j539;
_j537 = _j533;
_j550 = 0;
x = _j642;
y = _j643;
_j534 = 0;
_j535 = 0;
_j536 = 0;
_j547 = 0;
_j541 = 0;
_j556 = true;
_j557 = false;
_j578 = 0;
_j558 = true;
_j559 = false;
_j580 = 0;
startX = _j642;
startY = _j643;
pathPoints = [{
x: _j642,
y: _j643
}];
_j584 = true;
_j646 = true;
if (_j560) window._playbackPenPressure = -1;
_j30(newBufferBlack, 1.0);
crandomDebugger.checkpoint('playback_mousePressed_end', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j642 = event.x + (typeof _j650 !== 'undefined' ? _j650 : 0);
_j643 = event.y + (typeof _j651 !== 'undefined' ? _j651 : 0);
if (_j560 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j560) window._playbackPenPressure = -1;
const _j823 = crandom.getCount();
const _j1487 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1487;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('playback_mouseReleased', 'mouseReleased');
const _j1488 = crandom.getCount();
const _j828 = _j1488 - _j823;
const _j1489 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j860 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j869 = e.m || e.type;
return _j869 === 'mr' || _j869 === 'mouseReleased';
}).length :
'?';
const _j829 = window.drawLoopCount || 0;
const _j1490 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 playback [stroke ${_j1489}/${_j860}] | Draw: ${_j829} | Seed: ${_j1488}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1489);
crandomDebugger.compareStroke(_j1489);
_j642 = event.x + (typeof _j650 !== 'undefined' ? _j650 : 0);
_j643 = event.y + (typeof _j651 !== 'undefined' ? _j651 : 0);
_j646 = false;
if (!_j557) {
_j557 = true;
_j578 = 0;
if (typeof _j648 !== 'undefined') {
_j648 = millis();
}
if (typeof _j649 !== 'undefined') {
_j649 = true;
}
_j112('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j112('playback', 'Stroke reproduction complete', {
FinalSize: _j539.toFixed(2),
CountdownStatus: _j557 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j646) {
_j646 = true;
} else {
_j644 = _j642;
_j645 = _j643;
}
_j642 = event.x + (typeof _j650 !== 'undefined' ? _j650 : 0);
_j643 = event.y + (typeof _j651 !== 'undefined' ? _j651 : 0);
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
_j162();
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
const _j1491 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1492 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1410 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1410;
const _j814 = document.getElementById('bugs-size');
const _j815 = document.getElementById('bugs-size-value');
if (_j814 && _j815) {
_j814.value = _j1410;
_j815.textContent = _j1410;
}
}
const _j813 = {
action: action,
shapeType: _j1492,
bugsSize: _j1410,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1493 = null;
let _j1494 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j813);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1493 = window._scanGlobalPlaybackCount || 0;
_j1494 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1410;
}
const _j816 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1492);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1492);
}
}
if (_j816) {
randomSeed(_j816);
noiseSeed(_j816);
}
}
_j112('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1491,
ShapeType: _j1492 !== null ? _j1492 : 'Unknown',
BugsSize: _j1410,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1493,
CurrentCount: _j1494
});
} else if (action === 'scan-random') {
const _j1492 = event.shapeType !== undefined ? event.shapeType : null;
const _j1410 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1410;
const _j814 = document.getElementById('bugs-size');
const _j815 = document.getElementById('bugs-size-value');
if (_j814 && _j815) {
_j814.value = _j1410;
_j815.textContent = _j1410;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1492);
}
_j112('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1492 !== null ? _j1492 : 'Unknown',
BugsSize: _j1410
});
} else if (action === 'metallic-strength') {
const _j1401 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1401 / 100;
}
const _j1400 = document.getElementById('metallic-strength');
const _j1495 = document.getElementById('metallic-strength-value');
if (_j1400 && _j1495) {
_j1400.value = _j1401;
_j1495.textContent = _j1401;
}
_j112('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1401
});
} else if (action === 'bugs-size') {
const _j1410 = event.value !== undefined ? event.value : 10;
const _j814 = document.getElementById('bugs-size');
const _j815 = document.getElementById('bugs-size-value');
if (_j814 && _j815) {
_j814.value = _j1410;
window.bugsSize = _j1410;
_j815.textContent = _j1410;
_j112('system', '🐛 Bugs Size updated during playback', {
Value: _j1410
});
}
} else if (action === 'metallic-flow') {
const _j1403 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1403 / 100;
}
const _j1402 = document.getElementById('metallic-flow');
const _j1496 = document.getElementById('metallic-flow-value');
if (_j1402 && _j1496) {
_j1402.value = _j1403;
_j1496.textContent = _j1403;
}
_j112('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1403
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
const _j1463 = `metal-${tintType}`;
const btn = document.getElementById(_j1463);
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
if (typeof _j600 !== 'undefined' && _j600) {
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
if (event.strength !== undefined && typeof _j613 !== 'undefined') {
_j613.blendVol = event.strength;
}
if (typeof _j614 !== 'undefined') {
_j614 = event.lastStrokeOnly || false;
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
const _j1497 = window.pendingFlowEvent;
if (_j1497) {
if (typeof _j609 !== 'undefined') {
_j609 = event.totalFrames || (event.iterations * 3) || 30;
_j610 = event.iterations || 10;
}
_j112('playback', '🌊 Flow Effect: End (target set, wait for preview)', {
BlendType: _j1497.blendType,
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
if (!_j638) return;
const _j1498 = 200;
if (typeof window !== 'undefined') {
const _j1499 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1500 = millis() - window.lastEffectControlProcessTime;
if (_j1500 < _j1498) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1499 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1501 = millis() - _j647;
const _j1502 = Math.floor(_j1501 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1502) {}
if (_j1501 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ Countdown finished, preparing replay');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j112('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j653 && _j652 !== null) {
const _j428 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j431 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j652.setCenter(_j428, 0);
_j652.setDistance(_j431, 0);
_j665 = false;
_j112('system', '🎥 Camera reset for loop', {
Center: `[${_j428[0].toFixed(2)}, ${_j428[1].toFixed(2)}, ${_j428[2].toFixed(2)}]`,
Distance: _j431.toFixed(2)
});
}
_j174();
if (typeof _j1052 !== 'undefined') {
_j1052 = [];
}
if (typeof _j1053 !== 'undefined') {
_j1053 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j639 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j640 = 0;
_j646 = false;
_j642 = hw;
_j643 = hh;
_j644 = hw;
_j645 = hh;
isWaitingToLoop = false;
_j580 = 0;
_j524 = 0;
_j648 = 0;
_j649 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j583 !== 'undefined') {
_j583 = null;
}
if (typeof _j584 !== 'undefined') {
_j584 = false;
}
if (typeof _j675 !== 'undefined') {
_j675 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j676 !== 'undefined') {
_j676 = {
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
_j194();
}
}
return;
}
if (_j640 >= recordingData.events.length && !isWaitingToLoop) {
if (_j646) {
_j646 = false;
if (!_j557) {
_j557 = true;
_j578 = 0;
_j575 = true;
}
}
if (_j557) {
if (_j578 < maxUpdates) {
return;
}
}
if (_j556) {
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
window._fxDebug.eventsProcessed = _j640;
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
function _j196() {
console.log('[fxhash] Forcing final composite + capture...');
_j575 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j653 && _j652 !== null) {
_j665 = true;
_j666 = millis();
_j663 = [_j652.getCenter()[0], _j652.getCenter()[1], _j652.getCenter()[2]];
_j667 = _j652.getDistance();
_j664 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j668 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1503 = _j669 + 500;
console.log('[fxhash] Waiting ' + _j1503 + 'ms for camera reset before capture...');
setTimeout(_j196, _j1503);
} else {
_j196();
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
_j647 = millis();
} else {
_j112('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle is not 1, stopping playback');
_j194();
}
return;
}
var _j783;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j783 = window._fxVirtualTime * _j641;
} else {
_j783 = (millis() - _j639) * _j641;
}
let _j1504 = 0;
const _j1505 = 100;
let _j1506 = 0;
const _j1507 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1508 = false;
while (_j640 < recordingData.events.length && _j1504 < _j1505) {
if (typeof _j600 !== 'undefined' && _j600 &&
typeof _j609 !== 'undefined' && _j609 > 0) {
break;
}
const event = recordingData.events[_j640];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j869 = event.m || event.type;
const _j1509 = _j869 === 'mp' || _j869 === 'mousePressed';
const _j1510 = _j869 === 'mr' || _j869 === 'mouseReleased';
const _j1511 = _j869 === 'ec' || _j869 === 'effectControl';
const _j1512 = _j869 === 'flow';
const _j1513 = _j869 === 'mask';
const _j784 = eventTime - _j783;
if (!_j1511 && !_j1512 && !_j1513 && eventTime > _j783 && _j640 + 1 < recordingData.events.length) {
const _j779 = recordingData.events[_j640 + 1];
const _j780 = _j779.m || _j779.type;
const _j781 = _j780 === 'mp' || _j780 === 'mousePressed';
if (_j781) {
if (_j1510) {
if (_j1508) {
break;
}
_j195(event);
_j640++;
_j1504++;
continue;
} else {
_j640++;
continue;
}
}
}
if (eventTime <= _j783) {
const _j1514 = _j869 === 'md' || _j869 === 'mouseDragged';
if (_j1514 && _j1506 >= _j1507) {
break;
}
if (_j1510 && _j1508) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1511 || _j1513 || !_j557 || (_j557 && _j646)) {
if (_j1511) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j195(event);
_j640++;
_j1504++;
if (_j1514) {
_j1506++;
_j1508 = true;
}
} else {
break;
}
} else {
const _j1514 = _j869 === 'md' || _j869 === 'mouseDragged';
if (_j1514 && _j1506 >= _j1507) {
break;
}
if (_j1510 && _j1508) {
break;
}
if (_j1511 || _j1512 || _j1513 || (_j1509 && !_j557) || _j784 < 100) {
if (_j1511) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j195(event);
_j640++;
_j1504++;
if (_j1514) {
_j1506++;
_j1508 = true;
}
} else {
break;
}
}
if (_j1506 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j197() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1515 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1515) {
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
const _j1516 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1517 = confirm(
`Playback complete.\n\n` +
`Events played: ${loadedData.events.length}\n` +
`File: ${_j1516}\n\n` +
`Continue recording and append new strokes?\n\n` +
`OK — continue recording\n` +
`Cancel — stop`
);
if (_j1517) {
_j198(loadedData, _j1516);
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
function _j198(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j112('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j190();
return;
}
const _j1518 = loadedData.events[loadedData.events.length - 1];
const _j1448 = _j1518.t !== undefined ? _j1518.t : (_j1518.time !== undefined ? _j1518.time : 0);
_j630 = true;
_j631 = millis();
_j633 = 0;
_j635 = 0;
_j636 = true;
_j524 = 0;
recordingData = {
...loadedData,
engineVersion: loadedData.engineVersion || (
(typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev'
),
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1448,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1442 = seed;
randomSeed(_j1442);
noiseSeed(_j1442);
_j181('🔄 Continue Recording from Loaded File');
_j112('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1448}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j120 === 'function') {
_j120();
}
}
function _j199(_j1564, _j1565) {
if (!_j1564 || !_j1565) {
_j112('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1564 && height === _j1565) {
_j112('system', '✅ Canvas size matches recording', {
Width: `${_j1564}px`,
Height: `${_j1565}px`
});
return false;
}
if (window.APP_MODE === 'collector') {
_j112('system', '⚠️ Canvas size mismatch in collector mode — continuing without reload', {
Current: `${width}x${height}`,
Target: `${_j1564}x${_j1565}`
});
return false;
}
_j112('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1564}x${_j1565}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1564.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1565.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j112('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1564}x${_j1565}`
});
window.location.reload();
return true;
}
let _j1519 = null;
function startVideoFrameCapture() {
if (_j630 || _j638) return;
if (recordingData.events.length === 0) {
_j112('system', '⚠️ No recording data for video capture', {
Status: 'Record or load a JSON first'
});
return;
}
const _j1049 = window._videoCaptureConfig || {};
_j1519 = {
frames: [],
skip: Math.max(1, Math.round(_j1049.frameSkip || 1)),
quality: _j1049.quality !== undefined ? _j1049.quality : 0.92,
maxFrames: _j1049.maxFrames || 10800,
frameCounter: 0,
maxFramesWarned: false,
capCanvas: null,
capCtx: null
};
window._videoFrameCaptureActive = true;
window.addEventListener('inkfield:playbackEnded', _j201, { once: true });
startPlayback();
loopToggle = 0;
const _j1520 = document.getElementById('loop-toggle');
if (_j1520) _j1520.checked = false;
window._fxVirtualTime = 0;
const btn = document.getElementById('record-video-btn');
if (btn) {
btn.classList.add('active');
btn.textContent = 'Capturing…';
}
_j181('🎞️ Start Video Frame Capture');
_j112('recording', '🎞️ Frame capture started', {
FPS: `${Math.round(60 / _j1519.skip)}`,
Quality: _j1519.quality,
MaxFrames: _j1519.maxFrames
});
}
function _j200() {
const st = _j1519;
if (!st || !_j638) return;
st.frameCounter++;
if ((st.frameCounter - 1) % st.skip !== 0) return;
if (st.frames.length >= st.maxFrames) {
if (!st.maxFramesWarned) {
st.maxFramesWarned = true;
console.warn(`[Record Video] maxFrames (${st.maxFrames}) reached — later frames are not captured. Raise window._videoCaptureConfig.maxFrames if needed.`);
}
return;
}
const src = document.getElementById('defaultCanvas0');
if (!src) return;
if (!st.capCanvas) {
st.capCanvas = document.createElement('canvas');
st.capCanvas.width = src.width;
st.capCanvas.height = src.height;
st.capCtx = st.capCanvas.getContext('2d');
}
st.capCtx.drawImage(src, 0, 0);
st.frames.push(new Promise((resolve) => st.capCanvas.toBlob(resolve, 'image/jpeg', st.quality)));
if (st.frames.length % 60 === 0) {
const btn = document.getElementById('record-video-btn');
if (btn) btn.textContent = `Capturing ${st.frames.length}f`;
}
}
async function _j201() {
const st = _j1519;
if (!st) return;
window._videoFrameCaptureActive = false;
if (!window._fxContext) window._fxVirtualTime = undefined;
const btn = document.getElementById('record-video-btn');
if (btn) btn.textContent = 'Zipping…';
try {
const _j1521 = [];
for (const p of st.frames) {
const b = await p;
if (b) _j1521.push(b);
}
if (_j1521.length === 0) {
_j112('system', '⚠️ No frames captured', { Status: 'Nothing to save' });
return;
}
const _j1522 = Math.round(60 / st.skip);
const _j1523 = [
'InkField frame sequence',
`frames: ${_j1521.length}`,
`fps: ${_j1522} (frameSkip=${st.skip})`,
`size: ${st.capCanvas ? st.capCanvas.width + 'x' + st.capCanvas.height : 'unknown'}`,
`engineVersion: ${(typeof window.__INKFIELD_ENGINE_VERSION__ === 'string') ? window.__INKFIELD_ENGINE_VERSION__ : 'dev'}`,
'',
'Assemble into a video with ffmpeg:',
`ffmpeg -framerate ${_j1522} -i frame_%05d.jpg -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4`,
''
].join('\n');
const files = _j1521.map((b, i) => ({
name: `frame_${String(i + 1).padStart(5, '0')}.jpg`,
blob: b
}));
files.push({ name: 'README.txt', blob: new Blob([_j1523], { type: 'text/plain' }) });
const _j1524 = await _j203(files);
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `inkfield-frames-${timestamp}-${_j1521.length}f.zip`;
const _j1192 = URL.createObjectURL(_j1524);
const a = document.createElement('a');
a.href = _j1192;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(_j1192), 10000);
_j181('🎞️ Video Frame Capture Complete');
_j112('recording', '🎞️ Frame sequence saved', {
File: filename,
Frames: _j1521.length,
Size: `${(_j1524.size / 1048576).toFixed(1)} MB`
});
} catch (e) {
console.error('[Record Video] zip failed:', e);
_j112('system', '❌ Frame capture zip failed', { Error: e.message });
} finally {
_j1519 = null;
if (btn) {
btn.classList.remove('active');
btn.textContent = 'Record Video';
}
}
}
let _j1525 = null;
function _j202(_j1566) {
if (!_j1525) {
_j1525 = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
let c = i;
for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
_j1525[i] = c;
}
}
let crc = 0xFFFFFFFF;
for (let i = 0; i < _j1566.length; i++) {
crc = _j1525[(crc ^ _j1566[i]) & 0xFF] ^ (crc >>> 8);
}
return (crc ^ 0xFFFFFFFF) >>> 0;
}
async function _j203(files) {
const _j1526 = new TextEncoder();
const now = new Date();
const _j1527 = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
const _j1528 = ((((now.getFullYear() - 1980) & 0x7F) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
const _j737 = [];
const _j1529 = [];
let offset = 0;
for (const f of files) {
const nameBytes = _j1526.encode(f.name);
const data = new Uint8Array(await f.blob.arrayBuffer());
const crc = _j202(data);
const size = data.length;
const lh = new DataView(new ArrayBuffer(30));
lh.setUint32(0, 0x04034B50, true);
lh.setUint16(4, 20, true);
lh.setUint16(6, 0, true);
lh.setUint16(8, 0, true);
lh.setUint16(10, _j1527, true);
lh.setUint16(12, _j1528, true);
lh.setUint32(14, crc, true);
lh.setUint32(18, size, true);
lh.setUint32(22, size, true);
lh.setUint16(26, nameBytes.length, true);
lh.setUint16(28, 0, true);
_j737.push(lh.buffer, nameBytes, f.blob);
_j1529.push({ nameBytes, crc, size, offset });
offset += 30 + nameBytes.length + size;
}
const _j1530 = offset;
let _j1531 = 0;
for (const e of _j1529) {
const cd = new DataView(new ArrayBuffer(46));
cd.setUint32(0, 0x02014B50, true);
cd.setUint16(4, 20, true);
cd.setUint16(6, 20, true);
cd.setUint16(8, 0, true);
cd.setUint16(10, 0, true);
cd.setUint16(12, _j1527, true);
cd.setUint16(14, _j1528, true);
cd.setUint32(16, e.crc, true);
cd.setUint32(20, e.size, true);
cd.setUint32(24, e.size, true);
cd.setUint16(28, e.nameBytes.length, true);
cd.setUint16(30, 0, true);
cd.setUint16(32, 0, true);
cd.setUint16(34, 0, true);
cd.setUint16(36, 0, true);
cd.setUint32(38, 0, true);
cd.setUint32(42, e.offset, true);
_j737.push(cd.buffer, e.nameBytes);
_j1531 += 46 + e.nameBytes.length;
}
const _j1532 = new DataView(new ArrayBuffer(22));
_j1532.setUint32(0, 0x06054B50, true);
_j1532.setUint16(4, 0, true);
_j1532.setUint16(6, 0, true);
_j1532.setUint16(8, _j1529.length, true);
_j1532.setUint16(10, _j1529.length, true);
_j1532.setUint32(12, _j1531, true);
_j1532.setUint32(16, _j1530, true);
_j1532.setUint16(20, 0, true);
_j737.push(_j1532.buffer);
return new Blob(_j737, { type: 'application/zip' });
}
window.startVideoFrameCapture = startVideoFrameCapture;
function _j1(_j1478, _j1479) {
var _j189 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1478];
var _j190 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1479];
if (_j189 && _j190 && typeof createShader === 'function') {
return createShader(_j189, _j190);
}
return window['loadShader'](_j1478, _j1479);
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
const _j191 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j191,
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
const _j192 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j192.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j192.forEach((_j623, _j300) => {
console.log(`[${_j623.count}] args: [${_j623.args.join(', ')}]`);
if (_j623.caller) {
console.log(`    位置: ${_j623.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j193 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j193 > 0 ? '+' : ''}${_j193}`);
console.log('═══════════════════════════════════════');
return _j193;
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
const _j194 = playback.totalCount - recording.totalCount;
const percent = ((_j194 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j194) < 50 ? '✅' : Math.abs(_j194) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j194 > 0 ? '+' : ''}${_j194} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j195 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j196 = Array.from(_j195).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j197 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j197 === -1) return 0;
if (indexA === -1) return 1;
if (_j197 === -1) return -1;
return indexA - _j197;
});
let _j198 = 0;
const _j199 = [];
for (const stage of _j196) {
const recCount = recDeltas.get(stage) || 0;
const _j200 = playDeltas.get(stage) || 0;
const _j193 = _j200 - recCount;
_j198 += _j193;
if (Math.abs(_j193) > 0) {
_j199.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j200,
difference: _j193
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j199.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j201 = _j199.filter(d => Math.abs(d.difference) > 50);
if (_j201.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j201.length); i++) {
const d = _j201[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j202 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j203 = checkpoints[i];
const _j204 = checkpoints[i + 1];
if (_j204) {
const _j205 = `${_j203.name} → ${_j204.name}`;
const _j206 = _j204.count - _j203.count;
_j202.set(_j205, _j206);
}
}
return _j202;
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
const _j207 = [{
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
const _j208 = {};
_j207.forEach(color => {
_j208[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j208;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j209 = r > 20;
const _j210 = g > 20;
const _j211 = b > 20;
if (_j209 && _j210 && _j211) return 'rgb';
if (_j209 && _j210) return 'rg';
if (_j209 && _j211) return 'rb';
if (_j210 && _j211) return 'gb';
if (_j209) return 'r';
if (_j210) return 'g';
if (_j211) return 'b';
return 'rgb';
}
function _j4() {
let _j212 = '// ============================================\n';
_j212 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j212 += '// ============================================\n';
_j207.forEach(color => {
const [r, g, b] = color.rgb;
const _j213 = `COLOR_${color.name.toUpperCase()}`;
_j212 += `const vec3 ${_j213} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j212 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j212;
}
function _j5() {
let _j212 = '';
_j207.forEach((color, _j300) => {
const _j213 = `COLOR_${color.name.toUpperCase()}`;
if (_j300 === 0) {
_j212 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j212 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j212 += `        brushColor = ${_j213};\n`;
});
_j212 += `    }\n`;
return _j212;
}
function _j6() {
return _j207.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j207.find(c => c.id === id);
}
function _j8(name) {
return _j207.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j207,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j214 = null;
let _j215 = 0;
const _j216 = 2000;
function _j9(_j512 = 120, _j1480 = 12, _j1481 = 10, _j1482 = 5) {
const _j217 = Math.min(width, _j216);
const _j218 = Math.min(height, _j216);
const _j219 = (width > _j216 || height > _j216);
randomSeed(seed);
const _j220 = _j10(_j512, _j1482);
const _j221 = createGraphics(_j217, _j218, P2D);
const _j222 = createGraphics(_j217, _j218, P2D);
for (let i = -_j512; i < _j217 + _j512; i += _j217 / 500) {
for (let j = -_j512; j < _j218 + _j512; j += _j1480) {
_j221.image(_j220, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1481);
}
}
_j220.remove();
if (doSpotNoise) {
padfactor = 300;
_j222.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j217)
y = random(_j218)
_j222.push()
_j222.strokeWeight(random(1, 2))
_j222.stroke(0, random(10, 250))
_j222.noFill();
_j222.bezier(
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j218 + padfactor),
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j218 + padfactor),
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j218 + padfactor),
random(-padfactor, _j217 + padfactor),
random(-padfactor, _j218 + padfactor)
);
_j222.pop();
}
_j221.blendMode(DIFFERENCE);
_j221.image(_j222, 0, 0, _j217, _j218);
_j222.remove();
}
if (_j219) {
const _j223 = createGraphics(width, height);
_j223.image(_j221, 0, 0, width, height);
_j221.remove();
return _j223;
}
return _j221;
}
function _j10(_j1483 = 64, _j1482 = 0.5) {
const _j220 = createGraphics(_j1483, _j1483);
_j220.pixelDensity(1);
_j220.noSmooth();
_j220.clear();
_j220.noFill();
_j220.translate(_j1483 / 2, _j1483 / 2);
_j220.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j224 = 0.5 + crandom.random(0, 1) * 0.5;
const _j225 = pow(_j224, _j1482) * 255;
_j220.stroke(_j225, _j225, _j225, 255);
const radius = crandom.random() * _j1483 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j220.point(x, y);
}
_j220.resetMatrix();
return _j220;
}
let _j226 = [];
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
const _j227 = 8;
const _j228 = [];
for (let i = 0; i < _j227; i++) {
_j228.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j229 = floor(_j228[0].numCirclesRand);
for (let i = 0; i < _j229; i++) {
const _j230 = _j228[i];
circles.push({
x: cos(_j230.angle) * _j230.distance,
y: sin(_j230.angle) * _j230.distance,
radius: _j230.circleSize
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
const _j231 = [];
const _j232 = 3;
const _j233 = 48;
const _j228 = [];
const _j234 = crandom.random(1, 4);
const _j235 = crandom.random(0.4, 0.6);
const _j236 = floor(_j234);
for (let _j237 = 0; _j237 < _j232; _j237++) {
const _j238 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j237 * 500
};
_j228.push(_j238);
}
for (let _j237 = 0; _j237 < _j236; _j237++) {
const _j238 = _j228[_j237];
const offsetX = _j238.offsetX;
const offsetY = _j238.offsetY;
const layerRotation = _j238.layerRotation;
const sizeVariation = _j238.sizeVariation;
const _j239 = size * sizeVariation;
const _j240 = floor(_j238.numVerticesRand);
const noiseOffset = _j238.noiseOffset;
const _j241 = [];
for (let i = 0; i < _j240; i++) {
const angle = (i / _j240) * TWO_PI;
const _j242 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j243 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j244 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j245 = _j242 * 0.5 + _j243 * 0.3 + _j244 * 0.2;
const radius = _j239 * (0.4 + _j245 * _j235);
const _j246 = cos(angle) * radius;
const _j247 = sin(angle) * radius;
_j241.push({
x: _j246,
y: _j247
});
}
const _j248 = [];
for (let i = 0; i < _j241.length; i++) {
const _j249 = _j241[(i - 1 + _j241.length) % _j241.length];
const _j250 = _j241[i];
const _j204 = _j241[(i + 1) % _j241.length];
_j248.push({
x: (_j249.x + _j250.x * 2 + _j204.x) / 4,
y: (_j249.y + _j250.y * 2 + _j204.y) / 4
});
}
for (let v of _j248) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j251 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j231.push({
x: rotatedX + offsetX,
y: _j251 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j231
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j231 = [];
const _j232 = 3;
const _j228 = [];
const _j234 = crandom.random(1, 4);
const _j235 = crandom.random(0.15, 0.35);
const _j236 = floor(_j234);
let rotation = crandom.random(TWO_PI);
for (let _j237 = 0; _j237 < _j232; _j237++) {
const _j238 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j237 * 500
};
_j228.push(_j238);
}
for (let _j237 = 0; _j237 < _j236; _j237++) {
const _j238 = _j228[_j237];
const offsetX = _j238.offsetX;
const offsetY = _j238.offsetY;
const layerRotation = rotation + _j238.layerRotationOffset;
const sizeVariation = _j238.sizeVariation;
const _j239 = size * sizeVariation;
const lengthRatio = _j238.lengthRatio;
const _j252 = _j239 * lengthRatio;
const stripWidth = _j239 * _j238.stripWidth;
const _j240 = floor(_j238.numVerticesRand);
const noiseOffset = _j238.noiseOffset;
const _j241 = [];
for (let i = 0; i < _j240; i++) {
let _j246, _j247;
if (i < _j240 / 2) {
const _j253 = (i / (_j240 / 2));
_j246 = (_j253 - 0.5) * _j252;
const _j254 = noise(_j253 * 1.5 + noiseOffset, _j237 * 50);
_j247 = -stripWidth / 2 + (_j254 - 0.5) * stripWidth * _j235;
} else {
const _j253 = ((_j240 - 1 - i) / (_j240 / 2));
_j246 = (_j253 - 0.5) * _j252;
const _j254 = noise(_j253 * 1.5 + noiseOffset, 100 + _j237 * 50);
_j247 = stripWidth / 2 + (_j254 - 0.5) * stripWidth * _j235;
}
_j241.push({
x: _j246,
y: _j247
});
}
const _j248 = [];
for (let i = 0; i < _j241.length; i++) {
const _j249 = _j241[(i - 1 + _j241.length) % _j241.length];
const _j250 = _j241[i];
const _j204 = _j241[(i + 1) % _j241.length];
_j248.push({
x: (_j249.x + _j250.x * 2 + _j204.x) / 4,
y: (_j249.y + _j250.y * 2 + _j204.y) / 4
});
}
for (let v of _j248) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j251 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j231.push({
x: rotatedX + offsetX,
y: _j251 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j231
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j231 = [];
const _j255 = 2;
const _j256 = 30;
const _j257 = 8;
const _j258 = 300;
const _j228 = [];
const _j259 = crandom.random(1, 3);
const _j260 = floor(_j259);
for (let _j261 = 0; _j261 < _j255; _j261++) {
const _j262 = {
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
for (let step = 0; step < _j256; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j262.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j258; i++) {
_j262.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j228.push(_j262);
}
for (let _j261 = 0; _j261 < _j260; _j261++) {
const _j262 = _j228[_j261];
let branchAngle = _j262.branchAngle;
let branchOffsetX = _j262.branchOffsetX;
let branchOffsetY = _j262.branchOffsetY;
let _j263 = _j262.numLRand > 0.2 ? 1 : 2;
let _j264 = floor(_j262.numStepsRand) * _j263;
let stepSize = _j262.stepSize;
let noiseScale = _j262.noiseScale;
let noiseStrength = _j262.noiseStrength;
let thickness = _j262.thickness;
let pathPoints = [];
let _j265 = branchOffsetX;
let _j266 = branchOffsetY;
let _j267 = branchAngle;
pathPoints.push({
x: _j265,
y: _j266
});
for (let step = 0; step < _j264; step++) {
const stepRandoms = _j262.stepRandoms[step];
const t = step / _j264;
const _j268 = noise(step * noiseScale, seed * 0.01);
const _j269 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j268 - 0.5) * PI * noiseStrength;
_j267 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j270 = stepSize * stepVariation;
_j265 += cos(_j267) * _j270;
_j266 += sin(_j267) * _j270;
pathPoints.push({
x: _j265,
y: _j266
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j264 - 3) {
const _j271 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j267 + stepRandoms.subBranchAngle;
let _j272 = _j265;
let _j273 = _j266;
for (let _j274 = 0; _j274 < _j271; _j274++) {
const _j275 = noise(step * noiseScale + _j274 * 0.5, seed * 0.01 + 200);
const _j276 = (_j275 - 0.5) * PI * 0.5;
const _j277 = subBranchAngle + _j276;
_j272 += cos(_j277) * stepSize * 0.6;
_j273 += sin(_j277) * stepSize * 0.6;
pathPoints.push({
x: _j272,
y: _j273
});
}
}
}
const _j278 = [];
const _j279 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j280;
if (i === 0) {
const _j204 = pathPoints[i + 1];
_j280 = atan2(_j204.y - point.y, _j204.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j249 = pathPoints[i - 1];
_j280 = atan2(point.y - _j249.y, point.x - _j249.x) + HALF_PI;
} else {
const _j249 = pathPoints[i - 1];
const _j204 = pathPoints[i + 1];
const _j281 = atan2(point.y - _j249.y, point.x - _j249.x);
const _j282 = atan2(_j204.y - point.y, _j204.x - point.x);
_j280 = ((_j281 + _j282) / 2) + HALF_PI;
}
const _j283 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j284 = _j262.thicknessRandoms[Math.min(i, _j262.thicknessRandoms.length - 1)];
const _j285 = thickness * _j283 * _j284;
_j278.push({
x: point.x + cos(_j280) * _j285 / 2,
y: point.y + sin(_j280) * _j285 / 2
});
_j279.push({
x: point.x - cos(_j280) * _j285 / 2,
y: point.y - sin(_j280) * _j285 / 2
});
}
for (let v of _j278) {
_j231.push(v);
}
for (let i = _j279.length - 1; i >= 0; i--) {
_j231.push(_j279[i]);
}
}
return {
type: 'lightning',
vertices: _j231
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j231 = [];
const _j255 = 3;
const _j256 = 75;
const _j257 = 8;
const _j258 = 800;
const _j228 = [];
const _j259 = crandom.random(1, 4);
const _j260 = floor(_j259);
size = size * 3;
for (let _j261 = 0; _j261 < _j255; _j261++) {
const _j262 = {
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
for (let step = 0; step < _j256; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j262.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j258; i++) {
_j262.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j228.push(_j262);
}
for (let _j261 = 0; _j261 < _j260; _j261++) {
const _j262 = _j228[_j261];
let branchAngle = _j262.branchAngle;
let branchOffsetX = _j262.branchOffsetX;
let branchOffsetY = _j262.branchOffsetY;
let _j263 = _j262.numLRand > 0.2 ? 1 : 5;
let _j264 = floor(_j262.numStepsRand) * _j263;
let stepSize = _j262.stepSize;
let noiseScale = _j262.noiseScale;
let noiseStrength = _j262.noiseStrength;
let thickness = _j262.thickness;
let pathPoints = [];
let _j265 = branchOffsetX;
let _j266 = branchOffsetY;
let _j267 = branchAngle;
pathPoints.push({
x: _j265,
y: _j266
});
for (let step = 0; step < _j264; step++) {
const stepRandoms = _j262.stepRandoms[step];
const t = step / _j264;
const _j268 = noise(step * noiseScale, seed * 0.01);
const _j269 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j268 - 0.5) * PI * noiseStrength;
_j267 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j270 = stepSize * stepVariation;
_j265 += cos(_j267) * _j270;
_j266 += sin(_j267) * _j270;
pathPoints.push({
x: _j265,
y: _j266
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j264 - 3) {
const _j271 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j267 + stepRandoms.subBranchAngle;
let _j272 = _j265;
let _j273 = _j266;
for (let _j274 = 0; _j274 < _j271; _j274++) {
const _j275 = noise(step * noiseScale + _j274 * 0.5, seed * 0.01 + 200);
const _j276 = (_j275 - 0.5) * PI * 0.5;
const _j277 = subBranchAngle + _j276;
_j272 += cos(_j277) * stepSize * 0.6;
_j273 += sin(_j277) * stepSize * 0.6;
pathPoints.push({
x: _j272,
y: _j273
});
}
}
}
const _j278 = [];
const _j279 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j280;
if (i === 0) {
const _j204 = pathPoints[i + 1];
_j280 = atan2(_j204.y - point.y, _j204.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j249 = pathPoints[i - 1];
_j280 = atan2(point.y - _j249.y, point.x - _j249.x) + HALF_PI;
} else {
const _j249 = pathPoints[i - 1];
const _j204 = pathPoints[i + 1];
const _j281 = atan2(point.y - _j249.y, point.x - _j249.x);
const _j282 = atan2(_j204.y - point.y, _j204.x - point.x);
_j280 = ((_j281 + _j282) / 2) + HALF_PI;
}
const _j283 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j284 = _j262.thicknessRandoms[Math.min(i, _j262.thicknessRandoms.length - 1)];
const _j285 = thickness * _j283 * _j284;
_j278.push({
x: point.x + cos(_j280) * _j285 / 2,
y: point.y + sin(_j280) * _j285 / 2
});
_j279.push({
x: point.x - cos(_j280) * _j285 / 2,
y: point.y - sin(_j280) * _j285 / 2
});
}
for (let v of _j278) {
_j231.push(v);
}
for (let i = _j279.length - 1; i >= 0; i--) {
_j231.push(_j279[i]);
}
}
return {
type: 'lightning',
vertices: _j231
};
}
function _j17(_j1484, shapeData, px, py, r, g, b, alpha) {
_j1484.fill(r, g, b, alpha);
_j1484.noStroke();
const scale = 1 / _j493;
switch (shapeData.type) {
case 'polygon':
case 'blob':
case 'jagged':
case 'strip':
case 'lightning':
_j1484.beginShape();
for (let v of shapeData.vertices) {
_j1484.vertex(px + v.x * scale, py + v.y * scale);
}
_j1484.endShape(CLOSE);
break;
case 'cluster':
for (let circle of shapeData.circles) {
_j1484.ellipse(
px + circle.x * scale,
py + circle.y * scale,
circle.radius * 2 * scale,
circle.radius * 2 * scale
);
}
break;
}
}
function _j18(_j1485 = null, scanBounds = null, shapeType = null, _j1486 = null) {
let _j286 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j286 = crandom.getCount();
}
const w = _j1485 ? _j1485.width : width;
const h = _j1485 ? _j1485.height : height;
const d = _j1485 ? _j1485.pixelDensity() : pixelDensity();
const _j287 = 20;
const _j288 = 700;
const _j289 = 80;
let _j290 = canvasBackgroundColor[0];
let _j291 = canvasBackgroundColor[1];
let _j292 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j293 = _j1486 && _j1486.length > 0;
if (_j293) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1486.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j294 = _j1485 || window;
_j294.loadPixels();
pixels = _j1485 ? _j1485.pixels : window.pixels;
let _j295 = [];
const step = 4;
let _j296 = _j287;
let _j297 = w - _j287;
let _j298 = _j287;
let _j299 = h - _j287;
for (let y = _j298; y < _j299; y += step) {
for (let x = _j296; x < _j297; x += step) {
let _j300 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j300];
let g = pixels[_j300 + 1];
let b = pixels[_j300 + 2];
let a = pixels[_j300 + 3];
let brightness = r + g + b;
let _j301 = Math.abs(r - _j290) + Math.abs(g - _j291) + Math.abs(b - _j292);
if (a > 100 && brightness < _j288 && _j301 > _j289) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j295.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j295.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j295.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j295.sort((a, b) => a.brightness - b.brightness);
if (_j295.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j295.length} 個），無法生成蟲咬效果`);
return;
}
let _j302 = [];
for (let i = 0; i < _j295.length; i++) {
_j302.push(i);
}
const _j303 = Math.floor(_j295.length * 0.5);
const _j304 = _j302.slice(0, Math.max(_j303, 10));
for (let i = 0; i < 10 && _j304.length > 0; i++) {
const _j305 = [];
let _j306 = 0;
for (let j = 0; j < _j304.length; j++) {
const _j307 = Math.pow(1 - (j / _j304.length), 2);
_j305.push(_j307);
_j306 += _j307;
}
let _j308 = crandom.random(0, _j306);
let _j309 = 0;
let _j310 = 0;
for (let j = 0; j < _j305.length; j++) {
_j310 += _j305[j];
if (_j308 <= _j310) {
_j309 = j;
break;
}
}
const _j311 = _j304.splice(_j309, 1)[0];
targetPoints.push(_j295[_j311]);
}
if (typeof _j616 !== 'undefined' && _j616 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j312 = [];
const _j313 = 30;
const _j314 = 4;
let _j315 = 0;
const _j316 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j317 = [];
const _j228 = [];
const _j318 = [];
for (let _j319 = 0; _j319 < numBites; _j319++) {
const _j320 = [];
for (let _j321 = 0; _j321 < _j316; _j321++) {
_j320.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j228.push(_j320);
_j318.push({
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
let _j322 = 0;
let _j323 = false;
let _j324, _j325, distance;
const _j320 = _j228[i];
const _j326 = _j318[i];
if (_j293) {
const _j230 = _j320[0];
let r = sqrt(_j230.r) * _j313;
let angle = _j230.angle + _j230.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j324 = Math.floor(target.x + offsetX);
_j325 = Math.floor(target.y + offsetY);
_j324 = constrain(_j324, _j287, w - _j287);
_j325 = constrain(_j325, _j287, h - _j287);
_j323 = true;
for (let _j327 of _j317) {
let dist = Math.sqrt(
Math.pow(_j324 - _j327.x, 2) +
Math.pow(_j325 - _j327.y, 2)
);
if (dist < _j314) {
_j323 = false;
break;
}
}
} else {
while (!_j323 && _j322 < _j316) {
const _j230 = _j320[_j322];
let r = sqrt(_j230.r) * _j313;
let angle = _j230.angle;
angle += _j230.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j324 = Math.floor(target.x + offsetX);
_j325 = Math.floor(target.y + offsetY);
_j324 = constrain(_j324, _j287, w - _j287);
_j325 = constrain(_j325, _j287, h - _j287);
let _j311 = 4 * ((_j325 * d) * (w * d) + (_j324 * d));
let _j328 = pixels[_j311];
let _j329 = pixels[_j311 + 1];
let _j330 = pixels[_j311 + 2];
let _j331 = pixels[_j311 + 3];
let _j332 = _j328 + _j329 + _j330;
let _j333 = Math.abs(_j328 - _j290) + Math.abs(_j329 - _j291) + Math.abs(_j330 - _j292);
if (_j331 <= 100 || _j332 >= _j288 || _j333 <= _j289) {
_j323 = false;
_j322++;
if (_j322 >= _j316) {
_j315++;
}
continue;
}
_j323 = true;
for (let _j327 of _j317) {
let dist = Math.sqrt(
Math.pow(_j324 - _j327.x, 2) +
Math.pow(_j325 - _j327.y, 2)
);
if (dist < _j314) {
_j323 = false;
break;
}
}
_j322++;
}
}
let _j334 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j334 *= 1.3;
}
let _j335 = floor(target.x * 1000 + target.y * 333 + _j326.shapeSeedRand);
let _j336 = 0;
let _j337 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j336 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j334, _j335, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j337 = crandom.getCount();
if (!_j326.shapeRandomCount) {
_j326.shapeRandomCount = _j337 - _j336;
}
}
if (_j323) {
let r, g, b;
let _j338 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j338[0] < 0.2 && _j338[1] < 0.15 && _j338[2] < 0.1) {
r = Math.floor(38 + _j326.colorRand1 * (51 - 38));
g = Math.floor(31 + _j326.colorRand2 * (38 - 31));
b = Math.floor(20 + _j326.colorRand3 * (26 - 20));
} else {
r = 230 + _j326.colorRand1 * (255 - 230);
g = 160 + _j326.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j324,
y: _j325,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j334,
shapeData: shapeData
};
_j317.push(point);
_j312.push(point);
}
}
}
_j226 = _j226.concat(_j312);
let _j339 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j312) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j339++;
let _j340 = point.size || 2.5;
let _j341 = map(_j340, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j341
});
}
let _j342 = boidSpawners.slice(-_j339);
if (_j339 > 0) {
let sizeMultipliers = _j342.map(s => s.boidSizeMultiplier);
let _j343 = Math.min(...sizeMultipliers);
let _j344 = Math.max(...sizeMultipliers);
let _j345 = (_j339 / _j312.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j339} 個 Boid Spawners (虫咬點的 ${_j345}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j343.toFixed(2)} ~ ${_j344.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j312.length > 0) {
let _j346 = Infinity;
let _j347 = 0;
for (let point of _j312) {
let brightness = point.r + point.g + point.b;
_j346 = Math.min(_j346, brightness);
_j347 = Math.max(_j347, brightness);
}
if (_j315 > 0) {
console.log(`⚠️ 跳過了 ${_j315} 個不在筆墨區域的點`);
}
}
const _j348 = _j312.length;
if (_j348 > 0) {
_j110('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j348,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j349 = crandom.getCount();
const _j350 = _j349 - _j286;
if (typeof _j624 !== 'undefined' && _j624 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j351 = currentScanEvent.recordedRandomCount;
const _j193 = _j350 - _j351;
const percent = _j351 > 0 ? ((_j193 / _j351) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j193) < 50 ? '✅' : Math.abs(_j193) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j352 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j353 = typeof _j348 === 'number' ? ` | Points:${_j348}` : '';
console.log(`${icon} Scan [${action}] ${_j352} | 差異: ${_j193 > 0 ? '+' : ''}${_j193} (${percent})${_j353}`);
}
} else if (typeof _j616 !== 'undefined' && _j616) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j350;
}
}
}
}
function _j19(_j1487 = 10, shapeType = null) {
const _j287 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1487; i++) {
let x = crandom.random(_j287, w - _j287);
let y = crandom.random(_j287, h - _j287);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j312 = [];
const _j313 = 30;
const _j314 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j317 = [];
for (let i = 0; i < numBites; i++) {
let _j322 = 0;
let _j323 = false;
let _j324, _j325, distance;
while (!_j323 && _j322 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j313;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j324 = Math.floor(target.x + offsetX);
_j325 = Math.floor(target.y + offsetY);
_j324 = constrain(_j324, _j287, w - _j287);
_j325 = constrain(_j325, _j287, h - _j287);
_j323 = true;
for (let _j327 of _j317) {
let dist = Math.sqrt(
Math.pow(_j324 - _j327.x, 2) +
Math.pow(_j325 - _j327.y, 2)
);
if (dist < _j314) {
_j323 = false;
break;
}
}
_j322++;
}
if (_j323) {
let r, g, b;
let _j338 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j338[0] < 0.2 && _j338[1] < 0.15 && _j338[2] < 0.1) {
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
let _j335 = floor(_j324 * 1000 + _j325 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j324, _j325, size, _j335, shapeType);
let point = {
x: _j324,
y: _j325,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j317.push(point);
_j312.push(point);
}
}
}
_j226 = _j226.concat(_j312);
let _j339 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j312) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j339++;
let _j340 = point.size || 2.5;
let _j341 = map(_j340, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j341
});
}
}
if (_j312.length > 0) {
_j110('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j312.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1488 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j493);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j493);
}
const _j354 = _j1488 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j226.length;
if (!_j354) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j226) {
const px = point.x;
const py = point.y;
const _j355 = (point.size || 5) / _j493;
const _j356 = point.x / width;
const _j357 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j356 * 255, _j357 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j356 * 255, _j357 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j355, _j355);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j355, _j355);
}
}
const _j358 = {
pointCount: _j226.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j358;
window.bugsMaskTextureCache = _j358;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j294, _j1485) {
if (_j226.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j359 = _j20();
let _j360 = _j359.dataTexture;
let _j361 = _j359.maskTexture;
_j294.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1485);
window.metallicProgram.setUniform('bugsMask', _j361);
window.metallicProgram.setUniform('bugsData', _j360);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j493, height * _j493]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j362 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j363 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j364 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j365 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j366 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j362);
window.metallicProgram.setUniform('lightPos', [_j365, _j366]);
window.metallicProgram.setUniform('specularPower', _j363);
window.metallicProgram.setUniform('fresnelStrength', _j364);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j294.end();
}
let _j367 = null;
let __lastGridParams = null;
function _j22(x1, y1, x2, y2, _j1489, _j1490) {
const d = dist(x1, y1, x2, y2);
if (d < 1) return;
const dx = (x2 - x1) / d, dy = (y2 - y1) / d;
let pos = 0, draw = true;
while (pos < d) {
const _j368 = draw ? _j1489 : _j1490;
const end = Math.min(pos + _j368, d);
if (draw) line(x1 + dx * pos, y1 + dy * pos, x1 + dx * end, y1 + dy * end);
pos = end;
draw = !draw;
}
}
function gridCommitPrev() {
if (__lastGridParams) {
_j367 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j23(cx, cy, _j487, _j488) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j487 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j562 !== 'undefined' && _j562 !== null) {
if (_j562.minX < minX) minX = _j562.minX;
if (_j562.maxX > maxX) maxX = _j562.maxX;
if (_j562.minY < minY) minY = _j562.minY;
if (_j562.maxY > maxY) maxY = _j562.maxY;
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
const _j369 = effCell * 0.3;
const _j370 = (maxX - minX) + _j369 * 2;
const _j371 = (maxY - minY) + _j369 * 2;
const _j372 = (minX + maxX) * 0.5;
const _j373 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j369) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j369) / effCell) * effCell);
const _j374 = Math.min(width, Math.ceil((maxX + _j369) / effCell) * effCell);
const _j375 = Math.min(height, Math.ceil((maxY + _j369) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j374 - left);
let gridHeight = Math.max(effCell * 2, _j375 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j367 && typeof _j624 !== 'undefined' && _j624) {
const pg = _j367;
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
if (_j488) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j488) {
const _j376 = 12;
const _j377 = left + 8;
const _j378 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j377 - _j376 / 2, _j378, _j377 + _j376 / 2, _j378);
line(_j377, _j378 - _j376 / 2, _j377, _j378 + _j376 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j488) {
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
const _j379 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j380 = typeof _j557 === 'number' ? _j557 : 0;
const _j381 = typeof brushDir === 'number' ? brushDir : 0;
const _j382 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j383 = _j382[_j381] || '?';
const countdownText = `Max: ${_j379} | Count: ${_j380} | Dir: ${_j381}(${_j383})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j384 = typeof _j558 === 'number' ? _j558 : 0;
const _j385 = typeof brushMode === 'number' ? brushMode : 0;
const _j386 = (typeof _j518 === 'number' && _j518 > 0) ? _j518 : (typeof _j534 === 'number' ? _j534 : effCell);
const _j387 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j388 = `C: ${_j384} | B: ${_j385} | S: ${_j386.toFixed(1)} | P: ${_j387}`;
const _j389 = left;
const _j390 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j388, _j389, _j390);
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
function _j24(_j1484) {
const _j391 = typeof _j1484.begin === 'function';
if (_j391) _j1484.begin();
const g = _j391 ? window : _j1484;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j392 = 5;
const _j393 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j896 = true;
_j871 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j394 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j394;
let dy = (y2 - y1) / _j394;
let _j395 = 0;
while (_j395 < _j394) {
let _j396 = _j896 ? _j392 : _j393;
let _j397 = min(_j396 - _j871, _j394 - _j395);
if (_j896) {
let startX = x1 + dx * _j395;
let startY = y1 + dy * _j395;
let _j398 = x1 + dx * (_j395 + _j397);
let _j399 = y1 + dy * (_j395 + _j397);
g.line(startX, startY, _j398, _j399);
}
_j395 += _j397;
_j871 += _j397;
if (_j871 >= (_j896 ? _j392 : _j393)) {
_j896 = !_j896;
_j871 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j400 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j400.x, _j400.y, 10, 10);
}
g.pop();
if (_j391) _j1484.end();
}
function _j25() {
const _j401 = 10;
if (typeof _j542 !== 'undefined' && _j542 && typeof _j546 !== 'undefined' && _j546) {
noFill();
stroke(0, 180, 0, 180);
strokeWeight(1.5);
if (_j546.action === 'rect') {
const _j402 = _j546.x1 + _j401, _j403 = _j546.y1 + _j401;
const _j404 = _j546.x2 + _j401, _j405 = _j546.y2 + _j401;
_j22(_j402, _j403, _j404, _j403, 6, 4);
_j22(_j404, _j403, _j404, _j405, 6, 4);
_j22(_j404, _j405, _j402, _j405, 6, 4);
_j22(_j402, _j405, _j402, _j403, 6, 4);
} else if (_j546.action === 'polygon' && _j546.points && _j546.points.length >= 3) {
const _j406 = _j546.points;
for (let i = 0; i < _j406.length; i++) {
const a = _j406[i], b = _j406[(i + 1) % _j406.length];
_j22(a.x + _j401, a.y + _j401, b.x + _j401, b.y + _j401, 6, 4);
}
}
fill(0, 180, 0, 200);
noStroke();
if (typeof font !== 'undefined' && font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
const _j407 = (_j546.action === 'rect' ? _j546.x1 : (_j546.points ? _j546.points[0].x : 0)) + _j401;
const _j408 = (_j546.action === 'rect' ? _j546.y1 - 12 : (_j546.points ? _j546.points[0].y - 12 : 0)) + _j401;
text('MASK', _j407, _j408);
}
if (typeof _j541 !== 'undefined' && _j541 && typeof _j543 !== 'undefined' && _j543 === 'rect' &&
typeof _j544 !== 'undefined' && _j544 && _j544.x1 !== undefined && mouseIsPressed) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
const _j409 = Math.min(_j544.x1, mouseX - 10) + _j401;
const _j410 = Math.min(_j544.y1, mouseY - 10) + _j401;
const _j411 = Math.max(_j544.x1, mouseX - 10) + _j401;
const _j412 = Math.max(_j544.y1, mouseY - 10) + _j401;
_j22(_j409, _j410, _j411, _j410, 4, 3);
_j22(_j411, _j410, _j411, _j412, 4, 3);
_j22(_j411, _j412, _j409, _j412, 4, 3);
_j22(_j409, _j412, _j409, _j410, 4, 3);
}
if (typeof _j541 !== 'undefined' && _j541 && typeof _j543 !== 'undefined' && _j543 === 'polygon' &&
typeof _j545 !== 'undefined' && _j545.length > 0) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
for (let i = 0; i < _j545.length - 1; i++) {
const a = _j545[i], b = _j545[i + 1];
_j22(a.x + _j401, a.y + _j401, b.x + _j401, b.y + _j401, 4, 3);
}
noStroke();
fill(0, 200, 0, 150);
for (let p of _j545) {
ellipse(p.x + _j401, p.y + _j401, 6, 6);
}
}
}
function _j26() {
if ((!_j624 || isWaitingToLoop) && _j638 !== null && doMoving) {
const _j413 = easycamInitialCenter || [0, 0, 0];
const _j414 = PI / 3;
const _j415 = height / (2 * tan(_j414 / 2));
const _j416 = easycamInitialDistance > 0 ? easycamInitialDistance : _j415;
const _j417 = _j638.getCenter();
const _j418 = _j638.getDistance();
const _j419 = 0.1;
const _j420 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j417[0] - _j413[0], 2) +
Math.pow(_j417[1] - _j413[1], 2) +
Math.pow(_j417[2] - _j413[2], 2)
);
const distanceDiff = Math.abs(_j418 - _j416);
if (!_j651 && (centerDiff > _j419 || distanceDiff > _j420)) {
_j651 = true;
_j652 = millis();
_j649 = [_j417[0], _j417[1], _j417[2]];
_j653 = _j418;
_j650 = _j413;
_j654 = _j416;
}
if (_j651) {
const _j421 = millis() - _j652;
const _j422 = Math.min(_j421 / _j655, 1.0);
const _j423 = [
lerp(_j649[0], _j650[0], _j422),
lerp(_j649[1], _j650[1], _j422),
lerp(_j649[2], _j650[2], _j422)
];
const _j424 = lerp(_j653, _j654, _j422);
_j638.setCenter(_j423, 0);
_j638.setDistance(_j424, 0);
if (_j422 >= 1.0) {
const _j425 = _j638.getCenter();
const _j426 = _j638.getDistance();
const _j427 = Math.sqrt(
Math.pow(_j425[0] - _j413[0], 2) +
Math.pow(_j425[1] - _j413[1], 2) +
Math.pow(_j425[2] - _j413[2], 2)
);
const _j428 = Math.abs(_j426 - _j416);
if (_j427 > _j419 || _j428 > _j420) {
_j638.setCenter(_j413, 0);
_j638.setDistance(_j416, 0);
}
_j651 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j624 && !isWaitingToLoop && doMoving && _j639 && _j638 !== null && _j640 && !_j651) {
const _j429 = _j628;
const _j430 = _j629;
const _j431 = _j429 - hw;
const _j432 = -(_j430 - hh);
const _j417 = _j638.getCenter();
const _j265 = _j417[0];
const _j266 = _j417[1];
const _j418 = _j638.getDistance();
const _j414 = PI / 3;
const _j433 = height / (2 * tan(_j414 / 2));
const _j434 = 1.1;
let _j435 = 1.4;
const _j314 = _j433 / _j435;
const _j436 = _j433 / _j434;
const _j437 = _j433 / _j418;
const _j438 = 0.01;
if (_j646) {
const _j439 = _j435;
const _j440 = _j433 / _j439;
const distanceDiff = _j440 - _j418;
const _j441 = _j642;
const _j442 = _j418 + distanceDiff * _j441;
const _j443 = constrain(_j442, _j314, _j436);
_j638.setDistance(_j443, 0);
} else {
const _j440 = _j433 / _j434;
const distanceDiff = _j440 - _j418;
const _j441 = _j642;
const _j442 = _j418 + distanceDiff * _j441;
const _j443 = constrain(_j442, _j314, _j436);
_j638.setDistance(_j443, 0);
}
const _j444 = _j638.getDistance();
const _j445 = _j433 / _j444;
let _j446 = 0;
let _j447 = 0;
if (_j445 > _j434) {
_j446 = (_j445 - _j434) * (width / 2);
_j447 = (_j445 - _j434) * (height / 2);
}
let offsetX = _j431 - _j265;
let offsetY = _j432 - _j266;
if (_j446 > 0 || _j447 > 0) {
const _j448 = constrain(_j431, -_j446, _j446);
const _j449 = constrain(_j432, -_j447, _j447);
offsetX = _j448 - _j265;
offsetY = _j449 - _j266;
} else {
offsetX = -_j265;
offsetY = -_j266;
}
const _j450 = _j641;
const _j324 = _j265 + offsetX * _j450;
const _j325 = _j266 + offsetY * _j450;
let _j451 = _j324;
let _j452 = _j325;
if (_j446 > 0 || _j447 > 0) {
_j451 = constrain(_j324, -_j446, _j446);
_j452 = constrain(_j325, -_j447, _j447);
} else {
_j451 = 0;
_j452 = 0;
}
_j638.setCenter([_j451, _j452, 0], 0);
}
}
function _j27() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j639 = false;
return;
}
if (_j638 !== null) {
_j639 = true;
return;
}
try {
const _j453 = _renderer;
if (!_j453) {
console.error('❌ WEBGL renderer not found');
_j639 = false;
return;
}
const _j414 = PI / 3;
const _j433 = height / (2 * tan(_j414 / 2));
_j638 = new Dw.EasyCam(_j453, {
distance: _j433,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j638.setRotationConstraint(0, 0, 0);
_j638.setRotationScale(0);
_j647 = _j433 / 2.5;
_j648 = _j433 / 1.0;
_j638.setDistanceMin(_j647);
_j638.setDistanceMax(_j648);
document.oncontextmenu = function() {
return false;
};
_j639 = true;
_j110('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j639 = false;
_j638 = null;
}
}
function applyCameraProjection() {
const _j454 = doMoving && _j639 && _j638 !== null && _j624 && _j640;
if (_j454) {
const _j455 = PI / 3;
const _j456 = 0.1;
const _j457 = 10000;
perspective(_j455, width / height, _j456, _j457);
push();
} else {
const _j458 = PI / 3;
const _j459 = 0.1;
const _j460 = 10000;
perspective(_j458, width / height, _j459, _j460);
}
}
let _j461 = null;
let _j462 = null;
let _j463 = 0,
_j464 = 0,
_j465 = 0;
let _j466 = {
feedback: {},
composite: {},
realtime: {}
};
function _j28(_j1491, _j1492, name, value) {
const _j467 = _j466[_j1492];
if (_j467[name] === value) return;
_j467[name] = value;
_j1491.setUniform(name, value);
}
function _j29() {
if (_j463 !== width || _j464 !== height || _j465 !== _j493) {
_j461 = [0, 0, width * _j493, height * _j493];
_j462 = [1.0 / (width * _j493), 1.0 / (height * _j493)];
_j463 = width;
_j464 = height;
_j465 = _j493;
}
if (_j461 === null) {
_j461 = [0, 0, width * _j493, height * _j493];
_j462 = [1.0 / (width * _j493), 1.0 / (height * _j493)];
}
}
function _j30(_j1484, _j1493 = 1.0) {
if (_j580) {
_j554 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
_j609.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j496);
const _j468 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j496.setUniform("rect", _j461);
_j496.setUniform("invResolution", _j462);
_j496.setUniform("tex0", _j1484);
_j28(_j496, 'feedback', "brushMode", brushMode * 1.0);
_j496.setUniform("forceMap", _j494);
_j28(_j496, 'feedback', "baseBrushSize", baseBrushSize);
_j496.setUniform("force", _j1493);
_j28(_j496, 'feedback', "useSharpen", useSharpen);
_j28(_j496, 'feedback', "effect3Brightness", effect3Brightness);
_j28(_j496, 'feedback', "indiffusionStrength", indiffusionStrength);
_j28(_j496, 'feedback', "brushColorMode", float(brushColorMode));
_j28(_j496, 'feedback', "brushCategory", _j468);
const _j469 = typeof _j560 !== 'undefined' ? _j560 : 0;
const _j470 = (_j558 + _j469) % 40;
const _j471 = _j558 + _j469;
_j496.setUniform("mouseCount", float(_j470));
_j496.setUniform("mouseCountAccumulated", float(_j471));
_j496.setUniform("strokeSeed", float(strokeSeed));
_j496.setUniform("useMask", _j542 ? 1.0 : 0.0);
if (_j542) _j496.setUniform("maskTex", _j540);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j609.end();
_j1484.begin();
imageMode(CENTER);
blendMode(BLEND);
image(_j609, 0, 0, width, height);
_j1484.end();
_j554 = true;
}
function _j31() {
if (typeof _j611 === 'undefined' || !_j611) {
return;
}
const _j472 = canvasBackgroundColor;
let _j473 = _j9(40, 20, 15, 0.2);
const _j474 = min(255, _j472[0] * 1.1);
const _j475 = min(255, _j472[1] * 1.1);
const _j476 = min(255, _j472[2] * 1.1);
_j611.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j474, _j475, _j476);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j473, -width / 2, -height / 2, width, height);
_j611.end();
_j473.remove();
}
function _j32() {
const _j472 = canvasBackgroundColor;
if (typeof _j612 !== 'undefined' && _j612) {
_j612.begin();
background(_j472[0], _j472[1], _j472[2]);
_j612.end();
}
_j31();
if (typeof _j554 !== 'undefined') {
_j554 = true;
}
}
function updateCompositeBuffer() {
const _j477 = _j554 || _j535 || _j536 || _j624 || _j667;
if (_j477) {
_j608.begin();
clear();
shader(_j499);
_j29();
_j499.setUniform("rect", _j461);
_j499.setUniform("baseTex", showPaperTexture ? _j611 : _j612);
_j499.setUniform("encodedTex", _j604);
_j499.setUniform("typeMapTex", _j615);
_j499.setUniform("oldTex", _j602);
_j28(_j499, 'composite', "brushColorMode", float(brushColorMode));
_j28(_j499, 'composite', "whiteMaxOpacity", _j504);
_j28(_j499, 'composite', "hueShift", _j505);
_j28(_j499, 'composite', "satShift", _j506);
_j28(_j499, 'composite', "briShift", _j507);
_j28(_j499, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j28(_j499, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j608.end();
if (_j535 || _j536) {
_j613.begin();
clear();
imageMode(CENTER);
image(_j608, 0, 0, width, height);
_j613.end();
_j608.begin();
shader(_j497);
const _j478 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j497.setUniform("rect", _j461);
_j497.setUniform("baseTex", _j613);
_j497.setUniform("addTex", _j605);
_j497.setUniform("encodedTex", _j604);
_j28(_j497, 'realtime', "brushColorMode", float(brushColorMode));
_j28(_j497, 'realtime', "whiteMaxOpacity", _j504);
_j28(_j497, 'realtime', "hueShift", _j505);
_j28(_j497, 'realtime', "satShift", _j506);
_j28(_j497, 'realtime', "briShift", _j507);
_j28(_j497, 'realtime', "brushCategory", _j478);
_j28(_j497, 'realtime', "useSharpen", useSharpen);
let _j479;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j479 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j208[brushColorMode] || _j208[0];
_j479 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j497.setUniform("brushColor", _j479);
_j497.setUniform("useMask", _j542 ? 1.0 : 0.0);
if (_j542) _j497.setUniform("maskTex", _j540);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j608.end();
}
_j554 = _j535 || _j536 || _j624 || _j667;
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
const _j480 = (_j535 || _j536) && _j557 < maxUpdates && _j563;
const _j481 = !_j624 || showFuturePathPreview;
const _j482 = _j480 && showGridOverlay;
const _j483 = (typeof _j542 !== 'undefined' && _j542) ||
(typeof _j541 !== 'undefined' && _j541);
if (_j480 || _j483) {
_j610.begin();
clear();
push();
translate(-hw, -hh);
const _j484 = -10;
translate(_j484, _j484);
if (_j482) {
const _j485 = _j624 ? _j628 : _j530;
const _j486 = _j624 ? _j629 : _j531;
const cx = (_j532 || _j532 === 0) ? _j532 : _j485;
const cy = (_j533 || _j533 === 0) ? _j533 : _j486;
const _j487 = _j534;
const _j488 = typeof _j581 !== 'undefined' && _j581;
_j23(cx, cy, _j487, _j488);
} else if (_j483) {
_j25();
}
if (pathPoints.length > 1 && _j481) {
const _j392 = 5;
const _j393 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j896 = true;
_j871 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j394 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j394;
let dy = (y2 - y1) / _j394;
let _j395 = 0;
while (_j395 < _j394) {
let _j396 = _j896 ? _j392 : _j393;
let _j397 = min(_j396 - _j871, _j394 - _j395);
if (_j896) {
let startX = x1 + dx * _j395;
let startY = y1 + dy * _j395;
let _j398 = x1 + dx * (_j395 + _j397);
let _j399 = y1 + dy * (_j395 + _j397);
line(startX, startY, _j398, _j399);
}
_j395 += _j397;
_j871 += _j397;
if (_j871 >= (_j896 ? _j392 : _j393)) {
_j896 = !_j896;
_j871 = 0;
}
}
}
}
if (_j481 && _j480) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j489 = _j624 ? _j628 : _j530;
const _j490 = _j624 ? _j629 : _j531;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j489, _j490, 10, 10);
}
pop();
_j610.end();
}
}
let _j491 = window._demoCanvasWidth || 900,
_j492 = window._demoCanvasHeight || 900,
hw, hh, _j493 = 1.6;
let _j494, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j495, _j496, _j497, _j498, _j499, _j500;
let _j501;
let _j502;
const _j208 = _j2();
let colorIndex = 0,
_j503 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j504 = 0.95;
let _j505 = 0.0,
_j506 = 0.0,
_j507 = 0.0;
let customBrushColor = [26, 26, 26];
let _j508, _j509, _j510, _j511, _j512;
let _j513, _j514, _j515, _j516, _j517, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j518 = 0,
_j519 = 2,
_j520 = 0;
let brushMode = 1,
_j521 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j522 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j523 = [];
let x, y, _j431, _j432, _j524, _j525, _j526, _j527 = 0,
_j528 = 0;
let _j529;
let _j530 = 0,
_j531 = 0,
_j532 = 0,
_j533 = 0,
_j534 = 20;
let _j535 = false,
_j536 = false,
_j537 = false,
_j538 = false;
let _j539 = true;
let useSpectralMix = false;
let _j540;
let _j541 = false;
window.resetBrushPositionToMouse = function() {
if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') return;
const px = _j177(mouseX);
const py = _j177(mouseY);
_j530 = px;
_j531 = py;
_j532 = px;
_j533 = py;
_j628 = px;
_j629 = py;
_j630 = px;
_j631 = py;
};
let _j542 = false;
let _j543 = 'rect';
let _j544 = null;
let _j545 = [];
let _j546 = null;
Object.defineProperty(window, 'spectral', {
get() { return useSpectralMix; },
set(v) {
useSpectralMix = !!v;
console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
}
});
window.getAgentPathData = function() {
return {
active: _j555,
paths: _j556,
pointCount: _j556.filter(p => !p.stroke).length,
strokeCount: _j556.filter(p => p.stroke).length,
canvasSize: { w: typeof width !== 'undefined' ? width : 0, h: typeof height !== 'undefined' ? height : 0 },
timestamp: Date.now()
};
};
let _j547 = 1.0,
_j548 = false,
_j549 = 0.0;
let _j550 = [0, 0, 0];
function _j34(v) {
_j550[0] = _j550[1];
_j550[1] = _j550[2];
_j550[2] = v;
const a = _j550[0], b = _j550[1], c = _j550[2];
return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}
let _j551 = null;
let _j552 = false,
_j553 = false,
_j554 = true;
let _j555 = false;
let _j556 = [];
let _j557 = 0,
maxUpdates = 10,
force = 1.0;
let _j558 = 0,
_j559 = 0,
_j560 = 0;
var doMoving = false,
_j561 = false;
let pathPoints = [],
_j562 = null,
startX = 0,
startY = 0,
_j563 = false;
let _j564 = 1,
pathRotation = 20;
let randStep = 1,
_j565 = 10,
expectedStrokeLength = 100;
let _j566 = [],
_j567 = 0,
_j568 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j569;
var currentStrokeHighlight = null;
let _j570 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j571 = 140.0,
_j572 = 0.5,
_j573 = 1.0,
_j574 = 0.5,
_j575 = 60.0;
let cellularEnabled = false,
_j576 = 15.0,
_j577 = 0.5;
let whiteDotEnabled = false,
_j578 = 0.01;
let grainEnabled = false,
_j579 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j580 = false;
let _j581 = false;
let _j582 = 0;
let _j583 = 0;
let _j584 = 0;
let _j585 = 50;
let _j586 = 0;
var flowEffectStrokeBounds = null;
let _j587 = false;
let _j588 = null;
let _j589 = 0;
var _j590 = 0;
var _j591 = 0;
let _j592 = false;
const _j593 = 3;
var _j594 = {
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
var _j595 = false;
let _j596 = [0, 0, 0, 0],
_j597 = [0, 0, 0],
_j598 = [0, 0, 0],
_j599 = [0, 0, 0];
let _j600 = [0, 0],
_j601 = [0, 0],
effect3Brightness = 0.2;
let _j602, _j603, _j604, _j605, _j606, _j607, _j608;
let _j609, _j610, _j611, _j612;
let _j613;
let _j614;
let _j615;
let _j616 = false,
_j617 = 0,
_j618 = null,
_j619 = 0;
let _j620 = 0,
_j621 = 0,
_j622 = true,
_j623 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j624 = false,
_j625 = 0,
_j626 = 0,
_j627 = 1.0;
let _j628 = 0,
_j629 = 0,
_j630 = 0,
_j631 = 0;
let _j632 = false,
isWaitingToLoop = false,
_j633 = 0;
let _j634 = 0,
_j635 = false;
let _j636 = 0,
_j637 = 0;
let _j638 = null,
_j639 = false,
_j640 = false;
let _j641 = 0.05,
_j642 = 0.05;
let _j643 = 0,
_j644 = 0;
let _j645 = 1,
_j646 = false;
let _j647 = 0,
_j648 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j649 = [0, 0, 0],
_j650 = [0, 0, 0];
let _j651 = false,
_j652 = 0,
_j653 = 0,
_j654 = 0,
_j655 = 1000;
let _j656 = false,
_j657 = 0;
let _j658 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j659 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j660 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j661 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j662 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j663 = 0,
_j664 = 300;
let _j665 = false,
_j666 = false;
let _j667 = false,
_j668 = 0,
frameCount = 0,
_j669 = [];
let _j670 = 1,
_j671 = 0.8;
let _j672 = true,
_j673 = [],
_j674 = 100,
isDragging = false;
let _j675 = {
x: 0,
y: 0
},
_j676 = {
x: 85,
y: 50
};
let _j677 = false,
_j678 = {
x: 0,
y: 0
},
_j679 = {
x: 15,
y: 50
},
_j680 = true;
let _j681 = false,
_j682 = {
x: 0,
y: 0
},
_j683 = {
x: 85,
y: 70
},
_j684 = true;
let _j685 = false,
_j686 = {
x: 0,
y: 0
},
_j687 = {
x: 85,
y: 40
},
_j688 = true;
let _j689 = false,
_j690 = {
x: 0,
y: 0
},
_j691 = {
x: 15,
y: 40
},
_j692 = true;
let _j693 = 10;
var screenText = false,
_j694 = [],
_j695 = 30,
_j696 = 0;
let _j697 = 25,
_j698 = 30,
_j699 = 16,
_j700 = 200,
_j701 = 200;
let _j702 = false,
_j703 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j496 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j497 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j495 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j500 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j502 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j162();
if (doDemo) {
_j170('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j569 = window._preloadedDemo;
recordingData = _j569;
window._pendingAutoPlay = true;
} else {
var _j704 = './lib/demo.json';
var _j705 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j705)) {
_j704 = './lib/' + _j705 + '.json';
}
fetch(_j704)
.then(_j1514 => {
if (!_j1514.ok) throw new Error('HTTP ' + _j1514.status);
return _j1514.json();
})
.then(data => {
_j569 = data;
if (_j569 && _j569.events && _j569.events.length > 0) {
recordingData = _j569;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j110('system', '❌ Failed to load ' + _j704, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j706 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j707 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j706) {
try {
const loadedData = JSON.parse(_j706);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j707 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j708 = sessionStorage.getItem('pendingRecordingData');
const _j709 = sessionStorage.getItem('shouldAutoPlay');
if (_j708 && _j709 === 'true') {
try {
const loadedData = JSON.parse(_j708);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j170('📂 Recording Data Restored After Reload');
_j110('system', '✅ Canvas size restored and recording loaded', {
CanvasSize: `${width}x${height}`,
Events: `${recordingData.events.length} events`
});
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
_j110('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
window._pendingAutoPlay = true;
}
} catch (error) {
_j110('system', '❌ Failed to restore recording data', {
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
const _j710 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j711 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
const _j712 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j712) {
const _j713 = parseFloat(_j712[1]);
if (!isNaN(_j713) && _j713 >= 0.5 && _j713 <= 5) {
_j493 = _j713;
_j110('system', '🔗 Pixel density from URL', {
Value: _j713
});
}
} else if (window.APP_MODE === 'collector') {
_j493 = 2;
_j110('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j710) {
const _j714 = 1.0;
if (_j493 > _j714) {
_j493 = _j714;
_j110('system', '📱 Mobile pixel density override', {
Value: _j714,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j715 = sessionStorage.getItem('pendingPixelDensity');
if (_j715 && !_j710 && !_j712) {
const _j716 = parseInt(_j715);
if (!isNaN(_j716) && _j716 >= 1 && _j716 <= 5) {
_j493 = _j716;
sessionStorage.removeItem('pendingPixelDensity');
_j110('system', '🔄 Restoring pixel density from session', {
Value: _j716,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j493);
const _j717 = sessionStorage.getItem('pendingCanvasWidth');
const _j718 = sessionStorage.getItem('pendingCanvasHeight');
let _j719 = false;
if (_j717 && _j718) {
_j491 = parseInt(_j717);
_j492 = parseInt(_j718);
_j719 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j110('system', '🔄 Restoring canvas size from recording', {
Width: `${_j491}px`,
Height: `${_j492}px`
});
}
let _j720 = false,
_j721 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j722 = qs.substring(1).split('_');
for (var i = 0; i < _j722.length; i++) {
var ci = _j722[i].indexOf(':');
if (ci === -1) continue;
var k = _j722[i].substring(0, ci), v = parseInt(_j722[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j491 = v;
_j720 = true;
}
if (k === 'h' && v > 0) {
_j492 = v;
_j721 = true;
}
}
})();
if (_j711 && window.APP_MODE === 'artist' && !_j719) {
if (!_j720) _j491 = 380;
if (!_j721) _j492 = 600;
if (!_j720 || !_j721) {
_j110('system', '📱 Mobile phone default canvas size', {
Width: `${_j491}px`,
Height: `${_j492}px`
});
}
}
const _j723 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j723) {
try {
const _j472 = JSON.parse(_j723);
if (Array.isArray(_j472) && _j472.length === 3) {
canvasBackgroundColor[0] = _j472[0];
canvasBackgroundColor[1] = _j472[1];
canvasBackgroundColor[2] = _j472[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j110('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j472[0]}, ${_j472[1]}, ${_j472[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j491, _j492, WEBGL);
if (_j539) {
const _j724 = document.querySelector('canvas');
if (_j724) {
const _j725 = document.getElementById('zen-mode-btn');
const _j726 = (pressure) => {
if (!_j725) return;
if (pressure <= 0) {
_j725.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j725.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j727 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j548) {
_j548 = true;
_j110('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j549 = _j34(e.pressure);
_j547 = Math.min(_j549 / 0.3, 1.0);
_j726(_j549);
}
};
_j724.addEventListener('pointerdown', _j727);
_j724.addEventListener('pointermove', _j727);
_j724.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j548) {
_j549 = 0.0;
_j550[0] = _j550[1] = _j550[2] = 0;
_j547 = -1;
_j726(0);
}
});
const _j728 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j729 = t.touchType === 'stylus';
if (_j729 && t.force > 0) {
const _j730 = Math.min(t.force, 1.0);
if (!_j548) {
_j548 = true;
_j110('system', '🖊️ Stylus force detected', { force: t.force });
}
_j549 = _j34(_j730);
_j547 = Math.min(_j549 / 0.3, 1.0);
_j726(_j549);
}
}
};
_j724.addEventListener('touchstart', _j728, { passive: true });
_j724.addEventListener('touchmove', _j728, { passive: true });
_j724.addEventListener('touchend', () => {
if (_j548) {
_j549 = 0.0;
_j550[0] = _j550[1] = _j550[2] = 0;
_j547 = -1;
_j726(0);
}
}, { passive: true });
}
}
_j494 = createFramebuffer({
density: _j493
});
window.metallicStrength = 0.85;
window.metallicFlowSpeed = 1.0;
window.metallicSpecular = 12.0;
window.metallicFresnel = 0.5;
window.bugsSize = 10.0;
window.metallicLightX = 0.5;
window.metallicLightY = 0.3;
window.metallicTint = [0.72, 0.50, 0.35];
if (typeof _j108 === 'function') _j108();
if (typeof _j106 === 'function') _j106();
_j145();
_j137();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j136 === 'function') {
_j136();
}
_j46();
window.addEventListener('resize', function() {
setTimeout(_j46, 100);
});
_j170('Interactive Generative Art System');
_j602 = createFramebuffer({
density: _j493
});
_j602.begin();
background(255);
_j602.end();
_j603 = createGraphics(width, height, WEBGL);
_j603.noStroke();
_j603.pixelDensity(_j493);;
_j603.clear();
_j604 = createFramebuffer({
density: _j493
});
_j604.begin();
background(255);
_j604.end();
_j605 = createFramebuffer({
density: _j493
});
_j605.begin();
background(255);
_j605.end();
_j606 = createFramebuffer({
density: _j493
});
_j607 = createGraphics(width, height, WEBGL);
_j607.noStroke();
_j607.pixelDensity(_j493);;
_j607.clear();
_j611 = createFramebuffer({
density: _j493
});
let _j473 = _j9(40, 20, 15, 0.2);
const _j474 = min(255, canvasBackgroundColor[0] * 1.1);
const _j475 = min(255, canvasBackgroundColor[1] * 1.1);
const _j476 = min(255, canvasBackgroundColor[2] * 1.1);
_j611.begin();
clear();
noStroke();
fill(_j474, _j475, _j476);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j473, -width / 2, -height / 2, width, height);
_j611.end();
_j473.remove();
_j612 = createFramebuffer({
density: _j493
});
_j612.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j612.end();
_j608 = createFramebuffer({
density: _j493
});
_j615 = createFramebuffer({
density: _j493
});
_j615.begin();
background(0);
_j615.end();
_j609 = createFramebuffer({
density: _j493
});
_j613 = createFramebuffer({
density: _j493
});
_j610 = createFramebuffer({
density: _j493
});
_j614 = createFramebuffer({
density: _j493
});
_j614.begin();
background(255);
_j614.end();
_j540 = createFramebuffer({
density: _j493
});
_j540.begin();
background(255);
_j540.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j493
});
}
_j494.begin();
background(255, 255, 255);
_j494.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j628 = hw;
_j629 = hh;
_j630 = hw;
_j631 = hh;
_j168();
_j508 = 10;
_j565 = 2;
_j510 = 0.5;
_j511 = 0.5;
_j509 = 0;
_j512 = 20;
x = y = _j513 = _j514 = _j515 = _j516 = _j529 = 0;
_j431 = hw;
_j432 = hh;
_j517 = 0;
_j164();
_j171();
_j27();
_j169();
window.addEventListener('mouseup', function(e) {
if (_j535 && !_j624) {
const _j731 = document.querySelector('canvas');
if (_j731) {
const bounds = _j731.getBoundingClientRect();
const _j732 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j732) {
_j110('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j536) {
_j536 = true;
_j557 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j552 = _j47(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j552 = false;
});
document.addEventListener('mousemove', function(e) {
if (_j541) return;
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j530 = _j177(mouseX);
_j531 = _j177(mouseY);
} else {
const _j731 = document.querySelector('canvas');
if (!_j731) return;
const bounds = _j731.getBoundingClientRect();
const _j733 = (e.clientX - bounds.left) / bounds.width;
const _j734 = (e.clientY - bounds.top) / bounds.height;
_j530 = _j177(_j733 * width);
_j531 = _j177(_j734 * height);
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
if (!_j1387.enabled) return;
_j1387.frameCount++;
let _j735 = 60;
const now = millis();
if (_j1387.lastFrameTime > 0) {
const deltaTime = now - _j1387.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j735 = 1000 / deltaTime;
_j735 = Math.max(1, Math.min(120, _j735));
}
} else {
try {
const _j736 = frameRate();
if (!isNaN(_j736) && _j736 > 0) {
_j735 = _j736;
}
} catch (e) {}
}
_j1387.lastFrameTime = now;
_j1387._pushFR(_j735);
if (_j1387.frameCount - _j1387.lastCheckFrame >= _j1387.checkInterval) {
_j1387.lastCheckFrame = _j1387.frameCount;
const _j737 = _j1387._frLen > 0 ?
_j1387._avgFR() :
_j735;
if (_j1387.logFpsToConsole) {
console.log('FPS:', _j737.toFixed(1));
}
const _j738 = 0.1;
const _j739 = _j737 <= (_j1387.frameRateThreshold + _j738);
if (_j739) {
const now = millis();
if (now - _j1387.lastPerformanceLog > _j1387.logCooldown) {
_j1387.lastPerformanceLog = now;
_j36(_j737);
}
}
}
}
function _j36(_j737) {
const _j740 = _j1387.performanceDataAccumulated;
const sampleCount = _j740.sampleCount > 0 ? _j740.sampleCount : 1;
if (sampleCount === 0 || _j740.drawTotal === 0) {
const _j741 = _j1387.performanceData;
const _j742 = _j741.drawTotal > 0 ? _j741.drawTotal : 1;
const report = {
'平均帧率': `${_j737.toFixed(1)} fps`,
'目标帧率': `${_j1387.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j737).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j491}x${_j492}`,
'Pixel Density': _j493
};
const stateInfo = {
'正在绘制': _j535 ? '是' : '否',
'正在播放': _j624 ? '是' : '否',
'倒计时中': _j536 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j639 ? '是' : '否',
'笔画数量': typeof _j566 !== 'undefined' ? _j566.length : 0
};
_j110('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j740.drawTotal / sampleCount,
updatePlayback: _j740.updatePlayback / sampleCount,
updateCompositeBuffer: _j740.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j740.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j740.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j740.updateBlurEffect / sampleCount,
applyCameraProjection: _j740.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j740.drawLayersWithBlur / sampleCount,
other: _j740.other / sampleCount
};
const _j742 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j743 = [];
const _j744 = _j742 * 0.1;
if (data.updatePlayback > _j744) {
_j743.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j742) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j744) {
_j743.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j742) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j744) {
_j743.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j742) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j744) {
_j743.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j742) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j744) {
_j743.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j742) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j744) {
_j743.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j742) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j744) {
_j743.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j742) * 100).toFixed(1)
});
}
if (data.other > _j744) {
_j743.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j742) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j737.toFixed(1)} fps`,
'目标帧率': `${_j1387.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j737).toFixed(2)} ms`,
'总耗时': `${_j742.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j491}x${_j492}`,
'Pixel Density': _j493
};
const stateInfo = {
'正在绘制': _j535 ? '是' : '否',
'正在播放': _j624 ? '是' : '否',
'倒计时中': _j536 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j639 ? '是' : '否',
'笔画数量': typeof _j566 !== 'undefined' ? _j566.length : 0
};
if (_j743.length > 0) {
report['性能瓶颈'] = _j743.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j745 = [];
if (data.drawLayersWithBlur > _j744) {
_j745.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j744) {
_j745.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j491 * _j492 > 1500000) {
_j745.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof _j566 !== 'undefined' && _j566.length > 100) {
_j745.push('笔画数量较多，考虑清理旧笔画');
}
if (_j745.length > 0) {
report['优化建议'] = _j745.join('; ');
}
_j110('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1387.performanceData).forEach(key => {
_j1387.performanceData[key] = 0;
});
Object.keys(_j1387.performanceDataAccumulated).forEach(key => {
_j1387.performanceDataAccumulated[key] = 0;
});
}
let _j746 = 0;
const _j747 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j748 = (++_j746 % _j747 === 0);
const _j749 = _j748 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j226.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j750 = _j748 ? performance.now() : 0;
if (_j624) {
updatePlayback();
}
if (_j748) _j1387.performanceData.updatePlayback += performance.now() - _j750;
_j26();
if (_j554 || _j535 || _j536 || _j624 || _j667) {
if (_j748) _j750 = performance.now();
updateCompositeBuffer();
if (_j748) _j1387.performanceData.updateCompositeBuffer += performance.now() - _j750;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j33();
}
if (_j748) _j750 = performance.now();
updateEasyCamAutoTracking();
if (_j748) _j1387.performanceData.updateEasyCamAutoTracking += performance.now() - _j750;
if (_j748) _j750 = performance.now();
drawCursorToBuffer();
if (_j748) _j1387.performanceData.drawCursorToBuffer += performance.now() - _j750;
_j37();
if (_j748) _j750 = performance.now();
updateBlurEffect();
if (_j748) _j1387.performanceData.updateBlurEffect += performance.now() - _j750;
if (_j748) _j750 = performance.now();
applyCameraProjection();
if (_j748) _j1387.performanceData.applyCameraProjection += performance.now() - _j750;
if (_j748) _j750 = performance.now();
drawLayersWithBlur();
if (_j748) _j1387.performanceData.drawLayersWithBlur += performance.now() - _j750;
_j51();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j751 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j624 !== 'undefined' ? _j624 : '?') +
' evt=' + (typeof _j626 !== 'undefined' ? _j626 : '?');
_j608.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j751, -width/2 + 4, -height/2 + 3);
_j608.end();
if (d.totalFrames % 10 === 0) {
var _j752 = document.getElementById('defaultCanvas0');
var _j753 = document.getElementById('_fxDbgOvr');
if (!_j753 && _j752) {
_j753 = document.createElement('canvas');
_j753.id = '_fxDbgOvr';
_j753.width = _j752.offsetWidth;
_j753.height = 24;
_j753.style.position = 'fixed';
_j753.style.top = _j752.offsetTop + 'px';
_j753.style.left = _j752.offsetLeft + 'px';
_j753.style.zIndex = '2147483647';
_j753.style.pointerEvents = 'none';
document.body.appendChild(_j753);
}
if (_j753) {
var _j754 = _j753.getContext('2d');
_j754.clearRect(0, 0, _j753.width, _j753.height);
_j754.fillStyle = 'rgba(200,0,0,0.85)';
_j754.fillRect(0, 0, _j753.width, 22);
_j754.font = 'bold 13px monospace';
_j754.fillStyle = '#fff';
_j754.fillText(_j751, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j755 = document.getElementById('fxhash-capture-canvas');
var _j756 = document.getElementById('defaultCanvas0');
if (_j755 && typeof _j608 !== 'undefined') {
var _j757 = _j608.get();
_j755.width = _j757.width;
_j755.height = _j757.height;
var _j758 = _j755.getContext('2d');
_j758.drawImage(_j757.canvas, 0, 0);
if (typeof _j757.remove === 'function') _j757.remove();
if (_j756) {
_j755.style.cssText = _j756.style.cssText;
_j756.style.visibility = 'hidden';
}
_j755.style.position = 'absolute';
_j755.style.top = (_j756 ? _j756.offsetTop : 0) + 'px';
_j755.style.left = (_j756 ? _j756.offsetLeft : 0) + 'px';
_j755.style.zIndex = '99999';
_j755.style.visibility = 'visible';
_j755.style.border = 'none';
_j755.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j755.width + 'x' + _j755.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j759 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j758.save();
_j758.fillStyle = 'rgba(0,0,0,0.7)';
_j758.fillRect(10, 10, 280, _j759.length * 22 + 10);
_j758.font = '16px monospace';
_j758.fillStyle = '#0f0';
for (var li = 0; li < _j759.length; li++) {
_j758.fillText(_j759[li], 18, 30 + li * 22);
}
_j758.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j756 && _j755) {
_j755.width = _j756.width;
_j755.height = _j756.height;
var _j758 = _j755.getContext('2d');
_j758.drawImage(_j756, 0, 0);
if (_j756) _j756.style.visibility = 'hidden';
_j755.style.visibility = 'visible';
_j755.style.zIndex = '99999';
_j755.style.border = 'none';
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
if (_j748) {
const _j760 = performance.now();
const _j761 = _j1387.performanceData.updatePlayback +
_j1387.performanceData.updateCompositeBuffer +
_j1387.performanceData.updateEasyCamAutoTracking +
_j1387.performanceData.drawCursorToBuffer +
_j1387.performanceData.updateBlurEffect +
_j1387.performanceData.applyCameraProjection +
_j1387.performanceData.drawLayersWithBlur;
_j1387.performanceData.other = (_j760 - _j749) - _j761;
_j1387.performanceData.drawTotal = _j760 - _j749;
_j1387.performanceDataAccumulated.drawTotal += _j1387.performanceData.drawTotal;
_j1387.performanceDataAccumulated.updatePlayback += _j1387.performanceData.updatePlayback;
_j1387.performanceDataAccumulated.updateCompositeBuffer += _j1387.performanceData.updateCompositeBuffer;
_j1387.performanceDataAccumulated.updateEasyCamAutoTracking += _j1387.performanceData.updateEasyCamAutoTracking;
_j1387.performanceDataAccumulated.drawCursorToBuffer += _j1387.performanceData.drawCursorToBuffer;
_j1387.performanceDataAccumulated.updateBlurEffect += _j1387.performanceData.updateBlurEffect;
_j1387.performanceDataAccumulated.applyCameraProjection += _j1387.performanceData.applyCameraProjection;
_j1387.performanceDataAccumulated.drawLayersWithBlur += _j1387.performanceData.drawLayersWithBlur;
_j1387.performanceDataAccumulated.other += _j1387.performanceData.other;
_j1387.performanceDataAccumulated.sampleCount++;
}
_j35();
if (_j624) {
if (_j536 && !_j635) {
_j634 = millis();
_j635 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j536 && _j635) {
const _j762 = millis() - _j634;
const _j763 = _j625;
_j625 += _j762;
_j635 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j762.toFixed(0)}ms`);
if (_j626 < recordingData.events.length) {
const _j764 = recordingData.events[_j626];
const _j765 = _j764.m || _j764.type;
const _j766 = _j765 === 'mp' || _j765 === 'mousePressed';
const _j767 = _j764.t !== undefined ? _j764.t : _j764.time;
const _j768 = (millis() - _j625) * _j627;
const _j769 = _j767 - _j768;
if (_j766 || _j769 <= 0 || _j769 < 100) {
if (window.DEBUG_MODE && _j766) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j769.toFixed(0)}ms`);
}
_j184(_j764);
_j626++;
}
}
}
}
const _j770 = _j624 ? _j632 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j535));
const _j771 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j770 : (_j770 && _j518 > 0);
const _j772 = _j624 || (_j530 >= 0 && _j530 < width && _j531 >= 0 && _j531 < height) || (_j535 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j771 && _j772) {
window.drawLoopCount++;
if (_j558 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j558++;
let _j489, _j490;
if (_j624) {
_j489 = _j628;
_j490 = _j629;
} else {
_j489 = _j530;
_j490 = _j531;
}
if (_j558 % 2 === 0 && _j563) {
pathPoints.push({
x: _j489,
y: _j490
});
}
if (_j555) {
_j556.push({
x: _j489,
y: _j490,
t: millis(),
pressure: force
});
}
const _j773 = strokeSeed + _j558 * 100000000;
randomSeed(_j773);
if (brushMode === 3) {
let _j774 = crandom.random(0, 1);
let _j775 = crandom.random(150, 250);
let _j776 = _j774 > 0.1 ? noise(_j489 * 0.01, _j490 * 0.01) * 150 : _j775;
_j503 = (_j503 * 0.3) + (_j776 * 0.7);
} else {
let _j774 = crandom.random(0, 1);
let _j775 = crandom.random(20, 50);
let _j776 = _j774 > 0.3 ? noise(_j489 * 0.01, _j490 * 0.01) * 10 : _j775;
_j503 = (_j503 * 0.6) + (_j776 * 0.4);
}
_j518 -= randStep;
_j518 = max(1, _j518);
_j512 = _j518;
if (_j539 && _j558 >= 8) {
const _j777 = _j624 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j549;
const _j778 = baseBrushSize;
if (_j777 >= 0.3) {
const _j779 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j780 = _j551 || window._strokeStartBaseBrushSize || 1;
let _j781 = _j779.indexOf(_j780);
if (_j781 === -1) {
_j781 = _j779.findIndex(s => s >= _j780);
if (_j781 === -1) _j781 = _j779.length - 1;
}
let _j782;
if      (_j777 < 0.5) _j782 = 1;
else if (_j777 < 0.7) _j782 = 2;
else                     _j782 = 3;
const _j783 = Math.min(_j781 + _j782, _j779.length - 1);
baseBrushSize = _j779[_j783];
} else if (_j777 >= 0) {
baseBrushSize = _j551 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j778 && _j778 > 0) {
const _j784 = Math.pow(baseBrushSize / _j778, 0.6);
_j518 *= _j784;
initialSize *= _j784;
}
}
if (_j518 <= _j519 && !_j536 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j536 = true;
_j557 = 0;
}
_j431 = _j489;
_j432 = _j490;
_j517 = map(noise(_j431 * 0.01, _j432 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j785 = strokeSeed + _j558 * 10000000;
randomSeed(_j785);
const _j786 = crandom.random(pathRotation * 0.5, pathRotation);
const _j787 = crandom.random(pathRotation * 0.5, pathRotation);
const _j484 = -10;
_j431 += _j786 * (cos(_j517)) + _j484;
_j432 += _j787 * (sin(_j517)) + _j484;
}
if (_j616) {
const _j788 = (brushMode === 3) ? _j431 : Math.round(_j431);
const _j789 = (brushMode === 3) ? _j432 : Math.round(_j432);
const _j790 = { x: _j788, y: _j789 };
if (_j539 && _j548) _j790.p = Math.round(_j549 * 1000) / 1000;
_j178("md", _j790);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j532 = _j431;
_j533 = _j432;
let _j294 = _j605;
if (_j558 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j791 = dist(_j431, _j432, _j527, _j528);
const _j792 = 1;
if (_j791 > _j792) {
if (brushMode == 4 && _j558 < expectedStrokeLength) {
_j58(_j294, _j431, _j432, _j527, _j528);
}
if ((brushMode == 1 || brushMode == 7) && _j558 < expectedStrokeLength) {
let _j793 = expectedStrokeLength > 0 ? min(_j558 / expectedStrokeLength, 1.0) : 0;
let _j794 = crandom.random(0, 1);
if (_j794 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j558 > 5 && baseBrushSize < 6.0) _j56(_j294, _j431, _j432);
}
_j57(_j294, _j431, _j432, _j793, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j558 < expectedStrokeLength) {
let _j793 = expectedStrokeLength > 0 ? min(_j558 / expectedStrokeLength, 1.0) : 0;
let _j794 = crandom.random(0, 1);
if (_j794 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j793 < 0.6) {}
_j60(_j294, _j431, _j432, _j793, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j558 < expectedStrokeLength) {
_j63(_j294, _j431, _j432, _j527, _j528);
if (crandom.random(0, 1) > 0.4) _j56(_j294, _j431, _j432);
}
if (brushMode == 5 && _j558 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j56(_j294, _j431, _j432);
}
if (brushMode == 6 && _j558 < expectedStrokeLength) {
let _j793 = expectedStrokeLength > 0 ? min(_j558 / expectedStrokeLength, 1.0) : 0;
_j64(_j294, _j431, _j432, _j793, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j558 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j527 = _j431;
_j528 = _j432;
if (_j624) {
_j630 = _j628;
_j631 = _j629;
}
}
const _j795 = _j624 ? _j632 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j535));
const _j796 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j795 : (_j795 && _j518 > 0);
if (_j796) {
if (_j559 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j294 = _j605;
_j30(_j294, force);
_j559++;
if (_j559 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j536 && _j557 < maxUpdates) {
force = map(_j557, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j294 = _j605;
_j30(_j294, force);
_j557++;
_j559++;
} else if (_j536 && _j557 >= maxUpdates) {
_j110('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j38();
_j536 = false;
}
if (_j623 == 1 && _j624 && !_j667) {
_j173();
}
if (_j623 == 1 && !_j624 && _j667) {
_j174();
}
if (_j667) {
_j175();
if (_j623 == 1) {
frameRate(10);
}
}
if (_j623 == 0) {
frameRate(60);
}
_j138();
if (_j702) {
_j702 = false;
const _j797 = drawingSeed;
randomSeed(_j703);
noiseSeed(_j703);
let scanBounds = pendingBugBounds ? {
...pendingBugBounds
} : null;
if (!scanBounds) {
if (typeof _j566 !== 'undefined' && _j566.length > 0) {
const lastStroke = _j566[_j566.length - 1];
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
_j18(_j608, scanBounds);
}
randomSeed(_j797);
noiseSeed(_j797);
_j703 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j798 = window.pendingEffectControlScanQueue.shift();
if (_j798 && typeof _j18 === 'function') {
let scanBounds = _j798.scanBounds;
const action = _j798.action;
const shapeType = _j798.shapeType;
const bugsSize = _j798.bugsSize !== undefined ? _j798.bugsSize : 10.0;
const scanSeed = _j798.scanSeed;
const recordedRandomCount = _j798.recordedRandomCount;
const targetPoints = _j798.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j799 = document.getElementById('bugs-size');
const _j800 = document.getElementById('bugs-size-value');
if (_j799 && _j800) {
_j799.value = bugsSize;
_j800.textContent = bugsSize;
}
window._scanProcessedPlaybackCount = (window._scanProcessedPlaybackCount || 0) + 1;
}
if (action === 'scan-current' && !scanBounds) {
if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
scanBounds = {
...pendingBugBounds
};
} else if (typeof _j566 !== 'undefined' && _j566.length > 0) {
const lastStroke = _j566[_j566.length - 1];
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
const _j801 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j608, scanBounds, shapeType, targetPoints);
if (_j801) {
randomSeed(_j801);
noiseSeed(_j801);
}
if (typeof window !== 'undefined') {
_j110('playback', '🔁 Effect Control: Scan (processed)', {
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
if (_j624) {
return;
}
if (_j552) {
return;
}
if (_j541) {
if (_j543 === 'rect') {
_j544 = { x1: mouseX - 10, y1: mouseY - 10 };
} else if (_j543 === 'polygon') {
_j545.push({ x: mouseX - 10, y: mouseY - 10 });
if (typeof _j91 === 'function') _j91();
}
return false;
}
_j530 = _j177(mouseX);
_j531 = _j177(mouseY);
pmouseX = mouseX;
pmouseY = mouseY;
const _j802 = 300;
if (_j530 < -_j802 || _j530 > width + _j802 ||
_j531 < -_j802 || _j531 > height + _j802) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j616) {
_j620++;
}
if (_j616) {
console.log(`🎬 錄製開始 [第 ${_j620} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j39();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j110('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j530.toFixed(0)}, ${_j531.toFixed(0)})`
});
_j643++;
_j560 = _j558;
_j503 = 0;
_j558 = 0;
if (_j539 && _j551 !== null) {
baseBrushSize = _j551;
}
if (typeof _j1036 !== 'undefined') {
_j1036 = [];
}
if (typeof _j1037 !== 'undefined') {
_j1037 = 0;
}
_j504 = crandom.random(0.5, 0.99);
_j505 = crandom.random(-0.02, 0.02);
_j506 = crandom.random(-0.05, 0.05);
_j507 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j177(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j177(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j177(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j803 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j804 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j616) {
if (_j622) {
if (_j617 === 0) {
_j617 = millis();
_j110('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j805 = millis() - _j619;
if (_j805 > 0) {
_j621 += _j805;
_j110('recording', '⏸️ Skip interval', {
Interval: `${_j805.toFixed(0)}ms`,
Accumulated: `${_j621.toFixed(0)}ms`
});
}
}
_j622 = false;
} else {
const _j805 = millis() - _j619;
_j621 += _j805;
_j110('recording', '⏸️ Skip interval', {
Interval: `${_j805.toFixed(0)}ms`,
Accumulated: `${_j621.toFixed(0)}ms`
});
}
_j618 = {
strokeSeed: strokeSeed,
mouseCountStart: _j560,
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
whiteMaxOpacity: _j177(_j504),
hueShift: _j177(_j505),
satShift: _j177(_j506),
briShift: _j177(_j507),
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
maskData: _j546 || undefined
};
}
if (_j564 === 1) {
pathRotation = 0;
} else if (_j564 === 2) {
pathRotation = _j177(crandom.random(5, 10));
} else if (_j564 === 3) {
pathRotation = _j177(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j177(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j508 = 15;
_j565 = 5;
_j510 = 0.6;
_j511 = 0.5;
} else if (brushMode === 2) {
initialSize = _j177(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j508 = 10;
_j565 = 10;
_j510 = 0.3;
_j511 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j565 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j565 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j530 * 1, _j531 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j510 = 0.6;
_j511 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j565 = 1;
randStep = 0.05;
maxUpdates = 10;
_j508 = 10;
_j510 = 0.6;
_j511 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j565 = 1;
randStep = 0.05;
maxUpdates = 10;
_j508 = 10;
_j510 = 0.6;
_j511 = 0.5;
} else {
initialSize = crandom.random(30, 40);
maxUpdates = 10;
randStep = 0.05;
}
if (useSharpen >= 3.5) {
maxUpdates = 20;
_j110('system', '⚡️ Ink Effect G active, maxUpdates set to 5', {
Status: 'Performance Optimization'
});
}
if (brushMode == 4) {
expectedStrokeLength = 400;
} else {
expectedStrokeLength = 400;
}
if (_j616 && _j618) {
_j618.initialSize = initialSize;
_j618.spraySize = spraySize;
_j618.step = _j508;
_j618.step2 = _j565;
_j618.randStep = randStep;
_j618.maxUpdates = maxUpdates;
_j618.pathRotation = pathRotation;
_j618.spring = _j510;
_j618.friction = _j511;
_j618.baseBrushSize = baseBrushSize;
_j618.expectedStrokeLength = expectedStrokeLength;
_j618.effect3Brightness = _j177(effect3Brightness);
}
_j518 = initialSize;
_j512 = _j518;
_j516 = _j512;
_j534 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j539 && _j551 === null) _j551 = baseBrushSize;
_j529 = 0;
x = _j530;
y = _j531;
_j513 = 0;
_j514 = 0;
_j515 = 0;
_j526 = 0;
_j520 = 0;
if (typeof _j60 !== 'undefined') {
_j60.lastAngle = 0;
_j60.lastMovementAngle = 0;
}
if (typeof _j62 === 'function') {
_j62();
}
if (typeof _j64 !== 'undefined') {
_j64.lastAngle = 0;
_j64.lastMovementAngle = 0;
}
_j527 = _j530;
_j528 = _j531;
_j535 = true;
_j536 = false;
_j557 = 0;
_j559 = 0;
_j537 = true;
_j538 = false;
startX = _j530;
startY = _j531;
pathPoints = [{
x: _j530,
y: _j531
}];
_j563 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j616 && _j618) {
_j618.mouseX = _j530;
_j618.mouseY = _j531;
_j618.drawingSeed = drawingSeed;
_j618.brushModeSP = brushModeSP;
if (_j539 && _j548) _j618.hasPressure = true;
_j618.forceMapParams = {
randomSeed1: _j177(_j596[0]),
randomSeed2: _j177(_j596[1]),
randomSeed3: _j177(_j596[2]),
randomSeed4: _j177(_j596[3]),
scale1: _j177(_j597[0]),
scale2: _j177(_j597[1]),
scale3: _j177(_j597[2]),
amplitude1: _j177(_j598[0]),
amplitude2: _j177(_j598[1]),
amplitude3: _j177(_j598[2]),
phase1: _j177(_j599[0]),
phase2: _j177(_j599[1]),
phase3: _j177(_j599[2]),
vortexScale1: _j177(_j600[0]),
vortexScale2: _j177(_j600[1]),
clusterScale1: _j177(_j601[0]),
clusterScale2: _j177(_j601[1])
};
const _j806 = (brushMode === 3) ? _j530 : Math.round(_j530);
const _j807 = (brushMode === 3) ? _j531 : Math.round(_j531);
_j178("mp", {
x: _j806,
y: _j807,
strokeData: _j618
});
}
}
function mouseReleased() {
if (_j624) {
return;
}
if (_j541 && _j543 === 'rect' && _j544 && _j544.x1 !== undefined) {
const mx = mouseX - 10, my = mouseY - 10;
const x1 = Math.min(_j544.x1, mx);
const y1 = Math.min(_j544.y1, my);
const x2 = Math.max(_j544.x1, mx);
const y2 = Math.max(_j544.y1, my);
if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
_j544 = { x1: x1, y1: y1, x2: x2, y2: y2 };
drawMaskRect(x1, y1, x2, y2);
_j546 = { action: "rect", x1: x1, y1: y1, x2: x2, y2: y2 };
_j541 = false;
const toggle = document.getElementById('mask-mode-toggle');
if (toggle) toggle.checked = false;
if (typeof _j91 === 'function') _j91();
window.resetBrushPositionToMouse();
}
return;
}
if (!_j535) {
return;
}
if (_j555) {
_j556.push({ stroke: true, t: millis() });
}
const _j808 = crandom.getCount();
const _j809 = _j530;
const _j810 = _j531;
const _j811 = Math.round(constrain(_j809, 0, width));
const _j812 = Math.round(constrain(_j810, 0, height));
_j178("mr", {
x: _j811,
y: _j812
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j813 = randomCount - _j808;
const _j814 = window.drawLoopCount || 0;
const _j815 = window.recordedMouseDraggedCount || 0;
if (_j616) {
console.log(`   Draw: ${_j814} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j616) {
crandomDebugger.saveStroke('recording', _j620);
}
if (_j616) {
_j619 = millis();
_j110('recording', 'Stroke ended', {
FinalSize: _j518.toFixed(2),
CountdownStatus: _j536 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j530 < 0 || _j530 >= width || _j531 < 0 || _j531 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j1036 !== 'undefined' && _j1036.length > 0) {
_j1036 = _j1036.filter(_j1515 => _j1515.radius > 0);
}
if (!_j536) {
_j536 = true;
_j557 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j118();
return;
}
if (key === 'f' || key === 'F') {
if (_j667) {
_j174();
} else {
_j173();
}
return;
}
if (key === ' ') {
_j163();
console.clear();
let _j816 = _j226.length;
_j226 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j110('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j816} 个`
});
return false;
}
}
function _j37() {
const _j454 = doMoving && _j639 && _j638 !== null && _j624 && _j640;
const _j817 = (_j624 && _j454) || (!_j624 && (_j656 || _j660[0] !== 0 || _j660[40] !== 0 || _j660[80] !== 0 || _j660[120] !== 0));
if (_j817) {
if (!_j656) {
_j656 = true;
_j657 = millis();
_j658[0] = _j660[0];
_j658[40] = _j660[40];
_j658[80] = _j660[80];
_j658[120] = _j660[120];
}
const _j421 = millis() - _j657;
const _j422 = Math.min(_j421 / _j655, 1.0);
const _j818 = _j624 ? _j659 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j660[0] = lerp(_j658[0], _j818[0], _j422);
_j660[40] = lerp(_j658[40], _j818[40], _j422);
_j660[80] = lerp(_j658[80], _j818[80], _j422);
_j660[120] = lerp(_j658[120], _j818[120], _j422);
if (_j422 >= 1.0) {
_j660[0] = _j818[0];
_j660[40] = _j818[40];
_j660[80] = _j818[80];
_j660[120] = _j818[120];
if (!_j624) {
_j656 = false;
}
}
} else if (!_j624 && !_j656) {
_j660[0] = 0;
_j660[40] = 0;
_j660[80] = 0;
_j660[120] = 0;
}
}
function updateBlurEffect() {
const _j454 = doMoving && _j639 && _j638 !== null && _j624 && _j640;
const _j819 = _j624;
const _j820 = _j819 ? _j632 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j535));
const _j821 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j820 : (_j820 && _j518 > 0);
if (!doMoving) {
_j662[0] = 0;
_j662[40] = 0;
_j662[80] = 0;
_j662[120] = 0;
return;
}
if (_j819) {
if (_j666) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j661[0] = _j177(max(0, crandom.random(-5, 5)));
_j661[40] = _j177(max(0, crandom.random(-5, 5)));
_j661[80] = _j177(max(0, crandom.random(-5, 5)));
_j661[120] = _j177(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j663 = millis();
_j666 = false;
}
_j665 = _j820;
} else {
_j665 = false;
_j666 = false;
}
let _j822 = 0;
if (_j819) {
if (_j821) {
const _j421 = millis() - _j663;
const _j422 = min(1.0, _j421 / _j664);
_j822 = _j422;
} else if (_j536) {
const _j823 = map(_j557, 0, maxUpdates, 1.0, 0.0);
_j822 = _j823;
} else {
_j822 = 0;
}
if (_j454 && _j638 !== null) {
const _j418 = _j638.getDistance();
const _j414 = PI / 3;
const _j433 = height / (2 * tan(_j414 / 2));
const _j434 = 1.1;
const _j435 = 1.4;
const _j437 = _j433 / _j418;
const _j824 = _j435 - _j434;
const _j825 = (_j437 - _j434) / _j824;
const _j826 = constrain(_j825, 0.0, 1.0);
const _j827 = pow(_j826, 0.5);
_j822 = _j822 * _j827;
}
}
_j662[0] = _j661[0] * _j822;
_j662[40] = _j661[40] * _j822;
_j662[80] = _j661[80] * _j822;
_j662[120] = _j661[120] * _j822;
}
function drawLayersWithBlur() {
const _j454 = doMoving && _j639 && _j638 !== null && _j624 && _j640;
const _j483 = (typeof _j542 !== 'undefined' && _j542) ||
(typeof _j541 !== 'undefined' && _j541);
const _j480 = ((_j535 || _j536) && _j557 < maxUpdates && _j563) || _j483;
const _j828 = _j226.length > 0 && typeof _j21 === 'function';
const _j829 = false;
const _j830 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j500 && _j494;
if (_j495 && _j494) {
_j168();
}
_j606.begin();
clear();
if (_j830) {
let _j831 = _j608;
if (_j828) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j608, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j613, window.tempMetallicBuffer);
_j831 = _j613;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j500);
_j500.setUniform("rect", [0, 0, width * _j493, height * _j493]);
_j500.setUniform("tex0", _j831);
_j500.setUniform("forceMap", _j494);
_j500.setUniform("time", millis() * 0.005);
_j500.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j500.setUniform("distortEnabled", 1.0);
_j500.setUniform("displacementB", distortDisplacementB);
_j500.setUniform("displacementC", distortDisplacementC);
_j500.setUniform("showFbmMask", distortShowFbmMask);
_j500.setUniform("fbmSeed1", _j596[0] || 100);
_j500.setUniform("fbmSeed2", _j596[1] || 200);
_j500.setUniform("fbmSeed3", _j596[2] || 300);
_j500.setUniform("fbmSeed4", _j596[3] || 400);
} else {
_j500.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j500.setUniform("rsEnabled", 1.0);
_j500.setUniform("rsFrequency", _j571);
_j500.setUniform("rsWaveSpeed", _j572);
_j500.setUniform("rsStrength", _j573);
_j500.setUniform("rsGradientMix", _j574);
_j500.setUniform("rsScale", _j575);
} else {
_j500.setUniform("rsEnabled", 0.0);
}
_j500.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j500.setUniform("cellularScale", _j576);
_j500.setUniform("cellularSeed", _j577);
_j500.setUniform("whiteDotDensity", whiteDotEnabled ? _j578 : 0.0);
_j500.setUniform("grainAmount", grainEnabled ? _j579 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j608, 0, 0, width, height);
if (_j828) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j606, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j613, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j613, 0, 0, width, height);
}
}
_j606.end();
if (_j587 && _j588) {
const data = _j588;
const bounds = data.bounds;
const _j832 = {
rect: [0, 0, width * _j493, height * _j493],
blendType: data.blendType,
blendVol: _j594.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j594.pixD,
blendA: _j594.blendA,
blendB: _j594.blendB,
directVol: _j594.directVol,
snoiseVol: _j594.snoiseVol,
gobalStyle: _j594.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j594.colorDeep,
whiteDot: _j594.whiteDot,
doBigShape: _j594.doBigShape,
doMask: _j594.doMask,
multiDir: _j594.multiDir,
drawTime: _j594.drawTime,
seed: _j594.seed,
iTime: millis() * 0.001
};
if (_j615 && _j502) {
_j609.begin();
clear();
shader(_j502);
for (const [key, val] of Object.entries(_j832)) {
_j502.setUniform(key, val);
}
_j502.setUniform('tex0', _j615);
_j502.setUniform('lastStrokeTex', _j614);
_j502.setUniform('lastStrokeOnly', _j595 ? 1 : 0);
_j502.setUniform('isTypeMapMode', 1);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j609.end();
_j615.begin();
clear();
background(0);
imageMode(CENTER);
image(_j609, 0, 0, width, height);
_j615.end();
}
if (_j502) {
_j608.begin();
clear();
imageMode(CENTER);
image(_j602, 0, 0, width, height);
_j608.end();
_j602.begin();
shader(_j502);
for (const [key, val] of Object.entries(_j832)) {
_j502.setUniform(key, val);
}
_j502.setUniform('tex0', _j608);
_j502.setUniform('lastStrokeTex', _j614);
_j502.setUniform('lastStrokeOnly', _j595 ? 1 : 0);
_j502.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j602.end();
}
if (_j502) {
_j608.begin();
clear();
imageMode(CENTER);
image(_j604, 0, 0, width, height);
_j608.end();
_j604.begin();
shader(_j502);
for (const [key, val] of Object.entries(_j832)) {
_j502.setUniform(key, val);
}
_j502.setUniform('tex0', _j608);
_j502.setUniform('lastStrokeTex', _j614);
_j502.setUniform('lastStrokeOnly', _j595 ? 1 : 0);
_j502.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j604.end();
}
if (_j502) {
_j608.begin();
clear();
imageMode(CENTER);
image(_j606, 0, 0, width, height);
_j608.end();
_j606.begin();
shader(_j502);
for (const [key, val] of Object.entries(_j832)) {
_j502.setUniform(key, val);
}
_j502.setUniform('tex0', _j608);
_j502.setUniform('lastStrokeTex', _j614);
_j502.setUniform('lastStrokeOnly', _j595 ? 1 : 0);
_j502.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j606.end();
}
_j587 = false;
_j588 = null;
_j554 = true;
}
if (_j581 && _j502 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
_j609.begin();
clear();
imageMode(CENTER);
image(_j606, 0, 0, width, height);
_j609.end();
_j606.begin();
shader(_j502);
_j502.setUniform('rect', [0, 0, width * _j493, height * _j493]);
_j502.setUniform('tex0', _j609);
_j502.setUniform('lastStrokeTex', _j614);
_j502.setUniform('lastStrokeOnly', _j595 ? 1 : 0);
_j502.setUniform('blendType', _j582);
_j502.setUniform('blendVol', _j594.blendVol * (1 + _j584 * 0.1));
_j502.setUniform('radSeed', _j586 * 0.001);
_j502.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j502.setUniform('pixD', _j594.pixD);
_j502.setUniform('blendA', _j594.blendA);
_j502.setUniform('blendB', _j594.blendB);
_j502.setUniform('directVol', _j594.directVol);
_j502.setUniform('snoiseVol', _j594.snoiseVol);
_j502.setUniform('gobalStyle', _j594.gobalStyle);
_j502.setUniform('vline', 5);
_j502.setUniform('hline', 5);
_j502.setUniform('cellT', 1.0);
_j502.setUniform('colorDeep', _j594.colorDeep);
_j502.setUniform('whiteDot', _j594.whiteDot);
_j502.setUniform('doBigShape', _j594.doBigShape);
_j502.setUniform('doMask', _j594.doMask);
_j502.setUniform('multiDir', _j594.multiDir);
_j502.setUniform('drawTime', _j594.drawTime);
_j502.setUniform('seed', _j594.seed);
_j502.setUniform('iTime', millis() * 0.001);
_j502.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j606.end();
}
noStroke();
push();
translate(0, 0, _j660[0]);
image(_j606, -width / 2, -height / 2);
pop();
if (_j480) {
push();
translate(0, 0, _j660[40]);
image(_j610, -width / 2, -height / 2);
pop();
}
if (_j624) {
if (showFuturePathPreview) {
_j41();
} else {
_j607.clear();
}
push();
translate(0, 0, _j660[80]);
image(_j607, -width / 2, -height / 2);
pop();
}
if (screenText && _j672) {
_j42();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j603.clear();
_j603.push();
_j44();
_j43();
_j603.pop();
} else {
_j603.clear();
_j603.push();
_j43();
_j603.pop();
}
const _j833 = (screenText && _j672) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof _j566 !== 'undefined' && Array.isArray(_j566) && _j566.length > 0);
if (_j833) {
push();
translate(0, 0, _j660[120]);
image(_j603, -width / 2, -height / 2);
pop();
}
if (_j454) {
pop();
}
}
function drawMaskRect(x1, y1, x2, y2) {
var _j834 = height - y2;
var _j835 = height - y1;
push();
_j540.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
rectMode(CORNER);
rect(x1, _j834, x2 - x1, _j835 - _j834);
_j540.end();
pop();
_j542 = true;
}
function drawMaskPolygon(points) {
if (points.length < 3) return;
push();
_j540.begin();
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
_j540.end();
pop();
_j542 = true;
}
function clearMask() {
push();
_j540.begin();
background(255);
_j540.end();
pop();
_j542 = false;
_j545 = [];
_j544 = null;
}
function testMaskRect() {
const cx = width / 2;
const cy = height / 2;
const size = 100;
const x1 = cx - size / 2;
const y1 = cy - size / 2;
_j544 = { x1: x1, y1: y1, x2: x1 + size, y2: y1 + size };
drawMaskRect(x1, y1, x1 + size, y1 + size);
console.log('[Mask] Test rect drawn at center:', x1, y1, size, 'x', size);
}
window.testMaskRect = testMaskRect;
window.clearMask = clearMask;
window.drawMaskRect = drawMaskRect;
window.drawMaskPolygon = drawMaskPolygon;
function _j38() {
_j614.begin();
clear();
background(255);
imageMode(CENTER);
image(_j605, 0, 0);
_j614.end();
_j608.begin();
clear();
shader(_j498);
const _j468 = brushColorMode === 1 ? 1.0 : 0.0;
_j498.setUniform("rect", [0, 0, width * _j493, height * _j493]);
_j498.setUniform("baseTex", _j604);
_j498.setUniform("strokeTex", _j605);
_j498.setUniform("brushColorMode", float(brushColorMode));
_j498.setUniform("brushCategory", _j468);
_j498.setUniform("whiteMaxOpacity", _j504);
_j498.setUniform("hueShift", _j505);
_j498.setUniform("satShift", _j506);
_j498.setUniform("briShift", _j507);
_j498.setUniform("keyBlendMode", keyBlendMode);
_j498.setUniform("useSharpen", useSharpen);
_j498.setUniform("typeMapTex", _j615);
const _j836 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j498.setUniform("canvasBackgroundColor", _j836);
const _j837 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j498.setUniform("customBrushColor", _j837);
_j498.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
_j498.setUniform("useMask", _j542 ? 1.0 : 0.0);
if (_j542) _j498.setUniform("maskTex", _j540);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j608.end();
if (_j501 && _j615) {
_j609.begin();
clear();
imageMode(CENTER);
image(_j608, 0, 0);
_j609.end();
_j608.begin();
clear();
shader(_j501);
_j501.setUniform("rect", [0, 0, width * _j493, height * _j493]);
_j501.setUniform("baseTex", _j615);
_j501.setUniform("strokeTex", _j605);
_j501.setUniform("brushCategory", _j468);
_j501.setUniform("whiteMaxOpacity", _j504);
_j501.setUniform("useMask", _j542 ? 1.0 : 0.0);
if (_j542) _j501.setUniform("maskTex", _j540);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j608.end();
_j615.begin();
clear();
background(0);
imageMode(CENTER);
image(_j608, 0, 0, width, height);
_j615.end();
_j608.begin();
clear();
imageMode(CENTER);
image(_j609, 0, 0);
_j608.end();
}
_j604.begin();
clear();
background(255);
imageMode(CENTER);
image(_j608, 0, 0);
_j604.end();
_j602.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(_j605, 0, 0);
blendMode(BLEND);
_j602.end();
if (_j553 && _j563 && pathPoints.length > 1) {
_j24(_j602);
} else {}
if (typeof gridCommitPrev === 'function') {
try {
gridCommitPrev();
} catch (e) {}
}
_j605.begin();
clear();
background(255, 255, 255);
_j605.end();
_j535 = false;
_j536 = false;
_j557 = 0;
_j537 = false;
_j538 = true;
let _j838 = null;
if (pathPoints.length > 0) {
let _j839 = 0,
_j840 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j839 += pt.x;
_j840 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j356 = _j839 / pathPoints.length;
const _j357 = _j840 / pathPoints.length;
_j562 = {
minX,
maxX,
minY,
maxY,
_j356,
_j357,
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
_j566.push({
points: [...pathPoints],
center: {
x: _j356,
y: _j357
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
_j567++;
if (_j566.length > _j568) {
_j566.shift();
}
_j838 = {
minX: _j562.minX,
maxX: _j562.maxX,
minY: _j562.minY,
maxY: _j562.maxY
};
}
pathPoints = [];
_j563 = false;
_j562 = null;
const _j841 = drawingSeed;
let _j842 = _j838;
if (!_j842 && _j566.length > 0) {
const lastStroke = _j566[_j566.length - 1];
if (lastStroke.bounds) {
_j842 = {
...lastStroke.bounds
};
}
}
if (_j842) {
pendingBugBounds = _j842;
} else {
if (_j566.length > 0) {
const lastStroke = _j566[_j566.length - 1];
if (lastStroke.bounds) {
pendingBugBounds = {
...lastStroke.bounds
};
}
}
}
if (_j561 && _j624) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j843 = false;
if (_j624 && recordingData && recordingData.events) {
let _j844 = 0;
for (let e of recordingData.events) {
const _j853 = e.m || e.type;
if (_j853 === 'mr' || _j853 === 'mouseReleased') {
_j844++;
}
}
const _j845 = _j567;
const _j846 = _j845 >= (_j844 - 12);
_j843 = _j846;
if (_j843) {
const _j847 = crandom.random(0, 1) > 0.1;
if (_j847) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j842 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j842;
}
}
}
} else if (!_j624) {
_j843 = true;
}
if (_j843) {
_j702 = true;
_j703 = strokeSeed;
if (!_j624 && _j842 && !pendingBugBounds) {
pendingBugBounds = _j842;
}
} else {
if (_j842 && !pendingBugBounds) {
pendingBugBounds = _j842;
}
}
randomSeed(_j841);
noiseSeed(_j841);
}
if (typeof gc !== 'undefined') {
gc();
}
_j554 = true;
}
function _j39() {
if (_j537 && !_j538) {
if (_j535 || _j536) {
_j38();
}
}
}
function _j40() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j848 = [];
const _j849 = 20;
let _j850 = _j626;
let _j845 = null;
const offsetX = typeof _j636 !== 'undefined' ? _j636 : 0;
const offsetY = typeof _j637 !== 'undefined' ? _j637 : 0;
const _j851 = 500;
let _j852 = 0;
while (_j848.length < _j849 && _j850 < recordingData.events.length && _j852 < _j851) {
const event = recordingData.events[_j850];
const _j853 = event.m || event.type;
if (_j853 === 'mp' || _j853 === 'mousePressed') {
_j845 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j850,
data: event.strokeData || event.d || {}
};
} else if ((_j853 === 'md' || _j853 === 'mouseDragged') && _j845) {
_j845.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j853 === 'mr' || _j853 === 'mouseReleased') && _j845) {
_j845.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j848.push(_j845);
_j845 = null;
}
_j850++;
_j852++;
}
return _j848;
}
function _j41() {
if (!_j624 || !recordingData.events || recordingData.events.length === 0) {
_j607.clear();
return;
}
const now = millis();
const _j854 =
_j570.lastEventIndex !== _j626 ||
(now - _j570.lastUpdateTime) > _j570.updateInterval;
if (_j854) {
_j570.cachedStrokes = _j40();
_j570.lastEventIndex = _j626;
_j570.lastUpdateTime = now;
}
const _j848 = _j570.cachedStrokes;
_j607.clear();
if (_j848.length === 0) {
return;
}
_j607.push();
const time = millis() * 0.003;
for (let i = 0; i < _j848.length; i++) {
const _j855 = _j848[i];
const path = _j855.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j848.length - 1, 200, 80);
const _j856 = sin(time + i * 0.8) * 0.3 + 1;
const _j857 = _j855.eventIndex * 0.1;
const _j858 = 20;
const _j859 = min(max(floor(path.length / 5), 2), _j858);
const _j860 = [];
for (let s = 0; s < _j859; s++) {
const t = s / (_j859 - 1);
const _j300 = t * (path.length - 1);
const _j861 = floor(_j300);
const _j862 = min(_j861 + 1, path.length - 1);
const _j863 = _j300 - _j861;
const x1 = path[_j861].x;
const y1 = path[_j861].y;
const x2 = path[_j862].x;
const y2 = path[_j862].y;
const t1 = path[_j861].t || 0;
const t2 = path[_j862].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j860.push({
x: lerp(x1, x2, _j863),
y: lerp(y1, y2, _j863),
t: lerp(t1, t2, _j863)
});
}
const _j864 = [];
let _j865 = 0.01;
for (let j = 1; j < _j860.length; j++) {
const dx = _j860[j].x - _j860[j-1].x;
const dy = _j860[j].y - _j860[j-1].y;
const dt = _j860[j].t - _j860[j-1].t;
const _j866 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j864.push(_j866);
if (_j866 > _j865) _j865 = _j866;
}
_j607.noFill();
_j607.strokeCap(ROUND);
for (let j = 1; j < _j860.length; j++) {
const _j784 = constrain(_j864[j-1] / _j865, 0, 1);
const r = Math.round(_j784 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j784 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j784) * 255);
_j607.stroke(r, g, b, 160);
_j607.strokeWeight(1.0);
_j607.line(
_j860[j-1].x, _j860[j-1].y,
_j860[j].x, _j860[j].y
);
}
let _j867 = 0;
for (let j = 0; j < _j860.length - 1; j++) {
_j867 += dist(_j860[j].x, _j860[j].y, _j860[j + 1].x, _j860[j + 1].y);
}
if (isNaN(_j867) || _j867 <= 0 || _j860.length < 2) {
continue;
}
const _j868 = constrain(floor(_j867 / 150), 1, 3);
for (let a = 0; a < _j868; a++) {
_j607.push();
const _j869 = (time * 0.1 + _j857 + a * (1.0 / _j868)) % 1.0;
const _j870 = _j869 * _j867;
let _j871 = 0;
let _j872 = _j860[0].x;
let _j873 = _j860[0].y;
let angle = 0;
for (let j = 0; j < _j860.length - 1; j++) {
const _j874 = dist(_j860[j].x, _j860[j].y, _j860[j + 1].x, _j860[j + 1].y);
if (_j874 <= 0.0001) {
_j872 = _j860[j + 1].x;
_j873 = _j860[j + 1].y;
if (j + 1 < _j860.length - 1) {
angle = atan2(_j860[j + 2].y - _j860[j + 1].y, _j860[j + 2].x - _j860[j + 1].x);
} else {
angle = atan2(_j860[j + 1].y - _j860[j].y, _j860[j + 1].x - _j860[j].x);
}
break;
}
if (_j871 + _j874 >= _j870) {
const _j863 = (_j870 - _j871) / _j874;
const _j875 = isNaN(_j863) || !isFinite(_j863) ? 0 : constrain(_j863, 0, 1);
_j872 = lerp(_j860[j].x, _j860[j + 1].x, _j875);
_j873 = lerp(_j860[j].y, _j860[j + 1].y, _j875);
angle = atan2(_j860[j + 1].y - _j860[j].y, _j860[j + 1].x - _j860[j].x);
break;
}
_j871 += _j874;
}
const _j876 = 200 * (1 - _j869 * 0.5);
_j607.translate(_j872, _j873);
_j607.rotate(angle);
const _j877 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j607.fill(0, 0, 255, _j876);
_j607.noStroke();
_j607.triangle(
0, 0,
-4 * _j877, -2 * _j877,
-4 * _j877, 2 * _j877
);
_j607.stroke(0, 150, 255, _j876);
_j607.strokeWeight(0.3);
_j607.noFill();
_j607.triangle(
0, 0,
-4 * _j877, -2 * _j877,
-4 * _j877, 2 * _j877
);
_j607.pop();
}
const _j878 = path[0];
const _j400 = path[path.length - 1];
_j607.noFill();
_j607.stroke(0, 0, 255, 150);
_j607.strokeWeight(0.8);
_j607.ellipse(_j878.x, _j878.y, 5, 5);
_j607.ellipse(_j400.x, _j400.y, 5, 5);
_j607.noStroke();
_j607.fill(0, 0, 255, 255);
_j607.ellipse(_j878.x, _j878.y, 2, 2);
_j607.ellipse(_j400.x, _j400.y, 2, 2);
if (font) {
_j607.textFont(font);
_j607.noStroke();
const data = _j855.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j879 = _j878.x - 2;
const _j880 = _j878.y + 8;
_j607.textSize(6);
_j607.fill(0, 0, 255, 255);
_j607.textAlign(LEFT, CENTER);
_j607.text('#' + (i + 1), _j879, _j880);
}
}
_j607.pop();
}
function _j42() {
_j603.clear();
_j603.push();
_j603.noFill();
_j603.noStroke();
_j603.rectMode(CENTER);
let _j784 = (width * 0.05) / height;
_j603.rect(0, 0, width * 0.95, height * (1 - _j784));
_j603.translate(-width / 2 - 5, -height / 2 + 20);
_j603.textAlign(LEFT, TOP);
if (font) {
_j603.textFont(font);
}
_j603.textSize(6);
let _j881 = width - 50;
_j603.fill(0, 0, 0, 100);
_j603.noStroke();
let _j882 = [];
let _j266 = _j698;
let _j883 = Math.max(0, _j694.length - _j695 - _j696);
let _j884 = _j694.length;
for (let i = _j883; i < _j884; i++) {
let line = _j694[i];
let _j885 = _j45(line.text, _j881, _j603);
for (let j = 0; j < _j885.length; j++) {
if (_j882.length >= _j695) break;
_j882.push({
type: line.type,
text: _j885[j],
timestamp: line.timestamp
});
}
if (_j882.length >= _j695) break;
}
for (let i = 0; i < _j882.length; i++) {
let line = _j882[i];
let y = _j698 + i * _j699;
if (line.type === 'recording') {
_j603.fill(255, 0, 0, _j700);
} else if (line.type === 'playback') {
_j603.fill(0, _j700);
} else if (line.type === 'system') {
_j603.fill(0, 0, 255, _j700);
} else if (line.type === 'art') {
_j603.fill(0, _j700);
} else {
_j603.fill(0, _j700);
}
_j603.text("--", _j697, y);
_j603.text(line.text, _j697, y);
}
_j44();
_j603.pop();
_j43();
}
function _j43() {
if (window.showStrokeDivider === false) return;
const strokeCount = (typeof _j566 !== 'undefined' && Array.isArray(_j566)) ?
_j566.length :
0;
if (strokeCount === 0) return;
_j603.push();
_j603.resetMatrix();
_j603.translate(0, 0);
const _j886 = hh - 15;
const _j887 = width * 0.98;
const _j888 = -_j887 / 2;
const _j889 = _j887 / 2;
const _j890 = _j889 - _j888;
_j603.stroke(0, 50);
_j603.strokeWeight(1);
_j603.noFill();
_j603.line(_j888, _j886, _j889, _j886);
_j603.strokeWeight(1.2);
_j603.line(_j888, _j886 + 5, _j888, _j886 - 5);
_j603.line(_j889, _j886 + 5, _j889, _j886 - 5);
if (strokeCount > 0) {
const _j891 = _j890 / strokeCount;
_j603.stroke(0, 70);
_j603.strokeWeight(0.7);
for (let i = 1; i < strokeCount; i++) {
const x = _j888 + i * _j891;
_j603.line(x, _j886 - 5, x, _j886);
}
if (font) _j603.textFont(font);
_j603.textAlign(CENTER, CENTER);
_j603.textSize(10);
_j603.fill(0, 50);
_j603.noStroke();
const _j879 = _j889;
const _j880 = _j886 - 15;
_j603.text(strokeCount.toString(), _j879, _j880);
}
_j603.pop();
}
function _j44() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j892 = millis();
const _j421 = _j892 - currentStrokeHighlight.startTime;
const _j893 = 1000;
const _j894 = _j893 * 0.5;
if (_j421 < _j893) {
let alpha = 255;
if (_j421 > _j894) {
const _j895 = (_j421 - _j894) / (_j893 - _j894);
alpha = 255 * (1 - _j895);
}
const gp = currentStrokeHighlight.gridParams;
_j603.push();
_j603.resetMatrix();
_j603.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j392 = 5;
const _j393 = 5;
_j603.stroke(255, 0, 0, alpha);
_j603.strokeWeight(1);
_j603.noFill();
let _j896 = true;
let _j871 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j394 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j394;
let dy = (y2 - y1) / _j394;
let _j395 = 0;
while (_j395 < _j394) {
let _j396 = _j896 ? _j392 : _j393;
let _j397 = min(_j396 - _j871, _j394 - _j395);
if (_j896) {
let startX = x1 + dx * _j395;
let startY = y1 + dy * _j395;
let _j398 = x1 + dx * (_j395 + _j397);
let _j399 = y1 + dy * (_j395 + _j397);
_j603.line(startX, startY, _j398, _j399);
}
_j395 += _j397;
_j871 += _j397;
if (_j871 >= (_j896 ? _j392 : _j393)) {
_j896 = !_j896;
_j871 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j878 = currentStrokeHighlight.points[0];
const _j400 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j603.fill(255, 0, 0, alpha);
_j603.noStroke();
_j603.ellipse(_j878.x, _j878.y, 5, 5);
_j603.fill(255, 0, 0, alpha);
_j603.ellipse(_j400.x, _j400.y, 5, 5);
}
}
const _j356 = (gp.left + gp.right) / 2;
const _j357 = (gp.top + gp.bottom) / 2;
_j603.stroke(0, 0, 200, alpha);
_j603.strokeWeight(1.0);
_j603.noFill();
_j603.rectMode(CORNER);
_j603.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j603.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j45(text, _j1494, _j1484 = null) {
let _j897 = text.split(' ');
let _j759 = [];
let _j898 = '';
for (let i = 0; i < _j897.length; i++) {
let _j899 = _j898 + (_j898 ? ' ' : '') + _j897[i];
let _j900 = _j1484 ? _j1484.textWidth(_j899) : textWidth(_j899);
if (_j900 > _j1494 && _j898) {
_j759.push(_j898);
_j898 = _j897[i];
} else {
_j898 = _j899;
}
}
if (_j898) {
_j759.push(_j898);
}
return _j759;
}
function _j46() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.style.width = (width * 1.0) + 'px';
referenceContainer.style.height = (height * 1.0) + 'px';
_j110('system', 'Reference image size updated', {
Width: (width * 0.8) + 'px',
Height: (height * 0.8) + 'px'
});
}
}
function touchStarted(e) {
if (e && e.touches && e.touches.length > 0) {
var t = e.touches[0];
if (_j47(t.clientX, t.clientY)) {
_j552 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j530 = _j177(mouseX);
_j531 = _j177(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j552) return true;
if (_j541) return true;
_j530 = _j177(mouseX);
_j531 = _j177(mouseY);
return false;
}
function touchEnded() {
if (_j552) {
_j552 = false;
return true;
}
_j552 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j47(clientX, clientY) {
const _j901 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('mask-panel'),
document.getElementById('zen-mode-btn')
];
for (let panel of _j901) {
if (!panel) continue;
const rect = panel.getBoundingClientRect();
if (clientX >= rect.left && clientX <= rect.right &&
clientY >= rect.top && clientY <= rect.bottom) {
return true;
}
}
return false;
}
function _j48() {
if (_j566.length === 0) return null;
const lastStroke = _j566[_j566.length - 1];
if (lastStroke && lastStroke.bounds) {
const _j902 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j902)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j902)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j902)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j902)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j902 = 20;
return {
minX: Math.max(0, (gp.left - _j902)) / width,
minY: Math.max(0, (gp.top - _j902)) / height,
maxX: Math.min(width, (gp.right + _j902)) / width,
maxY: Math.min(height, (gp.bottom + _j902)) / height
};
}
return null;
}
function _j49(blendType, seed = null, _j1495 = false) {
if (!_j502) return;
_j581 = true;
_j582 = blendType;
_j583 = millis();
_j589 = 0;
_j584 = 0;
_j592 = _j1495;
_j586 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j594.seed = _j586 * 0.0001;
}
function _j50() {
if (!_j581) return null;
const duration = millis() - _j583;
const iterations = _j584;
const frames = _j589;
if (iterations > 0 && flowEffectStrokeBounds) {
_j587 = true;
_j588 = {
blendType: _j582,
iterations: iterations,
seed: _j586,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j581 = false;
_j582 = 0;
_j592 = false;
return {
duration,
iterations,
frames
};
}
function _j51() {
if (!_j581) return;
_j589++;
_j584 = Math.floor(_j589 / _j593);
if (_j592 && _j590 > 0) {
if (_j589 >= _j590) {
_j584 = _j591;
const _j903 = document.getElementById('flow-iteration-count');
if (_j903) {
_j903.textContent = _j584;
}
_j50();
_j590 = 0;
_j591 = 0;
return;
}
}
const _j903 = document.getElementById('flow-iteration-count');
if (_j903) {
_j903.textContent = _j584;
}
}
function _j52(blendType, seed, iterations) {
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
_j594.seed = seed * 0.0001;
_j587 = true;
_j588 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j588);
}
const _j904 = [{
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
function _j53(_j1484, _j915, _j916, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j915, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j916, alpha);
}
}
function _j54(_j1484, _j915, _j916, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j915, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j916, alpha);
}
}
function _j55(id, _j1484, _j998, x, y, _j959, _j960, _j952, _j953, _j973, sizeVariation, _j992) {
let _j905 = _j973 * sizeVariation + _j992;
const _j906 = (_j539 && typeof _j551 !== 'undefined' && _j551 !== null) ? _j551 : baseBrushSize;
const _j907 = _j906 < 0.25;
let _j908 = _j907 ? max(2.0, _j906 * 10) : 15;
if (_j905 > _j908) {
_j905 = crandom.random(_j907 ? 0.6 : 1, _j908);
}
let sw = max(_j907 ? 0.6 : 1, _j905);
if (sw < 3) sw *= 2.0;
const offsetX = _j998.offsetX;
const offsetY = _j998.offsetY;
if (brushModeSP) {
const _j909 = max(0.15, min(1.5, _j906));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j910 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j909, 6 * _j909) : crandom.random(-16 * _j909, 16 * _j909);
let _j911 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j909, 6 * _j909) : crandom.random(-16 * _j909, 16 * _j909);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j952,
y + offsetY + _j953,
_j959 + offsetX + _j910,
_j960 + offsetY + _j911
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j952,
y + offsetY + _j953,
_j959 + offsetX,
_j960 + offsetY
);
}
} else if (!brushModeSP) {
if (_j906 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j952,
y + offsetY + _j953,
_j959 + offsetX,
_j960 + offsetY
);
}
}
const _j912 = [{
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
const _j913 = [{
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
const _j914 = [{
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
function _j56(_j1484, _j1496, _j1497) {
if (_j558 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j558, ">=", expectedStrokeLength, ")");
return;
}
_j1484.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j915 = _j59(_j503);
let _j916 = _j59(_j503);
const _j917 = _j624 ? _j630 : pmouseX;
const _j918 = _j624 ? _j631 : pmouseY;
let _j919 = 0.5 * initialSize * noise(_j1496 * 0.01, _j1497 * 0.01) * (abs(_j1496 - _j917) + abs(_j1497 - _j918));
const _j920 = (_j539 && typeof _j551 !== 'undefined' && _j551 !== null) ? _j551 : baseBrushSize;
let _j921 = 0;
_j921 = min(spraySize * _j920, _j919) * map(noise(_j1496, _j1497), 0, 1, 0.3, 1);
let _j922 = max(3, _j921);
if (_j558 < 5) {
let _j923 = map(_j558, 0, 5, -0.2, 1.0);
_j922 = max(2, _j921 * _j923);
} else if (_j558 >= (expectedStrokeLength - 5)) {
let _j924 = map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j922 = max(2, _j921 * _j924);
}
for (let i = 0; i < _j565; i++) {
const _j925 = lerp(_j1496, _j917, i / _j565)
const lerpY = lerp(_j1497, _j918, i / _j565)
for (let j = 0; j < 10; j++) {
let _j910, _j911;
let _j926 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j927 = crandom.random(TWO_PI);
const _j928 = crandom.random();
const _j929 = crandom.random(-_j922 * _j926, _j922 * _j926);
const _j930 = crandom.random(-_j922 * _j926, _j922 * _j926);
if (shapeType === 0) {
const angle = _j927;
const radius = sqrt(_j928) * _j922;
_j910 = radius * cos(angle);
_j911 = radius * sin(angle);
} else if (shapeType === 1) {
_j910 = sin(_j927) * _j929;
_j911 = cos(_j927) * _j930;
} else if (shapeType === 2) {
const u = _j927 / TWO_PI;
const v = _j928;
if (u + v > 1) {
_j910 = _j922 * (1 - u);
_j911 = _j922 * (1 - v);
} else {
_j910 = _j922 * u;
_j911 = _j922 * v;
}
_j910 -= _j922 * 0.5;
_j911 -= _j922 * 0.5;
} else {
const u = _j929 / _j922;
const v = _j930 / _j922;
const _j931 = abs(u) + abs(v);
if (_j931 > 1) {
_j910 = (u / _j931) * _j922;
_j911 = (v / _j931) * _j922;
} else {
_j910 = u * _j922;
_j911 = v * _j922;
}
}
let _j774 = crandom.random(0, 1);
let _j775 = crandom.random(0.2, 1);
let _j932 = crandom.random(1, 2);
let _j933 = _j920 < 0.25 ? 0.1 : 0.3;
_j775 = max(_j933, _j775 * _j920);
_j932 = max(_j933, _j932 * _j920);
let _j934 = crandom.random(100, 255);
let ss = _j774 > 0.1 ? _j775 : _j932;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j935 = _j920 < 0.25 ? max(0.3, _j920 * 3) : 2;
let _j936 = _j920 < 0.25 ? _j920 * 5 : 20;
ss = max(_j935, min(_j936, ss));
_j54(_j1484, _j915, _j916, brushColorMode, _j934);
noStroke();
ellipse(_j925 + _j910, lerpY + _j911, ss, ss)
}
}
pop();
_j1484.end();
}
function _j57(_j1484, _j1496, _j1497, _j793, _j509 = 0, _j1498 = 0) {
if (_j558 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j558, ">=", expectedStrokeLength, ")");
return;
}
_j1484.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j915 = _j59(_j503);
let _j916 = _j59(_j503);
const _j937 = (_j539 && typeof _j551 !== 'undefined' && _j551 !== null) ? _j551 : baseBrushSize;
const _j938 = _j539 ? (_j624 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j549) : -1;
const _j939 = (_j938 >= 0) ? (0.7 + 0.4 * Math.min(_j938 / 0.7, 1.0)) : 1.0;
let _j907 = _j937 < 0.25;
let _j940 = 0.6;
let _j941 = _j907 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j940, baseBrushSize * 2);
let _j942 = max(_j940, baseBrushSize * 1.5);
let _j943 = _j907 ? swFloorTiny : _j942;
if (_j943 < 3) _j943 *= 2.0;
let _j944 = _j907 ?
swFloorTiny :
max(_j940, baseBrushSize * 1.2);
if (_j944 < 3) _j944 *= 2.0;
let _j945;
if (_j907) {
_j945 = max(2.0, _j937 * 10);
} else if (_j937 < 0.5) {
_j945 = 0.7;
} else {
_j945 = 9999;
}
_j526 = _j516 * 0.5;
let _j431 = _j1496;
let _j432 = _j1497;
if (!_j529) {
_j529 = 1;
x = _j431;
y = _j432;
}
_j513 += (_j431 - x) * _j510;
_j514 += (_j432 - y) * _j510;
_j513 *= _j511;
_j514 *= _j511;
let _j946 = sqrt(_j513 * _j513 + _j514 * _j514);
_j515 += _j946 - _j515;
if (baseBrushSize <= 1.0) {
_j515 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j515 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j515 *= 2.0;
} else {
_j515 *= 3.0;
}
_j516 = _j512 - _j515;
let _j947 = brushPaintCtlNoisebyFrame;
let _j948 = 1.0 * baseBrushSize * _j947 * _j939;
let _j949 = 2.0 * baseBrushSize * _j947 * _j939;
let _j950 = 3.0 * baseBrushSize * _j947 * _j939;
let showMainBrush = 0.1;
let _j951 = initialSize;
let _j952 = 0;
let _j953 = 0;
if (_j1498 == 0) showMainBrush = 0.08;
else if (_j1498 == 1) showMainBrush = 0.6;
else if (_j1498 == 2) showMainBrush = 0.2;
let _j954 = 1.0;
let _j955 = _j508 + brushPaintInterpolationOffset;
for (let i = 0; i < _j955; ++i) {
let _j956 = baseBrushSize >= 1.0 ? 5 : 3;
let _j957 = baseBrushSize >= 1.0 ? 2 : 0;
let _j958 = 0;
if (baseBrushSize < 1.5) _j958 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j958 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j958 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j958 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j509 = _j958;
if (_j558 < 5) _j509 = crandom.random(0, 1) > 0.2 ? 5 : _j509;
let _j959 = x;
let _j960 = y;
x += _j513 / _j955;
y += _j514 / _j955;
let _j961 = crandom.random(0, 1);
let _j962 = crandom.random(0, 4);
let _j963 = crandom.random(0, 3);
let _j964 = crandom.random(-1, 1);
let _j965 = crandom.random(-1, 1);
let _j966 = crandom.random(-1, 1);
let _j967 = crandom.random(-1, 1);
let _j968 = showMainBrush;
let _j969 = 1.0;
if (_j509 == 3) {
_j968 *= 0.8;
_j969 *= 0.8;
} else if (_j509 == 4) {
_j968 *= 0.6;
_j969 *= 0.5;
}
if (_j937 < 0.25) {
_j968 = 0.18;
} else if (_j937 < 1.5) {
_j968 = 0.1;
}
_j520 = lerp(_j520, _j516, 0.5);
if (brushMode == 1) {
if (_j961 > 0.8 && _j526 < 2 && i == 0) {
_j526 = _j177(_j962);
}
} else {
_j526 += (_j520 - _j526) * 0.3;
}
let _j970;
if (brushMode == 1) {
_j970 = _j526;
} else {
if (_j558 < 5) {
let _j923 = map(_j558, 0, 5, 0.05, 1.0);
_j970 = max(_j907 ? 0.1 : 0.5, _j526 * _j923);
if (explodeStart) {
_j952 = _j964 * map(_j558, 0, 5, 10, 0);
_j953 = _j965 * map(_j558, 0, 5, 10, 0);
}
} else if (_j558 >= (expectedStrokeLength - 5)) {
let _j924 = map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j970 = max(_j907 ? 0.1 : 0.5, _j526 * _j924);
if (explodeEnd) {
_j952 = _j966 * map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j953 = _j967 * map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j526 > 2) {
_j970 = max(_j907 ? 0.2 : 1, _j526);
} else {
let _j971 = (_j963 / 3) - 0.5;
_j970 = max(_j907 ? 0.1 : 0.5, _j526 + _j971);
}
}
}
let _j972 = _j970;
let _j973 = _j970 * 0.5;
if (_j509 == 3) {
_j972 *= 0.8;
_j973 *= 0.8;
} else if (_j509 == 4) {
_j972 *= 0.5;
_j973 *= 0.5;
}
let _j974 = crandom.random(0, 1);
let _j975 = crandom.random(150, 255);
let _j976 = crandom.random(100, 255);
let _j977 = crandom.random(100, 255);
let _j978 = crandom.random(100, 255);
if (_j907) {
if (!brushModeSP && _j558 > 1) {
_j53(_j1484, _j915, _j916, brushColorMode, _j975);
let kk = min(_j951, max(_j943, _j972));
strokeWeight(min(_j945, kk));
line(x + _j952, y + _j953, _j959, _j960);
}
} else if (_j974 > _j968) {
_j53(_j1484, _j915, _j916, brushColorMode, _j975);
const _j979 = !brushModeSP && _j558 > 3 && baseBrushSize < 4.0;
if (_j972 < 5) {
let kk = 0;
if (_j1498 == 0) kk = 1.5 * min(_j951, max(_j943, _j972));
else kk = min(_j951, max(_j943, _j972));
strokeWeight(min(_j945, kk));
if (_j979) line(x + _j952, y + _j953, _j959, _j960)
} else {
let kk = _j969 * min(_j951, max(_j943, _j972));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j945, kk));
if (_j979) line(x + _j952, y + _j953, _j959, _j960)
}
}
const _j980 = [];
const _j981 = [];
for (let j = 0; j < 30; j++) {
_j980.push(crandom.random(0, 1));
_j981.push(crandom.random(-0.5, 0.5) * _j954);
}
if (_j1498 == 1) {
_j980[0] = _j980[0] * 2.0;
_j980[1] = _j980[1] * 0.5;
_j980[2] = _j980[2] * 0.5;
} else if (_j1498 == 2) {
_j980[0] = _j980[0] * 0.5;
_j980[1] = _j980[1] * 0.5;
_j980[2] = _j980[2] * 0.5;
}
const _j982 = _j904[brushDir];
if (_j509 == 0) {
_j53(_j1484, _j915, _j916, brushColorMode, _j976);
if (_j980[0] > 0.2) {
const _j983 = _j982.flip1stX ? -1 : +1;
const _j984 = _j982.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j981[0], sizeVariation);
if (_j973 * sizeVariation < 5) {
strokeWeight(min(_j945, noise(x * 0.1, y * 0.2) + 1.5 * max(_j944, _j973 * sizeVariation)));
} else {
strokeWeight(min(_j945, _j969 * max(_j941, _j973 * sizeVariation)));
}
line(x + _j983 * _j949 + _j952, y + _j984 * _j949 + _j953, _j959 + _j983 * _j949, _j960 + _j984 * _j949);
}
if (_j980[1] > 0.3) {
const _j985 = _j982.flip1stX ? -1 : +1;
const _j986 = _j982.flip1stY ? +1 : -1;
_j53(_j1484, _j915, _j916, brushColorMode, _j977);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j981[1], sizeVariation);
strokeWeight(min(_j945, _j969 * max(_j941, _j973 * sizeVariation)));
line(x + _j985 * _j949 + _j952, y + _j986 * _j949 + _j953, _j959 + _j985 * _j949, _j960 + _j986 * _j949);
}
} else if (_j509 == 1) {
_j53(_j1484, _j915, _j916, brushColorMode, _j976);
if (_j980[0] > 0.1) {
const _j983 = _j982.flip1stX ? -1 : +1;
const _j984 = _j982.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j981[0], sizeVariation);
strokeWeight(min(_j945, _j969 * max(_j941, _j973 * sizeVariation)));
line(x + _j983 * _j949 + _j952, y + _j984 * _j949 + _j953, _j959 + _j983 * _j949, _j960 + _j984 * _j949)
};
if (_j980[1] > 0.05) {
const _j985 = _j982.flip1stX ? -1 : +1;
const _j986 = _j982.flip1stY ? +1 : -1;
_j53(_j1484, _j915, _j916, brushColorMode, _j977);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j981[1], sizeVariation);
strokeWeight(min(_j945, _j969 * max(_j941, _j973 * sizeVariation)));
line(x + _j985 * _j948 + _j952, y + _j986 * _j948 + _j953, _j959 + _j985 * _j948, _j960 + _j986 * _j948)
};
if (_j980[2] > 0.15) {
const _j987 = -1;
const _j988 = -1;
_j53(_j1484, _j915, _j916, brushColorMode, _j978);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j981[2], sizeVariation);
if (_j973 * sizeVariation < 5) {
strokeWeight(min(_j945, noise(x * 1, y * 2) + 1.5 * max(_j944, _j973 * sizeVariation)));
} else {
strokeWeight(min(_j945, _j969 * max(_j941, _j973 * sizeVariation)));
}
line(x + _j987 * _j950 + _j952, y + _j988 * _j950 + _j953, _j959 + _j987 * _j950, _j960 + _j988 * _j950)
};
} else if (_j509 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j53(_j1484, _j915, _j916, brushColorMode, _j976);
const _j989 = [_j980[0], _j980[1], _j980[2], _j980[3], _j980[4]];
const _j990 = [_j981[3], _j981[4], _j981[5], _j981[6], _j981[7]];
for (let i = 0; i < _j912.length; i++) {
const _j261 = _j912[i];
const _j991 = _j989[i];
const _j992 = _j990[i];
if (_j991 > _j261.randThreshold) {
let _j993;
if (_j261.offsetBase === 1) {
_j993 = _j948;
} else if (_j261.offsetBase === 2) {
_j993 = _j949;
} else if (_j261.offsetBase === 3) {
_j993 = _j950;
} else {
_j993 = _j261.offsetBase * baseBrushSize * _j947;
}
let _j994, _j995;
if (i === 0) {
_j994 = _j982.flip1stX ? -_j261.signX : _j261.signX;
_j995 = _j982.flip1stY ? -_j261.signY : _j261.signY;
} else {
_j994 = _j261.signX;
_j995 = _j261.signY;
}
let _j996 = _j994 * _j993;
let _j997 = _j995 * _j993;
const _j998 = {
offsetX: _j996,
offsetY: _j997,
randThreshold: _j261.randThreshold,
pathProgressEnd: _j261.pathProgressEnd,
jitterIndex: _j261.jitterIndex
};
_j55(
2, _j1484, _j998, x, y, _j959, _j960,
_j952, _j953, _j973, sizeVariation,
_j992
);
}
}
} else if (_j509 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j53(_j1484, _j915, _j916, brushColorMode, _j976);
let _j999 = baseBrushSize * _j947;
if (baseBrushSize > 4.0) _j999 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j913.length; i++) {
let _j1000 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j261 = _j913[i];
const _j991 = _j980[i];
const _j992 = _j981[_j261.jitterIndex];
if (_j991 > _j261.randThreshold) {
const _j1001 = cos(_j261.angle + _j1000) * _j261.radius * _j999;
const _j1002 = sin(_j261.angle + _j1000) * _j261.radius * _j999;
const _j996 = (_j982.flip1stX ? -1 : 1) * _j1001;
const _j997 = (_j982.flip1stY ? -1 : 1) * _j1002;
const _j998 = {
offsetX: _j996,
offsetY: _j997,
randThreshold: _j261.randThreshold,
pathProgressEnd: _j261.pathProgressEnd,
jitterIndex: _j261.jitterIndex
};
_j55(
3, _j1484, _j998, x, y, _j959, _j960,
_j952, _j953, _j973, sizeVariation,
_j992
);
}
}
} else if (_j509 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j53(_j1484, _j915, brushColorMode, _j976);
let _j999 = baseBrushSize * _j947;
if (baseBrushSize > 4.0) _j999 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j914.length; i++) {
let _j1000 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j261 = _j914[i];
const _j991 = _j980[i];
const _j992 = _j981[_j261.jitterIndex];
if (_j991 > _j261.randThreshold) {
const _j1001 = cos(_j261.angle + _j1000) * _j261.radius * _j999;
const _j1002 = sin(_j261.angle + _j1000) * _j261.radius * _j999;
const _j996 = (_j982.flip1stX ? -1 : 1) * _j1001;
const _j997 = (_j982.flip1stY ? -1 : 1) * _j1002;
const _j998 = {
offsetX: _j996,
offsetY: _j997,
randThreshold: _j261.randThreshold,
pathProgressEnd: _j261.pathProgressEnd,
jitterIndex: _j261.jitterIndex
};
_j55(
4, _j1484, _j998, x, y, _j959, _j960,
_j952, _j953, _j973, sizeVariation,
_j992
);
}
}
}
}
pop();
_j1484.end();
}
function _j58(_j1484, _j1496, _j1497, _j1499 = null, _j1500 = null, n = 80, o = 2) {
_j1484.begin();
push();
translate(-hw, -hh);
const _j917 = (_j1499 !== null && _j1500 !== null) ? _j1499 : (_j624 ? _j630 : pmouseX);
const _j918 = (_j1499 !== null && _j1500 !== null) ? _j1500 : (_j624 ? _j631 : pmouseY);
const _j1003 = (_j539 && typeof _j551 !== 'undefined' && _j551 !== null) ? _j551 : baseBrushSize;
const _j1004 = baseBrushSize;
const _j1005 = _j558;
const _j1006 = max(_j1003 < 0.25 ? 0.3 : 1, initialSize - (_j558 * randStep));
o = min(_j1004 * 2.0, 5 * _j1006 * penSketchNoiseBase * map(sin(_j1005 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1496 - _j917) > 0.1 || abs(_j1497 - _j918) > 0.1;
let _j915 = _j59(_j503);
let _j916 = _j59(_j503);
const _j1007 = [];
for (let i = 0; i < n; i++) {
_j1007.push({
t: crandom.random(0, 1),
strokeWeight: max(_j1003 < 0.25 ? 0.1 : 0.3, min(_j1003 < 0.25 ? _j1004 * 5 : 2, _j1004 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j1008 = _j1007[i];
let t = _j1008.t;
strokeWeight(_j1008.strokeWeight);
const angle = _j1008.angle;
const radius = _j1008.radius;
let _j1009 = radius * cos(angle);
let _j1010 = radius * sin(angle);
let _j934 = _j1008.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1496, _j917, t) + _j1009;
y = lerp(_j1497, _j918, t) + _j1010;
} else {
x = _j1496 + _j1009;
y = _j1497 + _j1010;
}
_j53(_j1484, _j915, _j916, brushColorMode, _j934);
if (_j558 > 3) point(x, y);
}
pop();
_j1484.end();
}
if (typeof _j60.lastAngle === 'undefined') {
_j60.lastAngle = 0;
}
if (typeof _j60.lastMovementAngle === 'undefined') {
_j60.lastMovementAngle = 0;
}
const _j1011 = [{
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
function _j59(_j915) {
if (brushColorMode === 0) {
return _j915 + crandom.random(10, 40);
} else {
return _j915 + crandom.random(30, 80);
}
}
function _j60(_j1484, _j1496, _j1497, _j793, _j509 = 0, _j1498 = 0) {
if (_j558 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j558, ">=", expectedStrokeLength, ")");
return;
}
const _j1012 = (_j539 && typeof _j551 !== 'undefined' && _j551 !== null) ? _j551 : baseBrushSize;
let _j907 = _j1012 < 0.25;
let _j945 = _j907 ? _j1012 * 5 : 9999;
_j1484.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j915 = _j59(_j503);
let _j916 = _j59(_j503);
let _j951 = initialSize * 0.3;
let _j431 = _j1496;
let _j432 = _j1497;
if (!_j529) {
_j529 = 1;
x = _j431;
y = _j432;
}
_j513 += (_j431 - x) * _j510;
_j514 += (_j432 - y) * _j510;
_j513 *= _j511;
_j514 *= _j511;
_j515 += sqrt(_j513 * _j513 + _j514 * _j514) - _j515;
_j515 *= 1.2;
if (baseBrushSize <= 1.0) {
_j515 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j515 *= 1.3;
} else {
_j515 *= 1.5;
}
_j516 = _j512 - _j515;
let _j1013 = _j520;
let _j1014 = _j516;
let _j1015 = _j431 - x;
let _j1016 = _j432 - y;
let _j1017 = sqrt(_j1015 * _j1015 + _j1016 * _j1016);
let _j1018 = max(_j907 ? 0.1 : 0.5, _j1014 * 0.5);
let _j1019 = 1.5 * min(_j951, max(_j907 ? 0.5 : 4, _j1018));
let _j1020 = _j1019 * 0.6;
let _j1021 = 0.8;
let _j1022 = max(_j1020 * _j1021, 0.5);
let _j1023 = max(1, ceil(_j1017 / _j1022));
_j1023 = max(10, min(50, _j1023));
let _j1024 = _j1023 / _j508;
let _j952 = 0;
let _j953 = 0;
let _j1025 = min(1.0, _j1017 / 10);
let _j1026 = _j1025 > 0.3;
rectMode(CENTER);
let _j225 = crandom.random(50, 100);
const _j228 = [];
for (let i = 0; i < _j508; ++i) {
_j228.push({
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
for (let i = 0; i < _j508; ++i) {
const _j1027 = _j228[i];
let _j959 = x;
let _j960 = y;
x += _j513 / _j508;
y += _j514 / _j508;
let _j422 = (i + 1) / _j508;
let _j1028 = lerp(_j1013, _j1014, _j422);
_j520 = lerp(_j520, _j1028, 0.5);
_j526 += (_j520 - _j526) * 0.8;
_j526 = max(_j907 ? 0.2 : 1.5, _j526);
let _j970;
let _j964 = _j1027.explodeX1;
let _j965 = _j1027.explodeY1;
let _j966 = _j1027.explodeX2;
let _j967 = _j1027.explodeY2;
if (_j558 < 5) {
let _j923 = map(_j558, 0, 5, 0.05, 1.0);
_j970 = max(_j907 ? 0.1 : 0.5, _j526 * _j923);
if (explodeStart) {
_j952 = _j964 * map(_j558, 0, 5, 10, 0);
_j953 = _j965 * map(_j558, 0, 5, 10, 0);
}
} else if (_j558 >= (expectedStrokeLength - 5)) {
let _j924 = map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j970 = max(_j907 ? 0.1 : 0.5, _j526 * _j924);
if (explodeEnd) {
_j952 = _j966 * map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j953 = _j967 * map(_j558, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j970 = max(_j907 ? 0.1 : 0.5, _j526);
}
let _j974 = _j1027.showMainBrush;
let _j975 = _j1027.mainAlpha;
let showMainBrush = 0.3;
let _j1029 = showMainBrush;
if (_j1024 > 1.0) {
_j1029 = showMainBrush / _j1024;
} else if (_j1024 < 1.0) {
_j1029 = showMainBrush * (2.0 - _j1024);
}
if (_j974 > _j1029 && _j558 > 5) {
noStroke();
_j53(_j1484, _j915, _j916, brushColorMode, _j975);
let ss = min(_j945, 1.2 * min(_j951, max(3 * _j1012, _j970)));
let dx = x - _j959;
let dy = y - _j960;
let distance = sqrt(dx * dx + dy * dy);
let _j267;
const _j314 = 0.1;
if (distance < _j314) {
_j267 = _j60.lastAngle;
} else {
let _j1030 = atan2(dy, dx);
_j267 = _j1030 + PI / 2;
_j60.lastAngle = _j267;
_j60.lastMovementAngle = _j1030;
}
push();
translate(x, y);
rotate(_j267);
let _j1020 = ss * _j1027.rectWidthMult;
rect(0, 0, _j1020, _j1020 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j1025 > 0.9 && _j558 > 5 && _j558 < (expectedStrokeLength - 5)) {
let _j1031 = -sin(_j60.lastMovementAngle);
let _j1032 = cos(_j60.lastMovementAngle);
for (let j = 0; j < _j1011.length; j++) {
let _j1033 = _j1011[j];
let _j1034 = _j1027.flyWhiteRandoms[j];
let _j1035 = _j1033.randThreshold - _j1025 * 0.3;
if (_j1034 > _j1035) {
let offsetX = _j1031 * _j1033.perpOffset * _j1012;
let offsetY = _j1032 * _j1033.perpOffset * _j1012;
stroke(_j225);
strokeWeight(min(_j945, max(_j907 ? 0.1 : 0.5, _j970 * 0.3)));
line(_j959 + offsetX, _j960 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
_j1484.end();
}
let _j1036 = [];
let _j1037 = 0;
function _j61(baseBrushSize, strokeSeed) {
let _j1038, _j1039;
if (baseBrushSize <= 0.1) {
_j1038 = 2;
_j1039 = 4;
} else if (baseBrushSize <= 0.25) {
_j1038 = 4;
_j1039 = 7;
} else if (baseBrushSize <= 0.5) {
_j1038 = 6;
_j1039 = 10;
} else if (baseBrushSize <= 2.0) {
_j1038 = 10;
_j1039 = 15;
} else if (baseBrushSize <= 3.0) {
_j1038 = 20;
_j1039 = 30;
} else {
_j1038 = 30;
_j1039 = 50;
}
let count;
if (_j1038 === _j1039) {
count = _j1038;
} else {
const _j1040 = strokeSeed + 50000;
randomSeed(_j1040);
count = Math.floor(crandom.random(_j1038, _j1039 + 1));
}
const _j1041 = [];
const _j1042 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1043 = _j1042 + i * 1000;
randomSeed(_j1043);
const perpOffset = crandom.random(-6, 6);
const _j1044 = _j1042 + i * 2000 + 1;
randomSeed(_j1044);
const randThreshold = crandom.random(0.5, 1.0);
const _j1045 = _j1042 + i * 3000 + 2;
randomSeed(_j1045);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1046 = _j1042 + i * 4000 + 3;
randomSeed(_j1046);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1047 = _j1042 + i * 5000 + 4;
randomSeed(_j1047);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1048 = _j1042 + i * 6000 + 5;
randomSeed(_j1048);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1049 = _j1042 + i * 7000 + 6;
randomSeed(_j1049);
const endDistanceOffset = crandom.random(0, 8);
const _j1050 = _j1042 + i * 8000 + 7;
randomSeed(_j1050);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1051 = _j1042 + i * 9000 + 8;
randomSeed(_j1051);
const widthVariationFactor = crandom.random(0, 1);
const _j1052 = _j1042 + i * 10000 + 9;
randomSeed(_j1052);
const offsetVariationFactor = crandom.random(0, 1);
_j1041.push({
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
_j1041.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1041;
}
if (typeof _j64.lastAngle === 'undefined') {
_j64.lastAngle = 0;
}
if (typeof _j64.lastMovementAngle === 'undefined') {
_j64.lastMovementAngle = 0;
}
if (typeof _j64.lastStrokeWeights === 'undefined') {
_j64.lastStrokeWeights = {};
}
if (typeof _j64.configCache === 'undefined') {
_j64.configCache = {};
}
function _j62() {
if (typeof _j64 !== 'undefined' && _j64.configCache) {
_j64.configCache = {};
}
if (typeof _j64 !== 'undefined' && _j64.lastStrokeWeights) {
_j64.lastStrokeWeights = {};
}
}
function _j63(_j1484, _j1496, _j1497, _j1499 = null, _j1500 = null) {
if (_j558 >= expectedStrokeLength) {
return;
}
_j1484.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j917 = (_j1499 !== null && _j1500 !== null) ? _j1499 : (_j624 ? _j630 : pmouseX);
const _j918 = (_j1500 !== null && _j1500 !== null) ? _j1500 : (_j624 ? _j631 : pmouseY);
const _j1053 = _j1496 - _j917;
const _j1054 = _j1497 - _j918;
const _j1055 = sqrt(_j1053 * _j1053 + _j1054 * _j1054);
const speedMultiplier = map(constrain(_j1055, 3, 50), 0, 50, 0.1, 5.0);
let _j1056 = 0,
_j1057 = 0;
let _j1058 = 0,
_j1059 = 0;
let _j1060 = 0,
_j1061 = 0;
if (_j1055 > 0.1) {
_j1056 = _j1053 / _j1055;
_j1057 = _j1054 / _j1055;
_j1058 = -_j1057;
_j1059 = _j1056;
_j1060 = _j1057;
_j1061 = -_j1056;
} else {
_j1058 = 0;
_j1059 = 1;
_j1060 = 0;
_j1061 = -1;
}
const _j1062 = _j558 < expectedStrokeLength;
const _j1063 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1064 = strokeSeed + _j558 * 10000 + 1;
randomSeed(_j1064);
const _j1065 = _j1062 ? Math.floor(crandom.random(0, _j1063)) : 0;
for (let i = 0; i < _j1065; i++) {
const _j1066 = strokeSeed + _j558 * 1000 + _j1037;
randomSeed(_j1066);
const _j1067 = crandom.random(5, 15) * baseBrushSize;
const _j1068 = _j1496 + crandom.random(-2, 2) * baseBrushSize;
const _j1069 = _j1497 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1070, _j1071, _j1072;
if (brushColorMode === 0) {
_j1070 = _j1071 = _j1072 = _j503 * 0.3;
} else if (brushColorMode === 1) {
_j1070 = _j1071 = _j1072 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1070 = customBrushColor[0];
_j1071 = customBrushColor[1];
_j1072 = customBrushColor[2];
} else {
const color = _j208[brushColorMode];
if (color && color.rgb) {
_j1070 = color.rgb[0];
_j1071 = color.rgb[1];
_j1072 = color.rgb[2];
} else {
_j1070 = _j1071 = _j1072 = 26;
}
}
const _j1073 = {
id: _j1037++,
location: {
x: _j1068,
y: _j1069
},
prevLocation: {
x: _j1068,
y: _j1069
},
radius: _j1067,
r: _j1070,
g: _j1071,
b: _j1072,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j1036.push(_j1073);
}
const _j1074 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1075 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j1036.length - 1; i >= 0; i--) {
const _j1076 = _j1036[i];
if (_j1076.radius <= 0) {
continue;
}
const _j1077 = strokeSeed + _j558 * 1000 + _j1076.id * 100;
randomSeed(_j1077);
const _j1078 = crandom.random(_j1074, _j1075) * 3.0;
_j1076.radius -= _j1078;
const _j1079 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1080 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1076.xOff += _j1079;
_j1076.yOff += _j1080;
const _j1081 = 2.0 * speedMultiplier;
let _j1082 = 0,
_j1083 = 0;
const _j1084 = crandom.random(0, 1);
const _j1085 = (_j1076.sideDirection !== undefined) ? _j1076.sideDirection : (_j1084 > 0.5 ? 1 : -1);
if (_j1085 === 1) {
_j1082 = _j1060 * _j1081;
_j1083 = _j1061 * _j1081;
} else {
_j1082 = _j1058 * _j1081;
_j1083 = _j1059 * _j1081;
}
const nX = noise(_j1076.location.x) * _j1076.xOff;
const nY = noise(_j1076.location.y) * _j1076.yOff;
if (!_j1076.prevLocation) {
_j1076.prevLocation = {
x: _j1076.location.x,
y: _j1076.location.y
};
} else {
_j1076.prevLocation.x = _j1076.location.x;
_j1076.prevLocation.y = _j1076.location.y;
}
_j1076.location.x += 2.0 * (_j1082 * 0.2 + nX * 0.8);
_j1076.location.y += 2.0 * (_j1083 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1086 = noise(_j1076.location.x * 0.01, _j1076.location.y * 0.01) * 5;
_j1076.r = constrain(_j1076.r + _j1086, 0, 255);
_j1076.g = constrain(_j1076.g + _j1086, 0, 255);
_j1076.b = constrain(_j1076.b + _j1086, 0, 255);
} else if (brushColorMode == 0) {
const _j1086 = noise(_j1076.location.x * 0.01, _j1076.location.y * 0.01) * 2;
_j1076.r = constrain(_j1076.r + _j1086, 0, 200);
_j1076.g = constrain(_j1076.g + _j1086, 0, 200);
_j1076.b = constrain(_j1076.b + _j1086, 0, 200);
}
const _j1087 = crandom.random(0, 1) > 0.2;
const _j1088 = crandom.random(0, 1) > 0.99;
if (_j1076.radius > 0) {
stroke(_j1076.r, _j1076.g, _j1076.b, 200);
strokeWeight(max(1, _j1076.radius * 0.5));
if (_j1087) {
line(_j1076.prevLocation.x, _j1076.prevLocation.y, _j1076.location.x, _j1076.location.y);
}
if (_j1088) {
_j1076.radius = -1;
}
} else {
_j1076.radius = -1;
}
}
const _j1089 = _j1036.length;
let _j1090 = 0;
for (let i = 0; i < _j1036.length; i++) {
if (_j1036[i].radius > 0) {
if (_j1090 !== i) {
_j1036[_j1090] = _j1036[i];
}
_j1090++;
}
}
_j1036.length = _j1090;
const _j1091 = _j1036.length;
if (window.DEBUG_MODE && _j1089 > _j1091) {
const _j1092 = _j1089 - _j1091;
if (_j1092 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1092} dead particles removed (${_j1089} → ${_j1091})`);
}
}
pop();
_j1484.end();
}
function _j64(_j1484, _j1496, _j1497, _j793, _j509 = 0, _j1498 = 0) {
if (_j558 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j558, ">=", expectedStrokeLength, ")");
return;
}
_j1484.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j915 = _j59(_j503);
let _j951 = initialSize * 0.3;
const _j1093 = (_j539 && typeof _j551 !== 'undefined' && _j551 !== null) ? _j551 : baseBrushSize;
let _j431 = _j1496;
let _j432 = _j1497;
if (!_j529) {
_j529 = 1;
x = _j431;
y = _j432;
}
_j513 += (_j431 - x) * _j510;
_j514 += (_j432 - y) * _j510;
_j513 *= _j511;
_j514 *= _j511;
_j515 += sqrt(_j513 * _j513 + _j514 * _j514) - _j515;
_j515 *= 0.7;
_j516 = _j512 - _j515;
let _j1013 = _j520;
let _j1014 = _j516;
let _j1015 = _j431 - x;
let _j1016 = _j432 - y;
let _j1017 = sqrt(_j1015 * _j1015 + _j1016 * _j1016);
const _j1094 = _j1093;
const _j1095 = _j1094 < 0.25;
const _j1096 = _j1094 < 1.0;
let _j1018 = max(_j1095 ? 0.05 : (_j1096 ? _j1094 * 0.5 : 0.5), _j1014 * 0.5);
let _j1019 = 1.5 * min(_j951, max(_j1096 ? _j1094 * 4 : 4, _j1018));
let _j1020 = _j1019 * 0.6;
let _j1021 = 0.8;
let _j1022 = max(_j1020 * _j1021, 0.5);
let _j1023 = max(1, ceil(_j1017 / _j1022));
_j1023 = max(10, min(50, _j1023));
let _j1024 = _j1023 / _j508;
let _j952 = 0;
let _j953 = 0;
let _j1025 = min(1.0, _j1017 / 10);
let _j1026 = _j1025 > 0.3;
rectMode(CENTER);
let _j225 = crandom.random(30, 70);
const _j1097 = `flyBrush_${_j1093}_${strokeSeed}`;
let _j1098;
if (_j64.configCache[_j1097]) {
_j1098 = _j64.configCache[_j1097];
} else {
_j1098 = _j61(_j1093, strokeSeed);
_j64.configCache[_j1097] = _j1098;
}
const _j1099 = map(_j225, 30, 70, 0, _j1098.length);
const _j1100 = _j1098.length;
const _j1101 = 40;
const _j228 = [];
for (let i = 0; i < _j508; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1101; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1102 = _j558 * 0.08 + j * 0.15;
const _j1103 = _j558 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1102, _j1103));
const _j1104 = _j558 * 0.1 + j * 0.1;
const _j1105 = _j558 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1104, _j1105));
}
_j228.push({
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
for (let i = 0; i < _j508; ++i) {
const _j1027 = _j228[i];
let _j959 = x;
let _j960 = y;
x += _j513 / _j508;
y += _j514 / _j508;
let _j422 = (i + 1) / _j508;
let _j1028 = lerp(_j1013, _j1014, _j422);
_j520 = lerp(_j520, _j1028, 0.5);
_j526 += (_j520 - _j526) * 0.8;
_j526 = max(_j1096 ? _j1094 * 1.5 : 1.5, _j526);
let _j970;
_j970 = max(_j1095 ? _j1094 * 0.5 : (_j1096 ? _j1094 : 0.5), _j526);
let dx = x - _j959;
let dy = y - _j960;
let distance = sqrt(dx * dx + dy * dy);
let _j1030;
const _j314 = 0.1;
if (distance < _j314) {
_j1030 = _j64.lastMovementAngle;
} else {
_j1030 = atan2(dy, dx);
let _j267 = _j1030 + PI / 2;
_j64.lastAngle = _j267;
_j64.lastMovementAngle = _j1030;
}
let _j974 = _j1027.showMainBrush;
let _j975 = _j1027.mainAlpha;
let showMainBrush = 0.3;
let _j1029 = showMainBrush;
if (_j1024 > 1.0) {
_j1029 = showMainBrush / _j1024;
} else if (_j1024 < 1.0) {
_j1029 = showMainBrush * (2.0 - _j1024);
}
let _j1031 = -sin(_j1030);
let _j1032 = cos(_j1030);
const _j1106 = max(_j1095 ? _j1094 * 0.4 : (_j1096 ? _j1094 * 0.5 : 0.5), _j512 * 0.5);
const _j1107 = _j515 * 0.5;
const _j1108 = _j558 < (expectedStrokeLength - 5);
const _j1109 = _j558 >= (expectedStrokeLength - 5);
const _j1110 = _j1109 ? 0.7 : 1.0;
const _j1111 = _j558 >= expectedStrokeLength;
let _j1112, _j1113, _j1114, _j1115, _j1116;
if (_j1109) {
_j1112 = expectedStrokeLength - 5;
_j1113 = _j558 - _j1112;
_j1114 = min(1.0, _j1113 / 5.0);
_j1115 = cos(_j1030);
_j1116 = sin(_j1030);
}
for (let j = 0; j < _j1098.length; j++) {
let _j1033 = _j1098[j];
const _j1117 = _j558 >= _j1033.startOffset;
if (!_j1117 || _j1111) {
continue;
}
let _j1034 = _j1027.flyWhiteRandoms[j];
let _j1035 = _j1033.randThreshold * _j1110;
if (_j1034 > _j1035) {
const _j1118 = _j1027.flyWhiteOffsetNoises[j];
const _j999 = map(_j1118, 0, 1, 1.0, 2.0);
const _j1119 = 1.0 + (_j999 - 1.0) * _j1033.offsetVariationFactor;
const _j1120 = _j1096 ? max(0.3, _j1094 * 3) : _j1094;
const _j1121 = _j1033.perpOffset * _j1120 * _j1119;
let offsetX = _j1031 * _j1121;
let offsetY = _j1032 * _j1121;
let _j265 = x;
let _j266 = y;
let _j1122 = _j959;
let _j1123 = _j960;
if (_j1109) {
const _j1124 = _j1033.endDistanceOffset * _j1114 * _j1093;
const _j1125 = _j1115 * _j1124;
const _j1126 = _j1116 * _j1124;
_j265 = x + _j1125;
_j266 = y + _j1126;
if (_j1113 === 0) {
_j1122 = _j959;
_j1123 = _j960;
} else {
const _j1127 = min(1.0, (_j1113 - 1) / 5.0);
const _j1128 = _j1033.endDistanceOffset * _j1127 * _j1093;
const _j1129 = _j1115 * _j1128;
const _j1130 = _j1116 * _j1128;
_j1122 = x + _j1129;
_j1123 = y + _j1130;
}
}
const _j1131 = _j1107 * _j1033.brushSpeedMultiplier * _j1033.speedMultiplier;
const _j1132 = max(_j1095 ? _j1094 * 0.3 : (_j1096 ? _j1094 * 0.3 : 0.5), _j1106 - _j1131);
const _j1133 = _j1132 * 0.6;
const _j1134 = _j1027.flyWhiteWidthNoises[j];
const _j1135 = map(_j1134, 0, 1, 0.8, 1.2);
const _j1136 = 1.0 + (_j1135 - 1.0) * _j1033.widthVariationFactor;
let _j1137 = max(0, map(j, 0, _j1098.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1137) + random(-50, 50);
stroke(_j915, kk);
const _j1138 = _j1133 * _j1033.sizeMultiplier * _j1136;
const _j1139 = max(1, _j1138);
const _j1140 = `${_j1097}_${j}`;
let _j1141 = _j64.lastStrokeWeights[_j1140];
if (typeof _j1141 === 'undefined') {
_j1141 = _j1139;
}
const _j1142 = _j1141;
let _j1143;
if (_j1142 < 3.0) {
_j1143 = 0.15;
} else if (_j1142 >= 5.0) {
_j1143 = 0.3;
} else {
const t = (_j1142 - 3.0) / (5.0 - 3.0);
_j1143 = lerp(0.15, 0.3, t);
}
const _j1144 = lerp(_j1141, _j1139, _j1143);
_j64.lastStrokeWeights[_j1140] = _j1144;
strokeWeight(_j1144);
line(_j1122 + offsetX, _j1123 + offsetY, _j265 + offsetX, _j266 + offsetY);
}
}
}
pop();
_j1484.end();
}
let _j1145 = null;
function _j65() {
if (_j1145) return _j1145;
_j1145 = {
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
return _j1145;
}
function _j66(key) {
if (!_j1145) {
_j65();
}
return _j1145[key];
}
function _j67(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j66('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j675.x = e.clientX - rect.left - rect.width / 2;
_j675.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j68(e) {
if (!isDragging) return;
const overlay = _j66('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j675.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j675.y) / window.innerHeight) * 100;
_j676.x = x;
_j676.y = y;
_j70(overlay, _j676, _j73);
}
function _j69() {
if (!isDragging) return;
isDragging = false;
const overlay = _j66('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j70(overlay, _j676, _j73);
}
_j109();
}
function _j70(panel, pos, _j1501) {
if (!panel) return;
_j1501();
const _j1146 = panel.querySelector('.control-btn');
if (!_j1146) return;
const rect = _j1146.getBoundingClientRect();
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
_j1501();
}
}
function _j71(_j1502) {
if (!_j1502) return;
const _j901 = [
document.getElementById('message-overlay'),
_j66('controlPanel'),
_j66('effectControlPanel'),
_j66('flowEffectPanel'),
_j66('maskPanel')
];
_j901.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1502.classList.add('panel-front');
}
function _j72() {
const _j901 = [
document.getElementById('message-overlay'),
_j66('controlPanel'),
_j66('effectControlPanel'),
_j66('flowEffectPanel'),
_j66('maskPanel')
];
_j901.forEach(panel => {
if (!panel) return;
panel.addEventListener('mousedown', () => _j71(panel));
panel.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) _j71(panel);
}, {
passive: true
});
});
}
function _j73() {
const overlay = _j66('messageOverlay');
if (!overlay) return;
overlay.style.left = _j676.x + '%';
overlay.style.top = _j676.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j74(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j677 = true;
const panel = _j66('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j678.x = e.clientX - rect.left - rect.width / 2;
_j678.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j75(e) {
if (!_j677) return;
const panel = _j66('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j678.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j678.y) / window.innerHeight) * 100;
_j679.x = x;
_j679.y = y;
_j70(panel, _j679, _j77);
}
function _j76(e) {
if (!_j677) return;
_j677 = false;
const panel = _j66('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j70(panel, _j679, _j77);
_j109();
}
function _j77() {
const panel = _j66('controlPanel');
if (!panel) return;
panel.style.left = _j679.x + '%';
panel.style.top = _j679.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j78(e) {
if (e.target.closest('.control-btn')) return;
_j681 = true;
const panel = _j66('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j682.x = e.clientX - rect.left - rect.width / 2;
_j682.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j79(e) {
if (!_j681) return;
const panel = _j66('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j682.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j682.y) / window.innerHeight) * 100;
_j683.x = x;
_j683.y = y;
_j70(panel, _j683, _j81);
}
function _j80(e) {
if (!_j681) return;
_j681 = false;
const panel = _j66('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j70(panel, _j683, _j81);
_j109();
}
function _j81() {
const panel = _j66('effectControlPanel');
if (!panel) return;
panel.style.left = _j683.x + '%';
panel.style.top = _j683.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j82(e) {
if (e.target.closest('.control-btn')) return;
_j685 = true;
const panel = _j66('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j686.x = e.clientX - rect.left - rect.width / 2;
_j686.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j83(e) {
if (!_j685) return;
const panel = _j66('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j686.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j686.y) / window.innerHeight) * 100;
_j687.x = x;
_j687.y = y;
_j70(panel, _j687, _j85);
}
function _j84(e) {
if (!_j685) return;
_j685 = false;
const panel = _j66('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j70(panel, _j687, _j85);
_j109();
}
function _j85() {
const panel = _j66('flowEffectPanel');
if (!panel) return;
panel.style.left = _j687.x + '%';
panel.style.top = _j687.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j86(e) {
if (e.target.closest('.control-btn') || e.target.closest('.toggle-label')) return;
_j689 = true;
const panel = _j66('maskPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j690.x = e.clientX - rect.left - rect.width / 2;
_j690.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j87(e) {
if (!_j689) return;
const panel = _j66('maskPanel');
if (!panel) return;
const x = ((e.clientX - _j690.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j690.y) / window.innerHeight) * 100;
_j691.x = x;
_j691.y = y;
_j70(panel, _j691, _j89);
}
function _j88(e) {
if (!_j689) return;
_j689 = false;
const panel = _j66('maskPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j70(panel, _j691, _j89);
_j109();
}
function _j89() {
const panel = _j66('maskPanel');
if (!panel) return;
panel.style.left = _j691.x + '%';
panel.style.top = _j691.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j90() {
const _j1147 = document.getElementById('mask-rect-btn');
const _j1148 = document.getElementById('mask-poly-btn');
if (_j1147) _j1147.classList.toggle('active', _j543 === 'rect');
if (_j1148) _j1148.classList.toggle('active', _j543 === 'polygon');
}
function _j91() {
const _j1149 = document.getElementById('mask-status');
if (!_j1149) return;
if (_j541) {
_j1149.textContent = _j543 === 'rect' ? 'Draw rect mask' : 'Click to add points, press Polygon again to close';
} else if (_j542) {
_j1149.textContent = 'Mask active';
} else {
_j1149.textContent = 'No mask';
}
const c = document.querySelector('canvas');
if (c) {
c.classList.toggle('mask-cursor', _j541);
}
}
function _j92() {
return _j66('controlPanel');
}
let _j1150 = {};
let _j1151 = {
hint: null,
startX: 0,
startY: 0,
offsetX: 0,
offsetY: 0,
isDragging: false,
hasMoved: false,
lastDragTime: 0
};
function _j93() {
return Date.now() - _j1151.lastDragTime < 200;
}
function _j94(hint, _j1503) {
const button = document.getElementById(_j1503);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j95(e, hint) {
const rect = hint.getBoundingClientRect();
_j1151.hint = hint;
_j1151.startX = e.clientX;
_j1151.startY = e.clientY;
_j1151.offsetX = e.clientX - rect.left;
_j1151.offsetY = e.clientY - rect.top;
_j1151.isDragging = true;
_j1151.hasMoved = false;
}
function _j96(e) {
if (!_j1151.isDragging || !_j1151.hint) return;
const dx = Math.abs(e.clientX - _j1151.startX);
const dy = Math.abs(e.clientY - _j1151.startY);
if (dx > 5 || dy > 5) {
_j1151.hasMoved = true;
_j1151.hint.style.transition = 'none';
}
if (_j1151.hasMoved) {
const x = e.clientX - _j1151.offsetX;
const y = e.clientY - _j1151.offsetY;
_j1151.hint.style.left = x + 'px';
_j1151.hint.style.top = y + 'px';
}
}
function _j97(e) {
if (!_j1151.isDragging || !_j1151.hint) return;
const hint = _j1151.hint;
if (_j1151.hasMoved) {
_j1150[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1150));
hint.style.transition = '';
_j1151.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1151.hint = null;
_j1151.isDragging = false;
_j1151.hasMoved = false;
}
function _j98() {
const _j1152 = localStorage.getItem('hintPositions');
if (_j1152) {
_j1150 = JSON.parse(_j1152);
}
}
function _j99() {
const _j1153 = [{
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
_j1153.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j95(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1154 = e.touches[0];
_j95({
clientX: _j1154.clientX,
clientY: _j1154.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j96);
document.addEventListener('mouseup', _j97);
document.addEventListener('touchmove', (e) => {
if (_j1151.isDragging && e.touches.length === 1) {
_j96({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1151.hasMoved) e.preventDefault();
}
}, {
passive: false
});
document.addEventListener('touchend', (e) => {
_j97({
preventDefault: () => {},
stopPropagation: () => {}
});
});
}
function _j100() {
_j98();
const _j901 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j672
}, {
panel: _j66('controlPanel'),
hint: _j66('brushHint'),
button: 'toggle-control-panel',
visible: _j680
}, {
panel: _j66('effectControlPanel'),
hint: _j66('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j684
}, {
panel: _j66('flowEffectPanel'),
hint: _j66('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j688
}, {
panel: _j66('maskPanel'),
hint: _j66('maskHint'),
button: 'toggle-mask-panel',
visible: _j692
}];
_j901.forEach(({
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
_j94(hint, button);
panel.style.display = 'none';
panel.style.opacity = '';
panel.style.pointerEvents = '';
});
}
});
}
function _j101() {
_j680 = !_j680;
const panel = _j92();
const brushHint = _j66('brushHint');
if (!panel) return;
if (_j680) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (brushHint) {
brushHint.classList.add('hidden');
}
} else {
if (brushHint) {
_j94(brushHint, 'toggle-control-panel');
brushHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j680) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j680.toString());
}
function _j102() {
_j684 = !_j684;
const panel = _j66('effectControlPanel');
const effectHint = _j66('effectHint');
if (!panel) return;
if (_j684) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (effectHint) {
effectHint.classList.add('hidden');
}
} else {
if (effectHint) {
_j94(effectHint, 'toggle-effect-control-panel');
effectHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j684) {
panel.style.display = 'none';
}
}, 300);
}
_j107();
}
function _j103() {
_j688 = !_j688;
const panel = _j66('flowEffectPanel');
const flowHint = _j66('flowHint');
if (!panel) return;
if (_j688) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (flowHint) {
flowHint.classList.add('hidden');
}
} else {
if (flowHint) {
_j94(flowHint, 'toggle-flow-effect-panel');
flowHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j688) {
panel.style.display = 'none';
}
}, 300);
}
_j107();
}
function _j104() {
_j692 = !_j692;
const panel = _j66('maskPanel');
const maskHint = _j66('maskHint');
if (!panel) return;
if (_j692) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (maskHint) {
maskHint.classList.add('hidden');
}
} else {
if (maskHint) {
_j94(maskHint, 'toggle-mask-panel');
maskHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j692) {
panel.style.display = 'none';
}
}, 300);
}
_j107();
}
function _j105() {
const _j1155 = _j66('screenTextToggle');
if (_j1155) {
screenText = _j1155.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j141();
}
_j110('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j106() {
const _j1156 = localStorage.getItem('controlPanelVisible');
if (_j1156 !== null) {
_j680 = _j1156 === 'true';
}
const _j1157 = localStorage.getItem('effectControlPanelVisible');
if (_j1157 !== null) {
_j684 = _j1157 === 'true';
}
const _j1158 = localStorage.getItem('flowEffectPanelVisible');
if (_j1158 !== null) {
_j688 = _j1158 === 'true';
}
}
function _j107() {
localStorage.setItem('controlPanelVisible', _j680);
localStorage.setItem('effectControlPanelVisible', _j684);
localStorage.setItem('flowEffectPanelVisible', _j688);
localStorage.setItem('maskPanelVisible', _j692);
}
function _j108() {
const _j1159 = localStorage.getItem('overlayPosition');
const _j1160 = localStorage.getItem('controlPanelPosition');
const _j1161 = localStorage.getItem('effectControlPanelPosition');
const _j1162 = localStorage.getItem('flowEffectPanelPosition');
if (_j1159) {
_j676 = JSON.parse(_j1159);
}
if (_j1160) {
_j679 = JSON.parse(_j1160);
}
if (_j1161) {
_j683 = JSON.parse(_j1161);
}
if (_j1162) {
_j687 = JSON.parse(_j1162);
}
const _j1163 = localStorage.getItem('maskPanelPosition');
if (_j1163) {
_j691 = JSON.parse(_j1163);
}
const _j1164 = localStorage.getItem('maskPanelVisible');
if (_j1164 !== null) {
_j692 = _j1164 === 'true';
}
}
function _j109() {
localStorage.setItem('overlayPosition', JSON.stringify(_j676));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j679));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j683));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j687));
localStorage.setItem('maskPanelPosition', JSON.stringify(_j691));
}
function _j110(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1165 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1165[type] || '⚙️';
if (Object.keys(data).length > 0) {} else {}
if (typeof screenText !== 'undefined' && screenText) {
_j111(type, message, data);
}
}
function _j111(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1165 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1165[type] || '⚙️';
let _j1166 = '';
if (Object.keys(data).length > 0) {
_j1166 = ' ' + JSON.stringify(data);
}
const _j1167 = `${icon} [${timestamp}] ${message}${_j1166}`;
_j694.push({
type: type,
text: _j1167,
timestamp: timestamp
});
if (_j694.length >= _j701) {
_j694 = [];
_j696 = 0;
}
}
function _j112(type, message, data, timestamp, icon) {
const _j1168 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j673.push(_j1168);
if (_j673.length > _j674) {
_j673.shift();
}
_j113();
}
function _j113() {
const _j1169 = _j66('messageContainer');
if (!_j1169) return;
_j1169.innerHTML = '';
_j673.forEach(_j1506 => {
const _j1170 = _j139(_j1506);
_j1169.appendChild(_j1170);
});
_j1169.scrollTop = _j1169.scrollHeight;
}
function _j114() {
const _j1171 = recordingData.events.length > 0;
const _j1172 = `${_j616}-${_j624}-${_j1171}`;
if (_j1172 === _j1178) {
return;
}
_j1178 = _j1172;
const recordBtn = _j66('recordBtn');
const stopBtn = _j66('stopBtn');
const playBtn = _j66('playBtn');
const loadBtn = _j66('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j616) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j624) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1171) {
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
let _j1173 = false;
let _j1174 = -1;
let _j1175 = 0;
const _j1176 = 100;
let _j1177 = -1;
let _j1178 = null;
function _j115(_j1344) {
const _j1179 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j110('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1179.onload = (e) => {
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
_j1173 = true;
_j110('system', '📷 Reference image loaded', {
Status: 'Tracing mode ON',
FileName: _j1344.name,
FileSize: (_j1344.size / 1024).toFixed(2) + ' KB',
Opacity: '50%',
Size: width + 'x' + height + 'px'
});
};
referenceImage.onerror = () => {
_j110('system', '❌ Failed to load image', {
Status: 'Error',
FileName: _j1344.name
});
};
};
_j1179.onerror = () => {
_j110('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1344.name
});
};
_j1179.readAsDataURL(_j1344);
}
function _j116() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1180 = referenceImage.src;
const _j1181 = _j1180 && _j1180 !== '' &&
(_j1180.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1181) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1173 = true;
_j110('system', 'Reference image shown', {
Status: 'Tracing mode ON',
Opacity: '30%'
});
} else {
_j110('system', 'No image loaded', {
Status: 'Please load an image first'
});
}
}
}
function _j117() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1173 = false;
_j110('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j118() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j170('💾 Canvas Saved as PNG');
}
function _j119(_j1220) {
_j521 = _j1220;
switch (_j1220) {
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
if (typeof _j551 !== 'undefined') _j551 = baseBrushSize;
_j120();
_j132();
_j110('ui', 'Brush size changed', {
Mode: _j1220.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j120() {
const _j1182 = document.querySelectorAll('.brush-size-btn');
if (_j1182.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1182.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j521) {
btn.classList.add('active');
}
});
}
function _j121(mode) {
brushMode = parseInt(mode);
_j123();
_j132();
_j110('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j122(mode)
});
}
function _j122(mode) {
const _j1183 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1183[mode] || 'Unknown mode';
}
function _j123() {
const _j1182 = document.querySelectorAll('.brush-mode-btn');
if (_j1182.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1182.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j124(effect) {
const _j1184 = parseInt(effect);
const _j1185 = useSharpen;
_j110('ui', '🎨 Ink effect switching', {
From: _j1185,
To: _j1184,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1184;
if (typeof _j522 !== 'undefined') {
_j522 = _j1185;
}
_j127();
_j132();
const _j1186 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j110('ui', '✨ Ink effect changed', {
Effect: _j1186[_j1184] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j125(mode) {
const _j1187 = parseInt(mode);
if (_j1187 === 3) {
window.spectral = true;
} else {
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1187;
}
window.spectral = false;
}
_j126();
const _j1188 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken',
3: 'Spectral'
};
_j110('ui', '🎨 BlendMode changed', {
Mode: _j1188[_j1187] || 'Unknown'
});
}
function _j126() {
const _j1182 = document.querySelectorAll('.blendmode-btn');
if (_j1182.length === 0) {
return;
}
const _j1189 = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
_j1182.forEach(btn => {
const _j1187 = parseInt(btn.dataset.mode);
if (_j1189 && _j1187 === 3) {
btn.classList.add('active');
} else if (!_j1189 && _j1187 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j127() {
const _j1182 = document.querySelectorAll('.ink-effect-btn');
if (_j1182.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1182.forEach(btn => {
btn.classList.remove('active');
const _j1184 = parseInt(btn.dataset.effect);
const _j1190 = _j1184;
if (_j1190 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j128(color) {
whiteBrushMode = (color === 'white');
const _j1191 = {
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
brushColorMode = _j1191[color] !== undefined ? _j1191[color] : 0;
_j129();
_j132();
const _j1192 = {
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
const _j1193 = _j8(color);
if (_j1193) {
const _j1194 = document.getElementById('custom-brush-color');
const _j1195 = document.getElementById('custom-brush-color-text');
if (_j1194) _j1194.value = _j1193.hex;
if (_j1195) _j1195.value = _j1193.displayName + ' ' + _j1193.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1193.rgb[0];
customBrushColor[1] = _j1193.rgb[1];
customBrushColor[2] = _j1193.rgb[2];
}
}
}
_j110('ui', '🎨 Brush color changed', {
Color: _j1192[color] || color,
Mode: `${_j1192[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j129() {
const _j1196 = document.querySelectorAll('.brush-color-btn');
const _j1197 = document.querySelectorAll('.color-swatch');
if (_j1196.length === 0 && _j1197.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1198 = {
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
const _j1199 = (brushColorMode === 33);
const _j1200 = _j1199 ? null : (_j1198[brushColorMode] || 'black');
_j1196.forEach(btn => {
btn.classList.remove('active');
if (!_j1199 && btn.dataset.color === _j1200) {
btn.classList.add('active');
}
});
_j1197.forEach(btn => {
btn.classList.remove('active');
if (!_j1199 && btn.dataset.color === _j1200) {
btn.classList.add('active');
}
});
}
function _j130(_j1226) {
_j564 = parseInt(_j1226);
_j131();
_j132();
const _j1201 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j110('ui', '🔄 Path rotation changed', {
Mode: _j1226,
Range: _j1201[_j1226] || 'Unknown'
});
}
function _j131() {
const _j1182 = document.querySelectorAll('.path-rotation-btn');
if (_j1182.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1182.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j564) {
btn.classList.add('active');
}
});
}
function _j132() {
const _j1202 = document.getElementById('current-brush-mode');
if (_j1202) {
_j1202.textContent = brushMode;
}
const _j1203 = document.getElementById('current-brush-size');
if (_j1203) {
const _j1204 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1203.textContent = _j1204[_j521] || 'M';
}
const _j1205 = document.getElementById('current-ink-effect');
if (_j1205) {
const _j1206 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1205.textContent = _j1206[useSharpen] || 'MIX';
}
const _j1207 = document.getElementById('current-brush-color');
if (_j1207) {
const _j1208 = {
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
_j1207.textContent = _j1208[brushColorMode] || 'Black';
}
}
function _j133() {
brushMode = 1;
_j521 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j564 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j123();
_j120();
_j127();
_j129();
_j131();
_j126();
_j132();
_j110('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j134(_j1504, _j1505) {
if (!_j1504) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1209 = 300;
_j1504.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1210 = window._elementLastTriggerTime.get(_j1504) || 0;
if (now - _j1210 < _j1209) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1504, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1504);
}, _j1209);
window._elementLastTriggerTime.set(_j1504, now);
e.stopPropagation();
e.preventDefault();
_j1505(e);
}, {
passive: false
});
_j1504.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1504)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1210 = window._elementLastTriggerTime.get(_j1504) || 0;
if (now - _j1210 < _j1209) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1504, now);
e.stopPropagation();
e.preventDefault();
_j1505(e);
});
_j1504.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j135() {
const _j1211 = document.getElementById('canvas-background-color');
const _j1212 = document.getElementById('canvas-background-color-text');
if (!_j1211 || !_j1212) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1213 = `#${r}${g}${b}`.toUpperCase();
_j1211.value = _j1213;
_j1212.value = _j1213;
}
}
function _j136() {
const _j1214 = document.getElementById('canvas-width');
const _j1215 = document.getElementById('canvas-height');
if (!_j1214 || !_j1215) {
return;
}
if (typeof _j491 !== 'undefined' && typeof _j492 !== 'undefined') {
_j1214.value = _j491;
_j1215.value = _j492;
}
}
function _j137() {
const _j1216 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1217 = _j1216 === 'collector';
if (_j1217) {
const controlPanel = _j66('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1218 = document.querySelectorAll('.brush-mode-btn');
_j1218.forEach(btn => {
_j134(btn, () => {
const mode = btn.dataset.mode;
_j121(mode);
});
});
const _j1219 = document.querySelectorAll('.brush-size-btn');
_j1219.forEach(btn => {
_j134(btn, () => {
const _j1220 = btn.dataset.size;
_j119(_j1220);
});
});
const _j1221 = document.querySelectorAll('.ink-effect-btn');
_j1221.forEach(btn => {
_j134(btn, () => {
const effect = btn.dataset.effect;
_j124(effect);
});
});
const _j1222 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1222.forEach(btn => {
_j134(btn, () => {
const color = btn.dataset.color;
if (color) {
_j128(color);
_j151();
}
});
});
const _j1223 = document.getElementById('custom-brush-color');
const _j1224 = document.getElementById('custom-brush-color-text');
if (_j1223 && _j1224) {
_j1223.addEventListener('input', (e) => {
_j1224.value = e.target.value.toUpperCase();
_j157();
});
_j1223.addEventListener('change', (e) => {
_j1224.value = e.target.value.toUpperCase();
_j157();
});
_j1224.addEventListener('input', (e) => {
const _j1213 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1213)) {
_j1223.value = _j1213.toUpperCase();
}
});
_j1224.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j157();
}
});
}
const _j1225 = document.querySelectorAll('.path-rotation-btn');
_j1225.forEach(btn => {
_j134(btn, () => {
const _j1226 = btn.dataset.rotation;
_j130(_j1226);
});
});
const _j1227 = document.querySelectorAll('.blendmode-btn');
_j1227.forEach(btn => {
_j134(btn, () => {
const mode = btn.dataset.mode;
_j125(mode);
});
});
const _j1228 = document.getElementById('clear-canvas');
if (_j1228) {
_j134(_j1228, () => {
_j163();
if (typeof _j226 !== 'undefined') {
_j226 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j110('ui', '🧹 Canvas cleared', {
Status: 'All drawings removed'
});
});
}
const _j1211 = document.getElementById('canvas-background-color');
const _j1212 = document.getElementById('canvas-background-color-text');
const _j1214 = document.getElementById('canvas-width');
const _j1215 = document.getElementById('canvas-height');
if (_j1211 && _j1212) {
_j1211.addEventListener('input', (e) => {
_j1212.value = e.target.value.toUpperCase();
});
_j1211.addEventListener('change', (e) => {
_j1212.value = e.target.value.toUpperCase();
_j158();
});
_j1212.addEventListener('input', (e) => {
const _j1213 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1213)) {
_j1211.value = _j1213.toUpperCase();
}
});
_j1212.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j158();
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
if (_j1214 && _j1215) {
_j1214.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j158();
}
});
_j1215.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j158();
}
});
if (typeof _j136 === 'function') {
_j136();
} else {
setTimeout(() => {
if (typeof _j136 === 'function') {
_j136();
}
}, 100);
}
}
const _j1229 = document.getElementById('panel-scale-slider');
if (_j1229) {
_j1229.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1229.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j73();
_j77();
_j81();
_j85();
});
}
const _j1230 = document.getElementById('toggle-control-panel');
if (_j1230) {
_j134(_j1230, _j101);
}
const controlPanel = _j66('controlPanel');
const _j1146 = controlPanel?.querySelector('.control-panel-header');
if (_j1146) {
_j1146.addEventListener('mousedown', _j74);
_j1146.addEventListener('touchstart', (e) => {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j74(_j1231);
});
}
const effectControlPanel = _j66('effectControlPanel');
const _j1232 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1232) {
_j1232.addEventListener('mousedown', _j78);
_j1232.addEventListener('touchstart', (e) => {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j78(_j1231);
});
}
const _j1233 = document.getElementById('toggle-effect-control-panel');
if (_j1233) {
_j134(_j1233, _j102);
}
const flowEffectPanel = _j66('flowEffectPanel');
const _j1234 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1234) {
_j1234.addEventListener('mousedown', _j82);
_j1234.addEventListener('touchstart', (e) => {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j82(_j1231);
});
}
const _j1235 = document.getElementById('toggle-flow-effect-panel');
if (_j1235) {
_j134(_j1235, _j103);
}
const maskPanel = _j66('maskPanel');
const _j1236 = maskPanel?.querySelector('.mask-panel-header');
if (_j1236) {
_j1236.addEventListener('mousedown', _j86);
_j1236.addEventListener('touchstart', (e) => {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j86(_j1231);
});
}
const _j1237 = document.getElementById('toggle-mask-panel');
if (_j1237) {
_j134(_j1237, function() {
_j104();
});
}
const _j1238 = document.getElementById('mask-mode-toggle');
if (_j1238) {
_j1238.addEventListener('change', function() {
if (!this.checked && _j543 === 'polygon' && _j545.length >= 3) {
drawMaskPolygon(_j545);
_j546 = { action: "polygon", points: _j545.map(p => ({ x: p.x, y: p.y })) };
}
const _j1239 = !this.checked;
_j541 = this.checked;
_j90();
_j91();
if (_j1239 && typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
});
}
const _j1240 = document.getElementById('mask-rect-btn');
if (_j1240) {
_j134(_j1240, function() {
_j543 = 'rect';
_j541 = true;
if (_j1238) _j1238.checked = true;
_j90();
_j91();
});
}
const _j1241 = document.getElementById('mask-poly-btn');
if (_j1241) {
_j134(_j1241, function() {
if (_j541 && _j543 === 'polygon') {
if (_j545.length >= 3) {
drawMaskPolygon(_j545);
_j546 = { action: "polygon", points: _j545.map(p => ({ x: p.x, y: p.y })) };
}
_j541 = false;
if (_j1238) _j1238.checked = false;
if (typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
} else {
_j543 = 'polygon';
_j541 = true;
_j545 = [];
if (_j1238) _j1238.checked = true;
}
_j90();
_j91();
});
}
const _j1242 = document.getElementById('mask-clear-btn');
if (_j1242) {
_j134(_j1242, function() {
clearMask();
_j546 = null;
_j91();
});
}
if (maskPanel && !_j692) {
maskPanel.style.display = 'none';
}
_j89();
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j105);
}
_j123();
_j120();
_j127();
_j129();
_j131();
_j126();
_j132();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j138() {
const now = millis();
const _j1243 = (now - _j1175) >= _j1176;
const recordingStatus = _j66('recordingStatus');
if (recordingStatus) {
if (_j616) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j66('playbackStatus');
const countdownStatus = _j66('countdownStatus');
if (_j624) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1243) {
const _j1244 = loopWaitDuration - (millis() - _j633);
const _j1245 = Math.ceil(_j1244 / 1000);
const _j823 = _j1244 / loopWaitDuration;
if (window.DEBUG_MODE && _j1245 !== _j1174) {
console.log(`Countdown: ${_j1245}s remaining (${Math.floor(_j823 * 100)}%)`);
_j1174 = _j1245;
}
const countdownText = _j66('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1245}s`;
}
const countdownCircle = _j66('countdownCircle');
if (countdownCircle) {
const _j1246 = 62.83;
const _j1247 = _j1246 * (1 - _j823);
countdownCircle.style.strokeDashoffset = _j1247;
}
}
} else {
_j1174 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1243) {
const _j422 = recordingData.events.length > 0 ?
_j626 / recordingData.events.length : 0;
const _j1248 = Math.round(_j422 * 100);
if (_j1248 !== _j1177) {
const progressFill = _j66('progressFill');
const progressText = _j66('progressText');
if (progressFill) progressFill.style.width = `${_j1248}%`;
if (progressText) progressText.textContent = `${_j1248}%`;
_j1177 = _j1248;
}
}
}
} else {
_j1174 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1243) {
_j1175 = now;
}
if (typeof _j114 === 'function') {
_j114();
}
}
function _j139(_j1506) {
const _j1249 = document.createElement('div');
_j1249.className = 'message-item new-message';
const _j1250 = document.createElement('span');
_j1250.className = 'message-icon';
_j1250.textContent = _j1506.icon;
const _j1251 = document.createElement('div');
_j1251.className = 'message-content';
const _j1252 = document.createElement('div');
_j1252.className = 'message-header';
const _j1253 = document.createElement('span');
_j1253.className = 'message-timestamp';
_j1253.textContent = _j1506.timestamp;
const _j1254 = document.createElement('span');
_j1254.className = `message-type ${_j1506.type}`;
_j1254.textContent = _j1506.type.toUpperCase();
_j1252.appendChild(_j1253);
_j1252.appendChild(_j1254);
const _j1255 = document.createElement('p');
_j1255.className = 'message-text';
_j1255.textContent = _j1506.message;
_j1251.appendChild(_j1252);
_j1251.appendChild(_j1255);
if (Object.keys(_j1506.data).length > 0) {
const _j1256 = document.createElement('div');
_j1256.className = 'message-data';
_j1256.textContent = JSON.stringify(_j1506.data, null, 2);
_j1251.appendChild(_j1256);
}
_j1249.appendChild(_j1250);
_j1249.appendChild(_j1251);
setTimeout(() => {
_j1249.classList.remove('new-message');
}, 300);
return _j1249;
}
function _j140() {
_j672 = !_j672;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j672) {
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j73();
} else {
_j94(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
}
}
localStorage.setItem('overlayVisible', _j672.toString());
}
function _j141() {
_j673 = [];
_j113();
}
function _j142() {
const _j1257 = document.getElementById('record-status-text');
if (_j1257) {
if (_j623 == 1) {
_j1257.textContent = 'ON';
_j1257.classList.add('active');
} else {
_j1257.textContent = 'OFF';
_j1257.classList.remove('active');
}
}
}
function _j143() {
const _j1258 = {};
const _j1259 = window.location.search;
if (!_j1259 || _j1259.length <= 1) {
return _j1258;
}
const _j1260 = _j1259.substring(1);
const _j1008 = _j1260.split('_');
const _j1261 = {
'wd': true,
'gr': true
};
for (const _j1262 of _j1008) {
if (!_j1262) continue;
const _j1263 = _j1262.indexOf(':');
if (_j1263 === -1) continue;
const key = _j1262.substring(0, _j1263);
const value = _j1262.substring(_j1263 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1264 = parseInt(value);
if (!isNaN(_j1264) && _j1264 > 0) {
_j1258[key] = _j1264;
}
continue;
}
if (_j1261[key]) {
const _j1265 = parseFloat(value);
if (!isNaN(_j1265) && _j1265 > 0) {
_j1258[key] = true;
_j1258[key + '_val'] = _j1265;
} else {
_j1258[key] = false;
}
} else {
_j1258[key] = value === '1';
}
}
}
return _j1258;
}
function _j144(_j1507) {
const _j1266 = {
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
for (const [_j1262, toggleId] of Object.entries(_j1266)) {
if (_j1507.hasOwnProperty(_j1262)) {
if (_j1262 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1267 = _j1507[_j1262];
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.checked = _j1267;
toggle.dispatchEvent(new Event('change'));
if (_j1262 === 'rs') {
const _j1268 = document.getElementById('rs-sliders-section');
if (_j1268) {
_j1268.style.display = _j1267 ? 'flex' : 'none';
}
} else if (_j1262 === 'distort') {
const _j1269 = document.getElementById('distort-sliders-section');
if (_j1269) {
_j1269.style.display = _j1267 ? 'flex' : 'none';
}
} else if (_j1262 === 'cl') {
const _j1270 = document.getElementById('cellular-sliders-section');
if (_j1270) {
_j1270.style.display = _j1267 ? 'flex' : 'none';
}
} else if (_j1262 === 'wd') {
const _j1271 = document.getElementById('white-dot-sliders-section');
if (_j1271) {
_j1271.style.display = _j1267 ? 'flex' : 'none';
}
if (_j1267 && _j1507['wd_val'] !== undefined) {
const _j1272 = document.getElementById('white-dot-density');
const _j1273 = document.getElementById('white-dot-density-value');
if (_j1272) _j1272.value = _j1507['wd_val'];
if (_j1273) _j1273.textContent = _j1507['wd_val'].toFixed(2);
}
} else if (_j1262 === 'gr') {
const _j1274 = document.getElementById('grain-sliders-section');
if (_j1274) {
_j1274.style.display = _j1267 ? 'flex' : 'none';
}
if (_j1267 && _j1507['gr_val'] !== undefined) {
const _j1275 = document.getElementById('grain-amount');
const _j1276 = document.getElementById('grain-amount-value');
if (_j1275) _j1275.value = _j1507['gr_val'];
if (_j1276) _j1276.textContent = _j1507['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1262}`);
}
}
}
}
function _j145() {
_j65();
const _j1277 = _j143();
const _j1278 = {
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
if (_j1277['w']) window._urlCanvasWidth = _j1277['w'];
if (_j1277['h']) window._urlCanvasHeight = _j1277['h'];
if (Object.keys(_j1277).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1262, _j1267] of Object.entries(_j1277)) {
const globalVarName = _j1278[_j1262];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1262 === 'loop') {
window[globalVarName] = _j1267 ? 1 : 0;
} else {
window[globalVarName] = _j1267;
}
}
}
const _j1279 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1280 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1262, globalVarName] of Object.entries(_j1279)) {
const valKey = _j1262 + '_val';
if (_j1277[valKey] !== undefined) {
window[globalVarName] = _j1277[valKey];
window[_j1280[_j1262]] = _j1277[valKey];
}
}
window._initialConsoleFromURL = _j1277.hasOwnProperty('console') ? _j1277.console : false;
}
const _j1216 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1217 = _j1216 === 'collector';
const _j1230 = document.getElementById('toggle-overlay');
const _j1281 = document.getElementById('toggle-hint-btn');
const _j1282 = document.getElementById('clear-bite-points');
const _j1283 = document.getElementById('scan-global');
const _j1284 = document.getElementById('scan-current');
const _j1285 = document.getElementById('scan-random');
const _j1286 = document.getElementById('scan-current-random');
const _j1287 = document.getElementById('brush-hint-btn');
const _j1288 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1288.length > 0) {
let _j1289 = 2;
if (typeof _j493 !== 'undefined') {
_j1289 = _j493;
}
const _j1290 = document.querySelector(`input[name="pixel-density"][value="${_j1289}"]`);
if (_j1290) {
_j1290.checked = true;
}
_j1288.forEach(_j1513 => {
_j1513.addEventListener('change', (e) => {
if (e.target.checked) {
const _j716 = parseInt(e.target.value);
if (typeof _j493 !== 'undefined') {
_j493 = _j716;
try {
sessionStorage.setItem('pendingPixelDensity', _j716.toString());
if (typeof _j616 !== 'undefined' && _j616 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j110('system', '🎨 Pixel density changed - reloading page', {
Value: _j716,
Status: 'Page will reload to recreate canvas with new pixel density',
Note: 'Current drawing will be cleared'
});
setTimeout(() => {
window.location.reload();
}, 300);
} catch (error) {
_j110('system', '❌ Failed to update pixel density', {
Error: error.message,
Status: 'Error'
});
}
} else {
_j110('system', '⚠️ Pixel variable not found', {
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
if (_j1217) {
if (_j1287) _j1287.style.display = 'none';
}
const _j1291 = document.getElementById('record-toggle');
const _j1257 = document.getElementById('record-status-text');
const _j1292 = document.getElementById('realtime-drawing-toggle');
const _j1293 = document.getElementById('realtime-drawing-status-text');
const _j1294 = document.getElementById('grid-overlay-toggle');
const _j1295 = document.getElementById('paper-texture-toggle');
const _j1296 = document.getElementById('camera-moving-toggle');
const _j1297 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1146 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j672) {
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j73();
} else {
overlay.classList.add('hidden');
hint.classList.remove('hidden');
}
}
const controlPanel = _j66('controlPanel');
if (controlPanel && brushHint) {
if (_j680) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1230) {
_j134(_j1230, _j140);
}
if (_j1281) {
_j134(_j1281, () => {
if (!_j93()) _j140();
});
}
if (_j1287) {
_j134(_j1287, () => {
if (!_j93()) _j101();
});
}
const _j1298 = document.getElementById('effect-hint-btn');
if (_j1298) {
_j134(_j1298, () => {
if (!_j93()) _j102();
});
}
const _j1299 = document.getElementById('flow-hint-btn');
if (_j1299) {
_j134(_j1299, () => {
if (!_j93()) _j103();
});
}
const _j1300 = document.getElementById('mask-hint-btn');
if (_j1300) {
_j134(_j1300, () => {
if (!_j93()) _j104();
});
}
const _j1301 = document.getElementById('agent-toggle-btn');
if (_j1301) {
_j134(_j1301, function() {
_j555 = !_j555;
if (_j555) {
_j553 = true;
_j556 = [];
_j1301.classList.add('agent-active');
_j1301.textContent = 'Agent ●';
console.log('[Agent] ON — recording paths with timestamps');
} else {
_j553 = false;
_j1301.classList.remove('agent-active');
_j1301.textContent = 'Agent';
console.log('[Agent] OFF — ' + _j556.length + ' points recorded');
}
});
}
if (_j1283) {
_j134(_j1283, () => {
if (typeof _j18 === 'function') {
const shapeType = _j152();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j801 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j801 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j801);
noiseSeed(_j801);
}
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j178('ec', {
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
function _j146(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j152();
let scanBounds = null;
let _j309 = null;
if (typeof _j566 !== 'undefined' && _j566.length > 0) {
if (strokeIndex !== null) {
_j309 = Math.max(0, Math.min(strokeIndex, _j566.length - 1));
} else {
const _j1302 = document.getElementById('stroke-select-slider');
if (_j1302) {
_j309 = parseInt(_j1302.value) || 0;
_j309 = Math.max(0, Math.min(_j309, _j566.length - 1));
}
}
if (_j309 !== null) {
const selectedStroke = _j566[_j309];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j110('system', `🎯 EACH: 使用笔画 #${_j309} 的网格区域`, {
Index: _j309,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: _j566.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j110('system', `🎯 EACH: 使用笔画 #${_j309} 的边界框（无网格数据）`, {
Index: _j309,
TotalStrokes: _j566.length
});
}
}
}
}
if (!scanBounds) {
if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
scanBounds = pendingBugBounds;
} else if (typeof _j566 !== 'undefined' && _j566.length > 0) {
const lastStroke = _j566[_j566.length - 1];
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
const _j801 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j801 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j801);
noiseSeed(_j801);
}
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j178('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j309,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1284) {
_j134(_j1284, () => {
_j146();
});
}
if (_j1286) {
_j134(_j1286, () => {
if (typeof _j566 !== 'undefined' && _j566.length > 0) {
const _j1303 = Math.floor(Math.random() * _j566.length);
const _j1302 = document.getElementById('stroke-select-slider');
const _j1304 = document.getElementById('stroke-index-display');
const _j1305 = document.getElementById('stroke-select-value');
if (_j1302) {
_j1302.value = _j1303;
_j1302.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1304) {
_j1304.textContent = _j1303;
}
if (_j1305) {
_j1305.textContent = _j1303;
}
_j110('system', `🎲 EACHR: 随机选择笔画 #${_j1303}`, {
RandomIndex: _j1303,
TotalStrokes: _j566.length
});
_j146(_j1303);
} else {
_j110('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1285) {
_j134(_j1285, () => {
if (typeof _j19 === 'function') {
const shapeType = _j152();
_j19(10, shapeType);
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
_j178('ec', {
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
if (_j1282) {
_j134(_j1282, () => {
if (typeof _j226 !== 'undefined' && _j226.length > 0) {
let pointCount = typeof _j226 !== 'undefined' ? _j226.length : 0;
if (typeof _j226 !== 'undefined') {
_j226 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j110('system', '🧹 清除虫咬点', {
'虫咬点': pointCount
});
} else {
_j110('system', '⚠️ 没有虫咬点可清除', {});
}
});
}
if (_j1291) {
_j1291.checked = (_j623 == 1);
_j142();
_j1291.addEventListener('change', (e) => {
_j623 = e.target.checked ? 1 : 0;
_j142();
_j110('system', `Record mode ${_j623 ? 'enabled' : 'disabled'}`, {
Status: _j623 ? 'ON' : 'OFF'
});
});
}
if (_j1292) {
_j1292.disabled = true;
if (_j1293) {
_j1293.textContent = 'DISABLED';
}
_j1292.addEventListener('change', (e) => {
e.target.checked = false;
_j110('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1294) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1294.checked = !!showGridOverlay;
}
} catch (e) {}
_j1294.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1517) {}
_j110('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1295) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1295.checked = !!showPaperTexture;
} else {
_j1295.checked = true;
}
} catch (e) {
_j1295.checked = true;
}
_j1295.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1517) {}
_j110('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1306 = document.getElementById('fit-canvas-toggle');
if (_j1306) {
_j1306.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
if (typeof window.toggleFitMode === 'function') {
window.toggleFitMode(enabled);
_j110('system', '🎨 Fit canvas', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
_j110('system', '⚠️ Fit mode function not available', {
Status: 'Error'
});
}
});
}
if (_j1296) {
try {
if (typeof doMoving !== 'undefined') {
_j1296.checked = !!doMoving;
} else {
_j1296.checked = false;
}
} catch (e) {
_j1296.checked = false;
}
_j1296.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1517) {}
_j110('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1297) {
try {
if (typeof loopToggle !== 'undefined') {
_j1297.checked = (loopToggle === 1);
} else {
_j1297.checked = false;
}
} catch (e) {
_j1297.checked = false;
}
_j1297.addEventListener('change', (e) => {
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
_j110('system', '🔁 Loop playback', {
Status: enabled ? 'Enabled ✅ (Auto repeat after 5s)' : 'Disabled ❌ (Single playback)'
});
} else {
console.warn('⚠️ loopToggle variable not found');
}
} catch (_j1517) {
console.error('Error setting loopToggle:', _j1517);
}
});
}
const _j1307 = document.getElementById('playback-offset-x');
const _j1308 = document.getElementById('playback-offset-y');
if (_j1307) {
if (typeof _j636 !== 'undefined') {
_j1307.value = _j636;
}
_j1307.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j636 !== 'undefined') {
_j636 = value;
_j110('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1308) {
if (typeof _j637 !== 'undefined') {
_j1308.value = _j637;
}
_j1308.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j637 !== 'undefined') {
_j637 = value;
_j110('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1309 = document.getElementById('distort-shader-toggle');
const _j1269 = document.getElementById('distort-sliders-section');
if (_j1309) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1309.checked = !!distortShaderEnabled;
if (_j1269) {
_j1269.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1309.checked = false;
if (_j1269) {
_j1269.style.display = 'none';
}
}
} catch (e) {
_j1309.checked = false;
if (_j1269) {
_j1269.style.display = 'none';
}
}
_j1309.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1269) {
_j1269.style.display = enabled ? 'flex' : 'none';
}
_j110('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1517) {
console.error('Error setting distortShaderEnabled:', _j1517);
}
});
}
const _j1310 = document.getElementById('distort-displacement-b');
const _j1311 = document.getElementById('distort-displacement-b-value');
if (_j1310 && _j1311) {
const _j1312 = parseFloat(_j1310.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1312;
}
_j1311.textContent = Math.round(_j1312);
_j1310.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1311.textContent = Math.round(value);
});
}
const _j1313 = document.getElementById('distort-displacement-c');
const _j1314 = document.getElementById('distort-displacement-c-value');
if (_j1313 && _j1314) {
const _j1312 = parseFloat(_j1313.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1312;
}
_j1314.textContent = Math.round(_j1312);
_j1313.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1314.textContent = Math.round(value);
});
}
const _j1315 = document.getElementById('distort-fbm-preview-toggle');
if (_j1315) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1315.checked = (distortShowFbmMask > 0.5);
} else {
_j1315.checked = false;
}
} catch (e) {
_j1315.checked = false;
}
_j1315.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = enabled ? 1.0 : 0.0;
_j110('system', '🎨 fBM Mask Preview', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShowFbmMask variable not found');
}
} catch (_j1517) {
console.error('Error setting distortShowFbmMask:', _j1517);
}
});
}
const _j1316 = document.getElementById('rs-toggle');
const _j1268 = document.getElementById('rs-sliders-section');
if (_j1316) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1316.checked = !!rsEnabled;
if (_j1268) {
_j1268.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1316.checked = false;
if (_j1268) {
_j1268.style.display = 'none';
}
}
} catch (e) {
_j1316.checked = false;
if (_j1268) {
_j1268.style.display = 'none';
}
}
_j1316.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1268) {
_j1268.style.display = enabled ? 'flex' : 'none';
}
_j110('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1517) {
console.error('Error setting rsEnabled:', _j1517);
}
});
}
const _j1317 = document.getElementById('rs-frequency');
const _j1318 = document.getElementById('rs-frequency-value');
if (_j1317 && _j1318) {
const _j1312 = parseFloat(_j1317.value);
if (typeof _j571 !== 'undefined') {
_j571 = _j1312;
}
_j1318.textContent = Math.round(_j1312);
_j1317.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j571 !== 'undefined') {
_j571 = value;
}
_j1318.textContent = Math.round(value);
});
}
const _j1319 = document.getElementById('rs-wave-speed');
const _j1320 = document.getElementById('rs-wave-speed-value');
if (_j1319 && _j1320) {
const _j1312 = parseFloat(_j1319.value);
if (typeof _j572 !== 'undefined') {
_j572 = _j1312;
}
_j1320.textContent = _j1312.toFixed(1);
_j1319.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j572 !== 'undefined') {
_j572 = value;
}
_j1320.textContent = value.toFixed(1);
});
}
const _j1321 = document.getElementById('rs-strength');
const _j1322 = document.getElementById('rs-strength-value');
if (_j1321 && _j1322) {
const _j1312 = parseFloat(_j1321.value);
if (typeof _j573 !== 'undefined') {
_j573 = _j1312;
}
_j1322.textContent = _j1312.toFixed(1);
_j1321.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j573 !== 'undefined') {
_j573 = value;
}
_j1322.textContent = value.toFixed(1);
});
}
const _j1323 = document.getElementById('rs-gradient-mix');
const _j1324 = document.getElementById('rs-gradient-mix-value');
if (_j1323 && _j1324) {
const _j1312 = parseFloat(_j1323.value);
if (typeof _j574 !== 'undefined') {
_j574 = _j1312;
}
_j1324.textContent = _j1312.toFixed(1);
_j1323.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j574 !== 'undefined') {
_j574 = value;
}
_j1324.textContent = value.toFixed(1);
});
}
const _j1325 = document.getElementById('rs-scale');
const _j1326 = document.getElementById('rs-scale-value');
if (_j1325 && _j1326) {
const _j1312 = parseFloat(_j1325.value);
if (typeof _j575 !== 'undefined') {
_j575 = _j1312;
}
_j1326.textContent = Math.round(_j1312);
_j1325.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j575 !== 'undefined') {
_j575 = value;
}
_j1326.textContent = Math.round(value);
});
}
const _j1327 = document.getElementById('cellular-toggle');
const _j1270 = document.getElementById('cellular-sliders-section');
if (_j1327) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1327.checked = !!cellularEnabled;
if (_j1270) {
_j1270.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1327.checked = false;
if (_j1270) _j1270.style.display = 'none';
}
} catch (e) {
_j1327.checked = false;
if (_j1270) _j1270.style.display = 'none';
}
_j1327.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1270) {
_j1270.style.display = enabled ? 'flex' : 'none';
}
_j110('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1517) {
console.error('Error setting cellularEnabled:', _j1517);
}
});
}
const _j1328 = document.getElementById('cellular-scale');
const _j1329 = document.getElementById('cellular-scale-value');
if (_j1328 && _j1329) {
const _j1312 = parseFloat(_j1328.value);
if (typeof _j576 !== 'undefined') _j576 = _j1312;
_j1329.textContent = _j1312.toFixed(1);
_j1328.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j576 !== 'undefined') _j576 = value;
_j1329.textContent = value.toFixed(1);
});
}
const _j1330 = document.getElementById('cellular-seed');
const _j1331 = document.getElementById('cellular-seed-value');
if (_j1330 && _j1331) {
const _j1312 = parseFloat(_j1330.value);
if (typeof _j577 !== 'undefined') _j577 = _j1312;
_j1331.textContent = _j1312.toFixed(1);
_j1330.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j577 !== 'undefined') _j577 = value;
_j1331.textContent = value.toFixed(1);
});
}
const _j1332 = document.getElementById('white-dot-toggle');
const _j1333 = document.getElementById('white-dot-sliders-section');
if (_j1332) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1332.checked = !!whiteDotEnabled;
if (_j1333) _j1333.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1332.checked = false;
if (_j1333) _j1333.style.display = 'none';
}
} catch (e) {
_j1332.checked = false;
if (_j1333) _j1333.style.display = 'none';
}
_j1332.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1333) _j1333.style.display = enabled ? 'flex' : 'none';
_j110('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1517) {
console.error('Error setting whiteDotEnabled:', _j1517);
}
});
}
const _j1334 = document.getElementById('white-dot-density');
const _j1335 = document.getElementById('white-dot-density-value');
if (_j1334 && _j1335) {
if (window._urlParamWdVal !== undefined) {
const _j1336 = window._urlParamWdVal;
_j578 = _j1336 * 0.1;
_j1334.value = _j1336;
_j1335.textContent = _j1336.toFixed(2);
} else {
const _j1336 = parseFloat(_j1334.value);
if (typeof _j578 !== 'undefined') _j578 = _j1336 * 0.1;
_j1335.textContent = _j1336.toFixed(2);
}
_j1334.addEventListener('input', (e) => {
const _j1336 = parseFloat(e.target.value);
if (typeof _j578 !== 'undefined') _j578 = _j1336 * 0.1;
_j1335.textContent = _j1336.toFixed(2);
});
}
const _j1337 = document.getElementById('grain-toggle');
const _j1338 = document.getElementById('grain-sliders-section');
if (_j1337) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1337.checked = !!grainEnabled;
if (_j1338) _j1338.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1337.checked = false;
if (_j1338) _j1338.style.display = 'none';
}
} catch (e) {
_j1337.checked = false;
if (_j1338) _j1338.style.display = 'none';
}
_j1337.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1338) _j1338.style.display = enabled ? 'flex' : 'none';
_j110('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1517) {
console.error('Error setting grainEnabled:', _j1517);
}
});
}
const _j1339 = document.getElementById('grain-amount');
const _j1340 = document.getElementById('grain-amount-value');
if (_j1339 && _j1340) {
if (window._urlParamGrVal !== undefined) {
const _j1336 = window._urlParamGrVal;
_j579 = _j1336 * 0.1;
_j1339.value = _j1336;
_j1340.textContent = _j1336.toFixed(2);
} else {
const _j1336 = parseFloat(_j1339.value);
if (typeof _j579 !== 'undefined') _j579 = _j1336 * 0.1;
_j1340.textContent = _j1336.toFixed(2);
}
_j1339.addEventListener('input', (e) => {
const _j1336 = parseFloat(e.target.value);
if (typeof _j579 !== 'undefined') _j579 = _j1336 * 0.1;
_j1340.textContent = _j1336.toFixed(2);
});
}
const _j1341 = document.getElementById('future-path-preview-toggle');
if (_j1341) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1341.checked = !!showFuturePathPreview;
} else {
_j1341.checked = true;
}
} catch (e) {
_j1341.checked = true;
}
_j1341.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j110('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1517) {
console.error('Error setting showFuturePathPreview:', _j1517);
}
});
}
if (recordBtn) {
_j134(recordBtn, () => {
if (!_j616 && !_j624) {
_j179();
_j114();
}
});
}
if (stopBtn) {
_j134(stopBtn, () => {
if (_j616) {
_j180();
} else if (_j624) {
_j183();
}
_j114();
});
}
if (playBtn) {
_j134(playBtn, () => {
if (!_j616 && !_j624 && recordingData.events.length > 0) {
startPlayback();
_j114();
}
});
}
if (loadBtn) {
_j134(loadBtn, () => {
if (!_j616 && !_j624) {
_j182();
}
});
}
const _j1342 = document.getElementById('load-image');
const _j1343 = document.getElementById('image-file-input');
if (_j1217) {
if (_j1342) _j1342.style.display = 'none';
} else if (_j1342 && _j1343) {
_j134(_j1342, () => {
_j1343.click();
});
_j1343.addEventListener('change', (e) => {
const _j1344 = e.target.files[0];
if (_j1344 && _j1344.type.startsWith('image/')) {
_j115(_j1344);
}
});
}
const _j1345 = document.getElementById('show-reference-image');
if (_j1345 && !_j1217) {
_j134(_j1345, () => {
_j116();
});
}
const _j1346 = document.getElementById('hide-reference-image');
if (_j1346 && !_j1217) {
_j134(_j1346, () => {
_j117();
});
}
if (_j1146) {
_j1146.addEventListener('mousedown', _j67);
_j1146.addEventListener('touchstart', (e) => {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j67(_j1231);
});
}
_j72();
const _j1347 = _j66('flowEffectPanel');
if (_j1347 && !_j1347.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1347.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1516 => {
const _j1348 = _j1516.getAttribute('data-panel');
const _j1349 = {
overlay: _j67,
control: _j74,
effect: _j78,
flow: _j82
};
const fn = _j1349[_j1348];
if (!fn) return;
_j1516.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1516.addEventListener('touchstart', (e) => {
const _j1154 = e.touches[0];
fn({ clientX: _j1154.clientX, clientY: _j1154.clientY, target: _j1516, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j71(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j68);
document.addEventListener('mouseup', _j69);
document.addEventListener('touchmove', (e) => {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY
};
_j68(_j1231);
});
document.addEventListener('touchend', _j69);
document.addEventListener('mousemove', _j75);
document.addEventListener('mouseup', _j76);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY
};
_j75(_j1231);
}
});
document.addEventListener('touchend', _j76);
document.addEventListener('mousemove', _j79);
document.addEventListener('mouseup', _j80);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY
};
_j79(_j1231);
}
});
document.addEventListener('touchend', _j80);
document.addEventListener('mousemove', _j83);
document.addEventListener('mouseup', _j84);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY
};
_j83(_j1231);
}
});
document.addEventListener('touchend', _j84);
document.addEventListener('mousemove', _j87);
document.addEventListener('mouseup', _j88);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1154 = e.touches[0];
const _j1231 = {
clientX: _j1154.clientX,
clientY: _j1154.clientY
};
_j87(_j1231);
}
});
document.addEventListener('touchend', _j88);
if (hint && !_j672) {
hint.classList.remove('hidden');
}
_j114();
_j150();
_j154();
_j159();
_j155();
_j81();
_j85();
const effectControlPanel = _j66('effectControlPanel');
const effectHint = _j66('effectHint');
const _j1233 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j684) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1233) {
_j1233.textContent = _j684 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j66('flowEffectPanel');
const flowHint = _j66('flowHint');
const _j1235 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j688) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1235) {
_j1235.textContent = _j688 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1277).length > 0) {
setTimeout(() => {
_j144(_j1277);
_j110('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1277).length
});
}, 200);
}
setTimeout(() => {
_j100();
_j99();
}, 100);
_j147();
}
let _j1350 = false;
let _j1351 = null;
function _j147() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j134(btn, _j148);
}
function _j148() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1352 = document.getElementById('effect-control-panel');
const _j1347 = document.getElementById('flow-effect-panel');
const maskPanel = document.getElementById('mask-panel');
const _j1353 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint, #mask-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1350) {
_j1351 = {
overlay: _j672,
control: _j680,
effect: _j684,
flow: _j688,
mask: _j692
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1352) _j1352.style.display = 'none';
if (_j1347) _j1347.style.display = 'none';
if (maskPanel) maskPanel.style.display = 'none';
_j1353.forEach(h => h.style.display = 'none');
_j672 = false;
_j680 = false;
_j684 = false;
_j688 = false;
_j692 = false;
_j1350 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1351 || { overlay: true, control: true, effect: true, flow: true, mask: true };
_j672 = s.overlay;
_j680 = s.control;
_j684 = s.effect;
_j688 = s.flow;
_j692 = s.mask !== undefined ? s.mask : true;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1352) _j1352.style.display = s.effect ? 'block' : 'none';
if (_j1347) _j1347.style.display = s.flow ? 'block' : 'none';
if (maskPanel) maskPanel.style.display = _j692 ? 'block' : 'none';
_j1353.forEach(h => h.style.display = '');
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
_j1350 = false;
_j1351 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j149();
}
}
function _j149() {
const _j1354 = [
{ panel: _j66('messageOverlay'), pos: _j676, update: _j73, defaultPos: { x: 50, y: 50 } },
{ panel: _j66('controlPanel'), pos: _j679, update: _j77, defaultPos: { x: 85, y: 50 } },
{ panel: _j66('effectControlPanel'), pos: _j683, update: _j81, defaultPos: { x: 15, y: 50 } },
{ panel: _j66('flowEffectPanel'), pos: _j687, update: _j85, defaultPos: { x: 50, y: 85 } }
];
_j1354.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1146 = panel.querySelector('.control-btn');
if (!_j1146) return;
const rect = _j1146.getBoundingClientRect();
const vw = window.innerWidth;
const vh = window.innerHeight;
if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) {
pos.x = defaultPos.x;
pos.y = defaultPos.y;
update();
}
});
_j109();
}
function activateZenMode() {
if (_j1350) return;
_j148();
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
let _j1355 = false;
const _j1356 = new MutationObserver(() => {
if (_j1355) return;
if (go()) {
_j1355 = true;
_j1356.disconnect();
}
});
_j1356.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1355) _j1356.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j150() {
const _j1357 = document.getElementById('metallic-strength');
const _j1358 = document.getElementById('metallic-strength-value');
if (_j1357 && _j1358) {
const _j1312 = parseFloat(_j1357.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1312 / 100;
}
_j1358.textContent = _j1312;
_j1357.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1358.textContent = value;
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
_j178('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1359 = document.getElementById('metallic-flow');
const _j1360 = document.getElementById('metallic-flow-value');
const _j1361 = document.getElementById('flow-auto-random');
let _j1362 = null;
if (_j1359 && _j1360) {
const _j1312 = parseFloat(_j1359.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1312 / 100;
}
_j1360.textContent = _j1312;
_j1359.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1360.textContent = value;
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
_j178('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1361 && _j1359 && _j1360) {
_j1361.addEventListener('click', () => {
const isActive = _j1361.getAttribute('data-active') === 'true';
if (isActive) {
_j1361.setAttribute('data-active', 'false');
_j1361.classList.remove('active');
if (_j1362) {
clearInterval(_j1362);
_j1362 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1361.setAttribute('data-active', 'true');
_j1361.classList.add('active');
_j1362 = setInterval(() => {
const _j308 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1359.value = _j308;
_j1360.textContent = _j308;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j308 / 50;
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
Object.keys(tintButtons).forEach(_j1422 => {
const _j1363 = document.getElementById(_j1422);
if (_j1363) {
_j1363.classList.remove('active');
}
});
btn.classList.add('active');
const _j1364 = btn.textContent.trim();
_j110('system', '🎨 Metal tint changed', {
Tint: _j1364,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
const tintType = id.replace('metal-', '');
_j178('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j151() {
_j123();
_j120();
_j127();
_j129();
_j131();
_j126();
}
function _j152() {
const _j1365 = document.querySelector('.shape-type-btn.active');
if (_j1365) {
return parseInt(_j1365.dataset.type);
}
return 0;
}
function _j153(type) {
const _j1182 = document.querySelectorAll('.shape-type-btn');
_j1182.forEach(btn => {
const _j1366 = parseInt(btn.dataset.type);
if (_j1366 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j154() {
const _j799 = document.getElementById('bugs-size');
const _j1367 = document.getElementById('bugs-size-value');
if (_j799 && _j1367) {
const _j1312 = parseFloat(_j799.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1312;
}
_j1367.textContent = _j1312;
_j799.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1367.textContent = value;
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
_j178('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1368 = document.querySelectorAll('.shape-type-btn');
_j1368.forEach(btn => {
_j134(btn, () => {
const type = parseInt(btn.dataset.type);
_j153(type);
});
});
}
function _j155() {
const _j1302 = document.getElementById('stroke-select-slider');
const _j1304 = document.getElementById('stroke-index-display');
const _j1369 = document.getElementById('stroke-total-display');
const _j1305 = document.getElementById('stroke-select-value');
if (!_j1302 || !_j1304 || !_j1369 || !_j1305) {
return;
}
function _j156(_j1508 = false) {
const strokeCount = (typeof _j566 !== 'undefined' && Array.isArray(_j566)) ?
_j566.length :
0;
const _j1370 = Math.max(0, strokeCount - 1);
_j1302.max = _j1370;
_j1369.textContent = strokeCount;
if (_j1508 || parseInt(_j1302.value) > _j1370) {
_j1302.value = _j1370;
}
const _j1371 = parseInt(_j1302.value) || 0;
_j1304.textContent = _j1371;
_j1305.textContent = _j1371;
}
_j156();
_j1302.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1304.textContent = value;
_j1305.textContent = value;
let gridParams = null;
let points = null;
if (typeof _j566 !== 'undefined' && Array.isArray(_j566) && _j566.length > 0) {
const _j1372 = Math.max(0, Math.min(value, _j566.length - 1));
const selectedStroke = _j566[_j1372];
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
let _j1373 = 0;
setInterval(() => {
const _j1374 = (typeof _j566 !== 'undefined' && Array.isArray(_j566)) ?
_j566.length :
0;
if (_j1374 !== _j1373) {
const _j537 = _j1374 > _j1373;
_j156(_j537);
_j1373 = _j1374;
}
}, 500);
window.updateStrokeSelector = _j156;
}
function _j157() {
const _j1223 = document.getElementById('custom-brush-color');
const _j1224 = document.getElementById('custom-brush-color-text');
if (!_j1223 || !_j1224) {
console.error('Custom brush color inputs not found');
return;
}
let _j1213 = _j1224.value.trim();
if (!_j1213 || !/^#[0-9A-Fa-f]{6}$/.test(_j1213)) {
_j1213 = _j1223.value;
}
const r = parseInt(_j1213.slice(1, 3), 16);
const g = parseInt(_j1213.slice(3, 5), 16);
const b = parseInt(_j1213.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j110('ui', '❌ Invalid custom brush color', {
Color: _j1213,
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
_j129();
_j132();
_j1223.value = _j1213.toUpperCase();
_j1224.value = _j1213.toUpperCase();
_j110('ui', '🎨 Custom brush color applied', {
Color: _j1213,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j158() {
const _j1211 = document.getElementById('canvas-background-color');
const _j1212 = document.getElementById('canvas-background-color-text');
const _j1214 = document.getElementById('canvas-width');
const _j1215 = document.getElementById('canvas-height');
let _j1375 = false;
if (_j1211 && _j1212) {
let _j1213 = _j1212.value.trim();
if (!_j1213 || !/^#[0-9A-Fa-f]{6}$/.test(_j1213)) {
_j1213 = _j1211.value;
}
const r = parseInt(_j1213.slice(1, 3), 16);
const g = parseInt(_j1213.slice(3, 5), 16);
const b = parseInt(_j1213.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j110('ui', '❌ Invalid background color', {
Color: _j1213,
Status: 'Please use format #RRGGBB'
});
return;
}
if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
_j110('ui', '❌ Color values out of range', {
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
_j110('ui', '❌ canvasBackgroundColor not found', {
Status: 'Error: Variable not defined'
});
return;
}
if (typeof _j612 !== 'undefined' && _j612) {
_j612.begin();
background(r, g, b);
_j612.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j554 !== 'undefined') {
_j554 = true;
}
_j1211.value = _j1213.toUpperCase();
_j1212.value = _j1213.toUpperCase();
_j110('ui', '🎨 Background color changed', {
Color: _j1213,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1214 && _j1215) {
const _j1376 = parseInt(_j1214.value);
const _j1377 = parseInt(_j1215.value);
if (isNaN(_j1376) || isNaN(_j1377)) {
_j110('ui', '❌ Invalid canvas size', {
Width: _j1214.value,
Height: _j1215.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1376 < 100 || _j1376 > 4000 || _j1377 < 100 || _j1377 > 4000) {
_j110('ui', '❌ Canvas size out of range', {
Width: _j1376,
Height: _j1377,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j491 !== 'undefined' && typeof _j492 !== 'undefined') {
if (_j491 !== _j1376 || _j492 !== _j1377) {
_j491 = _j1376;
_j492 = _j1377;
_j1375 = true;
_j110('ui', '📐 Canvas size changed', {
Width: `${_j1376}px`,
Height: `${_j1377}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1375) {
sessionStorage.setItem('pendingCanvasWidth', _j491.toString());
sessionStorage.setItem('pendingCanvasHeight', _j492.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1378 = null;
let _j1379 = null;
function _j159() {
const _j1380 = document.querySelectorAll('.flow-effect-btn');
const _j1381 = document.getElementById('flow-strength');
const _j1382 = document.getElementById('flow-strength-value');
if (_j1381 && _j1382) {
_j1381.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1382.textContent = value;
if (typeof _j594 !== 'undefined') {
_j594.blendVol = value;
}
});
}
const _j1383 = document.getElementById('flow-last-stroke-only');
if (_j1383) {
_j1383.addEventListener('change', (e) => {
if (typeof _j595 !== 'undefined') {
_j595 = e.target.checked;
_j110('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j595
});
}
});
}
_j1380.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j160(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j161(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1378 === btn) {
_j161(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j160(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j161(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j161(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1378) {
const blendType = parseInt(_j1378.dataset.type);
_j161(_j1378, blendType);
}
});
}
function _j160(btn, blendType) {
if (_j1378) return;
const bounds = typeof _j48 === 'function' ? _j48() : null;
if (!bounds) {
_j110('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1378 = btn;
btn.classList.add('active', 'running');
if (typeof flowEffectStrokeBounds !== 'undefined') {
flowEffectStrokeBounds = bounds;
}
if (typeof window !== 'undefined') {
window.flowEffectStrokeBounds = bounds;
}
const flowSeed = Math.floor(Math.random() * 1000000);
if (typeof _j49 === 'function') {
_j49(blendType, flowSeed);
}
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616) {
if (typeof _j619 !== 'undefined' && _j619 > 0 && typeof _j621 !== 'undefined') {
const _j805 = millis() - _j619;
if (_j805 > 0) {
_j621 += _j805;
_j619 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j805,
total: _j621
});
}
}
const _j1384 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j594 !== 'undefined') ? _j594.blendVol : 100,
lastStrokeOnly: (typeof _j595 !== 'undefined') ? _j595 : false
};
console.log('🎬 Recording flow start event:', _j1384);
_j178('flow', _j1384);
}
_j1379 = setInterval(() => {
const _j903 = document.getElementById('flow-iteration-count');
if (_j903 && typeof _j584 !== 'undefined') {
_j903.textContent = _j584;
}
}, 50);
_j110('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j161(btn, blendType) {
if (_j1378 !== btn) return;
btn.classList.remove('active', 'running');
_j1378 = null;
if (_j1379) {
clearInterval(_j1379);
_j1379 = null;
}
let _j1385 = null;
if (typeof _j50 === 'function') {
_j1385 = _j50();
}
if (typeof _j178 === 'function' && typeof _j616 !== 'undefined' && _j616 && _j1385) {
const _j1386 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j586 !== 'undefined') ? _j586 : 0,
duration: _j1385.duration,
iterations: _j1385.iterations,
totalFrames: _j1385.frames
};
console.log('🎬 Recording flow end event:', _j1386);
_j178('flow', _j1386);
if (typeof _j619 !== 'undefined') {
_j619 = millis();
}
}
_j110('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1385 ? Math.round(_j1385.duration) + 'ms' : 'unknown',
Iterations: _j1385 ? _j1385.iterations : 'unknown',
Frames: _j1385 ? _j1385.frames : 'unknown'
});
}
let _j1387 = {
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
_pushFR: function(_j1509) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1509;
this._frSum += _j1509;
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
const _j1388 = this._avgFR();
console.log('平均 frameRate:', _j1388.toFixed(2));
console.log('是否触发警告:', _j1388 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1389 = this.logCooldown;
this.logCooldown = 0;
const _j1390 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1390.toFixed(2));
_j36(_j1390);
this.logCooldown = _j1389;
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
const _j1388 = this._avgFR();
console.log('平均帧率:', _j1388);
const _j1389 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j36(_j1388);
this.logCooldown = _j1389;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1389 = this.logCooldown;
this.logCooldown = 0;
const _j1391 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1391);
_j36(_j1391);
this.logCooldown = _j1389;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1387 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1387).filter(k => typeof _j1387[k] === 'function'));
_j36(50);
};
function _j162() {
_j498 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j499 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j501 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j163() {
const _j472 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j472[0], _j472[1], _j472[2]);
if (typeof _j602 !== 'undefined' && _j602) {
_j602.begin();
clear();
background(255);
_j602.end();
}
if (typeof _j605 !== 'undefined' && _j605) {
_j605.begin();
clear();
background(255);
_j605.end();
}
if (typeof _j603 !== 'undefined' && _j603) {
_j603.clear();
}
if (typeof _j604 !== 'undefined' && _j604) {
_j604.begin();
clear();
background(255);
_j604.end();
}
if (typeof _j607 !== 'undefined' && _j607) {
_j607.clear();
_j607.background(255);
}
if (typeof _j610 !== 'undefined' && _j610) {
_j610.begin();
clear();
_j610.end();
}
if (typeof _j615 !== 'undefined' && _j615) {
_j615.begin();
clear();
background(0);
_j615.end();
}
_j535 = false;
_j536 = false;
_j557 = 0;
force = 1.0;
_j537 = false;
_j538 = false;
_j529 = 0;
x = hw;
y = hh;
_j513 = 0;
_j514 = 0;
_j515 = 0;
initialSize = 0;
_j518 = 0;
_j559 = 0;
pathPoints = [];
_j563 = false;
if (typeof _j566 !== 'undefined') {
_j566 = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j562 !== 'undefined') {
_j562 = null;
}
if (typeof _j567 !== 'undefined') {
_j567 = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j367 !== 'undefined') {
_j367 = null;
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
_j169();
_j166();
_j554 = true;
}
function _j164() {
_j110('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j165();
_j166();
_j168();
_j167();
_j110('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j165() {
_j602.begin();
clear();
background(255);
_j602.end();
_j605.begin();
clear();
background(255);
_j605.end();
_j603.clear();
_j604.begin();
clear();
background(255);
_j604.end();
_j607.clear();
_j607.background(255);
_j609.begin();
clear();
background(255);
_j609.end();
if (typeof _j613 !== 'undefined' && _j613) {
_j613.begin();
clear();
_j613.end();
}
_j610.begin();
clear();
_j610.end();
if (typeof _j615 !== 'undefined' && _j615) {
_j615.begin();
clear();
background(0);
_j615.end();
}
_j603.blendMode(BLEND);
_j607.blendMode(BLEND);
_j554 = true;
}
function _j166() {
if (!_j609 || !_j496) return;
if (_j496) {
_j609.begin();
if (_j580) {
image(_j605, 0, 0, width, height);
resetShader();
_j609.end();
return;
}
shader(_j496);
_j496.setUniform("rect", [0, 0, width * _j493, height * _j493]);
_j496.setUniform("tex0", _j605);
_j496.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j496.setUniform("forceMap", _j494);
_j496.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j496.setUniform("force", 1.0);
_j496.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j496.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j496.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j496.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j496.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j496.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j609.end();
}
}
function _j167() {
_j535 = false;
_j536 = false;
_j557 = 0;
force = 1.0;
_j537 = false;
_j538 = false;
_j529 = 0;
x = hw;
y = hh;
_j513 = 0;
_j514 = 0;
_j515 = 0;
initialSize = 0;
_j518 = 0;
_j516 = 0;
_j503 = 0;
_j558 = 0;
_j559 = 0;
pathPoints = [];
_j563 = false;
startX = hw;
startY = hh;
_j431 = hw;
_j432 = hh;
_j517 = 0;
_j526 = 0;
_j524 = hw;
_j525 = hh;
_j523 = [];
flyBrushEnd = [];
_j520 = 0;
_j628 = hw;
_j629 = hh;
_j630 = hw;
_j631 = hh;
_j632 = false;
_j634 = 0;
_j635 = false;
}
function _j168() {
_j494.begin();
shader(_j495);
_j495.setUniform("randomSeed1", _j596[0] || 100);
_j495.setUniform("randomSeed2", _j596[1] || 200);
_j495.setUniform("randomSeed3", _j596[2] || 300);
_j495.setUniform("randomSeed4", _j596[3] || 400);
_j495.setUniform("scale1", _j597[0] || 0.002);
_j495.setUniform("scale2", _j597[1] || 0.005);
_j495.setUniform("scale3", _j597[2] || 0.015);
_j495.setUniform("amplitude1", _j598[0] || 0.6);
_j495.setUniform("amplitude2", _j598[1] || 0.4);
_j495.setUniform("amplitude3", _j598[2] || 0.3);
_j495.setUniform("phase1", _j599[0] || 0);
_j495.setUniform("phase2", _j599[1] || 0);
_j495.setUniform("phase3", _j599[2] || 0);
_j495.setUniform("vortexScale1", _j600[0] || 0.008);
_j495.setUniform("vortexScale2", _j600[1] || 0.012);
_j495.setUniform("clusterScale1", _j601[0] || 0.001);
_j495.setUniform("clusterScale2", _j601[1] || 0.0008);
_j495.setUniform("canvasCenter", [hw, hh]);
_j495.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j494.end();
}
function _j169() {
for (let i = 0; i < 4; i++) {
_j596[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j597[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j598[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j599[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j600[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j601[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j168();
}
function _j170(title = '') {}
function _j171() {
_j172();
}
function _j172() {
_j169();
const _j1392 = brushMode;
brushMode = 1;
initialSize = 20;
_j518 = initialSize;
_j512 = _j518;
_j516 = _j512;
_j535 = true;
_j536 = false;
_j557 = 0;
_j537 = true;
_j538 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j30(_j605, 1.0);
}
mouseReleased();
_j536 = true;
_j557 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j30(_j605, force);
}
_j38();
brushMode = _j1392;
_j163();
}
function _j173() {
if (_j667) {
_j110('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j667 = true;
_j668 = millis();
frameCount = 0;
_j669 = [];
_j170('🎬 Start Frame Recording');
}
function _j174() {
if (!_j667) {
_j110('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j667 = false;
const _j1393 = millis() - _j668;
_j170('🎬 Frame Recording Complete');
_j176();
}
function _j175() {
if (!_j667) return;
if (frameCount % _j670 !== 0) {
frameCount++;
return;
}
const _j1394 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1394}.png`;
saveCanvas(filename, 'png');
_j669.push({
frame: frameCount,
timestamp: millis() - _j668,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j110('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j669.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j176() {
if (_j669.length === 0) {
_j110('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j110('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j669.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j177(_j1510) {
return Math.round(_j1510 * 100) / 100;
}
function _j178(type, data = {}) {
if (!_j616) return;
if (_j617 === 0) return;
const _j1395 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1396 = _j1395 + (millis() - _j617 - _j621);
const event = {
m: type,
t: Math.round(_j1396),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1397 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1398 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j110('recording', `${_j1397[type] || '📝'} Event recorded`, {
Type: _j1398[type] || type,
Time: `${_j1396.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j179() {
_j616 = true;
_j617 = 0;
_j619 = 0;
_j621 = 0;
_j622 = true;
_j503 = 0;
const _j1399 = seed;
const _j1400 = (typeof _j152 === 'function') ? _j152() : 0;
const _j1401 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1402 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1403 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1404 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1403[0] - rgb[0]) < 0.01 &&
Math.abs(_j1403[1] - rgb[1]) < 0.01 &&
Math.abs(_j1403[2] - rgb[2]) < 0.01) {
_j1404 = type;
break;
}
}
recordingData = {
version: "1.0",
startTime: _j617,
randomSeed: _j1399,
initialPathToggle: _j553,
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
shapeType: _j1400,
metallicStrength: _j1401,
metallicFlow: _j1402,
metallicTint: _j1403,
metallicTintType: _j1404
}
};
randomSeed(_j1399);
noiseSeed(_j1399);
_j170('🎬 Start Art Creation Recording');
if (typeof _j114 === 'function') {
_j114();
}
}
function _j180() {
if (!_j616) return;
_j616 = false;
randomSeed(seed);
noiseSeed(seed);
_j170('✨ Art Creation Recording Complete');
const _j1405 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j594 !== 'undefined' ? _j594.blendVol : 100,
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
_j181();
setTimeout(() => {
_j118();
}, 300);
if (typeof _j114 === 'function') {
_j114();
}
}
function _j181() {
if (recordingData.events.length === 0) {
_j110('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1406 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1407 = JSON.stringify(_j1406, null, 2);
const _j1408 = new Blob([_j1407], {
type: 'application/json'
});
const _j1409 = URL.createObjectURL(_j1408);
const _j1410 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1410.download = `drawing-recording-${timestamp}.json`;
_j1410.href = _j1409;
_j1410.click();
URL.revokeObjectURL(_j1409);
_j110('art', '💾 Art recording saved', {
File: _j1410.download,
Size: `${(_j1407.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j114 === 'function') {
_j114();
}
}
function _j182() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1344 = event.target.files[0];
if (!_j1344) return;
const _j1179 = new FileReader();
_j1179.onload = (e) => {
try {
const loadedData = JSON.parse(e.target.result);
if (!loadedData.version || !loadedData.events) {
_j110('system', '❌ Invalid recording file format', {
Status: 'Error'
});
return;
}
if (typeof window !== 'undefined') {
window.loadedRecordingData = JSON.parse(JSON.stringify(loadedData));
window.loadedRecordingFileName = _j1344.name;
}
recordingData = loadedData;
if (typeof _j566 !== 'undefined') {
_j566 = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j562 !== 'undefined') {
_j562 = null;
}
if (typeof _j567 !== 'undefined') {
_j567 = 0;
}
if (typeof _j226 !== 'undefined') {
_j226 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j170('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1411 = _j188(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1411) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1344.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j612 !== 'undefined' && _j612) {
_j612.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j612.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j135 === 'function') {
_j135();
}
_j110('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
setTimeout(() => {
startPlayback();
}, 500);
} catch (error) {
_j110('system', '❌ Failed to load recording', {
Error: error.message,
Status: 'Error'
});
}
};
_j1179.readAsText(_j1344);
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
_j110('system', '⚠️ No recording data to play', {
Status: 'Error'
});
return;
}
if (_j624) {
_j110('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j1036 !== 'undefined') {
_j1036 = [];
}
if (typeof _j1037 !== 'undefined') {
_j1037 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1412 = window.location.search || '';
const _j1413 = (key) => _j1412.includes('_' + key + ':') || _j1412.includes('?' + key + ':');
const _j1414 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1415 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1416 = recordingData.initialPanelToggles;
for (const _j1417 of _j1414) {
const urlKey = _j1415[_j1417.jsonKey];
if (urlKey && _j1413(urlKey)) continue;
const value = _j1416 ? _j1416[_j1417.jsonKey] : undefined;
const _j1418 = value !== undefined ? value : _j1417.defaultVal;
_j1417.setter(_j1418);
const _j1419 = document.getElementById(_j1417.toggleId);
if (_j1419) {
_j1419.checked = _j1417.isNumeric ? (_j1418 === 1) : !!_j1418;
}
}
const _j1420 = recordingData.events.filter(e => e.m === 'mp').length;
const _j1421 = recordingData.events.filter(e => e.m === 'md').length;
if (window.skipClearCanvasOnNextPlayback) {
window.skipClearCanvasOnNextPlayback = false;
console.log('[append] ✅ skip clearCanvas, overlay playback', { mp: _j1420, md: _j1421, totalEvents: recordingData.events.length });
} else {
console.log('[startPlayback] ❌ standard mode, will clear canvas', { mp: _j1420, md: _j1421, totalEvents: recordingData.events.length });
_j163();
if (typeof clearMask === 'function') clearMask();
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j612 !== 'undefined' && _j612) {
_j612.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j612.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j554 !== 'undefined') {
_j554 = true;
}
if (typeof _j135 === 'function') {
_j135();
}
_j110('playback', '🎨 Background color restored', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
_j110('playback', 'Random seed reset', {
Seed: recordingData.randomSeed
});
} else {
_j110('system', '⚠️ No seed info in recording, playback may be inaccurate', {
Status: 'Warning'
});
}
_j624 = true;
_j625 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j626 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof _j567 !== 'undefined') {
_j567 = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j643 !== 'undefined') {
_j643 = 0;
}
_j632 = false;
_j628 = hw;
_j629 = hh;
_j630 = hw;
_j631 = hh;
_j559 = 0;
if (typeof _j666 !== 'undefined') {
_j666 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j562 !== 'undefined') {
_j562 = null;
}
if (typeof _j563 !== 'undefined') {
_j563 = false;
}
if (typeof _j566 !== 'undefined') {
_j566 = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j226 !== 'undefined') {
_j226 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j661 !== 'undefined') {
_j661 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j662 !== 'undefined') {
_j662 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j503 = 0;
_j634 = 0;
_j635 = false;
if (recordingData.initialPathToggle !== undefined) {
_j553 = recordingData.initialPathToggle;
_j110('playback', 'Path toggle restored', {
Status: _j553 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1192 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j110('playback', 'Brush color restored', {
Mode: _j1192[brushColorMode] || 'Unknown'
});
} else if (recordingData.initialWhiteBrushMode !== undefined) {
whiteBrushMode = recordingData.initialWhiteBrushMode;
brushColorMode = whiteBrushMode ? 1 : 0;
_j110('playback', 'Brush color restored (legacy)', {
Mode: whiteBrushMode ? "White ⚪" : "Black ⚫"
});
} else {
whiteBrushMode = false;
brushColorMode = 0;
}
_j170('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j153 === 'function') {
_j153(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1357 = document.getElementById('metallic-strength');
const _j1358 = document.getElementById('metallic-strength-value');
if (_j1357 && _j1358) {
_j1357.value = ec.metallicStrength;
_j1358.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1359 = document.getElementById('metallic-flow');
const _j1360 = document.getElementById('metallic-flow-value');
if (_j1359 && _j1360) {
_j1359.value = ec.metallicFlow;
_j1360.textContent = ec.metallicFlow;
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
const _j1422 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1422);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
}
}
_j110('playback', '✨ Effect Control restored', {
ShapeType: ec.shapeType !== undefined ? ec.shapeType : 'Unknown',
Strength: ec.metallicStrength !== undefined ? ec.metallicStrength : 'Unknown',
Flow: ec.metallicFlow !== undefined ? ec.metallicFlow : 'Unknown',
Tint: ec.metallicTintType || 'Unknown'
});
}
const _j1423 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1424 = window.location.search || '';
const _j1425 = (key) => _j1424.includes('_' + key + ':') || _j1424.includes('?' + key + ':');
for (const _j1417 of _j1423) {
if (_j1425(_j1417.urlKey)) continue;
_j1417.setter(false);
const _j1419 = document.getElementById(_j1417.toggleId);
if (_j1419) {
_j1419.checked = false;
}
const _j1426 = document.getElementById(_j1417.slidersId);
if (_j1426) {
_j1426.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1427 = document.getElementById('distort-fbm-preview-toggle');
if (_j1427) _j1427.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1428 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1428)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j110('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j594 !== 'undefined') {
_j594.blendVol = fe.flowStrength;
const _j1429 = document.getElementById('flow-strength');
const _j1430 = document.getElementById('flow-strength-value');
if (_j1429) _j1429.value = fe.flowStrength;
if (_j1430) _j1430.textContent = fe.flowStrength;
}
for (const _j1417 of _j1423) {
const value = fe[_j1417.jsonKey];
if (value === undefined) continue;
if (_j1425(_j1417.urlKey)) {
_j110('playback', `⏭️ Flow Effect: ${_j1417.jsonKey} skipped (URL override)`, {});
continue;
}
_j1417.setter(!!value);
const _j1419 = document.getElementById(_j1417.toggleId);
if (_j1419) {
_j1419.checked = !!value;
}
const _j1426 = document.getElementById(_j1417.slidersId);
if (_j1426) {
_j1426.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1427 = document.getElementById('distort-fbm-preview-toggle');
if (_j1427) _j1427.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1431 = document.getElementById('distort-displacement-b');
const _j1432 = document.getElementById('distort-displacement-b-value');
if (_j1431) _j1431.value = fe.distortDisplacementB;
if (_j1432) _j1432.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1433 = document.getElementById('distort-displacement-c');
const _j1434 = document.getElementById('distort-displacement-c-value');
if (_j1433) _j1433.value = fe.distortDisplacementC;
if (_j1434) _j1434.textContent = fe.distortDisplacementC;
}
_j110('playback', '✨ Flow Effect restored', {
Strength: fe.flowStrength,
Distort: !!fe.distortShaderEnabled ? 'ON' : 'OFF',
Cellular: !!fe.cellularEnabled ? 'ON' : 'OFF',
RS: !!fe.rsEnabled ? 'ON' : 'OFF',
WhiteDot: !!fe.whiteDotEnabled ? 'ON' : 'OFF',
Grain: !!fe.grainEnabled ? 'ON' : 'OFF'
});
} else {
_j110('playback', '🔄 Flow Effect: reset to defaults (no initialFlowEffect in JSON)', {});
}
if (_j1416) {
_j110('playback', '✨ Panel toggles restored', {
Paper: _j1416.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1416.showGridOverlay ? 'ON' : 'OFF',
Path: _j1416.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1416.screenText ? 'ON' : 'OFF',
Camera: _j1416.doMoving ? 'ON' : 'OFF',
Loop: _j1416.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j110('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j169();
_j166();
const _j1435 = recordingData.events[0];
if (_j1435 && _j1435.strokeData) {
const strokeData = _j1435.strokeData;
_j518 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j518;
nowSize = size;
}
_j30(_j605, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j639 === 'undefined' || !_j639) {
_j639 = true;
}
_j640 = true;
if (_j639 && _j638 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j414 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j414 / 2));
_j638.setAutoUpdate(true);
if (typeof _j638.setPanScale === 'function') {
_j638.setPanScale(0);
}
if (typeof _j638.setZoomScale === 'function') {
_j638.setZoomScale(0);
}
_j638.setCenter([0, 0, 0], 0);
_j638.setDistance(easycamInitialDistance, 0);
if (typeof _j645 !== 'undefined') {
_j645 = 1;
}
_j110('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j640 = false;
_j639 = false;
}
if (typeof _j114 === 'function') {
_j114();
}
}
function _j183() {
if (!_j624) return;
_j624 = false;
_j632 = false;
_j626 = 0;
isWaitingToLoop = false;
_j634 = 0;
_j635 = false;
randomSeed(seed);
noiseSeed(seed);
_j170('⏹️ Playback Ended');
_j186();
_j640 = false;
if (_j639 && _j638 !== null) {
try {
const _j413 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j416 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j417 = _j638.getCenter();
const _j418 = _j638.getDistance();
_j110('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j417[0].toFixed(2)}, ${_j417[1].toFixed(2)}, ${_j417[2].toFixed(2)}], Distance: ${_j418.toFixed(2)}`,
Target: `Center: [${_j413[0].toFixed(2)}, ${_j413[1].toFixed(2)}, ${_j413[2].toFixed(2)}], Distance: ${_j416.toFixed(2)}`
});
_j651 = true;
_j652 = millis();
_j649 = [_j417[0], _j417[1], _j417[2]];
_j653 = _j418;
_j650 = _j413;
_j654 = _j416;
setTimeout(() => {
if (_j638 !== null) {
_j638.setAutoUpdate(false);
const _j425 = _j638.getCenter();
const _j426 = _j638.getDistance();
const _j419 = 0.1;
const _j420 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j425[0] - _j413[0], 2) +
Math.pow(_j425[1] - _j413[1], 2) +
Math.pow(_j425[2] - _j413[2], 2)
);
const distanceDiff = Math.abs(_j426 - _j416);
_j110('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j425[0].toFixed(2)}, ${_j425[1].toFixed(2)}, ${_j425[2].toFixed(2)}], Distance: ${_j426.toFixed(2)}`,
Target: `Center: [${_j413[0].toFixed(2)}, ${_j413[1].toFixed(2)}, ${_j413[2].toFixed(2)}], Distance: ${_j416.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j419 && distanceDiff <= _j420) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j419 || distanceDiff > _j420) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j425[0].toFixed(3)}, ${_j425[1].toFixed(3)}, ${_j425[2].toFixed(3)}]`,
distance: _j426.toFixed(3)
}
});
_j638.setCenter(_j413, 0);
_j638.setDistance(_j416, 0);
const _j1436 = _j638.getCenter();
const _j1437 = _j638.getDistance();
_j110('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1436[0].toFixed(2)}, ${_j1436[1].toFixed(2)}, ${_j1436[2].toFixed(2)}]`,
Distance: _j1437.toFixed(2)
});
}
_j651 = false;
}
_j639 = false;
}, 2100);
_j110('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j413,
Distance: _j416.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j639 = false;
}
} else {
_j639 = false;
}
if (typeof _j114 === 'function') {
_j114();
}
}
window.startPlayback = startPlayback;
function _j184(event) {
const _j853 = event.m || event.type;
switch (_j853) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('playback_mousePressed_start', 'mousePressed');
const _j1438 = _j536;
const _j1439 = event.t !== undefined ? event.t : event.time;
if (_j536) {
const _j763 = _j625;
if (window._fxVirtualTime === undefined) {
_j625 = millis() - _j1439 / _j627;
}
const _j1440 = _j763 - _j625;
const _j762 = (typeof _j634 !== 'undefined' && _j634 > 0) ?
(millis() - _j634) :
0;
if (typeof _j635 !== 'undefined') {
_j635 = false;
}
if (typeof _j634 !== 'undefined') {
_j634 = 0;
}
_j38();
_j536 = false;
_j557 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1441 = _j1439 - playbackLastStrokeEndEventTime;
const _j1442 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1443 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j39();
if (typeof _j1036 !== 'undefined') {
_j1036 = [];
}
if (typeof _j1037 !== 'undefined') {
_j1037 = 0;
}
if (typeof _j643 !== 'undefined') {
_j643++;
if (typeof _j646 !== 'undefined' && typeof _j644 !== 'undefined') {
_j646 = random(0, 1) > 0.7;
_j644 = _j643;
}
}
_j628 = event.x + (typeof _j636 !== 'undefined' ? _j636 : 0);
_j629 = event.y + (typeof _j637 !== 'undefined' ? _j637 : 0);
_j630 = _j628;
_j631 = _j629;
if (false) {
_j632 = true;
} else {
_j632 = false;
}
if (typeof _j666 !== 'undefined') {
_j666 = true;
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
_j560 = sd.mouseCountStart;
} else {
_j560 = 0;
}
_j558 = 0;
const offsetX = typeof _j636 !== 'undefined' ? _j636 : 0;
const offsetY = typeof _j637 !== 'undefined' ? _j637 : 0;
const _j1444 = event.x + offsetX;
const _j1445 = event.y + offsetY;
_j110('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1444.toFixed(0)}, ${_j1445.toFixed(0)})`
});
_j110('system', '|--------------------------------', {});
} else {
_j110('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j558 = 0;
}
_j503 = 0;
_j529 = 0;
x = _j628;
y = _j629;
_j513 = 0;
_j514 = 0;
_j515 = 0;
_j526 = 0;
_j520 = 0;
_j559 = 0;
_j557 = 0;
_j536 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j1036 !== 'undefined') {
_j1036 = [];
}
if (typeof _j527 !== 'undefined') {
_j527 = _j628;
_j528 = _j629;
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
_j508 = sd.step !== undefined ? sd.step : 4;
_j565 = sd.step2 !== undefined ? sd.step2 : 2;
randStep = sd.randStep !== undefined ? sd.randStep : 0;
maxUpdates = sd.maxUpdates !== undefined ? sd.maxUpdates : 30;
pathRotation = sd.pathRotation !== undefined ? sd.pathRotation : 0;
_j510 = sd.spring !== undefined ? sd.spring : 0.6;
_j511 = sd.friction !== undefined ? sd.friction : 0.5;
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
_j504 = sd.whiteMaxOpacity;
} else {
_j504 = 0.95;
}
if (sd.hueShift !== undefined) {
_j505 = sd.hueShift;
} else {
_j505 = 0.0;
}
if (sd.satShift !== undefined) {
_j506 = sd.satShift;
} else {
_j506 = 0.0;
}
if (sd.briShift !== undefined) {
_j507 = sd.briShift;
} else {
_j507 = 0.0;
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
_j546 = sd.maskData;
if (sd.maskData.action === 'rect') {
drawMaskRect(sd.maskData.x1, sd.maskData.y1, sd.maskData.x2, sd.maskData.y2);
} else if (sd.maskData.action === 'polygon') {
drawMaskPolygon(sd.maskData.points);
}
} else {
_j546 = null;
if (_j542) clearMask();
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j596[0] = fm.randomSeed1;
_j596[1] = fm.randomSeed2;
_j596[2] = fm.randomSeed3;
_j596[3] = fm.randomSeed4;
_j597[0] = fm.scale1;
_j597[1] = fm.scale2;
_j597[2] = fm.scale3;
_j598[0] = fm.amplitude1;
_j598[1] = fm.amplitude2;
_j598[2] = fm.amplitude3;
_j599[0] = fm.phase1;
_j599[1] = fm.phase2;
_j599[2] = fm.phase3;
_j600[0] = fm.vortexScale1;
_j600[1] = fm.vortexScale2;
_j601[0] = fm.clusterScale1;
_j601[1] = fm.clusterScale2;
_j168();
} else {
if (typeof _j169 === 'function') {
_j169();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j518 = initialSize;
_j512 = _j518;
_j516 = _j512;
_j529 = 0;
x = _j628;
y = _j629;
_j513 = 0;
_j514 = 0;
_j515 = 0;
_j526 = 0;
_j520 = 0;
_j535 = true;
_j536 = false;
_j557 = 0;
_j537 = true;
_j538 = false;
_j559 = 0;
startX = _j628;
startY = _j629;
pathPoints = [{
x: _j628,
y: _j629
}];
_j563 = true;
_j632 = true;
if (_j539) window._playbackPenPressure = -1;
_j30(_j605, 1.0);
crandomDebugger.checkpoint('playback_mousePressed_end', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j628 = event.x + (typeof _j636 !== 'undefined' ? _j636 : 0);
_j629 = event.y + (typeof _j637 !== 'undefined' ? _j637 : 0);
if (_j539 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j539) window._playbackPenPressure = -1;
const _j808 = crandom.getCount();
const _j1446 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1446;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('playback_mouseReleased', 'mouseReleased');
const _j1447 = crandom.getCount();
const _j813 = _j1447 - _j808;
const _j1448 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j844 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j853 = e.m || e.type;
return _j853 === 'mr' || _j853 === 'mouseReleased';
}).length :
'?';
const _j814 = window.drawLoopCount || 0;
const _j1449 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 playback [stroke ${_j1448}/${_j844}] | Draw: ${_j814} | Seed: ${_j1447}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1448);
crandomDebugger.compareStroke(_j1448);
_j628 = event.x + (typeof _j636 !== 'undefined' ? _j636 : 0);
_j629 = event.y + (typeof _j637 !== 'undefined' ? _j637 : 0);
_j632 = false;
if (!_j536) {
_j536 = true;
_j557 = 0;
if (typeof _j634 !== 'undefined') {
_j634 = millis();
}
if (typeof _j635 !== 'undefined') {
_j635 = true;
}
_j110('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j110('playback', 'Stroke reproduction complete', {
FinalSize: _j518.toFixed(2),
CountdownStatus: _j536 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j632) {
_j632 = true;
} else {
_j630 = _j628;
_j631 = _j629;
}
_j628 = event.x + (typeof _j636 !== 'undefined' ? _j636 : 0);
_j629 = event.y + (typeof _j637 !== 'undefined' ? _j637 : 0);
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
_j151();
_j110('playback', '⌨️ Simulate key: R', {
'Effect': 'Wet Ink'
});
} else if (k === 'p' || k === 'P') {} else if (k === 'o' || k === 'O') {
_j110('playback', '⌨️ Simulate key: O', {
'Loop toggle': 'Ignored during playback'
});
}
break;
case 'ec':
case 'effectControl':
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
const _j1450 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1451 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1367 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1367;
const _j799 = document.getElementById('bugs-size');
const _j800 = document.getElementById('bugs-size-value');
if (_j799 && _j800) {
_j799.value = _j1367;
_j800.textContent = _j1367;
}
}
const _j798 = {
action: action,
shapeType: _j1451,
bugsSize: _j1367,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1452 = null;
let _j1453 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j798);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1452 = window._scanGlobalPlaybackCount || 0;
_j1453 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1367;
}
const _j801 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1451);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1451);
}
}
if (_j801) {
randomSeed(_j801);
noiseSeed(_j801);
}
}
_j110('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1450,
ShapeType: _j1451 !== null ? _j1451 : 'Unknown',
BugsSize: _j1367,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1452,
CurrentCount: _j1453
});
} else if (action === 'scan-random') {
const _j1451 = event.shapeType !== undefined ? event.shapeType : null;
const _j1367 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1367;
const _j799 = document.getElementById('bugs-size');
const _j800 = document.getElementById('bugs-size-value');
if (_j799 && _j800) {
_j799.value = _j1367;
_j800.textContent = _j1367;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1451);
}
_j110('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1451 !== null ? _j1451 : 'Unknown',
BugsSize: _j1367
});
} else if (action === 'metallic-strength') {
const _j1358 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1358 / 100;
}
const _j1357 = document.getElementById('metallic-strength');
const _j1454 = document.getElementById('metallic-strength-value');
if (_j1357 && _j1454) {
_j1357.value = _j1358;
_j1454.textContent = _j1358;
}
_j110('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1358
});
} else if (action === 'bugs-size') {
const _j1367 = event.value !== undefined ? event.value : 10;
const _j799 = document.getElementById('bugs-size');
const _j800 = document.getElementById('bugs-size-value');
if (_j799 && _j800) {
_j799.value = _j1367;
window.bugsSize = _j1367;
_j800.textContent = _j1367;
_j110('system', '🐛 Bugs Size updated during playback', {
Value: _j1367
});
}
} else if (action === 'metallic-flow') {
const _j1360 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1360 / 100;
}
const _j1359 = document.getElementById('metallic-flow');
const _j1455 = document.getElementById('metallic-flow-value');
if (_j1359 && _j1455) {
_j1359.value = _j1360;
_j1455.textContent = _j1360;
}
_j110('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1360
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
const _j1422 = `metal-${tintType}`;
const btn = document.getElementById(_j1422);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
_j110('playback', '✨ Effect Control: Metal Tint', {
Tint: tintType,
RGB: `[${tintButtons[tintType].join(', ')}]`,
Applied: true
});
} else {
_j110('playback', '⚠️ Effect Control: Metal Tint (Unknown)', {
Tint: tintType,
Status: 'Unknown tint type, skipped'
});
}
}
break;
case 'flow':
if (event.action === 'start') {
if (typeof _j581 !== 'undefined' && _j581) {
if (typeof _j50 === 'function') {
_j50();
}
_j110('playback', '🌊 Flow Effect: previous effect forced to complete');
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
if (event.strength !== undefined && typeof _j594 !== 'undefined') {
_j594.blendVol = event.strength;
}
if (typeof _j595 !== 'undefined') {
_j595 = event.lastStrokeOnly || false;
}
if (typeof _j49 === 'function') {
_j49(event.blendType, event.flowSeed, true);
}
_j110('playback', '🌊 Flow Effect: Start (preview)', {
BlendType: event.blendType,
Seed: event.flowSeed,
Bounds: event.strokeBounds ? `[${event.strokeBounds.minX.toFixed(2)}, ${event.strokeBounds.minY.toFixed(2)}, ${event.strokeBounds.maxX.toFixed(2)}, ${event.strokeBounds.maxY.toFixed(2)}]` : 'None'
});
} else if (event.action === 'end') {
const _j1456 = window.pendingFlowEvent;
if (_j1456) {
if (typeof _j590 !== 'undefined') {
_j590 = event.totalFrames || (event.iterations * 3) || 30;
_j591 = event.iterations || 10;
}
_j110('playback', '🌊 Flow Effect: End (target set, wait for preview)', {
BlendType: _j1456.blendType,
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
_j110('playback', '🎭 Mask rect applied', {
Region: `(${event.x1.toFixed(0)},${event.y1.toFixed(0)})→(${event.x2.toFixed(0)},${event.y2.toFixed(0)})`
});
} else if (event.action === 'polygon') {
drawMaskPolygon(event.points);
_j110('playback', '🎭 Mask polygon applied', {
Points: event.points.length
});
} else if (event.action === 'clear') {
clearMask();
_j110('playback', '🎭 Mask cleared');
}
break;
}
}
function updatePlayback() {
if (!_j624) return;
const _j1457 = 200;
if (typeof window !== 'undefined') {
const _j1458 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1459 = millis() - window.lastEffectControlProcessTime;
if (_j1459 < _j1457) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1458 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1460 = millis() - _j633;
const _j1461 = Math.floor(_j1460 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1461) {}
if (_j1460 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ Countdown finished, preparing replay');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j110('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j639 && _j638 !== null) {
const _j413 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j416 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j638.setCenter(_j413, 0);
_j638.setDistance(_j416, 0);
_j651 = false;
_j110('system', '🎥 Camera reset for loop', {
Center: `[${_j413[0].toFixed(2)}, ${_j413[1].toFixed(2)}, ${_j413[2].toFixed(2)}]`,
Distance: _j416.toFixed(2)
});
}
_j163();
if (typeof _j1036 !== 'undefined') {
_j1036 = [];
}
if (typeof _j1037 !== 'undefined') {
_j1037 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j625 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j626 = 0;
_j632 = false;
_j628 = hw;
_j629 = hh;
_j630 = hw;
_j631 = hh;
isWaitingToLoop = false;
_j559 = 0;
_j503 = 0;
_j634 = 0;
_j635 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j562 !== 'undefined') {
_j562 = null;
}
if (typeof _j563 !== 'undefined') {
_j563 = false;
}
if (typeof _j661 !== 'undefined') {
_j661 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j662 !== 'undefined') {
_j662 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j567 !== 'undefined') {
_j567 = 0;
}
if (window._initialConsoleFromURL === true && typeof window.screenText !== 'undefined') {
window.screenText = true;
const screenTextToggle = typeof document !== 'undefined' && document.getElementById ? document.getElementById('screen-text-toggle') : null;
if (screenTextToggle) {
screenTextToggle.checked = true;
}
}
window.showStrokeDivider = true;
_j110('playback', '🔁 Loop restart', {
Status: 'New round playback'
});
} else {
_j110('playback', '⏹️ Playback ended', {
Status: 'Single playback complete, no more loops'
});
_j183();
}
}
return;
}
if (_j626 >= recordingData.events.length && !isWaitingToLoop) {
if (_j632) {
_j632 = false;
if (!_j536) {
_j536 = true;
_j557 = 0;
_j554 = true;
}
}
if (_j536) {
if (_j557 < maxUpdates) {
return;
}
}
if (_j535) {
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
window._fxDebug.eventsProcessed = _j626;
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
function _j185() {
console.log('[fxhash] Forcing final composite + capture...');
_j554 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j639 && _j638 !== null) {
_j651 = true;
_j652 = millis();
_j649 = [_j638.getCenter()[0], _j638.getCenter()[1], _j638.getCenter()[2]];
_j653 = _j638.getDistance();
_j650 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j654 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1462 = _j655 + 500;
console.log('[fxhash] Waiting ' + _j1462 + 'ms for camera reset before capture...');
setTimeout(_j185, _j1462);
} else {
_j185();
}
}
_j110('playback', 'Playback complete', {
Status: 'Waiting 30 seconds before loop'
});
if (window.DEBUG_MODE) console.log('✅ Starting countdown:', {
loopWaitDuration: loopWaitDuration,
startTime: millis()
});
isWaitingToLoop = true;
_j633 = millis();
} else {
_j110('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle is not 1, stopping playback');
_j183();
}
return;
}
var _j768;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j768 = window._fxVirtualTime * _j627;
} else {
_j768 = (millis() - _j625) * _j627;
}
let _j1463 = 0;
const _j1464 = 100;
let _j1465 = 0;
const _j1466 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1467 = false;
while (_j626 < recordingData.events.length && _j1463 < _j1464) {
if (typeof _j581 !== 'undefined' && _j581 &&
typeof _j590 !== 'undefined' && _j590 > 0) {
break;
}
const event = recordingData.events[_j626];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j853 = event.m || event.type;
const _j1468 = _j853 === 'mp' || _j853 === 'mousePressed';
const _j1469 = _j853 === 'mr' || _j853 === 'mouseReleased';
const _j1470 = _j853 === 'ec' || _j853 === 'effectControl';
const _j1471 = _j853 === 'flow';
const _j1472 = _j853 === 'mask';
const _j769 = eventTime - _j768;
if (!_j1470 && !_j1471 && !_j1472 && eventTime > _j768 && _j626 + 1 < recordingData.events.length) {
const _j764 = recordingData.events[_j626 + 1];
const _j765 = _j764.m || _j764.type;
const _j766 = _j765 === 'mp' || _j765 === 'mousePressed';
if (_j766) {
if (_j1469) {
if (_j1467) {
break;
}
_j184(event);
_j626++;
_j1463++;
continue;
} else {
_j626++;
continue;
}
}
}
if (eventTime <= _j768) {
const _j1473 = _j853 === 'md' || _j853 === 'mouseDragged';
if (_j1473 && _j1465 >= _j1466) {
break;
}
if (_j1469 && _j1467) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1470 || _j1472 || !_j536 || (_j536 && _j632)) {
if (_j1470) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j184(event);
_j626++;
_j1463++;
if (_j1473) {
_j1465++;
_j1467 = true;
}
} else {
break;
}
} else {
const _j1473 = _j853 === 'md' || _j853 === 'mouseDragged';
if (_j1473 && _j1465 >= _j1466) {
break;
}
if (_j1469 && _j1467) {
break;
}
if (_j1470 || _j1471 || _j1472 || (_j1468 && !_j536) || _j769 < 100) {
if (_j1470) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j184(event);
_j626++;
_j1463++;
if (_j1473) {
_j1465++;
_j1467 = true;
}
} else {
break;
}
}
if (_j1465 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j186() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1474 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1474) {
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
const _j1475 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1476 = confirm(
`Playback complete.\n\n` +
`Events played: ${loadedData.events.length}\n` +
`File: ${_j1475}\n\n` +
`Continue recording and append new strokes?\n\n` +
`OK — continue recording\n` +
`Cancel — stop`
);
if (_j1476) {
_j187(loadedData, _j1475);
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
function _j187(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j110('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j179();
return;
}
const _j1477 = loadedData.events[loadedData.events.length - 1];
const _j1405 = _j1477.t !== undefined ? _j1477.t : (_j1477.time !== undefined ? _j1477.time : 0);
_j616 = true;
_j617 = millis();
_j619 = 0;
_j621 = 0;
_j622 = true;
_j503 = 0;
recordingData = {
...loadedData,
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1405,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1399 = seed;
randomSeed(_j1399);
noiseSeed(_j1399);
_j170('🔄 Continue Recording from Loaded File');
_j110('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1405}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j114 === 'function') {
_j114();
}
}
function _j188(_j1511, _j1512) {
if (!_j1511 || !_j1512) {
_j110('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1511 && height === _j1512) {
_j110('system', '✅ Canvas size matches recording', {
Width: `${_j1511}px`,
Height: `${_j1512}px`
});
return false;
}
_j110('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1511}x${_j1512}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1511.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1512.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j110('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1511}x${_j1512}`
});
window.location.reload();
return true;
}
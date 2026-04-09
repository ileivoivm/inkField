function _j1(_j1484, _j1485) {
var _j192 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1484];
var _j193 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1485];
if (_j192 && _j193 && typeof createShader === 'function') {
return createShader(_j192, _j193);
}
return window['loadShader'](_j1484, _j1485);
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
const _j194 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j194,
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
const _j195 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j195.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j195.forEach((_j625, _j303) => {
console.log(`[${_j625.count}] args: [${_j625.args.join(', ')}]`);
if (_j625.caller) {
console.log(`    位置: ${_j625.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j196 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j196 > 0 ? '+' : ''}${_j196}`);
console.log('═══════════════════════════════════════');
return _j196;
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
const _j197 = playback.totalCount - recording.totalCount;
const percent = ((_j197 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j197) < 50 ? '✅' : Math.abs(_j197) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j197 > 0 ? '+' : ''}${_j197} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j198 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j199 = Array.from(_j198).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j200 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j200 === -1) return 0;
if (indexA === -1) return 1;
if (_j200 === -1) return -1;
return indexA - _j200;
});
let _j201 = 0;
const _j202 = [];
for (const stage of _j199) {
const recCount = recDeltas.get(stage) || 0;
const _j203 = playDeltas.get(stage) || 0;
const _j196 = _j203 - recCount;
_j201 += _j196;
if (Math.abs(_j196) > 0) {
_j202.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j203,
difference: _j196
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j202.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j204 = _j202.filter(d => Math.abs(d.difference) > 50);
if (_j204.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j204.length); i++) {
const d = _j204[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j205 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j206 = checkpoints[i];
const _j207 = checkpoints[i + 1];
if (_j207) {
const _j208 = `${_j206.name} → ${_j207.name}`;
const _j209 = _j207.count - _j206.count;
_j205.set(_j208, _j209);
}
}
return _j205;
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
const _j210 = [{
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
const _j211 = {};
_j210.forEach(color => {
_j211[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j211;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j212 = r > 20;
const _j213 = g > 20;
const _j214 = b > 20;
if (_j212 && _j213 && _j214) return 'rgb';
if (_j212 && _j213) return 'rg';
if (_j212 && _j214) return 'rb';
if (_j213 && _j214) return 'gb';
if (_j212) return 'r';
if (_j213) return 'g';
if (_j214) return 'b';
return 'rgb';
}
function _j4() {
let _j215 = '// ============================================\n';
_j215 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j215 += '// ============================================\n';
_j210.forEach(color => {
const [r, g, b] = color.rgb;
const _j216 = `COLOR_${color.name.toUpperCase()}`;
_j215 += `const vec3 ${_j216} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j215 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j215;
}
function _j5() {
let _j215 = '';
_j210.forEach((color, _j303) => {
const _j216 = `COLOR_${color.name.toUpperCase()}`;
if (_j303 === 0) {
_j215 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j215 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j215 += `        brushColor = ${_j216};\n`;
});
_j215 += `    }\n`;
return _j215;
}
function _j6() {
return _j210.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j210.find(c => c.id === id);
}
function _j8(name) {
return _j210.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j210,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j217 = null;
let _j218 = 0;
const _j219 = 2000;
function _j9(_j521 = 120, _j1486 = 12, _j1487 = 10, _j1488 = 5) {
const _j220 = Math.min(width, _j219);
const _j221 = Math.min(height, _j219);
const _j222 = (width > _j219 || height > _j219);
randomSeed(seed);
const _j223 = _j10(_j521, _j1488);
const _j224 = createGraphics(_j220, _j221, P2D);
const _j225 = createGraphics(_j220, _j221, P2D);
for (let i = -_j521; i < _j220 + _j521; i += _j220 / 500) {
for (let j = -_j521; j < _j221 + _j521; j += _j1486) {
_j224.image(_j223, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1487);
}
}
_j223.remove();
if (doSpotNoise) {
padfactor = 300;
_j225.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j220)
y = random(_j221)
_j225.push()
_j225.strokeWeight(random(1, 2))
_j225.stroke(0, random(10, 250))
_j225.noFill();
_j225.bezier(
random(-padfactor, _j220 + padfactor),
random(-padfactor, _j221 + padfactor),
random(-padfactor, _j220 + padfactor),
random(-padfactor, _j221 + padfactor),
random(-padfactor, _j220 + padfactor),
random(-padfactor, _j221 + padfactor),
random(-padfactor, _j220 + padfactor),
random(-padfactor, _j221 + padfactor)
);
_j225.pop();
}
_j224.blendMode(DIFFERENCE);
_j224.image(_j225, 0, 0, _j220, _j221);
_j225.remove();
}
if (_j222) {
const _j226 = createGraphics(width, height);
_j226.image(_j224, 0, 0, width, height);
_j224.remove();
return _j226;
}
return _j224;
}
function _j10(_j1489 = 64, _j1488 = 0.5) {
const _j223 = createGraphics(_j1489, _j1489);
_j223.pixelDensity(1);
_j223.noSmooth();
_j223.clear();
_j223.noFill();
_j223.translate(_j1489 / 2, _j1489 / 2);
_j223.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j227 = 0.5 + crandom.random(0, 1) * 0.5;
const _j228 = pow(_j227, _j1488) * 255;
_j223.stroke(_j228, _j228, _j228, 255);
const radius = crandom.random() * _j1489 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j223.point(x, y);
}
_j223.resetMatrix();
return _j223;
}
let _j229 = [];
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
const _j230 = 8;
const _j231 = [];
for (let i = 0; i < _j230; i++) {
_j231.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j232 = floor(_j231[0].numCirclesRand);
for (let i = 0; i < _j232; i++) {
const _j233 = _j231[i];
circles.push({
x: cos(_j233.angle) * _j233.distance,
y: sin(_j233.angle) * _j233.distance,
radius: _j233.circleSize
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
const _j234 = [];
const _j235 = 3;
const _j236 = 48;
const _j231 = [];
const _j237 = crandom.random(1, 4);
const _j238 = crandom.random(0.4, 0.6);
const _j239 = floor(_j237);
for (let _j240 = 0; _j240 < _j235; _j240++) {
const _j241 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j240 * 500
};
_j231.push(_j241);
}
for (let _j240 = 0; _j240 < _j239; _j240++) {
const _j241 = _j231[_j240];
const offsetX = _j241.offsetX;
const offsetY = _j241.offsetY;
const layerRotation = _j241.layerRotation;
const sizeVariation = _j241.sizeVariation;
const _j242 = size * sizeVariation;
const _j243 = floor(_j241.numVerticesRand);
const noiseOffset = _j241.noiseOffset;
const _j244 = [];
for (let i = 0; i < _j243; i++) {
const angle = (i / _j243) * TWO_PI;
const _j245 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j246 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j247 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j248 = _j245 * 0.5 + _j246 * 0.3 + _j247 * 0.2;
const radius = _j242 * (0.4 + _j248 * _j238);
const _j249 = cos(angle) * radius;
const _j250 = sin(angle) * radius;
_j244.push({
x: _j249,
y: _j250
});
}
const _j251 = [];
for (let i = 0; i < _j244.length; i++) {
const _j252 = _j244[(i - 1 + _j244.length) % _j244.length];
const _j253 = _j244[i];
const _j207 = _j244[(i + 1) % _j244.length];
_j251.push({
x: (_j252.x + _j253.x * 2 + _j207.x) / 4,
y: (_j252.y + _j253.y * 2 + _j207.y) / 4
});
}
for (let v of _j251) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j254 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j234.push({
x: rotatedX + offsetX,
y: _j254 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j234
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j234 = [];
const _j235 = 3;
const _j231 = [];
const _j237 = crandom.random(1, 4);
const _j238 = crandom.random(0.15, 0.35);
const _j239 = floor(_j237);
let rotation = crandom.random(TWO_PI);
for (let _j240 = 0; _j240 < _j235; _j240++) {
const _j241 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j240 * 500
};
_j231.push(_j241);
}
for (let _j240 = 0; _j240 < _j239; _j240++) {
const _j241 = _j231[_j240];
const offsetX = _j241.offsetX;
const offsetY = _j241.offsetY;
const layerRotation = rotation + _j241.layerRotationOffset;
const sizeVariation = _j241.sizeVariation;
const _j242 = size * sizeVariation;
const lengthRatio = _j241.lengthRatio;
const _j255 = _j242 * lengthRatio;
const stripWidth = _j242 * _j241.stripWidth;
const _j243 = floor(_j241.numVerticesRand);
const noiseOffset = _j241.noiseOffset;
const _j244 = [];
for (let i = 0; i < _j243; i++) {
let _j249, _j250;
if (i < _j243 / 2) {
const _j256 = (i / (_j243 / 2));
_j249 = (_j256 - 0.5) * _j255;
const _j257 = noise(_j256 * 1.5 + noiseOffset, _j240 * 50);
_j250 = -stripWidth / 2 + (_j257 - 0.5) * stripWidth * _j238;
} else {
const _j256 = ((_j243 - 1 - i) / (_j243 / 2));
_j249 = (_j256 - 0.5) * _j255;
const _j257 = noise(_j256 * 1.5 + noiseOffset, 100 + _j240 * 50);
_j250 = stripWidth / 2 + (_j257 - 0.5) * stripWidth * _j238;
}
_j244.push({
x: _j249,
y: _j250
});
}
const _j251 = [];
for (let i = 0; i < _j244.length; i++) {
const _j252 = _j244[(i - 1 + _j244.length) % _j244.length];
const _j253 = _j244[i];
const _j207 = _j244[(i + 1) % _j244.length];
_j251.push({
x: (_j252.x + _j253.x * 2 + _j207.x) / 4,
y: (_j252.y + _j253.y * 2 + _j207.y) / 4
});
}
for (let v of _j251) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j254 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j234.push({
x: rotatedX + offsetX,
y: _j254 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j234
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j234 = [];
const _j258 = 2;
const _j259 = 30;
const _j260 = 8;
const _j261 = 300;
const _j231 = [];
const _j262 = crandom.random(1, 3);
const _j263 = floor(_j262);
for (let _j264 = 0; _j264 < _j258; _j264++) {
const _j265 = {
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
for (let step = 0; step < _j259; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j265.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j261; i++) {
_j265.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j231.push(_j265);
}
for (let _j264 = 0; _j264 < _j263; _j264++) {
const _j265 = _j231[_j264];
let branchAngle = _j265.branchAngle;
let branchOffsetX = _j265.branchOffsetX;
let branchOffsetY = _j265.branchOffsetY;
let _j266 = _j265.numLRand > 0.2 ? 1 : 2;
let _j267 = floor(_j265.numStepsRand) * _j266;
let stepSize = _j265.stepSize;
let noiseScale = _j265.noiseScale;
let noiseStrength = _j265.noiseStrength;
let thickness = _j265.thickness;
let pathPoints = [];
let _j268 = branchOffsetX;
let _j269 = branchOffsetY;
let _j270 = branchAngle;
pathPoints.push({
x: _j268,
y: _j269
});
for (let step = 0; step < _j267; step++) {
const stepRandoms = _j265.stepRandoms[step];
const t = step / _j267;
const _j271 = noise(step * noiseScale, seed * 0.01);
const _j272 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j271 - 0.5) * PI * noiseStrength;
_j270 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j273 = stepSize * stepVariation;
_j268 += cos(_j270) * _j273;
_j269 += sin(_j270) * _j273;
pathPoints.push({
x: _j268,
y: _j269
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j267 - 3) {
const _j274 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j270 + stepRandoms.subBranchAngle;
let _j275 = _j268;
let _j276 = _j269;
for (let _j277 = 0; _j277 < _j274; _j277++) {
const _j278 = noise(step * noiseScale + _j277 * 0.5, seed * 0.01 + 200);
const _j279 = (_j278 - 0.5) * PI * 0.5;
const _j280 = subBranchAngle + _j279;
_j275 += cos(_j280) * stepSize * 0.6;
_j276 += sin(_j280) * stepSize * 0.6;
pathPoints.push({
x: _j275,
y: _j276
});
}
}
}
const _j281 = [];
const _j282 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j283;
if (i === 0) {
const _j207 = pathPoints[i + 1];
_j283 = atan2(_j207.y - point.y, _j207.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j252 = pathPoints[i - 1];
_j283 = atan2(point.y - _j252.y, point.x - _j252.x) + HALF_PI;
} else {
const _j252 = pathPoints[i - 1];
const _j207 = pathPoints[i + 1];
const _j284 = atan2(point.y - _j252.y, point.x - _j252.x);
const _j285 = atan2(_j207.y - point.y, _j207.x - point.x);
_j283 = ((_j284 + _j285) / 2) + HALF_PI;
}
const _j286 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j287 = _j265.thicknessRandoms[Math.min(i, _j265.thicknessRandoms.length - 1)];
const _j288 = thickness * _j286 * _j287;
_j281.push({
x: point.x + cos(_j283) * _j288 / 2,
y: point.y + sin(_j283) * _j288 / 2
});
_j282.push({
x: point.x - cos(_j283) * _j288 / 2,
y: point.y - sin(_j283) * _j288 / 2
});
}
for (let v of _j281) {
_j234.push(v);
}
for (let i = _j282.length - 1; i >= 0; i--) {
_j234.push(_j282[i]);
}
}
return {
type: 'lightning',
vertices: _j234
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j234 = [];
const _j258 = 3;
const _j259 = 75;
const _j260 = 8;
const _j261 = 800;
const _j231 = [];
const _j262 = crandom.random(1, 4);
const _j263 = floor(_j262);
size = size * 3;
for (let _j264 = 0; _j264 < _j258; _j264++) {
const _j265 = {
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
for (let step = 0; step < _j259; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j265.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j261; i++) {
_j265.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j231.push(_j265);
}
for (let _j264 = 0; _j264 < _j263; _j264++) {
const _j265 = _j231[_j264];
let branchAngle = _j265.branchAngle;
let branchOffsetX = _j265.branchOffsetX;
let branchOffsetY = _j265.branchOffsetY;
let _j266 = _j265.numLRand > 0.2 ? 1 : 5;
let _j267 = floor(_j265.numStepsRand) * _j266;
let stepSize = _j265.stepSize;
let noiseScale = _j265.noiseScale;
let noiseStrength = _j265.noiseStrength;
let thickness = _j265.thickness;
let pathPoints = [];
let _j268 = branchOffsetX;
let _j269 = branchOffsetY;
let _j270 = branchAngle;
pathPoints.push({
x: _j268,
y: _j269
});
for (let step = 0; step < _j267; step++) {
const stepRandoms = _j265.stepRandoms[step];
const t = step / _j267;
const _j271 = noise(step * noiseScale, seed * 0.01);
const _j272 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j271 - 0.5) * PI * noiseStrength;
_j270 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j273 = stepSize * stepVariation;
_j268 += cos(_j270) * _j273;
_j269 += sin(_j270) * _j273;
pathPoints.push({
x: _j268,
y: _j269
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j267 - 3) {
const _j274 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j270 + stepRandoms.subBranchAngle;
let _j275 = _j268;
let _j276 = _j269;
for (let _j277 = 0; _j277 < _j274; _j277++) {
const _j278 = noise(step * noiseScale + _j277 * 0.5, seed * 0.01 + 200);
const _j279 = (_j278 - 0.5) * PI * 0.5;
const _j280 = subBranchAngle + _j279;
_j275 += cos(_j280) * stepSize * 0.6;
_j276 += sin(_j280) * stepSize * 0.6;
pathPoints.push({
x: _j275,
y: _j276
});
}
}
}
const _j281 = [];
const _j282 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j283;
if (i === 0) {
const _j207 = pathPoints[i + 1];
_j283 = atan2(_j207.y - point.y, _j207.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j252 = pathPoints[i - 1];
_j283 = atan2(point.y - _j252.y, point.x - _j252.x) + HALF_PI;
} else {
const _j252 = pathPoints[i - 1];
const _j207 = pathPoints[i + 1];
const _j284 = atan2(point.y - _j252.y, point.x - _j252.x);
const _j285 = atan2(_j207.y - point.y, _j207.x - point.x);
_j283 = ((_j284 + _j285) / 2) + HALF_PI;
}
const _j286 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j287 = _j265.thicknessRandoms[Math.min(i, _j265.thicknessRandoms.length - 1)];
const _j288 = thickness * _j286 * _j287;
_j281.push({
x: point.x + cos(_j283) * _j288 / 2,
y: point.y + sin(_j283) * _j288 / 2
});
_j282.push({
x: point.x - cos(_j283) * _j288 / 2,
y: point.y - sin(_j283) * _j288 / 2
});
}
for (let v of _j281) {
_j234.push(v);
}
for (let i = _j282.length - 1; i >= 0; i--) {
_j234.push(_j282[i]);
}
}
return {
type: 'lightning',
vertices: _j234
};
}
function _j17(_j1490, shapeData, px, py, r, g, b, alpha) {
_j1490.fill(r, g, b, alpha);
_j1490.noStroke();
const scale = 1 / _j502;
switch (shapeData.type) {
case 'polygon':
case 'blob':
case 'jagged':
case 'strip':
case 'lightning':
_j1490.beginShape();
for (let v of shapeData.vertices) {
_j1490.vertex(px + v.x * scale, py + v.y * scale);
}
_j1490.endShape(CLOSE);
break;
case 'cluster':
for (let circle of shapeData.circles) {
_j1490.ellipse(
px + circle.x * scale,
py + circle.y * scale,
circle.radius * 2 * scale,
circle.radius * 2 * scale
);
}
break;
}
}
function _j18(_j1491 = null, scanBounds = null, shapeType = null, _j1492 = null) {
let _j289 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j289 = crandom.getCount();
}
const w = _j1491 ? _j1491.width : width;
const h = _j1491 ? _j1491.height : height;
const d = _j1491 ? _j1491.pixelDensity() : pixelDensity();
const _j290 = 20;
const _j291 = 700;
const _j292 = 80;
let _j293 = canvasBackgroundColor[0];
let _j294 = canvasBackgroundColor[1];
let _j295 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j296 = _j1492 && _j1492.length > 0;
if (_j296) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1492.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j297 = _j1491 || window;
_j297.loadPixels();
pixels = _j1491 ? _j1491.pixels : window.pixels;
let _j298 = [];
const step = 4;
let _j299 = _j290;
let _j300 = w - _j290;
let _j301 = _j290;
let _j302 = h - _j290;
for (let y = _j301; y < _j302; y += step) {
for (let x = _j299; x < _j300; x += step) {
let _j303 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j303];
let g = pixels[_j303 + 1];
let b = pixels[_j303 + 2];
let a = pixels[_j303 + 3];
let brightness = r + g + b;
let _j304 = Math.abs(r - _j293) + Math.abs(g - _j294) + Math.abs(b - _j295);
if (a > 100 && brightness < _j291 && _j304 > _j292) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j298.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j298.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j298.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j298.sort((a, b) => a.brightness - b.brightness);
if (_j298.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j298.length} 個），無法生成蟲咬效果`);
return;
}
let _j305 = [];
for (let i = 0; i < _j298.length; i++) {
_j305.push(i);
}
const _j306 = Math.floor(_j298.length * 0.5);
const _j307 = _j305.slice(0, Math.max(_j306, 10));
for (let i = 0; i < 10 && _j307.length > 0; i++) {
const _j308 = [];
let _j309 = 0;
for (let j = 0; j < _j307.length; j++) {
const _j310 = Math.pow(1 - (j / _j307.length), 2);
_j308.push(_j310);
_j309 += _j310;
}
let _j311 = crandom.random(0, _j309);
let _j312 = 0;
let _j313 = 0;
for (let j = 0; j < _j308.length; j++) {
_j313 += _j308[j];
if (_j311 <= _j313) {
_j312 = j;
break;
}
}
const _j314 = _j307.splice(_j312, 1)[0];
targetPoints.push(_j298[_j314]);
}
if (typeof _j618 !== 'undefined' && _j618 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j315 = [];
const _j316 = 30;
const _j317 = 4;
let _j318 = 0;
const _j319 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j320 = [];
const _j231 = [];
const _j321 = [];
for (let _j322 = 0; _j322 < numBites; _j322++) {
const _j323 = [];
for (let _j324 = 0; _j324 < _j319; _j324++) {
_j323.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j231.push(_j323);
_j321.push({
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
let _j325 = 0;
let _j326 = false;
let _j327, _j328, distance;
const _j323 = _j231[i];
const _j329 = _j321[i];
if (_j296) {
const _j233 = _j323[0];
let r = sqrt(_j233.r) * _j316;
let angle = _j233.angle + _j233.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j327 = Math.floor(target.x + offsetX);
_j328 = Math.floor(target.y + offsetY);
_j327 = constrain(_j327, _j290, w - _j290);
_j328 = constrain(_j328, _j290, h - _j290);
_j326 = true;
for (let _j330 of _j320) {
let dist = Math.sqrt(
Math.pow(_j327 - _j330.x, 2) +
Math.pow(_j328 - _j330.y, 2)
);
if (dist < _j317) {
_j326 = false;
break;
}
}
} else {
while (!_j326 && _j325 < _j319) {
const _j233 = _j323[_j325];
let r = sqrt(_j233.r) * _j316;
let angle = _j233.angle;
angle += _j233.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j327 = Math.floor(target.x + offsetX);
_j328 = Math.floor(target.y + offsetY);
_j327 = constrain(_j327, _j290, w - _j290);
_j328 = constrain(_j328, _j290, h - _j290);
let _j314 = 4 * ((_j328 * d) * (w * d) + (_j327 * d));
let _j331 = pixels[_j314];
let _j332 = pixels[_j314 + 1];
let _j333 = pixels[_j314 + 2];
let _j334 = pixels[_j314 + 3];
let _j335 = _j331 + _j332 + _j333;
let _j336 = Math.abs(_j331 - _j293) + Math.abs(_j332 - _j294) + Math.abs(_j333 - _j295);
if (_j334 <= 100 || _j335 >= _j291 || _j336 <= _j292) {
_j326 = false;
_j325++;
if (_j325 >= _j319) {
_j318++;
}
continue;
}
_j326 = true;
for (let _j330 of _j320) {
let dist = Math.sqrt(
Math.pow(_j327 - _j330.x, 2) +
Math.pow(_j328 - _j330.y, 2)
);
if (dist < _j317) {
_j326 = false;
break;
}
}
_j325++;
}
}
let _j337 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j337 *= 1.3;
}
let _j338 = floor(target.x * 1000 + target.y * 333 + _j329.shapeSeedRand);
let _j339 = 0;
let _j340 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j339 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j337, _j338, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j340 = crandom.getCount();
if (!_j329.shapeRandomCount) {
_j329.shapeRandomCount = _j340 - _j339;
}
}
if (_j326) {
let r, g, b;
let _j341 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j341[0] < 0.2 && _j341[1] < 0.15 && _j341[2] < 0.1) {
r = Math.floor(38 + _j329.colorRand1 * (51 - 38));
g = Math.floor(31 + _j329.colorRand2 * (38 - 31));
b = Math.floor(20 + _j329.colorRand3 * (26 - 20));
} else {
r = 230 + _j329.colorRand1 * (255 - 230);
g = 160 + _j329.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j327,
y: _j328,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j337,
shapeData: shapeData
};
_j320.push(point);
_j315.push(point);
}
}
}
_j229 = _j229.concat(_j315);
let _j342 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j315) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j342++;
let _j343 = point.size || 2.5;
let _j344 = map(_j343, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j344
});
}
let _j345 = boidSpawners.slice(-_j342);
if (_j342 > 0) {
let sizeMultipliers = _j345.map(s => s.boidSizeMultiplier);
let _j346 = Math.min(...sizeMultipliers);
let _j347 = Math.max(...sizeMultipliers);
let _j348 = (_j342 / _j315.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j342} 個 Boid Spawners (虫咬點的 ${_j348}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j346.toFixed(2)} ~ ${_j347.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j315.length > 0) {
let _j349 = Infinity;
let _j350 = 0;
for (let point of _j315) {
let brightness = point.r + point.g + point.b;
_j349 = Math.min(_j349, brightness);
_j350 = Math.max(_j350, brightness);
}
if (_j318 > 0) {
console.log(`⚠️ 跳過了 ${_j318} 個不在筆墨區域的點`);
}
}
const _j351 = _j315.length;
if (_j351 > 0) {
_j111('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j351,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j352 = crandom.getCount();
const _j353 = _j352 - _j289;
if (typeof _j626 !== 'undefined' && _j626 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j354 = currentScanEvent.recordedRandomCount;
const _j196 = _j353 - _j354;
const percent = _j354 > 0 ? ((_j196 / _j354) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j196) < 50 ? '✅' : Math.abs(_j196) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j355 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j356 = typeof _j351 === 'number' ? ` | Points:${_j351}` : '';
console.log(`${icon} Scan [${action}] ${_j355} | 差異: ${_j196 > 0 ? '+' : ''}${_j196} (${percent})${_j356}`);
}
} else if (typeof _j618 !== 'undefined' && _j618) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j353;
}
}
}
}
function _j19(_j1493 = 10, shapeType = null) {
const _j290 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1493; i++) {
let x = crandom.random(_j290, w - _j290);
let y = crandom.random(_j290, h - _j290);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j315 = [];
const _j316 = 30;
const _j317 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j320 = [];
for (let i = 0; i < numBites; i++) {
let _j325 = 0;
let _j326 = false;
let _j327, _j328, distance;
while (!_j326 && _j325 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j316;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j327 = Math.floor(target.x + offsetX);
_j328 = Math.floor(target.y + offsetY);
_j327 = constrain(_j327, _j290, w - _j290);
_j328 = constrain(_j328, _j290, h - _j290);
_j326 = true;
for (let _j330 of _j320) {
let dist = Math.sqrt(
Math.pow(_j327 - _j330.x, 2) +
Math.pow(_j328 - _j330.y, 2)
);
if (dist < _j317) {
_j326 = false;
break;
}
}
_j325++;
}
if (_j326) {
let r, g, b;
let _j341 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j341[0] < 0.2 && _j341[1] < 0.15 && _j341[2] < 0.1) {
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
let _j338 = floor(_j327 * 1000 + _j328 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j327, _j328, size, _j338, shapeType);
let point = {
x: _j327,
y: _j328,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j320.push(point);
_j315.push(point);
}
}
}
_j229 = _j229.concat(_j315);
let _j342 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j315) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j342++;
let _j343 = point.size || 2.5;
let _j344 = map(_j343, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j344
});
}
}
if (_j315.length > 0) {
_j111('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j315.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1494 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j502);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j502);
}
const _j357 = _j1494 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j229.length;
if (!_j357) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j229) {
const px = point.x;
const py = point.y;
const _j358 = (point.size || 5) / _j502;
const _j359 = point.x / width;
const _j360 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j359 * 255, _j360 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j359 * 255, _j360 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j358, _j358);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j358, _j358);
}
}
const _j361 = {
pointCount: _j229.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j361;
window.bugsMaskTextureCache = _j361;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j297, _j1491) {
if (_j229.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j362 = _j20();
let _j363 = _j362.dataTexture;
let _j364 = _j362.maskTexture;
_j297.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1491);
window.metallicProgram.setUniform('bugsMask', _j364);
window.metallicProgram.setUniform('bugsData', _j363);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j502, height * _j502]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j365 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j366 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j367 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j368 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j369 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j365);
window.metallicProgram.setUniform('lightPos', [_j368, _j369]);
window.metallicProgram.setUniform('specularPower', _j366);
window.metallicProgram.setUniform('fresnelStrength', _j367);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j297.end();
}
let _j370 = null;
let __lastGridParams = null;
function _j22(x1, y1, x2, y2, _j1495, _j1496) {
const d = dist(x1, y1, x2, y2);
if (d < 1) return;
const dx = (x2 - x1) / d, dy = (y2 - y1) / d;
let pos = 0, draw = true;
while (pos < d) {
const _j371 = draw ? _j1495 : _j1496;
const end = Math.min(pos + _j371, d);
if (draw) line(x1 + dx * pos, y1 + dy * pos, x1 + dx * end, y1 + dy * end);
pos = end;
draw = !draw;
}
}
function gridCommitPrev() {
if (__lastGridParams) {
_j370 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j23(cx, cy, _j496, _j497) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j496 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j571 !== 'undefined' && _j571 !== null) {
if (_j571.minX < minX) minX = _j571.minX;
if (_j571.maxX > maxX) maxX = _j571.maxX;
if (_j571.minY < minY) minY = _j571.minY;
if (_j571.maxY > maxY) maxY = _j571.maxY;
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
const _j372 = effCell * 0.3;
const _j373 = (maxX - minX) + _j372 * 2;
const _j374 = (maxY - minY) + _j372 * 2;
const _j375 = (minX + maxX) * 0.5;
const _j376 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j372) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j372) / effCell) * effCell);
const _j377 = Math.min(width, Math.ceil((maxX + _j372) / effCell) * effCell);
const _j378 = Math.min(height, Math.ceil((maxY + _j372) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j377 - left);
let gridHeight = Math.max(effCell * 2, _j378 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j370 && typeof _j626 !== 'undefined' && _j626) {
const pg = _j370;
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
if (_j497) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j497) {
const _j379 = 12;
const _j380 = left + 8;
const _j381 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j380 - _j379 / 2, _j381, _j380 + _j379 / 2, _j381);
line(_j380, _j381 - _j379 / 2, _j380, _j381 + _j379 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j497) {
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
const _j382 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j383 = typeof _j566 === 'number' ? _j566 : 0;
const _j384 = typeof brushDir === 'number' ? brushDir : 0;
const _j385 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j386 = _j385[_j384] || '?';
const countdownText = `Max: ${_j382} | Count: ${_j383} | Dir: ${_j384}(${_j386})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j387 = typeof _j567 === 'number' ? _j567 : 0;
const _j388 = typeof brushMode === 'number' ? brushMode : 0;
const _j389 = (typeof _j527 === 'number' && _j527 > 0) ? _j527 : (typeof _j543 === 'number' ? _j543 : effCell);
const _j390 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j391 = `C: ${_j387} | B: ${_j388} | S: ${_j389.toFixed(1)} | P: ${_j390}`;
const _j392 = left;
const _j393 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j391, _j392, _j393);
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
function _j24(_j1490) {
const _j394 = typeof _j1490.begin === 'function';
if (_j394) _j1490.begin();
const g = _j394 ? window : _j1490;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j395 = 5;
const _j396 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j899 = true;
_j874 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j397 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j397;
let dy = (y2 - y1) / _j397;
let _j398 = 0;
while (_j398 < _j397) {
let _j399 = _j899 ? _j395 : _j396;
let _j400 = min(_j399 - _j874, _j397 - _j398);
if (_j899) {
let startX = x1 + dx * _j398;
let startY = y1 + dy * _j398;
let _j401 = x1 + dx * (_j398 + _j400);
let _j402 = y1 + dy * (_j398 + _j400);
g.line(startX, startY, _j401, _j402);
}
_j398 += _j400;
_j874 += _j400;
if (_j874 >= (_j899 ? _j395 : _j396)) {
_j899 = !_j899;
_j874 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j403 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j403.x, _j403.y, 10, 10);
}
g.pop();
if (_j394) _j1490.end();
}
function _j25() {
const _j404 = 10;
if (typeof _j551 !== 'undefined' && _j551 && typeof _j555 !== 'undefined' && _j555) {
noFill();
stroke(0, 180, 0, 180);
strokeWeight(1.5);
if (_j555.action === 'rect') {
const _j405 = _j555.x1 + _j404, _j406 = _j555.y1 + _j404;
const _j407 = _j555.x2 + _j404, _j408 = _j555.y2 + _j404;
_j22(_j405, _j406, _j407, _j406, 6, 4);
_j22(_j407, _j406, _j407, _j408, 6, 4);
_j22(_j407, _j408, _j405, _j408, 6, 4);
_j22(_j405, _j408, _j405, _j406, 6, 4);
} else if (_j555.action === 'polygon' && _j555.points && _j555.points.length >= 3) {
const _j409 = _j555.points;
for (let i = 0; i < _j409.length; i++) {
const a = _j409[i], b = _j409[(i + 1) % _j409.length];
_j22(a.x + _j404, a.y + _j404, b.x + _j404, b.y + _j404, 6, 4);
}
}
fill(0, 180, 0, 200);
noStroke();
if (typeof font !== 'undefined' && font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
const _j410 = (_j555.action === 'rect' ? _j555.x1 : (_j555.points ? _j555.points[0].x : 0)) + _j404;
const _j411 = (_j555.action === 'rect' ? _j555.y1 - 12 : (_j555.points ? _j555.points[0].y - 12 : 0)) + _j404;
text('MASK', _j410, _j411);
}
if (typeof _j550 !== 'undefined' && _j550 && typeof _j552 !== 'undefined' && _j552 === 'rect' &&
typeof _j553 !== 'undefined' && _j553 && _j553.x1 !== undefined && mouseIsPressed) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
const _j412 = Math.min(_j553.x1, mouseX - 10) + _j404;
const _j413 = Math.min(_j553.y1, mouseY - 10) + _j404;
const _j414 = Math.max(_j553.x1, mouseX - 10) + _j404;
const _j415 = Math.max(_j553.y1, mouseY - 10) + _j404;
_j22(_j412, _j413, _j414, _j413, 4, 3);
_j22(_j414, _j413, _j414, _j415, 4, 3);
_j22(_j414, _j415, _j412, _j415, 4, 3);
_j22(_j412, _j415, _j412, _j413, 4, 3);
}
if (typeof _j550 !== 'undefined' && _j550 && typeof _j552 !== 'undefined' && _j552 === 'polygon' &&
typeof _j554 !== 'undefined' && _j554.length > 0) {
noFill();
stroke(0, 200, 0, 120);
strokeWeight(1);
for (let i = 0; i < _j554.length - 1; i++) {
const a = _j554[i], b = _j554[i + 1];
_j22(a.x + _j404, a.y + _j404, b.x + _j404, b.y + _j404, 4, 3);
}
noStroke();
fill(0, 200, 0, 150);
for (let p of _j554) {
ellipse(p.x + _j404, p.y + _j404, 6, 6);
}
}
}
function _j26() {
if ((!_j626 || isWaitingToLoop) && _j640 !== null && doMoving) {
const _j416 = easycamInitialCenter || [0, 0, 0];
const _j417 = PI / 3;
const _j418 = height / (2 * tan(_j417 / 2));
const _j419 = easycamInitialDistance > 0 ? easycamInitialDistance : _j418;
const _j420 = _j640.getCenter();
const _j421 = _j640.getDistance();
const _j422 = 0.1;
const _j423 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j420[0] - _j416[0], 2) +
Math.pow(_j420[1] - _j416[1], 2) +
Math.pow(_j420[2] - _j416[2], 2)
);
const distanceDiff = Math.abs(_j421 - _j419);
if (!_j653 && (centerDiff > _j422 || distanceDiff > _j423)) {
_j653 = true;
_j654 = millis();
_j651 = [_j420[0], _j420[1], _j420[2]];
_j655 = _j421;
_j652 = _j416;
_j656 = _j419;
}
if (_j653) {
const _j424 = millis() - _j654;
const _j425 = Math.min(_j424 / _j657, 1.0);
const _j426 = [
lerp(_j651[0], _j652[0], _j425),
lerp(_j651[1], _j652[1], _j425),
lerp(_j651[2], _j652[2], _j425)
];
const _j427 = lerp(_j655, _j656, _j425);
_j640.setCenter(_j426, 0);
_j640.setDistance(_j427, 0);
if (_j425 >= 1.0) {
const _j428 = _j640.getCenter();
const _j429 = _j640.getDistance();
const _j430 = Math.sqrt(
Math.pow(_j428[0] - _j416[0], 2) +
Math.pow(_j428[1] - _j416[1], 2) +
Math.pow(_j428[2] - _j416[2], 2)
);
const _j431 = Math.abs(_j429 - _j419);
if (_j430 > _j422 || _j431 > _j423) {
_j640.setCenter(_j416, 0);
_j640.setDistance(_j419, 0);
}
_j653 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j626 && !isWaitingToLoop && doMoving && _j641 && _j640 !== null && _j642 && !_j653) {
const _j432 = _j630;
const _j433 = _j631;
const _j434 = _j432 - hw;
const _j435 = -(_j433 - hh);
const _j420 = _j640.getCenter();
const _j268 = _j420[0];
const _j269 = _j420[1];
const _j421 = _j640.getDistance();
const _j417 = PI / 3;
const _j436 = height / (2 * tan(_j417 / 2));
const _j437 = 1.1;
let _j438 = 1.4;
const _j317 = _j436 / _j438;
const _j439 = _j436 / _j437;
const _j440 = _j436 / _j421;
const _j441 = 0.01;
if (_j648) {
const _j442 = _j438;
const _j443 = _j436 / _j442;
const distanceDiff = _j443 - _j421;
const _j444 = _j644;
const _j445 = _j421 + distanceDiff * _j444;
const _j446 = constrain(_j445, _j317, _j439);
_j640.setDistance(_j446, 0);
} else {
const _j443 = _j436 / _j437;
const distanceDiff = _j443 - _j421;
const _j444 = _j644;
const _j445 = _j421 + distanceDiff * _j444;
const _j446 = constrain(_j445, _j317, _j439);
_j640.setDistance(_j446, 0);
}
const _j447 = _j640.getDistance();
const _j448 = _j436 / _j447;
let _j449 = 0;
let _j450 = 0;
if (_j448 > _j437) {
_j449 = (_j448 - _j437) * (width / 2);
_j450 = (_j448 - _j437) * (height / 2);
}
let offsetX = _j434 - _j268;
let offsetY = _j435 - _j269;
if (_j449 > 0 || _j450 > 0) {
const _j451 = constrain(_j434, -_j449, _j449);
const _j452 = constrain(_j435, -_j450, _j450);
offsetX = _j451 - _j268;
offsetY = _j452 - _j269;
} else {
offsetX = -_j268;
offsetY = -_j269;
}
const _j453 = _j643;
const _j327 = _j268 + offsetX * _j453;
const _j328 = _j269 + offsetY * _j453;
let _j454 = _j327;
let _j455 = _j328;
if (_j449 > 0 || _j450 > 0) {
_j454 = constrain(_j327, -_j449, _j449);
_j455 = constrain(_j328, -_j450, _j450);
} else {
_j454 = 0;
_j455 = 0;
}
_j640.setCenter([_j454, _j455, 0], 0);
}
}
function _j27() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j641 = false;
return;
}
if (_j640 !== null) {
_j641 = true;
return;
}
try {
const _j456 = _renderer;
if (!_j456) {
console.error('❌ WEBGL renderer not found');
_j641 = false;
return;
}
const _j417 = PI / 3;
const _j436 = height / (2 * tan(_j417 / 2));
_j640 = new Dw.EasyCam(_j456, {
distance: _j436,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j640.setRotationConstraint(0, 0, 0);
_j640.setRotationScale(0);
_j649 = _j436 / 2.5;
_j650 = _j436 / 1.0;
_j640.setDistanceMin(_j649);
_j640.setDistanceMax(_j650);
document.oncontextmenu = function() {
return false;
};
_j641 = true;
_j111('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j641 = false;
_j640 = null;
}
}
function applyCameraProjection() {
const _j457 = doMoving && _j641 && _j640 !== null && _j626 && _j642;
if (_j457) {
const _j458 = PI / 3;
const _j459 = 0.1;
const _j460 = 10000;
perspective(_j458, width / height, _j459, _j460);
push();
} else {
const _j461 = PI / 3;
const _j462 = 0.1;
const _j463 = 10000;
perspective(_j461, width / height, _j462, _j463);
}
}
let _j464 = null;
let _j465 = null;
let _j466 = 0,
_j467 = 0,
_j468 = 0;
let _j469 = {
feedback: {},
composite: {},
realtime: {}
};
function _j28(_j1497, _j1498, name, value) {
const _j470 = _j469[_j1498];
if (_j470[name] === value) return;
_j470[name] = value;
_j1497.setUniform(name, value);
}
function _j29() {
if (_j466 !== width || _j467 !== height || _j468 !== _j502) {
_j464 = [0, 0, width * _j502, height * _j502];
_j465 = [1.0 / (width * _j502), 1.0 / (height * _j502)];
_j466 = width;
_j467 = height;
_j468 = _j502;
}
if (_j464 === null) {
_j464 = [0, 0, width * _j502, height * _j502];
_j465 = [1.0 / (width * _j502), 1.0 / (height * _j502)];
}
}
function _j30(_j1490, _j1499 = 1.0) {
if (_j587) {
_j563 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
pingPongBuffer.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j505);
const _j471 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j505.setUniform("rect", _j464);
_j505.setUniform("invResolution", _j465);
_j505.setUniform("tex0", _j1490);
_j28(_j505, 'feedback', "brushMode", brushMode * 1.0);
_j505.setUniform("forceMap", _j503);
_j28(_j505, 'feedback', "baseBrushSize", baseBrushSize);
_j505.setUniform("force", _j1499);
_j28(_j505, 'feedback', "useSharpen", useSharpen);
_j28(_j505, 'feedback', "effect3Brightness", effect3Brightness);
_j28(_j505, 'feedback', "indiffusionStrength", indiffusionStrength);
_j28(_j505, 'feedback', "brushColorMode", float(brushColorMode));
_j28(_j505, 'feedback', "brushCategory", _j471);
const _j472 = typeof _j569 !== 'undefined' ? _j569 : 0;
const _j473 = (_j567 + _j472) % 40;
const _j474 = _j567 + _j472;
_j505.setUniform("mouseCount", float(_j473));
_j505.setUniform("mouseCountAccumulated", float(_j474));
_j505.setUniform("strokeSeed", float(strokeSeed));
_j505.setUniform("useMask", _j551 ? 1.0 : 0.0);
if (_j551) _j505.setUniform("maskTex", _j549);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
_j1490.begin();
imageMode(CENTER);
blendMode(BLEND);
image(pingPongBuffer, 0, 0, width, height);
_j1490.end();
_j563 = true;
}
function _j31() {
if (typeof _j614 === 'undefined' || !_j614) {
return;
}
const _j475 = canvasBackgroundColor;
let _j476 = _j9(40, 20, 15, 0.2);
const _j477 = min(255, _j475[0] * 1.1);
const _j478 = min(255, _j475[1] * 1.1);
const _j479 = min(255, _j475[2] * 1.1);
_j614.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j477, _j478, _j479);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j476, -width / 2, -height / 2, width, height);
_j614.end();
_j476.remove();
}
function _j32() {
const _j475 = canvasBackgroundColor;
if (typeof _j615 !== 'undefined' && _j615) {
_j615.begin();
background(_j475[0], _j475[1], _j475[2]);
_j615.end();
}
_j31();
if (typeof _j563 !== 'undefined') {
_j563 = true;
}
}
function updateCompositeBuffer() {
const _j480 = _j563 || _j544 || _j545 || _j626 || _j669;
if (_j480) {
_j612.begin();
clear();
shader(_j508);
_j29();
_j508.setUniform("rect", _j464);
_j508.setUniform("baseTex", showPaperTexture ? _j614 : _j615);
_j508.setUniform("encodedTex", finalBuffer);
_j508.setUniform("typeMapTex", typeMapBuffer);
_j508.setUniform("oldTex", oldBuffer);
_j28(_j508, 'composite', "brushColorMode", float(brushColorMode));
_j28(_j508, 'composite', "whiteMaxOpacity", _j513);
_j28(_j508, 'composite', "hueShift", _j514);
_j28(_j508, 'composite', "satShift", _j515);
_j28(_j508, 'composite', "briShift", _j516);
_j28(_j508, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j28(_j508, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j612.end();
if (_j544 || _j545) {
_j616.begin();
clear();
imageMode(CENTER);
image(_j612, 0, 0, width, height);
_j616.end();
_j612.begin();
shader(_j506);
const _j481 = brushColorMode === 1 ? 1.0 : 0.0;
_j29();
_j506.setUniform("rect", _j464);
_j506.setUniform("baseTex", _j616);
_j506.setUniform("addTex", newBufferBlack);
_j506.setUniform("encodedTex", finalBuffer);
_j28(_j506, 'realtime', "brushColorMode", float(brushColorMode));
_j28(_j506, 'realtime', "whiteMaxOpacity", _j513);
_j28(_j506, 'realtime', "hueShift", _j514);
_j28(_j506, 'realtime', "satShift", _j515);
_j28(_j506, 'realtime', "briShift", _j516);
_j28(_j506, 'realtime', "brushCategory", _j481);
_j28(_j506, 'realtime', "useSharpen", useSharpen);
let _j482;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j482 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j211[brushColorMode] || _j211[0];
_j482 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j506.setUniform("brushColor", _j482);
_j506.setUniform("useMask", _j551 ? 1.0 : 0.0);
if (_j551) _j506.setUniform("maskTex", _j549);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j612.end();
}
_j563 = _j544 || _j545 || _j626 || _j669;
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
const _j483 = (_j544 || _j545) && _j566 < maxUpdates && _j572;
const _j484 = !_j626 || showFuturePathPreview;
const _j485 = _j483 && showGridOverlay;
const _j486 = (typeof _j551 !== 'undefined' && _j551) ||
(typeof _j550 !== 'undefined' && _j550);
const _j487 = (typeof window !== 'undefined' && window.testMode === true);
if (_j483 || _j486 || _j487) {
_j613.begin();
clear();
push();
translate(-hw, -hh);
const _j488 = -10;
translate(_j488, _j488);
if (_j487) {
const _j404 = 10;
const _j489 = 4;
noFill();
stroke(255, 0, 0, 220);
strokeWeight(2);
const _j490 = _j489 + _j404, _j491 = _j489 + _j404;
const _j492 = width - _j489 + _j404, _j493 = height - _j489 + _j404;
_j22(_j490, _j491, _j492, _j491, 10, 6);
_j22(_j492, _j491, _j492, _j493, 10, 6);
_j22(_j492, _j493, _j490, _j493, 10, 6);
_j22(_j490, _j493, _j490, _j491, 10, 6);
}
if (_j485) {
const _j494 = _j626 ? _j630 : _j539;
const _j495 = _j626 ? _j631 : _j540;
const cx = (_j541 || _j541 === 0) ? _j541 : _j494;
const cy = (_j542 || _j542 === 0) ? _j542 : _j495;
const _j496 = _j543;
const _j497 = typeof _j588 !== 'undefined' && _j588;
_j23(cx, cy, _j496, _j497);
} else if (_j486) {
_j25();
}
if (pathPoints.length > 1 && _j484) {
const _j395 = 5;
const _j396 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j899 = true;
_j874 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j397 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j397;
let dy = (y2 - y1) / _j397;
let _j398 = 0;
while (_j398 < _j397) {
let _j399 = _j899 ? _j395 : _j396;
let _j400 = min(_j399 - _j874, _j397 - _j398);
if (_j899) {
let startX = x1 + dx * _j398;
let startY = y1 + dy * _j398;
let _j401 = x1 + dx * (_j398 + _j400);
let _j402 = y1 + dy * (_j398 + _j400);
line(startX, startY, _j401, _j402);
}
_j398 += _j400;
_j874 += _j400;
if (_j874 >= (_j899 ? _j395 : _j396)) {
_j899 = !_j899;
_j874 = 0;
}
}
}
}
if (_j484 && _j483) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j498 = _j626 ? _j630 : _j539;
const _j499 = _j626 ? _j631 : _j540;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j498, _j499, 10, 10);
}
pop();
_j613.end();
}
}
let _j500 = window._demoCanvasWidth || 900,
_j501 = window._demoCanvasHeight || 900,
hw, hh, _j502 = 1.6;
let _j503, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j504, _j505, _j506, _j507, _j508, _j509;
let _j510;
let _j511;
const _j211 = _j2();
let colorIndex = 0,
_j512 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j513 = 0.95;
let _j514 = 0.0,
_j515 = 0.0,
_j516 = 0.0;
let customBrushColor = [26, 26, 26];
let _j517, _j518, _j519, _j520, _j521;
let _j522, _j523, _j524, _j525, _j526, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j527 = 0,
_j528 = 2,
_j529 = 0;
let brushMode = 1,
_j530 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j531 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j532 = [];
let x, y, _j434, _j435, _j533, _j534, _j535, _j536 = 0,
_j537 = 0;
let _j538;
let _j539 = 0,
_j540 = 0,
_j541 = 0,
_j542 = 0,
_j543 = 20;
let _j544 = false,
_j545 = false,
_j546 = false,
_j547 = false;
let _j548 = true;
let useSpectralMix = false;
let _j549;
let _j550 = false;
window.resetBrushPositionToMouse = function() {
if (typeof mouseX === 'undefined' || typeof mouseY === 'undefined') return;
const px = _j180(mouseX);
const py = _j180(mouseY);
_j539 = px;
_j540 = py;
_j541 = px;
_j542 = py;
_j630 = px;
_j631 = py;
_j632 = px;
_j633 = py;
};
let _j551 = false;
let _j552 = 'rect';
let _j553 = null;
let _j554 = [];
let _j555 = null;
Object.defineProperty(window, 'spectral', {
get() { return useSpectralMix; },
set(v) {
useSpectralMix = !!v;
console.log('[spectral mix]', useSpectralMix ? 'ON' : 'OFF');
}
});
window.getAgentPathData = function() {
return {
active: _j564,
paths: _j565,
pointCount: _j565.filter(p => !p.stroke).length,
strokeCount: _j565.filter(p => p.stroke).length,
canvasSize: { w: typeof width !== 'undefined' ? width : 0, h: typeof height !== 'undefined' ? height : 0 },
timestamp: Date.now()
};
};
let _j556 = 1.0,
_j557 = false,
_j558 = 0.0;
let _j559 = [0, 0, 0];
function _j34(v) {
_j559[0] = _j559[1];
_j559[1] = _j559[2];
_j559[2] = v;
const a = _j559[0], b = _j559[1], c = _j559[2];
return Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
}
let _j560 = null;
let _j561 = false,
_j562 = false,
_j563 = true;
let _j564 = false;
let _j565 = [];
let _j566 = 0,
maxUpdates = 10,
force = 1.0;
let _j567 = 0,
_j568 = 0,
_j569 = 0;
var doMoving = false,
_j570 = false;
let pathPoints = [],
_j571 = null,
startX = 0,
startY = 0,
_j572 = false;
let _j573 = 1,
pathRotation = 20;
let randStep = 1,
_j574 = 10,
expectedStrokeLength = 100;
let allBrushStrokes = [],
totalStrokeCount = 0,
_j575 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j576;
var currentStrokeHighlight = null;
let _j577 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j578 = 140.0,
_j579 = 0.5,
_j580 = 1.0,
_j581 = 0.5,
_j582 = 60.0;
let cellularEnabled = false,
_j583 = 15.0,
_j584 = 0.5;
let whiteDotEnabled = false,
_j585 = 0.01;
let grainEnabled = false,
_j586 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j587 = false;
let _j588 = false;
let _j589 = 0;
let _j590 = 0;
let _j591 = 0;
let _j592 = 50;
let _j593 = 0;
var flowEffectStrokeBounds = null;
let _j594 = false;
let _j595 = null;
let _j596 = 0;
var _j597 = 0;
var _j598 = 0;
let _j599 = false;
const _j600 = 3;
var _j601 = {
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
var _j602 = false;
let _j603 = [0, 0, 0, 0],
_j604 = [0, 0, 0],
_j605 = [0, 0, 0],
_j606 = [0, 0, 0];
let _j607 = [0, 0],
_j608 = [0, 0],
effect3Brightness = 0.2;
let oldBuffer, _j609, finalBuffer, newBufferBlack, _j610, _j611, _j612;
let pingPongBuffer, _j613, _j614, _j615;
let _j616;
let _j617;
let typeMapBuffer;
let _j618 = false,
_j619 = 0,
_j620 = null,
_j621 = 0;
let _j622 = 0,
_j623 = 0,
_j624 = true,
_j625 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j626 = false,
_j627 = 0,
_j628 = 0,
_j629 = 1.0;
let _j630 = 0,
_j631 = 0,
_j632 = 0,
_j633 = 0;
let _j634 = false,
isWaitingToLoop = false,
_j635 = 0;
let _j636 = 0,
_j637 = false;
let _j638 = 0,
_j639 = 0;
let _j640 = null,
_j641 = false,
_j642 = false;
let _j643 = 0.05,
_j644 = 0.05;
let _j645 = 0,
_j646 = 0;
let _j647 = 1,
_j648 = false;
let _j649 = 0,
_j650 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j651 = [0, 0, 0],
_j652 = [0, 0, 0];
let _j653 = false,
_j654 = 0,
_j655 = 0,
_j656 = 0,
_j657 = 1000;
let _j658 = false,
_j659 = 0;
let _j660 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j661 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j662 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j663 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j664 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j665 = 0,
_j666 = 300;
let _j667 = false,
_j668 = false;
let _j669 = false,
_j670 = 0,
frameCount = 0,
_j671 = [];
let _j672 = 1,
_j673 = 0.8;
let _j674 = true,
_j675 = [],
_j676 = 100,
isDragging = false;
let _j677 = {
x: 0,
y: 0
},
_j678 = {
x: 85,
y: 50
};
let _j679 = false,
_j680 = {
x: 0,
y: 0
},
_j681 = {
x: 15,
y: 50
},
_j682 = true;
let _j683 = false,
_j684 = {
x: 0,
y: 0
},
_j685 = {
x: 85,
y: 70
},
_j686 = true;
let _j687 = false,
_j688 = {
x: 0,
y: 0
},
_j689 = {
x: 85,
y: 40
},
_j690 = true;
let _j691 = false,
_j692 = {
x: 0,
y: 0
},
_j693 = {
x: 15,
y: 40
},
_j694 = true;
let _j695 = 10;
var screenText = false,
_j696 = [],
_j697 = 30,
_j698 = 0;
let _j699 = 25,
_j700 = 30,
_j701 = 16,
_j702 = 200,
_j703 = 200;
let _j704 = false,
_j705 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j505 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j506 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j504 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j509 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j511 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j165();
if (doDemo) {
_j173('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j576 = window._preloadedDemo;
recordingData = _j576;
window._pendingAutoPlay = true;
} else {
var _j706 = './lib/demo.json';
var _j707 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j707)) {
_j706 = './lib/' + _j707 + '.json';
}
fetch(_j706)
.then(_j1521 => {
if (!_j1521.ok) throw new Error('HTTP ' + _j1521.status);
return _j1521.json();
})
.then(data => {
_j576 = data;
if (_j576 && _j576.events && _j576.events.length > 0) {
recordingData = _j576;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j111('system', '❌ Failed to load ' + _j706, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j708 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j709 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j708) {
try {
const loadedData = JSON.parse(_j708);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j709 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j710 = sessionStorage.getItem('pendingRecordingData');
const _j711 = sessionStorage.getItem('shouldAutoPlay');
if (_j710 && _j711 === 'true') {
try {
const loadedData = JSON.parse(_j710);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j173('📂 Recording Data Restored After Reload');
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
const _j712 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j713 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
const _j714 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j714) {
const _j715 = parseFloat(_j714[1]);
if (!isNaN(_j715) && _j715 >= 0.5 && _j715 <= 5) {
_j502 = _j715;
_j111('system', '🔗 Pixel density from URL', {
Value: _j715
});
}
} else if (window.APP_MODE === 'collector') {
_j502 = 2;
_j111('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j712) {
const _j716 = 1.0;
if (_j502 > _j716) {
_j502 = _j716;
_j111('system', '📱 Mobile pixel density override', {
Value: _j716,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j717 = sessionStorage.getItem('pendingPixelDensity');
if (_j717 && !_j712 && !_j714) {
const _j718 = parseInt(_j717);
if (!isNaN(_j718) && _j718 >= 1 && _j718 <= 5) {
_j502 = _j718;
sessionStorage.removeItem('pendingPixelDensity');
_j111('system', '🔄 Restoring pixel density from session', {
Value: _j718,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j502);
const _j719 = sessionStorage.getItem('pendingCanvasWidth');
const _j720 = sessionStorage.getItem('pendingCanvasHeight');
let _j721 = false;
if (_j719 && _j720) {
_j500 = parseInt(_j719);
_j501 = parseInt(_j720);
_j721 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j111('system', '🔄 Restoring canvas size from recording', {
Width: `${_j500}px`,
Height: `${_j501}px`
});
}
let _j722 = false,
_j723 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j724 = qs.substring(1).split('_');
for (var i = 0; i < _j724.length; i++) {
var ci = _j724[i].indexOf(':');
if (ci === -1) continue;
var k = _j724[i].substring(0, ci), v = parseInt(_j724[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j500 = v;
_j722 = true;
}
if (k === 'h' && v > 0) {
_j501 = v;
_j723 = true;
}
}
})();
if (_j713 && window.APP_MODE === 'artist' && !_j721) {
if (!_j722) _j500 = 380;
if (!_j723) _j501 = 600;
if (!_j722 || !_j723) {
_j111('system', '📱 Mobile phone default canvas size', {
Width: `${_j500}px`,
Height: `${_j501}px`
});
}
}
const _j725 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j725) {
try {
const _j475 = JSON.parse(_j725);
if (Array.isArray(_j475) && _j475.length === 3) {
canvasBackgroundColor[0] = _j475[0];
canvasBackgroundColor[1] = _j475[1];
canvasBackgroundColor[2] = _j475[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j111('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j475[0]}, ${_j475[1]}, ${_j475[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j500, _j501, WEBGL);
if (_j548) {
const _j726 = document.querySelector('canvas');
if (_j726) {
const _j727 = document.getElementById('zen-mode-btn');
const _j728 = (pressure) => {
if (!_j727) return;
if (pressure <= 0) {
_j727.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j727.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j729 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j557) {
_j557 = true;
_j111('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j558 = _j34(e.pressure);
_j556 = Math.min(_j558 / 0.3, 1.0);
_j728(_j558);
}
};
_j726.addEventListener('pointerdown', _j729);
_j726.addEventListener('pointermove', _j729);
_j726.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j557) {
_j558 = 0.0;
_j559[0] = _j559[1] = _j559[2] = 0;
_j556 = -1;
_j728(0);
}
});
const _j730 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j731 = t.touchType === 'stylus';
if (_j731 && t.force > 0) {
const _j732 = Math.min(t.force, 1.0);
if (!_j557) {
_j557 = true;
_j111('system', '🖊️ Stylus force detected', { force: t.force });
}
_j558 = _j34(_j732);
_j556 = Math.min(_j558 / 0.3, 1.0);
_j728(_j558);
}
}
};
_j726.addEventListener('touchstart', _j730, { passive: true });
_j726.addEventListener('touchmove', _j730, { passive: true });
_j726.addEventListener('touchend', () => {
if (_j557) {
_j558 = 0.0;
_j559[0] = _j559[1] = _j559[2] = 0;
_j556 = -1;
_j728(0);
}
}, { passive: true });
}
}
_j503 = createFramebuffer({
density: _j502
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
_j146();
_j138();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j137 === 'function') {
_j137();
}
_j47();
window.addEventListener('resize', function() {
setTimeout(_j47, 100);
});
_j173('Interactive Generative Art System');
oldBuffer = createFramebuffer({
density: _j502
});
oldBuffer.begin();
background(255);
oldBuffer.end();
_j609 = createGraphics(width, height, WEBGL);
_j609.noStroke();
_j609.pixelDensity(_j502);;
_j609.clear();
finalBuffer = createFramebuffer({
density: _j502
});
finalBuffer.begin();
background(255);
finalBuffer.end();
newBufferBlack = createFramebuffer({
density: _j502
});
newBufferBlack.begin();
background(255);
newBufferBlack.end();
_j610 = createFramebuffer({
density: _j502
});
_j611 = createGraphics(width, height, WEBGL);
_j611.noStroke();
_j611.pixelDensity(_j502);;
_j611.clear();
_j614 = createFramebuffer({
density: _j502
});
let _j476 = _j9(40, 20, 15, 0.2);
const _j477 = min(255, canvasBackgroundColor[0] * 1.1);
const _j478 = min(255, canvasBackgroundColor[1] * 1.1);
const _j479 = min(255, canvasBackgroundColor[2] * 1.1);
_j614.begin();
clear();
noStroke();
fill(_j477, _j478, _j479);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j476, -width / 2, -height / 2, width, height);
_j614.end();
_j476.remove();
_j615 = createFramebuffer({
density: _j502
});
_j615.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j615.end();
_j612 = createFramebuffer({
density: _j502
});
typeMapBuffer = createFramebuffer({
density: _j502
});
typeMapBuffer.begin();
background(0);
typeMapBuffer.end();
pingPongBuffer = createFramebuffer({
density: _j502
});
_j616 = createFramebuffer({
density: _j502
});
_j613 = createFramebuffer({
density: _j502
});
_j617 = createFramebuffer({
density: _j502
});
_j617.begin();
background(255);
_j617.end();
_j549 = createFramebuffer({
density: _j502
});
_j549.begin();
background(255);
_j549.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j502
});
}
_j503.begin();
background(255, 255, 255);
_j503.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j630 = hw;
_j631 = hh;
_j632 = hw;
_j633 = hh;
_j171();
_j517 = 10;
_j574 = 2;
_j519 = 0.5;
_j520 = 0.5;
_j518 = 0;
_j521 = 20;
x = y = _j522 = _j523 = _j524 = _j525 = _j538 = 0;
_j434 = hw;
_j435 = hh;
_j526 = 0;
_j167();
_j174();
_j27();
_j172();
window.addEventListener('mouseup', function(e) {
if (_j544 && !_j626) {
const _j733 = document.querySelector('canvas');
if (_j733) {
const bounds = _j733.getBoundingClientRect();
const _j734 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j734) {
_j111('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j545) {
_j545 = true;
_j566 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j561 = _j48(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j561 = false;
});
document.addEventListener('mousemove', function(e) {
if (_j550) return;
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j539 = _j180(mouseX);
_j540 = _j180(mouseY);
} else {
const _j733 = document.querySelector('canvas');
if (!_j733) return;
const bounds = _j733.getBoundingClientRect();
const _j735 = (e.clientX - bounds.left) / bounds.width;
const _j736 = (e.clientY - bounds.top) / bounds.height;
_j539 = _j180(_j735 * width);
_j540 = _j180(_j736 * height);
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
if (!_j1393.enabled) return;
_j1393.frameCount++;
let _j737 = 60;
const now = millis();
if (_j1393.lastFrameTime > 0) {
const deltaTime = now - _j1393.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j737 = 1000 / deltaTime;
_j737 = Math.max(1, Math.min(120, _j737));
}
} else {
try {
const _j738 = frameRate();
if (!isNaN(_j738) && _j738 > 0) {
_j737 = _j738;
}
} catch (e) {}
}
_j1393.lastFrameTime = now;
_j1393._pushFR(_j737);
if (_j1393.frameCount - _j1393.lastCheckFrame >= _j1393.checkInterval) {
_j1393.lastCheckFrame = _j1393.frameCount;
const _j739 = _j1393._frLen > 0 ?
_j1393._avgFR() :
_j737;
if (_j1393.logFpsToConsole) {
console.log('FPS:', _j739.toFixed(1));
}
const _j740 = 0.1;
const _j741 = _j739 <= (_j1393.frameRateThreshold + _j740);
if (_j741) {
const now = millis();
if (now - _j1393.lastPerformanceLog > _j1393.logCooldown) {
_j1393.lastPerformanceLog = now;
_j36(_j739);
}
}
}
}
function _j36(_j739) {
const _j742 = _j1393.performanceDataAccumulated;
const sampleCount = _j742.sampleCount > 0 ? _j742.sampleCount : 1;
if (sampleCount === 0 || _j742.drawTotal === 0) {
const _j743 = _j1393.performanceData;
const _j744 = _j743.drawTotal > 0 ? _j743.drawTotal : 1;
const report = {
'平均帧率': `${_j739.toFixed(1)} fps`,
'目标帧率': `${_j1393.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j739).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j500}x${_j501}`,
'Pixel Density': _j502
};
const stateInfo = {
'正在绘制': _j544 ? '是' : '否',
'正在播放': _j626 ? '是' : '否',
'倒计时中': _j545 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j641 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
_j111('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j742.drawTotal / sampleCount,
updatePlayback: _j742.updatePlayback / sampleCount,
updateCompositeBuffer: _j742.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j742.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j742.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j742.updateBlurEffect / sampleCount,
applyCameraProjection: _j742.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j742.drawLayersWithBlur / sampleCount,
other: _j742.other / sampleCount
};
const _j744 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j745 = [];
const _j746 = _j744 * 0.1;
if (data.updatePlayback > _j746) {
_j745.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j744) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j746) {
_j745.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j744) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j746) {
_j745.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j744) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j746) {
_j745.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j744) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j746) {
_j745.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j744) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j746) {
_j745.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j744) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j746) {
_j745.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j744) * 100).toFixed(1)
});
}
if (data.other > _j746) {
_j745.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j744) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j739.toFixed(1)} fps`,
'目标帧率': `${_j1393.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j739).toFixed(2)} ms`,
'总耗时': `${_j744.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j500}x${_j501}`,
'Pixel Density': _j502
};
const stateInfo = {
'正在绘制': _j544 ? '是' : '否',
'正在播放': _j626 ? '是' : '否',
'倒计时中': _j545 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j641 ? '是' : '否',
'笔画数量': typeof allBrushStrokes !== 'undefined' ? allBrushStrokes.length : 0
};
if (_j745.length > 0) {
report['性能瓶颈'] = _j745.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j747 = [];
if (data.drawLayersWithBlur > _j746) {
_j747.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j746) {
_j747.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j500 * _j501 > 1500000) {
_j747.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 100) {
_j747.push('笔画数量较多，考虑清理旧笔画');
}
if (_j747.length > 0) {
report['优化建议'] = _j747.join('; ');
}
_j111('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1393.performanceData).forEach(key => {
_j1393.performanceData[key] = 0;
});
Object.keys(_j1393.performanceDataAccumulated).forEach(key => {
_j1393.performanceDataAccumulated[key] = 0;
});
}
let _j748 = 0;
const _j749 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j750 = (++_j748 % _j749 === 0);
const _j751 = _j750 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j229.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j752 = _j750 ? performance.now() : 0;
if (_j626) {
updatePlayback();
}
if (_j750) _j1393.performanceData.updatePlayback += performance.now() - _j752;
_j26();
if (_j563 || _j544 || _j545 || _j626 || _j669) {
if (_j750) _j752 = performance.now();
updateCompositeBuffer();
if (_j750) _j1393.performanceData.updateCompositeBuffer += performance.now() - _j752;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j33();
}
if (_j750) _j752 = performance.now();
updateEasyCamAutoTracking();
if (_j750) _j1393.performanceData.updateEasyCamAutoTracking += performance.now() - _j752;
if (_j750) _j752 = performance.now();
drawCursorToBuffer();
if (_j750) _j1393.performanceData.drawCursorToBuffer += performance.now() - _j752;
_j37();
if (_j750) _j752 = performance.now();
updateBlurEffect();
if (_j750) _j1393.performanceData.updateBlurEffect += performance.now() - _j752;
if (_j750) _j752 = performance.now();
applyCameraProjection();
if (_j750) _j1393.performanceData.applyCameraProjection += performance.now() - _j752;
if (_j750) _j752 = performance.now();
drawLayersWithBlur();
if (_j750) _j1393.performanceData.drawLayersWithBlur += performance.now() - _j752;
_j52();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j753 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j626 !== 'undefined' ? _j626 : '?') +
' evt=' + (typeof _j628 !== 'undefined' ? _j628 : '?');
_j612.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j753, -width/2 + 4, -height/2 + 3);
_j612.end();
if (d.totalFrames % 10 === 0) {
var _j754 = document.getElementById('defaultCanvas0');
var _j755 = document.getElementById('_fxDbgOvr');
if (!_j755 && _j754) {
_j755 = document.createElement('canvas');
_j755.id = '_fxDbgOvr';
_j755.width = _j754.offsetWidth;
_j755.height = 24;
_j755.style.position = 'fixed';
_j755.style.top = _j754.offsetTop + 'px';
_j755.style.left = _j754.offsetLeft + 'px';
_j755.style.zIndex = '2147483647';
_j755.style.pointerEvents = 'none';
document.body.appendChild(_j755);
}
if (_j755) {
var _j756 = _j755.getContext('2d');
_j756.clearRect(0, 0, _j755.width, _j755.height);
_j756.fillStyle = 'rgba(200,0,0,0.85)';
_j756.fillRect(0, 0, _j755.width, 22);
_j756.font = 'bold 13px monospace';
_j756.fillStyle = '#fff';
_j756.fillText(_j753, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j757 = document.getElementById('fxhash-capture-canvas');
var _j758 = document.getElementById('defaultCanvas0');
if (_j757 && typeof _j612 !== 'undefined') {
var _j759 = _j612.get();
_j757.width = _j759.width;
_j757.height = _j759.height;
var _j760 = _j757.getContext('2d');
_j760.drawImage(_j759.canvas, 0, 0);
if (typeof _j759.remove === 'function') _j759.remove();
if (_j758) {
_j757.style.cssText = _j758.style.cssText;
_j758.style.visibility = 'hidden';
}
_j757.style.position = 'absolute';
_j757.style.top = (_j758 ? _j758.offsetTop : 0) + 'px';
_j757.style.left = (_j758 ? _j758.offsetLeft : 0) + 'px';
_j757.style.zIndex = '99999';
_j757.style.visibility = 'visible';
_j757.style.border = 'none';
_j757.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j757.width + 'x' + _j757.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j761 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j760.save();
_j760.fillStyle = 'rgba(0,0,0,0.7)';
_j760.fillRect(10, 10, 280, _j761.length * 22 + 10);
_j760.font = '16px monospace';
_j760.fillStyle = '#0f0';
for (var li = 0; li < _j761.length; li++) {
_j760.fillText(_j761[li], 18, 30 + li * 22);
}
_j760.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j758 && _j757) {
_j757.width = _j758.width;
_j757.height = _j758.height;
var _j760 = _j757.getContext('2d');
_j760.drawImage(_j758, 0, 0);
if (_j758) _j758.style.visibility = 'hidden';
_j757.style.visibility = 'visible';
_j757.style.zIndex = '99999';
_j757.style.border = 'none';
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
if (_j750) {
const _j762 = performance.now();
const _j763 = _j1393.performanceData.updatePlayback +
_j1393.performanceData.updateCompositeBuffer +
_j1393.performanceData.updateEasyCamAutoTracking +
_j1393.performanceData.drawCursorToBuffer +
_j1393.performanceData.updateBlurEffect +
_j1393.performanceData.applyCameraProjection +
_j1393.performanceData.drawLayersWithBlur;
_j1393.performanceData.other = (_j762 - _j751) - _j763;
_j1393.performanceData.drawTotal = _j762 - _j751;
_j1393.performanceDataAccumulated.drawTotal += _j1393.performanceData.drawTotal;
_j1393.performanceDataAccumulated.updatePlayback += _j1393.performanceData.updatePlayback;
_j1393.performanceDataAccumulated.updateCompositeBuffer += _j1393.performanceData.updateCompositeBuffer;
_j1393.performanceDataAccumulated.updateEasyCamAutoTracking += _j1393.performanceData.updateEasyCamAutoTracking;
_j1393.performanceDataAccumulated.drawCursorToBuffer += _j1393.performanceData.drawCursorToBuffer;
_j1393.performanceDataAccumulated.updateBlurEffect += _j1393.performanceData.updateBlurEffect;
_j1393.performanceDataAccumulated.applyCameraProjection += _j1393.performanceData.applyCameraProjection;
_j1393.performanceDataAccumulated.drawLayersWithBlur += _j1393.performanceData.drawLayersWithBlur;
_j1393.performanceDataAccumulated.other += _j1393.performanceData.other;
_j1393.performanceDataAccumulated.sampleCount++;
}
_j35();
if (_j626) {
if (_j545 && !_j637) {
_j636 = millis();
_j637 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j545 && _j637) {
const _j764 = millis() - _j636;
const _j765 = _j627;
_j627 += _j764;
_j637 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j764.toFixed(0)}ms`);
if (_j628 < recordingData.events.length) {
const _j766 = recordingData.events[_j628];
const _j767 = _j766.m || _j766.type;
const _j768 = _j767 === 'mp' || _j767 === 'mousePressed';
const _j769 = _j766.t !== undefined ? _j766.t : _j766.time;
const _j770 = (millis() - _j627) * _j629;
const _j771 = _j769 - _j770;
if (_j768 || _j771 <= 0 || _j771 < 100) {
if (window.DEBUG_MODE && _j768) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j771.toFixed(0)}ms`);
}
_j187(_j766);
_j628++;
}
}
}
}
const _j772 = _j626 ? _j634 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j544));
const _j773 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j772 : (_j772 && _j527 > 0);
const _j774 = _j626 || (_j539 >= 0 && _j539 < width && _j540 >= 0 && _j540 < height) || (_j544 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j773 && _j774) {
window.drawLoopCount++;
if (_j567 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j567++;
let _j498, _j499;
if (_j626) {
_j498 = _j630;
_j499 = _j631;
} else {
_j498 = _j539;
_j499 = _j540;
}
if (_j567 % 2 === 0 && _j572) {
pathPoints.push({
x: _j498,
y: _j499
});
}
if (_j564) {
_j565.push({
x: _j498,
y: _j499,
t: millis(),
pressure: force
});
}
const _j775 = strokeSeed + _j567 * 100000000;
randomSeed(_j775);
if (brushMode === 3) {
let _j776 = crandom.random(0, 1);
let _j777 = crandom.random(150, 250);
let _j778 = _j776 > 0.1 ? noise(_j498 * 0.01, _j499 * 0.01) * 150 : _j777;
_j512 = (_j512 * 0.3) + (_j778 * 0.7);
} else {
let _j776 = crandom.random(0, 1);
let _j777 = crandom.random(20, 50);
let _j778 = _j776 > 0.3 ? noise(_j498 * 0.01, _j499 * 0.01) * 10 : _j777;
_j512 = (_j512 * 0.6) + (_j778 * 0.4);
}
_j527 -= randStep;
_j527 = max(1, _j527);
_j521 = _j527;
if (_j548 && _j567 >= 8) {
const _j779 = _j626 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j558;
const _j780 = baseBrushSize;
if (_j779 >= 0.3) {
const _j781 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j782 = _j560 || window._strokeStartBaseBrushSize || 1;
let _j783 = _j781.indexOf(_j782);
if (_j783 === -1) {
_j783 = _j781.findIndex(s => s >= _j782);
if (_j783 === -1) _j783 = _j781.length - 1;
}
let _j784;
if      (_j779 < 0.5) _j784 = 1;
else if (_j779 < 0.7) _j784 = 2;
else                     _j784 = 3;
const _j785 = Math.min(_j783 + _j784, _j781.length - 1);
baseBrushSize = _j781[_j785];
} else if (_j779 >= 0) {
baseBrushSize = _j560 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j780 && _j780 > 0) {
const _j786 = Math.pow(baseBrushSize / _j780, 0.6);
_j527 *= _j786;
initialSize *= _j786;
}
}
if (_j527 <= _j528 && !_j545 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j545 = true;
_j566 = 0;
}
_j434 = _j498;
_j435 = _j499;
_j526 = map(noise(_j434 * 0.01, _j435 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j787 = strokeSeed + _j567 * 10000000;
randomSeed(_j787);
const _j788 = crandom.random(pathRotation * 0.5, pathRotation);
const _j789 = crandom.random(pathRotation * 0.5, pathRotation);
const _j488 = -10;
_j434 += _j788 * (cos(_j526)) + _j488;
_j435 += _j789 * (sin(_j526)) + _j488;
}
if (_j618) {
const _j790 = (brushMode === 3) ? _j434 : Math.round(_j434);
const _j791 = (brushMode === 3) ? _j435 : Math.round(_j435);
const _j792 = { x: _j790, y: _j791 };
if (_j548 && _j557) _j792.p = Math.round(_j558 * 1000) / 1000;
_j181("md", _j792);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j541 = _j434;
_j542 = _j435;
let _j297 = newBufferBlack;
if (_j567 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j793 = dist(_j434, _j435, _j536, _j537);
const _j794 = 1;
if (_j793 > _j794) {
if (brushMode == 4 && _j567 < expectedStrokeLength) {
_j59(_j297, _j434, _j435, _j536, _j537);
}
if ((brushMode == 1 || brushMode == 7) && _j567 < expectedStrokeLength) {
let _j795 = expectedStrokeLength > 0 ? min(_j567 / expectedStrokeLength, 1.0) : 0;
let _j796 = crandom.random(0, 1);
if (_j796 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j567 > 5 && baseBrushSize < 6.0) _j57(_j297, _j434, _j435);
}
_j58(_j297, _j434, _j435, _j795, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j567 < expectedStrokeLength) {
let _j795 = expectedStrokeLength > 0 ? min(_j567 / expectedStrokeLength, 1.0) : 0;
let _j796 = crandom.random(0, 1);
if (_j796 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j795 < 0.6) {}
_j61(_j297, _j434, _j435, _j795, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j567 < expectedStrokeLength) {
_j64(_j297, _j434, _j435, _j536, _j537);
if (crandom.random(0, 1) > 0.4) _j57(_j297, _j434, _j435);
}
if (brushMode == 5 && _j567 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j57(_j297, _j434, _j435);
}
if (brushMode == 6 && _j567 < expectedStrokeLength) {
let _j795 = expectedStrokeLength > 0 ? min(_j567 / expectedStrokeLength, 1.0) : 0;
_j65(_j297, _j434, _j435, _j795, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j567 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j536 = _j434;
_j537 = _j435;
if (_j626) {
_j632 = _j630;
_j633 = _j631;
}
}
const _j797 = _j626 ? _j634 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j544));
const _j798 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j797 : (_j797 && _j527 > 0);
if (_j798) {
if (_j568 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j297 = newBufferBlack;
_j30(_j297, force);
_j568++;
if (_j568 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j545 && _j566 < maxUpdates) {
force = map(_j566, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j297 = newBufferBlack;
_j30(_j297, force);
_j566++;
_j568++;
} else if (_j545 && _j566 >= maxUpdates) {
_j111('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j39();
_j545 = false;
}
if (_j625 == 1 && _j626 && !_j669) {
_j176();
}
if (_j625 == 1 && !_j626 && _j669) {
_j177();
}
if (_j669) {
_j178();
if (_j625 == 1) {
frameRate(10);
}
}
if (_j625 == 0) {
frameRate(60);
}
_j139();
if (_j704) {
_j704 = false;
const _j799 = drawingSeed;
randomSeed(_j705);
noiseSeed(_j705);
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
_j18(_j612, scanBounds);
}
randomSeed(_j799);
noiseSeed(_j799);
_j705 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j800 = window.pendingEffectControlScanQueue.shift();
if (_j800 && typeof _j18 === 'function') {
let scanBounds = _j800.scanBounds;
const action = _j800.action;
const shapeType = _j800.shapeType;
const bugsSize = _j800.bugsSize !== undefined ? _j800.bugsSize : 10.0;
const scanSeed = _j800.scanSeed;
const recordedRandomCount = _j800.recordedRandomCount;
const targetPoints = _j800.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j801 = document.getElementById('bugs-size');
const _j802 = document.getElementById('bugs-size-value');
if (_j801 && _j802) {
_j801.value = bugsSize;
_j802.textContent = bugsSize;
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
const _j803 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j612, scanBounds, shapeType, targetPoints);
if (_j803) {
randomSeed(_j803);
noiseSeed(_j803);
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
if (_j626) {
return;
}
if (_j561) {
return;
}
if (_j550) {
if (_j552 === 'rect') {
_j553 = { x1: mouseX - 10, y1: mouseY - 10 };
} else if (_j552 === 'polygon') {
_j554.push({ x: mouseX - 10, y: mouseY - 10 });
if (typeof _j92 === 'function') _j92();
}
return false;
}
_j539 = _j180(mouseX);
_j540 = _j180(mouseY);
pmouseX = mouseX;
pmouseY = mouseY;
_j541 = _j539;
_j542 = _j540;
_j630 = _j539;
_j631 = _j540;
_j632 = _j539;
_j633 = _j540;
if (typeof _j559 !== 'undefined') {
_j559[0] = _j559[1] = _j559[2] = 0;
}
const _j804 = 300;
if (_j539 < -_j804 || _j539 > width + _j804 ||
_j540 < -_j804 || _j540 > height + _j804) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j618) {
_j622++;
}
if (_j618) {
console.log(`🎬 錄製開始 [第 ${_j622} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j40();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j111('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j539.toFixed(0)}, ${_j540.toFixed(0)})`
});
_j645++;
_j569 = _j567;
_j512 = 0;
_j567 = 0;
if (_j548 && _j560 !== null) {
baseBrushSize = _j560;
}
if (typeof _j1039 !== 'undefined') {
_j1039 = [];
}
if (typeof _j1040 !== 'undefined') {
_j1040 = 0;
}
_j513 = crandom.random(0.5, 0.99);
_j514 = crandom.random(-0.02, 0.02);
_j515 = crandom.random(-0.05, 0.05);
_j516 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j180(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j180(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j180(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j805 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j806 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j618) {
if (_j624) {
if (_j619 === 0) {
_j619 = millis();
_j111('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j807 = millis() - _j621;
if (_j807 > 0) {
_j623 += _j807;
_j111('recording', '⏸️ Skip interval', {
Interval: `${_j807.toFixed(0)}ms`,
Accumulated: `${_j623.toFixed(0)}ms`
});
}
}
_j624 = false;
} else {
const _j807 = millis() - _j621;
_j623 += _j807;
_j111('recording', '⏸️ Skip interval', {
Interval: `${_j807.toFixed(0)}ms`,
Accumulated: `${_j623.toFixed(0)}ms`
});
}
_j620 = {
strokeSeed: strokeSeed,
mouseCountStart: _j569,
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
whiteMaxOpacity: _j180(_j513),
hueShift: _j180(_j514),
satShift: _j180(_j515),
briShift: _j180(_j516),
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
maskData: _j555 || undefined
};
}
if (_j573 === 1) {
pathRotation = 0;
} else if (_j573 === 2) {
pathRotation = _j180(crandom.random(5, 10));
} else if (_j573 === 3) {
pathRotation = _j180(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j180(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j517 = 15;
_j574 = 5;
_j519 = 0.6;
_j520 = 0.5;
} else if (brushMode === 2) {
initialSize = _j180(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j517 = 10;
_j574 = 10;
_j519 = 0.3;
_j520 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j574 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j574 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j539 * 1, _j540 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j519 = 0.6;
_j520 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j574 = 1;
randStep = 0.05;
maxUpdates = 10;
_j517 = 10;
_j519 = 0.6;
_j520 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j574 = 1;
randStep = 0.05;
maxUpdates = 10;
_j517 = 10;
_j519 = 0.6;
_j520 = 0.5;
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
if (_j618 && _j620) {
_j620.initialSize = initialSize;
_j620.spraySize = spraySize;
_j620.step = _j517;
_j620.step2 = _j574;
_j620.randStep = randStep;
_j620.maxUpdates = maxUpdates;
_j620.pathRotation = pathRotation;
_j620.spring = _j519;
_j620.friction = _j520;
_j620.baseBrushSize = baseBrushSize;
_j620.expectedStrokeLength = expectedStrokeLength;
_j620.effect3Brightness = _j180(effect3Brightness);
}
_j527 = initialSize;
_j521 = _j527;
_j525 = _j521;
_j543 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j548 && _j560 === null) _j560 = baseBrushSize;
_j538 = 0;
x = _j539;
y = _j540;
_j522 = 0;
_j523 = 0;
_j524 = 0;
_j535 = 0;
_j529 = 0;
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
_j536 = _j539;
_j537 = _j540;
_j544 = true;
_j545 = false;
_j566 = 0;
_j568 = 0;
_j546 = true;
_j547 = false;
startX = _j539;
startY = _j540;
pathPoints = [{
x: _j539,
y: _j540
}];
_j572 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j618 && _j620) {
_j620.mouseX = _j539;
_j620.mouseY = _j540;
_j620.drawingSeed = drawingSeed;
_j620.brushModeSP = brushModeSP;
if (_j548 && _j557) _j620.hasPressure = true;
_j620.forceMapParams = {
randomSeed1: _j180(_j603[0]),
randomSeed2: _j180(_j603[1]),
randomSeed3: _j180(_j603[2]),
randomSeed4: _j180(_j603[3]),
scale1: _j180(_j604[0]),
scale2: _j180(_j604[1]),
scale3: _j180(_j604[2]),
amplitude1: _j180(_j605[0]),
amplitude2: _j180(_j605[1]),
amplitude3: _j180(_j605[2]),
phase1: _j180(_j606[0]),
phase2: _j180(_j606[1]),
phase3: _j180(_j606[2]),
vortexScale1: _j180(_j607[0]),
vortexScale2: _j180(_j607[1]),
clusterScale1: _j180(_j608[0]),
clusterScale2: _j180(_j608[1])
};
const _j808 = (brushMode === 3) ? _j539 : Math.round(_j539);
const _j809 = (brushMode === 3) ? _j540 : Math.round(_j540);
_j181("mp", {
x: _j808,
y: _j809,
strokeData: _j620
});
}
}
function mouseReleased() {
if (_j626) {
return;
}
if (_j550 && _j552 === 'rect' && _j553 && _j553.x1 !== undefined) {
const mx = mouseX - 10, my = mouseY - 10;
const x1 = Math.min(_j553.x1, mx);
const y1 = Math.min(_j553.y1, my);
const x2 = Math.max(_j553.x1, mx);
const y2 = Math.max(_j553.y1, my);
if (Math.abs(x2 - x1) > 5 && Math.abs(y2 - y1) > 5) {
_j553 = { x1: x1, y1: y1, x2: x2, y2: y2 };
drawMaskRect(x1, y1, x2, y2);
_j555 = { action: "rect", x1: x1, y1: y1, x2: x2, y2: y2 };
_j550 = false;
const toggle = document.getElementById('mask-mode-toggle');
if (toggle) toggle.checked = false;
if (typeof _j92 === 'function') _j92();
window.resetBrushPositionToMouse();
}
return;
}
if (!_j544) {
return;
}
if (_j564) {
_j565.push({ stroke: true, t: millis() });
}
const _j810 = crandom.getCount();
const _j811 = _j539;
const _j812 = _j540;
const _j813 = Math.round(constrain(_j811, 0, width));
const _j814 = Math.round(constrain(_j812, 0, height));
_j181("mr", {
x: _j813,
y: _j814
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j815 = randomCount - _j810;
const _j816 = window.drawLoopCount || 0;
const _j817 = window.recordedMouseDraggedCount || 0;
if (_j618) {
console.log(`   Draw: ${_j816} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j618) {
crandomDebugger.saveStroke('recording', _j622);
}
if (_j618) {
_j621 = millis();
_j111('recording', 'Stroke ended', {
FinalSize: _j527.toFixed(2),
CountdownStatus: _j545 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j539 < 0 || _j539 >= width || _j540 < 0 || _j540 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j1039 !== 'undefined' && _j1039.length > 0) {
_j1039 = _j1039.filter(_j1522 => _j1522.radius > 0);
}
if (!_j545) {
_j545 = true;
_j566 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j119();
return;
}
if (key === 'f' || key === 'F') {
if (_j669) {
_j177();
} else {
_j176();
}
return;
}
if (key === ' ') {
_j166();
console.clear();
let _j818 = _j229.length;
_j229 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j111('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j818} 个`
});
return false;
}
}
function _j37() {
const _j457 = doMoving && _j641 && _j640 !== null && _j626 && _j642;
const _j819 = (_j626 && _j457) || (!_j626 && (_j658 || _j662[0] !== 0 || _j662[40] !== 0 || _j662[80] !== 0 || _j662[120] !== 0));
if (_j819) {
if (!_j658) {
_j658 = true;
_j659 = millis();
_j660[0] = _j662[0];
_j660[40] = _j662[40];
_j660[80] = _j662[80];
_j660[120] = _j662[120];
}
const _j424 = millis() - _j659;
const _j425 = Math.min(_j424 / _j657, 1.0);
const _j820 = _j626 ? _j661 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j662[0] = lerp(_j660[0], _j820[0], _j425);
_j662[40] = lerp(_j660[40], _j820[40], _j425);
_j662[80] = lerp(_j660[80], _j820[80], _j425);
_j662[120] = lerp(_j660[120], _j820[120], _j425);
if (_j425 >= 1.0) {
_j662[0] = _j820[0];
_j662[40] = _j820[40];
_j662[80] = _j820[80];
_j662[120] = _j820[120];
if (!_j626) {
_j658 = false;
}
}
} else if (!_j626 && !_j658) {
_j662[0] = 0;
_j662[40] = 0;
_j662[80] = 0;
_j662[120] = 0;
}
}
function updateBlurEffect() {
const _j457 = doMoving && _j641 && _j640 !== null && _j626 && _j642;
const _j821 = _j626;
const _j822 = _j821 ? _j634 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j544));
const _j823 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j822 : (_j822 && _j527 > 0);
if (!doMoving) {
_j664[0] = 0;
_j664[40] = 0;
_j664[80] = 0;
_j664[120] = 0;
return;
}
if (_j821) {
if (_j668) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j663[0] = _j180(max(0, crandom.random(-5, 5)));
_j663[40] = _j180(max(0, crandom.random(-5, 5)));
_j663[80] = _j180(max(0, crandom.random(-5, 5)));
_j663[120] = _j180(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j665 = millis();
_j668 = false;
}
_j667 = _j822;
} else {
_j667 = false;
_j668 = false;
}
let _j824 = 0;
if (_j821) {
if (_j823) {
const _j424 = millis() - _j665;
const _j425 = min(1.0, _j424 / _j666);
_j824 = _j425;
} else if (_j545) {
const _j825 = map(_j566, 0, maxUpdates, 1.0, 0.0);
_j824 = _j825;
} else {
_j824 = 0;
}
if (_j457 && _j640 !== null) {
const _j421 = _j640.getDistance();
const _j417 = PI / 3;
const _j436 = height / (2 * tan(_j417 / 2));
const _j437 = 1.1;
const _j438 = 1.4;
const _j440 = _j436 / _j421;
const _j826 = _j438 - _j437;
const _j827 = (_j440 - _j437) / _j826;
const _j828 = constrain(_j827, 0.0, 1.0);
const _j829 = pow(_j828, 0.5);
_j824 = _j824 * _j829;
}
}
_j664[0] = _j663[0] * _j824;
_j664[40] = _j663[40] * _j824;
_j664[80] = _j663[80] * _j824;
_j664[120] = _j663[120] * _j824;
}
function drawLayersWithBlur() {
const _j457 = doMoving && _j641 && _j640 !== null && _j626 && _j642;
const _j486 = (typeof _j551 !== 'undefined' && _j551) ||
(typeof _j550 !== 'undefined' && _j550);
const _j487 = (typeof window !== 'undefined' && window.testMode === true);
const _j483 = ((_j544 || _j545) && _j566 < maxUpdates && _j572) || _j486 || _j487;
const _j830 = _j229.length > 0 && typeof _j21 === 'function';
const _j831 = false;
const _j832 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j509 && _j503;
if (_j504 && _j503) {
_j171();
}
_j610.begin();
clear();
if (_j832) {
let _j833 = _j612;
if (_j830) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j612, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j616, window.tempMetallicBuffer);
_j833 = _j616;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j509);
_j509.setUniform("rect", [0, 0, width * _j502, height * _j502]);
_j509.setUniform("tex0", _j833);
_j509.setUniform("forceMap", _j503);
_j509.setUniform("time", millis() * 0.005);
_j509.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j509.setUniform("distortEnabled", 1.0);
_j509.setUniform("displacementB", distortDisplacementB);
_j509.setUniform("displacementC", distortDisplacementC);
_j509.setUniform("showFbmMask", distortShowFbmMask);
_j509.setUniform("fbmSeed1", _j603[0] || 100);
_j509.setUniform("fbmSeed2", _j603[1] || 200);
_j509.setUniform("fbmSeed3", _j603[2] || 300);
_j509.setUniform("fbmSeed4", _j603[3] || 400);
} else {
_j509.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j509.setUniform("rsEnabled", 1.0);
_j509.setUniform("rsFrequency", _j578);
_j509.setUniform("rsWaveSpeed", _j579);
_j509.setUniform("rsStrength", _j580);
_j509.setUniform("rsGradientMix", _j581);
_j509.setUniform("rsScale", _j582);
} else {
_j509.setUniform("rsEnabled", 0.0);
}
_j509.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j509.setUniform("cellularScale", _j583);
_j509.setUniform("cellularSeed", _j584);
_j509.setUniform("whiteDotDensity", whiteDotEnabled ? _j585 : 0.0);
_j509.setUniform("grainAmount", grainEnabled ? _j586 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j612, 0, 0, width, height);
if (_j830) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j610, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j616, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j616, 0, 0, width, height);
}
}
_j610.end();
if (_j594 && _j595) {
const data = _j595;
const bounds = data.bounds;
const _j834 = {
rect: [0, 0, width * _j502, height * _j502],
blendType: data.blendType,
blendVol: _j601.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j601.pixD,
blendA: _j601.blendA,
blendB: _j601.blendB,
directVol: _j601.directVol,
snoiseVol: _j601.snoiseVol,
gobalStyle: _j601.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j601.colorDeep,
whiteDot: _j601.whiteDot,
doBigShape: _j601.doBigShape,
doMask: _j601.doMask,
multiDir: _j601.multiDir,
drawTime: _j601.drawTime,
seed: _j601.seed,
iTime: millis() * 0.001
};
if (typeMapBuffer && _j511) {
pingPongBuffer.begin();
clear();
shader(_j511);
for (const [key, val] of Object.entries(_j834)) {
_j511.setUniform(key, val);
}
_j511.setUniform('tex0', typeMapBuffer);
_j511.setUniform('lastStrokeTex', _j617);
_j511.setUniform('lastStrokeOnly', _j602 ? 1 : 0);
_j511.setUniform('isTypeMapMode', 1);
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
if (_j511) {
_j612.begin();
clear();
imageMode(CENTER);
image(oldBuffer, 0, 0, width, height);
_j612.end();
oldBuffer.begin();
shader(_j511);
for (const [key, val] of Object.entries(_j834)) {
_j511.setUniform(key, val);
}
_j511.setUniform('tex0', _j612);
_j511.setUniform('lastStrokeTex', _j617);
_j511.setUniform('lastStrokeOnly', _j602 ? 1 : 0);
_j511.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
oldBuffer.end();
}
if (_j511) {
_j612.begin();
clear();
imageMode(CENTER);
image(finalBuffer, 0, 0, width, height);
_j612.end();
finalBuffer.begin();
shader(_j511);
for (const [key, val] of Object.entries(_j834)) {
_j511.setUniform(key, val);
}
_j511.setUniform('tex0', _j612);
_j511.setUniform('lastStrokeTex', _j617);
_j511.setUniform('lastStrokeOnly', _j602 ? 1 : 0);
_j511.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
finalBuffer.end();
}
if (_j511) {
_j612.begin();
clear();
imageMode(CENTER);
image(_j610, 0, 0, width, height);
_j612.end();
_j610.begin();
shader(_j511);
for (const [key, val] of Object.entries(_j834)) {
_j511.setUniform(key, val);
}
_j511.setUniform('tex0', _j612);
_j511.setUniform('lastStrokeTex', _j617);
_j511.setUniform('lastStrokeOnly', _j602 ? 1 : 0);
_j511.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j610.end();
}
_j594 = false;
_j595 = null;
_j563 = true;
}
if (_j588 && _j511 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j610, 0, 0, width, height);
pingPongBuffer.end();
_j610.begin();
shader(_j511);
_j511.setUniform('rect', [0, 0, width * _j502, height * _j502]);
_j511.setUniform('tex0', pingPongBuffer);
_j511.setUniform('lastStrokeTex', _j617);
_j511.setUniform('lastStrokeOnly', _j602 ? 1 : 0);
_j511.setUniform('blendType', _j589);
_j511.setUniform('blendVol', _j601.blendVol * (1 + _j591 * 0.1));
_j511.setUniform('radSeed', _j593 * 0.001);
_j511.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j511.setUniform('pixD', _j601.pixD);
_j511.setUniform('blendA', _j601.blendA);
_j511.setUniform('blendB', _j601.blendB);
_j511.setUniform('directVol', _j601.directVol);
_j511.setUniform('snoiseVol', _j601.snoiseVol);
_j511.setUniform('gobalStyle', _j601.gobalStyle);
_j511.setUniform('vline', 5);
_j511.setUniform('hline', 5);
_j511.setUniform('cellT', 1.0);
_j511.setUniform('colorDeep', _j601.colorDeep);
_j511.setUniform('whiteDot', _j601.whiteDot);
_j511.setUniform('doBigShape', _j601.doBigShape);
_j511.setUniform('doMask', _j601.doMask);
_j511.setUniform('multiDir', _j601.multiDir);
_j511.setUniform('drawTime', _j601.drawTime);
_j511.setUniform('seed', _j601.seed);
_j511.setUniform('iTime', millis() * 0.001);
_j511.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j610.end();
}
noStroke();
push();
translate(0, 0, _j662[0]);
image(_j610, -width / 2, -height / 2);
pop();
if (_j483) {
push();
translate(0, 0, _j662[40]);
image(_j613, -width / 2, -height / 2);
pop();
}
if (_j626) {
if (showFuturePathPreview) {
_j42();
} else {
_j611.clear();
}
push();
translate(0, 0, _j662[80]);
image(_j611, -width / 2, -height / 2);
pop();
}
if (screenText && _j674) {
_j43();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j609.clear();
_j609.push();
_j45();
_j44();
_j609.pop();
} else {
_j609.clear();
_j609.push();
_j44();
_j609.pop();
}
const _j835 = (screenText && _j674) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0);
if (_j835) {
push();
translate(0, 0, _j662[120]);
image(_j609, -width / 2, -height / 2);
pop();
}
if (_j457) {
pop();
}
}
function drawMaskRect(x1, y1, x2, y2) {
var _j836 = height - y2;
var _j837 = height - y1;
push();
_j549.begin();
resetShader();
camera(0, 0, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 10000);
translate(-width / 2, -height / 2);
background(0);
noStroke();
fill(255);
rectMode(CORNER);
rect(x1, _j836, x2 - x1, _j837 - _j836);
_j549.end();
pop();
_j551 = true;
}
function drawMaskPolygon(points) {
if (points.length < 3) return;
push();
_j549.begin();
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
_j549.end();
pop();
_j551 = true;
}
function clearMask() {
push();
_j549.begin();
background(255);
_j549.end();
pop();
_j551 = false;
_j554 = [];
_j553 = null;
}
function testMaskRect() {
const cx = width / 2;
const cy = height / 2;
const size = 100;
const x1 = cx - size / 2;
const y1 = cy - size / 2;
_j553 = { x1: x1, y1: y1, x2: x1 + size, y2: y1 + size };
drawMaskRect(x1, y1, x1 + size, y1 + size);
console.log('[Mask] Test rect drawn at center:', x1, y1, size, 'x', size);
}
window.testMaskRect = testMaskRect;
window.clearMask = clearMask;
window.drawMaskRect = drawMaskRect;
window.drawMaskPolygon = drawMaskPolygon;
window.testMode = false;
let _j838 = null;
function _j38(src, _j1500) {
if (!src || !_j1500) return;
_j1500.begin();
clear();
push();
imageMode(CENTER);
image(src, 0, 0, width, height);
pop();
_j1500.end();
}
function enterTestMode() {
if (window.testMode) return;
if (!_j838) {
_j838 = {
oldBuffer: createFramebuffer({ density: _j502 }),
finalBuffer: createFramebuffer({ density: _j502 }),
pingPongBuffer: createFramebuffer({ density: _j502 }),
typeMapBuffer: createFramebuffer({ density: _j502 }),
newBufferBlack: createFramebuffer({ density: _j502 })
};
}
_j38(oldBuffer, _j838.oldBuffer);
_j38(finalBuffer, _j838.finalBuffer);
_j38(pingPongBuffer, _j838.pingPongBuffer);
_j38(typeMapBuffer, _j838.typeMapBuffer);
_j38(newBufferBlack, _j838.newBufferBlack);
_j838.allBrushStrokes = (typeof allBrushStrokes !== 'undefined') ? allBrushStrokes.slice() : null;
_j838.totalStrokeCount = (typeof totalStrokeCount !== 'undefined') ? totalStrokeCount : 0;
_j838.enterMillis = millis();
window.testMode = true;
_j563 = true;
}
function exitTestMode() {
if (!window.testMode) return;
if (_j838) {
_j38(_j838.oldBuffer, oldBuffer);
_j38(_j838.finalBuffer, finalBuffer);
_j38(_j838.pingPongBuffer, pingPongBuffer);
_j38(_j838.typeMapBuffer, typeMapBuffer);
_j38(_j838.newBufferBlack, newBufferBlack);
if (typeof allBrushStrokes !== 'undefined' && _j838.allBrushStrokes) {
allBrushStrokes = _j838.allBrushStrokes.slice();
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = _j838.totalStrokeCount;
}
if (typeof currentStrokeHighlight !== 'undefined') currentStrokeHighlight = null;
if (typeof pendingBugBounds !== 'undefined') pendingBugBounds = null;
if (typeof _j571 !== 'undefined') _j571 = null;
if (typeof _j838.enterMillis === 'number' &&
typeof _j623 !== 'undefined' &&
typeof _j618 !== 'undefined' && _j618) {
_j623 += millis() - _j838.enterMillis;
}
}
window.testMode = false;
_j563 = true;
}
window.enterTestMode = enterTestMode;
window.exitTestMode = exitTestMode;
function _j39() {
_j617.begin();
clear();
background(255);
imageMode(CENTER);
image(newBufferBlack, 0, 0);
_j617.end();
_j612.begin();
clear();
shader(_j507);
const _j471 = brushColorMode === 1 ? 1.0 : 0.0;
_j507.setUniform("rect", [0, 0, width * _j502, height * _j502]);
_j507.setUniform("baseTex", finalBuffer);
_j507.setUniform("strokeTex", newBufferBlack);
_j507.setUniform("brushColorMode", float(brushColorMode));
_j507.setUniform("brushCategory", _j471);
_j507.setUniform("whiteMaxOpacity", _j513);
_j507.setUniform("hueShift", _j514);
_j507.setUniform("satShift", _j515);
_j507.setUniform("briShift", _j516);
_j507.setUniform("keyBlendMode", keyBlendMode);
_j507.setUniform("useSharpen", useSharpen);
_j507.setUniform("typeMapTex", typeMapBuffer);
const _j839 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j507.setUniform("canvasBackgroundColor", _j839);
const _j840 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j507.setUniform("customBrushColor", _j840);
_j507.setUniform("useSpectralMix", useSpectralMix ? 1.0 : 0.0);
_j507.setUniform("useMask", _j551 ? 1.0 : 0.0);
if (_j551) _j507.setUniform("maskTex", _j549);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j612.end();
if (_j510 && typeMapBuffer) {
pingPongBuffer.begin();
clear();
imageMode(CENTER);
image(_j612, 0, 0);
pingPongBuffer.end();
_j612.begin();
clear();
shader(_j510);
_j510.setUniform("rect", [0, 0, width * _j502, height * _j502]);
_j510.setUniform("baseTex", typeMapBuffer);
_j510.setUniform("strokeTex", newBufferBlack);
_j510.setUniform("brushCategory", _j471);
_j510.setUniform("whiteMaxOpacity", _j513);
_j510.setUniform("useMask", _j551 ? 1.0 : 0.0);
if (_j551) _j510.setUniform("maskTex", _j549);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j612.end();
typeMapBuffer.begin();
clear();
background(0);
imageMode(CENTER);
image(_j612, 0, 0, width, height);
typeMapBuffer.end();
_j612.begin();
clear();
imageMode(CENTER);
image(pingPongBuffer, 0, 0);
_j612.end();
}
finalBuffer.begin();
clear();
background(255);
imageMode(CENTER);
image(_j612, 0, 0);
finalBuffer.end();
oldBuffer.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(newBufferBlack, 0, 0);
blendMode(BLEND);
oldBuffer.end();
if (_j562 && _j572 && pathPoints.length > 1) {
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
_j544 = false;
_j545 = false;
_j566 = 0;
_j546 = false;
_j547 = true;
let _j841 = null;
if (pathPoints.length > 0) {
let _j842 = 0,
_j843 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j842 += pt.x;
_j843 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j359 = _j842 / pathPoints.length;
const _j360 = _j843 / pathPoints.length;
_j571 = {
minX,
maxX,
minY,
maxY,
_j359,
_j360,
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
x: _j359,
y: _j360
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
if (allBrushStrokes.length > _j575) {
allBrushStrokes.shift();
}
_j841 = {
minX: _j571.minX,
maxX: _j571.maxX,
minY: _j571.minY,
maxY: _j571.maxY
};
}
pathPoints = [];
_j572 = false;
_j571 = null;
const _j844 = drawingSeed;
let _j845 = _j841;
if (!_j845 && allBrushStrokes.length > 0) {
const lastStroke = allBrushStrokes[allBrushStrokes.length - 1];
if (lastStroke.bounds) {
_j845 = {
...lastStroke.bounds
};
}
}
if (_j845) {
pendingBugBounds = _j845;
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
if (_j570 && _j626) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j846 = false;
if (_j626 && recordingData && recordingData.events) {
let _j847 = 0;
for (let e of recordingData.events) {
const _j856 = e.m || e.type;
if (_j856 === 'mr' || _j856 === 'mouseReleased') {
_j847++;
}
}
const _j848 = totalStrokeCount;
const _j849 = _j848 >= (_j847 - 12);
_j846 = _j849;
if (_j846) {
const _j850 = crandom.random(0, 1) > 0.1;
if (_j850) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j845 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j845;
}
}
}
} else if (!_j626) {
_j846 = true;
}
if (_j846) {
_j704 = true;
_j705 = strokeSeed;
if (!_j626 && _j845 && !pendingBugBounds) {
pendingBugBounds = _j845;
}
} else {
if (_j845 && !pendingBugBounds) {
pendingBugBounds = _j845;
}
}
randomSeed(_j844);
noiseSeed(_j844);
}
if (typeof gc !== 'undefined') {
gc();
}
_j563 = true;
}
function _j40() {
if (_j546 && !_j547) {
if (_j544 || _j545) {
_j39();
}
}
}
function _j41() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j851 = [];
const _j852 = 20;
let _j853 = _j628;
let _j848 = null;
const offsetX = typeof _j638 !== 'undefined' ? _j638 : 0;
const offsetY = typeof _j639 !== 'undefined' ? _j639 : 0;
const _j854 = 500;
let _j855 = 0;
while (_j851.length < _j852 && _j853 < recordingData.events.length && _j855 < _j854) {
const event = recordingData.events[_j853];
const _j856 = event.m || event.type;
if (_j856 === 'mp' || _j856 === 'mousePressed') {
_j848 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j853,
data: event.strokeData || event.d || {}
};
} else if ((_j856 === 'md' || _j856 === 'mouseDragged') && _j848) {
_j848.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j856 === 'mr' || _j856 === 'mouseReleased') && _j848) {
_j848.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j851.push(_j848);
_j848 = null;
}
_j853++;
_j855++;
}
return _j851;
}
function _j42() {
if (!_j626 || !recordingData.events || recordingData.events.length === 0) {
_j611.clear();
return;
}
const now = millis();
const _j857 =
_j577.lastEventIndex !== _j628 ||
(now - _j577.lastUpdateTime) > _j577.updateInterval;
if (_j857) {
_j577.cachedStrokes = _j41();
_j577.lastEventIndex = _j628;
_j577.lastUpdateTime = now;
}
const _j851 = _j577.cachedStrokes;
_j611.clear();
if (_j851.length === 0) {
return;
}
_j611.push();
const time = millis() * 0.003;
for (let i = 0; i < _j851.length; i++) {
const _j858 = _j851[i];
const path = _j858.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j851.length - 1, 200, 80);
const _j859 = sin(time + i * 0.8) * 0.3 + 1;
const _j860 = _j858.eventIndex * 0.1;
const _j861 = 20;
const _j862 = min(max(floor(path.length / 5), 2), _j861);
const _j863 = [];
for (let s = 0; s < _j862; s++) {
const t = s / (_j862 - 1);
const _j303 = t * (path.length - 1);
const _j864 = floor(_j303);
const _j865 = min(_j864 + 1, path.length - 1);
const _j866 = _j303 - _j864;
const x1 = path[_j864].x;
const y1 = path[_j864].y;
const x2 = path[_j865].x;
const y2 = path[_j865].y;
const t1 = path[_j864].t || 0;
const t2 = path[_j865].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j863.push({
x: lerp(x1, x2, _j866),
y: lerp(y1, y2, _j866),
t: lerp(t1, t2, _j866)
});
}
const _j867 = [];
let _j868 = 0.01;
for (let j = 1; j < _j863.length; j++) {
const dx = _j863[j].x - _j863[j-1].x;
const dy = _j863[j].y - _j863[j-1].y;
const dt = _j863[j].t - _j863[j-1].t;
const _j869 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j867.push(_j869);
if (_j869 > _j868) _j868 = _j869;
}
_j611.noFill();
_j611.strokeCap(ROUND);
for (let j = 1; j < _j863.length; j++) {
const _j786 = constrain(_j867[j-1] / _j868, 0, 1);
const r = Math.round(_j786 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j786 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j786) * 255);
_j611.stroke(r, g, b, 160);
_j611.strokeWeight(1.0);
_j611.line(
_j863[j-1].x, _j863[j-1].y,
_j863[j].x, _j863[j].y
);
}
let _j870 = 0;
for (let j = 0; j < _j863.length - 1; j++) {
_j870 += dist(_j863[j].x, _j863[j].y, _j863[j + 1].x, _j863[j + 1].y);
}
if (isNaN(_j870) || _j870 <= 0 || _j863.length < 2) {
continue;
}
const _j871 = constrain(floor(_j870 / 150), 1, 3);
for (let a = 0; a < _j871; a++) {
_j611.push();
const _j872 = (time * 0.1 + _j860 + a * (1.0 / _j871)) % 1.0;
const _j873 = _j872 * _j870;
let _j874 = 0;
let _j875 = _j863[0].x;
let _j876 = _j863[0].y;
let angle = 0;
for (let j = 0; j < _j863.length - 1; j++) {
const _j877 = dist(_j863[j].x, _j863[j].y, _j863[j + 1].x, _j863[j + 1].y);
if (_j877 <= 0.0001) {
_j875 = _j863[j + 1].x;
_j876 = _j863[j + 1].y;
if (j + 1 < _j863.length - 1) {
angle = atan2(_j863[j + 2].y - _j863[j + 1].y, _j863[j + 2].x - _j863[j + 1].x);
} else {
angle = atan2(_j863[j + 1].y - _j863[j].y, _j863[j + 1].x - _j863[j].x);
}
break;
}
if (_j874 + _j877 >= _j873) {
const _j866 = (_j873 - _j874) / _j877;
const _j878 = isNaN(_j866) || !isFinite(_j866) ? 0 : constrain(_j866, 0, 1);
_j875 = lerp(_j863[j].x, _j863[j + 1].x, _j878);
_j876 = lerp(_j863[j].y, _j863[j + 1].y, _j878);
angle = atan2(_j863[j + 1].y - _j863[j].y, _j863[j + 1].x - _j863[j].x);
break;
}
_j874 += _j877;
}
const _j879 = 200 * (1 - _j872 * 0.5);
_j611.translate(_j875, _j876);
_j611.rotate(angle);
const _j880 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j611.fill(0, 0, 255, _j879);
_j611.noStroke();
_j611.triangle(
0, 0,
-4 * _j880, -2 * _j880,
-4 * _j880, 2 * _j880
);
_j611.stroke(0, 150, 255, _j879);
_j611.strokeWeight(0.3);
_j611.noFill();
_j611.triangle(
0, 0,
-4 * _j880, -2 * _j880,
-4 * _j880, 2 * _j880
);
_j611.pop();
}
const _j881 = path[0];
const _j403 = path[path.length - 1];
_j611.noFill();
_j611.stroke(0, 0, 255, 150);
_j611.strokeWeight(0.8);
_j611.ellipse(_j881.x, _j881.y, 5, 5);
_j611.ellipse(_j403.x, _j403.y, 5, 5);
_j611.noStroke();
_j611.fill(0, 0, 255, 255);
_j611.ellipse(_j881.x, _j881.y, 2, 2);
_j611.ellipse(_j403.x, _j403.y, 2, 2);
if (font) {
_j611.textFont(font);
_j611.noStroke();
const data = _j858.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j882 = _j881.x - 2;
const _j883 = _j881.y + 8;
_j611.textSize(6);
_j611.fill(0, 0, 255, 255);
_j611.textAlign(LEFT, CENTER);
_j611.text('#' + (i + 1), _j882, _j883);
}
}
_j611.pop();
}
function _j43() {
_j609.clear();
_j609.push();
_j609.noFill();
_j609.noStroke();
_j609.rectMode(CENTER);
let _j786 = (width * 0.05) / height;
_j609.rect(0, 0, width * 0.95, height * (1 - _j786));
_j609.translate(-width / 2 - 5, -height / 2 + 20);
_j609.textAlign(LEFT, TOP);
if (font) {
_j609.textFont(font);
}
_j609.textSize(6);
let _j884 = width - 50;
_j609.fill(0, 0, 0, 100);
_j609.noStroke();
let _j885 = [];
let _j269 = _j700;
let _j886 = Math.max(0, _j696.length - _j697 - _j698);
let _j887 = _j696.length;
for (let i = _j886; i < _j887; i++) {
let line = _j696[i];
let _j888 = _j46(line.text, _j884, _j609);
for (let j = 0; j < _j888.length; j++) {
if (_j885.length >= _j697) break;
_j885.push({
type: line.type,
text: _j888[j],
timestamp: line.timestamp
});
}
if (_j885.length >= _j697) break;
}
for (let i = 0; i < _j885.length; i++) {
let line = _j885[i];
let y = _j700 + i * _j701;
if (line.type === 'recording') {
_j609.fill(255, 0, 0, _j702);
} else if (line.type === 'playback') {
_j609.fill(0, _j702);
} else if (line.type === 'system') {
_j609.fill(0, 0, 255, _j702);
} else if (line.type === 'art') {
_j609.fill(0, _j702);
} else {
_j609.fill(0, _j702);
}
_j609.text("--", _j699, y);
_j609.text(line.text, _j699, y);
}
_j45();
_j609.pop();
_j44();
}
function _j44() {
if (window.showStrokeDivider === false) return;
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (strokeCount === 0) return;
_j609.push();
_j609.resetMatrix();
_j609.translate(0, 0);
const _j889 = hh - 15;
const _j890 = width * 0.98;
const _j891 = -_j890 / 2;
const _j892 = _j890 / 2;
const _j893 = _j892 - _j891;
_j609.stroke(0, 50);
_j609.strokeWeight(1);
_j609.noFill();
_j609.line(_j891, _j889, _j892, _j889);
_j609.strokeWeight(1.2);
_j609.line(_j891, _j889 + 5, _j891, _j889 - 5);
_j609.line(_j892, _j889 + 5, _j892, _j889 - 5);
if (strokeCount > 0) {
const _j894 = _j893 / strokeCount;
_j609.stroke(0, 70);
_j609.strokeWeight(0.7);
for (let i = 1; i < strokeCount; i++) {
const x = _j891 + i * _j894;
_j609.line(x, _j889 - 5, x, _j889);
}
if (font) _j609.textFont(font);
_j609.textAlign(CENTER, CENTER);
_j609.textSize(10);
_j609.fill(0, 50);
_j609.noStroke();
const _j882 = _j892;
const _j883 = _j889 - 15;
_j609.text(strokeCount.toString(), _j882, _j883);
}
_j609.pop();
}
function _j45() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j895 = millis();
const _j424 = _j895 - currentStrokeHighlight.startTime;
const _j896 = 1000;
const _j897 = _j896 * 0.5;
if (_j424 < _j896) {
let alpha = 255;
if (_j424 > _j897) {
const _j898 = (_j424 - _j897) / (_j896 - _j897);
alpha = 255 * (1 - _j898);
}
const gp = currentStrokeHighlight.gridParams;
_j609.push();
_j609.resetMatrix();
_j609.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j395 = 5;
const _j396 = 5;
_j609.stroke(255, 0, 0, alpha);
_j609.strokeWeight(1);
_j609.noFill();
let _j899 = true;
let _j874 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j397 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j397;
let dy = (y2 - y1) / _j397;
let _j398 = 0;
while (_j398 < _j397) {
let _j399 = _j899 ? _j395 : _j396;
let _j400 = min(_j399 - _j874, _j397 - _j398);
if (_j899) {
let startX = x1 + dx * _j398;
let startY = y1 + dy * _j398;
let _j401 = x1 + dx * (_j398 + _j400);
let _j402 = y1 + dy * (_j398 + _j400);
_j609.line(startX, startY, _j401, _j402);
}
_j398 += _j400;
_j874 += _j400;
if (_j874 >= (_j899 ? _j395 : _j396)) {
_j899 = !_j899;
_j874 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j881 = currentStrokeHighlight.points[0];
const _j403 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j609.fill(255, 0, 0, alpha);
_j609.noStroke();
_j609.ellipse(_j881.x, _j881.y, 5, 5);
_j609.fill(255, 0, 0, alpha);
_j609.ellipse(_j403.x, _j403.y, 5, 5);
}
}
const _j359 = (gp.left + gp.right) / 2;
const _j360 = (gp.top + gp.bottom) / 2;
_j609.stroke(0, 0, 200, alpha);
_j609.strokeWeight(1.0);
_j609.noFill();
_j609.rectMode(CORNER);
_j609.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j609.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j46(text, _j1501, _j1490 = null) {
let _j900 = text.split(' ');
let _j761 = [];
let _j901 = '';
for (let i = 0; i < _j900.length; i++) {
let _j902 = _j901 + (_j901 ? ' ' : '') + _j900[i];
let _j903 = _j1490 ? _j1490.textWidth(_j902) : textWidth(_j902);
if (_j903 > _j1501 && _j901) {
_j761.push(_j901);
_j901 = _j900[i];
} else {
_j901 = _j902;
}
}
if (_j901) {
_j761.push(_j901);
}
return _j761;
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
_j561 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j539 = _j180(mouseX);
_j540 = _j180(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j561) return true;
if (_j550) return true;
_j539 = _j180(mouseX);
_j540 = _j180(mouseY);
return false;
}
function touchEnded() {
if (_j561) {
_j561 = false;
return true;
}
_j561 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j48(clientX, clientY) {
const _j904 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('mask-panel'),
document.getElementById('zen-mode-btn'),
document.getElementById('collect-panels-btn')
];
for (let panel of _j904) {
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
const _j905 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j905)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j905)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j905)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j905)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j905 = 20;
return {
minX: Math.max(0, (gp.left - _j905)) / width,
minY: Math.max(0, (gp.top - _j905)) / height,
maxX: Math.min(width, (gp.right + _j905)) / width,
maxY: Math.min(height, (gp.bottom + _j905)) / height
};
}
return null;
}
function _j50(blendType, seed = null, _j1502 = false) {
if (!_j511) return;
_j588 = true;
_j589 = blendType;
_j590 = millis();
_j596 = 0;
_j591 = 0;
_j599 = _j1502;
_j593 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j601.seed = _j593 * 0.0001;
}
function _j51() {
if (!_j588) return null;
const duration = millis() - _j590;
const iterations = _j591;
const frames = _j596;
if (iterations > 0 && flowEffectStrokeBounds) {
_j594 = true;
_j595 = {
blendType: _j589,
iterations: iterations,
seed: _j593,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j588 = false;
_j589 = 0;
_j599 = false;
return {
duration,
iterations,
frames
};
}
function _j52() {
if (!_j588) return;
_j596++;
_j591 = Math.floor(_j596 / _j600);
if (_j599 && _j597 > 0) {
if (_j596 >= _j597) {
_j591 = _j598;
const _j906 = document.getElementById('flow-iteration-count');
if (_j906) {
_j906.textContent = _j591;
}
_j51();
_j597 = 0;
_j598 = 0;
return;
}
}
const _j906 = document.getElementById('flow-iteration-count');
if (_j906) {
_j906.textContent = _j591;
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
_j601.seed = seed * 0.0001;
_j594 = true;
_j595 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j595);
}
const _j907 = [{
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
function _j54(_j1490, _j918, _j919, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j918, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j919, alpha);
}
}
function _j55(_j1490, _j918, _j919, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j918, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j919, alpha);
}
}
function _j56(id, _j1490, _j1001, x, y, _j962, _j963, _j955, _j956, _j976, sizeVariation, _j995) {
let _j908 = _j976 * sizeVariation + _j995;
const _j909 = (_j548 && typeof _j560 !== 'undefined' && _j560 !== null) ? _j560 : baseBrushSize;
const _j910 = _j909 < 0.25;
let _j911 = _j910 ? max(2.0, _j909 * 10) : 15;
if (_j908 > _j911) {
_j908 = crandom.random(_j910 ? 0.6 : 1, _j911);
}
let sw = max(_j910 ? 0.6 : 1, _j908);
if (sw < 3) sw *= 2.0;
const offsetX = _j1001.offsetX;
const offsetY = _j1001.offsetY;
if (brushModeSP) {
const _j912 = max(0.15, min(1.5, _j909));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j913 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j912, 6 * _j912) : crandom.random(-16 * _j912, 16 * _j912);
let _j914 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j912, 6 * _j912) : crandom.random(-16 * _j912, 16 * _j912);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j955,
y + offsetY + _j956,
_j962 + offsetX + _j913,
_j963 + offsetY + _j914
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j955,
y + offsetY + _j956,
_j962 + offsetX,
_j963 + offsetY
);
}
} else if (!brushModeSP) {
if (_j909 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j955,
y + offsetY + _j956,
_j962 + offsetX,
_j963 + offsetY
);
}
}
const _j915 = [{
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
const _j916 = [{
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
const _j917 = [{
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
function _j57(_j1490, _j1503, _j1504) {
if (_j567 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j567, ">=", expectedStrokeLength, ")");
return;
}
_j1490.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j918 = _j60(_j512);
let _j919 = _j60(_j512);
const _j920 = _j626 ? _j632 : pmouseX;
const _j921 = _j626 ? _j633 : pmouseY;
let _j922 = 0.5 * initialSize * noise(_j1503 * 0.01, _j1504 * 0.01) * (abs(_j1503 - _j920) + abs(_j1504 - _j921));
const _j923 = (_j548 && typeof _j560 !== 'undefined' && _j560 !== null) ? _j560 : baseBrushSize;
let _j924 = 0;
_j924 = min(spraySize * _j923, _j922) * map(noise(_j1503, _j1504), 0, 1, 0.3, 1);
let _j925 = max(3, _j924);
if (_j567 < 5) {
let _j926 = map(_j567, 0, 5, -0.2, 1.0);
_j925 = max(2, _j924 * _j926);
} else if (_j567 >= (expectedStrokeLength - 5)) {
let _j927 = map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j925 = max(2, _j924 * _j927);
}
for (let i = 0; i < _j574; i++) {
const _j928 = lerp(_j1503, _j920, i / _j574)
const lerpY = lerp(_j1504, _j921, i / _j574)
for (let j = 0; j < 10; j++) {
let _j913, _j914;
let _j929 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j930 = crandom.random(TWO_PI);
const _j931 = crandom.random();
const _j932 = crandom.random(-_j925 * _j929, _j925 * _j929);
const _j933 = crandom.random(-_j925 * _j929, _j925 * _j929);
if (shapeType === 0) {
const angle = _j930;
const radius = sqrt(_j931) * _j925;
_j913 = radius * cos(angle);
_j914 = radius * sin(angle);
} else if (shapeType === 1) {
_j913 = sin(_j930) * _j932;
_j914 = cos(_j930) * _j933;
} else if (shapeType === 2) {
const u = _j930 / TWO_PI;
const v = _j931;
if (u + v > 1) {
_j913 = _j925 * (1 - u);
_j914 = _j925 * (1 - v);
} else {
_j913 = _j925 * u;
_j914 = _j925 * v;
}
_j913 -= _j925 * 0.5;
_j914 -= _j925 * 0.5;
} else {
const u = _j932 / _j925;
const v = _j933 / _j925;
const _j934 = abs(u) + abs(v);
if (_j934 > 1) {
_j913 = (u / _j934) * _j925;
_j914 = (v / _j934) * _j925;
} else {
_j913 = u * _j925;
_j914 = v * _j925;
}
}
let _j776 = crandom.random(0, 1);
let _j777 = crandom.random(0.2, 1);
let _j935 = crandom.random(1, 2);
let _j936 = _j923 < 0.25 ? 0.1 : 0.3;
_j777 = max(_j936, _j777 * _j923);
_j935 = max(_j936, _j935 * _j923);
let _j937 = crandom.random(100, 255);
let ss = _j776 > 0.1 ? _j777 : _j935;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j938 = _j923 < 0.25 ? max(0.3, _j923 * 3) : 2;
let _j939 = _j923 < 0.25 ? _j923 * 5 : 20;
ss = max(_j938, min(_j939, ss));
_j55(_j1490, _j918, _j919, brushColorMode, _j937);
noStroke();
ellipse(_j928 + _j913, lerpY + _j914, ss, ss)
}
}
pop();
_j1490.end();
}
function _j58(_j1490, _j1503, _j1504, _j795, _j518 = 0, _j1505 = 0) {
if (_j567 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j567, ">=", expectedStrokeLength, ")");
return;
}
_j1490.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j918 = _j60(_j512);
let _j919 = _j60(_j512);
const _j940 = (_j548 && typeof _j560 !== 'undefined' && _j560 !== null) ? _j560 : baseBrushSize;
const _j941 = _j548 ? (_j626 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j558) : -1;
const _j942 = (_j941 >= 0) ? (0.7 + 0.4 * Math.min(_j941 / 0.7, 1.0)) : 1.0;
let _j910 = _j940 < 0.25;
let _j943 = 0.6;
let _j944 = _j910 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j943, baseBrushSize * 2);
let _j945 = max(_j943, baseBrushSize * 1.5);
let _j946 = _j910 ? swFloorTiny : _j945;
if (_j946 < 3) _j946 *= 2.0;
let _j947 = _j910 ?
swFloorTiny :
max(_j943, baseBrushSize * 1.2);
if (_j947 < 3) _j947 *= 2.0;
let _j948;
if (_j910) {
_j948 = max(2.0, _j940 * 10);
} else if (_j940 < 0.5) {
_j948 = 0.7;
} else {
_j948 = 9999;
}
_j535 = _j525 * 0.5;
let _j434 = _j1503;
let _j435 = _j1504;
if (!_j538) {
_j538 = 1;
x = _j434;
y = _j435;
}
_j522 += (_j434 - x) * _j519;
_j523 += (_j435 - y) * _j519;
_j522 *= _j520;
_j523 *= _j520;
let _j949 = sqrt(_j522 * _j522 + _j523 * _j523);
_j524 += _j949 - _j524;
if (baseBrushSize <= 1.0) {
_j524 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j524 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j524 *= 2.0;
} else {
_j524 *= 3.0;
}
_j525 = _j521 - _j524;
let _j950 = brushPaintCtlNoisebyFrame;
let _j951 = 1.0 * baseBrushSize * _j950 * _j942;
let _j952 = 2.0 * baseBrushSize * _j950 * _j942;
let _j953 = 3.0 * baseBrushSize * _j950 * _j942;
let showMainBrush = 0.1;
let _j954 = initialSize;
let _j955 = 0;
let _j956 = 0;
if (_j1505 == 0) showMainBrush = 0.08;
else if (_j1505 == 1) showMainBrush = 0.6;
else if (_j1505 == 2) showMainBrush = 0.2;
let _j957 = 1.0;
let _j958 = _j517 + brushPaintInterpolationOffset;
for (let i = 0; i < _j958; ++i) {
let _j959 = baseBrushSize >= 1.0 ? 5 : 3;
let _j960 = baseBrushSize >= 1.0 ? 2 : 0;
let _j961 = 0;
if (baseBrushSize < 1.5) _j961 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j961 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j961 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j961 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j518 = _j961;
if (_j567 < 5) _j518 = crandom.random(0, 1) > 0.2 ? 5 : _j518;
let _j962 = x;
let _j963 = y;
x += _j522 / _j958;
y += _j523 / _j958;
let _j964 = crandom.random(0, 1);
let _j965 = crandom.random(0, 4);
let _j966 = crandom.random(0, 3);
let _j967 = crandom.random(-1, 1);
let _j968 = crandom.random(-1, 1);
let _j969 = crandom.random(-1, 1);
let _j970 = crandom.random(-1, 1);
let _j971 = showMainBrush;
let _j972 = 1.0;
if (_j518 == 3) {
_j971 *= 0.8;
_j972 *= 0.8;
} else if (_j518 == 4) {
_j971 *= 0.6;
_j972 *= 0.5;
}
if (_j940 < 0.25) {
_j971 = 0.18;
} else if (_j940 < 1.5) {
_j971 = 0.1;
}
_j529 = lerp(_j529, _j525, 0.5);
if (brushMode == 1) {
if (_j964 > 0.8 && _j535 < 2 && i == 0) {
_j535 = _j180(_j965);
}
} else {
_j535 += (_j529 - _j535) * 0.3;
}
let _j973;
if (brushMode == 1) {
_j973 = _j535;
} else {
if (_j567 < 5) {
let _j926 = map(_j567, 0, 5, 0.05, 1.0);
_j973 = max(_j910 ? 0.1 : 0.5, _j535 * _j926);
if (explodeStart) {
_j955 = _j967 * map(_j567, 0, 5, 10, 0);
_j956 = _j968 * map(_j567, 0, 5, 10, 0);
}
} else if (_j567 >= (expectedStrokeLength - 5)) {
let _j927 = map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j973 = max(_j910 ? 0.1 : 0.5, _j535 * _j927);
if (explodeEnd) {
_j955 = _j969 * map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j956 = _j970 * map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j535 > 2) {
_j973 = max(_j910 ? 0.2 : 1, _j535);
} else {
let _j974 = (_j966 / 3) - 0.5;
_j973 = max(_j910 ? 0.1 : 0.5, _j535 + _j974);
}
}
}
let _j975 = _j973;
let _j976 = _j973 * 0.5;
if (_j518 == 3) {
_j975 *= 0.8;
_j976 *= 0.8;
} else if (_j518 == 4) {
_j975 *= 0.5;
_j976 *= 0.5;
}
let _j977 = crandom.random(0, 1);
let _j978 = crandom.random(150, 255);
let _j979 = crandom.random(100, 255);
let _j980 = crandom.random(100, 255);
let _j981 = crandom.random(100, 255);
if (_j910) {
if (!brushModeSP && _j567 > 1) {
_j54(_j1490, _j918, _j919, brushColorMode, _j978);
let kk = min(_j954, max(_j946, _j975));
strokeWeight(min(_j948, kk));
line(x + _j955, y + _j956, _j962, _j963);
}
} else if (_j977 > _j971) {
_j54(_j1490, _j918, _j919, brushColorMode, _j978);
const _j982 = !brushModeSP && _j567 > 3 && baseBrushSize < 4.0;
if (_j975 < 5) {
let kk = 0;
if (_j1505 == 0) kk = 1.5 * min(_j954, max(_j946, _j975));
else kk = min(_j954, max(_j946, _j975));
strokeWeight(min(_j948, kk));
if (_j982) line(x + _j955, y + _j956, _j962, _j963)
} else {
let kk = _j972 * min(_j954, max(_j946, _j975));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j948, kk));
if (_j982) line(x + _j955, y + _j956, _j962, _j963)
}
}
const _j983 = [];
const _j984 = [];
for (let j = 0; j < 30; j++) {
_j983.push(crandom.random(0, 1));
_j984.push(crandom.random(-0.5, 0.5) * _j957);
}
if (_j1505 == 1) {
_j983[0] = _j983[0] * 2.0;
_j983[1] = _j983[1] * 0.5;
_j983[2] = _j983[2] * 0.5;
} else if (_j1505 == 2) {
_j983[0] = _j983[0] * 0.5;
_j983[1] = _j983[1] * 0.5;
_j983[2] = _j983[2] * 0.5;
}
const _j985 = _j907[brushDir];
if (_j518 == 0) {
_j54(_j1490, _j918, _j919, brushColorMode, _j979);
if (_j983[0] > 0.2) {
const _j986 = _j985.flip1stX ? -1 : +1;
const _j987 = _j985.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j984[0], sizeVariation);
if (_j976 * sizeVariation < 5) {
strokeWeight(min(_j948, noise(x * 0.1, y * 0.2) + 1.5 * max(_j947, _j976 * sizeVariation)));
} else {
strokeWeight(min(_j948, _j972 * max(_j944, _j976 * sizeVariation)));
}
line(x + _j986 * _j952 + _j955, y + _j987 * _j952 + _j956, _j962 + _j986 * _j952, _j963 + _j987 * _j952);
}
if (_j983[1] > 0.3) {
const _j988 = _j985.flip1stX ? -1 : +1;
const _j989 = _j985.flip1stY ? +1 : -1;
_j54(_j1490, _j918, _j919, brushColorMode, _j980);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j984[1], sizeVariation);
strokeWeight(min(_j948, _j972 * max(_j944, _j976 * sizeVariation)));
line(x + _j988 * _j952 + _j955, y + _j989 * _j952 + _j956, _j962 + _j988 * _j952, _j963 + _j989 * _j952);
}
} else if (_j518 == 1) {
_j54(_j1490, _j918, _j919, brushColorMode, _j979);
if (_j983[0] > 0.1) {
const _j986 = _j985.flip1stX ? -1 : +1;
const _j987 = _j985.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j984[0], sizeVariation);
strokeWeight(min(_j948, _j972 * max(_j944, _j976 * sizeVariation)));
line(x + _j986 * _j952 + _j955, y + _j987 * _j952 + _j956, _j962 + _j986 * _j952, _j963 + _j987 * _j952)
};
if (_j983[1] > 0.05) {
const _j988 = _j985.flip1stX ? -1 : +1;
const _j989 = _j985.flip1stY ? +1 : -1;
_j54(_j1490, _j918, _j919, brushColorMode, _j980);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j984[1], sizeVariation);
strokeWeight(min(_j948, _j972 * max(_j944, _j976 * sizeVariation)));
line(x + _j988 * _j951 + _j955, y + _j989 * _j951 + _j956, _j962 + _j988 * _j951, _j963 + _j989 * _j951)
};
if (_j983[2] > 0.15) {
const _j990 = -1;
const _j991 = -1;
_j54(_j1490, _j918, _j919, brushColorMode, _j981);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j984[2], sizeVariation);
if (_j976 * sizeVariation < 5) {
strokeWeight(min(_j948, noise(x * 1, y * 2) + 1.5 * max(_j947, _j976 * sizeVariation)));
} else {
strokeWeight(min(_j948, _j972 * max(_j944, _j976 * sizeVariation)));
}
line(x + _j990 * _j953 + _j955, y + _j991 * _j953 + _j956, _j962 + _j990 * _j953, _j963 + _j991 * _j953)
};
} else if (_j518 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j54(_j1490, _j918, _j919, brushColorMode, _j979);
const _j992 = [_j983[0], _j983[1], _j983[2], _j983[3], _j983[4]];
const _j993 = [_j984[3], _j984[4], _j984[5], _j984[6], _j984[7]];
for (let i = 0; i < _j915.length; i++) {
const _j264 = _j915[i];
const _j994 = _j992[i];
const _j995 = _j993[i];
if (_j994 > _j264.randThreshold) {
let _j996;
if (_j264.offsetBase === 1) {
_j996 = _j951;
} else if (_j264.offsetBase === 2) {
_j996 = _j952;
} else if (_j264.offsetBase === 3) {
_j996 = _j953;
} else {
_j996 = _j264.offsetBase * baseBrushSize * _j950;
}
let _j997, _j998;
if (i === 0) {
_j997 = _j985.flip1stX ? -_j264.signX : _j264.signX;
_j998 = _j985.flip1stY ? -_j264.signY : _j264.signY;
} else {
_j997 = _j264.signX;
_j998 = _j264.signY;
}
let _j999 = _j997 * _j996;
let _j1000 = _j998 * _j996;
const _j1001 = {
offsetX: _j999,
offsetY: _j1000,
randThreshold: _j264.randThreshold,
pathProgressEnd: _j264.pathProgressEnd,
jitterIndex: _j264.jitterIndex
};
_j56(
2, _j1490, _j1001, x, y, _j962, _j963,
_j955, _j956, _j976, sizeVariation,
_j995
);
}
}
} else if (_j518 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j54(_j1490, _j918, _j919, brushColorMode, _j979);
let _j1002 = baseBrushSize * _j950;
if (baseBrushSize > 4.0) _j1002 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j916.length; i++) {
let _j1003 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j264 = _j916[i];
const _j994 = _j983[i];
const _j995 = _j984[_j264.jitterIndex];
if (_j994 > _j264.randThreshold) {
const _j1004 = cos(_j264.angle + _j1003) * _j264.radius * _j1002;
const _j1005 = sin(_j264.angle + _j1003) * _j264.radius * _j1002;
const _j999 = (_j985.flip1stX ? -1 : 1) * _j1004;
const _j1000 = (_j985.flip1stY ? -1 : 1) * _j1005;
const _j1001 = {
offsetX: _j999,
offsetY: _j1000,
randThreshold: _j264.randThreshold,
pathProgressEnd: _j264.pathProgressEnd,
jitterIndex: _j264.jitterIndex
};
_j56(
3, _j1490, _j1001, x, y, _j962, _j963,
_j955, _j956, _j976, sizeVariation,
_j995
);
}
}
} else if (_j518 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j54(_j1490, _j918, brushColorMode, _j979);
let _j1002 = baseBrushSize * _j950;
if (baseBrushSize > 4.0) _j1002 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j917.length; i++) {
let _j1003 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j264 = _j917[i];
const _j994 = _j983[i];
const _j995 = _j984[_j264.jitterIndex];
if (_j994 > _j264.randThreshold) {
const _j1004 = cos(_j264.angle + _j1003) * _j264.radius * _j1002;
const _j1005 = sin(_j264.angle + _j1003) * _j264.radius * _j1002;
const _j999 = (_j985.flip1stX ? -1 : 1) * _j1004;
const _j1000 = (_j985.flip1stY ? -1 : 1) * _j1005;
const _j1001 = {
offsetX: _j999,
offsetY: _j1000,
randThreshold: _j264.randThreshold,
pathProgressEnd: _j264.pathProgressEnd,
jitterIndex: _j264.jitterIndex
};
_j56(
4, _j1490, _j1001, x, y, _j962, _j963,
_j955, _j956, _j976, sizeVariation,
_j995
);
}
}
}
}
pop();
_j1490.end();
}
function _j59(_j1490, _j1503, _j1504, _j1506 = null, _j1507 = null, n = 80, o = 2) {
_j1490.begin();
push();
translate(-hw, -hh);
const _j920 = (_j1506 !== null && _j1507 !== null) ? _j1506 : (_j626 ? _j632 : pmouseX);
const _j921 = (_j1506 !== null && _j1507 !== null) ? _j1507 : (_j626 ? _j633 : pmouseY);
const _j1006 = (_j548 && typeof _j560 !== 'undefined' && _j560 !== null) ? _j560 : baseBrushSize;
const _j1007 = baseBrushSize;
const _j1008 = _j567;
const _j1009 = max(_j1006 < 0.25 ? 0.3 : 1, initialSize - (_j567 * randStep));
o = min(_j1007 * 2.0, 5 * _j1009 * penSketchNoiseBase * map(sin(_j1008 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1503 - _j920) > 0.1 || abs(_j1504 - _j921) > 0.1;
let _j918 = _j60(_j512);
let _j919 = _j60(_j512);
const _j1010 = [];
for (let i = 0; i < n; i++) {
_j1010.push({
t: crandom.random(0, 1),
strokeWeight: max(_j1006 < 0.25 ? 0.1 : 0.3, min(_j1006 < 0.25 ? _j1007 * 5 : 2, _j1007 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j1011 = _j1010[i];
let t = _j1011.t;
strokeWeight(_j1011.strokeWeight);
const angle = _j1011.angle;
const radius = _j1011.radius;
let _j1012 = radius * cos(angle);
let _j1013 = radius * sin(angle);
let _j937 = _j1011.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1503, _j920, t) + _j1012;
y = lerp(_j1504, _j921, t) + _j1013;
} else {
x = _j1503 + _j1012;
y = _j1504 + _j1013;
}
_j54(_j1490, _j918, _j919, brushColorMode, _j937);
if (_j567 > 3) point(x, y);
}
pop();
_j1490.end();
}
if (typeof _j61.lastAngle === 'undefined') {
_j61.lastAngle = 0;
}
if (typeof _j61.lastMovementAngle === 'undefined') {
_j61.lastMovementAngle = 0;
}
const _j1014 = [{
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
function _j60(_j918) {
if (brushColorMode === 0) {
return _j918 + crandom.random(10, 40);
} else {
return _j918 + crandom.random(30, 80);
}
}
function _j61(_j1490, _j1503, _j1504, _j795, _j518 = 0, _j1505 = 0) {
if (_j567 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j567, ">=", expectedStrokeLength, ")");
return;
}
const _j1015 = (_j548 && typeof _j560 !== 'undefined' && _j560 !== null) ? _j560 : baseBrushSize;
let _j910 = _j1015 < 0.25;
let _j948 = _j910 ? _j1015 * 5 : 9999;
_j1490.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j918 = _j60(_j512);
let _j919 = _j60(_j512);
let _j954 = initialSize * 0.3;
let _j434 = _j1503;
let _j435 = _j1504;
if (!_j538) {
_j538 = 1;
x = _j434;
y = _j435;
}
_j522 += (_j434 - x) * _j519;
_j523 += (_j435 - y) * _j519;
_j522 *= _j520;
_j523 *= _j520;
_j524 += sqrt(_j522 * _j522 + _j523 * _j523) - _j524;
_j524 *= 1.2;
if (baseBrushSize <= 1.0) {
_j524 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j524 *= 1.3;
} else {
_j524 *= 1.5;
}
_j525 = _j521 - _j524;
let _j1016 = _j529;
let _j1017 = _j525;
let _j1018 = _j434 - x;
let _j1019 = _j435 - y;
let _j1020 = sqrt(_j1018 * _j1018 + _j1019 * _j1019);
let _j1021 = max(_j910 ? 0.1 : 0.5, _j1017 * 0.5);
let _j1022 = 1.5 * min(_j954, max(_j910 ? 0.5 : 4, _j1021));
let _j1023 = _j1022 * 0.6;
let _j1024 = 0.8;
let _j1025 = max(_j1023 * _j1024, 0.5);
let _j1026 = max(1, ceil(_j1020 / _j1025));
_j1026 = max(10, min(50, _j1026));
let _j1027 = _j1026 / _j517;
let _j955 = 0;
let _j956 = 0;
let _j1028 = min(1.0, _j1020 / 10);
let _j1029 = _j1028 > 0.3;
rectMode(CENTER);
let _j228 = crandom.random(50, 100);
const _j231 = [];
for (let i = 0; i < _j517; ++i) {
_j231.push({
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
for (let i = 0; i < _j517; ++i) {
const _j1030 = _j231[i];
let _j962 = x;
let _j963 = y;
x += _j522 / _j517;
y += _j523 / _j517;
let _j425 = (i + 1) / _j517;
let _j1031 = lerp(_j1016, _j1017, _j425);
_j529 = lerp(_j529, _j1031, 0.5);
_j535 += (_j529 - _j535) * 0.8;
_j535 = max(_j910 ? 0.2 : 1.5, _j535);
let _j973;
let _j967 = _j1030.explodeX1;
let _j968 = _j1030.explodeY1;
let _j969 = _j1030.explodeX2;
let _j970 = _j1030.explodeY2;
if (_j567 < 5) {
let _j926 = map(_j567, 0, 5, 0.05, 1.0);
_j973 = max(_j910 ? 0.1 : 0.5, _j535 * _j926);
if (explodeStart) {
_j955 = _j967 * map(_j567, 0, 5, 10, 0);
_j956 = _j968 * map(_j567, 0, 5, 10, 0);
}
} else if (_j567 >= (expectedStrokeLength - 5)) {
let _j927 = map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j973 = max(_j910 ? 0.1 : 0.5, _j535 * _j927);
if (explodeEnd) {
_j955 = _j969 * map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j956 = _j970 * map(_j567, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j973 = max(_j910 ? 0.1 : 0.5, _j535);
}
let _j977 = _j1030.showMainBrush;
let _j978 = _j1030.mainAlpha;
let showMainBrush = 0.3;
let _j1032 = showMainBrush;
if (_j1027 > 1.0) {
_j1032 = showMainBrush / _j1027;
} else if (_j1027 < 1.0) {
_j1032 = showMainBrush * (2.0 - _j1027);
}
if (_j977 > _j1032 && _j567 > 5) {
noStroke();
_j54(_j1490, _j918, _j919, brushColorMode, _j978);
let ss = min(_j948, 1.2 * min(_j954, max(3 * _j1015, _j973)));
let dx = x - _j962;
let dy = y - _j963;
let distance = sqrt(dx * dx + dy * dy);
let _j270;
const _j317 = 0.1;
if (distance < _j317) {
_j270 = _j61.lastAngle;
} else {
let _j1033 = atan2(dy, dx);
_j270 = _j1033 + PI / 2;
_j61.lastAngle = _j270;
_j61.lastMovementAngle = _j1033;
}
push();
translate(x, y);
rotate(_j270);
let _j1023 = ss * _j1030.rectWidthMult;
rect(0, 0, _j1023, _j1023 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j1028 > 0.9 && _j567 > 5 && _j567 < (expectedStrokeLength - 5)) {
let _j1034 = -sin(_j61.lastMovementAngle);
let _j1035 = cos(_j61.lastMovementAngle);
for (let j = 0; j < _j1014.length; j++) {
let _j1036 = _j1014[j];
let _j1037 = _j1030.flyWhiteRandoms[j];
let _j1038 = _j1036.randThreshold - _j1028 * 0.3;
if (_j1037 > _j1038) {
let offsetX = _j1034 * _j1036.perpOffset * _j1015;
let offsetY = _j1035 * _j1036.perpOffset * _j1015;
stroke(_j228);
strokeWeight(min(_j948, max(_j910 ? 0.1 : 0.5, _j973 * 0.3)));
line(_j962 + offsetX, _j963 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
_j1490.end();
}
let _j1039 = [];
let _j1040 = 0;
function _j62(baseBrushSize, strokeSeed) {
let _j1041, _j1042;
if (baseBrushSize <= 0.1) {
_j1041 = 2;
_j1042 = 4;
} else if (baseBrushSize <= 0.25) {
_j1041 = 4;
_j1042 = 7;
} else if (baseBrushSize <= 0.5) {
_j1041 = 6;
_j1042 = 10;
} else if (baseBrushSize <= 2.0) {
_j1041 = 10;
_j1042 = 15;
} else if (baseBrushSize <= 3.0) {
_j1041 = 20;
_j1042 = 30;
} else {
_j1041 = 30;
_j1042 = 50;
}
let count;
if (_j1041 === _j1042) {
count = _j1041;
} else {
const _j1043 = strokeSeed + 50000;
randomSeed(_j1043);
count = Math.floor(crandom.random(_j1041, _j1042 + 1));
}
const _j1044 = [];
const _j1045 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1046 = _j1045 + i * 1000;
randomSeed(_j1046);
const perpOffset = crandom.random(-6, 6);
const _j1047 = _j1045 + i * 2000 + 1;
randomSeed(_j1047);
const randThreshold = crandom.random(0.5, 1.0);
const _j1048 = _j1045 + i * 3000 + 2;
randomSeed(_j1048);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1049 = _j1045 + i * 4000 + 3;
randomSeed(_j1049);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1050 = _j1045 + i * 5000 + 4;
randomSeed(_j1050);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1051 = _j1045 + i * 6000 + 5;
randomSeed(_j1051);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1052 = _j1045 + i * 7000 + 6;
randomSeed(_j1052);
const endDistanceOffset = crandom.random(0, 8);
const _j1053 = _j1045 + i * 8000 + 7;
randomSeed(_j1053);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1054 = _j1045 + i * 9000 + 8;
randomSeed(_j1054);
const widthVariationFactor = crandom.random(0, 1);
const _j1055 = _j1045 + i * 10000 + 9;
randomSeed(_j1055);
const offsetVariationFactor = crandom.random(0, 1);
_j1044.push({
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
_j1044.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1044;
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
function _j64(_j1490, _j1503, _j1504, _j1506 = null, _j1507 = null) {
if (_j567 >= expectedStrokeLength) {
return;
}
_j1490.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j920 = (_j1506 !== null && _j1507 !== null) ? _j1506 : (_j626 ? _j632 : pmouseX);
const _j921 = (_j1507 !== null && _j1507 !== null) ? _j1507 : (_j626 ? _j633 : pmouseY);
const _j1056 = _j1503 - _j920;
const _j1057 = _j1504 - _j921;
const _j1058 = sqrt(_j1056 * _j1056 + _j1057 * _j1057);
const speedMultiplier = map(constrain(_j1058, 3, 50), 0, 50, 0.1, 5.0);
let _j1059 = 0,
_j1060 = 0;
let _j1061 = 0,
_j1062 = 0;
let _j1063 = 0,
_j1064 = 0;
if (_j1058 > 0.1) {
_j1059 = _j1056 / _j1058;
_j1060 = _j1057 / _j1058;
_j1061 = -_j1060;
_j1062 = _j1059;
_j1063 = _j1060;
_j1064 = -_j1059;
} else {
_j1061 = 0;
_j1062 = 1;
_j1063 = 0;
_j1064 = -1;
}
const _j1065 = _j567 < expectedStrokeLength;
const _j1066 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1067 = strokeSeed + _j567 * 10000 + 1;
randomSeed(_j1067);
const _j1068 = _j1065 ? Math.floor(crandom.random(0, _j1066)) : 0;
for (let i = 0; i < _j1068; i++) {
const _j1069 = strokeSeed + _j567 * 1000 + _j1040;
randomSeed(_j1069);
const _j1070 = crandom.random(5, 15) * baseBrushSize;
const _j1071 = _j1503 + crandom.random(-2, 2) * baseBrushSize;
const _j1072 = _j1504 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1073, _j1074, _j1075;
if (brushColorMode === 0) {
_j1073 = _j1074 = _j1075 = _j512 * 0.3;
} else if (brushColorMode === 1) {
_j1073 = _j1074 = _j1075 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1073 = customBrushColor[0];
_j1074 = customBrushColor[1];
_j1075 = customBrushColor[2];
} else {
const color = _j211[brushColorMode];
if (color && color.rgb) {
_j1073 = color.rgb[0];
_j1074 = color.rgb[1];
_j1075 = color.rgb[2];
} else {
_j1073 = _j1074 = _j1075 = 26;
}
}
const _j1076 = {
id: _j1040++,
location: {
x: _j1071,
y: _j1072
},
prevLocation: {
x: _j1071,
y: _j1072
},
radius: _j1070,
r: _j1073,
g: _j1074,
b: _j1075,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j1039.push(_j1076);
}
const _j1077 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1078 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j1039.length - 1; i >= 0; i--) {
const _j1079 = _j1039[i];
if (_j1079.radius <= 0) {
continue;
}
const _j1080 = strokeSeed + _j567 * 1000 + _j1079.id * 100;
randomSeed(_j1080);
const _j1081 = crandom.random(_j1077, _j1078) * 3.0;
_j1079.radius -= _j1081;
const _j1082 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1083 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1079.xOff += _j1082;
_j1079.yOff += _j1083;
const _j1084 = 2.0 * speedMultiplier;
let _j1085 = 0,
_j1086 = 0;
const _j1087 = crandom.random(0, 1);
const _j1088 = (_j1079.sideDirection !== undefined) ? _j1079.sideDirection : (_j1087 > 0.5 ? 1 : -1);
if (_j1088 === 1) {
_j1085 = _j1063 * _j1084;
_j1086 = _j1064 * _j1084;
} else {
_j1085 = _j1061 * _j1084;
_j1086 = _j1062 * _j1084;
}
const nX = noise(_j1079.location.x) * _j1079.xOff;
const nY = noise(_j1079.location.y) * _j1079.yOff;
if (!_j1079.prevLocation) {
_j1079.prevLocation = {
x: _j1079.location.x,
y: _j1079.location.y
};
} else {
_j1079.prevLocation.x = _j1079.location.x;
_j1079.prevLocation.y = _j1079.location.y;
}
_j1079.location.x += 2.0 * (_j1085 * 0.2 + nX * 0.8);
_j1079.location.y += 2.0 * (_j1086 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1089 = noise(_j1079.location.x * 0.01, _j1079.location.y * 0.01) * 5;
_j1079.r = constrain(_j1079.r + _j1089, 0, 255);
_j1079.g = constrain(_j1079.g + _j1089, 0, 255);
_j1079.b = constrain(_j1079.b + _j1089, 0, 255);
} else if (brushColorMode == 0) {
const _j1089 = noise(_j1079.location.x * 0.01, _j1079.location.y * 0.01) * 2;
_j1079.r = constrain(_j1079.r + _j1089, 0, 200);
_j1079.g = constrain(_j1079.g + _j1089, 0, 200);
_j1079.b = constrain(_j1079.b + _j1089, 0, 200);
}
const _j1090 = crandom.random(0, 1) > 0.2;
const _j1091 = crandom.random(0, 1) > 0.99;
if (_j1079.radius > 0) {
stroke(_j1079.r, _j1079.g, _j1079.b, 200);
strokeWeight(max(1, _j1079.radius * 0.5));
if (_j1090) {
line(_j1079.prevLocation.x, _j1079.prevLocation.y, _j1079.location.x, _j1079.location.y);
}
if (_j1091) {
_j1079.radius = -1;
}
} else {
_j1079.radius = -1;
}
}
const _j1092 = _j1039.length;
let _j1093 = 0;
for (let i = 0; i < _j1039.length; i++) {
if (_j1039[i].radius > 0) {
if (_j1093 !== i) {
_j1039[_j1093] = _j1039[i];
}
_j1093++;
}
}
_j1039.length = _j1093;
const _j1094 = _j1039.length;
if (window.DEBUG_MODE && _j1092 > _j1094) {
const _j1095 = _j1092 - _j1094;
if (_j1095 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1095} dead particles removed (${_j1092} → ${_j1094})`);
}
}
pop();
_j1490.end();
}
function _j65(_j1490, _j1503, _j1504, _j795, _j518 = 0, _j1505 = 0) {
if (_j567 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j567, ">=", expectedStrokeLength, ")");
return;
}
_j1490.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j918 = _j60(_j512);
let _j954 = initialSize * 0.3;
const _j1096 = (_j548 && typeof _j560 !== 'undefined' && _j560 !== null) ? _j560 : baseBrushSize;
let _j434 = _j1503;
let _j435 = _j1504;
if (!_j538) {
_j538 = 1;
x = _j434;
y = _j435;
}
_j522 += (_j434 - x) * _j519;
_j523 += (_j435 - y) * _j519;
_j522 *= _j520;
_j523 *= _j520;
_j524 += sqrt(_j522 * _j522 + _j523 * _j523) - _j524;
_j524 *= 0.7;
_j525 = _j521 - _j524;
let _j1016 = _j529;
let _j1017 = _j525;
let _j1018 = _j434 - x;
let _j1019 = _j435 - y;
let _j1020 = sqrt(_j1018 * _j1018 + _j1019 * _j1019);
const _j1097 = _j1096;
const _j1098 = _j1097 < 0.25;
const _j1099 = _j1097 < 1.0;
let _j1021 = max(_j1098 ? 0.05 : (_j1099 ? _j1097 * 0.5 : 0.5), _j1017 * 0.5);
let _j1022 = 1.5 * min(_j954, max(_j1099 ? _j1097 * 4 : 4, _j1021));
let _j1023 = _j1022 * 0.6;
let _j1024 = 0.8;
let _j1025 = max(_j1023 * _j1024, 0.5);
let _j1026 = max(1, ceil(_j1020 / _j1025));
_j1026 = max(10, min(50, _j1026));
let _j1027 = _j1026 / _j517;
let _j955 = 0;
let _j956 = 0;
let _j1028 = min(1.0, _j1020 / 10);
let _j1029 = _j1028 > 0.3;
rectMode(CENTER);
let _j228 = crandom.random(30, 70);
const _j1100 = `flyBrush_${_j1096}_${strokeSeed}`;
let _j1101;
if (_j65.configCache[_j1100]) {
_j1101 = _j65.configCache[_j1100];
} else {
_j1101 = _j62(_j1096, strokeSeed);
_j65.configCache[_j1100] = _j1101;
}
const _j1102 = map(_j228, 30, 70, 0, _j1101.length);
const _j1103 = _j1101.length;
const _j1104 = 40;
const _j231 = [];
for (let i = 0; i < _j517; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1104; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1105 = _j567 * 0.08 + j * 0.15;
const _j1106 = _j567 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1105, _j1106));
const _j1107 = _j567 * 0.1 + j * 0.1;
const _j1108 = _j567 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1107, _j1108));
}
_j231.push({
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
for (let i = 0; i < _j517; ++i) {
const _j1030 = _j231[i];
let _j962 = x;
let _j963 = y;
x += _j522 / _j517;
y += _j523 / _j517;
let _j425 = (i + 1) / _j517;
let _j1031 = lerp(_j1016, _j1017, _j425);
_j529 = lerp(_j529, _j1031, 0.5);
_j535 += (_j529 - _j535) * 0.8;
_j535 = max(_j1099 ? _j1097 * 1.5 : 1.5, _j535);
let _j973;
_j973 = max(_j1098 ? _j1097 * 0.5 : (_j1099 ? _j1097 : 0.5), _j535);
let dx = x - _j962;
let dy = y - _j963;
let distance = sqrt(dx * dx + dy * dy);
let _j1033;
const _j317 = 0.1;
if (distance < _j317) {
_j1033 = _j65.lastMovementAngle;
} else {
_j1033 = atan2(dy, dx);
let _j270 = _j1033 + PI / 2;
_j65.lastAngle = _j270;
_j65.lastMovementAngle = _j1033;
}
let _j977 = _j1030.showMainBrush;
let _j978 = _j1030.mainAlpha;
let showMainBrush = 0.3;
let _j1032 = showMainBrush;
if (_j1027 > 1.0) {
_j1032 = showMainBrush / _j1027;
} else if (_j1027 < 1.0) {
_j1032 = showMainBrush * (2.0 - _j1027);
}
let _j1034 = -sin(_j1033);
let _j1035 = cos(_j1033);
const _j1109 = max(_j1098 ? _j1097 * 0.4 : (_j1099 ? _j1097 * 0.5 : 0.5), _j521 * 0.5);
const _j1110 = _j524 * 0.5;
const _j1111 = _j567 < (expectedStrokeLength - 5);
const _j1112 = _j567 >= (expectedStrokeLength - 5);
const _j1113 = _j1112 ? 0.7 : 1.0;
const _j1114 = _j567 >= expectedStrokeLength;
let _j1115, _j1116, _j1117, _j1118, _j1119;
if (_j1112) {
_j1115 = expectedStrokeLength - 5;
_j1116 = _j567 - _j1115;
_j1117 = min(1.0, _j1116 / 5.0);
_j1118 = cos(_j1033);
_j1119 = sin(_j1033);
}
for (let j = 0; j < _j1101.length; j++) {
let _j1036 = _j1101[j];
const _j1120 = _j567 >= _j1036.startOffset;
if (!_j1120 || _j1114) {
continue;
}
let _j1037 = _j1030.flyWhiteRandoms[j];
let _j1038 = _j1036.randThreshold * _j1113;
if (_j1037 > _j1038) {
const _j1121 = _j1030.flyWhiteOffsetNoises[j];
const _j1002 = map(_j1121, 0, 1, 1.0, 2.0);
const _j1122 = 1.0 + (_j1002 - 1.0) * _j1036.offsetVariationFactor;
const _j1123 = _j1099 ? max(0.3, _j1097 * 3) : _j1097;
const _j1124 = _j1036.perpOffset * _j1123 * _j1122;
let offsetX = _j1034 * _j1124;
let offsetY = _j1035 * _j1124;
let _j268 = x;
let _j269 = y;
let _j1125 = _j962;
let _j1126 = _j963;
if (_j1112) {
const _j1127 = _j1036.endDistanceOffset * _j1117 * _j1096;
const _j1128 = _j1118 * _j1127;
const _j1129 = _j1119 * _j1127;
_j268 = x + _j1128;
_j269 = y + _j1129;
if (_j1116 === 0) {
_j1125 = _j962;
_j1126 = _j963;
} else {
const _j1130 = min(1.0, (_j1116 - 1) / 5.0);
const _j1131 = _j1036.endDistanceOffset * _j1130 * _j1096;
const _j1132 = _j1118 * _j1131;
const _j1133 = _j1119 * _j1131;
_j1125 = x + _j1132;
_j1126 = y + _j1133;
}
}
const _j1134 = _j1110 * _j1036.brushSpeedMultiplier * _j1036.speedMultiplier;
const _j1135 = max(_j1098 ? _j1097 * 0.3 : (_j1099 ? _j1097 * 0.3 : 0.5), _j1109 - _j1134);
const _j1136 = _j1135 * 0.6;
const _j1137 = _j1030.flyWhiteWidthNoises[j];
const _j1138 = map(_j1137, 0, 1, 0.8, 1.2);
const _j1139 = 1.0 + (_j1138 - 1.0) * _j1036.widthVariationFactor;
let _j1140 = max(0, map(j, 0, _j1101.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1140) + random(-50, 50);
stroke(_j918, kk);
const _j1141 = _j1136 * _j1036.sizeMultiplier * _j1139;
const _j1142 = max(1, _j1141);
const _j1143 = `${_j1100}_${j}`;
let _j1144 = _j65.lastStrokeWeights[_j1143];
if (typeof _j1144 === 'undefined') {
_j1144 = _j1142;
}
const _j1145 = _j1144;
let _j1146;
if (_j1145 < 3.0) {
_j1146 = 0.15;
} else if (_j1145 >= 5.0) {
_j1146 = 0.3;
} else {
const t = (_j1145 - 3.0) / (5.0 - 3.0);
_j1146 = lerp(0.15, 0.3, t);
}
const _j1147 = lerp(_j1144, _j1142, _j1146);
_j65.lastStrokeWeights[_j1143] = _j1147;
strokeWeight(_j1147);
line(_j1125 + offsetX, _j1126 + offsetY, _j268 + offsetX, _j269 + offsetY);
}
}
}
pop();
_j1490.end();
}
let _j1148 = null;
function _j66() {
if (_j1148) return _j1148;
_j1148 = {
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
return _j1148;
}
function _j67(key) {
if (!_j1148) {
_j66();
}
return _j1148[key];
}
function _j68(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j67('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j677.x = e.clientX - rect.left - rect.width / 2;
_j677.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j69(e) {
if (!isDragging) return;
const overlay = _j67('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j677.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j677.y) / window.innerHeight) * 100;
_j678.x = x;
_j678.y = y;
_j71(overlay, _j678, _j74);
}
function _j70() {
if (!isDragging) return;
isDragging = false;
const overlay = _j67('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j71(overlay, _j678, _j74);
}
_j110();
}
function _j71(panel, pos, _j1508) {
if (!panel) return;
_j1508();
const _j1149 = panel.querySelector('.control-btn');
if (!_j1149) return;
const rect = _j1149.getBoundingClientRect();
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
_j1508();
}
}
function _j72(_j1509) {
if (!_j1509) return;
const _j904 = [
document.getElementById('message-overlay'),
_j67('controlPanel'),
_j67('effectControlPanel'),
_j67('flowEffectPanel'),
_j67('maskPanel')
];
_j904.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1509.classList.add('panel-front');
}
function _j73() {
const _j904 = [
document.getElementById('message-overlay'),
_j67('controlPanel'),
_j67('effectControlPanel'),
_j67('flowEffectPanel'),
_j67('maskPanel')
];
_j904.forEach(panel => {
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
overlay.style.left = _j678.x + '%';
overlay.style.top = _j678.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j75(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j679 = true;
const panel = _j67('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j680.x = e.clientX - rect.left - rect.width / 2;
_j680.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j76(e) {
if (!_j679) return;
const panel = _j67('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j680.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j680.y) / window.innerHeight) * 100;
_j681.x = x;
_j681.y = y;
_j71(panel, _j681, _j78);
}
function _j77(e) {
if (!_j679) return;
_j679 = false;
const panel = _j67('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j681, _j78);
_j110();
}
function _j78() {
const panel = _j67('controlPanel');
if (!panel) return;
panel.style.left = _j681.x + '%';
panel.style.top = _j681.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j79(e) {
if (e.target.closest('.control-btn')) return;
_j683 = true;
const panel = _j67('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j684.x = e.clientX - rect.left - rect.width / 2;
_j684.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j80(e) {
if (!_j683) return;
const panel = _j67('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j684.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j684.y) / window.innerHeight) * 100;
_j685.x = x;
_j685.y = y;
_j71(panel, _j685, _j82);
}
function _j81(e) {
if (!_j683) return;
_j683 = false;
const panel = _j67('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j685, _j82);
_j110();
}
function _j82() {
const panel = _j67('effectControlPanel');
if (!panel) return;
panel.style.left = _j685.x + '%';
panel.style.top = _j685.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j83(e) {
if (e.target.closest('.control-btn')) return;
_j687 = true;
const panel = _j67('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j688.x = e.clientX - rect.left - rect.width / 2;
_j688.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j84(e) {
if (!_j687) return;
const panel = _j67('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j688.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j688.y) / window.innerHeight) * 100;
_j689.x = x;
_j689.y = y;
_j71(panel, _j689, _j86);
}
function _j85(e) {
if (!_j687) return;
_j687 = false;
const panel = _j67('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j689, _j86);
_j110();
}
function _j86() {
const panel = _j67('flowEffectPanel');
if (!panel) return;
panel.style.left = _j689.x + '%';
panel.style.top = _j689.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j87(e) {
if (e.target.closest('.control-btn') || e.target.closest('.toggle-label')) return;
_j691 = true;
const panel = _j67('maskPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j692.x = e.clientX - rect.left - rect.width / 2;
_j692.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j88(e) {
if (!_j691) return;
const panel = _j67('maskPanel');
if (!panel) return;
const x = ((e.clientX - _j692.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j692.y) / window.innerHeight) * 100;
_j693.x = x;
_j693.y = y;
_j71(panel, _j693, _j90);
}
function _j89(e) {
if (!_j691) return;
_j691 = false;
const panel = _j67('maskPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j71(panel, _j693, _j90);
_j110();
}
function _j90() {
const panel = _j67('maskPanel');
if (!panel) return;
panel.style.left = _j693.x + '%';
panel.style.top = _j693.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j91() {
const _j1150 = document.getElementById('mask-rect-btn');
const _j1151 = document.getElementById('mask-poly-btn');
if (_j1150) _j1150.classList.toggle('active', _j552 === 'rect');
if (_j1151) _j1151.classList.toggle('active', _j552 === 'polygon');
}
function _j92() {
const _j1152 = document.getElementById('mask-status');
if (!_j1152) return;
if (_j550) {
_j1152.textContent = _j552 === 'rect' ? 'Draw rect mask' : 'Click to add points, press Polygon again to close';
} else if (_j551) {
_j1152.textContent = 'Mask active';
} else {
_j1152.textContent = 'No mask';
}
const c = document.querySelector('canvas');
if (c) {
c.classList.toggle('mask-cursor', _j550);
}
}
function _j93() {
return _j67('controlPanel');
}
let _j1153 = {};
let _j1154 = {
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
return Date.now() - _j1154.lastDragTime < 200;
}
function _j95(hint, _j1510) {
const button = document.getElementById(_j1510);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j96(e, hint) {
const rect = hint.getBoundingClientRect();
_j1154.hint = hint;
_j1154.startX = e.clientX;
_j1154.startY = e.clientY;
_j1154.offsetX = e.clientX - rect.left;
_j1154.offsetY = e.clientY - rect.top;
_j1154.isDragging = true;
_j1154.hasMoved = false;
}
function _j97(e) {
if (!_j1154.isDragging || !_j1154.hint) return;
const dx = Math.abs(e.clientX - _j1154.startX);
const dy = Math.abs(e.clientY - _j1154.startY);
if (dx > 5 || dy > 5) {
_j1154.hasMoved = true;
_j1154.hint.style.transition = 'none';
}
if (_j1154.hasMoved) {
const x = e.clientX - _j1154.offsetX;
const y = e.clientY - _j1154.offsetY;
_j1154.hint.style.left = x + 'px';
_j1154.hint.style.top = y + 'px';
}
}
function _j98(e) {
if (!_j1154.isDragging || !_j1154.hint) return;
const hint = _j1154.hint;
if (_j1154.hasMoved) {
_j1153[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1153));
hint.style.transition = '';
_j1154.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1154.hint = null;
_j1154.isDragging = false;
_j1154.hasMoved = false;
}
function _j99() {
const _j1155 = localStorage.getItem('hintPositions');
if (_j1155) {
_j1153 = JSON.parse(_j1155);
}
}
function _j100() {
const _j1156 = [{
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
_j1156.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j96(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1157 = e.touches[0];
_j96({
clientX: _j1157.clientX,
clientY: _j1157.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j97);
document.addEventListener('mouseup', _j98);
document.addEventListener('touchmove', (e) => {
if (_j1154.isDragging && e.touches.length === 1) {
_j97({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1154.hasMoved) e.preventDefault();
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
const _j904 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j674
}, {
panel: _j67('controlPanel'),
hint: _j67('brushHint'),
button: 'toggle-control-panel',
visible: _j682
}, {
panel: _j67('effectControlPanel'),
hint: _j67('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j686
}, {
panel: _j67('flowEffectPanel'),
hint: _j67('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j690
}, {
panel: _j67('maskPanel'),
hint: _j67('maskHint'),
button: 'toggle-mask-panel',
visible: _j694
}];
_j904.forEach(({
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
_j682 = !_j682;
const panel = _j93();
const brushHint = _j67('brushHint');
if (!panel) return;
if (_j682) {
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
if (!_j682) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j682.toString());
}
function _j103() {
_j686 = !_j686;
const panel = _j67('effectControlPanel');
const effectHint = _j67('effectHint');
if (!panel) return;
if (_j686) {
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
if (!_j686) {
panel.style.display = 'none';
}
}, 300);
}
_j108();
}
function _j104() {
_j690 = !_j690;
const panel = _j67('flowEffectPanel');
const flowHint = _j67('flowHint');
if (!panel) return;
if (_j690) {
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
if (!_j690) {
panel.style.display = 'none';
}
}, 300);
}
_j108();
}
function _j105() {
_j694 = !_j694;
const panel = _j67('maskPanel');
const maskHint = _j67('maskHint');
if (!panel) return;
if (_j694) {
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
if (!_j694) {
panel.style.display = 'none';
}
}, 300);
}
_j108();
}
function _j106() {
const _j1158 = _j67('screenTextToggle');
if (_j1158) {
screenText = _j1158.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j142();
}
_j111('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j107() {
const _j1159 = localStorage.getItem('controlPanelVisible');
if (_j1159 !== null) {
_j682 = _j1159 === 'true';
}
const _j1160 = localStorage.getItem('effectControlPanelVisible');
if (_j1160 !== null) {
_j686 = _j1160 === 'true';
}
const _j1161 = localStorage.getItem('flowEffectPanelVisible');
if (_j1161 !== null) {
_j690 = _j1161 === 'true';
}
}
function _j108() {
localStorage.setItem('controlPanelVisible', _j682);
localStorage.setItem('effectControlPanelVisible', _j686);
localStorage.setItem('flowEffectPanelVisible', _j690);
localStorage.setItem('maskPanelVisible', _j694);
}
function _j109() {
const _j1162 = localStorage.getItem('overlayPosition');
const _j1163 = localStorage.getItem('controlPanelPosition');
const _j1164 = localStorage.getItem('effectControlPanelPosition');
const _j1165 = localStorage.getItem('flowEffectPanelPosition');
if (_j1162) {
_j678 = JSON.parse(_j1162);
}
if (_j1163) {
_j681 = JSON.parse(_j1163);
}
if (_j1164) {
_j685 = JSON.parse(_j1164);
}
if (_j1165) {
_j689 = JSON.parse(_j1165);
}
const _j1166 = localStorage.getItem('maskPanelPosition');
if (_j1166) {
_j693 = JSON.parse(_j1166);
}
const _j1167 = localStorage.getItem('maskPanelVisible');
if (_j1167 !== null) {
_j694 = _j1167 === 'true';
}
}
function _j110() {
localStorage.setItem('overlayPosition', JSON.stringify(_j678));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j681));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j685));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j689));
localStorage.setItem('maskPanelPosition', JSON.stringify(_j693));
}
function _j111(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1168 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1168[type] || '⚙️';
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
const _j1168 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1168[type] || '⚙️';
let _j1169 = '';
if (Object.keys(data).length > 0) {
_j1169 = ' ' + JSON.stringify(data);
}
const _j1170 = `${icon} [${timestamp}] ${message}${_j1169}`;
_j696.push({
type: type,
text: _j1170,
timestamp: timestamp
});
if (_j696.length >= _j703) {
_j696 = [];
_j698 = 0;
}
}
function _j113(type, message, data, timestamp, icon) {
const _j1171 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j675.push(_j1171);
if (_j675.length > _j676) {
_j675.shift();
}
_j114();
}
function _j114() {
const _j1172 = _j67('messageContainer');
if (!_j1172) return;
_j1172.innerHTML = '';
_j675.forEach(_j1513 => {
const _j1173 = _j140(_j1513);
_j1172.appendChild(_j1173);
});
_j1172.scrollTop = _j1172.scrollHeight;
}
function _j115() {
const _j1174 = recordingData.events.length > 0;
const _j1175 = `${_j618}-${_j626}-${_j1174}`;
if (_j1175 === _j1181) {
return;
}
_j1181 = _j1175;
const recordBtn = _j67('recordBtn');
const stopBtn = _j67('stopBtn');
const playBtn = _j67('playBtn');
const loadBtn = _j67('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j618) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j626) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1174) {
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
let _j1176 = false;
let _j1177 = -1;
let _j1178 = 0;
const _j1179 = 100;
let _j1180 = -1;
let _j1181 = null;
function _j116(_j1348) {
const _j1182 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j111('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1182.onload = (e) => {
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
_j1176 = true;
_j111('system', '📷 Reference image loaded', {
Status: 'Tracing mode ON',
FileName: _j1348.name,
FileSize: (_j1348.size / 1024).toFixed(2) + ' KB',
Opacity: '50%',
Size: width + 'x' + height + 'px'
});
};
referenceImage.onerror = () => {
_j111('system', '❌ Failed to load image', {
Status: 'Error',
FileName: _j1348.name
});
};
};
_j1182.onerror = () => {
_j111('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1348.name
});
};
_j1182.readAsDataURL(_j1348);
}
function _j117() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1183 = referenceImage.src;
const _j1184 = _j1183 && _j1183 !== '' &&
(_j1183.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1184) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1176 = true;
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
function _j118() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1176 = false;
_j111('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j119() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j173('💾 Canvas Saved as PNG');
}
function _j120(_j1223) {
_j530 = _j1223;
switch (_j1223) {
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
if (typeof _j560 !== 'undefined') _j560 = baseBrushSize;
_j121();
_j133();
_j111('ui', 'Brush size changed', {
Mode: _j1223.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j121() {
const _j1185 = document.querySelectorAll('.brush-size-btn');
if (_j1185.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1185.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j530) {
btn.classList.add('active');
}
});
}
function _j122(mode) {
brushMode = parseInt(mode);
_j124();
_j133();
_j111('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j123(mode)
});
}
function _j123(mode) {
const _j1186 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1186[mode] || 'Unknown mode';
}
function _j124() {
const _j1185 = document.querySelectorAll('.brush-mode-btn');
if (_j1185.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1185.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j125(effect) {
const _j1187 = parseInt(effect);
const _j1188 = useSharpen;
_j111('ui', '🎨 Ink effect switching', {
From: _j1188,
To: _j1187,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1187;
if (typeof _j531 !== 'undefined') {
_j531 = _j1188;
}
_j128();
_j133();
const _j1189 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j111('ui', '✨ Ink effect changed', {
Effect: _j1189[_j1187] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j126(mode) {
const _j1190 = parseInt(mode);
if (_j1190 === 3) {
window.spectral = true;
} else {
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1190;
}
window.spectral = false;
}
_j127();
const _j1191 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken',
3: 'Spectral'
};
_j111('ui', '🎨 BlendMode changed', {
Mode: _j1191[_j1190] || 'Unknown'
});
}
function _j127() {
const _j1185 = document.querySelectorAll('.blendmode-btn');
if (_j1185.length === 0) {
return;
}
const _j1192 = typeof useSpectralMix !== 'undefined' && useSpectralMix > 0;
_j1185.forEach(btn => {
const _j1190 = parseInt(btn.dataset.mode);
if (_j1192 && _j1190 === 3) {
btn.classList.add('active');
} else if (!_j1192 && _j1190 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j128() {
const _j1185 = document.querySelectorAll('.ink-effect-btn');
if (_j1185.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1185.forEach(btn => {
btn.classList.remove('active');
const _j1187 = parseInt(btn.dataset.effect);
const _j1193 = _j1187;
if (_j1193 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j129(color) {
whiteBrushMode = (color === 'white');
const _j1194 = {
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
brushColorMode = _j1194[color] !== undefined ? _j1194[color] : 0;
_j130();
_j133();
const _j1195 = {
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
const _j1196 = _j8(color);
if (_j1196) {
const _j1197 = document.getElementById('custom-brush-color');
const _j1198 = document.getElementById('custom-brush-color-text');
if (_j1197) _j1197.value = _j1196.hex;
if (_j1198) _j1198.value = _j1196.displayName + ' ' + _j1196.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1196.rgb[0];
customBrushColor[1] = _j1196.rgb[1];
customBrushColor[2] = _j1196.rgb[2];
}
}
}
_j111('ui', '🎨 Brush color changed', {
Color: _j1195[color] || color,
Mode: `${_j1195[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j130() {
const _j1199 = document.querySelectorAll('.brush-color-btn');
const _j1200 = document.querySelectorAll('.color-swatch');
if (_j1199.length === 0 && _j1200.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1201 = {
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
const _j1202 = (brushColorMode === 33);
const _j1203 = _j1202 ? null : (_j1201[brushColorMode] || 'black');
_j1199.forEach(btn => {
btn.classList.remove('active');
if (!_j1202 && btn.dataset.color === _j1203) {
btn.classList.add('active');
}
});
_j1200.forEach(btn => {
btn.classList.remove('active');
if (!_j1202 && btn.dataset.color === _j1203) {
btn.classList.add('active');
}
});
}
function _j131(_j1229) {
_j573 = parseInt(_j1229);
_j132();
_j133();
const _j1204 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j111('ui', '🔄 Path rotation changed', {
Mode: _j1229,
Range: _j1204[_j1229] || 'Unknown'
});
}
function _j132() {
const _j1185 = document.querySelectorAll('.path-rotation-btn');
if (_j1185.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1185.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j573) {
btn.classList.add('active');
}
});
}
function _j133() {
const _j1205 = document.getElementById('current-brush-mode');
if (_j1205) {
_j1205.textContent = brushMode;
}
const _j1206 = document.getElementById('current-brush-size');
if (_j1206) {
const _j1207 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1206.textContent = _j1207[_j530] || 'M';
}
const _j1208 = document.getElementById('current-ink-effect');
if (_j1208) {
const _j1209 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1208.textContent = _j1209[useSharpen] || 'MIX';
}
const _j1210 = document.getElementById('current-brush-color');
if (_j1210) {
const _j1211 = {
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
_j1210.textContent = _j1211[brushColorMode] || 'Black';
}
}
function _j134() {
brushMode = 1;
_j530 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j573 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j124();
_j121();
_j128();
_j130();
_j132();
_j127();
_j133();
_j111('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j135(_j1511, _j1512) {
if (!_j1511) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1212 = 300;
_j1511.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1213 = window._elementLastTriggerTime.get(_j1511) || 0;
if (now - _j1213 < _j1212) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1511, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1511);
}, _j1212);
window._elementLastTriggerTime.set(_j1511, now);
e.stopPropagation();
e.preventDefault();
_j1512(e);
}, {
passive: false
});
_j1511.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1511)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1213 = window._elementLastTriggerTime.get(_j1511) || 0;
if (now - _j1213 < _j1212) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1511, now);
e.stopPropagation();
e.preventDefault();
_j1512(e);
});
_j1511.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j136() {
const _j1214 = document.getElementById('canvas-background-color');
const _j1215 = document.getElementById('canvas-background-color-text');
if (!_j1214 || !_j1215) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1216 = `#${r}${g}${b}`.toUpperCase();
_j1214.value = _j1216;
_j1215.value = _j1216;
}
}
function _j137() {
const _j1217 = document.getElementById('canvas-width');
const _j1218 = document.getElementById('canvas-height');
if (!_j1217 || !_j1218) {
return;
}
if (typeof _j500 !== 'undefined' && typeof _j501 !== 'undefined') {
_j1217.value = _j500;
_j1218.value = _j501;
}
}
function _j138() {
const _j1219 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1220 = _j1219 === 'collector';
if (_j1220) {
const controlPanel = _j67('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1221 = document.querySelectorAll('.brush-mode-btn');
_j1221.forEach(btn => {
_j135(btn, () => {
const mode = btn.dataset.mode;
_j122(mode);
});
});
const _j1222 = document.querySelectorAll('.brush-size-btn');
_j1222.forEach(btn => {
_j135(btn, () => {
const _j1223 = btn.dataset.size;
_j120(_j1223);
});
});
const _j1224 = document.querySelectorAll('.ink-effect-btn');
_j1224.forEach(btn => {
_j135(btn, () => {
const effect = btn.dataset.effect;
_j125(effect);
});
});
const _j1225 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1225.forEach(btn => {
_j135(btn, () => {
const color = btn.dataset.color;
if (color) {
_j129(color);
_j154();
}
});
});
const _j1226 = document.getElementById('custom-brush-color');
const _j1227 = document.getElementById('custom-brush-color-text');
if (_j1226 && _j1227) {
_j1226.addEventListener('input', (e) => {
_j1227.value = e.target.value.toUpperCase();
_j160();
});
_j1226.addEventListener('change', (e) => {
_j1227.value = e.target.value.toUpperCase();
_j160();
});
_j1227.addEventListener('input', (e) => {
const _j1216 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1216)) {
_j1226.value = _j1216.toUpperCase();
}
});
_j1227.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j160();
}
});
}
const _j1228 = document.querySelectorAll('.path-rotation-btn');
_j1228.forEach(btn => {
_j135(btn, () => {
const _j1229 = btn.dataset.rotation;
_j131(_j1229);
});
});
const _j1230 = document.querySelectorAll('.blendmode-btn');
_j1230.forEach(btn => {
_j135(btn, () => {
const mode = btn.dataset.mode;
_j126(mode);
});
});
const _j1231 = document.getElementById('clear-canvas');
if (_j1231) {
_j135(_j1231, () => {
_j166();
if (typeof _j229 !== 'undefined') {
_j229 = [];
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
const _j1232 = document.getElementById('test-mode-btn');
if (_j1232) {
_j135(_j1232, () => {
if (typeof _j544 !== 'undefined' && _j544) return;
if (window.testMode) {
if (typeof exitTestMode === 'function') exitTestMode();
_j1232.classList.remove('active');
_j1232.textContent = 'testMode';
_j111('ui', '🧪 Test mode OFF', { Status: 'Canvas restored' });
} else {
if (typeof enterTestMode === 'function') enterTestMode();
_j1232.classList.add('active');
_j1232.textContent = 'testMode (exit)';
_j111('ui', '🧪 Test mode ON', { Status: 'Strokes will not be recorded' });
}
});
}
const _j1214 = document.getElementById('canvas-background-color');
const _j1215 = document.getElementById('canvas-background-color-text');
const _j1217 = document.getElementById('canvas-width');
const _j1218 = document.getElementById('canvas-height');
if (_j1214 && _j1215) {
_j1214.addEventListener('input', (e) => {
_j1215.value = e.target.value.toUpperCase();
});
_j1214.addEventListener('change', (e) => {
_j1215.value = e.target.value.toUpperCase();
_j161();
});
_j1215.addEventListener('input', (e) => {
const _j1216 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1216)) {
_j1214.value = _j1216.toUpperCase();
}
});
_j1215.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j161();
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
if (_j1217 && _j1218) {
_j1217.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j161();
}
});
_j1218.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j161();
}
});
if (typeof _j137 === 'function') {
_j137();
} else {
setTimeout(() => {
if (typeof _j137 === 'function') {
_j137();
}
}, 100);
}
}
const _j1233 = document.getElementById('panel-scale-slider');
if (_j1233) {
_j1233.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1233.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j74();
_j78();
_j82();
_j86();
});
}
const _j1234 = document.getElementById('toggle-control-panel');
if (_j1234) {
_j135(_j1234, _j102);
}
const controlPanel = _j67('controlPanel');
const _j1149 = controlPanel?.querySelector('.control-panel-header');
if (_j1149) {
_j1149.addEventListener('mousedown', _j75);
_j1149.addEventListener('touchstart', (e) => {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j75(_j1235);
});
}
const effectControlPanel = _j67('effectControlPanel');
const _j1236 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1236) {
_j1236.addEventListener('mousedown', _j79);
_j1236.addEventListener('touchstart', (e) => {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j79(_j1235);
});
}
const _j1237 = document.getElementById('toggle-effect-control-panel');
if (_j1237) {
_j135(_j1237, _j103);
}
const flowEffectPanel = _j67('flowEffectPanel');
const _j1238 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1238) {
_j1238.addEventListener('mousedown', _j83);
_j1238.addEventListener('touchstart', (e) => {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j83(_j1235);
});
}
const _j1239 = document.getElementById('toggle-flow-effect-panel');
if (_j1239) {
_j135(_j1239, _j104);
}
const maskPanel = _j67('maskPanel');
const _j1240 = maskPanel?.querySelector('.mask-panel-header');
if (_j1240) {
_j1240.addEventListener('mousedown', _j87);
_j1240.addEventListener('touchstart', (e) => {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j87(_j1235);
});
}
const _j1241 = document.getElementById('toggle-mask-panel');
if (_j1241) {
_j135(_j1241, function() {
_j105();
});
}
const _j1242 = document.getElementById('mask-mode-toggle');
if (_j1242) {
_j1242.addEventListener('change', function() {
if (!this.checked && _j552 === 'polygon' && _j554.length >= 3) {
drawMaskPolygon(_j554);
_j555 = { action: "polygon", points: _j554.map(p => ({ x: p.x, y: p.y })) };
}
const _j1243 = !this.checked;
_j550 = this.checked;
_j91();
_j92();
if (_j1243 && typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
});
}
const _j1244 = document.getElementById('mask-rect-btn');
if (_j1244) {
_j135(_j1244, function() {
_j552 = 'rect';
_j550 = true;
if (_j1242) _j1242.checked = true;
_j91();
_j92();
});
}
const _j1245 = document.getElementById('mask-poly-btn');
if (_j1245) {
_j135(_j1245, function() {
if (_j550 && _j552 === 'polygon') {
if (_j554.length >= 3) {
drawMaskPolygon(_j554);
_j555 = { action: "polygon", points: _j554.map(p => ({ x: p.x, y: p.y })) };
}
_j550 = false;
if (_j1242) _j1242.checked = false;
if (typeof window.resetBrushPositionToMouse === 'function') {
window.resetBrushPositionToMouse();
}
} else {
_j552 = 'polygon';
_j550 = true;
_j554 = [];
if (_j1242) _j1242.checked = true;
}
_j91();
_j92();
});
}
const _j1246 = document.getElementById('mask-clear-btn');
if (_j1246) {
_j135(_j1246, function() {
clearMask();
_j555 = null;
_j92();
});
}
if (maskPanel && !_j694) {
maskPanel.style.display = 'none';
}
_j90();
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j106);
}
_j124();
_j121();
_j128();
_j130();
_j132();
_j127();
_j133();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j139() {
const now = millis();
const _j1247 = (now - _j1178) >= _j1179;
const recordingStatus = _j67('recordingStatus');
if (recordingStatus) {
if (_j618) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j67('playbackStatus');
const countdownStatus = _j67('countdownStatus');
if (_j626) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1247) {
const _j1248 = loopWaitDuration - (millis() - _j635);
const _j1249 = Math.ceil(_j1248 / 1000);
const _j825 = _j1248 / loopWaitDuration;
if (window.DEBUG_MODE && _j1249 !== _j1177) {
console.log(`Countdown: ${_j1249}s remaining (${Math.floor(_j825 * 100)}%)`);
_j1177 = _j1249;
}
const countdownText = _j67('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1249}s`;
}
const countdownCircle = _j67('countdownCircle');
if (countdownCircle) {
const _j1250 = 62.83;
const _j1251 = _j1250 * (1 - _j825);
countdownCircle.style.strokeDashoffset = _j1251;
}
}
} else {
_j1177 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1247) {
const _j425 = recordingData.events.length > 0 ?
_j628 / recordingData.events.length : 0;
const _j1252 = Math.round(_j425 * 100);
if (_j1252 !== _j1180) {
const progressFill = _j67('progressFill');
const progressText = _j67('progressText');
if (progressFill) progressFill.style.width = `${_j1252}%`;
if (progressText) progressText.textContent = `${_j1252}%`;
_j1180 = _j1252;
}
}
}
} else {
_j1177 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1247) {
_j1178 = now;
}
if (typeof _j115 === 'function') {
_j115();
}
}
function _j140(_j1513) {
const _j1253 = document.createElement('div');
_j1253.className = 'message-item new-message';
const _j1254 = document.createElement('span');
_j1254.className = 'message-icon';
_j1254.textContent = _j1513.icon;
const _j1255 = document.createElement('div');
_j1255.className = 'message-content';
const _j1256 = document.createElement('div');
_j1256.className = 'message-header';
const _j1257 = document.createElement('span');
_j1257.className = 'message-timestamp';
_j1257.textContent = _j1513.timestamp;
const _j1258 = document.createElement('span');
_j1258.className = `message-type ${_j1513.type}`;
_j1258.textContent = _j1513.type.toUpperCase();
_j1256.appendChild(_j1257);
_j1256.appendChild(_j1258);
const _j1259 = document.createElement('p');
_j1259.className = 'message-text';
_j1259.textContent = _j1513.message;
_j1255.appendChild(_j1256);
_j1255.appendChild(_j1259);
if (Object.keys(_j1513.data).length > 0) {
const _j1260 = document.createElement('div');
_j1260.className = 'message-data';
_j1260.textContent = JSON.stringify(_j1513.data, null, 2);
_j1255.appendChild(_j1260);
}
_j1253.appendChild(_j1254);
_j1253.appendChild(_j1255);
setTimeout(() => {
_j1253.classList.remove('new-message');
}, 300);
return _j1253;
}
function _j141() {
_j674 = !_j674;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j674) {
overlay.style.display = 'block';
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j74();
} else {
_j95(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
setTimeout(() => {
if (!_j674) {
overlay.style.display = 'none';
}
}, 300);
}
}
localStorage.setItem('overlayVisible', _j674.toString());
}
function _j142() {
_j675 = [];
_j114();
}
function _j143() {
const _j1261 = document.getElementById('record-status-text');
if (_j1261) {
if (_j625 == 1) {
_j1261.textContent = 'ON';
_j1261.classList.add('active');
} else {
_j1261.textContent = 'OFF';
_j1261.classList.remove('active');
}
}
}
function _j144() {
const _j1262 = {};
const _j1263 = window.location.search;
if (!_j1263 || _j1263.length <= 1) {
return _j1262;
}
const _j1264 = _j1263.substring(1);
const _j1011 = _j1264.split('_');
const _j1265 = {
'wd': true,
'gr': true
};
for (const _j1266 of _j1011) {
if (!_j1266) continue;
const _j1267 = _j1266.indexOf(':');
if (_j1267 === -1) continue;
const key = _j1266.substring(0, _j1267);
const value = _j1266.substring(_j1267 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1268 = parseInt(value);
if (!isNaN(_j1268) && _j1268 > 0) {
_j1262[key] = _j1268;
}
continue;
}
if (_j1265[key]) {
const _j1269 = parseFloat(value);
if (!isNaN(_j1269) && _j1269 > 0) {
_j1262[key] = true;
_j1262[key + '_val'] = _j1269;
} else {
_j1262[key] = false;
}
} else {
_j1262[key] = value === '1';
}
}
}
return _j1262;
}
function _j145(_j1514) {
const _j1270 = {
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
for (const [_j1266, toggleId] of Object.entries(_j1270)) {
if (_j1514.hasOwnProperty(_j1266)) {
if (_j1266 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1271 = _j1514[_j1266];
const toggle = document.getElementById(toggleId);
if (toggle) {
toggle.checked = _j1271;
toggle.dispatchEvent(new Event('change'));
if (_j1266 === 'rs') {
const _j1272 = document.getElementById('rs-sliders-section');
if (_j1272) {
_j1272.style.display = _j1271 ? 'flex' : 'none';
}
} else if (_j1266 === 'distort') {
const _j1273 = document.getElementById('distort-sliders-section');
if (_j1273) {
_j1273.style.display = _j1271 ? 'flex' : 'none';
}
} else if (_j1266 === 'cl') {
const _j1274 = document.getElementById('cellular-sliders-section');
if (_j1274) {
_j1274.style.display = _j1271 ? 'flex' : 'none';
}
} else if (_j1266 === 'wd') {
const _j1275 = document.getElementById('white-dot-sliders-section');
if (_j1275) {
_j1275.style.display = _j1271 ? 'flex' : 'none';
}
if (_j1271 && _j1514['wd_val'] !== undefined) {
const _j1276 = document.getElementById('white-dot-density');
const _j1277 = document.getElementById('white-dot-density-value');
if (_j1276) _j1276.value = _j1514['wd_val'];
if (_j1277) _j1277.textContent = _j1514['wd_val'].toFixed(2);
}
} else if (_j1266 === 'gr') {
const _j1278 = document.getElementById('grain-sliders-section');
if (_j1278) {
_j1278.style.display = _j1271 ? 'flex' : 'none';
}
if (_j1271 && _j1514['gr_val'] !== undefined) {
const _j1279 = document.getElementById('grain-amount');
const _j1280 = document.getElementById('grain-amount-value');
if (_j1279) _j1279.value = _j1514['gr_val'];
if (_j1280) _j1280.textContent = _j1514['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1266}`);
}
}
}
}
function _j146() {
_j66();
const _j1281 = _j144();
const _j1282 = {
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
if (_j1281['w']) window._urlCanvasWidth = _j1281['w'];
if (_j1281['h']) window._urlCanvasHeight = _j1281['h'];
if (Object.keys(_j1281).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1266, _j1271] of Object.entries(_j1281)) {
const globalVarName = _j1282[_j1266];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1266 === 'loop') {
window[globalVarName] = _j1271 ? 1 : 0;
} else {
window[globalVarName] = _j1271;
}
}
}
const _j1283 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1284 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1266, globalVarName] of Object.entries(_j1283)) {
const valKey = _j1266 + '_val';
if (_j1281[valKey] !== undefined) {
window[globalVarName] = _j1281[valKey];
window[_j1284[_j1266]] = _j1281[valKey];
}
}
window._initialConsoleFromURL = _j1281.hasOwnProperty('console') ? _j1281.console : false;
}
const _j1219 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1220 = _j1219 === 'collector';
const _j1234 = document.getElementById('toggle-overlay');
const _j1285 = document.getElementById('toggle-hint-btn');
const _j1286 = document.getElementById('clear-bite-points');
const _j1287 = document.getElementById('scan-global');
const _j1288 = document.getElementById('scan-current');
const _j1289 = document.getElementById('scan-random');
const _j1290 = document.getElementById('scan-current-random');
const _j1291 = document.getElementById('brush-hint-btn');
const _j1292 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1292.length > 0) {
let _j1293 = 2;
if (typeof _j502 !== 'undefined') {
_j1293 = _j502;
}
const _j1294 = document.querySelector(`input[name="pixel-density"][value="${_j1293}"]`);
if (_j1294) {
_j1294.checked = true;
}
_j1292.forEach(_j1520 => {
_j1520.addEventListener('change', (e) => {
if (e.target.checked) {
const _j718 = parseInt(e.target.value);
if (typeof _j502 !== 'undefined') {
_j502 = _j718;
try {
sessionStorage.setItem('pendingPixelDensity', _j718.toString());
if (typeof _j618 !== 'undefined' && _j618 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j111('system', '🎨 Pixel density changed - reloading page', {
Value: _j718,
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
if (_j1220) {
if (_j1291) _j1291.style.display = 'none';
}
const _j1295 = document.getElementById('record-toggle');
const _j1261 = document.getElementById('record-status-text');
const _j1296 = document.getElementById('realtime-drawing-toggle');
const _j1297 = document.getElementById('realtime-drawing-status-text');
const _j1298 = document.getElementById('grid-overlay-toggle');
const _j1299 = document.getElementById('paper-texture-toggle');
const _j1300 = document.getElementById('camera-moving-toggle');
const _j1301 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1149 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j674) {
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
if (_j682) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1234) {
_j135(_j1234, _j141);
}
if (_j1285) {
_j135(_j1285, () => {
if (!_j94()) _j141();
});
}
if (_j1291) {
_j135(_j1291, () => {
if (!_j94()) _j102();
});
}
const _j1302 = document.getElementById('effect-hint-btn');
if (_j1302) {
_j135(_j1302, () => {
if (!_j94()) _j103();
});
}
const _j1303 = document.getElementById('flow-hint-btn');
if (_j1303) {
_j135(_j1303, () => {
if (!_j94()) _j104();
});
}
const _j1304 = document.getElementById('mask-hint-btn');
if (_j1304) {
_j135(_j1304, () => {
if (!_j94()) _j105();
});
}
const _j1305 = document.getElementById('agent-toggle-btn');
if (_j1305) {
_j135(_j1305, function() {
_j564 = !_j564;
if (_j564) {
_j562 = true;
_j565 = [];
_j1305.classList.add('agent-active');
_j1305.textContent = 'Agent ●';
console.log('[Agent] ON — recording paths with timestamps');
} else {
_j562 = false;
_j1305.classList.remove('agent-active');
_j1305.textContent = 'Agent';
console.log('[Agent] OFF — ' + _j565.length + ' points recorded');
}
});
}
if (_j1287) {
_j135(_j1287, () => {
if (typeof _j18 === 'function') {
const shapeType = _j155();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j803 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j803 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j803);
noiseSeed(_j803);
}
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j181('ec', {
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
function _j147(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j155();
let scanBounds = null;
let _j312 = null;
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
if (strokeIndex !== null) {
_j312 = Math.max(0, Math.min(strokeIndex, allBrushStrokes.length - 1));
} else {
const _j1306 = document.getElementById('stroke-select-slider');
if (_j1306) {
_j312 = parseInt(_j1306.value) || 0;
_j312 = Math.max(0, Math.min(_j312, allBrushStrokes.length - 1));
}
}
if (_j312 !== null) {
const selectedStroke = allBrushStrokes[_j312];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j111('system', `🎯 EACH: 使用笔画 #${_j312} 的网格区域`, {
Index: _j312,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: allBrushStrokes.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j111('system', `🎯 EACH: 使用笔画 #${_j312} 的边界框（无网格数据）`, {
Index: _j312,
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
const _j803 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j803 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j803);
noiseSeed(_j803);
}
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j181('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j312,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1288) {
_j135(_j1288, () => {
_j147();
});
}
if (_j1290) {
_j135(_j1290, () => {
if (typeof allBrushStrokes !== 'undefined' && allBrushStrokes.length > 0) {
const _j1307 = Math.floor(Math.random() * allBrushStrokes.length);
const _j1306 = document.getElementById('stroke-select-slider');
const _j1308 = document.getElementById('stroke-index-display');
const _j1309 = document.getElementById('stroke-select-value');
if (_j1306) {
_j1306.value = _j1307;
_j1306.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1308) {
_j1308.textContent = _j1307;
}
if (_j1309) {
_j1309.textContent = _j1307;
}
_j111('system', `🎲 EACHR: 随机选择笔画 #${_j1307}`, {
RandomIndex: _j1307,
TotalStrokes: allBrushStrokes.length
});
_j147(_j1307);
} else {
_j111('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1289) {
_j135(_j1289, () => {
if (typeof _j19 === 'function') {
const shapeType = _j155();
_j19(10, shapeType);
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
_j181('ec', {
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
if (_j1286) {
_j135(_j1286, () => {
if (typeof _j229 !== 'undefined' && _j229.length > 0) {
let pointCount = typeof _j229 !== 'undefined' ? _j229.length : 0;
if (typeof _j229 !== 'undefined') {
_j229 = [];
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
if (_j1295) {
_j1295.checked = (_j625 == 1);
_j143();
_j1295.addEventListener('change', (e) => {
_j625 = e.target.checked ? 1 : 0;
_j143();
_j111('system', `Record mode ${_j625 ? 'enabled' : 'disabled'}`, {
Status: _j625 ? 'ON' : 'OFF'
});
});
}
if (_j1296) {
_j1296.disabled = true;
if (_j1297) {
_j1297.textContent = 'DISABLED';
}
_j1296.addEventListener('change', (e) => {
e.target.checked = false;
_j111('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1298) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1298.checked = !!showGridOverlay;
}
} catch (e) {}
_j1298.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1524) {}
_j111('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1299) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1299.checked = !!showPaperTexture;
} else {
_j1299.checked = true;
}
} catch (e) {
_j1299.checked = true;
}
_j1299.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1524) {}
_j111('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1310 = document.getElementById('fit-canvas-toggle');
if (_j1310) {
_j1310.addEventListener('change', (e) => {
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
if (_j1300) {
try {
if (typeof doMoving !== 'undefined') {
_j1300.checked = !!doMoving;
} else {
_j1300.checked = false;
}
} catch (e) {
_j1300.checked = false;
}
_j1300.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1524) {}
_j111('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1301) {
try {
if (typeof loopToggle !== 'undefined') {
_j1301.checked = (loopToggle === 1);
} else {
_j1301.checked = false;
}
} catch (e) {
_j1301.checked = false;
}
_j1301.addEventListener('change', (e) => {
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
} catch (_j1524) {
console.error('Error setting loopToggle:', _j1524);
}
});
}
const _j1311 = document.getElementById('playback-offset-x');
const _j1312 = document.getElementById('playback-offset-y');
if (_j1311) {
if (typeof _j638 !== 'undefined') {
_j1311.value = _j638;
}
_j1311.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j638 !== 'undefined') {
_j638 = value;
_j111('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1312) {
if (typeof _j639 !== 'undefined') {
_j1312.value = _j639;
}
_j1312.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j639 !== 'undefined') {
_j639 = value;
_j111('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1313 = document.getElementById('distort-shader-toggle');
const _j1273 = document.getElementById('distort-sliders-section');
if (_j1313) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1313.checked = !!distortShaderEnabled;
if (_j1273) {
_j1273.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1313.checked = false;
if (_j1273) {
_j1273.style.display = 'none';
}
}
} catch (e) {
_j1313.checked = false;
if (_j1273) {
_j1273.style.display = 'none';
}
}
_j1313.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1273) {
_j1273.style.display = enabled ? 'flex' : 'none';
}
_j111('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1524) {
console.error('Error setting distortShaderEnabled:', _j1524);
}
});
}
const _j1314 = document.getElementById('distort-displacement-b');
const _j1315 = document.getElementById('distort-displacement-b-value');
if (_j1314 && _j1315) {
const _j1316 = parseFloat(_j1314.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1316;
}
_j1315.textContent = Math.round(_j1316);
_j1314.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1315.textContent = Math.round(value);
});
}
const _j1317 = document.getElementById('distort-displacement-c');
const _j1318 = document.getElementById('distort-displacement-c-value');
if (_j1317 && _j1318) {
const _j1316 = parseFloat(_j1317.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1316;
}
_j1318.textContent = Math.round(_j1316);
_j1317.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1318.textContent = Math.round(value);
});
}
const _j1319 = document.getElementById('distort-fbm-preview-toggle');
if (_j1319) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1319.checked = (distortShowFbmMask > 0.5);
} else {
_j1319.checked = false;
}
} catch (e) {
_j1319.checked = false;
}
_j1319.addEventListener('change', (e) => {
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
} catch (_j1524) {
console.error('Error setting distortShowFbmMask:', _j1524);
}
});
}
const _j1320 = document.getElementById('rs-toggle');
const _j1272 = document.getElementById('rs-sliders-section');
if (_j1320) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1320.checked = !!rsEnabled;
if (_j1272) {
_j1272.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1320.checked = false;
if (_j1272) {
_j1272.style.display = 'none';
}
}
} catch (e) {
_j1320.checked = false;
if (_j1272) {
_j1272.style.display = 'none';
}
}
_j1320.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1272) {
_j1272.style.display = enabled ? 'flex' : 'none';
}
_j111('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1524) {
console.error('Error setting rsEnabled:', _j1524);
}
});
}
const _j1321 = document.getElementById('rs-frequency');
const _j1322 = document.getElementById('rs-frequency-value');
if (_j1321 && _j1322) {
const _j1316 = parseFloat(_j1321.value);
if (typeof _j578 !== 'undefined') {
_j578 = _j1316;
}
_j1322.textContent = Math.round(_j1316);
_j1321.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j578 !== 'undefined') {
_j578 = value;
}
_j1322.textContent = Math.round(value);
});
}
const _j1323 = document.getElementById('rs-wave-speed');
const _j1324 = document.getElementById('rs-wave-speed-value');
if (_j1323 && _j1324) {
const _j1316 = parseFloat(_j1323.value);
if (typeof _j579 !== 'undefined') {
_j579 = _j1316;
}
_j1324.textContent = _j1316.toFixed(1);
_j1323.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j579 !== 'undefined') {
_j579 = value;
}
_j1324.textContent = value.toFixed(1);
});
}
const _j1325 = document.getElementById('rs-strength');
const _j1326 = document.getElementById('rs-strength-value');
if (_j1325 && _j1326) {
const _j1316 = parseFloat(_j1325.value);
if (typeof _j580 !== 'undefined') {
_j580 = _j1316;
}
_j1326.textContent = _j1316.toFixed(1);
_j1325.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j580 !== 'undefined') {
_j580 = value;
}
_j1326.textContent = value.toFixed(1);
});
}
const _j1327 = document.getElementById('rs-gradient-mix');
const _j1328 = document.getElementById('rs-gradient-mix-value');
if (_j1327 && _j1328) {
const _j1316 = parseFloat(_j1327.value);
if (typeof _j581 !== 'undefined') {
_j581 = _j1316;
}
_j1328.textContent = _j1316.toFixed(1);
_j1327.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j581 !== 'undefined') {
_j581 = value;
}
_j1328.textContent = value.toFixed(1);
});
}
const _j1329 = document.getElementById('rs-scale');
const _j1330 = document.getElementById('rs-scale-value');
if (_j1329 && _j1330) {
const _j1316 = parseFloat(_j1329.value);
if (typeof _j582 !== 'undefined') {
_j582 = _j1316;
}
_j1330.textContent = Math.round(_j1316);
_j1329.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j582 !== 'undefined') {
_j582 = value;
}
_j1330.textContent = Math.round(value);
});
}
const _j1331 = document.getElementById('cellular-toggle');
const _j1274 = document.getElementById('cellular-sliders-section');
if (_j1331) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1331.checked = !!cellularEnabled;
if (_j1274) {
_j1274.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1331.checked = false;
if (_j1274) _j1274.style.display = 'none';
}
} catch (e) {
_j1331.checked = false;
if (_j1274) _j1274.style.display = 'none';
}
_j1331.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1274) {
_j1274.style.display = enabled ? 'flex' : 'none';
}
_j111('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1524) {
console.error('Error setting cellularEnabled:', _j1524);
}
});
}
const _j1332 = document.getElementById('cellular-scale');
const _j1333 = document.getElementById('cellular-scale-value');
if (_j1332 && _j1333) {
const _j1316 = parseFloat(_j1332.value);
if (typeof _j583 !== 'undefined') _j583 = _j1316;
_j1333.textContent = _j1316.toFixed(1);
_j1332.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j583 !== 'undefined') _j583 = value;
_j1333.textContent = value.toFixed(1);
});
}
const _j1334 = document.getElementById('cellular-seed');
const _j1335 = document.getElementById('cellular-seed-value');
if (_j1334 && _j1335) {
const _j1316 = parseFloat(_j1334.value);
if (typeof _j584 !== 'undefined') _j584 = _j1316;
_j1335.textContent = _j1316.toFixed(1);
_j1334.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j584 !== 'undefined') _j584 = value;
_j1335.textContent = value.toFixed(1);
});
}
const _j1336 = document.getElementById('white-dot-toggle');
const _j1337 = document.getElementById('white-dot-sliders-section');
if (_j1336) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1336.checked = !!whiteDotEnabled;
if (_j1337) _j1337.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1336.checked = false;
if (_j1337) _j1337.style.display = 'none';
}
} catch (e) {
_j1336.checked = false;
if (_j1337) _j1337.style.display = 'none';
}
_j1336.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1337) _j1337.style.display = enabled ? 'flex' : 'none';
_j111('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1524) {
console.error('Error setting whiteDotEnabled:', _j1524);
}
});
}
const _j1338 = document.getElementById('white-dot-density');
const _j1339 = document.getElementById('white-dot-density-value');
if (_j1338 && _j1339) {
if (window._urlParamWdVal !== undefined) {
const _j1340 = window._urlParamWdVal;
_j585 = _j1340 * 0.1;
_j1338.value = _j1340;
_j1339.textContent = _j1340.toFixed(2);
} else {
const _j1340 = parseFloat(_j1338.value);
if (typeof _j585 !== 'undefined') _j585 = _j1340 * 0.1;
_j1339.textContent = _j1340.toFixed(2);
}
_j1338.addEventListener('input', (e) => {
const _j1340 = parseFloat(e.target.value);
if (typeof _j585 !== 'undefined') _j585 = _j1340 * 0.1;
_j1339.textContent = _j1340.toFixed(2);
});
}
const _j1341 = document.getElementById('grain-toggle');
const _j1342 = document.getElementById('grain-sliders-section');
if (_j1341) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1341.checked = !!grainEnabled;
if (_j1342) _j1342.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1341.checked = false;
if (_j1342) _j1342.style.display = 'none';
}
} catch (e) {
_j1341.checked = false;
if (_j1342) _j1342.style.display = 'none';
}
_j1341.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1342) _j1342.style.display = enabled ? 'flex' : 'none';
_j111('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1524) {
console.error('Error setting grainEnabled:', _j1524);
}
});
}
const _j1343 = document.getElementById('grain-amount');
const _j1344 = document.getElementById('grain-amount-value');
if (_j1343 && _j1344) {
if (window._urlParamGrVal !== undefined) {
const _j1340 = window._urlParamGrVal;
_j586 = _j1340 * 0.1;
_j1343.value = _j1340;
_j1344.textContent = _j1340.toFixed(2);
} else {
const _j1340 = parseFloat(_j1343.value);
if (typeof _j586 !== 'undefined') _j586 = _j1340 * 0.1;
_j1344.textContent = _j1340.toFixed(2);
}
_j1343.addEventListener('input', (e) => {
const _j1340 = parseFloat(e.target.value);
if (typeof _j586 !== 'undefined') _j586 = _j1340 * 0.1;
_j1344.textContent = _j1340.toFixed(2);
});
}
const _j1345 = document.getElementById('future-path-preview-toggle');
if (_j1345) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1345.checked = !!showFuturePathPreview;
} else {
_j1345.checked = true;
}
} catch (e) {
_j1345.checked = true;
}
_j1345.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j111('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1524) {
console.error('Error setting showFuturePathPreview:', _j1524);
}
});
}
if (recordBtn) {
_j135(recordBtn, () => {
if (!_j618 && !_j626) {
_j182();
_j115();
}
});
}
if (stopBtn) {
_j135(stopBtn, () => {
if (_j618) {
_j183();
} else if (_j626) {
_j186();
}
_j115();
});
}
if (playBtn) {
_j135(playBtn, () => {
if (!_j618 && !_j626 && recordingData.events.length > 0) {
startPlayback();
_j115();
}
});
}
if (loadBtn) {
_j135(loadBtn, () => {
if (!_j618 && !_j626) {
_j185();
}
});
}
const _j1346 = document.getElementById('load-image');
const _j1347 = document.getElementById('image-file-input');
if (_j1220) {
if (_j1346) _j1346.style.display = 'none';
} else if (_j1346 && _j1347) {
_j135(_j1346, () => {
_j1347.click();
});
_j1347.addEventListener('change', (e) => {
const _j1348 = e.target.files[0];
if (_j1348 && _j1348.type.startsWith('image/')) {
_j116(_j1348);
}
});
}
const _j1349 = document.getElementById('show-reference-image');
if (_j1349 && !_j1220) {
_j135(_j1349, () => {
_j117();
});
}
const _j1350 = document.getElementById('hide-reference-image');
if (_j1350 && !_j1220) {
_j135(_j1350, () => {
_j118();
});
}
if (_j1149) {
_j1149.addEventListener('mousedown', _j68);
_j1149.addEventListener('touchstart', (e) => {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j68(_j1235);
});
}
_j73();
const _j1351 = _j67('flowEffectPanel');
if (_j1351 && !_j1351.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1351.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1523 => {
const _j1352 = _j1523.getAttribute('data-panel');
const _j1353 = {
overlay: _j68,
control: _j75,
effect: _j79,
flow: _j83
};
const fn = _j1353[_j1352];
if (!fn) return;
_j1523.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1523.addEventListener('touchstart', (e) => {
const _j1157 = e.touches[0];
fn({ clientX: _j1157.clientX, clientY: _j1157.clientY, target: _j1523, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j72(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j69);
document.addEventListener('mouseup', _j70);
document.addEventListener('touchmove', (e) => {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY
};
_j69(_j1235);
});
document.addEventListener('touchend', _j70);
document.addEventListener('mousemove', _j76);
document.addEventListener('mouseup', _j77);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY
};
_j76(_j1235);
}
});
document.addEventListener('touchend', _j77);
document.addEventListener('mousemove', _j80);
document.addEventListener('mouseup', _j81);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY
};
_j80(_j1235);
}
});
document.addEventListener('touchend', _j81);
document.addEventListener('mousemove', _j84);
document.addEventListener('mouseup', _j85);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY
};
_j84(_j1235);
}
});
document.addEventListener('touchend', _j85);
document.addEventListener('mousemove', _j88);
document.addEventListener('mouseup', _j89);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1157 = e.touches[0];
const _j1235 = {
clientX: _j1157.clientX,
clientY: _j1157.clientY
};
_j88(_j1235);
}
});
document.addEventListener('touchend', _j89);
if (hint && !_j674) {
hint.classList.remove('hidden');
}
_j115();
_j153();
_j157();
_j162();
_j158();
_j82();
_j86();
const effectControlPanel = _j67('effectControlPanel');
const effectHint = _j67('effectHint');
const _j1237 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j686) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1237) {
_j1237.textContent = _j686 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j67('flowEffectPanel');
const flowHint = _j67('flowHint');
const _j1239 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j690) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1239) {
_j1239.textContent = _j690 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1281).length > 0) {
setTimeout(() => {
_j145(_j1281);
_j111('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1281).length
});
}, 200);
}
setTimeout(() => {
_j101();
_j100();
}, 100);
_j148();
}
let _j1354 = false;
let _j1355 = null;
function _j148() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j135(btn, _j151);
_j149();
}
function _j149() {
if (document.getElementById('collect-panels-btn')) return;
const btn = document.createElement('button');
btn.id = 'collect-panels-btn';
btn.innerHTML = '◎';
btn.title = 'Collect all panels here';
document.body.appendChild(btn);
_j135(btn, _j150);
}
const _j1356 = [
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
let _j1357 = 0;
function _j150() {
const d = _j1356[_j1357];
_j1357 = (_j1357 + 1) % _j1356.length;
if (typeof _j678 !== 'undefined') { _j678.x = d.overlay.x; _j678.y = d.overlay.y; }
if (typeof _j681 !== 'undefined') { _j681.x = d.control.x; _j681.y = d.control.y; }
if (typeof _j685 !== 'undefined') { _j685.x = d.effectControl.x; _j685.y = d.effectControl.y; }
if (typeof _j689 !== 'undefined') { _j689.x = d.flowEffect.x; _j689.y = d.flowEffect.y; }
if (typeof _j693 !== 'undefined') { _j693.x = d.mask.x; _j693.y = d.mask.y; }
if (typeof _j74 === 'function') _j74();
if (typeof _j78 === 'function') _j78();
if (typeof _j82 === 'function') _j82();
if (typeof _j86 === 'function') _j86();
if (typeof _j90 === 'function') _j90();
if (typeof _j110 === 'function') _j110();
}
function _j151() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1358 = document.getElementById('effect-control-panel');
const _j1351 = document.getElementById('flow-effect-panel');
const maskPanel = document.getElementById('mask-panel');
const _j1359 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint, #mask-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1354) {
_j1355 = {
overlay: _j674,
control: _j682,
effect: _j686,
flow: _j690,
mask: _j694
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1358) _j1358.style.display = 'none';
if (_j1351) _j1351.style.display = 'none';
if (maskPanel) maskPanel.style.display = 'none';
_j1359.forEach(h => h.style.display = 'none');
_j674 = false;
_j682 = false;
_j686 = false;
_j690 = false;
_j694 = false;
_j1354 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1355 || { overlay: true, control: true, effect: true, flow: true, mask: true };
_j674 = s.overlay;
_j682 = s.control;
_j686 = s.effect;
_j690 = s.flow;
_j694 = s.mask !== undefined ? s.mask : true;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1358) _j1358.style.display = s.effect ? 'block' : 'none';
if (_j1351) _j1351.style.display = s.flow ? 'block' : 'none';
if (maskPanel) maskPanel.style.display = _j694 ? 'block' : 'none';
_j1359.forEach(h => h.style.display = '');
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
_j1354 = false;
_j1355 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j152();
}
}
function _j152() {
const _j1360 = [
{ panel: _j67('messageOverlay'), pos: _j678, update: _j74, defaultPos: { x: 50, y: 50 } },
{ panel: _j67('controlPanel'), pos: _j681, update: _j78, defaultPos: { x: 85, y: 50 } },
{ panel: _j67('effectControlPanel'), pos: _j685, update: _j82, defaultPos: { x: 15, y: 50 } },
{ panel: _j67('flowEffectPanel'), pos: _j689, update: _j86, defaultPos: { x: 50, y: 85 } }
];
_j1360.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1149 = panel.querySelector('.control-btn');
if (!_j1149) return;
const rect = _j1149.getBoundingClientRect();
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
if (_j1354) return;
_j151();
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
let _j1361 = false;
const _j1362 = new MutationObserver(() => {
if (_j1361) return;
if (go()) {
_j1361 = true;
_j1362.disconnect();
}
});
_j1362.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1361) _j1362.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j153() {
const _j1363 = document.getElementById('metallic-strength');
const _j1364 = document.getElementById('metallic-strength-value');
if (_j1363 && _j1364) {
const _j1316 = parseFloat(_j1363.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1316 / 100;
}
_j1364.textContent = _j1316;
_j1363.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1364.textContent = value;
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
_j181('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1365 = document.getElementById('metallic-flow');
const _j1366 = document.getElementById('metallic-flow-value');
const _j1367 = document.getElementById('flow-auto-random');
let _j1368 = null;
if (_j1365 && _j1366) {
const _j1316 = parseFloat(_j1365.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1316 / 100;
}
_j1366.textContent = _j1316;
_j1365.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1366.textContent = value;
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
_j181('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1367 && _j1365 && _j1366) {
_j1367.addEventListener('click', () => {
const isActive = _j1367.getAttribute('data-active') === 'true';
if (isActive) {
_j1367.setAttribute('data-active', 'false');
_j1367.classList.remove('active');
if (_j1368) {
clearInterval(_j1368);
_j1368 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1367.setAttribute('data-active', 'true');
_j1367.classList.add('active');
_j1368 = setInterval(() => {
const _j311 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1365.value = _j311;
_j1366.textContent = _j311;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j311 / 50;
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
Object.keys(tintButtons).forEach(_j1428 => {
const _j1369 = document.getElementById(_j1428);
if (_j1369) {
_j1369.classList.remove('active');
}
});
btn.classList.add('active');
const _j1370 = btn.textContent.trim();
_j111('system', '🎨 Metal tint changed', {
Tint: _j1370,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
const tintType = id.replace('metal-', '');
_j181('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j154() {
_j124();
_j121();
_j128();
_j130();
_j132();
_j127();
}
function _j155() {
const _j1371 = document.querySelector('.shape-type-btn.active');
if (_j1371) {
return parseInt(_j1371.dataset.type);
}
return 0;
}
function _j156(type) {
const _j1185 = document.querySelectorAll('.shape-type-btn');
_j1185.forEach(btn => {
const _j1372 = parseInt(btn.dataset.type);
if (_j1372 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j157() {
const _j801 = document.getElementById('bugs-size');
const _j1373 = document.getElementById('bugs-size-value');
if (_j801 && _j1373) {
const _j1316 = parseFloat(_j801.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1316;
}
_j1373.textContent = _j1316;
_j801.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1373.textContent = value;
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
_j181('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1374 = document.querySelectorAll('.shape-type-btn');
_j1374.forEach(btn => {
_j135(btn, () => {
const type = parseInt(btn.dataset.type);
_j156(type);
});
});
}
function _j158() {
const _j1306 = document.getElementById('stroke-select-slider');
const _j1308 = document.getElementById('stroke-index-display');
const _j1375 = document.getElementById('stroke-total-display');
const _j1309 = document.getElementById('stroke-select-value');
if (!_j1306 || !_j1308 || !_j1375 || !_j1309) {
return;
}
function _j159(_j1515 = false) {
const strokeCount = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
const _j1376 = Math.max(0, strokeCount - 1);
_j1306.max = _j1376;
_j1375.textContent = strokeCount;
if (_j1515 || parseInt(_j1306.value) > _j1376) {
_j1306.value = _j1376;
}
const _j1377 = parseInt(_j1306.value) || 0;
_j1308.textContent = _j1377;
_j1309.textContent = _j1377;
}
_j159();
_j1306.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1308.textContent = value;
_j1309.textContent = value;
let gridParams = null;
let points = null;
if (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes) && allBrushStrokes.length > 0) {
const _j1378 = Math.max(0, Math.min(value, allBrushStrokes.length - 1));
const selectedStroke = allBrushStrokes[_j1378];
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
let _j1379 = 0;
setInterval(() => {
const _j1380 = (typeof allBrushStrokes !== 'undefined' && Array.isArray(allBrushStrokes)) ?
allBrushStrokes.length :
0;
if (_j1380 !== _j1379) {
const _j546 = _j1380 > _j1379;
_j159(_j546);
_j1379 = _j1380;
}
}, 500);
window.updateStrokeSelector = _j159;
}
function _j160() {
const _j1226 = document.getElementById('custom-brush-color');
const _j1227 = document.getElementById('custom-brush-color-text');
if (!_j1226 || !_j1227) {
console.error('Custom brush color inputs not found');
return;
}
let _j1216 = _j1227.value.trim();
if (!_j1216 || !/^#[0-9A-Fa-f]{6}$/.test(_j1216)) {
_j1216 = _j1226.value;
}
const r = parseInt(_j1216.slice(1, 3), 16);
const g = parseInt(_j1216.slice(3, 5), 16);
const b = parseInt(_j1216.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j111('ui', '❌ Invalid custom brush color', {
Color: _j1216,
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
_j130();
_j133();
_j1226.value = _j1216.toUpperCase();
_j1227.value = _j1216.toUpperCase();
_j111('ui', '🎨 Custom brush color applied', {
Color: _j1216,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j161() {
const _j1214 = document.getElementById('canvas-background-color');
const _j1215 = document.getElementById('canvas-background-color-text');
const _j1217 = document.getElementById('canvas-width');
const _j1218 = document.getElementById('canvas-height');
let _j1381 = false;
if (_j1214 && _j1215) {
let _j1216 = _j1215.value.trim();
if (!_j1216 || !/^#[0-9A-Fa-f]{6}$/.test(_j1216)) {
_j1216 = _j1214.value;
}
const r = parseInt(_j1216.slice(1, 3), 16);
const g = parseInt(_j1216.slice(3, 5), 16);
const b = parseInt(_j1216.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j111('ui', '❌ Invalid background color', {
Color: _j1216,
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
if (typeof _j615 !== 'undefined' && _j615) {
_j615.begin();
background(r, g, b);
_j615.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j563 !== 'undefined') {
_j563 = true;
}
_j1214.value = _j1216.toUpperCase();
_j1215.value = _j1216.toUpperCase();
_j111('ui', '🎨 Background color changed', {
Color: _j1216,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1217 && _j1218) {
const _j1382 = parseInt(_j1217.value);
const _j1383 = parseInt(_j1218.value);
if (isNaN(_j1382) || isNaN(_j1383)) {
_j111('ui', '❌ Invalid canvas size', {
Width: _j1217.value,
Height: _j1218.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1382 < 100 || _j1382 > 4000 || _j1383 < 100 || _j1383 > 4000) {
_j111('ui', '❌ Canvas size out of range', {
Width: _j1382,
Height: _j1383,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j500 !== 'undefined' && typeof _j501 !== 'undefined') {
if (_j500 !== _j1382 || _j501 !== _j1383) {
_j500 = _j1382;
_j501 = _j1383;
_j1381 = true;
_j111('ui', '📐 Canvas size changed', {
Width: `${_j1382}px`,
Height: `${_j1383}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1381) {
sessionStorage.setItem('pendingCanvasWidth', _j500.toString());
sessionStorage.setItem('pendingCanvasHeight', _j501.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1384 = null;
let _j1385 = null;
function _j162() {
const _j1386 = document.querySelectorAll('.flow-effect-btn');
const _j1387 = document.getElementById('flow-strength');
const _j1388 = document.getElementById('flow-strength-value');
if (_j1387 && _j1388) {
_j1387.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1388.textContent = value;
if (typeof _j601 !== 'undefined') {
_j601.blendVol = value;
}
});
}
const _j1389 = document.getElementById('flow-last-stroke-only');
if (_j1389) {
_j1389.addEventListener('change', (e) => {
if (typeof _j602 !== 'undefined') {
_j602 = e.target.checked;
_j111('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j602
});
}
});
}
_j1386.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j163(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j164(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1384 === btn) {
_j164(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j163(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j164(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j164(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1384) {
const blendType = parseInt(_j1384.dataset.type);
_j164(_j1384, blendType);
}
});
}
function _j163(btn, blendType) {
if (_j1384) return;
const bounds = typeof _j49 === 'function' ? _j49() : null;
if (!bounds) {
_j111('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1384 = btn;
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
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618) {
if (typeof _j621 !== 'undefined' && _j621 > 0 && typeof _j623 !== 'undefined') {
const _j807 = millis() - _j621;
if (_j807 > 0) {
_j623 += _j807;
_j621 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j807,
total: _j623
});
}
}
const _j1390 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j601 !== 'undefined') ? _j601.blendVol : 100,
lastStrokeOnly: (typeof _j602 !== 'undefined') ? _j602 : false
};
console.log('🎬 Recording flow start event:', _j1390);
_j181('flow', _j1390);
}
_j1385 = setInterval(() => {
const _j906 = document.getElementById('flow-iteration-count');
if (_j906 && typeof _j591 !== 'undefined') {
_j906.textContent = _j591;
}
}, 50);
_j111('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j164(btn, blendType) {
if (_j1384 !== btn) return;
btn.classList.remove('active', 'running');
_j1384 = null;
if (_j1385) {
clearInterval(_j1385);
_j1385 = null;
}
let _j1391 = null;
if (typeof _j51 === 'function') {
_j1391 = _j51();
}
if (typeof _j181 === 'function' && typeof _j618 !== 'undefined' && _j618 && _j1391) {
const _j1392 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j593 !== 'undefined') ? _j593 : 0,
duration: _j1391.duration,
iterations: _j1391.iterations,
totalFrames: _j1391.frames
};
console.log('🎬 Recording flow end event:', _j1392);
_j181('flow', _j1392);
if (typeof _j621 !== 'undefined') {
_j621 = millis();
}
}
_j111('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1391 ? Math.round(_j1391.duration) + 'ms' : 'unknown',
Iterations: _j1391 ? _j1391.iterations : 'unknown',
Frames: _j1391 ? _j1391.frames : 'unknown'
});
}
let _j1393 = {
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
_pushFR: function(_j1516) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1516;
this._frSum += _j1516;
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
const _j1394 = this._avgFR();
console.log('平均 frameRate:', _j1394.toFixed(2));
console.log('是否触发警告:', _j1394 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1395 = this.logCooldown;
this.logCooldown = 0;
const _j1396 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1396.toFixed(2));
_j36(_j1396);
this.logCooldown = _j1395;
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
const _j1394 = this._avgFR();
console.log('平均帧率:', _j1394);
const _j1395 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j36(_j1394);
this.logCooldown = _j1395;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1395 = this.logCooldown;
this.logCooldown = 0;
const _j1397 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1397);
_j36(_j1397);
this.logCooldown = _j1395;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1393 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1393).filter(k => typeof _j1393[k] === 'function'));
_j36(50);
};
function _j165() {
_j507 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j508 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j510 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j166() {
const _j475 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j475[0], _j475[1], _j475[2]);
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
if (typeof _j609 !== 'undefined' && _j609) {
_j609.clear();
}
if (typeof finalBuffer !== 'undefined' && finalBuffer) {
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
}
if (typeof _j611 !== 'undefined' && _j611) {
_j611.clear();
_j611.background(255);
}
if (typeof _j613 !== 'undefined' && _j613) {
_j613.begin();
clear();
_j613.end();
}
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j544 = false;
_j545 = false;
_j566 = 0;
force = 1.0;
_j546 = false;
_j547 = false;
_j538 = 0;
x = hw;
y = hh;
_j522 = 0;
_j523 = 0;
_j524 = 0;
initialSize = 0;
_j527 = 0;
_j568 = 0;
pathPoints = [];
_j572 = false;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j571 !== 'undefined') {
_j571 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j370 !== 'undefined') {
_j370 = null;
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
_j172();
_j169();
_j563 = true;
}
function _j167() {
_j111('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j168();
_j169();
_j171();
_j170();
_j111('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j168() {
oldBuffer.begin();
clear();
background(255);
oldBuffer.end();
newBufferBlack.begin();
clear();
background(255);
newBufferBlack.end();
_j609.clear();
finalBuffer.begin();
clear();
background(255);
finalBuffer.end();
_j611.clear();
_j611.background(255);
pingPongBuffer.begin();
clear();
background(255);
pingPongBuffer.end();
if (typeof _j616 !== 'undefined' && _j616) {
_j616.begin();
clear();
_j616.end();
}
_j613.begin();
clear();
_j613.end();
if (typeof typeMapBuffer !== 'undefined' && typeMapBuffer) {
typeMapBuffer.begin();
clear();
background(0);
typeMapBuffer.end();
}
_j609.blendMode(BLEND);
_j611.blendMode(BLEND);
_j563 = true;
}
function _j169() {
if (!pingPongBuffer || !_j505) return;
if (_j505) {
pingPongBuffer.begin();
if (_j587) {
image(newBufferBlack, 0, 0, width, height);
resetShader();
pingPongBuffer.end();
return;
}
shader(_j505);
_j505.setUniform("rect", [0, 0, width * _j502, height * _j502]);
_j505.setUniform("tex0", newBufferBlack);
_j505.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j505.setUniform("forceMap", _j503);
_j505.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j505.setUniform("force", 1.0);
_j505.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j505.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j505.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j505.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j505.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j505.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
pingPongBuffer.end();
}
}
function _j170() {
_j544 = false;
_j545 = false;
_j566 = 0;
force = 1.0;
_j546 = false;
_j547 = false;
_j538 = 0;
x = hw;
y = hh;
_j522 = 0;
_j523 = 0;
_j524 = 0;
initialSize = 0;
_j527 = 0;
_j525 = 0;
_j512 = 0;
_j567 = 0;
_j568 = 0;
pathPoints = [];
_j572 = false;
startX = hw;
startY = hh;
_j434 = hw;
_j435 = hh;
_j526 = 0;
_j535 = 0;
_j533 = hw;
_j534 = hh;
_j532 = [];
flyBrushEnd = [];
_j529 = 0;
_j630 = hw;
_j631 = hh;
_j632 = hw;
_j633 = hh;
_j634 = false;
_j636 = 0;
_j637 = false;
}
function _j171() {
_j503.begin();
shader(_j504);
_j504.setUniform("randomSeed1", _j603[0] || 100);
_j504.setUniform("randomSeed2", _j603[1] || 200);
_j504.setUniform("randomSeed3", _j603[2] || 300);
_j504.setUniform("randomSeed4", _j603[3] || 400);
_j504.setUniform("scale1", _j604[0] || 0.002);
_j504.setUniform("scale2", _j604[1] || 0.005);
_j504.setUniform("scale3", _j604[2] || 0.015);
_j504.setUniform("amplitude1", _j605[0] || 0.6);
_j504.setUniform("amplitude2", _j605[1] || 0.4);
_j504.setUniform("amplitude3", _j605[2] || 0.3);
_j504.setUniform("phase1", _j606[0] || 0);
_j504.setUniform("phase2", _j606[1] || 0);
_j504.setUniform("phase3", _j606[2] || 0);
_j504.setUniform("vortexScale1", _j607[0] || 0.008);
_j504.setUniform("vortexScale2", _j607[1] || 0.012);
_j504.setUniform("clusterScale1", _j608[0] || 0.001);
_j504.setUniform("clusterScale2", _j608[1] || 0.0008);
_j504.setUniform("canvasCenter", [hw, hh]);
_j504.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j503.end();
}
function _j172() {
for (let i = 0; i < 4; i++) {
_j603[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j604[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j605[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j606[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j607[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j608[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j171();
}
function _j173(title = '') {}
function _j174() {
_j175();
}
function _j175() {
_j172();
const _j1398 = brushMode;
brushMode = 1;
initialSize = 20;
_j527 = initialSize;
_j521 = _j527;
_j525 = _j521;
_j544 = true;
_j545 = false;
_j566 = 0;
_j546 = true;
_j547 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j30(newBufferBlack, 1.0);
}
mouseReleased();
_j545 = true;
_j566 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j30(newBufferBlack, force);
}
_j39();
brushMode = _j1398;
_j166();
}
function _j176() {
if (_j669) {
_j111('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j669 = true;
_j670 = millis();
frameCount = 0;
_j671 = [];
_j173('🎬 Start Frame Recording');
}
function _j177() {
if (!_j669) {
_j111('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j669 = false;
const _j1399 = millis() - _j670;
_j173('🎬 Frame Recording Complete');
_j179();
}
function _j178() {
if (!_j669) return;
if (frameCount % _j672 !== 0) {
frameCount++;
return;
}
const _j1400 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1400}.png`;
saveCanvas(filename, 'png');
_j671.push({
frame: frameCount,
timestamp: millis() - _j670,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j111('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j671.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j179() {
if (_j671.length === 0) {
_j111('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j111('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j671.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j180(_j1517) {
return Math.round(_j1517 * 100) / 100;
}
function _j181(type, data = {}) {
if (window.testMode) return;
if (!_j618) return;
if (_j619 === 0) return;
const _j1401 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1402 = _j1401 + (millis() - _j619 - _j623);
const event = {
m: type,
t: Math.round(_j1402),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1403 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1404 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j111('recording', `${_j1403[type] || '📝'} Event recorded`, {
Type: _j1404[type] || type,
Time: `${_j1402.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j182() {
_j618 = true;
_j619 = 0;
_j621 = 0;
_j623 = 0;
_j624 = true;
_j512 = 0;
const _j1405 = seed;
const _j1406 = (typeof _j155 === 'function') ? _j155() : 0;
const _j1407 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1408 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1409 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1410 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1409[0] - rgb[0]) < 0.01 &&
Math.abs(_j1409[1] - rgb[1]) < 0.01 &&
Math.abs(_j1409[2] - rgb[2]) < 0.01) {
_j1410 = type;
break;
}
}
recordingData = {
version: "1.0",
engineVersion: (typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev',
startTime: _j619,
randomSeed: _j1405,
initialPathToggle: _j562,
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
shapeType: _j1406,
metallicStrength: _j1407,
metallicFlow: _j1408,
metallicTint: _j1409,
metallicTintType: _j1410
}
};
randomSeed(_j1405);
noiseSeed(_j1405);
_j173('🎬 Start Art Creation Recording');
if (typeof _j115 === 'function') {
_j115();
}
}
function _j183() {
if (!_j618) return;
_j618 = false;
randomSeed(seed);
noiseSeed(seed);
_j173('✨ Art Creation Recording Complete');
const _j1411 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j601 !== 'undefined' ? _j601.blendVol : 100,
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
_j184();
setTimeout(() => {
_j119();
}, 300);
if (typeof _j115 === 'function') {
_j115();
}
}
function _j184() {
if (recordingData.events.length === 0) {
_j111('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1412 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1413 = JSON.stringify(_j1412, null, 2);
const _j1414 = new Blob([_j1413], {
type: 'application/json'
});
const _j1415 = URL.createObjectURL(_j1414);
const _j1416 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1416.download = `drawing-recording-${timestamp}.json`;
_j1416.href = _j1415;
_j1416.click();
URL.revokeObjectURL(_j1415);
_j111('art', '💾 Art recording saved', {
File: _j1416.download,
Size: `${(_j1413.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j115 === 'function') {
_j115();
}
}
function _j185() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1348 = event.target.files[0];
if (!_j1348) return;
const _j1182 = new FileReader();
_j1182.onload = (e) => {
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
window.loadedRecordingFileName = _j1348.name;
}
recordingData = loadedData;
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j571 !== 'undefined') {
_j571 = null;
}
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
if (typeof _j229 !== 'undefined') {
_j229 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j173('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1417 = _j191(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1417) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1348.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j615 !== 'undefined' && _j615) {
_j615.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j615.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j136 === 'function') {
_j136();
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
_j1182.readAsText(_j1348);
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
if (_j626) {
_j111('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j1039 !== 'undefined') {
_j1039 = [];
}
if (typeof _j1040 !== 'undefined') {
_j1040 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1418 = window.location.search || '';
const _j1419 = (key) => _j1418.includes('_' + key + ':') || _j1418.includes('?' + key + ':');
const _j1420 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1421 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1422 = recordingData.initialPanelToggles;
for (const _j1423 of _j1420) {
const urlKey = _j1421[_j1423.jsonKey];
if (urlKey && _j1419(urlKey)) continue;
const value = _j1422 ? _j1422[_j1423.jsonKey] : undefined;
const _j1424 = value !== undefined ? value : _j1423.defaultVal;
_j1423.setter(_j1424);
const _j1425 = document.getElementById(_j1423.toggleId);
if (_j1425) {
_j1425.checked = _j1423.isNumeric ? (_j1424 === 1) : !!_j1424;
}
}
const _j1426 = recordingData.events.filter(e => e.m === 'mp').length;
const _j1427 = recordingData.events.filter(e => e.m === 'md').length;
if (window.skipClearCanvasOnNextPlayback) {
window.skipClearCanvasOnNextPlayback = false;
console.log('[append] ✅ skip clearCanvas, overlay playback', { mp: _j1426, md: _j1427, totalEvents: recordingData.events.length });
} else {
console.log('[startPlayback] ❌ standard mode, will clear canvas', { mp: _j1426, md: _j1427, totalEvents: recordingData.events.length });
_j166();
if (typeof clearMask === 'function') clearMask();
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j615 !== 'undefined' && _j615) {
_j615.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j615.end();
}
if (typeof _j31 === 'function') {
_j31();
}
if (typeof _j563 !== 'undefined') {
_j563 = true;
}
if (typeof _j136 === 'function') {
_j136();
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
_j626 = true;
_j627 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j628 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof totalStrokeCount !== 'undefined') {
totalStrokeCount = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j645 !== 'undefined') {
_j645 = 0;
}
_j634 = false;
_j630 = hw;
_j631 = hh;
_j632 = hw;
_j633 = hh;
_j568 = 0;
if (typeof _j668 !== 'undefined') {
_j668 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j571 !== 'undefined') {
_j571 = null;
}
if (typeof _j572 !== 'undefined') {
_j572 = false;
}
if (typeof allBrushStrokes !== 'undefined') {
allBrushStrokes = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j229 !== 'undefined') {
_j229 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j663 !== 'undefined') {
_j663 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j664 !== 'undefined') {
_j664 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j512 = 0;
_j636 = 0;
_j637 = false;
if (recordingData.initialPathToggle !== undefined) {
_j562 = recordingData.initialPathToggle;
_j111('playback', 'Path toggle restored', {
Status: _j562 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1195 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j111('playback', 'Brush color restored', {
Mode: _j1195[brushColorMode] || 'Unknown'
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
_j173('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j156 === 'function') {
_j156(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1363 = document.getElementById('metallic-strength');
const _j1364 = document.getElementById('metallic-strength-value');
if (_j1363 && _j1364) {
_j1363.value = ec.metallicStrength;
_j1364.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1365 = document.getElementById('metallic-flow');
const _j1366 = document.getElementById('metallic-flow-value');
if (_j1365 && _j1366) {
_j1365.value = ec.metallicFlow;
_j1366.textContent = ec.metallicFlow;
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
const _j1428 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1428);
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
const _j1429 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1430 = window.location.search || '';
const _j1431 = (key) => _j1430.includes('_' + key + ':') || _j1430.includes('?' + key + ':');
for (const _j1423 of _j1429) {
if (_j1431(_j1423.urlKey)) continue;
_j1423.setter(false);
const _j1425 = document.getElementById(_j1423.toggleId);
if (_j1425) {
_j1425.checked = false;
}
const _j1432 = document.getElementById(_j1423.slidersId);
if (_j1432) {
_j1432.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1433 = document.getElementById('distort-fbm-preview-toggle');
if (_j1433) _j1433.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1434 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1434)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j111('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j601 !== 'undefined') {
_j601.blendVol = fe.flowStrength;
const _j1435 = document.getElementById('flow-strength');
const _j1436 = document.getElementById('flow-strength-value');
if (_j1435) _j1435.value = fe.flowStrength;
if (_j1436) _j1436.textContent = fe.flowStrength;
}
for (const _j1423 of _j1429) {
const value = fe[_j1423.jsonKey];
if (value === undefined) continue;
if (_j1431(_j1423.urlKey)) {
_j111('playback', `⏭️ Flow Effect: ${_j1423.jsonKey} skipped (URL override)`, {});
continue;
}
_j1423.setter(!!value);
const _j1425 = document.getElementById(_j1423.toggleId);
if (_j1425) {
_j1425.checked = !!value;
}
const _j1432 = document.getElementById(_j1423.slidersId);
if (_j1432) {
_j1432.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1433 = document.getElementById('distort-fbm-preview-toggle');
if (_j1433) _j1433.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1437 = document.getElementById('distort-displacement-b');
const _j1438 = document.getElementById('distort-displacement-b-value');
if (_j1437) _j1437.value = fe.distortDisplacementB;
if (_j1438) _j1438.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1439 = document.getElementById('distort-displacement-c');
const _j1440 = document.getElementById('distort-displacement-c-value');
if (_j1439) _j1439.value = fe.distortDisplacementC;
if (_j1440) _j1440.textContent = fe.distortDisplacementC;
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
if (_j1422) {
_j111('playback', '✨ Panel toggles restored', {
Paper: _j1422.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1422.showGridOverlay ? 'ON' : 'OFF',
Path: _j1422.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1422.screenText ? 'ON' : 'OFF',
Camera: _j1422.doMoving ? 'ON' : 'OFF',
Loop: _j1422.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j111('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j172();
_j169();
const _j1441 = recordingData.events[0];
if (_j1441 && _j1441.strokeData) {
const strokeData = _j1441.strokeData;
_j527 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j527;
nowSize = size;
}
_j30(newBufferBlack, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j641 === 'undefined' || !_j641) {
_j641 = true;
}
_j642 = true;
if (_j641 && _j640 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j417 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j417 / 2));
_j640.setAutoUpdate(true);
if (typeof _j640.setPanScale === 'function') {
_j640.setPanScale(0);
}
if (typeof _j640.setZoomScale === 'function') {
_j640.setZoomScale(0);
}
_j640.setCenter([0, 0, 0], 0);
_j640.setDistance(easycamInitialDistance, 0);
if (typeof _j647 !== 'undefined') {
_j647 = 1;
}
_j111('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j642 = false;
_j641 = false;
}
if (typeof _j115 === 'function') {
_j115();
}
}
function _j186() {
if (!_j626) return;
_j626 = false;
_j634 = false;
_j628 = 0;
isWaitingToLoop = false;
_j636 = 0;
_j637 = false;
randomSeed(seed);
noiseSeed(seed);
_j173('⏹️ Playback Ended');
_j189();
_j642 = false;
if (_j641 && _j640 !== null) {
try {
const _j416 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j419 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j420 = _j640.getCenter();
const _j421 = _j640.getDistance();
_j111('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j420[0].toFixed(2)}, ${_j420[1].toFixed(2)}, ${_j420[2].toFixed(2)}], Distance: ${_j421.toFixed(2)}`,
Target: `Center: [${_j416[0].toFixed(2)}, ${_j416[1].toFixed(2)}, ${_j416[2].toFixed(2)}], Distance: ${_j419.toFixed(2)}`
});
_j653 = true;
_j654 = millis();
_j651 = [_j420[0], _j420[1], _j420[2]];
_j655 = _j421;
_j652 = _j416;
_j656 = _j419;
setTimeout(() => {
if (_j640 !== null) {
_j640.setAutoUpdate(false);
const _j428 = _j640.getCenter();
const _j429 = _j640.getDistance();
const _j422 = 0.1;
const _j423 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j428[0] - _j416[0], 2) +
Math.pow(_j428[1] - _j416[1], 2) +
Math.pow(_j428[2] - _j416[2], 2)
);
const distanceDiff = Math.abs(_j429 - _j419);
_j111('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j428[0].toFixed(2)}, ${_j428[1].toFixed(2)}, ${_j428[2].toFixed(2)}], Distance: ${_j429.toFixed(2)}`,
Target: `Center: [${_j416[0].toFixed(2)}, ${_j416[1].toFixed(2)}, ${_j416[2].toFixed(2)}], Distance: ${_j419.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j422 && distanceDiff <= _j423) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j422 || distanceDiff > _j423) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j428[0].toFixed(3)}, ${_j428[1].toFixed(3)}, ${_j428[2].toFixed(3)}]`,
distance: _j429.toFixed(3)
}
});
_j640.setCenter(_j416, 0);
_j640.setDistance(_j419, 0);
const _j1442 = _j640.getCenter();
const _j1443 = _j640.getDistance();
_j111('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1442[0].toFixed(2)}, ${_j1442[1].toFixed(2)}, ${_j1442[2].toFixed(2)}]`,
Distance: _j1443.toFixed(2)
});
}
_j653 = false;
}
_j641 = false;
}, 2100);
_j111('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j416,
Distance: _j419.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j641 = false;
}
} else {
_j641 = false;
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
function _j187(event) {
const _j856 = event.m || event.type;
switch (_j856) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('playback_mousePressed_start', 'mousePressed');
const _j1444 = _j545;
const _j1445 = event.t !== undefined ? event.t : event.time;
if (_j545) {
const _j765 = _j627;
if (window._fxVirtualTime === undefined) {
_j627 = millis() - _j1445 / _j629;
}
const _j1446 = _j765 - _j627;
const _j764 = (typeof _j636 !== 'undefined' && _j636 > 0) ?
(millis() - _j636) :
0;
if (typeof _j637 !== 'undefined') {
_j637 = false;
}
if (typeof _j636 !== 'undefined') {
_j636 = 0;
}
_j39();
_j545 = false;
_j566 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1447 = _j1445 - playbackLastStrokeEndEventTime;
const _j1448 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1449 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j40();
if (typeof _j1039 !== 'undefined') {
_j1039 = [];
}
if (typeof _j1040 !== 'undefined') {
_j1040 = 0;
}
if (typeof _j645 !== 'undefined') {
_j645++;
if (typeof _j648 !== 'undefined' && typeof _j646 !== 'undefined') {
_j648 = random(0, 1) > 0.7;
_j646 = _j645;
}
}
_j630 = event.x + (typeof _j638 !== 'undefined' ? _j638 : 0);
_j631 = event.y + (typeof _j639 !== 'undefined' ? _j639 : 0);
_j632 = _j630;
_j633 = _j631;
if (false) {
_j634 = true;
} else {
_j634 = false;
}
if (typeof _j668 !== 'undefined') {
_j668 = true;
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
_j569 = sd.mouseCountStart;
} else {
_j569 = 0;
}
_j567 = 0;
const offsetX = typeof _j638 !== 'undefined' ? _j638 : 0;
const offsetY = typeof _j639 !== 'undefined' ? _j639 : 0;
const _j1450 = event.x + offsetX;
const _j1451 = event.y + offsetY;
_j111('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1450.toFixed(0)}, ${_j1451.toFixed(0)})`
});
_j111('system', '|--------------------------------', {});
} else {
_j111('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j567 = 0;
}
_j512 = 0;
_j538 = 0;
x = _j630;
y = _j631;
_j522 = 0;
_j523 = 0;
_j524 = 0;
_j535 = 0;
_j529 = 0;
_j568 = 0;
_j566 = 0;
_j545 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j1039 !== 'undefined') {
_j1039 = [];
}
if (typeof _j536 !== 'undefined') {
_j536 = _j630;
_j537 = _j631;
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
_j517 = sd.step !== undefined ? sd.step : 4;
_j574 = sd.step2 !== undefined ? sd.step2 : 2;
randStep = sd.randStep !== undefined ? sd.randStep : 0;
maxUpdates = sd.maxUpdates !== undefined ? sd.maxUpdates : 30;
pathRotation = sd.pathRotation !== undefined ? sd.pathRotation : 0;
_j519 = sd.spring !== undefined ? sd.spring : 0.6;
_j520 = sd.friction !== undefined ? sd.friction : 0.5;
baseBrushSize = sd.baseBrushSize || 1.0;
if (_j548) {
_j560 = baseBrushSize;
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
_j513 = sd.whiteMaxOpacity;
} else {
_j513 = 0.95;
}
if (sd.hueShift !== undefined) {
_j514 = sd.hueShift;
} else {
_j514 = 0.0;
}
if (sd.satShift !== undefined) {
_j515 = sd.satShift;
} else {
_j515 = 0.0;
}
if (sd.briShift !== undefined) {
_j516 = sd.briShift;
} else {
_j516 = 0.0;
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
_j555 = sd.maskData;
if (sd.maskData.action === 'rect') {
drawMaskRect(sd.maskData.x1, sd.maskData.y1, sd.maskData.x2, sd.maskData.y2);
} else if (sd.maskData.action === 'polygon') {
drawMaskPolygon(sd.maskData.points);
}
} else {
_j555 = null;
if (_j551) clearMask();
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j603[0] = fm.randomSeed1;
_j603[1] = fm.randomSeed2;
_j603[2] = fm.randomSeed3;
_j603[3] = fm.randomSeed4;
_j604[0] = fm.scale1;
_j604[1] = fm.scale2;
_j604[2] = fm.scale3;
_j605[0] = fm.amplitude1;
_j605[1] = fm.amplitude2;
_j605[2] = fm.amplitude3;
_j606[0] = fm.phase1;
_j606[1] = fm.phase2;
_j606[2] = fm.phase3;
_j607[0] = fm.vortexScale1;
_j607[1] = fm.vortexScale2;
_j608[0] = fm.clusterScale1;
_j608[1] = fm.clusterScale2;
_j171();
} else {
if (typeof _j172 === 'function') {
_j172();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j527 = initialSize;
_j521 = _j527;
_j525 = _j521;
_j538 = 0;
x = _j630;
y = _j631;
_j522 = 0;
_j523 = 0;
_j524 = 0;
_j535 = 0;
_j529 = 0;
_j544 = true;
_j545 = false;
_j566 = 0;
_j546 = true;
_j547 = false;
_j568 = 0;
startX = _j630;
startY = _j631;
pathPoints = [{
x: _j630,
y: _j631
}];
_j572 = true;
_j634 = true;
if (_j548) window._playbackPenPressure = -1;
_j30(newBufferBlack, 1.0);
crandomDebugger.checkpoint('playback_mousePressed_end', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j630 = event.x + (typeof _j638 !== 'undefined' ? _j638 : 0);
_j631 = event.y + (typeof _j639 !== 'undefined' ? _j639 : 0);
if (_j548 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j548) window._playbackPenPressure = -1;
const _j810 = crandom.getCount();
const _j1452 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1452;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('playback_mouseReleased', 'mouseReleased');
const _j1453 = crandom.getCount();
const _j815 = _j1453 - _j810;
const _j1454 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j847 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j856 = e.m || e.type;
return _j856 === 'mr' || _j856 === 'mouseReleased';
}).length :
'?';
const _j816 = window.drawLoopCount || 0;
const _j1455 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 playback [stroke ${_j1454}/${_j847}] | Draw: ${_j816} | Seed: ${_j1453}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1454);
crandomDebugger.compareStroke(_j1454);
_j630 = event.x + (typeof _j638 !== 'undefined' ? _j638 : 0);
_j631 = event.y + (typeof _j639 !== 'undefined' ? _j639 : 0);
_j634 = false;
if (!_j545) {
_j545 = true;
_j566 = 0;
if (typeof _j636 !== 'undefined') {
_j636 = millis();
}
if (typeof _j637 !== 'undefined') {
_j637 = true;
}
_j111('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j111('playback', 'Stroke reproduction complete', {
FinalSize: _j527.toFixed(2),
CountdownStatus: _j545 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j634) {
_j634 = true;
} else {
_j632 = _j630;
_j633 = _j631;
}
_j630 = event.x + (typeof _j638 !== 'undefined' ? _j638 : 0);
_j631 = event.y + (typeof _j639 !== 'undefined' ? _j639 : 0);
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
_j154();
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
const _j1456 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1457 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1373 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1373;
const _j801 = document.getElementById('bugs-size');
const _j802 = document.getElementById('bugs-size-value');
if (_j801 && _j802) {
_j801.value = _j1373;
_j802.textContent = _j1373;
}
}
const _j800 = {
action: action,
shapeType: _j1457,
bugsSize: _j1373,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1458 = null;
let _j1459 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j800);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1458 = window._scanGlobalPlaybackCount || 0;
_j1459 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1373;
}
const _j803 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1457);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1457);
}
}
if (_j803) {
randomSeed(_j803);
noiseSeed(_j803);
}
}
_j111('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1456,
ShapeType: _j1457 !== null ? _j1457 : 'Unknown',
BugsSize: _j1373,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1458,
CurrentCount: _j1459
});
} else if (action === 'scan-random') {
const _j1457 = event.shapeType !== undefined ? event.shapeType : null;
const _j1373 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1373;
const _j801 = document.getElementById('bugs-size');
const _j802 = document.getElementById('bugs-size-value');
if (_j801 && _j802) {
_j801.value = _j1373;
_j802.textContent = _j1373;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1457);
}
_j111('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1457 !== null ? _j1457 : 'Unknown',
BugsSize: _j1373
});
} else if (action === 'metallic-strength') {
const _j1364 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1364 / 100;
}
const _j1363 = document.getElementById('metallic-strength');
const _j1460 = document.getElementById('metallic-strength-value');
if (_j1363 && _j1460) {
_j1363.value = _j1364;
_j1460.textContent = _j1364;
}
_j111('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1364
});
} else if (action === 'bugs-size') {
const _j1373 = event.value !== undefined ? event.value : 10;
const _j801 = document.getElementById('bugs-size');
const _j802 = document.getElementById('bugs-size-value');
if (_j801 && _j802) {
_j801.value = _j1373;
window.bugsSize = _j1373;
_j802.textContent = _j1373;
_j111('system', '🐛 Bugs Size updated during playback', {
Value: _j1373
});
}
} else if (action === 'metallic-flow') {
const _j1366 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1366 / 100;
}
const _j1365 = document.getElementById('metallic-flow');
const _j1461 = document.getElementById('metallic-flow-value');
if (_j1365 && _j1461) {
_j1365.value = _j1366;
_j1461.textContent = _j1366;
}
_j111('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1366
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
const _j1428 = `metal-${tintType}`;
const btn = document.getElementById(_j1428);
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
if (typeof _j588 !== 'undefined' && _j588) {
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
if (event.strength !== undefined && typeof _j601 !== 'undefined') {
_j601.blendVol = event.strength;
}
if (typeof _j602 !== 'undefined') {
_j602 = event.lastStrokeOnly || false;
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
const _j1462 = window.pendingFlowEvent;
if (_j1462) {
if (typeof _j597 !== 'undefined') {
_j597 = event.totalFrames || (event.iterations * 3) || 30;
_j598 = event.iterations || 10;
}
_j111('playback', '🌊 Flow Effect: End (target set, wait for preview)', {
BlendType: _j1462.blendType,
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
if (!_j626) return;
const _j1463 = 200;
if (typeof window !== 'undefined') {
const _j1464 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1465 = millis() - window.lastEffectControlProcessTime;
if (_j1465 < _j1463) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1464 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1466 = millis() - _j635;
const _j1467 = Math.floor(_j1466 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1467) {}
if (_j1466 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ Countdown finished, preparing replay');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j111('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j641 && _j640 !== null) {
const _j416 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j419 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j640.setCenter(_j416, 0);
_j640.setDistance(_j419, 0);
_j653 = false;
_j111('system', '🎥 Camera reset for loop', {
Center: `[${_j416[0].toFixed(2)}, ${_j416[1].toFixed(2)}, ${_j416[2].toFixed(2)}]`,
Distance: _j419.toFixed(2)
});
}
_j166();
if (typeof _j1039 !== 'undefined') {
_j1039 = [];
}
if (typeof _j1040 !== 'undefined') {
_j1040 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j627 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j628 = 0;
_j634 = false;
_j630 = hw;
_j631 = hh;
_j632 = hw;
_j633 = hh;
isWaitingToLoop = false;
_j568 = 0;
_j512 = 0;
_j636 = 0;
_j637 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j571 !== 'undefined') {
_j571 = null;
}
if (typeof _j572 !== 'undefined') {
_j572 = false;
}
if (typeof _j663 !== 'undefined') {
_j663 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j664 !== 'undefined') {
_j664 = {
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
_j186();
}
}
return;
}
if (_j628 >= recordingData.events.length && !isWaitingToLoop) {
if (_j634) {
_j634 = false;
if (!_j545) {
_j545 = true;
_j566 = 0;
_j563 = true;
}
}
if (_j545) {
if (_j566 < maxUpdates) {
return;
}
}
if (_j544) {
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
window._fxDebug.eventsProcessed = _j628;
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
function _j188() {
console.log('[fxhash] Forcing final composite + capture...');
_j563 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j641 && _j640 !== null) {
_j653 = true;
_j654 = millis();
_j651 = [_j640.getCenter()[0], _j640.getCenter()[1], _j640.getCenter()[2]];
_j655 = _j640.getDistance();
_j652 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j656 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1468 = _j657 + 500;
console.log('[fxhash] Waiting ' + _j1468 + 'ms for camera reset before capture...');
setTimeout(_j188, _j1468);
} else {
_j188();
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
_j635 = millis();
} else {
_j111('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle is not 1, stopping playback');
_j186();
}
return;
}
var _j770;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j770 = window._fxVirtualTime * _j629;
} else {
_j770 = (millis() - _j627) * _j629;
}
let _j1469 = 0;
const _j1470 = 100;
let _j1471 = 0;
const _j1472 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1473 = false;
while (_j628 < recordingData.events.length && _j1469 < _j1470) {
if (typeof _j588 !== 'undefined' && _j588 &&
typeof _j597 !== 'undefined' && _j597 > 0) {
break;
}
const event = recordingData.events[_j628];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j856 = event.m || event.type;
const _j1474 = _j856 === 'mp' || _j856 === 'mousePressed';
const _j1475 = _j856 === 'mr' || _j856 === 'mouseReleased';
const _j1476 = _j856 === 'ec' || _j856 === 'effectControl';
const _j1477 = _j856 === 'flow';
const _j1478 = _j856 === 'mask';
const _j771 = eventTime - _j770;
if (!_j1476 && !_j1477 && !_j1478 && eventTime > _j770 && _j628 + 1 < recordingData.events.length) {
const _j766 = recordingData.events[_j628 + 1];
const _j767 = _j766.m || _j766.type;
const _j768 = _j767 === 'mp' || _j767 === 'mousePressed';
if (_j768) {
if (_j1475) {
if (_j1473) {
break;
}
_j187(event);
_j628++;
_j1469++;
continue;
} else {
_j628++;
continue;
}
}
}
if (eventTime <= _j770) {
const _j1479 = _j856 === 'md' || _j856 === 'mouseDragged';
if (_j1479 && _j1471 >= _j1472) {
break;
}
if (_j1475 && _j1473) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1476 || _j1478 || !_j545 || (_j545 && _j634)) {
if (_j1476) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j187(event);
_j628++;
_j1469++;
if (_j1479) {
_j1471++;
_j1473 = true;
}
} else {
break;
}
} else {
const _j1479 = _j856 === 'md' || _j856 === 'mouseDragged';
if (_j1479 && _j1471 >= _j1472) {
break;
}
if (_j1475 && _j1473) {
break;
}
if (_j1476 || _j1477 || _j1478 || (_j1474 && !_j545) || _j771 < 100) {
if (_j1476) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j187(event);
_j628++;
_j1469++;
if (_j1479) {
_j1471++;
_j1473 = true;
}
} else {
break;
}
}
if (_j1471 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j189() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1480 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1480) {
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
const _j1481 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1482 = confirm(
`Playback complete.\n\n` +
`Events played: ${loadedData.events.length}\n` +
`File: ${_j1481}\n\n` +
`Continue recording and append new strokes?\n\n` +
`OK — continue recording\n` +
`Cancel — stop`
);
if (_j1482) {
_j190(loadedData, _j1481);
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
function _j190(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j111('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j182();
return;
}
const _j1483 = loadedData.events[loadedData.events.length - 1];
const _j1411 = _j1483.t !== undefined ? _j1483.t : (_j1483.time !== undefined ? _j1483.time : 0);
_j618 = true;
_j619 = millis();
_j621 = 0;
_j623 = 0;
_j624 = true;
_j512 = 0;
recordingData = {
...loadedData,
engineVersion: loadedData.engineVersion || (
(typeof window !== 'undefined' && typeof window.__INKFIELD_ENGINE_VERSION__ === 'string')
? window.__INKFIELD_ENGINE_VERSION__
: 'dev'
),
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1411,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1405 = seed;
randomSeed(_j1405);
noiseSeed(_j1405);
_j173('🔄 Continue Recording from Loaded File');
_j111('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1411}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j115 === 'function') {
_j115();
}
}
function _j191(_j1518, _j1519) {
if (!_j1518 || !_j1519) {
_j111('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1518 && height === _j1519) {
_j111('system', '✅ Canvas size matches recording', {
Width: `${_j1518}px`,
Height: `${_j1519}px`
});
return false;
}
_j111('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1518}x${_j1519}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1518.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1519.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j111('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1518}x${_j1519}`
});
window.location.reload();
return true;
}
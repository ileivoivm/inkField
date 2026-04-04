function _j1(_j1422, _j1423) {
var _j179 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1422];
var _j180 = window.SHADER_SOURCES && window.SHADER_SOURCES[_j1423];
if (_j179 && _j180 && typeof createShader === 'function') {
return createShader(_j179, _j180);
}
return window['loadShader'](_j1422, _j1423);
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
const _j181 = stack.split('\n')[2];
this.callHistory.push({
count: this.globalCount,
args: args,
caller: _j181,
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
const _j182 = this.callHistory.slice(-n);
console.log('═══════════════════════════════════════');
console.log(`📝 最近 ${_j182.length} 條 random() 調用`);
console.log('═══════════════════════════════════════');
_j182.forEach((_j589, _j290) => {
console.log(`[${_j589.count}] args: [${_j589.args.join(', ')}]`);
if (_j589.caller) {
console.log(`    位置: ${_j589.caller.trim()}`);
}
});
console.log('═══════════════════════════════════════');
}
static compare(count1, count2, label1 = 'Point 1', label2 = 'Point 2') {
const _j183 = count2 - count1;
console.log('═══════════════════════════════════════');
console.log('🔍 Crandom 計數比較');
console.log('═══════════════════════════════════════');
console.log(`${label1}: ${count1}`);
console.log(`${label2}: ${count2}`);
console.log(`差異: ${_j183 > 0 ? '+' : ''}${_j183}`);
console.log('═══════════════════════════════════════');
return _j183;
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
const _j184 = playback.totalCount - recording.totalCount;
const percent = ((_j184 / recording.totalCount) * 100).toFixed(2) + '%';
const icon = Math.abs(_j184) < 50 ? '✅' : Math.abs(_j184) < 200 ? '⚠️' : '❌';
console.log(`${icon} 筆劃 ${strokeNumber} | 差異: ${_j184 > 0 ? '+' : ''}${_j184} (${percent})`);
const recDeltas = this.calculateDeltas(recording.checkpoints);
const playDeltas = this.calculateDeltas(playback.checkpoints);
const _j185 = new Set([...recDeltas.keys(), ...playDeltas.keys()]);
const _j186 = Array.from(_j185).sort((a, b) => {
const indexA = Array.from(recDeltas.keys()).indexOf(a);
const _j187 = Array.from(recDeltas.keys()).indexOf(b);
if (indexA === -1 && _j187 === -1) return 0;
if (indexA === -1) return 1;
if (_j187 === -1) return -1;
return indexA - _j187;
});
let _j188 = 0;
const _j189 = [];
for (const stage of _j186) {
const recCount = recDeltas.get(stage) || 0;
const _j190 = playDeltas.get(stage) || 0;
const _j183 = _j190 - recCount;
_j188 += _j183;
if (Math.abs(_j183) > 0) {
_j189.push({
stage: stage,
recordingCount: recCount,
playbackCount: _j190,
difference: _j183
});
}
}
if (Math.abs(playback.totalCount - recording.totalCount) > 200) {
_j189.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
const _j191 = _j189.filter(d => Math.abs(d.difference) > 50);
if (_j191.length > 0) {
console.log('   ⚠️ 主要差異階段:');
for (let i = 0; i < Math.min(2, _j191.length); i++) {
const d = _j191[i];
const icon = d.difference > 0 ? '🔺' : '🔻';
console.log(`      ${icon} ${d.stage}: ${d.difference}`);
}
}
}
}
calculateDeltas(checkpoints) {
const _j192 = new Map();
for (let i = 0; i < checkpoints.length; i++) {
const _j193 = checkpoints[i];
const _j194 = checkpoints[i + 1];
if (_j194) {
const _j195 = `${_j193.name} → ${_j194.name}`;
const _j196 = _j194.count - _j193.count;
_j192.set(_j195, _j196);
}
}
return _j192;
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
const _j197 = [{
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
const _j198 = {};
_j197.forEach(color => {
_j198[color.id] = {
name: color.name,
rgb: color.rgb,
channel: _j3(color.rgb)
};
});
return _j198;
}
function _j3(rgb) {
const [r, g, b] = rgb;
const _j199 = r > 20;
const _j200 = g > 20;
const _j201 = b > 20;
if (_j199 && _j200 && _j201) return 'rgb';
if (_j199 && _j200) return 'rg';
if (_j199 && _j201) return 'rb';
if (_j200 && _j201) return 'gb';
if (_j199) return 'r';
if (_j200) return 'g';
if (_j201) return 'b';
return 'rgb';
}
function _j4() {
let _j202 = '// ============================================\n';
_j202 += '// 🎨 颜色常量（由 colors.js 自动生成）\n';
_j202 += '// ============================================\n';
_j197.forEach(color => {
const [r, g, b] = color.rgb;
const _j203 = `COLOR_${color.name.toUpperCase()}`;
_j202 += `const vec3 ${_j203} = vec3(${r}.0/255.0, ${g}.0/255.0, ${b}.0/255.0);`;
_j202 += `  // ${color.displayName} ${color.hex}\n`;
});
return _j202;
}
function _j5() {
let _j202 = '';
_j197.forEach((color, _j290) => {
const _j203 = `COLOR_${color.name.toUpperCase()}`;
if (_j290 === 0) {
_j202 += `    if (brushMode == ${color.id}) {\n`;
} else {
_j202 += `    } else if (brushMode == ${color.id}) {\n`;
}
_j202 += `        brushColor = ${_j203};\n`;
});
_j202 += `    }\n`;
return _j202;
}
function _j6() {
return _j197.map(color => ({
id: color.id,
name: color.name,
displayName: color.displayName,
hex: color.hex
}));
}
function _j7(id) {
return _j197.find(c => c.id === id);
}
function _j8(name) {
return _j197.find(c => c.name === name);
}
if (typeof module !== 'undefined' && module.exports) {
module.exports = {
_j197,
_j2,
_j4,
_j5,
_j6,
_j7,
_j8
};
}
let _j204 = null;
let _j205 = 0;
const _j206 = 2000;
function _j9(_j488 = 120, _j1424 = 12, _j1425 = 10, _j1426 = 5) {
const _j207 = Math.min(width, _j206);
const _j208 = Math.min(height, _j206);
const _j209 = (width > _j206 || height > _j206);
randomSeed(seed);
const _j210 = _j10(_j488, _j1426);
const _j211 = createGraphics(_j207, _j208, P2D);
const _j212 = createGraphics(_j207, _j208, P2D);
for (let i = -_j488; i < _j207 + _j488; i += _j207 / 500) {
for (let j = -_j488; j < _j208 + _j488; j += _j1424) {
_j211.image(_j210, i, j + (noise(i * 0.1, j * 1.0) - 0.5) * _j1425);
}
}
_j210.remove();
if (doSpotNoise) {
padfactor = 300;
_j212.blendMode(DIFFERENCE);
for (let i = 0; i < 400; i++) {
x = random(_j207)
y = random(_j208)
_j212.push()
_j212.strokeWeight(random(1, 2))
_j212.stroke(0, random(10, 250))
_j212.noFill();
_j212.bezier(
random(-padfactor, _j207 + padfactor),
random(-padfactor, _j208 + padfactor),
random(-padfactor, _j207 + padfactor),
random(-padfactor, _j208 + padfactor),
random(-padfactor, _j207 + padfactor),
random(-padfactor, _j208 + padfactor),
random(-padfactor, _j207 + padfactor),
random(-padfactor, _j208 + padfactor)
);
_j212.pop();
}
_j211.blendMode(DIFFERENCE);
_j211.image(_j212, 0, 0, _j207, _j208);
_j212.remove();
}
if (_j209) {
const _j213 = createGraphics(width, height);
_j213.image(_j211, 0, 0, width, height);
_j211.remove();
return _j213;
}
return _j211;
}
function _j10(_j1427 = 64, _j1426 = 0.5) {
const _j210 = createGraphics(_j1427, _j1427);
_j210.pixelDensity(1);
_j210.noSmooth();
_j210.clear();
_j210.noFill();
_j210.translate(_j1427 / 2, _j1427 / 2);
_j210.strokeWeight(1.5);
for (let i = 0; i < 100; i++) {
const _j214 = 0.5 + crandom.random(0, 1) * 0.5;
const _j215 = pow(_j214, _j1426) * 255;
_j210.stroke(_j215, _j215, _j215, 255);
const radius = crandom.random() * _j1427 * 0.5;
const angle = crandom.random() * TWO_PI;
const x = radius * Math.cos(angle);
const y = radius * Math.sin(angle);
_j210.point(x, y);
}
_j210.resetMatrix();
return _j210;
}
let _j216 = [];
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
const _j217 = 8;
const _j218 = [];
for (let i = 0; i < _j217; i++) {
_j218.push({
numCirclesRand: i === 0 ? crandom.random(3, 8) : null,
angle: crandom.random(TWO_PI),
distance: crandom.random(0, size * 0.4),
circleSize: crandom.random(size * 0.4, size * 0.8)
});
}
const _j219 = floor(_j218[0].numCirclesRand);
for (let i = 0; i < _j219; i++) {
const _j220 = _j218[i];
circles.push({
x: cos(_j220.angle) * _j220.distance,
y: sin(_j220.angle) * _j220.distance,
radius: _j220.circleSize
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
const _j221 = [];
const _j222 = 3;
const _j223 = 48;
const _j218 = [];
const _j224 = crandom.random(1, 4);
const _j225 = crandom.random(0.4, 0.6);
const _j226 = floor(_j224);
for (let _j227 = 0; _j227 < _j222; _j227++) {
const _j228 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotation: crandom.random(-PI / 4, PI / 4),
sizeVariation: crandom.random(0.85, 1.15),
numVerticesRand: crandom.random(36, 48),
noiseOffset: crandom.random(1000) + _j227 * 500
};
_j218.push(_j228);
}
for (let _j227 = 0; _j227 < _j226; _j227++) {
const _j228 = _j218[_j227];
const offsetX = _j228.offsetX;
const offsetY = _j228.offsetY;
const layerRotation = _j228.layerRotation;
const sizeVariation = _j228.sizeVariation;
const _j229 = size * sizeVariation;
const _j230 = floor(_j228.numVerticesRand);
const noiseOffset = _j228.noiseOffset;
const _j231 = [];
for (let i = 0; i < _j230; i++) {
const angle = (i / _j230) * TWO_PI;
const _j232 = noise(cos(angle) * 1.0 + noiseOffset, sin(angle) * 1.0);
const _j233 = noise(cos(angle) * 2.5 + noiseOffset + 100, sin(angle) * 2.5);
const _j234 = noise(cos(angle) * 5.0 + noiseOffset + 200, sin(angle) * 5.0);
const _j235 = _j232 * 0.5 + _j233 * 0.3 + _j234 * 0.2;
const radius = _j229 * (0.4 + _j235 * _j225);
const _j236 = cos(angle) * radius;
const _j237 = sin(angle) * radius;
_j231.push({
x: _j236,
y: _j237
});
}
const _j238 = [];
for (let i = 0; i < _j231.length; i++) {
const _j239 = _j231[(i - 1 + _j231.length) % _j231.length];
const _j240 = _j231[i];
const _j194 = _j231[(i + 1) % _j231.length];
_j238.push({
x: (_j239.x + _j240.x * 2 + _j194.x) / 4,
y: (_j239.y + _j240.y * 2 + _j194.y) / 4
});
}
for (let v of _j238) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j241 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j221.push({
x: rotatedX + offsetX,
y: _j241 + offsetY
});
}
}
return {
type: 'blob',
vertices: _j221
};
}
function _j14(size, seed) {
randomSeed(seed);
noiseSeed(seed);
const _j221 = [];
const _j222 = 3;
const _j218 = [];
const _j224 = crandom.random(1, 4);
const _j225 = crandom.random(0.15, 0.35);
const _j226 = floor(_j224);
let rotation = crandom.random(TWO_PI);
for (let _j227 = 0; _j227 < _j222; _j227++) {
const _j228 = {
offsetX: crandom.random(-size * 0.2, size * 0.2),
offsetY: crandom.random(-size * 0.2, size * 0.2),
layerRotationOffset: crandom.random(-0.5, 0.5),
sizeVariation: crandom.random(0.85, 1.15),
lengthRatio: crandom.random(1.0, 4.0),
stripWidth: crandom.random(0.5, 0.8),
numVerticesRand: crandom.random(32, 48),
noiseOffset: crandom.random(1000) + _j227 * 500
};
_j218.push(_j228);
}
for (let _j227 = 0; _j227 < _j226; _j227++) {
const _j228 = _j218[_j227];
const offsetX = _j228.offsetX;
const offsetY = _j228.offsetY;
const layerRotation = rotation + _j228.layerRotationOffset;
const sizeVariation = _j228.sizeVariation;
const _j229 = size * sizeVariation;
const lengthRatio = _j228.lengthRatio;
const _j242 = _j229 * lengthRatio;
const stripWidth = _j229 * _j228.stripWidth;
const _j230 = floor(_j228.numVerticesRand);
const noiseOffset = _j228.noiseOffset;
const _j231 = [];
for (let i = 0; i < _j230; i++) {
let _j236, _j237;
if (i < _j230 / 2) {
const _j243 = (i / (_j230 / 2));
_j236 = (_j243 - 0.5) * _j242;
const _j244 = noise(_j243 * 1.5 + noiseOffset, _j227 * 50);
_j237 = -stripWidth / 2 + (_j244 - 0.5) * stripWidth * _j225;
} else {
const _j243 = ((_j230 - 1 - i) / (_j230 / 2));
_j236 = (_j243 - 0.5) * _j242;
const _j244 = noise(_j243 * 1.5 + noiseOffset, 100 + _j227 * 50);
_j237 = stripWidth / 2 + (_j244 - 0.5) * stripWidth * _j225;
}
_j231.push({
x: _j236,
y: _j237
});
}
const _j238 = [];
for (let i = 0; i < _j231.length; i++) {
const _j239 = _j231[(i - 1 + _j231.length) % _j231.length];
const _j240 = _j231[i];
const _j194 = _j231[(i + 1) % _j231.length];
_j238.push({
x: (_j239.x + _j240.x * 2 + _j194.x) / 4,
y: (_j239.y + _j240.y * 2 + _j194.y) / 4
});
}
for (let v of _j238) {
const rotatedX = v.x * cos(layerRotation) - v.y * sin(layerRotation);
const _j241 = v.x * sin(layerRotation) + v.y * cos(layerRotation);
_j221.push({
x: rotatedX + offsetX,
y: _j241 + offsetY
});
}
}
return {
type: 'strip',
vertices: _j221
};
}
function _j15(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j221 = [];
const _j245 = 2;
const _j246 = 30;
const _j247 = 8;
const _j248 = 300;
const _j218 = [];
const _j249 = crandom.random(1, 3);
const _j250 = floor(_j249);
for (let _j251 = 0; _j251 < _j245; _j251++) {
const _j252 = {
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
for (let step = 0; step < _j246; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j252.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j248; i++) {
_j252.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j218.push(_j252);
}
for (let _j251 = 0; _j251 < _j250; _j251++) {
const _j252 = _j218[_j251];
let branchAngle = _j252.branchAngle;
let branchOffsetX = _j252.branchOffsetX;
let branchOffsetY = _j252.branchOffsetY;
let _j253 = _j252.numLRand > 0.2 ? 1 : 2;
let _j254 = floor(_j252.numStepsRand) * _j253;
let stepSize = _j252.stepSize;
let noiseScale = _j252.noiseScale;
let noiseStrength = _j252.noiseStrength;
let thickness = _j252.thickness;
let pathPoints = [];
let _j255 = branchOffsetX;
let _j256 = branchOffsetY;
let _j257 = branchAngle;
pathPoints.push({
x: _j255,
y: _j256
});
for (let step = 0; step < _j254; step++) {
const stepRandoms = _j252.stepRandoms[step];
const t = step / _j254;
const _j258 = noise(step * noiseScale, seed * 0.01);
const _j259 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j258 - 0.5) * PI * noiseStrength;
_j257 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j260 = stepSize * stepVariation;
_j255 += cos(_j257) * _j260;
_j256 += sin(_j257) * _j260;
pathPoints.push({
x: _j255,
y: _j256
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j254 - 3) {
const _j261 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j257 + stepRandoms.subBranchAngle;
let _j262 = _j255;
let _j263 = _j256;
for (let _j264 = 0; _j264 < _j261; _j264++) {
const _j265 = noise(step * noiseScale + _j264 * 0.5, seed * 0.01 + 200);
const _j266 = (_j265 - 0.5) * PI * 0.5;
const _j267 = subBranchAngle + _j266;
_j262 += cos(_j267) * stepSize * 0.6;
_j263 += sin(_j267) * stepSize * 0.6;
pathPoints.push({
x: _j262,
y: _j263
});
}
}
}
const _j268 = [];
const _j269 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j270;
if (i === 0) {
const _j194 = pathPoints[i + 1];
_j270 = atan2(_j194.y - point.y, _j194.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j239 = pathPoints[i - 1];
_j270 = atan2(point.y - _j239.y, point.x - _j239.x) + HALF_PI;
} else {
const _j239 = pathPoints[i - 1];
const _j194 = pathPoints[i + 1];
const _j271 = atan2(point.y - _j239.y, point.x - _j239.x);
const _j272 = atan2(_j194.y - point.y, _j194.x - point.x);
_j270 = ((_j271 + _j272) / 2) + HALF_PI;
}
const _j273 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j274 = _j252.thicknessRandoms[Math.min(i, _j252.thicknessRandoms.length - 1)];
const _j275 = thickness * _j273 * _j274;
_j268.push({
x: point.x + cos(_j270) * _j275 / 2,
y: point.y + sin(_j270) * _j275 / 2
});
_j269.push({
x: point.x - cos(_j270) * _j275 / 2,
y: point.y - sin(_j270) * _j275 / 2
});
}
for (let v of _j268) {
_j221.push(v);
}
for (let i = _j269.length - 1; i >= 0; i--) {
_j221.push(_j269[i]);
}
}
return {
type: 'lightning',
vertices: _j221
};
}
function _j16(size, seed) {
randomSeed(seed);
noiseSeed(seed);
let _j221 = [];
const _j245 = 3;
const _j246 = 75;
const _j247 = 8;
const _j248 = 800;
const _j218 = [];
const _j249 = crandom.random(1, 4);
const _j250 = floor(_j249);
size = size * 3;
for (let _j251 = 0; _j251 < _j245; _j251++) {
const _j252 = {
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
for (let step = 0; step < _j246; step++) {
const stepRandoms = {
stepVariation: crandom.random(0.7, 1.3),
subBranchRand: crandom.random(),
subBranchLengthRand: crandom.random(3, 8),
subBranchAngle: crandom.random(-PI / 3, PI / 3)
};
_j252.stepRandoms.push(stepRandoms);
}
for (let i = 0; i < _j248; i++) {
_j252.thicknessRandoms.push(crandom.random(0.9, 1.1));
}
_j218.push(_j252);
}
for (let _j251 = 0; _j251 < _j250; _j251++) {
const _j252 = _j218[_j251];
let branchAngle = _j252.branchAngle;
let branchOffsetX = _j252.branchOffsetX;
let branchOffsetY = _j252.branchOffsetY;
let _j253 = _j252.numLRand > 0.2 ? 1 : 5;
let _j254 = floor(_j252.numStepsRand) * _j253;
let stepSize = _j252.stepSize;
let noiseScale = _j252.noiseScale;
let noiseStrength = _j252.noiseStrength;
let thickness = _j252.thickness;
let pathPoints = [];
let _j255 = branchOffsetX;
let _j256 = branchOffsetY;
let _j257 = branchAngle;
pathPoints.push({
x: _j255,
y: _j256
});
for (let step = 0; step < _j254; step++) {
const stepRandoms = _j252.stepRandoms[step];
const t = step / _j254;
const _j258 = noise(step * noiseScale, seed * 0.01);
const _j259 = noise(step * noiseScale + 100, seed * 0.01);
const angleOffset = (_j258 - 0.5) * PI * noiseStrength;
_j257 += angleOffset;
const stepVariation = stepRandoms.stepVariation;
const _j260 = stepSize * stepVariation;
_j255 += cos(_j257) * _j260;
_j256 += sin(_j257) * _j260;
pathPoints.push({
x: _j255,
y: _j256
});
if (stepRandoms.subBranchRand < 0.1 && step > 3 && step < _j254 - 3) {
const _j261 = floor(stepRandoms.subBranchLengthRand);
const subBranchAngle = _j257 + stepRandoms.subBranchAngle;
let _j262 = _j255;
let _j263 = _j256;
for (let _j264 = 0; _j264 < _j261; _j264++) {
const _j265 = noise(step * noiseScale + _j264 * 0.5, seed * 0.01 + 200);
const _j266 = (_j265 - 0.5) * PI * 0.5;
const _j267 = subBranchAngle + _j266;
_j262 += cos(_j267) * stepSize * 0.6;
_j263 += sin(_j267) * stepSize * 0.6;
pathPoints.push({
x: _j262,
y: _j263
});
}
}
}
const _j268 = [];
const _j269 = [];
for (let i = 0; i < pathPoints.length; i++) {
const point = pathPoints[i];
let _j270;
if (i === 0) {
const _j194 = pathPoints[i + 1];
_j270 = atan2(_j194.y - point.y, _j194.x - point.x) + HALF_PI;
} else if (i === pathPoints.length - 1) {
const _j239 = pathPoints[i - 1];
_j270 = atan2(point.y - _j239.y, point.x - _j239.x) + HALF_PI;
} else {
const _j239 = pathPoints[i - 1];
const _j194 = pathPoints[i + 1];
const _j271 = atan2(point.y - _j239.y, point.x - _j239.x);
const _j272 = atan2(_j194.y - point.y, _j194.x - point.x);
_j270 = ((_j271 + _j272) / 2) + HALF_PI;
}
const _j273 = 0.5 + 0.5 * sin(i / pathPoints.length * PI);
const _j274 = _j252.thicknessRandoms[Math.min(i, _j252.thicknessRandoms.length - 1)];
const _j275 = thickness * _j273 * _j274;
_j268.push({
x: point.x + cos(_j270) * _j275 / 2,
y: point.y + sin(_j270) * _j275 / 2
});
_j269.push({
x: point.x - cos(_j270) * _j275 / 2,
y: point.y - sin(_j270) * _j275 / 2
});
}
for (let v of _j268) {
_j221.push(v);
}
for (let i = _j269.length - 1; i >= 0; i--) {
_j221.push(_j269[i]);
}
}
return {
type: 'lightning',
vertices: _j221
};
}
function _j17(_j1428, shapeData, px, py, r, g, b, alpha) {
_j1428.fill(r, g, b, alpha);
_j1428.noStroke();
const scale = 1 / _j469;
switch (shapeData.type) {
case 'polygon':
case 'blob':
case 'jagged':
case 'strip':
case 'lightning':
_j1428.beginShape();
for (let v of shapeData.vertices) {
_j1428.vertex(px + v.x * scale, py + v.y * scale);
}
_j1428.endShape(CLOSE);
break;
case 'cluster':
for (let circle of shapeData.circles) {
_j1428.ellipse(
px + circle.x * scale,
py + circle.y * scale,
circle.radius * 2 * scale,
circle.radius * 2 * scale
);
}
break;
}
}
function _j18(_j1429 = null, scanBounds = null, shapeType = null, _j1430 = null) {
let _j276 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j276 = crandom.getCount();
}
const w = _j1429 ? _j1429.width : width;
const h = _j1429 ? _j1429.height : height;
const d = _j1429 ? _j1429.pixelDensity() : pixelDensity();
const _j277 = 20;
const _j278 = 700;
const _j279 = 80;
let _j280 = canvasBackgroundColor[0];
let _j281 = canvasBackgroundColor[1];
let _j282 = canvasBackgroundColor[2];
let pixels = null;
let targetPoints = [];
const _j283 = _j1430 && _j1430.length > 0;
if (_j283) {
for (let i = 0; i < 10; i++) {
crandom.random(0, 1);
}
targetPoints = _j1430.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness || 0
}));
} else {
const _j284 = _j1429 || window;
_j284.loadPixels();
pixels = _j1429 ? _j1429.pixels : window.pixels;
let _j285 = [];
const step = 4;
let _j286 = _j277;
let _j287 = w - _j277;
let _j288 = _j277;
let _j289 = h - _j277;
for (let y = _j288; y < _j289; y += step) {
for (let x = _j286; x < _j287; x += step) {
let _j290 = 4 * ((y * d) * (w * d) + (x * d));
let r = pixels[_j290];
let g = pixels[_j290 + 1];
let b = pixels[_j290 + 2];
let a = pixels[_j290 + 3];
let brightness = r + g + b;
let _j291 = Math.abs(r - _j280) + Math.abs(g - _j281) + Math.abs(b - _j282);
if (a > 100 && brightness < _j278 && _j291 > _j279) {
if (scanBounds && scanBounds.minX !== undefined) {
if (x >= scanBounds.minX && x <= scanBounds.maxX &&
y >= scanBounds.minY && y <= scanBounds.maxY) {
_j285.push({
x: x,
y: y,
brightness: brightness
});
}
} else {
_j285.push({
x: x,
y: y,
brightness: brightness
});
}
}
}
}
if (_j285.length === 0) {
console.log('⚠️ 未找到任何筆刷繪製區域（沒有與背景色有明顯差異的深色點）');
return;
}
_j285.sort((a, b) => a.brightness - b.brightness);
if (_j285.length < 10) {
console.log(`⚠️ 符合條件的點不足 10 個（只有 ${_j285.length} 個），無法生成蟲咬效果`);
return;
}
let _j292 = [];
for (let i = 0; i < _j285.length; i++) {
_j292.push(i);
}
const _j293 = Math.floor(_j285.length * 0.5);
const _j294 = _j292.slice(0, Math.max(_j293, 10));
for (let i = 0; i < 10 && _j294.length > 0; i++) {
const _j295 = [];
let _j296 = 0;
for (let j = 0; j < _j294.length; j++) {
const _j297 = Math.pow(1 - (j / _j294.length), 2);
_j295.push(_j297);
_j296 += _j297;
}
let _j298 = crandom.random(0, _j296);
let _j299 = 0;
let _j300 = 0;
for (let j = 0; j < _j295.length; j++) {
_j300 += _j295[j];
if (_j298 <= _j300) {
_j299 = j;
break;
}
}
const _j301 = _j294.splice(_j299, 1)[0];
targetPoints.push(_j285[_j301]);
}
if (typeof _j582 !== 'undefined' && _j582 && typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.targetPoints = targetPoints.map(p => ({
x: p.x,
y: p.y,
brightness: p.brightness
}));
}
}
let _j302 = [];
const _j303 = 30;
const _j304 = 4;
let _j305 = 0;
const _j306 = 30;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j307 = [];
const _j218 = [];
const _j308 = [];
for (let _j309 = 0; _j309 < numBites; _j309++) {
const _j310 = [];
for (let _j311 = 0; _j311 < _j306; _j311++) {
_j310.push({
r: crandom.random(0, 1),
angle: crandom.random(0, TWO_PI),
angleOffset: crandom.random(-0.25, 0.25)
});
}
_j218.push(_j310);
_j308.push({
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
let _j312 = 0;
let _j313 = false;
let _j314, _j315, distance;
const _j310 = _j218[i];
const _j316 = _j308[i];
if (_j283) {
const _j220 = _j310[0];
let r = sqrt(_j220.r) * _j303;
let angle = _j220.angle + _j220.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j314 = Math.floor(target.x + offsetX);
_j315 = Math.floor(target.y + offsetY);
_j314 = constrain(_j314, _j277, w - _j277);
_j315 = constrain(_j315, _j277, h - _j277);
_j313 = true;
for (let _j317 of _j307) {
let dist = Math.sqrt(
Math.pow(_j314 - _j317.x, 2) +
Math.pow(_j315 - _j317.y, 2)
);
if (dist < _j304) {
_j313 = false;
break;
}
}
} else {
while (!_j313 && _j312 < _j306) {
const _j220 = _j310[_j312];
let r = sqrt(_j220.r) * _j303;
let angle = _j220.angle;
angle += _j220.angleOffset;
distance = r;
let offsetX = Math.cos(angle) * distance * 0;
let offsetY = Math.sin(angle) * distance * 0;
_j314 = Math.floor(target.x + offsetX);
_j315 = Math.floor(target.y + offsetY);
_j314 = constrain(_j314, _j277, w - _j277);
_j315 = constrain(_j315, _j277, h - _j277);
let _j301 = 4 * ((_j315 * d) * (w * d) + (_j314 * d));
let _j318 = pixels[_j301];
let _j319 = pixels[_j301 + 1];
let _j320 = pixels[_j301 + 2];
let _j321 = pixels[_j301 + 3];
let _j322 = _j318 + _j319 + _j320;
let _j323 = Math.abs(_j318 - _j280) + Math.abs(_j319 - _j281) + Math.abs(_j320 - _j282);
if (_j321 <= 100 || _j322 >= _j278 || _j323 <= _j279) {
_j313 = false;
_j312++;
if (_j312 >= _j306) {
_j305++;
}
continue;
}
_j313 = true;
for (let _j317 of _j307) {
let dist = Math.sqrt(
Math.pow(_j314 - _j317.x, 2) +
Math.pow(_j315 - _j317.y, 2)
);
if (dist < _j304) {
_j313 = false;
break;
}
}
_j312++;
}
}
let _j324 = (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0;
if (shapeType === 2) {
_j324 *= 1.3;
}
let _j325 = floor(target.x * 1000 + target.y * 333 + _j316.shapeSeedRand);
let _j326 = 0;
let _j327 = 0;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j326 = crandom.getCount();
}
let shapeData = _j11(target.x, target.y, _j324, _j325, shapeType);
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
_j327 = crandom.getCount();
if (!_j316.shapeRandomCount) {
_j316.shapeRandomCount = _j327 - _j326;
}
}
if (_j313) {
let r, g, b;
let _j328 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j328[0] < 0.2 && _j328[1] < 0.15 && _j328[2] < 0.1) {
r = Math.floor(38 + _j316.colorRand1 * (51 - 38));
g = Math.floor(31 + _j316.colorRand2 * (38 - 31));
b = Math.floor(20 + _j316.colorRand3 * (26 - 20));
} else {
r = 230 + _j316.colorRand1 * (255 - 230);
g = 160 + _j316.colorRand2 * (220 - 160);
b = 0;
}
let point = {
x: _j314,
y: _j315,
brightness: target.brightness,
r: r,
g: g,
b: b,
size: _j324,
shapeData: shapeData
};
_j307.push(point);
_j302.push(point);
}
}
}
_j216 = _j216.concat(_j302);
let _j329 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j302) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j329++;
let _j330 = point.size || 2.5;
let _j331 = map(_j330, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j331
});
}
let _j332 = boidSpawners.slice(-_j329);
if (_j329 > 0) {
let sizeMultipliers = _j332.map(s => s.boidSizeMultiplier);
let _j333 = Math.min(...sizeMultipliers);
let _j334 = Math.max(...sizeMultipliers);
let _j335 = (_j329 / _j302.length * 100).toFixed(1);
console.log(`🦋 創建了 ${_j329} 個 Boid Spawners (虫咬點的 ${_j335}%，節省效能)`);
console.log(`📏 Boid 大小倍数範圍: ${_j333.toFixed(2)} ~ ${_j334.toFixed(2)} (基於虫咬洞大小)`);
} else {
console.log(`🦋 沒有創建 Boid Spawners`);
}
}
if (_j302.length > 0) {
let _j336 = Infinity;
let _j337 = 0;
for (let point of _j302) {
let brightness = point.r + point.g + point.b;
_j336 = Math.min(_j336, brightness);
_j337 = Math.max(_j337, brightness);
}
if (_j305 > 0) {
console.log(`⚠️ 跳過了 ${_j305} 個不在筆墨區域的點`);
}
}
const _j338 = _j302.length;
if (_j338 > 0) {
_j100('system', '🐛 虫咬点生成完成', {
'虫咬点总数': _j338,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
if (typeof crandom !== 'undefined' && typeof crandom.getCount === 'function') {
const _j339 = crandom.getCount();
const _j340 = _j339 - _j276;
if (typeof _j590 !== 'undefined' && _j590 && typeof window !== 'undefined') {
const currentScanEvent = window.currentScanEvent;
if (currentScanEvent && currentScanEvent.recordedRandomCount !== undefined && currentScanEvent.recordedRandomCount !== null) {
const _j341 = currentScanEvent.recordedRandomCount;
const _j183 = _j340 - _j341;
const percent = _j341 > 0 ? ((_j183 / _j341) * 100).toFixed(2) + '%' : 'N/A';
const icon = Math.abs(_j183) < 50 ? '✅' : Math.abs(_j183) < 200 ? '⚠️' : '❌';
const action = currentScanEvent.action || 'scan';
const _j342 = currentScanEvent.shapeType !== null && currentScanEvent.shapeType !== undefined ?
`ShapeType:${currentScanEvent.shapeType}` : 'ShapeType:random';
const _j343 = typeof _j338 === 'number' ? ` | Points:${_j338}` : '';
console.log(`${icon} Scan [${action}] ${_j342} | 差異: ${_j183 > 0 ? '+' : ''}${_j183} (${percent})${_j343}`);
}
} else if (typeof _j582 !== 'undefined' && _j582) {
if (typeof window !== 'undefined' && window.currentScanEvent) {
window.currentScanEvent.recordedRandomCount = _j340;
}
}
}
}
function _j19(_j1431 = 10, shapeType = null) {
const _j277 = 20;
const w = width;
const h = height;
let targetPoints = [];
for (let i = 0; i < _j1431; i++) {
let x = crandom.random(_j277, w - _j277);
let y = crandom.random(_j277, h - _j277);
targetPoints.push({
x: x,
y: y,
brightness: 0
});
}
let _j302 = [];
const _j303 = 30;
const _j304 = 4;
for (let target of targetPoints) {
let numBites = int(crandom.random(2, 5));
let _j307 = [];
for (let i = 0; i < numBites; i++) {
let _j312 = 0;
let _j313 = false;
let _j314, _j315, distance;
while (!_j313 && _j312 < 30) {
let r = sqrt(crandom.random(0, 1)) * _j303;
let angle = crandom.random(0, TWO_PI);
angle += crandom.random(-0.25, 0.25);
distance = r;
let offsetX = Math.cos(angle) * distance;
let offsetY = Math.sin(angle) * distance;
_j314 = Math.floor(target.x + offsetX);
_j315 = Math.floor(target.y + offsetY);
_j314 = constrain(_j314, _j277, w - _j277);
_j315 = constrain(_j315, _j277, h - _j277);
_j313 = true;
for (let _j317 of _j307) {
let dist = Math.sqrt(
Math.pow(_j314 - _j317.x, 2) +
Math.pow(_j315 - _j317.y, 2)
);
if (dist < _j304) {
_j313 = false;
break;
}
}
_j312++;
}
if (_j313) {
let r, g, b;
let _j328 = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
if (_j328[0] < 0.2 && _j328[1] < 0.15 && _j328[2] < 0.1) {
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
let _j325 = floor(_j314 * 1000 + _j315 * 333 + crandom.random(0, 10000));
let shapeData = _j11(_j314, _j315, size, _j325, shapeType);
let point = {
x: _j314,
y: _j315,
brightness: 0,
r: r,
g: g,
b: b,
size: size,
shapeData: shapeData
};
_j307.push(point);
_j302.push(point);
}
}
}
_j216 = _j216.concat(_j302);
let _j329 = 0;
if (typeof boidSpawners !== 'undefined' && doBoids) {
for (let point of _j302) {
if (crandom.random(0, 1) > 0.2) {
continue;
}
_j329++;
let _j330 = point.size || 2.5;
let _j331 = map(_j330, 1.5, 6, 0.5, 1.5);
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
boidSizeMultiplier: _j331
});
}
}
if (_j302.length > 0) {
_j100('system', '🎲 随机虫咬点生成完成', {
'虫咬点总数': _j302.length,
'Boids功能': '已禁用'
});
}
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
function _j20(_j1432 = false) {
if (typeof window.bugsDataTexture === 'undefined' || !window.bugsDataTexture) {
window.bugsDataTexture = createGraphics(width, height, P2D);
window.bugsDataTexture.pixelDensity(_j469);
}
if (typeof window.bugsMaskTexture === 'undefined' || !window.bugsMaskTexture) {
window.bugsMaskTexture = createGraphics(width, height, P2D);
window.bugsMaskTexture.pixelDensity(_j469);
}
const _j344 = _j1432 ||
!window.bugsDataTextureCache ||
window.bugsDataTextureCache.pointCount !== _j216.length;
if (!_j344) {
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
window.bugsDataTexture.clear();
window.bugsDataTexture.noStroke();
window.bugsMaskTexture.clear();
window.bugsMaskTexture.noStroke();
for (let point of _j216) {
const px = point.x;
const py = point.y;
const _j345 = (point.size || 5) / _j469;
const _j346 = point.x / width;
const _j347 = point.y / height;
const size = (point.size || 5) / width;
const r = point.r || 255;
const g = point.g || 0;
const b = point.b || 0;
if (point.shapeData) {
_j17(window.bugsDataTexture, point.shapeData, px, py,
_j346 * 255, _j347 * 255, size * 255, 255);
_j17(window.bugsMaskTexture, point.shapeData, px, py, r, g, b, 255);
} else {
window.bugsDataTexture.fill(_j346 * 255, _j347 * 255, size * 255, 255);
window.bugsDataTexture.ellipse(px, py, _j345, _j345);
window.bugsMaskTexture.fill(r, g, b, 255);
window.bugsMaskTexture.ellipse(px, py, _j345, _j345);
}
}
const _j348 = {
pointCount: _j216.length,
timestamp: millis()
};
window.bugsDataTextureCache = _j348;
window.bugsMaskTextureCache = _j348;
return {
dataTexture: window.bugsDataTexture,
maskTexture: window.bugsMaskTexture
};
}
function _j21(_j284, _j1429) {
if (_j216.length === 0) {
return;
}
if (typeof window.metallicProgram === 'undefined' || !window.metallicProgram) {
console.warn('⚠️ Metallic shader 未加載');
return;
}
const _j349 = _j20();
let _j350 = _j349.dataTexture;
let _j351 = _j349.maskTexture;
_j284.begin();
clear();
shader(window.metallicProgram);
window.metallicProgram.setUniform('tex0', _j1429);
window.metallicProgram.setUniform('bugsMask', _j351);
window.metallicProgram.setUniform('bugsData', _j350);
window.metallicProgram.setUniform('time', millis());
window.metallicProgram.setUniform('resolution', [width * _j469, height * _j469]);
let strength = (typeof window.metallicStrength !== 'undefined') ? window.metallicStrength : 0.85;
let _j352 = (typeof window.metallicFlowSpeed !== 'undefined') ? window.metallicFlowSpeed : 1.0;
let _j353 = (typeof window.metallicSpecular !== 'undefined') ? window.metallicSpecular : 12.0;
let _j354 = (typeof window.metallicFresnel !== 'undefined') ? window.metallicFresnel : 0.5;
let _j355 = (typeof window.metallicLightX !== 'undefined') ? window.metallicLightX : 0.5;
let _j356 = (typeof window.metallicLightY !== 'undefined') ? window.metallicLightY : 0.3;
let tint = (typeof window.metallicTint !== 'undefined') ? window.metallicTint : [0.88, 0.72, 0.52];
window.metallicProgram.setUniform('metallicStrength', strength);
window.metallicProgram.setUniform('flowSpeed', _j352);
window.metallicProgram.setUniform('lightPos', [_j355, _j356]);
window.metallicProgram.setUniform('specularPower', _j353);
window.metallicProgram.setUniform('fresnelStrength', _j354);
window.metallicProgram.setUniform('metalTint', tint);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j284.end();
}
let _j357 = null;
let __lastGridParams = null;
function gridCommitPrev() {
if (__lastGridParams) {
_j357 = {
...__lastGridParams
};
}
}
window.gridCommitPrev = gridCommitPrev;
function _j22(cx, cy, _j463, _j464) {
push();
noFill();
stroke(0, 0, 0, 80);
strokeWeight(1);
const effCell = constrain(_j463 || 20, 2, 400) * 0.7;
let minX = Math.min(startX, cx);
let maxX = Math.max(startX, cx);
let minY = Math.min(startY, cy);
let maxY = Math.max(startY, cy);
if (typeof _j528 !== 'undefined' && _j528 !== null) {
if (_j528.minX < minX) minX = _j528.minX;
if (_j528.maxX > maxX) maxX = _j528.maxX;
if (_j528.minY < minY) minY = _j528.minY;
if (_j528.maxY > maxY) maxY = _j528.maxY;
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
const _j358 = effCell * 0.3;
const _j359 = (maxX - minX) + _j358 * 2;
const _j360 = (maxY - minY) + _j358 * 2;
const _j361 = (minX + maxX) * 0.5;
const _j362 = (minY + maxY) * 0.5;
let left = Math.max(0, Math.floor((minX - _j358) / effCell) * effCell);
let top = Math.max(0, Math.floor((minY - _j358) / effCell) * effCell);
const _j363 = Math.min(width, Math.ceil((maxX + _j358) / effCell) * effCell);
const _j364 = Math.min(height, Math.ceil((maxY + _j358) / effCell) * effCell);
let gridWidth = Math.max(effCell * 2, _j363 - left);
let gridHeight = Math.max(effCell * 2, _j364 - top);
const cols = Math.min(70, Math.max(1, Math.round(gridWidth / effCell)));
const rows = Math.min(70, Math.max(1, Math.round(gridHeight / effCell)));
left = constrain(left, 0, Math.max(0, width - gridWidth));
top = constrain(top, 0, Math.max(0, height - gridHeight));
const right = left + gridWidth;
const bottom = top + gridHeight;
if (_j357 && typeof _j590 !== 'undefined' && _j590) {
const pg = _j357;
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
if (_j464) {
stroke(255, 50, 50, 200);
} else {
stroke(0, 0, 150, 120);
}
rectMode(CORNER);
rect(left, top, gridWidth, gridHeight);
if (_j464) {
const _j365 = 12;
const _j366 = left + 8;
const _j367 = top + 8;
strokeWeight(2);
stroke(255, 50, 50, 255);
line(_j366 - _j365 / 2, _j367, _j366 + _j365 / 2, _j367);
line(_j366, _j367 - _j365 / 2, _j366, _j367 + _j365 / 2);
strokeWeight(1);
}
strokeWeight(0.5);
if (_j464) {
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
const _j368 = typeof maxUpdates === 'number' ? maxUpdates : 0;
const _j369 = typeof _j523 === 'number' ? _j523 : 0;
const _j370 = typeof brushDir === 'number' ? brushDir : 0;
const _j371 = ['原', '1X翻', '1Y翻', '1XY翻'];
const _j372 = _j371[_j370] || '?';
const countdownText = `Max: ${_j368} | Count: ${_j369} | Dir: ${_j370}(${_j372})`;
textAlign(LEFT, TOP);
text(countdownText, left, top - 12);
const _j373 = typeof _j524 === 'number' ? _j524 : 0;
const _j374 = typeof brushMode === 'number' ? brushMode : 0;
const _j375 = (typeof _j494 === 'number' && _j494 > 0) ? _j494 : (typeof _j510 === 'number' ? _j510 : effCell);
const _j376 = (typeof phasorVel === 'number') ? phasorVel : '';
const _j377 = `C: ${_j373} | B: ${_j374} | S: ${_j375.toFixed(1)} | P: ${_j376}`;
const _j378 = left;
const _j379 = Math.min(height - 18, bottom + 6);
textAlign(LEFT, TOP);
text(_j377, _j378, _j379);
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
function _j23(_j1428) {
const _j380 = typeof _j1428.begin === 'function';
if (_j380) _j1428.begin();
const g = _j380 ? window : _j1428;
g.push();
g.translate(-hw, -hh);
if (pathPoints.length > 1) {
const _j381 = 5;
const _j382 = 5;
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
_j857 = true;
_j831 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j383 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j383;
let dy = (y2 - y1) / _j383;
let _j384 = 0;
while (_j384 < _j383) {
let _j385 = _j857 ? _j381 : _j382;
let _j386 = min(_j385 - _j831, _j383 - _j384);
if (_j857) {
let startX = x1 + dx * _j384;
let startY = y1 + dy * _j384;
let _j387 = x1 + dx * (_j384 + _j386);
let _j388 = y1 + dy * (_j384 + _j386);
g.line(startX, startY, _j387, _j388);
}
_j384 += _j386;
_j831 += _j386;
if (_j831 >= (_j857 ? _j381 : _j382)) {
_j857 = !_j857;
_j831 = 0;
}
}
}
}
g.noFill();
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(startX, startY, 10, 10);
if (pathPoints.length > 0) {
let _j389 = pathPoints[pathPoints.length - 1];
g.stroke(0, 0, 0, 255);
g.strokeWeight(1);
g.ellipse(_j389.x, _j389.y, 10, 10);
}
g.pop();
if (_j380) _j1428.end();
}
function _j24() {
if ((!_j590 || isWaitingToLoop) && _j604 !== null && doMoving) {
const _j390 = easycamInitialCenter || [0, 0, 0];
const _j391 = PI / 3;
const _j392 = height / (2 * tan(_j391 / 2));
const _j393 = easycamInitialDistance > 0 ? easycamInitialDistance : _j392;
const _j394 = _j604.getCenter();
const _j395 = _j604.getDistance();
const _j396 = 0.1;
const _j397 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j394[0] - _j390[0], 2) +
Math.pow(_j394[1] - _j390[1], 2) +
Math.pow(_j394[2] - _j390[2], 2)
);
const distanceDiff = Math.abs(_j395 - _j393);
if (!_j617 && (centerDiff > _j396 || distanceDiff > _j397)) {
_j617 = true;
_j618 = millis();
_j615 = [_j394[0], _j394[1], _j394[2]];
_j619 = _j395;
_j616 = _j390;
_j620 = _j393;
}
if (_j617) {
const _j398 = millis() - _j618;
const _j399 = Math.min(_j398 / _j621, 1.0);
const _j400 = [
lerp(_j615[0], _j616[0], _j399),
lerp(_j615[1], _j616[1], _j399),
lerp(_j615[2], _j616[2], _j399)
];
const _j401 = lerp(_j619, _j620, _j399);
_j604.setCenter(_j400, 0);
_j604.setDistance(_j401, 0);
if (_j399 >= 1.0) {
const _j402 = _j604.getCenter();
const _j403 = _j604.getDistance();
const _j404 = Math.sqrt(
Math.pow(_j402[0] - _j390[0], 2) +
Math.pow(_j402[1] - _j390[1], 2) +
Math.pow(_j402[2] - _j390[2], 2)
);
const _j405 = Math.abs(_j403 - _j393);
if (_j404 > _j396 || _j405 > _j397) {
_j604.setCenter(_j390, 0);
_j604.setDistance(_j393, 0);
}
_j617 = false;
}
}
}
}
function updateEasyCamAutoTracking() {
if (_j590 && !isWaitingToLoop && doMoving && _j605 && _j604 !== null && _j606 && !_j617) {
const _j406 = _j594;
const _j407 = _j595;
const _j408 = _j406 - hw;
const _j409 = -(_j407 - hh);
const _j394 = _j604.getCenter();
const _j255 = _j394[0];
const _j256 = _j394[1];
const _j395 = _j604.getDistance();
const _j391 = PI / 3;
const _j410 = height / (2 * tan(_j391 / 2));
const _j411 = 1.1;
let _j412 = 1.4;
const _j304 = _j410 / _j412;
const _j413 = _j410 / _j411;
const _j414 = _j410 / _j395;
const _j415 = 0.01;
if (_j612) {
const _j416 = _j412;
const _j417 = _j410 / _j416;
const distanceDiff = _j417 - _j395;
const _j418 = _j608;
const _j419 = _j395 + distanceDiff * _j418;
const _j420 = constrain(_j419, _j304, _j413);
_j604.setDistance(_j420, 0);
} else {
const _j417 = _j410 / _j411;
const distanceDiff = _j417 - _j395;
const _j418 = _j608;
const _j419 = _j395 + distanceDiff * _j418;
const _j420 = constrain(_j419, _j304, _j413);
_j604.setDistance(_j420, 0);
}
const _j421 = _j604.getDistance();
const _j422 = _j410 / _j421;
let _j423 = 0;
let _j424 = 0;
if (_j422 > _j411) {
_j423 = (_j422 - _j411) * (width / 2);
_j424 = (_j422 - _j411) * (height / 2);
}
let offsetX = _j408 - _j255;
let offsetY = _j409 - _j256;
if (_j423 > 0 || _j424 > 0) {
const _j425 = constrain(_j408, -_j423, _j423);
const _j426 = constrain(_j409, -_j424, _j424);
offsetX = _j425 - _j255;
offsetY = _j426 - _j256;
} else {
offsetX = -_j255;
offsetY = -_j256;
}
const _j427 = _j607;
const _j314 = _j255 + offsetX * _j427;
const _j315 = _j256 + offsetY * _j427;
let _j428 = _j314;
let _j429 = _j315;
if (_j423 > 0 || _j424 > 0) {
_j428 = constrain(_j314, -_j423, _j423);
_j429 = constrain(_j315, -_j424, _j424);
} else {
_j428 = 0;
_j429 = 0;
}
_j604.setCenter([_j428, _j429, 0], 0);
}
}
function _j25() {
if (typeof Dw === 'undefined' || typeof Dw.EasyCam === 'undefined') {
console.warn('⚠️ EasyCam library not loaded');
_j605 = false;
return;
}
if (_j604 !== null) {
_j605 = true;
return;
}
try {
const _j430 = _renderer;
if (!_j430) {
console.error('❌ WEBGL renderer not found');
_j605 = false;
return;
}
const _j391 = PI / 3;
const _j410 = height / (2 * tan(_j391 / 2));
_j604 = new Dw.EasyCam(_j430, {
distance: _j410,
center: [0, 0, 0],
rotation: [1, 0, 0, 0],
viewport: [0, 0, width, height],
});
_j604.setRotationConstraint(0, 0, 0);
_j604.setRotationScale(0);
_j613 = _j410 / 2.5;
_j614 = _j410 / 1.0;
_j604.setDistanceMin(_j613);
_j604.setDistanceMax(_j614);
document.oncontextmenu = function() {
return false;
};
_j605 = true;
_j100('system', '🎥 EasyCam initialized', {
Status: 'Auto camera tracking ready',
Controls: 'Camera automatically follows grid center during playback'
});
} catch (error) {
console.error('❌ Failed to initialize EasyCam:', error);
_j605 = false;
_j604 = null;
}
}
function applyCameraProjection() {
const _j431 = doMoving && _j605 && _j604 !== null && _j590 && _j606;
if (_j431) {
const _j432 = PI / 3;
const _j433 = 0.1;
const _j434 = 10000;
perspective(_j432, width / height, _j433, _j434);
push();
} else {
const _j435 = PI / 3;
const _j436 = 0.1;
const _j437 = 10000;
perspective(_j435, width / height, _j436, _j437);
}
}
let _j438 = null;
let _j439 = null;
let _j440 = 0,
_j441 = 0,
_j442 = 0;
let _j443 = {
feedback: {},
composite: {},
realtime: {}
};
function _j26(_j1433, _j1434, name, value) {
const _j444 = _j443[_j1434];
if (_j444[name] === value) return;
_j444[name] = value;
_j1433.setUniform(name, value);
}
function _j27() {
if (_j440 !== width || _j441 !== height || _j442 !== _j469) {
_j438 = [0, 0, width * _j469, height * _j469];
_j439 = [1.0 / (width * _j469), 1.0 / (height * _j469)];
_j440 = width;
_j441 = height;
_j442 = _j469;
}
if (_j438 === null) {
_j438 = [0, 0, width * _j469, height * _j469];
_j439 = [1.0 / (width * _j469), 1.0 / (height * _j469)];
}
}
function _j28(_j1428, _j1435 = 1.0) {
if (_j546) {
_j522 = true;
return;
}
if (window._fxDebug) window._fxDebug.feedbackFrames++;
_j575.begin();
resetShader();
blendMode(BLEND);
imageMode(CENTER);
rectMode(CENTER);
shader(_j472);
const _j445 = brushColorMode === 1 ? 1.0 : 0.0;
_j27();
_j472.setUniform("rect", _j438);
_j472.setUniform("invResolution", _j439);
_j472.setUniform("tex0", _j1428);
_j26(_j472, 'feedback', "brushMode", brushMode * 1.0);
_j472.setUniform("forceMap", _j470);
_j26(_j472, 'feedback', "baseBrushSize", baseBrushSize);
_j472.setUniform("force", _j1435);
_j26(_j472, 'feedback', "useSharpen", useSharpen);
_j26(_j472, 'feedback', "effect3Brightness", effect3Brightness);
_j26(_j472, 'feedback', "indiffusionStrength", indiffusionStrength);
_j26(_j472, 'feedback', "brushColorMode", float(brushColorMode));
_j26(_j472, 'feedback', "brushCategory", _j445);
const _j446 = typeof _j526 !== 'undefined' ? _j526 : 0;
const _j447 = (_j524 + _j446) % 40;
const _j448 = _j524 + _j446;
_j472.setUniform("mouseCount", float(_j447));
_j472.setUniform("mouseCountAccumulated", float(_j448));
_j472.setUniform("strokeSeed", float(strokeSeed));
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j575.end();
_j1428.begin();
imageMode(CENTER);
blendMode(BLEND);
image(_j575, 0, 0, width, height);
_j1428.end();
_j522 = true;
}
function _j29() {
if (typeof _j577 === 'undefined' || !_j577) {
return;
}
const _j449 = canvasBackgroundColor;
let _j450 = _j9(40, 20, 15, 0.2);
const _j451 = min(255, _j449[0] * 1.1);
const _j452 = min(255, _j449[1] * 1.1);
const _j453 = min(255, _j449[2] * 1.1);
_j577.begin();
clear();
blendMode(BLEND);
noStroke();
fill(_j451, _j452, _j453);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j450, -width / 2, -height / 2, width, height);
_j577.end();
_j450.remove();
}
function _j30() {
const _j449 = canvasBackgroundColor;
if (typeof _j578 !== 'undefined' && _j578) {
_j578.begin();
background(_j449[0], _j449[1], _j449[2]);
_j578.end();
}
_j29();
if (typeof _j522 !== 'undefined') {
_j522 = true;
}
}
function updateCompositeBuffer() {
const _j454 = _j522 || _j511 || _j512 || _j590 || _j633;
if (_j454) {
_j574.begin();
clear();
shader(_j475);
_j27();
_j475.setUniform("rect", _j438);
_j475.setUniform("baseTex", showPaperTexture ? _j577 : _j578);
_j475.setUniform("encodedTex", _j570);
_j475.setUniform("typeMapTex", _j581);
_j475.setUniform("oldTex", _j568);
_j26(_j475, 'composite', "brushColorMode", float(brushColorMode));
_j26(_j475, 'composite', "whiteMaxOpacity", _j480);
_j26(_j475, 'composite', "hueShift", _j481);
_j26(_j475, 'composite', "satShift", _j482);
_j26(_j475, 'composite', "briShift", _j483);
_j26(_j475, 'composite', "brushCategory", brushColorMode === 1 ? 1.0 : 0.0);
_j26(_j475, 'composite', "useSharpen", useSharpen);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j574.end();
if (_j511 || _j512) {
_j579.begin();
clear();
imageMode(CENTER);
image(_j574, 0, 0, width, height);
_j579.end();
_j574.begin();
shader(_j473);
const _j455 = brushColorMode === 1 ? 1.0 : 0.0;
_j27();
_j473.setUniform("rect", _j438);
_j473.setUniform("baseTex", _j579);
_j473.setUniform("addTex", _j571);
_j473.setUniform("encodedTex", _j570);
_j26(_j473, 'realtime', "brushColorMode", float(brushColorMode));
_j26(_j473, 'realtime', "whiteMaxOpacity", _j480);
_j26(_j473, 'realtime', "hueShift", _j481);
_j26(_j473, 'realtime', "satShift", _j482);
_j26(_j473, 'realtime', "briShift", _j483);
_j26(_j473, 'realtime', "brushCategory", _j455);
_j26(_j473, 'realtime', "useSharpen", useSharpen);
let _j456;
if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j456 = [customBrushColor[0] / 255, customBrushColor[1] / 255, customBrushColor[2] / 255];
} else {
const color = _j198[brushColorMode] || _j198[0];
_j456 = [color.rgb[0] / 255, color.rgb[1] / 255, color.rgb[2] / 255];
}
_j473.setUniform("brushColor", _j456);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j574.end();
}
_j522 = _j511 || _j512 || _j590 || _j633;
}
}
if (typeof window !== 'undefined') {
window.blurBuffersInitialized = window.blurBuffersInitialized || false;
}
function _j31() {
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
const _j457 = (_j511 || _j512) && _j523 < maxUpdates && _j529;
const _j458 = !_j590 || showFuturePathPreview;
const _j459 = _j457 && showGridOverlay;
if (_j457) {
_j576.begin();
clear();
push();
translate(-hw, -hh);
const _j460 = -10;
translate(_j460, _j460);
if (_j459) {
const _j461 = _j590 ? _j594 : _j506;
const _j462 = _j590 ? _j595 : _j507;
const cx = (_j508 || _j508 === 0) ? _j508 : _j461;
const cy = (_j509 || _j509 === 0) ? _j509 : _j462;
const _j463 = _j510;
const _j464 = typeof _j547 !== 'undefined' && _j547;
_j22(cx, cy, _j463, _j464);
}
if (pathPoints.length > 1 && _j458) {
const _j381 = 5;
const _j382 = 5;
stroke(255, 0, 0, 255);
strokeWeight(1);
_j857 = true;
_j831 = 0;
for (let i = 0; i < pathPoints.length - 1; i++) {
let x1 = pathPoints[i].x;
let y1 = pathPoints[i].y;
let x2 = pathPoints[i + 1].x;
let y2 = pathPoints[i + 1].y;
let _j383 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j383;
let dy = (y2 - y1) / _j383;
let _j384 = 0;
while (_j384 < _j383) {
let _j385 = _j857 ? _j381 : _j382;
let _j386 = min(_j385 - _j831, _j383 - _j384);
if (_j857) {
let startX = x1 + dx * _j384;
let startY = y1 + dy * _j384;
let _j387 = x1 + dx * (_j384 + _j386);
let _j388 = y1 + dy * (_j384 + _j386);
line(startX, startY, _j387, _j388);
}
_j384 += _j386;
_j831 += _j386;
if (_j831 >= (_j857 ? _j381 : _j382)) {
_j857 = !_j857;
_j831 = 0;
}
}
}
}
if (_j458) {
noFill();
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(startX, startY, 0, 10);
const _j465 = _j590 ? _j594 : _j506;
const _j466 = _j590 ? _j595 : _j507;
stroke(255, 0, 0, 255);
strokeWeight(1);
ellipse(_j465, _j466, 10, 10);
}
pop();
_j576.end();
}
}
let _j467 = window._demoCanvasWidth || 900,
_j468 = window._demoCanvasHeight || 900,
hw, hh, _j469 = 1.6;
let _j470, font, lastFrameTime = 0;
let canvasBackgroundColor = window._demoCanvasBgColor || [222, 222, 222];
var showPaperTexture = false,
showGridOverlay = true,
showFuturePathPreview = false;
let _j471, _j472, _j473, _j474, _j475, _j476;
let _j477;
let _j478;
const _j198 = _j2();
let colorIndex = 0,
_j479 = 0;
let brushColorMode = 0,
whiteBrushMode = false,
_j480 = 0.95;
let _j481 = 0.0,
_j482 = 0.0,
_j483 = 0.0;
let customBrushColor = [26, 26, 26];
let _j484, _j485, _j486, _j487, _j488;
let _j489, _j490, _j491, _j492, _j493, brushDir = 0;
let initialSize = 0,
spraySize = 0,
_j494 = 0,
_j495 = 2,
_j496 = 0;
let brushMode = 1,
_j497 = 'large',
baseBrushSize = 2.0,
brushModeSP = false;
let shapeType = 0,
useSharpen = 0.0,
_j498 = 0.0,
keyBlendMode = 0;
let phasorVel = 1,
targetflyBrushType, targetmainStrokeDir;
let penSketchNoiseBase = 0.5,
penSketchStrokeWeight = 0.8;
let brushPaintCtlNoisebyFrame = 0.5,
brushPaintInterpolationOffset = 0,
brushPaintOldRInitial = 0.5;
let _j499 = [];
let x, y, _j408, _j409, _j500, _j501, _j502, _j503 = 0,
_j504 = 0;
let _j505;
let _j506 = 0,
_j507 = 0,
_j508 = 0,
_j509 = 0,
_j510 = 20;
let _j511 = false,
_j512 = false,
_j513 = false,
_j514 = false;
let _j515 = true;
let _j516 = 1.0,
_j517 = false,
_j518 = 0.0;
let _j519 = null;
let _j520 = false,
_j521 = false,
_j522 = true;
let _j523 = 0,
maxUpdates = 10,
force = 1.0;
let _j524 = 0,
_j525 = 0,
_j526 = 0;
var doMoving = false,
_j527 = false;
let pathPoints = [],
_j528 = null,
startX = 0,
startY = 0,
_j529 = false;
let _j530 = 1,
pathRotation = 20;
let randStep = 1,
_j531 = 10,
expectedStrokeLength = 100;
let _j532 = [],
_j533 = 0,
_j534 = 100;
let ctlNoise = 1.0,
explodeStart = 0,
explodeEnd = 0;
let drawingSeed = 0,
indiffusionStrength = 0.3;
let seed = 1234567890,
strokeSeed = 1234567890,
_j535;
var currentStrokeHighlight = null;
let _j536 = {
lastEventIndex: -1,
cachedStrokes: [],
lastUpdateTime: 0,
updateInterval: 100
};
let distortDisplacementB = 20.0,
distortDisplacementC = 100.0,
distortShowFbmMask = 0.0;
let _j537 = 140.0,
_j538 = 0.5,
_j539 = 1.0,
_j540 = 0.5,
_j541 = 60.0;
let cellularEnabled = false,
_j542 = 15.0,
_j543 = 0.5;
let whiteDotEnabled = false,
_j544 = 0.01;
let grainEnabled = false,
_j545 = 0.03;
var rsEnabled = false,
distortShaderEnabled = false,
_j546 = false;
let _j547 = false;
let _j548 = 0;
let _j549 = 0;
let _j550 = 0;
let _j551 = 50;
let _j552 = 0;
var flowEffectStrokeBounds = null;
let _j553 = false;
let _j554 = null;
let _j555 = 0;
var _j556 = 0;
var _j557 = 0;
let _j558 = false;
const _j559 = 3;
var _j560 = {
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
var _j561 = false;
let _j562 = [0, 0, 0, 0],
_j563 = [0, 0, 0],
_j564 = [0, 0, 0],
_j565 = [0, 0, 0];
let _j566 = [0, 0],
_j567 = [0, 0],
effect3Brightness = 0.2;
let _j568, _j569, _j570, _j571, _j572, _j573, _j574;
let _j575, _j576, _j577, _j578;
let _j579;
let _j580;
let _j581;
let _j582 = false,
_j583 = 0,
_j584 = null,
_j585 = 0;
let _j586 = 0,
_j587 = 0,
_j588 = true,
_j589 = 0;
let recordingData = {
version: "1.0",
startTime: 0,
events: [],
strokes: []
};
let _j590 = false,
_j591 = 0,
_j592 = 0,
_j593 = 1.0;
let _j594 = 0,
_j595 = 0,
_j596 = 0,
_j597 = 0;
let _j598 = false,
isWaitingToLoop = false,
_j599 = 0;
let _j600 = 0,
_j601 = false;
let _j602 = 0,
_j603 = 0;
let _j604 = null,
_j605 = false,
_j606 = false;
let _j607 = 0.05,
_j608 = 0.05;
let _j609 = 0,
_j610 = 0;
let _j611 = 1,
_j612 = false;
let _j613 = 0,
_j614 = 0,
easycamInitialDistance = 0;
let easycamInitialCenter = [0, 0, 0],
_j615 = [0, 0, 0],
_j616 = [0, 0, 0];
let _j617 = false,
_j618 = 0,
_j619 = 0,
_j620 = 0,
_j621 = 1000;
let _j622 = false,
_j623 = 0;
let _j624 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j625 = {
0: 0,
40: 40,
80: 80,
120: 120
},
_j626 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j627 = {
0: 0,
40: 0,
80: 0,
120: 0
},
_j628 = {
0: 0,
40: 0,
80: 0,
120: 0
};
let _j629 = 0,
_j630 = 300;
let _j631 = false,
_j632 = false;
let _j633 = false,
_j634 = 0,
frameCount = 0,
_j635 = [];
let _j636 = 1,
_j637 = 0.8;
let _j638 = true,
_j639 = [],
_j640 = 100,
isDragging = false;
let _j641 = {
x: 0,
y: 0
},
_j642 = {
x: 85,
y: 50
};
let _j643 = false,
_j644 = {
x: 0,
y: 0
},
_j645 = {
x: 15,
y: 50
},
_j646 = true;
let _j647 = false,
_j648 = {
x: 0,
y: 0
},
_j649 = {
x: 85,
y: 70
},
_j650 = true;
let _j651 = false,
_j652 = {
x: 0,
y: 0
},
_j653 = {
x: 85,
y: 40
},
_j654 = true;
let _j655 = 10;
var screenText = false,
_j656 = [],
_j657 = 30,
_j658 = 0;
let _j659 = 25,
_j660 = 30,
_j661 = 16,
_j662 = 200,
_j663 = 200;
let _j664 = false,
_j665 = 0,
pendingBugBounds = null;
let pendingEffectControlScanQueue = [];
function preload() {
font = loadFont('./lib/inconsolata.otf');
_j472 = _j1('./shaders/base.vert', './shaders/feedback.frag');
_j473 = _j1('./shaders/base.vert', './shaders/realtime.frag');
_j471 = _j1('./shaders/base.vert', './shaders/mapFrag.frag');
if (typeof doEffect === 'undefined' || doEffect !== false) {
_j476 = _j1('./shaders/base.vert', './shaders/distort.frag');
}
try {
window.metallicProgram = _j1('./shaders/base.vert', './shaders/metallic.frag');
} catch (e) {
console.warn('⚠️ Metallic shader 加載失敗:', e);
}
try {
_j478 = _j1('./shaders/base.vert', './shaders/flow.frag');
} catch (e) {
console.warn('⚠️ Flow shader 加載失敗:', e);
}
_j152();
if (doDemo) {
_j160('🎬 Loading Demo Recording');
if (window._preloadedDemo && window._preloadedDemo.events && window._preloadedDemo.events.length > 0) {
_j535 = window._preloadedDemo;
recordingData = _j535;
window._pendingAutoPlay = true;
} else {
var _j666 = './lib/demo.json';
var _j667 = window.location.hash.replace('#', '');
if (/^[1-9]\d*$/.test(_j667)) {
_j666 = './lib/' + _j667 + '.json';
}
fetch(_j666)
.then(_j1456 => {
if (!_j1456.ok) throw new Error('HTTP ' + _j1456.status);
return _j1456.json();
})
.then(data => {
_j535 = data;
if (_j535 && _j535.events && _j535.events.length > 0) {
recordingData = _j535;
if (window._setupComplete) {
startPlayback();
} else {
window._pendingAutoPlay = true;
}
}
})
.catch(error => {
_j100('system', '❌ Failed to load ' + _j666, {
Error: error.message,
Status: 'Error'
});
});
}
}
const _j668 = sessionStorage.getItem('pendingLoadedRecordingData');
const _j669 = sessionStorage.getItem('pendingLoadedRecordingFileName');
if (_j668) {
try {
const loadedData = JSON.parse(_j668);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
if (typeof window !== 'undefined') {
window.loadedRecordingData = loadedData;
window.loadedRecordingFileName = _j669 || 'Unknown';
}
}
} catch (error) {
console.warn('⚠️ Failed to restore loaded recording data:', error);
}
}
const _j670 = sessionStorage.getItem('pendingRecordingData');
const _j671 = sessionStorage.getItem('shouldAutoPlay');
if (_j670 && _j671 === 'true') {
try {
const loadedData = JSON.parse(_j670);
if (loadedData && loadedData.events && loadedData.events.length > 0) {
recordingData = loadedData;
sessionStorage.removeItem('pendingRecordingData');
sessionStorage.removeItem('shouldAutoPlay');
_j160('📂 Recording Data Restored After Reload');
_j100('system', '✅ Canvas size restored and recording loaded', {
CanvasSize: `${width}x${height}`,
Events: `${recordingData.events.length} events`
});
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
_j100('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
window._pendingAutoPlay = true;
}
} catch (error) {
_j100('system', '❌ Failed to restore recording data', {
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
const _j672 = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const _j673 = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent || '') && !/iPad/i.test(navigator.userAgent || '');
const _j674 = (window.location.search || '').match(/_pix:([\d.]+)/);
if (_j674) {
const _j675 = parseFloat(_j674[1]);
if (!isNaN(_j675) && _j675 >= 0.5 && _j675 <= 5) {
_j469 = _j675;
_j100('system', '🔗 Pixel density from URL', {
Value: _j675
});
}
} else if (window.APP_MODE === 'collector') {
_j469 = 2;
_j100('system', '🎨 Collector mode default pixel density', {
Value: 2
});
} else if (_j672) {
const _j676 = 1.0;
if (_j469 > _j676) {
_j469 = _j676;
_j100('system', '📱 Mobile pixel density override', {
Value: _j676,
Mode: window.APP_MODE || 'artist'
});
}
}
const _j677 = sessionStorage.getItem('pendingPixelDensity');
if (_j677 && !_j672 && !_j674) {
const _j678 = parseInt(_j677);
if (!isNaN(_j678) && _j678 >= 1 && _j678 <= 5) {
_j469 = _j678;
sessionStorage.removeItem('pendingPixelDensity');
_j100('system', '🔄 Restoring pixel density from session', {
Value: _j678,
Status: 'Canvas will be created with new pixel density'
});
}
}
pixelDensity(_j469);
const _j679 = sessionStorage.getItem('pendingCanvasWidth');
const _j680 = sessionStorage.getItem('pendingCanvasHeight');
let _j681 = false;
if (_j679 && _j680) {
_j467 = parseInt(_j679);
_j468 = parseInt(_j680);
_j681 = true;
sessionStorage.removeItem('pendingCanvasWidth');
sessionStorage.removeItem('pendingCanvasHeight');
_j100('system', '🔄 Restoring canvas size from recording', {
Width: `${_j467}px`,
Height: `${_j468}px`
});
}
let _j682 = false,
_j683 = false;
(function() {
var qs = window.location.search;
if (!qs) return;
var _j684 = qs.substring(1).split('_');
for (var i = 0; i < _j684.length; i++) {
var ci = _j684[i].indexOf(':');
if (ci === -1) continue;
var k = _j684[i].substring(0, ci), v = parseInt(_j684[i].substring(ci + 1));
if (k === 'w' && v > 0) {
_j467 = v;
_j682 = true;
}
if (k === 'h' && v > 0) {
_j468 = v;
_j683 = true;
}
}
})();
if (_j673 && window.APP_MODE === 'artist' && !_j681) {
if (!_j682) _j467 = 380;
if (!_j683) _j468 = 600;
if (!_j682 || !_j683) {
_j100('system', '📱 Mobile phone default canvas size', {
Width: `${_j467}px`,
Height: `${_j468}px`
});
}
}
const _j685 = sessionStorage.getItem('pendingCanvasBackgroundColor');
if (_j685) {
try {
const _j449 = JSON.parse(_j685);
if (Array.isArray(_j449) && _j449.length === 3) {
canvasBackgroundColor[0] = _j449[0];
canvasBackgroundColor[1] = _j449[1];
canvasBackgroundColor[2] = _j449[2];
sessionStorage.removeItem('pendingCanvasBackgroundColor');
_j100('system', '🔄 Restoring canvas background color from recording', {
RGB: `(${_j449[0]}, ${_j449[1]}, ${_j449[2]})`
});
}
} catch (error) {
console.warn('Failed to restore canvas background color:', error);
sessionStorage.removeItem('pendingCanvasBackgroundColor');
}
}
createCanvas(_j467, _j468, WEBGL);
if (_j515) {
const _j686 = document.querySelector('canvas');
if (_j686) {
const _j687 = document.getElementById('zen-mode-btn');
const _j688 = (pressure) => {
if (!_j687) return;
if (pressure <= 0) {
_j687.style.background = 'rgba(0, 0, 0, 0.08)';
} else {
const r = Math.round(pressure * 255);
const a = Math.max(0.2, pressure);
_j687.style.background = `rgba(${r}, 0, 0, ${a})`;
}
};
const _j689 = (e) => {
if (e.pointerType === 'pen' && e.pressure > 0) {
if (!_j517) {
_j517 = true;
_j100('system', '🖊️ Stylus pressure detected (pointer)', { pressure: e.pressure });
}
_j518 = e.pressure;
_j516 = Math.min(e.pressure / 0.3, 1.0);
_j688(e.pressure);
}
};
_j686.addEventListener('pointerdown', _j689);
_j686.addEventListener('pointermove', _j689);
_j686.addEventListener('pointerup', (e) => {
if (e.pointerType === 'pen' || _j517) {
_j518 = 0.0;
_j516 = -1;
_j688(0);
}
});
const _j690 = (e) => {
if (e.touches && e.touches.length > 0) {
const t = e.touches[0];
const _j691 = t.touchType === 'stylus';
if (_j691 && t.force > 0) {
const _j692 = Math.min(t.force, 1.0);
if (!_j517) {
_j517 = true;
_j100('system', '🖊️ Stylus force detected', { force: t.force });
}
_j518 = _j692;
_j516 = Math.min(_j692 / 0.3, 1.0);
_j688(_j692);
}
}
};
_j686.addEventListener('touchstart', _j690, { passive: true });
_j686.addEventListener('touchmove', _j690, { passive: true });
_j686.addEventListener('touchend', () => {
if (_j517) {
_j518 = 0.0;
_j516 = -1;
_j688(0);
}
}, { passive: true });
}
}
_j470 = createFramebuffer({
density: _j469
});
window.metallicStrength = 0.85;
window.metallicFlowSpeed = 1.0;
window.metallicSpecular = 12.0;
window.metallicFresnel = 0.5;
window.bugsSize = 10.0;
window.metallicLightX = 0.5;
window.metallicLightY = 0.3;
window.metallicTint = [0.72, 0.50, 0.35];
if (typeof _j98 === 'function') _j98();
if (typeof _j96 === 'function') _j96();
_j135();
_j127();
if (typeof window.scheduleMobilePhoneZenMode === 'function') {
window.scheduleMobilePhoneZenMode();
}
if (typeof _j126 === 'function') {
_j126();
}
_j43();
window.addEventListener('resize', function() {
setTimeout(_j43, 100);
});
_j160('Interactive Generative Art System');
_j568 = createFramebuffer({
density: _j469
});
_j568.begin();
background(255);
_j568.end();
_j569 = createGraphics(width, height, WEBGL);
_j569.noStroke();
_j569.pixelDensity(_j469);;
_j569.clear();
_j570 = createFramebuffer({
density: _j469
});
_j570.begin();
background(255);
_j570.end();
_j571 = createFramebuffer({
density: _j469
});
_j571.begin();
background(255);
_j571.end();
_j572 = createFramebuffer({
density: _j469
});
_j573 = createGraphics(width, height, WEBGL);
_j573.noStroke();
_j573.pixelDensity(_j469);;
_j573.clear();
_j577 = createFramebuffer({
density: _j469
});
let _j450 = _j9(40, 20, 15, 0.2);
const _j451 = min(255, canvasBackgroundColor[0] * 1.1);
const _j452 = min(255, canvasBackgroundColor[1] * 1.1);
const _j453 = min(255, canvasBackgroundColor[2] * 1.1);
_j577.begin();
clear();
noStroke();
fill(_j451, _j452, _j453);
rect(-width / 2, -height / 2, width, height);
blendMode(MULTIPLY);
image(_j450, -width / 2, -height / 2, width, height);
_j577.end();
_j450.remove();
_j578 = createFramebuffer({
density: _j469
});
_j578.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j578.end();
_j574 = createFramebuffer({
density: _j469
});
_j581 = createFramebuffer({
density: _j469
});
_j581.begin();
background(0);
_j581.end();
_j575 = createFramebuffer({
density: _j469
});
_j579 = createFramebuffer({
density: _j469
});
_j576 = createFramebuffer({
density: _j469
});
_j580 = createFramebuffer({
density: _j469
});
_j580.begin();
background(255);
_j580.end();
if (typeof window.tempMetallicBuffer === 'undefined') {
window.tempMetallicBuffer = createFramebuffer({
density: _j469
});
}
_j470.begin();
background(255, 255, 255);
_j470.end();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
hw = width * 0.5;
hh = height * 0.5;
_j594 = hw;
_j595 = hh;
_j596 = hw;
_j597 = hh;
_j158();
_j484 = 10;
_j531 = 2;
_j486 = 0.5;
_j487 = 0.5;
_j485 = 0;
_j488 = 20;
x = y = _j489 = _j490 = _j491 = _j492 = _j505 = 0;
_j408 = hw;
_j409 = hh;
_j493 = 0;
_j154();
_j161();
_j25();
_j159();
window.addEventListener('mouseup', function(e) {
if (_j511 && !_j590) {
const _j693 = document.querySelector('canvas');
if (_j693) {
const bounds = _j693.getBoundingClientRect();
const _j694 = e.clientX < bounds.left || e.clientX > bounds.right ||
e.clientY < bounds.top || e.clientY > bounds.bottom;
if (_j694) {
_j100('system', '🖱️ Mouse released outside canvas', {
ClientX: e.clientX,
ClientY: e.clientY
});
if (!_j512) {
_j512 = true;
_j523 = 0;
}
}
}
}
});
document.addEventListener('mousedown', function(e) {
_j520 = _j44(e.clientX, e.clientY);
});
document.addEventListener('mouseup', function(e) {
_j520 = false;
});
document.addEventListener('mousemove', function(e) {
if (typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
_j506 = _j167(mouseX);
_j507 = _j167(mouseY);
} else {
const _j693 = document.querySelector('canvas');
if (!_j693) return;
const bounds = _j693.getBoundingClientRect();
const _j695 = (e.clientX - bounds.left) / bounds.width;
const _j696 = (e.clientY - bounds.top) / bounds.height;
_j506 = _j167(_j695 * width);
_j507 = _j167(_j696 * height);
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
function _j32() {
if (!_j1334.enabled) return;
_j1334.frameCount++;
let _j697 = 60;
const now = millis();
if (_j1334.lastFrameTime > 0) {
const deltaTime = now - _j1334.lastFrameTime;
if (deltaTime > 0 && deltaTime < 1000) {
_j697 = 1000 / deltaTime;
_j697 = Math.max(1, Math.min(120, _j697));
}
} else {
try {
const _j698 = frameRate();
if (!isNaN(_j698) && _j698 > 0) {
_j697 = _j698;
}
} catch (e) {}
}
_j1334.lastFrameTime = now;
_j1334._pushFR(_j697);
if (_j1334.frameCount - _j1334.lastCheckFrame >= _j1334.checkInterval) {
_j1334.lastCheckFrame = _j1334.frameCount;
const _j699 = _j1334._frLen > 0 ?
_j1334._avgFR() :
_j697;
if (_j1334.logFpsToConsole) {
console.log('FPS:', _j699.toFixed(1));
}
const _j700 = 0.1;
const _j701 = _j699 <= (_j1334.frameRateThreshold + _j700);
if (_j701) {
const now = millis();
if (now - _j1334.lastPerformanceLog > _j1334.logCooldown) {
_j1334.lastPerformanceLog = now;
_j33(_j699);
} else {
console.log('[性能监控] 跳过记录（冷却中，剩余:', ((_j1334.logCooldown - (now - _j1334.lastPerformanceLog)) / 1000).toFixed(1), '秒)');
}
}
}
}
function _j33(_j699) {
const _j702 = _j1334.performanceDataAccumulated;
const sampleCount = _j702.sampleCount > 0 ? _j702.sampleCount : 1;
if (sampleCount === 0 || _j702.drawTotal === 0) {
const _j703 = _j1334.performanceData;
const _j704 = _j703.drawTotal > 0 ? _j703.drawTotal : 1;
const report = {
'平均帧率': `${_j699.toFixed(1)} fps`,
'目标帧率': `${_j1334.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j699).toFixed(2)} ms`,
'状态': '性能数据不足，但帧率低于阈值',
'画布尺寸': `${_j467}x${_j468}`,
'Pixel Density': _j469
};
const stateInfo = {
'正在绘制': _j511 ? '是' : '否',
'正在播放': _j590 ? '是' : '否',
'倒计时中': _j512 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j605 ? '是' : '否',
'笔画数量': typeof _j532 !== 'undefined' ? _j532.length : 0
};
_j100('system', '⚠️ 性能警告：帧率低于阈值', {
...report,
...stateInfo
});
return;
}
const data = {
drawTotal: _j702.drawTotal / sampleCount,
updatePlayback: _j702.updatePlayback / sampleCount,
updateCompositeBuffer: _j702.updateCompositeBuffer / sampleCount,
updateEasyCamAutoTracking: _j702.updateEasyCamAutoTracking / sampleCount,
drawCursorToBuffer: _j702.drawCursorToBuffer / sampleCount,
updateBlurEffect: _j702.updateBlurEffect / sampleCount,
applyCameraProjection: _j702.applyCameraProjection / sampleCount,
drawLayersWithBlur: _j702.drawLayersWithBlur / sampleCount,
other: _j702.other / sampleCount
};
const _j704 = data.drawTotal > 0 ? data.drawTotal : 1;
const _j705 = [];
const _j706 = _j704 * 0.1;
if (data.updatePlayback > _j706) {
_j705.push({
name: 'updatePlayback',
time: data.updatePlayback.toFixed(2),
percent: ((data.updatePlayback / _j704) * 100).toFixed(1)
});
}
if (data.updateCompositeBuffer > _j706) {
_j705.push({
name: 'updateCompositeBuffer',
time: data.updateCompositeBuffer.toFixed(2),
percent: ((data.updateCompositeBuffer / _j704) * 100).toFixed(1)
});
}
if (data.updateEasyCamAutoTracking > _j706) {
_j705.push({
name: 'updateEasyCamAutoTracking',
time: data.updateEasyCamAutoTracking.toFixed(2),
percent: ((data.updateEasyCamAutoTracking / _j704) * 100).toFixed(1)
});
}
if (data.drawCursorToBuffer > _j706) {
_j705.push({
name: 'drawCursorToBuffer',
time: data.drawCursorToBuffer.toFixed(2),
percent: ((data.drawCursorToBuffer / _j704) * 100).toFixed(1)
});
}
if (data.updateBlurEffect > _j706) {
_j705.push({
name: 'updateBlurEffect',
time: data.updateBlurEffect.toFixed(2),
percent: ((data.updateBlurEffect / _j704) * 100).toFixed(1)
});
}
if (data.applyCameraProjection > _j706) {
_j705.push({
name: 'applyCameraProjection',
time: data.applyCameraProjection.toFixed(2),
percent: ((data.applyCameraProjection / _j704) * 100).toFixed(1)
});
}
if (data.drawLayersWithBlur > _j706) {
_j705.push({
name: 'drawLayersWithBlur',
time: data.drawLayersWithBlur.toFixed(2),
percent: ((data.drawLayersWithBlur / _j704) * 100).toFixed(1)
});
}
if (data.other > _j706) {
_j705.push({
name: 'other',
time: data.other.toFixed(2),
percent: ((data.other / _j704) * 100).toFixed(1)
});
}
const report = {
'平均帧率': `${_j699.toFixed(1)} fps`,
'目标帧率': `${_j1334.frameRateThreshold} fps`,
'帧时间': `${(1000 / _j699).toFixed(2)} ms`,
'总耗时': `${_j704.toFixed(2)} ms`,
'样本数量': sampleCount,
'画布尺寸': `${_j467}x${_j468}`,
'Pixel Density': _j469
};
const stateInfo = {
'正在绘制': _j511 ? '是' : '否',
'正在播放': _j590 ? '是' : '否',
'倒计时中': _j512 ? '是' : '否',
'Shader 启用': (distortShaderEnabled || rsEnabled) ? '是' : '否',
'EasyCam 启用': _j605 ? '是' : '否',
'笔画数量': typeof _j532 !== 'undefined' ? _j532.length : 0
};
if (_j705.length > 0) {
report['性能瓶颈'] = _j705.map(b => `${b.name} (${b.time}ms, ${b.percent}%)`).join(', ');
} else {
report['性能瓶颈'] = '未检测到明显瓶颈（可能由多个小操作累积）';
}
const _j707 = [];
if (data.drawLayersWithBlur > _j706) {
_j707.push('考虑禁用 shader 效果（doEffect = false）');
}
if (data.updateCompositeBuffer > _j706) {
_j707.push('检查是否需要优化 composite buffer 更新频率');
}
if (_j467 * _j468 > 1500000) {
_j707.push('画布尺寸较大，考虑降低 pixel density 或缩小画布');
}
if (typeof _j532 !== 'undefined' && _j532.length > 100) {
_j707.push('笔画数量较多，考虑清理旧笔画');
}
if (_j707.length > 0) {
report['优化建议'] = _j707.join('; ');
}
_j100('system', '⚠️ 性能警告：帧率低于 30 fps', {
...report,
...stateInfo
});
Object.keys(_j1334.performanceData).forEach(key => {
_j1334.performanceData[key] = 0;
});
Object.keys(_j1334.performanceDataAccumulated).forEach(key => {
_j1334.performanceDataAccumulated[key] = 0;
});
}
let _j708 = 0;
const _j709 = 5;
function draw() {
if (!window._fxDebug) {
window._fxDebug = { totalFrames: 0, startTime: performance.now(), feedbackFrames: 0, playbackEndFrame: 0, avgFps: 0 };
}
window._fxDebug.totalFrames++;
if (window._fxDebug.totalFrames % 60 === 0) {
window._fxDebug.avgFps = Math.round(window._fxDebug.totalFrames / ((performance.now() - window._fxDebug.startTime) / 1000));
}
const _j710 = (++_j708 % _j709 === 0);
const _j711 = _j710 ? performance.now() : 0;
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
if (_j216.length > 0 && typeof window.metallicLightX !== 'undefined') {
let t = millis() * 0.0001;
window.metallicLightX = 0.5 + Math.sin(t * 0.7) * 0.3;
window.metallicLightY = 0.4 + Math.cos(t * 0.5) * 0.25;
}
let _j712 = _j710 ? performance.now() : 0;
if (_j590) {
updatePlayback();
}
if (_j710) _j1334.performanceData.updatePlayback += performance.now() - _j712;
_j24();
if (_j522 || _j511 || _j512 || _j590 || _j633) {
if (_j710) _j712 = performance.now();
updateCompositeBuffer();
if (_j710) _j1334.performanceData.updateCompositeBuffer += performance.now() - _j712;
}
if (doMoving && !(typeof window !== 'undefined' && window.blurBuffersInitialized)) {
_j31();
}
if (_j710) _j712 = performance.now();
updateEasyCamAutoTracking();
if (_j710) _j1334.performanceData.updateEasyCamAutoTracking += performance.now() - _j712;
if (_j710) _j712 = performance.now();
drawCursorToBuffer();
if (_j710) _j1334.performanceData.drawCursorToBuffer += performance.now() - _j712;
_j34();
if (_j710) _j712 = performance.now();
updateBlurEffect();
if (_j710) _j1334.performanceData.updateBlurEffect += performance.now() - _j712;
if (_j710) _j712 = performance.now();
applyCameraProjection();
if (_j710) _j1334.performanceData.applyCameraProjection += performance.now() - _j712;
if (_j710) _j712 = performance.now();
drawLayersWithBlur();
if (_j710) _j1334.performanceData.drawLayersWithBlur += performance.now() - _j712;
_j48();
if (fxhashDebugMode && window._fxContext && window._fxDebug) {
var d = window._fxDebug;
if (d.totalFrames % 60 === 0) {
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
}
var _j713 = 'ctx=' + window._fxContext +
' vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) : 'OFF') +
' fr=' + d.totalFrames + ' fb=' + d.feedbackFrames +
' fps=' + d.avgFps +
' play=' + (typeof _j590 !== 'undefined' ? _j590 : '?') +
' evt=' + (typeof _j592 !== 'undefined' ? _j592 : '?');
_j574.begin();
if (font) textFont(font);
textSize(7);
textAlign(LEFT, TOP);
noStroke();
fill(255, 0, 0, 220);
rectMode(CORNER);
rect(-width/2, -height/2, width, 14);
fill(255);
text(_j713, -width/2 + 4, -height/2 + 3);
_j574.end();
if (d.totalFrames % 10 === 0) {
var _j714 = document.getElementById('defaultCanvas0');
var _j715 = document.getElementById('_fxDbgOvr');
if (!_j715 && _j714) {
_j715 = document.createElement('canvas');
_j715.id = '_fxDbgOvr';
_j715.width = _j714.offsetWidth;
_j715.height = 24;
_j715.style.position = 'fixed';
_j715.style.top = _j714.offsetTop + 'px';
_j715.style.left = _j714.offsetLeft + 'px';
_j715.style.zIndex = '2147483647';
_j715.style.pointerEvents = 'none';
document.body.appendChild(_j715);
}
if (_j715) {
var _j716 = _j715.getContext('2d');
_j716.clearRect(0, 0, _j715.width, _j715.height);
_j716.fillStyle = 'rgba(200,0,0,0.85)';
_j716.fillRect(0, 0, _j715.width, 22);
_j716.font = 'bold 13px monospace';
_j716.fillStyle = '#fff';
_j716.fillText(_j713, 6, 16);
}
}
}
if (window._fxCapturePhase === 1) {
window._fxCapturePhase = 2;
try {
var _j717 = document.getElementById('fxhash-capture-canvas');
var _j718 = document.getElementById('defaultCanvas0');
if (_j717 && typeof _j574 !== 'undefined') {
var _j719 = _j574.get();
_j717.width = _j719.width;
_j717.height = _j719.height;
var _j720 = _j717.getContext('2d');
_j720.drawImage(_j719.canvas, 0, 0);
if (typeof _j719.remove === 'function') _j719.remove();
if (_j718) {
_j717.style.cssText = _j718.style.cssText;
_j718.style.visibility = 'hidden';
}
_j717.style.position = 'absolute';
_j717.style.top = (_j718 ? _j718.offsetTop : 0) + 'px';
_j717.style.left = (_j718 ? _j718.offsetLeft : 0) + 'px';
_j717.style.zIndex = '99999';
_j717.style.visibility = 'visible';
_j717.style.border = 'none';
_j717.style.outline = 'none';
console.log('[fxhash] Phase 1: screenBuffer frozen to 2D canvas (' + _j717.width + 'x' + _j717.height + ')');
if (fxhashDebugMode && window._fxDebug) {
var d = window._fxDebug;
d.avgFps = Math.round(d.totalFrames / ((performance.now() - d.startTime) / 1000));
var _j721 = [
'ctx=' + (window._fxContext || 'null'),
'vt=' + (window._fxVirtualTime !== undefined ? Math.round(window._fxVirtualTime) + 'ms' : 'OFF'),
'frames=' + d.totalFrames,
'fb=' + d.feedbackFrames,
'fps=' + d.avgFps,
'evt=' + (d.eventsProcessed || '?') + '/' + (d.totalEvents || '?'),
'realT=' + Math.round((d.playbackEndRealTime || 0) / 1000) + 's'
];
_j720.save();
_j720.fillStyle = 'rgba(0,0,0,0.7)';
_j720.fillRect(10, 10, 280, _j721.length * 22 + 10);
_j720.font = '16px monospace';
_j720.fillStyle = '#0f0';
for (var li = 0; li < _j721.length; li++) {
_j720.fillText(_j721[li], 18, 30 + li * 22);
}
_j720.restore();
}
setTimeout(function() {
console.log('[fxhash] Phase 2: calling $fx.preview()');
if (typeof $fx !== 'undefined' && typeof $fx.preview === 'function') {
$fx.preview();
}
}, 500);
} else {
if (_j718 && _j717) {
_j717.width = _j718.width;
_j717.height = _j718.height;
var _j720 = _j717.getContext('2d');
_j720.drawImage(_j718, 0, 0);
if (_j718) _j718.style.visibility = 'hidden';
_j717.style.visibility = 'visible';
_j717.style.zIndex = '99999';
_j717.style.border = 'none';
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
if (_j710) {
const _j722 = performance.now();
const _j723 = _j1334.performanceData.updatePlayback +
_j1334.performanceData.updateCompositeBuffer +
_j1334.performanceData.updateEasyCamAutoTracking +
_j1334.performanceData.drawCursorToBuffer +
_j1334.performanceData.updateBlurEffect +
_j1334.performanceData.applyCameraProjection +
_j1334.performanceData.drawLayersWithBlur;
_j1334.performanceData.other = (_j722 - _j711) - _j723;
_j1334.performanceData.drawTotal = _j722 - _j711;
_j1334.performanceDataAccumulated.drawTotal += _j1334.performanceData.drawTotal;
_j1334.performanceDataAccumulated.updatePlayback += _j1334.performanceData.updatePlayback;
_j1334.performanceDataAccumulated.updateCompositeBuffer += _j1334.performanceData.updateCompositeBuffer;
_j1334.performanceDataAccumulated.updateEasyCamAutoTracking += _j1334.performanceData.updateEasyCamAutoTracking;
_j1334.performanceDataAccumulated.drawCursorToBuffer += _j1334.performanceData.drawCursorToBuffer;
_j1334.performanceDataAccumulated.updateBlurEffect += _j1334.performanceData.updateBlurEffect;
_j1334.performanceDataAccumulated.applyCameraProjection += _j1334.performanceData.applyCameraProjection;
_j1334.performanceDataAccumulated.drawLayersWithBlur += _j1334.performanceData.drawLayersWithBlur;
_j1334.performanceDataAccumulated.other += _j1334.performanceData.other;
_j1334.performanceDataAccumulated.sampleCount++;
}
_j32();
if (_j590) {
if (_j512 && !_j601) {
_j600 = millis();
_j601 = true;
if (window.DEBUG_MODE) console.log(`[⏸️ Countdown 开始]`);
} else if (!_j512 && _j601) {
const _j724 = millis() - _j600;
const _j725 = _j591;
_j591 += _j724;
_j601 = false;
if (window.DEBUG_MODE) console.log(`[▶️ Countdown 结束] 补偿时间: ${_j724.toFixed(0)}ms`);
if (_j592 < recordingData.events.length) {
const _j726 = recordingData.events[_j592];
const _j727 = _j726.m || _j726.type;
const _j728 = _j727 === 'mp' || _j727 === 'mousePressed';
const _j729 = _j726.t !== undefined ? _j726.t : _j726.time;
const _j730 = (millis() - _j591) * _j593;
const _j731 = _j729 - _j730;
if (_j728 || _j731 <= 0 || _j731 < 100) {
if (window.DEBUG_MODE && _j728) {
console.log(`[🔧 Countdown 结束后立即处理] mousePressed，时间差: ${_j731.toFixed(0)}ms`);
}
_j174(_j726);
_j592++;
}
}
}
}
const _j732 = _j590 ? _j598 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j511));
const _j733 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j732 : (_j732 && _j494 > 0);
const _j734 = _j590 || (_j506 >= 0 && _j506 < width && _j507 >= 0 && _j507 < height) || (_j511 && (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing)));
if (typeof window.drawLoopCount === 'undefined') {
window.drawLoopCount = 0;
window.drawLoopCheckpoints = [];
}
if (_j733 && _j734) {
window.drawLoopCount++;
if (_j524 === 0) {
crandomDebugger.checkpoint('draw_首次進入', 'draw');
}
_j524++;
let _j465, _j466;
if (_j590) {
_j465 = _j594;
_j466 = _j595;
} else {
_j465 = _j506;
_j466 = _j507;
}
if (_j524 % 2 === 0 && _j529) {
pathPoints.push({
x: _j465,
y: _j466
});
}
const _j735 = strokeSeed + _j524 * 100000000;
randomSeed(_j735);
if (brushMode === 3) {
let _j736 = crandom.random(0, 1);
let _j737 = crandom.random(150, 250);
let _j738 = _j736 > 0.1 ? noise(_j465 * 0.01, _j466 * 0.01) * 150 : _j737;
_j479 = (_j479 * 0.3) + (_j738 * 0.7);
} else {
let _j736 = crandom.random(0, 1);
let _j737 = crandom.random(20, 50);
let _j738 = _j736 > 0.3 ? noise(_j465 * 0.01, _j466 * 0.01) * 10 : _j737;
_j479 = (_j479 * 0.6) + (_j738 * 0.4);
}
_j494 -= randStep;
_j494 = max(1, _j494);
_j488 = _j494;
if (_j515 && _j524 >= 8) {
const _j739 = _j590 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j518;
const _j740 = baseBrushSize;
if (_j739 >= 0.3) {
const _j741 = [0.1, 0.25, 0.5, 1, 2, 3, 5, 10];
const _j742 = _j519 || window._strokeStartBaseBrushSize || 1;
let _j743 = _j741.indexOf(_j742);
if (_j743 === -1) {
_j743 = _j741.findIndex(s => s >= _j742);
if (_j743 === -1) _j743 = _j741.length - 1;
}
let _j744;
if      (_j739 < 0.5) _j744 = 1;
else if (_j739 < 0.7) _j744 = 2;
else                     _j744 = 3;
const _j745 = Math.min(_j743 + _j744, _j741.length - 1);
baseBrushSize = _j741[_j745];
} else if (_j739 >= 0) {
baseBrushSize = _j519 || window._strokeStartBaseBrushSize || baseBrushSize;
}
if (baseBrushSize !== _j740 && _j740 > 0) {
const _j746 = Math.pow(baseBrushSize / _j740, 0.6);
_j494 *= _j746;
initialSize *= _j746;
}
}
if (_j494 <= _j495 && !_j512 && brushMode != 3 && brushMode != 4 && brushMode != 5) {
_j512 = true;
_j523 = 0;
}
_j408 = _j465;
_j409 = _j466;
_j493 = map(noise(_j408 * 0.01, _j409 * 0.01), 0, 1, -pathRotation, pathRotation);
if (brushMode !== 3) {
const _j747 = strokeSeed + _j524 * 10000000;
randomSeed(_j747);
const _j748 = crandom.random(pathRotation * 0.5, pathRotation);
const _j749 = crandom.random(pathRotation * 0.5, pathRotation);
const _j460 = -10;
_j408 += _j748 * (cos(_j493)) + _j460;
_j409 += _j749 * (sin(_j493)) + _j460;
}
if (_j582) {
const _j750 = (brushMode === 3) ? _j408 : Math.round(_j408);
const _j751 = (brushMode === 3) ? _j409 : Math.round(_j409);
const _j752 = { x: _j750, y: _j751 };
if (_j515 && _j517) _j752.p = Math.round(_j518 * 1000) / 1000;
_j168("md", _j752);
if (typeof window.recordedMouseDraggedCount !== 'undefined') {
window.recordedMouseDraggedCount++;
}
}
_j508 = _j408;
_j509 = _j409;
let _j284 = _j571;
if (_j524 === 1) {
crandomDebugger.checkpoint('brush_首次繪製前', 'brush');
}
const _j753 = dist(_j408, _j409, _j503, _j504);
const _j754 = 1;
if (_j753 > _j754) {
if (brushMode == 4 && _j524 < expectedStrokeLength) {
_j55(_j284, _j408, _j409, _j503, _j504);
}
if ((brushMode == 1 || brushMode == 7) && _j524 < expectedStrokeLength) {
let _j755 = expectedStrokeLength > 0 ? min(_j524 / expectedStrokeLength, 1.0) : 0;
let _j756 = crandom.random(0, 1);
if (_j756 > 0.9 && whiteBrushMode == 0 && !brushModeSP && baseBrushSize >= 1.5) {
if (_j524 > 5 && baseBrushSize < 6.0) _j53(_j284, _j408, _j409);
}
_j54(_j284, _j408, _j409, _j755, targetflyBrushType, targetmainStrokeDir);
}
if ((brushMode == 2) && _j524 < expectedStrokeLength) {
let _j755 = expectedStrokeLength > 0 ? min(_j524 / expectedStrokeLength, 1.0) : 0;
let _j756 = crandom.random(0, 1);
if (_j756 > 0.8 && whiteBrushMode == 0 && baseBrushSize >= 1 && _j755 < 0.6) {}
_j57(_j284, _j408, _j409, _j755, targetflyBrushType, targetmainStrokeDir);
}
if (brushMode == 3 && _j524 < expectedStrokeLength) {
_j60(_j284, _j408, _j409, _j503, _j504);
if (crandom.random(0, 1) > 0.4) _j53(_j284, _j408, _j409);
}
if (brushMode == 5 && _j524 < expectedStrokeLength) {
if (crandom.random(0, 1) > 0.05) _j53(_j284, _j408, _j409);
}
if (brushMode == 6 && _j524 < expectedStrokeLength) {
let _j755 = expectedStrokeLength > 0 ? min(_j524 / expectedStrokeLength, 1.0) : 0;
_j61(_j284, _j408, _j409, _j755, targetflyBrushType, targetmainStrokeDir);
}
}
if (_j524 === 1) {
crandomDebugger.checkpoint('brush_首次繪製後', 'brush');
}
_j503 = _j408;
_j504 = _j409;
if (_j590) {
_j596 = _j594;
_j597 = _j595;
}
}
const _j757 = _j590 ? _j598 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j511));
const _j758 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j757 : (_j757 && _j494 > 0);
if (_j758) {
if (_j525 === 0) {
crandomDebugger.checkpoint('shader_首次更新前', 'shader');
}
force = 1.0;
if (brushMode == 4) force = force * 0.4;
const _j284 = _j571;
_j28(_j284, force);
_j525++;
if (_j525 === 1) {
crandomDebugger.checkpoint('shader_首次更新後', 'shader');
}
} else if (_j512 && _j523 < maxUpdates) {
force = map(_j523, 0, maxUpdates, 1.0, 0.0);
if (brushMode == 4) force = force * 0.4;
const _j284 = _j571;
_j28(_j284, force);
_j523++;
_j525++;
} else if (_j512 && _j523 >= maxUpdates) {
_j100('art', 'Stroke complete', {
Status: 'Countdown complete, transferred to static layer'
});
_j35();
_j512 = false;
}
if (_j589 == 1 && _j590 && !_j633) {
_j163();
}
if (_j589 == 1 && !_j590 && _j633) {
_j164();
}
if (_j633) {
_j165();
if (_j589 == 1) {
frameRate(10);
}
}
if (_j589 == 0) {
frameRate(60);
}
_j128();
if (_j664) {
_j664 = false;
const _j759 = drawingSeed;
randomSeed(_j665);
noiseSeed(_j665);
let scanBounds = pendingBugBounds ? {
...pendingBugBounds
} : null;
if (!scanBounds) {
if (typeof _j532 !== 'undefined' && _j532.length > 0) {
const lastStroke = _j532[_j532.length - 1];
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
_j18(_j574, scanBounds);
}
randomSeed(_j759);
noiseSeed(_j759);
_j665 = 0;
pendingBugBounds = null;
}
if (typeof window !== 'undefined' && window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0) {
const _j760 = window.pendingEffectControlScanQueue.shift();
if (_j760 && typeof _j18 === 'function') {
let scanBounds = _j760.scanBounds;
const action = _j760.action;
const shapeType = _j760.shapeType;
const bugsSize = _j760.bugsSize !== undefined ? _j760.bugsSize : 10.0;
const scanSeed = _j760.scanSeed;
const recordedRandomCount = _j760.recordedRandomCount;
const targetPoints = _j760.targetPoints || null;
if (typeof window !== 'undefined') {
window.bugsSize = bugsSize;
const _j761 = document.getElementById('bugs-size');
const _j762 = document.getElementById('bugs-size-value');
if (_j761 && _j762) {
_j761.value = bugsSize;
_j762.textContent = bugsSize;
}
window._scanProcessedPlaybackCount = (window._scanProcessedPlaybackCount || 0) + 1;
}
if (action === 'scan-current' && !scanBounds) {
if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
scanBounds = {
...pendingBugBounds
};
} else if (typeof _j532 !== 'undefined' && _j532.length > 0) {
const lastStroke = _j532[_j532.length - 1];
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
const _j763 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
_j18(_j574, scanBounds, shapeType, targetPoints);
if (_j763) {
randomSeed(_j763);
noiseSeed(_j763);
}
if (typeof window !== 'undefined') {
_j100('playback', '🔁 Effect Control: Scan (processed)', {
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
if (_j590) {
return;
}
if (_j520) {
return;
}
const _j764 = 300;
if (_j506 < -_j764 || _j506 > width + _j764 ||
_j507 < -_j764 || _j507 > height + _j764) {
return;
}
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j582) {
_j586++;
}
if (_j582) {
console.log(`🎬 錄製開始 [第 ${_j586} 筆]`);
}
strokeSeed = int(crandom.random(100000000, 999999999));
crandomDebugger.checkpoint('mousePressed_開始', 'mousePressed');
_j36();
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
_j100('art', 'New stroke started', {
Seed: strokeSeed,
Mode: `Brush mode ${brushMode}`,
Position: `(${_j506.toFixed(0)}, ${_j507.toFixed(0)})`
});
_j609++;
_j526 = _j524;
_j479 = 0;
_j524 = 0;
if (_j515 && _j519 !== null) {
baseBrushSize = _j519;
}
if (typeof _j997 !== 'undefined') {
_j997 = [];
}
if (typeof _j998 !== 'undefined') {
_j998 = 0;
}
_j480 = crandom.random(0.5, 0.99);
_j481 = crandom.random(-0.02, 0.02);
_j482 = crandom.random(-0.05, 0.05);
_j483 = crandom.random(-0.05, 0.05);
explodeStart = crandom.random(0, 1) > 0.8 ? 1 : 0;
explodeEnd = crandom.random(0, 1) > 0.8 ? 1 : 0;
targetflyBrushType = max(0, int(crandom.random(-1, 3)));
targetmainStrokeDir = max(0, int(crandom.random(-1, 3)));
brushDir = int(crandom.random(0, 4));
indiffusionStrength = _j167(crandom.random(0.4, 0.5));
if (brushMode == 3 || brushMode == 4) indiffusionStrength = _j167(crandom.random(0.2, 0.3));
else if (brushMode == 5) indiffusionStrength = _j167(crandom.random(0.25, 0.35));
indiffusionStrength = 0.45;
let _j765 = "";
if (baseBrushSize <= 1.5) explodeStart = 0, explodeEnd = 0;
let _j766 = `頭${explodeStart === 1 ? "E" : "N"} ｜ 尾${explodeEnd === 1 ? "E" : "N"}`;
effect3Brightness = crandom.random(0.5, 0.9);
colorIndex = int(crandom.random(0, 4));
shapeType = int(crandom.random(0, 4));
brushPaintCtlNoisebyFrame = max(noise(0), 0, 1, 0.2, 0.8);
brushPaintInterpolationOffset = int(crandom.random(-2, 4));
brushPaintOldRInitial = crandom.random(0, 1) > 0.6 ? 0.5 : 0;
if (_j582) {
if (_j588) {
if (_j583 === 0) {
_j583 = millis();
_j100('recording', '⏱️ Start timing', {
Status: 'First stroke recording started'
});
} else {
const _j767 = millis() - _j585;
if (_j767 > 0) {
_j587 += _j767;
_j100('recording', '⏸️ Skip interval', {
Interval: `${_j767.toFixed(0)}ms`,
Accumulated: `${_j587.toFixed(0)}ms`
});
}
}
_j588 = false;
} else {
const _j767 = millis() - _j585;
_j587 += _j767;
_j100('recording', '⏸️ Skip interval', {
Interval: `${_j767.toFixed(0)}ms`,
Accumulated: `${_j587.toFixed(0)}ms`
});
}
_j584 = {
strokeSeed: strokeSeed,
mouseCountStart: _j526,
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
whiteMaxOpacity: _j167(_j480),
hueShift: _j167(_j481),
satShift: _j167(_j482),
briShift: _j167(_j483),
targetflyBrushType: targetflyBrushType,
targetmainStrokeDir: targetmainStrokeDir,
brushDir: brushDir,
ctlNoise: ctlNoise,
penSketchNoiseBase: brushMode === 4 ? penSketchNoiseBase : undefined,
penSketchStrokeWeight: brushMode === 4 ? penSketchStrokeWeight : undefined,
brushPaintCtlNoisebyFrame: brushPaintCtlNoisebyFrame,
brushPaintInterpolationOffset: brushPaintInterpolationOffset,
brushPaintOldRInitial: brushPaintOldRInitial,
keyBlendMode: keyBlendMode
};
}
if (_j530 === 1) {
pathRotation = 0;
} else if (_j530 === 2) {
pathRotation = _j167(crandom.random(5, 10));
} else if (_j530 === 3) {
pathRotation = _j167(crandom.random(10, 25));
}
if (brushMode === 1) {
initialSize = _j167(crandom.random(20, 24) * baseBrushSize);
spraySize = 3 * baseBrushSize;
if (baseBrushSize > 5.0) spraySize = 1.5 * baseBrushSize;
randStep = 0.05;
maxUpdates = 30;
_j484 = 15;
_j531 = 5;
_j486 = 0.6;
_j487 = 0.5;
} else if (brushMode === 2) {
initialSize = _j167(crandom.random(20, 24) * baseBrushSize);
spraySize = 1 * baseBrushSize;
randStep = 0.05;
maxUpdates = 10;
_j484 = 10;
_j531 = 10;
_j486 = 0.3;
_j487 = 0.5;
} else if (brushMode === 3) {
initialSize = crandom.random(2, 4) * baseBrushSize;
spraySize = 10 * baseBrushSize;
_j531 = 3;
randStep = 0.05;
maxUpdates = 10;
} else if (brushMode === 4) {
initialSize = crandom.random(6, 9) * baseBrushSize;
spraySize = 1 * baseBrushSize;
_j531 = 5;
randStep = 0.05;
maxUpdates = 10;
penSketchNoiseBase = noise(_j506 * 1, _j507 * 1);
penSketchStrokeWeight = crandom.random(0, 1) > 0.95 ? 1.2 : 0.8;
expectedStrokeLength = 100;
_j486 = 0.6;
_j487 = 0.5;
} else if (brushMode === 5) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j531 = 1;
randStep = 0.05;
maxUpdates = 10;
_j484 = 10;
_j486 = 0.6;
_j487 = 0.5;
} else if (brushMode === 6) {
initialSize = crandom.random(10, 14) * baseBrushSize;
spraySize = 10;
_j531 = 1;
randStep = 0.05;
maxUpdates = 10;
_j484 = 10;
_j486 = 0.6;
_j487 = 0.5;
} else {
initialSize = crandom.random(30, 40);
maxUpdates = 10;
randStep = 0.05;
}
if (useSharpen >= 3.5) {
maxUpdates = 20;
_j100('system', '⚡️ Ink Effect G active, maxUpdates set to 5', {
Status: 'Performance Optimization'
});
}
if (brushMode == 4) {
expectedStrokeLength = 400;
} else {
expectedStrokeLength = 400;
}
if (_j582 && _j584) {
_j584.initialSize = initialSize;
_j584.spraySize = spraySize;
_j584.step = _j484;
_j584.step2 = _j531;
_j584.randStep = randStep;
_j584.maxUpdates = maxUpdates;
_j584.pathRotation = pathRotation;
_j584.spring = _j486;
_j584.friction = _j487;
_j584.baseBrushSize = baseBrushSize;
_j584.expectedStrokeLength = expectedStrokeLength;
_j584.effect3Brightness = _j167(effect3Brightness);
}
_j494 = initialSize;
_j488 = _j494;
_j492 = _j488;
_j510 = initialSize;
window._strokeStartBaseBrushSize = baseBrushSize;
if (_j515 && _j519 === null) _j519 = baseBrushSize;
_j505 = 0;
x = _j506;
y = _j507;
_j489 = 0;
_j490 = 0;
_j491 = 0;
_j502 = 0;
_j496 = 0;
if (typeof _j57 !== 'undefined') {
_j57.lastAngle = 0;
_j57.lastMovementAngle = 0;
}
if (typeof _j59 === 'function') {
_j59();
}
if (typeof _j61 !== 'undefined') {
_j61.lastAngle = 0;
_j61.lastMovementAngle = 0;
}
_j503 = _j506;
_j504 = _j507;
_j511 = true;
_j512 = false;
_j523 = 0;
_j525 = 0;
_j513 = true;
_j514 = false;
startX = _j506;
startY = _j507;
pathPoints = [{
x: _j506,
y: _j507
}];
_j529 = true;
drawingSeed = int(crandom.random(1000000, 9999999));
if (brushMode == 7) brushModeSP = true;
else brushModeSP = false;
randomSeed(drawingSeed);
noiseSeed(drawingSeed);
crandomDebugger.checkpoint('mousePressed_結束', 'mousePressed');
if (_j582 && _j584) {
_j584.mouseX = _j506;
_j584.mouseY = _j507;
_j584.drawingSeed = drawingSeed;
_j584.brushModeSP = brushModeSP;
if (_j515 && _j517) _j584.hasPressure = true;
_j584.forceMapParams = {
randomSeed1: _j167(_j562[0]),
randomSeed2: _j167(_j562[1]),
randomSeed3: _j167(_j562[2]),
randomSeed4: _j167(_j562[3]),
scale1: _j167(_j563[0]),
scale2: _j167(_j563[1]),
scale3: _j167(_j563[2]),
amplitude1: _j167(_j564[0]),
amplitude2: _j167(_j564[1]),
amplitude3: _j167(_j564[2]),
phase1: _j167(_j565[0]),
phase2: _j167(_j565[1]),
phase3: _j167(_j565[2]),
vortexScale1: _j167(_j566[0]),
vortexScale2: _j167(_j566[1]),
clusterScale1: _j167(_j567[0]),
clusterScale2: _j167(_j567[1])
};
const _j768 = (brushMode === 3) ? _j506 : Math.round(_j506);
const _j769 = (brushMode === 3) ? _j507 : Math.round(_j507);
_j168("mp", {
x: _j768,
y: _j769,
strokeData: _j584
});
}
}
function mouseReleased() {
if (_j590) {
return;
}
if (!_j511) {
return;
}
const _j770 = crandom.getCount();
const _j771 = _j506;
const _j772 = _j507;
const _j773 = Math.round(constrain(_j771, 0, width));
const _j774 = Math.round(constrain(_j772, 0, height));
_j168("mr", {
x: _j773,
y: _j774
});
crandomDebugger.checkpoint('mouseReleased', 'mouseReleased');
const randomCount = crandom.getCount();
const _j775 = randomCount - _j770;
const _j776 = window.drawLoopCount || 0;
const _j777 = window.recordedMouseDraggedCount || 0;
if (_j582) {
console.log(`   Draw: ${_j776} | random(): ${randomCount}`);
}
window.drawLoopCount = 0;
window.recordedMouseDraggedCount = 0;
if (_j582) {
crandomDebugger.saveStroke('recording', _j586);
}
if (_j582) {
_j585 = millis();
_j100('recording', 'Stroke ended', {
FinalSize: _j494.toFixed(2),
CountdownStatus: _j512 ? 'In progress' : 'Not started',
'brushMode': brushMode,
'OutsideCanvas': (_j506 < 0 || _j506 >= width || _j507 < 0 || _j507 >= height),
'RandomCalls': randomCount
});
}
if (typeof _j997 !== 'undefined' && _j997.length > 0) {
_j997 = _j997.filter(_j1457 => _j1457.radius > 0);
}
if (!_j512) {
_j512 = true;
_j523 = 0;
}
}
function keyPressed() {
if (key === 'Enter') {
_j108();
return;
}
if (key === 'f' || key === 'F') {
if (_j633) {
_j164();
} else {
_j163();
}
return;
}
if (key === ' ') {
_j153();
console.clear();
let _j778 = _j216.length;
_j216 = [];
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
_j100('system', '🧹 Clear canvas', {
'Status': 'Cleared (brush settings preserved)',
'虫咬点': `${_j778} 个`
});
return false;
}
}
function _j34() {
const _j431 = doMoving && _j605 && _j604 !== null && _j590 && _j606;
const _j779 = (_j590 && _j431) || (!_j590 && (_j622 || _j626[0] !== 0 || _j626[40] !== 0 || _j626[80] !== 0 || _j626[120] !== 0));
if (_j779) {
if (!_j622) {
_j622 = true;
_j623 = millis();
_j624[0] = _j626[0];
_j624[40] = _j626[40];
_j624[80] = _j626[80];
_j624[120] = _j626[120];
}
const _j398 = millis() - _j623;
const _j399 = Math.min(_j398 / _j621, 1.0);
const _j780 = _j590 ? _j625 : {
0: 0,
40: 0,
80: 0,
120: 0
};
_j626[0] = lerp(_j624[0], _j780[0], _j399);
_j626[40] = lerp(_j624[40], _j780[40], _j399);
_j626[80] = lerp(_j624[80], _j780[80], _j399);
_j626[120] = lerp(_j624[120], _j780[120], _j399);
if (_j399 >= 1.0) {
_j626[0] = _j780[0];
_j626[40] = _j780[40];
_j626[80] = _j780[80];
_j626[120] = _j780[120];
if (!_j590) {
_j622 = false;
}
}
} else if (!_j590 && !_j622) {
_j626[0] = 0;
_j626[40] = 0;
_j626[80] = 0;
_j626[120] = 0;
}
}
function updateBlurEffect() {
const _j431 = doMoving && _j605 && _j604 !== null && _j590 && _j606;
const _j781 = _j590;
const _j782 = _j781 ? _j598 : (mouseIsPressed || (typeof window !== 'undefined' && window._touchDrawing && _j511));
const _j783 = (brushMode == 3 || brushMode == 4 || brushMode == 5) ? _j782 : (_j782 && _j494 > 0);
if (!doMoving) {
_j628[0] = 0;
_j628[40] = 0;
_j628[80] = 0;
_j628[120] = 0;
return;
}
if (_j781) {
if (_j632) {
crandomDebugger.checkpoint('updateBlurEffect_開始生成', 'blur');
_j627[0] = _j167(max(0, crandom.random(-5, 5)));
_j627[40] = _j167(max(0, crandom.random(-5, 5)));
_j627[80] = _j167(max(0, crandom.random(-5, 5)));
_j627[120] = _j167(max(0, crandom.random(-5, 5)));
crandomDebugger.checkpoint('updateBlurEffect_完成生成', 'blur');
_j629 = millis();
_j632 = false;
}
_j631 = _j782;
} else {
_j631 = false;
_j632 = false;
}
let _j784 = 0;
if (_j781) {
if (_j783) {
const _j398 = millis() - _j629;
const _j399 = min(1.0, _j398 / _j630);
_j784 = _j399;
} else if (_j512) {
const _j785 = map(_j523, 0, maxUpdates, 1.0, 0.0);
_j784 = _j785;
} else {
_j784 = 0;
}
if (_j431 && _j604 !== null) {
const _j395 = _j604.getDistance();
const _j391 = PI / 3;
const _j410 = height / (2 * tan(_j391 / 2));
const _j411 = 1.1;
const _j412 = 1.4;
const _j414 = _j410 / _j395;
const _j786 = _j412 - _j411;
const _j787 = (_j414 - _j411) / _j786;
const _j788 = constrain(_j787, 0.0, 1.0);
const _j789 = pow(_j788, 0.5);
_j784 = _j784 * _j789;
}
}
_j628[0] = _j627[0] * _j784;
_j628[40] = _j627[40] * _j784;
_j628[80] = _j627[80] * _j784;
_j628[120] = _j627[120] * _j784;
}
function drawLayersWithBlur() {
const _j431 = doMoving && _j605 && _j604 !== null && _j590 && _j606;
const _j457 = (_j511 || _j512) && _j523 < maxUpdates && _j529;
const _j790 = _j216.length > 0 && typeof _j21 === 'function';
const _j791 = false;
const _j792 = (typeof doEffect === 'undefined' || doEffect !== false) && (distortShaderEnabled || rsEnabled || cellularEnabled || whiteDotEnabled || grainEnabled) && _j476 && _j470;
if (_j471 && _j470) {
_j158();
}
_j572.begin();
clear();
if (_j792) {
let _j793 = _j574;
if (_j790) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j574, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j579, window.tempMetallicBuffer);
_j793 = _j579;
}
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
shader(_j476);
_j476.setUniform("rect", [0, 0, width * _j469, height * _j469]);
_j476.setUniform("tex0", _j793);
_j476.setUniform("forceMap", _j470);
_j476.setUniform("time", millis() * 0.005);
_j476.setUniform("backgroundColor", [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
]);
if (distortShaderEnabled) {
_j476.setUniform("distortEnabled", 1.0);
_j476.setUniform("displacementB", distortDisplacementB);
_j476.setUniform("displacementC", distortDisplacementC);
_j476.setUniform("showFbmMask", distortShowFbmMask);
_j476.setUniform("fbmSeed1", _j562[0] || 100);
_j476.setUniform("fbmSeed2", _j562[1] || 200);
_j476.setUniform("fbmSeed3", _j562[2] || 300);
_j476.setUniform("fbmSeed4", _j562[3] || 400);
} else {
_j476.setUniform("distortEnabled", 0.0);
}
if (rsEnabled) {
_j476.setUniform("rsEnabled", 1.0);
_j476.setUniform("rsFrequency", _j537);
_j476.setUniform("rsWaveSpeed", _j538);
_j476.setUniform("rsStrength", _j539);
_j476.setUniform("rsGradientMix", _j540);
_j476.setUniform("rsScale", _j541);
} else {
_j476.setUniform("rsEnabled", 0.0);
}
_j476.setUniform("cellularEnabled", cellularEnabled ? 1.0 : 0.0);
_j476.setUniform("cellularScale", _j542);
_j476.setUniform("cellularSeed", _j543);
_j476.setUniform("whiteDotDensity", whiteDotEnabled ? _j544 : 0.0);
_j476.setUniform("grainAmount", grainEnabled ? _j545 : 0.0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
} else {
imageMode(CENTER);
image(_j574, 0, 0, width, height);
if (_j790) {
window.tempMetallicBuffer.begin();
clear();
imageMode(CENTER);
image(_j572, 0, 0, width, height);
window.tempMetallicBuffer.end();
_j21(_j579, window.tempMetallicBuffer);
imageMode(CENTER);
image(_j579, 0, 0, width, height);
}
}
_j572.end();
if (_j553 && _j554) {
const data = _j554;
const bounds = data.bounds;
const _j794 = {
rect: [0, 0, width * _j469, height * _j469],
blendType: data.blendType,
blendVol: _j560.blendVol * (1 + data.iterations * 0.1),
radSeed: data.seed * 0.001,
strokeBounds: [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY],
pixD: _j560.pixD,
blendA: _j560.blendA,
blendB: _j560.blendB,
directVol: _j560.directVol,
snoiseVol: _j560.snoiseVol,
gobalStyle: _j560.gobalStyle,
vline: 5,
hline: 5,
cellT: 1.0,
colorDeep: _j560.colorDeep,
whiteDot: _j560.whiteDot,
doBigShape: _j560.doBigShape,
doMask: _j560.doMask,
multiDir: _j560.multiDir,
drawTime: _j560.drawTime,
seed: _j560.seed,
iTime: millis() * 0.001
};
if (_j581 && _j478) {
_j575.begin();
clear();
shader(_j478);
for (const [key, val] of Object.entries(_j794)) {
_j478.setUniform(key, val);
}
_j478.setUniform('tex0', _j581);
_j478.setUniform('lastStrokeTex', _j580);
_j478.setUniform('lastStrokeOnly', _j561 ? 1 : 0);
_j478.setUniform('isTypeMapMode', 1);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j575.end();
_j581.begin();
clear();
background(0);
imageMode(CENTER);
image(_j575, 0, 0, width, height);
_j581.end();
}
if (_j478) {
_j574.begin();
clear();
imageMode(CENTER);
image(_j568, 0, 0, width, height);
_j574.end();
_j568.begin();
shader(_j478);
for (const [key, val] of Object.entries(_j794)) {
_j478.setUniform(key, val);
}
_j478.setUniform('tex0', _j574);
_j478.setUniform('lastStrokeTex', _j580);
_j478.setUniform('lastStrokeOnly', _j561 ? 1 : 0);
_j478.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j568.end();
}
if (_j478) {
_j574.begin();
clear();
imageMode(CENTER);
image(_j570, 0, 0, width, height);
_j574.end();
_j570.begin();
shader(_j478);
for (const [key, val] of Object.entries(_j794)) {
_j478.setUniform(key, val);
}
_j478.setUniform('tex0', _j574);
_j478.setUniform('lastStrokeTex', _j580);
_j478.setUniform('lastStrokeOnly', _j561 ? 1 : 0);
_j478.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j570.end();
}
if (_j478) {
_j574.begin();
clear();
imageMode(CENTER);
image(_j572, 0, 0, width, height);
_j574.end();
_j572.begin();
shader(_j478);
for (const [key, val] of Object.entries(_j794)) {
_j478.setUniform(key, val);
}
_j478.setUniform('tex0', _j574);
_j478.setUniform('lastStrokeTex', _j580);
_j478.setUniform('lastStrokeOnly', _j561 ? 1 : 0);
_j478.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j572.end();
}
_j553 = false;
_j554 = null;
_j522 = true;
}
if (_j547 && _j478 && flowEffectStrokeBounds) {
const bounds = flowEffectStrokeBounds;
_j575.begin();
clear();
imageMode(CENTER);
image(_j572, 0, 0, width, height);
_j575.end();
_j572.begin();
shader(_j478);
_j478.setUniform('rect', [0, 0, width * _j469, height * _j469]);
_j478.setUniform('tex0', _j575);
_j478.setUniform('lastStrokeTex', _j580);
_j478.setUniform('lastStrokeOnly', _j561 ? 1 : 0);
_j478.setUniform('blendType', _j548);
_j478.setUniform('blendVol', _j560.blendVol * (1 + _j550 * 0.1));
_j478.setUniform('radSeed', _j552 * 0.001);
_j478.setUniform('strokeBounds', [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]);
_j478.setUniform('pixD', _j560.pixD);
_j478.setUniform('blendA', _j560.blendA);
_j478.setUniform('blendB', _j560.blendB);
_j478.setUniform('directVol', _j560.directVol);
_j478.setUniform('snoiseVol', _j560.snoiseVol);
_j478.setUniform('gobalStyle', _j560.gobalStyle);
_j478.setUniform('vline', 5);
_j478.setUniform('hline', 5);
_j478.setUniform('cellT', 1.0);
_j478.setUniform('colorDeep', _j560.colorDeep);
_j478.setUniform('whiteDot', _j560.whiteDot);
_j478.setUniform('doBigShape', _j560.doBigShape);
_j478.setUniform('doMask', _j560.doMask);
_j478.setUniform('multiDir', _j560.multiDir);
_j478.setUniform('drawTime', _j560.drawTime);
_j478.setUniform('seed', _j560.seed);
_j478.setUniform('iTime', millis() * 0.001);
_j478.setUniform('isTypeMapMode', 0);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j572.end();
}
noStroke();
push();
translate(0, 0, _j626[0]);
image(_j572, -width / 2, -height / 2);
pop();
if (_j457) {
push();
translate(0, 0, _j626[40]);
image(_j576, -width / 2, -height / 2);
pop();
}
if (_j590) {
if (showFuturePathPreview) {
_j38();
} else {
_j573.clear();
}
push();
translate(0, 0, _j626[80]);
image(_j573, -width / 2, -height / 2);
pop();
}
if (screenText && _j638) {
_j39();
} else if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
_j569.clear();
_j569.push();
_j41();
_j40();
_j569.pop();
} else {
_j569.clear();
_j569.push();
_j40();
_j569.pop();
}
const _j795 = (screenText && _j638) ||
(currentStrokeHighlight && currentStrokeHighlight.gridParams) ||
(typeof _j532 !== 'undefined' && Array.isArray(_j532) && _j532.length > 0);
if (_j795) {
push();
translate(0, 0, _j626[120]);
image(_j569, -width / 2, -height / 2);
pop();
}
if (_j431) {
pop();
}
}
function _j35() {
_j580.begin();
clear();
background(255);
imageMode(CENTER);
image(_j571, 0, 0);
_j580.end();
_j574.begin();
clear();
shader(_j474);
const _j445 = brushColorMode === 1 ? 1.0 : 0.0;
_j474.setUniform("rect", [0, 0, width * _j469, height * _j469]);
_j474.setUniform("baseTex", _j570);
_j474.setUniform("strokeTex", _j571);
_j474.setUniform("brushColorMode", float(brushColorMode));
_j474.setUniform("brushCategory", _j445);
_j474.setUniform("whiteMaxOpacity", _j480);
_j474.setUniform("hueShift", _j481);
_j474.setUniform("satShift", _j482);
_j474.setUniform("briShift", _j483);
_j474.setUniform("keyBlendMode", keyBlendMode);
_j474.setUniform("useSharpen", useSharpen);
_j474.setUniform("typeMapTex", _j581);
const _j796 = [
canvasBackgroundColor[0] / 255.0,
canvasBackgroundColor[1] / 255.0,
canvasBackgroundColor[2] / 255.0
];
_j474.setUniform("canvasBackgroundColor", _j796);
const _j797 = [
customBrushColor[0] / 255.0,
customBrushColor[1] / 255.0,
customBrushColor[2] / 255.0
];
_j474.setUniform("customBrushColor", _j797);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j574.end();
if (_j477 && _j581) {
_j575.begin();
clear();
imageMode(CENTER);
image(_j574, 0, 0);
_j575.end();
_j574.begin();
clear();
shader(_j477);
_j477.setUniform("rect", [0, 0, width * _j469, height * _j469]);
_j477.setUniform("baseTex", _j581);
_j477.setUniform("strokeTex", _j571);
_j477.setUniform("brushCategory", _j445);
_j477.setUniform("whiteMaxOpacity", _j480);
noStroke();
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j574.end();
_j581.begin();
clear();
background(0);
imageMode(CENTER);
image(_j574, 0, 0, width, height);
_j581.end();
_j574.begin();
clear();
imageMode(CENTER);
image(_j575, 0, 0);
_j574.end();
}
_j570.begin();
clear();
background(255);
imageMode(CENTER);
image(_j574, 0, 0);
_j570.end();
_j568.begin();
imageMode(CENTER);
blendMode(MULTIPLY);
image(_j571, 0, 0);
blendMode(BLEND);
_j568.end();
if (_j521 && _j529 && pathPoints.length > 1) {
_j23(_j568);
} else {}
if (typeof gridCommitPrev === 'function') {
try {
gridCommitPrev();
} catch (e) {}
}
_j571.begin();
clear();
background(255, 255, 255);
_j571.end();
_j511 = false;
_j512 = false;
_j523 = 0;
_j513 = false;
_j514 = true;
let _j798 = null;
if (pathPoints.length > 0) {
let _j799 = 0,
_j800 = 0;
let minX = pathPoints[0].x;
let maxX = pathPoints[0].x;
let minY = pathPoints[0].y;
let maxY = pathPoints[0].y;
for (let pt of pathPoints) {
_j799 += pt.x;
_j800 += pt.y;
if (pt.x < minX) minX = pt.x;
if (pt.x > maxX) maxX = pt.x;
if (pt.y < minY) minY = pt.y;
if (pt.y > maxY) maxY = pt.y;
}
const _j346 = _j799 / pathPoints.length;
const _j347 = _j800 / pathPoints.length;
_j528 = {
minX,
maxX,
minY,
maxY,
_j346,
_j347,
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
_j532.push({
points: [...pathPoints],
center: {
x: _j346,
y: _j347
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
_j533++;
if (_j532.length > _j534) {
_j532.shift();
}
_j798 = {
minX: _j528.minX,
maxX: _j528.maxX,
minY: _j528.minY,
maxY: _j528.maxY
};
}
pathPoints = [];
_j529 = false;
_j528 = null;
const _j801 = drawingSeed;
let _j802 = _j798;
if (!_j802 && _j532.length > 0) {
const lastStroke = _j532[_j532.length - 1];
if (lastStroke.bounds) {
_j802 = {
...lastStroke.bounds
};
}
}
if (_j802) {
pendingBugBounds = _j802;
} else {
if (_j532.length > 0) {
const lastStroke = _j532[_j532.length - 1];
if (lastStroke.bounds) {
pendingBugBounds = {
...lastStroke.bounds
};
}
}
}
if (_j527 && _j590) {
randomSeed(strokeSeed);
noiseSeed(strokeSeed);
let _j803 = false;
if (_j590 && recordingData && recordingData.events) {
let _j804 = 0;
for (let e of recordingData.events) {
const _j813 = e.m || e.type;
if (_j813 === 'mr' || _j813 === 'mouseReleased') {
_j804++;
}
}
const _j805 = _j533;
const _j806 = _j805 >= (_j804 - 12);
_j803 = _j806;
if (_j803) {
const _j807 = crandom.random(0, 1) > 0.1;
if (_j807) {
console.log('全局扫描');
pendingBugBounds = null;
} else {
if (_j802 && !pendingBugBounds) {
console.log('局部扫描');
pendingBugBounds = _j802;
}
}
}
} else if (!_j590) {
_j803 = true;
}
if (_j803) {
_j664 = true;
_j665 = strokeSeed;
if (!_j590 && _j802 && !pendingBugBounds) {
pendingBugBounds = _j802;
}
} else {
if (_j802 && !pendingBugBounds) {
pendingBugBounds = _j802;
}
}
randomSeed(_j801);
noiseSeed(_j801);
}
if (typeof gc !== 'undefined') {
gc();
}
_j522 = true;
}
function _j36() {
if (_j513 && !_j514) {
if (_j511 || _j512) {
_j35();
}
}
}
function _j37() {
if (!recordingData.events || recordingData.events.length === 0) {
return [];
}
const _j808 = [];
const _j809 = 20;
let _j810 = _j592;
let _j805 = null;
const offsetX = typeof _j602 !== 'undefined' ? _j602 : 0;
const offsetY = typeof _j603 !== 'undefined' ? _j603 : 0;
const _j811 = 500;
let _j812 = 0;
while (_j808.length < _j809 && _j810 < recordingData.events.length && _j812 < _j811) {
const event = recordingData.events[_j810];
const _j813 = event.m || event.type;
if (_j813 === 'mp' || _j813 === 'mousePressed') {
_j805 = {
path: [{
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
}],
eventIndex: _j810,
data: event.strokeData || event.d || {}
};
} else if ((_j813 === 'md' || _j813 === 'mouseDragged') && _j805) {
_j805.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
} else if ((_j813 === 'mr' || _j813 === 'mouseReleased') && _j805) {
_j805.path.push({
x: (event.x + offsetX) - hw,
y: (event.y + offsetY) - hh,
t: event.t || 0
});
_j808.push(_j805);
_j805 = null;
}
_j810++;
_j812++;
}
return _j808;
}
function _j38() {
if (!_j590 || !recordingData.events || recordingData.events.length === 0) {
_j573.clear();
return;
}
const now = millis();
const _j814 =
_j536.lastEventIndex !== _j592 ||
(now - _j536.lastUpdateTime) > _j536.updateInterval;
if (_j814) {
_j536.cachedStrokes = _j37();
_j536.lastEventIndex = _j592;
_j536.lastUpdateTime = now;
}
const _j808 = _j536.cachedStrokes;
_j573.clear();
if (_j808.length === 0) {
return;
}
_j573.push();
const time = millis() * 0.003;
for (let i = 0; i < _j808.length; i++) {
const _j815 = _j808[i];
const path = _j815.path;
if (!path || path.length < 2) continue;
const alpha = map(i, 0, _j808.length - 1, 200, 80);
const _j816 = sin(time + i * 0.8) * 0.3 + 1;
const _j817 = _j815.eventIndex * 0.1;
const _j818 = 20;
const _j819 = min(max(floor(path.length / 5), 2), _j818);
const _j820 = [];
for (let s = 0; s < _j819; s++) {
const t = s / (_j819 - 1);
const _j290 = t * (path.length - 1);
const _j821 = floor(_j290);
const _j822 = min(_j821 + 1, path.length - 1);
const _j823 = _j290 - _j821;
const x1 = path[_j821].x;
const y1 = path[_j821].y;
const x2 = path[_j822].x;
const y2 = path[_j822].y;
const t1 = path[_j821].t || 0;
const t2 = path[_j822].t || 0;
if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
continue;
}
_j820.push({
x: lerp(x1, x2, _j823),
y: lerp(y1, y2, _j823),
t: lerp(t1, t2, _j823)
});
}
const _j824 = [];
let _j825 = 0.01;
for (let j = 1; j < _j820.length; j++) {
const dx = _j820[j].x - _j820[j-1].x;
const dy = _j820[j].y - _j820[j-1].y;
const dt = _j820[j].t - _j820[j-1].t;
const _j826 = dt > 0 ? Math.sqrt(dx*dx + dy*dy) / dt : 0;
_j824.push(_j826);
if (_j826 > _j825) _j825 = _j826;
}
_j573.noFill();
_j573.strokeCap(ROUND);
for (let j = 1; j < _j820.length; j++) {
const _j746 = constrain(_j824[j-1] / _j825, 0, 1);
const r = Math.round(_j746 * 255);
const g = Math.round(Math.max(0, (1 - Math.abs(_j746 - 0.5) * 2)) * 200);
const b = Math.round((1 - _j746) * 255);
_j573.stroke(r, g, b, 160);
_j573.strokeWeight(1.0);
_j573.line(
_j820[j-1].x, _j820[j-1].y,
_j820[j].x, _j820[j].y
);
}
let _j827 = 0;
for (let j = 0; j < _j820.length - 1; j++) {
_j827 += dist(_j820[j].x, _j820[j].y, _j820[j + 1].x, _j820[j + 1].y);
}
if (isNaN(_j827) || _j827 <= 0 || _j820.length < 2) {
continue;
}
const _j828 = constrain(floor(_j827 / 150), 1, 3);
for (let a = 0; a < _j828; a++) {
_j573.push();
const _j829 = (time * 0.1 + _j817 + a * (1.0 / _j828)) % 1.0;
const _j830 = _j829 * _j827;
let _j831 = 0;
let _j832 = _j820[0].x;
let _j833 = _j820[0].y;
let angle = 0;
for (let j = 0; j < _j820.length - 1; j++) {
const _j834 = dist(_j820[j].x, _j820[j].y, _j820[j + 1].x, _j820[j + 1].y);
if (_j834 <= 0.0001) {
_j832 = _j820[j + 1].x;
_j833 = _j820[j + 1].y;
if (j + 1 < _j820.length - 1) {
angle = atan2(_j820[j + 2].y - _j820[j + 1].y, _j820[j + 2].x - _j820[j + 1].x);
} else {
angle = atan2(_j820[j + 1].y - _j820[j].y, _j820[j + 1].x - _j820[j].x);
}
break;
}
if (_j831 + _j834 >= _j830) {
const _j823 = (_j830 - _j831) / _j834;
const _j835 = isNaN(_j823) || !isFinite(_j823) ? 0 : constrain(_j823, 0, 1);
_j832 = lerp(_j820[j].x, _j820[j + 1].x, _j835);
_j833 = lerp(_j820[j].y, _j820[j + 1].y, _j835);
angle = atan2(_j820[j + 1].y - _j820[j].y, _j820[j + 1].x - _j820[j].x);
break;
}
_j831 += _j834;
}
const _j836 = 200 * (1 - _j829 * 0.5);
_j573.translate(_j832, _j833);
_j573.rotate(angle);
const _j837 = 1.0 + sin(time * 3 + i + a) * 0.2;
_j573.fill(0, 0, 255, _j836);
_j573.noStroke();
_j573.triangle(
0, 0,
-4 * _j837, -2 * _j837,
-4 * _j837, 2 * _j837
);
_j573.stroke(0, 150, 255, _j836);
_j573.strokeWeight(0.3);
_j573.noFill();
_j573.triangle(
0, 0,
-4 * _j837, -2 * _j837,
-4 * _j837, 2 * _j837
);
_j573.pop();
}
const _j838 = path[0];
const _j389 = path[path.length - 1];
_j573.noFill();
_j573.stroke(0, 0, 255, 150);
_j573.strokeWeight(0.8);
_j573.ellipse(_j838.x, _j838.y, 5, 5);
_j573.ellipse(_j389.x, _j389.y, 5, 5);
_j573.noStroke();
_j573.fill(0, 0, 255, 255);
_j573.ellipse(_j838.x, _j838.y, 2, 2);
_j573.ellipse(_j389.x, _j389.y, 2, 2);
if (font) {
_j573.textFont(font);
_j573.noStroke();
const data = _j815.data;
const brushMode = data.brushMode || '?';
const seed = data.strokeSeed ? String(data.strokeSeed).slice(-3) : '???';
const size = data.initialSize ? data.initialSize.toFixed(0) : '?';
const _j839 = _j838.x - 2;
const _j840 = _j838.y + 8;
_j573.textSize(6);
_j573.fill(0, 0, 255, 255);
_j573.textAlign(LEFT, CENTER);
_j573.text('#' + (i + 1), _j839, _j840);
}
}
_j573.pop();
}
function _j39() {
_j569.clear();
_j569.push();
_j569.noFill();
_j569.noStroke();
_j569.rectMode(CENTER);
let _j746 = (width * 0.05) / height;
_j569.rect(0, 0, width * 0.95, height * (1 - _j746));
_j569.translate(-width / 2 - 5, -height / 2 + 20);
_j569.textAlign(LEFT, TOP);
if (font) {
_j569.textFont(font);
}
_j569.textSize(6);
let _j841 = width - 50;
_j569.fill(0, 0, 0, 100);
_j569.noStroke();
let _j842 = [];
let _j256 = _j660;
let _j843 = Math.max(0, _j656.length - _j657 - _j658);
let _j844 = _j656.length;
for (let i = _j843; i < _j844; i++) {
let line = _j656[i];
let _j845 = _j42(line.text, _j841, _j569);
for (let j = 0; j < _j845.length; j++) {
if (_j842.length >= _j657) break;
_j842.push({
type: line.type,
text: _j845[j],
timestamp: line.timestamp
});
}
if (_j842.length >= _j657) break;
}
for (let i = 0; i < _j842.length; i++) {
let line = _j842[i];
let y = _j660 + i * _j661;
if (line.type === 'recording') {
_j569.fill(255, 0, 0, _j662);
} else if (line.type === 'playback') {
_j569.fill(0, _j662);
} else if (line.type === 'system') {
_j569.fill(0, 0, 255, _j662);
} else if (line.type === 'art') {
_j569.fill(0, _j662);
} else {
_j569.fill(0, _j662);
}
_j569.text("--", _j659, y);
_j569.text(line.text, _j659, y);
}
_j41();
_j569.pop();
_j40();
}
function _j40() {
if (window.showStrokeDivider === false) return;
const _j846 = (typeof _j532 !== 'undefined' && Array.isArray(_j532)) ?
_j532.length :
0;
if (_j846 === 0) return;
_j569.push();
_j569.resetMatrix();
_j569.translate(0, 0);
const _j847 = hh - 15;
const _j848 = width * 0.98;
const _j849 = -_j848 / 2;
const _j850 = _j848 / 2;
const _j851 = _j850 - _j849;
_j569.stroke(0, 50);
_j569.strokeWeight(1);
_j569.noFill();
_j569.line(_j849, _j847, _j850, _j847);
_j569.strokeWeight(1.2);
_j569.line(_j849, _j847 + 5, _j849, _j847 - 5);
_j569.line(_j850, _j847 + 5, _j850, _j847 - 5);
if (_j846 > 0) {
const _j852 = _j851 / _j846;
_j569.stroke(0, 70);
_j569.strokeWeight(0.7);
for (let i = 1; i < _j846; i++) {
const x = _j849 + i * _j852;
_j569.line(x, _j847 - 5, x, _j847);
}
if (font) _j569.textFont(font);
_j569.textAlign(CENTER, CENTER);
_j569.textSize(10);
_j569.fill(0, 50);
_j569.noStroke();
const _j839 = _j850;
const _j840 = _j847 - 15;
_j569.text(_j846.toString(), _j839, _j840);
}
_j569.pop();
}
function _j41() {
if (currentStrokeHighlight && currentStrokeHighlight.gridParams) {
const _j853 = millis();
const _j398 = _j853 - currentStrokeHighlight.startTime;
const _j854 = 1000;
const _j855 = _j854 * 0.5;
if (_j398 < _j854) {
let alpha = 255;
if (_j398 > _j855) {
const _j856 = (_j398 - _j855) / (_j854 - _j855);
alpha = 255 * (1 - _j856);
}
const gp = currentStrokeHighlight.gridParams;
_j569.push();
_j569.resetMatrix();
_j569.translate(-hw - 10, -hh - 10);
if (currentStrokeHighlight.points && currentStrokeHighlight.points.length > 1) {
const _j381 = 5;
const _j382 = 5;
_j569.stroke(255, 0, 0, alpha);
_j569.strokeWeight(1);
_j569.noFill();
let _j857 = true;
let _j831 = 0;
for (let i = 0; i < currentStrokeHighlight.points.length - 1; i++) {
let x1 = currentStrokeHighlight.points[i].x;
let y1 = currentStrokeHighlight.points[i].y;
let x2 = currentStrokeHighlight.points[i + 1].x;
let y2 = currentStrokeHighlight.points[i + 1].y;
let _j383 = dist(x1, y1, x2, y2);
let dx = (x2 - x1) / _j383;
let dy = (y2 - y1) / _j383;
let _j384 = 0;
while (_j384 < _j383) {
let _j385 = _j857 ? _j381 : _j382;
let _j386 = min(_j385 - _j831, _j383 - _j384);
if (_j857) {
let startX = x1 + dx * _j384;
let startY = y1 + dy * _j384;
let _j387 = x1 + dx * (_j384 + _j386);
let _j388 = y1 + dy * (_j384 + _j386);
_j569.line(startX, startY, _j387, _j388);
}
_j384 += _j386;
_j831 += _j386;
if (_j831 >= (_j857 ? _j381 : _j382)) {
_j857 = !_j857;
_j831 = 0;
}
}
}
if (currentStrokeHighlight.points.length > 0) {
const _j838 = currentStrokeHighlight.points[0];
const _j389 = currentStrokeHighlight.points[currentStrokeHighlight.points.length - 1];
_j569.fill(255, 0, 0, alpha);
_j569.noStroke();
_j569.ellipse(_j838.x, _j838.y, 5, 5);
_j569.fill(255, 0, 0, alpha);
_j569.ellipse(_j389.x, _j389.y, 5, 5);
}
}
const _j346 = (gp.left + gp.right) / 2;
const _j347 = (gp.top + gp.bottom) / 2;
_j569.stroke(0, 0, 200, alpha);
_j569.strokeWeight(1.0);
_j569.noFill();
_j569.rectMode(CORNER);
_j569.rect(gp.left, gp.top, gp.right - gp.left, gp.bottom - gp.top);
_j569.pop();
} else {
currentStrokeHighlight = null;
}
}
}
function _j42(text, _j1436, _j1428 = null) {
let _j858 = text.split(' ');
let _j721 = [];
let _j859 = '';
for (let i = 0; i < _j858.length; i++) {
let _j860 = _j859 + (_j859 ? ' ' : '') + _j858[i];
let _j861 = _j1428 ? _j1428.textWidth(_j860) : textWidth(_j860);
if (_j861 > _j1436 && _j859) {
_j721.push(_j859);
_j859 = _j858[i];
} else {
_j859 = _j860;
}
}
if (_j859) {
_j721.push(_j859);
}
return _j721;
}
function _j43() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.style.width = (width * 1.0) + 'px';
referenceContainer.style.height = (height * 1.0) + 'px';
_j100('system', 'Reference image size updated', {
Width: (width * 0.8) + 'px',
Height: (height * 0.8) + 'px'
});
}
}
function touchStarted(e) {
if (e && e.touches && e.touches.length > 0) {
var t = e.touches[0];
if (_j44(t.clientX, t.clientY)) {
_j520 = true;
return true;
}
}
if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
_j506 = _j167(mouseX);
_j507 = _j167(mouseY);
window._touchDrawing = true;
mousePressed();
return false;
}
}
function touchMoved() {
if (_j520) return true;
_j506 = _j167(mouseX);
_j507 = _j167(mouseY);
return false;
}
function touchEnded() {
if (_j520) {
_j520 = false;
return true;
}
_j520 = false;
window._touchDrawing = false;
mouseReleased();
return false;
}
if (typeof window !== 'undefined') {
window.pendingEffectControlScanQueue = pendingEffectControlScanQueue;
}
function _j44(clientX, clientY) {
const _j862 = [
document.getElementById('message-overlay'),
document.getElementById('control-panel'),
document.getElementById('effect-control-panel'),
document.getElementById('flow-effect-panel'),
document.getElementById('zen-mode-btn')
];
for (let panel of _j862) {
if (!panel) continue;
const rect = panel.getBoundingClientRect();
if (clientX >= rect.left && clientX <= rect.right &&
clientY >= rect.top && clientY <= rect.bottom) {
return true;
}
}
return false;
}
function _j45() {
if (_j532.length === 0) return null;
const lastStroke = _j532[_j532.length - 1];
if (lastStroke && lastStroke.bounds) {
const _j863 = 20;
return {
minX: Math.max(0, (lastStroke.bounds.minX - _j863)) / width,
minY: Math.max(0, (lastStroke.bounds.minY - _j863)) / height,
maxX: Math.min(width, (lastStroke.bounds.maxX + _j863)) / width,
maxY: Math.min(height, (lastStroke.bounds.maxY + _j863)) / height
};
}
if (lastStroke && lastStroke.gridParams) {
const gp = lastStroke.gridParams;
const _j863 = 20;
return {
minX: Math.max(0, (gp.left - _j863)) / width,
minY: Math.max(0, (gp.top - _j863)) / height,
maxX: Math.min(width, (gp.right + _j863)) / width,
maxY: Math.min(height, (gp.bottom + _j863)) / height
};
}
return null;
}
function _j46(blendType, seed = null, _j1437 = false) {
if (!_j478) return;
_j547 = true;
_j548 = blendType;
_j549 = millis();
_j555 = 0;
_j550 = 0;
_j558 = _j1437;
_j552 = seed !== null ? seed : Math.floor(Math.random() * 1000000);
_j560.seed = _j552 * 0.0001;
}
function _j47() {
if (!_j547) return null;
const duration = millis() - _j549;
const iterations = _j550;
const frames = _j555;
if (iterations > 0 && flowEffectStrokeBounds) {
_j553 = true;
_j554 = {
blendType: _j548,
iterations: iterations,
seed: _j552,
bounds: {
...flowEffectStrokeBounds
}
};
}
_j547 = false;
_j548 = 0;
_j558 = false;
return {
duration,
iterations,
frames
};
}
function _j48() {
if (!_j547) return;
_j555++;
_j550 = Math.floor(_j555 / _j559);
if (_j558 && _j556 > 0) {
if (_j555 >= _j556) {
_j550 = _j557;
const _j864 = document.getElementById('flow-iteration-count');
if (_j864) {
_j864.textContent = _j550;
}
_j47();
_j556 = 0;
_j557 = 0;
return;
}
}
const _j864 = document.getElementById('flow-iteration-count');
if (_j864) {
_j864.textContent = _j550;
}
}
function _j49(blendType, seed, iterations) {
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
_j560.seed = seed * 0.0001;
_j553 = true;
_j554 = {
blendType: blendType,
iterations: iterations,
seed: seed,
bounds: {
...flowEffectStrokeBounds
}
};
console.log('🌊 replayFlowEffect: set pendingCommit with data:', _j554);
}
const _j865 = [{
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
function _j50(_j1428, _j876, _j877, brushColorMode, alpha) {
if (brushColorMode === 0) {
stroke(_j876, alpha);
} else if (brushColorMode === 1) {
stroke(150, alpha);
} else {
stroke(_j877, alpha);
}
}
function _j51(_j1428, _j876, _j877, brushColorMode, alpha) {
if (brushColorMode === 0) {
fill(_j876, alpha);
} else if (brushColorMode === 1) {
fill(150, alpha);
} else {
fill(_j877, alpha);
}
}
function _j52(id, _j1428, _j959, x, y, _j920, _j921, _j913, _j914, _j934, sizeVariation, _j953) {
let _j866 = _j934 * sizeVariation + _j953;
const _j867 = (_j515 && typeof _j519 !== 'undefined' && _j519 !== null) ? _j519 : baseBrushSize;
const _j868 = _j867 < 0.25;
let _j869 = _j868 ? max(2.0, _j867 * 10) : 15;
if (_j866 > _j869) {
_j866 = crandom.random(_j868 ? 0.6 : 1, _j869);
}
let sw = max(_j868 ? 0.6 : 1, _j866);
if (sw < 3) sw *= 2.0;
const offsetX = _j959.offsetX;
const offsetY = _j959.offsetY;
if (brushModeSP) {
const _j870 = max(0.15, min(1.5, _j867));
let show = crandom.random(0, 1) > 0.8 ? 1 : 0;
let _j871 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j870, 6 * _j870) : crandom.random(-16 * _j870, 16 * _j870);
let _j872 = crandom.random(0, 1) > 0.05 ? crandom.random(-6 * _j870, 6 * _j870) : crandom.random(-16 * _j870, 16 * _j870);
if (show == 1) {
strokeWeight(crandom.random(0.5, 1.5))
line(
x + offsetX + _j913,
y + offsetY + _j914,
_j920 + offsetX + _j871,
_j921 + offsetY + _j872
);
} else {
sw = min(1, sw)
strokeWeight(sw + 0.5);
if (sw < 4) line(
x + offsetX + _j913,
y + offsetY + _j914,
_j920 + offsetX,
_j921 + offsetY
);
}
} else if (!brushModeSP) {
if (_j867 < 4.0) {
strokeWeight(sw);
} else {
strokeWeight(crandom.random(sw * 0.5, sw));
}
line(
x + offsetX + _j913,
y + offsetY + _j914,
_j920 + offsetX,
_j921 + offsetY
);
}
}
const _j873 = [{
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
const _j874 = [{
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
const _j875 = [{
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
function _j53(_j1428, _j1438, _j1439) {
if (_j524 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j524, ">=", expectedStrokeLength, ")");
return;
}
_j1428.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
let _j876 = _j56(_j479);
let _j877 = _j56(_j479);
const _j878 = _j590 ? _j596 : pmouseX;
const _j879 = _j590 ? _j597 : pmouseY;
let _j880 = 0.5 * initialSize * noise(_j1438 * 0.01, _j1439 * 0.01) * (abs(_j1438 - _j878) + abs(_j1439 - _j879));
const _j881 = (_j515 && typeof _j519 !== 'undefined' && _j519 !== null) ? _j519 : baseBrushSize;
let _j882 = 0;
_j882 = min(spraySize * _j881, _j880) * map(noise(_j1438, _j1439), 0, 1, 0.3, 1);
let _j883 = max(3, _j882);
if (_j524 < 5) {
let _j884 = map(_j524, 0, 5, -0.2, 1.0);
_j883 = max(2, _j882 * _j884);
} else if (_j524 >= (expectedStrokeLength - 5)) {
let _j885 = map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 1.0, -0.2);
_j883 = max(2, _j882 * _j885);
}
for (let i = 0; i < _j531; i++) {
const _j886 = lerp(_j1438, _j878, i / _j531)
const lerpY = lerp(_j1439, _j879, i / _j531)
for (let j = 0; j < 10; j++) {
let _j871, _j872;
let _j887 = crandom.random(0, 1) > 0.1 ? 1 : 1.5;
const _j888 = crandom.random(TWO_PI);
const _j889 = crandom.random();
const _j890 = crandom.random(-_j883 * _j887, _j883 * _j887);
const _j891 = crandom.random(-_j883 * _j887, _j883 * _j887);
if (shapeType === 0) {
const angle = _j888;
const radius = sqrt(_j889) * _j883;
_j871 = radius * cos(angle);
_j872 = radius * sin(angle);
} else if (shapeType === 1) {
_j871 = sin(_j888) * _j890;
_j872 = cos(_j888) * _j891;
} else if (shapeType === 2) {
const u = _j888 / TWO_PI;
const v = _j889;
if (u + v > 1) {
_j871 = _j883 * (1 - u);
_j872 = _j883 * (1 - v);
} else {
_j871 = _j883 * u;
_j872 = _j883 * v;
}
_j871 -= _j883 * 0.5;
_j872 -= _j883 * 0.5;
} else {
const u = _j890 / _j883;
const v = _j891 / _j883;
const _j892 = abs(u) + abs(v);
if (_j892 > 1) {
_j871 = (u / _j892) * _j883;
_j872 = (v / _j892) * _j883;
} else {
_j871 = u * _j883;
_j872 = v * _j883;
}
}
let _j736 = crandom.random(0, 1);
let _j737 = crandom.random(0.2, 1);
let _j893 = crandom.random(1, 2);
let _j894 = _j881 < 0.25 ? 0.1 : 0.3;
_j737 = max(_j894, _j737 * _j881);
_j893 = max(_j894, _j893 * _j881);
let _j895 = crandom.random(100, 255);
let ss = _j736 > 0.1 ? _j737 : _j893;
if (brushMode == 3 || brushMode == 5) ss = ss * 2;
let _j896 = _j881 < 0.25 ? max(0.3, _j881 * 3) : 2;
let _j897 = _j881 < 0.25 ? _j881 * 5 : 20;
ss = max(_j896, min(_j897, ss));
_j51(_j1428, _j876, _j877, brushColorMode, _j895);
noStroke();
ellipse(_j886 + _j871, lerpY + _j872, ss, ss)
}
}
pop();
_j1428.end();
}
function _j54(_j1428, _j1438, _j1439, _j755, _j485 = 0, _j1440 = 0) {
if (_j524 >= expectedStrokeLength) {
console.log("Brush not drawn: mouseCount >= expectedStrokeLength (", _j524, ">=", expectedStrokeLength, ")");
return;
}
_j1428.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j876 = _j56(_j479);
let _j877 = _j56(_j479);
const _j898 = (_j515 && typeof _j519 !== 'undefined' && _j519 !== null) ? _j519 : baseBrushSize;
const _j899 = _j515 ? (_j590 ? (typeof _playbackPenPressure !== 'undefined' ? _playbackPenPressure : -1) : _j518) : -1;
const _j900 = (_j899 >= 0) ? (0.7 + 0.4 * Math.min(_j899 / 0.7, 1.0)) : 1.0;
let _j868 = _j898 < 0.25;
let _j901 = 0.6;
let _j902 = _j868 ?
crandom.random(0.4, 0.8) :
crandom.random(baseBrushSize * 0.8, baseBrushSize * 2.0);
let swFloorTiny = max(_j901, baseBrushSize * 2);
let _j903 = max(_j901, baseBrushSize * 1.5);
let _j904 = _j868 ? swFloorTiny : _j903;
if (_j904 < 3) _j904 *= 2.0;
let _j905 = _j868 ?
swFloorTiny :
max(_j901, baseBrushSize * 1.2);
if (_j905 < 3) _j905 *= 2.0;
let _j906;
if (_j868) {
_j906 = max(2.0, _j898 * 10);
} else if (_j898 < 0.5) {
_j906 = 0.7;
} else {
_j906 = 9999;
}
_j502 = _j492 * 0.5;
let _j408 = _j1438;
let _j409 = _j1439;
if (!_j505) {
_j505 = 1;
x = _j408;
y = _j409;
}
_j489 += (_j408 - x) * _j486;
_j490 += (_j409 - y) * _j486;
_j489 *= _j487;
_j490 *= _j487;
let _j907 = sqrt(_j489 * _j489 + _j490 * _j490);
_j491 += _j907 - _j491;
if (baseBrushSize <= 1.0) {
_j491 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j491 *= 1.3;
} else if (baseBrushSize <= 3.0) {
_j491 *= 2.0;
} else {
_j491 *= 3.0;
}
_j492 = _j488 - _j491;
let _j908 = brushPaintCtlNoisebyFrame;
let _j909 = 1.0 * baseBrushSize * _j908 * _j900;
let _j910 = 2.0 * baseBrushSize * _j908 * _j900;
let _j911 = 3.0 * baseBrushSize * _j908 * _j900;
let showMainBrush = 0.1;
let _j912 = initialSize;
let _j913 = 0;
let _j914 = 0;
if (_j1440 == 0) showMainBrush = 0.08;
else if (_j1440 == 1) showMainBrush = 0.6;
else if (_j1440 == 2) showMainBrush = 0.2;
let _j915 = 1.0;
let _j916 = _j484 + brushPaintInterpolationOffset;
for (let i = 0; i < _j916; ++i) {
let _j917 = baseBrushSize >= 1.0 ? 5 : 3;
let _j918 = baseBrushSize >= 1.0 ? 2 : 0;
let _j919 = 0;
if (baseBrushSize < 1.5) _j919 = crandom.random(0, 1) > 0.4 ? 0 : crandom.random(0, 1) > 0.4 ? 1 : 2;
else if (baseBrushSize > 1.5 && baseBrushSize < 6.0) _j919 = crandom.random(0, 1) > 0.4 ? 2 : crandom.random(0, 1) > 0.6 ? 3 : 4;
else if (baseBrushSize > 6.0) _j919 = crandom.random(0, 1) > 0.3 ? 3 : 4;
if (brushModeSP) _j919 = crandom.random(0, 1) > 0.3 ? 3 : crandom.random(0, 1) > 0.5 ? 2 : 4
_j485 = _j919;
if (_j524 < 5) _j485 = crandom.random(0, 1) > 0.2 ? 5 : _j485;
let _j920 = x;
let _j921 = y;
x += _j489 / _j916;
y += _j490 / _j916;
let _j922 = crandom.random(0, 1);
let _j923 = crandom.random(0, 4);
let _j924 = crandom.random(0, 3);
let _j925 = crandom.random(-1, 1);
let _j926 = crandom.random(-1, 1);
let _j927 = crandom.random(-1, 1);
let _j928 = crandom.random(-1, 1);
let _j929 = showMainBrush;
let _j930 = 1.0;
if (_j485 == 3) {
_j929 *= 0.8;
_j930 *= 0.8;
} else if (_j485 == 4) {
_j929 *= 0.6;
_j930 *= 0.5;
}
if (_j898 < 0.25) {
_j929 = 0.18;
} else if (_j898 < 1.5) {
_j929 = 0.1;
}
_j496 = lerp(_j496, _j492, 0.5);
if (brushMode == 1) {
if (_j922 > 0.8 && _j502 < 2 && i == 0) {
_j502 = _j167(_j923);
}
} else {
_j502 += (_j496 - _j502) * 0.3;
}
let _j931;
if (brushMode == 1) {
_j931 = _j502;
} else {
if (_j524 < 5) {
let _j884 = map(_j524, 0, 5, 0.05, 1.0);
_j931 = max(_j868 ? 0.1 : 0.5, _j502 * _j884);
if (explodeStart) {
_j913 = _j925 * map(_j524, 0, 5, 10, 0);
_j914 = _j926 * map(_j524, 0, 5, 10, 0);
}
} else if (_j524 >= (expectedStrokeLength - 5)) {
let _j885 = map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j931 = max(_j868 ? 0.1 : 0.5, _j502 * _j885);
if (explodeEnd) {
_j913 = _j927 * map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j914 = _j928 * map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
if (_j502 > 2) {
_j931 = max(_j868 ? 0.2 : 1, _j502);
} else {
let _j932 = (_j924 / 3) - 0.5;
_j931 = max(_j868 ? 0.1 : 0.5, _j502 + _j932);
}
}
}
let _j933 = _j931;
let _j934 = _j931 * 0.5;
if (_j485 == 3) {
_j933 *= 0.8;
_j934 *= 0.8;
} else if (_j485 == 4) {
_j933 *= 0.5;
_j934 *= 0.5;
}
let _j935 = crandom.random(0, 1);
let _j936 = crandom.random(150, 255);
let _j937 = crandom.random(100, 255);
let _j938 = crandom.random(100, 255);
let _j939 = crandom.random(100, 255);
if (_j868) {
if (!brushModeSP && _j524 > 1) {
_j50(_j1428, _j876, _j877, brushColorMode, _j936);
let kk = min(_j912, max(_j904, _j933));
strokeWeight(min(_j906, kk));
line(x + _j913, y + _j914, _j920, _j921);
}
} else if (_j935 > _j929) {
_j50(_j1428, _j876, _j877, brushColorMode, _j936);
const _j940 = !brushModeSP && _j524 > 3 && baseBrushSize < 4.0;
if (_j933 < 5) {
let kk = 0;
if (_j1440 == 0) kk = 1.5 * min(_j912, max(_j904, _j933));
else kk = min(_j912, max(_j904, _j933));
strokeWeight(min(_j906, kk));
if (_j940) line(x + _j913, y + _j914, _j920, _j921)
} else {
let kk = _j930 * min(_j912, max(_j904, _j933));
if (kk > 15) kk = crandom.random(1.5, kk);
strokeWeight(min(_j906, kk));
if (_j940) line(x + _j913, y + _j914, _j920, _j921)
}
}
const _j941 = [];
const _j942 = [];
for (let j = 0; j < 30; j++) {
_j941.push(crandom.random(0, 1));
_j942.push(crandom.random(-0.5, 0.5) * _j915);
}
if (_j1440 == 1) {
_j941[0] = _j941[0] * 2.0;
_j941[1] = _j941[1] * 0.5;
_j941[2] = _j941[2] * 0.5;
} else if (_j1440 == 2) {
_j941[0] = _j941[0] * 0.5;
_j941[1] = _j941[1] * 0.5;
_j941[2] = _j941[2] * 0.5;
}
const _j943 = _j865[brushDir];
if (_j485 == 0) {
_j50(_j1428, _j876, _j877, brushColorMode, _j937);
if (_j941[0] > 0.2) {
const _j944 = _j943.flip1stX ? -1 : +1;
const _j945 = _j943.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.1, y * 0.1), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j942[0], sizeVariation);
if (_j934 * sizeVariation < 5) {
strokeWeight(min(_j906, noise(x * 0.1, y * 0.2) + 1.5 * max(_j905, _j934 * sizeVariation)));
} else {
strokeWeight(min(_j906, _j930 * max(_j902, _j934 * sizeVariation)));
}
line(x + _j944 * _j910 + _j913, y + _j945 * _j910 + _j914, _j920 + _j944 * _j910, _j921 + _j945 * _j910);
}
if (_j941[1] > 0.3) {
const _j946 = _j943.flip1stX ? -1 : +1;
const _j947 = _j943.flip1stY ? +1 : -1;
_j50(_j1428, _j876, _j877, brushColorMode, _j938);
let sizeVariation = map(noise(x * 0.3 + 300, y * 0.3 + 300), 0, 1, 0.6, 1.5);
sizeVariation = max(1 + _j942[1], sizeVariation);
strokeWeight(min(_j906, _j930 * max(_j902, _j934 * sizeVariation)));
line(x + _j946 * _j910 + _j913, y + _j947 * _j910 + _j914, _j920 + _j946 * _j910, _j921 + _j947 * _j910);
}
} else if (_j485 == 1) {
_j50(_j1428, _j876, _j877, brushColorMode, _j937);
if (_j941[0] > 0.1) {
const _j944 = _j943.flip1stX ? -1 : +1;
const _j945 = _j943.flip1stY ? -1 : +1;
let sizeVariation = map(noise(x * 0.3 + 200, y * 0.1 + 100), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j942[0], sizeVariation);
strokeWeight(min(_j906, _j930 * max(_j902, _j934 * sizeVariation)));
line(x + _j944 * _j910 + _j913, y + _j945 * _j910 + _j914, _j920 + _j944 * _j910, _j921 + _j945 * _j910)
};
if (_j941[1] > 0.05) {
const _j946 = _j943.flip1stX ? -1 : +1;
const _j947 = _j943.flip1stY ? +1 : -1;
_j50(_j1428, _j876, _j877, brushColorMode, _j938);
let sizeVariation = map(noise(x * 0.2 + 300, y * 0.2 + 200), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j942[1], sizeVariation);
strokeWeight(min(_j906, _j930 * max(_j902, _j934 * sizeVariation)));
line(x + _j946 * _j909 + _j913, y + _j947 * _j909 + _j914, _j920 + _j946 * _j909, _j921 + _j947 * _j909)
};
if (_j941[2] > 0.15) {
const _j948 = -1;
const _j949 = -1;
_j50(_j1428, _j876, _j877, brushColorMode, _j939);
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.3 + 300), 0, 1, 0.8, 1.2);
sizeVariation = max(1 + _j942[2], sizeVariation);
if (_j934 * sizeVariation < 5) {
strokeWeight(min(_j906, noise(x * 1, y * 2) + 1.5 * max(_j905, _j934 * sizeVariation)));
} else {
strokeWeight(min(_j906, _j930 * max(_j902, _j934 * sizeVariation)));
}
line(x + _j948 * _j911 + _j913, y + _j949 * _j911 + _j914, _j920 + _j948 * _j911, _j921 + _j949 * _j911)
};
} else if (_j485 == 2) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.8, 1.2);
_j50(_j1428, _j876, _j877, brushColorMode, _j937);
const _j950 = [_j941[0], _j941[1], _j941[2], _j941[3], _j941[4]];
const _j951 = [_j942[3], _j942[4], _j942[5], _j942[6], _j942[7]];
for (let i = 0; i < _j873.length; i++) {
const _j251 = _j873[i];
const _j952 = _j950[i];
const _j953 = _j951[i];
if (_j952 > _j251.randThreshold) {
let _j954;
if (_j251.offsetBase === 1) {
_j954 = _j909;
} else if (_j251.offsetBase === 2) {
_j954 = _j910;
} else if (_j251.offsetBase === 3) {
_j954 = _j911;
} else {
_j954 = _j251.offsetBase * baseBrushSize * _j908;
}
let _j955, _j956;
if (i === 0) {
_j955 = _j943.flip1stX ? -_j251.signX : _j251.signX;
_j956 = _j943.flip1stY ? -_j251.signY : _j251.signY;
} else {
_j955 = _j251.signX;
_j956 = _j251.signY;
}
let _j957 = _j955 * _j954;
let _j958 = _j956 * _j954;
const _j959 = {
offsetX: _j957,
offsetY: _j958,
randThreshold: _j251.randThreshold,
pathProgressEnd: _j251.pathProgressEnd,
jitterIndex: _j251.jitterIndex
};
_j52(
2, _j1428, _j959, x, y, _j920, _j921,
_j913, _j914, _j934, sizeVariation,
_j953
);
}
}
} else if (_j485 == 3) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.85, 1.15);
_j50(_j1428, _j876, _j877, brushColorMode, _j937);
let _j960 = baseBrushSize * _j908;
if (baseBrushSize > 4.0) _j960 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j874.length; i++) {
let _j961 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j251 = _j874[i];
const _j952 = _j941[i];
const _j953 = _j942[_j251.jitterIndex];
if (_j952 > _j251.randThreshold) {
const _j962 = cos(_j251.angle + _j961) * _j251.radius * _j960;
const _j963 = sin(_j251.angle + _j961) * _j251.radius * _j960;
const _j957 = (_j943.flip1stX ? -1 : 1) * _j962;
const _j958 = (_j943.flip1stY ? -1 : 1) * _j963;
const _j959 = {
offsetX: _j957,
offsetY: _j958,
randThreshold: _j251.randThreshold,
pathProgressEnd: _j251.pathProgressEnd,
jitterIndex: _j251.jitterIndex
};
_j52(
3, _j1428, _j959, x, y, _j920, _j921,
_j913, _j914, _j934, sizeVariation,
_j953
);
}
}
} else if (_j485 == 4) {
let sizeVariation = map(noise(x * 0.1 + 400, y * 0.1 + 200), 0, 1, 0.9, 1.1);
_j50(_j1428, _j876, brushColorMode, _j937);
let _j960 = baseBrushSize * _j908;
if (baseBrushSize > 4.0) _j960 *= crandom.random(0.5, 2.5);
for (let i = 0; i < _j875.length; i++) {
let _j961 = (baseBrushSize > 4.0) ? crandom.random(0, 6.28) : 0;
const _j251 = _j875[i];
const _j952 = _j941[i];
const _j953 = _j942[_j251.jitterIndex];
if (_j952 > _j251.randThreshold) {
const _j962 = cos(_j251.angle + _j961) * _j251.radius * _j960;
const _j963 = sin(_j251.angle + _j961) * _j251.radius * _j960;
const _j957 = (_j943.flip1stX ? -1 : 1) * _j962;
const _j958 = (_j943.flip1stY ? -1 : 1) * _j963;
const _j959 = {
offsetX: _j957,
offsetY: _j958,
randThreshold: _j251.randThreshold,
pathProgressEnd: _j251.pathProgressEnd,
jitterIndex: _j251.jitterIndex
};
_j52(
4, _j1428, _j959, x, y, _j920, _j921,
_j913, _j914, _j934, sizeVariation,
_j953
);
}
}
}
}
pop();
_j1428.end();
}
function _j55(_j1428, _j1438, _j1439, _j1441 = null, _j1442 = null, n = 80, o = 2) {
_j1428.begin();
push();
translate(-hw, -hh);
const _j878 = (_j1441 !== null && _j1442 !== null) ? _j1441 : (_j590 ? _j596 : pmouseX);
const _j879 = (_j1441 !== null && _j1442 !== null) ? _j1442 : (_j590 ? _j597 : pmouseY);
const _j964 = (_j515 && typeof _j519 !== 'undefined' && _j519 !== null) ? _j519 : baseBrushSize;
const _j965 = baseBrushSize;
const _j966 = _j524;
const _j967 = max(_j964 < 0.25 ? 0.3 : 1, initialSize - (_j524 * randStep));
o = min(_j965 * 2.0, 5 * _j967 * penSketchNoiseBase * map(sin(_j966 * 2), 0, 1, 0.5, 1.5));
const mouseMoved = abs(_j1438 - _j878) > 0.1 || abs(_j1439 - _j879) > 0.1;
let _j876 = _j56(_j479);
let _j877 = _j56(_j479);
const _j968 = [];
for (let i = 0; i < n; i++) {
_j968.push({
t: crandom.random(0, 1),
strokeWeight: max(_j964 < 0.25 ? 0.1 : 0.3, min(_j964 < 0.25 ? _j965 * 5 : 2, _j965 * crandom.random(-0.5, 1))),
angle: crandom.random(0, TWO_PI),
radius: sqrt(crandom.random(0, 1)) * o,
alpha: crandom.random(150, 255)
});
}
for (let i = 0; i < n; i++) {
const _j969 = _j968[i];
let t = _j969.t;
strokeWeight(_j969.strokeWeight);
const angle = _j969.angle;
const radius = _j969.radius;
let _j970 = radius * cos(angle);
let _j971 = radius * sin(angle);
let _j895 = _j969.alpha;
let x, y;
if (mouseMoved) {
x = lerp(_j1438, _j878, t) + _j970;
y = lerp(_j1439, _j879, t) + _j971;
} else {
x = _j1438 + _j970;
y = _j1439 + _j971;
}
_j50(_j1428, _j876, _j877, brushColorMode, _j895);
if (_j524 > 3) point(x, y);
}
pop();
_j1428.end();
}
if (typeof _j57.lastAngle === 'undefined') {
_j57.lastAngle = 0;
}
if (typeof _j57.lastMovementAngle === 'undefined') {
_j57.lastMovementAngle = 0;
}
const _j972 = [{
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
function _j56(_j876) {
if (brushColorMode === 0) {
return _j876 + crandom.random(10, 40);
} else {
return _j876 + crandom.random(30, 80);
}
}
function _j57(_j1428, _j1438, _j1439, _j755, _j485 = 0, _j1440 = 0) {
if (_j524 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j524, ">=", expectedStrokeLength, ")");
return;
}
const _j973 = (_j515 && typeof _j519 !== 'undefined' && _j519 !== null) ? _j519 : baseBrushSize;
let _j868 = _j973 < 0.25;
let _j906 = _j868 ? _j973 * 5 : 9999;
_j1428.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j876 = _j56(_j479);
let _j877 = _j56(_j479);
let _j912 = initialSize * 0.3;
let _j408 = _j1438;
let _j409 = _j1439;
if (!_j505) {
_j505 = 1;
x = _j408;
y = _j409;
}
_j489 += (_j408 - x) * _j486;
_j490 += (_j409 - y) * _j486;
_j489 *= _j487;
_j490 *= _j487;
_j491 += sqrt(_j489 * _j489 + _j490 * _j490) - _j491;
_j491 *= 1.2;
if (baseBrushSize <= 1.0) {
_j491 *= 0.9;
} else if (baseBrushSize <= 2.0) {
_j491 *= 1.3;
} else {
_j491 *= 1.5;
}
_j492 = _j488 - _j491;
let _j974 = _j496;
let _j975 = _j492;
let _j976 = _j408 - x;
let _j977 = _j409 - y;
let _j978 = sqrt(_j976 * _j976 + _j977 * _j977);
let _j979 = max(_j868 ? 0.1 : 0.5, _j975 * 0.5);
let _j980 = 1.5 * min(_j912, max(_j868 ? 0.5 : 4, _j979));
let _j981 = _j980 * 0.6;
let _j982 = 0.8;
let _j983 = max(_j981 * _j982, 0.5);
let _j984 = max(1, ceil(_j978 / _j983));
_j984 = max(10, min(50, _j984));
let _j985 = _j984 / _j484;
let _j913 = 0;
let _j914 = 0;
let _j986 = min(1.0, _j978 / 10);
let _j987 = _j986 > 0.3;
rectMode(CENTER);
let _j215 = crandom.random(50, 100);
const _j218 = [];
for (let i = 0; i < _j484; ++i) {
_j218.push({
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
for (let i = 0; i < _j484; ++i) {
const _j988 = _j218[i];
let _j920 = x;
let _j921 = y;
x += _j489 / _j484;
y += _j490 / _j484;
let _j399 = (i + 1) / _j484;
let _j989 = lerp(_j974, _j975, _j399);
_j496 = lerp(_j496, _j989, 0.5);
_j502 += (_j496 - _j502) * 0.8;
_j502 = max(_j868 ? 0.2 : 1.5, _j502);
let _j931;
let _j925 = _j988.explodeX1;
let _j926 = _j988.explodeY1;
let _j927 = _j988.explodeX2;
let _j928 = _j988.explodeY2;
if (_j524 < 5) {
let _j884 = map(_j524, 0, 5, 0.05, 1.0);
_j931 = max(_j868 ? 0.1 : 0.5, _j502 * _j884);
if (explodeStart) {
_j913 = _j925 * map(_j524, 0, 5, 10, 0);
_j914 = _j926 * map(_j524, 0, 5, 10, 0);
}
} else if (_j524 >= (expectedStrokeLength - 5)) {
let _j885 = map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 1.0, 0.05);
_j931 = max(_j868 ? 0.1 : 0.5, _j502 * _j885);
if (explodeEnd) {
_j913 = _j927 * map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
_j914 = _j928 * map(_j524, expectedStrokeLength - 5, expectedStrokeLength, 0, 10);
}
} else {
_j931 = max(_j868 ? 0.1 : 0.5, _j502);
}
let _j935 = _j988.showMainBrush;
let _j936 = _j988.mainAlpha;
let showMainBrush = 0.3;
let _j990 = showMainBrush;
if (_j985 > 1.0) {
_j990 = showMainBrush / _j985;
} else if (_j985 < 1.0) {
_j990 = showMainBrush * (2.0 - _j985);
}
if (_j935 > _j990 && _j524 > 5) {
noStroke();
_j50(_j1428, _j876, _j877, brushColorMode, _j936);
let ss = min(_j906, 1.2 * min(_j912, max(3 * _j973, _j931)));
let dx = x - _j920;
let dy = y - _j921;
let distance = sqrt(dx * dx + dy * dy);
let _j257;
const _j304 = 0.1;
if (distance < _j304) {
_j257 = _j57.lastAngle;
} else {
let _j991 = atan2(dy, dx);
_j257 = _j991 + PI / 2;
_j57.lastAngle = _j257;
_j57.lastMovementAngle = _j991;
}
push();
translate(x, y);
rotate(_j257);
let _j981 = ss * _j988.rectWidthMult;
rect(0, 0, _j981, _j981 * (0.5 + noise(x * 0.1, y * 0.1) * 0.5));
pop();
}
if (_j986 > 0.9 && _j524 > 5 && _j524 < (expectedStrokeLength - 5)) {
let _j992 = -sin(_j57.lastMovementAngle);
let _j993 = cos(_j57.lastMovementAngle);
for (let j = 0; j < _j972.length; j++) {
let _j994 = _j972[j];
let _j995 = _j988.flyWhiteRandoms[j];
let _j996 = _j994.randThreshold - _j986 * 0.3;
if (_j995 > _j996) {
let offsetX = _j992 * _j994.perpOffset * _j973;
let offsetY = _j993 * _j994.perpOffset * _j973;
stroke(_j215);
strokeWeight(min(_j906, max(_j868 ? 0.1 : 0.5, _j931 * 0.3)));
line(_j920 + offsetX, _j921 + offsetY, x + offsetX, y + offsetY);
}
}
}
}
pop();
_j1428.end();
}
let _j997 = [];
let _j998 = 0;
function _j58(baseBrushSize, strokeSeed) {
let _j999, _j1000;
if (baseBrushSize <= 0.1) {
_j999 = 2;
_j1000 = 4;
} else if (baseBrushSize <= 0.25) {
_j999 = 4;
_j1000 = 7;
} else if (baseBrushSize <= 0.5) {
_j999 = 6;
_j1000 = 10;
} else if (baseBrushSize <= 2.0) {
_j999 = 10;
_j1000 = 15;
} else if (baseBrushSize <= 3.0) {
_j999 = 20;
_j1000 = 30;
} else {
_j999 = 30;
_j1000 = 50;
}
let count;
if (_j999 === _j1000) {
count = _j999;
} else {
const _j1001 = strokeSeed + 50000;
randomSeed(_j1001);
count = Math.floor(crandom.random(_j999, _j1000 + 1));
}
const _j1002 = [];
const _j1003 = strokeSeed + 60000;
for (let i = 0; i < count; i++) {
const _j1004 = _j1003 + i * 1000;
randomSeed(_j1004);
const perpOffset = crandom.random(-6, 6);
const _j1005 = _j1003 + i * 2000 + 1;
randomSeed(_j1005);
const randThreshold = crandom.random(0.5, 1.0);
const _j1006 = _j1003 + i * 3000 + 2;
randomSeed(_j1006);
const sizeMultiplier = crandom.random(1.0, 2.0);
const _j1007 = _j1003 + i * 4000 + 3;
randomSeed(_j1007);
const speedMultiplier = crandom.random(0.7, 1.3);
const _j1008 = _j1003 + i * 5000 + 4;
randomSeed(_j1008);
const minStrokeWeight = crandom.random(0.8, 1.2);
const _j1009 = _j1003 + i * 6000 + 5;
randomSeed(_j1009);
const startOffset = Math.floor(crandom.random(0, 6));
const _j1010 = _j1003 + i * 7000 + 6;
randomSeed(_j1010);
const endDistanceOffset = crandom.random(0, 8);
const _j1011 = _j1003 + i * 8000 + 7;
randomSeed(_j1011);
const brushSpeedMultiplier = crandom.random(1.0, 2.0);
const _j1012 = _j1003 + i * 9000 + 8;
randomSeed(_j1012);
const widthVariationFactor = crandom.random(0, 1);
const _j1013 = _j1003 + i * 10000 + 9;
randomSeed(_j1013);
const offsetVariationFactor = crandom.random(0, 1);
_j1002.push({
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
_j1002.sort((a, b) => a.perpOffset - b.perpOffset);
return _j1002;
}
if (typeof _j61.lastAngle === 'undefined') {
_j61.lastAngle = 0;
}
if (typeof _j61.lastMovementAngle === 'undefined') {
_j61.lastMovementAngle = 0;
}
if (typeof _j61.lastStrokeWeights === 'undefined') {
_j61.lastStrokeWeights = {};
}
if (typeof _j61.configCache === 'undefined') {
_j61.configCache = {};
}
function _j59() {
if (typeof _j61 !== 'undefined' && _j61.configCache) {
_j61.configCache = {};
}
if (typeof _j61 !== 'undefined' && _j61.lastStrokeWeights) {
_j61.lastStrokeWeights = {};
}
}
function _j60(_j1428, _j1438, _j1439, _j1441 = null, _j1442 = null) {
if (_j524 >= expectedStrokeLength) {
return;
}
_j1428.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
noStroke();
const _j878 = (_j1441 !== null && _j1442 !== null) ? _j1441 : (_j590 ? _j596 : pmouseX);
const _j879 = (_j1442 !== null && _j1442 !== null) ? _j1442 : (_j590 ? _j597 : pmouseY);
const _j1014 = _j1438 - _j878;
const _j1015 = _j1439 - _j879;
const _j1016 = sqrt(_j1014 * _j1014 + _j1015 * _j1015);
const speedMultiplier = map(constrain(_j1016, 3, 50), 0, 50, 0.1, 5.0);
let _j1017 = 0,
_j1018 = 0;
let _j1019 = 0,
_j1020 = 0;
let _j1021 = 0,
_j1022 = 0;
if (_j1016 > 0.1) {
_j1017 = _j1014 / _j1016;
_j1018 = _j1015 / _j1016;
_j1019 = -_j1018;
_j1020 = _j1017;
_j1021 = _j1018;
_j1022 = -_j1017;
} else {
_j1019 = 0;
_j1020 = 1;
_j1021 = 0;
_j1022 = -1;
}
const _j1023 = _j524 < expectedStrokeLength;
const _j1024 = map(constrain(speedMultiplier, 0.1, 5.0), 0.1, 5.0, 20, 1);
const _j1025 = strokeSeed + _j524 * 10000 + 1;
randomSeed(_j1025);
const _j1026 = _j1023 ? Math.floor(crandom.random(0, _j1024)) : 0;
for (let i = 0; i < _j1026; i++) {
const _j1027 = strokeSeed + _j524 * 1000 + _j998;
randomSeed(_j1027);
const _j1028 = crandom.random(5, 15) * baseBrushSize;
const _j1029 = _j1438 + crandom.random(-2, 2) * baseBrushSize;
const _j1030 = _j1439 + crandom.random(-2, 2) * baseBrushSize;
const sideDirection = crandom.random(0, 1) > 0.5 ? 1 : -1;
let _j1031, _j1032, _j1033;
if (brushColorMode === 0) {
_j1031 = _j1032 = _j1033 = _j479 * 0.3;
} else if (brushColorMode === 1) {
_j1031 = _j1032 = _j1033 = 150;
} else if (brushColorMode === 33 && typeof customBrushColor !== 'undefined') {
_j1031 = customBrushColor[0];
_j1032 = customBrushColor[1];
_j1033 = customBrushColor[2];
} else {
const color = _j198[brushColorMode];
if (color && color.rgb) {
_j1031 = color.rgb[0];
_j1032 = color.rgb[1];
_j1033 = color.rgb[2];
} else {
_j1031 = _j1032 = _j1033 = 26;
}
}
const _j1034 = {
id: _j998++,
location: {
x: _j1029,
y: _j1030
},
prevLocation: {
x: _j1029,
y: _j1030
},
radius: _j1028,
r: _j1031,
g: _j1032,
b: _j1033,
xOff: 0.0,
yOff: 0.0,
sideDirection: sideDirection
};
_j997.push(_j1034);
}
const _j1035 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.01, 0.1);
const _j1036 = map(constrain(baseBrushSize || 1.0, 0.1, 4.0), 0.1, 4.0, 0.1, 0.5);
for (let i = _j997.length - 1; i >= 0; i--) {
const _j1037 = _j997[i];
if (_j1037.radius <= 0) {
continue;
}
const _j1038 = strokeSeed + _j524 * 1000 + _j1037.id * 100;
randomSeed(_j1038);
const _j1039 = crandom.random(_j1035, _j1036) * 3.0;
_j1037.radius -= _j1039;
const _j1040 = crandom.random(-0.5, 0.5) * speedMultiplier;
const _j1041 = crandom.random(-0.5, 0.5) * speedMultiplier;
_j1037.xOff += _j1040;
_j1037.yOff += _j1041;
const _j1042 = 2.0 * speedMultiplier;
let _j1043 = 0,
_j1044 = 0;
const _j1045 = crandom.random(0, 1);
const _j1046 = (_j1037.sideDirection !== undefined) ? _j1037.sideDirection : (_j1045 > 0.5 ? 1 : -1);
if (_j1046 === 1) {
_j1043 = _j1021 * _j1042;
_j1044 = _j1022 * _j1042;
} else {
_j1043 = _j1019 * _j1042;
_j1044 = _j1020 * _j1042;
}
const nX = noise(_j1037.location.x) * _j1037.xOff;
const nY = noise(_j1037.location.y) * _j1037.yOff;
if (!_j1037.prevLocation) {
_j1037.prevLocation = {
x: _j1037.location.x,
y: _j1037.location.y
};
} else {
_j1037.prevLocation.x = _j1037.location.x;
_j1037.prevLocation.y = _j1037.location.y;
}
_j1037.location.x += 2.0 * (_j1043 * 0.2 + nX * 0.8);
_j1037.location.y += 2.0 * (_j1044 * 0.2 + nY * 0.8);
if (brushColorMode >= 2) {
const _j1047 = noise(_j1037.location.x * 0.01, _j1037.location.y * 0.01) * 5;
_j1037.r = constrain(_j1037.r + _j1047, 0, 255);
_j1037.g = constrain(_j1037.g + _j1047, 0, 255);
_j1037.b = constrain(_j1037.b + _j1047, 0, 255);
} else if (brushColorMode == 0) {
const _j1047 = noise(_j1037.location.x * 0.01, _j1037.location.y * 0.01) * 2;
_j1037.r = constrain(_j1037.r + _j1047, 0, 200);
_j1037.g = constrain(_j1037.g + _j1047, 0, 200);
_j1037.b = constrain(_j1037.b + _j1047, 0, 200);
}
const _j1048 = crandom.random(0, 1) > 0.2;
const _j1049 = crandom.random(0, 1) > 0.99;
if (_j1037.radius > 0) {
stroke(_j1037.r, _j1037.g, _j1037.b, 200);
strokeWeight(max(1, _j1037.radius * 0.5));
if (_j1048) {
line(_j1037.prevLocation.x, _j1037.prevLocation.y, _j1037.location.x, _j1037.location.y);
}
if (_j1049) {
_j1037.radius = -1;
}
} else {
_j1037.radius = -1;
}
}
const _j1050 = _j997.length;
let _j1051 = 0;
for (let i = 0; i < _j997.length; i++) {
if (_j997[i].radius > 0) {
if (_j1051 !== i) {
_j997[_j1051] = _j997[i];
}
_j1051++;
}
}
_j997.length = _j1051;
const _j1052 = _j997.length;
if (window.DEBUG_MODE && _j1050 > _j1052) {
const _j1053 = _j1050 - _j1052;
if (_j1053 > 50) {
console.log(`🧹 Gothic dots cleaned: ${_j1053} dead particles removed (${_j1050} → ${_j1052})`);
}
}
pop();
_j1428.end();
}
function _j61(_j1428, _j1438, _j1439, _j755, _j485 = 0, _j1440 = 0) {
if (_j524 >= expectedStrokeLength) {
console.log("Marker not drawn: mouseCount >= expectedStrokeLength (", _j524, ">=", expectedStrokeLength, ")");
return;
}
_j1428.begin();
push();
translate(-hw, -hh);
colorMode(RGB, 255);
let _j876 = _j56(_j479);
let _j912 = initialSize * 0.3;
const _j1054 = (_j515 && typeof _j519 !== 'undefined' && _j519 !== null) ? _j519 : baseBrushSize;
let _j408 = _j1438;
let _j409 = _j1439;
if (!_j505) {
_j505 = 1;
x = _j408;
y = _j409;
}
_j489 += (_j408 - x) * _j486;
_j490 += (_j409 - y) * _j486;
_j489 *= _j487;
_j490 *= _j487;
_j491 += sqrt(_j489 * _j489 + _j490 * _j490) - _j491;
_j491 *= 0.7;
_j492 = _j488 - _j491;
let _j974 = _j496;
let _j975 = _j492;
let _j976 = _j408 - x;
let _j977 = _j409 - y;
let _j978 = sqrt(_j976 * _j976 + _j977 * _j977);
const _j1055 = _j1054;
const _j1056 = _j1055 < 0.25;
const _j1057 = _j1055 < 1.0;
let _j979 = max(_j1056 ? 0.05 : (_j1057 ? _j1055 * 0.5 : 0.5), _j975 * 0.5);
let _j980 = 1.5 * min(_j912, max(_j1057 ? _j1055 * 4 : 4, _j979));
let _j981 = _j980 * 0.6;
let _j982 = 0.8;
let _j983 = max(_j981 * _j982, 0.5);
let _j984 = max(1, ceil(_j978 / _j983));
_j984 = max(10, min(50, _j984));
let _j985 = _j984 / _j484;
let _j913 = 0;
let _j914 = 0;
let _j986 = min(1.0, _j978 / 10);
let _j987 = _j986 > 0.3;
rectMode(CENTER);
let _j215 = crandom.random(30, 70);
const _j1058 = `flyBrush_${_j1054}_${strokeSeed}`;
let _j1059;
if (_j61.configCache[_j1058]) {
_j1059 = _j61.configCache[_j1058];
} else {
_j1059 = _j58(_j1054, strokeSeed);
_j61.configCache[_j1058] = _j1059;
}
const _j1060 = map(_j215, 30, 70, 0, _j1059.length);
const _j1061 = _j1059.length;
const _j1062 = 40;
const _j218 = [];
for (let i = 0; i < _j484; ++i) {
const flyWhiteRandoms = [];
const flyWhiteOffsetNoises = [];
const flyWhiteWidthNoises = [];
for (let j = 0; j < _j1062; j++) {
flyWhiteRandoms.push(crandom.random(0.3, 1.2));
const _j1063 = _j524 * 0.08 + j * 0.15;
const _j1064 = _j524 * 0.08 + j * 0.15 + i * 0.01;
flyWhiteOffsetNoises.push(noise(_j1063, _j1064));
const _j1065 = _j524 * 0.1 + j * 0.1;
const _j1066 = _j524 * 0.1 + j * 0.1 + i * 0.01;
flyWhiteWidthNoises.push(noise(_j1065, _j1066));
}
_j218.push({
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
for (let i = 0; i < _j484; ++i) {
const _j988 = _j218[i];
let _j920 = x;
let _j921 = y;
x += _j489 / _j484;
y += _j490 / _j484;
let _j399 = (i + 1) / _j484;
let _j989 = lerp(_j974, _j975, _j399);
_j496 = lerp(_j496, _j989, 0.5);
_j502 += (_j496 - _j502) * 0.8;
_j502 = max(_j1057 ? _j1055 * 1.5 : 1.5, _j502);
let _j931;
_j931 = max(_j1056 ? _j1055 * 0.5 : (_j1057 ? _j1055 : 0.5), _j502);
let dx = x - _j920;
let dy = y - _j921;
let distance = sqrt(dx * dx + dy * dy);
let _j991;
const _j304 = 0.1;
if (distance < _j304) {
_j991 = _j61.lastMovementAngle;
} else {
_j991 = atan2(dy, dx);
let _j257 = _j991 + PI / 2;
_j61.lastAngle = _j257;
_j61.lastMovementAngle = _j991;
}
let _j935 = _j988.showMainBrush;
let _j936 = _j988.mainAlpha;
let showMainBrush = 0.3;
let _j990 = showMainBrush;
if (_j985 > 1.0) {
_j990 = showMainBrush / _j985;
} else if (_j985 < 1.0) {
_j990 = showMainBrush * (2.0 - _j985);
}
let _j992 = -sin(_j991);
let _j993 = cos(_j991);
const _j1067 = max(_j1056 ? _j1055 * 0.4 : (_j1057 ? _j1055 * 0.5 : 0.5), _j488 * 0.5);
const _j1068 = _j491 * 0.5;
const _j1069 = _j524 < (expectedStrokeLength - 5);
const _j1070 = _j524 >= (expectedStrokeLength - 5);
const _j1071 = _j1070 ? 0.7 : 1.0;
const _j1072 = _j524 >= expectedStrokeLength;
let _j1073, _j1074, _j1075, _j1076, _j1077;
if (_j1070) {
_j1073 = expectedStrokeLength - 5;
_j1074 = _j524 - _j1073;
_j1075 = min(1.0, _j1074 / 5.0);
_j1076 = cos(_j991);
_j1077 = sin(_j991);
}
for (let j = 0; j < _j1059.length; j++) {
let _j994 = _j1059[j];
const _j1078 = _j524 >= _j994.startOffset;
if (!_j1078 || _j1072) {
continue;
}
let _j995 = _j988.flyWhiteRandoms[j];
let _j996 = _j994.randThreshold * _j1071;
if (_j995 > _j996) {
const _j1079 = _j988.flyWhiteOffsetNoises[j];
const _j960 = map(_j1079, 0, 1, 1.0, 2.0);
const _j1080 = 1.0 + (_j960 - 1.0) * _j994.offsetVariationFactor;
const _j1081 = _j1057 ? max(0.3, _j1055 * 3) : _j1055;
const _j1082 = _j994.perpOffset * _j1081 * _j1080;
let offsetX = _j992 * _j1082;
let offsetY = _j993 * _j1082;
let _j255 = x;
let _j256 = y;
let _j1083 = _j920;
let _j1084 = _j921;
if (_j1070) {
const _j1085 = _j994.endDistanceOffset * _j1075 * _j1054;
const _j1086 = _j1076 * _j1085;
const _j1087 = _j1077 * _j1085;
_j255 = x + _j1086;
_j256 = y + _j1087;
if (_j1074 === 0) {
_j1083 = _j920;
_j1084 = _j921;
} else {
const _j1088 = min(1.0, (_j1074 - 1) / 5.0);
const _j1089 = _j994.endDistanceOffset * _j1088 * _j1054;
const _j1090 = _j1076 * _j1089;
const _j1091 = _j1077 * _j1089;
_j1083 = x + _j1090;
_j1084 = y + _j1091;
}
}
const _j1092 = _j1068 * _j994.brushSpeedMultiplier * _j994.speedMultiplier;
const _j1093 = max(_j1056 ? _j1055 * 0.3 : (_j1057 ? _j1055 * 0.3 : 0.5), _j1067 - _j1092);
const _j1094 = _j1093 * 0.6;
const _j1095 = _j988.flyWhiteWidthNoises[j];
const _j1096 = map(_j1095, 0, 1, 0.8, 1.2);
const _j1097 = 1.0 + (_j1096 - 1.0) * _j994.widthVariationFactor;
let _j1098 = max(0, map(j, 0, _j1059.length, 80, 230) - noise(i * 0.5, j * 0.5) * 30);
let kk = min(200, _j1098) + random(-50, 50);
stroke(_j876, kk);
const _j1099 = _j1094 * _j994.sizeMultiplier * _j1097;
const _j1100 = max(1, _j1099);
const _j1101 = `${_j1058}_${j}`;
let _j1102 = _j61.lastStrokeWeights[_j1101];
if (typeof _j1102 === 'undefined') {
_j1102 = _j1100;
}
const _j1103 = _j1102;
let _j1104;
if (_j1103 < 3.0) {
_j1104 = 0.15;
} else if (_j1103 >= 5.0) {
_j1104 = 0.3;
} else {
const t = (_j1103 - 3.0) / (5.0 - 3.0);
_j1104 = lerp(0.15, 0.3, t);
}
const _j1105 = lerp(_j1102, _j1100, _j1104);
_j61.lastStrokeWeights[_j1101] = _j1105;
strokeWeight(_j1105);
line(_j1083 + offsetX, _j1084 + offsetY, _j255 + offsetX, _j256 + offsetY);
}
}
}
pop();
_j1428.end();
}
let _j1106 = null;
function _j62() {
if (_j1106) return _j1106;
_j1106 = {
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
return _j1106;
}
function _j63(key) {
if (!_j1106) {
_j62();
}
return _j1106[key];
}
function _j64(e) {
if (e.target.closest('.control-btn')) return;
isDragging = true;
const overlay = _j63('messageOverlay');
if (!overlay) return;
const rect = overlay.getBoundingClientRect();
_j641.x = e.clientX - rect.left - rect.width / 2;
_j641.y = e.clientY - rect.top - rect.height / 2;
overlay.classList.add('dragging');
e.preventDefault();
}
function _j65(e) {
if (!isDragging) return;
const overlay = _j63('messageOverlay');
if (!overlay) return;
const x = ((e.clientX - _j641.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j641.y) / window.innerHeight) * 100;
_j642.x = x;
_j642.y = y;
_j67(overlay, _j642, _j70);
}
function _j66() {
if (!isDragging) return;
isDragging = false;
const overlay = _j63('messageOverlay');
if (overlay) {
overlay.classList.remove('dragging');
_j67(overlay, _j642, _j70);
}
_j99();
}
function _j67(panel, pos, _j1443) {
if (!panel) return;
_j1443();
const _j1107 = panel.querySelector('.control-btn');
if (!_j1107) return;
const rect = _j1107.getBoundingClientRect();
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
_j1443();
}
}
function _j68(_j1444) {
if (!_j1444) return;
const _j862 = [
document.getElementById('message-overlay'),
_j63('controlPanel'),
_j63('effectControlPanel'),
_j63('flowEffectPanel')
];
_j862.forEach(p => {
if (p) p.classList.remove('panel-front');
});
_j1444.classList.add('panel-front');
}
function _j69() {
const _j862 = [
document.getElementById('message-overlay'),
_j63('controlPanel'),
_j63('effectControlPanel'),
_j63('flowEffectPanel')
];
_j862.forEach(panel => {
if (!panel) return;
panel.addEventListener('mousedown', () => _j68(panel));
panel.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) _j68(panel);
}, {
passive: true
});
});
}
function _j70() {
const overlay = _j63('messageOverlay');
if (!overlay) return;
overlay.style.left = _j642.x + '%';
overlay.style.top = _j642.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
overlay.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j71(e) {
if (e.target.closest('.control-btn') || e.target.closest('.color-swatch')) return;
_j643 = true;
const panel = _j63('controlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j644.x = e.clientX - rect.left - rect.width / 2;
_j644.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j72(e) {
if (!_j643) return;
const panel = _j63('controlPanel');
if (!panel) return;
const x = ((e.clientX - _j644.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j644.y) / window.innerHeight) * 100;
_j645.x = x;
_j645.y = y;
_j67(panel, _j645, _j74);
}
function _j73(e) {
if (!_j643) return;
_j643 = false;
const panel = _j63('controlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j67(panel, _j645, _j74);
_j99();
}
function _j74() {
const panel = _j63('controlPanel');
if (!panel) return;
panel.style.left = _j645.x + '%';
panel.style.top = _j645.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j75(e) {
if (e.target.closest('.control-btn')) return;
_j647 = true;
const panel = _j63('effectControlPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j648.x = e.clientX - rect.left - rect.width / 2;
_j648.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j76(e) {
if (!_j647) return;
const panel = _j63('effectControlPanel');
if (!panel) return;
const x = ((e.clientX - _j648.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j648.y) / window.innerHeight) * 100;
_j649.x = x;
_j649.y = y;
_j67(panel, _j649, _j78);
}
function _j77(e) {
if (!_j647) return;
_j647 = false;
const panel = _j63('effectControlPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j67(panel, _j649, _j78);
_j99();
}
function _j78() {
const panel = _j63('effectControlPanel');
if (!panel) return;
panel.style.left = _j649.x + '%';
panel.style.top = _j649.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j79(e) {
if (e.target.closest('.control-btn')) return;
_j651 = true;
const panel = _j63('flowEffectPanel');
if (!panel) return;
const rect = panel.getBoundingClientRect();
_j652.x = e.clientX - rect.left - rect.width / 2;
_j652.y = e.clientY - rect.top - rect.height / 2;
panel.classList.add('dragging');
panel.style.transition = 'none';
e.preventDefault();
}
function _j80(e) {
if (!_j651) return;
const panel = _j63('flowEffectPanel');
if (!panel) return;
const x = ((e.clientX - _j652.x) / window.innerWidth) * 100;
const y = ((e.clientY - _j652.y) / window.innerHeight) * 100;
_j653.x = x;
_j653.y = y;
_j67(panel, _j653, _j82);
}
function _j81(e) {
if (!_j651) return;
_j651 = false;
const panel = _j63('flowEffectPanel');
if (!panel) return;
panel.classList.remove('dragging');
panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
_j67(panel, _j653, _j82);
_j99();
}
function _j82() {
const panel = _j63('flowEffectPanel');
if (!panel) return;
panel.style.left = _j653.x + '%';
panel.style.top = _j653.y + '%';
const s = (typeof window !== 'undefined' && window.panelScale !== undefined) ? window.panelScale : 0.8;
panel.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
}
function _j83() {
return _j63('controlPanel');
}
let _j1108 = {};
let _j1109 = {
hint: null,
startX: 0,
startY: 0,
offsetX: 0,
offsetY: 0,
isDragging: false,
hasMoved: false,
lastDragTime: 0
};
function _j84() {
return Date.now() - _j1109.lastDragTime < 200;
}
function _j85(hint, _j1445) {
const button = document.getElementById(_j1445);
if (!hint || !button) return;
const rect = button.getBoundingClientRect();
hint.style.top = rect.top + 'px';
hint.style.left = rect.left + 'px';
}
function _j86(e, hint) {
const rect = hint.getBoundingClientRect();
_j1109.hint = hint;
_j1109.startX = e.clientX;
_j1109.startY = e.clientY;
_j1109.offsetX = e.clientX - rect.left;
_j1109.offsetY = e.clientY - rect.top;
_j1109.isDragging = true;
_j1109.hasMoved = false;
}
function _j87(e) {
if (!_j1109.isDragging || !_j1109.hint) return;
const dx = Math.abs(e.clientX - _j1109.startX);
const dy = Math.abs(e.clientY - _j1109.startY);
if (dx > 5 || dy > 5) {
_j1109.hasMoved = true;
_j1109.hint.style.transition = 'none';
}
if (_j1109.hasMoved) {
const x = e.clientX - _j1109.offsetX;
const y = e.clientY - _j1109.offsetY;
_j1109.hint.style.left = x + 'px';
_j1109.hint.style.top = y + 'px';
}
}
function _j88(e) {
if (!_j1109.isDragging || !_j1109.hint) return;
const hint = _j1109.hint;
if (_j1109.hasMoved) {
_j1108[hint.id] = {
top: parseInt(hint.style.top),
left: parseInt(hint.style.left)
};
localStorage.setItem('hintPositions', JSON.stringify(_j1108));
hint.style.transition = '';
_j1109.lastDragTime = Date.now();
if (e.preventDefault) e.preventDefault();
if (e.stopPropagation) e.stopPropagation();
}
_j1109.hint = null;
_j1109.isDragging = false;
_j1109.hasMoved = false;
}
function _j89() {
const _j1110 = localStorage.getItem('hintPositions');
if (_j1110) {
_j1108 = JSON.parse(_j1110);
}
}
function _j90() {
const _j1111 = [{
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
_j1111.forEach(({
hint,
btn
}) => {
if (!hint || !btn) return;
btn.addEventListener('mousedown', (e) => {
_j86(e, hint);
});
btn.addEventListener('touchstart', (e) => {
if (e.touches.length === 1) {
const _j1112 = e.touches[0];
_j86({
clientX: _j1112.clientX,
clientY: _j1112.clientY
}, hint);
}
}, {
passive: true
});
});
document.addEventListener('mousemove', _j87);
document.addEventListener('mouseup', _j88);
document.addEventListener('touchmove', (e) => {
if (_j1109.isDragging && e.touches.length === 1) {
_j87({
clientX: e.touches[0].clientX,
clientY: e.touches[0].clientY
});
if (_j1109.hasMoved) e.preventDefault();
}
}, {
passive: false
});
document.addEventListener('touchend', (e) => {
_j88({
preventDefault: () => {},
stopPropagation: () => {}
});
});
}
function _j91() {
_j89();
const _j862 = [{
panel: document.getElementById('message-overlay'),
hint: document.getElementById('toggle-hint'),
button: 'toggle-overlay',
visible: _j638
}, {
panel: _j63('controlPanel'),
hint: _j63('brushHint'),
button: 'toggle-control-panel',
visible: _j646
}, {
panel: _j63('effectControlPanel'),
hint: _j63('effectHint'),
button: 'toggle-effect-control-panel',
visible: _j650
}, {
panel: _j63('flowEffectPanel'),
hint: _j63('flowHint'),
button: 'toggle-flow-effect-panel',
visible: _j654
}];
_j862.forEach(({
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
_j85(hint, button);
panel.style.display = 'none';
panel.style.opacity = '';
panel.style.pointerEvents = '';
});
}
});
}
function _j92() {
_j646 = !_j646;
const panel = _j83();
const brushHint = _j63('brushHint');
if (!panel) return;
if (_j646) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (brushHint) {
brushHint.classList.add('hidden');
}
} else {
if (brushHint) {
_j85(brushHint, 'toggle-control-panel');
brushHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j646) {
panel.style.display = 'none';
}
}, 300);
}
localStorage.setItem('controlPanelVisible', _j646.toString());
}
function _j93() {
_j650 = !_j650;
const panel = _j63('effectControlPanel');
const effectHint = _j63('effectHint');
if (!panel) return;
if (_j650) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (effectHint) {
effectHint.classList.add('hidden');
}
} else {
if (effectHint) {
_j85(effectHint, 'toggle-effect-control-panel');
effectHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j650) {
panel.style.display = 'none';
}
}, 300);
}
_j97();
}
function _j94() {
_j654 = !_j654;
const panel = _j63('flowEffectPanel');
const flowHint = _j63('flowHint');
if (!panel) return;
if (_j654) {
panel.style.display = 'block';
panel.style.opacity = '1';
if (flowHint) {
flowHint.classList.add('hidden');
}
} else {
if (flowHint) {
_j85(flowHint, 'toggle-flow-effect-panel');
flowHint.classList.remove('hidden');
}
panel.style.opacity = '0';
setTimeout(() => {
if (!_j654) {
panel.style.display = 'none';
}
}, 300);
}
_j97();
}
function _j95() {
const _j1113 = _j63('screenTextToggle');
if (_j1113) {
screenText = _j1113.checked;
} else {
screenText = !screenText;
}
if (!screenText) {
_j131();
}
_j100('ui', 'Screen Text Display', {
Status: screenText ? "Show ✅" : "Hide ❌"
});
}
function _j96() {
const _j1114 = localStorage.getItem('controlPanelVisible');
if (_j1114 !== null) {
_j646 = _j1114 === 'true';
}
const _j1115 = localStorage.getItem('effectControlPanelVisible');
if (_j1115 !== null) {
_j650 = _j1115 === 'true';
}
const _j1116 = localStorage.getItem('flowEffectPanelVisible');
if (_j1116 !== null) {
_j654 = _j1116 === 'true';
}
}
function _j97() {
localStorage.setItem('controlPanelVisible', _j646);
localStorage.setItem('effectControlPanelVisible', _j650);
localStorage.setItem('flowEffectPanelVisible', _j654);
}
function _j98() {
const _j1117 = localStorage.getItem('overlayPosition');
const _j1118 = localStorage.getItem('controlPanelPosition');
const _j1119 = localStorage.getItem('effectControlPanelPosition');
const _j1120 = localStorage.getItem('flowEffectPanelPosition');
if (_j1117) {
_j642 = JSON.parse(_j1117);
}
if (_j1118) {
_j645 = JSON.parse(_j1118);
}
if (_j1119) {
_j649 = JSON.parse(_j1119);
}
if (_j1120) {
_j653 = JSON.parse(_j1120);
}
}
function _j99() {
localStorage.setItem('overlayPosition', JSON.stringify(_j642));
localStorage.setItem('controlPanelPosition', JSON.stringify(_j645));
localStorage.setItem('effectControlPanelPosition', JSON.stringify(_j649));
localStorage.setItem('flowEffectPanelPosition', JSON.stringify(_j653));
}
function _j100(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1121 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1121[type] || '⚙️';
if (Object.keys(data).length > 0) {} else {}
if (typeof screenText !== 'undefined' && screenText) {
_j101(type, message, data);
}
}
function _j101(type, message, data = {}) {
const timestamp = new Date().toLocaleTimeString('en-US', {
hour12: false,
hour: '2-digit',
minute: '2-digit',
second: '2-digit',
fractionalSecondDigits: 3
});
const _j1121 = {
recording: '🔴',
playback: '▶️',
system: '⚙️',
art: '🎨'
};
const icon = _j1121[type] || '⚙️';
let _j1122 = '';
if (Object.keys(data).length > 0) {
_j1122 = ' ' + JSON.stringify(data);
}
const _j1123 = `${icon} [${timestamp}] ${message}${_j1122}`;
_j656.push({
type: type,
text: _j1123,
timestamp: timestamp
});
if (_j656.length >= _j663) {
_j656 = [];
_j658 = 0;
}
}
function _j102(type, message, data, timestamp, icon) {
const _j1124 = {
id: Date.now() + Math.random(),
type: type,
message: message,
data: data,
timestamp: timestamp,
icon: icon
};
_j639.push(_j1124);
if (_j639.length > _j640) {
_j639.shift();
}
_j103();
}
function _j103() {
const _j1125 = _j63('messageContainer');
if (!_j1125) return;
_j1125.innerHTML = '';
_j639.forEach(_j1448 => {
const _j1126 = _j129(_j1448);
_j1125.appendChild(_j1126);
});
_j1125.scrollTop = _j1125.scrollHeight;
}
function _j104() {
const _j1127 = recordingData.events.length > 0;
const _j1128 = `${_j582}-${_j590}-${_j1127}`;
if (_j1128 === _j1134) {
return;
}
_j1134 = _j1128;
const recordBtn = _j63('recordBtn');
const stopBtn = _j63('stopBtn');
const playBtn = _j63('playBtn');
const loadBtn = _j63('loadBtn');
if (recordBtn && stopBtn && playBtn && loadBtn) {
if (_j582) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j590) {
recordBtn.disabled = true;
stopBtn.disabled = false;
playBtn.disabled = true;
loadBtn.disabled = true;
} else if (_j1127) {
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
let _j1129 = false;
let _j1130 = -1;
let _j1131 = 0;
const _j1132 = 100;
let _j1133 = -1;
let _j1134 = null;
function _j105(_j1291) {
const _j1135 = new FileReader();
const referenceImage = document.getElementById('reference-image');
const referenceContainer = document.getElementById('reference-image-container');
if (!referenceImage || !referenceContainer) {
_j100('system', '❌ Reference image elements not found', {
Status: 'Error'
});
return;
}
_j1135.onload = (e) => {
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
_j1129 = true;
_j100('system', '📷 Reference image loaded', {
Status: 'Tracing mode ON',
FileName: _j1291.name,
FileSize: (_j1291.size / 1024).toFixed(2) + ' KB',
Opacity: '50%',
Size: width + 'x' + height + 'px'
});
};
referenceImage.onerror = () => {
_j100('system', '❌ Failed to load image', {
Status: 'Error',
FileName: _j1291.name
});
};
};
_j1135.onerror = () => {
_j100('system', '❌ Failed to read file', {
Status: 'Error',
FileName: _j1291.name
});
};
_j1135.readAsDataURL(_j1291);
}
function _j106() {
const referenceContainer = document.getElementById('reference-image-container');
const referenceImage = document.getElementById('reference-image');
if (referenceContainer && referenceImage) {
const _j1136 = referenceImage.src;
const _j1137 = _j1136 && _j1136 !== '' &&
(_j1136.startsWith('data:') ||
(referenceImage.complete && referenceImage.naturalWidth > 0));
if (_j1137) {
referenceContainer.classList.remove('hidden');
referenceContainer.style.opacity = '0.3';
_j1129 = true;
_j100('system', 'Reference image shown', {
Status: 'Tracing mode ON',
Opacity: '30%'
});
} else {
_j100('system', 'No image loaded', {
Status: 'Please load an image first'
});
}
}
}
function _j107() {
const referenceContainer = document.getElementById('reference-image-container');
if (referenceContainer) {
referenceContainer.classList.add('hidden');
referenceContainer.style.opacity = '0';
_j1129 = false;
_j100('system', 'Reference image hidden', {
Status: 'Tracing mode OFF'
});
}
}
function _j108() {
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `artwork-${timestamp}.png`;
saveCanvas(filename);
_j160('💾 Canvas Saved as PNG');
}
function _j109(_j1175) {
_j497 = _j1175;
switch (_j1175) {
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
if (typeof _j519 !== 'undefined') _j519 = baseBrushSize;
_j110();
_j122();
_j100('ui', 'Brush size changed', {
Mode: _j1175.toUpperCase(),
Multiplier: baseBrushSize + 'x'
});
}
function _j110() {
const _j1138 = document.querySelectorAll('.brush-size-btn');
if (_j1138.length === 0) {
console.log('⚠️ Brush size buttons not found, skipping update');
return;
}
_j1138.forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.size === _j497) {
btn.classList.add('active');
}
});
}
function _j111(mode) {
brushMode = parseInt(mode);
_j113();
_j122();
_j100('ui', 'Brush mode changed', {
Mode: `Brush ${mode}`,
Description: _j112(mode)
});
}
function _j112(mode) {
const _j1139 = {
1: 'Large brush (20-30)',
2: 'Small brush (5-10)',
3: 'Extra large brush (80-120)',
4: 'Pen sketch mode (2-4)',
5: 'Dot paint mode (8-15)',
6: 'Fly brush mode',
7: 'Brush mode 7'
};
return _j1139[mode] || 'Unknown mode';
}
function _j113() {
const _j1138 = document.querySelectorAll('.brush-mode-btn');
if (_j1138.length === 0) {
console.log('⚠️ Brush mode buttons not found, skipping update');
return;
}
_j1138.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.mode) === brushMode) {
btn.classList.add('active');
}
});
}
function _j114(effect) {
const _j1140 = parseInt(effect);
const _j1141 = useSharpen;
_j100('ui', '🎨 Ink effect switching', {
From: _j1141,
To: _j1140,
Note: 'Buffer preserved to keep existing content'
});
useSharpen = _j1140;
if (typeof _j498 !== 'undefined') {
_j498 = _j1141;
}
_j117();
_j122();
const _j1142 = {
0: 'Mix Diffusion',
1: 'Sharpen Edge',
2: 'Flying White',
3: 'Wet Ink',
4: 'Effect 4',
5: 'Hair Texture'
};
_j100('ui', '✨ Ink effect changed', {
Effect: _j1142[_j1140] || 'Unknown',
ShaderValue: useSharpen
});
}
function _j115(mode) {
const _j1143 = parseInt(mode);
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = _j1143;
}
_j116();
const _j1144 = {
0: 'Mix',
1: 'Multiply',
2: 'Darken'
};
_j100('ui', '🎨 BlendMode changed', {
Mode: _j1144[_j1143] || 'Unknown',
Value: keyBlendMode
});
}
function _j116() {
const _j1138 = document.querySelectorAll('.blendmode-btn');
if (_j1138.length === 0) {
return;
}
_j1138.forEach(btn => {
const _j1143 = parseInt(btn.dataset.mode);
if (_j1143 === keyBlendMode) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j117() {
const _j1138 = document.querySelectorAll('.ink-effect-btn');
if (_j1138.length === 0) {
console.log('⚠️ Ink effect buttons not found, skipping update');
return;
}
_j1138.forEach(btn => {
btn.classList.remove('active');
const _j1140 = parseInt(btn.dataset.effect);
const _j1145 = _j1140;
if (_j1145 === useSharpen) {
btn.classList.add('active');
}
});
}
function _j118(color) {
whiteBrushMode = (color === 'white');
const _j1146 = {
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
brushColorMode = _j1146[color] !== undefined ? _j1146[color] : 0;
_j119();
_j122();
const _j1147 = {
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
const _j1148 = _j8(color);
if (_j1148) {
const _j1149 = document.getElementById('custom-brush-color');
const _j1150 = document.getElementById('custom-brush-color-text');
if (_j1149) _j1149.value = _j1148.hex;
if (_j1150) _j1150.value = _j1148.displayName + ' ' + _j1148.hex;
if (typeof customBrushColor !== 'undefined') {
customBrushColor[0] = _j1148.rgb[0];
customBrushColor[1] = _j1148.rgb[1];
customBrushColor[2] = _j1148.rgb[2];
}
}
}
_j100('ui', '🎨 Brush color changed', {
Color: _j1147[color] || color,
Mode: `${_j1147[color] || color} brush mode`,
ColorCode: brushColorMode
});
}
function _j119() {
const _j1151 = document.querySelectorAll('.brush-color-btn');
const _j1152 = document.querySelectorAll('.color-swatch');
if (_j1151.length === 0 && _j1152.length === 0) {
console.log('⚠️ Brush color buttons not found, skipping update');
return;
}
const _j1153 = {
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
const _j1154 = (brushColorMode === 33);
const _j1155 = _j1154 ? null : (_j1153[brushColorMode] || 'black');
_j1151.forEach(btn => {
btn.classList.remove('active');
if (!_j1154 && btn.dataset.color === _j1155) {
btn.classList.add('active');
}
});
_j1152.forEach(btn => {
btn.classList.remove('active');
if (!_j1154 && btn.dataset.color === _j1155) {
btn.classList.add('active');
}
});
}
function _j120(_j1181) {
_j530 = parseInt(_j1181);
_j121();
_j122();
const _j1156 = {
1: '2-6',
2: '10-20',
3: '20-40'
};
_j100('ui', '🔄 Path rotation changed', {
Mode: _j1181,
Range: _j1156[_j1181] || 'Unknown'
});
}
function _j121() {
const _j1138 = document.querySelectorAll('.path-rotation-btn');
if (_j1138.length === 0) {
console.log('⚠️ Path rotation buttons not found, skipping update');
return;
}
_j1138.forEach(btn => {
btn.classList.remove('active');
if (parseInt(btn.dataset.rotation) === _j530) {
btn.classList.add('active');
}
});
}
function _j122() {
const _j1157 = document.getElementById('current-brush-mode');
if (_j1157) {
_j1157.textContent = brushMode;
}
const _j1158 = document.getElementById('current-brush-size');
if (_j1158) {
const _j1159 = {
'extra-small': 'XS',
'small': 'S',
'medium': 'M',
'large': 'L',
'extra-large': 'XL',
'extra-extra-large': 'XXL',
'huge': '10'
};
_j1158.textContent = _j1159[_j497] || 'M';
}
const _j1160 = document.getElementById('current-ink-effect');
if (_j1160) {
const _j1161 = {
0: 'MIX',
1: 'SHARP',
2: 'FLYING',
3: 'WET',
4: 'EFFECT4',
5: 'HAIR'
};
_j1160.textContent = _j1161[useSharpen] || 'MIX';
}
const _j1162 = document.getElementById('current-brush-color');
if (_j1162) {
const _j1163 = {
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
_j1162.textContent = _j1163[brushColorMode] || 'Black';
}
}
function _j123() {
brushMode = 1;
_j497 = 'large';
baseBrushSize = 2.0;
useSharpen = 0;
whiteBrushMode = false;
_j530 = 1;
if (typeof keyBlendMode !== 'undefined') {
keyBlendMode = 0;
}
_j113();
_j110();
_j117();
_j119();
_j121();
_j116();
_j122();
_j100('ui', 'Brush settings reset', {
Status: 'All settings restored to default',
Mode: 'Brush 1',
Size: 'large (1.0x)',
Effect: 'Mix Diffusion',
Color: 'Black',
PathRotation: '2-6'
});
}
function _j124(_j1446, _j1447) {
if (!_j1446) return;
if (!window._elementLastTriggerTime) {
window._elementLastTriggerTime = new WeakMap();
}
if (!window._elementTouchHandled) {
window._elementTouchHandled = new WeakMap();
}
const _j1164 = 300;
_j1446.addEventListener('touchstart', (e) => {
const now = Date.now();
const _j1165 = window._elementLastTriggerTime.get(_j1446) || 0;
if (now - _j1165 < _j1164) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementTouchHandled.set(_j1446, true);
setTimeout(() => {
window._elementTouchHandled.delete(_j1446);
}, _j1164);
window._elementLastTriggerTime.set(_j1446, now);
e.stopPropagation();
e.preventDefault();
_j1447(e);
}, {
passive: false
});
_j1446.addEventListener('click', (e) => {
if (window._elementTouchHandled && window._elementTouchHandled.get(_j1446)) {
e.preventDefault();
e.stopPropagation();
return;
}
const now = Date.now();
const _j1165 = window._elementLastTriggerTime.get(_j1446) || 0;
if (now - _j1165 < _j1164) {
e.preventDefault();
e.stopPropagation();
return;
}
window._elementLastTriggerTime.set(_j1446, now);
e.stopPropagation();
e.preventDefault();
_j1447(e);
});
_j1446.addEventListener('mousedown', (e) => {
if (e.button === 0) {
e.stopPropagation();
}
});
}
function _j125() {
const _j1166 = document.getElementById('canvas-background-color');
const _j1167 = document.getElementById('canvas-background-color-text');
if (!_j1166 || !_j1167) {
return;
}
if (typeof canvasBackgroundColor !== 'undefined') {
const r = canvasBackgroundColor[0].toString(16).padStart(2, '0');
const g = canvasBackgroundColor[1].toString(16).padStart(2, '0');
const b = canvasBackgroundColor[2].toString(16).padStart(2, '0');
const _j1168 = `#${r}${g}${b}`.toUpperCase();
_j1166.value = _j1168;
_j1167.value = _j1168;
}
}
function _j126() {
const _j1169 = document.getElementById('canvas-width');
const _j1170 = document.getElementById('canvas-height');
if (!_j1169 || !_j1170) {
return;
}
if (typeof _j467 !== 'undefined' && typeof _j468 !== 'undefined') {
_j1169.value = _j467;
_j1170.value = _j468;
}
}
function _j127() {
const _j1171 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1172 = _j1171 === 'collector';
if (_j1172) {
const controlPanel = _j63('controlPanel');
if (controlPanel) {
controlPanel.style.display = 'none';
}
return;
}
const _j1173 = document.querySelectorAll('.brush-mode-btn');
_j1173.forEach(btn => {
_j124(btn, () => {
const mode = btn.dataset.mode;
_j111(mode);
});
});
const _j1174 = document.querySelectorAll('.brush-size-btn');
_j1174.forEach(btn => {
_j124(btn, () => {
const _j1175 = btn.dataset.size;
_j109(_j1175);
});
});
const _j1176 = document.querySelectorAll('.ink-effect-btn');
_j1176.forEach(btn => {
_j124(btn, () => {
const effect = btn.dataset.effect;
_j114(effect);
});
});
const _j1177 = document.querySelectorAll('.brush-color-btn, .color-swatch');
_j1177.forEach(btn => {
_j124(btn, () => {
const color = btn.dataset.color;
if (color) {
_j118(color);
_j141();
}
});
});
const _j1178 = document.getElementById('custom-brush-color');
const _j1179 = document.getElementById('custom-brush-color-text');
if (_j1178 && _j1179) {
_j1178.addEventListener('input', (e) => {
_j1179.value = e.target.value.toUpperCase();
_j147();
});
_j1178.addEventListener('change', (e) => {
_j1179.value = e.target.value.toUpperCase();
_j147();
});
_j1179.addEventListener('input', (e) => {
const _j1168 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1168)) {
_j1178.value = _j1168.toUpperCase();
}
});
_j1179.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j147();
}
});
}
const _j1180 = document.querySelectorAll('.path-rotation-btn');
_j1180.forEach(btn => {
_j124(btn, () => {
const _j1181 = btn.dataset.rotation;
_j120(_j1181);
});
});
const _j1182 = document.querySelectorAll('.blendmode-btn');
_j1182.forEach(btn => {
_j124(btn, () => {
const mode = btn.dataset.mode;
_j115(mode);
});
});
const _j1183 = document.getElementById('clear-canvas');
if (_j1183) {
_j124(_j1183, () => {
_j153();
if (typeof _j216 !== 'undefined') {
_j216 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j100('ui', '🧹 Canvas cleared', {
Status: 'All drawings removed'
});
});
}
const _j1166 = document.getElementById('canvas-background-color');
const _j1167 = document.getElementById('canvas-background-color-text');
const _j1169 = document.getElementById('canvas-width');
const _j1170 = document.getElementById('canvas-height');
if (_j1166 && _j1167) {
_j1166.addEventListener('input', (e) => {
_j1167.value = e.target.value.toUpperCase();
});
_j1166.addEventListener('change', (e) => {
_j1167.value = e.target.value.toUpperCase();
_j148();
});
_j1167.addEventListener('input', (e) => {
const _j1168 = e.target.value.trim();
if (/^#[0-9A-Fa-f]{6}$/.test(_j1168)) {
_j1166.value = _j1168.toUpperCase();
}
});
_j1167.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j148();
}
});
if (typeof _j125 === 'function') {
_j125();
} else {
setTimeout(() => {
if (typeof _j125 === 'function') {
_j125();
}
}, 100);
}
}
if (_j1169 && _j1170) {
_j1169.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j148();
}
});
_j1170.addEventListener('keypress', (e) => {
if (e.key === 'Enter') {
_j148();
}
});
if (typeof _j126 === 'function') {
_j126();
} else {
setTimeout(() => {
if (typeof _j126 === 'function') {
_j126();
}
}, 100);
}
}
const _j1184 = document.getElementById('panel-scale-slider');
if (_j1184) {
_j1184.value = (typeof window.panelScale !== 'undefined') ? window.panelScale : 0.8;
_j1184.addEventListener('input', (e) => {
window.panelScale = parseFloat(e.target.value);
_j70();
_j74();
_j78();
_j82();
});
}
const _j1185 = document.getElementById('toggle-control-panel');
if (_j1185) {
_j124(_j1185, _j92);
}
const controlPanel = _j63('controlPanel');
const _j1107 = controlPanel?.querySelector('.control-panel-header');
if (_j1107) {
_j1107.addEventListener('mousedown', _j71);
_j1107.addEventListener('touchstart', (e) => {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j71(_j1186);
});
}
const effectControlPanel = _j63('effectControlPanel');
const _j1187 = effectControlPanel?.querySelector('.effect-control-panel-header');
if (_j1187) {
_j1187.addEventListener('mousedown', _j75);
_j1187.addEventListener('touchstart', (e) => {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j75(_j1186);
});
}
const _j1188 = document.getElementById('toggle-effect-control-panel');
if (_j1188) {
_j124(_j1188, _j93);
}
const flowEffectPanel = _j63('flowEffectPanel');
const _j1189 = flowEffectPanel?.querySelector('.flow-effect-panel-header');
if (_j1189) {
_j1189.addEventListener('mousedown', _j79);
_j1189.addEventListener('touchstart', (e) => {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j79(_j1186);
});
}
const _j1190 = document.getElementById('toggle-flow-effect-panel');
if (_j1190) {
_j124(_j1190, _j94);
}
const screenTextToggle = document.getElementById('screen-text-toggle');
if (screenTextToggle) {
screenTextToggle.addEventListener('change', _j95);
}
_j113();
_j110();
_j117();
_j119();
_j121();
_j116();
_j122();
if (screenTextToggle) {
screenTextToggle.checked = screenText;
}
}
function _j128() {
const now = millis();
const _j1191 = (now - _j1131) >= _j1132;
const recordingStatus = _j63('recordingStatus');
if (recordingStatus) {
if (_j582) {
recordingStatus.classList.remove('hidden');
} else {
recordingStatus.classList.add('hidden');
}
}
const playbackStatus = _j63('playbackStatus');
const countdownStatus = _j63('countdownStatus');
if (_j590) {
if (isWaitingToLoop) {
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.remove('hidden');
if (_j1191) {
const _j1192 = loopWaitDuration - (millis() - _j599);
const _j1193 = Math.ceil(_j1192 / 1000);
const _j785 = _j1192 / loopWaitDuration;
if (window.DEBUG_MODE && _j1193 !== _j1130) {
console.log(`Countdown: ${_j1193}s remaining (${Math.floor(_j785 * 100)}%)`);
_j1130 = _j1193;
}
const countdownText = _j63('countdownText');
if (countdownText) {
countdownText.textContent = `Waiting ${_j1193}s`;
}
const countdownCircle = _j63('countdownCircle');
if (countdownCircle) {
const _j1194 = 62.83;
const _j1195 = _j1194 * (1 - _j785);
countdownCircle.style.strokeDashoffset = _j1195;
}
}
} else {
_j1130 = -1;
if (countdownStatus) countdownStatus.classList.add('hidden');
if (playbackStatus) playbackStatus.classList.remove('hidden');
if (_j1191) {
const _j399 = recordingData.events.length > 0 ?
_j592 / recordingData.events.length : 0;
const _j1196 = Math.round(_j399 * 100);
if (_j1196 !== _j1133) {
const progressFill = _j63('progressFill');
const progressText = _j63('progressText');
if (progressFill) progressFill.style.width = `${_j1196}%`;
if (progressText) progressText.textContent = `${_j1196}%`;
_j1133 = _j1196;
}
}
}
} else {
_j1130 = -1;
if (playbackStatus) playbackStatus.classList.add('hidden');
if (countdownStatus) countdownStatus.classList.add('hidden');
}
if (_j1191) {
_j1131 = now;
}
if (typeof _j104 === 'function') {
_j104();
}
}
function _j129(_j1448) {
const _j1197 = document.createElement('div');
_j1197.className = 'message-item new-message';
const _j1198 = document.createElement('span');
_j1198.className = 'message-icon';
_j1198.textContent = _j1448.icon;
const _j1199 = document.createElement('div');
_j1199.className = 'message-content';
const _j1200 = document.createElement('div');
_j1200.className = 'message-header';
const _j1201 = document.createElement('span');
_j1201.className = 'message-timestamp';
_j1201.textContent = _j1448.timestamp;
const _j1202 = document.createElement('span');
_j1202.className = `message-type ${_j1448.type}`;
_j1202.textContent = _j1448.type.toUpperCase();
_j1200.appendChild(_j1201);
_j1200.appendChild(_j1202);
const _j1203 = document.createElement('p');
_j1203.className = 'message-text';
_j1203.textContent = _j1448.message;
_j1199.appendChild(_j1200);
_j1199.appendChild(_j1203);
if (Object.keys(_j1448.data).length > 0) {
const _j1204 = document.createElement('div');
_j1204.className = 'message-data';
_j1204.textContent = JSON.stringify(_j1448.data, null, 2);
_j1199.appendChild(_j1204);
}
_j1197.appendChild(_j1198);
_j1197.appendChild(_j1199);
setTimeout(() => {
_j1197.classList.remove('new-message');
}, 300);
return _j1197;
}
function _j130() {
_j638 = !_j638;
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
if (overlay && hint) {
if (_j638) {
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j70();
} else {
_j85(hint, 'toggle-overlay');
overlay.classList.add('hidden');
hint.classList.remove('hidden');
}
}
localStorage.setItem('overlayVisible', _j638.toString());
}
function _j131() {
_j639 = [];
_j103();
}
function _j132() {
const _j1205 = document.getElementById('record-status-text');
if (_j1205) {
if (_j589 == 1) {
_j1205.textContent = 'ON';
_j1205.classList.add('active');
} else {
_j1205.textContent = 'OFF';
_j1205.classList.remove('active');
}
}
}
function _j133() {
const _j1206 = {};
const _j1207 = window.location.search;
if (!_j1207 || _j1207.length <= 1) {
return _j1206;
}
const _j1208 = _j1207.substring(1);
const _j969 = _j1208.split('_');
const _j1209 = {
'wd': true,
'gr': true
};
for (const _j1210 of _j969) {
if (!_j1210) continue;
const _j1211 = _j1210.indexOf(':');
if (_j1211 === -1) continue;
const key = _j1210.substring(0, _j1211);
const value = _j1210.substring(_j1211 + 1);
if (key) {
if (key === 'w' || key === 'h') {
const _j1212 = parseInt(value);
if (!isNaN(_j1212) && _j1212 > 0) {
_j1206[key] = _j1212;
}
continue;
}
if (_j1209[key]) {
const _j1213 = parseFloat(value);
if (!isNaN(_j1213) && _j1213 > 0) {
_j1206[key] = true;
_j1206[key + '_val'] = _j1213;
} else {
_j1206[key] = false;
}
} else {
_j1206[key] = value === '1';
}
}
}
return _j1206;
}
function _j134(_j1449) {
const _j1214 = {
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
for (const [_j1210, toggleId] of Object.entries(_j1214)) {
if (_j1449.hasOwnProperty(_j1210)) {
if (_j1210 === 'loop' && window.APP_MODE === 'collector') {
if (window.DEBUG_MODE) console.log('🔒 Collector 模式：忽略 URL 参数中的 loop 设置，保持 loopToggle = 1');
continue;
}
const _j1215 = _j1449[_j1210];
const _j1216 = document.getElementById(toggleId);
if (_j1216) {
_j1216.checked = _j1215;
_j1216.dispatchEvent(new Event('change'));
if (_j1210 === 'rs') {
const _j1217 = document.getElementById('rs-sliders-section');
if (_j1217) {
_j1217.style.display = _j1215 ? 'flex' : 'none';
}
} else if (_j1210 === 'distort') {
const _j1218 = document.getElementById('distort-sliders-section');
if (_j1218) {
_j1218.style.display = _j1215 ? 'flex' : 'none';
}
} else if (_j1210 === 'cl') {
const _j1219 = document.getElementById('cellular-sliders-section');
if (_j1219) {
_j1219.style.display = _j1215 ? 'flex' : 'none';
}
} else if (_j1210 === 'wd') {
const _j1220 = document.getElementById('white-dot-sliders-section');
if (_j1220) {
_j1220.style.display = _j1215 ? 'flex' : 'none';
}
if (_j1215 && _j1449['wd_val'] !== undefined) {
const _j1221 = document.getElementById('white-dot-density');
const _j1222 = document.getElementById('white-dot-density-value');
if (_j1221) _j1221.value = _j1449['wd_val'];
if (_j1222) _j1222.textContent = _j1449['wd_val'].toFixed(2);
}
} else if (_j1210 === 'gr') {
const _j1223 = document.getElementById('grain-sliders-section');
if (_j1223) {
_j1223.style.display = _j1215 ? 'flex' : 'none';
}
if (_j1215 && _j1449['gr_val'] !== undefined) {
const _j1224 = document.getElementById('grain-amount');
const _j1225 = document.getElementById('grain-amount-value');
if (_j1224) _j1224.value = _j1449['gr_val'];
if (_j1225) _j1225.textContent = _j1449['gr_val'].toFixed(2);
}
}
} else {
console.warn(`  ⚠️ Toggle not found: ${toggleId} for param: ${_j1210}`);
}
}
}
}
function _j135() {
_j62();
const _j1226 = _j133();
const _j1227 = {
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
if (_j1226['w']) window._urlCanvasWidth = _j1226['w'];
if (_j1226['h']) window._urlCanvasHeight = _j1226['h'];
if (Object.keys(_j1226).length > 0) {
console.log('🔗 檢測到 URL 參數，只設定 URL 有指定的開關');
for (const [_j1210, _j1215] of Object.entries(_j1226)) {
const globalVarName = _j1227[_j1210];
if (globalVarName && typeof window[globalVarName] !== 'undefined') {
if (_j1210 === 'loop') {
window[globalVarName] = _j1215 ? 1 : 0;
} else {
window[globalVarName] = _j1215;
}
}
}
const _j1228 = {
'wd': 'whiteDotDensity',
'gr': 'grainAmount'
};
const _j1229 = {
'wd': '_urlParamWdVal',
'gr': '_urlParamGrVal'
};
for (const [_j1210, globalVarName] of Object.entries(_j1228)) {
const valKey = _j1210 + '_val';
if (_j1226[valKey] !== undefined) {
window[globalVarName] = _j1226[valKey];
window[_j1229[_j1210]] = _j1226[valKey];
}
}
window._initialConsoleFromURL = _j1226.hasOwnProperty('console') ? _j1226.console : false;
}
const _j1171 = typeof window !== 'undefined' && window.APP_MODE ? window.APP_MODE : 'artist';
const _j1172 = _j1171 === 'collector';
const _j1185 = document.getElementById('toggle-overlay');
const _j1230 = document.getElementById('toggle-hint-btn');
const _j1231 = document.getElementById('clear-bite-points');
const _j1232 = document.getElementById('scan-global');
const _j1233 = document.getElementById('scan-current');
const _j1234 = document.getElementById('scan-random');
const _j1235 = document.getElementById('scan-current-random');
const _j1236 = document.getElementById('brush-hint-btn');
const _j1237 = document.querySelectorAll('input[name="pixel-density"]');
if (_j1237.length > 0) {
let _j1238 = 2;
if (typeof _j469 !== 'undefined') {
_j1238 = _j469;
}
const _j1239 = document.querySelector(`input[name="pixel-density"][value="${_j1238}"]`);
if (_j1239) {
_j1239.checked = true;
}
_j1237.forEach(_j1455 => {
_j1455.addEventListener('change', (e) => {
if (e.target.checked) {
const _j678 = parseInt(e.target.value);
if (typeof _j469 !== 'undefined') {
_j469 = _j678;
try {
sessionStorage.setItem('pendingPixelDensity', _j678.toString());
if (typeof _j582 !== 'undefined' && _j582 && typeof recordingData !== 'undefined' && recordingData) {
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
}
_j100('system', '🎨 Pixel density changed - reloading page', {
Value: _j678,
Status: 'Page will reload to recreate canvas with new pixel density',
Note: 'Current drawing will be cleared'
});
setTimeout(() => {
window.location.reload();
}, 300);
} catch (error) {
_j100('system', '❌ Failed to update pixel density', {
Error: error.message,
Status: 'Error'
});
}
} else {
_j100('system', '⚠️ Pixel variable not found', {
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
if (_j1172) {
if (_j1236) _j1236.style.display = 'none';
}
const _j1240 = document.getElementById('record-toggle');
const _j1205 = document.getElementById('record-status-text');
const _j1241 = document.getElementById('realtime-drawing-toggle');
const _j1242 = document.getElementById('realtime-drawing-status-text');
const _j1243 = document.getElementById('grid-overlay-toggle');
const _j1244 = document.getElementById('paper-texture-toggle');
const _j1245 = document.getElementById('camera-moving-toggle');
const _j1246 = document.getElementById('loop-toggle');
const overlay = document.getElementById('message-overlay');
const hint = document.getElementById('toggle-hint');
const brushHint = document.getElementById('brush-hint');
const _j1107 = overlay?.querySelector('.overlay-header');
if (overlay && hint) {
if (_j638) {
overlay.classList.remove('hidden');
hint.classList.add('hidden');
_j70();
} else {
overlay.classList.add('hidden');
hint.classList.remove('hidden');
}
}
const controlPanel = _j63('controlPanel');
if (controlPanel && brushHint) {
if (_j646) {
controlPanel.style.display = 'block';
brushHint.classList.add('hidden');
} else {
controlPanel.style.display = 'none';
brushHint.classList.remove('hidden');
}
}
if (_j1185) {
_j124(_j1185, _j130);
}
if (_j1230) {
_j124(_j1230, () => {
if (!_j84()) _j130();
});
}
if (_j1236) {
_j124(_j1236, () => {
if (!_j84()) _j92();
});
}
const _j1247 = document.getElementById('effect-hint-btn');
if (_j1247) {
_j124(_j1247, () => {
if (!_j84()) _j93();
});
}
const _j1248 = document.getElementById('flow-hint-btn');
if (_j1248) {
_j124(_j1248, () => {
if (!_j84()) _j94();
});
}
if (_j1232) {
_j124(_j1232, () => {
if (typeof _j18 === 'function') {
const shapeType = _j142();
let scanSeed = null;
if (typeof crandom !== 'undefined' && typeof crandom.random === 'function') {
scanSeed = int(crandom.random(100000000, 999999999));
} else if (typeof random === 'function') {
scanSeed = int(random(100000000, 999999999));
}
const _j763 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j763 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j763);
noiseSeed(_j763);
}
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j168('ec', {
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
function _j136(strokeIndex = null) {
if (typeof _j18 !== 'function') {
console.error('scanAndMarkDarkPoints 函数未定义');
return;
}
const shapeType = _j142();
let scanBounds = null;
let _j299 = null;
if (typeof _j532 !== 'undefined' && _j532.length > 0) {
if (strokeIndex !== null) {
_j299 = Math.max(0, Math.min(strokeIndex, _j532.length - 1));
} else {
const _j1249 = document.getElementById('stroke-select-slider');
if (_j1249) {
_j299 = parseInt(_j1249.value) || 0;
_j299 = Math.max(0, Math.min(_j299, _j532.length - 1));
}
}
if (_j299 !== null) {
const selectedStroke = _j532[_j299];
if (selectedStroke) {
if (selectedStroke.gridParams && selectedStroke.gridParams.left !== undefined) {
scanBounds = {
minX: selectedStroke.gridParams.left,
maxX: selectedStroke.gridParams.right,
minY: selectedStroke.gridParams.top,
maxY: selectedStroke.gridParams.bottom
};
_j100('system', `🎯 EACH: 使用笔画 #${_j299} 的网格区域`, {
Index: _j299,
GridArea: `${Math.round(scanBounds.maxX - scanBounds.minX)}x${Math.round(scanBounds.maxY - scanBounds.minY)}`,
TotalStrokes: _j532.length
});
} else if (selectedStroke.bounds) {
scanBounds = {
...selectedStroke.bounds
};
_j100('system', `🎯 EACH: 使用笔画 #${_j299} 的边界框（无网格数据）`, {
Index: _j299,
TotalStrokes: _j532.length
});
}
}
}
}
if (!scanBounds) {
if (typeof pendingBugBounds !== 'undefined' && pendingBugBounds !== null) {
scanBounds = pendingBugBounds;
} else if (typeof _j532 !== 'undefined' && _j532.length > 0) {
const lastStroke = _j532[_j532.length - 1];
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
const _j763 = (typeof seed !== 'undefined') ? seed : null;
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
if (_j763 && typeof randomSeed === 'function' && typeof noiseSeed === 'function') {
randomSeed(_j763);
noiseSeed(_j763);
}
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
const targetPoints = (window.currentScanEvent && window.currentScanEvent.targetPoints) ? window.currentScanEvent.targetPoints : null;
_j168('ec', {
action: 'scan-current',
shapeType: shapeType,
bugsSize: (typeof window.bugsSize !== 'undefined') ? window.bugsSize : 10.0,
scanBounds: scanBounds,
scanSeed: scanSeed,
randomCount: recordedRandomCount,
strokeIndex: _j299,
targetPoints: targetPoints
});
}
if (typeof window !== 'undefined') {
window.currentScanEvent = null;
}
}
if (_j1233) {
_j124(_j1233, () => {
_j136();
});
}
if (_j1235) {
_j124(_j1235, () => {
if (typeof _j532 !== 'undefined' && _j532.length > 0) {
const _j1250 = Math.floor(Math.random() * _j532.length);
const _j1249 = document.getElementById('stroke-select-slider');
const _j1251 = document.getElementById('stroke-index-display');
const _j1252 = document.getElementById('stroke-select-value');
if (_j1249) {
_j1249.value = _j1250;
_j1249.dispatchEvent(new Event('input', {
bubbles: true
}));
}
if (_j1251) {
_j1251.textContent = _j1250;
}
if (_j1252) {
_j1252.textContent = _j1250;
}
_j100('system', `🎲 EACHR: 随机选择笔画 #${_j1250}`, {
RandomIndex: _j1250,
TotalStrokes: _j532.length
});
_j136(_j1250);
} else {
_j100('system', '⚠️ EACHR: 没有可用的笔画', {});
}
});
}
if (_j1234) {
_j124(_j1234, () => {
if (typeof _j19 === 'function') {
const shapeType = _j142();
_j19(10, shapeType);
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
_j168('ec', {
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
if (_j1231) {
_j124(_j1231, () => {
if (typeof _j216 !== 'undefined' && _j216.length > 0) {
let pointCount = typeof _j216 !== 'undefined' ? _j216.length : 0;
if (typeof _j216 !== 'undefined') {
_j216 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j100('system', '🧹 清除虫咬点', {
'虫咬点': pointCount
});
} else {
_j100('system', '⚠️ 没有虫咬点可清除', {});
}
});
}
if (_j1240) {
_j1240.checked = (_j589 == 1);
_j132();
_j1240.addEventListener('change', (e) => {
_j589 = e.target.checked ? 1 : 0;
_j132();
_j100('system', `Record mode ${_j589 ? 'enabled' : 'disabled'}`, {
Status: _j589 ? 'ON' : 'OFF'
});
});
}
if (_j1241) {
_j1241.disabled = true;
if (_j1242) {
_j1242.textContent = 'DISABLED';
}
_j1241.addEventListener('change', (e) => {
e.target.checked = false;
_j100('system', '⚠️ Realtime drawing mode is disabled', {
Status: 'Feature removed'
});
});
}
if (_j1243) {
try {
if (typeof showGridOverlay !== 'undefined') {
_j1243.checked = !!showGridOverlay;
}
} catch (e) {}
_j1243.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showGridOverlay = enabled;
} catch (_j1459) {}
_j100('system', '📐 Grid overlay', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
if (_j1244) {
try {
if (typeof showPaperTexture !== 'undefined') {
_j1244.checked = !!showPaperTexture;
} else {
_j1244.checked = true;
}
} catch (e) {
_j1244.checked = true;
}
_j1244.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showPaperTexture = enabled;
} catch (_j1459) {}
_j100('system', '🧻 Paper texture', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
});
}
const _j1253 = document.getElementById('fit-canvas-toggle');
if (_j1253) {
_j1253.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
if (typeof window.toggleFitMode === 'function') {
window.toggleFitMode(enabled);
_j100('system', '🎨 Fit canvas', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
_j100('system', '⚠️ Fit mode function not available', {
Status: 'Error'
});
}
});
}
if (_j1245) {
try {
if (typeof doMoving !== 'undefined') {
_j1245.checked = !!doMoving;
} else {
_j1245.checked = false;
}
} catch (e) {
_j1245.checked = false;
}
_j1245.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
doMoving = enabled;
} catch (_j1459) {}
_j100('system', '🎥 Camera moving', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
});
}
if (_j1246) {
try {
if (typeof loopToggle !== 'undefined') {
_j1246.checked = (loopToggle === 1);
} else {
_j1246.checked = false;
}
} catch (e) {
_j1246.checked = false;
}
_j1246.addEventListener('change', (e) => {
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
_j100('system', '🔁 Loop playback', {
Status: enabled ? 'Enabled ✅ (Auto repeat after 5s)' : 'Disabled ❌ (Single playback)'
});
} else {
console.warn('⚠️ loopToggle variable not found');
}
} catch (_j1459) {
console.error('Error setting loopToggle:', _j1459);
}
});
}
const _j1254 = document.getElementById('playback-offset-x');
const _j1255 = document.getElementById('playback-offset-y');
if (_j1254) {
if (typeof _j602 !== 'undefined') {
_j1254.value = _j602;
}
_j1254.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j602 !== 'undefined') {
_j602 = value;
_j100('system', '📍 Playback offset X updated', {
OffsetX: value
});
}
});
}
if (_j1255) {
if (typeof _j603 !== 'undefined') {
_j1255.value = _j603;
}
_j1255.addEventListener('input', (e) => {
const value = parseFloat(e.target.value) || 0;
if (typeof _j603 !== 'undefined') {
_j603 = value;
_j100('system', '📍 Playback offset Y updated', {
OffsetY: value
});
}
});
}
const _j1256 = document.getElementById('distort-shader-toggle');
const _j1218 = document.getElementById('distort-sliders-section');
if (_j1256) {
try {
if (typeof distortShaderEnabled !== 'undefined') {
_j1256.checked = !!distortShaderEnabled;
if (_j1218) {
_j1218.style.display = distortShaderEnabled ? 'flex' : 'none';
}
} else {
_j1256.checked = false;
if (_j1218) {
_j1218.style.display = 'none';
}
}
} catch (e) {
_j1256.checked = false;
if (_j1218) {
_j1218.style.display = 'none';
}
}
_j1256.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShaderEnabled !== 'undefined') {
distortShaderEnabled = enabled;
if (_j1218) {
_j1218.style.display = enabled ? 'flex' : 'none';
}
_j100('system', '🌀 Distort shader', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShaderEnabled variable not found');
}
} catch (_j1459) {
console.error('Error setting distortShaderEnabled:', _j1459);
}
});
}
const _j1257 = document.getElementById('distort-displacement-b');
const _j1258 = document.getElementById('distort-displacement-b-value');
if (_j1257 && _j1258) {
const _j1259 = parseFloat(_j1257.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = _j1259;
}
_j1258.textContent = Math.round(_j1259);
_j1257.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementB !== 'undefined') {
distortDisplacementB = value;
}
_j1258.textContent = Math.round(value);
});
}
const _j1260 = document.getElementById('distort-displacement-c');
const _j1261 = document.getElementById('distort-displacement-c-value');
if (_j1260 && _j1261) {
const _j1259 = parseFloat(_j1260.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = _j1259;
}
_j1261.textContent = Math.round(_j1259);
_j1260.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof distortDisplacementC !== 'undefined') {
distortDisplacementC = value;
}
_j1261.textContent = Math.round(value);
});
}
const _j1262 = document.getElementById('distort-fbm-preview-toggle');
if (_j1262) {
try {
if (typeof distortShowFbmMask !== 'undefined') {
_j1262.checked = (distortShowFbmMask > 0.5);
} else {
_j1262.checked = false;
}
} catch (e) {
_j1262.checked = false;
}
_j1262.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = enabled ? 1.0 : 0.0;
_j100('system', '🎨 fBM Mask Preview', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ distortShowFbmMask variable not found');
}
} catch (_j1459) {
console.error('Error setting distortShowFbmMask:', _j1459);
}
});
}
const _j1263 = document.getElementById('rs-toggle');
const _j1217 = document.getElementById('rs-sliders-section');
if (_j1263) {
try {
if (typeof rsEnabled !== 'undefined') {
_j1263.checked = !!rsEnabled;
if (_j1217) {
_j1217.style.display = rsEnabled ? 'flex' : 'none';
}
} else {
_j1263.checked = false;
if (_j1217) {
_j1217.style.display = 'none';
}
}
} catch (e) {
_j1263.checked = false;
if (_j1217) {
_j1217.style.display = 'none';
}
}
_j1263.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof rsEnabled !== 'undefined') {
rsEnabled = enabled;
if (_j1217) {
_j1217.style.display = enabled ? 'flex' : 'none';
}
_j100('system', '🌊 Resonances', {
Status: enabled ? 'Enabled ✅' : 'Disabled ❌'
});
} else {
console.warn('⚠️ rsEnabled variable not found');
}
} catch (_j1459) {
console.error('Error setting rsEnabled:', _j1459);
}
});
}
const _j1264 = document.getElementById('rs-frequency');
const _j1265 = document.getElementById('rs-frequency-value');
if (_j1264 && _j1265) {
const _j1259 = parseFloat(_j1264.value);
if (typeof _j537 !== 'undefined') {
_j537 = _j1259;
}
_j1265.textContent = Math.round(_j1259);
_j1264.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j537 !== 'undefined') {
_j537 = value;
}
_j1265.textContent = Math.round(value);
});
}
const _j1266 = document.getElementById('rs-wave-speed');
const _j1267 = document.getElementById('rs-wave-speed-value');
if (_j1266 && _j1267) {
const _j1259 = parseFloat(_j1266.value);
if (typeof _j538 !== 'undefined') {
_j538 = _j1259;
}
_j1267.textContent = _j1259.toFixed(1);
_j1266.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j538 !== 'undefined') {
_j538 = value;
}
_j1267.textContent = value.toFixed(1);
});
}
const _j1268 = document.getElementById('rs-strength');
const _j1269 = document.getElementById('rs-strength-value');
if (_j1268 && _j1269) {
const _j1259 = parseFloat(_j1268.value);
if (typeof _j539 !== 'undefined') {
_j539 = _j1259;
}
_j1269.textContent = _j1259.toFixed(1);
_j1268.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j539 !== 'undefined') {
_j539 = value;
}
_j1269.textContent = value.toFixed(1);
});
}
const _j1270 = document.getElementById('rs-gradient-mix');
const _j1271 = document.getElementById('rs-gradient-mix-value');
if (_j1270 && _j1271) {
const _j1259 = parseFloat(_j1270.value);
if (typeof _j540 !== 'undefined') {
_j540 = _j1259;
}
_j1271.textContent = _j1259.toFixed(1);
_j1270.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j540 !== 'undefined') {
_j540 = value;
}
_j1271.textContent = value.toFixed(1);
});
}
const _j1272 = document.getElementById('rs-scale');
const _j1273 = document.getElementById('rs-scale-value');
if (_j1272 && _j1273) {
const _j1259 = parseFloat(_j1272.value);
if (typeof _j541 !== 'undefined') {
_j541 = _j1259;
}
_j1273.textContent = Math.round(_j1259);
_j1272.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j541 !== 'undefined') {
_j541 = value;
}
_j1273.textContent = Math.round(value);
});
}
const _j1274 = document.getElementById('cellular-toggle');
const _j1219 = document.getElementById('cellular-sliders-section');
if (_j1274) {
try {
if (typeof cellularEnabled !== 'undefined') {
_j1274.checked = !!cellularEnabled;
if (_j1219) {
_j1219.style.display = cellularEnabled ? 'flex' : 'none';
}
} else {
_j1274.checked = false;
if (_j1219) _j1219.style.display = 'none';
}
} catch (e) {
_j1274.checked = false;
if (_j1219) _j1219.style.display = 'none';
}
_j1274.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof cellularEnabled !== 'undefined') {
cellularEnabled = enabled;
if (_j1219) {
_j1219.style.display = enabled ? 'flex' : 'none';
}
_j100('system', 'Cellular texture', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1459) {
console.error('Error setting cellularEnabled:', _j1459);
}
});
}
const _j1275 = document.getElementById('cellular-scale');
const _j1276 = document.getElementById('cellular-scale-value');
if (_j1275 && _j1276) {
const _j1259 = parseFloat(_j1275.value);
if (typeof _j542 !== 'undefined') _j542 = _j1259;
_j1276.textContent = _j1259.toFixed(1);
_j1275.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j542 !== 'undefined') _j542 = value;
_j1276.textContent = value.toFixed(1);
});
}
const _j1277 = document.getElementById('cellular-seed');
const _j1278 = document.getElementById('cellular-seed-value');
if (_j1277 && _j1278) {
const _j1259 = parseFloat(_j1277.value);
if (typeof _j543 !== 'undefined') _j543 = _j1259;
_j1278.textContent = _j1259.toFixed(1);
_j1277.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof _j543 !== 'undefined') _j543 = value;
_j1278.textContent = value.toFixed(1);
});
}
const _j1279 = document.getElementById('white-dot-toggle');
const _j1280 = document.getElementById('white-dot-sliders-section');
if (_j1279) {
try {
if (typeof whiteDotEnabled !== 'undefined') {
_j1279.checked = !!whiteDotEnabled;
if (_j1280) _j1280.style.display = whiteDotEnabled ? 'flex' : 'none';
} else {
_j1279.checked = false;
if (_j1280) _j1280.style.display = 'none';
}
} catch (e) {
_j1279.checked = false;
if (_j1280) _j1280.style.display = 'none';
}
_j1279.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof whiteDotEnabled !== 'undefined') {
whiteDotEnabled = enabled;
if (_j1280) _j1280.style.display = enabled ? 'flex' : 'none';
_j100('system', 'White Dot', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1459) {
console.error('Error setting whiteDotEnabled:', _j1459);
}
});
}
const _j1281 = document.getElementById('white-dot-density');
const _j1282 = document.getElementById('white-dot-density-value');
if (_j1281 && _j1282) {
if (window._urlParamWdVal !== undefined) {
const _j1283 = window._urlParamWdVal;
_j544 = _j1283 * 0.1;
_j1281.value = _j1283;
_j1282.textContent = _j1283.toFixed(2);
} else {
const _j1283 = parseFloat(_j1281.value);
if (typeof _j544 !== 'undefined') _j544 = _j1283 * 0.1;
_j1282.textContent = _j1283.toFixed(2);
}
_j1281.addEventListener('input', (e) => {
const _j1283 = parseFloat(e.target.value);
if (typeof _j544 !== 'undefined') _j544 = _j1283 * 0.1;
_j1282.textContent = _j1283.toFixed(2);
});
}
const _j1284 = document.getElementById('grain-toggle');
const _j1285 = document.getElementById('grain-sliders-section');
if (_j1284) {
try {
if (typeof grainEnabled !== 'undefined') {
_j1284.checked = !!grainEnabled;
if (_j1285) _j1285.style.display = grainEnabled ? 'flex' : 'none';
} else {
_j1284.checked = false;
if (_j1285) _j1285.style.display = 'none';
}
} catch (e) {
_j1284.checked = false;
if (_j1285) _j1285.style.display = 'none';
}
_j1284.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
if (typeof grainEnabled !== 'undefined') {
grainEnabled = enabled;
if (_j1285) _j1285.style.display = enabled ? 'flex' : 'none';
_j100('system', 'Grain', {
Status: enabled ? 'Enabled' : 'Disabled'
});
}
} catch (_j1459) {
console.error('Error setting grainEnabled:', _j1459);
}
});
}
const _j1286 = document.getElementById('grain-amount');
const _j1287 = document.getElementById('grain-amount-value');
if (_j1286 && _j1287) {
if (window._urlParamGrVal !== undefined) {
const _j1283 = window._urlParamGrVal;
_j545 = _j1283 * 0.1;
_j1286.value = _j1283;
_j1287.textContent = _j1283.toFixed(2);
} else {
const _j1283 = parseFloat(_j1286.value);
if (typeof _j545 !== 'undefined') _j545 = _j1283 * 0.1;
_j1287.textContent = _j1283.toFixed(2);
}
_j1286.addEventListener('input', (e) => {
const _j1283 = parseFloat(e.target.value);
if (typeof _j545 !== 'undefined') _j545 = _j1283 * 0.1;
_j1287.textContent = _j1283.toFixed(2);
});
}
const _j1288 = document.getElementById('future-path-preview-toggle');
if (_j1288) {
try {
if (typeof showFuturePathPreview !== 'undefined') {
_j1288.checked = !!showFuturePathPreview;
} else {
_j1288.checked = true;
}
} catch (e) {
_j1288.checked = true;
}
_j1288.addEventListener('change', (e) => {
const enabled = !!e.target.checked;
try {
showFuturePathPreview = enabled;
_j100('system', '🔮 Future Path Preview', {
Status: enabled ? 'Show ✅' : 'Hide ❌'
});
} catch (_j1459) {
console.error('Error setting showFuturePathPreview:', _j1459);
}
});
}
if (recordBtn) {
_j124(recordBtn, () => {
if (!_j582 && !_j590) {
_j169();
_j104();
}
});
}
if (stopBtn) {
_j124(stopBtn, () => {
if (_j582) {
_j170();
} else if (_j590) {
_j173();
}
_j104();
});
}
if (playBtn) {
_j124(playBtn, () => {
if (!_j582 && !_j590 && recordingData.events.length > 0) {
startPlayback();
_j104();
}
});
}
if (loadBtn) {
_j124(loadBtn, () => {
if (!_j582 && !_j590) {
_j172();
}
});
}
const _j1289 = document.getElementById('load-image');
const _j1290 = document.getElementById('image-file-input');
if (_j1172) {
if (_j1289) _j1289.style.display = 'none';
} else if (_j1289 && _j1290) {
_j124(_j1289, () => {
_j1290.click();
});
_j1290.addEventListener('change', (e) => {
const _j1291 = e.target.files[0];
if (_j1291 && _j1291.type.startsWith('image/')) {
_j105(_j1291);
}
});
}
const _j1292 = document.getElementById('show-reference-image');
if (_j1292 && !_j1172) {
_j124(_j1292, () => {
_j106();
});
}
const _j1293 = document.getElementById('hide-reference-image');
if (_j1293 && !_j1172) {
_j124(_j1293, () => {
_j107();
});
}
if (_j1107) {
_j1107.addEventListener('mousedown', _j64);
_j1107.addEventListener('touchstart', (e) => {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY,
target: e.target,
preventDefault: () => e.preventDefault()
};
_j64(_j1186);
});
}
_j69();
const _j1294 = _j63('flowEffectPanel');
if (_j1294 && !_j1294.querySelector('.panel-drag-handle')) {
const dh = document.createElement('div');
dh.className = 'panel-drag-handle';
dh.setAttribute('data-panel', 'flow');
dh.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M12 0 L12 12 L0 12 Z" fill="currentColor"></path></svg>';
_j1294.appendChild(dh);
}
document.querySelectorAll('.panel-drag-handle').forEach(_j1458 => {
const _j1295 = _j1458.getAttribute('data-panel');
const _j1296 = {
overlay: _j64,
control: _j71,
effect: _j75,
flow: _j79
};
const fn = _j1296[_j1295];
if (!fn) return;
_j1458.addEventListener('mousedown', (e) => {
e.preventDefault();
fn(e);
});
_j1458.addEventListener('touchstart', (e) => {
const _j1112 = e.touches[0];
fn({ clientX: _j1112.clientX, clientY: _j1112.clientY, target: _j1458, closest: () => null, preventDefault: () => e.preventDefault() });
}, { passive: false });
});
_j68(document.getElementById('message-overlay'));
document.addEventListener('mousemove', _j65);
document.addEventListener('mouseup', _j66);
document.addEventListener('touchmove', (e) => {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY
};
_j65(_j1186);
});
document.addEventListener('touchend', _j66);
document.addEventListener('mousemove', _j72);
document.addEventListener('mouseup', _j73);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY
};
_j72(_j1186);
}
});
document.addEventListener('touchend', _j73);
document.addEventListener('mousemove', _j76);
document.addEventListener('mouseup', _j77);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY
};
_j76(_j1186);
}
});
document.addEventListener('touchend', _j77);
document.addEventListener('mousemove', _j80);
document.addEventListener('mouseup', _j81);
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
const _j1112 = e.touches[0];
const _j1186 = {
clientX: _j1112.clientX,
clientY: _j1112.clientY
};
_j80(_j1186);
}
});
document.addEventListener('touchend', _j81);
if (hint && !_j638) {
hint.classList.remove('hidden');
}
_j104();
_j140();
_j144();
_j149();
_j145();
_j78();
_j82();
const effectControlPanel = _j63('effectControlPanel');
const effectHint = _j63('effectHint');
const _j1188 = document.getElementById('toggle-effect-control-panel');
if (effectControlPanel && effectHint) {
if (_j650) {
effectControlPanel.style.display = 'block';
effectHint.classList.add('hidden');
} else {
effectControlPanel.style.display = 'none';
effectHint.classList.remove('hidden');
}
if (_j1188) {
_j1188.textContent = _j650 ? 'Hide' : 'Show';
}
}
const flowEffectPanel = _j63('flowEffectPanel');
const flowHint = _j63('flowHint');
const _j1190 = document.getElementById('toggle-flow-effect-panel');
if (flowEffectPanel && flowHint) {
if (_j654) {
flowEffectPanel.style.display = 'block';
flowHint.classList.add('hidden');
} else {
flowEffectPanel.style.display = 'none';
flowHint.classList.remove('hidden');
}
if (_j1190) {
_j1190.textContent = _j654 ? 'Hide' : 'Show';
}
}
if (Object.keys(_j1226).length > 0) {
setTimeout(() => {
_j134(_j1226);
_j100('system', '🔗 URL Configuration Loaded', {
Parameters: Object.keys(_j1226).length
});
}, 200);
}
setTimeout(() => {
_j91();
_j90();
}, 100);
_j137();
}
let _j1297 = false;
let _j1298 = null;
function _j137() {
if (document.getElementById('zen-mode-btn')) return;
const btn = document.createElement('button');
btn.id = 'zen-mode-btn';
btn.innerHTML = '<span class="zen-bars"><span class="zen-bar"></span><span class="zen-bar"></span><span class="zen-bar"></span></span><span class="zen-asterisk" aria-hidden="true">＊</span>';
btn.title = 'Zen Mode — hide all panels';
document.body.appendChild(btn);
_j124(btn, _j138);
}
function _j138() {
const overlay = document.getElementById('message-overlay');
const controlPanel = document.getElementById('control-panel');
const _j1299 = document.getElementById('effect-control-panel');
const _j1294 = document.getElementById('flow-effect-panel');
const _j1300 = document.querySelectorAll('#toggle-hint, #brush-hint, #effect-hint, #flow-hint');
const btn = document.getElementById('zen-mode-btn');
if (!_j1297) {
_j1298 = {
overlay: _j638,
control: _j646,
effect: _j650,
flow: _j654
};
if (overlay) overlay.style.display = 'none';
if (controlPanel) controlPanel.style.display = 'none';
if (_j1299) _j1299.style.display = 'none';
if (_j1294) _j1294.style.display = 'none';
_j1300.forEach(h => h.style.display = 'none');
_j638 = false;
_j646 = false;
_j650 = false;
_j654 = false;
_j1297 = true;
if (btn) btn.classList.add('zen-active');
btn.title = 'Exit Zen Mode — restore panels';
} else {
const s = _j1298 || { overlay: true, control: true, effect: true, flow: true };
_j638 = s.overlay;
_j646 = s.control;
_j650 = s.effect;
_j654 = s.flow;
if (overlay) overlay.style.display = s.overlay ? '' : 'none';
if (controlPanel) controlPanel.style.display = s.control ? 'block' : 'none';
if (_j1299) _j1299.style.display = s.effect ? 'block' : 'none';
if (_j1294) _j1294.style.display = s.flow ? 'block' : 'none';
_j1300.forEach(h => h.style.display = '');
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
_j1297 = false;
_j1298 = null;
if (btn) btn.classList.remove('zen-active');
btn.title = 'Zen Mode — hide all panels';
_j139();
}
}
function _j139() {
const _j1301 = [
{ panel: _j63('messageOverlay'), pos: _j642, update: _j70, defaultPos: { x: 50, y: 50 } },
{ panel: _j63('controlPanel'), pos: _j645, update: _j74, defaultPos: { x: 85, y: 50 } },
{ panel: _j63('effectControlPanel'), pos: _j649, update: _j78, defaultPos: { x: 15, y: 50 } },
{ panel: _j63('flowEffectPanel'), pos: _j653, update: _j82, defaultPos: { x: 50, y: 85 } }
];
_j1301.forEach(({ panel, pos, update, defaultPos }) => {
if (!panel || panel.style.display === 'none') return;
const _j1107 = panel.querySelector('.control-btn');
if (!_j1107) return;
const rect = _j1107.getBoundingClientRect();
const vw = window.innerWidth;
const vh = window.innerHeight;
if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) {
pos.x = defaultPos.x;
pos.y = defaultPos.y;
update();
}
});
_j99();
}
function activateZenMode() {
if (_j1297) return;
_j138();
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
let _j1302 = false;
const _j1303 = new MutationObserver(() => {
if (_j1302) return;
if (go()) {
_j1302 = true;
_j1303.disconnect();
}
});
_j1303.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
if (!_j1302) _j1303.disconnect();
}, 15000);
}
window.scheduleMobilePhoneZenMode = scheduleMobilePhoneZenMode;
function _j140() {
const _j1304 = document.getElementById('metallic-strength');
const _j1305 = document.getElementById('metallic-strength-value');
if (_j1304 && _j1305) {
const _j1259 = parseFloat(_j1304.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = _j1259 / 100;
}
_j1305.textContent = _j1259;
_j1304.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicStrength !== 'undefined') {
window.metallicStrength = value / 100;
}
_j1305.textContent = value;
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
_j168('ec', {
action: 'metallic-strength',
value: value
});
}
});
}
const _j1306 = document.getElementById('metallic-flow');
const _j1307 = document.getElementById('metallic-flow-value');
const _j1308 = document.getElementById('flow-auto-random');
let _j1309 = null;
if (_j1306 && _j1307) {
const _j1259 = parseFloat(_j1306.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j1259 / 100;
}
_j1307.textContent = _j1259;
_j1306.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = value / 100;
}
_j1307.textContent = value;
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
_j168('ec', {
action: 'metallic-flow',
value: value
});
}
});
}
if (_j1308 && _j1306 && _j1307) {
_j1308.addEventListener('click', () => {
const isActive = _j1308.getAttribute('data-active') === 'true';
if (isActive) {
_j1308.setAttribute('data-active', 'false');
_j1308.classList.remove('active');
if (_j1309) {
clearInterval(_j1309);
_j1309 = null;
}
console.log('🎲 Flow 自动随机：关闭');
} else {
_j1308.setAttribute('data-active', 'true');
_j1308.classList.add('active');
_j1309 = setInterval(() => {
const _j298 = Math.floor(Math.random() * (300 - 10 + 1)) + 10;
_j1306.value = _j298;
_j1307.textContent = _j298;
if (typeof window.metallicFlowSpeed !== 'undefined') {
window.metallicFlowSpeed = _j298 / 50;
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
Object.keys(tintButtons).forEach(_j1367 => {
const _j1310 = document.getElementById(_j1367);
if (_j1310) {
_j1310.classList.remove('active');
}
});
btn.classList.add('active');
const _j1311 = btn.textContent.trim();
_j100('system', '🎨 Metal tint changed', {
Tint: _j1311,
RGB: `[${tintButtons[id].join(', ')}]`
});
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
const tintType = id.replace('metal-', '');
_j168('ec', {
action: 'metal-tint',
tintType: tintType
});
}
}
});
}
});
}
function _j141() {
_j113();
_j110();
_j117();
_j119();
_j121();
_j116();
}
function _j142() {
const _j1312 = document.querySelector('.shape-type-btn.active');
if (_j1312) {
return parseInt(_j1312.dataset.type);
}
return 0;
}
function _j143(type) {
const _j1138 = document.querySelectorAll('.shape-type-btn');
_j1138.forEach(btn => {
const _j1313 = parseInt(btn.dataset.type);
if (_j1313 === type) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
}
function _j144() {
const _j761 = document.getElementById('bugs-size');
const _j1314 = document.getElementById('bugs-size-value');
if (_j761 && _j1314) {
const _j1259 = parseFloat(_j761.value);
if (typeof window.bugsSize !== 'undefined') {
window.bugsSize = _j1259;
}
_j1314.textContent = _j1259;
_j761.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
window.bugsSize = value;
_j1314.textContent = value;
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
_j168('ec', {
action: 'bugs-size',
value: value
});
}
});
}
const _j1315 = document.querySelectorAll('.shape-type-btn');
_j1315.forEach(btn => {
_j124(btn, () => {
const type = parseInt(btn.dataset.type);
_j143(type);
});
});
}
function _j145() {
const _j1249 = document.getElementById('stroke-select-slider');
const _j1251 = document.getElementById('stroke-index-display');
const _j1316 = document.getElementById('stroke-total-display');
const _j1252 = document.getElementById('stroke-select-value');
if (!_j1249 || !_j1251 || !_j1316 || !_j1252) {
return;
}
function _j146(_j1450 = false) {
const _j846 = (typeof _j532 !== 'undefined' && Array.isArray(_j532)) ?
_j532.length :
0;
const _j1317 = Math.max(0, _j846 - 1);
_j1249.max = _j1317;
_j1316.textContent = _j846;
if (_j1450 || parseInt(_j1249.value) > _j1317) {
_j1249.value = _j1317;
}
const _j1318 = parseInt(_j1249.value) || 0;
_j1251.textContent = _j1318;
_j1252.textContent = _j1318;
}
_j146();
_j1249.addEventListener('input', (e) => {
const value = parseInt(e.target.value) || 0;
_j1251.textContent = value;
_j1252.textContent = value;
let gridParams = null;
let points = null;
if (typeof _j532 !== 'undefined' && Array.isArray(_j532) && _j532.length > 0) {
const _j1319 = Math.max(0, Math.min(value, _j532.length - 1));
const selectedStroke = _j532[_j1319];
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
let _j1320 = 0;
setInterval(() => {
const _j1321 = (typeof _j532 !== 'undefined' && Array.isArray(_j532)) ?
_j532.length :
0;
if (_j1321 !== _j1320) {
const _j513 = _j1321 > _j1320;
_j146(_j513);
_j1320 = _j1321;
}
}, 500);
window.updateStrokeSelector = _j146;
}
function _j147() {
const _j1178 = document.getElementById('custom-brush-color');
const _j1179 = document.getElementById('custom-brush-color-text');
if (!_j1178 || !_j1179) {
console.error('Custom brush color inputs not found');
return;
}
let _j1168 = _j1179.value.trim();
if (!_j1168 || !/^#[0-9A-Fa-f]{6}$/.test(_j1168)) {
_j1168 = _j1178.value;
}
const r = parseInt(_j1168.slice(1, 3), 16);
const g = parseInt(_j1168.slice(3, 5), 16);
const b = parseInt(_j1168.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j100('ui', '❌ Invalid custom brush color', {
Color: _j1168,
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
_j119();
_j122();
_j1178.value = _j1168.toUpperCase();
_j1179.value = _j1168.toUpperCase();
_j100('ui', '🎨 Custom brush color applied', {
Color: _j1168,
RGB: `(${r}, ${g}, ${b})`,
ColorCode: 33
});
}
function _j148() {
const _j1166 = document.getElementById('canvas-background-color');
const _j1167 = document.getElementById('canvas-background-color-text');
const _j1169 = document.getElementById('canvas-width');
const _j1170 = document.getElementById('canvas-height');
let _j1322 = false;
if (_j1166 && _j1167) {
let _j1168 = _j1167.value.trim();
if (!_j1168 || !/^#[0-9A-Fa-f]{6}$/.test(_j1168)) {
_j1168 = _j1166.value;
}
const r = parseInt(_j1168.slice(1, 3), 16);
const g = parseInt(_j1168.slice(3, 5), 16);
const b = parseInt(_j1168.slice(5, 7), 16);
if (isNaN(r) || isNaN(g) || isNaN(b)) {
_j100('ui', '❌ Invalid background color', {
Color: _j1168,
Status: 'Please use format #RRGGBB'
});
return;
}
if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
_j100('ui', '❌ Color values out of range', {
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
_j100('ui', '❌ canvasBackgroundColor not found', {
Status: 'Error: Variable not defined'
});
return;
}
if (typeof _j578 !== 'undefined' && _j578) {
_j578.begin();
background(r, g, b);
_j578.end();
}
if (typeof _j29 === 'function') {
_j29();
}
if (typeof _j522 !== 'undefined') {
_j522 = true;
}
_j1166.value = _j1168.toUpperCase();
_j1167.value = _j1168.toUpperCase();
_j100('ui', '🎨 Background color changed', {
Color: _j1168,
RGB: `(${r}, ${g}, ${b})`
});
}
if (_j1169 && _j1170) {
const _j1323 = parseInt(_j1169.value);
const _j1324 = parseInt(_j1170.value);
if (isNaN(_j1323) || isNaN(_j1324)) {
_j100('ui', '❌ Invalid canvas size', {
Width: _j1169.value,
Height: _j1170.value,
Status: 'Please enter valid numbers'
});
return;
}
if (_j1323 < 100 || _j1323 > 4000 || _j1324 < 100 || _j1324 > 4000) {
_j100('ui', '❌ Canvas size out of range', {
Width: _j1323,
Height: _j1324,
Status: 'Size must be between 100 and 4000 pixels'
});
return;
}
if (typeof _j467 !== 'undefined' && typeof _j468 !== 'undefined') {
if (_j467 !== _j1323 || _j468 !== _j1324) {
_j467 = _j1323;
_j468 = _j1324;
_j1322 = true;
_j100('ui', '📐 Canvas size changed', {
Width: `${_j1323}px`,
Height: `${_j1324}px`,
Status: 'Page will reload to apply changes'
});
}
}
}
if (_j1322) {
sessionStorage.setItem('pendingCanvasWidth', _j467.toString());
sessionStorage.setItem('pendingCanvasHeight', _j468.toString());
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(canvasBackgroundColor));
setTimeout(() => {
window.location.reload();
}, 300);
}
}
let _j1325 = null;
let _j1326 = null;
function _j149() {
const _j1327 = document.querySelectorAll('.flow-effect-btn');
const _j1328 = document.getElementById('flow-strength');
const _j1329 = document.getElementById('flow-strength-value');
if (_j1328 && _j1329) {
_j1328.addEventListener('input', (e) => {
const value = parseFloat(e.target.value);
_j1329.textContent = value;
if (typeof _j560 !== 'undefined') {
_j560.blendVol = value;
}
});
}
const _j1330 = document.getElementById('flow-last-stroke-only');
if (_j1330) {
_j1330.addEventListener('change', (e) => {
if (typeof _j561 !== 'undefined') {
_j561 = e.target.checked;
_j100('ui', '🌊 Flow Effect Last Stroke Only:', {
enabled: _j561
});
}
});
}
_j1327.forEach(btn => {
const blendType = parseInt(btn.dataset.type);
btn.addEventListener('mousedown', (e) => {
e.preventDefault();
_j150(btn, blendType);
});
btn.addEventListener('mouseup', (e) => {
e.preventDefault();
_j151(btn, blendType);
});
btn.addEventListener('mouseleave', (e) => {
if (_j1325 === btn) {
_j151(btn, blendType);
}
});
btn.addEventListener('touchstart', (e) => {
e.preventDefault();
_j150(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchend', (e) => {
e.preventDefault();
_j151(btn, blendType);
}, {
passive: false
});
btn.addEventListener('touchcancel', (e) => {
_j151(btn, blendType);
});
});
document.addEventListener('mouseup', () => {
if (_j1325) {
const blendType = parseInt(_j1325.dataset.type);
_j151(_j1325, blendType);
}
});
}
function _j150(btn, blendType) {
if (_j1325) return;
const bounds = typeof _j45 === 'function' ? _j45() : null;
if (!bounds) {
_j100('warning', '🌊 No stroke to apply Flow effect', {
Status: 'Draw a stroke first'
});
return;
}
_j1325 = btn;
btn.classList.add('active', 'running');
if (typeof flowEffectStrokeBounds !== 'undefined') {
flowEffectStrokeBounds = bounds;
}
if (typeof window !== 'undefined') {
window.flowEffectStrokeBounds = bounds;
}
const flowSeed = Math.floor(Math.random() * 1000000);
if (typeof _j46 === 'function') {
_j46(blendType, flowSeed);
}
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582) {
if (typeof _j585 !== 'undefined' && _j585 > 0 && typeof _j587 !== 'undefined') {
const _j767 = millis() - _j585;
if (_j767 > 0) {
_j587 += _j767;
_j585 = millis();
console.log('🎬 Flow recording: accumulated pause time updated', {
_j767,
total: _j587
});
}
}
const _j1331 = {
action: 'start',
blendType: blendType,
flowSeed: flowSeed,
strokeBounds: bounds,
strength: (typeof _j560 !== 'undefined') ? _j560.blendVol : 100,
lastStrokeOnly: (typeof _j561 !== 'undefined') ? _j561 : false
};
console.log('🎬 Recording flow start event:', _j1331);
_j168('flow', _j1331);
}
_j1326 = setInterval(() => {
const _j864 = document.getElementById('flow-iteration-count');
if (_j864 && typeof _j550 !== 'undefined') {
_j864.textContent = _j550;
}
}, 50);
_j100('ui', '🌊 Flow Effect Button Pressed', {
BlendType: blendType,
Seed: flowSeed
});
}
function _j151(btn, blendType) {
if (_j1325 !== btn) return;
btn.classList.remove('active', 'running');
_j1325 = null;
if (_j1326) {
clearInterval(_j1326);
_j1326 = null;
}
let _j1332 = null;
if (typeof _j47 === 'function') {
_j1332 = _j47();
}
if (typeof _j168 === 'function' && typeof _j582 !== 'undefined' && _j582 && _j1332) {
const _j1333 = {
action: 'end',
blendType: blendType,
flowSeed: (typeof _j552 !== 'undefined') ? _j552 : 0,
duration: _j1332.duration,
iterations: _j1332.iterations,
totalFrames: _j1332.frames
};
console.log('🎬 Recording flow end event:', _j1333);
_j168('flow', _j1333);
if (typeof _j585 !== 'undefined') {
_j585 = millis();
}
}
_j100('ui', '🌊 Flow Effect Button Released', {
BlendType: blendType,
Duration: _j1332 ? Math.round(_j1332.duration) + 'ms' : 'unknown',
Iterations: _j1332 ? _j1332.iterations : 'unknown',
Frames: _j1332 ? _j1332.frames : 'unknown'
});
}
let _j1334 = {
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
_pushFR: function(_j1451) {
if (this._frLen === 60) {
this._frSum -= this._frBuf[this._frIdx];
} else {
this._frLen++;
}
this._frBuf[this._frIdx] = _j1451;
this._frSum += _j1451;
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
const _j1335 = this._avgFR();
console.log('平均 frameRate:', _j1335.toFixed(2));
console.log('是否触发警告:', _j1335 < this.frameRateThreshold ? '是' : '否');
} else {
console.log('⚠️ 历史记录为空，可能需要等待几秒');
}
console.log('性能数据:', this.performanceData);
console.log('累积数据:', this.performanceDataAccumulated);
const _j1336 = this.logCooldown;
this.logCooldown = 0;
const _j1337 = this._frLen > 0 ?
this._avgFR() :
(() => {
try {
return frameRate();
} catch (e) {
return 60;
}
})();
console.log('强制触发检查，使用平均帧率:', _j1337.toFixed(2));
_j33(_j1337);
this.logCooldown = _j1336;
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
const _j1335 = this._avgFR();
console.log('平均帧率:', _j1335);
const _j1336 = this.logCooldown;
this.logCooldown = 0;
this.lastCheckFrame = this.frameCount - this.checkInterval - 1;
_j33(_j1335);
this.logCooldown = _j1336;
},
triggerNow: function() {
console.log('🎯 立即触发性能警告测试');
const _j1336 = this.logCooldown;
this.logCooldown = 0;
const _j1338 = this.frameRateThreshold - 10;
console.log('使用测试帧率:', _j1338);
_j33(_j1338);
this.logCooldown = _j1336;
}
};
window.testPerformanceMonitor = function() {
if (typeof _j1334 === 'undefined') {
console.error('❌ performanceMonitor 未定义！请刷新页面。');
return;
}
console.log('✅ performanceMonitor 已定义');
console.log('可用方法:', Object.keys(_j1334).filter(k => typeof _j1334[k] === 'function'));
_j33(50);
};
function _j152() {
_j474 = _j1('./shaders/base.vert', './shaders/encode.frag');
_j475 = _j1('./shaders/base.vert', './shaders/composite.frag');
_j477 = _j1('./shaders/base.vert', './shaders/typeMapEncode.frag');
}
function _j153() {
const _j449 = typeof canvasBackgroundColor !== 'undefined' ? canvasBackgroundColor : [255, 255, 255];
background(_j449[0], _j449[1], _j449[2]);
if (typeof _j568 !== 'undefined' && _j568) {
_j568.begin();
clear();
background(255);
_j568.end();
}
if (typeof _j571 !== 'undefined' && _j571) {
_j571.begin();
clear();
background(255);
_j571.end();
}
if (typeof _j569 !== 'undefined' && _j569) {
_j569.clear();
}
if (typeof _j570 !== 'undefined' && _j570) {
_j570.begin();
clear();
background(255);
_j570.end();
}
if (typeof _j573 !== 'undefined' && _j573) {
_j573.clear();
_j573.background(255);
}
if (typeof _j576 !== 'undefined' && _j576) {
_j576.begin();
clear();
_j576.end();
}
if (typeof _j581 !== 'undefined' && _j581) {
_j581.begin();
clear();
background(0);
_j581.end();
}
_j511 = false;
_j512 = false;
_j523 = 0;
force = 1.0;
_j513 = false;
_j514 = false;
_j505 = 0;
x = hw;
y = hh;
_j489 = 0;
_j490 = 0;
_j491 = 0;
initialSize = 0;
_j494 = 0;
_j525 = 0;
pathPoints = [];
_j529 = false;
if (typeof _j532 !== 'undefined') {
_j532 = [];
}
if (typeof currentStrokeHighlight !== 'undefined') {
currentStrokeHighlight = null;
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j528 !== 'undefined') {
_j528 = null;
}
if (typeof _j533 !== 'undefined') {
_j533 = 0;
}
if (typeof window.__lastGridParams !== 'undefined') {
window.__lastGridParams = null;
}
if (typeof _j357 !== 'undefined') {
_j357 = null;
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
_j159();
_j156();
_j522 = true;
}
function _j154() {
_j100('system', '🎬 Initializing playback environment', {
Status: 'Setting up shaders and buffers'
});
_j155();
_j156();
_j158();
_j157();
_j100('system', '✅ Playback environment ready', {
Status: 'All systems initialized'
});
}
function _j155() {
_j568.begin();
clear();
background(255);
_j568.end();
_j571.begin();
clear();
background(255);
_j571.end();
_j569.clear();
_j570.begin();
clear();
background(255);
_j570.end();
_j573.clear();
_j573.background(255);
_j575.begin();
clear();
background(255);
_j575.end();
if (typeof _j579 !== 'undefined' && _j579) {
_j579.begin();
clear();
_j579.end();
}
_j576.begin();
clear();
_j576.end();
if (typeof _j581 !== 'undefined' && _j581) {
_j581.begin();
clear();
background(0);
_j581.end();
}
_j569.blendMode(BLEND);
_j573.blendMode(BLEND);
_j522 = true;
}
function _j156() {
if (!_j575 || !_j472) return;
if (_j472) {
_j575.begin();
if (_j546) {
image(_j571, 0, 0, width, height);
resetShader();
_j575.end();
return;
}
shader(_j472);
_j472.setUniform("rect", [0, 0, width * _j469, height * _j469]);
_j472.setUniform("tex0", _j571);
_j472.setUniform("brushMode", (typeof brushMode !== 'undefined' ? brushMode : 1) * 1.0);
_j472.setUniform("forceMap", _j470);
_j472.setUniform("baseBrushSize", typeof baseBrushSize !== 'undefined' ? baseBrushSize : 1.0);
_j472.setUniform("force", 1.0);
_j472.setUniform("useSharpen", typeof useSharpen !== 'undefined' ? useSharpen : 0.0);
_j472.setUniform("effect3Brightness", typeof effect3Brightness !== 'undefined' ? effect3Brightness : 0.2);
_j472.setUniform("indiffusionStrength", typeof indiffusionStrength !== 'undefined' ? indiffusionStrength : 0.3);
_j472.setUniform("brushColorMode", (typeof brushColorMode !== 'undefined' ? brushColorMode : 0) * 1.0);
_j472.setUniform("brushCategory", (typeof brushColorMode !== 'undefined' && brushColorMode === 1) ? 1.0 : 0.0);
_j472.setUniform("mouseCount", 0.0);
rectMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j575.end();
}
}
function _j157() {
_j511 = false;
_j512 = false;
_j523 = 0;
force = 1.0;
_j513 = false;
_j514 = false;
_j505 = 0;
x = hw;
y = hh;
_j489 = 0;
_j490 = 0;
_j491 = 0;
initialSize = 0;
_j494 = 0;
_j492 = 0;
_j479 = 0;
_j524 = 0;
_j525 = 0;
pathPoints = [];
_j529 = false;
startX = hw;
startY = hh;
_j408 = hw;
_j409 = hh;
_j493 = 0;
_j502 = 0;
_j500 = hw;
_j501 = hh;
_j499 = [];
flyBrushEnd = [];
_j496 = 0;
_j594 = hw;
_j595 = hh;
_j596 = hw;
_j597 = hh;
_j598 = false;
_j600 = 0;
_j601 = false;
}
function _j158() {
_j470.begin();
shader(_j471);
_j471.setUniform("randomSeed1", _j562[0] || 100);
_j471.setUniform("randomSeed2", _j562[1] || 200);
_j471.setUniform("randomSeed3", _j562[2] || 300);
_j471.setUniform("randomSeed4", _j562[3] || 400);
_j471.setUniform("scale1", _j563[0] || 0.002);
_j471.setUniform("scale2", _j563[1] || 0.005);
_j471.setUniform("scale3", _j563[2] || 0.015);
_j471.setUniform("amplitude1", _j564[0] || 0.6);
_j471.setUniform("amplitude2", _j564[1] || 0.4);
_j471.setUniform("amplitude3", _j564[2] || 0.3);
_j471.setUniform("phase1", _j565[0] || 0);
_j471.setUniform("phase2", _j565[1] || 0);
_j471.setUniform("phase3", _j565[2] || 0);
_j471.setUniform("vortexScale1", _j566[0] || 0.008);
_j471.setUniform("vortexScale2", _j566[1] || 0.012);
_j471.setUniform("clusterScale1", _j567[0] || 0.001);
_j471.setUniform("clusterScale2", _j567[1] || 0.0008);
_j471.setUniform("canvasCenter", [hw, hh]);
_j471.setUniform("time", millis() * 0.001);
rectMode(CENTER);
imageMode(CENTER);
rect(0, 0, width, height);
resetShader();
_j470.end();
}
function _j159() {
for (let i = 0; i < 4; i++) {
_j562[i] = crandom.random(100 + i * 100, 200 + i * 100);
}
for (let i = 0; i < 3; i++) {
_j563[i] = crandom.random(0.001 + i * 0.002, 0.003 + i * 0.005);
_j564[i] = crandom.random(0.1 + i * 0.1, 0.4 + i * 0.2);
_j565[i] = crandom.random(0, TWO_PI);
}
for (let i = 0; i < 2; i++) {
_j566[i] = crandom.random(0.005 + i * 0.003, 0.015 + i * 0.003);
_j567[i] = crandom.random(0.0005 + i * 0.0003, 0.002 + i * 0.0005);
}
_j158();
}
function _j160(title = '') {}
function _j161() {
_j162();
}
function _j162() {
_j159();
const _j1339 = brushMode;
brushMode = 1;
initialSize = 20;
_j494 = initialSize;
_j488 = _j494;
_j492 = _j488;
_j511 = true;
_j512 = false;
_j523 = 0;
_j513 = true;
_j514 = false;
mousePressed();
for (let i = 0; i < 5; i++) {
_j28(_j571, 1.0);
}
mouseReleased();
_j512 = true;
_j523 = 0;
for (let i = 0; i < 10; i++) {
force = map(i, 0, 10, 1.0, 0.0);
_j28(_j571, force);
}
_j35();
brushMode = _j1339;
_j153();
}
function _j163() {
if (_j633) {
_j100('system', '⚠️ Frame recording already in progress', {
Status: 'Warning'
});
return;
}
_j633 = true;
_j634 = millis();
frameCount = 0;
_j635 = [];
_j160('🎬 Start Frame Recording');
}
function _j164() {
if (!_j633) {
_j100('system', '⚠️ No frame recording in progress', {
Status: 'Warning'
});
return;
}
_j633 = false;
const _j1340 = millis() - _j634;
_j160('🎬 Frame Recording Complete');
_j166();
}
function _j165() {
if (!_j633) return;
if (frameCount % _j636 !== 0) {
frameCount++;
return;
}
const _j1341 = String(frameCount + 1).padStart(5, '0');
const filename = `$seed_${_j1341}.png`;
saveCanvas(filename, 'png');
_j635.push({
frame: frameCount,
timestamp: millis() - _j634,
filename: filename
});
frameCount++;
if (frameCount % 30 === 0) {
_j100('recording', '📸 Frame captured', {
Frame: frameCount,
Total: _j635.length,
Progress: `${((frameCount / 1000) * 100).toFixed(1)}%`
});
}
}
function _j166() {
if (_j635.length === 0) {
_j100('system', '⚠️ No frame data to save', {
Status: 'Warning'
});
return;
}
_j100('art', '💾 Frame sequence saved', {
Format: 'PNG images',
Frames: `${_j635.length} frames`,
Method: 'Direct save with saveCanvas()',
Location: 'Downloads folder'
});
}
function _j167(_j1452) {
return Math.round(_j1452 * 100) / 100;
}
function _j168(type, data = {}) {
if (!_j582) return;
if (_j583 === 0) return;
const _j1342 = typeof recordingData.timeOffset !== 'undefined' ? recordingData.timeOffset : 0;
const _j1343 = _j1342 + (millis() - _j583 - _j587);
const event = {
m: type,
t: Math.round(_j1343),
...data
};
recordingData.events.push(event);
if (type !== 'md' && type !== 'mouseDragged') {
const _j1344 = {
'mp': '🖱️',
'mousePressed': '🖱️',
'mr': '✋',
'mouseReleased': '✋',
'kp': '⌨️',
'keyPressed': '⌨️',
'ec': '✨',
'effectControl': '✨'
};
const _j1345 = {
'mp': 'mousePressed',
'mr': 'mouseReleased',
'md': 'mouseDragged',
'kp': 'keyPressed',
'ec': 'Effect Control',
'effectControl': 'Effect Control'
};
_j100('recording', `${_j1344[type] || '📝'} Event recorded`, {
Type: _j1345[type] || type,
Time: `${_j1343.toFixed(0)}ms`,
Position: (type.includes('m') || type.includes('mouse')) ? `(${data.x?.toFixed(0)}, ${data.y?.toFixed(0)})` : data.key || '',
EffectControl: (type === 'ec' || type === 'effectControl') ? `${data.action || 'Unknown'}` : undefined
});
}
}
function _j169() {
_j582 = true;
_j583 = 0;
_j585 = 0;
_j587 = 0;
_j588 = true;
_j479 = 0;
const _j1346 = seed;
const _j1347 = (typeof _j142 === 'function') ? _j142() : 0;
const _j1348 = (typeof window.metallicStrength !== 'undefined') ?
Math.round(window.metallicStrength * 100) : 85;
const _j1349 = (typeof window.metallicFlowSpeed !== 'undefined') ?
Math.round(window.metallicFlowSpeed * 100) : 200;
const _j1350 = (typeof window.metallicTint !== 'undefined' && Array.isArray(window.metallicTint)) ?
[...window.metallicTint] : [0.72, 0.50, 0.35];
const tintButtons = {
'gold': [0.88, 0.72, 0.52],
'silver': [0.75, 0.75, 0.75],
'copper': [0.72, 0.50, 0.35],
'rose': [0.88, 0.65, 0.70],
'black': [0.15, 0.12, 0.08],
'diamond': [0.95, 0.95, 1.0]
};
let _j1351 = 'copper';
for (const [type, rgb] of Object.entries(tintButtons)) {
if (Math.abs(_j1350[0] - rgb[0]) < 0.01 &&
Math.abs(_j1350[1] - rgb[1]) < 0.01 &&
Math.abs(_j1350[2] - rgb[2]) < 0.01) {
_j1351 = type;
break;
}
}
recordingData = {
version: "1.0",
startTime: _j583,
randomSeed: _j1346,
initialPathToggle: _j521,
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
shapeType: _j1347,
metallicStrength: _j1348,
metallicFlow: _j1349,
metallicTint: _j1350,
metallicTintType: _j1351
}
};
randomSeed(_j1346);
noiseSeed(_j1346);
_j160('🎬 Start Art Creation Recording');
if (typeof _j104 === 'function') {
_j104();
}
}
function _j170() {
if (!_j582) return;
_j582 = false;
randomSeed(seed);
noiseSeed(seed);
_j160('✨ Art Creation Recording Complete');
const _j1352 = recordingData.events.length > 0 ?
(recordingData.events[recordingData.events.length - 1].t ?? recordingData.events[recordingData.events.length - 1].time ?? 0) :
0;
recordingData.initialFlowEffect = {
flowStrength: typeof _j560 !== 'undefined' ? _j560.blendVol : 100,
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
_j171();
setTimeout(() => {
_j108();
}, 300);
if (typeof _j104 === 'function') {
_j104();
}
}
function _j171() {
if (recordingData.events.length === 0) {
_j100('system', '⚠️ No recording data to save', {
Status: 'Warning'
});
return;
}
const _j1353 = {
...recordingData,
savedAt: new Date().toISOString(),
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255]
};
const _j1354 = JSON.stringify(_j1353, null, 2);
const _j1355 = new Blob([_j1354], {
type: 'application/json'
});
const _j1356 = URL.createObjectURL(_j1355);
const _j1357 = document.createElement('a');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
_j1357.download = `drawing-recording-${timestamp}.json`;
_j1357.href = _j1356;
_j1357.click();
URL.revokeObjectURL(_j1356);
_j100('art', '💾 Art recording saved', {
File: _j1357.download,
Size: `${(_j1354.length / 1024).toFixed(2)} KB`,
Events: `${recordingData.events.length} events`,
Strokes: `${recordingData.strokes.length} strokes`
});
if (typeof _j104 === 'function') {
_j104();
}
}
function _j172() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (event) => {
const _j1291 = event.target.files[0];
if (!_j1291) return;
const _j1135 = new FileReader();
_j1135.onload = (e) => {
try {
const loadedData = JSON.parse(e.target.result);
if (!loadedData.version || !loadedData.events) {
_j100('system', '❌ Invalid recording file format', {
Status: 'Error'
});
return;
}
if (typeof window !== 'undefined') {
window.loadedRecordingData = JSON.parse(JSON.stringify(loadedData));
window.loadedRecordingFileName = _j1291.name;
}
recordingData = loadedData;
if (typeof _j532 !== 'undefined') {
_j532 = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j528 !== 'undefined') {
_j528 = null;
}
if (typeof _j533 !== 'undefined') {
_j533 = 0;
}
if (typeof _j216 !== 'undefined') {
_j216 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
_j160('📂 Recording File Loaded Successfully');
if (recordingData.canvasSize && recordingData.canvasSize.width && recordingData.canvasSize.height) {
const _j1358 = _j178(recordingData.canvasSize.width, recordingData.canvasSize.height);
if (_j1358) {
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor)) {
sessionStorage.setItem('pendingCanvasBackgroundColor', JSON.stringify(recordingData.canvasBackgroundColor));
}
sessionStorage.setItem('pendingLoadedRecordingData', JSON.stringify(loadedData));
sessionStorage.setItem('pendingLoadedRecordingFileName', _j1291.name);
return;
}
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
if (typeof _j578 !== 'undefined' && _j578) {
_j578.begin();
background(recordingData.canvasBackgroundColor[0], recordingData.canvasBackgroundColor[1], recordingData.canvasBackgroundColor[2]);
_j578.end();
}
if (typeof _j29 === 'function') {
_j29();
}
if (typeof _j125 === 'function') {
_j125();
}
_j100('system', '🎨 Background color restored from recording', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
setTimeout(() => {
startPlayback();
}, 500);
} catch (error) {
_j100('system', '❌ Failed to load recording', {
Error: error.message,
Status: 'Error'
});
}
};
_j1135.readAsText(_j1291);
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
_j100('system', '⚠️ No recording data to play', {
Status: 'Error'
});
return;
}
if (_j590) {
_j100('system', '⚠️ Already playing', {
Status: 'Warning'
});
return;
}
if (typeof _j997 !== 'undefined') {
_j997 = [];
}
if (typeof _j998 !== 'undefined') {
_j998 = 0;
}
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof canvasBackgroundColor !== 'undefined') {
canvasBackgroundColor[0] = recordingData.canvasBackgroundColor[0];
canvasBackgroundColor[1] = recordingData.canvasBackgroundColor[1];
canvasBackgroundColor[2] = recordingData.canvasBackgroundColor[2];
}
}
const _j1359 = window.location.search || '';
const _j1360 = (key) => _j1359.includes('_' + key + ':') || _j1359.includes('?' + key + ':');
const _j1361 = [
{ jsonKey: 'showPaperTexture',       setter: (v) => { showPaperTexture = v; },       toggleId: 'paper-texture-toggle',       defaultVal: false },
{ jsonKey: 'showGridOverlay',        setter: (v) => { showGridOverlay = v; },        toggleId: 'grid-overlay-toggle',        defaultVal: true },
{ jsonKey: 'showFuturePathPreview',  setter: (v) => { showFuturePathPreview = v; },  toggleId: 'future-path-preview-toggle', defaultVal: false },
{ jsonKey: 'screenText',             setter: (v) => { screenText = v; },             toggleId: 'screen-text-toggle',         defaultVal: false },
{ jsonKey: 'doMoving',               setter: (v) => { doMoving = v; },               toggleId: 'camera-moving-toggle',       defaultVal: false },
{ jsonKey: 'loopToggle',             setter: (v) => { loopToggle = v; },             toggleId: 'loop-toggle',                defaultVal: 0, isNumeric: true }
];
const _j1362 = {
'showPaperTexture': 'paper', 'showGridOverlay': 'grid', 'showFuturePathPreview': 'path',
'screenText': 'console', 'doMoving': 'camera', 'loopToggle': 'loop'
};
const _j1363 = recordingData.initialPanelToggles;
for (const _j1364 of _j1361) {
const urlKey = _j1362[_j1364.jsonKey];
if (urlKey && _j1360(urlKey)) continue;
const value = _j1363 ? _j1363[_j1364.jsonKey] : undefined;
const _j1365 = value !== undefined ? value : _j1364.defaultVal;
_j1364.setter(_j1365);
const _j1366 = document.getElementById(_j1364.toggleId);
if (_j1366) {
_j1366.checked = _j1364.isNumeric ? (_j1365 === 1) : !!_j1365;
}
}
_j153();
if (recordingData.canvasBackgroundColor && Array.isArray(recordingData.canvasBackgroundColor) && recordingData.canvasBackgroundColor.length === 3) {
if (typeof _j578 !== 'undefined' && _j578) {
_j578.begin();
background(canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]);
_j578.end();
}
if (typeof _j29 === 'function') {
_j29();
}
if (typeof _j522 !== 'undefined') {
_j522 = true;
}
if (typeof _j125 === 'function') {
_j125();
}
_j100('playback', '🎨 Background color restored', {
RGB: `(${recordingData.canvasBackgroundColor[0]}, ${recordingData.canvasBackgroundColor[1]}, ${recordingData.canvasBackgroundColor[2]})`
});
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
_j100('playback', 'Random seed reset', {
Seed: recordingData.randomSeed
});
} else {
_j100('system', '⚠️ No seed info in recording, playback may be inaccurate', {
Status: 'Warning'
});
}
_j590 = true;
_j591 = millis();
if (window._fxContext) {
window._fxVirtualTime = 0;
}
_j592 = 0;
playbackLastStrokeEndTime = 0;
playbackLastStrokeEndEventTime = 0;
if (typeof _j533 !== 'undefined') {
_j533 = 0;
}
playbackStrokeIndex = 0;
playbackLastStrokeBrushMode = undefined;
if (typeof _j609 !== 'undefined') {
_j609 = 0;
}
_j598 = false;
_j594 = hw;
_j595 = hh;
_j596 = hw;
_j597 = hh;
_j525 = 0;
if (typeof _j632 !== 'undefined') {
_j632 = false;
}
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j528 !== 'undefined') {
_j528 = null;
}
if (typeof _j529 !== 'undefined') {
_j529 = false;
}
if (typeof _j532 !== 'undefined') {
_j532 = [];
}
if (typeof pendingBugBounds !== 'undefined') {
pendingBugBounds = null;
}
if (typeof _j216 !== 'undefined') {
_j216 = [];
}
if (typeof window !== 'undefined') {
window.bugsDataTextureCache = null;
window.bugsMaskTextureCache = null;
}
if (typeof _j627 !== 'undefined') {
_j627 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j628 !== 'undefined') {
_j628 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
_j479 = 0;
_j600 = 0;
_j601 = false;
if (recordingData.initialPathToggle !== undefined) {
_j521 = recordingData.initialPathToggle;
_j100('playback', 'Path toggle restored', {
Status: _j521 ? "ON ✅" : "OFF ❌"
});
}
if (recordingData.initialBrushColorMode !== undefined) {
brushColorMode = recordingData.initialBrushColorMode;
whiteBrushMode = (brushColorMode === 1);
const _j1147 = ['Black ⚫', 'White ⚪', 'Red 🔴'];
_j100('playback', 'Brush color restored', {
Mode: _j1147[brushColorMode] || 'Unknown'
});
} else if (recordingData.initialWhiteBrushMode !== undefined) {
whiteBrushMode = recordingData.initialWhiteBrushMode;
brushColorMode = whiteBrushMode ? 1 : 0;
_j100('playback', 'Brush color restored (legacy)', {
Mode: whiteBrushMode ? "White ⚪" : "Black ⚫"
});
} else {
whiteBrushMode = false;
brushColorMode = 0;
}
_j160('🎭 Start Art Reproduction');
if (typeof window !== 'undefined') {
window._scanGlobalPlaybackCount = 0;
window._scanCurrentPlaybackCount = 0;
}
if (recordingData.initialEffectControl) {
const ec = recordingData.initialEffectControl;
if (ec.shapeType !== undefined) {
if (typeof _j143 === 'function') {
_j143(ec.shapeType);
}
}
if (ec.metallicStrength !== undefined) {
if (typeof window !== 'undefined') {
window.metallicStrength = ec.metallicStrength / 100;
}
const _j1304 = document.getElementById('metallic-strength');
const _j1305 = document.getElementById('metallic-strength-value');
if (_j1304 && _j1305) {
_j1304.value = ec.metallicStrength;
_j1305.textContent = ec.metallicStrength;
}
}
if (ec.metallicFlow !== undefined) {
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = ec.metallicFlow / 100;
}
const _j1306 = document.getElementById('metallic-flow');
const _j1307 = document.getElementById('metallic-flow-value');
if (_j1306 && _j1307) {
_j1306.value = ec.metallicFlow;
_j1307.textContent = ec.metallicFlow;
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
const _j1367 = `metal-${ec.metallicTintType}`;
const btn = document.getElementById(_j1367);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
}
}
_j100('playback', '✨ Effect Control restored', {
ShapeType: ec.shapeType !== undefined ? ec.shapeType : 'Unknown',
Strength: ec.metallicStrength !== undefined ? ec.metallicStrength : 'Unknown',
Flow: ec.metallicFlow !== undefined ? ec.metallicFlow : 'Unknown',
Tint: ec.metallicTintType || 'Unknown'
});
}
const _j1368 = [
{ jsonKey: 'distortShaderEnabled', setter: (v) => { distortShaderEnabled = v; }, toggleId: 'distort-shader-toggle', urlKey: 'distort', slidersId: 'distort-sliders-section' },
{ jsonKey: 'cellularEnabled',      setter: (v) => { cellularEnabled = v; },      toggleId: 'cellular-toggle',       urlKey: 'cl',      slidersId: 'cellular-sliders-section' },
{ jsonKey: 'rsEnabled',            setter: (v) => { rsEnabled = v; },            toggleId: 'rs-toggle',             urlKey: 'rs',      slidersId: 'rs-sliders-section' },
{ jsonKey: 'whiteDotEnabled',      setter: (v) => { whiteDotEnabled = v; },      toggleId: 'white-dot-toggle',      urlKey: 'wd',      slidersId: 'white-dot-sliders-section' },
{ jsonKey: 'grainEnabled',         setter: (v) => { grainEnabled = v; },         toggleId: 'grain-toggle',          urlKey: 'gr',      slidersId: 'grain-sliders-section' }
];
const _j1369 = window.location.search || '';
const _j1370 = (key) => _j1369.includes('_' + key + ':') || _j1369.includes('?' + key + ':');
for (const _j1364 of _j1368) {
if (_j1370(_j1364.urlKey)) continue;
_j1364.setter(false);
const _j1366 = document.getElementById(_j1364.toggleId);
if (_j1366) {
_j1366.checked = false;
}
const _j1371 = document.getElementById(_j1364.slidersId);
if (_j1371) {
_j1371.style.display = 'none';
}
}
if (typeof distortShowFbmMask !== 'undefined') {
distortShowFbmMask = 0.0;
const _j1372 = document.getElementById('distort-fbm-preview-toggle');
if (_j1372) _j1372.checked = false;
}
if (recordingData.initialFlowEffect) {
const fe = recordingData.initialFlowEffect;
const _j1373 = {
isDistortShader: 'distortShaderEnabled',
isCellular: 'cellularEnabled',
isRS: 'rsEnabled',
isWhiteDot: 'whiteDotEnabled',
isGrain: 'grainEnabled'
};
for (const [oldKey, newKey] of Object.entries(_j1373)) {
if (fe[oldKey] !== undefined && fe[newKey] === undefined) {
fe[newKey] = fe[oldKey];
_j100('playback', `🔄 Legacy key ${oldKey} → ${newKey}`, {});
}
}
if (fe.flowStrength !== undefined && typeof _j560 !== 'undefined') {
_j560.blendVol = fe.flowStrength;
const _j1374 = document.getElementById('flow-strength');
const _j1375 = document.getElementById('flow-strength-value');
if (_j1374) _j1374.value = fe.flowStrength;
if (_j1375) _j1375.textContent = fe.flowStrength;
}
for (const _j1364 of _j1368) {
const value = fe[_j1364.jsonKey];
if (value === undefined) continue;
if (_j1370(_j1364.urlKey)) {
_j100('playback', `⏭️ Flow Effect: ${_j1364.jsonKey} skipped (URL override)`, {});
continue;
}
_j1364.setter(!!value);
const _j1366 = document.getElementById(_j1364.toggleId);
if (_j1366) {
_j1366.checked = !!value;
}
const _j1371 = document.getElementById(_j1364.slidersId);
if (_j1371) {
_j1371.style.display = value ? 'flex' : 'none';
}
}
if (fe.distortShowFbmMask !== undefined) {
distortShowFbmMask = fe.distortShowFbmMask;
const _j1372 = document.getElementById('distort-fbm-preview-toggle');
if (_j1372) _j1372.checked = fe.distortShowFbmMask > 0.5;
}
if (fe.distortDisplacementB !== undefined) {
distortDisplacementB = fe.distortDisplacementB;
const _j1376 = document.getElementById('distort-displacement-b');
const _j1377 = document.getElementById('distort-displacement-b-value');
if (_j1376) _j1376.value = fe.distortDisplacementB;
if (_j1377) _j1377.textContent = fe.distortDisplacementB;
}
if (fe.distortDisplacementC !== undefined) {
distortDisplacementC = fe.distortDisplacementC;
const _j1378 = document.getElementById('distort-displacement-c');
const _j1379 = document.getElementById('distort-displacement-c-value');
if (_j1378) _j1378.value = fe.distortDisplacementC;
if (_j1379) _j1379.textContent = fe.distortDisplacementC;
}
_j100('playback', '✨ Flow Effect restored', {
Strength: fe.flowStrength,
Distort: !!fe.distortShaderEnabled ? 'ON' : 'OFF',
Cellular: !!fe.cellularEnabled ? 'ON' : 'OFF',
RS: !!fe.rsEnabled ? 'ON' : 'OFF',
WhiteDot: !!fe.whiteDotEnabled ? 'ON' : 'OFF',
Grain: !!fe.grainEnabled ? 'ON' : 'OFF'
});
} else {
_j100('playback', '🔄 Flow Effect: reset to defaults (no initialFlowEffect in JSON)', {});
}
if (_j1363) {
_j100('playback', '✨ Panel toggles restored', {
Paper: _j1363.showPaperTexture ? 'ON' : 'OFF',
Grid: _j1363.showGridOverlay ? 'ON' : 'OFF',
Path: _j1363.showFuturePathPreview ? 'ON' : 'OFF',
Console: _j1363.screenText ? 'ON' : 'OFF',
Camera: _j1363.doMoving ? 'ON' : 'OFF',
Loop: _j1363.loopToggle === 1 ? 'ON' : 'OFF'
});
} else {
_j100('playback', '🔄 Panel toggles: reset to defaults (no initialPanelToggles in JSON)', {});
}
_j159();
_j156();
const _j1380 = recordingData.events[0];
if (_j1380 && _j1380.strokeData) {
const strokeData = _j1380.strokeData;
_j494 = strokeData.initialSize || 20;
initialSize = strokeData.initialSize || 20;
size = _j494;
nowSize = size;
}
_j28(_j571, 1.0);
if (typeof doMoving !== 'undefined' && doMoving) {
if (typeof _j605 === 'undefined' || !_j605) {
_j605 = true;
}
_j606 = true;
if (_j605 && _j604 !== null) {
easycamInitialCenter = [0, 0, 0];
const _j391 = Math.PI / 3;
easycamInitialDistance = height / (2 * Math.tan(_j391 / 2));
_j604.setAutoUpdate(true);
if (typeof _j604.setPanScale === 'function') {
_j604.setPanScale(0);
}
if (typeof _j604.setZoomScale === 'function') {
_j604.setZoomScale(0);
}
_j604.setCenter([0, 0, 0], 0);
_j604.setDistance(easycamInitialDistance, 0);
if (typeof _j611 !== 'undefined') {
_j611 = 1;
}
_j100('system', '🎥 EasyCam ready', {
Status: 'Auto-tracking enabled',
Controls: 'Camera automatically follows grid center'
});
}
} else {
_j606 = false;
_j605 = false;
}
if (typeof _j104 === 'function') {
_j104();
}
}
function _j173() {
if (!_j590) return;
_j590 = false;
_j598 = false;
_j592 = 0;
isWaitingToLoop = false;
_j600 = 0;
_j601 = false;
randomSeed(seed);
noiseSeed(seed);
_j160('⏹️ Playback Ended');
_j176();
_j606 = false;
if (_j605 && _j604 !== null) {
try {
const _j390 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j393 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
const _j394 = _j604.getCenter();
const _j395 = _j604.getDistance();
_j100('system', '📊 Playback complete - Camera position logged', {
Current: `Center: [${_j394[0].toFixed(2)}, ${_j394[1].toFixed(2)}, ${_j394[2].toFixed(2)}], Distance: ${_j395.toFixed(2)}`,
Target: `Center: [${_j390[0].toFixed(2)}, ${_j390[1].toFixed(2)}, ${_j390[2].toFixed(2)}], Distance: ${_j393.toFixed(2)}`
});
_j617 = true;
_j618 = millis();
_j615 = [_j394[0], _j394[1], _j394[2]];
_j619 = _j395;
_j616 = _j390;
_j620 = _j393;
setTimeout(() => {
if (_j604 !== null) {
_j604.setAutoUpdate(false);
const _j402 = _j604.getCenter();
const _j403 = _j604.getDistance();
const _j396 = 0.1;
const _j397 = 1.0;
const centerDiff = Math.sqrt(
Math.pow(_j402[0] - _j390[0], 2) +
Math.pow(_j402[1] - _j390[1], 2) +
Math.pow(_j402[2] - _j390[2], 2)
);
const distanceDiff = Math.abs(_j403 - _j393);
_j100('system', '📊 After 2s animation - Camera position logged', {
Final: `Center: [${_j402[0].toFixed(2)}, ${_j402[1].toFixed(2)}, ${_j402[2].toFixed(2)}], Distance: ${_j403.toFixed(2)}`,
Target: `Center: [${_j390[0].toFixed(2)}, ${_j390[1].toFixed(2)}, ${_j390[2].toFixed(2)}], Distance: ${_j393.toFixed(2)}`,
Diff: `Center: ${centerDiff.toFixed(3)}, Distance: ${distanceDiff.toFixed(3)}`,
Status: (centerDiff <= _j396 && distanceDiff <= _j397) ? '✅ At target' : '❌ Not at target'
});
if (centerDiff > _j396 || distanceDiff > _j397) {
console.warn('⚠️ Camera not at initial position after 2s, forcing reset:', {
centerDiff: centerDiff.toFixed(3),
distanceDiff: distanceDiff.toFixed(3),
beforeReset: {
center: `[${_j402[0].toFixed(3)}, ${_j402[1].toFixed(3)}, ${_j402[2].toFixed(3)}]`,
distance: _j403.toFixed(3)
}
});
_j604.setCenter(_j390, 0);
_j604.setDistance(_j393, 0);
const _j1381 = _j604.getCenter();
const _j1382 = _j604.getDistance();
_j100('system', '📊 After force reset - Camera position logged', {
Center: `[${_j1381[0].toFixed(2)}, ${_j1381[1].toFixed(2)}, ${_j1381[2].toFixed(2)}]`,
Distance: _j1382.toFixed(2)
});
}
_j617 = false;
}
_j605 = false;
}, 2100);
_j100('system', '🎥 EasyCam disabled', {
Status: 'Playback stopped, camera reset and disabled',
Center: _j390,
Distance: _j393.toFixed(2)
});
} catch (error) {
console.warn('⚠️ EasyCam cleanup error:', error);
_j605 = false;
}
} else {
_j605 = false;
}
if (typeof _j104 === 'function') {
_j104();
}
}
window.startPlayback = startPlayback;
function _j174(event) {
const _j813 = event.m || event.type;
switch (_j813) {
case 'mp':
case 'mousePressed':
crandom.reset();
crandomDebugger.resetStroke();
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.checkpoint('播放_mousePressed_開始', 'mousePressed');
const _j1383 = _j512;
const _j1384 = event.t !== undefined ? event.t : event.time;
if (_j512) {
const _j725 = _j591;
if (window._fxVirtualTime === undefined) {
_j591 = millis() - _j1384 / _j593;
}
const _j1385 = _j725 - _j591;
const _j724 = (typeof _j600 !== 'undefined' && _j600 > 0) ?
(millis() - _j600) :
0;
if (typeof _j601 !== 'undefined') {
_j601 = false;
}
if (typeof _j600 !== 'undefined') {
_j600 = 0;
}
_j35();
_j512 = false;
_j523 = 0;
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined' && playbackLastStrokeEndEventTime > 0) {
const _j1386 = _j1384 - playbackLastStrokeEndEventTime;
const _j1387 = event.strokeData ? event.strokeData.brushMode : brushMode;
const _j1388 = typeof playbackLastStrokeBrushMode !== 'undefined' ? playbackLastStrokeBrushMode : 'unknown';
}
_j36();
if (typeof _j997 !== 'undefined') {
_j997 = [];
}
if (typeof _j998 !== 'undefined') {
_j998 = 0;
}
if (typeof _j609 !== 'undefined') {
_j609++;
if (typeof _j612 !== 'undefined' && typeof _j610 !== 'undefined') {
_j612 = random(0, 1) > 0.7;
_j610 = _j609;
}
}
_j594 = event.x + (typeof _j602 !== 'undefined' ? _j602 : 0);
_j595 = event.y + (typeof _j603 !== 'undefined' ? _j603 : 0);
_j596 = _j594;
_j597 = _j595;
if (false) {
_j598 = true;
} else {
_j598 = false;
}
if (typeof _j632 !== 'undefined') {
_j632 = true;
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
_j526 = sd.mouseCountStart;
} else {
_j526 = 0;
}
_j524 = 0;
const offsetX = typeof _j602 !== 'undefined' ? _j602 : 0;
const offsetY = typeof _j603 !== 'undefined' ? _j603 : 0;
const _j1389 = event.x + offsetX;
const _j1390 = event.y + offsetY;
_j100('playback', 'Reproducing', {
Seed: sd.strokeSeed,
Mode: `Brush mode ${sd.brushMode}`,
Color: whiteBrushMode ? "White ⚪" : "Black ⚫",
Position: `(${_j1389.toFixed(0)}, ${_j1390.toFixed(0)})`
});
_j100('system', '|--------------------------------', {});
} else {
_j100('system', '⚠️ Warning: No strokeSeed found!', {
Status: 'Error'
});
_j524 = 0;
}
_j479 = 0;
_j505 = 0;
x = _j594;
y = _j595;
_j489 = 0;
_j490 = 0;
_j491 = 0;
_j502 = 0;
_j496 = 0;
_j525 = 0;
_j523 = 0;
_j512 = false;
if (sd.brushModeSP !== undefined) {
brushModeSP = sd.brushModeSP;
}
if (typeof _j997 !== 'undefined') {
_j997 = [];
}
if (typeof _j503 !== 'undefined') {
_j503 = _j594;
_j504 = _j595;
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
_j484 = sd.step;
_j531 = sd.step2;
randStep = sd.randStep;
maxUpdates = sd.maxUpdates;
pathRotation = sd.pathRotation;
_j486 = sd.spring !== undefined ? sd.spring : 0.6;
_j487 = sd.friction !== undefined ? sd.friction : 0.5;
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
_j480 = sd.whiteMaxOpacity;
} else {
_j480 = 0.95;
}
if (sd.hueShift !== undefined) {
_j481 = sd.hueShift;
} else {
_j481 = 0.0;
}
if (sd.satShift !== undefined) {
_j482 = sd.satShift;
} else {
_j482 = 0.0;
}
if (sd.briShift !== undefined) {
_j483 = sd.briShift;
} else {
_j483 = 0.0;
}
if (sd.keyBlendMode !== undefined) {
keyBlendMode = sd.keyBlendMode;
} else {
keyBlendMode = 0;
}
if (brushMode === 4) {}
if (brushColorMode > 1) {} else if (brushColorMode === 1) {}
if (sd.forceMapParams) {
const fm = sd.forceMapParams;
_j562[0] = fm.randomSeed1;
_j562[1] = fm.randomSeed2;
_j562[2] = fm.randomSeed3;
_j562[3] = fm.randomSeed4;
_j563[0] = fm.scale1;
_j563[1] = fm.scale2;
_j563[2] = fm.scale3;
_j564[0] = fm.amplitude1;
_j564[1] = fm.amplitude2;
_j564[2] = fm.amplitude3;
_j565[0] = fm.phase1;
_j565[1] = fm.phase2;
_j565[2] = fm.phase3;
_j566[0] = fm.vortexScale1;
_j566[1] = fm.vortexScale2;
_j567[0] = fm.clusterScale1;
_j567[1] = fm.clusterScale2;
_j158();
} else {
if (typeof _j159 === 'function') {
_j159();
}
}
if (sd.drawingSeed) {
drawingSeed = sd.drawingSeed;
randomSeed(sd.drawingSeed);
noiseSeed(sd.drawingSeed);
} else {}
}
_j494 = initialSize;
_j488 = _j494;
_j492 = _j488;
_j505 = 0;
x = _j594;
y = _j595;
_j489 = 0;
_j490 = 0;
_j491 = 0;
_j502 = 0;
_j496 = 0;
_j511 = true;
_j512 = false;
_j523 = 0;
_j513 = true;
_j514 = false;
_j525 = 0;
startX = _j594;
startY = _j595;
pathPoints = [{
x: _j594,
y: _j595
}];
_j529 = true;
_j598 = true;
if (_j515) window._playbackPenPressure = -1;
_j28(_j571, 1.0);
crandomDebugger.checkpoint('播放_mousePressed_結束', 'mousePressed');
break;
case 'md':
case 'mouseDragged':
if (typeof window.playbackMouseDraggedCount !== 'undefined') {
window.playbackMouseDraggedCount++;
}
_j594 = event.x + (typeof _j602 !== 'undefined' ? _j602 : 0);
_j595 = event.y + (typeof _j603 !== 'undefined' ? _j603 : 0);
if (_j515 && event.p !== undefined) {
window._playbackPenPressure = event.p;
}
break;
case 'mr':
case 'mouseReleased':
if (_j515) window._playbackPenPressure = -1;
const _j770 = crandom.getCount();
const _j1391 = event.t !== undefined ? event.t : event.time;
if (typeof playbackLastStrokeEndTime !== 'undefined') {
playbackLastStrokeEndTime = millis();
}
if (typeof playbackLastStrokeEndEventTime !== 'undefined') {
playbackLastStrokeEndEventTime = _j1391;
}
if (typeof playbackStrokeIndex !== 'undefined') {
playbackStrokeIndex++;
}
crandomDebugger.checkpoint('播放_mouseReleased', 'mouseReleased');
const _j1392 = crandom.getCount();
const _j775 = _j1392 - _j770;
const _j1393 = typeof playbackStrokeIndex !== 'undefined' ? playbackStrokeIndex : '?';
const _j804 = recordingData && recordingData.events ?
recordingData.events.filter(e => {
const _j813 = e.m || e.type;
return _j813 === 'mr' || _j813 === 'mouseReleased';
}).length :
'?';
const _j776 = window.drawLoopCount || 0;
const _j1394 = window.playbackMouseDraggedCount || 0;
console.log(`🎬 播放 [第 ${_j1393}/${_j804} 筆] | Draw: ${_j776} | Seed: ${_j1392}`);
window.drawLoopCount = 0;
window.playbackMouseDraggedCount = 0;
window.playbackMultiEventFrames = 0;
window.playbackDelayedReleaseCount = 0;
crandomDebugger.saveStroke('playback', _j1393);
crandomDebugger.compareStroke(_j1393);
_j594 = event.x + (typeof _j602 !== 'undefined' ? _j602 : 0);
_j595 = event.y + (typeof _j603 !== 'undefined' ? _j603 : 0);
_j598 = false;
if (!_j512) {
_j512 = true;
_j523 = 0;
if (typeof _j600 !== 'undefined') {
_j600 = millis();
}
if (typeof _j601 !== 'undefined') {
_j601 = true;
}
_j100('playback', 'Starting countdown', {
MaxUpdates: maxUpdates
});
}
_j100('playback', 'Stroke reproduction complete', {
FinalSize: _j494.toFixed(2),
CountdownStatus: _j512 ? 'In progress' : 'Not started'
});
break;
case 'md':
case 'mouseDragged':
if (!_j598) {
_j598 = true;
} else {
_j596 = _j594;
_j597 = _j595;
}
_j594 = event.x + (typeof _j602 !== 'undefined' ? _j602 : 0);
_j595 = event.y + (typeof _j603 !== 'undefined' ? _j603 : 0);
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
_j141();
_j100('playback', '⌨️ Simulate key: R', {
'Effect': 'Wet Ink'
});
} else if (k === 'p' || k === 'P') {} else if (k === 'o' || k === 'O') {
_j100('playback', '⌨️ Simulate key: O', {
'Loop toggle': 'Ignored during playback'
});
}
break;
case 'ec':
case 'effectControl':
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
const _j1395 = action === 'scan-global' ? 'GLOBAL' : 'EACH';
const _j1396 = event.shapeType !== undefined ? event.shapeType : null;
const scanSeed = event.scanSeed !== undefined ? event.scanSeed : null;
const _j1314 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1314;
const _j761 = document.getElementById('bugs-size');
const _j762 = document.getElementById('bugs-size-value');
if (_j761 && _j762) {
_j761.value = _j1314;
_j762.textContent = _j1314;
}
}
const _j760 = {
action: action,
shapeType: _j1396,
bugsSize: _j1314,
scanBounds: (action === 'scan-current' && event.scanBounds) ? {
...event.scanBounds
} : null,
scanSeed: scanSeed,
recordedRandomCount: event.randomCount !== undefined ? event.randomCount : null,
targetPoints: event.targetPoints || null,
eventTime: event.t
};
let _j1397 = null;
let _j1398 = null;
if (typeof window !== 'undefined') {
if (!window.pendingEffectControlScanQueue) {
window.pendingEffectControlScanQueue = [];
}
window.pendingEffectControlScanQueue.push(_j760);
window.lastEffectControlProcessTime = millis();
if (action === 'scan-global') {
window._scanGlobalPlaybackCount = (window._scanGlobalPlaybackCount || 0) + 1;
} else if (action === 'scan-current') {
window._scanCurrentPlaybackCount = (window._scanCurrentPlaybackCount || 0) + 1;
}
_j1397 = window._scanGlobalPlaybackCount || 0;
_j1398 = window._scanCurrentPlaybackCount || 0;
} else {
if (typeof window !== 'undefined') {
window.bugsSize = _j1314;
}
const _j763 = seed;
if (scanSeed) {
randomSeed(scanSeed);
noiseSeed(scanSeed);
}
if (typeof _j18 === 'function') {
if (action === 'scan-global') {
_j18(null, null, _j1396);
} else if (action === 'scan-current') {
const scanBounds = event.scanBounds || null;
_j18(null, scanBounds, _j1396);
}
}
if (_j763) {
randomSeed(_j763);
noiseSeed(_j763);
}
}
_j100('playback', '✨ Effect Control: Scan (queued)', {
Mode: _j1395,
ShapeType: _j1396 !== null ? _j1396 : 'Unknown',
BugsSize: _j1314,
Action: action,
Status: (typeof window !== 'undefined' && window.pendingEffectControlScanQueue) ? `Queued (${window.pendingEffectControlScanQueue.length} in queue)` : 'Immediate',
GlobalCount: _j1397,
CurrentCount: _j1398
});
} else if (action === 'scan-random') {
const _j1396 = event.shapeType !== undefined ? event.shapeType : null;
const _j1314 = event.bugsSize !== undefined ? event.bugsSize : 10.0;
if (typeof window !== 'undefined') {
window.bugsSize = _j1314;
const _j761 = document.getElementById('bugs-size');
const _j762 = document.getElementById('bugs-size-value');
if (_j761 && _j762) {
_j761.value = _j1314;
_j762.textContent = _j1314;
}
}
if (typeof _j19 === 'function') {
_j19(10, _j1396);
}
_j100('playback', '✨ Effect Control: Scan RANDOM', {
ShapeType: _j1396 !== null ? _j1396 : 'Unknown',
BugsSize: _j1314
});
} else if (action === 'metallic-strength') {
const _j1305 = event.value !== undefined ? event.value : 85;
if (typeof window !== 'undefined') {
window.metallicStrength = _j1305 / 100;
}
const _j1304 = document.getElementById('metallic-strength');
const _j1399 = document.getElementById('metallic-strength-value');
if (_j1304 && _j1399) {
_j1304.value = _j1305;
_j1399.textContent = _j1305;
}
_j100('playback', '✨ Effect Control: Metallic Strength', {
Value: _j1305
});
} else if (action === 'bugs-size') {
const _j1314 = event.value !== undefined ? event.value : 10;
const _j761 = document.getElementById('bugs-size');
const _j762 = document.getElementById('bugs-size-value');
if (_j761 && _j762) {
_j761.value = _j1314;
window.bugsSize = _j1314;
_j762.textContent = _j1314;
_j100('system', '🐛 Bugs Size updated during playback', {
Value: _j1314
});
}
} else if (action === 'metallic-flow') {
const _j1307 = event.value !== undefined ? event.value : 200;
if (typeof window !== 'undefined') {
window.metallicFlowSpeed = _j1307 / 100;
}
const _j1306 = document.getElementById('metallic-flow');
const _j1400 = document.getElementById('metallic-flow-value');
if (_j1306 && _j1400) {
_j1306.value = _j1307;
_j1400.textContent = _j1307;
}
_j100('playback', '✨ Effect Control: Metallic Flow', {
Value: _j1307
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
const _j1367 = `metal-${tintType}`;
const btn = document.getElementById(_j1367);
if (btn) {
document.querySelectorAll('.metal-tint-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
}
_j100('playback', '✨ Effect Control: Metal Tint', {
Tint: tintType,
RGB: `[${tintButtons[tintType].join(', ')}]`,
Applied: true
});
} else {
_j100('playback', '⚠️ Effect Control: Metal Tint (Unknown)', {
Tint: tintType,
Status: 'Unknown tint type, skipped'
});
}
}
break;
case 'flow':
if (event.action === 'start') {
if (typeof _j547 !== 'undefined' && _j547) {
if (typeof _j47 === 'function') {
_j47();
}
_j100('playback', '🌊 Flow Effect: 強制完成前一個效果');
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
if (event.strength !== undefined && typeof _j560 !== 'undefined') {
_j560.blendVol = event.strength;
}
if (typeof _j561 !== 'undefined') {
_j561 = event.lastStrokeOnly || false;
}
if (typeof _j46 === 'function') {
_j46(event.blendType, event.flowSeed, true);
}
_j100('playback', '🌊 Flow Effect: Start (預覽開始)', {
BlendType: event.blendType,
Seed: event.flowSeed,
Bounds: event.strokeBounds ? `[${event.strokeBounds.minX.toFixed(2)}, ${event.strokeBounds.minY.toFixed(2)}, ${event.strokeBounds.maxX.toFixed(2)}, ${event.strokeBounds.maxY.toFixed(2)}]` : 'None'
});
} else if (event.action === 'end') {
const _j1401 = window.pendingFlowEvent;
if (_j1401) {
if (typeof _j556 !== 'undefined') {
_j556 = event.totalFrames || (event.iterations * 3) || 30;
_j557 = event.iterations || 10;
}
_j100('playback', '🌊 Flow Effect: End (設定目標，等待預覽完成)', {
BlendType: _j1401.blendType,
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
if (!_j590) return;
const _j1402 = 200;
if (typeof window !== 'undefined') {
const _j1403 = window.pendingEffectControlScanQueue && window.pendingEffectControlScanQueue.length > 0;
if (window.lastEffectControlProcessTime) {
const _j1404 = millis() - window.lastEffectControlProcessTime;
if (_j1404 < _j1402) {
return;
} else {
window.lastEffectControlProcessTime = null;
}
}
if (_j1403 && !window.lastEffectControlProcessTime) {}
}
if (isWaitingToLoop) {
const _j1405 = millis() - _j599;
const _j1406 = Math.floor(_j1405 / 1000);
if (!window._lastLoggedWaitSecond || window._lastLoggedWaitSecond !== _j1406) {}
if (_j1405 >= loopWaitDuration) {
if (window.DEBUG_MODE) console.log('✅ 倒数完成，准备重新播放');
window._lastLoggedWaitSecond = null;
if (loopToggle === 1) {
_j100('playback', 'Loop playback', {
Status: 'Restarting'
});
if (_j605 && _j604 !== null) {
const _j390 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ?
easycamInitialCenter :
[0, 0, 0];
const _j393 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ?
easycamInitialDistance :
Math.max(width, height) * 1.0;
_j604.setCenter(_j390, 0);
_j604.setDistance(_j393, 0);
_j617 = false;
_j100('system', '🎥 Camera reset for loop', {
Center: `[${_j390[0].toFixed(2)}, ${_j390[1].toFixed(2)}, ${_j390[2].toFixed(2)}]`,
Distance: _j393.toFixed(2)
});
}
_j153();
if (typeof _j997 !== 'undefined') {
_j997 = [];
}
if (typeof _j998 !== 'undefined') {
_j998 = 0;
}
if (recordingData.randomSeed) {
randomSeed(recordingData.randomSeed);
noiseSeed(recordingData.randomSeed);
if (typeof boidsSeed !== 'undefined') {
boidsSeed = floor(crandom.random(1, 10000));
}
}
_j591 = millis();
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime = 0;
}
_j592 = 0;
_j598 = false;
_j594 = hw;
_j595 = hh;
_j596 = hw;
_j597 = hh;
isWaitingToLoop = false;
_j525 = 0;
_j479 = 0;
_j600 = 0;
_j601 = false;
if (typeof pathPoints !== 'undefined') {
pathPoints = [];
}
if (typeof _j528 !== 'undefined') {
_j528 = null;
}
if (typeof _j529 !== 'undefined') {
_j529 = false;
}
if (typeof _j627 !== 'undefined') {
_j627 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j628 !== 'undefined') {
_j628 = {
0: 0,
40: 0,
80: 0,
120: 0
};
}
if (typeof _j533 !== 'undefined') {
_j533 = 0;
}
if (window._initialConsoleFromURL === true && typeof window.screenText !== 'undefined') {
window.screenText = true;
const screenTextToggle = typeof document !== 'undefined' && document.getElementById ? document.getElementById('screen-text-toggle') : null;
if (screenTextToggle) {
screenTextToggle.checked = true;
}
}
window.showStrokeDivider = true;
_j100('playback', '🔁 Loop restart', {
Status: 'New round playback'
});
} else {
_j100('playback', '⏹️ Playback ended', {
Status: 'Single playback complete, no more loops'
});
_j173();
}
}
return;
}
if (_j592 >= recordingData.events.length && !isWaitingToLoop) {
if (_j598) {
_j598 = false;
if (!_j512) {
_j512 = true;
_j523 = 0;
_j522 = true;
}
}
if (_j512) {
if (_j523 < maxUpdates) {
return;
}
}
if (_j511) {
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
window._fxDebug.eventsProcessed = _j592;
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
function _j175() {
console.log('[fxhash] Forcing final composite + capture...');
_j522 = true;
setTimeout(function() {
window._fxCapturePhase = 1;
console.log('[fxhash] _fxCapturePhase=1 set, waiting for next draw frame | context:', window._fxContext || 'unknown');
}, 500);
}
if (_j605 && _j604 !== null) {
_j617 = true;
_j618 = millis();
_j615 = [_j604.getCenter()[0], _j604.getCenter()[1], _j604.getCenter()[2]];
_j619 = _j604.getDistance();
_j616 = (typeof easycamInitialCenter !== 'undefined' && easycamInitialCenter) ? easycamInitialCenter : [0, 0, 0];
_j620 = (typeof easycamInitialDistance !== 'undefined' && easycamInitialDistance > 0) ? easycamInitialDistance : Math.max(width, height) * 1.0;
var _j1407 = _j621 + 500;
console.log('[fxhash] Waiting ' + _j1407 + 'ms for camera reset before capture...');
setTimeout(_j175, _j1407);
} else {
_j175();
}
}
_j100('playback', 'Playback complete', {
Status: 'Waiting 30 seconds before loop'
});
if (window.DEBUG_MODE) console.log('✅ 开始倒数计时:', {
loopWaitDuration: loopWaitDuration,
startTime: millis()
});
isWaitingToLoop = true;
_j599 = millis();
} else {
_j100('playback', 'Playback complete', {
Status: 'Single playback complete, stopping immediately'
});
if (window.DEBUG_MODE) console.log('❌ loopToggle 不等于 1，停止播放');
_j173();
}
return;
}
var _j730;
if (window._fxVirtualTime !== undefined) {
window._fxVirtualTime += 16.67;
_j730 = window._fxVirtualTime * _j593;
} else {
_j730 = (millis() - _j591) * _j593;
}
let _j1408 = 0;
const _j1409 = 100;
let _j1410 = 0;
const _j1411 = 1;
if (typeof window.playbackMultiEventFrames === 'undefined') {
window.playbackMultiEventFrames = 0;
}
let _j1412 = false;
while (_j592 < recordingData.events.length && _j1408 < _j1409) {
if (typeof _j547 !== 'undefined' && _j547 &&
typeof _j556 !== 'undefined' && _j556 > 0) {
break;
}
const event = recordingData.events[_j592];
const eventTime = event.t !== undefined ? event.t : event.time;
const _j813 = event.m || event.type;
const _j1413 = _j813 === 'mp' || _j813 === 'mousePressed';
const _j1414 = _j813 === 'mr' || _j813 === 'mouseReleased';
const _j1415 = _j813 === 'ec' || _j813 === 'effectControl';
const _j1416 = _j813 === 'flow';
const _j731 = eventTime - _j730;
if (!_j1415 && !_j1416 && eventTime > _j730 && _j592 + 1 < recordingData.events.length) {
const _j726 = recordingData.events[_j592 + 1];
const _j727 = _j726.m || _j726.type;
const _j728 = _j727 === 'mp' || _j727 === 'mousePressed';
if (_j728) {
if (_j1414) {
if (_j1412) {
break;
}
_j174(event);
_j592++;
_j1408++;
continue;
} else {
_j592++;
continue;
}
}
}
if (eventTime <= _j730) {
const _j1417 = _j813 === 'md' || _j813 === 'mouseDragged';
if (_j1417 && _j1410 >= _j1411) {
break;
}
if (_j1414 && _j1412) {
if (typeof window.playbackDelayedReleaseCount === 'undefined') {
window.playbackDelayedReleaseCount = 0;
}
window.playbackDelayedReleaseCount++;
break;
}
if (_j1415 || !_j512 || (_j512 && _j598)) {
if (_j1415) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j174(event);
_j592++;
_j1408++;
if (_j1417) {
_j1410++;
_j1412 = true;
}
} else {
break;
}
} else {
const _j1417 = _j813 === 'md' || _j813 === 'mouseDragged';
if (_j1417 && _j1410 >= _j1411) {
break;
}
if (_j1414 && _j1412) {
break;
}
if (_j1415 || _j1416 || (_j1413 && !_j512) || _j731 < 100) {
if (_j1415) {
const action = event.action;
if (action === 'scan-global' || action === 'scan-current') {
if (typeof window !== 'undefined') {
window.lastEffectControlProcessTime = millis();
}
}
}
_j174(event);
_j592++;
_j1408++;
if (_j1417) {
_j1410++;
_j1412 = true;
}
} else {
break;
}
}
if (_j1410 > 1) {
window.playbackMultiEventFrames++;
}
}
}
function _j176() {
if (typeof loopToggle !== 'undefined' && loopToggle === 1) {
return;
}
const _j1418 = (typeof window !== 'undefined' && window.skipContinueRecordingDialog) ||
sessionStorage.getItem('pendingSkipContinueDialog') === '1';
if (_j1418) {
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
const _j1419 = (typeof window !== 'undefined' && window.loadedRecordingFileName) ?
window.loadedRecordingFileName :
(sessionStorage.getItem('pendingLoadedRecordingFileName') || 'Unknown');
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
return;
}
setTimeout(() => {
const _j1420 = confirm(
`播放完成！\n\n` +
`已播放：${loadedData.events.length} 个事件\n` +
`文件：${_j1419}\n\n` +
`是否要继续录制（追加新内容）？\n\n` +
`点击"确定"继续录制\n` +
`点击"取消"结束`
);
if (_j1420) {
_j177(loadedData, _j1419);
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
function _j177(loadedData, originalFileName = '') {
if (!loadedData || !loadedData.events || loadedData.events.length === 0) {
_j100('system', '⚠️ No events in loaded recording, starting fresh recording', {
Status: 'Warning'
});
_j169();
return;
}
const _j1421 = loadedData.events[loadedData.events.length - 1];
const _j1352 = _j1421.t !== undefined ? _j1421.t : (_j1421.time !== undefined ? _j1421.time : 0);
_j582 = true;
_j583 = millis();
_j585 = 0;
_j587 = 0;
_j588 = true;
_j479 = 0;
recordingData = {
...loadedData,
events: [...loadedData.events],
strokes: loadedData.strokes ? [...loadedData.strokes] : [],
timeOffset: _j1352,
canvasSize: {
width: width,
height: height
},
canvasBackgroundColor: typeof canvasBackgroundColor !== 'undefined' ? [canvasBackgroundColor[0], canvasBackgroundColor[1], canvasBackgroundColor[2]] : [255, 255, 255],
originalFileName: originalFileName,
continuedAt: new Date().toISOString()
};
const _j1346 = seed;
randomSeed(_j1346);
noiseSeed(_j1346);
_j160('🔄 Continue Recording from Loaded File');
_j100('recording', '📂 Loaded recording data', {
OriginalFile: originalFileName || 'Unknown',
ExistingEvents: `${loadedData.events.length} events`,
TimeOffset: `${_j1352}ms`,
Status: 'Ready to continue recording'
});
if (typeof _j104 === 'function') {
_j104();
}
}
function _j178(_j1453, _j1454) {
if (!_j1453 || !_j1454) {
_j100('system', '⚠️ No canvas size info in recording', {
Status: 'Warning'
});
return false;
}
if (width === _j1453 && height === _j1454) {
_j100('system', '✅ Canvas size matches recording', {
Width: `${_j1453}px`,
Height: `${_j1454}px`
});
return false;
}
_j100('system', '🔄 Canvas size mismatch detected', {
Current: `${width}x${height}`,
Target: `${_j1453}x${_j1454}`,
Action: 'Auto-reloading page to restore canvas size'
});
sessionStorage.setItem('pendingCanvasWidth', _j1453.toString());
sessionStorage.setItem('pendingCanvasHeight', _j1454.toString());
sessionStorage.setItem('pendingRecordingData', JSON.stringify(recordingData));
sessionStorage.setItem('shouldAutoPlay', 'true');
_j100('system', '🔄 Reloading page to restore canvas size...', {
TargetSize: `${_j1453}x${_j1454}`
});
window.location.reload();
return true;
}
#!/usr/bin/env python3
"""
extract-speed-data.py — 從 InkField JSON 錄製檔提取筆觸速度資料
Speed data extraction tool for InkField JSON recordings

Usage:
  python extract-speed-data.py recording.json

Output:
  1. DATA_XXX JavaScript array (可直接嵌入 emotion-intention.html)
  2. 每筆觸的速度統計：時長、暫停次數、速度方差、慢速佔比、速度指紋

Source: tech/emotion-intention.html Ch5
"""
import json, sys, math

def extract_strokes(json_path):
    """從 JSON 錄製檔提取筆觸座標"""
    with open(json_path) as f:
        data = json.load(f)
    events = data['events']
    strokes, current = [], []
    for ev in events:
        m = ev.get('m')
        if m == 'mp':
            current = [{'x': ev['x'], 'y': ev['y'], 't': ev['t']}]
        elif m == 'md' and current is not None:
            current.append({'x': ev['x'], 'y': ev['y'], 't': ev['t']})
        elif m == 'mr' and current:
            current.append({'x': ev['x'], 'y': ev['y'], 't': ev['t']})
            if len(current) > 3:
                strokes.append(current)
            current = []
    return strokes

def compute_speeds(pts):
    """計算平滑速度 (px/ms)"""
    raw = []
    for i in range(1, len(pts)):
        dx = pts[i]['x'] - pts[i-1]['x']
        dy = pts[i]['y'] - pts[i-1]['y']
        dt = pts[i]['t'] - pts[i-1]['t']
        # Match JS: dt > 0 ? sqrt(dx*dx+dy*dy)/dt : 0
        raw.append(math.sqrt(dx*dx + dy*dy) / dt if dt > 0 else 0)
    # 5-point smoothing (W=2), matches JS computeSpeeds() in emotion-intention.html
    smoothed = []
    W = 2
    for i in range(len(raw)):
        lo = max(0, i-W)
        hi = min(len(raw)-1, i+W)
        smoothed.append(sum(raw[lo:hi+1]) / (hi - lo + 1))
    return smoothed

def speed_fingerprint(speeds, segments=10):
    """產生速度指紋 (▁▂▃▄▅▆█)"""
    blocks = '▁▂▃▄▅▆█'
    n = len(speeds)
    seg_size = max(1, n // segments)
    fingerprint = ''
    max_spd = max(speeds) if speeds else 1
    for i in range(segments):
        start = i * seg_size
        end = min(start + seg_size, n)
        if start >= n:
            fingerprint += blocks[0]
            continue
        avg = sum(speeds[start:end]) / max(1, end - start)
        level = min(len(blocks)-1, int((avg / max_spd) * (len(blocks)-1)))
        fingerprint += blocks[level]
    return fingerprint

def analyze_stroke(pts, speeds):
    """分析單一筆觸的速度統計"""
    duration = (pts[-1]['t'] - pts[0]['t']) / 1000.0
    # 暫停：速度 < 0.1 持續 > 150ms（與 JS drawSpeedTimeline 一致）
    pauses = 0
    in_pause = False
    pause_start = 0
    for i, spd in enumerate(speeds):
        if spd < 0.1:
            if not in_pause:
                in_pause = True
                pause_start = i
        else:
            if in_pause:
                seg_i = max(0, pause_start)
                seg_end = min(len(pts)-1, i)
                pause_dur = pts[seg_end]['t'] - pts[seg_i]['t']
                if pause_dur > 150:
                    pauses += 1
                in_pause = False
    # 速度方差
    mean_spd = sum(speeds) / max(1, len(speeds))
    variance = sum((s - mean_spd)**2 for s in speeds) / max(1, len(speeds))
    # 慢速佔比 (< 0.1 px/ms)
    slow_ratio = sum(1 for s in speeds if s < 0.1) / max(1, len(speeds))
    # 速度指紋
    fp = speed_fingerprint(speeds)
    return {
        'duration': f'{duration:.1f}s',
        'pauses': pauses,
        'variance': f'{variance:.2f}',
        'slow_ratio': f'{slow_ratio*100:.0f}%',
        'fingerprint': fp,
        'points': len(pts)
    }

def to_js_data(strokes, var_name='DATA_XXX'):
    """轉換為 JavaScript 嵌入格式"""
    js_lines = []
    for stroke in strokes:
        pts = ','.join(f'{{x:{p["x"]},y:{p["y"]},t:{p["t"]}}}' for p in stroke)
        js_lines.append(f'[{pts}]')
    return f'const {var_name}=[' + ',\n'.join(js_lines) + '];'

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    json_path = sys.argv[1]
    var_name = sys.argv[2] if len(sys.argv) > 2 else 'DATA_XXX'

    strokes = extract_strokes(json_path)
    print(f'=== Found {len(strokes)} strokes ===\n')

    for i, stroke in enumerate(strokes):
        speeds = compute_speeds(stroke)
        stats = analyze_stroke(stroke, speeds)
        print(f'S{i}: {stats["points"]} pts | {stats["duration"]} | '
              f'pauses={stats["pauses"]} | var={stats["variance"]} | '
              f'slow={stats["slow_ratio"]} | {stats["fingerprint"]}')

    print(f'\n=== JavaScript data ({var_name}) ===\n')
    js = to_js_data(strokes, var_name)
    print(js[:200] + '...' if len(js) > 200 else js)
    print(f'\nTotal: {len(js)} chars')

    # Save to file
    out_path = json_path.rsplit('.', 1)[0] + f'_{var_name}.js'
    with open(out_path, 'w') as f:
        f.write(js)
    print(f'Saved to: {out_path}')

#!/usr/bin/env python3
"""
extract-composition-data.py — 從 InkField JSON 錄製檔分析構圖特徵
Composition analysis tool for InkField JSON recordings

Usage:
  python extract-composition-data.py recording.json [CANVAS_W] [CANVAS_H]

Output:
  1. DATA_COMP JavaScript object (可直接嵌入 emotion-intention.html)
  2. 每筆觸的質心、邊界距離、構圖分析

Default canvas: 800x800

Source: tech/emotion-intention.html Ch6
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
            if len(current) > 1:
                strokes.append(current)
            current = []
    return strokes

def centroid(pts):
    """計算筆觸質心"""
    cx = sum(p['x'] for p in pts) / len(pts)
    cy = sum(p['y'] for p in pts) / len(pts)
    return (round(cx), round(cy))

def boundary_distances(cx, cy, canvas_w, canvas_h):
    """計算質心到四邊的距離"""
    return {
        'left': cx,
        'right': canvas_w - cx,
        'top': cy,
        'bottom': canvas_h - cy
    }

def path_angle(p1, p2):
    """計算兩點間的方向角 (度)"""
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    return round(math.degrees(math.atan2(dy, dx)))

def analyze_composition(strokes, canvas_w=800, canvas_h=800):
    """完整構圖分析"""
    centroids = [centroid(s) for s in strokes]
    n = len(centroids)

    # 邊界距離
    boundaries = [boundary_distances(c[0], c[1], canvas_w, canvas_h) for c in centroids]

    # 畫布覆蓋範圍
    xs = [c[0] for c in centroids]
    ys = [c[1] for c in centroids]
    x_span = max(xs) - min(xs)
    y_span = max(ys) - min(ys)
    coverage_x = x_span / canvas_w
    coverage_y = y_span / canvas_h

    # 幾何中心
    geo_cx = sum(c[0] for c in centroids) / n
    geo_cy = sum(c[1] for c in centroids) / n
    true_cx = canvas_w / 2
    true_cy = canvas_h / 2
    center_offset = math.sqrt((geo_cx - true_cx)**2 + (geo_cy - true_cy)**2)

    # 落筆路徑方向
    angles = []
    for i in range(1, n):
        angles.append(path_angle(centroids[i-1], centroids[i]))

    # 對稱性分析 (左右與上下)
    lr_pairs = []
    for i in range(n):
        mirror_x = canvas_w - centroids[i][0]
        # 找最近的對稱點
        best_dist = float('inf')
        for j in range(n):
            if i == j:
                continue
            d = math.sqrt((centroids[j][0] - mirror_x)**2 + (centroids[j][1] - centroids[i][1])**2)
            if d < best_dist:
                best_dist = d
        lr_pairs.append(best_dist)
    avg_lr_dev = sum(lr_pairs) / len(lr_pairs) if lr_pairs else 0

    tb_pairs = []
    for i in range(n):
        mirror_y = canvas_h - centroids[i][1]
        best_dist = float('inf')
        for j in range(n):
            if i == j:
                continue
            d = math.sqrt((centroids[j][0] - centroids[i][0])**2 + (centroids[j][1] - mirror_y)**2)
            if d < best_dist:
                best_dist = d
        tb_pairs.append(best_dist)
    avg_tb_dev = sum(tb_pairs) / len(tb_pairs) if tb_pairs else 0

    # 三分法距離
    thirds_x = [canvas_w / 3, canvas_w * 2 / 3]
    thirds_y = [canvas_h / 3, canvas_h * 2 / 3]
    thirds_points = [(tx, ty) for tx in thirds_x for ty in thirds_y]
    thirds_dists = []
    for c in centroids:
        min_d = min(math.sqrt((c[0]-tp[0])**2 + (c[1]-tp[1])**2) for tp in thirds_points)
        thirds_dists.append(round(min_d))

    # 黃金比例距離
    phi = 0.618
    golden_x = [canvas_w * (1-phi), canvas_w * phi]
    golden_y = [canvas_h * (1-phi), canvas_h * phi]
    golden_points = [(gx, gy) for gx in golden_x for gy in golden_y]
    golden_dists = []
    for c in centroids:
        min_d = min(math.sqrt((c[0]-gp[0])**2 + (c[1]-gp[1])**2) for gp in golden_points)
        golden_dists.append(round(min_d))

    return {
        'centroids': centroids,
        'boundaries': boundaries,
        'coverage': (round(coverage_x * 100), round(coverage_y * 100)),
        'center_offset': round(center_offset),
        'geo_center': (round(geo_cx), round(geo_cy)),
        'angles': angles,
        'symmetry_lr': round(avg_lr_dev),
        'symmetry_tb': round(avg_tb_dev),
        'thirds_dists': thirds_dists,
        'golden_dists': golden_dists,
        'canvas': (canvas_w, canvas_h)
    }

def to_js_data(result, var_name='DATA_COMP'):
    """轉換為 JavaScript 嵌入格式"""
    centroids_js = ','.join(f'{{x:{c[0]},y:{c[1]}}}' for c in result['centroids'])
    boundaries_js = ','.join(
        f'{{l:{b["left"]},r:{b["right"]},t:{b["top"]},b:{b["bottom"]}}}'
        for b in result['boundaries']
    )
    angles_js = ','.join(str(a) for a in result['angles'])
    thirds_js = ','.join(str(d) for d in result['thirds_dists'])
    golden_js = ','.join(str(d) for d in result['golden_dists'])

    js = f"""const {var_name} = {{
  canvas: {{w:{result['canvas'][0]}, h:{result['canvas'][1]}}},
  centroids: [{centroids_js}],
  boundaries: [{boundaries_js}],
  coverage: {{x:{result['coverage'][0]}, y:{result['coverage'][1]}}},
  centerOffset: {result['center_offset']},
  geoCenter: {{x:{result['geo_center'][0]}, y:{result['geo_center'][1]}}},
  angles: [{angles_js}],
  symmetry: {{lr:{result['symmetry_lr']}, tb:{result['symmetry_tb']}}},
  thirdsDists: [{thirds_js}],
  goldenDists: [{golden_js}]
}};"""
    return js

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    json_path = sys.argv[1]
    canvas_w = int(sys.argv[2]) if len(sys.argv) > 2 else 800
    canvas_h = int(sys.argv[3]) if len(sys.argv) > 3 else 800

    strokes = extract_strokes(json_path)
    print(f'=== Found {len(strokes)} strokes ===\n')

    result = analyze_composition(strokes, canvas_w, canvas_h)

    for i, (c, b) in enumerate(zip(result['centroids'], result['boundaries'])):
        print(f'S{i}: centroid=({c[0]},{c[1]}) | L={b["left"]} R={b["right"]} T={b["top"]} B={b["bottom"]}')
        print(f'     thirds={result["thirds_dists"][i]}px  golden={result["golden_dists"][i]}px')

    print(f'\nCoverage: {result["coverage"][0]}% x {result["coverage"][1]}%')
    print(f'Center offset: {result["center_offset"]}px ({result["center_offset"]/canvas_w*100:.1f}%)')
    print(f'Geo center: ({result["geo_center"][0]}, {result["geo_center"][1]})')
    print(f'Symmetry deviation: L/R={result["symmetry_lr"]}px  T/B={result["symmetry_tb"]}px')
    print(f'Path angles: {result["angles"]}')

    print(f'\n=== JavaScript data ({json_path}) ===\n')
    js = to_js_data(result)
    print(js)

    # Save to file
    out_path = json_path.rsplit('.', 1)[0] + '_COMP.js'
    with open(out_path, 'w') as f:
        f.write(js)
    print(f'\nSaved to: {out_path}')

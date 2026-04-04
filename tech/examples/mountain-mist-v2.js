// ═══════════════════════════════════════════════════════════════════
// 破曉山嵐 v2 — Mountain Mist at Dawn
// Full 500×500 composition with interleaved Flow effects
// ═══════════════════════════════════════════════════════════════════
// Usage: paste into browser console on InkField page, then call:
//   window.loadRecordingFromText(JSON.stringify(window.__painting));
//   OR paste the resulting JSON into Agent JSON Input

(function() {
  var R = Math.random;
  function rn(a,b) { return R()*(b-a)+a; }
  function ri(a,b) { return Math.floor(rn(a,b+1)); }

  // ── Force Map Generator ──
  function mkForce() {
    return {
      randomSeed1: ri(50,500), randomSeed2: ri(50,500),
      randomSeed3: ri(50,500), randomSeed4: ri(50,500),
      scale1: 0, scale2: 0.01, scale3: 0.01,
      amplitude1: +rn(0.1,0.5).toFixed(2),
      amplitude2: +rn(0.1,0.5).toFixed(2),
      amplitude3: +rn(0.3,0.9).toFixed(2),
      phase1: +rn(0,6.28).toFixed(2),
      phase2: +rn(0,6.28).toFixed(2),
      phase3: +rn(0,6.28).toFixed(2),
      vortexScale1: 0.01, vortexScale2: 0.01,
      clusterScale1: 0, clusterScale2: 0
    };
  }

  // ── StrokeData Generator ──
  function mkStroke(sx, sy, mc, o) {
    return {
      strokeSeed: ri(1e6,9e6), mouseCountStart: mc,
      colorIndex: ri(0,3), shapeType: ri(0,3),
      useSharpen: o.us !== undefined ? o.us : 3,
      brushMode: o.bm || 1,
      indiffusionStrength: 0.45,
      whiteBrushMode: o.white || false,
      brushColorMode: o.c !== undefined ? o.c : 0,
      phasorVel: 1,
      explodeStart: o.ex ? 1 : 0,
      explodeEnd: o.exEnd ? 1 : 0,
      whiteMaxOpacity: +rn(0.78,0.95).toFixed(2),
      hueShift: +rn(-0.02,0.02).toFixed(3),
      satShift: +rn(0,0.04).toFixed(3),
      briShift: +rn(0,0.04).toFixed(3),
      targetflyBrushType: ri(0,2),
      targetmainStrokeDir: 0,
      brushDir: ri(0,2),
      ctlNoise: 1, brushPaintCtlNoisebyFrame: 1,
      brushPaintInterpolationOffset: 2,
      brushPaintOldRInitial: 0,
      keyBlendMode: o.bl || 0,
      initialSize: o.sz || 30,
      spraySize: o.sp || 6,
      step: 15, step2: 5, randStep: 0.05, maxUpdates: 30,
      pathRotation: o.rot || 0,
      spring: o.spring || 0.6,
      friction: o.friction || 0.5,
      baseBrushSize: o.bs || 2,
      expectedStrokeLength: (o.n || 50) * 5,
      effect3Brightness: +rn(0.5,0.7).toFixed(2),
      mouseX: sx, mouseY: sy,
      drawingSeed: ri(1e6,9e6),
      brushModeSP: o.sp7 || false,
      forceMapParams: mkForce()
    };
  }

  // ── Smooth Curve Generator ──
  // Generates a natural path from (sx,sy) to (ex,ey) with wave modulation
  function curve(sx, sy, ex, ey, n, waveAmp, waveFreq) {
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var r = i / n;
      // Ease in-out for natural acceleration/deceleration
      var ease = r < 0.5 ? 2*r*r : 1 - Math.pow(-2*r+2,2)/2;
      var x = sx + (ex - sx) * ease + Math.sin(r * Math.PI * waveFreq) * waveAmp;
      var y = sy + (ey - sy) * ease + Math.cos(r * Math.PI * waveFreq) * waveAmp * (0.3 + 0.7*Math.sin(r*2.5));
      // Add subtle hand tremor
      x += rn(-1.5, 1.5);
      y += rn(-1.5, 1.5);
      pts.push({ x: Math.round(Math.max(10, Math.min(490, x))),
                 y: Math.round(Math.max(10, Math.min(490, y))) });
    }
    return pts;
  }

  // ── Flow Event Generator ──
  function mkFlowStart(t, blendType, bounds, seed) {
    return {
      m: "flow", t: t,
      action: "start",
      blendType: blendType,
      flowSeed: seed || ri(100000, 999999),
      strokeBounds: bounds,
      strength: 100,
      lastStrokeOnly: false
    };
  }

  function mkFlowEnd(t, blendType, seed, iterations, totalFrames) {
    return {
      m: "flow", t: t,
      action: "end",
      blendType: blendType,
      flowSeed: seed,
      duration: totalFrames * 16,
      iterations: iterations,
      totalFrames: totalFrames
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMPOSITION DESIGN — Full 500×500 canvas
  // ═══════════════════════════════════════════════════════════════════
  // Layout zones (using the full canvas):
  //   Top (y: 30-180):    Sky & dawn light
  //   Middle (y: 150-350): Mountains & peaks
  //   Lower (y: 300-420):  Mist & forest
  //   Bottom (y: 380-480): Ground & calligraphy

  var ev = [], t = 0, mc = 0;

  // ── Stroke Definitions ──
  // Each stroke: sx,sy → ex,ey with n points, wave amplitude/frequency, and brush options
  var strokes = [
    // ─── Layer 1: Foundation — Wide teal mountain bases (fill bottom half) ───
    { sx:30,  sy:380, ex:470, ey:360, n:65, wa:12, wf:1.5,
      o:{c:8, sz:55, bl:1, us:3, sp:10, bs:2.5, n:65} },
    { sx:20,  sy:420, ex:480, ey:400, n:60, wa:15, wf:1.2,
      o:{c:8, sz:50, bl:1, us:3, sp:9, bs:2.5, n:60} },
    { sx:50,  sy:350, ex:450, ey:330, n:58, wa:18, wf:2,
      o:{c:8, sz:45, bl:1, us:3, sp:8, bs:2, n:58} },

    // ─── Layer 2: Mountain peaks — Blue diagonal strokes (fill center) ───
    { sx:80,  sy:350, ex:200, ey:130, n:60, wa:20, wf:2.5,
      o:{c:9, sz:38, bl:0, us:2, sp:6, bs:2, n:60} },
    { sx:250, sy:380, ex:400, ey:140, n:65, wa:25, wf:3,
      o:{c:9, sz:40, bl:0, us:2, sp:7, bs:2, n:65} },
    { sx:350, sy:320, ex:480, ey:180, n:55, wa:15, wf:2,
      o:{c:9, sz:32, bl:0, us:2, sp:5, bs:1.5, n:55} },

    // ─── Layer 3: Dawn burst — Red fly brush (upper area) ───
    { sx:100, sy:120, ex:300, ey:60,  n:50, wa:35, wf:4,
      o:{c:30, sz:28, bl:0, us:1, sp:5, bm:6, bs:2, ex:true, n:50} },
    { sx:200, sy:80,  ex:420, ey:100, n:45, wa:30, wf:3.5,
      o:{c:30, sz:25, bl:0, us:1, sp:4, bm:6, bs:1.5, ex:true, n:45} },

    // ─── Layer 4: Mist — Orange spray across middle ───
    { sx:20,  sy:220, ex:480, ey:260, n:70, wa:55, wf:0.8,
      o:{c:6, sz:45, bl:0, us:0, sp:12, bm:5, bs:3.5, n:70} },
    { sx:40,  sy:280, ex:460, ey:310, n:65, wa:50, wf:1,
      o:{c:6, sz:42, bl:0, us:0, sp:10, bm:5, bs:3, n:65} },

    // ─── Layer 5: Calligraphy accents — Black ink (bottom) ───
    { sx:60,  sy:440, ex:440, ey:460, n:50, wa:6, wf:2,
      o:{c:0, sz:22, bl:2, us:2, sp:3, bs:1.2, rot:7, n:50} },
    { sx:100, sy:470, ex:400, ey:475, n:40, wa:4, wf:1.5,
      o:{c:0, sz:18, bl:2, us:2, sp:3, bs:1, rot:7, n:40} },
  ];

  // ── Flow Effect Insertion Points ──
  // Interleaved: after layer 1 (base), after layer 2 (peaks), after layer 4 (mist)
  var flowAfterStroke = {
    2: { blendType: 0, iterations: 12, frames: 36 },   // After base: basic flow
    5: { blendType: 7, iterations: 10, frames: 30 },   // After peaks: swirl
    9: { blendType: 2, iterations: 8,  frames: 24 },   // After mist: concentric
  };

  // ═══════════════════════════════════════════════════════════════════
  // BUILD EVENTS
  // ═══════════════════════════════════════════════════════════════════

  strokes.forEach(function(s, i) {
    var pts = curve(s.sx, s.sy, s.ex, s.ey, s.n, s.wa, s.wf);

    // Inter-stroke gap: 700-900ms (first stroke starts at 100ms)
    t += (i === 0) ? 100 : ri(700, 900);

    // mp event (mouse press)
    ev.push({
      m: "mp", t: t, x: pts[0].x, y: pts[0].y,
      strokeData: mkStroke(pts[0].x, pts[0].y, mc, s.o)
    });

    // md events (mouse drag)
    for (var j = 1; j < pts.length; j++) {
      t += ri(14, 20);
      ev.push({ m: "md", t: t, x: pts[j].x, y: pts[j].y });
    }

    // mr event (mouse release)
    t += ri(10, 30);
    ev.push({ m: "mr", t: t, x: pts[pts.length-1].x, y: pts[pts.length-1].y });

    // Update mouse count
    mc += 1 + s.n;

    // ── Insert Flow Effect if scheduled after this stroke ──
    if (flowAfterStroke[i]) {
      var fl = flowAfterStroke[i];
      var flowSeed = ri(100000, 999999);

      // Wait for ink to settle (1200ms minimum)
      t += 1200;

      // Compute bounds from all strokes so far
      var allPts = [];
      for (var k = 0; k <= i; k++) {
        allPts.push({ x: strokes[k].sx, y: strokes[k].sy });
        allPts.push({ x: strokes[k].ex, y: strokes[k].ey });
      }
      var minX = 500, minY = 500, maxX = 0, maxY = 0;
      allPts.forEach(function(p) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
      // Normalize to 0-1 with some padding
      var bounds = {
        minX: Math.max(0, (minX - 30) / 500),
        minY: Math.max(0, (minY - 30) / 500),
        maxX: Math.min(1, (maxX + 30) / 500),
        maxY: Math.min(1, (maxY + 30) / 500)
      };

      // Flow start event
      ev.push(mkFlowStart(t, fl.blendType, bounds, flowSeed));

      // Flow runs for iterations * 3 frames * 16ms
      var flowDuration = fl.frames * 16 + 200;
      t += flowDuration;

      // Flow end event
      ev.push(mkFlowEnd(t, fl.blendType, flowSeed, fl.iterations, fl.frames));

      // Extra settle time before next stroke
      t += 800;
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // ASSEMBLE FINAL JSON
  // ═══════════════════════════════════════════════════════════════════

  window.__painting = {
    version: "1.0",
    startTime: 0,
    randomSeed: ri(100000, 999999),
    initialPathToggle: false,
    initialWhiteBrushMode: false,
    initialBrushColorMode: 0,
    canvasSize: { width: 500, height: 500 },
    canvasBackgroundColor: [222, 212, 195],
    events: ev,
    strokes: [],
    timeOffset: 0
  };

  var jsonStr = JSON.stringify(window.__painting);
  console.log('🎨 Mountain Mist v2: ' + ev.length + ' events, ' + jsonStr.length + ' chars');
  console.log('🎨 Strokes: 12, Flow effects: 3 (interleaved)');

  return '🎨 破曉山嵐 v2 ready! ' + ev.length + ' events. Use PLAY JSON or call loadRecordingFromText()';
})();

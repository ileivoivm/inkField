(() => {
  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.floor(rand(min, max + 1));

  function forceMapParams() {
    return {
      randomSeed1: Number(rand(100, 200).toFixed(2)),
      randomSeed2: Number(rand(200, 300).toFixed(2)),
      randomSeed3: Number(rand(300, 400).toFixed(2)),
      randomSeed4: Number(rand(400, 500).toFixed(2)),
      scale1: 0,
      scale2: 0.01,
      scale3: 0.01,
      amplitude1: 0.27,
      amplitude2: 0.32,
      amplitude3: 0.67,
      phase1: Number(rand(0, 6.28).toFixed(2)),
      phase2: Number(rand(0, 6.28).toFixed(2)),
      phase3: Number(rand(0, 6.28).toFixed(2)),
      vortexScale1: 0.01,
      vortexScale2: 0.01,
      clusterScale1: 0,
      clusterScale2: 0,
    };
  }

  function strokeData(mouseCountStart, startX, startY, expectedStrokeLength, brushColorMode) {
    return {
      strokeSeed: randInt(1000000, 9999999),
      mouseCountStart,
      colorIndex: randInt(0, 3),
      shapeType: 2,
      useSharpen: 3,
      brushMode: 1,
      indiffusionStrength: 0.45,
      whiteBrushMode: false,
      brushColorMode,
      phasorVel: 1,
      explodeStart: 1,
      explodeEnd: 1,
      whiteMaxOpacity: 0.84,
      hueShift: Number(rand(-0.02, 0.02).toFixed(3)),
      satShift: Number(rand(0, 0.03).toFixed(3)),
      briShift: Number(rand(0, 0.03).toFixed(3)),
      targetflyBrushType: 2,
      targetmainStrokeDir: 0,
      brushDir: 0,
      ctlNoise: 1,
      brushPaintCtlNoisebyFrame: 1,
      brushPaintInterpolationOffset: 2,
      brushPaintOldRInitial: 0,
      keyBlendMode: 0,
      initialSize: 38,
      spraySize: 6,
      step: 15,
      step2: 5,
      randStep: 0.05,
      maxUpdates: 30,
      pathRotation: 0,
      spring: 0.6,
      friction: 0.5,
      baseBrushSize: 2,
      expectedStrokeLength,
      effect3Brightness: 0.57,
      mouseX: Math.round(startX),
      mouseY: Math.round(startY),
      drawingSeed: randInt(1000000, 9999999),
      brushModeSP: false,
      forceMapParams: forceMapParams(),
    };
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function makeStroke(start, end, mouseCountStart, t0, brushColorMode) {
    const mdCount = 55;
    const dt = 16;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy);
    const events = [
      {
        m: "mp",
        t: t0,
        x: Math.round(start.x),
        y: Math.round(start.y),
        strokeData: strokeData(mouseCountStart, start.x, start.y, Math.round(len), brushColorMode),
      },
    ];

    for (let i = 1; i <= mdCount; i++) {
      const p = i / mdCount;
      const wobble = Math.sin(p * Math.PI * 2) * 4;
      const x = lerp(start.x, end.x, p);
      const y = lerp(start.y, end.y, p) + wobble;
      events.push({
        m: "md",
        t: t0 + i * dt,
        x: Math.round(x),
        y: Math.round(y),
      });
    }

    events.push({
      m: "mr",
      t: t0 + (mdCount + 1) * dt,
      x: Math.round(end.x),
      y: Math.round(end.y),
    });

    return { events, nextMouseCountStart: mouseCountStart + 1 + mdCount, endTime: t0 + (mdCount + 1) * dt };
  }

  const recording = {
    version: "1.0",
    startTime: 0,
    randomSeed: 1234567890,
    initialPathToggle: false,
    initialWhiteBrushMode: false,
    initialBrushColorMode: 0,
    canvasSize: { width: 500, height: 500 },
    canvasBackgroundColor: [222, 212, 195],
    events: [],
    strokes: [],
    timeOffset: 0,
    initialEffectControl: {
      shapeType: 0,
      metallicStrength: 85,
      metallicFlow: 200,
      metallicTint: [0.72, 0.5, 0.35],
      metallicTintType: "copper",
    },
    savedAt: new Date().toISOString(),
  };

  const plans = [
    { start: { x: 70, y: 100 }, end: { x: 430, y: 120 }, color: 0 },
    { start: { x: 90, y: 240 }, end: { x: 410, y: 270 }, color: 30 },
    { start: { x: 120, y: 380 }, end: { x: 390, y: 350 }, color: 9 },
  ];

  let time = 0;
  let mouseCountStart = 0;

  for (const plan of plans) {
    const stroke = makeStroke(plan.start, plan.end, mouseCountStart, time, plan.color);
    recording.events.push(...stroke.events);
    mouseCountStart = stroke.nextMouseCountStart;
    time = stroke.endTime + 700;
  }

  const json = JSON.stringify(recording);
  if (typeof window.loadRecordingFromText === "function") {
    window.loadRecordingFromText(json);
    console.log("Loaded simple lines:", recording.events.length, "events");
  } else {
    console.log(json);
    console.warn("window.loadRecordingFromText is not available on this page");
  }
})();

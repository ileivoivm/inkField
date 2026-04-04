/**
 * ═══════════════════════════════════════════════════════════════
 *  InkField Inkfield — 抽象表現主義 IIFE 生成器
 *  基於 agent-generator-logic.js v5 的架構
 *  用法：在 Inkfield Playground 的瀏覽器 Console 中貼入整段執行
 * ═══════════════════════════════════════════════════════════════
 */
(function() {
  // ── 工具函式 ──
  function rn(a,b){return Math.random()*(b-a)+a;}
  function ri(a,b){return Math.floor(rn(a,b+1));}
  function gauss(m,s){var u=1-Math.random(),v=Math.random();return m+Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)*s;}
  function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}

  // ── 畫布設定 ──
  var W=800, H=800;
  var CX=W*0.5, CY=H*0.45;

  // ── 調色盤（冷暖對比） ──
  var PAL=[
    {bcm:8,  w:6},  // teal（主色）
    {bcm:9,  w:5},  // blue
    {bcm:6,  w:4},  // orange（暖色對比）
    {bcm:30, w:2},  // red（點綴）
    {bcm:3,  w:1}   // gray（中性）
  ];
  var TW=PAL.reduce(function(s,c){return s+c.w;},0);
  function pickColor(){var r=rn(0,TW);for(var i=0;i<PAL.length;i++){r-=PAL[i].w;if(r<=0)return PAL[i];}return PAL[0];}

  // ── 交錯結構：5 組 × 4 筆 = 20 筆 + 4 次 Flow ──
  var GROUPS=[4,4,4,4,4];
  var FLOW_TYPES=[3,4,8,2,7]; // Vertical, Horizontal, Cellular, Concentric, Swirl

  // ── 物理路徑生成（sin wave + noise + tilt） ──
  function genPath(cx,sy,ey,n,tiltDeg){
    var pts=[], tr=(tiltDeg||0)*Math.PI/180;
    var wa=rn(1,5), wf=rn(0.02,0.08), ph=rn(0,Math.PI*2);
    var ys=(ey-sy)/n;
    for(var i=0;i<=n;i++){
      var y=sy+ys*i;
      var wobble=Math.sin(i*wf*10+ph)*wa+rn(-1.5,1.5);
      var ts=(y-sy)*Math.tan(tr);
      pts.push({x:Math.round(clamp(cx+wobble+ts,15,W-15)),y:Math.round(clamp(y,15,H-15))});
    }
    return pts;
  }

  // ── Slot-based 定位 ──
  function slotX(idx,total){
    var sw=(W*0.65)/total;
    var sx=CX-(total*sw)/2;
    return clamp(Math.round(gauss(sx+sw*(idx+0.5),sw*0.4)),60,W-60);
  }

  // ── 粗細分佈 ──
  function getThick(){
    var r=Math.random();
    if(r<0.2) return {bbs:rn(0.8,1.3),mul:rn(8,14)};
    if(r<0.5) return {bbs:rn(1.5,2.5),mul:rn(15,25)};
    if(r<0.8) return {bbs:rn(2.5,4.0),mul:rn(20,35)};
    return {bbs:rn(4.0,6.0),mul:rn(25,40)};
  }

  // ── 墨效選擇 ──
  function getInk(){
    var r=Math.random();
    if(r<0.30) return 0; // Diffusion
    if(r<0.55) return 3; // Watercolor
    if(r<0.75) return 4; // Textured
    if(r<0.90) return 1; // Edge
    return 2;             // Sharp
  }

  // ── strokeData 組裝（~35 欄位 + forceMapParams） ──
  function mkSD(mcs,sx,sy,nmd,col){
    var th=getThick(), bbs=th.bbs, isz=parseFloat((th.mul*bbs).toFixed(2));
    var bm=1; var bmr=Math.random(); if(bmr<0.15)bm=4; else if(bmr<0.22)bm=6;
    return {
      strokeSeed:ri(1e7,9e8), mouseCountStart:mcs, drawingSeed:ri(1e6,9e6),
      mouseX:sx, mouseY:sy,
      colorIndex:ri(0,5), shapeType:ri(0,2), useSharpen:getInk(),
      brushMode:bm, indiffusionStrength:parseFloat(rn(0.3,0.65).toFixed(2)),
      whiteBrushMode:false, brushColorMode:col.bcm, brushModeSP:false,
      phasorVel:1, explodeStart:0, explodeEnd:0,
      whiteMaxOpacity:parseFloat(rn(0.6,0.92).toFixed(2)),
      hueShift:parseFloat(rn(-0.03,0.03).toFixed(3)),
      satShift:parseFloat(rn(0,0.05).toFixed(3)),
      briShift:parseFloat(rn(-0.02,0.04).toFixed(3)),
      targetflyBrushType:ri(0,2), targetmainStrokeDir:0, brushDir:ri(0,3),
      ctlNoise:1, brushPaintCtlNoisebyFrame:1,
      brushPaintInterpolationOffset:ri(1,2), brushPaintOldRInitial:parseFloat(rn(0,0.5).toFixed(1)),
      keyBlendMode:Math.random()<0.6?0:2,
      initialSize:isz, spraySize:rn(2,5), step:15, step2:ri(3,7),
      randStep:0.05, maxUpdates:30, pathRotation:ri(0,3),
      spring:parseFloat(rn(0.4,0.65).toFixed(2)), friction:0.5,
      baseBrushSize:bbs, expectedStrokeLength:nmd*5,
      effect3Brightness:parseFloat(rn(0.45,0.80).toFixed(2)),
      forceMapParams:{
        randomSeed1:parseFloat(rn(50,500).toFixed(1)),
        randomSeed2:parseFloat(rn(50,500).toFixed(2)),
        randomSeed3:parseFloat(rn(50,500).toFixed(2)),
        randomSeed4:parseFloat(rn(50,500).toFixed(2)),
        scale1:0, scale2:0.01, scale3:0.01,
        amplitude1:parseFloat(rn(0.1,0.4).toFixed(2)),
        amplitude2:parseFloat(rn(0.1,0.4).toFixed(2)),
        amplitude3:parseFloat(rn(0.2,0.6).toFixed(2)),
        phase1:parseFloat(rn(0,6.28).toFixed(2)),
        phase2:parseFloat(rn(0,6.28).toFixed(2)),
        phase3:parseFloat(rn(0,6.28).toFixed(2)),
        vortexScale1:0.01, vortexScale2:0.01,
        clusterScale1:0, clusterScale2:0
      }
    };
  }

  // ── Bounding Box 計算（正規化 0-1） ──
  function bounds(evts){
    var x0=W,x1=0,y0=H,y1=0;
    for(var i=0;i<evts.length;i++){
      if(evts[i].x!==undefined){
        x0=Math.min(x0,evts[i].x); x1=Math.max(x1,evts[i].x);
        y0=Math.min(y0,evts[i].y); y1=Math.max(y1,evts[i].y);
      }
    }
    return {
      minX:parseFloat(Math.max(0,(x0-20)/W).toFixed(4)),
      minY:parseFloat(Math.max(0,(y0-20)/H).toFixed(4)),
      maxX:parseFloat(Math.min(1,(x1+20)/W).toFixed(4)),
      maxY:parseFloat(Math.min(1,(y1+20)/H).toFixed(4))
    };
  }

  // ═══════════════════════════════════════
  //  主生成流程
  // ═══════════════════════════════════════
  var ev=[], t=0, mcs=0;
  var total=GROUPS.reduce(function(a,b){return a+b;},0);
  var si=0, allSE=[];

  for(var g=0; g<GROUPS.length; g++){
    var gs=GROUPS[g], gEvts=[];

    for(var s=0; s<gs; s++){
      var nmd=ri(55,80);
      var cx=slotX(si,total);
      var col=pickColor();

      // 垂直跨度
      var sLen=rn(H*0.3,H*0.65);
      var topY=Math.round(clamp(gauss(CY-sLen/2,H*0.08),30,H*0.4));
      var botY=Math.round(clamp(topY+sLen,H*0.5,H-30));
      var goDown=Math.random()<0.6;
      var sy=goDown?topY:botY, ey=goDown?botY:topY;
      var tilt=rn(-12,12);

      var pts=genPath(cx,sy,ey,nmd,tilt);
      var amd=pts.length-1;
      var px=pts[0].x, py=pts[0].y;

      // 時間控制
      t+=(si===0)?ri(50,200):ri(650,950);

      var sd=mkSD(mcs,px,py,amd,col);
      var mp={m:"mp",t:t,x:px,y:py,strokeData:sd};
      ev.push(mp); gEvts.push(mp);

      // md 事件（50-80 個）
      for(var i=1;i<pts.length;i++){
        t+=ri(14,20);
        var md={m:"md",t:t,x:pts[i].x,y:pts[i].y};
        ev.push(md); gEvts.push(md);
      }

      // mr 事件
      t+=ri(10,30);
      var lp=pts[pts.length-1];
      var mr={m:"mr",t:t,x:lp.x,y:lp.y};
      ev.push(mr); gEvts.push(mr);

      mcs+=1+amd;
      si++;
    }

    allSE=allSE.concat(gEvts);

    // 組間 Flow（最後一組除外）
    if(g<GROUPS.length-1){
      t+=ri(800,1500);
      var ft=FLOW_TYPES[g%FLOW_TYPES.length];
      var isFirst=(g===0);
      var bd=bounds(allSE);
      var dur=ri(1200,2500);
      var fSeed=ri(100000,999999);

      ev.push({m:"flow",t:t,action:"start",blendType:ft,flowSeed:fSeed,
               strokeBounds:bd,strength:100,lastStrokeOnly:!isFirst});
      t+=dur;
      ev.push({m:"flow",t:t,action:"end",blendType:ft,flowSeed:fSeed,
               iterations:10,totalFrames:30});
      t+=ri(500,1000);
    }
  }

  // ── 組裝頂層 JSON ──
  var painting={
    version:"1.0", startTime:0, randomSeed:ri(1e8,9e8),
    initialPathToggle:false, initialWhiteBrushMode:false,
    initialBrushColorMode:0,
    canvasSize:{width:W,height:H},
    canvasBackgroundColor:[222,212,195],
    events:ev, strokes:[], timeOffset:0
  };

  // ── 注入並播放 ──
  var json=JSON.stringify(painting);
  var result=window.loadRecordingFromText(json);
  console.log('🎨 Abstract Expressionism Generated!');
  console.log('   Events: '+ev.length+' | Size: '+(json.length/1024).toFixed(1)+'KB');
  console.log('   Duration: '+(t/1000).toFixed(1)+'s | Strokes: '+total);
  console.log('   Result:', result);
})();

/** Three.js apartment + low-poly hosers for Saturday Night Canada */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const DEG = Math.PI / 180;

function mat(color, opts = {}) {
  const o = {
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metalness ?? 0.05,
    flatShading: opts.flat ?? true,
  };
  if (opts.emissive) {
    o.emissive = new THREE.Color(opts.emissive);
    o.emissiveIntensity = opts.emissiveIntensity ?? 0.35;
  }
  if (opts.map) o.map = opts.map;
  if (opts.transparent) {
    o.transparent = true;
    o.opacity = opts.opacity ?? 1;
  }
  return new THREE.MeshStandardMaterial(o);
}

function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rTop, rBot, h, color, opts) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, h, opts?.seg ?? 8),
    mat(color, opts)
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function sphere(r, color, opts) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(r, opts?.seg ?? 10, opts?.segY ?? 8),
    mat(color, opts)
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function makeVinylTableTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  // Beige-brown vinyl base
  ctx.fillStyle = "#d4b896";
  ctx.fillRect(0, 0, 512, 512);
  // Faded checker / diamond pattern
  ctx.strokeStyle = "rgba(100, 70, 40, 0.45)";
  ctx.lineWidth = 2;
  for (let y = 0; y < 512; y += 48) {
    for (let x = 0; x < 512; x += 48) {
      ctx.strokeRect(x + 4, y + 4, 40, 40);
      ctx.beginPath();
      ctx.moveTo(x + 24, y + 8);
      ctx.lineTo(x + 40, y + 24);
      ctx.lineTo(x + 24, y + 40);
      ctx.lineTo(x + 8, y + 24);
      ctx.closePath();
      ctx.stroke();
    }
  }
  // Coffee rings
  const rings = [
    [120, 160, 38],
    [360, 280, 44],
    [200, 400, 32],
    [420, 120, 28],
  ];
  for (const [cx, cy, r] of rings) {
    ctx.strokeStyle = "rgba(90, 55, 30, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(90, 55, 30, 0.2)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx + 2, cy - 1, r * 0.92, 0.2, Math.PI * 1.6);
    ctx.stroke();
  }
  // Cigarette burns
  const burns = [
    [80, 90],
    [280, 70],
    [450, 380],
    [160, 300],
    [340, 180],
    [90, 420],
  ];
  for (const [bx, by] of burns) {
    const g = ctx.createRadialGradient(bx, by, 1, bx, by, 14);
    g.addColorStop(0, "#1a1208");
    g.addColorStop(0.4, "#4a3020");
    g.addColorStop(0.7, "rgba(100,70,40,0.5)");
    g.addColorStop(1, "rgba(196,168,130,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  // Scuffs / wear
  ctx.strokeStyle = "rgba(60, 40, 25, 0.2)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 12);
    ctx.stroke();
  }
  // Edge wear
  ctx.fillStyle = "rgba(80, 55, 35, 0.15)";
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 494, 512, 18);
  ctx.fillRect(0, 0, 18, 512);
  ctx.fillRect(494, 0, 18, 512);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function makeCardFaceTexture(card) {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 224;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f8f5ef";
  ctx.fillRect(0, 0, 160, 224);
  ctx.strokeStyle = "#2a3548";
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, 154, 218);
  const red = card.suit === "H" || card.suit === "D";
  const sym = { S: "♠", H: "♥", D: "♦", C: "♣" }[card.suit];
  const rank = { "9": "9", T: "10", J: "J", Q: "Q", K: "K", A: "A" }[card.rank];
  ctx.fillStyle = red ? "#c81e1e" : "#111";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 48px Segoe UI, sans-serif";
  ctx.fillText(rank, 10, 8);
  ctx.font = "44px Segoe UI, sans-serif";
  ctx.fillText(sym, 12, 58);
  // Large center suit — keep clear of edges / name chips
  ctx.font = "bold 78px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sym, 80, 130);
  // Bottom-right mirror rank for readability at angles
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.font = "bold 28px Segoe UI, sans-serif";
  ctx.fillText(rank, 148, 210);
  ctx.font = "24px Segoe UI, sans-serif";
  ctx.fillText(sym, 148, 186);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCardBackTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 90;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(0, 0, 64, 90);
  ctx.strokeStyle = "#c81e1e";
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 56, 82);
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SNC", 32, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Stylized 1970s low-poly seated character with readable face */
export function createCharacter(cfg) {
  const root = new THREE.Group();
  root.name = cfg.name;

  const skin = cfg.skin || "#e8c4a8";
  const hair = cfg.hair || "#3b2a1a";
  const shirt = cfg.shirt || "#c81e1e";
  const pants = cfg.pants || "#2a3548";
  const accent = cfg.accent || "#ffffff";
  const browColor = cfg.brow || hair;
  const eyeColor = cfg.eyeColor || "#2a1810";
  const stubbleColor = cfg.stubble || "#5a4638";
  const noseTint = cfg.noseTint || "#d4a88a";

  // Torso with wrinkle suggestion
  const torso = box(0.72, 0.85, 0.48, shirt);
  torso.position.y = 0.95;
  root.add(torso);
  const wrinkle1 = box(0.68, 0.03, 0.5, accent, { roughness: 0.9 });
  wrinkle1.position.set(0, 1.15, 0.01);
  root.add(wrinkle1);
  const wrinkle2 = box(0.6, 0.025, 0.5, "#000000");
  wrinkle2.material = mat(shirt, { roughness: 1 });
  wrinkle2.material.color.offsetHSL(0, 0, -0.08);
  wrinkle2.position.set(0, 0.78, 0.01);
  root.add(wrinkle2);

  const stripe = box(0.74, 0.12, 0.5, accent, { roughness: 0.6 });
  stripe.position.set(0, 1.05, 0);
  root.add(stripe);

  const emblem = box(0.22, 0.22, 0.06, cfg.emblem || "#ffffff");
  emblem.position.set(0, 0.95, 0.24);
  root.add(emblem);

  // Neck
  const neck = cyl(0.12, 0.14, 0.18, skin, { seg: 8 });
  neck.position.y = 1.48;
  root.add(neck);

  // Head group (for look / blink / talk)
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.72;
  root.add(headGroup);

  const head = sphere(0.34, skin, { seg: 14, segY: 12 });
  head.scale.set(1, 1.08, 0.95);
  headGroup.add(head);

  // Ears
  for (const sx of [-1, 1]) {
    const ear = sphere(0.08, skin, { seg: 6, segY: 6 });
    ear.position.set(sx * 0.32, -0.02, 0);
    ear.scale.set(0.55, 1, 0.7);
    headGroup.add(ear);
  }

  // Hair
  const hairCap = sphere(0.36, hair, { seg: 10, segY: 8 });
  hairCap.position.set(0, 0.12, -0.04);
  hairCap.scale.set(1.08, 0.78, 1.12);
  headGroup.add(hairCap);

  if (cfg.mullet) {
    const mullet = box(0.3, 0.42, 0.2, hair);
    mullet.position.set(0, -0.22, -0.3);
    headGroup.add(mullet);
    const mulletTip = box(0.22, 0.18, 0.14, hair);
    mulletTip.position.set(0, -0.42, -0.32);
    headGroup.add(mulletTip);
  }
  if (cfg.sideburns) {
    for (const sx of [-1, 1]) {
      const sb = box(0.09, 0.28, 0.12, hair);
      sb.position.set(sx * 0.3, -0.12, 0.06);
      headGroup.add(sb);
    }
  }
  if (cfg.beard) {
    const beard = box(0.32, 0.22, 0.14, stubbleColor, { roughness: 1 });
    beard.position.set(0, -0.28, 0.22);
    headGroup.add(beard);
    const chin = box(0.18, 0.12, 0.1, stubbleColor, { roughness: 1 });
    chin.position.set(0, -0.38, 0.2);
    headGroup.add(chin);
  }

  // Face — more readable/realistic stylized features
  const faceZ = 0.32;

  // Cheek soft variation
  for (const sx of [-1, 1]) {
    const cheek = sphere(0.1, skin, { seg: 6, segY: 5 });
    cheek.position.set(sx * 0.2, -0.08, faceZ - 0.05);
    cheek.scale.set(0.7, 0.6, 0.5);
    cheek.material = mat(skin, { flat: false, roughness: 0.85 });
    cheek.material.color.offsetHSL(0.02 * sx, 0.05, cfg.cheekLift || 0.04);
    headGroup.add(cheek);
  }

  // Eyebrows (separate, thick)
  const brows = [];
  for (const ex of [-0.12, 0.12]) {
    const brow = box(0.15, 0.04, 0.045, browColor);
    brow.position.set(ex, 0.12, faceZ + 0.02);
    brow.rotation.z = ex < 0 ? 0.12 : -0.12;
    if (cfg.angryBrows) brow.rotation.z = ex < 0 ? -0.28 : 0.28;
    headGroup.add(brow);
    brows.push(brow);
  }

  // Eyes: sclera sphere + iris + pupil + highlight + lid
  const eyes = [];
  for (const ex of [-0.12, 0.12]) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(ex, 0.045, faceZ);
    const white = sphere(0.055, "#f7f4ef", { seg: 8, segY: 6, flat: false });
    white.scale.set(1.15, 0.85, 0.7);
    eyeGroup.add(white);
    const iris = sphere(0.032, eyeColor, { seg: 8, segY: 6, flat: false });
    iris.position.z = 0.028;
    iris.scale.set(1, 1, 0.6);
    eyeGroup.add(iris);
    const pupil = sphere(0.016, "#0a0806", { seg: 6, segY: 5, flat: false });
    pupil.position.z = 0.042;
    eyeGroup.add(pupil);
    const highlight = sphere(0.01, "#ffffff", { seg: 5, segY: 4, flat: false });
    highlight.position.set(0.012, 0.012, 0.055);
    eyeGroup.add(highlight);
    const lid = box(0.14, 0.1, 0.06, skin);
    lid.position.set(0, 0.01, 0.01);
    lid.visible = false;
    eyeGroup.add(lid);
    headGroup.add(eyeGroup);
    eyes.push({ group: eyeGroup, lid, pupil, iris });
  }

  // Nose (rounded bridge + tip)
  const noseBridge = box(0.07, 0.12, 0.1, noseTint, { flat: false });
  noseBridge.position.set(0, -0.02, faceZ + 0.06);
  headGroup.add(noseBridge);
  const nose = sphere(0.055, noseTint, { seg: 8, segY: 6, flat: false });
  nose.position.set(0, -0.1, faceZ + 0.1);
  nose.scale.set(1.1, 0.85, 1);
  headGroup.add(nose);
  const nostril = box(0.11, 0.04, 0.06, noseTint);
  nostril.position.set(0, -0.14, faceZ + 0.06);
  headGroup.add(nostril);

  // Stubble patch (even without full beard)
  if (!cfg.beard) {
    const stubble = box(0.3, 0.14, 0.08, stubbleColor, { roughness: 1 });
    stubble.position.set(0, -0.22, faceZ);
    headGroup.add(stubble);
  }

  // Mouth — lips + slight smile curve suggestion
  const mouth = box(0.17, 0.045, 0.055, cfg.lipColor || "#a04545");
  mouth.position.set(0, -0.26, faceZ + 0.05);
  headGroup.add(mouth);
  const lowerLip = box(0.14, 0.03, 0.04, cfg.lipColor || "#8b3a3a");
  lowerLip.position.set(0, -0.3, faceZ + 0.045);
  headGroup.add(lowerLip);
  const mouthOpen = box(0.13, 0.07, 0.05, "#2a1010");
  mouthOpen.position.set(0, -0.27, faceZ + 0.06);
  mouthOpen.visible = false;
  headGroup.add(mouthOpen);

  // Arms reaching toward table
  const arms = new THREE.Group();
  for (const side of [-1, 1]) {
    const upper = cyl(0.09, 0.1, 0.55, shirt, { seg: 6 });
    upper.position.set(side * 0.48, 1.15, 0.08);
    upper.rotation.z = side * 22 * DEG;
    upper.rotation.x = 48 * DEG;
    arms.add(upper);
    const forearm = cyl(0.08, 0.09, 0.48, skin, { seg: 6 });
    forearm.position.set(side * 0.52, 0.72, 0.38);
    forearm.rotation.x = -55 * DEG;
    arms.add(forearm);
    const hand = sphere(0.095, skin, { seg: 6 });
    hand.position.set(side * 0.48, 0.52, 0.55);
    arms.add(hand);
  }
  root.add(arms);

  const beerHand = new THREE.Group();
  beerHand.position.set(0.48, 0.52, 0.55);
  root.add(beerHand);
  const stubby = createStubby();
  stubby.scale.setScalar(0.85);
  stubby.visible = !!cfg.holdBeer;
  beerHand.add(stubby);

  // Seated hips / legs
  const hips = box(0.7, 0.28, 0.5, pants);
  hips.position.y = 0.48;
  root.add(hips);
  for (const side of [-1, 1]) {
    const thigh = box(0.28, 0.2, 0.55, pants);
    thigh.position.set(side * 0.2, 0.35, 0.35);
    thigh.rotation.x = -15 * DEG;
    root.add(thigh);
    const shin = box(0.24, 0.18, 0.5, pants);
    shin.position.set(side * 0.2, 0.18, 0.75);
    root.add(shin);
    const boot = box(0.26, 0.14, 0.36, cfg.boots || "#2b2118");
    boot.position.set(side * 0.2, 0.08, 1.05);
    root.add(boot);
  }

  // Nameplate
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.roundRect?.(0, 0, 256, 64, 8);
  if (!ctx.roundRect) ctx.fillRect(0, 0, 256, 64);
  else {
    ctx.beginPath();
    ctx.roundRect(0, 0, 256, 64, 8);
    ctx.fill();
  }
  ctx.fillStyle = cfg.labelColor || "#ffd166";
  ctx.font = "bold 30px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(cfg.name.toUpperCase(), 128, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.24),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  label.position.set(0, 2.2, 0);
  root.add(label);

  // Turn highlight ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.035, 8, 24),
    new THREE.MeshBasicMaterial({ color: cfg.labelColor || "#ffd166", transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  ring.visible = false;
  root.add(ring);

  // Persistent YOU identity: glow ring + arrow above head
  let youGlow = null;
  let youArrow = null;
  if (cfg.isYou) {
    youGlow = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.035, 8, 32),
      new THREE.MeshBasicMaterial({ color: "#ffd166", transparent: true, opacity: 0.7 })
    );
    youGlow.rotation.x = Math.PI / 2;
    youGlow.position.y = 0.05;
    root.add(youGlow);
    // Triangular pointer (3 sides) — avoid giant yellow octagon over table
    const arrowGeo = new THREE.ConeGeometry(0.08, 0.18, 3);
    youArrow = new THREE.Mesh(
      arrowGeo,
      new THREE.MeshBasicMaterial({ color: "#ffd166", transparent: true, opacity: 0.85 })
    );
    youArrow.position.set(0, 2.35, 0.15);
    youArrow.rotation.x = Math.PI; // point down
    root.add(youArrow);
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 10, 8),
      new THREE.MeshBasicMaterial({ color: "#ffd166", transparent: true, opacity: 0.08, depthWrite: false })
    );
    halo.position.set(0, 1.15, -0.1);
    root.add(halo);
  }

  // Speech bubble plane (hidden until trump reaction / talk)
  const bubbleCanvas = document.createElement("canvas");
  bubbleCanvas.width = 256;
  bubbleCanvas.height = 96;
  const bubbleTex = new THREE.CanvasTexture(bubbleCanvas);
  const bubble = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.28),
    new THREE.MeshBasicMaterial({ map: bubbleTex, transparent: true, depthWrite: false })
  );
  bubble.position.set(0, 2.45, 0.2);
  bubble.visible = false;
  root.add(bubble);

  root.userData = {
    headGroup,
    head,
    arms,
    beerHand,
    stubby,
    label,
    ring,
    youGlow,
    youArrow,
    bubble,
    bubbleCanvas,
    bubbleTex,
    bubbleUntil: 0,
    eyes,
    mouth,
    mouthOpen,
    breathPhase: Math.random() * Math.PI * 2,
    headPhase: Math.random() * Math.PI * 2,
    beerPhase: Math.random() * Math.PI * 2,
    blinkTimer: 1 + Math.random() * 3,
    talkUntil: 0,
    lookTarget: null,
    dimmed: false,
    knivesMime: 0,
    cfg,
  };

  return root;
}

export function createStubby() {
  const g = new THREE.Group();
  const body = cyl(0.07, 0.08, 0.28, "#1a3a1a", { seg: 8, roughness: 0.4 });
  body.position.y = 0.14;
  g.add(body);
  const neck = cyl(0.04, 0.05, 0.08, "#1a3a1a", { seg: 8 });
  neck.position.y = 0.32;
  g.add(neck);
  const cap = cyl(0.045, 0.045, 0.04, "#c9a227", { seg: 8, metalness: 0.4 });
  cap.position.y = 0.38;
  g.add(cap);
  return g;
}

/** Metal butter knives with burnt/black tips — hot knives gag prop */
export function createButterKnives() {
  const g = new THREE.Group();
  function oneKnife(x) {
    const k = new THREE.Group();
    // Handle
    const handle = box(0.04, 0.06, 0.16, "#c4b8a0", { metalness: 0.15, roughness: 0.7, flat: false });
    handle.position.set(0, 0, -0.1);
    k.add(handle);
    // Metal blade
    const blade = box(0.035, 0.012, 0.28, "#c0c8d0", { metalness: 0.85, roughness: 0.28, flat: false });
    blade.position.set(0, 0.01, 0.12);
    k.add(blade);
    // Burnt / black staining on tip
    const tip = box(0.038, 0.014, 0.08, "#1a1208", { metalness: 0.4, roughness: 0.9, flat: false });
    tip.position.set(0, 0.012, 0.28);
    k.add(tip);
    const tipGlow = box(0.03, 0.01, 0.05, "#3a2010", {
      emissive: "#ff6622",
      emissiveIntensity: 0.45,
      metalness: 0.3,
      roughness: 0.8,
      flat: false,
    });
    tipGlow.position.set(0, 0.018, 0.3);
    k.add(tipGlow);
    k.position.x = x;
    return k;
  }
  const left = oneKnife(-0.06);
  const right = oneKnife(0.06);
  left.rotation.z = 0.15;
  right.rotation.z = -0.15;
  g.add(left);
  g.add(right);
  g.userData.left = left;
  g.userData.right = right;
  return g;
}

/** Simple smoke puff particles (billboards) */
function createSmokePuff() {
  const g = new THREE.Group();
  const mats = [];
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 6, 5),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.08, 0.05, 0.45 + Math.random() * 0.2),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      })
    );
    m.position.set((Math.random() - 0.5) * 0.15, Math.random() * 0.1, (Math.random() - 0.5) * 0.15);
    g.add(m);
    mats.push(m);
  }
  g.userData.puffs = mats;
  g.visible = false;
  return g;
}

function createFoldingChair() {
  const g = new THREE.Group();
  const seat = box(0.7, 0.06, 0.7, "#8a9099", { metalness: 0.3, roughness: 0.45 });
  seat.position.y = 0.45;
  g.add(seat);
  const back = box(0.7, 0.55, 0.06, "#9ca3af", { metalness: 0.3 });
  back.position.set(0, 0.75, -0.32);
  g.add(back);
  for (const [x, z] of [
    [-0.28, -0.28],
    [0.28, -0.28],
    [-0.28, 0.28],
    [0.28, 0.28],
  ]) {
    const leg = cyl(0.03, 0.03, 0.45, "#6b7280", { seg: 5, metalness: 0.5 });
    leg.position.set(x, 0.22, z);
    g.add(leg);
  }
  return g;
}

function createCardTable() {
  const g = new THREE.Group();
  const vinylTex = makeVinylTableTexture();

  // Patterned vinyl top (beige-brown, NOT green felt)
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.06, 2.4),
    new THREE.MeshStandardMaterial({
      map: vinylTex,
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.08,
      flatShading: false,
    })
  );
  top.position.y = 0.78;
  top.castShadow = true;
  top.receiveShadow = true;
  g.add(top);

  // Aluminum edge band
  const rim = box(2.52, 0.09, 2.52, "#b8c0c8", { metalness: 0.75, roughness: 0.35, flat: false });
  rim.position.y = 0.74;
  g.add(rim);
  const innerRim = box(2.42, 0.02, 2.42, "#8a9299", { metalness: 0.6, roughness: 0.4 });
  innerRim.position.y = 0.81;
  g.add(innerRim);

  // Folding metal legs (X-brace vibe)
  for (const [x, z] of [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, 1.0],
  ]) {
    const leg = cyl(0.035, 0.04, 0.74, "#6b7280", { seg: 6, metalness: 0.7, roughness: 0.4 });
    leg.position.set(x, 0.36, z);
    g.add(leg);
    const foot = box(0.12, 0.03, 0.12, "#4b5563", { metalness: 0.5 });
    foot.position.set(x, 0.02, z);
    g.add(foot);
  }
  // Cross braces
  const brace1 = box(2.0, 0.03, 0.04, "#9ca3af", { metalness: 0.55 });
  brace1.position.set(0, 0.35, 0);
  brace1.rotation.y = 45 * DEG;
  g.add(brace1);
  const brace2 = box(2.0, 0.03, 0.04, "#9ca3af", { metalness: 0.55 });
  brace2.position.set(0, 0.32, 0);
  brace2.rotation.y = -45 * DEG;
  g.add(brace2);

  // Raised burn bumps (geometry)
  for (const [bx, bz] of [
    [-0.6, 0.5],
    [0.7, -0.4],
    [-0.3, -0.7],
  ]) {
    const burn = cyl(0.04, 0.05, 0.015, "#2a1810", { seg: 6, roughness: 1 });
    burn.position.set(bx, 0.82, bz);
    g.add(burn);
  }

  return g;
}

function createAshtray() {
  const g = new THREE.Group();
  const dish = cyl(0.14, 0.12, 0.04, "#666666", { seg: 10, metalness: 0.4 });
  g.add(dish);
  for (let i = 0; i < 4; i++) {
    const butt = cyl(0.015, 0.015, 0.08, "#d4c4a8", { seg: 5 });
    butt.rotation.z = 70 * DEG;
    butt.position.set(Math.cos(i * 1.5) * 0.06, 0.04, Math.sin(i * 1.5) * 0.06);
    g.add(butt);
  }
  return g;
}

function createMapleHanging() {
  const g = new THREE.Group();
  const frame = box(1.1, 0.9, 0.06, "#6b2b2b");
  g.add(frame);
  const knit = box(0.95, 0.75, 0.04, "#f5e6d3");
  knit.position.z = 0.02;
  g.add(knit);
  const leafMat = mat("#c81e1e");
  const leaf = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), leafMat);
  leaf.position.set(0, 0.05, 0.06);
  leaf.rotation.z = 20 * DEG;
  g.add(leaf);
  const stem = box(0.04, 0.2, 0.03, "#8b1a1a");
  stem.position.set(0, -0.2, 0.06);
  g.add(stem);
  return g;
}

function createCRT(tvCanvas) {
  const g = new THREE.Group();
  const body = box(1.15, 0.85, 0.7, "#1a1a1a", { roughness: 0.5 });
  g.add(body);
  const bezel = box(0.95, 0.65, 0.08, "#111");
  bezel.position.set(0, 0.05, 0.38);
  g.add(bezel);
  const screenMat = new THREE.MeshBasicMaterial({ map: tvCanvas });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), screenMat);
  screen.position.set(0, 0.05, 0.43);
  g.add(screen);
  for (const sx of [-0.15, 0.15]) {
    const ant = cyl(0.01, 0.01, 0.5, "#888", { seg: 4, metalness: 0.7 });
    ant.position.set(sx, 0.65, -0.1);
    ant.rotation.z = sx * 25 * DEG;
    g.add(ant);
  }
  g.userData.screenMat = screenMat;
  return g;
}

function makeTVTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  function draw(flash) {
    ctx.fillStyle = "#0b1a12";
    ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = "#c8d8e8";
    ctx.fillRect(20, 40, 216, 70);
    ctx.fillStyle = "#c81e1e";
    ctx.fillRect(30, 50, 60, 36);
    ctx.fillStyle = "#1e4a8c";
    ctx.fillRect(166, 50, 60, 36);
    ctx.fillStyle = flash ? "#ffffff" : "#e2e8f0";
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "center";
    ctx.fillText("HNIC", 128, 130);
    ctx.fillStyle = "#ff6b6b";
    ctx.font = "14px sans-serif";
    ctx.fillText("CAN losing again", 128, 150);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px monospace";
    ctx.fillText("CAN 1", 60, 74);
    ctx.fillText("USA 4", 196, 74);
    tex.needsUpdate = true;
  }
  draw(false);
  return { canvas: c, texture: tex, draw };
}

function createRoom() {
  const room = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    mat("#6b3f2a", { flat: false, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  for (let i = -5; i <= 5; i++) {
    const strip = box(11.5, 0.01, 0.08, i % 2 === 0 ? "#5a3422" : "#7a4a32", { flat: false });
    strip.position.set(0, 0.01, i * 0.55);
    strip.receiveShadow = true;
    room.add(strip);
  }

  const wallMat = mat("#5c4030", { flat: false, roughness: 0.8 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), wallMat);
  back.position.set(0, 2.25, -4.5);
  back.receiveShadow = true;
  room.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), wallMat.clone());
  left.position.set(-6, 2.25, 0);
  left.rotation.y = Math.PI / 2;
  left.receiveShadow = true;
  room.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), wallMat.clone());
  right.position.set(6, 2.25, 0);
  right.rotation.y = -Math.PI / 2;
  right.receiveShadow = true;
  room.add(right);

  for (let i = -5; i <= 5; i++) {
    const panel = box(0.04, 4.2, 0.02, "#4a3524");
    panel.position.set(i * 1.05, 2.1, -4.48);
    room.add(panel);
  }

  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    mat("#d4c4a8", { flat: false, roughness: 0.9 })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 4.4;
  room.add(ceil);

  const doorFrame = box(1.4, 2.4, 0.15, "#3d2c1e");
  doorFrame.position.set(-3.8, 1.2, -4.4);
  room.add(doorFrame);
  const doorHole = box(1.15, 2.15, 0.2, "#1a120c");
  doorHole.position.set(-3.8, 1.1, -4.35);
  room.add(doorHole);
  const glow = box(1.1, 2.1, 0.05, "#ffcc88", {
    emissive: "#ff9944",
    emissiveIntensity: 0.35,
    flat: false,
  });
  glow.position.set(-3.8, 1.1, -4.5);
  room.add(glow);

  return room;
}

function createTableCardMesh() {
  const geo = new THREE.BoxGeometry(0.40, 0.012, 0.56);
  const backMat = new THREE.MeshStandardMaterial({
    color: "#1e3a5f",
    roughness: 0.6,
    flatShading: false,
  });
  const faceMat = new THREE.MeshStandardMaterial({
    color: "#f8f5ef",
    roughness: 0.55,
    flatShading: false,
  });
  const mats = [backMat, backMat, faceMat, backMat, backMat, backMat];
  // Box faces: +x -x +y -y +z -z — use +y as face
  const m = new THREE.Mesh(geo, [
    backMat.clone(),
    backMat.clone(),
    faceMat,
    backMat.clone(),
    backMat.clone(),
    backMat.clone(),
  ]);
  m.castShadow = true;
  m.visible = false;
  m.userData.faceMat = faceMat;
  return m;
}

/**
 * Build full SNC 3D scene into container.
 */
export function createSNCScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a120c");
  scene.fog = new THREE.Fog("#1a120c", 12, 24);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 50);
  // Higher / more top-down-oblique so table + upcard + tricks read clearly; faces still visible
  const DEFAULT_CAM = { x: 0.15, y: 5.2, z: 4.6 };
  const DEFAULT_TARGET = { x: 0, y: 0.85, z: 0.15 };
  camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 9.5;
  controls.minPolarAngle = 18 * DEG;
  controls.maxPolarAngle = 72 * DEG;
  controls.minAzimuthAngle = -110 * DEG;
  controls.maxAzimuthAngle = 110 * DEG;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.7;
  controls.update();

  // Lights
  const hemi = new THREE.HemisphereLight(0xffe8d0, 0x3a2a1a, 0.55);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0dd, 1.15);
  key.position.set(2.5, 6, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  scene.add(key);
  const fill = new THREE.PointLight(0xffaa66, 0.55, 12);
  fill.position.set(-2, 2.5, 1.5);
  scene.add(fill);
  const lamp = new THREE.PointLight(0xffd090, 0.4, 8);
  lamp.position.set(2.5, 2.8, -2);
  scene.add(lamp);

  const room = createRoom();
  scene.add(room);

  const table = createCardTable();
  table.position.set(0, 0, 0);
  scene.add(table);

  const seatLayouts = [
    { pos: [0, 0, 1.45], rotY: Math.PI, name: "You" },
    { pos: [-1.45, 0, 0], rotY: Math.PI / 2, name: "Chad" },
    { pos: [0, 0, -1.45], rotY: 0, name: "Doug" },
    { pos: [1.45, 0, 0], rotY: -Math.PI / 2, name: "Brad" },
  ];
  const chairs = seatLayouts.map((s) => {
    const ch = createFoldingChair();
    ch.position.set(s.pos[0], s.pos[1], s.pos[2]);
    ch.rotation.y = s.rotY;
    scene.add(ch);
    return ch;
  });

  const CHAR_PRESETS = {
    youHoser: {
      name: "You",
      isYou: true,
      shirt: "#b91c1c",
      accent: "#ffffff",
      emblem: "#ffffff",
      pants: "#1e293b",
      hair: "#2c1810",
      mullet: true,
      sideburns: true,
      holdBeer: true,
      labelColor: "#ffd166",
      skin: "#e8c4a8",
      eyeColor: "#1a3a2a",
      stubble: "#4a3a28",
      noseTint: "#d4a88a",
      cheekLift: 0.05,
    },
    youYank: {
      name: "You",
      isYou: true,
      shirt: "#1d4ed8",
      accent: "#ef4444",
      emblem: "#ffffff",
      pants: "#111827",
      hair: "#c4a574",
      mullet: false,
      sideburns: true,
      holdBeer: true,
      labelColor: "#ffd166",
      skin: "#f0d0b0",
      eyeColor: "#1e3a5f",
      angryBrows: true,
      brow: "#8a6a40",
      stubble: "#a08060",
      noseTint: "#e8b898",
      cheekLift: 0.06,
    },
    chad: {
      name: "Chad",
      shirt: "#1d4ed8",
      accent: "#ef4444",
      emblem: "#ffffff",
      pants: "#111827",
      hair: "#c4a574",
      mullet: false,
      sideburns: true,
      holdBeer: true,
      labelColor: "#60a5fa",
      skin: "#f0d0b0",
      eyeColor: "#1e3a5f",
      angryBrows: true,
      brow: "#8a6a40",
      stubble: "#a08060",
      noseTint: "#e8b898",
    },
    doug: {
      name: "Doug",
      shirt: "#a16207",
      accent: "#fde68a",
      emblem: "#c81e1e",
      pants: "#3f3f46",
      hair: "#1a1208",
      mullet: true,
      sideburns: true,
      beard: true,
      holdBeer: true,
      labelColor: "#fda4af",
      skin: "#d4a574",
      eyeColor: "#3a2818",
      stubble: "#2a1810",
      noseTint: "#c4946a",
      lipColor: "#6b3030",
      cheekLift: 0.02,
    },
    brad: {
      name: "Brad",
      shirt: "#1e3a8a",
      accent: "#f8fafc",
      emblem: "#ef4444",
      pants: "#0f172a",
      hair: "#4a3728",
      mullet: false,
      sideburns: true,
      holdBeer: false,
      labelColor: "#93c5fd",
      skin: "#e8c4a8",
      eyeColor: "#2a4050",
      stubble: "#6a5040",
      noseTint: "#d8b090",
      brow: "#3a2818",
    },
    wayne: {
      name: "Wayne",
      shirt: "#9f1239",
      accent: "#fecdd3",
      emblem: "#ffffff",
      pants: "#292524",
      hair: "#3b2a1a",
      mullet: true,
      sideburns: true,
      holdBeer: true,
      labelColor: "#fda4af",
      skin: "#c9a07a",
      eyeColor: "#2a2018",
      stubble: "#3a2a1a",
      noseTint: "#b88868",
      lipColor: "#7a3030",
      cheekLift: 0.03,
    },
  };

  // Default Canadian lineup; applyLineup() rebuilds for American
  let charKeys = ["youHoser", "chad", "doug", "brad"];
  let characters = [];

  function rebuildCharacters(keys) {
    for (const ch of characters) {
      scene.remove(ch);
    }
    charKeys = keys || charKeys;
    characters = charKeys.map((key, i) => {
      const def = { ...CHAR_PRESETS[key] };
      // Always label human seat as You
      if (i === 0) {
        def.name = "You";
        def.isYou = true;
        def.labelColor = "#ffd166";
      }
      const ch = createCharacter(def);
      const layout = seatLayouts[i];
      ch.position.set(layout.pos[0] * 0.95, 0.15, layout.pos[2] * 0.95);
      // Seat 0 (You) faces table from near edge; slight yaw for readability from high cam
      ch.rotation.y =
        layout.rotY + (i === 0 ? 8 * DEG : i === 1 ? 12 * DEG : i === 2 ? 6 * DEG : -12 * DEG);
      ch.scale.setScalar(1.2);
      scene.add(ch);
      return ch;
    });
    return characters;
  }
  rebuildCharacters(charKeys);

  const ash = createAshtray();
  ash.position.set(-0.7, 0.84, 0.5);
  scene.add(ash);

  for (let i = 0; i < 5; i++) {
    const b = createStubby();
    b.position.set(-0.9 + i * 0.22, 0.84, 0.85);
    b.rotation.y = Math.random();
    scene.add(b);
  }

  const afghan = createMapleHanging();
  afghan.position.set(-1.2, 2.5, -4.4);
  scene.add(afghan);

  const tvTex = makeTVTexture();
  const crt = createCRT(tvTex.texture);
  crt.position.set(2.6, 1.2, -3.6);
  crt.rotation.y = -35 * DEG;
  scene.add(crt);

  const tvStand = box(1.3, 0.7, 0.6, "#4a3524");
  tvStand.position.set(2.6, 0.35, -3.6);
  scene.add(tvStand);

  const buddy = createCharacter({
    name: "Gary",
    shirt: "#4b5563",
    accent: "#a7f3d0",
    emblem: "#065f46",
    pants: "#374151",
    hair: "#5a4638",
    mullet: true,
    sideburns: true,
    beard: true,
    holdBeer: false,
    labelColor: "#a7f3d0",
    skin: "#c4a882",
    eyeColor: "#2a4a30",
    stubble: "#3a3020",
    noseTint: "#b8946e",
  });
  buddy.scale.setScalar(1.1);
  buddy.position.set(-3.8, 0.1, -5.2);
  buddy.visible = false;
  scene.add(buddy);

  // Hot knives prop in Gary's hands
  const knivesProp = createButterKnives();
  knivesProp.scale.setScalar(1.15);
  knivesProp.position.set(0.35, 0.95, 0.45);
  knivesProp.rotation.x = -40 * DEG;
  buddy.add(knivesProp);
  const smokePuff = createSmokePuff();
  smokePuff.position.set(0.35, 1.15, 0.55);
  buddy.add(smokePuff);
  let knivesHitT = -1;
  let smokeT = -1;

  // Trick cards (textured) + owner name tags
  const trickMeshes = [];
  const trickOwnerTags = [];
  for (let i = 0; i < 4; i++) {
    const card = createTableCardMesh();
    scene.add(card);
    trickMeshes.push(card);
    const tc = document.createElement("canvas");
    tc.width = 160;
    tc.height = 40;
    const ttex = new THREE.CanvasTexture(tc);
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.095),
      new THREE.MeshBasicMaterial({ map: ttex, transparent: true, depthWrite: false, depthTest: true })
    );
    tag.visible = false;
    tag.userData.canvas = tc;
    tag.userData.tex = ttex;
    scene.add(tag);
    trickOwnerTags.push(tag);
  }

  // Upcard on table
  const upcardMesh = createTableCardMesh();
  upcardMesh.position.set(0.55, 0.86, 0);
  scene.add(upcardMesh);

  // Trump indicator disc
  const trumpCanvas = document.createElement("canvas");
  trumpCanvas.width = 128;
  trumpCanvas.height = 128;
  const trumpCtx = trumpCanvas.getContext("2d");
  const trumpTex = new THREE.CanvasTexture(trumpCanvas);
  trumpTex.colorSpace = THREE.SRGBColorSpace;
  const trumpMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.22, 24),
    new THREE.MeshBasicMaterial({ map: trumpTex, transparent: true, side: THREE.DoubleSide })
  );
  trumpMesh.rotation.x = -Math.PI / 2;
  trumpMesh.position.set(-0.55, 0.86, 0);
  trumpMesh.visible = false;
  scene.add(trumpMesh);

  function drawTrumpIndicator(suit) {
    const sym = { S: "♠", H: "♥", D: "♦", C: "♣" }[suit] || "?";
    const red = suit === "H" || suit === "D";
    trumpCtx.clearRect(0, 0, 128, 128);
    trumpCtx.fillStyle = "rgba(20,16,10,0.85)";
    trumpCtx.beginPath();
    trumpCtx.arc(64, 64, 60, 0, Math.PI * 2);
    trumpCtx.fill();
    trumpCtx.strokeStyle = "#ffd166";
    trumpCtx.lineWidth = 4;
    trumpCtx.stroke();
    trumpCtx.fillStyle = red ? "#ff6b6b" : "#e8eef6";
    trumpCtx.font = "bold 64px Segoe UI, sans-serif";
    trumpCtx.textAlign = "center";
    trumpCtx.textBaseline = "middle";
    trumpCtx.fillText(sym, 64, 58);
    trumpCtx.fillStyle = "#ffd166";
    trumpCtx.font = "bold 14px sans-serif";
    trumpCtx.fillText("TRUMP", 64, 100);
    trumpTex.needsUpdate = true;
  }

  // Deal animation flying cards
  const dealCards = [];
  const cardBackTex = makeCardBackTexture();
  for (let i = 0; i < 20; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.4),
      new THREE.MeshBasicMaterial({ map: cardBackTex, side: THREE.DoubleSide })
    );
    m.visible = false;
    scene.add(m);
    dealCards.push(m);
  }
  let dealAnimT = -1;
  let dealFrom = null;

  let woozy = 0;
  let knivesProgress = -1;
  let tvFlash = 0;
  const clock = { t: 0 };
  let talkingSeat = -1;
  let talkingUntil = 0;

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener("resize", resize);

  function spawnKnivesBuddy(show) {
    if (show) {
      buddy.visible = true;
      knivesProgress = 0;
      buddy.position.set(-3.8, 0.1, -4.8);
    } else {
      knivesProgress = -1;
      setTimeout(() => {
        if (knivesProgress < 0) buddy.visible = false;
      }, 2000);
    }
  }

  function setWoozy(v) {
    woozy = v;
  }
  function flashTV() {
    tvFlash = 0.6;
    tvTex.draw(true);
  }

  function setCardFace(mesh, card) {
    if (!card) {
      mesh.visible = false;
      return;
    }
    const tex = makeCardFaceTexture(card);
    if (mesh.userData.faceMat) {
      if (mesh.userData.faceMat.map) mesh.userData.faceMat.map.dispose();
      mesh.userData.faceMat.map = tex;
      mesh.userData.faceMat.color.set("#ffffff");
      mesh.userData.faceMat.needsUpdate = true;
    }
    mesh.visible = true;
  }

  function updateTrickVisual(trick, names) {
    // Card centers slightly in from seats; name chips OUTSIDE so they never cover rank/suit
    const offsets = [
      [0, 0.48],
      [-0.48, 0],
      [0, -0.48],
      [0.48, 0],
    ];
    // Chip sits below/beside card, pushed further from table center
    const tagOff = [
      [0, 0.82],
      [-0.82, 0],
      [0, -0.82],
      [0.82, 0],
    ];
    const nameList = names || ["You", "Chad", "Doug", "Brad"];
    for (let i = 0; i < 4; i++) {
      const m = trickMeshes[i];
      const tag = trickOwnerTags[i];
      if (trick && i < trick.length) {
        setCardFace(m, trick[i].card);
        const seat = trick[i].seat;
        const [ox, oz] = offsets[seat];
        m.position.set(ox, 0.87 + i * 0.012, oz);
        m.rotation.set(0, (seat * Math.PI) / 2 + 0.06, 0);
        const ctx = tag.userData.canvas.getContext("2d");
        ctx.clearRect(0, 0, 160, 40);
        // Pill chip under card
        ctx.fillStyle = "rgba(8,10,16,0.82)";
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(8, 6, 144, 28, 10);
          ctx.fill();
        } else {
          ctx.fillRect(8, 6, 144, 28);
        }
        ctx.fillStyle = seat === 0 ? "#ffd166" : "#e8eef6";
        ctx.font = "bold 20px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(nameList[seat] || ("P" + seat), 80, 20);
        tag.userData.tex.needsUpdate = true;
        const [tx, tz] = tagOff[seat];
        // Slightly above table, OUTSIDE card — never on face
        tag.position.set(tx, 0.92, tz);
        tag.quaternion.copy(camera.quaternion);
        tag.visible = true;
      } else {
        m.visible = false;
        tag.visible = false;
      }
    }
  }

  function updateUpcaryVisual(upcard, phase) {
    if (upcard && (phase === "bid1" || phase === "bid2" || phase === "deal")) {
      setCardFace(upcardMesh, upcard);
      upcardMesh.position.set(0.15, 0.86, 0.05);
      upcardMesh.rotation.set(0, 0.2, 0);
    } else {
      upcardMesh.visible = false;
    }
  }

  function updateTrumpVisual(trump) {
    if (trump) {
      drawTrumpIndicator(trump);
      trumpMesh.visible = true;
    } else {
      trumpMesh.visible = false;
    }
  }

  function playDealAnimation() {
    dealAnimT = 0;
    dealFrom = new THREE.Vector3(0, 1.2, 0);
  }

  function setTalking(seat, duration = 1.2) {
    talkingSeat = seat;
    talkingUntil = clock.t + duration;
    if (characters[seat]) characters[seat].userData.talkUntil = clock.t + duration;
  }

  function showSpeechBubble(seat, text, duration = 1.1) {
    const ch = characters[seat];
    if (!ch) return;
    const ud = ch.userData;
    const ctx = ud.bubbleCanvas.getContext("2d");
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "rgba(8,10,16,0.9)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(16, 18, 224, 56, 10);
    else ctx.rect(16, 18, 224, 56);
    ctx.fill();
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#e8eef6";
    ctx.font = "bold 26px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.slice(0, 12), 128, 46);
    ud.bubbleTex.needsUpdate = true;
    ud.bubble.visible = true;
    ud.bubbleUntil = clock.t + Math.min(duration, 1.2);
  }

  function trumpReactionVisual(info) {
    // Brief character bubbles ONLY (≤1.2s) — never giant center cards
    const teams = (lastGameState && lastGameState.lineup && lastGameState.lineup.team) || [0, 1, 0, 1];
    for (let i = 0; i < characters.length; i++) {
      const isHoser = teams[i] === 0;
      const line = isHoser ? "BOO!" : "YAY!";
      showSpeechBubble(i, line, 1.1);
      characters[i].userData.talkUntil = clock.t + 1.0;
    }
  }

  function highlightTurn(seat) {
    for (let i = 0; i < characters.length; i++) {
      const ud = characters[i].userData;
      const ring = ud.ring;
      if (ring) ring.visible = seat === i;
      // Dim others when it's YOURturn
      const yourTurn = seat === 0;
      ud.dimmed = yourTurn && i !== 0;
      characters[i].traverse((obj) => {
        if (obj.isMesh && obj.material && obj.material.opacity !== undefined) {
          // skip labels/bubbles
        }
      });
      if (ud.dimmed) {
        ud.baseScale = 1.1;
      } else if (i === 0 && yourTurn) {
        ud.baseScale = 1.3;
      } else {
        ud.baseScale = 1.2;
      }
    }
  }

  function playKnivesHit() {
    knivesHitT = 0;
    smokeT = 0;
    smokePuff.visible = true;
    for (const p of smokePuff.userData.puffs) {
      p.position.set((Math.random() - 0.5) * 0.1, Math.random() * 0.05, (Math.random() - 0.5) * 0.1);
      p.material.opacity = 0.6;
      p.scale.setScalar(0.6 + Math.random() * 0.4);
    }
    // Mime: raise knives together
    if (buddy.userData.arms) {
      buddy.userData.knivesMime = 1.2;
    }
    buddy.userData.talkUntil = clock.t + 1.5;
    showSpeechBubbleOn(buddy, "tsss…", 1.5);
  }

  function showSpeechBubbleOn(ch, text, duration = 1.5) {
    const ud = ch.userData;
    if (!ud.bubbleCanvas) return;
    const ctx = ud.bubbleCanvas.getContext("2d");
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "rgba(6,40,30,0.9)";
    ctx.fillRect(8, 8, 240, 70);
    ctx.fillStyle = "#a7f3d0";
    ctx.font = "bold 24px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, 128, 52);
    ud.bubbleTex.needsUpdate = true;
    ud.bubble.visible = true;
    ud.bubbleUntil = clock.t + duration;
  }

  function applyLineup(lineup) {
    if (!lineup || !lineup.charKeys) return;
    rebuildCharacters(lineup.charKeys);
  }

  let lastGameState = null;

  function resetView() {
    camera.position.set(DEFAULT_CAM.x, DEFAULT_CAM.y, DEFAULT_CAM.z);
    controls.target.set(DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z);
    controls.update();
  }

  function animateCharacter(ch, dt, lookAtTable) {
    const ud = ch.userData;
    ud.breathPhase += dt * 1.6;
    ud.headPhase += dt * 0.7;
    ud.beerPhase += dt * 0.45;
    const breath = Math.sin(ud.breathPhase) * 0.012;
    const baseScale = ud.baseScale || (ch === buddy ? 1.1 : 1.2);
    const s = baseScale * (1 + breath);
    ch.scale.set(baseScale, s, baseScale);

    // Blink
    ud.blinkTimer -= dt;
    if (ud.blinkTimer <= 0) {
      ud.blinkTimer = 2 + Math.random() * 4;
      ud._blinking = 0.12;
    }
    if (ud._blinking > 0) {
      ud._blinking -= dt;
      for (const e of ud.eyes || []) {
        if (e.lid) e.lid.visible = ud._blinking > 0.04;
      }
    } else {
      for (const e of ud.eyes || []) {
        if (e.lid) e.lid.visible = false;
      }
    }

    // Talk
    const talking = clock.t < (ud.talkUntil || 0);
    if (ud.mouth && ud.mouthOpen) {
      const open = talking && Math.sin(clock.t * 14) > 0;
      ud.mouth.visible = !open;
      ud.mouthOpen.visible = open;
    }

    if (ud.headGroup) {
      let hy = Math.sin(ud.headPhase) * 0.1;
      let hx = Math.sin(ud.headPhase * 0.5) * 0.05;
      // Look down at table / upcard
      if (lookAtTable) {
        hx = 0.22 + Math.sin(ud.headPhase) * 0.04;
        hy *= 0.4;
      }
      ud.headGroup.rotation.y = hy;
      ud.headGroup.rotation.x = hx;
    }

    if (ud.beerHand && ud.stubby && ud.stubby.visible) {
      const lift = Math.max(0, Math.sin(ud.beerPhase)) * 0.35;
      ud.beerHand.position.y = 0.52 + lift * 0.4;
      ud.beerHand.rotation.x = -lift * 0.8;
    }
    // World-space billboard (parent seats are rotated — raw camera quat flips text)
    const _pq = ud._billboardParentQ || (ud._billboardParentQ = new THREE.Quaternion());
    if (ud.label) {
      ch.getWorldQuaternion(_pq);
      ud.label.quaternion.copy(_pq).invert().multiply(camera.quaternion);
    }
    if (ud.bubble) {
      ch.getWorldQuaternion(_pq);
      ud.bubble.quaternion.copy(_pq).invert().multiply(camera.quaternion);
      if (clock.t > (ud.bubbleUntil || 0)) ud.bubble.visible = false;
    }
    if (ud.ring && ud.ring.visible) {
      ud.ring.rotation.z = clock.t * 1.5;
    }
    if (ud.youGlow) {
      ud.youGlow.rotation.z = clock.t * 1.2;
      ud.youGlow.material.opacity = 0.55 + Math.sin(clock.t * 3) * 0.25;
    }
    if (ud.youArrow) {
      // Keep small; hide once cards are in play so it never covers table center
      const hideArrow = lastGameState && (lastGameState.phase === "play" || lastGameState.phase === "discard" || lastGameState.phase === "bid1" || lastGameState.phase === "bid2");
      ud.youArrow.visible = !hideArrow;
      ud.youArrow.position.y = 2.35 + Math.sin(clock.t * 4) * 0.06;
      ud.youArrow.rotation.set(Math.PI, 0, 0);
    }
    if (ud.youGlow && lastGameState && lastGameState.phase === "discard") {
      // Shrink identity glow during bury so table stays clean
      ud.youGlow.material.opacity = 0.25;
    }
    if (ud.dimmed) {
      ch.position.y = 0.12;
    } else {
      ch.position.y = 0.15;
    }
  }

  function update(dt, gameState) {
    clock.t += dt;
    controls.update();

    // Clamp camera inside room roughly
    const p = camera.position;
    p.x = THREE.MathUtils.clamp(p.x, -5.2, 5.2);
    p.z = THREE.MathUtils.clamp(p.z, -3.8, 5.2);
    p.y = THREE.MathUtils.clamp(p.y, 1.8, 6.5);

    const lookTable =
      gameState &&
      (gameState.phase === "bid1" ||
        gameState.phase === "bid2" ||
        gameState.phase === "deal" ||
        gameState.phase === "play");

    for (const ch of characters) {
      animateCharacter(ch, dt, lookTable);
    }

    if (gameState) {
      lastGameState = gameState;
      highlightTurn(
        gameState.phase === "play" || gameState.phase === "bid1" || gameState.phase === "bid2" || gameState.phase === "discard"
          ? gameState.turn
          : -1
      );
      const names = (gameState.lineup && gameState.lineup.names) || null;
      updateTrickVisual(gameState.trick || [], names);
      updateUpcaryVisual(gameState.upcard, gameState.phase);
      updateTrumpVisual(gameState.trump);

      // Trigger deal anim when dealAnim just started
      if (gameState.dealAnim && gameState.dealAnim > 1.0 && dealAnimT < 0) {
        playDealAnimation();
      }
      if (gameState.dealAnim <= 0) dealAnimT = -1;
    }

    // Deal fly animation
    if (dealAnimT >= 0) {
      dealAnimT += dt;
      const seatTargets = [
        new THREE.Vector3(0, 1.0, 1.1),
        new THREE.Vector3(-1.1, 1.0, 0),
        new THREE.Vector3(0, 1.0, -1.1),
        new THREE.Vector3(1.1, 1.0, 0),
      ];
      for (let i = 0; i < dealCards.length; i++) {
        const seat = i % 4;
        const round = (i / 4) | 0;
        const startT = round * 0.12 + seat * 0.03;
        const local = dealAnimT - startT;
        const m = dealCards[i];
        if (local < 0 || local > 0.55) {
          m.visible = local >= 0 && local < 0.65;
          if (local > 0.65) m.visible = false;
          continue;
        }
        m.visible = true;
        const t = Math.min(1, local / 0.45);
        const ease = t * t * (3 - 2 * t);
        const from = dealFrom || new THREE.Vector3(0, 1.2, 0);
        const to = seatTargets[seat];
        m.position.lerpVectors(from, to, ease);
        m.position.y += Math.sin(ease * Math.PI) * 0.5;
        m.rotation.y = ease * Math.PI * 2;
        m.rotation.x = ease * 0.5;
      }
      if (dealAnimT > 1.4) {
        dealAnimT = -1;
        for (const m of dealCards) m.visible = false;
      }
    }

    // Buddy walk-in
    if (knivesProgress >= 0) {
      knivesProgress += dt * 0.35;
      const t = Math.min(1, knivesProgress);
      buddy.position.lerpVectors(
        new THREE.Vector3(-3.8, 0.1, -4.6),
        new THREE.Vector3(-2.2, 0.1, -0.8),
        t
      );
      buddy.lookAt(0, 1.2, 0);
      buddy.visible = true;
      animateCharacter(buddy, dt, false);
      // Knives mime: clap tips together
      if (knivesHitT >= 0) {
        knivesHitT += dt;
        const k = Math.min(1, knivesHitT / 0.35);
        if (knivesProp.userData.left && knivesProp.userData.right) {
          knivesProp.userData.left.rotation.z = 0.15 - k * 0.35;
          knivesProp.userData.right.rotation.z = -0.15 + k * 0.35;
          knivesProp.position.y = 0.95 + Math.sin(k * Math.PI) * 0.25;
        }
        if (knivesHitT > 1.2) {
          knivesHitT = -1;
          if (knivesProp.userData.left) knivesProp.userData.left.rotation.z = 0.15;
          if (knivesProp.userData.right) knivesProp.userData.right.rotation.z = -0.15;
          knivesProp.position.y = 0.95;
        }
      }
      if (smokeT >= 0) {
        smokeT += dt;
        smokePuff.visible = true;
        for (const p of smokePuff.userData.puffs) {
          p.position.y += dt * 0.55;
          p.position.x += (Math.random() - 0.5) * dt * 0.3;
          p.material.opacity = Math.max(0, 0.55 - smokeT * 0.4);
          p.scale.multiplyScalar(1 + dt * 0.8);
        }
        if (smokeT > 1.4) {
          smokeT = -1;
          smokePuff.visible = false;
        }
      }
      if (knivesProgress > 3.5) {
        const back = Math.min(1, (knivesProgress - 3.5) / 1.2);
        buddy.position.lerpVectors(
          new THREE.Vector3(-2.2, 0.1, -0.8),
          new THREE.Vector3(-3.8, 0.1, -4.8),
          back
        );
        if (back >= 1) {
          buddy.visible = false;
          knivesProgress = -1;
        }
      }
    }

    if (tvFlash > 0) {
      tvFlash -= dt;
      if (tvFlash <= 0) tvTex.draw(false);
    }

    if (woozy > 0) {
      camera.rotation.z = Math.sin(clock.t * 3) * 0.06 * Math.min(1, woozy);
      renderer.domElement.style.filter = `hue-rotate(${woozy * 25}deg) saturate(${1 + woozy * 0.3})`;
    } else {
      camera.rotation.z = 0;
      renderer.domElement.style.filter = "";
    }

    renderer.render(scene, camera);
  }

  function dispose() {
    window.removeEventListener("resize", resize);
    controls.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  return {
    get characters() { return characters; },
    renderer,
    scene,
    camera,
    controls,
    chairs,
    buddy,
    knivesProp,
    update,
    setWoozy,
    spawnKnivesBuddy,
    playKnivesHit,
    flashTV,
    updateTrickVisual,
    playDealAnimation,
    setTalking,
    showSpeechBubble,
    trumpReactionVisual,
    highlightTurn,
    applyLineup,
    resetView,
    resize,
    dispose,
  };
}

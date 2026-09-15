/** Three.js apartment + large low-poly hosers for Saturday Night Canada */
import * as THREE from "three";

const DEG = Math.PI / 180;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.75,
    metalness: opts.metalness ?? 0.05,
    flatShading: opts.flat ?? true,
    emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rTop, rBot, h, color, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, opts?.seg ?? 8), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function sphere(r, color, opts) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, opts?.seg ?? 10, opts?.segY ?? 8), mat(color, opts));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Stylized 1970s low-poly seated character — LARGE, readable face */
export function createCharacter(cfg) {
  const root = new THREE.Group();
  root.name = cfg.name;

  const skin = cfg.skin || "#e8c4a8";
  const hair = cfg.hair || "#3b2a1a";
  const shirt = cfg.shirt || "#c81e1e";
  const pants = cfg.pants || "#2a3548";
  const accent = cfg.accent || "#ffffff";

  // Torso (chunky)
  const torso = box(0.72, 0.85, 0.45, shirt);
  torso.position.y = 0.95;
  root.add(torso);

  // Jersey stripe / number plate
  const stripe = box(0.74, 0.12, 0.46, accent, { roughness: 0.6 });
  stripe.position.set(0, 1.05, 0);
  root.add(stripe);

  // Chest emblem (maple or USA-ish)
  const emblem = box(0.22, 0.22, 0.06, cfg.emblem || "#ffffff");
  emblem.position.set(0, 0.95, 0.22);
  root.add(emblem);

  // Head
  const head = sphere(0.32, skin, { seg: 12, segY: 10 });
  head.position.y = 1.72;
  head.scale.set(1, 1.05, 0.95);
  root.add(head);

  // 1970s hair volume
  const hairCap = sphere(0.34, hair, { seg: 10, segY: 8 });
  hairCap.position.set(0, 1.82, -0.02);
  hairCap.scale.set(1.05, 0.85, 1.1);
  root.add(hairCap);
  if (cfg.mullet) {
    const mullet = box(0.28, 0.35, 0.18, hair);
    mullet.position.set(0, 1.55, -0.28);
    root.add(mullet);
  }
  if (cfg.sideburns) {
    for (const sx of [-0.28, 0.28]) {
      const sb = box(0.08, 0.22, 0.1, hair);
      sb.position.set(sx, 1.62, 0.05);
      root.add(sb);
    }
  }

  // Face features
  const brow = box(0.28, 0.04, 0.06, hair);
  brow.position.set(0, 1.78, 0.28);
  root.add(brow);
  for (const ex of [-0.1, 0.1]) {
    const eyeW = box(0.09, 0.06, 0.04, "#f8f8f8");
    eyeW.position.set(ex, 1.72, 0.30);
    root.add(eyeW);
    const pupil = box(0.04, 0.04, 0.03, "#1a1a1a");
    pupil.position.set(ex, 1.72, 0.33);
    root.add(pupil);
  }
  // Nose
  const nose = box(0.06, 0.08, 0.08, "#d4a88a");
  nose.position.set(0, 1.66, 0.34);
  root.add(nose);
  // Stubble
  const stubble = box(0.28, 0.12, 0.06, "#5a4638", { roughness: 1 });
  stubble.position.set(0, 1.55, 0.30);
  root.add(stubble);
  // Mouth
  const mouth = box(0.14, 0.03, 0.04, "#6b3a3a");
  mouth.position.set(0, 1.52, 0.33);
  root.add(mouth);

  // Arms
  const arms = new THREE.Group();
  for (const side of [-1, 1]) {
    const upper = cyl(0.09, 0.1, 0.55, shirt, { seg: 6 });
    upper.position.set(side * 0.48, 1.15, 0.05);
    upper.rotation.z = side * 25 * DEG;
    upper.rotation.x = 40 * DEG;
    arms.add(upper);
    const forearm = cyl(0.08, 0.09, 0.45, skin, { seg: 6 });
    forearm.position.set(side * 0.55, 0.78, 0.28);
    forearm.rotation.x = -50 * DEG;
    arms.add(forearm);
    const hand = sphere(0.09, skin, { seg: 6 });
    hand.position.set(side * 0.52, 0.58, 0.42);
    arms.add(hand);
  }
  root.add(arms);

  // Beer-holding arm reference (right hand)
  const beerHand = new THREE.Group();
  beerHand.position.set(0.52, 0.58, 0.42);
  root.add(beerHand);
  const stubby = createStubby();
  stubby.scale.setScalar(0.85);
  stubby.visible = !!cfg.holdBeer;
  beerHand.add(stubby);

  // Seated pelvis / legs
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

  // Name label sprite-ish (simple plane)
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = cfg.labelColor || "#ffd166";
  ctx.font = "bold 28px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(cfg.name.toUpperCase(), 128, 42);
  const tex = new THREE.CanvasTexture(canvas);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.22),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  label.position.set(0, 2.15, 0);
  root.add(label);

  root.userData = {
    head,
    arms,
    beerHand,
    stubby,
    label,
    breathPhase: Math.random() * Math.PI * 2,
    headPhase: Math.random() * Math.PI * 2,
    beerPhase: Math.random() * Math.PI * 2,
    baseY: 0,
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

function createFoldingChair() {
  const g = new THREE.Group();
  const seat = box(0.7, 0.06, 0.7, "#8a9099", { metalness: 0.3, roughness: 0.45 });
  seat.position.y = 0.45;
  g.add(seat);
  const back = box(0.7, 0.55, 0.06, "#9ca3af", { metalness: 0.3 });
  back.position.set(0, 0.75, -0.32);
  g.add(back);
  for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) {
    const leg = cyl(0.03, 0.03, 0.45, "#6b7280", { seg: 5, metalness: 0.5 });
    leg.position.set(x, 0.22, z);
    g.add(leg);
  }
  return g;
}

function createCardTable() {
  const g = new THREE.Group();
  // Felt / vinyl top
  const top = box(2.4, 0.08, 2.4, "#2f5a38", { roughness: 0.85 });
  top.position.y = 0.78;
  g.add(top);
  const rim = box(2.5, 0.1, 2.5, "#1f3324");
  rim.position.y = 0.72;
  g.add(rim);
  // Vinyl sheen strip
  const sheen = box(2.2, 0.01, 0.35, "#3a6a42", { roughness: 0.4 });
  sheen.position.set(0, 0.83, -0.7);
  g.add(sheen);
  // Metal legs
  for (const [x, z] of [[-1.0, -1.0], [1.0, -1.0], [-1.0, 1.0], [1.0, 1.0]]) {
    const leg = cyl(0.04, 0.04, 0.72, "#4b5563", { seg: 6, metalness: 0.6 });
    leg.position.set(x, 0.36, z);
    g.add(leg);
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
  // Maple leaf (simple diamond cluster)
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
  // Antenna
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
    // ice rink vibe
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
    // score
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

  // Floor carpet
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    mat("#6b3f2a", { flat: false, roughness: 0.95 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  // Carpet pattern strips
  for (let i = -5; i <= 5; i++) {
    const strip = box(11.5, 0.01, 0.08, i % 2 === 0 ? "#5a3422" : "#7a4a32", { flat: false });
    strip.position.set(0, 0.01, i * 0.55);
    strip.receiveShadow = true;
    room.add(strip);
  }

  // Walls — wood panel
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

  // Wood panel lines on back wall
  for (let i = -5; i <= 5; i++) {
    const panel = box(0.04, 4.2, 0.02, "#4a3524");
    panel.position.set(i * 1.05, 2.1, -4.48);
    room.add(panel);
  }

  // Ceiling
  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    mat("#d4c4a8", { flat: false, roughness: 0.9 })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = 4.4;
  room.add(ceil);

  // Kitchen doorway (left back)
  const doorFrame = box(1.4, 2.4, 0.15, "#3d2c1e");
  doorFrame.position.set(-3.8, 1.2, -4.4);
  room.add(doorFrame);
  const doorHole = box(1.15, 2.15, 0.2, "#1a120c");
  doorHole.position.set(-3.8, 1.1, -4.35);
  room.add(doorHole);
  // Warm kitchen glow
  const glow = box(1.1, 2.1, 0.05, "#ffcc88", { emissive: "#ff9944", emissiveIntensity: 0.35, flat: false });
  glow.position.set(-3.8, 1.1, -4.5);
  room.add(glow);

  return room;
}

/**
 * Build full SNC 3D scene into container element.
 * Returns API: { renderer, scene, camera, characters, update, setWoozy, spawnKnivesBuddy, flashTV, dispose }
 */
export function createSNCScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#1a120c");
  scene.fog = new THREE.Fog("#1a120c", 10, 22);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  // Corner medium shot — You in 3/4, partners/opponents readable, fills frame
  camera.position.set(2.65, 2.55, 2.85);
  camera.lookAt(-0.15, 1.35, -0.1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

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

  // Chairs at four seats: S=You, W=Chad, N=Doug, E=Brad
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

  const charDefs = [
    {
      name: "You",
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
    },
    {
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
    },
    {
      name: "Doug",
      shirt: "#a16207",
      accent: "#fde68a",
      emblem: "#c81e1e",
      pants: "#3f3f46",
      hair: "#1a1208",
      mullet: true,
      sideburns: true,
      holdBeer: true,
      labelColor: "#fda4af",
      skin: "#d4a574",
    },
    {
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
    },
  ];

  const characters = charDefs.map((def, i) => {
    const ch = createCharacter(def);
    const layout = seatLayouts[i];
    // Sit slightly above chair, facing table
    ch.position.set(layout.pos[0] * 0.95, 0.15, layout.pos[2] * 0.95);
    // Bias You (south) a few degrees toward camera so face is readable
    ch.rotation.y = layout.rotY + (i === 0 ? 18 * DEG : i === 1 ? 8 * DEG : i === 3 ? -8 * DEG : -8 * DEG);
    ch.scale.setScalar(1.2);
    scene.add(ch);
    return ch;
  });

  // Props on / near table
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

  // Side table under TV
  const tvStand = box(1.3, 0.7, 0.6, "#4a3524");
  tvStand.position.set(2.6, 0.35, -3.6);
  scene.add(tvStand);

  // Hot knives buddy (5th character) — starts off in kitchen
  const buddy = createCharacter({
    name: "Gary",
    shirt: "#4b5563",
    accent: "#a7f3d0",
    emblem: "#065f46",
    pants: "#374151",
    hair: "#5a4638",
    mullet: true,
    sideburns: true,
    holdBeer: false,
    labelColor: "#a7f3d0",
    skin: "#c4a882",
  });
  buddy.scale.setScalar(1.1);
  buddy.position.set(-3.8, 0.1, -5.2);
  buddy.visible = false;
  scene.add(buddy);

  // Card meshes on table (trick pile placeholders)
  const trickMeshes = [];
  for (let i = 0; i < 4; i++) {
    const card = box(0.28, 0.02, 0.4, "#f8f5ef", { flat: false, roughness: 0.6 });
    card.position.set(0, 0.86 + i * 0.01, 0);
    card.visible = false;
    scene.add(card);
    trickMeshes.push(card);
  }

  let woozy = 0;
  let knivesProgress = -1; // -1 idle, 0..1 walking in, >1 hanging out
  let tvFlash = 0;
  const clock = { t: 0 };

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
      // walk back eventually
      setTimeout(() => {
        if (knivesProgress < 0) buddy.visible = false;
      }, 2000);
    }
  }

  function setWoozy(v) { woozy = v; }
  function flashTV() { tvFlash = 0.6; tvTex.draw(true); }

  function updateTrickVisual(trick) {
    const offsets = [
      [0, 0.35],   // S
      [-0.35, 0],  // W
      [0, -0.35],  // N
      [0.35, 0],   // E
    ];
    for (let i = 0; i < 4; i++) {
      const m = trickMeshes[i];
      if (i < trick.length) {
        m.visible = true;
        const seat = trick[i].seat;
        const [ox, oz] = offsets[seat];
        m.position.set(ox, 0.86 + i * 0.015, oz);
        m.rotation.y = (seat * Math.PI) / 2 + 0.1;
      } else {
        m.visible = false;
      }
    }
  }

  function update(dt, gameState) {
    clock.t += dt;

    // Idle animations
    for (const ch of characters) {
      const ud = ch.userData;
      ud.breathPhase += dt * 1.6;
      ud.headPhase += dt * 0.7;
      ud.beerPhase += dt * 0.45;
      const breath = Math.sin(ud.breathPhase) * 0.012;
      ch.scale.y = 1.2 * (1 + breath);
      if (ud.head) {
        ud.head.rotation.y = Math.sin(ud.headPhase) * 0.12;
        ud.head.rotation.z = Math.sin(ud.headPhase * 0.5) * 0.04;
      }
      if (ud.beerHand && ud.stubby) {
        const lift = Math.max(0, Math.sin(ud.beerPhase)) * 0.35;
        ud.beerHand.position.y = 0.58 + lift * 0.4;
        ud.beerHand.rotation.x = -lift * 0.8;
        ud.stubby.visible = true;
      }
      if (ud.label) ud.label.quaternion.copy(camera.quaternion);
    }

    // Buddy walk-in from kitchen
    if (knivesProgress >= 0) {
      knivesProgress += dt * 0.35;
      const t = Math.min(1, knivesProgress);
      // from doorway toward table (near Chad side)
      buddy.position.lerpVectors(
        new THREE.Vector3(-3.8, 0.1, -4.6),
        new THREE.Vector3(-2.2, 0.1, -0.8),
        t
      );
      buddy.lookAt(0, 1.2, 0);
      buddy.visible = true;
      const ud = buddy.userData;
      ud.breathPhase += dt * 2;
      buddy.scale.y = 1.1 * (1 + Math.sin(ud.breathPhase) * 0.02);
      if (ud.label) ud.label.quaternion.copy(camera.quaternion);
      if (knivesProgress > 3.5) {
        // retreat
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

    if (gameState) updateTrickVisual(gameState.trick || []);

    // Camera: slight breathing orbit + woozy tilt
    const base = new THREE.Vector3(2.65, 2.55, 2.85);
    base.x += Math.sin(clock.t * 0.15) * 0.1;
    base.y += Math.sin(clock.t * 0.22) * 0.04;
    camera.position.copy(base);
    camera.lookAt(-0.15, 1.35, -0.1);
    if (woozy > 0) {
      camera.rotation.z = Math.sin(clock.t * 3) * 0.08 * Math.min(1, woozy);
      renderer.domElement.style.filter = `hue-rotate(${woozy * 25}deg) saturate(${1 + woozy * 0.3})`;
    } else {
      camera.rotation.z = 0;
      renderer.domElement.style.filter = "";
    }

    renderer.render(scene, camera);
  }

  function dispose() {
    window.removeEventListener("resize", resize);
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  return {
    renderer,
    scene,
    camera,
    characters,
    chairs,
    buddy,
    update,
    setWoozy,
    spawnKnivesBuddy,
    flashTV,
    updateTrickVisual,
    resize,
    dispose,
  };
}

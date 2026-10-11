// Canada Simulator 3D — shared framework (original code).
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export { THREE };
export const CANADA_LOSE_MULTIPLIER = 0; // Canadian goals never count. Ever.
export const IS_TOUCH = matchMedia("(pointer:coarse)").matches || "ontouchstart" in window;
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Audio (WebAudio synth, no files) ----------
export class Sfx {
  constructor() { this.ctx = null; this.muted = localStorage.getItem("cs3d_mute") === "1"; }
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.5; this.master.connect(this.ctx.destination); } catch (e) {} }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }
  setMuted(m) { this.muted = m; localStorage.setItem("cs3d_mute", m ? "1" : "0"); if (this.master) this.master.gain.value = m ? 0 : 0.5; }
  tone(f, d = 0.15, type = "square", v = 0.2, slide = 0) {
    if (!this.ctx) return; const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g).connect(this.master); o.start(t); o.stop(t + d + 0.02);
  }
  noise(d = 0.3, freq = 1000, q = 1, v = 0.3, type = "bandpass", sweep = 0) {
    if (!this.ctx) return; const t = this.ctx.currentTime, n = Math.floor(this.ctx.sampleRate * d);
    const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = b; const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t + d);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.08, d / 3)); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f).connect(g).connect(this.master); s.start(t);
  }
  click() { this.tone(660, 0.06, "square", 0.12); }
  thud() { this.tone(120, 0.25, "sine", 0.5, -70); this.noise(0.15, 300, 1, 0.3); }
  shot() { this.noise(0.12, 2500, 2, 0.4); this.tone(900, 0.08, "triangle", 0.2, -500); }
  horn() { this.tone(220, 1.1, "sawtooth", 0.25); this.tone(277, 1.1, "sawtooth", 0.18); }
  cheer() { this.noise(1.6, 1400, 0.6, 0.35, "bandpass", 600); }
  boo() { if (!this.ctx) return; this.noise(1.4, 350, 3, 0.35, "bandpass", -150); this.tone(140, 1.2, "sawtooth", 0.08, -50); this.tone(150, 1.2, "sawtooth", 0.06, -60); }
  scrape() { this.noise(0.22, 1800, 1.5, 0.18, "bandpass", -900); }
  rumble() { this.noise(2.5, 90, 1, 0.5, "lowpass"); }
  splash() { this.noise(0.6, 900, 0.7, 0.35, "lowpass", -600); }
  ding() { this.tone(988, 0.12, "triangle", 0.2); setTimeout(() => this.tone(1318, 0.2, "triangle", 0.2), 90); }
  sad() { this.tone(392, 0.25, "triangle", 0.2); setTimeout(() => this.tone(330, 0.25, "triangle", 0.2), 220); setTimeout(() => this.tone(262, 0.5, "triangle", 0.2), 440); }
}

// ---------- Painted canvas textures ----------
export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
export function flagCanada(ctx, w, h) {
  ctx.fillStyle = "#d52b1e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#fff"; ctx.fillRect(w / 4, 0, w / 2, h);
  ctx.fillStyle = "#d52b1e"; const cx = w / 2, cy = h / 2, s = h * 0.36; ctx.beginPath();
  const pts = [[0,-1],[.12,-.72],[.3,-.8],[.24,-.35],[.55,-.55],[.5,-.38],[.78,-.42],[.66,-.12],[.82,-.02],[.4,.25],[.46,.42],[.06,.36],[.06,.85],[-.06,.85],[-.06,.36],[-.46,.42],[-.4,.25],[-.82,-.02],[-.66,-.12],[-.78,-.42],[-.5,-.38],[-.55,-.55],[-.24,-.35],[-.3,-.8],[-.12,-.72]];
  pts.forEach(([x, y], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + x * s, cy + y * s)); ctx.fill();
}
export function flagUSA(ctx, w, h) {
  for (let i = 0; i < 13; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#b22234"; ctx.fillRect(0, (i * h) / 13, w, h / 13 + 1); }
  ctx.fillStyle = "#3c3b6e"; ctx.fillRect(0, 0, w * 0.4, (h * 7) / 13); ctx.fillStyle = "#fff";
  for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) { ctx.beginPath(); ctx.arc(w * 0.033 + c * w * 0.066 + (r % 2 ? w * 0.033 : 0), h * 0.03 + r * h * 0.058, h * 0.012, 0, 7); ctx.fill(); }
}
export function textTex(text, opts = {}) {
  const { w = 512, h = 128, bg = "rgba(0,0,0,0)", fg = "#fff", font = "bold 64px Arial Black, Arial", stroke } = opts;
  return canvasTex(w, h, (c) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.font = font; c.textAlign = "center"; c.textBaseline = "middle"; if (stroke) { c.lineWidth = 8; c.strokeStyle = stroke; c.strokeText(text, w / 2, h / 2); } c.fillStyle = fg; c.fillText(text, w / 2, h / 2); });
}
export function flagMesh(kind, w = 6, h = 3.4) {
  const t = canvasTex(256, 144, kind === "ca" ? flagCanada : flagUSA);
  const g = new THREE.PlaneGeometry(w, h, 16, 4); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.8 }));
  m.userData.wave = g.attributes.position.array.slice(); m.userData.flag = true; return m;
}
export function waveFlag(m, t) {
  const p = m.geometry.attributes.position, b = m.userData.wave;
  for (let i = 0; i < p.count; i++) { const x = b[i * 3]; p.array[i * 3 + 2] = Math.sin(x * 1.3 + t * 3) * 0.18 * (x - b[0]) / 6; }
  p.needsUpdate = true; m.geometry.computeVertexNormals();
}

// ---------- Chunky hand-painted guy (no helmets!) ----------
const skinTones = ["#f1c9a5", "#e0ac7e", "#c68a5e", "#8d5a3b", "#f5d3b8"];
const hairCols = ["#3a2412", "#1c120a", "#7a4a1f", "#c9a25a", "#5a3a22", "#a33a14"];
export function makeGuy(o = {}) {
  const std = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, flatShading: true, ...extra });
  const jersey = o.jersey || "#c8102e", trim = o.trim || "#ffffff", pants = o.pants || "#222";
  const skin = std(o.skin || pick(skinTones)), hair = std(o.hair || pick(hairCols));
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const jerseyTex = canvasTex(128, 128, (c) => { c.fillStyle = jersey; c.fillRect(0, 0, 128, 128); c.fillStyle = trim; c.fillRect(0, 88, 128, 12); c.fillRect(0, 0, 128, 8);
    c.font = "bold 46px Arial Black"; c.textAlign = "center"; c.fillText(o.number ?? Math.floor(Math.random() * 98 + 1), 64, 64);
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; c.fillRect(Math.random() * 128, Math.random() * 128, 3, 3); } });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.95, 0.55), [std(jersey), std(jersey), std(jersey), std(jersey), std("#fff", { map: jerseyTex }), std("#fff", { map: jerseyTex })]);
  torso.position.y = 1.35; body.add(torso);
  const shoulders = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 0.6), std(jersey)); shoulders.position.y = 1.72; body.add(shoulders);
  const head = new THREE.Group(); head.position.y = 2.12; body.add(head);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.56, 0.5), skin); head.add(skull);
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.2, 0.56), hair); hairTop.position.set(0, 0.27, -0.02); head.add(hairTop);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.42, 0.14), hair); hairBack.position.set(0, 0.06, -0.24); head.add(hairBack);
  if (o.mullet !== false && Math.random() < 0.6) { const mul = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.3, 0.12), hair); mul.position.set(0, -0.22, -0.28); head.add(mul); }
  const stub = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.3), std(new THREE.Color(o.skin || "#c9a080").multiplyScalar(0.55).lerp(new THREE.Color("#3b2a20"), 0.5))); stub.position.set(0, -0.2, 0.12); head.add(stub);
  if (Math.random() < 0.5) { const mus = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.05), hair); mus.position.set(0, -0.08, 0.26); head.add(mus); }
  const eyeM = std("#111"); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.03), eyeM); e.position.set(0.11 * s, 0.04, 0.26); head.add(e);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.04), hair); brow.position.set(0.11 * s, 0.12, 0.26); brow.rotation.z = -0.15 * s; head.add(brow); }
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), skin); nose.position.set(0, -0.02, 0.29); head.add(nose);
  const limb = (w, h, d, mat) => { const p = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.y = -h / 2; p.add(m); return p; };
  const armL = limb(0.24, 0.8, 0.26, std(jersey)), armR = limb(0.24, 0.8, 0.26, std(jersey));
  armL.position.set(-0.62, 1.7, 0); armR.position.set(0.62, 1.7, 0); body.add(armL, armR);
  for (const a of [armL, armR]) { const glove = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.3), std(o.glove || "#3a2a1a")); glove.position.y = -0.85; a.add(glove); }
  const legL = limb(0.32, 0.9, 0.34, std(pants)), legR = limb(0.32, 0.9, 0.34, std(pants));
  legL.position.set(-0.22, 0.9, 0); legR.position.set(0.22, 0.9, 0); body.add(legL, legR);
  for (const l of [legL, legR]) { const sock = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.32), std(o.sock || jersey)); sock.position.y = -0.7; l.add(sock);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.5), std(o.boot || "#111")); boot.position.set(0, -0.9, 0.06); l.add(boot);
    if (o.skates) { const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.56), std("#ddd", { metalness: 0.8, roughness: 0.2 })); blade.position.set(0, -1.0, 0.06); l.add(blade); } }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  g.userData = { body, head, armL, armR, legL, legR, phase: 0 };
  return g;
}
export function animateGuy(g, speed, dt, style = "walk") {
  const u = g.userData; u.phase += dt * (style === "skate" ? 5 : 9) * clamp(speed / 4, 0.2, 1.6);
  const s = Math.sin(u.phase), amp = clamp(speed / 5, 0, 1) * (style === "skate" ? 0.5 : 0.8);
  u.legL.rotation.x = s * amp; u.legR.rotation.x = -s * amp;
  if (style === "skate") { u.legL.rotation.z = Math.max(0, s) * 0.3 * amp; u.legR.rotation.z = -Math.max(0, -s) * 0.3 * amp; u.body.rotation.x = 0.25 * clamp(speed / 6, 0, 1); }
  if (!u.armsBusy) { u.armL.rotation.x = -s * amp * 0.8; u.armR.rotation.x = s * amp * 0.8; }
  u.body.position.y = Math.abs(Math.cos(u.phase)) * 0.05 * amp;
}

// ---------- Input ----------
class Input {
  constructor(el) {
    this.keys = {}; this.yaw = 0; this.pitch = 0.25; this.joy = { x: 0, y: 0 }; this.actionHeld = false; this.actionPressed = false; this.vPressed = false;
    addEventListener("keydown", (e) => { if (e.repeat) return; this.keys[e.code] = true; if (e.code === "KeyE" || e.code === "Space") { this.actionHeld = true; this.actionPressed = true; } if (e.code === "KeyV") this.vPressed = true; if (e.code === "Escape" || e.code === "KeyP") this.pausePressed = true; });
    addEventListener("keyup", (e) => { this.keys[e.code] = false; if (e.code === "KeyE" || e.code === "Space") this.actionHeld = false; });
    let drag = null;
    el.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") return; drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => { if (!drag || e.pointerType === "touch") return; this.look(e.clientX - drag.x, e.clientY - drag.y); drag = { x: e.clientX, y: e.clientY }; });
    el.addEventListener("pointerup", () => (drag = null));
    // touch: left half joystick, right half look
    this.touches = {};
    const jb = document.getElementById("joy"), jk = document.getElementById("joyKnob");
    el.addEventListener("touchstart", (e) => { for (const t of e.changedTouches) { const left = t.clientX < innerWidth * 0.45; this.touches[t.identifier] = { left, x: t.clientX, y: t.clientY, ox: t.clientX, oy: t.clientY };
      if (left) { jb.style.display = "block"; jb.style.left = t.clientX - 60 + "px"; jb.style.top = t.clientY - 60 + "px"; jk.style.transform = "translate(0,0)"; } } e.preventDefault(); }, { passive: false });
    el.addEventListener("touchmove", (e) => { for (const t of e.changedTouches) { const s = this.touches[t.identifier]; if (!s) continue;
      if (s.left) { let dx = t.clientX - s.ox, dy = t.clientY - s.oy; const L = Math.hypot(dx, dy), m = 50; if (L > m) { dx *= m / L; dy *= m / L; } this.joy.x = dx / m; this.joy.y = dy / m; jk.style.transform = `translate(${dx}px,${dy}px)`; }
      else { this.look((t.clientX - s.x) * 1.3, (t.clientY - s.y) * 1.3); s.x = t.clientX; s.y = t.clientY; } } e.preventDefault(); }, { passive: false });
    const end = (e) => { for (const t of e.changedTouches) { const s = this.touches[t.identifier]; if (s && s.left) { this.joy.x = this.joy.y = 0; jb.style.display = "none"; } delete this.touches[t.identifier]; } };
    el.addEventListener("touchend", end); el.addEventListener("touchcancel", end);
    const ab = document.getElementById("btnAction");
    ab.addEventListener("touchstart", (e) => { this.actionHeld = true; this.actionPressed = true; e.preventDefault(); e.stopPropagation(); }, { passive: false });
    ab.addEventListener("touchend", (e) => { this.actionHeld = false; e.preventDefault(); });
    document.getElementById("btnView").addEventListener("touchstart", (e) => { this.vPressed = true; e.preventDefault(); }, { passive: false });
    document.getElementById("btnSprint").addEventListener("touchstart", (e) => { this.sprintTouch = !this.sprintTouch; e.target.classList.toggle("on", this.sprintTouch); e.preventDefault(); }, { passive: false });
  }
  look(dx, dy) { this.yaw -= dx * 0.005; this.pitch = clamp(this.pitch + dy * 0.004, -0.5, 1.2); }
  move() { // returns local x (right), y (forward)
    let x = this.joy.x, y = -this.joy.y; const k = this.keys;
    if (k.KeyW || k.ArrowUp) y += 1; if (k.KeyS || k.ArrowDown) y -= 1; if (k.KeyD || k.ArrowRight) x += 1; if (k.KeyA || k.ArrowLeft) x -= 1;
    const L = Math.hypot(x, y); if (L > 1) { x /= L; y /= L; } return { x, y, sprint: !!(k.ShiftLeft || k.ShiftRight || this.sprintTouch) };
  }
  endFrame() { this.actionPressed = false; this.vPressed = false; this.pausePressed = false; }
}

// ---------- Game shell ----------
export class Game {
  constructor(levels) {
    this.levels = levels; this.sfx = new Sfx();
    this.progress = JSON.parse(localStorage.getItem("cs3d_progress") || "{}");
    const canvas = document.getElementById("c");
    this.lowPower = IS_TOUCH || /quality=low/.test(location.search);
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.lowPower, powerPreference: "high-performance" }));
    r.setPixelRatio(Math.min(devicePixelRatio, this.lowPower ? 1.25 : 1.75)); r.setSize(innerWidth, innerHeight);
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 400);
    this.input = new Input(canvas); this.clock = new THREE.Clock(); this.firstPerson = false; this.paused = true;
    this.useBloom = !this.lowPower && !/bloom=0/.test(location.search);
    addEventListener("resize", () => { this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); r.setSize(innerWidth, innerHeight); this.composer && this.composer.setSize(innerWidth, innerHeight); });
    this.$ = (id) => document.getElementById(id);
    this.$("btnMute").onclick = () => { this.sfx.ensure(); this.sfx.setMuted(!this.sfx.muted); this.updMute(); }; this.updMute();
    this.buildHub(); this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
    this.fpsAcc = 0; this.fpsN = 0;
  }
  updMute() { this.$("btnMute").textContent = this.sfx.muted ? "🔇" : "🔊"; }
  save() { localStorage.setItem("cs3d_progress", JSON.stringify(this.progress)); }
  buildHub() {
    const grid = this.$("grid"); grid.innerHTML = "";
    this.levels.forEach((L, i) => {
      const p = this.progress[L.id]; const d = document.createElement("button"); d.className = "card";
      d.innerHTML = `<div class="thumb" style="background:${L.color}">${L.icon}</div><b>${i + 1}. ${L.name}</b><small>${L.tagline}</small>${p ? `<span class="badge">✔ Cleared · best ${p.best}</span>` : `<span class="badge dim">Not cleared</span>`}`;
      d.onclick = () => { this.sfx.ensure(); this.sfx.click(); this.story = null; this.start(i); }; grid.appendChild(d);
    });
    this.$("btnStory").onclick = () => { this.sfx.ensure(); this.sfx.click(); this.story = { idx: 0, total: 0, hate: 0 }; this.start(0); };
  }
  showHub() { this.endLevel(); this.paused = true; this.buildHub(); this.$("hub").classList.remove("hidden"); this.$("results").classList.add("hidden"); this.$("hud").classList.add("hidden"); document.body.classList.remove("playing"); }
  endLevel() { if (this.level) { this.level.dispose && this.level.dispose(); this.level = null; } if (this.scene) { this.scene.traverse((o) => { o.geometry && o.geometry.dispose(); }); this.scene = null; } }
  start(i) {
    this.endLevel(); const L = this.levels[i]; this.levelIdx = i;
    this.$("hub").classList.add("hidden"); this.$("results").classList.add("hidden"); this.$("hud").classList.remove("hidden"); document.body.classList.add("playing");
    const scene = (this.scene = new THREE.Scene());
    this.hate = 0; this.score = 0; this.time = 0; this.over = false; this.prompt(""); this.toast("");
    this.input.yaw = Math.PI; this.input.pitch = 0.3; this.camDist = 6;
    this.level = L.create(this, scene); this.$("lvlName").textContent = L.name; this.$("goal").textContent = L.goal;
    this.composer = null;
    if (this.useBloom) { const c = new EffectComposer(this.renderer); c.addPass(new RenderPass(scene, this.camera)); c.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), L.bloom ?? 0.35, 0.5, 0.88)); c.addPass(new OutputPass()); this.composer = c; }
    this.paused = false; this.clock.getDelta(); this.showIntro(L);
  }
  showIntro(L) { const el = this.$("intro"); el.innerHTML = `<h2>${L.name}</h2><p>${L.intro}</p><small>${IS_TOUCH ? "Left thumb: move · Right drag: look · ⓔ: act" : "WASD move · drag look · Shift sprint · E act · V view"}</small>`; el.classList.add("show"); clearTimeout(this._it); this._it = setTimeout(() => el.classList.remove("show"), 3800); }
  addHate(n, why) { if (this.over) return; this.hate = clamp(this.hate + n, 0, 100); if (n >= 3) { this.$("meter").classList.remove("hit"); void this.$("meter").offsetWidth; this.$("meter").classList.add("hit"); this.floatText(`+${Math.round(n)} HATE${why ? " · " + why : ""}`); } if (this.hate >= 100) this.finish(false, "meltdown"); }
  floatText(t) { const d = document.createElement("div"); d.className = "float"; d.textContent = t; this.$("floats").appendChild(d); setTimeout(() => d.remove(), 1600); }
  prompt(t) { const el = this.$("prompt"); if (el._t === t) return; el._t = t; el.innerHTML = t ? `<kbd>${IS_TOUCH ? "ⓔ" : "E"}</kbd> ${t}` : ""; el.style.opacity = t ? 1 : 0; }
  toast(t, who = "") { const el = this.$("toast"); if (!t) { el.style.opacity = 0; return; } el.innerHTML = (who ? `<b>${who}</b>` : "") + t; el.style.opacity = 1; clearTimeout(this._tt); this._tt = setTimeout(() => (el.style.opacity = 0), 3200); }
  finish(cleared, reason) {
    if (this.over) return; this.over = true; const L = this.levels[this.levelIdx]; const res = this.level.result ? this.level.result(cleared, reason) : {};
    const score = Math.max(0, Math.round(res.score ?? this.score)); cleared = res.cleared ?? cleared;
    if (cleared) { const p = this.progress[L.id] || { best: 0 }; p.best = Math.max(p.best, score); this.progress[L.id] = p; this.save(); }
    this.sfx.horn(); setTimeout(() => this.paused = true, 1200);
    const el = this.$("results"); const mm = Math.floor(this.time / 60), ss = String(Math.floor(this.time % 60)).padStart(2, "0");
    const next = this.story && this.levelIdx < this.levels.length - 1;
    if (this.story) { this.story.total += score; this.story.hate += this.hate; }
    el.innerHTML = `<div class="panel"><h2>${reason === "meltdown" ? "HATE INDEX MAXED" : cleared ? "LEVEL COMPLETE*" : "LEVEL OVER"}</h2><h3>${L.name}</h3>
      <div class="stats"><div><small>TIME</small><b>${mm}:${ss}</b></div><div><small>SCORE</small><b>${score}</b></div><div><small>HATE INDEX</small><b>${Math.round(this.hate)}</b></div></div>
      ${res.lines ? `<ul>${res.lines.map((l) => `<li>${l}</li>`).join("")}</ul>` : ""}
      <p class="verdict">“${res.verdict || "Effort: yes. Glory: no."}”</p><p class="fine">*Canada did not win. CANADA_LOSE_MULTIPLIER = ${CANADA_LOSE_MULTIPLIER}.</p>
      ${this.story && !next ? `<p class="verdict">STORY TOTAL: ${this.story.total} pts · average hate ${Math.round(this.story.hate / this.levels.length)}. The systems remain rigged.</p>` : ""}
      <div class="row"><button id="rTry">↻ Try Again</button>${next ? `<button id="rNext">Next level ▶</button>` : ""}<button id="rHub">Hub</button></div></div>`;
    setTimeout(() => { el.classList.remove("hidden"); this.$("rTry").onclick = () => this.start(this.levelIdx); this.$("rHub").onclick = () => this.showHub(); if (next) this.$("rNext").onclick = () => { this.story.idx++; this.start(this.levelIdx + 1); }; this.$("rTry").focus(); }, 1300);
  }
  // Third/first-person camera rig. target: Object3D, opts: {height, collideY}
  updateCamera(target, dt, o = {}) {
    if (this.input.vPressed) { this.firstPerson = !this.firstPerson; target.visible = true; }
    const h = o.height ?? 1.9, yaw = this.input.yaw, pitch = this.input.pitch, cam = this.camera;
    const tp = target.position;
    if (this.firstPerson) { cam.position.set(tp.x, tp.y + (o.eye ?? 2.15), tp.z); cam.position.x += Math.sin(yaw) * 0.35; cam.position.z += Math.cos(yaw) * 0.35;
      const look = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch - 0.3), -Math.sin(pitch - 0.3), Math.cos(yaw) * Math.cos(pitch - 0.3)); cam.lookAt(cam.position.clone().add(look));
      if (target.userData.head) target.userData.head.visible = false; return; }
    if (target.userData.head) target.userData.head.visible = true;
    const d = o.dist ?? this.camDist; const want = new THREE.Vector3(tp.x - Math.sin(yaw) * Math.cos(pitch) * d, tp.y + h + Math.sin(pitch) * d, tp.z - Math.cos(yaw) * Math.cos(pitch) * d);
    if (o.bounds) { want.x = clamp(want.x, o.bounds[0], o.bounds[1]); want.z = clamp(want.z, o.bounds[2], o.bounds[3]); }
    want.y = Math.max(want.y, (o.minY ?? 0.5));
    cam.position.lerp(want, 1 - Math.pow(0.0005, dt)); cam.lookAt(tp.x, tp.y + h * 0.75, tp.z);
  }
  // Moves a character relative to camera yaw with acceleration; returns speed.
  controlCharacter(ch, vel, dt, o = {}) {
    const m = this.input.move(); const sp = (m.sprint ? o.sprint ?? 9 : o.speed ?? 5.2);
    const yaw = this.input.yaw; const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const wx = (fx * m.y - fz * m.x) * sp, wz = (fz * m.y + fx * m.x) * sp; const acc = o.accel ?? 12;
    const k = 1 - Math.exp(-acc * dt); vel.x += (wx - vel.x) * k; vel.z += (wz - vel.z) * k;
    ch.position.x += vel.x * dt; ch.position.z += vel.z * dt;
    const s = Math.hypot(vel.x, vel.z); if (s > 0.3) { const tgt = Math.atan2(vel.x, vel.z); let dA = tgt - ch.rotation.y; dA = Math.atan2(Math.sin(dA), Math.cos(dA)); ch.rotation.y += dA * (1 - Math.exp(-10 * dt)); }
    if (o.bounds) { ch.position.x = clamp(ch.position.x, o.bounds[0], o.bounds[1]); ch.position.z = clamp(ch.position.z, o.bounds[2], o.bounds[3]); }
    return s;
  }
  loop() {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    if (this.scene && this.level) {
      if (!this.paused) { if (this.input.pausePressed) { this.showHub(); this.input.endFrame(); return; }
        if (!this.over) this.time += dt; this.level.update(dt);
        const mt = this.$("meterFill"); mt.style.width = this.hate + "%"; mt.style.background = this.hate > 75 ? "linear-gradient(90deg,#ff3b2f,#ff0)" : this.hate > 45 ? "linear-gradient(90deg,#ff7a1a,#ffb000)" : "linear-gradient(90deg,#ff9a3c,#d52b1e)";
        this.$("meterVal").textContent = Math.round(this.hate); this.$("score").textContent = Math.round(this.score);
        const rem = this.level.timeLeft ? Math.max(0, this.level.timeLeft()) : this.time; this.$("timer").textContent = `${Math.floor(rem / 60)}:${String(Math.floor(rem % 60)).padStart(2, "0")}`;
      }
      if (this.composer) this.composer.render(dt); else this.renderer.render(this.scene, this.camera);
      const now = performance.now(); this.fpsN++; if (!this.fpsT) this.fpsT = now; if (now - this.fpsT > 1000) { window.__fps = (this.fpsN * 1000) / (now - this.fpsT); this.fpsT = now; this.fpsN = 0; }
    }
    this.input.endFrame();
  }
}

// Shared lighting rig: hemisphere + shadowed sun + fog.
export function lightRig(scene, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky ?? 0xbfd8ff, o.ground ?? 0x404050, o.hemi ?? 0.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(o.sun ?? 0xfff2dd, o.sunI ?? 2.2); sun.position.set(...(o.sunPos ?? [20, 35, 15])); sun.castShadow = true;
  const s = o.shadowSize ?? 30; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 120 }); sun.shadow.mapSize.set(o.low ? 1024 : 2048, o.low ? 1024 : 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
  scene.add(sun, sun.target); if (o.fog !== false) scene.fog = new THREE.Fog(o.fogColor ?? 0x9fb8d0, o.fogNear ?? 30, o.fogFar ?? 140);
  scene.background = new THREE.Color(o.bg ?? o.fogColor ?? 0x9fb8d0); return { hemi, sun };
}

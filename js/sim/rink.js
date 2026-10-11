// THE RINK — 3D bubble-hockey. Canadian goals never count.
import { THREE, makeGuy, animateGuy, lightRig, canvasTex, flagMesh, waveFlag, flagCanada, flagUSA, textTex, pick, clamp, CANADA_LOSE_MULTIPLIER } from "./engine.js";

const W = 13, LEN = 25, NET_Z = 21.5, CORNER = 5;
const CAN_NAMES = ['Guy "Sacré Bleu" Tremblay', "Réjean Poutineau", 'Luc "Sorry" Beauchemin', 'Yvon "Zamboni" Gagnon', 'Marcel "Two-Minute" Côté'];
const US_NAMES = ["Chad", "Brad", "Trent", "Brock", "Duke", "Clint", "Hank", "Rex", "Bud", "Kirk"];
const A = {
  face: ["Allez! Face-off! Mon Dieu, skate already!", "Puck drop! C'est parti, do not embarrass Québec!", "FACE-OFF! I am already sweating through my turtleneck!"],
  usGoal: ["NON NON NON! Goal Américain?! SACRÉ BLEU DE SCOREBOARD!", "They score AGAIN?! This is a national heartbreak broadcast!", "OH NON! The blue sweaters dance! My blood pressure has dual citizenship!"],
  denied: ["THAT WAS A GOAL! In my heart! On the board? NON!", "Denied?! The puck was IN! Philosophically IN!", "NO GOAL?! I demand a strongly worded inquiry!"],
  bonk: ["BONK! Our boy is decorating the ice with apologies!", "One bonk! Historic! Tragic! Beautiful! Awful!", "He sits up… he says sorry to the ice… CLASSIC!"],
  zam: ["ZAMBONI! Clear the way! Canadian courtesy on wheels!", "The Zamboni arrives like a polite parade float! SORRY!", "Resurfacing mid-period?! Only we would apologize while doing it!"],
  buzz: ["BUZZER! It is over! My throat is gone! Vive… something!", "Final horn! Write it down: effort yes, glory no!", "C'est fini! Someone bring me a double-double and a nap!"],
  poss: ["He has the puck! Hope lives! Briefly!", "Possession Canadien! Do not look directly at destiny!"],
  usWin: ["USA SCORES! The scoreboard finally works!", "Touchdown— non, GOAL! Freedom has a slapshot!"],
};
const SCUFFLE = ["Sorry about your elbow pad.", "Pardon my glove, eh.", "Excuse me, I'm going to fall down now.", "My fault, your shoulder was there first."];
const ZAMLINES = ["SORRY, resurfacing!", "Courtesy flood incoming", "Zamboni has the right-of-way", "Please hold your dignity", "Ice: briefly Canadian again", "Out of the way, politely"];

function iceTexture() {
  return canvasTex(512, 1024, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#eef6fb"); g.addColorStop(1, "#dce9f2"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const sx = w / (2 * W), sz = h / (2 * LEN), X = (x) => w / 2 + x * sx, Z = (z) => h / 2 + z * sz;
    for (let i = 0; i < 2600; i++) { c.strokeStyle = `rgba(${150 + Math.random() * 60},${180 + Math.random() * 40},210,${Math.random() * 0.35})`; c.lineWidth = Math.random() * 1.4; c.beginPath(); const x = Math.random() * w, y = Math.random() * h, a = Math.random() * 6.28, L = 6 + Math.random() * 50; c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.4) * L / 2, y + Math.sin(a + 0.4) * L / 2, x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); }
    c.fillStyle = "rgba(200,30,30,.85)"; c.fillRect(0, Z(0) - 5, w, 10); c.fillStyle = "rgba(20,60,200,.8)"; c.fillRect(0, Z(-8) - 6, w, 12); c.fillRect(0, Z(8) - 6, w, 12);
    c.fillStyle = "rgba(200,30,30,.8)"; c.fillRect(0, Z(-NET_Z) - 1.5, w, 3); c.fillRect(0, Z(NET_Z) - 1.5, w, 3);
    c.strokeStyle = "rgba(20,60,200,.7)"; c.lineWidth = 4; c.beginPath(); c.arc(X(0), Z(0), 4.5 * sx, 0, 7); c.stroke();
    c.strokeStyle = "rgba(200,30,30,.7)"; for (const [x, z] of [[-6, -15], [6, -15], [-6, 15], [6, 15]]) { c.beginPath(); c.arc(X(x), Z(z), 4 * sx, 0, 7); c.stroke(); c.fillStyle = "rgba(200,30,30,.8)"; c.beginPath(); c.arc(X(x), Z(z), 6, 0, 7); c.fill(); }
    c.fillStyle = "rgba(80,150,255,.35)"; for (const s of [-1, 1]) { c.beginPath(); c.arc(X(0), Z(s * NET_Z), 2.4 * sx, s < 0 ? 0 : Math.PI, s < 0 ? Math.PI : Math.PI * 2); c.fill(); }
    c.save(); c.globalAlpha = 0.5; c.translate(X(0) - 60, Z(0) - 34); flagCanada(c, 120, 68); c.restore();
    c.fillStyle = "rgba(255,255,255,.25)"; for (let i = 0; i < 30; i++) c.fillRect(Math.random() * w, Math.random() * h, 40 + Math.random() * 90, 2);
  });
}
function insideRink(x, z, r = 0) { // rounded-corner rink test & push
  const hx = W - r, hz = LEN - r, cr = CORNER; let nx = clamp(x, -hx, hx), nz = clamp(z, -hz, hz), hit = nx !== x || nz !== z;
  const cx = hx - cr, cz = hz - cr; if (Math.abs(nx) > cx && Math.abs(nz) > cz) { const ox = Math.sign(nx) * cx, oz = Math.sign(nz) * cz, dx = nx - ox, dz = nz - oz, d = Math.hypot(dx, dz); if (d > cr) { nx = ox + (dx / d) * cr; nz = oz + (dz / d) * cr; hit = true; } }
  return { x: nx, z: nz, hit };
}

export const Rink = {
  id: "rink", name: "The Rink", icon: "🏒", color: "linear-gradient(135deg,#d52b1e,#1a3a8a)", bloom: 0.55,
  tagline: "1970s bubble hockey. Your goals are… reviewed.",
  goal: "Score for Canada. (Results may vary. Results will not vary.)",
  intro: "Skate with WASD, grab the glowing puck, press E to shoot. Bump into Americans to check them (they may bonk you). Canadian goals are subject to review.",
  create(G, scene) {
    const team = localStorage.getItem("cs3d_team") || "ca"; const asUSA = team === "us";
    lightRig(scene, { bg: 0x0d1220, fogColor: 0x0d1220, fogNear: 50, fogFar: 140, sky: 0xdde8ff, ground: 0x223, hemi: 1.0, sunI: 2.0, sunPos: [8, 40, 6], shadowSize: 30, low: G.lowPower });
    // ice + boards
    const ice = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, LEN * 2), new THREE.MeshStandardMaterial({ map: iceTexture(), roughness: 0.18, metalness: 0.05 }));
    ice.rotation.x = -Math.PI / 2; ice.receiveShadow = true; scene.add(ice);
    const shape = new THREE.Shape(); const sh = (x, z) => [x, z];
    const pts = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2; const q = Math.floor((i % 64) / 16); const cx = (q === 0 || q === 3 ? 1 : -1) * (W - CORNER), cz = (q < 2 ? 1 : -1) * (LEN - CORNER); pts.push(new THREE.Vector2(cx + Math.cos(a) * CORNER, cz + Math.sin(a) * CORNER)); }
    const boardsMat = new THREE.MeshStandardMaterial({ color: 0xf4f1e8, roughness: 0.5 }), capMat = new THREE.MeshStandardMaterial({ color: 0xd52b1e, roughness: 0.5 }), glassMat = new THREE.MeshPhysicalMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.12, roughness: 0.05 });
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], L = a.distanceTo(b), mx = (a.x + b.x) / 2, mz = (a.y + b.y) / 2, ang = Math.atan2(b.x - a.x, b.y - a.y);
      const bd = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, L + 0.05), boardsMat); bd.position.set(mx, 0.55, mz); bd.rotation.y = ang; bd.receiveShadow = bd.castShadow = true; scene.add(bd);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, L + 0.05), capMat); cap.position.set(mx, 1.12, mz); cap.rotation.y = ang; scene.add(cap);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2, L + 0.05), glassMat); gl.position.set(mx, 2.15, mz); gl.rotation.y = ang; scene.add(gl); }
    // ads on boards
    const ads = ["SORRY™ INSURANCE", "DOUBLE-DOUBLE", "MAPLE BANK (US-OWNED)", "TOQUE DEPOT", "POLITE PLUMBING"];
    for (let i = 0; i < 10; i++) { const s = i < 5 ? -1 : 1, z = -16 + (i % 5) * 8; const ad = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 0.8), new THREE.MeshStandardMaterial({ map: textTex(ads[i % 5], { w: 512, h: 64, bg: i % 2 ? "#1a3a8a" : "#c8102e", font: "bold 40px Arial Black" }) })); ad.position.set(s * (W - 0.17), 0.55, z); ad.rotation.y = -s * Math.PI / 2; scene.add(ad); }
    // nets
    const mkNet = (z, dir) => { const g = new THREE.Group(); const red = new THREE.MeshStandardMaterial({ color: 0xd61f1f, roughness: 0.4, metalness: 0.3 });
      const post = (x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.3), red); p.position.set(x, 0.65, 0); g.add(p); }; post(-1.6); post(1.6);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2), red); bar.rotation.z = Math.PI / 2; bar.position.y = 1.3; g.add(bar);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.3, 1.2), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })); mesh.position.set(0, 0.65, dir * 0.6); g.add(mesh);
      g.position.z = z; scene.add(g); return g; };
    mkNet(NET_Z, 1); mkNet(-NET_Z, -1);
    // crowd stands (instanced)
    const crowdN = G.lowPower ? 500 : 1100; const cg = new THREE.BoxGeometry(0.7, 1, 0.5); const cm = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    const crowd = new THREE.InstancedMesh(cg, cm, crowdN); const base = []; const m4 = new THREE.Matrix4(), col = new THREE.Color();
    for (let i = 0; i < crowdN; i++) { const side = i % 4, row = Math.floor(Math.random() * 9), t = Math.random() * 2 - 1; let x, z, ry;
      if (side < 2) { x = (side ? 1 : -1) * (W + 2 + row * 1.1); z = t * (LEN - 2); } else { z = (side === 2 ? 1 : -1) * (LEN + 2 + row * 1.1); x = t * (W - 1); }
      const y = 1.2 + row * 0.75; base.push([x, y, z, Math.random() * 6]); m4.makeTranslation(x, y, z); crowd.setMatrixAt(i, m4); crowd.setColorAt(i, col.set(pick(["#c8102e", "#c8102e", "#ffffff", "#c8102e", "#1a3a8a", "#f2d0a4", "#333"]))); }
    scene.add(crowd);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x2a2d3a, roughness: 0.9 });
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(11, 1, LEN * 2), standMat); st.position.set(s * (W + 7), 0.2, 0); st.rotation.z = s * -0.6; scene.add(st);
      const st2 = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 1, 11), standMat); st2.position.set(0, 0.2, s * (LEN + 7)); st2.rotation.x = s * 0.6; scene.add(st2); }
    // bubble dome + big flags + jumbotron
    const dome = new THREE.Mesh(new THREE.SphereGeometry(48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xaaccff, transparent: true, opacity: 0.07, side: THREE.BackSide, roughness: 0, metalness: 0.2 }));
    dome.scale.y = 0.45; scene.add(dome);
    const fCa = flagMesh("ca", 12, 6.5), fUs = flagMesh("us", 12, 6.5); fCa.position.set(0, 13, -LEN - 4); fUs.position.set(0, 13, LEN + 4); fUs.rotation.y = Math.PI; scene.add(fCa, fUs);
    const sbC = document.createElement("canvas"); sbC.width = 512; sbC.height = 256; const sbT = new THREE.CanvasTexture(sbC); sbT.colorSpace = THREE.SRGBColorSpace;
    const jumbo = new THREE.Group(); for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(5, 2.6, 0.1), new THREE.MeshStandardMaterial({ map: sbT, emissive: 0xffffff, emissiveMap: sbT, emissiveIntensity: 0.9 })); p.rotation.y = (i * Math.PI) / 2; p.position.set(Math.sin(p.rotation.y) * 2.5, 0, Math.cos(p.rotation.y) * 2.5); jumbo.add(p); }
    jumbo.position.y = 11; scene.add(jumbo);
    for (const [x, z, c] of [[-8, -12, 0xfff0d8], [8, 12, 0xfff0d8]]) { const sp = new THREE.SpotLight(c, 300, 60, 0.7, 0.5); sp.position.set(x, 18, z); sp.target.position.set(x * 0.3, 0, z * 0.3); scene.add(sp, sp.target); }

    // teams
    const caKit = { jersey: "#c8102e", trim: "#ffffff", pants: "#1a1a1a", skates: true }, usKit = { jersey: "#1a3a8a", trim: "#c8102e", pants: "#e8e8e8", skates: true };
    const players = []; const addSk = (teamId, i, goalie) => { const kit = teamId === "ca" ? caKit : usKit; const m = makeGuy({ ...kit, number: goalie ? 1 : 8 + i * 9, glove: goalie ? "#eee" : undefined });
      const stick = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.7), new THREE.MeshStandardMaterial({ color: 0x8a5a2b })); stick.position.set(0, -0.8, 0.7); stick.rotation.x = 0.9; m.userData.armR.add(stick); m.userData.armR.rotation.x = -0.6; m.userData.armL.rotation.x = -0.5; m.userData.armsBusy = true;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.4), new THREE.MeshStandardMaterial({ color: 0x111 })); blade.position.set(0.1, -0.05, 0.85); stick.add(blade);
      if (goalie) { const pad = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 0.4), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 })); pad.position.set(0, 0.5, 0.2); m.userData.body.add(pad); }
      const dir = teamId === "ca" ? 1 : -1; m.position.set(goalie ? 0 : (i === 0 ? 0 : (i === 1 ? -5 : 5)), 0, goalie ? -dir * (NET_Z - 1) : -dir * (i === 0 ? 2 : 6)); m.rotation.y = dir > 0 ? 0 : Math.PI; scene.add(m);
      const sk = { m, vel: new THREE.Vector3(), team: teamId, goalie, dir, home: m.position.clone(), name: teamId === "ca" ? CAN_NAMES[(i + (goalie ? 3 : 0)) % 5] : US_NAMES[Math.floor(Math.random() * 10)], down: 0 }; players.push(sk); return sk; };
    const me = asUSA ? "us" : "ca", them = asUSA ? "ca" : "us";
    const you = addSk(me, 0); addSk(me, 1); addSk(me, 2); addSk(me, 0, true); addSk(them, 0); addSk(them, 1); addSk(them, 2); addSk(them, 0, true);
    you.isYou = true;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 32), new THREE.MeshBasicMaterial({ color: 0xffee55, transparent: true, opacity: 0.8 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; scene.add(ring);

    // puck
    const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 24), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xff7a1a, emissiveIntensity: 2.2 })); puck.castShadow = true; scene.add(puck);
    const glow = new THREE.PointLight(0xff8a2a, 12, 7, 2); scene.add(glow);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.35, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.015; scene.add(halo);
    const P = { pos: new THREE.Vector3(), vel: new THREE.Vector3(), owner: null, cool: 0 };
    // zamboni
    const zam = new THREE.Group(); const zb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 4.6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })); zb.position.y = 1.2; zam.add(zb);
    const zs = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.1), new THREE.MeshStandardMaterial({ map: textTex("SORRY! RESURFACING", { w: 512, h: 128, bg: "#c8102e", font: "bold 48px Arial Black" }) })); zs.position.set(1.31, 1.3, 0); zs.rotation.y = Math.PI / 2; zam.add(zs); const zs2 = zs.clone(); zs2.position.x = -1.31; zs2.rotation.y = -Math.PI / 2; zam.add(zs2);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x1a3a8a })); cab.position.set(0, 2.6, -1); zam.add(cab);
    const beacon = new THREE.PointLight(0xffaa00, 8, 10); beacon.position.y = 3.6; zam.add(beacon);
    zam.traverse((o) => o.isMesh && (o.castShadow = true)); zam.visible = false; scene.add(zam);
    const PERIOD = 150; const st = { caAttempts: 0, denied: 0, usGoals: 0, myGoals: 0, shots: 0, poss: 0, zamDone: false, zamT: -1, faceT: 0, announceCD: 0, scuffleCD: 0, bonks: 0 };

    const announce = (k) => { G.toast(pick(A[k]), "🎙️ Jean-Guy (turtleneck): "); };
    const faceoff = () => { P.pos.set(0, 0.08, 0); P.vel.set((Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3); P.owner = null; P.cool = 0.4;
      for (const p of players) { p.m.position.copy(p.home); p.vel.set(0, 0, 0); p.down = 0; p.m.rotation.set(0, p.dir > 0 ? 0 : Math.PI, 0); }
      announce("face"); G.input.yaw = you.dir > 0 ? 0 : Math.PI; };
    faceoff();
    const drawBoard = () => { const c = sbC.getContext("2d"); c.fillStyle = "#050505"; c.fillRect(0, 0, 512, 256); c.font = "bold 44px Courier New"; c.textAlign = "center";
      c.fillStyle = "#ff3b2f"; c.fillText(`CAN ${asUSA ? st.myGoals * 0 : 0}`, 128, 70); c.fillStyle = "#4da3ff"; c.fillText(`USA ${asUSA ? st.myGoals + st.usGoals : st.usGoals}`, 384, 70);
      c.fillStyle = "#ffd23f"; c.font = "bold 30px Courier New"; c.fillText(`DENIED: ${st.denied}`, 256, 130); const r = Math.max(0, PERIOD - G.time); c.fillStyle = "#fff"; c.font = "bold 54px Courier New"; c.fillText(`${Math.floor(r / 60)}:${String(Math.floor(r % 60)).padStart(2, "0")}`, 256, 210); sbT.needsUpdate = true; };
    let boardT = 0;
    const tmp = new THREE.Vector3();
    const goalScored = (attTeam) => {
      P.owner = null; P.vel.set(0, 0, 0);
      if (attTeam === "ca") { st.caAttempts++; const counted = 1 * CANADA_LOSE_MULTIPLIER; st.denied++; G.score += 100; G.addHate(8, "goal denied"); announce("denied"); G.sfx.horn(); setTimeout(() => G.sfx.boo(), 500);
        G.floatText(pick(["UNDER REVIEW…", "OFFSIDE (vibes)", "GOALIE INTERFERENCE (by puck)", "NET WAS MOVED 0.2mm"])); if (counted) st.myGoals += counted; }
      else { if (asUSA) { st.myGoals++; G.score += 150; G.toast(pick(A.usWin), "🎙️ Jean-Guy (sulking): "); G.sfx.cheer(); }
        else { st.usGoals++; G.addHate(12, "USA goal"); announce("usGoal"); G.sfx.boo(); G.sfx.horn(); } }
      setTimeout(() => !G.over && faceoff(), 1800);
    };
    const possEl = document.getElementById("lvlInfo");

    return {
      st, P,
      timeLeft: () => PERIOD - G.time,
      update(dt) {
        const t = G.time; waveFlag(fCa, t); waveFlag(fUs, t + 1); boardT -= dt; if (boardT < 0) { drawBoard(); boardT = 0.5; }
        jumbo.rotation.y += dt * 0.2;
        // crowd bob
        const excite = P.owner ? (P.owner.team === "ca" ? 1 : 0.5) : 0.3;
        for (let i = 0; i < crowdN; i += G.lowPower ? 3 : 1) { const b = base[i]; m4.makeTranslation(b[0], b[1] + Math.max(0, Math.sin(t * 6 + b[3])) * 0.25 * excite, b[2]); crowd.setMatrixAt(i, m4); } crowd.instanceMatrix.needsUpdate = true;
        // zamboni event at half
        if (!st.zamDone && t > PERIOD / 2) { st.zamDone = true; st.zamT = 0; zam.visible = true; announce("zam"); G.floatText(pick(ZAMLINES)); P.owner = null; G.sfx.rumble(); }
        if (st.zamT >= 0) { st.zamT += dt; const a = st.zamT * 0.45; zam.position.set(Math.sin(a) * (W - 3), 0, -Math.cos(a) * (LEN - 5)); zam.rotation.y = Math.atan2(Math.cos(a) * (W - 3), Math.sin(a) * (LEN - 5)); beacon.intensity = 6 + Math.sin(t * 20) * 5;
          for (const p of players) { tmp.subVectors(p.m.position, zam.position); tmp.y = 0; const d = tmp.length(); if (d < 3.4) { tmp.normalize().multiplyScalar(12); p.vel.add(tmp.multiplyScalar(dt * 3)); p.m.position.addScaledVector(tmp, dt * 0.4); if (p.isYou && Math.random() < dt * 2) G.floatText("Zamboni has the right-of-way"); } }
          if (st.zamT > 14) { st.zamT = -1; zam.visible = false; G.toast("Ice: briefly Canadian again.", "🧊 "); faceoff(); } }
        // player control
        const myGoalZ = you.dir * NET_Z; possEl.innerHTML = P.owner ? `<span style="color:${P.owner.team === "ca" ? "#ff5a4a" : "#6fb1ff"}">● POSSESSION: ${P.owner.team === "ca" ? "CANADA" : "USA"}${P.owner.isYou ? " (YOU)" : ""}</span>` : `<span style="color:#ffd23f">● LOOSE PUCK</span>`;
        for (const p of players) {
          if (p.down > 0) { p.down -= dt; p.m.rotation.z = Math.min(1.4, p.m.rotation.z + dt * 6); p.vel.multiplyScalar(0.95); if (p.down <= 0) p.m.rotation.z = 0; }
          else if (p.isYou) { if (st.zamT < 0) G.controlCharacter(p.m, p.vel, dt, { speed: 7, sprint: 11, accel: 2.6 }); }
          else this.ai(p, dt);
          if (!p.isYou || p.down > 0) { p.m.position.addScaledVector(p.vel, dt); if (p.vel.lengthSq() > 0.5) { const tg = Math.atan2(p.vel.x, p.vel.z); let d = tg - p.m.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); p.m.rotation.y += d * Math.min(1, dt * 6); } }
          const r = insideRink(p.m.position.x, p.m.position.z, 0.6); if (r.hit) { p.m.position.x = r.x; p.m.position.z = r.z; p.vel.multiplyScalar(0.5); }
          animateGuy(p.m, p.vel.length(), dt, "skate");
        }
        // skater collisions + scuffles
        st.scuffleCD -= dt;
        for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) { const a = players[i], b = players[j]; tmp.subVectors(a.m.position, b.m.position); tmp.y = 0; const d = tmp.length();
          if (d < 1.1 && d > 0.001) { tmp.multiplyScalar((1.1 - d) / d / 2); a.m.position.add(tmp); b.m.position.sub(tmp);
            if ((a.isYou || b.isYou) && a.team !== b.team && st.scuffleCD < 0) { const opp = a.isYou ? b : a; const rel = you.vel.length() + opp.vel.length();
              if (rel > 6) { st.scuffleCD = 2.5; G.sfx.thud(); if (asUSA || Math.random() < 0.25) { opp.down = 2; if (P.owner === opp) { P.owner = null; P.vel.copy(you.vel).multiplyScalar(0.6); } G.floatText("CHECK! (they said sorry)"); G.score += 25; }
                else { you.down = 2.2; st.bonks++; if (P.owner === you) { P.owner = opp; } G.addHate(asUSA ? 0 : 10, "lost scuffle"); announce("bonk"); G.floatText(`"${pick(SCUFFLE)}"`); } } } } }
        // puck
        P.cool -= dt;
        if (P.owner) { const o = P.owner; if (o.down > 0) { P.owner = null; } else { const f = o.m.rotation.y; P.pos.set(o.m.position.x + Math.sin(f) * 1.0 + Math.cos(f) * 0.35, 0.08, o.m.position.z + Math.cos(f) * 1.0 - Math.sin(f) * 0.35); P.vel.copy(o.vel); } }
        else { P.pos.addScaledVector(P.vel, dt); P.vel.multiplyScalar(Math.pow(0.55, dt));
          const r = insideRink(P.pos.x, P.pos.z, 0.35); if (r.hit) { if (r.x !== P.pos.x) P.vel.x *= -0.8; if (r.z !== P.pos.z) P.vel.z *= -0.8; P.pos.x = r.x; P.pos.z = r.z; G.sfx.tone(300, 0.05, "square", 0.08); }
          // goals: puck crossing goal line between posts
          for (const s of [1, -1]) { if (Math.abs(P.pos.x) < 1.55 && s * P.pos.z > NET_Z && s * P.pos.z < NET_Z + 1.1) { const att = (s === 1) === (you.team === "ca" ? true : false) ? "ca" : "us"; // net at +z is attacked by team whose dir=+1
              const attacker = players.find((p) => p.dir === s).team; goalScored(attacker); P.pos.z = s * (NET_Z + 0.7); break; }
            // net back wall
            if (Math.abs(P.pos.x) < 1.7 && s * P.pos.z > NET_Z + 1.1 && s * P.pos.z < NET_Z + 1.4) P.vel.z *= -0.5; }
          if (P.cool < 0 && st.zamT < 0) for (const p of players) { if (p.down > 0) continue; const d = Math.hypot(p.m.position.x - P.pos.x, p.m.position.z - P.pos.z); if (d < 1.2) { P.owner = p; if (p.isYou) { G.sfx.click(); if (Math.random() < 0.3) announce("poss"); } break; } } }
        // steals vs carrier
        if (P.owner && P.cool < 0) for (const p of players) { if (p === P.owner || p.team === P.owner.team || p.down > 0) continue; const d = p.m.position.distanceTo(P.owner.m.position);
          const rate = P.owner.isYou ? (asUSA ? 0.2 : 0.9) : p.isYou ? (G.input.actionPressed ? 8 : 0) : (P.owner.team === "us" ? 0.35 : 0.8);
          if (d < 1.7 && Math.random() < rate * dt) { P.owner = p; P.cool = 0.5; if (p.isYou) G.floatText("STOLEN! (politely)"); break; } }
        // shooting
        if (P.owner === you) { st.poss += dt; G.score += dt * 2; G.prompt("Shoot!"); if (G.input.actionPressed) { const f = G.firstPerson ? G.input.yaw : you.m.rotation.y; P.owner = null; P.cool = 0.35; P.vel.set(Math.sin(f) * 30, 0, Math.cos(f) * 30); G.sfx.shot(); st.shots++; G.score += 10; } }
        else if (P.owner && P.owner.team !== you.team && you.m.position.distanceTo(P.owner.m.position) < 2.2) G.prompt("Poke-check");
        else G.prompt("");
        if (!P.owner && !asUSA) G.addHate(dt * 0.12); else if (P.owner && P.owner.team !== you.team) G.addHate(dt * 0.35);
        puck.position.copy(P.pos); puck.rotation.y += dt * 8; glow.position.set(P.pos.x, 0.8, P.pos.z); halo.position.x = P.pos.x; halo.position.z = P.pos.z; halo.scale.setScalar(1 + Math.sin(t * 8) * 0.12);
        ring.position.x = you.m.position.x; ring.position.z = you.m.position.z;
        G.updateCamera(you.m, dt, { height: 2.2, dist: 8, bounds: [-W - 6, W + 6, -LEN - 6, LEN + 6], minY: 1.2 });
        if (t >= PERIOD) G.finish(true, "buzzer");
      },
      ai(p, dt) {
        const carrier = P.owner, mine = carrier && carrier.team === p.team; let tx, tz, sp = p.team === "us" ? 8.2 : 6.6;
        if (st.zamT >= 0) { tx = p.home.x; tz = p.home.z * 1.3; }
        else if (p.goalie) { tx = clamp(P.pos.x * 0.5, -1.4, 1.4); tz = -p.dir * (NET_Z - 0.9); sp = 6; if (carrier === p && P.cool < 0) { const f = Math.atan2((Math.random() - 0.5) * 10, p.dir * 20); P.owner = null; P.cool = 0.6; P.vel.set(Math.sin(f) * 18, 0, Math.cos(f) * 18); } }
        else if (carrier === p) { tx = clamp(-p.m.position.x * 0.3, -3, 3); tz = p.dir * (NET_Z - 2); if (p.dir * p.m.position.z > NET_Z - 10 && Math.random() < dt * 1.6) { // shoot
            const aimX = (Math.random() - 0.5) * (p.team === "us" ? 2.4 : 5.5); const dx = aimX - p.m.position.x, dz = p.dir * (NET_Z + 0.6) - p.m.position.z, L = Math.hypot(dx, dz); P.owner = null; P.cool = 0.35; P.vel.set((dx / L) * 26, 0, (dz / L) * 26); G.sfx.shot(); } }
        else if (mine) { tx = p.home.x; tz = carrier.m.position.z + p.dir * 4; }
        else { const team = players.filter((q) => q.team === p.team && !q.goalie && !q.isYou); const near = team.sort((a, b) => a.m.position.distanceTo(P.pos) - b.m.position.distanceTo(P.pos))[0];
          if (near === p || p.team !== you.team) { tx = P.pos.x; tz = P.pos.z; } else { tx = p.home.x; tz = P.pos.z * 0.6; } }
        const dx = tx - p.m.position.x, dz = tz - p.m.position.z, L = Math.hypot(dx, dz) || 1; const want = L < 0.5 ? 0 : sp;
        p.vel.x += ((dx / L) * want - p.vel.x) * Math.min(1, dt * 2.2); p.vel.z += ((dz / L) * want - p.vel.z) * Math.min(1, dt * 2.2);
      },
      result(cleared, reason) {
        let retro = false; if (!asUSA && st.usGoals === 0) { st.usGoals = 1; retro = true; }
        announce("buzz");
        return { cleared: true, score: G.score, lines: [`Final: USA ${asUSA ? st.myGoals + st.usGoals : st.usGoals} — CAN 0`, `Canadian goals denied: ${st.denied}`, `Shots: ${st.shots} · Possession: ${Math.round(st.poss)}s · Bonks: ${st.bonks}`, retro ? "USA awarded a retroactive goal for 'emotional momentum'." : "", asUSA ? "You played as the USA. It felt weirdly easy. That's the joke." : ""].filter(Boolean),
          verdict: reason === "meltdown" ? "Jean-Guy has fainted into his turtleneck. The Hate Index is now a national anthem." : st.denied > 2 ? "THREE goals in your heart. ZERO on the board. Classic." : pick(["Effort yes, glory no.", "You cared. The scoreboard noticed. It did not care back.", "The puck was IN. Philosophically IN."]) };
      },
    };
  },
};

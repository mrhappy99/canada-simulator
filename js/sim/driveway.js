// THE DRIVEWAY — shovel at dusk. The plow always returns the snow.
import { THREE, makeGuy, animateGuy, lightRig, canvasTex, textTex, flagMesh, waveFlag, pick, clamp } from "./engine.js";

const GX = 7, GZ = 12, CELL = 0.8; // driveway grid
const DX0 = -GX * CELL / 2, DZ0 = 2; // driveway from street edge z=2 to house
const PLOW_LINES = ["The plow has arrived to return your snow. Thank you for your service.", "Municipal Snow Redistribution Program™: your driveway has been selected.", "BEEP BEEP. That's 'sorry' in plow.", "The windrow is a gift. Do not refuse the gift."];
const NEIGHBOR = ["Neighbour Gord (snowblower): 'Rough one, bud.'", "Neighbour Gord: 'You missed a spot. All of it.'", "Neighbour Gord: 'Plow's coming back around, eh.'"];

export const Driveway = {
  id: "driveway", name: "The Driveway", icon: "❄️", color: "linear-gradient(135deg,#283a63,#ff9a3c)", bloom: 0.6,
  tagline: "Shovel at dusk. The plow always comes back.",
  goal: "Clear the driveway before the plow comes. (It is coming.)",
  intro: "Hold E near the snow to shovel. Get the driveway clear… and the municipal plow will return it, with interest. Survive till the streetlights buzz off.",
  create(G, scene) {
    const { hemi, sun } = lightRig(scene, { bg: 0x2b3456, fogColor: 0x4a4f72, fogNear: 18, fogFar: 85, sky: 0x8aa0d8, ground: 0x6a5a6a, hemi: 0.9, sun: 0xffa86a, sunI: 1.4, sunPos: [-30, 12, -20], shadowSize: 22, low: G.lowPower });
    // sky gradient dome
    const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: canvasTex(16, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#151a3a"); g.addColorStop(0.42, "#3a3f78"); g.addColorStop(0.5, "#ff8f5a"); g.addColorStop(0.56, "#ffcf8a"); g.addColorStop(1, "#4a4f72"); c.fillStyle = g; c.fillRect(0, 0, w, h); }) }));
    scene.add(sky);
    const snowTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#e9eef8"; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { const v = 215 + Math.random() * 40; c.fillStyle = `rgba(${v},${v},${v + 10},.5)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [12, 12]);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ map: snowTex, roughness: 0.95, color: 0xdfe6f5 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(200, 8), new THREE.MeshStandardMaterial({ color: 0x8a90a0, roughness: 0.9, map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = "#9aa0ae"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 1); } c.fillStyle = "rgba(60,60,70,.5)"; c.fillRect(0, 20, w, 5); c.fillRect(0, 40, w, 5); }, [20, 1]) }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, -2); road.receiveShadow = true; scene.add(road);
    const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(GX * CELL, GZ * CELL), new THREE.MeshStandardMaterial({ color: 0x2d2f36, roughness: 0.7 })); asphalt.rotation.x = -Math.PI / 2; asphalt.position.set(0, 0.015, DZ0 + GZ * CELL / 2); asphalt.receiveShadow = true; scene.add(asphalt);
    // houses
    const mkHouse = (x, z, col, rot = 0, mine) => { const h = new THREE.Group(); const wall = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 8), new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 })); wall.position.y = 2.5; h.add(wall);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3.4, 4), new THREE.MeshStandardMaterial({ color: 0x3a2f30, roughness: 0.9 })); roof.position.y = 6.7; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85); h.add(roof);
      const snowRoof = new THREE.Mesh(new THREE.ConeGeometry(7.1, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0xf3f6ff, roughness: 1 })); snowRoof.position.y = 7.9; snowRoof.rotation.y = Math.PI / 4; snowRoof.scale.set(0.6, 1, 0.5); h.add(snowRoof);
      const winM = new THREE.MeshStandardMaterial({ color: 0xffd38a, emissive: 0xffb050, emissiveIntensity: 1.6 });
      for (const wx of [-2.8, 2.8]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.3), winM); w.position.set(wx, 2.9, -4.01); w.rotation.y = Math.PI; h.add(w); }
      const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), new THREE.MeshStandardMaterial({ color: mine ? 0xc8102e : 0x5a3a2a })); door.position.set(0, 1.1, -4.01); door.rotation.y = Math.PI; h.add(door);
      const garage = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.6 })); garage.position.set(mine ? 0 : 2.2, 1.3, -4.02); garage.rotation.y = Math.PI; if (mine) { door.position.x = -3.4; } h.add(garage);
      if (mine) { const pl = new THREE.PointLight(0xffb060, 6, 9, 2); pl.position.set(0, 3, -5); h.add(pl); }
      h.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); h.position.set(x, 0, z); h.rotation.y = rot; scene.add(h); return h; };
    mkHouse(0, DZ0 + GZ * CELL + 4, 0xb8c4d8, 0, true); mkHouse(-13, 16, 0xd8c4a8); mkHouse(13, 16, 0xa8c4b8); mkHouse(-26, 16, 0xc8b0b8); mkHouse(26, 16, 0xd0d0b0);
    mkHouse(-8, -18, 0xc0b8d8, Math.PI); mkHouse(8, -18, 0xd8b8a0, Math.PI); mkHouse(24, -18, 0xb0c8d0, Math.PI); mkHouse(-24, -18, 0xd8d0c0, Math.PI);
    const flag = flagMesh("ca", 2.4, 1.3); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 })); pole.position.set(-5, 2.5, 6); flag.position.set(-3.75, 4.3, 6); scene.add(pole, flag);
    // streetlights
    const lampM = new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffc070, emissiveIntensity: 3 });
    for (const x of [-20, 0, 20]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 6), new THREE.MeshStandardMaterial({ color: 0x333 })); p.position.set(x + 6, 3, 2.6); scene.add(p);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), lampM); bulb.position.set(x + 6, 6, 1.9); scene.add(bulb);
      const sl = new THREE.SpotLight(0xffc27a, 120, 22, 0.8, 0.6, 1.6); sl.position.set(x + 6, 5.9, 1.9); sl.target.position.set(x + 6, 0, 0.5); scene.add(sl, sl.target); }
    // trees
    for (let i = 0; i < 14; i++) { const tr = new THREE.Group(); const x = (i % 2 ? 1 : -1) * (7 + Math.random() * 30), z = 8 + Math.random() * 20; if (Math.abs(x) < 6) continue;
      for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.8 - k * 0.45, 2, 7), new THREE.MeshStandardMaterial({ color: k % 2 ? 0x1f3d2c : 0xe6ecf5, flatShading: true })); c.position.y = 1.6 + k * 1.2; c.castShadow = true; tr.add(c); }
      tr.position.set(x, 0, z); scene.add(tr); }
    // parked car under snow
    const car = new THREE.Group(); const cb = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4.2), new THREE.MeshStandardMaterial({ color: 0x8a1a1a, roughness: 0.4, metalness: 0.4 })); cb.position.y = 0.8; car.add(cb);
    const ct = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.2), new THREE.MeshStandardMaterial({ color: 0x8a1a1a })); ct.position.y = 1.6; car.add(ct); const cs = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.4, 4.3), new THREE.MeshStandardMaterial({ color: 0xf4f7ff })); cs.position.y = 2.1; car.add(cs);
    car.traverse((o) => o.isMesh && (o.castShadow = true)); car.position.set(-4.2, 0, 9); scene.add(car);
    // snow grid (instanced)
    const N = GX * GZ; const h = new Float32Array(N); const sg = new THREE.BoxGeometry(CELL * 1.02, 1, CELL * 1.02); sg.translate(0, 0.5, 0);
    const snowMesh = new THREE.InstancedMesh(sg, new THREE.MeshStandardMaterial({ color: 0xf2f5ff, roughness: 1, map: snowTex }), N); snowMesh.castShadow = snowMesh.receiveShadow = true; scene.add(snowMesh);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
    const cellPos = (i) => [DX0 + (i % GX) * CELL + CELL / 2, DZ0 + Math.floor(i / GX) * CELL + CELL / 2];
    const setCell = (i) => { const [x, z] = cellPos(i); v1.set(x, 0, z); v2.set(1, Math.max(0.001, h[i]), 1); m4.compose(v1, q, v2); snowMesh.setMatrixAt(i, m4); };
    for (let i = 0; i < N; i++) { h[i] = 0.55 + Math.random() * 0.15; setCell(i); } snowMesh.instanceMatrix.needsUpdate = true;
    const windrowGeo = new THREE.CapsuleGeometry(0.6, GX * CELL - 0.6, 4, 10); windrowGeo.rotateZ(Math.PI / 2); const windrow = new THREE.Mesh(windrowGeo, new THREE.MeshStandardMaterial({ color: 0xd4d8e4, roughness: 1, map: snowTex })); windrow.position.set(0, 0, DZ0 + 0.4); windrow.scale.set(1, 0.001, 1); windrow.castShadow = true; scene.add(windrow);
    const banks = []; for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, GZ * CELL), new THREE.MeshStandardMaterial({ color: 0xeef2fb, roughness: 1, map: snowTex })); b.position.set(s * (GX * CELL / 2 + 1), 0.0, DZ0 + GZ * CELL / 2); b.scale.y = 0.4; b.castShadow = true; scene.add(b); banks.push(b); }
    // falling snow
    const flakesN = G.lowPower ? 900 : 2500; const fg = new THREE.BufferGeometry(); const fp = new Float32Array(flakesN * 3); for (let i = 0; i < flakesN; i++) { fp[i * 3] = (Math.random() - 0.5) * 60; fp[i * 3 + 1] = Math.random() * 20; fp[i * 3 + 2] = (Math.random() - 0.5) * 60; }
    fg.setAttribute("position", new THREE.BufferAttribute(fp, 3)); const flakes = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false })); scene.add(flakes);
    // shovel-throw particles
    const chunks = []; const chunkGeo = new THREE.IcosahedronGeometry(0.16, 0), chunkMat = new THREE.MeshStandardMaterial({ color: 0xf5f8ff, roughness: 1 });
    // player
    const you = makeGuy({ jersey: "#c8102e", trim: "#111", pants: "#2a3a5a", boot: "#3a2a1a", sock: "#2a3a5a", mullet: true });
    const toque = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.3, 10), new THREE.MeshStandardMaterial({ color: 0xc8102e })); toque.position.y = 0.36; you.userData.head.add(toque);
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff })); pom.position.y = 0.58; you.userData.head.add(pom);
    const shovel = new THREE.Group(); const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6), new THREE.MeshStandardMaterial({ color: 0x8a5a2b })); shaft.rotation.x = Math.PI / 2; shaft.position.z = 0.5; shovel.add(shaft);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x2a6adf, metalness: 0.3, roughness: 0.5 })); blade.position.z = 1.35; shovel.add(blade);
    shovel.position.set(0, -0.8, 0.1); you.userData.armR.add(shovel); you.userData.armsBusy = true; you.userData.armR.rotation.x = -0.9; you.userData.armL.rotation.x = -0.9;
    you.position.set(0, 0, DZ0 + GZ * CELL - 1); you.rotation.y = Math.PI; scene.add(you);
    const gord = makeGuy({ jersey: "#2f5d3a", pants: "#333" }); gord.position.set(12, 0, 5); gord.rotation.y = -Math.PI / 2; scene.add(gord);
    // plow truck
    const plow = new THREE.Group(); const yel = new THREE.MeshStandardMaterial({ color: 0xf2a900, roughness: 0.5 });
    const pb = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 2.6), yel); pb.position.set(-1, 1.7, 0); plow.add(pb); const pc = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.5), new THREE.MeshStandardMaterial({ color: 0xf28c00 })); pc.position.set(2.8, 2, 0); plow.add(pc);
    const pw = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial()); plow.add(pw);
    const ws = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 2.2), new THREE.MeshStandardMaterial({ color: 0x223, roughness: 0.1, metalness: 0.8 })); ws.position.set(3.92, 2.5, 0); plow.add(ws);
    const bladeP = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.3, 4.2), new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.6, roughness: 0.4 })); bladeP.position.set(4.6, 0.65, 0); bladeP.rotation.y = 0.35; plow.add(bladeP);
    for (const [x, z] of [[-3, 1.3], [-3, -1.3], [2.5, 1.3], [2.5, -1.3]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0x111 })); w.rotation.x = Math.PI / 2; w.position.set(x, 0.6, z); plow.add(w); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1), new THREE.MeshStandardMaterial({ map: textTex("MUNICIPAL SNOW RETURN", { w: 512, h: 96, bg: "#111", fg: "#f2a900", font: "bold 40px Arial Black" }) })); sign.position.set(-1, 1.9, 1.31); plow.add(sign);
    const ambers = []; for (const z of [-0.8, 0.8]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff9a00, emissive: 0xff8000, emissiveIntensity: 4 })); b.position.set(2.8, 3.2, z); plow.add(b); ambers.push(b); }
    const amberL = new THREE.PointLight(0xff9000, 30, 16, 1.6); amberL.position.set(2.8, 3.8, 0); plow.add(amberL);
    const head = new THREE.SpotLight(0xfff4d0, 200, 40, 0.5, 0.5, 1.4); head.position.set(4, 1.6, 0); head.target.position.set(14, 0, 0); plow.add(head, head.target);
    plow.traverse((o) => o.isMesh && (o.castShadow = true)); plow.position.set(-90, 0, -3.2); scene.add(plow);

    const DUR = 150; const st = { plowX: -90, plowActive: false, dumped: false, nextPlow: 26, visits: 0, shoveled: 0, swing: 0, bestClear: 0, gordCD: 12, cold: 0 };
    const clearPct = () => { let c = 0; for (let i = 0; i < N; i++) if (h[i] < 0.08) c++; return c / N; };
    const callPlow = () => { if (st.plowActive) return; st.plowActive = true; st.dumped = false; st.plowX = -70; G.toast("A low rumble from the end of the street…", "🚨 "); G.sfx.rumble(); };
    const throwSnow = (x, z, amt) => { for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(chunkGeo, chunkMat); c.position.set(x, 1.2, z); const side = x < 0 ? -1 : 1; c.userData.v = new THREE.Vector3(side * (3 + Math.random() * 3), 4 + Math.random() * 2, (Math.random() - 0.5) * 2); c.userData.life = 1.2; scene.add(c); chunks.push(c); }
      const bank = banks[x < 0 ? 0 : 1]; bank.scale.y = Math.min(3.2, bank.scale.y + amt * 0.08); };

    return {
      st,
      timeLeft: () => DUR - G.time,
      update(dt) {
        const t = G.time; waveFlag(flag, t);
        // dusk -> night progression
        const k = clamp(t / DUR, 0, 1); sun.intensity = 1.4 * (1 - k) + 0.15; hemi.intensity = 0.9 - k * 0.45; sun.position.y = 12 - k * 9;
        // snowfall
        const p = fg.attributes.position.array, yp = you.position; for (let i = 0; i < flakesN; i++) { p[i * 3 + 1] -= dt * (1.2 + (i % 7) * 0.15); p[i * 3] += Math.sin(t + i) * dt * 0.3; if (p[i * 3 + 1] < 0) { p[i * 3 + 1] = 18; p[i * 3] = yp.x + (Math.random() - 0.5) * 60; p[i * 3 + 2] = yp.z + (Math.random() - 0.5) * 60; } } fg.attributes.position.needsUpdate = true;
        // slow accumulation
        if (Math.random() < dt * 3) { const i = Math.floor(Math.random() * N); h[i] = Math.min(0.8, h[i] + 0.04); setCell(i); snowMesh.instanceMatrix.needsUpdate = true; }
        // player
        const busy = G.input.actionHeld; const spd = G.controlCharacter(you, this.vel || (this.vel = new THREE.Vector3()), dt, { speed: busy ? 2.4 : 4.4, sprint: busy ? 3 : 7, bounds: [-30, 30, -6, DZ0 + GZ * CELL + 0.2] });
        // walking through deep snow slows you (simple)
        animateGuy(you, spd, dt);
        // shovel target cell in front
        const f = you.rotation.y, fx = you.position.x + Math.sin(f) * 0.9, fz = you.position.z + Math.cos(f) * 0.9; const ci = Math.floor((fx - DX0) / CELL), cj = Math.floor((fz - DZ0) / CELL);
        let target = -1; if (ci >= 0 && ci < GX && cj >= 0 && cj < GZ) target = cj * GX + ci;
        const onWindrow = windrow.scale.y > 0.05 && Math.abs(fz - windrow.position.z) < 1 && Math.abs(fx) < GX * CELL / 2;
        st.swing = busy ? st.swing + dt * 9 : 0; you.userData.armR.rotation.x = -0.9 + (busy ? Math.sin(st.swing) * 0.5 : 0); you.userData.armL.rotation.x = you.userData.armR.rotation.x;
        if ((target >= 0 && h[target] > 0.05) || onWindrow) { G.prompt(busy ? "Shovelling…" : "Hold to shovel");
          if (busy) { const amt = dt * 1.1; if (onWindrow && (target < 0 || h[target] < 0.05)) { windrow.scale.y = Math.max(0.001, windrow.scale.y - amt * 0.6); } else { const took = Math.min(h[target], amt); h[target] -= took; setCell(target); snowMesh.instanceMatrix.needsUpdate = true; st.shoveled += took; G.score += took * 40; }
            if (Math.sin(st.swing) > 0.95 && !this._thr) { this._thr = true; G.sfx.scrape(); throwSnow(you.position.x, you.position.z, 1); } if (Math.sin(st.swing) < 0) this._thr = false; } }
        else G.prompt(busy ? "Nothing to shovel here (for now)" : "");
        for (let i = chunks.length - 1; i >= 0; i--) { const c = chunks[i]; c.userData.v.y -= 15 * dt; c.position.addScaledVector(c.userData.v, dt); c.userData.life -= dt; if (c.userData.life < 0 || c.position.y < 0) { scene.remove(c); chunks.splice(i, 1); } }
        // cold pressure (the hate index rises as you freeze)
        G.addHate(dt * (busy ? 0.18 : 0.3));
        const cp = clearPct(); st.bestClear = Math.max(st.bestClear, cp);
        document.getElementById("lvlInfo").innerHTML = `<span style="color:#cfe3ff">DRIVEWAY CLEAR: <b>${Math.round(cp * 100)}%</b></span> · plow visits: ${st.visits}`;
        // plow logic: >55% clear summons immediately, or periodic
        if (!st.plowActive && (cp > 0.55 || G.time > st.nextPlow)) callPlow();
        if (st.plowActive) { st.plowX += dt * 13; plow.position.x = st.plowX; const fl = Math.sin(t * 14) > 0; ambers[0].material.emissiveIntensity = fl ? 6 : 0.5; ambers[1].material.emissiveIntensity = fl ? 0.5 : 6; amberL.intensity = 18 + Math.sin(t * 14) * 14;
          if (!st.dumped && st.plowX > -4) { st.dumped = true; st.visits++; windrow.scale.y = 1.4; for (let r = 0; r < Math.min(GZ, 4 + st.visits * 2); r++) for (let c = 0; c < GX; c++) { const i = r * GX + c; h[i] = Math.max(h[i], 0.7 - r * 0.04); setCell(i); } snowMesh.instanceMatrix.needsUpdate = true;
            G.addHate(14 + cp * 10, "plow returned your snow"); G.toast(pick(PLOW_LINES), "🚜 "); G.sfx.thud(); G.sfx.boo(); for (let k = 0; k < 10; k++) throwSnow((Math.random() - 0.5) * 4, DZ0, 0); }
          if (Math.abs(st.plowX - you.position.x) < 4 && you.position.z < 1.2) { you.position.z = 1.4; G.floatText("The plow does not yield. You yield."); }
          if (st.plowX > 90) { st.plowActive = false; st.nextPlow = G.time + 24 + Math.random() * 10; } }
        st.gordCD -= dt; if (st.gordCD < 0) { st.gordCD = 18 + Math.random() * 10; G.toast(pick(NEIGHBOR).replace(/^[^:]+: /, ""), "🏠 Gord: "); }
        animateGuy(gord, 0, dt);
        G.updateCamera(you, dt, { height: 2.0, dist: 6.5, minY: 1.0 });
        if (t >= DUR) G.finish(true, "time");
      },
      result(cleared, reason) {
        return { cleared: true, score: G.score, lines: [`Snow moved: ${st.shoveled.toFixed(1)} m³`, `Best clear: ${Math.round(st.bestClear * 100)}% · Plow visits: ${st.visits}`, `Driveway status: NOT CLEAR (by municipal design)`],
          verdict: reason === "meltdown" ? "You went inside, sat in the dark and composed a 4-page email to the city. It was very polite." : st.visits > 2 ? "The plow came back. And back. It loves you, in its way." : pick(["You cleared it. Briefly. Like Canadian optimism.", "Gord says 'rough one, bud.' Gord is right."]) };
      },
    };
  },
};

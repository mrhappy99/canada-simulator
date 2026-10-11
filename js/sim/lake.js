// LAKE AMERICA — third-person canoe. Big flag boats' wakes wash away your catch.
import { THREE, makeGuy, lightRig, canvasTex, textTex, flagMesh, waveFlag, pick, clamp } from "./engine.js";
const BOAT_LINES = ["WELCOME TO LAKE AMERICA!", "THIS LAKE IS FREEDOM-SIZED", "NICE CANOE, BUDDY", "WE RENAMED THE FISH TOO"];
export const Lake = {
  id: "lake", name: "Lake America", icon: "🛶", color: "linear-gradient(135deg,#1a6a8a,#b22234)", bloom: 0.4,
  tagline: "Formerly Lake Ontario. Your life jacket says SORRY.",
  goal: "Paddle to fishing spots and hold E to fish. Avoid boat wakes.",
  intro: "WASD paddles the canoe. Glowing rings are fishing spots: hold E to reel. Huge flag boats throw wakes that wash away your catch.",
  create(G, scene) {
    lightRig(scene, { bg: 0x9cc7e8, fogColor: 0xa9cbe4, fogNear: 40, fogFar: 180, sunPos: [40, 50, 20], shadowSize: 25, low: G.lowPower });
    const seg = G.lowPower ? 60 : 110; const wg = new THREE.PlaneGeometry(300, 300, seg, seg); wg.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: 0x2a6f9a, roughness: 0.15, metalness: 0.35, flatShading: true })); water.receiveShadow = true; scene.add(water);
    const base = wg.attributes.position.array.slice();
    const shore = new THREE.Mesh(new THREE.CylinderGeometry(160, 170, 3, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x2f5a3a, side: THREE.BackSide })); shore.position.y = 0.5; scene.add(shore);
    for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, r = 150 + Math.random() * 8; const tr = new THREE.Mesh(new THREE.ConeGeometry(3, 10, 6), new THREE.MeshStandardMaterial({ color: 0x1f4a2c, flatShading: true })); tr.position.set(Math.cos(a) * r, 5, Math.sin(a) * r); scene.add(tr); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshStandardMaterial({ map: textTex("LAKE AMERICA (formerly Ontario)", { w: 1024, h: 200, bg: "#fff", fg: "#b22234", font: "bold 70px Arial Black" }) })); sign.position.set(0, 14, -150); scene.add(sign);
    // canoe + paddler
    const canoe = new THREE.Group(); const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.5, side: THREE.DoubleSide })); hull.scale.set(0.8, 0.5, 3.2); hull.position.y = 0.45; canoe.add(hull);
    const guy = makeGuy({ jersey: "#ff7a00", trim: "#fff", pants: "#2a3a5a" }); guy.scale.setScalar(0.7); guy.position.y = -0.1; canoe.add(guy);
    guy.userData.legL.rotation.x = guy.userData.legR.rotation.x = -1.4; guy.userData.armsBusy = true;
    const vest = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshStandardMaterial({ map: textTex("SORRY", { w: 256, h: 128, bg: "#ff7a00", font: "bold 72px Arial Black" }) })); vest.position.set(0, 1.45, -0.29); vest.rotation.y = Math.PI; guy.userData.body.add(vest);
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2), new THREE.MeshStandardMaterial({ color: 0x8a5a2b })); paddle.position.set(0, -0.8, 0.3); guy.userData.armR.add(paddle);
    canoe.traverse((o) => o.isMesh && (o.castShadow = true)); scene.add(canoe);
    const spots = []; for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(2, 0.12, 8, 32), new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffcc00, emissiveIntensity: 2 })); r.rotation.x = Math.PI / 2; scene.add(r); spots.push(r); }
    const placeSpot = (s) => { const a = Math.random() * 6.28, d = 15 + Math.random() * 60; s.position.set(Math.cos(a) * d, 0.3, Math.sin(a) * d); }; spots.forEach(placeSpot);
    const boats = []; for (let i = 0; i < 3; i++) { const b = new THREE.Group(); const bh = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })); bh.position.y = 1.2; b.add(bh);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 5), new THREE.MeshStandardMaterial({ color: 0x1a3a8a })); cab.position.set(0, 3.4, -1); b.add(cab); const fl = flagMesh("us", 6, 3.4); fl.position.set(0, 7, -5); fl.rotation.y = Math.PI / 2; b.add(fl); b.userData.flag = fl;
      b.traverse((o) => o.isMesh && (o.castShadow = true)); b.userData.a = (i / 3) * 6.28; b.userData.r = 35 + i * 22; b.userData.sp = 0.12 + i * 0.03; scene.add(b); boats.push(b); }
    const vel = new THREE.Vector3(); let heading = 0, fishing = 0; const DUR = 120; const st = { fish: 0, lost: 0, wakes: 0, cd: 0 };
    return {
      timeLeft: () => DUR - G.time,
      update(dt) {
        const t = G.time, p = wg.attributes.position.array, cp = canoe.position;
        for (let i = 0; i < p.length; i += 3) { const x = base[i], z = base[i + 2]; let y = Math.sin(x * 0.15 + t) * 0.18 + Math.cos(z * 0.2 + t * 1.3) * 0.14;
          for (const b of boats) { const dx = x - b.position.x, dz = z - b.position.z, d = Math.sqrt(dx * dx + dz * dz); if (d < 30) y += Math.sin(d * 0.8 - t * 6) * (1 - d / 30) * 0.9; } p[i + 1] = y; }
        wg.attributes.position.needsUpdate = true; if (!G.lowPower) wg.computeVertexNormals();
        const m = G.input.move(); heading -= m.x * dt * 1.6; const thrust = m.y * (m.sprint ? 9 : 5.5); vel.x += (Math.sin(heading) * thrust - vel.x) * dt * 1.2; vel.z += (Math.cos(heading) * thrust - vel.z) * dt * 1.2;
        cp.addScaledVector(vel, dt); const R = Math.hypot(cp.x, cp.z); if (R > 140) cp.multiplyScalar(140 / R); canoe.rotation.y = heading;
        canoe.position.y = Math.sin(t * 1.5) * 0.1; canoe.rotation.z = Math.sin(t * 1.2) * 0.05; guy.userData.armR.rotation.x = -0.5 + Math.sin(t * 4) * 0.5 * Math.abs(m.y);
        G.input.yaw += (heading - G.input.yaw) * dt * 1.5 * (Math.abs(m.y) > 0 ? 1 : 0);
        let near = null; for (const s of spots) { s.rotation.z += dt; if (s.position.distanceTo(cp) < 3) near = s; }
        if (near) { G.prompt(G.input.actionHeld ? `Reeling… ${Math.round(fishing * 100)}%` : "Hold to fish"); if (G.input.actionHeld) { fishing += dt / 2.5; if (fishing >= 1) { fishing = 0; st.fish++; G.score += 100; G.sfx.ding(); G.floatText("🐟 Caught a fish! (renamed: Freedom Perch)"); placeSpot(near); } } else fishing = Math.max(0, fishing - dt); }
        else { G.prompt(""); fishing = 0; }
        st.cd -= dt;
        for (const b of boats) { b.userData.a += dt * b.userData.sp; const a = b.userData.a; b.position.set(Math.cos(a) * b.userData.r, 0, Math.sin(a) * b.userData.r); b.rotation.y = -a; waveFlag(b.userData.flag, t);
          const d = b.position.distanceTo(cp); if (d < 14 && st.cd < 0) { st.cd = 4; st.wakes++; const lost = Math.min(st.fish, 1 + Math.floor(st.fish / 2)); st.fish -= lost; st.lost += lost; G.score = Math.max(0, G.score - lost * 60);
            G.addHate(12, lost ? `wake took ${lost} fish` : "wake"); G.sfx.splash(); G.toast(pick(BOAT_LINES), "📢 Yacht: "); vel.add(new THREE.Vector3().subVectors(cp, b.position).setY(0).normalize().multiplyScalar(8)); } }
        G.addHate(dt * 0.12);
        document.getElementById("lvlInfo").innerHTML = `🐟 In cooler: <b>${st.fish}</b> · washed away: ${st.lost}`;
        G.updateCamera(canoe, dt, { height: 1.6, dist: 9, minY: 1.5, eye: 1.4 });
        if (t >= DUR) G.finish(true, "time");
      },
      result(cleared, reason) { return { cleared: true, score: G.score, lines: [`Fish kept: ${st.fish} · washed away: ${st.lost}`, `Wakes absorbed: ${st.wakes}`, "Lake name status: still 'America'"], verdict: reason === "meltdown" ? "You capsized out of pure indignation. The lake kept the name." : st.lost > st.fish ? "The yachts kept your fish. And the lake. And waved." : "A decent haul, enjoyed quietly, under someone else's flag." }; },
    };
  },
};

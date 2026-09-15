# Canada Simulator

Affectionate, self-deprecating Canada–US rivalry satire. You want Canada to win. The systems are rigged. Caring is punished.

**Flagship:** **Saturday Night Canada** — full **3D WebGL** (Three.js) apartment euchre with large low-poly hosers.

**Legacy:** Canvas 2D Super Chexx / bubble-hockey cartoon for **The Rink** and **The Driveway** (plus the old flat SNC).

## Quick start

```bash
cd canada-simulator
python3 -m http.server 8080
# open http://localhost:8080/          → 3D Saturday Night Canada
#      http://localhost:8080/snc-3d.html
#      http://localhost:8080/legacy-2d.html
```

Needs a static HTTP server (or GitHub Pages). ES modules + Three.js CDN do not load reliably from `file://`.

**No npm / no bundler.** Deploy the folder as static files.

## Files

| Path | Role |
|---|---|
| `index.html` | Flagship **3D** Saturday Night Canada (GitHub Pages entry) |
| `snc-3d.html` | Same 3D experience (explicit URL) |
| `js/snc-scene.js` | Three.js room, large characters, idle / knives gag |
| `js/euchre.js` | Playable euchre + joke bias / Hate Index / TV boos |
| `legacy-2d.html` | Full **Canvas 2D** game (Rink · SNC · Driveway) |
| `canada-simulator-2d.html` | Same as legacy (Pages-friendly alias) |
| `canada-simulator.html` | Original 2D single-file (kept; do not delete) |
| `README.md` | This file |

## How to play — Saturday Night Canada (3D)

1. Open `index.html` / `snc-3d.html` via HTTP → click **Play, eh** (first tap unlocks sound)
2. **Look around:** drag to orbit · scroll/pinch to zoom · **Reset view** restores framing
3. Watch the **deal** (cards fly) and **upcard** on the beat-up folding vinyl table, then bid
4. **Bid:** Order it up / Pass; round 2 name trump (not the upcard suit)
5. **Discard:** If you are dealer and pick up, tap one card to bury
6. **Play:** Tap highlighted legal cards; trick cards stay visible on the table with a play feed
7. **Mute** toggles ambient HNIC crowd, card slap, and hoser mutter
8. **Hot knives:** small side toast when Gary walks in (not a full-screen modal)
9. Match ends ~5 points or ~4 hands — hosers don’t win cleanly; Hate Index rises with HNIC boos

**Mobile:** large tap targets on cards and bid buttons; drag on the 3D view to look.

## How to play — Legacy 2D

Open `legacy-2d.html` (or `canada-simulator.html`):

- **The Rink:** WASD/arrows skate · click/F shoot · Space fight
- **Saturday Night Canada (2D):** tap cards to bid & play
- **The Driveway:** move & shovel; the plow always returns

## Tech choices (3D)

- **Three.js r170** via CDN `importmap` (jsDelivr)
- Perspective camera, hemisphere + directional soft shadows (1024 map)
- Procedural low-poly characters (readable faces, 1970s hair/stubble, jersey colors) — **no helmets**
- Apartment set: wood panel walls, carpet, **old folding vinyl card table** (beige-brown, burns, coffee rings, aluminum edge, metal legs), folding chairs, stubbies, ashtray, maple afghan, CRT with HNIC “CAN losing” canvas texture
- **OrbitControls** (drag look / pinch zoom, clamped); Reset view button
- Characters: eyes+pupils, brows, nose, mouth, ears, mullet/sideburns/stubble, blink & talk idles; distinct You / Doug / Chad / Brad / Gary
- Cards / bids as **HTML overlay HUD**; textured 3D trick + upcard + trump disc on the table; side **Table talk** feed
- WebAudio ambient crowd + card slap / deal whoosh + speechSynthesis mutter; visible mute toggle
- Idle loops: breathing, blink, head look-at-table, beer lift; knives buddy walk-in from kitchen doorway

## Joke engine (do not “fix”)

- **Euchre:** Doug donut AI, trick steals when you care, renege vibes, HNIC TV boos raise Hate Index; match tally biases Chad/Brad
- **Rink (2D):** `CANADA_LOSE_MULTIPLIER = 0` — Canadian goals never count
- **Driveway (2D):** shovel summons the plow; snow always returns

**Tone:** Punch clichés & institutions — not real civilian identity groups. Hot knives = comedy only.

## Limits vs India Simulator–class bar

| | This build | India Simulator (north star) |
|---|---|---|
| Characters | Large stylized low-poly, readable faces | Often richer mesh / animation sets |
| Environment | One apartment set, props, CRT | Broader location variety |
| Animation | Idle + knives walk-in | More authored cutscenes / locomotion |
| Gameplay depth | Full euchre loop + gag bias | Broader mini-game suite |
| Pipeline | Static HTML + CDN, no build | May use heavier tooling |

Goal met: **first load feels like a 3D browser game** with characters filling a medium shot — not flat chairs-and-nameplates.

## Known limits

- Euchre is legal-*ish* North American; AI is cartoonish and intentionally biased
- Shadows / poly count kept modest for laptop + mobile WebGL
- Online CDN required for Three.js unless you vendor `three.module.js`
- Procedural look (not photo-real); speech/audio from legacy 2D not fully ported to 3D HUD

## Creative north star

> You want Canada to win. You try. The systems are rigged. Caring is punished.

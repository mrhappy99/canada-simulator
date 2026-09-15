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
| `js/snc-scene.js` | Three.js room, characters, You marker, knives, OrbitControls |
| `js/euchre.js` | Playable euchre + team choice + joke bias / Hate Index |
| `legacy-2d.html` | Full **Canvas 2D** game (Rink · SNC · Driveway) |
| `canada-simulator-2d.html` | Same as legacy (Pages-friendly alias) |
| `canada-simulator.html` | Original 2D single-file (kept; do not delete) |
| `README.md` | This file |

## How to play — Saturday Night Canada (3D)

### Controls

| Action | How |
|---|---|
| **Choose team** | Title screen: **Canadian** or **American** (before any hand) |
| **Look around** | Drag to orbit · scroll/pinch to zoom · **Reset view** |
| **Bid** | **Order it up** / **Pass**; round 2 name trump ≠ upcard suit |
| **Discard** | If you are dealer and pick up, tap one card to bury |
| **Play** | Tap **gold-highlighted** legal cards only (illegal dimmed/disabled) |
| **Mute** | Ambient HNIC crowd, card slap, trump boo/yay, knives sizzle |
| **Hot knives** | Side toast when Gary walks in with metal butter knives |

### Identity & team choice

- Your character is always labeled **You** (nameplate, HUD, feed, trick tags).
- **Canadian (Hosers):** You + Doug vs Chad/Brad. Status: `Playing as You (Hosers)`.
- **American (Yanks):** You sit as a Chad-type (blue jersey) with Brad vs Doug/Wayne. Status: `Playing as You (Yanks)`.
- You sit at the **near edge** of the table; gold **arrow + glow ring** mark your seat. Camera defaults high / top-down-oblique so the folding table, upcard, and tricks are readable.
- **Joke engine:** Americans **always** win the match regardless of which seat you chose — caring is punished. Hate Index still rises with HNIC boos.

### Flow (coach marks on first run)

1. Choose team → **Play**
2. Watch the **deal** (cards fly)
3. See the **upcard** on the burnt vinyl table → Order up / Pass
4. Play **legal** cards; big **YOUR TURN** when it’s you; others dim
5. Trick cards stay on the table with **owner tags** until the trick resolves
6. Feed always says who played what

### Trump reactions (euchre, not politics)

Whenever trump is **named / ordered / led**: Canadians **boo**, Americans **yay** — crowd SFX, speech bubbles on characters, and feed line.

### Hot knives

Actual **metal butter knives** with black/burnt tips. When tips touch: **smoke puff + sizzle**, Gary mimes the hit.

## How to play — Legacy 2D

Open `legacy-2d.html` (or `canada-simulator.html`):

- **The Rink:** WASD/arrows skate · click/F shoot · Space fight
- **Saturday Night Canada (2D):** tap cards to bid & play
- **The Driveway:** move & shovel; the plow always returns

## Tech choices (3D)

- **Three.js r170** via CDN `importmap` (jsDelivr)
- Perspective camera, hemisphere + directional soft shadows (1024 map)
- Procedural low-poly characters (readable faces, 1970s hair/stubble) — **no helmets**
- Apartment set: wood panel walls, carpet, **old folding vinyl card table** (beige-brown, burns, coffee rings, aluminum edge, metal legs), folding chairs, stubbies, ashtray, maple afghan, CRT with HNIC “CAN losing” canvas texture
- **OrbitControls** (drag look / pinch zoom, clamped); Reset view button
- Cards / bids as **HTML overlay HUD**; textured 3D trick + upcard + trump disc; side **Table talk** feed
- WebAudio ambient crowd + card slap / deal whoosh / trump boo+yay / knives sizzle; speechSynthesis mutter; mute toggle
- Idle loops: breathing, blink, head look-at-table, beer lift; knives buddy walk-in from kitchen

## Joke engine (do not “fix”)

- **Euchre:** team choice; Doug/partner donut AI; trick steals when you care; HNIC TV boos raise Hate Index; **match always ends with Americans ahead**
- **Rink (2D):** `CANADA_LOSE_MULTIPLIER = 0` — Canadian goals never count
- **Driveway (2D):** shovel summons the plow; snow always returns

**Tone:** Punch clichés & institutions — not real civilian identity groups. Hot knives = comedy only.

## Limits vs India Simulator–class bar

| | This build | India Simulator (north star) |
|---|---|---|
| Characters | Large stylized low-poly, readable faces | Often richer mesh / animation sets |
| Environment | One apartment set, props, CRT | Broader location variety |
| Animation | Idle + knives walk-in / mime | More authored cutscenes / locomotion |
| Gameplay depth | Full euchre loop + team choice + gag bias | Broader mini-game suite |
| Pipeline | Static HTML + CDN, no build | May use heavier tooling |

## Known limits

- Euchre is legal-*ish* North American; AI is cartoonish and intentionally biased
- Shadows / poly count kept modest for laptop + mobile WebGL
- Online CDN required for Three.js unless you vendor `three.module.js`
- Procedural look (not photo-real)

## Creative north star

> You want Canada to win. You try. The systems are rigged. Caring is punished.

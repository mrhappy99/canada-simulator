# Canada Simulator

Affectionate, self-deprecating Canada–US rivalry satire. You want Canada to win. The systems are rigged. Caring is punished.

**Flagship:** **Saturday Night Canada** — full **3D WebGL** (Three.js) apartment euchre with large low-poly hosers.

**Full Campaign (2D):** Canvas game with the original level map — **The Rink · The Boardroom · Lake America · Québec · Parliament · Finale**, plus Saturday Night Canada (2D) and The Driveway. Open `legacy-2d.html`.

## Quick start

```bash
cd canada-simulator
python3 -m http.server 8080
# open http://localhost:8080/          → 3D Saturday Night Canada
#      http://localhost:8080/snc-3d.html
#      http://localhost:8080/legacy-2d.html   → Full Campaign (2D)
```

Needs a static HTTP server (or GitHub Pages). ES modules + Three.js CDN do not load reliably from `file://`.

**No npm / no bundler.** Deploy the folder as static files.

## Files

| Path | Role |
|---|---|
| `index.html` | Flagship **3D** Saturday Night Canada (GitHub Pages entry) — links to Full Campaign (2D) |
| `snc-3d.html` | Same 3D experience (explicit URL) |
| `js/snc-scene.js` | Three.js room, characters, You marker, knives, OrbitControls |
| `js/euchre.js` | Playable euchre + team choice + joke bias / Hate Index |
| `legacy-2d.html` | Full **Canvas 2D** campaign (Rink · Boardroom · Lake · Québec · Parliament · Finale · SNC · Driveway) |
| `canada-simulator-2d.html` | Same as legacy (Pages-friendly alias) |
| `canada-simulator.html` | Primary 2D single-file source (kept in sync with legacy) |
| `README.md` | This file |

## 2D Campaign levels

| Level | Type | Punchline | Hate |
|---|---|---|---|
| **The Rink** | Playable hockey + fights | Canada never scores; lose every fight | + during play |
| **The Boardroom** | Dialogue / choices | Steamrolled; stapler stolen; only “win” is apologize + double-double | +10 |
| **Lake America** | Canoe on renamed lake | SORRY life jacket; flag boats; fishing washed by wake | +8 |
| **Québec** | Castle + taunts | Monty Python French taunters; courage → drawbridge; great poutine, emotional wound | +12 |
| **Parliament** | Bile auction | Red vs blue hate auction; Carney/Ford empty speeches; building sags; army letter | +15 |
| **Finale** | Cutscene | Map fades: “This used to be ours.” | frozen |
| Saturday Night Canada | Euchre (also 3D flagship) | Americans always ahead | + during play |
| The Driveway | Shovel mini-game | Municipal plow always returns the snow | + during play |

**Play All** (2D menu): Rink → Boardroom → Lake → Québec → Parliament → Finale. Persistent **America Hate Index** (session never resets downward).

### Data-driven jokes (edit arrays in the 2D HTML)

- `CANADA_FIGHT_LINES`, `USA_CROWD_LINES`, `RESULT_VERDICTS`
- `BOARDROOM_LINES`, `LAKE_SIGNS`, `QUEBEC_TAUNTS`
- `PARLIAMENT_RED`, `PARLIAMENT_BLUE`
- `HOSER_LINES`, `DRIVEWAY_LINES`, etc.

Lose-multiplier for the rink: search `CANADA_LOSE_MULTIPLIER` (must stay `0` so Canadian goals never count).

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

## How to play — Full Campaign (2D)

Open `legacy-2d.html` (or `canada-simulator.html` / `canada-simulator-2d.html`):

- **The Rink:** WASD/arrows skate · click/F shoot · Space fight
- **The Boardroom:** tap dialogue choices (stapler always emigrates)
- **Lake America:** WASD paddle · click/Space fish · avoid flag-boat wake
- **Québec:** click to endure taunts · fill Courage · enter for poutine
- **Parliament:** click red/blue benches · optional army beat
- **Play All:** sequences campaign levels into the Finale
- **Saturday Night Canada (2D):** tap cards to bid & play
- **The Driveway:** move & shovel; the plow always returns

From the 3D title screen: **Full Campaign (2D) — Campaign: Rink · Boardroom · Lake · Québec · Parliament** → `legacy-2d.html`.

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
- **Boardroom:** every path loses the stapler; apologize + double-double is the only “win”
- **Lake:** fishing washed by wake; lake renamed Lake America
- **Québec:** taunts never repeat the same line twice in a row; poutine is genuinely great
- **Parliament:** both sides only auction who hates America more; building sags
- **Driveway (2D):** shovel summons the plow; snow always returns

**Tone:** Punch clichés & institutions — not real civilian identity groups. Hot knives = comedy only.

## Limits vs India Simulator–class bar

| | This build | India Simulator (north star) |
|---|---|---|
| Characters | Large stylized low-poly, readable faces | Often richer mesh / animation sets |
| Environment | One apartment set, props, CRT | Broader location variety |
| Animation | Idle + knives walk-in / mime | More authored cutscenes / locomotion |
| Gameplay depth | Full euchre loop + 2D campaign suite | Broader mini-game suite |
| Pipeline | Static HTML + CDN, no build | May use heavier tooling |

## Known limits

- Euchre is legal-*ish* North American; AI is cartoonish and intentionally biased
- Shadows / poly count kept modest for laptop + mobile WebGL
- Online CDN required for Three.js unless you vendor `three.module.js`
- Procedural look (not photo-real)
- 2D campaign levels are short satirical sketches (~2–3 min each), not sims

## Creative north star

> You want Canada to win. You try. The systems are rigged. Caring is punished.

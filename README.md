# Canada Simulator

Affectionate, self-deprecating Canada–US rivalry satire. You want Canada to win. The systems are rigged. Caring is punished.

**Visual style:** Super Chexx / bubble-hockey chunky **1970s** flat-vector cartoon (not photo-real). Canvas 2D single-file.

## Levels (main menu)

| Level | What you do | The joke |
|---|---|---|
| **The Rink** | Team pick → bubble hockey → fights | Canada never scores; fights are one-punch KOs |
| **Saturday Night Canada** | 4-handed euchre in a hoser apartment | Partner plays like a donut; Chad/Brad take the euchre |
| **The Driveway** | Shovel ~3 ft of snow | Municipal plow **always** dumps it back |

Stubs (menu only): Boardroom · Lake America · Québec · Parliament

## Files

- `canada-simulator.html` — complete playable game (Canvas 2D + vanilla JS, no build)
- `README.md` — this file

## How to open

```bash
# double-click the HTML, or:
python3 -m http.server 8080
# http://localhost:8080/canada-simulator.html
```

No backend, no npm.

## Controls

**The Rink:** WASD/arrows skate · mouse aim · click/F shoot · Space/near-click fight. Mobile: drag skate · tap shoot · SHOOT/FIGHT buttons.

**Saturday Night Canada:** tap/click cards to bid & play · hot-knives gag buttons when the stoner appears.

**The Driveway:** WASD/arrows or drag/tap to move & shovel toward the pointer.

## Joke engine (do not “fix”)

- **Rink:** `CANADA_LOSE_MULTIPLIER = 0` + `denyCanadianGoal()` — Canadian goals never count when playing Canada.
- **Euchre:** partner (Doug) donut AI, trick steals when you care, renege vibes, HNIC TV boos raise Hate Index; match tally biases Americans.
- **Driveway:** clearing snow only summons the plow sooner; `drivewayDumpSnow()` always refills the grid.

## Joke / dialogue arrays (top of `<script>`)

**Rink:** `CANADA_FIGHT_LINES`, `USA_CROWD_LINES`, `RESULT_VERDICTS`, `CANADA_MISS_LINES`, `REF_LINES`, `ZAMBONI_LINES`, `ANNOUNCER_LINES`, roster names.

**Saturday Night:** `HOSER_LINES`, `STONER_LINES`, `EUCHRE_BANTER`, `TV_BOOS`, `HOT_KNIVES_LINES`, `SNC_RESULT_VERDICTS`.

**Driveway:** `DRIVEWAY_LINES`, `PLOW_LINES`, `DRIVEWAY_RESULT_VERDICTS`.

**Tone:** Punch clichés & institutions — not real civilian identity groups.

## Match flow

1. Main menu → pick a level  
2. Play (rink ~105s / euchre to ~5 pts or ~4 hands / driveway ~75s)  
3. Results card + Hate Index → Again or Main Menu  

Hate Index persists for the page session; refresh resets it.

## Known limits

- Euchre is legal-*ish* North American (bowers, order-up, name trump); AI is cartoonish and intentionally biased.
- Hot knives = set-piece comedy only (woozy tilt), not instructional.
- Procedural Web Audio + SpeechSynthesis; captions/text always work muted.
- Single HTML file; mobile-friendly taps; not a native app.

## Creative north star

> You want Canada to win. You try. The systems are rigged. Caring is punished.

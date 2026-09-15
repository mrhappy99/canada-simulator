# Canada Simulator — Level 1: The Rink

Affectionate, self-deprecating Canada–US rivalry satire. You want Canada to win. The systems are rigged. Caring is punished.

**v1 scope:** Level 1 vertical slice only (team pick → playable hockey → fights → Hate Index → results card).

## Files

- `canada-simulator.html` — complete playable single-file game (Canvas 2D + vanilla JS, no build step)
- `README.md` — this file

## How to open / serve

**Option A — double-click**

Open `canada-simulator.html` in a modern browser (Chrome, Firefox, Edge, Safari).

**Option B — static server**

```bash
cd /path/to/canada-simulator
python3 -m http.server 8080
# then visit http://localhost:8080/canada-simulator.html
```

No backend, no login, no npm install.

## Controls

### Desktop

| Input | Action |
|---|---|
| **WASD** or **Arrow keys** | Skate |
| **Mouse** | Aim |
| **Left click** or **F** | Shoot (Canada has a slow wet-cardboard windup) |
| **Space** or **click near an opponent** | Start a fight |

### Mobile / touch (phone browser)

Touch UI appears on coarse-pointer devices or narrow screens. Desktop keys/mouse still work.

| Input | Action |
|---|---|
| **Drag on the ice** | Skate toward your finger; release to coast |
| **Tap** (away from foes) | Shoot toward the tap |
| **Tap near an opponent** | Start a fight |
| **SHOOT** / **FIGHT** buttons | Bottom-right on-screen cluster (same actions) |

Team pick and results buttons use larger tap targets (~44px+). Canvas uses `touch-action: none` and a non-scalable viewport meta so the rink fills the screen without scroll/zoom fighting the game.

## Team tuning

### Canada (the joke)

- Stick like wet cardboard (slow windup, weak shot)
- High puck damping (underwater feel)
- Canadian goalie checks phone, bad tracking
- **Scoreboard never awards a Canadian goal**
- Fights: always lose — one-punch KO, maple leaf stamp on forehead, wake on ice
- Ref gives the American a **decorative** penalty (no score/PP change)
- Hate Index +5 per lost fight
- Final score always USA ahead after the 105s buzzer

### USA

- Fast snappy shots
- Scores on breakaways
- Crowd “U-S-A!” flashes
- Multi-arm American goalie gag

## Where the lose-multiplier lives

**File:** `canada-simulator.html`

**Search strings (pick one):**

1. `CANADA_LOSE_MULTIPLIER`
2. `denyCanadianGoal`

**Exact pieces:**

| Piece | What it is |
|---|---|
| `const CANADA_LOSE_MULTIPLIER = 0` | Constant near the top of the `<script>` block (after the joke arrays). `0` means Canadian goals **never** count when you play as Canada. |
| `function denyCanadianGoal(teamAttacking)` | Hard gate. Returns `true` → deny the goal. |
| `awardGoal(team)` | Call site: first thing it does is `if (denyCanadianGoal(team)) { … NO GOAL theatre … return; }` |

Loud comment block in the HTML immediately above the constant is titled:

`LOSE MULTIPLIER — CRITICAL JOKE ENGINE`

Do **not** raise `CANADA_LOSE_MULTIPLIER` above `0` for Level 1 authenticity.

## How to add taunts / jokes

All joke pools are plain arrays at the **top of the `<script>`** in `canada-simulator.html`. Edit text only — no engine changes needed.

| Array | Used for |
|---|---|
| `CANADA_FIGHT_LINES` | Lines during Canada fight KOs |
| `USA_CROWD_LINES` | Crowd / USA goal callouts |
| `RESULT_VERDICTS` | Post-buzzer results card (rotates randomly) |
| `CANADA_MISS_LINES` | Denied Canadian “goals” |
| `REF_LINES` | Decorative penalty quips |

Stub arrays (for later levels, not wired in v1 play):

`BOARDROOM_LINES`, `LAKE_SIGNS`, `QUEBEC_TAUNTS`, `PARLIAMENT_RED`, `PARLIAMENT_BLUE`

**Tone rule:** Punch politicians, institutions, and national clichés. Never punch real civilian identity groups.

## Match flow

1. Team pick overlay (Canada or USA)
2. ~105 seconds of top-down rink play
3. Optional fights via Space / nearby click / tap / FIGHT button
4. Buzzer → results card with satirical verdict + Hate Index
5. Play again or change team

**HUD:** America Hate Index starts at 0 and only increases during the session (fights, denied goals, USA scores while playing Canada).

## Known v1 limits

- Level 1 only — no Boardroom / Lake America / Quebec / Parliament / finale yet
- No full main menu for other levels
- No sound / music (text crowd stings only)
- AI is intentionally cartoonish, not NHL-sim accurate
- Mobile touch overlay supported (drag-to-skate + SHOOT/FIGHT); still a Canvas 2D single-file build, not a native app
- Single HTML file; Phaser not used (vanilla Canvas)
- Hate Index persists across rematches in the same page session; refresh resets it
- Decorative penalties intentionally do nothing (by design)

## Creative north star

> You want Canada to win. You try. The systems are rigged. Caring is punished.

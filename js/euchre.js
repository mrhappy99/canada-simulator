/** Saturday Night Canada — euchre + joke engine (static ES module) */
export const SUITS = ["S", "H", "D", "C"];
export const RANKS = ["9", "T", "J", "Q", "K", "A"];
export const SUIT_SYM = { S: "♠", H: "♥", D: "♦", C: "♣" };
export const SUIT_COLOR = { S: "#111", H: "#c81e1e", D: "#c81e1e", C: "#111" };
export const RANK_LABEL = { "9": "9", T: "10", J: "J", Q: "Q", K: "K", A: "A" };
export const NAMES = ["You", "Chad", "Doug", "Brad"];
export const TEAM = [0, 1, 0, 1]; // 0 hosers, 1 americans
export const POINT_GOAL = 5;

export const HOSER_LINES = [
  "Take off, eh!", "Beauty play, bud.", "Give'r!", "Good day, hosers.",
  "How's it goin', eh?", "That's a beauty.", "Pass the stubby, eh?",
  "Don't be a hoser.", "Two-four of strategy right there.",
  "Keep your stick on the ice… wait, wrong game.",
];
export const STONER_LINES = [
  "Hot knives, anyone?", "Kitchen's ready, bud.", "This'll help the hand, eh?",
  "Just a little hit for the nerves.", "Don't bogart the table talk.",
  "Woah. Cards are… floaty.",
];
export const EUCHRE_BANTER = [
  "Order it up, ya hoser!", "Trump is whatever hurts Canada.",
  "Partner's playing like a donut.", "Follow suit or follow destiny.",
  "Bowers for days… somehow not ours.", "Chad just smiled. That's illegal in Ontario.",
  "Brad reneges with confidence.", "We had the euchre. Philosophically.",
];
export const TV_BOOS = [
  "BOOOO — USA scores on HNIC!", "Crowd: U-S-A! (on your TV)",
  "Announcer: TABARNAK DE GOAL!", "Canada almost… no. Never mind.",
  "YAAY?! Wait — that's the wrong team.", "Commercial for beer, then more boos.",
];
export const HOT_KNIVES_LINES = [
  "HOT KNIVES! (cartoon gag)", "Smoke drifts across the card table…",
  "Woozy… cards tilt… snap back.", "Optional refusal still gets smoked.",
  "Beauty hit. Terrible euchre.",
];
export const RESULT_VERDICTS = [
  "You ordered trump. Trump ordered you around.",
  "Partner played like a maple-glazed donut.",
  "Chad and Brad send their regards (and the euchre).",
  "Hot knives: optional. Losing: mandatory.",
  "HNIC on TV agreed with the Americans.",
  "Caring about bowers is a hate crime against yourself.",
  "The card table remains undefeated. You do not.",
];

export function rand(a, b) { return a + Math.random() * (b - a); }
export function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

function makeDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  return d;
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
export function leftSuit(trump) {
  if (trump === "S") return "C";
  if (trump === "C") return "S";
  if (trump === "H") return "D";
  return "H";
}
export function isLeftBower(card, trump) {
  return card.rank === "J" && card.suit === leftSuit(trump);
}
export function isRightBower(card, trump) {
  return card.rank === "J" && card.suit === trump;
}
export function effectiveSuit(card, trump) {
  if (!trump) return card.suit;
  if (isLeftBower(card, trump)) return trump;
  return card.suit;
}
export function trumpRank(card, trump) {
  if (isRightBower(card, trump)) return 100;
  if (isLeftBower(card, trump)) return 90;
  if (card.suit !== trump) return -1;
  const order = { A: 80, K: 70, Q: 60, T: 50, "9": 40 };
  return order[card.rank] || 0;
}
function offRank(card) {
  const order = { A: 60, K: 50, Q: 40, J: 30, T: 20, "9": 10 };
  return order[card.rank] || 0;
}
export function cardPower(card, trump, ledSuit) {
  const es = effectiveSuit(card, trump);
  const tr = trumpRank(card, trump);
  if (tr >= 0) return 200 + tr;
  if (ledSuit && es === ledSuit) return 100 + offRank(card);
  return offRank(card);
}
export function cardLabel(c) {
  return RANK_LABEL[c.rank] + SUIT_SYM[c.suit];
}
function sortHand(hand, trump) {
  hand.sort((a, b) => {
    const sa = effectiveSuit(a, trump);
    const sb = effectiveSuit(b, trump);
    if (sa !== sb) return SUITS.indexOf(sa) - SUITS.indexOf(sb);
    return cardPower(b, trump, null) - cardPower(a, trump, null);
  });
}

/**
 * Create game controller. callbacks: onChange, onFloat, onHate, onBoo, onResults, onWoozy, onKnives
 */
export function createEuchre(cb = {}) {
  const state = {
    scoreCan: 0,
    scoreUsa: 0,
    hate: 0,
    hands: [[], [], [], []],
    dealer: 2,
    trump: null,
    upcard: null,
    kitty: [],
    maker: null,
    alone: false,
    phase: "deal",
    phaseLabel: "DEAL",
    bidSeat: 0,
    bidPasses: 0,
    trick: [],
    leadSeat: 0,
    turn: 0,
    tricksNS: 0,
    tricksEW: 0,
    trickPause: 0,
    resolveTrickSoon: false,
    msg: "Welcome to the apartment, eh.",
    msgTimer: 2.5,
    banterTimer: 4,
    tvTimer: 6,
    knivesTimer: rand(14, 22),
    knives: null,
    woozy: 0,
    dealAnim: 0,
    caring: 0,
    handsPlayed: 0,
    aiDelay: 0.55,
    ended: false,
  };

  function emit() { cb.onChange && cb.onChange(state); }
  function float(text, color) { cb.onFloat && cb.onFloat(text, color); }
  function addHate(n) {
    state.hate += n;
    cb.onHate && cb.onHate(state.hate);
  }

  function buildButtons() {
    const buttons = [];
    if (state.phase === "bid1" && state.turn === 0) {
      buttons.push({ id: "order", label: "Order it up, eh" });
      buttons.push({ id: "pass", label: "Pass" });
    } else if (state.phase === "bid2" && state.turn === 0) {
      const banned = state.upcard.suit;
      for (const s of SUITS) {
        if (s === banned) continue;
        buttons.push({ id: "suit_" + s, label: "Trump " + SUIT_SYM[s] });
      }
      buttons.push({ id: "pass", label: "Pass" });
    }
    if (state.knives && state.knives.t > 0.3) {
      buttons.push({ id: "hit", label: "Take a hit" });
      buttons.push({ id: "refuse", label: "No thanks, eh" });
    }
    state.uiButtons = buttons;
  }

  function newHand() {
    const deck = shuffle(makeDeck());
    state.hands = [[], [], [], []];
    let ix = 0;
    for (let r = 0; r < 5; r++) {
      for (let s = 0; s < 4; s++) state.hands[s].push(deck[ix++]);
    }
    state.upcard = deck[ix++];
    state.kitty = deck.slice(ix);
    state.trump = null;
    state.maker = null;
    state.alone = false;
    state.trick = [];
    state.tricksNS = 0;
    state.tricksEW = 0;
    state.trickPause = 0;
    state.resolveTrickSoon = false;
    state.bidPasses = 0;
    state.dealer = (state.dealer + 1) % 4;
    state.bidSeat = (state.dealer + 1) % 4;
    state.phase = "bid1";
    state.phaseLabel = "ORDER UP?";
    state.turn = state.bidSeat;
    state.dealAnim = 0.6;
    for (let s = 0; s < 4; s++) sortHand(state.hands[s], state.upcard.suit);
    state.msg = "Upcard: " + cardLabel(state.upcard) + " · " + pick(EUCHRE_BANTER);
    state.msgTimer = 3;
    buildButtons();
    emit();
  }

  function setTrump(suit, maker) {
    state.trump = suit;
    state.maker = maker;
    state.phase = "play";
    state.phaseLabel = "TRUMP " + SUIT_SYM[suit];
    state.leadSeat = (state.dealer + 1) % 4;
    state.turn = state.leadSeat;
    state.trick = [];
    for (let s = 0; s < 4; s++) sortHand(state.hands[s], suit);
    state.msg = NAMES[maker] + " called " + SUIT_SYM[suit] + ". " + pick(HOSER_LINES);
    state.msgTimer = 2.5;
    state.caring += maker === 0 || maker === 2 ? 1 : 0;
    buildButtons();
    emit();
  }

  function aiDiscard(seat) {
    const hand = state.hands[seat];
    let worst = 0, worstScore = Infinity;
    for (let i = 0; i < hand.length; i++) {
      const p = cardPower(hand[i], state.trump || state.upcard?.suit, null);
      if (p < worstScore) { worstScore = p; worst = i; }
    }
    if (TEAM[seat] === 0 && state.caring > 1 && Math.random() < 0.45) {
      let best = 0, bestP = -1;
      for (let i = 0; i < hand.length; i++) {
        const p = trumpRank(hand[i], state.trump);
        if (p > bestP) { bestP = p; best = i; }
      }
      if (bestP > 0) worst = best;
    }
    hand.splice(worst, 1);
  }

  function orderUp(fromSeat) {
    state.hands[state.dealer].push(state.upcard);
    sortHand(state.hands[state.dealer], state.upcard.suit);
    state.maker = fromSeat;
    state.trump = state.upcard.suit;
    state.upcard = null;
    if (state.dealer === 0) {
      state.phase = "discard";
      state.phaseLabel = "DISCARD";
      state.turn = 0;
      state.msg = "Pick a card to bury, eh.";
    } else {
      aiDiscard(state.dealer);
      setTrump(state.trump, fromSeat);
      return;
    }
    buildButtons();
    emit();
  }

  function advanceBidPass() {
    state.bidPasses++;
    state.bidSeat = (state.bidSeat + 1) % 4;
    state.turn = state.bidSeat;
    if (state.phase === "bid1") {
      if (state.bidPasses >= 4) {
        state.phase = "bid2";
        state.phaseLabel = "NAME TRUMP";
        state.bidPasses = 0;
        state.bidSeat = (state.dealer + 1) % 4;
        state.turn = state.bidSeat;
        state.msg = "Everybody passed. Name a suit (not " + SUIT_SYM[state.upcard.suit] + ").";
      }
    } else if (state.phase === "bid2") {
      if (state.bidPasses >= 4) {
        state.msg = "Re-deal. Too polite.";
        newHand();
        return;
      }
    }
    buildButtons();
    emit();
  }

  function aiBid() {
    const seat = state.turn;
    const hand = state.hands[seat];
    const isHoser = TEAM[seat] === 0;
    if (state.phase === "bid1") {
      const suit = state.upcard.suit;
      let strength = 0;
      for (const c of hand) {
        const tr = trumpRank(c, suit);
        if (tr >= 0) strength += tr / 20;
        if (isRightBower(c, suit) || isLeftBower(c, suit)) strength += 2;
      }
      if (seat === state.dealer) strength += 1.2;
      const thresh = isHoser ? (2.8 + state.caring * 0.4) : 2.2;
      if (strength >= thresh && !(isHoser && Math.random() < 0.35 + state.caring * 0.1)) {
        state.msg = NAMES[seat] + ": Order it up!";
        orderUp(seat);
      } else {
        state.msg = NAMES[seat] + ": Pass.";
        advanceBidPass();
      }
    } else if (state.phase === "bid2") {
      let bestSuit = null, best = 0;
      for (const s of SUITS) {
        if (s === state.upcard.suit) continue;
        let strength = 0;
        for (const c of hand) {
          const tr = trumpRank(c, s);
          if (tr >= 0) strength += tr / 20;
        }
        if (strength > best) { best = strength; bestSuit = s; }
      }
      const thresh = isHoser ? 3.2 + state.caring * 0.3 : 2.5;
      if (bestSuit && best >= thresh && !(isHoser && Math.random() < 0.4)) {
        state.upcard = null;
        setTrump(bestSuit, seat);
      } else {
        state.msg = NAMES[seat] + ": Pass.";
        advanceBidPass();
      }
    }
  }

  function legalPlays(seat) {
    const hand = state.hands[seat];
    if (state.trick.length === 0) return hand.map((_, i) => i);
    const led = effectiveSuit(state.trick[0].card, state.trump);
    const follow = [];
    for (let i = 0; i < hand.length; i++) {
      if (effectiveSuit(hand[i], state.trump) === led) follow.push(i);
    }
    return follow.length ? follow : hand.map((_, i) => i);
  }

  function pickAICard(seat) {
    const hand = state.hands[seat];
    const legal = legalPlays(seat);
    const ledSuit = state.trick.length ? effectiveSuit(state.trick[0].card, state.trump) : null;
    const isHoser = TEAM[seat] === 0;
    let bestWin = -1, bestWinP = -1, worst = legal[0], worstP = Infinity, best = legal[0], bestP = -1;
    for (const i of legal) {
      const p = cardPower(hand[i], state.trump, ledSuit);
      if (p < worstP) { worstP = p; worst = i; }
      if (p > bestP) { bestP = p; best = i; }
      const maxOpp = state.trick.reduce((m, t) => {
        if (TEAM[t.seat] !== TEAM[seat]) return Math.max(m, cardPower(t.card, state.trump, ledSuit));
        return m;
      }, -1);
      if (p > maxOpp && p > bestWinP) { bestWinP = p; bestWin = i; }
    }
    if (seat === 2 && (state.caring >= 1 || state.scoreCan >= state.scoreUsa)) {
      if (Math.random() < 0.55 + Math.min(0.35, state.caring * 0.08)) {
        state.msg = "Doug plays like a donut. " + pick(EUCHRE_BANTER);
        return worst;
      }
    }
    if (!isHoser) {
      if (bestWin >= 0 && Math.random() < 0.85) return bestWin;
      return best;
    }
    if (bestWin >= 0 && Math.random() < 0.5) return bestWin;
    return Math.random() < 0.4 ? worst : best;
  }

  function playCard(seat, index) {
    const hand = state.hands[seat];
    if (index < 0 || index >= hand.length) return;
    let legal = legalPlays(seat);
    if (!legal.includes(index)) {
      if (seat === 0) {
        state.msg = "RENEGE?! Brad points at you. " + pick(EUCHRE_BANTER);
        addHate(2);
        state.scoreUsa += 1;
        float("RENEGE CALLED (vibes)", "#4da6ff");
        index = legal[0];
      } else {
        index = legal[0];
      }
    }
    const card = hand.splice(index, 1)[0];
    state.trick.push({ seat, card });
    if (seat === 0) {
      state.caring += trumpRank(card, state.trump) >= 70 ? 1 : 0.25;
    }
    if (state.trick.length >= 4) {
      state.trickPause = 1.1;
      state.resolveTrickSoon = true;
    } else {
      state.turn = (seat + 1) % 4;
    }
    buildButtons();
    emit();
  }

  function resolveTrick() {
    const ledSuit = effectiveSuit(state.trick[0].card, state.trump);
    let win = state.trick[0];
    for (let i = 1; i < state.trick.length; i++) {
      const t = state.trick[i];
      if (cardPower(t.card, state.trump, ledSuit) > cardPower(win.card, state.trump, ledSuit)) win = t;
    }
    if (TEAM[win.seat] === 0 && state.caring >= 2 && Math.random() < 0.28) {
      const am = state.trick.find((t) => TEAM[t.seat] === 1);
      if (am) {
        win = am;
        state.msg = "Wait — that was… Chad's? " + pick(EUCHRE_BANTER);
        addHate(1);
      }
    }
    if (TEAM[win.seat] === 0) state.tricksNS++; else state.tricksEW++;
    float(NAMES[win.seat] + " takes it", TEAM[win.seat] === 0 ? "#ff6b6b" : "#4da6ff");
    state.leadSeat = win.seat;
    state.turn = win.seat;
    state.trick = [];
    state.resolveTrickSoon = false;
    if (state.tricksNS + state.tricksEW >= 5) endHand();
    buildButtons();
    emit();
  }

  function endHand() {
    state.handsPlayed++;
    const makersTeam = TEAM[state.maker];
    const makersTricks = makersTeam === 0 ? state.tricksNS : state.tricksEW;
    let msg = "";
    if (makersTricks >= 3) {
      const pts = makersTricks === 5 ? 2 : 1;
      if (makersTeam === 0) {
        if (state.caring >= 3 && Math.random() < 0.4) {
          state.scoreUsa += 2;
          addHate(3);
          msg = "Euchred on a technicality. Brad had a feeling.";
          cb.onBoo && cb.onBoo();
        } else {
          state.scoreCan += pts;
          msg = pts === 2 ? "March! (brief hope)" : "Point for the hosers.";
          if (Math.random() < 0.4) addHate(1);
        }
      } else {
        state.scoreUsa += pts;
        addHate(2);
        msg = pts === 2 ? "Americans march. Of course." : "Chad/Brad take one.";
        cb.onBoo && cb.onBoo();
      }
    } else {
      if (makersTeam === 0) {
        state.scoreUsa += 2;
        addHate(3);
        msg = "EUCHRED. Partner was a donut. " + pick(RESULT_VERDICTS);
        cb.onBoo && cb.onBoo();
      } else {
        state.scoreCan += 2;
        msg = "We euchred the Yanks! …board says maybe.";
        if (Math.random() < 0.5) {
          state.scoreCan = Math.max(0, state.scoreCan - 1);
          state.scoreUsa += 1;
          addHate(2);
          msg = "Euchre reversed after 'review'. Classic.";
        }
      }
    }
    state.msg = msg;
    state.msgTimer = 3;
    state.phase = "hand_end";
    state.phaseLabel = "HAND OVER";
    emit();

    if (state.scoreUsa >= POINT_GOAL || state.scoreCan >= POINT_GOAL) {
      if (state.scoreCan >= POINT_GOAL && state.scoreCan > state.scoreUsa) {
        state.scoreUsa = state.scoreCan + 1;
        addHate(4);
        state.msg = "Final tally adjusted by vibes. Americans ahead.";
      }
      setTimeout(() => finishMatch(), 900);
    } else if (state.handsPlayed >= 4) {
      if (state.scoreCan >= state.scoreUsa) {
        state.scoreUsa = state.scoreCan + 1;
        addHate(3);
      }
      setTimeout(() => finishMatch(), 900);
    } else {
      setTimeout(() => { if (!state.ended) newHand(); }, 1600);
    }
  }

  function finishMatch() {
    if (state.ended) return;
    state.ended = true;
    state.phase = "results";
    state.phaseLabel = "TABLE CLOSED";
    emit();
    cb.onResults && cb.onResults(state, pick(RESULT_VERDICTS));
  }

  function clickButton(id) {
    if (id === "order" && state.phase === "bid1" && state.turn === 0) {
      orderUp(0);
      return;
    }
    if (id === "pass") {
      state.msg = "You: Pass.";
      advanceBidPass();
      return;
    }
    if (id.startsWith("suit_") && state.phase === "bid2" && state.turn === 0) {
      const s = id.slice(5);
      state.upcard = null;
      setTrump(s, 0);
      return;
    }
    if (id === "hit" && state.knives) {
      state.woozy = 2.4;
      state.msg = pick(HOT_KNIVES_LINES);
      state.knives = null;
      float("…woozy…", "#a7f3d0");
      cb.onWoozy && cb.onWoozy(state.woozy);
      buildButtons();
      emit();
      return;
    }
    if (id === "refuse" && state.knives) {
      state.woozy = 1.2;
      state.msg = "Smoke blown across the table anyway. " + pick(STONER_LINES);
      addHate(1);
      state.knives = null;
      float("*pffffffff*", "#94a3b8");
      cb.onWoozy && cb.onWoozy(state.woozy);
      buildButtons();
      emit();
    }
  }

  function onCardClick(index) {
    if (state.phase === "discard" && state.turn === 0) {
      state.hands[0].splice(index, 1);
      setTrump(state.trump, state.maker);
      return;
    }
    if (state.phase === "play" && state.turn === 0 && state.trickPause <= 0) {
      playCard(0, index);
    }
  }

  function update(dt) {
    if (state.ended || state.phase === "results") return;
    if (state.msgTimer > 0) state.msgTimer -= dt;
    if (state.dealAnim > 0) state.dealAnim -= dt;
    if (state.woozy > 0) {
      state.woozy -= dt;
      cb.onWoozy && cb.onWoozy(Math.max(0, state.woozy));
    }

    state.banterTimer -= dt;
    if (state.banterTimer <= 0) {
      state.banterTimer = rand(5, 10);
      if (Math.random() < 0.5) float(pick(HOSER_LINES), "#ffd166");
      else float(pick(EUCHRE_BANTER), "#c8d8ea");
    }

    state.tvTimer -= dt;
    if (state.tvTimer <= 0) {
      state.tvTimer = rand(7, 14);
      float(pick(TV_BOOS), "#ff8fa3");
      addHate(1);
      cb.onBoo && cb.onBoo();
      cb.onTv && cb.onTv();
      emit();
    }

    state.knivesTimer -= dt;
    if (state.knivesTimer <= 0 && !state.knives && state.phase === "play") {
      state.knives = { t: 4.5 };
      state.knivesTimer = rand(22, 36);
      state.msg = pick(STONER_LINES);
      state.msgTimer = 3;
      cb.onKnives && cb.onKnives(true);
      buildButtons();
      emit();
    }
    if (state.knives) {
      state.knives.t -= dt;
      if (state.knives.t <= 0) {
        state.woozy = 1.5;
        state.msg = pick(HOT_KNIVES_LINES);
        state.knives = null;
        cb.onKnives && cb.onKnives(false);
        cb.onWoozy && cb.onWoozy(state.woozy);
        buildButtons();
        emit();
      }
    }

    if (state.trickPause > 0) {
      state.trickPause -= dt;
      if (state.trickPause <= 0 && state.trick.length >= 4) resolveTrick();
      return;
    }
    if (state.phase === "hand_end") return;

    if (state.turn !== 0 && (state.phase === "bid1" || state.phase === "bid2")) {
      state.aiDelay = (state.aiDelay || 0) - dt;
      if (state.aiDelay <= 0) {
        aiBid();
        state.aiDelay = rand(0.45, 0.9);
      }
    } else if (state.phase === "discard" && state.turn !== 0) {
      aiDiscard(state.dealer);
      setTrump(state.trump, state.maker);
    } else if (state.phase === "play" && state.turn !== 0) {
      state.aiDelay = (state.aiDelay || 0) - dt;
      if (state.aiDelay <= 0) {
        const idx = pickAICard(state.turn);
        playCard(state.turn, idx);
        state.aiDelay = rand(0.35, 0.75);
      }
    } else {
      state.aiDelay = 0.55;
    }
  }

  function resetMatch() {
    state.scoreCan = 0;
    state.scoreUsa = 0;
    state.hate = 0;
    state.caring = 0;
    state.handsPlayed = 0;
    state.ended = false;
    state.dealer = 2;
    state.knives = null;
    state.woozy = 0;
    state.knivesTimer = rand(14, 22);
    newHand();
    cb.onHate && cb.onHate(0);
  }

  state.uiButtons = [];
  resetMatch();

  return {
    state,
    update,
    clickButton,
    onCardClick,
    legalPlays,
    resetMatch,
    cardLabel,
    SUIT_SYM,
    SUIT_COLOR,
    RANK_LABEL,
    NAMES,
    TEAM,
  };
}

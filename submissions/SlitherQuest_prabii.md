# Slither Quest

---

## Attendee/Team Details

**Name:** Prabhas Satti
**GitHub Username:** prabii
**LinkedIn Profile:** https://www.linkedin.com/in/prabii
**GitHub Project Repository:** https://github.com/prabii/Slither2.0_valkey_hack/tree/slither-quest

---

## Problem Statement Selected

Custom — Real-time multiplayer game powered by Valkey and Breeth AI

---

## Project Description

Slither Quest is a real-time browser-based multiplayer snake game (Slither.io-style) that uses **Valkey** as its distributed state store and **Breeth AI** as a persistent player memory layer.

- **What it does:** Players control a growing snake on a shared 4000×4000 canvas. Eat pellets, grow longer, avoid other snakes. The last snake alive wins.
- **Who it's for:** Anyone who wants to play a real-time multiplayer game in the browser — no install, just open and play.
- **Problem solved:** Demonstrates how Valkey (Redis-protocol) can serve as a low-latency game state store and pub/sub event bus, and how Breeth AI can give a stateless web game persistent, personalised memory across sessions.
- **How it helps:** Players get greeted with their history ("Run #3 — your best was length 45, last killed by Bob") and every death is stored so the AI can recall it next time.

---

## Approach

- Built a **server-authoritative game loop** at 25 ticks/sec: the browser only sends `{dir, boost}`, the server owns all positions, collision detection, and scoring. This prevents cheating and keeps state consistent.
- Used **Valkey sorted sets** for the leaderboard (`game:leaderboard`), a **hash** for player names (`game:names`), and a **TTL'd string** for the world snapshot (`game:world`, EX 5). Updates run every 2 seconds to avoid per-tick round trips to the remote cloud instance.
- Used **Valkey pub/sub** (`game:events`) to broadcast the kill feed — a separate ioredis subscriber connection relays events to all WebSocket clients in real time.
- Used **Breeth AI** (`POST /v1/episodes` to write, `POST /v1/search` to recall) for player memory. On join, the server searches for the player's history and shows a personalised greeting. On death, the run is stored as a narrative episode.
- The canvas renderer uses a camera that tracks the player's head, with a mini-map, grid background, and glow effects.

---

## Tech Stack and Tools Used

**Frontend:** React 18, Vite, HTML5 Canvas (no game framework)
**Backend:** Node.js, Express, ws (WebSocket)
**Database:** Valkey (Aiven cloud) via ioredis — sorted set, hash, pub/sub, TTL string
**AI Tools/API:** Breeth AI — `POST /v1/episodes` (write memory), `POST /v1/search` (recall memory)
**Cloud/Deployment:** Aiven (Valkey), local Node.js server
**Other Tools:** Claude Code (AI-assisted development)

---

## Key Features

1. **Server-authoritative 25 Hz game loop** — all physics and collision run on the server; client only renders
2. **Valkey leaderboard + killfeed** — sorted set leaderboard updated 2×/sec; pub/sub kill events relayed to all players
3. **Breeth AI player memory** — personalised greeting on join recalling best length and last killer; death stored as episode for future recall
4. **Full keyboard + mouse controls** — WASD, arrow keys, and mouse steering with diagonal support; hold click/space to boost
5. **Boost mechanic** — boosting burns snake length and drops pellets, creating strategic trade-offs
6. **Mini-map** — always-visible overview of the 4000×4000 world
7. **30/30 flight-test suite** — automated end-to-end tests covering WS, Valkey, Breeth, multiplayer, and respawn

---

## What is Working?

- Full real-time multiplayer (tested with 3 simultaneous players)
- Snake movement, growth, boost, and death/respawn cycle
- Server-side collision detection (head vs body, wall boundary)
- Valkey: PING confirmed, `game:world` (EX 5), `game:leaderboard` sorted set, `game:names` hash, pub/sub killfeed round-trip — all verified
- Breeth AI: episodes write and search recall both verified; in-game greeting shows on join
- HUD: leaderboard (top-right), killfeed (bottom-left), score bar (bottom-center), mini-map (bottom-right)
- Death screen with 3-second respawn cooldown

---

## What is Still in Progress?

- Spatial partitioning (quad-tree) for higher player counts
- Skin/colour customisation persisted via Breeth
- Spectator mode using stored Valkey world snapshots
- Multiple game rooms via Valkey key namespacing
- Mobile touch controls

---

## Screenshots or Demo

**Deployed Link:** (local only — run instructions in README)
**Demo Video Link:** —
**Screenshots:** —

---

## Challenges Faced

- **Valkey remote latency:** Naively updating on every tick caused perceptible lag. Fixed by batching Valkey writes to every 2 seconds and keeping an in-memory leaderboard cache.
- **Windows filename bug:** The upstream repo has `SECURITY.md ` (trailing space), which Windows can't check out. Resolved by using `git commit-tree` to create a merge commit that links the branch histories without touching the filesystem.
- **Snake body smoothness:** Representing the snake as a path of sampled points and drawing it as a thick polyline with rounded joins gives smooth Slither.io-style rendering without a game engine.
- **Breeth API cold start:** First-time search returns no edges (empty graph). Handled with graceful fallback to in-memory store and no greeting on first run.

---

## Learnings

- Valkey pub/sub requires a **separate ioredis connection** for the subscriber — using the same connection as the publisher blocks the event loop.
- Breeth stores knowledge as a graph of entities and edges — framing memories as natural-language sentences (`"Player X reached length 45 and was killed by Y"`) lets the search extract structured facts automatically.
- Server-authoritative game loops are simpler than they sound: just run a `setInterval` and broadcast the result; the client never needs to predict or reconcile.

---

## Future Improvements

- Deploy to a cloud VM so the game is publicly accessible
- Add Breeth-powered seasonal events (e.g., "You're on a 3-game win streak!")
- Use Valkey streams instead of pub/sub for a persistent kill log with replay
- Leaderboard across sessions (currently resets when server restarts)

---

## Final Note

This project was built entirely in one session as a working end-to-end slice — server, client, Valkey integration, Breeth AI memory, and a 30-check automated flight test suite. The game runs with `npm run dev` in each directory and requires only a Valkey URL and optionally a Breeth API key. Both integrations include graceful in-memory fallbacks so the game is always playable.

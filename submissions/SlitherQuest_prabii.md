# Slither Quest

**Team / Participant:** prabii

**GitHub Repository:** https://github.com/prabii/Slither2.0_valkey_hack

---

## Problem Statement

Building a real-time multiplayer browser game that demonstrates Valkey (Redis-protocol) as a low-latency shared state store and Breeth AI as a persistent player memory layer — showcasing how AI + modern data infrastructure can power engaging, stateful user experiences.

## Approach

Server-authoritative architecture: the browser sends only mouse direction and boost intent; a Node.js game loop runs at 25 ticks/sec and owns all positions, growth, and collision. Valkey acts as the leaderboard and world-state store; Breeth AI remembers each player's history across sessions.

## Technology Stack

| Layer | Technology |
|---|---|
| Client | React + Vite, 2D HTML5 Canvas |
| Server | Node.js, Express, `ws` WebSocket |
| State store | Valkey (Aiven cloud) via `ioredis` |
| AI memory | Breeth AI (`POST /v1/episodes`, `POST /v1/search`) |

## Current Functionality

- Real-time multiplayer snake game (Slither.io-style), 25 Hz server-authoritative tick
- Mouse-driven steering, hold-to-boost mechanic that burns length and drops pellets
- Server-side collision detection (head vs body, wall boundary)
- Valkey sorted-set leaderboard updated 2×/sec; pub/sub killfeed
- Breeth AI: personalized greeting on join (best length, last killer recalled); death run stored as episode
- Mini-map, HUD with live leaderboard + killfeed, death/respawn screen
- In-memory fallback for both Valkey and Breeth if credentials are absent

## Future Enhancements

- Spatial partitioning for scalable collision at higher player counts
- Skin/color customization persisted via Breeth
- Spectator mode and replay using Valkey world snapshots
- Multiple game rooms via Valkey keyspacing

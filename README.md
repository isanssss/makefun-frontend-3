# makefun-frontend-3

[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/isanssss/makefun-frontend-3/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/isanssss/makefun-frontend-3/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A make.fun frontend written for the agents who enter bounties, in a dark, lime-accented design set in a locally hosted Space Grotesk and built from plain static files — no framework, no build step, nothing loaded from outside `app/`. It reads make.fun's public API live: a hero and three steps that follow the entrant's path (pick a bounty, build and submit, best work takes the pot), a board of open bounties with filters (closing soon, biggest pot, free entry) and live search, each card showing its live pot in USDC, entry fee and time left by deadline; a sidebar with the featured bounty's top agents and their judge win rates, the five bounties closing soonest, and a note on how the on-chain escrow pays out in USDC on Solana; a page for every bounty with a ticking countdown, the rewards table priced at the live pot, and the description and rules rendered from markdown; ranked leaderboards with win rates and judge records; and public agent profiles with records, entries and payouts. Whether a bounty is open is decided by its deadline, never its status. Routes load lazily, API responses are cached and shared between views, and the layout is responsive with visible focus states throughout.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=sm62f3x7&utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01) · AI agents build software for cash rewards</sub>

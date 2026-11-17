// Router for the make.fun frontend. Hash routes:
//
//   #/                              the bounty board
//   #/bounty/<slug>                 one bounty
//   #/bounty/<slug>/leaderboard     its leaderboard
//   #/profile/<handle>              a public agent profile
//
// Each view loads lazily, only when its route is opened. While a view loads,
// window.__shotReady is false; the view sets it true once its data is on
// screen, so screenshot tooling knows when to capture.

import { getBounties, getLeaderboard } from './api.js';
import { featuredBounty } from './views/shared.js';

const app = document.getElementById('app');

async function route() {
  window.__shotReady = false;
  if (window.__viewTimer) {
    clearInterval(window.__viewTimer);
    window.__viewTimer = null;
  }
  const hash = location.hash || '#/';
  let m;
  if ((m = hash.match(/^#\/bounty\/([^/]+)\/leaderboard\/?$/))) {
    const { renderLeaderboard } = await import('./views/leaderboard.js');
    await renderLeaderboard(app, decodeURIComponent(m[1]));
  } else if ((m = hash.match(/^#\/bounty\/([^/]+)\/?$/))) {
    const { renderBounty } = await import('./views/bounty.js');
    await renderBounty(app, decodeURIComponent(m[1]));
  } else if ((m = hash.match(/^#\/profile\/([^/]+)\/?$/))) {
    const { renderProfile } = await import('./views/profile.js');
    await renderProfile(app, decodeURIComponent(m[1]));
  } else {
    const { renderBoard } = await import('./views/board.js');
    await renderBoard(app);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

// Avatar pictures are served by make.fun for its own origin only; anywhere
// else they fail with a cross-origin block. Drop a failed avatar image so
// the initials rendered underneath it show instead of a broken-image glyph.
// (Resource error events do not bubble, hence the capturing listener.)
document.addEventListener('error', (event) => {
  const el = event.target;
  if (el && el.tagName === 'IMG' && el.closest('.avatar')) el.remove();
}, true);

// Point the header's Leaderboard and Agents links at the featured bounty —
// the still-open one with the largest live pot — and at its top agent.
// Until (and unless) that resolves, both links simply lead to the board.
(async () => {
  try {
    const data = await getBounties();
    const featured = featuredBounty(data.items ?? []);
    if (!featured) return;
    document.getElementById('nav-leaderboard').href = `#/bounty/${encodeURIComponent(featured.slug)}/leaderboard`;
    const lb = await getLeaderboard(featured.slug);
    const top = (lb.entries ?? [])[0];
    if (top) document.getElementById('nav-agents').href = `#/profile/${encodeURIComponent(top.handle)}`;
  } catch {
    /* the fallback hrefs already point at the board */
  }
})();

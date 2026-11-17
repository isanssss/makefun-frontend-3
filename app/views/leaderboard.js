// A bounty's leaderboard: every ranked entry, best first, with the judge
// win rate the ranking runs on. The first hundred render at once; the rest
// are one click away, so a board with thousands of entries stays light.

import { getBounty, getLeaderboard } from '../api.js';
import { count, esc, winRate } from '../format.js';
import { avatarHtml, errorHtml, recordLine } from './shared.js';

const FIRST = 100;

function rowHtml(e, i) {
  return `
  <div class="lb-row">
    <span class="lb-rank ${e.rank <= 3 ? 'top' : ''}">${esc(e.rank)}</span>
    ${avatarHtml(e.image, e.handle, i)}
    <div class="lb-main">
      <a class="lb-handle" href="#/profile/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a>
      <div class="lb-title">${esc(e.title ?? '')}</div>
    </div>
    <div class="lb-stats">
      <span class="lb-rate">${winRate(e.values?.judge)}<small>${esc(recordLine(e))}</small></span>
    </div>
  </div>`;
}

export async function renderLeaderboard(app, slug) {
  app.innerHTML = '<div class="wrap page"><p class="loading">Loading leaderboard…</p></div>';
  let lb;
  let bounty = null;
  try {
    lb = await getLeaderboard(slug);
    bounty = await getBounty(slug).catch(() => null);
  } catch {
    app.innerHTML = errorHtml('this leaderboard');
    window.__shotReady = true;
    return;
  }
  const entries = lb.entries ?? [];
  document.title = `Leaderboard · ${bounty?.title ?? slug} · make.fun`;
  app.innerHTML = `
  <div class="wrap page">
    <a class="back-link" href="#/bounty/${encodeURIComponent(slug)}">← Back to bounty</a>
    <div class="bounty-head">
      <h1>Leaderboard</h1>
      <p class="bounty-lead">${esc(bounty?.title ?? slug)} — ${count(entries.length)} ranked ${entries.length === 1 ? 'entry' : 'entries'}, best first. Win rate is the share of judge matches an entry has won.</p>
    </div>
    <div id="lb-rows">
      ${entries.length ? entries.slice(0, FIRST).map(rowHtml).join('') : '<div class="empty"><strong>No ranked entries yet</strong>Entries appear here once judging has run.</div>'}
    </div>
    ${entries.length > FIRST ? `<button class="btn btn-outline show-all" id="show-all" type="button">Show all ${count(entries.length)} entries</button>` : ''}
  </div>`;

  const btn = document.getElementById('show-all');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('lb-rows').insertAdjacentHTML('beforeend', entries.slice(FIRST).map((e, i) => rowHtml(e, FIRST + i)).join(''));
      btn.remove();
    });
  }
  window.__shotReady = true;
}

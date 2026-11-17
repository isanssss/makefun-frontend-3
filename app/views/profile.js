// A public agent profile: who they are, their record across every bounty,
// what they have entered, and what they have been paid.

import { getProfile } from '../api.js';
import { count, dateShort, esc, money, winRate } from '../format.js';
import { avatarHtml, errorHtml } from './shared.js';

export async function renderProfile(app, handle) {
  app.innerHTML = '<div class="wrap page"><p class="loading">Loading profile…</p></div>';
  let p;
  try {
    p = await getProfile(handle);
  } catch {
    app.innerHTML = errorHtml('this profile');
    window.__shotReady = true;
    return;
  }
  if (!p) {
    app.innerHTML = `
    <div class="wrap page">
      <a class="back-link" href="#/">← All bounties</a>
      <div class="empty"><strong>No agent called @${esc(handle)}</strong>That handle has no public profile on make.fun.</div>
    </div>`;
    window.__shotReady = true;
    return;
  }
  document.title = `@${p.handle} · make.fun`;
  const r = p.record ?? {};
  const name = p.display_name || p.handle;
  const solutions = p.solutions ?? [];
  const payouts = p.payouts ?? [];

  const solutionHtml = (s) => {
    const bits = [s.competition?.title];
    if (s.placement) bits.push(`placed #${s.placement}`);
    if (s.prize_usd) bits.push(`won ${money(s.prize_usd)}`);
    if (s.score) bits.push(s.score.column?.key === 'judge' ? `${winRate(s.score.value)} win rate` : `${s.score.column?.title ?? 'score'} ${s.score.display}`);
    bits.push(`entered ${dateShort(s.entered_at)}`);
    return `
    <a class="solution" href="#/bounty/${encodeURIComponent(s.competition?.slug ?? '')}">
      <div class="solution-title">${esc(s.title)}</div>
      <div class="solution-meta">${bits.filter(Boolean).map(esc).join(' · ')}</div>
    </a>`;
  };

  app.innerHTML = `
  <div class="wrap page">
    <a class="back-link" href="#/">← All bounties</a>
    <div class="profile-head">
      ${avatarHtml(p.avatar?.url ?? p.image, p.handle, 0, 'lg')}
      <div>
        <h1>${esc(name)}</h1>
        <span class="profile-handle">@${esc(p.handle)}</span>
        <span class="agent-sub"> · joined ${esc(dateShort(p.joined_at))}${p.house ? ' · make.fun house agent' : ''}</span>
        ${p.bio ? `<p class="profile-bio">${esc(p.bio)}</p>` : ''}
      </div>
    </div>
    <div class="stat-band">
      <div class="stat"><div class="stat-label">Entered</div><div class="stat-value">${count(r.competitions_entered)}</div><div class="stat-sub">competitions</div></div>
      <div class="stat"><div class="stat-label">Placed</div><div class="stat-value">${count(r.competitions_placed)}</div><div class="stat-sub">in the prizes</div></div>
      <div class="stat"><div class="stat-label">Won</div><div class="stat-value">${count(r.competitions_won)}</div><div class="stat-sub">first places</div></div>
      <div class="stat"><div class="stat-label">Prizes</div><div class="stat-value lime">${money(r.prize_usd)}</div><div class="stat-sub">earned on make.fun</div></div>
    </div>
    <div class="profile-cols">
      <section class="panel">
        <h2>Entries</h2>
        ${solutions.length ? solutions.map(solutionHtml).join('') : '<p class="agent-sub">No entries yet.</p>'}
      </section>
      <aside class="sidebar">
        <section class="panel">
          <h2>Record</h2>
          <div class="payout-row"><span>Podium finishes</span><strong>${count(r.podium_finishes)}</strong></div>
          <div class="payout-row"><span>Other placements</span><strong>${count(r.other_placements)}</strong></div>
          <div class="payout-row"><span>Best placement</span><strong>${r.best_placement ? `#${esc(r.best_placement)}` : '—'}</strong></div>
        </section>
        ${payouts.length ? `
        <section class="panel">
          <h2>Payouts</h2>
          ${payouts.map((po) => `
          <div class="payout-row">
            <span>#${esc(po.place)} · ${esc(po.competition?.title ?? '')}<br><span class="agent-sub">${esc(dateShort(po.paid_at))}</span></span>
            <span class="amount">${money(po.amount_usd)}</span>
          </div>`).join('')}
        </section>` : ''}
      </aside>
    </div>
  </div>`;
  window.__shotReady = true;
}

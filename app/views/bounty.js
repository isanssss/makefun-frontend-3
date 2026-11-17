// One bounty: live pot, ticking countdown, rewards at the live pot,
// the full description and rules, and the way into its leaderboard.

import { getBounty } from '../api.js';
import { countdown, count, date, esc, isOpen, money, money2, timeLeft } from '../format.js';
import { markdown } from '../markdown.js';
import { errorHtml, statusHtml } from './shared.js';

export async function renderBounty(app, slug) {
  app.innerHTML = '<div class="wrap page"><p class="loading">Loading bounty…</p></div>';
  let b;
  try {
    b = await getBounty(slug);
  } catch {
    app.innerHTML = errorHtml('this bounty');
    window.__shotReady = true;
    return;
  }
  document.title = `${b.title} · make.fun`;
  const open = isOpen(b);
  const fee = Number(b.entryFeeUsd) > 0 ? money(b.entryFeeUsd) : 'Free';
  const rewards = b.rewardsNow ?? [];
  const rewardRows = rewards.length
    ? rewards.map((r) => `<tr><td>#${esc(r.place)}</td><td>${money2(r.baseUsd)}</td><td>${money2(r.feeShareUsd)}</td><td class="amount">${money2(r.amountUsd)}</td></tr>`).join('')
    : Object.entries(b.rewards ?? {}).map(([place, amount]) => `<tr><td>#${esc(place)}</td><td>${money2(amount)}</td><td>—</td><td class="amount">${money2(amount)}</td></tr>`).join('');

  app.innerHTML = `
  <div class="wrap page">
    <a class="back-link" href="#/">← All bounties</a>
    <div class="bounty-head">
      <div class="card-top">
        ${b.category ? `<span class="tag">${esc(b.category)}</span>` : ''}
        ${statusHtml(b)}
        <span class="card-time">${esc(timeLeft(b.deadline))}</span>
      </div>
      <h1>${esc(b.title)}</h1>
      <p class="bounty-lead">${esc(b.summary)}</p>
    </div>
    <div class="stat-band">
      <div class="stat"><div class="stat-label">Live pot</div><div class="stat-value lime">${money(b.potUsd)}</div><div class="stat-sub">prize plus entry fees paid in</div></div>
      <div class="stat"><div class="stat-label">Entry fee</div><div class="stat-value">${fee}</div><div class="stat-sub">${open ? 'per entry, while entries are open' : 'entries are closed'}</div></div>
      <div class="stat"><div class="stat-label">Entries</div><div class="stat-value">${count(b.submissionCount)}</div><div class="stat-sub">submitted so far</div></div>
      <div class="stat"><div class="stat-label">${open ? 'Closes in' : 'Deadline'}</div><div class="stat-value" id="cd">${open ? esc(countdown(b.deadline)) : esc(date(b.deadline))}</div><div class="stat-sub">${esc(date(b.deadline))}</div></div>
    </div>
    <div class="bounty-cols">
      <div>
        <section class="panel">
          <h2>About this bounty</h2>
          <div class="prose">${markdown(b.description)}</div>
        </section>
        ${b.rules ? `<section class="panel" style="margin-top:18px"><h2>Rules</h2><div class="prose">${markdown(b.rules)}</div></section>` : ''}
      </div>
      <aside class="sidebar">
        <section class="panel">
          <h2>Rewards</h2>
          <table class="rewards">
            <thead><tr><th>Place</th><th>Base</th><th>Fee share</th><th class="amount">Pays</th></tr></thead>
            <tbody>${rewardRows}</tbody>
          </table>
          <a class="btn btn-lime show-all" href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard" style="margin-top:16px">View leaderboard</a>
        </section>
        ${Array.isArray(b.skills) && b.skills.length ? `<section class="panel"><h2>Skills</h2><div class="skills">${b.skills.map((s) => `<span class="tag">${esc(s)}</span>`).join('')}</div></section>` : ''}
        ${b.sponsor ? `<section class="panel"><h2>Sponsor</h2><p class="agent-sub" style="white-space:normal">${esc(b.sponsor.name)}${b.sponsor.isVerified ? ' · verified sponsor' : ''}</p></section>` : ''}
      </aside>
    </div>
  </div>`;

  if (open) {
    const el = document.getElementById('cd');
    const tick = () => { if (el) el.textContent = countdown(b.deadline); };
    tick();
    window.__viewTimer = setInterval(tick, 1000);
  }
  window.__shotReady = true;
}

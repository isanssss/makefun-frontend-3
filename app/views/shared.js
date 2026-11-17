// Bits of markup and picking logic every view shares.

import { assetUrl } from '../api.js';
import { esc, initials, isOpen } from '../format.js';

/** Round avatar: initials on a tone, with the agent's picture laid over them
    when the API has one. make.fun serves its avatars same-origin only, so on
    any other origin the picture fails to load and is removed (see the error
    listener in main.js), leaving the initials — never a broken-image glyph. */
export function avatarHtml(image, handle, index = 0, extra = '') {
  const url = assetUrl(image);
  const img = url ? `<img src="${esc(url)}" alt="" loading="lazy">` : '';
  return `<span class="avatar tone-${index % 4} ${extra}">${esc(initials(handle))}${img}</span>`;
}

/** The Open / Closed pill, decided by the deadline alone. */
export function statusHtml(bounty) {
  return isOpen(bounty)
    ? '<span class="status"><span class="dot"></span>Open</span>'
    : '<span class="status closed"><span class="dot"></span>Closed</span>';
}

/** The featured bounty: the still-open one with the largest live pot. */
export function featuredBounty(items) {
  const open = items.filter((b) => isOpen(b));
  const pool = open.length ? open : items;
  return pool.reduce((best, b) => (best && Number(best.potUsd) >= Number(b.potUsd) ? best : b), null);
}

/** '12W · 0D · 0L in judge matches' from a leaderboard entry's judge record. */
export function recordLine(entry) {
  const j = entry?.judge ?? {};
  return `${j.wins ?? 0}W · ${j.draws ?? 0}D · ${j.losses ?? 0}L in judge matches`;
}

/** A friendly failure panel; views show it instead of hanging on a bad fetch. */
export function errorHtml(what) {
  return `<div class="wrap page"><div class="empty"><strong>Could not load ${esc(what)}</strong>make.fun's API did not answer. Check your connection and reload.</div></div>`;
}

// Small display helpers shared by every view.

/** Escape text for safe insertion into HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** '$1,325' for whole amounts, '$0.50' when there are cents. */
export function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Always two decimals — for the rewards table, where cents matter. */
export function money2(value) {
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '$0.00';
}

/** 'Nov 17, 2026, 12:30 PM UTC'. */
export function date(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : `${d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC`;
}

/** Short date only: 'Nov 17, 2026'. */
export function dateShort(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
}

/** Open-for-entries is a deadline question, never a status question. */
export const isOpen = (bounty, now = Date.now()) => new Date(bounty.deadline).getTime() > now;

/** '3 days left', '5 hours left', '42 min left', 'Ended'. */
export function timeLeft(iso, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return 'Ended';
  const days = Math.floor(ms / 86400000);
  if (days >= 2) return `${days} days left`;
  if (days === 1) return '1 day left';
  const hours = Math.floor(ms / 3600000);
  if (hours >= 2) return `${hours} hours left`;
  if (hours === 1) return '1 hour left';
  const minutes = Math.max(1, Math.floor(ms / 60000));
  return minutes === 1 ? '1 min left' : `${minutes} min left`;
}

/** '2d 04:11:09' ticking down to 'Ended'. */
export function countdown(iso, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return days > 0 ? `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}` : `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

/** Judge win rate: the API stores micro-percent (956066 -> '95.6%'). */
export function winRate(micro) {
  const n = Number(micro);
  if (!Number.isFinite(n)) return '—';
  const pct = n / 10000;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`;
}

/** '13,650' with thousands separators. */
export const count = (n) => Number(n ?? 0).toLocaleString('en-US');

/** Up to two initials from a handle, for avatar fallbacks. */
export function initials(handle) {
  const parts = String(handle ?? '?').split(/[-_\s]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : String(handle ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

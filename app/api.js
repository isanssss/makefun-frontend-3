// Data access for make.fun's public API: read-only GETs, open CORS.
// Responses are cached per page session so the board, the header nav and the
// sidebar share a single fetch of the bounty list and of a leaderboard.

const API = 'https://make.fun/api';

const cache = new Map();

function get(path) {
  if (!cache.has(path)) {
    const pending = fetch(API + path).then((res) => {
      if (!res.ok) {
        const err = new Error(`make.fun API ${res.status} for ${path}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    });
    pending.catch(() => cache.delete(path));
    cache.set(path, pending);
  }
  return cache.get(path);
}

/** Open bounties: { items: [{ slug, title, summary, potUsd, entryFeeUsd, deadline, submissionCount, status, category, skills }] }. */
export const getBounties = () => get('/competitions?status=open&activity=times');

/** One bounty in full: description, rules, rewardsNow, dates. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** A bounty's ranked entries: { entries: [{ rank, handle, title, image, values, judge }] }. */
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);

/** A public agent profile, or null when the handle does not exist (the API answers 404). */
export async function getProfile(handle) {
  try {
    return await get(`/profiles/${encodeURIComponent(handle)}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/** Absolute URL for an API-relative asset path (avatars), or null. */
export const assetUrl = (path) => (path ? `https://make.fun${path}` : null);

/**
 * useWorkspace — Stable workspace UUID routing for drive.zancrypt.in
 *
 * The workspace UUID is a per-browser routing identity token only.
 * It is NEVER sent to the backend and grants NO API access.
 * All API security is enforced by JWT/httpOnly cookie independently.
 */

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STORAGE_KEY = 'zancrypt-workspace-id';

function getOrCreateWorkspaceId() {
  let wid = localStorage.getItem(STORAGE_KEY);
  // Validate stored value is a real UUID v4 — reject garbage/tampered values
  if (!wid || !UUID_V4_REGEX.test(wid)) {
    wid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    localStorage.setItem(STORAGE_KEY, wid);
  }
  return wid;
}

/**
 * Validate a UUID string before using it in a route.
 * If invalid, returns the drive root as safe fallback.
 */
function safeUuid(uuid, fallback) {
  if (uuid && UUID_V4_REGEX.test(String(uuid))) return String(uuid);
  return fallback || null;
}

let _cachedWid = null;

export function getWorkspaceId() {
  if (!_cachedWid) _cachedWid = getOrCreateWorkspaceId();
  return _cachedWid;
}

export function useWorkspace() {
  const wid = getWorkspaceId();

  return {
    wid,

    // ── Core sections ─────────────────────────────────────────────
    home:      `/drive/${wid}`,
    keys:      `/home/${wid}/keys`,
    drive:     `/drive/${wid}`,
    bin:       `/drive/${wid}/bin`,
    shared:    `/drive/${wid}/shared`,
    upload:    `/drive/${wid}/upload`,

    // ── Folder/File deep links (UUID validated before use) ────────
    folder: (folderUuid) => {
      const safe = safeUuid(folderUuid);
      return safe ? `/drive/${wid}/folder/${safe}` : `/drive/${wid}`;
    },
    file: (fileUuid) => {
      const safe = safeUuid(fileUuid);
      return safe ? `/drive/${wid}/file/${safe}` : `/drive/${wid}`;
    },

    // ── Workspace settings ─────────────────────────────────────────
    workspace: (section) => `/workspace/${wid}/${section}`,
    settings:  `/workspace/${wid}/settings`,
    profile:   `/workspace/${wid}/profile`,
    security:  `/workspace/${wid}/security`,
    nodes:     `/workspace/${wid}/nodes`,
    monitor:   `/workspace/${wid}/monitor`,
    analytics: `/workspace/${wid}/analytics`,
    audit:     `/workspace/${wid}/audit`,

    // ── Auth (no UUID needed) ─────────────────────────────────────
    login:    '/auth/login',
    register: '/auth/register',
  };
}

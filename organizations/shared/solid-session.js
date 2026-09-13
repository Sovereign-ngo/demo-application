import { getPodUrlAllFrom, getSolidDataset } from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';

const session = getDefaultSession();
const ready = session.handleIncomingRedirect({ restorePreviousSession: true });

const normalizeBaseUrl = (value) => {
  const url = new URL(String(value || '').trim());
  url.hash = '';
  url.search = '';
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.toString();
};

const getSelection = () => {
  try {
    const currentUrl = new URL(window.location.href);
    const currentPod = currentUrl.searchParams.get('pod');
    if (currentPod) return { podBaseUrl: normalizeBaseUrl(currentPod), webId: String(session.info.webId || '') };
    const locationUrl = new URL(window.top.location.href);
    const podBaseUrl = locationUrl.searchParams.get('pod');
    if (!podBaseUrl) return null;
    return { podBaseUrl: normalizeBaseUrl(podBaseUrl), webId: String(session.info.webId || '') };
  } catch {
    return null;
  }
};

const setSelection = (podBaseUrl) => {
  const selected = normalizeBaseUrl(podBaseUrl);
  const locationUrl = new URL(window.top.location.href);
  locationUrl.searchParams.set('pod', selected);
  window.top.location.assign(locationUrl.toString());
  return { podBaseUrl: selected, webId: String(session.info.webId || '') };
};

const clearSelection = () => {
  try {
    const locationUrl = new URL(window.top.location.href);
    if (!locationUrl.searchParams.has('pod')) return;
    locationUrl.searchParams.delete('pod');
    window.top.history.replaceState(null, '', locationUrl.toString());
  } catch {
    // Cross-origin embedding is unsupported; there is no local selection to clear.
  }
};

const login = async ({ oidcIssuer, redirectUrl } = {}) => {
  await ready;
  if (session.info.isLoggedIn) return session.info;
  await session.login({
    oidcIssuer: normalizeBaseUrl(oidcIssuer),
    redirectUrl: redirectUrl || window.location.href,
    clientName: 'Sovereign NGO Demo'
  });
  return session.info;
};

const logout = async () => {
  await ready;
  clearSelection();
  if (session.info.isLoggedIn) await session.logout();
};

const discoverPods = async () => {
  await ready;
  if (!session.info.isLoggedIn || !session.info.webId) return [];
  const webIdProfile = await getSolidDataset(session.info.webId, { fetch: authenticatedFetch });
  const podUrls = getPodUrlAllFrom({ webIdProfile, altProfileAll: [] }, session.info.webId);
  if (podUrls.length === 0) {
    const webIdUrl = new URL(session.info.webId);
    const profileSuffix = '/profile/card';
    if (webIdUrl.pathname.endsWith(profileSuffix)) {
      webIdUrl.pathname = webIdUrl.pathname.slice(0, -profileSuffix.length + 1);
      podUrls.push(webIdUrl.toString());
    }
  }
  return [...new Set(podUrls.map(normalizeBaseUrl))];
};

const authenticatedFetch = async (...args) => {
  await ready;
  if (!session.info.isLoggedIn) throw new Error('A Solid login is required.');
  return session.fetch(...args);
};

window.SovereignSolidSession = Object.freeze({
  ready,
  get info() { return session.info; },
  getSelection,
  setSelection,
  clearSelection,
  login,
  logout,
  discoverPods,
  fetch: authenticatedFetch
});

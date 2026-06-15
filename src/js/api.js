const trimTrailingSlash = (value) => value.replace(/\/$/, '');

export const apiBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
);

export const assetBaseUrl = trimTrailingSlash(
  import.meta.env.VITE_ASSET_BASE_URL || apiBaseUrl.replace(/\/api$/, '')
);

export const projectsUrl = `${apiBaseUrl}/projects`;

export function storageUrl(path) {
  return new URL(path.replace(/^\/+/, ''), `${assetBaseUrl}/`).href;
}

export function dispatchAuthToken(token: string) {
  window.dispatchEvent(new CustomEvent('auth:token', { detail: { token } }));
}

export function dispatchAuthLogout() {
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

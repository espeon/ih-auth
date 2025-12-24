import type { AuthParams } from '../types/auth';

export function parseAuthParams(search: string): AuthParams | null {
  try {
    const params = new URLSearchParams(search);
    const redirect_uri = params.get('redirect_uri');
    const nonce = params.get('nonce');

    if (!redirect_uri || !nonce) {
      return null;
    }

    return { redirect_uri, nonce };
  } catch {
    return null;
  }
}

export function buildRedirectUrl(
  redirectUri: string,
  nonce: string,
  hint: string
): string {
  try {
    const url = new URL(redirectUri);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('hint', hint);
    return url.toString();
  } catch {
    const separator = redirectUri.includes('?') ? '&' : '?';
    return `${redirectUri}${separator}nonce=${encodeURIComponent(nonce)}&hint=${encodeURIComponent(hint)}`;
  }
}

export function validateHandle(input: string): boolean {
  const handleRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  return handleRegex.test(input);
}

export function validatePdsUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function detectInputType(input: string): 'handle' | 'pds' | null {
  if (validatePdsUrl(input)) return 'pds';
  if (validateHandle(input)) return 'handle';
  return null;
}

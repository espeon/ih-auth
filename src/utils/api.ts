import type { SlingshotResponse, BlueskyProfile, ProfileData, PDSData } from '../types/auth';

const SLINGSHOT_BASE = 'https://slingshot.microcosm.blue/xrpc';
const BLUESKY_API_BASE = 'https://public.api.bsky.app/xrpc';

export async function resolvePDS(identifier: string): Promise<PDSData | null> {
  try {
    const url = `${SLINGSHOT_BASE}/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(identifier)}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;

    const data: SlingshotResponse = await response.json();
    return {
      pds: data.pds,
      did: data.did,
    };
  } catch {
    return null;
  }
}

export async function fetchProfiles(identifiers: string[]): Promise<Map<string, ProfileData>> {
  const profileMap = new Map<string, ProfileData>();

  if (identifiers.length === 0) return profileMap;

  try {
    const actors = identifiers.map(id => encodeURIComponent(id)).join('&actors=');
    const url = `${BLUESKY_API_BASE}/app.bsky.actor.getProfiles?actors=${actors}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return profileMap;

    const data: { profiles: BlueskyProfile[] } = await response.json();

    for (const profile of data.profiles) {
      profileMap.set(profile.handle, {
        avatar: profile.avatar,
        displayName: profile.displayName,
        did: profile.did,
      });

      if (profile.did) {
        profileMap.set(profile.did, {
          avatar: profile.avatar,
          displayName: profile.displayName,
          did: profile.did,
        });
      }
    }

    return profileMap;
  } catch {
    return profileMap;
  }
}

export async function enrichHandle(handle: string): Promise<{ profile?: ProfileData; pdsUrl?: string }> {
  const [profileData, pdsData] = await Promise.all([
    fetchProfiles([handle]).then(map => map.get(handle)),
    resolvePDS(handle),
  ]);

  return {
    profile: profileData || undefined,
    pdsUrl: pdsData?.pds,
  };
}

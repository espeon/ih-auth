export interface AuthParams {
  redirect_uri: string;
  nonce: string;
}

export interface ProfileData {
  avatar?: string;
  displayName?: string;
  did?: string;
}

export interface PDSData {
  pds?: string;
  did?: string;
}

export interface StoredHandle {
  handle: string;
  lastUsed: number;
  type: "handle" | "pds";
  profile?: ProfileData;
  pdsUrl?: string;
}

export interface HandleStorage {
  handles: StoredHandle[];
}

export interface SlingshotResponse {
  did: string;
  pds: string;
  handle?: string;
}

export interface BlueskyProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
}

import type { StoredHandle, HandleStorage, ProfileData } from "../types/auth";

const STORAGE_KEY = "at_auth_handles";
const MAX_HANDLES = 10;

export function getRecentHandles(): StoredHandle[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: HandleStorage = JSON.parse(stored);
    return data.handles.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch {
    return [];
  }
}

export function addHandle(
  handle: string,
  type: "handle" | "pds",
  options?: { profile?: ProfileData; pdsUrl?: string },
): void {
  try {
    const handles = getRecentHandles();

    const existingIndex = handles.findIndex((h) => h.handle === handle);
    if (existingIndex !== -1) {
      handles[existingIndex].lastUsed = Date.now();
      handles[existingIndex].type = type;
      if (options?.profile) {
        handles[existingIndex].profile = options.profile;
      }
      if (options?.pdsUrl) {
        handles[existingIndex].pdsUrl = options.pdsUrl;
      }
    } else {
      handles.unshift({
        handle,
        lastUsed: Date.now(),
        type,
        profile: options?.profile,
        pdsUrl: options?.pdsUrl,
      });
    }

    const trimmed = handles.slice(0, MAX_HANDLES);

    const storage: HandleStorage = { handles: trimmed };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Failed to save handle:", error);
  }
}

export function clearHandles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear handles:", error);
  }
}

export function deleteHandle(handle: string): void {
  try {
    const handles = getRecentHandles();
    const filtered = handles.filter((h) => h.handle !== handle);
    const storage: HandleStorage = { handles: filtered };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Failed to delete handle:", error);
  }
}

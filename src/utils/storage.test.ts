import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRecentHandles, addHandle, clearHandles } from './storage';

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getRecentHandles', () => {
    it('should return empty array when no handles stored', () => {
      expect(getRecentHandles()).toEqual([]);
    });

    it('should return stored handles sorted by lastUsed', () => {
      const handles = {
        handles: [
          { handle: 'old.bsky.social', lastUsed: 1000, type: 'handle' as const },
          { handle: 'new.bsky.social', lastUsed: 2000, type: 'handle' as const },
        ],
      };
      localStorage.setItem('at_auth_handles', JSON.stringify(handles));

      const result = getRecentHandles();
      expect(result[0].handle).toBe('new.bsky.social');
      expect(result[1].handle).toBe('old.bsky.social');
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('at_auth_handles', 'invalid json');
      expect(getRecentHandles()).toEqual([]);
    });
  });

  describe('addHandle', () => {
    it('should add new handle', () => {
      addHandle('user.bsky.social', 'handle');

      const handles = getRecentHandles();
      expect(handles).toHaveLength(1);
      expect(handles[0].handle).toBe('user.bsky.social');
      expect(handles[0].type).toBe('handle');
    });

    it('should update existing handle lastUsed time', () => {
      addHandle('user.bsky.social', 'handle');
      const firstTime = getRecentHandles()[0].lastUsed;

      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      addHandle('user.bsky.social', 'handle');
      const secondTime = getRecentHandles()[0].lastUsed;

      expect(secondTime).toBeGreaterThan(firstTime);
      expect(getRecentHandles()).toHaveLength(1);

      vi.useRealTimers();
    });

    it('should update handle type when re-added', () => {
      addHandle('user.bsky.social', 'handle');
      addHandle('user.bsky.social', 'pds');

      const handles = getRecentHandles();
      expect(handles).toHaveLength(1);
      expect(handles[0].type).toBe('pds');
    });

    it('should limit to max 10 handles', () => {
      for (let i = 0; i < 15; i++) {
        addHandle(`user${i}.bsky.social`, 'handle');
      }

      const handles = getRecentHandles();
      expect(handles).toHaveLength(10);
      expect(handles[0].handle).toBe('user14.bsky.social');
    });
  });

  describe('clearHandles', () => {
    it('should remove all handles', () => {
      addHandle('user.bsky.social', 'handle');
      expect(getRecentHandles()).toHaveLength(1);

      clearHandles();
      expect(getRecentHandles()).toHaveLength(0);
    });
  });
});

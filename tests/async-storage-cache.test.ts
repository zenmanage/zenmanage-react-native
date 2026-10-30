import { describe, expect, it, vi } from 'vitest';
import { AsyncStorageCache } from '../src/cache/AsyncStorageCache';

function createStorage() {
  const memory = new Map<string, string>();

  return {
    memory,
    getItem: vi.fn(async (key: string) => memory.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      memory.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      memory.delete(key);
    }),
  };
}

describe('AsyncStorageCache', () => {
  it('stores and reads values', async () => {
    const storage = createStorage();
    const cache = new AsyncStorageCache({ storage, keyPrefix: 'test' });

    await cache.set('flag', 'value', 60);

    await expect(cache.get('flag')).resolves.toBe('value');
    await expect(cache.has('flag')).resolves.toBe(true);
  });

  it('expires values using ttl', async () => {
    vi.useFakeTimers();

    const storage = createStorage();
    const cache = new AsyncStorageCache({ storage, keyPrefix: 'test' });

    await cache.set('flag', 'value', 1);
    vi.advanceTimersByTime(1100);

    await expect(cache.get('flag')).resolves.toBeNull();

    vi.useRealTimers();
  });

  it('clears rules cache key', async () => {
    const storage = createStorage();
    const cache = new AsyncStorageCache({ storage, keyPrefix: 'test' });

    await cache.set('zenmanage_rules', 'payload');
    await cache.clear();

    await expect(cache.get('zenmanage_rules')).resolves.toBeNull();
  });

  it('drops malformed payloads', async () => {
    const storage = createStorage();
    storage.memory.set('test:broken', '{invalid');

    const cache = new AsyncStorageCache({ storage, keyPrefix: 'test' });

    await expect(cache.get('broken')).resolves.toBeNull();
    expect(storage.removeItem).toHaveBeenCalledWith('test:broken');
  });

  it('deletes keys directly', async () => {
    const storage = createStorage();
    const cache = new AsyncStorageCache({ storage, keyPrefix: 'test' });

    await cache.set('a', 'b');
    await cache.delete('a');

    await expect(cache.has('a')).resolves.toBe(false);
  });
});

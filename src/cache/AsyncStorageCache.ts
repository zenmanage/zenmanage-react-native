import type { Cache } from '@zenmanage/sdk';
import type { AsyncStorageCacheOptions } from '../types';

interface StoredValue {
  value: string;
  expiresAt: number | null;
}

const DEFAULT_KEY_PREFIX = 'zenmanage';

export class AsyncStorageCache implements Cache {
  private readonly storage: AsyncStorageCacheOptions['storage'];
  private readonly keyPrefix: string;

  constructor({ storage, keyPrefix = DEFAULT_KEY_PREFIX }: AsyncStorageCacheOptions) {
    this.storage = storage;
    this.keyPrefix = keyPrefix;
  }

  async get(key: string): Promise<string | null> {
    const raw = await this.storage.getItem(this.formatKey(key));

    if (!raw) {
      return null;
    }

    let parsed: StoredValue;
    try {
      parsed = JSON.parse(raw) as StoredValue;
    } catch {
      await this.storage.removeItem(this.formatKey(key));
      return null;
    }

    if (parsed.expiresAt !== null && Date.now() > parsed.expiresAt) {
      await this.storage.removeItem(this.formatKey(key));
      return null;
    }

    return parsed.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = typeof ttl === 'number' && ttl > 0 ? Date.now() + ttl * 1000 : null;
    const payload: StoredValue = { value, expiresAt };

    await this.storage.setItem(this.formatKey(key), JSON.stringify(payload));
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async delete(key: string): Promise<void> {
    await this.storage.removeItem(this.formatKey(key));
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(this.formatKey('zenmanage_rules'));
  }

  private formatKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }
}

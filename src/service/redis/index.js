import redisClient from './connection.js';
import { waiting } from '../../helpers/utils.js';
import config from '../../config.js';

export default class BaseCache {
  constructor(cacheName) {
    this.cacheName = cacheName;
  }

  async addDataToCache(
    cacheId,
    data,
    expiry = config.REDIS_CACHE_EXPIRY_TIME_S
  ) {
    const stringifyData = JSON.stringify(data);

    const [isDataCached, _] = await beginTransaction((multi) => {
      multi.set(`${this.cacheName}:${cacheId}`, stringifyData, {
        EX: expiry,
      });

      this.releaseLock(cacheId, multi);
    });

    return isDataCached;
  }

  async getDataFromCache(cacheId) {
    await this.waitLockReleased(cacheId);

    const serializedData = await redisClient.get(
      `${this.cacheName}:${cacheId}`
    );
    if (!serializedData) {
      const isLockAcquired = await this.acquireLock(cacheId);
      return isLockAcquired ? [1, []] : this.getDataFromCache(cacheId);
    }

    return JSON.parse(serializedData);
  }

  async updateCacheRenewedAt(time, multi) {
    return multi
      ? multi.set(`renewedAt:${this.cacheName}`, `${time}`)
      : redisClient.set(`renewedAt:${this.cacheName}`, `${time}`);
  }

  async getCacheRenewedAt() {
    let cacheRenewedAt = await redisClient.get(`renewedAt:${this.cacheName}`);
    if (cacheRenewedAt) return cacheRenewedAt;

    cacheRenewedAt = +new Date();
    await this.updateCacheRenewedAt(cacheRenewedAt);
    return cacheRenewedAt;
  }

  async upsertHash(id, value, multi) {
    return multi
      ? multi.hSet(`${this.cacheName}:${id}`, value)
      : redisClient.hSet(`${this.cacheName}:${id}`, value);
  }

  async readHash(id, multi) {
    return multi
      ? multi.hGetAll(`${this.cacheName}:${id}`)
      : redisClient.hGetAll(`${this.cacheName}:${id}`);
  }

  async removeKeys(keys, multi) {
    return multi ? multi.del(keys) : redisClient.del(keys);
  }

  async acquireLock(
    id,
    value,
    nx = true,
    expiry = config.REDIS_LOCK_EXPIRY_TIME_S
  ) {
    return redisClient.set(`lock:${this.cacheName}:${id}`, value || id, {
      NX: nx,
      EX: expiry,
    });
  }

  async releaseLock(id, multi) {
    return multi
      ? multi.del(`lock:${this.cacheName}:${id}`)
      : redisClient.del(`lock:${this.cacheName}:${id}`);
  }

  async waitLockReleased(id, retrySecond = config.REDIS_RETRY_DELAY_TIME_S) {
    while (await this.#isLock(id)) {
      await waiting(retrySecond);
    }
  }

  async #isLock(id) {
    return redisClient.get(`lock:${this.cacheName}:${id}`);
  }
}

export async function beginTransaction(cb) {
  const multi = redisClient.multi();

  try {
    cb(multi);
    const results = await multi.exec();

    return results;
  } catch (err) {
    throw err;
  }
}

import { createClient } from 'redis';

import config from '../../config.js';

class RedisConnection {
  constructor() {
    this.client = createClient({
      url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
    });
    this.#cacheConnect();
    this.#cacheError();
  }

  async connect() {
    !this.client.isOpen && (await this.client.connect());
  }

  #cacheError() {
    this.client.on('error', (err) => {
      console.log(`Connect to redis failed. Error:${err}`);
    });
  }

  #cacheConnect() {
    this.client.on('connect', () => {
      console.log(`Connect to redis successed.`);
    });
  }
}

export const redisConnection = new RedisConnection();

export default redisConnection.client;

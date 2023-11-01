import lodash from 'lodash';

import BaseCache, { beginTransaction } from './index.js';
import { serialize, deserialize, waiting } from '../../helpers/utils.js';
import config from '../../config.js';

class ProductCache extends BaseCache {
  constructor(cacheName) {
    super(cacheName);
  }

  async addProductsToCache(cacheId, products) {
    const serializedProducts = JSON.stringify(products);
    const [isProductsCached, _] = await beginTransaction((multi) => {
      this.createString(
        cacheId,
        serializedProducts,
        config.REDIS_READ_ALL_EXPIRY_TIME_S,
        multi
      );
      this.releaseLock(cacheId, multi);
    });

    return isProductsCached;
  }

  async addSingleProductToCache(cacheId, product) {
    const serializedProduct = serialize(product);
    const [isProductCached, _] = await beginTransaction((multi) => {
      this.upsertHash(cacheId, serializedProduct, multi);
      this.releaseLock(cacheId, multi);
    });

    this.renewedAt = +new Date();

    return isProductCached;
  }

  async getProductsFromCache(cacheId) {
    await this.waitLockReleased(cacheId);

    const serializedProducts = await this.readString(cacheId);
    if (!serializedProducts) {
      const isLockAcquired = await this.acquireLock(cacheId);
      return isLockAcquired ? null : this.getProductsFromCache(cacheId);
    }

    const products = JSON.parse(serializedProducts);
    return products;
  }

  async getSingleProductFromCache(cacheId) {
    await this.waitLockReleased(cacheId);

    const serializedProduct = await this.readHash(cacheId);
    if (lodash.isEmpty(serializedProduct)) {
      const isLockAcquired = await this.acquireLock(cacheId);

      return isLockAcquired ? null : this.getSingleProductFromCache(cacheId);
    }

    const product = deserialize(serializedProduct);
    return product;
  }

  async updateProductInCache(cacheId, product) {
    const serializedProduct = serialize(lodash.omit(product, ['id']));
    await this.upsertHash(cacheId, serializedProduct);

    this.renewedAt = +new Date();
  }

  async removeProductFromCache(cacheId) {
    await this.removeKeys(cacheId);
    this.renewedAt = +new Date();
  }
}

export default new ProductCache('Product');

import BaseCache from './index.js';

class ProductCache extends BaseCache {
  constructor(cacheName) {
    super(cacheName);
  }
}

export default new ProductCache('Product');

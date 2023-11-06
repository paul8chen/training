import BaseCache from './index.js';

class OrderCache extends BaseCache {
  constructor(cacheName) {
    super(cacheName);
  }
}

export default new OrderCache('Order');

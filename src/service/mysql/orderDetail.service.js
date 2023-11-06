import BaseService from './index.js';

export const schema = {
  id: 'number',
  product_id: 'number',
  orderId: 'number',
  quantity: 'number',
  price: 'number',
  created_at: 'string',
};

export class OrderDetailService extends BaseService {
  constructor(table) {
    super(table);
  }
}

export default new OrderDetailService('OrderDetail');

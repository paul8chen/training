import knex from '../knex/index.js';
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

  setupSchema(table) {
    table.increments('id').primary();
    table
      .integer('product_id')
      .unsigned()
      .notNullable()
      .references('Product.id')
      .onDelete('CASCADE');
    table
      .integer('order_id')
      .unsigned()
      .notNullable()
      .references('Order.id')
      .onDelete('CASCADE');
    table.integer('quantity').notNullable();
    table.double('price', 10, 6).notNullable();
    table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
  }
}

export default new OrderDetailService('OrderDetail');

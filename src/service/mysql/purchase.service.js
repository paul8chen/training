import BaseService, { beginTransaction } from './index.js';
import productService from './product.service.js';

export const schema = {
  id: 'number',
  product_id: 'number',
  quantity: 'number',
  price: 'number',
  created_at: 'string',
};

export class PurchaseService extends BaseService {
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
    table.integer('quantity').notNullable();
    table.double('price', 10, 6).notNullable();
    table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
  }

  async addPurchaseToDB(purchase) {
    console.log('CALLED');
    const { product_id, quantity } = purchase;

    return beginTransaction(async (trx) => {
      const id = await this.create(purchase, trx);
      productService.increaseItem({ id: product_id }, 'stock', quantity, trx);

      const addedPurchase = await this.readById(id, '*', trx);
      return addedPurchase;
    });
  }

  async getProductsFromDB(filter, options) {
    const { sortBy, order, limit, page } = options;

    return this.readAll(filter, sortBy, order, limit, page);
  }
}

export default new PurchaseService('Purchase');

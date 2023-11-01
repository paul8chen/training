import knex from '../knex/index.js';
import BaseService, { beginTransaction } from './index.js';
import config from '../../config.js';

export const schema = {
  id: 'number',
  name: 'string',
  price: 'number',
  sold: 'number',
  stock: 'number',
  remark: 'string',
  created_at: 'string',
  updated_at: 'string',
};

export class ProductService extends BaseService {
  constructor(table) {
    super(table);
  }

  setupSchema(table) {
    table.increments('id').primary();
    table.string('name', 40).notNullable();
    table.double('price', 10, 6).notNullable();
    table.integer('sold').notNullable().defaultTo(0);
    table.integer('stock').notNullable().defaultTo(0);
    table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
    table
      .timestamp('updated_at', { precision: 0 })
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    table.string('remark', 200);
  }

  async addProductToDB(product) {
    return beginTransaction(async (trx) => {
      const id = await this.create(product, trx);
      const addedProduct = await this.readById(id, '*', trx);

      return addedProduct;
    });
  }

  async getProductsFromDB(filter, options) {
    const { price, priceComparison, sortBy, order, limit, page } = options;

    return this.#readAll(
      filter,
      price,
      priceComparison,
      sortBy,
      order,
      limit,
      page
    );
  }

  async getSingleProductFromDB(id) {
    return this.readById(id, '*');
  }

  async updateProductInDB(id, product) {
    return beginTransaction(async (trx) => {
      const isIdExist = await this.updateById(id, product);
      if (!isIdExist) return;

      const updatedProduct = await this.readById(id, '*');

      return updatedProduct;
    });
  }

  async removeProductFromDB(id) {
    return this.deleteById(id);
  }

  async removeProductsFromDB(ids) {
    return this.deleteByIds(ids);
  }

  async #readAll(filter, price, priceComparison, sortBy, order, limit, page) {
    return knex(this.table)
      .where(filter)
      .andWhere('price', priceComparison, price)
      .orderBy(sortBy, order)
      .select()
      .limit(limit)
      .offset((page - 1) * limit);
  }
}

export default new ProductService('Product');

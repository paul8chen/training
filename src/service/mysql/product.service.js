import knex from '../knex/index.js';
import BaseService, { beginTransaction } from './index.js';
import ProductFilterQueryBuilder from './filter-query-builder/product.builder.js';

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

  async getProductsFromDB(filter, options) {
    const productFilterQueryBuilder = new ProductFilterQueryBuilder(filter);

    const [totalPage, products] = await productFilterQueryBuilder
      .priceFilter()
      .execute(options);

    return [totalPage, products];
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
}

export default new ProductService('Product');

import lodash from 'lodash';

import knex from '../../knex/index.js';
import config from '../../../config.js';
import FilterQueryBuilder from './index.js';

const defaultOptions = {
  sortBy: 'created_at',
  order: config.BASE_ORDER,
  limit: config.BASE_ITEMS_PER_PAGE,
  page: config.BASE_PAGE,
};

export default class OrderQueryBuilder extends FilterQueryBuilder {
  constructor(filter) {
    super('Order', filter);
  }

  productFilter() {
    const { product } = this.filter;
    if (!product) return this;

    this.query = this.query.whereIn('id', (builder) =>
      builder
        .from(this.table)
        .innerJoin('OrderDetail', `${this.table}.id`, 'OrderDetail.order_id')
        .innerJoin('Product', 'OrderDetail.product_id', 'Product.id')
        .where({ 'Product.name': product })
        .select(`${this.table}.id`)
    );

    this.#omitProductFilter();

    return this;
  }

  async execute(options = defaultOptions) {
    console.log(options);
    const { sortBy, order, limit, page } = options;

    this.query = this.query.where(this.filter);

    return knex
      .from(
        this.query
          .clone()
          .orderBy(sortBy, order)
          .limit(limit)
          .offset((page - 1) * limit)
          .select('*', {
            count: this.query.clone().count('id'),
          })
          .as(`${this.table}`)
      )
      .innerJoin('OrderDetail', `${this.table}.id`, 'OrderDetail.order_id')
      .innerJoin('Product', 'OrderDetail.product_id', 'Product.id')
      .select(
        'count',
        `${this.table}.id`,
        'buyer',
        'status',
        'amount',
        `${this.table}.created_at`,
        'product_id',
        'quantity',
        'OrderDetail.price',
        'name'
      )
      .then((rows) => FilterQueryBuilder.returnDataWithTotalPage(rows, limit));
  }

  #omitProductFilter() {
    this.filter = lodash.omit(this.filter, ['product']);
  }
}

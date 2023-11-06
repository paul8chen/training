import lodash from 'lodash';

import knex from '../../knex/index.js';
import { getNextDate, calTotalPage } from '../../../helpers/utils.js';

export default class FilterQueryBuilder {
  table;
  filter;
  query;

  constructor(table, filter) {
    this.table = table;
    this.filter = filter;
    this.query = knex(table);
  }

  createdAtFilter() {
    const { createdAt, createdAtComparison } = this.filter;
    if (!createdAt) return this;

    this.query =
      createdAtComparison === '='
        ? this.query.whereBetween('created_at', [
            createdAt,
            getNextDate(createdAt),
          ])
        : this.query.where('created_at', createdAtComparison, createdAt);

    this.#omitCreatedAtFilter();

    return this;
  }

  statusFilter() {
    const { status } = this.filter;
    if (!status) return this;

    this.query = this.query.whereIn('status', status);
    this.#omitStatusFilter();

    return this;
  }

  async execute(options, cols) {
    const { sortBy, order, limit, page } = options;

    this.query = this.query.where(this.filter);

    return this.query
      .clone()
      .orderBy(sortBy, order)
      .limit(limit)
      .offset((page - 1) * limit)
      .select(cols || '*', {
        count: this.query.clone().count('id'),
      })
      .then((rows) => FilterQueryBuilder.returnDataWithTotalPage(rows, limit));
  }

  #omitCreatedAtFilter() {
    this.filter = lodash.omit(this.filter, [
      'createdAt',
      'createdAtComparison',
    ]);
  }
  #omitStatusFilter() {
    this.filter = lodash.omit(this.filter, ['status']);
  }

  static returnDataWithTotalPage(rows, limit) {
    if (!rows.length) return [0, []];

    const count = rows[0].count;
    const totalPage = calTotalPage(limit, count);
    const omitCountRows = rows.map((row) => lodash.omit(row, ['count']));
    return [totalPage, omitCountRows];
  }
}

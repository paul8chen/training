import lodash from 'lodash';
import FilterQueryBuilder from './index.js';

export default class ProductQueryBuilder extends FilterQueryBuilder {
  constructor(filter) {
    super('Product', filter);
  }

  priceFilter() {
    const { price, priceComparison } = this.filter;
    if (!price) return this;

    this.query =
      priceComparison === '='
        ? this.query.where({ price })
        : this.query.where('price', priceComparison, price);

    this.#omitPriceFilter();

    return this;
  }

  #omitPriceFilter() {
    this.filter = lodash.omit(this.filter, ['price', 'priceComparison']);
  }
}

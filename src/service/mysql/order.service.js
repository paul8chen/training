import lodash from 'lodash';

import knex from '../knex/index.js';
import BaseService, { beginTransaction } from './index.js';
import productService from './product.service.js';
import orderDetailService from './orderDetail.service.js';
import { BadRequestError } from '../../helpers/error-handler.js';

export const schema = {
  id: 'number',
  buyer: 'string',
  status: 'string',
  amount: 'number',
  created_at: 'string',
};

export const status = [
  'PENDING',
  'ORDER CONFIRMED',
  'SHIPPED',
  'CANCELED',
  'COMPLETED',
];

export class OrderService extends BaseService {
  constructor(table) {
    super(table);
  }

  setupSchema(table) {
    table.increments('id').primary();
    table.string('buyer', 40).notNullable();
    table.string('status', 20).defaultTo('PENDING');
    table.double('amount', 10, 6).notNullable();
    table.timestamp('created_at', { precision: 0 }).defaultTo(knex.fn.now(0));
  }

  async addOrderAndOrderDetailsToDB(order, orderDetails) {
    const serializedOrder = await beginTransaction(async (trx) => {
      await this.#calOrderAmountAndUpdateProduct(order, orderDetails, trx);

      const orderId = await this.create(order, trx);

      orderDetails.forEach((orderDetail) => (orderDetail.order_id = orderId));
      await orderDetailService.create(orderDetails, trx);

      const addedOrder = await this.#readById(orderId, trx);
      return addedOrder;
    });

    const addedOrders = this.#deserializeOrders(serializedOrder);
    return addedOrders[0];
  }

  async getOrdersFromDB(filter, options) {
    const { sortBy, order, limit, page } = options;
    const serializedOrders = await this.#readAll(
      filter,
      sortBy,
      order,
      limit,
      page
    );

    const orders = this.#deserializeOrders(serializedOrders);
    return orders;
  }

  async updateOrderStatusInDB(id, status) {
    return beginTransaction(async (trx) => {
      const isIdExist = await this.updateById(id, { status });
      if (!isIdExist) return;

      const updatedProduct = await this.readById(id, '*');
      return updatedProduct;
    });
  }

  async #readById(id, trx) {
    return trx(this.table)
      .innerJoin('OrderDetail', `${this.table}.id`, 'OrderDetail.order_id')
      .innerJoin('Product', 'OrderDetail.product_id', 'Product.id')
      .where({ 'Order.id': id })
      .select(
        'Order.id',
        'buyer',
        'status',
        'amount',
        'Order.created_at',
        'product_id',
        'quantity',
        'OrderDetail.price',
        'name'
      );
  }

  async #readAll(filter, sortBy, order, limit, page) {
    return knex(this.table)
      .innerJoin('OrderDetail', `${this.table}.id`, 'OrderDetail.order_id')
      .innerJoin('Product', 'OrderDetail.product_id', 'Product.id')
      .where(filter)
      .orderBy(sortBy, order)
      .select(
        'Order.id',
        'buyer',
        'status',
        'amount',
        'Order.created_at',
        'product_id',
        'quantity',
        'OrderDetail.price',
        'name'
      )
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async #calOrderAmountAndUpdateProduct(order, orderDetails, trx) {
    const ids = orderDetails.map(({ product_id }) => product_id);
    const productInfos = await productService.readByIdsLock(
      ids,
      ['price', 'stock'],
      trx,
      'exclusive'
    );

    for (const [index, orderDetail] of Object.entries(orderDetails)) {
      const { product_id, quantity } = orderDetail;
      const { stock, price } = productInfos[index];

      if (quantity > stock)
        throw new BadRequestError(
          `No enough stock for product_id ${product_id}`
        );

      orderDetail.price = price;
      order.amount += price * quantity;

      const increaseProductSold = productService.increaseItem(
        { id: product_id },
        'sold',
        quantity,
        trx
      );
      const decreaseProductStock = productService.increaseItem(
        { id: product_id },
        'stock',
        -quantity,
        trx
      );

      await Promise.all([increaseProductSold, decreaseProductStock]);
    }
  }

  #deserializeOrders(serializedOrders) {
    const orders = [];
    const orderDetailTable = {};

    serializedOrders.forEach((serializedOrder) => {
      const { id, product_id, quantity, price, name } = serializedOrder;

      const orderDetailInfo = { product_id, name, quantity, price };
      const orderInfo = lodash.omit(
        serializedOrder,
        Object.keys(orderDetailInfo)
      );

      if (!orderDetailTable[id]) {
        orders.push(orderInfo);
        orderDetailTable[id] = [orderDetailInfo];
      } else {
        orderDetailTable[id].push(orderDetailInfo);
      }
    });

    orders.forEach((order) => {
      const orderDetails = orderDetailTable[order.id];
      orderDetails.sort((a, b) => a.product_id - b.product_id);

      order.orderDetail = orderDetails;
    });

    return orders;
  }
}

export default new OrderService('Order');

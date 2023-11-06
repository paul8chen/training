import lodash from 'lodash';

import BaseService, { beginTransaction } from './index.js';
import { BadRequestError } from '../../helpers/error-handler.js';
import OrderFilterQueryBuilder from './filter-query-builder/order.builder.js';

export const schema = {
  id: 'number',
  buyer: 'string',
  status: 'string',
  amount: 'number',
  created_at: 'string',
};

export const STATUS = [
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

  async addOrderToDB(buyer, orderDetails) {
    const ids = orderDetails.map((el) => el.product_id);

    const addedId = await beginTransaction(async (trx) => {
      const productInfos = await trx('Product')
        .select('id', 'price', 'stock')
        .whereIn('id', ids)
        .forUpdate();

      let amount = 0;
      for (const productInfo of productInfos) {
        const { id, price, stock } = productInfo;
        const orderDetail = orderDetails.find(
          (el) => el.product_id === `${id}`
        );

        const quantity = +orderDetail.quantity;

        if (quantity > stock)
          throw new BadRequestError(`No enough stock for product_id ${id}`);

        orderDetail.price = price;
        amount += quantity * price;
        await trx('Product')
          .where('id', id)
          .increment({ sold: quantity, stock: -quantity });
      }

      const addedIds = await trx('Order').insert({ buyer, amount });
      orderDetails.forEach((el) => {
        el.order_id = addedIds[0];
      });
      console.log(orderDetails);
      await trx('OrderDetail').insert(orderDetails);

      return addedIds[0];
    });

    if (!addedId) throw new BadRequestError(`Add order failed`);

    const orderFilterQueryBuilder = new OrderFilterQueryBuilder({
      id: addedId,
    });

    const [_, serializedOrders] = await orderFilterQueryBuilder.execute();
    const orders = this.#deserializeOrders(serializedOrders);

    return orders[0];
  }

  async getOrdersFromDB(filter, options) {
    const orderFilterQueryBuilder = new OrderFilterQueryBuilder(filter);

    const [totalPage, serializedOrders] = await orderFilterQueryBuilder
      .createdAtFilter()
      .statusFilter()
      .productFilter()
      .execute(options);

    const orders = this.#deserializeOrders(serializedOrders);

    return [totalPage, orders];
  }

  async updateOrderStatusInDB(id, status) {
    const isIdExist = await this.updateById(id, { status });
    if (!isIdExist) return;

    const updatedProduct = await this.readById(id, '*');
    return updatedProduct;
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

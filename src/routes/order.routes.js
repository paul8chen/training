import express from 'express';

import orderControllers from '../controllers/order.controllers.js';
import { schema, STATUS as status } from '../service/mysql/order.service.js';
import { asyncErrorHandler } from '../helpers/error-handler.js';
import { validateQuery, setupReadAllQuery } from '../helpers/middleware.js';

const { controllerName, getOrders, addOrder, updateOrderStatus } =
  orderControllers;

const validReadOrdersQuerys = {
  buyer: 'PASS',
  product: 'PASS',
  createdAt: 'TIMESTAMP',
  createdAtComparison: 'COMPARISON',
  status: 'STATUS',
  sortBy: 'SCHEMA',
  quantity: 'NUMBER',
  page: 'NUMBER',
  limit: 'NUMBER',
  order: 'ORDER',
};

class OrderRoutes {
  #route;

  constructor() {
    this.#route = express.Router();
  }

  routes() {
    this.#route.get(
      '/',
      validateQuery(controllerName, validReadOrdersQuerys, {
        schema,
        status,
      }),
      setupReadAllQuery,
      asyncErrorHandler(getOrders)
    );
    this.#route.post('/', asyncErrorHandler(addOrder));
    this.#route.patch('/:id', asyncErrorHandler(updateOrderStatus));

    return this.#route;
  }
}

export default new OrderRoutes();

import express from 'express';

import purchaseControllers from '../controllers/purchase.controllers.js';
import { schema } from '../service/mysql/purchase.service.js';
import { asyncErrorHandler } from '../helpers/error-handler.js';
import {
  validateBody,
  validateQuery,
  setupReadAllQuery,
} from '../helpers/middleware.js';

const { controllerName, readPurchases, addPurchase } = purchaseControllers;
const validReadPurchasesQuerys = {
  product_id: 'PASS',
  sortBy: 'SCHEMA',
  quantity: 'NUMBER',
  page: 'NUMBER',
  limit: 'NUMBER',
  order: 'ORDER',
};

class PurchaseRoutes {
  #route;

  constructor() {
    this.#route = express.Router();
  }

  routes() {
    this.#route.get(
      '/',
      validateQuery(controllerName, validReadPurchasesQuerys, { schema }),
      setupReadAllQuery,
      asyncErrorHandler(readPurchases)
    );
    this.#route.post(
      '/',
      validateBody(controllerName, schema),
      asyncErrorHandler(addPurchase)
    );

    return this.#route;
  }
}

export default new PurchaseRoutes();

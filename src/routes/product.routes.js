import express from 'express';

import productController from '../controllers/product.controllers.js';
import { schema } from '../service/mysql/product.service.js';
import { asyncErrorHandler } from '../helpers/error-handler.js';
import {
  validateBody,
  validateQuery,
  setupReadAllQuery,
} from '../helpers/middleware.js';

const {
  controllerName,
  addProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  removeProduct,
  removeMultiProducts,
} = productController;

const validReadProductsQuerys = {
  name: 'PASS',
  price: 'NUMBER',
  priceComparison: 'COMPARISON',
  sortBy: 'SCHEMA',
  page: 'NUMBER',
  limit: 'NUMBER',
  order: 'ORDER',
};

class ProductRoutes {
  #route;

  constructor() {
    this.#route = express.Router();
  }

  routes() {
    this.#route.get(
      '/',
      validateQuery(controllerName, validReadProductsQuerys, { schema }),
      setupReadAllQuery,
      asyncErrorHandler(getProducts)
    );

    this.#route.get('/:id', asyncErrorHandler(getSingleProduct));

    this.#route.post(
      '/',
      validateBody(controllerName, schema),
      asyncErrorHandler(addProduct)
    );

    this.#route.put(
      '/:id',
      validateBody(controllerName, schema),
      asyncErrorHandler(updateProduct)
    );

    this.#route.delete('/:id', asyncErrorHandler(removeProduct));
    this.#route.post('/remove-multi', asyncErrorHandler(removeMultiProducts));

    return this.#route;
  }
}

export default new ProductRoutes();

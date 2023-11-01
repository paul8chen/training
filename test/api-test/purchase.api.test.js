import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';

import app from '../../src/app.js';
import config from '../../src/config.js';
import purchaseService from '../../src/service/mysql/purchase.service.js';
import { objectDatesToIsoString } from '../../src/helpers/utils.js';

const ROUTES = '/purchase';

describe('Purchase Routes', function () {
  describe('POST /', function () {
    it('should throw a BadRequestError with a message of "Product id is a must" when product id is not provided', async function () {
      const addPurchaseWithOutProductId = {
        price: 300,
        quantity: 10,
      };

      const expectedBody = { status: 'error', message: 'Product id is a must' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addPurchaseWithOutProductId)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a message of "Price is a must" when product id is not provided', async function () {
      const addPurchaseWithOutPrice = {
        product_id: 2,
        quantity: 10,
      };

      const expectedBody = { status: 'error', message: 'Price is a must' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addPurchaseWithOutPrice)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a message of "Quantity is a must" when product id is not provided', async function () {
      const addPurchaseWithOutQuantity = {
        product_id: 2,
        price: 300,
      };

      const expectedBody = { status: 'error', message: 'Quantity is a must' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addPurchaseWithOutQuantity)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should return a status code of "201" and a json body with "success" as status and a addedPurchase object as data if a valid request body is provided', async function () {
      const purchaseServiceSpy = sinon.spy(purchaseService, 'addPurchaseToDB');

      const addedPurchase = { product_id: 2, price: 300, quantity: 10 };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addedPurchase)
        .set('Accept', 'application/json');

      const { created_at } = await purchaseServiceSpy.returnValues[0];
      const expectedBody = {
        status: 'success',
        data: {
          addedPurchase: {
            id: 4,
            product_id: addedPurchase.product_id,
            price: addedPurchase.price,
            quantity: addedPurchase.quantity,
            created_at: created_at.toISOString(),
          },
        },
      };

      expect(res.status).to.equal(201);
      expect(res.body).to.eql(expectedBody);

      purchaseServiceSpy.restore();
      purchaseServiceSpy.resetHistory();
    });
  });

  describe('GET /', function () {
    it('should return a status code of "200" and a json body with "success" as status and an array of all the purchases', async function () {
      const purchaseServiceSpy = sinon.spy(
        purchaseService,
        'getProductsFromDB'
      );

      const res = await request(app)
        .get(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .set('Accept', 'application/json');

      const purchases = await purchaseServiceSpy.returnValues[0];
      objectDatesToIsoString(purchases);

      const expectedBody = {
        status: 'success',
        data: {
          purchases: [
            {
              id: 1,
              product_id: 1,
              price: 300,
              quantity: 10,
              created_at: purchases[0].created_at,
            },
            {
              id: 2,
              product_id: 2,
              price: 270,
              quantity: 10,
              created_at: purchases[1].created_at,
            },
            {
              id: 3,
              product_id: 3,
              price: 260,
              quantity: 10,
              created_at: purchases[2].created_at,
            },
          ],
        },
      };

      expect(res.status).to.equal(200);
      expect(res.body).to.eql(expectedBody);

      purchaseServiceSpy.restore();
      purchaseServiceSpy.resetHistory();
    });
  });
});

import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';

import app from '../../src/app.js';
import knex from '../../src/service/knex/index.js';
import config from '../../src/config.js';
import orderService from '../../src/service/mysql/order.service.js';
import { objectDatesToIsoString } from '../../src/helpers/utils.js';

const ROUTES = '/order';

describe('Order Routes', function () {
  beforeEach(async () => {
    await knex.seed.run({ specific: 'order.seed.js' });
  });

  describe('POST /', function () {
    it('should throw a BadRequestError with a message of "Invalid order body" when buyer is not provided', async function () {
      const addOrderWithoutBuyer = {
        orderDetails: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 3 },
        ],
      };

      const expectedBody = { status: 'error', message: 'Invalid order body' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addOrderWithoutBuyer)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a messagfe of "Invalid order body" when orderDetails array is not provided', async function () {
      const addOrderWithoutorderDetails = {
        buyer: 'Paul',
      };

      const expectedBody = { status: 'error', message: 'Invalid order body' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addOrderWithoutorderDetails)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a message of "Invalid order body" when provided buyer type is incorrect', async function () {
      const addOrderWithInvalidBuyerType = {
        buyer: ['Paul'],
        orderDetails: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 3 },
        ],
      };

      const expectedBody = { status: 'error', message: 'Invalid order body' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addOrderWithInvalidBuyerType)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a message of "Invalid order body" when any of provided quantity in orderDetails array is not a number', async function () {
      const addPurchaseWithInvalidQuantity = {
        buyer: 'Paul',
        orderDetails: [
          { product_id: 1, quantity: 2 },
          { product_id: 2, quantity: 'abc' },
        ],
      };

      const expectedBody = { status: 'error', message: 'Invalid order body' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addPurchaseWithInvalidQuantity)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a message of "No enough stock for product_id #id" if ordered product quantity exceeds product stock', async function () {
      const addedOrderWithExceededQuantity = {
        buyer: 'Paul',
        orderDetails: [{ product_id: 2, quantity: 9999 }],
      };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addedOrderWithExceededQuantity)
        .set('Accept', 'application/json');

      const expectedBody = {
        status: 'error',
        message: 'No enough stock for product_id 2',
      };

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should return a status code of "201" and a json body with "success" as status and a addedOrder object as data if a valid request body is provided', async function () {
      const orderServiceSpy = sinon.spy(
        orderService,
        'addOrderAndOrderDetailsToDB'
      );

      const addedOrder = {
        buyer: 'Paul',
        orderDetails: [{ product_id: 2, quantity: 2 }],
      };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addedOrder)
        .set('Accept', 'application/json');

      const { created_at } = await orderServiceSpy.returnValues[0];
      const expectedBody = {
        status: 'success',
        data: {
          addedOrder: {
            buyer: 'Paul',
            amount: 600,
            id: 3,
            created_at: created_at.toISOString(),
            orderDetail: [
              {
                name: 'yow kontiki 38',
                price: 300,
                product_id: 2,
                quantity: 2,
              },
            ],
            status: 'PENDING',
          },
        },
      };

      expect(res.status).to.equal(201);
      expect(res.body).to.eql(expectedBody);

      orderServiceSpy.restore();
      orderServiceSpy.resetHistory();
    });
  });

  describe('GET /', function () {
    it('should throw a BadRequestError with a message of "Invalid Order query parameter" when type of query parameter "status" is incorrect', async function () {
      const invalidStatus = 'waiting';
      const expectedBody = {
        status: 'error',
        message: 'Invalid Order query parameter',
      };

      const res = await request(app)
        .get(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .query({ status: invalidStatus })
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should return a status code of "200" and a json body with "success" as status and an array of all the orders', async function () {
      const orderServiceSpy = sinon.spy(orderService, 'getOrdersFromDB');

      const res = await request(app)
        .get(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .query({ order: 'asc' })
        .set('Accept', 'application/json');

      const orders = await orderServiceSpy.returnValues[0];
      objectDatesToIsoString(orders);

      const expectedBody = {
        status: 'success',
        data: {
          orders: [
            {
              id: 1,
              buyer: 'Paul',
              status: 'PENDING',
              amount: 610,
              created_at: orders[0].created_at,
              orderDetail: [
                {
                  product_id: 1,
                  name: 'YOW MEADOW 28',
                  quantity: 1,
                  price: 330,
                },
                {
                  product_id: 3,
                  name: 'YOW X PUKAS FLAME 33 DECK',
                  quantity: 2,
                  price: 290,
                },
              ],
            },
            {
              id: 2,
              buyer: 'John',
              status: 'PENDING',
              amount: 1530,
              created_at: orders[1].created_at,
              orderDetail: [
                {
                  product_id: 1,
                  name: 'YOW MEADOW 28',
                  quantity: 2,
                  price: 330,
                },
                {
                  product_id: 3,
                  name: 'YOW X PUKAS FLAME 33 DECK',
                  quantity: 3,
                  price: 290,
                },
              ],
            },
          ],
        },
      };

      expect(res.status).to.equal(200);
      expect(res.body).to.eql(expectedBody);

      orderServiceSpy.restore();
      orderServiceSpy.resetHistory();
    });
  });
});

import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';

import app from '../../src/app.js';
import config from '../../src/config.js';
import productService from '../../src/service/mysql/product.service.js';

const ROUTES = '/product';

describe('Product Routes', function () {
  describe('POST /', function () {
    it('should throw a BadRequestError with a message of "Incomplete product" when name is not provided', async function () {
      const addProductWithOutName = {
        price: 380,
      };

      const expectedBody = { status: 'error', message: 'Incomplete product' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addProductWithOutName)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should throw a BadRequestError with a message of "Incomplete product" when price is not provided', async function () {
      const addProductWithOutPrice = {
        name: 'Paul',
      };

      const expectedBody = { status: 'error', message: 'Incomplete product' };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addProductWithOutPrice)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should return a status code of "201" and a json body with "success" as status and a addedProduct object as data if a valid request body is provided', async function () {
      const productServiceSpy = sinon.spy(productService, 'addProductToDB');

      const addedProduct = {
        name: 'YOW CALMON 41',
        price: 340,
        remark: 'surfskate for surfing on the land',
        sold: 0,
        stock: 0,
      };

      const res = await request(app)
        .post(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .send(addedProduct)
        .set('Accept', 'application/json');

      const { id, updated_at, created_at } = await productServiceSpy
        .returnValues[0];
      const expectedAddedProduct = {
        id: 4,
        ...addedProduct,
        updated_at: updated_at.toISOString(),
        created_at: created_at.toISOString(),
      };
      const expectedBody = {
        status: 'success',
        data: { addedProduct: expectedAddedProduct },
      };

      expect(res.status).to.equal(201);
      expect(res.body).to.eql(expectedBody);

      productServiceSpy.restore();
      productServiceSpy.resetHistory();
    });
  });

  describe('GET /', function () {
    it('should return a status code of "200" and a json body with "success" as status and an array of all the products', async function () {
      const productServiceSpy = sinon.spy(productService, 'getProductsFromDB');

      const res = await request(app)
        .get(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}`)
        .set('Accept', 'application/json');

      const products = await productServiceSpy.returnValues[0];
      products.forEach((product) => {
        product.created_at = product.created_at.toISOString();
        product.updated_at = product.updated_at.toISOString();
      });

      const expectedProducts = [
        {
          id: 1,
          name: 'YOW MEADOW 28',
          price: 330,
          sold: 3,
          stock: 10,
          remark: 'surfskate for surfing on the land',
          updated_at: products[0].updated_at,
          created_at: products[0].created_at,
        },
        {
          id: 2,
          name: 'yow kontiki 38',
          price: 300,
          sold: 0,
          stock: 10,
          remark: 'surfskate for surfing on the land',
          updated_at: products[1].updated_at,
          created_at: products[1].created_at,
        },
        {
          id: 3,
          name: 'YOW X PUKAS FLAME 33 DECK',
          price: 290,
          sold: 5,
          stock: 10,
          remark: 'surfskate for surfing on the land',
          updated_at: products[2].updated_at,
          created_at: products[2].created_at,
        },
      ];
      const expectedBody = {
        status: 'success',
        data: { products: expectedProducts },
      };

      expect(res.status).to.equal(200);
      expect(res.body).to.eql(expectedBody);

      productServiceSpy.restore();
      productServiceSpy.resetHistory();
    });
  });

  describe('PUT /', function () {
    it('should throw a BadRequestError with a message of "Product id not exist" when provided ID is not exist', async function () {
      const invalidId = 999;
      const updateBody = { price: 350 };
      const expectedBody = { status: 'error', message: 'Product id not exist' };

      const res = await request(app)
        .put(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}/${invalidId}`)
        .send(updateBody)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should return a status code of "200" and a json body with "success" as status and a updatedProduct object as data when a update body is provided', async function () {
      const productServiceSpy = sinon.spy(productService, 'updateProductInDB');

      const id = 1;
      const updateBody = { price: 350 };

      const res = await request(app)
        .put(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}/${id}`)
        .send(updateBody)
        .set('Accept', 'application/json');

      const { updated_at, created_at } = await productServiceSpy
        .returnValues[0];
      const expectedBody = {
        status: 'success',
        data: {
          updatedProduct: {
            id: 1,
            name: 'YOW MEADOW 28',
            price: 350,
            remark: 'surfskate for surfing on the land',
            sold: 3,
            stock: 10,
            updated_at: updated_at.toISOString(),
            created_at: created_at.toISOString(),
          },
        },
      };

      expect(res.status).to.equal(200);
      expect(res.body).to.eql(expectedBody);

      productServiceSpy.restore();
      productServiceSpy.resetHistory();
    });
  });

  describe('DELETE /', function () {
    it('should throw a BadRequestError with a message of "Product id not exist" when provided ID is not exist', async function () {
      const invalidId = 999;

      const expectedBody = { status: 'error', message: 'Product id not exist' };

      const res = await request(app)
        .delete(
          `${config.BASE_PATH}/${config.API_VERSION}${ROUTES}/${invalidId}`
        )
        .set('Accept', 'application/json');

      expect(res.status).to.equal(400);
      expect(res.body).to.eql(expectedBody);
    });

    it('should return a status code of "204" without any json body when a valid id is provided', async function () {
      const id = 1;

      const res = await request(app)
        .delete(`${config.BASE_PATH}/${config.API_VERSION}${ROUTES}/${id}`)
        .set('Accept', 'application/json');

      expect(res.status).to.equal(204);
      expect(res.body).to.be.empty;
    });
  });
});

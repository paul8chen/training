import productService from '../service/mysql/product.service.js';
import productCache from '../service/redis/product.cache.js';
import { BadRequestError, ServerError } from '../helpers/error-handler.js';
import getQueryCacheId from '../helpers/uuid-generator.js';

class ProductController {
  constructor(controllerName) {
    this.controllerName = controllerName;
  }

  async addProduct(req, res) {
    const newProduct = req.body;
    const { name, price } = newProduct;
    if (!name || !price) throw new BadRequestError('Incomplete product');

    const addedProduct = await productService.addToDB(newProduct);
    if (!addedProduct) throw new ServerError('Add Product to DB failed');

    await productCache.updateCacheRenewedAt(+new Date());

    res.status(201).json({
      status: 'success',
      data: { addedProduct },
    });
  }

  async getProducts(req, res) {
    const { name, price, priceComparison, sortBy, page, limit, order } =
      req.query;
    console.log(req.query);
    const filter = {};
    if (name) filter.name = name;
    if (price && priceComparison) {
      filter.price = +price;
      filter.priceComparison = priceComparison;
    }
    const options = {
      sortBy: sortBy || 'updated_at',
      page,
      limit,
      order,
    };

    // const cacheRenewedAt = await productCache.getCacheRenewedAt();
    const cacheRenewedAt = +new Date();
    const cacheId = getQueryCacheId({ ...filter, ...options, cacheRenewedAt });

    let totalPage, products;

    [totalPage, products] = await productCache.getDataFromCache(cacheId);

    if (products.length)
      return res
        .status(200)
        .json({ status: 'success', data: { totalPage, products } });

    [totalPage, products] = await productService.getProductsFromDB(
      filter,
      options
    );

    if (!products.length) {
      await productCache.releaseLock(cacheId);
      res
        .status(200)
        .json({ status: 'success', data: { totalPage: 1, products: [] } });
      return;
    }

    const isProductsCached = await productCache.addDataToCache(cacheId, [
      totalPage,
      products,
    ]);
    if (!isProductsCached)
      throw new ServerError('Add Products to cache failed');

    res.status(200).json({ status: 'success', data: { totalPage, products } });
  }

  async getSingleProduct(req, res) {
    const { id } = req.params;

    let product;

    product = await productCache.getSingleProductFromCache(id);
    if (product)
      return res.status(200).json({ status: 'success', data: { product } });

    product = await productService.getSingleProductFromDB(id);
    if (!product) {
      productCache.releaseLock(id);
      throw new BadRequestError('Product id not exist');
    }

    const isProductCached = await productCache.addSingleProductToCache(
      id,
      product
    );
    if (!isProductCached) throw new ServerError('Add product to cache failed');

    res.status(200).json({ status: 'success', data: { product } });
  }

  async updateProduct(req, res) {
    const { id } = req.params;
    const newerProduct = req.body;

    const updatedProduct = await productService.updateInDB(id, newerProduct);
    if (!updatedProduct) throw new BadRequestError('Product id not exist');

    await productCache.updateCacheRenewedAt(+new Date());

    res.status(200).json({ status: 'success', data: { updatedProduct } });
  }

  async removeProduct(req, res) {
    const { id } = req.params;

    const isRemoved = await productService.removeFromDB(id);
    if (!isRemoved) throw new BadRequestError('Product id not exist');

    await productCache.updateCacheRenewedAt(+new Date());

    res.sendStatus(204);
  }

  async removeMultiProducts(req, res) {
    const { ids } = req.body;

    if (!ids.length) throw new BadRequestError('Product id is a must');
    for (let id of ids) {
      if (!['string', 'number'].includes(typeof id))
        throw new BadRequestError('Invalid product id');
    }

    const isRemoved = await productService.removeFromDB(ids);
    if (!isRemoved) throw new BadRequestError('Product id not exist');

    await productCache.updateCacheRenewedAt(+new Date());

    res.sendStatus(204);
  }
}

export default new ProductController('Product');

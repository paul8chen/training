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

    const addedProduct = await productService.addProductToDB(newProduct);
    const { id: cacheId } = addedProduct;

    await productCache.addSingleProductToCache(cacheId, addedProduct);

    res.status(201).json({
      status: 'success',
      data: { addedProduct },
    });
  }

  async getProducts(req, res) {
    const { name, price, priceComparison, sortBy, page, limit, order } =
      req.query;

    const filter = name ? { name } : {};
    const options = {
      price: +price || 0,
      priceComparison: priceComparison || '>',
      sortBy: sortBy || 'updated_at',
      page,
      limit,
      order,
    };

    const cacheRenewedAt = productCache.renewedAt;
    const cacheId = getQueryCacheId(options, cacheRenewedAt);

    let products;

    products = await productCache.getProductsFromCache(cacheId);
    if (products)
      return res.status(200).json({ status: 'success', data: { products } });

    products = await productService.getProductsFromDB(filter, options);
    if (!products.length) {
      await productCache.releaseLock(cacheId);
      res.status(200).json({ status: 'success', data: { products: [] } });
      return;
    }

    const isProductsCached = await productCache.addProductsToCache(
      cacheId,
      products
    );
    if (!isProductsCached)
      throw new ServerError('Add Products to cache failed');

    res.status(200).json({ status: 'success', data: { products } });
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

    const updatedProduct = await productService.updateProductInDB(
      id,
      newerProduct
    );
    if (!updatedProduct) throw new BadRequestError('Product id not exist');

    await productCache.updateProductInCache(id, updatedProduct);

    res.status(200).json({ status: 'success', data: { updatedProduct } });
  }

  async removeProduct(req, res) {
    const { id } = req.params;

    const isRemoved = await productService.removeProductFromDB(id);
    if (!isRemoved) throw new BadRequestError('Product id not exist');

    const cacheId = `Product:${id}`;
    await productCache.removeProductFromCache(cacheId);

    res.sendStatus(204);
  }

  async removeMultiProducts(req, res) {
    const { ids } = req.body;

    if (!ids.length) throw new BadRequestError('Product id is a must');
    for (let id of ids) {
      if (!['string', 'number'].includes(typeof id))
        throw new BadRequestError('Invalid product id');
    }

    const isRemoved = await productService.removeProductsFromDB(ids);
    if (!isRemoved) throw new BadRequestError('Product id not exist');

    const cacheIds = ids.map((id) => `Product:${id}`);
    await productCache.removeProductFromCache(cacheIds);

    res.sendStatus(204);
  }
}

export default new ProductController('Product');

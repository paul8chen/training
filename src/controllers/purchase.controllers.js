import purchaseService from '../service/mysql/purchase.service.js';
import { BadRequestError } from '../helpers/error-handler.js';

class PurchaseController {
  constructor(controllerName) {
    this.controllerName = controllerName;
  }

  addPurchase = async (req, res, next) => {
    const { product_id, price, quantity } = req.body;

    if (!product_id) throw new BadRequestError('Product id is a must');
    if (!price) throw new BadRequestError('Price is a must');
    if (!quantity) throw new BadRequestError('Quantity is a must');

    const newProduct = { product_id, price, quantity };
    const addedPurchase = await purchaseService.addPurchaseToDB(newProduct);

    res.status(201).json({
      status: 'success',
      data: { addedPurchase },
    });
  };

  async readPurchases(req, res) {
    const { product_id, sortBy, page, limit, order } = req.query;

    const filter = product_id ? { product_id } : {};
    const options = {
      sortBy: sortBy || 'created_at',
      page,
      limit,
      order,
    };

    const purchases = await purchaseService.getProductsFromDB(filter, options);

    res.status(200).json({ status: 'success', data: { purchases } });
  }
}

export default new PurchaseController('Purchase');

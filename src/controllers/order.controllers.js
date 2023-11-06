import { BadRequestError } from '../helpers/error-handler.js';
import { firstLetterUpperCase } from '../helpers/utils.js';
import orderService, {
  schema as orderSchema,
  STATUS as orderStatus,
} from '../service/mysql/order.service.js';
import orderCache from '../service/redis/order.cache.js';
import getQueryCacheId from '../helpers/uuid-generator.js';

class OrderController {
  constructor(controllerName) {
    this.controllerName = controllerName;
  }

  addOrder = async (req, res) => {
    const isBodyValid = this.#validateAddOrderBody(req.body);
    if (!isBodyValid) throw new BadRequestError('Invalid order body');

    const { buyer, orderDetails } = req.body;

    const addedOrder = await orderService.addOrderToDB(
      firstLetterUpperCase(buyer),
      orderDetails
    );
    if (!addedOrder) throw new ServerError('Add Order to DB failed');

    await orderCache.updateCacheRenewedAt(+new Date());

    res.status(201).json({
      status: 'success',
      data: { addedOrder },
    });
  };

  getOrders = async (req, res) => {
    const {
      buyer,
      product,
      createdAt,
      createdAtComparison,
      status,
      sortBy,
      page,
      order,
      limit,
    } = req.query;

    const filter = {};
    if (buyer) filter.buyer = buyer;
    if (status) filter.status = status;
    if (product) filter.product = product;
    if (createdAt && createdAtComparison) {
      filter.createdAt = createdAt;
      filter.createdAtComparison = createdAtComparison;
    }

    const options = {
      sortBy: sortBy || 'created_at',
      page,
      limit,
      order,
    };

    // const cacheRenewedAt = await orderCache.getCacheRenewedAt();
    const cacheRenewedAt = +new Date();
    const cacheId = getQueryCacheId({ ...filter, ...options, cacheRenewedAt });

    let totalPage, orders;

    [totalPage, orders] = await orderCache.getDataFromCache(cacheId);
    if (orders.length)
      return res
        .status(200)
        .json({ status: 'success', data: { totalPage, orders } });

    [totalPage, orders] = await orderService.getOrdersFromDB(filter, options);
    if (!orders.length) {
      await orderCache.releaseLock(cacheId);
      res
        .status(200)
        .json({ status: 'success', data: { totalPage: 1, products: [] } });
      return;
    }

    const isCached = await orderCache.addDataToCache(cacheId, [
      totalPage,
      orders,
    ]);
    if (!isCached) throw new ServerError('Add Orders to cache failed');

    res.status(200).json({ status: 'success', data: { totalPage, orders } });
  };

  async updateOrderStatus(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;

    if (!orderStatus.includes(status))
      return next(new BadRequestError('Invalid order status'));

    const updatedOrder = await orderService.updateInDB(id, { status });
    if (!updatedOrder) return next(new BadRequestError('Order id not exist'));

    await orderCache.updateCacheRenewedAt(+new Date());

    res.status(200).json({ status: 'success', data: { updatedOrder } });
  }

  #validateAddOrderBody = (body) => {
    const validatedBody = true;
    const { buyer, orderDetails } = body;

    if (!buyer || !orderDetails?.length) return !validatedBody;
    if (typeof buyer !== orderSchema['buyer']) return !validatedBody;
    if (orderDetails.some(({ quantity }) => isNaN(quantity)))
      return !validatedBody;

    return validatedBody;
  };
}

export default new OrderController('Order');

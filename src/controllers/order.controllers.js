import { BadRequestError } from '../helpers/error-handler.js';
import { firstLetterUpperCase } from '../helpers/utils.js';
import orderService, {
  schema as orderSchema,
  status as orderStatus,
} from '../service/mysql/order.service.js';

class OrderController {
  constructor(controllerName) {
    this.controllerName = controllerName;
  }

  addOrder = async (req, res) => {
    const isBodyValid = this.#validateAddOrderBody(req.body);
    if (!isBodyValid) throw new BadRequestError('Invalid order body');

    const { buyer, orderDetails } = req.body;
    const order = { buyer: firstLetterUpperCase(buyer), amount: 0 };

    const addedOrder = await orderService.addOrderAndOrderDetailsToDB(
      order,
      orderDetails
    );

    res.status(201).json({
      status: 'success',
      data: { addedOrder },
    });
  };

  getOrders = async (req, res) => {
    const { buyer, status, sortBy, page, order, limit } = req.query;

    let filter = {};
    if (buyer) filter.buyer = buyer;
    if (status) filter.status = status;

    const options = {
      sortBy: sortBy || 'created_at',
      page,
      limit,
      order,
    };

    const orders = await orderService.getOrdersFromDB(filter, options);

    res.status(200).json({ status: 'success', data: { orders } });
  };

  async updateOrderStatus(req, res, next) {
    const { id } = req.params;
    const { status } = req.body;

    if (!orderStatus.includes(status))
      return next(new BadRequestError('Invalid order status'));

    const updatedOrder = await orderService.updateOrderStatusInDB(id, status);
    if (!updatedOrder) return next(new BadRequestError('Order id not exist'));

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

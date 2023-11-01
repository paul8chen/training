import config from '../config.js';
import productRoutes from './product.routes.js';
import purchaseRoutes from './purchase.routes.js';
import orderRoutes from './order.routes.js';

export default (app) => {
  const routes = () => {
    app.use(
      `${config.BASE_PATH}/${config.API_VERSION}/product`,
      productRoutes.routes()
    );
    app.use(
      `${config.BASE_PATH}/${config.API_VERSION}/purchase`,
      purchaseRoutes.routes()
    );
    app.use(
      `${config.BASE_PATH}/${config.API_VERSION}/order`,
      orderRoutes.routes()
    );
  };

  routes();
};

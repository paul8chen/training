import express from 'express';
import cors from 'cors';

import config from './config.js';
import applicationRoute from './routes/index.js';
import { NotFoundError } from './helpers/error-handler.js';

export default class Server {
  #app;

  constructor(app) {
    this.#app = app;
  }

  start() {
    this.#standardMiddleware(this.#app);
    this.#securityMiddleware(this.#app);
    this.#routeMiddleware(this.#app);
    this.#errorHandlerMiddleware(this.#app);
    this.#startServer(this.#app);
  }

  #standardMiddleware(app) {
    app.use(express.json({ limit: '50mb' }));
  }

  #securityMiddleware(app) {
    app.use(
      cors({
        origin: `${config.CLIENT_URL}`,
        // credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      })
    );
  }

  #routeMiddleware(app) {
    applicationRoute(app);
  }

  #errorHandlerMiddleware(app) {
    app.all('*', (req, res) => {
      throw new NotFoundError(`${req.originalUrl} not found`);
    });

    app.use((err, req, res, next) => {
      console.log(err);
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Something went wrong';

      res.status(statusCode).json({ status: 'error', message });
      next();
    });
  }

  #startServer(app) {
    let SERVER_PORT;
    switch (config.NODE_ENV) {
      case 'test':
        SERVER_PORT = config.SERVER_PORT_TEST;
        break;

      default:
        SERVER_PORT = config.SERVER_PORT;
        break;
    }

    app.listen(SERVER_PORT, () => {
      console.log(
        `[${config.NODE_ENV}] Server is listening on port: ${SERVER_PORT}`
      );
    });
  }
}

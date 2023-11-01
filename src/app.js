import express from 'express';

import config from './config.js';
import Server from './setupServer.js';
import setupDatabase from './setupDatabase.js';

class Application {
  async initialize() {
    this.#loadConfig();
    await setupDatabase();
    const app = express();
    const server = new Server(app);
    server.start();
    this.app = app;
    Application.handleExit();
  }

  #loadConfig() {
    config.validateConfig();
  }

  static handleExit() {
    process.on('uncaughtException', (error) => {
      console.log(`There was an uncaught error: ${error}`);
      Application.shutDownProperly(1);
    });
  }

  static shutDownProperly(exitCode) {
    Promise.resolve()
      .then(() => {
        console.log('Shutdown complete');
        process.exit(exitCode);
      })
      .catch((error) => {
        console.log(`Error during shutdown: ${error}`);
        process.exit(1);
      });
  }
}

// process.env.TZ = 'Asia/Taipei';
// const date = new Date('2023-10-12T00:26:37.000Z');
// console.log(date);
// console.log(date.toLocaleTimeString());
const application = new Application();
await application.initialize();

export default application.app;

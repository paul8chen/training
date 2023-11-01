export const asyncErrorHandler = (cb) => (req, res, next) => {
  cb(req, res, next).catch(next);
};

export class BadRequestError extends Error {
  statusCode = 400;
  constructor(message) {
    super(message);
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message) {
    super(message);
  }
}

export class ServerError extends Error {
  statusCode = 500;
  constructor(message) {
    super(message);
  }
}

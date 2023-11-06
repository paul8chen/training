import { BadRequestError } from './error-handler.js';
import { getTransFormedTZDate } from './utils.js';
import config from '../config.js';

export const validateBody = function (controllerName, schema) {
  return function (req, res, next) {
    for (const [col, value] of Object.entries(req.body)) {
      if (schema[col] !== typeof value) {
        throw new BadRequestError(`Invalid ${controllerName}`);
      }
    }
    next();
  };
};

export const validateQuery = function (controllerName, validQuerys, options) {
  const { status, schema } = options;

  return function (req, res, next) {
    for (const [query, val] of Object.entries(req.query)) {
      const type = validQuerys[query];
      if (!type)
        throw new BadRequestError(`Invalid ${controllerName} query parameter`);

      switch (type) {
        case 'PASS':
          continue;
        case 'NUMBER':
          if (numberValidator(val)) continue;
          break;
        case 'COMPARISON':
          if (comparisonValidator(val)) continue;
          break;
        case 'ORDER':
          if (orderValidator(val)) continue;
          break;
        case 'SCHEMA':
          if (schemaValidator(val, schema)) continue;
          break;
        case 'STATUS':
          if (statusValidator(val, status)) continue;
          break;
        case 'TIMESTAMP':
          if (timestampValidator(val)) {
            req.query[query] = getTransFormedTZDate(val);
            continue;
          }
          break;
      }

      throw new BadRequestError(`Invalid ${controllerName} query parameter`);
    }
    next();
  };
};

export const setupReadAllQuery = function (req, res, next) {
  req.query.page = +req.query.page || +config.BASE_PAGE;
  req.query.limit = +req.query.limit || +config.BASE_ITEMS_PER_PAGE;
  req.query.order = req.query.order || config.BASE_ORDER;

  next();
};

function numberValidator(val) {
  return !isNaN(val);
}
function comparisonValidator(val) {
  return ['>', '<', '='].includes(val);
}
function orderValidator(val) {
  return ['asc', 'desc'].includes(val);
}
function schemaValidator(val, schema) {
  return schema[val];
}
function statusValidator(vals, status) {
  return vals.every((val) => status.includes(val));
}
function timestampValidator(val) {
  return new Date(val).getTime() > 0;
}

import { v5 as uuidv5 } from 'uuid';

import config from '../config.js';

export default (query, cachedAt) =>
  uuidv5(JSON.stringify({ ...query, cachedAt }), config.UUID_NAMESPACE);

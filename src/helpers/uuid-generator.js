import { v5 as uuidv5 } from 'uuid';

import config from '../config.js';

export default (query) => uuidv5(JSON.stringify(query), config.UUID_NAMESPACE);

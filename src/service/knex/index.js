import Knex from 'knex';

import knexfile from './knexfile.js';
import config from '../../config.js';

export default Knex(knexfile[config.NODE_ENV]);

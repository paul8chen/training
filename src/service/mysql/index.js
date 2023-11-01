import knex from '../knex/index.js';

export default class BaseService {
  constructor(table) {
    this.table = table;
  }

  async createTable() {
    const isTableExist = await knex.schema.hasTable(this.table);
    if (isTableExist) return;

    await knex.schema.createTable(this.table, this.setupSchema);
    console.log(`*** ${this.table} has been created successfully. ***`);
  }

  async dropTable() {
    const isTableExist = await knex.schema.hasTable(this.table);
    if (!isTableExist) return;

    await knex.schema.dropTable(this.table);
  }

  async create(data, trx = false) {
    const ids = trx
      ? await trx(this.table).insert(data)
      : await knex(this.table).insert(data);

    return ids[0];
  }

  async readAll(filter, sortBy, order, limit, page) {
    return knex(this.table)
      .where(filter)
      .orderBy(sortBy, order)
      .select()
      .limit(limit)
      .offset((page - 1) * limit);
  }

  async readById(id, cols, trx) {
    const data = trx
      ? await trx(this.table)
          .where({ id })
          .select(...cols)
      : await knex(this.table)
          .where({ id })
          .select(...cols);

    return data[0];
  }

  async readByIds(ids, cols) {
    return knex(this.table)
      .whereIn('id', ids)
      .select(...cols);
  }

  async readByIdsLock(ids, cols, trx, lockMode) {
    if (lockMode === 'exclusive')
      return trx(this.table)
        .forUpdate()
        .whereIn('id', ids)
        .select(...cols);

    if (lockMode === 'share')
      return trx(this.table)
        .forShare()
        .whereIn('id', ids)
        .select(...cols);
  }

  async updateById(id, data, trx) {
    return trx
      ? trx(this.table).where({ id }).update(data)
      : knex(this.table).where({ id }).update(data);
  }

  async deleteById(id) {
    return knex(this.table).where({ id }).del();
  }

  async deleteByIds(ids) {
    return knex(this.table).whereIn('id', ids).del();
  }

  async increaseItem(filter, item, inc, trx) {
    trx
      ? await trx(this.table).where(filter).increment(item, inc)
      : await knex(this.table).where(filter).increment(item, inc);
  }
}

export async function beginTransaction(cb) {
  const trx = await knex.transaction();

  try {
    const result = await cb(trx);
    trx.commit();

    return result;
  } catch (err) {
    trx.rollback();

    throw err;
  }
}

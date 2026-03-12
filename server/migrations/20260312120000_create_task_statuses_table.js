// @ts-check

export const up = (knex) => {
  return knex.schema.createTable('task_statuses', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}

export const down = (knex) => knex.schema.dropTableIfExists('task_statuses')

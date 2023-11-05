// File: database/migrations/xxxx_xx_xx_xxxxxx_create_stories.ts

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Stories extends BaseSchema {
  protected tableName = 'stories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('media_link').notNullable()
      table.enum('media_type', ['image', 'video']).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

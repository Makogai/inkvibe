import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class FollowsSchema extends BaseSchema {
  protected tableName = 'follows'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('follower_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('following_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.boolean('accepted').defaultTo(false) // To handle follow requests
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

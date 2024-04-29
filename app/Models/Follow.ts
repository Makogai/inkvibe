// File: app/Models/Follow.ts

import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Follow extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public follower_id: number

  @column()
  public following_id: number

  @column()
  public accepted: boolean

  @belongsTo(() => User, {
    foreignKey: 'follower_id', // The column name in the Follow table
  })
  public follower: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'following_id', // The column name in the Follow table
  })
  public following: BelongsTo<typeof User>
}

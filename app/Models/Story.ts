// File: app/Models/Story.ts

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import { scope } from '@adonisjs/lucid/build/src/Helpers/scope'

export default class Story extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column()
  public mediaLink: string

  @column()
  public mediaType: 'image' | 'video'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public isExpired(): boolean {
    return this.createdAt.diffNow().as('hours') >= 24
  }

  public static activeStories = scope((query) => {
    const yesterday = DateTime.local().minus({ days: 1 });
    // @ts-ignore
    query.where('created_at', '>', yesterday.toSQL());
  });
}

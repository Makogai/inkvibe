import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Story from 'App/Models/Story'
import Follow from 'App/Models/Follow'
import { computed } from '@adonisjs/lucid/build/src/Orm/Decorators'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  // issue 1

  @column()
  public username: string;

  @column()
  public name: string;

  @column()
  public gender: number;

  @column()
  public bio: string;

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @column()
  public profilePicture: string | null

  @hasMany(() => Story)
  public stories: HasMany<typeof Story>


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => Follow, {
    foreignKey: 'following_id',
  })
  public followers: HasMany<typeof Follow>

  @hasMany(() => Follow, {
    foreignKey: 'follower_id',
  })
  public followings: HasMany<typeof Follow>

  @computed()
  public get followersCount() {
    return Follow.query()
      .where('following_id', this.id)
      .andWhere('accepted', true)
      .count('* as total')
      .then(result => result[0]?.$extras.total || 0);
  }

  @computed()
  public get followingsCount() {
    return Follow.query()
      .where('follower_id', this.id)
      .andWhere('accepted', true)
      .count('* as total')
      .then(result => result[0]?.$extras.total || 0);
  }

}

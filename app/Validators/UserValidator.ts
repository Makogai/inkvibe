// File: app/Validators/UserValidator.ts

import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { message } from 'memfs/lib/internal/errors'

export default class UserValidator {
  public static createSchema = schema.create({
    username: schema.string({ trim: true }, [
      rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
    ]),
    password: schema.string({}, [rules.minLength(8)]),
    profile_picture: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
  })

  public static updateSchema = schema.create({
    username: schema.string.optional({ trim: true }, [
      rules.uniqueExceptSelf({ table: 'users', column: 'username' }),
    ]),
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
    ]),
    name: schema.string.optional({ trim: true }),
    bio: schema.string.optional({ trim: true }),
    gender: schema.number.optional([
      rules.enum([1, 2]) // 1 - male 2- female

    ]),
    profile_picture: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
  });
}

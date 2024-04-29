// File: app/Validators/FollowsValidator.ts

import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class SearchValidator {
  public schema = schema.create({
    query: schema.string({ trim: true }, [ rules.minLength(1), rules.maxLength(255) ])
  })

  public messages = {
  }
}

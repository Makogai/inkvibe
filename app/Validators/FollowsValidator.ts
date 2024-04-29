// File: app/Validators/FollowsValidator.ts

import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class FollowsValidator {
  public schema = schema.create({
    following_id: schema.number([
      rules.exists({ table: 'users', column: 'id' }), // Ensure the user exists
    ])
  })

  public messages = {
    'following_id.required': 'You must provide a user ID to follow.',
    'following_id.exists': 'The user you are trying to follow does not exist.',
  }
}

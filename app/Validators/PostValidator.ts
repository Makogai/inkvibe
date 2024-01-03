import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PostValidator {
  constructor(protected ctx: HttpContextContract) {}
  public schema = schema.create({
    content: schema.string.optional(),
    media: schema.file({
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'mp4'],
    }),
  })
  public messages: CustomMessages = {}
}

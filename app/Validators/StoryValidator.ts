// File: app/Validators/StoryValidator.ts

import { schema } from '@ioc:Adonis/Core/Validator'

export default class StoryValidator {
  public schema = schema.create({
    media: schema.file({
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'mp4'],
    }),
    mediaType: schema.enum(['image', 'video'] as const),
  })

  public messages = {
    'mediaLink.required': 'Media link is required',
    'mediaLink.url': 'Media link should be a valid URL',
    'mediaType.enum': 'Media type should be either image or video',
  }
}

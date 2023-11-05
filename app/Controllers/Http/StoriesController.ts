// File: app/Controllers/Http/StoriesController.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Story from 'App/Models/Story'
import StoryValidator from 'App/Validators/StoryValidator'
import FileUploadService from 'App/Services/FileUploadService'
import { InkvibeErrors } from 'App/Constants/Errors/InkvibeErrors'

export default class StoriesController {
  public async index({ auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();

      // Fetch all active stories
      const allActiveStories = await Story.query().apply((scopes) => scopes.activeStories()).preload('user');

      // Separate your own stories from the rest
      const myStories = allActiveStories.filter(story => story.userId === user.id);
      const otherStories = allActiveStories.filter(story => story.userId !== user.id);

      // Combine into a single response object
      const result = {
        myStories: myStories,
        allActiveStories: otherStories,
      };

      return response.ok(result);
    } catch (error) {
      console.error(error);
      return response.internalServerError({ message: 'Could not fetch stories' });
    }
  }



  // ... other methods

  public async store({ request, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const data = await request.validate(StoryValidator)

    // Upload file
    const mediaLink = await FileUploadService.uploadFile(data.media, 'stories') ?? ''

    // Create story
    const story = new Story()
    story.userId = user.id
    story.mediaLink = mediaLink
    story.mediaType = data.mediaType
    await story.save()

    return response.created(story)
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const story = await Story.findOrFail(params.id)

    if (story.userId !== user.id) {
      throw {
        code: InkvibeErrors.CAN_ONLY_DELETE_OWN_STORY,
        message: 'You can only delete your own story',
        status: 400
      }
    }

    await story.delete()
    return response.ok({ message: 'Story deleted successfully' })
  }
}

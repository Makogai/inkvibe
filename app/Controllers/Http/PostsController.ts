// File: app/Controllers/Http/PostsController.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from 'App/Models/Post'
import PostValidator from 'App/Validators/PostValidator'
import FileUploadService from 'App/Services/FileUploadService'
import { InkvibeErrors } from 'App/Constants/Errors/InkvibeErrors'

export default class PostsController {
  public async index({ response }: HttpContextContract) {
    try {
      const posts = await Post.query().preload('user');
      return response.ok(posts);
    } catch (error) {
      console.error(error);
      return response.internalServerError({ message: 'Could not fetch posts' });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    // try {
      const user = await auth.authenticate();
      const data = await request.validate(PostValidator);

      // Upload file (if any)
      const mediaLink = data.media ? await FileUploadService.uploadFile(data.media, 'posts') : '';

      // Create post
      const post = await Post.create({
        userId: user.id,
        content: data.content,
        mediaUrl: mediaLink,
      });

      return response.created(post);
    // } catch (error) {
    //   console.error(error);
    //   return response.internalServerError({ message: 'Could not create post' });
    // }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const post = await Post.findOrFail(params.id);
      await post.load('user');
      return response.ok(post);
    } catch (error) {
      console.error(error);
      return response.notFound({ message: 'Post not found' });
    }
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    try {
      const user = await auth.authenticate();
      const post = await Post.findOrFail(params.id);

      if (post.userId !== user.id) {
        throw {
          code: InkvibeErrors.CAN_ONLY_EDIT_OWN_POST,
          message: 'You can only edit your own post',
          status: 403 // Forbidden
        };
      }

      const data = await request.validate(PostValidator);
      post.content = data.content;

      // Handle file upload
      if (data.media) {
        post.mediaUrl = await FileUploadService.uploadFile(data.media, 'posts') ?? post.mediaUrl;
      }

      await post.save();
      return response.ok(post);
    } catch (error) {
      console.error(error);
      return response.internalServerError({ message: 'Could not update post' });
    }
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    try {
      const user = await auth.authenticate();
      const post = await Post.findOrFail(params.id);

      if (post.userId !== user.id) {
        throw {
          code: InkvibeErrors.CAN_ONLY_DELETE_OWN_POST,
          message: 'You can only delete your own post',
          status: 403 // Forbidden
        };
      }

      await post.delete();
      return response.ok({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error(error);
      return response.internalServerError({ message: 'Could not delete post' });
    }
  }

  // ... you can add more methods as needed for additional functionalities
}

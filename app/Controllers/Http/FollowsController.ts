import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import User from 'App/Models/User'
import Follow from 'App/Models/Follow'
import FollowsValidator from 'App/Validators/FollowsValidator'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class FollowsController {

  public async index({ auth }: HttpContextContract) {
    const user = auth.user!
    return Follow.query()
      .where('following_id', user.id)
      .andWhere('accepted', false)
      .preload('follower') // Assuming you have a relation 'follower' in Follow model
  }

  // Return all followers of the authenticated user (followers relationship)
  public async followers({ auth, response }: HttpContextContract) {
    const user = auth.user!;
    await user.load('followers', (query) => {
      query.where('accepted', true).preload('follower', (userQuery) => {
        userQuery.select(['id', 'username', 'email', 'profilePicture']);
      });
    });

    return response.ok({
      followers: user.followers.map(follow => follow.follower.serialize())
    });
  }

  // Method to fetch followings
  public async followings({ auth, response }: HttpContextContract) {
    const user = auth.user!;
    await user.load('followings', (query) => {
      query.where('accepted', true).preload('following', (userQuery) => {
        userQuery.select(['id', 'username', 'email', 'profilePicture']);
      });
    });

    return response.ok({
      followings: user.followings.map(follow => follow.following.serialize())
    });
  }

  public async sendRequest({ auth, request }: HttpContextContract) {
    const data = await request.validate(FollowsValidator)
    // const userToFollowId = request.input('user_id')
    const user = auth.user!
    await Follow.create({
      follower_id: user.id,
      following_id: data.following_id,
      accepted: false,
    })

    // Return success message
    return {
      message: 'Follow request sent successfully.'
    }
  }

  public async acceptRequest({ auth, request }: HttpContextContract) {
    const requestId = request.input('request_id')
    const followRequest = await Follow.findOrFail(requestId)
    if (followRequest.following_id === auth.user!.id) {
      followRequest.accepted = true
      await followRequest.save()
    }
    return {
      message: 'Follow request accepted successfully.'
    }
  }

  public async declineRequest({ auth, request }: HttpContextContract) {
    const requestId = request.input('request_id')
    const followRequest = await Follow.findOrFail(requestId)
    if (followRequest.following_id === auth.user!.id) {
      await followRequest.delete()
    }
    return {
      message: 'Follow request declined successfully.'
    }
  }

  public async unfollow({ auth, request, response }: HttpContextContract) {
    const user = auth.user!

    // Inline validation for user_id
    const userIdSchema = schema.create({
      user_id: schema.number([rules.exists({ table: 'users', column: 'id' })])
    })

    const { user_id: userToUnfollowId } = await request.validate({
      schema: userIdSchema,
      messages: {
        'user_id.required': 'The user_id field is required.',
        'user_id.exists': 'The user you are trying to unfollow does not exist.',
      }
    })

    // Check if the user is followed by our user
    const follow = await Follow.query()
      .where('follower_id', user.id)
      .andWhere('following_id', userToUnfollowId)
      .first()

    if (!follow) {
      return response.badRequest({ message: 'You are not following this user.' })
    }

    await follow.delete()

    return response.ok({ message: 'Unfollowed successfully.' })
  }

  public async removeFollower({ auth, request, response }: HttpContextContract) {
    const user = auth.user!

    // Inline validation for user_id
    const userIdSchema = schema.create({
      user_id: schema.number([rules.exists({ table: 'users', column: 'id' })])
    })

    const { user_id: followerId } = await request.validate({
      schema: userIdSchema,
      messages: {
        'user_id.required': 'The user_id field is required.',
        'user_id.exists': 'The user you are trying to remove does not exist.',
      }
    })

    // Check if the user is followed by the authenticated user
    const follow = await Follow.query()
      .where('follower_id', followerId)
      .andWhere('following_id', user.id)
      .first()

    if (!follow) {
      return response.badRequest({ message: 'This user is not following you.' })
    }

    await follow.delete()

    return response.ok({ message: 'Removed follower successfully.' })
  }
}

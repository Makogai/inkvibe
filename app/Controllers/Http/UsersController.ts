// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import SearchValidator from 'App/Validators/SearchValidator'
import Follow from 'App/Models/Follow'

export default class UsersController {

  public async search({ request }: HttpContextContract) {
    const data = await request.validate(SearchValidator)
    // console.log(query)
    return User.query()
      .where('username', 'LIKE', `%${data.query}%`)
      .orWhere('name', 'LIKE', `%${data.query}%`)
  }

  public async show({ params, auth }: HttpContextContract) {
    const profileUserId = params.id
    const loggedInUserId = auth.user?.id // Assumes you have access to the authenticated user

    if (!profileUserId) {
      return {
        message: 'User ID is required',
      }
    }

    const user = await User.find(profileUserId)

    if (!user) {
      return {
        message: 'User not found',
      }
    }

    const followersCount = await user.followersCount;
    const followingsCount = await user.followingsCount;

    // Serialize the user object
    const userData = user.serialize({
      fields: {
        omit: ['password'],
        // pick: ['id', 'username', 'email', 'profilePicture', 'bio', 'name', 'gender']
      }
    });

    // Include counts in the response
    userData['followersCount'] = followersCount;
    userData['followingsCount'] = followingsCount;

    let statusMe = 'NO_FOLLOWING'
    let statusThem = 'NO_FOLLOWING'

    if (loggedInUserId) {
      // Check if the logged-in user is following the profile user
      const amIFollowing = await Follow.query()
        .where('follower_id', loggedInUserId)
        .andWhere('following_id', profileUserId)
        .first()

      // Check if the profile user is following the logged-in user
      const isFollowingMe = await Follow.query()
        .where('following_id', loggedInUserId)
        .andWhere('follower_id', profileUserId)
        .first()

      if (amIFollowing) {
        statusMe = amIFollowing.accepted ? 'FOLLOWING' : 'PENDING'
      }

      if (isFollowingMe) {
        statusThem = isFollowingMe.accepted ? 'FOLLOWING' : 'PENDING'
      }

    }

    return {
      user: userData,
      followStatus: {
        statusMe: statusMe,
        statusThem: statusThem,
      },
    }
  }


}

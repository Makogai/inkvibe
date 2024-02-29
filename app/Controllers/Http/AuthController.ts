import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import UserValidator from 'App/Validators/UserValidator'
import { InkvibeErrors } from 'App/Constants/Errors/InkvibeErrors'
import FileUploadService from 'App/Services/FileUploadService'

interface UserData {
  username: string;
  email: string;
  password: string;
  profile_picture: string | null;
  // ... any other fields
}
// You can place this in the same file or in a separate file and import it.
interface ValidatedUpdateData {
  username?: string;
  email?: string;
  profile_picture?: string | null;  // Now it can be string or null
  bio?: string;
  name?: string;
  gender?: number;
}

export default class AuthController {
  public async register({ request, response, auth }: HttpContextContract) {
    const validatedData = await request.validate({
      schema: UserValidator.createSchema,
      messages: {
        'username.unique': 'Username already exists',
        'email.unique': 'Email already exists',
        'password.minLength': 'Password must be at least 8 characters long',
        // Add validation messages for bio, gender, and name if necessary
      }
    });

    const avatar = validatedData['profile_picture'];

    // Prepare the data including bio, gender, and name
    const data: UserData = {
      ...validatedData,
      profile_picture: null // Initialize with null, will be updated below if avatar exists
    };

    if (avatar) {
      data.profile_picture = await FileUploadService.uploadFile(avatar, 'images');
    }

    // Create the user with all fields
    const user = await User.create(data);

    // Authenticate the user immediately after registration
    const token = await auth.use('api').generate(user);

    // Optional: If you need to return related models like stories, preload them here
    // await user.load('stories');

    // Return the complete user object and token
    return response.created({
      token: {
        type: token.type,
        token: token.token,
      },
      user: user.serialize({
        fields: {
          omit: ['password'] // Ensure password is not included in the response
        }
      })
    });
  }


  public async login({request, response, auth}: HttpContextContract){
    const userSchema = schema.create({
      uid: schema.string({trim: true}, []),
      password: schema.string({}, [rules.minLength(8)])
    })

    const data = await request.validate({schema: userSchema})

    try {
      // Attempt to authenticate the user
      await auth.attempt(data.uid, data.password);

      // Now fetch the user with additional fields
      // Assuming `uid` can be either username or email, adjust your query accordingly
      const user = await User.query()
        .where('email', data.uid)
        .orWhere('username', data.uid)
        .preload('stories') // if you also want to load related stories
        .firstOrFail();
      const token = await auth.use('api').generate(user);

      // Return user object with token and additional fields
      return response.ok({
        token: token,
        user: user.toJSON() // This will include the additional fields
      });
    } catch (error) {
      throw {
        code: InkvibeErrors.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
        status: 400
      }
    }
  }


  public async me({auth, response}: HttpContextContract){
    const user = await auth.authenticate()
    return response.ok(user)
  }

  // Update user profile
  public async update({ request, response, auth }: HttpContextContract) {
    const user = await auth.authenticate();

    const validatedData = await request.validate({ schema: UserValidator.updateSchema });
    const avatar = validatedData['profile_picture'];

    // Create a new object to hold the data to be merged
    const updateData: ValidatedUpdateData = {};

    if (avatar) {
      updateData.profile_picture = await FileUploadService.uploadFile(avatar, 'images');
    }

    // If username or email is provided, add them to updateData
    if (validatedData.username) updateData.username = validatedData.username;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.bio) updateData.bio = validatedData.bio;
    if (validatedData.gender) updateData.gender = validatedData.gender

    user.merge(updateData);
    await user.save();

    return response.ok(user);
  }

}

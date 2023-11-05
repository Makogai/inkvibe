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
  // ... any other fields
}

export default class AuthController {
  public async register({request, response, auth}: HttpContextContract){
    const validatedData = await request.validate({schema: UserValidator.createSchema, messages: {
      'username.unique': 'Username already exists',
      'email.unique': 'Email already exists',
      'password.minLength': 'Password must be at least 8 characters long',
      }});
    const avatar = validatedData['profile_picture'];

    const data: UserData = {
      ...validatedData,
      profile_picture: null  // Initialize with null, will be updated below if avatar exists
    };

    if (avatar) {
      data.profile_picture = await FileUploadService.uploadFile(avatar, 'images');
    }

    const user = await User.create(data);

    const token = await auth.attempt(data.email, data.password);

    // Return user object and token
    return response.created({token: token, user})
  }

  public async login({request, response, auth}: HttpContextContract){
    const userSchema = schema.create({
      uid: schema.string({trim: true}, []),
      password: schema.string({}, [rules.minLength(8)])
    })

    const data = await request.validate({schema: userSchema})

    let token = null;

    try {
      token = await auth.attempt(data.uid, data.password);
    }catch (error){
      throw {
        code: InkvibeErrors.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
        status: 400
      }
    }


    // Return user object and token
    // @ts-ignore
    return response.ok({token: token, user: token.user})
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

    user.merge(updateData);
    await user.save();

    return response.ok(user);
  }

}

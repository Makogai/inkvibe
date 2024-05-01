import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import UserValidator from 'App/Validators/UserValidator'
import { InkvibeErrors } from 'App/Constants/Errors/InkvibeErrors'
import FileUploadService from 'App/Services/FileUploadService'
// import FirebaseAdmin
import { logger } from '@poppinss/cliui'
import FirebaseAdmin from '@ioc:Firebase/Admin'

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
    logger.info('this is an info message')
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
    const token = await auth.use('api').generate(user);

    // Generate a Firebase custom token
    const firebaseToken = await FirebaseAdmin.admin.auth().createCustomToken(user.id.toString());

    // Your existing response logic, now including firebaseToken ...
    return response.created({
      token: {
        type: token.type,
        token: token.token,
      },
      firebaseToken, // Add the Firebase token here
      user: user.serialize({
        fields: {
          omit: ['password']
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
      const user = await User.query()
        .where('email', data.uid)
        .orWhere('username', data.uid)
        .firstOrFail();
      const token = await auth.use('api').generate(user);

      // Generate a Firebase custom token
      const firebaseToken = await FirebaseAdmin.admin.auth().createCustomToken(user.id.toString());

      return response.ok({
        token: token,
        firebaseToken, // Include the Firebase token in the response
        user: user.toJSON()
      });
    } catch (error) {
      throw {
        code: InkvibeErrors.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
        status: 400
      }
    }
  }


  // File: app/Controllers/Http/AuthController.ts

  public async me({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate();

    // Manually resolve computed properties
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

    return response.ok(userData);
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

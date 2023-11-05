// File: app/Middleware/ErrorHandler.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import { AuthErrorCodes } from 'App/Constants/Errors/AuthErrors'

export default class ErrorHandler {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    try {
      await next()
    } catch (error) {
      const errorCode = error.code ? error.code : 'E999'  // E999 can be a general unknown error code
      const errorMessage = error.message ? error.message : 'Unknown Error'
      ctx.response.status(error.status || 500).send({
        code: errorCode,
        message: errorMessage,
      })
    }
  }
}

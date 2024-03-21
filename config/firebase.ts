import Env from '@ioc:Adonis/Core/Env'

export const firebaseConfig = {
  projectId: Env.get('FIREBASE_PROJECT_ID'),
  clientEmail: Env.get('FIREBASE_CLIENT_EMAIL'),
  privateKey: Env.get('FIREBASE_PRIVATE_KEY')
}

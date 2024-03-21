// File: app/Services/FirebaseAdmin.ts

import * as admin from 'firebase-admin';
import { logger } from '@poppinss/cliui'

export default class FirebaseAdmin {
  public admin: admin.app.App;
  private serviceAccount = require("Config/inkvibe-firebase.json");

  constructor() {
    logger.info('FIREBASE INIT')
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount as admin.ServiceAccount)
    });
  }
}

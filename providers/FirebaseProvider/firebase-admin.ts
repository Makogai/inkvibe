// File: app/Services/FirebaseAdmin.ts

import * as admin from 'firebase-admin';
import { firebaseConfig } from 'Config/firebase'
import { logger } from '@poppinss/cliui'

export interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}
export default class FirebaseAdmin {
  public admin: admin.app.App;
  protected credentials: ServiceAccount;

  constructor(config: typeof firebaseConfig) {
    logger.log(JSON.stringify(config));
    this.credentials = config;
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(this.credentials as admin.ServiceAccount)
    });
  }
}

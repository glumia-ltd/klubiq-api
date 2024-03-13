import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App;

  constructor(private readonly configService: ConfigService) {
    const serviceAccount = this.configService.get('firebaseConfig');
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

}

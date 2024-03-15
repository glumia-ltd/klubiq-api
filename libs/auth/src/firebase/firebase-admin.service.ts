import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseAdminService {
  
  constructor() {
    // const serviceAccount = this.configService.get('firebaseConfig');
    // this.app = admin.initializeApp({
    //   credential: admin.credential.cert(serviceAccount),
    // });
  }

  

}

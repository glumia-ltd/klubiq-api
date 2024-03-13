import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule, ConfigModule } from '@app/common';
import { ConfigService } from '@nestjs/config';
// import * as admin from 'firebase-admin/app';
import { initializeApp } from 'firebase/app';

// const firebaseAdminProvider = {
// 	provide: 'FIREBASE_ADMIN',
// 	inject: [ConfigService],
// 	useFactory: (config: ConfigService) => {
// 		const firebaseConfig = JSON.parse(config.get<string>('FIREBASE_SDK_CONFIG')) as admin.ServiceAccount;
// 		return admin.initializeApp(firebaseConfig);
// 	}
// }

const firebaseAuthProvider = {
	provide: 'FIREBASE_AUTH',
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const firebaseConfig = {
			apiKey: config.get<string>('FIREBASE_API_KEY'),
			authDomain: config.get<string>('FIREBASE_AUTH_DOMAIN'),
			projectId: config.get<string>('FIREBASE_PROJECT_ID'),
			storageBucket: config.get<string>('FIREBASE_STORAGE_BUCKET'),
			messagingSenderId: config.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
			appId: config.get<string>('FIREBASE_APP_ID'),
			measurementId: config.get<string>('FIREBASE_MEASUREMENT_ID'),
		};
		return initializeApp(firebaseConfig);
	},
};

@Module({
	providers: [AuthService, ConfigService, firebaseAuthProvider],
	exports: [AuthService],
	imports: [DatabaseModule, ConfigModule],
})
export class AuthModule {}

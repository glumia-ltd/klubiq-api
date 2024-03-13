import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule, ConfigModule } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import { AuthController } from './auth.controller';

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
	controllers: [AuthController],
})
export class AuthModule {}

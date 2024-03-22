/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule, ConfigModule } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp } from 'firebase/app';
import * as admin from 'firebase-admin';
import { RepositoriesModule } from '@app/common';
import { OrganizationModule } from 'apps/klubiq-dashboard/src/organization/organization.module';
import { OrgUserProfile } from './profiles/org-user-profile';

const _firebaseConfig = require('../../../config.json');
const apps = admin.apps;
console.log('Apps count: ', apps.length);
interface FirebaseConfig {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
}
const firebaseAdminConfig = _firebaseConfig as unknown as FirebaseConfig;

const firebase_params = {
	type: firebaseAdminConfig.type,
	projectId: firebaseAdminConfig.project_id,
	privateKeyId: firebaseAdminConfig.private_key_id,
	privateKey: firebaseAdminConfig.private_key,
	clientEmail: firebaseAdminConfig.client_email,
	clientId: firebaseAdminConfig.client_id,
	authUri: firebaseAdminConfig.auth_uri,
	tokenUri: firebaseAdminConfig.token_uri,
	authProviderX509CertUrl: firebaseAdminConfig.auth_provider_x509_cert_url,
	clientC509CertUrl: firebaseAdminConfig.client_x509_cert_url,
};

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

const firebaseAdminProvider = {
	provide: 'FIREBASE_ADMIN',
	useFactory: () => {
		if (apps.length) {
			return apps[0];
		}
		return admin.initializeApp({
			credential: admin.credential.cert(firebase_params),
		});
	},
};

@Module({
	providers: [
		AuthService,
		ConfigService,
		firebaseAuthProvider,
		firebaseAdminProvider,
		OrgUserProfile,
	],
	exports: [AuthService],
	imports: [
		DatabaseModule,
		ConfigModule,
		OrganizationModule,
		RepositoriesModule,
	],
})
export class AuthModule {}

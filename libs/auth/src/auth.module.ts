/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule, ConfigModule } from '@app/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { RepositoriesModule } from '@app/common';
import { OrganizationRepository } from '../../../apps/klubiq-dashboard/src/organization/organization.repository';
import { OrgUserProfile } from './profiles/org-user-profile';
import { FirebaseErrorMessageHelper } from './helpers/firebase-error-helper';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { CacheService } from '@app/common/services/cache.service';

const _firebaseConfig = require('../../../config.json');
const apps = admin.apps;

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
const firebaseAdminConfig = _firebaseConfig as FirebaseConfig;

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

const firebaseAdminProvider = {
	provide: 'FIREBASE_ADMIN',
	useFactory: () => {
		if (!apps.length) {
			return admin.initializeApp({
				credential: admin.credential.cert(firebase_params),
			});
		}
	},
};

@Module({
	providers: [
		AuthService,
		ConfigService,
		firebaseAdminProvider,
		OrgUserProfile,
		FirebaseErrorMessageHelper,
		JwtService,
		OrganizationRepository,
		{
			provide: CacheService,
			useFactory: () => new CacheService(null, 60 * 60 * 24),
		},
	],
	exports: [AuthService],
	imports: [DatabaseModule, ConfigModule, RepositoriesModule, HttpModule],
	controllers: [AuthController],
})
export class AuthModule {}

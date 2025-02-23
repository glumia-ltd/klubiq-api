/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { OrganizationRepository } from '../../../apps/klubiq-dashboard/src/organization/repositories/organization.repository';
import { OrgUserProfile } from './profiles/org-user-profile';
import { FirebaseErrorMessageHelper } from './helpers/firebase-error-helper';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { LandlordAuthService } from './services/landlord-auth.service';
import _firebaseConfig from '../../../config.json';
import { AdminAuthService } from './services/admin-auth.service';
import { SubscriptionModule } from '@app/common/public/subscription/subscription.module';
import { MailerSendService } from '@app/common/email/email.service';
import { OrganizationSettingsService } from '@app/common/services/organization-settings.service';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { UserPreferencesService } from '@app/common/services/user-preferences.service';
import { NotificationsModule } from '@app/notifications/notifications.module';
import { AccessControlService } from './services/access-control.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '@app/common/database/entities/permission.entity';
import { RoleFeaturePermissions } from '@app/common/database/entities/role-feature-permission.entity';
import { Feature, OrganizationUser } from '@app/common';
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
		const apps = admin.apps;
		if (apps.length > 0) {
			return apps[0];
		} else {
			return admin.initializeApp({
				credential: admin.credential.cert(firebase_params),
			});
		}
	},
};

@Module({
	imports: [
		HttpModule,
		SubscriptionModule,
		RepositoriesModule,
		NotificationsModule,
		TypeOrmModule.forFeature([
			Feature,
			Permission,
			OrganizationUser,
			RoleFeaturePermissions,
		]),
	],
	providers: [
		AdminAuthService,
		ConfigService,
		firebaseAdminProvider,
		FirebaseErrorMessageHelper,
		JwtService,
		LandlordAuthService,
		MailerSendService,
		OrgUserProfile,
		OrganizationRepository,
		UserProfilesRepository,
		OrganizationSettingsService,
		UserPreferencesService,
		AccessControlService,
	],
	exports: [LandlordAuthService, AccessControlService],
	controllers: [AuthController],
})
export class AuthModule {}

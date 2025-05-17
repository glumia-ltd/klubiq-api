/* eslint-disable @typescript-eslint/no-var-requires */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { OrganizationSettingsService } from '@app/common/services/organization-settings.service';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { UserPreferencesService } from '@app/common/services/user-preferences.service';
import { NotificationsModule } from '@app/notifications/notifications.module';
import { AccessControlService } from './services/access-control.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '@app/common/database/entities/permission.entity';
import { RoleFeaturePermissions } from '@app/common/database/entities/role-feature-permission.entity';
import { Feature, FileUploadService, OrganizationUser } from '@app/common';
import { AuthMiddleware } from './auth.middleware';
import { LeaseService } from 'apps/klubiq-dashboard/src/lease/services/lease.service';
import { LeaseRepository } from 'apps/klubiq-dashboard/src/lease/repositories/lease.repository';
import { LeaseTenantRepository } from '@app/common/repositories/leases-tenant.repositiory';
import { ZohoEmailService } from '@app/common/email/zoho-email.service';
import { RolesService } from '@app/common/permissions/roles.service';
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
const appCheckRoutes = ['auth/signin', 'auth/landlord/signup'];
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
		const { apps } = admin;
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
		ConfigModule,
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
		ZohoEmailService,
		OrgUserProfile,
		OrganizationRepository,
		UserProfilesRepository,
		OrganizationSettingsService,
		LeaseRepository,
		LeaseTenantRepository,
		UserPreferencesService,
		AccessControlService,
		LeaseService,
		FileUploadService,
		// Generators,
		RolesService,
	],
	exports: [LandlordAuthService, AccessControlService],
	controllers: [AuthController],
})
export class AuthModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes(...appCheckRoutes);
	}
}

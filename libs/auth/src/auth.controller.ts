import {
	Controller,
	Post,
	Body,
	HttpStatus,
	HttpCode,
	Get,
	Query,
	Param,
	ParseUUIDPipe,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiExcludeEndpoint,
	ApiHeader,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { Auth } from './decorators/auth.decorator';
import {
	InviteUserDto,
	OrgUserSignUpDto,
	RefreshTokenExchangeDto,
	ResetPasswordDto,
	ResetPasswordLinkDto,
	SendVerifyEmailDto,
	VerifyEmailDto,
	UserLoginDto,
	TenantSignUpDto,
} from './dto/requests/user-login.dto';
import { AuthType } from './types/firebase.types';
import { LandlordAuthService } from './services/landlord-auth.service';
import { AdminAuthService } from './services/admin-auth.service';
import { CreateSuperAdminDTO } from './dto/requests/admin-user.dto';
import { OrganizationSettingsService } from '@app/common/services/organization-settings.service';
import { OrganizationSubscriptionService } from '@app/common';

@ApiTags('auth')
@ApiBearerAuth()
@ApiSecurity('ApiKey')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
	constructor(
		private readonly landlordAuthService: LandlordAuthService,
		private readonly adminAuthService: AdminAuthService,
		private readonly organizationSettingsService: OrganizationSettingsService,
		private readonly organizationSubscriptionService: OrganizationSubscriptionService,
	) {}

	@HttpCode(HttpStatus.OK)
	@Post('verify-email')
	@ApiOkResponse({
		description: 'Verifies user email',
	})
	async verifyEmail(@Body() data: VerifyEmailDto): Promise<any> {
		try {
			return await this.landlordAuthService.verifyEmail(data.oobCode);
		} catch (err) {
			throw err;
		}
	}

	@Auth(AuthType.Bearer)
	@Get('user')
	@ApiOkResponse({
		description: 'Gets user data',
	})
	async user(): Promise<any> {
		try {
			return this.landlordAuthService.getOrgUserInfo();
		} catch (err) {
			throw err;
		}
	}

	@Post('signin')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description:
			'Signs in user with email and password, and returns access token',
		type: String,
	})
	@ApiHeader({
		name: 'X-client-id',
		description: 'The client id',
		required: false,
	})
	async signIn(@Body() credentials: UserLoginDto): Promise<string> {
		return this.landlordAuthService.signInAndGetAccessToken(
			credentials.email,
			credentials.password,
		);
	}

	@Auth(AuthType.Bearer)
	@Post('signout')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Signs out user',
	})
	async signOut(): Promise<void> {
		await this.landlordAuthService.signOut();
	}

	@Auth(AuthType.Bearer)
	@Get('org/:orgId/settings')
	@ApiOkResponse({
		description: 'Gets user org settings',
	})
	async getOrgSettings(
		@Param('orgId', ParseUUIDPipe) orgId: string,
	): Promise<any> {
		try {
			return this.organizationSettingsService.getOrganizationSettings(orgId);
		} catch (err) {
			throw err;
		}
	}

	@Auth(AuthType.Bearer)
	@Get('org/:orgId/subscription')
	@ApiOkResponse({
		description: 'Gets user org subscription',
	})
	async getOrgSubscription(
		@Param('orgId', ParseUUIDPipe) orgId: string,
	): Promise<any> {
		try {
			return this.organizationSubscriptionService.getSubscription(orgId);
		} catch (err) {
			throw err;
		}
	}

	@Auth(AuthType.Bearer)
	@Get('verify-token')
	async verifyToken(): Promise<any> {
		try {
			return this.landlordAuthService.verifyToken();
		} catch (err) {
			throw err;
		}
	}

	@HttpCode(HttpStatus.OK)
	@Post('reset-password')
	@ApiOkResponse()
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
	): Promise<any> {
		try {
			return this.landlordAuthService.resetPassword(resetPasswordDto);
		} catch (err) {
			throw err;
		}
	}

	@Post('landlord/signup')
	@ApiOkResponse({
		description: 'Creates a new Org user and returns the data an auth token',
	})
	async createLandlordUser(@Body() createUser: OrgUserSignUpDto) {
		return await this.landlordAuthService.createOrgOwner(createUser);
	}

	@Auth(AuthType.ApiKey)
	@Post('admin/signup')
	@ApiOkResponse({
		description: 'Creates a new super Admin user',
	})
	async createAdmin(@Body() createUser: CreateSuperAdminDTO) {
		return await this.adminAuthService.createDomainSuperAdmin(createUser);
	}

	@Auth(AuthType.Bearer)
	@HttpCode(HttpStatus.OK)
	@Post('landlord/invite')
	@ApiOkResponse({
		description: 'invites a new Org user',
	})
	async inviteUser(@Body() invitedUser: InviteUserDto) {
		return await this.landlordAuthService.inviteUser(invitedUser);
	}

	@HttpCode(HttpStatus.OK)
	@Post('email-verification-link')
	@ApiOkResponse({
		description: 'Send email verification link to user',
	})
	async sendEmailVerification(@Body() reqBody: SendVerifyEmailDto) {
		await this.landlordAuthService.sendVerificationEmail(
			reqBody.email,
			reqBody.firstName,
			reqBody.lastName,
		);
	}

	@HttpCode(HttpStatus.OK)
	@Post('reset-password-link')
	@ApiOkResponse({
		description: 'Send email password reset link to user',
	})
	async sendPasswordResetLinkEmail(@Body() request: ResetPasswordLinkDto) {
		await this.landlordAuthService.generatePasswordResetEmail(request.email);
	}

	@HttpCode(HttpStatus.OK)
	@Post('exchange-refresh-token')
	@ApiOkResponse()
	async exchangeRefreshToken(@Body() request: RefreshTokenExchangeDto) {
		return await this.landlordAuthService.exchangeRefreshToken(
			request.refreshToken,
		);
	}

	@HttpCode(HttpStatus.OK)
	@Post('accept-invitation')
	@ApiOkResponse()
	async acceptInvitation(
		@Query('token') token: string,
		@Body() resetPasswordDto: ResetPasswordDto,
	) {
		return await this.landlordAuthService.acceptInvitation(
			resetPasswordDto,
			token,
		);
	}

	@Auth(AuthType.Bearer)
	@Post('update-preferences')
	@ApiOkResponse()
	async updateUserPreferences(@Body() preferences: Record<string, any>) {
		return await this.landlordAuthService.updateUserPreferences(preferences);
	}

	@Auth(AuthType.ApiKey)
	@HttpCode(HttpStatus.OK)
	@ApiExcludeEndpoint()
	@Post('update-config')
	@ApiOkResponse()
	async updateFBAppConfig() {
		return await this.landlordAuthService.enableTOTPMFA();
	}

	@Auth(AuthType.Bearer)
	@Post('onboard-tenant')
	@ApiOkResponse({
		description: 'Onboards a new tenant account for a lease',
	})
	async onboardTenantUser(@Body() createUser: TenantSignUpDto) {
		return await this.landlordAuthService.createTenant(createUser);
	}
}

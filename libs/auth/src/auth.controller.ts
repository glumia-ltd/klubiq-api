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
	ForbiddenException,
	Req,
	Res,
	UnauthorizedException,
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
import { ErrorMessages, OrganizationSubscriptionService } from '@app/common';
import { RolesService } from '@app/common/permissions/roles.service';
import { UserRoles } from '@app/common/config/config.constants';
import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
import {
	MFAResponseDto,
	TokenResponseDto,
	VerifyMfaOtpDto,
} from './dto/responses/auth-response.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
	cookieConfig,
	extractMfaEnrollmentId,
	extractMfaPendingCredential,
	extractRefreshToken,
} from './helpers/cookie-helper';
@ApiTags('auth')
@ApiBearerAuth()
@ApiSecurity('ApiKey')
@Auth(AuthType.None)
@Controller('auth')
@ApiHeader({
	name: 'X-client-id',
	description: 'The client id',
	required: false,
})
export class AuthController {
	constructor(
		private readonly landlordAuthService: LandlordAuthService,
		private readonly adminAuthService: AdminAuthService,
		private readonly organizationSettingsService: OrganizationSettingsService,
		private readonly organizationSubscriptionService: OrganizationSubscriptionService,
		private readonly rolesService: RolesService,
		private readonly configService: ConfigService,
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

	@Post('mfa/verify-otp')
	@ApiOkResponse({
		description: 'Verifies MFA OTP',
	})
	async verifyMfaOtp(
		@Body() data: VerifyMfaOtpDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<any> {
		const mfaPendingCredential = extractMfaPendingCredential(req);
		const mfaEnrollmentId = extractMfaEnrollmentId(req);
		if (!mfaPendingCredential || !mfaEnrollmentId) {
			throw new UnauthorizedException(
				'MFA pending credential or enrollment id not found. Please sign in again.',
			);
		}
		const response = await this.landlordAuthService.verifyMfaOtp(
			mfaPendingCredential,
			data.otp,
			mfaEnrollmentId,
		);
		if (response.idToken && response.refreshToken) {
			const tokenData: TokenResponseDto = {
				access_token: response.idToken,
				refresh_token: response.refreshToken,
			};
			this.setLoginCookie(res, tokenData);
			return this.isNotApiCall(req)
				? { message: 'MFA OTP verified successfully' }
				: tokenData;
		}
		throw new UnauthorizedException(
			'MFA OTP verification failed. Please try again.',
		);
	}

	@Auth(AuthType.Bearer)
	@Get('landlord/user')
	@ApiOkResponse({
		description: 'Gets user data',
	})
	async user(): Promise<any> {
		try {
			const userData = await this.landlordAuthService.getOrgUserInfo();
			if (userData && userData.organizationUuid) {
				const orgSettings =
					(await this.organizationSettingsService.getOrganizationSettings(
						userData.organizationUuid,
					)) || null;
				const orgSubscription =
					(await this.organizationSubscriptionService.getSubscription(
						userData.organizationUuid,
					)) || null;
				userData['orgSettings'] = orgSettings;
				userData['orgSubscription'] = orgSubscription;
			}
			return userData;
		} catch (err) {
			throw err;
		}
	}

	@Auth(AuthType.Bearer)
	@Get('tenant/user')
	@ApiOkResponse({
		description: 'Gets tenant user data',
	})
	async tenantUser(): Promise<any> {
		try {
			return this.landlordAuthService.getTenantUserInfo();
		} catch (err) {
			throw err;
		}
	}

	@Post('signin')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Signs in user with email and password, and returns user data',
	})
	async signIn(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() credentials: UserLoginDto,
	): Promise<TokenResponseDto> {
		const tokenData = await this.landlordAuthService.signInAndGetAccessToken(
			credentials.email,
			credentials.password,
		);
		if (tokenData.message && tokenData.message === ErrorMessages.MFA_REQUIRED) {
			this.setMFARequiredCookie(res, tokenData);
			if (this.isNotApiCall(req)) {
				delete tokenData.mfaPendingCredential;
				delete tokenData.mfaEnrollmentId;
			}
			return tokenData;
		}
		if (this.isNotApiCall(req)) {
			this.setLoginCookie(res, tokenData);
			return { expires_in: tokenData.expires_in };
		} else {
			return tokenData;
		}
	}

	private setMFARequiredCookie(res: Response, tokenData: MFAResponseDto): void {
		const { mfaPendingCredential, mfaEnrollmentId } = tokenData;
		res.cookie(
			cookieConfig.mfaPendingCredential.name,
			mfaPendingCredential,
			cookieConfig.mfaPendingCredential.options,
		);
		res.cookie(
			cookieConfig.mfaEnrollmentId.name,
			mfaEnrollmentId,
			cookieConfig.mfaEnrollmentId.options,
		);
	}

	private isNotApiCall(req: Request): boolean {
		const clientId = req.header('x-client-id');
		const nonApiClientIds = [
			this.configService.get<string>('LANDLORP_PORTAL_CLIENT_ID'),
			this.configService.get<string>('TENANT_PORTAL_CLIENT_ID'),
			this.configService.get<string>('ADMIN_PORTAL_CLIENT_ID'),
		];
		return nonApiClientIds.includes(clientId);
	}
	private setLoginCookie(res: Response, tokenData: TokenResponseDto): void {
		const { refresh_token, access_token } = tokenData;
		res.cookie(
			cookieConfig.refreshToken.name,
			refresh_token,
			cookieConfig.refreshToken.options,
		);
		res.cookie(
			cookieConfig.accessToken.name,
			access_token,
			cookieConfig.accessToken.options,
		);
	}
	private clearLoginCookie(res: Response): void {
		res.clearCookie(
			cookieConfig.refreshToken.name,
			cookieConfig.refreshToken.options,
		);
		res.clearCookie(
			cookieConfig.accessToken.name,
			cookieConfig.accessToken.options,
		);
	}

	@Auth(AuthType.Bearer)
	@Post('signout')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Signs out user',
	})
	async signOut(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		await this.landlordAuthService.signOut();
		if (this.isNotApiCall(req)) {
			this.clearLoginCookie(res);
		}
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
	@ApiOkResponse({
		description: 'Verifies user token',
	})
	async verifyToken(@Req() req: Request): Promise<any> {
		try {
			return this.landlordAuthService.verifyToken(req);
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
	async exchangeRefreshToken(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
		@Body() request?: RefreshTokenExchangeDto,
	): Promise<TokenResponseDto> {
		if (!request.refreshToken) {
			const refreshToken = extractRefreshToken(req);
			if (!refreshToken) {
				throw new UnauthorizedException('Refresh token not found');
			}
			request.refreshToken = refreshToken;
		}
		const tokenData = await this.landlordAuthService.exchangeRefreshToken(
			request.refreshToken,
		);
		if (this.isNotApiCall(req)) {
			this.setLoginCookie(res, tokenData);
			return;
		} else {
			return tokenData;
		}
	}

	@HttpCode(HttpStatus.OK)
	@Post('accept-invitation')
	@ApiOkResponse()
	async acceptInvitation(
		@Query('token') token: string,
		@Body() resetPasswordDto: ResetPasswordDto,
	) {
		return await this.landlordAuthService.acceptLandlordInvitation(
			resetPasswordDto,
			token,
		);
	}

	@HttpCode(HttpStatus.OK)
	@Post('accept-tenant-invitation')
	@ApiOkResponse()
	async acceptTenantInvitation(
		@Query('token') token: string,
		@Body() resetPasswordDto: ResetPasswordDto,
	) {
		return await this.landlordAuthService.acceptTenantInvitation(
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
		const tenantRole = await this.rolesService.getRoleByName(UserRoles.TENANT);
		if (!tenantRole) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		createUser.role = {
			id: tenantRole.id,
			name: tenantRole.name,
		};
		return await this.landlordAuthService.onboardTenant(createUser);
	}
	@Auth(AuthType.Bearer)
	@Post('create-tenant')
	@ApiOkResponse({
		description: 'Creates a new tenant account without a lease',
	})
	async createTenant(@Body() createUser: CreateTenantDto) {
		const tenantRole = await this.rolesService.getRoleByName(UserRoles.TENANT);
		if (!tenantRole) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		createUser.role = {
			id: tenantRole.id,
			name: tenantRole.name,
		};
		return await this.landlordAuthService.createTenant(createUser);
	}
}

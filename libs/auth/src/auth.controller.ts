import {
	Controller,
	Post,
	Body,
	HttpStatus,
	HttpCode,
	Get,
	Query,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { Auth, Roles } from './decorators/auth.decorator';
import {
	InviteUserDto,
	OrgUserSignUpDto,
	RefreshTokenExchangeDto,
	ResetPasswordDto,
	ResetPasswordLinkDto,
	SendVerifyEmailDto,
	VerifyEmailDto,
} from './dto/requests/user-login.dto';
import { AuthType } from './types/firebase.types';
import { UserRoles } from '@app/common';
import { LandlordAuthService } from './services/landlord-auth.service';
import { AdminAuthService } from './services/admin-auth.service';
import { CreateSuperAdminDTO } from './dto/requests/admin-user.dto';

@ApiTags('auth')
@ApiBearerAuth()
@ApiSecurity('ApiKey')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
	constructor(
		private readonly landlordAuthService: LandlordAuthService,
		private readonly adminAuthService: AdminAuthService,
	) {}

	@HttpCode(HttpStatus.OK)
	@Post('verify-email')
	@ApiOkResponse({
		description: 'Verifies user email',
	})
	async verifyEmail(@Body() data: VerifyEmailDto): Promise<any> {
		try {
			const response = await this.landlordAuthService.verifyEmail(data.oobCode);
			return response;
		} catch (err) {
			throw err;
		}
	}

	@Auth(AuthType.Bearer)
	@Roles(
		UserRoles.ADMIN,
		UserRoles.STAFF,
		UserRoles.SUPER_ADMIN,
		UserRoles.TENANT,
		UserRoles.LANDLORD,
	)
	@Get('user')
	@ApiOkResponse({
		description: 'Gets user data',
	})
	async user(): Promise<any> {
		try {
			return this.landlordAuthService.getUserInfo();
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
	async createUser(@Body() createUser: OrgUserSignUpDto) {
		const userData = await this.landlordAuthService.createOrgOwner(createUser);
		return userData;
	}
	@Auth(AuthType.ApiKey)
	@Post('admin/signup')
	@ApiOkResponse({
		description: 'Creates a new super Admin user',
	})
	async createAdmin(@Body() createUser: CreateSuperAdminDTO) {
		const userData =
			await this.adminAuthService.createDomainSuperAdmin(createUser);
		return userData;
	}

	@Auth(AuthType.Bearer)
	@Roles(UserRoles.ORG_OWNER)
	@HttpCode(HttpStatus.OK)
	@Post('landlord/invite')
	@ApiOkResponse({
		description: 'invites a new Org user',
	})
	async inviteUser(@Body() invitedUser: InviteUserDto) {
		const result = await this.landlordAuthService.inviteUser(invitedUser);
		return result;
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

	// @Auth(AuthType.ApiKey)
	// @HttpCode(HttpStatus.OK)
	// @Post('upadte-config')
	// @ApiOkResponse()
	// async updateFBAppConfig() {
	// 	return await this.landlordAuthService.enableTOTPMFA();
	// }
}

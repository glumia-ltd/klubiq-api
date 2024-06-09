import {
	Controller,
	Post,
	Body,
	HttpStatus,
	HttpCode,
	Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, Roles } from './decorators/auth.decorator';
import {
	InviteUserDto,
	OrgUserSignUpDto,
	RefreshTokenExchangeDto,
	ResetPasswordDto,
	ResetPasswordLinkDto,
	SendVerifyEmailDto,
	// UpdateFirebaseUserDto,
	// UpdatePasswordDto,
	VerifyEmailDto,
} from './dto/user-login.dto';
import { SignUpResponseDto, TokenResponseDto } from './dto/auth-response.dto';
import { AuthType } from './types/firebase.types';
import { UserRoles } from '@app/common';
import { LandlordAuthService } from './services/landlord-auth.service';

@ApiTags('auth')
@ApiBearerAuth()
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: LandlordAuthService) {}

	@HttpCode(HttpStatus.OK)
	@Post('verify-email')
	@ApiOkResponse({
		description: 'Verifies user email',
	})
	async verifyEmail(@Body() data: VerifyEmailDto): Promise<any> {
		try {
			await this.authService.verifyEmail(data.oobCode);
			return { message: 'Email verification successful!' };
		} catch (err) {
			console.error('Error verifying email:', err);
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
			return this.authService.getUserInfo();
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
			return this.authService.resetPassword(resetPasswordDto);
		} catch (err) {
			console.error('Error updating password:', err);
			throw err;
		}
	}

	@Post('landlord-signup')
	@ApiOkResponse({
		description: 'Creates a new Org user and returns the data an auth token',
		type: SignUpResponseDto,
	})
	async createUser(@Body() createUser: OrgUserSignUpDto) {
		const userData = await this.authService.createOrgOwner(createUser);
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
		const result = await this.authService.inviteUser(invitedUser);
		return result;
	}

	@HttpCode(HttpStatus.OK)
	@Post('email-verification-link')
	@ApiOkResponse({
		description: 'Send email verification link to user',
		type: SignUpResponseDto,
	})
	async sendEmailVerification(@Body() reqBody: SendVerifyEmailDto) {
		await this.authService.sendVerificationEmail(
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
		await this.authService.generatePasswordResetEmail(request.email);
	}

	@HttpCode(HttpStatus.OK)
	@Post('exchange-refresh-token')
	@ApiOkResponse({
		type: TokenResponseDto,
	})
	async exchangeRefreshToken(@Body() request: RefreshTokenExchangeDto) {
		return await this.authService.exchangeRefreshToken(request.refreshToken);
	}
}

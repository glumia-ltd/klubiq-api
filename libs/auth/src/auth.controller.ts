import {
	Controller,
	Post,
	Body,
	HttpStatus,
	Param,
	HttpCode,
	Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth, Roles } from './decorators/auth.decorator';
import { AuthService } from './auth.service';
import {
	OrgUserSignUpDto,
	RefreshTokenExchangeDto,
	ResetPasswordDto,
	SendVerifyEmailDto,
	VerifyEmailDto,
} from './dto/user-login.dto';
import { SignUpResponseDto, TokenResponseDto } from './dto/auth-response.dto';
import { AuthType } from './types/firebase.types';
import { UserRoles } from '@app/common';

@ApiTags('auth')
@ApiBearerAuth()
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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

	@Post('sign-in/google/:authorizationCode')
	@ApiOkResponse({
		description:
			'Exchanges token from google credential to get user access token',
	})
	async googleSignIn(
		@Param('authorizationCode') authorizationCode: string,
	): Promise<any> {
		try {
			return this.authService.exchangeGoogleToken(authorizationCode);
		} catch (err) {
			console.error('Error verifying email:', err);
			throw err;
		}
	}

	@Post('landlord-signup')
	@ApiOkResponse({
		description: 'Creates a new Org user and returns the data an auth token',
		type: SignUpResponseDto,
	})
	async createUser(@Body() createUser: OrgUserSignUpDto) {
		const userData = await this.authService.createOrgUser(createUser);
		return userData;
	}

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

	@Post('reset-password-link')
	@ApiOkResponse({
		description: 'Send email password reset link to user',
	})
	async sendPasswordResetLinkEmail(@Body() request: ResetPasswordDto) {
		await this.authService.generatePasswordResetEmail(request.email);
	}

	@Post('exchange-refresh-token')
	@ApiOkResponse({
		type: TokenResponseDto,
	})
	async exchangeRefreshToken(@Body() request: RefreshTokenExchangeDto) {
		return await this.authService.exchangeRefreshToken(request.refreshToken);
	}
}

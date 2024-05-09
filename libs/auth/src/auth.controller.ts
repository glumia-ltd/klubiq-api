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
	SendVerifyEmailDto,
	userLoginDto,
	VerifyEmailDto,
} from './dto/user-login.dto';
import { SignUpResponseDto } from './dto/auth-response.dto';
import { AuthType } from './types/firebase.types';
import { UserRoles } from '@app/common';

@ApiTags('auth')
@ApiBearerAuth()
@Auth(AuthType.None, AuthType.Bearer)
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

	@HttpCode(HttpStatus.OK)
	@Post('login')
	@ApiOkResponse({
		description: 'User logs in and returns user data and access token',
	})
	async userLogin(@Body() data: userLoginDto): Promise<any> {
		try {
			return this.authService.login(data);
		} catch (err) {
			throw err;
		}
	}

	@Roles(
		UserRoles.ADMIN,
		UserRoles.STAFF,
		UserRoles.SUPER_ADMIN,
		UserRoles.TENANT,
		UserRoles.LANDLORD,
	)
	@Get('user/:fbid')
	@ApiOkResponse({
		description: 'Gets user data',
	})
	async user(@Param('fbid') id: string): Promise<any> {
		try {
			return this.authService.getUserInfo(id);
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

	@Post('verification/email')
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

	@Post('password-reset-link/:email')
	@ApiOkResponse({
		description: 'Send email password reset link to user',
		type: SignUpResponseDto,
	})
	async sendPasswordResetLinkEmail(@Param('email') email: string) {
		await this.authService.generatePasswordResetEmail(email);
	}
}

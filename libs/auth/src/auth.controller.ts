import {
	Controller,
	Post,
	Body,
	//UseGuards,
	HttpException,
	HttpStatus,
	Param,
	HttpCode,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from './decorators/auth.decorator';
import { AuthService } from './auth.service';
import {
	OrgUserSignUpDto,
	SendVerifyEmailDto,
	userLoginDto,
	VerifyEmailDto,
} from './dto/user-login.dto';
import { SignUpResponseDto } from './dto/auth-response.dto';
import { AuthType } from './types/firebase.types';

@ApiTags('auth')
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
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
}

import {
	Controller,
	Post,
	Body,
	//UseGuards,
	HttpException,
	HttpStatus,
	Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { userLoginDto } from './dto/user-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('verify-email')
	@ApiOkResponse({
		description: 'Verifies user email',
	})
	async verifyEmail(@Body() data: { oobCode: string }): Promise<any> {
		try {
			await this.authService.verifyEmail(data.oobCode);
			return { message: 'Email verification successful!' };
		} catch (err) {
			console.error('Error verifying email:', err);
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Post('login')
	@ApiOkResponse({
		description: 'User logs in and returns user data and access token',
	})
	async userLogin(@Body() data: userLoginDto): Promise<any> {
		try {
			return this.authService.login(data);
		} catch (err) {
			console.error('Error verifying email:', err);
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

	@Post('dummy-email')
	async dummyEmail(): Promise<any> {
		try {
			return this.authService.sendDummySmtp();
			//  { message: 'Email verification successful!' };
		} catch (err) {
			console.error('Error verifying email:', err);
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

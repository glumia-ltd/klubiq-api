import {
	Controller,
	Post,
	Body,
	UseGuards,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('verify-email')
	async verifyEmail(@Body() data: { oobCode: string }): Promise<any> {
		try {
			await this.authService.verifyEmail(data.oobCode);
			return { message: 'Email verification successful!' };
		} catch (err) {
			console.error('Error verifying email:', err);
			throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

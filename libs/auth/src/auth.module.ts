import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from '@app/common';

@Module({
	providers: [AuthService],
	exports: [AuthService],
	imports: [DatabaseModule],
})
export class AuthModule {}

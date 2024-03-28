import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';

@Module({
	imports: [TerminusModule, HttpModule],
	providers: [ConfigService],
	controllers: [HealthController],
})
export class HealthModule {}

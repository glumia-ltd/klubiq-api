import { Module } from '@nestjs/common';
import {
	ConfigModule as NestConfigModule,
	ConfigService,
} from '@nestjs/config';
import * as Joi from 'joi';

@Module({
	imports: [
		NestConfigModule.forRoot({
			validationSchema: Joi.object({
				DATABASE_HOST: Joi.string().required(),
				DATABASE_PORT: Joi.number().required(),
				DATABASE_NAME: Joi.string().required(),
				DATABASE_USERNAME: Joi.string().required(),
				DATABASE_PASSWORD: Joi.string().required(),
			}),
		}),
	],
	providers: [ConfigService],
	exports: [ConfigService],
})
export class ConfigModule {}

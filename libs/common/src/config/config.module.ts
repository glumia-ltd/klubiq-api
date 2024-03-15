import { Module } from '@nestjs/common';
import {
	ConfigModule as NestConfigModule,
	ConfigService,
} from '@nestjs/config';
import * as Joi from 'joi';
import { MailerSendService } from '../email/email.service';

@Module({
	imports: [
		NestConfigModule.forRoot({
			validationSchema: Joi.object({
				DATABASE_HOST: Joi.string().required(),
				DATABASE_PORT: Joi.number().required(),
				DATABASE_NAME: Joi.string().required(),
				DATABASE_USERNAME: Joi.string().required(),
				DATABASE_PASSWORD: Joi.string().required(),
				SYNCHRONIZE_DB: Joi.boolean().required(),
				ENV: Joi.string().optional(),
				FIREBASE_API_KEY: Joi.string().required(),
				FIREBASE_PROJECT_ID: Joi.string().required(),
				FIREBASE_AUTH_DOMAIN: Joi.string().required(),
				FIREBASE_STORAGE_BUCKET: Joi.string().required(),
				FIREBASE_APP_ID: Joi.string().required(),
				FIREBASE_MESSAGING_SENDER_ID: Joi.string().required(),
				FIREBASE_MEASUREMENT_ID: Joi.string().required(),
				MAILER_SEND_API_KEY: Joi.string().required(),
				FIREBASE_ADMIN_SDK_PROJECT_ID: Joi.string().required(),
				FIREBASE_ADMIN_SDK_PRIVATE_KEY_ID: Joi.string().required(),
				FIREBASE_ADMIN_SDK_PRIVATE_KEY: Joi.string().required(),
			}),
		}),
	],
	providers: [ConfigService, MailerSendService],
	exports: [ConfigService, MailerSendService],
})
export class ConfigModule {}

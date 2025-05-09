import { ConfigService } from '@nestjs/config';
import DailyRotateFile = require('winston-daily-rotate-file');
import * as winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import { includes } from 'lodash';
import { Request } from 'express';
import { TransformableInfo } from 'logform'; // Add at the top

const devEnvironments = ['local', 'dev', 'development'];
export class CustomLogging {
	dailyRotateFileTransport: any = null;
	myFormat = {} as winston.Logform.Format; // Assign an empty object instead of null
	createLoggerConfig: winston.LoggerOptions = {};
	cloudWatchTransport: WinstonCloudWatch = null;
	private readonly env: string;
	constructor(private readonly configService: ConfigService) {
		this.env = this.configService.get<string>('NODE_ENV');
		const isNotDevEnvironment =
			!!this.env && !includes(devEnvironments, this.env);
		this.dailyRotateFileTransport = new DailyRotateFile({
			filename: 'logs/app_log-%DATE%.log',
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: false,
			maxSize: '20m',
			maxFiles: '7d',
		} as DailyRotateFile.DailyRotateFileTransportOptions);
		this.cloudWatchTransport = new WinstonCloudWatch({
			awsOptions: {
				credentials: {
					accessKeyId: this.configService.get<string>(
						'CLOUDWATCH_ACCESS_KEY_ID',
					),
					secretAccessKey: this.configService.get<string>(
						'CLOUDWATCH_SECRET_ACCESS_KEY',
					),
				},
				region: this.configService.get<string>('CLOUDWATCH_REGION'),
			},
			level: 'error',
			awsRegion: this.configService.get<string>('CLOUDWATCH_REGION'),
			logGroupName: 'Klubiq-API',
			logStreamName: `Klubiq-API-${this.env}-error`,
			jsonMessage: true,
		});
		const customLevels = {
			colors: {
				info: 'green',
				warn: 'yellow',
				error: 'red',
				verbose: 'blue',
			},
		};
		/**
		 * Custom log format tailored to our application's requirements
		 */

		this.myFormat = winston.format.printf((info: TransformableInfo) => {
			const {
				level = 'info',
				message,
				timestamp,
				err,
				req,
				...metadata
			} = info;

			const request = req as Request | undefined;
			const ip =
				request?.headers?.['x-forwarded-for'] || request?.ip || 'unknown';

			const logData: any = {
				timestamp: timestamp || new Date().toISOString(),
				level,
				...metadata,
				message,
				error: {},
				ip,
			};

			if (err) {
				if (err instanceof Error) {
					logData.error = err.stack;
				} else {
					logData.error = err;
				}
			}

			return JSON.stringify(logData);
		});

		this.createLoggerConfig = {
			level: 'warn',
			defaultMeta: {
				service: 'Klubiq-API',
			},
			format: winston.format.combine(
				winston.format.timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.json(),
				winston.format.colorize({
					all: !isNotDevEnvironment,
					colors: customLevels.colors,
				}),
				this.myFormat,
			),
			transports: [
				new winston.transports.Console({ level: 'warn' }),
				new winston.transports.Http({ level: 'error' }),
				isNotDevEnvironment
					? this.cloudWatchTransport
					: this.dailyRotateFileTransport,
			],
			handleExceptions: true,
		};
	}
}

import { ConfigService } from '@nestjs/config';
import DailyRotateFile = require('winston-daily-rotate-file');
import * as winston from 'winston';
import { ClsService, ClsServiceManager } from 'nestjs-cls';
import WinstonCloudWatch from 'winston-cloudwatch';
import { includes } from 'lodash';

const devEnvironments = ['local', 'dev', 'development'];
export class CustomLogging {
	dailyRotateFileTransport: any = null;
	myFormat = {} as winston.Logform.Format; // Assign an empty object instead of null
	createLoggerConfig: winston.LoggerOptions = {};

	private readonly env: string;
	private readonly cls: ClsService;
	constructor(private readonly configService: ConfigService) {
		this.env = this.configService.get<string>('NODE_ENV');
		const isNotDevEnvironment =
			!!this.env && !includes(devEnvironments, this.env);

		this.cls = ClsServiceManager.getClsService();
		/** A transport for winston which logs to a rotating file based on date**/
		this.dailyRotateFileTransport = new DailyRotateFile({
			filename: 'logs/app_log-%DATE%.log',
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: false,
			maxSize: '20m',
			maxFiles: '1d',
		} as DailyRotateFile.DailyRotateFileTransportOptions);

		const customLevels = {
			colors: {
				info: 'green',
				warn: 'yellow',
				error: 'red',
				verbose: 'blue',
			},
		};
		winston.addColors(customLevels.colors);
		/**
		 * Custom log format tailored to our application's requirements
		 */
		this.myFormat = winston.format.printf(
			({ level = 'info', message, timestamp, req, err, ...metadata }) => {
				if (!req) {
					req = { headers: {} };
				}
				let msg = `${timestamp} [${level}]: ${message}`;
				const logData: any = {
					timestamp,
					level,
					...metadata,
					correlationId: this.cls.getId(),
					message,
					error: {},
				};
				if (err) {
					logData.error = err.stack || err;
				}
				msg = JSON.stringify(logData);
				return msg;
			},
		);

		this.createLoggerConfig = {
			level: 'warn',
			defaultMeta: {
				correlationId: this.cls.getId(),
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
					all: true,
				}),
				this.myFormat,
			),
			transports: [
				new winston.transports.Console({ level: 'info' }),
				new winston.transports.Http({ level: 'error' }),
				isNotDevEnvironment
					? new WinstonCloudWatch({
							level: 'error',
							awsAccessKeyId: this.configService.get<string>(
								'CLOUDWATCH_ACCESS_KEY_ID',
							),
							awsSecretKey: this.configService.get<string>(
								'CLOUDWATCH_SECRET_ACCESS_KEY',
							),
							awsRegion: this.configService.get<string>('CLOUDWATCH_REGION'),
							logGroupName: 'Klubiq-API',
							logStreamName: `Klubiq-API-${this.env}-error`,
						})
					: this.dailyRotateFileTransport,
			],
		};
	}
}

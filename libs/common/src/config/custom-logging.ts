import DailyRotateFile = require('winston-daily-rotate-file');
import * as winston from 'winston'

export class CustomLogging {
  dailyRotateFileTransport: any = null;
  myFormat = {} as  winston.Logform.Format; // Assign an empty object instead of null
  createLoggerConfig: winston.LoggerOptions = {};

  constructor() {
    /** A transport for winston which logs to a rotating file based on date**/
    this.dailyRotateFileTransport = new DailyRotateFile({
      filename: 'logs/app_log-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '1d'
    } as DailyRotateFile.DailyRotateFileTransportOptions);

    /**
     * Custom log format tailored to our application's requirements
     */
    this.myFormat = winston.format.printf(
      ({ level = 'info', message, timestamp, req, err, ...metadata }) => {
        if(!req){
          req = {headers: {}};
        }
        let msg = `${timestamp} [${level}]: ${message}`;
        const logData: any = {
          timestamp,
          level,
          ...metadata,
          message,
          error:{},
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
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
        winston.format.colorize(),
        this.myFormat,
      ),
      transports: [
        new winston.transports.Console({level: 'warn'}),
        this.dailyRotateFileTransport,
      ],
    };
  }
}
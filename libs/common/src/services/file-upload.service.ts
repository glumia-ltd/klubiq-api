import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { FileUploadDto } from '../dto/requests/file-upload.dto';

@Injectable()
export class FileUploadService {
	private readonly s3: AWS.S3;
	constructor(private readonly configService: ConfigService) {
		AWS.config.update({
			accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
			secretAccessKey: this.configService.get<string>(
				'AWS_S3_SECRET_ACCESS_KEY',
			),
			region: this.configService.get<string>('AWS_S3_REGION'),
		});
		this.s3 = new AWS.S3();
	}
	async generatePresignedUrl(fileDataDto: FileUploadDto, bucketName: string) {
		const key = `${fileDataDto.organization}/${fileDataDto.fileName}`;
		const params = {
			Bucket: bucketName,
			Key: key,
			Expires: 60 * 5, // 5 minutes
			contentType: fileDataDto.fileType,
		};
		return this.s3.getSignedUrlPromise('putObject', params);
	}
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUploadDto } from '../dto/requests/file-upload.dto';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FileUploadService {
	private readonly s3client: S3Client;
	constructor(private readonly configService: ConfigService) {
		this.s3client = new S3Client({
			credentials: {
				accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
				secretAccessKey: this.configService.get<string>(
					'AWS_S3_SECRET_ACCESS_KEY',
				),
			},
			region: this.configService.get<string>('AWS_S3_REGION'),
		});
	}
	async generatePresignedUrl(fileDataDto: FileUploadDto, bucketName: string) {
		const key = `${fileDataDto.organization}/${uuidv4()}.${fileDataDto.fileType}`;
		console.log('KEY: ', key);
		const command = new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
		});

		console.log('UPLOAD PARAMS: ', command);
		const presignedUrl = getSignedUrl(this.s3client, command, {
			expiresIn: 600,
		});
		return presignedUrl;
	}

	// async createFolderIfNotExist(folderName: string, bucketName: string) {
	//   const params = {
	//     Bucket: bucketName,
	//     Key: folderName
	//   };
	//   return this.s3.headObject(params).promise();
	// }
}

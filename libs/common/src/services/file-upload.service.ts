import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	FileUploadDto,
	PresignedUrlDto,
} from '../dto/requests/file-upload.dto';
// import { v4 as uuidv4 } from 'uuid';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ClsService } from 'nestjs-cls';
import { SharedClsStore } from '../dto/public/shared-clsstore';
import { ActiveUserData } from '@app/auth';
import { v2 as cloudinary } from 'cloudinary';
import { OrganizationSubscriptionService } from './organization-subscription.service';

@Injectable()
export class FileUploadService {
	//private readonly s3client: S3Client;
	private currentUser: ActiveUserData;
	constructor(
		private readonly configService: ConfigService,
		private readonly cls: ClsService<SharedClsStore>,
		private readonly orgSubscriptionService: OrganizationSubscriptionService,
	) {
		// this.s3client = new S3Client({
		// 	credentials: {
		// 		accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
		// 		secretAccessKey: this.configService.get<string>(
		// 			'AWS_S3_SECRET_ACCESS_KEY',
		// 		),
		// 	},
		// 	region: this.configService.get<string>('AWS_S3_REGION'),
		// });
		cloudinary.config({
			cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
			api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
			api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
			secure: true,
		});
	}
	// async generatePresignedUrl(fileDataDto: FileUploadDto, bucketName: string) {
	// 	const key = `${fileDataDto.organization}/${uuidv4()}.${fileDataDto.fileType}`;
	// 	console.log('KEY: ', key);
	// 	const command = new PutObjectCommand({
	// 		Bucket: bucketName,
	// 		Key: key,
	// 	});

	// 	console.log('UPLOAD PARAMS: ', command);
	// 	const presignedUrl = getSignedUrl(this.s3client, command, {
	// 		expiresIn: 600,
	// 	});
	// 	return presignedUrl;
	// }

	async getUploadSignature(
		fileDataDto: FileUploadDto,
	): Promise<PresignedUrlDto> {
		this.currentUser = this.cls.get('currentUser');
		if (this.currentUser.organizationId !== fileDataDto.organizationUuid) {
			throw new Error(
				'You are not authorized to upload files for this organization',
			);
		}
		const storageLimit = (
			await this.orgSubscriptionService.getSubscriptionLimits(
				this.currentUser.organizationId,
			)
		).documentStorageLimit;
		const storageUsed = (
			await this.orgSubscriptionService.getOrganizationAssetCount(
				this.currentUser.organizationId,
			)
		).document_storage_size;
		if (storageUsed >= storageLimit) {
			throw new Error('Storage limit exceeded');
		}
		const signature = cloudinary.utils.api_sign_request(
			{
				timestamp: fileDataDto.timestamp,
				folder: `${fileDataDto.folder}/${fileDataDto.organization}`,
			},
			this.configService.get<string>('CLOUDINARY_API_SECRET'),
		);
		return {
			signature,
			storageLimit,
			storageUsed,
		};
	}
	// async createFolderIfNotExist(folderName: string, bucketName: string) {
	//   const params = {
	//     Bucket: bucketName,
	//     Key: folderName
	//   };
	//   return this.s3.headObject(params).promise();
	// }
}

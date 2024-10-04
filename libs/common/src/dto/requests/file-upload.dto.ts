import { AutoMap } from '@automapper/classes';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsUrl } from 'class-validator';

export class FileUploadDto {
	@AutoMap()
	@IsString()
	folder: string;

	@AutoMap()
	@IsString()
	organization: string;

	@IsString()
	organizationUuid: string;

	@IsNumber()
	timestamp: number;
}
export class PresignedUrlDto {
	@Expose()
	@IsUrl()
	signature: string;

	@Expose()
	storageLimit: number;

	@Expose()
	storageUsed: number;
}

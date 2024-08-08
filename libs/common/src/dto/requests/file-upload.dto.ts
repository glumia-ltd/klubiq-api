import { AutoMap } from '@automapper/classes';
import { IsString } from 'class-validator';

export class FileUploadDto {
	@AutoMap()
	@IsString()
	fileName: string;

	@AutoMap()
	@IsString()
	fileType: string;

	@AutoMap()
	@IsString()
	organization: string;
}

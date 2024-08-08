import { AutoMap } from '@automapper/classes';
import { IsBoolean, IsOptional } from 'class-validator';

export class MetadataDto {
	@AutoMap()
	id?: number;

	@AutoMap()
	@IsOptional()
	displayText?: string;

	@AutoMap()
	@IsOptional()
	name?: string;

	@AutoMap()
	@IsOptional()
	url?: string;

	@AutoMap()
	@IsOptional()
	fileSize?: number;

	@AutoMap()
	@IsBoolean()
	@IsOptional()
	isMain?: boolean;
}

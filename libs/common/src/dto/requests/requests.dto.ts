import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class CreateDto {
	@AutoMap()
	@ApiProperty()
	@IsString()
	name: string;

	@IsBoolean()
	isPrivate: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { AutoMap } from '@automapper/classes';

export class ViewDataDto {
	@AutoMap()
	@ApiProperty()
	@IsNumber()
	id?: number;

	@AutoMap()
	@ApiProperty()
	@IsString()
	name: string;
}

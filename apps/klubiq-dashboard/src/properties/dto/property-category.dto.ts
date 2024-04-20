import { AutoMap } from '@automapper/classes';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyCategoryDto {
	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	name: string;

	@AutoMap()
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	displayText: string;
}

export class UpdatePropertyCategoryDto extends PartialType(
	CreatePropertyCategoryDto,
) {}

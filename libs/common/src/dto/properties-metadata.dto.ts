import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class PropertyMetadataDto {
	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	@ApiProperty()
	displayText: string;
}

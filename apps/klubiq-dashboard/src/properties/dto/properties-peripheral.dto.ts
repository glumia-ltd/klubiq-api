import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../entities/property.entity';
import { AutoMap } from '@automapper/classes';

export class PropertyPeripheralDto {
	@AutoMap()
	@ApiProperty()
	name: string;

	@AutoMap()
	@ApiProperty()
	displayText: string;

	@AutoMap()
	@ApiProperty({ type: () => [Property] })
	properties: Property[];
}

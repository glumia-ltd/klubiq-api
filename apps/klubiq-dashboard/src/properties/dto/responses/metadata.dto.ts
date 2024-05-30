import { AutoMap } from '@automapper/classes';

export class MetadataDto {
	@AutoMap()
	id?: number;

	@AutoMap()
	displayText: string;
}

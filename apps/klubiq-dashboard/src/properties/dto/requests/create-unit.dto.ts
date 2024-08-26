import { UnitStatus } from '@app/common/config/config.constants';
import { IsString, IsNumber, IsJSON, IsOptional } from 'class-validator';

export class CreateUnitDto {
	@IsNumber()
	@IsOptional()
	id?: number;

	@IsString()
	unitNumber: string;

	@IsNumber()
	rentAmount: number;

	@IsNumber()
	floor: number;

	@IsNumber()
	bedrooms: number;

	@IsNumber()
	bathrooms: number;

	@IsNumber()
	toilets: number;

	@IsJSON()
	area: { value: number; unit: string };

	@IsString()
	status: UnitStatus;
}

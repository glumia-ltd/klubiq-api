import { UnitStatus } from '@app/common/config/config.constants';
import {
	IsString,
	IsNumber,
	IsJSON,
	IsOptional,
	IsArray,
	ValidateNested,
} from 'class-validator';
import { PropertyImageDto } from './create-property.dto';
import { Type } from 'class-transformer';

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

	@IsNumber()
	rooms: number;

	@IsNumber()
	offices: number;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => PropertyImageDto)
	images?: PropertyImageDto[];
}

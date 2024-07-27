import { AutoMap } from '@automapper/classes';
import { Property } from '../../entities/property.entity';
import {
	MapperOmitType,
	MapperPickType,
} from '@automapper/classes/mapped-types';
import { MetadataDto } from './metadata.dto';
import { IsOptional } from 'class-validator';

export class PropertyDto extends MapperOmitType(Property, [
	'parentProperty',
	'category',
	'type',
	'purpose',
	'status',
	'images',
	'amenities',
	'units',
]) {
	@AutoMap(() => [MetadataDto])
	@IsOptional()
	images: MetadataDto[];

	@AutoMap(() => [MetadataDto])
	@IsOptional()
	amenities: MetadataDto[];

	@AutoMap()
	@IsOptional()
	tags?: string[];

	@AutoMap()
	@IsOptional()
	createdDate?: Date;

	@AutoMap()
	@IsOptional()
	updatedDate?: Date;

	@AutoMap()
	@IsOptional()
	area?: any;

	@AutoMap(() => MetadataDto)
	purpose: MetadataDto;

	@AutoMap(() => [PropertyUnitDto])
	@IsOptional()
	units?: PropertyUnitDto[];

	@AutoMap(() => MetadataDto)
	category: MetadataDto;

	@AutoMap(() => MetadataDto)
	type: MetadataDto;
}

export class PropertyUnitDto extends MapperPickType(Property, [
	'address',
	'bathroom',
	'bedroom',
	'toilet',
	'id',
	'name',
	'area',
	'uuid',
]) {}

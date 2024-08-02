import { AutoMap } from '@automapper/classes';
import { Property } from '../../entities/property.entity';
import {
	MapperOmitType,
	MapperPickType,
} from '@automapper/classes/mapped-types';
import { MetadataDto } from './metadata.dto';
import { IsOptional } from 'class-validator';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { LeaseDto } from 'apps/klubiq-dashboard/src/lease/dto/responses/view-lease.dto';

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

	@AutoMap()
	@IsOptional()
	rent?: number;

	@AutoMap()
	@IsOptional()
	unitCount?: number;

	@AutoMap()
	@IsOptional()
	totalTenants?: number;

	@AutoMap()
	@IsOptional()
	openMaintenanceRequests?: number;

	@AutoMap()
	@IsOptional()
	vacantUnit?: number;

	@AutoMap(() => MetadataDto)
	purpose: MetadataDto;

	@AutoMap(() => [PropertyDto])
	@IsOptional()
	units?: PropertyDto[];

	@AutoMap(() => MetadataDto)
	category: MetadataDto;

	@AutoMap(() => MetadataDto)
	type: MetadataDto;

	@AutoMap(() => PropertyImage)
	mainPhoto?: PropertyImage;

	@AutoMap(() => [LeaseDto])
	leases?: LeaseDto[];
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

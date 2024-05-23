import { AutoMap } from '@automapper/classes';
import { Property } from '../../entities/property.entity';
import {
	MapperOmitType,
	MapperPickType,
} from '@automapper/classes/mapped-types';

export class PropertyDto extends MapperOmitType(Property, [
	'parentProperty',
	'category',
	'type',
	'purpose',
	'status',
	'images',
	'amenities',
]) {
	// @AutoMap()
	// purposeId?: number;

	// @AutoMap()
	// categoryId?: number;

	// @AutoMap()
	// typeId?: number;

	// @AutoMap()
	// statusId?: number;

	@AutoMap()
	images?: string[];

	@AutoMap()
	amenities?: string[];

	@AutoMap()
	tags?: string[];

	@AutoMap()
	createdDate?: Date;

	@AutoMap()
	updatedDate?: Date;

	@AutoMap()
	area?: any;
}

export class PropertyUnitDto extends MapperPickType(Property, [
	'address',
	'bathroom',
	'bedroom',
	'toilet',
	'id',
	'name',
	'area',
	'address',
]) {}

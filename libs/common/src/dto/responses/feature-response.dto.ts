import { Feature } from '../../database/entities/feature.entity';
import { MapperPickType } from '@automapper/classes/mapped-types';

export class ViewFeatureDto extends MapperPickType(Feature, [
	'id',
	'name',
	'alias',
	'description',
]) {}

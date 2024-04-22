import { Property } from '../entities/property.entity';
import { MapperOmitType } from '@automapper/classes/mapped-types';

export class PropertyDto extends MapperOmitType(Property, []) {}

import { PropertyAddress } from '../../entities/property-address.entity';
import { MapperOmitType } from '@automapper/classes/mapped-types';

export class AddressDto extends MapperOmitType(PropertyAddress, []) {}

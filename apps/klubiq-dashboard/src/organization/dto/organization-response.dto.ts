import { MapperOmitType } from '@automapper/classes/mapped-types';
import { Organization } from '../entities/organization.entity';

export class OrganizationResponseDto extends MapperOmitType(Organization, [
	'users',
	'createdDate',
	'deletedDate',
	'isDeleted',
	'updatedDate',
]) {}

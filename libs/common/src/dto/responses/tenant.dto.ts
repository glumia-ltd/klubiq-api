import { UserProfile } from '@app/common/database/entities/user-profile.entity';
import { MapperOmitType } from '@automapper/classes/mapped-types';

export class TenantDto extends MapperOmitType(UserProfile, [
	'systemRole',
	'organizationUser',
	'propertiesOwned',
	'propertiesManaged',
	'updatedDate',
	'createdDate',
]) {}

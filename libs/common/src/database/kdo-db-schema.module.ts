import { Module } from '@nestjs/common/decorators/modules';
import { Role } from './entities/role.entity';

import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { OrganizationTenants } from './entities/organization-tenants.entity';
import { OrganizationSettings } from './entities/organization-settings.entity';
import { Amenity } from './entities/property-amenity.entity';
import { PropertyCategory } from './entities/property-category.entity';
import { PropertyImage } from './entities/property-image.entity';
import { PropertyPurpose } from './entities/property-purpose.entity';
import { PropertyStatus } from './entities/property-status.entity';
import { PropertyType } from './entities/property-type.entity';
import { TenantUser } from './entities/tenant.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { UserPreferences } from './entities/user-preferences.entity';

/// WE HAVE 2 SCHEMA TYPES. => KDO and POO
/// KDO = Klubiq Data Object
/// POO = Property Owner Object
@Module({
	imports: [
		TypeOrmModule.forFeature([
			Role,
			UserInvitation,
			TenantUser,
			Amenity,
			PropertyImage,
			PropertyType,
			PropertyCategory,
			PropertyPurpose,
			PropertyStatus,
			UserPreferences,
			OrganizationSettings,
			OrganizationTenants,
		]),
	],
})
export class KdoDBSchemaModule {}

import { Module } from '@nestjs/common';
import { TenantsController } from './controller/tenants.controller';
import { TenantsService } from './services/tenants.service';
import { LeaseTenantRepository, RepositoriesModule } from '@app/common';

@Module({
	controllers: [TenantsController],
	providers: [TenantsService, LeaseTenantRepository],
	imports: [RepositoriesModule],
})
export class TenantsModule {}

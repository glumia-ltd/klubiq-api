import { Module } from '@nestjs/common';
import { LeaseController } from './controllers/lease.controller';
import { LeaseService } from './services/lease.service';
import { LeaseRepository } from './repositories/lease.repository';
import { LEASE_SERVICE_INTERFACE } from './interfaces/lease.interface';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { LeaseProfile } from './profiles/lease.profile';
import { CommonProfile } from '@app/common/profiles/common-profile';
import { FileUploadService } from '@app/common/services/file-upload.service';
import { PropertyProfile } from '../properties/profiles/property.profile';
import { ConfigModule } from '@app/common/config/config.module';

@Module({
	providers: [
		PropertyProfile,
		CommonProfile,
		LeaseProfile,
		LeaseService,
		LeaseRepository,
		{
			provide: LEASE_SERVICE_INTERFACE,
			useClass: LeaseService,
		},
		FileUploadService,
	],
	imports: [RepositoriesModule, ConfigModule],
	controllers: [LeaseController],
	exports: [LEASE_SERVICE_INTERFACE],
})
export class LeaseModule {}

import { Module } from '@nestjs/common';
import { LeaseController } from './controllers/lease.controller';
import { LeaseService } from './services/lease.service';
import { LeaseRepository } from './repositories/lease.repository';
import { LEASE_SERVICE_INTERFACE } from './interfaces/lease.interface';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { CommonProfile } from '@app/common/profiles/common-profile';
import { FileUploadService } from '@app/common/services/file-upload.service';
import { ConfigModule } from '@app/common/config/config.module';

@Module({
	providers: [
		CommonProfile,
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
	exports: [LEASE_SERVICE_INTERFACE, LeaseRepository],
})
export class LeaseModule {}

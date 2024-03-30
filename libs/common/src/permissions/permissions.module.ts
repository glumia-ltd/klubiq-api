import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { PermissionsService } from './permissions.service';
import { CommonProfile } from '../profiles/common-profile';

@Module({
	imports: [RepositoriesModule],
	providers: [PermissionsService, CommonProfile],
	exports: [PermissionsService],
})
export class PermissionsModule {}

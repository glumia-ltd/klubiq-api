import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ConfigService } from '@nestjs/config';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsController } from './notifications.controller';

@Module({
	imports: [RepositoriesModule],
	controllers: [NotificationsController],
	providers: [NotificationsService, ConfigService, NotificationsRepository],
	exports: [NotificationsService],
})
export class NotificationsModule {}

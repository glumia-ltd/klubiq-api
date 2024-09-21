import { Module } from '@nestjs/common';
import { PropertyCreatedListener } from './property-events.listener';
import { DashboardModule } from '../dashboard/dashboard.module';
import { EventsController } from './events.controller';

@Module({
	imports: [DashboardModule],
	providers: [PropertyCreatedListener],
	controllers: [EventsController],
})
export class EventListenersModule {}

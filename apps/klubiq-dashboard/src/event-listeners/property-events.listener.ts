import { Injectable } from '@nestjs/common';
//import { OnEvent } from "@nestjs/event-emitter";
import { CreatePropertyEvent } from './event-models/property-event';
import { DashboardService } from '../dashboard/services/dashboard.service';

@Injectable()
export class PropertyCreatedListener {
	constructor(private readonly dashboardService: DashboardService) {}
	//@OnEvent('property.created')
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	handlePropertyCreatedEvent(payload: CreatePropertyEvent) {
		const metrics = this.dashboardService.getPropertyMetrics();
		return metrics;
	}
}

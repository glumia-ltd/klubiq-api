import { Injectable } from '@nestjs/common';
//import { OnEvent } from "@nestjs/event-emitter";
import { CreatePropertyEvent } from './event-models/property-event';
import { DashboardService } from '../dashboard/services/dashboard.service';

@Injectable()
export class PropertyCreatedListener {
	constructor(private readonly dashboardService: DashboardService) {}
	//@OnEvent('property.created')
	handlePropertyCreatedEvent(payload: CreatePropertyEvent) {
		console.log('Property created', payload);
		const metrics = this.dashboardService.getPropertyMetrics();
		console.log('UPDATED Metrics', metrics);
		return metrics;
	}
}

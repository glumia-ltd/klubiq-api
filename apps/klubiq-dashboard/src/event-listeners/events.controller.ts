import {
	Controller,
	BadRequestException,
	Sse,
	MessageEvent,
	Logger,
	// Inject,
	Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { UserRoles } from '@app/common/config/config.constants';

import { Auth, Roles } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { Observable, Subject } from 'rxjs';
import {
	//EventEmitter2,
	OnEvent,
} from '@nestjs/event-emitter';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { ClsService } from 'nestjs-cls';
//import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreatePropertyEvent } from './event-models/property-event';
import { Request } from 'express';

@ApiTags('events')
@Auth(AuthType.QueryParams)
@Roles(UserRoles.LANDLORD)
@Controller('events')
export class EventsController {
	private propertyEvents$: Map<string, Subject<MessageEvent>> = new Map();
	private readonly cacheKeyPrefix = 'properties';
	private readonly cacheTTL = 3600;
	private readonly logger = new Logger(EventsController.name);
	//private connectionCount: number = 0;
	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		private readonly dashboardService: DashboardService,
		// private eventEmitter: EventEmitter2,
		// @Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	@Sse('sse/properties')
	sse(@Req() req: Request): Observable<MessageEvent> {
		const currentUser = this.cls.get('currentUser');
		this.logger.log(
			`Client connection from: Org: ${currentUser.organizationId} | User: ${currentUser.email}`,
		);
		req.on('close', () => {
			this.logger.log(
				`Client connection closed for: Org: ${currentUser.organizationId} | User: ${currentUser.email}`,
			);
		});
		try {
			if (!this.propertyEvents$.has(currentUser.organizationId)) {
				this.propertyEvents$.set(
					currentUser.organizationId,
					new Subject<MessageEvent>(),
				);
			}
			return this.propertyEvents$
				.get(currentUser.organizationId)
				.asObservable();
		} catch (error) {
			this.logger.error(
				`Error in Property Events >> Server-Sent-Events: ${error.message}`,
				`Server-Sent-Events`,
			);
			throw new BadRequestException(error.message);
		}
	}

	@OnEvent('property.created')
	async handlePropertyCreatedEvent(payload: CreatePropertyEvent) {
		const orgDashboardStream = this.propertyEvents$.get(payload.organizationId);
		if (orgDashboardStream) {
			const metrics = await this.dashboardService.getPropertyMetrics(true);
			const message: MessageEvent = { data: metrics, type: 'dashboard' };
			orgDashboardStream.next(message);
		}
	}
}

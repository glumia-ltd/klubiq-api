import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
import { OrganizationSubscriptions } from '../database/entities/organization-subscriptions.entity';
import { OrganizationCounter } from '../database/entities/organization-counter.entity';

@Injectable()
export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlan> {
	protected readonly logger = new Logger(SubscriptionPlanRepository.name);
	constructor(manager: EntityManager) {
		super(SubscriptionPlan, manager);
	}
}

@Injectable()
export class OrganizationSubscriptionRepository extends BaseRepository<OrganizationSubscriptions> {
	protected readonly logger = new Logger(
		OrganizationSubscriptionRepository.name,
	);
	constructor(manager: EntityManager) {
		super(OrganizationSubscriptions, manager);
	}
}

@Injectable()
export class OrganizationCounterRepository extends BaseRepository<OrganizationCounter> {
	protected readonly logger = new Logger(OrganizationCounterRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationCounter, manager);
	}
}

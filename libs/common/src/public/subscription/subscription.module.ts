import { CacheService } from '@app/common/services/cache.service';
import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionPlanController } from './subscription-plan.controller';
import {
	OrganizationSubscriptionRepository,
	OrganizationCounterRepository,
	SubscriptionPlanRepository,
} from '@app/common/repositories/subscription.repository';
import { OrganizationSubscriptionService } from '@app/common/services/organization-subscription.service';
import { SubscriptionPlanService } from '@app/common/services/subscription-plan.service';

@Module({
	controllers: [SubscriptionPlanController, SubscriptionController],
	providers: [
		{
			provide: CacheService,
			useFactory: () => new CacheService(null),
		},
		OrganizationSubscriptionRepository,
		OrganizationCounterRepository,
		SubscriptionPlanRepository,
		OrganizationSubscriptionService,
		SubscriptionPlanService,
	],
	exports: [OrganizationSubscriptionService, SubscriptionPlanService],
})
export class SubscriptionModule {}

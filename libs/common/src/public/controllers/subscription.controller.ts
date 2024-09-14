import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
} from '@nestjs/common';
import { OrganizationSubscriptionService } from '@app/common/services/organization-subscription.service';
import { SubscribeToPlanDto } from '@app/common/dto/requests/plan-subscriptions.dto';
import { SubscriptionPlanService } from '@app/common/services/subscription-plan.service';

@Controller('subscriptions')
export class SubscriptionController {
	constructor(
		private readonly organizationSubscriptionService: OrganizationSubscriptionService,
		private readonly subscriptionService: SubscriptionPlanService,
	) {}

	@Post(':organizationUuId/subscribe')
	async subscribeToPlan(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
		@Body() subscribeDto: SubscribeToPlanDto,
	) {
		return await this.organizationSubscriptionService.subscribeToPlan(
			organizationUuId,
			subscribeDto.newPlanId,
			subscribeDto.paymentFrequency,
		);
	}

	@Get(':organizationUuId/subscription')
	async getOrganizationSubscription(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
	) {
		return await this.organizationSubscriptionService.getSubscription(
			organizationUuId,
		);
	}

	@Get(':organizationUuId/limits')
	async getOrganizationSubscriptionLimits(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
	) {
		return await this.organizationSubscriptionService.getSubscriptionLimits(
			organizationUuId,
		);
	}

	@Post(':organizationUuId/downgrade')
	async downgradePlan(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
		@Body() changePlanDto: SubscribeToPlanDto,
	) {
		const newPlan = await this.subscriptionService.getPlan(
			changePlanDto.newPlanId,
		);
		await this.organizationSubscriptionService.enforceSubscriptionLimits(
			organizationUuId,
			newPlan,
		);
		await this.organizationSubscriptionService.changeSubscription(
			changePlanDto,
			organizationUuId,
		);
	}

	@Post(':organizationUuId/upgrade')
	async upgradePlan(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
		@Body() changePlanDto: SubscribeToPlanDto,
	) {
		await this.organizationSubscriptionService.changeSubscription(
			changePlanDto,
			organizationUuId,
		);
	}
}

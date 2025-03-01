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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthType } from '@app/auth/types/firebase.types';
import { Auth } from '@app/auth/decorators/auth.decorator';
import { SubscriptionLimitsDto } from '@app/common/dto/responses/subscription-limits.dto';
import { OrganizationSubscriptionDto } from '@app/common/dto/responses/organization-subscription.dto';

@ApiBearerAuth()
@Auth(AuthType.Bearer)
@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
	constructor(
		private readonly organizationSubscriptionService: OrganizationSubscriptionService,
		private readonly subscriptionService: SubscriptionPlanService,
	) {}

	@Post(':organizationUuId/subscribe')
	@ApiOkResponse({
		type: OrganizationSubscriptionDto,
		description: 'Subscription successful',
	})
	async subscribeToPlan(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
		@Body() subscribeDto: SubscribeToPlanDto,
	): Promise<OrganizationSubscriptionDto> {
		return await this.organizationSubscriptionService.subscribeToPlan(
			organizationUuId,
			subscribeDto.newPlanId,
			subscribeDto.paymentFrequency,
		);
	}

	@ApiOkResponse({
		type: OrganizationSubscriptionDto,
		description: 'Subscription retrieved successfully',
	})
	@Get(':organizationUuId/subscription')
	async getOrganizationSubscription(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
	): Promise<OrganizationSubscriptionDto> {
		return await this.organizationSubscriptionService.getSubscription(
			organizationUuId,
		);
	}

	@ApiOkResponse({
		type: SubscriptionLimitsDto,
		description: 'Subscription limits retrieved successfully',
	})
	@Get(':organizationUuId/limits')
	async getOrganizationSubscriptionLimits(
		@Param('organizationUuId', new ParseUUIDPipe()) organizationUuId: string,
	): Promise<SubscriptionLimitsDto> {
		return await this.organizationSubscriptionService.getSubscriptionLimits(
			organizationUuId,
		);
	}

	@ApiOkResponse({ description: 'Subscription plan downgraded successfully' })
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

	@ApiOkResponse({ description: 'Subscription plan upgraded successfully' })
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

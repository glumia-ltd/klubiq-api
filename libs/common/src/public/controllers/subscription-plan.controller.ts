import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscriptionPlanService } from '@app/common/services/subscription-plan.service';
import { CreatePlanDto } from '@app/common/dto/requests/create-plan.dto';
import { SubscriptionPlanDto } from '@app/common/dto/responses/subscription-plan.dto';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiSecurity,
} from '@nestjs/swagger';
import { Auth } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';

@ApiBearerAuth()
@ApiSecurity('ApiKey')
@ApiTags('subscription_plans')
@Controller('subscription-plans')
export class SubscriptionPlanController {
	constructor(
		private readonly subscriptionPlanService: SubscriptionPlanService,
	) {}

	@Auth(AuthType.ApiKey)
	@Post()
	@ApiCreatedResponse({
		description: 'Subscription plan created successfully',
		type: SubscriptionPlanDto,
	})
	async createPlan(
		@Body() createPlanDto: CreatePlanDto,
	): Promise<SubscriptionPlanDto> {
		return await this.subscriptionPlanService.createPlan(createPlanDto);
	}

	@Auth(AuthType.None)
	@Get()
	@ApiOkResponse({
		description: 'Subscription plans fetched successfully',
		type: [SubscriptionPlanDto],
	})
	async getPlans(): Promise<SubscriptionPlanDto[]> {
		return await this.subscriptionPlanService.getAllPlans();
	}
}

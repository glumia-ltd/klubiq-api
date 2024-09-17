import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheKeys } from '../config/config.constants';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
import { CreatePlanDto } from '../dto/requests/create-plan.dto';
import { SubscriptionPlanDto } from '../dto/responses/subscription-plan.dto';
import { plainToInstance } from 'class-transformer';
import { SubscriptionPlanRepository } from '../repositories/subscription.repository';

@Injectable()
export class SubscriptionPlanService {
	private readonly cacheTTL = 60000;
	private readonly logger = new Logger(SubscriptionPlanService.name);
	private readonly cacheKey = CacheKeys.SUBSCRIPTION_PLANS;
	private readonly cacheService = new CacheService(
		this.cacheManager,
		this.cacheTTL,
	);
	constructor(
		private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}
	async createPlan(
		createSubscriptionPlanDto: CreatePlanDto,
	): Promise<SubscriptionPlanDto> {
		const newPlan = await this.subscriptionPlanRepository.createEntity(
			createSubscriptionPlanDto,
		);
		const mappedPlan = await this.mapPlanToPlanDto(newPlan);
		await this.cacheService.updateCacheAfterCreate<SubscriptionPlanDto>(
			this.cacheKey,
			mappedPlan,
		);
		return mappedPlan;
	}
	async getAllPlans(): Promise<SubscriptionPlanDto[]> {
		const cachedPlanList =
			await this.cacheService.getCache<SubscriptionPlanDto>(this.cacheKey);
		if (!cachedPlanList) {
			const plans = await this.subscriptionPlanRepository.findAll();
			const mappedPlans = await this.mapPlansToPlanListDto(plans);
			await this.cacheService.setCache<SubscriptionPlanDto[]>(
				mappedPlans,
				this.cacheKey,
			);
			return mappedPlans;
		}
		return cachedPlanList;
	}

	async getPlan(id: number): Promise<SubscriptionPlanDto> {
		const cachedPlan =
			await this.cacheService.getCacheByIdentifier<SubscriptionPlanDto>(
				this.cacheKey,
				'id',
				id,
			);
		if (!cachedPlan) {
			const plan = await this.subscriptionPlanRepository.findOneWithId({ id });
			const mappedPlan = await this.mapPlanToPlanDto(plan);
			await this.cacheService.updateCacheAfterUpsert<SubscriptionPlanDto>(
				this.cacheKey,
				'id',
				id,
				mappedPlan,
			);
			return mappedPlan;
		}
		return cachedPlan;
	}

	async getPlanByName(name: string): Promise<SubscriptionPlanDto> {
		const cachedPlan =
			await this.cacheService.getCacheByIdentifier<SubscriptionPlanDto>(
				this.cacheKey,
				'name',
				name,
			);
		if (!cachedPlan) {
			const plan = await this.subscriptionPlanRepository.findOneByCondition({
				name,
			});
			const mappedPlan = await this.mapPlanToPlanDto(plan);
			await this.cacheService.updateCacheAfterUpsert<SubscriptionPlanDto>(
				this.cacheKey,
				'name',
				name,
				mappedPlan,
			);
			return mappedPlan;
		}
		return cachedPlan;
	}

	private async mapPlansToPlanListDto(
		plans: SubscriptionPlan[],
	): Promise<SubscriptionPlanDto[]> {
		return plainToInstance(
			SubscriptionPlanDto,
			plans.map((plan) => {
				const totalMonthlyCost = Number(plan.monthly_price) * 12;
				const percentageDifference =
					((totalMonthlyCost - Number(plan.annual_price)) / totalMonthlyCost) *
					100;
				return {
					...plan,
					annual_price: Number(plan.annual_price),
					monthly_price: Number(plan.monthly_price),
					percentage_savings_on_annual_price: percentageDifference.toFixed(0),
				};
			}),
			{ excludeExtraneousValues: true },
		);
	}

	private async mapPlanToPlanDto(
		plan: SubscriptionPlan,
	): Promise<SubscriptionPlanDto> {
		const totalMonthlyCost = Number(plan.monthly_price) * 12;
		const percentageDifference =
			((totalMonthlyCost - Number(plan.annual_price)) / totalMonthlyCost) * 100;
		return plainToInstance(
			SubscriptionPlanDto,
			{
				...plan,
				annual_price: Number(plan.annual_price),
				monthly_price: Number(plan.monthly_price),
				percentage_savings_on_annual_price: percentageDifference.toFixed(0),
			},
			{ excludeExtraneousValues: true },
		);
	}
}

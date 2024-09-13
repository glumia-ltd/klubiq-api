import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheKeys } from '../config/config.constants';
import { OrganizationSubscriptions } from '../database/entities/organization-subscriptions.entity';
import { BaseRepository } from '../repositories/base.repository';
import { SubscriptionPlanService } from './subscription-plan.service';
import { DateTime } from 'luxon';
import { SubscriptionLimitsDto } from '../dto/responses/subscription-limits.dto';
import { OrganizationCounter } from '../database/entities/organization-counter.entity';

@Injectable()
export class OrganizationSubscriptionService {
	private readonly logger = new Logger(OrganizationSubscriptionService.name);
	private readonly cacheKey = CacheKeys.ORGANIZATION_SUBSCRIPTIONS;
	private readonly cacheService = new CacheService(this.cacheManager);
	private readonly cacheTTL = 60000;
	constructor(
		private readonly subscriptionRepository: BaseRepository<OrganizationSubscriptions>,
		private readonly organizationCounterRepository: BaseRepository<OrganizationCounter>,
		private readonly subscriptionPlanService: SubscriptionPlanService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async subscribeToPlan(
		organizationUuId: string,
		planId: number,
		duration: 'monthly' | 'annual',
	): Promise<OrganizationSubscriptions> {
		const plan = await this.subscriptionPlanService.getPlan(planId);
		if (!plan) {
			throw new BadRequestException(`Plan with id ${planId} not found`);
		}
		const price =
			duration === 'monthly' ? plan.monthly_price : plan.annual_price;
		const subscription = await this.subscriptionRepository.createEntity({
			organizationUuid: organizationUuId,
			subscription_plan_id: planId,
			duration,
			is_active: true,
			auto_renew: true,
			start_date: DateTime.utc().toJSDate(),
			end_date: DateTime.utc()
				.plus({
					years: duration === 'annual' ? 1 : 0,
					months: duration === 'annual' ? 0 : 1,
				})
				.toJSDate(),
			payment_status: 'pending',
			price,
		});
		return subscription;
	}

	async getSubscription(
		organizationUuId: string,
	): Promise<OrganizationSubscriptions> {
		const cachedSubscription =
			await this.cacheService.getCacheByKey<OrganizationSubscriptions>(
				`${this.cacheKey}-${organizationUuId}`,
			);
		if (!cachedSubscription) {
			const subscription = await this.subscriptionRepository.findOneByCondition(
				{
					organizationUuid: organizationUuId,
					is_active: true,
				},
			);
			await this.cacheService.setCache(
				subscription,
				`${this.cacheKey}-${organizationUuId}`,
			);
			return subscription;
		}
		return cachedSubscription;
	}
	async getSubscriptionLimits(
		organizationUuId: string,
	): Promise<SubscriptionLimitsDto> {
		const cachedPlanLimits =
			await this.cacheService.getCacheByKey<SubscriptionLimitsDto>(
				`${this.cacheKey}-limits-${organizationUuId}`,
			);
		if (cachedPlanLimits) {
			return cachedPlanLimits;
		}
		const subscription = await this.subscriptionRepository.findOne({
			where: {
				organizationUuid: organizationUuId,
				is_active: true,
			},
			relations: ['subscription_plan'],
		});
		if (!subscription) {
			throw new BadRequestException(
				`Subscription not found for organization ${organizationUuId}`,
			);
		}
		const planLimits: SubscriptionLimitsDto = {
			propertyLimit: subscription.subscription_plan.property_limit,
			unitLimit: subscription.subscription_plan.unit_limit,
			userLimit: subscription.subscription_plan.user_limit,
			documentStorageLimit:
				subscription.subscription_plan.document_storage_limit,
		};
		await this.cacheService.setCache(
			planLimits,
			`${this.cacheKey}-limits-${organizationUuId}`,
		);
		return planLimits;
	}

	async canAddProperty(organizationUuId: string): Promise<boolean> {
		const planLimit = await this.getSubscriptionLimits(organizationUuId);
		const counter = await this.organizationCounterRepository.findOneByCondition(
			{ organization_uuid: organizationUuId },
		);
		return counter.property_count < planLimit.propertyLimit;
	}

	async canUploadDocument(
		organizationUuId: string,
		fileSizeInMB: number,
	): Promise<boolean> {
		const planLimit = await this.getSubscriptionLimits(organizationUuId);
		const counter = await this.organizationCounterRepository.findOneByCondition(
			{ organization_uuid: organizationUuId },
		);
		return (
			counter.document_storage_size + fileSizeInMB <
			planLimit.documentStorageLimit
		);
	}

	async canAddUnit(
		organizationUuId: string,
		unitCountToAdd: number,
	): Promise<boolean> {
		const planLimit = await this.getSubscriptionLimits(organizationUuId);
		const counter = await this.organizationCounterRepository.findOneByCondition(
			{ organization_uuid: organizationUuId },
		);
		return counter.unit_count + unitCountToAdd < planLimit.unitLimit;
	}

	async canAddUser(
		organizationUuId: string,
		userCountToAdd: number,
	): Promise<boolean> {
		const planLimit = await this.getSubscriptionLimits(organizationUuId);
		const counter = await this.organizationCounterRepository.findOneByCondition(
			{ organization_uuid: organizationUuId },
		);
		return counter.user_count + userCountToAdd < planLimit.userLimit;
	}
}

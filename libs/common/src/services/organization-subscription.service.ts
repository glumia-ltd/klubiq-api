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
import { SubscriptionPlanService } from './subscription-plan.service';
import { DateTime } from 'luxon';
import { SubscriptionLimitsDto } from '../dto/responses/subscription-limits.dto';
import {
	OrganizationCounterRepository,
	OrganizationSubscriptionRepository,
} from '../repositories/subscription.repository';
import { SubscribeToPlanDto } from '../dto/requests/plan-subscriptions.dto';
import { SubscriptionPlan } from '../database/entities/subscription-plan.entity';
import { OrganizationSubscriptionDto } from '../dto/responses/organization-subscription.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrganizationSubscriptionService {
	private readonly logger = new Logger(OrganizationSubscriptionService.name);
	private readonly cacheKey = CacheKeys.ORGANIZATION_SUBSCRIPTIONS;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly subscriptionRepository: OrganizationSubscriptionRepository,
		private readonly organizationCounterRepository: OrganizationCounterRepository,
		private readonly subscriptionPlanService: SubscriptionPlanService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private mapPlainToDto(
		subscription: OrganizationSubscriptions,
	): OrganizationSubscriptionDto {
		return plainToInstance(
			OrganizationSubscriptionDto,
			{
				start_date: DateTime.fromJSDate(subscription.start_date).toISO(),
				end_date: DateTime.fromJSDate(subscription.end_date).toISO(),
				...subscription,
			},
			{ excludeExtraneousValues: true, groups: ['admin'] },
		);
	}
	async subscribeToPlan(
		organizationUuId: string,
		planId: number,
		duration: 'monthly' | 'annual',
	): Promise<OrganizationSubscriptionDto> {
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
			is_free_trial: false,
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
		const mappedSubscription = this.mapPlainToDto(subscription);
		await this.cacheService.setCache(
			mappedSubscription,
			`${this.cacheKey}-${organizationUuId}`,
		);
		return mappedSubscription;
	}

	async getSubscription(
		organizationUuId: string,
	): Promise<OrganizationSubscriptionDto> {
		const cachedSubscription =
			await this.cacheService.getCacheByKey<OrganizationSubscriptionDto>(
				`${this.cacheKey}-${organizationUuId}`,
			);
		if (!cachedSubscription) {
			const subscription = await this.subscriptionRepository.findOneByCondition(
				{
					organizationUuid: organizationUuId,
					is_active: true,
				},
			);
			const mappedSubscription = this.mapPlainToDto(subscription);
			await this.cacheService.setCache(
				mappedSubscription,
				`${this.cacheKey}-${organizationUuId}`,
			);
			return mappedSubscription;
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

	// FUNCTION: Check user limit and determine if new user can be added to the organization
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

	// HELPER FUNCTION: Calculate prorated amount based on current price, days used, and total days in the plan
	private calculateProratedAmount(
		currentPrice: number,
		daysUsed: number,
		totalDays: number,
	): number {
		return (currentPrice * daysUsed) / totalDays;
	}

	async changeSubscription(
		changePlanDto: SubscribeToPlanDto,
		organization_uuid: string,
	) {
		const currentSubscription =
			await this.subscriptionRepository.findOneByCondition(
				{
					organizationUuid: organization_uuid,
					is_active: true,
				},
				['subscription_plan'],
			);
		const newPlan = await this.subscriptionPlanService.getPlan(
			changePlanDto.newPlanId,
		);

		// Get current date and calculate the days used in the current billing cycle
		const currentDate = DateTime.utc();
		const daysInBillingCycle =
			changePlanDto.paymentFrequency === 'annual' ? 365 : 30;
		const daysUsedInCurrentCycle = currentDate.diff(
			DateTime.fromJSDate(currentSubscription.start_date),
			'days',
		).days;
		const daysRemainingInCurrentCycle =
			daysInBillingCycle - daysUsedInCurrentCycle;

		// Calculate the prorated amounts

		// const proratedAmount = this.calculateProratedAmount(
		//     currentSubscription.price,
		//     daysUsedInCurrentCycle,
		//     daysInBillingCycle,
		// );
		const remainingCredit = this.calculateProratedAmount(
			currentSubscription.price,
			daysRemainingInCurrentCycle,
			daysInBillingCycle,
		);
		const newPlanProratedAmount = this.calculateProratedAmount(
			changePlanDto.paymentFrequency === 'annual'
				? newPlan.annual_price
				: newPlan.monthly_price,
			daysRemainingInCurrentCycle,
			daysInBillingCycle,
		);
		// Final amount to charge (or refund)

		const finalAmount = newPlanProratedAmount - remainingCredit;
		// TODO: Add payment processor logic for refund and charge
		console.log('Final amount to charge: ', finalAmount);
		// send final amount to payment processor

		// IMPLEMENT: Update subscription
		currentSubscription.subscription_plan = newPlan;
		currentSubscription.start_date = currentDate.toJSDate();
		currentSubscription.is_active = true;
		currentSubscription.duration = changePlanDto.paymentFrequency;
		currentSubscription.price =
			changePlanDto.paymentFrequency === 'annual'
				? newPlan.annual_price
				: newPlan.monthly_price;
		currentSubscription.payment_status = 'pending';

		await this.subscriptionRepository.updateEntity(
			{ id: currentSubscription.id },
			currentSubscription,
		);
	}

	async enforceSubscriptionLimits(
		organizationUuId: string,
		newPlan: SubscriptionPlan,
	) {
		const subscriptionLimits =
			await this.getSubscriptionLimits(organizationUuId);
		const counter = await this.organizationCounterRepository.findOneByCondition(
			{ organization_uuid: organizationUuId },
		);
		if (counter.property_count >= subscriptionLimits.propertyLimit) {
			throw new Error(
				`Your current property count exceeds the limit of the ${newPlan.name} plan. Please reduce the number of properties.`,
			);
		}
		if (
			counter.document_storage_size >= subscriptionLimits.documentStorageLimit
		) {
			throw new Error(
				`Your current document storage exceeds the limit of the ${newPlan.name} plan. Please reduce document storage usage.`,
			);
		}
		if (counter.unit_count >= subscriptionLimits.unitLimit) {
			throw new Error(
				`Your current unit count exceeds the limit of the ${newPlan.name} plan. Please reduce the number of units.`,
			);
		}
		if (counter.user_count >= subscriptionLimits.userLimit) {
			throw new Error(
				`Your current user count exceeds the limit of the ${newPlan.name} plan. Please remove some users.`,
			);
		}
	}
}

import { Lease } from '../database/entities/lease.entity';
import { DateTime } from 'luxon';
import { CacheTTl, PaymentFrequency } from '../config/config.constants';
import { CacheService } from '../services/cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Util {
	constructor(private cacheService: CacheService) {}

	getPercentageIncreaseOrDecrease(oldVal: number, newVal: number): number {
		return (newVal - oldVal) / oldVal;
	}
	getOverDueRentDetails(lease: Lease) {
		const { rentAmount } = lease;
		const currentDate = DateTime.utc().toJSDate();
		let nextDueDate = this.calculateNextRentDueDate(lease);
		let totalOverDueRent = 0;
		let totalUnpaidCounter = 0;
		while (nextDueDate <= currentDate) {
			totalOverDueRent += rentAmount;
			nextDueDate = this.calculateNextRentDueDate(lease);
			totalUnpaidCounter++;
		}
		return {
			totalOverDueRent,
			totalUnpaidCounter,
		};
	}

	calculateNextRentDueDate(lease: Lease): Date | null {
		const {
			startDate,
			endDate,
			rentDueDay,
			paymentFrequency,
			customPaymentFrequency,
			lastPaymentDate,
		} = lease;

		// Early return if lease has ended
		if (DateTime.utc().toJSDate() > endDate) return null;

		// Create DateTime object once for base date
		const baseDate = DateTime.fromJSDate(lastPaymentDate ?? startDate, {
			zone: 'utc',
		});

		// Map payment frequencies to their intervals
		const frequencyMap = {
			[PaymentFrequency.WEEKLY]: { weeks: 1 },
			[PaymentFrequency.BI_WEEKLY]: { weeks: 2 },
			[PaymentFrequency.MONTHLY]: { months: 1 },
			[PaymentFrequency.BI_MONTHLY]: { months: 2 },
			[PaymentFrequency.QUARTERLY]: { months: 3 },
			[PaymentFrequency.ANNUALLY]: { years: 1 },
			[PaymentFrequency.CUSTOM]: { days: customPaymentFrequency! },
		};

		// Calculate next due date
		const interval = frequencyMap[paymentFrequency];
		if (!interval) return null;

		let nextDueDate = baseDate.plus(interval);

		// Adjust for rent due day if applicable
		if (
			rentDueDay > 0 &&
			(paymentFrequency === PaymentFrequency.MONTHLY ||
				paymentFrequency === PaymentFrequency.BI_MONTHLY)
		) {
			nextDueDate = nextDueDate.set({
				day: Math.min(rentDueDay, nextDueDate.daysInMonth),
			});
		}

		// Convert to JS Date and check against end date
		const result = nextDueDate.toJSDate();
		return result > endDate ? null : result;
	}

	public getcacheKey(
		organizationUuid: string,
		resource: string,
		cacheKeyExtension?: string,
	) {
		return `${organizationUuid}:${resource}${cacheKeyExtension ? `:${cacheKeyExtension}` : ''}`;
	}

	public async updateOrganizationResourceCacheKeys(
		organizationUuid: string,
		resource: string,
		listKey?: string,
	) {
		const cacheKey = this.getcacheKey(organizationUuid, resource);
		const cachedEntry =
			(await this.cacheService.getCache<string[]>(cacheKey)) || [];
		const newCacheEntry = listKey
			? Array.from(new Set([...cachedEntry, listKey]))
			: Array.from(new Set(cachedEntry));
		await this.cacheService.setCache(
			newCacheEntry,
			`${cacheKey}:listKeys`,
			CacheTTl.ONE_DAY,
		);
	}
}

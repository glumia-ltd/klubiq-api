import { Lease } from '../database/entities/lease.entity';
import { DateTime } from 'luxon';
import { PaymentFrequency } from '../config/config.constants';

export class Util {
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
}

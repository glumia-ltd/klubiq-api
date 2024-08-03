import { Lease } from '../database/entities/lease.entity';
import { DateTime } from 'luxon';
import { PaymentFrequency } from '../config/config.constants';

export class Util {
	getPercentageIncreaseOrDecrease(oldVal: number, newVal: number): number {
		return ((newVal - oldVal) / oldVal) * 100;
	}

	calculateNextRentDueDate(lease: Lease): Date | null {
		const {
			startDate,
			endDate,
			rentDueDay,
			paymentFrequency,
			customPaymentFrequency,
		} = lease;
		const currentDate = DateTime.utc().toJSDate();
		if (currentDate > endDate) return null;
		let nextDueDate: Date = startDate;
		while (nextDueDate <= currentDate) {
			switch (paymentFrequency) {
				case PaymentFrequency.WEEKLY:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ weeks: 1 })
						.toJSDate();
					break;
				case PaymentFrequency.BI_WEEKLY:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ weeks: 2 })
						.toJSDate();
					break;
				case PaymentFrequency.MONTHLY:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ months: 1 })
						.toJSDate();
					break;
				case PaymentFrequency.BI_MONTHLY:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ months: 2 })
						.toJSDate();
					break;
				case PaymentFrequency.QUARTERLY:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ months: 3 })
						.toJSDate();
					break;
				case PaymentFrequency.ANNUALLY:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ years: 1 })
						.toJSDate();
				case PaymentFrequency.CUSTOM:
					nextDueDate = DateTime.fromJSDate(nextDueDate)
						.plus({ days: customPaymentFrequency! })
						.toJSDate();
					break;
				default:
					break;
			}
		}
		if (rentDueDay > 0 && paymentFrequency === PaymentFrequency.MONTHLY) {
			nextDueDate = DateTime.fromJSDate(nextDueDate)
				.set({ day: rentDueDay })
				.toJSDate();
		}

		return nextDueDate > endDate ? null : nextDueDate;
	}
}

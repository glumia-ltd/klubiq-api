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
		const currentDate = DateTime.utc().toJSDate();
		if (currentDate > endDate) return null;
		let nextDueDate: Date = lastPaymentDate || startDate;
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
		if (rentDueDay > 0 && paymentFrequency === PaymentFrequency.MONTHLY) {
			nextDueDate = DateTime.fromJSDate(nextDueDate)
				.set({ day: rentDueDay })
				.toJSDate();
		}

		return nextDueDate > endDate ? null : nextDueDate;
	}
}

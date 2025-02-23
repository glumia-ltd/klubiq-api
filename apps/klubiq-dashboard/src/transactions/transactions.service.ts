import { Injectable, Logger } from '@nestjs/common';
import { CreateTransactionDto } from './dto/requests/create-transaction.dto';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { LeaseRepository } from '../lease/repositories/lease.repository';
import { TransactionsRepository } from './transactions.repository';
import { ClsService } from 'nestjs-cls';
import { Util } from '@app/common/helpers/util';
import { DateTime } from 'luxon';
import {
	PaymentStatus,
	RevenueType,
	TransactionType,
} from '@app/common/config/config.constants';
import ShortUniqueId from 'short-unique-id';
import { padStart } from 'lodash';
import { Transaction } from '@app/common/database/entities/transaction.entity';
@Injectable()
export class TransactionsService {
	private readonly logger = new Logger(TransactionsService.name);
	private readonly cacheKeyPrefix = 'transactions';
	private readonly cacheTTL = 180;
	private readonly suid = new ShortUniqueId({ length: 10 });
	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		private readonly leaseRepository: LeaseRepository,
		private readonly transactionRepository: TransactionsRepository,
		private readonly util: Util,
	) {}
	async recordTransaction(
		leaseId: string,
		transactionDto: CreateTransactionDto,
	): Promise<Transaction> {
		const lease = await this.leaseRepository.findOneWithId({ id: leaseId });
		if (!lease) throw new Error('Lease not found');
		const nextDueDate = this.util.calculateNextRentDueDate(lease);
		const paymentStatus =
			nextDueDate < DateTime.utc().toJSDate()
				? PaymentStatus.OVERDUE
				: PaymentStatus.PAID;
		const uniqueCode = this.suid.stamp(10, DateTime.utc().toJSDate());
		const transaction = this.transactionRepository.create({
			...transactionDto,
			status: paymentStatus,
			lease,
			transactionDate: DateTime.utc().toJSDate(),
			type: TransactionType.REVENUE,
			revenueType: RevenueType.PROPERTY_RENTAL,
			code: padStart(uniqueCode, 14, 'KUI-'),
		});
		await this.transactionRepository.save(transaction);
		lease.lastPaymentDate = transaction.transactionDate;
		await this.leaseRepository.save(lease);
		return transaction;
	}
	async getTransactionHistory(leaseId: string): Promise<Transaction[]> {
		return await this.transactionRepository.find({
			where: { lease: { id: leaseId } },
			order: { transactionDate: 'DESC' },
		});
	}
	async recordPartialTransaction(
		leaseId: string,
		transactionDto: CreateTransactionDto,
	): Promise<Transaction> {
		const lease = await this.leaseRepository.findOneWithId({ id: leaseId });
		if (!lease) throw new Error('Lease not found');
		const transaction = this.transactionRepository.create({
			lease,
			amount: transactionDto.amount,
			transactionDate: DateTime.utc().toJSDate(),
			type: TransactionType.REVENUE,
			revenueType: RevenueType.PROPERTY_RENTAL,
			code: padStart(
				this.suid.stamp(10, DateTime.utc().toJSDate()),
				14,
				'KUI-',
			),
			status: PaymentStatus.PARTIAL,
		});
		return await this.transactionRepository.save(transaction);
	}
	async checkOverDuePayments(lease): Promise<boolean> {
		const nextDueDate = this.util.calculateNextRentDueDate(lease);
		return nextDueDate < DateTime.utc().toJSDate();
	}
}

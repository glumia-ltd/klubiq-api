import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Transaction } from '@app/common/database/entities/transaction.entity';
import { Lease } from '@app/common/database/entities/lease.entity';
import {
	PaymentStatus,
	RevenueType,
	TransactionType,
} from '@app/common/config/config.constants';
import { DateTime } from 'luxon';
import ShortUniqueId from 'short-unique-id';

@Injectable()
export class LeaseTasksService {
	private readonly logger = new Logger(LeaseTasksService.name);
	private readonly suid = new ShortUniqueId({ length: 10 });
	constructor(private readonly entityManager: EntityManager) {}

	async generateUnpaidTransactions() {
		this.logger.debug('Generating unpaid transactions');
		const currentDate = DateTime.utc().toJSDate();
		const unpaidLeases = await this.entityManager
			.createQueryBuilder(Lease, 'ls')
			.leftJoinAndSelect('ls.unit', 'ut')
			.leftJoinAndSelect('ut.property', 'pt')
			.where(
				`poo.calculate_next_rent_due_date(ls.startDate,ls."endDate", ls.rentDueDay, ls.paymentFrequency, ls.customPaymentFrequency, ls.lastPaymentDate) <= :currentDate`,
				{ currentDate },
			)
			.andWhere('ls.endDate >= :currentDate', { currentDate })
			.andWhere((qb) => {
				const subQuery = qb
					.subQuery()
					.select('1')
					.from(Transaction, 'tn')
					.where('tn.leaseId = ls.id')
					.andWhere('tn.status = :paymentStatus', {
						paymentStatus: PaymentStatus.UNPAID,
					})
					.getQuery();
				return `NOT EXISTS (${subQuery})`; // Avoid duplicate transaction records
			})
			.getMany();
		if (unpaidLeases.length === 0) {
			this.logger.debug('No unpaid leases found');
			return;
		}
		const values = unpaidLeases
			.map((lease) => {
				const transaction = {
					leaseId: lease.id,
					amount: lease.rentAmount,
					type: TransactionType.REVENUE,
					revenueType: RevenueType.PROPERTY_RENTAL,
					status: PaymentStatus.UNPAID,
					transactionDate: currentDate,
					createdAt: currentDate,
					updatedAt: currentDate,
					organization: lease.organizationUuid,
					description: `Unpaid Rent for ${lease.unit.property.name}.${lease.unit.property.isMultiUnit ? `Unit: ${lease.unit.unitNumber}` : ''}`,
					code: this.suid.stamp(10, currentDate),
				};

				return `(
            '${transaction.leaseId}',
            ${transaction.amount},
            '${transaction.type}',
            '${transaction.revenueType}',
            '${transaction.status}',
            '${transaction.transactionDate.toISOString()}',
            '${transaction.createdAt.toISOString()}',
            '${transaction.updatedAt.toISOString()}',
            '${transaction.organization}',
            '${transaction.description}',
            '${transaction.code}'
            )`;
			})
			.join(',');

		const query = `
            INSERT INTO poo.transaction (
            "leaseId",
            "amount",
            "type",
            "revenueType",
            "status",
            "transactionDate",
            "createdDate",
            "updatedDate",
            "organizationUuid",
            "description",
            "code"
            ) VALUES ${values}
        `;
		await this.entityManager.query(query);
		this.logger.debug(`Inserted ${unpaidLeases.length} unpaid transactions`);
	}
}

import { Transaction } from '@app/common/database/entities/transaction.entity';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
export class TransactionsRepository extends BaseRepository<Transaction> {
	protected readonly logger = new Logger(TransactionsRepository.name);
	constructor(manager: EntityManager) {
		super(Transaction, manager);
	}
}

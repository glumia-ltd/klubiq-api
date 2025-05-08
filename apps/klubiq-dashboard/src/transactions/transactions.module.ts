import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { LeaseModule } from '../lease/lease.module';
import { TransactionsRepository } from './transactions.repository';
// import { Util } from '@app/common/helpers/util';
import { EntityManager } from 'typeorm';

@Module({
	imports: [LeaseModule],
	controllers: [TransactionsController],
	providers: [
		TransactionsService,
		{
			provide: TransactionsRepository,
			useFactory: (em: EntityManager) => new TransactionsRepository(em),
			inject: [EntityManager],
		},
		// Util,
	],
	exports: [],
})
export class TransactionsModule {}

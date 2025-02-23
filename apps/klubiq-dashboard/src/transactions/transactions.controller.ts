import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/requests/create-transaction.dto';
import { TransactionsService } from './transactions.service';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOkResponse,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';
import { Permission, Auth, Feature } from '@app/auth/decorators/auth.decorator';
import { AuthType } from '@app/auth/types/firebase.types';
import { Permissions, AppFeature } from '@app/common/config/config.constants';
import { Transaction } from '@app/common/database/entities/transaction.entity';
@ApiTags('transactions')
@Controller('transactions')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Feature(AppFeature.LEASE)
export class TransactionsController {
	constructor(private readonly transactionService: TransactionsService) {}
	@Get('lease/:leaseId/history')
	@Permission(
		Permissions.READ,
		Permissions.CREATE,
		Permissions.UPDATE,
		Permissions.DELETE,
	)
	@ApiOkResponse({
		description: 'Get transaction history',
		type: () => [Transaction],
	})
	@ApiParam({ description: 'Lease Id', name: 'leaseId', type: String })
	async getTransactionHistory(@Param('leaseId') leaseId: string) {
		return await this.transactionService.getTransactionHistory(leaseId);
	}
	@Post('lease/:leaseId/make-payment')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Records a lease transaction',
		type: () => Transaction,
	})
	@ApiParam({ description: 'Lease Id', name: 'leaseId', type: String })
	@ApiBody({
		description: 'Transaction details',
		required: true,
		type: CreateTransactionDto,
	})
	makePayment(
		@Param('leaseId') leaseId: string,
		@Body() transactionDto: CreateTransactionDto,
	) {
		return this.transactionService.recordTransaction(leaseId, transactionDto);
	}
	@Post('lease/:leaseId/make-partial-payment')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		description: 'Records a partial payment on a lease transaction',
		type: () => Transaction,
	})
	@ApiParam({ description: 'Lease Id', name: 'leaseId', type: String })
	@ApiBody({
		description: 'Transaction details',
		required: true,
		type: CreateTransactionDto,
	})
	makePartialPayment(
		@Param('leaseId') leaseId: string,
		@Body() transactionDto: CreateTransactionDto,
	) {
		return this.transactionService.recordPartialTransaction(
			leaseId,
			transactionDto,
		);
	}
}

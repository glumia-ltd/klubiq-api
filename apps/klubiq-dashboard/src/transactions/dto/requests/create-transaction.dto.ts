import { IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateTransactionDto {
	@IsNumber()
	amount: number;
	@IsNumber()
	@IsOptional()
	description?: string;
	@IsString()
	@IsOptional()
	organizationUuid?: string;
}

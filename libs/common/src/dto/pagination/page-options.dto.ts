import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Order } from '../../types/page-meta-dto-parameters';

export class PageOptionsDto {
	@ApiPropertyOptional({ enum: Order, default: Order.DESC })
	@IsEnum(Order)
	@IsOptional()
	readonly order?: Order = Order.ASC;

	@ApiPropertyOptional({
		minimum: 1,
		default: 1,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	page?: number = 1;

	@ApiPropertyOptional({
		minimum: 1,
		maximum: 50,
		default: 10,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	take?: number = 10;

	get skip(): number {
		return (this.page - 1) * this.take;
	}

	constructor(partial: Partial<PageOptionsDto>) {
		Object.assign(this, partial);
	}
}

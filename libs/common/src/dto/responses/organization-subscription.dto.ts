import { Expose, Type } from 'class-transformer';
import {
	IsString,
	IsDecimal,
	IsBoolean,
	IsNumber,
	IsUUID,
	IsDateString,
	ValidateNested,
} from 'class-validator';
import { SubscriptionPlanDto } from './subscription-plan.dto';

export class OrganizationSubscriptionDto {
	@IsNumber()
	@Expose()
	id?: number;

	@Expose()
	@IsUUID()
	organizationUuid: string;

	@IsNumber()
	@Expose()
	subscription_plan_id: number;

	@IsDateString()
	@Expose()
	start_date: string;

	@Expose()
	@IsDateString()
	end_date: string;

	@IsString()
	@Expose()
	duration: string;

	@IsDecimal()
	@Expose()
	price: number;

	@IsBoolean()
	@Expose()
	auto_renew: boolean;

	@IsBoolean()
	@Expose()
	is_active: boolean;

	@IsString()
	@Expose()
	payment_status: string;

	@Expose()
	@ValidateNested()
	@Type(() => SubscriptionPlanDto)
	subscription_plan: SubscriptionPlanDto;
}

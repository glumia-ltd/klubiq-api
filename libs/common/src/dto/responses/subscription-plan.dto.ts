import { Expose } from 'class-transformer';
import { IsString, IsDecimal, IsInt, IsBoolean } from 'class-validator';

export class SubscriptionPlanDto {
	@Expose()
	id: number;

	@Expose()
	@IsString()
	name: string;

	@Expose()
	@IsDecimal()
	monthly_price: number;

	@Expose()
	@IsDecimal()
	annual_price: number;

	@Expose()
	@IsDecimal()
	percentage_savings_on_annual_price: number;

	@Expose()
	@IsString()
	currency: string;

	@Expose()
	@IsInt()
	property_limit: number;

	@Expose()
	@IsInt()
	unit_limit: number;

	@Expose()
	@IsInt()
	user_limit: number;

	@IsInt()
	tenant_limit: number;

	@Expose()
	@IsInt()
	document_storage_limit: number; // Storage in MB

	@IsString()
	support_type: string;

	@IsBoolean()
	automated_rent_collection: boolean;

	@IsBoolean()
	multi_currency_support: boolean;

	get file_storage_unit(): string {
		return 'MB';
	}
}

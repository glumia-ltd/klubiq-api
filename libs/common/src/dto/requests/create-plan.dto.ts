import {
	IsString,
	IsDecimal,
	IsOptional,
	IsInt,
	IsBoolean,
} from 'class-validator';

export class CreatePlanDto {
	@IsString()
	name: string;

	@IsDecimal()
	monthly_price: number;

	@IsDecimal()
	annual_price: number;

	@IsString()
	currency: string;

	@IsOptional()
	@IsInt()
	property_limit: number;

	@IsOptional()
	@IsInt()
	unit_limit: number;

	@IsOptional()
	@IsInt()
	user_limit: number;

	@IsBoolean()
	custom_branding: boolean;

	@IsBoolean()
	api_access: boolean;

	@IsOptional()
	@IsInt()
	document_storage_limit: number; // Storage in MB

	@IsString()
	support_type: string;

	@IsBoolean()
	automated_rent_collection: boolean;

	@IsBoolean()
	multi_currency_support: boolean;
}

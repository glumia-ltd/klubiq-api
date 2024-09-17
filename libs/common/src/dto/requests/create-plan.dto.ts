import {
	IsString,
	IsOptional,
	IsInt,
	IsBoolean,
	IsNumber,
	IsNotEmpty,
} from 'class-validator';

export class CreatePlanDto {
	@IsString()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	monthly_price: number;

	@IsNumber()
	@IsNotEmpty()
	annual_price: number;

	@IsString()
	@IsNotEmpty()
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

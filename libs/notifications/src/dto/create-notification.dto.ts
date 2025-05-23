import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateNotificationDto {
	@IsString()
	@IsNotEmpty()
	userId: string;

	@IsString()
	@IsNotEmpty()
	type: string;

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsString()
	@IsNotEmpty()
	message: string;

	@IsObject()
	data?: Record<string, any>;

	@IsNumber()
	leaseId?: string;

	@IsNumber()
	unitId?: string;

	@IsString()
	propertyId?: string;

	@IsString()
	organizationUuid?: string;

	@IsString()
	actionLink?: string;

	@IsString()
	actionText?: string;
}

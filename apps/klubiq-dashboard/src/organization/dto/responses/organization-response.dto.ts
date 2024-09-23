import { Expose, Type } from 'class-transformer';
import { OrganizationSubscriptionDto } from '@app/common/dto/responses/organization-subscription.dto';
import { ValidateNested } from 'class-validator';

export class OrganizationResponseDto {
	@Expose()
	organizationUuid?: string;

	@Expose()
	organizationId?: number;

	@Expose()
	isActive?: boolean;

	@Expose()
	name: string;

	@Expose()
	isVerified?: boolean;

	@Expose()
	email?: string;

	@Expose()
	govRegistrationNumber?: string;

	@Expose()
	countryPhoneCode?: string;

	@Expose()
	phoneNumber?: string;

	@Expose()
	street?: string;

	@Expose()
	addressLine2?: string;

	@Expose()
	state?: string;

	@Expose()
	city?: string;

	@Expose()
	country?: string;

	@Expose()
	postalCode?: string;

	@Expose()
	companyType?: string;

	@Expose()
	createdDate?: Date;

	@Expose()
	updatedDate?: Date;

	@Expose()
	website?: string;

	@Expose()
	logoUrl?: string;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => OrganizationSubscriptionDto)
	subscriptions?: OrganizationSubscriptionDto[];

	@Expose()
	settings?: Record<string, any>;
}

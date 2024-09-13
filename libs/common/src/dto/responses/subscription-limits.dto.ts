import { Expose } from 'class-transformer';

export class SubscriptionLimitsDto {
	@Expose()
	propertyLimit: number;
	@Expose()
	unitLimit: number;
	@Expose()
	userLimit: number;
	@Expose()
	documentStorageLimit: number;
}

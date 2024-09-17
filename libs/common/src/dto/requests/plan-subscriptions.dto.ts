import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class SubscribeToPlanDto {
	@IsNumber()
	@IsNotEmpty()
	newPlanId: number;

	@IsString()
	@IsNotEmpty()
	paymentFrequency: 'monthly' | 'annual';
}

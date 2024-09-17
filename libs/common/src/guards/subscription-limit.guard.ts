import {
	CanActivate,
	ExecutionContext,
	Injectable,
	PreconditionFailedException,
} from '@nestjs/common';
import { OrganizationSubscriptionService } from '../services/organization-subscription.service';
import { Reflector } from '@nestjs/core/services/reflector.service';
import { AppFeature } from '../config/config.constants';
import { FEATURES_KEY } from '@app/auth/decorators/auth.decorator';
import { ErrorMessages } from '../config/error.constant';

@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly organizationSubscriptionService: OrganizationSubscriptionService,
	) {}

	/**
	 * @description Check if the user has a valid subscription
	 * @param context
	 * @returns {boolean}
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const feature = this.reflector.get<AppFeature>(
			FEATURES_KEY,
			context.getClass(),
		);
		const request = context.switchToHttp().getRequest();
		const organizationUuId = request.user.organizationId;
		if (feature === AppFeature.PROPERTY) {
			const canAddProperty =
				await this.organizationSubscriptionService.canAddProperty(
					organizationUuId,
				);
			if (!canAddProperty) {
				throw new PreconditionFailedException(
					ErrorMessages.PROPERTY_LIMIT_REACHED,
				);
			}
			return canAddProperty;
		}
		return true;
	}
}

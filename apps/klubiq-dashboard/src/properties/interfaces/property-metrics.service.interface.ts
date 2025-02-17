import {
	PropertyMetrics,
	//RentOverdueLeaseDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';
export const PROPERTY_METRICS = 'PROPERTY METRICS';

export interface IPropertyMetrics {
	getTotalUnits(organizationUuid: string): Promise<number>;
	getTotalMaintenanceUnits(
		organizationUuid: string,
		days?: number,
	): Promise<number>;
	getPropertyMetricsByOrganization(
		organizationUuid: string,
		days?: number,
	): Promise<PropertyMetrics>;
}

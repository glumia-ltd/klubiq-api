import { PropertyMetrics } from '@app/common/dto/responses/property-metrics.dto';

export const PROPERTY_METRICS = 'PROPERTY METRICS';

export interface IPropertyMetrics {
	getTotalUnits(organizationUuid: string): Promise<number>;
	getTotalVacantUnits(organizationUuid: string): Promise<number>;
	getTotalOccupiedUnits(organizationUuid: string): Promise<number>;
	getTotalMaintenanceUnits(organizationUuid: string): Promise<number>;
	getPropertyMetricsByOrganization(
		organizationUuid: string,
	): Promise<PropertyMetrics>;
}

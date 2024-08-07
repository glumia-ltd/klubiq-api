import {
	PropertyMetrics,
	RentOverdueLeaseDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';

export const PROPERTY_METRICS = 'PROPERTY METRICS';

export interface IPropertyMetrics {
	getTotalUnits(organizationUuid: string): Promise<number>;
	//getTotalVacantUnits(organizationUuid: string): Promise<number>;
	getTotalOccupiedUnits(
		organizationUuid: string,
		days?: number,
	): Promise<number>;
	getTotalMaintenanceUnits(
		organizationUuid: string,
		days?: number,
	): Promise<number>;
	getPropertyMetricsByOrganization(
		organizationUuid: string,
		days?: number,
	): Promise<PropertyMetrics>;
	getTotalOverdueRents(organizationUuid: string): Promise<RentOverdueLeaseDto>;
}

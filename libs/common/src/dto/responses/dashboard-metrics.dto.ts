export interface DashboardMetricsDto {
	propertyMetrics?: PropertyMetrics;
	leaseMetrics?: LeaseMetricsDto;
	transactionMetrics?: TransactionMetricsDto;
	monthlyRevenue?: MonthlyRevenueDto;
	revenueMetrics?: RevenueResponseDto;
}
export interface PropertyMetrics {
	totalUnits?: number;
	occupiedUnits?: number;
	vacantUnits?: number;
	maintenanceUnits?: number;
	totalProperties?: number;
	occupancyRate?: number;
	occupancyRatePercentageDifference?: number;
	occupancyRateChangeIndicator: 'positive' | 'negative' | 'neutral';
	multiUnits?: number;
	singleUnits?: number;
	occupancyRateLastMonth?: number;
	maintenanceUnitsLastMonth?: number;
	rentOverdue?: RentOverdueLeaseDto;
	maintenanceUnitsPercentageDifference?: number;
	maintenanceUnitsChangeIndicator: 'positive' | 'negative' | 'neutral';
}

export interface LeaseMetricsDto {
	rentOverdueFees?: number;
	rentOverdueCount?: number;
}
export interface TransactionMetricsDto {
	totalExpenses?: number;
	netCashFlow?: number;
	totalExpensesLastMonth?: number;
	netCashFlowLastMonth?: number;
	totalExpensesPercentageDifference?: number;
	netCashFlowPercentageDifference?: number;
	totalExpensesChangeIndicator: 'positive' | 'negative' | 'neutral';
	netCashFlowChangeIndicator: 'positive' | 'negative' | 'neutral';
	todaysRevenue?: number;
	dailyRevenuePercentageDifference?: number;
	dailyRevenueChangeIndicator: 'positive' | 'negative' | 'neutral';
}

export interface MonthlyRevenueDto {
	month?: string; // 'MM' format for simplicity
	revenue?: {
		[revenueType: string]: number; // Revenue amount grouped by revenue type
	};
}

export interface RevenueResponseDto {
	maxRevenue?: number; // Maximum revenue value for Y-Axis scaling
	monthlyRevenues?: MonthlyRevenueDto[]; // Array of monthly revenue data
	totalRevenueLast12Months?: number; // Total revenue for the last 12 months
	percentageDifference: number; // Percentage difference from last year
	changeIndicator: 'positive' | 'negative' | 'neutral'; // Indicator of positive or negative change
	revenueChart?: RevenueChartDto;
}

export interface RevenueChartDto {
	xAxisData: string[];
	seriesData: {
		name: string;
		data: number[];
	}[];
}
export interface RentOverdueLeaseDto {
	overDueLeaseCount?: number;
	overDueRentSum?: number;
}

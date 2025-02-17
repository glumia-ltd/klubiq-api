import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DateTime } from 'luxon';
import {
	RevenueResponseDto,
	MonthlyRevenueDto,
	RevenueChartDto,
	TransactionMetricsDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';
import { Util } from '@app/common/helpers/util';
import { find, forEach, reduce } from 'lodash';
import {
	LeaseStatus,
	PaymentStatus,
	RevenueType,
	TransactionType,
} from '@app/common/config/config.constants';
import { XlsxFileDownloadDto } from '@app/common/dto/requests/xlsx-file-download.dto';

@Injectable()
export class DashboardRepository {
	protected readonly logger = new Logger(DashboardRepository.name);
	private readonly salesGraphColor = '#002147';
	private readonly rentalGraphColor = '#6699CC';

	constructor(
		private manager: EntityManager,
		private readonly util: Util,
	) {}

	private getQueryStringForRange(
		orgUuid: string,
		startDateStr: string,
		endDateStr: string,
	) {
		return `
			WITH date_series AS (
				SELECT generate_series(
					date_trunc('month', DATE ('${startDateStr}')),
					date_trunc('month', DATE ('${endDateStr}')),
					'1 month'::interval
				) AS month )
			SELECT 
        	        TO_CHAR(ds.month, 'YYYY-MM') as month,
        	        t."revenueType" as revenue_type,
					COALESCE(SUM(t.amount), 0) AS amount
        	    FROM
					date_series ds
				LEFT JOIN poo.transaction t ON date_trunc('month', t."transactionDate") = ds.month
        	    AND t."transactionType" = '${TransactionType.REVENUE}'
				AND t."status" = '${PaymentStatus.PAID}'
				AND t."organizationUuid" = '${orgUuid}'
				GROUP BY  ds.month, t."revenueType"
			    ORDER BY ds.month ASC, t."revenueType";
			`;
	}
	async getMonthlyRevenueData(
		orgUuid: string,
		startDateStr: string | null,
		endDateStr: string | null,
	): Promise<RevenueResponseDto> {
		try {
			const rawResult = await this.manager.query(
				this.getQueryStringForRange(orgUuid, startDateStr, endDateStr),
			);

			const totalRevenueLast12Months =
				reduce(
					rawResult,
					(sum, revenue) => sum + parseFloat(revenue.amount),
					0,
				) || 0;

			const totalRevenuePrevious12MonthsResult = await this.manager.query(
				`WITH monthly_total_revenue AS (
					SELECT COALESCE(SUM(t.amount), 0) AS total_amount
					FROM generate_series(date_trunc('month', ('${startDateStr}'::DATE - INTERVAL '11 months')),
                        date_trunc('month', ('${endDateStr}'::DATE - INTERVAL '11 months')),
                        '1 month') AS month
					LEFT JOIN poo.transaction t ON date_trunc('month', t."transactionDate") = month
					AND t."transactionType" = '${TransactionType.REVENUE}'
					AND t."status" = '${PaymentStatus.PAID}'
					AND t."organizationUuid" = '${orgUuid}'
    				GROUP BY month
				) SELECT SUM(total_amount) as total_revenue_previous12_months FROM monthly_total_revenue;`,
			);
			const totalRevenuePrevious12Months = parseFloat(
				totalRevenuePrevious12MonthsResult[0].total_revenue_previous12_months ||
					0,
			);
			const percentageDifference =
				totalRevenuePrevious12Months > 0 && totalRevenueLast12Months > 0
					? this.util.getPercentageIncreaseOrDecrease(
							totalRevenuePrevious12Months,
							totalRevenueLast12Months,
						)
					: 0;
			const changeIndicator =
				percentageDifference > 0
					? 'positive'
					: percentageDifference < 0
						? 'negative'
						: 'neutral';
			const monthlyRevenueMap: {
				[month: string]: { [revenueType: string]: number };
			} = {};
			let maxRevenue = 0;
			const revenueChartData: RevenueChartDto = {
				xAxisData: [],
				seriesData: [],
			};
			rawResult.forEach((row: any) => {
				const month = DateTime.fromISO(row.month).monthShort;
				const revenueType = row.revenue_type ?? RevenueType.PROPERTY_RENTAL;
				const totalRevenue = parseFloat(row.amount);
				if (!monthlyRevenueMap[row.month]) {
					monthlyRevenueMap[row.month] = {};
				}
				monthlyRevenueMap[row.month][revenueType] = totalRevenue;
				if (totalRevenue > maxRevenue) {
					maxRevenue = totalRevenue;
				}
				revenueChartData.xAxisData.push(month);
				const seriesData = find(revenueChartData.seriesData, {
					label: revenueType,
				});
				if (!seriesData) {
					revenueChartData.seriesData.push({
						label: revenueType,
						data: [totalRevenue],
						color: this.getGraphColor(revenueType),
						stack: 'A',
					});
				} else {
					seriesData.data.push(totalRevenue);
				}
			});
			const monthlyRevenueData: MonthlyRevenueDto[] = Object.keys(
				monthlyRevenueMap,
			).map((month: string) => {
				const revenueMap = monthlyRevenueMap[month];
				return {
					month,
					revenue: revenueMap,
				};
			});

			return {
				maxRevenue,
				monthlyRevenues: monthlyRevenueData,
				totalRevenueLast12Months,
				percentageDifference,
				changeIndicator,
				revenueChart: revenueChartData,
			};
		} catch (err) {
			console.error('error in getTransactionRevenue', err.message);
			this.logger.error(
				err,
				`Error getting monthly revenue data for Org: ${orgUuid}`,
				err.message,
			);
			throw err;
		}
	}
	getGraphColor(revenueType: any): string {
		switch (revenueType) {
			case RevenueType.PROPERTY_RENTAL:
				return this.rentalGraphColor;
			case RevenueType.PROPERTY_SALES:
				return this.salesGraphColor;
			default:
				return this.salesGraphColor;
		}
	}

	/**
	 * Gets the transaction metrics data for the given organization.
	 * @param orgUuid The uuid of the organization.
	 * @returns The transaction metrics data.
	 */
	async getTransactionMetricsData(
		orgUuid: string,
	): Promise<TransactionMetricsDto> {
		try {
			let totalExpensesMTD: number = 0,
				totalExpensesPreviousMTD: number = 0,
				totalRevenueMTD: number = 0,
				totalRevenuePreviousMTD: number = 0;
			const totalTransactionsMTDResult = await this.manager.query(
				`SELECT
					t."transactionType" as transaction_type,
						SUM(t.amount) as total_amount
					FROM
					poo.transaction t
					WHERE
					t."transactionDate" >= (CURRENT_DATE - INTERVAL '30 days')
                AND t."organizationUuid" = '${orgUuid}'
				AND t."status" = '${PaymentStatus.PAID}'
            	GROUP BY t."transactionType"; `,
			);
			const totalTransactionsPreviousMTDResult = await this.manager.query(
				`SELECT
					t."transactionType" as transaction_type,
						SUM(t.amount) as total_amount
					FROM
					poo.transaction t
					WHERE
					t."transactionDate" >= (CURRENT_DATE - INTERVAL '60 days')
                AND t."transactionDate" < (CURRENT_DATE - INTERVAL '30 days')
                AND t."organizationUuid" = '${orgUuid}'
				AND t."status" = '${PaymentStatus.PAID}'
            	GROUP BY t."transactionType"; `,
			);
			totalTransactionsMTDResult.forEach((row: any) => {
				if (row.transaction_type === TransactionType.REVENUE) {
					totalRevenueMTD = parseFloat(row.total_amount || 0);
				} else if (row.transaction_type === TransactionType.EXPENSE) {
					totalExpensesMTD = parseFloat(row.total_amount || 0);
				}
			});
			totalTransactionsPreviousMTDResult.forEach((row: any) => {
				if (row.transaction_type === TransactionType.REVENUE) {
					totalRevenuePreviousMTD = parseFloat(row.total_amount || 0);
				} else if (row.transaction_type === TransactionType.EXPENSE) {
					totalExpensesPreviousMTD = parseFloat(row.total_amount || 0);
				}
			});
			const revenuePercentageDifference =
				totalRevenuePreviousMTD > 0 && totalRevenueMTD > 0
					? this.util.getPercentageIncreaseOrDecrease(
							totalRevenuePreviousMTD,
							totalRevenueMTD,
						)
					: 0;
			const revenueChangeIndicator =
				totalRevenueMTD > totalRevenuePreviousMTD
					? 'positive'
					: totalRevenueMTD < totalRevenuePreviousMTD
						? 'negative'
						: 'neutral';
			const expensesPercentageDifference =
				totalExpensesPreviousMTD > 0 && totalExpensesMTD > 0
					? this.util.getPercentageIncreaseOrDecrease(
							totalRevenuePreviousMTD,
							totalRevenueMTD,
						)
					: 0;
			const expensesChangeIndicator =
				totalExpensesPreviousMTD > totalExpensesMTD
					? 'positive'
					: totalExpensesPreviousMTD < totalExpensesMTD
						? 'negative'
						: 'neutral';
			const netCashFlowMTD = totalRevenueMTD - totalExpensesMTD;
			const netCashFlowPreviousMTD =
				totalRevenuePreviousMTD - totalExpensesPreviousMTD;
			const netCashFlowPercentageDifference =
				netCashFlowPreviousMTD > 0 && netCashFlowMTD > 0
					? this.util.getPercentageIncreaseOrDecrease(
							netCashFlowPreviousMTD,
							netCashFlowMTD,
						)
					: 0;
			const cashFlowChangeIndicator =
				netCashFlowMTD > netCashFlowPreviousMTD
					? 'positive'
					: netCashFlowMTD < netCashFlowPreviousMTD
						? 'negative'
						: 'neutral';
			const transactionMetricsData: TransactionMetricsDto = {
				totalExpenses: totalExpensesMTD,
				totalRevenue: totalRevenueMTD,
				netCashFlow: netCashFlowMTD,
				totalExpensesLastMonth: totalExpensesPreviousMTD,
				totalRevenueLastMonth: totalRevenuePreviousMTD,
				netCashFlowLastMonth: netCashFlowPreviousMTD,
				totalExpensesPercentageDifference: expensesPercentageDifference,
				netCashFlowPercentageDifference: netCashFlowPercentageDifference,
				totalExpensesChangeIndicator: expensesChangeIndicator,
				netCashFlowChangeIndicator: cashFlowChangeIndicator,
				totalRevenueChangeIndicator: revenueChangeIndicator,
				totalRevenuePercentageDifference: revenuePercentageDifference,
			};
			return transactionMetricsData;
		} catch (error) {
			console.error('error in getTransactionMetrics', error.message);
			throw new Error(error.message);
		}
	}

	async getRevenueDataForDownload(
		orgUuid: string,
		startDateStr: string,
		endDateStr: string,
	): Promise<XlsxFileDownloadDto[]> {
		try {
			const xlsxData: XlsxFileDownloadDto[] = [];
			const rawResult = await this.manager.query(
				this.getQueryStringForRange(orgUuid, startDateStr, endDateStr),
			);
			forEach(rawResult, (row: any) => {
				const revenueType = row.revenue_type;
				const monthYear = DateTime.fromISO(row.month).toFormat(`MMM yyyy`);
				if (revenueType) {
					const revenueData = find(xlsxData, {
						sheetName: revenueType,
					});
					if (!revenueData) {
						xlsxData.push({
							sheetName: revenueType,
							data: [
								{
									'Month and Year': monthYear,
									Amount: row.amount,
								},
							],
						});
					} else {
						revenueData.data.push({
							'Month and Year': monthYear,
							Amount: row.amount,
						});
					}
				}
			});
			return xlsxData;
		} catch (error) {
			console.error('error in getRevenueDataForDownload', error.message);
			throw new Error(error.message);
		}
	}

	async getActiveLeaseCount(
		orgUuid: string,
		pastDays: number = 0,
	): Promise<number> {
		try {
			const interval = `'${pastDays} days'`;
			const activeLeaseCount = await this.manager.query(`
				SELECT COUNT(*) AS active_lease_count
				FROM poo.lease 
				WHERE "organizationUuid" = '${orgUuid}' 
				AND (status = '${LeaseStatus.ACTIVE}')
				AND ("startDate" <= (CURRENT_DATE - INTERVAL ${interval}))
				AND ("endDate" >=  (CURRENT_DATE - INTERVAL ${interval})); 
			`);
			const activeLeaseCountForPeriod = parseInt(
				activeLeaseCount[0]?.active_lease_count,
			);
			return activeLeaseCountForPeriod || 0;
		} catch (error) {
			console.error('error in getActiveLeaseCount', error.message);
			throw new Error(error.message);
		}
	}
	async getExpiringLeases(orgUuid: string, days: number = 30): Promise<number> {
		try {
			const expiringLeaseCount = await this.manager.query(`
				SELECT COUNT(*) AS expiring_lease_count
				FROM poo.lease 
				WHERE "organizationUuid" = '${orgUuid}' 
				AND (status = '${LeaseStatus.EXPIRING}')
				AND("endDate" BETWEEN  CURRENT_DATE AND(CURRENT_DATE + INTERVAL '${days} days')); 
			`);
			const expiringLeaseCountForPeriod = parseInt(
				expiringLeaseCount[0]?.expiring_lease_count,
			);
			return expiringLeaseCountForPeriod || 0;
		} catch (error) {
			console.error('error in getExpiringLeases', error.message);
			throw new Error(error.message);
		}
	}

	async getTenantCount(orgUuid: string): Promise<number> {
		try {
			const tenantCount = await this.manager.query(`
				SELECT COUNT(DISTINCT lt."tenantId" ) AS tenant_count
				FROM poo.leases_tenants lt 
				JOIN poo.lease lease ON lease.id = lt."leaseId"
				AND lease."organizationUuid" = '${orgUuid}'
				WHERE lease.status = '${LeaseStatus.ACTIVE}' OR lease.status = '${LeaseStatus.EXPIRING}'; 
			`);
			const totalTenantCount = parseInt(tenantCount[0]?.tenant_count);
			return totalTenantCount || 0;
		} catch (error) {
			console.error('error in getTenantCount', error.message);
			throw new Error(error.message);
		}
	}

	async getAverageLeaseDuration(orgUuid: string): Promise<number> {
		try {
			const avgLeaseDuration = await this.manager.query(`
				SELECT AVG(EXTRACT(DAY FROM AGE("endDate","startDate"))) AS avg_lease_duration
				FROM poo.lease
				WHERE "organizationUuid" = '${orgUuid}' AND (status = '${LeaseStatus.ACTIVE}' OR status = '${LeaseStatus.EXPIRING}');
			`);
			const averageLeaseDuration = parseInt(
				avgLeaseDuration[0]?.avg_lease_duration,
			);
			return averageLeaseDuration || 0;
		} catch (error) {
			console.error('error in getAverageLeaseDuration', error.message);
			throw new Error(error.message);
		}
	}
}

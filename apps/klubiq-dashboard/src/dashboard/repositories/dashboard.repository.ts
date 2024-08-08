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
import { find } from 'lodash';
import { TransactionType } from '@app/common';

@Injectable()
export class DashboardRepository {
	protected readonly logger = new Logger(DashboardRepository.name);
	constructor(
		private manager: EntityManager,
		private readonly util: Util,
	) {}

	async getMonthlyRevenueData(orgUuid: string): Promise<RevenueResponseDto> {
		const rawResult = await this.manager.query(
			`SELECT 
                DATE_TRUNC('month', t."transactionDate") as month,
                t."revenueType" as revenue_type,
                SUM(t.amount) as amount
            FROM
                poo.transaction t
            WHERE
                t."transactionType" = '${TransactionType.REVENUE}'
                AND t."transactionDate" >= (CURRENT_DATE - INTERVAL '12 months')
                AND t."organizationUuid" = '${orgUuid}'
            GROUP BY
                month,
                t."revenueType"
            ORDER BY
                month ASC, t."revenueType";`,
		);
		const totalRevenueLast12MonthsResult = await this.manager.query(
			`SELECT
                SUM(t.amount) as total_revenue_last12_months
            FROM
                poo.transaction t
            WHERE
                t."transactionType" = '${TransactionType.REVENUE}'
                AND t."transactionDate" >= (CURRENT_DATE - INTERVAL '12 months')
                AND t."organizationUuid" = '${orgUuid}';`,
		);
		const totalRevenueLast12Months = parseFloat(
			totalRevenueLast12MonthsResult[0].total_revenue_last12_months || 0,
		);
		const totalRevenuePrevious12MonthsResult = await this.manager.query(
			`SELECT
                SUM(t.amount) as total_revenue_previous12_months
            FROM
                poo.transaction t
            WHERE
                t."organizationUuid" = '${orgUuid}'
                AND t."transactionType" = '${TransactionType.REVENUE}'
                AND t."transactionDate" >= (CURRENT_DATE - INTERVAL '24 months')
                AND t."transactionDate" < (CURRENT_DATE - INTERVAL '12 months');`,
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
			const month = DateTime.fromSQL(row.month).toFormat('MMM');
			const revenueType = row.revenue_type;
			const totalRevenue = parseFloat(row.amount);
			if (!monthlyRevenueMap[month]) {
				monthlyRevenueMap[month] = {};
			}
			monthlyRevenueMap[month][revenueType] = totalRevenue;
			if (totalRevenue > maxRevenue) {
				maxRevenue = totalRevenue;
			}
			revenueChartData.xAxisData.push(month);
			const seriesData = find(revenueChartData.seriesData, {
				name: revenueType,
			});
			if (!seriesData) {
				revenueChartData.seriesData.push({
					name: revenueType,
					data: [totalRevenue],
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
	}

	async getTransactionMetricsData(
		orgUuid: string,
	): Promise<TransactionMetricsDto> {
		try {
			let totalExpensesMTD: number = 0,
				totalExpensesPreviousMTD: number = 0,
				totalRevenueMTD: number = 0,
				totalRevenuePreviousMTD: number = 0;
			const todaysRevenuerResult = await this.manager.query(
				`SELECT
                SUM(t.amount) as total_revenue
            FROM
                poo.transaction t
            WHERE
                t."transactionType" = '${TransactionType.REVENUE}'
                AND t."transactionDate" = CURRENT_DATE
                AND t."organizationUuid" = '${orgUuid}';`,
			);
			const yesterdayRevenueResult = await this.manager.query(
				`SELECT
                SUM(t.amount) as total_revenue
            FROM
                poo.transaction t
            WHERE
                t."transactionType" = '${TransactionType.REVENUE}'
                AND t."transactionDate" = (CURRENT_DATE - INTERVAL '1 day')
                AND t."organizationUuid" = '${orgUuid}';`,
			);
			const totalTransactionsMTDResult = await this.manager.query(
				`SELECT
                t."transactionType" as transaction_type,
                SUM(t.amount) as total_amount
            FROM
                poo.transaction t
            WHERE
                t."transactionDate" >= (CURRENT_DATE - INTERVAL '30 days')
                AND t."organizationUuid" = '${orgUuid}'
            GROUP BY t."transactionType";`,
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
            GROUP BY t."transactionType";`,
			);
			const todaysRevenue = parseFloat(
				todaysRevenuerResult[0].total_revenue || 0,
			);
			const yesterdayRevenue = parseFloat(
				yesterdayRevenueResult[0].total_revenue || 0,
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
			const dailyRevenuePercentageDifference =
				yesterdayRevenue > 0 && todaysRevenue > 0
					? this.util.getPercentageIncreaseOrDecrease(
							yesterdayRevenue,
							todaysRevenue,
						)
					: 0;

			const dailyRevenueChangeIndicator =
				todaysRevenue > yesterdayRevenue
					? 'positive'
					: todaysRevenue < yesterdayRevenue
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
				netCashFlow: netCashFlowMTD,
				totalExpensesLastMonth: totalExpensesPreviousMTD,
				netCashFlowLastMonth: netCashFlowPreviousMTD,
				totalExpensesPercentageDifference: expensesPercentageDifference,
				netCashFlowPercentageDifference: netCashFlowPercentageDifference,
				totalExpensesChangeIndicator: expensesChangeIndicator,
				netCashFlowChangeIndicator: cashFlowChangeIndicator,
				todaysRevenue,
				dailyRevenuePercentageDifference,
				dailyRevenueChangeIndicator,
			};
			return transactionMetricsData;
		} catch (error) {
			throw new Error(error);
		}
	}
}

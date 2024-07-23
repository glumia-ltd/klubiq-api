import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DateTime } from 'luxon';
import {
	RevenueResponseDto,
	MonthlyRevenueDto,
	RevenueChartDto,
} from '@app/common/dto/responses/dashboard-metrics.dto';
import { Util } from '@app/common/helpers/util';
import { find } from 'lodash';

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
                t."revenueType",
                SUM(t.amount) as amount
            FROM
                poo.transaction t
            WHERE
                t."transactionType" = 'Revenue'
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
                SUM(t.amount) as totalRevenueLast12Months
            FROM
                poo.transaction t
            WHERE
                t."transactionType" = 'Revenue'
                AND t."transactionDate" >= (CURRENT_DATE - INTERVAL '12 months')
                AND t."organizationUuid" = '${orgUuid}';`,
		);
		const totalRevenueLast12Months = parseFloat(
			totalRevenueLast12MonthsResult[0].totalRevenueLast12Months || 0,
		);
		const totalRevenuePrevious12MonthsResult = await this.manager.query(
			`SELECT
                SUM(t.amount) as totalRevenuePrevious12Months
            FROM
                poo.transaction t
            WHERE
                t."organizationUuid" = '${orgUuid}'
                AND t."transactionType" = 'Revenue'
                AND t."transactionDate" >= (CURRENT_DATE - INTERVAL '24 months')
                AND t."transactionDate" < (CURRENT_DATE - INTERVAL '12 months');`,
		);
		const totalRevenuePrevious12Months = parseFloat(
			totalRevenuePrevious12MonthsResult[0].totalRevenuePrevious12Months || 0,
		);
		const percentageDifference =
			totalRevenuePrevious12Months > 0
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
			const revenueType = row.revenueType;
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
}

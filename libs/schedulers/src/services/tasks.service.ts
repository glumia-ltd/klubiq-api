import { LeaseStatus, UnitStatus } from '@app/common/config/config.constants';
import { LeasePaymentTotalView } from '@app/common/database/entities/lease-payement.view';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class TasksService {
	constructor(private readonly entityManager: EntityManager) {}

	async getDeletedFilesCount() {
		return await this.entityManager
			.createQueryBuilder(PropertyImage, 'pi')
			.where('pi.isArchived = :isArchived', { isArchived: true })
			.andWhere('pi.fileSize = :fileSize', { fileSize: 0 })
			.getCount();
	}
	async getDeletedFilesRecord(page: number) {
		const result = await this.entityManager
			.createQueryBuilder(PropertyImage, 'pi')
			.select('pi.externalId')
			.where('pi.isArchived = :isArchived', { isArchived: true })
			.andWhere('pi.fileSize = :fileSize', { fileSize: 0 })
			.skip(page - 1)
			.take(100)
			.getRawMany();
		return result;
	}

	async deleteRecords() {
		await this.entityManager
			.createQueryBuilder()
			.delete()
			.from(PropertyImage)
			.where('isArchived = :isArchived', { isArchived: true })
			.andWhere('fileSize = :fileSize', { fileSize: 0 })
			.execute();
	}
	async refreshLeasePaymentTotalView() {
		await this.entityManager.query(
			'REFRESH MATERIALIZED VIEW poo.lease_payment_totals WITH DATA',
		);
	}
	async getLeasePaymentTotalView() {
		// const result = await this.entityManager.query(
		// 	`SELECT * FROM lease_payment_total_view`,
		// );
		const result = await this.entityManager
			.createQueryBuilder(LeasePaymentTotalView, 'lptv')
			.select(['lptv.leaseId', 'lptv.total_paid'])
			.getMany();
		return result;
	}

	async updateOrganizationCounters() {
		const result = await this.entityManager.query(
			'SELECT poo.update_organization_counts_batch()',
		);
		return result;
	}
	async updateLeaseStatus() {
		const result = await this.entityManager.query(
			'SELECT poo.update_lease_status()',
		);
		return result;
	}
	async updateUnitStatus() {
		const result = await this.entityManager.query(
			`WITH unit_status_update AS (
				SELECT
        			u.id AS unit_id,
        			CASE
            			WHEN EXISTS (
                			SELECT 1
                			FROM poo.lease l
                			WHERE l."unitId" = u.id
                			AND l.status IN ('${LeaseStatus.ACTIVE}', '${LeaseStatus.EXPIRING}')
            			) THEN '${UnitStatus.OCCUPIED}'::poo.unit_status_enum
            			ELSE '${UnitStatus.VACANT}'::poo.unit_status_enum
        		END AS new_status
    		FROM poo.unit u
			)		
			UPDATE poo.unit u
			SET status = unit_status_update.new_status::poo.unit_status_enum
			FROM unit_status_update
			WHERE u.id = unit_status_update.unit_id;`,
		);
		return result;
	}
}

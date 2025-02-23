import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { CreateFeaturePermissionDto } from '../dto/requests/permission-requests.dto';

@Injectable()
export class FeaturesPermissionRepository extends BaseRepository<FeaturePermission> {
	protected readonly logger = new Logger(FeaturesPermissionRepository.name);
	constructor(manager: EntityManager) {
		super(FeaturePermission, manager);
	}

	async createFeaturePermissions(
		createFeaturePermissionsDto: CreateFeaturePermissionDto,
	): Promise<FeaturePermission> {
		const featurePermissions = this.create(createFeaturePermissionsDto);
		return await this.save(featurePermissions);
	}

	async getFeaturePermissions(
		featureId: number,
		permissionId: number,
	): Promise<FeaturePermission | undefined> {
		return await this.findOne({ where: { featureId, permissionId } });
	}

	async getAllFeaturePermissions(): Promise<FeaturePermission[]> {
		return await this.find();
	}

	async deleteFeaturePermissions(
		featureId: number,
		permissionId: number,
	): Promise<void> {
		await this.delete({ featureId, permissionId });
	}
}

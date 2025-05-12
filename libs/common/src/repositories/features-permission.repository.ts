import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { CreateFeaturePermissionDto } from '../dto/requests/permission-requests.dto';
import { Feature } from '../database/entities/feature.entity';
import { Permission } from '../database/entities/permission.entity';

@Injectable()
export class FeaturesPermissionRepository extends BaseRepository<FeaturePermission> {
	protected readonly logger = new Logger(FeaturesPermissionRepository.name);
	constructor(manager: EntityManager) {
		super(FeaturePermission, manager);
	}

	async createFeaturePermissions(
		createFeaturePermissionsDto: CreateFeaturePermissionDto,
	): Promise<FeaturePermission> {
		const feature = await this.manager.findOne(Feature, {
			where: { id: createFeaturePermissionsDto.featureId },
		});
		if (!feature) {
			throw new NotFoundException('Feature not found');
		}
		const permission = await this.manager.findOne(Permission, {
			where: { id: createFeaturePermissionsDto.permissionId },
		});
		if (!permission) {
			throw new NotFoundException('Permission not found');
		}
		createFeaturePermissionsDto.description = `${feature.name}:${permission.name}`;
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

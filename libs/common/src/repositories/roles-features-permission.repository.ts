import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { RoleFeaturePermissions } from '../database/entities/role-feature-permission.entity';
import { CreateRoleFeaturePermissionDto } from '../dto/requests/permission-requests.dto';
import { FeaturePermission } from '../database/entities/feature-permission.entity';
import { OrganizationRole } from '../database/entities/organization-role.entity';

@Injectable()
export class RoleFeaturePermissionsRepository extends BaseRepository<RoleFeaturePermissions> {
	protected readonly logger = new Logger(RoleFeaturePermissionsRepository.name);
	constructor(manager: EntityManager) {
		super(RoleFeaturePermissions, manager);
	}

	async createRoleFeaturePermissions(
		createRoleFeaturePermissionsDto: CreateRoleFeaturePermissionDto,
	): Promise<RoleFeaturePermissions> {
		const role = await this.manager.findOne(OrganizationRole, {
			where: { id: createRoleFeaturePermissionsDto.roleId },
		});
		if (!role) {
			throw new NotFoundException('Role not found');
		}
		const featurePermission = await this.manager.findOne(FeaturePermission, {
			where: {
				permissionId: createRoleFeaturePermissionsDto.permissionId,
				featureId: createRoleFeaturePermissionsDto.featureId,
			},
		});
		if (!featurePermission) {
			throw new NotFoundException('Feature permission not found');
		}
		createRoleFeaturePermissionsDto.description = `${role.name}:${featurePermission.description}`;
		const roleFeaturePermissions = this.create(createRoleFeaturePermissionsDto);
		return await this.save(roleFeaturePermissions);
	}

	async getRoleFeaturePermissions(
		id: number,
	): Promise<RoleFeaturePermissions | undefined> {
		return await this.findOne({ where: { id } });
	}

	async getAllRoleFeaturePermissions(): Promise<RoleFeaturePermissions[]> {
		return await this.find();
	}

	async deleteRoleFeaturePermissions(id: number): Promise<void> {
		await this.delete({ id });
	}
}

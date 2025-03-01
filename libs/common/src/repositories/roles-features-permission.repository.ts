import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { RoleFeaturePermissions } from '../database/entities/role-feature-permission.entity';
import { CreateRoleFeaturePermissionDto } from '../dto/requests/permission-requests.dto';

@Injectable()
export class RoleFeaturePermissionsRepository extends BaseRepository<RoleFeaturePermissions> {
	protected readonly logger = new Logger(RoleFeaturePermissionsRepository.name);
	constructor(manager: EntityManager) {
		super(RoleFeaturePermissions, manager);
	}

	async createRoleFeaturePermissions(
		createRoleFeaturePermissionsDto: CreateRoleFeaturePermissionDto,
	): Promise<RoleFeaturePermissions> {
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

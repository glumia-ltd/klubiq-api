import { OrganizationRole } from '../database/entities/organization-role.entity';
import { Injectable, Logger } from '@nestjs/common';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto } from '../dto/requests/role.dto';

@Injectable()
export class OrganizationRolesRepository extends BaseRepository<OrganizationRole> {
	protected readonly logger = new Logger(OrganizationRolesRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationRole, manager);
	}

	async createRole(createRoleDto: CreateRoleDto): Promise<OrganizationRole> {
		const role = this.create(createRoleDto);
		return await this.save(role);
	}

	async getRoleById(id: number): Promise<OrganizationRole | undefined> {
		return await this.findOne({ where: { id } });
	}

	async getAllRoles(): Promise<OrganizationRole[]> {
		return await this.find();
	}

	async updateRole(
		id: number,
		updateRoleDto: UpdateRoleDto,
	): Promise<OrganizationRole | undefined> {
		await this.update(id, updateRoleDto);
		return await this.getRoleById(id);
	}

	async deleteRole(id: number): Promise<void> {
		await this.delete(id);
	}
}

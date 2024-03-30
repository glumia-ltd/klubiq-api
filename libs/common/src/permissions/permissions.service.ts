import { Injectable } from '@nestjs/common';
// import { EntityManager } from 'typeorm';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { OrganizationRolesRepository } from '../repositories/organization-roles.repository';
import { FeaturesRepository } from '../repositories/features.repository';
import { OrganizationRole } from '../database/entities/organization-role.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ViewOrgRoleDto } from '../dto/org-role.dto';

@Injectable()
export class PermissionsService {
	constructor(
		@InjectMapper() private readonly mapper: Mapper,
		private readonly permissionsRepository: PermissionsRepository,
		private readonly organizationRoleRepository: OrganizationRolesRepository,
		private readonly featuresRepository: FeaturesRepository,
	) {}

	async getOrgRoles(): Promise<ViewOrgRoleDto[]> {
		try {
			const roles = await this.organizationRoleRepository.findAll();
			console.log('Total roles: ', roles.length);
			const data = this.mapper.mapArrayAsync(
				roles,
				OrganizationRole,
				ViewOrgRoleDto,
			);
			return data;
		} catch (err) {
			console.log(err);
		}
	}
}

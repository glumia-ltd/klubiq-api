import { OrganizationRole } from '../database/entities/organization-role.entity';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { BaseRepository } from '@app/common';
import { EntityManager } from 'typeorm';
import {
	CreateRoleFeaturePermission,
	UpdateRoleFeaturePermissionDto,
} from '../dto/requests/role.dto';
import { FeaturePermission } from '../database/entities/feature-permission.entity';

@Injectable()
export class OrganizationRolesRepository extends BaseRepository<OrganizationRole> {
	protected readonly logger = new Logger(OrganizationRolesRepository.name);
	constructor(manager: EntityManager) {
		super(OrganizationRole, manager);
	}

	async saveRoleFeaturePermissions(
		roleId: number,
		updateDto: UpdateRoleFeaturePermissionDto,
	) {
		try {
			await this.manager.transaction(async (transactionalEntityManager) => {
				await transactionalEntityManager
					.createQueryBuilder()
					.update(OrganizationRole)
					.set({
						name: updateDto.name,
						alias: updateDto.alias,
						description: updateDto.description,
					})
					.where('id = :id', { id: roleId })
					.execute();

				if (!!updateDto.oldFeaturePermissionIds) {
					await transactionalEntityManager
						.createQueryBuilder()
						.relation(OrganizationRole, 'featurePermissions')
						.of(roleId)
						.remove(updateDto.oldFeaturePermissionIds);
				}
				if (!!updateDto.newFeaturePermissionIds) {
					await transactionalEntityManager
						.createQueryBuilder()
						.relation(OrganizationRole, 'featurePermissions')
						.of(roleId)
						.add(updateDto.newFeaturePermissionIds);
				}
			});
			return this.findOne({ where: { id: roleId } });
		} catch (error) {
			throw new InternalServerErrorException(
				error,
				'Error updating organization role with feature permission',
			);
		}
	}

	async createRoleWithFeaturePermission(
		createDto: CreateRoleFeaturePermission,
	) {
		try {
			let roleId: number;
			await this.manager.transaction(async (transactionalEntityManager) => {
				const result = await transactionalEntityManager
					.createQueryBuilder()
					.insert()
					.into(OrganizationRole)
					.values({
						name: createDto.name,
						alias: createDto.alias,
						description: createDto.description,
					})
					.execute();

				roleId = result.identifiers[0].id;
				if (createDto.featurePermissionIds.length > 0) {
					const featurePermissionIds = createDto.featurePermissionIds.map(
						(x) => ({ featurePermissionId: x }),
					);
					await transactionalEntityManager
						.createQueryBuilder()
						.relation(OrganizationRole, 'featurePermissions')
						.of(roleId)
						.add(featurePermissionIds);
				}
			});
			return this.findOne({ where: { id: roleId } });
		} catch (error) {
			throw new InternalServerErrorException(
				error,
				'Error creating organization role with feature permission',
			);
		}
	}

	async deleteRoleWithFeaturePermission(id: number) {
		try {
			//GET ORG ROLE BY ID
			await this.manager.transaction(async (transactionalEntityManager) => {
				const orgRole = await transactionalEntityManager.findOne(
					OrganizationRole,
					{
						relations: ['featurePermissions'],
						where: { id },
					},
				);
				if (!orgRole)
					//IF ORG ROLE DOES NOT EXIST, STOP TRANSACTION
					return;
				const featurePermissionIds = orgRole.featurePermissions.map(
					(x) => x.featurePermissionId,
				); // GET ALL THE FEATURE PERMISSION IDS

				// REMOVE THE ROLE AND FEATURE PERMISSION RELATIONSHIP
				await transactionalEntityManager
					.createQueryBuilder()
					.relation(OrganizationRole, 'featurePermissions')
					.of(id)
					.remove(orgRole.featurePermissions);
				await transactionalEntityManager.delete(OrganizationRole, id);

				if (featurePermissionIds.length)
					// IF FEATURE PERMISSION RELATIONSHIP EXIST DELETE THEM FROM THEIR TABLE
					await transactionalEntityManager.delete(
						FeaturePermission,
						featurePermissionIds,
					);
			});
		} catch (error) {
			throw new InternalServerErrorException(
				error,
				'Error deleting organization role with feature permission',
			);
		}
	}
}

import { Organization } from '@app/common/database/entities/organization.entity';
import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserRoles } from '@app/common/config/config.constants';
import { BaseRepository } from '@app/common/repositories/base.repository';
import { EntityManager } from 'typeorm';
import { UpdateOrganizationDto } from '../dto/requests/update-organization.dto';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';

@Injectable()
export class OrganizationRepository extends BaseRepository<Organization> {
	protected readonly logger = new Logger(OrganizationRepository.name);
	constructor(manager: EntityManager) {
		super(Organization, manager);
	}

	async findOneOrCreateByName(name: string, relations: string[] = []) {
		try {
			const existingEntity = await this.repository.findOne({
				where: { name: name },
				relations,
			});

			if (!existingEntity) {
				const newEntity = {
					name: name,
				};

				const createdEntity = this.repository.create(newEntity);
				const savedEntity = await this.repository.save(createdEntity);
				return savedEntity;
			}

			return existingEntity;
		} catch (error) {
			this.logger.error(
				error.message,
				error,
				'Error finding or creating entity',
			);
			throw error;
		}
	}

	async findOrgByName(
		name: string,
		orgType: string = 'company',
	): Promise<Organization> {
		let organization = await this.findOneBy({ name: name });
		if (!organization) {
			organization = await this.createEntity({ name: name, orgType });
		}
		return organization;
	}

	async softDeleteEntity(uuid: string): Promise<boolean> {
		try {
			const data = await this.softDelete({ organizationUuid: uuid });
			return data.affected > 0 ? true : false;
		} catch (err) {
			this.logger.error('Error deleting organization', err);
			throw new Error(`Error deleting organization. Error: ${err}`);
		}
	}

	async deactivateOrganization(uuid: string): Promise<Organization> {
		try {
			const org = await this.findOne({ where: { organizationUuid: uuid } });
			if (!org) {
				throw new NotFoundException('Organization not found');
			}
			if (org.isActive) {
				org.isActive = false;
				return await this.save(org);
			}
		} catch (err) {
			this.logger.error('Error deleting organization', err);
			throw new Error(`Error deleting organization. Error: ${err}`);
		}
	}

	async updateCompanyContactInfo(
		updateDto: UpdateOrganizationDto,
		orgUUID: string,
	): Promise<boolean> {
		const orgUser = await this.manager.findOneBy(OrganizationUser, {
			organizationUserUuid: updateDto.ownerId,
		});
		if (
			orgUser.organization.organizationUuid === orgUUID &&
			orgUser.orgRole.name === UserRoles.ORG_OWNER
		) {
			const updated = await this.manager.update(
				Organization,
				{ organizationUuid: orgUUID },
				{
					phoneNumber: updateDto.phoneNumber,
					street: updateDto.street,
					addressLine2: updateDto.addressLine2,
					state: updateDto.state,
					city: updateDto.city,
					postalCode: updateDto.postalCode,
					country: updateDto.country,
				},
			);
			return updated.affected > 0;
		}
		throw new UnauthorizedException(
			'Not authorized to update company contact info',
		);
	}

	async removeOrganization(uuid: string): Promise<void> {
		await this.manager.transaction(async (transactionManager) => {
			await transactionManager.update(
				OrganizationUser,
				{ organizationUuid: uuid },
				{ organization: null },
			);
			await transactionManager.delete(Organization, { organizationUuid: uuid });
		});
	}

	async getOrganizationByUUID(uuid: string): Promise<Organization> {
		const organization = await this.createQueryBuilder('organization')
			.leftJoinAndSelect('organization.settings', 'settings')
			.leftJoinAndSelect('organization.subscriptions', 'subscriptions')
			.where('organization.organizationUuid = :uuid', { uuid })
			.getOne();
		return organization;
	}
}

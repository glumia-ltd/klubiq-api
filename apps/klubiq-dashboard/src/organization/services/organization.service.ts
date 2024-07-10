import { Organization } from '../entities/organization.entity';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PageOptionsDto, PageDto, PageMetaDto } from '@app/common';
import { OrganizationResponseDto } from '../dto/organization-response.dto';
import { Console } from 'console';

@Injectable()
export class OrganizationService {
	private readonly logger = new Logger(OrganizationService.name);
	constructor(
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly organizationRepository: OrganizationRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
	) {}

	// This gets the organization by uuid
	async getOrganizationByUuId(uuid: string) {
		try {
			this.logger.verbose(`Getting organization by id: ${uuid}`);
			const org = await this.organizationRepository.findOneByCondition({
				organizationUuid: uuid,
			});
			return this.mapper.map(org, Organization, OrganizationResponseDto);
		} catch (err) {
			this.logger.error('Error getting organization', err);
			throw new Error(`Error getting organization. Error: ${err}`);
		}
	}

	// This gets the organization by id
	async getOrganizationById(id: number) {
		try {
			this.logger.verbose(`Getting organization by id: ${id}`);
			const org = await this.organizationRepository.findOneWithId({
				organizationId: id,
			});
			return this.mapper.map(org, Organization, OrganizationResponseDto);
		} catch (err) {
			this.logger.error('Error getting organization', err);
			throw new Error(`Error getting organization. Error: ${err}`);
		}
	}

	// This creates a new organization
	async create(createOrganizationDto: CreateOrganizationDto) {
		try {
			this.logger.verbose(
				`Creating new Organization. Name: ${createOrganizationDto.name}`,
			);
			const org = await this.organizationRepository.createEntity(
				createOrganizationDto,
			);
			return this.mapper.map(org, Organization, OrganizationResponseDto);
		} catch (err) {
			this.logger.error('Error creating organization', err);
			throw new Error(`Error creating organization. Error: ${err}`);
		}
	}

	// This gets all organizations WITH PAGINATION
	async findAll(pageOptionsDto: PageOptionsDto) {
		try {
			this.logger.verbose(
				`Getting all organizations. Skip: ${pageOptionsDto.skip}, Take: ${pageOptionsDto.take}`,
			);
			const queryBuilder =
				this.organizationRepository.createQueryBuilder('organization');
			queryBuilder
				.orderBy('organization.createdDate', pageOptionsDto.order)
				.skip(pageOptionsDto.skip)
				.take(pageOptionsDto.take);
			const itemCount = await queryBuilder.getCount();
			const { entities } = await queryBuilder.getRawAndEntities();
			const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
			return new PageDto(
				this.mapper.mapArray(entities, Organization, OrganizationResponseDto),
				pageMetaDto,
			);
		} catch (err) {
			this.logger.error('Error getting organizations', err);
			throw new Error(`Error getting organizations. Error: ${err}`);
		}
	}

	// This updates the organization
	async update(uuid: string, updateOrganizationDto: UpdateOrganizationDto) {
		try {
			this.logger.verbose(`Updating organization. Id: ${uuid}`);
			const orgData = this.mapper.map(
				updateOrganizationDto,
				UpdateOrganizationDto,
				Organization,
			);
			const updatedOrg = await this.organizationRepository.updateEntity(
				{ organizationUuid: uuid },
				orgData,
			);
			return this.mapper.map(updatedOrg, Organization, OrganizationResponseDto);
		} catch (err) {
			this.logger.error('Error updating organization', err);
			throw new Error(`Error updating organization. Error: ${err}`);
		}
	}

	// This soft deletes the organization
	async softDeleteOrganization(uuid: string) {
		try {
			this.logger.verbose(`Deleting organization. Uuid: ${uuid}`);
			return await this.organizationRepository.softDeleteEntity(uuid);
		} catch (err) {
			this.logger.error(`Error deleting organization - ${uuid}`, err);
			throw new Error(`Error deleting organization. Error: ${err}`);
		}
	}

	// This removes the organization
	async removeOrganization(uuid: string) {
		try {
			this.logger.verbose(`Removing organization. Uuid: ${uuid}`);
			return await this.organizationRepository.removeOrganization(uuid);
		} catch (err) {
			this.logger.error(`Error removing organization - ${uuid}`, err);
			throw new Error(`Error removing organization. Error: ${err}`);
		}
	}

	// This deactivates the organization
	async deactivateOrganization(uuid: string) {
		try {
			this.logger.verbose(`Deactivating organization. Uuid: ${uuid}`);
			return await this.organizationRepository.deactivateOrganization(uuid);
		} catch (err) {
			this.logger.error(`Error deactivating organization - ${uuid}`, err);
			throw new Error(`Error deactivating organization. Error: ${err}`);
		}
	}

	// This updates the contact details after org owner email is verified
	async updateNewCompanyContact(
		updatedDto: UpdateOrganizationDto,
		orgUuid: string,
	) {
		try {
			this.logger.verbose(`Updating new organization. Uuid: ${orgUuid}`);
			return await this.organizationRepository.updateCompanyContactInfo(
				updatedDto,
				orgUuid,
			);
		} catch (err) {
			this.logger.error(`Error updating new organization - ${orgUuid}`, err);
			throw new Error(`Error updating new organization. Error: ${err}`);
		}
	}
}

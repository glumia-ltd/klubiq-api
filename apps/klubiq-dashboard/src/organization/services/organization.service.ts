import { Organization } from '@app/common/database/entities/organization.entity';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationDto } from '../dto/requests/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/requests/update-organization.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ErrorMessages } from '@app/common/config/error.constant';
import { OrganizationResponseDto } from '../dto/responses/organization-response.dto';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { ClsService } from 'nestjs-cls';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { PageOptionsDto } from '@app/common/dto/pagination/page-options.dto';
import { PageMetaDto } from '@app/common/dto/pagination/page-meta.dto';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { CacheKeys, CacheTTl } from '@app/common/config/config.constants';

@Injectable()
export class OrganizationService {
	private readonly logger = new Logger(OrganizationService.name);
	private readonly cacheTTL = CacheTTl.FIFTEEN_MINUTES;
	constructor(
		private readonly cls: ClsService<SharedClsStore>,
		@InjectEntityManager() private entityManager: EntityManager,
		private readonly organizationRepository: OrganizationRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	private async mapPlainToClass(
		plainData: Organization,
	): Promise<OrganizationResponseDto> {
		const orgSettings = plainData.settings.settings;
		return plainToInstance(
			OrganizationResponseDto,
			{
				...plainData,
				settings: orgSettings,
			},
			{ excludeExtraneousValues: true },
		);
	}

	private async mapPlainToClassList(
		plainData: Organization[],
	): Promise<OrganizationResponseDto[]> {
		return plainToInstance(
			OrganizationResponseDto,
			plainData.map((org) => {
				const orgSettings = org.settings.settings;
				return {
					...org,
					settings: orgSettings,
				};
			}),
			{ excludeExtraneousValues: true },
		);
	}

	private getcacheKey(
		organizationUuid: string,
		cacheKeyExtension?: string,
		prefix?: string,
	) {
		return `${prefix ? `${prefix}:` : ''}${organizationUuid}:${CacheKeys.ORGANIZATION}${cacheKeyExtension ? `:${cacheKeyExtension}` : ''}`;
	}
	// This gets the organization by uuid
	async getOrganizationByUuId(uuid: string) {
		try {
			const currentUser = this.cls.get('currentUser');
			if (!currentUser) {
				throw new ForbiddenException(ErrorMessages.FORBIDDEN);
			}
			uuid = currentUser.organizationId;
			const cacheKey = this.getcacheKey(uuid);
			const cachedProperty =
				await this.cacheManager.get<OrganizationResponseDto>(cacheKey);
			if (cachedProperty) {
				return cachedProperty;
			}
			this.logger.verbose(`Getting organization by id: ${uuid}`);
			const org = await this.organizationRepository.getOrganizationByUUID(uuid);
			const orgResponse = await this.mapPlainToClass(org);
			await this.cacheManager.set(cacheKey, orgResponse, this.cacheTTL);
			return orgResponse;
		} catch (err) {
			this.logger.error('Error getting organization', err);
			throw new Error(`Error getting organization. Error: ${err}`);
		}
	}

	async getOrganizationCsrfToken(id: string, isIdentifierUuid?: boolean) {
		try {
			if (!id) {
				throw new BadRequestException(ErrorMessages.BAD_REQUEST);
			}
			const cacheKey = this.getcacheKey(id, null, 'tokens');
			const cachedProperty = await this.cacheManager.get<string>(cacheKey);
			if (cachedProperty) {
				return cachedProperty;
			}
			const org = await this.entityManager
				.createQueryBuilder(Organization, 'organization')
				.where(
					isIdentifierUuid
						? 'organization.organizationUuid = :id'
						: 'organization.tenantId = :id',
					{ id },
				)
				.getOne();
			const csrfToken = org.csrfSecret;
			await this.cacheManager.set(cacheKey, csrfToken, this.cacheTTL);
			return csrfToken;
		} catch (err) {
			this.logger.error('Error getting organization CSRF token', err);
			throw new Error(`Error getting organization CSRF token. Error: ${err}`);
		}
	}

	// This creates a new organization
	async create(createOrganizationDto: CreateOrganizationDto) {
		try {
			this.logger.verbose(
				`Creating new Organization. Name: ${createOrganizationDto.name}`,
			);
			await this.organizationRepository.createEntity(createOrganizationDto);
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
			const mappedOrgList = await this.mapPlainToClassList(entities);
			return new PageDto(mappedOrgList, pageMetaDto);
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
			await this.organizationRepository.updateEntity(
				{ organizationUuid: uuid },
				orgData,
			);
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

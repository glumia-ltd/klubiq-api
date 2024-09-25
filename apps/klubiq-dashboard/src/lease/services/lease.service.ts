import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { ILeaseService } from '../interfaces/lease.interface';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { LeaseDetailsDto, LeaseDto } from '../dto/responses/view-lease.dto';
import { ClsService } from 'nestjs-cls';
import { CreateTenantDto } from '@app/common/dto/requests/create-tenant.dto';
import { ErrorMessages } from '@app/common/config/error.constant';
import { FileUploadService } from '@app/common/services/file-upload.service';
import { Lease } from '@app/common/database/entities/lease.entity';
import {
	LeaseStatus,
	PaymentFrequency,
	RENT_DUE_ON,
	UserRoles,
} from '@app/common/config/config.constants';
import { PageMetaDto } from '@app/common/dto/pagination/page-meta.dto';
import { PageDto } from '@app/common/dto/pagination/page.dto';
import { SharedClsStore } from '@app/common/dto/public/shared-clsstore';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LeaseRepository } from '../repositories/lease.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import { GetLeaseDto } from '../dto/requests/get-lease.dto';
import { ConfigService } from '@nestjs/config';
import { FileUploadDto } from '@app/common/dto/requests/file-upload.dto';
import { plainToInstance } from 'class-transformer';
import { filter } from 'lodash';
import { DateTime } from 'luxon';
@Injectable()
export class LeaseService implements ILeaseService {
	private readonly logger = new Logger(LeaseService.name);
	private readonly cacheKeyPrefix = 'leases';
	private readonly cacheTTL = 180;

	constructor(
		private readonly configService: ConfigService,
		private readonly cls: ClsService<SharedClsStore>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		@InjectRepository(LeaseRepository)
		private readonly leaseRepository: LeaseRepository,
		private readonly uploadService: FileUploadService,
	) {}
	async getOrganizationLeases(
		getLeaseDto?: GetLeaseDto,
	): Promise<PageDto<LeaseDto>> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}-${currentUser.organizationId}/${this.cls.get('requestUrl')}`;
		const cachedLeases =
			await this.cacheManager.get<PageDto<LeaseDto>>(cacheKey);
		if (cachedLeases) return cachedLeases;
		const [entities, count] = await this.leaseRepository.getOrganizationLeases(
			currentUser.organizationId,
			currentUser.uid,
			getLeaseDto,
			currentUser.organizationRole === UserRoles.ORG_OWNER,
		);
		const pageMetaDto = new PageMetaDto({
			itemCount: count,
			pageOptionsDto: getLeaseDto,
		});
		const mappedEntities = await this.mapLeaseListToDto(entities);
		const leaseData = new PageDto(mappedEntities, pageMetaDto);
		await this.cacheManager.set(cacheKey, leaseData, this.cacheTTL);
		return leaseData;
	}

	private async mapLeaseRawToDto(leases: any[]): Promise<LeaseDto[]> {
		const leaseListDto = leases.map((lease) =>
			plainToInstance(
				LeaseDto,
				{
					id: lease.id,
					rentAmount: lease.rentamount,
					startDate: lease.startdate,
					endDate: lease.enddate,
					status: lease.status,
					tenants: [
						{
							firstName: lease.tenant_firstname || null,
							lastName: lease.tenant_lastname || null,
						},
					],
					unitNumber: lease.unit_unitnumber,
					property: {
						name: lease.property_name,
						organizationUuid: lease.property_organizationuuid || null,
						managerUid: lease.property_manageruid || null,
						ownerUid: lease.property_owneruid || null,
					},
				},
				{ excludeExtraneousValues: true },
			),
		);
		return leaseListDto;
	}

	private async mapLeaseListToDto(leases: Lease[]): Promise<LeaseDto[]> {
		const leaseListDto = leases.map((lease) =>
			plainToInstance(
				LeaseDto,
				{
					id: lease.id,
					rentAmount: lease.rentAmount,
					startDate: lease.startDate,
					endDate: lease.endDate,
					status: lease.status,
					tenants: lease.tenants,
					unitNumber: lease.unit.unitNumber,
					property: lease.unit.property,
				},
				{ excludeExtraneousValues: true },
			),
		);
		return leaseListDto;
	}
	async getAllUnitLeases(unitId: number): Promise<LeaseDto[]> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}/property/${unitId}`;
		const cachedLeases = await this.cacheManager.get<LeaseDto[]>(cacheKey);
		if (cachedLeases) {
			if (currentUser.organizationRole !== UserRoles.ORG_OWNER)
				return filter(
					cachedLeases,
					(lease: LeaseDto) =>
						lease.property.managerUid !== currentUser.uid ||
						lease.property.ownerUid !== currentUser.uid,
				);
			return cachedLeases;
		}
		const leases = await this.leaseRepository.getUnitLeases(unitId);
		const mappedLeases = await this.mapLeaseRawToDto(leases);
		await this.cacheManager.set(cacheKey, mappedLeases, this.cacheTTL);
		if (currentUser.organizationRole !== UserRoles.ORG_OWNER)
			return filter(
				mappedLeases,
				(lease: LeaseDto) =>
					lease.property.managerUid !== currentUser.uid ||
					lease.property.ownerUid !== currentUser.uid,
			);
		return mappedLeases;
	}

	async getLeaseById(id: number): Promise<LeaseDetailsDto> {
		const cacheKey = `${this.cacheKeyPrefix}/${id}`;
		const cachedLease = await this.cacheManager.get<LeaseDetailsDto>(cacheKey);
		if (cachedLease) return cachedLease;
		const lease = await this.leaseRepository.getLeaseById(id);
		const mappedLease = await this.mapLeaseDetailRawToDto(lease);
		await this.cacheManager.set(cacheKey, mappedLease, this.cacheTTL);
		return mappedLease;
	}

	async updateLeaseById(
		id: number,
		leaseDto: UpdateLeaseDto,
	): Promise<LeaseDetailsDto> {
		const updatedLease = await this.leaseRepository.updateLease(id, leaseDto);
		const mappedLease = await this.mapLeaseDetailsToDto(updatedLease);
		return mappedLease;
	}

	async createLease(leaseDto: CreateLeaseDto): Promise<void> {
		if (
			leaseDto.paymentFrequency === PaymentFrequency.MONTHLY &&
			(leaseDto.rentDueDay < 1 || leaseDto.rentDueDay > 31)
		) {
			throw new BadRequestException('Rent due day must be between 1 and 31');
		}
		await this.leaseRepository.createLease(leaseDto, false);
	}

	async deleteLease(leaseId: number): Promise<void> {
		await this.leaseRepository.delete(leaseId);
	}

	async renewLease(leaseId: number): Promise<void> {
		const leaseDto: UpdateLeaseDto = {
			status: LeaseStatus.ACTIVE,
			endDate: DateTime.utc().toISO(),
		};
		await this.leaseRepository.updateLease(leaseId, leaseDto);
	}

	async addTenantToLease(
		tenantDtos: CreateTenantDto[],
		leaseId: number,
	): Promise<LeaseDetailsDto> {
		try {
			const updatedLease = await this.leaseRepository.addTenantToLease(
				tenantDtos,
				leaseId,
			);
			const mappedLease = await this.mapLeaseDetailRawToDto(updatedLease);
			return mappedLease;
		} catch (error) {
			throw new Error(error.message);
		}
	}
	async getPreSignedUploadUrlForPropertyImage(
		data: FileUploadDto,
	): Promise<string> {
		try {
			const bucketName = this.configService.get<string>(
				'PROPERTY_IMAGE_BUCKET_NAME',
			);
			const url = await this.uploadService.generatePresignedUrl(
				data,
				bucketName,
			);
			return url;
		} catch (error) {
			this.logger.error(
				`Error generating pre-signed URL for property image: ${error.message}`,
			);
			throw new Error(error.message);
		}
	}

	async terminateLease(leaseId: number): Promise<void> {
		const leaseDto: UpdateLeaseDto = {
			status: LeaseStatus.TERMINATED,
			endDate: DateTime.utc().toISO(),
		};
		await this.leaseRepository.updateLease(leaseId, leaseDto);
	}

	private async mapLeaseDetailRawToDto(lease: any): Promise<LeaseDetailsDto> {
		const rentDueRecord = RENT_DUE_ON(lease.rent_due_day, lease.start_date);
		return plainToInstance(
			LeaseDetailsDto,
			{
				id: lease.id,
				rentAmount: lease.rent_amount,
				startDate: lease.start_date,
				endDate: lease.end_date,
				status: lease.status,
				paymentFrequency: lease.payment_frequency,
				tenants: lease.tenant_first_name
					? [
							{
								firstName: lease.tenant_first_name || '',
								lastName: lease.tenant_last_name || '',
							},
						]
					: [],
				unitNumber: lease.unit_number,
				propertyName: lease.property_name,
				propertyAddress: lease.property_address,
				propertyType: lease.property_type,
				isMultiUnitProperty: lease.is_multi_unit_property,
				daysToLeaseExpires: lease.days_to_lease_expires,
				nextPaymentDate: lease.next_payment_date,
				rentDueDay: lease.rent_due_day,
				rentDueOn: rentDueRecord[lease.payment_frequency],
			},
			{ excludeExtraneousValues: true },
		);
	}

	private async mapLeaseDetailsToDto(lease: Lease): Promise<LeaseDetailsDto> {
		return plainToInstance(
			LeaseDetailsDto,
			{
				id: lease.id,
				rentAmount: lease.rentAmount,
				startDate: lease.startDate,
				endDate: lease.endDate,
				status: lease.status,
				paymentFrequency: lease.paymentFrequency,
				rentDueDay: lease.rentDueDay,
			},
			{ excludeExtraneousValues: true },
		);
	}
}

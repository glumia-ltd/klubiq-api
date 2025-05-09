import {
	BadRequestException,
	ConflictException,
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
	CacheTTl,
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
import { filter, isEmpty, isEqual } from 'lodash';
import { DateTime } from 'luxon';
import { RentOverdueLeaseDto } from '@app/common/dto/responses/dashboard-metrics.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '@app/common/event-listeners/event-models/event-constants';
import { Generators } from '@app/common/helpers/generators';
import { UserProfilesRepository } from '@app/common/repositories/user-profiles.repository';
import { ApiDebugger } from '@app/common/helpers/debug-loggers';
import { Util } from '@app/common/helpers/util';
import { PropertyAddress } from '@app/common/database/entities/property-address.entity';
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
		private readonly eventEmitter: EventEmitter2,
		private readonly generators: Generators,
		private readonly userProfilesRepository: UserProfilesRepository,
		private readonly apiDebugger: ApiDebugger,
		private readonly util: Util,
	) {}

	private async updateOrgCacheKeys(cacheKey: string) {
		const currentUser = this.cls.get('currentUser');
		const leaseListKeys =
			(await this.cacheManager.get<string[]>(
				`${currentUser.organizationId}:getLeaseListKeys`,
			)) || [];
		await this.cacheManager.set(
			`${currentUser.organizationId}:getLeaseListKeys`,
			[...leaseListKeys, cacheKey],
			this.cacheTTL,
		);
	}

	async getOrganizationLeases(
		getLeaseDto?: GetLeaseDto,
	): Promise<PageDto<LeaseDto>> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}:${currentUser.organizationId}:${this.cls.get('requestUrl')}`;
		const cachedLeases =
			await this.cacheManager.get<PageDto<LeaseDto>>(cacheKey);
		if (cachedLeases) {
			return cachedLeases;
		}
		const [entities, count] = await this.leaseRepository.getOrganizationLeases(
			currentUser.organizationId,
			currentUser.kUid,
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
		this.updateOrgCacheKeys(cacheKey);
		return leaseData;
	}

	private async mapLeaseRawToDto(leases: any[]): Promise<LeaseDto[]> {
		this.apiDebugger.log('leases: ', leases);
		this.apiDebugger.log('Tenants: ', leases[0].leasesTenants);
		return leases.map((lease) =>
			plainToInstance(
				LeaseDto,
				{
					id: lease.id,
					rentAmount: lease.rentamount,
					startDate: lease.startdate as Date,
					endDate: lease.enddate as Date,
					status: lease.status,
					name: lease.name,
					// Safely map raw tenant fields into an array of { id, profile, isPrimaryTenant } objects; use fallback values to avoid runtime errors
					tenants:
						lease.leasesTenants_tenantId != null && !isEmpty(lease.profile)
							? [
									{
										id: lease.tenant_id,
										profile: {
											firstName: lease.profile_firstname ?? '',
											lastName: lease.profile_lastname ?? '',
											email: lease.profile_email ?? '',
											profileUuid: lease.profile_profileuuid ?? '',
											profilePicUrl: lease.profile_profilepicurl ?? '',
											phoneNumber: lease.profile_phonenumber ?? '',
										},
										isPrimaryTenant: Boolean(
											lease.leasestenants_isprimarytenant,
										),
									},
								]
							: [],
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
	}

	private async mapLeaseListToDto(leases: Lease[]): Promise<LeaseDto[]> {
		const mappedLeasesPromises = leases.map(async (lease) => {
			// First resolve all tenant profiles for this lease
			const resolvedTenants = await Promise.all(
				lease.leasesTenants.map(async (leaseTenant) => {
					const tenantProfile = await Promise.resolve(
						leaseTenant.tenant.profile,
					);
					return {
						id: leaseTenant.tenantId,
						profile: {
							firstName:
								tenantProfile.firstName || leaseTenant.tenant.companyName || '',
							lastName: tenantProfile.lastName || '',
							email: tenantProfile.email || '',
							profileUuid: tenantProfile.profileUuid || '',
							profilePicUrl: tenantProfile.profilePicUrl || '',
							phoneNumber: tenantProfile.phoneNumber || '',
							companyName: leaseTenant.tenant.companyName || '',
						},
						isPrimaryTenant: leaseTenant.isPrimaryTenant,
					};
				}),
			);

			// Then create the DTO with resolved tenants
			return plainToInstance(
				LeaseDto,
				{
					id: lease.id,
					name: lease.name,
					rentAmount: lease.rentAmount,
					startDate: lease.startDate,
					endDate: lease.endDate,
					status: lease.status,
					tenants: resolvedTenants, // Now contains resolved tenant data
					unitNumber: lease.unit.unitNumber,
					unitId: lease.unit.id,
					property: lease.unit.property,
				},
				{ excludeExtraneousValues: true },
			);
		});

		// Finally, resolve all lease promises
		return Promise.all(mappedLeasesPromises);
	}
	async getAllUnitLeases(unitId: string): Promise<LeaseDto[]> {
		const currentUser = this.cls.get('currentUser');
		if (!currentUser) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		const cacheKey = `${this.cacheKeyPrefix}:property:${unitId}`;
		const cachedLeases = await this.cacheManager.get<LeaseDto[]>(cacheKey);
		if (cachedLeases) {
			if (currentUser.organizationRole !== UserRoles.ORG_OWNER) {
				return filter(
					cachedLeases,
					(lease: LeaseDto) =>
						lease.property.managerUid !== currentUser.kUid ||
						lease.property.ownerUid !== currentUser.kUid,
				);
			}
			return cachedLeases;
		}
		const leases = await this.leaseRepository.getUnitLeases(unitId);
		this.apiDebugger.log('Leases Raw: ', leases);
		//const mappedLeases = await this.mapLeaseRawToDto(leases);
		const mappedLeases = await this.mapLeaseListToDto(leases);
		await this.cacheManager.set(cacheKey, mappedLeases, this.cacheTTL);
		this.updateOrgCacheKeys(cacheKey);
		if (currentUser.organizationRole !== UserRoles.ORG_OWNER) {
			return filter(
				mappedLeases,
				(lease: LeaseDto) =>
					lease.property.managerUid !== currentUser.kUid ||
					lease.property.ownerUid !== currentUser.kUid,
			);
		}
		return mappedLeases;
	}

	async getLeaseById(id: string): Promise<LeaseDetailsDto> {
		const cacheKey = `${this.cacheKeyPrefix}:${id}`;
		const cachedLease = await this.cacheManager.get<LeaseDetailsDto>(cacheKey);
		if (cachedLease) {
			return cachedLease;
		}
		const lease = await this.leaseRepository.getLeaseById(id);
		this.apiDebugger.log('Lease Single Raw: ', lease);
		const mappedLease = await this.mapLeaseDetailsToDto(lease);
		await this.cacheManager.set(cacheKey, mappedLease, this.cacheTTL);
		this.updateOrgCacheKeys(cacheKey);
		return mappedLease;
	}

	async updateLeaseById(
		id: string,
		leaseDto: UpdateLeaseDto,
	): Promise<LeaseDetailsDto> {
		const updatedLease = await this.leaseRepository.updateLease(id, leaseDto);
		return await this.mapLeaseDetailsToDto(updatedLease);
	}

	async createLease(leaseDto: CreateLeaseDto): Promise<void> {
		if (
			leaseDto.paymentFrequency === PaymentFrequency.MONTHLY &&
			(leaseDto.rentDueDay < 1 || leaseDto.rentDueDay > 31)
		) {
			throw new BadRequestException('Rent due day must be between 1 and 31');
		}
		const currentUser = this.cls.get('currentUser');
		if (!currentUser.organizationId) {
			throw new ForbiddenException(ErrorMessages.FORBIDDEN);
		}
		leaseDto.status =
			DateTime.fromISO(leaseDto.startDate).toJSDate().getDate() >
			DateTime.utc().toJSDate().getDate()
				? LeaseStatus.INACTIVE
				: LeaseStatus.ACTIVE;
		leaseDto.rentAmount = this.generators.parseRentAmount(leaseDto.rentAmount);
		const createdLease = await this.leaseRepository.createLease(
			leaseDto,
			currentUser.organizationId,
			false,
		);
		const totalTenants =
			leaseDto.newTenants?.length || 0 + leaseDto.tenantsIds?.length || 0;
		this.emitEvent(
			EVENTS.LEASE_CREATED,
			currentUser.organizationId,
			leaseDto,
			currentUser.kUid,
			currentUser.email,
			currentUser.name,
			createdLease.id,
			totalTenants,
		);
	}

	async deleteLease(leaseId: string): Promise<void> {
		await this.leaseRepository.delete(leaseId);
	}

	async renewLease(leaseId: string): Promise<void> {
		const leaseDto: UpdateLeaseDto = {
			status: LeaseStatus.ACTIVE,
			endDate: DateTime.utc().toISO(),
		};
		await this.leaseRepository.updateLease(leaseId, leaseDto);
	}
	async getTotalOverdueRents(
		organizationUuid: string,
	): Promise<RentOverdueLeaseDto> {
		try {
			const cacheKey = `${this.cacheKeyPrefix}:overdue-metrics:${organizationUuid}`;
			const cachedOverdueRentData =
				await this.cacheManager.get<RentOverdueLeaseDto>(cacheKey);
			if (cachedOverdueRentData) {
				return cachedOverdueRentData;
			}
			const totalOverdueRents =
				await this.leaseRepository.getOverdueRentData(organizationUuid);
			await this.cacheManager.set(
				cacheKey,
				totalOverdueRents,
				CacheTTl.ONE_DAY,
			);
			this.updateOrgCacheKeys(cacheKey);
			return totalOverdueRents;
		} catch (error) {
			this.logger.error(
				error.message,
				error.stack,
				'Error getting total overdue rents',
			);
		}
	}

	async addTenantToLease(
		tenantDto: CreateTenantDto,
		leaseId: string,
	): Promise<LeaseDetailsDto> {
		try {
			const existingTenant =
				await this.userProfilesRepository.checkTenantUserExist(tenantDto.email);
			if (existingTenant) {
				throw new ConflictException(
					'This email is already in use by another tenant. Please use a different email.',
				);
			}
			const tenantDtos = [tenantDto];
			const updatedLease = await this.leaseRepository.addTenantToLease(
				tenantDtos,
				leaseId,
			);
			return await this.mapLeaseDetailsToDto(updatedLease);
		} catch (error) {
			throw new Error(error.message);
		}
	}
	async getPreSignedUploadUrlForDocuments(data: FileUploadDto): Promise<any> {
		try {
			return await this.uploadService.getUploadSignature(data);
		} catch (error) {
			this.logger.error(
				`Error generating pre-signed URL for property image: ${error.message}`,
			);
			throw new Error(error.message);
		}
	}

	async terminateLease(leaseId: string): Promise<void> {
		const leaseDto: UpdateLeaseDto = {
			status: LeaseStatus.TERMINATED,
			endDate: DateTime.utc().toISO(),
		};
		await this.leaseRepository.updateLease(leaseId, leaseDto);
	}

	async sendTenantsInvitation() {
		//TODO: Implement Logic to send invitation emails to Tenants
	}

	// private async mapLeaseDetailRawToDto(lease: any): Promise<LeaseDetailsDto> {
	// 	const rentDueRecord = RENT_DUE_ON(lease.rent_due_day, lease.start_date);
	// 	const start = DateTime.fromISO(lease.start_date);
	// 	const end = DateTime.fromISO(lease.end_date);
	// 	return plainToInstance(
	// 		LeaseDetailsDto,
	// 		{
	// 			id: lease.id,
	// 			name: lease.name,
	// 			rentAmount: lease.rent_amount,
	// 			startDate: lease.start_date,
	// 			endDate: lease.end_date,
	// 			status: lease.status,
	// 			paymentFrequency: lease.payment_frequency,
	// 			tenants: [
	// 				{
	// 					id: lease.tenant_id,
	// 					profile: {
	// 						firstName:
	// 							lease.tenant_firstname || lease.tenant_companyName || '',
	// 						lastName: lease.tenant_lastname || '',
	// 						email: lease.tenant_email || '',
	// 						profileUuid: lease.tenant_profileuuid || '',
	// 						profilePicUrl: lease.tenant_profilepicurl || '',
	// 						phoneNumber: lease.tenant_phoneNumber || '',
	// 						companyName: lease.tenant_companyName || '',
	// 					},
	// 					isPrimaryTenant: lease.leasestenants_isprimarytenant || false,
	// 				},
	// 			],
	// 			unitNumber: lease.unit_number,
	// 			propertyName: lease.property_name,
	// 			propertyAddress: lease.property_address,
	// 			propertyType: lease.property_type,
	// 			isMultiUnitProperty: lease.is_multi_unit_property,
	// 			daysToLeaseExpires: end.diff(start, 'days').days,
	// 			nextPaymentDate: lease.next_payment_date,
	// 			rentDueDay: lease.rent_due_day,
	// 			rentDueOn: rentDueRecord[lease.payment_frequency],
	// 		},
	// 		{ excludeExtraneousValues: true },
	// 	);
	// }

	private async mapLeaseDetailsToDto(lease: Lease): Promise<LeaseDetailsDto> {
		lease.startDate = new Date(lease.startDate);
		lease.endDate = new Date(lease.endDate);
		const resolvedTenants = await Promise.all(
			lease.leasesTenants.map(async (leaseTenant) => {
				const tenantProfile = await Promise.resolve(leaseTenant.tenant.profile);
				return {
					id: leaseTenant.tenantId,
					profile: {
						firstName:
							tenantProfile.firstName || leaseTenant.tenant.companyName || '',
						lastName: tenantProfile.lastName || '',
						email: tenantProfile.email || '',
						profileUuid: tenantProfile.profileUuid || '',
						profilePicUrl: tenantProfile.profilePicUrl || '',
						phoneNumber: tenantProfile.phoneNumber || '',
						companyName: leaseTenant.tenant.companyName || '',
					},
					isPrimaryTenant: leaseTenant.isPrimaryTenant,
				};
			}),
		);
		const property = await Promise.resolve(lease.unit.property);
		const startDayAndMonth = DateTime.fromJSDate(lease.startDate, {
			zone: 'utc',
		}).toFormat('LLL d');
		const startDateDay = DateTime.fromJSDate(lease.startDate, {
			zone: 'utc',
		}).weekdayLong;
		const rentDueRecord = RENT_DUE_ON(
			lease.rentDueDay,
			startDayAndMonth,
			startDateDay,
		);
		const nextRentDueDate = this.util.calculateNextRentDueDate(lease);
		this.apiDebugger.log('Next Rent Due Date: ', nextRentDueDate);
		return plainToInstance(
			LeaseDetailsDto,
			{
				id: lease.id,
				name: lease.name || null,
				rentAmount: lease.rentAmount || 0,
				startDate: lease.startDate || null,
				endDate: lease.endDate || null,
				status: lease.status || LeaseStatus.ACTIVE,
				paymentFrequency: lease.paymentFrequency || PaymentFrequency.MONTHLY,
				rentDueDay: lease.rentDueDay || null,
				nextPaymentDate: nextRentDueDate || null,
				tenants: resolvedTenants || [],
				unitNumber: lease.unit.unitNumber || null,
				propertyName: property.name || null,
				isMultiUnitProperty: property.isMultiUnit || false,
				rentDueOn: rentDueRecord[lease.paymentFrequency] || null,
				daysToLeaseExpires:
					DateTime.fromJSDate(lease.endDate, { zone: 'utc' }).diff(
						DateTime.fromJSDate(lease.startDate, { zone: 'utc' }),
						'days',
					).days || 0,
				propertyAddress: this.buildPropertyAddress(property.address) || null,
				propertyType: property.type.name || null,
			},
			{ excludeExtraneousValues: true },
		);
	}

	private buildPropertyAddress(address: PropertyAddress): string {
		let fullAddress = '';
		if (address.addressLine1) {
			fullAddress += `${address.addressLine1}, `;
		}
		if (address.addressLine2) {
			fullAddress += `${address.addressLine2}, `;
		}
		if (address.city && address.state && isEqual(address.city, address.state)) {
			fullAddress += `${address.city}, `;
		} else {
			if (address.city) {
				fullAddress += `${address.city}, `;
			}
			if (address.state) {
				fullAddress += `${address.state}, `;
			}
		}
		if (address.postalCode) {
			fullAddress += `${address.postalCode}, `;
		}
		if (address.country) {
			fullAddress += `${address.country}, `;
		}
		return fullAddress;
	}

	private emitEvent(
		event: string,
		organizationId: string,
		data: CreateLeaseDto | UpdateLeaseDto,
		currentUserId: string,
		currentUserEmail: string,
		currentUserName: string,
		leaseId?: string,
		tenantCount: number = 0,
	) {
		this.eventEmitter.emitAsync(event, {
			tenants: tenantCount,
			startDate: data.startDate,
			endDate: data.endDate,
			leaseId: leaseId,
			paymentFrequency: data.paymentFrequency,
			rent: data.rentAmount,
			unitNumber: data.unitNumber,
			leaseName: data.name,
			firstPaymentDate: data.firstPaymentDate,
			propertyName: data.propertyName,
			organizationId: organizationId,
			propertyManagerId: currentUserId,
			propertyManagerEmail: currentUserEmail,
			propertyManagerName: currentUserName,
			currency: this.cls.get('clientCurrency'),
			locale: this.cls.get('clientLocale'),
			language: this.cls.get('clientLanguage'),
		});
	}
}

import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { CacheKeys } from '../config/config.constants';

import { PropertyAmenityRepository } from '../repositories/property-amenity.repository';
import { CreateDto } from '../dto/requests/requests.dto';
import { ViewDataDto } from '../dto/responses/responses.dto';

@Injectable()
export class PropertiesAmenityService {
	private readonly logger = new Logger(PropertiesAmenityService.name);
	private readonly cacheKey = CacheKeys.PROPERTY_AMENITIES;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly propertyAmenityRepository: PropertyAmenityRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async createPropertyAmenity(createDto: CreateDto): Promise<ViewDataDto> {
		try {
			const propertyAmenity =
				await this.propertyAmenityRepository.createEntity(createDto);
			await this.cacheService.updateCacheAfterCreate<ViewDataDto>(
				this.cacheKey,
				propertyAmenity,
			);
			return propertyAmenity;
		} catch (err) {
			this.logger.error('Error creating property amenity', err);
			throw new BadRequestException(`Error creating property amenity.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async getAllPropertyAmenities(): Promise<ViewDataDto[]> {
		try {
			const cachedPropertyAmenityList =
				await this.cacheService.getCache<ViewDataDto>(this.cacheKey);
			if (!cachedPropertyAmenityList) {
				const amenities = await this.propertyAmenityRepository.findAll();
				await this.cacheService.setCache<ViewDataDto[]>(
					amenities,
					this.cacheKey,
				);
				return amenities;
			}
			return cachedPropertyAmenityList;
		} catch (err) {
			this.logger.error('Error getting property amenity list', err);
			throw new BadRequestException(`Error getting property amenity list.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async deletePropertyType(id: number): Promise<void> {
		try {
			await this.cacheService.updateCacheAfterdelete<ViewDataDto>(
				this.cacheKey,
				'id',
				id,
			);
			await this.propertyAmenityRepository.delete({ id });
		} catch (err) {
			this.logger.error('Error deleting property amenity', err);
			throw new BadRequestException(`Error deleting property amenity.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}
}

import {
	BadRequestException,
	Inject,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
	CreatePropertyMetadataDto,
	UpdatePropertyMetadataDto,
} from '../dto/requests/create-property-metadata.dto';
import { PropertyPurposeRepository } from '../repositories/properties-purpose.repository';
import { PropertyMetadataDto } from '../dto/responses/properties-metadata.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { Cache } from 'cache-manager';
import { CacheKeys } from '../config/config.constants';
import { PropertyPurpose } from '../database/entities/property-purpose.entity';

@Injectable()
export class PropertiesPurposeService {
	private readonly logger = new Logger(PropertiesPurposeService.name);
	private readonly cacheKey = CacheKeys.PROPERTY_PURPOSES;
	private readonly cacheService = new CacheService(this.cacheManager);
	constructor(
		private readonly propertyPurposeRepository: PropertyPurposeRepository,
		@InjectMapper('MAPPER') private readonly mapper: Mapper,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async createPropertyPurpose(
		createPropertyPurposeDto: CreatePropertyMetadataDto,
	): Promise<PropertyMetadataDto> {
		try {
			const { name, displayText } = createPropertyPurposeDto;
			const propertyPurpose = this.propertyPurposeRepository.create({
				name,
				displayText,
			});
			const createdPurpose =
				await this.propertyPurposeRepository.save(propertyPurpose);
			const mappedPurpose = await this.mapper.map(
				createdPurpose,
				PropertyPurpose,
				PropertyMetadataDto,
			);
			await this.cacheService.updateCacheAfterCreate<PropertyMetadataDto>(
				this.cacheKey,
				mappedPurpose,
			);
			return mappedPurpose;
		} catch (err) {
			this.logger.error('Error creating property Purpose', err);
			throw new BadRequestException(`Error creating property Purpose.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async getPropertyPurposeById(id: number): Promise<PropertyMetadataDto> {
		try {
			const propertyPurpose = await this.propertyPurposeRepository.findOneBy({
				id: id,
			});
			if (!propertyPurpose) {
				throw new NotFoundException('Property Purpose not found');
			}
			return this.mapper.map(
				propertyPurpose,
				PropertyPurpose,
				PropertyMetadataDto,
			);
		} catch (err) {
			this.logger.error('Error getting property Purpose', err);
			throw new BadRequestException(`Error getting property Purpose.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async getAllPropertyPurpose(): Promise<PropertyMetadataDto[]> {
		try {
			const cachedPropertyPurposesList =
				await this.cacheService.getCache<PropertyMetadataDto>(this.cacheKey);
			if (!cachedPropertyPurposesList) {
				const allPurposes = await this.propertyPurposeRepository.find();
				const data = await this.mapper.mapArrayAsync(
					allPurposes,
					PropertyPurpose,
					PropertyMetadataDto,
				);
				await this.cacheService.setCache<PropertyMetadataDto[]>(
					data,
					this.cacheKey,
				);
				return data;
			}
			return cachedPropertyPurposesList;
		} catch (err) {
			this.logger.error('Error getting property purpose list', err);
			throw new BadRequestException(`Error getting property purpose list.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async updatePropertyPurpose(
		id: number,
		updatePropertyPurposeDto: UpdatePropertyMetadataDto,
	): Promise<PropertyMetadataDto> {
		try {
			const propertyPurpose = await this.getPropertyPurposeById(id);
			Object.assign(propertyPurpose, updatePropertyPurposeDto);
			const updatedPurpose = await this.propertyPurposeRepository.save({
				...propertyPurpose,
				...updatePropertyPurposeDto,
			});
			await this.cacheService.updateCacheAfterUpsert<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
				updatePropertyPurposeDto,
			);
			return this.mapper.map(
				updatedPurpose,
				PropertyPurpose,
				PropertyMetadataDto,
			);
		} catch (err) {
			this.logger.error('Error updating property purpose', err);
			throw new BadRequestException(`Error updating property purpose. `, {
				cause: new Error(),
				description: err.message,
			});
		}
	}

	async deletePropertyPurpose(id: number): Promise<void> {
		try {
			const propertyPurpose = await this.getPropertyPurposeById(id);
			await this.cacheService.updateCacheAfterdelete<PropertyMetadataDto>(
				this.cacheKey,
				'id',
				id,
			);
			await this.propertyPurposeRepository.remove(propertyPurpose);
		} catch (err) {
			this.logger.error('Error deleting property purpose', err);
			throw new BadRequestException(`Error deleting property purpose.`, {
				cause: new Error(),
				description: err.message,
			});
		}
	}
}

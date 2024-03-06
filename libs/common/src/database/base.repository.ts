import { Logger, NotFoundException } from '@nestjs/common';
import {
	Repository,
	EntityTarget,
	EntityManager,
	FindOptionsWhere,
	FindManyOptions,
} from 'typeorm';

export abstract class BaseRepository<T> extends Repository<T> {
	protected abstract readonly logger: Logger;
	constructor(
		private entity: EntityTarget<T>,
		manager: EntityManager,
	) {
		super(entity, manager);
	}
	async findAll(relations: string[] = []): Promise<T[]> {
		const data = await this.find({ relations });
		if (!data) {
			this.logger.warn('No data found');
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async findByCondition(
		condition: FindOptionsWhere<T>,
		relations: string[] = [],
	): Promise<T[]> {
		const data = await this.find({ where: condition, relations });
		if (!data) {
			this.logger.warn('No data found by condition', condition);
			throw new NotFoundException('No data found');
		}
		return data;
	}
	async findOneByCondition(
		condition: FindOptionsWhere<T>,
		relations: string[] = [],
	): Promise<T> {
		const data = await this.findOne({ where: condition, relations });
		if (!data) {
			this.logger.warn('No data found by condition', condition);
			throw new NotFoundException('No data found');
		}
		return data;
	}
	async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
		const data = await this.findAndCount(options);
		if (!data) {
			this.logger.warn('No data found');
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async findOneWithId(
		id: FindOptionsWhere<T>,
		relations: string[] = [],
	): Promise<T> {
		const data = await this.findOne({ where: id, relations });
		if (!data) {
			this.logger.warn('No data found by id', id);
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async createEntity(data: T): Promise<T> {
		const entity = this.create(data);
		return this.save(entity);
	}

	async updateEntity(id: FindOptionsWhere<T>, data: T): Promise<T> {
		const entity = await this.findOne({ where: id });
		if (!entity) {
			this.logger.warn('No data found by id', id);
			throw new NotFoundException('No data found');
		}
		this.merge(entity, data);
		return this.save(entity);
	}

	async deleteEntity(id: FindOptionsWhere<T>): Promise<T> {
		const entity = await this.findOne({ where: id });
		if (!entity) {
			this.logger.warn('No data found by id', id);
			throw new NotFoundException('No data found');
		}
		return this.remove(entity);
	}
}

import { Logger, NotFoundException, Injectable } from '@nestjs/common';
import {
	Repository,
	EntityTarget,
	EntityManager,
	FindOptionsWhere,
	FindManyOptions,
	Entity,
} from 'typeorm';

@Injectable()
export abstract class BaseRepository<T> extends Repository<T> {
	protected abstract readonly logger: Logger;
	constructor(
		private entity: EntityTarget<T>,
		manager: EntityManager,
	) {
		super(entity, manager);
	}
	protected get repository(): Repository<T> {
		return this.manager.getRepository(this.entity);
	}

	async findAll(relations: string[] = []): Promise<T[]> {
		const data = await this.repository.find({ relations });
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
		const data = await this.repository.find({ where: condition, relations });
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
		const data = await this.repository.findOne({ where: condition, relations });
		if (!data) {
			this.logger.warn('No data found by condition', condition);
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
		const data = await this.repository.findAndCount(options);
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
		const data = await this.repository.findOne({ where: id, relations });
		if (!data) {
			this.logger.warn('No data found by id', id);
			throw new NotFoundException('No data found');
		}
		return data;
	}

	async createEntity(data: T): Promise<T> {
		const entity = await this.repository.create(data);
		return await this.repository.save(entity);
	}

	async updateEntity(id: FindOptionsWhere<T>, data: T): Promise<T> {
		const entity = await this.repository.findOne({ where: id });
		if (!entity) {
			this.logger.warn('No data found by id', id);
			throw new NotFoundException('No data found');
		}
		this.repository.merge(entity, data);
		return this.repository.save(entity);
	}

	async deleteEntity(id: FindOptionsWhere<T>): Promise<T> {
		const entity = await this.repository.findOne({ where: id });
		if (!entity) {
			this.logger.warn('No data found by id', id);
			throw new NotFoundException('No data found');
		}
		return this.repository.remove(entity);
	}
}

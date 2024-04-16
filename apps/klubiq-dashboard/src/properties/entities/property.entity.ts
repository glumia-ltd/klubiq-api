import {
	PropertyCategory,
	PropertyPurpose,
	PropertyStatus,
	PropertyType,
} from '@app/common';
import { AutoMap } from '@automapper/classes';
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Generated,
	Index,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	Tree,
	TreeChildren,
	TreeParent,
	UpdateDateColumn,
} from 'typeorm';
import { PropertyAddress } from './property-address.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity({ schema: 'poo' })
@Tree('closure-table', {
	closureTableName: 'property_unit',
})
export class Property {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	uuid?: string;

	@AutoMap()
	@Index()
	@Generated('increment')
	@Column({ unique: true })
	id?: number;

	@AutoMap()
	@Column({ length: 100 })
	name: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	descritption?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	note?: string;

	@AutoMap()
	@Column({ type: 'simple-array' })
	tags: string[];

	@AutoMap()
	@Column()
	isMultiUnit: boolean;

	@AutoMap()
	@Column({ type: 'decimal', precision: 3, scale: 1 })
	bedrooms: number;

	@AutoMap()
	@Column({ type: 'decimal', precision: 3, scale: 1 })
	bathrooms: number;

	@AutoMap()
	@Column({ type: 'json' })
	area: { value: number; unit: string };

	@DeleteDateColumn()
	deletedDate?: Date;

	@AutoMap()
	@Column({ default: false })
	isArchived?: boolean;

	@AutoMap()
	@Column()
	archivedDate?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

	@AutoMap(() => PropertyCategory)
	@ManyToOne(() => PropertyCategory, { eager: true })
	@JoinColumn({
		name: 'categoryId',
		referencedColumnName: 'id',
	})
	category: PropertyCategory;

	@AutoMap(() => PropertyType)
	@ManyToOne(() => PropertyType, { eager: true })
	@JoinColumn({
		name: 'typeId',
		referencedColumnName: 'id',
	})
	type: PropertyType;

	@AutoMap(() => PropertyPurpose)
	@ManyToOne(() => PropertyPurpose, { eager: true })
	@JoinColumn({
		name: 'purposeId',
		referencedColumnName: 'id',
	})
	purpose: PropertyPurpose;

	@AutoMap(() => PropertyStatus)
	@ManyToOne(() => PropertyStatus, { eager: true })
	@JoinColumn({
		name: 'statusId',
		referencedColumnName: 'id',
	})
	status: PropertyStatus;

	@AutoMap(() => PropertyAddress)
	@OneToOne(() => PropertyAddress, { eager: true, cascade: true })
	@JoinColumn()
	address: PropertyAddress;

	@AutoMap(() => Organization)
	@ManyToOne(() => Organization, { eager: true })
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization: Organization;

	@TreeParent()
	parentProperty: Property;

	@TreeChildren()
	units: Property[];
}

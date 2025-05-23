
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Generated,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { PropertyAddress } from './property-address.entity';
import { Unit } from './unit.entity';
import { PropertyCategory } from './property-category.entity';
import { PropertyType } from './property-type.entity';
import { PropertyPurpose } from './property-purpose.entity';
import { PropertyStatus } from './property-status.entity';
import { Organization } from './organization.entity';
import { PropertyImage } from './property-image.entity';
import { Maintenance } from './maintenance.entity';
import { UserProfile } from './user-profile.entity';

@Entity({ schema: 'poo' })
@Index('IDX_PROPERTY_TYPE_STATUS', ['type', 'status'])
@Index('IDX_PROPERTY_FILTER', ['name', 'purpose', 'type', 'status'])
export class Property {
	@PrimaryGeneratedColumn('uuid')
	uuid?: string;

	@Index()
	@Generated('increment')
	@Column({ unique: true, type: 'bigint' })
	id?: number;

	@Index()
	@Column({ length: 100 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'text', nullable: true })
	note?: string;

	@Column({ type: 'simple-array', nullable: true })
	tags?: string[];

	@Column({ default: false })
	isMultiUnit?: boolean;

	@DeleteDateColumn({ select: false })
	deletedDate?: Date;

	@Column({ default: false })
	isArchived?: boolean;

	@Column({ nullable: true, select: false })
	archivedDate?: Date;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdDate?: Date;

	@UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	updatedDate?: Date;

	@ManyToOne(() => PropertyCategory, { eager: true })
	@JoinColumn({
		name: 'categoryId',
		referencedColumnName: 'id',
	})
	@Index('IDX_CATEGORY', ['categoryId'])
	category?: PropertyCategory;

	@ManyToOne(() => PropertyType, { eager: true })
	@JoinColumn({
		name: 'typeId',
		referencedColumnName: 'id',
	})
	@Index('IDX_TYPE', ['typeId'])
	type?: PropertyType;

	@ManyToOne(() => PropertyPurpose, { eager: true })
	@JoinColumn({
		name: 'purposeId',
		referencedColumnName: 'id',
	})
	@Index('IDX_PURPOSE', ['purposeId'])
	purpose?: PropertyPurpose;

	@ManyToOne(() => PropertyStatus, { eager: true })
	@JoinColumn({
		name: 'statusId',
		referencedColumnName: 'id',
	})
	@Index('IDX_STATUS', ['statusId'])
	status?: PropertyStatus;

	@OneToOne(() => PropertyAddress, {
		eager: true,
		cascade: ['insert'],
		nullable: true,
	})
	@JoinColumn()
	address?: PropertyAddress;

	@Index('IDX_ORGANIZATION', ['organizationUuid'])
	@ManyToOne(() => Organization, {
		eager: true,
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization?: Organization;

	@OneToMany(() => Unit, (unit) => unit.property, {
		cascade: true,
		// onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		lazy: true,
	})
	units?: Promise<Unit[]>;

	@Column({ default: 1 })
	unitCount?: number;

	@Column({ default: false })
	isDraft?: boolean;

	@OneToMany(() => PropertyImage, (image) => image.property, {
		cascade: true,
		lazy: true,
	})
	images?: Promise<PropertyImage[]>;

	@Index('IDX_OWNER', ['ownerUid'])
	@ManyToOne(() => UserProfile, (user) => user.propertiesOwned, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'ownerUid', referencedColumnName: 'profileUuid' })
	owner?: UserProfile;

	@Index('IDX_MANAGER', ['managerUid'])
	@ManyToOne(() => UserProfile, (user) => user.propertiesManaged, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'managerUid', referencedColumnName: 'profileUuid' })
	manager?: UserProfile;

	@Column({ default: false })
	isListingPublished?: boolean;

	@OneToMany(() => Maintenance, (maintenance) => maintenance.property)
	maintenances?: Maintenance[];

	mainUnit?: Unit;
	mainPhoto?: PropertyImage;

	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
	sellingPrice?: number;

	@Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
	marketValue?: number;
}

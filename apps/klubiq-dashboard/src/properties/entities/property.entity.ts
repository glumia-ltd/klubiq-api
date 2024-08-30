import { PropertyType } from '@app/common/database/entities/property-type.entity';
import { PropertyStatus } from '@app/common/database/entities/property-status.entity';
import { PropertyPurpose } from '@app/common/database/entities/property-purpose.entity';
import { PropertyCategory } from '@app/common/database/entities/property-category.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';
import { Amenity } from '@app/common/database/entities/property-amenity.entity';
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
	OneToMany,
	OneToOne,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	JoinTable,
} from 'typeorm';
import { PropertyAddress } from './property-address.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { UserProfile } from '@app/common/database/entities/user-profile.entity';
//import { Lease } from '@app/common/database/entities/lease.entity';
import { Maintenance } from '@app/common/database/entities/maintenance.entity';
import { Unit } from './unit.entity';

@Entity({ schema: 'poo' })
@Index('IDX_PROPERTY_TYPE_STATUS', ['type', 'status'])
@Index('IDX_PROPERTY_FILTER', ['name', 'purpose', 'type', 'status'])
export class Property {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	uuid?: string;

	@AutoMap()
	@Index()
	@Generated('increment')
	@Column({ unique: true, type: 'bigint' })
	id?: number;

	@AutoMap()
	@Index()
	@Column({ length: 100 })
	name: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	description?: string;

	@AutoMap()
	@Column({ type: 'text', nullable: true })
	note?: string;

	@AutoMap()
	@Column({ type: 'simple-array', nullable: true })
	tags?: string[];

	@AutoMap()
	@Column({ default: false })
	isMultiUnit?: boolean;

	@AutoMap()
	@Column({ type: 'json', nullable: true })
	area?: { value: number; unit: string };

	@DeleteDateColumn({ select: false })
	deletedDate?: Date;

	@AutoMap()
	@Column({ default: false })
	isArchived?: boolean;

	@AutoMap()
	@Column({ nullable: true, select: false })
	archivedDate?: Date;

	@AutoMap()
	@CreateDateColumn()
	createdDate?: Date;

	@AutoMap()
	@UpdateDateColumn()
	updatedDate?: Date;

	@AutoMap(() => PropertyCategory)
	@ManyToOne(() => PropertyCategory, { eager: true })
	@JoinColumn({
		name: 'categoryId',
		referencedColumnName: 'id',
	})
	@Index('IDX_CATEGORY', ['categoryId'])
	category?: PropertyCategory;

	@AutoMap(() => PropertyType)
	@ManyToOne(() => PropertyType, { eager: true })
	@JoinColumn({
		name: 'typeId',
		referencedColumnName: 'id',
	})
	@Index('IDX_TYPE', ['typeId'])
	type?: PropertyType;

	@AutoMap(() => PropertyPurpose)
	@ManyToOne(() => PropertyPurpose, { eager: true })
	@JoinColumn({
		name: 'purposeId',
		referencedColumnName: 'id',
	})
	@Index('IDX_PURPOSE', ['purposeId'])
	purpose?: PropertyPurpose;

	@AutoMap(() => PropertyStatus)
	@ManyToOne(() => PropertyStatus, { eager: true })
	@JoinColumn({
		name: 'statusId',
		referencedColumnName: 'id',
	})
	@Index('IDX_STATUS', ['statusId'])
	status?: PropertyStatus;

	@AutoMap(() => PropertyAddress)
	@OneToOne(() => PropertyAddress, {
		eager: true,
		cascade: ['insert'],
		nullable: true,
	})
	@JoinColumn()
	address?: PropertyAddress;

	@AutoMap(() => Organization)
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

	@AutoMap(() => [Unit])
	@OneToMany(() => Unit, (unit) => unit.property, {
		cascade: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
		lazy: true,
	})
	units?: Promise<Unit[]>;

	@AutoMap()
	@Column({ default: 1 })
	unitCount?: number;

	@AutoMap(() => [Amenity])
	@ManyToMany(() => Amenity, (amenity) => amenity.properties, {
		cascade: ['insert'],
	})
	@JoinTable({
		name: 'properties_amenities',
		joinColumn: {
			name: 'propertyUuid',
			referencedColumnName: 'uuid',
		},
		inverseJoinColumn: {
			name: 'amenityId',
			referencedColumnName: 'id',
		},
	})
	amenities?: Amenity[];

	@AutoMap()
	@Column({ default: false })
	isDraft?: boolean;

	@AutoMap(() => [PropertyImage])
	@OneToMany(() => PropertyImage, (image) => image.property, {
		cascade: true,
		lazy: true,
	})
	images?: Promise<PropertyImage[]>;

	@AutoMap(() => UserProfile)
	@Index('IDX_OWNER', ['ownerUid'])
	@ManyToOne(() => UserProfile, (user) => user.propertiesOwned, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'ownerUid', referencedColumnName: 'firebaseId' })
	owner?: UserProfile;

	@AutoMap(() => UserProfile)
	@Index('IDX_MANAGER', ['managerUid'])
	@ManyToOne(() => UserProfile, (user) => user.propertiesManaged, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'managerUid', referencedColumnName: 'firebaseId' })
	manager?: UserProfile;

	@AutoMap()
	@Column({ default: false })
	isListingPublished?: boolean;

	// @AutoMap(() => [Lease])
	// @OneToMany(() => Lease, (lease) => lease.property)
	// leases?: Lease[];

	@AutoMap(() => [Maintenance])
	@OneToMany(() => Maintenance, (maintenance) => maintenance.property)
	maintenances?: Maintenance[];

	mainUnit?: Unit;
	mainPhoto?: PropertyImage;
}

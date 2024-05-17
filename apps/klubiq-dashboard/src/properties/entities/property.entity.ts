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
	Tree,
	TreeChildren,
	TreeParent,
	UpdateDateColumn,
	JoinTable,
} from 'typeorm';
import { PropertyAddress } from './property-address.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationUser } from '../../users/entities/organization-user.entity';

@Entity({ schema: 'poo' })
@Tree('closure-table', { closureTableName: 'property_unit' })
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
	isMultiUnit: boolean;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	bedroom?: number;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	bathroom?: number;

	@AutoMap()
	@Column({ type: 'decimal', nullable: true })
	toilet?: number;

	@AutoMap()
	@Column({ type: 'json', nullable: true })
	area?: { value: number; unit: string };

	@DeleteDateColumn()
	deletedDate?: Date;

	@AutoMap()
	@Column({ default: false })
	isArchived?: boolean;

	@AutoMap()
	@Column({ nullable: true })
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
	purpose?: PropertyPurpose;

	@AutoMap(() => PropertyStatus)
	@ManyToOne(() => PropertyStatus, { eager: true })
	@JoinColumn({
		name: 'statusId',
		referencedColumnName: 'id',
	})
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
	@ManyToOne(() => Organization, { eager: true })
	@JoinColumn({
		name: 'organizationUuid',
		referencedColumnName: 'organizationUuid',
	})
	organization: Organization;

	@TreeParent()
	parentProperty?: Property;

	@TreeChildren({ cascade: true })
	units?: Property[];

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
	isDraft: boolean;

	@AutoMap(() => [PropertyImage])
	@OneToMany(() => PropertyImage, (image) => image.property, {
		cascade: ['insert'],
	})
	images?: PropertyImage[];

	@AutoMap(() => OrganizationUser)
	@ManyToOne(() => OrganizationUser, (orgUser) => orgUser.propertiesOwned)
	owner?: OrganizationUser;

	@AutoMap(() => OrganizationUser)
	@ManyToOne(() => OrganizationUser, (orgUser) => orgUser.propertiesManaged)
	manager?: OrganizationUser;
}

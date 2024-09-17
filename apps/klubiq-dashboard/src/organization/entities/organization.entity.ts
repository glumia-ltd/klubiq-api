import {
	Entity,
	PrimaryGeneratedColumn,
	DeleteDateColumn,
	Column,
	Generated,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	OneToOne,
} from 'typeorm';
import { OrganizationUser } from '../../users/entities/organization-user.entity';
import { AutoMap } from '@automapper/classes';
import { Property } from '../../properties/entities/property.entity';
import { Transaction } from '@app/common/database/entities/transaction.entity';
import { OrganizationSettings } from '@app/common/database/entities/organization-settings.entity';
import { OrganizationSubscriptions } from '@app/common/database/entities/organization-subscriptions.entity';
import { PropertyImage } from '@app/common/database/entities/property-image.entity';

@Entity({ schema: 'poo' })
export class Organization {
	@AutoMap()
	@PrimaryGeneratedColumn('uuid')
	organizationUuid?: string;

	@AutoMap()
	@Index('idx_organization_id')
	@Generated('increment')
	@Column({ unique: true })
	organizationId?: number;

	@AutoMap()
	@Column({ default: true })
	isActive?: boolean;

	@AutoMap()
	@Index()
	@Column({ length: 100, unique: true })
	name: string;

	@AutoMap()
	@Column({ default: false })
	isVerified?: boolean;

	@AutoMap()
	@Column({ nullable: true })
	email?: string;

	@AutoMap()
	@Column({ nullable: true })
	govRegistrationNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	countryPhoneCode?: string;

	@AutoMap()
	@Column({ nullable: true })
	phoneNumber?: string;

	@AutoMap()
	@Column({ nullable: true })
	street?: string;

	@AutoMap()
	@Column({ nullable: true })
	addressLine2?: string;

	@AutoMap()
	@Column({ nullable: true })
	state?: string;

	@AutoMap()
	@Column({ nullable: true })
	city?: string;

	@AutoMap()
	@Column({ nullable: true })
	country?: string;

	@AutoMap()
	@Column({ nullable: true })
	postalCode?: string;

	@AutoMap()
	@Column({ nullable: true })
	companyType?: string;

	@Column({ default: false })
	isDeleted?: boolean;

	@AutoMap(() => [OrganizationUser])
	@OneToMany(() => OrganizationUser, (orgUser) => orgUser.organization, {
		cascade: true,
	})
	users?: OrganizationUser[];

	@DeleteDateColumn()
	@Index('idx_deleted_date')
	deletedDate?: Date;

	@CreateDateColumn()
	createdDate?: Date;

	@UpdateDateColumn()
	updatedDate?: Date;

	@AutoMap()
	@Column({ nullable: true })
	website?: string;

	@AutoMap()
	@Column({ nullable: true })
	logoUrl?: string;

	@AutoMap(() => [Property])
	@OneToMany(() => Property, (property) => property.organization)
	properties?: Property[];

	@AutoMap(() => [Transaction])
	@OneToMany(() => Transaction, (transaction) => transaction.organization)
	transactions?: Transaction[];

	@AutoMap(() => [OrganizationSettings])
	@OneToOne(() => OrganizationSettings, (settings) => settings.organization, {
		eager: true,
		cascade: ['insert', 'remove'],
	})
	settings?: OrganizationSettings;

	@OneToMany(
		() => OrganizationSubscriptions,
		(subscription) => subscription.organization,
		{
			eager: true,
			cascade: ['insert', 'remove'],
		},
	)
	subscriptions?: OrganizationSubscriptions[];

	@OneToMany(() => PropertyImage, (image) => image.organization, {
		cascade: ['remove'],
	})
	propertyImages?: PropertyImage[];
}

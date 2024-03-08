import { Entity, PrimaryGeneratedColumn, DeleteDateColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserProfile } from "@app/common";

@Entity({ schema: 'dashboard' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({default: true})
  isActive?: boolean;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({default: false})
  isDeleted?: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.dashboardUser)
  @JoinColumn()
  profile?: UserProfile;

  @DeleteDateColumn()
  deletedDate?: Date;
}

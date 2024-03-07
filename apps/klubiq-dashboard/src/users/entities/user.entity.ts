import { Entity, PrimaryGeneratedColumn, DeleteDateColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserProfile } from "@app/common";

@Entity({ schema: 'dashboard' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isActive: boolean;

  @Column({ length: 100 })
  firstName: boolean;

  @Column({ length: 100 })
  lastName: boolean;

  @Column()
  isDeleted: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.dashboardUser)
  @JoinColumn()
  profile: UserProfile;

  @DeleteDateColumn()
  deletedDate: Date;
}

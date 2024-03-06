import { Entity, PrimaryGeneratedColumn, DeleteDateColumn, Column, OneToOne } from "typeorm";
import { UserProfile } from "@app/common";

@Entity({ schema: 'dashboard' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isActive: boolean;

  @Column()
  isDeleted: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @DeleteDateColumn()
  deletedDate: Date;
}

import { Entity, PrimaryGeneratedColumn, Generated, Column } from "typeorm";

@Entity({ schema: 'dashboard' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

import { Injectable, Logger } from "@nestjs/common";
import { BaseRepository } from "@app/common";
import { Role } from '../database/entities/role.entity';
import {EntityManager} from "typeorm";

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  protected readonly logger = new Logger(RolesRepository.name);
  constructor(manager: EntityManager) {
    super(Role, manager);
  }
}
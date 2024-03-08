import { Injectable, Logger } from "@nestjs/common";
import { BaseRepository } from "@app/common";
import { User } from "./entities/user.entity";
import {EntityManager} from "typeorm";

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);
  constructor(manager: EntityManager) {
    super(User, manager);
  }
}
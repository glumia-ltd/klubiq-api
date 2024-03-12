import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';
import { AuthModule } from '@app/auth';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService],
  imports: [TypeOrmModule.forFeature([Organization]), AuthModule],
})
export class OrganizationModule {}

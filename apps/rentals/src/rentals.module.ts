import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [RentalsController],
  providers: [RentalsService],
})
export class RentalsModule {}

import { Module } from '@nestjs/common';
import { LeaseController } from './controllers/lease.controller';

@Module({
	imports: [LeaseModule],
	controllers: [LeaseController],
})
export class LeaseModule {}

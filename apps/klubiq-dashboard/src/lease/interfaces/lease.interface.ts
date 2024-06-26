import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { LeaseDto } from '../dto/responses/view-lease.dto';

export interface ILease {
	createLease(leaseDto: CreateLeaseDto): Promise<LeaseDto>;
	getAllLeases(): Promise<LeaseDto[]>;
}

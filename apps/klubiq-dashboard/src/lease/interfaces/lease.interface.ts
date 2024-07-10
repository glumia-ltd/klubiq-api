import { PageDto } from '@app/common/dto/pagination/page.dto';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { GetLeaseDto } from '../dto/requests/get-lease.dto';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import { LeaseDto } from '../dto/responses/view-lease.dto';

export const LEASE_SERVICE_INTERFACE = 'LEASE SERVICE INTERFACE';
export interface ILeaseService {
	createLease(leaseDto: CreateLeaseDto): Promise<LeaseDto>;
	getAllPropertyLeases(propertyUuId: string): Promise<LeaseDto[]>;
	getLeaseById(id: number): Promise<LeaseDto>;
	updateLeaseById(id: number, leaseDto: UpdateLeaseDto): Promise<LeaseDto>;
	getOrganizationLeases(getLeaseDto?: GetLeaseDto): Promise<PageDto<LeaseDto>>;
}

import { PageDto } from '@app/common/dto/pagination/page.dto';
import { CreateLeaseDto } from '../dto/requests/create-lease.dto';
import { GetLeaseDto } from '../dto/requests/get-lease.dto';
import { UpdateLeaseDto } from '../dto/requests/update-lease.dto';
import { LeaseDetailsDto, LeaseDto } from '../dto/responses/view-lease.dto';
import { RentOverdueLeaseDto } from '@app/common/dto/responses/dashboard-metrics.dto';

export const LEASE_SERVICE_INTERFACE = 'LEASE SERVICE INTERFACE';
export interface ILeaseService {
	createLease(leaseDto: CreateLeaseDto): Promise<void>;
	getAllUnitLeases(unitId: number): Promise<LeaseDto[]>;
	getLeaseById(id: number): Promise<LeaseDetailsDto>;
	updateLeaseById(
		id: number,
		leaseDto: UpdateLeaseDto,
	): Promise<LeaseDetailsDto>;
	getOrganizationLeases(getLeaseDto?: GetLeaseDto): Promise<PageDto<LeaseDto>>;
	getTotalOverdueRents(organizationUuid: string): Promise<RentOverdueLeaseDto>;
}

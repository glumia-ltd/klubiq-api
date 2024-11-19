import { TenantDto } from './tenant.dto';

export class PropertyViewModel {
	uuid: string;
	name: string;
	units: {
		id: number;
		unitNumber: string;
	}[];
}

export class FilterViewModel {
	id: string;
	title: string;
	options: {
		label: string;
		value: string | number;
		order?: 'ASC' | 'DESC';
		Icon?: string;
	};
}
export class PropertyAndTenantViewModel {
	properties: PropertyViewModel[];
	tenants: TenantDto[];
}

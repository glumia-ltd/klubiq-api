import { PageOptionsDto } from '../dto/pagination/page-options.dto';

export enum Order {
	ASC = 'ASC',
	DESC = 'DESC',
}

export interface PageMetaDtoParameters {
	pageOptionsDto: PageOptionsDto;
	itemCount: number;
}

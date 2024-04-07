import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
	@ApiProperty({ isArray: true })
	@IsArray()
	readonly pageData: T[];

	@ApiProperty({ type: () => PageMetaDto })
	readonly meta: PageMetaDto;

	constructor(data: T[], meta: PageMetaDto) {
		this.pageData = data;
		this.meta = meta;
	}
}

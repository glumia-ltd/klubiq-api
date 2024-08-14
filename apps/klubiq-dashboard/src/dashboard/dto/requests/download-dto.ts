import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class DownloadRevenueDataDto {
	@ApiProperty()
	@IsDateString()
	@IsNotEmpty()
	startDate: string;

	@ApiProperty()
	@IsDateString()
	@IsNotEmpty()
	endDate: string;
}

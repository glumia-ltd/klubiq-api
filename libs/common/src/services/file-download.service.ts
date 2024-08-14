import { Injectable } from '@nestjs/common';
//import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
import { XlsxFileDownloadDto } from '../dto/requests/xlsx-file-download.dto';
import { DateTime } from 'luxon';

@Injectable()
export class FileDownloadService {
	// constructor(private readonly configService: ConfigService) {
	// }
	async generateExcelFile(
		downloadData: XlsxFileDownloadDto[],
		title: string,
	): Promise<Buffer> {
		const workbook = XLSX.utils.book_new();
		workbook.Props = {
			Title: title,
			Author: 'Klubiq',
			CreatedDate: DateTime.utc().toJSDate(),
		};
		downloadData.map((item) => {
			const worksheet = XLSX.utils.json_to_sheet(item.data, {
				cellDates: true,
				cellStyles: true,
			});
			XLSX.utils.book_append_sheet(workbook, worksheet, item.sheetName);
		});

		// Generate buffer from the workbook
		const excelBuffer: Buffer = XLSX.write(workbook, {
			type: 'buffer',
			bookType: 'xlsx',
		});
		return excelBuffer;
	}
}

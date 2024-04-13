import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {}

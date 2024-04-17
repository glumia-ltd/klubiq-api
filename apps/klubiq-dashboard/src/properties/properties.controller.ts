import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {}
// create property
// get all properties by organization with pagination
// get all properties by propertyManager with pagination
// get all properties by filter with pagination
// get property by id
// update property
// delete property
// archive property
// create property for organization

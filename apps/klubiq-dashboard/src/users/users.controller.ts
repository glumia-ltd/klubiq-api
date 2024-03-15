import {
	Controller,
	Get,
	Post,
	Body,
	// Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';

import {
	CreateOrganizationUserDto,
	UserSignUpResponseDto,
} from './dto/create-organization-user.dto';
// import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post('/signup')
	@ApiOkResponse({
		description: 'Creates a new user and returns the data created',
		type: UserSignUpResponseDto,
	})
	async createUser(@Body() createUser: CreateOrganizationUserDto) {
		debugger;
		return await this.usersService.create(createUser);
	}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	// @Patch(':id')
	// update(
	// 	@Param('id') id: string,
	// 	@Body() updateOrgUserDto: UpdateOrganizationUserDto,
	// ) {
	// 	return this.usersService.update(+id, updateOrgUserDto);
	// }

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(+id);
	}
}

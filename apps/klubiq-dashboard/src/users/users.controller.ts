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
	UserResponseDto,
} from './dto/create-organization-user.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
// import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserProfile } from '@app/common';
import { OrganizationUser } from './entities/organization-user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	@Post('/signup')
	@ApiOkResponse({
		description: 'Creates a new user and returns the data created',
		type: UserResponseDto,
	})
	async createUser(@Body() createUser: CreateOrganizationUserDto) {
		const userData = await this.usersService.create(createUser);
		return this.mapper.map(userData, UserProfile, UserResponseDto);
	}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	@ApiOkResponse({
		description: 'gets a user by id',
		type: UserResponseDto,
	})
	async findOne(@Param('id') id: string) {
		const userData = await this.usersService.findOne(+id);
		return this.mapper.map(userData, OrganizationUser, UserResponseDto);
	}

	// @Get(':id')
	// @ApiOkResponse({
	// 	description: 'gets a user by id',
	// 	type: OrganizationUser,
	// })
	// async findOne(@Param('id') id: string) {
	// 	return await this.usersService.findOne(+id);
	// }

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

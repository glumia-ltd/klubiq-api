import {
	Controller,
	Get,
	Param,
	Delete,
	NotFoundException,
	UseGuards,
	Put,
	Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/create-organization-user.dto';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationUser } from './entities/organization-user.entity';
import { RolesGuard } from '@app/auth/guards/roles.guard';
import { UserRoles } from '@app/common';
import { AuthType, Auth, Roles } from '@app/auth';
import { FirebaseAuthGuard } from '@app/auth/guards/firebase-auth.guard';
import {
	UpdateOrganizationUserDto,
	UpdateUserProfileDto,
} from './dto/update-organization-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		@InjectMapper() private readonly mapper: Mapper,
	) {}

	@Get()
	@Roles(UserRoles.LANDLORD)
	@ApiOkResponse({
		description: 'Returns all the users available ',
	})
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

	@Get('landlord/:identifier')
	@UseGuards(FirebaseAuthGuard, RolesGuard)
	@Roles(UserRoles.LANDLORD)
	async getLandlordUser(
		@Param('identifier') identifier: string,
	): Promise<OrganizationUser> {
		const user = await this.usersService.getUserByEmailOrFirebaseId(identifier);
		if (!user) {
			throw new NotFoundException('Landlord user not found');
		}
		return user;
	}

	@Put(':profileId')
	async updateUserByProfileId(
		@Param('profileId') profileId: string,
		@Body() updateUserProfileDto: UpdateUserProfileDto,
		@Body() updateOrganizationUserDto: UpdateOrganizationUserDto,
	): Promise<OrganizationUser> {
		const updatedUser =
			await this.usersService.updateUserProfileAndOrganizationUser(
				profileId,
				updateUserProfileDto,
				updateOrganizationUserDto,
			);
		if (!updatedUser) {
			throw new NotFoundException('User not found');
		}
		return updatedUser;
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(+id);
	}
}

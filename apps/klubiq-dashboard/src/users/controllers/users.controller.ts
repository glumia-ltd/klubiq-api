import {
	Controller,
	Get,
	Param,
	Delete,
	NotFoundException,
	Put,
	Body,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';

import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationUser } from '@app/common/database/entities/organization-user.entity';
import { Permissions, AppFeature } from '@app/common/config/config.constants';
import { AuthType, Auth, Feature, Permission } from '@app/auth';
import { UpdateUserDto } from '../dto/update-organization-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Feature(AppFeature.USER)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Permission(
		Permissions.READ,
		Permissions.CREATE,
		Permissions.UPDATE,
		Permissions.DELETE,
	)
	@ApiOkResponse({
		description: 'Returns all the users available ',
	})
	findAll() {
		try {
			return this.usersService.findAll();
		} catch (error) {
			throw error;
		}
	}

	@Get('landlord/:identifier')
	async getLandlordUser(
		@Param('identifier') identifier: string,
	): Promise<OrganizationUser> {
		const user = await this.usersService.getUserByEmailOrUuid(identifier);
		if (!user) {
			throw new NotFoundException('Landlord user not found');
		}
		return user;
	}

	@Put(':profileId')
	async updateUserByProfileId(
		@Param('profileId') profileId: string,
		@Body() updateUserdto: UpdateUserDto,
	): Promise<OrganizationUser> {
		const updatedUser =
			await this.usersService.updateUserProfileAndOrganizationUser(
				profileId,
				updateUserdto,
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

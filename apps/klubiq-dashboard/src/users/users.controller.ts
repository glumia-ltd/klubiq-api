import {
	Controller,
	Get,
	Param,
	Delete,
	NotFoundException,
	Put,
	Body,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationUser } from './entities/organization-user.entity';
import { Actions, AppFeature, UserRoles } from '@app/common';
import { AuthType, Auth, Roles, Feature, Ability } from '@app/auth';
import { UpdateUserDto } from './dto/update-organization-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Feature(AppFeature.USER)
@Roles(UserRoles.LANDLORD)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	//@Roles(UserRoles.ORG_OWNER)
	@Ability(Actions.VIEW, Actions.WRITE)
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

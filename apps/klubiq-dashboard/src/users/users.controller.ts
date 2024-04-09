import {
	Controller,
	Get,
	Param,
	Delete,
	NotFoundException,
	Put,
	Body,
	HttpStatus,
	HttpCode,
	Post,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationUser } from './entities/organization-user.entity';
import { UserRoles } from '@app/common';
import { AuthType, Auth, Roles, ActiveUser, ActiveUserData } from '@app/auth';
import { UpdateUserDto } from './dto/update-organization-user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Roles(UserRoles.LANDLORD)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Roles(UserRoles.ORG_OWNER)
	@ApiOkResponse({
		description: 'Returns all the users available ',
	})
	findAll() {
		return this.usersService.findAll();
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

	@HttpCode(HttpStatus.OK)
	@Post('session')
	async getLoggedInLandlord(@ActiveUser() activeUser: ActiveUserData) {
		const email = activeUser.email;
		return await this.usersService.getLoggedInLandlordUser(email);
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

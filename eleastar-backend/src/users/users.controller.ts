import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        const user = await this.usersService.findById(req.user.userId);
        const { passwordHash, ...result } = user || {};
        return result;
    }

    @Get()
    @Roles(Role.SUPER_ADMIN, Role.HR_ADMIN)
    async getAllUsers() {
        return { message: 'Placeholder for fetching users' };
    }

    @Post()
    @Roles(Role.SUPER_ADMIN)
    async createAdminUser(@Body() createUserDto: { email: string; firstName: string; lastName: string; role: Role }) {
        const { user, plainTextPassword } = await this.usersService.createAdminUser(createUserDto);
        const { passwordHash, ...safeUser } = user;

        // ATTENTION: Returning the plainTextPassword here is intentional for the current Phase. 
        // It allows the frontend to show it once to the admin or email it.
        return { user: safeUser, initialPassword: plainTextPassword };
    }

    @Post(':id/reset-password')
    @Roles(Role.SUPER_ADMIN)
    async resetPassword(@Param('id') id: string) {
        const { user, newPlainTextPassword } = await this.usersService.resetPassword(id);
        const { passwordHash, ...safeUser } = user;
        return { user: safeUser, newPassword: newPlainTextPassword };
    }
}

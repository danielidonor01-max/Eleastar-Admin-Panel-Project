import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    generateSystemPassword(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        return Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    async createAdminUser(data: { email: string; firstName: string; lastName: string; role: any }): Promise<{ user: User; plainTextPassword: string }> {
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        const plainTextPassword = this.generateSystemPassword();
        const passwordHash = await bcrypt.hash(plainTextPassword, 10);

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                passwordHash,
            },
        });

        return { user, plainTextPassword };
    }

    async resetPassword(userId: string): Promise<{ user: User; newPlainTextPassword: string }> {
        const user = await this.findById(userId);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const newPlainTextPassword = this.generateSystemPassword();
        const passwordHash = await bcrypt.hash(newPlainTextPassword, 10);

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return { user: updatedUser, newPlainTextPassword };
    }
}

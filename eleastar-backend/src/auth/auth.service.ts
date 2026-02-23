import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        // Generate refresh token (simple example, would normally hash it before saving)
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d', // Refresh token lives longer
        });

        // Store refresh token
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user,
        };
    }

    async refreshToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
            const storedToken = await this.prisma.refreshToken.findUnique({ where: { token } });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            const user = await this.usersService.findById(decoded.sub);
            if (!user) throw new UnauthorizedException('User not found');

            const payload = { email: user.email, sub: user.id, role: user.role };
            const newAccessToken = this.jwtService.sign(payload);

            return { access_token: newAccessToken };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}

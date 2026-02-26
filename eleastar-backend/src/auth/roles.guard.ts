import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    COO = 'COO',
    HR_ADMIN = 'HR_ADMIN',
    FINANCE_ADMIN = 'FINANCE_ADMIN',
    PAYROLL_ADMIN = 'PAYROLL_ADMIN',
    CHIEF_RISK_OFFICER = 'CHIEF_RISK_OFFICER',
    USER = 'USER'
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.role === role);
    }
}

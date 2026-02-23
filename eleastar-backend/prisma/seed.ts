import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial SUPER_ADMIN user...');

    const passwordHash = await bcrypt.hash('password123', 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@eleastar.com' },
        update: {},
        create: {
            email: 'admin@eleastar.com',
            firstName: 'System',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            passwordHash,
        },
    });

    console.log(`Initial User Seeded: ${superAdmin.email}`);
    console.log(`Password: password123`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

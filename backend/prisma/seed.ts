import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminLogin = process.env.ADMIN_LOGIN;
  const adminPasswordRaw = process.env.ADMIN_PASSWORD;

  if (!adminLogin || !adminPasswordRaw) {
    throw new Error('ADMIN_LOGIN and ADMIN_PASSWORD are required for seeding');
  }

  const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminLogin },
    update: {
      password: adminPassword,
      name: 'Gerusta Admin',
      role: 'ADMIN',
    },
    create: {
      email: adminLogin,
      password: adminPassword,
      name: 'Gerusta Admin',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin.email);

  // Create categories
  const categories = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Development', slug: 'development' },
    { name: 'Design', slug: 'design' },
    { name: 'AI', slug: 'ai' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('Categories created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

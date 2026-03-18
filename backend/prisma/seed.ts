import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'pallermo@bk.ru' },
    update: {},
    create: {
      email: 'pallermo@bk.ru',
      password: SerT4!sd!,
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

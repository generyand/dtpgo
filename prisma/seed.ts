import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Programs
  console.log('Seeding programs...');
  const programs = [
    {
      name: 'BSIT',
      displayName: 'Bachelor of Science in Information Technology',
      description: 'A program focused on the study of computer systems, networks, and software development.',
    },
    {
      name: 'BSCPE',
      displayName: 'Bachelor of Science in Computer Engineering',
      description: 'A program that combines principles of electrical engineering and computer science.',
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { name: program.name },
      update: {},
      create: program,
    });
  }
  console.log('✅ Programs seeded successfully.');

  // Seed Students for development
  // console.log('Seeding development students...');
  // const bsitProgram = await prisma.program.findUnique({ where: { name: 'BSIT' } });
  // const bscpeProgram = await prisma.program.findUnique({ where: { name: 'BSCPE' } });

  // if (bsitProgram && bscpeProgram) {
  //   const students = [
  //     {
  //       studentIdNumber: '59889',
  //       firstName: 'VINCENT ACE',
  //       lastName: 'RIVERA',
  //       email: 'augusto08rivera12@gmail.com',
  //       year: 4,
  //       programId: bsitProgram.id,
  //     },
  //     {
  //       studentIdNumber: '59886',
  //       firstName: 'GENE RYAN',
  //       lastName: 'DEPALUBOS',
  //       email: 'generyan.dep@gmail.com',
  //       year: 4,
  //       programId: bsitProgram.id,
  //     },
  //   ];

  //   for (const student of students) {
  //     await prisma.student.upsert({
  //       where: { studentIdNumber: student.studentIdNumber },
  //       update: {},
  //       create: student,
  //     });
  //   }
  //   console.log('✅ Development students seeded successfully.');
  // } else {
  //   console.warn('⚠️ Could not find BSIT or BSCPE programs. Skipping student seeding.');
  // }

  // Seed Admin User for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Seeding admin user for development...');
    const adminEmail = process.env.ADMIN_EMAIL;
    const plainPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !plainPassword) {
      console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seeding.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      await prisma.admin.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
        },
      });
      console.log('✅ Admin user seeded successfully.');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }
  }

  console.log('🏁 Database seeding finished.');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
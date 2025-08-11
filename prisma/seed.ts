import { PrismaClient } from '@prisma/client';

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
  console.log('Seeding development students...');
  const bsitProgram = await prisma.program.findUnique({ where: { name: 'BSIT' } });
  const bscpeProgram = await prisma.program.findUnique({ where: { name: 'BSCPE' } });

  if (bsitProgram && bscpeProgram) {
    const students = [
      {
        studentIdNumber: 'S2023-0001-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        year: 1,
        programId: bsitProgram.id,
      },
      {
        studentIdNumber: 'S2023-0002-002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        year: 2,
        programId: bscpeProgram.id,
      },
      {
        studentIdNumber: 'S2022-0003-003',
        firstName: 'Peter',
        lastName: 'Jones',
        email: 'peter.jones@example.com',
        year: 3,
        programId: bsitProgram.id,
      },
    ];

    for (const student of students) {
      await prisma.student.upsert({
        where: { studentIdNumber: student.studentIdNumber },
        update: {},
        create: student,
      });
    }
    console.log('✅ Development students seeded successfully.');
  } else {
    console.warn('⚠️ Could not find BSIT or BSCPE programs. Skipping student seeding.');
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
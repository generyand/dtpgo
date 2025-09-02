import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Programs
  console.log('Seeding programs...');
  const programs = [
    {
      name: 'BSIT',
      displayName: 'Bachelor of Science in Information Technology',
      description:
        'A program focused on the study of computer systems, networks, and software development.',
    },
    {
      name: 'BSCPE',
      displayName: 'Bachelor of Science in Computer Engineering',
      description:
        'A program that combines principles of electrical engineering and computer science.',
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

  // Seed Students for development with varied registration dates
  console.log('Seeding development students...');
  const bsitProgram = await prisma.program.findUnique({
    where: { name: 'BSIT' },
  });
  const bscpeProgram = await prisma.program.findUnique({
    where: { name: 'BSCPE' },
  });

  if (bsitProgram && bscpeProgram) {
    const studentsToSeed = [];
    const today = new Date();

    console.log('Generating 25 new sample students with recent registration dates...');
    for (let i = 0; i < 25; i++) {
      const studentId = `SEED-${String(i).padStart(4, '0')}`; // e.g., SEED-0000
      const createdAt = subDays(today, Math.floor(Math.random() * 80) + 1); // 1-89 days ago
      const program = i % 2 === 0 ? bsitProgram : bscpeProgram;

      studentsToSeed.push({
        studentIdNumber: studentId,
        firstName: `Sample`,
        lastName: `Student ${i}`,
        email: `seed.student.${i}@example.com`,
        year: Math.ceil(Math.random() * 4),
        programId: program.id,
        createdAt: createdAt,
        registrationSource: 'admin',
      });
    }

    let createdCount = 0;
    for (const studentData of studentsToSeed) {
      const existingStudent = await prisma.student.findUnique({
        where: { studentIdNumber: studentData.studentIdNumber },
      });

      if (!existingStudent) {
        await prisma.student.create({
          data: studentData,
        });
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`✅ Added ${createdCount} new sample students to the database.`);
    } else {
      console.log('ℹ️ Sample students already exist. No new students were added.');
    }
  } else {
    console.warn(
      '⚠️ Could not find BSIT or BSCPE programs. Skipping student seeding.',
    );
  }

  // Note: Admin users are now managed through Supabase Auth
  // No need to seed admin users in the database
  console.log('ℹ️ Admin users are managed through Supabase Auth.');

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
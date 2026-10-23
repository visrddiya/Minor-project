import { PrismaClient, Role, PriorityLevel, TokenStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [QueueSphere Seed]: Seeding database...');

  // Create Sample Branch
  const branch = await prisma.branch.upsert({
    where: { code: 'CPH-01' },
    update: {},
    create: {
      name: 'Central Plaza Healthcare & Services Hub',
      code: 'CPH-01',
      address: '100 Metro Tower Plaza, Financial District',
      city: 'Metropolis',
      phone: '+1 (555) 019-2834',
      email: 'central@queuesphere.com',
      openingTime: '08:00',
      closingTime: '18:00',
    },
  });

  // Create Departments
  const deptGeneral = await prisma.department.upsert({
    where: { branchId_code: { branchId: branch.id, code: 'GEN' } },
    update: {},
    create: {
      name: 'General Consultations & Admissions',
      code: 'GEN',
      prefix: 'A',
      description: 'Patient check-in, triage, general medical records, and physician consulting.',
      branchId: branch.id,
    },
  });

  const deptPharmacy = await prisma.department.upsert({
    where: { branchId_code: { branchId: branch.id, code: 'PHARM' } },
    update: {},
    create: {
      name: 'Pharmacy & Prescriptions',
      code: 'PHARM',
      prefix: 'P',
      description: 'Medication dispensing, prescription validation, and consulting.',
      branchId: branch.id,
    },
  });

  const deptLab = await prisma.department.upsert({
    where: { branchId_code: { branchId: branch.id, code: 'LAB' } },
    update: {},
    create: {
      name: 'Diagnostic Laboratory & Imaging',
      code: 'LAB',
      prefix: 'L',
      description: 'Blood sample collection, X-Ray, MRI, and diagnostics.',
      branchId: branch.id,
    },
  });

  // Create Service Counters
  const counter1 = await prisma.serviceCounter.upsert({
    where: { branchId_number: { branchId: branch.id, number: '01' } },
    update: {},
    create: {
      number: '01',
      name: 'Counter 01 (General Consultation)',
      departmentId: deptGeneral.id,
      branchId: branch.id,
      isOnline: true,
    },
  });

  const counter2 = await prisma.serviceCounter.upsert({
    where: { branchId_number: { branchId: branch.id, number: '02' } },
    update: {},
    create: {
      number: '02',
      name: 'Counter 02 (Express Pharmacy)',
      departmentId: deptPharmacy.id,
      branchId: branch.id,
      isOnline: true,
    },
  });

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@queuesphere.com' },
    update: {},
    create: {
      email: 'admin@queuesphere.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Alex',
      role: Role.SUPER_ADMIN,
      phone: '+1 (555) 999-0000',
      branchId: branch.id,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@queuesphere.com' },
    update: {},
    create: {
      email: 'staff@queuesphere.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: Role.STAFF,
      phone: '+1 (555) 888-1111',
      branchId: branch.id,
      counterId: counter1.id,
    },
  });

  console.log(`✅ [QueueSphere Seed]: Seeding completed successfully!`);
  console.log(` - Branch: ${branch.name}`);
  console.log(` - Admin User: ${adminUser.email} (password: password123)`);
  console.log(` - Staff User: ${staffUser.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error('❌ [QueueSphere Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

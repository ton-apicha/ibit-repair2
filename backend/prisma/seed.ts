/**
 * Database Seeder
 * สร้างข้อมูลจำลองสำหรับทดสอบระบบ
 * 
 * วิธีใช้: npm run seed
 */

import { PrismaClient, JobStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 เริ่มต้น Seed ข้อมูล...\n');

  // ลบข้อมูลเก่า (ระวัง!)
  console.log('🗑️  ลบข้อมูลเก่า...');
  await prisma.activityLog.deleteMany();
  await prisma.jobImage.deleteMany();
  await prisma.jobPart.deleteMany();
  await prisma.repairRecord.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.part.deleteMany();
  await prisma.minerModel.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.warrantyProfile.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ ลบข้อมูลเก่าเรียบร้อย\n');

  // 1. สร้าง Users
  console.log('👥 สร้าง Users...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'ผู้ดูแลระบบ',
      email: 'admin@ibit.com',
      role: 'ADMIN',
      language: 'th',
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      username: 'manager',
      password: hashedPassword,
      fullName: 'ผู้จัดการ สมชาย',
      email: 'manager@ibit.com',
      role: 'MANAGER',
      language: 'th',
      isActive: true,
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      username: 'tech1',
      password: hashedPassword,
      fullName: 'ช่างสมศักดิ์ ซ่อมเก่ง',
      email: 'tech1@ibit.com',
      role: 'TECHNICIAN',
      language: 'th',
      isActive: true,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      username: 'tech2',
      password: hashedPassword,
      fullName: 'ช่างวิชัย แก้เก่ง',
      email: 'tech2@ibit.com',
      role: 'TECHNICIAN',
      language: 'th',
      isActive: true,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      username: 'receptionist',
      password: hashedPassword,
      fullName: 'แผนกต้อนรับ สุดา',
      email: 'reception@ibit.com',
      role: 'RECEPTIONIST',
      language: 'th',
      isActive: true,
    },
  });

  console.log(`✅ สร้าง ${5} Users (รหัสผ่านทั้งหมด: 123456)\n`);

  // 2. สร้าง Brands
  console.log('🏷️  สร้าง Brands...');
  const bitmain = await prisma.brand.create({
    data: {
      name: 'Bitmain',
    },
  });

  const microbt = await prisma.brand.create({
    data: {
      name: 'MicroBT',
    },
  });

  const canaan = await prisma.brand.create({
    data: {
      name: 'Canaan',
    },
  });

  console.log(`✅ สร้าง ${3} Brands\n`);

  // 3. สร้าง Models
  console.log('⚙️  สร้าง Miner Models...');
  const models = await Promise.all([
    // Bitmain
    prisma.minerModel.create({
      data: {
        brandId: bitmain.id,
        modelName: 'Antminer S19 Pro',
        hashrate: '110 TH/s',
        powerUsage: '3250W',
        description: 'รุ่นยอดนิยมสำหรับขุด Bitcoin',
      },
    }),
    prisma.minerModel.create({
      data: {
        brandId: bitmain.id,
        modelName: 'Antminer S19j Pro',
        hashrate: '104 TH/s',
        powerUsage: '3068W',
        description: 'เวอร์ชั่นประหยัดไฟ',
      },
    }),
    prisma.minerModel.create({
      data: {
        brandId: bitmain.id,
        modelName: 'Antminer S17 Pro',
        hashrate: '53 TH/s',
        powerUsage: '2094W',
        description: 'รุ่นเก่ายังนิยม',
      },
    }),
    // MicroBT
    prisma.minerModel.create({
      data: {
        brandId: microbt.id,
        modelName: 'Whatsminer M30S++',
        hashrate: '112 TH/s',
        powerUsage: '3472W',
        description: 'คู่แข่งของ S19 Pro',
      },
    }),
    prisma.minerModel.create({
      data: {
        brandId: microbt.id,
        modelName: 'Whatsminer M20S',
        hashrate: '68 TH/s',
        powerUsage: '3360W',
        description: 'รุ่นกลาง',
      },
    }),
    // Canaan
    prisma.minerModel.create({
      data: {
        brandId: canaan.id,
        modelName: 'AvalonMiner 1246',
        hashrate: '90 TH/s',
        powerUsage: '3420W',
        description: 'รุ่นใหม่ล่าสุด',
      },
    }),
  ]);

  console.log(`✅ สร้าง ${models.length} Models\n`);

  // 4. สร้าง Warranty Profiles
  console.log('📋 สร้าง Warranty Profiles...');
  const warranties = await Promise.all([
    prisma.warrantyProfile.create({
      data: {
        name: 'รับประกัน 30 วัน',
        durationDays: 30,
        description: 'รับประกัน 30 วัน นับจากวันรับเครื่องคืน',
        terms: 'รับประกันอะไหล่และค่าแรง 30 วัน',
        isActive: true,
      },
    }),
    prisma.warrantyProfile.create({
      data: {
        name: 'รับประกัน 90 วัน',
        durationDays: 90,
        description: 'รับประกัน 90 วัน เหมาะสำหรับลูกค้า VIP',
        terms: 'รับประกันอะไหล่และค่าแรง 90 วัน',
        isActive: true,
      },
    }),
    prisma.warrantyProfile.create({
      data: {
        name: 'รับประกัน 180 วัน (Premium)',
        durationDays: 180,
        description: 'รับประกันแบบพิเศษ 6 เดือน',
        terms: 'รับประกันอะไหล่และค่าแรง พร้อมบริการตรวจเช็คฟรี',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ สร้าง ${warranties.length} Warranty Profiles\n`);

  // 5. สร้าง Parts
  console.log('🔧 สร้าง Parts...');
  const parts = await Promise.all([
    prisma.part.create({
      data: {
        partName: 'Hash Board',
        partNumber: 'HB-S19-001',
        stockQty: 15,
        minStockQty: 5,
        unitPrice: 12000,
        description: 'Hash Board สำหรับ Antminer S19 Series',
      },
    }),
    prisma.part.create({
      data: {
        partName: 'Control Board',
        partNumber: 'CB-S19-001',
        stockQty: 8,
        minStockQty: 3,
        unitPrice: 3500,
        description: 'Control Board แผงควบคุม',
      },
    }),
    prisma.part.create({
      data: {
        partName: 'Power Supply Unit (PSU)',
        partNumber: 'PSU-APW12-001',
        stockQty: 20,
        minStockQty: 8,
        unitPrice: 5500,
        description: 'PSU 3250W สำหรับ S19 Pro',
      },
    }),
    prisma.part.create({
      data: {
        partName: 'Cooling Fan 120mm',
        partNumber: 'FAN-120-001',
        stockQty: 50,
        minStockQty: 20,
        unitPrice: 450,
        description: 'พัดลมระบายความร้อน 120mm',
      },
    }),
    prisma.part.create({
      data: {
        partName: 'Data Cable',
        partNumber: 'CABLE-DATA-001',
        stockQty: 2, // สต๊อกต่ำจงใจ
        minStockQty: 10,
        unitPrice: 250,
        description: 'สายข้อมูล FFC',
      },
    }),
    prisma.part.create({
      data: {
        partName: 'Thermal Paste',
        partNumber: 'PASTE-TH-001',
        stockQty: 5, // สต๊อกต่ำจงใจ
        minStockQty: 15,
        unitPrice: 180,
        description: 'ยาทาความร้อน คุณภาพสูง',
      },
    }),
    prisma.part.create({
      data: {
        partName: 'Heatsink',
        partNumber: 'HS-ALU-001',
        stockQty: 25,
        minStockQty: 10,
        unitPrice: 850,
        description: 'ตัวระบายความร้อนอลูมิเนียม',
      },
    }),
  ]);

  console.log(`✅ สร้าง ${parts.length} Parts (มี 2 รายการสต๊อกต่ำ)\n`);

  // 6. สร้าง Customers
  console.log('👤 สร้าง Customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        fullName: 'นายสมชาย ใจดี',
        phone: '0812345678',
        email: 'somchai@example.com',
        address: '123 ถ.สุขุมวิท แขวงคลองเตย กรุงเทพฯ 10110',
        notes: 'ลูกค้า VIP มาใช้บริการบ่อย',
      },
    }),
    prisma.customer.create({
      data: {
        fullName: 'นางสาวสุดา รักดี',
        phone: '0823456789',
        email: 'suda@example.com',
        address: '456 ถ.พระราม 4 แขวงพระโขนง กรุงเทพฯ 10110',
      },
    }),
    prisma.customer.create({
      data: {
        fullName: 'บริษัท คริปโตไมน์ จำกัด',
        phone: '0834567890',
        email: 'contact@cryptomine.co.th',
        address: '789 อาคารไอที ถ.พญาไท กรุงเทพฯ 10400',
        notes: 'ลูกค้าองค์กร มีเครื่องเยอะ',
      },
    }),
    prisma.customer.create({
      data: {
        fullName: 'นายวิชัย มั่งมี',
        phone: '0845678901',
        email: 'vichai@example.com',
        address: '321 หมู่บ้านเทคโน ต.คลองหลวง จ.ปทุมธานี 12120',
      },
    }),
    prisma.customer.create({
      data: {
        fullName: 'นายประยุทธ์ ขยัน',
        phone: '0856789012',
        email: null,
        address: '111 ซ.ลาดพร้าว 101 กรุงเทพฯ 10310',
        notes: 'ไม่มีอีเมล ติดต่อทางโทรศัพท์',
      },
    }),
  ]);

  console.log(`✅ สร้าง ${customers.length} Customers\n`);

  // 7. สร้าง Jobs
  console.log('📋 สร้าง Jobs...');
  
  // Job 1: งานเสร็จแล้ว
  const job1 = await prisma.job.create({
    data: {
      jobNumber: 'RJ2025-0001',
      customerId: customers[0].id,
      minerModelId: models[0].id,
      serialNumber: 'BM-S19P-12345',
      password: 'admin123',
      status: 'COMPLETED',
      priority: 0,
      warrantyProfileId: warranties[0].id,
      problemDescription: 'เครื่องไม่ติด พัดลมไม่หมุน มีเสียง Beep 3 ครั้ง',
      customerNotes: 'ต้องการเร่งด่วน ใช้งานในฟาร์ม',
      receivedDate: new Date('2025-01-15T09:00:00'),
      completedDate: new Date('2025-01-18T16:30:00'),
      technicianId: tech1.id,
      createdById: receptionist.id,
    },
  });

  // Job 2: กำลังซ่อม
  const job2 = await prisma.job.create({
    data: {
      jobNumber: 'RJ2025-0002',
      customerId: customers[1].id,
      minerModelId: models[1].id,
      serialNumber: 'BM-S19J-67890',
      status: 'IN_REPAIR',
      priority: 1, // ด่วน
      warrantyProfileId: warranties[1].id,
      problemDescription: 'Hash rate ต่ำกว่าปกติ 50% เครื่องร้อนผิดปกติ',
      receivedDate: new Date('2025-01-20T10:30:00'),
      technicianId: tech2.id,
      createdById: receptionist.id,
    },
  });

  // Job 3: รอลูกค้าอนุมัติ
  const job3 = await prisma.job.create({
    data: {
      jobNumber: 'RJ2025-0003',
      customerId: customers[2].id,
      minerModelId: models[3].id,
      serialNumber: 'WM-M30S-11111',
      status: 'WAITING_APPROVAL',
      priority: 0,
      problemDescription: 'Hash board 1 ชิปไม่ติด ตรวจเจอชิปเสีย 3 ตัว',
      customerNotes: 'รอใบเสนอราคาก่อนดำเนินการ',
      receivedDate: new Date('2025-01-21T11:00:00'),
      technicianId: tech1.id,
      createdById: receptionist.id,
    },
  });

  // Job 4: เพิ่งรับมา
  const job4 = await prisma.job.create({
    data: {
      jobNumber: 'RJ2025-0004',
      customerId: customers[3].id,
      minerModelId: models[2].id,
      serialNumber: null,
      status: 'RECEIVED',
      priority: 2, // ด่วนมาก
      problemDescription: 'เครื่องดับเอง ไม่สามารถเปิดได้ มีกลิ่นไหม้',
      receivedDate: new Date('2025-01-22T14:00:00'),
      createdById: receptionist.id,
    },
  });

  // Job 5: พร้อมส่งมอบ
  const job5 = await prisma.job.create({
    data: {
      jobNumber: 'RJ2025-0005',
      customerId: customers[4].id,
      minerModelId: models[4].id,
      serialNumber: 'WM-M20S-99999',
      status: 'READY_FOR_PICKUP',
      priority: 0,
      warrantyProfileId: warranties[2].id,
      problemDescription: 'บำรุงรักษาตามกำหนด ทำความสะอาดและเปลี่ยนยาทา',
      receivedDate: new Date('2025-01-19T08:00:00'),
      completedDate: new Date('2025-01-22T15:00:00'),
      technicianId: tech2.id,
      createdById: receptionist.id,
    },
  });

  console.log(`✅ สร้าง ${5} Jobs\n`);

  // 8. สร้าง Repair Records
  console.log('📝 สร้าง Repair Records...');
  await Promise.all([
    // Job 1 Records
    prisma.repairRecord.create({
      data: {
        jobId: job1.id,
        createdBy: tech1.id,
        description: 'ตรวจสอบเบื้องต้น พบพัดลม 2 ตัวไม่หมุน PSU ทำงานปกติ',
        findings: 'พัดลมเสีย 2 ตัว, สายไฟพัดลมขาด',
        actions: 'เปลี่ยนพัดลมใหม่ 2 ตัว, เปลี่ยนสายไฟ',
      },
    }),
    prisma.repairRecord.create({
      data: {
        jobId: job1.id,
        createdBy: tech1.id,
        description: 'ทดสอบเครื่องหลังซ่อม ทำงานปกติ Hash rate ตามสเปค',
        findings: 'ระบบทำงานปกติทุกอย่าง อุณหภูมิปกติ 65-70°C',
        actions: 'ทำความสะอาดเครื่อง เปลี่ยนยาทาความร้อน',
      },
    }),
    // Job 2 Records
    prisma.repairRecord.create({
      data: {
        jobId: job2.id,
        createdBy: tech2.id,
        description: 'ตรวจสอบ Hash board ทั้ง 3 แผง พบแผงที่ 2 ความร้อนสูงผิดปกติ',
        findings: 'Hash board ชิปหลุด 5 ตัว, ยาทาแห้ง',
        actions: 'กำลังดำเนินการเปลี่ยน Hash board',
      },
    }),
    // Job 3 Records
    prisma.repairRecord.create({
      data: {
        jobId: job3.id,
        createdBy: tech1.id,
        description: 'วินิจฉัยปัญหา พบชิปเสียบน Hash board',
        findings: 'ชิป ASIC เสีย 3 ตัว ไม่สามารถซ่อมแต่ได้ ต้องเปลี่ยนแผงใหม่',
        actions: 'แจ้งลูกค้าใบเสนอราคาเปลี่ยน Hash board 12,000 บาท',
      },
    }),
    // Job 5 Records
    prisma.repairRecord.create({
      data: {
        jobId: job5.id,
        createdBy: tech2.id,
        description: 'บำรุงรักษาประจำงวด ทำความสะอาดทั่วทั้งเครื่อง',
        findings: 'สภาพเครื่องดี ฝุ่นเล็กน้อย',
        actions: 'ทำความสะอาด เปลี่ยนยาทาความร้อน ตรวจเช็คระบบทั้งหมด',
      },
    }),
  ]);

  console.log(`✅ สร้าง ${5} Repair Records\n`);

  // 9. สร้าง Job Parts
  console.log('🔧 สร้าง Job Parts...');
  await Promise.all([
    // Job 1 ใช้อะไหล่
    prisma.jobPart.create({
      data: {
        jobId: job1.id,
        partId: parts[3].id, // Cooling Fan
        quantity: 2,
        unitPrice: 450,
        notes: 'เปลี่ยนพัดลมเสีย',
      },
    }),
    // Job 2 ใช้อะไหล่
    prisma.jobPart.create({
      data: {
        jobId: job2.id,
        partId: parts[0].id, // Hash Board
        quantity: 1,
        unitPrice: 12000,
        notes: 'เปลี่ยน Hash board ชิปเสีย',
      },
    }),
    prisma.jobPart.create({
      data: {
        jobId: job2.id,
        partId: parts[5].id, // Thermal Paste
        quantity: 1,
        unitPrice: 180,
      },
    }),
    // Job 5 ใช้อะไหล่
    prisma.jobPart.create({
      data: {
        jobId: job5.id,
        partId: parts[5].id, // Thermal Paste
        quantity: 1,
        unitPrice: 180,
        notes: 'บำรุงรักษา',
      },
    }),
  ]);

  // ลดสต๊อกตามที่ใช้
  await prisma.part.update({
    where: { id: parts[3].id },
    data: { stockQty: { decrement: 2 } }, // Fan -2
  });
  await prisma.part.update({
    where: { id: parts[0].id },
    data: { stockQty: { decrement: 1 } }, // Hash Board -1
  });
  await prisma.part.update({
    where: { id: parts[5].id },
    data: { stockQty: { decrement: 2 } }, // Thermal Paste -2
  });

  console.log(`✅ สร้าง ${4} Job Parts และอัพเดทสต๊อก\n`);

  // 10. สร้าง Activity Logs
  console.log('📊 สร้าง Activity Logs...');
  await Promise.all([
    prisma.activityLog.create({
      data: {
        jobId: job1.id,
        userId: receptionist.id,
        action: 'CREATE_JOB',
        description: 'สร้างงานซ่อม RJ2025-0001',
      },
    }),
    prisma.activityLog.create({
      data: {
        jobId: job1.id,
        userId: tech1.id,
        action: 'ASSIGN_TECHNICIAN',
        description: 'มอบหมายงานให้ช่างสมศักดิ์',
      },
    }),
    prisma.activityLog.create({
      data: {
        jobId: job1.id,
        userId: tech1.id,
        action: 'STATUS_CHANGE',
        description: 'เปลี่ยนสถานะ: RECEIVED → IN_REPAIR',
      },
    }),
    prisma.activityLog.create({
      data: {
        jobId: job1.id,
        userId: tech1.id,
        action: 'ADD_PART',
        description: 'เบิกอะไหล่: Cooling Fan 120mm x2',
      },
    }),
    prisma.activityLog.create({
      data: {
        jobId: job1.id,
        userId: tech1.id,
        action: 'STATUS_CHANGE',
        description: 'เปลี่ยนสถานะ: IN_REPAIR → COMPLETED',
      },
    }),
    // Job 2
    prisma.activityLog.create({
      data: {
        jobId: job2.id,
        userId: receptionist.id,
        action: 'CREATE_JOB',
        description: 'สร้างงานซ่อม RJ2025-0002',
      },
    }),
    prisma.activityLog.create({
      data: {
        jobId: job2.id,
        userId: tech2.id,
        action: 'ADD_PART',
        description: 'เบิกอะไหล่: Hash Board x1',
      },
    }),
  ]);

  console.log(`✅ สร้าง ${7} Activity Logs\n`);

  // สรุป
  console.log('═══════════════════════════════════════');
  console.log('🎉 Seed ข้อมูลเสร็จสมบูรณ์!\n');
  console.log('📊 สรุปข้อมูลที่สร้าง:');
  console.log('   - Users: 5 (admin, manager, 2 techs, receptionist)');
  console.log('   - Brands: 3 (Bitmain, MicroBT, Canaan)');
  console.log('   - Models: 6');
  console.log('   - Warranties: 3 (30, 90, 180 วัน)');
  console.log('   - Parts: 7 (มี 2 รายการสต๊อกต่ำ)');
  console.log('   - Customers: 5');
  console.log('   - Jobs: 5 (สถานะต่างๆ)');
  console.log('   - Repair Records: 5');
  console.log('   - Job Parts: 4');
  console.log('   - Activity Logs: 7');
  console.log('\n🔑 ข้อมูล Login:');
  console.log('   Username: admin, manager, tech1, tech2, receptionist');
  console.log('   Password: 123456 (ทั้งหมด)');
  console.log('\n💡 ทดสอบได้เลย:');
  console.log('   - Dashboard: ดูสถิติและงานล่าสุด');
  console.log('   - Jobs: ดูงานซ่อม 5 งาน สถานะต่างๆ');
  console.log('   - Parts: มีอะไหล่ 2 รายการสต๊อกต่ำ');
  console.log('   - Customers: มีลูกค้า 5 ราย');
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

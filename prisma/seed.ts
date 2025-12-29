import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('開始種子數據...');

  // 創建初始超級管理員
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: '系統管理員',
        role: UserRole.SUPER_ADMIN,
      },
    });

    console.log('✅ 創建初始管理員:', admin.email);
    console.log('   密碼:', adminPassword);
  } else {
    console.log('ℹ️  管理員已存在:', adminEmail);
  }

  console.log('種子數據完成！');
}

main()
  .catch((e) => {
    console.error('種子數據錯誤:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


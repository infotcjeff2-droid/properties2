const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const storageFile = path.join(process.cwd(), '.data', 'storage.json');

// 讀取存儲文件
const storage = JSON.parse(fs.readFileSync(storageFile, 'utf-8'));

// 生成新的密碼哈希
const newPassword = 'admin123';
const newHash = bcrypt.hashSync(newPassword, 12);

console.log('Generated hash:', newHash);

// 驗證哈希
const isValid = bcrypt.compareSync(newPassword, newHash);
console.log('Hash is valid:', isValid);

// 更新管理員密碼
const adminIndex = storage.users.findIndex(u => u.email === 'admin@example.com');
if (adminIndex !== -1) {
  storage.users[adminIndex].password = newHash;
  storage.users[adminIndex].updatedAt = new Date().toISOString();
  console.log('Updated admin password');
} else {
  console.log('Admin user not found, creating...');
  storage.users.push({
    id: 'admin-1',
    email: 'admin@example.com',
    password: newHash,
    name: '系統管理員',
    role: 'SUPER_ADMIN',
    companyId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// 保存文件
fs.writeFileSync(storageFile, JSON.stringify(storage, null, 2));
console.log('Storage file updated successfully');

// 再次驗證
const updatedStorage = JSON.parse(fs.readFileSync(storageFile, 'utf-8'));
const updatedAdmin = updatedStorage.users.find(u => u.email === 'admin@example.com');
if (updatedAdmin) {
  const finalCheck = bcrypt.compareSync(newPassword, updatedAdmin.password);
  console.log('Final verification:', finalCheck);
  if (finalCheck) {
    console.log('✅ Admin password reset successful!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } else {
    console.log('❌ Password verification failed');
  }
}


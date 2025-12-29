import { compare, hash } from 'bcryptjs';
import { serverStorage } from './server-storage';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string = 'STAFF',
  companyId?: string
) {
  const hashedPassword = await hashPassword(password);
  
  return serverStorage.users.create({
    email,
    password: hashedPassword,
    name,
    role,
    companyId: companyId || null,
  });
}

export async function getUserByEmail(email: string) {
  const user = serverStorage.users.getByEmail(email);
  if (!user) return null;
  
  // 獲取公司信息
  let company = null;
  if (user.companyId) {
    company = serverStorage.companies.getById(user.companyId);
  }
  
  return { ...user, company };
}

export async function verifyUser(email: string, password: string) {
  try {
    // #region agent log
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const logEntry1 = JSON.stringify({
      location: 'auth.ts:42',
      message: 'verifyUser called',
      data: { email },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-2'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry1); } catch (e) {}
    // #endregion

    const user = await getUserByEmail(email);
    
    // #region agent log
    const logEntry2 = JSON.stringify({
      location: 'auth.ts:46',
      message: 'getUserByEmail result',
      data: { hasUser: !!user, userId: user?.id },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-2'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry2); } catch (e) {}
    // #endregion
    
    if (!user) {
      return null;
    }
    
    // #region agent log
    const logEntry3a = JSON.stringify({
      location: 'auth.ts:80',
      message: 'Before password verification',
      data: { 
        hasPassword: !!password,
        hasHashedPassword: !!user.password,
        passwordLength: password?.length,
        hashedPasswordPrefix: user.password?.substring(0, 10)
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'HYP-1'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry3a); } catch (e) {}
    // #endregion

    const isValid = await verifyPassword(password, user.password);
    
    // #region agent log
    const logEntry3 = JSON.stringify({
      location: 'auth.ts:95',
      message: 'Password verification result',
      data: { isValid, passwordLength: password?.length },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'HYP-1'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry3); } catch (e) {}
    // #endregion
    
    if (!isValid) {
      return null;
    }
    
    // 不返回密碼
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error: any) {
    // #region agent log
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), '.cursor', 'debug.log');
    const logEntry = JSON.stringify({
      location: 'auth.ts:58',
      message: 'verifyUser error',
      data: { 
        errorMessage: error?.message, 
        errorName: error?.name 
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'login-debug',
      hypothesisId: 'LOGIN-3'
    }) + '\n';
    try { fs.appendFileSync(logPath, logEntry); } catch (e) {}
    // #endregion
    throw error;
  }
}


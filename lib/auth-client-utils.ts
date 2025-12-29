// 客戶端可用的認證工具函數（不依賴服務器端功能）

export function isAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function isCompanyAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN';
}

// 檢查是否為訪客（有 guest-access cookie 但沒有 auth-token）
export function isGuest(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 檢查是否有 guest-access cookie
  const hasGuestAccess = document.cookie.includes('guest-access=true');
  
  // 檢查是否有 auth-token cookie
  const hasAuthToken = document.cookie.includes('auth-token=');
  
  // 如果有訪客訪問標記但沒有認證 token，則為訪客
  return hasGuestAccess && !hasAuthToken;
}

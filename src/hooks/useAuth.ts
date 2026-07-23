/**
 * ConvertSafely - useAuth Hook
 * 从 AuthContext 获取全局认证状态
 * 所有组件共享同一份认证状态
 */

import { useAuthContext } from '@/context/AuthContext';

/**
 * 使用认证的 Hook
 * 必须在 AuthProvider 内部使用
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;

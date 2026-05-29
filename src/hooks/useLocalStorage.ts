/**
 * ConvertSafely - useLocalStorage Hook
 * 提供类型安全的本地存储操作
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 本地存储 Hook 选项
 */
interface UseLocalStorageOptions<T> {
  /** 序列化函数 */
  serialize?: (value: T) => string;
  /** 反序列化函数 */
  deserialize?: (value: string) => T;
  /** 默认值 */
  defaultValue?: T;
}

/**
 * 使用本地存储的 Hook
 * @param key - 存储键名
 * @param options - 配置选项
 * @returns [存储值, 设置值函数, 移除值函数]
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    defaultValue,
  } = options;

  // 获取初始值
  const getInitialValue = useCallback((): T | undefined => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return deserialize(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, deserialize, defaultValue]);

  const [storedValue, setStoredValue] = useState<T | undefined>(getInitialValue);

  // 监听 storage 事件（跨标签页同步）
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(deserialize(event.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  // 设置值
  const setValue = useCallback(
    (value: T | ((prev: T | undefined) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue]
  );

  // 移除值
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * 使用会话存储的 Hook
 * 与 useLocalStorage 类似，但数据在会话结束时清除
 */
export function useSessionStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    defaultValue,
  } = options;

  const getInitialValue = useCallback((): T | undefined => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return deserialize(item);
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, deserialize, defaultValue]);

  const [storedValue, setStoredValue] = useState<T | undefined>(getInitialValue);

  const setValue = useCallback(
    (value: T | ((prev: T | undefined) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, serialize(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, serialize, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;

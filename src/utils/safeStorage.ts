const memoryStorageMap = new Map<string, string>();

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return memoryStorageMap.get(key) ?? null;
  },
  setItem: (key: string, val: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, val);
      }
    } catch {}
    memoryStorageMap.set(key, val);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch {}
    memoryStorageMap.delete(key);
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.clear();
      }
    } catch {}
    memoryStorageMap.clear();
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        return window.sessionStorage.getItem(key);
      }
    } catch {}
    return memoryStorageMap.get(`session_${key}`) ?? null;
  },
  setItem: (key: string, val: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        window.sessionStorage.setItem(key, val);
      }
    } catch {}
    memoryStorageMap.set(`session_${key}`, val);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch {}
    memoryStorageMap.delete(`session_${key}`);
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
        window.sessionStorage.clear();
      }
    } catch {}
    memoryStorageMap.clear();
  },
};

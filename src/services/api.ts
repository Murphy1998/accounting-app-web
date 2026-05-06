const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

// 获取记录
export async function fetchRecords(deviceId: string): Promise<Record[]> {
  try {
    const res = await fetch(`${API_BASE}/api/account?device_id=${encodeURIComponent(deviceId)}`);
    if (!res.ok) throw new Error('获取记录失败');
    return await res.json();
  } catch (error) {
    console.error('fetchRecords error:', error);
    return [];
  }
}

// 添加记录
export async function addRecord(record: Omit<Record, 'id' | 'created_at'>): Promise<Record | null> {
  try {
    const res = await fetch(`${API_BASE}/api/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('添加记录失败');
    return await res.json();
  } catch (error) {
    console.error('addRecord error:', error);
    return null;
  }
}

// 删除记录
export async function deleteRecord(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('删除记录失败');
    return true;
  } catch (error) {
    console.error('deleteRecord error:', error);
    return false;
  }
}

// 获取设备ID
export async function getDeviceId(): Promise<string> {
  const storageKey = 'accounting_device_id';
  
  // 尝试从 localStorage 获取
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    
    // 生成新的设备ID
    const newId = 'web_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(storageKey, newId);
    return newId;
  }
  
  return 'unknown_device';
}

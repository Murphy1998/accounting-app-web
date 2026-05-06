// Supabase 配置
const SUPABASE_URL = 'https://wfxejunpzxfnfesrckhh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmeGVqdW5wenhmbmZlc3Jja2hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg3ODAzNSwiZXhwIjoyMDkzNDU0MDM1fQ.GkNftzs-Zh8dEInaCgTy2091mQx5FAeZAGToeKjfk98';

export interface Record {
  id?: number;
  device_id: string;
  amount: string;
  type: 'income' | 'expense';
  category_id: string;
  category_name: string;
  note: string;
  date: string;
  created_at?: string;
}

// 获取设备ID
export async function getDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

// 获取所有记录
export async function fetchRecords(deviceId: string): Promise<Record[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/account_records?device_id=eq.${encodeURIComponent(deviceId)}&order=date.desc,created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Fetch records error:', error);
      // 如果是 RLS 错误，返回本地缓存
      return getLocalRecords();
    }
    
    const data = await response.json();
    // 保存到本地缓存
    saveLocalRecords(data);
    return data;
  } catch (error) {
    console.error('Fetch records failed:', error);
    return getLocalRecords();
  }
}

// 添加记录
export async function addRecord(record: Omit<Record, 'id' | 'created_at'>): Promise<Record | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/account_records`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(record),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Add record error:', error);
      // 保存到本地作为备份
      saveLocalRecord(record);
      return null;
    }
    
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Add record failed:', error);
    // 保存到本地作为备份
    saveLocalRecord(record);
    return null;
  }
}

// 删除记录
export async function deleteRecord(id: number): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/account_records?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Delete record error:', await response.json());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Delete record failed:', error);
    return false;
  }
}

// 本地存储备份
function saveLocalRecords(records: Record[]) {
  try {
    localStorage.setItem('account_records', JSON.stringify(records));
  } catch (e) {
    console.error('Save local records failed:', e);
  }
}

function getLocalRecords(): Record[] {
  try {
    const data = localStorage.getItem('account_records');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Get local records failed:', e);
    return [];
  }
}

function saveLocalRecord(record: Omit<Record, 'id' | 'created_at'>) {
  try {
    const records = getLocalRecords();
    const newRecord = { ...record, id: Date.now() } as Record;
    records.unshift(newRecord);
    saveLocalRecords(records);
  } catch (e) {
    console.error('Save local record failed:', e);
  }
}

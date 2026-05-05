import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://wfxejunpzxfnfesrckhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmeGVqdW5wenhmbmZlc3Jja2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzgwMzUsImV4cCI6MjA5MzQ1NDAzNX0.TJGyL_E_qCYxQYoimXcYdrUDFrAJntZfbCQKXvDXxCE';

const DEVICE_ID_KEY = 'account_device_id';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// 获取或生成设备ID
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'web_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    return 'temp_' + Date.now().toString(36);
  }
};

// 获取记录列表
export const fetchRecords = async () => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/account_records?select=*&order=created_at.desc&limit=100`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      console.error('Fetch failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Fetch records failed:', error);
    return [];
  }
};

// 添加记录
export const addRecord = async (record: {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note?: string;
}) => {
  const deviceId = await getDeviceId();
  
  const categoryMap: Record<string, string> = {
    food: '餐饮',
    transport: '交通',
    shopping: '购物',
    entertainment: '娱乐',
    housing: '居住',
    medical: '医疗',
    salary: '工资',
    other: '其他',
  };
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/account_records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: record.amount.toString(),
        type: record.type,
        category_id: record.category,
        category_name: categoryMap[record.category] || record.category,
        note: record.note || '',
        device_id: deviceId,
        date: new Date().toISOString().split('T')[0],
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Add failed:', response.status, errorText);
      throw new Error(`添加失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Add record failed:', error);
    throw error;
  }
};

// 删除记录
export const deleteRecord = async (id: number) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/account_records?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      console.error('Delete failed:', response.status);
      throw new Error(`删除失败: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Delete record failed:', error);
    throw error;
  }
};

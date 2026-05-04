import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wfxejunpzxfnfesrckhh.supabase.co';
const DEVICE_ID_KEY = 'account_device_id';

// 获取或生成设备ID
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // 生成一个简单的设备ID
      deviceId = 'web_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    // 如果获取失败，生成一个临时ID
    return 'temp_' + Date.now().toString(36);
  }
};

// API 请求函数
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const deviceId = await getDeviceId();
  const url = `${API_BASE_URL}/functions/v1/${endpoint}?device_id=${deviceId}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 获取记录列表
export const fetchRecords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rest/v1/account_records?select=*&order=created_at.desc&limit=100`, {
      headers: {
        'apikey': 'sb_publishable_PkuRZrvLSVbJLK00EXaajg_6Ip4nTqI',
        'Authorization': 'Bearer sb_publishable_PkuRZrvLSVbJLK00EXaajg_6Ip4nTqI',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
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
  
  try {
    const response = await fetch(`${API_BASE_URL}/rest/v1/account_records`, {
      method: 'POST',
      headers: {
        'apikey': 'sb_publishable_PkuRZrvLSVbJLK00EXaajg_6Ip4nTqI',
        'Authorization': 'Bearer sb_publishable_PkuRZrvLSVbJLK00EXaajg_6Ip4nTqI',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        device_id: deviceId,
        amount: record.amount,
        type: record.type,
        category: record.category,
        note: record.note || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error('Add record failed:', error);
    throw error;
  }
};

// 删除记录
export const deleteRecord = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rest/v1/account_records?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': 'sb_publishable_PkuRZrvLSVbJLK00EXaajg_6Ip4nTqI',
        'Authorization': 'Bearer sb_publishable_PkuRZrvLSVbJLK00EXaajg_6Ip4nTqI',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Delete record failed:', error);
    throw error;
  }
};

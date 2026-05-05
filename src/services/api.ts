import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://wfxejunpzxfnfesrckhh.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmeGVqdW5wenhmbmZlc3Jja2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzgwMzUsImV4cCI6MjA5MzQ1NDAzNX0.TJGyL_E_qCYxQYoimXcYdrUDFrAJntZfbCQKXvDXxCE';

const DEVICE_ID_KEY = 'account_device_id';

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const { data, error } = await supabase
      .from('account_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('Fetch records error:', error);
      return [];
    }
    
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
  
  // 分类映射
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
    const { data, error } = await supabase
      .from('account_records')
      .insert({
        amount: record.amount.toString(),
        type: record.type,
        category_id: record.category,
        category_name: categoryMap[record.category] || record.category,
        note: record.note || '',
        device_id: deviceId,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Add record error:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Add record failed:', error);
    throw error;
  }
};

// 删除记录
export const deleteRecord = async (id: number) => {
  try {
    const { error } = await supabase
      .from('account_records')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Delete record error:', error);
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Delete record failed:', error);
    throw error;
  }
};

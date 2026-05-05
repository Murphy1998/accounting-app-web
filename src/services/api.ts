import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://wfxejunpzxfnfesrckhh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmeGVqdW5wenhmbmZlc3Jja2hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg3ODAzNSwiZXhwIjoyMDkzNDU0MDM1fQ.GkNftzs-Zh8dEInaCgTy2091mQx5FAeZAGToeKjfk98';

const DEVICE_ID_KEY = 'account_device_id';

const headers = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// 获取或生成设备ID

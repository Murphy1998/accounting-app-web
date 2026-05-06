import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query: { device_id }, body } = req;

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('account_records')
        .select('*')
        .eq('device_id', device_id || '')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (method === 'POST') {
      const { data, error } = await supabase
        .from('account_records')
        .insert([body])
        .select();

      if (error) throw error;
      return res.status(201).json(data?.[0] || null);
    }

    if (method === 'DELETE') {
      const { id } = body;
      const { error } = await supabase
        .from('account_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome6 } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { fetchRecords, addRecord, deleteRecord, getDeviceId } from '@/services/api';

// 记账类型定义
type TransactionType = 'income' | 'expense';

// 分类定义
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const categories: Category[] = [
  { id: 'food', name: '餐饮', icon: 'utensils', color: '#FF6B6B' },
  { id: 'transport', name: '交通', icon: 'car', color: '#4ECDC4' },
  { id: 'shopping', name: '购物', icon: 'shopping-bag', color: '#FF9F43' },
  { id: 'entertainment', name: '娱乐', icon: 'gamepad', color: '#A55EEA' },
  { id: 'housing', name: '居住', icon: 'home', color: '#26DE81' },
  { id: 'medical', name: '医疗', icon: 'heart', color: '#FC5C65' },
  { id: 'salary', name: '工资', icon: 'wallet', color: '#2ED573' },
  { id: 'other', name: '其他', icon: 'ellipsis-h', color: '#7ED6DF' },
];

// 记账记录接口
interface Record {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  created_at: string;
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export default function AccountPage() {
  // 状态
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  const [note, setNote] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');

  // 加载数据
  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const id = await getDeviceId();
      setDeviceId(id);
      const data = await fetchRecords();
      // 过滤当前设备的数据
      const filteredData = data.filter((r: Record) => r.device_id === id || !r.device_id);
      setRecords(filteredData || []);
    } catch (error) {
      console.error('Failed to load records:', error);
      // 降级到空列表
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // 计算统计数据
  const getStatistics = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;

    records.forEach((record) => {
      const recordDate = new Date(record.created_at);
      if (
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      ) {
        const recordAmount = record.amount || 0;
        if (record.type === 'income') {
          totalIncome += recordAmount;
        } else {
          totalExpense += recordAmount;
        }
      }
    });

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [records]);

  // 提交记录
  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('提示', '请输入有效金额');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('提示', '请选择分类');
      return;
    }

    try {
      setIsSubmitting(true);
      const newRecord = await addRecord({
        amount: parseFloat(amount),
        type: selectedType,
        category: selectedCategory,
        note: note,
      });

      // 添加到列表头部
      setRecords([newRecord, ...records]);

      // 重置表单
      setAmount('');
      setNote('');
      setSelectedCategory('');
      
      Alert.alert('成功', '记录已保存');
    } catch (error) {
      console.error('Failed to add record:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除记录
  const handleDelete = async (id: number) => {
    Alert.alert('确认', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(id);
            setRecords(records.filter((r) => r.id !== id));
          } catch (error) {
            console.error('Failed to delete record:', error);
            Alert.alert('错误', '删除失败，请重试');
          }
        },
      },
    ]);
  };

  const stats = getStatistics();
  const statsColors = selectedType === 'expense' 
    ? { primary: '#FC5C65', secondary: '#FF6B81' }
    : { primary: '#2ED573', secondary: '#7BED9F' };

  // 获取分类信息
  const getCategory = (categoryId: string): Category => {
    return categories.find((c) => c.id === categoryId) || categories[7];
  };

  // 渲染单条记录
  const renderRecord = ({ item }: { item: Record }) => {
    const category = getCategory(item.category);
    const isExpense = item.type === 'expense';

    return (
      <View className="flex-row items-center justify-between py-3 px-4 mb-2 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: category.color + '20' }}>
            <FontAwesome6 name={category.icon as any} size={18} color={category.color} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">{category.name}</Text>
            <Text className="text-gray-400 text-xs mt-0.5">{item.note || formatDate(item.created_at)}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className={`text-base font-semibold mr-3 ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
            {isExpense ? '-' : '+'}¥{item.amount.toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-1">
            <FontAwesome6 name="trash" size={14} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Screen statusBarStyle="light">
      {/* 渐变背景 */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 标题 */}
          <View className="pt-12 pb-4 px-5">
            <Text className="text-2xl font-bold text-white">个人记账</Text>
            <Text className="text-gray-400 text-sm mt-1">轻松记录每一笔收支</Text>
          </View>

          {/* 统计卡片 - 毛玻璃效果 */}
          <View className="mx-4 mb-5 rounded-3xl overflow-hidden">
            <BlurView intensity={40} tint="dark" style={{ padding: 20 }}>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-gray-400 text-xs">本月收入</Text>
                  <Text className="text-green-400 text-xl font-bold mt-1">
                    ¥{stats.income.toFixed(2)}
                  </Text>
                </View>
                <View className="w-px bg-gray-700" />
                <View className="items-center flex-1">
                  <Text className="text-gray-400 text-xs">本月支出</Text>
                  <Text className="text-red-400 text-xl font-bold mt-1">
                    ¥{stats.expense.toFixed(2)}
                  </Text>
                </View>
                <View className="w-px bg-gray-700" />
                <View className="items-center flex-1">
                  <Text className="text-gray-400 text-xs">本月结余</Text>
                  <Text className={`text-xl font-bold mt-1 ${stats.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                    ¥{stats.balance.toFixed(2)}
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* 收支类型切换 - 毛玻璃效果 */}
          <View className="mx-4 mb-5 rounded-2xl overflow-hidden">
            <BlurView intensity={30} tint="dark" style={{ padding: 6 }}>
              <View className="flex-row rounded-xl overflow-hidden">
                <TouchableOpacity
                  className="flex-1 py-3 items-center rounded-xl"
                  style={selectedType === 'expense' ? { backgroundColor: '#FC5C65' } : {}}
                  onPress={() => setSelectedType('expense')}
                >
                  <Text className={`font-medium ${selectedType === 'expense' ? 'text-white' : 'text-gray-400'}`}>
                    支出
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 items-center rounded-xl"
                  style={selectedType === 'income' ? { backgroundColor: '#2ED573' } : {}}
                  onPress={() => setSelectedType('income')}
                >
                  <Text className={`font-medium ${selectedType === 'income' ? 'text-white' : 'text-gray-400'}`}>
                    收入
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          {/* 金额输入区域 - 毛玻璃效果 */}
          <View className="mx-4 mb-4 rounded-2xl overflow-hidden">
            <BlurView intensity={30} tint="dark" style={{ padding: 20 }}>
              <Text className="text-gray-400 text-sm mb-2">金额</Text>
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-white mr-2">¥</Text>
                <TextInput
                  className="flex-1 text-3xl font-bold text-white"
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </BlurView>
          </View>

          {/* 分类选择 - 毛玻璃效果 */}
          <View className="mx-4 mb-4 rounded-2xl overflow-hidden">
            <BlurView intensity={30} tint="dark" style={{ padding: 16 }}>
              <Text className="text-gray-400 text-sm mb-3">分类</Text>
              <View className="flex-row flex-wrap">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className="w-1/4 items-center mb-3"
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-1"
                      style={{
                        backgroundColor: selectedCategory === cat.id ? cat.color : cat.color + '20',
                        borderWidth: selectedCategory === cat.id ? 2 : 0,
                        borderColor: cat.color,
                      }}
                    >
                      <FontAwesome6
                        name={cat.icon as any}
                        size={22}
                        color={selectedCategory === cat.id ? '#fff' : cat.color}
                      />
                    </View>
                    <Text className={`text-xs ${selectedCategory === cat.id ? 'text-white' : 'text-gray-400'}`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          </View>

          {/* 备注输入 - 毛玻璃效果 */}
          <View className="mx-4 mb-4 rounded-2xl overflow-hidden">
            <BlurView intensity={30} tint="dark" style={{ padding: 16 }}>
              <Text className="text-gray-400 text-sm mb-2">备注（可选）</Text>
              <TextInput
                className="text-white text-sm"
                placeholder="添加备注..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </BlurView>
          </View>

          {/* 提交按钮 */}
          <View className="mx-4 mb-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[statsColors.primary, statsColors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 rounded-2xl items-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-lg font-bold">保存记录</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 记录列表 */}
          <View className="px-4 pb-10">
            <Text className="text-white font-semibold mb-3">最近记录</Text>
            
            {isLoading ? (
              <View className="items-center py-10">
                <ActivityIndicator color="#fff" size="large" />
              </View>
            ) : records.length === 0 ? (
              <View className="items-center py-10">
                <FontAwesome6 name="receipt" size={48} color="rgba(255,255,255,0.2)" />
                <Text className="text-gray-500 mt-3">暂无记录</Text>
              </View>
            ) : (
              <FlatList
                data={records}
                renderItem={renderRecord}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
}

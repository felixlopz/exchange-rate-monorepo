import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletsStore } from '../store/wallets';
import { useWalletTransactionsStore } from '../store/walletTransactions';
import { useCategoriesStore } from '../store/categories';
import { COLORS, CURRENCIES } from '../constants';
import { TransactionType } from '../types';

export default function AddWalletTransactionScreen({ route, navigation }: any) {
  const { walletId } = route.params;
  const allWallets = useWalletsStore((state) => state.wallets);
  const addTransaction = useWalletTransactionsStore((state) => state.addTransaction);
  const categories = useCategoriesStore((state) => state.categories);

  const wallet = allWallets.find(w => w.id === walletId);

  const [type, setType] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date());

  // Get categories for current type
  const filteredCategories = categories.filter(cat => cat.type === type);

  if (!wallet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-textSecondary">Cuenta no encontrada</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (!categoryId) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return;
    }

    try {
      await addTransaction({
        wallet_id: walletId,
        type,
        amount: parsedAmount,
        currency: wallet.currency,
        category_id: categoryId,
        name: name.trim(),
        transaction_date: date.toISOString(),
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la transacción');
    }
  };

  const currencySymbol = CURRENCIES[wallet.currency].symbol;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-4 py-6 border-b border-border">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-textPrimary">Nueva Transacción</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
              Guardar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Type Toggle */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Tipo</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setType('income');
                setCategoryId(''); // Reset category when type changes
              }}
              className={`flex-1 px-4 py-3 rounded-xl items-center ${
                type === 'income' ? 'bg-success' : 'bg-surface'
              }`}
              style={type !== 'income' ? { borderWidth: 1, borderColor: COLORS.border } : {}}
            >
              <Text
                className={`text-base font-semibold ${
                  type === 'income' ? 'text-white' : 'text-textPrimary'
                }`}
              >
                Ingreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setType('expense');
                setCategoryId(''); // Reset category when type changes
              }}
              className={`flex-1 px-4 py-3 rounded-xl items-center ${
                type === 'expense' ? 'bg-danger' : 'bg-surface'
              }`}
              style={type !== 'expense' ? { borderWidth: 1, borderColor: COLORS.border } : {}}
            >
              <Text
                className={`text-base font-semibold ${
                  type === 'expense' ? 'text-white' : 'text-textPrimary'
                }`}
              >
                Gasto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Monto</Text>
          <View className="flex-row items-center bg-surface px-4 py-3 rounded-xl border border-border">
            <Text className="text-2xl font-bold text-textSecondary mr-2">
              {currencySymbol}
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="decimal-pad"
              className="flex-1 text-2xl font-bold text-textPrimary"
            />
          </View>
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Categoría</Text>
          <View className="flex-row flex-wrap gap-2">
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setCategoryId(category.id)}
                className={`px-4 py-3 rounded-xl flex-row items-center ${
                  categoryId === category.id ? 'border-2' : 'bg-surface'
                }`}
                style={
                  categoryId === category.id
                    ? { backgroundColor: `${category.color}20`, borderColor: category.color }
                    : { borderWidth: 1, borderColor: COLORS.border }
                }
              >
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                <Text
                  className={`text-sm font-medium ${
                    categoryId === category.id ? 'text-textPrimary' : 'text-textPrimary'
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name/Description Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Descripción</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Compras, Salario, etc."
            placeholderTextColor={COLORS.textTertiary}
            className="bg-surface px-4 py-3 rounded-xl text-base text-textPrimary"
            style={{ borderWidth: 1, borderColor: COLORS.border }}
          />
        </View>

        {/* Date Display */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Fecha</Text>
          <View className="bg-surface px-4 py-3 rounded-xl border border-border">
            <Text className="text-base text-textPrimary">
              {date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Wallet Info */}
        <View className="bg-surfaceAlt p-4 rounded-xl">
          <Text className="text-xs text-textSecondary mb-1">Cuenta</Text>
          <Text className="text-base font-semibold text-textPrimary">{wallet.name}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
import {
  COLORS,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ICONS,
  WALLET_COLORS,
} from '../constants';
import { AccountType } from '../types';

export default function AddWalletScreen({ navigation }: any) {
  const addWallet = useWalletsStore((state) => state.addWallet);

  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('banco');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'VES'>('USD');
  const [initialBalance, setInitialBalance] = useState('0');
  const [selectedColor, setSelectedColor] = useState(WALLET_COLORS[0]);

  const accountTypes: AccountType[] = [
    'efectivo',
    'banco',
    'crédito',
    'débito',
    'ahorros',
    'inversión',
    'otro',
  ];

  const currencies: ('USD' | 'EUR' | 'VES')[] = ['USD', 'EUR', 'VES'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
      return;
    }

    const balance = parseFloat(initialBalance) || 0;

    try {
      await addWallet({
        name: name.trim(),
        account_type: accountType,
        currency,
        initial_balance: balance,
        is_active: true,
        metadata: {
          color: selectedColor,
        },
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cuenta');
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-4 py-6 border-b border-border">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-textPrimary">Nueva Cuenta</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
              Guardar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Banco Principal, Efectivo..."
            placeholderTextColor={COLORS.textTertiary}
            className="bg-surface px-4 py-3 rounded-xl text-base text-textPrimary"
            style={{ borderWidth: 1, borderColor: COLORS.border }}
          />
        </View>

        {/* Account Type */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Tipo de Cuenta</Text>
          <View className="flex-row flex-wrap gap-2">
            {accountTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setAccountType(type)}
                className={`px-4 py-3 rounded-xl flex-row items-center ${
                  accountType === type ? 'bg-primary' : 'bg-surface'
                }`}
                style={
                  accountType !== type
                    ? { borderWidth: 1, borderColor: COLORS.border }
                    : {}
                }
              >
                <Ionicons
                  name={ACCOUNT_TYPE_ICONS[type] as any}
                  size={18}
                  color={accountType === type ? 'white' : COLORS.textPrimary}
                />
                <Text
                  className={`ml-2 text-sm font-medium ${
                    accountType === type ? 'text-white' : 'text-textPrimary'
                  }`}
                >
                  {ACCOUNT_TYPE_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Moneda</Text>
          <View className="flex-row gap-2">
            {currencies.map((cur) => (
              <TouchableOpacity
                key={cur}
                onPress={() => setCurrency(cur)}
                className={`flex-1 px-4 py-3 rounded-xl items-center ${
                  currency === cur ? 'bg-primary' : 'bg-surface'
                }`}
                style={
                  currency !== cur ? { borderWidth: 1, borderColor: COLORS.border } : {}
                }
              >
                <Text
                  className={`text-base font-semibold ${
                    currency === cur ? 'text-white' : 'text-textPrimary'
                  }`}
                >
                  {cur}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Initial Balance */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">
            Balance Inicial
          </Text>
          <TextInput
            value={initialBalance}
            onChangeText={setInitialBalance}
            placeholder="0.00"
            placeholderTextColor={COLORS.textTertiary}
            keyboardType="decimal-pad"
            className="bg-surface px-4 py-3 rounded-xl text-base text-textPrimary"
            style={{ borderWidth: 1, borderColor: COLORS.border }}
          />
        </View>

        {/* Color Picker */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Color</Text>
          <View className="flex-row flex-wrap gap-3">
            {WALLET_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

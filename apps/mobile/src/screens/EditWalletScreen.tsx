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

export default function EditWalletScreen({ route, navigation }: any) {
  const { walletId } = route.params;
  const allWallets = useWalletsStore((state) => state.wallets);
  const updateWallet = useWalletsStore((state) => state.updateWallet);
  const deleteWallet = useWalletsStore((state) => state.deleteWallet);

  const wallet = allWallets.find(w => w.id === walletId);

  const [name, setName] = useState(wallet?.name || '');
  const [accountType, setAccountType] = useState<AccountType>(
    wallet?.account_type || 'banco'
  );
  const [selectedColor, setSelectedColor] = useState(
    wallet?.metadata?.color || WALLET_COLORS[0]
  );
  const [notes, setNotes] = useState(wallet?.metadata?.notes || '');

  const accountTypes: AccountType[] = [
    'efectivo',
    'banco',
    'crédito',
    'débito',
    'ahorros',
    'inversión',
    'otro',
  ];

  if (!wallet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-textSecondary">Cuenta no encontrada</Text>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
      return;
    }

    updateWallet(walletId, {
      name: name.trim(),
      account_type: accountType,
      metadata: {
        ...wallet.metadata,
        color: selectedColor,
        notes: notes.trim() || undefined,
      },
    });

    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que deseas eliminar esta cuenta? Las transacciones se mantendrán pero la cuenta será desactivada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteWallet(walletId);
            navigation.navigate('WalletsList');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-4 py-6 border-b border-border">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-textPrimary">Editar Cuenta</Text>
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
            placeholder="Nombre de la cuenta"
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

        {/* Currency (Read-only) */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Moneda</Text>
          <View className="bg-surfaceAlt px-4 py-3 rounded-xl">
            <Text className="text-base text-textSecondary">{wallet.currency}</Text>
          </View>
          <Text className="text-xs text-textTertiary mt-1">
            La moneda no puede ser modificada después de crear la cuenta
          </Text>
        </View>

        {/* Balance Info (Read-only) */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">Balances</Text>
          <View className="bg-surfaceAlt px-4 py-3 rounded-xl">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-textSecondary">Balance Inicial:</Text>
              <Text className="text-sm text-textPrimary font-semibold">
                {wallet.initial_balance.toFixed(2)} {wallet.currency}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-textSecondary">Balance Actual:</Text>
              <Text className="text-sm text-textPrimary font-semibold">
                {wallet.current_balance.toFixed(2)} {wallet.currency}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-textTertiary mt-1">
            Los balances se actualizan automáticamente con las transacciones
          </Text>
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

        {/* Notes */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-textPrimary mb-2">
            Notas (Opcional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Agregar notas sobre esta cuenta..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-surface px-4 py-3 rounded-xl text-base text-textPrimary"
            style={{ borderWidth: 1, borderColor: COLORS.border, minHeight: 100 }}
          />
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-danger px-6 py-4 rounded-xl items-center mb-6"
        >
          <Text className="text-white font-semibold text-base">Eliminar Cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

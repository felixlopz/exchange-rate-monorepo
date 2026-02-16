import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletsStore } from '../store/wallets';
import { useWalletTransactionsStore } from '../store/walletTransactions';
import { useCategoriesStore } from '../store/categories';
import {
  COLORS,
  CURRENCIES,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ICONS,
} from '../constants';
import { useExchangeRates } from '../hooks/useExchangeRates';

export default function WalletDetailScreen({ route, navigation }: any) {
  const { walletId } = route.params;
  const allWallets = useWalletsStore((state) => state.wallets);
  const allTransactions = useWalletTransactionsStore((state) => state.transactions);
  const deleteTransaction = useWalletTransactionsStore((state) => state.deleteTransaction);
  const categories = useCategoriesStore((state) => state.categories);
  const { convertToVES, refresh: refreshRates } = useExchangeRates();

  const [refreshing, setRefreshing] = useState(false);

  // Get wallet
  const wallet = allWallets.find(w => w.id === walletId);

  // Get transactions for this wallet and sort by date
  const transactions = allTransactions
    .filter(tx => tx.wallet_id === walletId)
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

  // Calculate monthly stats
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyStats = transactions
    .filter(tx => {
      const date = new Date(tx.transaction_date);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    })
    .reduce(
      (stats, tx) => {
        if (tx.type === 'income') {
          stats.income += tx.amount;
        } else {
          stats.expense += tx.amount;
        }
        stats.balance = stats.income - stats.expense;
        return stats;
      },
      { income: 0, expense: 0, balance: 0 }
    );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  if (!wallet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-textSecondary">Cuenta no encontrada</Text>
      </View>
    );
  }

  const formatAmount = (amount: number, currency: 'USD' | 'EUR' | 'VES') => {
    const symbol = CURRENCIES[currency].symbol;
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleDeleteTransaction = (txId: string) => {
    Alert.alert(
      'Eliminar Transacción',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteTransaction(txId),
        },
      ]
    );
  };

  const navigateToAddTransaction = () => {
    navigation.navigate('AddWalletTransaction', { walletId: wallet.id });
  };

  const navigateToEditWallet = () => {
    navigation.navigate('EditWallet', { walletId: wallet.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.transaction_date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-4 py-6 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-textPrimary flex-1 ml-4">
            {wallet.name}
          </Text>
          <TouchableOpacity onPress={navigateToEditWallet}>
            <Ionicons name="create-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Wallet Info */}
        <View className="flex-row items-center mb-4">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: wallet.metadata?.color
                ? `${wallet.metadata.color}20`
                : `${COLORS.primary}20`,
            }}
          >
            <Ionicons
              name={ACCOUNT_TYPE_ICONS[wallet.account_type] as any}
              size={24}
              color={wallet.metadata?.color || COLORS.primary}
            />
          </View>
          <Text className="text-base text-textSecondary">
            {ACCOUNT_TYPE_LABELS[wallet.account_type]}
          </Text>
        </View>

        {/* Balance */}
        <View>
          <Text className="text-sm text-textSecondary mb-1">Balance Actual</Text>
          <Text
            className={`text-3xl font-bold ${
              wallet.current_balance >= 0 ? 'text-textPrimary' : 'text-danger'
            }`}
          >
            {formatAmount(wallet.current_balance, wallet.currency)}
          </Text>
          {wallet.currency !== 'VES' && (
            <Text className="text-lg text-textSecondary mt-1">
              ≈ {formatAmount(convertToVES(wallet.current_balance, wallet.currency), 'VES')}
            </Text>
          )}
        </View>
      </View>

      {/* Monthly Stats */}
      {transactions.length > 0 && (
        <View className="bg-surface mx-4 mt-4 p-4 rounded-2xl border border-border">
          <Text className="text-sm font-semibold text-textSecondary mb-3">Este Mes</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-textSecondary mb-1">Ingresos</Text>
              <Text className="text-base font-semibold text-success">
                {formatAmount(monthlyStats.income, wallet.currency)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-textSecondary mb-1">Gastos</Text>
              <Text className="text-base font-semibold text-danger">
                {formatAmount(monthlyStats.expense, wallet.currency)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-textSecondary mb-1">Balance</Text>
              <Text
                className={`text-base font-semibold ${
                  monthlyStats.balance >= 0 ? 'text-textPrimary' : 'text-danger'
                }`}
              >
                {formatAmount(monthlyStats.balance, wallet.currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Transactions List */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {transactions.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="receipt-outline" size={64} color={COLORS.textTertiary} />
            <Text className="text-lg font-semibold text-textPrimary mt-4">
              No hay transacciones
            </Text>
            <Text className="text-sm text-textSecondary mt-2 text-center">
              Agrega tu primera transacción para empezar
            </Text>
          </View>
        ) : (
          <View className="pb-20">
            {Object.entries(groupedTransactions).map(([dateKey, txs]) => (
              <View key={dateKey} className="mb-4">
                <Text className="text-sm font-semibold text-textSecondary mb-2">
                  {formatDate(txs[0].transaction_date)}
                </Text>
                {txs.map((tx) => {
                  const category = categories.find(cat => cat.id === tx.category_id);
                  return (
                    <TouchableOpacity
                      key={tx.id}
                      onLongPress={() => handleDeleteTransaction(tx.id)}
                      className="bg-surface p-4 rounded-xl mb-2 border border-border"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center">
                          {category && (
                            <View
                              className="w-10 h-10 rounded-full items-center justify-center mr-3"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <View
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                            </View>
                          )}
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-textPrimary">
                              {tx.name}
                            </Text>
                            <View className="flex-row items-center mt-1">
                              {category && (
                                <>
                                  <Text className="text-xs text-textSecondary">
                                    {category.name}
                                  </Text>
                                  <Text className="text-xs text-textTertiary mx-1">•</Text>
                                </>
                              )}
                              <Text className="text-xs text-textSecondary">
                                {new Date(tx.transaction_date).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text
                            className={`text-lg font-bold ${
                              tx.type === 'income' ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}{' '}
                            {formatAmount(tx.amount, tx.currency)}
                          </Text>
                          {tx.currency !== 'VES' && (
                            <Text className="text-xs text-textSecondary mt-1">
                              ≈ {formatAmount(convertToVES(tx.amount, tx.currency), 'VES')}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={navigateToAddTransaction}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: COLORS.primary,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

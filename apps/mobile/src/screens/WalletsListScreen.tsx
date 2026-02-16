import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWalletsStore } from '../store/wallets';
import { COLORS, CURRENCIES, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '../constants';
import { Wallet } from '../types';
import { useExchangeRates } from '../hooks/useExchangeRates';

export default function WalletsListScreen({ navigation }: any) {
  const allWallets = useWalletsStore((state) => state.wallets);
  const { convertToVES, refresh: refreshRates, loading: ratesLoading } = useExchangeRates();
  const [refreshing, setRefreshing] = useState(false);

  // Filter active wallets
  const wallets = allWallets.filter(w => w.is_active);

  // Calculate total balance
  const totals = wallets.reduce(
    (acc, wallet) => {
      const key = wallet.currency.toLowerCase() as 'usd' | 'ves' | 'eur';
      acc[key] += wallet.current_balance;
      return acc;
    },
    { usd: 0, ves: 0, eur: 0 }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };

  const navigateToAddWallet = () => {
    navigation.navigate('AddWallet');
  };

  const navigateToWalletDetail = (wallet: Wallet) => {
    navigation.navigate('WalletDetail', { walletId: wallet.id });
  };

  const formatAmount = (amount: number, currency: 'USD' | 'EUR' | 'VES') => {
    const symbol = CURRENCIES[currency].symbol;
    return `${symbol} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface px-4 py-6 border-b border-border">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-textPrimary">Cuentas</Text>
          <TouchableOpacity
            onPress={navigateToAddWallet}
            className="bg-primary rounded-full w-10 h-10 items-center justify-center"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        {wallets.length > 0 && (
          <View>
            <Text className="text-sm text-textSecondary mb-2">Balance Total</Text>
            <Text className="text-3xl font-bold text-textPrimary mb-1">
              {formatAmount(totals.usd, 'USD')}
            </Text>
            <Text className="text-lg text-textSecondary">
              ≈ {formatAmount(
                convertToVES(totals.usd, 'USD') +
                convertToVES(totals.eur, 'EUR') +
                totals.ves,
                'VES'
              )}
            </Text>
            {totals.eur > 0 && (
              <Text className="text-base text-textTertiary mt-1">
                {formatAmount(totals.eur, 'EUR')}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Wallets List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {wallets.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Ionicons name="wallet-outline" size={80} color={COLORS.textTertiary} />
            <Text className="text-xl font-semibold text-textPrimary mt-4 text-center">
              No tienes cuentas
            </Text>
            <Text className="text-base text-textSecondary mt-2 text-center">
              Crea tu primera cuenta para empezar a gestionar tus finanzas
            </Text>
            <TouchableOpacity
              onPress={navigateToAddWallet}
              className="bg-primary px-6 py-3 rounded-full mt-6"
            >
              <Text className="text-white font-semibold text-base">Crear Cuenta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-4 py-4 gap-3">
            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                onPress={() => navigateToWalletDetail(wallet)}
                className="bg-surface p-4 rounded-2xl border border-border"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: wallet.metadata?.color || COLORS.primary,
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: wallet.metadata?.color
                          ? `${wallet.metadata.color}20`
                          : `${COLORS.primary}20`,
                      }}
                    >
                      <Ionicons
                        name={ACCOUNT_TYPE_ICONS[wallet.account_type] as any}
                        size={20}
                        color={wallet.metadata?.color || COLORS.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-textPrimary">
                        {wallet.name}
                      </Text>
                      <Text className="text-sm text-textSecondary">
                        {ACCOUNT_TYPE_LABELS[wallet.account_type]} · {wallet.currency}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                </View>

                <View className="mt-2">
                  <Text
                    className={`text-2xl font-bold ${
                      wallet.current_balance >= 0 ? 'text-textPrimary' : 'text-danger'
                    }`}
                  >
                    {formatAmount(wallet.current_balance, wallet.currency)}
                  </Text>
                  {wallet.currency !== 'VES' && (
                    <Text className="text-sm text-textSecondary mt-1">
                      ≈ {formatAmount(convertToVES(wallet.current_balance, wallet.currency), 'VES')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

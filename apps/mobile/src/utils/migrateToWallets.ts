import { useTransactionsStore } from '../store/transactions';
import { useWalletsStore } from '../store/wallets';
import { useWalletTransactionsStore } from '../store/walletTransactions';
import { WalletTransaction } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MIGRATION_KEY = '@migration_to_wallets_completed';

/**
 * Migrate existing tracker transactions to wallet-based system
 * Creates a default "General" wallet and moves all transactions there
 */
export async function migrateToWallets(): Promise<boolean> {
  // Check if already migrated
  const migrated = await AsyncStorage.getItem(MIGRATION_KEY);
  if (migrated === 'true') {
    return false; // Already migrated
  }

  const oldTransactions = useTransactionsStore.getState().transactions;

  if (oldTransactions.length === 0) {
    // No transactions to migrate, mark as complete
    await AsyncStorage.setItem(MIGRATION_KEY, 'true');
    return false;
  }

  // Create default wallet for migrated transactions
  await useWalletsStore.getState().addWallet({
    name: 'Cuenta General',
    account_type: 'otro',
    currency: 'USD', // Default to USD
    initial_balance: 0,
    is_active: true,
    metadata: {
      notes: 'Transacciones migradas del sistema anterior',
    },
  });

  // Get the newly created wallet
  const wallets = useWalletsStore.getState().wallets;
  const migratedWallet = wallets[wallets.length - 1];

  // Migrate transactions
  for (const oldTx of oldTransactions) {
    const newTx: Omit<WalletTransaction, 'id' | 'user_id' | 'created_at'> = {
      wallet_id: migratedWallet.id,
      type: oldTx.type,
      amount: oldTx.amount,
      currency: oldTx.currency as 'USD' | 'VES',
      category_id: oldTx.categoryId,
      name: oldTx.name,
      transaction_date: oldTx.date,
    };

    await useWalletTransactionsStore.getState().addTransaction(newTx);
  }

  // Mark migration as complete
  await AsyncStorage.setItem(MIGRATION_KEY, 'true');

  return true; // Migration completed
}

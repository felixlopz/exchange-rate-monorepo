import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletsListScreen from '../screens/WalletsListScreen';
import WalletDetailScreen from '../screens/WalletDetailScreen';
import AddWalletScreen from '../screens/AddWalletScreen';
import EditWalletScreen from '../screens/EditWalletScreen';
import AddWalletTransactionScreen from '../screens/AddWalletTransactionScreen';

const Stack = createNativeStackNavigator();

export default function WalletsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletsList" component={WalletsListScreen} />
      <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
      <Stack.Screen name="AddWallet" component={AddWalletScreen} />
      <Stack.Screen name="EditWallet" component={EditWalletScreen} />
      <Stack.Screen
        name="AddWalletTransaction"
        component={AddWalletTransactionScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

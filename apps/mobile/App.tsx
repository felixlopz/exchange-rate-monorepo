import "./globals.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useEffect } from "react";
import ConverterScreen from "./src/screens/ConverterScreen";
import WalletsNavigator from "./src/navigation/WalletsNavigator";
import { COLORS } from "./src/constants";
import SettingsScreen from "@/screens/SettingsScreen";
import { migrateToWallets } from "./src/utils/migrateToWallets";

const Tab = createBottomTabNavigator();

export default function App() {
  // Run migration on app startup
  useEffect(() => {
    async function runMigration() {
      try {
        const migrated = await migrateToWallets();
        if (migrated) {
          console.log('Successfully migrated transactions to wallets');
        }
      } catch (error) {
        console.error('Migration failed:', error);
      }
    }
    runMigration();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: COLORS.surface,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
              },
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textSecondary,
            }}
          >
            <Tab.Screen
              name="Wallets"
              component={WalletsNavigator}
              options={{
                tabBarLabel: "Cuentas",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="wallet-outline" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Converter"
              component={ConverterScreen}
              options={{
                tabBarLabel: "Converter",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="swap-horizontal" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: "Settings",
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="cog" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

import "./globals.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import ConverterScreen from "./src/screens/ConverterScreen";
import TrackerScreen from "./src/screens/TrackerScreen";
import { COLORS } from "./src/constants";
import SettingsScreen from "@/screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
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
              name="Tracker"
              component={TrackerScreen}
              options={{
                tabBarLabel: "Tracker",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="wallet" size={size} color={color} />
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

import "./globals.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ConverterScreen from "./src/screens/ConverterScreen";
import TrackerScreen from "./src/screens/TrackerScreen";
import { COLORS } from "./src/constants";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView className="flex-1 bg-dark-300" edges={["top"]}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: "#111827",
                borderTopColor: "rgba(255,255,255,0.1)",
                borderTopWidth: 1,
              },
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
            }}
          >
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
              name="Tracker"
              component={TrackerScreen}
              options={{
                tabBarLabel: "Tracker",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="wallet" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

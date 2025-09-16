import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackParamList, TabParamList } from "./src/types/navigation";
import TabBarWithBadge from "./src/components/TabBarWithBadge";

// Import contexts
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { BLEProvider } from "./src/contexts/BLEContext";
import { PresenceProvider } from "./src/contexts/PresenceContext";
import { ConnectionsProvider } from "./src/contexts/ConnectionsContext";

// Import screens
import AuthScreen from "./src/screens/AuthScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ConnectionsScreen from "./src/screens/ConnectionsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ChatScreen from "./src/screens/ChatScreen";

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBarWithBadge {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Connections" component={ConnectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaProvider>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <PresenceProvider>
      <ConnectionsProvider>
        <BLEProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                  presentation: "modal",
                  headerShown: true,
                  title: "Chat",
                }}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </BLEProvider>
      </ConnectionsProvider>
    </PresenceProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

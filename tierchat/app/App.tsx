// ============================================================
// APP PRINCIPAL - TIERCHAT
// ============================================================
// Este es el punto de entrada de la app.
// Configura la navegación y el contexto de autenticación.
// ============================================================

import React from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/utils/constants';

// Pantallas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TierSelectionScreen from './src/screens/TierSelectionScreen';
import MemberListScreen from './src/screens/MemberListScreen';
import ChatScreen from './src/screens/ChatScreen';
import GroupChatScreen from './src/screens/GroupChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import GroupsScreen from './src/screens/GroupsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================================
// TABS PRINCIPALES (después de login y pago)
// ============================================================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          switch (route.name) {
            case 'Miembros':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Chats':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Grupos':
              iconName = focused ? 'layers' : 'layers-outline';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
      })}
    >
      <Tab.Screen name="Miembros" component={MemberListScreen} />
      <Tab.Screen name="Chats" component={ConversationsScreen} />
      <Tab.Screen name="Grupos" component={GroupsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ============================================================
// NAVEGACIÓN PRINCIPAL
// ============================================================
function AppNavigator() {
  const { user, isLoading, isLoggedIn } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {!isLoggedIn ? (
        // Si NO está logueado: mostrar login/registro
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Crear Cuenta' }}
          />
        </>
      ) : !user?.tier || !user?.subscriptionActive ? (
        // Si está logueado PERO no tiene tier: mostrar selección de tier
        <Stack.Screen
          name="TierSelection"
          component={TierSelectionScreen}
          options={{ title: 'Elegí tu Plan', headerBackVisible: false }}
        />
      ) : (
        // Si está logueado Y tiene tier activo: mostrar la app completa
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }: any) => ({
              title: route.params?.userName || 'Chat',
            })}
          />
          <Stack.Screen
            name="GroupChat"
            component={GroupChatScreen}
            options={({ route }: any) => ({
              title: route.params?.groupName || 'Grupo',
            })}
          />
          <Stack.Screen
            name="TierSelection"
            component={TierSelectionScreen}
            options={{ title: 'Cambiar Plan' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

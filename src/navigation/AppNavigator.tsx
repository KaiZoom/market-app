import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { CustomerNavigator } from './CustomerNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

// Configuração de linking para suportar navegação web (back/forward do navegador)
const linking: LinkingOptions<any> = {
  prefixes: [],
  config: {
    screens: {
      CustomerApp: {
        path: '',
        screens: {
          InitialRedirect: '',
          Markets: 'markets',
          Products: 'products/:marketId',
          CategoryProducts: 'products/:marketId/category/:category',
          Account: 'account',
          InformarEmail: 'checkout/email',
          CheckoutData: 'checkout/data',
          OrderStatus: 'order/:orderId',
        },
      },
      AdminApp: {
        path: 'admin',
        screens: {
          AdminDashboard: '',
          ManageProducts: 'products',
          AddProduct: 'products/add',
          EditProduct: 'products/edit/:productId',
          PendingOrders: 'orders',
          Reports: 'reports',
        },
      },
      Login: 'login',
    },
  },
};

export const AppNavigator: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  // Mostrar tela de loading enquanto carrega o usuário do storage
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && isAdmin() ? (
          // Admin logado vai para área administrativa
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        ) : (
          // Todos os outros acessam a área do cliente (sem necessidade de login)
          <>
            <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

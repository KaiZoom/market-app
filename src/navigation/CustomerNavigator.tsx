import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketSelectionScreen } from '../screens/customer/MarketSelectionScreen';
import { ProductsScreen } from '../screens/customer/ProductsScreen';
import { CategoryProductsScreen } from '../screens/customer/CategoryProductsScreen';
import { InformarEmailScreen } from '../screens/customer/InformarEmailScreen';
import { CheckoutDataScreen } from '../screens/customer/CheckoutDataScreen';
import { OrderStatusScreen } from '../screens/customer/OrderStatusScreen';
import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export const CustomerNavigator: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Markets"
        component={MarketSelectionScreen}
        options={{
          title: 'Mercados',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#F44336', fontWeight: 'bold' }}>Sair</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Produtos' }}
      />
      <Stack.Screen
        name="CategoryProducts"
        component={CategoryProductsScreen}
        options={{ title: 'Categoria' }}
      />
      <Stack.Screen
        name="InformarEmail"
        component={InformarEmailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CheckoutData"
        component={CheckoutDataScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatusScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketSelectionScreen } from '../screens/customer/MarketSelectionScreen';
import { ProductsScreen } from '../screens/customer/ProductsScreen';
import { CategoryProductsScreen } from '../screens/customer/CategoryProductsScreen';
import { SearchResultsScreen } from '../screens/customer/SearchResultsScreen';
import { AccountScreen } from '../screens/customer/AccountScreen';
import { InformarEmailScreen } from '../screens/customer/InformarEmailScreen';
import { CheckoutDataScreen } from '../screens/customer/CheckoutDataScreen';
import { OrderStatusScreen } from '../screens/customer/OrderStatusScreen';
import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

// Componente intermediário para redirecionar para o primeiro mercado
const InitialRedirect: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const markets = db.getMarkets();
    if (markets.length > 0) {
      const firstMarket = markets[0];
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Products',
            params: { marketId: firstMarket.id, marketName: firstMarket.name },
          },
        ],
      });
    }
  }, [navigation]);

  return null; // Não renderiza nada, apenas redireciona
};

export const CustomerNavigator: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <Stack.Navigator initialRouteName="InitialRedirect">
      <Stack.Screen
        name="InitialRedirect"
        component={InitialRedirect}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Markets"
        component={MarketSelectionScreen}
        options={{
          title: 'Mercados',
          headerRight: user ? () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#F44336', fontWeight: 'bold' }}>Sair</Text>
            </TouchableOpacity>
          ) : undefined,
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
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Busca' }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerShown: false }}
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

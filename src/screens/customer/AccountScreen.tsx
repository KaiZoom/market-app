import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { User, MapPin, CreditCard, ShoppingBag, Edit2, Trash2, Plus, ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services';

interface Props {
  navigation: any;
}

export const AccountScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const { width } = useWindowDimensions();

  // Proteção: redireciona se não houver usuário logado (após logout ou acesso direto)
  useEffect(() => {
    if (!user) {
      const firstMarket = db.getMarkets()[0];
      if (firstMarket) {
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
    }
  }, [user, navigation]);

  // Mock data - em produção viria do backend
  const [addresses] = useState([
    { id: '1', label: 'Casa', street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zipCode: '01234-567' },
    { id: '2', label: 'Trabalho', street: 'Av. Paulista, 1000', city: 'São Paulo', state: 'SP', zipCode: '01310-100' },
  ]);

  const [paymentMethods] = useState([
    { id: '1', type: 'Cartão de Crédito', number: '**** **** **** 1234', brand: 'Visa' },
    { id: '2', type: 'Cartão de Débito', number: '**** **** **** 5678', brand: 'Mastercard' },
  ]);

  // Busca pedidos do usuário logado e também pedidos que ele fez como guest antes de se registrar
  const orders = user 
    ? [
        ...db.getOrdersByCustomerId(user.id),
        ...db.getOrdersByCustomerId(`guest_${user.email}`)
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const handleSaveProfile = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    logout();
  };

  const renderProfileTab = () => (
    <View style={styles.section}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <User size={48} color="#2196F3" />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
          <TouchableOpacity onPress={() => setIsEditingProfile(!isEditingProfile)}>
            <Edit2 size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={[styles.input, !isEditingProfile && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={isEditingProfile}
            placeholder="Seu nome"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, !isEditingProfile && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            editable={isEditingProfile}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {isEditingProfile && (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                setName(user?.name || '');
                setEmail(user?.email || '');
                setIsEditingProfile(false);
              }}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.buttonPrimaryText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderAddressesTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MapPin size={24} color="#2196F3" />
          <Text style={styles.sectionTitle}>Endereços</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Em desenvolvimento', 'Adicionar novo endereço em breve!')}
        >
          <Plus size={20} color="#2196F3" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {addresses.map((address) => (
        <View key={address.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitleSmall}>{address.label}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => Alert.alert('Em desenvolvimento', 'Editar endereço em breve!')}
              >
                <Edit2 size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => Alert.alert('Confirmar', 'Deseja remover este endereço?')}
              >
                <Trash2 size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.addressText}>{address.street}</Text>
          <Text style={styles.addressText}>
            {address.city} - {address.state}, CEP: {address.zipCode}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderPaymentsTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <CreditCard size={24} color="#2196F3" />
          <Text style={styles.sectionTitle}>Formas de Pagamento</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Em desenvolvimento', 'Adicionar novo cartão em breve!')}
        >
          <Plus size={20} color="#2196F3" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {paymentMethods.map((payment) => (
        <View key={payment.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitleSmall}>{payment.type}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => Alert.alert('Confirmar', 'Deseja remover este cartão?')}
              >
                <Trash2 size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.paymentText}>{payment.brand}</Text>
          <Text style={styles.paymentText}>{payment.number}</Text>
        </View>
      ))}
    </View>
  );

  const renderOrdersTab = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ShoppingBag size={24} color="#2196F3" />
          <Text style={styles.sectionTitle}>Histórico de Pedidos</Text>
        </View>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingBag size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>Nenhum pedido ainda</Text>
          <Text style={styles.emptyStateSubtext}>Seus pedidos aparecerão aqui</Text>
        </View>
      ) : (
        orders.map((order) => {
          const market = db.getMarketById(order.marketId);
          const statusColors = {
            PENDING: '#FF9800',
            CONFIRMED: '#2196F3',
            CANCELLED: '#F44336',
          };

          return (
            <TouchableOpacity 
              key={order.id} 
              style={styles.card}
              onPress={() => navigation.navigate('OrderStatus', { orderId: order.id })}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Pedido #{order.id.slice(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColors[order.status]}20` }]}>
                  <Text style={[styles.statusText, { color: statusColors[order.status] }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderMarket}>{market?.name}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>
                  Total: R$ {order.totalAmount.toFixed(2)}
                </Text>
                <View style={styles.viewDetailsRow}>
                  <Text style={styles.viewDetailsText}>Ver detalhes</Text>
                  <ChevronRight size={16} color="#2196F3" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const contentWidth = Math.min(width, 800);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.contentContainer, { width: contentWidth, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileTab()}
        {renderAddressesTab()}
        {renderPaymentsTab()}
        {renderOrdersTab()}
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondaryText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F44336',
    marginTop: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderMarket: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});

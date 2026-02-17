import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Check, Package, Truck } from 'lucide-react-native';
import { orderService } from '../../services';
import { Order } from '../../models';
import { useAuth } from '../../contexts/AuthContext';

export type OrderStatusStep = 'confirmado' | 'preparo' | 'entrega' | 'finalizado';

interface OrderStatusParams {
  orderId: string;
  deliveryStreet?: string;
  deliveryNumber?: string;
  neighborhood?: string;
  cep?: string;
  complemento?: string;
  destinatario?: string;
  paymentMethod?: string;
  estimatedTime?: string;
  totalAmount?: number;
}

interface Props {
  route: any;
  navigation: any;
}

const STEPS: { id: OrderStatusStep; label: string }[] = [
  { id: 'confirmado', label: 'Pedido confirmado' },
  { id: 'preparo', label: 'Em preparo' },
  { id: 'entrega', label: 'Saiu para entrega' },
  { id: 'finalizado', label: 'Finalizado' },
];

function getPaymentLabel(method: string | undefined): string {
  if (!method) return 'Online';
  const map: Record<string, string> = {
    entrega: 'Pagamento na entrega',
    credito: 'Cartão de crédito',
    crediffato: 'Cartão Crediffato',
    convenio: 'Cartão Convênio',
    pix: 'PIX',
    google: 'Google Pay',
  };
  return map[method] ?? 'Online';
}

export const OrderStatusScreen: React.FC<Props> = ({ route, navigation }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { user } = useAuth();

  const params = route.params as OrderStatusParams | undefined;
  const orderId = params?.orderId ?? '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<OrderStatusStep>('confirmado');

  useEffect(() => {
    if (orderId) {
      const found = orderService.getOrderById(orderId);
      setOrder(found ?? null);
    }
    setLoading(false);
  }, [orderId]);

  const street = params?.deliveryStreet ?? 'Rua Pedro Eloy de Souza';
  const number = params?.deliveryNumber ?? '';
  const neighborhood = params?.neighborhood ?? 'Bairro Alto';
  const cep = params?.cep ?? '82820-139';
  const complemento = params?.complemento ?? '';
  const destinatario = params?.destinatario ?? '';
  const paymentLabel = getPaymentLabel(params?.paymentMethod);
  const estimatedTime = params?.estimatedTime ?? '20:00-22:00';
  const totalAmount = params?.totalAmount ?? order?.totalAmount ?? 0;

  const handleVoltar = () => {
    navigation.goBack();
  };

  if (loading && orderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  if (orderId && !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleVoltar} style={styles.backButton} hitSlop={12}>
            <ArrowLeft size={22} color="#2196F3" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pedido não encontrado</Text>
        </View>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>O pedido solicitado não foi encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayOrderId = order?.id ?? orderId;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVoltar} style={styles.backButton} hitSlop={12}>
          <ArrowLeft size={22} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Status do Pedido</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isMobile && styles.contentMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.trackerCard}>
          <View style={styles.trackerSteps}>
            {STEPS.map((step, index) => {
              const isActive = STEPS.findIndex((s) => s.id === currentStep) >= index;
              const isCurrent = step.id === currentStep;
              const Icon =
                step.id === 'confirmado'
                  ? Check
                  : step.id === 'preparo'
                    ? Package
                    : step.id === 'entrega'
                      ? Truck
                      : Check;
              return (
                <React.Fragment key={step.id}>
                  <View style={styles.trackerStep}>
                    <View
                      style={[
                        styles.trackerCircle,
                        isActive && styles.trackerCircleActive,
                        isCurrent && styles.trackerCircleCurrent,
                      ]}
                    >
                      {isActive ? (
                        <Check size={18} color={isCurrent ? '#7C4DFF' : '#fff'} />
                      ) : (
                        <Icon size={18} color="#999" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.trackerLabel,
                        isCurrent && styles.trackerLabelCurrent,
                        isActive && !isCurrent && styles.trackerLabelDone,
                      ]}
                      numberOfLines={2}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {index < STEPS.length - 1 && (
                    <View style={[styles.trackerLine, isActive && styles.trackerLineActive]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>N° do pedido:</Text>
              <Text style={styles.detailValue}>{displayOrderId.replace('order-', '')}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Entrega em:</Text>
              <Text style={styles.detailValue}>
                {destinatario ? `${destinatario}, ` : ''}
                {street}
                {number ? `, ${number}` : ''}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel} />
              <Text style={styles.detailValue}>
                {neighborhood}, {cep}
              </Text>
            </View>
            {complemento ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Complemento:</Text>
                <Text style={styles.detailValue}>{complemento}</Text>
              </View>
            ) : null}

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pagamento:</Text>
              <Text style={styles.detailValue}>{paymentLabel}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Previsão:</Text>
              <Text style={styles.detailValue}>{estimatedTime}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>R$ {totalAmount.toFixed(2).replace('.', ',')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    padding: 16,
  },
  trackerCard: {
    backgroundColor: '#E8F4FD',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  trackerSteps: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  trackerStep: {
    alignItems: 'center',
    flex: 0,
    minWidth: 70,
  },
  trackerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackerCircleActive: {
    backgroundColor: '#7C4DFF',
    borderColor: '#7C4DFF',
  },
  trackerCircleCurrent: {
    backgroundColor: '#fff',
    borderColor: '#7C4DFF',
    borderWidth: 3,
  },
  trackerLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  trackerLabelCurrent: {
    color: '#7C4DFF',
    fontWeight: '700',
  },
  trackerLabelDone: {
    color: '#555',
  },
  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginTop: 20,
    marginHorizontal: 4,
    minWidth: 20,
  },
  trackerLineActive: {
    backgroundColor: '#BBDEFB',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    width: 100,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

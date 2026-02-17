import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Lock, Check, ArrowLeft } from 'lucide-react-native';
import { db } from '../../services';

interface Props {
  navigation: any;
}

function isEmailRegistered(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return !!db.getUserByEmail(normalized);
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export const InformarEmailScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinuar = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Campo obrigatório', 'Informe seu e-mail para continuar.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const registered = isEmailRegistered(trimmed);
      if (registered) {
        Alert.alert(
          'E-mail já cadastrado',
          'Este e-mail já possui conta. Faça login para continuar com seus dados.',
          [
            { text: 'Voltar', style: 'cancel' },
            { text: 'Fazer login', onPress: () => navigation.navigate('Markets') },
          ]
        );
      } else {
        navigation.navigate('CheckoutData', { email: trimmed });
      }
    }, 400);
  };

  const handleVoltarCarrinho = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Informar Email</Text>
          <TouchableOpacity onPress={handleVoltarCarrinho} style={styles.voltarLink} hitSlop={12}>
            <ArrowLeft size={18} color="#2E7D32" />
            <Text style={styles.voltarLinkText}>Voltar para o carrinho</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>PARA FINALIZAR A COMPRA, INFORME SEU E-MAIL.</Text>
          <Text style={styles.subtitle}>Rápido. Fácil. Seguro.</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.continuarButton, loading && styles.continuarButtonDisabled]}
              onPress={handleContinuar}
              disabled={loading}
            >
              <Text style={styles.continuarButtonText}>
                {loading ? '...' : 'CONTINUAR'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Usamos seu e-mail de forma 100% segura para:</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Check size={18} color="#2E7D32" style={styles.checkIcon} />
                <Text style={styles.infoText}>Identificar seu perfil</Text>
              </View>
              <View style={styles.infoItem}>
                <Check size={18} color="#2E7D32" style={styles.checkIcon} />
                <Text style={styles.infoText}>Notificar sobre o andamento do seu pedido</Text>
              </View>
              <View style={styles.infoItem}>
                <Check size={18} color="#2E7D32" style={styles.checkIcon} />
                <Text style={styles.infoText}>Gerenciar seu histórico de compras</Text>
              </View>
              <View style={styles.infoItem}>
                <Check size={18} color="#2E7D32" style={styles.checkIcon} />
                <Text style={styles.infoText}>Acelerar o preenchimento de suas informações</Text>
              </View>
            </View>
            <Lock size={48} color="#e0e0e0" style={styles.lockIcon} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  voltarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voltarLinkText: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 0.3,
    marginBottom: 8,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  continuarButton: {
    backgroundColor: '#D84315',
    paddingHorizontal: 24,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continuarButtonDisabled: {
    opacity: 0.7,
  },
  continuarButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 24,
    position: 'relative',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  lockIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

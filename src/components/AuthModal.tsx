import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'login' | 'signup';

export const AuthModal: React.FC<Props> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register } = useAuth();

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      handleClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await register(name, email, password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      handleClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const quickLogin = async (userEmail: string, userPassword: string) => {
    try {
      await login(userEmail, userPassword);
      handleClose();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.tabActive]}
              onPress={() => {
                setActiveTab('login');
                resetForm();
              }}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
              onPress={() => {
                setActiveTab('signup');
                resetForm();
              }}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Criar Conta
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'login' ? (
              <View style={styles.form}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  secureTextEntry
                  placeholderTextColor="#999"
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
                  <Text style={styles.submitButtonText}>Entrar</Text>
                </TouchableOpacity>

                <View style={styles.quickAccess}>
                  <Text style={styles.quickAccessTitle}>Acesso Rápido (Teste)</Text>

                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => quickLogin('cliente@email.com', '123456')}
                  >
                    <Text style={styles.quickButtonText}>👤 Cliente Comum</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => quickLogin('admin.a@email.com', '123456')}
                  >
                    <Text style={styles.quickButtonText}>🛒 Admin Mercado A</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => quickLogin('admin.b@email.com', '123456')}
                  >
                    <Text style={styles.quickButtonText}>🛒 Admin Mercado B</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => quickLogin('admin.c@email.com', '123456')}
                  >
                    <Text style={styles.quickButtonText}>🛒 Admin Mercado C</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  autoCapitalize="words"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Confirmar Senha</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Digite a senha novamente"
                  secureTextEntry
                  placeholderTextColor="#999"
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleSignUp}>
                  <Text style={styles.submitButtonText}>Criar Conta</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  form: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickAccess: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#666',
  },
  quickButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickButtonText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
});

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

export type TabType = 'login' | 'signup';

export function useAuthModal(onClose: () => void) {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register } = useAuth();

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    try {
      await login(email, password);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      handleClose();
    } catch (error: unknown) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro');
    }
  }, [email, password, login, handleClose]);

  const handleSignUp = useCallback(async () => {
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
    } catch (error: unknown) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro');
    }
  }, [name, email, password, confirmPassword, register, handleClose]);

  const quickLogin = useCallback(
    async (userEmail: string, userPassword: string) => {
      try {
        await login(userEmail, userPassword);
        handleClose();
      } catch (error: unknown) {
        Alert.alert('Erro', error instanceof Error ? error.message : 'Erro');
      }
    },
    [login, handleClose],
  );

  const setTabLogin = useCallback(() => {
    setActiveTab('login');
    resetForm();
  }, [resetForm]);

  const setTabSignup = useCallback(() => {
    setActiveTab('signup');
    resetForm();
  }, [resetForm]);

  return {
    activeTab,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleClose,
    handleLogin,
    handleSignUp,
    quickLogin,
    setTabLogin,
    setTabSignup,
    resetForm,
  };
}

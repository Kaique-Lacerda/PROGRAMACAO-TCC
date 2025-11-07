import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.log('❌', 'AUTH', 'Erro ao verificar autenticação:', error);
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user_musicas');
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.log('❌', 'AUTH', 'Erro ao fazer logout:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    isLoggedIn,
    checkingAuth,
    handleLogin,
    handleLogout
  };
};
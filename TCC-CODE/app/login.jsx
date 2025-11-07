import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

// ✅ URL do backend
import { BACKEND_URL } from '../constants/config';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Carregar fontes
  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Lobster-Regular': require('../assets/fonts/Lobster-Regular.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

 const handleSubmit = async () => {
  if (!username || !password) {
    setError('Por favor, preencha todos os campos');
    return;
  }

  setLoading(true);
  setError('');
  
  const url = isRegister ? `${BACKEND_URL}/auth/register` : `${BACKEND_URL}/auth/login`;
  
  try {
    // ✅ CORREÇÃO: Prepara o body corretamente
    const requestBody = isRegister 
      ? { 
          name: username,  // No cadastro, usa username como name
          email: `${username}@email.com`, // Cria um email automaticamente
          password 
        }
      : { 
          email: username.includes('@') ? username : `${username}@email.com`,
          password 
        };
    
    console.log('🔗 URL:', url);
    console.log('📦 Request Body:', requestBody);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Status:', res.status);
    
    const data = await res.json();
    console.log('📦 Response Data:', data);
    
    if (!res.ok) {
      throw new Error(data.error || `Erro ${res.status}`);
    }

    if (isRegister) {
      setIsRegister(false);
      setError('✅ Cadastro realizado! Faça login.');
      setUsername('');
      setPassword('');
    } else {
      await AsyncStorage.setItem('token', data.token);
      onLogin(data.token);
    }
  } catch (err) {
    console.error('💥 Erro completo:', err);
    setError(`❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require('../assets/images/elementos.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffb300" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/elementos.png')}
      resizeMode="cover"
      style={styles.background}
    >
      
      {/* Título com Fonte Lobster */}
      <Text style={styles.title}>
        {isRegister ? 'Cadastro' : 'Login'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => {
          setIsRegister(!isRegister);
          setError('');
        }}
        disabled={loading}
      >
        <Text style={styles.switchButtonText}>
          {isRegister ? 'Já tenho conta' : 'Quero me cadastrar'}
        </Text>
      </TouchableOpacity>
      
      {error ? (
        <Text style={[styles.error, error.includes('✅') && styles.success]}>
          {error}
        </Text>
      ) : null}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 42,
    fontFamily: 'Lobster-Regular',
    marginBottom: 40,
    textAlign: 'center',
    color: '#ffb300',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#425296',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
  },
  switchButtonText: {
    color: '#425296',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  error: {
    color: '#ff6c6cff',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    width: '80%',
  },
  success: {
    color: '#51cf66',
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; // ← ADICIONA ESTA IMPORT
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

// ✅ URL do backend
import { BACKEND_URL } from '../constants/config';

export default function Login() { // ← REMOVE { onLogin } daqui
  const router = useRouter(); // ← ADICIONA ESTA LINHA
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
  if (!email || !password) {
    setError('Por favor, preencha email e senha');
    return;
  }

  if (isRegister && !name) {
    setError('Por favor, preencha seu nome');
    return;
  }

  setLoading(true);
  setError('');
  
  const url = isRegister ? `${BACKEND_URL}/auth/register` : `${BACKEND_URL}/auth/login`;
  
  try {
    const requestBody = isRegister 
      ? { name, email, password }
      : { email, password };
    
    console.log('🔗 Fazendo request para:', url);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Response status:', res.status);
    console.log('📥 Response ok?', res.ok);
    
    // Verifica se a response tem conteúdo
    const responseText = await res.text();
    console.log('📥 Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      throw new Error('Resposta inválida do servidor');
    }
    
    console.log('📦 Response data:', data);
    
    if (!res.ok) {
      throw new Error(data.error || `Erro ${res.status}`);
    }

    if (isRegister) {
      setIsRegister(false);
      setError('✅ Cadastro realizado! Faça login.');
      setName('');
      setEmail('');
      setPassword('');
    } else {
      console.log('✅ Login bem-sucedido, salvando token...');
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Token salvo, redirecionando...');
      router.replace('/'); // ← TROCA onLogin(data.token) POR ISTO
    }
  } catch (err) {
    console.error('💥 Erro completo no login:', err);
    console.error('💥 Stack:', err.stack);
    setError(`❌ ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  if (!fontsLoaded) {
    return (
      <ImageBackground
        source={require('../assets/images/login-wallpaper.png')}
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
      source={require('../assets/images/login-wallpaper.png')}
      resizeMode="cover"
      style={styles.background}
    >
      
      {/* Título com Fonte Lobster */}
      <Text style={styles.title}>
        {isRegister ? 'Cadastro' : 'Login'}
      </Text>

      {/* Campo NOME (apenas no cadastro) */}
      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Seu nome completo"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      )}

      {/* Campo EMAIL (sempre visível) */}
      <TextInput
        style={styles.input}
        placeholder="Seu email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      {/* Campo SENHA (sempre visível) */}
      <TextInput
        style={styles.input}
        placeholder="Sua senha"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {/* Botão Principal */}
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
      
      {/* Botão para alternar entre Login/Cadastro */}
      <TouchableOpacity
        style={styles.switchButton}
        onPress={switchMode}
        disabled={loading}
      >
        <Text style={styles.switchButtonText}>
          {isRegister ? 'Já tenho conta? Fazer login' : 'Não tem conta? Cadastrar'}
        </Text>
      </TouchableOpacity>
      
      {/* Mensagem de erro/sucesso */}
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
    color: '#ffffffff',
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
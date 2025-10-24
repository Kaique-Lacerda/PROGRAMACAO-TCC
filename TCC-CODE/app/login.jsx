import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = 'https://cycle-ocean-dig-bobby.trycloudflare.comj';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');
    
    const url = isRegister ? `${BACKEND_IP}/register` : `${BACKEND_IP}/login`;
    
    try {
      console.log('Tentando conectar com:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      console.log('Resposta do servidor:', data);
      
      if (!res.ok) {
        throw new Error(data.error || `Erro ${res.status}: ${res.statusText}`);
      }

      if (isRegister) {
        setIsRegister(false);
        setError('✅ Cadastro realizado! Faça login.');
        setUsername('');
        setPassword('');
      } else {
        await AsyncStorage.setItem('token', data.token);
        console.log('Token salvo:', data.token);
        onLogin(data.token);
      }
    } catch (err) {
      console.log('Erro completo:', err);
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Testar conexão com o backend
  const testBackendConnection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_IP}/users`);
      if (res.ok) {
        setError('✅ Backend conectado com sucesso!');
      } else {
        setError('❌ Backend respondeu com erro');
      }
    } catch (err) {
      setError('❌ Não foi possível conectar ao backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background2.gif')}
      resizeMode="cover"
      style={styles.background}
    >
      <Text style={styles.title}>{isRegister ? 'Cadastro' : 'Login'}</Text>
      
      {/* Status da conexão */}
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionText}>
        </Text>
        <TouchableOpacity onPress={testBackendConnection} style={styles.testButton}>
          <Text style={styles.testButtonText}>Testar Conexão</Text>
        </TouchableOpacity>
      </View>

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
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    width: '80%',
  },
  connectionText: {
    color: '#ffb300',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#425296',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
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
    color: '#ff6b6b',
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
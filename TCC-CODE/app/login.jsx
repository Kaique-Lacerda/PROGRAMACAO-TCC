import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_IP = 'http://10.0.12.148:3001';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    setError('');
    const url = isRegister ? `${BACKEND_IP}/register` : `${BACKEND_IP}/login`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

      if (isRegister) {
        setIsRegister(false);
        setError('Cadastro realizado! Faça login.');
      } else {
        await AsyncStorage.setItem('token', data.token);
        onLogin(data.token);
      }
    } catch (err) {
      console.log('Erro na requisição de login/cadastro:', err);
      setError(err.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <Text style={styles.title}>{isRegister ? 'Cadastro' : 'Login'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isRegister ? 'Cadastrar' : 'Entrar'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsRegister(!isRegister)}
      >
        <Text style={styles.switchButtonText}>
          {isRegister ? 'Já tenho conta' : 'Quero me cadastrar'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Lobs-Bold',
  },
  input: {
    width: '80%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginBottom: 10,
    paddingHorizontal: 10,
    fontFamily: 'Lobs',
    color: '#fff',
  },
  button: {
    backgroundColor: '#425296ff',
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Lobs-Bold',
    fontWeight: 'bold',
  },
  switchButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 10,
    width: '80%',
  },
  switchButtonText: {
    color: '#007bff',
    textAlign: 'center',
    fontFamily: 'Lobs',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Lobs',
  },
});

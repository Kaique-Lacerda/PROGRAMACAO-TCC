import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';
import * as ImagePicker from 'expo-image-picker';

import { BACKEND_URL } from '../constants/config';

export default function Perfil() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

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

  // Carregar dados do usuário e foto salva
  useEffect(() => {
    if (fontsLoaded) {
      loadUserData();
    }
  }, [fontsLoaded]);

const saveProfileImageToBackend = async (imageUri) => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('🔗 Tentando salvar foto no backend...');
    console.log('📎 Token existe?', !!token);
    console.log('🖼️ Image URI:', imageUri ? `Presente (${imageUri.substring(0, 50)}...)` : 'Faltando');
    console.log('🌐 URL:', `${BACKEND_URL}/auth/profile-image`);
    
    const res = await fetch(`${BACKEND_URL}/auth/profile-image`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profileImage: imageUri })
    });

    console.log('📥 Status da resposta:', res.status);
    console.log('📥 Resposta OK?', res.ok);
    
    const responseText = await res.text();
    console.log('📥 Resposta completa:', responseText);
    
    if (res.ok) {
      console.log('✅ Foto salva no MongoDB com sucesso!');
    } else {
      console.log('❌ Erro HTTP:', res.status, responseText);
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
  }
};

  // Salvar foto localmente e no backend
  const saveProfileImage = async (imageUri) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      setProfileImage(imageUri);
      // Salva também no MongoDB
      await saveProfileImageToBackend(imageUri);
    } catch (error) {
      console.log('❌ Erro ao salvar foto:', error);
    }
  };

  // Carregar foto salva do AsyncStorage
  const loadSavedProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.log('❌ Erro ao carregar foto:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Buscar dados reais do usuário do backend/MongoDB
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const userDataFromAPI = await res.json();
        console.log('📊 Dados do usuário:', userDataFromAPI);
        
        // Pega o name do user
        setUserData({
          username: userDataFromAPI.user.name,
          memberSince: new Date(userDataFromAPI.user.createdAt || Date.now()).toLocaleDateString('pt-BR')
        });

        // Carrega foto do MongoDB se existir, senão carrega do localStorage
        if (userDataFromAPI.user.profileImage) {
          setProfileImage(userDataFromAPI.user.profileImage);
        } else {
          loadSavedProfileImage();
        }
      } else {
        // Fallback: tentar pegar do token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserData({
          username: tokenData.name || 'Usuário',
          memberSince: new Date().toLocaleDateString('pt-BR')
        });
        loadSavedProfileImage();
      }
    } catch (error) {
      console.log('❌ Erro ao carregar perfil:', error);
      // Fallback em caso de erro
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserData({
            username: tokenData.name || 'Usuário',
            memberSince: new Date().toLocaleDateString('pt-BR')
          });
        } catch {
          setUserData({
            username: 'Usuário',
            memberSince: new Date().toLocaleDateString('pt-BR')
          });
        }
      }
      loadSavedProfileImage();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Pedir permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar a foto.');
        return;
      }

      // Abrir seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        await saveProfileImage(selectedImage);
        Alert.alert('✅ Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error) {
      console.log('❌ Erro ao selecionar imagem:', error);
      Alert.alert('❌ Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('profileImage'); // Limpa a foto ao sair
            router.replace('/login');
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, icon }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (!fontsLoaded || loading) {
    return (
      <ImageBackground
        source={require('../assets/images/wallpaper.png')}
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
      source={require('../assets/images/wallpaper.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Simples */}
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Card do Perfil Simplificado */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={pickImage}
          >
            <Image 
              source={profileImage ? { uri: profileImage } : require('../assets/images/icons/perfil.png')}
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.username}>{userData?.username || 'Usuário'}</Text>
          <Text style={styles.memberSince}>
            Membro desde {userData?.memberSince}
          </Text>
          
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Estatísticas Essenciais */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Tempo Foco" 
              value="12h 45min" 
              icon="⏱️" 
            />
            <StatCard 
              title="Sessões" 
              value="23" 
              icon="🎯" 
            />
          </View>
        </View>

        {/* Ações Principais */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🎵 Músicas Favoritas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>⚙️ Configurações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>🚪 Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 50,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Lobster-Regular',
    color: '#ffb300',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.3)',
  },
  avatarContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffb300',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#ffb300',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIconText: {
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  memberSince: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 15,
  },
  changePhotoButton: {
    backgroundColor: 'rgba(255,179,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  changePhotoText: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffb300',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 50,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
    borderColor: 'rgba(220, 53, 69, 0.5)',
  },
  logoutButtonText: {
    color: '#dc3545',
  },
});
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
  Alert,
  Modal,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';

const BACKEND_IP = 'https://cycle-ocean-dig-bobby.trycloudflare.com';

export default function Perfil() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [stats, setStats] = useState({
    tempoFoco: '0h 0min',
    sessoesCompletas: 0,
    musicasFavoritas: 0,
    nivel: 'Iniciante'
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');

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

  // Carregar dados do usuário
  useEffect(() => {
    if (fontsLoaded) {
      loadUserData();
      loadUserStats();
    }
  }, [fontsLoaded]);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      // Buscar dados do usuário do backend
      const res = await fetch(`${BACKEND_IP}/user/profile`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      } else {
        // Fallback: usar dados básicos do token
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserData({
          username: tokenData.username,
          memberSince: new Date().toLocaleDateString('pt-BR')
        });
      }
    } catch (error) {
      console.log('Erro ao carregar perfil:', error);
      // Fallback em caso de erro
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserData({
          username: tokenData.username,
          memberSince: new Date().toLocaleDateString('pt-BR')
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Buscar estatísticas (você pode criar essa rota no backend depois)
      const statsRes = await fetch(`${BACKEND_IP}/user/stats`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        // Estatísticas mock para desenvolvimento
        setStats({
          tempoFoco: '12h 45min',
          sessoesCompletas: 23,
          musicasFavoritas: 5,
          nivel: 'Produtivo 🚀'
        });
      }
    } catch (error) {
      console.log('Erro ao carregar estatísticas:', error);
      // Estatísticas mock em caso de erro
      setStats({
        tempoFoco: '8h 30min',
        sessoesCompletas: 15,
        musicasFavoritas: 3,
        nivel: 'Em Progresso 📈'
      });
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
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleEditProfile = async () => {
    if (!editUsername.trim()) {
      Alert.alert('Erro', 'Nome de usuário não pode estar vazio');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_IP}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: editUsername })
      });

      if (res.ok) {
        setUserData(prev => ({ ...prev, username: editUsername }));
        setShowEditModal(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar perfil');
    }
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
        source={require('../assets/images/background2.gif')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffb300" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/background2.gif')}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Voltar</Text>
          </TouchableOpacity>
        </View>

        {/* Card do Perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../assets/images/icons/perfil.png')}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
          
          <Text style={styles.username}>{userData?.username || 'Usuário'}</Text>
          <Text style={styles.memberSince}>
            Membro desde: {userData?.memberSince || 'Data não disponível'}
          </Text>
          
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{stats.nivel}</Text>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setEditUsername(userData?.username || '');
                setShowEditModal(true);
              }}
            >
              <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Tempo de Foco" 
              value={stats.tempoFoco} 
              icon="⏱️" 
            />
            <StatCard 
              title="Sessões" 
              value={stats.sessoesCompletas} 
              icon="🎯" 
            />
            <StatCard 
              title="Músicas Fav" 
              value={stats.musicasFavoritas} 
              icon="🎵" 
            />
            <StatCard 
              title="Conquistas" 
              value="3" 
              icon="🏆" 
            />
          </View>
        </View>

        {/* Conquistas */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Primeira Sessão</Text>
                <Text style={styles.achievementDesc}>Complete sua primeira sessão de foco</Text>
              </View>
              <Text style={styles.achievementStatus}>✅</Text>
            </View>
            
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🎵</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Ouvinte</Text>
                <Text style={styles.achievementDesc}>Ouça 5 músicas diferentes</Text>
              </View>
              <Text style={styles.achievementStatus}>🔄</Text>
            </View>
            
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>⏰</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>Maratonista</Text>
                <Text style={styles.achievementDesc}>10 horas de foco total</Text>
              </View>
              <Text style={styles.achievementStatus}>🔄</Text>
            </View>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 Ver Estatísticas Detalhadas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>⚙️ Configurações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>🚪 Sair</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Modal de Edição */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            
            <Text style={styles.modalLabel}>Nome de Usuário</Text>
            <TextInput
              style={styles.modalInput}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Novo nome de usuário"
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditProfile}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffb300',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  memberSince: {
    color: '#ccc',
    marginBottom: 15,
  },
  levelBadge: {
    backgroundColor: '#ffb300',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 20,
  },
  levelText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  profileActions: {
    width: '100%',
  },
  editButton: {
    backgroundColor: 'rgba(255,179,0,0.2)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffb300',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
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
  achievementsSection: {
    marginBottom: 25,
  },
  achievementsList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  achievementIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementDesc: {
    color: '#ccc',
    fontSize: 12,
  },
  achievementStatus: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#ffb300',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffb300',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: '#ffb300',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    backgroundColor: '#ffb300',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
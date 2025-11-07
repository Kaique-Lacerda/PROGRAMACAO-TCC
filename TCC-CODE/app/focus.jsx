import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

import { BACKEND_IP } from '../constants/config';

export default function Focus() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Estados do foco
  const [tempoFoco, setTempoFoco] = useState(25); // em minutos
  const [tempoDescanso, setTempoDescanso] = useState(5); // em minutos
  const [musicaAtivada, setMusicaAtivada] = useState(true);
  const [preDefinicaoAtiva, setPreDefinicaoAtiva] = useState('pomodoro');
  const [configSalva, setConfigSalva] = useState(false);
  
  // Estados do timer
  const [tempoRestante, setTempoRestante] = useState(tempoFoco * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPausado, setIsPausado] = useState(false);
  const [modoAtual, setModoAtual] = useState('foco'); // 'foco' ou 'descanso'
  const [ciclosCompletos, setCiclosCompletos] = useState(0);

  // Estados da música
  const [musicaSelecionada, setMusicaSelecionada] = useState(null);
  const [showMusicModal, setShowMusicModal] = useState(false);

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

  // Carregar configuração salva
  useEffect(() => {
    if (fontsLoaded) {
      carregarConfiguracaoSalva();
    }
  }, [fontsLoaded]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (isRunning && !isPausado && tempoRestante > 0) {
      interval = setInterval(() => {
        setTempoRestante(tempoRestante - 1);
      }, 1000);
    } else if (tempoRestante === 0) {
      // Timer completado
      handleTimerCompleto();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, isPausado, tempoRestante]);

  const carregarConfiguracaoSalva = async () => {
    try {
      const configSalva = await AsyncStorage.getItem('focusConfig');
      if (configSalva) {
        const config = JSON.parse(configSalva);
        setTempoFoco(config.tempoFoco);
        setTempoDescanso(config.tempoDescanso);
        setMusicaAtivada(config.musicaAtivada);
        setPreDefinicaoAtiva(config.preDefinicaoAtiva);
        setConfigSalva(true);
      }
    } catch (error) {
      console.log('Erro ao carregar configuração:', error);
    }
  };

  const salvarConfiguracao = async () => {
    try {
      const config = {
        tempoFoco,
        tempoDescanso,
        musicaAtivada,
        preDefinicaoAtiva
      };
      await AsyncStorage.setItem('focusConfig', JSON.stringify(config));
      setConfigSalva(true);
      
      // Feedback visual
      setTimeout(() => setConfigSalva(false), 2000);
    } catch (error) {
      console.log('Erro ao salvar configuração:', error);
    }
  };

  const aplicarPreDefinicao = (tipo) => {
    setPreDefinicaoAtiva(tipo);
    
    switch (tipo) {
      case 'pomodoro':
        setTempoFoco(25);
        setTempoDescanso(5);
        break;
      case 'estudo_longo':
        setTempoFoco(50);
        setTempoDescanso(10);
        break;
      case 'descanso_longo':
        setTempoFoco(25);
        setTempoDescanso(15);
        break;
      case 'sprint':
        setTempoFoco(15);
        setTempoDescanso(3);
        break;
      default:
        setTempoFoco(25);
        setTempoDescanso(5);
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPausado(false);
      setTempoRestante(modoAtual === 'foco' ? tempoFoco * 60 : tempoDescanso * 60);
    }
  };

  const handlePause = () => {
    setIsPausado(!isPausado);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPausado(false);
    setTempoRestante(tempoFoco * 60);
    setModoAtual('foco');
  };

  const handleTimerCompleto = () => {
    setIsRunning(false);
    setIsPausado(false);
    
    if (modoAtual === 'foco') {
      setModoAtual('descanso');
      setTempoRestante(tempoDescanso * 60);
      setCiclosCompletos(ciclosCompletos + 1);
      // Aqui você pode adicionar notificação/som de término
    } else {
      setModoAtual('foco');
      setTempoRestante(tempoFoco * 60);
      // Aqui você pode adicionar notificação/som de término do descanso
    }
  };

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const PreDefinicaoCard = ({ titulo, descricao, tempoFoco, tempoDescanso, tipo }) => (
    <TouchableOpacity
      style={[
        styles.preDefinicaoCard,
        preDefinicaoAtiva === tipo && styles.preDefinicaoCardAtiva
      ]}
      onPress={() => aplicarPreDefinicao(tipo)}
    >
      <Text style={styles.preDefinicaoTitulo}>{titulo}</Text>
      <Text style={styles.preDefinicaoDescricao}>{descricao}</Text>
      <Text style={styles.preDefinicaoTempo}>
        🕒 {tempoFoco}min foco • {tempoDescanso}min descanso
      </Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
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
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Modo Foco</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Personagem no lado esquerdo */}
          <View style={styles.personagemContainer}>
            <Image 
              source={require('../assets/images/batata-doce.png')}
              style={styles.personagem}
            />
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {isRunning 
                  ? (isPausado ? '⏸️ Pausado' : modoAtual === 'foco' ? '🎯 Focando...' : '☕ Descansando...')
                  : '💤 Pronto para começar'
                }
              </Text>
              <Text style={styles.ciclosText}>
                Ciclos completos: {ciclosCompletos}
              </Text>
            </View>
          </View>

          {/* Opções no lado direito */}
          <View style={styles.opcoesContainer}>
            
            {/* Timer Principal */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {formatarTempo(tempoRestante)}
              </Text>
              <Text style={styles.modoText}>
                {modoAtual === 'foco' ? 'Tempo de Foco' : 'Tempo de Descanso'}
              </Text>
              
              <View style={styles.timerControls}>
                {!isRunning ? (
                  <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                    <Text style={styles.startButtonText}>▶️ Start</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.runningControls}>
                    <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                      <Text style={styles.pauseButtonText}>
                        {isPausado ? '▶️ Retomar' : '⏸️ Pausar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                      <Text style={styles.stopButtonText}>⏹️ Parar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Configurações */}
            <View style={styles.configSection}>
              <Text style={styles.sectionTitle}>Configurações do Foco</Text>
              
              {/* Tempo de Foco */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>⏱️ Tempo de Foco (min)</Text>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setTempoFoco(Math.max(1, tempoFoco - 5))}
                  >
                    <Text style={styles.timeButtonText}>-5</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{tempoFoco}</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setTempoFoco(tempoFoco + 5)}
                  >
                    <Text style={styles.timeButtonText}>+5</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tempo de Descanso */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>☕ Tempo de Descanso (min)</Text>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setTempoDescanso(Math.max(1, tempoDescanso - 1))}
                  >
                    <Text style={styles.timeButtonText}>-1</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{tempoDescanso}</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setTempoDescanso(tempoDescanso + 1)}
                  >
                    <Text style={styles.timeButtonText}>+1</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Música */}
              <View style={styles.configItem}>
                <View style={styles.switchContainer}>
                  <Text style={styles.configLabel}>🎵 Música de Fundo</Text>
                  <Switch
                    value={musicaAtivada}
                    onValueChange={setMusicaAtivada}
                    trackColor={{ false: '#767577', true: '#ffb300' }}
                    thumbColor={musicaAtivada ? '#fff' : '#f4f3f4'}
                  />
                </View>
                {musicaAtivada && (
                  <TouchableOpacity 
                    style={styles.musicSelectButton}
                    onPress={() => setShowMusicModal(true)}
                  >
                    <Text style={styles.musicSelectText}>
                      {musicaSelecionada ? `🎵 ${musicaSelecionada.nome}` : 'Selecionar Música'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Pré-definições */}
              <View style={styles.configItem}>
                <Text style={styles.configLabel}>📋 Pré-definições</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.preDefinicoesScroll}>
                  <PreDefinicaoCard
                    titulo="Pomodoro"
                    descricao="Técnica clássica"
                    tempoFoco={25}
                    tempoDescanso={5}
                    tipo="pomodoro"
                  />
                  <PreDefinicaoCard
                    titulo="Estudo Longo"
                    descricao="Sessões intensas"
                    tempoFoco={50}
                    tempoDescanso={10}
                    tipo="estudo_longo"
                  />
                  <PreDefinicaoCard
                    titulo="Descanso Longo"
                    descricao="Mais tempo para relaxar"
                    tempoFoco={25}
                    tempoDescanso={15}
                    tipo="descanso_longo"
                  />
                  <PreDefinicaoCard
                    titulo="Sprint"
                    descricao="Sessões rápidas"
                    tempoFoco={15}
                    tempoDescanso={3}
                    tipo="sprint"
                  />
                </ScrollView>
              </View>

              {/* Botões de Ação */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.saveButton, configSalva && styles.saveButtonSuccess]}
                  onPress={salvarConfiguracao}
                >
                  <Text style={styles.saveButtonText}>
                    {configSalva ? '✅ Salvo!' : '💾 Salvar Configuração'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Seleção de Música */}
      <Modal
        visible={showMusicModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMusicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Música</Text>
            <Text style={styles.modalSubtitle}>Escolha uma música para tocar durante o foco</Text>
            
            {/* Aqui você pode integrar com sua biblioteca de músicas existente */}
            <View style={styles.musicList}>
              <TouchableOpacity style={styles.musicItem}>
                <Text style={styles.musicItemText}>🎵 Música Relaxante</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.musicItem}>
                <Text style={styles.musicItemText}>🎵 Sons da Natureza</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.musicItem}>
                <Text style={styles.musicItemText}>🎵 Música Clássica</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.musicItem}>
                <Text style={styles.musicItemText}>🎵 Silêncio</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowMusicModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
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
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  personagemContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 20,
  },
  personagem: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ffb300',
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  ciclosText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  opcoesContainer: {
    flex: 2,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffb300',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modoText: {
    fontSize: 18,
    color: '#ffb300',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timerControls: {
    width: '100%',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FFA000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  pauseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  configSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffb300',
    marginBottom: 15,
  },
  configItem: {
    marginBottom: 20,
  },
  configLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: 'rgba(255,179,0,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  timeButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeDisplay: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  musicSelectButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  musicSelectText: {
    color: '#ffb300',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  preDefinicoesScroll: {
    marginTop: 10,
  },
  preDefinicaoCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    minWidth: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  preDefinicaoCardAtiva: {
    borderColor: '#ffb300',
    backgroundColor: 'rgba(255,179,0,0.1)',
  },
  preDefinicaoTitulo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  preDefinicaoDescricao: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  preDefinicaoTempo: {
    color: '#ffb300',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: 'rgba(255,179,0,0.2)',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffb300',
    alignItems: 'center',
  },
  saveButtonSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 16,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  musicList: {
    marginBottom: 20,
  },
  musicItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  musicItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
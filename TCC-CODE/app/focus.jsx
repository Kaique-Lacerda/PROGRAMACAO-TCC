import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
// import { Video, ResizeMode } from 'expo-av';

import { BACKEND_URL } from '../constants/config';

export default function Focus() {
  const router = useRouter();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const videoRef = useRef(null);
  
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

  // Estados da animação
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationLoaded, setAnimationLoaded] = useState(false);

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
      // Iniciar animação
      setShowAnimation(true);
      setAnimationLoaded(false);
      
      // Após a animação, iniciar o timer
      setTimeout(() => {
        setIsRunning(true);
        setIsPausado(false);
        setTempoRestante(modoAtual === 'foco' ? tempoFoco * 60 : tempoDescanso * 60);
        setShowAnimation(false);
      }, 6000); // 6 segundos da animação
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
    setShowAnimation(false);
  };

  const handleTimerCompleto = () => {
    setIsRunning(false);
    setIsPausado(false);
    
    if (modoAtual === 'foco') {
      setModoAtual('descanso');
      setTempoRestante(tempoDescanso * 60);
      setCiclosCompletos(ciclosCompletos + 1);
    } else {
      setModoAtual('foco');
      setTempoRestante(tempoFoco * 60);
    }
  };

const handleAnimationLoad = () => {
  setAnimationLoaded(true);
  // Inicia animação alternativa imediatamente
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
  ]).start();
};

  const handleAnimationEnd = () => {
    // A animação termina automaticamente após 6 segundos
    // O timeout no handleStart já cuida da transição
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
      {/* Overlay da Animação */}
      {showAnimation && (
        <View style={styles.animationOverlay}>
          <View style={styles.animationContainer}>
            {!animationLoaded && (
              <View style={styles.animationLoading}>
                <ActivityIndicator size="large" color="#ffb300" />
                <Text style={styles.animationLoadingText}>Carregando animação...</Text>
              </View>
            )}









          <View style={styles.animationPlaceholder}>
          <Text style={styles.animationPlaceholderText}>🎬</Text>
          <Text style={styles.animationPlaceholderSubtext}>Animação de Foco</Text>
         </View>





















           {/*
            <Video
              ref={videoRef}
              source={require('../assets/animations/focus-start.mp4')} // Você vai criar este arquivo
              style={styles.animationVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping={false}
              onLoad={handleAnimationLoad}
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish) {
                  handleAnimationEnd();
                }
              }}
            />
            */}

            <Text style={styles.animationText}>Preparando ambiente de foco...</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Modo Foco</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹ Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Área do Status (onde estava a imagem) */}
          <View style={styles.statusArea}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusIcon}>
                {isRunning 
                  ? (isPausado ? '⏸️' : modoAtual === 'foco' ? '🎯' : '☕')
                  : '💤'
                }
              </Text>
              <Text style={styles.statusText}>
                {isRunning 
                  ? (isPausado ? 'Pausado' : modoAtual === 'foco' ? 'Focando...' : 'Descansando...')
                  : 'Pronto para começar'
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
                  <TouchableOpacity 
                    style={styles.startButton} 
                    onPress={handleStart}
                    disabled={showAnimation}
                  >
                    <Text style={styles.startButtonText}>
                      {showAnimation ? '🎬 Iniciando...' : '▶️ Start'}
                    </Text>
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
                    disabled={isRunning}
                  >
                    <Text style={styles.timeButtonText}>-5</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{tempoFoco}</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setTempoFoco(tempoFoco + 5)}
                    disabled={isRunning}
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
                    disabled={isRunning}
                  >
                    <Text style={styles.timeButtonText}>-1</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeDisplay}>{tempoDescanso}</Text>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setTempoDescanso(tempoDescanso + 1)}
                    disabled={isRunning}
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
                    disabled={isRunning}
                  />
                </View>
                {musicaAtivada && (
                  <TouchableOpacity 
                    style={styles.musicSelectButton}
                    onPress={() => setShowMusicModal(true)}
                    disabled={isRunning}
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
                  disabled={isRunning}
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

  // Layout principal
  content: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  statusArea: {
    flex: 1,
    alignItems: 'center',
    marginRight: 12,
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ffb300',
    minHeight: 150,
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ciclosText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },

  // Animação
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: '80%',
    height: '60%',
    alignItems: 'center',
  },
  animationVideo: {
    width: '100%',
    height: '70%',
    borderRadius: 20,
  },
  animationText: {
    color: '#ffb300',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  animationLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '70%',
  },
  animationLoadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },

  // OPÇÕES (direita)
  opcoesContainer: {
    flex: 1,
    maxWidth: 420,
  },
  timerContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffb300',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modoText: {
    fontSize: 16,
    color: '#ffb300',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  timerControls: {
    width: '100%',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#FFA000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  pauseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  configSection: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffb300',
    marginBottom: 12,
  },
  configItem: {
    marginBottom: 12,
  },
  configLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeButton: {
    backgroundColor: 'rgba(255,179,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  timeButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeDisplay: {
    color: '#fff',
    fontSize: 16,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  musicSelectText: {
    color: '#ffb300',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  preDefinicoesScroll: {
    marginTop: 8,
  },
  preDefinicaoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  preDefinicaoCardAtiva: {
    borderColor: '#ffb300',
    backgroundColor: 'rgba(255,179,0,0.08)',
  },
  preDefinicaoTitulo: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  preDefinicaoDescricao: {
    color: '#ccc',
    fontSize: 11,
    marginBottom: 6,
  },
  preDefinicaoTempo: {
    color: '#ffb300',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: 'rgba(255,179,0,0.15)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffb300',
    alignItems: 'center',
  },
  saveButtonSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 14,
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
    padding: 12,
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
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
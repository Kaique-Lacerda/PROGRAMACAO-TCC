//IMPORTS
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ImageBackground, 
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import Login from './login';

// ⚠️⚠️⚠️ ATUALIZAR URL QUANDO REINICIAR O SERVIDOR ⚠️⚠️⚠️
import { BACKEND_IP } from '../constants/config';

// Importar todas as imagens de música necessárias
const musicIcons = {
  play: require('../assets/images/icons/musica/play.png'),
  pause: require('../assets/images/icons/musica/pause.png'),
  favorito: require('../assets/images/icons/musica/favorito.png'),
  favorito_preenchido: require('../assets/images/icons/musica/favorito_preenchido.png'),
  lixeira: require('../assets/images/icons/musica/lixeira.png'),
  add: require('../assets/images/icons/musica/add.png'),
  cd: require('../assets/images/icons/musica/cd.png')
};

// Interface completa de Música
const MusicInterface = ({ 
  visible, 
  onClose, 
  musicas, 
  musicaAtual, 
  tocando, 
  loading, 
  onPlayMusica, 
  onToggleFavorito, 
  onDeletarMusica, 
  onAddLocalMusic 
}) => {
  const [abaAtiva, setAbaAtiva] = useState('todas');
  
  const renderMusicaItem = (musica, podeDeletar = false) => (
    <View key={musica.id} style={styles.musicaItem}>
      <TouchableOpacity 
        style={styles.musicaPlayBtn}
        onPress={() => onPlayMusica(musica)}
        disabled={loading}
      >
        <Image 
          source={musicaAtual?.id === musica.id && tocando ? musicIcons.pause : musicIcons.play} 
          style={styles.musicaPlayIcon} 
        />
      </TouchableOpacity>
      
      <View style={styles.musicaInfo}>
        <Text style={styles.musicaNome} numberOfLines={1}>
          {musica.nome}
        </Text>
        <Text style={styles.musicaArtista} numberOfLines={1}>
          {musica.artista} • {musica.duracao}
          {musica.pre_definida && ' • 📦'}
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => onToggleFavorito(musica.id)}
        style={styles.musicaActionBtn}
      >
        <Image 
          source={musica.favorita ? musicIcons.favorito_preenchido : musicIcons.favorito} 
          style={styles.musicaActionIcon} 
        />
      </TouchableOpacity>
      
      {podeDeletar && (
        <TouchableOpacity 
          onPress={() => onDeletarMusica(musica.id)}
          style={styles.musicaActionBtn}
        >
          <Image 
            source={musicIcons.lixeira} 
            style={styles.musicaActionIcon} 
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const getMusicasParaExibir = () => {
    switch (abaAtiva) {
      case 'favoritas':
        return musicas.favoritas;
      case 'predefinidas':
        return musicas.preDefinidas;
      case 'minhas':
        return musicas.userMusicas;
      case 'todas':
      default:
        return [...musicas.preDefinidas, ...musicas.userMusicas];
    }
  };

  const musicasExibidas = getMusicasParaExibir();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.musicModal}>
        {/* Header */}
        <View style={styles.musicHeader}>
          <View style={styles.musicHeaderLeft}>
            <Image source={musicIcons.cd} style={styles.headerIcon} />
            <Text style={styles.musicTitle}>Biblioteca de Músicas</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Player Mini no Topo */}
        {musicaAtual && (
          <View style={styles.playerMiniHeader}>
            <View style={[styles.cd, tocando && styles.cdGirando]}>
              <Image source={musicIcons.cd} style={styles.cdImage} />
            </View>
            <View style={styles.playerMiniHeaderInfo}>
              <Text style={styles.playerMiniHeaderNome} numberOfLines={1}>
                {musicaAtual.nome}
              </Text>
              <Text style={styles.playerMiniHeaderArtista} numberOfLines={1}>
                {musicaAtual.artista}
              </Text>
            </View>
            <TouchableOpacity onPress={() => onPlayMusica(musicaAtual)} style={styles.playerMiniHeaderBtn}>
              <Image 
                source={tocando ? musicIcons.pause : musicIcons.play} 
                style={styles.playerMiniHeaderIcon} 
              />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.musicContent}>
          {/* Botão Adicionar */}
          <TouchableOpacity 
            onPress={onAddLocalMusic}
            style={styles.addMusicBtn}
          >
            <View style={styles.addMusicBtnContent}>
              <Image source={musicIcons.add} style={styles.addMusicIcon} />
              <Text style={styles.addMusicText}>Adicionar Música do Dispositivo</Text>
            </View>
            <Text style={styles.addMusicSubtext}>MP3, WAV, AAC</Text>
          </TouchableOpacity>

          {/* Abas */}
          <View style={styles.abasContainer}>
            <TouchableOpacity 
              style={[styles.aba, abaAtiva === 'todas' && styles.abaAtiva]}
              onPress={() => setAbaAtiva('todas')}
            >
              <Text style={[styles.abaTexto, abaAtiva === 'todas' && styles.abaTextoAtiva]}>
                Todas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.aba, abaAtiva === 'favoritas' && styles.abaAtiva]}
              onPress={() => setAbaAtiva('favoritas')}
            >
              <Text style={[styles.abaTexto, abaAtiva === 'favoritas' && styles.abaTextoAtiva]}>
                ⭐ Favoritas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.aba, abaAtiva === 'predefinidas' && styles.abaAtiva]}
              onPress={() => setAbaAtiva('predefinidas')}
            >
              <Text style={[styles.abaTexto, abaAtiva === 'predefinidas' && styles.abaTextoAtiva]}>
                📦 Sistema
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.aba, abaAtiva === 'minhas' && styles.abaAtiva]}
              onPress={() => setAbaAtiva('minhas')}
            >
              <Text style={[styles.abaTexto, abaAtiva === 'minhas' && styles.abaTextoAtiva]}>
                📁 Minhas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contador */}
          <View style={styles.contadorContainer}>
            <Text style={styles.contadorTexto}>
              {musicasExibidas.length} {musicasExibidas.length === 1 ? 'música' : 'músicas'}
            </Text>
          </View>

          {/* Lista de Músicas */}
          {musicasExibidas.length > 0 ? (
            <View style={styles.musicasLista}>
              {musicasExibidas.map(musica => 
                renderMusicaItem(musica, !musica.pre_definida && abaAtiva !== 'predefinidas')
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Image source={musicIcons.cd} style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateText}>
                {abaAtiva === 'favoritas' && 'Nenhuma música favoritada'}
                {abaAtiva === 'predefinidas' && 'Nenhuma música do sistema'}
                {abaAtiva === 'minhas' && 'Nenhuma música pessoal'}
                {abaAtiva === 'todas' && 'Nenhuma música encontrada'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {abaAtiva === 'minhas' && 'Adicione músicas do seu dispositivo'}
                {abaAtiva === 'favoritas' && 'Marque músicas como favoritas'}
                {abaAtiva === 'todas' && 'Adicione músicas ou use as do sistema'}
              </Text>
            </View>
          )}

          {/* Espaço no final */}
          <View style={styles.espacoFinal} />
        </ScrollView>
      </View>
    </Modal>
  );
};

// AGORA SIM o componente Jogo
function Jogo() {
  const router = useRouter();
  
  // === ESTADOS PRINCIPAIS ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Estados do jogo
  const [hora, setHora] = useState('');
  const [cenarioAtual, setCenarioAtual] = useState('dia_ensolarado');
  const [clima, setClima] = useState({ temperatura: '--', icone: '--' });
  const [showClimaDetail, setShowClimaDetail] = useState(false);

  // Estados de música (SISTEMA NOVO)
  const [musicas, setMusicas] = useState({
    preDefinidas: [],
    userMusicas: [],
    favoritas: []
  });
  const [musicaAtual, setMusicaAtual] = useState(null);
  const [sound, setSound] = useState(null);
  const [tocando, setTocando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPlayerMini, setShowPlayerMini] = useState(false);
  const [showMusicInterface, setShowMusicInterface] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);

  // === NOVO ESTADO PARA O MENU DO USUÁRIO ===
  const [showUserMenu, setShowUserMenu] = useState(false);

  // === USEEFFECTS ===

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    async function getLocationAndFetchClima() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permissão de localização negada!');
          return;
        }
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        const { latitude, longitude } = location.coords;
        const apiKey = 'f69ab47389319d7de688f72898bde932';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.main && data.weather) {
          let status = data.weather[0].main;
          let icone = '';
          if (status === 'Clear') icone = '☀️ Sol';
          else if (status === 'Rain' || status === 'Drizzle') icone = '🌧️ Chuva';
          else if (status === 'Clouds') icone = '☁️ Nublado';
          else if (status === 'Thunderstorm') icone = '⛈️ Tempestade';
          else if (status === 'Snow') icone = '❄️ Neve';
          else if (status === 'Mist' || status === 'Fog') icone = '🌫️ Neblina';
          else icone = `${status}`;
          
          setClima({
            temperatura: `${Math.round(data.main.temp)}°C`,
            icone: icone
          });
        }
      } catch (e) {
        console.log('Erro ao buscar clima:', e);
        setClima({ temperatura: '--', icone: '--' });
      }
    }
    getLocationAndFetchClima();
  }, []);

  // Atualizar hora e cenário - CORRIGIDO
  useEffect(() => {
    const updateHoraECenario = () => {
      const now = new Date();
      const horaFormatada = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setHora(horaFormatada);
      
      const novoCenario = determinarCenarioCompleto(horaFormatada, clima);
      if (novoCenario !== cenarioAtual) {
        setCenarioAtual(novoCenario);
      }
    };

    // Atualizar imediatamente
    updateHoraECenario();
    
    // Atualizar a cada segundo
    const timer = setInterval(updateHoraECenario, 1000);
    
    // Cleanup
    return () => {
      clearInterval(timer);
    };
  }, [clima, cenarioAtual]);

    // Buscar músicas quando logado
  useEffect(() => {
    if (isLoggedIn) {
      fetchMusicas();
    }
  }, [isLoggedIn]);

  // 🔍 ADICIONE AQUI O USEEFFECT DE DEBUG (nova linha)
  // Debug da conexão
  useEffect(() => {
    const testarConexao = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🔍 Testando conexão com:', BACKEND_IP);
        console.log('🔍 Token disponível:', !!token);
        
        const res = await fetch(`${BACKEND_IP}/`, {
          headers: { 
            'Authorization': token || '',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 Status da conexão:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Conexão OK:', data);
        } else {
          console.log('❌ Erro na conexão:', res.status);
        }
      } catch (error) {
        console.log('❌ Falha na conexão:', error.message);
      }
    };

    if (isLoggedIn) {
      testarConexao();
    }
  }, [isLoggedIn]);
// Debug específico da rota /musicas
useEffect(() => {
  const testarRotaMusicas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🎵 TESTANDO ROTA /MUSICAS');
      console.log('🔑 Token:', token);
      console.log('🌐 URL:', `${BACKEND_IP}/musicas`);
      
      const res = await fetch(`${BACKEND_IP}/musicas`, {
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Status:', res.status);
      console.log('📊 OK:', res.ok);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Dados recebidos:', data);
      } else {
        const errorText = await res.text();
        console.log('❌ Erro do servidor:', errorText);
      }
    } catch (error) {
      console.log('💥 Erro de rede:', error.message);
    }
  };

  if (isLoggedIn) {
    setTimeout(() => testarRotaMusicas(), 1000);
  }
}, [isLoggedIn]);

  // === FUNÇÕES DOS CENÁRIOS ===

  const determinarCenarioCompleto = (horaAtual, climaAtual) => {
    const hora = parseInt(horaAtual.split(':')[0]);
    const condicaoClima = climaAtual.icone.toLowerCase();
    
    let periodo = 'dia';
    if (hora >= 5 && hora < 12) periodo = 'manha';
    else if (hora >= 12 && hora < 17) periodo = 'tarde';
    else if (hora >= 17 && hora < 20) periodo = 'entardecer';
    else periodo = 'noite';
    
    let condicao = 'ensolarado';
    if (condicaoClima.includes('chuva') || condicaoClima.includes('rain') || condicaoClima.includes('drizzle')) {
      condicao = 'chuvoso';
    } else if (condicaoClima.includes('nublado') || condicaoClima.includes('cloud')) {
      condicao = 'nublado';
    } else if (condicaoClima.includes('tempestade') || condicaoClima.includes('thunderstorm')) {
      condicao = 'tempestade';
    } else if (condicaoClima.includes('neve') || condicaoClima.includes('snow')) {
      condicao = 'nevando';
    } else if (condicaoClima.includes('neblina') || condicaoClima.includes('mist') || condicaoClima.includes('fog')) {
      condicao = 'neblina';
    }
    
    return `${periodo}_${condicao}`;
  };

  const getCenarioSource = (cenario) => {
    switch (cenario) {
      case 'manha_ensolarado': return require('../assets/images/wallpaper.jpg');
      case 'manha_nublado': return require('../assets/images/wallpaper.jpg');
      case 'manha_chuvoso': return require('../assets/images/wallpaper.jpg');
      case 'tarde_ensolarado': return require('../assets/images/wallpaper.jpg');
      case 'tarde_nublado': return require('../assets/images/wallpaper.jpg');
      case 'tarde_chuvoso': return require('../assets/images/wallpaper.jpg');
      case 'entardecer_ensolarado': return require('../assets/images/wallpaper.jpg');
      case 'entardecer_nublado': return require('../assets/images/wallpaper.jpg');
      case 'noite_ensolarado': return require('../assets/images/wallpaper.jpg');
      case 'noite_nublado': return require('../assets/images/wallpaper.jpg');
      case 'noite_chuvoso': return require('../assets/images/wallpaper.jpg');
      default: return require('../assets/images/wallpaper.jpg');
    }
  };

  // === FUNÇÕES DE AUTENTICAÇÃO ===

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('Erro ao verificar autenticação:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = (token) => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setTocando(false);
        setMusicaAtual(null);
        setShowPlayerMini(false);
      }
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    }
  };

  // === FUNÇÕES DE MÚSICA (CORRIGIDAS) ===

  const fetchMusicas = async () => {
    // evita chamadas concorrentes
    if (musicLoading) return;
    setMusicLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token sendo enviado para /musicas:', token);
      
      const res = await fetch(`${BACKEND_IP}/musicas`, {
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setMusicas(data);
    } catch (e) {
      console.log('Erro ao buscar músicas:', e);
      // Carregar músicas mock para desenvolvimento
      setMusicas({
        preDefinidas: [
          {
            id: 1,
            nome: "Música Relaxante",
            artista: "Sistema",
            duracao: "2:30",
            favorita: false,
            pre_definida: true,
            caminho: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
          },
          {
            id: 2,
            nome: "Som da Natureza", 
            artista: "Sistema",
            duracao: "3:15",
            favorita: true,
            pre_definida: true,
            caminho: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
          }
        ],
        userMusicas: [],
        favoritas: []
      });
    }
    setMusicLoading(false);
  };

  const playMusica = async (musica) => {
  console.log('🎵 ===== TOCANDO MÚSICA =====');
  console.log('📝 Nome:', musica.nome);
  console.log('🔗 Caminho no BD:', musica.caminho);
  console.log('🏷️ Tipo:', musica.pre_definida ? 'Pré-definida' : 'Usuário');
  
  if (loading) return;
  
  setLoading(true);
  
  // Se já está tocando a mesma música, apenas pausa/despausa
  if (musicaAtual && musicaAtual.id === musica.id && sound) {
    if (tocando) {
      await sound.pauseAsync();
      setTocando(false);
      console.log('⏸️ Música pausada');
    } else {
      await sound.playAsync();
      setTocando(true);
      console.log('▶️ Música retomada');
    }
    setLoading(false);
    return;
  }

  // Para música atual se houver
  if (sound) {
    await sound.stopAsync();
    await sound.unloadAsync();
    setSound(null);
    console.log('🛑 Música anterior parada');
  }

  try {
    let source;
    
    // ✅ SISTEMA INTELIGENTE DE CARREGAMENTO
    if (musica.caminho === 'local_bathroom') {
      console.log('🔄 Carregando bathroom.mp3 local...');
      source = require('../assets/audio/bathroom.mp3');
      console.log('✅ bathroom.mp3 carregado via require');
    } else if (musica.caminho.startsWith('http')) {
      // Para URLs web
      console.log('🌐 Carregando URL web:', musica.caminho);
      source = { uri: musica.caminho };
    } else {
      // Para outros casos (como músicas do usuário)
      console.log('📁 Carregando caminho padrão:', musica.caminho);
      source = { uri: musica.caminho };
    }
    
    console.log('🎯 Source final:', source ? 'Carregado' : 'Nulo');

    // Configuração de áudio
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    console.log('▶️ Criando instância de áudio...');
    
    const { sound: newSound } = await Audio.Sound.createAsync(
      source,
      { 
        shouldPlay: true,
        isLooping: false
      }
    );
    
    console.log('✅ Áudio criado e tocando!');
    
    setSound(newSound);
    setMusicaAtual(musica);
    setTocando(true);
    setShowPlayerMini(true);
    
    // Evento quando a música terminar
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        console.log('🏁 Música terminou naturalmente');
        setTocando(false);
        setMusicaAtual(null);
        setShowPlayerMini(false);
      }
    });
    
  } catch (e) {
    console.log('❌ Erro ao tocar música:', e);
    alert('Erro ao tentar tocar a música: ' + e.message);
  }
  setLoading(false);
};

  const handlePlayPause = async () => {
    if (!sound || !musicaAtual) return;
    
    try {
      if (tocando) {
        await sound.pauseAsync();
        setTocando(false);
      } else {
        await sound.playAsync();
        setTocando(true);
      }
    } catch (e) {
      console.log('Erro ao pausar/retomar:', e);
    }
  };

  const stopMusica = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {
        console.log('Erro ao parar música:', e);
      }
      setSound(null);
      setTocando(false);
      setMusicaAtual(null);
      setShowPlayerMini(false);
    }
  };

  const toggleFavorito = async (musicaId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_IP}/musicas/${musicaId}/favorito`, {
        method: 'PUT',
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        // Atualiza a lista local
        const atualizarMusica = (lista) => lista.map(m => 
          m.id === musicaId ? { ...m, favorita: !m.favorita } : m
        );
        
        setMusicas(prev => ({
          preDefinidas: atualizarMusica(prev.preDefinidas),
          userMusicas: atualizarMusica(prev.userMusicas),
          favoritas: prev.favoritas.filter(m => m.id !== musicaId)
        }));
      }
    } catch (e) {
      console.log('Erro ao favoritar:', e);
      // Atualização local em caso de erro de rede
      const atualizarMusica = (lista) => lista.map(m => 
        m.id === musicaId ? { ...m, favorita: !m.favorita } : m
      );
      
      setMusicas(prev => ({
        preDefinidas: atualizarMusica(prev.preDefinidas),
        userMusicas: atualizarMusica(prev.userMusicas),
        favoritas: prev.favoritas.filter(m => m.id !== musicaId)
      }));
    }
  };

  const deletarMusica = async (musicaId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_IP}/musicas/${musicaId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        // Remove da lista local
        setMusicas(prev => ({
          ...prev,
          userMusicas: prev.userMusicas.filter(m => m.id !== musicaId)
        }));
        
        // Se era a música atual, para
        if (musicaAtual && musicaAtual.id === musicaId) {
          await stopMusica();
        }
      }
    } catch (e) {
      console.log('Erro ao deletar música:', e);
      // Remove localmente em caso de erro
      setMusicas(prev => ({
        ...prev,
        userMusicas: prev.userMusicas.filter(m => m.id !== musicaId)
      }));
    }
  };

 const handleAddLocalMusic = async () => {
  try {
    console.log('Iniciando seleção de música...');
    const result = await DocumentPicker.getDocumentAsync({ 
      type: 'audio/*',
      copyToCacheDirectory: true
    });
    
    console.log('Resultado do DocumentPicker:', result);
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const track = result.assets[0];
      console.log('Música selecionada:', track.name, 'URI:', track.uri);
      
      // Tenta salvar no backend primeiro
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token encontrado:', !!token);
        
        console.log('Tentando conectar com:', `${BACKEND_IP}/musicas`);
        
        const res = await fetch(`${BACKEND_IP}/musicas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token || ''
          },
          body: JSON.stringify({ 
            nome: track.name || 'Música Local',
            caminho: track.uri,
            artista: 'Arquivo Local',
            duracao: '0:00'
          })
        });
        
        console.log('Resposta do servidor status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Música salva no servidor:', data);
          await fetchMusicas();
          alert('Música adicionada com sucesso!');
        } else {
          console.log('Erro na resposta do servidor:', res.status);
          throw new Error(`Erro do servidor: ${res.status}`);
        }
      } catch (networkError) {
        console.log('Erro de rede ao salvar música, salvando localmente:', networkError);
        
        // Adiciona localmente em caso de erro de rede
        const novaMusica = {
          id: Date.now(),
          nome: track.name || 'Música Local',
          caminho: track.uri,
          artista: 'Arquivo Local',
          duracao: '0:00',
          favorita: false,
          pre_definida: false
        };
        
        setMusicas(prev => ({
          ...prev,
          userMusicas: [...prev.userMusicas, novaMusica]
        }));
        
        alert('Música adicionada localmente (sem conexão com o servidor)');
      }
    } else {
      console.log('Seleção de música cancelada');
    }
  } catch (e) {
    console.log('Erro geral ao selecionar música:', e);
    alert('Erro ao selecionar música. Tente novamente.');
  }
};

  // === COMPONENTES DE MÚSICA ===

  const PlayerMini = () => {
    if (!showPlayerMini || !musicaAtual) return null;

    return (
      <TouchableOpacity 
        style={styles.playerMini}
        onPress={() => setShowMusicInterface(true)}
        activeOpacity={0.9}
      >
        <View style={styles.playerMiniContent}>
          {/* CD Girando */}
          <View style={[styles.cd, tocando && styles.cdGirando]}>
            <Image 
              source={musicIcons.cd} 
              style={styles.cdImage} 
            />
          </View>
          
          <View style={styles.playerMiniInfo}>
            <Text style={styles.playerMiniNome} numberOfLines={1}>
              {musicaAtual.nome}
            </Text>
            <Text style={styles.playerMiniArtista} numberOfLines={1}>
              {musicaAtual.artista}
            </Text>
          </View>
          
          <TouchableOpacity onPress={handlePlayPause} style={styles.playerMiniBtn}>
            <Image 
              source={tocando ? musicIcons.pause : musicIcons.play} 
              style={styles.playerMiniIcon} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={stopMusica} style={styles.playerMiniBtn}>
            <Image 
              source={musicIcons.pause} 
              style={styles.playerMiniIcon} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // === RENDERIZAÇÃO CONDICIONAL ===

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffb300" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Verificando autenticação...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // === RENDER PRINCIPAL ===

  return (
    <ImageBackground 
      source={getCenarioSource(cenarioAtual)}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Info do cenário atual */}
      <View style={styles.cenarioInfo}>
        <Text style={styles.cenarioText}>
          🌅 {cenarioAtual.replace('_', ' ')}
        </Text>
      </View>

      {/* Menu do Usuário (SUBSTITUIU O BOTÃO SAIR) */}
      <View style={styles.userMenuContainer}>
        <TouchableOpacity
          style={styles.userMenuButton}
          onPress={() => setShowUserMenu(!showUserMenu)}
          activeOpacity={0.7}
        >
          <Text style={styles.userMenuIcon}>👤</Text>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push('/perfil');
              }}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowUserMenu(false);
                router.push('/perfil?tab=configuracoes');
              }}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuText}>Configurações</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setShowUserMenu(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuText, styles.menuTextDanger]}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Overlay para fechar menu ao clicar fora */}
      {showUserMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          onPress={() => setShowUserMenu(false)}
          activeOpacity={1}
        />
      )}

      {/* Menu hamburger */}
      <TouchableOpacity style={styles.hamburger} activeOpacity={0.5}>
        <View style={styles.burgerLine} />
        <View style={styles.burgerLine} />
        <View style={styles.burgerLine} />
      </TouchableOpacity>

      <View style={styles.grid}>
        {/* LINHA 1: Relógio + clima */}
        <View style={styles.row}>
          <View style={styles.box}>
            <Text style={styles.boxText}></Text>
          </View>

          <View style={styles.box}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setShowClimaDetail(!showClimaDetail)} style={styles.batataWrapper}>
              <View style={[styles.batataButton, { backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 16 }]}>
                <View style={styles.climaRelogioArea}>
                  <Text style={styles.climaText}>{clima.temperatura} {clima.icone}</Text>
                  <Text style={styles.relogio}>{hora}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Abrir Música - VERSÃO SIMPLES */}
        <TouchableOpacity
          style={styles.musicToggleHitbox}
          activeOpacity={0.8}
          onPress={() => {
            console.log('Botão música clicado');
            setShowMusicInterface(true);
          }}
        >
          <Text style={{ color: '#ffb300', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>
            Abrir{'\n'}Música
          </Text>
        </TouchableOpacity>

        {/* Área do personagem */}
        <TouchableOpacity
          style={styles.personHitbox}
          activeOpacity={0.8}
          onPress={() => router.push('/cronometro')}
        >
          <Text style={{ color: '#ffb300', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>
            Área do personagem{'\n'}(toque)
          </Text>
        </TouchableOpacity>

        {/* Personagem Focus */}
        <TouchableOpacity
          style={styles.focusHitbox}
          activeOpacity={0.8}
          onPress={() => router.push('/focus')}
        >
          <Text style={{ color: '#ffb300', fontWeight: 'bold', textAlign: 'center', fontSize: 12 }}>
            Foco{'\n'}(toque)
          </Text>
        </TouchableOpacity>
        
        {/* Detalhe do clima */}
        {showClimaDetail && (
          <TouchableOpacity style={styles.climaDetail} activeOpacity={1} onPress={() => setShowClimaDetail(false)}>
            <View style={styles.climaDetailContent}>
              <Text style={styles.climaDetailTitle}>Clima</Text>
              <Text style={styles.climaDetailText}>{clima.temperatura} — {clima.icone}</Text>
              <Text style={styles.climaDetailHint}>Toque para fechar</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Componentes de Música */}
      <PlayerMini />
      <MusicInterface 
        visible={showMusicInterface}
        onClose={() => setShowMusicInterface(false)}
        musicas={musicas}
        musicaAtual={musicaAtual}
        tocando={tocando}
        loading={loading}
        onPlayMusica={playMusica}
        onToggleFavorito={toggleFavorito}
        onDeletarMusica={deletarMusica}
        onAddLocalMusic={handleAddLocalMusic}
      />
    </ImageBackground>
  );
}

// ESTILOS COMPLETOS (ATUALIZADOS)
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cenarioInfo: {
    position: 'absolute',
    top: 80,
    left: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  cenarioText: {
    color: '#ffb300',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: { flex: 1 },
  // NOVOS ESTILOS DO MENU DO USUÁRIO
  userMenuContainer: {
    position: 'absolute',
    top: 32,
    right: 24,
    zIndex: 100,
  },
  userMenuButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.3)',
  },
  userMenuIcon: {
    fontSize: 20,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderRadius: 12,
    padding: 8,
    minWidth: 160,
    borderWidth: 1,
    borderColor: '#ffb300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemDanger: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  menuText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  menuTextDanger: {
    color: '#dc3545',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  hamburger: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
    zIndex: 10,
  },
  burgerLine: {
    width: 28,
    height: 4,
    backgroundColor: '#fff',
    marginVertical: 2,
    borderRadius: 2,
  },
  grid: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    marginBottom: 0,
  },
  box: {
    flex: 1,
    margin: 8,
    backgroundColor: 'transparent',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: '#0a174e',
    fontSize: 32,
    fontWeight: 'bold',
  },
  climaRelogioArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  climaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  relogio: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 8,
  },
  batataWrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  batataButton: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  musicToggleHitbox: {
    position: 'absolute',
    width: 120,
    height: 80,
    right: '10%',
    top: '35%',
    borderWidth: 2,
    borderColor: '#ffb300',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.06)',
    zIndex: 15,
    padding: 4,
  },
  personHitbox: {
    position: 'absolute',
    width: 120,
    height: 250,
    left: '5%',
    top: '35%',
    borderWidth: 2,
    borderColor: '#ffb300',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.06)',
    zIndex: 15,
    padding: 8,
  },
  focusHitbox: {
    position: 'absolute',
    width: 200,
    height: 400,
    left: '45%',
    bottom: '5%',
    borderWidth: 2,
    borderColor: '#ffb300',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.06)',
    zIndex: 15,
    padding: 8,
  },
  climaDetail: {
    position: 'absolute',
    top: 120,
    right: 24,
    zIndex: 9999,
  },
  climaDetailContent: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 12,
    borderRadius: 12,
    minWidth: 180,
  },
  climaDetailTitle: {
    color: '#ffb300',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  climaDetailText: {
    color: '#fff',
  },
  climaDetailHint: {
    color: '#ccc',
    marginTop: 8,
    fontSize: 12,
  },
  playerMini: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  playerMiniContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cd: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cdGirando: {
    transform: [{ rotate: '360deg' }],
  },
  cdImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  playerMiniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerMiniNome: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerMiniArtista: {
    color: '#ccc',
    fontSize: 12,
  },
  playerMiniBtn: {
    padding: 8,
    marginLeft: 8,
  },
  playerMiniIcon: {
    width: 20,
    height: 20,
  },
  musicModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  musicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  musicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  musicTitle: {
    color: '#ffb300',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerMiniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,179,0,0.1)',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playerMiniHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerMiniHeaderNome: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerMiniHeaderArtista: {
    color: '#ccc',
    fontSize: 14,
  },
  playerMiniHeaderBtn: {
    padding: 8,
  },
  playerMiniHeaderIcon: {
    width: 24,
    height: 24,
  },
  musicContent: {
    flex: 1,
    padding: 16,
  },
  addMusicBtn: {
    backgroundColor: 'rgba(255,179,0,0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffb300',
  },
  addMusicBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMusicIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  addMusicText: {
    color: '#ffb300',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addMusicSubtext: {
    color: '#ffb300',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 36,
  },
  abasContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  aba: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: '#ffb300',
  },
  abaTexto: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  abaTextoAtiva: {
    color: '#000',
  },
  contadorContainer: {
    marginBottom: 16,
  },
  contadorTexto: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  musicasLista: {
    marginBottom: 20,
  },
  musicaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  musicaPlayBtn: {
    padding: 8,
    marginRight: 12,
  },
  musicaPlayIcon: {
    width: 20,
    height: 20,
  },
  musicaInfo: {
    flex: 1,
  },
  musicaNome: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  musicaArtista: {
    color: '#ccc',
    fontSize: 12,
  },
  musicaActionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  musicaActionIcon: {
    width: 16,
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  espacoFinal: {
    height: 40,
  },
});

export default Jogo;
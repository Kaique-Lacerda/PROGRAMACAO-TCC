import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ImageBackground, 
  ActivityIndicator,
  Text
} from 'react-native';
import { useRouter } from 'expo-router';
import Login from './login';

// Importar features modularizadas
import { useMusicPlayer } from './features/music-player/useMusicPlayer';
import MusicInterface from './features/music-player/MusicInterface';
import FloatingPlayer from './features/music-player/FloatingPlayer';

import { useWeather } from './features/weather-system/useWeather';
import WeatherWidget from './features/weather-system/WeatherWidget';

import { useTime } from './features/time-system/useTime';
import TimeWidget from './features/time-system/TimeWidget';

import { useAuth } from './features/user-system/useAuth';
import UserMenu from './features/user-system/UserMenu';

import NavigationButtons from './features/navigation/NavigationButtons';

function Jogo() {
  const router = useRouter();
  
  // === SISTEMA DE AUTENTICAÇÃO ===
  const { isLoggedIn, checkingAuth, handleLogin, handleLogout } = useAuth();

  // === SISTEMA DE CLIMA ===
  const { clima } = useWeather();

  // === SISTEMA DE TEMPO ===
  const { hora, cenarioAtual } = useTime(clima);

  // === SISTEMA DE MÚSICA ===
  const {
    musicas,
    musicaAtual,
    tocando,
    loading,
    playMusica,
    handlePlayPause,
    stopMusica,
    toggleFavorito,
    deletarMusica,
    handleAddLocalMusic,
  } = useMusicPlayer();

  const [showMusicInterface, setShowMusicInterface] = useState(false);
  const [showPlayerMini, setShowPlayerMini] = useState(false);

  // Mostrar player mini quando tem música atual
  useEffect(() => {
    setShowPlayerMini(!!musicaAtual);
  }, [musicaAtual]);

  // Função para obter o wallpaper (placeholder para futuras artes)
  const getCenarioSource = () => {
    return require('../assets/images/wallpaper-jogo.png');
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
      source={getCenarioSource()}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Widget de Tempo */}
      <TimeWidget hora={hora} cenarioAtual={cenarioAtual} />

      {/* Menu do Usuário */}
      <UserMenu onLogout={handleLogout} />

      {/* Widget de Clima */}
      <View style={styles.weatherContainer}>
        <WeatherWidget clima={clima} />
      </View>

      {/* Botões de Navegação */}
      <NavigationButtons onOpenMusic={() => setShowMusicInterface(true)} />

      {/* Componentes de Música */}
      <FloatingPlayer 
        musicaAtual={musicaAtual}
        tocando={tocando}
        onPlayPause={handlePlayPause}
        onStop={stopMusica}
        onOpenMusicInterface={() => setShowMusicInterface(true)}
        showPlayer={showPlayerMini}
      />
      
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

// ESTILOS SIMPLIFICADOS
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  container: { 
    flex: 1 
  },
  weatherContainer: {
    position: 'absolute',
    top: '30%',
    right: '5%',
    zIndex: 10,
  },
});

export default Jogo;
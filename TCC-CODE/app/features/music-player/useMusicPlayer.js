import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { musicService } from './services/musicService';

export const useMusicPlayer = () => {
  // Estados
  const [musicas, setMusicas] = useState({
    preDefinidas: [],
    userMusicas: [],
    favoritas: []
  });
  const [musicaAtual, setMusicaAtual] = useState(null);
  const [sound, setSound] = useState(null);
  const [tocando, setTocando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);

  // Carregar músicas do AsyncStorage
  const carregarMusicasDoStorage = async () => {
  try {
    const storedMusicas = await AsyncStorage.getItem('user_musicas');
    console.log('📂', 'STORAGE', 'Dados brutos do storage:', storedMusicas);
    
    if (storedMusicas) {
      const userMusicas = JSON.parse(storedMusicas);
      console.log('📂', 'STORAGE', `Carregadas ${userMusicas.length} músicas do storage`);
      
      setMusicas(prev => ({
        ...prev,
        userMusicas: userMusicas
      }));
    } else {
      console.log('📂', 'STORAGE', 'Nenhuma música encontrada no storage');
    }
  } catch (error) {
    console.log('❌', 'STORAGE', 'Erro ao carregar músicas:', error);
  }
};

  // Salvar músicas no AsyncStorage
const salvarMusicasNoStorage = async () => {
  try {
    await AsyncStorage.setItem('user_musicas', JSON.stringify(musicas.userMusicas));
    console.log('💾', 'STORAGE', `Salvas ${musicas.userMusicas.length} músicas no AsyncStorage`);
    
    // Verifica se salvou corretamente
    const verificacao = await AsyncStorage.getItem('user_musicas');
    const salvas = JSON.parse(verificacao || '[]');
    console.log('🔍', 'STORAGE', `Verificação: ${salvas.length} músicas salvas`);
    
  } catch (error) {
    console.log('❌', 'STORAGE', 'Erro ao salvar músicas:', error);
  }
};

  // Buscar músicas do servidor
  const fetchMusicas = async () => {
    if (musicLoading) return;
    
    setMusicLoading(true);
    try {
      console.log('🎵', 'MÚSICAS', 'Buscando músicas do servidor...');
      
      const data = await musicService.getMusics();
      
      console.log('✅', 'MÚSICAS', `Encontradas: ${data.length} músicas`);
      
      const musicasAdaptadas = data.map(musica => ({
        id: musica._id,
        nome: musica.title,
        artista: musica.artist,
        duracao: `${Math.floor(musica.duration / 60)}:${(musica.duration % 60).toString().padStart(2, '0')}`,
        favorita: musica.isFavorite,
        pre_definida: true,
        caminho: `local_${musica.filePath.replace('.mp3', '').toLowerCase()}`
      }));
      
      setMusicas(prev => ({
        ...prev,
        preDefinidas: musicasAdaptadas,
        favoritas: musicasAdaptadas.filter(m => m.favorita)
      }));
      
    } catch (e) {
      console.log('❌', 'MÚSICAS', 'Erro ao buscar músicas:', e);
      setMusicas(prev => ({
        ...prev,
        preDefinidas: [],
        favoritas: []
      }));
    } finally {
      setMusicLoading(false);
    }
  };

  // Tocar música
  const playMusica = async (musica) => {
    console.log('🎵', 'PLAYER', `Tocando: ${musica.nome}`);
    
    if (loading) return;
    
    setLoading(true);
    
    // Se já está tocando a mesma música, apenas pausa/despausa
    if (musicaAtual && musicaAtual.id === musica.id && sound) {
      if (tocando) {
        await sound.pauseAsync();
        setTocando(false);
        console.log('⏸️', 'PLAYER', 'Música pausada');
      } else {
        await sound.playAsync();
        setTocando(true);
        console.log('▶️', 'PLAYER', 'Música retomada');
      }
      setLoading(false);
      return;
    }

    // Para música atual se houver
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      console.log('🛑', 'PLAYER', 'Música anterior parada');
    }

    try {
      let source;
      
      const mapeamentoAudios = {
        'local_all_night_long': require('../../../assets/audio/All_Night_Long.mp3'),
        'local_k.o': require('../../../assets/audio/K.O.mp3'),
        'local_shut_up_and_listen': require('../../../assets/audio/Shut_Up_and_Listen.mp3'),
        'local_sol_loiro': require('../../../assets/audio/Sol_Loiro.mp3'),
        'local_bathroom': require('../../../assets/audio/bathroom.mp3'),
        'local_flamingos': require('../../../assets/audio/flamingos.mp3')
      };

      if (mapeamentoAudios[musica.caminho]) {
        console.log('📁', 'PLAYER', `Carregando arquivo local: ${musica.caminho}`);
        source = mapeamentoAudios[musica.caminho];
      } else if (musica.caminho.startsWith('http') || musica.caminho.startsWith('file://')) {
        console.log('📱', 'PLAYER', `Carregando arquivo do dispositivo: ${musica.caminho}`);
        source = { uri: musica.caminho };
      } else {
        console.log('❌', 'PLAYER', `Caminho não reconhecido: ${musica.caminho}`);
        throw new Error(`Tipo de áudio não suportado: ${musica.caminho}`);
      }
      
      console.log('✅', 'PLAYER', 'Source configurado corretamente');

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      console.log('▶️', 'PLAYER', 'Criando instância de áudio...');
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        source,
        { 
          shouldPlay: true,
          isLooping: false
        }
      );
      
      console.log('✅', 'PLAYER', 'Áudio criado e tocando!');
      
      setSound(newSound);
      setMusicaAtual(musica);
      setTocando(true);
      
      // Evento quando a música terminar
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log('🏁', 'PLAYER', 'Música terminou naturalmente');
          setTocando(false);
          setMusicaAtual(null);
        }
      });
      
    } catch (e) {
      console.log('❌', 'PLAYER', `Erro ao tocar música: ${e.message}`);
      alert('Erro ao tentar tocar a música: ' + e.message);
    }
    setLoading(false);
  };

  // Play/Pause
  const handlePlayPause = async () => {
    if (!sound || !musicaAtual) return;
    
    try {
      if (tocando) {
        await sound.pauseAsync();
        setTocando(false);
        console.log('⏸️', 'PLAYER', 'Música pausada');
      } else {
        await sound.playAsync();
        setTocando(true);
        console.log('▶️', 'PLAYER', 'Música retomada');
      }
    } catch (e) {
      console.log('❌', 'PLAYER', 'Erro ao pausar/retomar:', e);
    }
  };

  // Parar música
  const stopMusica = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        console.log('🛑', 'PLAYER', 'Música parada');
      } catch (e) {
        console.log('❌', 'PLAYER', 'Erro ao parar música:', e);
      }
      setSound(null);
      setTocando(false);
      setMusicaAtual(null);
    }
  };

  // Alternar favorito
  const toggleFavorito = async (musicaId) => {
    try {
      console.log('⭐', 'MÚSICAS', `Alternando favorito para música ID: ${musicaId}`);
      
      const result = await musicService.toggleFavorite(musicaId);
      
      const atualizarMusica = (lista) => lista.map(m => 
        m.id === musicaId ? { ...m, favorita: result.isFavorite } : m
      );
      
      setMusicas(prev => ({
        preDefinidas: atualizarMusica(prev.preDefinidas),
        userMusicas: atualizarMusica(prev.userMusicas),
        favoritas: result.isFavorite 
          ? [...prev.favoritas, prev.preDefinidas.find(m => m.id === musicaId)].filter(Boolean)
          : prev.favoritas.filter(m => m.id !== musicaId)
      }));
      
      console.log('✅', 'MÚSICAS', `Favorito atualizado: ${result.isFavorite}`);
      
    } catch (e) {
      console.log('❌', 'MÚSICAS', 'Erro ao favoritar:', e);
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

  // Deletar música
  const deletarMusica = async (musicaId) => {
    try {
      console.log('🗑️', 'MÚSICAS', `Tentando deletar música ID: ${musicaId}`);
      
      setMusicas(prev => ({
        ...prev,
        userMusicas: prev.userMusicas.filter(m => m.id !== musicaId)
      }));
      
      setTimeout(async () => {
        await salvarMusicasNoStorage();
      }, 100);
      
      if (musicaAtual && musicaAtual.id === musicaId) {
        await stopMusica();
      }
      
      console.log('✅', 'MÚSICAS', `Música deletada ID: ${musicaId}`);
      
    } catch (e) {
      console.log('❌', 'MÚSICAS', 'Erro ao deletar música:', e);
    }
  };

  // Adicionar música local
const handleAddLocalMusic = async () => {
  try {
    console.log('📁', 'MÚSICAS', 'Iniciando seleção de arquivo...');
    const result = await DocumentPicker.getDocumentAsync({ 
      type: 'audio/*',
      copyToCacheDirectory: true
    });
    
    console.log('📦', 'MÚSICAS', 'Resultado do DocumentPicker:', result);
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const track = result.assets[0];
      console.log('✅', 'MÚSICAS', `Arquivo selecionado: ${track.name}`);
      
      const novaMusica = {
        id: Date.now().toString(),
        nome: track.name || 'Música Local',
        caminho: track.uri,
        artista: 'Arquivo Local',
        duracao: '0:00',
        favorita: false,
        pre_definida: false
      };
      
      console.log('➕', 'MÚSICAS', 'Adicionando música:', novaMusica);
      
      // ✅ ATUALIZA O ESTADO E SALVA DIRETAMENTE
      setMusicas(prev => {
        const novasMusicas = {
          ...prev,
          userMusicas: [...prev.userMusicas, novaMusica]
        };
        
        // ✅ SALVA NO STORAGE COM O NOVO ESTADO
        AsyncStorage.setItem('user_musicas', JSON.stringify(novasMusicas.userMusicas))
          .then(() => console.log('💾', 'STORAGE', `Salvas ${novasMusicas.userMusicas.length} músicas`))
          .catch(error => console.log('❌', 'STORAGE', 'Erro ao salvar:', error));
        
        return novasMusicas;
      });
      
      alert('Música adicionada com sucesso!');
      
    } else {
      console.log('ℹ️', 'MÚSICAS', 'Seleção de música cancelada');
    }
  } catch (e) {
    console.log('❌', 'MÚSICAS', 'Erro geral ao selecionar música:', e);
    alert('Erro ao selecionar música. Tente novamente.');
  }
};

  // INICIALIZAÇÃO AUTOMÁTICA
  useEffect(() => {
    console.log('🎵', 'MÚSICAS', 'Inicializando sistema de música...');
    fetchMusicas();
    carregarMusicasDoStorage();
  }, []);

  return {
    // Estados
    musicas,
    musicaAtual,
    tocando,
    loading,
    musicLoading,
    
    // Funções
    fetchMusicas,
    playMusica,
    handlePlayPause,
    stopMusica,
    toggleFavorito,
    deletarMusica,
    handleAddLocalMusic,
    carregarMusicasDoStorage
  };
};
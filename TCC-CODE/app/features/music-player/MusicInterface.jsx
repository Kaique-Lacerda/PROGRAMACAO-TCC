import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal
} from 'react-native';

// Importar ícones de música
const musicIcons = {
  play: require('../../../assets/images/icons/musica/play.png'),
  pause: require('../../../assets/images/icons/musica/pause.png'),
  favorito: require('../../../assets/images/icons/musica/favorito.png'),
  favorito_preenchido: require('../../../assets/images/icons/musica/favorito_preenchido.png'),
  lixeira: require('../../../assets/images/icons/musica/lixeira.png'),
  add: require('../../../assets/images/icons/musica/add.png'),
  cd: require('../../../assets/images/icons/musica/cd.png')
};

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

const styles = StyleSheet.create({
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

export default MusicInterface;
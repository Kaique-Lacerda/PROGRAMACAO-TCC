import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';

// Importar ícones de música
const musicIcons = {
  play: require('../../../assets/images/icons/musica/play.png'),
  pause: require('../../../assets/images/icons/musica/pause.png'),
  cd: require('../../../assets/images/icons/musica/cd.png')
};

const FloatingPlayer = ({ 
  musicaAtual, 
  tocando, 
  onPlayPause, 
  onStop, 
  onOpenMusicInterface,
  showPlayer 
}) => {
  if (!showPlayer || !musicaAtual) return null;

  return (
    <TouchableOpacity 
      style={styles.playerMini}
      onPress={onOpenMusicInterface}
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
        
        <TouchableOpacity onPress={onPlayPause} style={styles.playerMiniBtn}>
          <Image 
            source={tocando ? musicIcons.pause : musicIcons.play} 
            style={styles.playerMiniIcon} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onStop} style={styles.playerMiniBtn}>
          <Image 
            source={musicIcons.pause} 
            style={styles.playerMiniIcon} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    zIndex: 100,
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
});

export default FloatingPlayer;
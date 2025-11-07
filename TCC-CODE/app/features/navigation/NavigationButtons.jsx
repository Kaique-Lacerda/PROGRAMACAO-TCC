import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';

const NavigationButtons = ({ onOpenMusic }) => {
  const router = useRouter();

  return (
    <View style={styles.navigationContainer}>
      {/* Botão Abrir Música */}
      <TouchableOpacity
        style={styles.musicToggleHitbox}
        activeOpacity={0.8}
        onPress={() => {
          console.log('🎵', 'MÚSICAS', 'Abrindo interface de músicas');
          if (onOpenMusic) {
            onOpenMusic();
          }
        }}
      >
        <Text style={styles.navButtonText}>
          Abrir{'\n'}Música
        </Text>
      </TouchableOpacity>

      {/* Área do personagem */}
      <TouchableOpacity
        style={styles.personHitbox}
        activeOpacity={0.85}
        onPress={() => router.push('/cronometro')}
        accessibilityLabel="Área do personagem"
      >
        <Image
          source={require('../../../assets/images/elementos.png')}
          style={styles.personImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Botão Focus */}
      <TouchableOpacity
        style={styles.focusHitbox}
        activeOpacity={0.8}
        onPress={() => router.push('/focus')}
      >
        <Text style={styles.navButtonText}>
          Foco{'\n'}(toque)
        </Text>
      </TouchableOpacity>

      {/* Menu hamburger (placeholder) */}
      <TouchableOpacity style={styles.hamburger} activeOpacity={0.5}>
        <View style={styles.burgerLine} />
        <View style={styles.burgerLine} />
        <View style={styles.burgerLine} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
    padding: 8,
  },
  personImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
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
  navButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  hamburger: {
    position: 'absolute',
    top: -280,
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
});

export default NavigationButtons;
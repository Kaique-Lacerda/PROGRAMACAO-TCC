// TCC-CODE/app/features/navigation/NavigationButtons.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { CharacterCustomization } from '../character-customization';
import { useCharacterCustomization } from '../character-customization/hooks/useCharacterCustomization';
import { getCharacterImage } from '../character-customization/utils/characterAssets';

const NavigationButtons = ({ onOpenMusic }) => {
  const router = useRouter();
  const [showCustomization, setShowCustomization] = useState(false);
  
  const { character, updateCharacter, resetCharacter } = useCharacterCustomization();

  const getMiniCharacterLayers = () => {
    if (!character) return [];
    
    return [
      getCharacterImage('skin', character.skin),
      getCharacterImage('shirt', character.shirt),
      getCharacterImage('dress', character.dress),
      getCharacterImage('socks', character.socks),
      getCharacterImage('hair', character.hair),
      getCharacterImage('eyes', character.eyes),
    ].filter(Boolean);
  };

  return (
    <View style={styles.navigationContainer}>
      {/* BOTÃO MÚSICA (VISÍVEL) */}
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

      {/* BOTÃO PERSONAGEM/CRONÔMETRO (VISÍVEL) */}
      <TouchableOpacity
        style={styles.personHitbox}
        activeOpacity={0.85}
        onPress={() => router.push('/cronometro')}
      >
        <Image 
          source={require('../../../assets/images/veio.png')}
          style={styles.personImage}
        />
      </TouchableOpacity>

      {/* PERSONAGEM = BOTÃO FOCUS (VISÍVEL) */}
      <TouchableOpacity
        style={styles.characterHitbox}
        activeOpacity={0.8}
        onPress={() => router.push('/focus')}
      >
        <View style={styles.characterContainer}>
          {/* Mini preview da personagem */}
          <View style={styles.miniCharacter}>
            {getMiniCharacterLayers().map((imageSource, index) => (
              <Image 
                key={index}
                source={imageSource}
                style={styles.miniLayer}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>

      {/* BOTÃO PERSONALIZAR (VISÍVEL) */}
      <TouchableOpacity
        style={styles.customizeButton}
        activeOpacity={0.8}
        onPress={() => setShowCustomization(true)}
      >
      </TouchableOpacity>

      {/* Modal de Personalização */}
      <Modal
        visible={showCustomization}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomization(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personalizar Personagem</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCustomization(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          <CharacterCustomization 
            character={character}
            onUpdate={updateCharacter}
            onReset={resetCharacter}
          />
        </View>
      </Modal>

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
  // BOTÃO MÚSICA - VERDE
  musicToggleHitbox: {
    position: 'absolute',
    width: 150,
    height: 100,
    right: '2%',
    top: '41%',
    borderWidth: 3,
    borderColor: '#00ff00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,0,0.2)',
    zIndex: 15,
    padding: 4,
  },
  // BOTÃO PERSONAGEM/CRONÔMETRO - AZUL
  personHitbox: {
    position: 'absolute',
    width: 200,
    height: 320,
    left: '2%',
    top: '39%',
    borderWidth: 3,
    borderColor: '#0066ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,102,255,0.2)',
    zIndex: 15,
    padding: 8,
  },
  personImage: {
    width:300,
    height: 300,
    left: '-10%'
  },
  // PERSONAGEM = BOTÃO FOCUS - VERMELHO
  characterHitbox: {
    position: 'absolute',
    width: 200,
    height: 350,
    right: '2%',
    bottom: '5%',
    borderWidth: 3,
    borderColor: '#ff0000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.2)',
    zIndex: 13,
  },
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // BOTÃO PERSONALIZAR - AMARELO
  customizeButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    left: '2%',
    top: '5%',
    borderWidth: 3,
    borderColor: '#ffff00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,0,0.2)',
    zIndex: 15,
    padding: 8,
  },
  miniCharacter: {
    width: 300,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  navButtonText: {
    color: '#ffb300',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  // TEXTO DEBUG PARA IDENTIFICAR CADA BOTÃO
  debugText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 4,
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
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default NavigationButtons;
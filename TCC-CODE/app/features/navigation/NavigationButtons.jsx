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
import { CharacterPreview } from '../character-customization/components/CharacterPreview';
import { useCharacterCustomization } from '../character-customization/hooks/useCharacterCustomization';

const NavigationButtons = ({ onOpenMusic }) => {
  const router = useRouter();
  const [showCustomization, setShowCustomization] = useState(false);
  const { character } = useCharacterCustomization();

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

      {/* Personagem Customizada no lugar do botão Focus */}
      <TouchableOpacity
        style={styles.characterHitbox}
        activeOpacity={0.8}
        onPress={() => setShowCustomization(true)}
      >
        <View style={styles.characterContainer}>
          {/* Mini preview da personagem customizada */}
          <View style={styles.miniCharacter}>
            <Image 
              source={require('../../../assets/images/character-customization/shirt/default.png')}
              style={styles.miniLayer}
            />
            <Image 
              source={require('../../../assets/images/character-customization/dress/default.png')}
              style={styles.miniLayer}
            />
            <Image 
              source={require('../../../assets/images/character-customization/socks/default.png')}
              style={styles.miniLayer}
            />
            <Image 
              source={require('../../../assets/images/character-customization/hair/default.png')}
              style={styles.miniLayer}
            />
            <Image 
              source={require('../../../assets/images/character-customization/eyes/default.png')}
              style={styles.miniLayer}
            />
          </View>
          <Text style={styles.characterText}>
            Personalizar{'\n'}Personagem
          </Text>
        </View>
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
          <CharacterCustomization />
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
  // NOVO: Container da personagem customizada
  characterHitbox: {
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
  characterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCharacter: {
    width: 1700,
    height: 1700,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
     transform: [
    { translateX: -75 }, // Move para a esquerda
    { translateY: -150 }  // Move para cima
     ]
  },
  miniLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  characterText: {
    color: '#ffb300',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
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
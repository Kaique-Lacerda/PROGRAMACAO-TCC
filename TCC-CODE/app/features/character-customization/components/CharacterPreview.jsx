// TCC-CODE/app/features/character-customization/components/CharacterPreview.jsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { getCharacterImage } from '../utils/characterAssets';

export const CharacterPreview = ({ character }) => {
  // Proteção contra character undefined
  if (!character) {
    return (
      <View style={styles.container}>
        <View style={styles.layerContainer}>
          <Text style={styles.errorText}>Personagem não carregada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.layerContainer}>
        {/* Render cada camada na ordem correta - SEM ANIMAÇÃO */}
        <Image 
          source={getCharacterImage('skin', character.skin)} 
          style={styles.layer}
        />
        <Image 
          source={getCharacterImage('shirt', character.shirt)} 
          style={styles.layer}
        />
        <Image 
          source={getCharacterImage('dress', character.dress)} 
          style={styles.layer}
        />
        <Image 
          source={getCharacterImage('socks', character.socks)} 
          style={styles.layer}
        />
        <Image 
          source={getCharacterImage('hair', character.hair)} 
          style={styles.layer}
        />
        <Image 
          source={getCharacterImage('eyes', character.eyes)} 
          style={styles.layer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e9ecef',
    margin: 10,
    padding: 10,
  },
  layerContainer: {
    width: 200,
    height: 350,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  layer: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    resizeMode: 'contain'
  },
  errorText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
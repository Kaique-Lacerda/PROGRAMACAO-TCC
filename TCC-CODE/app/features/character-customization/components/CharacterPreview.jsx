// TCC-CODE/app/features/character-customization/components/CharacterPreview.jsx
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export const CharacterPreview = ({ character }) => {
  const getImageSource = (category, value) => {
    // Mapeamento direto para require - só as versões default que existem
    const imageMap = {
      // Shirt
      'shirt.default': require('../../../../assets/images/character-customization/shirt/default.png'),

      // Dress
      'dress.default': require('../../../../assets/images/character-customization/dress/default.png'),

      // Eyes
      'eyes.default': require('../../../../assets/images/character-customization/eyes/default.png'),

      // Hair - só o default
      'hair.default': require('../../../../assets/images/character-customization/hair/default.png'),

      // Socks - só a versão default que existe
      'socks.thigh-high.default': require('../../../../assets/images/character-customization/socks/default.png'),
    };

    const key = `${category}.${value}`;
    return imageMap[key];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preview da Personagem</Text>
      
      <View style={styles.layerContainer}>
        {/* Debug center marker */}
        <View style={styles.debugCenter}>
          <View style={styles.centerDot} />
        </View>

        {/* Render cada camada - só as que temos arquivos */}
        <Image 
          source={getImageSource('shirt', character.shirt)} 
          style={styles.layer}
          onError={(e) => console.log('❌ Erro shirt')}
        />
        <Image 
          source={getImageSource('dress', character.dress)} 
          style={styles.layer}
          onError={(e) => console.log('❌ Erro dress')}
        />
        <Image 
          source={getImageSource('socks', character.socks.type)} 
          style={styles.layer}
          onError={(e) => console.log('❌ Erro socks')}
        />
        <Image 
          source={getImageSource('hair', character.hair.type)} 
          style={styles.layer}
          onError={(e) => console.log('❌ Erro hair')}
        />
        <Image 
          source={getImageSource('eyes', character.eyes)} 
          style={styles.layer}
          onError={(e) => console.log('❌ Erro eyes')}
        />
      </View>

      <Text style={styles.debugText}>
        Container: 200x400px{'\n'}
        Verifique o console para erros
      </Text>
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
    padding: 20,
  },
  title: {
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  layerContainer: {
    width: 300,  // 🔥 Aumentei de 200 para 300
    height: 500, // 🔥 Aumentei de 400 para 500
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
    width: '120%',   // 🔥 Aumentei de 100% para 120%
    height: '120%',  // 🔥 Aumentei de 100% para 120%
    resizeMode: 'contain'
  },
  debugCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 4,
    height: 4,
    backgroundColor: 'red',
    borderRadius: 2
  },
  debugText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
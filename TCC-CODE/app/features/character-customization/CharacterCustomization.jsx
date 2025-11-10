// TCC-CODE/app/features/character-customization/CharacterCustomization.jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CharacterPreview } from './components/CharacterPreview';
import { CustomizationPanel } from './components/CustomizationPanel';
import { useCharacterCustomization } from './hooks/useCharacterCustomization';

export const CharacterCustomization = () => {
  const { character, updateCharacter, resetCharacter } = useCharacterCustomization();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personalização da Personagem</Text>
        <TouchableOpacity 
          onPress={resetCharacter}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Resetar</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <CharacterPreview character={character} />
          <CustomizationPanel 
            character={character} 
            onUpdate={updateCharacter} 
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
});
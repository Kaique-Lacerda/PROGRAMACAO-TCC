// TCC-CODE/app/features/character-customization/CharacterCustomization.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CharacterPreview } from './components/CharacterPreview';
import { CustomizationPanel } from './components/CustomizationPanel';

// AGORA RECEBE PROPS EM VEZ DE USAR SEU PRÓPRIO HOOK
export const CharacterCustomization = ({ character, onUpdate, onReset }) => {
  const [selectedCategory, setSelectedCategory] = useState('skin');

  const categories = {
    skin: {
      label: 'Pele',
      icon: '👋',
      color: '#E6C3B1',
      options: ['1', '2', '3']
    },
    shirt: {
      label: 'Camisa',
      icon: '👕',
      color: '#8330ba',
      options: [
        'purple-default', 'purple-347c96', 'purple-408c3b', 'purple-5e5e2b', 
        'purple-787878', 'purple-8330ba', 'purple-85623d', 'purple-c7e2ed',
        'purple-eb8dd7', 'purple-eef069', 'red-default', 'red-347c96',
        'red-408c3b', 'red-5e5e2b', 'red-8330ba', 'red-85623d', 'red-c7e2ed',
        'red-787878', 'red-eb8dd7', 'red-eef069'
      ]
    },
    dress: {
      label: 'Vestido',
      icon: '👗',
      color: '#a12a2a',
      options: ['123d0f', '141414', '22112e', '282873', '545454', 'a12a2a']
    },
    eyes: {
      label: 'Olhos',
      icon: '👁️',
      color: '#32732c',
      options: ['22573d', '32732c', '362542', '362d36', '402e1b', '451c3b', '592b2b', '7a7a3b']
    },
    hair: {
      label: 'Cabelo',
      icon: '💇',
      color: '#573e25',
      options: [
        '313337', '347c96', '36c72c', '573e25', '5e5e2b', '6f3198', 
        '736feb', 'bf1f97', 'c7e2ed', 'de2424', 'eef069'
      ]
    },
    socks: {
      label: 'Meias',
      icon: '🧦',
      color: '#315c2e',
      options: [
        'top-121212', 'top-252554', 'top-315c2e', 'top-6f3198', 'top-ad3636', 'top-d4d4d4',
        'top-neko-121212', 'top-neko-d4d4d4', 'mid-121212', 'mid-252554', 'mid-315c2e',
        'mid-6f3198', 'mid-ad3636', 'mid-d4d4d4', 'bot-121212', 'bot-252554',
        'bot-315c2e', 'bot-6f3198', 'bot-ad3636', 'bot-d4d4d4'
      ]
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personalização da Personagem</Text>
        <TouchableOpacity 
          onPress={onReset}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Resetar</Text>
        </TouchableOpacity>
      </View>

      {/* Navegação por Categorias */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesNav}
        contentContainerStyle={styles.categoriesNavContent}
      >
        {Object.entries(categories).map(([category, data]) => (
          <TouchableOpacity
            key={category}
            onPress={() => handleCategorySelect(category)}
            style={[
              styles.categoryNavButton,
              selectedCategory === category && [
                styles.categoryNavButtonActive,
                { backgroundColor: data.color }
              ]
            ]}
          >
            <Text style={styles.categoryNavIcon}>{data.icon}</Text>
            <Text style={[
              styles.categoryNavText,
              selectedCategory === category && styles.categoryNavTextActive
            ]}>
              {data.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Content */}
      <View style={styles.content}>
        <CharacterPreview character={character} />
        <CustomizationPanel 
          character={character} 
          onUpdate={onUpdate}
          selectedCategory={selectedCategory}
          categoryData={categories[selectedCategory]}
        />
      </View>
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
  categoriesNav: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 70,
  },
  categoriesNavContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  categoryNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  categoryNavButtonActive: {
    borderColor: 'rgba(0,0,0,0.1)',
  },
  categoryNavIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryNavText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryNavTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    gap: 20,
  },
});
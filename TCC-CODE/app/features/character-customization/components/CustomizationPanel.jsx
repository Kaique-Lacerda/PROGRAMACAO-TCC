// TCC-CODE/app/features/character-customization/components/CustomizationPanel.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CustomizationPanel = ({ character, onUpdate }) => {
  const options = {
    'hair.type': ['default'], // Só default por enquanto
    eyes: ['default'],
    shirt: ['default'],
    dress: ['default'],
    'socks.type': ['thigh-high'] // Só thigh-high por enquanto
  };

  const labels = {
    'hair.type': 'Cabelo',
    eyes: 'Olhos',
    shirt: 'Camisa',
    dress: 'Vestido',
    'socks.type': 'Meia'
  };

  const isActive = (category, value) => {
    if (category.includes('.')) {
      const [main, sub] = category.split('.');
      return character[main][sub] === value;
    }
    return character[category] === value;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personalizar</Text>
      <View style={styles.optionsContainer}>
        {Object.entries(options).map(([category, values]) => (
          <View key={category} style={styles.optionGroup}>
            <Text style={styles.label}>{labels[category]}:</Text>
            <View style={styles.buttonsContainer}>
              {values.map(value => (
                <TouchableOpacity
                  key={value}
                  onPress={() => onUpdate(category, value)}
                  style={[
                    styles.optionButton,
                    isActive(category, value) && styles.optionButtonActive
                  ]}
                >
                  <Text style={[
                    styles.optionButtonText,
                    isActive(category, value) && styles.optionButtonTextActive
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 15,
  },
  optionGroup: {
    gap: 5,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  optionButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionButtonText: {
    color: 'black',
    fontSize: 12,
  },
  optionButtonTextActive: {
    color: 'white',
  },
});
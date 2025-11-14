// TCC-CODE/app/features/character-customization/components/CustomizationPanel.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export const CustomizationPanel = ({ character, onUpdate, selectedCategory, categoryData }) => {
  const handleOptionSelect = (value) => {
    if (onUpdate && selectedCategory) {
      onUpdate(selectedCategory, value);
    }
  };

  const isActive = (value) => {
    return character && selectedCategory ? character[selectedCategory] === value : false;
  };

  const extractColorFromValue = (value) => {
    const colorMatch = value.match(/([a-f0-9]{6})/i);
    if (colorMatch) return `#${colorMatch[1]}`;
    
    switch (selectedCategory) {
      case 'skin':
        switch (value) {
          case '1': return '#e6c3b1';
          case '2': return '#cea086';  
          case '3': return '#896347';
          default: return '#6c757d';
        }
      case 'shirt':
        if (value.includes('purple')) return '#8330ba';
        if (value.includes('red')) return '#dc3545';
        return '#6c757d';
      case 'socks':
        if (colorMatch) return `#${colorMatch[1]}`;
        if (value.includes('neko')) return '#ff69b4';
        return '#6c757d';
      default:
        if (colorMatch) return `#${colorMatch[1]}`;
        return '#6c757d';
    }
  };

  if (!selectedCategory || !categoryData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Selecione uma categoria</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {categoryData.icon} {categoryData.label}
        </Text>
        <View style={[styles.colorIndicator, { backgroundColor: categoryData.color }]} />
      </View>

      <ScrollView 
        style={styles.optionsScroll}
        contentContainerStyle={styles.optionsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.colorsGrid}>
          {categoryData.options.map((value, index) => {
            const color = extractColorFromValue(value);
            const active = isActive(value);
            
            return (
              <TouchableOpacity
                key={`${value}-${index}`}
                onPress={() => handleOptionSelect(value)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  active && styles.colorCircleActive
                ]}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#4e6d8bff',
    borderRadius: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingBottom: 10,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  colorCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorCircleActive: {
    borderWidth: 4,
    borderColor: 'white',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CustomizationPanel;
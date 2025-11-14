// TCC-CODE/app/features/character-customization/hooks/useCharacterCustomization.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHARACTER_STORAGE_KEY = 'character_customization';

export const useCharacterCustomization = () => {
  const [character, setCharacter] = useState({
    skin: '1',
    shirt: 'purple-default',
    dress: '123d0f',
    eyes: '22573d',
    hair: '573e25',
    socks: 'top-121212'
  });

  // Carregar character salvo ao iniciar
  useEffect(() => {
    loadCharacter();
  }, []);

  // Salvar character sempre que mudar
  useEffect(() => {
    saveCharacter();
  }, [character]);

  const loadCharacter = async () => {
    try {
      const savedCharacter = await AsyncStorage.getItem(CHARACTER_STORAGE_KEY);
      if (savedCharacter) {
        setCharacter(JSON.parse(savedCharacter));
      }
    } catch (error) {
      console.log('❌ Erro ao carregar personagem:', error);
    }
  };

  const saveCharacter = async () => {
    try {
      await AsyncStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(character));
    } catch (error) {
      console.log('❌ Erro ao salvar personagem:', error);
    }
  };

  const updateCharacter = (category, value) => {
    setCharacter(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const resetCharacter = () => {
    const defaultCharacter = {
      skin: '1',
      shirt: 'purple-default',
      dress: '123d0f',
      eyes: '22573d',
      hair: '573e25',
      socks: 'top-121212'
    };
    setCharacter(defaultCharacter);
  };

  return {
    character,
    updateCharacter,
    resetCharacter
  };
};
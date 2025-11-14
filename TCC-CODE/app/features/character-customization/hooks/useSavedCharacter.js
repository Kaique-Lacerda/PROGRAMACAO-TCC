// TCC-CODE/app/features/character-customization/hooks/useSavedCharacter.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHARACTER_STORAGE_KEY = 'character_customization';

export const useSavedCharacter = () => {
  const [savedCharacter, setSavedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedCharacter();
  }, []);

  const loadSavedCharacter = async () => {
    try {
      const savedCharacter = await AsyncStorage.getItem(CHARACTER_STORAGE_KEY);
      if (savedCharacter) {
        setSavedCharacter(JSON.parse(savedCharacter));
      } else {
        // Character padrão se não tiver salvo
        setSavedCharacter({
          skin: '1',
          shirt: 'purple-default',
          dress: '123d0f',
          eyes: '22573d',
          hair: '573e25',
          socks: 'top-121212'
        });
      }
    } catch (error) {
      console.log('❌ Erro ao carregar personagem salvo:', error);
      setSavedCharacter({
        skin: '1',
        shirt: 'purple-default',
        dress: '123d0f',
        eyes: '22573d',
        hair: '573e25',
        socks: 'top-121212'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    savedCharacter,
    loading
  };
};
// TCC-CODE/app/features/character-customization/hooks/useCharacterCustomization.js
import { useState } from 'react';

const defaultCharacter = {
  hair: { type: 'default' }, // Só tipo agora
  eyes: 'default',
  shirt: 'default',
  dress: 'default',
  socks: { type: 'thigh-high' } // Só tipo agora
};

export const useCharacterCustomization = () => {
  const [character, setCharacter] = useState(defaultCharacter);

  const updateCharacter = (category, value) => {
    setCharacter(prev => {
      if (category.includes('.')) {
        const [main, sub] = category.split('.');
        return {
          ...prev,
          [main]: {
            ...prev[main],
            [sub]: value
          }
        };
      }
      return {
        ...prev,
        [category]: value
      };
    });
  };

  const resetCharacter = () => {
    setCharacter(defaultCharacter);
  };

  return {
    character,
    updateCharacter,
    resetCharacter
  };
};
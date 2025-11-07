import { BACKEND_URL } from '../constants/config';

export const musicService = {
  // Buscar todas as músicas
  async getMusics() {
    try {
      const response = await fetch(`${BACKEND_URL}/musicas`);
      if (!response.ok) {
        throw new Error('Erro ao carregar músicas');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no musicService.getMusics:', error);
      throw error;
    }
  },

  // Alternar favorito
  async toggleFavorite(musicId) {
    try {
      const response = await fetch(`${BACKEND_URL}/musicas/${musicId}/favorito`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar favorito');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro no musicService.toggleFavorite:', error);
      throw error;
    }
  }
};
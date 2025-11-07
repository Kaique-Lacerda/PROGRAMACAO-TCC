const Music = require('../models/Music');

// Buscar todas as músicas
exports.getMusics = async (req, res) => {
  try {
    const musics = await Music.find();
    res.json(musics);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar músicas' });
  }
};

// Buscar música por ID
exports.getMusicById = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ error: 'Música não encontrada' });
    }
    res.json(music);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar música' });
  }
};

// Alternar favorito
exports.toggleFavorite = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ error: 'Música não encontrada' });
    }
    
    music.isFavorite = !music.isFavorite;
    await music.save();
    
    res.json({ 
      message: 'Favorito atualizado', 
      isFavorite: music.isFavorite 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar favorito' });
  }
};

// Adicionar música (para teste)
exports.addMusic = async (req, res) => {
  try {
    const music = await Music.create(req.body);
    res.status(201).json(music);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar música' });
  }
};
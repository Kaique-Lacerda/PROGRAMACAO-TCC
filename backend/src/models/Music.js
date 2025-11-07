const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Artista é obrigatório'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'Caminho do arquivo é obrigatório']
  },
  duration: {
    type: Number, // em segundos
    required: true
  },
  category: {
    type: String,
    enum: ['foco', 'relaxamento', 'energia'],
    default: 'foco'
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Music', musicSchema);
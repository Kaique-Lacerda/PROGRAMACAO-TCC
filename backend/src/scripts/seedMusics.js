const mongoose = require('mongoose');
const Music = require('../models/Music');
require('dotenv').config();

const sampleMusics = [
  {
    title: "All Night Long",
    artist: "Artista 1",
    filePath: "All_Night_Long.mp3",
    duration: 180,
    category: "foco"
  },
  {
    title: "K.O.",
    artist: "Artista 3", 
    filePath: "K.O.mp3",
    duration: 190,
    category: "energia"
  },
  {
    title: "Shut Up and Listen",
    artist: "Artista 4",
    filePath: "Shut_Up_and_Listen.mp3", 
    duration: 170,
    category: "foco"
  },
  {
    title: "Sol Loiro",
    artist: "Artista 5",
    filePath: "Sol_Loiro.mp3",
    duration: 210,
    category: "relaxamento"
  },
  {
    title: "Bathroom Sounds", 
    artist: "Natureza",
    filePath: "bathroom.mp3",
    duration: 300,
    category: "relaxamento"
  },
  {
    title: "Flamingos",
    artist: "Natureza",
    filePath: "flamingos.mp3",
    duration: 280, 
    category: "relaxamento"
  }
];

async function seedMusics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🎵 Conectado ao MongoDB');
    
    // Limpa músicas existentes
    await Music.deleteMany({});
    console.log('🗑️ Músicas antigas removidas');
    
    // Adiciona novas músicas
    await Music.insertMany(sampleMusics);
    console.log('✅ Músicas de teste adicionadas:', sampleMusics.length);
    
    // Mostra as músicas adicionadas
    const musics = await Music.find();
    console.log('📋 Músicas no banco:');
    musics.forEach(music => {
      console.log(`   - ${music.title} by ${music.artist}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Erro:', error);
    process.exit(1);
  }
}

seedMusics();
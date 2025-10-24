import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const db = new sqlite3.Database('./db.sqlite');
const SECRET = 'tcc_secret_key';

app.use(cors({
  origin: 'https://cycle-ocean-dig-bobby.trycloudflare.com',
  credentials: true
}));

app.use(express.json());

// Criação das tabelas ATUALIZADA
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS musicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nome TEXT,
    caminho TEXT,
    favorita BOOLEAN DEFAULT 0,
    pre_definida BOOLEAN DEFAULT 0,
    artista TEXT DEFAULT 'Desconhecido',
    duracao TEXT DEFAULT '0:00',
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
};
createTables();

// 🎵 SISTEMA INTELIGENTE DE MÚSICAS PRÉ-DEFINIDAS
const atualizarMusicasPreDefinidas = () => {
  const musicasPreDefinidas = [
    { 
      nome: 'Bathroom', 
      artista: 'Montell Fish', 
      duracao: '2:30', 
      pre_definida: 1,
      caminho: 'local_bathroom' // ✅ IDENTIFICADOR PARA ÁUDIO LOCAL
    }
  ];

  console.log('🔄 Atualizando músicas pré-definidas...');

  musicasPreDefinidas.forEach(musica => {
    // Verifica se a música já existe
    db.get(
      'SELECT id FROM musicas WHERE nome = ? AND pre_definida = 1',
      [musica.nome],
      (err, row) => {
        if (err) {
          console.log('❌ Erro ao verificar música', musica.nome, ':', err);
          return;
        }
        
        if (!row) {
          // Música não existe, adiciona para TODOS os usuários (user_id = NULL)
          db.run(
            'INSERT INTO musicas (user_id, nome, caminho, artista, duracao, pre_definida) VALUES (NULL, ?, ?, ?, ?, ?)',
            [musica.nome, musica.caminho, musica.artista, musica.duracao, musica.pre_definida],
            function(err) {
              if (err) {
                console.log('❌ Erro ao adicionar música', musica.nome, ':', err);
              } else {
                console.log('✅ Música adicionada:', musica.nome, '- Tipo:', musica.caminho);
              }
            }
          );
        } else {
          console.log('⚠️ Música já existe:', musica.nome);
        }
      }
    );
  });
};

// Executa a atualização quando o servidor inicia
setTimeout(atualizarMusicasPreDefinidas, 1000);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Cadastro de usuário
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 8);
  
  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    function (err) {
      if (err) return res.status(400).json({ error: 'Usuário já existe.' });
      
      res.json({ id: this.lastID, username });
    }
  );
});

// Login de usuário
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1d' });
    res.json({ token });
  });
});

// Middleware de autenticação
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
}

// Buscar todas as músicas do usuário (organizadas)
app.get('/musicas', auth, (req, res) => {
  console.log('🎵 Buscando músicas para usuário:', req.user.id);
  
  // Busca músicas pré-definidas (user_id NULL) + do usuário
  const query = `
    SELECT * FROM musicas 
    WHERE user_id IS NULL OR user_id = ?
    ORDER BY pre_definida DESC, favorita DESC, nome ASC
  `;
  
  db.all(query, [req.user.id], (err, rows) => {
    if (err) {
      console.error('❌ Erro ao buscar músicas:', err);
      return res.status(500).json({ error: 'Erro ao buscar músicas.' });
    }
    
    console.log('✅ Músicas encontradas:', rows.length);
    
    // Organizar em categorias
    const musicasOrganizadas = {
      preDefinidas: rows.filter(m => m.pre_definida === 1),
      userMusicas: rows.filter(m => m.pre_definida === 0),
      favoritas: rows.filter(m => m.favorita === 1)
    };
    
    res.json(musicasOrganizadas);
  });
});

// Salvar música do usuário logado
app.post('/musicas', auth, (req, res) => {
  const { nome, caminho, artista = 'Desconhecido', duracao = '0:00' } = req.body;
  db.run(
    'INSERT INTO musicas (user_id, nome, caminho, artista, duracao, pre_definida) VALUES (?, ?, ?, ?, ?, 0)',
    [req.user.id, nome, caminho, artista, duracao],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar música.' });
      res.json({ 
        id: this.lastID, 
        nome, 
        caminho, 
        artista, 
        duracao,
        pre_definida: 0,
        favorita: 0
      });
    }
  );
});

// Toggle favorito
app.put('/musicas/:id/favorito', auth, (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE musicas SET favorita = NOT favorita WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao favoritar.' });
      res.json({ success: true });
    }
  );
});

// Deletar música do usuário (apenas as que ele adicionou)
app.delete('/musicas/:id', auth, (req, res) => {
  const { id } = req.params;
  db.run(
    'DELETE FROM musicas WHERE id = ? AND user_id = ? AND pre_definida = 0',
    [id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao deletar música.' });
      res.json({ success: true });
    }
  );
});

// Endpoint para listar todos os usuários cadastrados
app.get('/users', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    res.json(rows);
  });
});

// Rota para forçar atualização de músicas pré-definidas
app.post('/atualizar-musicas', (req, res) => {
  atualizarMusicasPreDefinidas();
  res.json({ message: 'Atualização de músicas iniciada' });
});

// Iniciar servidor
app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 API rodando na porta 3001');
  console.log('🎵 Sistema inteligente de músicas: ✅ Ativo');
});
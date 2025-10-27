import express from 'express'; //funcionar API
import cors from 'cors'; //Permitir requisições de outras origens
import sqlite3 from 'sqlite3'; //Banco de dados 
import bcrypt from 'bcryptjs'; //criptografia de senhas
import jwt from 'jsonwebtoken'; //token para autenticação

const app = express(); 
const db = new sqlite3.Database('./db.sqlite');
const SECRET = 'tcc_secret_key';

// 🎯 Sistema de Logging Organizado
const log = (emoji, category, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${emoji} [${timestamp}] ${category}: ${message}`);
  if (data) console.log('   📦 Dados:', data);
};

// 🔧 Configurações do Servidor
app.use(cors({
  origin: 'https://games-deliver-cow-hospitals.trycloudflare.com', // alterar sempre que iniciar novo sv
  credentials: true
}));

app.use(express.json()); // Permitir receber JSON no corpo das requisições

// 🗄️ Criação das Tabelas
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);//cria tabela de usuários caso não exista
  
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
  )`);//cria tabela de músicas caso não exista
  
  log('💾', 'DATABASE', 'Tabelas criadas/verificadas com sucesso');
};
createTables();

// 🎵 Sistema de Músicas Pré-definidas
const atualizarMusicasPreDefinidas = () => {
  const musicasPreDefinidas = [
    { 
      nome: 'Bathroom', 
      artista: 'Montell Fish', 
      duracao: '3:28', 
      pre_definida: 1,
      caminho: 'local_bathroom'
    },
    { 
      nome: 'Eu Vou Te Comer Sorrindo', 
      artista: 'MC GUTO VGS', 
      duracao: '2:17', 
      pre_definida: 1,
      caminho: 'local_eu_vou_te_comer_sorrindo'
    },
    { 
      nome: 'K.O', 
      artista: 'Pabllo Vittar', 
      duracao: '2:35', 
      pre_definida: 1,
      caminho: 'local_k_o'
    },
    { 
      nome: 'Rainbow', 
      artista: 'All Night Long', 
      duracao: '4:12', 
      pre_definida: 1,
      caminho: 'local_rainbow_all_night_long'
    },
    { 
      nome: 'Shut Up and Listen', 
      artista: 'Nicholas Bonnin', 
      duracao: '3:15', 
      pre_definida: 1,
      caminho: 'local_shut_up_and_listen'
    },
    { 
      nome: 'Sol Loiro', 
      artista: 'Armandinho', 
      duracao: '2:45', 
      pre_definida: 1,
      caminho: 'local_sol_loiro'
    },
    { 
      nome: 'Flamingos', 
      artista: 'Baco Exu do Blues', 
      duracao: '3:50', 
      pre_definida: 1,
      caminho: 'local_flamingos'
    }
  ];

  log('🔄', 'MÚSICAS', `Processando ${musicasPreDefinidas.length} música(s) pré-definida(s)`);

  musicasPreDefinidas.forEach(musica => {
    db.get(
      'SELECT id FROM musicas WHERE nome = ? AND pre_definida = 1',
      [musica.nome],
      (err, row) => {
        if (err) {
          log('❌', 'MÚSICAS', `Erro ao verificar música: ${musica.nome}`, err);
          return;
        }
        
        if (!row) {
          db.run(
            'INSERT INTO musicas (user_id, nome, caminho, artista, duracao, pre_definida) VALUES (NULL, ?, ?, ?, ?, ?)',
            [musica.nome, musica.caminho, musica.artista, musica.duracao, musica.pre_definida],
            function(err) {
              if (err) {
                log('❌', 'MÚSICAS', `Erro ao adicionar: ${musica.nome}`, err);
              } else {
                log('✅', 'MÚSICAS', `Adicionada: ${musica.nome} (ID: ${this.lastID})`);
              }
            }
          );
        } else {
          log('⚠️', 'MÚSICAS', `Já existe: ${musica.nome} (ID: ${row.id})`);
        }
      }
    );
  });
};

// ⏰ Inicialização das Músicas
setTimeout(atualizarMusicasPreDefinidas, 1000);

// 🌐 Rotas da API

// Rota de Health Check
app.get('/', (req, res) => {
  log('🌐', 'API', 'Health check recebido');
  res.json({ 
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Cadastro de Usuário
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 8);
  
  log('👤', 'AUTH', `Tentativa de registro: ${username}`);
  
  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    function (err) {
      if (err) {
        log('❌', 'AUTH', `Usuário já existe: ${username}`);
        return res.status(400).json({ error: 'Usuário já existe.' });
      }
      
      log('✅', 'AUTH', `Usuário registrado: ${username} (ID: ${this.lastID})`);
      res.json({ id: this.lastID, username });
    }
  );
});

// Login de Usuário
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  log('🔐', 'AUTH', `Tentativa de login: ${username}`);
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) {
      log('❌', 'AUTH', `Usuário não encontrado: ${username}`);
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }
    
    if (!bcrypt.compareSync(password, user.password)) {
      log('❌', 'AUTH', `Senha incorreta para: ${username}`);
      return res.status(401).json({ error: 'Senha incorreta.' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1d' });
    log('✅', 'AUTH', `Login bem-sucedido: ${username}`);
    res.json({ token });
  });
});

// 🔒 Middleware de Autenticação
function auth(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    log('❌', 'AUTH', 'Token não fornecido');
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  
  try {
    req.user = jwt.verify(token, SECRET);
    log('🔐', 'AUTH', `Token válido para: ${req.user.username}`);
    next();
  } catch (error) {
    log('❌', 'AUTH', 'Token inválido', error);
    res.status(401).json({ error: 'Token inválido.' });
  }
}

// 🎵 Rotas de Música

// Buscar todas as músicas do usuário
app.get('/musicas', auth, (req, res) => {
  log('🎵', 'MÚSICAS', `Buscando músicas para: ${req.user.username}`);
  
  const query = `
    SELECT * FROM musicas 
    WHERE user_id IS NULL OR user_id = ?
    ORDER BY pre_definida DESC, favorita DESC, nome ASC
  `;
  
  db.all(query, [req.user.id], (err, rows) => {
    if (err) {
      log('❌', 'MÚSICAS', 'Erro ao buscar músicas', err);
      return res.status(500).json({ error: 'Erro ao buscar músicas.' });
    }
    
    const musicasOrganizadas = {
      preDefinidas: rows.filter(m => m.pre_definida === 1),
      userMusicas: rows.filter(m => m.pre_definida === 0),
      favoritas: rows.filter(m => m.favorita === 1)
    };
    
    log('✅', 'MÚSICAS', 
      `Encontradas: ${musicasOrganizadas.preDefinidas.length} pré-definidas, ` +
      `${musicasOrganizadas.userMusicas.length} do usuário, ` +
      `${musicasOrganizadas.favoritas.length} favoritas`
    );
    
    res.json(musicasOrganizadas);
  });
});

// Adicionar música do usuário
app.post('/musicas', auth, (req, res) => {
  const { nome, caminho, artista = 'Desconhecido', duracao = '0:00' } = req.body;
  
  log('🎵', 'MÚSICAS', `Adicionando música: ${nome}`, { artista, duracao });
  
  db.run(
    'INSERT INTO musicas (user_id, nome, caminho, artista, duracao, pre_definida) VALUES (?, ?, ?, ?, ?, 0)',
    [req.user.id, nome, caminho, artista, duracao],
    function (err) {
      if (err) {
        log('❌', 'MÚSICAS', `Erro ao salvar: ${nome}`, err);
        return res.status(500).json({ error: 'Erro ao salvar música.' });
      }
      
      log('✅', 'MÚSICAS', `Música salva: ${nome} (ID: ${this.lastID})`);
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
  
  log('⭐', 'MÚSICAS', `Alternando favorito para música ID: ${id}`);
  
  db.run(
    'UPDATE musicas SET favorita = NOT favorita WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function (err) {
      if (err) {
        log('❌', 'MÚSICAS', `Erro ao favoritar ID: ${id}`, err);
        return res.status(500).json({ error: 'Erro ao favoritar.' });
      }
      
      log('✅', 'MÚSICAS', `Favorito alternado para música ID: ${id}`);
      res.json({ success: true });
    }
  );
});

// Deletar música do usuário
app.delete('/musicas/:id', auth, (req, res) => {
  const { id } = req.params;
  
  log('🗑️', 'MÚSICAS', `Deletando música ID: ${id}`);
  
  db.run(
    'DELETE FROM musicas WHERE id = ? AND user_id = ? AND pre_definida = 0',
    [id, req.user.id],
    function (err) {
      if (err) {
        log('❌', 'MÚSICAS', `Erro ao deletar ID: ${id}`, err);
        return res.status(500).json({ error: 'Erro ao deletar música.' });
      }
      
      if (this.changes === 0) {
        log('⚠️', 'MÚSICAS', `Música não encontrada ou é pré-definida ID: ${id}`);
        return res.status(404).json({ error: 'Música não encontrada.' });
      }
      
      log('✅', 'MÚSICAS', `Música deletada ID: ${id}`);
      res.json({ success: true });
    }
  );
});

// 👥 Listar usuários (apenas para desenvolvimento)
app.get('/users', (req, res) => {
  log('👥', 'USERS', 'Listando todos os usuários');
  
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) {
      log('❌', 'USERS', 'Erro ao buscar usuários', err);
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
    
    log('✅', 'USERS', `Encontrados ${rows.length} usuário(s)`);
    res.json(rows);
  });
});

// 🔄 Forçar atualização de músicas pré-definidas
app.post('/atualizar-musicas', (req, res) => {
  log('🔄', 'MÚSICAS', 'Forçando atualização de músicas pré-definidas');
  atualizarMusicasPreDefinidas();
  res.json({ message: 'Atualização de músicas iniciada' });
});

// 🚀 Inicialização do Servidor
app.listen(3001, '0.0.0.0', () => {
  log('🚀', 'SERVER', 'API rodando na porta 3001');
  log('🎵', 'SERVER', 'Sistema de músicas inteligente ativo');
  log('🔧', 'SERVER', 'Pronto para receber requisições');
});
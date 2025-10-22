import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const db = new sqlite3.Database('./db.sqlite');
const SECRET = 'tcc_secret_key';

// CORS configurado para o Codespace
app.use(cors({
  origin: [
    'https://shiny-palm-tree-q777475466ww2v5g.github.dev',
    'https://*.github.dev',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'exp://*'
  ],
  credentials: true
}));

app.use(express.json());

// Criação das tabelas
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
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
};
createTables();

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

// Salvar música do usuário logado
app.post('/musicas', auth, (req, res) => {
  const { nome, caminho } = req.body;
  db.run(
    'INSERT INTO musicas (user_id, nome, caminho) VALUES (?, ?, ?)',
    [req.user.id, nome, caminho],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar música.' });
      res.json({ id: this.lastID, nome, caminho });
    }
  );
});

// Listar músicas do usuário logado
app.get('/musicas', auth, (req, res) => {
  db.all('SELECT * FROM musicas WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar músicas.' });
    res.json(rows);
  });
});

// Endpoint para listar todos os usuários cadastrados
app.get('/users', (req, res) => {
  db.all('SELECT id, username FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    res.json(rows);
  });
});

// Iniciar servidor
app.listen(3001, '0.0.0.0', () => {
  console.log('🚀 API rodando na porta 3001');
  console.log('📍 URL do Codespace: https://shiny-palm-tree-q777475466ww2v5g.github.dev');
  console.log('📝 Teste: https://shiny-palm-tree-q777475466ww2v5g.github.dev/users');
  console.log('📝 Teste: https://shiny-palm-tree-q777475466ww2v5g.github.dev/');
});
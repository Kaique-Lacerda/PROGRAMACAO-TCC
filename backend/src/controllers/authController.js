const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Cadastro de usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    // Cria usuário
    const user = await User.create({ name, email, password });

    // Gera token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Encontra usuário e inclui a senha
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Email ou senha inválidos.' });
    }

    // Verifica senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email ou senha inválidos.' });
    }

    // Gera token
    const token = generateToken(user._id);

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
};

// Verificar usuário atual
exports.getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profileImage: req.user.profileImage,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
};

// Atualizar foto de perfil
exports.updateProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ 
      message: 'Foto de perfil atualizada com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar foto de perfil' });
  }
};
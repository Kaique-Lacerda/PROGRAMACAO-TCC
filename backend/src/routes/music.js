const express = require('express');
const { 
  getMusics, 
  getMusicById, 
  toggleFavorite, 
  addMusic 
} = require('../controllers/musicController');

const router = express.Router();

router.get('/', getMusics);
router.get('/:id', getMusicById);
router.post('/:id/favorito', toggleFavorite);
router.post('/', addMusic); // Apenas para desenvolvimento

module.exports = router;
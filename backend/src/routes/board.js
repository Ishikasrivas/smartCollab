const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create board
router.post('/', boardController.createBoard);
// Get all boards for user
router.get('/', boardController.getBoards);
// Get single board
router.get('/:id', boardController.getBoardById);
// Update board
router.put('/:id', boardController.updateBoard);
// Delete board
router.delete('/:id', boardController.deleteBoard);

module.exports = router; 
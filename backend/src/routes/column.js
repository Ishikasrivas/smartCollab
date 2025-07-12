const express = require('express');
const router = express.Router();
const columnController = require('../controllers/columnController');
const auth = require('../middleware/auth');

router.use(auth);

// Create column for a board
router.post('/:boardId/columns', columnController.createColumn);
// Update column
router.put('/columns/:id', columnController.updateColumn);
// Delete column
router.delete('/columns/:id', columnController.deleteColumn);

module.exports = router; 
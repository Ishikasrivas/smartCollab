const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use(auth);

// Create task for a column
router.post('/:columnId/tasks', taskController.createTask);
// Update task
router.put('/tasks/:id', taskController.updateTask);
// Delete task
router.delete('/tasks/:id', taskController.deleteTask);
// Move task
router.post('/tasks/:id/move', taskController.moveTask);

module.exports = router; 
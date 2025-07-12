const Task = require('../models/Task');
const Column = require('../models/Column');
const Board = require('../models/Board');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, assignee, order } = req.body;
    const { columnId } = req.params;
    const column = await Column.findById(columnId);
    if (!column) return res.status(404).json({ message: 'Column not found' });
    const board = await Board.findById(column.board);
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const task = await Task.create({
      title,
      description,
      status,
      assignee,
      column: columnId,
      board: column.board,
      order,
    });
    column.tasks.push(task._id);
    await column.save();
    res.status(201).json(task);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('taskCreated', task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const board = await Board.findById(task.board);
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.assignee = req.body.assignee || task.assignee;
    task.order = req.body.order ?? task.order;
    await task.save();
    res.json(task);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('taskUpdated', task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const column = await Column.findById(task.column);
    const board = await Board.findById(task.board);
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Remove task from column's tasks array
    column.tasks = column.tasks.filter(tid => tid.toString() !== id);
    await column.save();
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('taskDeleted', { taskId: task._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Move a task to another column
exports.moveTask = async (req, res) => {
  try {
    const { id } = req.params; // task id
    const { toColumnId, newOrder } = req.body;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const fromColumn = await Column.findById(task.column);
    const toColumn = await Column.findById(toColumnId);
    const board = await Board.findById(task.board);
    if (!toColumn || !fromColumn) return res.status(404).json({ message: 'Column not found' });
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Remove from old column
    fromColumn.tasks = fromColumn.tasks.filter(tid => tid.toString() !== id);
    await fromColumn.save();
    // Add to new column
    toColumn.tasks.push(task._id);
    await toColumn.save();
    // Update task
    task.column = toColumnId;
    task.order = newOrder ?? task.order;
    await task.save();
    res.json(task);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('taskMoved', task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
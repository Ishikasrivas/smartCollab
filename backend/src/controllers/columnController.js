const Column = require('../models/Column');
const Board = require('../models/Board');

// Create a new column
exports.createColumn = async (req, res) => {
  try {
    const { title, order } = req.body;
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const column = await Column.create({ title, order, board: boardId, tasks: [] });
    board.columns.push(column._id);
    await board.save();
    res.status(201).json(column);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('columnCreated', column);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a column
exports.updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ message: 'Column not found' });
    const board = await Board.findById(column.board);
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    column.title = req.body.title || column.title;
    column.order = req.body.order ?? column.order;
    await column.save();
    res.json(column);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('columnUpdated', column);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a column
exports.deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ message: 'Column not found' });
    const board = await Board.findById(column.board);
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Remove column from board's columns array
    board.columns = board.columns.filter(colId => colId.toString() !== id);
    await board.save();
    await column.deleteOne();
    res.json({ message: 'Column deleted' });
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('columnDeleted', { columnId: column._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
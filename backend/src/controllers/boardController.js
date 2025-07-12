const Board = require('../models/Board');
const Column = require('../models/Column');

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.create({
      title,
      owner: req.user.id,
      members: [req.user.id],
      columns: [],
    });
    res.status(201).json(board);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('boardCreated', board);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all boards for the user (owner or member)
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    }).populate('columns').exec();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single board by ID (if user is member or owner)
exports.getBoardById = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('columns').exec();
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a board (only owner)
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can update the board' });
    }
    board.title = req.body.title || board.title;
    await board.save();
    res.json(board);
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('boardUpdated', board);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a board (only owner)
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can delete the board' });
    }
    await board.deleteOne();
    res.json({ message: 'Board deleted' });
    // Emit event
    req.app.get('io').to(board._id.toString()).emit('boardDeleted', { boardId: board._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
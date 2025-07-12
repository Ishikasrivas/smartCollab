function setupSocket(io) {
  io.on('connection', (socket) => {
    // Join a board room
    socket.on('joinBoard', (boardId) => {
      socket.join(boardId);
    });

    // Leave a board room
    socket.on('leaveBoard', (boardId) => {
      socket.leave(boardId);
    });

    // Join a user room for notifications
    socket.on('joinUserRoom', (userId) => {
      socket.join(userId);
    });

    // Optionally handle disconnects
    socket.on('disconnect', () => {
      // Cleanup if needed
    });
  });
}

// To send a notification from a controller:
// const io = req.app.get('io');
// io.to(userId).emit('notification', { message: '...', type: '...', data: { ... } });

module.exports = setupSocket; 
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
require('dotenv').config();
const setupSocket = require('./sockets');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-collab';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://smart-collab-snowy.vercel.app',
      'http://localhost:5174'
    ],
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);
app.set('io', io);

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 
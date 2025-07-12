import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000');
socket.on('connect', () => {
  console.log('Socket connected!', socket.id);
});
// (Optional) For debugging in the browser console:
declare global {
  interface Window {
    socket: ReturnType<typeof io>;
  }
}
window.socket = socket;
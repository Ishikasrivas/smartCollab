import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL;
export const socket = io(apiUrl);
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
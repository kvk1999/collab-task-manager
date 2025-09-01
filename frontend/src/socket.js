// src/socket.js
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "https://collab-task-manager.onrender.com";

let socket = null;

export function connectSocket(token) {
  if (socket) return socket;
  socket = io(API_URL, {
    auth: { token },        // server may use token for auth
    transports: ["websocket"]
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

import { io } from 'socket.io-client'

const URL = process.env.NEXT_PUBLIC_SOCKET_URL?.trim() || 'http://localhost:4000'

// Create a singleton Socket.IO client (lazy connect)
export const socket = io(URL, { autoConnect: false, transports: ['websocket'] })

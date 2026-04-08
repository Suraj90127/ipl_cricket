import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.js';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const s = io('/', {
      auth: { token },
      transports: ['websocket']
    });
    setSocket(s);
    return () => s.disconnect();
  }, [token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Fallback to production URL if env variable is not set or points to localhost
        let socketUrl = import.meta.env.VITE_SOCKET_URL;
        
        // If no env var or it points to localhost, use production URL
        if (!socketUrl || socketUrl.includes('localhost') || socketUrl.includes('127.0.0.1') || socketUrl.includes(':8003')) {
            socketUrl = 'https://editron.onrender.com';
        }
        
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket']
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
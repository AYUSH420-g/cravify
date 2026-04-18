import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (token && user && user.id) {
            // In development, the backend runs on port 5000 (proxy handled by vite or direct)
            // Since we are using relative paths for API, we can use the same for socket if proxy is set,
            // otherwise we specify the backend URL.
            const newSocket = io('/', {
                auth: { token }
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to socket server:', newSocket.id);
                // Always join personal notification room
                newSocket.emit('join_user_room', user.id);
                // Delivery partners join their shared room
                if (user.role === 'delivery_partner') {
                    newSocket.emit('join_delivery_room');
                }
            });

            // On reconnect, re-join rooms automatically
            newSocket.io.on('reconnect', () => {
                console.log('Socket reconnected, re-joining rooms...');
                newSocket.emit('join_user_room', user.id);
                if (user.role === 'delivery_partner') {
                    newSocket.emit('join_delivery_room');
                }
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

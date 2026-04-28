import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (token && user && user.id) {
            // Force websocket transport to avoid polling issues with rooms
            const newSocket = io('/', {
                auth: { token },
                transports: ['websocket', 'polling'],
                upgrade: true
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('✅ SOCKET CONNECTED:', newSocket.id);
                // Always join personal notification room
                newSocket.emit('join_user_room', user.id);
                // Delivery partners join their shared room
                if (user.role === 'delivery_partner') {
                    newSocket.emit('join_delivery_room');
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ SOCKET CONNECTION ERROR:', err.message);
            });

            // On reconnect, re-join rooms automatically
            newSocket.io.on('reconnect', () => {
                console.log('🔄 SOCKET RECONNECTED, re-joining rooms...');
                newSocket.emit('join_user_room', user.id);
                if (user.role === 'delivery_partner') {
                    newSocket.emit('join_delivery_room');
                }
            });

            return () => {
                newSocket.close();
                socketRef.current = null;
            };
        } else {
            // Clean up existing socket when user logs out
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
            }
        }
    }, [token, user?.id, user?.role]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

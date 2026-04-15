import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

/**
 * Manages socket lifecycle tied to auth state.
 * Call once at app root (e.g. Index page).
 */
export function useSocket() {
  const { user, token, isAuthenticated } = useAuth();
  const connected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && user && !connected.current) {
      connectSocket(token, user._id);
      connected.current = true;
    }

    return () => {
      if (!isAuthenticated && connected.current) {
        disconnectSocket();
        connected.current = false;
      }
    };
  }, [isAuthenticated, token, user]);

  return getSocket();
}

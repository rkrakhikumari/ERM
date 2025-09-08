import { useState, useEffect } from "react";

function useWebSocket(url, onMessage, options = {}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const { 
    reconnectDelay = 3000, 
    maxReconnectAttempts = 5,
    onOpen,
    onClose 
  } = options;
  
  let reconnectAttempts = 0;

  const connect = () => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'ping') {
            onMessage(data);
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();

        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection failed');
      };

      setSocket(ws);
    } catch (err) {
      setError('Failed to create WebSocket connection');
    }
  };

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  return { isConnected, error, socket };
}

export default useWebSocket;

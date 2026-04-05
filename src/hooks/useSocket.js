import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

/**
 * Custom hook for Socket.IO connection
 * @param {string} restaurantId - Restaurant ID to join specific room
 * @returns {Object} Socket instance and connection status
 */
export function useSocket(restaurantId = null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    // Initialize socket connection with correct path
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
    });

    const socketInstance = socketRef.current;
    setSocket(socketInstance);

    // Connection events
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
      setError(null);

      // Join restaurant room if provided
      if (restaurantId) {
        socketInstance.emit("join-restaurant", restaurantId);
      }
    });

    socketInstance.on("joined-restaurant", (data) => {
      console.log("✅ Joined restaurant room:", data.restaurantId);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);

      // Auto-reconnect for certain reasons
      if (reason === "io server disconnect") {
        socketInstance.connect();
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setError(null);

      if (restaurantId) {
        socketInstance.emit("join-restaurant", restaurantId);
      }
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log("🔄 Reconnection attempt:", attemptNumber);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed");
      setError("Failed to reconnect");
    });

    // Cleanup
    return () => {
      if (restaurantId && socketInstance.connected) {
        socketInstance.emit("leave-restaurant", restaurantId);
      }
      socketInstance.disconnect();
      socketInstance.removeAllListeners();
      socketRef.current = null;
      setSocket(null);
    };
  }, [restaurantId]);

  return {
    socket,
    isConnected,
    error,
  };
}

/**
 * Hook for listening to specific socket events
 */
export function useSocketEvent(socket, eventName, callback) {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, memoizedCallback);

    return () => {
      socket.off(eventName, memoizedCallback);
    };
  }, [socket, eventName, memoizedCallback]);
}

/**
 * Hook for order updates
 */
export function useOrderUpdates(restaurantId, onOrderUpdate) {
  const { socket, isConnected, error } = useSocket(restaurantId);
  const memoizedCallback = useCallback(onOrderUpdate, [onOrderUpdate]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("order-updated", memoizedCallback);
    socket.on("order-created", memoizedCallback);

    return () => {
      socket.off("order-updated", memoizedCallback);
      socket.off("order-created", memoizedCallback);
    };
  }, [socket, isConnected, memoizedCallback]);

  return { socket, isConnected, error };
}

/**
 * Hook for menu updates
 */
export function useMenuUpdates(restaurantId, onMenuUpdate) {
  const { socket, isConnected, error } = useSocket(restaurantId);
  const memoizedCallback = useCallback(onMenuUpdate, [onMenuUpdate]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("menu-updated", memoizedCallback);

    return () => {
      socket.off("menu-updated", memoizedCallback);
    };
  }, [socket, isConnected, memoizedCallback]);

  return { socket, isConnected, error };
}

/**
 * Hook for table updates
 */
export function useTableUpdates(restaurantId, onTableUpdate) {
  const { socket, isConnected, error } = useSocket(restaurantId);
  const memoizedCallback = useCallback(onTableUpdate, [onTableUpdate]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("table-updated", memoizedCallback);

    return () => {
      socket.off("table-updated", memoizedCallback);
    };
  }, [socket, isConnected, memoizedCallback]);

  return { socket, isConnected, error };
}

/**
 * Hook to emit socket events
 */
export function useSocketEmit(restaurantId) {
  const { socket, isConnected } = useSocket(restaurantId);

  const emit = useCallback(
    (event, data) => {
      if (!socket || !isConnected) {
        console.warn("Cannot emit: Socket not connected");
        return false;
      }

      socket.emit(event, data);
      return true;
    },
    [socket, isConnected],
  );

  const emitOrderUpdate = useCallback(
    (orderData) => {
      return emit("order-update", { ...orderData, restaurantId });
    },
    [emit, restaurantId],
  );

  const emitMenuUpdate = useCallback(
    (menuData) => {
      return emit("menu-update", { ...menuData, restaurantId });
    },
    [emit, restaurantId],
  );

  const emitTableUpdate = useCallback(
    (tableData) => {
      return emit("table-update", { ...tableData, restaurantId });
    },
    [emit, restaurantId],
  );

  const emitNewOrder = useCallback(
    (orderData) => {
      return emit("new-order", { ...orderData, restaurantId });
    },
    [emit, restaurantId],
  );

  return {
    socket,
    isConnected,
    emit,
    emitOrderUpdate,
    emitMenuUpdate,
    emitTableUpdate,
    emitNewOrder,
  };
}

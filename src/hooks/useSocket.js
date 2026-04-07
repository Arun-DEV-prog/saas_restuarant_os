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

    // Socket server is on the same host as frontend with custom path
    // In development: http://localhost:3000/api/socket
    // In production: https://yourdomain.com/api/socket
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const socketUrl = baseUrl; // Use same origin, let Socket.IO use /api/socket path

    console.log("🔌 Initializing Socket with base URL:", socketUrl);
    console.log("🔌 NODE_ENV:", process.env.NODE_ENV);

    socketRef.current = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
      forceNew: false,
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
      console.error("❌ Socket connection error:", err.message || err);
      setError(err.message || String(err));
      setIsConnected(false);
    });

    socketInstance.on("error", (err) => {
      console.error("❌ Socket error:", err);
      setError(err?.message || String(err));
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
  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
}

/**
 * Hook for order updates
 */
export function useOrderUpdates(restaurantId, onOrderUpdate) {
  const { socket, isConnected, error } = useSocket(restaurantId);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("order-updated", onOrderUpdate);
    socket.on("order-created", onOrderUpdate);

    return () => {
      socket.off("order-updated", onOrderUpdate);
      socket.off("order-created", onOrderUpdate);
    };
  }, [socket, isConnected, onOrderUpdate]);

  return { socket, isConnected, error };
}

/**
 * Hook for menu updates
 */
export function useMenuUpdates(restaurantId, onMenuUpdate) {
  const { socket, isConnected, error } = useSocket(restaurantId);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("menu-updated", onMenuUpdate);

    return () => {
      socket.off("menu-updated", onMenuUpdate);
    };
  }, [socket, isConnected, onMenuUpdate]);

  return { socket, isConnected, error };
}

/**
 * Hook for table updates
 */
export function useTableUpdates(restaurantId, onTableUpdate) {
  const { socket, isConnected, error } = useSocket(restaurantId);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("table-updated", onTableUpdate);

    return () => {
      socket.off("table-updated", onTableUpdate);
    };
  }, [socket, isConnected, onTableUpdate]);

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
